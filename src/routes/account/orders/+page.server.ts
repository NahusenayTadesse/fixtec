import { error, fail, isHttpError, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, customers, orderItems, products, transactions } from '$lib/server/db/schema';
import { AlreadyPaidError, PaymentStartError, startOnlinePayment } from '$lib/server/payments';
import { eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// 1. Guard check
	if (!locals.user) return redirect(303, '/');

	try {
		// 2. Fetch the logged-in customer's ID
		const customer = await db
			.select({ id: customers.id })
			.from(customers)
			.where(eq(customers.userId, locals.user.id))
			.then((rows) => rows[0]);

		if (!customer) {
			throw error(404, 'Customer profile not found.');
		}

		// 3. Fetch ONLY pending orders along with an aggregated array of items
		// Using a subquery or structured map to prevent item array layout fragmentation
		const rawPendingOrders = await db
			.select({
				id: orders.id,
				status: orders.status,
				createdAt: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d %H:%i')`,
				updatedAt: sql<string>`DATE_FORMAT(${orders.updatedAt}, '%Y-%m-%d %H:%i')`,
				fee: orders.fee,
				paymentStatus: transactions.paymentStatus,
				recieptLink: transactions.recieptLink,
				// Example tracking steps field if you have it, otherwise mock calculated on frontend
				itemId: orderItems.id,
				productName: products.name,
				quantity: orderItems.quantity,
				price: orderItems.price,
				total: sql<number>`${orderItems.quantity} * ${orderItems.price}`.mapWith(Number)
			})
			.from(orders)
			.leftJoin(transactions, eq(orders.transactionId, transactions.id))
			.leftJoin(orderItems, eq(orders.id, orderItems.orderId))
			.leftJoin(products, eq(orderItems.productId, products.id))
			.where(and(eq(orders.customerId, Number(customer.id)), eq(orders.status, 'pending')));

		// 4. Reduce flat rows into structured Order objects with child Items
		const pendingOrdersMap = rawPendingOrders.reduce(
			(acc, row) => {
				if (!acc[row.id]) {
					acc[row.id] = {
						id: row.id,
						status: row.status,
						createdAt: row.createdAt,
						updatedAt: row.updatedAt,
						// Starts at the delivery fee: "Estimated Expenditure" quoted items only,
						// so customers who chose delivery were shown less than they'd pay.
						orderTotal: Number(row.fee ?? 0),
						paid: row.paymentStatus === 'paid',
						// A transfer receipt waiting for staff to check it.
						receiptSent: row.paymentStatus !== 'paid' && Boolean(row.recieptLink),
						items: []
					};
				}

				if (row.itemId) {
					acc[row.id].items.push({
						id: row.itemId,
						productName: row.productName,
						quantity: row.quantity,
						price: row.price,
						total: row.total
					});
					acc[row.id].orderTotal += row.total;
				}

				return acc;
			},
			{} as Record<number, any>
		);

		return {
			pendingOrders: Object.values(pendingOrdersMap)
		};
	} catch (err) {
		// The 404 above used to be swallowed here and shown as "no active shipments".
		if (isHttpError(err)) throw err;
		console.error('Error loading order tracking snapshot:', err);
		return {
			pendingOrders: [],
			error: 'Could not populate active tracking parameters.'
		};
	}
};

export const actions: Actions = {
	/** Pay for one of your own pending orders online — first time, or after abandoning Chapa. */
	pay: async ({ request, locals, url }) => {
		if (!locals.user) redirect(303, '/login');

		const orderId = Number((await request.formData()).get('orderId'));
		const owned = await db
			.select({ id: orders.id })
			.from(orders)
			.innerJoin(customers, eq(orders.customerId, customers.id))
			.where(
				and(eq(orders.id, orderId), eq(customers.userId, locals.user.id), eq(orders.status, 'pending'))
			)
			.then((rows) => rows[0]);
		if (!owned) return fail(404, { message: 'Order not found' });

		let checkoutUrl: string;
		try {
			checkoutUrl = await startOnlinePayment(orderId, url.origin);
		} catch (err) {
			if (err instanceof AlreadyPaidError) return fail(409, { message: err.message });
			console.error(`Could not start payment for order #${orderId}:`, err);
			// Its payment page still works: retry there, or pay by bank transfer.
			if (err instanceof PaymentStartError) redirect(303, `${err.paymentPage}&chapa=unavailable`);
			return fail(502, { message: 'Could not reach Chapa. Please try again in a moment.' });
		}
		redirect(303, checkoutUrl);
	}
};
