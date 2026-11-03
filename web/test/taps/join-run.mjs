// Job 12: joining, from install to Today with her plan started, counted tap by tap on the real app.
// Usage: node join-run.mjs <cycle|ttc|nopl> [tour|skip|ys|plan]   (plan: Version 39.61's "Make my plan" on Your Sakhi)
//   cycle: Priya, 28, regular periods with period pain (journey-video's cycle woman), 3 dates
//   ttc:   Neha, 29, trying for a baby, 7 dates (enough for fertile days)
//   nopl:  Priya, but she says "Not now" to the plan (the no-plan woman for the comparison)
// Then: days 1 to 7 fast-forwarded (morning, a tab or two, evening ticks and check-in, bedtime), every tip, badge, sheet,
// prompt and toast noted with the day and screen; and her phone's state saved on day 10 for the job runner.
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, OUT, at, iso, sleep } from './lib.mjs';

const who = process.argv[2] || 'cycle'; const path0 = process.argv[3] || 'tour';
const W = { cycle: { name: 'Priya', y: 1998, tile: 'cycle', goals: ['pain'], dates: [-82, -54, -26], dlen: 5, pain: true },
  nopl: { name: 'Priya', y: 1998, tile: 'cycle', goals: ['pain'], dates: [-82, -54, -26], dlen: 5, pain: true, noPlan: true },
  ttc: { name: 'Neha', y: 1997, tile: 'ttc', goals: ['ready'], dates: [-186, -157, -128, -99, -70, -41, -12], dlen: 5 },
  pmos: { name: 'Asha', y: 2000, tile: 'pmos', goals: ['irregular'], dates: [-80, -39, -1], dlen: 6, dx: 'ns' },
  plain: { name: 'Meena', y: 1995, tile: 'cycle', goals: ['track'], dates: [-57, -29, -1], dlen: 5 } }[who];
