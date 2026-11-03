// Version 39.59, phase B (Mohit, 3 Nov: "proceed with phase B"; docs/lives-audit-2026-11-03.md, section 4, and
// docs/personal-companion-advice-2026-11-03.md, 4.3): a calmer Today.
// - 1 tips (R4): one a day, in her first week with Sakhi or the week after her stage changed; one she puts off ends; Me > How to
//   use Sakhi still plays any of them;
// - 2 cards that end (R3): a first-days read on 3 days at most; a card that keeps coming back waits 30 days after its second turn;
// - 3 Today (4.3): with no plan on Today, her feelings' chips in the card with her body today, no feelings card of their own and no
//   second "How I feel"; while a plan runs, Today as Version 39.23 made it (her steps on the first screen);
// - 4 one home (C3): Explore's For you leaves out what her running plan's tiles open.
// Usage: node test/calmtoday.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.56-pilot', platform: 'android' };
/* periods every 28 days, 5 days long; the last started `last` days ago (its likely next start is 26 to 30 days after it) */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const ANS = { stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], pain: 'pk', painDays: '23', endo: 'n', pads: 'p23', clots: 'n', tired: 'n', pms: ['mood', 'irr'], pmsLevel: 'little', when: 'dinner' };
const planOf = (g, startAgo, extra) => Object.assign({ pack: g, goalKey: g, start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', intake: Object.assign({ goal: g }, ANS) }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
/* Priya, 28, tracking her periods: her plan led by g since day 1 = startAgo + 1 days ago, her other goals `also` */
const per = (g, startAgo, o) => { o = o || {}; const px = o.px || {}; const pk = Object.assign({}, px); delete pk.a;
  return Object.assign({ dob: '1998-05-01', situation: {}, goals: [g].concat(o.also || []), intake: { goal: g, stage: 'cycle' }, events: regular(o.last == null ? 10 : o.last),
    mods: { plan: planOf(g, startAgo, Object.assign({ intake: Object.assign({ goal: g }, ANS, px.a || {}) }, pk)) }, reminders: [planRem(startAgo)] }, o.x || {}); };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'pain' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const acts = (page) => page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub || '', go: x.go || '' })));
const ids = async (page) => (await acts(page)).map((x) => x.id);
const B = (d) => d - 1;   /* plan day d starts d - 1 days ago */

/* her plan's check-in: Done for every step it asks (or the first answer when there is no Done), then Save */
async function checkinAll(page, pick) {
  await page.waitForSelector('#pl-ci-save', { timeout: 5000 });
  const ids = await page.$$eval('[data-ci]', (bs) => [...new Set(bs.map((b) => b.dataset.ci.split(':')[0]))]);
  for (const id of ids) { const v = (pick || {})[id] || 'd'; if (await has(page, '[data-ci="' + id + ':' + v + '"]')) await tap(page, '[data-ci="' + id + ':' + v + '"]'); }
  await tap(page, '#pl-ci-save');
}
const stOf = (page, id) => page.evaluate((x) => { const a = (window.Saathi.plan.actions() || []).find((y) => y.id === x); return a ? { kind: a.kind, state: a.state || null, play: a.play || null, title: a.title } : null; }, id);
const SHOTS = path.join(here, 'shots', 'calmtoday'); fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }).catch(() => null);
const tipUp = (page) => page.$('.tour-pop').then(Boolean);
const dayTo = async (page, n) => { await page.clock.setSystemTime(new Date(at('10:00').getTime() + n * 86400000)); await go(page, 'diary'); await go(page, 'home'); await settle(page, 1500); };
const TIPS = { toursAuto: true, notify: true };
/* Priya, 28, tracking her periods: no tours seen (the full tour already done), tips on */
const tipS = (joinedAgo, x) => Object.assign({ dob: '1998-05-01', goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, events: regular(10), joined: ago(joinedAgo), tours: {}, fullTour: { st: 'done', d: ago(joinedAgo) },
  prompts: { planCall: ago(3), firstLog: ago(joinedAgo), setup: 'off' }, settings: TIPS }, x || {});

