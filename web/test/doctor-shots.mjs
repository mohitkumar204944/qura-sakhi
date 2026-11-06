// The doctor shots (6 Nov 2026; Mohit: "create a page along with screenshots where it is mentioned today and i will [choose] out of
// options where it should be qura doctor and where it should be govt. doctor"). Not pass/fail. For each place in
// docs/doctor-choice-audit-2026-11-06.md it photographs the screen as she sees it on a 360 px phone, with every line that names a
// Qura doctor outlined in purple, government care in green, and "See a gynaecologist" / "See a doctor" (which opens the government
// list) in orange. A place whose words change with her answer to "Where do you usually go for women's health?" gets two shots: a
// private doctor, and a government hospital. Then it writes the choice page (index.html) beside the shots.
// Usage: node test/doctor-shots.mjs [web dir]. Output: test/shots/doctor-shots/ (index.html, s/*.jpg, missing.txt).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { ROWS, SECTIONS } from './doctor-rows.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const OUT = path.join(here, 'shots', 'doctor-shots'); fs.mkdirSync(path.join(OUT, 's'), { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 360, H = 800, DSF = 1.5;
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const PILOT = { app: '0.39.76-pilot', platform: 'android' };
const DEMO = { app: '0.39.76-demo', platform: 'android' };   /* the stand-in server answers, so the call form opens */

/* ---------- seeds for the plans' cards (as test/ladder.mjs, test/midlife.mjs, test/baby.mjs and test/behave.mjs build them) ---------- */
const TODAY = '2026-11-06';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya', pincode: '302001', activeOn: TODAY };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const gaps42 = () => [120, 78, 36].reduce((o, x) => o.concat([{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), []);
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, goals: ['pain'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '9.99', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [] }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' }, o || {});
const pmosS = (startAgo, ik, x) => Object.assign({ dob: '1998-05-01', situation: { pcos: true }, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' },
  mods: { plan: planOf('cycle', 'pmos', startAgo, { weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true, seenM: true } }, intake: CIK(ik) }) }, reminders: [planRem(startAgo)] }, x || {});
