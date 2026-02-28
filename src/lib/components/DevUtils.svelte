<script lang="ts">
  import { DEV_UTILS, type DevUtil } from '$lib/data/dev-utils';
  import { showToast } from '$lib/utils/toast';
  import { fade, scale, fly } from 'svelte/transition';
  import { backOut, elasticOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';

  let searchQuery = '';
  let selectedCategory = 'All';
  let activeUtil: DevUtil | null = null;
  let generatedValue = '';
  let previewValue = '';
  let isGenerating = false;

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

  const matrixChars = '0123456789ABCDEFHIJKLMNOPQRSTUVWXYZ$+-*/=%<>[]{}@#&_?';
  let rollInterval: any;
  
  function generate() {
    if (activeUtil) {
      if (rollInterval) clearInterval(rollInterval);
      
      let targetValue = '';
      try {
        targetValue = activeUtil.generator();
      } catch (e) {
        targetValue = 'เกิดข้อผิดพลาด';
      }

      isGenerating = true;
      previewValue = targetValue;
      let iterations = 0;
      const maxIterations = 5;
      
      rollInterval = setInterval(() => {
        // Matrix Scramble Logic
        generatedValue = targetValue
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n' || char === '\t') return char;
            if (iterations / maxIterations > (index / targetValue.length) + Math.random() * 0.1) {
               return char;
            }
            return matrixChars[Math.floor(Math.random() * matrixChars.length)];
          })
          .join('');

        iterations++;
        
        if (iterations >= maxIterations) {
          clearInterval(rollInterval);
          generatedValue = targetValue;
          setTimeout(() => isGenerating = false, 50);
        }
      }, 15);
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
    previewValue = '';
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
    <div class="space-y-6 mb-8">
      <!-- Top Row: Title and Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-mono font-bold"><i class="ri-tools-line"></i></div>
          <div>
            <h2 class="text-lg font-bold text-text-primary">โคตรสุ่ม (200+)</h2>
            <p class="text-text-tertiary text-[11px]">เลือกเครื่องมือที่ต้องการแล้วกด "สุ่ม" เพื่อเริ่ม</p>
          </div>
        </div>

        <div class="relative w-full md:w-[280px]">
          <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm"></i>
          <input 
            type="text" 
            placeholder="ค้นหาเครื่องมือ..." 
            bind:value={searchQuery}
            class="w-full bg-bg-panel border border-border-default rounded-xl text-xs py-2.5 pl-9 pr-4 outline-none focus:border-orange-500 transition-all shadow-inner"
          />
        </div>
      </div>

      <!-- Categories Row -->
      <div class="relative border-t border-border-subtle/50 pt-4">
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 scroll-smooth">
          {#each categories as cat}
            <button 
              on:click={() => selectedCategory = cat}
              class="whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold transition-all border {selectedCategory === cat ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-bg-panel border-border-default text-text-tertiary hover:border-text-tertiary'}"
            >
              {cat}
            </button>
          {/each}
        </div>
        <!-- Fade edge for scroll indication -->
        <div class="absolute right-0 top-4 bottom-1 w-12 bg-gradient-to-l from-bg-card via-bg-card/80 to-transparent pointer-events-none"></div>
      </div>
    </div>

    <div class="pr-2 p-1 -mx-1">
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
    role="presentation"
  >
    <div class="bg-bg-card border border-border-default w-full max-w-md rounded-3xl shadow-2xl overflow-hidden anim-fly-in" role="dialog" aria-modal="true">
      <div class="p-6 border-b border-border-subtle flex items-center justify-between bg-bg-panel/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl"><i class="{activeUtil.icon}"></i></div>
          <div>
            <h3 class="font-bold text-text-primary leading-tight">{activeUtil.name}</h3>
            <span class="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">{activeUtil.category}</span>
          </div>
        </div>
        <button on:click={closeModal} class="w-8 h-8 rounded-full hover:bg-bg-hover flex items-center justify-center text-text-tertiary transition-colors" aria-label="ปิด">
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>
      <div class="p-6 pt-2">
        <!-- Visual Preview for UI & Styling -->
        {#if activeUtil.category === 'UI & Styling'}
          {@const id = activeUtil.id}
          <div class="mb-5 p-6 bg-bg-panel/40 border border-border-subtle rounded-2xl flex items-center justify-center min-h-[220px] relative overflow-hidden">
            <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"></div>
              
              <!-- 1. Skeleton Loaders -->
              {#if id === 'ui-skeleton'}
                {@const mode = previewValue.match(/Mode:\s*(\w+)/)?.[1] || 'card'}
                {@const itemStyle = previewValue.split('{\n')[1]?.split('\n}')[0] || ''}
                
                <div class="w-full max-w-[240px] p-5 bg-white rounded-2xl shadow-xl flex flex-col gap-4 transition-all duration-300">
                  {#if mode === 'profile'}
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 shrink-0 anim-skeleton" style="{itemStyle}"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-3 w-3/4 anim-skeleton" style="{itemStyle}"></div>
                        <div class="h-3 w-1/2 anim-skeleton" style="{itemStyle}"></div>
                      </div>
                    </div>
                  {:else if mode === 'list'}
                    <div class="space-y-4">
                      {#each [1, 2, 3] as i}
                        <div class="flex items-center gap-3">
                          <div class="w-2 h-2 rounded-full shrink-0 anim-skeleton" style="{itemStyle}"></div>
                          <div class="h-2 flex-1 anim-skeleton" style="{itemStyle}"></div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <div class="w-10 h-10 anim-skeleton" style="{itemStyle}"></div>
                    <div class="space-y-2">
                      <div class="h-3 anim-skeleton w-[70%]" style="{itemStyle}"></div>
                      <div class="h-3 anim-skeleton w-[40%]" style="{itemStyle}"></div>
                    </div>
                    <div class="h-16 anim-skeleton w-full" style="{itemStyle}"></div>
                  {/if}
                </div>

              <!-- 2. Badges -->
              {:else if id === 'ui-badge'}
                <div class="flex items-center justify-center p-4">
                  <div class="shadow-sm" style="{previewValue}">
                    <i class="ri-notification-3-line mr-1"></i> NEW
                  </div>
                </div>

              <!-- 3. Modern Inputs -->
              {:else if id === 'ui-input'}
                <div class="w-full max-w-[260px] p-4 bg-white/5 rounded-2xl border border-white/10">
                  <label class="text-[9px] uppercase font-bold text-white/40 block mb-2 px-1">Field Label</label>
                  <div class="flex items-center gap-2 group" style="{previewValue}">
                    <i class="ri-edit-2-line text-white/20 text-sm"></i>
                    <span class="text-xs text-white/20 select-none">Placeholder text...</span>
                  </div>
                </div>

              <!-- 4. Layout Demonstrations (Flex/Grid/Gap/Order) -->
              {:else if id.includes('flex') || id.includes('grid') || id.includes('justify') || id.includes('align') || id.includes('gap') || id === 'ui-order'}
                <div 
                  class="rounded-xl p-4 transition-all duration-300 w-full h-full min-h-[160px]" 
                  style="{previewValue.includes(':') ? previewValue : ''}; {id.includes('grid') ? 'display: grid;' : (id.includes('flex') || id.includes('justify') ? 'display: flex;' : '')}"
                >
                  {#each [1, 2, 3] as i}
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0 transition-all duration-300"
                      style="background: {['#3b82f6', '#10b981', '#f43f5e'][i - 1]}; {i === 2 && (id === 'ui-order' || id === 'ui-flex-grow' || id === 'ui-align-self') ? previewValue : ''}"
                    >
                      {i}{i === 2 && (id === 'ui-order' || id === 'ui-flex-grow' || id === 'ui-align-self') ? '*' : ''}
                    </div>
                  {/each}
                </div>

              <!-- 5. Background Patterns -->
              {:else if id === 'ui-bg-pattern'}
                <div class="w-full h-full relative flex items-center justify-center transition-all duration-300" style="{previewValue}">
                  <div class="bg-white p-4 rounded-xl shadow-2xl text-slate-800 font-bold text-[10px] uppercase tracking-widest border border-slate-100">
                    Card Sample
                  </div>
                </div>

              <!-- 6. Text Gradients -->
              {:else if id === 'ui-text-grad' || id === 'ui-clamp' || id === 'ui-font' || id === 'ui-letter-spacing' || id === 'ui-line-height'}
                <div class="flex flex-col items-center justify-center p-6 text-center">
                  <h4 
                    class="font-black leading-tight transition-all duration-300"
                    style="{previewValue.includes(':') ? previewValue : 'font-size: 2.5rem;'}"
                  >
                    RANDOM
                  </h4>
                  <p 
                    class="text-[10px] opacity-40 mt-3 max-w-[160px]"
                    style="{id === 'ui-line-height' || id === 'ui-letter-spacing' ? previewValue : ''}"
                  >
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>

              <!-- 7. Image Filters -->
              {:else if id === 'ui-filter'}
                <div class="relative transition-all duration-300" style="{previewValue}">
                  <div class="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <i class="ri-image-line text-4xl text-white/50"></i>
                  </div>
                  <div class="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-indigo-500">
                    <i class="ri-magic-line text-sm"></i>
                  </div>
                </div>

              <!-- 8. Standard Colors & Gradients -->
              {:else if previewValue.startsWith('#') || previewValue.startsWith('rgb') || previewValue.startsWith('hsl') || previewValue.includes('gradient')}
                <div 
                  class="w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center border border-white/20 transition-all duration-300 relative overflow-hidden"
                  style="background: {previewValue}"
                >
                   <div class="bg-black/20 backdrop-blur-sm p-2 rounded-lg text-[10px] text-white font-mono font-bold">
                      {previewValue.startsWith('linear') ? 'GRADIENT' : previewValue.toUpperCase()}
                   </div>
                </div>

              <!-- 9. Other Simple Props (Shadow, Radius, Aspect, Z, Delay) -->
              {:else if id === 'ui-shadow' || id === 'ui-shadow-layered'}
                <div class="w-32 h-32 bg-white rounded-2xl flex items-center justify-center transition-all duration-300" style="box-shadow: {previewValue}">
                  <span class="text-slate-400 text-[10px] font-bold uppercase">Shadow</span>
                </div>
              {:else if id === 'ui-radius'}
                <div class="w-32 h-32 bg-orange-500 shadow-xl transition-all duration-300" style="border-radius: {previewValue}"></div>
              {:else if id === 'ui-aspect'}
                <div class="bg-orange-500/20 border-2 border-orange-500 rounded-lg flex items-center justify-center transition-all duration-300" style="{previewValue}; width: 140px;">
                  <span class="text-orange-500 font-bold text-[10px]">{previewValue.split(': ')[1]}</span>
                </div>
              {:else if id === 'ui-animate'}
                 <!-- Standard Delay Preview -->
                 <div class="w-full flex flex-col gap-4 p-4">
                  <div class="h-8 bg-white/5 rounded-full relative overflow-hidden flex items-center px-1">
                    <div class="w-6 h-6 rounded-full bg-white/10 absolute top-1 anim-preview-race"></div>
                  </div>
                  <div class="h-8 bg-orange-500/10 rounded-full relative overflow-hidden flex items-center px-1">
                    <div 
                      class="w-6 h-6 rounded-full bg-orange-500 absolute top-1 anim-preview-race"
                      style="animation-delay: {previewValue.match(/\d+/)?.[0]}ms"
                    ></div>
                  </div>
                  <span class="text-[9px] text-center font-bold text-orange-500">{previewValue.match(/\d+/)?.[0]}ms delay</span>
                </div>
              {:else}
                <div class="text-white opacity-40 text-xs font-mono uppercase tracking-widest">
                   {previewValue.length > 20 ? 'UI Preview' : previewValue}
                </div>
              {/if}
            
            <div class="absolute bottom-2 right-2 text-[10px] font-mono text-text-tertiary bg-bg-panel/80 px-1.5 py-0.5 rounded border border-border-subtle">
              #visual_preview
            </div>
          </div>
        {/if}

        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="util-preview" class="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Preview ข้อมูล</label>
            </div>
            <div class="relative group">
              <textarea 
                id="util-preview"
                readonly
                class="w-full bg-bg-panel border-2 border-border-default rounded-2xl p-4 font-mono text-sm text-accent-default focus:border-orange-500 outline-none min-h-[120px] resize-none leading-relaxed"
                bind:value={generatedValue}
              ></textarea>
              <button 
                on:click={copy}
                class="absolute right-3 bottom-3 px-3 py-1.5 bg-accent-default/10 text-accent-default hover:bg-accent-default hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                aria-label="คัดลอกข้อมูล"
              >
                <i class="ri-file-copy-line"></i> คัดลอก
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
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
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; }

  .anim-fly-in {
    animation: flyIn 0.2s ease-out;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .anim-preview-race {
    animation: preview-race 2.5s infinite ease-in-out;
    left: 4px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes flyIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes preview-race {
    0%, 100% { left: 4px; }
    45%, 55% { left: calc(100% - 28px); }
  }

  .anim-skeleton {
    animation: skeleton-shimmer 1.5s infinite ease-in-out alternate;
  }

  @keyframes skeleton-shimmer {
    from { opacity: 0.4; }
    to { opacity: 1; }
  }
</style>
