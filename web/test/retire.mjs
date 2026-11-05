// Version 39.68, the doctors' feature review, part 1: the removals (Mohit, 5 Nov: "go"; docs/feature-review-2026-11-05.md;
// MODULE_API section 111). What Dr. Megha and the gynaecologist removed is gone however she reaches it, and what they kept stays:
// - 1 retired pages land on Explore (a link, a quick answer, an old hash); Sach ya Myth?, her reminders, Care near me, My food's
//   plate and the pregnancy logs still open; no link to a retired page on any main screen, for each sample woman, on both care
//   routes; Explore and search show none of the retired tiles;
// - 2 the Learn library has 60 articles, the 12 removed ones open Learn, and no screen links to them;
// - 3 Today: no notes meter, no first-days read, no tip that starts on its own, no look-back (it stays on My plan), no petal;
//   Help only on Today (not on other screens, not while she joins), and the Help sheet without Private help, My ASHA or Tell a
//   person; Me without My garden;
// - 4 her plan: no answers summary before a plan, no Plan your week, no Your last plan, no + minutes, the baby plan without its
//   ready check and strength step, the removed chapters gone and one "Telling your family" for pain and heavy periods;
// - 5 Hindi and English only (Marathi moves to Hindi, Tamil to English); "My baby has died" gone, and leaving "I had a baby"
//   stops everything about the baby; no page errors.
// Usage: node test/retire.mjs [web dir]
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
const TODAY = '2026-11-05';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.68-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, goals: ['pain', 'track'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* My PMOS plan, started `startAgo` days ago (as test/onday.mjs seeds it) */
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', when: 'dinner' }, o || {});
const pmosP = (startAgo, x) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: {}, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: '23:30', work: 'home', log: {}, weeks: {}, body: [], doc: 'done', intake: CIK(), dayAsk: [] }, x || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const pmosS = (startAgo, x, y) => Object.assign({ dob: '1998-05-01', situation: { care: 'private', pcos: true }, goals: ['pmos'], intake: CIK(), mods: { plan: pmosP(startAgo, x) }, reminders: [planRem(startAgo)] }, y || {});

const RETIRED = ['journey', 'asha', 'asha-show', 'access-free', 'access-doctor', 'access-online', 'access-schemes', 'access-schemes-preg', 'access-schemes-post', 'docportal', 'tell', 'joy', 'joy-month', 'ttc-signs', 'ttc-ready',
  'midlife', 'selfcheck', 'intimate-safety', 'intimate-sti', 'loss-grief', 'meno-diary', 'periods-pms', 'periods-postpone', 'teen-mind', 'teen-puberty', 'teen-services', 'tools-summary', 'cond-anaemia', 'cond-endo', 'cond-hyst'];
const TILE_ONLY = ['access-care', 'plan-body', 'plan-plate', 'plan-pmos', 'preg-logs', 'pregnancy', 'tools-reminders'];
const GONE_ARTS = ['conceive.after-a-pregnancy-loss-care-and-support', 'intimate.did-not-want-the-sex', 'services.free-government-services', 'pregnancy.government-support-schemes', 'services.helplines-directory', 'mind_body.mood-and-the-cycle',
  'services.reading-prescription-tests', 'pregnancy.register-by-12-weeks', 'services.see-gynaecologist-government-hospital', 'mind_body.talking-to-family', 'pmos.who-treats-what', 'conceive.why-no-app-can-name-your-fertile-day'];

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== false) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, r) => { await page.evaluate((r) => { location.hash = '#' + r; }, r); await settle(page, 500); };
const hash = (page) => page.evaluate(() => location.hash);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const sample = (page, who, care) => page.evaluate(({ who, care, today }) => { const S = window.Saathi; S.reset(); if (S.account && S.account._testSignIn) S.account._testSignIn(); S.loadSample(who); const st = S.state; st.settings.toursAuto = false; st.fullTour = { st: 'done', d: today }; st.whatsNew = '9.99'; st.langChosen = true; if (care) st.situation.care = care; S.save(); }, { who, care, today: TODAY });

