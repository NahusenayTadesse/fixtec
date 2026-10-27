import { asc, count, like, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productSuppliers as supplySuppliers } from '$lib/server/db/schema';
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
	const query = parseTableQuery(url, ['status'], 20, ['name', 'phone', 'email', 'description', 'status']);
	const spec = {
		search: (term: string) =>
			or(
				like(supplySuppliers.name, contains(term)),
				like(supplySuppliers.phone, contains(term)),
				like(supplySuppliers.email, contains(term)),
				like(supplySuppliers.description, contains(term))
			),
		filters: { status: activeFilter(supplySuppliers.isActive) }
	};
	const where = buildWhere(query, spec);

	const [allData, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: supplySuppliers.id,
				name: supplySuppliers.name,
				phone: supplySuppliers.phone,
				email: supplySuppliers.email,
				description: supplySuppliers.description,
				status: supplySuppliers.isActive
			})
			.from(supplySuppliers)
			.where(where)
			.orderBy(
				...(orderBy(query, {
					name: supplySuppliers.name,
					phone: supplySuppliers.phone,
					email: supplySuppliers.email,
					description: supplySuppliers.description,
					status: supplySuppliers.isActive
				}) ?? []),
				asc(supplySuppliers.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(supplySuppliers).where(where),
		facetCounts({
			status: () =>
				db
					.select({ value: activeState(supplySuppliers.isActive), count: count() })
					.from(supplySuppliers)
					.where(buildWhere(query, spec, { except: 'status' }))
					.groupBy(activeState(supplySuppliers.isActive))
					.then(enumFacet)
		})
	]);

	return { allData, table: serverTable(query, total, facets) };
};
