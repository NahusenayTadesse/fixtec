import { db } from '$lib/server/db';
import { products, productCategories, productSuppliers, prices } from '$lib/server/db/schema';
import { eq, inArray, or, like, count, asc } from 'drizzle-orm';
import {
	buildWhere,
	contains,
	facetCounts,
	orderBy,
	parseTableQuery,
	serverTable
} from '$lib/server/table';

/**
 * The product list behind both `/dashboard/products` and `/dashboard/products/inactive` — the
 * same table, split by `isActive`. Search, the category/supplier column filters, sorting and
 * paging are all SQL; the table only renders the page it is handed.
 */
export async function loadProductList(url: URL, isActive: boolean) {
	const query = parseTableQuery(url, ['category', 'supplier'], 20, [
		'name',
		'category',
		'supplier'
	]);

	const spec = {
		base: [eq(products.isActive, isActive)],
		search: (term: string) =>
			or(
				like(products.name, contains(term)),
				like(products.nameAm, contains(term)),
				like(products.description, contains(term))
			),
		filters: {
			category: (v: string) => eq(products.categoryId, Number(v)),
			supplier: (v: string) => eq(products.supplierId, Number(v))
		}
	};
	const where = buildWhere(query, spec);

	const [productsData, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: products.id,
				name: products.name,
				image: products.featuredImage,
				category: productCategories.name,
				description: products.description,
				quantity: products.quantity,
				supplier: productSuppliers.name
			})
			.from(products)
			.leftJoin(productCategories, eq(productCategories.id, products.categoryId))
			.leftJoin(productSuppliers, eq(productSuppliers.id, products.supplierId))
			.where(where)
			// `id` last: without a total order, LIMIT/OFFSET pages could repeat or skip products.
			.orderBy(
				...(orderBy(query, {
					name: products.name,
					category: productCategories.name,
					supplier: productSuppliers.name
				}) ?? []),
				asc(products.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db
			.select({ total: count(products.id) })
			.from(products)
			.where(where),
		facetCounts({
			category: () =>
				db
					.select({ value: productCategories.id, label: productCategories.name, count: count() })
					.from(products)
					.innerJoin(productCategories, eq(productCategories.id, products.categoryId))
					.where(buildWhere(query, spec, { except: 'category' }))
					.groupBy(productCategories.id, productCategories.name),
			supplier: () =>
				db
					.select({ value: productSuppliers.id, label: productSuppliers.name, count: count() })
					.from(products)
					.innerJoin(productSuppliers, eq(productSuppliers.id, products.supplierId))
					.where(buildWhere(query, spec, { except: 'supplier' }))
					.groupBy(productSuppliers.id, productSuppliers.name)
		})
	]);

	const productIds = productsData.map((p) => p.id);
	const relevantPrices = productIds.length
		? await db.select().from(prices).where(inArray(prices.productId, productIds))
		: [];

	const productList = productsData.map((p) => ({
		...p,
		priceList: relevantPrices
			.filter((price) => price.productId === p.id)
			.map((price) => ({
				amount: price.amount + ' Pieces',
				price: 'ETB ' + price.price
			}))
	}));

	return {
		productList,
		table: serverTable(query, total, facets),
		/** Whether anything narrows the list — an empty filtered list still needs its table. */
		filtered: Boolean(query.search || Object.values(query.filters).some(Boolean))
	};
}