// 1. Retired pages, kept pages, and no links to a retired page on the main screens
{
  const a = await open();
  const land = {};
  for (const r of RETIRED) { await go(a.page, r); land[r] = await hash(a.page); }
  const wrong = Object.entries(land).filter(([, h]) => h !== '#care');
  check('1.1 each of the ' + RETIRED.length + ' retired pages lands on Explore', !wrong.length, wrong);
  const keep = {};
  for (const r of ['joy-quiz', 'tools-reminders', 'access-care', 'plan-plate', 'access-symptoms', 'report', 'iron']) { await go(a.page, r); keep[r] = { h: await hash(a.page), n: await a.page.evaluate(() => document.getElementById('view').innerText.trim().length) }; }
  const lost = Object.entries(keep).filter(([r, x]) => x.h !== '#' + r || x.n < 40);
  check('1.2 Sach ya Myth?, her reminders, Care near me, My plate, the symptom guide, her report and iron tablets still open', !lost.length, keep);
  const apiOk = await a.page.evaluate(({ R, T }) => { const S = window.Saathi; return R.every((r) => S.retired(r) && !S.routeOwner(r) && !S.toolShown(r)) && T.every((r) => !S.retired(r)) && !S.retired('joy-quiz'); }, { R: RETIRED, T: TILE_ONLY });
  check('1.3 the app reports retired pages as gone (no owner, not shown), and the tile-only ones as pages', apiOk);
  const tiles = await a.page.evaluate(({ R, T }) => window.Saathi.tiles().map((x) => x.route).filter((r) => R.concat(T).indexOf(r) >= 0), { R: RETIRED, T: TILE_ONLY });
  await go(a.page, 'care');
  const careLinks = await a.page.$$eval('#view [data-go]', (b) => b.map((x) => x.dataset.go));
  check('1.4 Explore shows no retired tile and no tile the doctors took off it', !careLinks.some((g) => RETIRED.concat(TILE_ONLY).indexOf(g) >= 0), careLinks.filter((g) => RETIRED.concat(TILE_ONLY).indexOf(g) >= 0));
  const found = {};
  for (const q of ['free doctor', 'garden', 'asha', 'summary for doctor', 'reminders', 'pms', 'endometriosis', '21 small steps', 'my plate']) {
    await a.page.evaluate((q) => { const i = document.querySelector('#view input[type="search"], #view input'); if (i) { i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); } }, q);
    await settle(a.page, 500);
    found[q] = await a.page.$$eval('#view [data-go]', (b) => b.map((x) => x.dataset.go));
  }
  const bad = Object.entries(found).map(([q, l]) => [q, l.filter((g) => RETIRED.concat(TILE_ONLY).indexOf(g) >= 0)]).filter(([, l]) => l.length);
  check('1.5 search finds none of them (free doctor, garden, ASHA, summary, reminders, PMS, endometriosis, 21 small steps, my plate)', !bad.length, bad);
  void tiles;
  const leaks = [];
  for (const who of ['priya', 'asha', 'meera', 'sunita', 'kamla']) for (const care of ['', 'govt']) {
    await sample(a.page, who, care);
    for (const r of ['home', 'care', 'library', 'learn', 'help', 'me', 'plan', 'diary', 'explain', 'ask', 'me-reminders']) {
      await go(a.page, r);
      const l = await a.page.evaluate(() => { const S = window.Saathi; const out = []; document.querySelectorAll('#view [data-go], #sheet-root [data-go]').forEach((b) => { const g = b.dataset.go; if (S.retired(g)) out.push(g); if (g.indexOf('a-') === 0 && !S.article(g.slice(2))) out.push(g); }); document.querySelectorAll('#view .list').forEach((x) => { if (x.offsetParent && !x.children.length) out.push('empty list'); }); return out; });
      if (l.length) leaks.push(who + (care ? '/govt' : '') + ' ' + r + ': ' + [...new Set(l)].join(', '));
    }
  }
  check('1.6 no link to a retired page or a removed article, and no empty list, on 11 screens for 5 women on both care routes', !leaks.length, leaks);
  await done(a);
}

// 2. The Learn library
{
  const a = await open();
  const n = await a.page.evaluate(() => (window.SAKHI_CONTENT.groups || []).reduce((s, g) => s + g.articles.length, 0));
  const still = await a.page.evaluate((G) => G.filter((k) => !!window.Saathi.article(k)), GONE_ARTS);
  check('2.1 the Learn library has 60 articles, none of the 12 the doctors removed', n === 60 && !still.length, { n, still });
  const lands = {};
  for (const k of GONE_ARTS.slice(0, 4)) { await go(a.page, 'a-' + k); lands[k] = await hash(a.page); }
  check('2.2 an old link to a removed article opens Learn', Object.values(lands).every((h) => h === '#learn'), lands);
  await done(a);
}

