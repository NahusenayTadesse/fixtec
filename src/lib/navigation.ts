import {
	Banknote,
	Building2,
	ChartArea,
	Container,
	Landmark,
	LayoutDashboard,
	ListOrdered,
	Mail,
	Plus,
	Sheet,
	Star,
	Truck,
	UserRoundCog,
	Users
} from '@lucide/svelte';
import type { NavItem, SearchEntry } from '@nahu/admin-kit/navigation';

/** The sidebar and the search palette. */
export const NAVIGATION: NavItem[] = [
	{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
	{ title: 'Customers', url: '/dashboard/customers', icon: Users },
	{ title: 'Orders', url: '/dashboard/orders', icon: ListOrdered },
	{
		title: 'Products',
		url: '/dashboard/products',
		icon: Container,
		items: [
			{ title: 'All Products', url: '/dashboard/products', icon: Sheet },
			{ title: 'Add Product', url: '/dashboard/products/add-products', icon: Plus },
			{ title: 'Suppliers', url: '/dashboard/products/suppliers', icon: Sheet },
			{ title: 'Add Supplier', url: '/dashboard/products/suppliers/add-suppliers', icon: Plus }
		]
	},
	{ title: 'Delivery Address', url: '/dashboard/delivery-address', icon: Truck },
	{ title: 'Bank Accounts', url: '/dashboard/bank-accounts', icon: Landmark },
	{ title: 'Messages', url: '/dashboard/messages', icon: Mail },
	{ title: 'Partner Logos', url: '/dashboard/logos', icon: Building2 },
	{ title: 'Testimonials', url: '/dashboard/testimonials', icon: Star },
	{ title: 'Reports', url: '/dashboard/reports', icon: ChartArea },
	{
		title: 'Admin Panel',
		url: '/dashboard/admin-panel',
		icon: UserRoundCog,
		items: [
			{ title: 'Payment Methods', url: '/dashboard/admin-panel/payment-methods', icon: Banknote },
			{ title: 'Users', url: '/dashboard/admin-panel/users', icon: Users },
			{ title: 'Roles', url: '/dashboard/admin-panel/roles', icon: Users }
		]
	}
];

/** Pages the search palette offers that the sidebar leaves out. */
export const SEARCH_EXTRA: SearchEntry[] = [
	{ label: 'Product Categories', url: '/dashboard/products/categories' },
	{ label: 'Add Roles', url: '/dashboard/admin-panel/roles/add-roles' },
	{ label: 'Add Users', url: '/dashboard/admin-panel/users/add-users' }
];

/** Where each kind of record's page lives, so table cells can link to it. */
export const ENTITIES: Record<string, string> = {
	customer: '/dashboard/customers',
	product: '/dashboard/products/single',
	supplier: '/dashboard/products/suppliers',
	user: '/dashboard/admin-panel/users',
	role: '/dashboard/admin-panel/roles'
};
