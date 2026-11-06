// Version 39.28: your doctor first (Mohit, 28 Oct: "I want to not always keep pushing for Asha/ANM because women in tier 1
// and 2 will be consulting a private gynaecologist"; mockup claude.ai/artifact/TyUgHfhf9GNmpkEsMkMnsu; MODULE_API section 71).
// One question while she joins, "Where do you usually go for women's health?", sets every care line on the most-used screens.
// The government and ASHA words stay for a woman who picks a government centre or her ASHA; before she answers, and with a
// private doctor or "Nowhere yet", Sakhi says "your doctor" and the free government options become one quiet line. This file
// checks:
//   1 joining: the question after Details, its 4 answers, one tap on, Back, Continue without an answer, her answer saved;
//   2 Me: "Where I get care" and its sheet (Done saves, closing keeps), S.care for the modules;
//   3 iron tablets: her doctor's dose first, "How often did your doctor say?" (every other day: a day off after a tablet, the
//     reminder 2 days after her last one; once a week asks the day), the next strip from her chemist or doctor, one quiet line
//     for the free tablet, help lines that name her doctor; the government route as before;
//   4 pregnancy check-ups: her gynaecologist, her reports, no registration, PMSMA, JSSK or scheme money cards (one quiet line
//     instead), no MCP card or U-WIN buttons, the same tests and weeks; the government route as before;
//   5 after the birth: her own check with her gynaecologist, vaccines from the baby's doctor, iron and calcium as prescribed,
//     the ASHA's visit days folded behind one line, no "Next ASHA visit" on the hub; her ASHA's route as before;
//   6 Help: "See a doctor" names Qura first, "My ASHA" only for the government route (or a saved number), the free government
//     doctor after Qura's ways on the doctor screen; 112 first for everyone;
//   7 What your diary shows: the iron line and the pregnancy-test line in her route's words;
//   8 Hindi at 360 px, no sideways scroll, no page errors;
//   9 Version 39.29, the doctor route everywhere: every "_doc" string and Learn override in order, the switch both ways (t, tx,
//     the Learn library), no ASHA or ANM push left without its doctor-route words, and a Learn guide in English and Hindi.
// Usage: node test/care.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'care'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';   /* a Wednesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.28-pilot', platform: 'android' };
/* three periods 28 days apart, the last `last` days ago, 5 days each */
const regular = (last, extra) => { const out = []; [last + 56, last + 28, last].forEach((x, i) => out.push(Object.assign({ d: ago(x), t: 'start' }, i === 2 ? extra || {} : {}), { d: ago(x - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd', yoga: 'd' }, plate: { half: true } }; return l; };
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: logged(startAgo, 5), weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const PREG = (care) => ({ situation: Object.assign({ pregnant: true, pregnantSince: ago(19 * 7) }, care ? { care } : {}), events: [] });
const POST = (care) => ({ situation: Object.assign({ deliveredOn: ago(2), breastfeeding: true }, care ? { care } : {}), events: [] });

const browser = await chromium.launch();
const errsAll = [];
/* a woman already using Sakhi, on a fixed day */
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  return { ctx, page, errs };
}
/* a new install, joining on the real clock (like joining.mjs) */
async function openJoin(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, errs, real: true };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const pause = (a, ms) => (a.real ? sleep(ms) : settle(a.page, ms));
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await pause(a, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await pause(a, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const all = (a, sel) => a.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(care|me_care|iron|preg|post|hs)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
async function signUp(a) {
  const page = a.page;
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(a, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 8000 });
  if (await has(a, '#su-done')) { await page.fill('#su-pin', '302001'); await tap(a, '#su-done'); }
  await sleep(700);
}

/* ---------- 1 and 2: joining asks once; Me changes it ---------- */
{
  const a = await openJoin();
  await join(a.page, { name: 'Riya', tile: 'cycle', goals: ['pain'], stop: 'care' });
  let v = await view(a);
  check('1 after her details: "Where do you usually go for women’s health?", with why Sakhi asks', /Where do you usually go for women’s health\?/.test(v) && /Sakhi then points you to the right place for check-ups, tests and tablets\./.test(v), v.slice(0, 300));
  check('1 ... 4 answers, each with its line', (await a.page.$$('[data-ob-care]')).length === 4 && /A private gynaecologist or doctor\s*A clinic or a private hospital/.test(v) && /A government hospital or health centre\s*PHC, CHC, district hospital or Ayushman Arogya Mandir/.test(v) &&
    /My ASHA or ANM\s*She visits me at home/.test(v) && /Nowhere yet\s*Sakhi shows you both kinds/.test(v), v.slice(0, 700));
  check('1 ... "You can change this any time in Me.", a Continue button, and still the Details part of joining', /You can change this any time in Me\./.test(v) && await has(a, '#ob-care-go') && /Details/.test(await txt(a, '.ob-parts .on')));
  await shot(a, 'join-care');
  await tap(a, '#ob-back');
  check('1 Back returns to her details', await has(a, '#ob-next') && !(await has(a, '[data-ob-care]')));
  await tap(a, '#ob-next');
  await tap(a, '[data-ob-care="private"]');
  check('1 one tap on an answer goes on to "Does anyone else use this phone?"', await has(a, '[data-ob-sh]'));
  await tap(a, '#ob-back');
  check('1 ... and Back shows her answer picked', await a.page.$eval('[data-ob-care="private"]', (e) => e.getAttribute('aria-pressed')).catch(() => '') === 'true');
  await tap(a, '#ob-care-go');
  await tap(a, '[data-ob-sh="me"]'); await signUp(a);
  const s = await st(a);
  check('1 her answer is saved with her stage (situation.care)', s.situation.care === 'private', s.situation);
  check('2 S.care: route "private", not the government route', await a.page.evaluate(() => window.Saathi.care.route() === 'private' && !window.Saathi.care.gov() && !window.Saathi.care.asha()));
  await go(a, 'me');
  check('2 Me: "Where I get care · A private gynaecologist or doctor", after her stage', /Where I get care\s*A private gynaecologist or doctor/.test(await txt(a, '#me-care')) && await a.page.evaluate(() => { const h = document.querySelector('#view [data-go="me-health"]'); const c = document.querySelector('#me-care'); return !!h && !!c && h.nextElementSibling === c; }), await txt(a, '#me-care'));
  await done(a);
}
{
  const a = await openJoin();
  await join(a.page, { name: 'Asha', tile: 'preg', stop: 'share' });   /* Continue on the care question, without an answer */
  await tap(a, '[data-ob-sh="me"]'); await signUp(a);
  let s = await st(a);
  check('1 Continue without an answer saves none: Sakhi says "your doctor"', !('care' in s.situation) && await a.page.evaluate(() => window.Saathi.care.route() === null && !window.Saathi.care.gov()), s.situation);
  await go(a, 'me');
  check('2 ... and Me says "Not chosen yet"', /Where I get care\s*Not chosen yet/.test(await txt(a, '#me-care')), await txt(a, '#me-care'));
  await tap(a, '#me-care');
  const sh = await txt(a, '.sheet');
  check('2 the sheet: the same question, 4 answers, what it changes, Done', /Where do you usually go for women’s health\?/.test(sh) && (await a.page.$$('.sheet [data-care]')).length === 4 && /This changes where Sakhi sends you for check-ups, tests and tablets\. Emergency numbers stay the same for everyone\./.test(sh) && await has(a, '#care-done'), sh);
  await shot(a, 'me-sheet');
  await tap(a, '.sheet [data-care="asha"]');
  check('2 a tap picks an answer, not saved until Done', await a.page.$eval('.sheet [data-care="asha"]', (e) => e.getAttribute('aria-pressed')) === 'true' && !('care' in (await st(a)).situation));
  await tap(a, '#care-done');
  s = await st(a);
  check('2 Done saves it, closes the sheet, and the row shows it', s.situation.care === 'asha' && /My ASHA or ANM/.test(await txt(a, '#me-care')) && !(await has(a, '.sheet')), s.situation);
  check('2 S.care: her ASHA is the government route', await a.page.evaluate(() => window.Saathi.care.gov() && window.Saathi.care.asha()));
  await tap(a, '#me-care'); await tap(a, '.sheet [data-care="private"]'); await a.page.$eval('#sheet-bg', (e) => e.click()); await sleep(300);
  check('2 closing the sheet without Done keeps her answer', (await st(a)).situation.care === 'asha' && /My ASHA or ANM/.test(await txt(a, '#me-care')));
  await done(a);
}
{
  const a = await open({ seed: { situation: { care: 'none' } } });
  check('2 "Nowhere yet" reads as "your doctor" too (with the government option one tap away)', await a.page.evaluate(() => window.Saathi.care.route() === 'none' && !window.Saathi.care.gov()));
  await done(a);
}

/* ---------- 3: iron tablets ---------- */
{
  const a = await open({ hash: 'iron' });   /* unanswered, 30, not pregnant */
  let v = await view(a);
  check('3 unanswered: "Your iron tablet protects you…" (not "The red iron tablet")', /Your iron tablet protects you from low haemoglobin/.test(v) && !/The red iron tablet/.test(v), v.slice(0, 300));
  const plans = await a.page.$$eval('input[name="iron-plan"]', (x) => x.map((y) => y.value + (y.checked ? '*' : '')));
  check('3 ... her doctor\'s dose first and picked: "As my doctor prescribed"', JSON.stringify(plans) === JSON.stringify(['doctor*', 'preg', 'post', 'weekly']) && /As my doctor prescribed/.test(v) && !/My doctor’s dose/.test(v), plans);
  check('3 ... "How often did your doctor say?": Every day, Every other day, Once a week', /How often did your doctor say\?\s*Every day\s*Every other day\s*Once a week/.test(v) && !(await a.page.$eval('#iron-every-row', (e) => e.hidden)), v.slice(0, 900));
  check('3 ... the weekly tablet "is free at government health centres", not "your ASHA or ANM can give you"', /is free at government health centres under Anemia Mukt Bharat/.test(v) && !/your ASHA or ANM can give you/.test(v));
  check('3 ... no quiet line to the schemes (Version 39.68: the Govt. services pages are gone); "Your ticks stay on this phone."', !(await has(a, '#view .care-alt')) && !/Free iron tablets at government health centres \(Anemia Mukt Bharat\)/.test(v) && /Your ticks stay on this phone\./.test(v) && !/from your ASHA, ANM, Anganwadi or PHC/.test(v));
  await shot(a, 'iron-doc-pick');
  await tap(a, '#iron-every-row [data-iron-every="7"]');
  check('3 "Once a week" asks which day', !(await a.page.$eval('#iron-day-row', (e) => e.hidden)));
  await tap(a, '#iron-every-row [data-iron-every="2"]');
  check('3 "Every other day": picked, no weekday', await a.page.$eval('#iron-every-row [data-iron-every="2"]', (e) => e.getAttribute('aria-pressed')) === 'true' && await a.page.$eval('#iron-day-row', (e) => e.hidden));
  await tap(a, '#iron-start');
  let s = await st(a); let r = s.reminders.find((x) => x.id === 'iron');
  check('3 Start: her doctor\'s dose every other day, reminded every 2 days', s.mods.iron.plan === 'doctor' && s.mods.iron.every === 2 && !!r && r.every === 2 && r.start === TODAY && !r.weekdays, { iron: s.mods.iron, r });
  v = await view(a);
  check('3 ... "As my doctor prescribed" above today\'s tablet, "Every other day, until you stop the plan.", the rhythm to change', /As my doctor prescribed\s*Today’s tablet/i.test(v) && /Every other day, until you stop the plan\./.test(v) && await has(a, '#iron-every-now [data-iron-every="2"][aria-pressed="true"]'), v.slice(0, 600));
  check('3 ... help lines name her doctor, not the ANM or ASHA', /ask your doctor for a haemoglobin test this week\. Below 7 needs care in a hospital\./.test(v) && /no rise in haemoglobin after 4 weeks of tablets: tell your doctor\./.test(v) && /tell your doctor instead of stopping/.test(v) && !/ask the ANM/.test(v) && !/tell the ASHA/.test(v));
  check('3 ... no "My ASHA or ANM" row', !(await has(a, '#view [data-go="asha"]')));
  await a.page.fill('#iron-left', '4'); await tap(a, '#iron-left-go');
  v = await view(a);
  check('3 the strip running low: "from your chemist or your doctor", no ANM stock line', /Only 4 tablets left\. Get your next strip before it runs out, from your chemist or your doctor\./.test(v) && !/If the ANM runs out/.test(v) && !/Ask your ASHA, ANM or Anganwadi/.test(v), v.slice(0, 900));
  await tap(a, '#iron-every-now [data-iron-every="7"]');
  s = await st(a); r = s.reminders.find((x) => x.id === 'iron');
  check('3 changing to "Once a week" keeps today\'s weekday, reminded that day', s.mods.iron.every === 7 && s.mods.iron.day === 3 && !!r && JSON.stringify(r.weekdays) === '[3]', { iron: s.mods.iron, r });
  const sum = await a.page.evaluate(() => (window.Saathi.summaries().find((x) => x.mod === 'iron') || { sections: [] }).sections[0]);
  check('3 the doctor\'s summary names it "As my doctor prescribed", once a week', !!sum && /^As my doctor prescribed, since/.test(sum.lines[0]) && sum.lines.indexOf('Once a week') >= 0, sum);
  await done(a);
}
{
  /* every other day: a tablet yesterday makes today a day off; the day after, it is due again */
  const ir = (log) => ({ iron: { plan: 'doctor', every: 2, start: ago(6), remOn: true, time: '21:00', log: log, mig: 1 } });
  let a = await open({ seed: { situation: { care: 'private' }, mods: ir({ [ago(1)]: 't', [ago(3)]: 't' }) } });
  check('3 every other day, taken yesterday: no tablet on Today', !(await has(a, '#view .today-iron')));
  await go(a, 'iron');
  check('3 ... "No tablet today. Your next one is tomorrow."', /No tablet today\. Your next one is tomorrow\./.test(await view(a)) && !(await has(a, '#iron-took')));
  await done(a);
  a = await open({ seed: { situation: { care: 'private' }, mods: ir({ [ago(3)]: 't' }) } });
  check('3 ... taken 3 days ago: today\'s tablet is on Today', await has(a, '#view .today-iron'));
  await go(a, 'iron'); await tap(a, '#iron-took');
  const r = (await st(a)).reminders.find((x) => x.id === 'iron');
  check('3 ... ticked: the reminder counts 2 days from today\'s tablet', !!r && r.every === 2 && r.start === TODAY && r.doneOn === TODAY, r);
  await done(a);
}
{
  const a = await open({ hash: 'iron', seed: { situation: { care: 'govt' } } });
  const v = await view(a);
  const plans = await a.page.$$eval('input[name="iron-plan"]', (x) => x.map((y) => y.value + (y.checked ? '*' : '')));
  check('3 a government centre: the page as before (the red tablet, the weekly tablet picked, "My doctor’s dose" last)', /The red iron tablet protects you/.test(v) && JSON.stringify(plans) === JSON.stringify(['preg', 'post', 'weekly*', 'doctor']) && /My doctor’s dose/.test(v) && /your ASHA or ANM can give you the weekly iron-folic acid tablet/.test(v), plans);
  check('3 ... the footer "Free under Anemia Mukt Bharat from your ASHA, ANM, Anganwadi or PHC", no quiet line', /Free under Anemia Mukt Bharat from your ASHA, ANM, Anganwadi or PHC\./.test(v) && !(await has(a, '#view .care-alt')));
  await done(a);
}

/* ---------- 4: pregnancy check-ups, week 19 ---------- */
{
  const a = await open({ hash: 'preg-plan', seed: PREG(null) });
  const v = await view(a); const tc = await all(a, '#view');
  check('4 unanswered: "You need at least 4 check-ups; your gynaecologist may see you more often."', /You need at least 4 check-ups; your gynaecologist may see you more often\. Tick each one as you have it\./.test(v) && !/MCP card and your logs count too/.test(v), v.slice(0, 300));
  const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('4 ... due now: Td, the second check-up and the anomaly scan (no scheme money or PMSMA; Version 39.38: her tablets have their own rows)', JSON.stringify(due) === JSON.stringify(['td', 'anc2', 'scan2']), due);
  check('4 ... no registration, scheme money, PMSMA or JSSK cards', !(await has(a, '[data-plan="reg"]')) && !(await has(a, '[data-plan="scheme"]')) && !(await has(a, '[data-plan="pmsma"]')) && !(await has(a, '[data-plan="jssk"]')));
  check('4 ... the second check-up with her gynaecologist, her reports in one file', /Your second check-up with your gynaecologist is due between 14 and 26 weeks\. Ask for your BP, weight, Hb and urine to be checked, and keep your reports together in one file\./.test(await txt(a, '[data-plan="anc2"]')) && !(await has(a, '[data-plan="anc2"] [data-go="preg-mcp"]')), await txt(a, '[data-plan="anc2"]'));
  check('4 ... the anomaly scan: "Your gynaecologist will tell you where to book it."', /Your gynaecologist will tell you where to book it\./.test(await txt(a, '[data-plan="scan2"]')));
  check('4 ... iron and calcium "your doctor prescribed"; Td at her check-ups, no U-WIN button', /Take the iron tablet your doctor prescribed\./.test(await txt(a, '[data-plan="ifa"]')) && /Take the calcium your doctor prescribed, with meals\./.test(await txt(a, '[data-plan="ca"]')) && /at your check-ups/.test(await txt(a, '[data-plan="td"]')) && !(await has(a, '[data-plan="td"] a[href*="uwin"]')));
  check('4 ... no quiet line to the schemes (Version 39.68: the Govt. services pages are gone)', !(await has(a, '#view .care-alt')) && !/Free at government hospitals: check-ups on the 9th/.test(v));
  check('4 ... a missed one: "ask your gynaecologist", not the ANM', /If you missed one, ask your gynaecologist about it at your next visit\./.test(tc) && !/ask your ANM/.test(tc));
  check('4 ... no "MCP card" anywhere in her due items', !/MCP card/.test(await all(a, '#view .pg-plan')));
  check('4 ... her reminders ring for check-ups and tests, with no PMSMA days', /At 10 am on the first day of each check-up and test\./.test(v) && !/PMSMA day/.test(v));
  await shot(a, 'preg-doc');
  await go(a, 'home');
  check('4 Today names her due items by the same names', !/Scheme money/.test(await view(a)));
  await done(a);
}
{
  const a = await open({ hash: 'preg-plan', seed: PREG('govt') });
  const v = await view(a);
  const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('4 a government centre: the plan as before (scheme money, PMSMA, the MCP card, U-WIN)', JSON.stringify(due) === JSON.stringify(['td', 'scheme', 'anc2', 'scan2']) && await has(a, '[data-plan="pmsma"]') && /MCP card/.test(await txt(a, '[data-plan="anc2"]')) && await has(a, '[data-plan="td"] a[href*="uwin"]') && !(await has(a, '#view .care-alt')), due);
  check('4 ... with the government route\'s intro', /the dates in your MCP card and your logs count too/.test(v));
  await done(a);
}

/* ---------- 5: after the birth, day 2 ---------- */
{
  const a = await open({ hash: 'post', seed: POST('private') });
  check('5 a private doctor: no "Next ASHA visit" on the after-birth page', !/Next ASHA visit/.test(await view(a)) && /Your 6-week check/.test(await view(a)), (await view(a)).slice(0, 500));
  await go(a, 'post-checks');
  const v = await view(a); const tc = await all(a, '#view');
  check('5 ... her own check: "see your gynaecologist for a check for yourself, even if you feel well."', /see your gynaecologist for a check for yourself, even if you feel well\. Many mothers skip it\. Please go\./.test(v) && !/at your PHC, Ayushman Arogya Mandir/.test(v), v.slice(0, 900));
  check('5 ... vaccines from her baby\'s doctor on the vaccination card, free at government centres as one line', /Your baby's doctor gives each vaccine and writes it on the vaccination card\./.test(v) && /Vaccines in the national schedule are free at government centres \(Universal Immunisation Programme\)\./.test(v) && !/Your ANM writes each dose/.test(v) && /Ask your baby's doctor what to give, and when\./.test(v));
  check('5 ... the birth doses: "check the vaccination card", not the MCP card (Version 39.71: under All the baby’s vaccines)', /Should be done: check the vaccination card/.test(tc) && !/check the MCP card/.test(tc));
  check('5 ... iron and calcium "your doctor prescribed", no JSSK note and no "Free from your ASHA"', /Keep taking the iron and calcium your doctor prescribed, for as long as they said\./.test(v) && /Ask your doctor for a haemoglobin \(Hb\) test\./.test(v) && !/JSSK:/.test(tc) && !/Free from your ASHA, Anganwadi or PHC/.test(tc));
  check('5 ... the ASHA\'s visit days folded behind "Does an ASHA visit you? See her visit days", after her own check', await has(a, 'details.pst-asha-q:not([open])') && /Does an ASHA visit you\? See her visit days/.test(await txt(a, '.pst-asha-q summary')) && !/visits on days 3, 7, 14, 21, 28 and 42/.test(v) &&
    await a.page.evaluate(() => { const h = [...document.querySelectorAll('#view .card h3')].map((x) => x.textContent); return h.indexOf('Your own check at 6 weeks') >= 0 && document.querySelector('#view .pst-asha-q').compareDocumentPosition(document.querySelector('#pst-six, #pst-six-off')) & Node.DOCUMENT_POSITION_PRECEDING; }));
  await tap(a, '.pst-asha-q summary');
  check('5 ... a tap shows her visit days', /visits on days 3, 7, 14, 21, 28 and 42/.test(await view(a)) && await has(a, '.pst-asha-q[open] .pst-vd'));
  await shot(a, 'post-doc');
  await done(a);
}
{
  const a = await open({ hash: 'post', seed: POST('asha') });
  check('5 her ASHA: "Next ASHA visit" on the after-birth page', /Next ASHA visit/.test(await view(a)));
  await go(a, 'post-checks');
  const v = await view(a);
  check('5 ... the check-ups page as before (visit days open, her PHC, the ANM and MCP card)', /visits on days 3, 7, 14, 21, 28 and 42/.test(v) && !(await has(a, '.pst-asha-q')) && /at your PHC, Ayushman Arogya Mandir/.test(v) && /Your ANM writes each dose on the MCP card/.test(v) && /Free from your ASHA, Anganwadi or PHC/.test(v));
  await done(a);
}

/* ---------- 6: Help and the doctor screen ---------- */
{
  let a = await open({});
  await tap(a, '#help-btn');
  /* Version 39.63 (phase E): one label, "Ask a Qura doctor" */
  check('6 unanswered: "Ask a Qura doctor · A call with a Qura doctor" (Version 39.68: no free government doctor page)', /Ask a doctor\s*A call with a Qura doctor/.test(await txt(a, '#hs-doc')) && !/government/.test(await txt(a, '#hs-doc')), await txt(a, '#hs-doc'));
  check('6 ... no "My ASHA" row, and 112 still first', !(await has(a, '#hs-asha')) && await a.page.$eval('.sheet .list > *', (e) => e.id) === 'hs-112');
  await done(a);
  a = await open({ seed: { mods: { asha: { phone: '9876543210' } } } });
  await tap(a, '#help-btn');
  check('6 ... no "My ASHA" even when she saved her ASHA\'s number (Version 39.68: My ASHA is gone)', !(await has(a, '#hs-asha')));
  await done(a);
  a = await open({ seed: { situation: { care: 'govt' } } });
  await tap(a, '#help-btn');
  /* Version 39.77 (Mohit's choice A1, by her answer): a government centre's Help row is her gynaecologist or a free government doctor */
  check('6 a government centre: "See a doctor", her gynaecologist or a free government doctor; no "My ASHA", the hospital first (Versions 39.68, 39.77)', /Your gynaecologist, or a free government doctor/.test(await txt(a, '#hs-doc')) && !/Qura/.test(await txt(a, '#hs-doc')) && !(await has(a, '#hs-asha')) && await a.page.$eval('.sheet .list > *', (e) => e.id) === 'hs-112');
  await done(a);
  a = await open({ hash: 'ask' });
  let ids = await a.page.$$eval('#view .card', (cs) => cs.map((c) => c.id || ''));
  check('6 the doctor screen, unanswered: no free government doctor card (Version 39.68)', ids.indexOf('ask-free') < 0, ids);
  await done(a);
  a = await open({ hash: 'ask', seed: { situation: { care: 'govt' } } });
  ids = await a.page.$$eval('#view .card', (cs) => cs.map((c) => c.id || ''));
  check('6 ... nor on the government route', ids.indexOf('ask-free') < 0, ids);
  await done(a);
  /* My plan's care team: the same order */
  const team = async (care) => { const b = await open({ hash: 'plan', seed: { situation: care ? { care } : {}, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', 3) } } });
    const r = await b.page.$$eval('#view .pl-care .item', (x) => x.map((y) => y.dataset.go || (y.dataset.ask ? 'ask' : (y.dataset.mydoc ? 'mydoc' : '')))); await done(b); return r; };
  let tm = await team(null);
  check('6 My plan\'s care team, unanswered: her own doctor (Version 39.41), then a Qura doctor; no free government doctor (Version 39.68)', tm[0] === 'mydoc' && tm[1] === 'ask' && tm.indexOf('access-doctor') < 0, tm);
  tm = await team('govt');
  /* Version 39.77 (Mohit's choice C2): her own doctor on every answer, then a Qura doctor */
  check('6 ... a government centre: her own doctor, then a Qura doctor; no free government doctor page (Versions 39.68, 39.77)', tm[0] === 'mydoc' && tm[1] === 'ask' && tm.indexOf('access-doctor') < 0, tm);
}

/* ---------- 7: What your diary shows ---------- */
{
  const heavy = regular(10, { pads: 'pads_4' });
  let a = await open({ hash: 'explain', seed: { events: heavy } });
  let tc = await all(a, '#view');
  check('7 heavy flow, unanswered: "Ask your doctor if you need iron tablets. They are also free at government health centres."', /Ask your doctor if you need iron tablets\. They are also free at government health centres\./.test(tc) && !/Free iron tablets come from your ASHA or health centre/.test(tc), tc.slice(0, 600));
  await done(a);
  a = await open({ hash: 'explain', seed: { events: heavy, situation: { care: 'asha' } } });
  tc = await all(a, '#view');
  check('7 ... her ASHA: "Free iron tablets come from your ASHA or health centre." as before', /Free iron tablets come from your ASHA or health centre\./.test(tc));
  await done(a);
  a = await open({ hash: 'explain', seed: { events: regular(45) } });
  tc = await all(a, '#view');
  check('7 a late period, unanswered: "Any chemist sells one; your ASHA gives Nishchay kits free."', /If you could be pregnant, take a home test\. Any chemist sells one; your ASHA gives Nishchay kits free\./.test(tc) && !/Free Nishchay kits come from your ASHA\./.test(tc), tc.slice(0, 600));
  await done(a);
}

/* ---------- 9: the doctor route everywhere (Version 39.29): the Learn library and the other modules ---------- */
{
  const a = await open({});
  const integ = await a.page.evaluate(() => { const S = window.Saathi; const en = S.strings.en, hi = S.strings.hi; const bad = [];
    /* a pair is <key> and <key>_doc (keys that only end in "_doc", like hs_doc "See a doctor", have no base and never switch) */
    const pairs = Object.keys(en).filter((k) => /_doc$/.test(k) && en[k.slice(0, -4)] != null);
    pairs.forEach((k) => { const b = k.slice(0, -4); if (hi[b] == null || hi[k] == null || en[k] === en[b]) bad.push(k); });
    Object.keys(hi).filter((k) => /_doc$/.test(k) && hi[k.slice(0, -4)] != null && en[k] == null).forEach((k) => bad.push('hi only ' + k));
    return { n: pairs.length, bad }; });
  check('9 every doctor-route string has its base key, in English and Hindi, and says something different (' + integ.n + ' pairs)', integ.n >= 60 && !integ.bad.length, integ.bad);
  const arts = JSON.parse(CONTENT); const abad = []; let nOv = 0;
  for (const g of arts.groups) for (const x of g.articles) { const d = x.doc; if (!d) continue;
    for (const k of Object.keys(d)) { const m = k.match(/^(.+)_(en|hi)$/); const other = m && (m[1] + '_' + (m[2] === 'en' ? 'hi' : 'en'));
      if (!m || x[k] == null || !(other in d)) { abad.push(g.group + '/' + x.id + ' ' + k); continue; }
      if (typeof d[k] === 'string') { nOv++; if (d[k] === x[k] || typeof d[other] !== 'string') abad.push(g.group + '/' + x.id + ' ' + k); }
      else for (const i of Object.keys(d[k])) { nOv++; if (x[k][+i] == null || d[k][i] === x[k][+i] || d[other][i] == null) abad.push(g.group + '/' + x.id + ' ' + k + '[' + i + ']'); } } }
  check('9 every Learn override sits on a real paragraph, in both languages, and changes it (' + nOv + ' paragraphs)', nOv >= 130 && !abad.length, abad);   /* Version 39.68: 12 articles fewer */
  check('9 the government services guides keep their words (no overrides in the services group)', !arts.groups.find((g) => g.group === 'services').articles.some((x) => x.doc));
  /* the switch: the same key reads her route's words */
  const KEYS = ['contra_hub_p', 'preg_hub_scan', 'post_s_ask', 'screen_where_p', 'pregtools_b_tip', 'plan_rv_doc_hb', 'pw_v1'];
  const both = async (care) => a.page.evaluate(([c, ks]) => { const S = window.Saathi; if (c) S.state.situation.care = c; else delete S.state.situation.care;
    const o = { en: 'gov line', hi: 'सरकारी', doc: { en: 'doctor line', hi: 'डॉक्टर' } };
    return { t: ks.map((k) => S.t(k)), tx: S.tx(o), art: (S.article('pregnancy.after-birth-first-six-weeks') || {}).title, base: ks.map((k) => S.strings.en[k]), doc: ks.map((k) => S.strings.en[k + '_doc']) }; }, [care, KEYS]);
  const d0 = await both(null); const g0 = await both('govt'); const p0 = await both('private');
  check('9 unanswered: each key reads its doctor-route words', JSON.stringify(d0.t) === JSON.stringify(d0.doc) && d0.t.every((x, i) => x !== d0.base[i]), d0.t);
  check('9 ... a private doctor: the same', JSON.stringify(p0.t) === JSON.stringify(d0.t));
  check('9 ... a government centre: the reviewed words, unchanged', JSON.stringify(g0.t) === JSON.stringify(g0.base), g0.t);
  check('9 an inline line with doc words: "doctor line" on the doctor route, "gov line" on the government route', d0.tx === 'doctor line' && g0.tx === 'gov line', [d0.tx, g0.tx]);
  check('9 a Learn title: "…your check-ups" on the doctor route, "…your ASHA" on the government route', /your check-ups$/.test(d0.art) && /your ASHA$/.test(g0.art), [d0.art, g0.art]);
  /* no new ASHA/ANM push without its doctor-route words (the government pages, the teen programme and the danger flag stay) */
  const left = await a.page.evaluate(() => { const S = window.Saathi; const en = S.strings.en;
    const PUSH = /\b(ask|tell|see|call|ask at|go to|register with|visit)\s+(your|the|an?)\s+(ASHA|ANM|PHC|Anganwadi)\b|\b(your|the)\s+(ASHA|ANM)\s+(can|will|gives|brings|decides|should|says)\b/i;
    const owner = {}; for (const m of S.modules) for (const k of Object.keys((m.strings || {}).en || {})) owner[k] = m.id;
    const KEEP = ['contra_fr_m2', 'post_fl_fever', 'screen_cx_free', 'screen_hpv_consent'];
    return Object.keys(en).filter((k) => !/_doc$/.test(k) && typeof en[k] === 'string' && PUSH.test(en[k]) && en[k + '_doc'] == null && ['access', 'asha', 'teen'].indexOf(owner[k]) < 0 && KEEP.indexOf(k) < 0); });
  check('9 no string sends her to the ASHA or ANM without its doctor-route words (outside the government pages)', !left.length, left);
  await done(a);
}
for (const [care, want, not] of [[null, /Your doctor decides these doses/, /Your ANM decides these doses/], ['asha', /Your ANM decides these doses/, /Your doctor decides these doses/]]) {
  const a = await open({ hash: 'a-pregnancy.iron-folic-acid-calcium-td', seed: { situation: care ? { care } : {} } });
  const tc = await all(a, '#view');
  check('9 the Learn guide on iron and calcium, ' + (care ? 'her ASHA' : 'unanswered') + ': ' + want.source, want.test(tc) && !not.test(tc) && (care ? /ask the ANM for a haemoglobin test this week/ : /ask your doctor for a haemoglobin test this week/).test(tc), tc.slice(0, 500));
  await done(a);
}
{
  let a = await open({ hash: 'cond-anaemia' });
  check('9 the anaemia page lands on Explore (Version 39.68: the doctors removed it; the iron tablets page stays)', (await a.page.evaluate(() => location.hash)) === '#care');
  await done(a);
  a = await open({ hash: 'a-pregnancy.iron-folic-acid-calcium-td', w: 360, seed: { lang: 'hi' } });
  const v = await all(a, '#view');
  check('9 Hindi at 360 px: the Learn guide in her route\'s words ("डोज़ आपकी डॉक्टर तय करती हैं"), no sideways scroll', /डोज़ आपकी डॉक्टर तय करती हैं/.test(v) && !/डोज़ आपकी ANM तय करती हैं/.test(v) && await noScroll(a) && !KEYS.test(v), v.slice(0, 300));
  await shot(a, 'hi-learn-iron');
  await done(a);
}

/* ---------- 8: Hindi at 360 px ---------- */
for (const [h, seed, want, name] of [
  ['iron', {}, /आयरन की गोली कम हीमोग्लोबिन से बचाती है/, 'iron'],
  ['preg-plan', PREG(null), /कम से कम 4 जाँचें ज़रूरी हैं; आपकी गायनेकोलॉजिस्ट ज़्यादा बार भी बुला सकती हैं/, 'preg-plan'],
  ['post-checks', POST(null), /अपनी गायनेकोलॉजिस्ट से अपनी जाँच करवाएँ/, 'post-checks'],
  ['me', {}, /मैं कहाँ दिखाती हूँ/, 'me']]) {
  const a = await open({ hash: h, w: 360, seed: Object.assign({ lang: 'hi' }, seed) });
  let v = await view(a);
  if (name === 'iron') v += ' ' + await txt(a, '#iron-every-row');
  check('8 Hindi at 360 px: ' + name + ' in Hindi, no sideways scroll, no keys', want.test(v) && await noScroll(a) && !KEYS.test(v), v.slice(0, 400));
  if (name === 'me') {
    await tap(a, '#me-care');
    const sh = await txt(a, '.sheet');
    check('8 ... the Me sheet in Hindi', /महिलाओं की सेहत के लिए आप आमतौर पर कहाँ जाती हैं\?/.test(sh) && /सरकारी अस्पताल या स्वास्थ्य केंद्र/.test(sh) && /इमरजेंसी नंबर सबके लिए वही रहते हैं/.test(sh) && await noScroll(a) && !KEYS.test(sh), sh);
  }
  await shot(a, 'hi-' + name);
  await done(a);
}
{
  const a = await openJoin({ lang: 'hi', w: 360 });
  await join(a.page, { lang: 'hi', name: 'Riya', tile: 'cycle', stop: 'care' });
  const v = await view(a);
  check('8 Hindi at 360 px: the joining question fits', /महिलाओं की सेहत के लिए आप आमतौर पर कहाँ जाती हैं\?/.test(v) && /प्राइवेट गायनेकोलॉजिस्ट या डॉक्टर/.test(v) && /इसे कभी भी "मैं" पेज पर बदल सकती हैं।/.test(v) && await noScroll(a) && !KEYS.test(v), v.slice(0, 400));
  await shot(a, 'hi-join-care');
  await done(a);
}

check('8 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (care)');
process.exit(failed.length ? 1 : 0);
