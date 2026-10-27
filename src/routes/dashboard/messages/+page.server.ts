import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { count, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import {
	buildWhere,
	contains,
	enumFacet,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';

import { deleteTestimonial, markRead } from './schema.js';
import { db } from '$lib/server/db';
import { contactMessages as paymentMethods } from '$lib/server/db/schema';
import type { Actions } from './$types.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, ['subject', 'isRead'], 20, [
		'name',
		'phone',
		'email',
		'subject',
		'address',
		'createdAt',
		'isRead'
	]);

	const spec = {
		dateColumn: paymentMethods.createdAt,
		search: (term: string) =>
			or(
				like(paymentMethods.name, contains(term)),
				like(paymentMethods.email, contains(term)),
				like(paymentMethods.phone, contains(term)),
				like(paymentMethods.subject, contains(term)),
				like(paymentMethods.address, contains(term)),
				like(paymentMethods.message, contains(term))
			),
		filters: {
			subject: (v: string) => eq(paymentMethods.subject, v),
			// `seen` defaults to null on old rows, which reads as unread.
			isRead: (v: string) =>
				v === 'read'
					? eq(paymentMethods.seen, true)
					: or(eq(paymentMethods.seen, false), isNull(paymentMethods.seen))
		}
	};
	const where = buildWhere(query, spec);
	const readState = sql<string>`CASE WHEN ${paymentMethods.seen} THEN 'read' ELSE 'unread' END`;

	const [readForm, deleteForm, allPaymentMethods, [{ total }], facets] = await Promise.all([
		superValidate(zod4(markRead)),
		superValidate(zod4(deleteTestimonial)),
		db
			.select({
				id: paymentMethods.id,
				name: paymentMethods.name,
				email: paymentMethods.email,
				phone: paymentMethods.phone,
				subject: paymentMethods.subject,
				isRead: paymentMethods.seen,
				message: paymentMethods.message,
				address: paymentMethods.address,
				submittedAt: paymentMethods.createdAt
			})
			.from(paymentMethods)
			.where(where)
			.orderBy(
				...(orderBy(query, {
					name: paymentMethods.name,
					phone: paymentMethods.phone,
					email: paymentMethods.email,
					subject: paymentMethods.subject,
					address: paymentMethods.address,
					createdAt: paymentMethods.createdAt,
					isRead: paymentMethods.seen
				}) ?? [desc(paymentMethods.createdAt)]),
				desc(paymentMethods.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(paymentMethods).where(where),
		facetCounts({
			subject: () =>
				db
					.select({ value: paymentMethods.subject, count: count() })
					.from(paymentMethods)
					.where(buildWhere(query, spec, { except: 'subject' }))
					.groupBy(paymentMethods.subject),
			isRead: () =>
				db
					.select({ value: readState, count: count() })
					.from(paymentMethods)
					.where(buildWhere(query, spec, { except: 'isRead' }))
					.groupBy(readState)
					.then(enumFacet)
		})
	]);

	return {
		readForm,
		deleteForm,
		allPaymentMethods,
		table: serverTable(query, total, facets)
	};
};

export const actions: Actions = {
	read: async ({ request, locals }) => {
		// `markRead`, not `deleteTestimonial` — the two schemas happen to be the same
		// shape, so this worked, but it seeded the read form from the delete schema.
		const form = await superValidate(request, zod4(markRead));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = form.data;

		try {
			await db.update(paymentMethods).set({ seen: true }).where(eq(paymentMethods.id, id));
			return message(form, { type: 'success', text: 'Message Successfully Marked as Read' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while marking message as read.'
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
			return message(form, { type: 'success', text: 'Message Successfully Deleted' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while deleting message.'
				},
				{ status: 500 }
			);
		}
	}
};
