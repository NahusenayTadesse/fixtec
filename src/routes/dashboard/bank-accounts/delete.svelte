<script lang="ts">
	import { Trash } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import type { remove } from './schema';

	let { data, id, bankName }: { data: SuperValidated<Infer<typeof remove>>; id: number; bankName: string } =
		$props();

	let open = $state(false);
	const formId = $props.id();

	const { enhance, delayed } = superForm(data, {
		id: formId,
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
</script>

<DialogComp bind:open variant="ghost" title="" dialogTitle="Delete {bankName}?" IconComp={Trash}>
	<p class="text-sm text-muted-foreground">
		This removes the account from the list shown at checkout. To hide it only for a while, set it to
		Inactive instead.
	</p>
	<form method="post" action="?/delete" id={formId} use:enhance class="flex justify-end gap-2 pt-4">
		<input type="hidden" name="id" value={id} />
		<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
		<Button type="submit" variant="destructive" disabled={$delayed}>
			{#if $delayed}
				<LoadingBtn name="Deleting" />
			{:else}
				<Trash class="h-4 w-4" /> Delete
			{/if}
		</Button>
	</form>
</DialogComp>
