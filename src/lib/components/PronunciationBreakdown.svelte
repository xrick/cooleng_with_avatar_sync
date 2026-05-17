<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import type SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
	import { fade } from 'svelte/transition';

	let { result }: { result: SpeechSDK.PronunciationAssessmentResult } = $props();

	let words = result.detailResult.Words;
	// @ts-expect-error we need this private field to get the lexical result
	let segments = result.privPronJson.Lexical.match(/[a-zA-Z0-9']+|[^a-zA-Z0-9']+/g) || [];

	function levenshtein(a: string, b: string): number {
		const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
			Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
		);
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
				);
			}
		}
		return matrix[a.length][b.length];
	}

	function findClosestMatch(
		segment: string,
		words: typeof result.detailResult.Words,
		threshold = 1
	) {
		let closestMatch = null;
		let smallestDistance = Infinity;
		for (let word of words) {
			let distance = levenshtein(segment.toLowerCase(), word.Word.toLowerCase());
			if (distance < smallestDistance && distance <= threshold) {
				smallestDistance = distance;
				closestMatch = word;
			}
		}
		return closestMatch;
	}

	// CTC Alignment
	let data: {
		display: string;
		result?: {
			score: number;
			phonemes: { phoneme: string; score: number }[];
		};
	}[] = [];

	let segmentIndex = 0;
	let wordIndex = 0;

	while (segmentIndex < segments.length) {
		const segment = segments[segmentIndex];
		if (/[a-zA-Z0-9']+/.test(segment)) {
			if (wordIndex < words.length) {
				let wordResult = words[wordIndex];
				if (wordResult.Word.toLowerCase() === segment.toLowerCase()) {
					// Exact match
					data.push({
						display: segment,
						result: {
							score: wordResult.PronunciationAssessment?.AccuracyScore || 0,
							phonemes:
								wordResult.Phonemes?.map((phoneme) => ({
									phoneme: phoneme.Phoneme || '',
									// @ts-expect-error the phoneme score is here
									score: phoneme.PronunciationAssessment?.AccuracyScore || 0
								})) || []
						}
					});
					wordIndex++;
				} else {
					// Attempt partial match
					let closestMatch = findClosestMatch(segment, words.slice(wordIndex));
					if (closestMatch) {
						data.push({
							display: segment,
							result: {
								score: closestMatch.PronunciationAssessment?.AccuracyScore || 0,
								phonemes:
									closestMatch.Phonemes?.map((phoneme) => ({
										phoneme: phoneme.Phoneme || '',
										// @ts-expect-error the phoneme score is here
										score: phoneme.PronunciationAssessment?.AccuracyScore || 0
									})) || []
							}
						});
						wordIndex += words.slice(wordIndex).findIndex((w) => w.Word === closestMatch.Word) + 1;
					} else {
						// No match, add segment as is
						data.push({
							display: segment
						});
					}
				}
			} else {
				// No more words to match
				data.push({
					display: segment
				});
			}
		} else {
			// Non-word segment (punctuation or spaces)
			data.push({
				display: segment
			});
		}
		segmentIndex++;
	}

	// Add remaining unmatched words
	for (; wordIndex < words.length; wordIndex++) {
		let wordResult = words[wordIndex];
		data.push({
			display: wordResult.Word,
			result: {
				score: wordResult.PronunciationAssessment?.AccuracyScore || 0,
				phonemes:
					wordResult.Phonemes?.map((phoneme) => ({
						phoneme: phoneme.Phoneme || '',
						// @ts-expect-error the phoneme score is here
						score: phoneme.PronunciationAssessment?.AccuracyScore || 0
					})) || []
			}
		});
	}

	function getScoreColorClass(score: number): string {
		if (score < 60) return 'bg-red-100 text-red-600 border-red-300';
		if (score < 80) return 'bg-amber-100 text-amber-600 border-amber-300';
		if (score < 90) return 'bg-primary/10 text-primary border-primary/30';
		return 'bg-emerald-100 text-emerald-700 border-emerald-300';
	}

	function getScoreLabel(score: number): string {
		if (score < 60) return '需要改進';
		if (score < 80) return '尚可';
		if (score < 90) return '良好';
		return '優秀';
	}

	function getScoreEmoji(score: number): string {
		if (score < 60) return '😕';
		if (score < 80) return '🙂';
		if (score < 90) return '😊';
		return '🌟';
	}
</script>

<div class="space-y-2">
	<div class="text-lg leading-relaxed">
		{#each data as { display, result }, i (i)}
			{#if result}
				<span
					class="relative mx-0.5 inline-block cursor-help rounded transition-all duration-200 hover:bg-gray-50"
					in:fade={{ duration: 200, delay: i * 10 }}
				>
					<span
						class="relative {getScoreColorClass(result.score)} rounded border-b-2 px-0.5 py-0.5"
					>
						{display}
					</span>
					<Tooltip class="z-30 max-w-sm p-3">
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between gap-2">
								<span class="font-semibold">{display}</span>
								<span
									class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold {getScoreColorClass(
										result.score
									)}"
								>
									{result.score.toFixed(1)}
									{getScoreEmoji(result.score)}
								</span>
							</div>
							<div class="text-xs text-gray-600">發音分解：</div>
							<div class="flex flex-wrap gap-1">
								{#each result.phonemes as phoneme}
									<span
										class="rounded-lg border px-2 py-1 text-xs font-medium {getScoreColorClass(
											phoneme.score
										)}"
									>
										{phoneme.phoneme}
									</span>
								{/each}
							</div>
							<div class="mt-1 text-xs text-gray-500">提示：有顏色標記代表評分結果</div>
						</div>
					</Tooltip>
				</span>
			{:else}
				<span class="mx-0.5">{display}</span>
			{/if}
		{/each}
	</div>
	<!-- Legend -->
	<div class="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2 text-xs">
		<span class="font-medium text-gray-700">評分標示：</span>
		<div class="mt-3 flex flex-wrap justify-center gap-2">
			<span
				class="rounded border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600"
			>
				&lt;60 需要改進
			</span>
			<span
				class="rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600"
			>
				60-79 尚可
			</span>
			<span
				class="border-primary/30 bg-primary/10 text-primary rounded border px-2 py-0.5 text-xs font-semibold"
			>
				80-89 良好
			</span>
			<span
				class="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
			>
				90+ 優秀
			</span>
		</div>
	</div>
</div>
