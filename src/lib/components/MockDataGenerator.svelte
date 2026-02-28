<script lang="ts">
  import { showToast } from '$lib/utils/toast';
  import { MOCK_SCHEMAS, type SchemaDefinition } from '$lib/data/mock-schemas';

  let selectedSchema: string = 'users';
  let rowCount = 50;
  let searchQuery = '';
  let generatedJson = '';
  let generatedData: any[] = [];

  export function getState() {
    return { s: selectedSchema, r: rowCount };
  }

  export function setState(state: any) {
    if (state) {
      if (state.s) selectedSchema = state.s;
      if (state.r) rowCount = Math.max(1, Math.min(500, parseInt(state.r) || 50));
    }
  }

  $: filteredSchemas = MOCK_SCHEMAS.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function generate() {
    const count = Math.max(1, Math.min(500, rowCount));
    const schema = MOCK_SCHEMAS.find(s => s.key === selectedSchema);
    if (!schema) return;

    const data: any[] = [];
    for (let i = 0; i < count; i++) {
      data.push(schema.generator(i + 1));
    }

    generatedData = data;
    generatedJson = JSON.stringify(data, null, 2);
  }

  function copyJson() {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson).then(() =>
      showToast(`คัดลอก JSON ${generatedData.length} รายการแล้ว`)
    );
  }

  function downloadJson() {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchema}_${generatedData.length}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลด JSON แล้ว');
  }

  function copyTsv() {
    if (!generatedData.length) return;
    const headers = Object.keys(generatedData[0]);
    const rows = generatedData.map(row => headers.map(h => String(row[h] ?? '')).join('\t'));
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv).then(() =>
      showToast(`คัดลอกสำหรับ Excel/Sheet แล้ว (วางใน spreadsheet ได้เลย)`)
    );
  }
  
  // Static API info
  let showApiInfo = false;
</script>

