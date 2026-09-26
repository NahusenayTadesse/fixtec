// Online (Chapa) payments for orders.
//
// An order becomes "paid online" in exactly one place: `settleOnlinePayment()`.
// Both ways a payment can be confirmed — Chapa's webhook, and the customer
// landing back on /checkout/payment — call it, so that:
//
//   1. Chapa is asked server-to-server whether the payment succeeded, and the
//      answer is held to what we expected: our reference, ETB, and at least the
//      amount we asked for.
//   2. It is recorded exactly once. The two callers race on a conditional
//      UPDATE of `settled_txn_ref`; only the winner sends the confirmation email.

import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	bankAccounts,
	customers,
	orderItems,
	orders,
	paymentMethods,
	transactions
} from '$lib/server/db/schema';
import { initializeChapaTransaction, newTxRef, verifyChapaTransaction } from '$lib/server/chapa';
import {
	ADMIN_EMAIL,
	adminPaymentReceivedTemplate,
	customerPaymentReceivedTemplate,
	sendEmail
} from '$lib/server/email';

/** The name online payments are recorded under in `payment_methods`. */
export const CHAPA_METHOD_NAME = 'Chapa';

/** Money comparisons get a cent of slack for decimal round-tripping. */
const AMOUNT_TOLERANCE = 0.01;

/**
 * Chapa couldn't start the checkout (down, rate-limited, rejected the details).
 * The attempt is already recorded by then, so `paymentPage` is still a working
 * place to retry or pay by bank transfer instead.
 */
export class PaymentStartError extends Error {
	constructor(
		readonly paymentPage: string,
		cause: unknown
	) {
		super(cause instanceof Error ? cause.message : 'Could not start the payment', { cause });
	}
}

export class AlreadyPaidError extends Error {
	constructor() {
		super('This order has already been paid.');
	}
}

/** Row count from a drizzle/mysql2 write, which resolves to `[ResultSetHeader, …]`. */
function affectedRowsOf(result: unknown): number {
	const header = Array.isArray(result) ? result[0] : result;
	return (header as { affectedRows?: number } | undefined)?.affectedRows ?? 0;
}

/** The `payment_methods` row online payments are filed under, created on first use. */
async function chapaMethodId(): Promise<number> {
	const find = () =>
		db
			.select({ id: paymentMethods.id })
			.from(paymentMethods)
			.where(eq(paymentMethods.name, CHAPA_METHOD_NAME))
			.then((rows) => rows[0]?.id);

	const existing = await find();
	if (existing) return existing;

	// `name` is unique, so two first-ever payments racing here can't create two rows.
	await db
		.insert(paymentMethods)
		.values({ name: CHAPA_METHOD_NAME, description: 'Online payment via Chapa' })
		.onDuplicateKeyUpdate({ set: { name: CHAPA_METHOD_NAME } });
	return (await find())!;
}

/** What the order costs right now: its items plus its delivery fee, in whole cents. */
export async function orderTotal(orderId: number): Promise<number> {
	const [row] = await db
		.select({
			itemsCents: sql<string>`COALESCE(SUM(ROUND(${orderItems.price} * 100) * ${orderItems.quantity}), 0)`,
			fee: orders.fee
		})
		.from(orders)
		.leftJoin(orderItems, eq(orderItems.orderId, orders.id))
		.where(eq(orders.id, orderId))
		.groupBy(orders.id, orders.fee);

	if (!row) throw new Error(`Order #${orderId} not found`);
	return (Number(row.itemsCents) + Math.round(Number(row.fee ?? 0) * 100)) / 100;
}

/** Whether an order's payment is settled, and by which reference. */
export async function orderPaymentState(orderId: number) {
	return db
		.select({
			transactionId: transactions.id,
			paymentStatus: transactions.paymentStatus,
			txnRef: transactions.txnRef,
			settledTxnRef: transactions.settledTxnRef,
			recieptLink: transactions.recieptLink
		})
		.from(orders)
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.where(eq(orders.id, orderId))
		.then((rows) => rows[0]);
}

/**
 * Starts (or restarts) an online payment for an order and returns Chapa's
 * checkout URL. Each call is a new attempt with a new reference; the previous
 * reference stops being able to settle the order.
 */
