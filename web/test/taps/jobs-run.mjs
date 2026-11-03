// Jobs 1 to 11 on day 10, each from a cold open of Sakhi at its time, counted tap by tap on the real app.
// Usage: node jobs-run.mjs <cycle|nopl|ttc|cycle-allow> [job numbers...]
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, OUT, at } from './lib.mjs';

const who = process.argv[2] || 'cycle'; const only = process.argv.slice(3).map(Number);
const state = JSON.parse(fs.readFileSync(path.join(OUT, 'state-' + who + '-day10.json'), 'utf8'));
const DAY = 9;   /* day 10 */
const browser = await launch();
const results = [];
/* the button whose words match, inside a part of the screen: marked so tap() can find it */
async function mark(R, scope, re, extra) {
  const ok = await R.page.evaluate((q) => {
    document.querySelectorAll('[data-tc-pick]').forEach((e) => e.removeAttribute('data-tc-pick'));
    const re = new RegExp(q.re, 'i'); const els = [...document.querySelectorAll(q.scope + ' button, ' + q.scope + ' a, ' + q.scope + ' summary, ' + q.scope + ' label' + (q.extra ? ', ' + q.extra : ''))];
    const e = els.find((x) => re.test((x.innerText || x.getAttribute('aria-label') || '').trim())); if (!e) return false; e.setAttribute('data-tc-pick', '1'); return true;
  }, { scope, re: re.source, extra: extra || '' });
  return ok ? '[data-tc-pick="1"]' : null;
}
async function job(n, name, o, fn) {
  if (only.length && only.indexOf(n) < 0) return;
  const R = await open(browser, { state, time: at(DAY, o.hm || '09:30'), hash: o.hash || 'home', config: o.config, w: +process.env.W || 390, h: +process.env.H || 844, lang: process.env.LANG2 });
  if (o.api) await R.ctx.route(/api\.test\.invalid/, (r) => { const u = r.request().url(); const m = r.request().method(); const body = /requests/.test(u) ? (m === 'GET' ? { available: true, requests: [] } : { ref: 'SK-4821', status: 'queued' }) : {}; r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }); });
  await R.settle(2600);
  const J = R.begin(n + ' ' + name);
  const pre = await R.clearBlockers('on open');   /* tips that stand in her way first (counted apart) */
  const preTaps = J.taps; J.taps = 0; J.path = []; J.blockers = pre;
  await R.startScreen();
  let err = null; try { await fn(R); } catch (e) { err = String(e.message).slice(0, 200); }
  await R.shot('job-' + who + '-' + n, false);
  const j = R.end(); j.preTaps = preTaps; j.err = err; j.where = R.label(await R.where()); j.errs = R.errs;
  results.push(j);
  console.log('\n## ' + j.name + ' [' + who + ']  taps ' + j.taps + ' · scrolls ' + j.scrolls + ' · screens ' + j.screens.length + ' · sheets ' + j.sheets.length + (j.typed ? ' · typed ' + j.typed : '') + (preTaps ? ' · +' + preTaps + ' to close tips first (' + pre.join('; ') + ')' : '') + (err ? ' · ERROR ' + err : ''));
  j.path.forEach((p, i) => console.log('   ' + (i + 1) + '. ' + p));
  j.notes.forEach((x) => console.log('   note: ' + x));
  console.log('   screens: ' + j.screens.join(' → ') + (j.sheets.length ? ' | sheets: ' + j.sheets.join(', ') : ''));
  await R.ctx.close();
}
const plan = who !== 'nopl';

