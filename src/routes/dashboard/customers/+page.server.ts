import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers, user, orders } from '$lib/server/db/schema';
import { eq, and, count, desc, sql, inArray, or, like } from 'drizzle-orm';
import {
	buildWhere,
	contains,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';
import { setFlash } from 'sveltekit-flash-message/server';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { addCustomer } from '$lib/ZodSchema';
import { duplicateField } from '$lib/server/crud';
import { zod4 } from 'sveltekit-superforms/adapters';
import { normalizeEthiopianPhone } from '$lib/validators/phone';

export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, ['deliveryAddress'], 20, [
		'customerName',
		'phone',
		'email',
		'address',
		'deliveryAddress',
		'createdAt',
		'daysSinceJoined',
		'orderCount'
	]);

	const spec = {
		dateColumn: customers.createdAt,
		search: (term: string) =>
			or(
				like(customers.name, contains(term)),
				like(customers.phone, contains(term)),
				like(customers.email, contains(term)),
				like(customers.address, contains(term)),
				like(customers.deliveryAddress, contains(term))
			),
		filters: { deliveryAddress: (v: string) => eq(customers.deliveryAddress, v) }
	};
	const where = buildWhere(query, spec);

	const pendingOrders = count(orders.id);

	const [addCustomerForm, customersList, [{ total }], facets] = await Promise.all([
		superValidate(zod4(addCustomer), { id: 'addCustomer' }),
		db
			.select({
				id: customers.id,
				customerName: customers.name,
				email: customers.email,
				phone: customers.phone,
				address: customers.address,
				deliveryAddress: customers.deliveryAddress,
				orderCount: pendingOrders,
				daysSinceJoined: sql<number>`DATEDIFF(CURRENT_DATE, ${customers.createdAt})`,
				createdBy: user.name,
				createdById: user.id,
				createdAt: sql<string>`DATE_FORMAT(${customers.createdAt}, '%Y-%m-%d')`
			})
			.from(customers)
			.leftJoin(user, eq(customers.createdBy, user.id))
			.leftJoin(orders, and(eq(orders.customerId, customers.id), eq(orders.status, 'pending')))
			.where(where)
			.groupBy(customers.id, user.name, customers.createdAt, customers.name)
			// Newest first by default: a customer just added must land on page one.
			.orderBy(
				...(orderBy(query, {
					customerName: customers.name,
					phone: customers.phone,
					email: customers.email,
					address: customers.address,
					deliveryAddress: customers.deliveryAddress,
					createdAt: customers.createdAt,
					// Days since joining grows as the join date shrinks.
					daysSinceJoined: sql`DATEDIFF(CURRENT_DATE, ${customers.createdAt})`,
					orderCount: pendingOrders
				}) ?? [desc(customers.createdAt)]),
				desc(customers.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(customers).where(where),
		facetCounts({
			deliveryAddress: () =>
				db
					.select({ value: customers.deliveryAddress, count: count() })
					.from(customers)
					.where(buildWhere(query, spec, { except: 'deliveryAddress' }))
					.groupBy(customers.deliveryAddress)
		})
	]);

	return {
		customersList,
		addCustomerForm,
		table: serverTable(query, total, facets),
		filtered: Boolean(query.search || query.dateStart || query.filters.deliveryAddress)
	};
};

export const actions: Actions = {
	/**
	 * Shared by every page showing the add-customer dialog (customers, orders, …):
	 * they post here with `action="/dashboard/customers?/addCustomer"` rather than
	 * duplicating the action.
	 *
	 * The customer is deliberately standalone — no `user` account is created or
	 * linked, so `userId` is never written here.
	 */
	addCustomer: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod4(addCustomer));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form.' }, cookies);
			return fail(400, { form });
		}
		const { name, email, address, deliveryAddress } = form.data;
		// Same `+251XXXXXXXXX` shape signup and checkout store, so one person's number
		// doesn't end up in the table in two formats. A number that isn't Ethiopian is
		// kept as typed.
		const phone = normalizeEthiopianPhone(form.data.phone) ?? form.data.phone.trim();

		// `customers.phone` has no unique index, so the duplicate-key branch below could
		// never fire for it and the same walk-in customer was added again and again.
		// Rows written before phones were normalised may still hold the typed form.
		const samePhone = await db
			.select({ id: customers.id })
			.from(customers)
			.where(inArray(customers.phone, [...new Set([phone, form.data.phone.trim()])]))
			.limit(1)
			.then((rows) => rows[0]);

		if (samePhone) {
			return setError(form, 'phone', 'A customer with this phone number already exists.');
		}

		try {
			// Needs `drizzle/0019_*.sql` applied — it makes `customers.user_id` and
			// `customers.email` nullable. The customer stays account-less and
			// email-less by design.
			//
			// `email` must go in as NULL, never '': the column is UNIQUE, and MySQL
			// allows repeated NULLs but not a second empty string.
			await db.insert(customers).values({
				name,
				email: email || null,
				phone,
				address: address || null,
				deliveryAddress: deliveryAddress || null,
				createdBy: locals?.user?.id
			});

			return message(form, { type: 'success', text: 'Customer Successfully Added' });
		} catch (err) {
			console.error('Error adding customer:', err);

			const field = duplicateField(err, customers);
			if (field === 'email') {
				return setError(form, 'email', 'That email is already taken.');
			}

			return message(
				form,
				{ type: 'error', text: 'Error: Something Went Wrong Try Again' },
				{ status: 400 }
			);
		}
	}
};
