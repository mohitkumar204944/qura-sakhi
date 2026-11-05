// Version 39.27: fix the loop and the truth (docs/minimalism-audit-2026-10-27.md, Phase 1: R01 to R07; mockup
// claude.ai/artifact/2a1AsJqHy4x9RyqR61GFQ8; Mohit, 28 Oct: "go ahead and build it and make reminders by default on no need to
// ask user and no need for 90 minute gap wherever needed have reminders"; MODULE_API section 70). This file checks:
//   1 reminders on by default: on with no question in Sakhi's words; Android 13's own "Allow" once (after her first tour, or
//     on Start); off in Me stays off; a reminder she sets turns them back on; no reminder row in setup; the Start card names
//     what will ring; no period note while she is trying for a baby; the heads-up's "Remind me" turns them on in one tap;
//   2 the evening in her order: the check-in 45 minutes after her walk (before her bedtime), 9:30 and 10 pm to pick, a time she
//     picks stays hers, an older plan's 8 pm moves after her walk;
//   3 after week 12 her steps carry on: Today's row (her results and Stop), her results page, reminders 4 weeks past her
//     last visit, the after-birth plan as before;
//   4 lines that are true: "2 of your last 2 gaps", no fertile-days promise for long gaps, the usual range, "Sach ya Myth?",
//     a quiet petal while trying, "Tomorrow" without "today", the check-in's footnote, the cycle day, room under the + button;
//   5 each plan measures what it promises: "Pain today?" on her period's first days (Today, then the check-in), never on a
//     shared phone; the hot-flush chip and its days; the weekly diary only for the other menopause goals;
//   6 a doctor finding and her plan's offer in one card on Today, nothing folded, at 360 px in English and Hindi;
//   7 safety one tap closer: Call buttons on the after-birth danger cards, Help's first row dials 112, Help while she joins
//     (Version 39.70: the nearest hospital and her ambulance, 108 after a birth; no 112, Tele-MANAS or 181);
//   8 Hindi at 360 px, no sideways scroll, no page errors.
// Usage: node test/minimal.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'minimal'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';   /* a Wednesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.27-pilot', platform: 'android' };
/* the Android bridge: canNotify as the phone says (Android 10 to 12: true; 13 and newer: false until "Allow"); askNotify answers
   after a moment, as the system prompt does */
const ANDROID = (o) => 'window.__calls = []; window.__notify = ' + !!o.notify + '; window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, ' +
  'canNotify(){ return window.__notify; }, askNotify(){ window.__calls.push("askNotify"); setTimeout(() => { window.__notify = ' + (o.grant !== false) + '; window.__sakhiNotify && window.__sakhiNotify(' + (o.grant !== false) + '); }, 50); }, ' +
  'canExactAlarms(){ return true; }, askExactAlarms(){ window.__calls.push("askExact"); }, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ window.__calls.push("share"); return true; } };';
/* three periods 28 days apart, the last `last` days ago, 5 days each */
const regular = (last, extra) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push(Object.assign({ d: ago(x), t: 'start' }, extra || {}), { d: ago(x - 4), t: 'end' })); return out; };
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd', yoga: 'd' }, plate: { half: true } }; return l; };
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: logged(startAgo, 5), weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const planRem = (startAgo, time, until) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: until || iso(ago(startAgo), 83), every: 1, time: time || '20:00', on: true, doneOn: null });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(AUDIO);
  if (o.android !== false) await ctx.addInitScript(ANDROID(o.android || { notify: true }));
  if (o.seed !== false) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(o.hm || '09:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const sheet = (page) => page.$eval('#sheet-root', (e) => e.innerText.replace(/\s+/g, ' ')).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const rem = (page, id) => page.evaluate((x) => (window.Saathi.state.reminders || []).find((r) => r.id === x) || null, id);
const calls = (page, k) => page.evaluate((x) => window.__calls.filter((c) => c === x).length, k);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: false });
const hashOf = (page) => page.evaluate(() => location.hash.slice(1));
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const startCard = async (page) => { await page.evaluate(() => { window.Saathi.mem.rvCard = 9; window.Saathi.mem.rvStart = null; }); await go(page, 'plan-reveal'); };
const PAIN_IK = { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'dinner' };