<div class="space-y-8">
  <!-- Schema Selector -->
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-code-s-slash-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">สุ่ม Mock JSON Data</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">สร้างข้อมูลจำลอง JSON สำหรับทดสอบ API, Frontend, หรือเรียนรู้การเขียนโปรแกรม</p>

    <div class="ml-11 space-y-5">
      <!-- Schema Type -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="block text-xs font-semibold text-text-tertiary">เลือกประเภทข้อมูล ({filteredSchemas.length}/{MOCK_SCHEMAS.length})</span>
          <div class="relative w-48">
            <i class="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary text-xs"></i>
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              bind:value={searchQuery}
              class="w-full bg-bg-panel border border-border-default rounded-lg text-[11px] py-1 pl-8 pr-2 outline-none focus:border-accent-default"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
          {#each filteredSchemas as s}
          <button on:click={() => selectedSchema = s.key} class="text-left p-3 rounded-xl border transition-colors {selectedSchema === s.key ? 'border-accent-default bg-accent-default/5' : 'border-border-default bg-bg-panel hover:border-border-default'}">
            <div class="flex items-center gap-2 mb-1">
              <i class="{s.icon} text-accent-default"></i>
              <span class="text-sm font-semibold text-text-primary">{s.label}</span>
            </div>
            <p class="text-[11px] text-text-tertiary line-clamp-1">{s.desc}</p>
          </button>
          {/each}
        </div>
      </div>

      <!-- Row Count -->
      <div class="max-w-[240px]">
        <label for="jsonRowCount" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวน ({rowCount} rows)</label>
        <input type="number" id="jsonRowCount" min="1" max="500" bind:value={rowCount} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 font-mono" />
      </div>
    </div>
  </section>

  <div class="flex flex-col items-center">
    <button on:click={generate} id="genJsonBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-braces-line text-lg"></i> สร้าง JSON
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Client-side Random &middot; No Server Required</div>

    <!-- Results -->
    {#if generatedJson}
    <div class="mt-8 w-full max-w-3xl bg-bg-card border-2 border-border-default rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 bg-bg-panel/50 border-b border-border-subtle flex-wrap gap-2">
        <span class="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <i class="ri-braces-line text-accent-default"></i>
          {selectedSchema}.json
          <span class="text-text-tertiary font-normal">— {generatedData.length} rows</span>
        </span>
        <div class="flex items-center gap-2 flex-wrap">
          <button on:click={copyJson} class="text-[11px] text-text-secondary hover:text-accent-default transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-file-copy-line"></i> JSON
          </button>
          <button on:click={copyTsv} class="text-[11px] text-text-secondary hover:text-green-400 transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-table-line"></i> Excel/Sheet
          </button>
          <button on:click={downloadJson} class="text-[11px] text-text-secondary hover:text-accent-default transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-download-line"></i> .json
          </button>
        </div>
      </div>
      <!-- Code Preview -->
      <pre class="p-4 text-[12px] font-mono text-text-secondary overflow-auto max-h-[400px] leading-relaxed custom-scrollbar">{generatedJson}</pre>
    </div>
    {/if}

    <!-- Static API Info -->
    <div class="mt-8 w-full max-w-3xl">
      <button on:click={() => showApiInfo = !showApiInfo} class="w-full flex items-center justify-between p-4 bg-bg-card border border-border-subtle rounded-xl hover:border-border-default transition-colors text-left">
        <span class="text-sm font-semibold text-text-primary flex items-center gap-2"><i class="ri-server-line text-accent-default"></i> Static API Endpoints (GitHub Pages)</span>
        <i class="ri-arrow-down-s-line text-text-tertiary transition-transform {showApiInfo ? 'rotate-180' : ''}"></i>
      </button>
      {#if showApiInfo}
      <div class="mt-2 p-5 bg-bg-panel border border-border-subtle rounded-xl space-y-4 anim-result">
        <p class="text-[13px] text-text-secondary leading-relaxed">รองรับทั้ง <span class="text-accent-default font-bold">{MOCK_SCHEMAS.length} ประเภทข้อมูล</span> (ไฟล์ละ 500 rows) สามารถใช้งานผ่าน URL:</p>
        
        <div class="space-y-3">
          <!-- Current Selected -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider ml-1">ข้อมูลที่เลือกอยู่ตอนนี้</label>
            <div class="flex items-center gap-2 bg-bg-card border border-accent-default/30 rounded-lg px-4 py-3 shadow-inner">
              <span class="text-[10px] font-mono bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">GET</span>
              <code class="text-[12px] font-mono text-text-primary flex-1 break-all">/api/v1/mock/{selectedSchema}</code>
              <button 
                on:click={() => {
                  const url = `${window.location.origin}/api/v1/mock/${selectedSchema}`;
                  navigator.clipboard.writeText(url).then(() => showToast('คัดลอก URL API แล้ว'));
                }}
                class="px-2 py-1 text-text-tertiary hover:text-accent-default transition-colors"
                title="คัดลอก URL แบบเต็ม"
              >
                <i class="ri-file-copy-line text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Examples -->
          <div class="space-y-1.5 pt-1">
            <label class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider ml-1">ตัวอย่างอื่นๆ</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each ['users', 'products', 'bank_accounts', 'game_characters'].filter(k => k !== selectedSchema).slice(0, 3) as k}
              <div class="flex items-center gap-2 bg-bg-card/50 border border-border-subtle rounded-lg px-3 py-2 text-[11px]">
                 <span class="text-green-400 font-mono text-[9px]">GET</span>
                 <code class="text-text-secondary font-mono flex-1">.../{k}</code>
              </div>
              {/each}
              <div class="flex items-center justify-center border border-dashed border-border-subtle rounded-lg px-3 py-2 text-[10px] text-text-tertiary">
                และอีกกว่า 90 ประเภท...
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-bg-card border border-border-subtle rounded-lg p-3 text-xs text-text-tertiary flex gap-2">
          <i class="ri-information-line text-accent-default text-base -mt-0.5"></i>
          <span>Static JSON ถูกสร้างตอน build — ข้อมูลจะเปลี่ยนทุกครั้งที่ deploy ใหม่ เหมาะสำหรับ mock data testing</span>
        </div>
      </div>
      {/if}
    </div>
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

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; }
</style>
