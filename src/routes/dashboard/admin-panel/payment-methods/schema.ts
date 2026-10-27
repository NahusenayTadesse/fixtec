import { z } from 'zod/v4';

export const paymentMethod = z.object({
	name: z.string('Name of Payment Method is required').min(2).max(50),
	// Optional Amharic label shown at checkout; empty shows `name`.
	nameAm: z.string().trim().max(100).optional()
});

export const editPaymentMethod = z.object({
	id: z.coerce.string(),
	name: z.string('Name of Payment Method is required').min(2).max(50),
	// Optional Amharic label shown at checkout; empty shows `name`.
	nameAm: z.string().trim().max(100).optional()
});
export type EditPaymentMethod = z.infer<typeof editPaymentMethod>;
