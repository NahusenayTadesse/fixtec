<script>
	import { rowNumber } from '@nahu/admin-kit/components/Table/row-number';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import DataTableSort from '@nahu/admin-kit/components/Table/data-table-sort.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';

	import Read from './read.svelte';
	import Delete from './delete.svelte';
	import BigText from './bigText.svelte';

	const columns = [
		{
			id: 'index',
			header: '#',
			cell: rowNumber,
			enableSorting: false
		},

		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Name',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		},

		{
			accessorKey: 'phone',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Phone',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => renderComponent(Copy, { data: row.original.phone })
		},
		{
			accessorKey: 'email',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Email',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => renderComponent(Copy, { data: row.original.email })
		},
		{
			accessorKey: 'subject',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Subject',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		},

		{
			accessorKey: 'address',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Address',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		},
		{
			accessorKey: 'message',
			header: 'Message',
			sortable: false,
			cell: ({ row }) => renderComponent(BigText, { text: row.original.message })
		},

		{
			accessorKey: 'createdAt',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Submitted At',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return formatDate(row.original.submittedAt);
			}
		},
		{
			accessorKey: 'isRead',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Read Status',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return row.original.isRead
					? renderComponent(Statuses, {
							status: 'Read'
						})
					: renderComponent(Read, {
							id: row.original.id,
							action: '?/read',
							data: data.readForm
						});
			}
		},
		{
			id: 'delete',
			header: 'Delete',
			enableSorting: false,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return renderComponent(Delete, {
					id: row.original.id,
					action: '?/delete',
					data: data.deleteForm
				});
			}
		}
	];
	let { data } = $props();

	import Copy from '@nahu/admin-kit/Copy.svelte';
	import { formatEthiopianDate as formatDate } from '$lib/global.svelte.js';
</script>

<svelte:head>
	<title>Messages</title>
</svelte:head>
<DataTable
	{columns}
	data={data.allPaymentMethods}
	fileName="Messages"
	server={data.table}
	facetKeys={['subject', 'isRead']}
	facetLabels={{ isRead: 'Read Status' }}
	dateFilter="Submitted"
/>