// 3. Today, Help and Me
{
  const a = await open();
  await sample(a.page, 'priya'); await go(a.page, 'home');
  const t3 = await a.page.evaluate(() => { const S = window.Saathi; const v = document.getElementById('view').innerText; return { meter: !!document.querySelector('#view .meter'), read: v.indexOf(S.t('td_read_s')) >= 0, noted: /Noted on \d+ of \d+ days/.test(v) }; });
  check('3.1 Today has no notes meter and no first-days read', !t3.meter && !t3.read && !t3.noted, t3);
  await go(a.page, 'diary');
  const d3 = await a.page.evaluate(() => ({ meter: !!document.querySelector('#view .meter'), noted: /Noted on \d+ of \d+ days/.test(document.getElementById('view').innerText) }));
  check('3.2 the Diary has no notes meter either', !d3.meter && !d3.noted, d3);
  // tips: a woman with no tours seen, the full tour done, auto tours on
  await a.page.evaluate(() => { const S = window.Saathi; S.state.tours = {}; S.state.settings.toursAuto = true; S.save(); });
  const seen = [];
  for (const r of ['home', 'diary', 'care', 'learn', 'me']) { await go(a.page, r); await settle(a.page, 1500); if (await a.page.evaluate(() => !!(document.getElementById('tour-root') || {}).innerHTML)) seen.push(r); }
  check('3.3 no tip starts on its own on Today, the Diary, Explore, Learn or Me', !seen.length, seen);
  await a.page.evaluate(() => { const S = window.Saathi; S.state.settings.toursAuto = false; S.save(); });
  const hb = {};
  for (const r of ['home', 'diary', 'care', 'learn', 'me', 'plan', 'help']) { await go(a.page, r); hb[r] = await a.page.evaluate(() => !!document.getElementById('help-btn')); }
  check('3.4 the Help button is on Today only', hb.home && Object.entries(hb).every(([r, x]) => (r === 'home') === x), hb);
  await go(a.page, 'home');
  await a.page.$eval('#help-btn', (b) => b.click()); await settle(a.page, 500);
  const sh = await a.page.evaluate(() => ({ priv: !!document.querySelector('#sheet-root .hs-priv'), asha: !!document.querySelector('#hs-asha'), tell: !!document.querySelector('#hs-tell'), guide: !!document.querySelector('#hs-guide'), doc: !!document.querySelector('#hs-doc') }));
  check('3.5 the Help sheet has no Private help, My ASHA or Tell a person, and keeps the doctor and the Help page', !sh.priv && !sh.asha && !sh.tell && sh.guide && sh.doc, sh);
  await a.page.evaluate(() => window.Saathi.closeSheet(true));
  await sample(a.page, 'asha', 'govt'); await go(a.page, 'home');
  await a.page.$eval('#help-btn', (b) => b.click()); await settle(a.page, 500);
  check('3.6 on the government route too: no My ASHA in Help', !(await a.page.$('#hs-asha')));
  await a.page.evaluate(() => window.Saathi.closeSheet(true));
  await go(a.page, 'me');
  const me = await a.page.evaluate(() => { const S = window.Saathi; return { garden: document.getElementById('view').innerText.indexOf(S.t('joy_h')) >= 0, link: !!document.querySelector('#view [data-go="joy"]') }; });
  check('3.7 Me has no My garden', !me.garden && !me.link, me);
  const pet = await a.page.evaluate(() => { const S = window.Saathi; S.emit('checkin', {}); S.emit('log', { type: 'start' }); return S.joy.petals(); });
  check('3.8 no petal grows', pet === 0, pet);
  await done(a);
  const j = await open({ seed: false, hash: '#home' });
  const joinHb = await j.page.evaluate(() => ({ stage: window.Saathi.state.stage, hb: !!document.getElementById('help-btn') }));
  check('3.9 no Help button while she joins (the first screen)', joinHb.stage !== 'app' && !joinHb.hb, joinHb);
  await done(j);
}

