<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import * as Dialog from '@nahu/admin-kit/components/ui/dialog/index.js';
	import { ScrollArea } from '@nahu/admin-kit/components/ui/scroll-area/index.js';
	import { updateFlash } from 'sveltekit-flash-message';

	import { Frown, Plus, Trash } from '@lucide/svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	let selected: (typeof data.productList)[number][] = $state([]);
	let confirmOpen = $state(false);
	let deleting = $state(false);
</script>

<svelte:head>
	<title>Products List</title>
</svelte:head>

<h2 class="my-4 text-2xl">No of Products {data.table.pagination.total}</h2>

{#if data.productList.length === 0 && !data.filtered}
	<div class="flex h-96 w-full flex-col items-center justify-center lg:w-5xl">
		<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			Products List is Empty
		</p>
		<Button href="/dashboard/products/add-products"><Plus />Add New Products</Button>
	</div>
{:else}
	<div class="mt-4 w-6xl p-0 lg:w-full lg:p-0">
		{#if selected.length > 0}
			<div class="my-2 flex items-center gap-3 rounded-md border bg-muted p-3">
				<span class="text-sm">{selected.length} product(s) selected</span>
				<Button variant="destructive" size="sm" onclick={() => (confirmOpen = true)}>
					<Trash /> Deactivate Selected
				</Button>
			</div>
		{/if}

		<DataTable
			data={data.productList}
			{columns}
			fileName="Product List"
			bind:selected
			getRowId={(product) => String(product.id)}
			server={data.table}
			facetKeys={['category', 'supplier']}
		/>
	</div>

	<Dialog.Root bind:open={confirmOpen}>
		<Dialog.Content class="w-full">
			<Dialog.Header>
				<Dialog.Title>Deactivate {selected.length} product(s)</Dialog.Title>
			</Dialog.Header>
			<ScrollArea class="h-auto rounded-md border p-2">
				<h5 class="text-center">
					Are you sure you want to deactivate {selected.length} selected product(s)?
				</h5>
				<div class="flex flex-row items-center justify-center gap-4 pt-4">
					<form
						method="post"
						action="?/bulkDelete"
						use:enhance={() => {
							deleting = true;
							return async ({ result, update }) => {
								await update();
								deleting = false;
								updateFlash(page);
								if (result.type === 'success') {
									confirmOpen = false;
									selected = [];
								}
							};
						}}
					>
						{#each selected as product (product.id)}
							<input type="hidden" name="ids" value={product.id} />
						{/each}
						<Button type="submit" disabled={deleting} variant="destructive" size="lg">
							<Trash />
							{deleting ? 'Deactivating...' : 'Deactivate'}
						</Button>
					</form>

					<Button onclick={() => (confirmOpen = false)} size="lg">Cancel</Button>
				</div>
			</ScrollArea>
		</Dialog.Content>
	</Dialog.Root>
{/if}
