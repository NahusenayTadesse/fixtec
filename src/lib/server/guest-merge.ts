import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { customers, orders } from '$lib/server/db/schema';

/**
 * Brings a guest's past orders into the account that owns the same email, once
 * that account has proved the email is theirs (`afterEmailVerification` in
 * `auth.ts`).
 *
 * Never done at signup: email isn't verified there, and linking straight away let
 * anyone who knew a guest's email register with it and read their orders,
 * addresses and transfer receipts.
 *
 * Until then the account's own `customers` row has no email — `customers.email`
 * is UNIQUE and the guest row still holds it — so order and payment mail falls
 * back to the account's login email (see `customerEmail`).
 */
export async function mergeGuestCustomer(userId: string, email: string) {
	const normalizedEmail = email.trim().toLowerCase();

	await db.transaction(async (tx) => {
		const guest = await tx
			.select({ id: customers.id })
			.from(customers)
			.where(and(eq(customers.email, normalizedEmail), isNull(customers.userId)))
			.limit(1)
			.then((rows) => rows[0]);

		const own = await tx
			.select({ id: customers.id, email: customers.email })
			.from(customers)
			.where(eq(customers.userId, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (guest && own) {
			await tx.update(orders).set({ customerId: own.id }).where(eq(orders.customerId, guest.id));
			// Deleted before the email moves across, so the UNIQUE index never sees two.
			await tx.delete(customers).where(eq(customers.id, guest.id));
			await tx.update(customers).set({ email: normalizedEmail }).where(eq(customers.id, own.id));
		} else if (guest) {
			// An account with no profile yet (e.g. created through the auth API directly)
			// simply takes the guest row over.
			await tx.update(customers).set({ userId }).where(eq(customers.id, guest.id));
		} else if (own && !own.email) {
			await tx.update(customers).set({ email: normalizedEmail }).where(eq(customers.id, own.id));
		}
	});
}
