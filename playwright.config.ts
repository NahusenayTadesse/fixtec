import { defineConfig } from '@playwright/test';
import { BASE_URL, USE_DEV_SERVER } from './e2e/base-url';

export default defineConfig({
	// Tests run against a production build by default. The dev server serves every
	// source module separately (200–300 requests per page load), and a long run
	// exhausts the browser (`ERR_INSUFFICIENT_RESOURCES`, crashed tabs) — which
	// says nothing about the app. `PW_DEV=1` runs against `npm run dev` instead,
	// reusing one that's already up, for quick iteration.
	//
	// better-auth only trusts `ORIGIN`, so it's set to wherever the server runs.
	webServer: USE_DEV_SERVER
		? {
				command: 'npm run dev -- --port 5173 --strictPort',
				url: BASE_URL,
				reuseExistingServer: true,
				timeout: 120_000
			}
		: {
				command: 'npx vite build && npx vite preview --port 4173 --strictPort',
				url: BASE_URL,
				env: { ORIGIN: BASE_URL },
				reuseExistingServer: false,
				timeout: 300_000
			},
	use: { baseURL: BASE_URL },
	testMatch: '**/*.e2e.{ts,js}',
	// The flows share one database and build on each other (sign up → order →
	// admin sees it), so they run in order in a single worker.
	workers: 1,
	fullyParallel: false,
	timeout: 60_000
});
