<script lang="ts">
	import { rowNumber } from '@nahu/admin-kit/components/Table/row-number';
	let { data } = $props();

	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	import { ArrowLeft } from '@lucide/svelte';

	import Empty from '@nahu/admin-kit/components/Empty.svelte';

	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import DataTableSort from '@nahu/admin-kit/components/Table/data-table-sort.svelte';
	import OrderItems from '../../../orders/order-items.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	export const columns = [
		{
			accessorKey: 'index',
			header: '#',
			cell: rowNumber,
			sortable: false
		},

		{
			accessorKey: 'items',
			header: 'Items',
			enableSorting: false,
			cell: ({ row }) => {
				return renderComponent(OrderItems, {
					items:
						data?.allItems?.filter((item) => Number(item.orderId) === Number(row.original.id)) ??
						[],
					currency: 'ETB'
				});
			}
		},

		{
			accessorKey: 'status',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Status',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => {
				return renderComponent(Statuses, {
					status: row.original.status
				});
			}
		},

		{
			accessorKey: 'createdAt',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Ordered On',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		}
	];

	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Order History for {data?.customer?.customerName}</title>
</svelte:head>
<Button href="/dashboard/customers/{page.params.id}">
	<ArrowLeft /> Back
</Button>
{#if data?.allData}
	<header class="mt-6 flex w-lg flex-col gap-1 pb-4">
		<h1 class="text-3xl font-bold tracking-tight text-foreground">Order History</h1>
		<p class="text-sm text-foreground">
			Viewing records for <span class="font-semibold text-slate-700"
				>{data?.customer?.customerName}</span
			>
		</p>
	</header>
	<DataTable
		{columns}
		data={data.allData}
		class="w-6xl!"
		fileName="Orders - {data?.customer?.customerName}"
		server={data.table}
		facetKeys={['status']}
		dateFilter="Ordered"
	/>
{:else}
	<Empty title="orders" />
{/if}
