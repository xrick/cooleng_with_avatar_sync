<script lang="ts">
	import Recorder from '$lib/components/Recorder.svelte';
	import AssessmentResult from '$lib/components/AssessmentResult.svelte';
	import { getRandomQuestion, lvls, type Level } from '$lib/types/questionService';
	import type { Question } from '$lib/types/questions';
	import type { AssessmentResult as AR, SpeechAssessment, ContentAssessment } from '$lib/types';
	import { Synthesizer } from '$lib/azure/speech';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Mic, Headphones } from 'lucide-svelte';

	let stage: 'landing' | 'select' | 'prepare' | 'practice' | 'scoring' | 'results' =
		$state('landing');
	let difficulty: Level = $state('beginner');
	let currentQuestion: Question | null = $state(null);
	let transcript: string = '';
	let speech: SpeechAssessment = $state({ accuracy: 0, fluency: 0, prosody: 0, total: 0 });
	let content: ContentAssessment = $state({ vocabulary: 0, grammar: 0, relevance: 0, total: 0 });
	let assessment: AR | null = $state(null);
	let loading: boolean = $state(false);
	let synthesizer: Synthesizer | null = $state(null);

	onMount(async () => {
		synthesizer = await Synthesizer.create('en-US-JennyNeural');
	});

	async function startPractice() {
		currentQuestion = getRandomQuestion(difficulty);
		transcript = '';
		speech = { accuracy: 0, fluency: 0, prosody: 0, total: 0 };
		content = { vocabulary: 0, grammar: 0, relevance: 0, total: 0 };
		assessment = null;
		stage = 'prepare';
	}

	async function beginPractice() {
		stage = 'practice';
		if (synthesizer && currentQuestion) {
			await synthesizer.synthesize(currentQuestion.text, true);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await synthesizer.synthesize(currentQuestion.text, true);
		}
	}

	function handleResult({
		text,
		accuracyScore,
		fluencyScore,
		pronunciationScore,
		prosodyScore
	}: {
		text: string;
		accuracyScore: number;
		fluencyScore: number;
		pronunciationScore: number;
		prosodyScore: number;
	}) {
		console.log('Result:', text, accuracyScore, fluencyScore, pronunciationScore, prosodyScore);
		transcript = text;
		const avg = Math.round((accuracyScore + fluencyScore + prosodyScore) / 3);
		speech = {
			accuracy: Math.round(accuracyScore),
			fluency: Math.round(fluencyScore),
			prosody: Math.round(prosodyScore),
			total: parseFloat((avg / 20).toFixed(2))
		};
	}

	async function handleAudio(blob: Blob) {
		console.log('Audio available:', blob);
		// no-op
	}

	async function scoreAnswer() {
		console.log('Scoring answer:', transcript);
		if (!currentQuestion) return;
		loading = true;
		stage = 'scoring';
		const res = await fetch('/api/grader/score-answer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question: { text: currentQuestion.text }, answer: transcript })
		});
		const data = await res.json();
		content = {
			vocabulary: data.vocabulary,
			grammar: data.grammar,
			relevance: data.relevance,
			total: data.grade
		};
		assessment = {
			speech,
			content,
			overallScore: Math.round((speech.total + content.total) * 10),
			feedback: data.feedback
		};
		loading = false;
		stage = 'results';
	}

	function retry() {
		stage = 'prepare';
	}

	function nextQuestion() {
		startPractice();
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-6">
	{#if stage === 'landing'}
		<div class="mx-auto max-w-2xl space-y-6 text-center sm:space-y-8" in:fade={{ duration: 300 }}>
			<h1 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:mb-6 sm:text-4xl">
				<span class="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
					回答問題練習
				</span>
				<span class="mt-2 block text-lg font-bold text-gray-700 sm:text-xl"
					>提升英語口說表達能力</span
				>
			</h1>
			<p class="mx-auto mb-6 max-w-xl text-base text-gray-600 sm:mb-8 sm:text-lg">
				透過回答各種英語問題，您將提升聽力理解、口語表達和快速反應能力
			</p>
			<button
				class="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:px-6 sm:py-3 sm:text-base"
				onclick={() => (stage = 'select')}>開始練習</button
			>
		</div>
	{:else if stage === 'select'}
		<div class="mx-auto max-w-2xl space-y-4 text-center sm:space-y-6" in:fade={{ duration: 300 }}>
			<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">選擇難度等級</h2>
			<p class="text-sm text-gray-600 sm:text-base">選擇適合您當前程度的難度，開始練習</p>
			<div class="flex flex-wrap justify-center gap-2 sm:gap-4">
				{#each lvls as lvl}
					<button
						class="rounded-full px-4 py-2 text-sm font-semibold transition duration-200 sm:px-6 sm:py-3 sm:text-base"
						class:bg-primary={difficulty === lvl}
						class:text-white={difficulty === lvl}
						class:bg-gray-100={difficulty !== lvl}
						class:text-gray-800={difficulty !== lvl}
						class:hover:bg-gray-200={difficulty !== lvl}
						onclick={() => (difficulty = lvl)}>{lvl}</button
					>
				{/each}
			</div>
			<button
				class="bg-primary hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:mt-8 sm:px-6 sm:py-3 sm:text-base"
				onclick={startPractice}>開始練習</button
			>
		</div>
	{:else if stage === 'prepare' && currentQuestion}
		<div class="mx-auto max-w-2xl space-y-4 sm:space-y-6" in:fade={{ duration: 300 }}>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<h3 class="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">準備開始</h3>
				<p class="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
					準備好後，點擊下方按鈕開始聆聽問題。問題會播放兩次，接著您可以開始回答。
				</p>
				<div class="space-y-3 rounded-lg bg-blue-50 p-3 sm:space-y-4 sm:p-4">
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="bg-primary/10 rounded-full p-1.5 sm:p-2">
							<Headphones class="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<p class="text-sm text-gray-700 sm:text-base">問題會播放兩次</p>
					</div>
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="bg-primary/10 rounded-full p-1.5 sm:p-2">
							<Mic class="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<p class="text-sm text-gray-700 sm:text-base">聆聽完後開始回答</p>
					</div>
				</div>
			</div>
			<button
				class="bg-primary hover:bg-primary/90 mx-auto block rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition sm:px-8 sm:py-3 sm:text-base"
				onclick={beginPractice}
			>
				開始聆聽
			</button>
		</div>
	{:else if stage === 'practice' && currentQuestion}
		<div class="mx-auto max-w-2xl space-y-4 sm:space-y-6" in:fade={{ duration: 300 }}>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<div
					class="mb-4 flex flex-col justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-0"
				>
					<h3 class="text-lg font-semibold text-gray-900 sm:text-xl">回答問題</h3>
					<span
						class="text-primary rounded-full bg-blue-50 px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm"
						>{difficulty}</span
					>
				</div>
				<p class="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base">
					請仔細聆聽問題，並在錄音按鈕亮起後開始回答
				</p>
			</div>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<Recorder
					onResultUpdate={handleResult}
					onAudioAvailable={handleAudio}
					onError={(e) => console.error(e)}
					onStart={() => {}}
					onStop={() => {}}
					onFinish={scoreAnswer}
					maxRecordTime={15}
				/>
			</div>
		</div>
	{:else if stage === 'scoring'}
		<div class="mx-auto max-w-2xl text-center" in:fade={{ duration: 300 }}>
			<div
				class="flex min-h-[300px] flex-col items-center justify-center space-y-4 rounded-lg bg-white p-4 shadow-lg sm:p-8"
			>
				<div
					class="loader border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent sm:h-16 sm:w-16"
				></div>
				<p class="text-base font-semibold text-gray-900 sm:text-lg">正在評分中...</p>
				<p class="text-sm text-gray-600 sm:text-base">我們正在分析您的回答，請稍候</p>
			</div>
		</div>
	{:else if stage === 'results' && assessment}
		<div class="mx-auto max-w-2xl space-y-4 sm:space-y-6" in:fade={{ duration: 300 }}>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<AssessmentResult {assessment} {loading} />
			</div>
			<div class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
				<button
					class="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:px-6 sm:py-3 sm:text-base"
					onclick={retry}>重試此題</button
				>
				<button
					class="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:px-6 sm:py-3 sm:text-base"
					onclick={nextQuestion}>下一題</button
				>
			</div>
		</div>
	{/if}
</div>
