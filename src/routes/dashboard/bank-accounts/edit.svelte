<script lang="ts">
	import { SquarePen, Save } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import type { Item } from '$lib/global.svelte';
	import type { edit } from './schema';
	import Fields from './fields.svelte';

	type Account = {
		id: number;
		paymentMethod: number;
		bankName: string;
		accountName: string;
		accountNumber: string;
		status: boolean;
	};

	let {
		data,
		account,
		paymentMethodList
	}: { data: SuperValidated<Infer<typeof edit>>; account: Account; paymentMethodList: Item[] } = $props();

	let open = $state(false);
	const formId = $props.id();

	const { form, errors, enhance, delayed, allErrors } = superForm(data, {
		id: formId,
		resetForm: false,
		invalidateAll: true,
		onUpdated: ({ form }) => {
			const msg = form.message as { type: string; text: string } | undefined;
			if (!msg) return;
			if (msg.type === 'error') toast.error(msg.text);
			else {
				toast.success(msg.text);
				open = false;
			}
		}
	});

	// Fill the form from the row each time the dialog opens, so it never shows
	// values left over from an earlier edit.
	$effect(() => {
		if (!open) return;
		$form.id = account.id;
		$form.paymentMethod = account.paymentMethod;
		$form.bankName = account.bankName;
		$form.accountName = account.accountName;
		$form.accountNumber = account.accountNumber;
		$form.status = account.status;
	});
</script>

<DialogComp bind:open title="" dialogTitle="Edit {account.bankName}" variant="ghost" IconComp={SquarePen}>
	<form action="?/edit" method="post" id={formId} use:enhance class="flex w-full flex-col gap-4 p-4">
		<Errors allErrors={$allErrors} />
		<input type="hidden" name="id" value={$form.id} />
		<Fields {form} {errors} {paymentMethodList} />
		<Button type="submit" class="mt-2" form={formId} disabled={$delayed}>
			{#if $delayed}
				<LoadingBtn name="Saving Changes" />
			{:else}
				<Save class="h-4 w-4" /> Save Changes
			{/if}
		</Button>
	</form>
</DialogComp>
