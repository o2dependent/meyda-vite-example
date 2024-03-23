<script lang="ts">
	import { onMount } from "svelte";
	import { BabylonTestApp } from "./App";

	let app: BabylonTestApp;

	onMount(() => {
		const canvas = document.getElementById(
			"babylon-canvas",
		) as HTMLCanvasElement;

		app = new BabylonTestApp(canvas);
	});
</script>

<canvas
	style="width: 100%; height: 100%;"
	id="babylon-canvas"
	width="100%"
	height="100%"
></canvas>
