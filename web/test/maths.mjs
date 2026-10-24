// Accuracy tests for every number Sakhi shows, with the clock fixed at 18 Oct 2026, 9 am IST.
// Each expected value is worked out by hand in the comment next to it.
// Usage: node test/maths.mjs
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const ctx = await browser.newContext({ timezoneId: 'Asia/Kolkata', viewport: { width: 390, height: 844 } });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(path.join(root, 'content.json'), 'utf8') + ';');
const page = await ctx.newPage();
await page.clock.setFixedTime(new Date('2026-10-18T09:00:00+05:30'));
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '#home'); await page.waitForFunction(() => !!window.Saathi);

const results = [];
const check = (name, got, want) => { const pass = JSON.stringify(got) === JSON.stringify(want); results.push({ name, pass, got, want }); };
/* A diary: starts = [[start, end], ...] (end may be null), plus extra events and situation. */
const diary = (cfg) => page.evaluate((cfg) => {
  const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); const st = S.state; st.stage = 'app'; st.consent.c1 = '2026-01-01'; st.dob = cfg.dob || '1994-01-01';
  (cfg.periods || []).forEach((p) => { st.events.push({ d: p[0], t: 'start' }); if (p[1]) st.events.push({ d: p[1], t: 'end' }); });
  (cfg.events || []).forEach((e) => st.events.push(e));
  st.situation = cfg.situation || {}; st.checkins = cfg.checkins || {}; S.save();
}, cfg);
const C = (expr) => page.evaluate((expr) => { const S = window.Saathi; const c = S.cycle; const iso = (d) => (d ? S.toISO(d) : null); return eval(expr); }, expr);   // S is the app for the expressions below

/* 1. Regular 28-day cycles: starts 1 Jul, 29 Jul, 26 Aug, 23 Sep; each lasts 5 days. */
await diary({ periods: [['2026-07-01', '2026-07-05'], ['2026-07-29', '2026-08-02'], ['2026-08-26', '2026-08-30'], ['2026-09-23', '2026-09-27']] });
check('regular: gaps', await C('c.usable()'), [28, 28, 28]);
check('regular: cycle day (23 Sep is day 1, so 18 Oct is day 26)', await C('c.cycleDay()'), 26);
// min = max = 28 -> 26..30, widened to 5+ days around 28 -> days 25..31 after the start -> 18 Oct .. 24 Oct
check('regular: likely window', await C('(() => { const r = c.rangeInfo(); return r && [iso(r.from), iso(r.to)]; })()'), ['2026-10-18', '2026-10-24']);
check('regular: bleeding days of the last period', await C('Object.keys(c.bleedingDays()).filter((k) => k >= "2026-09-20").sort()'), ['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27']);

/* 2. Irregular (Priya): gaps 31, 46, 62, 35, 43 vary by 31 days: no date is guessed. */
await diary({ dob: '1999-04-12', periods: [['2026-02-28'], ['2026-03-31'], ['2026-05-16'], ['2026-07-17'], ['2026-08-21'], ['2026-10-03']], situation: { pcos: true } });
check('irregular: gaps', await C('c.usable()'), [31, 46, 62, 35, 43]);
check('irregular: no likely window', await C('c.rangeInfo()'), null);
check('irregular: cycle day (3 Oct is day 1)', await C('c.cycleDay()'), 16);
check('irregular: age on 18 Oct 2026 (born 12 Apr 1999)', await C('c.ageYears()'), 27);
check('no end logged: 5 bleeding days are assumed', await C('Object.keys(c.bleedingDays()).filter((k) => k >= "2026-10-01").sort()'), ['2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07']);

/* 3. A second "period started" 7 days after the first is the same bleed, not a new cycle.
      Starts 1 Aug, 29 Aug, (5 Sep by mistake), 26 Sep -> real gaps 28, 28; day 1 is still 26 Sep. */
await diary({ periods: [['2026-08-01', '2026-08-05'], ['2026-08-29', '2026-09-02'], ['2026-09-05'], ['2026-09-26', '2026-09-30']] });
check('re-logged start: gaps stay 28, 28', await C('c.usable()'), [28, 28]);
check('re-logged start: cycle day from 26 Sep = 23', await C('c.cycleDay()'), 23);