/* ---------- 1 reminders on by default ---------- */
{
  /* Android 10 to 12: no prompt exists, so they are simply on */
  const a = await open({ android: { notify: true }, wait: 1500 });
  let s = await st(a.page);
  check('1 on Android 10 to 12, phone reminders are on with no question', s.settings.notify === true && !s.settings.notifyOff && (await calls(a.page, 'askNotify')) === 0 && !(await sheet(a.page)), s.settings);
  check('1 no reminder row in setup', !/Turn on reminders on this phone/.test(await view(a.page)) && !(await has(a.page, '#view [data-setup="notif"]')));
  check('1 ... and the phone gets its reminders (her period note)', (await a.page.evaluate(() => window.__sched.length)) > 0 && await a.page.evaluate(() => window.__sched.some((x) => /^period-/.test(x.id))), await a.page.evaluate(() => window.__sched.map((x) => x.id)));
  /* off in Me stays off */
  await go(a.page, 'me-reminders');
  await a.page.$eval('#me-notif', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); }); await settle(a.page, 300);
  await go(a.page, 'home'); await settle(a.page, 2500);
  s = await st(a.page);
  check('1 switched off in Me, they stay off (no question, no turning back on)', s.settings.notify === false && s.settings.notifyOff === true && !(await sheet(a.page)) && (await a.page.evaluate(() => window.__sched.length)) === 0, s.settings);
  /* a reminder she sets turns them back on */
  await a.page.evaluate(() => { document.body.click(); window.Saathi.reminders.upsert({ id: 'mine', title: { en: 'Pill', hi: 'गोली' }, every: 1, time: '21:00', start: window.Saathi.toISO(window.Saathi.today()) }); }); await settle(a.page, 1200);
  s = await st(a.page);
  check('1 a reminder she sets turns phone reminders back on, with a word', s.settings.notify === true && !s.settings.notifyOff && /Phone reminders are on|on/i.test(await txt(a.page, '.toast')), [s.settings, await txt(a.page, '.toast')]);
  /* turning on in Me clears "off" */
  await go(a.page, 'me-reminders');
  await a.page.$eval('#me-notif', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); }); await settle(a.page, 300);
  await a.page.$eval('#me-notif', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(a.page, 600);
  s = await st(a.page);
  check('1 on again in Me: on, and "off" forgotten', s.settings.notify === true && !s.settings.notifyOff, s.settings);
  await done(a);
}
{
  /* Android 13 and newer: the phone's own "Allow", once, after her first tour */
  const a = await open({ android: { notify: false, grant: true } });
  await settle(a.page, 2500);
  let s = await st(a.page);
  check('1 on Android 13+, the phone\'s own "Allow" comes once on Today (no question in Sakhi\'s words)', (await calls(a.page, 'askNotify')) === 1 && s.settings.notify === true && s.prompts.notifyAuto === TODAY && !(await sheet(a.page)), [await calls(a.page, 'askNotify'), s.settings, s.prompts]);
  await go(a.page, 'diary'); await go(a.page, 'home'); await settle(a.page, 2500);
  check('1 ... and never again', (await calls(a.page, 'askNotify')) === 1);
  await done(a);
}
{
  const a = await open({ android: { notify: false, grant: false } });
  await settle(a.page, 2500);
  await go(a.page, 'diary'); await go(a.page, 'home'); await settle(a.page, 2500);
  const s = await st(a.page);
  check('1 "Don\'t allow" is her answer: asked once, off, no sheet after it', (await calls(a.page, 'askNotify')) === 1 && !s.settings.notify && !(await sheet(a.page)), [await calls(a.page, 'askNotify'), s.settings]);
  await done(a);
}
{
  /* the Start card names what will ring */
  const a = await open({ android: { notify: true } });
  await a.page.evaluate((ik) => { window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); }, PAIN_IK);
  await startCard(a.page);
  const v = await view(a.page);
  check('1 the Start card asks nothing: no "Allow reminders", no ring-on-time card', !(await has(a.page, '#pl-st-allow')) && !(await has(a.page, '#pl-st-exact')) && !/Allow reminders/.test(v), v.slice(0, 700));
  const line = await txt(a.page, '.pl-st-rem');
  /* Version 39.55: My period plan has no bedtime step, so no wind-down (its rings: the walk, the check-in, her doctor's tablet) */
  check('1 ... it names everything that will ring, in her evening\'s order (no spacing rule: Mohit, 28 Oct)', line === 'Reminders are on: your 9:15 pm walk, your 10 pm check-in and a note the day before your period. Nothing shows on the lock screen. Change them any time in Me > Reminders.', line);
  check('1 ... Sakhi\'s time is chosen: 10 pm, after her 9:15 pm walk; 9:30 and 10 pm are there to pick', await has(a.page, '[data-rv-at="22:00"][aria-pressed="true"]') && await has(a.page, '[data-rv-at="21:30"]') && await has(a.page, '[data-rv-at="18:00"]'));
  await shot(a.page, '1-start');
  await tap(a.page, '#pl-rv-go'); await settle(a.page, 1200);
  const s = await st(a.page);
  check('1 Start: her plan, the 9:15 pm walk cue and the 10 pm check-in (no wind-down in My period plan)', s.mods.plan.start === TODAY && (await rem(a.page, 'plan') || {}).time === '22:00' && (await rem(a.page, 'plan-nudge') || {}).time === '21:15' && !(await rem(a.page, 'plan-wind')) && !s.mods.plan.remPick, [s.reminders.map((r) => r.id + ' ' + r.time), s.mods.plan.remPick]);
  check('1 on a phone that needs no "Allow", Start asks nothing', (await calls(a.page, 'askNotify')) === 0 && s.settings.notify === true);
  await done(a);
}
{
  /* the phone said no before: the line says so, honestly, and Start doesn't ask again */
  const a = await open({ android: { notify: false, grant: false }, seed: { prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(9) } } });
  await a.page.evaluate((ik) => { window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); }, PAIN_IK);
  await startCard(a.page);
  check('1 the phone blocks reminders: the Start card says so, and where to allow them', /Your phone isn’t letting Sakhi ring reminders\. You can allow them in Me > Reminders\./.test(await txt(a.page, '.pl-st-rem')), await txt(a.page, '.pl-st-rem'));
  await tap(a.page, '#pl-rv-go'); await settle(a.page, 800);
  check('1 ... and Start doesn\'t ask the phone a second time', (await calls(a.page, 'askNotify')) === 0);
  await done(a);
}
{
  /* reminders she switched off: the Start card says they are off */
  const a = await open({ android: { notify: true }, seed: { settings: { notify: false, notifyOff: true } } });
  await a.page.evaluate((ik) => { window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); }, PAIN_IK);
  await startCard(a.page);
  check('1 reminders she turned off: the Start card says nothing will ring, and where to turn them on', /Your phone reminders are off, so nothing will ring\. You can turn them on in Me > Reminders\./.test(await txt(a.page, '.pl-st-rem')), await txt(a.page, '.pl-st-rem'));
  await done(a);
}
{
  /* a phone that never asked yet: Start brings the "Allow" */
  const a = await open({ android: { notify: false, grant: true }, seed: { fullTour: { st: 'on', d: TODAY } } });
  await a.page.evaluate((ik) => { window.Saathi.state.fullTour = { st: 'done', d: '2026-10-28' }; window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); }, PAIN_IK);
  await startCard(a.page);
  check('1 not asked before Start (her tour was on)', (await calls(a.page, 'askNotify')) === 0);
  await tap(a.page, '#pl-rv-go'); await settle(a.page, 800);
  check('1 Start brings the phone\'s "Allow"; reminders are on', (await calls(a.page, 'askNotify')) === 1 && (await st(a.page)).settings.notify === true, await calls(a.page, 'askNotify'));
  await done(a);
}
{
  /* trying for a baby: no period note on her phone */
  const a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready' } } });
  check('1 trying for a baby: no "day before your period" notification', !(await a.page.evaluate(() => window.__sched.some((x) => /^period-/.test(x.id)))), await a.page.evaluate(() => window.__sched.map((x) => x.id)));
  await done(a);
}
{
  /* the heads-up card's "Remind me": on in one tap */
  const a = await open({ seed: { events: regular(23), settings: { notifyOff: true, notify: false } } });   /* her likely days start in 2 days */
  check('1 the heads-up offers "Remind me" while reminders are off', await has(a.page, '#view .hu-card #hu-rem'), await txt(a.page, '#view .hu-card'));
  await tap(a.page, '#hu-rem'); await settle(a.page, 400);
  const s = await st(a.page);
  check('1 ... one tap turns them on, on the spot', s.settings.notify === true && !s.settings.notifyOff && (await hashOf(a.page)) === 'home', s.settings);
  await done(a);
}

