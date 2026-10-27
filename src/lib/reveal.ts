/**
 * Scroll reveals for the storefront: any element marked `data-reveal` (`up`, `left`, `right`,
 * `zoom`) fades in the first time it scrolls into view. A stagger is a `--d` delay on the
 * element, e.g. `style="--d: {i * 80}ms"`. The look lives in `layout.css`.
 *
 * One observer for the whole site rather than one per element, and a `MutationObserver` so
 * elements that arrive later — a client-side navigation, an `{#if}` that opens, a carousel's
 * slides — are picked up without each component wiring itself in.
 */
const REVEALED = 'is-revealed';

export function startReveal(root: HTMLElement) {
	if (!('IntersectionObserver' in window)) {
		// No observer, no hiding: show everything as it is.
		root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add(REVEALED));
		return () => {};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add(REVEALED);
				observer.unobserve(entry.target);
			}
		},
		// A little before the element is fully on screen, so it is moving as it arrives.
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
	);

	const watch = (scope: ParentNode) => {
		scope.querySelectorAll(`[data-reveal]:not(.${REVEALED})`).forEach((el) => observer.observe(el));
	};

	watch(root);

	const mutations = new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (!(node instanceof Element)) continue;
				if (node.matches('[data-reveal]') && !node.classList.contains(REVEALED)) {
					observer.observe(node);
				}
				watch(node);
			}
		}
	});
	mutations.observe(root, { childList: true, subtree: true });

	return () => {
		mutations.disconnect();
		observer.disconnect();
	};
}
