<script lang="ts">
  import { DEV_UTILS, type DevUtil } from '$lib/data/dev-utils';
  import { showToast } from '$lib/utils/toast';

  let searchQuery = '';
  let selectedCategory = 'All';
  let activeUtil: DevUtil | null = null;
  let generatedValue = '';

  const categories = ['All', ...new Set(DEV_UTILS.map(u => u.category))];

  $: filteredUtils = DEV_UTILS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || u.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  $: groupedUtils = filteredUtils.reduce((acc, util) => {
    if (!acc[util.category]) acc[util.category] = [];
    acc[util.category].push(util);
    return acc;
  }, {} as Record<string, DevUtil[]>);

  $: sortedCategories = Object.keys(groupedUtils).sort();

  function handleOpenModal(util: DevUtil) {
    activeUtil = util;
    generate();
  }

  function generate() {
    if (activeUtil) {
      generatedValue = activeUtil.generator();
    }
  }

  function copy() {
    if (generatedValue) {
      navigator.clipboard.writeText(generatedValue).then(() => {
        showToast('คัดลอกลง Clipboard แล้ว');
      });
    }
  }

  function closeModal() {
    activeUtil = null;
    generatedValue = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeModal();
  }

  export function getState() {
    return { q: searchQuery, c: selectedCategory };
  }

  export function setState(state: any) {
    if (state) {
      if (state.q) searchQuery = state.q;
      if (state.c) selectedCategory = state.c;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-mono font-bold"><i class="ri-tools-line"></i></div>
        <div>
          <h2 class="text-lg font-bold text-text-primary">โคตรสุ่ม (200+)</h2>
          <p class="text-text-tertiary text-[11px]">เลือกเครื่องมือเพื่อสุ่มข้อมูลและตรวจสอบก่อนคัดลอก</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <div class="relative min-w-[200px]">
          <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm"></i>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหรือประเภท..." 
            bind:value={searchQuery}
            class="w-full bg-bg-panel border border-border-default rounded-xl text-xs py-2.5 pl-9 pr-4 outline-none focus:border-orange-500 transition-all"
          />
        </div>
        <select 
          bind:value={selectedCategory}
          class="bg-bg-panel border border-border-default rounded-xl text-xs px-3 py-2 outline-none focus:border-orange-500 text-text-secondary"
        >
          {#each categories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1 -mx-1">
      <div class="px-1 space-y-10">
        {#each sortedCategories as category}
          <div class="space-y-4">
            <div class="sticky top-0 z-10 py-2.5 bg-bg-card/95 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between">
              <h3 class="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <i class="ri-bookmark-3-fill"></i> {category}
                <span class="text-text-tertiary font-mono font-normal tracking-normal">({groupedUtils[category].length})</span>
              </h3>
              <div class="h-px flex-1 bg-gradient-to-r from-orange-500/20 to-transparent ml-4"></div>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {#each groupedUtils[category] as util}
                <button 
                  on:click={() => handleOpenModal(util)}
                  class="flex flex-col items-center justify-center p-4 rounded-xl border border-border-default bg-bg-panel hover:border-orange-500 hover:bg-orange-500/5 hover:shadow-md transition-all group text-center"
                >
                  <i class="{util.icon} text-xl mb-2 text-text-tertiary group-hover:text-orange-500 transition-colors"></i>
                  <span class="text-[11px] font-semibold text-text-secondary group-hover:text-text-primary line-clamp-2 leading-tight">{util.name}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
        
        {#if sortedCategories.length === 0}
          <div class="col-span-full py-12 text-center text-text-tertiary">
            <i class="ri-search-2-line text-3xl mb-2 block opacity-20"></i>
            <p>ไม่พบเครื่องมือที่ค้นหา</p>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <div class="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
    <i class="ri-information-line text-blue-500 text-lg"></i>
    <p class="text-[12px] text-text-secondary leading-relaxed">
      <strong>โคตรสุ่ม</strong> รวบรวมเครื่องมือสุ่มข้อมูลเล็กๆ น้อยๆ ที่ Dev ต้องใช้บ่อยในที่เดียว 
      แยกหมวดหมู่และรองรับการค้นหาแบบ Real-time
    </p>
  </div>
</div>

{#if activeUtil}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-black/40 anim-fade-in"
    on:click|self={closeModal}
  >
    <div class="bg-bg-card border border-border-default w-full max-w-md rounded-3xl shadow-2xl overflow-hidden anim-scale-in">
      <div class="p-6 border-b border-border-subtle flex items-center justify-between bg-bg-panel/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl"><i class="{activeUtil.icon}"></i></div>
          <div>
            <h3 class="font-bold text-text-primary leading-tight">{activeUtil.name}</h3>
            <span class="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">{activeUtil.category}</span>
          </div>
        </div>
        <button on:click={closeModal} class="w-8 h-8 rounded-full hover:bg-bg-hover flex items-center justify-center text-text-tertiary transition-colors">
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <label class="block text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3" for="utilPreview">Preview ข้อมูล</label>
          <div class="relative group">
            <textarea 
              id="utilPreview"
              readonly
              class="w-full bg-bg-panel border-2 border-border-default rounded-2xl p-4 font-mono text-sm text-accent-default focus:border-orange-500 outline-none min-h-[120px] resize-none leading-relaxed"
              bind:value={generatedValue}
            ></textarea>
            <button 
              on:click={copy}
              class="absolute right-3 bottom-3 px-3 py-1.5 bg-accent-default/10 text-accent-default hover:bg-accent-default hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <i class="ri-file-copy-line"></i> คัดลอก
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            on:click={generate}
            class="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <i class="ri-refresh-line"></i> สุ่มใหม่
          </button>
          <button 
            on:click={closeModal}
            class="px-6 bg-bg-panel border border-border-default hover:bg-bg-hover text-text-secondary font-bold py-3.5 rounded-2xl transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; }

  .anim-fade-in {
    animation: fadeIn 0.15s ease-out;
  }
  .anim-scale-in {
    animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
