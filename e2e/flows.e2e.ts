import { test, expect, type Page } from '@playwright/test';
import { query, envVar } from './db';
import { payOnChapa } from './chapa';
import { BASE_URL } from './base-url';
import { createHmac } from 'node:crypto';

/**
 * End-to-end walk through the storefront, checkout, account and admin dashboard
 * against the dev database. Each run signs up fresh users, so it can be re-run.
 */
const run = Date.now();
// Test users get throwaway mailinator.com addresses: Chapa rejects domains that
// can't receive mail, and a made-up @gmail.com address could be a real person's.
const customer = {
	name: 'Test Customer',
	email: `fixtec-e2e-customer-${run}@mailinator.com`,
	phone: '0911223344',
	password: 'Customer#2026',
	area: 'Bole',
	address: 'Bole Road, Friendship Building, 3rd Floor'
};
const admin = {
	name: 'Test Admin',
	email: `fixtec-e2e-admin-${run}@mailinator.com`,
	phone: '0922334455',
	password: 'AdminTest#2026'
};

test.describe.configure({ mode: 'serial' });

/** Navigates and waits for hydration — clicks on SSR markup before that are dropped. */
async function go(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
}

async function signUp(page: Page, user: { name: string; email: string; phone: string; password: string }) {
	await go(page, '/signup');
	const form = page.locator('form', { has: page.locator('input[name="password"]') });
	await form.locator('input[name="name"]').fill(user.name);
	await form.locator('input[name="email"]').fill(user.email);
	await form.locator('input[name="phone"]').fill(user.phone);
	await form.getByRole('combobox', { name: 'General Address' }).click();
	await page.getByRole('option', { name: customer.area }).click();
	await form.locator('input[name="deliveryAddress"]').fill(customer.address);
	await form.locator('input[name="password"]').fill(user.password);
	await page.getByRole('button', { name: 'Sign Up' }).click();
	await expect(page).not.toHaveURL(/\/signup/);
}

async function logIn(page: Page, user: { email: string; password: string }) {
	await go(page, '/login');
	await page.locator('input[name="email"]').fill(user.email);
	await page.locator('input[name="password"]').fill(user.password);
	await page.getByRole('button', { name: /log ?in|sign ?in/i }).last().click();
	await expect(page).not.toHaveURL(/\/login/);
}

test('customer and admin can sign up', async ({ page }) => {
	await signUp(page, customer);
	const [row] = await query<{ phone: string; address: string; role: string }>(
		`SELECT c.phone, c.address, r.name role FROM customers c
		 JOIN user u ON u.id = c.user_id LEFT JOIN roles r ON r.id = u.role_id WHERE c.email = ?`,
		[customer.email]
	);
	// Phone is normalised to +251 on the way in.
	expect(row).toMatchObject({ phone: '+251911223344', address: 'Bole', role: 'Customer' });

	await page.context().clearCookies();
	await signUp(page, admin);
	await query(`UPDATE user SET role_id = (SELECT id FROM roles WHERE name = 'Admin') WHERE email = ?`, [
		admin.email
	]);
});

async function addToCart(page: Page, productId: number, variant: RegExp, quantity = 1) {
	await go(page, `/shop/single/${productId}`);
	await page.getByRole('button', { name: variant }).click();
	for (let i = 1; i < quantity; i++) await page.getByRole('button', { name: 'Increase quantity' }).click();
	await page.getByRole('button', { name: 'Add to Cart' }).click();
}

async function cartItems(page: Page) {
	return page.evaluate(() => JSON.parse(localStorage.getItem('lalo_bakery') ?? '{"items":[]}').items);
}

async function latestOrder(email: string) {
	const [order] = await query<{
		id: number;
		status: string;
		address: string;
		delivery_address: string;
		fee: string;
		user_id: string | null;
		phone: string;
	}>(
		`SELECT o.id, o.status, o.address, o.delivery_address, o.fee, c.user_id, c.phone
		 FROM orders o JOIN customers c ON c.id = o.customer_id
		 WHERE c.email = ? ORDER BY o.id DESC LIMIT 1`,
		[email]
	);
	const items = await query<{ product_id: number; quantity: number; price: string; amount: string }>(
		'SELECT product_id, quantity, price, amount FROM order_items WHERE order_id = ?',
		[order?.id]
	);
	return { order, items };
}

