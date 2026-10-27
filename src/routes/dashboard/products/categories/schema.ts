import type { Description } from '@nahu/admin-kit/components/ui/sheet/index.js';
import { z } from 'zod/v4';

export const add = z.object({
	name: z.string('Name of Payment Method is required').min(2).max(50),
	description: z.string('Description is required').min(2).max(100),
	// Optional Amharic copy; the storefront shows the English fields when empty.
	nameAm: z.string().trim().max(100).optional(),
	descriptionAm: z.string().trim().max(255).optional(),
	status: z.boolean('Status is required')
});

export const edit = z.object({
	id: z.coerce.string(),
	name: z.string('Name of Payment Method is required').min(2).max(50),
	description: z.string('Description is required').min(2).max(100),
	// Optional Amharic copy; the storefront shows the English fields when empty.
	nameAm: z.string().trim().max(100).optional(),
	descriptionAm: z.string().trim().max(255).optional(),
	status: z.boolean('Status is required')
});
export type Edit = z.infer<typeof edit>;
