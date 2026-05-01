<script lang="ts">
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
	import Slider from '$lib/components/slider.svelte';

	let partners = [
		{
			name: 'Lalo Coffee Exports',
			description:
				'Global commodity supply chain coordination and international logistics management.',
			icon: Coffee,
			short: 'LAL_EXP'
		},

		{
			name: 'Lalo Laundry',
			description:
				'Commercial-scale linen and textile services for major hospitality and industrial clients.',
			icon: WashingMachine,
			short: 'LAL_LAU'
		},
		{
			name: 'Lalo Bakery Solutions',
			description:
				'Advanced commercial equipment, ingredients, and operational workflows for high-volume bakeries.',
			icon: Microwave,
			short: 'LAL_BAK'
		},
		{
			name: 'Lalo Bakery',
			description:
				'A bakery experience focused on handcrafted pastries, expertly brewed coffee, and high-quality ingredients sourced with care.',
			icon: Croissant,
			short: 'LAL_BAK'
		},
		{
			name: 'Lalo Cafe',
			description:
				'Curated beverage and food services integrated within corporate and commercial environments.',
			icon: Utensils,
			short: 'LAL_CAF'
		},
		{
			name: 'Lalo Apartments',
			description:
				'Comprehensive residential property management services encompassing leasing, maintenance, and daily administrative operations.',
			icon: Building,
			short: 'LAL_APT'
		},
		{
			name: 'Fahem General Trading',
			description:
				'Diversified international trade operations across key industrial and material sectors.',
			icon: Globe,
			short: 'FAH_GEN'
		}
	];
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

<section
	class="relative z-0 mx-auto max-w-full border-t border-border/50 bg-cover bg-center px-6 py-24 md:py-32"
	style="background-image: url('/tools (4).webp');"
>
	<div class="absolute inset-0 -z-1 bg-black/70"></div>
	<div class="mx-auto max-w-7xl">
		<div class="mb-16 md:mb-20">
			<div class="inline-flex items-center gap-3">
				<span class="text-xs font-bold tracking-[0.25em] text-white uppercase"
					>Our Subsideries and Sister Companies</span
				>
				<div class="h-px w-12 bg-border" />
			</div>

			<h3
				class="mt-4 max-w-4xl text-4xl font-semibold tracking-tighter text-primary sm:text-5xl lg:text-6xl"
			>
				The Lalo Global <span class="text-white">Network</span>
			</h3>

			<p class="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
				Our procurement expertise is reinforced by a diverse and robust network of synergistic
				operations, ensuring unparalleled logistical agility and market knowledge.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:gap-8">
			{#each partners as p (p)}
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
							<p.icon class="size-7" />
						</div>
						<span class="text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
							>{p.short}</span
						>
					</div>

					<div class="grow space-y-2">
						<p class="text-2xl font-semibold tracking-tight text-foreground">{p.name}</p>
						<p
							class="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:line-clamp-none"
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
<Accordion />