/* 4. Gaps touched by hormonal contraception are left out: pill from 1 May, so the 28 Apr -> 20 Jun gap (53 days) and later ones do not count. */
await diary({ periods: [['2026-03-01'], ['2026-03-30'], ['2026-04-28'], ['2026-06-20'], ['2026-08-20']], situation: { hormones: true, hormonesSince: '2026-05-01' } });
check('hormones: gaps touched by the pill are not used', await C('c.usable()'), [29, 29]);

/* 5. Pregnancy from the last period: LMP 2 May 2026 -> 169 days = 24 weeks 1 day; due 2 May + 280 days = 6 Feb 2027. */
await diary({ situation: { pregnant: true, pregnantSince: '2026-05-02' } });
check('pregnancy (LMP): weeks', await C('S.preg ? S.preg.info().weeks : null'), 24);
check('pregnancy (LMP): extra days', await C('S.preg ? S.preg.info().days % 7 : null'), 1);
check('pregnancy (LMP): due date', await C('S.preg ? S.preg.info().edd : null'), '2027-02-06');
await page.evaluate(() => { location.hash = '#home'; window.Saathi.render(); });
check('pregnancy (LMP): Home shows 24 weeks', await page.evaluate(() => document.getElementById('bignum').textContent.trim()), '24');

/* 6. Pregnancy from the scan report's due date: EDD 3 Feb 2027 -> counted LMP 29 Apr 2026 -> 172 days = 24 weeks 4 days. */
await diary({ situation: { pregnant: true, pregnantSince: '2026-05-10', scanEdd: '2027-02-03' } });
check('pregnancy (scan EDD beats LMP): weeks', await C('S.preg ? S.preg.info().weeks : null'), 24);
check('pregnancy (scan EDD): due date', await C('S.preg ? S.preg.info().edd : null'), '2027-02-03');
check('pregnancy (scan EDD): counted from', await C('S.preg ? S.preg.info().from : null'), 'scan');

/* 7. The old "scan date" field must never be read as the first day of the pregnancy.
      A scan done on 1 Jul 2026 with LMP 2 May 2026: she is 24 weeks, not 15. */
await diary({ situation: { pregnant: true, pregnantSince: '2026-05-02', scanDate: '2026-07-01' } });
await page.evaluate(() => { location.hash = '#home'; window.Saathi.render(); });
check('scan date alone does not move the weeks (Home)', await page.evaluate(() => document.getElementById('bignum').textContent.trim()), '24');

/* 8. After a birth on 27 Sep 2026: 18 Oct is day 21. */
await diary({ situation: { breastfeeding: true, deliveredOn: '2026-09-27' } });
await page.evaluate(() => { location.hash = '#home'; window.Saathi.render(); });
check('after birth: day 21', await page.evaluate(() => (document.querySelector('.ringc b') || {}).textContent), '21');

/* 9. Fertile days (only for steady cycles): gaps 28, 29, 28; last start 21 Sep.
      Egg release 14 days before the next period: 21 Sep + 28 - 14 = 5 Oct, to 21 Sep + 29 - 14 = 6 Oct.
      Fertile days: 5 days before the earliest egg day to the latest: 30 Sep .. 6 Oct. */
await diary({ periods: [['2026-06-28'], ['2026-07-26'], ['2026-08-24'], ['2026-09-21']] });
check('fertile: gaps', await C('c.usable()'), [28, 29, 28]);
check('fertile: window and egg days', await C('(() => { const f = c.fertileInfo ? c.fertileInfo() : null; return f && [iso(f.from), iso(f.to), iso(f.eggFrom), iso(f.eggTo)]; })()'), ['2026-09-30', '2026-10-06', '2026-10-05', '2026-10-06']);

/* 10. Midlife stage (STRAW+10): age 48, two changes of 7+ days between next gaps = early transition (1);
       any gap of 60+ days = late transition (2). */
await diary({ dob: '1978-03-08', periods: [['2026-01-01'], ['2026-01-29'], ['2026-03-10'], ['2026-04-07'], ['2026-05-20']] });
check('midlife: gaps', await C('c.usable()'), [28, 40, 28, 43]);
check('midlife: early transition', await C('c.midlifeStage ? c.midlifeStage() : null'), 1);
await diary({ dob: '1978-03-08', periods: [['2026-01-01'], ['2026-01-29'], ['2026-04-05'], ['2026-05-03']] });
check('midlife: late transition after a 66-day gap', await C('c.midlifeStage ? c.midlifeStage() : null'), 2);

