<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	let { data } = $props();

	import Hero from '$lib/components/hero.svelte';
	import About from '$lib/components/about.svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import Testimonial from '$lib/components/testimonial.svelte';

	import {
		Coffee,
		Microwave,
		Croissant,
		Globe,
		WashingMachine,
		Utensils,
		Building
	} from '@lucide/svelte';
	import SectionGears from '$lib/components/section-gears.svelte';
	import Slider from '$lib/components/slider.svelte';
	import ProductsCarousel from '$lib/components/products-carousel.svelte';

	let partners = [
		{
			name: m.partner_coffee_name(),
			description: m.partner_coffee_desc(),
			icon: Coffee,
			short: 'LAL_EXP'
		},

		{
			name: m.partner_laundry_name(),
			description: m.partner_laundry_desc(),
			icon: WashingMachine,
			short: 'LAL_LAU'
		},
		{
			name: m.partner_bakery_solutions_name(),
			description: m.partner_bakery_solutions_desc(),
			icon: Microwave,
			short: 'LAL_BAK'
		},
		{
			name: m.partner_bakery_name(),
			description: m.partner_bakery_desc(),
			icon: Croissant,
			short: 'LAL_BAK'
		},
		{
			name: m.partner_cafe_name(),
			description: m.partner_cafe_desc(),
			icon: Utensils,
			short: 'LAL_CAF'
		},
		{
			name: m.partner_apartments_name(),
			description: m.partner_apartments_desc(),
			icon: Building,
			short: 'LAL_APT'
		},
		{
			name: m.partner_fahem_name(),
			description: m.partner_fahem_desc(),
			icon: Globe,
			short: 'FAH_GEN'
		}
	];
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>

	<meta name="description" content={m.home_meta_description()} />
	<meta name="keywords" content={m.home_meta_keywords()} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.home_og_title()} />
	<meta property="og:description" content={m.home_og_description()} />
	<meta property="og:image" content="/tools (1).webp" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={m.home_twitter_title()} />
	<meta property="twitter:description" content={m.home_twitter_description()} />
	<meta property="twitter:image" content="/tools (1).webp" />
</svelte:head>

<Hero />
<About />

{#if data?.productList?.length > 0}
	<ProductsCarousel products={data.productList} />
{/if}

<section
	class="relative z-0 mx-auto max-w-full overflow-hidden bg-cover bg-fixed bg-center px-6 py-24 md:py-32"
	style="background-image: url('/tools (4).webp');"
>
	<div class="absolute inset-0 -z-1 bg-linear-to-b from-black/85 via-black/70 to-black/85"></div>
	<div
		class="absolute top-1/2 left-1/2 -z-1 size-[40rem] -translate-1/2 rounded-full bg-primary/25 blur-3xl"
	></div>
	<SectionGears />
	<div class="mx-auto max-w-7xl">
		<div data-reveal="up" class="mb-16 md:mb-20">
			<div class="inline-flex items-center gap-3">
				<!-- <span class="text-xs font-bold tracking-[0.25em] text-white uppercase"
					>Our Subsideries and Sister Companies</span
				> -->
				<!-- <div class="h-px w-12 bg-border" /> -->
			</div>

			<h3 class="mt-4 text-4xl font-semibold tracking-tighter text-primary sm:text-5xl lg:text-6xl">
				{m.home_subsidiaries_title()}
				<span class="text-white">{m.home_subsidiaries_title_highlight()}</span>
			</h3>

			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
				{m.home_subsidiaries_text()}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:gap-8">
			{#each partners as p, i (p)}
				<div
					data-reveal="up"
					style="--d: {(i % 3) * 120}ms"
					class="group relative flex flex-col gap-5 overflow-hidden rounded-3xl p-8 glass-dark transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_24px_60px_-20px_var(--primary)]"
				>
					<div
						class="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-primary to-cyan-300 transition-transform duration-500 group-hover:scale-x-100"
					></div>
					<!-- Light that follows the card's hover -->
					<div
						class="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/30 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
					></div>

					<div class="flex items-center justify-between">
						<div
							class="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-primary group-hover:text-primary-foreground"
						>
							<p.icon class="size-7" />
						</div>
						<span class="text-xs font-bold tracking-widest text-white/50 uppercase">{p.short}</span>
					</div>

					<div class="grow space-y-2">
						<p class="text-2xl font-semibold tracking-tight text-white">{p.name}</p>
						<p
							class="line-clamp-2 text-sm leading-relaxed text-white/70 group-hover:line-clamp-none"
						>
							{p.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

{#if data?.imagesList?.length > 0}
	<Slider imagesList={data?.imagesList} />
{/if}
{#if data?.allPaymentMethods.length > 0}
	<main class="flex flex-col items-center justify-center px-4 py-12 md:py-20">
		<!-- Section Header -->
		<div data-reveal="up" class="mb-12 max-w-2xl text-center">
			<h2 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
				{m.home_testimonials_title()}
			</h2>
			<p class="text-lg text-muted-foreground">
				{m.home_testimonials_text()}
			</p>
		</div>

		<!-- Testimonial Carousel -->
		<div data-reveal="zoom" class="w-full" style="--d: 120ms">
			<Testimonial testimonials={data?.allPaymentMethods} />
		</div>
	</main>
{/if}
<Accordion />
