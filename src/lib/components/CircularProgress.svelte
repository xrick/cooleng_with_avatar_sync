<script lang="ts">
	export let score: number = 0; // 0~100
	export let size: number = 40;
	export let stroke: number = 6;
	// 顏色可自訂
	export let color: string | undefined;

	function getCircleColor(score: number) {
		if (color) return color;
		if (score < 60) return '#ef4444'; // red-500
		if (score < 80) return '#3b82f6'; // primary
		if (score < 90) return '#a21caf'; // secondary
		return '#10b981'; // emerald-500
	}
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const percent = Math.max(0, Math.min(score, 100));
</script>

<svg width={size} height={size} class="inline-block align-middle" style="vertical-align:middle">
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke="#e5e7eb"
		stroke-width={stroke}
	/>
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke={getCircleColor(score)}
		stroke-width={stroke}
		stroke-dasharray={circumference}
		stroke-dashoffset={circumference * (1 - percent / 100)}
		stroke-linecap="round"
		style="transition:stroke-dashoffset 0.5s;"
	/>
	<text
		x="50%"
		y="54%"
		text-anchor="middle"
		dominant-baseline="middle"
		font-size={size * 0.32}
		fill="#374151"
		font-weight="bold">{score}</text
	>
</svg>
