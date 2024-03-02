<script lang="ts">
	import Meyda from "meyda";
	import { onMount } from "svelte";

	let audioBuffer: AudioBuffer;
	let audioContext: AudioContext;
	let source: AudioBufferSourceNode;
	let analyzer: Meyda.MeydaAnalyzer;
	let canvas: HTMLCanvasElement;
	let features: Record<string, any> | null = null;
	let logValue = "";
	$: ctx = canvas?.getContext?.("2d");
	$: {
		if (ctx && !analyzer) {
			ctx.fillStyle = `hsl(0, 0%, 0%)`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}

	const draw = (t?: number) => {
		if (!ctx) return requestAnimationFrame(draw);
		ctx.fillStyle = `hsl(0, 0%, 0%)`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const chroma = (features?.chroma as number[]) ?? [0, 0, 0];
		const chromaHue = chroma.reduce(
			(a_i, b, i) => (chroma[a_i] > b ? a_i : i),
			0,
		);
		const buffer = features?.buffer ?? [0, 0, 0];
		const width = canvas.width / buffer.length;
		const posY = canvas.height / 2;
		let x = 0;
		let y = posY;
		for (let i = 0; i < buffer.length; i++) {
			ctx.beginPath();
			ctx.strokeStyle = `hsl(${chromaHue * (300 / chroma.length) + 100}, ${100 * features?.rms ?? 0.5 + 25}%, 50%)`;
			ctx.moveTo(x, y);
			x = i * width;
			y = posY - buffer[i] * posY;
			ctx.lineWidth = Math.abs(buffer[i] * 10) + 1;
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		}
		requestAnimationFrame(draw);
	};

	onMount(() => {
		audioContext = new AudioContext();
		draw();
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
				logValue = JSON.stringify(
					{ ...features, complexSpectrum: "NO LOG" },
					null,
					2,
				);
				features = _features;
			},
		});
		analyzer.start();
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

	const playAudio = () => {
		if (audioBuffer) {
			source.start();
		}
	};

	const stopAudio = () => {
		if (source) {
			source.stop();
		}
	};
</script>

<canvas
	bind:this={canvas}
	width={window.innerWidth}
	height={window.innerHeight}
/>
<input type="file" accept=".mp3, .mp4" on:change={handleFileChange} />
<button on:click={playAudio}>Play</button>
<button on:click={stopAudio}>Stop</button>
<pre>{logValue}</pre>

<style>
	canvas {
		width: 100%;
		height: 100vh;
	}
</style>
