<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import type { Message } from '$lib/types';

	// Define the props for the component
	export let currentStep: 'read' | 'q1' | 'q2' | 'q3' | 'q4' | 'overall';
	export let currentResponses: (Message | null)[];
	export let currentQuestions: string[];
	export let navigateTo: (step: 'read' | 'q1' | 'q2' | 'q3' | 'q4' | 'overall') => void;
</script>

<Card class="mb-6 overflow-hidden border-0 shadow-md" size="xl">
	<div class="progress-panel">
		<!-- Arrow style progress indicators -->
		<div class="flex w-full">
			<button
				class="progress-step {currentStep === 'read'
					? 'active'
					: currentStep === 'q1' ||
						  currentStep === 'q2' ||
						  currentStep === 'q3' ||
						  currentStep === 'q4' ||
						  currentStep === 'overall'
						? 'completed'
						: ''}"
				onclick={() => navigateTo('read')}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentStep === 'q1' || currentStep === 'q2' || currentStep === 'q3' || currentStep === 'q4' || currentStep === 'overall'}
						<span class="text-white">✓</span>
					{/if}
					<span>Read</span>
				</div>
			</button>
			<button
				class="progress-step {currentStep === 'q1'
					? 'active'
					: currentResponses[0]
						? 'completed'
						: ''} {currentResponses[0] !== null ? 'disabled' : ''}"
				onclick={() => navigateTo('q1')}
				disabled={currentResponses[0] !== null}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentResponses[0]}
						<span class="text-white">✓</span>
					{/if}
					<span>Q1</span>
				</div>
			</button>
			<button
				class="progress-step {currentStep === 'q2'
					? 'active'
					: currentResponses[1]
						? 'completed'
						: ''} {!currentResponses[0] || currentResponses[1] !== null ? 'disabled' : ''}"
				onclick={() => navigateTo('q2')}
				disabled={!currentResponses[0] || currentResponses[1] !== null}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentResponses[1]}
						<span class="text-white">✓</span>
					{/if}
					<span>Q2</span>
				</div>
			</button>
			<button
				class="progress-step {currentStep === 'q3'
					? 'active'
					: currentResponses[2]
						? 'completed'
						: ''} {!(currentResponses[0] && currentResponses[1]) || currentResponses[2] !== null
					? 'disabled'
					: ''}"
				onclick={() => navigateTo('q3')}
				disabled={!(currentResponses[0] && currentResponses[1]) || currentResponses[2] !== null}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentResponses[2]}
						<span class="text-white">✓</span>
					{/if}
					<span>Q3</span>
				</div>
			</button>
			<button
				class="progress-step {currentStep === 'q4'
					? 'active'
					: currentResponses[3]
						? 'completed'
						: ''} {!(currentResponses[0] && currentResponses[1] && currentResponses[2]) ||
				currentResponses[3] !== null
					? 'disabled'
					: ''}"
				onclick={() => navigateTo('q4')}
				disabled={!(currentResponses[0] && currentResponses[1] && currentResponses[2]) ||
					currentResponses[3] !== null}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentResponses[3]}
						<span class="text-white">✓</span>
					{/if}
					<span>Q4</span>
				</div>
			</button>
			<button
				class="progress-step {currentStep === 'overall'
					? 'active'
					: currentResponses[0] && currentResponses[1] && currentResponses[2] && currentResponses[3]
						? 'completed'
						: ''} {!(
					currentResponses[0] &&
					currentResponses[1] &&
					currentResponses[2] &&
					currentResponses[3]
				)
					? 'disabled'
					: ''}"
				onclick={() => navigateTo('overall')}
				disabled={!(
					currentResponses[0] &&
					currentResponses[1] &&
					currentResponses[2] &&
					currentResponses[3]
				)}
			>
				<div class="flex items-center justify-center gap-2">
					{#if currentResponses[0] && currentResponses[1] && currentResponses[2] && currentResponses[3]}
						<span class="text-white">✓</span>
					{/if}
					<span>Overall</span>
				</div>
			</button>
		</div>

		<!-- Content panel based on selected step -->
		<div class="mt-4 rounded-md bg-white p-4">
			{#if currentStep === 'read'}
				<div class="py-2">
					<h3 class="mb-2 text-lg font-semibold text-gray-700">
						Answer the following questions about this image:
					</h3>
					<ol class="list-decimal space-y-2 pl-5">
						{#each currentQuestions as question}
							<li class="text-lg text-gray-700">
								{question}
							</li>
						{/each}
					</ol>
				</div>
			{:else if currentStep === 'q1'}
				<div class="py-2">
					<p class="text-lg text-gray-700">{currentQuestions[0]}</p>
					{#if currentResponses[0]}
						<div class="bg-primary/10 mt-2 flex rounded-lg p-3">
							<div class="text-primary mr-2">✓</div>
							<p class="text-gray-600">已回答此問題。正在進入下一題...</p>
						</div>
					{/if}
				</div>
			{:else if currentStep === 'q2'}
				<div class="py-2">
					<p class="text-lg text-gray-700">{currentQuestions[1]}</p>
					{#if currentResponses[1]}
						<div class="bg-primary/10 mt-2 flex rounded-lg p-3">
							<div class="text-primary mr-2">✓</div>
							<p class="text-gray-600">已回答此問題。正在進入下一題...</p>
						</div>
					{/if}
				</div>
			{:else if currentStep === 'q3'}
				<div class="py-2">
					<p class="text-lg text-gray-700">{currentQuestions[2]}</p>
					{#if currentResponses[2]}
						<div class="bg-primary/10 mt-2 flex rounded-lg p-3">
							<div class="text-primary mr-2">✓</div>
							<p class="text-gray-600">已回答此問題。正在進入下一題...</p>
						</div>
					{/if}
				</div>
			{:else if currentStep === 'q4'}
				<div class="py-2">
					<p class="text-lg text-gray-700">{currentQuestions[3]}</p>
					{#if currentResponses[3]}
						<div class="bg-primary/10 mt-2 flex rounded-lg p-3">
							<div class="text-primary mr-2">✓</div>
							<p class="text-gray-600">已回答所有問題。正在進入結果頁面...</p>
						</div>
					{/if}
				</div>
			{:else if currentStep === 'overall'}
				<div class="py-2">
					<p class="text-lg text-gray-700">Here's your overall performance on all questions:</p>
				</div>
			{/if}
		</div>
	</div>
</Card>

<style>
	.progress-panel {
		width: 100%;
	}

	.progress-step {
		position: relative;
		flex: 1;
		padding: 10px 20px;
		background-color: #e2e8f0;
		color: #64748b;
		text-align: center;
		font-size: 14px;
		font-weight: 500;
		clip-path: polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%, 0% 0%);
		margin-right: -15px;
		z-index: 1;
	}

	.progress-step:first-child {
		clip-path: polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 0% 0%);
	}

	.progress-step:last-child {
		clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 15% 50%, 0% 0%);
		margin-right: 0;
	}

	.progress-step.active {
		background-color: #0ea5e9;
		color: white;
		z-index: 5;
	}

	.progress-step.completed {
		background-color: #14b8a6;
		color: white;
		z-index: 3;
	}

	.progress-step.disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