// 4. Her plan
{
  const a = await open({ seed: pmosS(9), hash: '#home' });
  await go(a.page, 'home');
  const h4 = await a.page.evaluate(() => ({ rev: !!document.querySelector('#view .pl-th-rev, #view .pl-sl-rev'), petal: !!document.querySelector('#view .pl-petal, #view .pl-dc-pet') }));
  check('4.1 week 2 of her plan: no look-back and no petal on Today', !h4.rev && !h4.petal, h4);
  await go(a.page, 'plan');
  const p4 = await a.page.evaluate(() => ({ rev: !!document.querySelector('#view .pl-review'), wp: !!document.querySelector('#view #pl-wp, #view #pl-rev-plan'), last: !!document.querySelector('#view .pl-past'), add: !!document.querySelector('#view .pl-addmin'), garden: !!document.querySelector('#view .pl-garden, #view .pl-garden-in') }));
  check('4.2 My plan keeps the week\'s look-back, with no Plan your week, Your last plan, + Add minutes or garden', p4.rev && !p4.wp && !p4.last && !p4.add && !p4.garden, p4);
  await go(a.page, 'plan-moves');
  check('4.3 Moves and calm: no +10 to +30 walking minutes', !(await a.page.$('#view [data-pl-add]')));
  const sum = await a.page.evaluate(() => { const I = window.Saathi.plan.intake; return ['pain', 'heavy', 'pms', 'pmos', 'weight'].map((g) => I.part({ goal: g, stage: 'cycle', iq: 99 })); });
  check('4.4 no "Here\'s what you told Sakhi" before any plan: her last question makes it', sum.every((x) => x === 1), sum);
  const ttc = await a.page.evaluate(() => { const p = (window.SAKHI_PROGS || []).find((x) => x.id === 'ttc' && x.ver === 2); const ids = []; const walk = (l) => (l || []).forEach((s) => { if (s.first) walk(s.first); else ids.push(s.id); }); walk(p && p.steps); return ids; });
  check('4.5 Getting ready for a baby: no ready check and no strength step, its other steps stay', ttc.indexOf('ready') < 0 && ttc.indexOf('str') < 0 && ['folic', 'food', 'calm', 'hb', 'prep', 'his'].every((x) => ttc.indexOf(x) >= 0), ttc);
  const ch = await a.page.evaluate(() => { const S = window.Saathi; const P = S.perplan.lesson, F = S.pfplan && S.pfplan.lesson; return { gone: ['h8', 'h12', 'm2', 'm8', 'p12'].filter((x) => P.has(x)), p8: P.has('p8'), n: P.ids().length, v2: F ? F.has('v2') : null, v1: F ? F.has('v1') : null }; });
  check('4.6 My period plan without the 5 chapters the doctors removed (31 left, "Telling your family" kept), and no ring pessary chapter', !ch.gone.length && ch.p8 && ch.n === 31 && ch.v2 === false && ch.v1 === true, ch);
  await done(a);
}

// 5. Languages and "My baby has died"
{
  const mr = await open({ seed: { lang: 'mr' } });
  const l5 = await mr.page.evaluate(() => ({ lang: window.Saathi.state.lang, langs: window.Saathi.langs.map((l) => l.code) }));
  check('5.1 Hindi and English only; a woman on Marathi moves to Hindi', l5.lang === 'hi' && l5.langs.join() === 'en,hi', l5);
  await done(mr);
  const ta = await open({ seed: { lang: 'ta' } });
  check('5.2 a woman on Tamil moves to English', (await ta.page.evaluate(() => window.Saathi.state.lang)) === 'en');
  await done(ta);
  const a = await open();
  await sample(a.page, 'sunita'); await go(a.page, 'post');
  check('5.3 the after-birth hub has no "My baby has died"', !(await a.page.$('#pst-lost')));
  await go(a.page, 'home');
  await a.page.evaluate(() => { const r = window.Saathi.reminders; r.upsert({ id: 'post-vax-6w', mod: 'post', title: { en: 'Vaccines', hi: 'टीके' }, kind: 'checkup', dates: ['2026-11-20'], time: '09:00', on: true }); });
  const before = await a.page.evaluate(() => ({ died: window.Saathi.post.died(), stage: window.Saathi.state.situation.deliveredOn }));
  await a.page.evaluate(() => { const b = [...document.querySelectorAll('#view button, #view a')].find((x) => /change stage/i.test(x.innerText)); if (b) b.click(); });
  await settle(a.page, 500);
  const sheet = await a.page.evaluate(() => ({ up: !!document.querySelector('#sheet-root .sheet'), lost: !!document.querySelector('#st-lost') }));
  check('5.4 the stage sheet has no "My baby has died"', sheet.up && !sheet.lost, sheet);
  await a.page.evaluate(() => { const b = document.querySelector('#sheet-root [data-stage="cycle"]'); if (b) b.click(); });
  await settle(a.page, 300);
  await a.page.evaluate(() => { const s = document.getElementById('st-save'); if (s) s.click(); });
  await settle(a.page, 800);
  const after = await a.page.evaluate(() => { const S = window.Saathi; return { off: S.state.situation.babyOff || null, died: S.post.died(), vax: !!S.reminders.get('post-vax-6w') }; });
  check('5.5 leaving "I had a baby" stops everything about the baby (no special words): her baby lines and vaccine reminders stop', !before.died && after.off === TODAY && after.died && !after.vax, { before, after });
  await done(a);
}