/* ---------- 2 the evening in her order ---------- */
{
  /* a plan from before Version 39.27: 8 pm check-in, walk after dinner */
  const a = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', 9) }, reminders: [planRem(9, '20:00')], settings: { notify: true } } });
  const p = (await st(a.page)).mods.plan;
  check('2 an older plan\'s 8 pm check-in moves after her 9:15 pm walk: 10 pm', (await rem(a.page, 'plan') || {}).time === '22:00' && p.ciSet === '22:00' && p.remAt === '20:00', [await rem(a.page, 'plan'), p.ciSet, p.remAt]);
  check('2 ... the walk cue stays 9:15 pm and the wind-down 10:30 pm: no spacing rule, every reminder she needs', (await rem(a.page, 'plan-nudge') || {}).time === '21:15' && (await rem(a.page, 'plan-wind') || {}).time === '22:30');
  check('2 Today says when she checks in', /Check-in at 10 pm/.test(await view(a.page)), (await view(a.page)).slice(0, 900));
  await go(a.page, 'plan-settings');
  check('2 her settings say why: "10 pm, after your walk", with 9:30 and 10 pm', /10 pm, after your walk/.test(await view(a.page)) && await has(a.page, '[data-pl-at="21:30"]') && await has(a.page, '[data-pl-at="22:00"].on'), (await view(a.page)).slice(0, 500));
  await tap(a.page, '[data-pl-at="20:00"]');
  await go(a.page, 'home');
  const p2 = (await st(a.page)).mods.plan;
  check('2 a time she picks stays hers (8 pm), even with a later walk', (await rem(a.page, 'plan') || {}).time === '20:00' && p2.remPick === true && p2.remAt === '20:00', [await rem(a.page, 'plan'), p2.remPick]);
  await done(a);
}
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 9, { when: 'evening' }) }, reminders: [planRem(9, '20:00')], settings: { notify: true } } });
  check('2 an evening walker (6 pm) keeps her 8 pm check-in', (await rem(a.page, 'plan') || {}).time === '20:00');
  await done(a);
}
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 9, { bed: 'b22' }) }, reminders: [planRem(9, '20:00')], settings: { notify: true } } });
  check('2 never later than 45 minutes before her bedtime, and always after her walk: in bed by 10 pm with a 9:15 pm walk, the check-in at 9:30 pm (Version 39.47: never at its minute)', (await rem(a.page, 'plan') || {}).time === '21:30', await rem(a.page, 'plan'));
  await done(a);
}
{
  /* she edits the check-in's time in Reminders */
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 9) }, reminders: [planRem(9, '20:00')], settings: { notify: true } } });
  await a.page.evaluate(() => { const S = window.Saathi; S.reminders.upsert({ id: 'plan', time: '21:30' }, { quiet: true }); S.render(); }); await settle(a.page, 600);
  const p = (await st(a.page)).mods.plan;
  check('2 a time she sets in Reminders is hers', (await rem(a.page, 'plan') || {}).time === '21:30' && p.remAt === '21:30' && p.remPick === true, [await rem(a.page, 'plan'), p.remAt, p.remPick]);
  await done(a);
}

