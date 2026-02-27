<script lang="ts">
  import { showToast } from '$lib/utils/toast';
  import { v1, v4, v6, v7 } from 'uuid';

  export let version = '4';
  export let count = 1;
  let isGenerating = false;
  
  // Format: [version, value]
  let currentResults: string[] = [];
  let history: Array<{ values: string[]; time: string; version: string; idx: number }> = [];

  export function getState() {
    return { v: version, c: count };
  }

  export function setState(state: any) {
    if (state) {
      if (state.v && ['1', '4', '6', '7'].includes(state.v)) version = state.v;
      if (state.c) count = Math.max(1, Math.min(100, parseInt(state.c) || 1));
    }
  }

  function handleCountChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value) || 1;
    count = Math.max(1, Math.min(100, val));
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function startGenerate() {
    if (isGenerating) return;
    isGenerating = true;

    try {
      const btn = document.getElementById('genUuidBtn');
      btn?.classList.add('opacity-50', 'pointer-events-none');
      
      // small fast-flicker animation to make it look "computing"
      const duration = 800;
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed < duration) {
          // flicker state
          currentResults = Array.from({ length: Math.min(count, 5) }).map(() => v4().replace(/-/g, 'x'));
          requestAnimationFrame(animate);
        } else {
          // final generation
          const results: string[] = [];
          for(let i=0; i<count; i++) {
            if (version === '1') results.push(v1());
            else if (version === '6') results.push(v6());
            else if (version === '7') results.push(v7());
            else results.push(v4());
          }
          currentResults = results;
          
          history.unshift({
            values: results,
            time: new Date().toLocaleTimeString('th-TH'),
            version: `v${version}`,
            idx: history.length + 1
          });
          history = history; // svelte reactivity trigger
          
          isGenerating = false;
          btn?.classList.remove('opacity-50', 'pointer-events-none');
        }
      };

      requestAnimationFrame(animate);
    } catch (error) {
      isGenerating = false;
      showToast('เกิดข้อผิดพลาดในการสุ่ม UUID');
      document.getElementById('genUuidBtn')?.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  function clearHistory() {
    history = [];
    currentResults = [];
  }

  function copyResults() {
    if (!currentResults.length) return;
    navigator.clipboard.writeText(currentResults.join('\n')).then(() => {
      showToast('คัดลอก UUID แล้ว');
    });
  }
  
  function copySingle(val: string) {
    navigator.clipboard.writeText(val).then(() => {
      showToast('คัดลอกแล้ว');
    });
  }
</script>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-fingerprint-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">ตั้งค่า UUID</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">รหัสสากล (Universally Unique Identifier) การันตีไม่ซ้ำกันตามมาตรฐาน RFC 9562</p>
    
    <div class="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="uuidVersion" class="block text-xs font-semibold text-text-tertiary mb-2">เวอร์ชัน (Version)</label>
        <div class="relative">
          <select 
            id="uuidVersion" 
            bind:value={version}
            class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 appearance-none outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20"
          >
            <option value="4">v4 (Random) - นิยมมากที่สุด</option>
            <option value="7">v7 (Unix Time Sortable) - มาใหม่ล่าสุด!</option>
            <option value="1">v1 (Time & MAC) - แบบดั้งเดิม</option>
            <option value="6">v6 (Reordered Time) - เรียงเวลาได้</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            <i class="ri-arrow-down-s-line"></i>
          </div>
        </div>
      </div>
      <div>
        <label for="uuidCount" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวนรหัส (1 - 100)</label>
        <input 
          type="number" 
          id="uuidCount" 
          min="1" 
          max="100" 
          bind:value={count}
          on:change={handleCountChange}
          class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" 
        />
      </div>
    </div>
    
    <div class="ml-11 mt-4">
      <div class="bg-bg-panel/50 border border-border-subtle rounded-lg p-3 text-xs text-text-tertiary flex gap-2">
        <i class="ri-information-line text-accent-default text-base -mt-0.5"></i>
        <span>
        {#if version === '4'}
          <b>UUID v4</b> ใช้ระบบสุ่ม (Random) ล้วนๆ เหมาะสำหรับทำ Primary Key หรือรหัสอ้างอิงที่ไม่ต้องการให้ใครคาดเดาได้
        {:else if version === '7'}
          <b>UUID v7</b> ใหม่ล่าสุด! ขึ้นต้นด้วยเวลา Unix Timestamp ทำให้สามารถรันเรียงลำดับในฐานข้อมูล (Sortable) ได้ไวมาก และส่วนที่เหลือสุ่ม
        {:else if version === '1'}
          <b>UUID v1</b> อ้างอิงจากเวลา MAC Address ไม่แนะนำให้ใช้ในงานที่ต้องการความปลอดภัยสูงเพราะเดาที่มาได้
        {:else if version === '6'}
          <b>UUID v6</b> คือการเอา v1 มาสลับโครงสร้างเวลาเพื่อให้สามารถ Sort เรียงไปหน้า-หลังได้ง่ายขึ้น
        {/if}
        </span>
      </div>
    </div>
  </section>

  <div class="mt-10 flex flex-col items-center">
    <!-- Action -->
    <button on:click={startGenerate} id="genUuidBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-magic-line text-lg"></i> สร้าง UUID เลย!
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Standard RFC 9562 &middot; 100% Client-side</div>

    <!-- Live Results Area -->
    {#if currentResults.length > 0 && !isGenerating}
      <div class="mt-10 w-full max-w-2xl bg-bg-card border-x-4 border-accent-default border-y border-y-border-default rounded-2xl p-6 shadow-xl anim-result">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div class="flex items-center gap-2 text-sm font-semibold text-text-primary"><i class="ri-key-2-line text-accent-default"></i> ผลลัพธ์ UUID v{version}</div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-text-tertiary flex items-center gap-1"><i class="ri-check-line text-status-success"></i> {currentResults.length} Generated</span>
            <button on:click={copyResults} class="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md"><i class="ri-file-copy-line"></i> คัดลอกทั้งหมด</button>
          </div>
        </div>
        <div class="max-h-[350px] overflow-y-auto space-y-1.5 pr-2 font-mono text-[13px] text-text-secondary custom-scrollbar">
          {#each currentResults as res, i}
          <div class="flex items-center justify-between group hover:text-white transition-colors bg-base-950/20 px-3 py-1.5 rounded-md border border-transparent hover:border-border-subtle">
            <span class="tracking-wide">{res}</span>
            <button on:click={() => copySingle(res)} class="text-text-tertiary hover:text-accent-default opacity-0 group-hover:opacity-100 transition-opacity" title="คัดลอก"><i class="ri-clipboard-line"></i></button>
          </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- History -->
    {#if history.length > 0 && !isGenerating}
    <div id="uuidHistory" class="mt-10 w-full max-w-2xl">
      <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติล่าสุด (History)</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้างทั้งหมด</button>
      </div>
      <div class="space-y-4 max-h-[300px] overflow-y-auto pr-1 mt-4">
        {#each history as h, i (h.idx)}
        <div class="flex flex-col gap-1 p-3 bg-bg-panel/30 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.05}s">
          <div class="flex items-center justify-between mb-1">
            <span class="font-mono text-[10px] bg-bg-panel border border-border-default px-1.5 py-0.5 rounded text-accent-default uppercase">{h.version}</span>
            <span class="font-mono text-[11px] text-text-tertiary">{h.time} &middot; {h.values.length} items</span>
          </div>
          {#each h.values.slice(0, 3) as v}
            <div class="font-mono text-text-tertiary flex justify-between items-center px-1">
              <span>{v}</span>
            </div>
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

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--color-border-subtle);
    border-radius: 20px;
  }
</style>
