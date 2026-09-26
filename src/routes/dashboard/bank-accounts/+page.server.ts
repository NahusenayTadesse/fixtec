import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { and, asc, eq, ne } from 'drizzle-orm';

import { add, edit, remove } from './schema';
import { db } from '$lib/server/db';
import { bankAccounts, paymentMethods } from '$lib/server/db/schema';
import { CHAPA_METHOD_NAME } from '$lib/server/payments';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [form, editForm, deleteForm] = await Promise.all([
		superValidate(zod4(add)),
		superValidate(zod4(edit)),
		superValidate(zod4(remove))
	]);

	const allData = await db
		.select({
			id: bankAccounts.id,
			paymentMethod: bankAccounts.paymentMethodId,
			paymentMethodName: paymentMethods.name,
			bankName: bankAccounts.bankName,
			accountName: bankAccounts.accountName,
			accountNumber: bankAccounts.accountNumber,
			status: bankAccounts.isActive
		})
		.from(bankAccounts)
		.innerJoin(paymentMethods, eq(bankAccounts.paymentMethodId, paymentMethods.id))
		.orderBy(asc(bankAccounts.bankName), asc(bankAccounts.id));

	// Chapa is paid online, so it never has an account to transfer to.
	const paymentMethodList = await db
		.select({ value: paymentMethods.id, name: paymentMethods.name })
		.from(paymentMethods)
		.where(and(eq(paymentMethods.isActive, true), ne(paymentMethods.name, CHAPA_METHOD_NAME)))
		.orderBy(asc(paymentMethods.name));

	return { form, editForm, deleteForm, allData, paymentMethodList };
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(add));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for errors' }, { status: 400 });
		}

		const { paymentMethod, bankName, accountName, accountNumber, status } = form.data;
		try {
			await db.insert(bankAccounts).values({
				paymentMethodId: paymentMethod,
				bankName,
				accountName,
				accountNumber,
				isActive: status,
				createdBy: locals.user?.id
			});
			return message(form, { type: 'success', text: 'Bank account added' });
		} catch (err) {
			console.error('Add bank account failed:', err);
			return message(form, { type: 'error', text: 'Could not add the bank account' }, { status: 500 });
		}
	},

	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(edit));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for errors' }, { status: 400 });
		}

		const { id, paymentMethod, bankName, accountName, accountNumber, status } = form.data;
		try {
			await db
				.update(bankAccounts)
				.set({
					paymentMethodId: paymentMethod,
					bankName,
					accountName,
					accountNumber,
					isActive: status,
					updatedBy: locals.user?.id
				})
				.where(eq(bankAccounts.id, id));
			return message(form, { type: 'success', text: 'Bank account updated' });
		} catch (err) {
			console.error('Update bank account failed:', err);
			return message(form, { type: 'error', text: 'Could not update the bank account' }, { status: 500 });
		}
	},

	delete: async ({ request }) => {
		const form = await superValidate(request, zod4(remove));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid bank account' }, { status: 400 });
		}

		try {
			await db.delete(bankAccounts).where(eq(bankAccounts.id, form.data.id));
			return message(form, { type: 'success', text: 'Bank account deleted' });
		} catch (err) {
			console.error('Delete bank account failed:', err);
			return message(form, { type: 'error', text: 'Could not delete the bank account' }, { status: 500 });
		}
	}
};
