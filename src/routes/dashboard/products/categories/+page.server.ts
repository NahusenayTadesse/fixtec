import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';

import { add, edit } from './schema';
import { db } from '$lib/server/db';
import { productCategories as department } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { saveUploadedFile } from '$lib/server/upload.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(add));
	const editForm = await superValidate(zod4(edit));

	const allData = await db
		.select({
			id: department.id,
			name: department.name,
			manual: department.manual,
			description: department.description,
			status: department.isActive
		})
		.from(department);

	return {
		form,
		editForm,
		allData
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(add));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, description, status, manual } = form.data;

		try {
			let manualAddress: string = '';

			if (manual) {
				manualAddress = await saveUploadedFile(manual);
			}

			await db.transaction(async (tx) => {
				await tx.insert(department).values({
					name,
					manual: manualAddress,
					description,
					isActive: status,
					createdBy: locals?.user?.id
				});
			});

			return message(form, { type: 'success', text: 'Department Successfully Added' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') setError(form, 'name', 'Department already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Department is already exists. Please choose another one.'
						: err.message
			});
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(edit));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, description, status, manual } = form.data;

		try {
			if (manual) {
				const manualAddress = await saveUploadedFile(manual);

				await db
					.update(department)
					.set({
						name,
						description,
						manual: manualAddress,
						isActive: status,
						updatedBy: locals?.user?.id
					})
					.where(eq(department.id, Number(id)));
			} else {
				await db
					.update(department)
					.set({ name, description, isActive: status, updatedBy: locals?.user?.id })
					.where(eq(department.id, Number(id)));
			}
			return message(form, { type: 'success', text: 'Category Successfully Updated' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') return;
			setError(form, 'name', 'Category name already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Category name is already taken. Please choose another one.'
						: err.message
			});
		}
	}
};
