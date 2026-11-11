// Ask Sakhi (Version 40, prototype; server/SERVER_SPEC.md section 12): the chat function's own copy of the Learn library.
// The chat answers from the guides the doctors checked, and it reads them from this copy only, never from text the phone sends.
// Each guide keeps what a woman reads: its title, summary, paragraphs and "When to see a doctor", in English and Hindi. Where
// an article has `doc` paragraphs (Version 39.29), the "your doctor" wording replaces the government route's, as the app shows
// it to most women. Sources, the Qura line and the review stamp stay out.
// Version 40.5 (Mohit, 9 Nov: "Yes, build 1 to 4", after "what medicine to take for period pain"): a Sakhi page the doctors checked
// can be a guide too, as the app shows it: the Period pain page, whose "Pain relief medicine" names the medicines the Learn article
// leaves out (ibuprofen or mefenamic acid, or paracetamol), with its caution and its warning cards. Its words are taken from the
// page itself, rendered in the real app, into chat-pages.json; the doctors' medicine line, buttons and links stay out (the phone
// shows that line under every answer that names a medicine). web/test/chat.mjs renders the page again and fails when it changed.
// Usage: node server/scripts/make-chat-guides.mjs            (writes server/supabase/functions/sakhi-chat/guides.js)
//        node server/scripts/make-chat-guides.mjs --pages    (renders the pages into chat-pages.json first; needs Playwright)
//        node server/scripts/make-chat-guides.mjs --check    (exits 1 when the copy differs from web/content.json and chat-pages.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
export const CONTENT = path.join(ROOT, 'web', 'content.json');
export const OUT = path.join(here, '..', 'supabase', 'functions', 'sakhi-chat', 'guides.js');
export const PAGES_FILE = path.join(here, 'chat-pages.json');
/* The pages the chat reads, by their route. The phone sends one with the Learn article core pairs it with (web/app.js, CHAT_PAGES). */
export const PAGES = [{ id: 'page.periods-pain', route: 'periods-pain', group: 'cycle' },
  /* Version 40.5.1 (the broad use cases, 10 Nov): the law in plain words, her rights, free care, pills only from a doctor, and the
     PCPNDT line on the baby's sex */
  { id: 'page.pregtest-abortion', route: 'pregtest-abortion', group: 'pregnancy' }];

/* An article's field with its `doc` overrides (index -> paragraph) applied, as core's L() does for the doctor route */
const withDoc = (a, key) => {
  const base = a[key]; const over = a.doc && a.doc[key];
  if (!Array.isArray(base) || !over) return base;
  return base.map((p, i) => (over[i] !== undefined ? over[i] : p));
};
const clean = (s) => String(s || '').replace(/^##\s+/, '').replace(/\s+/g, ' ').trim();

/* A page as a woman reads it, in the Learn library's own shape: a heading becomes a line ending in ":", a row or a list item a
   "- " line, and a paragraph a line, every word as the page shows it. Navigation (Back, the plan, the doctor card, the guide link),
   buttons, pictures and the doctors' medicine line stay out. It runs in the page (Playwright's evaluate). */
export function pageExtract() {
  const v = document.querySelector('#view');
  const txt = (el) => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const SKIP = '.backrow, .med-line, .pl-for, .doc-qura, .art-min, button, svg, script, style, [hidden], input, select, label';
  const colon = (s) => (/[:：]$/.test(s) ? s : s + ':');
  const body = []; let summary = '';
  const walk = (el) => {
    for (const c of el.children) {
      if (c.matches(SKIP)) continue;
      if (/^H[1-6]$/.test(c.tagName) || c.matches('.eyebrow')) { if (c.tagName !== 'H1' && txt(c)) body.push(colon(txt(c))); continue; }
      if (c.matches('.list')) {
        c.querySelectorAll('.item').forEach((it) => { if (it.closest(SKIP)) return; const s = it.querySelector('.body > strong'); const d = it.querySelector('.body > span:not(.eyebrow)'); const line = s && d ? txt(s) + ': ' + txt(d) : txt(it); if (line) body.push('- ' + line); });
        continue;
      }
      if (c.tagName === 'UL' || c.tagName === 'OL') { c.querySelectorAll(':scope > li').forEach((li) => { if (txt(li)) body.push('- ' + txt(li)); }); continue; }
      if (c.tagName === 'P') { const s = txt(c); if (!s) continue; if (!summary && !body.length) summary = s; else body.push(s); continue; }
      if (c.matches('.flag')) { if (txt(c)) body.push(txt(c)); continue; }
      walk(c);   /* a card or another container */
    }
  };
  walk(v);
  return { title: txt(v.querySelector('.backrow h1') || v.querySelector('h1')), summary, body };
}

/* Each page in English and Hindi, rendered in the real app for a woman who has joined (her care route unset, as for most women) */
export async function renderPages() {
  const { chromium } = await import(pathToFileURL(path.join(ROOT, 'web', 'test', 'pw.mjs')).href);
  const content = fs.readFileSync(CONTENT, 'utf8');
  const browser = await chromium.launch(); const out = {};
  try {
    for (const p of PAGES) {
      const one = {};
      for (const lang of ['en', 'hi']) {
        const ctx = await browser.newContext({ timezoneId: 'Asia/Kolkata' });
        await ctx.addInitScript('window.SAKHI_CONTENT = ' + content + ';');
        await ctx.addInitScript('window.SAKHI_CONFIG = { app: "0.40-ask-proto", platform: "web" };');
        const seed = { lang, langChosen: true, stage: 'app', dob: '1995-01-01', consent: { c1: '2026-01-01' }, situation: {}, events: [], settings: { toursAuto: false }, tours: {}, fullTour: { st: 'done' }, prompts: { setup: 'off' } };
        const acct = { token: 'tok_' + 'z'.repeat(40), id: 'acct-pages', name: 'Test', pincode: '302001', activeOn: '2026-11-09' };
        await ctx.addInitScript('localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(acct)) + ');');
        await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, body: '{}' }));
        const page = await ctx.newPage();
        await page.goto(pathToFileURL(path.join(ROOT, 'web', 'index.html')).href + '#' + p.route);
        await page.waitForFunction(() => !!window.Saathi && !!document.querySelector('#view .backrow h1'));
        one[lang] = await page.evaluate(pageExtract);
        await ctx.close();
      }
      out[p.id] = { route: p.route, group: p.group, title: { en: one.en.title, hi: one.hi.title }, summary: { en: one.en.summary, hi: one.hi.summary }, body: { en: one.en.body, hi: one.hi.body } };
    }
  } finally { await browser.close(); }
  return out;
}

