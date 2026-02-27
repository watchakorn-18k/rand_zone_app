<script lang="ts">
  import { onMount } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();

  // Mode: 'digit' = random digits, 'range' = min-max range, 'set' = pick from custom set
  let mode: 'digit' | 'range' | 'set' = 'digit';

  // Digit mode
  export let digitCount = 2;
  let isGenerating = false;
  let digits: string[] = Array(digitCount).fill('0');
  let lockedUntil: number[] = Array(digitCount).fill(-1);
  let revealed = false;

  // Range mode
  let rangeMin = 1;
  let rangeMax = 100;
  let rangeResult = '';
  let rangeIsSpinning = false;
  let rangeDisplayValue = '—';

  // Set mode
  let setInput = '';
  let setResult = '';
  let setIsSpinning = false;
  let setDisplayItems: string[] = [];
  let setRevealedItem = '';

  let history: Array<{ value: string; time: string; idx: number; type: string }> = [];

  export function getState() {
    return { d: digitCount, mode, setInput, rMin: rangeMin, rMax: rangeMax };
  }

  export function setState(state: any) {
    if (state) {
      if (state.d) {
        digitCount = Math.max(2, Math.min(10, state.d));
        digits = Array(digitCount).fill('0');
        lockedUntil = Array(digitCount).fill(-1);
      }
      if (state.mode) mode = state.mode;
      if (state.setInput) setInput = state.setInput;
      if (state.rMin !== undefined) rangeMin = state.rMin;
      if (state.rMax !== undefined) rangeMax = state.rMax;
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

  function secureRandomInRange(min: number, max: number): number {
    const range = max - min + 1;
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return min + (buf[0] % range);
  }

  function getSetItems(): string[] {
    return setInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }

  $: setItemCount = getSetItems().length;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // ─── Digit Mode Animation ───
  async function startGenerateDigit() {
    if (isGenerating) return;
    isGenerating = true;
    revealed = false;

    const target: string[] = [];
    for (let i = 0; i < digitCount; i++) {
      target.push(secureDigit(i === 0));
    }
    lockedUntil = Array(digitCount).fill(-1);
    
    const btn = document.getElementById('genNumBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');

    // Phase 1: All digits spin fast
    const phase1End = performance.now() + 800;
    while (performance.now() < phase1End) {
      for (let i = 0; i < digitCount; i++) digits[i] = secureDigit(i === 0);
      digits = digits;
      await sleep(35);
    }

    // Phase 2: Gradually slow down
    let delay = 50;
    for (let tick = 0; tick < 12; tick++) {
      for (let i = 0; i < digitCount; i++) digits[i] = secureDigit(i === 0);
      digits = digits;
      delay += Math.pow(tick, 1.5) * 3;
      await sleep(delay);
    }

    // Phase 3: Lock digits one by one
    for (let lockIdx = 0; lockIdx < digitCount; lockIdx++) {
      const spins = 4 + engine.secureRandomInt(3);
      for (let s = 0; s < spins; s++) {
        for (let i = lockIdx; i < digitCount; i++) digits[i] = secureDigit(i === 0);
        for (let i = 0; i < lockIdx; i++) digits[i] = target[i];
        digits = digits;
        await sleep(100 + lockIdx * 50 + s * 20);
      }
      digits[lockIdx] = target[lockIdx];
      lockedUntil[lockIdx] = 1;
      lockedUntil = lockedUntil;
      digits = digits;
      await sleep(180 + lockIdx * 30);
    }

    revealed = true;
    digits = [...target];
    isGenerating = false;
    btn?.classList.remove('opacity-50', 'pointer-events-none');
    
    history.unshift({
      value: target.join(''),
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1,
      type: 'digit'
    });
    history = history;
  }

  // ─── Range Mode Animation ───
  async function startGenerateRange() {
    const min = Math.min(rangeMin, rangeMax);
    const max = Math.max(rangeMin, rangeMax);
    if (min === max) {
      showToast('ค่าเริ่มต้นและค่าสิ้นสุดต้องไม่เท่ากัน');
      return;
    }
    if (rangeIsSpinning) return;
    rangeIsSpinning = true;
    rangeResult = '';

    const winner = secureRandomInRange(min, max);

    const btn = document.getElementById('genRangeBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');

    // Phase 1: Fast random numbers
    for (let i = 0; i < 25; i++) {
      rangeDisplayValue = String(secureRandomInRange(min, max));
      await sleep(35);
    }

    // Phase 2: Slow down
    for (let i = 0; i < 15; i++) {
      rangeDisplayValue = String(secureRandomInRange(min, max));
      await sleep(60 + Math.pow(i, 1.6) * 8);
    }

    // Phase 3: Final ticks very slow
    for (let i = 0; i < 5; i++) {
      rangeDisplayValue = String(secureRandomInRange(min, max));
      await sleep(250 + i * 100);
    }

    // Reveal
    rangeDisplayValue = String(winner);
    rangeResult = String(winner);
    rangeIsSpinning = false;
    btn?.classList.remove('opacity-50', 'pointer-events-none');

    history.unshift({
      value: String(winner),
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1,
      type: 'range'
    });
    history = history;
  }

  // ─── Set Mode Animation ───
  async function startGenerateSet() {
    const items = getSetItems();
    if (items.length < 2) {
      showToast('กรุณาใส่ตัวเลขหรือข้อความอย่างน้อย 2 รายการ');
      return;
    }
    if (setIsSpinning) return;
    setIsSpinning = true;
    setRevealedItem = '';

    // Pick the final winner
    const winIdx = engine.secureRandomInt(items.length);
    const winner = items[winIdx];

    const btn = document.getElementById('genSetBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');

    // Phase 1: Fast cycle through items
    for (let i = 0; i < 25; i++) {
      setResult = items[engine.secureRandomInt(items.length)];
      await sleep(40);
    }

    // Phase 2: Slow down
    for (let i = 0; i < 15; i++) {
      setResult = items[engine.secureRandomInt(items.length)];
      await sleep(60 + Math.pow(i, 1.6) * 8);
    }

    // Phase 3: Final ticks very slow
    for (let i = 0; i < 5; i++) {
      setResult = items[engine.secureRandomInt(items.length)];
      await sleep(250 + i * 100);
    }

    // Reveal!
    setResult = winner;
    setRevealedItem = winner;
    setIsSpinning = false;
    btn?.classList.remove('opacity-50', 'pointer-events-none');

    history.unshift({
      value: winner,
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1,
      type: 'set'
    });
    history = history;
  }

  function clearHistory() {
    history = [];
  }
</script>

<div class="space-y-8">
  <!-- Mode Switcher -->
  <div class="flex bg-bg-panel rounded-lg p-1 gap-1">
    <button class="flex-1 py-2.5 px-3 rounded-md text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {mode === 'digit' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}" on:click={() => mode = 'digit'}>
      <i class="ri-hashtag"></i> สุ่มหลัก
    </button>
    <button class="flex-1 py-2.5 px-3 rounded-md text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {mode === 'range' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}" on:click={() => mode = 'range'}>
      <i class="ri-arrow-left-right-line"></i> สุ่มช่วง
    </button>
    <button class="flex-1 py-2.5 px-3 rounded-md text-[12px] font-semibold transition-all flex items-center justify-center gap-1 {mode === 'set' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}" on:click={() => mode = 'set'}>
      <i class="ri-list-check-3"></i> สุ่มจากชุด
    </button>
  </div>

  <!-- ═══ DIGIT MODE ═══ -->
  {#if mode === 'digit'}
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

    <button on:click={startGenerateDigit} id="genNumBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-play-list-add-line text-lg"></i> เริ่มการสุ่มเลข!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() (CSPRNG) Standard</div>
  </div>

  <!-- ═══ RANGE MODE ═══ -->
  {:else if mode === 'range'}
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-arrow-left-right-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">กำหนดช่วงตัวเลข</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">กำหนดค่าเริ่มต้นและค่าสิ้นสุดสำหรับสุ่มตัวเลขในช่วงที่กำหนด</p>
    
    <div class="ml-11 grid grid-cols-2 gap-4 max-w-sm">
      <div>
        <label for="rangeMin" class="block text-xs font-semibold text-text-tertiary mb-2">เริ่มต้น (Min)</label>
        <input type="number" id="rangeMin" bind:value={rangeMin} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 font-mono text-center" />
      </div>
      <div>
        <label for="rangeMax" class="block text-xs font-semibold text-text-tertiary mb-2">สิ้นสุด (Max)</label>
        <input type="number" id="rangeMax" bind:value={rangeMax} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 font-mono text-center" />
      </div>
    </div>
  </section>

  <div class="mt-10 flex flex-col items-center">
    <!-- Result Display -->
    <div class="bg-bg-card border-2 {rangeResult ? 'border-accent-default' : 'border-border-default'} rounded-2xl p-8 mb-8 w-full max-w-md shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[120px] transition-colors">
      {#if rangeResult}
        <div class="absolute inset-0 bg-accent-default/5"></div>
      {/if}
      <div class="text-5xl sm:text-6xl font-black text-white font-mono z-10 text-center transition-all {rangeIsSpinning ? 'blur-[0.5px] opacity-70' : ''} {rangeResult ? 'set-pop' : ''}">
        {rangeDisplayValue}
      </div>
      {#if rangeResult}
        <div class="text-[11px] font-mono text-accent-default mt-4 z-10 flex items-center gap-1"><i class="ri-check-double-line"></i> ผลสุ่มในช่วงที่กำหนด</div>
      {/if}
    </div>

    <button on:click={startGenerateRange} id="genRangeBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-refresh-line text-lg"></i> เริ่มสุ่มในช่วงนี้
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Secure Range Randomizer</div>
  </div>

  <!-- ═══ SET MODE ═══ -->
  {:else}
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-list-check-3"></i></div>
      <h2 class="text-lg font-bold text-text-primary">สุ่มจากชุดที่กำหนดเอง</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">ใส่ตัวเลขหรือข้อความ บรรทัดละ 1 รายการ แล้วระบบจะสุ่มเลือกให้ 1 รายการ</p>
    
    <div class="ml-11">
      <label for="setInput" class="block text-xs font-semibold text-text-tertiary mb-2">รายการ ({setItemCount} รายการ)</label>
      <textarea 
        id="setInput" 
        bind:value={setInput}
        rows="6"
        placeholder={"เช่น:\n10\n20\n30\n40\n50\n\nหรือข้อความ:\nอาหารไทย\nอาหารญี่ปุ่น\nอาหารอิตาเลียน"}
        class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-4 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 resize-y font-mono leading-relaxed placeholder:text-text-tertiary/50" 
      ></textarea>
      <div class="flex flex-wrap gap-2 mt-3">
        <span class="text-[11px] text-text-tertiary self-center mr-1">ตัวอย่าง:</span>
        <button on:click={() => setInput = Array.from({length: 10}, (_, i) => i + 1).join('\n')} class="text-[11px] px-2.5 py-1 bg-bg-panel border border-border-default rounded-md text-text-secondary hover:text-text-primary hover:border-accent-default transition-colors">1 - 10</button>
        <button on:click={() => setInput = Array.from({length: 10}, (_, i) => (i + 1) * 10).join('\n')} class="text-[11px] px-2.5 py-1 bg-bg-panel border border-border-default rounded-md text-text-secondary hover:text-text-primary hover:border-accent-default transition-colors">10, 20, …100</button>
        <button on:click={() => setInput = Array.from({length: 100}, (_, i) => i + 1).join('\n')} class="text-[11px] px-2.5 py-1 bg-bg-panel border border-border-default rounded-md text-text-secondary hover:text-text-primary hover:border-accent-default transition-colors">1 - 100</button>
        <button on:click={() => setInput = 'ข้าวผัด\nส้มตำ\nต้มยำกุ้ง\nผัดไทย\nแกงเขียวหวาน\nข้าวมันไก่\nก๋วยเตี๋ยว'} class="text-[11px] px-2.5 py-1 bg-bg-panel border border-border-default rounded-md text-text-secondary hover:text-text-primary hover:border-accent-default transition-colors">🍜 อาหาร</button>
      </div>
    </div>
  </section>

  <div class="mt-10 flex flex-col items-center">
    <!-- Result Display -->
    <div class="bg-bg-card border-2 {setRevealedItem ? 'border-accent-default' : 'border-border-default'} rounded-2xl p-8 mb-8 w-full max-w-md shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[100px] transition-colors">
      {#if setRevealedItem}
        <div class="absolute inset-0 bg-accent-default/5"></div>
      {/if}
      <div class="text-3xl sm:text-4xl font-black text-white font-mono z-10 text-center transition-all {setIsSpinning ? 'blur-[0.5px] opacity-70' : ''} {setRevealedItem ? 'set-pop' : ''}">
        {setResult || '—'}
      </div>
      {#if setRevealedItem}
        <div class="text-[11px] font-mono text-accent-default mt-3 z-10 flex items-center gap-1"><i class="ri-check-double-line"></i> ผลสุ่มสุดท้าย</div>
      {/if}
    </div>

    <button on:click={startGenerateSet} id="genSetBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-shuffle-line text-lg"></i> สุ่มจากชุด!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() (CSPRNG) Standard</div>
  </div>
  {/if}

  <!-- History (shared across both modes) -->
  {#if history.length > 0}
  <div id="numberHistory" class="mt-6 w-full max-w-md mx-auto">
    <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
      <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติการสุ่ม</h3>
      <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
    </div>
    <div class="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
      {#each history as h, i (h.idx)}
      <div class="flex items-center gap-3 px-4 py-2.5 bg-bg-panel/50 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.03}s">
        <span class="font-mono text-[11px] text-text-tertiary w-6 text-right">#{history.length - i}</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-panel border border-border-default {h.type === 'set' ? 'text-status-success' : 'text-accent-default'}">{h.type === 'set' ? 'ชุด' : 'หลัก'}</span>
        <span class="text-text-primary text-base font-bold font-mono tracking-wide flex-1 text-center">{h.value}</span>
        <span class="font-mono text-[11px] text-text-tertiary text-right">{h.time}</span>
      </div>
      {/each}
    </div>
  </div>
  {/if}
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

  :global(.set-pop) {
    animation: setPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes setPop {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
