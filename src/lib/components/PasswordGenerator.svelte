<script lang="ts">
  import { showToast } from '$lib/utils/toast';
  import { generatePassword, calcPasswordStrength, type PasswordOptions } from '$lib/utils/generators';

  let length = 16;
  let count = 1;
  let useNumbers = true;
  let useLowercase = true;
  let useUppercase = true;
  let useSpecial = true;

  let currentPasswords: string[] = [];
  let strength: { score: number; label: string } = { score: 0, label: '' };
  let history: Array<{ values: string[]; time: string; idx: number; strength: string }> = [];

  export function getState() {
    return { l: length, c: count, n: useNumbers, lc: useLowercase, uc: useUppercase, sp: useSpecial };
  }

  export function setState(state: any) {
    if (state) {
      if (state.l) length = Math.max(4, Math.min(128, parseInt(state.l) || 16));
      if (state.c) count = Math.max(1, Math.min(100, parseInt(state.c) || 1));
      if (state.n !== undefined) useNumbers = state.n;
      if (state.lc !== undefined) useLowercase = state.lc;
      if (state.uc !== undefined) useUppercase = state.uc;
      if (state.sp !== undefined) useSpecial = state.sp;
    }
  }

  function applyPreset(level: 'low' | 'medium' | 'high') {
    if (level === 'low') {
      length = 8;
      useNumbers = true;
      useLowercase = true;
      useUppercase = false;
      useSpecial = false;
    } else if (level === 'medium') {
      length = 16;
      useNumbers = true;
      useLowercase = true;
      useUppercase = true;
      useSpecial = false;
    } else {
      length = 32;
      useNumbers = true;
      useLowercase = true;
      useUppercase = true;
      useSpecial = true;
    }
  }

  function generate() {
    if (!useNumbers && !useLowercase && !useUppercase && !useSpecial) {
      showToast('กรุณาเลือกอย่างน้อย 1 ชุดตัวอักษร');
      return;
    }
    const opts: PasswordOptions = { length, useNumbers, useLowercase, useUppercase, useSpecial };
    
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generatePassword(opts));
    }
    currentPasswords = results;
    strength = calcPasswordStrength(results[0]);

    history.unshift({
      values: results,
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1,
      strength: strength.label
    });
    history = history;
  }

  function copyAll() {
    if (!currentPasswords.length) return;
    // Newline-separated = pastes as rows in Excel/Sheets
    navigator.clipboard.writeText(currentPasswords.join('\n')).then(() => 
      showToast(`คัดลอก ${currentPasswords.length} รหัสผ่านแล้ว (วางใน Excel/Sheet ได้เลย)`)
    );
  }

  function copySingle(pw: string) {
    navigator.clipboard.writeText(pw).then(() => showToast('คัดลอกรหัสผ่านแล้ว'));
  }

  function clearHistory() {
    history = [];
  }

  $: strengthColor = strength.score <= 2 ? 'text-red-400' : strength.score <= 4 ? 'text-yellow-400' : strength.score <= 5 ? 'text-green-400' : 'text-emerald-400';
  $: strengthBarPct = Math.round((strength.score / 7) * 100);
  $: strengthBarColor = strength.score <= 2 ? 'bg-red-500' : strength.score <= 4 ? 'bg-yellow-500' : strength.score <= 5 ? 'bg-green-500' : 'bg-emerald-400';
