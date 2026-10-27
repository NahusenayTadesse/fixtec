<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';

	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { Input } from '@nahu/admin-kit/components/ui/input/index.js';
	import { Label } from '@nahu/admin-kit/components/ui/label/index.js';

	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { SignupSchema } from '$lib/ZodSchema';
	import { Eye, EyeOff } from '@lucide/svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';

	let {
		data,
		placeList,
		action = '?/signup'
	}: { data: SuperValidated<Infer<SignupSchema>>; placeList: Item[]; action?: string } = $props();

	const { form, errors, delayed, enhance, allErrors, message } = superForm(data, {});

	/**
	 * Unique per instance, because the submit button reaches its form by `form={id}`.
	 *
	 * This was a hardcoded `id="main"` — the same id the checkout page's order
	 * form uses. On checkout both are in the document at once, so
	 * `getElementById('main')` resolved to whichever came first and the "Sign Up"
	 * button submitted the *order* form instead of this one.
	 */
	const formId = $props.id();

	import { toast } from 'svelte-sonner';
	import type { Item } from '$lib/global.svelte';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
			}
		}
	});

	let eye = $state(false);
	let EyeIcon = $derived(eye ? EyeOff : Eye);
</script>

<Card.Root class="mx-auto flex w-full max-w-md flex-col justify-center justify-self-center ">
	<Card.Header>
		<div class="flex w-full flex-col items-center justify-center">
			<img src="/logo.webp" class="block h-24 w-24 dark:hidden" alt={m.logo_alt_short()} />
			<img src="/logoWhite.webp" class="hidden h-24 w-24 dark:block" alt={m.logo_alt_short()} />
		</div>
		<Card.Title class="flex flex-row justify-between text-2xl">{m.signup_title()}</Card.Title>
		<Card.Description>{m.signup_desc()}</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" id={formId} {action} use:enhance>
			<Errors allErrors={$allErrors} />

			<div class="grid gap-4">
				<InputComp
					label={m.field_full_name()}
					name="name"
					type="text"
					{form}
					{errors}
					placeholder={m.field_full_name_placeholder()}
				/>
			</div>
			<InputComp
				label={m.field_email()}
				name="email"
				type="email"
				{form}
				{errors}
				placeholder={m.field_email_placeholder()}
			/>
			<InputComp
				label={m.field_phone()}
				name="phone"
				type="tel"
				{form}
				{errors}
				placeholder="+251 9-11-00-00-00"
			/>
			<InputComp
				label={m.field_general_address()}
				name="address"
				type="select"
				{form}
				{errors}
				placeholder={m.field_general_address_placeholder()}
				items={placeList}
			/>
			<InputComp
				label={m.field_delivery_address()}
				name="deliveryAddress"
				type="text"
				{form}
				{errors}
				placeholder={m.field_delivery_address_placeholder()}
			/>

			<div class="mt-2 grid gap-2">
				<div class="flex items-center">
					<Label for="{formId}-password">{m.login_password()}</Label>
				</div>
				<div class="relative">
					<Input
						id="{formId}-password"
						name="password"
						type={eye ? 'text' : 'password'}
						bind:value={$form.password}
						required
					/>
					<button type="button" onclick={() => (eye = !eye)} title={m.password_toggle()}>
						<EyeIcon
							class="absolute top-0.5 right-2 h-6 w-6 transition-transform duration-300 ease-in-out"
						/>
					</button>
					{#if $errors.password}<span class="text-red-500">{$errors.password}</span>{/if}
				</div>
			</div>
			<Button type="submit" form={formId} disabled={$delayed} class="h-12 w-full text-lg shadow-md">
				{#if $delayed}
					<LoadingBtn name={m.signup_loading()} />
				{:else}
					{m.signup_submit()}
				{/if}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
