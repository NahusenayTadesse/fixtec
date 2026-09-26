import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import {
	customers,
	orderItems,
	orders,
	paymentMethods,
	products,
	transactions
} from '$lib/server/db/schema';
import { PICKUP_LABEL } from '$lib/delivery';
import {
	AlreadyPaidError,
	PaymentStartError,
	bankTransferOptions,
	orderPaymentState,
	orderTotal,
	recordBankTransfer,
	settleOnlinePayment,
	startOnlinePayment
} from '$lib/server/payments';
import { deleteUploadedFile, saveUploadedFile } from '$lib/server/upload';
import { transfer } from './schema';
import type { Actions, PageServerLoad } from './$types';

/** The order a (current) payment reference belongs to. */
async function orderForRef(ref: string | null) {
	if (!ref) return undefined;
	return db
		.select({ orderId: orders.id })
		.from(transactions)
		.innerJoin(orders, eq(orders.transactionId, transactions.id))
		.where(eq(transactions.txnRef, ref))
		.then((rows) => rows[0]?.orderId);
}

/**
 * This page is reachable by anyone holding the link — it gets forwarded,
 * screenshotted, left in browser history — so contact details are shown only
 * enough for the customer to recognise them as theirs.
 */
function maskEmail(email: string | null) {
	if (!email) return null;
	const [local, domain] = email.split('@');
	return `${local.slice(0, 2)}${'•'.repeat(Math.max(1, Math.min(local.length - 2, 6)))}@${domain}`;
}

function maskPhone(phone: string | null) {
	if (!phone) return null;
	return `${phone.slice(0, 5)} ••• •${phone.slice(-3)}`;
}

/** Everything the page shows about the order: who, what, where, and its payment. */
async function orderSummary(orderId: number) {
	const [order] = await db
		.select({
			id: orders.id,
			status: orders.status,
			placedAt: orders.createdAt,
			address: orders.address,
			deliveryAddress: orders.deliveryAddress,
			fee: orders.fee,
			customerName: customers.name,
			email: customers.email,
			phone: customers.phone,
			paymentStatus: transactions.paymentStatus,
			paymentMethod: paymentMethods.name,
			settledTxnRef: transactions.settledTxnRef,
			paymentUpdatedAt: transactions.updatedAt
		})
		.from(orders)
		.innerJoin(customers, eq(orders.customerId, customers.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
		.where(eq(orders.id, orderId));

	const items = await db
		.select({
			id: orderItems.id,
			product: products.name,
			variant: orderItems.amount,
			quantity: orderItems.quantity,
			price: orderItems.price
		})
		.from(orderItems)
		.leftJoin(products, eq(orderItems.productId, products.id))
		.where(eq(orderItems.orderId, orderId))
		.orderBy(asc(orderItems.id));

	const pickup = order.address === PICKUP_LABEL;
	const paid = order.paymentStatus === 'paid';

	return {
		status: order.status,
		placedAt: order.placedAt.toISOString(),
		customer: {
			name: order.customerName,
			email: maskEmail(order.email),
			phone: maskPhone(order.phone)
		},
		fulfilment: pickup
			? { type: 'pickup' as const }
			: { type: 'delivery' as const, area: order.address, address: order.deliveryAddress },
		items: items.map((item) => ({
			...item,
			product: item.product ?? 'Product no longer listed',
			price: Number(item.price),
			lineTotal: Number(item.price) * item.quantity
		})),
		fee: Number(order.fee ?? 0),
		payment: {
			paid,
			method: order.paymentMethod,
			// Chapa's reference only once it's the one that actually paid.
			reference: order.settledTxnRef,
			paidAt: paid && order.paymentUpdatedAt ? order.paymentUpdatedAt.toISOString() : null
		}
	};
}

/**
 * Where Chapa sends the customer back to (`?ref=<tx_ref>`).
 *
 * Nothing here trusts the redirect itself: arriving only prompts a server-side
 * check with Chapa. The reference is random and unguessable, so holding the
 * current one is what lets a visitor — signed in or a guest — see this order's
 * payment status, retry it, or switch to a bank transfer.
 */
export const load: PageServerLoad = async ({ url }) => {
	const ref = url.searchParams.get('ref');
	if (!ref) error(404, 'Payment not found');

	const outcome = await settleOnlinePayment(ref);
	if (outcome.orderId === null) error(404, 'This payment link has expired or is not valid.');

	const [state, order] = await Promise.all([
		orderPaymentState(outcome.orderId),
		orderSummary(outcome.orderId)
	]);
	// Paid through Chapa, or by transfer/cash once staff have confirmed it — Chapa
	// alone would still report the latter as "not confirmed".
	const status = order.payment.paid ? 'paid' : outcome.status;

	return {
		ref,
		orderId: outcome.orderId,
		status,
		reason: outcome.status === 'paid' ? null : outcome.reason,
		total: await orderTotal(outcome.orderId),
		// A receipt on an unpaid order means the customer switched to a transfer,
		// which is now waiting for staff to check.
		receiptSent: status !== 'paid' && Boolean(state?.recieptLink),
		chapaUnavailable: url.searchParams.get('chapa') === 'unavailable',
		order,
		bankTransfer: await bankTransferOptions(),
		transferForm: await superValidate(zod4(transfer))
	};
};

export const actions: Actions = {
	/** Start a new Chapa attempt for the same order, e.g. after cancelling on Chapa. */
	retry: async ({ url }) => {
		const ref = url.searchParams.get('ref');
		const orderId = await orderForRef(ref);
		if (!orderId) return fail(404, { message: 'This payment link has expired.' });

		let checkoutUrl: string;
		try {
			checkoutUrl = await startOnlinePayment(orderId, url.origin);
		} catch (err) {
			if (err instanceof AlreadyPaidError) redirect(303, `/checkout/payment?ref=${encodeURIComponent(ref!)}`);
			console.error(`Could not restart payment for order #${orderId}:`, err);
			// The attempt already moved to a new reference, so this page's is stale.
			if (err instanceof PaymentStartError) redirect(303, `${err.paymentPage}&chapa=unavailable`);
			return fail(502, { message: 'Could not reach Chapa. Please try again in a moment.' });
		}
		redirect(303, checkoutUrl);
	},

	/** Couldn't pay with Chapa: pay by bank transfer and upload the receipt instead. */
	transfer: async ({ request, url }) => {
		const form = await superValidate(request, zod4(transfer));
		const orderId = await orderForRef(url.searchParams.get('ref'));
		if (!orderId) {
			return message(form, { type: 'error', text: 'This payment link has expired.' }, { status: 404 });
		}
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form' }, { status: 400 });
		}

		const { methods } = await bankTransferOptions();
		if (!methods.some((m) => m.value === form.data.paymentMethod)) {
			return setError(form, 'paymentMethod', 'Choose how you paid');
		}

		let recieptLink: string | undefined;
		try {
			recieptLink = await saveUploadedFile(form.data.reciept);
			await recordBankTransfer(orderId, { paymentMethodId: form.data.paymentMethod, recieptLink });
		} catch (err) {
			if (recieptLink) await deleteUploadedFile(recieptLink);
			if (err instanceof AlreadyPaidError) {
				return message(form, { type: 'error', text: err.message }, { status: 409 });
			}
			console.error(`Could not record a transfer for order #${orderId}:`, err);
			return message(
				form,
				{ type: 'error', text: 'Could not upload your receipt. Please try again.' },
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'success',
			text: "Receipt received — we'll confirm your order once we've checked it."
		});
	}
};
