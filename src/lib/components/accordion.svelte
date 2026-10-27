<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import { Layers, Route, Network, ShieldCheck, Handshake, HardHat } from '@lucide/svelte';
	import Button from '@nahu/admin-kit/components/ui/button/button.svelte';

	const features = [
		{
			id: 'bulk-supply',
			title: m.why_bulk_title(),
			description: m.why_bulk_desc(),
			icon: Layers
		},
		{
			id: 'supply-chain',
			title: m.why_chain_title(),
			description: m.why_chain_desc(),
			icon: Route
		},
		{
			id: 'industry-network',
			title: m.why_network_title(),
			description: m.why_network_desc(),
			icon: Network
		},
		{
			id: 'contractor-support',
			title: m.why_contractor_title(),
			description: m.why_contractor_desc(),
			icon: HardHat
		},
		{
			id: 'compliance-quality',
			title: m.why_quality_title(),
			description: m.why_quality_desc(),
			icon: ShieldCheck
		},
		{
			id: 'commercial-terms',
			title: m.why_terms_title(),
			description: m.why_terms_desc(),
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
			<h1 class="mb-4 text-4xl font-bold text-foreground sm:text-5xl">{m.why_title()}</h1>
			<p class="text-lg text-muted-foreground">
				{m.why_text()}
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
				{m.why_cta_text()}
			</p>
			<Button href="/contact-us">{m.why_cta_button()}</Button>
		</div>
	</div>
</div>
