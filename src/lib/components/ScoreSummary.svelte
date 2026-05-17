<script lang="ts">
	import type { SpeechAssessment, ContentAssessment } from '$lib/types';

	let { speech, content }: { speech: SpeechAssessment; content: ContentAssessment } = $props();

	function getLevelLabel(score: number) {
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
	function getTotalBg(score: number) {
		if (score >= 5 || score >= 4) return 'bg-emerald-50';
		if (score >= 3) return 'bg-secondary/10';
		if (score >= 2) return 'bg-primary/10';
		return 'bg-red-50';
	}
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<!-- 語音評分區塊 -->
	<div class="rounded-lg border bg-gray-50 p-4">
		<h4 class="mb-2 flex items-center gap-2 font-bold">
			<span>語音評分</span>
		</h4>
		<div class="flex items-center justify-between gap-2">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					準確度：<span class="font-bold">{speech.accuracy}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							speech.accuracy
						)}">{getLevelLabel(speech.accuracy)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					流暢度：<span class="font-bold">{speech.fluency}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							speech.fluency
						)}">{getLevelLabel(speech.fluency)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					韻律性：<span class="font-bold">{speech.prosody}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							speech.prosody
						)}">{getLevelLabel(speech.prosody)}</span
					>
				</div>
			</div>
		</div>
		<div
			class="mt-2 {getTotalBg(
				speech.total
			)} flex items-center justify-between gap-2 rounded px-2 py-1 font-bold"
		>
			<span>語音總分：<span class="text-primary">{speech.total} / 5</span></span>
		</div>
	</div>

	<!-- 內容評分區塊 -->
	<div class="rounded-lg border bg-gray-50 p-4">
		<h4 class="mb-2 flex items-center gap-2 font-bold">
			<span>內容評分</span>
		</h4>
		<div class="flex items-center justify-between gap-2">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					單字使用：<span class="font-bold">{content.vocabulary}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							content.vocabulary
						)}">{getLevelLabel(content.vocabulary)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					文法：<span class="font-bold">{content.grammar}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							content.grammar
						)}">{getLevelLabel(content.grammar)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					主題性：<span class="font-bold">{content.relevance}</span>
					<span
						class="ml-1 rounded border px-2 py-0.5 text-xs font-semibold {getLevelColor(
							content.relevance
						)}">{getLevelLabel(content.relevance)}</span
					>
				</div>
			</div>
		</div>
		<div
			class="mt-2 {getTotalBg(
				content.total
			)} flex items-center justify-between gap-2 rounded px-2 py-1 font-bold"
		>
			<span>內容總分：<span class="text-secondary">{content.total} / 5</span></span>
		</div>
	</div>
</div>
