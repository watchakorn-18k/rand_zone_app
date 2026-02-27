<script lang="ts">
  import { showToast } from '$lib/utils/toast';

  type SchemaType = 'users' | 'products' | 'orders';
  
  let selectedSchema: SchemaType = 'users';
  let rowCount = 50;
  let generatedJson = '';
  let generatedData: any[] = [];

  export function getState() {
    return { s: selectedSchema, r: rowCount };
  }

  export function setState(state: any) {
    if (state) {
      if (state.s) selectedSchema = state.s;
      if (state.r) rowCount = Math.max(1, Math.min(500, parseInt(state.r) || 50));
    }
  }

  const FIRST_NAMES = ['สมชาย','สมหญิง','ธนา','พิม','กิตติ','อรุณ','จันทร์','วิชัย','นภา','ศิริ','ปิยะ','รัตน์','มานี','ชาติ','วัน','James','Emma','Liam','Olivia','Noah','Ava','Sophia','Lucas','Mia','Ethan'];
  const LAST_NAMES = ['จันทร์เพ็ญ','ศรีสุข','วงษ์สวัสดิ์','พลอยงาม','มหาพรม','Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'];
  const DOMAINS = ['gmail.com','hotmail.com','outlook.com','yahoo.com','company.co.th','work.com'];
  const CITIES = ['กรุงเทพ','เชียงใหม่','ขอนแก่น','ภูเก็ต','ชลบุรี','นครราชสีมา','สงขลา','อุดรธานี','เชียงราย','พิษณุโลก'];
  const PRODUCT_ADJ = ['Premium','Ultra','Smart','Pro','Mini','Eco','Super','Classic','Deluxe','Elite'];
  const PRODUCT_NOUN = ['Headphones','Mouse','Keyboard','Monitor','Camera','Speaker','Charger','Cable','Stand','Light','Hub','Dock','Case','Pen','Bag'];
  const CATEGORIES = ['Electronics','Home','Sports','Fashion','Books','Toys','Food','Health','Beauty','Office'];
  const STATUSES = ['pending','processing','shipped','delivered','cancelled'];

  function secureRandom(max: number): number {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }

  function pick<T>(arr: T[]): T {
    return arr[secureRandom(arr.length)];
  }

  function randomInt(min: number, max: number): number {
    return min + secureRandom(max - min + 1);
  }

  function randomPrice(): number {
    return Math.round((randomInt(10, 99999) + Math.random()) * 100) / 100;
  }

  function randomDate(yearStart = 2023, yearEnd = 2025): string {
    const y = randomInt(yearStart, yearEnd);
    const m = String(randomInt(1, 12)).padStart(2, '0');
    const d = String(randomInt(1, 28)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function generateUser(id: number) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const email = `${first.toLowerCase().replace(/[ก-๛]/g, () => String.fromCharCode(97 + secureRandom(26)))}${randomInt(1, 999)}@${pick(DOMAINS)}`;
    return {
      id,
      first_name: first,
      last_name: last,
      email,
      age: randomInt(18, 65),
      city: pick(CITIES),
      phone: `0${randomInt(6, 9)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`,
      registered_at: randomDate(),
      is_active: secureRandom(100) > 20
    };
  }

  function generateProduct(id: number) {
    return {
      id,
      name: `${pick(PRODUCT_ADJ)} ${pick(PRODUCT_NOUN)}`,
      category: pick(CATEGORIES),
      price: randomPrice(),
      stock: randomInt(0, 500),
      rating: Math.round((1 + Math.random() * 4) * 10) / 10,
      sku: `SKU-${String(randomInt(10000, 99999))}`,
      created_at: randomDate(),
      is_available: secureRandom(100) > 10
    };
  }

  function generateOrder(id: number) {
    return {
      id,
      order_number: `ORD-${randomDate().replace(/-/g, '')}${randomInt(1000, 9999)}`,
      customer_id: randomInt(1, 200),
      product_id: randomInt(1, 200),
      quantity: randomInt(1, 10),
      total: randomPrice(),
      status: pick(STATUSES),
      ordered_at: randomDate(),
      shipping_address: `${randomInt(1, 999)} ${pick(CITIES)}`
    };
  }

  function generate() {
    const count = Math.max(1, Math.min(500, rowCount));
    const data: any[] = [];

    for (let i = 0; i < count; i++) {
      if (selectedSchema === 'users') data.push(generateUser(i + 1));
      else if (selectedSchema === 'products') data.push(generateProduct(i + 1));
      else data.push(generateOrder(i + 1));
    }

    generatedData = data;
    generatedJson = JSON.stringify(data, null, 2);
  }

  function copyJson() {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson).then(() =>
      showToast(`คัดลอก JSON ${generatedData.length} รายการแล้ว`)
    );
  }

  function downloadJson() {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchema}_${generatedData.length}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลด JSON แล้ว');
  }

  function copyTsv() {
    if (!generatedData.length) return;
    const headers = Object.keys(generatedData[0]);
    const rows = generatedData.map(row => headers.map(h => String(row[h] ?? '')).join('\t'));
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv).then(() =>
      showToast(`คัดลอกสำหรับ Excel/Sheet แล้ว (วางใน spreadsheet ได้เลย)`)
    );
  }

  const schemas: { key: SchemaType; label: string; icon: string; desc: string }[] = [
    { key: 'users', label: 'Users', icon: 'ri-user-line', desc: 'ข้อมูลผู้ใช้ (ชื่อ, อีเมล, เมือง, โทรศัพท์)' },
    { key: 'products', label: 'Products', icon: 'ri-shopping-bag-line', desc: 'ข้อมูลสินค้า (ชื่อ, หมวดหมู่, ราคา, สต็อก)' },
    { key: 'orders', label: 'Orders', icon: 'ri-file-list-3-line', desc: 'ข้อมูลคำสั่งซื้อ (เลขออเดอร์, สถานะ, ยอดรวม)' }
  ];
  
  // Static API info
  let showApiInfo = false;