/* 11. A 12-day period shows as 12 bleeding days (an end up to 20 days after the start counts). */
await diary({ periods: [['2026-08-04', '2026-08-08'], ['2026-09-01', '2026-09-12']] });
check('long period: 12 bleeding days', await C('Object.keys(c.bleedingDays()).filter((k) => k >= "2026-09-01").length'), 12);

/* ---------- explanations: the right situation at the right urgency ---------- */
const F = () => page.evaluate(() => window.Saathi.explain.findings().map((f) => f.id + ':' + f.lv + (f.vars && f.vars.n != null ? ':' + f.vars.n : '')));
check('explain: 12-day period -> see a doctor this week', (await F()).filter((x) => x.startsWith('period_long')), ['period_long:week:12']);
await diary({ periods: [['2026-07-01', '2026-07-05'], ['2026-07-29', '2026-08-02'], ['2026-08-26', '2026-08-30'], ['2026-09-23', '2026-09-27']] });
check('explain: regular 28-day cycles -> only "within the usual range"', await F(), ['gap_usual:ok:28']);
await diary({ periods: [['2026-07-14', '2026-07-18'], ['2026-08-11', '2026-08-15'], ['2026-09-08', '2026-09-12'], ['2026-09-27', '2026-09-30']] });
check('explain: one 19-day gap -> keep an eye on it', await F(), ['gap_short:watch:19']);
await diary({ periods: [['2026-07-01', '2026-07-05']] });
check('explain: 110 days without a period -> see a doctor this month', (await F()).filter((x) => x.startsWith('late_now')), ['late_now:month:110']);
await diary({ periods: [['2026-08-01', '2026-08-05'], ['2026-08-29', '2026-09-02'], ['2026-09-05'], ['2026-09-26', '2026-09-30']] });
check('explain: a start 7 days after another is flagged as the same period', (await F()).filter((x) => x.startsWith('dup_start')), ['dup_start:watch:7']);
await diary({ dob: '1970-01-01', situation: { stopped: true }, events: [{ d: '2026-10-10', t: 'spot' }] });
check('explain: bleeding after periods stopped -> within 2 weeks', (await F()).filter((x) => x.startsWith('bleed_after_stop')), ['bleed_after_stop:week']);
await diary({ situation: { breastfeeding: true, deliveredOn: '2026-09-27' }, checkins: { '2026-10': { chips: ['lochia'], at: '2026-10-17', kind: 'post' } } });
check('explain: heavy bleeding after birth -> call 112 now', await F(), ['pp_lochia:now']);
await diary({ situation: { pregnant: true, pregnantSince: '2026-05-02' }, events: [] });
await page.evaluate(() => { const S = window.Saathi; S.state.daily['2026-10-17'] = ['d_pbleed']; S.state.daily['2026-10-18'] = ['d_swell', 'd_headache']; S.save(); });
check('explain: logged bleeding, or headache with swelling, in pregnancy -> see a doctor today', (await F()).sort(), ['p_bleed:today', 'p_headswell:today']);
await diary({ periods: [['2026-09-23', '2026-09-27']] });
await page.evaluate(() => { const S = window.Saathi; S.state.daily['2026-10-16'] = ['d_itch']; S.save(); });
check('explain: itching logged on a day -> see a doctor this week', (await F()).filter((x) => x.startsWith('disch')), ['disch:week']);
await page.evaluate(() => { const S = window.Saathi; S.loadSample('priya'); });
check('explain: Priya (sample)', await F(), ['flow_heavy:week', 'gap_long:month:43', 'androgen:month', 'spot_between:watch']);
await page.evaluate(() => { const S = window.Saathi; S.loadSample('kamla'); });
check('explain: Kamla (sample, 48)', (await F()).sort(), ['gap_long:month:74', 'm_hot:month', 'mood:month']);
await page.evaluate(() => { const S = window.Saathi; S.loadSample('asha'); });
check('explain: Asha (sample, regular)', await F(), ['gap_usual:ok:30']);

/* 7. A guessed start from onboarding ("about 2 weeks ago" on 18 Oct = 4 Oct). It sets the cycle day, no gap touching it is counted,
      and a real date less than 21 days from it replaces it. */
