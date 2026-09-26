<script lang="ts">
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import BankAccountList from '$lib/components/BankAccountList.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import {
		CircleCheckBig,
		CircleX,
		Clock,
		CreditCard,
		FileCheck,
		Landmark,
		MapPin,
		Package,
		RefreshCw,
		ShoppingBag,
		Store,
		Upload,
		User
	} from '@lucide/svelte';

	let { data, form: actionResult } = $props();

	const etb = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' });
	// A fixed zone, so the server-rendered date and the hydrated one always agree.
	const dateTime = new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'Africa/Addis_Ababa'
	});

	const order = $derived(data.order);
	const amount = $derived(etb.format(data.total));
	const subtotal = $derived(order.items.reduce((sum, item) => sum + item.lineTotal, 0));
	const paid = $derived(data.status === 'paid');
	const itemCount = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));

	/** One place deciding how the page presents the payment's state. */
	const view = $derived.by(() => {
		if (paid)
			return {
				icon: CircleCheckBig,
				tone: 'text-green-600 bg-green-600/10',
				badge: 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400',
				label: 'Paid',
				title: 'Payment received',
				text: 'Your order is fully paid. Nothing more is due on delivery or pickup.'
			};
		if (data.receiptSent)
			return {
				icon: FileCheck,
				tone: 'text-primary bg-primary/10',
				badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
				label: 'Awaiting confirmation',
				title: 'Receipt received',
				text: "We've got your transfer receipt and will confirm your order once we've checked it."
			};
		if (data.status === 'failed')
			return {
				icon: CircleX,
				tone: 'text-destructive bg-destructive/10',
				badge: 'border-destructive/30 bg-destructive/10 text-destructive',
				label: 'Failed',
				title: "Payment didn't go through",
				text: 'Your order is placed, but the payment failed. Try again, pay by bank transfer, or pay on delivery or pickup.'
			};
		return {
			icon: Clock,
			tone: 'text-amber-600 bg-amber-500/10',
			badge: 'border-border bg-muted text-muted-foreground',
			label: 'Not paid yet',
			title: 'Payment not confirmed yet',
			text: `${data.reason ?? ''} If you finished paying on Chapa, check again in a moment — or pay now, by bank transfer, or on delivery or pickup.`
		};
	});

	let retrying = $state(false);
	let checking = $state(false);
	let showTransfer = $state(false);

	async function checkAgain() {
		checking = true;
		await invalidateAll();
		checking = false;
	}

	const { form, errors, enhance, delayed } = superForm(data.transferForm, {
		invalidateAll: true,
		onUpdated: ({ form }) => {
			const msg = form.message as { type: string; text: string } | undefined;
			if (!msg) return;
			if (msg.type === 'error') toast.error(msg.text);
			else {
				toast.success(msg.text);
				showTransfer = false;
			}
		}
	});
</script>

