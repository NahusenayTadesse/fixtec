<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import {
		ArrowRightIcon,
		HardHatIcon,
		ConstructionIcon,
		TruckIcon,
		ShieldCheckIcon,
		BoxesIcon,
		User2,
		User
	} from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';

	const stats = [
		{
			label: m.hero_stat_reliability(),
			value: '99.9%',
			icon: ShieldCheckIcon,
			pos: 'top-[10%] right-[15%]'
		},
		{ label: m.hero_stat_products(), value: '1000+', icon: BoxesIcon, pos: 'top-[45%] right-[5%]' },
		{ label: m.hero_stat_customers(), value: '300+', icon: User, pos: 'bottom-[15%] right-[40%]' }
	];

	const images = ['/tools (1).webp', '/tools (2).webp', '/tools (3).webp', '/tools (4).webp'];
	let currentIndex = $state(0);

	onMount(() => {
		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % images.length;
		}, 5000);
		return () => clearInterval(interval);
	});
</script>

<section class="bg-foreground-background relative min-h-dvh w-full overflow-hidden">
	<div class="absolute inset-0 z-0">
		{#each images as img, i (img)}
			{#if currentIndex === i}
				<div
					transition:fade={{ duration: 1200 }}
					class="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
					style="background-image: url('{img}');"
				></div>
			{/if}
		{/each}
		<div class="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent"></div>
		<div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
	</div>

	<div class="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-center px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-12 lg:items-center">
			<div class="flex flex-col space-y-10 lg:col-span-7">
				<div transition:fly={{ y: 20, duration: 800 }}>
					<div class="mb-6 flex items-center gap-3">
						<div class="h-px w-12 bg-primary"></div>
						<span class="text-xs font-bold tracking-[0.3em] text-primary uppercase"
							>{m.hero_eyebrow()}</span
						>
					</div>

					<h1
						class="text-5xl leading-[0.9] font-black tracking-tighter text-white sm:text-7xl lg:text-8xl"
					>
						{m.hero_title()} <br />
						<span class="text-3xl font-light tracking-normal text-zinc-400 sm:text-5xl"
							>{m.hero_subtitle()}</span
						>
					</h1>
				</div>

				<div transition:fly={{ y: 20, duration: 800, delay: 200 }} class="max-w-xl space-y-6">
					<p class="text-xl leading-relaxed font-medium text-zinc-200">
						{m.hero_text()}
					</p>

					<div class="rounded-xl border-l-4 border-primary bg-white/5 p-5 backdrop-blur-md">
						<p class="mb-1 text-sm font-semibold tracking-wide text-primary uppercase">
							{m.hero_mandate_label()}
						</p>
						<p class="text-lg text-white">
							{m.hero_mandate_text()}
						</p>
					</div>
				</div>

				<div transition:fly={{ y: 20, duration: 800, delay: 400 }} class="flex flex-wrap gap-5">
					<Button
						size="lg"
						href="/shop"
						class="h-14 px-10 text-base font-bold tracking-wider uppercase"
					>
						{m.hero_cta_products()}
					</Button>
					<Button
						variant="outline"
						size="lg"
						href="/contact-us"
						class="h-14 border-white/20 bg-transparent px-10 text-white hover:bg-white/10"
					>
						{m.hero_cta_profile()}
					</Button>
				</div>
			</div>

			<div class="relative hidden h-150 lg:col-span-5 lg:block">
				{#each stats as stat, i (stat)}
					<div
						class="absolute flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-2xl {stat.pos}"
						transition:fly={{ x: 50, delay: 600 + i * 200 }}
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary"
						>
							<stat.icon class="size-6" />
						</div>
						<div>
							<p class="text-3xl leading-none font-black text-white">{stat.value}</p>
							<p class="mt-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
								{stat.label}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div
		class="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 opacity-50"
	>
		<div class="h-16 w-px bg-linear-to-b from-primary to-transparent"></div>
	</div>
</section>

<style>
	/* Custom tracking for industrial feel */
	h1 {
		text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}
</style>
