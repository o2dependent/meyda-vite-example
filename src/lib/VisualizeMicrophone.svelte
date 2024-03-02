<script lang="ts">
	import Meyda from "meyda";

	let audioContext: AudioContext;
	let source: MediaStreamAudioSourceNode;
	let analyzer: Meyda.MeydaAnalyzer;
	let logValue = "";
	let canvas: HTMLCanvasElement;
	$: ctx = canvas?.getContext?.("2d");

	const setAnalyzer = (
		audioContext: AudioContext,
		source: MediaStreamAudioSourceNode,
	) => {
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
			callback: (features) => {
				logValue = JSON.stringify(
					{ ...features, complexSpectrum: "NO LOG" },
					null,
					2,
				);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// ctx.fillStyle = `hsl(0, 0%, ${100 * features.rms}%)`;
				ctx.fillStyle = `hsl(0, 0%, 0%)`;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				// const chroma = features.complexSpectrum.imag;
				const chroma = features.buffer;
				const width = canvas.width / chroma.length;
				let x = 0;
				let y = canvas.height / 2;
				for (let i = 0; i < chroma.length; i++) {
					// ctx.fillStyle = `hsl(${(i / chroma.length) * 300}, ${chroma[i] * 100}%, 100%)`;
					// ctx.fillStyle = `hsl(${Math.round((i / chroma.length) * 300 - 100)}, ${(chroma[i] / 16) * 100}%, 50%)`;

					// ctx.fillStyle = `hsl(100, 100%,  50%)`;
					// ctx.fillRect(
					// 	i * width,
					// 	canvas.height / 2,
					// 	width,
					// 	(chroma[i] * canvas.height) / 2,
					// );
					ctx.beginPath();
					ctx.strokeStyle = `hsl(${(i / chroma.length) * 300}, ${50 * features.energy}%, 50%)`;
					// ctx.moveTo(i * width, canvas.height / 2);
					ctx.moveTo(x, y);
					x = i * width;
					y = canvas.height / 2 - chroma[i] * canvas.height;
					ctx.lineTo(x, y);
					ctx.stroke();

					// ctx.lineTo(
					// 	i * width,
					// 	canvas.height / 2 - chroma[i] * canvas.height,
					// );
				}
			},
		});
		analyzer.start();
	};

	// Check for browser compatibility
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		// Request access to the microphone
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then(function (stream) {
				// Create an audio context
				audioContext = new AudioContext();

				// Create a media stream source node
				source = audioContext.createMediaStreamSource(stream);

				// Now you can use 'source' to process or analyze the microphone input
				// For example, you can connect it to an analyser node to visualize the audio
				// analyser = audioContext.createAnalyser();
				// source.connect(analyser);
				setAnalyzer(audioContext, source);

				// Start processing or analyzing audio
				// (You may want to add your own audio processing logic here)

				// Stop the microphone access when done
				// stream.getTracks().forEach(track => track.stop());
			})
			.catch(function (err) {
				console.error("Error accessing microphone: ", err);
			});
	} else {
		console.error("getUserMedia not supported in this browser");
	}

	// const analyzer = Meyda.createMeydaAnalyzer({
	// 	audioContext: audioContext,
	// 	source: source,
	// 	bufferSize: 512,
	// 	featureExtractors: ["rms"],
	// 	inputs: 2,
	// });
</script>

<canvas
	bind:this={canvas}
	width={window.innerWidth}
	height={window.innerHeight}
/>

<button
	type="button"
	on:click={() => {
		analyzer.start();
	}}
>
	start
</button>
<button
	type="button"
	on:click={() => {
		analyzer.stop();
	}}
>
	stop
</button>
<pre style="text-align: left;">{logValue}</pre>

<style>
	canvas {
		width: 100%;
		height: 100vh;
	}
</style>
