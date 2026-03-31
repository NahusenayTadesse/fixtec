<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
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
			title: 'Mechanical Hand Tools',
			icon: Wrench,
			items: ['Wrench systems', 'Impact hammers', 'Cutting tools', 'Measuring instruments']
		},
		{
			title: 'Construction Materials',
			icon: Construction,
			items: ['Structural hardware', 'Fasteners & anchors', 'Reinforcement', 'Site consumables']
		},
		{
			title: 'Industrial & Workshop',
			icon: LayoutGrid,
			items: ['Tool storage', 'Safety equipment', 'Maintenance kits', 'Handling accessories']
		}
	];

	const supplySolutions = [
		{ title: 'Project-Based Supply', desc: 'Aligned with construction milestones and schedules.' },
		{
			title: 'Long-Term Agreements',
			desc: 'Framework agreements for consistent, extended supply.'
		},
		{ title: 'Wholesale Programs', desc: 'Partnerships for retailers and regional distributors.' },
		{ title: 'Custom Sourcing', desc: 'Sourcing based on project-specific technical requirements.' }
	];

	const industries = [
		{
			name: 'Construction & Infrastructure',
			description: 'Scalable solutions for large-scale urban development and civil engineering.',
			icon: '🏗️'
		},
		{
			name: 'Manufacturing Plants',
			description: 'Optimizing production lines with smart automation and industrial IoT.',
			icon: '🏭'
		},
		{
			name: 'Engineering Services',
			description: 'Precision-driven consulting and technical design for complex systems.',
			icon: '📐'
		},
		{
			name: 'Public Sector Projects',
			description: 'Compliance-ready frameworks for governmental and community initiatives.',
			icon: '🏛️'
		},
		{
			name: 'Hardware Distribution',
			description: 'Streamlined logistics and supply chain management for global hardware.',
			icon: '📦'
		},
		{
			name: 'Facility Management',
			description: 'Sustainable operations and maintenance for modern commercial spaces.',
			icon: '🏢'
		}
	];
</script>

<div class="min-h-screen bg-background text-foreground">
	<section class="border-b px-6 py-16 lg:px-8">
		<div class="mx-auto max-w-5xl">
			<h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Products & Solutions</h1>
			<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
				Professional-grade equipment and structured procurement models designed to meet
				high-frequency industrial demands.
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
					<Badge variant="outline" class="mb-4">Procurement</Badge>
					<h2 class="text-3xl font-bold tracking-tight">Structured Supply Models</h2>
					<p class="mt-4 text-muted-foreground">
						We move beyond simple transactions to provide supply chain integration that respects
						your budget and timelines.
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
			<h2 class="text-2xl font-bold tracking-tight">Industries We Serve</h2>
			<p class="mt-2 text-muted-foreground">
				Specialized support across diverse industrial sectors.
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
				<h2 class="text-2xl font-bold">Ready to streamline your procurement?</h2>
				<p class="opacity-90">Get in touch for custom sourcing or long-term supply agreements.</p>
			</div>
			<Button variant="secondary" href="/contact-us" size="lg" class="font-bold"
				>Contact Our Experts</Button
			>
		</div>
	</section>
</div>
