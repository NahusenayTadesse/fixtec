<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import {
		ShieldCheckIcon,
		ZapIcon,
		FactoryIcon,
		ScaleIcon,
		Building2Icon,
		ChartArea
	} from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';

	const highPerformanceDrivers = [
		{
			icon: ShieldCheckIcon,
			label: 'Reliability',
			description: 'Consistency in bulk procurement and fulfillment.'
		},
		{
			icon: ZapIcon,
			label: 'Operational Continuity',
			description: 'Reducing downtime through secure supply chains.'
		},
		{
			icon: ScaleIcon,
			label: 'Volume Capacity',
			description: 'Tailored logistics for large-scale infrastructure.'
		},
		{
			icon: FactoryIcon,
			label: 'Structured Supply',
			description: 'Managed solutions for industrial facilities.'
		}
	];

	const targetSectors = [
		'Large Construction Contractors',
		'Infrastructure Development',
		'Industrial Manufacturing',
		'Engineering & Maintenance',
		'Government & Institutional',
		'National Hardware Distribution'
	];

	const groupPartners = [
		{
			name: 'Lalo Bakery Solutions',
			description: 'Premium bakery ingredients and specialized industrial equipment.'
		},
		{
			name: 'Fahem General Trading',
			description: 'International agrochemical imports and global coffee exports.'
		}
	];
</script>

<section class="relative bg-background px-4 py-24 sm:px-6 lg:px-8">
	<div
		class="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-[0.03]"
		style="background-image: radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0); background-size: 40px 40px;"
	></div>

	<div class="relative z-10 mx-auto max-w-6xl">
		<div
			transition:fly={{ y: 20, duration: 600 }}
			class="mb-20 flex flex-col gap-4 border-l-4 border-primary pl-6 text-left"
		>
			<h2 class="text-4xl font-black tracking-tight text-foreground uppercase sm:text-5xl">
				Corporate Overview
			</h2>
			<p class="max-w-3xl text-xl font-medium text-foreground/70">
				Fixtec operates under <span
					class="font-bold text-foreground underline decoration-primary underline-offset-4"
					>Lalo Import and Export</span
				>, a diversified group with established import channels and cross-sector distribution
				expertise.
			</p>
		</div>

		<div class="mb-20 grid gap-12 lg:grid-cols-5">
			<div transition:fly={{ x: -20, duration: 600, delay: 100 }} class="lg:col-span-2">
				<div class="rounded-2xl border border-primary/10 bg-primary/5 p-8">
					<h3 class="mb-6 text-lg font-bold tracking-widest text-primary uppercase">
						Specialized Sectors
					</h3>
					<ul class="space-y-4">
						{#each targetSectors as sector (sector)}
							<li class="group flex items-center gap-3 font-semibold text-foreground/80">
								<div
									class="h-1.5 w-1.5 rounded-full bg-primary transition-all group-hover:w-4"
								></div>
								{sector}
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div transition:fly={{ x: 20, duration: 600, delay: 200 }} class="lg:col-span-3">
				<div class="grid gap-4 sm:grid-cols-2">
					{#each highPerformanceDrivers as driver (driver)}
						<Card class="border-primary/10 bg-card/50 transition-colors hover:border-primary/30">
							<CardContent class="p-6">
								<div
									class="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
								>
									<svelte:component this={driver.icon} class="size-6" />
								</div>
								<h4 class="text-base font-bold text-foreground">{driver.label}</h4>
								<p class="mt-2 text-sm leading-relaxed text-foreground/60">{driver.description}</p>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		</div>

		<div
			transition:fade={{ duration: 800, delay: 400 }}
			class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 p-8 shadow-2xl lg:p-12"
		>
			<!-- Background image: fades out toward the left where text lives -->
			<div class="pointer-events-none absolute inset-0">
				<img
					src="/tools (1).webp"
					alt=""
					class="h-full w-full object-cover object-center opacity-20 mix-blend-luminosity"
				/>
				<!-- Gradient mask: solid on the left, transparent on the right -->
				<!-- <div class="absolute inset-0 bg-linear-to-r from-black/20 via-black/70 to-black/20"></div> -->
			</div>

			<div class="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
				<div>
					<div
						class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10
                 px-4 py-1 text-xs font-bold tracking-tighter text-primary uppercase"
					>
						Group Ecosystem
					</div>
					<h3 class="text-3xl font-black text-white sm:text-4xl">Integrated <br />Partnerships</h3>
					<p class="mt-4 text-lg text-gray-50">
						Our operational model is designed around reliability, volume capacity, and long-term
						procurement partnerships that drive growth from the ground up.
					</p>
				</div>
				<div class="grid gap-4">
					{#each groupPartners as partner (partner)}
						<div
							class="group relative rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/10"
						>
							<div class="flex items-start justify-between">
								<div>
									<h4 class="font-bold text-primary transition-colors group-hover:text-primary">
										{partner.name}
									</h4>
									<p class="mt-1 text-sm leading-snug text-white">{partner.description}</p>
								</div>
								<Building2Icon class="size-5 text-primary" />
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Custom font spacing for industrial feel */
	h2 {
		letter-spacing: -0.02em;
	}
</style>
