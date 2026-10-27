<script lang="ts">
	import { page } from '$app/state';
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	import { ArrowLeft } from '@lucide/svelte';
	import PeriodButtons from '$lib/components/Table/period-buttons.svelte';
</script>

<svelte:head>
	<title>Quantity Change History</title>
</svelte:head>
<Button href="/dashboard/products/single/{page.params.id}" class="justify-self-start"
	><ArrowLeft /> Back</Button
>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 class="my-4 text-2xl">No of Changes {data.table.pagination.total}</h2>
		<PeriodButtons period={data.period} />
	</div>

	<DataTable
		data={data.allTransactions}
		{columns}
		fileName="Quantity Change History"
		server={data.table}
		facetKeys={['quantity', 'type', 'variant', 'supplier']}
		facetLabels={{ quantity: 'Direction' }}
		dateFilter="Changed"
	/>
</div>
