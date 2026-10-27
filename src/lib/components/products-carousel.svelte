<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Autoplay from 'embla-carousel-autoplay';
	import ProductCard from '$lib/components/product-card.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';

	let { products = [] }: { products: ComponentProps<typeof ProductCard>[] } = $props();

	const plugin = Autoplay({ delay: 3500, stopOnInteraction: true });
</script>

<section class="relative z-0 mx-auto max-w-full px-6 py-24 md:py-32">
	<div class="mx-auto max-w-7xl">
		<div
			class="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end"
		>
			<div data-reveal="up" class="max-w-2xl">
				<h3 class="text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl">
					{m.home_products_title()}
					<span class="text-shimmer">{m.home_products_title_highlight()}</span>
				</h3>
				<p class="mt-6 text-lg leading-relaxed text-muted-foreground">
					{m.home_products_text()}
				</p>
			</div>
			<Button
				href="/shop"
				variant="outline"
				data-reveal="right"
				class="group rounded-full px-6 glass hover:shadow-[0_0_30px_-6px_var(--primary)]"
			>
				{m.home_products_view_all()}
				<ArrowRight class="transition-transform group-hover:translate-x-1" />
			</Button>
		</div>

		<Carousel.Root
			data-reveal="up"
			style="--d: 150ms"
			class="mx-auto w-[80%] md:w-[90%] lg:w-full"
			opts={{ align: 'start', loop: true }}
			plugins={[plugin]}
			onmouseenter={plugin.stop}
			onmouseleave={plugin.reset}
		>
			<Carousel.Content>
				{#each products as product (product.productId)}
					<Carousel.Item class="basis-full py-4 sm:basis-1/2 lg:basis-1/4">
						<ProductCard {...product} />
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	</div>
</section>
