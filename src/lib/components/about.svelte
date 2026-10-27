<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { Card, CardContent } from '@nahu/admin-kit/components/ui/card/index.js';
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
			label: m.about_driver_reliability(),
			description: m.about_driver_reliability_desc()
		},
		{
			icon: ZapIcon,
			label: m.about_driver_continuity(),
			description: m.about_driver_continuity_desc()
		},
		{
			icon: ScaleIcon,
			label: m.about_driver_volume(),
			description: m.about_driver_volume_desc()
		},
		{
			icon: FactoryIcon,
			label: m.about_driver_structured(),
			description: m.about_driver_structured_desc()
		}
	];

	const targetSectors = [
		m.sector_construction(),
		m.sector_infrastructure(),
		m.sector_manufacturing(),
		m.sector_engineering(),
		m.sector_government(),
		m.sector_hardware()
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
				{m.about_overview_title()}
			</h2>
			<p class="max-w-3xl text-xl font-medium text-foreground/70">
				{m.about_overview_before()}
				<span class="font-bold text-foreground underline decoration-primary underline-offset-4"
					>{m.about_overview_group()}</span
				>{m.about_overview_after()}
			</p>
		</div>

		<div class="mb-20 grid gap-12 lg:grid-cols-5">
			<div transition:fly={{ x: -20, duration: 600, delay: 100 }} class="lg:col-span-2">
				<div class="rounded-2xl border border-primary/10 bg-primary/5 p-8">
					<h3 class="mb-6 text-lg font-bold tracking-widest text-primary uppercase">
						{m.about_sectors_title()}
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
	</div>
</section>

<style>
	/* Custom font spacing for industrial feel */
	h2 {
		letter-spacing: -0.02em;
	}
</style>