test('shop search, filters and product pages', async ({ page }) => {
	await go(page, '/shop');
	const cards = page.locator('main a[href^="/shop/single/"] h3');
	await expect(cards.first()).toBeVisible();

	// A literal `%` used to act as a wildcard and return the whole catalogue.
	await page.getByPlaceholder('Search by product name...').fill('%');
	await expect(page).toHaveURL(/search=%25/);
	await expect(cards).toHaveCount(0);

	await page.getByPlaceholder('Search by product name...').fill('Drill');
	await expect(page).toHaveURL(/search=Drill/);
	await expect(cards).toHaveCount(2);

	// Category filter comes from the checkbox label now (it used to be "[object Object]").
	await go(page, '/shop');
	await page.locator('label[for="category-Mechanical Hand Tools"]').click();
	await expect(page).toHaveURL(/categories=Mechanical/);
	await expect(cards).toHaveCount(2);

	// Price bounds come from the catalogue, not a hard-coded 0–2000.
	await go(page, '/shop?max=5000');
	for (const price of await page.locator('main').getByText(/ETB/).allInnerTexts()) {
		const n = Number(price.replace(/[^\d.]/g, ''));
		if (n) expect(n).toBeLessThanOrEqual(5000);
	}

	expect((await page.request.get('/shop/single/abc')).status()).toBe(404);
	expect((await page.request.get('/shop/single/999999')).status()).toBe(404);

	await go(page, '/shop/single/1');
	await expect(page.getByRole('heading', { name: 'Related Products' })).toBeVisible();
	await expect(page).toHaveTitle(/Lalo Fixtec/);
});

test('guest checkout with delivery charges the area fee', async ({ page }) => {
	await addToCart(page, 1, /Combo with Extra Battery/, 2);
	expect(await cartItems(page)).toMatchObject([{ priceId: 2, price: 14800, quantity: 2 }]);

	await go(page, '/checkout');
	const guestEmail = `fixtec-e2e-guest-${run}@mailinator.com`;
	await page.locator('input[name="guestName"]').fill('Guest Buyer');
	await page.locator('input[name="guestEmail"]').fill(guestEmail);
	await page.locator('input[name="guestPhone"]').fill('0933445566');
	await page.getByRole('combobox', { name: 'Delivery Area' }).click();
	await page.getByRole('option', { name: 'Bole' }).click();
	await page.locator('input[name="deliveryAddress"]').fill('Bole Medhanialem, House 12');
	await expect(page.getByText('Total ETB 29,750.00')).toBeVisible();
	await page.getByRole('button', { name: /Complete Order/ }).first().click();

	await expect.poll(() => cartItems(page)).toEqual([]);
	const { order, items } = await latestOrder(guestEmail);
	expect(order).toMatchObject({
		status: 'pending',
		address: 'Bole',
		fee: '150.00',
		user_id: null,
		phone: '+251933445566'
	});
	expect(items).toEqual([{ product_id: 1, quantity: 2, price: '14800.00', amount: 'Combo with Extra Battery' }]);
});

test('checkout re-prices a stale cart before ordering', async ({ page }) => {
	await addToCart(page, 1, /Standard Kit/);
	// Simulate a price that changed since the item went into the cart.
	await page.evaluate(() => {
		const cart = JSON.parse(localStorage.getItem('lalo_bakery')!);
		cart.items[0].price = 1;
		localStorage.setItem('lalo_bakery', JSON.stringify(cart));
	});
	await go(page, '/checkout');
	await expect(page.getByRole('button', { name: /Complete Order — ETB 12,500.00/ }).first()).toBeVisible();
	expect((await cartItems(page))[0].price).toBe(12500);
	await page.evaluate(() => localStorage.removeItem('lalo_bakery'));
});

