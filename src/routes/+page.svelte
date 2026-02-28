<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { showToast } from '$lib/utils/toast';
  import GroupShuffler from '$lib/components/GroupShuffler.svelte';
  import SpinWheel from '$lib/components/SpinWheel.svelte';
  import NumberGenerator from '$lib/components/NumberGenerator.svelte';
  import UuidGenerator from '$lib/components/UuidGenerator.svelte';
  import SnowflakeGenerator from '$lib/components/SnowflakeGenerator.svelte';
  import PasswordGenerator from '$lib/components/PasswordGenerator.svelte';
  import MockDataGenerator from '$lib/components/MockDataGenerator.svelte';
  import SecretGenerator from '$lib/components/SecretGenerator.svelte';
  import ColorGenerator from '$lib/components/ColorGenerator.svelte';
  import LoremGenerator from '$lib/components/LoremGenerator.svelte';
  import DevUtils from '$lib/components/DevUtils.svelte';

  let groupShufflerCmp: GroupShuffler;
  let spinWheelCmp: SpinWheel;
  let numberGeneratorCmp: NumberGenerator;
  let uuidGeneratorCmp: UuidGenerator;
  let snowflakeGeneratorCmp: SnowflakeGenerator;
  let passwordGeneratorCmp: PasswordGenerator;
  let mockDataGeneratorCmp: MockDataGenerator;
  let secretGeneratorCmp: SecretGenerator;
  let colorGeneratorCmp: ColorGenerator;
  let loremGeneratorCmp: LoremGenerator;
  let devUtilsCmp: DevUtils;
  
  let currentTab: 'groups' | 'wheel' | 'number' | 'uuid' | 'snowflake' | 'password' | 'mockapi' | 'secrets' | 'colors' | 'lorem' | 'utils' = 'groups';

  function switchMain(tab: typeof currentTab) {
    currentTab = tab;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  }

  function shareLink() {
    try {
      const gState = groupShufflerCmp?.getState() || {};
      const wState = spinWheelCmp?.getState() || {};
      const numState = numberGeneratorCmp?.getState() || {};
      const uuidState = uuidGeneratorCmp?.getState() || {};
      const sfState = snowflakeGeneratorCmp?.getState() || {};
      const pwState = passwordGeneratorCmp?.getState() || {};
      const mockState = mockDataGeneratorCmp?.getState() || {};
      const secretState = secretGeneratorCmp?.getState() || {};
      const colorState = colorGeneratorCmp?.getState() || {};
      const loremState = loremGeneratorCmp?.getState() || {};
      const utilsState = devUtilsCmp?.getState() || {};
      
      const payload = {
        n: gState.n,
        c: gState.c,
        s: gState.s,
        m: gState.m,
        w: wState,
        num: numState,
        uuid: uuidState,
        sf: sfState,
        pw: pwState,
        mock: mockState,
        sec: secretState,
        color: colorState,
        lorem: loremState,
        utils: utilsState,
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
        if (passwordGeneratorCmp && decoded.pw) passwordGeneratorCmp.setState(decoded.pw);
        if (mockDataGeneratorCmp && decoded.mock) mockDataGeneratorCmp.setState(decoded.mock);
        if (secretGeneratorCmp && decoded.sec) secretGeneratorCmp.setState(decoded.sec);
        if (colorGeneratorCmp && decoded.color) colorGeneratorCmp.setState(decoded.color);
        if (loremGeneratorCmp && decoded.lorem) loremGeneratorCmp.setState(decoded.lorem);
        if (devUtilsCmp && decoded.utils) devUtilsCmp.setState(decoded.utils);
        if (decoded.t) switchMain(decoded.t);

        showToast('โหลดข้อมูลจากลิงก์สำเร็จ');
      } catch (e) {
        console.error(e);
        showToast('ลิงก์แชร์ไม่ถูกต้องหรือข้อมูลเสียหาย');
      }
    } else {
      const savedTab = urlParams.get('tab');
      const validTabs = ['groups', 'wheel', 'number', 'uuid', 'snowflake', 'password', 'mockapi', 'secrets', 'colors', 'lorem', 'utils'] as const;
      if (savedTab && validTabs.includes(savedTab as any)) {
        currentTab = savedTab as typeof currentTab;
      }
    }
  });
</script>