export async function startOnlinePayment(orderId: number, origin: string): Promise<string> {
	const order = await db
		.select({
			id: orders.id,
			transactionId: orders.transactionId,
			name: customers.name,
			email: customers.email,
			phone: customers.phone
		})
		.from(orders)
		.innerJoin(customers, eq(orders.customerId, customers.id))
		.where(eq(orders.id, orderId))
		.then((rows) => rows[0]);

	if (!order) throw new Error(`Order #${orderId} not found`);
	if (!order.email) throw new Error('An email address is required to pay online');

	const state = await orderPaymentState(orderId);
	if (state?.settledTxnRef || state?.paymentStatus === 'paid') throw new AlreadyPaidError();

	const amount = await orderTotal(orderId);
	const txRef = newTxRef(orderId);
	const methodId = await chapaMethodId();

	// The attempt is recorded before the customer leaves for Chapa, so a webhook
	// that beats them back can already be matched to the order.
	if (order.transactionId) {
		await db
			.update(transactions)
			.set({ amount: amount.toFixed(2), txnRef: txRef, paymentMethodId: methodId, paymentStatus: 'pending' })
			.where(eq(transactions.id, order.transactionId));
	} else {
		await db.transaction(async (tx) => {
			const [created] = await tx
				.insert(transactions)
				.values({ amount: amount.toFixed(2), txnRef: txRef, paymentMethodId: methodId, paymentStatus: 'pending' })
				.$returningId();
			await tx.update(orders).set({ transactionId: created.id }).where(eq(orders.id, orderId));
		});
	}

	const paymentPage = `/checkout/payment?ref=${encodeURIComponent(txRef)}`;
	try {
		return await initializeChapaTransaction({
			amount,
			email: order.email,
			name: order.name,
			phone: order.phone,
			txRef,
			callbackUrl: `${origin}/api/chapa/callback`,
			returnUrl: `${origin}${paymentPage}`,
			title: 'Lalo Fixtec',
			description: `Payment for order ${orderId}`
		});
	} catch (err) {
		throw new PaymentStartError(paymentPage, err);
	}
}

export type SettlementOutcome =
	| { status: 'paid'; orderId: number; amount: number; alreadySettled: boolean }
	| { status: 'failed'; orderId: number; reason: string }
	// `retryable`: asking again later could change the answer (Chapa unreachable,
	// or the customer hasn't finished). The webhook answers those with a 5xx so
	// Chapa retries; anything else is acknowledged and logged.
	| { status: 'pending'; orderId: number | null; reason: string; retryable: boolean };

/**
 * Confirms a payment with Chapa and, if it genuinely went through, marks the
 * order paid. Safe to call repeatedly and concurrently for the same reference.
 */
