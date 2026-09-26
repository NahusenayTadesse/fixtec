import { z } from 'zod/v4';
import { receiptFile } from '$lib/receipt';

/** Paying for an already-placed order by bank transfer instead of Chapa. */
export const transfer = z.object({
	paymentMethod: z.coerce.number('Choose how you paid').int().positive('Choose how you paid'),
	reciept: receiptFile
});
