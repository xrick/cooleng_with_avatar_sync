<script lang="ts">
	import { Button, Card } from 'flowbite-svelte';
	import { Mic, Image, ChevronRight, Award, BookOpen, Laptop } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let practices: HTMLDivElement;

	// Function to goto to specific test type
	function goToTest(testType: 'question-answering' | 'image-description') {
		goto(`/${testType}`);
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
	<div class="container mx-auto max-w-6xl px-4 py-10">
		<!-- Hero Section -->
		<div class="mb-16 text-center md:mb-24" in:fade={{ duration: 300, delay: 200 }}>
			<h1 class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
				<span class="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
					英檢口說練習
				</span>
				<span class="mt-2 block text-xl text-gray-700 italic md:text-2xl"> by Cool English </span>
			</h1>
			<p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl">
				透過 AI 輔助練習，即時獲得發音與表達評分，全面提升英語口說能力！
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button
					size="xl"
					color="primary"
					class="flex items-center gap-2 px-6"
					onclick={() => practices.scrollIntoView({ behavior: 'smooth' })}
				>
					開始練習 <ChevronRight size={18} />
				</Button>
			</div>
		</div>

		<!-- Features Section -->
		<div class="mb-16 grid gap-6 md:grid-cols-3" in:fade={{ duration: 300, delay: 400 }}>
			<div class="flex flex-col items-center p-6 text-center">
				<div class="bg-primary/10 mb-4 rounded-full p-4">
					<Award class="text-primary h-8 w-8" />
				</div>
				<h3 class="mb-2 text-xl font-semibold">專業評分標準</h3>
				<p class="text-gray-600">基於 GEPT 評分標準，全面評估發音、流暢度、完整度與韻律感</p>
			</div>

			<div class="flex flex-col items-center p-6 text-center">
				<div class="bg-primary/10 mb-4 rounded-full p-4">
					<BookOpen class="text-primary h-8 w-8" />
				</div>
				<h3 class="mb-2 text-xl font-semibold">多元練習題型</h3>
				<p class="text-gray-600">提供問答與看圖敘述兩種 GEPT 測驗題型，不同難度等級選擇</p>
			</div>

			<div class="flex flex-col items-center p-6 text-center">
				<div class="bg-primary/10 mb-4 rounded-full p-4">
					<Laptop class="text-primary h-8 w-8" />
				</div>
				<h3 class="mb-2 text-xl font-semibold">AI 智慧回饋</h3>
				<p class="text-gray-600">運用 Azure 語音服務及 OpenAI 模型提供專業評分與改進建議</p>
			</div>
		</div>

		<!-- Practice Modes Cards -->
		<div class="mb-8" bind:this={practices}>
			<h2 class="mb-6 text-center text-2xl font-bold text-gray-800 md:text-3xl">練習模式</h2>
			<div class="grid gap-8 md:grid-cols-2">
				<Card
					class="group overflow-hidden transition-all duration-300 hover:shadow-lg"
					padding="none"
					size="xl"
				>
					<div class="flex h-full flex-col">
						<div class="from-primary to-primary/80 relative h-48 bg-gradient-to-r p-6">
							<div class="absolute right-0 bottom-0 p-6 text-white opacity-30">
								<Mic
									class="h-24 w-24 transform transition-transform duration-300 group-hover:scale-110"
								/>
							</div>
							<h3 class="relative z-10 text-2xl font-bold text-white">回答問題測驗</h3>
							<p class="relative z-10 mt-2 text-blue-100">練習英語口語問答，提升回答能力與流暢度</p>
						</div>
						<div class="flex flex-1 flex-col justify-between p-6">
							<div>
								<div class="mb-4 flex flex-wrap gap-2">
									<span
										class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
										>基礎對話</span
									>
									<span
										class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
										>思考表達</span
									>
									<span
										class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
										>多種難度</span
									>
								</div>
								<p class="text-gray-600">
									通過回答各種英語問題，您將提升聽力理解、口語表達和快速反應能力，符合 GEPT
									中級測驗要求。
								</p>
							</div>
							<Button
								color="primary"
								class="mt-4 w-full"
								onclick={() => goToTest('question-answering')}
							>
								開始練習
							</Button>
						</div>
					</div>
				</Card>

				<Card
					class="group overflow-hidden transition-all duration-300 hover:shadow-lg"
					padding="none"
					size="xl"
				>
					<div class="flex h-full flex-col">
						<div class="from-secondary to-secondary/80 relative h-48 bg-gradient-to-r p-6">
							<div class="absolute right-0 bottom-0 p-6 text-white opacity-30">
								<Image
									class="h-24 w-24 transform transition-transform duration-300 group-hover:scale-110"
								/>
							</div>
							<h3 class="relative z-10 text-2xl font-bold text-white">看圖敘述測驗</h3>
							<p class="relative z-10 mt-2 text-emerald-100">
								練習描述圖片內容，增強敘述能力與細節觀察
							</p>
						</div>
						<div class="flex flex-1 flex-col justify-between p-6">
							<div>
								<div class="mb-4 flex flex-wrap gap-2">
									<span
										class="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-medium"
										>圖片描述</span
									>
									<span
										class="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-medium"
										>細節觀察</span
									>
									<span
										class="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-medium"
										>敘述表達</span
									>
								</div>
								<p class="text-gray-600">
									透過描述各種圖片場景，您將學會如何組織思路、注意細節並用流暢的英語進行敘述，符合
									GEPT 中高級測驗要求。
								</p>
							</div>
							<Button
								color="alternative"
								class="bg-secondary hover:bg-secondary/90 mt-4 w-full text-white"
								onclick={() => goToTest('image-description')}
							>
								開始練習
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>

		<!-- Footer -->
		<footer class="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
			<p>Cool English 英檢口說練習</p>
		</footer>
	</div>
</div>
