<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
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
		Building
	} from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator';

	const challenges = [
		{ icon: Timer, text: 'Tight project timelines' },
		{ icon: Scaling, text: 'Fluctuating material demand' },
		{ icon: ShieldCheck, text: 'Risk of supply delays' },
		{ icon: HardHat, text: 'Equipment durability expectations' }
	];

	import { Wrench, Construction, LayoutGrid } from '@lucide/svelte';
	import LayoutGridFilled from '@tabler/icons-svelte/icons/layout-grid-filled';

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
			icon: Building2
		},
		{
			name: 'Manufacturing Plants',
			description: 'Optimizing production lines with smart automation and industrial IoT.',
			icon: Factory
		},
		{
			name: 'Engineering Services',
			description: 'Precision-driven consulting and technical design for complex systems.',
			icon: LayoutGridFilled
		},
		{
			name: 'Public Sector Projects',
			description: 'Compliance-ready frameworks for governmental and community initiatives.',
			icon: Landmark
		},
		{
			name: 'Hardware Distribution',
			description: 'Streamlined logistics and supply chain management for global hardware.',
			icon: Toolbox
		},
		{
			name: 'Facility Management',
			description: 'Sustainable operations and maintenance for modern commercial spaces.',
			icon: Building
		}
	];
</script>

<svelte:head>
	<title>About Us | Industrial & Construction Supply Solutions</title>

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

<div class="min-h-screen bg-background text-foreground">
	<section class="border-b bg-muted/30 px-6 py-20 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="outline" class="mb-4">Established Excellence</Badge>
			<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">FIXTEC</h1>
			<p class="mt-6 text-xl leading-8 text-muted-foreground">
				Providing dependable mechanical tools and construction materials for large-scale operations.
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-16 lg:px-8">
		<div class="grid gap-12 lg:grid-cols-2 lg:items-center">
			<div>
				<h2 class="text-3xl font-bold tracking-tight">Our Mandate</h2>
				<p class="mt-4 text-lg text-muted-foreground">
					Operating under <span class="font-semibold text-foreground">Lalo Import and Export</span>,
					we leverage decades of international trade and industrial distribution experience. Our
					foundation is built on reliability, operational discipline, and long-term business
					partnerships.
				</p>
				<div class="mt-8">
					<Button href="/contact-us" variant="default">Partner With Us</Button>
				</div>
			</div>

			<Card.Root class="border-border bg-card">
				<Card.Header>
					<Card.Title>The FIXTEC Advantage</Card.Title>
					<Card.Description>More than a vendor and procurement partner.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<p class="text-sm leading-relaxed text-muted-foreground">
						We position ourselves as a partner aligned with your operational goals. Our systems
						provide structured, predictable, and scalable supply solutions designed for the
						realities of modern construction.
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-6 py-24 md:py-40">
		<div class="grid items-start gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-24">
			<div class="flex flex-col gap-8 border-t-4 border-primary pt-8">
				<h2 class="text-4xl font-bold tracking-tighter uppercase md:text-5xl lg:text-6xl">
					Who <br />
					We Are
				</h2>

				<div class="space-y-2">
					<p class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
						Corporate Structure
					</p>
					<p class="text-sm leading-relaxed font-medium text-foreground/80">
						Operating under the strategic umbrella of<br />
						<span class="font-semibold text-foreground">Lalo Imports and Exports</span>
					</p>
				</div>
			</div>

			<div class="flex flex-col gap-12">
				<div class="space-y-6">
					<p class="text-3xl leading-[1.1] font-medium tracking-tight text-foreground md:text-5xl">
						We are not a vendor. <br />
						<span class="text-muted-foreground">We are a</span>
						<span class="relative">
							procurement partner.
							<span class="absolute -bottom-2 left-0 h-1 w-full bg-primary/10"></span>
						</span>
					</p>
				</div>

				<div class="grid gap-10 md:grid-cols-1">
					<div class="space-y-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
						<p>
							<strong class="font-semibold text-foreground">Fixtec</strong> was established with a singular
							mandate: to provide dependable mechanical tools and construction materials for large-scale
							professional operations.
						</p>

						<p>
							By leveraging decades of expertise in international trade and industrial distribution,
							our systems are engineered to be <span class="text-foreground"
								>structured, predictable, and scalable</span
							>. We align with your operational goals from day one.
						</p>
					</div>

					<div class="relative border-l-2 border-border py-2 pl-8">
						<p class="text-base leading-relaxed text-muted-foreground italic">
							"We understand the procurement challenges faced by large contractors and industrial
							operators. Every solution we offer is built around addressing those realities with
							discipline and transparency."
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-accent/50 py-16">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold tracking-widest text-muted-foreground uppercase">
					Solving Industry Challenges
				</h2>
				<p class="mt-2 text-lg">We understand the procurement hurdles faced by contractors.</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each challenges as challenge}
					<div
						class="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center shadow-sm"
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
		<div class="rounded-2xl border border-border bg-card p-8 md:p-12">
			<div class="flex flex-col items-center gap-8 md:flex-row">
				<div class="flex-1">
					<h3 class="text-2xl font-bold">Predictable Supply Chains</h3>
					<p class="mt-4 text-muted-foreground">
						Our operational discipline ensures that budget control and material availability never
						become project bottlenecks. We specialize in import coordination and industrial
						distribution for professional environments.
					</p>
				</div>
				<div class="h-px w-full bg-border md:h-24 md:w-px"></div>
				<div class="flex flex-1 items-center justify-center">
					<div class="flex items-center gap-3">
						<Handshake class="text-primary" size={32} />
						<span class="text-xl font-semibold italic">Focused on Reliability.</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

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
			{#each industries as indu (indu.name)}
				<div
					class="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
				>
					<div class="flex items-center justify-between">
						<!-- <span class="text-2xl">{icon}</span> -->
						<indu.icon />
						<div class="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary" />
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
