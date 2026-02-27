<script lang="ts">
  import { showToast } from '$lib/utils/toast';

  const THAI_WORDS = [
    'การ', 'ความ', 'คือ', 'ที่', 'ใน', 'และ', 'ของ', 'ให้', 'ได้', 'ไป', 'มี', 'จะ', 'มา', 'นี้', 'นั้น', 'ทำ', 'ได้', 'แล้ว', 'เป็น', 'เพื่อ',
    'พัฒนา', 'ระบบ', 'ซอฟต์แวร์', 'โปรแกรม', 'ข้อมูล', 'เทคโนโลยี', 'การทำงาน', 'กระบวนการ', 'วิเคราะห์', 'ออกแบบ', 'ผลลัพธ์', 'ประสิทธิภาพ',
    'ผู้ใช้งาน', 'ประสบการณ์', 'นวัตกรรม', 'ความคิดสร้างสรรค์', 'โอกาส', 'เป้าหมาย', 'สำเร็จ', 'คุณภาพ', 'มาตรฐาน', 'บริการ', 'สังคม',
    'การเรียนรู้', 'อนาคต', 'เปลี่ยนแปลง', 'ส่งเสริม', 'สนับสนุน', 'บริหาร', 'จัดการ', 'เนื้อหา', 'บทความ', 'ทดสอบ', 'ตัวอย่าง', 'เบื้องต้น',
    'สำคัญ', 'จำเป็น', 'เหมาะสม', 'รวดเร็ว', 'แม่นยำ', 'เสถียร', 'ปลอดภัย', 'คุ้มค่า', 'น่าสนใจ', 'ทันสมัย', 'ต่อเนื่อง', 'ยั่งยืน'
  ];

  const LOREM_EN = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(' ');

  let type: 'words' | 'sentences' | 'paragraphs' = 'paragraphs';
  let lang: 'th' | 'en' = 'th';
  let count = 3;
  let result = '';

  function generate() {
    let output = '';
    
    if (type === 'words') {
      output = generateWords(count);
    } else if (type === 'sentences') {
      output = generateSentences(count);
    } else {
      output = generateParagraphs(count);
    }

    result = output;
  }

  function generateWords(n: number): string {
    const list = lang === 'th' ? THAI_WORDS : LOREM_EN;
    return Array.from({ length: n }, () => list[Math.floor(Math.random() * list.length)]).join(lang === 'th' ? '' : ' ');
  }

  function generateSentences(n: number): string {
    const list = lang === 'th' ? THAI_WORDS : LOREM_EN;
    const sentences = [];
    for (let i = 0; i < n; i++) {
      const len = 8 + Math.floor(Math.random() * 8);
      let s = generateWords(len);
      if (lang === 'en') {
        s = s.charAt(0).toUpperCase() + s.slice(1) + '.';
      } else {
        s += ' '; // Thai sentences are separated by space
      }
      sentences.push(s);
    }
    return sentences.join(lang === 'th' ? '' : ' ');
  }

  function generateParagraphs(n: number): string {
    const paragraphs = [];
    for (let i = 0; i < n; i++) {
      const len = 3 + Math.floor(Math.random() * 3);
      paragraphs.push(generateSentences(len));
    }
    return paragraphs.join('\n\n');
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => showToast('คัดลอกข้อความจำลองแล้ว'));
  }

  // Initial
  import { onMount } from 'svelte';
  onMount(() => generate());

  export function getState() { return { t: type, l: lang, c: count }; }
  export function setState(s: any) {
    if (s.t) type = s.t;
    if (s.l) lang = s.l;
    if (s.c) count = s.c;
    generate();
  }
</script>

