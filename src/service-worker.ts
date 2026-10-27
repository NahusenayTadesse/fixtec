/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * SvelteKit registers this worker on its own and rebuilds it with a new `version` on every
 * deploy, so each deploy gets fresh caches and the old ones are dropped on activate.
 *
 * - `static-*`: everything in `static/`, precached; the hashed `/_app/immutable` chunks are added
 *   the first time they are fetched, rather than precaching ~6 MB of dashboard code for shoppers.
 * - `pages-*`: storefront pages and their `__data.json`, network first, so they open offline.
 *   Personal areas are never stored, and the cache is emptied on sign-in and sign-out so nobody
 *   sees the previous user's header offline.
 * - `images`: public images (product photos from `/files`), stale-while-revalidate, capped.
 */

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE = `static-${version}`;
const PAGES_CACHE = `pages-${version}`;
const IMAGES_CACHE = 'images';
const MAX_PAGES = 40;
const MAX_IMAGES = 150;
const OFFLINE_URL = '/offline.html';

const buildAssets = new Set(build);
const staticAssets = new Set(files);

/** Never stored in the page cache: personal, transactional or admin. */
const PRIVATE_PREFIXES = [
	'/dashboard',
	'/account',
	'/checkout',
	'/orders',
	'/api',
	'/login',
	'/logout',
	'/signup',
	'/forgot-password',
	'/reset-password',
	'/change-password',
	'/demo'
];

/** Requests to these change who is signed in, so cached pages are stale afterwards. */
const AUTH_PREFIXES = ['/login', '/logout', '/api/auth'];

const startsWithAny = (path: string, prefixes: string[]) =>
	prefixes.some((p) => path === p || path.startsWith(p + '/'));

/** A response the server said not to keep (receipts are `private, no-store`). */
function storable(response: Response) {
	if (!response.ok || response.type === 'opaque') return false;
	const cc = response.headers.get('cache-control') ?? '';
	return !/no-store|private/i.test(cc);
}

async function trim(cacheName: string, max: number) {
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	// Oldest entries first: `keys()` keeps insertion order.
	await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => cache.addAll([...files, OFFLINE_URL].filter((f, i, a) => a.indexOf(f) === i)))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== STATIC_CACHE && key !== PAGES_CACHE && key !== IMAGES_CACHE) {
					await caches.delete(key);
				}
			}
			// Faster first navigations where supported.
			await sw.registration.navigationPreload?.enable();
			await sw.clients.claim();
		})()
	);
});

async function cacheFirst(request: Request) {
	const cache = await caches.open(STATIC_CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok) cache.put(request, response.clone());
	return response;
}

async function networkFirstPage(event: FetchEvent, store: boolean) {
	const { request } = event;
	try {
		const preloaded = (await event.preloadResponse) as Response | undefined;
		const response = preloaded ?? (await fetch(request));
		if (store && storable(response)) {
			const cache = await caches.open(PAGES_CACHE);
			await cache.put(request, response.clone());
			event.waitUntil(trim(PAGES_CACHE, MAX_PAGES));
		}
		return response;
	} catch {
		const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
		if (cached) return cached;
		if (request.mode === 'navigate') {
			const offline = await caches.match(OFFLINE_URL);
			if (offline) return offline;
		}
		return Response.error();
	}
}

async function staleWhileRevalidate(event: FetchEvent) {
	const cache = await caches.open(IMAGES_CACHE);
	const cached = await cache.match(event.request);
	const network = fetch(event.request)
		.then(async (response) => {
			if (storable(response)) {
				await cache.put(event.request, response.clone());
				await trim(IMAGES_CACHE, MAX_IMAGES);
			}
			return response;
		})
		.catch(() => cached ?? Response.error());

	if (cached) {
		event.waitUntil(network);
		return cached;
	}
	return network;
}

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (url.origin !== location.origin) return;

	if (startsWithAny(url.pathname, AUTH_PREFIXES)) {
		event.waitUntil(caches.delete(PAGES_CACHE));
		return;
	}

	if (request.method !== 'GET') return;

	// `files` holds raw names ("/tools (1).webp"); the URL has them percent-encoded.
	const path = decodeURIComponent(url.pathname);
	if (buildAssets.has(path) || staticAssets.has(path)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	const isData = url.pathname.endsWith('/__data.json');
	const pagePath = isData ? url.pathname.slice(0, -'/__data.json'.length) || '/' : url.pathname;

	if (request.mode === 'navigate' || isData) {
		event.respondWith(networkFirstPage(event, !startsWithAny(pagePath, PRIVATE_PREFIXES)));
		return;
	}

	if (request.destination === 'image' || url.pathname.startsWith('/files/')) {
		event.respondWith(staleWhileRevalidate(event));
	}
});

sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') sw.skipWaiting();
});

// Opening a notification focuses the app (or opens it) on the page the notification points to.
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const target = new URL(event.notification.data?.url ?? '/', location.origin).href;
	event.waitUntil(
		(async () => {
			const windows = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const existing = windows.find((w) => w.url === target) ?? windows[0];
			if (existing) {
				await existing.focus();
				if (existing.url !== target) await existing.navigate(target).catch(() => {});
				return;
			}
			await sw.clients.openWindow(target);
		})()
	);
});
