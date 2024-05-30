<script lang="ts">
	import Meyda from "meyda";
	import { onMount } from "svelte";
	import { BabylonTestApp } from "./App";
	import {
		Avatar,
		DropdownMenu,
		Label,
		ScrollArea,
		Separator,
		Toolbar,
	} from "bits-ui";
	import Play from "../icons/Play.svelte";
	import Stop from "../icons/Stop.svelte";
	import ListBullet from "../icons/ListBullet.svelte";
	import { fly } from "svelte/transition";
	import MagicWand from "../icons/MagicWand.svelte";
	import File from "../icons/File.svelte";
	import DotFilled from "../icons/DotFilled.svelte";

	export let audioList: { name: string; url: string }[] = [];

	let loading = true;
	let isAudioListOpen = false;
	let isDropdownOpen = false;
	let currentAudioName = "kthx - tothawall";
	let willRecord = false;
	let isRecording = false;

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

			handleRemoteAudio("/audio/kthx - tothawall.mp3", "kthx - tothawall").then(
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
				currentAudioName =
					file?.name?.split(/.mp3|.mp4/)?.[0] ?? "Custom Audio";
			};

			reader.readAsArrayBuffer(file);
		}
	};

	const loadAudioBuffer = async (buffer) => {
		if (playing) stopAudio();

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

	const handleRemoteAudio = async (url: string, name: string) => {
		const res = await fetch(url);
		const buffer = await res.arrayBuffer();
		loadAudioBuffer(buffer).then(setAnalyzer);
		currentAudioName = name;
	};

	let playing = false;

	const playAudio = () => {
		if (playing || !audioBuffer) {
			return;
		}
		if (willRecord) {
			isRecording = true;
			app.startRecording();
		}
		source = audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(audioContext.destination);
		analyzer.setSource(source);
		source.start();
		source.addEventListener("ended", (e) => {
			stopAudio();
		});
		playing = true;
	};

	const stopAudio = () => {
		if (source && playing) {
			source.stop();
			playing = false;
		}
		if (isRecording) {
			isRecording = false;
			app.stopRecording();
		}
	};

	const togglePlay = () => (playing ? stopAudio() : playAudio());
</script>

<div
	class="fixed bottom-2 left-1/2 -translate-x-1/2 container w-fit flex items-center justify-center"
>
	<Toolbar.Root
		class="flex h-12 items-center justify-center rounded-10px border border-border bg-background-alt px-[4px] py-1 shadow-mini"
	>
		<div class="flex items-center">
			<Toolbar.Button
				on:click={!loading ? togglePlay : undefined}
				class="inline-flex items-center justify-center rounded-9px px-3 py-2 text-sm  font-medium text-foreground/80 transition-all hover:bg-muted active:scale-98 active:bg-dark-10"
			>
				{#if playing}
					<Stop class="size-6" />
				{:else}
					<Play class="size-6" />
				{/if}
			</Toolbar.Button>
			<Toolbar.Button
				on:click={() => app.seizureModeToggle()}
				data-state={app?.seizureMode ? "active" : undefined}
				class="inline-flex items-center justify-center rounded-9px px-3 py-2 text-sm  font-medium text-foreground/80 transition-all hover:bg-muted active:scale-98 active:bg-dark-10 [data-state=active]:bg-dark-10"
			>
				<MagicWand class="size-6" />
			</Toolbar.Button>
			<Toolbar.Button
				on:click={() => (willRecord = !willRecord)}
				class="inline-flex items-center justify-center rounded-9px px-1.5 py-0 text-sm  font-medium text-foreground/80 transition-all hover:bg-muted active:scale-98 active:bg-dark-10 [data-state=active]:bg-dark-10"
			>
				<DotFilled class="size-10 {willRecord ? 'text-red-500' : ''}" />
			</Toolbar.Button>
		</div>
		<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-dark-10" />
		<div
			class="flex items-center max-w-sm h-full w-full px-3 shadow-inner bg-muted rounded mx-1 text-muted-foreground whitespace-nowrap"
		>
			{currentAudioName}
		</div>
		<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-dark-10" />

		<DropdownMenu.Root
			open={isDropdownOpen}
			onOpenChange={(o) => (isDropdownOpen = o)}
		>
			<DropdownMenu.Trigger class="">
				<div class="flex items-center">
					<Toolbar.Button
						class="inline-flex items-center justify-center rounded-9px px-3 py-2 text-sm  font-medium text-foreground/80 transition-all hover:bg-muted active:scale-98 active:bg-dark-10"
					>
						<ListBullet class="mr-2 size-6" />
						<span class="whitespace-nowrap"> Change music </span>
					</Toolbar.Button>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-full max-w-[229px] rounded-xl border border-muted bg-background px-1 py-1.5 shadow-popover"
				transition={fly}
				sideOffset={8}
				side="top"
			>
				<DropdownMenu.Label class="py-3 pl-3 pr-1.5"
					>AudioList</DropdownMenu.Label
				>
				<DropdownMenu.Separator class="my-1 -ml-1 -mr-1 block h-px bg-muted" />
				<ScrollArea.Root class="relative h-[205px] bg-muted rounded-md">
					<ScrollArea.Viewport class="h-full w-full">
						<ScrollArea.Content>
							{#each audioList as { name, url }}
								<DropdownMenu.Item
									on:click={() => handleRemoteAudio(url, name)}
									class="flex pl-3 pr-1.5 h-10 select-none items-center rounded-button py-3 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-dark-10"
								>
									<div class="flex items-center">
										{name}
									</div>
								</DropdownMenu.Item>
							{:else}
								<p>No audio here!</p>
							{/each}
						</ScrollArea.Content>
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						orientation="vertical"
						class="flex h-full w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all hover:w-3 hover:bg-dark-10"
					>
						<ScrollArea.Thumb
							class="relative flex-1 rounded-full bg-muted-foreground opacity-40 transition-opacity hover:opacity-100"
						/>
					</ScrollArea.Scrollbar>
					<ScrollArea.Corner />
				</ScrollArea.Root>

				<DropdownMenu.Separator class="my-1 -ml-1 -mr-1 block h-px bg-muted" />
				<DropdownMenu.Item
					on:click={() => {
						const fileInput = document.getElementById("file-input");
						fileInput?.click();
					}}
					class="relative flex h-10 select-none items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
				>
					<File class="mr-2" />
					<p>Custom input</p>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Toolbar.Root>
</div>
<input
	id="file-input"
	class="absolute z-50 left-0 top-0 opacity-0 w-0 h-0 cursor-pointer"
	type="file"
	accept=".mp3, .mp4"
	on:change|stopPropagation={handleFileChange}
/>
<canvas
	style="width: 100%; height: 100%;"
	id="babylon-canvas"
	width="100%"
	height="100%"
></canvas>
