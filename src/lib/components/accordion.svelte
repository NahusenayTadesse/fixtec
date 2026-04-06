<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import { Layers, Route, Network, ShieldCheck, Handshake, HardHat } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';

	const features = [
		{
			id: 'bulk-supply',
			title: 'Scalable Bulk Supply Capacity',
			description:
				'Equipped to manage high-volume procurement for large-scale projects with a sourcing network that ensures consistent quality and schedules.',
			icon: Layers
		},
		{
			id: 'supply-chain',
			title: 'Integrated Supply Chain Management',
			description:
				'Established international partnerships and logistics systems ensure consistent availability, predictable lead times, and efficient customs handling.',
			icon: Route
		},
		{
			id: 'industry-network',
			title: 'Multi-Industry Network Strength',
			description:
				'Leveraging the Lalo General Trading portfolio to provide superior sourcing leverage, logistics coordination, and financial stability.',
			icon: Network
		},
		{
			id: 'contractor-support',
			title: 'Structured Contractor Support',
			description:
				'Tailored services including project-based planning, technical recommendations, and consolidated shipments to minimize operational downtime.',
			icon: HardHat
		},
		{
			id: 'compliance-quality',
			title: 'Compliance & Quality Assurance',
			description:
				'Products sourced from verified manufacturers and evaluated for durability, safety compliance, and industrial performance standards.',
			icon: ShieldCheck
		},
		{
			id: 'commercial-terms',
			title: 'Competitive Commercial Terms',
			description:
				'Structured pricing models designed for project contracts, framework agreements, and long-term distributor partnerships.',
			icon: Handshake
		}
	];
</script>

<div
	class="min-h-dvh bg-linear-to-br from-primary/5 via-background to-accent/5 px-4 py-12 sm:px-6 lg:px-8"
>
	<div class="mx-auto w-full">
		<!-- Header -->
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold text-foreground sm:text-5xl">WHY PARTNER WITH FIXTEC</h1>
			<p class="text-lg text-muted-foreground">
				Our goal is to support cost control without compromising operational reliability.
			</p>
		</div>

		<!-- Accordion -->
		<Accordion
			type="single"
			collapsible
			class="grid w-9/10 grid-cols-1 items-center gap-3 space-y-3 justify-self-center lg:grid-cols-2"
		>
			{#each features as feature (feature.id)}
				<AccordionItem
					value={feature.id}
					class="hover:shadow-lg-md transition-shadow-lg overflow-hidden rounded-lg border border-border shadow-lg duration-200"
				>
					<AccordionTrigger
						class="px-6 py-4 transition-colors duration-200 hover:bg-accent/5 [&[data-state=open]]:bg-primary/5"
					>
						<div class="flex items-center gap-4 text-left">
							<div class="shrink-0 rounded-lg bg-primary/10 p-2">
								<svelte:component this={feature.icon} class="size-5 text-primary" />
							</div>
							<h3 class="text-lg font-semibold text-foreground">{feature.title}</h3>
						</div>
					</AccordionTrigger>
					<AccordionContent class="border-t border-border bg-card/50 px-6 py-4">
						<p class="leading-relaxed text-muted-foreground">{feature.description}</p>
					</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>

		<!-- Footer CTA -->
		<div class="mt-12 text-center">
			<p class="mb-4 text-muted-foreground">
				Ready to elevate your professional-grade mechanical tools?
			</p>
			<Button href="/contact-us">Get Started Today</Button>
		</div>
	</div>
</div>
