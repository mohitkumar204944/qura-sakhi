// The stage jump (Mohit, 3 Nov 2026: "if a women is 22 and is tracking her period suddenly she changes stage and jump to
// menopause transition stage what will happen to her ongoing plan and records"). Priya, 22, joins with her last 3 periods and
// period pain, runs My period plan for a week (her steps ticked, her period logged on day 5, cramps noted), then changes her
// stage on Today. Three walks from the same week:
//   mid:  "Periods changing after 40", then the card's offer of My midlife plan, opened as far as its first question;
//   meno: "My periods have stopped", then her next period 4 weeks later;
//   back: "Periods changing after 40", then "Tracking my periods" again 2 days later.
// At each checkpoint: Today, My plan, Diary, Explore and Me (what she sees), and her records (periods, notes, her plan, what
// rings). Not pass/fail. Usage: node test/stagejump-walk.mjs [web dir]   (screens and stagejump.txt to test/shots/stagejump/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const OUT = path.join(here, 'shots', 'stagejump'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-11-03';
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };
const INTAKE = { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', endo: 'n', act: '0', food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', remind: '20:00', when: 'dinner' };
const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

const browser = await chromium.launch();
const ONLY = process.env.WALKS ? process.env.WALKS.split(',') : null;
async function walk(name, after) {
  if (ONLY && ONLY.indexOf(name) < 0) return;
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.57-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID); await ctx.addInitScript(AUDIO);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(0, '10:00') });
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  const has = (sel) => page.$(sel).then(Boolean);
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 10000 }); await page.$eval(sel, (e) => e.click()); await settle(400); };
  const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(800); await page.evaluate(() => window.scrollTo(0, 0)); };
  const dismiss = async () => { await page.evaluate(() => { const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) jb.click(); const tc = document.querySelector('.tour-card .tour-x, .tour [data-tour-x], #tour-x'); if (tc) tc.click(); }); await settle(200); };
  const dayTo = async (day, hm) => { await page.clock.setSystemTime(at(day, hm)); await go('diary'); await go('home'); await settle(600); await dismiss(); };
  /* what she sees on a screen: headings, cards' first lines, and the words of the cards (short) */
  const look = async (label, route) => {
    if (route) await go(route);
    await dismiss();
    const v = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; };
      const view = document.querySelector('#view');
      const cards = [...view.querySelectorAll('.card')].filter((c) => vis(c) && !c.parentElement.closest('#view .card')).map((c) => c.innerText.trim().replace(/\n+/g, ' / ').slice(0, 260));
      const toast = [...document.querySelectorAll('.toast')].map((x) => x.innerText.trim().replace(/\n+/g, ' / ')).join(' | ');
      const sheet = (document.querySelector('#sheet-root .sheet') || {}).innerText || '';
      return { hash: location.hash, cards, toast, sheet: sheet.trim().replace(/\n+/g, ' / ').slice(0, 500), tabs: [...document.querySelectorAll('#tabbar button')].map((b) => b.innerText.trim()).join(' | ') };
    });
    await page.screenshot({ path: path.join(OUT, name + '-' + label + '.png'), fullPage: true });
    say('  [' + label + '] ' + v.hash + '  tabs: ' + v.tabs + (v.toast ? '  TOAST: ' + v.toast : '') + (v.sheet ? '\n     SHEET: ' + v.sheet : ''));
    v.cards.forEach((c) => say('     · ' + c));
  };
  const records = async (label) => {
    const r = await page.evaluate(() => {
      const s = window.Saathi.state; const p = (s.mods || {}).plan || {};
      const logDays = Object.keys(p.log || {}).length;
      return { situation: s.situation, goals: s.goals, events: (s.events || []).map((e) => e.d + ':' + e.t).join(' '), daily: Object.entries(s.daily || {}).map(([d, a]) => d + '=' + (Array.isArray(a) ? a.map((x) => x.k || x.t || x.kind || JSON.stringify(x).slice(0, 20)).join('+') : '')).join(' '),
        plan: p.pack ? { pack: p.pack, pv: p.pv, start: p.start, logDays, goal: p.goalKey, paused: p.paused || p.pausedFor || null, fitKeep: p.fitKeep || null, ended: p.ended || p.endedOn || null } : null,
        last: p.last || p.history || (s.mods.plan && s.mods.plan.prev) || null,
        reminders: (s.reminders || []).filter((x) => x.on !== false).map((x) => x.id + '@' + (x.time || '') + (x.until ? '→' + x.until : '')).join(', ') };
    });
    say('  RECORDS ' + label + ': periods ' + r.events);
    say('     notes: ' + (r.daily || '(none)'));
    say('     situation: ' + JSON.stringify(r.situation) + '  goals: ' + JSON.stringify(r.goals));
    say('     plan: ' + JSON.stringify(r.plan) + (r.last ? '  last: ' + JSON.stringify(r.last).slice(0, 300) : ''));
    say('     rings: ' + r.reminders);
  };
  const changeStage = async (k) => { await go('home'); await dismiss(); await tap('#stage-btn'); await tap('[data-stage="' + k + '"]'); await tap('#st-save'); await settle(800); };

  say('\n=== ' + name);
  /* joining: Priya, 22, her last 3 periods (28 days apart), period pain */
  await join(page, { name: 'Priya', tile: 'cycle', goals: ['pain'], dec: 2000, y: 2004, dates: ['2026-08-16', '2026-09-13', '2026-10-11'], dlen: 5, pain: true });
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap('#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 8000 });
  if (await has('#su-done')) { await page.fill('#su-pin', '302001'); await tap('#su-done'); }
  await settle(800); if (await has('#ys-skip')) await tap('#ys-skip');
  /* her period plan, started from her answers */
  await page.evaluate((a) => { window.Saathi.plan.startFromIntake(a); window.Saathi.save(); }, INTAKE);
  await go('plan-reveal');
  for (let k = 0; k < 10 && (await has('#pl-rv-next')) && !(await has('#pl-rv-go')); k++) { await page.$eval('#pl-rv-next', (e) => e.click()); await settle(400); }
  if (await has('#pl-rv-go')) { await page.$eval('#pl-rv-go', (e) => e.click()); await settle(1200); }
  await dismiss();
  /* a week of her plan: every step ticked each day; her period on day 5 with cramps */
  for (let day = 0; day <= 6; day++) {
    await dayTo(day, '19:00');
    if (day === 5 && (await has('#view [data-log="start"]'))) { await page.$eval('#view [data-log="start"]', (e) => e.click()); await settle(600); }
    if (day === 5 || day === 6) await page.evaluate((d) => { const s = window.Saathi.state; s.daily[d] = (s.daily[d] || []).concat([{ k: 'cramps' }]); window.Saathi.saveQuiet(); }, iso(day));
    for (let i = 0; i < 5; i++) { const b = await page.$('#view button[aria-label^="Mark done"]:not([aria-pressed="true"])'); if (!b) break; await b.evaluate((e) => e.click()); await settle(300); }
  }
  await dayTo(7, '10:00');
  say('-- day 7, before the change');
  await look('d7-today', 'home'); await records('before');
  await after(page, { look, records, changeStage, dayTo, go, tap, has, settle, dismiss });
  if (errs.length) say('  PAGE ERRORS: ' + errs.join(' || '));
  await ctx.close();
}

