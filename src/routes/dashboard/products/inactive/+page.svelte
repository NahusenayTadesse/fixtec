<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import { updateFlash } from 'sveltekit-flash-message';

	import { Frown, RotateCcw } from '@lucide/svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	let selected: (typeof data.productList)[number][] = $state([]);
	let activating = $state(false);
</script>

<svelte:head>
	<title>Inactive Products</title>
</svelte:head>

<h2 class="my-4 text-2xl">No of Inactive Products {data.table.pagination.total}</h2>

{#if data.productList.length === 0 && !data.filtered}
	<div class="flex h-96 w-full flex-col items-center justify-center lg:w-5xl">
		<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			No Inactive Products
		</p>
	</div>
{:else}
	<div class="mt-4 w-6xl p-0 lg:w-full lg:p-0">
		{#if selected.length > 0}
			<div class="my-2 flex items-center gap-3 rounded-md border bg-muted p-3">
				<span class="text-sm">{selected.length} product(s) selected</span>
				<form
					method="post"
					action="?/bulkActivate"
					use:enhance={() => {
						activating = true;
						return async ({ result, update }) => {
							await update();
							activating = false;
							updateFlash(page);
							if (result.type === 'success') {
								selected = [];
							}
						};
					}}
				>
					{#each selected as product (product.id)}
						<input type="hidden" name="ids" value={product.id} />
					{/each}
					<Button type="submit" variant="default" size="sm" disabled={activating}>
						<RotateCcw />
						{activating ? 'Activating...' : 'Activate Selected'}
					</Button>
				</form>
			</div>
		{/if}

		<DataTable
			data={data.productList}
			{columns}
			fileName="Inactive Product List"
			bind:selected
			getRowId={(product) => String(product.id)}
			server={data.table}
			facetKeys={['category', 'supplier']}
		/>
	</div>
{/if}
