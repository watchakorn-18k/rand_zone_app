<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { showToast } from '$lib/utils/toast';
  import BackgroundSabers from '$lib/components/BackgroundSabers.svelte';
  import GroupShuffler from '$lib/components/GroupShuffler.svelte';
  import SpinWheel from '$lib/components/SpinWheel.svelte';

  let groupShufflerCmp: GroupShuffler;
  let spinWheelCmp: SpinWheel;
  let currentTab: 'groups' | 'wheel' = 'groups';

  function switchMain(tab: 'groups' | 'wheel') {
    currentTab = tab;
  }

  function shareLink() {
    try {
      const gState = groupShufflerCmp.getState();
      const wState = spinWheelCmp.getState();
      
      const payload = {
        n: gState.n,
        c: gState.c,
        s: gState.s,
        m: gState.m,
        w: wState,
        t: currentTab
      };
      
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
      const url = new URL(window.location.href);
      url.searchParams.set('d', encoded);
      
      navigator.clipboard.writeText(url.toString()).then(() => {
        showToast('คัดลอกลิงก์แชร์แล้ว ส่งให้เพื่อนได้เลย!');
      });
    } catch(e) {
      console.error(e);
      showToast('เกิดข้อผิดพลาดในการสร้างลิงก์');
    }
  }

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const d = urlParams.get('d');
    
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d)));
        
        await tick();
        if (groupShufflerCmp) groupShufflerCmp.setState(decoded);
        if (spinWheelCmp && decoded.w) spinWheelCmp.setState(decoded.w);
        if (decoded.t) switchMain(decoded.t);

        showToast('โหลดข้อมูลจากลิงก์สำเร็จ');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error(e);
        showToast('ลิงก์แชร์ไม่ถูกต้องหรือข้อมูลเสียหาย');
      }
    }
  });
</script>

<svelte:head>
  <title>Rand Zone — ระบบสุ่มกลุ่มและ Spin Wheel</title>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<BackgroundSabers />
<div class="max-w-[900px] mx-auto px-5 pt-6 pb-16 relative z-10">
  <header class="text-center pt-10 pb-8 relative">
    <div class="absolute top-2 right-0 sm:right-2 z-20">
      <button on:click={shareLink} class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-accent-default hover:bg-bg-hover hover:text-accent-default transition-colors">
        <i class="ri-share-forward-line text-sm"></i> แชร์ลิงก์
      </button>
    </div>
    <div class="inline-flex items-center gap-2 text-xs font-mono text-accent-default tracking-[0.2em] uppercase mb-3 opacity-80">
      <i class="ri-scales-3-line text-sm"></i><span>Rand Zone</span>
    </div>
    <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white to-pri-400 bg-clip-text text-transparent leading-tight">
      ระบบสุ่มของ Rand Zone
    </h1>
    <p class="text-text-tertiary text-sm mt-2 font-light">
      Cryptographic Randomness + Fisher-Yates Shuffle &times; 7 รอบ
    </p>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-pri-500 to-transparent"></div>
  </header>

  <div class="flex bg-bg-card border border-border-subtle rounded-xl p-1.5 gap-1.5 mb-6">
    <button data-testid="mainTab1" on:click={() => switchMain('groups')} class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 {currentTab === 'groups' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-group-line"></i> สุ่มแบ่งกลุ่ม
    </button>
    <button data-testid="mainTab2" on:click={() => switchMain('wheel')} class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 {currentTab === 'wheel' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-donut-chart-line"></i> Spin Wheel
    </button>
  </div>

  <div class={currentTab === 'groups' ? 'block' : 'hidden'}>
    <GroupShuffler bind:this={groupShufflerCmp} />
  </div>
  <div class={currentTab === 'wheel' ? 'block' : 'hidden'}>
    <SpinWheel bind:this={spinWheelCmp} />
  </div>
</div>
