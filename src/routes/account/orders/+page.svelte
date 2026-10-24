<script lang="ts">
	// Svelte 5 Runes
	import { enhance } from '$app/forms';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	let { data, form } = $props();
	let pendingOrders = $derived(data.pendingOrders || []);
	let paying = $state<number | null>(null);
</script>

<svelte:head>
	<title>Live Order Tracking - Lalo Fixtec</title>
</svelte:head>

<div class="mx-auto min-h-screen max-w-5xl space-y-8 bg-background p-6 text-foreground">
	<header class="border-b border-border pb-6">
		<div class="flex items-center gap-3">
			<span class="relative flex h-3 w-3">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
				></span>
				<span class="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
			</span>
			<h1 class="text-3xl font-bold tracking-tight">Live Order Tracking</h1>
		</div>
		<p class="mt-1 text-muted-foreground">
			Real-time status configurations of your open, processing receipts.
		</p>
	</header>

	{#if form?.message}
		<p class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
			{form.message}
		</p>
	{/if}

	{#if pendingOrders.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center text-card-foreground"
		>
			<div class="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-2-2" /></svg
				>
			</div>
			<h3 class="text-lg font-semibold">No active shipments</h3>
			<p class="mt-1 max-w-sm text-sm text-muted-foreground">
				You do not currently have any pending transactions requiring tracking parameters.
			</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#each pendingOrders as order (order.id)}
				<div
					class="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
				>
					<div
						class="flex flex-col justify-between gap-4 border-b border-border bg-muted/30 p-6 sm:flex-row sm:items-center"
					>
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm font-semibold text-muted-foreground"
									>Order ID: #{order.id}</span
								>
								<span
									class="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize"
								>
									{order.status}
								</span>
								{#if order.receiptSent}
									<span
										class="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
									>
										Receipt sent — awaiting check
									</span>
								{/if}
								{#if order.paid}
									<span
										class="inline-flex items-center rounded-full border border-green-600/25 bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400"
									>
										Paid
									</span>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground">
								Initiated on {order.createdAt} • Updated {order.updatedAt}
							</p>
						</div>
						<div class="text-sm sm:text-right">
							<p class="text-xs font-medium text-muted-foreground">Estimated Expenditure</p>
							<p class="font-mono text-xl font-bold text-foreground">
								ETB {order.orderTotal.toFixed(2)}
							</p>
							{#if !order.paid && !order.receiptSent}
								<form
									method="POST"
									action="?/pay"
									class="mt-2"
									use:enhance={() => {
										paying = order.id;
										return async ({ update }) => {
											await update();
											paying = null;
										};
									}}
								>
									<input type="hidden" name="orderId" value={order.id} />
									<Button type="submit" size="sm" disabled={paying !== null}>
										{paying === order.id ? 'Opening Chapa…' : 'Pay online'}
									</Button>
								</form>
							{/if}
						</div>
					</div>

					<div class="border-b border-border bg-card p-6">
						<div
							class="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-4"
						>
							<div
								class="absolute top-[18px] right-4 left-4 z-0 hidden h-0.5 bg-muted md:block"
							></div>
						</div>
					</div>

					<div class="bg-muted/10 p-6">
						<h4 class="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
							Shipment Manifest
						</h4>
						<ul
							class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background"
						>
							{#each order.items as item (item.id)}
								<li
									class="flex items-center justify-between p-4 text-sm transition-colors hover:bg-muted/30"
								>
									<div class="space-y-0.5">
										<p class="font-medium text-foreground">{item.productName}</p>
										<p class="font-mono text-xs text-muted-foreground">
											Qty: {item.quantity} × ETB {item?.price}
										</p>
									</div>
									<span class="font-mono font-medium text-foreground">ETB {item?.total} </span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