const mAns = (g) => ({ goal: g, stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' });
const m2 = (g, startAgo, x) => Object.assign({ dob: '1975-03-01', situation: { stopped: true }, intake: { goal: g, stage: 'meno' }, events: regular(400), goals: ['meno', g],
  mods: { plan: planOf('meno', g, startAgo, { pv: 2, intake: mAns(g), doc: 'done' }) }, reminders: [planRem(startAgo)] }, x || {});
const IK = (o) => Object.assign({ at: ago(1), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' }, o || {});
const baby = (startAgo, ik) => ({ situation: { planning: true }, goals: ['ttc', 'ready'], intake: ik, mods: { plan: Object.assign(planOf('ttc', 'ready', startAgo, { pv: 2, when: 'evening', intake: ik })) }, reminders: [planRem(startAgo)] });
const SEEDS = {
  pmos0: () => seedOf({ dob: '1998-05-01', situation: { pcos: true }, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' } }),
  pmos10: () => seedOf(pmosS(10)),
  pmos86: () => seedOf(pmosS(86)),
  pmos35doc: () => seedOf(pmosS(35, { skips: 'y' })),
  pmos2call: () => { const s = seedOf(pmosS(2)); s.prompts = { setup: 'off', firstLog: ago(30), notifyAuto: ago(30) }; return s; },
  baby2: () => seedOf(baby(2, IK({ bdoc: 'gyn' }))),
  poi: () => seedOf({ dob: '1989-03-01', situation: { stopped: true, midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400), mods: { plan: planOf('meno', 'hot', 2, { pv: 2, intake: mAns('hot') }) }, reminders: [planRem(2)] }),
  mid22: () => seedOf(m2('hot', 22)),
  mid80: () => seedOf(m2('hot', 80))
};

/* ---------- the browser ---------- */
const browser = await chromium.launch();
const missing = []; const errs = [];
async function ctxFor(cfg, seed) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(cfg) + ';');
  await ctx.addInitScript(AUDIO); await ctx.addInitScript(ANDROID);
  if (seed) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  if (seed) await page.clock.install({ time: new Date(TODAY + 'T10:00:00+05:30') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  if (seed) for (let i = 0; i < 8; i++) { await page.clock.runFor(100); await sleep(10); }
  return { ctx, page, seeded: !!seed };
}
const pilot = await ctxFor(PILOT); const demo = await ctxFor(DEMO);
const SAMPLE = { priya: ['priya', {}], asha: ['asha', {}], 'asha-ttc': ['asha', { planning: true }], meera: ['meera', {}], sunita: ['sunita', {}], kamla: ['kamla', {}], 'kamla-meno': ['kamla', { stopped: true }] };
const loadSample = (page, who, care) => page.evaluate(([p, sit, care]) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); S.reset(); if (S.account) S.account._testSignIn(); S.loadSample(p); const st = S.state; st.lang = 'en'; st.langChosen = true;
  st.settings.toursAuto = false; st.fullTour = { st: 'done', d: S.toISO(S.today()) }; st.whatsNew = '9.99'; st.situation = st.situation || {}; Object.assign(st.situation, sit);
  st.situation.care = care; S.save(); location.hash = '#home'; S.render(); }, [SAMPLE[who][0], SAMPLE[who][1], care]);
const wait = async (a, ms) => { if (a.seeded) { for (let i = 0; i < Math.ceil(ms / 100); i++) { await a.page.clock.runFor(100); await sleep(10); } } else await sleep(ms); };
const goTo = (page, r) => page.evaluate((r) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); window.scrollTo(0, 0); if (location.hash === '#' + r) S.render(); else location.hash = '#' + r; S.render(); }, r);

/* mark the doctor lines; scroll the focus near the top; returns how many marks and whether the focus was found */
const GOVT = 'government|govt|\\bPHC\\b|\\bCHC\\b|\\bASHA\\b|\\bANM\\b|Ayushman|Arogya Mandir|eSanjeevani|Janani|\\bJSY\\b|\\bJSSK\\b|PMSMA|PMMVY|Anganwadi|district hospital|free doctor|health centre|Jan Aushadhi|\\b104\\b|Suraksha|\\bICTC\\b|AFHC|Mala-N|Nishchay|sub-centre|Free doctor or hospital|LaQshya|Anemia Mukt';
const mark = (page, o) => page.evaluate(([o, gsrc]) => {
  const Q = /Qura(?!\s*Sakhi)/, G = new RegExp(gsrc, 'i'), Y = /^(See a gynaecologist|See a doctor|Free doctor or hospital)/;
  const roots = [o.sheet ? null : document.getElementById('view'), document.getElementById('sheet-root')].filter(Boolean);
  const BLOCK = 'p, li, h1, h2, h3, h4, button, a, summary, td, th, dd, dt, label, .item, .chip, .eyebrow, .small';
  const marks = new Map(); const add = (el, k) => { if (!el) return; const s = marks.get(el) || new Set(); s.add(k); marks.set(el, s); };
  for (const r of roots) {
    const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const tx = n.nodeValue || ''; if (!tx.trim()) continue; const el = n.parentElement && (n.parentElement.closest(BLOCK) || n.parentElement);
      if (!el || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
      if (Q.test(tx)) add(el, 'q'); if (G.test(tx)) add(el, 'g'); }
    r.querySelectorAll('[data-ask], [data-go="ask"], [data-go="ask-call"], a[href*="quranutrition"], a[href*="wa.me"], #hs-doc').forEach((b) => add(b, 'q'));
    r.querySelectorAll('button, a').forEach((b) => { if (Y.test((b.innerText || '').trim())) add(b, 'y'); });
  }
  /* an outer mark hides the inner ones: keep the innermost of each line */
  const els = [...marks.keys()].filter((e) => ![...marks.keys()].some((x) => x !== e && e.contains(x) && [...marks.get(e)].every((k) => marks.get(x).has(k))));
  const COL = { q: '#7c3aed', g: '#059669', y: '#ea580c' };
  els.forEach((e) => { const ks = [...marks.get(e)]; const c = ks.map((k) => COL[k]);
    e.style.outline = '3px solid ' + c[0]; e.style.outlineOffset = '2px'; e.style.borderRadius = e.style.borderRadius || '6px';
    if (c[1]) e.style.boxShadow = '0 0 0 7px ' + c[1]; });
  let f = null;
  if (o.focus) { const fs = o.focus; f = fs.charAt(0) === '.' || fs.charAt(0) === '#' || fs.charAt(0) === '[' ? document.querySelector('#view ' + fs) || document.querySelector(fs) : null;
    if (!f) { const all = [...document.querySelectorAll('#view *, #sheet-root *')].filter((e) => e.children.length < 6 && (e.innerText || '').indexOf(fs) >= 0); f = all[all.length - 1] || null; } }
  if (!f && !o.focus) f = els.slice().sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0] || null;
  if (f && !o.sheet) { const y = f.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, Math.max(0, y - (o.top || 120))); }
  return { marks: els.length, focus: !!f || !o.focus };
}, [o, GOVT]);