/* ---------- 1 tips ---------- */
{
  let a = await open({ seed: seedOf(tipS(10)) }); await settle(a.page, 1500);
  check('1.1 ten days after joining: no tip comes on its own', !(await tipUp(a.page)));
  await go(a.page, 'me-help'); const run = await a.page.$('[data-tour-run]');
  if (run) { await run.evaluate((b) => b.click()); await settle(a.page, 1500); }
  check('1.2 Me > How to use Sakhi still plays one', !!run && await tipUp(a.page));
  await done(a);
  a = await open({ seed: seedOf(tipS(2)) }); await settle(a.page, 1500);
  const first = await tipUp(a.page); await shot(a.page, '1-first-tip');
  const id = await a.page.evaluate(() => { const b = [...document.querySelectorAll('.tour-pop button')].find((x) => /Not now/.test(x.innerText)); if (b) b.click(); return true; }); await settle(a.page, 400);
  const tours = await a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.tours || {})));
  check('1.3 her first week: a tip comes, and "Not now" ends it (it doesn\'t come back)', first && id && Object.values(tours).some((x) => x.st === 'off'), tours);
  await go(a.page, 'diary'); await settle(a.page, 1500);
  check('1.4 one a day: Diary\'s own tip waits for another day', !(await tipUp(a.page)));
  await dayTo(a.page, 1);
  const tours2 = await a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.tours || {})));
  const homeAgain = Object.keys(tours2).filter((k) => tours2[k].st === 'off').length;
  check('1.5 the next day, the tip she put off stays off', homeAgain >= 1);
  await done(a);
  a = await open({ seed: seedOf(tipS(200, { prompts: { planCall: ago(3), firstLog: ago(100), setup: 'off', exStage: ago(2) } })) }); await settle(a.page, 1500);
  check('1.6 the week after her stage changed: a tip may come again', await tipUp(a.page));
  await done(a);
}

/* ---------- 2 cards that end ---------- */
{
  /* the first-days read: Priya joined yesterday with her goals (Version 39.10), no plan yet */
  let a = await open({ seed: seedOf(tipS(1, { settings: { toursAuto: false, notify: true }, focus: { tile: 'cycle', goals: ['track'], at: ago(1) } })) });
  const read = 'What a menstrual cycle is'; const seen = [];
  for (let n = 0; n < 5; n++) { if (n) await dayTo(a.page, n); seen.push(/What a menstrual cycle is/.test(await view(a.page))); }
  check('2.1 the first-days read shows on 3 days, then leaves Today (Learn keeps it)', seen.join() === 'true,true,true,false,false', { read, seen });
  await done(a);
  /* a card that keeps coming back: whichever leads Sakhi says, put aside after its turn */
  a = await open({ seed: seedOf(tipS(1, { settings: { toursAuto: false, notify: true }, situation: { care: 'govt' }, focus: { tile: 'cycle', goals: ['track'], at: ago(1) }, reminders: [planRem(3)], prompts: { planCall: ago(3), firstLog: ago(1) } })) });
  const lead = await a.page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.prompts || {}).slotLead || null)));
  const asideAfter = async (slotN) => a.page.evaluate(([k, sn]) => { const S = window.Saathi; const p = S.state.prompts; p.slotAside = {}; p.slotN = sn; p.slotLead = { k, n: 3, d: S.toISO(S.addDays(S.today(), -1)) }; S.saveQuiet(); S.render(); return new Promise((r) => setTimeout(() => r(JSON.parse(JSON.stringify(S.state.prompts.slotAside || {}))[k] || null), 50)); }, [lead && lead.k, slotN]);
  const in7 = lead ? await asideAfter({}) : null; await settle(a.page, 200);
  const in30 = lead ? await asideAfter({ [lead.k]: { n: 1, d: ago(5) } }) : null;
  check('2.2 a card\'s first turn: it waits 7 days', lead && in7 === iso(TODAY, 7), { lead, in7 });
  check('2.3 its second turn: it waits 30 days', lead && in30 === iso(TODAY, 30), { lead, in30 });
  await done(a);
}

