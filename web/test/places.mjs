// Version 39.2: fewer places to look (docs/roadmap-v39-2026-10-24.md, section 3; MODULE_API section 45). This file checks:
//   1 Explore by stage (Version 39.10: only her stage, no All topics) and Contents; a shared phone keeps the full grid; after a loss, its own topic first;
//   2 a topic opens its own guide;  3 the tool drawers' tools have homes (Me, Diary, Learn, My plan);
//   4 Today for you, Doctor videos and the stories page are gone;  5 one pregnancy checklist page; "My baby is born";
//   6 one picker on My plan, journeys as reading;  7 the setup card retires after 30 days;  8 one name for each thing;
//   9 Back goes to Today;  10 Me's label and the intended-use line;  11 the gate: Help, 112, loss (Help, then Pregnancy loss),
//   violence, STI and abortion within 2 taps of Explore and in search (Version 39.62: from every screen, through Help);
//   12 Hindi, 360 px, no page errors. Version 39.62 (phase D): her topics and Contents are in the library, a tap from Explore.
// Usage: node test/places.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'places'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the Android bridge, keeping what Sakhi asks it to schedule */
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.2-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
const REC_OK = { danger: ['none'], bleed: 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', sleep: 'some' };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const vtext = (page) => page.$eval('#view', (e) => e.textContent);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const search = async (page, q) => { await go(page, 'care'); await page.evaluate((x) => { window.Saathi.mem.careQ = x; window.Saathi.render(); }, q); await settle(page, 300); return page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go)); };
const errsAll = [];

const cyc = (gaps, last) => { const ds = [last]; let x = last; for (let i = gaps.length - 1; i >= 0; i--) { x += gaps[i]; ds.unshift(x); } const out = []; ds.forEach((a) => out.push({ d: ago(a), t: 'start' }, { d: ago(a - 4), t: 'end' })); return out; };
/* Version 39.62: her topics are in the library, one row from Explore */
const topics = async (page) => { if (!(await has(page, '#view .topic-grid'))) await go(page, 'library'); return page.$$eval('#view .topic-grid [data-go]', (x) => x.map((y) => y.dataset.go.replace('topic-', ''))); };

/* ---------- 1. Explore by stage, and Contents (journey audit MIN-07, P3-11; Version 39.10: no All topics) ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#care' });
  const t1 = await topics(a.page);
  check('1 a woman tracking her periods sees her own topics first, no pregnancy or menopause', t1.indexOf('periods') >= 0 && t1.indexOf('contra') >= 0 && t1.indexOf('preg') < 0 && t1.indexOf('meno') < 0 && t1.indexOf('post') < 0, t1);
  check('1 no tool drawers among the topics', !t1.some((x) => ['plans', 'records', 'support', 'fun'].indexOf(x) >= 0), t1);
  /* Version 39.62: Contents moved from under Explore's search to the library */
  check('1 "Contents: all guides and articles" is in the library', /Contents: all guides and articles/.test(await txt(a.page, '#view .care-contents')) && (await a.page.evaluate(() => location.hash)) === '#library' && await a.page.evaluate(() => { const s = document.querySelector('#view .searchbox'); return !s || !s.nextElementSibling || !s.nextElementSibling.classList.contains('care-contents'); }));
  check('1 Version 39.10: no "All topics": other stages stay out of her way', !(await has(a.page, '#topics-all')) && t1.indexOf('loss') < 0, t1);
  const nC = +((await txt(a.page, '#view .care-contents')).match(/\d+/) || [0])[0];
  await go(a.page, 'learn'); await tap(a.page, '#view .tabs [data-g="all"]'); const nL = ((await vtext(a.page)).match(/\d+ of \d+ read/g) || []).reduce((n, x) => n + +x.match(/of (\d+)/)[1], 0);
  check('1 Contents counts the articles in her own chapters (the same as Learn shows)', nC > 0 && nC === nL, [nC, nL]);
  await shot(a.page, '01-explore-cycle'); errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: PREG(20), hash: '#care' });
  const t3 = await topics(b.page);
  check('1 pregnant: pregnancy, after the birth and contraception (for after the birth), no trying or missed-period topics', t3[0] === 'preg' && t3.indexOf('post') >= 0 && t3.indexOf('contra') >= 0 && t3.indexOf('ttc') < 0 && t3.indexOf('pregtest') < 0, t3);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: regular(10), settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#care' });
  const t4 = await topics(c.page);
  check('1 a shared phone keeps the full grid (a stage-only grid would show her stage)', t4.indexOf('preg') >= 0 && t4.indexOf('meno') >= 0 && !(await has(c.page, '#topics-all')), t4);
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { situation: { pregEndedOn: ago(10) } }, hash: '#care' });
  const t5 = await topics(d.page);
  check('1 after a loss: the loss topic first, and nothing about trying, preventing or a missed period', t5[0] === 'loss' && ['contra', 'ttc', 'pregtest'].every((x) => t5.indexOf(x) < 0), t5);
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 2. A topic opens its own guide, with the Learn articles under it (journey audit MIN-11) ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#topic-periods' });
  const h1 = await txt(a.page, '#view h1');
  const hub = await open({ seed: { events: regular(10) }, hash: '#periods' });
  check('2 the Periods topic is the periods guide itself', h1 === await txt(hub.page, '#view h1') && /Articles to read/.test(await vtext(a.page)), h1);
  const gos = await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go));
  check('2 ... with no second list of the same guides', gos.filter((g, i) => gos.indexOf(g) !== i && /^periods-/.test(g)).length === 0, gos);
  errsAll.push(...a.errs, ...hub.errs); await a.ctx.close(); await hub.ctx.close();
}

