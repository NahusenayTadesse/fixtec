import { db } from '$lib/server/db';
import {
	transactions,
	user,
	productAdjustments,
	productSuppliers,
	prices,
	stockBatches
} from '$lib/server/db/schema';
import { asc, count, eq, gt, like, lt, or, sql } from 'drizzle-orm';
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
import { TYPE_LABELS } from './labels';

const TYPES = ['receive', 'sale', 'return', 'damage', 'correction'] as const;
type AdjustmentType = (typeof TYPES)[number];

/** The quantity column's filter: which way the stock moved. */
const direction = sql<string>`CASE WHEN ${productAdjustments.adjustment} > 0 THEN 'increase' ELSE 'decrease' END`;

export const load: PageServerLoad = async ({ params, url }) => {
	const id = Number(params.id);

	const query = parseTableQuery(url, ['quantity', 'type', 'variant', 'supplier'], 20, [
		'date',
		'quantity',
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
		base: [eq(productAdjustments.productsId, id)],
		dateColumn: productAdjustments.createdAt,
		search: (term: string) =>
			or(
				like(productAdjustments.reason, contains(term)),
				like(stockBatches.batchNumber, contains(term)),
				like(user.name, contains(term))
			),
		filters: {
			quantity: (v: string) =>
				v === 'increase'
					? gt(productAdjustments.adjustment, 0)
					: v === 'decrease'
						? lt(productAdjustments.adjustment, 0)
						: undefined,
			type: (v: string) =>
				TYPES.includes(v as AdjustmentType)
					? eq(productAdjustments.type, v as AdjustmentType)
					: undefined,
			variant: (v: string) => eq(productAdjustments.variantId, Number(v)),
			supplier: (v: string) => eq(productAdjustments.supplierId, Number(v))
		}
	};
	const where = buildWhere(query, spec);

	const [allTransactions, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: productAdjustments.id,
				date: sql<string>`DATE_FORMAT(${productAdjustments.createdAt}, '%W %Y-%m-%d')`,
				quantity: productAdjustments.adjustment,
				type: productAdjustments.type,
				variant: prices.amount,
				supplier: productSuppliers.name,
				batchNumber: stockBatches.batchNumber,
				balanceAfter: productAdjustments.balanceAfter,
				orderId: productAdjustments.orderId,
				reason: productAdjustments.reason,
				changedBy: user.name,
				changedById: user.id,
				reciept: transactions.recieptLink
			})
			.from(productAdjustments)
			.leftJoin(transactions, eq(transactions.id, productAdjustments.transactionId))
			.leftJoin(user, eq(productAdjustments.createdBy, user.id))
			.leftJoin(prices, eq(prices.id, productAdjustments.variantId))
			.leftJoin(productSuppliers, eq(productSuppliers.id, productAdjustments.supplierId))
			.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
			.where(where)
			.orderBy(
				...(orderBy(query, {
					date: productAdjustments.createdAt,
					quantity: productAdjustments.adjustment,
					changedBy: user.name
				}) ?? [asc(productAdjustments.createdAt)]),
				asc(productAdjustments.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db
			.select({ total: count() })
			.from(productAdjustments)
			.leftJoin(user, eq(productAdjustments.createdBy, user.id))
			.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
			.where(where),
		facetCounts({
			quantity: () =>
				db
					.select({ value: direction, count: count() })
					.from(productAdjustments)
					.leftJoin(user, eq(productAdjustments.createdBy, user.id))
					.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
					.where(buildWhere(query, spec, { except: 'quantity' }))
					.groupBy(direction)
					.then((rows) =>
						rows.map((r) => ({ ...r, label: r.value === 'increase' ? 'Increase' : 'Decrease' }))
					),
			type: () =>
				db
					.select({ value: productAdjustments.type, count: count() })
					.from(productAdjustments)
					.leftJoin(user, eq(productAdjustments.createdBy, user.id))
					.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
					.where(buildWhere(query, spec, { except: 'type' }))
					.groupBy(productAdjustments.type)
					.then((rows) =>
						rows.map((r) => ({
							...r,
							label: r.value ? (TYPE_LABELS[r.value] ?? r.value) : r.value
						}))
					),
			variant: () =>
				db
					.select({ value: prices.id, label: prices.amount, count: count() })
					.from(productAdjustments)
					.leftJoin(user, eq(productAdjustments.createdBy, user.id))
					.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
					.innerJoin(prices, eq(prices.id, productAdjustments.variantId))
					.where(buildWhere(query, spec, { except: 'variant' }))
					.groupBy(prices.id, prices.amount),
			supplier: () =>
				db
					.select({ value: productSuppliers.id, label: productSuppliers.name, count: count() })
					.from(productAdjustments)
					.leftJoin(user, eq(productAdjustments.createdBy, user.id))
					.leftJoin(stockBatches, eq(stockBatches.id, productAdjustments.batchId))
					.innerJoin(productSuppliers, eq(productSuppliers.id, productAdjustments.supplierId))
					.where(buildWhere(query, spec, { except: 'supplier' }))
					.groupBy(productSuppliers.id, productSuppliers.name)
		})
	]);

	return { allTransactions, table: serverTable(query, total, facets), period };
};
