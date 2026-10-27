<script lang="ts">
	import { Download, Share, SquarePlus, EllipsisVertical, MonitorDown } from '@lucide/svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import * as Dialog from '@nahu/admin-kit/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { m } from '$lib/paraglide/messages.js';
	import { pwa } from '$lib/pwa.svelte';

	/** `icon`: a round icon-only button for the mobile bar; `full`: labelled, for wide layouts. */
	let { variant = 'full', class: className = '' }: { variant?: 'icon' | 'full'; class?: string } =
		$props();

	let helpOpen = $state(false);
	let mounted = $state(false);

	$effect(() => {
		pwa.start();
		mounted = true;
	});

	async function install() {
		if (!pwa.canPrompt) {
			helpOpen = true;
			return;
		}
		if (await pwa.install()) toast.success(m.pwa_installed());
	}
</script>

<!-- Nothing until hydrated (the server can't know), and nothing once running as the app. -->
{#if mounted && !pwa.installed}
	{#if variant === 'icon'}
		<Button
			variant="outline"
			size="icon"
			class={['rounded-full', className]}
			aria-label={m.pwa_install()}
			title={m.pwa_install()}
			onclick={install}
		>
			<Download class="size-5" />
		</Button>
	{:else}
		<Button
			size="sm"
			class={['gap-2 rounded-full shadow-[0_0_20px_-6px_var(--primary)]', className]}
			onclick={install}
		>
			<Download class="size-4" />
			{m.pwa_install()}
		</Button>
	{/if}

	<Dialog.Root bind:open={helpOpen}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<div class="flex items-center gap-3">
					<img src="/icons/icon-192.png" alt="" class="size-12 rounded-xl border shadow-sm" />
					<div class="text-left">
						<Dialog.Title>{m.pwa_install_title()}</Dialog.Title>
						<Dialog.Description>{m.pwa_install_desc()}</Dialog.Description>
					</div>
				</div>
			</Dialog.Header>

			<ol class="space-y-3 text-sm">
				{#if pwa.platform === 'ios'}
					<li class="flex items-center gap-3">
						<span class="step">1</span>
						<span class="flex-1">{m.pwa_ios_step1()}</span>
						<Share class="size-5 text-primary" />
					</li>
					<li class="flex items-center gap-3">
						<span class="step">2</span>
						<span class="flex-1">{m.pwa_ios_step2()}</span>
						<SquarePlus class="size-5 text-primary" />
					</li>
					<li class="flex items-center gap-3">
						<span class="step">3</span>
						<span class="flex-1">{m.pwa_ios_step3()}</span>
					</li>
				{:else if pwa.platform === 'android'}
					<li class="flex items-center gap-3">
						<span class="step">1</span>
						<span class="flex-1">{m.pwa_android_step1()}</span>
						<EllipsisVertical class="size-5 text-primary" />
					</li>
					<li class="flex items-center gap-3">
						<span class="step">2</span>
						<span class="flex-1">{m.pwa_android_step2()}</span>
					</li>
				{:else}
					<li class="flex items-center gap-3">
						<span class="step">1</span>
						<span class="flex-1">{m.pwa_desktop_step1()}</span>
						<MonitorDown class="size-5 text-primary" />
					</li>
					<li class="flex items-center gap-3">
						<span class="step">2</span>
						<span class="flex-1">{m.pwa_desktop_step2()}</span>
					</li>
				{/if}
			</ol>

			<ul class="grid gap-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
				<li>✓ {m.pwa_benefit_fast()}</li>
				<li>✓ {m.pwa_benefit_offline()}</li>
				<li>✓ {m.pwa_benefit_home()}</li>
			</ul>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props })}
						<Button variant="outline" {...props}>{m.pwa_got_it()}</Button>
					{/snippet}
				</Dialog.Close>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<style>
	.step {
		display: inline-grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		border-radius: 9999px;
		background: var(--primary);
		color: var(--primary-foreground);
		font-size: 0.75rem;
		font-weight: 600;
	}
</style>
