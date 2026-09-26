import { z } from 'zod/v4';

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;

/** Screenshots from any phone, plus PDFs from online banking. */
const RECEIPT_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/heic',
	'image/heif',
	'application/pdf'
];

/** A bank-transfer receipt: a screenshot or PDF of the transfer, up to 10MB. */
export const receiptFile = z
	.instanceof(File)
	.refine((file) => file.size <= MAX_RECEIPT_SIZE, 'Max file size is 10MB.')
	.refine((file) => RECEIPT_TYPES.includes(file.type), 'Upload an image or PDF of your receipt.');

/** How a customer pays for an order at checkout. */
export const PAYMENT_OPTIONS = ['onDelivery', 'chapa', 'bank'] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];
