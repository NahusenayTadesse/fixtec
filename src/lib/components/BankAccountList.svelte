<script lang="ts">
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { Check, Copy, Landmark } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	export type BankAccount = {
		id: number;
		bankName: string;
		accountName: string;
		accountNumber: string;
	};

	let { accounts }: { accounts: BankAccount[] } = $props();

	/** The row whose number was just copied, for a moment of visual confirmation. */
	let copiedId = $state<number | null>(null);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * `navigator.clipboard` only exists on secure origins (https, localhost), so a
	 * plain-http visit falls back to the older copy command.
	 */
	async function writeToClipboard(text: string) {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return;
		}
		const area = document.createElement('textarea');
		area.value = text;
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand('copy');
		area.remove();
		if (!ok) throw new Error('Copy command failed');
	}

	async function copy(account: BankAccount) {
		try {
			await writeToClipboard(account.accountNumber);
			toast.success(`${account.bankName} account number copied`);
			copiedId = account.id;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copiedId = null), 2000);
		} catch {
			toast.error('Could not copy — please copy the number by hand');
		}
	}
</script>

<ul class="flex flex-col gap-2">
	{#each accounts as account (account.id)}
		<li class="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
			<div class="flex min-w-0 items-center gap-3">
				<div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Landmark class="size-4" />
				</div>
				<div class="min-w-0">
					<p class="text-sm font-semibold">{account.bankName}</p>
					<p class="truncate text-xs text-muted-foreground">{account.accountName}</p>
					<p class="font-mono text-sm tracking-wide">{account.accountNumber}</p>
				</div>
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="shrink-0"
				aria-label="Copy {account.bankName} account number"
				onclick={() => copy(account)}
			>
				{#if copiedId === account.id}
					<Check class="size-4 text-green-600" /> Copied
				{:else}
					<Copy class="size-4" /> Copy
				{/if}
			</Button>
		</li>
	{/each}
</ul>
