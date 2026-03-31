<script lang="ts">
	import { MailIcon, PhoneIcon, MapPinIcon, Linkedin, MapPin, Send } from '@lucide/svelte';
	let email = $state('');

	const handleNewsletterSubmit = (e: Event) => {
		e.preventDefault();
		console.log('Newsletter signup:', email);
		email = '';
	};

	const socialLinks = [
		{
			name: 'LinkedIn',
			url: 'https://www.linkedin.com/company/lalobakerysolution/',
			icon: Linkedin,
			color: 'hover:text-black dark:hover:text-white'
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
				<h4 class="mb-4 font-semibold">Lalo Bakery Solution</h4>

				<div class="flex flex-col gap-2 text-sm">
					<a
						href="https://maps.app.goo.gl/KMrgwGNNbsE2SAeV7"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<MapPinIcon class="size-4 shrink-0" />
						<span>Diplomat Building, Mozambique St, Addis Ababa</span>
					</a>
					<a
						href="tel:+25152838383"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<PhoneIcon class="size-4 shrink-0" />
						<span>+25152838383</span>
					</a>
					<a
						href="tel:+251907353661"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<PhoneIcon class="size-4 shrink-0" />
						<span>+251907353661</span>
					</a>
					<a
						href="mailto:info@mohammedlaloie.com"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-foreground/70"
					>
						<MailIcon class="size-4 shrink-0" />
						<span>info@mohammedlaloie.com</span>
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
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6989163918774!2d38.74450221007991!3d8.999827389408697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8513494db273%3A0x88235dbe171c4224!2sDiplomat%20Building!5e0!3m2!1sen!2set!4v1772532021053!5m2!1sen!2set"
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
					{#each socialLinks as social (social.url)}
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
							<social.icon class="h-6 w-6" />
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