await diary({ periods: [['2026-08-10', '2026-08-14'], ['2026-09-07', '2026-09-11']], events: [{ d: '2026-10-04', t: 'start', approx: true }] });
check('guessed start: cycle day from 4 Oct = 15', await C('c.cycleDay()'), 15);
// 10 Aug -> 7 Sep = 28 days (counted); 7 Sep -> 4 Oct = 27 days touches the guess (not counted)
check('guessed start: only the real gap counts', await C('c.usable()'), [28]);
await page.evaluate(() => { const S = window.Saathi; S.state.events.push({ d: '2026-10-06', t: 'start' }); S.save(); });
// the real start on 6 Oct replaces the guess: 7 Sep -> 6 Oct = 29 days, counted
check('guessed start: a real date nearby replaces it', await C('c.usable()'), [28, 29]);
check('guessed start: cycle day from 6 Oct = 13', await C('c.cycleDay()'), 13);
/* 7b. The 20 Oct audit case: she guessed "about 2 weeks ago" on 8 Oct (24 Sep), then logged her real start, 12 Sep. The real date
      replaces the guess: no 12-day gap, and the day count runs from 12 Sep. A real start 21 days or more away is another cycle. */
await diary({ events: [{ d: '2026-09-24', t: 'start', approx: true }, { d: '2026-09-12', t: 'start' }] });
check('guess 12 days after a real start: replaced, one start', await C('c.starts()'), ['2026-09-12']);
check('guess 12 days after a real start: cycle day from 12 Sep = 37', await C('c.cycleDay()'), 37);
await diary({ events: [{ d: '2026-09-24', t: 'start', approx: true }, { d: '2026-10-15', t: 'start' }] });
check('real start 21 days after a guess: both kept, the gap not counted', [await C('c.starts()'), await C('c.usable()')], [['2026-09-24', '2026-10-15'], []]);
/* 8. Midlife view: her own choice wins over her age. */
await diary({ dob: '1984-03-01', situation: { midlife: true } });
check('midlife: chosen at 42', await C('c.isMidlife()'), true);
await diary({ dob: '1978-03-01', situation: { midlife: false } });
check('midlife: not at 48 when she chose "my periods"', await C('c.isMidlife()'), false);
await diary({ dob: '1978-03-01', situation: {} });
check('midlife: 45 and over by default', await C('c.isMidlife()'), true);

/* 9. Month ends (S.addMonths, used by contraception, check-ups and the after-birth dates): kept inside the month. */
check('months: 31 Aug + 6 = 28 Feb 2027', await C('iso(S.addMonths(S.fromISO("2026-08-31"), 6))'), '2027-02-28');
check('months: 31 May 2027 + 9 = 29 Feb 2028 (leap year)', await C('iso(S.addMonths(S.fromISO("2027-05-31"), 9))'), '2028-02-29');
check('months: 29 Feb 2028 + 12 = 28 Feb 2029', await C('iso(S.addMonths(S.fromISO("2028-02-29"), 12))'), '2029-02-28');
check('months: 31 Jan + 1 = 28 Feb', await C('iso(S.addMonths(S.fromISO("2026-01-31"), 1))'), '2026-02-28');
/* 10. Age by the calendar: a birthday counts on the day (it used to be days / 365.25, a day late on some birthdays). */
await diary({ dob: '1996-10-18' }); check('age: 30 on her 30th birthday', await C('c.ageYears()'), 30);
await diary({ dob: '1996-10-19' }); check('age: 29 the day before it', await C('c.ageYears()'), 29);
await page.clock.setFixedTime(new Date('2027-02-28T09:00:00+05:30')); await diary({ dob: '2000-02-29' });
check('age: born 29 Feb 2000 is 26 on 28 Feb 2027', await C('c.ageYears()'), 26);
await page.clock.setFixedTime(new Date('2027-03-01T09:00:00+05:30')); check('age: and 27 on 1 Mar 2027', await C('c.ageYears()'), 27);
await page.clock.setFixedTime(new Date('2026-10-18T09:00:00+05:30'));
/* 11. Hormones stopped (Mar to May, kept as a span) and started again (from 1 Aug): both windows stay out of the averages.
      Counted: 5 Jan -> 2 Feb, 25 May -> 22 Jun, 22 Jun -> 20 Jul (28 each). */
