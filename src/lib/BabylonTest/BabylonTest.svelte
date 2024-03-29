<script lang="ts">
	import Meyda from "meyda";
	import { onMount } from "svelte";
	import { BabylonTestApp } from "./App";

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
		audioContext = new AudioContext();

		return () => {
			app.dispose();
		};
	});

	const setAnalyzer = () => {
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
				app.setMeydaFeatures(features);
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
				const buffer = e.target.result;
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

<div style="width: 100%; position: fixed; top: 0; left-0;">
	<input type="file" accept=".mp3, .mp4" on:change={handleFileChange} />
</div>
<canvas
	on:click={togglePlay}
	style="width: 100%; height: 100%;"
	id="babylon-canvas"
	width="100%"
	height="100%"
></canvas>
