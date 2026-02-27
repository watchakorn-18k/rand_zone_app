<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();

  let wheelAngle = 0;
  let wheelSpinning = false;
  let wheelHistory: Array<{ name: string; time: string; idx: number }> = [];
  let removeAfterSpin = false;

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

  async function drawWheel(highlightIdx = -1) {
    await tick();
    const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      const fontSize = n > 12 ? 10 : n > 8 ? 12 : 14;
      ctx.font = `600 ${fontSize}px "IBM Plex Sans Thai"`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = items[i].length > 10 ? items[i].slice(0, 9) + '…' : items[i];
      ctx.fillText(label, R - 16, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function spinWheel() {
    if (wheelSpinning) return;

    const items = getWheelItems();
    if (items.length < 2) {
      showToast('ต้องมีอย่างน้อย 2 รายการ');
      return;
    }

    wheelSpinning = true;
    const btn = document.getElementById('spinBtn');
    btn?.classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('wheelResult')?.classList.add('hidden');

    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const n = items.length;
    const targetIdx = buf[0] % n;

    const arc = (Math.PI * 2) / n;
    const sliceMid = targetIdx * arc + arc / 2;
    const targetAngle = -Math.PI / 2 - sliceMid;

    const fullSpins = 5 + engine.secureRandomInt(4);
    const totalRotation = fullSpins * Math.PI * 2 + ((targetAngle - wheelAngle) % (Math.PI * 2));
    const finalAngle = wheelAngle + totalRotation;

    const startAngle = wheelAngle;
    const duration = 4000 + engine.secureRandomInt(2000);
    const startTime = performance.now();

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      wheelAngle = startAngle + totalRotation * eased;
      drawWheel(progress > 0.9 ? targetIdx : -1);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        wheelAngle = finalAngle % (Math.PI * 2);
        drawWheel(targetIdx);
        wheelSpinning = false;
        btn?.classList.remove('opacity-50', 'pointer-events-none');

        const result = items[targetIdx];
        document.getElementById('wheelResult')?.classList.remove('hidden');
        const resultText = document.getElementById('wheelResultText');
        if (resultText) resultText.textContent = result;

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
    <div class="flex items-center gap-3 px-3 py-2 bg-base-800/50 border border-base-800 rounded-lg text-[13px] anim-result" style="animation-delay:${i * 0.03}s">
      <span class="font-mono text-[11px] text-base-600 w-6 text-right">#${wheelHistory.length - i}</span>
      <span class="text-base-200 font-medium flex-1">${h.name}</span>
      <span class="font-mono text-[11px] text-base-600">${h.time}</span>
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

<div class="space-y-8">
  <section class="bg-base-900 border border-base-800 rounded-2xl p-6 transition-colors hover:border-base-700">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-pri-500/10 text-pri-400 flex items-center justify-center text-sm font-mono font-bold"><i class="ri-list-check"></i></div>
      <h2 class="text-lg font-bold text-base-100">รายการบนวงล้อ</h2>
    </div>
    <p class="text-base-500 text-[13px] mb-5 ml-11 leading-relaxed">ใส่ชื่อคนหรือชื่อกลุ่มที่จะสุ่ม — ทีละบรรทัดหรือคั่นด้วย ,</p>
    <textarea id="wheelInput" on:input={onWheelInput} class="w-full bg-base-800 border border-base-700 rounded-xl text-base-200 text-sm p-3.5 min-h-[100px] resize-y leading-[1.9] outline-none transition-all focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20 placeholder:text-base-600 font-sans" placeholder="เช่น:&#10;กลุ่ม 1&#10;กลุ่ม 2&#10;กลุ่ม 3"></textarea>
    <div class="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mt-3">
      <div class="flex items-center gap-3">
        <span id="wheelCount" class="font-mono text-xs text-base-500">0 รายการ</span>
        <label class="flex items-center gap-1.5 cursor-pointer text-[13px] text-base-400 hover:text-base-200 transition-colors bg-base-900 border border-base-800 px-2.5 py-1 rounded-lg">
          <input type="checkbox" bind:checked={removeAfterSpin} class="w-3.5 h-3.5 rounded border-base-700 bg-base-800 text-pri-500 focus:ring-pri-500 focus:ring-offset-base-900" />
          <span>คัดออกเมื่อสุ่มได้</span>
        </label>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button on:click={loadWheelFromGroups} class="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"><i class="ri-link text-sm"></i> ใช้จากผลสุ่ม</button>
        <button on:click={loadWheelSample} class="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"><i class="ri-file-list-3-line text-sm"></i> ตัวอย่าง</button>
      </div>
    </div>
  </section>

  <div class="mt-8 flex flex-col items-center">
    <div class="relative mb-[-14px] z-10">
      <i class="ri-arrow-down-s-fill text-4xl text-pri-400 drop-shadow-lg"></i>
    </div>
    <div id="wheelContainer" class="relative">
      <canvas id="wheelCanvas" width="400" height="400" class="rounded-full border-4 border-base-700 shadow-2xl max-w-full h-auto"></canvas>
      <button on:click={spinWheel} id="spinBtn" class="w-20 h-20 rounded-full bg-pri-600 hover:bg-pri-500 active:bg-pri-700 text-white font-bold text-sm transition-colors z-20 flex flex-col items-center justify-center gap-0.5 border-4 border-base-900">
        <i class="ri-play-fill text-xl"></i>
        <span class="text-[10px] font-mono uppercase tracking-wider">Spin</span>
      </button>
    </div>

    <div id="wheelResult" class="mt-8 hidden w-full max-w-xs">
      <div class="bg-base-900 border border-base-700 rounded-2xl p-6 text-center">
        <div class="text-xs font-mono text-pri-400 uppercase tracking-widest mb-2">ผลลัพธ์</div>
        <div id="wheelResultText" class="text-2xl font-bold text-white break-words"></div>
      </div>
    </div>

    <div id="wheelHistory" class="mt-6 w-full max-w-md hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-base-400 flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติการหมุน</h3>
        <button on:click={clearHistory} class="text-xs text-base-600 hover:text-base-400 transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div id="historyList" class="space-y-1.5"></div>
    </div>
  </div>
</div>

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
</style>
