// Version 39.58, the lives audit's quick fixes (Mohit, 3 Nov: "proceed with the quick fixes first"; docs/lives-audit-2026-11-03.md,
// phase A). One check per fix, each on the woman the audit found it with:
// - 1 the doctor check (C4): "Ask a Qura doctor" in every plan, the free government doctor only on the government route, and
//   on a shared phone the call form with no topic;
// - 2 bleeding after menopause (C5): "Bleeding", never "Period started", on Today, the + menu and the log sheet, and saving it
//   says it needs a check (off_p_stopped's reviewed line), with "What this means";
// - 3 a negative test (C6): Today's "Period late?" says when it was negative and to test again in 3-7 days (the reviewed line);
//   two negatives 5 days apart or more give the reviewed two-negatives line;
// - 4 a shared phone (C8): her plan offered in plain words ("My plan"), its questions behind her PIN, the POI card kept off;
// - 5 (already built, kept here so it stays): "A year since your last period · Have your periods stopped?" at 12 months from 40;
// - 7 Version 39.58.1 (Mohit, 3 Nov: "fix the ASHA and free care setup steps too"): the setup card's ASHA number only on the
//   government route, and "Look at free care near you" on it and for a woman with nowhere to go yet.
// Usage: node test/lifefit.mjs [web dir]
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
const SHOTS = path.join(here, 'shots', 'lifefit'); fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }).catch(() => null);
const lateRowTxt = (page) => txt(page, '#view .hl-late-go');