/* ---------- 3. The drawers' tools have homes ---------- */
{
  const a = await open({ seed: { events: regular(10), mods: { plan: planOf('pain', 'pain', ago(5)) } } });
  await go(a.page, 'me');
  check('3 Me has one Reminders row (not two)', (await a.page.$$('#view [data-go="me-reminders"]')).length === 1 && !(await has(a.page, '#view [data-go="tools-reminders"]')));
  await go(a.page, 'me-reminders');
  const rg = await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go));
  check('3 ... which lists her reminders, medicines and iron tablets', ['tools-reminders', 'tools-meds', 'iron'].every((r) => rg.indexOf(r) >= 0), rg);
  await go(a.page, 'me');
  check('3 Language sits in Me, named in English and Hindi, with an अ/A mark', /Language|भाषा/.test(await vtext(a.page)) && /भाषा/.test(await txt(a.page, '#view [data-go="lang"]')) && /अ\/A/.test(await txt(a.page, '#view [data-go="lang"]')));
  await go(a.page, 'diary'); await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(a.page, 300);
  check('3 her records (the reports page) sit in Diary\'s What it shows', await has(a.page, '#view .wis-records [data-go="tools-reports"]'));
  await go(a.page, 'learn');
  check('3 Sach ya Myth sits with the library', await has(a.page, '#view .learn-quiz [data-go="joy-quiz"]'));
  await go(a.page, 'plan');
  check('3 her garden sits on My plan', await has(a.page, '#view .pl-garden [data-go="joy"]'));
  const s1 = await search(a.page, 'bhasha');
  check('3 search still finds Language', s1.indexOf('lang') >= 0, s1.slice(0, 5));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 4. Today for you, Doctor videos and the stories page are gone (Mohit's decision 3) ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  check('4 no Today for you, Doctor videos or stories routes', await a.page.evaluate(() => ['access-feed', 'access-videos', 'access-stories'].every((r) => !window.Saathi.routeOwner(r))));
  const s1 = await search(a.page, 'doctor videos'); const s2 = await search(a.page, 'today for you');
  check('4 ... and search doesn\'t offer them', s1.concat(s2).every((r) => ['access-feed', 'access-videos'].indexOf(r) < 0), s1.concat(s2).slice(0, 8));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 5. One pregnancy plan page; "My baby is born" (journey audit J-09, J-17) ---------- */
{
  const a = await open({ seed: PREG(30) });
  const hb = await a.page.$$eval('#view .hero [data-go], #view .hero button', (x) => x.map((y) => y.dataset.go || y.id || y.textContent.trim()));
  check('5 at 30 weeks the hero has "Check-ups and tests", no second "This week" and no "Check-up visits"', /Check-ups and tests/.test(await txt(a.page, '#view .hero')) && !/Check-up visits/.test(await txt(a.page, '#view .hero')) && hb.indexOf('preg-week') < 0 && !(await has(a.page, '#bb-born')), hb);
  await go(a.page, 'preg-plan');
  check('5 the checklist page is called "Check-ups and tests"', /Check-ups and tests/.test(await txt(a.page, '#view h1')), await txt(a.page, '#view h1'));
  await go(a.page, 'pregnancy');
  check('5 the old check-up visits page opens the same checklist', await a.page.evaluate(() => location.hash) === '#preg-plan');
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: Object.assign({}, PREG(38), { mods: { plan: planOf('preg', 'food', ago(20)) } }) });
  check('5 from 37 weeks: "My baby is born" on Today', /My baby is born/.test(await txt(b.page, '#bb-born')));
  await tap(b.page, '#bb-born');
  check('5 ... which opens the stage sheet at After birth', await has(b.page, '#sheet-root #st-birth'));
  await b.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await go(b.page, 'plan');
  check('5 her pregnancy plan has "My baby is born" too', /My baby is born/.test(await txt(b.page, '#view .pl-born')));
  await b.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); }); await go(b.page, 'home');
  check('5 a shared phone sees "Change stage", not "My baby is born"', /Change stage/.test(await txt(b.page, '#bb-born')) && !/baby/i.test(await txt(b.page, '#bb-born')));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 6. One picker on My plan (journey audit J-11, P2-12) ---------- */
{
  const heavy = [70, 42, 14].map((x, i) => ({ d: ago(x), t: 'start', pads: i ? 'pads_4' : 'pads_2' })).concat([70, 42, 14].map((x) => ({ d: ago(x - 5), t: 'end' })));
  const a = await open({ seed: { events: heavy }, hash: '#plan' });
  check('6 no second goal list ("What you want help with")', !(await has(a.page, '#pl-help')));
  check('6 at most 3 suggestions', (await a.page.$$('#view .pl-sec .pl-rec')).length <= 3);
  check('6 no 21-day journeys offered as plans', !(await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go))).some((r) => /^journey-/.test(r)));
  check('6 the goal her diary points to is marked "Suggested"', /Suggested/.test(await txt(a.page, '#view [data-pl-pick="heavy"]')), await txt(a.page, '#view [data-pl-pick="heavy"]'));
  errsAll.push(...a.errs); await a.ctx.close();
  const j = await open({ seed: { events: regular(10) }, hash: '#journey-iron' });
  check('6 a journey page is for reading: no Start, and a way to My plan', !(await has(j.page, '#jr-start')) && await has(j.page, '#view [data-go="plan"]'));
  errsAll.push(...j.errs); await j.ctx.close();
}