<svelte:head>
	<title>Order #{data.orderId} · Payment - Lalo Fixtec</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl px-4 pt-6 pb-24 sm:py-10">
	<!-- Status -->
	<section class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
		<div class="flex size-14 shrink-0 items-center justify-center rounded-2xl {view.tone}">
			<view.icon class="size-7" />
		</div>
		<div class="min-w-0 flex-1 space-y-2">
			<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				<span class="font-mono font-semibold text-foreground">Order #{data.orderId}</span>
				<span aria-hidden="true">·</span>
				<time datetime={order.placedAt}>{dateTime.format(new Date(order.placedAt))}</time>
				<span
					class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {view.badge}"
				>
					{view.label}
				</span>
			</div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{view.title}</h1>
			<p class="max-w-2xl text-muted-foreground">{view.text}</p>
		</div>
	</section>

	{#if data.chapaUnavailable && !paid && !data.receiptSent}
		<p
			class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300"
		>
			Chapa isn't available right now. Try again in a minute, or pay by bank transfer below.
		</p>
	{/if}

	{#if actionResult?.message}
		<p class="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
			{actionResult.message}
		</p>
	{/if}

	<!-- Actions: full-width, thumb-sized buttons on phones -->
	<div class="mt-6 grid gap-2 sm:flex sm:flex-wrap">
		{#if !paid}
			<form
				method="POST"
				action="?/retry&ref={encodeURIComponent(data.ref)}"
				class="contents"
				use:formEnhance={() => {
					retrying = true;
					return async ({ update }) => {
						await update();
						retrying = false;
					};
				}}
			>
				<Button type="submit" size="lg" class="w-full sm:w-auto" disabled={retrying}>
					<CreditCard class="size-4" />
					{retrying ? 'Opening Chapa…' : `Pay ${amount} with Chapa`}
				</Button>
			</form>
			{#if data.bankTransfer.accounts.length && !showTransfer}
				<Button size="lg" variant="outline" class="w-full sm:w-auto" onclick={() => (showTransfer = true)}>
					<Landmark class="size-4" />
					{data.receiptSent ? 'Upload a different receipt' : 'Pay by bank transfer'}
				</Button>
			{/if}
			{#if data.status === 'pending' && !data.receiptSent}
				<Button size="lg" variant="outline" class="w-full sm:w-auto" onclick={checkAgain} disabled={checking}>
					<RefreshCw class="size-4 {checking ? 'animate-spin' : ''}" /> Check again
				</Button>
			{/if}
		{/if}
		<Button size="lg" variant="ghost" class="w-full sm:w-auto" href="/shop">
			<ShoppingBag class="size-4" /> Continue shopping
		</Button>
	</div>

	{#if showTransfer && !paid}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title>Pay by bank transfer</Card.Title>
				<Card.Description>
					Transfer {amount} to one of our accounts, then upload a screenshot or PDF of the transfer.
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				<BankAccountList accounts={data.bankTransfer.accounts} />
				<form
					method="POST"
					action="?/transfer&ref={encodeURIComponent(data.ref)}"
					enctype="multipart/form-data"
					use:enhance
					class="flex flex-col gap-3"
				>
					<InputComp
						label="Paid with"
						name="paymentMethod"
						type="select"
						{form}
						{errors}
						items={data.bankTransfer.methods}
					/>
					<InputComp
						label="Transfer receipt"
						name="reciept"
						type="file"
						{form}
						{errors}
						placeholder="Screenshot or PDF of your transfer (max 10MB)"
					/>
					<div class="grid gap-2 sm:flex sm:justify-end">
						<Button type="submit" size="lg" class="w-full sm:order-2 sm:w-auto" disabled={$delayed}>
							{#if $delayed}
								<LoadingBtn name="Uploading" />
							{:else}
								<Upload class="size-4" /> Send receipt
							{/if}
						</Button>
						<Button
							type="button"
							size="lg"
							variant="ghost"
							class="w-full sm:order-1 sm:w-auto"
							onclick={() => (showTransfer = false)}
						>
							Cancel
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
		<!-- What was ordered -->
		<Card.Root class="min-w-0">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Package class="size-5 text-muted-foreground" /> Items
				</Card.Title>
				<Card.Description>
					{itemCount} item{itemCount === 1 ? '' : 's'}
				</Card.Description>
			</Card.Header>
			<Card.Content class="px-0 sm:px-6">
				<!-- Phones: one card per line, nothing to scroll sideways -->
				<ul class="divide-y border-y sm:hidden">
					{#each order.items as item (item.id)}
						<li class="flex items-start justify-between gap-3 px-4 py-3">
							<div class="min-w-0">
								<p class="font-medium">{item.product}</p>
								<p class="text-sm text-muted-foreground">{item.variant}</p>
								<p class="mt-1 text-sm text-muted-foreground tabular-nums">
									{item.quantity} × {etb.format(item.price)}
								</p>
							</div>
							<p class="shrink-0 font-semibold tabular-nums">{etb.format(item.lineTotal)}</p>
						</li>
					{/each}
				</ul>

				<!-- Wider screens: a proper table -->
				<div class="hidden sm:block">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Product</Table.Head>
								<Table.Head>Package</Table.Head>
								<Table.Head class="text-right">Qty</Table.Head>
								<Table.Head class="text-right">Unit price</Table.Head>
								<Table.Head class="text-right">Total</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each order.items as item (item.id)}
								<Table.Row>
									<Table.Cell class="font-medium whitespace-normal">{item.product}</Table.Cell>
									<Table.Cell class="whitespace-normal text-muted-foreground">{item.variant}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{item.quantity}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{etb.format(item.price)}</Table.Cell>
									<Table.Cell class="text-right font-medium tabular-nums">
										{etb.format(item.lineTotal)}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<dl class="mt-4 space-y-2 px-4 text-sm sm:px-0">
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Subtotal</dt>
						<dd class="tabular-nums">{etb.format(subtotal)}</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">
							{order.fulfilment.type === 'pickup' ? 'Store pickup' : 'Delivery'}
						</dt>
						<dd class="tabular-nums">{order.fee > 0 ? etb.format(order.fee) : 'Free'}</dd>
					</div>
					<div class="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
						<dt>Total</dt>
						<dd class="tabular-nums">{amount}</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Paid</dt>
						<dd class="tabular-nums {paid ? 'text-green-700 dark:text-green-400' : ''}">
							{etb.format(paid ? data.total : 0)}
						</dd>
					</div>
					<div class="flex justify-between gap-4 font-medium">
						<dt>Balance due</dt>
						<dd class="tabular-nums">{etb.format(paid ? 0 : data.total)}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>

		<div class="flex min-w-0 flex-col gap-6">
			<!-- Payment -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<CreditCard class="size-5 text-muted-foreground" /> Payment
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<dl class="space-y-3 text-sm">
						<div class="flex items-center justify-between gap-3">
							<dt class="text-muted-foreground">Status</dt>
							<dd>
								<span
									class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {view.badge}"
								>
									{view.label}
								</span>
							</dd>
						</div>
						<div class="flex justify-between gap-3">
							<dt class="text-muted-foreground">Method</dt>
							<dd class="text-right">{order.payment.method ?? 'On delivery or pickup'}</dd>
						</div>
						<div class="flex justify-between gap-3">
							<dt class="text-muted-foreground">Amount paid</dt>
							<dd class="text-right tabular-nums">{etb.format(paid ? data.total : 0)}</dd>
						</div>
						{#if order.payment.paidAt}
							<div class="flex justify-between gap-3">
								<dt class="text-muted-foreground">Paid on</dt>
								<dd class="text-right">
									<time datetime={order.payment.paidAt}>
										{dateTime.format(new Date(order.payment.paidAt))}
									</time>
								</dd>
							</div>
						{/if}
						{#if order.payment.reference}
							<div class="flex flex-col gap-1">
								<dt class="text-muted-foreground">Chapa reference</dt>
								<dd class="font-mono text-xs break-all">{order.payment.reference}</dd>
							</div>
						{/if}
					</dl>
				</Card.Content>
			</Card.Root>

			<!-- Who and where -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<User class="size-5 text-muted-foreground" /> Ordered by
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4 text-sm">
					<div class="space-y-0.5">
						<p class="font-medium">{order.customer.name}</p>
						{#if order.customer.email}
							<p class="break-all text-muted-foreground">{order.customer.email}</p>
						{/if}
						{#if order.customer.phone}
							<p class="text-muted-foreground tabular-nums">{order.customer.phone}</p>
						{/if}
					</div>
					<div class="flex gap-3 border-t pt-4">
						{#if order.fulfilment.type === 'pickup'}
							<Store class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="font-medium">Store pickup</p>
								<p class="text-muted-foreground">Collect your order from our shop.</p>
							</div>
						{:else}
							<MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="min-w-0">
								<p class="font-medium">Delivery to {order.fulfilment.area}</p>
								{#if order.fulfilment.address}
									<p class="break-words text-muted-foreground">{order.fulfilment.address}</p>
								{/if}
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
