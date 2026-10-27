<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';
	import { editUserSchema } from './schema';

	let { data } = $props();

	import SingleTable from '@nahu/admin-kit/components/SingleTable.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { superForm } from 'sveltekit-superforms/client';

	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { ArrowLeft, Pencil, Save, Pen, History } from '@lucide/svelte';
	import type { Snapshot } from '@sveltejs/kit';

	import SingleView from '@nahu/admin-kit/components/SingleView.svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';

	import { columns } from './columns.js';

	const countFor = (status: string) =>
		data?.orderCounts?.find((item) => item.status === status)?.count ?? 0;

	let singleTable = $derived([
		{ name: m.set_name(), value: data.singleUser?.name },
		{ name: m.set_email(), value: data.singleUser?.email },
		{ name: m.set_phone(), value: data.singleUser?.phone },
		{ name: m.set_general_address(), value: data.singleUser?.address ?? m.not_available() },
		{
			name: m.set_delivery_address(),
			value: data.singleUser?.deliveryAddress ?? m.not_available()
		},

		// `{ … } + 'Orders'` added a string to the object, which put the text
		// "[object Object]Orders" in the table instead of a row. And `count ?? 0 + ' Orders'`
		// parses as `count ?? (0 + ' Orders')`, so only a zero got the suffix.
		{
			name: m.set_lifetime_orders(),
			value: m.set_n_orders({ count: data.singleUser?.numberOfOrders ?? 0 })
		},
		{ name: m.set_pending_orders(), value: m.set_n_orders({ count: countFor('pending') }) },
		{ name: m.set_delivered_orders(), value: m.set_n_orders({ count: countFor('delivered') }) },
		{ name: m.set_cancelled_orders(), value: m.set_n_orders({ count: countFor('cancelled') }) },

		{
			name: m.set_joined(),
			value: data.singleUser?.createdAt.toLocaleString('en-ca', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			})
		}
	]);

	const { form, errors, enhance, delayed, capture, restore, allErrors, message } = superForm(
		data.form,
		{
			validators: zod4Client(editUserSchema),
			resetForm: false
		}
	);

	import { toast } from 'svelte-sonner';
	import Logout from '$lib/forms/Logout.svelte';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
			}
		}
	});

	export const snapshot: Snapshot = { capture, restore };

	//   let date = $derived(dateProxy(editForm, 'appointmentDate', { format: 'date'}));

	let edit = $state(false);

	// Re-synced when the saved profile changes (e.g. after a save), not just once at
	// startup. `untrack` because writing `$form` also reads it.
	$effect(() => {
		const user = data.singleUser;
		if (!user) return;
		untrack(() => {
			$form.name = user.name;
			$form.phone = user.phone ?? '';
			$form.email = user.email;
			$form.address = user.address ?? '';
			$form.deliveryAddress = user.deliveryAddress ?? '';
		});
	});
</script>

<svelte:head>
	<title>{m.set_title()}</title>
</svelte:head>
<SingleView title={m.set_title()} class="my-8 justify-self-center">
	<div class="mt-4 flex w-full flex-row items-start justify-start gap-2 pl-4">
		<Button onclick={() => (edit = !edit)}>
			{#if !edit}
				<Pencil class="h-4 w-4" />
				{m.set_edit()}
			{:else}
				<ArrowLeft class="h-4 w-4" />

				{m.back()}
			{/if}
		</Button>
	</div>
	{#if edit === false}
		<div class="w-full p-4"><SingleTable {singleTable} /></div>
	{/if}
	{#if edit}
		<div class="w-full p-4">
			<form action="?/editUser" use:enhance class="flex flex-col gap-4" id="edit" method="post">
				<Errors allErrors={$allErrors} />
				<InputComp
					label={m.set_your_name()}
					{form}
					{errors}
					type="text"
					name="name"
					placeholder={m.set_name_placeholder()}
					required
				/>
				<InputComp
					label={m.set_phone()}
					{form}
					{errors}
					type="tel"
					name="phone"
					placeholder={m.set_phone_placeholder()}
				/>
				<InputComp
					label={m.set_email()}
					{form}
					type="email"
					{errors}
					name="email"
					placeholder={m.set_email_placeholder()}
					required
				/>

				<InputComp
					label={m.field_general_address()}
					name="address"
					type="select"
					{form}
					{errors}
					placeholder={m.field_general_address_placeholder()}
					items={data?.placeList}
				/>
				<InputComp
					label={m.field_delivery_address()}
					name="deliveryAddress"
					type="text"
					{form}
					{errors}
					placeholder={m.field_delivery_address_placeholder()}
				/>

				<Button form="edit" type="submit" class="mt-4">
					{#if $delayed}
						<LoadingBtn name={m.orders_saving()} />
					{:else}
						<Save class="h-4 w-4" />
						{m.orders_save()}
					{/if}
				</Button>
			</form>
		</div>
	{/if}
</SingleView>

<!-- {#snippet fe(
	label = '',
	name = '',
	type = '',
	placeholder = '',
	required = false,
	min = '',
	max = ''
)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name}>{label}</Label>
		<Input
			{type}
			{name}
			{placeholder}
			{required}
			{min}
			{max}
			bind:value={$form[name]}
			aria-invalid={$errors[name] ? 'true' : undefined}
		/>
		{#if $errors[name]}
			<span class="text-red-500">{$errors[name]}</span>
		{/if}
	</div>
{/snippet}
{#snippet selects(name, items)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name} class="capitalize">{name.replace(/([a-z])([A-Z])/g, '$1 $2')}:</Label>

		<SelectComp {name} bind:value={$form[name]} {items} />
		{#if $errors[name]}<span class="text-red-500">{$errors[name]}</span>{/if}
	</div>
{/snippet} -->
