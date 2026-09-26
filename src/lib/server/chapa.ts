import { randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

const CHAPA_BASE = 'https://api.chapa.co/v1';

/** Read per call (dynamic env) so a missing key fails the payment, not the build. */
function secretKey() {
	const key = env.CHAPA_SECRET_KEY?.trim();
	if (!key) throw new Error('CHAPA_SECRET_KEY is not configured');
	return key;
}

/**
 * A fresh reference for one payment attempt: `fx{orderId}-{random}`.
 *
 * The order id is embedded so a webhook can be traced back to its order; the
 * random part makes it unguessable, which is what lets the payment page accept
 * it as proof that the visitor is the one who started the payment.
 */
export function newTxRef(orderId: number) {
	return `fx${orderId}-${randomBytes(9).toString('hex')}`;
}

/** Chapa only accepts letters, digits, spaces, dots, hyphens and underscores here. */
function sanitizeText(text: string, fallback: string) {
	return text.replace(/[^a-zA-Z0-9\s.\-_]/g, ' ').replace(/\s+/g, ' ').trim() || fallback;
}

/**
 * Chapa wants a 10-digit local mobile number (`09…` / `07…`). Ours are stored as
 * `+251XXXXXXXXX`; landlines aren't accepted, so those are left off rather than
 * failing the whole payment.
 */
function toChapaPhone(phone: string | null | undefined) {
	const match = phone?.match(/^\+251([79]\d{8})$/);
	return match ? `0${match[1]}` : undefined;
}

export type InitializeParams = {
	amount: number;
	email: string;
	name: string;
	phone?: string | null;
	txRef: string;
	callbackUrl: string;
	returnUrl: string;
	title?: string;
	description?: string;
};

/** Starts a hosted checkout and returns the URL to send the customer to. */
export async function initializeChapaTransaction(params: InitializeParams): Promise<string> {
	const [firstName, ...rest] = params.name.trim().split(/\s+/);

	const res = await fetch(`${CHAPA_BASE}/transaction/initialize`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			amount: params.amount.toFixed(2),
			currency: 'ETB',
			email: params.email,
			first_name: firstName || 'Customer',
			last_name: rest.join(' ') || firstName || 'Customer',
			phone_number: toChapaPhone(params.phone),
			tx_ref: params.txRef,
			callback_url: params.callbackUrl,
			return_url: params.returnUrl,
			customization: {
				// Chapa caps the title at 16 characters.
				title: sanitizeText(params.title ?? '', 'Lalo Fixtec').slice(0, 16),
				description: sanitizeText(params.description ?? '', 'Payment for your order')
			}
		})
	});

	const data = await res.json().catch(() => null);

	if (!res.ok || data?.status !== 'success' || !data?.data?.checkout_url) {
		const detail =
			typeof data?.message === 'string'
				? data.message
				: data?.message
					? Object.entries(data.message)
							.map(([field, messages]) => `${field}: ${([] as string[]).concat(messages as string[]).join(', ')}`)
							.join('; ')
					: `HTTP ${res.status}`;
		throw new Error(`Chapa could not start the payment: ${detail}`);
	}

	return data.data.checkout_url as string;
}

export type ChapaVerification = {
	/** Chapa says the payment went through. */
	paid: boolean;
	/** Chapa says it definitively failed (as opposed to "not finished yet"). */
	failed: boolean;
	amount: number;
	currency?: string;
	txRef?: string;
};

/**
 * Asks Chapa, server to server, what happened to a payment. This is the only
 * thing that decides whether an order is paid — never a query string, a
 * redirect, or a webhook body on its own.
 */
export async function verifyChapaTransaction(txRef: string): Promise<ChapaVerification> {
	const res = await fetch(`${CHAPA_BASE}/transaction/verify/${encodeURIComponent(txRef)}`, {
		headers: { Authorization: `Bearer ${secretKey()}` }
	});
	const data = await res.json().catch(() => null);

	// An unknown reference is a 400 with `status: "failed"` — i.e. "nothing paid
	// yet", which is also what an attempt the customer abandoned looks like.
	if (res.status >= 500) throw new Error(`Chapa verify failed: HTTP ${res.status}`);

	const status = data?.data?.status;
	return {
		paid: data?.status === 'success' && status === 'success',
		failed: status === 'failed',
		amount: Number(data?.data?.amount),
		currency: data?.data?.currency,
		txRef: data?.data?.tx_ref
	};
}
