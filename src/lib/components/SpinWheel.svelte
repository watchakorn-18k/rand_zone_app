<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();

  let wheelAngle = 0;
  let wheelSpinning = false;
  let animationId = 0; // incremented each spin to cancel previous
  let wheelHistory: Array<{ name: string; time: string; idx: number }> = [];
  let removeAfterSpin = false;
  let isFullscreen = false;

  export function getState() {
    return (document.getElementById('wheelInput') as HTMLTextAreaElement | null)?.value || '';
  }

  export function setState(w: string) {
    const el = document.getElementById('wheelInput') as HTMLTextAreaElement | null;
    if (el) {
      el.value = w;
      onWheelInput();
    }
  }

  function getWheelItems() {
    const r = (document.getElementById('wheelInput') as HTMLTextAreaElement | null)?.value.trim() || '';
    if (!r) return [];
    return [...new Set((r.includes(',') ? r.split(',') : r.split('\n')).map((n) => n.trim()).filter(Boolean))];
  }

  function onWheelInput() {
    const wheelCount = document.getElementById('wheelCount');
    if (wheelCount) wheelCount.textContent = `${getWheelItems().length} รายการ`;
    drawWheel();
  }

  function loadWheelSample() {
    const wheelInput = document.getElementById('wheelInput') as HTMLTextAreaElement | null;
    if (!wheelInput) return;
    wheelInput.value = 'กลุ่ม 1\nกลุ่ม 2\nกลุ่ม 3\nกลุ่ม 4\nกลุ่ม 5';
    onWheelInput();
    showToast('โหลดตัวอย่างวงล้อแล้ว');
  }

  function loadWheelFromGroups() {
    const lr = (window as any)._lr as { gn: string[] } | undefined;
    if (!lr) {
      showToast('ยังไม่มีผลสุ่มกลุ่ม — กรุณาสุ่มก่อน');
      return;
    }
    const wheelInput = document.getElementById('wheelInput') as HTMLTextAreaElement | null;
    if (!wheelInput) return;
    wheelInput.value = lr.gn.join('\n');
    onWheelInput();
    showToast('โหลดชื่อกลุ่มจากผลสุ่มแล้ว');
  }

  function getBlueShades(count: number) {
    const shades: string[] = [];
    for (let i = 0; i < count; i++) {
      const lightness = 25 + (((i * 45) / count) % 50);
      const saturation = 60 + ((i * 20) % 30);
      shades.push(`hsl(217,${saturation}%,${lightness}%)`);
    }
    return shades;
  }

  function getCanvasAndCtx(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
    const canvasId = isFullscreen ? 'wheelCanvasFS' : 'wheelCanvas';
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  }

  async function drawWheel(highlightIdx = -1) {
    await tick();
    
    // Draw on both canvases if fullscreen is open
    const targets = isFullscreen 
      ? [document.getElementById('wheelCanvasFS') as HTMLCanvasElement, document.getElementById('wheelCanvas') as HTMLCanvasElement]
      : [document.getElementById('wheelCanvas') as HTMLCanvasElement];
    
    for (const canvas of targets) {
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      drawOnCanvas(canvas, ctx, highlightIdx);
    }
  }

  function drawOnCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, highlightIdx: number) {
    const items = getWheelItems();
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = W / 2 - 4;

    ctx.clearRect(0, 0, W, H);

    if (items.length === 0) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = '500 14px "IBM Plex Sans Thai"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ใส่รายการเพื่อเริ่มต้น', cx, cy);
      return;
    }

    const n = items.length;
    const arc = (Math.PI * 2) / n;
    const colors = getBlueShades(n);
    const isLarge = W >= 500;

    for (let i = 0; i < n; i++) {
      const start = wheelAngle + i * arc;
      const end = start + arc;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, start, end);
      ctx.closePath();
      ctx.fillStyle = highlightIdx === i ? '#3b82f6' : colors[i];
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      const mid = start + arc / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.fillStyle = highlightIdx === i ? '#ffffff' : '#e2e8f0';
      const fontSize = isLarge
        ? (n > 12 ? 14 : n > 8 ? 16 : 20)
        : (n > 12 ? 10 : n > 8 ? 12 : 14);
      ctx.font = `600 ${fontSize}px "IBM Plex Sans Thai"`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const maxLen = isLarge ? 14 : 10;
      const label = items[i].length > maxLen ? items[i].slice(0, maxLen - 1) + '…' : items[i];
      ctx.fillText(label, R - 16, 0);
      ctx.restore();
    }

    const centerR = isLarge ? 56 : 42;
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function spinWheel() {
    const items = getWheelItems();
    if (items.length < 2) {
      showToast('ต้องมีอย่างน้อย 2 รายการ');
      return;
    }

    // Cancel any in-progress animation
    animationId++;
    const currentAnimId = animationId;

    wheelSpinning = true;
    document.getElementById('wheelResult')?.classList.add('hidden');
    // Hide previous fullscreen result when new spin starts
    const fsResultClear = document.getElementById('fsResultText');
    if (fsResultClear) {
      fsResultClear.classList.remove('opacity-100');
      fsResultClear.classList.add('opacity-0');
    }

    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const n = items.length;
    const targetIdx = buf[0] % n;

    const arc = (Math.PI * 2) / n;
    const sliceMid = targetIdx * arc + arc / 2;
    const targetAngle = -Math.PI / 2 - sliceMid;

    const fullSpins = 6 + engine.secureRandomInt(3);
    // Simple forward rotation — no overshoot, no snap-back
    let totalRotation = fullSpins * Math.PI * 2 + ((targetAngle - wheelAngle) % (Math.PI * 2));
    // Ensure we always rotate forward (positive direction)
    if (totalRotation < fullSpins * Math.PI * 2) totalRotation += Math.PI * 2;
    const finalAngle = wheelAngle + totalRotation;

    const startAngle = wheelAngle;
    const duration = 6000 + engine.secureRandomInt(1500);
    const startTime = performance.now();

    // Easing: fast spins complete early, then crawl through last ~2 slices
    // Uses a single smooth curve — no discontinuity
    function spinEase(t: number): number {
      // Power-of-4 ease-out: most distance covered early, ultra-slow at end
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = spinEase(progress);

      wheelAngle = startAngle + totalRotation * eased;

      // Highlight winning slice only in the last 8% (very end of crawl)
      const highlight = progress > 0.92 ? targetIdx : -1;
      drawWheel(highlight);

      if (progress < 1 && currentAnimId === animationId) {
        requestAnimationFrame(animate);
      } else if (currentAnimId === animationId) {
        wheelAngle = finalAngle % (Math.PI * 2);
        drawWheel(targetIdx);
        wheelSpinning = false;

        const result = items[targetIdx];
        document.getElementById('wheelResult')?.classList.remove('hidden');
        const resultText = document.getElementById('wheelResultText');
        if (resultText) resultText.textContent = result;

        // Show result in fullscreen overlay — stays visible until next spin
        const fsResult = document.getElementById('fsResultText');
        if (fsResult) {
          fsResult.textContent = `🎉 ${result}`;
          fsResult.classList.remove('opacity-0');
          fsResult.classList.add('opacity-100');
        }

        wheelHistory.unshift({
          name: result,
          time: new Date().toLocaleTimeString('th-TH'),
          idx: wheelHistory.length + 1
        });
        renderHistory();

        if (removeAfterSpin) {
          const currentItems = getWheelItems();
          const idx = currentItems.indexOf(result);
          if (idx > -1) {
            currentItems.splice(idx, 1);
            const wheelInput = document.getElementById('wheelInput') as HTMLTextAreaElement | null;
            if (wheelInput) {
              wheelInput.value = currentItems.join('\n');
              onWheelInput();
            }
          }
        }
      }
    }

    requestAnimationFrame(animate);
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      tick().then(() => drawWheel());
    } else {
      document.body.style.overflow = '';
      tick().then(() => drawWheel());
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  }

  function renderHistory() {
    const container = document.getElementById('wheelHistory');
    const list = document.getElementById('historyList');
    if (!container || !list) return;

    if (wheelHistory.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    list.innerHTML = wheelHistory
      .map((h, i) => `
    <div class="flex items-center gap-3 px-3 py-2 bg-bg-panel/50 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:${i * 0.03}s">
      <span class="font-mono text-[11px] text-text-tertiary w-6 text-right">#${wheelHistory.length - i}</span>
      <span class="text-text-primary font-medium flex-1">${h.name}</span>
      <span class="font-mono text-[11px] text-text-tertiary">${h.time}</span>
    </div>`)
      .join('');
  }

  function clearHistory() {
    wheelHistory = [];
    renderHistory();
    document.getElementById('wheelResult')?.classList.add('hidden');
  }

  onMount(() => {
    drawWheel();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-list-check"></i></div>
      <h2 class="text-lg font-bold text-text-primary">รายการบนวงล้อ</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">ใส่ชื่อคนหรือชื่อกลุ่มที่จะสุ่ม — ทีละบรรทัดหรือคั่นด้วย ,</p>
    <textarea id="wheelInput" on:input={onWheelInput} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3.5 min-h-[100px] resize-y leading-[1.9] outline-none transition-all focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 placeholder:text-text-tertiary font-sans" placeholder="เช่น:&#10;กลุ่ม 1&#10;กลุ่ม 2&#10;กลุ่ม 3"></textarea>
    <div class="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mt-3">
      <div class="flex items-center gap-3">
        <span id="wheelCount" class="font-mono text-xs text-text-tertiary">0 รายการ</span>
        <label class="flex items-center gap-1.5 cursor-pointer text-[13px] text-text-secondary hover:text-text-primary transition-colors bg-bg-card border border-border-subtle px-2.5 py-1 rounded-lg">
          <input type="checkbox" bind:checked={removeAfterSpin} class="w-3.5 h-3.5 rounded border-border-default bg-bg-panel text-pri-500 focus:ring-pri-500 focus:ring-offset-base-900" />
          <span>คัดออกเมื่อสุ่มได้</span>
        </label>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button on:click={loadWheelFromGroups} class="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors"><i class="ri-link text-sm"></i> ใช้จากผลสุ่ม</button>
        <button on:click={loadWheelSample} class="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors"><i class="ri-file-list-3-line text-sm"></i> ตัวอย่าง</button>
      </div>
    </div>
  </section>

  <div class="mt-8 flex flex-col items-center">
    <div class="relative mb-[-14px] z-10">
      <i class="ri-arrow-down-s-fill text-4xl text-accent-default drop-shadow-lg"></i>
    </div>
    <div id="wheelContainer" class="relative">
      <canvas id="wheelCanvas" width="400" height="400" class="rounded-full border-4 border-border-default shadow-2xl max-w-full h-auto"></canvas>
      <button on:click={spinWheel} id="spinBtn" class="w-20 h-20 rounded-full bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-bold text-sm transition-colors z-20 flex flex-col items-center justify-center gap-0.5 border-4 border-base-900">
        <i class="ri-play-fill text-xl"></i>
        <span class="text-[10px] font-mono uppercase tracking-wider">Spin</span>
      </button>
    </div>

    <!-- Fullscreen button -->
    <button on:click={toggleFullscreen} class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-accent-default transition-colors">
      <i class="ri-fullscreen-line text-sm"></i> ขยายเต็มจอ
    </button>

    <div id="wheelResult" class="mt-8 hidden w-full max-w-xs">
      <div class="bg-bg-card border border-border-default rounded-2xl p-6 text-center">
        <div class="text-xs font-mono text-accent-default uppercase tracking-widest mb-2">ผลลัพธ์</div>
        <div id="wheelResultText" class="text-2xl font-bold text-white break-words"></div>
      </div>
    </div>

    <div id="wheelHistory" class="mt-6 w-full max-w-md hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติการหมุน</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div id="historyList" class="space-y-1.5"></div>
    </div>
  </div>
</div>

<!-- Fullscreen Overlay -->
{#if isFullscreen}
<div class="wheel-fullscreen" on:click|self={toggleFullscreen}>
  <button on:click={toggleFullscreen} class="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors flex items-center justify-center border border-white/20">
    <i class="ri-close-line text-xl"></i>
  </button>
  
  <div class="absolute top-6 left-1/2 -translate-x-1/2 z-50">
    <i class="ri-arrow-down-s-fill text-5xl text-accent-default drop-shadow-lg"></i>
  </div>

  <div class="relative">
    <canvas id="wheelCanvasFS" width="600" height="600" class="rounded-full border-4 border-white/10 shadow-2xl"></canvas>
    <button on:click={spinWheel} id="spinBtnFS" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-bold text-base transition-colors z-20 flex flex-col items-center justify-center gap-0.5 border-4 border-base-900 shadow-xl">
      <i class="ri-play-fill text-3xl"></i>
      <span class="text-[11px] font-mono uppercase tracking-wider">Spin</span>
    </button>
  </div>

  <div id="fsResultText" class="absolute bottom-8 left-1/2 -translate-x-1/2 text-3xl font-bold text-white bg-black/60 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/10 transition-opacity duration-500 opacity-0 whitespace-nowrap">
  </div>
  
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/40 font-mono">กด ESC หรือคลิกพื้นหลังเพื่อปิด</div>
</div>
{/if}

<style>
  #wheelContainer {
    position: relative;
    display: inline-block;
  }
  #spinBtn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .wheel-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
</style>