/* ---------- 7. The setup card retires from Today after 30 days (journey audit J-24) ---------- */
{
  const a = await open({ seed: { events: [], consent: { c1: ago(40), c2: null, c4: null }, prompts: { notifyIntro: ago(3), planCall: ago(3) }, settings: { toursAuto: false, notify: false } } });
  check('7 after 30 days: no setup card on Today', !(await has(a.page, '#view .setup-card')));
  await go(a.page, 'me');
  check('7 ... it waits in Me while unfinished', await has(a.page, '#view .setup-card'));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: [], consent: { c1: ago(5), c2: null, c4: null }, prompts: { notifyIntro: ago(3), planCall: ago(3) }, settings: { toursAuto: false, notify: false } } });
  check('7 in her first 30 days it is still on Today', /Set up Sakhi/.test(await vtext(b.page)));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 8. One name for each thing (diet audit F11) ---------- */
{
  const a = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(10)) } } });
  await go(a.page, 'plan');
  const v = await vtext(a.page);
  check('8 My plan says "Report for my doctor", not "Report for any doctor"', /Report for my doctor/.test(v) && !/Report for any doctor/.test(v));
  const sum = await a.page.evaluate(() => (window.Saathi.summaries ? window.Saathi.summaries() : []).map((m) => (m.sections || []).map((x) => x.title).join('|')).join('|'));
  check('8 the doctor summary names her plan, not "PMOS plan"', !/PMOS plan/.test(sum), sum);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 9. Back goes to Today; Back on Today closes the app (diet audit F13) ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  check('9 Back on Today closes the app', await a.page.evaluate(() => window.__sakhiBack()) === 'exit');
  await a.page.$eval('#tabbar [data-go="care"]', (b) => b.click()); await settle(a.page, 300);
  const len = await a.page.evaluate(() => history.length);
  await a.page.$eval('#tabbar [data-go="diary"]', (b) => b.click()); await settle(a.page, 300);
  check('9 a tab replaces the history entry', await a.page.evaluate(() => history.length) === len && await a.page.evaluate(() => location.hash) === '#diary');
  const back = await a.page.evaluate(() => window.__sakhiBack()); await settle(a.page, 300);
  check('9 Back from a tab goes to Today', back === true && await a.page.evaluate(() => location.hash) === '#home');
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 10. Me: its label, and the intended-use line ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  check('10 Me is labelled "Me / मैं" in the top bar', /Me \/ मैं/.test(await txt(a.page, '#topbar [data-go="me"]')));
  await go(a.page, 'me-about');
  check('10 About says what Sakhi is, and that it doesn\'t diagnose', /A period diary, a guide and habit plans\. Sakhi doesn’t diagnose; a doctor does\./.test(await vtext(a.page)));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 11. The gate: Help, 112, loss, violence, STI and abortion within 2 taps of Explore, and in search ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#care' });
  await tap(a.page, '#help-btn');
  check('11 Help: 1 tap (the top bar)', await has(a.page, '#sheet-root .hs-list'));
  await tap(a.page, '#hs-sos');
  check('11 112: 2 taps (Help, then emergency numbers)', /112/.test(await txt(a.page, '#sheet-root')));
  await a.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await go(a.page, 'care');
  /* Version 39.62 (phase D): Explore's topics are a tap further, so the three pages are in Help, 2 taps from every screen */
  const reach = async (route) => { await go(a.page, 'care'); await tap(a.page, '#help-btn');
    if (!(await has(a.page, '#sheet-root [data-hs-go="' + route + '"]'))) return false; await tap(a.page, '#sheet-root [data-hs-go="' + route + '"]'); return (await a.page.evaluate(() => location.hash)) === '#' + route; };
  check('11 STI: 2 taps (Help, then STI tests)', await reach('intimate-sti'));
  check('11 violence: 2 taps (Help, then Violence and your safety)', await reach('intimate-safety'));
  check('11 abortion: 2 taps (Help, then Safe, legal abortion)', await reach('pregtest-abortion'));
  await go(a.page, 'care'); const inGrid = await has(a.page, '#view [data-go="topic-loss"]');
  await tap(a.page, '#help-btn'); await tap(a.page, '#hs-loss');
  check('11 pregnancy loss: 2 taps from any screen (Help, then Pregnancy loss), not in her grid', !inGrid && (await a.page.evaluate(() => location.hash)) === '#loss' && await has(a.page, '#view [data-go="loss-types"]'));
  for (const [q, r] of [['miscarriage', /^loss/], ['violence', /intimate-safety/], ['sti', /intimate-sti/], ['abortion', /pregtest-abortion/]]) {
    const res = await search(a.page, q); check('11 search "' + q + '" finds it', res.some((x) => r.test(x)), res.slice(0, 5));
  }
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 12. Hindi, 360 px, no page errors ---------- */
{
  const a = await open({ seed: { lang: 'hi', events: regular(10) }, lang: 'hi', w: 360, h: 800, hash: '#care' });
  check('12 Hindi: "आपके लिए विषय" (Version 39.62: in the library)', (await topics(a.page)).length > 0 && /आपके लिए विषय/.test(await vtext(a.page)));
  check('12 360 px: no sideways scroll in the library', await noScroll(a.page)); await go(a.page, 'care');
  check('12 360 px: no sideways scroll on Explore', await noScroll(a.page));
  await go(a.page, 'home');
  check('12 360 px: the top bar fits with Me labelled', await noScroll(a.page));
  await shot(a.page, '12-hindi-360'); errsAll.push(...a.errs); await a.ctx.close();
}
/* ---------- 13. The V39.2 and V39.3 review (review-v39-2-3): one check per confirmed finding ---------- */
{
  /* PLACES-01: no second row for the checklist, the old pregnancy page replaces itself, and the checklist changes her dates */
  const a = await open({ seed: Object.assign({}, PREG(20)), hash: '#care' });
  await go(a.page, 'topic-preg');
  check('13 PLACES-01 the Pregnancy topic has one row for her check-ups', !(await has(a.page, '#view [data-go="pregnancy"]')) && await has(a.page, '#view [data-go="preg-plan"]'));
  await go(a.page, 'pregnancy'); const h1 = await a.page.evaluate(() => location.hash);
  await a.page.evaluate(() => history.back()); await settle(a.page, 500); const h2 = await a.page.evaluate(() => location.hash);
  check('13 PLACES-01 ... an old #pregnancy link lands on Check-ups and tests, and Back leaves it', h1 === '#preg-plan' && h2 === '#topic-preg', [h1, h2]);
  await go(a.page, 'preg-plan');
  check('13 PLACES-01 ... which offers "Change my dates"', await has(a.page, '#view .pg-dates[data-go="me-health"]'));
  errsAll.push(...a.errs); await a.ctx.close();
  /* PLACES-02: the setup card leaves Today 30 days after she joined, for a diary with no consent date too */
  const b = await open({ seed: { consent: { c1: null }, fullTour: { st: 'done', d: ago(45) }, events: [{ d: ago(70), t: 'start' }, { d: ago(65), t: 'end' }, { d: ago(15), t: 'start' }, { d: ago(10), t: 'end' }], prompts: { notifyIntro: ago(3), planCall: ago(3) } } });
  check('13 PLACES-02 a diary from before: her join date comes from her first tour (not a backdated period), and the setup card has left Today', (await b.page.evaluate(() => window.Saathi.state.joined)) === ago(45) && !(await has(b.page, '#view .today-setup, #view .setup-card')), await b.page.evaluate(() => window.Saathi.state.joined));
  errsAll.push(...b.errs); await b.ctx.close();
  /* PLACES-03: My PMOS plan is suggested only to a woman with PMOS */
  const c = await open({ seed: { goals: ['track', 'weight'], events: regular(10) }, hash: '#plan' });
  const ids3 = await c.page.evaluate(() => (window.Saathi.plan.recs() || []).map((x) => x.id));
  check('13 PLACES-03 no PMOS, a weight goal: "My PMOS plan" isn\'t suggested', ids3.indexOf('plan-pmos') < 0, ids3);
  errsAll.push(...c.errs); await c.ctx.close();
  /* PLACES-05: abortion, STI and violence pages within 2 taps at every stage; PLACES-09: teen mode's topic first */
  for (const [nm, sd, want] of [['after a birth', { situation: { deliveredOn: ago(30) }, events: [] }, 'pregtest'], ['midlife', { dob: '1976-03-01', situation: { midlife: true } }, 'pregtest'], ['just reading', { stage: 'browse', events: [] }, 'intimate']]) {
    const x = await open({ seed: sd, hash: '#care' }); const tp = await topics(x.page);
    check('13 PLACES-05 ' + nm + ': "' + want + '" is one of her topics', tp.indexOf(want) >= 0, tp);
    errsAll.push(...x.errs); await x.ctx.close();
  }
  const pg = await open({ seed: PREG(20), hash: '#care' }); await go(pg.page, 'topic-preg');
  check('13 PLACES-05 pregnant: "Your choices" (options, safe abortion) from her pregnancy topic: 2 taps', await has(pg.page, '#view [data-go="pregtest-options"]'));
  errsAll.push(...pg.errs); await pg.ctx.close();
  const tn = await open({ seed: { stage: 'browse', events: [], dob: null }, hash: '#care' });
  await tn.page.evaluate(() => { window.Saathi.mem.teen = true; window.Saathi.render(); }); await settle(tn.page, 300);
  check('13 PLACES-09 teen mode: "Girls and families" is her first topic', (await topics(tn.page))[0] === 'teen', await topics(tn.page));
  errsAll.push(...tn.errs); await tn.ctx.close();
  /* PLACES-06: the partner page, the family page and the relief routines each have a topic */
  const d = await open({ seed: { events: regular(10) }, hash: '#care' });
  const inT = async (sec, r) => { await go(d.page, 'topic-' + sec); return has(d.page, '#view [data-go="' + r + '"]'); };
  /* Version 39.7 (P3-18): the partner page is cards on For my family now, with no tile of its own */
  check('13 PLACES-06 the family page sits in Girls and families, relief in Periods, and the partner page has no tile of its own', !(await inT('contra', 'access-partner')) && (await inT('teen', 'family')) && (await inT('periods', 'relief')));
  errsAll.push(...d.errs); await d.ctx.close();
  /* PLACES-07: a finished journey points to My plan, and doesn't start again */
  const e = await open({ seed: { mods: { journey: { active: 'iron', start: ago(25), done: { 1: ago(25), 2: ago(24) }, finished: {} } } }, hash: '#journey-iron' });
  check('13 PLACES-07 a finished journey: no "Do it again", and "Open My plan"', !(await has(e.page, '#jr-again')) && await has(e.page, '#view [data-go="plan"]'));
  errsAll.push(...e.errs); await e.ctx.close();
  /* PLACES-08: the checklist has one name */
  const f = await open({ seed: Object.assign({}, PREG(20), { mods: { plan: planOf('cycle', 'irregular', ago(80), { chg: ago(80) + ':cycle' }) } }), hash: '#plan' });
  const fv = await vtext(f.page);
  check('13 PLACES-08 the paused card\'s button is "Check-ups and tests", not "My pregnancy plan"', !/My pregnancy plan<|>My pregnancy plan/.test(await f.page.$eval('#view', (x) => x.innerHTML)) && /Check-ups and tests/.test(fv), fv.slice(0, 300));
  errsAll.push(...f.errs); await f.ctx.close();
}
check('12 no page errors (and in 13)', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
