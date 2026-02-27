<script lang="ts">
  import { onMount } from 'svelte';

  let sabers: Array<{ id: number; vertical: boolean; pos: number; dir: 1 | -1; duration: number }> = [];
  let saberId = 0;

  function spawnSaber() {
    if (typeof window === 'undefined' || document.hidden) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vertical = Math.random() > 0.5;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const duration = 1.5 + Math.random() * 2;
    
    let pos;
    if (vertical) {
      const cols = Math.floor(w / 64);
      pos = Math.floor(Math.random() * cols) * 64;
    } else {
      const rows = Math.floor(h / 64);
      pos = Math.floor(Math.random() * rows) * 64;
    }
    const id = saberId++;
    sabers = [...sabers, { id, vertical, pos, dir, duration }];
    setTimeout(() => {
      sabers = sabers.filter(s => s.id !== id);
    }, duration * 1000);
  }

  onMount(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) spawnSaber();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
  {#each sabers as saber (saber.id)}
    <div
      class="absolute z-0"
      style:top={saber.vertical ? (saber.dir === 1 ? '-200px' : '100vh') : `${saber.pos}px`}
      style:left={saber.vertical ? `${saber.pos}px` : (saber.dir === 1 ? '-200px' : '100vw')}
      style:width={saber.vertical ? '1px' : '200px'}
      style:height={saber.vertical ? '200px' : '1px'}
      style:background={saber.vertical 
        ? `linear-gradient(${saber.dir === 1 ? 'to bottom' : 'to top'}, transparent, #3b82f6)` 
        : `linear-gradient(${saber.dir === 1 ? 'to right' : 'to left'}, transparent, #3b82f6)`}
      style:box-shadow={saber.vertical 
        ? `0 ${saber.dir === 1 ? '10px' : '-10px'} 20px 2px rgba(59, 130, 246, 0.8)` 
        : `${saber.dir === 1 ? '10px' : '-10px'} 0 20px 2px rgba(59, 130, 246, 0.8)`}
      style:animation={`saberShoot ${saber.duration}s linear forwards`}
      style:--saber-tx={saber.vertical ? '0px' : (saber.dir === 1 ? 'calc(100vw + 400px)' : 'calc(-100vw - 400px)')}
      style:--saber-ty={saber.vertical ? (saber.dir === 1 ? 'calc(100vh + 400px)' : 'calc(-100vh - 400px)') : '0px'}
    ></div>
  {/each}
</div>

<style>
  :global(body)::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 64px 64px;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes saberShoot {
    to {
      transform: translate(var(--saber-tx), var(--saber-ty));
    }
  }
</style>