await diary({ periods: [['2026-01-05'], ['2026-02-02'], ['2026-03-02'], ['2026-03-30'], ['2026-05-25'], ['2026-06-22'], ['2026-07-20'], ['2026-08-17'], ['2026-09-14']], situation: { hormones: true, hormonesSince: '2026-08-01', spans: [{ k: 'horm', a: '2026-03-01', b: '2026-05-01' }] } });
check('hormones: both windows left out', await C('c.usable()'), [28, 28, 28]);
check('hormones: no likely window while on them', await C('c.rangeInfo()'), null);
/* 12. A pregnancy that ended is a span from its first day: the gap that holds it (1 Jun -> 15 Sep) is not a 106-day cycle. */
await diary({ periods: [['2026-04-06'], ['2026-05-04'], ['2026-06-01'], ['2026-09-15']], situation: { spans: [{ k: 'preg', a: '2026-06-01' }] } });
check('pregnancy that ended: gaps 28, 28 (not 106)', await C('c.usable()'), [28, 28]);
/* 13. A window only for regular cycles (FIGO 2018): gaps 26, 34, 30 spread 8 days: none at 32, one at 22. */
await diary({ dob: '1994-01-01', periods: [['2026-07-01'], ['2026-07-27'], ['2026-08-30'], ['2026-09-29']] });
check('window: spread of 8 days at 32 is irregular', await C('c.rangeInfo()'), null);
await diary({ dob: '2004-01-01', periods: [['2026-07-01'], ['2026-07-27'], ['2026-08-30'], ['2026-09-29']] });
check('window: spread of 8 days at 22 still gets one', await C('!!c.rangeInfo()'), true);
/* 14. No window after a hysterectomy or while breastfeeding, even with regular gaps. */
await diary({ periods: [['2026-07-01'], ['2026-07-29'], ['2026-08-26'], ['2026-09-23']], situation: { hysterectomy: true } });
check('window: none after a hysterectomy', await C('c.rangeInfo()'), null);
await diary({ periods: [['2026-07-01'], ['2026-07-29'], ['2026-08-26'], ['2026-09-23']], situation: { breastfeeding: true } });
check('window: none while breastfeeding', await C('c.rangeInfo()'), null);
/* 15. One length rule everywhere: a 12-day period (1 to 12 Sep) is 12 days; no end logged is unknown. */
await diary({ periods: [['2026-08-04', '2026-08-08'], ['2026-09-01', '2026-09-12'], ['2026-10-01']] });
check('period length: 5 and 12 days', [await C('c.periodLen("2026-08-04")'), await C('c.periodLen("2026-09-01")')], [5, 12]);
check('period length: no end logged', await C('c.periodLen("2026-10-01")'), null);

/* ---------- Version 31: predictions from up to a year of her diary (MODULE_API section 33) ----------
   16. Ten gaps 27, 31, 31, 27, 28, 26, 30, 32, 27, 29 (the feedback diary); last start 25 Sep, so 18 Oct is day 24. Periods
       of 4 days, one of 5.
       Next start: the last 3 gaps count double: (27+31+31+27+28+26+30 + 2x(32+27+29)) / 13 = 376 / 13 = 28.9 -> 29, inside the
       last 6 gaps' 26..32 -> 25 Sep + 29 = 24 Oct, 6 days away. Period length: (10x4 + 5) / 11 = 4.1 -> 4.
       Ovulation: 14 days before 24 Oct = 10 Oct. Fertile window: the 6 days ending there, 5..10 Oct.
       Possible fertile days (Version 32, the NHS figures: ovulation 10 to 16 days before the next period, sperm up to 7 days),
       from the last 6 gaps (26..32): 25 Sep + (26 - 16 - 7) = 28 Sep, to 25 Sep + (32 - 10 + 1) = 18 Oct.
       Chance: high 8..10 Oct; medium 28 Sep..7 Oct and 11..18 Oct; low otherwise. Next cycle's ovulation: 24 Oct + 15 = 8 Nov.
       Fertile days show only while she is trying for a baby (Version 32), so these diaries are. */
