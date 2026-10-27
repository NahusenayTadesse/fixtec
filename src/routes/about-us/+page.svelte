<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import SectionGears from '$lib/components/section-gears.svelte';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Badge } from '@nahu/admin-kit/components/ui/badge/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import {
		HardHat,
		ShieldCheck,
		Timer,
		Scaling,
		Handshake,
		Building2,
		Factory,
		Landmark,
		Toolbox,
		Coffee,
		Croissant,
		Microwave,
		Globe,
		WashingMachine,
		Utensils,
		Building,
		ShoppingBasket,
		User,
		User2
	} from '@lucide/svelte';

	let { data } = $props();

	const challenges = [
		{ icon: Timer, text: m.aboutus_challenge_timelines() },
		{ icon: Scaling, text: m.aboutus_challenge_demand() },
		{ icon: ShieldCheck, text: m.aboutus_challenge_delays() },
		{ icon: HardHat, text: m.aboutus_challenge_durability() }
	];

	import { Wrench, Construction, LayoutGrid, FileCog, Cog, ShoppingCart } from '@lucide/svelte';
	import LayoutGridFilled from '@tabler/icons-svelte/icons/layout-grid-filled';
	import Slider from '$lib/components/slider.svelte';

	const productCategories = [
		{
			title: m.cat_hand_tools(),
			icon: Wrench,
			items: [
				m.cat_hand_tools_1(),
				m.cat_hand_tools_2(),
				m.cat_hand_tools_3(),
				m.cat_hand_tools_4()
			]
		},
		{
			title: m.cat_construction(),
			icon: Construction,
			items: [
				m.cat_construction_1(),
				m.cat_construction_2(),
				m.cat_construction_3(),
				m.cat_construction_4()
			]
		},
		{
			title: m.cat_workshop(),
			icon: LayoutGrid,
			items: [m.cat_workshop_1(), m.cat_workshop_2(), m.cat_workshop_3(), m.cat_workshop_4()]
		}
	];

	const supplySolutions = [
		{ title: m.supply_project(), desc: m.supply_project_desc() },
		{ title: m.supply_long_term(), desc: m.supply_long_term_desc() },
		{ title: m.supply_wholesale(), desc: m.supply_wholesale_desc() },
		{ title: m.supply_custom(), desc: m.supply_custom_desc() }
	];

	const industries = [
		{
			name: m.ind_construction(),
			description: m.ind_construction_desc(),
			icon: Building2
		},
		{
			name: m.ind_manufacturing(),
			description: m.ind_manufacturing_desc(),
			icon: Factory
		},
		{
			name: m.ind_engineering(),
			description: m.ind_engineering_desc(),
			icon: LayoutGridFilled
		},
		{
			name: m.ind_public(),
			description: m.ind_public_desc(),
			icon: Landmark
		},
		{
			name: m.ind_hardware(),
			description: m.ind_hardware_desc(),
			icon: Toolbox
		},
		{
			name: m.ind_facility(),
			description: m.ind_facility_desc(),
			icon: Building
		}
	];

	let partners = [
		{
			name: m.partner_coffee_name(),
			description: m.aboutus_partner_coffee_desc(),
			icon: Coffee,
			short: 'LAL_EXP'
		},

		{
			name: m.partner_laundry_name(),
			description: m.aboutus_partner_laundry_desc(),
			icon: WashingMachine,
			short: 'LAL_LAU'
		},

		{
			name: m.partner_bakery_name(),
			description: m.aboutus_partner_bakery_desc(),
			icon: Croissant,
			short: 'LAL_BAK'
		},
		{
			name: m.partner_bakery_solutions_name(),
			description: m.aboutus_partner_bakery_solutions_desc(),
			icon: Microwave,
			short: 'LAL_BAK'
		},
		{
			name: m.partner_cafe_name(),
			description: m.aboutus_partner_cafe_desc(),
			icon: Utensils,
			short: 'LAL_CAF'
		},
		{
			name: m.partner_apartments_name(),
			description: m.aboutus_partner_apartments_desc(),
			icon: Building,
			short: 'LAL_APT'
		},
		{
			name: m.partner_fahem_name(),
			description: m.aboutus_partner_fahem_desc(),
			icon: Globe,
			short: 'FAH_GEN'
		}
	];

	const stats = [
		{ label: m.aboutus_stat_customers(), value: '300+', icon: User2 },
		{ label: m.aboutus_stat_products(), value: '1000+', icon: ShoppingCart }
	];
</script>

<svelte:head>
	<title>{m.aboutus_meta_title()}</title>

	<meta name="description" content={m.home_meta_description()} />
	<meta name="keywords" content={m.home_meta_keywords()} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.home_og_title()} />
	<meta property="og:description" content={m.home_og_description()} />
	<meta property="og:image" content="/tools (1).webp" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={m.home_twitter_title()} />
	<meta property="twitter:description" content={m.home_twitter_description()} />
	<meta property="twitter:image" content="/tools (4).webp" />
