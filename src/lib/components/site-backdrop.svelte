<script lang="ts">
	import Gear from './gear.svelte';

	/*
	 * Behind every storefront page: soft brand-coloured light that drifts, a faint engineering
	 * grid, and gears turning in the margins. Fixed to the viewport and below everything, so the
	 * glass panels in front have something to frost.
	 *
	 * The two gears in the top-right corner mesh: 24 teeth to 12 at half the size, so the small
	 * one turns twice as fast the other way.
	 */
</script>

<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.96_0.03_220),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.05_230),transparent_60%)]"
	></div>

	<!-- Drifting light -->
	<div
		class="absolute -top-40 -left-40 size-[38rem] [animation:drift_28s_ease-in-out_infinite] rounded-full bg-primary/25 blur-3xl dark:bg-primary/20"
	></div>
	<div
		class="absolute top-1/3 -right-48 size-[34rem] [animation:drift_34s_ease-in-out_infinite_reverse] rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10"
	></div>
	<div
		class="absolute -bottom-48 left-1/4 size-[30rem] [animation:drift_40s_ease-in-out_infinite] rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10"
	></div>

	<!-- Blueprint grid, fading out towards the edges -->
	<div
		class="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] opacity-[0.35] dark:opacity-20"
		style="background-image: linear-gradient(to right, color-mix(in oklch, var(--primary) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--primary) 18%, transparent) 1px, transparent 1px); background-size: 56px 56px;"
	></div>

	<!-- Meshing pair, top right -->
	<div class="absolute -top-36 -right-36 size-[36rem] text-primary/[0.09] dark:text-primary/[0.12]">
		<Gear teeth={24} spokes={6} class="size-full [animation:spin-slow_80s_linear_infinite]" />
		<!-- Centres one pitch radius each apart (46.5% + 23.25% of the large gear's size), at 135°:
		     there the large gear shows a tooth and the small one a gap, so they start meshed. -->
		<div
			class="absolute size-1/2"
			style="left: calc(50% - 25% - 49.3%); top: calc(50% - 25% + 49.3%);"
		>
			<Gear teeth={12} spokes={4} class="size-full [animation:spin-reverse_40s_linear_infinite]" />
		</div>
	</div>

	<!-- Lone gear, bottom left -->
	<div
		class="absolute -bottom-32 -left-28 size-[26rem] text-primary/[0.08] dark:text-primary/[0.1]"
	>
		<Gear teeth={18} spokes={5} class="size-full [animation:spin-reverse_70s_linear_infinite]" />
	</div>

	<!-- Small accent gear, mid left, only on wide screens -->
	<div class="absolute top-[42%] left-[6%] hidden size-28 text-primary/[0.12] lg:block">
		<Gear teeth={10} spokes={3} class="size-full [animation:spin-slow_24s_linear_infinite]" />
	</div>
</div>