/* ---------- 3 after week 12 her steps carry on ---------- */
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 84) }, reminders: [planRem(84, '20:00')], settings: { notify: true } } });
  let p = (await st(a.page)).mods.plan;
  check('3 day 85: her plan carries on by itself', p.keep === true && p.carried === TODAY && !p.endSeen, [p.keep, p.carried, p.endSeen]);
  let v = await view(a.page);
  check('3 Today: "Your 12 weeks are done. Your steps carry on." with her results and Stop', /Your 12 weeks are done Your steps carry on\./.test(await txt(a.page, '#view .pl-carry')) && await has(a.page, '#view .pl-carry [data-go="plan-end"]') && await has(a.page, '#view .pl-carry #pl-carry-stop'), await txt(a.page, '#view .pl-carry'));
  check('3 ... her steps are still there, at the same pace', /PLAN DAY 85/.test(v) && /Walk \d+ minutes|Move \d+ minutes/.test(v), v.slice(0, 900));
  check('3 ... and no second "12 weeks are done" card in Sakhi says', !(await has(a.page, '#view .pl-sl-end')));
  check('3 her check-in reminder rings on: 4 weeks past today', (await rem(a.page, 'plan') || {}).until === iso(TODAY, 28), await rem(a.page, 'plan'));
  await shot(a.page, '3-day85');
  await tap(a.page, '#view .pl-carry [data-go="plan-end"]');
  v = await view(a.page);
  check('3 her results: her 12 weeks, "Your steps carry on", another plan, and Stop', (await hashOf(a.page)) === 'plan-end' && /Your 12 weeks are done/.test(v) && /of 84 days/.test(v) && /Your steps carry on/.test(v) && /Work on something else/.test(v) && /Stop my plan/.test(v) && !/Keep my habits/.test(v), v.slice(0, 900));
  await go(a.page, 'home');
  check('3 once she has seen them, Today\'s row goes; her steps stay', !(await has(a.page, '#view .pl-carry')) && /PLAN DAY 85/.test(await view(a.page)));
  await go(a.page, 'plan-end');
  await tap(a.page, '#pl-end-stop');
  check('3 Stop asks once', /Stop your plan\? What you logged stays on your phone\./.test(await view(a.page)));
  await tap(a.page, '#pl-end-yes');
  p = (await st(a.page)).mods.plan;
  check('3 ... and stops it: no steps, no check-in reminder', !p.start && !(await rem(a.page, 'plan')) && (await hashOf(a.page)) === 'plan', [p.start, await rem(a.page, 'plan')]);
  await done(a);
}
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 84) }, reminders: [planRem(84, '20:00')], settings: { notify: true } } });
  await tap(a.page, '#pl-carry-stop');
  check('3 Stop on Today asks there', /Stop your plan\?/.test(await txt(a.page, '#view .pl-carry')) && await has(a.page, '#pl-carry-yes'));
  await tap(a.page, '#pl-carry-no');
  check('3 "Keep it" keeps it', await has(a.page, '#pl-carry-stop') && (await st(a.page)).mods.plan.start === ago(84));
  await tap(a.page, '#pl-carry-stop'); await tap(a.page, '#pl-carry-yes');
  check('3 "Yes, stop it" on Today stops it', !(await st(a.page)).mods.plan.start);
  await done(a);
}
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 40) }, reminders: [planRem(40, '20:00')], settings: { notify: true } } });
  check('3 in her 12 weeks, the reminder is booked past week 12 (to day 112), so day 85 still rings', (await rem(a.page, 'plan') || {}).until === iso(ago(40), 111), await rem(a.page, 'plan'));
  await done(a);
}
{
  const a = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', 84, { endSeen: ago(1) }) }, reminders: [planRem(84, '20:00')], settings: { notify: true } } });
  const p = (await st(a.page)).mods.plan;
  check('3 a woman who saw her end page before keeps her choice: no carry-on', !p.keep && !p.carried && !(await has(a.page, '#view .pl-carry')), [p.keep, p.carried]);
  await done(a);
}
{
  const post = planOf('post', 'recovery', 84, { when: null });
  const a = await open({ seed: { dob: '1994-05-01', situation: { deliveredOn: ago(130), breastfeeding: true }, events: [], intake: { goal: 'recovery' }, mods: { plan: post }, reminders: [planRem(84, '20:00')], settings: { notify: true } } });
  const p = (await st(a.page)).mods.plan;
  check('3 the after-birth plan keeps its own end: no carry-on, "See your results"', !p.keep && !p.carried && !(await has(a.page, '#view .pl-carry')), [p.keep, p.carried, (await view(a.page)).slice(0, 400)]);
  await done(a);
}

