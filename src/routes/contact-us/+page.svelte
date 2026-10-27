<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { z } from 'zod';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	import { MailIcon, Send, Linkedin, SendIcon, PhoneIcon, Instagram } from '@lucide/svelte';

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	let { data } = $props();
	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		dataType: 'json'
	});

	let Tiktok = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
</svg>`;

	// Social links
	const socialLinks = [
		{
			icon: Instagram,
			name: 'Instagram',
			value: m.contact_instagram_value(),
			href: 'https://www.instagram.com/Fix@202016_lalo-instrgram'
		},
		{
			icon: Tiktok,
			name: 'TikTok',
			value: m.contact_tiktok_value(),
			href: 'https://www.tiktok.com/@fixtechlalo'
		},
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

	// Contact info
	const contactInfo = [
		{
			icon: MailIcon,
			label: m.contact_email(),
			value: 'fixtec@mohammedlaloie.com',
			href: 'mailto:fixtec@mohammedlaloie.com'
		},
		{
			icon: PhoneIcon,
			label: m.contact_whatsapp(),
			value: m.contact_whatsapp_value(),
			href: 'https://wa.me/+251912727000'
		}
	];

	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else {
				toast.success($message.text);
			}
		}
	});
</script>

<svelte:head>
	<title>{m.contact_meta_title()}</title>

	<meta name="description" content={m.home_meta_description()} />
	<meta name="keywords" content={m.home_meta_keywords()} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.home_og_title()} />
	<meta property="og:description" content={m.home_og_description()} />
	<meta property="og:image" content="/tools (1).webp" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={m.home_twitter_title()} />
	<meta property="twitter:description" content={m.home_twitter_description()} />
	<meta property="twitter:image" content="/tools (1).webp" />
</svelte:head>

<div class="min-h-dvh w-full text-foreground">
	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-4xl font-bold sm:text-5xl">{m.contact_title()}</h2>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				{m.contact_subtitle()}
			</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Contact Form -->
			<div class="lg:col-span-2">
				<Card class="glass rounded-3xl">
					<CardHeader>
						<CardTitle>{m.contact_form_title()}</CardTitle>
						<CardDescription>{m.contact_form_desc()}</CardDescription>
					</CardHeader>
					<CardContent>
						<form class="space-y-6" action="?/contact" method="POST" use:enhance>
							<!-- Name -->
							<InputComp
								{form}
								{errors}
								type="text"
								name="name"
								label={m.field_name()}
								placeholder={m.field_name_placeholder()}
							/>

							<InputComp
								type="email"
								{form}
								{errors}
								name="email"
								label={m.field_email()}
								placeholder={m.field_email_placeholder()}
							/>
							<InputComp
								type="tel"
								{form}
								{errors}
								name="phoneNumber"
								label={m.field_phone()}
								placeholder="+251 901020304"
							/>

							<InputComp
								{form}
								{errors}
								type="text"
								name="subject"
								label={m.field_subject()}
								placeholder={m.field_subject_placeholder()}
							/>

							<InputComp
								{form}
								{errors}
								type="text"
								name="address"
								label={m.field_address()}
								placeholder={m.field_address_placeholder()}
							/>

							<InputComp
								{form}
								{errors}
								type="textarea"
								name="contactMessage"
								label={m.field_message()}
								placeholder={m.field_message_placeholder()}
							/>

							<!-- Message -->

							<!-- Submit Button -->
							<Button type="submit" class="w-full gap-2">
								{#if $delayed}
									<LoadingBtn name={m.contact_sending()} />
								{:else}
									<SendIcon class="h-4 w-4" />
									{m.contact_send()}
								{/if}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>

			<!-- Contact Info & Social -->
			<div class="space-y-6">
				<!-- Direct Contact -->
				<Card class="glass rounded-3xl">
					<CardHeader>
						<CardTitle class="text-lg">{m.contact_info()}</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						{#each contactInfo as info (info.href)}
							<a
								href={info.href}
								class="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent/10"
							>
								<div class="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
									{#if info.icon === Tiktok}
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
										<info.icon class="h-4 w-4 text-primary" />
									{/if}
								</div>
								<div class="flex-1">
									<p class="text-sm font-medium text-muted-foreground">{info.label}</p>
									<p class="text-sm font-semibold">{info.value}</p>
								</div>
							</a>
						{/each}
					</CardContent>
				</Card>

				<!-- Social Media -->
				<Card class="glass rounded-3xl">
					<CardHeader>
						<CardTitle class="text-lg">{m.contact_follow()}</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 gap-3">
							{#each socialLinks as social (social.name)}
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
									{#if social.icon === Tiktok}
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
									<span class="text-xs font-medium">{social.name}</span>
								</a>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Hours -->
				<Card class="glass-strong rounded-3xl">
					<CardHeader>
						<CardTitle class="text-lg">{m.contact_hours()}</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">{m.contact_weekdays()}</span>
							<span class="font-semibold">{m.contact_weekdays_hours()}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">{m.contact_saturday()}</span>
							<span class="font-semibold">{m.contact_saturday_hours()}</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</main>
</div>

<!-- <section class="relative my-16 h-[50vh] w-full max-w-7xl justify-self-center lg:h-[90vh] lg:w-9/10">
	<iframe
		src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6989163918774!2d38.74450221007991!3d8.999827389408697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8513494db273%3A0x88235dbe171c4224!2sDiplomat%20Building!5e0!3m2!1sen!2set!4v1772532021053!5m2!1sen!2set"
		style="border:0;"
		class="h-full w-full rounded-3xl"
		loading="lazy"
		referrerpolicy="no-referrer-when-downgrade"
		title="Map"
	></iframe>
</section> -->
