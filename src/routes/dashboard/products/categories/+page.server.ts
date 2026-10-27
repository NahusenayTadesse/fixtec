import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { asc, count, eq, like, or } from 'drizzle-orm';

import { add, edit } from './schema';
import { db } from '$lib/server/db';
import { productCategories as department } from '$lib/server/db/schema';
import { duplicateField } from '$lib/server/crud';
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
	const query = parseTableQuery(url, ['status'], 20, ['name', 'status']);
	const spec = {
		search: (term: string) =>
			or(
				like(department.name, contains(term)),
				like(department.nameAm, contains(term)),
				like(department.description, contains(term))
			),
		filters: { status: activeFilter(department.isActive) }
	};
	const where = buildWhere(query, spec);

	const [form, editForm, allData, [{ total }], facets] = await Promise.all([
		superValidate(zod4(add)),
		superValidate(zod4(edit)),
		db
			.select({
				id: department.id,
				name: department.name,
				description: department.description,
				nameAm: department.nameAm,
				descriptionAm: department.descriptionAm,
				status: department.isActive
			})
			.from(department)
			.where(where)
			.orderBy(
				...(orderBy(query, { name: department.name, status: department.isActive }) ?? []),
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
		table: serverTable(query, total, facets)
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(add));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, description, nameAm, descriptionAm, status } = form.data;

		try {
			await db.insert(department).values({
				name,
				nameAm: nameAm || null,
				descriptionAm: descriptionAm || null,

				description,
				isActive: status,
				createdBy: locals?.user?.id
			});

			return message(form, { type: 'success', text: 'Category Successfully Added' });
		} catch (err) {
			const field = duplicateField(err, department);
			if (field) {
				setError(form, field as never, `This ${field} is already in use`);
				return message(form, { type: 'error', text: 'Category already exists' }, { status: 400 });
			}
			return message(
				form,
				{ type: 'error', text: 'Error: ' + (err as Error)?.message },
				{ status: 500 }
			);
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(edit));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, description, nameAm, descriptionAm, status } = form.data;

		try {
			await db
				.update(department)
				.set({
					name,
					description,
					nameAm: nameAm || null,
					descriptionAm: descriptionAm || null,
					isActive: status,
					updatedBy: locals?.user?.id
				})
				.where(eq(department.id, Number(id)));
			return message(form, { type: 'success', text: 'Category Successfully Updated' });
		} catch (err) {
			const field = duplicateField(err, department);
			if (field) {
				setError(form, field as never, `This ${field} is already in use`);
				return message(form, { type: 'error', text: 'Category already exists' }, { status: 400 });
			}
			return message(
				form,
				{ type: 'error', text: 'Error: ' + (err as Error)?.message },
				{ status: 500 }
			);
		}
	}
};
