<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { showToast } from '$lib/utils/toast';
  import GroupShuffler from '$lib/components/GroupShuffler.svelte';
  import SpinWheel from '$lib/components/SpinWheel.svelte';
  import NumberGenerator from '$lib/components/NumberGenerator.svelte';
  import UuidGenerator from '$lib/components/UuidGenerator.svelte';
  import SnowflakeGenerator from '$lib/components/SnowflakeGenerator.svelte';

  let groupShufflerCmp: GroupShuffler;
  let spinWheelCmp: SpinWheel;
  let numberGeneratorCmp: NumberGenerator;
  let uuidGeneratorCmp: UuidGenerator;
  let snowflakeGeneratorCmp: SnowflakeGenerator;
  
  let currentTab: 'groups' | 'wheel' | 'number' | 'uuid' | 'snowflake' = 'groups';

  function switchMain(tab: 'groups' | 'wheel' | 'number' | 'uuid' | 'snowflake') {
    currentTab = tab;
  }

  function shareLink() {
    try {
      const gState = groupShufflerCmp?.getState() || {};
      const wState = spinWheelCmp?.getState() || {};
      const numState = numberGeneratorCmp?.getState() || {};
      const uuidState = uuidGeneratorCmp?.getState() || {};
      const sfState = snowflakeGeneratorCmp?.getState() || {};
      
      const payload = {
        n: gState.n,
        c: gState.c,
        s: gState.s,
        m: gState.m,
        w: wState,
        num: numState,
        uuid: uuidState,
        sf: sfState,
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
        if (numberGeneratorCmp && decoded.num) numberGeneratorCmp.setState(decoded.num);
        if (uuidGeneratorCmp && decoded.uuid) uuidGeneratorCmp.setState(decoded.uuid);
        if (snowflakeGeneratorCmp && decoded.sf) snowflakeGeneratorCmp.setState(decoded.sf);
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
  <title>Rand Zone — ระบบสุ่มกลุ่ม สุ่มตัวเลข และ UUID ไร้โฆษณา</title>
  <meta name="description" content="Rand Zone แอปเครื่องมือสุ่มกลุ่ม จัดกลุ่ม หมุนวงล้อ สุ่มตัวเลข และสุ่ม UUID (v4/v7) ออนไลน์ฟรี ไม่มีโฆษณากวนใจ ปลอดภัยโปร่งใส 100% ด้วย CSPRNG" />
  <meta name="keywords" content="สุ่มกลุ่ม, สุ่มชื่อ, จับฉลาก, หมุนวงล้อ, สุ่มตัวเลข, สุ่ม uuid, uuid v4, uuid v7, random number generator, แบ่งกลุ่ม" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Rand Zone Tool" />
  <meta name="theme-color" content="#3b82f6" />
  
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Rand Zone — เครื่องมือสุ่มสารพัดประโยชน์ ไร้โฆษณา" />
  <meta property="og:description" content="เครื่องมือช่วยตัดสินใจ จัดกลุ่มสุ่มเพื่อน จับฉลาก และสร้างรหัส UUID ใช้งานง่าย ปราศจากโฆษณาแทรกกวนใจ!" />
  <meta property="og:site_name" content="Rand Zone" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Rand Zone — ระบบสุ่มกลุ่มและหมุนวงล้อออนไลน์ฟรี 100%" />
  <meta name="twitter:description" content="จัดการทีมและตัดสินใจได้ง่ายๆ ผ่านเว็บ ไม่มีโฆษณา รวดเร็ว โปร่งใสด้วย Cryptographic Fairness" />

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Rand Zone",
      "operatingSystem": "Web Browser",
      "applicationCategory": "UtilitiesApplication",
      "description": "ระบบสุ่มและหมุนวงล้อไร้โฆษณา รวมถึงระบบสุ่มตัวเลข (Random Number Generator) และ UUID Generator ทำงานบน Client-side 100% (Static) ปลอดภัยโปร่งใส 100% ด้วย CSPRNG",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "THB"
      },
      "featureList": [
        "Cryptographic Randomness (CSPRNG)",
        "Advanced Group Shuffler",
        "Interactive Spin Wheel",
        "Secure Number Generator",
        "UUID Generator (v7 / v4 / v1 / v6)",
        "Ad-free",
        "Shareable links"
      ]
    }
  </script>

  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

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

  <div class="grid grid-cols-3 lg:grid-cols-5 bg-bg-card border border-border-subtle rounded-xl p-1.5 gap-1 mb-6">
    <button data-testid="mainTab1" on:click={() => switchMain('groups')} class="py-3 px-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {currentTab === 'groups' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-group-line"></i> จับกลุ่ม
    </button>
    <button data-testid="mainTab2" on:click={() => switchMain('wheel')} class="py-3 px-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {currentTab === 'wheel' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-donut-chart-line"></i> Wheel
    </button>
    <button data-testid="mainTab3" on:click={() => switchMain('number')} class="py-3 px-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {currentTab === 'number' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-numbers-line"></i> ตัวเลข
    </button>
    <button data-testid="mainTab4" on:click={() => switchMain('uuid')} class="py-3 px-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {currentTab === 'uuid' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-fingerprint-line"></i> UUID
    </button>
    <button data-testid="mainTab5" on:click={() => switchMain('snowflake')} class="py-3 px-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {currentTab === 'snowflake' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
      <i class="ri-snowflake-line"></i> Snowflake
    </button>
  </div>

  <div class={currentTab === 'groups' ? 'block' : 'hidden'}>
    <GroupShuffler bind:this={groupShufflerCmp} />
  </div>
  <div class={currentTab === 'wheel' ? 'block' : 'hidden'}>
    <SpinWheel bind:this={spinWheelCmp} />
  </div>
  <div class={currentTab === 'number' ? 'block' : 'hidden'}>
    <NumberGenerator bind:this={numberGeneratorCmp} />
  </div>
  <div class={currentTab === 'uuid' ? 'block' : 'hidden'}>
    <UuidGenerator bind:this={uuidGeneratorCmp} />
  </div>
  <div class={currentTab === 'snowflake' ? 'block' : 'hidden'}>
    <SnowflakeGenerator bind:this={snowflakeGeneratorCmp} />
  </div>
</div>
