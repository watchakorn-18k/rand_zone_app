<script lang="ts">
  import { onMount } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();

  export let digitCount = 2;
  let isGenerating = false;
  let currentResult = Array(digitCount).fill('0').join('');
  let history: Array<{ value: string; time: string; idx: number }> = [];

  export function getState() {
    return { d: digitCount };
  }

  export function setState(state: any) {
    if (state && state.d) {
      digitCount = Math.max(2, Math.min(10, state.d));
      currentResult = Array(digitCount).fill('0').join('');
    }
  }

  function handleDigitChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value) || 2;
    digitCount = Math.max(2, Math.min(10, val));
    currentResult = Array(digitCount).fill('0').join('');
  }

  function generateSecureDigits(digits: number) {
    let result = '';
    const buf = new Uint8Array(digits);
    crypto.getRandomValues(buf);
    
    for (let i = 0; i < digits; i++) {
      if (i === 0) {
        // First digit should be 1-9 to ensure it doesn't start with 0
        const val = 1 + (buf[i] % 9);
        result += val.toString();
      } else {
        // Other digits 0-9
        result += (buf[i] % 10).toString();
      }
    }
    return result;
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function startGenerate() {
    if (isGenerating) return;
    isGenerating = true;

    try {
      const targetNumber = generateSecureDigits(digitCount);
      const targetStr = targetNumber.toString();
      
      const btn = document.getElementById('genNumBtn');
      btn?.classList.add('opacity-50', 'pointer-events-none');

      // Phase 1: Fast rolling (all digits randomize rapidly)
      const fastTicks = 20 + engine.secureRandomInt(10); // 20-30 fast ticks
      for (let i = 0; i < fastTicks; i++) {
        currentResult = generateSecureDigits(digitCount);
        await sleep(30); // very fast
      }

      // Phase 2: Gradually slow down (all digits still random, but interval increases) 
      const slowTicks = 10 + engine.secureRandomInt(5);
      for (let i = 0; i < slowTicks; i++) {
        currentResult = generateSecureDigits(digitCount);
        const delay = 50 + Math.pow(i, 1.8) * 8; // exponential slowdown
        await sleep(delay);
      }

      // Phase 3: Lock digits one by one from left to right (suspense!)
      const lockedDigits = targetStr.split('');
      for (let lockIdx = 0; lockIdx < digitCount; lockIdx++) {
        // A few ticks randomizing only the remaining unlocked digits
        const ticksPerDigit = 3 + engine.secureRandomInt(3);
        for (let t = 0; t < ticksPerDigit; t++) {
          const randomPart = generateSecureDigits(digitCount - lockIdx - 1);
          currentResult = lockedDigits.slice(0, lockIdx).join('') + generateSecureDigits(1) + randomPart;
          await sleep(80 + lockIdx * 40); // slower for each locked digit
        }
        // Lock this digit to the final value
        currentResult = lockedDigits.slice(0, lockIdx + 1).join('') + generateSecureDigits(Math.max(0, digitCount - lockIdx - 1));
        await sleep(120 + lockIdx * 60);
      }

      // Final reveal
      currentResult = targetStr;
      isGenerating = false;
      btn?.classList.remove('opacity-50', 'pointer-events-none');
      
      history.unshift({
        value: currentResult,
        time: new Date().toLocaleTimeString('th-TH'),
        idx: history.length + 1
      });
      history = history; // svelte reactivity trigger

    } catch (error) {
      isGenerating = false;
      showToast('เกิดข้อผิดพลาดในการสุ่มเลข');
    }
  }

  function clearHistory() {
    history = [];
  }
</script>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-numbers-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">ตั้งค่าจำนวนหลัก</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">เลือกจำนวนหลักของตัวเลขที่คุณต้องการสุ่ม (2-10 หลัก)</p>
    
    <div class="ml-11 max-w-[240px]">
      <label for="digitInput" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวนหลักที่สุ่ม (เริ่มต้น 2 หลัก)</label>
      <input 
        type="number" 
        id="digitInput" 
        min="2" 
        max="10" 
        bind:value={digitCount}
        on:change={handleDigitChange}
        class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-xl font-mono p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 text-center" 
      />
    </div>
  </section>

  <div class="mt-10 flex flex-col items-center">
    <!-- Display Area -->
    <div class="bg-bg-card border-x-4 border-accent-default border-y border-y-border-default rounded-3xl p-8 mb-8 w-full max-w-[320px] shadow-2xl relative overflow-hidden flex justify-center">
      <!-- Glow effect behind numbers -->
      <div class="absolute inset-0 bg-accent-default/5 blur-2xl"></div>
      
      <div class="text-5xl sm:text-6xl font-black text-white tracking-[0.1em] font-mono leading-none drop-shadow-md z-10 transition-all {isGenerating ? 'blur-[1px] opacity-80' : 'blur-none opacity-100'}">
        {currentResult}
      </div>
    </div>

    <button on:click={startGenerate} id="genNumBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-play-list-add-line text-lg"></i> เริ่มการสุ่มเลข!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() (CSPRNG) Standard</div>

    {#if history.length > 0}
    <div id="numberHistory" class="mt-10 w-full max-w-sm">
      <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติการสุ่มหมายเลข</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div class="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {#each history as h, i (h.idx)}
        <div class="flex items-center gap-3 px-4 py-2 bg-bg-panel/50 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.03}s">
          <span class="font-mono text-[11px] text-text-tertiary w-6 text-right">#{history.length - i}</span>
          <span class="text-text-primary text-base font-bold font-mono tracking-wide flex-1 text-center">{h.value}</span>
          <span class="font-mono text-[11px] text-text-tertiary text-right">{h.time}</span>
        </div>
        {/each}
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  :global(.anim-result) {
    animation: resultIn 0.3s ease backwards;
  }

  @keyframes resultIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