async function shoot(row, s, care, a) {
  const file = 's/' + row.id + (s.k ? '-' + s.k : '') + '-' + care + '.jpg';
  if (s.go) await goTo(a.page, s.go);
  await wait(a, 250);
  if (s.act === 'help') { await goTo(a.page, 'home'); await wait(a, 150); await a.page.evaluate(() => { const b = document.getElementById('help-btn'); if (b) b.click(); }); await wait(a, 250); }
  if (s.act && s.act.indexOf('search:') === 0) { await goTo(a.page, 'care'); await wait(a, 150); await a.page.evaluate((q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); }, s.act.slice(7)); await wait(a, 250); }
  if (s.act === 'mecare') { await goTo(a.page, 'me'); await wait(a, 150); await a.page.evaluate(() => { const b = document.getElementById('me-care'); if (b) b.click(); }); await wait(a, 250); }
  if (s.act && s.act.indexOf('mem:') === 0) { const [k, v, r] = s.act.slice(4).split(','); await a.page.evaluate(([k, v, r]) => { window.Saathi.mem[k] = v; location.hash = '#' + r; window.Saathi.render(); }, [k, v, r]); await wait(a, 250); }
  if (s.act === 'start') { await a.page.evaluate((ans) => { const S = window.Saathi; S.plan.startFromIntake(ans); S.save(); location.hash = '#plan-reveal'; S.render(); }, s.ans); await wait(a, 400); }
  if (s.act === 'open') await a.page.evaluate((sel) => { document.querySelectorAll(sel).forEach((d) => { d.open = true; }); }, s.sel);
  await wait(a, 150);
  const m = await mark(a.page, { focus: s.focus, sheet: s.act === 'help' || s.act === 'mecare' && !!(await a.page.$('#sheet-root .sheet')), top: s.top });
  await wait(a, 120);
  await a.page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 62 });
  if (!m.focus || !m.marks) missing.push(row.id + ' ' + care + ' ' + (s.go || s.act) + ': ' + (!m.focus ? 'focus "' + s.focus + '" not found' : 'no mark'));
  return { file, care, marks: m.marks, ok: m.focus && m.marks > 0 };
}

/* ONLY=C1,C3 retakes those rows and keeps the rest of the last run */
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const out = ONLY && fs.existsSync(path.join(OUT, 'shots.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'shots.json'), 'utf8')) : {};
for (const row of ROWS) {
  if (ONLY && ONLY.indexOf(row.id) < 0) continue;
  out[row.id] = [];
  for (const s of row.shots || []) {
    for (const care of s.care || ['private']) {
      let a;
      if (s.seed) { const seed = SEEDS[s.seed](); seed.situation = Object.assign({}, seed.situation, { care }); a = await ctxFor(PILOT, seed); }
      else { a = s.demo ? demo : pilot; await loadSample(a.page, s.who || 'asha', care); await wait(a, 150); }
      try { out[row.id].push(Object.assign({ cap: s.cap || '' }, await shoot(row, s, care, a))); }
      catch (e) { missing.push(row.id + ' ' + care + ': ' + String(e.message).slice(0, 120)); }
      if (s.seed) await a.ctx.close();
    }
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'shots.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(OUT, 'missing.txt'), missing.join('\n') + '\n\npage errors:\n' + [...new Set(errs)].join('\n'));
const n = Object.values(out).reduce((k, v) => k + v.length, 0);
console.log(JSON.stringify({ rows: ROWS.length, shots: n, missing: missing.length, errs: errs.length }));
