<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Badge } from '@nahu/admin-kit/components/ui/badge/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import {
		Wrench,
		Construction,
		Factory,
		Truck,
		Settings,
		ShieldAlert,
		ClipboardCheck,
		LayoutGrid
	} from '@lucide/svelte';

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
			icon: '🏗️'
		},
		{
			name: m.ind_manufacturing(),
			description: m.ind_manufacturing_desc(),
			icon: '🏭'
		},
		{
			name: m.ind_engineering(),
			description: m.ind_engineering_desc(),
			icon: '📐'
		},
		{
			name: m.ind_public(),
			description: m.ind_public_desc(),
			icon: '🏛️'
		},
		{
			name: m.ind_hardware(),
			description: m.ind_hardware_desc(),
			icon: '📦'
		},
		{
			name: m.ind_facility(),
			description: m.ind_facility_desc(),
			icon: '🏢'
		}
	];
</script>

<div class="min-h-screen bg-background text-foreground">
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
				<Card.Root class="bg-card transition-colors hover:border-primary/50">
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

	<section class="bg-muted/40 py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="flex flex-col gap-8 lg:flex-col lg:items-center">
				<div class="lg:w-1/3">
					<Badge variant="outline" class="mb-4">{m.aboutus_procurement_badge()}</Badge>
					<h2 class="text-3xl font-bold tracking-tight">{m.aboutus_models_title()}</h2>
					<p class="mt-4 text-muted-foreground">
						{m.industries_models_text()}
					</p>
				</div>
				<div class="grid flex-1 gap-4 sm:grid-cols-2">
					{#each supplySolutions as solution (solution)}
						<div class="rounded-xl border border-border bg-background p-5 shadow-sm">
							<h3 class="font-bold">{solution.title}</h3>
							<p class="mt-1 text-sm text-muted-foreground">{solution.desc}</p>
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
			{#each industries as { name, description, icon } (name)}
				<div
					class="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
				>
					<div class="flex items-center justify-between">
						<span class="text-2xl">{icon}</span>
						<div class="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary" />
					</div>

					<div>
						<h3 class="text-base font-semibold tracking-tight text-foreground">
							{name}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
							{description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="mx-auto mb-8 max-w-5xl px-6 pb-20 lg:px-8">
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
