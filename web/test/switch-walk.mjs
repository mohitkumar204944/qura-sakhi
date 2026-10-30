// Stages and plans changed on the way, and every page kept in step (Mohit, 30 Oct: "can you do proper thorough check by
// walkthrough navigating between different stages and using different programs etc. for all four programs built and make
// sure everything sync properly home, diary, my plan etc."). Four women join on a 360 x 800 phone and change their stage and
// their plan the way she would (the stage sheet, My plan's settings, a test result, "My baby is born", "My baby has died",
// a period logged). After each change: Today, My plan, the Diary (Calendar, Cycles, Days), Me, Explore, what rings on the
// phone, and what Sakhi saved. Each checkpoint is checked for pages that disagree:
//   - her stage: Today's card, Me and the Diary say the same stage;
//   - her plan: Today's plan card, My plan and the saved plan name the same plan, or none;
//   - her reminders: only those of what runs (a plan's check-in, walk and wind-down; her tablet; her 6-week check);
//   - and page errors, string keys, sideways scroll, a line said twice.
// Not pass/fail: screens and each checkpoint's words to test/shots/switch-walk/ (gitignored), with the flags.
// Usage: node test/switch-walk.mjs [only]   (only: priya | neha | riya | meera)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ONLY = process.argv[2] || null;
const SHOTS = path.join(here, 'shots', 'switch-walk'); fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at2 = (day, hm) => new Date(day + 'T' + hm + ':00+05:30');
const LOCAL = { app: '0.39.47-pilot', platform: 'android' };
const BRIDGE = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const KEYS = /\b(plan|preg|pregtools|ttc|food|post|pst|ci|hs|fx|rv|pg|pf|mcp|ob|ys|fl|td|tour|qa|late|bb|st|slot|today|dy|cal|stage|me|xp|explain)_[a-z0-9_]{2,}\b/;
const browser = await chromium.launch();
const flags = []; const errsAll = []; const LOG = {};
const flag = (who, tag, what) => { flags.push(who + ' ' + tag + ': ' + what); };

