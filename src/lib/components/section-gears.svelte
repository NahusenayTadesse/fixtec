<script lang="ts">
	import Gear from './gear.svelte';

	/*
	 * Gears for a band that paints its own photo: the site backdrop sits behind the photo and
	 * cannot show through it, so these turn in front of the photo and behind the content.
	 * The parent needs `relative`, `overflow-hidden` and `z-0` (or any stacking context).
	 */
</script>

<div class="pointer-events-none absolute inset-0 -z-1 overflow-hidden" aria-hidden="true">
	<div class="absolute -top-24 -right-24 size-[26rem] text-white/[0.07]">
		<Gear teeth={24} spokes={6} class="size-full [animation:spin-slow_80s_linear_infinite]" />
		<div
			class="absolute size-1/2"
			style="left: calc(50% - 25% - 49.3%); top: calc(50% - 25% + 49.3%);"
		>
			<Gear teeth={12} spokes={4} class="size-full [animation:spin-reverse_40s_linear_infinite]" />
		</div>
	</div>
	<div class="absolute -bottom-28 -left-20 size-[20rem] text-white/[0.06]">
		<Gear teeth={18} spokes={5} class="size-full [animation:spin-reverse_70s_linear_infinite]" />
	</div>
</div>
