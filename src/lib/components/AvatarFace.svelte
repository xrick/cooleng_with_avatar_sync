<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Properties for the avatar
	export let isSpeaking: boolean = false;
	export let emotion: 'happy' | 'neutral' | 'concerned' | 'thinking' = 'neutral';
	export let mouthOpen: boolean = false;
	export let animationSpeed: number = 1;

	// Animation state
	let animationFrame: number = 0;
	let isAnimating: boolean = false;
	let lastUpdate: number = 0;

	// Update animation when speaking changes
	$: if (isSpeaking && !isAnimating) {
		isAnimating = true;
		startAnimation();
	} else if (!isSpeaking && isAnimating) {
		isAnimating = false;
	}

	function startAnimation() {
		if (!isAnimating) return;
		
		// Update based on animation speed
		const now = Date.now();
		if (now - lastUpdate > 100 / animationSpeed) {
			animationFrame = (animationFrame + 1) % 4;
			lastUpdate = now;
		}
		
		// Continue animation
		requestAnimationFrame(() => {
			if (isAnimating) {
				startAnimation();
			}
		});
	}

	// Handle mouth movement during speaking
	$: if (isSpeaking) {
		mouthOpen = (animationFrame % 2 === 0);
	}

	// Emotion color mapping
	function getEmotionColor() {
		switch (emotion) {
			case 'happy': return 'bg-yellow-100';
			case 'concerned': return 'bg-blue-100';
			case 'thinking': return 'bg-purple-100';
			default: return 'bg-yellow-100';
		}
	}

	// Generate lip animation styles
	function getLipStyle() {
		if (!isSpeaking) {
			return 'w-6 h-1 bg-red-400 rounded-full';
		}
		
		// Create a smooth pulsing effect during speaking
		const pulse = mouthOpen ? 'animate-pulse' : '';
		return `w-8 h-4 bg-red-400 rounded-b-full ${pulse}`;
	}
</script>

<div class="relative w-20 h-20 md:w-24 md:h-24">
	<!-- Face base -->
	<div class={`absolute inset-0 rounded-full border-2 flex items-center justify-center ${getEmotionColor()} border-yellow-200`}>
		<!-- Eyes -->
		<div class="absolute top-6 left-5 w-3 h-3 bg-black rounded-full"></div>
		<div class="absolute top-6 right-5 w-3 h-3 bg-black rounded-full"></div>
		
		<!-- Eye pupils (based on emotion) -->
		<div class="absolute top-7 left-6 w-1.5 h-1.5 bg-white rounded-full"></div>
		<div class="absolute top-7 right-6 w-1.5 h-1.5 bg-white rounded-full"></div>
		
		<!-- Mouth (changes based on state) -->
		{#if mouthOpen}
			<!-- Speaking animation: open mouth with slight movement -->
			<div class={getLipStyle()}></div>
		{:else}
			<!-- Neutral mouth -->
			<div class={getLipStyle()}></div>
		{/if}
		
		<!-- Emotion indicators (expressions) -->
		{#if emotion === 'happy'}
			<!-- Happy expression: smile -->
			<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-5 border-b-4 border-red-400 rounded-b-full"></div>
		{:else if emotion === 'concerned'}
			<!-- Concerned expression: frown -->
			<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-5 border-t-4 border-red-400 rounded-t-full"></div>
		{:else if emotion === 'thinking'}
			<!-- Thinking expression: tilted mouth -->
			<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full" style="transform: rotate(15deg);"></div>
		{:else}
			<!-- Neutral expression -->
			<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-red-400 rounded-full"></div>
		{/if}
		
		<!-- blush for happy state -->
		{#if emotion === 'happy'}
			<div class="absolute top-6 left-3 w-2 h-2 bg-pink-200 rounded-full opacity-70"></div>
			<div class="absolute top-6 right-3 w-2 h-2 bg-pink-200 rounded-full opacity-70"></div>
		{/if}
		
		<!-- Thinking bubbles for thinking state -->
		{#if emotion === 'thinking'}
			<div class="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
				<span class="text-xs text-gray-500">...</span>
			</div>
		{/if}
	</div>
	
	<!-- Animation indicator when speaking -->
	{#if isSpeaking}
		<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
	{/if}
</div>

<style>
	/* Add custom animations */
	@keyframes pulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}
	
	/* Custom lip movement animation if needed */
	.lip-move {
		animation: lipMove 0.3s infinite alternate;
	}
	
	@keyframes lipMove {
		from { height: 4px; }
		to { height: 6px; }
	}
</style>