<div class="space-y-8">
  <section class="bg-bg-card border border-border-subtle rounded-2xl p-6">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-8 h-8 rounded-lg bg-accent-default/10 text-accent-default flex items-center justify-center text-sm font-mono font-bold"><i class="ri-text-snippet"></i></div>
      <h2 class="text-lg font-bold text-text-primary">เครื่องมือสุ่มข้อความจำลอง (Lorem Ipsum)</h2>
    </div>
    <p class="text-text-tertiary text-[13px] mb-5 ml-11">สร้างข้อความจำลองเพื่อใช้ในการออกแบบเลย์เอาต์หรือทดสอบการแสดงผลฟอนต์</p>

    <div class="ml-11 flex flex-wrap gap-6 items-end">
      <div>
        <span class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider text-[11px]">ภาษา</span>
        <div class="flex bg-bg-panel p-1 rounded-xl border border-border-subtle gap-1">
          <button on:click={() => { lang = 'th'; generate(); }} class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all {lang === 'th' ? 'bg-accent-default text-white' : 'text-text-tertiary hover:text-text-secondary'}">ภาษาไทย</button>
          <button on:click={() => { lang = 'en'; generate(); }} class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all {lang === 'en' ? 'bg-accent-default text-white' : 'text-text-tertiary hover:text-text-secondary'}">English</button>
        </div>
      </div>

      <div>
        <span class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider text-[11px]">รูปแบบ</span>
        <div class="flex bg-bg-panel p-1 rounded-xl border border-border-subtle gap-1">
          {#each ['words', 'sentences', 'paragraphs'] as t}
            <button on:click={() => { type = t as any; generate(); }} class="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all {type === t ? 'bg-accent-default text-white' : 'text-text-tertiary hover:text-text-secondary'}">{t}</button>
          {/each}
        </div>
      </div>

      <div class="w-24">
        <label for="lCount" class="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider text-[11px]">จำนวน</label>
        <input type="number" id="lCount" min="1" max="50" bind:value={count} on:change={generate} class="w-full bg-bg-panel border border-border-subtle p-2.5 rounded-xl text-sm font-mono text-center focus:border-accent-default outline-none" />
      </div>

      <button on:click={generate} class="px-6 py-2.5 bg-accent-default hover:bg-accent-hover text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95">
        <i class="ri-refresh-line"></i> สร้างข้อความใหม่
      </button>
    </div>
  </section>

  <!-- Output Display -->
  <div class="relative group">
    <div class="absolute -top-3 left-6 px-3 py-1 bg-bg-card border border-border-subtle rounded-full text-[10px] font-bold text-accent-default uppercase tracking-widest z-10">Output Preview</div>
    <div class="absolute top-4 right-4 z-10">
      <button on:click={copy} class="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card hover:bg-bg-panel border border-border-subtle rounded-lg text-xs font-bold text-text-primary transition-all active:scale-95">
        <i class="ri-file-copy-line"></i> คัดลอก
      </button>
    </div>
    <div class="bg-bg-card border border-border-subtle rounded-2xl p-10 min-h-[200px] shadow-sm">
      <div class="text-text-primary text-sm sm:text-base leading-[1.8] font-light whitespace-pre-wrap {lang === 'th' ? 'font-thai' : 'font-sans'}">
        {result}
      </div>
    </div>
  </div>

  <div class="bg-accent-default/5 border border-accent-default/10 rounded-xl p-4 flex gap-3 items-start">
    <i class="ri-information-line text-accent-default text-lg mt-0.5"></i>
    <div class="text-xs text-text-secondary leading-relaxed">
      <strong>ทำไมต้องใช้ Lorem Ipsum?</strong> เพื่อให้ผู้ตรวจงานไม่หลุดโฟกัสไปอ่านเนื้อหาจริง แต่ให้ความสำคัญกับความสวยงามของฟอนต์ การจัดวางเลย์เอาต์ และระยะห่างของข้อความ (Whitespace) ในการออกแบบ UI
    </div>
  </div>
</div>

<style>
  .font-thai {
    font-family: 'IBM Plex Sans Thai', sans-serif;
  }
</style>