const S16 = ['2025-12-11', '2026-01-07', '2026-02-07', '2026-03-10', '2026-04-06', '2026-05-04', '2026-05-30', '2026-06-29', '2026-07-31', '2026-08-27', '2026-09-25'];
const plus = (iso0, n) => { const d = new Date(iso0 + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
await diary({ dob: '1996-05-01', periods: S16.map((d, i) => [d, plus(d, i === 9 ? 4 : 3)]), situation: { planning: true } });
check('predict: the ten gaps', await C('c.usable()'), [27, 31, 31, 27, 28, 26, 30, 32, 27, 29]);
check('predict: next start 24 Oct, 6 days away, from 10 cycles; period 4 days', await C('(() => { const p = c.predict(); return p && [p.gap, iso(p.next), p.daysTo, p.n, p.plen]; })()'), [29, '2026-10-24', 6, 10, 4]);
check('predict: ovulation 10 Oct, fertile window 5..10 Oct, possible 28 Sep..18 Oct', await C('(() => { const f = c.predict().fert; return f && [iso(f.ov), iso(f.fwFrom), iso(f.fwTo), iso(f.posFrom), iso(f.posTo)]; })()'), ['2026-10-10', '2026-10-05', '2026-10-10', '2026-09-28', '2026-10-18']);
check('predict: chance by day', await C('(() => { const f = c.predict().fert; return ["2026-09-27", "2026-09-28", "2026-10-07", "2026-10-08", "2026-10-10", "2026-10-15", "2026-10-18", "2026-10-19"].map((d) => c.chanceOn(f, S.fromISO(d))); })()'), ['low', 'mid', 'mid', 'high', 'high', 'mid', 'mid', 'low']);
check('predict: a "low" day is never shown as a chance (Version 32)', await C('(() => { const f = c.predict().fert; return ["2026-09-27", "2026-10-08", "2026-10-19"].map((d) => c.chanceShown(f, S.fromISO(d))); })()'), [null, 'high', null]);
check('predict: phase by day', await C('(() => { const f = c.predict().fert; return ["2026-10-01", "2026-10-06", "2026-10-10", "2026-10-18"].map((d) => c.phaseOn(f, S.fromISO(d))); })()'), ['before', 'fertile', 'ov', 'after']);
check('predict: the next cycle\'s ovulation, 8 Nov', await C('iso(c.predict().fertNext.ov)'), '2026-11-08');
check('predict: her cycles, newest first, with their own fertile windows', await C('c.cycleList(3).map((x) => [iso(x.start), x.gap, x.plen, x.fert && iso(x.fert.ov)])'), [['2026-09-25', null, 4, '2026-10-10'], ['2026-08-27', 29, 5, '2026-09-11'], ['2026-07-31', 27, 4, '2026-08-13']]);
/* 17. Recent gaps count double: nine of 28 then three of 32 (last start 27 Sep). Plain average 29; weighted (9x28 + 2x3x32) / 15
       = 29.6 -> 30 -> 27 Oct. */
await diary({ dob: '1996-05-01', periods: ['2025-10-14', '2025-11-11', '2025-12-09', '2026-01-06', '2026-02-03', '2026-03-03', '2026-03-31', '2026-04-28', '2026-05-26', '2026-06-23', '2026-07-25', '2026-08-26', '2026-09-27'].map((d) => [d]) });
check('predict: recent gaps weigh more (30, not the plain 29)', await C('(() => { const p = c.predict(); return [p.gap, iso(p.next)]; })()'), [30, '2026-10-27']);
/* 18. When fertile days don't show: fewer than 6 gaps, hormones, a method that stops ovulation, pregnancy, 45 or older,
       irregular gaps. The countdown still shows with 5 steady gaps. */
await diary({ dob: '1996-05-01', periods: S16.slice(-6).map((d) => [d]), situation: { planning: true } });
check('fertile: hidden with 5 gaps, the countdown still shows', [await C('c.fertWhy()'), await C('!!c.predict() && c.predict().fert')], ['few', null]);
await diary({ dob: '1996-05-01', periods: S16.map((d) => [d]), situation: { hormones: true, planning: true } });
check('fertile: hidden on hormones', await C('c.fertWhy()'), 'hormones');
await diary({ dob: '1996-05-01', periods: S16.map((d) => [d]), situation: { planning: true } });
await page.evaluate(() => { window.Saathi.state.mods = { contra: { method: 'pill', remOn: true } }; });
check('fertile: hidden on the pill', await C('c.fertWhy()'), 'method');
await page.evaluate(() => { window.Saathi.state.mods = { contra: { method: 'condom' } }; });
check('fertile: shown with condoms (the chance is for sex without a method)', await C('c.fertWhy()'), null);
await diary({ dob: '1980-05-01', periods: S16.map((d) => [d]), situation: { planning: true } });
check('fertile: hidden at 46', await C('c.fertWhy()'), 'age');
await diary({ dob: '1999-04-12', periods: [['2026-02-28'], ['2026-03-31'], ['2026-05-16'], ['2026-07-17'], ['2026-08-21'], ['2026-09-20'], ['2026-10-03']], situation: { planning: true } });
check('fertile and countdown: none for irregular gaps', [await C('c.fertWhy()'), await C('c.predict()')], ['irregular', null]);
await diary({ dob: '1996-05-01', periods: S16.map((d) => [d]), situation: { pregnant: true, pregnantSince: '2026-09-25' } });
check('fertile: hidden in pregnancy', await C('c.fertWhy()'), 'stage');
/* Version 32 (decision 1 and audit 2.1 of the field-test audit): only while she is trying for a baby; the 7-day rule at every
   age; only cycles of 21 to 35 days; no chance and no next window once the predicted day has passed; the possible days come
   from her last 6 gaps, like her likely range */
/* Version 33 (Mohit: "fertile days should show to every women"): not only while she is trying for a baby */
await diary({ dob: '1996-05-01', periods: S16.map((d) => [d]) });
check('fertile: shown for every woman with steady cycles, not only one trying for a baby', [await C('c.fertWhy()'), await C('!!c.predict() && !!c.predict().fert')], [null, true]);
await diary({ dob: '2004-05-01', periods: ['2026-01-01', '2026-01-28', '2026-03-03', '2026-03-31', '2026-04-26', '2026-05-28', '2026-06-26'].map((d) => [d]), situation: { planning: true } });
check('fertile: an 8-day spread at 22 has a likely range but no fertile days (7 days at every age)', [await C('c.usable()'), await C('!!c.rangeInfo()'), await C('c.fertWhy()')], [[27, 34, 28, 26, 32, 29], true, 'irregular']);
await diary({ dob: '1996-05-01', periods: ['2026-06-15', '2026-07-04', '2026-07-24', '2026-08-12', '2026-08-31', '2026-09-19', '2026-10-08'].map((d) => [d]), situation: { planning: true } });
check('fertile: steady 19-20 day cycles are outside 21 to 35: no fertile days', [await C('c.usable()'), await C('c.fertWhy()')], [[19, 20, 19, 19, 19, 19], 'irregular']);
await diary({ dob: '1996-05-01', periods: ['2025-08-01', '2025-09-28', '2025-10-26', '2025-11-23', '2025-12-21', '2026-01-18', '2026-02-15', '2026-03-15', '2026-04-12', '2026-05-10', '2026-06-07', '2026-07-05', '2026-08-02', '2026-08-30', '2026-09-27'].map((d) => [d]), situation: { planning: true } });
check('fertile: an old 58-day gap (more than 6 gaps back) leaves the possible days alone', await C('(() => { const p = c.predict(); return p && [p.gmin, p.gmax, iso(p.fert.posFrom), iso(p.fert.posTo)]; })()'), [28, 28, '2026-10-02', '2026-10-16']);
await page.clock.setFixedTime(new Date('2026-10-27T09:00:00+05:30'));
check('late: once the predicted day has passed, no next window', await C('(() => { const p = c.predict(); return p && [p.daysTo, p.late, p.fertNext]; })()'), [-2, true, null]);
await page.clock.setFixedTime(new Date('2026-10-18T09:00:00+05:30'));

await browser.close();
const bad = results.filter((r) => !r.pass);
results.forEach((r) => console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.pass ? '' : '  got ' + JSON.stringify(r.got) + ', want ' + JSON.stringify(r.want))));
if (errs.length) console.log('PAGE ERRORS: ' + errs.join(' / '));
console.log(bad.length ? bad.length + ' of ' + results.length + ' failed' : 'MATHS OK: all ' + results.length + ' checks pass');
