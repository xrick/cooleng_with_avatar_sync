<script lang="ts">
	import Recorder from '$lib/components/Recorder.svelte';
	import { Tween } from 'svelte/motion';

	let text = $state<string | null>(null);
	let assessment = $state<{
		accuracyScore: number;
		fluencyScore: number;
		completenessScore: number;
		pronunciationScore: number;
		prosodyScore: number;
	} | null>(null);
	let error = $state<string | null>(null);
	let audioUrl = $state<string | null>(null);

	const accuracyTween = new Tween(0);
	const fluencyTween = new Tween(0);
	const completenessTween = new Tween(0);
	const pronunciationTween = new Tween(0);
	const prosodyTween = new Tween(0);

	function handleResultUpdate(result: {
		text: string;
		accuracyScore: number;
		fluencyScore: number;
		completenessScore: number;
		pronunciationScore: number;
		prosodyScore: number;
	}) {
		text = result.text;
		assessment = {
			accuracyScore: result.accuracyScore,
			fluencyScore: result.fluencyScore,
			completenessScore: result.completenessScore,
			pronunciationScore: result.pronunciationScore,
			prosodyScore: result.prosodyScore
		};
	}

	function handleAudioAvailable(audioBlob: Blob) {
		audioUrl = URL.createObjectURL(audioBlob);
	}

	function handleError(e: string) {
		error = e;
	}

	function playAudio() {
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audio.play();
		}
	}

	$effect(() => {
		if (assessment) {
			accuracyTween.target = assessment.accuracyScore;
			fluencyTween.target = assessment.fluencyScore;
			completenessTween.target = assessment.completenessScore;
			pronunciationTween.target = assessment.pronunciationScore;
			prosodyTween.target = assessment.prosodyScore;
		} else {
			accuracyTween.target = 0;
			fluencyTween.target = 0;
			completenessTween.target = 0;
			pronunciationTween.target = 0;
			prosodyTween.target = 0;
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4">
	<Recorder
		onResultUpdate={handleResultUpdate}
		onAudioAvailable={handleAudioAvailable}
		onError={handleError}
		onStart={() => {
			console.log('Recording started');
		}}
		onStop={() => {
			console.log('Recording stopped');
		}}
		maxRecordTime={30}
	/>
	{#if error}
		<div class="text-red-500">{error}</div>
	{/if}
	{#if audioUrl}
		<audio controls src={audioUrl} class="mt-4"></audio>
	{/if}
	{#if text}
		<div class="mt-4 w-full max-w-md space-y-2 rounded bg-gray-50 p-4 shadow">
			<div>{text}</div>
		</div>
	{/if}
	{#if assessment}
		<div class="mt-4 w-full max-w-md space-y-2 rounded bg-gray-50 p-4 shadow">
			<div><b>Accuracy Score:</b> {accuracyTween.current.toFixed(1)}</div>
			<div><b>Fluency Score:</b> {fluencyTween.current.toFixed(1)}</div>
			<div><b>Completeness Score:</b> {completenessTween.current.toFixed(1)}</div>
			<div><b>Pronunciation Score:</b> {pronunciationTween.current.toFixed(1)}</div>
			<div><b>Prosody Score:</b> {prosodyTween.current.toFixed(1)}</div>
		</div>
	{/if}
</div>
