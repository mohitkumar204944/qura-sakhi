// Version 39.81, under 18 in a Play build (Mohit, 7 Nov: "Do all", after the launch checklist; launch QA A4 / D1, option (a)).
// Play Console's target audience is 18 and over, so in a Play build (SAKHI_CONFIG.store 'play') a girl under 18 gets the safety
// guide only:
// - 1 the under-18 page: the safety guide and Back, no Learn button, no guides for girls, no "Learn pages for teens" line;
// - 2 Help: Back to that page (and Android's Back), no tab bar, no symptom-guide tabs, no free-services link; the doctor button
//   opens the trusted-adult page;
// - 3 every other page she might reach (Learn, an article, Explore, the library, Today, the diary, guides for girls) opens Help;
// - 4 nothing is saved;
// - 5 a pilot APK keeps the reading path as before;
// - 6 Hindi at 360 px, and no page errors.
// Usage: node test/playteen.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LOCAL = { app: '0.39.81-pilot', platform: 'android' };
const PLAY = { store: 'play' };

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date('2026-11-07T10:00:00+05:30') });
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 500); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const view = (page) => page.$eval('#view', (e) => e.innerText.replace(/\s+/g, ' ').trim());
const hash = (page) => page.evaluate(() => location.hash.slice(1));
const goTo = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 600); };
const tabbarShown = (page) => page.$eval('#tabbar', (e) => !e.hidden && getComputedStyle(e).display !== 'none').catch(() => false);
const goes = (page) => page.$$eval('#view [data-go]', (els) => els.map((e) => e.dataset.go));
/* her language, Start, then "2010 or later" on joining's first step: the under-18 page */
async function under18(page, lang) { await join(page, { lang: lang || 'en', under18: true }); await settle(page, 600); }

/* ---------- 1 to 4: a Play build ---------- */
{
  const a = await open({ config: PLAY });
  await under18(a.page);
  const v1 = await view(a.page);
  const g1 = await goes(a.page);
  check('1.1 the under-18 page: "This diary is for women 18 and over", and only the safety guide is offered', /This diary is for women 18 and over/.test(v1) && /The safety guide is free for everyone/.test(v1) && JSON.stringify(g1) === '["help"]' && await has(a.page, '#u18-back'), { v1: v1.slice(0, 300), g1 });
  check('1.2 no Learn pages, no guides for girls and no "Learn pages for teens" line on it', !/Learn pages/.test(v1) && !/education only/.test(v1) && !/[Gg]irls/.test(v1), v1.slice(0, 400));
  await tap(a.page, '#view [data-go="help"]');
  const v2 = await view(a.page);
  check('2.1 the safety guide opens, with a Back button and no tab bar', (await hash(a.page)) === 'help' && /Help and safety/.test(v2) && await has(a.page, '#help-u18-back') && !(await tabbarShown(a.page)), { h: await hash(a.page), tab: await tabbarShown(a.page) });
  check('2.2 Help keeps its danger signs and ambulance numbers, without the symptom-guide tabs or the free-services link', /nearest hospital/i.test(v2) && await has(a.page, '#sos-btn') && !(await has(a.page, '.help-tabs')) && !(await has(a.page, '#view [data-go="access-free"]')), v2.slice(0, 300));
  for (const r of ['learn', 'library', 'care', 'home', 'diary', 'me', 'teen', 'access-symptoms', 'a-what-is-a-menstrual-cycle', 'topic-cycle', 'plan']) {
    await goTo(a.page, r);
    check('3 "#' + r + '" opens Help instead', (await hash(a.page)) === 'help' && /Help and safety/.test(await view(a.page)), { h: await hash(a.page) });
  }
  await tap(a.page, '#view [data-ask]');
  const v3 = await view(a.page);
  check('2.3 the doctor button opens the trusted-adult page, not a booking form', (await hash(a.page)).startsWith('ask') && /Talking to a doctor/.test(v3) && !(await has(a.page, '#ac-topic')), { h: await hash(a.page), v: v3.slice(0, 200) });
  await goTo(a.page, 'help');
  await tap(a.page, '#help-u18-back');
  check('2.4 Back on Help returns to the under-18 page', /This diary is for women 18 and over/.test(await view(a.page)));
  await tap(a.page, '#view [data-go="help"]');
  const back = await a.page.evaluate(() => window.__sakhiBack());
  await settle(a.page, 500);
  check('2.5 Android\'s Back on Help does the same', back === true && /This diary is for women 18 and over/.test(await view(a.page)), { back });
  await tap(a.page, '#u18-back');
  check('2.6 Back on the under-18 page goes to the start', await has(a.page, '#w-start') || await has(a.page, '[data-ob-lang]'));
  const saved = await a.page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('qura-saathi-v1') || '{}'); return { dob: s.dob || null, events: (s.events || []).length, stage: s.stage || null }; } catch (e) { return { bad: String(e) }; } });
  check('4 nothing about her is saved (no birth date, no diary)', !saved.dob && !saved.events && saved.stage !== 'browse' && saved.stage !== 'app', saved);
  await done(a);
}

/* ---------- 5: a pilot APK keeps the reading path ---------- */
{
  const a = await open();
  await under18(a.page);
  const g = await goes(a.page);
  check('5.1 a pilot build: the safety guide and the Learn pages, as before', g.indexOf('help') >= 0 && g.indexOf('learn') >= 0 && /Learn pages/.test(await view(a.page)), g);
  await tap(a.page, '#view [data-go="learn"]');
  check('5.2 a pilot build: Learn opens, with the tab bar', (await hash(a.page)) === 'learn' && await tabbarShown(a.page), { h: await hash(a.page) });
  await done(a);
}

/* ---------- 6: Hindi at 360 px ---------- */
{
  const a = await open({ config: PLAY, lang: 'hi', w: 360, h: 800 });
  await under18(a.page, 'hi');
  const v = await view(a.page);
  check('6.1 Hindi: "सुरक्षा गाइड सबके लिए मुफ़्त है", and no Learn button', /सुरक्षा गाइड सबके लिए मुफ़्त है/.test(v) && JSON.stringify(await goes(a.page)) === '["help"]', v.slice(0, 300));
  await tap(a.page, '#view [data-go="help"]');
  check('6.2 Hindi Help at 360 px: Back named, no sideways scroll', (await a.page.$eval('#help-u18-back', (b) => b.getAttribute('aria-label')).catch(() => '')) === 'पीछे' && await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await done(a);
}

check('no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const f = results.filter((r) => !r.pass).length;
console.log((results.length - f) + '/' + results.length + ' passed');
process.exit(f ? 1 : 0);
