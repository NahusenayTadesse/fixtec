<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import BankAccountList from '$lib/components/BankAccountList.svelte';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import Fields from './fields.svelte';
	import Edit from './edit.svelte';
	import Delete from './delete.svelte';

	let { data } = $props();

	type Row = (typeof data.allData)[number];

	let addOpen = $state(false);
	const { form, errors, enhance, delayed, allErrors } = superForm(data.form, {
		id: 'add-bank-account',
		resetForm: true,
		invalidateAll: true,
		onUpdated: ({ form }) => {
			const msg = form.message as { type: string; text: string } | undefined;
			if (!msg) return;
			if (msg.type === 'error') toast.error(msg.text);
			else {
				toast.success(msg.text);
				addOpen = false;
			}
		}
	});

	const columns = [
		{ accessorKey: 'index', header: '#', cell: (info: { row: { index: number } }) => info.row.index + 1 },
		{ accessorKey: 'bankName', header: 'Bank' },
		{ accessorKey: 'accountName', header: 'Account Holder' },
		{
			accessorKey: 'accountNumber',
			header: 'Account Number',
			// The same copy button shoppers get at checkout, handy for staff too.
			cell: ({ row }: { row: { original: Row } }) =>
				renderComponent(BankAccountList, { accounts: [row.original] })
		},
		{ accessorKey: 'paymentMethodName', header: 'Payment Method' },
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }: { row: { original: Row } }) =>
				renderComponent(Statuses, { status: row.original.status ? 'active' : 'inactive' })
		},
		{
			accessorKey: 'edit',
			header: 'Edit',
			cell: ({ row }: { row: { original: Row } }) =>
				renderComponent(Edit, {
					data: data.editForm,
					account: row.original,
					paymentMethodList: data.paymentMethodList
				})
		},
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }: { row: { original: Row } }) =>
				renderComponent(Delete, {
					data: data.deleteForm,
					id: row.original.id,
					bankName: row.original.bankName
				})
		}
	];
</script>

<svelte:head>
	<title>Bank Accounts</title>
</svelte:head>

<div class="flex flex-col gap-2 pt-2">
	<h1 class="text-2xl font-bold">Bank Accounts</h1>
	<p class="text-sm text-muted-foreground">
		Company accounts shown at checkout for customers paying by bank transfer. Transfers are checked
		by hand from the receipt the customer uploads.
	</p>
</div>

<div class="mt-4">
	<DialogComp bind:open={addOpen} IconComp={Plus} title="Add Bank Account" variant="default">
		<form action="?/add" method="post" id="add-bank-account" use:enhance class="flex flex-col gap-4">
			<Errors allErrors={$allErrors} />
			<Fields {form} {errors} paymentMethodList={data.paymentMethodList} />
			<Button type="submit" form="add-bank-account" disabled={$delayed}>
				{#if $delayed}
					<LoadingBtn name="Adding Bank Account" />
				{:else}
					<Plus /> Add Bank Account
				{/if}
			</Button>
		</form>
	</DialogComp>
</div>

<DataTable {columns} data={data.allData} fileName="Bank Accounts" />
