<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	let {
		id,
		IconComp,
		name,
		link,
		variant = 'ghost',
		target = '',
		...restProps
	}: {
		id: string;
		name: string;
		link: string;
		target?: string;
		IconComp?: Component<IconProps>;
		variant?: ButtonVariant;
	} = $props();
	import { Button, type ButtonVariant } from '$lib/components/ui/button/index.js';
</script>

<Button
	href="{link}/{id}"
	{target}
	{variant}
	{...restProps}
	class="wrap-break-words items-end! justify-start!  {variant === 'ghost' ? 'pl-0' : ''}"
>
	{#if IconComp}
		<IconComp class="size-4" />
	{/if}
	{name}
</Button>
