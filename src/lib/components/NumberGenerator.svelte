<script lang="ts">
  import { onMount } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();

  export let digitCount = 2;
  let isGenerating = false;
  let digits: string[] = Array(digitCount).fill('0');
  let lockedUntil: number[] = Array(digitCount).fill(-1); // -1 = not locked
  let revealed = false;
  let history: Array<{ value: string; time: string; idx: number }> = [];

  export function getState() {
    return { d: digitCount };
  }

  export function setState(state: any) {
    if (state && state.d) {
      digitCount = Math.max(2, Math.min(10, state.d));
      digits = Array(digitCount).fill('0');
      lockedUntil = Array(digitCount).fill(-1);
    }
  }

  function handleDigitChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value) || 2;
    digitCount = Math.max(2, Math.min(10, val));
    digits = Array(digitCount).fill('0');
    lockedUntil = Array(digitCount).fill(-1);
    revealed = false;
  }

  function secureDigit(isFirst: boolean): string {
    const buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return isFirst ? (1 + (buf[0] % 9)).toString() : (buf[0] % 10).toString();
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function startGenerate() {
    if (isGenerating) return;
    isGenerating = true;
    revealed = false;

    // Generate the final target
    const target: string[] = [];
    for (let i = 0; i < digitCount; i++) {
      target.push(secureDigit(i === 0));
    }

    // Reset lock states
    lockedUntil = Array(digitCount).fill(-1);
    
    const btn = document.getElementById('genNumBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');

    // Phase 1: All digits spin fast (0.8s)
    const phase1End = performance.now() + 800;
    while (performance.now() < phase1End) {
      for (let i = 0; i < digitCount; i++) {
        digits[i] = secureDigit(i === 0);
      }
      digits = digits; // trigger reactivity
      await sleep(35);
    }

    // Phase 2: Gradually slow down (0.8s)
    let delay = 50;
    for (let tick = 0; tick < 12; tick++) {
      for (let i = 0; i < digitCount; i++) {
        digits[i] = secureDigit(i === 0);
      }
      digits = digits;
      delay += Math.pow(tick, 1.5) * 3;
      await sleep(delay);
    }

    // Phase 3: Lock digits one by one from left → right with suspense
    for (let lockIdx = 0; lockIdx < digitCount; lockIdx++) {
      // Randomize unlocked digits a few more times, getting slower
      const spins = 4 + engine.secureRandomInt(3);
      for (let s = 0; s < spins; s++) {
        for (let i = lockIdx; i < digitCount; i++) {
          digits[i] = secureDigit(i === 0);
        }
        // Keep already-locked digits at their final value
        for (let i = 0; i < lockIdx; i++) {
          digits[i] = target[i];
        }
        digits = digits;
        await sleep(100 + lockIdx * 50 + s * 20);
      }

      // LOCK this digit → set to final value
      digits[lockIdx] = target[lockIdx];
      lockedUntil[lockIdx] = 1;
      lockedUntil = lockedUntil;
      digits = digits;
      await sleep(180 + lockIdx * 30);
    }

    // Final reveal flash
    revealed = true;
    digits = [...target];
    isGenerating = false;
    btn?.classList.remove('opacity-50', 'pointer-events-none');
    
    history.unshift({
      value: target.join(''),
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1
    });
    history = history;
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
    <!-- Digit Cells Display -->
    <div class="flex gap-1.5 sm:gap-2.5 mb-8 flex-wrap justify-center">
      {#each digits as d, i}
        <div 
          class="digit-cell w-12 h-16 sm:w-14 sm:h-[72px] rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-black font-mono select-none transition-all duration-200
            {lockedUntil[i] === 1 ? 'bg-accent-default/15 border-2 border-accent-default text-white scale-105' : 'bg-bg-panel border-2 border-border-default text-text-secondary'}
            {revealed && lockedUntil[i] === 1 ? 'digit-pop' : ''}
            {isGenerating && lockedUntil[i] !== 1 ? 'digit-spin' : ''}"
        >
          {d}
        </div>
      {/each}
    </div>

    <button on:click={startGenerate} id="genNumBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-play-list-add-line text-lg"></i> เริ่มการสุ่มเลข!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() (CSPRNG) Standard</div>

    {#if history.length > 0}
    <div id="numberHistory" class="mt-10 w-full max-w-md">
      <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติการสุ่มหมายเลข</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div class="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {#each history as h, i (h.idx)}
        <div class="flex items-center gap-3 px-4 py-2.5 bg-bg-panel/50 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.03}s">
          <span class="font-mono text-[11px] text-text-tertiary w-6 text-right">#{history.length - i}</span>
          <span class="text-text-primary text-lg font-bold font-mono tracking-[0.15em] flex-1 text-center">{h.value}</span>
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
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .digit-spin {
    animation: digitSpin 0.1s ease-in-out infinite alternate;
  }

  .digit-pop {
    animation: digitPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes digitSpin {
    from { transform: translateY(-2px); }
    to { transform: translateY(2px); }
  }

  @keyframes digitPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); }
    100% { transform: scale(1.05); }
  }
</style>
