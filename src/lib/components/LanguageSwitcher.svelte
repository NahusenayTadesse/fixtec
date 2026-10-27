<script lang="ts">
	import { Languages } from '@lucide/svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import { m } from '$lib/paraglide/messages.js';

	// `setLocale` stores the choice in a cookie and reloads, so the server renders the new language.
	const next = $derived(getLocale() === 'en' ? 'am' : 'en');
</script>

<Button
	variant="ghost"
	size="sm"
	class="gap-2 text-black dark:text-white"
	aria-label={m.nav_language()}
	onclick={() => setLocale(next)}
>
	<Languages class="size-4" />
	{next === 'am' ? m.lang_am() : m.lang_en()}
</Button>