/* 1 her period started today: the round button on Today */
await job(1, 'log that her period started today (Today button)', {}, async (R) => {
  const top = await R.reach('#view [data-log="start"]'); R.note('Period started button: ' + JSON.stringify(top));
  await R.tap('#view [data-log="start"]', 'Period started');
  await R.settle(1500); const w = await R.where(); if (w.sheet) R.note('then a sheet: ' + w.sheet);
  R.note('Today after: ' + (await R.text('#view .card.hero')).slice(0, 200));
  R.note('toast: ' + await R.text('#toast-root'));
});
await job(1.1, 'log that her period started today (the + on Diary)', {}, async (R) => {
  await R.tap('#tabbar [data-go="diary"]', 'Diary tab'); await R.clearBlockers();
  await R.tap('#fab', '+'); const s = await mark(R, '#fab-root', /Period started/); await R.tap(s, 'Period started (+ menu)');
});
/* 2 how she feels: the chips on Today; a symptom not in the five: + More */
await job(2, 'log how she feels (Today chips: Tired)', {}, async (R) => {
  R.note('chip position: ' + JSON.stringify(await R.reach('#view [data-feel="d_tired"]')));
  await R.tap('#view [data-feel="d_tired"]', 'Tired chip');
});
await job(2.1, 'log a symptom not in the five (headache)', {}, async (R) => {
  await R.tap('#view #feel-more', '+ More'); await R.settle(600); await R.clearBlockers();
  const w = await R.where(); R.note('opens: ' + (w.sheet || w.hash));
  const h = await mark(R, '#sheet-root', /^Headache/); if (!h) { R.note('no Headache chip visible; sheet text: ' + (await R.text('#sheet-root')).slice(0, 300)); const more = await mark(R, '#sheet-root', /More signs|More/); if (more) await R.tap(more, 'More signs'); }
  const h2 = await mark(R, '#sheet-root', /^Headache/); if (h2) await R.tap(h2, 'Headache');
  const sv = await mark(R, '#sheet-root', /^Save|^Done/); if (sv) await R.tap(sv, 'Save'); else R.note('no Save: saved on tap?');
});
await job(2.2, 'log how she feels (round "How I feel" button)', {}, async (R) => {
  await R.tap('#view [data-symlog]', 'How I feel'); await R.settle(600); await R.clearBlockers();
  const c = await mark(R, '#sheet-root', /^Tired/); if (c) await R.tap(c, 'Tired'); const sv = await mark(R, '#sheet-root', /^Save|^Done/); if (sv) await R.tap(sv, 'Save'); else R.note('no Save');
});
/* 3 tick today's plan step */
if (plan) await job(3, 'tick today’s plan step', { hm: '19:30' }, async (R) => {
  R.note('first tick: ' + JSON.stringify(await R.reach('#view .today-card [data-today-act]')));
  R.note('Today card: ' + (await R.text('#view .today-card')).slice(0, 260));
  await R.tap('#view .today-card [data-today-act]', 'tick');
});
/* 4 the evening check-in, from Today; and from the 8 pm notification */
if (plan) await job(4, 'evening check-in from Today (nothing ticked yet)', { hm: '20:30' }, async (R) => {
  R.note('check-in button: ' + JSON.stringify(await R.reach('#view [data-go="plan-checkin"]')));
  await R.tap('#view [data-go="plan-checkin"]', 'How did today go? (Today)'); await R.settle(600); await R.clearBlockers();
  R.note('check-in page: ' + (await R.text('#view')).slice(0, 500));
  const groups = await R.page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))]);
  for (const g of groups) { if (await R.has('[data-ci^="' + g + ':"].on')) continue; if (await R.has('.pl-ci-opt [data-ci^="' + g + ':"]')) continue; await R.tap('[data-ci^="' + g + ':"]', 'answer ' + g); }
  await R.tap('#pl-ci-save', 'Save'); await R.settle(1200); await R.clearBlockers();
  R.note('after save: ' + (await R.text('#view')).slice(0, 400));
});
if (plan) await job(4.1, 'evening check-in after ticking on Today', { hm: '20:30' }, async (R) => {
  await R.tap('#view .today-card [data-today-act]', 'tick'); await R.clearBlockers();
  const ci = await R.has('#view [data-go="plan-checkin"]'); R.note('check-in button still there after the tick: ' + ci);
  if (ci) { await R.tap('#view [data-go="plan-checkin"]', 'How did today go?'); await R.settle(600); await R.clearBlockers(); await R.tap('#pl-ci-save', 'Save'); }
});
if (plan) await job(4.2, 'evening check-in from the 8 pm notification', { hm: '20:01', hash: 'plan-checkin' }, async (R) => {
  R.note('(1 tap on the notification, outside the app, not counted)');
  const groups = await R.page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))]);
  for (const g of groups) { if (await R.has('[data-ci^="' + g + ':"].on')) continue; if (await R.has('.pl-ci-opt [data-ci^="' + g + ':"]')) continue; await R.tap('[data-ci^="' + g + ':"]', 'answer ' + g); }
  await R.tap('#pl-ci-save', 'Save');
});
/* 5 when her next period is likely: on Today's first screen? */
await job(5, 'see when her next period is likely', {}, async (R) => {
  const f = await R.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const el = document.querySelector('#view .cd-lead, #view .cd-from, #view .hero .lead'); const r = el ? el.getBoundingClientRect() : null; return { text: el ? el.closest('.card').innerText.replace(/\s+/g, ' ').slice(0, 220) : null, top: r ? Math.round(r.top) : null, nav: Math.round(nav) }; });
  R.note('Today headline: ' + JSON.stringify(f));
});
/* 6 fertile days (the woman trying, 7 dates) */
await job(6, 'see her fertile days', {}, async (R) => {
  R.note('Today hero: ' + (await R.text('#view .card.hero')).slice(0, 300));
  await R.tap('#tabbar [data-go="diary"]', 'Diary tab'); await R.settle(800); await R.clearBlockers();
  const cal = await R.page.evaluate(() => { const f = [...document.querySelectorAll('#view .cal [data-day]')].filter((b) => /\b(fw|ov)\b/.test(b.className)).map((b) => b.dataset.day + ':' + b.className); return f; });
  R.note('calendar days marked fertile: ' + JSON.stringify(cal));
  R.note('Diary first card: ' + (await R.text('#view .diary-paper, #view .card')).slice(0, 300));
});
/* 7 danger signs, and calling 112 */
await job(7, 'find danger signs (Help)', {}, async (R) => {
  await R.tap('#help-btn', 'Help (top bar)'); await R.tap('#hs-guide', 'When to see a doctor');
  const f = await R.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const h = [...document.querySelectorAll('#view h2, #view h3, #view strong')].find((e) => /Call 112 now if/.test(e.innerText)); return h ? { top: Math.round(h.getBoundingClientRect().top), nav: Math.round(nav) } : null; });
  R.note('"Call 112 now if" heading: ' + JSON.stringify(f));
});
await job(7.1, 'call 112 (Help)', {}, async (R) => {
  await R.tap('#help-btn', 'Help (top bar)'); await R.tap('#hs-sos', 'Emergency: call 112');
  const c = await R.page.evaluate(() => { const a = document.querySelector('#sheet-root a[href="tel:112"]'); return !!a; }); R.note('a Call 112 link in the sheet: ' + c);
  const s = await mark(R, '#sheet-root', /Call/); if (s) await R.tap('#sheet-root a[href="tel:112"]', 'Call (112)');
});
/* 8 ask a Qura doctor: the live build's call-back request (server stubbed), and the build without it */
await job(8, 'ask a Qura doctor (Help, "Ask Qura to call me")', { config: { api: 'https://api.test.invalid/sakhi' }, api: true }, async (R) => {
  await R.tap('#help-btn', 'Help (top bar)'); await R.tap('#hs-doc', 'See a doctor'); await R.settle(1500);
  R.note('ask page: ' + (await R.text('#view')).slice(0, 300));
  if (!(await R.tapIf('#view [data-go="ask-call"]', 'Ask Qura to call me'))) { R.note('no call card'); return; }
  await R.type('#ac-topic', 'Period pain', 'what about (types)');
  await R.tap('#ac-send', 'Send'); await R.settle(1500);
  R.note('after: ' + (await R.text('#view')).slice(0, 200));
});
await job(8.1, 'ask a Qura doctor (Help, build without the call-back)', {}, async (R) => {
  await R.tap('#help-btn', 'Help (top bar)'); await R.tap('#hs-doc', 'See a doctor'); await R.settle(800);
  await R.tap('#ask-web', 'Book at quranutrition.com (leaves Sakhi)');
});
/* 9 Wind down at bedtime */
await job(9, 'start Wind down at bedtime', { hm: '22:15' }, async (R) => {
  const onToday = await R.page.evaluate(() => [...document.querySelectorAll('#view [data-go^="calm"], #view [data-go="plan-wind"], #view [data-today-nav]')].map((e) => (e.dataset.go || 'nav') + ':' + (e.innerText || '').trim().slice(0, 40)));
  R.note('bedtime entries on Today: ' + JSON.stringify(onToday));
  await R.tap('#tabbar [data-go="care"]', 'Explore tab'); await R.settle(800); await R.clearBlockers();
  const fy = await R.page.evaluate(() => [...document.querySelectorAll('#view [data-go="calm"]')].map((e) => Math.round(e.getBoundingClientRect().top)));
  R.note('Wind down in Explore at y=' + JSON.stringify(fy));
  if (fy.length) { await R.tap('#view [data-go="calm"]', 'Wind down'); }
  else {
    R.note('not in For you: she searches');
    const box = await R.has('#view input[type="search"], #view #care-q, #view input'); R.note('search box: ' + box);
    await R.type('#view input', 'sleep', 'search "sleep"'); await R.settle(800);
    const s = await mark(R, '#view', /Wind down/); if (s) await R.tap(s, 'Wind down (search result)'); else { R.note('no Wind down result; text: ' + (await R.text('#view')).slice(0, 300)); return; }
  }
  await R.settle(800); const nid = await mark(R, '#view', /^Yoga nidra/); if (nid) await R.tap(nid, 'Yoga nidra'); await R.settle(1200);
  R.note('session screen: ' + (await R.text('#view')).slice(0, 200));
  const play = await mark(R, '#view', /^Play|^Start|▶/); R.note('a Play button after opening it: ' + !!play);
});
await job(9.1, 'start Wind down at bedtime (My plan, Moves and calm)', { hm: '22:15' }, async (R) => {
  await R.tap('#tabbar [data-go="plan"]', 'My plan tab'); await R.settle(800); await R.clearBlockers();
  if (!(await R.tapIf('#view [data-go="plan-moves"]', 'Moves and calm'))) { R.note('no Moves and calm'); return; }
  await R.settle(800); const ct = await mark(R, '#view', /^Calm/); if (ct) await R.tap(ct, 'Calm tab'); await R.settle(800);
  R.note('page: ' + (await R.text('#view')).slice(0, 250));
  const nid = await mark(R, '#view', /^Yoga nidra/); if (nid) await R.tap(nid, 'Yoga nidra');
});
/* 10 a wrong period date: her 28 Oct start was really 27 Oct */
await job(10, 'fix a wrong period date (Edit period dates)', {}, async (R) => {
  await R.tap('#tabbar [data-go="diary"]', 'Diary tab'); await R.settle(800); await R.clearBlockers();
  await R.tap('#cal-edit', 'Edit period dates'); await R.settle(500);
  const has27 = await R.has('[data-ed="2026-10-27"]'); if (!has27) await R.tap('#cal-prev', 'previous month');
  await R.tap('[data-ed="2026-10-27"]', '27 Oct on'); await R.tap('#ce-save', 'Save');
  const ev = await R.page.evaluate(() => window.Saathi.state.events.filter((e) => e.d >= '2026-10-20').map((e) => e.d + ' ' + e.t)); R.note('events now: ' + ev.join(', '));
});
await job(10.1, 'fix a wrong period date (tap the day on the calendar)', {}, async (R) => {
  await R.tap('#tabbar [data-go="diary"]', 'Diary tab'); await R.settle(800); await R.clearBlockers();
  if (!(await R.has('[data-day="2026-10-28"]'))) await R.tap('#cal-prev', 'previous month');
  await R.tap('[data-day="2026-10-28"]', 'taps 28 Oct'); await R.settle(600); await R.clearBlockers();
  R.note('day sheet: ' + (await R.text('#sheet-root')).slice(0, 400));
  const ed = await mark(R, '#sheet-root', /Edit|Change|dates/); if (ed) { await R.tap(ed, 'edit the dates'); await R.settle(500); }
  if (await R.has('#ed-s')) { await R.setDate('#ed-s', '2026-10-27', 'start date'); await R.tap('#ed-save', 'Save'); }
});
/* 11 her report for the doctor */
await job(11, 'open her report for the doctor (Diary, Cycles)', {}, async (R) => {
  await R.tap('#tabbar [data-go="diary"]', 'Diary tab'); await R.settle(800); await R.clearBlockers();
  await R.tap('#view [data-tab="tr"]', 'Cycles tab'); await R.settle(800); await R.clearBlockers();
  const rp = await R.page.evaluate(() => { const b = document.querySelector('#view [data-go="report"]'); return b ? { y: Math.round(b.getBoundingClientRect().top), t: b.innerText.trim().slice(0, 60) } : null; }); R.note('report button: ' + JSON.stringify(rp));
  await R.tap('#view [data-go="report"]', 'report'); await R.settle(1200);
  R.note('report page: ' + (await R.text('#view')).slice(0, 200));
});
await job(11.1, 'open her report for the doctor (Help)', {}, async (R) => {
  await R.tap('#help-btn', 'Help (top bar)'); await R.tap('#hs-guide', 'When to see a doctor'); await R.tap('#view [data-go="report"]', 'Going to a doctor? Show this report');
});
fs.writeFileSync(path.join(OUT, 'jobs-' + who + (process.env.W ? '-' + process.env.W : '') + '.json'), JSON.stringify(results, null, 1));
await browser.close();
