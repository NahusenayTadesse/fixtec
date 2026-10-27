import { db } from '$lib/server/db';
import { products, productCategories, prices } from '$lib/server/db/schema';
import { eq, and, gte, inArray, asc, sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { localized } from '$lib/localized';

export const load: LayoutServerLoad = async () => {
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	// Same one-row-per-product rule as the shop listing: the card shows the cheapest
	// variant, and its id, price and label all come from that one `prices` row.
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
		.where(and(eq(products.isActive, true), gte(products.createdAt, oneMonthAgo)))
		.orderBy(asc(products.createdAt), asc(products.id));

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
				// `id` identifies the variant — the cart keys on it and checkout re-prices from it.
				id: price.id,
				amount: localized(price.amount, price.amountAm),
				price: price.price
			}))
	}));

	return {
		productList
	};
};