<svelte:head>
  <title>Rand Zone — ระบบสุ่มกลุ่ม สุ่มตัวเลข และ UUID ไร้โฆษณา</title>
  <meta name="description" content="Rand Zone แอปเครื่องมือสุ่มกลุ่ม จัดกลุ่ม หมุนวงล้อ สุ่มตัวเลข และสุ่ม UUID (v4/v7) ออนไลน์ฟรี ไม่มีโฆษณากวนใจ ปลอดภัยโปร่งใส 100% ด้วย CSPRNG" />
  <meta name="keywords" content="สุ่มกลุ่ม, สุ่มชื่อ, จับฉลาก, หมุนวงล้อ, สุ่มตัวเลข, สุ่ม uuid, uuid v4, uuid v7, random number generator, แบ่งกลุ่ม, dev tools, utils" />
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
        "Advanced Password & Secret/Hash Generator",
        "Mock API Data Generator",
        "Dev Utils (200+ Tools)",
        "Ad-free",
        "Shareable links"
      ]
    }
  </script>

  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="max-w-[1200px] mx-auto px-5 pt-6 pb-16 relative z-10">
  <header class="text-center pt-10 pb-8 relative">
    <div class="absolute top-2 left-0 sm:left-2 z-20">
      <a 
        href="https://github.com/watchakorn-18k/rand_zone_app" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="inline-flex items-center gap-2.5 px-3 py-1.5 bg-bg-panel border border-border-default rounded-xl hover:text-text-primary hover:border-accent-default hover:bg-bg-hover transition-all group shadow-sm"
      >
        <div class="relative w-6 h-6 shrink-0">
          <img 
            src="https://avatars.githubusercontent.com/u/74919942?v=4" 
            alt="watchakorn-18k" 
            class="w-full h-full rounded-full object-cover border border-border-subtle group-hover:border-accent-default transition-colors"
          />
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-bg-panel rounded-full flex items-center justify-center border border-border-default">
            <i class="ri-github-fill text-[8px] text-text-tertiary group-hover:text-accent-default"></i>
          </div>
        </div>
        <div class="hidden sm:flex flex-col items-start leading-none gap-0.5">
          <span class="text-[8px] uppercase tracking-wider text-text-tertiary font-bold">Developed by</span>
          <span class="text-[11px] font-bold text-text-primary">watchakorn-18k</span>
        </div>
      </a>
    </div>
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

  <!-- Tab bar: scrollable on mobile -->
  <div class="overflow-x-auto -mx-1 px-1 mb-6">
    <div class="inline-flex min-w-full bg-bg-card border border-border-subtle rounded-xl p-1.5 gap-1">
      <button data-testid="mainTab1" on:click={() => switchMain('groups')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'groups' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-group-line"></i> จัดทีมสายลุย
      </button>
      <button data-testid="mainTab2" on:click={() => switchMain('wheel')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'wheel' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-donut-chart-line"></i> วงล้อพิชิต
      </button>
      <button data-testid="mainTab3" on:click={() => switchMain('number')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'number' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-numbers-line"></i> สุ่มเลขเด็ด
      </button>
      <button data-testid="mainTab4" on:click={() => switchMain('uuid')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'uuid' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-fingerprint-line"></i> ID เทพ (UUID)
      </button>
      <button data-testid="mainTab5" on:click={() => switchMain('snowflake')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'snowflake' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-snowflake-line"></i> หิมะสุ่ม (Snowflake)
      </button>
      <button data-testid="mainTab6" on:click={() => switchMain('password')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'password' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-lock-password-line"></i> รหัสแกร่ง
      </button>
      <button data-testid="mainTab7" on:click={() => switchMain('mockapi')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'mockapi' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-code-s-slash-line"></i> Mock ทิพย์
      </button>
      <button data-testid="mainTab8" on:click={() => switchMain('secrets')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'secrets' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-key-2-line"></i> คีย์มหาอุด
      </button>
      <button data-testid="mainTab9" on:click={() => switchMain('colors')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'colors' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-palette-line"></i> แต้มสีใหม่
      </button>
      <button data-testid="mainTab10" on:click={() => switchMain('lorem')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'lorem' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}">
        <i class="ri-text-snippet"></i> บทความบ้าคลั่ง
      </button>
      <button data-testid="mainTab11" on:click={() => switchMain('utils')} class="py-3 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap {currentTab === 'utils' ? 'bg-orange-500 text-white' : 'text-text-secondary hover:text-orange-500'}">
        <i class="ri-tools-line"></i> โคตรสุ่ม
      </button>
    </div>
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
  <div class={currentTab === 'password' ? 'block' : 'hidden'}>
    <PasswordGenerator bind:this={passwordGeneratorCmp} />
  </div>
  <div class={currentTab === 'mockapi' ? 'block' : 'hidden'}>
    <MockDataGenerator bind:this={mockDataGeneratorCmp} />
  </div>
  <div class={currentTab === 'secrets' ? 'block' : 'hidden'}>
    <SecretGenerator bind:this={secretGeneratorCmp} />
  </div>
  <div class={currentTab === 'colors' ? 'block' : 'hidden'}>
    <ColorGenerator bind:this={colorGeneratorCmp} />
  </div>
  <div class={currentTab === 'lorem' ? 'block' : 'hidden'}>
    <LoremGenerator bind:this={loremGeneratorCmp} />
  </div>
  <div class={currentTab === 'utils' ? 'block' : 'hidden'}>
    <DevUtils bind:this={devUtilsCmp} />
  </div>

</div>
