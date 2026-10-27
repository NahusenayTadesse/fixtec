import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { asc, count, eq, like, or } from 'drizzle-orm';

import {
	paymentMethod as schema,
	editPaymentMethod as editSchema,
	deleteTestimonial
} from './schema.js';
import { db } from '$lib/server/db';
import { testimonials as paymentMethods, user } from '$lib/server/db/schema';
import type { Actions } from './$types.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, [], 20, ['name', 'position', 'createdBy']);
	const where = buildWhere(query, {
		search: (term: string) =>
			or(
				like(paymentMethods.name, contains(term)),
				like(paymentMethods.position, contains(term)),
				like(paymentMethods.message, contains(term)),
				like(user.name, contains(term))
			)
	});

	const [form, editForm, deleteForm, allPaymentMethods, [{ total }]] = await Promise.all([
		superValidate(zod4(schema)),
		superValidate(zod4(editSchema)),
		superValidate(zod4(deleteTestimonial)),
		db
			.select({
				id: paymentMethods.id,
				name: paymentMethods.name,
				position: paymentMethods.position,
				testimonial: paymentMethods.message,
				positionAm: paymentMethods.positionAm,
				testimonialAm: paymentMethods.messageAm,
				avatar: paymentMethods.avatar,
				createdBy: user.name,
				createdById: paymentMethods.createdBy
			})
			.from(paymentMethods)
			.leftJoin(user, eq(user.id, paymentMethods.createdBy))
			.where(where)
			.orderBy(
				...(orderBy(query, {
					name: paymentMethods.name,
					position: paymentMethods.position,
					createdBy: user.name
				}) ?? []),
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
		deleteForm,
		allPaymentMethods,
		table: serverTable(query, total)
	};
};

import { saveUploadedFile } from '$lib/server/upload.js';
import { buildWhere, contains, orderBy, parseTableQuery, serverTable } from '$lib/server/table';

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, position, testimonial, positionAm, testimonialAm, avatar } = form.data;

		try {
			const avatarFile = await saveUploadedFile(avatar);
			await db.insert(paymentMethods).values({
				name,
				position,
				message: testimonial,
				positionAm: positionAm || null,
				messageAm: testimonialAm || null,
				avatar: avatarFile,
				createdBy: locals.user?.id
			});

			return message(form, { type: 'success', text: 'Testimonial Successfully Created' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while creating testimonial.'
				},
				{ status: 500 }
			);
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, position, testimonial, positionAm, testimonialAm, avatar } = form.data;

		try {
			await db
				.update(paymentMethods)
				.set({
					name,
					position,
					message: testimonial,
					positionAm: positionAm || null,
					messageAm: testimonialAm || null,
					...(avatar instanceof File && avatar.size > 0
						? { avatar: await saveUploadedFile(avatar) }
						: {}),
					updatedBy: locals?.user?.id
				})
				.where(eq(paymentMethods.id, id));
			return message(form, { type: 'success', text: 'Testimonial Successfully Updated' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while updating testimonial.'
				},
				{ status: 500 }
			);
		}
	},
	delete: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(deleteTestimonial));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = form.data;

		try {
			await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
			return message(form, { type: 'success', text: 'Testimonial Successfully Deleted' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while deleting testimonial.'
				},
				{ status: 500 }
			);
		}
	}
};