async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
async function open() {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(BRIDGE);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 240)));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 240)); });
  await page.clock.install({ time: at2(TODAY, '10:00') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1000);
  return { ctx, page, errs };
}
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 600); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 500); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const hashOf = (a) => a.page.evaluate(() => location.hash);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText).catch(() => '');
const flat = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function closeTips(a) {
  for (let k = 0; k < 6; k++) {
    const did = await a.page.evaluate(() => { const b = document.querySelector('#tour-root #tour-later, #tour-root #tour-next'); if (b) { b.click(); return true; }
      const n = [...document.querySelectorAll('.tour-pop button')].find((x) => /Not now|Later|Close|Skip/i.test(x.textContent || '')); if (n) { n.click(); return true; } return false; });
    if (!did) break; await settle(a.page, 300);
  }
  const sh = await a.page.evaluate(() => { const r = document.querySelector('#sheet-root'); return r && r.innerText.trim() ? r.innerText.replace(/\s+/g, ' ').slice(0, 160) : ''; });
  if (sh) { await a.page.keyboard.press('Escape'); await settle(a.page, 300); }
  return sh;
}
/* the day moves on: she opens Sakhi at this time */
const dayTo = async (a, n, hm) => { await a.page.clock.setSystemTime(at2(iso(TODAY, n), hm || '10:00')); await go(a, 'diary'); await go(a, 'home'); await closeTips(a); };
/* the stage sheet, as she uses it from Today */
async function stageTo(a, pick, o = {}) {
  await go(a, 'home'); await closeTips(a);
  if (!(await has(a, '#stage-btn'))) return 'no Change stage on Today';
  await tap(a, '#stage-btn'); await tap(a, '#sheet-root [data-stage="' + pick + '"]');
  if (o.lmp) await a.page.$eval('#st-lmp', (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }, o.lmp);
  if (o.birth) await a.page.$eval('#st-birth', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, o.birth);
  if (o.bf != null && (await has(a, '#st-bf'))) await a.page.$eval('#st-bf', (el, v) => { el.checked = v; el.dispatchEvent(new Event('change')); }, o.bf);
  if (o.end) await tap(a, '#sheet-root [data-st-end="' + o.end + '"]');
  await tap(a, '#st-save'); await settle(a.page, 900);
  const left = await a.page.evaluate(() => { const r = document.querySelector('#sheet-root'); return r && r.innerText.trim() ? r.innerText.replace(/\s+/g, ' ').slice(0, 200) : ''; });
  await go(a, 'home'); await closeTips(a);
  if (left && /What happened\?/.test(left) && (pick === 'cycle' || pick === 'ttc')) { await a.page.keyboard.press('Escape'); await settle(a.page, 300); return ''; }   /* after a birth: "Log the day your periods came back" (Version 39.48) */
  return left ? 'sheet still open: ' + left : '';
}
/* her plan's own questions, the reveal's cards, Start */
async function startFlow(a, goal, when) {
  for (let i = 0; i < 14; i++) {
    if ((await hashOf(a)) === '#plan-reveal') break;
    if (await has(a, '#pl-in-make')) { await tap(a, '#pl-in-make'); continue; }
    if (await has(a, '[data-pl-goal]')) { await tap(a, (goal && (await has(a, '[data-pl-goal="' + goal + '"]'))) ? '[data-pl-goal="' + goal + '"]' : '[data-pl-goal]'); continue; }
    if ((await has(a, '[data-pl-pnow]')) && !(await has(a, '[data-pl-pnow].on'))) await tap(a, '[data-pl-pnow="n"]');
    if (await has(a, '[data-pl-when]')) { await tap(a, '[data-pl-when="' + (when || 'evening') + '"]'); continue; }
    await a.page.evaluate(() => { const pref = { act: '0', food: 'veg', milk: 'y', lim: 'none', bed: 'b24', work: 'day', skips: 'n', signs: 'none', dx: 'y', trying: 'lt6', gap: 'g45', pain: 'pk', painDays: '23' };
      const groups = {}; document.querySelectorAll('#view [data-pl-q], #view [data-pl-m]').forEach((b) => { const raw = b.dataset.plQ || b.dataset.plM || ''; const k = raw.split(':')[0]; (groups[k] = groups[k] || []).push(b); });
      Object.entries(groups).forEach(([k, bs]) => { if (bs.some((b) => b.classList.contains('on'))) return; (bs.find((b) => (b.dataset.plQ || b.dataset.plM).split(':')[1] === pref[k]) || bs[0]).click(); }); });
    await settle(a.page, 300);
    if (await has(a, '#pl-in-next')) await tap(a, '#pl-in-next'); else break;
  }
  if ((await hashOf(a)) !== '#plan-reveal') return 'no reveal (' + (await hashOf(a)) + ')';
  for (let i = 0; i < 10 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go'); await settle(a.page, 900); await go(a, 'home'); await closeTips(a); return '';
}

/* ---------- one checkpoint: every page, what rings, what is saved, and the pages that disagree ---------- */
const STAGE_HERO = { preg: /PREGNANT|weeks pregnant/, post: /AFTER BIRTH|since (your baby was )?(born|birth)/, cycle: /CYCLE DAY|Cycle day|Period · day|Log the day your last period|Your period is \d+ days? late|past your likely range|YOUR NEXT PERIOD/, ttc: /CYCLE DAY|Cycle day|Period · day|Log the day your last period|Your period is \d+ days? late|past your likely range/, meno: /./ };
const PACK_NAME = { cycle: /MY PMOS PLAN|MY CYCLE PLAN|PMOS PLAN|CYCLE PLAN/, pain: /EASIER PERIODS/, heavy: /HEAVY/, pms: /PERIOD|MOOD/, ttc: /GETTING READY/, preg: /MY PREGNANCY PLAN/, post: /MY RECOVERY PLAN/ };
async function checkpoint(a, w, tag, note) {
  const who = w.who; const rec = { tag, note: note || '', day: await a.page.evaluate(() => window.Saathi.toISO(window.Saathi.today())) };
  await go(a, 'home'); rec.sheet = await closeTips(a);
  const shot = async (nm) => { await a.page.screenshot({ path: path.join(SHOTS, who + '-' + tag + '-' + nm + '.png'), fullPage: true }); };
  const look = async (route, nm, tab) => {
    await go(a, route); await closeTips(a); if (tab && (await has(a, '[data-tab="' + tab + '"]'))) await tap(a, '[data-tab="' + tab + '"]');
    const v = await txt(a, '#view'); const k = v.match(KEYS); if (k) flag(who, tag, nm + ': string key "' + k[0] + '"');
    if (!(await noScroll(a))) flag(who, tag, nm + ': scrolls sideways');
    if (!v || v.trim().length < 40) flag(who, tag, nm + ': empty view');
    if (/\bundefined\b|\bNaN\b|\{[a-z_]+\}|\[object/.test(v)) flag(who, tag, nm + ': placeholder');
    const seen = {}; v.split('\n').map((x) => x.trim()).filter((x) => x.length > 30).forEach((x) => { seen[x] = (seen[x] || 0) + 1; }); const tw = Object.keys(seen).filter((x) => seen[x] > 1); if (tw.length) flag(who, tag, nm + ': said twice "' + tw[0].slice(0, 90) + '"');
    if (a.errs.length) { flag(who, tag, nm + ': page errors ' + a.errs.join(' / ').slice(0, 300)); errsAll.push(...a.errs.map((e) => who + ' ' + tag + ' ' + nm + ': ' + e)); a.errs.length = 0; }
    await shot(nm); return v;
  };
  rec.today = await look('home', '1-today');
  rec.myplan = await look('plan', '2-myplan');
  rec.cal = await look('diary', '3-diary-cal', 'cal'); rec.cycles = await look('diary', '4-diary-cycles', 'tr'); rec.days = await look('diary', '5-diary-days', 'days');
  rec.me = await look('me', '6-me'); rec.explore = await look('care', '7-explore');
  await go(a, 'home');
  rec.s = await a.page.evaluate(() => { const S = window.Saathi; const st = S.state; const p = (st.mods || {}).plan || {}; return {
    stage: (function () { try { return S.stageNow ? S.stageNow() : null; } catch (e) { return null; } })(), sit: st.situation, focus: st.focus || null,
    plan: p.pack ? { pack: p.pack, pv: p.pv, goal: p.goalKey, start: p.start, go: p.go, pause: p.pauseUntil || p.paused || null, next: p.next ? p.next.pack + '@' + (p.next.pv || 1) : null, chg: p.chg || null, past: (p.past || []).map((x) => x.pack + ':' + x.start + '..' + x.end) } : (p.past ? { past: (p.past || []).map((x) => x.pack + ':' + x.start + '..' + x.end) } : null),
    steps: S.plan && S.plan.actions ? S.plan.actions().map((x) => x.id) : [],
    rem: S.reminders.list().map((r) => r.id + (r.on === false ? '(off)' : '') + '@' + (r.time || '') + (r.title && r.title.en ? ' "' + r.title.en + '"' : '')) }; });
  rec.rings = await a.page.evaluate(() => { const s = (window.__calls || []).filter((c) => c[0] === 'schedule'); if (!s.length) return []; const all = JSON.parse(s[s.length - 1][1]); const now = Date.now();
    return all.filter((x) => x.at - now < 48 * 3600e3).sort((x, y) => x.at - y.at).map((x) => { const d = new Date(x.at); return d.toLocaleString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) + ' ' + x.body + ' →' + (x.go || ''); }); });
  /* the pages that disagree */
  const sit = rec.s.sit || {}; const stage = sit.pregnant ? 'preg' : rec.s.stage;
  const hero = flat(rec.today).slice(0, 400);
  if (STAGE_HERO[stage] && !STAGE_HERO[stage].test(hero)) flag(who, tag, 'Today\'s card doesn\'t show her stage (' + stage + '): "' + hero.slice(0, 120) + '"');
  if (stage !== 'preg' && /PREGNANT\b|weeks pregnant/.test(hero)) flag(who, tag, 'Today says pregnant, but her stage is ' + stage);
  if (stage !== 'post' && /AFTER BIRTH/.test(hero)) flag(who, tag, 'Today says after birth, but her stage is ' + stage);
  const p = rec.s.plan && rec.s.plan.pack ? rec.s.plan : null; const tday = flat(rec.today); const mp = flat(rec.myplan);
  const held = /Your plan has changed|Your plan is resting for now/.test(tday + ' ' + mp) || !rec.s.steps.length; const offered = /Not trying for a baby now\?|Trying for a baby now\?|A different plan may fit now|Your plan has changed/.test(tday);
  const running = p && p.go && p.start && p.start <= rec.day && !p.pause && !held;
  if (running) {
    const re = PACK_NAME[p.pack === 'cycle' && p.goal !== 'pmos' && p.goal !== 'irregular' ? p.goal : p.pack] || PACK_NAME[p.pack];
    if (re && !re.test(tday.toUpperCase()) && !/Your plan has changed/.test(tday)) flag(who, tag, 'Today\'s plan card doesn\'t name her plan (' + p.pack + '/' + p.goal + ')');
    if (!/Your plan has changed/.test(mp) && /What do you want to work on\?/.test(mp.slice(0, 200))) flag(who, tag, 'My plan shows the plan picker while ' + p.pack + ' runs');
    if (!rec.s.rem.some((r) => /^plan@/.test(r))) flag(who, tag, 'her plan runs (' + p.pack + '), but no evening check-in reminder');
  } else {
    if (/MY (PMOS|CYCLE|PREGNANCY|RECOVERY) PLAN · WEEK|GETTING READY FOR A BABY · WEEK/.test(tday)) flag(who, tag, 'Today shows a plan card, but no plan runs');
    const pr = rec.rings.filter((r) => /How did today go|Your time to move|Time for your walk|Time to wind down|Yoga before you eat|Your recovery check/.test(r));
    if (pr.length) flag(who, tag, 'no plan runs, but its reminders still ring: ' + pr.slice(0, 3).join(' | '));
  }
  if (p && p.pack === 'ttc' && running && stage !== 'ttc' && !offered) flag(who, tag, 'Getting ready runs while her stage is ' + stage + ', and nothing offers the plan for now');
  if (p && ['cycle', 'pain', 'heavy', 'pms'].indexOf(p.pack) >= 0 && running && stage === 'ttc' && !offered) flag(who, tag, 'a period plan runs while she tries for a baby, and nothing offers Getting ready');
  if (p && p.pack === 'preg' && running && stage !== 'preg') flag(who, tag, 'My pregnancy runs while her stage is ' + stage);
  const born = sit.deliveredOn; const inYear = born && (new Date(rec.day) - new Date(born)) / 864e5 <= 365;
  if (p && p.pack === 'post' && running && stage !== 'post' && !(stage === 'cycle' && inYear)) flag(who, tag, 'My recovery plan runs while her stage is ' + stage);   /* her period back: her recovery plan runs on to the first birthday */
  if (rec.s.rem.some((r) => /^ttc-folic@/.test(r)) && !(running && (p.pack === 'ttc' || p.pack === 'preg')) && stage !== 'preg') flag(who, tag, 'her folic acid reminder rings without its plan (' + (p ? p.pack : 'none') + ')');   /* in a pregnancy after Getting ready it rings to 12 weeks (Version 39.47) */
  if (rec.s.rem.some((r) => /^post-6wk@/.test(r)) && stage !== 'post') flag(who, tag, 'her 6-week check reminder rings, but her stage is ' + stage);
  const cal = flat(rec.cal); const cyc = flat(rec.cycles);
  if (stage === 'preg' && /Predicted period|days until your next period|Likely next/.test(cal + ' ' + tday)) flag(who, tag, 'pregnant, but a next period is predicted');
  if (stage === 'preg' && /Next period date Likely/.test(cyc)) flag(who, tag, 'pregnant, but Cycles gives a next period date');
  const me = flat(rec.me); const meStage = (me.match(/(Tracking my periods|Trying for a baby|I am pregnant|Pregnant|I had a baby|After birth|Periods changing after 40|Menopause|My periods have stopped)/) || [])[1] || '';
  rec.meStage = meStage;
  const ME_OK = { preg: /pregnant/i, post: /baby|birth/i, ttc: /Trying/, cycle: /Tracking/, meno: /40|Menopause|stopped/ };
  if (meStage && ME_OK[stage] && !ME_OK[stage].test(meStage)) flag(who, tag, 'Me says "' + meStage + '", but her stage is ' + stage);
  LOG[who].push(rec);
  console.log('  ' + tag + ' ' + rec.day + ' | stage ' + stage + ' | plan ' + (p ? p.pack + '/' + p.goal + (running ? '' : ' (not running)') : 'none') + ' | steps ' + rec.s.steps.join(',') + ' | rem ' + rec.s.rem.map((r) => r.split('@')[0]).join(','));
  return rec;
}
async function signUp(a) {
  await a.page.waitForSelector('#su-num', { timeout: 10000 }); await a.page.fill('#su-num', '9876543210'); await tap(a, '#su-send');
  await a.page.waitForSelector('#su-code', { timeout: 10000 }); await a.page.fill('#su-code', '123456');
  await a.page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 10000 }); if (await has(a, '#su-done')) { await a.page.fill('#su-pin', '302001'); await tap(a, '#su-done'); }
  await settle(a.page, 900); if (await has(a, '#ys-skip')) await tap(a, '#ys-skip');
}
async function firstLogAndOffer(a) {
  await go(a, 'diary'); await closeTips(a);
  if (await has(a, '#fl-save')) { if (await has(a, '[data-fl-days="5"]')) await tap(a, '[data-fl-days="5"]'); if (await has(a, '[data-fl-sign="d_tired"]')) await tap(a, '[data-fl-sign="d_tired"]'); await tap(a, '#fl-save'); }
  else if (await has(a, '[data-fl-go]')) await tap(a, '[data-fl-go]');
  await go(a, 'home'); await closeTips(a);
  for (const sel of ['#pl-off-go', '#view section.slot [data-xp-off]', '#view section.slot [data-xp-plan]']) if (await has(a, sel)) { await tap(a, sel); return ''; }
  return 'no plan offer on Today';
}

