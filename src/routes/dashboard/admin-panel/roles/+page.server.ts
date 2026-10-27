import { db } from '$lib/server/db';
import { and, asc, count, eq, like, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { user, roles } from '$lib/server/db/schema';
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
	const query = parseTableQuery(url, ['status'], 20, ['name', 'status', 'userCount']);
	const spec = {
		search: (term: string) =>
			or(like(roles.name, contains(term)), like(roles.description, contains(term))),
		filters: { status: activeFilter(roles.isActive) }
	};
	const where = buildWhere(query, spec);
	const userCount = count(user.id);

	const [roleList, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: roles.id,
				name: roles.name,
				description: roles.description,
				userCount,
				status: roles.isActive
			})
			.from(roles)
			.leftJoin(user, eq(user.roleId, roles.id))
			.where(where)
			.groupBy(roles.id)
			.orderBy(
				...(orderBy(query, { name: roles.name, status: roles.isActive, userCount }) ?? []),
				asc(roles.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(roles).where(where),
		facetCounts({
			status: () =>
				db
					.select({ value: activeState(roles.isActive), count: count() })
					.from(roles)
					.where(buildWhere(query, spec, { except: 'status' }))
					.groupBy(activeState(roles.isActive))
					.then(enumFacet)
		})
	]);

	return { roleList, table: serverTable(query, total, facets) };
};