/* ---------- 4 lines that are true ---------- */
const LONG = [{ d: ago(80), t: 'start' }, { d: ago(76), t: 'end' }, { d: ago(39), t: 'start' }, { d: ago(35), t: 'end' }, { d: ago(1), t: 'start' }];
{
  const a = await open({ hash: '#explain', seed: { events: LONG } });
  const v = await view(a.page);
  check('4 a finding names her own count: "2 of your last 2 gaps were longer than 35 days"', /2 of your last 2 gaps were longer than 35 days/.test(v) && !/of your last 6 gaps/.test(v), v.slice(0, 900));
  await go(a.page, 'home');
  const h = await view(a.page);
  check('4 long gaps: fertile days are never promised after "a few more periods"', (await a.page.evaluate(() => window.Saathi.cycle.fertWhy())) === 'irregular' && !/fertile days show/.test(h), [await a.page.evaluate(() => window.Saathi.cycle.fertWhy()), h.slice(0, 900)]);
  await done(a);
}
{
  const a = await open();
  const h = await view(a.page);
  check('4 the ring\'s legend: "Usual range 21–35 days"', /Usual range 21–35 days/.test(h) && !/Typical gap/.test(h), h.slice(0, 600));
  check('4 the weekly quiz is a game: "Sach ya Myth?", not "Did you know?"', await a.page.evaluate(() => { const e = document.querySelector('#view .joy-dyk .eyebrow'); return !!e && /Sach ya Myth\?/.test(e.textContent); }));
  check('4 room under the last card wherever the + button can show', await a.page.evaluate(() => document.body.classList.contains('fab-page') && parseInt(getComputedStyle(document.querySelector('main')).paddingBottom, 10) >= 160));
  await go(a.page, 'diary'); await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(a.page, 400);
  const cy = await view(a.page);
  check('4 Cycles: the current one says "cycle day 11", as Today does', /cycle day 11|Cycle day 11/.test(cy) && !/days so far/.test(cy), cy.slice(0, 700));
  await go(a.page, 'checkin');
  const ci = await view(a.page);
  check('4 the monthly check-in says "Saved. Thank you." only after saving', !/Saved\. Thank you\./.test(ci) && /Nothing is scored here\./.test(ci), ci.slice(-300));
  await done(a);
}
{
  /* trying for a baby: her period counts for her garden, quietly */
  const a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready' }, events: regular(27) } });
  const before = await a.page.evaluate(() => window.Saathi.joy.petals());
  await a.page.evaluate(() => { document.body.click(); }); await tap(a.page, '#view [data-log="start"]'); await settle(a.page, 1500);
  const after = await a.page.evaluate(() => window.Saathi.joy.petals());
  check('4 trying for a baby: her period\'s petal counts, with no burst', after >= before && !(await has(a.page, '.joy-burst')), [before, after, await txt(a.page, '#joy-root')]);
  await done(a);
}

