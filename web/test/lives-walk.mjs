// Lives walk (Mohit, 3 Nov 2026: "test all possible scenarios ... one user to see the app personalised to their own age and stage
// of life ... navigate from real user POVs, take 1 different user for every different stage, then advise how the experience gets
// compromised"; docs/lives-audit-2026-11-03.md). One woman per stage joins the way a woman does, starts her plan from Today's offer
// (her answers typed in as she would), and lives her stage: her steps ticked on her active days, her periods logged, the events of
// her stage (a late period and a test, a positive test, the birth, periods back or stopped, bleeding after menopause), a lapse and
// a return. At each checkpoint every tab is counted (cards, rows, taps, screens), each line she can see is kept, and what
// interrupted her (tips, badges, sheets, toasts) and what rings are noted. Then 14 more women at the edges of each stage's ages
// join and start their plan (day 1 only). Flags at the end: lines that don't fit her age, her stage or her care answer, pages
// reached from two tabs, screens over budget. Not pass/fail.
// Usage: node test/lives-walk.mjs [web dir]   (WHO=priya,neha to pick; EDGES=0 to skip the edge ages)
// Output: test/shots/lives/ (screens), lives.json, lives.txt (each checkpoint), flags.txt (each flag, by woman)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const OUT = path.join(here, 'shots', 'lives'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-11-03';
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };
const only = process.env.WHO ? process.env.WHO.split(',') : null;

/* the women. jo: her joining answers (test/join.mjs). pref: how she answers her plan's questions (a choice that matches, else No,
   else the first). active: [from, to, every] days she ticks her steps. steps: { day: [actions] }, cp: { day: label } */