export function guidesFrom(content, pages) {
  const out = {};
  for (const g of content.groups || []) {
    for (const a of g.articles || []) {
      const lines = (k) => (withDoc(a, k) || []).map(clean).filter(Boolean);
      out[g.group + '.' + a.id] = {
        group: g.group,
        title: { en: clean(a.title_en), hi: clean(a.title_hi) },
        summary: { en: clean(a.summary_en), hi: clean(a.summary_hi) },
        body: { en: lines('body_en'), hi: lines('body_hi') },
        doctor: { en: lines('see_doctor_en'), hi: lines('see_doctor_hi') }
      };
    }
  }
  /* Version 40.5: the pages, after the articles; their warning cards are in their lines, so "doctor" stays empty */
  for (const id of Object.keys(pages || {})) {
    const p = pages[id];
    out[id] = { group: p.group, title: p.title, summary: p.summary, body: { en: p.body.en.map(clean).filter(Boolean), hi: p.body.hi.map(clean).filter(Boolean) }, doctor: { en: [], hi: [] } };
  }
  return out;
}
export const readPages = () => (fs.existsSync(PAGES_FILE) ? JSON.parse(fs.readFileSync(PAGES_FILE, 'utf8')) : {});

export function moduleText(content, pages) {
  return '// Generated by server/scripts/make-chat-guides.mjs from web/content.json and chat-pages.json. Do not edit by hand: run the script again.\n' +
    '// The doctor-checked Learn library and Sakhi pages, as the Ask Sakhi chat reads them (server/SERVER_SPEC.md section 12).\n' +
    'export const GUIDES = ' + JSON.stringify(guidesFrom(content, pages), null, 0) + ';\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--pages')) {
    const pages = await renderPages();
    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 1) + '\n');
    console.log('Wrote ' + path.relative(process.cwd(), PAGES_FILE) + ' (' + Object.keys(pages).join(', ') + ')');
  }
  const content = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));
  const text = moduleText(content, readPages());
  if (process.argv.includes('--check')) {
    const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (now !== text) { console.log('server/supabase/functions/sakhi-chat/guides.js is out of date: run node server/scripts/make-chat-guides.mjs'); process.exit(1); }
    console.log('guides.js matches web/content.json and chat-pages.json');
  } else {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, text);
    console.log('Wrote ' + path.relative(process.cwd(), OUT) + ' (' + Object.keys(guidesFrom(content, readPages())).length + ' guides, ' + Math.round(text.length / 1024) + ' KB)');
  }
}
