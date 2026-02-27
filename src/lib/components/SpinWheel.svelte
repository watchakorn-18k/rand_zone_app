<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { showToast } from '/utils/toast';
  import { FairnessEngine } from '/utils/fairness';
  const engine = new FairnessEngine();

  let wheelAngle = 0;
  let wheelSpinning = false;
  let wheelHistory: Array<{ name: string; time: string; idx: number }> = [];
  let removeAfterSpin = false;


    return shades;
  }

  function drawWheel(highlightIdx = -1) {
    await tick(); const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement | null;
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

  export function renderHistory() {
    const container = document.getElementById('wheelHistory');
    const list = document.getElementById('historyList');
    if (!container || !list) return;

    if (wheelHistory.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    list.innerHTML = wheelHistory
      .map(
        (h, i) => `
    <div class="flex items-center gap-3 px-3 py-2 bg-base-800/50 border border-base-800 rounded-lg text-[13px] anim-result" style="animation-delay:${i * 0.03}s">
      <span class="font-mono text-[11px] text-base-600 w-6 text-right">#${wheelHistory.length - i}</span>
      <span class="text-base-200 font-medium flex-1">${h.name}</span>
      <span class="font-mono text-[11px] text-base-600">${h.time}</span>
    </div>`
      )
      .join('');
  }

  function clearHistory() {
    wheelHistory = [];
    renderHistory();
    document.getElementById('wheelResult')?.classList.add('hidden');
  }

  function shareLink() {
    try {
      const namesInput = (document.getElementById('namesInput') as HTMLTextAreaElement | null)?.value || '';
      const wheelInput = (document.getElementById('wheelInput') as HTMLTextAreaElement | null)?.value || '';
      const groupCount = (document.getElementById('groupCount') as HTMLInputElement | null)?.value || '3';
      const groupSize = (document.getElementById('groupSize') as HTMLInputElement | null)?.value || '4';
      
      const payload = {
        n: namesInput,
        w: wheelInput,
        c: groupCount,
        s: groupSize,
        m: groupMode,
        t: document.getElementById('wheelSection')?.classList.contains('hidden') ? 'groups' : 'wheel'
      };
      
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));

  onMount(() => {
    drawWheel();
  });
</script>


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
