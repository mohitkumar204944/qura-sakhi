// The clutter census (3 Nov 2026; docs/personal-companion-advice-2026-11-03.md): what each woman sees on every tab, counted.
// Eight women join the way a woman does (her stage tile, her goals, sign-up, Skip the tour), then each tab is counted on day 1;
// then her plan starts and the tabs are counted again on day 8. For every screen: the cards, rows and buttons she can see
// (closed folds don't count), the words, how many phone screens tall it is, and the first line of each card and row.
// Not pass/fail: run it before and after a change to compare. Usage: node test/census-walk.mjs [web dir]
// Output: test/shots/census/census.json, census.txt (one line per screen) and items.txt (each line she sees, by woman).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const OUT = path.join(here, 'shots', 'census'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-11-03';
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };

/* who joins: her joining answers (test/join.mjs) and the plan answers her plan's own questions would collect */
const WOMEN = [
  ['priya', 'Regular periods, just tracking (24)', { tile: 'cycle', goals: ['track'], dec: 2000, y: 2002 }, null],
  ['sana', 'Regular periods, period pain (29)', { tile: 'cycle', goals: ['pain', 'pms'], dec: 1990, y: 1997 },
    { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', endo: 'n', act: 0, food: 'veg', bed: 'b23', work: 'day', remind: '20:00', when: 'dinner' }],
  ['anjali', 'PMOS, irregular periods (27)', { tile: 'pmos', goals: ['irregular', 'weight'], dec: 1990, y: 1999, gap: 'g45', dx: 'y' },
    { stage: 'cycle', goal: 'pmos', gap: 'g45', skips: 'y', dx: 'y', signs: ['acne'], act: 0, food: 'veg', bed: 'late', work: 'day', remind: '20:00', when: 'dinner' }],
  ['neha', 'Trying for a baby (30)', { tile: 'ttc', goals: ['ready'], dec: 1990, y: 1996 },
    { stage: 'ttc', goal: 'ready', gap: 'n', skips: 'n', dx: 'n', signs: ['none'], act: 1, food: 'egg', bed: 'b23', work: 'day', remind: '20:00', when: 'evening' }],
  ['riya', 'Pregnant, 20 weeks (26)', { tile: 'preg', goals: ['food'], dec: 2000, y: 2000, lmp: iso(-140) },
    { stage: 'preg', goal: 'food', bed: 'b23', work: 'home', remind: '20:00' }],
  ['meera', 'Had a baby 3 weeks ago (28)', { tile: 'post', goals: ['recovery'], dec: 1990, y: 1998, birth: iso(-21), bf: 'yes' },
    { stage: 'post', goal: 'recovery', bed: 'late', work: 'home', remind: '13:00' }],
  ['kavita', 'Periods changing after 40, hot flushes (46)', { tile: 'mid', goals: ['hot', 'sleep'], dec: 1980, y: 1980 },
    { stage: 'meno', goal: 'hot', act: 0, bed: 'b23', work: 'home', remind: '20:00', when: 'evening' }],
  ['sunita', 'Menopause (54)', { tile: 'meno', goals: ['hot'], dec: 1970, y: 1972, mp: '1' },
    { stage: 'meno', goal: 'hot', act: 0, bed: 'b23', work: 'home', remind: '20:00', when: 'evening' }]
];
const only = process.env.WOMEN ? process.env.WOMEN.split(',') : null;

/* what she can see on the screen now: cards (outermost), rows, taps, words, height, and the first line of each */
const COUNT = () => {
  const view = document.querySelector('#view'); const H = innerHeight;
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
  const first = (e) => (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().split('\n').map((x) => x.trim()).filter(Boolean)[0] || '';
  const cards = [...view.querySelectorAll('.card')].filter((c) => vis(c) && !c.parentElement.closest('#view .card'));
  const rows = [...view.querySelectorAll('.item, .row, .tile, .topic, .chip, li')].filter((e) => vis(e) && !e.parentElement.closest('.item, .tile, .chip'));
  const taps = [...view.querySelectorAll('button, a[href], [role=button], summary, input:not([type=hidden]), select, textarea, [data-go]')].filter(vis);
  const tapSet = [...new Set(taps)];
  const folds = [...view.querySelectorAll('details')].filter((d) => vis(d) && !d.open).length;
  const heads = [...view.querySelectorAll('h1, h2, h3')].filter(vis).map((h) => h.innerText.trim().replace(/\s+/g, ' '));
  const text = (view.innerText || '').trim();
  const sheet = document.querySelector('#sheet-root .sheet'); const tabbar = [...document.querySelectorAll('#tabbar button')].map((b) => b.innerText.trim());
  return { hash: location.hash, cards: cards.length, rows: rows.length, taps: tapSet.length, folds, words: text ? text.split(/\s+/).length : 0,
    screens: Math.round(Math.max(document.scrollingElement.scrollHeight, view.scrollHeight) / H * 10) / 10,
    heads, cardLines: cards.map(first), tapLines: tapSet.map(first).filter(Boolean),
    goes: tapSet.map((e) => e.dataset.go || (e.getAttribute('href') || '').replace(/^#/, '') || '').filter(Boolean),
    sheet: sheet ? sheet.innerText.trim().split('\n').filter(Boolean).slice(0, 40) : null, tabbar,
    toast: (document.querySelector('.toast') || {}).innerText || '' };
};

const browser = await chromium.launch();
const all = [];
async function walk(id, who, jo, intake) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.56-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID); await ctx.addInitScript(AUDIO);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(0, '10:00') });
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 10000 }); await page.$eval(sel, (e) => e.click()); await settle(300); };
  const has = (sel) => page.$(sel).then(Boolean);
  const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(800); await page.evaluate(() => window.scrollTo(0, 0)); };
  const dismiss = async () => { await page.evaluate(() => { const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) jb.click(); }); await settle(200); };
  const count = async (moment, screen) => {
    const c = await page.evaluate(COUNT);
    await page.screenshot({ path: path.join(OUT, id + '-' + moment + '-' + screen + '.png'), fullPage: true });
    all.push(Object.assign({ who: id, label: who, moment, screen }, c));
  };
  const tabs = async (moment) => {
    await go('home'); await dismiss(); await count(moment, 'today');
    if (await has('#tabbar [data-go="plan"]')) { await go('plan'); await count(moment, 'myplan'); }
    await go('diary'); await count(moment, 'diary');
    await go('care'); await count(moment, 'explore');
    await go('learn'); await count(moment, 'learn');
    await go('me'); await count(moment, 'me');
    await go('home'); await page.$eval('#help-btn', (e) => e.click()); await settle(400);
    const h = await page.evaluate(() => { const s = document.querySelector('#sheet-root .sheet'); return s ? { items: s.querySelectorAll('button, a[href]').length, lines: s.innerText.trim().split('\n').filter(Boolean) } : null; });
    all.push({ who: id, label: who, moment, screen: 'help-sheet', taps: h ? h.items : 0, sheet: h ? h.lines : null });
    await page.evaluate(() => { const b = document.querySelector('#sheet-bg'); if (b) b.click(); }); await settle(200);
  };
  /* joining, as she does it */
  await join(page, Object.assign({ name: id[0].toUpperCase() + id.slice(1) }, jo));
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap('#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 8000 });
  if (await has('#su-done')) { await page.fill('#su-pin', '302001'); await tap('#su-done'); }
  await settle(800);
  if (await has('#ys-skip')) { await count('d1', 'your-sakhi'); await tap('#ys-skip'); }
  await settle(600);
  await tabs('d1');
  /* her plan: started from her answers on day 1, counted on day 8 */
  if (intake) {
    await page.evaluate((a) => { window.Saathi.plan.startFromIntake(a); window.Saathi.save(); }, intake);
    await go('plan-reveal');
    for (let k = 0; k < 10 && (await has('#pl-rv-next')) && !(await has('#pl-rv-go')); k++) { await page.$eval('#pl-rv-next', (e) => e.click()); await settle(400); }
    if (await has('#pl-rv-go')) { await page.$eval('#pl-rv-go', (e) => e.click()); await settle(1200); }
    await dismiss();
  }
  await page.clock.setSystemTime(at(7, '10:00')); await go('diary'); await go('home'); await settle(900); await dismiss();
  await tabs('d8');
  if (errs.length) all.push({ who: id, moment: 'errors', screen: 'errors', sheet: errs });
  await ctx.close();
}
for (const [id, who, jo, intake] of WOMEN) { if (only && only.indexOf(id) < 0) continue; try { await walk(id, who, jo, intake); } catch (e) { console.log('WALK FAILED', id, String(e.message).slice(0, 300)); all.push({ who: id, moment: 'failed', screen: 'failed', sheet: [String(e.message).slice(0, 300)] }); } }
await browser.close();