const WOMEN = [
  { id: 'priya', label: 'Priya, 24, regular periods, just tracking, private doctor', age: 24, jo: { tile: 'cycle', goals: ['track'], dec: 2000, y: 2002, dates: ['2026-08-13', '2026-09-10', '2026-10-08'], dlen: 5, care: 'private' }, plan: false,
    steps: { 0: ['firstlog'], 2: ['period', 'feel:Cramps'], 3: ['feel:Cramps'], 41: ['period'], 42: ['feel:Tired'], 69: ['period'] }, active: [],
    cp: { 0: 'joined', 10: 'cycle-day-8', 16: 'cycle-day-14', 34: 'late-4-days', 39: 'late-9-days', 40: 'test-negative', 41: 'period-came-late', 90: 'month-3' }, tests: { 40: 'neg' } },
  { id: 'anjali', label: 'Anjali, 27, PMOS (diagnosed), irregular + weight + skin, care not answered', age: 27, jo: { tile: 'pmos', goals: ['irregular', 'weight', 'skin'], dec: 1990, y: 1999, dates: ['2026-06-02', '2026-07-21', '2026-09-14'], dlen: 6, dx: 'y' }, plan: true, pref: 'Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['firstlog', 'plan'], 22: ['period', 'feel:Cramps'] }, active: [[1, 14, 1], [15, 28, 2], [48, 84, 3]],
    cp: { 0: 'plan-day-1', 7: 'day-8', 22: 'period-after-72-days', 28: 'week-4-check', 48: 'back-after-19-days', 84: 'day-85-end' } },
  { id: 'neha', label: 'Neha, 31, trying for a baby, private doctor', age: 31, jo: { tile: 'ttc', goals: ['ready'], dec: 1990, y: 1995, dates: ['2026-08-20', '2026-09-19', '2026-10-19'], dlen: 5, care: 'private' }, plan: true, pref: 'Standard|Eggs too|Some days|After dinner|Today',
    steps: { 0: ['firstlog', 'plan'], 15: ['period'], 49: ['test:pos'], 50: ['movepreg', 'plan'] }, active: [[1, 14, 1], [16, 48, 2], [51, 56, 1]],
    cp: { 0: 'plan-day-1', 7: 'day-8', 26: 'fertile-window', 49: 'late-4-days-test-positive', 50: 'moved-to-pregnancy', 56: 'pregnancy-week-1' } },
  { id: 'riya', label: 'Riya, 26, pregnant 20 weeks, government care', age: 26, jo: { tile: 'preg', goals: ['food'], dec: 2000, y: 2000, lmp: iso(-140), care: 'govt' }, plan: true, pref: 'Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['plan'], 130: ['born', 'plan'] }, active: [[1, 129, 3], [131, 137, 1]],
    cp: { 0: 'plan-day-1-20-weeks', 14: '22-weeks', 56: '28-weeks', 126: '38-weeks', 130: 'baby-born', 137: 'after-birth-day-8' } },
  { id: 'meera', label: 'Meera, 29, baby 3 weeks ago, breastfeeding, private doctor', age: 29, jo: { tile: 'post', goals: ['recovery'], dec: 1990, y: 1997, birth: iso(-21), bf: 'yes', care: 'private' }, plan: true, pref: 'Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['plan'], 160: ['period'] }, active: [[1, 42, 2], [43, 159, 5]],
    cp: { 0: 'plan-day-1-3-weeks', 21: '6-weeks', 42: '9-weeks', 160: 'periods-back-6-months' } },
  { id: 'kavita', label: 'Kavita, 46, periods changing, hot flushes + sleep, care not answered', age: 46, jo: { tile: 'mid', goals: ['hot', 'sleep'], dec: 1980, y: 1980, dates: ['2026-06-05', '2026-07-18', '2026-09-10'], dlen: 4 }, plan: true, pref: 'Hot flush|Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['firstlog', 'plan'], 40: ['period'] }, active: [[1, 10, 1], [11, 84, 3]],
    cp: { 0: 'plan-day-1', 28: 'week-5', 84: 'week-12-end', 400: 'no-period-for-a-year', 420: 'thirteen-months-no-period' } },
  { id: 'sunita', label: 'Sunita, 54, menopause, hot flushes + bones, government care', age: 54, jo: { tile: 'meno', goals: ['hot', 'bones'], dec: 1970, y: 1972, mp: '1', care: 'govt' }, plan: true, pref: 'Hot flush|Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['plan'], 10: ['spot'] }, active: [[1, 28, 2]],
    cp: { 0: 'plan-day-1', 10: 'bleeding-after-menopause', 28: 'week-5' } },
  { id: 'asha', label: 'Asha, 33, period pain, shared phone (family), care not answered', age: 33, jo: { tile: 'cycle', goals: ['pain'], dec: 1990, y: 1993, dates: ['2026-08-18', '2026-09-15', '2026-10-13'], dlen: 5, pain: true, share: 'fam' }, plan: true, pref: 'Mild|Vegetarian|Some days|After dinner|Today',
    steps: { 0: ['firstlog', 'plan'], 7: ['period'] }, active: [[1, 10, 1]],
    cp: { 0: 'plan-day-1', 8: 'day-9-period' } },
  { id: 'pooja', label: 'Pooja, 16, under 18 (the girls\' reading path)', age: 16, under18: true }
];
/* the edges of each stage's ages: day 1, her plan started */
const EDGES = [['cycle', 19, ['track']], ['cycle', 44, ['track']], ['pmos', 18, ['irregular']], ['pmos', 38, ['irregular']], ['ttc', 23, ['ready']], ['ttc', 41, ['ready']],
  ['preg', 19, ['food']], ['preg', 40, ['food']], ['post', 20, ['recovery']], ['post', 39, ['recovery']], ['mid', 38, ['hot']], ['mid', 52, ['hot']], ['meno', 41, ['hot']], ['meno', 62, ['hot']]];