</script>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-lock-password-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">สุ่มรหัสผ่าน</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">สร้างรหัสผ่านโดยใช้ Cryptographic Random ปลอดภัยระดับสูง ไม่มีการส่งข้อมูลออกนอกเบราว์เซอร์</p>
    
    <div class="ml-11 space-y-5">
      <!-- Presets -->
      <div>
        <span class="block text-xs font-semibold text-text-tertiary mb-2">ความปลอดภัยแบบเร็ว</span>
        <div class="flex gap-2 flex-wrap">
          <button on:click={() => applyPreset('low')} class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-bg-panel border-border-default text-text-secondary hover:border-red-400 hover:text-red-400">
            <i class="ri-shield-line mr-1"></i>น้อย (8 ตัว)
          </button>
          <button on:click={() => applyPreset('medium')} class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-bg-panel border-border-default text-text-secondary hover:border-yellow-400 hover:text-yellow-400">
            <i class="ri-shield-check-line mr-1"></i>กลาง (16 ตัว)
          </button>
          <button on:click={() => applyPreset('high')} class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-bg-panel border-border-default text-text-secondary hover:border-emerald-400 hover:text-emerald-400">
            <i class="ri-shield-keyhole-line mr-1"></i>สูง (32 ตัว)
          </button>
        </div>
      </div>

      <!-- Length + Count row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="pwLength" class="block text-xs font-semibold text-text-tertiary mb-2">ความยาว ({length} ตัวอักษร)</label>
          <input type="range" id="pwLength" min="4" max="128" bind:value={length} class="w-full accent-accent-default" />
          <div class="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
            <span>4</span><span>128</span>
          </div>
        </div>
        <div>
          <label for="pwCount" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวน ({count} รายการ)</label>
          <input type="number" id="pwCount" min="1" max="100" bind:value={count} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 font-mono" />
        </div>
      </div>

      <!-- Charset toggles -->
      <div>
        <span class="block text-xs font-semibold text-text-tertiary mb-2">ชุดตัวอักษร</span>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label class="flex items-center gap-2 bg-bg-panel border border-border-default rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent-default transition-colors {useNumbers ? 'border-accent-default bg-accent-default/5' : ''}">
            <input type="checkbox" id="pwNumbers" bind:checked={useNumbers} class="accent-accent-default w-4 h-4" />
            <span class="text-xs text-text-primary font-semibold">0-9</span>
          </label>
          <label class="flex items-center gap-2 bg-bg-panel border border-border-default rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent-default transition-colors {useLowercase ? 'border-accent-default bg-accent-default/5' : ''}">
            <input type="checkbox" id="pwLower" bind:checked={useLowercase} class="accent-accent-default w-4 h-4" />
            <span class="text-xs text-text-primary font-semibold">a-z</span>
          </label>
          <label class="flex items-center gap-2 bg-bg-panel border border-border-default rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent-default transition-colors {useUppercase ? 'border-accent-default bg-accent-default/5' : ''}">
            <input type="checkbox" id="pwUpper" bind:checked={useUppercase} class="accent-accent-default w-4 h-4" />
            <span class="text-xs text-text-primary font-semibold">A-Z</span>
          </label>
          <label class="flex items-center gap-2 bg-bg-panel border border-border-default rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent-default transition-colors {useSpecial ? 'border-accent-default bg-accent-default/5' : ''}">
            <input type="checkbox" id="pwSpecial" bind:checked={useSpecial} class="accent-accent-default w-4 h-4" />
            <span class="text-xs text-text-primary font-semibold">!@#$</span>
          </label>
        </div>
      </div>
    </div>
  </section>

  <div class="flex flex-col items-center">
    <button on:click={generate} id="genPwBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-key-line text-lg"></i> สร้างรหัสผ่าน
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Crypto.getRandomValues() &middot; 100% Client-side</div>

    <!-- Results -->
    {#if currentPasswords.length > 0}
    <div class="mt-8 w-full max-w-2xl bg-bg-card border-2 border-border-default rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span class="text-xs font-semibold text-text-tertiary flex items-center gap-1.5"><i class="ri-key-2-line text-accent-default"></i> รหัสผ่านที่สุ่มได้ ({currentPasswords.length} รายการ)</span>
        <div class="flex items-center gap-2">
          <!-- Strength indicator -->
          <div class="flex items-center gap-1.5">
            <div class="w-16 h-1.5 bg-bg-panel rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300 {strengthBarColor}" style="width:{strengthBarPct}%"></div>
            </div>
            <span class="text-[11px] font-semibold {strengthColor}">{strength.label}</span>
          </div>
          <button on:click={copyAll} class="text-[11px] text-text-secondary hover:text-accent-default transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-file-copy-line"></i> คัดลอกทั้งหมด
          </button>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {#each currentPasswords as pw, i}
        <button on:click={() => copySingle(pw)} class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-panel/80 border border-transparent hover:border-border-subtle transition-colors group text-left">
          <span class="font-mono text-[11px] text-text-tertiary w-6 text-right shrink-0">#{i + 1}</span>
          <span class="font-mono text-[13px] text-text-primary break-all flex-1">{pw}</span>
          <i class="ri-clipboard-line text-text-tertiary group-hover:text-accent-default opacity-0 group-hover:opacity-100 transition-opacity shrink-0"></i>
        </button>
        {/each}
      </div>

      <div class="mt-3 pt-3 border-t border-border-subtle">
        <div class="text-[10px] text-text-tertiary flex items-center gap-1.5">
          <i class="ri-information-line text-accent-default"></i>
          คลิกรายการใดก็ได้เพื่อคัดลอก หรือกด "คัดลอกทั้งหมด" เพื่อวางใน Excel/Google Sheet เป็นแถวลงมาได้เลย
        </div>
      </div>
    </div>
    {/if}

    <!-- History -->
    {#if history.length > 0}
    <div class="mt-8 w-full max-w-2xl">
      <div class="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-1.5"><i class="ri-history-line"></i> ประวัติรหัสผ่าน</h3>
        <button on:click={clearHistory} class="text-xs text-text-tertiary hover:text-text-secondary transition-colors"><i class="ri-delete-bin-line"></i> ล้าง</button>
      </div>
      <div class="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {#each history as h, i (h.idx)}
        <div class="p-3 bg-bg-panel/30 border border-border-subtle rounded-lg text-[13px] anim-result" style="animation-delay:{i * 0.03}s">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-[10px] text-text-tertiary">#{history.length - i} &middot; {h.strength} &middot; {h.values.length} รายการ</span>
            <span class="font-mono text-[11px] text-text-tertiary">{h.time}</span>
          </div>
          {#each h.values.slice(0, 3) as v}
            <div class="font-mono text-[12px] text-text-tertiary px-1 truncate">{v}</div>
          {/each}
          {#if h.values.length > 3}
            <div class="text-[10px] text-text-tertiary text-center mt-1 italic">...และอีก {h.values.length - 3} รายการ</div>
          {/if}
        </div>
        {/each}
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  :global(.anim-result) {
    animation: resultIn 0.3s ease backwards;
  }

  @keyframes resultIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; }
</style>
