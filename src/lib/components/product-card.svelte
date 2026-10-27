<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { useCart, type ProductPrice } from '$lib/hooks/cart.svelte.js';
	import { Card, CardContent } from '@nahu/admin-kit/components/ui/card/index.js';
	import { Badge } from '@nahu/admin-kit/components/ui/badge/index.js';
	import { ShoppingCartIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	/**
	 * The catalogue card shows an image and a name only — **no price, no variant
	 * selector and no add-to-cart, by client request**. Both were built and then
	 * removed on instruction; browsing to the product page is the intended path to
	 * buying. Please don't "restore" them as a missing feature.
	 */
	type Props = {
		productId: number;
		productName: string;
		/** `prices.id` of the variant this card defaults to — the cheapest one. */
		priceId: number;
		price: number | string;
		amount: string;
		image?: string | null;
		category?: string | null;
		priceList?: ProductPrice[];
	};

	let { productId, productName, priceId, price, amount, image, category, priceList }: Props =
		$props();

	const cart = $derived(useCart());

	let justAdded = $state(false);

	/**
	 * The variant this card represents: the cheapest one, chosen by the load.
	 * Price and amount come off that same row, so they always describe one
	 * variant — `min(price)` and `min(amount)` used to be unrelated aggregates.
	 *
	 * Nothing on the card displays it today (see the note above); it is here so
	 * `addToCart` stays correct for the badge and for any future use.
	 */
	const selected = $derived(
		priceList?.find((v) => v.id === priceId) ?? { id: priceId, price, amount }
	);

	/** Any variant of this product that is already in the cart. */
	const quantityInCart = $derived(
		cart.items.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0)
	);

	function addToCart() {
		if (justAdded) return;

		cart.addItem({
			priceId: selected.id,
			productId,
			amount: selected.amount,
			productName,
			price: Number(selected.price)
		});
		justAdded = true;

		toast.success(m.product_added({ name: productName }), {
			description: m.product_total_in_cart({ count: quantityInCart + 1 })
		});

		setTimeout(() => {
			justAdded = false;
		}, 1500);
	}
</script>

<Card
	class="group overflow-hidden rounded-3xl pt-0 glass transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_-18px_var(--primary)]"
>
	<a
		href="/shop/single/{productId}"
		class="relative m-2 mb-0 aspect-square overflow-hidden rounded-2xl bg-muted/60"
	>
		{#if image}
			<!-- `h-full` was mistyped as `h-fu ll`, so the image had no height rule and
			     the card collapsed to a strip. -->
			<img
				src="/files/{image}"
				alt={productName}
				loading="lazy"
				class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
			/>
			<!-- A pane of light crossing the photo on hover -->
			<span
				class="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-[left] duration-1000 group-hover:left-[150%]"
			></span>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-muted-foreground/40">
				<ShoppingCartIcon class="size-12" />
			</div>
		{/if}

		<div class="absolute inset-x-2 top-2 flex justify-between gap-2">
			{#if category}
				<Badge variant="secondary" class="rounded-full text-foreground glass">
					{category}
				</Badge>
			{/if}

			{#if quantityInCart > 0}
				<Badge variant="default" class="animate-in duration-200 zoom-in-50">
					{m.product_in_cart({ count: quantityInCart })}
				</Badge>
			{/if}
		</div>
	</a>

	<!-- Name only. Price, variant selector and add-to-cart were removed at the
	     client's instruction — see the note at the top of this file. -->
	<CardContent class="grid gap-1 p-4">
		<a href="/shop/single/{productId}" class="flex flex-col hover:underline">
			<h3 class="line-clamp-1 text-lg leading-tight font-bold" title={productName}>
				{productName}
			</h3>
		</a>
	</CardContent>
</Card>
