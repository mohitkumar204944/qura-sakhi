// Version 30: how a woman gets the most from Sakhi (docs/ux-value-audit-2026-10-22.md, recommendations 1 to 9).
// Checks:
//   - search finds the tool she means: the audit's 18 searches, one row per screen, in Explore (Version 37: Today has no
//     ask box);
//   - Explore (Care until Version 37): "For you" shows her tools first, the old "tools" topic split into named groups; For you
//     has no government pages, and "Govt. services" is one row after it, not a topic card (Version 37: no Plans row, My plan is
//     a tab);
//   - Get care free: every free doctor, scheme and helper on one page, linked from Care and Help;
//   - Home's Today: the day's tablets, the plan's due row, today's journey step and her own reminders, each with one tap;
//   - a check-up today: the report one tap away;
//   - the setup card for her stage, one step at a time; Version 37: no "More for you" fold, one "Sakhi says" card with the
//     rest under "More from Sakhi";
//   - reminders: a row in Me, an empty Coming up offers one, the reminders centre and the period heads-up say when phone
//     alerts are off;
//   - what helps (rec 10): off until she turns it on, counted on the phone, sent once a month as buckets with no account;
//   - Hindi, discreet mode, no page errors, and nothing else sent anywhere.
// Usage: node test/value.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1992-07-01', consent: { c1: isoAgo(30), c2: null, c4: null }, situation: { stage: 'cycle' },
  events: [{ d: isoAgo(52), t: 'start' }, { d: isoAgo(47), t: 'end' }, { d: isoAgo(24), t: 'start' }, { d: isoAgo(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });
const ANDROID = 'window.SakhiAndroid = { schedule(){}, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, testNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, canBiometric(){ return false; }, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){} };';

const browser = await chromium.launch();
const sent = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  /* a server address, so anything the app sent would show up here */
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: o.app || 'test-0.30-demo', platform: o.android ? 'android' : 'web' }) + ';');
  if (o.android) await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
  await ctx.route(/^https?:/, (r) => { sent.push(r.request().url() + ' ' + (r.request().postData() || '')); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(300);
  if (o.sample) { await page.evaluate((w) => { const S = window.Saathi; const keep = Object.assign({}, S.state.settings); S.loadSample(w); S.state.settings = Object.assign(S.state.settings, keep); S.state.tours = JSON.parse(JSON.stringify(S.state.tours || {})); S.save(); }, o.sample); await go(page, 'learn'); await go(page, o.hash ? o.hash.slice(1) : 'home'); }
  return { ctx, page, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(250); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const card = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const text = (page, sel) => page.$eval(sel, (e) => e.textContent).catch(() => '');   /* also inside a closed fold */
const gos = (page, sel) => page.$$eval(sel, (b) => b.map((x) => x.dataset.go));
const setState = (page, fn, arg) => page.evaluate(fn, arg);
/* the tool rows a search shows, in order (Care's search box) */
async function careSearch(page, q) {
  return page.evaluate(async (q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); await new Promise((r) => setTimeout(r, 80));
    const sec = document.querySelector('#view .care-sec'); return sec && sec.querySelector('h2') && /tools|टूल/.test(sec.querySelector('h2').innerText) ? [...sec.querySelectorAll('[data-go]')].map((x) => x.dataset.go) : []; }, q);
}

/* ---------- 1. Search finds the tool she means (rec 4) ---------- */
const WANT = [['free doctor', ['access-doctor', 'access-free']], ['doctor', ['ask', 'access-doctor']], ['iron', ['iron']], ['pmmvy', ['access-schemes', 'access-schemes-preg']], ['scheme money', ['access-schemes', 'access-schemes-preg']],
  ['report', ['report']], ['asha', ['asha']], ['pregnancy plan', ['preg-plan']], ['near me', ['access-care']], ['hospital', ['access-care', 'access-doctor']], ['reminder', ['tools-reminders']], ['pcod', ['selfcheck', 'cond', 'explain']],
  ['white discharge', ['intimate-check', 'intimate']], ['safed pani', ['intimate', 'intimate-check']], ['मुफ़्त डॉक्टर', ['access-doctor', 'access-free']], ['आयरन', ['iron']], ['योजना', ['access-schemes', 'access-schemes-preg']], ['डॉक्टर', ['ask', 'access-doctor']]];
for (const who of ['meera', 'asha']) {
  const { ctx, page, errs } = await open({ hash: '#care', sample: who });
  const miss = []; let dup = false;
  for (const [q, ok] of WANT) { const r = await careSearch(page, q); if (ok.indexOf(r[0]) < 0) miss.push(q + ' -> ' + r.slice(0, 3).join(',')); if (new Set(r).size !== r.length) dup = true; }
  check('1 ' + who + ': all 18 of the audit\'s searches put the tool she means first', !miss.length, miss);
  check('1 ' + who + ': one row per screen (iron, ASHA and the free doctor page sit in several topics)', !dup);
  const pm = await careSearch(page, 'pmmvy');
  check('1 ' + who + ': scheme money puts her own stage\'s page first', who === 'meera' ? pm[0] === 'access-schemes-preg' : pm[0] === 'access-schemes', pm);
  const plan = await careSearch(page, 'plan');
  check('1 ' + who + ': "plan" finds the pregnancy plan, not "unplanned" pregnancy', plan[0] === 'preg-plan', plan);
  await go(page, 'home');
  check('1 ' + who + ': Version 37: search lives in Explore; Today has no ask box', !(await page.$('#home-q')) && !(await page.$('#view .qa-sec')));
  check('1 ' + who + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. Explore: her tools first, named groups (recs 3, 5, 9); Govt. services in one row (Version 36) ---------- */
for (const [who, want] of [['meera', ['preg-plan', 'iron', 'preg-week']], ['sunita', ['post-recovery', 'post-pelvic', 'iron']], ['asha', ['contra-mine', 'contra-missed', 'tools-reminders']], ['kamla', ['screen-mine', 'meno-diary']]]) {
  const { ctx, page, errs } = await open({ hash: '#care', sample: who });
  const all = await gos(page, '#view [data-go]'); const fy = await gos(page, '#view section.care-sec:first-of-type [data-go]');
  /* Version 39.2: Contents (all guides and articles) sits right under search, then For you */
  check('2 ' + who + ': Explore opens with Contents, then For you, her tools first, then Govt. services; no Plans row (My plan is a tab)', all[0] === 'learn' && all[1] === fy[0] && all.indexOf('plan') < 0 && want.every((r, i) => fy[i] === r) && !fy.some((r) => /^access-|^asha$/.test(r)) && all.indexOf('access-free') === all.indexOf(fy[fy.length - 1]) + 1, [all.slice(0, 8), fy]);
  check('2 ' + who + ': no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#care' });
  const topics = await gos(page, '#view .topic-grid [data-go]');
  /* Version 39.2 (journey audit MIN-12): the four tool drawers left the topics; their tools live in Me, Diary, Learn and My plan */
  check('2 no tool drawers among the topics, and Govt. services is a row, not a topic card', ['topic-plans', 'topic-records', 'topic-support', 'topic-fun'].every((x) => topics.indexOf(x) < 0) && topics.indexOf('topic-tools') < 0 && topics.indexOf('topic-free') < 0, topics);
  const cv = await view(page);
  check('2 Govt. services keeps its name', cv.indexOf('Govt. services') >= 0);
  await go(page, 'topic-free');
  const free = await gos(page, '#view .list [data-go]');
  check('2 Govt. services (the group) lists the hub, the free doctor, care near me, schemes, online and ASHA; Qura\'s doctor is in Support', ['access-free', 'access-doctor', 'access-care', 'access-schemes', 'access-online', 'asha'].every((x) => free.indexOf(x) >= 0) && free[0] === 'access-free' && free.indexOf('ask') < 0, free);
  await go(page, 'topic-support');
  check('2 Ask a Qura doctor sits in Support', (await gos(page, '#view .list [data-go]')).indexOf('ask') >= 0);
  await go(page, 'topic-records');
  const recs = await gos(page, '#view .list [data-go]');
  check('2 My records: the report for the doctor, reports and the summary', ['report', 'tools-reports', 'tools-summary'].every((x) => recs.indexOf(x) >= 0), recs);
  await go(page, 'topic-plans');
  const plans = await gos(page, '#view .list [data-go]');
  check('2 My plans and reminders: reminders, medicines, iron and the journeys', ['tools-reminders', 'tools-meds', 'iron', 'journey'].every((x) => plans.indexOf(x) >= 0), plans);
  await go(page, 'topic-fun');
  check('2 Just for fun has no Doctor\'s view while prototype labels are off', (await gos(page, '#view .list [data-go]')).indexOf('docportal') < 0);
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Get care free: one page for every free doctor, scheme and helper (rec 3) ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#help', seed: { mods: { access: { claims: { pmmvy: { ready: isoAgo(3) }, jsy: { ready: isoAgo(3) } } } } } });
  check('3 Help\'s doctor card opens Get care free', !!(await page.$('#view .doc-card [data-go="access-free"]')));
  await tap(page, '#view .doc-card [data-go="access-free"]'); await sleep(250);
  const rows = await gos(page, '#view .list [data-go]');
  /* Version 39.7: then the three Learn guides on how to use free care */
  check('3 rows: free government doctors, care near me, schemes, do it online, ASHA (government only), then how to use free care', JSON.stringify(rows.filter((r) => r.indexOf('a-') !== 0)) === JSON.stringify(['access-doctor', 'access-care', 'access-schemes', 'access-online', 'asha']) && rows.filter((r) => r.indexOf('a-services.') === 0).length === 3, rows);
  check('3 the schemes row counts her claims', /My claims: 2/.test(await view(page)));
  check('3 the emergency line: 112, and 108 or 102 for a free ambulance', /Emergency: call 112, or 108 or 102 for a free ambulance/.test(await view(page)));
  check('3 opening it is noted on the phone, for her setup card', await page.evaluate(() => !!window.Saathi.state.mods.access.seenFree));
  await go(page, 'care');
  check('3 Care has one Govt. services row', (await gos(page, '#view [data-go]')).filter((r) => r === 'access-free').length === 1 && /Govt\. services/.test(await page.$eval('#view .care-free', (e) => e.innerText)));
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. Home's Today (rec 1) ---------- */
{
  const { ctx, page, errs } = await open({ sample: 'asha' });
  const tday = await card(page, '#view .today-card');
  check('4 Asha (on the pill): Today has her pill, with one tap', /Today's pill/.test(tday) && !!(await page.$('#view .today-contra [data-today-act]')), tday);
  const top = await page.$eval('#view .today-card', (e) => e.getBoundingClientRect().top + window.scrollY);
  check('4 Today sits in the first one and a half screens (her pill was 2.3 screens down)', top < 1.5 * 844, top / 844);
  await tap(page, '#view .today-contra [data-today-act]'); await sleep(300);
  check('4 one tap marks today\'s pill taken, and the row goes', await page.evaluate((k) => (window.Saathi.state.mods.contra.log || {})[k] === 't', isoAgo(0)) && !(await page.$('#view .today-contra')));
  check('4 the old pill card is gone from the module cards', !/I took today's pill/.test(await view(page)));
  await setState(page, (k) => { const S = window.Saathi; S.reminders.upsert({ id: 'tools-c-test', mod: 'tools', kind: 'custom', title: { en: 'Buy sanitary pads', hi: 'पैड ख़रीदने हैं' }, start: k, every: null, time: '18:00', on: true }); S.save(); }, isoAgo(0));
  await go(page, 'learn'); await go(page, 'home');
  check('4 her own reminder due today is a row in Today', /Buy sanitary pads/.test(await card(page, '#view .today-card')));
  check('4 and Coming up does not repeat it', !/Buy sanitary pads/.test(await page.$$eval('#view .slot .card', (cs) => cs.filter((c) => /Coming up/.test(c.textContent)).map((c) => c.textContent).join(' '))));
  await tap(page, '#view .today-rem-tools-c-test [data-today-act]'); await sleep(300);
  check('4 Done marks the reminder done for today', (await page.evaluate(() => window.Saathi.reminders.get('tools-c-test').doneOn)) === isoAgo(0) && !/Buy sanitary pads/.test(await card(page, '#view .today-card')));
  await setState(page, () => { const S = window.Saathi; S.reminders.upsert({ id: 'tools-c-test2', mod: 'tools', kind: 'custom', title: { en: 'Buy sanitary pads', hi: 'पैड' }, start: S.toISO(S.today()), every: null, time: '19:00', on: true }); S.state.settings.discreet = true; S.save(); });
  await go(page, 'learn'); await go(page, 'home');
  const disc = await card(page, '#view .today-card');
  check('4 discreet mode: plain words only', /Reminder/.test(disc) && !/pads/i.test(disc), disc);
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ sample: 'meera' });
  const tday = await card(page, '#view .today-card');
  check('4 Meera (24 weeks): Today has her iron tablet and the plan\'s due row', /Iron tablet today/.test(tday) && /Due now:/.test(tday), tday);
  check('4 the old Due now strip and iron card are gone from Home', !(await page.$('#view .pg-due')) && !(await page.$('#view .iron-home')));
  check('4 at most four rows', (await page.$$('#view .today-it')).length <= 4);
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { mods: { journey: { active: 'iron', start: isoAgo(2), done: { 1: isoAgo(2) }, finished: {} } } } });
  check('4 today\'s journey step is a row in Today, with Done for today', /Day 3 of 21/.test(await card(page, '#view .today-card')) && !!(await page.$('#view .today-journey [data-today-act]')));
  await tap(page, '#view .today-journey [data-today-act]'); await sleep(300);
  check('4 one tap marks the step done', await page.evaluate(() => !!window.Saathi.state.mods.journey.done[3]) && !(await page.$('#view .today-journey')));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. A check-up today: the report one tap away (rec 7) ---------- */
{
  const { ctx, page, errs } = await open({ seed: { reminders: [{ id: 'tools-c-visit', mod: 'tools', kind: 'visit', title: { en: 'Follow-up at the PHC', hi: 'PHC पर दोबारा दिखाना' }, start: isoAgo(0), every: null, time: '10:00', on: true }] } });
  const vc = await card(page, '#view .visit-card');
  check('5 a visit today: "Going for a check-up today?", what the visit is, and the report', /Going for a check-up today\?/.test(vc) && /Follow-up at the PHC/.test(vc) && !!(await page.$('#view .visit-card [data-go="report"]')), vc);
  check('5 the visit is not also a Today row', !/Follow-up at the PHC/.test(await card(page, '#view .today-card')));
  await tap(page, '#visit-not'); await sleep(250);
  check('5 "Not today" hides it for today', !(await page.$('#view .visit-card')));
  await setState(page, () => { const S = window.Saathi; delete S.state.prompts.visit; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('5 discreet mode: no visit card', !(await page.$('#view .visit-card')));
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. The setup card (rec 2); Version 37: the next step only, inside Today's slot ---------- */
{
  const { ctx, page, errs } = await open({ seed: { dob: '1999-03-01', events: [] } });
  const su = await text(page, '#view .setup-card');
  check('6 a new woman: Set up Sakhi for you, the next step only, with the count', /Set up Sakhi for you/.test(su) && /Log your last period/.test(su) && /0 \/ 2/.test(su) && (await page.$$('#view .setup-it')).length === 1, su);
  check('6 the web prototype has no phone-reminders step', !/reminders on this phone/.test(su));
  check('6 the first-week petals card is gone', !/first three petals/.test(await view(page)));
  await page.$eval('#view .setup-it', (b) => b.click()); await sleep(300);
  check('6 "Log your last period" opens the period log', !!(await page.$('#sheet-root .sheet')));
  await page.evaluate(() => window.Saathi.closeSheet()); await sleep(150);
  await setState(page, (d) => { const S = window.Saathi; S.state.events.push({ d, t: 'start' }); S.save(); }, isoAgo(10)); await go(page, 'learn'); await go(page, 'home');
  const su2 = await text(page, '#view .setup-card');
  check('6 her period noted: the count goes up and the next step is free care near her (Mohit, 26 Oct: My ASHA stays off Today)', /1 \/ 2/.test(su2) && /Look at free care near you/.test(su2) && !/ASHA/.test(su2) && !/Log your last period/.test(su2), su2);
  await page.$eval('#view .setup-it', (b) => b.click()); await sleep(300);
  check('6 that step opens Get care free', await page.evaluate(() => location.hash === '#access-free'));
  await go(page, 'home');
  check('6 every step on Today done: the card is gone from Today', !(await page.$('#view .setup-card')));
  await go(page, 'me'); const su3 = await text(page, '#view .setup-card');
  check('6 Me keeps her ASHA\'s number as a step', /2 \/ 3/.test(su3) && /Save your ASHA or ANM’s number/.test(su3), su3);
  await page.$eval('#view .setup-it', (b) => b.click()); await sleep(300);
  check('6 that step opens My ASHA', await page.evaluate(() => location.hash === '#asha'));
  await go(page, 'me');
  await tap(page, '#setup-hide'); await sleep(250);
  check('6 "Hide this" hides it, and it stays hidden', !(await page.$('#view .setup-card')) && (await page.evaluate(() => window.Saathi.state.prompts.setup)) === 'off');
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ android: true, sample: 'meera' });
  /* Version 39.2: she joined months ago, so the setup card waits in Me */
  await go(page, 'me');
  const su = await text(page, '#view .setup-card');
  check('6 pregnant, on Android: the next of plan reminders, scheme money and her ASHA (her dates and iron are done)', (await page.$$('#view .setup-it')).length === 1 && [/Turn on your plan’s reminders/, /Check the scheme money you can get/, /Save your ASHA or ANM’s number/].filter((r) => r.test(su)).length === 1 && /2 \/ 5/.test(su), su);
  await setState(page, () => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'me');
  check('6 discreet mode: no setup card', !(await page.$('#view .setup-card')));
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ android: true });
  check('6 periods, on Android: no reminder step, phone reminders are on already (Version 39.27)', !/Turn on reminders on this phone/.test(await text(page, '#view .setup-card')) && await page.evaluate(() => window.Saathi.state.settings.notify === true));
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Version 37: no "More for you" fold; one "Sakhi says" card, the rest under "More from Sakhi" (rec 8 then) ---------- */
{
  const { ctx, page, errs } = await open({ sample: 'kamla' });
  check('7 no fold, no ask box and no flower on Today', !(await page.$('#view details.home-more')) && !(await page.$('#view .qa-sec')) && !(await page.$('#view .joy-strip')));
  const sl = await page.evaluate(() => { const s = document.querySelector('#view section.slot'); if (!s) return null; const more = s.querySelector('details.slot-more'); return { h: s.querySelector('.slot-h').innerText, shown: [...s.children].filter((c) => !c.matches('.slot-h') && c.tagName !== 'DETAILS').length, more: more ? { open: more.open, sum: more.querySelector('summary').innerText, n: more.querySelector('.slot-in').children.length } : null }; });
  check('7 "Sakhi says": one card shows, the rest fold under "More from Sakhi (n)", closed at first', sl && /Sakhi says/i.test(sl.h) && sl.shown === 1 && sl.more && !sl.more.open && sl.more.sum === 'More from Sakhi (' + sl.more.n + ')', sl);
  check('7 the slot comes after Today', await page.evaluate(() => { const m = document.querySelector('#view .slot'), t2 = document.querySelector('#view .today-card'); return !!m && !!t2 && !!(t2.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING); }));
  await tap(page, '#view details.slot-more > summary'); await sleep(150); await go(page, 'learn'); await go(page, 'home');
  check('7 open stays open while she moves around', !!(await page.$('#view details.slot-more[open]')));
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#home', seed: { stage: 'browse', events: [] } });
  check('7 just reading: her own short Home, with no Today, setup card or slot', !(await page.$('#view .slot')) && !(await page.$('#view .today-card')) && !(await page.$('#view .setup-card')) && /Just reading/.test(await view(page)));
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. Reminders everywhere they belong (rec 6) ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#me', android: true, seed: { settings: { notifyOff: true }, reminders: [{ id: 'tools-c-a', mod: 'tools', kind: 'custom', title: { en: 'A', hi: 'A' }, start: isoAgo(-3), time: '09:00', on: true }, { id: 'tools-c-b', mod: 'tools', kind: 'custom', title: { en: 'B', hi: 'B' }, start: isoAgo(-3), time: '09:00', on: false }] } });
  /* Version 39.2 (diet audit F11): one Reminders row in Me; her lists and the phone's alerts are inside it */
  check('8 Me: Reminders, with how many are on', /Reminders/.test(await view(page)) && /1 on/.test(await card(page, '#me-rem-list')), await card(page, '#me-rem-list'));
  await tap(page, '#me-rem-list'); await sleep(250);
  check('8 it opens the one Reminders page, which lists her reminders', await page.evaluate(() => location.hash === '#me-reminders') && !!(await page.$('#view [data-go="tools-reminders"]')));
  await tap(page, '#view [data-go="tools-reminders"]'); await sleep(250);
  check('8 Android with phone alerts she turned off: the centre says they will not ring, with a way to turn them on', /will not ring/.test(await view(page)) && !!(await page.$('#tl-alerts [data-go="me-reminders"]')));
  await setState(page, () => { const S = window.Saathi; S.state.settings.notify = true; S.save(); }); await go(page, 'me'); await go(page, 'tools-reminders');
  check('8 alerts on: no warning', !(await page.$('#tl-alerts')));
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { prompts: { setup: 'off' } } });
  check('8 no reminders yet (and no setup card): Coming up offers to set one, in Today\'s slot', !!(await page.$('#view .slot .cu-empty[data-go="tools-reminders"]')) && /Set a reminder/.test(await text(page, '#view .slot')));
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  /* regular 28-day cycles, the last start 23 days ago: the likely window opens in two days */
  const evs = [23, 51, 79, 107, 135, 163].flatMap((n) => [{ d: isoAgo(n), t: 'start' }, { d: isoAgo(n - 5), t: 'end' }]);
  const { ctx, page, errs } = await open({ android: true, seed: { events: evs, prompts: { setup: 'off' }, settings: { notifyOff: true } } });
  const hu = await card(page, '#view .hu-card');
  check('8 the period heads-up offers phone reminders while she has them off (Android); one tap turns them on (Version 39.27)', /Remind me on this phone/.test(hu) && !!(await page.$('#view .hu-card #hu-rem')), hu);
  await setState(page, () => { const S = window.Saathi; S.state.settings.notify = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('8 and not once they are on', !/Remind me on this phone/.test(await card(page, '#view .hu-card')));
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 9. Hindi, and a release build ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', seed: { lang: 'hi', dob: '1999-03-01', events: [] } });
  const v = await view(page);
  check('9 Hindi: the setup card and the slot', /Sakhi को अपने लिए तैयार करें/.test(v) && /Sakhi कहती है/i.test(v), v.slice(0, 600));
  await go(page, 'access-free');
  check('9 Hindi: Govt. services', /सरकारी सेवाएँ/.test(await view(page)) && /एम्बुलेंस/.test(await view(page)));
  await go(page, 'care');
  check('9 Hindi: Explore, Govt. services and her topics, with no Plans row and no drawers', /खोजें/.test(await view(page)) && !/आपके लिए प्लान/.test(await view(page)) && /सरकारी सेवाएँ/.test(await view(page)) && /आपके लिए विषय/.test(await view(page)) && !/बस मज़े के लिए/.test(await view(page)));
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#me', android: true, app: 'test-0.30', sample: 'priya' });
  check('9 a release APK: no Demo section on Me, even with a sample loaded', !/Try a sample woman|sample women/i.test(await view(page)) && !(await page.$('[data-demo]')));
  await go(page, 'demo'); await sleep(200);
  check('9 a release APK: a #demo link opens no sample women', !(await page.$('#sheet-root [data-sample]')));
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10. What helps (rec 10): her choice, counted on the phone, sent once a month with no account ---------- */
const lastMonth = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
{
  const { ctx, page, errs } = await open({ hash: '#me-privacy' });
  check('10 Me > Privacy: "Send what helps, once a month", off at first', !!(await page.$('[data-set="usage"]')) && !(await page.$eval('[data-set="usage"]', (e) => e.checked)) && /Help improve Sakhi/.test(await view(page)));
  await go(page, 'iron'); await go(page, 'me-privacy');
  check('10 off: nothing is counted', await page.evaluate(() => !window.Saathi.state.usage));
  await page.$eval('[data-set="usage"]', (e) => e.click()); await sleep(250);
  for (const r of ['iron', 'report', 'learn', 'iron', 'a-cycle.what-is-a-menstrual-cycle', 'loss', 'pregtest-abortion', 'intimate-safety', 'me-privacy']) await go(page, r);
  const u = await page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.usage)));
  check('10 on: each tool counts once a day, articles count as Learn, and loss, abortion and safety never count', u.n.iron === 1 && u.n.report === 1 && u.n.learn === 1 && Object.keys(u.n).length === 3, u);
  await page.$eval('#view .usage-see', (d) => { d.open = true; }); await sleep(100);
  check('10 she can see what would be sent', /Iron tablets/.test(await card(page, '#view .usage-see')) && /Days used: 1 · sent as 1/.test(await card(page, '#view .usage-see')), await card(page, '#view .usage-see'));
  await page.$eval('[data-set="usage"]', (e) => e.click()); await sleep(250);
  check('10 turning it off deletes the counts', await page.evaluate(() => !window.Saathi.state.usage && !window.Saathi.state.usagePrev));
  check('10 no page errors', !errs.length, errs);
  await ctx.close();
}
async function usageRun(extra) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: 'test-0.30-demo', platform: 'web' }) + ';');
  const seed = seedOf(Object.assign({ usage: { m: lastMonth, n: { iron: 7, report: 1, 'preg-plan': 3, loss: 4 }, last: {} } }, extra || {}));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test-token-0123456789abcdef', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001' })) + '); }');
  const got = [];
  await ctx.route(/^https?:/, (r) => { const q = r.request(); got.push({ url: q.url(), auth: q.headers()['authorization'] || null, body: q.postData() }); r.fulfill({ status: /\/v1\/usage$/.test(q.url()) ? 204 : 200, contentType: 'application/json', body: '' }); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install();
  await page.goto(PAGE + '#home', { waitUntil: 'load' });
  /* one second at a time, with real time between, so a request has time to go before its 15-second timeout */
  const isUsage = (x) => /\/v1\/usage$/.test(x.url);
  for (let i = 0; i < 5; i++) { await page.clock.runFor(1000); await sleep(15); }
  const early = got.filter(isUsage).length;
  for (let i = 5; i < 130 && !got.some(isUsage); i++) { await page.clock.runFor(1000); await sleep(15); }
  await sleep(400);
  return { ctx, page, errs, got, early, us: got.filter((x) => /\/v1\/usage$/.test(x.url)) };
}
{
  const r = await usageRun({ settings: { toursAuto: false, usage: true } });
  check('10 nothing goes at once (it waits a minute or two after she opens Sakhi)', r.early === 0);
  const b = r.us.length ? JSON.parse(r.us[0].body) : {};
  check('10 then last month goes once, as 1, 2-5 or 6+, and only tools on the list', r.us.length === 1 && b.month === lastMonth && JSON.stringify(b.counts) === JSON.stringify({ iron: '6+', report: '1', 'preg-plan': '2-5' }) && Object.keys(b).length === 2, r.us);
  check('10 without her account token', r.us.length === 1 && !r.us[0].auth);
  check('10 her other calls still carry it (last active)', r.got.some((x) => /me\/active$/.test(x.url) && /^Bearer /.test(x.auth || '')));
  check('10 once sent, the phone forgets last month', await r.page.evaluate(() => !window.Saathi.state.usagePrev));
  check('10 no page errors (sending)', !r.errs.length, r.errs);
  await r.ctx.close();
}
{
  const r = await usageRun();
  check('10 never turned on: nothing goes', r.us.length === 0);
  await r.ctx.close();
}

check('nothing was sent anywhere', sent.length === 0, sent);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(failed.length ? 'VALUE FAIL ' + (results.length - failed.length) + '/' + results.length : 'VALUE OK ' + results.length + '/' + results.length);
process.exit(failed.length ? 1 : 0);
