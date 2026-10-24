<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import type { Item } from '$lib/global.svelte';
	import type { Writable } from 'svelte/store';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Store = Writable<Record<string, any>>;

	// Shared by the add and edit dialogs. Their superForms have different schemas,
	// and `InputComp` takes the stores untyped, so they're passed straight through.
	let {
		form,
		errors,
		paymentMethodList
	}: { form: Store; errors: Store; paymentMethodList: Item[] } = $props();
</script>

<InputComp
	{form}
	{errors}
	label="Payment Method"
	type="select"
	name="paymentMethod"
	items={paymentMethodList}
/>
<InputComp {form} {errors} label="Bank Name" type="text" name="bankName" placeholder="Commercial Bank of Ethiopia" />
<InputComp {form} {errors} label="Account Holder" type="text" name="accountName" placeholder="Lalo Fixtec PLC" />
<InputComp {form} {errors} label="Account Number" type="text" name="accountNumber" placeholder="1000123456789" />
<InputComp
	{form}
	{errors}
	label="Status"
	type="select"
	name="status"
	items={[
		{ value: true, name: 'Active — shown at checkout' },
		{ value: false, name: 'Inactive — hidden' }
	]}
/>
