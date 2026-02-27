<script lang="ts">
  import { showToast } from '$lib/utils/toast';

  type PaletteMode = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'random';
  
  let mode: PaletteMode = 'random';
  let colorCount = 5;
  let palette: string[] = [];
  let history: Array<{ colors: string[]; mode: PaletteMode; time: string }> = [];
  let previewTheme: 'light' | 'dark' = 'dark';

  import { ALL_GOOGLE_FONTS } from '$lib/data/google-fonts';

  let selectedFont = ALL_GOOGLE_FONTS.find(f => f.name === 'Prompt') || ALL_GOOGLE_FONTS[0];

  function randomFont() {
    selectedFont = ALL_GOOGLE_FONTS[Math.floor(Math.random() * ALL_GOOGLE_FONTS.length)];
  }

  // Helper: HSL to HEX
  function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function generatePalette() {
    const newPalette: string[] = [];
    const baseHue = Math.floor(Math.random() * 360);
    const baseSat = 40 + Math.random() * 50; // 40-90%
    const baseLight = 40 + Math.random() * 40; // 40-80%

    switch (mode) {
      case 'monochromatic':
        for (let i = 0; i < colorCount; i++) {
          newPalette.push(hslToHex(baseHue, baseSat, 15 + (i * (75 / colorCount))));
        }
        break;
      case 'analogous':
        for (let i = 0; i < colorCount; i++) {
          newPalette.push(hslToHex((baseHue + i * 30) % 360, baseSat, baseLight));
        }
        break;
      case 'complementary':
        newPalette.push(hslToHex(baseHue, baseSat, baseLight));
        newPalette.push(hslToHex((baseHue + 180) % 360, baseSat, baseLight));
        // Fill others with variations
        for (let i = 2; i < colorCount; i++) {
          const h = i % 2 === 0 ? baseHue : (baseHue + 180) % 360;
          newPalette.push(hslToHex(h, baseSat - 10 * i, baseLight + (i % 2 === 0 ? 10 : -10)));
        }
        break;
      case 'triadic':
        for (let i = 0; i < colorCount; i++) {
          const h = (baseHue + (i % 3) * 120) % 360;
          newPalette.push(hslToHex(h, baseSat, baseLight));
        }
        break;
      case 'random':
      default:
        for (let i = 0; i < colorCount; i++) {
          newPalette.push(hslToHex(Math.floor(Math.random() * 360), 30 + Math.random() * 60, 20 + Math.random() * 60));
        }
        break;
    }

    palette = newPalette;
    history = [{ colors: [...palette], mode, time: new Date().toLocaleTimeString('th-TH') }, ...history.slice(0, 19)];
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast('คัดลอกลง Clipboard แล้ว'));
  }

  $: tailwindConfig = (() => {
    const config: Record<string, string> = {};
    palette.forEach((c, i) => {
      config[`brand-${i + 1}`] = c;
    });
    return JSON.stringify({ theme: { extend: { colors: config } } }, null, 2);
  })();

  $: cssVars = (() => {
    return `:root {\n${palette.map((c, i) => `  --color-primary-${i + 1}: ${c};`).join('\n')}\n}`;
  })();

  $: fontImportHTML = (() => {
    let url = "";
    if (selectedFont.isLocal) {
      url = "https://watchakorn-18k.github.io/rand_zone_app/fonts/thai-fonts.css";
    } else if (selectedFont.cssUrl) {
      url = selectedFont.cssUrl;
    } else {
      url = `https://fonts.googleapis.com/css2?family=${selectedFont.name.replace(/ /g, '+')}&display=swap`;
    }
    return `<link href="${url}" rel="stylesheet">`;
  })();

  $: fontImportCSS = (() => {
    let url = "";
    if (selectedFont.isLocal) {
      url = "https://watchakorn-18k.github.io/rand_zone_app/fonts/thai-fonts.css";
    } else if (selectedFont.cssUrl) {
      url = selectedFont.cssUrl;
    } else {
      url = `https://fonts.googleapis.com/css2?family=${selectedFont.name.replace(/ /g, '+')}&display=swap`;
    }
    return `@import url('${url}');`;
  })();

  // Initial generation
  import { onMount } from 'svelte';
  onMount(() => {
    if (palette.length === 0) generatePalette();
  });

  export function getState() { return { m: mode, c: colorCount, t: previewTheme, f: selectedFont.name }; }
  export function setState(s: any) { 
    if (s.m) mode = s.m; 
    if (s.c) colorCount = s.c;
    if (s.t) previewTheme = s.t;
    if (s.f) {
      const found = ALL_GOOGLE_FONTS.find(f => f.name === s.f);
      if (found) selectedFont = found;
    }
    generatePalette();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/fonts/thai-fonts.css" />
  {#if !selectedFont.isLocal && (!selectedFont.cssUrl)}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={selectedFont.name.replace(/ /g, '+')}:wght@400;700&display=swap" />
  {:else if selectedFont.cssUrl}
    <link rel="stylesheet" href={selectedFont.cssUrl} />
  {/if}
</svelte:head>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-palette-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">เครื่องมือสุ่มพาเลทสี</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11">สร้างชุดสีที่เข้ากันสำหรับงานออกแบบ UI/UX หรือ Brand Identity</p>

    <div class="ml-11 flex flex-wrap gap-6 items-end">
      <div>
        <label class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider">ทฤษฎีสี / รูปแบบ</label>
        <div class="flex bg-bg-panel p-1 rounded-xl border border-border-subtle gap-1">
          {#each ['random', 'monochromatic', 'analogous', 'complementary', 'triadic'] as m}
            <button 
              on:click={() => { mode = m as PaletteMode; generatePalette(); }}
              class="px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all {mode === m ? 'bg-accent-default text-white' : 'text-text-tertiary hover:text-text-secondary'}"
            >
              {m}
            </button>
          {/each}
        </div>
      </div>
      
      <div>
        <label for="colorCount" class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider">จำนวนสี ({colorCount})</label>
        <input type="range" id="colorCount" min="2" max="8" bind:value={colorCount} on:input={generatePalette} class="w-32 accent-accent-default" />
      </div>

      <button on:click={generatePalette} class="px-6 py-2.5 bg-accent-default hover:bg-accent-hover text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95">
        <i class="ri-refresh-line"></i> สุ่มพาเลทใหม่
      </button>
    </div>
  </section>

  <!-- Palette Display -->
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
    {#each palette as color, i}
      <div class="group flex flex-col gap-2 anim-result" style="animation-delay: {i * 0.05}s">
        <div 
          class="aspect-square rounded-2xl border-4 border-white/5 shadow-lg flex items-end justify-center pb-3 cursor-pointer transition-transform hover:scale-105"
          style="background-color: {color}"
          on:click={() => copyText(color)}
        >
          <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-mono">Copy HEX</div>
        </div>
        <div class="text-center">
          <div class="text-[11px] font-mono font-bold text-text-primary uppercase">{color}</div>
          <div class="text-[9px] text-text-tertiary font-mono">Brand-{i + 1}</div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Preview -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 class="text-xs font-bold text-text-tertiary uppercase tracking-widest">UI Preview</h3>
        <div class="flex items-center gap-2">
          <!-- Font Selection -->
          <div class="flex items-center gap-2 bg-bg-panel p-1 rounded-lg border border-border-subtle">
            <select 
              bind:value={selectedFont} 
              class="bg-transparent text-[11px] font-bold text-text-secondary outline-none px-1 cursor-pointer"
            >
              {#each ALL_GOOGLE_FONTS as f}
                <option value={f}>{f.name}</option>
              {/each}
            </select>
            <button 
              on:click={randomFont}
              class="w-6 h-6 flex items-center justify-center rounded hover:bg-bg-card transition-colors text-text-tertiary hover:text-accent-default"
              title="สุ่มฟอนต์"
            >
              <i class="ri-shuffle-line text-xs"></i>
            </button>
          </div>

          <!-- Theme Toggle -->
          <div class="flex bg-bg-panel p-1 rounded-lg border border-border-subtle gap-1">
            <button 
              on:click={() => previewTheme = 'light'} 
              class="w-7 h-7 flex items-center justify-center rounded transition-all {previewTheme === 'light' ? 'bg-white text-orange-500 shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}"
              title="Light Mode"
            >
              <i class="ri-sun-line text-sm"></i>
            </button>
            <button 
              on:click={() => previewTheme = 'dark'} 
              class="w-7 h-7 flex items-center justify-center rounded transition-all {previewTheme === 'dark' ? 'bg-bg-card text-blue-400 shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}"
              title="Dark Mode"
            >
              <i class="ri-moon-line text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <div 
        class="p-8 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all duration-500 overflow-hidden" 
        style="
          background-color: {previewTheme === 'dark' ? '#0f172a' : '#ffffff'}; 
          border-color: {previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          box-shadow: {previewTheme === 'light' ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none'};
          font-family: '{selectedFont.name}', sans-serif;
        "
      >
        <h4 class="text-xl font-bold transition-colors text-center" style="color: {previewTheme === 'dark' ? '#f8fafc' : '#0f172a'}">
          The Quick <span style="color: {palette[0]}">Brown Fox</span>
        </h4>
        <p class="text-[13px] text-center max-w-[240px] transition-colors leading-relaxed" style="color: {previewTheme === 'dark' ? '#94a3b8' : '#64748b'}">
          Hello! สวัสดีครับ ทดสอบการแสดงผลฟอนต์ <span class="font-bold underline" style="text-decoration-color: {palette[1]}">{selectedFont.name}</span> ใน {previewTheme} mode
        </p>
        <div class="flex gap-2">
          <button class="px-5 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-95" style="background-color: {palette[0]}; box-shadow: 0 10px 15px -3px {palette[0]}40">Primary Action</button>
          <button class="px-5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95" style="border-color: {palette[2]}; color: {palette[2]}">Secondary</button>
        </div>
        
        <!-- Mock UI Elements -->
        <div class="mt-4 w-full grid grid-cols-2 gap-2">
          <div class="h-10 rounded-lg flex items-center px-3 gap-2" style="background-color: {previewTheme === 'dark' ? '#1e293b' : '#f1f5f9'}">
            <div class="w-2 h-2 rounded-full" style="background-color: {palette[3]}"></div>
            <div class="h-2 w-16 rounded-full" style="background-color: {previewTheme === 'dark' ? '#334155' : '#e2e8f0'}"></div>
          </div>
          <div class="h-10 rounded-lg flex items-center px-3 gap-2" style="background-color: {previewTheme === 'dark' ? '#1e293b' : '#f1f5f9'}">
            <div class="w-2 h-2 rounded-full" style="background-color: {palette[4]}"></div>
            <div class="h-2 w-16 rounded-full" style="background-color: {previewTheme === 'dark' ? '#334155' : '#e2e8f0'}"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export -->
    <div class="bg-bg-card border border-border-subtle rounded-2xl p-6">
      <h3 class="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Export Config</h3>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-[11px] font-bold text-text-secondary">Tailwind CSS</span>
            <button on:click={() => copyText(tailwindConfig)} class="text-[10px] text-accent-default hover:underline">Copy JSON</button>
          </div>
          <pre class="bg-bg-panel border border-border-subtle p-3 rounded-xl text-[10px] font-mono text-text-tertiary overflow-x-auto max-h-[100px]">{tailwindConfig}</pre>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-[11px] font-bold text-text-secondary">CSS Variables</span>
            <button on:click={() => copyText(cssVars)} class="text-[10px] text-accent-default hover:underline">Copy CSS</button>
          </div>
          <pre class="bg-bg-panel border border-border-subtle p-3 rounded-xl text-[10px] font-mono text-text-tertiary overflow-x-auto max-h-[100px]">{cssVars}</pre>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-[11px] font-bold text-text-secondary">Font HTML (&lt;link&gt;)</span>
            <button on:click={() => copyText(fontImportHTML)} class="text-[10px] text-accent-default hover:underline">Copy HTML</button>
          </div>
          <pre class="bg-bg-panel border border-border-subtle p-3 rounded-xl text-[10px] font-mono text-text-tertiary overflow-x-auto">{fontImportHTML}</pre>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-[11px] font-bold text-text-secondary">Font CSS (@import)</span>
            <button on:click={() => copyText(fontImportCSS)} class="text-[10px] text-accent-default hover:underline">Copy CSS</button>
          </div>
          <pre class="bg-bg-panel border border-border-subtle p-3 rounded-xl text-[10px] font-mono text-text-tertiary overflow-x-auto">{fontImportCSS}</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- History -->
  {#if history.length > 1}
  <div class="mt-8">
    <h3 class="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">History</h3>
    <div class="flex flex-wrap gap-3">
      {#each history.slice(1) as h}
        <div class="flex bg-bg-panel p-1 rounded-lg border border-border-subtle">
          {#each h.colors as c}
            <div class="w-4 h-4 rounded-sm" style="background-color: {c}" title={c}></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  {/if}
</div>

<style>
  .anim-result {
    animation: resultIn 0.3s ease-out backwards;
  }
  @keyframes resultIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
