<script lang="ts">
  import { onMount } from 'svelte';
  import { FairnessEngine } from '$lib/utils/fairness';
  import { showToast } from '$lib/utils/toast';

  const engine = new FairnessEngine();
  export let groupMode = 'count';
  const selectedLeaders = new Set<string>();

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  export function getState() {
    const namesInput = (document.getElementById('namesInput') as HTMLTextAreaElement | null)?.value || '';
    const groupCount = (document.getElementById('groupCount') as HTMLInputElement | null)?.value || '3';
    const groupSize = (document.getElementById('groupSize') as HTMLInputElement | null)?.value || '4';
    return { n: namesInput, c: groupCount, s: groupSize, m: groupMode };
  }

  export function setState(state: any) {
    if (state.n) {
      const namesInput = document.getElementById('namesInput') as HTMLTextAreaElement | null;
      if (namesInput) namesInput.value = state.n;
    }
    if (state.c) {
      const groupCount = document.getElementById('groupCount') as HTMLInputElement | null;
      if (groupCount) groupCount.value = state.c;
    }
    if (state.s) {
      const groupSize = document.getElementById('groupSize') as HTMLInputElement | null;
      if (groupSize) groupSize.value = state.s;
    }
    if (state.m) {
      switchGroupMode(state.m);
    }
    onNamesInput();
    updateGroupNames();
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

    const a = 'flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all bg-accent-default text-white';
    const i = 'flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all text-text-secondary hover:text-text-primary';

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

  export function updateGroupNames() {
    const c = document.getElementById('groupNamesContainer');
    if (!c) return;
    const cnt = getGroupCount();
    c.innerHTML = '';
    for (let i = 0; i < cnt; i++) {
      c.innerHTML += `<div class="flex items-center gap-2"><span class="font-mono text-[11px] text-text-tertiary w-5 text-right shrink-0">#${i + 1}</span><input type="text" class="gnf flex-1 bg-bg-panel border border-border-default rounded-lg text-text-primary text-sm p-2.5 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 placeholder:text-text-tertiary" placeholder="กลุ่ม ${i + 1}"></div>`;
    }
  }

  function updateLeaderArea() {
    const names = getNames();
    const area = document.getElementById('leaderArea');
    if (!area) return;

    if (!names.length) {
      area.innerHTML = '<div class="text-text-tertiary text-sm flex items-center gap-2"><i class="ri-arrow-up-line"></i> กรุณาใส่รายชื่อสมาชิกก่อน</div>';
      selectedLeaders.clear();
      renderLeaders();
      return;
    }

    selectedLeaders.forEach((l) => {
      if (!names.includes(l)) selectedLeaders.delete(l);
    });

    area.innerHTML = '<label class="block text-xs font-semibold text-text-tertiary mb-2"><i class="ri-cursor-line mr-1"></i>คลิกเลือกหัวหน้ากลุ่ม:</label><div id="leaderGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1"></div>';

    const grid = document.getElementById('leaderGrid');
    if (!grid) return;

    names.forEach((name) => {
      const sel = selectedLeaders.has(name);
      const d = document.createElement('div');
      d.className = `p-2 rounded-lg text-[13px] text-center cursor-pointer select-none border transition-all ${sel ? 'bg-accent-default/15 border-accent-default text-accent-default font-semibold' : 'bg-bg-panel border-border-default text-text-secondary hover:border-pri-600'}`;
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
      c.innerHTML += `<div class="anim-chip inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-default/10 border border-accent-default/30 rounded-full text-[13px] text-accent-default font-medium"><i class="ri-vip-crown-2-fill text-xs"></i>${n}<span class="cursor-pointer opacity-50 hover:opacity-100 ml-0.5 leading-none" data-leader="${n.replaceAll('"', '&quot;')}"><i class="ri-close-line text-xs"></i></span></div>`;
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

    namesInput.value = 'สมชาย\nสมหญิง\nวิชัย\nนภา\nธนพล\nปิยะ\nสุดา\nกมล\nพิชัย\nอรุณ\nมานี\nศักดิ์\nจิรา\nเกษม\nรัตนา\nบุญมี\nสุนี\nชาติ\nวิไล\nประเสริฐ';
    onNamesInput();
    updateGroupNames();
    showToast('โหลดตัวอย่าง 20 ชื่อแล้ว');
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
    vis.innerHTML = names.map((_, i) => `<div class="w-10 h-10 bg-bg-panel border border-border-default rounded-lg flex items-center justify-center text-xs font-semibold text-accent-default anim-shuffle" style="animation-delay:${Math.random() * 0.4}s">${i + 1}</div>`).join('');

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

    const method = groupMode === 'count' ? `จำนวนกลุ่ม = ${gc}` : `สมาชิก/กลุ่ม = ${(document.getElementById('groupSize') as HTMLInputElement | null)?.value || ''}`;
    const log = engine.buildLog(names, leaders, groups.map((g) => g.map((m) => m.name)), gn, method);

    st.innerHTML = '<i class="ri-check-double-line text-accent-default"></i> เสร็จสิ้น!';
    await sleep(400);
    ov.classList.add('opacity-0', 'pointer-events-none');

    renderResults(groups, gn, log);
  }

  function renderResults(groups: Array<Array<{ name: string; isLeader: boolean }>>, gn: string[], log: Array<{ l?: string; v?: string | number; sep?: true; ok?: boolean }>) {
    const a = document.getElementById('resultsArea');
    if (!a) return;

    a.classList.remove('hidden');
    a.innerHTML = '';

    const brd = ['border-l-pri-500', 'border-l-pri-400', 'border-l-pri-600', 'border-l-pri-300', 'border-l-pri-700', 'border-l-pri-200', 'border-l-pri-800', 'border-l-pri-500', 'border-l-pri-400', 'border-l-pri-600'];

    a.innerHTML += '<div class="flex items-center justify-between flex-wrap gap-3 mb-6"><h2 class="text-xl font-bold text-text-primary flex items-center gap-2"><i class="ri-trophy-line text-accent-default"></i> ผลการสุ่มกลุ่ม</h2><div class="flex gap-2.5"><button id="copyResultsBtn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors"><i class="ri-file-copy-line"></i> คัดลอก</button><button id="reshuffleBtn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-default/10 border border-accent-default/20 rounded-lg text-xs font-semibold text-accent-default hover:bg-accent-hover/20 transition-colors"><i class="ri-refresh-line"></i> สุ่มใหม่</button></div></div>';

    groups.forEach((g, i) => {
      const mem = g.map((m) => m.isLeader ? `<div class="px-3 py-1.5 bg-accent-default/10 border border-accent-default/25 rounded-lg text-[13px] text-accent-default font-semibold inline-flex items-center gap-1.5"><i class="ri-vip-crown-2-fill text-xs"></i>${m.name}</div>` : `<div class="px-3 py-1.5 bg-bg-panel border border-border-default rounded-lg text-[13px] text-text-secondary">${m.name}</div>`).join('');
      a.innerHTML += `<div class="bg-bg-card border border-border-subtle border-l-[3px] ${brd[i % brd.length]} rounded-2xl p-5 mb-3 anim-result" style="animation-delay:${i * 0.08}s"><div class="flex items-center justify-between mb-3.5"><div class="text-base font-bold text-text-primary flex items-center gap-2"><i class="ri-team-line text-text-tertiary"></i>${gn[i]}</div><span class="font-mono text-[11px] text-text-tertiary bg-bg-panel px-2.5 py-1 rounded-full">${g.length} คน</span></div><div class="flex flex-wrap gap-2">${mem}</div></div>`;
    });

    a.innerHTML += '<div class="text-center mt-5"><div class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-default/10 border border-accent-default/20 rounded-full text-[13px] text-accent-default font-semibold"><i class="ri-shield-check-line"></i> ผ่านการตรวจสอบความยุติธรรม — Crypto RNG &times; 7 Round Shuffle</div></div>';

    const lh = log.map((l) => {
      if (l.sep) return '<div class="border-t border-border-default my-2"></div>';
      const cls = l.ok === true ? 'text-accent-default' : l.ok === false ? 'text-text-secondary' : 'text-text-secondary';
      return `<div class="leading-relaxed"><span class="text-pri-500/70">${l.l}:</span> <span class="${cls}">${l.v ?? ''}</span></div>`;
    }).join('');

    a.innerHTML += `<div class="mt-5"><div id="transparencyToggle" class="cursor-pointer text-[13px] text-text-tertiary flex items-center gap-1.5 py-2 hover:text-text-secondary transition-colors select-none"><i class="ri-arrow-right-s-line transition-transform duration-200"></i><i class="ri-search-eye-line"></i> บันทึกความโปร่งใส (Transparency Log)</div><div id="transparencyContent" class="hidden bg-bg-panel border border-border-default rounded-xl p-4 font-mono text-[11px] leading-[1.9] text-text-tertiary max-h-72 overflow-y-auto">${lh}</div></div>`;

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
    const lr = (window as any)._lr as | { groups: Array<Array<{ name: string; isLeader: boolean }>>; gn: string[] } | undefined;
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

  onMount(() => {
    updateGroupNames();
  });
</script>

<div class="space-y-5">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold">1</div>
      <h2 class="text-lg font-bold text-text-primary">ใส่รายชื่อสมาชิก</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">พิมพ์ชื่อทีละบรรทัด หรือคั่นด้วย , (comma)</p>
    <textarea id="namesInput" on:input={onNamesInput} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3.5 min-h-[130px] resize-y leading-[1.9] outline-none transition-all focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 placeholder:text-text-tertiary font-sans" placeholder="เช่น:&#10;สมชาย&#10;สมหญิง&#10;วิชัย&#10;นภา"></textarea>
    <div class="flex justify-between items-center mt-3">
      <span id="nameCount" class="font-mono text-xs text-text-tertiary">0 ชื่อ</span>
      <button on:click={loadSample} class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-bg-panel border border-border-default rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors"><i class="ri-file-list-3-line text-sm"></i> ตัวอย่าง</button>
    </div>
  </section>

  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold">2</div>
      <h2 class="text-lg font-bold text-text-primary">ตั้งค่ากลุ่ม</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">เลือกวิธีแบ่งกลุ่ม และตั้งชื่อกลุ่มได้</p>
    <div class="flex bg-bg-panel rounded-lg p-1 gap-1 mb-5">
      <button id="tabCount" class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all bg-accent-default text-white" on:click={() => switchGroupMode('count')}><i class="ri-group-line mr-1.5"></i>จำนวนกลุ่ม</button>
      <button id="tabSize" class="flex-1 py-2.5 px-4 rounded-md text-[13px] font-semibold transition-all text-text-secondary hover:text-text-primary" on:click={() => switchGroupMode('size')}><i class="ri-user-line mr-1.5"></i>สมาชิก/กลุ่ม</button>
    </div>
    <div id="modeCount">
      <label for="groupCount" class="block text-xs font-semibold text-text-tertiary mb-1.5">จำนวนกลุ่ม</label>
      <input type="number" id="groupCount" min="2" max="50" value="3" class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" on:change={updateGroupNames} />
    </div>
    <div id="modeSize" class="hidden">
      <label for="groupSize" class="block text-xs font-semibold text-text-tertiary mb-1.5">จำนวนสมาชิกต่อกลุ่ม</label>
      <input type="number" id="groupSize" min="1" max="100" value="4" class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20" on:change={updateGroupNames} />
    </div>
    <div class="mt-5">
      <div class="block text-xs font-semibold text-text-tertiary mb-2.5"><i class="ri-edit-line mr-1"></i>ชื่อกลุ่ม (ไม่บังคับ)</div>
      <div id="groupNamesContainer" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
    </div>
  </section>

  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold">3</div>
      <h2 class="text-lg font-bold text-text-primary">เลือกหัวหน้ากลุ่ม</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">กระจายกลุ่มละ 1 คนก่อน แล้วจึงสุ่มสมาชิกที่เหลือ (ไม่บังคับ)</p>
    <div id="leaderArea">
      <div class="text-text-tertiary text-sm flex items-center gap-2"><i class="ri-arrow-up-line"></i> กรุณาใส่รายชื่อสมาชิกก่อน</div>
    </div>
    <div id="selectedLeaders" class="flex flex-wrap gap-2 mt-3"></div>
  </section>

  <div class="text-center mt-10">
    <button on:click={startShuffle} class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors"><i class="ri-shuffle-line text-lg"></i> สุ่มกลุ่มเลย!</button>
    <div class="mt-3 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() &times; Fisher-Yates &times; 7 rounds</div>
  </div>

  <div id="resultsArea" class="mt-8 hidden"></div>
</div>

<div id="shuffleOverlay" class="fixed inset-0 bg-bg-app/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 opacity-0 pointer-events-none transition-opacity duration-300">
  <div id="shuffleStatus" class="font-mono text-sm text-accent-default tracking-widest flex items-center gap-2"><i class="ri-loader-4-line animate-spin"></i> กำลังเตรียม Entropy...</div>
  <div id="shuffleRound" class="font-mono text-4xl text-white font-bold">0 / 7</div>
  <div id="shuffleVisual" class="flex gap-1.5 flex-wrap justify-center max-w-[480px]"></div>
  <div class="w-72 h-1 bg-bg-panel rounded-full overflow-hidden">
    <div id="progressFill" class="h-full bg-gradient-to-r from-pri-500 to-pri-300 rounded-full transition-all duration-300" style="width: 0%"></div>
  </div>
</div>

<style>
  :global(.anim-shuffle) {
    animation: shuffleCard 0.4s ease infinite alternate;
  }

  :global(.anim-chip) {
    animation: chipIn 0.25s ease;
  }

  :global(.anim-result) {
    animation: resultIn 0.5s ease backwards;
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
</style>
