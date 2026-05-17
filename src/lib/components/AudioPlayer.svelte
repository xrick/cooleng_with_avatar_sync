<script lang="ts">
	import { Play, Pause, RotateCcw } from 'lucide-svelte';
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let { src }: { src: string } = $props();

	let audio: HTMLAudioElement;
	let playing = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let hoveredPosition = $state<number | null>(null);

	// Use tweened store for smooth progress bar animation
	const progress = tweened(0, { duration: 200, easing: cubicOut });

	// Generate a pseudo-waveform pattern
	const waveformSegments = 40;
	const waveformPattern = Array.from({ length: waveformSegments }, (_, i) => {
		// Create a natural-looking pattern with higher amplitudes in the middle
		const position = i / waveformSegments;
		const centerDistance = Math.abs(position - 0.5);
		const baseHeight = 0.3 + Math.random() * 0.3;
		const heightMultiplier = 1 - centerDistance * 1.2;
		return Math.max(0.1, baseHeight * heightMultiplier);
	});

	onMount(() => {
		audio = new Audio(src);
		audio.addEventListener('timeupdate', () => {
			currentTime = audio.currentTime;
			progress.set(audio.currentTime / (audio.duration || 1));
		});
		audio.addEventListener('loadedmetadata', () => {
			duration = audio.duration;
		});
		audio.addEventListener('ended', () => {
			playing = false;
		});

		return () => {
			audio.pause();
			audio.remove();
		};
	});

	function togglePlay() {
		if (playing) {
			audio.pause();
		} else {
			audio.play();
		}
		playing = !playing;
	}

	function restart() {
		audio.currentTime = 0;
		if (!playing) {
			audio.play();
			playing = true;
		}
	}

	function seekTo(e: MouseEvent) {
		const target = e.currentTarget as HTMLDivElement;
		const rect = target.getBoundingClientRect();
		const position = (e.clientX - rect.left) / rect.width;
		audio.currentTime = position * audio.duration;

		if (!playing) {
			audio.play();
			playing = true;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		const target = e.currentTarget as HTMLDivElement;
		const rect = target.getBoundingClientRect();
		hoveredPosition = (e.clientX - rect.left) / rect.width;
	}

	function handleMouseLeave() {
		hoveredPosition = null;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<!-- More clean player with the new color scheme -->
<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<Button size="xs" class="text-primary h-9 w-9 p-0" color="light" on:click={togglePlay}>
			{#if playing}
				<Pause size={18} />
			{:else}
				<Play size={18} />
			{/if}
		</Button>

		<Button size="xs" class="h-9 w-9 p-0 text-gray-600" color="light" on:click={restart}>
			<RotateCcw size={16} />
		</Button>

		<div class="min-w-[70px] text-sm font-medium text-gray-700">
			{formatTime(currentTime)} <span class="text-gray-400">/</span>
			{formatTime(duration)}
		</div>
	</div>

	<!-- Waveform progress bar with hover effects -->
	<div
		class="relative h-12 w-full cursor-pointer rounded-lg bg-gray-100 p-2"
		role="slider"
		aria-label="Audio progress"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={$progress * 100}
		tabindex="0"
		onclick={seekTo}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		onkeydown={(e) => {
			if (e.key === 'ArrowRight') {
				audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
			} else if (e.key === 'ArrowLeft') {
				audio.currentTime = Math.max(0, audio.currentTime - 5);
			} else if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				togglePlay();
			}
		}}
	>
		<!-- Background waveform -->
		<div class="flex h-full w-full items-center">
			{#each waveformPattern as height, i}
				<div
					class="mx-[1px] h-full flex-1"
					style="display: flex; align-items: center; justify-content: center;"
				>
					<div
						class="w-full rounded-sm bg-gray-300 transition-all duration-100"
						style="height: {height * 100}%"
					></div>
				</div>
			{/each}
		</div>

		<!-- Playback progress overlay -->
		<div
			class="absolute inset-0 flex items-center p-2"
			style="clip-path: inset(0 {100 - $progress * 100}% 0 0)"
		>
			{#each waveformPattern as height, i}
				<div
					class="mx-[1px] h-full flex-1"
					style="display: flex; align-items: center; justify-content: center;"
				>
					<div
						class="bg-primary w-full rounded-sm transition-all duration-100"
						style="height: {height * 100}%"
					></div>
				</div>
			{/each}
		</div>

		<!-- Hover position indicator -->
		{#if hoveredPosition !== null}
			<div
				class="absolute top-0 bottom-0 w-0.5 bg-gray-600"
				style="left: calc({hoveredPosition * 100}% - 1px)"
			></div>
			<div
				class="absolute -top-6 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white"
				style="left: calc({hoveredPosition * 100}% - 1rem); transform: translateX(-50%);"
			>
				{formatTime(hoveredPosition * duration)}
			</div>
		{/if}

		<!-- Playhead -->
		<div
			class="bg-secondary absolute top-0 bottom-0 z-10 w-0.5 transition-all duration-75"
			style="left: calc({$progress * 100}% - 1px)"
		>
			<div class="bg-secondary absolute -top-1 h-3 w-3 translate-x-[-40%] rounded-full"></div>
		</div>
	</div>
</div>
