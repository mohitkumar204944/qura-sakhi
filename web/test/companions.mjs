// Version 28's first four "do" features (docs/feature-research-2026-10-22.md: A2, A4, B4, B5):
//   the iron companion, screening "you're due" on Home, My ASHA or ANM, and Do it online.
// Checks:
//   - plans and ticks: one record shared with the pregnancy logs, old ticks carried over, one reminder, the Home card,
//     tablets left, the weekly tablet and the doctor's course;
//   - the check-ups card's rules;
//   - the ASHA number checked, kept on the phone and never sent, with the show screen;
//   - the official links;
//   - Hindi; no page errors.
// Usage: node test/companions.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 500)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1992-07-01', consent: { c1: isoAgo(30), c2: null, c4: null }, situation: { stage: 'cycle' },
  events: [{ d: isoAgo(52), t: 'start' }, { d: isoAgo(47), t: 'end' }, { d: isoAgo(24), t: 'start' }, { d: isoAgo(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });

const browser = await chromium.launch();
const sent = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  /* a server address, so anything the app sent would show up here */
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: 'test-0.27', platform: 'web' }) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
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
const iron = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods || {}).iron || {})));
const rem = (page, id) => page.evaluate((x) => { const r = (window.Saathi.state.reminders || []).find((y) => y.id === x); return r ? JSON.parse(JSON.stringify(r)) : null; }, id);

