<script lang="ts">
	import PronunciationBreakdown from './PronunciationBreakdown.svelte';
	import ScoreSummary from './ScoreSummary.svelte';
	import OverallFeedback from './OverallFeedback.svelte';
	import type { AssessmentResult } from '$lib/types';
	import { fade } from 'svelte/transition';

	export let assessment: AssessmentResult | null = null;
	export let loading: boolean = false;
</script>

{#if loading}
	<div class="flex flex-col items-center justify-center py-12">
		<div class="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
		<div class="text-lg text-gray-500">評分生成中，請稍候…</div>
	</div>
{:else if assessment}
	<div class="space-y-6">
		<!-- 1. 每字發音評分 -->
		{#if assessment.speech.detailResult}
			<div in:fade={{ duration: 350 }}>
				<PronunciationBreakdown result={assessment.speech.detailResult} />
			</div>
			<hr class="my-4 border-dashed border-gray-300" />
		{/if}
		<!-- 2. 語音與內容分數 -->
		<div in:fade={{ duration: 350, delay: 100 }}>
			<ScoreSummary speech={assessment.speech} content={assessment.content} />
		</div>
		<hr class="my-4 border-dashed border-gray-300" />
		<!-- 3. 整體回饋與總分 -->
		<div in:fade={{ duration: 350, delay: 200 }}>
			<OverallFeedback feedback={assessment.feedback} overallScore={assessment.overallScore} />
		</div>
	</div>
{/if}