/* ---------- 1 the doctor check ---------- */
/* Anjali, PMOS, periods 42 days apart, on My PMOS plan at plan day 35 with skipped periods: her plan's "Did you get the doctor check?" */
const gaps42 = () => [120, 78, 36].reduce((o, x) => o.concat([{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), []);
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'y', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' }, o || {});
const pmosP = (startAgo) => ({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true } }, body: [], intake: CIK() });
const pmosS = (care, x) => Object.assign({ dob: '1998-05-01', situation: care ? { care } : {}, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: pmosP(B(35)) }, reminders: [planRem(B(35))] }, x || {});
const docCard = (page) => page.evaluate(() => { const c = document.querySelector('#view .pl-sl-doc'); if (!c) return null;
  const q = c.querySelector('.pl-doc-qura'); const f = c.querySelector('[data-go="access-doctor"]'); const bs = [...c.querySelectorAll('button')].map((b) => b.innerText.trim());
  return { text: c.innerText.replace(/\s+/g, ' ').trim(), qura: !!q, topic: q ? q.dataset.ask : null, free: !!f, freeFirst: !!(q && f && (q.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING)), buttons: bs }; });
{
  let a = await open({ seed: seedOf(pmosS('private')) });
  let c = await docCard(a.page); await shot(a.page, '1-private');
  check('1.1 a private doctor: the doctor check has "Ask a Qura doctor" with her plan as the topic, and no "Free government doctor"', c && c.qura && c.topic === 'My PMOS plan' && !c.free, c);
  if (c && c.qura) { await tap(a.page, '#view .pl-sl-doc .pl-doc-qura'); check('1.2 "Ask a Qura doctor" opens the call form', /#ask/.test(await a.page.evaluate(() => location.hash)), await a.page.evaluate(() => location.hash)); }
  await done(a);
  a = await open({ seed: seedOf(pmosS(null)) }); c = await docCard(a.page);
  check('1.3 her care not answered (the doctor route): "Ask a Qura doctor", no government button', c && c.qura && !c.free, c);
  await done(a);
  a = await open({ seed: seedOf(pmosS('govt')) }); c = await docCard(a.page); await shot(a.page, '1-govt');
  check('1.4 the government route: the free government doctor first, then "Ask a Qura doctor"', c && c.free && c.qura && c.freeFirst, c);
  await done(a);
  a = await open({ seed: seedOf(pmosS('asha')) }); c = await docCard(a.page);
  check('1.5 her ASHA: the free government doctor stays, beside "Ask a Qura doctor"', c && c.free && c.qura, c);
  await done(a);
  a = await open({ seed: seedOf(Object.assign(pmosS('private'), { settings: { discreet: true, toursAuto: false, notify: true } })) }); c = await docCard(a.page);
  check('1.6 a shared phone: plain words, and "Ask a Qura doctor" opens the call form with no topic', c && c.qura && c.topic === '' && !/PMOS|period/i.test(c.text), c);
  await done(a);
}

/* ---------- 2 bleeding after menopause ---------- */
/* Sunita, 54: her periods stopped about a year and a half ago */
const menoS = (x) => Object.assign({ dob: '1972-01-15', situation: { midlife: true, stopped: true, stoppedOn: ago(540), care: 'govt' }, goals: ['meno', 'hot'], intake: { goal: 'hot', stage: 'meno' }, events: [{ d: ago(600), t: 'start' }, { d: ago(596), t: 'end' }, { d: ago(544), t: 'start' }, { d: ago(540), t: 'end' }] }, x || {});
{
  let a = await open({ seed: seedOf(menoS()) });
  const lbl = await txt(a.page, '#view [data-log="start"]'); const v = await view(a.page); await shot(a.page, '2-today');
  check('2.1 Today: "Bleeding", and no "Period started"', lbl === 'Bleeding' && !/Period started/.test(v), { lbl });
  await tap(a.page, '#view [data-log="start"]');
  /* Version 39.65 (the stage-change rules): it asks first whether her periods have come back; "No" keeps the doctor line */
  check('2.2a saving it asks "Have your periods come back?", "No" first at 56', /Have your periods come back\?/.test(await txt(a.page, '#sheet-root')) && (await a.page.$eval('#sheet-root .stack .btn', (e) => e.id).catch(() => '')) === 'pb-n');
  await tap(a.page, '#sheet-root #pb-n');
  const toast1 = await txt(a.page, '.toast');
  check('2.2 saving it says it needs a check: "Saved. Any bleeding now needs a check with a doctor, even a little."', /Saved\. Any bleeding now needs a check with a doctor, even a little\./.test(toast1) && /What this means/.test(toast1) && /Undo/.test(toast1), toast1);
  const means = await a.page.evaluate(() => { const b = [...document.querySelectorAll('.toast button')].find((x) => /What this means/.test(x.innerText)); if (b) { b.click(); return true; } return false; }); await settle(a.page, 600);
  const ex = await view(a.page);
  check('2.3 "What this means" opens What your diary shows, with "Bleeding after your periods stopped"', means && /#explain/.test(await a.page.evaluate(() => location.hash)) && /Bleeding after your periods stopped/.test(ex), ex.slice(0, 300));
  await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'days'; }); await go(a.page, 'diary');
  const tag = await a.page.evaluate(() => [...document.querySelectorAll('.dy-tag')].map((x) => x.innerText.trim()));
  await go(a.page, 'home'); const row = await a.page.evaluate(() => [...document.querySelectorAll('#view .ract-row button')].map((x) => x.innerText.trim()));
  check('2.4 Days lists it as "Bleeding", and Today has no period words after it', tag[0] === 'Bleeding' && row.indexOf('Period ended') < 0 && row.indexOf('Period started') < 0, { tag, row });
  await done(a);
  a = await open({ seed: seedOf(menoS()), hash: '#diary' }); await settle(a.page, 400);
  if (await has(a.page, '#fab')) await tap(a.page, '#fab');
  const fab = await a.page.evaluate(() => [...document.querySelectorAll('#fab-root .fab-it .fl')].map((x) => x.innerText.trim()));
  check('2.5 the + menu says "Bleeding"', fab.indexOf('Bleeding') >= 0 && fab.indexOf('Period started') < 0, fab);
  await done(a);
  a = await open({ seed: seedOf(menoS({ lang: 'hi' })) });
  const hl = await txt(a.page, '#view [data-log="start"]'); await tap(a.page, '#view [data-log="start"]'); await tap(a.page, '#sheet-root #pb-n'); const ht = await txt(a.page, '.toast');
  check('2.6 Hindi: "ब्लीडिंग", and the reviewed line when it is saved', hl === 'ब्लीडिंग' && /अब थोड़ी सी भी ब्लीडिंग हो तो डॉक्टर से जाँच ज़रूरी है।/.test(ht), { hl, ht });
  check('2.7 Hindi at 360 px: no sideways scroll', await noScroll(a.page));
  await done(a);
  a = await open({ seed: seedOf({}) });
  check('2.8 a woman tracking her periods still sees "Period started"', /Period started/.test(await txt(a.page, '#view [data-log="start"]')));
  await done(a);
  a = await open({ seed: seedOf(menoS({ settings: { discreet: true, toursAuto: false, notify: true } })) });
  const dl = await txt(a.page, '#view [data-log="start"]'); if (dl) await tap(a.page, '#view [data-log="start"]'); const dt = await txt(a.page, '.toast');
  check('2.9 a shared phone: the plain button and "Noted.", with no health words', !/Bleeding|check with a doctor/.test(dl + ' ' + dt), { dl, dt });
  await done(a);
}

/* ---------- 3 a negative test ---------- */
/* Priya, 24: periods 28 days apart, her last started 38 days ago, so she is 8 days past her likely range */
const lateS = (tests, x) => Object.assign({ dob: '2002-03-10', situation: { care: 'private' }, goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, events: regular(38), mods: tests ? { pregtest: { tests } } : {} }, x || {});
{
  let a = await open({ seed: seedOf(lateS(null)) });
  const r0 = await lateRowTxt(a.page);
  check('3.1 no test yet: "Period late?" with "A home test is the first step"', /Period late\?/.test(r0) && /A home test is the first step/.test(r0), r0);
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(1), r: 'neg' }])) });
  const r1 = await lateRowTxt(a.page); const go1 = await a.page.$eval('#view .hl-late-go', (b) => b.dataset.go).catch(() => ''); await shot(a.page, '3-negative');
  check('3.2 one negative test: its date and "If your period still hasn\'t come, test again in 3–7 days with first morning urine."', /Negative on 29 Oct\./.test(r1) && /test again in 3–7 days with first morning urine/.test(r1) && !/A home test is the first step/.test(r1), r1);
  check('3.3 the row opens "When can I test?", where her next test is saved', go1 === 'pregtest-when', go1);
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(8), r: 'neg' }, { d: ago(1), r: 'neg' }])) });
  const r2 = await lateRowTxt(a.page);
  check('3.4 two negatives a week apart: the reviewed line, on the doctor route "See a gynaecologist this week or next, or the PHC"', /Two negative tests about a week apart, and no period: a pregnancy is unlikely\./.test(r2) && /See a gynaecologist this week or next, or the PHC/.test(r2), r2);
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(8), r: 'neg' }, { d: ago(1), r: 'neg' }], { situation: { care: 'govt' } })) });
  check('3.5 the government route: "See a doctor this week or next, at the PHC or a gynaecologist"', /See a doctor this week or next, at the PHC or a gynaecologist/.test(await lateRowTxt(a.page)));
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(50), r: 'neg' }])) });
  check('3.6 a negative from before her last period doesn\'t count', /A home test is the first step/.test(await lateRowTxt(a.page)));
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(2), r: 'neg' }, { d: ago(1), r: 'pos' }])) });
  check('3.7 a positive after it: no "Period late?" (Version 39.57)', !(await has(a.page, '#view .hl-late-go')));
  await done(a);
  a = await open({ seed: seedOf(lateS([{ d: ago(1), r: 'neg' }], { lang: 'hi' })) });
  const rh = await lateRowTxt(a.page);
  check('3.8 Hindi: the date and the reviewed line', /को negative।/.test(rh) && /3–7 दिन बाद सुबह की पहली पेशाब से फिर test करें/.test(rh), rh);
  check('3.9 Hindi at 360 px: no sideways scroll', await noScroll(a.page));
  await done(a);
}

