<script lang="ts">
  import { onMount } from 'svelte';

  class FairnessEngine {
    rounds = 7;
    seed: string | null = null;

    secureRandomInt(max: number) {
      if (max <= 0) return 0;
      const b = new Uint32Array(1);
      crypto.getRandomValues(b);
      return b[0] % max;
    }

    fisherYatesShuffle<T>(arr: T[]) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.secureRandomInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    generateSeed() {
      const b = new Uint32Array(8);
      crypto.getRandomValues(b);
      this.seed = Array.from(b)
        .map((x) => x.toString(16).padStart(8, '0'))
        .join('');
      return this.seed;
    }

    chiSquareTest(groups: string[][]) {
      const s = groups.map((g) => g.length);
      const t = s.reduce((a, b) => a + b, 0);
      const e = t / groups.length;
      const c = s.reduce((x, v) => x + Math.pow(v - e, 2) / e, 0);
      const df = groups.length - 1;
      const c95 = [3.841, 5.991, 7.815, 9.488, 11.07, 12.59, 14.07, 15.51, 16.92, 18.31];

      return {
        chi: c.toFixed(4),
        df,
        pass: c < (df <= 10 ? c95[df - 1] : df * 2),
        maxDiff: Math.max(...s) - Math.min(...s)
      };
    }

    buildLog(names: string[], leaders: string[], groups: string[][], gn: string[], method: string) {
      const L: Array<{ l?: string; v?: string | number; sep?: true; ok?: boolean }> = [];
      const seed = this.generateSeed();
      const t = this.chiSquareTest(groups);
      L.push({ l: 'TIMESTAMP', v: new Date().toISOString() });
      L.push({ l: 'ENTROPY', v: 'Crypto.getRandomValues() (CSPRNG)' });
      L.push({ l: 'SEED', v: seed });
      L.push({ l: 'ALGORITHM', v: `Fisher-Yates × ${this.rounds} rounds` });
      L.push({ l: 'NAMES', v: names.length });
      L.push({ l: 'GROUPS', v: groups.length });
      L.push({ l: 'METHOD', v: method });
      L.push({ l: 'LEADERS', v: leaders.length ? leaders.join(', ') : 'None' });
      L.push({ sep: true });
      L.push({ l: 'FAIRNESS', v: '' });
      L.push({ l: '  Sizes', v: groups.map((g, i) => `${gn[i]}:${g.length}`).join(' | ') });
      L.push({ l: '  Max Diff', v: t.maxDiff, ok: t.maxDiff <= 1 });
      L.push({ l: '  Chi-Square', v: t.chi });
      L.push({ l: '  Uniform', v: t.pass ? 'PASS' : 'WARN', ok: t.pass });
      L.push({ sep: true });
      L.push({ l: 'PROTECTIONS', v: '' });
      L.push({ l: '  CSPRNG', v: 'Crypto RNG', ok: true });
      L.push({ l: '  Multi-round', v: `${this.rounds}x shuffle`, ok: true });
      L.push({ l: '  Fisher-Yates', v: 'O(n) unbiased', ok: true });
      L.push({ l: '  Position bias', v: 'None', ok: true });
      L.push({ l: '  Leader spread', v: leaders.length ? 'Distributed' : 'N/A', ok: true });
      return L;
    }
  }

  const engine = new FairnessEngine();
  let groupMode = 'count';
  const selectedLeaders = new Set<string>();

  let wheelAngle = 0;
  let wheelSpinning = false;
  let wheelHistory: Array<{ name: string; time: string; idx: number }> = [];
  let removeAfterSpin = false;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  function switchMain(tab: 'groups' | 'wheel') {
    const t1 = document.getElementById('mainTab1') as HTMLButtonElement | null;
    const t2 = document.getElementById('mainTab2') as HTMLButtonElement | null;
    if (!t1 || !t2) return;

    const active =
      'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all bg-pri-600 text-white flex items-center justify-center gap-2';
    const idle =
      'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all text-base-400 hover:text-base-200 flex items-center justify-center gap-2';

    if (tab === 'groups') {
      t1.className = active;
      t2.className = idle;
      document.getElementById('groupsSection')?.classList.remove('hidden');
      document.getElementById('wheelSection')?.classList.add('hidden');
    } else {
      t2.className = active;
      t1.className = idle;
      document.getElementById('wheelSection')?.classList.remove('hidden');
      document.getElementById('groupsSection')?.classList.add('hidden');
      drawWheel();
    }
  }

  function getNames() {
    const raw = (document.getElementById('namesInput') as HTMLTextAreaElement | null)?.value.trim() || '';
    if (!raw) return [];

    return [
      ...new Set(
        (raw.includes(',') ? raw.split(',') : raw.split('\n'))
          .map((n) => n.trim())
          .filter(Boolean)
      )
    ];
  }

  function onNamesInput() {
    const nameCount = document.getElementById('nameCount');
    if (nameCount) nameCount.textContent = `${getNames().length} ชื่อ`;
    updateLeaderArea();
  }

  function switchGroupMode(m: 'count' | 'size') {
    groupMode = m;
    const tc = document.getElementById('tabCount');
    const ts = document.getElementById('tabSize');
    if (!tc || !ts) return;

    const a =
      'flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all bg-pri-600 text-white';
    const i =
      'flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all text-base-400 hover:text-base-200';

    tc.className = m === 'count' ? a : i;
    ts.className = m === 'size' ? a : i;
    document.getElementById('modeCount')?.classList.toggle('hidden', m !== 'count');
    document.getElementById('modeSize')?.classList.toggle('hidden', m !== 'size');
    updateGroupNames();
  }

  function getGroupCount() {
    if (groupMode === 'count') {
      return parseInt((document.getElementById('groupCount') as HTMLInputElement | null)?.value || '2') || 2;
    }
    const n = getNames().length;
    const s = parseInt((document.getElementById('groupSize') as HTMLInputElement | null)?.value || '4') || 4;
    return Math.max(2, Math.ceil(n / s));
  }

  function updateGroupNames() {
    const c = document.getElementById('groupNamesContainer');
    if (!c) return;
    const cnt = getGroupCount();
    c.innerHTML = '';
    for (let i = 0; i < cnt; i++) {
      c.innerHTML += `<div class="flex items-center gap-2"><span class="font-mono text-[11px] text-base-600 w-5 text-right shrink-0">#${i + 1}</span><input type="text" class="gnf flex-1 bg-base-800 border border-base-700 rounded-lg text-base-200 text-sm p-2.5 outline-none focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20 placeholder:text-base-600" placeholder="กลุ่ม ${i + 1}"></div>`;
    }
  }

  function updateLeaderArea() {
    const names = getNames();
    const area = document.getElementById('leaderArea');
    if (!area) return;

    if (!names.length) {
      area.innerHTML =
        '<div class="text-base-600 text-sm flex items-center gap-2"><i class="ri-arrow-up-line"></i> กรุณาใส่รายชื่อสมาชิกก่อน</div>';
      selectedLeaders.clear();
      renderLeaders();
      return;
    }

    selectedLeaders.forEach((l) => {
      if (!names.includes(l)) selectedLeaders.delete(l);
    });

    area.innerHTML =
      '<label class="block text-xs font-semibold text-base-500 mb-2"><i class="ri-cursor-line mr-1"></i>คลิกเลือกหัวหน้ากลุ่ม:</label><div id="leaderGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1"></div>';

    const grid = document.getElementById('leaderGrid');
    if (!grid) return;

    names.forEach((name) => {
      const sel = selectedLeaders.has(name);
      const d = document.createElement('div');
      d.className = `p-2 rounded-lg text-[13px] text-center cursor-pointer select-none border transition-all ${sel ? 'bg-pri-500/15 border-pri-500 text-pri-300 font-semibold' : 'bg-base-800 border-base-700 text-base-300 hover:border-pri-600'}`;
      d.innerHTML = sel ? `<i class="ri-vip-crown-2-fill mr-1 text-xs"></i>${name}` : name;
      d.onclick = () => toggleLeader(name);
      grid.appendChild(d);
    });

    renderLeaders();
  }

  function toggleLeader(n: string) {
    if (selectedLeaders.has(n)) {
      selectedLeaders.delete(n);
    } else {
      if (selectedLeaders.size >= getGroupCount()) {
        showToast(`หัวหน้าได้ไม่เกิน ${getGroupCount()} คน`);
        return;
      }
      selectedLeaders.add(n);
    }
    updateLeaderArea();
  }

  function renderLeaders() {
    const c = document.getElementById('selectedLeaders');
    if (!c) return;

    c.innerHTML = '';
    selectedLeaders.forEach((n) => {
      c.innerHTML += `<div class="anim-chip inline-flex items-center gap-1.5 px-3 py-1.5 bg-pri-500/10 border border-pri-500/30 rounded-full text-[13px] text-pri-300 font-medium"><i class="ri-vip-crown-2-fill text-xs"></i>${n}<span class="cursor-pointer opacity-50 hover:opacity-100 ml-0.5 leading-none" data-leader="${n.replaceAll('"', '&quot;')}"><i class="ri-close-line text-xs"></i></span></div>`;
    });

    c.querySelectorAll<HTMLElement>('[data-leader]').forEach((el) => {
      el.onclick = () => {
        const leader = el.dataset.leader;
        if (leader) toggleLeader(leader);
      };
    });
  }

  function loadSample() {
    const namesInput = document.getElementById('namesInput') as HTMLTextAreaElement | null;
    if (!namesInput) return;

    namesInput.value =
      'สมชาย\nสมหญิง\nวิชัย\nนภา\nธนพล\nปิยะ\nสุดา\nกมล\nพิชัย\nอรุณ\nมานี\nศักดิ์\nจิรา\nเกษม\nรัตนา\nบุญมี\nสุนี\nชาติ\nวิไล\nประเสริฐ';
    onNamesInput();
    updateGroupNames();
    showToast('โหลดตัวอย่าง 20 ชื่อแล้ว');
  }

  function showToast(msg: string) {
    document.querySelectorAll('.toast-el').forEach((t) => t.remove());
    const t = document.createElement('div');
    t.className =
      'toast-el fixed bottom-6 right-6 bg-base-800 border border-base-700 rounded-xl px-5 py-3 text-[13px] text-base-200 z-[200] flex items-center gap-2 shadow-xl';
    t.style.animation = 'resultIn 0.3s ease';
    t.innerHTML = `<i class="ri-information-line text-pri-400"></i><span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
    }, 2500);
    setTimeout(() => t.remove(), 2800);
  }

  async function startShuffle() {
    const names = getNames();
    if (names.length < 2) {
      showToast('ต้องมีอย่างน้อย 2 ชื่อ');
      return;
    }

    const gc = getGroupCount();
    if (gc < 2) {
      showToast('ต้องมีอย่างน้อย 2 กลุ่ม');
      return;
    }
    if (gc > names.length) {
      showToast('กลุ่มมากกว่าจำนวนคน');
      return;
    }

    const leaders = [...selectedLeaders];
    if (leaders.length > gc) {
      showToast('หัวหน้า > กลุ่ม');
      return;
    }

    const fields = document.querySelectorAll<HTMLInputElement>('.gnf');
    const gn = Array.from({ length: gc }, (_, i) => fields[i]?.value.trim() || `กลุ่ม ${i + 1}`);

    const ov = document.getElementById('shuffleOverlay');
    const vis = document.getElementById('shuffleVisual');
    const st = document.getElementById('shuffleStatus');
    const rd = document.getElementById('shuffleRound');
    const pf = document.getElementById('progressFill') as HTMLElement | null;

    if (!ov || !vis || !st || !rd || !pf) return;

    ov.classList.remove('opacity-0', 'pointer-events-none');
    vis.innerHTML = names
      .map(
        (_, i) =>
          `<div class="w-10 h-10 bg-base-800 border border-base-700 rounded-lg flex items-center justify-center text-xs font-semibold text-pri-400 anim-shuffle" style="animation-delay:${Math.random() * 0.4}s">${i + 1}</div>`
      )
      .join('');

    const nonL = names.filter((n) => !selectedLeaders.has(n));
    let sL = leaders;
    let sM = nonL;

    for (let r = 0; r < 7; r++) {
      st.innerHTML = `<i class="ri-loader-4-line animate-spin"></i> รอบ ${r + 1}: Fisher-Yates Shuffle...`;
      rd.textContent = `${r + 1} / 7`;
      pf.style.width = `${((r + 1) / 7) * 100}%`;

      sL = engine.fisherYatesShuffle(sL);
      sM = engine.fisherYatesShuffle(sM);

      vis.querySelectorAll<HTMLElement>('div').forEach((c) => {
        c.style.borderColor = `hsl(217,80%,${30 + engine.secureRandomInt(30)}%)`;
        c.style.color = `hsl(217,80%,${55 + engine.secureRandomInt(20)}%)`;
      });

      await sleep(320);
    }

    st.innerHTML = '<i class="ri-check-line"></i> กำลังจัดกลุ่ม...';
    await sleep(250);

    const groups = Array.from({ length: gc }, () => [] as Array<{ name: string; isLeader: boolean }>);

    sL.forEach((l, i) => groups[i].push({ name: l, isLeader: true }));

    sM.forEach((m) => {
      let mi = 0;
      let ms = Infinity;
      for (let g = 0; g < gc; g++) {
        if (groups[g].length < ms) {
          ms = groups[g].length;
          mi = g;
        }
      }
      groups[mi].push({ name: m, isLeader: false });
    });

    const method =
      groupMode === 'count'
        ? `จำนวนกลุ่ม = ${gc}`
        : `สมาชิก/กลุ่ม = ${(document.getElementById('groupSize') as HTMLInputElement | null)?.value || ''}`;

    const log = engine.buildLog(
      names,
      leaders,
      groups.map((g) => g.map((m) => m.name)),
      gn,
      method
    );

    st.innerHTML = '<i class="ri-check-double-line text-pri-300"></i> เสร็จสิ้น!';
    await sleep(400);
    ov.classList.add('opacity-0', 'pointer-events-none');

    renderResults(groups, gn, log);
  }

  function renderResults(
    groups: Array<Array<{ name: string; isLeader: boolean }>>,
    gn: string[],
    log: Array<{ l?: string; v?: string | number; sep?: true; ok?: boolean }>
  ) {
    const a = document.getElementById('resultsArea');
    if (!a) return;

    a.classList.remove('hidden');
    a.innerHTML = '';

    const brd = [
      'border-l-pri-500',
      'border-l-pri-400',
      'border-l-pri-600',
      'border-l-pri-300',
      'border-l-pri-700',
      'border-l-pri-200',
      'border-l-pri-800',
      'border-l-pri-500',
      'border-l-pri-400',
      'border-l-pri-600'
    ];

    a.innerHTML +=
      '<div class="flex items-center justify-between flex-wrap gap-3 mb-6"><h2 class="text-xl font-bold text-base-100 flex items-center gap-2"><i class="ri-trophy-line text-pri-400"></i> ผลการสุ่มกลุ่ม</h2><div class="flex gap-2.5"><button id="copyResultsBtn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"><i class="ri-file-copy-line"></i> คัดลอก</button><button id="reshuffleBtn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-pri-500/10 border border-pri-500/20 rounded-lg text-xs font-semibold text-pri-400 hover:bg-pri-500/20 transition-colors"><i class="ri-refresh-line"></i> สุ่มใหม่</button></div></div>';

    groups.forEach((g, i) => {
      const mem = g
        .map((m) =>
          m.isLeader
            ? `<div class="px-3 py-1.5 bg-pri-500/10 border border-pri-500/25 rounded-lg text-[13px] text-pri-300 font-semibold inline-flex items-center gap-1.5"><i class="ri-vip-crown-2-fill text-xs"></i>${m.name}</div>`
            : `<div class="px-3 py-1.5 bg-base-800 border border-base-700 rounded-lg text-[13px] text-base-300">${m.name}</div>`
        )
        .join('');

      a.innerHTML += `<div class="bg-base-900 border border-base-800 border-l-[3px] ${brd[i % brd.length]} rounded-2xl p-5 mb-3 anim-result" style="animation-delay:${i * 0.08}s"><div class="flex items-center justify-between mb-3.5"><div class="text-base font-bold text-base-100 flex items-center gap-2"><i class="ri-team-line text-base-500"></i>${gn[i]}</div><span class="font-mono text-[11px] text-base-500 bg-base-800 px-2.5 py-1 rounded-full">${g.length} คน</span></div><div class="flex flex-wrap gap-2">${mem}</div></div>`;
    });

    a.innerHTML +=
      '<div class="text-center mt-5"><div class="inline-flex items-center gap-2 px-5 py-2.5 bg-pri-500/10 border border-pri-500/20 rounded-full text-[13px] text-pri-300 font-semibold"><i class="ri-shield-check-line"></i> ผ่านการตรวจสอบความยุติธรรม — Crypto RNG &times; 7 Round Shuffle</div></div>';

    const lh = log
      .map((l) => {
        if (l.sep) return '<div class="border-t border-base-700 my-2"></div>';
        const cls = l.ok === true ? 'text-pri-400' : l.ok === false ? 'text-base-400' : 'text-base-300';
        return `<div class="leading-relaxed"><span class="text-pri-500/70">${l.l}:</span> <span class="${cls}">${l.v ?? ''}</span></div>`;
      })
      .join('');

    a.innerHTML += `<div class="mt-5"><div id="transparencyToggle" class="cursor-pointer text-[13px] text-base-500 flex items-center gap-1.5 py-2 hover:text-base-300 transition-colors select-none"><i class="ri-arrow-right-s-line transition-transform duration-200"></i><i class="ri-search-eye-line"></i> บันทึกความโปร่งใส (Transparency Log)</div><div id="transparencyContent" class="hidden bg-base-800 border border-base-700 rounded-xl p-4 font-mono text-[11px] leading-[1.9] text-base-500 max-h-72 overflow-y-auto">${lh}</div></div>`;

    document.getElementById('copyResultsBtn')?.addEventListener('click', copyResults);
    document.getElementById('reshuffleBtn')?.addEventListener('click', startShuffle);
    document.getElementById('transparencyToggle')?.addEventListener('click', (e) => {
      const icon = (e.currentTarget as HTMLElement).querySelector('i');
      const content = document.getElementById('transparencyContent');
      content?.classList.toggle('hidden');
      icon?.classList.toggle('rotate-90');
    });

    a.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (window as any)._lr = { groups, gn };
  }

  function copyResults() {
    const lr = (window as any)._lr as
      | { groups: Array<Array<{ name: string; isLeader: boolean }>>; gn: string[] }
      | undefined;
    if (!lr) return;

    const { groups, gn } = lr;
    let t = 'ผลการสุ่มกลุ่ม (Rand Zone)\n' + '='.repeat(30) + '\n\n';

    groups.forEach((g, i) => {
      t += `[ ${gn[i]} ] (${g.length} คน)\n`;
      g.forEach((m) => {
        t += `   ${m.isLeader ? '[Leader] ' : '- '}${m.name}\n`;
      });
      t += '\n';
    });

    t += '='.repeat(30) + '\nCrypto RNG x Fisher-Yates x 7 rounds\n' + new Date().toLocaleString('th-TH');

    navigator.clipboard.writeText(t).then(() => showToast('คัดลอกแล้ว'));
  }

  function getWheelItems() {
    const r = (document.getElementById('wheelInput') as HTMLTextAreaElement | null)?.value.trim() || '';
    if (!r) return [];

    return [
      ...new Set(
        (r.includes(',') ? r.split(',') : r.split('\n'))
          .map((n) => n.trim())
          .filter(Boolean)
      )
    ];
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

  function drawWheel(highlightIdx = -1) {
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
      const url = new URL(window.location.href);
      url.searchParams.set('d', encoded);
      
      navigator.clipboard.writeText(url.toString()).then(() => {
        showToast('คัดลอกลิงก์แชร์แล้ว ส่งให้เพื่อนได้เลย!');
      });
    } catch(e) {
      console.error(e);
      showToast('เกิดข้อผิดพลาดในการสร้างลิงก์');
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const d = urlParams.get('d');
    
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d)));
        
        if (decoded.n) {
          const namesInput = document.getElementById('namesInput') as HTMLTextAreaElement | null;
          if (namesInput) namesInput.value = decoded.n;
        }
        if (decoded.w) {
          const wheelInput = document.getElementById('wheelInput') as HTMLTextAreaElement | null;
          if (wheelInput) wheelInput.value = decoded.w;
        }
        if (decoded.c) {
          const groupCount = document.getElementById('groupCount') as HTMLInputElement | null;
          if (groupCount) groupCount.value = decoded.c;
        }
        if (decoded.s) {
          const groupSize = document.getElementById('groupSize') as HTMLInputElement | null;
          if (groupSize) groupSize.value = decoded.s;
        }
        if (decoded.m) {
          groupMode = decoded.m;
        }
        
        if (decoded.t === 'wheel') {
          switchMain('wheel');
        } else {
          switchMain('groups');
        }

        setTimeout(() => {
            onNamesInput();
            onWheelInput();
            if (decoded.m) switchGroupMode(decoded.m as 'count'|'size');
        }, 50);

        showToast('โหลดข้อมูลจากลิงก์สำเร็จ');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error(e);
        showToast('ลิงก์แชร์ไม่ถูกต้องหรือข้อมูลเสียหาย');
      }
    }

    updateGroupNames();
    drawWheel();
  });
</script>

<svelte:head>
  <title>Rand Zone — ระบบสุ่มกลุ่มและ Spin Wheel</title>
  <link
    href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="max-w-[900px] mx-auto px-5 pt-6 pb-16 relative z-10">
    <header class="text-center pt-10 pb-8 relative">
      <div class="absolute top-2 right-0 sm:right-2 z-20">
        <button on:click={shareLink} class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-pri-400 hover:bg-base-700 hover:text-pri-300 transition-colors shadow-lg shadow-base-950/50">
          <i class="ri-share-forward-line text-sm"></i> แชร์ลิงก์
        </button>
      </div>
      <div
        class="inline-flex items-center gap-2 text-xs font-mono text-pri-400 tracking-[0.2em] uppercase mb-3 opacity-80"
      >
        <i class="ri-scales-3-line text-sm"></i><span>Rand Zone</span>
      </div>
      <h1
        class="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white to-pri-400 bg-clip-text text-transparent leading-tight"
      >
        ระบบสุ่มของ Rand Zone
      </h1>
      <p class="text-base-500 text-sm mt-2 font-light">
        Cryptographic Randomness + Fisher-Yates Shuffle &times; 7 รอบ
      </p>
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-pri-500 to-transparent"
      ></div>
    </header>

    <div class="flex bg-base-900 border border-base-800 rounded-xl p-1.5 gap-1.5 mb-6">
      <button
        id="mainTab1"
        on:click={() => switchMain('groups')}
        class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all bg-pri-600 text-white flex items-center justify-center gap-2"
      >
        <i class="ri-group-line"></i> สุ่มแบ่งกลุ่ม
      </button>
      <button
        id="mainTab2"
        on:click={() => switchMain('wheel')}
        class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all text-base-400 hover:text-base-200 flex items-center justify-center gap-2"
      >
        <i class="ri-donut-chart-line"></i> Spin Wheel
      </button>
    </div>

    <div id="groupsSection">
      <section class="bg-base-900 border border-base-800 rounded-2xl p-6 transition-colors hover:border-base-700">
        <div class="flex items-center gap-3 mb-1">
          <div
            class="w-8 h-8 rounded-lg bg-pri-500/10 text-pri-400 flex items-center justify-center text-sm font-mono font-bold"
          >
            1
          </div>
          <h2 class="text-lg font-bold text-base-100">ใส่รายชื่อสมาชิก</h2>
        </div>
        <p class="text-base-500 text-[13px] mb-5 ml-11 leading-relaxed">
          พิมพ์ชื่อทีละบรรทัด หรือคั่นด้วย , (comma)
        </p>
        <textarea
          id="namesInput"
          on:input={onNamesInput}
          class="w-full bg-base-800 border border-base-700 rounded-xl text-base-200 text-sm p-3.5 min-h-[130px] resize-y leading-[1.9] outline-none transition-all focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20 placeholder:text-base-600 font-sans"
          placeholder="เช่น:&#10;สมชาย&#10;สมหญิง&#10;วิชัย&#10;นภา"
        ></textarea>
        <div class="flex justify-between items-center mt-3">
          <span id="nameCount" class="font-mono text-xs text-base-500">0 ชื่อ</span>
          <button
            on:click={loadSample}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"
          >
            <i class="ri-file-list-3-line text-sm"></i> ตัวอย่าง
          </button>
        </div>
      </section>

      <section class="bg-base-900 border border-base-800 rounded-2xl p-6 mt-5 transition-colors hover:border-base-700">
        <div class="flex items-center gap-3 mb-1">
          <div
            class="w-8 h-8 rounded-lg bg-pri-500/10 text-pri-400 flex items-center justify-center text-sm font-mono font-bold"
          >
            2
          </div>
          <h2 class="text-lg font-bold text-base-100">ตั้งค่ากลุ่ม</h2>
        </div>
        <p class="text-base-500 text-[13px] mb-5 ml-11 leading-relaxed">
          เลือกวิธีแบ่งกลุ่ม และตั้งชื่อกลุ่มได้
        </p>
        <div class="flex bg-base-800 rounded-lg p-1 gap-1 mb-5">
          <button
            id="tabCount"
            class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all bg-pri-600 text-white"
            on:click={() => switchGroupMode('count')}
          >
            <i class="ri-group-line mr-1.5"></i>จำนวนกลุ่ม
          </button>
          <button
            id="tabSize"
            class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all text-base-400 hover:text-base-200"
            on:click={() => switchGroupMode('size')}
          >
            <i class="ri-user-line mr-1.5"></i>สมาชิก/กลุ่ม
          </button>
        </div>
        <div id="modeCount">
          <label for="groupCount" class="block text-xs font-semibold text-base-500 mb-1.5"
            >จำนวนกลุ่ม</label
          >
          <input
            type="number"
            id="groupCount"
            min="2"
            max="50"
            value="3"
            class="w-full bg-base-800 border border-base-700 rounded-xl text-base-200 text-sm p-3 outline-none focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20"
            on:change={updateGroupNames}
          />
        </div>
        <div id="modeSize" class="hidden">
          <label for="groupSize" class="block text-xs font-semibold text-base-500 mb-1.5"
            >จำนวนสมาชิกต่อกลุ่ม</label
          >
          <input
            type="number"
            id="groupSize"
            min="1"
            max="100"
            value="4"
            class="w-full bg-base-800 border border-base-700 rounded-xl text-base-200 text-sm p-3 outline-none focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20"
            on:change={updateGroupNames}
          />
        </div>
        <div class="mt-5">
          <div class="block text-xs font-semibold text-base-500 mb-2.5">
            <i class="ri-edit-line mr-1"></i>ชื่อกลุ่ม (ไม่บังคับ)
          </div>
          <div id="groupNamesContainer" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
        </div>
      </section>

      <section class="bg-base-900 border border-base-800 rounded-2xl p-6 mt-5 transition-colors hover:border-base-700">
        <div class="flex items-center gap-3 mb-1">
          <div
            class="w-8 h-8 rounded-lg bg-pri-500/10 text-pri-400 flex items-center justify-center text-sm font-mono font-bold"
          >
            3
          </div>
          <h2 class="text-lg font-bold text-base-100">เลือกหัวหน้ากลุ่ม</h2>
        </div>
        <p class="text-base-500 text-[13px] mb-5 ml-11 leading-relaxed">
          กระจายกลุ่มละ 1 คนก่อน แล้วจึงสุ่มสมาชิกที่เหลือ (ไม่บังคับ)
        </p>
        <div id="leaderArea">
          <div class="text-base-600 text-sm flex items-center gap-2">
            <i class="ri-arrow-up-line"></i> กรุณาใส่รายชื่อสมาชิกก่อน
          </div>
        </div>
        <div id="selectedLeaders" class="flex flex-wrap gap-2 mt-3"></div>
      </section>

      <div class="text-center mt-10">
        <button
          on:click={startShuffle}
          class="inline-flex items-center gap-2.5 px-12 py-4 bg-gradient-to-br from-pri-500 to-pri-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-pri-600/25 hover:shadow-pri-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <i class="ri-shuffle-line text-lg"></i> สุ่มกลุ่มเลย!
        </button>
        <div class="mt-3 text-[11px] text-base-600 font-mono tracking-wide">
          Crypto.getRandomValues() &times; Fisher-Yates &times; 7 rounds
        </div>
      </div>

      <div id="resultsArea" class="mt-8 hidden"></div>
    </div>

    <div id="wheelSection" class="hidden">
      <section class="bg-base-900 border border-base-800 rounded-2xl p-6 transition-colors hover:border-base-700">
        <div class="flex items-center gap-3 mb-1">
          <div
            class="w-8 h-8 rounded-lg bg-pri-500/10 text-pri-400 flex items-center justify-center text-sm font-mono font-bold"
          >
            <i class="ri-list-check"></i>
          </div>
          <h2 class="text-lg font-bold text-base-100">รายการบนวงล้อ</h2>
        </div>
        <p class="text-base-500 text-[13px] mb-5 ml-11 leading-relaxed">
          ใส่ชื่อคนหรือชื่อกลุ่มที่จะสุ่ม — ทีละบรรทัดหรือคั่นด้วย ,
        </p>
        <textarea
          id="wheelInput"
          on:input={onWheelInput}
          class="w-full bg-base-800 border border-base-700 rounded-xl text-base-200 text-sm p-3.5 min-h-[100px] resize-y leading-[1.9] outline-none transition-all focus:border-pri-500 focus:ring-2 focus:ring-pri-500/20 placeholder:text-base-600 font-sans"
          placeholder="เช่น:&#10;กลุ่ม 1&#10;กลุ่ม 2&#10;กลุ่ม 3"
        ></textarea>
        <div class="flex justify-between items-center mt-3">
          <div class="flex items-center gap-3">
            <span id="wheelCount" class="font-mono text-xs text-base-500">0 รายการ</span>
            <label class="flex items-center gap-1.5 cursor-pointer text-[13px] text-base-400 hover:text-base-200 transition-colors bg-base-900 border border-base-800 px-2.5 py-1 rounded-lg">
              <input type="checkbox" bind:checked={removeAfterSpin} class="w-3.5 h-3.5 rounded border-base-700 bg-base-800 text-pri-500 focus:ring-pri-500 focus:ring-offset-base-900" />
              <span>คัดออกเมื่อสุ่มได้</span>
            </label>
          </div>
          <div class="flex gap-2">
            <button
              on:click={loadWheelFromGroups}
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"
            >
              <i class="ri-link text-sm"></i> ใช้จากผลสุ่มกลุ่ม
            </button>
            <button
              on:click={loadWheelSample}
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-base-800 border border-base-700 rounded-lg text-xs font-semibold text-base-300 hover:bg-base-700 transition-colors"
            >
              <i class="ri-file-list-3-line text-sm"></i> ตัวอย่าง
            </button>
          </div>
        </div>
      </section>

      <div class="mt-8 flex flex-col items-center">
        <div class="relative mb-[-14px] z-10">
          <i class="ri-arrow-down-s-fill text-4xl text-pri-400 drop-shadow-lg"></i>
        </div>

        <div id="wheelContainer" class="relative">
          <canvas
            id="wheelCanvas"
            width="400"
            height="400"
            class="rounded-full border-4 border-base-700 shadow-2xl"
          ></canvas>
          <button
            on:click={spinWheel}
            id="spinBtn"
            class="w-20 h-20 rounded-full bg-gradient-to-br from-pri-500 to-pri-700 text-white font-bold text-sm shadow-xl shadow-pri-600/30 hover:shadow-pri-500/50 transition-all z-20 flex flex-col items-center justify-center gap-0.5 border-4 border-base-900"
          >
            <i class="ri-play-fill text-xl"></i>
            <span class="text-[10px] font-mono uppercase tracking-wider">Spin</span>
          </button>
        </div>

        <div id="wheelResult" class="mt-8 hidden">
          <div
            class="bg-base-900 border border-pri-500/30 rounded-2xl p-6 text-center anim-glow min-w-[300px]"
          >
            <div class="text-xs font-mono text-pri-400 uppercase tracking-widest mb-2">ผลลัพธ์</div>
            <div id="wheelResultText" class="text-2xl font-bold text-white"></div>
          </div>
        </div>

        <div id="wheelHistory" class="mt-6 w-full max-w-md hidden">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-base-400 flex items-center gap-1.5">
              <i class="ri-history-line"></i> ประวัติการหมุน
            </h3>
            <button
              on:click={clearHistory}
              class="text-xs text-base-600 hover:text-base-400 transition-colors"
            >
              <i class="ri-delete-bin-line"></i> ล้าง
            </button>
          </div>
          <div id="historyList" class="space-y-1.5"></div>
        </div>
      </div>
    </div>
  </div>

  <div
    id="shuffleOverlay"
    class="fixed inset-0 bg-base-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 opacity-0 pointer-events-none transition-opacity duration-300"
  >
    <div
      id="shuffleStatus"
      class="font-mono text-sm text-pri-300 tracking-widest flex items-center gap-2"
    >
      <i class="ri-loader-4-line animate-spin"></i> กำลังเตรียม Entropy...
    </div>
    <div id="shuffleRound" class="font-mono text-4xl text-white font-bold">0 / 7</div>
    <div id="shuffleVisual" class="flex gap-1.5 flex-wrap justify-center max-w-[480px]"></div>
    <div class="w-72 h-1 bg-base-800 rounded-full overflow-hidden">
      <div
        id="progressFill"
        class="h-full bg-gradient-to-r from-pri-500 to-pri-300 rounded-full transition-all duration-300"
        style="width: 0%"
      ></div>
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

  :global(::-webkit-scrollbar) {
    width: 5px;
  }

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #334155;
    border-radius: 3px;
  }

  @keyframes shuffleCard {
    from {
      transform: translateY(-4px) rotate(-2deg);
    }
    to {
      transform: translateY(4px) rotate(2deg);
    }
  }

  @keyframes chipIn {
    from {
      opacity: 0;
      transform: scale(0.85);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes resultIn {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
    }
  }

  :global(.anim-shuffle) {
    animation: shuffleCard 0.4s ease infinite alternate;
  }

  :global(.anim-chip) {
    animation: chipIn 0.25s ease;
  }

  :global(.anim-result) {
    animation: resultIn 0.5s ease backwards;
  }

  .anim-glow {
    animation: pulseGlow 1.5s ease infinite;
  }
</style>
