<script lang="ts">
	import { navigateWithQuery } from '@nahu/admin-kit/queryFilters';
	import { columns } from './columns';
	import RevenueTrendChart from './RevenueTrendChart.svelte';
	import OrdersTrendChart from './OrdersTrendChart.svelte';
	import StatusBreakdownChart from './StatusBreakdownChart.svelte';
	import PaymentBreakdownChart from './PaymentBreakdownChart.svelte';
	import CategoryBreakdownChart from './CategoryBreakdownChart.svelte';

	let { data } = $props();

	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '@nahu/admin-kit/components/ui/card/index.js';
	import DataTableLinks from '@nahu/admin-kit/components/Table/data-table-links.svelte';

	import { Wallet, ShoppingCart, Package, Truck, TrendingUp } from '@lucide/svelte';
	import { DATE_PRESETS, formatETB } from '$lib/global.svelte';

	function applyPreset(preset: string) {
		// The preset owns the window, so an explicit one is dropped with it.
		navigateWithQuery({ preset, dateStart: null, dateEnd: null, page: 1 });
	}
</script>

<svelte:head>
	<title>Reports</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 class="text-2xl">Reports</h2>

		<div class="flex flex-row flex-wrap items-center gap-2">
			{#each DATE_PRESETS as preset (preset.value)}
				<Button
					size="sm"
					variant={data.preset === preset.value ? 'default' : 'outline'}
					onclick={() => applyPreset(preset.value)}
				>
					{preset.label}
				</Button>
			{/each}
		</div>
	</div>
</div>

<!-- Stat tiles -->
<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
	<Card class="border-l-4 border-l-emerald-500">
		<CardHeader class="pb-2">
			<CardTitle
				class="flex items-center justify-between text-sm font-medium text-muted-foreground"
			>
				<span>Total Revenue</span>
				<Wallet class="size-4 text-emerald-500" />
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-emerald-600">{formatETB(data.summary.totalRevenue)}</div>
			<p class="mt-1 text-xs text-muted-foreground">
				Line items of {data.status === 'all' ? 'delivered' : data.status} orders
			</p>
		</CardContent>
	</Card>

	<Card class="border-l-4 border-l-indigo-500">
		<CardHeader class="pb-2">
			<CardTitle
				class="flex items-center justify-between text-sm font-medium text-muted-foreground"
			>
				<span>Total Orders</span>
				<ShoppingCart class="size-4 text-indigo-500" />
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-indigo-600">{data.summary.totalOrders}</div>
			<p class="mt-1 text-xs text-muted-foreground">
				{data.summary.statusBreakdown.map((s) => `${s.count} ${s.status}`).join(' · ')}
			</p>
		</CardContent>
	</Card>

	<Card class="border-l-4 border-l-amber-500">
		<CardHeader class="pb-2">
			<CardTitle
				class="flex items-center justify-between text-sm font-medium text-muted-foreground"
			>
				<span>Avg Order Value</span>
				<TrendingUp class="size-4 text-amber-500" />
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-amber-600">
				{formatETB(data.summary.averageOrderValue)}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">
				Revenue / {data.status === 'all' ? 'delivered' : data.status} orders
			</p>
		</CardContent>
	</Card>

	<Card class="border-l-4 border-l-violet-500">
		<CardHeader class="pb-2">
			<CardTitle
				class="flex items-center justify-between text-sm font-medium text-muted-foreground"
			>
				<span>Items Sold</span>
				<Package class="size-4 text-violet-500" />
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-violet-600">{data.summary.totalItemsSold}</div>
			<p class="mt-1 text-xs text-muted-foreground">Units across all orders</p>
		</CardContent>
	</Card>

	<Card class="border-l-4 border-l-sky-500">
		<CardHeader class="pb-2">
			<CardTitle
				class="flex items-center justify-between text-sm font-medium text-muted-foreground"
			>
				<span>Delivery Fees</span>
				<Truck class="size-4 text-sky-500" />
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-sky-600">{formatETB(data.summary.totalDeliveryFees)}</div>
			<p class="mt-1 text-xs text-muted-foreground">Collected from customers</p>
		</CardContent>
	</Card>
</div>

<!-- Trend charts -->
<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
	<RevenueTrendChart trend={data.summary.dailyTrend} />
	<OrdersTrendChart trend={data.summary.dailyTrend} />
</div>

<!-- Breakdown charts -->
<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
	<StatusBreakdownChart breakdown={data.summary.statusBreakdown} />
	<PaymentBreakdownChart breakdown={data.summary.paymentBreakdown} />
	<CategoryBreakdownChart breakdown={data.summary.categoryBreakdown} />
</div>

<!-- Top products -->
<div class="mb-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Package class="size-5 text-primary" />
				Top Products
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.summary.topProducts.length === 0}
				<p class="py-4 text-center text-sm text-muted-foreground">No product sales in this range</p>
			{:else}
				<div class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
					{#each data.summary.topProducts as product, i (product.productId)}
						<div
							class="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0"
						>
							<div class="flex items-center gap-3">
								<span
									class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
								>
									{i + 1}
								</span>
								<DataTableLinks
									id={String(product.productId)}
									name={product.name}
									link="/dashboard/products/single"
									target="_blank"
								/>
							</div>
							<div class="text-right">
								<div class="font-medium">{formatETB(product.revenue)}</div>
								<div class="text-xs text-muted-foreground">{product.quantitySold} sold</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<div class="flex flex-col gap-4">
	<h2 class="my-4 text-2xl">Order Line Items ({data.table.pagination.total})</h2>

	<DataTable
		data={data.detailRows}
		{columns}
		fileName="Reports {data.range.start ?? 'all'} - {data.range.end ?? 'time'}"
		server={data.table}
		facetKeys={['status', 'paymentMethodName', 'category']}
		facetLabels={{ paymentMethodName: 'Payment Method' }}
		dateFilter="Ordered"
	/>
</div>
