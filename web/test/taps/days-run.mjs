// Days 1 to 10 for a new user, each app session opened cold at its time (as she would from the home screen or a
// notification): every tip, badge, sheet, toast and prompt that interrupts her, with the day and screen, and the taps it
// costs her. Then her phone's state on day 10 for the job runner.
// Usage: node days-run.mjs <cycle|nopl|ttc> [tour]
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, OUT, at, iso } from './lib.mjs';

const who = process.argv[2] || 'cycle'; const p0 = process.argv[3] || 'tour';
let state = JSON.parse(fs.readFileSync(path.join(OUT, 'state-' + who + '-' + p0 + '-day1.json'), 'utf8'));
const PER = { cycle: { start: 2, end: 6 }, nopl: { start: 2, end: 6 }, ttc: { start: 18, end: 22 } }[who];   /* Priya's period starts on day 3 (journey-video) */
const browser = await launch();
const log = []; const rings = [];
const TABS = { 1: 'plan', 2: 'diary', 3: 'care', 4: 'me' };   /* day 2 My plan, day 3 Diary, day 4 Explore, day 5 Me */
const fmt = (ms) => new Date(ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

async function session(day, hm, label, fn, hash) {
  const R = await open(browser, { state, time: at(day, hm), hash: hash || 'home' });
  await R.settle(2600);   /* tips start after a short wait */
  const J = R.begin('day ' + (day + 1) + ' ' + hm + ' ' + label);
  const onOpen = await R.page.evaluate(() => window.__ev.filter((e) => e.k !== 'route').map((e) => e.k + ': ' + e.h + (e.k === 'tip' || e.k === 'badge' ? '' : '')));
  await R.startScreen();
  const slot = await R.page.evaluate(() => { const s = document.querySelector('#view .slot'); if (!s) return null; const first = s.querySelector(':scope > :nth-child(2)'); const more = s.querySelector('details.slot-more summary'); return { first: first ? first.innerText.trim().split('\n').slice(0, 2).join(' / ') : '', more: more ? more.innerText.trim() : '' }; });
  const firstScreen = await R.page.evaluate(() => { const nav = document.querySelector('#tabbar'); const bot = nav && !nav.hidden ? nav.getBoundingClientRect().top : innerHeight; return [...document.querySelectorAll('#view > *')].filter((e) => e.getBoundingClientRect().top < bot && e.getBoundingClientRect().height > 0).map((e) => (e.className || e.tagName) + ': ' + (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 90)); });
  const blockers = await R.clearBlockers('on open');
  if (fn) await fn(R).catch((e) => R.note('ERR ' + String(e.message).slice(0, 160)));
  const rg = await R.page.evaluate(() => (window.__rings || []).slice(-1)[0] || null);
  if (rg) rings.push({ day: day + 1, hm, list: rg.map((x) => ({ at: x.at, id: x.id, body: x.body, go: x.go })) });
  const j = R.end(); log.push({ day: day + 1, hm, label, onOpen, blockers, slot, firstScreen, taps: j.taps, scrolls: j.scrolls, path: j.path, tips: j.tips, badges: j.badges, sheets: j.sheets, toasts: j.toasts, notes: j.notes, screens: j.screens, errs: R.errs.slice() });
  state = await R.dump(); await R.ctx.close();
}
/* Version 39.66: a question her plan asks on its day, answered first (its first answer, as join-run answers her plan's questions) */
async function dayQs(R) { for (let k = 0; k < 3; k++) { if (!(await R.tapIf('#view .pl-dq [data-pl-dq]', 'her plan\'s question on Today'))) break; } }
/* her plan's ticks on Today (the round ticks), then the check-in from Today's pink button */
async function ticks(R) { await dayQs(R); for (let k = 0; k < 5; k++) { if (!(await R.tapIf('#view .today-card [data-today-act]', 'tick a step'))) break; await R.clearBlockers('tick'); } }
async function checkin(R) {
  if (!(await R.tapIf('#view [data-go="plan-checkin"]', 'check-in button on Today'))) { R.note('no check-in button on Today'); return; }
  await R.settle(800); await R.clearBlockers('check-in');
  const groups = await R.page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))]);
  for (const g of groups) { if (await R.has('[data-ci^="' + g + ':"].on')) continue; if (await R.has('.pl-ci-opt [data-ci^="' + g + ':"]')) continue; await R.tap('[data-ci^="' + g + ':"]', 'check-in answer ' + g); }
  await R.tapIf('#pl-ci-save', 'Save check-in'); await R.settle(900); await R.clearBlockers('after check-in');
  for (let k = 0; k < 3; k++) { const w = await R.where(); if (!w.sheet) break; if (!(await R.tapIf('#sheet-root .sheet-foot .btn.primary', 'sheet: ' + w.sheet))) await R.tapIf('#sheet-root .btn', 'sheet: ' + w.sheet); }
}
const planOn = who !== 'nopl';
let day10 = null;
for (let day = 0; day <= 9; day++) {
  if (day === 9) day10 = state;   /* her phone on the morning of day 10, before she opens Sakhi */
  const film = day <= 6;   /* days 1 to 7 in detail; 8 to 10 only to reach day 10 */
  if (day > 0) await session(day, '08:30', 'morning: opens Sakhi', async (R) => {
    if (day === PER.start) { await R.tap('#view [data-log="start"]', 'Period started'); await R.clearBlockers('period'); }
    if (day === PER.end) { if (!(await R.tapIf('#view [data-log="end"]', 'Period ended'))) R.note('no Period ended button'); else { if (await R.has('#log-save')) await R.tap('#log-save', 'Save (period ended)'); await R.clearBlockers('period end'); } }
    if (film && TABS[day]) {
      const t = TABS[day];
      if (t === 'me') await R.tap('#topbar [data-go="me"]', 'Me'); else await R.tap('#tabbar [data-go="' + t + '"]', t + ' tab');
      await R.settle(2600); const b = await R.clearBlockers('tab'); if (b.length) R.note('on ' + t + ': ' + b.join(' | '));
      await R.tap('#tabbar [data-go="home"]', 'Today tab'); await R.settle(1500); await R.clearBlockers('back home');
    }
  });
  if (planOn) await session(day, '20:30', 'evening: ticks and check-in', async (R) => { await ticks(R); await checkin(R); });
  else await session(day, '20:30', 'evening: opens Sakhi (no plan)', async (R) => { if (await R.has('#view .today-card [data-today-act]')) await ticks(R); });
  if (film) await session(day, '22:15', 'bedtime: Wind down if Today offers it', async (R) => {
    const nav = await R.page.evaluate(() => { const b = [...document.querySelectorAll('#view [data-today-nav], #view [data-go="calm"], #view [data-go^="calm"], #view [data-go="plan-wind"]')].find((x) => x.getBoundingClientRect().height > 0); return b ? (b.dataset.todayNav !== undefined ? '[data-today-nav="' + b.dataset.todayNav + '"]' : '[data-go="' + b.dataset.go + '"]') : null; });
    if (nav) { await R.tap('#view ' + nav, 'Wind down / bedtime step'); await R.settle(1200); await R.clearBlockers('calm'); R.note('bedtime: ' + (await R.where()).hash); }
    else R.note('no bedtime entry on Today');
  });
}
const tag = who + (p0 === 'tour' ? '' : '-' + p0);
fs.writeFileSync(path.join(OUT, 'state-' + tag + '-day10.json'), JSON.stringify(day10));
fs.writeFileSync(path.join(OUT, 'days-' + tag + '.json'), JSON.stringify({ log, rings }, null, 1));
for (const s of log) {
  const intr = [].concat(s.onOpen.map((x) => 'ON OPEN ' + x), s.blockers.map((x) => 'BLOCK ' + x), s.sheets.map((x) => 'SHEET ' + x), s.tips.map((x) => 'TIP ' + x), s.badges.map((x) => 'BADGE ' + x), s.toasts.map((x) => 'TOAST ' + x));
  console.log('## day ' + s.day + ' ' + s.hm + ' ' + s.label + ' | taps ' + s.taps + ' scrolls ' + s.scrolls + (s.slot ? ' | slot: ' + s.slot.first + (s.slot.more ? ' + ' + s.slot.more : '') : ''));
  intr.forEach((x) => console.log('    ' + x));
  s.path.forEach((x) => console.log('      > ' + x));
  s.notes.forEach((x) => console.log('      note ' + x));
  if (s.errs.length) console.log('      ERRS ' + s.errs.join(' | '));
}
const lastRings = rings.slice(-1)[0];
console.log('--- notifications booked after the last session:'); (lastRings ? lastRings.list : []).slice(0, 25).forEach((x) => console.log('   ', fmt(x.at), x.id, '|', x.body, '| opens', x.go));
await browser.close();
