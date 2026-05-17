<script lang="ts">
	import { Button, Progressbar } from 'flowbite-svelte';
	import { Mic, Square } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import type { AssessmentResult as AssessmentResultType } from '$lib/types';

	let {
		record,
		speakingProbability = 0,
		assessment = null,
		loading = false
	}: {
		record?: () => Promise<() => Promise<void>>;
		speakingProbability?: number;
		assessment?: AssessmentResultType | null;
		loading?: boolean;
	} = $props();

	let operating = $state(false);
	let recording = $state(false);
	let stopRecording: (() => Promise<void>) | undefined = $state(undefined);
	let recordingTime = $state(0);
	let recordingTimer: number | undefined = $state(undefined);

	async function handleRecord() {
		if (operating) return;
		if (recording && stopRecording) {
			operating = true;
			await stopRecording();
			stopRecording = undefined;
			recording = false;
			operating = false;
			clearInterval(recordingTimer);
			recordingTime = 0;
			return;
		}
		operating = true;
		recording = true;
		recordingTime = 0;
		stopRecording = await record?.();
		operating = false;
		recordingTimer = setInterval(() => {
			recordingTime += 0.1;
		}, 100) as unknown as number;
	}
</script>

<div class="flex h-full flex-col gap-4">
	<!-- 錄音操作區塊 -->
	{#if !loading}
		<div class="flex-grow"></div>
		<div class="mt-auto flex flex-col items-center justify-center gap-4">
			{#if recording && !operating}
				<div class="relative flex h-8 items-center justify-center">
					<div class="absolute flex gap-1">
						{#each Array(7) as _, i}
							<div
								class="bg-primary h-1 w-1 rounded-full transition-all duration-150"
								style:height="{2 +
									Math.min(speakingProbability * 5, 1) *
										Math.sin(Date.now() / (150 + i * 50) + i) *
										4 +
									2}rem"
								style:opacity={0.3 + Math.min(speakingProbability * 0.7, 0.7)}
							></div>
						{/each}
					</div>
					<div class="z-10 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
						{recordingTime.toFixed(1)}s
					</div>
				</div>
			{/if}
			<Button
				color={recording && !operating ? 'red' : 'primary'}
				class="group relative flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-full drop-shadow-md transition-all duration-200 hover:scale-105 {recording &&
				!operating
					? 'bg-red-600'
					: 'bg-primary'} text-white"
				disabled={operating}
				on:click={handleRecord}
			>
				{#if recording && !operating}
					<div
						class="absolute inset-0 rounded-full bg-red-600 opacity-30 transition-transform duration-75"
						style:transform="scale({1 + speakingProbability * 0.2})"
					></div>
					{#each [1.2, 1.4, 1.6] as scale}
						<div
							class="absolute inset-0 rounded-full border-2 border-red-300 transition-all duration-1000"
							style:transform="scale({scale})"
							style:opacity={Math.max(0, 1 - (scale - 1) * 1.4) * speakingProbability}
						></div>
					{/each}
					<Square class="animate-pulse transition-transform group-hover:scale-110" size={40} />
					<div class="text-sm">停止</div>
				{:else}
					<Mic class="transition-transform group-hover:scale-110" size={40} />
					<div class="text-sm">{operating ? '等待中' : '開始回答'}</div>
				{/if}
			</Button>
			{#if operating}
				<div class="w-48" transition:scale={{ duration: 200 }}>
					<Progressbar progress={50} size="h-1.5" color="primary" class="bg-primary/20">
						<div class="bg-primary h-1.5 rounded-full" style="width: 50%"></div>
					</Progressbar>
					<p class="mt-1 text-center text-xs text-gray-500">處理中...</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex flex-grow items-center justify-center">
			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="text-secondary h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
						role="status"
					></div>
				</div>
				<p class="text-gray-600">處理您的回答中...</p>
			</div>
		</div>
	{/if}
</div>
