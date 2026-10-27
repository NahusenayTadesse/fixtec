import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { asc, count, eq, like, or } from 'drizzle-orm';

import { paymentMethod as schema, editPaymentMethod as editSchema } from './schema';
import { db } from '$lib/server/db';
import { paymentMethods, user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { buildWhere, contains, orderBy, parseTableQuery, serverTable } from '$lib/server/table';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, [], 20, ['name', 'createdBy']);
	const where = buildWhere(query, {
		search: (term: string) =>
			or(
				like(paymentMethods.name, contains(term)),
				like(paymentMethods.nameAm, contains(term)),
				like(user.name, contains(term))
			)
	});

	const [form, editForm, allPaymentMethods, [{ total }]] = await Promise.all([
		superValidate(zod4(schema)),
		superValidate(zod4(editSchema)),
		db
			.select({
				id: paymentMethods.id,
				name: paymentMethods.name,
				nameAm: paymentMethods.nameAm,
				createdBy: user.name,
				createdById: paymentMethods.createdBy
			})
			.from(paymentMethods)
			.leftJoin(user, eq(user.id, paymentMethods.createdBy))
			.where(where)
			.orderBy(
				...(orderBy(query, { name: paymentMethods.name, createdBy: user.name }) ?? []),
				asc(paymentMethods.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db
			.select({ total: count() })
			.from(paymentMethods)
			.leftJoin(user, eq(user.id, paymentMethods.createdBy))
			.where(where)
	]);

	return {
		form,
		editForm,
		allPaymentMethods,
		table: serverTable(query, total)
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, nameAm } = form.data;

		try {
			await db.insert(paymentMethods).values({
				name,
				nameAm: nameAm || null,
				createdBy: locals.user?.id
			});

			return message(form, { type: 'success', text: 'Payment Method Successfully Created' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') setError(form, 'name', 'Payment Method already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Payment Method is already taken. Please choose another one.'
						: err.message
			});
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, nameAm } = form.data;

		try {
			await db
				.update(paymentMethods)
				.set({ name, nameAm: nameAm || null, updatedBy: locals?.user?.id })
				.where(eq(paymentMethods.id, id));
			return message(form, { type: 'success', text: 'Payment Method Successfully Updated' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY')
				return setError(form, 'name', 'Payment Method already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Payment Method is already taken. Please choose another one.'
						: err.message
			});
		}
	}
};