test('signed-in customer can order for store pickup and see it in their account', async ({ page }) => {
	await logIn(page, customer);
	await addToCart(page, 1, /Standard Kit/);
	await go(page, '/checkout');
	await page.getByText(/Pick up at the shop/).click();
	await expect(page.locator('input[name="deliveryAddress"]')).toHaveCount(0);
	await page.getByRole('button', { name: /Complete Order/ }).first().click();

	await expect.poll(() => cartItems(page)).toEqual([]);
	const { order } = await latestOrder(customer.email);
	expect(order).toMatchObject({ status: 'pending', address: 'Store Pickup', fee: '0.00' });

	for (const url of ['/account', '/account/orders', '/account/history', '/account/settings']) {
		const res = await page.goto(url);
		expect(res?.status(), url).toBe(200);
	}
	await go(page, '/account/orders');
	await expect(page.getByText(`#${order.id}`).first()).toBeVisible();
	await expect(page).toHaveTitle(/Lalo Fixtec/);
});

test('non-admins cannot load or post to the dashboard', async ({ page }) => {
	await logIn(page, customer);
	expect((await page.goto('/dashboard'))?.status()).toBe(404);
	// Form actions run before any load, so this is the hook's check, not the layout's.
	const res = await page.request.post('/dashboard/customers?/addCustomer', {
		form: { name: 'Should Not Exist', phone: '0911000000' },
		headers: { origin: BASE_URL }
	});
	expect(res.status()).toBe(404);
	expect(await query("SELECT id FROM customers WHERE name = 'Should Not Exist'")).toHaveLength(0);

	await page.context().clearCookies();
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login/);
});

test('admin dashboard pages load', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await logIn(page, admin);
	await expect(page).toHaveURL(/\/dashboard/);
	for (const url of [
		'/dashboard',
		'/dashboard/orders',
		'/dashboard/customers',
		'/dashboard/products',
		'/dashboard/products/inactive',
		'/dashboard/products/add-products',
		'/dashboard/delivery-address',
		'/dashboard/messages',
		'/dashboard/reports',
		'/dashboard/testimonials',
		'/dashboard/logos',
		'/dashboard/admin-panel/users',
		'/dashboard/admin-panel/payment-methods'
	]) {
		const res = await page.goto(url);
		expect(res?.status(), url).toBe(200);
		await page.waitForLoadState('networkidle');
	}
	expect(errors).toEqual([]);
});

test('admin marks an order delivered', async ({ page }) => {
	const { order } = await latestOrder(customer.email);
	await logIn(page, admin);
	await go(page, '/dashboard/orders');
	const row = page.getByRole('row').filter({ hasText: customer.email });
	await row.getByRole('cell').nth(-2).getByRole('button').click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText(`Edit Order #${order.id}`);
	await dialog.getByRole('combobox', { name: 'Status' }).click();
	await page.getByRole('option', { name: /delivered/i }).click();
	// Delivered orders need a payment method; the action refuses without one.
	await dialog.getByRole('combobox').filter({ hasText: /payment method/i }).click();
	await page.getByRole('option', { name: 'CBE Bank' }).click();
	await dialog.getByRole('button', { name: 'Save Changes' }).click();

	await expect
		.poll(async () => (await query(
			`SELECT o.status, o.delivered_at, o.address, o.fee, t.payment_status
			 FROM orders o LEFT JOIN transactions t ON t.id = o.transaction_id WHERE o.id = ?`,
			[order.id]))[0])
		.toMatchObject({
			status: 'delivered',
			delivered_at: expect.any(Date),
			// Still recognisable as a pickup order, and still free.
			address: 'Store Pickup',
			fee: '0.00',
			payment_status: 'paid'
		});

	await go(page, '/dashboard/orders?status=delivered');
	await expect(page.getByRole('row').filter({ hasText: customer.email })).toHaveCount(1);
});