/* ---------- 4 a shared phone ---------- */
/* Asha, 33, period pain, a family phone: she joined, made her first log, and her goal has a plan */
const DISC = { discreet: true, shared: true, toursAuto: false, notify: true };
const openShared = async (a) => { if (await has(a.page, '#rest-open')) await tap(a.page, '#rest-open'); };
const offerS = (x) => Object.assign({ dob: '1993-05-01', situation: {}, goals: ['pain', 'track'], intake: { goal: 'pain', stage: 'cycle' }, focus: { tile: 'cycle', goals: ['pain'], at: ago(2) }, events: regular(10),
  prompts: { setup: 'off', planCall: ago(3), firstLog: ago(1), planOffer: ago(2) } }, x || {});
{
  let a = await open({ seed: seedOf(offerS({ settings: DISC })) }); await openShared(a);
  const off = await txt(a.page, '#view .pl-offer'); await shot(a.page, '4-shared-offer');
  check('4.1 a shared phone: her plan is offered in plain words ("Ready for you", "My plan", "See my plan")', /Ready for you/i.test(off) && /My plan/.test(off) && /See my plan/.test(off) && !/period|pain|PMOS/i.test(off), off);
  await done(a);
  a = await open({ seed: seedOf(offerS({ settings: Object.assign({ pinHash: 'test-pin' }, DISC) })) });
  await a.page.evaluate(() => { window.Saathi.mem.locked = false; window.Saathi.render(); }); await settle(a.page, 400);   /* she opened Sakhi with her PIN */
  if (await has(a.page, '#pl-off-go')) await tap(a.page, '#pl-off-go');
  const pg = await a.page.evaluate(() => ({ hash: location.hash, pad: !!document.querySelector('#pg-pad'), text: document.querySelector('#view').innerText.slice(0, 200) }));
  check('4.2 with her PIN set, See my plan asks her PIN before the plan\'s questions', /plan-goal/.test(pg.hash) && pg.pad && !/period pain/i.test(pg.text), pg);
  await done(a);
  a = await open({ seed: seedOf(offerS()) });
  check('4.3 her own phone: the offer as before, with her plan\'s name', /My period plan/.test(await txt(a.page, '#view .pl-offer')));
  await done(a);
  a = await open({ seed: seedOf({ dob: '1996-05-01', situation: { midlife: true, stopped: true, stoppedOn: ago(200) }, goals: ['meno', 'hot'], intake: { goal: 'hot', stage: 'meno' }, prompts: { setup: 'off', firstLog: ago(1), planOffer: ago(2) }, settings: DISC }) }); await openShared(a);
  check('4.4 a shared phone, periods stopped at 30: the POI card stays off it', !(await has(a.page, '#view .pl-m2-poi')) && !/POI|before 40/.test(await view(a.page)));
  await done(a);
  a = await open({ seed: seedOf({ dob: '1996-05-01', situation: { midlife: true, stopped: true, stoppedOn: ago(200) }, goals: ['meno', 'hot'], intake: { goal: 'hot', stage: 'meno' }, prompts: { setup: 'off', firstLog: ago(1), planOffer: ago(2) } }) });
  check('4.5 her own phone, periods stopped at 30: the POI card shows as before', await has(a.page, '#view .pl-m2-poi'));
  await done(a);
}