/* ---------- 3 Today ---------- */
const PM = { pack: 'cycle', goalKey: 'pmos', start: ago(8), started: ago(8), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], intake: { goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' } };
const layout = (page) => page.evaluate(() => ({ chipsInHero: !!document.querySelector('#view .card.hero [data-feel]'), feelCard: !!document.querySelector('#view .card.feel-card'), howIFeel: !!document.querySelector('#view [data-symlog]'), logInHero: !!document.querySelector('#view .card.hero [data-log]') }));
{
  let a = await open({ seed: seedOf({}) }); let l = await layout(a.page); await shot(a.page, '3-tracking');
  check('3.1 tracking, no plan: her log buttons and her feelings\' chips in one card; no feelings card; no second "How I feel"', l.chipsInHero && l.logInHero && !l.feelCard && !l.howIFeel, l);
  await a.page.$eval('#view .card.hero [data-feel]', (b) => b.click()); await settle(a.page, 400);
  check('3.2 a chip there notes her day', await a.page.evaluate(() => { const S = window.Saathi; return (S.state.daily[S.toISO(S.today())] || []).length > 0; }));
  await done(a);
  a = await open({ seed: seedOf({ dob: '1998-05-01', situation: { pcos: true }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: PM }, reminders: [planRem(8)] }) }); l = await layout(a.page); await shot(a.page, '3-plan');
  const planFirst = await a.page.evaluate(() => { const td = document.querySelector('#view .today-card'); const fc = document.querySelector('#view .card.feel-card'); return !!(td && fc && (td.compareDocumentPosition(fc) & Node.DOCUMENT_POSITION_FOLLOWING)); });
  check('3.3 on My PMOS plan: Today as Version 39.23 made it (her steps first, her feelings below them, "How I feel" in the headline)', !l.chipsInHero && l.feelCard && l.howIFeel && planFirst, Object.assign({ planFirst }, l));
  await done(a);
  a = await open({ seed: seedOf({ situation: { pregnant: true, pregnantSince: ago(140) }, goals: ['preg', 'food'], intake: { goal: 'food', stage: 'preg' }, events: [] }) }); l = await layout(a.page);
  check('3.4 pregnant (no chips): "How I feel" stays', l.howIFeel && !l.chipsInHero, l);
  await done(a);
  a = await open({ seed: seedOf({ settings: { discreet: true, toursAuto: false, notify: true } }) }); l = await layout(a.page);
  check('3.5 a shared phone: its plain button stays, and no chips', l.howIFeel && !l.chipsInHero, l);
  await done(a);
  a = await open({ seed: seedOf({ lang: 'hi' }), w: 360, h: 800 });
  check('3.6 Hindi at 360 px: Today has no sideways scroll', await noScroll(a.page));
  await done(a);
}

/* ---------- 4 one home ---------- */
{
  let a = await open({ seed: seedOf({ dob: '1998-05-01', situation: { pcos: true }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: PM }, reminders: [planRem(8)] }) });
  const tiles = await a.page.evaluate(() => window.Saathi.plan.tileGo()); await go(a.page, 'care');
  const fy = await a.page.evaluate(() => { const h = [...document.querySelectorAll('#view .care-sec')].find((s) => /For you/.test(s.innerText)); return h ? [...h.querySelectorAll('[data-go]')].map((b) => b.dataset.go) : []; });
  check('4.1 on a plan: For you leaves out what her plan\'s tiles open', tiles.length > 0 && fy.length > 0 && !fy.some((g) => tiles.indexOf(g) >= 0), { tiles, fy });
  await done(a);
  a = await open({ seed: seedOf({}) });
  check('4.2 no plan: nothing is left out', (await a.page.evaluate(() => window.Saathi.plan.tileGo())).length === 0);
  await done(a);
}

console.log('page errors', errsAll.length ? errsAll : 'none');
check('5 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
process.exit(fails.length ? 1 : 0);
