import { db } from '$lib/server/db';
import { asc, count, eq, like, or, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { user, roles, rolePermissions } from '$lib/server/db/schema';
import {
	buildWhere,
	contains,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, ['role'], 20, [
		'name',
		'email',
		'role',
		'permissionsCount',
		'createdAt'
	]);
	const spec = {
		search: (term: string) =>
			or(
				like(user.name, contains(term)),
				like(user.email, contains(term)),
				like(roles.name, contains(term))
			),
		filters: { role: (v: string) => eq(user.roleId, Number(v)) }
	};
	const where = buildWhere(query, spec);
	const permissionsCount = sql<number>`COUNT(DISTINCT ${rolePermissions.id})`;

	const [userList, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: roles.name,
				roleId: user.roleId,

				createdAt: user.createdAt,
				permissionsCount
			})
			.from(user)
			.leftJoin(roles, eq(roles.id, user.roleId))
			.leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
			.where(where)
			.groupBy(user.id, user.name, user.email, roles.name, user.createdAt)
			.orderBy(
				...(orderBy(query, {
					name: user.name,
					email: user.email,
					role: roles.name,
					permissionsCount,
					createdAt: user.createdAt
				}) ?? []),
				asc(user.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db
			.select({ total: count() })
			.from(user)
			.leftJoin(roles, eq(roles.id, user.roleId))
			.where(where),
		facetCounts({
			role: () =>
				db
					.select({ value: roles.id, label: roles.name, count: count() })
					.from(user)
					.innerJoin(roles, eq(roles.id, user.roleId))
					.where(buildWhere(query, spec, { except: 'role' }))
					.groupBy(roles.id, roles.name)
		})
	]);

	return { userList, table: serverTable(query, total, facets) };
};
