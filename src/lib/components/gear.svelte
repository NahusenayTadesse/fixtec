<script lang="ts">
	/**
	 * A machined gear, drawn rather than imported so its teeth match its size: two gears with
	 * the same tooth width mesh when their tooth counts and spin speeds are in the same ratio.
	 * Decoration only, so hidden from assistive technology.
	 */
	let {
		teeth = 16,
		spokes = 5,
		class: className = ''
	}: { teeth?: number; spokes?: number; class?: string } = $props();

	const OUTER = 100;
	const ROOT = 86;
	const RIM = 66;
	const HUB = 20;

	const point = (r: number, a: number) =>
		`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;

	/* The outline: each tooth a trapezoid rising from the root circle, narrower at its tip. */
	const outline = $derived.by(() => {
		const step = (Math.PI * 2) / teeth;
		const parts: string[] = [];
		for (let i = 0; i < teeth; i++) {
			const a = i * step;
			parts.push(
				`${i === 0 ? 'M' : 'L'} ${point(ROOT, a - step * 0.3)}`,
				`L ${point(OUTER, a - step * 0.17)}`,
				`L ${point(OUTER, a + step * 0.17)}`,
				`L ${point(ROOT, a + step * 0.3)}`,
				`A ${ROOT} ${ROOT} 0 0 1 ${point(ROOT, a + step * 0.7)}`
			);
		}
		return parts.join(' ') + ' Z';
	});

	/* The web inside the rim: a ring cut out, with spokes left standing to the hub. */
	const windows = $derived.by(() => {
		const step = (Math.PI * 2) / spokes;
		const half = step * 0.5 - 0.16;
		const paths: string[] = [];
		for (let i = 0; i < spokes; i++) {
			const a = i * step + step / 2;
			paths.push(
				`M ${point(HUB + 8, a - half * 0.75)} L ${point(RIM, a - half)} ` +
					`A ${RIM} ${RIM} 0 0 1 ${point(RIM, a + half)} L ${point(HUB + 8, a + half * 0.75)} Z`
			);
		}
		return paths.join(' ');
	});

	/* The hole the shaft goes through, as two half circles. */
	const AXLE = HUB / 2;
	const axle = `M ${AXLE} 0 A ${AXLE} ${AXLE} 0 1 0 ${-AXLE} 0 A ${AXLE} ${AXLE} 0 1 0 ${AXLE} 0 Z`;
</script>

<svg viewBox="-100 -100 200 200" class={className} aria-hidden="true" focusable="false">
	<path d="{outline} {windows} {axle}" fill="currentColor" fill-rule="evenodd" />
</svg>
