<script lang="ts">
	import { navigateWithQuery } from '@nahu/admin-kit/queryFilters';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	/**
	 * The default window of a history list, beside the table's own date control: this month, or
	 * every row ever recorded. `null` while the reader has picked dates of their own.
	 */
	let { period }: { period: 'month' | 'all' | null } = $props();

	// Picking one drops any chosen dates, which would otherwise keep overriding it.
	const choose = (next: 'month' | 'all') =>
		navigateWithQuery({
			period: next === 'all' ? 'all' : null,
			dateStart: null,
			dateEnd: null,
			page: 1
		});
</script>

<div class="flex flex-row flex-wrap items-center gap-2">
	<Button
		size="sm"
		variant={period === 'month' ? 'default' : 'outline'}
		onclick={() => choose('month')}
	>
		This month
	</Button>
	<Button
		size="sm"
		variant={period === 'all' ? 'default' : 'outline'}
		onclick={() => choose('all')}
	>
		All time
	</Button>
</div>
