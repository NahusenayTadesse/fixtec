import { db } from '$lib/server/db';
import {
	orders,
	orderItems,
	products,
	productCategories,
	customers,
	transactions,
	paymentMethods
} from '$lib/server/db/schema';
import { and, asc, count, desc, eq, like, or, sql } from 'drizzle-orm';
import {
	buildWhere,
	contains,
	enumFacet,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';

import { getPresetDateRange, type DatePreset } from '$lib/global.svelte';
import type { PageServerLoad } from './$types';

const STATUSES = ['pending', 'delivered', 'cancelled'] as const;
type Status = (typeof STATUSES)[number];

const SORT_KEYS = [
	'orderId',
	'date',
	'status',
	'customerName',
	'productName',
	'quantityPurchased',
	'unitPrice',
	'lineTotal',
	'paymentMethodName',
	'totalPaid'
];

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, ['status', 'paymentMethodName', 'category'], 20, SORT_KEYS);

	// No window chosen means a preset — this month unless another (or all time) was picked. It is
	// written back onto the query so the table's date control shows the window in use.
	const presetParam = url.searchParams.get('preset');
	if ((!query.dateStart || !query.dateEnd) && presetParam !== 'allTime') {
		const range = getPresetDateRange((presetParam as DatePreset) ?? 'thisMonth');
		query.dateStart = range?.start ?? null;
		query.dateEnd = range?.end ?? null;
	}

	const statusParam = query.filters.status;
	const status = STATUSES.includes(statusParam as Status) ? (statusParam as Status) : 'all';

	const spec = {
		dateColumn: orders.createdAt,
		search: (term: string) =>
			or(
				like(customers.name, contains(term)),
				like(customers.phone, contains(term)),
				like(customers.email, contains(term)),
				like(products.name, contains(term)),
				like(orders.deliveryAddress, contains(term))
			),
		filters: {
			status: (v: string) =>
				STATUSES.includes(v as Status) ? eq(orders.status, v as Status) : undefined,
			paymentMethodName: (v: string) => eq(transactions.paymentMethodId, Number(v)),
			category: (v: string) => eq(products.categoryId, Number(v))
		}
	};

	/** Every filter as chosen — drives the order counts, status chart and detail table. */
	const whereClause = buildWhere(query, spec);
	const filtersExceptStatus = [buildWhere(query, spec, { except: 'status' })];

	/**
	 * Money figures only count delivered orders unless a status is picked explicitly.
	 * Under "all statuses" they used to include cancelled orders (never paid) and
	 * pending ones (not paid yet), which overstated revenue.
	 */
	const revenueStatus: Status = status === 'all' ? 'delivered' : status;
	const revenueWhereClause = and(eq(orders.status, revenueStatus), ...filtersExceptStatus);

	const lineTotalSql = sql<number>`${orderItems.quantity} * ${orderItems.price}`;

	// ---- item-level aggregates (safe to SUM directly — one row per order item) ----

	const [{ totalRevenue, totalItemsSold }] = await db
		.select({
			totalRevenue: sql<number>`COALESCE(SUM(${lineTotalSql}), 0)`.mapWith(Number),
			totalItemsSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`.mapWith(Number)
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.where(revenueWhereClause);

	const dailyTrend = await db
		.select({
			date: sql<string>`DATE(${orders.createdAt})`,
			revenue: sql<number>`COALESCE(SUM(${lineTotalSql}), 0)`.mapWith(Number),
			orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`.mapWith(Number)
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.where(revenueWhereClause)
		.groupBy(sql`DATE(${orders.createdAt})`)
		.orderBy(asc(sql`DATE(${orders.createdAt})`));

	const topProducts = await db
		.select({
			productId: products.id,
			name: products.name,
			quantitySold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`.mapWith(Number),
			revenue: sql<number>`COALESCE(SUM(${lineTotalSql}), 0)`.mapWith(Number)
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.where(revenueWhereClause)
		.groupBy(products.id, products.name)
		.orderBy(desc(sql`SUM(${lineTotalSql})`))
		.limit(5);

	// ---- order-level rows, deduped so fee/status/payment aren't double-counted
	// across an order's multiple line items ----

	const orderLevelRows = await db
		.selectDistinct({
			orderId: orders.id,
			fee: orders.fee,
			status: orders.status,
			paymentMethodName: paymentMethods.name,
			totalPaid: transactions.amount
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
		.where(whereClause);

	const totalOrders = orderLevelRows.length;
	// Same scope as `totalRevenue`, so the average divides like by like.
	const revenueOrders = orderLevelRows.filter((o) => o.status === revenueStatus);
	const totalDeliveryFees = revenueOrders.reduce((sum, o) => sum + Number(o.fee ?? 0), 0);
	const averageOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

	const statusBreakdown = STATUSES.map((s) => ({
		status: s,
		count: orderLevelRows.filter((o) => o.status === s).length
	}));

	// Line totals grouped by payment method, under the same filters as the other
	// revenue figures. Summing each order's whole `transactions.amount` counted the
	// full payment even when a category or product search matched only some items.
	const paymentRevenueRows = await db
		.select({
			name: paymentMethods.name,
			revenue: sql<number>`COALESCE(SUM(${lineTotalSql}), 0)`.mapWith(Number),
			orders: sql<number>`COUNT(DISTINCT ${orders.id})`.mapWith(Number)
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
		.where(revenueWhereClause)
		.groupBy(paymentMethods.name);

	const paymentBreakdownFull = paymentRevenueRows
		.map((row) => ({
			name: row.name ?? 'Unpaid / No Method',
			revenue: row.revenue,
			orders: row.orders
		}))
		.sort((a, b) => b.revenue - a.revenue);

	// Cap chart slices at 6 + "Other" — past ~7 color classes, adjacent hues blur.
	const MAX_SLICES = 6;
	const paymentBreakdown =
		paymentBreakdownFull.length <= MAX_SLICES + 1
			? paymentBreakdownFull
			: [
					...paymentBreakdownFull.slice(0, MAX_SLICES),
					paymentBreakdownFull.slice(MAX_SLICES).reduce(
						(acc, p) => ({
							name: 'Other',
							revenue: acc.revenue + p.revenue,
							orders: acc.orders + p.orders
						}),
						{ name: 'Other', revenue: 0, orders: 0 }
					)
				];

	// ---- revenue by product category ----

	const categoryRevenueRaw = await db
		.select({
			categoryName: productCategories.name,
			revenue: sql<number>`COALESCE(SUM(${lineTotalSql}), 0)`.mapWith(Number)
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.where(revenueWhereClause)
		.groupBy(products.categoryId, productCategories.name)
		.orderBy(desc(sql`SUM(${lineTotalSql})`));

	const categoryBreakdownFull = categoryRevenueRaw.map((c) => ({
		name: c.categoryName ?? 'Uncategorized',
		revenue: c.revenue
	}));

	const categoryBreakdown =
		categoryBreakdownFull.length <= MAX_SLICES + 1
			? categoryBreakdownFull
			: [
					...categoryBreakdownFull.slice(0, MAX_SLICES),
					categoryBreakdownFull
						.slice(MAX_SLICES)
						.reduce((acc, c) => ({ name: 'Other', revenue: acc.revenue + c.revenue }), {
							name: 'Other',
							revenue: 0
						})
				];

	// ---- paginated line-item detail table ----

	const detailRows = await db
		.select({
			orderId: orders.id,
			date: sql<string>`DATE_FORMAT(${orders.createdAt}, '%W %Y-%m-%d')`,
			status: orders.status,
			customerName: customers.name,
			customerId: customers.id,
			productName: products.name,
			productId: products.id,
			category: productCategories.name,
			quantityPurchased: orderItems.quantity,
			unitPrice: orderItems.price,
			lineTotal: lineTotalSql.mapWith(Number),
			paymentMethodName: paymentMethods.name,
			totalPaid: transactions.amount,
			receipt: transactions.recieptLink
		})
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
		.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
		.where(whereClause)
		.orderBy(
			...(orderBy(query, {
				orderId: orders.id,
				date: orders.createdAt,
				status: orders.status,
				customerName: customers.name,
				productName: products.name,
				quantityPurchased: orderItems.quantity,
				unitPrice: orderItems.price,
				lineTotal: lineTotalSql,
				paymentMethodName: paymentMethods.name,
				totalPaid: transactions.amount
			}) ?? [desc(orders.createdAt)]),
			desc(orderItems.id)
		)
		.limit(query.limit)
		.offset(query.offset);

	const [{ totalRows }] = await db
		.select({ totalRows: sql<number>`COUNT(*)`.mapWith(Number) })
		.from(orders)
		.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
		.innerJoin(products, eq(orderItems.productId, products.id))
		.leftJoin(transactions, eq(orders.transactionId, transactions.id))
		.leftJoin(customers, eq(orders.customerId, customers.id))
		.where(whereClause);

	/** Facet tallies over the same line items the table lists, each minus its own filter. */
	const facets = await facetCounts({
		status: () =>
			db
				.select({ value: orders.status, count: count() })
				.from(orders)
				.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
				.innerJoin(products, eq(orderItems.productId, products.id))
				.leftJoin(transactions, eq(orders.transactionId, transactions.id))
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(buildWhere(query, spec, { except: 'status' }))
				.groupBy(orders.status)
				.then(enumFacet),
		paymentMethodName: () =>
			db
				.select({ value: paymentMethods.id, label: paymentMethods.name, count: count() })
				.from(orders)
				.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
				.innerJoin(products, eq(orderItems.productId, products.id))
				.innerJoin(transactions, eq(orders.transactionId, transactions.id))
				.innerJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(buildWhere(query, spec, { except: 'paymentMethodName' }))
				.groupBy(paymentMethods.id, paymentMethods.name),
		category: () =>
			db
				.select({ value: productCategories.id, label: productCategories.name, count: count() })
				.from(orders)
				.innerJoin(orderItems, eq(orders.id, orderItems.orderId))
				.innerJoin(products, eq(orderItems.productId, products.id))
				.innerJoin(productCategories, eq(products.categoryId, productCategories.id))
				.leftJoin(transactions, eq(orders.transactionId, transactions.id))
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(buildWhere(query, spec, { except: 'category' }))
				.groupBy(productCategories.id, productCategories.name)
	});

	return {
		detailRows,
		summary: {
			totalRevenue,
			totalItemsSold,
			totalOrders,
			totalDeliveryFees,
			averageOrderValue,
			statusBreakdown,
			paymentBreakdown,
			categoryBreakdown,
			topProducts,
			dailyTrend
		},
		status,
		/** The preset button to light up: only while no explicit window overrides it. */
		preset: url.searchParams.has('dateStart') ? null : (presetParam ?? 'thisMonth'),
		range: { start: query.dateStart, end: query.dateEnd },
		table: serverTable(query, totalRows, facets)
	};
};
