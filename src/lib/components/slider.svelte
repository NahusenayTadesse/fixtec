<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Autoplay from 'embla-carousel-autoplay';
	const plugin = Autoplay({ delay: 1000, stopOnInteraction: true });

	let { imagesList = [] }: { imagesList: (string | null)[] } = $props();
</script>

<section class="relative z-0 mx-auto max-w-full py-24 md:py-32 lg:px-6">
	<div class="mx-auto lg:max-w-7xl">
		<div data-reveal="up" class="mb-16 max-w-3xl justify-self-center md:mb-20">
			<h3 class="text-center text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl">
				{m.slider_title()} <span class="text-shimmer">{m.slider_title_highlight()}</span>
			</h3>
			<p class="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
				{m.slider_text()}
			</p>
		</div>

		<Carousel.Root
			data-reveal="up"
			style="--d: 150ms"
			class="w-[70%] justify-self-center lg:w-full"
			opts={{
				align: 'center',
				loop: true
			}}
			plugins={[plugin]}
			onmouseenter={plugin.stop}
			onmouseleave={plugin.reset}
		>
			<Carousel.Content>
				{#each imagesList as src (src)}
					<Carousel.Item class="basis-1/2 px-0 md:basis-1/3 lg:basis-1/5 lg:px-4">
						<div
							class="flex w-full items-center justify-center rounded-3xl p-4 glass transition-all duration-500 hover:-translate-y-1"
						>
							<img
								src="/files/{src}"
								alt={m.slider_logo_alt()}
								loading="lazy"
								class="rounded-2xl object-cover transition-transform duration-500 ease-out hover:scale-105"
							/>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	</div>
</section>