</script>

<div class="space-y-8">
  <!-- Schema Selector -->
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6 transition-colors hover:border-border-default">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-code-s-slash-line"></i></div>
      <h2 class="text-lg font-bold text-text-primary">สุ่ม Mock JSON Data</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11 leading-relaxed">สร้างข้อมูลจำลอง JSON สำหรับทดสอบ API, Frontend, หรือเรียนรู้การเขียนโปรแกรม</p>

    <div class="ml-11 space-y-5">
      <!-- Schema Type -->
      <div>
        <label class="block text-xs font-semibold text-text-tertiary mb-2">ประเภทข้อมูล</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {#each schemas as s}
          <button on:click={() => selectedSchema = s.key} class="text-left p-3 rounded-xl border transition-colors {selectedSchema === s.key ? 'border-accent-default bg-accent-default/5' : 'border-border-default bg-bg-panel hover:border-border-default'}">
            <div class="flex items-center gap-2 mb-1">
              <i class="{s.icon} text-accent-default"></i>
              <span class="text-sm font-semibold text-text-primary">{s.label}</span>
            </div>
            <p class="text-[11px] text-text-tertiary">{s.desc}</p>
          </button>
          {/each}
        </div>
      </div>

      <!-- Row Count -->
      <div class="max-w-[240px]">
        <label for="jsonRowCount" class="block text-xs font-semibold text-text-tertiary mb-2">จำนวน ({rowCount} rows)</label>
        <input type="number" id="jsonRowCount" min="1" max="500" bind:value={rowCount} class="w-full bg-bg-panel border border-border-default rounded-xl text-text-primary text-sm p-3 outline-none focus:border-accent-default focus:ring-2 focus:ring-pri-500/20 font-mono" />
      </div>
    </div>
  </section>

  <div class="flex flex-col items-center">
    <button on:click={generate} id="genJsonBtn" class="inline-flex items-center gap-2.5 px-12 py-4 bg-accent-default hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-base rounded-xl transition-colors shadow-lg shadow-accent-default/20">
      <i class="ri-braces-line text-lg"></i> สร้าง JSON
    </button>
    <div class="mt-4 text-[11px] text-text-tertiary font-mono tracking-wide">Client-side Random &middot; No Server Required</div>

    <!-- Results -->
    {#if generatedJson}
    <div class="mt-8 w-full max-w-3xl bg-bg-card border-2 border-border-default rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 bg-bg-panel/50 border-b border-border-subtle flex-wrap gap-2">
        <span class="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <i class="ri-braces-line text-accent-default"></i>
          {selectedSchema}.json
          <span class="text-text-tertiary font-normal">— {generatedData.length} rows</span>
        </span>
        <div class="flex items-center gap-2 flex-wrap">
          <button on:click={copyJson} class="text-[11px] text-text-secondary hover:text-accent-default transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-file-copy-line"></i> JSON
          </button>
          <button on:click={copyTsv} class="text-[11px] text-text-secondary hover:text-green-400 transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-table-line"></i> Excel/Sheet
          </button>
          <button on:click={downloadJson} class="text-[11px] text-text-secondary hover:text-accent-default transition-colors flex items-center gap-1 bg-bg-panel border border-border-subtle px-2.5 py-1.5 rounded-md">
            <i class="ri-download-line"></i> .json
          </button>
        </div>
      </div>
      <!-- Code Preview -->
      <pre class="p-4 text-[12px] font-mono text-text-secondary overflow-auto max-h-[400px] leading-relaxed custom-scrollbar">{generatedJson}</pre>
    </div>
    {/if}

    <!-- Static API Info -->
    <div class="mt-8 w-full max-w-3xl">
      <button on:click={() => showApiInfo = !showApiInfo} class="w-full flex items-center justify-between p-4 bg-bg-card border border-border-subtle rounded-xl hover:border-border-default transition-colors text-left">
        <span class="text-sm font-semibold text-text-primary flex items-center gap-2"><i class="ri-server-line text-accent-default"></i> Static API Endpoints (GitHub Pages)</span>
        <i class="ri-arrow-down-s-line text-text-tertiary transition-transform {showApiInfo ? 'rotate-180' : ''}"></i>
      </button>
      {#if showApiInfo}
      <div class="mt-2 p-5 bg-bg-panel border border-border-subtle rounded-xl space-y-4 anim-result">
        <p class="text-[13px] text-text-secondary leading-relaxed">เมื่อ deploy แล้ว สามารถ GET ข้อมูล mock ได้จาก URL ด้านล่าง:</p>
        
        <div class="space-y-2">
          {#each [
            { path: '/api/v1/mock/users', desc: '500 users' },
            { path: '/api/v1/mock/products', desc: '500 products' },
            { path: '/api/v1/mock/orders', desc: '500 orders' }
          ] as ep}
          <div class="flex items-center gap-3 bg-bg-card border border-border-subtle rounded-lg px-4 py-2.5">
            <span class="text-[10px] font-mono bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">GET</span>
            <code class="text-[12px] font-mono text-text-primary flex-1">{ep.path}</code>
            <span class="text-[11px] text-text-tertiary">{ep.desc}</span>
          </div>
          {/each}
        </div>
        
        <div class="bg-bg-card border border-border-subtle rounded-lg p-3 text-xs text-text-tertiary flex gap-2">
          <i class="ri-information-line text-accent-default text-base -mt-0.5"></i>
          <span>Static JSON ถูกสร้างตอน build — ข้อมูลจะเปลี่ยนทุกครั้งที่ deploy ใหม่ เหมาะสำหรับ mock data testing</span>
        </div>
      </div>
      {/if}
    </div>
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
