import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { adminKit } from '@nahu/admin-kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), adminKit()],
	server: {
		// None of these are part of the app. Watching them made editing a test, or
		// Playwright writing its results, force a full reload of every open page —
		// mid-test, that aborted navigations.
		watch: { ignored: ['**/e2e/**', '**/test-results/**', '**/playwright-report/**'] }
	}
});
