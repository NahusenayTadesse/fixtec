<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ArrowRightIcon, ShieldCheckIcon, BoxesIcon, User } from '@lucide/svelte';
	import Gear from './gear.svelte';

	/**
	 * A figure that counts up when the hero arrives. The server renders the final value, so the
	 * page reads right without script; the count restarts from zero only while the card is still
	 * invisible behind its own entrance animation.
	 */
	function counter(value: number, decimals: number, suffix: string) {
		const tween = new Tween(value, { easing: cubicOut });
		return {
			tween,
			suffix,
			get text() {
				return tween.current.toFixed(decimals) + suffix;
			}
		};
	}

	const stats = [
		{
			label: m.hero_stat_reliability(),
			count: counter(99.9, 1, '%'),
			icon: ShieldCheckIcon,
			pos: 'top-[8%] right-[12%]',
			depth: 18
		},
		{
			label: m.hero_stat_products(),
			count: counter(1000, 0, '+'),
			icon: BoxesIcon,
			pos: 'top-[44%] right-[0%]',
			depth: 30
		},
		{
			label: m.hero_stat_customers(),
			count: counter(300, 0, '+'),
			icon: User,
			pos: 'bottom-[12%] right-[34%]',
			depth: 12
		}
	];

	const SLIDE_MS = 6000;
	const images = ['/tools (1).webp', '/tools (2).webp', '/tools (3).webp', '/tools (4).webp'];
	let currentIndex = $state(0);

	const titleWords = m.hero_title().split(' ');

	/* Where the pointer is over the hero, -1…1 on each axis, for the cards' parallax. */
	let pointer = $state({ x: 0, y: 0 });
	let reducedMotion = $state(false);

	/** Decoration that follows the mouse — not an interaction, so it is attached, not a handler. */
	function trackPointer(node: HTMLElement) {
		const move = (event: PointerEvent) => {
			if (reducedMotion || event.pointerType !== 'mouse') return;
			const box = node.getBoundingClientRect();
			pointer = {
				x: ((event.clientX - box.left) / box.width) * 2 - 1,
				y: ((event.clientY - box.top) / box.height) * 2 - 1
			};
		};
		const leave = () => (pointer = { x: 0, y: 0 });
		node.addEventListener('pointermove', move);
		node.addEventListener('pointerleave', leave);
		return () => {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		};
	}

	onMount(() => {
		reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % images.length;
		}, SLIDE_MS);

		const timers: ReturnType<typeof setTimeout>[] = [];
		if (!reducedMotion) {
			stats.forEach((stat, i) => {
				const target = stat.count.tween.target;
				stat.count.tween.set(0, { duration: 0 });
				timers.push(
					setTimeout(() => stat.count.tween.set(target, { duration: 1800 }), 900 + i * 200)
				);
			});
		}

		return () => {
			clearInterval(interval);
			timers.forEach(clearTimeout);
		};
	});
</script>

<section
	class="relative min-h-[calc(100dvh-4.5rem)] w-full overflow-hidden bg-zinc-950"
	{@attach trackPointer}
