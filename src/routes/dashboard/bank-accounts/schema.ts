import { z } from 'zod/v4';

const fields = {
	paymentMethod: z.coerce.number('Payment method is required').int().positive('Payment method is required'),
	bankName: z.string('Bank name is required').trim().min(2, 'Bank name is required').max(100),
	accountName: z.string('Account holder is required').trim().min(2, 'Account holder is required').max(150),
	// Kept as text: account numbers can start with 0 and are never used as numbers.
	accountNumber: z
		.string('Account number is required')
		.trim()
		.regex(/^[0-9 -]{5,50}$/, 'Use digits only (spaces and dashes allowed)'),
	status: z.boolean().default(true)
};

export const add = z.object(fields);

export const edit = z.object({ id: z.coerce.number().int().positive(), ...fields });

export const remove = z.object({ id: z.coerce.number().int().positive() });
