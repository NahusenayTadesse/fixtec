import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, damagedProducts, products, prices, stockBatches } from '$lib/server/db/schema';
import { asc, count, eq, like, or, sql } from 'drizzle-orm';
import { getCurrentMonthRangeDates } from '$lib/global.svelte';
import {
	buildWhere,
	contains,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const productId = Number(params.id);

	const product = await db
		.select({ name: products.name })
		.from(products)
		.where(eq(products.id, productId))
		.then((rows) => rows[0]);

	if (!product) error(404, 'Product not found');

	const query = parseTableQuery(url, ['reason'], 20, [
		'date',
		'quantity',
		'damagedBy',
		'changedBy'
	]);

	// No window chosen means this month, as before, unless `?period=all` asks for every row. The
	// month is written back onto the query so the table's date control shows where the rows are from.
	const custom = Boolean(query.dateStart && query.dateEnd);
	const period = custom
		? null
		: url.searchParams.get('period') === 'all'
			? ('all' as const)
			: ('month' as const);
	if (period === 'month') {
		const month = getCurrentMonthRangeDates();
		query.dateStart = month.start;
		query.dateEnd = month.end;
	}

	const spec = {
		base: [eq(damagedProducts.productId, productId)],
		dateColumn: damagedProducts.createdAt,
		search: (term: string) =>
			or(
				like(damagedProducts.reason, contains(term)),
				like(damagedProducts.damagedBy, contains(term)),
				like(user.name, contains(term))
			),
		filters: { reason: (v: string) => eq(damagedProducts.reason, v) }
	};
	const where = buildWhere(query, spec);

	const [allTransactions, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: damagedProducts.id,
				date: sql<string>`DATE_FORMAT(${damagedProducts.createdAt}, '%W %Y-%m-%d')`,
				quantity: damagedProducts.quantity,
				variant: prices.amount,
				batchNumber: stockBatches.batchNumber,
				reason: damagedProducts.reason,
				damagedBy: damagedProducts.damagedBy,
				changedById: user.id,
				changedBy: user.name
			})
			.from(damagedProducts)
			.leftJoin(user, eq(damagedProducts.createdBy, user.id))
			.leftJoin(prices, eq(prices.id, damagedProducts.variantId))
			.leftJoin(stockBatches, eq(stockBatches.id, damagedProducts.batchId))
			.where(where)
			.orderBy(
				...(orderBy(query, {
					date: damagedProducts.createdAt,
					quantity: damagedProducts.quantity,
					damagedBy: damagedProducts.damagedBy,
					changedBy: user.name
				}) ?? [asc(damagedProducts.createdAt)]),
				asc(damagedProducts.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db
			.select({ total: count() })
			.from(damagedProducts)
			.leftJoin(user, eq(damagedProducts.createdBy, user.id))
			.where(where),
		facetCounts({
			reason: () =>
				db
					.select({ value: damagedProducts.reason, count: count() })
					.from(damagedProducts)
					.leftJoin(user, eq(damagedProducts.createdBy, user.id))
					.where(buildWhere(query, spec, { except: 'reason' }))
					.groupBy(damagedProducts.reason)
		})
	]);

	return { allTransactions, product, table: serverTable(query, total, facets), period };
};