>
	<!-- Photos: each drifts slowly closer while it is on screen, and fades into the next. -->
	<div class="absolute inset-0 z-0">
		{#each images as img, i (img)}
			{#if currentIndex === i}
				<div transition:fade={{ duration: 1400 }} class="absolute inset-0 overflow-hidden">
					<div
						class="absolute inset-0 [animation:kenburns_12s_ease-out_both] bg-cover bg-center bg-no-repeat"
						style="background-image: url('{img}');"
					></div>
				</div>
			{/if}
		{/each}
		<div class="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/10"></div>
		<div class="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30"></div>

		<!-- Coloured light over the photo -->
		<div
			class="absolute top-1/4 -left-32 size-[32rem] [animation:drift_22s_ease-in-out_infinite] rounded-full bg-primary/30 blur-3xl"
		></div>
		<div
			class="absolute -right-24 bottom-0 size-[28rem] [animation:drift_30s_ease-in-out_infinite_reverse] rounded-full bg-cyan-400/20 blur-3xl"
		></div>
	</div>

	<!-- The big gear behind the figures, turning with the pointer's parallax -->
	<div
		class="pointer-events-none absolute top-1/2 -right-40 z-0 hidden size-[44rem] -translate-y-1/2 text-white/[0.06] transition-transform duration-700 ease-out lg:block"
		style="transform: translate({pointer.x * -12}px, calc(-50% + {pointer.y * -12}px));"
		aria-hidden="true"
	>
		<Gear teeth={28} spokes={6} class="size-full [animation:spin-slow_60s_linear_infinite]" />
		<div
			class="absolute inset-[30%] [animation:spin-reverse_30s_linear_infinite] rounded-full border border-white/10"
		></div>
	</div>

	<div
		class="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-7xl flex-col justify-center px-6 pt-10 pb-24 lg:px-8 lg:py-0"
	>
		<div class="grid gap-16 lg:grid-cols-12 lg:items-center">
			<div class="flex flex-col space-y-10 lg:col-span-7">
				<div>
					<div class="mb-6 flex animate-rise-in items-center gap-3">
						<div class="h-px w-12 origin-left [animation:rise-in_1s_both] bg-primary"></div>
						<span
							class="rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-primary uppercase glass-dark"
						>
							{m.hero_eyebrow()}
						</span>
					</div>

					<h1
						class="text-5xl leading-[0.95] font-black tracking-tighter text-white sm:text-7xl lg:text-8xl"
					>
						<span class="sr-only">{m.hero_title()}</span>
						<span aria-hidden="true">
							{#each titleWords as word, i (i)}
								<span
									class="mr-[0.25em] inline-block animate-rise-in"
									style="--d: {150 + i * 110}ms">{word}</span
								>
							{/each}
						</span>
						<br />
						<span
							class="mt-3 inline-block text-shimmer animate-rise-in text-3xl font-light tracking-normal sm:text-5xl"
							style="--d: {250 + titleWords.length * 110}ms"
						>
							{m.hero_subtitle()}
						</span>
					</h1>
				</div>

				<div class="max-w-xl animate-rise-in space-y-6" style="--d: 700ms">
					<p class="text-xl leading-relaxed font-medium text-zinc-200">
						{m.hero_text()}
					</p>

					<div
						class="relative overflow-hidden rounded-2xl border-l-4 border-l-primary p-5 glass-dark"
					>
						<div
							class="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 [animation:sweep_5s_ease-in-out_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent"
						></div>
						<p class="mb-1 text-sm font-semibold tracking-wide text-primary uppercase">
							{m.hero_mandate_label()}
						</p>
						<p class="text-lg text-white">
							{m.hero_mandate_text()}
						</p>
					</div>
				</div>

				<div class="flex animate-rise-in flex-wrap gap-5" style="--d: 900ms">
					<Button
						size="lg"
						href="/shop"
						class="group relative h-14 overflow-hidden px-10 text-base font-bold tracking-wider uppercase shadow-[0_0_40px_-8px_var(--primary)] transition-shadow hover:shadow-[0_0_60px_-6px_var(--primary)]"
					>
						<span
							class="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-white/25 transition-[left] duration-700 group-hover:left-[150%]"
						></span>
						{m.hero_cta_products()}
						<ArrowRightIcon class="transition-transform group-hover:translate-x-1" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						href="/contact-us"
						class="h-14 px-10 text-white glass-dark hover:bg-white/15 hover:text-white"
					>
						{m.hero_cta_profile()}
					</Button>
				</div>
			</div>

			<!-- Figures: enter from the right, then float, and lean with the pointer by their depth. -->
			<div class="relative hidden h-150 lg:col-span-5 lg:block">
				{#each stats as stat, i (stat.label)}
					<div
						class="absolute transition-transform duration-500 ease-out {stat.pos}"
						style="transform: translate({pointer.x * stat.depth}px, {pointer.y * stat.depth}px);"
					>
						<div class="animate-slide-in-right" style="--d: {700 + i * 200}ms">
							<div
								class="flex flex-col items-start gap-3 rounded-2xl p-6 glass-dark"
								style="animation: float {5 + i}s ease-in-out {i * 0.7}s infinite;"
							>
								<div
									class="flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30"
								>
									<stat.icon class="size-6" />
								</div>
								<div>
									<p class="text-3xl leading-none font-black text-white tabular-nums">
										{stat.count.text}
									</p>
									<p class="mt-1 text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
										{stat.label}
									</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Which photo is showing, and how long until the next -->
	<div
		class="absolute bottom-10 left-6 z-10 flex gap-2 lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))]"
	>
		{#each images as img, i (img)}
			<button
				type="button"
				class="relative h-1 w-10 overflow-hidden rounded-full bg-white/20"
				aria-label={String(i + 1)}
				aria-current={currentIndex === i ? 'true' : undefined}
				onclick={() => (currentIndex = i)}
			>
				{#if currentIndex === i}
					<span
						class="absolute inset-y-0 left-0 bg-primary"
						style="animation: grow {SLIDE_MS}ms linear both;"
					></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Scroll cue -->
	<div
		class="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-rise-in flex-col items-center gap-2 md:flex"
		style="--d: 1400ms"
		aria-hidden="true"
	>
		<div class="flex h-11 w-7 justify-center rounded-full border-2 border-white/40 pt-2">
			<div
				class="size-1.5 [animation:scroll-cue_1.8s_ease-in-out_infinite] rounded-full bg-white"
			></div>
		</div>
	</div>
</section>

<style>
	h1 {
		text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	/* The shimmer is a background, which a text shadow would show through. */
	h1 :global(.text-shimmer) {
		text-shadow: none;
	}

	@keyframes -global-grow {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	@keyframes -global-sweep {
		0%,
		60% {
			left: -33%;
		}
		100% {
			left: 133%;
		}
	}
</style>
