<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { MenuIcon, XIcon } from '@lucide/svelte';
	import DarkMode from '@nahu/admin-kit/components/shell/DarkMode.svelte';
	import AvatarSettings from './AvatarSettings.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import InstallApp from './InstallApp.svelte';

	import { Sheet, SheetContent, SheetTrigger } from '@nahu/admin-kit/components/ui/sheet/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	let isOpen = $state(false);

	const handleMenuClick = () => {
		isOpen = false;
	};
	import { page } from '$app/state';

	let { data } = $props();

	/* The bar firms up once the page moves under it. */
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 8);

	const menuItems = [
		{ label: m.nav_home(), href: '/' },
		{ label: m.nav_products_services(), href: '/shop' },

		{ label: m.nav_about_us(), href: '/about-us' },

		{ label: m.nav_contact_us(), href: '/contact-us' },
		{ label: m.nav_orders(), href: '/orders' }
	];
</script>

<svelte:window bind:scrollY />

<header
	class={[
		'sticky top-0 z-50 w-full border-b px-2 transition-all duration-500 lg:px-16',
		scrolled
			? 'border-x-0 border-t-0 py-1 shadow-lg glass-strong'
			: 'border-x-0 border-t-0 py-2 shadow-none glass'
	]}
>
	<div class="flex h-14 items-center justify-between px-4 md:px-6">
		<!-- Logo/Title -->
		<div class="flex shrink-0 items-center gap-2">
			<a href="/" class="inline-block">
				<img
					src="/logo.webp"
					width="128"
					height="96"
					class="h-12 w-auto object-contain"
					alt={m.logo_alt()}
					fetchpriority="high"
				/>
			</a>

			<!-- <span class="text-xl font-bold text-foreground">Lalo Bakery Solution</span> -->
		</div>

		<!-- Desktop Menu -->
		<nav class="hidden items-center gap-1 rounded-full p-1 glass md:flex">
			{#each menuItems as item (item.href)}
				<Button
					variant={page.url.pathname === item.href ? 'default' : 'ghost'}
					size="sm"
					class={[
						'rounded-full px-4 transition-all duration-300',
						page.url.pathname === item.href
							? 'text-white shadow-[0_0_20px_-4px_var(--primary)]'
							: 'text-black hover:bg-white/50 dark:text-white dark:hover:bg-white/10'
					]}
					href={item.href}
					onclick={() => handleMenuClick()}
				>
					{item.label}
				</Button>
			{/each}
		</nav>
		<div class="flex flex-row items-center gap-2 lg:gap-4">
			<InstallApp variant="icon" class="lg:hidden" />
			<div class="hidden flex-row items-center justify-end lg:flex">
				<InstallApp />
				<div class="m-2">
					{#if data === ''}
						<!-- Search and Auth -->
						<div class="item-end hidden gap-4 md:flex">
							<Button href="/login" variant="ghost" size="sm">{m.nav_sign_in()}</Button>
							<Button href="/signup" size="sm">{m.nav_sign_up()}</Button>
						</div>
					{:else}
						<AvatarSettings {data} />
					{/if}
				</div>
				<LanguageSwitcher />
				<DarkMode />
			</div>

			<!-- Mobile Menu -->
			<div class="md:hidden">
				<Sheet bind:open={isOpen}>
					<SheetTrigger>
						{#snippet child({ props: triggerProps })}
							<Button variant="default" size="icon" {...triggerProps}>
								{#if isOpen}
									<XIcon class="size-5" />
								{:else}
									<MenuIcon class="size-5" />
								{/if}
							</Button>
						{/snippet}
					</SheetTrigger>
					<SheetContent side="right" class="flex w-80 flex-col p-0 glass-strong">
						<div class="border-b bg-muted/20 p-6">
							{#if data === ''}
								<div class="space-y-1">
									<h2 class="text-lg font-bold tracking-tight">{m.nav_welcome()}</h2>
									<p class="text-xs text-muted-foreground">{m.nav_sign_in_hint()}</p>
								</div>
							{:else}
								<div class="flex items-center gap-4">
									<div class="rounded-full bg-background p-1 shadow-sm ring-2 ring-primary/10">
										<AvatarSettings {data} />
									</div>
									<div class="flex flex-col overflow-hidden">
										<span class="truncate text-sm font-semibold">
											{data.user?.name ?? m.nav_account()}
										</span>
										<span class="truncate text-xs text-muted-foreground">
											{data.user?.email ?? m.nav_member()}
										</span>
									</div>
								</div>
							{/if}
						</div>

						<nav class="flex flex-1 flex-col gap-1 p-4">
							{#each menuItems as item (item.href)}
								<Button
									variant="ghost"
									href={item.href}
									class="w-full justify-start gap-3 px-3 py-6 text-base font-medium transition-all active:scale-[0.98]"
									onclick={() => handleMenuClick(item.href)}
								>
									{#if item.icon}
										<item.icon class="h-5 w-5 opacity-60" />
									{/if}
									{item.label}
								</Button>
							{/each}
						</nav>

						<div class="space-y-4 border-t bg-muted/10 p-4">
							<div class="flex items-center justify-between px-2">
								<span class="text-sm font-medium text-muted-foreground">{m.nav_interface()}</span>
								<div class="flex items-center gap-1">
									<LanguageSwitcher />
									<DarkMode />
								</div>
							</div>

							{#if data === ''}
								<div class="grid grid-cols-2 gap-2">
									<Button onclick={handleMenuClick} variant="outline" class="h-11" href="/login"
										>{m.nav_log_in()}</Button
									>
									<Button onclick={handleMenuClick} class="h-11 shadow-sm" href="/signup"
										>{m.nav_join()}</Button
									>
								</div>
							{/if}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	</div>
</header>
