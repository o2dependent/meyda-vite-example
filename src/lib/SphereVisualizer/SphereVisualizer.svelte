<script lang="ts">
	import Meyda from "meyda";
	import { onMount } from "svelte";
	import { BabylonTestApp } from "./App";

	export let audioList: { name: string; url: string }[] = [];

	let loading = true;
	let isAudioListOpen = false;

	let app: BabylonTestApp;

	let audioBuffer: AudioBuffer;
	let audioContext: AudioContext;
	let source: AudioBufferSourceNode;
	let analyzer: Meyda.MeydaAnalyzer;
	let features: Record<string, any> | null = null;
	onMount(() => {
		const canvas = document.getElementById(
			"babylon-canvas",
		) as HTMLCanvasElement;

		app = new BabylonTestApp(canvas);
		app.setup().then(() => {
			audioContext = new AudioContext();

			handleRemoteAudio("/audio/kthx - tothawall.mp3").then(
				() => (loading = false),
			);
		});

		return () => {
			app.dispose();
		};
	});

	const setAnalyzer = () => {
		if (analyzer) analyzer.stop();

		analyzer = Meyda.createMeydaAnalyzer({
			audioContext: audioContext,
			source: source,
			bufferSize: 512,
			featureExtractors: [
				"rms",
				"spectralFlatness",
				"chroma",
				"zcr",
				"complexSpectrum",
				"mfcc",
				"amplitudeSpectrum",
				"energy",
				"loudness",
				"perceptualSharpness",
				"perceptualSpread",
				"powerSpectrum",
				"spectralCentroid",
				"spectralKurtosis",
				"spectralRolloff",
				"spectralSkewness",
				"spectralSlope",
				"spectralSpread",
				"buffer",
			] satisfies Meyda.MeydaAudioFeature[],
			inputs: 2,
			callback: (_features) => {
				features = _features;
				if (features !== null) app.setMeydaFeatures(features);
			},
		});
		analyzer.start();
		app.setMeydaAnalyser(analyzer);
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];

		if (file) {
			const reader = new FileReader();

			reader.onload = (e) => {
				const buffer = e?.target?.result;
				loadAudioBuffer(buffer).then(setAnalyzer);
			};

			reader.readAsArrayBuffer(file);
		}
	};

	const loadAudioBuffer = async (buffer) => {
		try {
			audioBuffer = await audioContext.decodeAudioData(buffer);

			source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			source.connect(audioContext.destination);

			console.log("Audio buffer loaded:", audioBuffer);
		} catch (error) {
			console.error("Error decoding audio data:", error);
		}
	};

	const handleRemoteAudio = async (url) => {
		const res = await fetch(url);
		const buffer = await res.arrayBuffer();
		loadAudioBuffer(buffer).then(setAnalyzer);
	};

	let playing = false;

	const playAudio = () => {
		if (playing || !audioBuffer) {
			return;
		}
		source = audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(audioContext.destination);
		analyzer.setSource(source);
		source.start();
		playing = true;
	};

	const stopAudio = () => {
		if (source && playing) {
			source.stop();
			playing = false;
		}
	};

	const togglePlay = () => (playing ? stopAudio() : playAudio());
</script>

<div
	class="fixed bottom-2 left-1/2 -translate-x-1/2 container rounded-full px-2 py-1 bg-gray-950 border border-gray-700"
>
	<div class="flex gap-2">
		<button type="button">
			{loading ? "Loading..." : playing ? "Stop" : "Play"}
		</button>
		<button type="button" on:click={() => (isAudioListOpen = !isAudioListOpen)}>
		</button>
		<div
			class="absolutes bottom-full -translate-y-2 left-0 p-2 flex justify-center items-center"
		>
			{#each audioList as { name, url }}
				<!-- content here -->
				<button
					class="bg-blue-50"
					type="button"
					on:click={() => handleRemoteAudio(url)}
				>
					{name}
				</button>
			{:else}
				<p>No audio here!</p>
			{/each}
			<input
				style="width: 10rem;"
				type="file"
				accept=".mp3, .mp4"
				on:change={handleFileChange}
			/>
		</div>
	</div>
</div>
<canvas
	on:click={!loading ? togglePlay : undefined}
	style="width: 100%; height: 100%;"
	id="babylon-canvas"
	width="100%"
	height="100%"
></canvas>
