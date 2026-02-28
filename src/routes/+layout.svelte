<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { pwaInfo } from 'virtual:pwa-info';

	let { children } = $props();

	onMount(async () => {
		if (browser && 'serviceWorker' in navigator) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onNeedRefresh() {
					console.log('New content available, please refresh.');
				},
				onOfflineReady() {
					console.log('App ready to work offline.');
				}
			});
		}
	});
</script>

<svelte:head>
	{@html pwaInfo?.webManifest.linkTag}
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</svelte:head>

{@render children()}
