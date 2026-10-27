import { browser } from '$app/environment';

/** Chrome/Edge/Samsung's install event; not in the DOM typings. */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
	interface Window {
		__installPrompt?: BeforeInstallPromptEvent | null;
	}
}

/** Which manual steps to show when the browser has no install prompt to offer. */
export type InstallPlatform = 'ios' | 'android' | 'desktop';

function detectPlatform(): InstallPlatform {
	const ua = navigator.userAgent;
	// iPadOS reports itself as a Mac, but has touch.
	if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
		return 'ios';
	}
	return /android/i.test(ua) ? 'android' : 'desktop';
}

function runningInstalled() {
	return (
		matchMedia('(display-mode: standalone)').matches ||
		matchMedia('(display-mode: window-controls-overlay)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

class Pwa {
	/** The deferred native prompt, when the browser offers one. */
	#prompt = $state<BeforeInstallPromptEvent | null>(null);
	installed = $state(false);
	online = $state(true);
	platform = $state<InstallPlatform>('desktop');

	/** Whether pressing "install" opens the browser's own dialog (otherwise: instructions). */
	canPrompt = $derived(this.#prompt !== null);

	#started = false;

	/** Wires the browser events up once; safe to call from every component that needs it. */
	start() {
		if (!browser || this.#started) return;
		this.#started = true;

		this.platform = detectPlatform();
		this.installed = runningInstalled();
		this.online = navigator.onLine;
		this.#prompt = window.__installPrompt ?? null;

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.#prompt = e as BeforeInstallPromptEvent;
		});
		window.addEventListener('appinstalled', () => {
			this.installed = true;
			this.#prompt = window.__installPrompt = null;
		});
		matchMedia('(display-mode: standalone)').addEventListener('change', () => {
			this.installed = runningInstalled();
		});
		window.addEventListener('online', () => (this.online = true));
		window.addEventListener('offline', () => (this.online = false));
	}

	/** Shows the native install dialog. Resolves to whether the user accepted. */
	async install() {
		const prompt = this.#prompt;
		if (!prompt) return false;
		// A prompt can only be used once.
		this.#prompt = window.__installPrompt = null;
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === 'accepted') this.installed = true;
		return outcome === 'accepted';
	}
}

export const pwa = new Pwa();

/**
 * Shows a system notification. Goes through the service worker where there is one: Android
 * Chrome throws on `new Notification()`, and a worker notification can reopen the app on click.
 */
export async function notify(title: string, body: string, url = location.pathname) {
	if (!('Notification' in window) || Notification.permission !== 'granted') return;
	const options: NotificationOptions = {
		body,
		icon: '/icons/icon-192.png',
		badge: '/icons/maskable-192.png',
		data: { url }
	};
	const registration = await navigator.serviceWorker?.getRegistration();
	if (registration) await registration.showNotification(title, options);
	else new Notification(title, options);
}