test('admin adds a walk-in customer without an email', async ({ page }) => {
	const name = `Walk-in ${run}`;
	await logIn(page, admin);
	await go(page, '/dashboard/customers');
	await page.getByRole('button', { name: '+ Add New Customer' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.locator('input[name="name"]').fill(name);
	// Unique per run: the action rejects a phone number that's already on file.
	const phone = `094${String(run).slice(-7)}`;
	await dialog.locator('input[name="phone"]').fill(phone);
	await dialog.getByRole('button', { name: /Add Customer/ }).click();
	await expect(dialog).toBeHidden();

	await expect
		.poll(async () => (await query('SELECT email, user_id, phone FROM customers WHERE name = ?', [name]))[0])
		.toMatchObject({ email: null, user_id: null, phone: `+251${phone.slice(1)}` });
	// The new row shows without a reload — it used to land on a hidden second page.
	await expect(page.locator('tbody tr').filter({ hasText: new RegExp(name, 'i') })).toBeVisible();
});

test('logging out clears the cart', async ({ page }) => {
	await logIn(page, customer);
	await addToCart(page, 1, /Standard Kit/);
	expect(await cartItems(page)).toHaveLength(1);
	await go(page, '/');
	await page.getByRole('button', { name: customer.name.charAt(0) }).first().click();
	await page.getByRole('button', { name: /log ?out/i }).first().click();
	await expect(page).toHaveURL(/\/login/);
	await expect.poll(() => cartItems(page)).toEqual([]);
});

/**
 * Visits every page and fails on anything that went wrong while loading it: a
 * non-2xx page, a failed same-origin request (missing asset, broken endpoint), or
 * an uncaught browser error. Missing uploaded files are reported separately since
 * they're data, not code.
 */
test('every page loads cleanly', async ({ page }) => {
	const [ids] = await Promise.all([
		query<{ product: number; customer: number; supplier: number; role: number; user: string }>(
			`SELECT (SELECT MIN(id) FROM products) product, (SELECT MIN(id) FROM customers) customer,
			        (SELECT MIN(id) FROM product_suppliers) supplier, (SELECT MIN(id) FROM roles) role,
			        (SELECT id FROM user WHERE email = ?) user`,
			[admin.email]
		)
	]);
	const { product, customer: cust, supplier, role, user } = ids[0];

	const publicPages = ['/', '/about-us', '/contact-us', '/shop', `/shop/single/${product}`, '/new-arrival',
		'/industries', '/recipes', '/checkout', '/login', '/signup', '/forgot-password'];
	const customerPages = ['/account', '/account/orders', '/account/history', '/account/settings',
		'/account/settings/change-password', '/orders'];
	const adminPages = ['/dashboard', '/dashboard/admin-panel', '/dashboard/admin-panel/payment-methods',
		'/dashboard/admin-panel/roles', '/dashboard/admin-panel/roles/add-roles', `/dashboard/admin-panel/roles/${role}`,
		'/dashboard/admin-panel/users', '/dashboard/admin-panel/users/add-users', `/dashboard/admin-panel/users/${user}`,
		'/dashboard/customers', `/dashboard/customers/${cust}`, `/dashboard/customers/${cust}/history`,
		'/dashboard/delivery-address', '/dashboard/logos', '/dashboard/messages', '/dashboard/orders',
		'/dashboard/products', '/dashboard/products/add-products', '/dashboard/products/categories',
		'/dashboard/products/inactive', `/dashboard/products/single/${product}`,
		`/dashboard/products/single/${product}/damaged`, `/dashboard/products/single/${product}/ranges`,
		'/dashboard/products/suppliers', '/dashboard/products/suppliers/add-suppliers',
		`/dashboard/products/suppliers/${supplier}`, '/dashboard/reports', '/dashboard/testimonials'];

	const problems: string[] = [];
	const missingUploads = new Set<string>();
	let current = '';
	page.on('pageerror', (e) => problems.push(`${current}: page error: ${e.message.split('\n')[0]}`));
	page.on('response', (r) => {
		const url = new URL(r.url());
		if (url.origin !== BASE_URL || r.status() < 400) return;
		if (url.pathname.startsWith('/files/')) missingUploads.add(decodeURIComponent(url.pathname));
		else problems.push(`${current}: ${r.status()} ${url.pathname}`);
	});

	async function visit(urls: string[]) {
		for (const url of urls) {
			current = url;
			const res = await page.goto(url);
			if ((res?.status() ?? 0) >= 400) problems.push(`${url}: page returned ${res?.status()}`);
			await page.waitForLoadState('networkidle');
		}
	}

	await visit(publicPages);
	await logIn(page, customer);
	await visit(customerPages);
	await page.context().clearCookies();
	await logIn(page, admin);
	await visit(adminPages);

	if (missingUploads.size) console.log('Missing uploaded files (data):', [...missingUploads]);
	expect(problems).toEqual([]);
});

test('admin creates a store-pickup order from the dashboard', async ({ page }) => {
	await logIn(page, admin);
	await go(page, '/dashboard/orders');
	await page.getByRole('button', { name: '+ Add New Order' }).click();
	const dialog = page.getByRole('dialog');

	await dialog.getByRole('combobox').filter({ hasText: /select customer/i }).click();
	await page.getByRole('option', { name: new RegExp(`Walk-in ${run}`, 'i') }).click();
	await dialog.getByRole('button', { name: /No products yet/ }).click();
	await dialog.getByRole('combobox').filter({ hasText: /search products/i }).click();
	await page.getByRole('option', { name: /Tool Only/ }).click();
	// Pickup is offered alongside the delivery areas now.
	await dialog.getByRole('combobox', { name: 'Delivery Area' }).click();
	await page.getByRole('option', { name: 'Store Pickup' }).click();
	await dialog.getByRole('button', { name: 'Add Order' }).click();
	await expect(dialog).toBeHidden();

	const [order] = await query<{ address: string; fee: string; status: string; price: string }>(
		`SELECT o.address, o.fee, o.status, oi.price FROM orders o
		 JOIN customers c ON c.id = o.customer_id JOIN order_items oi ON oi.order_id = o.id
		 WHERE c.name = ? ORDER BY o.id DESC LIMIT 1`,
		[`Walk-in ${run}`]
	);
	expect(order).toEqual({ address: 'Store Pickup', fee: '0.00', status: 'pending', price: '9500.00' });

	// And it reads back as pickup when opened for editing.
	const row = page.getByRole('row').filter({ hasText: new RegExp(`Walk-in ${run}`, 'i') });
	await row.getByRole('cell').nth(-2).getByRole('button').click();
	await expect(page.getByRole('dialog').getByRole('combobox').filter({ hasText: 'Store Pickup' })).toBeVisible();
});

test('customer changes their password', async ({ page }) => {
	const newPassword = 'Changed#2026x';
	await logIn(page, customer);
	await go(page, '/account/settings/change-password');
	await page.locator('input[name="currentPassword"]').fill(customer.password);
	await page.locator('input[name="newPassword"]').fill(newPassword);
	await page.locator('input[name="confirmPassword"]').fill(newPassword);
	await page.getByRole('button', { name: 'Change Password' }).click();
	await expect(page.getByText(/password (changed|updated)/i).first()).toBeVisible();

	await page.context().clearCookies();
	await logIn(page, { email: customer.email, password: newPassword });
	await expect(page).not.toHaveURL(/\/login/);
	customer.password = newPassword;
});

// --- Chapa -------------------------------------------------------------------

type Payment = { id: number; txn_ref: string | null; settled_txn_ref: string | null; payment_status: string; amount: string; method: string | null };

async function payment(orderId: number) {
	const [row] = await query<Payment>(
		`SELECT o.id, t.txn_ref, t.settled_txn_ref, t.payment_status, t.amount, pm.name method
		 FROM orders o JOIN transactions t ON t.id = o.transaction_id
		 LEFT JOIN payment_methods pm ON pm.id = t.payment_method_id WHERE o.id = ?`,
		[orderId]
	);
	return row;
}

const onlineGuest = `fixtec-e2e-payer-${run}@mailinator.com`;
let paidOrder: { id: number; ref: string };

test('guest pays online with Chapa', async ({ page }) => {
	await addToCart(page, 1, /Standard Kit/);
	await go(page, '/checkout');
	await page.locator('input[name="guestName"]').fill('Online Payer');
	await page.locator('input[name="guestEmail"]').fill(onlineGuest);
	await page.locator('input[name="guestPhone"]').fill('0911998877');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByText('Pay online with Chapa', { exact: true }).click();
	await page.getByRole('button', { name: /Complete Order & Pay — ETB 12,500.00/ }).first().click();
	await payOnChapa(page);

	const { order } = await latestOrder(onlineGuest);
	const paid = await payment(order.id);
	expect(paid).toMatchObject({ payment_status: 'paid', amount: '12500.00', method: 'Chapa' });
	expect(paid.settled_txn_ref).toBe(paid.txn_ref);
	expect(await cartItems(page)).toEqual([]);
	paidOrder = { id: order.id, ref: paid.txn_ref! };

	// Coming back to the page again is harmless: it reports, it doesn't re-settle.
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Payment received' })).toBeVisible();
	expect(await payment(order.id)).toEqual(paid);
});

test('an abandoned Chapa payment can be retried', async ({ page }) => {
	await logIn(page, customer);
	await addToCart(page, 1, /Standard Kit/);
	await go(page, '/checkout');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByText('Pay online with Chapa', { exact: true }).click();
	await page.getByRole('button', { name: /Complete Order & Pay/ }).first().click();
	await page.waitForURL(/checkout\.chapa\.co/, { timeout: 30_000 });

	// The customer leaves Chapa without paying and comes back.
	const { order } = await latestOrder(customer.email);
	const first = await payment(order.id);
	await go(page, `/checkout/payment?ref=${first.txn_ref}`);
	await expect(page.getByRole('heading', { name: 'Payment not confirmed yet' })).toBeVisible();
	expect((await payment(order.id)).payment_status).toBe('pending');

	await page.getByRole('button', { name: /Pay ETB 12,500.00 with Chapa/ }).click();
	await payOnChapa(page);
	const second = await payment(order.id);
	expect(second.txn_ref).not.toBe(first.txn_ref);
	expect(second).toMatchObject({ payment_status: 'paid', settled_txn_ref: second.txn_ref });

	// The replaced reference no longer leads anywhere.
	expect((await page.request.get(`/checkout/payment?ref=${first.txn_ref}`)).status()).toBe(404);
});

test('a customer can pay a pending order from their account', async ({ page }) => {
	await logIn(page, customer);
	await addToCart(page, 2, /Tool Only/);
	await go(page, '/checkout');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByRole('button', { name: /^Complete Order —/ }).first().click();
	await expect.poll(() => cartItems(page)).toEqual([]);
	const { order } = await latestOrder(customer.email);

	await go(page, '/account/orders');
	const card = page.locator('div').filter({ hasText: `Order ID: #${order.id}` }).filter({ has: page.getByRole('button', { name: 'Pay online' }) }).last();
	await card.getByRole('button', { name: 'Pay online' }).click();
	await payOnChapa(page);
	expect((await payment(order.id)).payment_status).toBe('paid');

	await go(page, '/account/orders');
	const paidCard = page.locator('div').filter({ hasText: `Order ID: #${order.id}` }).last();
	await expect(paidCard.getByText('Paid', { exact: true })).toBeVisible();
	await expect(paidCard.getByRole('button', { name: 'Pay online' })).toHaveCount(0);
});

test('the Chapa webhook only settles verified payments', async ({ page }) => {
	const secret = envVar('CHAPA_WEBHOOK_SECRET');
	const send = (body: object, sign = true) => {
		const raw = JSON.stringify(body);
		return page.request.post('/api/chapa/webhook', {
			data: raw,
			headers: {
				'content-type': 'application/json',
				...(sign ? { 'chapa-signature': createHmac('sha256', secret).update(raw).digest('hex') } : {})
			}
		});
	};

	expect((await send({ tx_ref: paidOrder.ref }, false)).status()).toBe(401);
	expect(await (await send({ tx_ref: 'fx0-unknown' })).json()).toMatchObject({ settled: false });
	expect(await (await send({ tx_ref: paidOrder.ref })).json()).toMatchObject({ settled: true });

	// A correctly signed webhook for a payment that never happened settles nothing:
	// the order is only marked paid after Chapa itself confirms it.
	await logIn(page, customer);
	await addToCart(page, 2, /Tool Only/);
	await go(page, '/checkout');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByText('Pay online with Chapa', { exact: true }).click();
	await page.getByRole('button', { name: /Complete Order & Pay/ }).first().click();
	await page.waitForURL(/checkout\.chapa\.co/, { timeout: 30_000 });
	const { order } = await latestOrder(customer.email);
	const unpaid = await payment(order.id);

	const res = await send({ tx_ref: unpaid.txn_ref, status: 'success' });
	expect(res.status()).toBe(503);
	expect((await payment(order.id)).payment_status).toBe('pending');
});

test('staff editing an order paid online keeps it paid', async ({ page }) => {
	const before = await payment(paidOrder.id);
	await logIn(page, admin);
	await go(page, '/dashboard/orders');
	const row = page.getByRole('row').filter({ hasText: onlineGuest });
	await expect(row.getByText('paid', { exact: true })).toBeVisible();
	await row.getByRole('cell').nth(-2).getByRole('button').click();
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('combobox', { name: 'Status' }).click();
	await page.getByRole('option', { name: /delivered/i }).click();
	await dialog.getByRole('button', { name: 'Save Changes' }).click();

	await expect.poll(async () => (await query<{ status: string }>('SELECT status FROM orders WHERE id = ?', [paidOrder.id]))[0].status).toBe('delivered');
	expect(await payment(paidOrder.id)).toEqual(before);
});

// --- Bank transfer -------------------------------------------------------------

/** A tiny but valid PDF: the upload component passes PDFs through untouched. */
const receiptPdf = {
	name: 'transfer-receipt.pdf',
	mimeType: 'application/pdf',
	buffer: Buffer.from(
		'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
	)
};
const accountNumber = `1000${String(run).slice(-9)}`;
const bankName = `E2E Bank ${run}`;

test('admin manages the company bank accounts', async ({ page }) => {
	await logIn(page, admin);
	await go(page, '/dashboard/bank-accounts');

	await page.getByRole('button', { name: 'Add Bank Account' }).first().click();
	const add = page.getByRole('dialog');
	await add.getByRole('combobox', { name: /payment method/i }).click();
	await page.getByRole('option', { name: 'CBE Bank' }).click();
	await add.locator('input[name="bankName"]').fill(bankName);
	await add.locator('input[name="accountName"]').fill('Lalo Fixtec PLC');
	await add.locator('input[name="accountNumber"]').fill('999');
	await add.getByRole('button', { name: 'Add Bank Account' }).click();
	await expect(add.getByText(/digits only/).first()).toBeVisible(); // too short

	await add.locator('input[name="accountNumber"]').fill(accountNumber);
	await add.getByRole('button', { name: 'Add Bank Account' }).click();
	await expect(add).toBeHidden();
	const row = page.getByRole('row').filter({ hasText: bankName });
	await expect(row).toContainText(accountNumber);
	await expect(row).toContainText('CBE Bank');

	// Deactivated accounts disappear from checkout…
	await row.getByRole('cell').nth(-2).getByRole('button').click();
	const edit = page.getByRole('dialog');
	await edit.getByRole('combobox', { name: 'Status' }).click();
	await page.getByRole('option', { name: /Inactive/ }).click();
	await edit.getByRole('button', { name: 'Save Changes' }).click();
	await expect(edit).toBeHidden();
	await expect(row.getByText('inactive')).toBeVisible();
	await page.context().clearCookies();
	await addToCart(page, 1, /Standard Kit/);
	await go(page, '/checkout');
	await expect(page.getByText(bankName)).toHaveCount(0);

	// …and come back when reactivated.
	await logIn(page, admin);
	await go(page, '/dashboard/bank-accounts');
	await row.getByRole('cell').nth(-2).getByRole('button').click();
	await edit.getByRole('combobox', { name: 'Status' }).click();
	await page.getByRole('option', { name: /Active — shown/ }).click();
	await edit.getByRole('button', { name: 'Save Changes' }).click();
	await expect(row.getByText('active', { exact: true })).toBeVisible();

	// A throwaway account to check delete.
	await page.getByRole('button', { name: 'Add Bank Account' }).first().click();
	await add.getByRole('combobox', { name: /payment method/i }).click();
	await page.getByRole('option', { name: 'CBE Bank' }).click();
	await add.locator('input[name="bankName"]').fill(`Delete Me ${run}`);
	await add.locator('input[name="accountName"]').fill('Nobody');
	await add.locator('input[name="accountNumber"]').fill('1234567');
	await add.getByRole('button', { name: 'Add Bank Account' }).click();
	const doomed = page.getByRole('row').filter({ hasText: `Delete Me ${run}` });
	await doomed.getByRole('cell').last().getByRole('button').click();
	await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
	await expect(doomed).toHaveCount(0);
});

test('customer pays by bank transfer and uploads the receipt', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const email = `fixtec-e2e-transfer-${run}@mailinator.com`;
	await addToCart(page, 1, /Standard Kit/);
	await go(page, '/checkout');
	await page.locator('input[name="guestName"]').fill('Transfer Payer');
	await page.locator('input[name="guestEmail"]').fill(email);
	await page.locator('input[name="guestPhone"]').fill('0911557799');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByText('Bank transfer', { exact: true }).click();

	// The company's accounts, each with a working copy button.
	const account = page.getByRole('listitem').filter({ hasText: bankName });
	await expect(account).toContainText(accountNumber);
	await account.getByRole('button', { name: `Copy ${bankName} account number` }).click();
	await expect(page.getByText(`${bankName} account number copied`)).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(accountNumber);

	// No receipt, no order.
	await page.getByRole('button', { name: /^Complete Order —/ }).first().click();
	await expect(page.getByText('Choose how you paid').first()).toBeVisible();
	await expect(page.getByText('Upload your transfer receipt').first()).toBeVisible();
	expect(await query('SELECT id FROM customers WHERE email = ?', [email])).toHaveLength(0);

	await page.getByRole('combobox', { name: /payment method/i }).click();
	await page.getByRole('option', { name: 'CBE Bank' }).click();
	await page.locator('input[type="file"][name="reciept"]').setInputFiles(receiptPdf);
	await expect(page.getByText('transfer-receipt.pdf')).toBeVisible();
	await page.getByRole('button', { name: /^Complete Order —/ }).first().click();
	await expect.poll(() => cartItems(page)).toEqual([]);

	const { order } = await latestOrder(email);
	const [paid] = await query<{ payment_status: string; method: string; reciept_link: string; amount: string }>(
		`SELECT t.payment_status, pm.name method, t.reciept_link, t.amount FROM orders o
		 JOIN transactions t ON t.id = o.transaction_id JOIN payment_methods pm ON pm.id = t.payment_method_id
		 WHERE o.id = ?`,
		[order.id]
	);
	// Waiting for staff to check the receipt by hand.
	expect(paid).toMatchObject({ payment_status: 'pending', method: 'CBE Bank', amount: '12500.00' });
	expect(paid.reciept_link).toMatch(/\.pdf$/);

	// Receipts are private: not for anonymous visitors, visible to staff.
	await page.context().clearCookies();
	expect((await page.request.get(`/files/${paid.reciept_link}`)).status()).toBe(404);
	await logIn(page, admin);
	await go(page, '/dashboard/orders');
	const row = page.getByRole('row').filter({ hasText: email });
	await expect(row.getByRole('link', { name: 'View' })).toHaveAttribute('href', `/files/${paid.reciept_link}`);
	expect((await page.request.get(`/files/${paid.reciept_link}`)).status()).toBe(200);
});

test("if Chapa doesn't work out, the customer can switch to a bank transfer", async ({ page }) => {
	await logIn(page, customer);
	await addToCart(page, 2, /Tool Only/);
	await go(page, '/checkout');
	await page.getByText(/Pick up at the shop/).click();
	await page.getByText('Pay online with Chapa', { exact: true }).click();
	await page.getByRole('button', { name: /Complete Order & Pay/ }).first().click();
	// Either Chapa opens (and the customer comes back without paying), or Chapa
	// can't be reached and the customer lands on the payment page straight away —
	// both end up offering the bank transfer.
	await page.waitForURL(/checkout\.chapa\.co|\/checkout\/payment\?ref=/, { timeout: 30_000 });

	const { order } = await latestOrder(customer.email);
	const { txn_ref } = await payment(order.id);
	await go(page, `/checkout/payment?ref=${txn_ref}`);
	await page.getByRole('button', { name: 'Pay by bank transfer' }).click();
	await expect(page.getByRole('listitem').filter({ hasText: bankName })).toBeVisible();
	await page.getByRole('combobox', { name: /payment method/i }).click();
	await page.getByRole('option', { name: 'CBE Bank' }).click();
	await page.locator('input[type="file"][name="reciept"]').setInputFiles(receiptPdf);
	await page.getByRole('button', { name: 'Send receipt' }).click();
	await expect(page.getByRole('heading', { name: 'Receipt received' })).toBeVisible();

	const after = await payment(order.id);
	expect(after).toMatchObject({ payment_status: 'pending', method: 'CBE Bank' });

	await go(page, '/account/orders');
	const card = page.locator('div').filter({ hasText: `Order ID: #${order.id}` }).last();
	await expect(card.getByText('Receipt sent — awaiting check')).toBeVisible();
	await expect(card.getByRole('button', { name: 'Pay online' })).toHaveCount(0);
});
