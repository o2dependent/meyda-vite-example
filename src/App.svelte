<script lang="ts">
	import logo from "./assets/svelte.png";
	import AudioInput from "./lib/AudioInput.svelte";
	import SphereVisualizer from "./lib/SphereVisualizer/SphereVisualizer.svelte";
	import Counter from "./lib/Counter.svelte";
	import Gallery from "./lib/Gallery/Gallery.svelte";
	import Metaballs from "./lib/Metaballs/Metaballs.svelte";
	import PolyLines from "./lib/PolyLines/PolyLines.svelte";
	import PostFluidDistortion from "./lib/PostFluidDistortion/PostFluidDistortion.svelte";
	import TestWebGl from "./lib/TestWebGl/TestWebGl.svelte";
	import VisualizeMicrophone from "./lib/VisualizeMicrophone.svelte";
</script>

<!-- <Metaballs /> -->

<!-- <TestWebGl /> -->

<!-- <PolyLines /> -->

<!-- <PostFluidDistortion /> -->

<SphereVisualizer
	audioList={[
		{ url: "/audio/kthx - tothawall.mp3", name: "kthx - tothawall" },
		{
			url: "/audio/Enzuna: Stepa K - Shadow (Enzuna Remix).mp3",
			name: "Enzuna: Stepa K - Shadow (Enzuna Remix)",
		},
	]}
/>

<!-- <Gallery /> -->

<!-- <AudioInput /> -->

<!-- <VisualizeMicrophone /> -->

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
			Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	}
	:global(html, body) {
		height: 100%;
		width: 100%;

		margin: 0;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden !important;
	}
	:global(body *) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	:global(#app) {
		height: 100%;
		width: 100%;
	}
</style>
