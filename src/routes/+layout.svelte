<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import './layout.css';
	import { getFlash } from 'sveltekit-flash-message';
	import { page, updated } from '$app/state';
	import { Toaster } from '@nahu/admin-kit/components/ui/sonner/index.js';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import { toastmsg } from '$lib/global.svelte';

	const flash = getFlash(page, { clearAfterMs: 5000 });

	import { ModeWatcher } from 'mode-watcher';
	import { fly } from 'svelte/transition';

	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	import { notify, pwa } from '$lib/pwa.svelte';

	import { setCart } from '$lib/hooks/cart.svelte'; // Adjust path
	import Cart from '$lib/components/floating-cart/cart.svelte';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import SiteBackdrop from '$lib/components/site-backdrop.svelte';
	import { startReveal } from '$lib/reveal';

	// This initializes the class and puts it into Svelte's context
	setCart();

	let { data, children } = $props();

	// async function requestNotificationPermission() {
	// 	if (!('Notification' in window)) return;
	// 	await Notification.requestPermission();
	// }

	// let iconify = $state('h-6 w-6 animate-ping');

	$effect(() => {
		if (!$flash) return;
		if (page.data.flash?.type === 'success') toast.success($flash.message);
		if (page.data.flash?.type === 'error') toast.error($flash?.message);
		// No-op unless notifications were allowed.
		notify(
			page.data.flash?.type === 'success'
				? m.notify_success()
				: page.data.flash?.type === 'error'
					? m.notify_error()
					: m.notify_message(),
			$flash.message
		);
		$flash = undefined;
	});

	$effect(() => pwa.start());

	/* Say so when the connection drops or comes back, but not on first load. */
	let wasOnline: boolean | undefined;
	$effect(() => {
		const online = pwa.online;
		if (wasOnline !== undefined && online !== wasOnline) {
			if (online) toast.success(m.pwa_back_online());
			else toast.warning(m.pwa_offline(), { duration: 6000 });
		}
		wasOnline = online;
	});
</script>

<svelte:head>
	<link rel="icon" href="/icons/icon-192.png" type="image/png" />
</svelte:head>
<ModeWatcher />

<Toaster position="bottom-right" richColors closeButton />

<ProgressBar color="#2596be" zIndex={1000} />

{#if updated.current}
	<div class={toastmsg} transition:fly={{ x: 20, duration: 300 }}>
		<p>
			{m.update_available()}

			<Button onclick={() => location.reload()}>{m.update_reload()}</Button>
		</p>
	</div>
{/if}

{#if !page.url.pathname.startsWith('/dashboard')}
	<!-- The storefront keeps its own typography: the kit's h1–p rules skip this subtree. -->
	<!-- `startReveal` animates this subtree's `data-reveal` elements in as they scroll into view. -->
	<div data-site-type class="contents" {@attach startReveal}>
		<SiteBackdrop />
		<Header data={data?.user?.name ?? ''} />
		{@render children()}

		<Footer />
		<Cart
			freeDeliveryThreshold={data?.freeData?.threshold}
			suggestionThreshold={data?.freeData?.suggestionThreshold}
		/>
	</div>
{:else}
	{@render children()}
{/if}
