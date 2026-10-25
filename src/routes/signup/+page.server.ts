// import { encodeBase32LowerCase } from '@oslojs/encoding';

import type { Actions, PageServerLoad } from './$types';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { add } from './schema';
import { normalizeEthiopianPhone } from '$lib/validators/phone';
import { redirect } from 'sveltekit-flash-message/server';
import { auth } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { customerWelcomeTemplate, sendEmail } from '$lib/server/email';

import { db } from '$lib/server/db';
import { APIError } from 'better-auth';
import { roles, user, customers, placeNames } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const roleName = await db
			.select({ name: roles.name })
			.from(user)
			.leftJoin(roles, eq(user.roleId, roles.id))
			.where(eq(user.id, event.locals.user.id))
			.then((rows) => rows[0]);

		if (roleName.name === 'Admin') {
			return redirect(302, '/dashboard');
		} else return redirect(302, '/');
	}
	const form = await superValidate(zod4(add));

	const placeList = await db
		.select({
			value: placeNames.name,
			name: placeNames.name
		})
		.from(placeNames)
		.where(eq(placeNames.isActive, true));

	return { form, placeList };
};

export const actions: Actions = {
	signup: async (event) => {
		const form = await superValidate(event.request, zod4(add));
		if (!form.valid) {
			return message(
				form,
				{
					type: 'error',
					text: 'Please check the form for errors'
				},
				{
					status: 400
				}
			);
		}

		const { name, email, password, address, deliveryAddress } = form.data;
		// Already validated by the schema; normalised here so `customers.phone` holds
		// one shape (`+251XXXXXXXXX`) whichever form was typed.
		const phone = normalizeEthiopianPhone(form.data.phone) as string;

		// better-auth stores emails lowercased; guest checkout does the same.
		const normalizedEmail = email.trim().toLowerCase();

		// Someone who checked out as a guest already has a `customers` row under this
		// email (`user_id` NULL), and `customers.email` is UNIQUE. Inserting a second
		// row used to fail after better-auth had already written the `user`, leaving an
		// account with no profile that could neither check out nor sign up again.
		// The guest row is *not* claimed here — that would hand its orders and receipts
		// to anyone who typed the email. The account gets its own profile without an
		// email, and the guest orders follow once the email is verified (`mergeGuestCustomer`).
		const existingCustomer = await db
			.select({ id: customers.id, userId: customers.userId })
			.from(customers)
			.where(eq(customers.email, normalizedEmail))
			.limit(1)
			.then((rows) => rows[0]);

		if (existingCustomer?.userId) {
			setError(form, 'email', 'An account already uses this email. Please sign in instead.');
			return message(
				form,
				{ type: 'error', text: 'An account already uses this email. Please sign in instead.' },
				{ status: 400 }
			);
		}

		const hasGuestOrders = Boolean(existingCustomer);

		let newUserId: string | undefined;
		try {
			// Not inside `db.transaction`: better-auth writes the `user` on its own
			// connection, so a rollback would never undo it. It is deleted by hand below
			// if the profile can't be saved.
			const created = await auth.api.signUpEmail({
				body: {
					email: normalizedEmail,
					password,
					name,
					callbackURL: '/auth/verification-success'
				}
			});
			newUserId = created.user.id;
			const userId = newUserId;

			const roleId = await customerRoleId();

			await db.transaction(async (tx) => {
				await tx.update(user).set({ roleId }).where(eq(user.id, userId));

				await tx.insert(customers).values({
					email: hasGuestOrders ? null : normalizedEmail,
					name,
					phone,
					userId,
					address,
					deliveryAddress
				});
			});
			if (hasGuestOrders) {
				auth.api
					.sendVerificationEmail({ body: { email: normalizedEmail, callbackURL: '/account' } })
					.catch((err) => console.error('Email Error (Verification):', err));
			}

			const { subject, html } = customerWelcomeTemplate(name);

			// Not awaited, so the surrounding try/catch can't see a rejection — without
			// this handler an unreachable mail server crashes the whole process.
			sendEmail(email, subject, html).catch((err) => console.error('Email Error (Welcome):', err));
			return message(form, {
				type: 'success',
				text: hasGuestOrders
					? "Sign Up Successful! Confirm your email from the link we sent and we'll add your earlier orders to your account."
					: 'Sign Up Successful!'
			});
		} catch (error) {
			// Undo the account (its sessions and sign-in rows cascade) so the email is
			// free to register again rather than stuck on a profile-less user.
			if (newUserId) {
				await db
					.delete(user)
					.where(eq(user.id, newUserId))
					.catch((err) => console.error(`Signup: could not remove user ${newUserId}:`, err));
			}
			console.error('Signup failed:', error);
			if (error instanceof APIError) {
				return message(
					form,
					{
						type: 'error',
						text: error?.message
					},
					{
						status: 500
					}
				);
			}
			return message(
				form,
				{
					type: 'error',
					text: 'Registration Failed'
				},
				{
					status: 500
				}
			);
		}
	}
};

/** The role every self-registered account gets. */
const CUSTOMER_ROLE = 'Customer';

/**
 * The id of the `Customer` role, created if missing.
 *
 * Looked up by name: this used to be a hardcoded `roleId: 2`, which only meant
 * "Customer" if the roles happened to be created in that order — on a database
 * where Admin got id 2, every public signup became an admin.
 */
async function customerRoleId(): Promise<number> {
	const find = () =>
		db
			.select({ id: roles.id })
			.from(roles)
			.where(eq(roles.name, CUSTOMER_ROLE))
			.then((rows) => rows[0]?.id);

	const existing = await find();
	if (existing) return existing;

	// `roles.name` is unique, so concurrent first signups can't create two rows.
	await db
		.insert(roles)
		.values({ name: CUSTOMER_ROLE })
		.onDuplicateKeyUpdate({ set: { name: CUSTOMER_ROLE } });
	return (await find())!;
}
