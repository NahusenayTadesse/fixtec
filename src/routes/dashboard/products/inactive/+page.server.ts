import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { loadProductList } from '../list.server';

export const load: PageServerLoad = async ({ url }) => loadProductList(url, false);

export const actions: Actions = {
	bulkActivate: async ({ request, cookies }) => {
		const formData = await request.formData();
		const ids = formData
			.getAll('ids')
			.map((id) => Number(id))
			.filter((id) => Number.isInteger(id));

		if (ids.length === 0) {
			setFlash({ type: 'error', message: 'No products selected' }, cookies);
			return fail(400);
		}

		try {
			await db.update(products).set({ isActive: true }).where(inArray(products.id, ids));
			setFlash(
				{ type: 'success', message: `${ids.length} product(s) activated successfully!` },
				cookies
			);
		} catch (err) {
			console.error('Error bulk activating products:', err);
			setFlash({ type: 'error', message: `Unexpected Error: ${(err as Error)?.message}` }, cookies);
			return fail(400);
		}
	}
};