// 6. What the removals left behind (MODULE_API 111, item 10)
{
  const JR = { id: 'journey', mod: 'journey', title: { en: 'Your small step for today', hi: 'आज का आपका छोटा क़दम' }, kind: 'custom', start: ago(2), every: 1, time: '09:00', on: true };
  const PM = { id: 'access-pmmvy2', mod: 'access', title: { en: 'PMMVY: the second part', hi: 'PMMVY: दूसरा हिस्सा' }, kind: 'custom', dates: [iso(TODAY, 48)], time: '10:00', on: true };
  const a = await open({ seed: { situation: { care: 'govt', deliveredOn: ago(50), breastfeeding: true }, events: [], goals: ['recovery'], prompts: { planCall: ago(3), firstLog: ago(30) },
    mods: { journey: { active: 'iron', start: ago(2), done: {}, finished: {} }, access: { claims: { pmmvy: { started: ago(60), applied: ago(55), got: ago(5), docs: {} } } } }, reminders: [JR, PM] } });
  const r6 = await a.page.evaluate(() => (window.Saathi.state.reminders || []).map((r) => r.id));
  check('6.1 the old journey and PMMVY reminders ring no more, and no journey row on Today', r6.indexOf('journey') < 0 && r6.indexOf('access-pmmvy2') < 0 && !(await a.page.$('#view .today-journey')), r6);
  await a.page.$eval('#help-btn', (b) => b.click()); await settle(a.page, 300);
  const hd = await a.page.$eval('#sheet-root #hs-doc', (e) => e.textContent).catch(() => '');
  check('6.2 Help\'s doctor row on the government route: "A call with a Qura doctor", and no free government doctor', /A call with a Qura doctor/.test(hd) && !/government/i.test(hd), hd);
  await a.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(a.page, 200);
  await go(a.page, 'me'); const su = await a.page.$eval('#view .setup-card', (e) => e.textContent).catch(() => '');
  check('6.3 the setup card has no step for a removed page (free care, the schemes, her ASHA)', !/free care|scheme|ASHA/i.test(su), su);
  await go(a.page, 'report');
  check('6.4 the report has no "My claims" line, and her claim stays in her diary', !/My claims/.test(await a.page.$eval('#view', (e) => e.textContent)) && await a.page.evaluate(() => !!window.Saathi.state.mods.access.claims.pmmvy));
  await done(a);
  /* a midlife woman whose periods have stopped: her first log is today's signs, here */
  const m = await open({ seed: { dob: '1968-05-01', situation: { care: 'private', stopped: true }, goals: ['meno', 'hot'], events: [], focus: { tile: 'meno', goals: ['hot'], at: ago(1) }, prompts: { planCall: ago(3) } }, hash: '#diary' });
  check('6.5 periods stopped: her first log is today\'s signs in the Diary, not the weekly diary', !!(await m.page.$('#fl-card #fl-save')) && !(await m.page.$('#fl-card [data-fl-go]')) && !(await m.page.$('#view [data-go="meno-diary"]')));
  await done(m);
  /* the fixed Hb line beside her Hb results */
  const h = await open({ seed: { mods: { cond: { labs: [{ id: 'l1', k: 'hb', v: 9.8, u: 'g/dL', d: ago(2), lo: 12, hi: 15 }] } } }, hash: '#cond-labs' });
  check('6.6 her lab results keep the fixed Hb line beside her Hb results', /below 8, see a doctor this week/.test(await h.page.$eval('#view', (e) => e.textContent)));
  await done(h);
}

await browser.close();
check('5.6 no page errors', errsAll.length === 0, errsAll.slice(0, 5));
const failed = results.filter((r) => !r.pass);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' passed');
process.exit(failed.length ? 1 : 0);
