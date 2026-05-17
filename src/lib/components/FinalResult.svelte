<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { RefreshCw } from 'lucide-svelte';
	import CircularProgress from './CircularProgress.svelte';
	import type { AssessmentResult } from '$lib/types';

	let {
		assessment,
		loading = false,
		onRefresh = undefined
	}: {
		assessment: {
			speech: {
				accuracy: number;
				fluency: number;
				prosody: number;
				total: number;
			};
			content: {
				vocabulary: number;
				grammar: number;
				relevance: number;
				total: number;
			};
			overallScore: number;
			feedback: string;
		} | null;
		loading?: boolean;
		onRefresh?: (() => void) | undefined;
	} = $props();

	function getLevelLabel(score: number): string {
		if (score < 60) return '需要改進';
		if (score < 80) return '尚可';
		if (score < 90) return '良好';
		return '優秀';
	}

	function getLevelColor(score: number): string {
		if (score < 60) return 'bg-red-100 text-red-600 border-red-300';
		if (score < 80) return 'bg-amber-100 text-amber-600 border-amber-300';
		if (score < 90) return 'bg-primary/10 text-primary border-primary/30';
		return 'bg-emerald-100 text-emerald-700 border-emerald-300';
	}
</script>

{#if loading}
	<div class="flex h-full flex-col items-center justify-center p-8 text-center">
		<div
			class="text-secondary mb-4 h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
			role="status"
		></div>
		<p class="text-gray-600">正在計算總體表現...</p>
	</div>
{:else if assessment}
	<div class="p-6">
		<h3 class="mb-4 text-xl font-semibold text-gray-800">總體表現</h3>

		<!-- Overall score -->
		<div class="mb-6 flex flex-col items-center justify-center">
			<CircularProgress
				score={Math.round(assessment.overallScore)}
				size={120}
				stroke={10}
				color="blue"
			/>
			<p class="mt-2 font-medium">總體分數</p>
			<!-- Score indicators -->
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

		<!-- Detailed scores -->
		<div class="mb-6 grid gap-4 md:grid-cols-2">
			<!-- Speech assessment -->
			<div class="rounded-lg border border-gray-200 p-4">
				<h4 class="mb-3 font-semibold text-gray-700">語音評分</h4>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">準確度</span>
						<div>
							<span class="font-medium">{assessment.speech.accuracy.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.speech.accuracy
								)}">{getLevelLabel(assessment.speech.accuracy)}</span
							>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">流暢度</span>
						<div>
							<span class="font-medium">{assessment.speech.fluency.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.speech.fluency
								)}">{getLevelLabel(assessment.speech.fluency)}</span
							>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">韻律性</span>
						<div>
							<span class="font-medium">{assessment.speech.prosody.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.speech.prosody
								)}">{getLevelLabel(assessment.speech.prosody)}</span
							>
						</div>
					</div>
					<div class="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
						<span class="font-medium text-gray-700">語音總分</span>
						<span class="text-secondary font-semibold">{assessment.speech.total.toFixed(1)}/5</span>
					</div>
				</div>
			</div>

			<!-- Content assessment -->
			<div class="rounded-lg border border-gray-200 p-4">
				<h4 class="mb-3 font-semibold text-gray-700">內容評分</h4>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">單字使用</span>
						<div>
							<span class="font-medium">{assessment.content.vocabulary.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.content.vocabulary
								)}">{getLevelLabel(assessment.content.vocabulary)}</span
							>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">文法</span>
						<div>
							<span class="font-medium">{assessment.content.grammar.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.content.grammar
								)}">{getLevelLabel(assessment.content.grammar)}</span
							>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">主題性</span>
						<div>
							<span class="font-medium">{assessment.content.relevance.toFixed(1)}</span>
							<span
								class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
									assessment.content.relevance
								)}">{getLevelLabel(assessment.content.relevance)}</span
							>
						</div>
					</div>
					<div class="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
						<span class="font-medium text-gray-700">內容總分</span>
						<span class="text-secondary font-semibold">{assessment.content.total.toFixed(1)}/5</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Overall feedback -->
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<h4 class="mb-3 font-semibold text-gray-700">整體回饋</h4>
			<p class="whitespace-pre-line text-gray-700">{assessment.feedback}</p>
		</div>

		<!-- Actions -->
		{#if onRefresh}
			<div class="mt-6 flex justify-center">
				<Button color="primary" class="flex items-center gap-2" on:click={onRefresh}>
					<RefreshCw size={16} />
					<span>Try Again</span>
				</Button>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex h-full flex-col items-center justify-center p-8 text-center">
		<p class="text-gray-600">No assessment data available.</p>
	</div>
{/if}