const birthYear = (age) => 2026 - age - 1;   /* her birthday in January */
const edgeWoman = ([tile, age, goals]) => { const y = birthYear(age) + 1; const dec = y < 1950 ? 'pre' : Math.floor(y / 10) * 10; const j = { tile, goals, dec, y, m: age === 18 ? '1' : undefined };
  if (tile === 'cycle' || tile === 'pmos' || tile === 'ttc' || tile === 'mid') { j.dates = tile === 'pmos' || tile === 'mid' ? ['2026-06-04', '2026-07-24', '2026-09-16'] : ['2026-08-14', '2026-09-11', '2026-10-09']; j.dlen = 5; }
  if (tile === 'pmos') j.dx = 'y'; if (tile === 'preg') j.lmp = iso(-140); if (tile === 'post') { j.birth = iso(-21); j.bf = 'yes'; } if (tile === 'meno') j.mp = '1';
  return { id: tile + '-' + age, label: tile + ' at ' + age + ' (edge)', age, jo: j, plan: tile !== 'cycle' || goals[0] !== 'track', pref: 'Hot flush|Vegetarian|Some days|After dinner|Today|Standard', steps: { 0: ['firstlog', 'plan'] }, active: [], cp: { 0: 'plan-day-1' }, edge: true }; };

/* what she can see now (closed folds don't count) */
const COUNT = () => {
  const view = document.querySelector('#view'); const H = innerHeight;
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
  const first = (e) => (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().split('\n').map((x) => x.trim()).filter(Boolean)[0] || '';
  const cards = [...view.querySelectorAll('.card')].filter((c) => vis(c) && !c.parentElement.closest('#view .card'));
  const taps = [...new Set([...view.querySelectorAll('button, a[href], [role=button], summary, input:not([type=hidden]), select, textarea, [data-go]')].filter(vis))];
  const text = (view.innerText || '').trim();
  return { hash: location.hash, cards: cards.length, taps: taps.length, words: text ? text.split(/\s+/).length : 0,
    screens: Math.round(Math.max(document.scrollingElement.scrollHeight, view.scrollHeight) / H * 10) / 10,
    cardText: cards.map((c) => c.innerText.trim().replace(/\n+/g, ' / ').slice(0, 300)), tapLines: taps.map(first).filter(Boolean),
    goes: taps.map((e) => e.dataset.go || (e.getAttribute('href') || '').replace(/^#/, '') || '').filter(Boolean),
    lines: text.split('\n').map((x) => x.trim()).filter(Boolean),
    tabs: [...document.querySelectorAll('#tabbar button')].map((b) => b.innerText.trim()) };
};
const INTERRUPT = () => {
  const tx = (s) => [...document.querySelectorAll(s)].map((e) => e.innerText.trim().replace(/\n+/g, ' / ').slice(0, 200)).filter(Boolean);
  return { tips: tx('.tour-pop'), badges: tx('#joy-root [role="dialog"]'), sheets: tx('#sheet-root .sheet'), toasts: tx('.toast') };
};

const browser = await chromium.launch();
const all = [];
async function live(w) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.57-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID); await ctx.addInitScript(AUDIO);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = []; const log = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(0, '10:00') });
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  const has = (sel) => page.$(sel).then(Boolean);
  const click = async (sel) => { if (!(await has(sel))) return false; await page.$eval(sel, (e) => e.click()); await settle(400); return true; };
  const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(800); await page.evaluate(() => window.scrollTo(0, 0)); };
  let seen = { tips: [], badges: [], sheets: [], toasts: [] };
  const note = async () => { const i = await page.evaluate(INTERRUPT); for (const k of Object.keys(seen)) for (const x of i[k]) if (seen[k].indexOf(x) < 0) seen[k].push(x); };
  const dismiss = async () => { await note(); await page.evaluate(() => { const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) jb.click(); const tp = document.querySelector('.tour-pop'); if (tp) { const b = [...tp.querySelectorAll('button')].find((x) => /not now|later|skip|×|close/i.test(x.innerText + ' ' + (x.getAttribute('aria-label') || ''))) || tp.querySelector('button'); if (b) b.click(); } }); await settle(250); };
  const home = async () => { await go('home'); await dismiss(); };
  const act = async (name, fn) => { try { const r = await fn(); log.push(name + (r === false ? ' (not there)' : '')); } catch (e) { log.push(name + ' FAILED ' + String(e.message).slice(0, 120)); } };
  /* her plan's questions, answered as she would */
  const drive = async (prefer) => {
    for (let i = 0; i < 18; i++) {
      if (await click('#pl-rv-go')) { await settle(1200); return true; }
      if (await click('#pl-rv-next')) continue;
      const picked = await page.evaluate((pf) => { const v = document.querySelector('#view'); const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
        const btns = [...v.querySelectorAll('button')].filter(vis).filter((b) => !b.classList.contains('primary') && !/back|linkbtn/i.test(b.id + ' ' + b.className) && !b.closest('.topbar, #tabbar') && !b.dataset.go);
        const groups = new Map(); btns.forEach((b) => { const p = b.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(b); });
        let n = 0; for (const [, g] of groups) { if (g.length < 2 || g.some((b) => b.classList.contains('on') || b.getAttribute('aria-pressed') === 'true')) continue; const b = g.find((x) => new RegExp(pf, 'i').test(x.innerText)) || g.find((x) => x.innerText.trim() === 'No') || g[0]; b.click(); n++; }
        return n; }, prefer || 'Today');
      await settle(400);
      const next = await page.evaluate(() => { const v = document.querySelector('#view'); const b = [...v.querySelectorAll('button.btn.primary, button.primary')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 1 && !x.disabled && !x.dataset.go; }); if (b) { b.click(); return b.innerText.trim(); } return ''; });
      await settle(700);
      if (!picked && !next) return false;
      if (!/plan-goal|plan-reveal|plan-safety|plan-before|plan-start/.test(await page.evaluate(() => location.hash))) return /plan|home/.test(await page.evaluate(() => location.hash));
    }
    return false;
  };
  const doStep = async (s) => {
    if (s === 'firstlog') return act(s, async () => { await go('diary'); if (await click('#fl-save')) return true; await home(); return click('#view [data-feel]'); });
    if (s === 'plan') return act(s, async () => { await home(); const via = (await click('#pl-off-go')) || (await click('#pl-chg-go')) || (await click('#pl-fit-go'));
      if (!via) { await go('plan'); const g = await page.evaluate((pf) => { const b = [...document.querySelectorAll('#view button.item, #view .tile, #view [data-pl-goal], #view [data-goal]')].find((x) => new RegExp(pf, 'i').test(x.innerText)) || document.querySelector('#view button.item'); if (b) { b.click(); return true; } return false; }, w.pref || '.'); await settle(500); if (!g) return false; }
      const ok = await drive(w.pref); await home(); return ok; });
    if (s === 'period' || s === 'spot') return act(s, async () => { await home(); const ok = await click('#view [data-log="' + (s === 'spot' ? 'spot' : 'start') + '"]'); await settle(500); await note(); return ok; });
    if (s.startsWith('feel:')) return act(s, async () => { await home(); return page.evaluate((x) => { const b = [...document.querySelectorAll('#view [data-feel]')].find((e) => e.innerText.trim() === x); if (b) { b.click(); return true; } return false; }, s.slice(5)); });
    if (s.startsWith('test:')) return act(s, async () => { await go('pregtest-when'); const ok = await click('[data-pt-res="' + s.slice(5) + '"]'); await click('#pt-save'); await note(); return ok; });
    if (s === 'movepreg') return act(s, async () => { await home(); if (await click('#pl-pos-yes')) return true; await click('#stage-btn'); await click('[data-stage="preg"]'); return click('#st-save'); });
    if (s === 'born') return act(s, async () => { await home(); if (!(await click('#bb-born'))) { await click('#stage-btn'); await click('[data-stage="post"]'); } await page.evaluate((d) => { const b = document.querySelector('#st-birth'); if (b) { b.value = d; b.dispatchEvent(new Event('change')); } }, iso(130)); return click('#st-save'); });
  };
  const ticks = async () => { await home(); let n = 0; for (let i = 0; i < 5; i++) { const b = await page.$('#view button[aria-label^="Mark done"]:not([aria-pressed="true"])'); if (!b) break; await b.evaluate((e) => e.click()); await settle(300); n++; if (!/#home/.test(await page.evaluate(() => location.hash))) await home(); } return n; };
  const records = async () => page.evaluate(() => { const s = window.Saathi.state; const p = (s.mods || {}).plan || {};
    return { situation: s.situation, goals: s.goals, care: (s.situation || {}).care || null, disc: !!(s.settings || {}).discreet, events: (s.events || []).length,
      plan: p.pack ? { pack: p.pack, pv: p.pv, start: p.start } : null, past: Array.isArray(p.past) ? p.past.length : 0,
      rings: (s.reminders || []).filter((x) => x.on !== false).map((x) => x.id + '@' + (x.time || '-')) }; });
  const census = async (day, label) => {
    const out = { who: w.id, label: w.label, age: w.age, day, cp: label, screens: {}, edge: !!w.edge };
    const tabs = ['home'].concat((await has('#tabbar [data-go="plan"]')) ? ['plan'] : []).concat(['diary', 'care', 'me']);
    for (const t of tabs) { if (t === 'home') { await go('home'); await note(); await dismiss(); } else await go(t); out.screens[t] = await page.evaluate(COUNT);
      await page.screenshot({ path: path.join(OUT, w.id + '-d' + String(day).padStart(3, '0') + '-' + label + '-' + t + '.png'), fullPage: true }); }
    out.rec = await records(); out.interrupt = seen; out.log = log.splice(0); seen = { tips: [], badges: [], sheets: [], toasts: [] };
    all.push(out);
    const tdy = out.screens.home || {};
    console.log(w.id.padEnd(9) + ' d' + String(day).padStart(3) + ' ' + label.padEnd(28) + ' Today ' + tdy.taps + ' taps/' + tdy.screens + ' scr/' + tdy.cards + ' cards · plan ' + (out.rec.plan ? out.rec.plan.pack + '@' + out.rec.plan.start : '-') + ' · rings ' + out.rec.rings.length + ' · tips ' + out.interrupt.tips.length + ' badges ' + out.interrupt.badges.length + (out.log.length ? ' · did: ' + out.log.join(', ') : ''));
  };

  if (w.under18) {
    await join(page, { name: 'Pooja', under18: true }); await settle(1000);
    const out = { who: w.id, label: w.label, age: w.age, day: 0, cp: 'under-18', screens: {} };
    for (const t of [null, 'learn']) { if (t) await go(t); out.screens[t || 'first'] = await page.evaluate(COUNT); await page.screenshot({ path: path.join(OUT, w.id + '-' + (t || 'first') + '.png'), fullPage: true }); }
    out.rec = {}; out.interrupt = await page.evaluate(INTERRUPT); all.push(out); console.log('pooja     under 18: ' + out.screens.first.hash + ' ' + out.screens.first.taps + ' taps');
    await ctx.close(); return;
  }
  /* joining, then sign-up, then Skip the tour */
  await join(page, Object.assign({ name: w.id[0].toUpperCase() + w.id.slice(1).replace(/-.*/, '') }, w.jo));
  if (w.jo.share && w.jo.share !== 'me') await settle(800);
  await page.waitForSelector('#su-num', { timeout: 10000 }); await page.fill('#su-num', '9876543210'); await click('#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, #ys-skip, .card.hero', { timeout: 10000 }).catch(() => {});
  if (await has('#su-done')) { await page.fill('#su-pin', '302001'); await click('#su-done'); await settle(800); }
  await settle(800); await note();
  if (await has('#ys-skip')) await click('#ys-skip');
  /* her days */
  const days = new Set([0].concat(Object.keys(w.steps).map(Number), Object.keys(w.cp).map(Number)));
  for (const [a, b, n] of w.active) for (let d = a; d <= b; d += n) days.add(d);
  for (const day of [...days].sort((x, y) => x - y)) {
    await page.clock.setSystemTime(at(day, '19:00')); await go('diary'); await home();
    for (const s of (w.steps[day] || [])) await doStep(s);
    if (w.tests && w.tests[day]) await doStep('test:' + w.tests[day]);
    if (w.active.some(([a, b, n]) => day >= a && day <= b && (day - a) % n === 0) || (w.plan && day === 0)) { const n = await ticks(); if (n) log.push('ticked ' + n); }
    if (w.cp[day]) await census(day, w.cp[day]);
  }
  if (errs.length) all.push({ who: w.id, cp: 'PAGE ERRORS', errs });
  await ctx.close();
}
const list = WOMEN.concat(process.env.EDGES === '0' ? [] : EDGES.map(edgeWoman));
for (const w of list) { if (only && only.indexOf(w.id) < 0 && only.indexOf(w.id.split('-')[0]) < 0) continue; try { await live(w); } catch (e) { console.log('WALK FAILED', w.id, String(e.message).slice(0, 300)); all.push({ who: w.id, cp: 'FAILED', errs: [String(e.message).slice(0, 300)] }); } }
await browser.close();
fs.writeFileSync(path.join(OUT, 'lives.json'), JSON.stringify(all, null, 1));

/* ---------- flags: what doesn't fit her, by rule ---------- */
const flags = [];
const F = (o, rule, where, line) => flags.push({ who: o.who, day: o.day, cp: o.cp, rule, where, line: String(line).slice(0, 220) });
const R = {
  midlife: /after 40|perimenopaus|menopaus|hot flush|night sweat|hormone therapy|\bHRT\b|bone scan|periods changing/i,
  teen: /first period|for girls|girls and parents/i,
  pregOnly: /register before 12 weeks|your four check-ups|baby'?s movements|labour|hospital bag|kick|trimester|week \d+ of your pregnancy|week \d+: what is new/i,
  predict: /next period|days until your next|fertile/i,
  periodWords: /period started|your period came|period kit|cramps routine|cycle day|in your cycle|period day/i,
  govt: /\bASHA\b|\bANM\b|free care near|Govt\.|government|scheme/i,
  ttcWords: /trying for a baby|getting ready for a baby|conceive|fertile/i,
  contra: /contracept/i
};
for (const o of all) {
  if (!o.screens || !o.rec) continue; const sit = o.rec.situation || {}; const care = o.rec.care; const pregnant = !!sit.pregnant; const stopped = !!sit.stopped;
  const born = sit.deliveredOn ? Math.round((new Date(iso(o.day)) - new Date(sit.deliveredOn)) / 86400000) : null; const earlyPost = born != null && born >= 0 && born <= 42 && !pregnant;
  const pw = pregnant && sit.pregnantSince ? Math.floor((new Date(iso(o.day)) - new Date(sit.pregnantSince)) / 86400000 / 7) : null;
  const midStage = !!sit.midlife || stopped;
  for (const [where, s] of Object.entries(o.screens)) {
    const lines = (s.lines || []);
    for (const ln of lines) {
      if (/from your first period to after menopause/i.test(ln)) continue;   /* Explore's line for every woman */
      if (o.age < 38 && !midStage && R.midlife.test(ln)) F(o, 'age: midlife words under 38', where, ln);
      if (o.age >= 25 && R.teen.test(ln)) F(o, 'age: girls\' words at 25+', where, ln);
      if (!pregnant && R.pregOnly.test(ln) && !(born != null && born >= 0 && born < 2) ) F(o, 'stage: pregnancy words when not pregnant', where, ln);
      if (pregnant && pw > 12 && /register before 12 weeks/i.test(ln)) F(o, 'week: "register before 12 weeks" after week 12', where, ln);
      if ((pregnant || stopped || earlyPost) && R.predict.test(ln) && !/not a way to avoid/i.test(ln)) F(o, 'stage: period estimates when they can\'t apply', where, ln);
      if (stopped && R.periodWords.test(ln)) F(o, 'stage: period words after periods stopped', where, ln);
      if (care !== 'govt' && care !== 'asha' && R.govt.test(ln)) F(o, 'care: government/ASHA words without that answer', where, ln);
      if ((o.age >= 50 || stopped || pregnant || earlyPost) && R.ttcWords.test(ln) && !/unplanned/i.test(ln)) F(o, 'stage/age: trying-for-a-baby words', where, ln);
      if (stopped && o.age >= 55 && R.contra.test(ln)) F(o, 'age: contraception after 55 with periods stopped', where, ln);
    }
    if (where === 'home' && (s.screens > 1.5 || s.cards > 4 || s.taps > 25)) F(o, 'budget: Today over 1.5 screens, 4 cards or 25 taps', where, s.taps + ' taps, ' + s.screens + ' screens, ' + s.cards + ' cards');
    if (where === 'care' && s.screens > 1.5) F(o, 'budget: Explore over 1.5 screens', where, s.taps + ' taps, ' + s.screens + ' screens');
  }
  const homes = {}; for (const [where, s] of Object.entries(o.screens)) for (const g of new Set(s.goes || [])) if (['home', 'plan', 'diary', 'care', 'me', 'help'].indexOf(g) < 0) (homes[g] = homes[g] || []).push(where);
  for (const [g, ws] of Object.entries(homes)) if (ws.length > 1) F(o, 'one home: the same page on two tabs', ws.join('+'), g);
  const it = o.interrupt || {}; if ((it.tips || []).length + (it.badges || []).length > 1) F(o, 'interruptions: more than one tip or badge since the last checkpoint', 'home', (it.tips || []).concat(it.badges || []).join(' || '));
  if ((o.rec.rings || []).length > 4) F(o, 'rings: more than 4 reminders on', 'me', o.rec.rings.join(', '));
}
const byRule = {}; for (const f of flags) (byRule[f.rule] = byRule[f.rule] || []).push(f);
const txt = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length).map(([r, fs]) => '## ' + r + ' (' + fs.length + ', women: ' + [...new Set(fs.map((f) => f.who))].join(', ') + ')\n' + fs.map((f) => '  ' + f.who + ' d' + f.day + ' ' + f.cp + ' [' + f.where + '] ' + f.line).join('\n')).join('\n\n');
fs.writeFileSync(path.join(OUT, 'flags.txt'), txt + '\n');
fs.writeFileSync(path.join(OUT, 'lives.txt'), all.map((o) => o.screens ? ('== ' + o.who + ' d' + o.day + ' ' + o.cp + ' · ' + (o.label || '') + '\n' + Object.entries(o.screens).map(([k, s]) => '  [' + k + '] ' + s.taps + ' taps, ' + s.screens + ' scr, ' + s.cards + ' cards\n' + (s.cardText || []).map((c) => '     · ' + c).join('\n')).join('\n') + '\n  rings: ' + ((o.rec || {}).rings || []).join(', ') + '\n  interrupted: ' + JSON.stringify(o.interrupt || {}).slice(0, 600) + '\n  did: ' + (o.log || []).join(', ')) : ('== ' + o.who + ' ' + o.cp + ' ' + JSON.stringify(o.errs || []))).join('\n') + '\n');
console.log('\nFLAGS by rule:'); for (const [r, fs] of Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)) console.log('  ' + String(fs.length).padStart(4) + '  ' + r + '  (' + [...new Set(fs.map((f) => f.who))].join(', ') + ')');
