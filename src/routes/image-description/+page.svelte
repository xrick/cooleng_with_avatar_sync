<script lang="ts">
	import Recorder from '$lib/components/Recorder.svelte';
	import AssessmentResult from '$lib/components/AssessmentResult.svelte';
	import FinalResult from '$lib/components/FinalResult.svelte';
	import {
		getRandomImageQuestion,
		getAvailableDifficulties,
		type Level
	} from '$lib/types/questionService';
	import { Grader } from '$lib/grader';
	import type { ImageQuestion } from '$lib/types/questions';
	import { fade } from 'svelte/transition';
	import { Mic, Eye } from 'lucide-svelte';
	import { debug } from 'debug';

	const log = debug('app:ImageDescription');

	let stage: 'landing' | 'select' | 'prepare' | 'practice' | 'scoring' | 'results' =
		$state('landing');
	let difficulties: Level[] = $state(getAvailableDifficulties());
	let difficulty: Level = $state(difficulties[0] || 'beginner');
	let currentImage: ImageQuestion | null = $state(null);
	let subquestionIdx: number = $state(0);
	let transcript: string = '';
	let speech: any = $state({ accuracy: 0, fluency: 0, prosody: 0, total: 0 });
	let content: any = $state({ vocabulary: 0, grammar: 0, relevance: 0, total: 0 });
	let assessments: any[] = $state([]); // store per-question assessments
	let responses: string[] = $state([]); // store per-question responses
	let loading: boolean = $state(false);
	let overall: any = $state(null);
	let pendingScores: Promise<void>[] = $state([]);

	function startSelect() {
		stage = 'select';
	}

	function startPractice() {
		currentImage = getRandomImageQuestion(difficulty);
		subquestionIdx = 0;
		transcript = '';
		speech = { accuracy: 0, fluency: 0, prosody: 0, total: 0 };
		content = { vocabulary: 0, grammar: 0, relevance: 0, total: 0 };
		assessments = [];
		responses = [];
		overall = null;
		stage = 'prepare';
	}

	function beginPractice() {
		stage = 'practice';
	}

	function handleResult({
		text,
		accuracyScore,
		fluencyScore,
		prosodyScore
	}: {
		text: string;
		accuracyScore: number;
		fluencyScore: number;
		prosodyScore: number;
	}) {
		transcript = text;
		log('At handleResult:');
		log('Accuracy:', accuracyScore);
		log('Fluency:', fluencyScore);
		log('Prosody:', prosodyScore);
		const avg = Math.round((accuracyScore + fluencyScore + prosodyScore) / 3);
		speech = {
			accuracy: Math.round(accuracyScore),
			fluency: Math.round(fluencyScore),
			prosody: Math.round(prosodyScore),
			total: parseFloat((avg / 20).toFixed(2))
		};
	}

	async function handleAudio(blob: Blob) {
		// no-op
	}

	async function scoreAnswerInBackground() {
		if (!currentImage?.subquestions) return;
		const idx = subquestionIdx;
		const answer = transcript;
		const speechSnapshot = { ...speech };
		const questionContext: ImageQuestion = {
			id: currentImage.id,
			text: currentImage.subquestions[idx],
			imageUrl: currentImage.imageUrl,
			description: currentImage.description,
			subquestions: currentImage.subquestions,
			difficulty: currentImage.difficulty,
			category: currentImage.category
		};

		const scoringPromise = Grader.scoreAnswer(answer, questionContext).then((result) => {
			assessments[idx] = {
				speech: speechSnapshot,
				content: { ...result.content },
				overallScore: Math.round((speechSnapshot.total + result.content.total) * 10),
				feedback: result.feedback
			};
			responses[idx] = answer;
			log(assessments[idx].speech);
			// Remove this promise from pending scores when done
			pendingScores = pendingScores.filter((p) => p !== scoringPromise);
		});

		pendingScores = [...pendingScores, scoringPromise];
	}

	async function goToNextQuestion() {
		if (!currentImage?.subquestions) return;

		// Start scoring the current answer in the background
		await scoreAnswerInBackground();

		// Immediately proceed to next question or results
		if (subquestionIdx < currentImage.subquestions.length - 1) {
			subquestionIdx++;
			transcript = '';
			speech = { accuracy: 0, fluency: 0, prosody: 0, total: 0 };
			content = { vocabulary: 0, grammar: 0, relevance: 0, total: 0 };
			stage = 'practice';
		} else {
			// For the last question, wait for all pending scores before showing results
			stage = 'scoring';
			await Promise.all(pendingScores);
			computeOverall();
			stage = 'results';
		}
	}

	function computeOverall() {
		if (!assessments.length) return;
		const count = assessments.length;
		const avgSpeech = {
			accuracy: Math.round(assessments.reduce((s, a) => s + a.speech.accuracy, 0) / count),
			fluency: Math.round(assessments.reduce((s, a) => s + a.speech.fluency, 0) / count),
			prosody: Math.round(assessments.reduce((s, a) => s + a.speech.prosody, 0) / count),
			total: parseFloat((assessments.reduce((s, a) => s + a.speech.total, 0) / count).toFixed(2))
		};
		const avgContent = {
			vocabulary: Math.round(assessments.reduce((s, a) => s + a.content.vocabulary, 0) / count),
			grammar: Math.round(assessments.reduce((s, a) => s + a.content.grammar, 0) / count),
			relevance: Math.round(assessments.reduce((s, a) => s + a.content.relevance, 0) / count),
			total: parseFloat((assessments.reduce((s, a) => s + a.content.total, 0) / count).toFixed(2))
		};
		const overallScore = Math.round((avgSpeech.total + avgContent.total) * 10);
		overall = { speech: avgSpeech, content: avgContent, overallScore };
	}

	function retry() {
		startPractice();
	}

	function nextQuestion() {
		startPractice();
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-3 sm:p-6">
	{#if stage === 'landing'}
		<div class="mx-auto max-w-2xl space-y-6 text-center sm:space-y-8" in:fade={{ duration: 800 }}>
			<h1 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:mb-6 sm:text-4xl">
				<span class="from-secondary to-primary bg-gradient-to-r bg-clip-text text-transparent">
					看圖敘述練習
				</span>
				<span class="mt-2 block text-lg font-bold text-gray-700 sm:text-xl"
					>提升英語描述與觀察能力</span
				>
			</h1>
			<p class="mx-auto mb-6 max-w-xl text-base text-gray-600 sm:mb-8 sm:text-lg">
				透過描述各種圖片場景，您將學會如何組織思路、注意細節並用流暢的英語進行敘述
			</p>
			<button
				class="bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition sm:px-6 sm:py-3"
				onclick={startSelect}>開始練習</button
			>
		</div>
	{:else if stage === 'select'}
		<div class="mx-auto max-w-2xl space-y-4 text-center sm:space-y-6" in:fade={{ duration: 800 }}>
			<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">選擇難度等級</h2>
			<p class="text-sm text-gray-600 sm:text-base">選擇適合您當前程度的難度，開始練習</p>
			<div class="flex flex-wrap justify-center gap-2 sm:gap-4">
				{#each difficulties as diff}
					<button
						class="rounded-full px-4 py-2 text-sm font-semibold transition duration-200 sm:px-6 sm:py-3 sm:text-base"
						class:bg-secondary={difficulty === diff}
						class:text-white={difficulty === diff}
						class:bg-gray-100={difficulty !== diff}
						class:text-gray-800={difficulty !== diff}
						class:hover:bg-gray-200={difficulty !== diff}
						onclick={() => (difficulty = diff)}>{diff}</button
					>
				{/each}
			</div>
			<button
				class="bg-secondary hover:bg-secondary/90 mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:mt-8 sm:px-6 sm:py-3 sm:text-base"
				onclick={startPractice}>開始練習</button
			>
		</div>
	{:else if stage === 'prepare' && currentImage}
		<div class="mx-auto max-w-2xl space-y-4 sm:space-y-6" in:fade={{ duration: 800 }}>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<h3 class="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">觀察圖片</h3>
				<div class="mb-4 overflow-hidden rounded-lg sm:mb-6">
					<img
						src={currentImage.imageUrl}
						alt="練習圖片"
						class="h-auto w-full transform transition duration-300 hover:scale-105"
					/>
				</div>
				<p class="text-sm text-gray-600 italic sm:text-base">{currentImage.description}</p>
				<div class="mt-4 space-y-3 rounded-lg bg-emerald-50 p-3 sm:mt-6 sm:space-y-4 sm:p-4">
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="bg-secondary/10 rounded-full p-1.5 sm:p-2">
							<Eye class="text-secondary h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<p class="text-sm text-gray-700 sm:text-base">仔細觀察圖中的人物、物件和環境</p>
					</div>
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="bg-secondary/10 rounded-full p-1.5 sm:p-2">
							<Mic class="text-secondary h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<p class="text-sm text-gray-700 sm:text-base">準備好後開始回答問題</p>
					</div>
				</div>
			</div>
			<button
				class="bg-secondary hover:bg-secondary/90 mx-auto block rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition sm:px-8 sm:py-3 sm:text-base"
				onclick={beginPractice}
			>
				開始練習
			</button>
		</div>
	{:else if stage === 'practice' && currentImage && currentImage.subquestions}
		<div class="mx-auto max-w-2xl space-y-4 sm:space-y-6" in:fade={{ duration: 800 }}>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<div
					class="mb-4 flex flex-col justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-0"
				>
					<h3 class="text-lg font-semibold text-gray-900 sm:text-xl">描述圖片</h3>
					<div class="flex items-center gap-2 sm:gap-4">
						<span
							class="text-secondary rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm"
							>{difficulty}</span
						>
						<span
							class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-gray-600 sm:px-4 sm:text-sm"
							>問題 {subquestionIdx + 1}/{currentImage.subquestions.length}</span
						>
					</div>
				</div>
				<div class="mb-4 overflow-hidden rounded-lg sm:mb-6">
					<img src={currentImage.imageUrl} alt="練習圖片" class="h-auto w-full" />
				</div>
				<p class="mb-3 text-sm text-gray-600 italic sm:mb-4 sm:text-base">
					{currentImage.description}
				</p>
				<div class="rounded-lg bg-emerald-50 p-3 sm:p-4">
					<h4 class="text-sm font-medium text-gray-900 sm:text-base">
						{currentImage.subquestions[subquestionIdx]}
					</h4>
				</div>
			</div>
			<div class="rounded-lg bg-white p-4 shadow-lg sm:p-8">
				<Recorder
					onResultUpdate={handleResult}
					onAudioAvailable={handleAudio}
					onError={(e) => console.error(e)}
					onStart={() => {}}
					onStop={() => {}}
					onFinish={goToNextQuestion}
					maxRecordTime={15}
				/>
			</div>
		</div>
	{:else if stage === 'scoring'}
		<div class="mx-auto max-w-2xl text-center" in:fade={{ duration: 800 }}>
			<div
				class="flex min-h-[300px] flex-col items-center justify-center space-y-4 rounded-lg bg-white p-8 shadow-lg"
			>
				<div
					class="loader border-secondary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
				></div>
				<p class="text-lg font-semibold text-gray-900">正在評分中...</p>
				<p class="text-gray-600">我們正在分析您的回答，請稍候</p>
			</div>
		</div>
	{:else if stage === 'results' && overall && currentImage?.subquestions}
		<div class="mx-auto max-w-2xl space-y-6" in:fade={{ duration: 800 }}>
			<div class="rounded-lg bg-white p-8 shadow-lg">
				<FinalResult assessment={overall} loading={false} onRefresh={retry} />
			</div>
			{#each currentImage.subquestions as q, i}
				<div class="rounded-lg bg-white p-8 shadow-lg">
					<h4 class="mb-4 font-medium text-gray-900">問題 {i + 1}：{q}</h4>
					<div class="mb-4 rounded-lg bg-gray-50 p-4">
						<p class="text-gray-600">您的回答：</p>
						<p class="mt-2 text-gray-900">{responses[i]}</p>
					</div>
					<AssessmentResult assessment={assessments[i]} loading={false} />
				</div>
			{/each}
			<div class="flex justify-center gap-4">
				<button
					class="rounded-lg px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
					onclick={retry}>重試此題</button
				>
				<button
					class="bg-secondary hover:bg-secondary/90 rounded-lg px-6 py-3 font-semibold text-white transition"
					onclick={nextQuestion}>下一張圖片</button
				>
			</div>
		</div>
	{/if}
</div>