export async function settleOnlinePayment(txRef: string): Promise<SettlementOutcome> {
	const transaction = await db
		.select({
			id: transactions.id,
			amount: transactions.amount,
			txnRef: transactions.txnRef,
			settledTxnRef: transactions.settledTxnRef,
			orderId: orders.id
		})
		.from(transactions)
		.innerJoin(orders, eq(orders.transactionId, transactions.id))
		.where(eq(transactions.txnRef, txRef))
		.then((rows) => rows[0]);

	if (!transaction) {
		// Either unknown, or an older attempt that a retry has since replaced.
		return { status: 'pending', orderId: null, reason: 'Unknown or expired payment reference.', retryable: false };
	}

	const { orderId } = transaction;

	if (transaction.settledTxnRef === txRef) {
		return { status: 'paid', orderId, amount: Number(transaction.amount), alreadySettled: true };
	}

	let verification;
	try {
		verification = await verifyChapaTransaction(txRef);
	} catch (err) {
		console.error(`Chapa verify failed for ${txRef}:`, err);
		return {
			status: 'pending',
			orderId,
			reason: 'We could not reach Chapa to confirm your payment. Please refresh in a moment.',
			retryable: true
		};
	}

	if (!verification.paid) {
		if (verification.failed) {
			return { status: 'failed', orderId, reason: 'Chapa reported this payment as failed.' };
		}
		return {
			status: 'pending',
			orderId,
			reason: 'Your payment has not been confirmed yet.',
			retryable: true
		};
	}

	const expected = Number(transaction.amount);
	if (verification.txRef && verification.txRef !== txRef) {
		console.error(`Chapa tx_ref mismatch: expected ${txRef}, got ${verification.txRef}`);
		return { status: 'pending', orderId, reason: 'Payment reference mismatch — please contact us.', retryable: false };
	}
	if (verification.currency && verification.currency !== 'ETB') {
		console.error(`Chapa currency mismatch on ${txRef}: ${verification.currency}`);
		return { status: 'pending', orderId, reason: 'Payment currency mismatch — please contact us.', retryable: false };
	}
	if (!Number.isFinite(verification.amount) || verification.amount + AMOUNT_TOLERANCE < expected) {
		console.error(`Chapa amount short on ${txRef}: expected ${expected}, got ${verification.amount}`);
		return {
			status: 'pending',
			orderId,
			reason: 'The amount paid does not match the order total — please contact us.',
			retryable: false
		};
	}

	// The claim: matches only while this attempt is unsettled, so of two
	// concurrent callers exactly one changes a row.
	const claim = await db
		.update(transactions)
		.set({ settledTxnRef: txRef, paymentStatus: 'paid' })
		.where(
			and(
				eq(transactions.id, transaction.id),
				eq(transactions.txnRef, txRef),
				isNull(transactions.settledTxnRef)
			)
		);

	if (affectedRowsOf(claim) === 0) {
		return { status: 'paid', orderId, amount: verification.amount, alreadySettled: true };
	}

	const email = await db
		.select({ email: customers.email })
		.from(orders)
		.innerJoin(customers, eq(orders.customerId, customers.id))
		.where(eq(orders.id, orderId))
		.then((rows) => rows[0]?.email);

	if (email) {
		const mail = customerPaymentReceivedTemplate(orderId, verification.amount);
		sendEmail(email, mail.subject, mail.html).catch((err) =>
			console.error('Email Error (Payment, Customer):', err)
		);
	}
	const adminMail = adminPaymentReceivedTemplate(orderId, verification.amount, txRef);
	sendEmail(ADMIN_EMAIL, adminMail.subject, adminMail.html).catch((err) =>
		console.error('Email Error (Payment, Admin):', err)
	);

	return { status: 'paid', orderId, amount: verification.amount, alreadySettled: false };
}

// --- Bank transfer -----------------------------------------------------------

/**
 * What a customer paying by transfer needs: the company's active accounts to pay
 * into, and the payment methods they can say they used — only methods that have
 * at least one active account.
 */
export async function bankTransferOptions() {
	const accounts = await db
		.select({
			id: bankAccounts.id,
			bankName: bankAccounts.bankName,
			accountName: bankAccounts.accountName,
			accountNumber: bankAccounts.accountNumber,
			paymentMethodId: paymentMethods.id,
			paymentMethodName: paymentMethods.name
		})
		.from(bankAccounts)
		.innerJoin(paymentMethods, eq(bankAccounts.paymentMethodId, paymentMethods.id))
		.where(and(eq(bankAccounts.isActive, true), eq(paymentMethods.isActive, true)))
		.orderBy(asc(paymentMethods.name), asc(bankAccounts.bankName), asc(bankAccounts.id));

	const methods = [...new Map(accounts.map((a) => [a.paymentMethodId, a.paymentMethodName])).entries()].map(
		([value, name]) => ({ value, name })
	);

	return { accounts, methods };
}

/**
 * Records a customer's bank transfer against an order: the payment method they
 * used and their receipt. It stays `pending` — the money is only confirmed when
 * staff check the receipt and mark it paid.
 */
export async function recordBankTransfer(
	orderId: number,
	{ paymentMethodId, recieptLink }: { paymentMethodId: number; recieptLink: string }
) {
	const state = await orderPaymentState(orderId);
	if (state?.settledTxnRef || state?.paymentStatus === 'paid') throw new AlreadyPaidError();

	const amount = (await orderTotal(orderId)).toFixed(2);

	if (state?.transactionId) {
		await db
			.update(transactions)
			.set({ amount, paymentMethodId, recieptLink, paymentStatus: 'pending' })
			.where(eq(transactions.id, state.transactionId));
		return;
	}

	await db.transaction(async (tx) => {
		const [created] = await tx
			.insert(transactions)
			.values({ amount, paymentMethodId, recieptLink, paymentStatus: 'pending' })
			.$returningId();
		await tx.update(orders).set({ transactionId: created.id }).where(eq(orders.id, orderId));
	});
}