/* ---------- 1. Iron: pregnancy, one record with the pregnancy logs ---------- */
{
  const preg = { situation: { stage: 'preg', pregnant: true, pregnantSince: isoAgo(140) }, mods: { preg: { tabs: { [isoAgo(2)]: { ifa: true, ca: true }, [isoAgo(1)]: { ca: true } } } },
    reminders: [{ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA tablet', hi: 'IFA' }, kind: 'med', start: isoAgo(5), every: 1, time: '21:00', on: true }] };
  const { ctx, page, errs } = await open({ hash: '#iron', seed: preg });
  check('1 the pregnancy plan is suggested for a pregnant woman', (await page.$eval('input[name="iron-plan"]:checked', (e) => e.value)) === 'preg');
  check('1 the plan wording is the verified article text', /one red iron-folic acid tablet a day, for at least 180 days, and again for 180 days after the birth/.test(await view(page)));
  await page.fill('#iron-time', '21:30'); await tap(page, '#iron-start'); await sleep(300);
  let d = await iron(page);
  check('1 the plan starts today, and the ticks from the pregnancy logs come over once', d.plan === 'preg' && d.start === isoAgo(0) && d.log[isoAgo(2)] === 't' && !d.log[isoAgo(1)] && d.mig === 1, d);
  check('1 one iron reminder: the pregnancy logs\' IFA reminder is replaced', !!(await rem(page, 'iron')) && (await rem(page, 'iron')).time === '21:30' && !(await rem(page, 'preg-ifa')));
  await tap(page, '#iron-took'); await sleep(250); d = await iron(page);
  check('1 "I took it" ticks today and marks today\'s reminder done', d.log[isoAgo(0)] === 't' && (await rem(page, 'iron')).doneOn === isoAgo(0));
  check('1 the count shows days taken since the plan began, not the carried-over days before it', /1 of 180 days/.test(await view(page)), await view(page));
  await page.$eval('[data-iron-day="' + isoAgo(0) + '"]', (e) => e.click()); await sleep(250);
  check('1 tapping a day in the week strip unticks it', !(await iron(page)).log[isoAgo(0)] && !(await rem(page, 'iron')).doneOn);
  await go(page, 'preg-logs'); await page.$eval('[data-pg-tab="tab"]', (b) => b.click()); await sleep(300);
  const tick = await page.$('[data-pg-tick="ifa|' + isoAgo(0) + '"]');
  if (tick) { await tick.click(); await sleep(250); }
  check('1 ticking IFA in the pregnancy logs ticks the same day in the iron companion', !!tick && (await iron(page)).log[isoAgo(0)] === 't');
  check('1 the pregnancy logs\' reminder button is now for calcium only', /Daily reminder for calcium/.test(await view(page)) && /Your iron plan and its reminder/.test(await view(page)));
  await go(page, 'home');
  check('1 Home: no iron card once today is ticked', !(await page.$('#iron-home-took')));
  await page.evaluate((k) => { delete window.Saathi.state.mods.iron.log[k]; window.Saathi.save(); }, isoAgo(0)); await go(page, 'learn'); await go(page, 'home');
  check('1 Home: the iron card, with one tap', !!(await page.$('#iron-home-took')) && /Iron tablet today/.test(await view(page)));
  await tap(page, '#iron-home-took'); await sleep(300);
  check('1 the Home tap ticks today and the card goes', (await iron(page)).log[isoAgo(0)] === 't' && !(await page.$('#iron-home-took')));
  await go(page, 'report');
  check('1 the doctor report shows the iron days', /Iron tablets: Pregnancy, since .*1 of 180 days/.test(await view(page)), (await view(page)).slice(0, 900));
  check('1 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 2. Iron: tablets left, the weekly tablet, the doctor's course, discreet Home ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#iron' });
  check('2 the weekly tablet is suggested at 20–49, not pregnant', (await page.$eval('input[name="iron-plan"]:checked', (e) => e.value)) === 'weekly');
  const wd = new Date().getDay();
  await page.selectOption('#iron-day', String(wd)); await tap(page, '#iron-start'); await sleep(300);
  let r = await rem(page, 'iron');
  check('2 the weekly reminder rings on her day', r && JSON.stringify(r.weekdays) === JSON.stringify([wd]) && !r.every, r);
  check('2 due today on her day', /This week’s tablet/.test(await view(page)) && !!(await page.$('#iron-took')));
  await page.fill('#iron-left', '6'); await tap(page, '#iron-left-go'); await sleep(200);
  await tap(page, '#iron-took'); await sleep(250);
  check('2 a tick counts one down from the strip, and 5 left warns', (await iron(page)).left === 5 && /Only 5 tablets left/.test(await view(page)) && /Jan Aushadhi/.test(await view(page)));
  check('2 done for this week; 1 week counted', /Taken this week/.test(await view(page)) && /Weeks taken: 1/.test(await view(page)));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn');
  await page.evaluate(() => { const S = window.Saathi; const d = S.state.mods.iron; d.log = {}; d.plan = 'doctor'; S.save(); }); await go(page, 'home');
  const strip = await page.$eval('.iron-home', (e) => e.innerText).catch(() => '');
  check('2 discreet mode: the Home card says only "Today’s tablet" and "Done"', /Today’s tablet/.test(strip) && !/iron|Days|Weeks/i.test(strip) && /Done/.test(strip), strip);
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = false; S.save(); }); await go(page, 'iron');
  const until = isoAgo(-60);
  await page.fill('#iron-until', until); await page.$eval('#iron-until', (e) => e.dispatchEvent(new Event('change'))); await sleep(250);
  r = await rem(page, 'iron-test');
  check('2 the doctor\'s course: a reminder for the repeat Hb test on its last day', r && JSON.stringify(r.dates) === JSON.stringify([until]) && /repeat Hb/.test(r.title.en), r);
  await tap(page, '#iron-stop'); await sleep(150); await tap(page, '#iron-stop-yes'); await sleep(250);
  check('2 stopping the plan removes its reminders and keeps the ticks', !(await rem(page, 'iron')) && !(await rem(page, 'iron-test')) && !!(await iron(page)).ended && /Your last plan ended/.test(await view(page)));
  check('2 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 3. Screening "you're due" on Home ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#home' });
  check('3 at 34 with no dates: the free check-ups card, naming both', /Free check-ups for you/.test(await view(page)) && /Cervical screening/.test(await view(page)) && /Breast exam by a health worker/.test(await view(page)));
  await tap(page, '#screen-home-later'); await sleep(250);
  check('3 "Later" hides it for 60 days', !/Free check-ups for you/.test(await view(page)) && (await page.evaluate(() => window.Saathi.state.mods.screen.snooze)) === isoAgo(-60));
  await page.evaluate(() => { const S = window.Saathi; delete S.state.mods.screen.snooze; S.state.mods.screen.last = { cervix: '2024-02-01', cbe: '2024-02-01' }; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('3 both done within 5 years: no card', !/Free check-ups for you/.test(await view(page)));
  await page.evaluate(() => { const S = window.Saathi; S.state.mods.screen.last = { cervix: '2019-01-10' }; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('3 discreet mode: no card', !/Free check-ups/.test(await view(page)));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = false; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('3 an old date (2019) is due again: the card is back', /Free check-ups for you/.test(await view(page)));
  check('3 no page errors', errs.length === 0, errs);
  await ctx.close();
}
for (const [label, seed] of [['under 30', { dob: '1999-03-01' }], ['pregnant', { situation: { stage: 'preg', pregnant: true, pregnantSince: isoAgo(70) } }]]) {
  const { ctx, page } = await open({ hash: '#home', seed });
  check('3 ' + label + ': no check-ups card', !/Free check-ups for you/.test(await view(page)));
  await ctx.close();
}

/* ---------- 4. My ASHA or ANM ---------- */
{
  const before = sent.length;
  const { ctx, page, errs } = await open({ hash: '#help' });
  check('4 Help offers My ASHA or ANM', !!(await page.$('#view [data-go="asha"]')));
  await go(page, 'asha');
  await page.fill('#asha-phone', '12345'); await tap(page, '#asha-save'); await sleep(200);
  check('4 a wrong number is refused', /Enter a 10-digit mobile number/.test(await view(page)) && !(await page.evaluate(() => (window.Saathi.state.mods.asha || {}).phone)));
  await tap(page, '[data-asha-role="anm"]'); await page.fill('#asha-name', 'Rekha'); await page.fill('#asha-phone', '+91 98765 01234'); await tap(page, '#asha-save'); await sleep(250);
  check('4 saved as 10 digits, with her role and name', JSON.stringify(await page.evaluate(() => window.Saathi.state.mods.asha)) === JSON.stringify({ name: 'Rekha', phone: '9876501234', role: 'anm' }));
  check('4 one tap to call', (await page.$eval('#asha-call', (a) => a.getAttribute('href'))) === 'tel:+919876501234');
  await page.evaluate(() => { window.Saathi.ask('Weekly iron tablet'); }); await sleep(200);
  await go(page, 'asha-show');
  const show = await view(page);
  check('4 the show screen: about her and her questions, in big type', /For my ASHA or ANM/.test(show) && /Asha, age 34/.test(show) && /My last period started on/.test(show) && /Weekly iron tablet/.test(show) && /Nothing was sent/.test(show), show);
  check('4 nothing about her ASHA went to any server', !sent.slice(before).some((x) => /9876501234|Rekha/.test(x)), sent.slice(before));
  await go(page, 'asha'); await tap(page, '#asha-edit'); await sleep(150); await tap(page, '#asha-del'); await sleep(200);
  check('4 her ASHA\'s number can be removed', !(await page.evaluate(() => (window.Saathi.state.mods.asha || {}).phone)) && !!(await page.$('#asha-phone')));
  check('4 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 5. Do it online, and Hindi ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#access-online' });
  const links = await page.$$eval('#view .access-on a.btn', (as) => as.map((a) => a.getAttribute('href')));
  check('5 six official links, all https on gov.in', links.length === 6 && links.every((u) => /^https:\/\/[a-z0-9.-]+\.gov\.in\//.test(u)), links);
  check('5 the warning about OTPs and paying anyone', /Never share an OTP with someone who calls you/.test(await view(page)));
  check('5 no form: Sakhi fills in nothing', !(await page.$('#view input, #view form')));
  await go(page, 'access-care');
  check('5 Care near me leads to My ASHA and to Do it online', !!(await page.$('#view [data-go="asha"]')) && !!(await page.$('#view [data-go="access-online"]')));
  check('5 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#iron', lang: 'hi', seed: { lang: 'hi' } });
  check('6 Hindi: the iron page', /आयरन की गोलियाँ/.test(await view(page)) && /हफ़्ते की गोली/.test(await view(page)));
  await go(page, 'asha'); check('6 Hindi: My ASHA', /मेरी ASHA या ANM/.test(await view(page)));
  await go(page, 'access-online'); check('6 Hindi: Do it online', /सरकारी साइट खोलें/.test(await view(page)));
  await go(page, 'home'); check('6 Hindi: the check-ups card', /आपके लिए मुफ़्त जाँच/.test(await view(page)));
  check('6 no page errors', errs.length === 0, errs);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'COMPANIONS FAIL ' : 'COMPANIONS OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
