import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { adminKit } from '@nahu/admin-kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		adminKit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// No locale prefix in URLs: the choice lives in a cookie, so existing links and redirects stay as they are.
			strategy: ['cookie', 'preferredLanguage', 'baseLocale']
		})
	],
	server: {
		// None of these are part of the app. Watching them made editing a test, or
		// Playwright writing its results, force a full reload of every open page —
		// mid-test, that aborted navigations.
		watch: { ignored: ['**/e2e/**', '**/test-results/**', '**/playwright-report/**'] }
	}
});
