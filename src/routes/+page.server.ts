import { db } from '$lib/server/db';
import {
	testimonials as paymentMethods,
	products,
	productCategories,
	prices
} from '$lib/server/db/schema';
import { desc, eq, inArray, asc, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import { localized } from '$lib/localized';

/** How many products the homepage carousel shows; the shop has the rest. */
const CAROUSEL_SIZE = 12;

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

	// Same one-row-per-product rule as the shop: the card's variant is the cheapest one, and its
	// id, price and label all come from that single `prices` row.
	const cheapestVariant = sql`${prices.id} = (
		SELECT p2.id FROM prices AS p2
		WHERE p2.product_id = ${products.id}
		ORDER BY p2.price ASC, p2.id ASC
		LIMIT 1
	)`;

	const productsData = await db
		.select({
			productId: products.id,
			productName: products.name,
			productNameAm: products.nameAm,
			priceId: prices.id,
			price: prices.price,
			amount: prices.amount,
			amountAm: prices.amountAm,
			image: products.featuredImage,
			category: productCategories.name,
			categoryAm: productCategories.nameAm
		})
		.from(products)
		.leftJoin(productCategories, eq(productCategories.id, products.categoryId))
		.innerJoin(prices, cheapestVariant)
		.where(eq(products.isActive, true))
		.orderBy(desc(products.createdAt), desc(products.id))
		.limit(CAROUSEL_SIZE);

	const productIds = productsData.map((p) => p.productId);
	const allPrices = productIds.length
		? await db
				.select()
				.from(prices)
				.where(inArray(prices.productId, productIds))
				.orderBy(asc(prices.price), asc(prices.id))
		: [];

	const productList = productsData.map(({ productNameAm, amountAm, categoryAm, ...p }) => ({
		...p,
		productName: localized(p.productName, productNameAm),
		amount: localized(p.amount, amountAm),
		category: localized(p.category, categoryAm),
		priceList: allPrices
			.filter((price) => price.productId === p.productId)
			.map((price) => ({
				id: price.id,
				amount: localized(price.amount, price.amountAm),
				price: price.price
			}))
	}));

	return {
		allPaymentMethods,
		productList
	};
};