/* her plan's questions, answered the way she would: in each group the choice that fits (prefer), else No, else the first; then
   the screen's main button; then the plan's cards and Start */
async function drive(page, h, prefer) {
  for (let i = 0; i < 14; i++) {
    const s = await page.evaluate(() => { const v = document.querySelector('#view'); const hd = (v.querySelector('h1, h2') || {}).innerText || ''; return { hash: location.hash, hd: hd.trim(), text: v.innerText.trim().replace(/\n+/g, ' / ').slice(0, 420) }; });
    say('  [q' + i + '] ' + s.hash + ' · ' + s.hd + '\n     ' + s.text);
    if (await h.has('#pl-rv-go')) { await page.$eval('#pl-rv-go', (e) => e.click()); await h.settle(1200); break; }
    if (await h.has('#pl-rv-next')) { await page.$eval('#pl-rv-next', (e) => e.click()); await h.settle(400); continue; }
    /* her answer on each question: the first choice, then the screen's main button */
    /* every question on the screen: the first choice in each group of buttons that has none chosen (her goal: hot flushes) */
    const picked = await page.evaluate((pf) => { const v = document.querySelector('#view'); const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      const btns = [...v.querySelectorAll('button')].filter(vis).filter((b) => !b.classList.contains('primary') && !/back/i.test(b.id + ' ' + b.className) && !b.closest('.topbar, #tabbar'));
      const groups = new Map(); btns.forEach((b) => { const p = b.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(b); });
      const out = [];
      for (const [, g] of groups) { if (g.length < 2 || g.some((b) => b.classList.contains('on') || b.getAttribute('aria-pressed') === 'true')) continue; const b = g.find((x) => new RegExp(pf, 'i').test(x.innerText)) || g.find((x) => x.innerText.trim() === 'No') || g[0]; b.click(); out.push(b.innerText.trim().split('\n')[0]); }
      return out.join(', '); }, prefer);
    await h.settle(400);
    const next = await page.evaluate(() => { const v = document.querySelector('#view'); const b = [...v.querySelectorAll('button.btn.primary, button.primary')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 1 && !x.disabled; }); if (b) { b.click(); return b.innerText.trim(); } return ''; });
    await h.settle(600);
    say('     picked: ' + (picked || '-') + ' · then: ' + (next || '-'));
    if (!picked && !next) break;
  }
}
await walk('mid', async (page, h) => {
  say('-- she taps Change stage: "Periods changing after 40"');
  await h.changeStage('mid');
  await h.look('mid-toast-today'); await h.look('mid-myplan', 'plan'); await h.look('mid-diary', 'diary'); await h.look('mid-explore', 'care'); await h.look('mid-me', 'me');
  await h.records('after mid');
  await h.go('home');
  if (await h.has('#pl-fit-go')) { say('-- she taps the card\'s offer'); await h.tap('#pl-fit-go'); await h.look('mid-offer-1'); for (let i = 2; i <= 4 && (await h.has('#pl-q-next, #pl-go-next, .plan-goal [data-next]')); i++) { await page.$eval('#pl-q-next, #pl-go-next, .plan-goal [data-next]', (e) => e.click()); await h.settle(400); await h.look('mid-offer-' + i); } }
  else say('-- no offer card on Today');
});
await walk('midplan', async (page, h) => {
  say('-- "Periods changing after 40", then See My midlife plan, answered the way she would, to Start');
  await h.changeStage('mid'); await h.go('home');
  if (!(await h.has('#pl-fit-go'))) { say('-- no offer card'); return; }
  await h.tap('#pl-fit-go');
  await drive(page, h, 'hot flush');
  await h.look('midplan-today', 'home'); await h.look('midplan-myplan', 'plan'); await h.look('midplan-explore-text', 'care');
  say('     EXPLORE: ' + (await page.evaluate(() => document.querySelector('#view').innerText.trim().replace(/\n+/g, ' / ').slice(0, 700))));
  await h.records('on My midlife plan');
  say('-- 2 days later she sees her mistake: "Tracking my periods" again');
  await h.dayTo(9, '10:00'); await h.changeStage('cycle'); await h.look('midplan-back-today'); await h.look('midplan-back-myplan', 'plan'); await h.records('back to tracking, after the midlife plan');
  await h.go('home'); if (await h.has('#pl-fit-go')) { say('-- she taps See My period plan'); await h.tap('#pl-fit-go'); await drive(page, h, 'period pain|painful'); await h.look('midplan-period-again-today', 'home'); await h.look('midplan-period-again-myplan', 'plan'); await h.records('her period plan again'); }
});
await walk('menoplan', async (page, h) => {
  say('-- "My periods have stopped", then See My midlife plan, answered to the end (the POI hold: no midlife plan before 40 until a doctor has seen her)');
  await h.changeStage('meno'); await h.go('home');
  if (!(await h.has('#pl-fit-go'))) { say('-- no offer card'); return; }
  await h.tap('#pl-fit-go'); await drive(page, h, 'hot flush');
  await h.look('menoplan-today', 'home'); await h.look('menoplan-myplan', 'plan'); await h.records('after the midlife offer, periods stopped at 22');
});
await walk('menohold', async (page, h) => {
  say('-- "My periods have stopped", See My midlife plan, then her goal: where does it lead?');
  await h.changeStage('meno'); await h.go('home'); if (!(await h.has('#pl-fit-go'))) { say('-- no offer card'); return; }
  await h.tap('#pl-fit-go');
  await page.evaluate(() => { const b = [...document.querySelectorAll('#view button')].find((x) => /hot flush/i.test(x.innerText)); if (b) b.click(); }); await h.settle(600);
  const full = await page.evaluate(() => ({ hash: location.hash, text: document.querySelector('#view').innerText.trim().replace(/\n+/g, ' / ') }));
  say('  after her goal: ' + full.hash + '\n     ' + full.text.slice(0, 1500));
  say('  POI words on the page: ' + (/POI|before 40|gynaecologist/i.test(full.text) ? 'yes' : 'no'));
  await page.screenshot({ path: path.join(OUT, 'menohold-after-goal.png'), fullPage: true });
  await h.look('menohold-today', 'home');
});
await walk('meno', async (page, h) => {
  say('-- she taps Change stage: "My periods have stopped"');
  await h.changeStage('meno');
  await h.look('meno-toast-today'); await h.look('meno-myplan', 'plan'); await h.look('meno-diary', 'diary');
  await h.go('home'); if (await h.has('#pl-fit-go')) { say('-- she taps See My midlife plan'); await h.tap('#pl-fit-go'); await h.look('meno-offer'); say('     PAGE: ' + (await page.evaluate(() => document.querySelector('#view').innerText.trim().replace(/\n+/g, ' / ').slice(0, 600)))); }
  await h.records('after meno');
  say('-- 4 weeks later her next period comes (day 33), and she logs it on Today');
  await h.dayTo(33, '10:00'); await h.look('meno-d33-today');
  if (await h.has('#view [data-log="start"]')) { await page.$eval('#view [data-log="start"]', (e) => e.click()); await h.settle(800); }
  await h.look('meno-d33-logged'); await h.go('home'); await h.look('meno-d33-today-again');
  await h.look('meno-d33-explain', 'explain'); say('     PAGE: ' + (await page.evaluate(() => document.querySelector('#view').innerText.trim().replace(/\n+/g, ' / ').slice(0, 700))));
  await h.records('after her next period');
});
await walk('back', async (page, h) => {
  say('-- "Periods changing after 40", then 2 days later "Tracking my periods" again');
  await h.changeStage('mid'); await h.dayTo(9, '10:00'); await h.look('back-mid-d9');
  await h.changeStage('cycle'); await h.look('back-cycle-today'); await h.look('back-cycle-myplan', 'plan'); await h.look('back-cycle-diary', 'diary');
  await h.records('back to tracking');
});
await browser.close();
fs.writeFileSync(path.join(OUT, 'stagejump.txt'), lines.join('\n') + '\n');
