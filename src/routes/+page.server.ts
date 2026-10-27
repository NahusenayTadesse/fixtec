import { db } from '$lib/server/db';
import { testimonials as paymentMethods } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types.js';
import { localized } from '$lib/localized';

export const load: PageServerLoad = async () => {
	const allPaymentMethods = await db
		.select({
			id: paymentMethods.id,
			name: paymentMethods.name,
			position: paymentMethods.position,
			positionAm: paymentMethods.positionAm,
			avatar: paymentMethods.avatar,
			testimonial: paymentMethods.message,
			testimonialAm: paymentMethods.messageAm
		})
		.from(paymentMethods)
		.then((rows) =>
			rows.map(({ positionAm, testimonialAm, ...t }) => ({
				...t,
				position: localized(t.position, positionAm),
				testimonial: localized(t.testimonial, testimonialAm)
			}))
		);

	return {
		allPaymentMethods
	};
};
