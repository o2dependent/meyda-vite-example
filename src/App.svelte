<script lang="ts">
	import logo from "./assets/svelte.png";
	import AudioInput from "./lib/AudioInput.svelte";
	import Counter from "./lib/Counter.svelte";
	import Metaballs from "./lib/Metaballs/Metaballs.svelte";
	import TestWebGl from "./lib/TestWebGl/TestWebGl.svelte";
	import VisualizeMicrophone from "./lib/VisualizeMicrophone.svelte";
</script>

<Metaballs />

<!-- <TestWebGl /> -->
<!-- <AudioInput /> -->
<!-- <VisualizeMicrophone /> -->

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
			Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	}
	:global(html, body) {
		height: 100%;
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
</style>
