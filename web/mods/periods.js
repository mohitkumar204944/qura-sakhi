/* Periods: a daily mood-and-body log lined up by cycle day (PMS / PMDD), period pain, delaying a period, pads and cups, myths, and fasting safely. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const ID = 'periods';

  /* ---------- data ---------- */
  /* Saved shape: state.mods.periods.log = { 'YYYY-MM-DD': { s: ['irritable', ...], impact: 'none'|'little'|'lot', at: 'YYYY-MM-DD' } } */
  const logR = () => { const m = S.state.mods && S.state.mods[ID]; return (m && m.log && typeof m.log === 'object') ? m.log : {}; };
  const logW = () => { const d = S.data(ID); if (!d.log || typeof d.log !== 'object') d.log = {}; return d.log; };
  const SYM = ['irritable', 'anxious', 'tearful', 'low', 'breasts', 'bloating', 'cravings', 'sleep', 'headache'];
  const IMPACT = ['none', 'little', 'lot'];
  /* Symptoms she already ticks in the core period log sheet that mean the same thing. */
  const CORE_MAP = { d_headache: 'headache', d_bloat: 'bloating', d_mood: 'low', d_sleep: 'sleep' };
  const mem = { date: null, draft: null };

  const h = (o) => esc(tx(o));
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const ul = (arr) => '<ul>' + arr.map((o) => '<li>' + h(o) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((o) => '<li>' + h(o) + '</li>').join('') + '</ol>';
  const linkItem = (route, icon, title, sub, pill) => '<button type="button" class="item" data-go="' + esc(route) + '"><span class="ico-sm">' + S.icon(icon) + '</span><span class="body"><strong>' + esc(title) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span>' + (pill ? '<span class="pill" style="flex-shrink:0">' + esc(pill) + '</span>' : '') + '</button>';
  const askCard = (topic, body) => '<div class="card dark"><h3>' + esc(t('qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + h(body) + '</p><button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none;align-self:flex-start" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button></div>';
  const intro = (o) => '<p class="small">' + h(o) + '</p>';

  /* ---------- cycle-day maths for the log ---------- */
  const startsU = () => uniq(S.cycle.starts());
  function cdOf(dateStr, st) {
    let s = null;
    for (let i = 0; i < st.length; i++) { if (st[i] <= dateStr) s = st[i]; else break; }
    return s ? { start: s, day: S.diffDays(S.fromISO(s), S.fromISO(dateStr)) + 1 } : null;
  }
  /* Her own entries, merged with matching ticks from the core period log (never written back). */
  function entries() {
    const out = {}; const log = logR();
    Object.keys(log).forEach((d) => {
      const e = log[d] || {};
      out[d] = { s: (e.s || []).filter((k) => SYM.indexOf(k) >= 0), impact: IMPACT.indexOf(e.impact) >= 0 ? e.impact : 'none' };
    });
    const daily = S.state.daily || {};
    Object.keys(daily).forEach((d) => {
      const mapped = (daily[d] || []).map((k) => CORE_MAP[k]).filter(Boolean);
      if (!mapped.length) return;
      const o = out[d] || (out[d] = { s: [], impact: 'none' });
      mapped.forEach((k) => { if (o.s.indexOf(k) < 0) o.s.push(k); });
    });
    return out;
  }
  const coreTicksUsed = () => { const daily = S.state.daily || {}; return Object.keys(daily).some((d) => (daily[d] || []).some((k) => !!CORE_MAP[k])); };
  function stats() {
    const st = startsU(); const ent = entries(); const dates = Object.keys(ent).sort();
    const last3 = st.slice(-3);
    const rows = SYM.concat(['little', 'lot']); const grid = {};
    rows.forEach((r) => { grid[r] = []; for (let i = 0; i <= 35; i++) grid[r].push(0); });
    let inCycles = 0, beyond = 0;
    dates.forEach((d) => {
      const c = cdOf(d, st); if (!c || last3.indexOf(c.start) < 0) return;
      inCycles++;
      if (c.day > 35) { beyond++; return; }
      const e = ent[d];
      e.s.forEach((k) => { grid[k][c.day]++; });
      if (e.impact === 'little') grid.little[c.day]++;
      if (e.impact === 'lot') grid.lot[c.day]++;
    });
    /* The 7 days before each of her last 3 period starts. */
    const pre = {}; SYM.forEach((k) => { pre[k] = 0; });
    let preWeeks = 0, preLot = 0;
    last3.forEach((s) => {
      const sd = S.fromISO(s); let any = false, lot = false;
      for (let k = 1; k <= 7; k++) {
        const e = ent[S.toISO(S.addDays(sd, -k))]; if (!e) continue;
        any = true; if (e.impact === 'lot') lot = true;
        e.s.forEach((x) => { pre[x]++; });
      }
      if (any) preWeeks++; if (lot) preLot++;
    });
    const top = SYM.map((k) => ({ k: k, n: pre[k] })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4);
    /* Shaded band: the 7 days before her usual next period, from her recent gaps. */
    let band = null, avg = null;
    const g = S.cycle.usable().slice(-3);
    if (g.length) {
      avg = Math.round(g.reduce((a, b) => a + b, 0) / g.length);
      const a = avg - 7, b = Math.min(35, avg - 1);
      if (a >= 1 && a <= 35 && b >= a) band = [a, b];
    }
    return { starts: st, last3: last3, grid: grid, inCycles: inCycles, beyond: beyond, total: dates.length, top: top, preWeeks: preWeeks, preLot: preLot, band: band, avg: avg };
  }

  /* ---------- hub ---------- */
  const SCREENS = [
    ['periods-pms', 'chart', 'periods_pms', 'periods_pms_s', true],
    ['periods-pain', 'heart', 'periods_pain', 'periods_pain_s', false],
    ['periods-products', 'drop', 'periods_products', 'periods_products_s', false],
    ['periods-myths', 'sparkle', 'periods_myths', 'periods_myths_s', false],
    ['periods-fasting', 'moon', 'periods_fasting', 'periods_fasting_s', false],
    ['periods-postpone', 'clock', 'periods_postpone', 'periods_postpone_s', false]
  ];
  function renderHub(v) {
    v.innerHTML = S.backRow(t('periods_hub'), 'care', false) +
      intro({ en: 'Practical help for the days of your period, and the signs that mean you should see a doctor.', hi: 'पीरियड के दिनों के लिए काम की बातें, और वे निशानियाँ जिनमें डॉक्टर को दिखाना चाहिए।' }) +
      '<div class="list">' + SCREENS.map((x) => linkItem(x[0], x[1], t(x[2]), t(x[3]), x[4] ? t('gated_short') : '')).join('') + '</div>' +
      '<div class="card"><h3 style="color:var(--accent)">' + esc(t('see_doctor')) + '</h3>' +
      '<div class="flag urgent"><span><strong>' + esc(t('call_now')) + ':</strong> ' + esc(t('s1b')) + '</span></div>' +
      '<div class="flag"><span><strong>' + esc(t('today_if')) + ':</strong> ' + esc(t('s2a')) + '</span></div>' +
      '<div class="periods-urg">' + esc(t('week_if')) + '</div><ul>' + ['s4a', 's4b'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul>' +
      '<div class="periods-urg">' + esc(t('weeks2')) + '</div><ul><li>' + esc(t('s3b')) + '</li></ul>' +
      '<button type="button" class="btn sm primary" style="align-self:flex-start" data-ask="">' + S.I.steth + ' ' + esc(t('doc_b')) + '</button></div>' +
      '<h2>' + h({ en: 'Related', hi: 'इससे जुड़े पन्ने' }) + '</h2><div class="list">' +
      linkItem('teen-first', 'flower', tx({ en: 'First period', hi: 'पहला पीरियड' }), tx({ en: 'For girls and their parents', hi: 'लड़कियों और उनके माता-पिता के लिए' })) +
      linkItem('access-schemes-period', 'map', tx({ en: 'Free and low-cost pads', hi: 'मुफ़्त और सस्ते pad' }), tx({ en: 'Government schemes and where to ask', hi: 'सरकारी योजनाएँ और कहाँ पूछें' })) +
      linkItem('cond-anaemia', 'drop', tx({ en: 'Heavy periods and anaemia', hi: 'भारी पीरियड और ख़ून की कमी' }), tx({ en: 'Tired, breathless or pale? Ask for an Hb test', hi: 'थकान, साँस फूलना या पीलापन? Hb जाँच कराएँ' })) +
      (S.canSave() ? linkItem('diary', 'diary', tx({ en: 'Log a period', hi: 'पीरियड दर्ज करें' }), tx({ en: 'Dates, flow and pain, in your diary', hi: 'तारीख़, ब्लीडिंग और दर्द, आपकी डायरी में' })) : '') +
      '</div>';
    S.wire(v);
  }

  /* ---------- mood and body through the cycle (PMS / PMDD) ---------- */
  function gridHTML(st) {
    const cols = (cls, fn) => { let s = ''; for (let d = 1; d <= 35; d++) s += fn(d); return s; };
    const rowsHTML = SYM.concat(['little', 'lot']).map((k, ri) => {
      const sep = ri === SYM.length ? ' sep' : '';
      return '<span class="lbl' + sep + '">' + esc(t('periods_g_' + k)) + '</span>' + cols('c', (d) => {
        const n = Math.min(3, st.grid[k][d]);
        return '<span class="c periods-c' + n + sep + '"' + (n ? ' title="' + esc(t('periods_day') + ' ' + d + ': ' + n) + '"' : '') + '></span>';
      });
    }).join('');
    const cd = S.cycle.cycleDay();
    const band = st.band ? '<div class="periods-grid periods-sub"><span class="lbl small">' + esc(t('periods_band_lbl')) + '</span><span class="band" style="grid-column:' + (st.band[0] + 1) + ' / ' + (st.band[1] + 2) + '"></span></div>' : '';
    const todayRow = cd && cd <= 35 ? '<div class="periods-grid periods-sub"><span class="lbl small">' + esc(t('today_l')) + '</span><span class="dot" style="grid-column:' + (cd + 1) + '"></span></div>' : '';
    const dayRow = '<div class="periods-grid periods-sub"><span class="lbl small">' + esc(t('periods_day')) + '</span>' + cols('dn', (d) => '<span class="dn num">' + ([1, 7, 14, 21, 28, 35].indexOf(d) >= 0 ? d : '') + '</span>') + '</div>';
    return '<div class="periods-grid" role="group" aria-label="' + esc(t('periods_grid_h')) + '">' + rowsHTML + '</div>' + band + todayRow + dayRow;
  }
  function renderPMS(v) {
    const can = S.canSave(); const td = S.toISO(S.today()); const sit = S.state.situation || {};
    if (!mem.date || mem.date > td) mem.date = td;
    const log = logR();
    if (!mem.draft || mem.draft.date !== mem.date) { const e = log[mem.date]; mem.draft = { date: mem.date, s: e ? (e.s || []).filter((k) => SYM.indexOf(k) >= 0) : [], impact: e && IMPACT.indexOf(e.impact) >= 0 ? e.impact : 'none' }; }
    const dr = mem.draft; const exists = !!log[mem.date];
    const st = stats(); const c = cdOf(mem.date, st.starts);
    const off = S.cycle.countsOff();

    let offNote = '';
    if (sit.pregnant) offNote = '<div class="card soft"><p class="small">' + h({ en: 'Under "My situation" you said you are pregnant, so there are no cycles to line up. Mood changes in pregnancy matter too: tell your doctor or ANM at your next check-up.', hi: '"मेरी स्थिति" में आपने बताया है कि आप गर्भवती हैं, इसलिए चक्र के हिसाब से दिखाने को कुछ नहीं है। गर्भ में मन के बदलाव भी मायने रखते हैं: अगली जाँच पर डॉक्टर या ANM को बताएँ।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="preg-symptoms">' + h({ en: 'Pregnancy symptoms', hi: 'गर्भावस्था के लक्षण' }) + '</button></div>';
    else if (sit.breastfeeding) offNote = '<div class="card soft"><p class="small">' + h({ en: 'While you breastfeed, periods often stay away for a while, so there is nothing to line up yet. Low mood after having a baby is common and needs care of its own.', hi: 'स्तनपान के दौरान पीरियड अक्सर कुछ समय नहीं आते, इसलिए अभी चक्र के हिसाब से दिखाने को कुछ नहीं। डिलीवरी के बाद मन उदास रहना आम है, और इसकी अलग से देखभाल ज़रूरी है।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="post-mood">' + h({ en: 'Mood after birth', hi: 'जन्म के बाद मन' }) + '</button></div>';
    else if (S.cycle.afterBirth && S.cycle.afterBirth()) offNote = '<div class="card soft"><p class="small">' + h({ en: 'Your periods have not come back since the birth, so there is nothing to line up yet. Log the first one when it comes. Low mood after having a baby is common and needs care of its own.', hi: 'डिलीवरी के बाद पीरियड अभी लौटे नहीं हैं, इसलिए अभी चक्र के हिसाब से दिखाने को कुछ नहीं। पहला पीरियड आए तो उसे दर्ज करें। डिलीवरी के बाद मन उदास रहना आम है, और इसकी अलग से देखभाल ज़रूरी है।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="post-mood">' + h({ en: 'Mood after birth', hi: 'जन्म के बाद मन' }) + '</button></div>';
    else if (sit.hysterectomy) offNote = '<div class="card soft"><p class="small">' + h({ en: 'With no periods there is nothing to line up. If your ovaries were kept, monthly mood changes can continue: keep logging daily and show your doctor.', hi: 'पीरियड न होने से चक्र के हिसाब से दिखाने को कुछ नहीं। अगर अंडाशय (ovaries) नहीं निकाले गए, तो हर महीने मन के बदलाव चलते रह सकते हैं: फिर भी रोज़ दर्ज करें और डॉक्टर को दिखाएँ।' }) + '</p></div>';

    const form = can ? '<div class="card" id="pms-form"><h2>' + esc(t('periods_log_h')) + '</h2>' +
      '<div class="row spread"><label for="pms-date">' + esc(t('on_date')) + '</label>' + (c && !off ? '<span class="pill muted">' + esc(t('cycle_day')) + ' ' + c.day + '</span>' : '') + '</div>' +
      '<input type="date" id="pms-date" value="' + esc(mem.date) + '" max="' + esc(td) + '">' +
      '<div class="chips" role="group" aria-label="' + esc(t('periods_log_h')) + '">' + SYM.map((k) => '<button type="button" class="chip' + (dr.s.indexOf(k) >= 0 ? ' on' : '') + '" data-sym="' + k + '" aria-pressed="' + (dr.s.indexOf(k) >= 0) + '">' + esc(t('periods_sym_' + k)) + '</button>').join('') + '</div>' +
      '<label>' + esc(t('periods_imp_q')) + '</label><div class="grid3">' + IMPACT.map((k) => '<button type="button" class="btn sm' + (dr.impact === k ? ' on' : '') + '" data-imp="' + k + '">' + esc(t('periods_imp_' + k)) + '</button>').join('') + '</div>' +
      (exists ? '<p class="small">' + esc(t('periods_has_entry')) + '</p>' : '') +
      '<button type="button" class="btn primary block" id="pms-save">' + esc(t('save')) + '</button>' +
      (exists ? '<button type="button" class="btn ghost sm" id="pms-del">' + esc(t('periods_del')) + '</button>' : '') +
      '<p class="small">' + esc(t('periods_log_p')) + '</p></div>' : S.needDiary();

    let gridCard = '';
    if (can && !off) {
      if (!st.starts.length) gridCard = '<div class="card"><h2>' + esc(t('periods_grid_h')) + '</h2><p class="small">' + esc(t('periods_no_starts')) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="diary">' + esc(t('diary')) + '</button></div>';
      else {
        gridCard = '<div class="card periods-gridcard"><h2>' + esc(t('periods_grid_h')) + '</h2><p class="small">' + esc(t('periods_grid_p')) + '</p>' + gridHTML(st) +
          '<div class="row wrap small periods-legend"><span>' + esc(t('periods_legend')) + '</span>' + [0, 1, 2, 3].map((n) => '<span class="row" style="gap:4px"><i class="periods-sw periods-c' + n + '"></i><span class="num">' + n + '</span></span>').join('') + '</div>' +
          (st.band ? '<p class="small"><span class="periods-sw periods-bandsw"></span> ' + esc(tf('periods_band', { n: st.avg })) + '</p>' : '') +
          (!st.inCycles ? '<p class="small" style="color:var(--fg)">' + esc(t('periods_no_logs')) + '</p>' : '') +
          (st.beyond ? '<p class="small">' + esc(tf('periods_beyond', { n: st.beyond })) + '</p>' : '') +
          (coreTicksUsed() ? '<p class="small">' + esc(t('periods_core_note')) + '</p>' : '') + '</div>';
      }
    }
    const countsCard = can && st.inCycles ? '<div class="card"><h2>' + esc(t('periods_counts_h')) + '</h2><dl class="kv"><dt>' + esc(t('periods_days_logged')) + '</dt><dd>' + st.inCycles + '</dd><dt>' + esc(t('periods_pre_weeks')) + '</dt><dd>' + st.preWeeks + '</dd><dt>' + esc(t('periods_pre_lot')) + '</dt><dd>' + st.preLot + '</dd></dl>' +
      '<div class="small" style="color:var(--fg);font-weight:600">' + esc(t('periods_week_before')) + '</div><div class="row wrap" style="gap:6px">' + (st.top.length ? st.top.map((x) => '<span class="pill accent">' + esc(t('periods_g_' + x.k)) + ' ×' + x.n + '</span>').join('') : '<span class="small">' + esc(t('periods_none_yet')) + '</span>') + '</div>' +
      '<p class="footnote">' + esc(t('periods_noscore')) + '</p></div>' : '';

    const explain = '<div class="card"><h2>' + h({ en: 'PMS or PMDD?', hi: 'PMS या PMDD?' }) + '</h2>' +
      '<h3 class="periods-sub-h">PMS</h3>' +
      '<p>' + h({ en: 'PMS means body and mood changes in the 1–2 weeks before a period: irritability, low mood, sore breasts, bloating, cravings, headache, tiredness. They usually ease once bleeding starts. Many women have some PMS.', hi: 'PMS यानी पीरियड से पहले के 1–2 हफ़्तों में शरीर और मन के बदलाव: चिड़चिड़ापन, उदासी, स्तनों में दर्द, पेट फूलना, कुछ ख़ास खाने की तलब, सिरदर्द, थकान। ब्लीडिंग शुरू होने पर ये अक्सर कम हो जाते हैं। बहुत सी महिलाओं को थोड़ा-बहुत PMS होता है।' }) + '</p>' +
      '<p class="small">' + h({ en: 'What helps many women: regular exercise, enough sleep, small meals every 2–3 hours, yoga or slow breathing when stress builds, and staying off smoking and alcohol. Paracetamol or ibuprofen can ease headache and sore breasts.', hi: 'बहुत सी महिलाओं को इनसे मदद मिलती है: रोज़ कसरत, पूरी नींद, हर 2–3 घंटे में थोड़ा-थोड़ा खाना, तनाव बढ़े तो योग या धीमी साँसें, और धूम्रपान व शराब से दूरी। सिरदर्द और स्तनों के दर्द में paracetamol या ibuprofen से आराम मिल सकता है।' }) + '</p>' +
      '<h3 class="periods-sub-h">PMDD</h3>' +
      '<p>' + h({ en: 'PMDD is a severe form of PMS. Anger, anxiety, hopelessness or feeling out of control get strong enough to hurt your work, studies or relationships, then lift within a few days of the period starting. It is a medical condition, and it has nothing to do with being weak or bad-tempered.', hi: 'PMDD इसका गंभीर रूप है। ग़ुस्सा, घबराहट, निराशा या ख़ुद पर क़ाबू न रहना इतना बढ़ जाता है कि काम, पढ़ाई या रिश्तों पर असर पड़ता है, और पीरियड शुरू होने के कुछ दिनों में यह उतर जाता है। यह एक बीमारी है। इसका कमज़ोरी या बुरे स्वभाव से कोई लेना-देना नहीं।' }) + '</p>' +
      '<p class="small">' + h({ en: 'No blood test shows PMDD. A doctor decides from daily ratings kept for at least two cycles in a row, and checks for other causes such as thyroid problems or depression. This log can be those daily ratings: fill it every day, good days too, and take it with you.', hi: 'PMDD किसी ख़ून की जाँच में नहीं दिखता। डॉक्टर कम से कम लगातार दो चक्रों की रोज़ की entries देखकर तय करती हैं, और दूसरे कारण भी जाँचती हैं, जैसे थायरॉइड या डिप्रेशन। यह डायरी वही रोज़ की entries बन सकती है: हर दिन भरें, अच्छे दिन भी, और डॉक्टर के पास साथ ले जाएँ।' }) + '</p>' +
      '<p class="small">' + h({ en: 'Treatment can include talking therapy (CBT), some antidepressants (SSRIs) or hormone medicines. These are prescribed by an MBBS doctor, psychiatrist or gynaecologist. A Qura doctor helps with sleep, food and exercise, and refers you.', hi: 'इलाज में बातचीत वाली थेरेपी (CBT), कुछ antidepressant दवाएँ (SSRI) या हॉर्मोन की दवाएँ हो सकती हैं। ये दवाएँ MBBS डॉक्टर, psychiatrist या gynaecologist लिखते हैं। Qura की डॉक्टर नींद, खाने और कसरत में मदद करती हैं, और आगे refer करती हैं।' }) + '</p>' +
      '<p class="footnote" style="text-align:left">' + h({ en: 'Not a diagnosis. Sources: RCOG, NHS.', hi: 'यह diagnosis नहीं है। स्रोत: RCOG, NHS।' }) + '</p></div>';

    const doctor = '<div class="card warn"><h3>' + h({ en: 'See a doctor within 2 weeks if', hi: '2 हफ़्ते के अंदर डॉक्टर को दिखाएँ अगर' }) + '</h3>' +
      ul([{ en: 'In most cycles, the week before your period stops you working, studying or looking after your family, or strains your relationships', hi: 'ज़्यादातर चक्रों में पीरियड से पहले का हफ़्ता आपका काम, पढ़ाई या घर सँभालना रोक देता है, या रिश्तों में तनाव लाता है' },
        { en: 'You feel low or anxious most days of the month, not only before your period', hi: 'आप महीने के ज़्यादातर दिन उदास या घबराई रहती हैं, सिर्फ़ पीरियड से पहले नहीं' }]) +
      '<p class="small">' + h({ en: 'Where to go: the gynaecology or psychiatry OPD at a government hospital. Take this log with you. If you need to talk to someone now, Tele-MANAS 14416 is free, day and night.', hi: 'कहाँ जाएँ: सरकारी अस्पताल की gynaecology या psychiatry OPD। यह डायरी साथ ले जाएँ। अभी किसी से बात करनी हो तो Tele-MANAS 14416 मुफ़्त है, दिन-रात।' }) + '</p>' +
      '<div class="flag urgent"><span>' + esc(t('s6b')) + '</span></div></div>';

    v.innerHTML = S.backRow(t('periods_pms'), 'periods', true) +
      intro({ en: 'Log how you feel each day, especially in the 1–2 weeks before your period. After 2–3 cycles you and your doctor can see whether it follows your cycle.', hi: 'हर दिन लिखें कि आप कैसा महसूस करती हैं, ख़ासकर पीरियड से पहले के 1–2 हफ़्ते। 2–3 चक्र बाद आप और आपकी डॉक्टर देख सकेंगी कि यह आपके चक्र के साथ चलता है या नहीं।' }) +
      offNote + form + gridCard + countsCard + explain + doctor +
      askCard({ en: 'Mood and body before periods (PMS / PMDD)', hi: 'पीरियड से पहले मन और शरीर (PMS / PMDD)' }, { en: 'Bring this log to a free call. A Qura doctor goes through it with you and tells you where to go next.', hi: 'यह डायरी लेकर मुफ़्त कॉल पर आएँ। Qura की डॉक्टर इसे आपके साथ देखेंगी और बताएँगी कि आगे कहाँ जाएँ।' });
    S.wire(v);
    if (!can) return;
    v.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.sym; const i = mem.draft.s.indexOf(k);
      if (i >= 0) mem.draft.s.splice(i, 1); else mem.draft.s.push(k);
      b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', String(i < 0));
    }));
    v.querySelectorAll('[data-imp]').forEach((b) => b.addEventListener('click', () => {
      mem.draft.impact = b.dataset.imp; v.querySelectorAll('[data-imp]').forEach((x) => x.classList.toggle('on', x === b));
    }));
    const di = v.querySelector('#pms-date');
    if (di) di.addEventListener('change', () => { const val = di.value; if (val && val <= td) { mem.date = val; mem.draft = null; S.render(); } });
    const sv = v.querySelector('#pms-save');
    if (sv) sv.addEventListener('click', () => {
      logW()[mem.date] = { s: SYM.filter((k) => mem.draft.s.indexOf(k) >= 0), impact: mem.draft.impact, at: td };
      S.save(); S.toast(tf('periods_saved_day', { d: S.fmtD(S.fromISO(mem.date)) })); S.render();
    });
    const del = v.querySelector('#pms-del');
    if (del) del.addEventListener('click', () => { delete logW()[mem.date]; mem.draft = null; S.save(); S.toast(t('periods_deleted')); S.render(); });
  }

  /* ---------- period pain ---------- */
  function renderPain(v) {
    const helps = [
      ['heart', { en: 'Heat', hi: 'सेंक' }, { en: 'A hot water bottle or heat pad on your lower belly or back, wrapped in a cloth so it does not burn. A warm bath or shower helps too.', hi: 'पेट के निचले हिस्से या कमर पर गर्म पानी की बोतल या heat pad, कपड़े में लपेटकर ताकि जले नहीं। गुनगुने पानी से नहाने से भी आराम मिलता है।' }],
      ['leaf', { en: 'Movement', hi: 'हल्की कसरत' }, { en: 'Walking, gentle yoga, stretching or cycling. Moving often eases cramps, even when you do not feel like it.', hi: 'टहलना, हल्का योग, स्ट्रेचिंग या साइकिल। हिलने-डुलने से अक्सर ऐंठन कम होती है, मन न हो तब भी।' }],
      ['moon', { en: 'Rest and massage', hi: 'आराम और मालिश' }, { en: 'Lie on your side with your knees bent, or on your back with a pillow under your knees. Rub your belly and lower back gently in circles.', hi: 'करवट लेकर घुटने मोड़कर लेटें, या पीठ के बल घुटनों के नीचे तकिया रखकर। पेट और कमर पर हल्के हाथ से गोल-गोल मालिश करें।' }],
      ['pill', { en: 'Pain relief medicine', hi: 'दर्द की दवा' }, { en: 'Doctors commonly suggest ibuprofen or mefenamic acid, or paracetamol if you cannot take those. Take it as the pack or your doctor says, with or after food. Jan Aushadhi Kendras sell generic medicines for much less.', hi: 'डॉक्टर अक्सर ibuprofen या mefenamic acid बताते हैं; ये न ले सकें तो paracetamol। पैकेट पर लिखे या डॉक्टर के बताए तरीक़े से, खाने के साथ या बाद में लें। जन औषधि केंद्र पर generic दवाएँ काफ़ी सस्ती मिलती हैं।' }]
    ];
    v.innerHTML = S.backRow(t('periods_pain'), 'periods', false) +
      intro({ en: 'Cramps in the lower belly, back or thighs usually start just before or with your period and last up to 3 days. Pain that stops your day is not something you have to put up with.', hi: 'पेट के निचले हिस्से, कमर या जाँघों में ऐंठन अक्सर पीरियड से ठीक पहले या उसके साथ शुरू होती है और 3 दिन तक रहती है। जो दर्द आपका दिन रोक दे, उसे सहते रहना ज़रूरी नहीं।' }) +
      '<h2>' + h({ en: 'What helps', hi: 'किससे आराम मिलता है' }) + '</h2><div class="list">' + helps.map((x) => '<div class="item quiet"><span class="ico-sm">' + S.icon(x[0]) + '</span><span class="body"><strong>' + h(x[1]) + '</strong><span>' + h(x[2]) + '</span></span></div>').join('') + '</div>' +
      '<p class="note">' + h({ en: 'Ask a pharmacist or doctor before ibuprofen or mefenamic acid if you have had a stomach ulcer, have asthma, kidney, liver or heart disease, or could be pregnant. If a painkiller gives you a rash, swelling or fever, stop it and see a doctor.', hi: 'अगर कभी पेट में अल्सर हुआ हो, दमा (asthma), किडनी, लिवर या दिल की बीमारी हो, या गर्भ की संभावना हो, तो ibuprofen या mefenamic acid से पहले फ़ार्मासिस्ट या डॉक्टर से पूछें। दर्द की दवा से दाने, सूजन या बुख़ार हो तो दवा बंद करें और डॉक्टर को दिखाएँ।' }) + '</p>' +
      '<div class="card warn"><h3>' + h({ en: 'Not normal: see a doctor this week if you have', hi: 'यह सामान्य नहीं: इसी हफ़्ते डॉक्टर को दिखाएँ, अगर ये हों' }) + '</h3>' +
      ul([{ en: 'Pain that stops your work, school or housework, even after medicine', hi: 'ऐसा दर्द जो दवा के बाद भी आपका काम, स्कूल या घर का काम रोक दे' },
        { en: 'Pain or bleeding between periods', hi: 'दो पीरियड के बीच दर्द या ब्लीडिंग' },
        { en: 'Fever or a bad-smelling discharge with the pain: go today, not this week', hi: 'दर्द के साथ बुखार या बदबूदार सफ़ेद पानी: इस हफ़्ते नहीं, आज ही जाएँ' },
        { en: 'Pain during or after sex, or when passing stool or urine', hi: 'संबंध के दौरान या बाद में दर्द, या शौच या पेशाब करते समय दर्द' },
        { en: 'Pain that has got worse over the years, or periods that became heavier or irregular', hi: 'सालों में बढ़ता गया दर्द, या पीरियड जो ज़्यादा भारी या अनियमित हो गए' },
        { en: 'A swollen belly, losing weight without trying, or changes in your stool or urine habits', hi: 'पेट फूला रहना, बिना कोशिश वज़न घटना, या शौच या पेशाब की आदत में बदलाव' }]) +
      '<p class="small">' + h({ en: 'Possible causes include endometriosis, adenomyosis, fibroids or an infection (PID). This list is not a diagnosis. Go to the gynaecology OPD at a government hospital, where it costs little or nothing, and take your diary.', hi: 'इसके कारण endometriosis, adenomyosis, fibroids या संक्रमण (PID) हो सकते हैं। यह सूची diagnosis नहीं है। सरकारी अस्पताल की gynaecology OPD में दिखाएँ, जहाँ ख़र्च बहुत कम या न के बराबर होता है, और अपनी डायरी साथ ले जाएँ।' }) + '</p>' +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="cond-endo">' + h({ en: 'Keep a pain diary for the doctor', hi: 'डॉक्टर के लिए दर्द की डायरी रखें' }) + '</button></div>' +
      '<div class="card dark"><h3>' + esc(t('call_now')) + '</h3><ul><li>' + esc(t('s1a')) + '</li><li>' + esc(t('s1b')) + '</li></ul></div>' +
      '<div class="flag"><span><strong>' + esc(t('today_if')) + ':</strong> ' + esc(t('s2b')) + h({ en: '. ', hi: '। ' }) + h({ en: 'Or pain far worse than your usual period pain that medicine does not ease.', hi: 'या दर्द आपके आम पीरियड दर्द से बहुत ज़्यादा हो और दवा से भी कम न हो।' }) + '</span></div>' +
      (S.canSave() ? '<div class="card soft"><p class="small">' + h({ en: 'Log pain each time you log a period. Over a few months the diary shows your doctor how bad it gets and for how long.', hi: 'हर बार पीरियड दर्ज करते समय दर्द भी दर्ज करें। कुछ महीनों में डायरी डॉक्टर को दिखाती है कि दर्द कितना और कितने दिन रहता है।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="diary">' + esc(t('diary')) + '</button></div>' : '') +
      askCard({ en: 'Period pain', hi: 'पीरियड का दर्द' }, { en: 'A Qura doctor can go through your pain diary with you, suggest tests and refer you to a gynaecologist.', hi: 'Qura की डॉक्टर आपकी दर्द की डायरी आपके साथ देख सकती हैं, जाँच बता सकती हैं और gynaecologist के पास refer कर सकती हैं।' });
    S.wire(v);
  }

  /* ---------- delaying a period ---------- */
  function renderPostpone(v) {
    v.innerHTML = S.backRow(t('periods_postpone'), 'periods', false) +
      intro({ en: 'Want your period to stay away for a wedding, a festival, an exam or a pilgrimage? It can be done, but only with a doctor\'s prescription and some planning.', hi: 'शादी, त्योहार, परीक्षा या तीर्थ यात्रा के समय पीरियड टालना चाहती हैं? यह हो सकता है, पर सिर्फ़ डॉक्टर के पर्चे से और पहले से योजना बनाकर।' }) +
      '<div class="card"><h2>' + h({ en: 'How it works', hi: 'यह कैसे होता है' }) + '</h2>' +
      '<p>' + h({ en: 'A doctor can prescribe a hormone tablet, most often norethisterone, that holds the period back while you take it. It has to start at least 3 days before the period is due, and it is stopped after the event.', hi: 'डॉक्टर एक हॉर्मोन की गोली लिख सकती हैं, ज़्यादातर norethisterone, जो जब तक आप लेती हैं तब तक पीरियड रोके रखती है। इसे पीरियड की तारीख़ से कम से कम 3 दिन पहले शुरू करना होता है, और मौक़ा निकल जाने के बाद बंद किया जाता है।' }) + '</p>' +
      '<p class="small">' + h({ en: 'It is not contraception. If you do not want a pregnancy, use condoms or your usual method.', hi: 'यह गर्भनिरोधक नहीं है। गर्भ नहीं चाहतीं तो condom या अपना सामान्य तरीक़ा इस्तेमाल करें।' }) + '</p>' +
      '<p class="note">' + h({ en: 'An MBBS doctor or gynaecologist prescribes this, at a government hospital OPD or a clinic. Qura\'s doctors are BAMS: they can talk it through with you and refer you.', hi: 'यह दवा MBBS डॉक्टर या gynaecologist लिखते हैं, सरकारी अस्पताल की OPD में या क्लिनिक में। Qura की डॉक्टर BAMS हैं: वे आपसे बात करके आपको refer कर सकती हैं।' }) + '</p></div>' +
      '<div class="card"><h2>' + h({ en: 'Plan it', hi: 'योजना ऐसे बनाएँ' }) + '</h2>' +
      steps([{ en: 'See a doctor 2–3 weeks before the event.', hi: 'मौक़े से 2–3 हफ़्ते पहले डॉक्टर को दिखाएँ।' },
        { en: 'Take your diary. The dates of your last few periods help her work out when to start.', hi: 'अपनी डायरी साथ ले जाएँ। पिछले कुछ पीरियड की तारीख़ों से डॉक्टर तय करती हैं कि गोली कब शुरू करनी है।' },
        { en: 'Tell her about all your medicines, and any past blood clot, migraine, high BP or liver problem.', hi: 'अपनी सारी दवाओं के बारे में बताएँ, और अगर कभी ख़ून का थक्का, माइग्रेन, हाई BP या लिवर की तकलीफ़ रही हो तो वह भी।' },
        { en: 'Take the tablets exactly as she writes. Do not change the plan on your own.', hi: 'गोलियाँ ठीक वैसे ही लें जैसे डॉक्टर ने लिखा है। अपने मन से बदलाव न करें।' }]) + '</div>' +
      '<div class="card warn"><h3>' + h({ en: 'Do not buy these tablets from a chemist on your own', hi: 'ये गोलियाँ अपने मन से केमिस्ट से न ख़रीदें' }) + '</h3>' +
      '<p class="small" style="color:var(--fg)">' + h({ en: 'Hormone tablets are not right for everyone and can raise the chance of a blood clot in some women. The doctor checks first. Tell her if you:', hi: 'हॉर्मोन की गोलियाँ हर किसी के लिए ठीक नहीं होतीं, और कुछ महिलाओं में ख़ून का थक्का बनने का ख़तरा बढ़ा सकती हैं। डॉक्टर पहले जाँचती हैं। उन्हें ज़रूर बताएँ अगर आप:' }) + '</p>' +
      ul([{ en: 'might already be pregnant', hi: 'पहले से गर्भवती हो सकती हैं' },
        { en: 'have had a blood clot in a leg or lung, a heart attack or a stroke', hi: 'कभी पैर या फेफड़े में ख़ून का थक्का, दिल का दौरा या लकवा (stroke) हुआ हो' },
        { en: 'have liver disease', hi: 'लिवर की बीमारी है' },
        { en: 'get migraines or have high BP', hi: 'माइग्रेन होता है या BP ज़्यादा रहता है' },
        { en: 'have bleeding that no one has explained yet', hi: 'ऐसी ब्लीडिंग है जिसकी वजह अभी पता नहीं' }]) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'What to expect', hi: 'क्या उम्मीद रखें' }) + '</h2>' +
      ul([{ en: 'Some spotting can happen while you take it. Tell your doctor about anything that worries you.', hi: 'गोली लेते समय थोड़े धब्बे (spotting) आ सकते हैं। जो भी परेशान करे, डॉक्टर को बताएँ।' },
        { en: 'After the last tablet, the period usually comes within 3 days.', hi: 'आख़िरी गोली के बाद पीरियड अक्सर 3 दिन के अंदर आ जाता है।' },
        { en: 'No period a week after stopping? Do a pregnancy test and tell your doctor.', hi: 'गोली बंद करने के एक हफ़्ते बाद भी पीरियड नहीं आया? pregnancy test करें और डॉक्टर को बताएँ।' },
        { en: 'Already on a combined pill such as Mala‑N? Ask your doctor whether you can skip the 7 iron tablets at the end of the strip and start the next strip straight away.', hi: 'पहले से Mala‑N जैसी combined pill ले रही हैं? डॉक्टर से पूछें कि क्या पत्ते के आख़िर की 7 आयरन की गोलियाँ छोड़कर सीधे अगला पत्ता शुरू कर सकती हैं।' }]) +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="pregtest-when">' + h({ en: 'When to do a pregnancy test', hi: 'pregnancy test कब करें' }) + '</button>' +
      '<p class="footnote" style="text-align:left">' + h({ en: 'Source: NHS Specialist Pharmacy Service.', hi: 'स्रोत: NHS Specialist Pharmacy Service।' }) + '</p></div>' +
      '<div class="card ok"><p class="small" style="color:var(--ok)">' + h({ en: 'A period need not keep you from a festival, an exam or a journey. Many women simply plan pads or a cup instead, and that is a fine choice too.', hi: 'पीरियड की वजह से त्योहार, परीक्षा या यात्रा छोड़ने की ज़रूरत नहीं। बहुत सी महिलाएँ बस pad या cup की तैयारी कर लेती हैं, और यह भी बिलकुल ठीक है।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="periods-products">' + esc(t('periods_products')) + '</button></div>' +
      askCard({ en: 'Delaying a period for an event', hi: 'किसी मौक़े के लिए पीरियड टालना' }, { en: 'Not sure it suits you? Talk it through on a free call. A Qura doctor looks at your dates and refers you to a doctor who can prescribe.', hi: 'पक्का नहीं कि यह आपके लिए ठीक है? मुफ़्त कॉल पर बात करें। Qura की डॉक्टर आपकी तारीख़ें देखकर ऐसे डॉक्टर के पास refer करती हैं जो दवा लिख सकें।' });
    S.wire(v);
  }

  /* ---------- pads, cups and more ---------- */
  function renderProducts(v) {
    const jumps = [['pp-pads', 'periods_j_pads'], ['pp-cloth', 'periods_j_cloth'], ['pp-cup', 'periods_j_cup'], ['pp-tampon', 'periods_j_tampon'], ['pp-under', 'periods_j_under'], ['pp-bin', 'periods_j_bin']];
    const sec = (id, title, inner, cls) => '<section class="card periods-sec' + (cls ? ' ' + cls : '') + '" id="' + id + '"><h2>' + h(title) + '</h2>' + inner + '</section>';
    const rows = [
      [{ en: 'Pad or cloth pad', hi: 'Pad या कपड़े का pad' }, { en: 'Every few hours, even on light days; sooner when heavy', hi: 'हर कुछ घंटे में, हल्के दिनों में भी; ज़्यादा ब्लीडिंग में और जल्दी' }],
      [{ en: 'Cup', hi: 'Cup' }, { en: 'Empty every 8–12 hours, or sooner if the brand says so', hi: 'हर 8–12 घंटे में खाली करें, या brand कम समय बताए तो उतने में' }],
      [{ en: 'Tampon', hi: 'Tampon' }, { en: 'Every 4–8 hours; never more than 8', hi: 'हर 4–8 घंटे में; 8 से ज़्यादा कभी नहीं' }],
      [{ en: 'Period underwear', hi: 'पीरियड अंडरवियर' }, { en: 'As the brand says', hi: 'brand के बताए अनुसार' }]
    ];
    v.innerHTML = S.backRow(t('periods_products'), 'periods', false) +
      intro({ en: 'Use what suits your body, your budget and the water you have. Whatever you use, wash your hands before and after, and change on time.', hi: 'वह चुनें जो आपके शरीर, बजट और पानी की सुविधा के हिसाब से ठीक हो। जो भी इस्तेमाल करें, पहले और बाद में हाथ धोएँ, और समय पर बदलें।' }) +
      '<div class="chips">' + jumps.map((j) => '<button type="button" class="chip" data-jump="' + j[0] + '">' + esc(t(j[1])) + '</button>').join('') + '</div>' +
      '<div class="card"><h2>' + h({ en: 'How often to change', hi: 'कितनी देर में बदलें' }) + '</h2><div class="table-wrap"><table><thead><tr><th>' + h({ en: 'What you use', hi: 'क्या इस्तेमाल करती हैं' }) + '</th><th>' + h({ en: 'Change or empty', hi: 'कब बदलें या खाली करें' }) + '</th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td style="color:var(--fg);font-weight:600">' + h(r[0]) + '</td><td>' + h(r[1]) + '</td></tr>').join('') + '</tbody></table></div><p class="footnote" style="text-align:left">' + h({ en: 'Source: US FDA guidance on pads, cups and tampons.', hi: 'स्रोत: pad, cup और tampon पर US FDA की जानकारी।' }) + '</p></div>' +
      sec('pp-pads', { en: 'Pads', hi: 'Pad (सैनिटरी नैपकिन)' },
        ul([{ en: 'Change every few hours, even on light days, and sooner when the flow is heavy. Do not wear one pad all day.', hi: 'हर कुछ घंटे में बदलें, हल्के दिनों में भी, और ज़्यादा ब्लीडिंग में और जल्दी। एक ही pad पूरे दिन न पहनें।' },
          { en: 'Jan Aushadhi "Suvidha" pads cost ₹1 a pad at Jan Aushadhi Kendras. The Jan Aushadhi Sugam app shows the nearest Kendra.', hi: 'जन औषधि केंद्रों पर "Suvidha" pad ₹1 का एक मिलता है। Jan Aushadhi Sugam app से सबसे पास का केंद्र पता चलता है।' },
          { en: 'Girls aged 10–19 in villages can get a pack of 6 pads for ₹6 from their ASHA under the Menstrual Hygiene Scheme, where the state runs it.', hi: 'गाँव में 10–19 साल की लड़कियों को Menstrual Hygiene Scheme में आशा दीदी से 6 pad का पैकेट ₹6 में मिल सकता है, जहाँ राज्य यह योजना चलाता है।' }]) +
        '<button type="button" class="btn sm" style="align-self:flex-start" data-go="access-schemes-period">' + h({ en: 'Other free and low-cost options', hi: 'दूसरे मुफ़्त और सस्ते विकल्प' }) + '</button>') +
      sec('pp-cloth', { en: 'Cloth pads', hi: 'कपड़े का pad' },
        steps([{ en: 'Use clean cotton cloth. Change it when it feels wet, every few hours.', hi: 'साफ़ सूती कपड़ा इस्तेमाल करें। गीला लगे तो बदलें, हर कुछ घंटे में।' },
          { en: 'Rinse in cold water first, then wash with soap and clean water until the water runs clear.', hi: 'पहले ठंडे पानी में खँगालें, फिर साबुन और साफ़ पानी से तब तक धोएँ जब तक पानी साफ़ न आने लगे।' },
          { en: 'Dry it fully in direct sunlight. Sun helps kill germs. Do not hide it to dry in a damp, dark corner.', hi: 'पूरी तरह तेज़ धूप में सुखाएँ। धूप कीटाणु मारने में मदद करती है। गीले, अँधेरे कोने में छिपाकर न सुखाएँ।' },
          { en: 'Store it folded in a clean, dry bag or box. Replace cloth that has gone thin or hard, or stays stained. Do not share cloth pads.', hi: 'तह करके साफ़, सूखी थैली या डिब्बे में रखें। पतला या सख़्त हो गया या दाग़ न जाने वाला कपड़ा बदल दें। कपड़े का pad किसी के साथ न बाँटें।' }])) +
      sec('pp-cup', { en: 'Menstrual cup', hi: 'Menstrual cup (मासिक कप)' },
        '<p class="small">' + h({ en: 'A soft silicone cup that sits inside the vagina and collects blood. Cared for well, one cup lasts several years.', hi: 'मुलायम silicone का कप जो योनि के अंदर रहकर ख़ून इकट्ठा करता है। ठीक से रखें तो एक कप कई साल चलता है।' }) + '</p>' +
        '<h3>' + h({ en: 'Choosing a size', hi: 'साइज़ कैसे चुनें' }) + '</h3><p class="small">' + h({ en: 'Most brands make a small and a large. Many suggest the small if you are under about 30 and have not had a vaginal birth, and the large if you are over 30, have had a vaginal birth, or have heavy flow. Check the brand\'s own size chart.', hi: 'ज़्यादातर brand छोटा और बड़ा साइज़ बनाते हैं। कई brand कहते हैं: लगभग 30 से कम उम्र और नॉर्मल डिलीवरी न हुई हो तो छोटा; 30 से ज़्यादा उम्र, नॉर्मल डिलीवरी हुई हो या ब्लीडिंग ज़्यादा हो तो बड़ा। brand का अपना size chart ज़रूर देखें।' }) + '</p>' +
        '<h3>' + h({ en: 'Putting it in and taking it out', hi: 'लगाना और निकालना' }) + '</h3>' +
        steps([{ en: 'Wash your hands. Fold the cup flat; a C-fold works for most women.', hi: 'हाथ धोएँ। कप को मोड़कर चपटा करें; ज़्यादातर के लिए C-fold ठीक रहता है।' },
          { en: 'Squat, sit, or stand with one foot raised. Slide it in angled towards your lower back, not straight up.', hi: 'उकड़ूँ बैठें, बैठें, या एक पैर ऊपर रखकर खड़ी हों। कप को सीधा ऊपर नहीं, कमर की तरफ़ तिरछा अंदर सरकाएँ।' },
          { en: 'Let it open. Turn it gently, or run a finger around the rim to check.', hi: 'उसे खुलने दें। हल्का घुमाएँ, या उँगली से किनारा छूकर देख लें कि खुल गया है।' },
          { en: 'To remove, pinch the base to break the seal, then ease it out slowly. Empty it in the toilet, rinse with water and put it back.', hi: 'निकालने के लिए नीचे से दबाकर खिंचाव छोड़ें, फिर धीरे से बाहर निकालें। toilet में खाली करें, पानी से धोएँ और फिर से लगाएँ।' },
          { en: 'Empty it every 8–12 hours. Never leave it in longer than your brand allows.', hi: 'हर 8–12 घंटे में खाली करें। brand जितना समय बताए, उससे ज़्यादा कभी अंदर न छोड़ें।' },
          { en: 'At the end of each period, wash it with soap and water, then boil it in a pan of water for as long as the pack says.', hi: 'हर पीरियड के अंत में साबुन-पानी से धोएँ, फिर पैकेट पर लिखे समय तक बर्तन में पानी में उबालें।' }]) +
        '<p class="small">' + h({ en: 'The first few periods take practice. Wear a pad as backup until you feel sure.', hi: 'पहले कुछ पीरियड में अभ्यास लगता है। जब तक भरोसा न हो, साथ में pad भी पहनें।' }) + '</p>' +
        '<div class="flag"><span>' + h({ en: 'Have a Copper-T or another IUD? Ask your doctor before using a cup. Pulling the cup out can tug the IUD strings and move it.', hi: 'Copper-T या कोई और IUD लगा है? cup इस्तेमाल करने से पहले डॉक्टर से पूछें। cup निकालते समय IUD के धागे खिंचकर वह अपनी जगह से हिल सकता है।' }) + '</span></div>') +
      sec('pp-tampon', { en: 'Tampons', hi: 'Tampon (टैम्पॉन)' },
        ul([{ en: 'Use the lowest absorbency that works for your flow.', hi: 'अपनी ब्लीडिंग के हिसाब से सबसे कम सोखने वाला tampon लें।' },
          { en: 'Change every 4–8 hours, even on light days. Never keep one in for more than 8 hours. If you sleep longer, use a pad at night.', hi: 'हर 4–8 घंटे में बदलें, हल्के दिनों में भी। एक tampon 8 घंटे से ज़्यादा कभी न रखें। नींद इससे लंबी हो तो रात में pad लगाएँ।' },
          { en: 'Use tampons only during your period, not for discharge.', hi: 'tampon सिर्फ़ पीरियड में लगाएँ, सफ़ेद पानी (discharge) के लिए नहीं।' }]) +
        '<div class="flag urgent"><span>' + h({ en: 'Toxic shock syndrome is rare but serious. Sudden high fever, vomiting or diarrhoea, a rash like sunburn, dizziness or fainting while using a tampon or cup: take it out and go to hospital now, or call 112.', hi: 'Toxic shock syndrome कम होता है पर गंभीर है। tampon या cup लगाते समय अचानक तेज़ बुख़ार, उल्टी या दस्त, धूप से जलने जैसे दाने, चक्कर या बेहोशी हो: उसे तुरंत निकालें और अभी अस्पताल जाएँ, या 112 पर कॉल करें।' }) + '</span></div>') +
      sec('pp-under', { en: 'Period underwear', hi: 'पीरियड अंडरवियर' },
        ul([{ en: 'Washable underwear with an absorbent layer. Good on light days, or as backup with a cup.', hi: 'धुलने वाला अंडरवियर जिसमें सोखने वाली परत होती है। हल्के दिनों में, या cup के साथ बैकअप के लिए अच्छा।' },
          { en: 'Do not wear one longer than the brand says. Rinse in cold water, wash as the label says, and dry it fully.', hi: 'brand के बताए समय से ज़्यादा न पहनें। ठंडे पानी में खँगालें, लेबल के हिसाब से धोएँ, और पूरी तरह सुखाएँ।' }])) +
      sec('pp-bin', { en: 'Throwing away used pads', hi: 'इस्तेमाल किया pad कैसे फेंकें' },
        steps([{ en: 'Wrap it in the pouch or wrapper it came with, or in newspaper.', hi: 'उसके साथ आए पाउच या wrapper में, या अख़बार में लपेटें।' },
          { en: 'Put it in the dry-waste bin. This is what the Solid Waste Management Rules, 2016 ask every household to do.', hi: 'उसे सूखे कचरे के डिब्बे में डालें। ठोस कचरा प्रबंधन नियम, 2016 हर घर से यही करने को कहते हैं।' },
          { en: 'Never flush pads or tampons: they block pipes and drains. Do not throw them in open drains, fields or ponds.', hi: 'pad या tampon कभी flush न करें: इससे पाइप और नाली बंद होती हैं। खुली नाली, खेत या तालाब में न फेंकें।' },
          { en: 'Do not burn them in the open. The smoke is harmful.', hi: 'खुले में न जलाएँ। उसका धुआँ नुक़सानदेह है।' },
          { en: 'With a cup, just empty it into the toilet. Wash your hands after.', hi: 'cup हो तो बस toilet में खाली करें। बाद में हाथ धोएँ।' }])) +
      '<div class="card soft"><h3>' + h({ en: 'Keeping clean', hi: 'साफ़-सफ़ाई' }) + '</h3><p class="small">' + h({ en: 'Wash the outside of the vagina with plain water once or twice a day. The vagina cleans itself inside: no soap inside, no douching, no perfumed washes.', hi: 'योनि के बाहरी हिस्से को दिन में एक-दो बार सादे पानी से धोएँ। योनि अंदर से ख़ुद साफ़ रहती है: अंदर साबुन नहीं, अंदर पानी की धार (douching) नहीं, ख़ुशबू वाले wash नहीं।' }) + '</p></div>';
    S.wire(v);
    v.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  }

  /* ---------- myths and facts ---------- */
  const MYTHS = [
    [{ en: 'A woman on her period should not enter the kitchen or touch food.', hi: 'पीरियड में महिला को रसोई में नहीं जाना चाहिए, खाना नहीं छूना चाहिए।' },
      { en: 'A period does not make food unsafe. Washing your hands before cooking keeps food clean on every day of the month. If you feel tired and want a day off from the kitchen, take it because you need the rest.', hi: 'पीरियड से खाना ख़राब नहीं होता। खाना बनाने से पहले हाथ धोने से खाना साफ़ रहता है, महीने के हर दिन। थकान हो और रसोई से एक दिन की छुट्टी चाहिए, तो ज़रूर लें, क्योंकि आपको आराम चाहिए।' }],
    [{ en: 'A period makes a woman impure, so she must stay away from the temple or puja.', hi: 'पीरियड में महिला अशुद्ध हो जाती है, इसलिए मंदिर या पूजा से दूर रहना चाहिए।' },
      { en: 'Medically, a period is the womb shedding its lining each month. It is a sign of a healthy body, and nothing about it is dirty. Whether you go to a temple or do puja is a matter of your faith and your choice.', hi: 'डॉक्टरी नज़र से पीरियड हर महीने गर्भाशय की परत का निकलना है। यह स्वस्थ शरीर की निशानी है, और इसमें कुछ भी गंदा नहीं। मंदिर जाना या पूजा करना आपकी आस्था और आपकी मर्ज़ी की बात है।' }],
    [{ en: 'If a woman on her period touches pickle, it will spoil.', hi: 'पीरियड में अचार छू लिया तो अचार ख़राब हो जाएगा।' },
      { en: 'Pickle spoils from moisture, a wet spoon or unwashed hands. A period has nothing to do with it. Use a clean, dry spoon and keep the jar closed.', hi: 'अचार नमी, गीले चम्मच या बिना धुले हाथों से ख़राब होता है। पीरियड का इससे कोई लेना-देना नहीं। साफ़, सूखा चम्मच इस्तेमाल करें और बरनी बंद रखें।' }],
    [{ en: 'Do not bathe or wash your hair during a period.', hi: 'पीरियड में नहाना या बाल धोना नहीं चाहिए।' },
      { en: 'Bathing and washing your hair are safe on any day of your period. A warm bath can even ease cramps.', hi: 'पीरियड के किसी भी दिन नहाना और बाल धोना सुरक्षित है। गुनगुने पानी से नहाने से ऐंठन में आराम भी मिल सकता है।' }],
    [{ en: 'Exercise or sport during a period is harmful.', hi: 'पीरियड में कसरत या खेल नुक़सान करते हैं।' },
      { en: 'Walking, yoga, dancing and sport are safe during a period, and moving often eases cramps. Rest on days you feel unwell.', hi: 'पीरियड में चलना, योग, नाचना और खेल सुरक्षित हैं, और हिलने-डुलने से अक्सर ऐंठन में आराम मिलता है। जिस दिन तबीयत ठीक न लगे, आराम करें।' }],
    [{ en: 'If she touches a plant, such as tulsi, it will dry up.', hi: 'पौधा, जैसे तुलसी, छू लिया तो सूख जाएगा।' },
      { en: 'Plants are not affected by a period. They dry up from too little or too much water, too little sun, or pests.', hi: 'पीरियड का पौधों पर कोई असर नहीं होता। पौधे कम या ज़्यादा पानी, कम धूप या कीड़ों से सूखते हैं।' }],
    [{ en: 'Sour food like curd, tamarind or lemon makes cramps or bleeding worse.', hi: 'दही, इमली या नींबू जैसी खट्टी चीज़ों से ऐंठन या ब्लीडिंग बढ़ती है।' },
      { en: 'Sour food does not change your bleeding or cramps. Eat your normal meals, and add iron-rich food such as green leafy vegetables, chana, rajma, eggs or meat.', hi: 'खट्टा खाने से ब्लीडिंग या ऐंठन पर असर नहीं पड़ता। अपना सामान्य खाना खाएँ, और आयरन वाला खाना जोड़ें, जैसे हरी पत्तेदार सब्ज़ियाँ, चना, राजमा, अंडा या मांस।' }],
    [{ en: 'Period blood is dirty blood: the body throwing out poison.', hi: 'पीरियड का ख़ून गंदा ख़ून है: शरीर ज़हर बाहर निकालता है।' },
      { en: 'Period blood is ordinary blood mixed with the lining of the womb. It is not dirty and not poison. A period that stops is not "bad blood stuck inside": it needs a check-up.', hi: 'पीरियड का ख़ून आम ख़ून है जिसमें गर्भाशय की परत मिली होती है। यह न गंदा है, न ज़हर। पीरियड रुकने का मतलब "गंदा ख़ून अंदर रुकना" नहीं है: इसके लिए जाँच ज़रूरी है।' }],
    [{ en: 'Sex during a period is harmful, and you cannot get pregnant then.', hi: 'पीरियड में संबंध बनाना नुक़सानदेह है, और उस समय गर्भ नहीं ठहरता।' },
      { en: 'Sex during a period is safe if you both want it. It is your choice, and saying no is your right too. Pregnancy is less likely but still possible, and infections can still pass. Use a condom if you do not want a pregnancy or are not sure about infections.', hi: 'अगर दोनों चाहें तो पीरियड में संबंध बनाना सुरक्षित है। यह आपकी मर्ज़ी है, और मना करना भी आपका हक़ है। गर्भ की संभावना कम है पर होती है, और संक्रमण भी फैल सकता है। गर्भ नहीं चाहतीं या संक्रमण को लेकर पक्का नहीं हैं, तो condom इस्तेमाल करें।' }],
    [{ en: 'Girls should stay home from school or skip sport during periods.', hi: 'पीरियड में लड़कियों को स्कूल नहीं जाना चाहिए या खेल छोड़ देना चाहिए।' },
      { en: 'Girls can go to school, sit exams and play sport as usual. Carry a spare pad and a small bag to wrap the used one. A teacher can help if you need a pad or have pain. If the school has no clean toilet with water and a dustbin, parents can ask for one.', hi: 'लड़कियाँ हमेशा की तरह स्कूल जा सकती हैं, परीक्षा दे सकती हैं और खेल सकती हैं। एक extra pad और इस्तेमाल किया pad लपेटने के लिए छोटी थैली साथ रखें। pad चाहिए या दर्द हो तो किसी टीचर से कहें। स्कूल में पानी वाला साफ़ शौचालय और कूड़ादान न हो तो माता-पिता इसकी माँग कर सकते हैं।' }]
  ];
  function renderMyths(v) {
    v.innerHTML = S.backRow(t('periods_myths'), 'periods', false) +
      intro({ en: 'Customs around periods differ between families and faiths. This page is about health only: what your body needs, and what harms no one. What you follow is your choice.', hi: 'पीरियड से जुड़े रिवाज़ हर परिवार और धर्म में अलग हैं। यह पन्ना सिर्फ़ सेहत के बारे में है: आपके शरीर को क्या चाहिए, और किससे किसी का नुक़सान नहीं होता। आप क्या मानें, यह आपकी मर्ज़ी है।' }) +
      MYTHS.map((m) => '<div class="card periods-myth"><span class="pill muted" style="align-self:flex-start">' + esc(t('periods_myth')) + '</span><h3>' + h(m[0]) + '</h3><div class="flag ok"><span><strong>' + esc(t('periods_fact')) + ':</strong> ' + h(m[1]) + '</span></div></div>').join('') +
      '<div class="card soft"><p class="small" style="color:var(--fg)">' + h({ en: 'Talking openly helps the next girl in your family. Daughters, and sons too, can learn that a period is normal.', hi: 'खुलकर बात करने से परिवार की अगली लड़की को मदद मिलती है। बेटियाँ, और बेटे भी, सीख सकते हैं कि पीरियड सामान्य है।' }) + '</p></div>' +
      '<div class="list">' +
      linkItem('teen-first', 'flower', tx({ en: 'First period', hi: 'पहला पीरियड' }), tx({ en: 'For girls and their parents', hi: 'लड़कियों और उनके माता-पिता के लिए' })) +
      linkItem('contra', 'pill', tx({ en: 'Contraception', hi: 'गर्भनिरोध' }), tx({ en: 'Free methods and how to choose', hi: 'मुफ़्त तरीक़े और कैसे चुनें' })) +
      linkItem('intimate-sti', 'lock', tx({ en: 'Infections from sex', hi: 'संबंध से होने वाले संक्रमण' }), tx({ en: 'Signs, tests and free treatment', hi: 'लक्षण, जाँच और मुफ़्त इलाज' })) +
      '</div>';
    S.wire(v);
  }

  /* ---------- fasting ---------- */
  function renderFasting(v) {
    v.innerHTML = S.backRow(t('periods_fasting'), 'periods', false) +
      intro({ en: 'Navratri, Karva Chauth, Ramzan, Ekadashi, Teej: for many of us, fasting is part of faith. Whether to fast on period days is a matter of your faith and your family. This page is only about keeping your body safe while you fast.', hi: 'नवरात्रि, करवा चौथ, रमज़ान, एकादशी, तीज: हम में से बहुतों के लिए व्रत या रोज़ा आस्था का हिस्सा है। पीरियड के दिनों में व्रत रखना है या नहीं, यह आपकी आस्था और परिवार की बात है। यह पन्ना सिर्फ़ इस बारे में है कि व्रत के दौरान आपका शरीर सुरक्षित रहे।' }) +
      '<div class="card"><h2>' + h({ en: 'Before and during the fast', hi: 'व्रत से पहले और व्रत के दौरान' }) + '</h2>' +
      ul([{ en: 'Eat a proper meal before the fast begins (sargi or sehri), and drink water slowly through the hours you can.', hi: 'व्रत शुरू होने से पहले (सरगी या सेहरी में) ठीक से खाएँ, और जिन घंटों में पी सकती हैं उनमें धीरे-धीरे पानी पीती रहें।' },
        { en: 'Fasts without water (nirjala), such as Karva Chauth, Hartalika Teej, Nirjala Ekadashi or roza, carry the most risk of dehydration, more so in heat or on heavy-bleeding days.', hi: 'बिना पानी के व्रत (निर्जला), जैसे करवा चौथ, हरतालिका तीज, निर्जला एकादशी या रोज़ा, में पानी की कमी का ख़तरा सबसे ज़्यादा होता है, ख़ासकर गर्मी में या भारी ब्लीडिंग वाले दिनों में।' },
        { en: 'On period days your body loses blood and fluid. If your tradition allows, a fast with water, milk or fruit (phalahar) is gentler.', hi: 'पीरियड के दिनों में शरीर से ख़ून और पानी निकलता है। अगर आपकी परंपरा में छूट हो, तो पानी, दूध या फल (फलाहार) वाला व्रत शरीर के लिए हल्का रहता है।' },
        { en: 'Keep ORS at home, and mix one packet exactly as written on it.', hi: 'घर में ORS रखें, और एक पैकेट ठीक वैसे घोलें जैसा उस पर लिखा है।' },
        { en: 'Rest in the shade and avoid heavy work in the sun.', hi: 'छाँव में आराम करें और धूप में भारी काम से बचें।' },
        { en: 'Painkillers on an empty stomach can upset it. Take them with your sargi or sehri, or after you break the fast.', hi: 'ख़ाली पेट दर्द की दवा पेट ख़राब कर सकती है। इसे सरगी या सेहरी के साथ, या व्रत खोलने के बाद लें।' }]) + '</div>' +
      '<div class="card warn"><h3>' + h({ en: 'Talk to your doctor before fasting if you', hi: 'व्रत से पहले डॉक्टर से बात करें अगर आप' }) + '</h3>' +
      ul([{ en: 'are pregnant, especially before a fast without water', hi: 'गर्भवती हैं, ख़ासकर बिना पानी के व्रत से पहले' },
        { en: 'are breastfeeding: your body needs extra water', hi: 'स्तनपान करा रही हैं: शरीर को ज़्यादा पानी चाहिए' },
        { en: 'have diabetes and take tablets or insulin: sugar can fall dangerously low. See your doctor a few weeks before Ramzan or a long vrat to plan your medicines.', hi: 'डायबिटीज़ है और गोली या insulin लेती हैं: शुगर ख़तरनाक रूप से गिर सकती है। रमज़ान या लंबे व्रत से कुछ हफ़्ते पहले डॉक्टर से मिलकर दवा की योजना बनाएँ।' },
        { en: 'take a thyroid tablet: do not skip it. Ask your doctor what time to take it on fast days.', hi: 'थायरॉइड की गोली लेती हैं: उसे न छोड़ें। डॉक्टर से पूछें कि व्रत के दिनों में किस समय लें।' },
        { en: 'have PMOS and take metformin or other medicines: ask how to take them on fast days', hi: 'PMOS है और metformin या कोई और दवा लेती हैं: पूछें कि व्रत के दिनों में कैसे लें' },
        { en: 'have anaemia, very heavy periods, kidney or heart disease, or have fainted during a fast before', hi: 'ख़ून की कमी (anaemia), बहुत भारी पीरियड, किडनी या दिल की बीमारी है, या पहले कभी व्रत में बेहोश हुई हैं' }]) +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="cond-anaemia">' + h({ en: 'Anaemia and heavy periods', hi: 'ख़ून की कमी और भारी पीरियड' }) + '</button></div>' +
      '<div class="card"><h3 style="color:var(--accent)">' + h({ en: 'Break the fast now and drink water or ORS if you feel', hi: 'व्रत अभी खोलें और पानी या ORS पिएँ अगर' }) + '</h3>' +
      ul([{ en: 'dizzy, faint or very weak', hi: 'चक्कर आए, बेहोशी जैसा लगे या बहुत कमज़ोरी हो' },
        { en: 'your heart racing or pounding (palpitations)', hi: 'दिल बहुत तेज़ धड़के या धक-धक करे' },
        { en: 'you are passing very little urine, or it is very dark', hi: 'पेशाब बहुत कम आए या बहुत गहरे रंग का हो' },
        { en: 'shaky, sweaty or confused. With diabetes this can be low sugar: take sugar, glucose or juice now. Stop the fast if your sugar is below 70 or above 300 mg/dL.', hi: 'काँपना, पसीना या उलझन हो। डायबिटीज़ में यह शुगर गिरना हो सकता है: अभी चीनी, glucose या जूस लें। शुगर 70 से कम या 300 mg/dL से ज़्यादा हो तो व्रत तोड़ दें।' }]) +
      '<div class="flag urgent"><span>' + h({ en: 'Fainting, chest pain, confusion that does not clear, or fits: call 112 or 108 now.', hi: 'बेहोशी, सीने में दर्द, उलझन जो ठीक न हो, या दौरे: अभी 112 या 108 पर कॉल करें।' }) + '</span></div>' +
      '<p class="footnote" style="text-align:left">' + h({ en: 'Sugar limits from the International Diabetes Federation and DAR guide to a safe fast.', hi: 'शुगर की सीमाएँ: International Diabetes Federation और DAR की सुरक्षित व्रत गाइड से।' }) + '</p></div>' +
      '<div class="card"><h2>' + h({ en: 'Sargi and sehri ideas', hi: 'सरगी और सेहरी के लिए' }) + '</h2>' +
      ul([{ en: 'Food that keeps you full longer: roti or paratha with curd, dalia or oats with milk, poha with peanuts, eggs or paneer.', hi: 'देर तक पेट भरा रखने वाला खाना: दही के साथ रोटी या पराठा, दूध के साथ दलिया या ओट्स, मूँगफली वाला पोहा, अंडा या पनीर।' },
        { en: 'For a vrat: sabudana khichdi with peanuts, kuttu or singhara roti with curd, makhana, fruit, chaas.', hi: 'व्रत के लिए: मूँगफली वाली साबूदाना खिचड़ी, दही के साथ कुट्टू या सिंघाड़े की रोटी, मखाना, फल, छाछ।' },
        { en: 'Water-rich food: cucumber, tomato, watermelon, curd, coconut water.', hi: 'पानी वाली चीज़ें: खीरा, टमाटर, तरबूज़, दही, नारियल पानी।' },
        { en: 'Go easy on very salty or fried food, and on tea and coffee: they leave you thirstier.', hi: 'बहुत नमकीन या तली चीज़ें और चाय-कॉफ़ी कम लें: इनसे प्यास ज़्यादा लगती है।' },
        { en: 'Break the fast gently: water or ORS first, then fruit or dates, then a normal meal.', hi: 'व्रत धीरे से खोलें: पहले पानी या ORS, फिर फल या खजूर, फिर सामान्य खाना।' }]) + '</div>' +
      askCard({ en: 'Fasting safely with my health condition', hi: 'अपनी सेहत की हालत में सुरक्षित व्रत' }, { en: 'Want to fast with diabetes, thyroid, PMOS or heavy periods? A Qura doctor can help plan your meals on a free call. Changes to medicines come from the doctor who prescribed them.', hi: 'डायबिटीज़, थायरॉइड, PMOS या भारी पीरियड के साथ व्रत रखना चाहती हैं? मुफ़्त कॉल पर Qura की डॉक्टर खाने की योजना बनाने में मदद कर सकती हैं। दवा में बदलाव वही डॉक्टर करें जिन्होंने दवा लिखी है।' });
    S.wire(v);
  }

  /* ---------- registration ---------- */
  S.register({
    id: ID,
    demoPersona: 'asha',
    strings: {
      en: {
        periods_hub: 'Periods', periods_all: 'All period guides', periods_hub_s: 'Pain, PMS, pads and cups, myths, fasting, delaying a period',
        periods_pms: 'Mood and body through your cycle', periods_pms_s: 'A daily log for PMS and PMDD, lined up by cycle day',
        periods_pain: 'Period pain', periods_pain_s: 'What helps, and what is not normal',
        periods_postpone: 'Delaying a period', periods_postpone_s: 'For a wedding, festival, exam or pilgrimage',
        periods_products: 'Pads, cups and more', periods_products_s: 'Choosing, changing, washing and throwing away',
        periods_myths: 'Myths and facts', periods_myths_s: 'Kitchen, temple, pickle, bathing, sport and more',
        periods_fasting: 'Fasting and periods', periods_fasting_s: 'Navratri, Karva Chauth, Ramzan, Ekadashi, Teej',
        periods_sym_irritable: 'Irritable or angry', periods_sym_anxious: 'Anxious or tense', periods_sym_tearful: 'Tearful', periods_sym_low: 'Low or hopeless', periods_sym_breasts: 'Sore breasts',
        periods_sym_bloating: 'Bloating', periods_sym_cravings: 'Food cravings', periods_sym_sleep: 'Poor sleep', periods_sym_headache: 'Headache',
        periods_g_irritable: 'Irritable', periods_g_anxious: 'Anxious', periods_g_tearful: 'Tearful', periods_g_low: 'Low', periods_g_breasts: 'Sore breasts',
        periods_g_bloating: 'Bloating', periods_g_cravings: 'Cravings', periods_g_sleep: 'Poor sleep', periods_g_headache: 'Headache', periods_g_little: 'Affected a little', periods_g_lot: 'Affected a lot',
        periods_imp_q: 'Did it affect your work or family that day?', periods_imp_none: 'No', periods_imp_little: 'A little', periods_imp_lot: 'A lot',
        periods_log_h: 'Log a day', periods_log_p: 'Tap what you felt. If nothing bothered you, save the day anyway: your doctor needs to see the calm days too.',
        periods_has_entry: 'You already logged this day. Change it and save again.', periods_saved_day: 'Saved for {d}.', periods_del: 'Delete this day', periods_deleted: 'Deleted.',
        periods_grid_h: 'Your last 3 cycles', periods_grid_p: 'Each row is a feeling or symptom. Each column is a day of your cycle, from day 1 (period starts) to day 35. The darker the square, the more cycles you logged it on that day.',
        periods_legend: 'Cycles with an entry:', periods_band: 'Gold bar: the 7 days before your next period usually comes (your recent cycles average {n} days).', periods_band_lbl: 'Before period', periods_day: 'Day',
        periods_no_logs: 'Nothing logged in these cycles yet. Log a minute each evening, especially in the week or two before your period. After 2 cycles the pattern shows here.',
        periods_no_starts: 'Log your period start dates in the diary so your entries line up by cycle day.',
        periods_beyond: '{n} logged days fall after day 35. They are not drawn here but are counted below.',
        periods_core_note: 'This also counts headache, bloating, low mood and poor sleep you ticked when logging a period.',
        periods_counts_h: 'Your counts', periods_days_logged: 'Days logged in these cycles', periods_pre_weeks: 'Weeks before a period with entries (last 3)', periods_pre_lot: 'Of these, weeks with a day that affected work or family a lot',
        periods_week_before: 'Most logged in the 7 days before a period', periods_none_yet: 'None yet', periods_noscore: 'Counts of your own entries. No score, no diagnosis.',
        periods_j_pads: 'Pads', periods_j_cloth: 'Cloth', periods_j_cup: 'Cup', periods_j_tampon: 'Tampons', periods_j_under: 'Period underwear', periods_j_bin: 'Throwing away',
        periods_myth: 'Myth', periods_fact: 'Fact',
        periods_home_h: 'How are you feeling today?', periods_home_p: 'The days before a period are the ones worth logging. One minute helps you and your doctor see the pattern.', periods_home_go: 'Log',
        periods_sum_days: 'Days logged: {n} ({m} in the last 3 cycles)', periods_sum_top: 'Most logged in the 7 days before a period', periods_sum_lot: 'Weeks before a period with a day affecting work or family a lot (last 3)'
      },
      hi: {
        periods_hub: 'पीरियड', periods_all: 'पीरियड की सभी गाइड', periods_hub_s: 'दर्द, PMS, pad और cup, मिथक, व्रत, पीरियड टालना',
        periods_pms: 'चक्र के साथ मन और शरीर', periods_pms_s: 'PMS और PMDD के लिए रोज़ की डायरी, चक्र के दिन के हिसाब से',
        periods_pain: 'पीरियड का दर्द', periods_pain_s: 'किससे आराम मिलता है, और क्या सामान्य नहीं है',
        periods_postpone: 'पीरियड टालना', periods_postpone_s: 'शादी, त्योहार, परीक्षा या तीर्थ यात्रा के लिए',
        periods_products: 'Pad, cup और बाकी चीज़ें', periods_products_s: 'चुनना, बदलना, धोना और फेंकना',
        periods_myths: 'मिथक और सच', periods_myths_s: 'रसोई, मंदिर, अचार, नहाना, खेल और भी बहुत कुछ',
        periods_fasting: 'व्रत और पीरियड', periods_fasting_s: 'नवरात्रि, करवा चौथ, रमज़ान, एकादशी, तीज',
        periods_sym_irritable: 'चिड़चिड़ापन या ग़ुस्सा', periods_sym_anxious: 'घबराहट या तनाव', periods_sym_tearful: 'रोना आना', periods_sym_low: 'मन उदास या निराश', periods_sym_breasts: 'स्तनों में दर्द',
        periods_sym_bloating: 'पेट फूलना', periods_sym_cravings: 'खाने की तलब', periods_sym_sleep: 'नींद ख़राब', periods_sym_headache: 'सिरदर्द',
        periods_g_irritable: 'चिड़चिड़ापन', periods_g_anxious: 'घबराहट', periods_g_tearful: 'रोना आना', periods_g_low: 'उदासी', periods_g_breasts: 'स्तन दर्द',
        periods_g_bloating: 'पेट फूलना', periods_g_cravings: 'तलब', periods_g_sleep: 'नींद ख़राब', periods_g_headache: 'सिरदर्द', periods_g_little: 'असर: थोड़ा', periods_g_lot: 'असर: बहुत',
        periods_imp_q: 'क्या इससे उस दिन आपके काम या परिवार पर असर पड़ा?', periods_imp_none: 'नहीं', periods_imp_little: 'थोड़ा', periods_imp_lot: 'बहुत',
        periods_log_h: 'एक दिन दर्ज करें', periods_log_p: 'जो महसूस हुआ उस पर टैप करें। कुछ परेशानी न हो, तब भी वह दिन save करें: डॉक्टर को शांत दिन भी देखने होते हैं।',
        periods_has_entry: 'यह दिन पहले से दर्ज है। बदलकर फिर से save करें।', periods_saved_day: '{d} के लिए दर्ज हो गया।', periods_del: 'यह दिन हटाएँ', periods_deleted: 'हटा दिया।',
        periods_grid_h: 'आपके पिछले 3 चक्र', periods_grid_p: 'हर पंक्ति एक एहसास या लक्षण है। हर कॉलम चक्र का एक दिन है, दिन 1 (पीरियड शुरू) से दिन 35 तक। जितना गहरा रंग, उतने ज़्यादा चक्रों में आपने उस दिन यह दर्ज किया।',
        periods_legend: 'जितने चक्रों में दर्ज:', periods_band: 'सुनहरी पट्टी: अगला पीरियड आम तौर पर जब आता है, उससे पहले के 7 दिन (हाल के चक्रों का औसत {n} दिन)।', periods_band_lbl: 'पीरियड से पहले', periods_day: 'दिन',
        periods_no_logs: 'इन चक्रों में अभी कुछ दर्ज नहीं। हर शाम एक मिनट में दर्ज करें, ख़ासकर पीरियड से पहले के एक-दो हफ़्ते। 2 चक्र बाद यहाँ पैटर्न दिखेगा।',
        periods_no_starts: 'डायरी में पीरियड शुरू होने की तारीख़ें दर्ज करें, ताकि आपकी entries चक्र के दिन के हिसाब से दिखें।',
        periods_beyond: 'दर्ज किए गए {n} दिन, दिन 35 के बाद के हैं। वे यहाँ नहीं दिखते, पर नीचे की गिनती में शामिल हैं।',
        periods_core_note: 'इसमें वह सिरदर्द, पेट फूलना, मन उदास और नींद ख़राब भी गिना गया है जो आपने पीरियड दर्ज करते समय टिक किया।',
        periods_counts_h: 'आपकी गिनती', periods_days_logged: 'इन चक्रों में दर्ज दिन', periods_pre_weeks: 'पीरियड से पहले के हफ़्ते जिनमें entry है (पिछले 3)', periods_pre_lot: 'इनमें से वे हफ़्ते जिनमें किसी दिन काम या परिवार पर बहुत असर पड़ा',
        periods_week_before: 'पीरियड से पहले के 7 दिनों में सबसे ज़्यादा दर्ज', periods_none_yet: 'अभी कुछ नहीं', periods_noscore: 'यह आपकी अपनी entries की गिनती है। कोई score नहीं, कोई diagnosis नहीं।',
        periods_j_pads: 'Pad', periods_j_cloth: 'कपड़ा', periods_j_cup: 'Cup', periods_j_tampon: 'Tampon', periods_j_under: 'पीरियड अंडरवियर', periods_j_bin: 'फेंकना',
        periods_myth: 'मिथक', periods_fact: 'सच',
        periods_home_h: 'आज आप कैसा महसूस कर रही हैं?', periods_home_p: 'पीरियड से पहले के दिन दर्ज करना सबसे काम का है। एक मिनट से आपको और डॉक्टर को पैटर्न दिखता है।', periods_home_go: 'दर्ज करें',
        periods_sum_days: 'दर्ज दिन: {n} (पिछले 3 चक्रों में {m})', periods_sum_top: 'पीरियड से पहले के 7 दिनों में सबसे ज़्यादा दर्ज', periods_sum_lot: 'पीरियड से पहले के हफ़्ते जिनमें किसी दिन काम या परिवार पर बहुत असर पड़ा (पिछले 3)'
      }
    },
    routes: {
      'periods': renderHub,
      'periods-pms': renderPMS,
      'periods-pain': renderPain,
      'periods-postpone': renderPostpone,
      'periods-products': renderProducts,
      'periods-myths': renderMyths,
      'periods-fasting': renderFasting
    },
    testRoutes: [],
    open: ['periods', 'periods-pms', 'periods-pain', 'periods-postpone', 'periods-products', 'periods-myths', 'periods-fasting'],
    tiles: [
      { section: 'periods', route: 'periods', title: 'periods_all', sub: 'periods_hub_s', icon: 'drop', order: 1, gated: false, keywords: 'period periods menstruation mc पीरियड माहवारी मासिक धर्म' },
      { section: 'periods', route: 'periods-pms', title: 'periods_pms', sub: 'periods_pms_s', icon: 'chart', order: 10, gated: true, keywords: 'pms pmdd mood irritable anxious low tearful cravings bloating breast sleep headache मूड चिड़चिड़ापन' },
      { section: 'periods', route: 'periods-pain', title: 'periods_pain', sub: 'periods_pain_s', icon: 'heart', order: 20, gated: false, keywords: 'pain cramps dysmenorrhoea painkiller heat endometriosis दर्द ऐंठन' },
      { section: 'periods', route: 'periods-products', title: 'periods_products', sub: 'periods_products_s', icon: 'drop', order: 30, gated: false, keywords: 'pad pads sanitary napkin cloth cup menstrual cup tampon underwear suvidha jan aushadhi disposal पैड कपड़ा' },
      { section: 'periods', route: 'periods-myths', title: 'periods_myths', sub: 'periods_myths_s', icon: 'sparkle', order: 40, gated: false, keywords: 'myth myths fact temple kitchen pickle hair wash bath sport school मिथक अचार मंदिर' },
      { section: 'periods', route: 'periods-fasting', title: 'periods_fasting', sub: 'periods_fasting_s', icon: 'moon', order: 50, gated: false, keywords: 'fast fasting vrat roza navratri karva chauth ramzan ramadan ekadashi teej sargi sehri व्रत रोज़ा' },
      { section: 'periods', route: 'periods-postpone', title: 'periods_postpone', sub: 'periods_postpone_s', icon: 'clock', order: 60, gated: false, keywords: 'delay postpone period wedding exam pilgrimage norethisterone टालना शादी' }
    ],
    css: [
      '.periods-gridcard { gap: 8px; }',
      '.periods-grid { display: grid; grid-template-columns: minmax(0, 84px) repeat(35, minmax(0, 1fr)); column-gap: 1px; row-gap: 3px; align-items: center; }',
      '.periods-grid.periods-sub { margin-top: 2px; }',
      '.periods-grid .lbl { font-size: 11px; line-height: 1.2; color: var(--fg); padding-right: 6px; overflow-wrap: anywhere; min-width: 0; }',
      '.periods-grid .lbl.small { color: var(--muted); font-size: 10px; }',
      '.periods-grid .c { height: 15px; border-radius: 2px; min-width: 0; }',
      '.periods-grid .sep { margin-top: 6px; }',
      '.periods-grid .band { height: 6px; border-radius: 3px; background: var(--gold); }',
      '.periods-grid .dot { width: 7px; height: 7px; border-radius: 4px; background: var(--fg); justify-self: center; }',
      '.periods-grid .dn { font-size: 9px; color: var(--muted); display: flex; justify-content: center; white-space: nowrap; min-width: 0; overflow: visible; }',
      '.periods-c0 { background: var(--bg); } .periods-c1 { background: var(--peach); } .periods-c2 { background: var(--accent-2); } .periods-c3 { background: var(--accent-strong); }',
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .periods-c1 { background: var(--gold); opacity: 0.5; } :root:not([data-theme="light"]) .periods-c2 { background: var(--accent-strong); } :root:not([data-theme="light"]) .periods-c3 { background: var(--accent-2); } }',
      ':root[data-theme="dark"] .periods-c1 { background: var(--gold); opacity: 0.5; } :root[data-theme="dark"] .periods-c2 { background: var(--accent-strong); } :root[data-theme="dark"] .periods-c3 { background: var(--accent-2); }',
      '.periods-sub-h { margin-top: 4px; color: var(--accent); }',
      '.periods-urg { font-size: 14px; font-weight: 600; color: var(--fg); margin-top: 4px; }',
      '.periods-sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -1px; }',
      '.periods-bandsw { width: 16px; height: 6px; background: var(--gold); vertical-align: 2px; }',
      '.periods-legend { gap: 6px 12px; }',
      '.periods-sec { scroll-margin-top: 72px; }',
      '.periods-myth { gap: 8px; }',
      '.periods-myth .flag { font-size: 14px; }'
    ].join('\n'),
    home: (S) => {
      if (!S.canSave() || S.cycle.countsOff()) return '';
      const log = logR(); if (!Object.keys(log).length) return '';
      const ri = S.cycle.rangeInfo(); if (!ri) return '';
      const td = S.today(); if (log[S.toISO(td)]) return '';
      if (td < S.addDays(ri.from, -7) || td > ri.to) return '';
      return '<button type="button" class="action" data-go="periods-pms"><span class="ico accent">' + S.icon('chart') + '</span><span class="body"><strong>' + esc(t('periods_home_h')) + '</strong><span class="small">' + esc(t('periods_home_p')) + '</span></span><span class="go">' + esc(t('periods_home_go')) + '</span></button>';
    },
    summary: (S) => {
      const log = logR(); if (!Object.keys(log).length) return [];
      const st = stats(); const lines = [];
      lines.push(tf('periods_sum_days', { n: st.total, m: st.inCycles }));
      lines.push(t('periods_sum_top') + ': ' + (st.top.length ? st.top.map((x) => t('periods_g_' + x.k) + ' ×' + x.n).join(', ') : t('periods_none_yet')));
      lines.push(t('periods_sum_lot') + ': ' + st.preLot + ' / ' + st.preWeeks);
      lines.push(t('periods_noscore'));
      return [{ title: t('periods_pms'), lines: lines }];
    },
    sample: (personaId, S) => {
      if (personaId !== 'asha' && personaId !== 'priya') return;
      const st = uniq(S.cycle.starts()); if (st.length < 2) return;
      const log = {}; const td = S.toISO(S.today());
      const put = (d, s, impact) => { const k = S.toISO(d); if (k <= td) log[k] = { s: s, impact: impact || 'none', at: k }; };
      if (personaId === 'asha') {
        /* About two cycles of entries, concentrated in the 7 days before each period, with calm days logged too. */
        const pre = [
          [[['bloating'], 'none'], [['bloating', 'cravings'], 'none'], [['irritable', 'breasts'], 'little'], [['irritable', 'breasts', 'sleep'], 'little'], [['irritable', 'tearful', 'low', 'bloating'], 'lot'], [['irritable', 'low', 'headache', 'cravings'], 'lot'], [['anxious', 'breasts', 'sleep'], 'little']],
          [[['cravings'], 'none'], [['bloating', 'breasts'], 'none'], [['irritable', 'bloating'], 'little'], [['irritable', 'anxious', 'sleep'], 'little'], [['irritable', 'tearful', 'low'], 'lot'], [['low', 'headache', 'breasts'], 'little'], [['irritable', 'sleep'], 'little']]
        ];
        [st.length - 3, st.length - 2].forEach((ci, j) => {
          if (ci < 0) return;
          const start = S.fromISO(st[ci]); const next = S.fromISO(st[ci + 1]);
          pre[j].forEach((e, i) => put(S.addDays(next, -(7 - i)), e[0], e[1]));
          [3, 9, 15].forEach((cd) => put(S.addDays(start, cd - 1), [], 'none'));
        });
        const cur = S.fromISO(st[st.length - 1]);
        put(S.addDays(cur, 1), ['headache'], 'none'); put(S.addDays(cur, 6), [], 'none'); put(S.addDays(cur, 12), [], 'none'); put(S.addDays(cur, 18), ['cravings'], 'none');
      } else {
        const last = S.fromISO(st[st.length - 1]);
        put(S.addDays(last, -4), ['bloating', 'low'], 'little'); put(S.addDays(last, -2), ['irritable', 'cravings'], 'little');
        put(S.addDays(last, 1), ['headache'], 'none'); put(S.addDays(last, 8), [], 'none'); put(S.addDays(last, 13), ['sleep'], 'none');
      }
      S.data(ID).log = log;
    },
    afterRender: (v, route) => { if (route !== 'periods-pms') { mem.date = null; mem.draft = null; } }
  });
})(window.Saathi);
