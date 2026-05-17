<script lang="ts">
	import { recognizer } from '$lib/azure/speech/recognizer';
	import { Mic, StopCircle } from 'lucide-svelte';
	import { debug } from 'debug';

	const log = debug('app:Recorder');

	let {
		onResultUpdate,
		onAudioAvailable,
		onError,
		onStart,
		onStop,
		onFinish,
		maxRecordTime = null
	}: {
		onResultUpdate: (value: {
			text: string;
			accuracyScore: number;
			fluencyScore: number;
			completenessScore: number;
			pronunciationScore: number;
			prosodyScore: number;
		}) => void;
		onAudioAvailable: (audioBlob: Blob) => void;
		onError: (error: string) => void;
		onStart: () => void;
		onStop: () => void;
		onFinish: () => void;
		maxRecordTime?: number | null;
	} = $props();

	let recognizing = $state(false);
	let error = $state<string | null>(null);
	let text = $state<string | null>(null);
	let assessment = $state<{
		accuracyScore: number;
		fluencyScore: number;
		completenessScore: number;
		pronunciationScore: number;
		prosodyScore: number;
	} | null>(null);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = $state([]);

	// Timer for maxRecordTime
	let remainingTime = $state<number | null>(null);
	let timerId: ReturnType<typeof setInterval> | null = null;

	async function startRecording() {
		error = null;
		text = '';
		assessment = null;
		audioChunks = [];
		recognizing = true;

		if (maxRecordTime) {
			remainingTime = maxRecordTime;
			if (timerId) clearInterval(timerId);
			timerId = setInterval(() => {
				if (remainingTime !== null && remainingTime > 0) {
					remainingTime--;
					if (remainingTime === 0) {
						stopRecording();
					}
				}
			}, 1000);
		} else {
			remainingTime = null;
		}

		let totalWords = 0;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					audioChunks.push(e.data);
				}
			};
			mediaRecorder.onstop = () => {
				const blob = new Blob(audioChunks, { type: 'audio/webm' });
				onAudioAvailable(blob);
			};
			mediaRecorder.start();

			await recognizer.start({
				onSpeechEnd: (content) => {
					text = (text + ' ' + content).trim();
				},
				onSpeechStart: () => {},
				onPronunciationAssessed: (result) => {
					log('onPronunciationAssessed', result);
					const weight = result.detailResult.Words.length;
					if (assessment === null) {
						assessment = {
							accuracyScore: result.accuracyScore,
							fluencyScore: result.fluencyScore,
							completenessScore: result.completenessScore,
							pronunciationScore: result.pronunciationScore,
							prosodyScore: result.prosodyScore
						};
						totalWords = weight;
					} else if (weight) {
						assessment.accuracyScore =
							(assessment.accuracyScore * totalWords + result.accuracyScore * weight) /
							(totalWords + weight);
						assessment.fluencyScore =
							(assessment.fluencyScore * totalWords + result.fluencyScore * weight) /
							(totalWords + weight);
						assessment.completenessScore =
							(assessment.completenessScore * totalWords + result.completenessScore * weight) /
							(totalWords + weight);
						assessment.pronunciationScore =
							(assessment.pronunciationScore * totalWords + result.pronunciationScore * weight) /
							(totalWords + weight);
						assessment.prosodyScore =
							(assessment.prosodyScore * totalWords + result.prosodyScore * weight) /
							(totalWords + weight);
						totalWords += weight;
					}
					log('Current assessment:', assessment);
				},
				silenceTimeoutMs: 2000
			});

			onStart();
		} catch (e: any) {
			error = e?.message || 'Error starting recording';
			onError(error || '');
			recognizing = false;
		}
	}

	async function stopRecording() {
		recognizing = false;
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
		remainingTime = null;
		onStop();
		try {
			await recognizer.stop();
		} catch (e: any) {
			error = e?.message || 'Error stopping recognizer';
		}
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
		onFinish();
	}

	$effect(() => {
		if (error) {
			onError(error);
		}
	});
	$effect(() => {
		if (text && assessment) {
			onResultUpdate({
				text,
				accuracyScore: assessment.accuracyScore,
				fluencyScore: assessment.fluencyScore,
				completenessScore: assessment.completenessScore,
				pronunciationScore: assessment.pronunciationScore,
				prosodyScore: assessment.prosodyScore
			});
		}
	});
</script>

<div>
	<button
		onclick={recognizing ? stopRecording : startRecording}
		disabled={!!error}
		class="focus:ring-primary-400 flex items-center gap-2 rounded-full px-4 py-2 text-white focus:ring-2 focus:outline-none disabled:opacity-50"
		class:bg-primary={!recognizing}
		class:bg-secondary={recognizing}
		aria-label={recognizing ? '停止錄音' : '開始錄音'}
	>
		{#if recognizing}
			<StopCircle size={24} />
		{:else}
			<Mic size={24} />
		{/if}
		<span>
			{recognizing ? '停止' : '開始'}
			{#if recognizing && maxRecordTime && remainingTime !== null}
				（剩餘 {remainingTime} 秒）
			{/if}
		</span>
	</button>
</div>
