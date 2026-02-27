<script lang="ts">
  import { showToast } from '$lib/utils/toast';

  // Discord Epoch: 1 January 2015 00:00:00 UTC
  const DISCORD_EPOCH = 1420070400000n;

  let workerId = 1;
  let processId = 0;
  let count = 1;
  let sequence = 0;
  let isGenerating = false;

  let currentResults: string[] = [];
  let history: Array<{ values: string[]; time: string; idx: number }> = [];

  // Decoder
  let decodeInput = '';
  let decodeResult: { timestamp: string; date: string; workerId: number; processId: number; sequence: number; } | null = null;
  let decodeError = '';

  export function getState() {
    return { w: workerId, p: processId, c: count };
  }

  export function setState(state: any) {
    if (state) {
      if (state.w !== undefined) workerId = Math.max(0, Math.min(31, parseInt(state.w) || 0));
      if (state.p !== undefined) processId = Math.max(0, Math.min(31, parseInt(state.p) || 0));
      if (state.c !== undefined) count = Math.max(1, Math.min(100, parseInt(state.c) || 1));
    }
  }

  function generateSnowflake(ts?: bigint): string {
    const timestamp = ts ?? (BigInt(Date.now()) - DISCORD_EPOCH);
    const wId = BigInt(workerId & 0x1F);
    const pId = BigInt(processId & 0x1F);
    const seq = BigInt(sequence & 0xFFF);
    
    const snowflake = (timestamp << 22n) | (wId << 17n) | (pId << 12n) | seq;
    sequence = (sequence + 1) & 0xFFF;
    return snowflake.toString();
  }

  function decodeSnowflake(id: string) {
    try {
      const snowflake = BigInt(id.trim());
      const timestamp = Number((snowflake >> 22n) + DISCORD_EPOCH);
      const wId = Number((snowflake >> 17n) & 0x1Fn);
      const pId = Number((snowflake >> 12n) & 0x1Fn);
      const seq = Number(snowflake & 0xFFFn);
      
      const date = new Date(timestamp);
      
      decodeResult = {
        timestamp: timestamp.toString(),
        date: date.toLocaleString('th-TH', { 
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZoneName: 'short'
        }),
        workerId: wId,
        processId: pId,
        sequence: seq
      };
      decodeError = '';
    } catch {
      decodeResult = null;
      decodeError = 'รูปแบบ Snowflake ID ไม่ถูกต้อง กรุณาใส่ตัวเลขล้วนๆ';
    }
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function startGenerate() {
    if (isGenerating) return;
    isGenerating = true;
    sequence = 0;

    const btn = document.getElementById('genSnowflakeBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');

    // flicker
    const duration = 600;
    const startTime = performance.now();
    const animate = () => {
      if (performance.now() - startTime < duration) {
        currentResults = Array.from({ length: Math.min(count, 5) }, () => 
          generateSnowflake(BigInt(Date.now()) - DISCORD_EPOCH + BigInt(Math.floor(Math.random() * 1000)))
        );
        requestAnimationFrame(animate);
      } else {
        // final generation
        sequence = 0;
        const results: string[] = [];
        const now = BigInt(Date.now()) - DISCORD_EPOCH;
        for (let i = 0; i < count; i++) {
          results.push(generateSnowflake(now));
        }
        currentResults = results;

        history.unshift({
          values: results,
          time: new Date().toLocaleTimeString('th-TH'),
          idx: history.length + 1
        });
        history = history;

        isGenerating = false;
        btn?.classList.remove('opacity-50', 'pointer-events-none');
      }
    };
    requestAnimationFrame(animate);
  }

  function clearHistory() {
    history = [];
    currentResults = [];
  }

  function copyResults() {
    if (!currentResults.length) return;
    navigator.clipboard.writeText(currentResults.join('\n')).then(() => showToast('คัดลอก Snowflake แล้ว'));
  }

  function copySingle(val: string) {
    navigator.clipboard.writeText(val).then(() => showToast('คัดลอกแล้ว'));
  }

  let activeMode: 'generate' | 'decode' = 'generate';
</script>

<div class="space-y-8">
  <!-- Mode Switcher -->
  <div class="flex bg-bg-panel rounded-lg p-1 gap-1">
    <button class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 {activeMode === 'generate' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}" on:click={() => activeMode = 'generate'}>
      <i class="ri-add-circle-line"></i> สร้าง Snowflake
    </button>
    <button class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 {activeMode === 'decode' ? 'bg-accent-default text-white' : 'text-text-secondary hover:text-text-primary'}" on:click={() => activeMode = 'decode'}>
      <i class="ri-search-eye-line"></i> ถอดรหัส Snowflake
    </button>
  </div>

  <!-- GENERATE MODE -->
  {#if activeMode === 'generate'}
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-snowflake-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">ตั้งค่า Snowflake</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">Snowflake ID ใช้โดย Discord, Twitter/X — 64-bit จัดเรียงตามเวลา ไม่ซ้ำกัน</p>

    <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label for="sfWorkerId" class="block text-xs font-semibold text-text-tertiary mb-2">Worker ID (0-31)</label>
        <input type="number" id="sfWorkerId" min="0" max="31" bind:value={workerId} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" />
      </div>
      <div>
        <label for="sfProcessId" class="block text-xs font-semibold text-text-tertiary mb-2">Process ID (0-31)</label>
        <input type="number" id="sfProcessId" min="0" max="31" bind:value={processId} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" />
      </div>
      <div>
        <label for="sfCount" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวน (1-100)</label>
        <input type="number" id="sfCount" min="1" max="100" bind:value={count} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" />
      </div>
    </div>

    <div class="ml-11 mt-4">
      <div class="bg-bg-panel/50 border border-border-subtle rounded-lg p-3 text-xs text-text-tertiary flex gap-2">
        <i class="ri-information-line text-accent-default text-base -mt-0.5"></i>
        <span><b>โครงสร้าง 64-bit:</b> Timestamp (42 bit) + Worker ID (5 bit) + Process ID (5 bit) + Sequence (12 bit) — Epoch เริ่มนับจาก 1 มกราคม 2015 (Discord Epoch)</span>
      </div>
    </div>
  </section>

  <div class="flex flex-col items-center">
    <button on:click={startGenerate} id="genSnowflakeBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-snowflake-line text-lg"></i> สร้าง Snowflake!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Discord / Twitter Snowflake &middot; 64-bit Time-sortable</div>

    {#if currentResults.length > 0 && !isGenerating}
      <div class="mt-10 w-full max-w-2xl bg-bg-card border-x-4 border-accent-default border-y border-y-border-default rounded-2xl p-6 shadow-xl anim-result">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div class="flex items-center gap-2 text-sm font-semibold text-text-primary"><i class="ri-snowflake-line text-accent-default"></i> ผลลัพธ์ Snowflake ID</div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-text-tertiary flex items-center gap-1"><i class="ri-check-line text-status-success"></i> {currentResults.length} Generated</span>
            <button on:click={copyResults} class="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md"><i class="ri-file-copy-line"></i> คัดลอกทั้งหมด</button>
          </div>
        </div>
        <div class="max-h-[350px] overflow-y-auto space-y-1.5 pr-2 font-mono text-[13px] text-text-secondary custom-scrollbar">
          {#each currentResults as res}
          <div class="flex items-center justify-between group hover:text-white transition-colors bg-base-950/20 px-3 py-1.5 rounded-md border border-transparent hover:border-border-subtle">
            <span class="tracking-wide">{res}</span>
            <button on:click={() => copySingle(res)} class="text-text-tertiary hover:text-accent-default opacity-0 group-hover:opacity-100 transition-opacity" title="คัดลอก"><i class="ri-clipboard-line"></i></button>
          </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if history.length > 0 && !isGenerating}
    <div class="mt-10 w-full max-w-2xl">
      <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติล่าสุด</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
        {#each history as h, i (h.idx)}
        <div class="p-3 bg-bg-panel/30 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.05}s">
          <div class="flex items-center justify-between mb-1">
            <span class="font-mono text-[10px] bg-bg-panel border border-border-default px-1.5 py-0.5 rounded text-accent-default uppercase">Snowflake</span>
            <span class="font-mono text-[11px] text-text-tertiary">{h.time} &middot; {h.values.length} IDs</span>
          </div>
          {#each h.values.slice(0, 3) as v}
            <div class="font-mono text-text-tertiary px-1">{v}</div>
          {/each}
          {#if h.values.length > 3}
            <div class="text-[10px] text-text-tertiary text-center mt-1 italic">...and {h.values.length - 3} more</div>
          {/if}
        </div>
        {/each}
      </div>
    </div>
    {/if}
  </div>

  <!-- DECODE MODE -->
  {:else}
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-search-eye-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">ถอดรหัส Snowflake ID</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">วาง Discord User ID, Server ID, Channel ID หรือ Message ID เพื่อดูว่ามันถูกสร้างเมื่อไหร่</p>

    <div class="ml-11">
      <label for="sfDecodeInput" class="block text-xs font-semibold text-text-tertiary mb-2">Snowflake ID</label>
      <div class="flex gap-2">
        <input 
          type="text" 
          id="sfDecodeInput" 
          bind:value={decodeInput}
          on:input={() => { decodeResult = null; decodeError = ''; }}
          placeholder="เช่น 175928847299117063"
          class="flex-1 bg-bg-panel border border-border-default rounded-xl text-text-primary text-base font-mono p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 placeholder:text-text-tertiary" 
        />
        <button on:click={() => decodeSnowflake(decodeInput)} class="px-5 py-3 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5">
          <i class="ri-search-line"></i> ถอดรหัส
        </button>
      </div>
    </div>

    {#if decodeError}
      <div class="ml-11 mt-4 bg-status-error/10 border border-status-error/20 rounded-lg p-3 text-xs text-status-error flex items-center gap-2">
        <i class="ri-error-warning-line"></i> {decodeError}
      </div>
    {/if}

    {#if decodeResult}
      <div class="ml-11 mt-5 bg-bg-panel border border-border-default rounded-2xl p-5 anim-result">
        <h3 class="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><i class="ri-key-2-line text-accent-default"></i> ผลการถอดรหัส</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-bg-card border border-border-subtle rounded-xl p-3.5">
            <div class="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">วันที่สร้าง</div>
            <div class="text-sm font-semibold text-text-primary">{decodeResult.date}</div>
          </div>
          <div class="bg-bg-card border border-border-subtle rounded-xl p-3.5">
            <div class="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Unix Timestamp (ms)</div>
            <div class="text-sm font-mono text-text-primary">{decodeResult.timestamp}</div>
          </div>
          <div class="bg-bg-card border border-border-subtle rounded-xl p-3.5">
            <div class="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Worker ID</div>
            <div class="text-sm font-mono text-text-primary">{decodeResult.workerId}</div>
          </div>
          <div class="bg-bg-card border border-border-subtle rounded-xl p-3.5">
            <div class="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Process ID</div>
            <div class="text-sm font-mono text-text-primary">{decodeResult.processId}</div>
          </div>
          <div class="bg-bg-card border border-border-subtle rounded-xl p-3.5 sm:col-span-2">
            <div class="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Sequence</div>
            <div class="text-sm font-mono text-text-primary">{decodeResult.sequence}</div>
          </div>
        </div>
      </div>
    {/if}
  </section>
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

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; }
</style>
