<script lang="ts">
	import {
		MailIcon,
		PhoneIcon,
		MapPinIcon,
		Linkedin,
		MapPin,
		Send,
		Instagram
	} from '@lucide/svelte';

	let Tiktok = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
</svg>`;

	const socialLinks = [
		{
			name: 'LinkedIn',
			url: 'https://www.linkedin.com/company/lalobakerysolution/',
			icon: Linkedin,
			color: 'hover:text-black dark:hover:text-white'
		},
		{
			icon: Instagram,
			label: 'Instagram',
			value: 'Contact us on Instagram',
			href: 'https://www.instagram.com/Fix@202016_lalo-instrgram'
		},
		{
			icon: '',
			label: 'TikTok',
			value: 'Follow us on TikTok',
			href: 'https://www.tiktok.com/@fixtechlalo'
		},
		{
			name: 'Telegram',
			url: 'https://t.me/fixtectool',
			icon: Send,
			color: 'hover:text-blue-400'
		}
	];

	const menuItems = [
		{ label: 'Home', href: '/' },

		{ label: 'About Us', href: '/about-us' },
		{ label: 'Products and Solutions', href: '/shop' },
		{ label: 'Industries', href: '/industries' },
		{ label: 'New Arrivals', href: '/new-arrival' },

		{ label: 'Orders', href: '/orders' },

		{ label: 'Contact Us', href: '/contact-us' }
	];
</script>

<footer class="border-t bg-card text-card-foreground">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Newsletter Section -->

		<!-- Footer Links Grid -->
		<div
			class="align-center mb-8 grid grid-cols-1 items-center justify-center gap-8 md:grid-cols-3"
		>
			<!-- Company Info -->
			<div>
				<img src="/logo.webp" class="w-30" alt="Lalo Logo" />
				<h4 class="mb-4 font-semibold">Lalo Fixtec</h4>

				<div class="flex flex-col gap-2 text-sm">
					<a
						href="https://maps.app.goo.gl/qdBiXLuEoQXwryer6"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<MapPinIcon class="size-4 shrink-0" />
						<span>Sengatera, In Front of Addis Ababa University, Addis Ababa</span>
					</a>
					<a
						href="tel:+25152838383"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<PhoneIcon class="size-4 shrink-0" />
						<span>+251 52 83 83 83</span>
					</a>
					<a
						href="tel:+2519 12 72 70 003"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<PhoneIcon class="size-4 shrink-0" />
						<span>+2519 12 72 70 00</span>
					</a>
					<a
						href="mailto:fixtec@mohammedlaloie.com"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<MailIcon class="size-4 shrink-0" />
						<span>fixtec@mohammedlaloie.com</span>
					</a>
				</div>
			</div>

			<!-- Quick Links -->
			<div class="lg:w-lg">
				<h4 class="mb-4 font-semibold">Quick Links</h4>
				<ul class="flex flex-col gap-2 text-sm">
					{#each menuItems as item (item.href)}
						<li>
							<a href={item.href} class="text-foreground/70 transition-colors hover:text-foreground"
								>{item.label}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Customer Service -->
			<div>
				<h4 class="mb-4 flex gap-2 font-semibold"><MapPin /> Location</h4>
				<section class="relative h-32 w-full">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d985.1384495229566!2d38.74882050370965!3d9.01313956646654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85c4825658a3%3A0xf3efdd57bb307c1e!2sAddis%20Ababa%20University%20School%20of%20Commerce!5e0!3m2!1sen!2set!4v1775076333145!5m2!1sen!2set"
						style="border:0;"
						class="w-full rounded-3xl"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
						title="Map"
					></iframe>
				</section>
			</div>

			<!-- Social Links -->
			<div class="flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
				<p class="text-sm text-foreground/70">Follow us on social media</p>
				<div class="grid grid-cols-4 gap-3">
					{#each socialLinks as social}
						<a
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							class={[
								'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:border-primary hover:shadow-lg',
								social.color
							]}
							title={social.name}
						>
							{#if social.icon === ''}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="h-4 w-4 text-primary"
									viewBox="0 0 16 16"
								>
									<path
										d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"
									/>
								</svg>
							{:else}
								<social.icon class="h-4 w-4 text-primary" />
							{/if}
						</a>
					{/each}
				</div>
			</div>

			<!-- Copyright -->
			<div class="mt-8 border-t pt-8 text-center text-sm text-foreground/70">
				<p>&copy; {new Date().getFullYear()} Lalo Fixtec. All rights reserved.</p>
			</div>
		</div>
	</div>
</footer>