/* ---------- 5 each plan measures what it promises ---------- */
{
  /* the pain plan: her period began today */
  const ev = regular(28, { pain: 'pain_3' }).concat([{ d: TODAY, t: 'start' }]);
  const a = await open({ seed: { events: ev, intake: { goal: 'pain', pain: 'pk' }, mods: { plan: planOf('pain', 'pain', 30, { goal: 'pain' }) }, reminders: [planRem(30, '20:00')], settings: { notify: true } } });
  let v = await txt(a.page, '#view .pl-pain');
  check('5 pain plan, her period\'s first day: "Pain today?" with the day page\'s 4 answers', /Pain today\? No pain Mild Needed a painkiller Couldn't do my day/.test(v), [v, (await view(a.page)).slice(0, 900)]);
  check('5 ... no "noted for your results" line beside it', !/noted it for your results/.test(await view(a.page)));
  await go(a.page, 'plan-checkin');
  check('5 skipped on Today: the evening check-in asks', await has(a.page, '#view .pl-ci-pain [data-pl-pain="pain_2"]'));
  await go(a.page, 'home');
  await tap(a.page, '#view [data-pl-pain="pain_2"]');
  const s = await st(a.page);
  check('5 one tap saves it on that period', s.events.some((e) => e.d === TODAY && (e.t === 'start' || e.t === 'start_detail') && e.pain === 'pain_2') && !(await has(a.page, '#view .pl-pain')), s.events.filter((e) => e.d === TODAY));
  await go(a.page, 'plan-progress');
  v = await view(a.page);
  check('5 her results count it: periods that needed a painkiller, since she started (the last one, and today\'s)', /Periods that needed a painkiller Before 2 of 2 Since you started 2 of 2/.test(v), v.slice(0, 1200));
  await done(a);
}
{
  const ev = regular(28).concat([{ d: ago(1), t: 'start' }]);
  for (const k of ['shared', 'discreet']) {
    const a = await open({ seed: { events: ev, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', 30, { goal: 'pain' }) }, reminders: [planRem(30, '20:00')], settings: { notify: true, [k]: true } } });
    check('5 never on a ' + (k === 'shared' ? 'shared phone' : 'discreet screen'), !(await has(a.page, '#view .pl-pain')));
    await done(a);
  }
}
{
  /* the hot-flush goal */
  const meno = planOf('meno', 'hot', 9, { goal: 'cycles' });
  const a = await open({ seed: { dob: '1979-03-01', intake: { goal: 'hot', stage: 'meno' }, events: regular(20), mods: { plan: meno }, reminders: [planRem(9, '20:00')], settings: { notify: true } } });
  check('5 the hot-flush goal: "Hot flushes" in her quick chips, in Bloating\'s place (her periods still come)', await has(a.page, '#view [data-feel="d_hotflush"]') && !(await has(a.page, '#view [data-feel="d_bloat"]')));
  await tap(a.page, '#view [data-feel="d_hotflush"]');
  await go(a.page, 'plan-progress');
  const v = await view(a.page);
  check('5 her results count days with hot flushes', /Days with hot flushes/.test(v) && !/Fill in your weekly symptom diary/.test(v), v.slice(0, 1200));
  await done(a);
}
for (const g of ['hot', 'sleep']) {
  /* day 7 of her plan week, the weekly diary's day */
  const a = await open({ seed: { dob: '1979-03-01', intake: { goal: g, stage: 'meno' }, events: regular(20), mods: { plan: planOf('meno', g, 6, { goal: 'cycles' }) }, reminders: [planRem(6, '20:00')], settings: { notify: true } } });
  const ids = await a.page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => x.id));
  check('5 the weekly symptom diary: no step for ' + (g === 'hot' ? 'the hot-flush goal (her chip counts)' : 'the sleep goal either (Version 39.68: the Diary logs the same signs)'), ids.indexOf('diary') < 0, ids);
  await done(a);
}

/* ---------- 6 a doctor finding and her plan's offer, one card ---------- */
const PAIN_EV = [{ d: ago(60), t: 'start', pain: 'pain_3' }, { d: ago(56), t: 'end' }, { d: ago(32), t: 'start', pain: 'pain_3' }, { d: ago(28), t: 'end' }, { d: ago(4), t: 'start', pain: 'pain_3' }];
const joinedSeed = (lang, events, goal, tile) => ({ lang: lang, events: events, intake: { goal: goal, stage: 'cycle', pain: goal === 'pain' ? true : undefined }, focus: { tile: tile, goals: [goal], at: TODAY }, joined: TODAY,
  prompts: { setup: 'off', planCall: ago(3), firstLog: TODAY, planOffer: TODAY, notifyAuto: TODAY }, settings: { notify: true } });
for (const lang of ['en', 'hi']) {
  const a = await open({ w: 360, h: 800, seed: joinedSeed(lang, PAIN_EV, 'pain', 'cycle') });
  const pair = await txt(a.page, '#view .xp-pair');
  check('6 ' + lang + ' pain join, day 1: the doctor finding and her plan in one card', !!pair && await has(a.page, '#view .xp-pair [data-ask]') && await has(a.page, '#view .xp-pair [data-xp-off]') && (await a.page.$$('#view .xp-pair .xp-plan')).length === 1 && (lang === 'hi' ? /मेरा प्लान देखें/.test(pair) : /And meanwhile, a free plan/i.test(pair) && /See my plan/.test(pair)), pair);
  check('6 ' + lang + ' ... nothing folded: not inside "More from Sakhi", and no second offer card', await a.page.evaluate(() => !document.querySelector('#view .xp-pair').closest('details')) && !(await has(a.page, '#view .pl-offer')));
  check('6 ' + lang + ' ... the doctor comes first', await a.page.evaluate(() => { const c = document.querySelector('#view .xp-pair'); const ask = c.querySelector('[data-ask]'), plan = c.querySelector('[data-xp-off]'); return !!(ask.compareDocumentPosition(plan) & Node.DOCUMENT_POSITION_FOLLOWING); }));
  check('6 ' + lang + ' ... no sideways scroll at 360 px', await noScroll(a.page));
  await shot(a.page, '6-pair-' + lang);
  if (lang === 'en') { await tap(a.page, '#view .xp-pair [data-xp-off]'); check('6 "See my plan" opens her plan\'s questions from her joining answers', (await hashOf(a.page)) === 'plan-goal' && (await a.page.evaluate(() => (window.Saathi.mem.planIntake || {}).goal)) === 'pain'); }
  await done(a);
}
{
  const a = await open({ w: 360, h: 800, seed: joinedSeed('en', LONG, 'irregular', 'pmos') });
  const pair = await txt(a.page, '#view .xp-pair');
  check('6 PMOS join with long gaps: the finding and "My cycle plan" in one card', /longer than 35 days/.test(pair) && /My cycle plan|PMOS/.test(pair) && /See my plan/.test(pair), pair);
  await done(a);
}
{
  const a = await open({ w: 360, h: 800, seed: joinedSeed('en', regular(10), 'irregular', 'cycle') });
  check('6 with no finding, her plan\'s offer is the first card in "Sakhi says"', await a.page.evaluate(() => { const s = document.querySelector('#view .slot'); const first = s && s.querySelector(':scope > .card, :scope > .action, :scope > div'); return !!(first && first.classList.contains('pl-offer')); }), await txt(a.page, '#view .slot'));
  await done(a);
}
{
  /* a plan waiting to start, and a finding */
  const a = await open({ seed: { events: PAIN_EV, intake: { goal: 'pain' }, prompts: { setup: 'off', planCall: ago(3), firstLog: ago(3) }, settings: { notify: true } } });
  await a.page.evaluate((ik) => { window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); window.Saathi.render(); }, PAIN_IK); await settle(a.page, 500);
  check('6 a plan waiting to start sits in the finding\'s card too, opening her plan', await has(a.page, '#view .xp-pair [data-go="plan-reveal"]') && !(await has(a.page, '#view .pl-sl-go')), await txt(a.page, '#view .slot'));
  await done(a);
}

/* ---------- 7 safety one tap closer ---------- */
{
  const a = await open({ hash: '#post-feed', seed: { dob: '1994-05-01', situation: { deliveredOn: ago(10), breastfeeding: true }, events: [], intake: { goal: 'feed' } } });
  check('7 the feeding page\'s danger card: Call 108 and Call 102 open the dialer, and no 112 (Version 39.70)', await has(a.page, '#view a.pst-call[href="tel:108"]') && await has(a.page, '#view a.pst-call[href="tel:102"]') && !(await has(a.page, '#view a.pst-call[href="tel:112"]')));
  check('7 ... Copy stays, small, under them', await has(a.page, '#view .pst-copies [data-pst-copy="108"]'));
  await go(a.page, 'post');
  check('7 the after-birth page\'s danger card: Call 108, and no 112 or 14416 (Version 39.70)', await has(a.page, '#view a.pst-call[href="tel:108"]') && !(await has(a.page, '#view a.pst-call[href="tel:112"]')) && !(await has(a.page, '#view a.pst-call[href="tel:14416"]')));
  await go(a.page, 'home');   /* Version 39.68: Help is on Today */
  await tap(a.page, '#help-btn');
  check('7 Help\'s first row dials her ambulance: "Go to the nearest hospital now", 108 (Version 39.70)', await a.page.evaluate(() => { const f = document.querySelector('#sheet-root .hs-list > *'); return !!f && f.tagName === 'A' && f.getAttribute('href') === 'tel:108' && /Go to the nearest hospital now/.test(f.textContent) && /Ambulance: call 108/.test(f.textContent); }));
  await tap(a.page, '#hs-sos');
  check('7 ... "Other helplines" lists the ambulances, without 181', /108/.test(await sheet(a.page)) && /102/.test(await sheet(a.page)) && !/181/.test(await sheet(a.page)), await sheet(a.page));
  await done(a);
}
{
  /* Version 39.68 (the doctors' review: "not needed from the first screen"): no Help while she joins */
  const a = await open({ seed: false, hash: '' });
  check('7 no Help button on the first joining screen', !(await has(a.page, '#help-btn')));
  await done(a);
}

/* ---------- 8 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, android: { notify: true }, seed: { lang: 'hi', prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(5) } } });
  await a.page.evaluate((ik) => { window.Saathi.plan.startFromIntake(ik); window.Saathi.save(); }, PAIN_IK);
  await startCard(a.page);
  const line = await txt(a.page, '.pl-st-rem');
  check('8 hi: the Start card\'s line', line === 'रिमाइंडर चालू हैं: रात 9:15 की सैर, रात 10 बजे का चेक-इन और पीरियड से एक दिन पहले एक सूचना। लॉक स्क्रीन पर कुछ नहीं दिखता। इन्हें कभी भी मैं > रिमाइंडर में बदलें।' && await noScroll(a.page), line);
  await shot(a.page, '8-start-hi');
  await done(a);
}
{
  const a = await open({ w: 360, h: 800, seed: { lang: 'hi', mods: { plan: planOf('cycle', 'irregular', 84) }, reminders: [planRem(84, '20:00')], settings: { notify: true } } });
  check('8 hi: day 85\'s row', /आपके 12 हफ़्ते पूरे हुए आपके क़दम जारी रहेंगे।/.test(await txt(a.page, '#view .pl-carry')) && await noScroll(a.page), await txt(a.page, '#view .pl-carry'));
  await tap(a.page, '#help-btn');
  check('8 hi: Help\'s first row', /अभी सबसे पास के अस्पताल जाएँ/.test(await sheet(a.page)) && /एम्बुलेंस: 108 पर कॉल करें/.test(await sheet(a.page)), await sheet(a.page));
  await done(a);
}
{
  const ev = regular(28).concat([{ d: TODAY, t: 'start' }]);
  const a = await open({ w: 360, h: 800, seed: { lang: 'hi', events: ev, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', 30, { goal: 'pain' }) }, reminders: [planRem(30, '20:00')], settings: { notify: true } } });
  check('8 hi: "Pain today?"', /आज दर्द है\?/.test(await txt(a.page, '#view .pl-pain')) && await noScroll(a.page), await txt(a.page, '#view .pl-pain'));
  await done(a);
}

check('8 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'MINIMAL FAIL ' : 'MINIMAL OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