/* ---------- 5 a year without a period (already built: meno.js stopDue) ---------- */
{
  const a = await open({ seed: seedOf({ dob: '1980-02-01', situation: { midlife: true }, goals: ['meno', 'hot'], intake: { goal: 'hot', stage: 'meno' }, events: [{ d: ago(450), t: 'start' }, { d: ago(446), t: 'end' }, { d: ago(390), t: 'start' }, { d: ago(386), t: 'end' }] }) });
  const v = await view(a.page);
  check('5.1 46, periods changing, 12 months since her last period: "A year since your last period · Have your periods stopped?"', /A year since your last period/.test(v) && /Have your periods stopped\?/.test(v), v.slice(0, 400));
  await done(a);
}

/* ---------- 7 (Version 39.58.1) the ASHA and free-care setup steps, by her care answer ---------- */
/* Priya, 28, her last period logged: on Today in her first month, the next step; in Me after it, with free care seen, the one after */
const setupS = (care, x) => Object.assign({ dob: '1998-05-01', situation: care === undefined ? {} : { care }, goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, events: regular(10), joined: ago(5),
  prompts: { planCall: ago(3), firstLog: ago(4) } }, x || {});
const setupTxt = async (page, where) => { await go(page, where); return txt(page, '#view .setup-card'); };
{
  for (const [care, label] of [[undefined, 'not answered'], ['private', 'a private doctor']]) {
    let a = await open({ seed: seedOf(setupS(care)) });
    const td = await setupTxt(a.page, 'home');
    await a.page.evaluate(() => { const S = window.Saathi; S.data('access').seenFree = true; S.saveQuiet(); }); const me = await setupTxt(a.page, 'me');
    check('7.1 ' + label + ': no "Look at free care near you" on Today and no "Save your ASHA or ANM\'s number" in Me', !/Look at free care near you/.test(td) && !/ASHA|ANM/.test(td + ' ' + me), { td, me });
    await done(a);
  }
  let a = await open({ seed: seedOf(setupS('govt')) });
  const td = await setupTxt(a.page, 'home');
  await a.page.evaluate(() => { const S = window.Saathi; S.data('access').seenFree = true; S.saveQuiet(); }); const me = await setupTxt(a.page, 'me');
  check('7.2 a government centre: "Look at free care near you" on Today, then her ASHA\'s number in Me', /Look at free care near you/.test(td) && /Save your ASHA or ANM’s number/.test(me), { td, me });
  await done(a);
  a = await open({ seed: seedOf(setupS('asha', { joined: ago(200) })) });
  check('7.3 her ASHA: "Save your ASHA or ANM\'s number" in Me', /Save your ASHA or ANM’s number/.test(await setupTxt(a.page, 'me')));
  await done(a);
  a = await open({ seed: seedOf(setupS('none')) });
  const tn = await setupTxt(a.page, 'home');
  await a.page.evaluate(() => { const S = window.Saathi; S.data('access').seenFree = true; S.saveQuiet(); }); const mn = await setupTxt(a.page, 'me');
  check('7.4 nowhere yet: "Look at free care near you" stays (the government option one tap away), with no ASHA step', /Look at free care near you/.test(tn) && !/ASHA|ANM/.test(mn), { tn, mn });
  await done(a);
  a = await open({ seed: seedOf(setupS(undefined, { situation: { pregnant: true, pregnantSince: ago(140) }, goals: ['preg', 'food'], intake: { goal: 'food', stage: 'preg' }, events: [], joined: ago(200) })) });
  const mp = await setupTxt(a.page, 'me');
  check('7.5 pregnant, care not answered: no ASHA step in Me', !/ASHA|ANM/.test(mp), mp);
  await done(a);
}

console.log('page errors', errsAll.length ? errsAll : 'none');
check('6 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
process.exit(fails.length ? 1 : 0);