/* ---------- the four women ---------- */
const JOURNEYS = {
  /* PMOS, then the painful-periods plan, a pause, trying for a baby, and tracking again */
  priya: async (w, a) => {
    await join(a.page, { lang: 'en', name: 'Priya', tile: 'pmos', goals: ['irregular'], dx: 'y', dates: [ago(120), ago(78), ago(36)], dlen: 5, care: 'private', stop: 'share' });
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    let e = await firstLogAndOffer(a); if (e) flag(w.who, 'A1', e); e = await startFlow(a, 'pmos', 'dinner'); if (e) flag(w.who, 'A1', e);
    await checkpoint(a, w, 'A1', 'joined, My PMOS plan day 1');
    await dayTo(a, 9); await go(a, 'plan-settings'); await tap(a, '#pl-chg'); e = await startFlow(a, 'pain', 'evening'); if (e) flag(w.who, 'A2', e);
    await checkpoint(a, w, 'A2', 'day 10: changed her plan to Painful periods (My plan > settings > change)');
    await dayTo(a, 11); await go(a, 'plan-settings'); if (await has(a, '#pl-pause')) await tap(a, '#pl-pause'); else flag(w.who, 'A3', 'no Pause in settings');
    await checkpoint(a, w, 'A3', 'day 12: paused for a week');
    await dayTo(a, 14); for (const r of ['home', 'plan', 'plan-settings']) { await go(a, r); if (await has(a, '#pl-unpause')) { await tap(a, '#pl-unpause'); break; } }
    await checkpoint(a, w, 'A4', 'day 15: back from the pause');
    await dayTo(a, 19); e = await stageTo(a, 'ttc'); if (e) flag(w.who, 'A5', e);
    await checkpoint(a, w, 'A5', 'day 20: changed her stage to Trying for a baby');
    const offer = (await has(a, '#pl-off-go')) || (await has(a, '#pl-chg-go'));
    if (offer) { await tap(a, (await has(a, '#pl-chg-go')) ? '#pl-chg-go' : '#pl-off-go'); e = await startFlow(a, 'ready', 'evening'); if (e) flag(w.who, 'A6', e); }
    else { await go(a, 'plan-settings'); if (await has(a, '#pl-chg')) { await tap(a, '#pl-chg'); e = await startFlow(a, 'ready', 'evening'); if (e) flag(w.who, 'A6', e); } }
    await checkpoint(a, w, 'A6', 'day 20: Getting ready started (' + (offer ? 'from Today\'s offer' : 'from My plan > change') + ')');
    await dayTo(a, 34); e = await stageTo(a, 'cycle'); if (e) flag(w.who, 'A7', e);
    await checkpoint(a, w, 'A7', 'day 35: changed her stage back to Tracking my periods');
    if (await has(a, '#pl-fit-go')) {
      await tap(a, '#pl-fit-go'); e = await startFlow(a, 'pain', 'evening'); if (e) flag(w.who, 'A7b', e);
      await checkpoint(a, w, 'A7b', 'day 35: "Not trying for a baby now?" > Choose my plan > Easier periods');
    } else if (await has(a, '#ex-go')) {
      await tap(a, '#ex-go'); const upd = [];
      for (let i = 0; i < 10; i++) {
        const h = await hashOf(a); upd.push(h + ' :: ' + flat(await txt(a, '#view')).slice(0, 160) + ' :: ' + (await a.page.$$eval('[data-ob-st], [data-ob-goal], #ob-next, #ob-done, #ob-care-go, [data-ob-sh]', (xs) => xs.map((x) => x.id || x.dataset.obSt || x.dataset.obGoal || x.dataset.obSh).join(','))).slice(0, 160));
        if (h === '#home' || h === '#plan-goal' || h === '#plan-reveal') break;
        if ((await has(a, '[data-ob-st="pmos"]')) && !(await has(a, '[data-ob-goal]'))) { await tap(a, '[data-ob-st="pmos"]'); continue; }   /* a tile moves on by itself */
        if ((await has(a, '[data-ob-goal="pain"]')) && !(await has(a, '[data-ob-goal="pain"].on'))) { await tap(a, '[data-ob-goal="pain"]'); continue; }
        if ((await has(a, '[data-ob-dx="y"]')) && !(await has(a, '[data-ob-dx].on'))) { await tap(a, '[data-ob-dx="y"]'); continue; }
        if (await has(a, '#ob-done')) { await tap(a, '#ob-done'); continue; }
        if (await has(a, '#ob-next')) { await tap(a, '#ob-next'); continue; }
        if (await has(a, '#ob-care-go')) { await tap(a, '#ob-care-go'); continue; }
        if (await has(a, '[data-ob-sh="me"]')) { await tap(a, '[data-ob-sh="me"]'); continue; }
        break;
      }
      console.log('  the "Tell Sakhi" screens:\n    ' + upd.join('\n    '));
      await go(a, 'home'); await closeTips(a);
      await checkpoint(a, w, 'A7b', 'day 35: answered "Tell Sakhi your stage and goals" (PMOS, Painful periods first)');
    } else flag(w.who, 'A7', 'no card for the plan for now, and no "Tell Sakhi" after the stage change');
    await dayTo(a, 41); await go(a, 'home'); if (await has(a, '[data-log="start"]')) { await tap(a, '[data-log="start"]'); await closeTips(a); }
    await checkpoint(a, w, 'A8', 'day 42: logged "Period started" on Today');
  },
  /* Getting ready, a positive test, pregnancy marked by mistake, pregnant again, then a loss */
  neha: async (w, a) => {
    await join(a.page, { lang: 'en', name: 'Neha', tile: 'ttc', goals: ['ready'], dates: [ago(66), ago(38), ago(10)], dlen: 5, care: 'private', stop: 'share' });
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    let e = await firstLogAndOffer(a); if (e) flag(w.who, 'B1', e); e = await startFlow(a, 'ready', 'evening'); if (e) flag(w.who, 'B1', e);
    await go(a, 'ttc-folic'); if (await has(a, '#ttc-fo-has')) await tap(a, '#ttc-fo-has');
    await checkpoint(a, w, 'B1', 'joined, Getting ready day 1, "I have my tablet"');
    await dayTo(a, 47); await go(a, 'pregtest-when'); if (await has(a, '[data-pt-res="pos"]')) await tap(a, '[data-pt-res="pos"]'); if (await has(a, '#pt-save')) await tap(a, '#pt-save');
    await go(a, 'home'); await closeTips(a); if (await has(a, '#pl-pos-yes')) await tap(a, '#pl-pos-yes'); else flag(w.who, 'B2', 'no "Yes, move me on"');
    await go(a, 'home'); if (await has(a, '#pl-chg-go')) { await tap(a, '#pl-chg-go'); e = await startFlow(a, 'food'); if (e) flag(w.who, 'B2', e); } else flag(w.who, 'B2', 'no "See my pregnancy plan"');
    await checkpoint(a, w, 'B2', 'day 48: positive test, "Yes, move me on", My pregnancy started');
    await dayTo(a, 54); e = await stageTo(a, 'ttc', { end: 'mistake' }); if (e) flag(w.who, 'B3', e);
    await checkpoint(a, w, 'B3', 'day 55: the stage sheet, Trying for a baby, "marked by mistake"');
    await dayTo(a, 69); e = await stageTo(a, 'preg', { lmp: ago(-69 + 40) }); if (e) flag(w.who, 'B4', e);
    await checkpoint(a, w, 'B4', 'day 70: the stage sheet, I am pregnant (period 40 days ago)');
    if (await has(a, '#pl-chg-go')) { await tap(a, '#pl-chg-go'); e = await startFlow(a, 'food'); if (e) flag(w.who, 'B5', e); }
    await checkpoint(a, w, 'B5', 'day 70: My pregnancy started again');
    await dayTo(a, 84); e = await stageTo(a, 'cycle', { end: 'ended' }); if (e) flag(w.who, 'B6', e);
    await checkpoint(a, w, 'B6', 'day 85: the stage sheet, Tracking my periods, "my pregnancy ended" (a loss)');
    await dayTo(a, 99);
    await checkpoint(a, w, 'B7', 'day 100: two weeks after the loss');
  },
  /* My pregnancy, the birth, "My baby has died" and its undo, her period back, the first birthday */
  riya: async (w, a) => {
    await join(a.page, { lang: 'en', name: 'Riya', tile: 'preg', goals: ['food'], lmp: ago(73), care: 'private', stop: 'share' });
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    let e = await firstLogAndOffer(a); if (e) flag(w.who, 'C1', e); e = await startFlow(a, 'food', 'morning'); if (e) flag(w.who, 'C1', e);
    await checkpoint(a, w, 'C1', 'joined at 10 weeks, My pregnancy day 1');
    await dayTo(a, 203, '11:00'); if (await has(a, '#bb-born')) { await tap(a, '#bb-born'); if (await has(a, '#st-save')) await tap(a, '#st-save'); await settle(a.page, 900); } else flag(w.who, 'C2', 'no "My baby is born" at 39 weeks');
    await go(a, 'home'); await closeTips(a); if (await has(a, '#pl-chg-go')) { await tap(a, '#pl-chg-go'); e = await startFlow(a, 'recovery', 'evening'); if (e) flag(w.who, 'C2', e); } else flag(w.who, 'C2', 'no "See my after-birth plan"');
    await checkpoint(a, w, 'C2', '39 weeks: "My baby is born", the after-birth plan started');
    await dayTo(a, 213); await go(a, 'post'); if (await has(a, '#pst-lost')) { await tap(a, '#pst-lost'); if (await has(a, '#pst-lost-yes')) await tap(a, '#pst-lost-yes'); } else flag(w.who, 'C3', 'no "My baby has died" on the after-birth page');
    await checkpoint(a, w, 'C3', 'birth day 10: "My baby has died"');
    await dayTo(a, 215); await go(a, 'post'); if (await has(a, '#pst-lost-undo')) await tap(a, '#pst-lost-undo'); else flag(w.who, 'C4', 'no "Marked this by mistake? Undo"');
    await checkpoint(a, w, 'C4', 'birth day 12: "Marked this by mistake? Undo"');
    await dayTo(a, 263); await go(a, 'home'); if (await has(a, '[data-log="start"]')) { await tap(a, '[data-log="start"]'); await closeTips(a); } else flag(w.who, 'C5', 'no "Period started" on Today');
    await checkpoint(a, w, 'C5', 'birth day 60: logged "Period started" (her period is back)');
    await dayTo(a, 203 + 366);
    await checkpoint(a, w, 'C6', 'the day after the first birthday');
  },
  /* the other way: the painful-periods plan, then trying for a baby, and "Tell Sakhi your stage and goals" answered */
  asha: async (w, a) => {
    await join(a.page, { lang: 'en', name: 'Asha', tile: 'cycle', goals: ['pain'], dates: [ago(66), ago(38), ago(10)], dlen: 5, care: 'private', stop: 'share' });
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    let e = await firstLogAndOffer(a); if (e) flag(w.who, 'E1', e); e = await startFlow(a, 'pain', 'evening'); if (e) flag(w.who, 'E1', e);
    await checkpoint(a, w, 'E1', 'joined, Easier periods day 1');
    await dayTo(a, 9); e = await stageTo(a, 'ttc'); if (e) flag(w.who, 'E2', e);
    await checkpoint(a, w, 'E2', 'day 10: the stage sheet, Trying for a baby');
    if (await has(a, '#pl-fit-go')) {
      await tap(a, '#pl-fit-go'); e = await startFlow(a, 'ready', 'evening'); if (e) flag(w.who, 'E3', e);
      await checkpoint(a, w, 'E3', 'day 10: "Trying for a baby now?" > See Getting ready');
    } else if (await has(a, '#ex-go')) {
      await tap(a, '#ex-go'); const upd = [];
      for (let i = 0; i < 10; i++) {
        const h = await hashOf(a); upd.push(h + ' :: ' + flat(await txt(a, '#view')).slice(0, 120)); if (h === '#home' || h === '#plan-goal' || h === '#plan-reveal') break;
        if ((await has(a, '[data-ob-st="ttc"]')) && !(await has(a, '[data-ob-goal]'))) { await tap(a, '[data-ob-st="ttc"]'); continue; }
        if ((await has(a, '[data-ob-goal="ready"]')) && !(await has(a, '[data-ob-goal="ready"].on'))) { await tap(a, '[data-ob-goal="ready"]'); continue; }
        if (await has(a, '#ob-done')) { await tap(a, '#ob-done'); continue; }
        if (await has(a, '#ob-next')) { await tap(a, '#ob-next'); continue; }
        break;
      }
      console.log('  the "Tell Sakhi" screens:\n    ' + upd.join('\n    '));
      await go(a, 'home'); await closeTips(a);
      await checkpoint(a, w, 'E3', 'day 10: answered "Tell Sakhi" with Trying for a baby, Know my best days');
    } else flag(w.who, 'E2', 'no "Tell Sakhi your stage and goals" after the stage change');
  },
  /* after a birth, then tracking her periods, then pregnant again */
  meera: async (w, a) => {
    await join(a.page, { lang: 'en', name: 'Meera', tile: 'post', goals: ['recovery'], birth: ago(3), bf: 'yes', care: 'govt', stop: 'share' });
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    let e = await firstLogAndOffer(a); if (e) flag(w.who, 'D1', e); e = await startFlow(a, 'recovery', 'evening'); if (e) flag(w.who, 'D1', e);
    await checkpoint(a, w, 'D1', 'joined on day 3 after the birth, My recovery plan day 1');
    await dayTo(a, 47); e = await stageTo(a, 'cycle'); if (e) flag(w.who, 'D2', e);
    await checkpoint(a, w, 'D2', 'birth day 50: the stage sheet, Tracking my periods');
    await dayTo(a, 77); e = await stageTo(a, 'preg', { lmp: ago(-77 + 35) }); if (e) flag(w.who, 'D3', e);
    await checkpoint(a, w, 'D3', 'birth day 80: the stage sheet, I am pregnant again');
    if (await has(a, '#pl-chg-go')) { await tap(a, '#pl-chg-go'); e = await startFlow(a, 'food'); if (e) flag(w.who, 'D4', e); }
    await checkpoint(a, w, 'D4', 'birth day 80: My pregnancy started');
  }
};
for (const [who, fn] of Object.entries(JOURNEYS)) {
  if (ONLY && who !== ONLY) continue;
  LOG[who] = []; console.log('== ' + who); const w = { who };
  const a = await open();
  try { await fn(w, a); } catch (e) { flag(who, 'walk', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 240)); try { await a.page.screenshot({ path: path.join(SHOTS, who + '-CRASH.png'), fullPage: true }); } catch (e2) { /* gone */ } }
  finally { errsAll.push(...a.errs.map((e) => who + ': ' + e)); await a.ctx.close(); }
}
await browser.close();
fs.writeFileSync(path.join(SHOTS, 'walk.json'), JSON.stringify({ flags, errors: errsAll, log: LOG }, null, 1));
for (const who of Object.keys(LOG)) {
  const out = [];
  for (const r of LOG[who]) {
    out.push('\n######## ' + who + ' ' + r.tag + ' ' + r.day + ' :: ' + r.note);
    out.push('STATE ' + JSON.stringify({ stage: r.s.stage, sit: r.s.sit, plan: r.s.plan, steps: r.s.steps }));
    out.push('REMINDERS ' + r.s.rem.join(' | ')); out.push('RINGS (48 h) ' + r.rings.join(' | ')); if (r.sheet) out.push('SHEET ON OPEN ' + r.sheet);
    for (const k of ['today', 'myplan', 'cal', 'cycles', 'days', 'me', 'explore']) out.push('--- ' + k + '\n' + String(r[k] || '').replace(/\n{2,}/g, '\n').split('\n').filter((x) => !/^\d{1,2}$|^[MTWFS]$/.test(x.trim())).join('\n').slice(0, 2600));
  }
  fs.writeFileSync(path.join(SHOTS, who + '.txt'), out.join('\n'));
}
console.log('FLAGS (' + flags.length + ')\n' + flags.join('\n')); console.log('ERRORS ' + errsAll.length + (errsAll.length ? '\n' + errsAll.slice(0, 20).join('\n') : ''));