</svelte:head>

<div class="min-h-screen text-foreground">
	<section
		class="relative z-0 flex h-96 flex-col items-center justify-center overflow-hidden border-b bg-contain bg-center px-6 py-20 lg:px-8"
		style="background-image: url('/tools (4).webp')"
	>
		<div class="absolute inset-0 -z-1 bg-black/40"></div>
		<SectionGears />

		<div class="relative mx-auto max-w-4xl text-center">
			<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
				{m.aboutus_hero_title()}
			</h1>
			<p class="mt-6 text-2xl leading-8 font-bold text-gray-100 text-shadow-sm">
				{m.aboutus_hero_text()}
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-16 lg:px-8">
		<div class="grid gap-12 lg:grid-cols-2 lg:items-center">
			<div>
				<h2 class="text-3xl font-bold tracking-tight">{m.aboutus_mandate_title()}</h2>
				<p class="mt-4 text-lg text-muted-foreground">
					{m.aboutus_mandate_before()}
					<span class="font-semibold text-foreground">{m.about_overview_group()}</span
					>{m.aboutus_mandate_after()}
				</p>
				<div class="mt-8">
					<Button href="/contact-us" variant="default">{m.aboutus_partner_cta()}</Button>
				</div>
			</div>

			<Card.Root class="glass rounded-3xl">
				<Card.Header>
					<Card.Title>{m.aboutus_advantage_title()}</Card.Title>
					<Card.Description>{m.aboutus_advantage_subtitle()}</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<p class="text-sm leading-relaxed text-muted-foreground">
						{m.aboutus_advantage_text()}
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-6 py-24 md:py-40">
		<div
			class="grid items-center items-start justify-center gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-24"
		>
			<div class="flex flex-col gap-8 border-t-4 border-primary pt-8">
				<h2 class="text-4xl font-bold tracking-tighter uppercase md:text-5xl lg:text-6xl">
					{m.aboutus_who_line1()} <br />
					{m.aboutus_who_line2()}
				</h2>

				<div class="space-y-2">
					<p class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
						{m.aboutus_structure_label()}
					</p>
					<p class="text-sm leading-relaxed font-medium text-foreground/80">
						{m.aboutus_structure_text()}<br />
						<span class="font-semibold text-foreground">{m.aboutus_structure_group()}</span>
					</p>
				</div>

				<img src="/tools (2).webp" alt={m.aboutus_structure_alt()} class="" />
			</div>

			<div class="flex flex-col gap-12">
				<div class="space-y-6">
					<p class="text-3xl leading-[1.1] font-medium tracking-tight text-foreground md:text-5xl">
						{m.aboutus_not_vendor()} <br />
						<span class="text-muted-foreground">{m.aboutus_we_are_a()}</span>
						<span class="relative">
							{m.aboutus_procurement_partner()}
							<span class="absolute -bottom-2 left-0 h-1 w-full bg-primary/10"></span>
						</span>
					</p>
				</div>

				<div class="grid gap-10 md:grid-cols-1">
					<div class="space-y-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
						<p>
							<strong class="font-semibold text-foreground">{m.aboutus_fixtec()}</strong>
							{m.aboutus_established()}
						</p>

						<p>
							{m.aboutus_systems_before()}
							<span class="text-foreground">{m.aboutus_systems_highlight()}</span
							>{m.aboutus_systems_after()}
						</p>
					</div>

					<div class="relative border-l-2 border-border py-2 pl-8">
						<p class="text-base leading-relaxed text-muted-foreground italic">
							{m.aboutus_quote()}
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold tracking-widest text-muted-foreground uppercase">
					{m.aboutus_challenges_title()}
				</h2>
				<p class="mt-2 text-lg">{m.aboutus_challenges_text()}</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each challenges as challenge (challenge.text)}
					<div
						class="flex flex-col items-center glass rounded-2xl p-6 text-center"
					>
						<div class="mb-4 rounded-full bg-primary/10 p-3 text-primary">
							<challenge.icon size={24} />
						</div>
						<span class="text-sm leading-tight font-medium">{challenge.text}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-20 lg:px-8">
		<div class="glass rounded-3xl p-8 md:p-12">
			<div class="flex flex-col items-center gap-8 md:flex-row">
				<div class="flex-1">
					<h3 class="text-2xl font-bold">{m.aboutus_predictable_title()}</h3>
					<p class="mt-4 text-muted-foreground">
						{m.aboutus_predictable_text()}
					</p>
				</div>
				<div class="h-px w-full bg-border md:h-24 md:w-px"></div>
				<div class="flex flex-1 items-center justify-center">
					<div class="flex items-center gap-3">
						<Handshake class="text-primary" size={32} />
						<span class="text-xl font-semibold italic">{m.aboutus_focused()}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<div class="min-h-screen text-foreground">
	<section class="border-b px-6 py-16 lg:px-8">
		<div class="mx-auto max-w-5xl">
			<h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
				{m.aboutus_products_title()}
			</h1>
			<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
				{m.aboutus_products_text()}
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-12 lg:px-8">
		<div class="grid gap-6 md:grid-cols-3">
			{#each productCategories as cat (cat)}
				<Card.Root class="glass rounded-3xl transition-all hover:-translate-y-1 hover:border-primary/50">
					<Card.Header>
						<div class="mb-2 text-primary">
							<cat.icon size={28} />
						</div>
						<Card.Title class="text-xl">{cat.title}</Card.Title>
					</Card.Header>
					<Card.Content>
						<ul class="space-y-2">
							{#each cat.items as item (item)}
								<li class="flex items-center text-sm text-muted-foreground">
									<span class="mr-2 h-1 w-1 rounded-full bg-primary"></span>
									{item}
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>

	<section class="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16">
		<div class="h-full min-h-[400px] w-full lg:h-[600px]">
			<img
				src="/tools (4).webp"
				alt={m.aboutus_group_alt()}
				class="h-full w-full object-cover shadow-2xl lg:rounded-r-3xl"
			/>
		</div>

		<div class="px-6 lg:pr-12 xl:pr-24">
			<div class="flex flex-col gap-10">
				<div>
					<Badge variant="outline" class="mb-4 px-3 py-1 tracking-wider uppercase">
						{m.aboutus_procurement_badge()}
					</Badge>
					<h2 class="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
						{m.aboutus_models_title()}
					</h2>
					<p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
						{m.aboutus_models_text()}
					</p>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					{#each supplySolutions as solution (solution)}
						<div
							class="group glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-md"
						>
							<h3 class="text-lg font-bold transition-colors group-hover:text-primary">
								{solution.title}
							</h3>
							<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
								{solution.desc}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-20 lg:px-8">
		<div class="text-center">
			<h2 class="text-2xl font-bold tracking-tight">{m.aboutus_industries_title()}</h2>
			<p class="mt-2 text-muted-foreground">
				{m.aboutus_industries_text()}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each industries as indu (indu.name)}
				<div
					class="group relative flex flex-col gap-3 glass rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
				>
					<div class="flex items-center justify-between">
						<!-- <span class="text-2xl">{icon}</span> -->
						<indu.icon />
						<div class="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary"></div>
					</div>

					<div>
						<h3 class="text-base font-semibold tracking-tight text-foreground">
							{indu.name}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
							{indu.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section
		class="relative z-0 mx-auto max-w-full overflow-hidden border-t border-border/50 bg-contain bg-center px-6 py-24 md:py-32"
		style="background-image: url('/tools (6).webp');"
	>
		<div class="absolute inset-0 -z-1 bg-black/70"></div>
		<SectionGears />
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 md:mb-20">
				<div class="inline-flex items-center gap-3">
					<span class="text-xs font-bold tracking-[0.25em] text-white uppercase"
						>{m.aboutus_network_eyebrow()}</span
					>
					<div class="h-px w-12 bg-border"></div>
				</div>

				<h3
					class="mt-4 max-w-4xl text-4xl font-semibold tracking-tighter text-primary sm:text-5xl lg:text-6xl"
				>
					{m.aboutus_network_title()}
					<span class="text-white">{m.aboutus_network_title_highlight()}</span>
				</h3>

				<p class="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
					{m.home_subsidiaries_text()}
				</p>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:gap-8">
				{#each partners as p (p)}
					<div
						class="group relative flex flex-col gap-5 overflow-hidden glass-dark rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_var(--primary)]"
					>
						<div
							class="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100"
						></div>

						<div class="flex items-center justify-between">
							<div
								class="flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30"
							>
								<p.icon class="size-7" />
							</div>
							<span class="text-xs font-bold tracking-widest text-white/60 uppercase"
								>{p.short}</span
							>
						</div>

						<div class="grow space-y-2">
							<p class="text-2xl font-semibold tracking-tight text-white">{p.name}</p>
							<p class="text-sm leading-relaxed text-zinc-300">
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
	<section class="mx-auto my-8 mt-16 max-w-5xl px-6 pb-20 lg:px-8">
		<div
			class="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary p-8 text-primary-foreground md:flex-row md:p-12"
		>
			<div>
				<h2 class="text-2xl font-bold">{m.aboutus_cta_title()}</h2>
				<p class="opacity-90">{m.aboutus_cta_text()}</p>
			</div>
			<Button variant="secondary" href="/contact-us" size="lg" class="font-bold"
				>{m.aboutus_cta_button()}</Button
			>
		</div>
	</section>
</div>
