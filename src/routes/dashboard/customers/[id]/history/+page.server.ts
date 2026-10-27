import { db } from '$lib/server/db';
import { orders, customers, products, orderItems } from '$lib/server/db/schema';
import { and, count, desc, eq, exists, inArray, like, or, sql } from 'drizzle-orm';
import {
	buildWhere,
	contains,
	enumFacet,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';
import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Read-only. This route used to carry copies of an `editCustomer` action (writing
// `firstName`/`lastName`/`gender` columns `customers` doesn't have) and of the
// `delete` action; the page used neither. Editing and deleting live on
// `customers/[id]`.
type OrderStatus = (typeof orders.status.enumValues)[number];

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const id = Number(params.id);

		const customer = await db
			.select({ customerName: customers.name })
			.from(customers)
			.where(eq(customers.id, id))
			.then((rows) => rows[0]);

		if (!customer) error(404, 'Customer not found');

		const query = parseTableQuery(url, ['status'], 20, ['status', 'createdAt']);

		const spec = {
			base: [eq(orders.customerId, id)],
			dateColumn: orders.createdAt,
			// An order matches when any of its items is for a product of that name, or by its number.
			search: (term: string) =>
				or(
					sql`CAST(${orders.id} AS CHAR) = ${term}`,
					exists(
						db
							.select({ one: sql`1` })
							.from(orderItems)
							.innerJoin(products, eq(orderItems.productId, products.id))
							.where(and(eq(orderItems.orderId, orders.id), like(products.name, contains(term))))
					)
				),
			filters: {
				status: (v: string) =>
					(orders.status.enumValues as readonly string[]).includes(v)
						? eq(orders.status, v as OrderStatus)
						: undefined
			}
		};
		const where = buildWhere(query, spec);

		const [allData, [{ total }], facets] = await Promise.all([
			db
				.select({
					id: orders.id,
					name: customers.name,
					status: orders.status,
					createdAt: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`
				})
				.from(orders)
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(where)
				.orderBy(
					...(orderBy(query, { status: orders.status, createdAt: orders.createdAt }) ?? [
						desc(orders.createdAt)
					]),
					desc(orders.id)
				)
				.limit(query.limit)
				.offset(query.offset),
			db.select({ total: count() }).from(orders).where(where),
			facetCounts({
				status: () =>
					db
						.select({ value: orders.status, count: count() })
						.from(orders)
						.where(buildWhere(query, spec, { except: 'status' }))
						.groupBy(orders.status)
						.then(enumFacet)
			})
		]);

		// Only this customer's items — a condition inside a LEFT JOIN filters nothing.
		const orderIds = allData.map((order) => order.id);
		const allItems = orderIds.length
			? await db
					.select({
						id: orderItems.id,
						orderId: orderItems.orderId,
						product: products.name,
						quantity: orderItems.quantity,
						productId: orderItems.productId,
						price: orderItems.price,
						total: sql<number>`${orderItems.quantity} * ${orderItems.price}`.mapWith(Number)
					})
					.from(orderItems)
					.leftJoin(products, eq(orderItems.productId, products.id))
					.where(inArray(orderItems.orderId, orderIds))
			: [];

		return { customer, allData, allItems, table: serverTable(query, total, facets) };
	} catch (err) {
		if (isHttpError(err)) throw err;
		console.error('Error loading customer order history:', err);
		return {
			customer: null,
			allData: [],
			allItems: [],
			table: undefined,
			error: 'Failed to load order history.'
		};
	}
};
