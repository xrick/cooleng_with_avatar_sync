<script lang="ts">
	import CircularProgress from './CircularProgress.svelte';

	const { feedback, overallScore } = $props();
</script>

<div class="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row">
	<div class="flex-3">
		<h4 class="mb-2 font-bold">整體回饋</h4>
		<div class="prose mb-2 text-gray-700">{feedback}</div>
	</div>
	<div class="flex flex-2 flex-col items-center justify-center md:justify-end">
		<div class="flex h-full w-full items-center justify-center">
			<CircularProgress score={overallScore} size={100} stroke={10} color="blue" />
		</div>
		<div class="mt-2 flex items-center gap-2 text-lg font-bold">
			整體性評分：<span class="text-primary">{overallScore}</span> / 100
		</div>
	</div>
</div>
