/* Iron tablets: the red iron-folic acid tablet (Anemia Mukt Bharat), made easy to keep taking (Version 28;
   docs/feature-research-2026-10-22.md, A2). Only about a third of mothers take it for the full 180 days, mostly because they
   forget, feel sick or get constipated. Here she picks her plan (pregnancy, after the birth, the weekly tablet, or her doctor's
   dose) and gets:
   - one tap for "I took it", here and on Home;
   - a reminder at her time;
   - the days counted, with missed days never held against her;
   - the tablets left in her strip;
   - what to do when it upsets her, and when to get help.
   The health wording is the doctor-verified text from the Learn article and the iron journey. The new lines are listed for
   the doctor in docs/wording-review-v28.md (the help lines themselves are all verified text). Nothing here judges her data: the counts are hers, for her doctor or her ASHA.
   One record of iron days: the pregnancy logs' tablet grid reads and ticks these days through S.iron, ticks made there
   before this module are carried over once, and the iron reminder replaces the pregnancy logs' IFA reminder. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const E = (o) => esc(tx(o));
  const iso = (d) => S.toISO(d);
  const okDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const okTime = (s) => typeof s === 'string' && /^\d{2}:\d{2}$/.test(s);
  const D = () => {
    const d = S.data('iron'); if (!d.log || typeof d.log !== 'object') d.log = {};
    if (!d.mig) { const p = (S.state.mods || {}).preg; const tb = p && p.tabs && typeof p.tabs === 'object' ? p.tabs : {}; Object.keys(tb).forEach((k) => { if (okDate(k) && tb[k] && tb[k].ifa) d.log[k] = 't'; }); d.mig = 1; }   /* IFA days ticked in the pregnancy logs, once */
    return d;
  };
  const fmt = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const REM = 'iron', REM_TEST = 'iron-test';
  /* Version 39.28: where she gets care (S.care). Before she answers, and with a private doctor or "Nowhere yet", this page
     says "your doctor": her doctor's dose first, the next strip from her chemist or her doctor, and the free tablet under
     Anemia Mukt Bharat as one quiet line. A government centre or her ASHA keeps the government route's words. No dose changes. */
  const doc = () => !!(S.care && S.care.gov && !S.care.gov());
  const pk = (x) => (doc() && x.doc ? x.doc : x);   /* a line's doctor-route words, where they differ */

  /* ---------- the plans (Anemia Mukt Bharat; wording from the verified article, journey and anaemia page) ---------- */
  const PLANS = {
    preg: { every: 1, target: 180, name: L('Pregnancy', 'गर्भावस्था'),
      how: L('From the fourth month: one red iron-folic acid tablet a day, for at least 180 days, and again for 180 days after the birth.', 'चौथे महीने से: रोज़ एक लाल आयरन-फोलिक एसिड की गोली, कम से कम 180 दिन, और डिलीवरी के बाद फिर 180 दिन।'),
      dhow: L('From the fourth month: one iron-folic acid tablet a day, for at least 180 days, and again for 180 days after the birth.', 'चौथे महीने से: रोज़ एक आयरन-फोलिक एसिड की गोली, कम से कम 180 दिन, और डिलीवरी के बाद फिर 180 दिन।') },
    post: { every: 1, target: 180, name: L('After the birth', 'डिलीवरी के बाद'),
      how: L('Keep taking iron for 180 days and calcium for six months.', 'आयरन 180 दिन और कैल्शियम छह महीने लेती रहें।') },
    weekly: { every: 7, target: 0, name: L('The weekly tablet', 'हफ़्ते की गोली'),
      how: L('If you are 20 to 49 and not pregnant or breastfeeding, your ASHA or ANM can give you the weekly iron-folic acid tablet under Anemia Mukt Bharat (60 mg iron, 500 mcg folic acid).', 'अगर आप 20 से 49 की हैं और प्रेग्नेंट या स्तनपान कराती नहीं हैं, तो आपकी आशा या ANM Anemia Mukt Bharat के तहत हफ़्ते की आयरन-फ़ोलिक एसिड गोली दे सकती हैं (60 mg आयरन, 500 mcg फ़ोलिक एसिड)।'),
      dhow: L('If you are 20 to 49 and not pregnant or breastfeeding: the weekly iron-folic acid tablet (60 mg iron, 500 mcg folic acid) is free at government health centres under Anemia Mukt Bharat.', 'अगर आप 20 से 49 की हैं और प्रेग्नेंट या स्तनपान कराती नहीं हैं: हफ़्ते की आयरन-फ़ोलिक एसिड गोली (60 mg आयरन, 500 mcg फ़ोलिक एसिड) Anemia Mukt Bharat के तहत सरकारी स्वास्थ्य केंद्रों पर मुफ़्त मिलती है।') },
    doctor: { every: 1, target: 0, name: L('My doctor’s dose', 'डॉक्टर की बताई डोज़'), dname: L('As my doctor prescribed', 'जैसे डॉक्टर ने लिखी'),
      how: L('If your Hb is low, the doctor or ANM may give the red tablet daily, often for about 3 months, and test again. Your doctor decides.', 'अगर Hb कम है, तो डॉक्टर या ANM लाल गोली रोज़ दे सकती हैं, अक्सर लगभग 3 महीने, और फिर जाँच। यह डॉक्टर तय करती हैं।'),
      dhow: L('If your Hb is low, your doctor may prescribe iron, often for about 3 months, and test again. Take it as often as they said.', 'अगर Hb कम है, तो डॉक्टर आयरन की गोली लिख सकती हैं, अक्सर लगभग 3 महीने, और फिर जाँच। जितनी बार उन्होंने कहा, उतनी बार लें।') }
  };
  const PLAN_IDS = ['preg', 'post', 'weekly', 'doctor'];
  const planIds = () => (doc() ? ['doctor', 'preg', 'post', 'weekly'] : PLAN_IDS);   /* her doctor's dose first */
  const nameOf = (P) => (doc() && P.dname ? P.dname : P.name);
  const howOf = (P) => (doc() && P.dhow ? P.dhow : P.how);
  /* Version 39.28: "How often did your doctor say?" (her doctor's dose): every day, every other day, or once a week */
  const EVERY = [1, 2, 7];
  /* What to do when it upsets her (verified, except the constipation line: in the doctor's review list) */
  const UPSET = [
    L('Take it two hours after a meal, with water or lemon water, not with tea or milk. If it upsets you, take it at bedtime.', 'खाने के दो घंटे बाद लें, पानी या नींबू पानी से, चाय या दूध से नहीं। परेशान करे तो रात को सोते वक़्त लें।'),
    L('Never take calcium and the iron tablet together; each blocks the other.', 'कैल्शियम और आयरन की गोली कभी एक साथ न लें; एक दूसरे को काम नहीं करने देती।'),
    L('Constipation: more water, fruit, vegetables and walking.', 'कब्ज़ हो तो: ज़्यादा पानी, फल, सब्ज़ी और टहलना।'),
    Object.assign(L('Black stools are normal with iron. If the tablet upsets your stomach, tell the ASHA or doctor instead of stopping.', 'आयरन की गोली से मल काला होना आम है। अगर पेट ख़राब हो, तो गोली बंद करने की जगह ASHA या डॉक्टर को बताएँ।'),
      { doc: L('Black stools are normal with iron. If the tablet upsets your stomach, tell your doctor instead of stopping.', 'आयरन की गोली से मल काला होना आम है। अगर पेट ख़राब हो, तो गोली बंद करने की जगह डॉक्टर को बताएँ।') }),
    L('Pause it during a fever, diarrhoea or other short illness, and restart when you are well.', 'बुख़ार, दस्त या कोई और छोटी बीमारी में रोक दें, ठीक होने पर फिर शुरू करें।')
  ];
  const HELP = [
    Object.assign(L('Very pale, breathless on stairs, heart racing, or very tired: ask the ANM for a haemoglobin test this week. Below 7 needs a higher centre.', 'बहुत पीलापन, सीढ़ी चढ़ने में साँस फूलना, दिल तेज़ धड़कना, या बहुत थकान: इसी हफ़्ते ANM से हीमोग्लोबिन टेस्ट कराएँ। 7 से नीचे हो तो बड़े सेंटर जाना होता है।'),
      { doc: L('Very pale, breathless on stairs, heart racing, or very tired: ask your doctor for a haemoglobin test this week. Below 7 needs care in a hospital.', 'बहुत पीलापन, सीढ़ी चढ़ने में साँस फूलना, दिल तेज़ धड़कना, या बहुत थकान: इसी हफ़्ते डॉक्टर से हीमोग्लोबिन टेस्ट कराएँ। 7 से नीचे हो तो अस्पताल में इलाज ज़रूरी है।') }),
    Object.assign(L('Vomiting every tablet, or no rise in haemoglobin after 4 weeks of tablets: ask the ANM to refer you.', 'हर गोली उल्टी हो जाती है, या 4 हफ़्ते गोली के बाद भी हीमोग्लोबिन नहीं बढ़ा: ANM से रेफ़र करने को कहें।'),
      { doc: L('Vomiting every tablet, or no rise in haemoglobin after 4 weeks of tablets: tell your doctor.', 'हर गोली उल्टी हो जाती है, या 4 हफ़्ते गोली के बाद भी हीमोग्लोबिन नहीं बढ़ा: डॉक्टर को बताएँ।') }),
    L('Known thalassaemia or repeated blood transfusions: do not take iron tablets without a doctor’s advice.', 'थैलेसीमिया है या बार-बार खून चढ़ा है: डॉक्टर की सलाह बिना आयरन की गोली न लें।'),
    L('Severe vomiting, belly pain that does not settle, rash, swelling or trouble breathing: stop and see a doctor.', 'तेज़ उल्टी, पेट दर्द जो न रुके, चकत्ते, सूजन या साँस में तकलीफ़: गोली रोकें और डॉक्टर को दिखाएँ।')
  ];
  const STOCK = L('If the ANM runs out, ask her when stock comes; a Jan Aushadhi store may also have them cheaply.', 'ANM के पास ख़त्म हो तो पूछें कब आएगा; जन औषधि स्टोर पर भी सस्ते में मिल सकती हैं।');
  const SRC = [
    ['https://nhm.gov.in/images/pdf/Nutrition/AMB-guidelines/Anemia-Mukt-Bharat-Operational-Guidelines-FINAL.pdf', L('Ministry of Health, Anemia Mukt Bharat guidelines', 'स्वास्थ्य मंत्रालय, एनीमिया मुक्त भारत दिशानिर्देश')],
    ['https://www.nhm.gov.in/New-Update-2025-26/Nutrition/AMB-guidelines/AMB-Abhiyaan-Guidelines.pdf', L('Anemia Mukt Bharat Abhiyaan guidelines, 2026', 'एनीमिया मुक्त भारत अभियान दिशानिर्देश, 2026')]
  ];

  /* ---------- counting ---------- */
  const todayISO = () => iso(S.today());
  const active = (d) => !!(d.plan && PLANS[d.plan] && okDate(d.start) && !d.ended);
  const every = (d) => (d.plan === 'doctor' && EVERY.indexOf(d.every) >= 0 ? d.every : ((PLANS[d.plan] || {}).every || 1));
  const weekly = (d) => !!PLANS[d.plan] && every(d) === 7;
  const lastTick = (d) => Object.keys(d.log).filter((k) => okDate(k) && k >= d.start && d.log[k]).sort().pop() || null;
  /* every other day: a tick yesterday makes today a day off */
  const restDay = (d) => every(d) === 2 && !d.log[todayISO()] && !!d.log[iso(S.addDays(S.today(), -1))] && iso(S.addDays(S.today(), -1)) >= d.start;
  const takenDays = (d) => Object.keys(d.log).filter((k) => okDate(k) && k >= d.start && d.log[k]).length;
  /* the weekly tablet is due from the last occurrence of her day; done once she ticks any day since then */
  const lastDue = (d) => { let x = S.today(); for (let i = 0; i < 7; i++) { if (x.getDay() === Number(d.day)) return x; x = S.addDays(x, -1); } return S.today(); };
  const weeksTaken = (d) => { const seen = {}; Object.keys(d.log).filter((k) => okDate(k) && k >= d.start && d.log[k]).forEach((k) => { const x = S.fromISO(k); seen[iso(S.addDays(x, -((x.getDay() - Number(d.day) + 7) % 7)))] = 1; }); return Object.keys(seen).length; };
  const doneNow = (d) => { if (!active(d)) return true; if (restDay(d)) return true; if (weekly(d)) { const from = iso(lastDue(d)); return from < d.start ? true : Object.keys(d.log).some((k) => k >= from && d.log[k]); } return !!d.log[todayISO()]; };
  const last30 = (d) => { let n = 0; const td = S.today(); for (let i = 0; i < 30; i++) { const k = iso(S.addDays(td, -i)); if (k < d.start) break; if (d.log[k]) n++; } return n; };
  const suggest = () => {
    const age = S.cycle.ageYears();
    if (S.cycle.isPregnant()) return 'preg';
    if (S.cycle.afterBirth()) return 'post';
    return !doc() && age != null && age >= 20 && age <= 49 ? 'weekly' : 'doctor';   /* the weekly tablet comes from the ASHA or ANM */
  };

  /* ---------- reminders ---------- */
  function sync(d) {
    S.reminders.remove(REM_TEST);
    if (!active(d) || d.remOn === false) { S.reminders.remove(REM); }
    else {
      const cur = S.reminders.get(REM); if (cur && okTime(cur.time)) d.time = cur.time;   /* a time changed under All reminders stays */
      const base = { id: REM, mod: 'iron', title: L('Iron tablet', 'आयरन की गोली'), kind: 'med', time: okTime(d.time) ? d.time : '21:00', on: true, dates: null, until: null };
      if (weekly(d)) S.reminders.upsert(Object.assign(base, { start: d.start, every: null, weekdays: [Number(d.day) || 0] }));
      else if (every(d) === 2) S.reminders.upsert(Object.assign(base, { start: lastTick(d) || d.start, every: 2, weekdays: null }));   /* two days after her last tablet */
      else S.reminders.upsert(Object.assign(base, { start: d.start, every: 1, weekdays: null }));
      const r = S.reminders.get(REM); const td = todayISO(); if (r) { if (d.log[td]) r.doneOn = td; else delete r.doneOn; }
    }
    /* her doctor's course with an end date: a reminder that day to ask for the repeat test */
    if (active(d) && d.plan === 'doctor' && okDate(d.until) && d.until >= todayISO()) S.reminders.upsert({ id: REM_TEST, mod: 'iron', title: L('Ask for your repeat Hb test', 'दोबारा Hb टेस्ट के लिए कहें'), kind: 'checkup', dates: [d.until], start: null, every: null, weekdays: null, time: '10:00', on: true });
  }
  /* tick or untick a day; the strip count follows */
  function mark(d, k, on) {
    const had = !!d.log[k];
    if (on && !had) { d.log[k] = 't'; if (typeof d.left === 'number' && d.left > 0) d.left -= 1; }
    if (!on && had) { delete d.log[k]; if (typeof d.left === 'number') d.left += 1; }
    sync(d); S.save(); S.render();
  }

  /* ---------- the page ---------- */
  const bar = (n, of) => '<div class="iron-bar" role="img" aria-label="' + esc(tf('iron_of', { n: n, of: of })) + '"><i style="width:' + Math.min(100, Math.round((n / of) * 100)) + '%"></i></div>';
  const ul = (arr) => '<ul class="iron-ul">' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ul>';
  const srcList = () => '<details><summary>' + esc(t('iron_sources')) + '</summary><p class="sources">' + SRC.map((s) => '<a href="' + esc(s[0]) + '" target="_blank" rel="noopener">' + E(s[1]) + '</a>').join(' · ') + '</p></details>';
  function pickHtml(d) {
    const sug = d.pick || suggest(); const pi = S.preg && S.preg.info ? S.preg.info() : null; const ev = EVERY.indexOf(d.pickEvery) >= 0 ? d.pickEvery : 1;
    return '<div class="card"><h3>' + esc(t('iron_pick_h')) + '</h3><div class="list iron-plans">' + planIds().map((id) => '<label class="item"><span class="body"><strong>' + E(nameOf(PLANS[id])) + '</strong><span>' + E(howOf(PLANS[id])) + '</span></span><input type="radio" name="iron-plan" value="' + id + '"' + (id === sug ? ' checked' : '') + '></label>').join('') + '</div>' +
      (pi && pi.weeks < 12 ? '<p class="small">' + esc(t('iron_early')) + '</p>' : '') +
      everyHtml('iron-every-row', ev, sug !== 'doctor') +
      '<div id="iron-day-row"' + (sug === 'weekly' || (sug === 'doctor' && ev === 7) ? '' : ' hidden') + '><label for="iron-day">' + esc(t('iron_day_l')) + '</label><select id="iron-day">' + [1, 2, 3, 4, 5, 6, 0].map((n) => '<option value="' + n + '"' + (n === 1 ? ' selected' : '') + '>' + esc(S.fmtD(new Date(2026, 9, 18 + n), { weekday: 'long' })) + '</option>').join('') + '</select></div>' +
      '<label for="iron-time">' + esc(t('iron_time_l')) + '</label><input id="iron-time" type="time" value="21:00">' +
      '<button type="button" class="btn primary block" id="iron-start">' + esc(t('iron_start')) + '</button></div>';
  }
  /* Version 39.28: "How often did your doctor say?" for her doctor's dose */
  const everyHtml = (id, ev, hide) => '<div id="' + id + '" class="iron-every"' + (hide ? ' hidden' : '') + '><p class="iron-every-h">' + esc(t('iron_every_h')) + '</p><div class="chips" role="group" aria-label="' + esc(t('iron_every_h')) + '">' + EVERY.map((n) => '<button type="button" class="chip' + (n === ev ? ' on' : '') + '" data-iron-every="' + n + '" aria-pressed="' + (n === ev) + '">' + esc(t('iron_e' + n)) + '</button>').join('') + '</div></div>';
  /* Version 39.8: the tablet and the strip, drawn */
  const pic = (k) => (S.art && S.art.hasFood && S.art.hasFood(k) ? '<span class="iron-pic" aria-hidden="true">' + S.art.food(k) + '</span>' : '');
  function render(v) {
    const head = S.backRow(t('iron_h'), 'care', false);
    const intro = t(doc() ? 'iron_p_doc' : 'iron_p');
    if (!S.canSave()) { v.innerHTML = head + '<p class="small">' + esc(intro) + '</p>' + S.needDiary(); S.wire(v); return; }
    const d = D(); let body;
    if (!active(d)) {
      body = '<p class="small">' + esc(intro) + '</p>' + (d.ended ? '<div class="card soft"><p class="small">' + esc(tf('iron_ended', { d: fmt(S.fromISO(d.ended)), n: takenDays(d) })) + '</p></div>' : '') + pickHtml(d);
    } else {
      const P = PLANS[d.plan]; const td = S.today(); const tdS = todayISO(); const isW = weekly(d); const done = doneNow(d); const rest = restDay(d);
      const n = isW ? weeksTaken(d) : takenDays(d);
      const today = '<div class="card iron-today" data-nofold="1"><div class="row iron-hd">' + pic('tablet') + '<div><span class="eyebrow">' + E(nameOf(P)) + '</span><h2>' + esc(t(isW ? 'iron_week_h' : 'iron_today_h')) + '</h2></div></div>' +
        (done ? '<div class="flag ok">' + esc(t(rest ? 'iron_rest' : (isW ? 'iron_week_done' : 'iron_today_done'))) + '</div>' + (isW || !d.log[tdS] ? '' : '<button type="button" class="linkbtn" id="iron-undo">' + esc(t('iron_undo')) + '</button>')
          : '<button type="button" class="btn primary block" id="iron-took">' + esc(t('iron_took')) + '</button>') + '</div>';
      let prog = '<div class="card"><h3>' + esc(t('iron_prog_h')) + '</h3>';
      if (isW) prog += '<p>' + esc(tf('iron_weeks_n', { n: n })) + '</p>';
      else if (P.target) prog += '<p>' + esc(tf('iron_of', { n: n, of: P.target })) + '</p>' + bar(n, P.target) + (n >= P.target ? '<div class="flag ok">' + esc(tf('iron_target', { n: P.target })) + '</div>' : '');
      else prog += '<p>' + esc(tf('iron_days_n', { n: n })) + '</p>' + (okDate(d.until) ? '<p class="small">' + esc(tf('iron_until', { d: fmt(S.fromISO(d.until)) })) + '</p>' : '');
      prog += '<p class="small">' + esc(tf('iron_since', { d: fmt(S.fromISO(d.start)) })) + ' · ' + esc(t('iron_missed_ok')) + '</p>';
      if (!isW) {
        const days = []; for (let i = 6; i >= 0; i--) { const x = S.addDays(td, -i); if (iso(x) >= d.start) days.push(x); }
        prog += '<div class="iron-week" role="group" aria-label="' + esc(t('iron_week_l')) + '">' + days.map((x) => { const k = iso(x); const on = !!d.log[k]; return '<button type="button" class="iron-day' + (on ? ' on' : '') + '" data-iron-day="' + k + '" aria-pressed="' + on + '" aria-label="' + esc(S.fmtD(x, { weekday: 'long', day: 'numeric', month: 'short' }) + ': ' + t(on ? 'iron_day_on' : 'iron_day_off')) + '"><span>' + esc(S.fmtD(x, { weekday: 'narrow' })) + '</span><b class="num">' + x.getDate() + '</b></button>'; }).join('') + '</div><p class="small">' + esc(t('iron_week_tap')) + '</p>';
      }
      prog += '<p class="small">' + E(howOf(P)) + '</p></div>';
      const rem = S.reminders.get(REM); const remOn = d.remOn !== false;
      const remCard = '<div class="card"><div class="list"><label class="item"><span class="body"><strong>' + esc(t('iron_rem')) + '</strong><span>' + esc(isW ? tf('iron_rem_w', { day: S.fmtD(lastDue(d), { weekday: 'long' }) }) : t(every(d) === 2 ? 'iron_rem_2' : 'iron_rem_d')) + '</span></span><input type="checkbox" id="iron-rem"' + (remOn ? ' checked' : '') + '></label></div>' +
        (remOn ? '<label for="iron-time">' + esc(t('iron_time_l')) + '</label><input id="iron-time" type="time" value="' + esc(rem && okTime(rem.time) ? rem.time : (okTime(d.time) ? d.time : '21:00')) + '">' : '') + '</div>';
      const low = typeof d.left === 'number' && d.left <= 5;
      const strip = '<div class="card' + (low ? ' warn' : '') + '"><div class="row iron-hd">' + pic('strip') + '<h3>' + esc(t('iron_left_h')) + '</h3></div>' +
        (low ? '<p style="color:var(--fg)"><strong>' + esc(tf('iron_low', { n: d.left })) + '</strong> ' + esc(t(doc() ? 'iron_low_ask_doc' : 'iron_low_ask')) + '</p>' + (doc() ? '' : '<p class="small" style="color:var(--fg)">' + E(STOCK) + '</p>') : '<p class="small">' + esc(t('iron_left_p')) + '</p>') +
        '<div class="row"><input id="iron-left" type="number" inputmode="numeric" min="0" max="400" placeholder="' + esc(t('iron_left_ph')) + '" value="' + (typeof d.left === 'number' ? d.left : '') + '" style="flex:1"><button type="button" class="btn sm" id="iron-left-go">' + esc(t('iron_left_save')) + '</button></div></div>';
      const docRow = d.plan === 'doctor' ? '<div class="card">' + everyHtml('iron-every-now', every(d), false) + '<label for="iron-until">' + esc(t('iron_until_l')) + '</label><input id="iron-until" type="date" value="' + esc(okDate(d.until) ? d.until : '') + '"><p class="small">' + esc(t('iron_until_p')) + '</p></div>' : '';
      body = today + prog + remCard + strip + docRow +
        '<div class="card soft"><h3>' + esc(t('iron_upset_h')) + '</h3>' + ul(UPSET.map(pk)) + '</div>' +
        '<div class="card warn"><h3>' + esc(t('iron_help_h')) + '</h3>' + ul(HELP.map(pk)) + '</div>' +
        '<div class="list"><button type="button" class="item" data-go="a-pregnancy.iron-folic-acid-calcium-td"><span class="body"><strong>' + esc(t('iron_read')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button>' +
        (S.routeOwner('asha') && (!doc() || (S.asha && S.asha.saved())) ? '<button type="button" class="item" data-go="asha"><span class="body"><strong>' + esc(t('iron_asha')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button>' : '') + '</div>' +
        '<div id="iron-stop-box"><button type="button" class="linkbtn" id="iron-stop">' + esc(t('iron_stop')) + '</button></div>';
    }
    /* the doctor route: the free tablet as one quiet line, to the schemes for her stage */
    const alt = doc() && S.care.altRow && S.routeOwner('access-schemes-preg') ? S.care.altRow('access-schemes-' + (S.cycle.isPregnant() ? 'preg' : (S.cycle.afterBirth() ? 'post' : 'period')), t('iron_free_doc')) : '';
    v.innerHTML = head + body + alt + srcList() + (S.quraOk && !S.quraOk() ? (S.govCard ? S.govCard() : '') : '<button type="button" class="btn ghost block" data-ask="' + esc(t('iron_h')) + '">' + esc(t('ask_qura')) + '</button>')   /* Version 39.77 (D17): her doctor or a free government doctor */ + '<p class="footnote">' + esc(t(doc() ? 'iron_foot_doc' : 'iron_foot')) + '</p>';
    S.wire(v); wire(v);
  }
  function wire(v) {
    const d = D();
    const dayRow = (p) => { const row = v.querySelector('#iron-day-row'); if (row) row.hidden = !(p === 'weekly' || (p === 'doctor' && d.pickEvery === 7)); };
    v.querySelectorAll('input[name="iron-plan"]').forEach((r) => r.addEventListener('change', () => { d.pick = r.value; dayRow(r.value); const er = v.querySelector('#iron-every-row'); if (er) er.hidden = r.value !== 'doctor'; }));
    v.querySelectorAll('#iron-every-row [data-iron-every]').forEach((b) => b.addEventListener('click', () => {
      d.pickEvery = Number(b.dataset.ironEvery); v.querySelectorAll('#iron-every-row [data-iron-every]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); dayRow('doctor');
    }));
    /* her doctor's dose, started: a new rhythm from today (once a week keeps today's weekday) */
    v.querySelectorAll('#iron-every-now [data-iron-every]').forEach((b) => b.addEventListener('click', () => {
      const n = Number(b.dataset.ironEvery); if (n === every(d)) return; d.every = n; if (n === 7 && d.day == null) d.day = S.today().getDay(); sync(d); S.save(); S.render();
    }));
    const st = v.querySelector('#iron-start'); if (st) st.addEventListener('click', () => {
      const p = (v.querySelector('input[name="iron-plan"]:checked') || {}).value || suggest();
      const tm = (v.querySelector('#iron-time') || {}).value; const dy = (v.querySelector('#iron-day') || {}).value; const ev = p === 'doctor' && EVERY.indexOf(d.pickEvery) >= 0 ? d.pickEvery : 1;
      Object.assign(d, { plan: p, start: todayISO(), ended: null, remOn: true, time: okTime(tm) ? tm : '21:00', day: p === 'weekly' || ev === 7 ? Number(dy || 1) : null, every: p === 'doctor' ? ev : null, until: null, pick: null, pickEvery: null });
      S.reminders.remove(REM); S.reminders.remove('preg-ifa'); sync(d);   /* one iron reminder: this one replaces the pregnancy logs' IFA reminder */ S.save(); S.toast(t('iron_started')); S.render(); window.scrollTo(0, 0);
    });
    const tk = v.querySelector('#iron-took'); if (tk) tk.addEventListener('click', () => { mark(d, todayISO(), true); S.toast(t('iron_noted')); });
    const un = v.querySelector('#iron-undo'); if (un) un.addEventListener('click', () => mark(d, todayISO(), false));
    v.querySelectorAll('[data-iron-day]').forEach((b) => b.addEventListener('click', () => mark(d, b.dataset.ironDay, !d.log[b.dataset.ironDay])));
    const rm = v.querySelector('#iron-rem'); if (rm) rm.addEventListener('change', () => { d.remOn = rm.checked; sync(d); S.save(); S.render(); });
    const ti = v.querySelector('#iron-time'); if (ti && active(d)) ti.addEventListener('change', () => { if (!okTime(ti.value)) return; d.time = ti.value; const r = S.reminders.get(REM); if (r) r.time = ti.value; sync(d); S.save(); S.toast(t('iron_time_ok')); });
    const lg = v.querySelector('#iron-left-go'); if (lg) lg.addEventListener('click', () => { const raw = (v.querySelector('#iron-left') || {}).value; const n = raw === '' ? null : Math.max(0, Math.min(400, Math.round(Number(raw)))); d.left = n == null || isNaN(n) ? null : n; S.save(); S.render(); });
    const un2 = v.querySelector('#iron-until'); if (un2) un2.addEventListener('change', () => { d.until = okDate(un2.value) ? un2.value : null; sync(d); S.save(); S.render(); });
    const sp = v.querySelector('#iron-stop'); if (sp) sp.addEventListener('click', () => {
      v.querySelector('#iron-stop-box').innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('iron_stop_q')) + '</p><div class="grid2"><button type="button" class="btn" id="iron-stop-no">' + esc(t('cancel')) + '</button><button type="button" class="btn" id="iron-stop-yes">' + esc(t('iron_stop_yes')) + '</button></div></div>';
      v.querySelector('#iron-stop-no').addEventListener('click', () => S.render());
      v.querySelector('#iron-stop-yes').addEventListener('click', () => { d.ended = todayISO(); sync(d); S.save(); S.render(); });
    });
  }

  /* ---------- Home's Today: today's tablet, until it is ticked (plain words in discreet mode) ---------- */
  function today() {
    if (!S.canSave()) return null; const d0 = (S.state.mods || {}).iron; if (!d0) return null;
    const d = D(); if (!active(d) || doneNow(d)) return null;
    const disc = !!(S.state.settings || {}).discreet; const isW = weekly(d); const P = PLANS[d.plan];
    const sub = disc ? '' : (isW ? tf('iron_weeks_n', { n: weeksTaken(d) }) : (P.target ? tf('iron_of', { n: takenDays(d), of: P.target }) : tf('iron_days_n', { n: takenDays(d) })));
    return { id: 'iron', order: 10, icon: 'drop', hue: 'rose', title: disc ? t('iron_home_d') : t(isW ? 'iron_home_w' : 'iron_home'), sub: sub, go: 'iron', rem: [REM],
      actLabel: t(disc ? 'iron_home_took_d' : 'iron_took_short'), act: () => mark(D(), todayISO(), true), done: t('iron_noted') };
  }
  /* ---------- Home's setup card: iron in pregnancy from the fourth month, and for 180 days after a birth ---------- */
  function setup() {
    if (!S.canSave()) return null; const k = S.stageNow(); const sit = S.state.situation || {};
    if (k === 'preg') { const pi = S.preg.info(); if (!pi || pi.weeks < 13) return null; }
    else if (k !== 'post' || !okDate(sit.deliveredOn) || S.diffDays(S.fromISO(sit.deliveredOn), S.today()) > 180) return null;
    /* done once her iron plan is on (or she stopped it), or an iron tablet in My medicines already reminds her */
    const inMeds = S.reminders.list().some((r) => r.kind === 'med' && r.mod === 'tools' && /iron|ifa|आयरन/i.test(S.reminders.text(r)));
    const d = D(); return { id: 'iron', order: 30, title: t(k === 'preg' ? 'iron_setup_preg' : 'iron_setup_post'), sub: t(k === 'preg' ? 'iron_setup_preg_s' : 'iron_setup_post_s'), go: 'iron', done: active(d) || !!d.ended || inMeds };
  }

  /* ---------- the doctor's summary ---------- */
  function summary() {
    if (!S.canSave()) return []; const d0 = (S.state.mods || {}).iron; if (!d0 || !d0.plan || !PLANS[d0.plan] || !okDate(d0.start)) return [];
    const d = D(); const P = PLANS[d.plan]; const lines = [tx(nameOf(P)) + ', ' + tf('iron_since_s', { d: fmt(S.fromISO(d.start)) })];
    if (d.plan === 'doctor' && every(d) !== 1) lines.push(t('iron_e' + every(d)));
    if (weekly(d)) lines.push(tf('iron_weeks_n', { n: weeksTaken(d) }));
    else { lines.push(P.target ? tf('iron_of', { n: takenDays(d), of: P.target }) : tf('iron_days_n', { n: takenDays(d) })); lines.push(tf('iron_last30', { n: last30(d) })); }
    if (d.ended) lines.push(tf('iron_ended_s', { d: fmt(S.fromISO(d.ended)) }));
    return [{ title: t('iron_h'), lines: lines }];
  }

  /* ---------- sample women: Meera is pregnant and takes her tablet most days ---------- */
  function sample(id) {
    if (id !== 'meera') return;
    const d = D(); const td = S.today(); const start = S.addDays(td, -48);
    Object.assign(d, { plan: 'preg', start: iso(start), remOn: true, time: '21:00', left: 14, log: {}, mig: 1 });
    for (let i = 48; i >= 1; i--) if (i % 9 !== 4) d.log[iso(S.addDays(td, -i))] = 't';
    sync(d);
  }

  /* For the pregnancy logs' tablet grid: one record of iron days */
  /* review life-3: after a pregnancy loss, core asks whether to keep the pregnancy course's reminder, and can turn it off */
  S.iron = { pregRem: () => S.canSave() && active(D()) && D().plan === 'preg' && D().remOn !== false, remOff: () => { if (!S.canSave()) return; const d = D(); d.remOn = false; sync(d); },
    taken: (k) => S.canSave() && !!D().log[k], days: () => (S.canSave() ? Object.keys(D().log).filter((k) => okDate(k) && D().log[k]) : []), mark: (k, on) => { if (S.canSave() && okDate(k)) mark(D(), k, !!on); }, active: () => S.canSave() && active(D()) };

  S.register({
    id: 'iron',
    demoPersona: 'meera',
    strings: {
      en: {
        iron_h: 'Iron tablets', iron_tile_s: 'Tick your daily tablet, get a reminder, and help if it upsets you',
        iron_p: 'The red iron tablet protects you from low haemoglobin, but it is easy to forget or to stop when it upsets you. Pick your plan: one tap a day, a reminder, and help when it is hard.',
        iron_pick_h: 'Your plan', iron_early: 'Weeks 1 to 12: folic acid alone. Iron starts from the fourth month.',
        iron_day_l: 'Which day of the week?', iron_time_l: 'Remind me at', iron_start: 'Start', iron_started: 'Started. Tick each day you take it.',
        iron_today_h: 'Today’s tablet', iron_week_h: 'This week’s tablet', iron_took: 'I took it today', iron_took_short: 'I took it',
        iron_today_done: 'Taken today. Well done.', iron_week_done: 'Taken this week. Well done.', iron_undo: 'Undo', iron_noted: 'Noted.',
        iron_prog_h: 'So far', iron_of: '{n} of {of} days', iron_days_n: 'Days taken: {n}', iron_weeks_n: 'Weeks taken: {n}', iron_since: 'Since {d}', iron_since_s: 'since {d}',
        iron_missed_ok: 'Missed a day? Just take today’s.', iron_target: '{n} days done.',
        iron_until: 'Until {d}, then a repeat test.', iron_until_l: 'Your doctor’s course ends on (optional)', iron_until_p: 'You get a reminder that day to ask for your repeat Hb test.',
        iron_week_l: 'The last 7 days', iron_week_tap: 'Forgot to tick a day? Tap it.', iron_day_on: 'taken', iron_day_off: 'not ticked',
        iron_rem: 'Remind me', iron_rem_d: 'Every day, until you stop the plan.', iron_rem_w: 'Every {day}.', iron_time_ok: 'Reminder time changed.',
        iron_left_h: 'Tablets left in your strip', iron_left_p: 'Optional. Write the number when you get a new strip; each tick counts one down.', iron_left_ph: 'e.g. 30', iron_left_save: 'Save',
        iron_low: 'Only {n} tablets left.', iron_low_ask: 'Ask your ASHA, ANM or Anganwadi for the next strip before it runs out.',
        iron_upset_h: 'If it upsets you', iron_help_h: 'When to get help', iron_read: 'Read: the red tablet, the white tablet and two injections', iron_asha: 'My ASHA or ANM',
        iron_stop: 'Stop this plan', iron_stop_q: 'Stop this plan? Your ticked days stay in your diary.', iron_stop_yes: 'Stop the plan',
        iron_ended: 'Your last plan ended on {d}, with {n} days taken.', iron_ended_s: 'Stopped on {d}', iron_last30: 'Last 30 days: {n} days',
        iron_setup_preg: 'Start your iron tablets', iron_setup_preg_s: 'One a day from the fourth month, with a reminder', iron_setup_post: 'Iron tablets for 180 days after the birth', iron_setup_post_s: 'One a day, with a reminder',
        iron_home: 'Iron tablet today', iron_home_w: 'This week’s iron tablet', iron_home_d: 'Today’s tablet', iron_home_took_d: 'Done',
        iron_sources: 'Sources', iron_foot: 'Free under Anemia Mukt Bharat from your ASHA, ANM, Anganwadi or PHC. Your ticks stay on this phone.',
        /* Version 39.28: the doctor route (S.care) */
        iron_p_doc: 'Your iron tablet protects you from low haemoglobin, but it is easy to forget or to stop when it upsets you. Pick your plan: one tap a day, a reminder, and help when it is hard.',
        iron_low_ask_doc: 'Get your next strip before it runs out, from your chemist or your doctor.', iron_free_doc: 'Free iron tablets at government health centres (Anemia Mukt Bharat)', iron_foot_doc: 'Your ticks stay on this phone.',
        iron_every_h: 'How often did your doctor say?', iron_e1: 'Every day', iron_e2: 'Every other day', iron_e7: 'Once a week', iron_rem_2: 'Every other day, until you stop the plan.', iron_rest: 'No tablet today. Your next one is tomorrow.'
      },
      hi: {
        iron_h: 'आयरन की गोलियाँ', iron_tile_s: 'रोज़ की गोली पर टिक, रिमाइंडर, और परेशानी हो तो मदद',
        iron_p: 'लाल आयरन की गोली कम हीमोग्लोबिन से बचाती है, पर भूलना आसान है, या परेशानी होने पर बंद कर देना। अपना प्लान चुनें: रोज़ एक टैप, एक रिमाइंडर, और मुश्किल हो तो मदद।',
        iron_pick_h: 'आपका प्लान', iron_early: 'हफ़्ता 1 से 12: सिर्फ़ फोलिक एसिड। आयरन चौथे महीने से शुरू होता है।',
        iron_day_l: 'हफ़्ते का कौन सा दिन?', iron_time_l: 'मुझे इस समय याद दिलाएँ', iron_start: 'शुरू करें', iron_started: 'शुरू हो गया। जिस दिन लें, टिक करें।',
        iron_today_h: 'आज की गोली', iron_week_h: 'इस हफ़्ते की गोली', iron_took: 'आज ले ली', iron_took_short: 'ले ली',
        iron_today_done: 'आज ले ली। बहुत अच्छा।', iron_week_done: 'इस हफ़्ते ले ली। बहुत अच्छा।', iron_undo: 'वापस लें', iron_noted: 'दर्ज हो गया।',
        iron_prog_h: 'अब तक', iron_of: '{of} में से {n} दिन', iron_days_n: 'गोली ली: {n} दिन', iron_weeks_n: 'गोली ली: {n} हफ़्ते', iron_since: '{d} से', iron_since_s: '{d} से',
        iron_missed_ok: 'कोई दिन छूट गया? बस आज की लें।', iron_target: '{n} दिन पूरे।',
        iron_until: '{d} तक, फिर दोबारा जाँच।', iron_until_l: 'डॉक्टर का कोर्स कब ख़त्म होगा (चाहें तो)', iron_until_p: 'उस दिन दोबारा Hb टेस्ट के लिए कहने का रिमाइंडर आएगा।',
        iron_week_l: 'पिछले 7 दिन', iron_week_tap: 'किसी दिन टिक करना भूल गईं? उस पर टैप करें।', iron_day_on: 'ली', iron_day_off: 'टिक नहीं',
        iron_rem: 'मुझे याद दिलाएँ', iron_rem_d: 'हर दिन, जब तक आप प्लान न रोकें।', iron_rem_w: 'हर {day}।', iron_time_ok: 'रिमाइंडर का समय बदल गया।',
        iron_left_h: 'पत्ते में बची गोलियाँ', iron_left_p: 'चाहें तो। नया पत्ता मिलने पर संख्या लिखें; हर टिक पर एक कम होगी।', iron_left_ph: 'जैसे 30', iron_left_save: 'सेव करें',
        iron_low: 'सिर्फ़ {n} गोलियाँ बचीं।', iron_low_ask: 'ख़त्म होने से पहले ASHA, ANM या आंगनवाड़ी से अगला पत्ता माँग लें।',
        iron_upset_h: 'अगर परेशानी हो', iron_help_h: 'कब मदद लें', iron_read: 'पढ़ें: लाल गोली, सफ़ेद गोली और दो टीके', iron_asha: 'मेरी ASHA या ANM',
        iron_stop: 'यह प्लान रोकें', iron_stop_q: 'यह प्लान रोकें? टिक किए दिन आपकी डायरी में रहेंगे।', iron_stop_yes: 'प्लान रोकें',
        iron_ended: 'आपका पिछला प्लान {d} को ख़त्म हुआ, {n} दिन गोली ली।', iron_ended_s: '{d} को रोका', iron_last30: 'पिछले 30 दिन: {n} दिन',
        iron_setup_preg: 'आयरन की गोलियाँ शुरू करें', iron_setup_preg_s: 'चौथे महीने से रोज़ एक, रिमाइंडर के साथ', iron_setup_post: 'डिलीवरी के बाद 180 दिन आयरन की गोलियाँ', iron_setup_post_s: 'रोज़ एक, रिमाइंडर के साथ',
        iron_home: 'आज की आयरन की गोली', iron_home_w: 'इस हफ़्ते की आयरन की गोली', iron_home_d: 'आज की गोली', iron_home_took_d: 'हो गया',
        iron_sources: 'स्रोत', iron_foot: 'एनीमिया मुक्त भारत में ASHA, ANM, आंगनवाड़ी या PHC से मुफ़्त। आपके टिक इसी फ़ोन पर रहते हैं।',
        iron_p_doc: 'आयरन की गोली कम हीमोग्लोबिन से बचाती है, पर भूलना आसान है, या परेशानी होने पर बंद कर देना। अपना प्लान चुनें: रोज़ एक टैप, एक रिमाइंडर, और मुश्किल हो तो मदद।',
        iron_low_ask_doc: 'ख़त्म होने से पहले अगला पत्ता केमिस्ट या डॉक्टर से ले लें।', iron_free_doc: 'सरकारी स्वास्थ्य केंद्रों पर मुफ़्त आयरन की गोलियाँ (एनीमिया मुक्त भारत)', iron_foot_doc: 'आपके टिक इसी फ़ोन पर रहते हैं।',
        iron_every_h: 'डॉक्टर ने कितनी बार लेने को कहा?', iron_e1: 'रोज़', iron_e2: 'एक दिन छोड़कर', iron_e7: 'हफ़्ते में एक बार', iron_rem_2: 'एक दिन छोड़कर, जब तक आप प्लान न रोकें।', iron_rest: 'आज गोली नहीं। अगली गोली कल है।'
      }
    },
    routes: { iron: render },
    tiles: [
      { section: 'tools', route: 'iron', title: 'iron_h', sub: 'iron_tile_s', icon: 'drop', order: 22, gated: false, keywords: 'iron ifa red tablet anaemia anemia hb haemoglobin hemoglobin khoon ki kami weekly tablet आयरन गोली लाल खून की कमी एनीमिया' },
      { section: 'preg', route: 'iron', title: 'iron_h', sub: 'iron_tile_s', icon: 'drop', order: 45, gated: false, keywords: 'iron ifa red tablet 180 days pregnancy आयरन गोली' },
      { section: 'post', route: 'iron', title: 'iron_h', sub: 'iron_tile_s', icon: 'drop', order: 45, gated: false, keywords: 'iron ifa 180 days after birth आयरन गोली' }
    ],
    today: today,
    setup: setup,
    summary: summary,
    sample: sample,
    css: '.iron-hd { gap: 12px; align-items: center; flex-wrap: nowrap; } .iron-hd h3 { margin: 0; } .iron-pic { width: 52px; height: 52px; flex-shrink: 0; border-radius: 14px; background: var(--peach-2); display: inline-flex; overflow: hidden; } .iron-pic svg { width: 100%; height: 100%; } .iron-today h2 { margin: 0; } .iron-bar { height: 10px; border-radius: 6px; background: var(--line); overflow: hidden; } .iron-bar i { display: block; height: 100%; background: var(--accent); border-radius: 6px; }' +
      '.iron-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; } .iron-day { display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 52px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--card); color: var(--muted); font: inherit; padding: 6px 0; }' +
      '.iron-day span { font-size: 12px; } .iron-day b { font-size: 15px; color: var(--fg); } .iron-day.on { background: var(--accent-soft); border: 2px solid var(--accent); color: var(--accent); font-weight: 600; }' +
      '.iron-ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; color: var(--fg); } .iron-plans .item span { white-space: normal; }' +
      '.iron-every { display: grid; gap: 8px; margin: 4px 0 8px; } .iron-every-h { margin: 0; font-weight: 600; color: var(--fg); }' 
  });
})(window.Saathi);
