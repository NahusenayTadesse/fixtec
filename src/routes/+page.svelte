<script lang="ts">
	import { useCart } from '$lib/hooks/cart.svelte.js';

	import ProductCard from '$lib/components/product-card.svelte';

	// Set app and cart hooks
	useCart();
	let { data } = $props();

	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Hero from '$lib/components/hero.svelte';
	import About from '$lib/components/about.svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import Testimonial from '$lib/components/testimonial.svelte';

	// const groupedProducts = $derived(
	// 	data?.productList.reduce((acc, product) => {
	// 		const category = product.category || 'Uncategorized';
	// 		if (!acc[category]) {
	// 			acc[category] = [];
	// 		}
	// 		acc[category].push(product);
	// 		return acc;
	// 	}, {})
	// );
	//
	const groupedProducts = $derived.by(() => {
		const list = data?.productList ?? [];
		const groups: Record<string, any[]> = {};

		for (const item of list) {
			const cat = item.category ?? 'Uncategorized';
			if (!groups[cat]) groups[cat] = [];
			groups[cat].push(item);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Lalo Fixtec | Industrial & Construction Supply Solutions</title>

	<meta
		name="description"
		content="Procure professional-grade mechanical hand tools, construction materials, and bulk industrial supplies. Fixtec provides high-capacity solutions for contractors and infrastructure projects."
	/>
	<meta
		name="keywords"
		content="industrial hand tools, construction bulk supply, mechanical tools distributor, infrastructure procurement, Fixtec tools, Lalo Import and Export supply"
	/>

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Fixtec: Strategic Supply Partner for Global Operations" />
	<meta
		property="og:description"
		content="Secure your supply chain with Fixtec. Professional-grade tools and materials tailored for large-scale construction and industrial facilities."
	/>
	<meta property="og:image" content="/tools (1).webp" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="Fixtec | Professional Industrial & Construction Supply" />
	<meta
		property="twitter:description"
		content="We do not simply sell tools; we secure supply chains. Explore our bulk solutions for contractors and industrial developers."
	/>
	<meta property="twitter:image" content="/tools (1).webp" />
</svelte:head>

<Hero />
<About />

<!-- Main Content -->
<!-- <hr class="mb-12 border-muted/30" />
<main class="container mx-auto px-4 py-12 pb-24">
	{#each Object.entries(groupedProducts) as [categoryName, products] (categoryName)}
		<section class="mb-16 last:mb-0">
			<div class="mb-8 flex flex-col items-start gap-1 border-l-4 border-primary pl-6">
				<h2 class="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
					{categoryName}
				</h2>
			</div>

			<div class="relative px-2">
				<Carousel.Root
					opts={{
						align: 'start',
						loop: true
					}}
					class="w-full"
				>
					<Carousel.Content class="-ml-4">
						{#each products as product (product.productId)}
							<Carousel.Item class="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
								<div class="group h-full transition-transform duration-300 hover:-translate-y-2">
									<ProductCard {...product} />
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>

					<div class="hidden lg:block">
						<Carousel.Previous
							class="border-secondary bg-background text-secondary-foreground hover:bg-secondary"
						/>
						<Carousel.Next
							class="border-secondary bg-background text-secondary-foreground hover:bg-secondary"
						/>
					</div>
				</Carousel.Root>
			</div>
		</section>
	{/each}
</main> -->
{#if data?.allPaymentMethods.length > 0}
	<main class="flex flex-col items-center justify-center px-4 py-12 md:py-20">
		<!-- Section Header -->
		<div class="mb-12 max-w-2xl text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">What Our Customers Say</h2>
			<p class="text-lg text-muted-foreground">
				Don't just take our word for it. Here's what people are saying about their experience.
			</p>
		</div>

		<!-- Testimonial Carousel -->
		<Testimonial testimonials={data?.allPaymentMethods} />
	</main>
{/if}

<section class="mx-auto max-w-full border-t border-border/50 bg-background px-6 py-24 md:py-32">
	<div class="mx-auto max-w-7xl">
		<div class="mb-16 md:mb-20">
			<div class="inline-flex items-center gap-3">
				<span class="text-xs font-bold tracking-[0.25em] text-primary uppercase"
					>Strategic Ecosystem</span
				>
				<div class="h-[1px] w-12 bg-border" />
			</div>

			<h3
				class="mt-4 max-w-4xl text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl lg:text-6xl"
			>
				The Lalo Global <span class="text-muted-foreground">Network</span>
			</h3>

			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
				Our procurement expertise is reinforced by a diverse and robust network of synergistic
				operations, ensuring unparalleled logistical agility and market knowledge.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:gap-8">
			<div
				class="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl"
			>
				<div
					class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
				></div>

				<div class="flex items-center justify-between">
					<div
						class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							class="size-7"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path
								d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"
							/><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line
								x1="14"
								x2="14"
								y1="2"
								y2="4"
							/>
						</svg>
					</div>
					<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
						>LAL_EXP</span
					>
				</div>

				<div class="flex-grow space-y-2">
					<p class="text-2xl font-semibold tracking-tight text-foreground">Lalo Coffee Exports</p>
					<p
						class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
					>
						Global commodity supply chain coordination and international logistics management.
					</p>
				</div>
			</div>

			<div
				class="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl"
			>
				<div
					class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
				></div>

				<div class="flex items-center justify-between">
					<div
						class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							class="size-7"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="12" cy="12" r="10" /><path
								d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
							/><path d="M2 12h20" />
						</svg>
					</div>
					<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
						>FAH_GEN</span
					>
				</div>

				<div class="flex-grow space-y-2">
					<p class="text-2xl font-semibold tracking-tight text-foreground">Fahem General Trading</p>
					<p
						class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
					>
						Diversified international trade operations across key industrial and material sectors.
					</p>
				</div>
			</div>

			<div
				class="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl"
			>
				<div
					class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
				></div>

				<div class="flex items-center justify-between">
					<div
						class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							class="size-7"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.96v13.16a2 2 0 0 0 1.62 1.96L8 22a4 4 0 0 1 8 0l4.38-1.46a2 2 0 0 0 1.62-1.96V5.42a2 2 0 0 0-1.62-1.96z"
							/><path d="M12 2v20" />
						</svg>
					</div>
					<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
						>LAL_LAU</span
					>
				</div>

				<div class="flex-grow space-y-2">
					<p class="text-2xl font-semibold tracking-tight text-foreground">Lalo Laundry</p>
					<p
						class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
					>
						Commercial-scale linen and textile services for major hospitality and industrial
						clients.
					</p>
				</div>
			</div>

			<div
				class="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl"
			>
				<div
					class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
				></div>

				<div class="flex items-center justify-between">
					<div
						class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							class="size-7"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M2 22s5-3 5-8" /><path d="M7 14s2 2 7 2" /><path
								d="M14 16c2.5.5 5-1 5-4.5s-2.5-4.5-5-4s-5 1-5 4.5"
							/><path d="M2 15s1.5-3 6.5-3s6.5 3 6.5 3s1.5 3 6.5 3" /><path
								d="M12 2s-3 3-3 8s3 8 3 8s3-3 3-8s-3-8-3-8z"
							/>
						</svg>
					</div>
					<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
						>LAL_BAK</span
					>
				</div>

				<div class="flex-grow space-y-2">
					<p class="text-2xl font-semibold tracking-tight text-foreground">Lalo Bakery Solutions</p>
					<p
						class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
					>
						Advanced commercial equipment, ingredients, and operational workflows for high-volume
						bakeries.
					</p>
				</div>
			</div>

			<div
				class="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl md:col-span-2 lg:col-span-1"
			>
				<div
					class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
				></div>

				<div class="flex items-center justify-between">
					<div
						class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							class="size-7"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path
								d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"
							/>
						</svg>
					</div>
					<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
						>LAL_CAF</span
					>
				</div>

				<div class="flex-grow space-y-2">
					<p class="text-2xl font-semibold tracking-tight text-foreground">Lalo Cafe</p>
					<p
						class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
					>
						Curated beverage and food services integrated within corporate and commercial
						environments.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<Accordion />
