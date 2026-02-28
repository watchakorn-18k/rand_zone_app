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
      const maxIterations = 8;
      
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
          setTimeout(() => isGenerating = false, 200);
        }
      }, 20);
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
          <div class="mb-5 p-6 bg-bg-panel/40 border border-border-subtle rounded-2xl flex items-center justify-center min-h-[220px] relative overflow-hidden">
            <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"></div>
            
            <div 
              class="rounded-2xl transition-all duration-300 border border-white/10 flex items-center justify-center text-center overflow-hidden bg-bg-card shadow-2xl relative" 
              style="{(() => {
                let style = 'min-width: 140px; min-height: 140px; max-width: 380px; max-height: 200px;';
                
                // Tailwind Color Mapper
                const twColors = {
                  'blue': '#3b82f6', 'emerald': '#10b981', 'amber': '#f59e0b', 
                  'rose': '#f43f5e', 'cyan': '#06b6d4', 'violet': '#8b5cf6',
                  'indigo': '#6366f1', 'slate': '#64748b'
                };
                const twMatch = previewValue.match(/^(blue|emerald|amber|rose|cyan|violet|indigo|slate)-(\d00)$/);

                if (previewValue.includes(':')) {
                  style += previewValue;
                  if (previewValue.includes('text-shadow')) style += '; background: white; color: transparent;';
                  if (previewValue.includes('z-index')) style += '; background: var(--color-accent-default); color: white;';
                  if (previewValue.includes('aspect-ratio')) style += '; width: 220px; height: auto; background: var(--color-accent-default);';
                  if (previewValue.includes('grid-template-columns')) style += '; display: grid; width: 340px; height: auto; min-height: 140px; background: transparent; padding: 16px; border: 2px dashed rgba(255,255,255,0.1); box-shadow: none;';
                  if (previewValue.includes('flex-') || previewValue.includes('justify-') || previewValue.includes('align-')) {
                    const isWrap = previewValue.includes('wrap');
                    style += `; display: flex; width: ${isWrap ? '220px' : '340px'}; height: ${isWrap ? 'auto' : '160px'}; min-height: 120px; background: transparent; padding: 12px; border: 2px dashed rgba(255,255,255,0.1); box-shadow: none;`;
                  }
                } 
                else if (twMatch) {
                    const color = twColors[twMatch[1]];
                    style += `background-color: ${color}; width: 140px; height: 140px; filter: saturate(${parseInt(twMatch[2])/500});`;
                }
                else if (previewValue.startsWith('#') || previewValue.startsWith('rgb') || previewValue.startsWith('hsl')) {
                  style += `background-color: ${previewValue}; width: 140px; height: 140px;`;
                } 
                else if (previewValue.includes('px') && previewValue.includes('rgba')) {
                  style += `box-shadow: ${previewValue}; background: white; width: 140px; height: 140px;`;
                } 
                else if (previewValue.includes('gradient')) {
                  style += `background: ${previewValue}; width: 260px; height: 140px;`;
                } 
                else if (previewValue.includes('sans-serif') || previewValue.includes('serif') || previewValue.includes('monospace')) {
                  style += `font-family: ${previewValue}; background: white; color: #1f2937; padding: 30px; width: 280px;`;
                }
                else if (previewValue.includes('gap-')) {
                   const gapVal = parseInt(previewValue.split('-')[1]) * 4;
                   style += `gap: ${gapVal}px; display: flex; background: transparent; width: auto; height: auto; padding: 24px; border: none; shadow: none;`;
                }
                else if (previewValue.includes('%')) {
                   style += `border-radius: ${previewValue}; background: var(--color-accent-default); width: 140px; height: 140px;`;
                } else {
                   style += 'width: 140px; height: 140px; background: var(--color-accent-default);';
                }
                
                return style;
              })()}"
            >
              <!-- Constant items that slide with CSS transitions instead of unmounting -->
              {#if previewValue.includes('grid-') || previewValue.includes('flex-') || previewValue.includes('justify-') || previewValue.includes('align-') || previewValue.includes('gap-')}
                {#each [1, 2, 3, 4, 5, 6] as i}
                  {#if i <= (previewValue.includes('grid-') || previewValue.includes('wrap') ? 6 : (previewValue.includes('gap-') ? 2 : 3))}
                    <div 
                      class="rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0 transition-all duration-300"
                      style="width: {40 + (i * 8)}px; height: {40 + (i * 4)}px; background: {['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'][i - 1]}"
                    >
                      {i}
                    </div>
                  {/if}
                {/each}
              {:else if previewValue.includes('font') || previewValue.includes('sans-serif') || previewValue.includes('serif') || previewValue.includes('monospace') || previewValue.includes('clamp')}
                <div class="flex flex-col items-center transition-all duration-300">
                  <span class="font-bold leading-none transition-all duration-300" style="{previewValue.includes('clamp') || previewValue.includes('font-size') ? previewValue : 'font-size: 2.5rem;'}">Aa</span>
                  <span class="text-[9px] opacity-50 block mt-2 tracking-widest font-sans uppercase">Typography</span>
                </div>
              {:else if previewValue.includes('aspect-ratio')}
                <div class="flex flex-col items-center text-white transition-all duration-300">
                  <i class="ri-aspect-ratio-line text-3xl mb-1"></i>
                  <span class="text-[10px] font-mono leading-none">{previewValue.split(': ')[1]}</span>
                </div>
              {:else if previewValue.includes('padding')}
                <div class="w-full h-full bg-white/10 flex items-center justify-center p-2 transition-all duration-300">
                  <div class="w-full h-full bg-white/40 border border-white/20 rounded-lg"></div>
                </div>
              {:else if previewValue.includes('delay')}
                <div class="flex flex-col items-center text-white transition-all duration-300">
                  <div class="relative w-10 h-10 mb-2">
                    <i class="ri-loader-4-line text-3xl absolute inset-0 flex items-center justify-center animate-spin"></i>
                    <i class="ri-timer-line text-sm absolute inset-0 flex items-center justify-center"></i>
                  </div>
                  <span class="text-[11px] font-bold">Delay: {previewValue.match(/\d+/)?.[0]}ms</span>
                </div>
              {:else if previewValue.includes('z-index')}
                <div class="flex flex-col items-center text-white transition-all duration-300">
                  <i class="ri-layers-line text-3xl mb-1"></i>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">Z-Index: {previewValue.match(/\d+/)?.[0]}</span>
                </div>
              {:else if previewValue.match(/^(blue|emerald|amber|rose|cyan|violet|indigo|slate)-(\d00)$/)}
                <div class="text-white font-bold text-sm uppercase opacity-90 transition-all duration-300">{previewValue}</div>
              {:else}
                <div class="text-white opacity-40 text-xs font-mono transition-all duration-300 uppercase tracking-tighter">
                   {previewValue.length > 15 ? 'UI Style' : previewValue}
                </div>
              {/if}
            </div>

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

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes flyIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }


</style>