fs.writeFileSync(path.join(OUT, 'census.json'), JSON.stringify(all, null, 1));
const line = (r) => [r.who.padEnd(7), r.moment.padEnd(3), r.screen.padEnd(11), 'cards ' + String(r.cards ?? '-').padStart(2), 'rows ' + String(r.rows ?? '-').padStart(3), 'taps ' + String(r.taps ?? '-').padStart(3), 'folds ' + String(r.folds ?? '-').padStart(2), 'words ' + String(r.words ?? '-').padStart(4), 'screens ' + String(r.screens ?? '-').padStart(4)].join('  ');
fs.writeFileSync(path.join(OUT, 'census.txt'), all.map(line).join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'items.txt'), all.map((r) => '== ' + r.who + ' ' + r.moment + ' ' + r.screen + (r.tabbar ? '  [tabs: ' + r.tabbar.join(' | ') + ']' : '') + '\n' +
  (r.heads && r.heads.length ? '  headings: ' + r.heads.join(' / ') + '\n' : '') +
  (r.cardLines ? r.cardLines.map((x) => '  card: ' + x).join('\n') + '\n' : '') +
  (r.tapLines ? '  taps: ' + r.tapLines.join(' · ') + '\n' : '') +
  (r.sheet ? '  sheet: ' + r.sheet.join(' / ') + '\n' : '')).join(''));
console.log(fs.readFileSync(path.join(OUT, 'census.txt'), 'utf8'));
