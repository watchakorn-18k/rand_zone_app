<script lang="ts">
  import { onMount } from 'svelte';

  let sabers: Array<{ id: number; x: number; y: number; angle: number; duration: number }> = [];
  let saberId = 0;

  function spawnSaber() {
    if (typeof window === 'undefined' || document.hidden) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Shoot from exact screen center without grid snapping
    const cx = w / 2;
    const cy = h / 2;

    // Pick a random direction snapping to grid orientations (0, 90, 180, 270)
    const angles = [0, 90, 180, 270];
    const angle = angles[Math.floor(Math.random() * angles.length)];

    const duration = 1.0 + Math.random() * 1.5;
    const id = saberId++;
    sabers = [...sabers, { id, x: cx, y: cy, angle, duration }];
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
      style:top={`${saber.y}px`}
      style:left={`${saber.x}px`}
      style:width="150px"
      style:height="1px"
      style:background="linear-gradient(to right, transparent, rgba(59, 130, 246, 0.4))"
      style:box-shadow="10px 0 10px 1px rgba(59, 130, 246, 0.2)"
      style:transform={`rotate(${saber.angle}deg)`}
      style:transform-origin="left center"
      style:animation={`saberShoot ${saber.duration}s ease-in forwards`}
      style:--saber-tx={`${Math.cos(saber.angle * Math.PI / 180) * 1200}px`}
      style:--saber-ty={`${Math.sin(saber.angle * Math.PI / 180) * 1200}px`}
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
