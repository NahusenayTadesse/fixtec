import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { asc, count, eq, like, or } from 'drizzle-orm';

import { add, edit, free } from './schema';
import { db } from '$lib/server/db';
import { placeNames as department, freeDelivery } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import {
	activeFilter,
	activeState,
	buildWhere,
	contains,
	enumFacet,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, ['status'], 20, ['name', 'fee', 'status']);
	const spec = {
		search: (term: string) =>
			or(like(department.name, contains(term)), like(department.nameAm, contains(term))),
		filters: { status: activeFilter(department.isActive) }
	};
	const where = buildWhere(query, spec);

	const [form, editForm, freeForm, [freeData], allData, [{ total }], facets] = await Promise.all([
		superValidate(zod4(add)),
		superValidate(zod4(edit)),
		superValidate(zod4(free)),
		db
			.select({
				threshold: freeDelivery.threshold,
				suggestionThreshold: freeDelivery.suggestionThreshold
			})
			.from(freeDelivery)
			.limit(1),
		db
			.select({
				id: department.id,
				name: department.name,
				nameAm: department.nameAm,
				fee: department.fee,
				status: department.isActive
			})
			.from(department)
			.where(where)
			.orderBy(
				...(orderBy(query, {
					name: department.name,
					fee: department.fee,
					status: department.isActive
				}) ?? []),
				asc(department.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(department).where(where),
		facetCounts({
			status: () =>
				db
					.select({ value: activeState(department.isActive), count: count() })
					.from(department)
					.where(buildWhere(query, spec, { except: 'status' }))
					.groupBy(activeState(department.isActive))
					.then(enumFacet)
		})
	]);

	return {
		form,
		editForm,
		allData,
		freeForm,
		freeData,
		table: serverTable(query, total, facets)
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(add));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, nameAm, fee, status } = form.data;

		try {
			await db.insert(department).values({
				name,
				nameAm: nameAm || null,
				fee: String(fee),
				isActive: status,
				createdBy: locals?.user?.id
			});

			return message(form, { type: 'success', text: 'Delivery Address Successfully Added' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') {
				setError(form, 'name', 'Delivery area already exists.');
				return message(
					form,
					{ type: 'error', text: 'Delivery area already exists.' },
					{ status: 400 }
				);
			}
			console.error('Add delivery area failed:', err);
			return message(
				form,
				{ type: 'error', text: 'Could not add the delivery area' },
				{ status: 500 }
			);
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(edit));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, nameAm, fee, status } = form.data;

		try {
			await db
				.update(department)
				.set({
					name,
					nameAm: nameAm || null,
					fee: String(fee),
					isActive: status,
					updatedBy: locals?.user?.id
				})
				.where(eq(department.id, Number(id)));
			return message(form, { type: 'success', text: 'Delivery Address Successfully Updated' });
		} catch (err: any) {
			// This used to return nothing on a duplicate (so the dialog did nothing) and
			// report every *other* error as a duplicate name.
			if (err.code === 'ER_DUP_ENTRY') {
				setError(form, 'name', 'Delivery area already exists.');
				return message(
					form,
					{ type: 'error', text: 'Delivery area already exists.' },
					{ status: 400 }
				);
			}
			console.error('Update delivery area failed:', err);
			return message(
				form,
				{ type: 'error', text: 'Could not update the delivery area' },
				{ status: 500 }
			);
		}
	},
	free: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(free));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { threshold, suggestionThreshold } = form.data;

		try {
			// One transaction: if the insert failed after the delete, the settings were gone.
			await db.transaction(async (tx) => {
				await tx.delete(freeDelivery);
				await tx.insert(freeDelivery).values({
					threshold: String(threshold),
					suggestionThreshold: String(suggestionThreshold)
				});
			});

			return message(form, {
				type: 'success',
				text: 'Free Delivery Settings Successfully Updated'
			});
		} catch (err: any) {
			console.error('Free delivery update failed:', err);
			return message(form, { type: 'error', text: 'Could not save the settings' }, { status: 500 });
		}
	}
};
