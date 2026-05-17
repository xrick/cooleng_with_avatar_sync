<script lang="ts">
	import '../app.css';
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		BottomNav,
		BottomNavItem
	} from 'flowbite-svelte';
	import { Mic, Image, Home } from 'lucide-svelte';
	import { page } from '$app/stores';

	let { children } = $props();
	let isSidebarOpen = $state(false);
</script>

<div class="flex min-h-screen flex-col">
	<!-- Main Navigation -->
	<header class="sticky top-0 z-30">
		<Navbar class="border-b bg-white px-4 shadow-sm">
			<NavBrand href="/">
				<span class="text-primary text-xl font-semibold whitespace-nowrap"> 英檢口說練習 </span>
			</NavBrand>
			<NavHamburger />
			<NavUl
				activeUrl={$page.url.pathname}
				activeClass="text-primary font-medium"
				slideParams={{ duration: 300 }}
			>
				<NavLi href="/" class="flex items-center justify-center">
					<Home class="mr-2 inline h-4 w-4" /> 首頁
				</NavLi>
				<NavLi href="/question-answering" class="flex items-center justify-center">
					<Mic class="mr-2 inline h-4 w-4" /> 回答問題
				</NavLi>
				<NavLi href="/image-description" class="flex items-center justify-center">
					<Image class="mr-2 inline h-4 w-4" /> 看圖敘述
				</NavLi>
			</NavUl>
		</Navbar>
	</header>

	<!-- Main Content -->
	<main class="flex-grow">
		{@render children()}
	</main>
</div>
