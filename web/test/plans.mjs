// Version 28's second part (docs/feature-research-2026-10-22.md: A1, B1, C1, B2): My pregnancy plan, My claims for
// schemes, the report for the doctor, and Care near me from bundled government lists.
// Checks:
//   - the plan: what is due by week, Done and Undo, items done from her MCP card and her iron plan, the 41-week check,
//     reminders on and off (the next check-ups, the PMSMA 9ths, Td-2), Home's due row and the report's line;
//   - claims: start, papers, steps with dates, PMMVY's 270-day date and its reminders, stop, the first-part hint, the
//     birth-cost card, nothing sent, the finder's answers still not saved;
//   - the report: her own questions first, its language apart from the app's, share and copy in that language, the big
//     screen, the PDF button only on Android, the neutral PDF name in discreet mode, the print styles;
//   - Care near me: the data builder on made-up CSV files (every name starts with TEST), her account's PIN, the nearest
//     centres and hospitals within 50 km, other PINs, a PIN with no map location or not in the list, the 2021 caveat and
//     sources, nothing sent, and a loader that only ever loads the app's own files;
//   - Hindi; no page errors.
// Usage: node test/plans.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return iso(x); };
const isoAdd = (s, n) => { const p = s.split('-').map(Number); const x = new Date(p[0], p[1] - 1, p[2], 12); x.setDate(x.getDate() + n); return iso(x); };
/* the 9th of each month after today, up to the due date: the PMSMA days */
const ninthsUntil = (due) => { const t = new Date(); t.setHours(0, 0, 0, 0); let x = new Date(t.getFullYear(), t.getMonth(), 9); if (x < t) x = new Date(t.getFullYear(), t.getMonth() + 1, 9); const out = []; while (iso(x) <= due && out.length < 8) { out.push(iso(x)); x = new Date(x.getFullYear(), x.getMonth() + 1, 9); } return out; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
/* Version 39.28: the pregnancy plan as the government route shows it (situation.care); the doctor route: test/care.mjs */
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1992-07-01', consent: { c1: isoAgo(30), c2: null, c4: null }, situation: { stage: 'cycle', care: 'govt' },
  events: [{ d: isoAgo(52), t: 'start' }, { d: isoAgo(47), t: 'end' }, { d: isoAgo(24), t: 'start' }, { d: isoAgo(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });
const pregSeed = (weeks, extra) => Object.assign({ situation: { stage: 'preg', pregnant: true, pregnantSince: isoAgo(weeks * 7), care: 'govt' }, events: [] }, extra || {});

const browser = await chromium.launch();
const sent = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  /* a server address, so anything the app sent would show up here */
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({ api: 'https://api.test.invalid', app: 'test-0.28', platform: o.android ? 'android' : 'web' }, o.care ? { care: o.care } : {})) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
  /* the phone's clipboard, and on Android the app's bridge: what she shares, copies or prints is kept to look at */
  await ctx.addInitScript('window.__copied = []; try { Object.defineProperty(navigator, "clipboard", { value: { writeText: (x) => { window.__copied.push(x); return Promise.resolve(); } }, configurable: true }); } catch (e) {}');
  if (o.android) await ctx.addInitScript('window.__printed = []; window.__shared = []; window.SakhiAndroid = { printPage: (t) => { window.__printed.push(t); }, share: (t, x) => { window.__shared.push([t, x]); return true; }, schedule() {}, setSecure() {}, canBiometric() { return false; } };');
  await ctx.route(/^https?:/, (r) => { sent.push(r.request().url() + ' ' + (r.request().postData() || '')); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(300);
  return { ctx, page, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(250); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const rem = (page, id) => page.evaluate((x) => { const r = (window.Saathi.state.reminders || []).find((y) => y.id === x); return r ? JSON.parse(JSON.stringify(r)) : null; }, id);
const remIds = (page, pre) => page.evaluate((p) => (window.Saathi.state.reminders || []).map((r) => r.id).filter((id) => id.indexOf(p) === 0).sort(), pre);
/* the plan's cards, by where they sit: Due now and Coming up are open on the screen, Done and Not done yet fold away */
const planCards = (page) => page.evaluate(() => {
  const out = { now: [], soon: [], done: [], past: [] }; let sec = null;
  [...document.querySelectorAll('#view > *')].forEach((el) => {
    if (el.tagName === 'H2') sec = /Due now|अभी का/.test(el.textContent) ? 'now' : (/Coming up|आगे/.test(el.textContent) ? 'soon' : null);
    else if (el.matches('.pg-plan') && sec) out[sec].push(el.dataset.plan);
    else if (el.matches('details')) { const k = /^(Done|हो गया)/.test(el.querySelector('summary').textContent) ? 'done' : 'past'; el.querySelectorAll('.pg-plan').forEach((c) => out[k].push(c.dataset.plan)); }
  });
  return out;
});
const planOf = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods.preg || {}).plan || {})));

