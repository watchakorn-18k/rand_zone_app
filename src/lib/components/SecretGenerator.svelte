<script lang="ts">
  import { showToast } from '$lib/utils/toast';

  type SecretType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'base64' | 'hex';
  
  let selectedType: SecretType = 'sha256';
  let length = 32; // for base64/hex bytes
  let count = 1;
  let currentSecrets: string[] = [];
  let history: Array<{ values: string[]; type: SecretType; time: string; idx: number }> = [];

  export function getState() {
    return { t: selectedType, l: length, c: count };
  }

  export function setState(state: any) {
    if (state) {
      if (state.t) selectedType = state.t;
      if (state.l) length = Math.max(1, Math.min(1024, parseInt(state.l) || 32));
      if (state.c) count = Math.max(1, Math.min(100, parseInt(state.c) || 1));
    }
  }

  function generateRandomBytes(len: number): Uint8Array {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return arr;
  }

  function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateOne(): string {
    switch (selectedType) {
      case 'md5':
        return bytesToHex(generateRandomBytes(16));
      case 'sha1':
        return bytesToHex(generateRandomBytes(20));
      case 'sha256':
        return bytesToHex(generateRandomBytes(32));
      case 'sha512':
        return bytesToHex(generateRandomBytes(64));
      case 'base64': {
        const bytes = generateRandomBytes(length);
        return btoa(String.fromCharCode(...bytes));
      }
      case 'hex':
        return bytesToHex(generateRandomBytes(length));
      default:
        return '';
    }
  }

  function generate() {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generateOne());
    }
    currentSecrets = results;
    
    history.unshift({
      values: [...results],
      type: selectedType,
      time: new Date().toLocaleTimeString('th-TH'),
      idx: history.length + 1
    });
    history = history.slice(0, 50);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast('คัดลอกรหัสแล้ว'));
  }

  function copyAll() {
    if (currentSecrets.length === 0) return;
    navigator.clipboard.writeText(currentSecrets.join('\n')).then(() => 
      showToast(`คัดลอกทั้ง ${currentSecrets.length} รายการแล้ว`)
    );
  }

  const types = [
    { id: 'sha256', label: 'SHA-256', desc: '64 chars hex (Common for hashes)', icon: 'ri-fingerprint-line' },
    { id: 'sha1', label: 'SHA-1 / Git', desc: '40 chars hex (Git commit style)', icon: 'ri-git-commit-line' },
    { id: 'md5', label: 'MD5', desc: '32 chars hex (Legacy hash style)', icon: 'ri-file-shield-2-line' },
    { id: 'sha512', label: 'SHA-512', desc: '128 chars hex (High security)', icon: 'ri-shield-keyhole-line' },
    { id: 'base64', label: 'Base64 Secret', desc: 'Random bytes as Base64 (.env style)', icon: 'ri-key-2-line' },
    { id: 'hex', label: 'Hex Secret', desc: 'Custom length random hex string', icon: 'ri-terminal-box-line' }
  ];
</script>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-key-2-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">สุ่ม Hash & Secret Keys</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">สร้างคีย์สุ่มสำหรับใช้ในไฟล์ .env, JWT Secret, หรือทดสอบระบบ Encryption ต่างๆ</p>

    <div class="ml-11 space-y-6">
      <!-- Type Selection -->
      <div>
        <label class="block text-xs font-semibold text-text-tertiary mb-3 uppercase tracking-wider">เลือกประเภท</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each types as t}
            <button 
              on:click={() => selectedType = t.id as SecretType}
              class="flex flex-col p-3 rounded-xl border text-left transition-all {selectedType === t.id ? 'border-accent-default bg-accent-default/5 ring-1 ring-accent-default' : 'border-border-default bg-bg-panel hover:border-border-default'}"
            >
              <div class="flex items-center gap-2 mb-1">
                <i class="{t.icon} {selectedType === t.id ? 'text-accent-default' : 'text-text-tertiary'}"></i>
                <span class="text-sm font-bold {selectedType === t.id ? 'text-text-primary' : 'text-text-secondary'}">{t.label}</span>
              </div>
              <p class="text-[11px] text-text-tertiary leading-tight">{t.desc}</p>
            </button>
          {/each}
        </div>
      </div>

      <div class="flex flex-wrap gap-6">
        <!-- Custom Length (only for base64/hex) -->
        {#if selectedType === 'base64' || selectedType === 'hex'}
        <div class="w-32">
          <label for="secLen" class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider">ขนาด (Bytes)</label>
          <input type="number" id="secLen" min="1" max="1024" bind:value={length} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default font-mono" />
        </div>
        {/if}

        <!-- Count -->
        <div class="w-32">
          <label for="secCount" class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider">จำนวนชุด</label>
          <input type="number" id="secCount" min="1" max="100" bind:value={count} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default font-mono" />
        </div>
      </div>
    </div>
  </section>

  <div class="flex flex-col items-center">
    <button on:click={generate} id="genSecBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-all shadow-lg shadow-accent-default/20 transform active:scale-95">
      <i class="ri-refresh-line text-lg"></i> สร้างรหัสสุ่ม
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Secure Crypto Random Values (CSPRNG)</div>

    <!-- Results Area -->
    {#if currentSecrets.length > 0}
    <div class="mt-8 w-full max-w-3xl space-y-4 anim-result">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
          <i class="ri-check-double-line text-accent-default"></i>
          ผลลัพธ์ ({selectedType})
        </h3>
        {#if currentSecrets.length > 1}
        <button on:click={copyAll} class="text-[11px] font-bold text-accent-default hover:underline">คัดลอกทั้งหมด</button>
        {/if}
      </div>

      <div class="space-y-2">
        {#each currentSecrets as secret}
          <div class="group relative bg-bg-panel border border-border-subtle rounded-xl p-4 transition-all hover:border-accent-default/50 hover:bg-bg-card shadow-sm">
            <div class="font-mono text-sm text-text-primary break-all pr-12 leading-relaxed">
              {secret}
            </div>
            <button 
              on:click={() => copy(secret)}
              class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-bg-card border border-border-default flex items-center justify-center text-text-tertiary hover:text-accent-default hover:border-accent-default transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              title="คัดลอก"
            >
              <i class="ri-file-copy-line"></i>
            </button>
          </div>
        {/each}
      </div>
    </div>
    {/if}

    <!-- History -->
    {#if history.length > 0}
    <div class="mt-12 w-full max-w-2xl border-t border-border-subtle pt-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-text-secondary flex items-center gap-2"><i class="ri-history-line"></i> ประวัติล่าสุด</h3>
        <button on:click={() => history = []} class="text-xs text-text-tertiary hover:text-red-400 transition-colors">ล้างประวัติ</button>
      </div>
      <div class="space-y-2.5">
        {#each history as item}
          <div class="flex items-center gap-3 text-[13px] bg-bg-panel/40 p-3 rounded-lg border border-border-subtle/50">
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-card text-text-tertiary border border-border-subtle uppercase">{item.type}</span>
            <span class="font-mono text-text-secondary truncate flex-1">{item.values[0]}{item.values.length > 1 ? ` (+${item.values.length - 1} อื่นๆ)` : ''}</span>
            <span class="text-[11px] text-text-tertiary">{item.time}</span>
          </div>
        {/each}
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  :global(.anim-result) {
    animation: resultIn 0.3s ease-out backwards;
  }
  @keyframes resultIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