const browser = await launch();
const R = await open(browser, { time: at(0, '09:00') });
const page = R.page;
const words = () => page.evaluate(() => { const t = [document.querySelector('#view'), document.querySelector('#sheet-root .sheet'), document.querySelector('#tour-root .tour-pop')].filter(Boolean).map((e) => e.innerText).join(' '); return t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length; });
const readLog = []; let lastScreen = '';
async function noteRead(tag) { const w = await R.where(); const k = R.key(w) + '|' + w.sheet + '|' + w.tip; if (k === lastScreen) return; lastScreen = k; readLog.push({ tag, screen: R.label(w) + (w.sheet ? ' [sheet ' + w.sheet + ']' : '') + (w.tip ? ' [tip ' + w.tip + ']' : ''), words: await words(), scrH: await R.pageScreens() }); }
const J = R.begin('12 joining, install to Today with her plan started (' + who + ', ' + path0 + ')');
await R.startScreen(); await noteRead('lang');
const phase = []; const mark = (name) => phase.push({ name, taps: J.taps, scrolls: J.scrolls, typed: J.typed, screens: J.screens.length, sheets: J.sheets.length, tips: J.tips.length });
const T = async (sel, what, o) => { await R.tap(sel, what, o); await noteRead(what || sel); };
mark('start');
await T('[data-ob-lang="en"]', 'English');
await T('#w-start', 'Start');
mark('language + hello');
await R.type('#ob-name', W.name, 'her name'); await noteRead('name');
await T('[data-ob-dec="' + Math.floor(W.y / 10) * 10 + '"]', 'decade');
await T('[data-ob-y="' + W.y + '"]', 'year');
mark('about you');
await T('[data-ob-st="' + W.tile + '"]', 'stage tile');
mark('stage');
for (const g of W.goals) await T('[data-ob-goal="' + g + '"]', 'goal ' + g);
await T('#ob-next', 'Continue (goals)');
mark('goals');
/* Details: her last periods on the calendar */
for (const n of W.dates) {
  const d = iso(n);
  for (let i = 0; i < 26 && !(await R.has('[data-jd-day="' + d + '"]')); i++) { const first = await page.$eval('[data-jd-day]', (b) => b.dataset.jdDay); await T(d < first ? '#jd-prev' : '#jd-next', d < first ? 'month back' : 'month on'); }
  await T('[data-jd-day="' + d + '"]', 'period start ' + d);
}
for (let i = 5; i < (W.dlen || 5); i++) await T('#jd-plus', 'one more day');
if (W.pain) await T('[data-jd-tick="pain"]', 'tick: pain that stops my day');
if (W.dx) await T('[data-ob-dx="' + W.dx + '"]', 'PMOS question: ' + W.dx);
await R.shot('join-details-' + who, true);
await T('#ob-next', 'Continue (details)');
mark('details');
await T('[data-ob-care="private"]', 'A private gynaecologist (where she gets care, Version 39.28)');
mark('where she gets care');
await T('[data-ob-sh="me"]', 'Only me (who uses this phone)');
mark('who uses this phone');
/* sign-up */
await page.waitForSelector('#su-num', { timeout: 8000 }); await noteRead('signup');
await R.type('#su-num', '9876543210', 'mobile number');
await T('#su-send', 'Send code');
await page.waitForSelector('#su-code', { timeout: 8000 });
await R.type('#su-code', '123456', 'the 6-digit code'); await R.settle(1200); await noteRead('code');
if (await R.has('#su-done')) { await R.shot('join-about-' + who, true); const nm = await page.$eval('#su-name', (e) => e.value).catch(() => ''); if (!nm) await R.type('#su-name', W.name, 'name again'); await R.type('#su-pin', '302001', 'PIN code'); await T('#su-done', 'Continue (her details)'); }
mark('sign-up');
await R.settle(800); await noteRead('ys'); await R.shot('join-ys-' + who, true);
const ysScreens = await R.pageScreens();
/* "Your Sakhi": the tour (primary) or Skip */
if ((path0 === 'ys' && await R.has('#view [data-xp-plan]')) || (path0 === 'plan' && await R.has('#ys-plan'))) {
  /* the free plan's Start on "Your Sakhi"; Version 39.61 (phase C): "Make my plan" there, the path a woman with a plan's goal now takes */
  if (path0 === 'plan') await T('#ys-plan', 'Make my plan (Your Sakhi)'); else await T('#view [data-xp-plan]', 'Start (free plan on Your Sakhi)');
  for (let i = 0; i < 14; i++) {
    const h = await page.evaluate(() => location.hash); if (h === '#plan-reveal') break;
    await noteRead('plan q ' + i);
    if (await R.tapIf('#pl-in-make', 'Make my plan')) continue;
    if (await R.has('[data-pl-when]')) { await T('[data-pl-when="dinner"]', 'when: after dinner'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); if (await R.has('[data-pl-' + kind + '^="' + k + ':"].on')) continue; await T('[data-pl-' + kind + '^="' + k + ':"]', 'plan answer ' + k); }
    if (!(await R.tapIf('#pl-in-next', 'Continue (plan question)'))) await R.tapIf('#pl-in-skip', 'Skip (plan question)');
  }
  for (let k = 0; k < 10 && (await R.has('#pl-rv-next')) && !(await R.has('#pl-rv-go')); k++) await T('#pl-rv-next', 'Next (plan card)');
  await T('#pl-rv-go', 'Start my plan'); await R.settle(1500); await R.clearBlockers(); await noteRead('today');
  mark('Your Sakhi free plan Start -> plan started');
  const end0 = R.end(); console.log(JSON.stringify({ taps: end0.taps, scrolls: end0.scrolls, typed: end0.typed, screens: end0.screens.length, tips: end0.tips, sheets: end0.sheets, end: await page.evaluate(() => location.hash), plan: await page.evaluate(() => !!(window.Saathi.plan && window.Saathi.plan.running && window.Saathi.plan.running())) }, null, 1));
  for (let i = 1; i < phase.length; i++) console.log(phase[i].name.padEnd(32), 'taps', phase[i].taps - phase[i - 1].taps, 'scrolls', phase[i].scrolls - phase[i - 1].scrolls, 'screens+', phase[i].screens - phase[i - 1].screens);
  end0.path.forEach((p, i) => console.log(String(i + 1).padStart(3), p));
  fs.writeFileSync(path.join(OUT, 'join-' + who + '-' + path0 + '.json'), JSON.stringify({ job: end0, phases: phase, reads: readLog }, null, 1));
  await browser.close(); process.exit(0);
}
if (path0 !== 'skip' && await R.has('#ys-tour')) {
  await T('#ys-tour', 'Show me around (tour)');
  for (let k = 0; k < 10 && await R.has('#tour-root button'); k++) { const sel = await page.evaluate(() => ['#tour-root #tour-next', '#tour-root #tour-done', '#tour-root button'].find((s) => document.querySelector(s))); const lab = await page.$eval(sel, (e) => e.innerText.trim()); await T(sel, 'tour: ' + lab); }
} else await T('#ys-skip', 'Skip the tour');
mark('Your Sakhi + tour');
/* whatever stands in her way now */
await R.clearBlockers('after tour'); await noteRead('after tour');
const whereNow = await R.where(); R.note('after Your Sakhi she is on: ' + R.label(whereNow));
/* her first log: in Diary (the tour's last button goes there; otherwise she taps Diary) */
if (whereNow.hash !== 'diary') { if (!(await R.tapIf('#tabbar [data-go="diary"]', 'Diary tab'))) await R.go('diary'); }
await R.clearBlockers('diary'); await noteRead('diary');
await R.shot('join-firstlog-' + who, true);
if (await R.has('#fl-card')) {
  if (!(await R.tapIf('[data-fl-sign="d_cramps"]', 'first log: cramps'))) await R.tapIf('[data-fl-sign]', 'first log: a sign');
  if (!(await R.tapIf('#fl-save', 'Save (first log)'))) await R.tapIf('[data-fl-go]', 'first log go');
} else R.note('no first-log card on Diary');
mark('first log');
await R.clearBlockers('home'); await noteRead('home after first log');
await R.shot('join-today-offer-' + who, true);
const OFFER = (await R.has('#pl-off-go')) ? '#pl-off-go' : '#view .xp-pair [data-xp-off]';   /* Version 39.27: inside the doctor finding's card when one shows */
const offer = await R.has(OFFER); R.note('plan offered on Today after the first log: ' + offer + (OFFER === '#pl-off-go' ? '' : ' (in the finding\'s card)'));
const todayAfterLog = await R.controls();
const offerAt = await page.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return null; const r = b.getBoundingClientRect(); const d = b.closest('details'); return { y: Math.round(r.top + scrollY), inFold: !!(d && !d.open), slotFirst: ((document.querySelector('#view .slot > :nth-child(2)') || {}).innerText || '').trim().split('\n')[0] }; }, OFFER);
R.note('plan offer position: ' + JSON.stringify(offerAt));
if (!offer) { const w = await R.where(); R.note('where: ' + R.label(w)); }
if (W.noPlan) { await R.tapIf('#pl-off-not', 'Not now (plan)'); mark('plan declined'); }
else if (offer) {
  await T(OFFER, 'See my plan (offer)');
  for (let i = 0; i < 14; i++) {
    const h = await page.evaluate(() => location.hash); if (h === '#plan-reveal') break;
    await noteRead('plan q ' + i);
    if (await R.tapIf('#pl-in-make', 'Make my plan')) continue;
    if (await R.has('[data-pl-when]')) { await T('[data-pl-when="dinner"]', 'when: after dinner'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); if (await R.has('[data-pl-' + kind + '^="' + k + ':"].on')) continue; await T('[data-pl-' + kind + '^="' + k + ':"]', 'plan answer ' + k); }
    if (!(await R.tapIf('#pl-in-next', 'Continue (plan question)'))) await R.tapIf('#pl-in-skip', 'Skip (plan question)');
    await noteRead('plan q after ' + i);
  }
  mark('plan questions');
  for (let k = 0; k < 10 && (await R.has('#pl-rv-next')) && !(await R.has('#pl-rv-go')); k++) { await noteRead('card ' + k); await T('#pl-rv-next', 'Next (plan card)'); }
  await noteRead('last card'); await R.shot('join-lastcard-' + who, true);
  if (await R.has('#pl-rv-go')) await T('#pl-rv-go', 'Start my plan');
  await R.settle(1200); await noteRead('after start');
  mark('plan cards + Start');
  for (let k = 0; k < 4; k++) { const sh = await R.where(); if (!sh.sheet) break; await R.shot('join-after-start-sheet-' + k + '-' + who, true); if (!(await R.tapIf('#sheet-root .sheet-foot .btn.primary', 'sheet: ' + sh.sheet))) await R.tapIf('#sheet-root .sheet-foot .btn', 'sheet: ' + sh.sheet); await noteRead('sheet ' + k); }
  await R.clearBlockers('today with plan'); await noteRead('today with plan');
  mark('after Start: sheets and tips');
}
await R.shot('join-end-today-' + who, true);
const end = R.end();
if (process.env.DEBUG_EV) console.log("EV", JSON.stringify(await page.evaluate(() => window.__ev.filter((e) => e.k !== "route"))));
const st = await page.evaluate(() => ({ hash: location.hash, plan: !!(window.Saathi.plan && window.Saathi.plan.running && window.Saathi.plan.running()), tours: window.Saathi.state.tours, prompts: window.Saathi.state.prompts, fullTour: window.Saathi.state.fullTour }));
const out = { who, path: path0, job: end, phases: phase, reads: readLog, ysScreens, end: st, errs: R.errs, todayAfterLog, todayEnd: await R.controls() };
fs.writeFileSync(path.join(OUT, 'join-' + who + '-' + path0 + '.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(OUT, 'state-' + who + '-' + path0 + '-day1.json'), JSON.stringify(await R.dump()));
console.log(JSON.stringify({ taps: end.taps, scrolls: end.scrolls, typed: end.typed, screens: end.screens.length, sheets: end.sheets, tips: end.tips, badges: end.badges, toasts: end.toasts, notes: end.notes, end: st.hash, plan: st.plan, errs: R.errs }, null, 1));
for (let i = 1; i < phase.length; i++) console.log(phase[i].name.padEnd(32), 'taps', phase[i].taps - phase[i - 1].taps, 'scrolls', phase[i].scrolls - phase[i - 1].scrolls, 'screens+', phase[i].screens - phase[i - 1].screens, 'sheets+', phase[i].sheets - phase[i - 1].sheets, 'tips+', phase[i].tips - phase[i - 1].tips);
console.log('--- path'); end.path.forEach((p, i) => console.log(String(i + 1).padStart(3), p));
console.log('--- screens'); end.screens.forEach((s) => console.log('  ', s));
console.log('--- reading'); readLog.forEach((r) => console.log('  ', r.words, 'words', r.scrH, 'scr', r.screen));
await browser.close();