/* ---------- 1. My pregnancy plan at 24 weeks ---------- */
{
  const lmp = isoAgo(24 * 7), due = isoAdd(lmp, 280);
  const { ctx, page, errs } = await open({ hash: '#preg-plan', seed: pregSeed(24) });
  let c = await planCards(page);
  check('1 due now at 24 weeks: Td, the scheme money, iron, calcium, the second check-up, PMSMA and the sugar test', JSON.stringify(c.now) === JSON.stringify(['td', 'scheme', 'ifa', 'ca', 'anc2', 'pmsma', 'ogtt']), c);
  check('1 coming up: the next four by week', JSON.stringify(c.soon) === JSON.stringify(['anc3', 'jssk', 'birth', 'asha']), c);
  check('1 missed windows fold away under "Not done yet", with the calm ANM line and no alarm', JSON.stringify(c.past) === JSON.stringify(['reg', 'folic', 'anc1', 'scan1', 'scan2']) && /Not done yet \(5\)/.test(await view(page)) && /If you missed one, ask your ANM about it at your next visit/.test(await page.$eval('#view', (e) => e.textContent)), c);
  check('1 no 41-week check before 41 weeks', !c.now.concat(c.soon, c.past).includes('w41'));
  check('1 each card carries its verified week tip and its window', /Weeks 24 to 28/.test(await page.$eval('[data-plan="ogtt"]', (e) => e.innerText)) && (await page.$eval('[data-plan="ogtt"] p.small', (e) => e.textContent.length)) > 40);
  check('1 items from the start of pregnancy read "Up to week …", not "Weeks 0 to …"', /Up to week 12/.test(await page.$eval('[data-plan="reg"]', (e) => e.textContent)) && /Up to week 36/.test(await page.$eval('[data-plan="td"]', (e) => e.textContent)) && !/Weeks 0 /.test(await page.$eval('#view', (e) => e.textContent)));
  check('1 the anomaly scan\'s window matches its tip: 18 to 20 weeks', /Weeks 18 to 20/.test(await page.$eval('[data-plan="scan2"]', (e) => e.textContent)));
  check('1 the next PMSMA day is a 9th', /Next PMSMA day: \w+, 9 \w+/.test(await page.$eval('[data-plan="pmsma"]', (e) => e.innerText)), await page.$eval('[data-plan="pmsma"]', (e) => e.innerText));
  await go(page, 'home');
  check('1 Home: one row in Today with what is due now (Version 30)', /Due now: Td injections, and 5 more/.test(await view(page)) && !!(await page.$('#view .today-preg-plan [data-go="preg-plan"]')));
  check('1 Home: the row sits in Today, above Sakhi says, where the cap on Home\'s cards can\'t push it off (Version 37: the ask box moved to Explore)', await page.evaluate(() => { const d = document.querySelector('#view .today-card .today-preg-plan'), q = document.querySelector('#view .slot'); return !!d && (!q || !!(d.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('1 Home in discreet mode: no plan row', !(await page.$('#view .today-preg-plan')) && !/Due now/.test(await view(page)));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = false; S.save(); }); await go(page, 'learn');
  await go(page, 'preg-plan');
  await tap(page, '[data-pg-plan="scheme"]'); await sleep(250);
  c = await planCards(page);
  check('1 "Done" moves an item to Done, with the date', c.done.includes('scheme') && !c.now.includes('scheme') && (await planOf(page)).done.scheme === isoAgo(0) && /Done on/.test(await page.$eval('[data-plan="scheme"]', (e) => e.textContent)));
  await go(page, 'home');
  check('1 Home counts one fewer', /Due now: Td injections, and 4 more/.test(await view(page)));
  await go(page, 'preg-plan'); await tap(page, '[data-pg-plan-undo="scheme"]'); await sleep(250);
  check('1 Undo puts it back', (await planCards(page)).now.includes('scheme') && !(await planOf(page)).done.scheme);
  /* her MCP card: a check-up at 20 weeks completes the second check-up by itself */
  await go(page, 'preg-mcp'); await page.fill('#pg-anc', isoAgo(4 * 7)); await tap(page, '#pg-anc-add'); await sleep(300);
  await go(page, 'preg-plan'); c = await planCards(page);
  check('1 a check-up date in her MCP card marks the second check-up done', c.done.includes('anc2') && /Done: from your MCP card, logs or tools/.test(await page.$eval('[data-plan="anc2"]', (e) => e.textContent)) && !(await page.$('[data-pg-plan-undo="anc2"]')), c);
  /* her iron plan completes "Iron tablets" */
  await go(page, 'iron'); await tap(page, '#iron-start'); await sleep(300); await go(page, 'preg-plan');
  check('1 starting the iron plan marks the iron tablets done', (await planCards(page)).done.includes('ifa'));
  /* PMSMA: she marks the days she went */
  await tap(page, '[data-pg-pmsma]'); await sleep(250);
  check('1 "I went today" counts a PMSMA visit, and stays due for the next 9th', JSON.stringify((await planOf(page)).pmsma) === JSON.stringify([isoAgo(0)]) && /Went: 1/.test(await page.$eval('[data-plan="pmsma"]', (e) => e.innerText)) && (await planCards(page)).now.includes('pmsma'));
  /* reminders */
  check('1 no plan reminders until she turns them on', (await remIds(page, 'preg-plan-')).length === 0);
  await page.$eval('#pg-plan-rem', (e) => e.click()); await sleep(300);
  check('1 reminders: the next check-ups and PMSMA, nothing already due or done', JSON.stringify(await remIds(page, 'preg-plan-')) === JSON.stringify(['preg-plan-anc3', 'preg-plan-anc4', 'preg-plan-pmsma']), await remIds(page, 'preg-plan-'));
  let r = await rem(page, 'preg-plan-anc3');
  check('1 the third check-up rings at 10 am on the first day of week 28', r && JSON.stringify(r.dates) === JSON.stringify([isoAdd(lmp, 28 * 7)]) && r.time === '10:00' && r.on && r.title.en === 'Due now: Third check-up' && r.title.hi === 'अभी: तीसरी जाँच', r);
  r = await rem(page, 'preg-plan-pmsma');
  check('1 PMSMA rings at 9 am on each 9th until the due date', r && JSON.stringify(r.dates) === JSON.stringify(ninthsUntil(due)) && r.time === '09:00' && r.dates.length >= 3, { got: r && r.dates, want: ninthsUntil(due) });
  await tap(page, '[data-pg-plan="anc3"]'); await sleep(250);
  check('1 a check-up she marks done ahead of time loses its reminder', !(await rem(page, 'preg-plan-anc3')) && !!(await rem(page, 'preg-plan-anc4')));
  await tap(page, '[data-pg-plan-undo="anc3"]'); await sleep(250);
  check('1 Undo brings that reminder back', !!(await rem(page, 'preg-plan-anc3')));
  /* Td: the first dose is in her MCP card, so the second gets a date */
  await go(page, 'preg-mcp'); await page.fill('#pg-td1', isoAgo(10)); await page.$eval('#pg-td1', (e) => e.dispatchEvent(new Event('change'))); await tap(page, '#pg-mcp-save'); await sleep(300);
  r = await rem(page, 'preg-plan-td2');
  check('1 Td-1 in her MCP card: a reminder for Td-2 four weeks later', r && JSON.stringify(r.dates) === JSON.stringify([isoAdd(isoAgo(10), 28)]) && r.time === '10:00', r);
  await go(page, 'preg-plan');
  check('1 the Td card names the second dose\'s date', /Second dose from/.test(await page.$eval('[data-plan="td"]', (e) => e.innerText)));
  await go(page, 'report');
  check('1 the doctor report lists what is due now', /Due now: Td injections, Scheme money: PMMVY and JSY, Calcium tablets, Sugar test \(75 g\)/.test(await view(page)), (await view(page)).slice(0, 1500));
  await go(page, 'preg-plan'); await page.$eval('#pg-plan-rem', (e) => e.click()); await sleep(300);
  check('1 turning reminders off removes every plan reminder', (await remIds(page, 'preg-plan-')).length === 0 && !(await planOf(page)).rem);
  check('1 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#preg-plan', seed: pregSeed(41) });
  const c = await planCards(page);
  check('1 at 41 weeks: the 41-week check is due now', c.now.includes('w41') && /A check at 41 weeks/.test(await view(page)), c);
  check('1 at 41 weeks: no errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#preg-plan', lang: 'hi', seed: pregSeed(24, { lang: 'hi' }) });
  const v = await view(page);
  /* Version 39.2: the checklist page is "Check-ups and tests" (जाँचें और टेस्ट); "My pregnancy plan" is the My plan tab */
  check('1 Hindi: the plan', /जाँचें और टेस्ट/.test(v) && /अभी का/.test(v) && /शुगर टेस्ट \(75 g\)/.test(v) && /अगला PMSMA दिन/.test(v), v.slice(0, 500));
  await go(page, 'home'); check('1 Hindi: Home\'s row', /अभी: Td के टीके और 5 अन्य/.test(await view(page)));
  check('1 Hindi: no errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 2. My claims ---------- */
{
  const before = sent.length;
  const birth = isoAgo(50), by = isoAdd(birth, 270);
  const { ctx, page, errs } = await open({ hash: '#access-schemes-post', seed: { situation: { stage: 'post', deliveredOn: birth, care: 'govt' }, events: [] } });
  const fmt = (d) => page.evaluate((x) => window.Saathi.fmtD(window.Saathi.fromISO(x), { day: 'numeric', month: 'short', year: 'numeric' }), d);
  check('2 no "My claims" card before she tracks one', !(await page.$('.access-my')));
  check('2 a scheme Sakhi can\'t track has no button (JSSK)', !!(await page.$('#sch-jssk')) && !(await page.$('#sch-jssk [data-claim-start]')));
  await page.$eval('#sch-pmmvy', (d) => { d.open = true; }); await tap(page, '[data-claim-start="pmmvy"]'); await sleep(300);
  let cl = await page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.access.claims)));
  check('2 "Track my claim" saves PMMVY in her diary, from today', JSON.stringify(cl) === JSON.stringify({ pmmvy: { started: isoAgo(0), docs: {} } }), cl);
  check('2 the card stays open, with its papers as five ticks', await page.$eval('#sch-pmmvy', (d) => d.open) && (await page.$$('#sch-pmmvy [data-claim-doc]')).length === 5 && /Papers to keep ready/.test(await page.$eval('#sch-pmmvy', (e) => e.innerText)));
  const byTxt = await fmt(by);
  check('2 PMMVY\'s last date: 270 days after the birth', (await page.$eval('#sch-pmmvy .access-claim', (e) => e.innerText)).includes('Register by ' + byTxt), byTxt);
  check('2 "My claims" at the top shows the step and the date', /PMMVY: Pradhan Mantri Matru Vandana Yojana/.test(await page.$eval('.access-my', (e) => e.innerText)) && (await page.$eval('.access-my', (e) => e.innerText)).includes('Getting papers ready · Register by ' + byTxt));
  let r = await rem(page, 'access-pmmvy');
  check('2 reminders a month and a week before the last date, at 10 am', r && JSON.stringify(r.dates) === JSON.stringify([isoAdd(by, -30), isoAdd(by, -7)]) && r.time === '10:00' && r.title.en === 'PMMVY: register soon', r);
  await page.$eval('[data-claim-doc="pmmvy|0"]', (e) => e.click()); await sleep(250);
  check('2 ticking a paper keeps it', (await page.evaluate(() => window.Saathi.state.mods.access.claims.pmmvy.docs[0])) === 1 && await page.$eval('[data-claim-doc="pmmvy|0"]', (e) => e.checked && e.closest('label').classList.contains('done')));
  await tap(page, '[data-claim-step="pmmvy|applied"]'); await sleep(250);
  cl = await page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.access.claims.pmmvy)));
  check('2 "Applied" keeps today\'s date and stops the reminders', cl.applied === isoAgo(0) && !cl.got && !(await rem(page, 'access-pmmvy')) && !(await page.$eval('#sch-pmmvy .access-claim', (e) => /Register by/.test(e.innerText))), cl);
  check('2 "My claims" shows "Applied" with its date', (await page.$eval('.access-my', (e) => e.innerText)).includes('Applied · ' + (await fmt(isoAgo(0)))));
  await go(page, 'report');
  check('2 the report shows the claim', /My claims: PMMVY: Applied \(/.test(await view(page)));
  await go(page, 'access-schemes-post'); await page.$eval('#sch-pmmvy', (d) => { d.open = true; });
  await tap(page, '[data-claim-step="pmmvy|got"]'); await sleep(250);
  cl = await page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.access.claims.pmmvy)));
  check('2 "Money or card received" keeps both dates', cl.applied === isoAgo(0) && cl.got === isoAgo(0), cl);
  await tap(page, '[data-claim-step="pmmvy|ready"]'); await sleep(250);
  cl = await page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.access.claims.pmmvy)));
  check('2 back to "Getting papers ready": the dates go and the reminders return', !cl.applied && !cl.got && !!(await rem(page, 'access-pmmvy')), cl);
  await page.$eval('[data-q="ration"][data-o="y"]', (b) => b.click()); await sleep(200);
  check('2 the finder\'s answers are still never saved (only her claims, and the dates she first opened Get care free and the finder)', (await page.evaluate(() => Object.keys(window.Saathi.state.mods.access))).every((k) => ['claims', 'seenSchemes', 'seenFree'].indexOf(k) >= 0) && !/"ration"/.test(await page.evaluate(() => localStorage.getItem('qura-saathi-v1'))));
  await page.$eval('#sch-pmmvy', (d) => { d.open = true; }); await tap(page, '[data-claim-stop="pmmvy"]'); await sleep(250);
  check('2 "Stop tracking" removes the claim and its reminders', JSON.stringify(await page.evaluate(() => window.Saathi.state.mods.access.claims)) === '{}' && !(await rem(page, 'access-pmmvy')) && !(await page.$('.access-my')));
  check('2 no birth-cost card on the after-birth list', !/₹37,600/.test(await view(page)));
  check('2 nothing about her claims went to any server', !sent.slice(before).some((x) => /pmmvy|claim/i.test(x)), sent.slice(before));
  check('2 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#access-schemes-preg', seed: pregSeed(20, { mods: { preg: { mcp: { anc: [isoAgo(60), isoAgo(14)] } } } }) });
  check('2 pregnancy list: the birth-cost card, with its official source', /₹37,600/.test(await view(page)) && !!(await page.$('#view a[href^="https://static.pib.gov.in/"]')));
  await page.$eval('#sch-pmmvy', (d) => { d.open = true; }); await tap(page, '[data-claim-start="pmmvy"]'); await sleep(300);
  const blk = await page.$eval('#sch-pmmvy .access-claim', (e) => e.innerText);
  /* Version 39.7 (sources check): the 2022 guidelines ask for one check-up; the line says some offices still ask for two */
  check('2 pregnant, after her check-ups: she can apply for the first part now', /You have had a check-up, so once your pregnancy is registered you can apply for the first part \(₹3,000\) now/.test(blk) && /Some offices still ask for two check-ups/.test(blk) && !/Register by/.test(blk) && !(await rem(page, 'access-pmmvy')), blk);
  await page.evaluate((d) => { const S = window.Saathi; S.state.mods.preg.mcp.anc = [d]; S.save(); S.render(); }, isoAgo(14)); await sleep(250);
  await page.$eval('#sch-pmmvy', (d) => { d.open = true; });
  check('2 after one check-up: the "apply now" line already shows (Version 39.7: the 2022 guidelines need one)', /first part/.test(await page.$eval('#sch-pmmvy .access-claim', (e) => e.innerText)));
  check('2 pregnant: no errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#access-schemes-preg', lang: 'hi', seed: pregSeed(20, { lang: 'hi' }) });
  check('2 Hindi: the claim button and the birth-cost card', /मेरा दावा ट्रैक करें/.test(await page.$eval('#view', (e) => e.textContent)) && /₹37,600/.test(await view(page)));
  check('2 Hindi: no errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 3. The report for the doctor ---------- */
{
  const seed = { askTopics: ['Weekly iron tablet'], mods: { access: { claims: { pmmvy: { started: isoAgo(5), docs: {}, applied: isoAgo(2) } } } } };
  const { ctx, page, errs } = await open({ hash: '#report', android: true, seed });
  const qs = () => page.$$eval('#view ol.steps li', (l) => l.map((x) => x.textContent));
  check('3 her own question comes first', (await qs())[0] === 'Weekly iron tablet' && (await qs()).slice(-1)[0] === 'Is there anything here I should keep an eye on?', await qs());
  check('3 language chips: English and Hindi, English on', JSON.stringify(await page.$$eval('[data-rp-lang]', (b) => b.map((x) => x.dataset.rpLang + (x.classList.contains('on') ? '*' : '')))) === '["en*","hi"]');
  /* a module that saves while giving its summary must not store the report's language as hers */
  await page.evaluate(() => { window.__savedLangs = []; window.Saathi.register({ id: 'zz-saves', summary: (S) => { S.save(); window.__savedLangs.push(JSON.parse(localStorage.getItem('qura-saathi-v1')).lang); return []; } }); });
  await tap(page, '[data-rp-lang="hi"]'); await sleep(250);
  const v = await view(page);
  check('3 the report turns Hindi, the app stays English', /मेरे सवाल/.test(v) && /शुरू/.test(v) && /Report language/.test(v) && (await page.evaluate(() => window.Saathi.state.lang)) === 'en' && JSON.parse(await page.evaluate(() => localStorage.getItem('qura-saathi-v1'))).lang === 'en', v.slice(0, 600));
  check('3 the tools\' lines turn Hindi too', /मेरे दावे: PMMVY: आवेदन किया/.test(v));
  check('3 the report\'s language is never saved, even by a module that saves while giving its summary', !/rpLang/.test(await page.evaluate(() => localStorage.getItem('qura-saathi-v1'))) && (await page.evaluate(() => window.__savedLangs)).length > 0 && (await page.evaluate(() => window.__savedLangs)).every((x) => x === 'en'), await page.evaluate(() => window.__savedLangs));
  await tap(page, '#rp-send'); await sleep(200);
  const sh = await page.evaluate(() => window.__shared);
  check('3 Share sends the Hindi report', sh.length === 1 && sh[0][0] === 'डॉक्टर के लिए मेरी रिपोर्ट' && /मेरे सवाल/.test(sh[0][1]) && /Weekly iron tablet/.test(sh[0][1]), sh);
  await tap(page, '#rp-copy'); await sleep(200);
  check('3 Copy copies the same text', JSON.stringify(await page.evaluate(() => window.__copied)) === JSON.stringify([sh[0] && sh[0][1]]));
  await tap(page, '#rp-pdf'); await sleep(200);
  check('3 Save as PDF opens the phone\'s print screen, named in the report\'s language', JSON.stringify(await page.evaluate(() => window.__printed)) === JSON.stringify(['डॉक्टर के लिए मेरी रिपोर्ट']));
  await page.emulateMedia({ media: 'print' });
  const pr = await page.evaluate(() => { const d = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'missing'; }; return { top: d('.topbar'), tab: d('.tabbar'), langs: d('.rp-langs'), send: d('#rp-send'), sec: d('.rp-sec') }; });
  check('3 printing shows only the report: no bars, chips or buttons', pr.top === 'none' && pr.tab === 'none' && pr.langs === 'none' && pr.send === 'none' && pr.sec !== 'none' && pr.sec !== 'missing', pr);
  await page.emulateMedia({ media: 'screen' });
  await tap(page, '[data-go="report-show"]'); await sleep(250);
  const big = await page.evaluate(() => { const s = document.querySelector('.rp-show'); const li = s && s.querySelector('.rp-lines li'); return { lang: s && s.getAttribute('lang'), size: li ? parseFloat(getComputedStyle(li).fontSize) : 0, text: s ? s.innerText : '', buttons: s ? s.querySelectorAll('button').length : -1 }; });
  check('3 the big screen: the same report in Hindi, in large type, with no buttons', big.lang === 'hi' && big.size >= 19 && /मेरे सवाल/.test(big.text) && big.buttons === 0, big);
  check('3 the big screen goes back to the report', !!(await page.$('#view [data-back="report"]')));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'report');
  await tap(page, '#rp-pdf'); await sleep(200);
  check('3 discreet mode: the PDF is called only "My notes"', (await page.evaluate(() => window.__printed)).slice(-1)[0] === 'My notes');
  await go(page, 'help');
  check('3 Help still says "Going to a doctor? Show this report"', /Going to a doctor\? Show this report/.test(await view(page)));
  check('3 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#report' });
  check('3 on the web there is no PDF button (no print screen there)', !(await page.$('#rp-pdf')) && !!(await page.$('#rp-send')) && !!(await page.$('[data-go="report-show"]')));
  await page.evaluate(() => { const S = window.Saathi; S.state.lang = 'mr'; S.save(); S.render(); }); await sleep(250);
  check('3 a Marathi app offers Marathi first, then English and Hindi', JSON.stringify(await page.$$eval('[data-rp-lang]', (b) => b.map((x) => x.dataset.rpLang + (x.classList.contains('on') ? '*' : '')))) === '["mr*","en","hi"]');
  check('3 web: no errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 4. Care near me ---------- */
{
  /* the builder, on made-up files shaped like data.gov.in's two lists */
  const outDir = path.join(root, 'test', '_care'); fs.rmSync(outDir, { recursive: true, force: true });
  const log = execFileSync(process.execPath, [path.join(root, 'tools', 'care-data.mjs'), '--pins', path.join(root, 'test/fixtures/care/pincode.csv'), '--facilities', path.join(root, 'test/fixtures/care/nin.csv'), '--out', outDir, '--pins-updated', '2026-08-10', '--fac-updated', '2026-08-11'], { encoding: 'utf8' });
  check('4 builder: PIN codes from post offices; offices far outside their district are not used', /PIN codes: 13 from 16 post offices; 1 without a map location\. Not used: 3 post offices far outside their district/.test(log), log);
  check('4 builder: a PIN code moves to where its own facilities agree, or gets a location from them', /PIN codes moved to where 3 or more of their own facilities agree: 1; given a location that way: 1\./.test(log), log);
  check('4 builder: keeps government centres with a trustworthy location; drops other types, no location, shared default points, town-level points it can\'t check, and centres far from their PIN; fixes swapped ones', /Facilities kept: 24 of 33 .*left out: 2 of other types, 1 without a usable map location, 3 on a point shared by 4 or more, 1 on a town-level point with no PIN code to check, 1 more than 50 km from their own PIN code, 1 with no PIN code, far outside their own district\. Put right: 1 with latitude and longitude the wrong way round/.test(log), log);
  check('4 builder: takes phone numbers and e-mails out of addresses', /Phone numbers or e-mails taken out of 1 facility names or addresses\./.test(log), log);
  const tileOf = (n) => { const box = {}; new Function('window', fs.readFileSync(path.join(outDir, n + '.js'), 'utf8'))(box); return box.SAKHI_CARE[n]; };
  const contact = tileOf('t12_77').find((f) => f[0] === 'TEST Sub-centre Contact');
  check('4 builder: an address keeps its place words, not the mobile number, landline or e-mail', contact && contact[5] === 'TEST Road, Ulsoor', contact);
  const edge = tileOf('t12_78').find((f) => f[0] === 'TEST Sub-centre Edge');
  check('4 builder: a location that rounds to a whole degree sits in that degree\'s square', edge && edge[3] === 78, edge);
  check('4 builder: a facility code in a name (070607804) is not mistaken for a phone number', !!tileOf('t12_77').find((f) => f[0] === 'TEST Area-2 (070607804)'));
  check('4 builder: names the states the list hardly covers', /States where the list is missing most centres: West Bengal\./.test(log), log);
  check('4 builder: an index, PIN shards and map squares', JSON.stringify(fs.readdirSync(outDir).sort()) === JSON.stringify(['index.js', 'p11.js', 'p12.js', 'p56.js', 'p58.js', 'p70.js', 'p80.js', 't12_77.js', 't12_78.js', 't13_77.js', 't14_75.js', 't28_77.js']), fs.readdirSync(outDir));
  const before = sent.length;
  const { ctx, page, errs } = await open({ hash: '#access-care', care: 'test/_care/' }); await sleep(700);
  const names = (sel) => page.$$eval(sel, (h) => { const out = {}; let cur = null; h.forEach((e) => { if (e.tagName === 'H4') { cur = e.textContent; out[cur] = []; } else if (cur) e.querySelectorAll('.access-fac strong').forEach((x) => out[cur].push(x.textContent)); }); return out; });
  const groups = () => names('.access-near > h4, .access-near > .list');
  check('4 her account\'s PIN code is filled in, and says so', (await page.$eval('#access-pin', (e) => e.value)) === '560001' && /This is the PIN code in your Sakhi account/.test(await view(page)));
  check('4 the card names the PIN\'s district and state', /Near PIN 560001/.test(await view(page)) && (await page.$eval('.access-near-place', (e) => e.textContent)) === 'Bengaluru Urban, Karnataka');
  let g = await groups();
  check('4 the three nearest health centres, nearest first; a fourth and one 53 km away are left out', JSON.stringify(g['Health centres']) === JSON.stringify(['TEST Sub-centre Very Near', 'TEST Sub-centre Shivajinagar', 'TEST Urban PHC Shanthinagar']), g);
  check('4 the three nearest hospitals, a women\'s hospital among them; farther ones are left out', JSON.stringify(g['Hospitals']) === JSON.stringify(['TEST Women Hospital Vanivilas', 'TEST District Hospital Bengaluru', 'TEST Medical College Hospital']), g);
  const rows = await page.$$eval('.access-fac', (r) => r.map((x) => x.innerText));
  check('4 the list\'s empty markers (NA, \\N) never show in an address', !rows.some((x) => /\\N|\bNA\b/.test(x)) && rows.some((x) => /TEST 12, Hosur Road, Shanthinagar/.test(x)), rows);
  check('4 each row: type and distance, and the address', /Sub-centre · less than 1 km/.test(rows[0]) && /TEST Cubbon Road, Cubbon Park/.test(rows[0]) && rows.some((x) => /Women’s hospital · about 1 km/.test(x)), rows);
  const a0 = await page.$eval('.access-fac a', (a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel, text: a.textContent }));
  check('4 Directions opens the map at the centre (not at her)', a0.href === 'https://www.google.com/maps/search/?api=1&query=12.9760,77.5935' && a0.target === '_blank' && /noopener/.test(a0.rel) && a0.text === 'Directions', a0);
  const foot = await page.$eval('.access-near', (e) => e.innerText);
  const today = await page.evaluate(() => window.Saathi.fmtD(window.Saathi.today(), { day: 'numeric', month: 'short', year: 'numeric' }));
  check('4 the caveat: straight-line distances, the list last revised in 2021 and maybe missing a centre, check with the ASHA or 104', /Distances are in a straight line/.test(foot) && /last revised in 2021: a centre may be missing/.test(foot) && /check with your ASHA or call 104/.test(foot), foot);
  check('4 the sources and the day Sakhi checked them', foot.includes('Checked by Sakhi on ' + today) && (await page.$$eval('.access-near .sources a', (l) => l.map((a) => a.getAttribute('href')))).every((u) => u.indexOf('https://www.data.gov.in/') === 0));
  const pinAt = (shard, pin) => page.evaluate((a) => window.Saathi.care.load(a[0]).then((x) => x.p[a[1]].slice(0, 2)), [shard, pin]);
  check('4 central Kolkata\'s PIN stays in central Kolkata, though two of its three offices were placed 25 km away', JSON.stringify(await pinAt('p70', '700001')) === JSON.stringify([22.5791, 88.3498]), await pinAt('p70', '700001'));
  check('4 a PIN code placed on India\'s centre moves to where its own sub-centres are', JSON.stringify(await pinAt('p58', '581999')) === JSON.stringify([14.0105, 75.0113]), await pinAt('p58', '581999'));
  check('4 a PIN code whose only office was misplaced gets its location from its own sub-centres', JSON.stringify(await pinAt('p56', '560099')) === JSON.stringify([12.8512, 77.6534]), await pinAt('p56', '560099'));
  const swapped = await page.evaluate(() => window.Saathi.care.load('t12_77').then((t) => t.find((f) => f[0] === 'TEST CHC Swapped')));
  check('4 a centre with latitude and longitude swapped sits at the right place', JSON.stringify(swapped && swapped.slice(1, 4)) === JSON.stringify(['chc', 12.8017, 77.4012]), swapped);
  const typePin = async (p) => { await page.fill('#access-pin', p); await tap(page, '#access-pin-go'); await sleep(500); };
  await typePin('110001');
  g = await groups();
  check('4 another PIN code (her mother\'s home, say): a different district, and a hospital 58 km away is not "near"', /Near PIN 110001/.test(await view(page)) && (await page.$eval('.access-near-place', (e) => e.textContent)) === 'New Delhi, Delhi' && JSON.stringify(g['Health centres']) === JSON.stringify(['TEST M&CW Centre Delhi', 'TEST PHC Connaught Place']) && JSON.stringify(g['Hospitals']) === JSON.stringify(['TEST Maternity Home Delhi']) && /Mother and child welfare centre · less than 1 km/.test(await view(page)) && /Maternity home · less than 1 km/.test(await view(page)), g);
  check('4 a typed PIN code is not her account\'s: the note says it is not saved', /Your PIN is used only on this screen and is not saved/.test(await view(page)));
  await typePin('700001');
  check('4 a state the list hardly covers: says so, with no misleading "nearest" and no distance caveat', /The government’s list is missing most centres in West Bengal, so Sakhi can’t tell which are nearest/.test(await view(page)) && !/Distances are in a straight line/.test(await view(page)) && !(await page.$('.access-fac')) && (await page.$eval('.access-near-place', (e) => e.textContent)) === 'Kolkata, West Bengal');
  await typePin('125001');
  check('4 a well-covered state with no centre within 50 km: one plain line, not two "None" lines', /The government’s list has no centres within 50 km of this PIN code\. That doesn’t mean there are none/.test(await view(page)) && !/None within 50 km/.test(await view(page)) && (await page.$eval('.access-near-place', (e) => e.textContent)) === 'Hisar, Haryana');
  await typePin('800099');
  check('4 a PIN code whose district and state are "NA" shows no place, not "Na, Na"', !(await page.$('.access-near-place')) && !/\bNa\b/.test(await page.$eval('.access-near', (e) => e.innerText)));
  await typePin('560998');
  check('4 a PIN code with no map location: its district, and no distances', /no map location for this PIN code/.test(await view(page)) && (await page.$eval('.access-near-place', (e) => e.textContent)) === 'Bengaluru Urban, Karnataka' && !(await page.$('.access-fac')));
  await typePin('799999');
  check('4 a PIN code not in India Post\'s list', /This PIN code isn’t in India Post’s list/.test(await view(page)) && !(await page.$('.access-fac')));
  await tap(page, '#access-pin-clear'); await sleep(300);
  check('4 Change empties the box and does not bring the account\'s PIN back', (await page.$eval('#access-pin', (e) => e.value)) === '' && !(await page.$('.access-near')));
  check('4 nothing about the PIN codes went to any server', !sent.slice(before).some((x) => /110001|560998|799999|560001|care/.test(x)), sent.slice(before));
  check('4 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#access-care', care: 'test/_care/', lang: 'hi', seed: { lang: 'hi' } }); await sleep(700);
  const v = await view(page);
  check('4 Hindi: the card', /PIN 560001 के पास/.test(v) && /स्वास्थ्य केंद्र/.test(v) && /महिला अस्पताल · लगभग 1 किमी/.test(v) && /रास्ता देखें/.test(v) && /2021 में बदली गई थी/.test(v), v.slice(0, 900));
  check('4 Hindi: no errors', errs.length === 0, errs);
  await ctx.close();
}
for (const [label, care] of [['no data bundled', null], ['a folder that is a web address', 'https://evil.example/'], ['a folder that climbs out', '../secret/']]) {
  const { ctx, page, errs } = await open({ hash: '#access-care', care }); await sleep(500);
  const tried = await page.evaluate(() => [...document.scripts].map((x) => x.getAttribute('src') || '').filter((x) => /care|evil|secret/.test(x)));
  check('4 ' + label + ': no data is loaded and the card explains what the live app will do', !(await page.evaluate(() => window.Saathi.care.on())) && tried.length === 0 && /In the live app this page will list the real facilities/.test(await view(page)) && (await page.$eval('#access-pin', (e) => e.value)) === '560001', { tried });
  check('4 ' + label + ': no errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page } = await open({ hash: '#access-care', care: 'test/_care/' }); await sleep(500);
  const r = await page.evaluate(() => Promise.all(['../x', 'a/b', 'https://evil.example/x', 'index.js', ''].map((n) => window.Saathi.care.load(n))));
  const tried = await page.evaluate(() => [...document.scripts].map((x) => x.getAttribute('src') || '').filter((x) => /evil|\.\.|a\/b|index\.js\.js/.test(x)));
  check('4 the loader refuses any name that is not letters, digits and _', r.every((x) => x === null) && tried.length === 0, { r, tried });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'PLANS FAIL ' : 'PLANS OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
