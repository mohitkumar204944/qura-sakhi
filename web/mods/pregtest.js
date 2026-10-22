/* Missed period and unplanned pregnancy: when to test, reading a test, choices, safe legal abortion (MTP Act) and after-care. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const D = () => S.data('pregtest');
  const saved = () => (((S.state.mods || {}).pregtest || {}).tests || []);

  /* Dates she types and the result she picks live only in memory. They are wiped when she leaves these pages,
     and nothing is written to storage unless she taps "Save to my diary". */
  let mem = { due: null, dueSet: false, sex: '', res: '', lmp: '', owner: null };
  const fresh = () => { mem = { due: null, dueSet: false, sex: '', res: '', lmp: '', owner: S.state }; };
  const own = () => { if (mem.owner !== S.state) fresh(); };

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(S.one(s, v)).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const day = (d) => S.fmtD(d, { weekday: 'short', day: 'numeric', month: 'short' });
  const dayY = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol>';
  const askBtn = (topic) => '<button type="button" class="btn secondary block" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button>';
  const goBtn = (route, label, cls) => '<button type="button" class="btn ' + (cls || 'sm') + '" data-go="' + route + '">' + T(label) + '</button>';
  const darkBtn = (route, label) => '<button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none" data-go="' + route + '">' + T(label) + '</button>';
  const flagUrgent = (o) => '<div class="flag urgent"><span class="pregtest-fi">' + S.I.help + '</span><span class="pregtest-ft">' + T(o) + '</span></div>';
  const privNote = () => T(S.canSave() ? { en: 'Nothing on this page is saved. On a shared phone, Discreet mode on the Me page hides your numbers and renames the diary to Notes.', hi: 'इस पन्ने पर कुछ भी save नहीं होता। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपाता है और डायरी का नाम “नोट्स” कर देता है।' } : { en: 'Nothing on this page is saved.', hi: 'इस पन्ने पर कुछ भी save नहीं होता।' });
  const numHead = (n, title) => '<div class="row"><span class="pregtest-num">' + n + '</span><h3>' + T(title) + '</h3></div>';
  const ext = (href, label) => '<a href="' + href + '" target="_blank" rel="noopener">' + T(label) + '</a>';

  const HL = {
    '112': { en: 'Emergency, any kind', hi: 'आपातकाल, किसी भी तरह का' },
    '108': { en: 'Ambulance', hi: 'एम्बुलेंस' },
    '14416': { en: 'Tele-MANAS: someone to talk to, free, 24×7', hi: 'Tele-MANAS: बात करने के लिए, मुफ़्त, 24×7' },
    '181': { en: 'Women Helpline: if someone is hurting or forcing you', hi: 'महिला हेल्पलाइन: अगर कोई आपको चोट पहुँचा रहा है या मजबूर कर रहा है' },
    '1098': { en: 'Childline: for anyone under 18, day and night', hi: 'Childline: 18 से कम उम्र के लिए, दिन-रात' },
    '1800-11-1311': { en: 'CARA adoption helpline, Mon–Fri, 8 am–8 pm', hi: 'CARA गोद लेने की हेल्पलाइन, सोम–शुक्र, सुबह 8 से रात 8' }
  };
  const lines = (nums) => '<div class="list">' + nums.map((n) => '<div class="helpline"><div class="pregtest-hl"><div class="n num">' + esc(n) + '</div><div class="what">' + T(HL[n]) + '</div></div><button type="button" class="btn sm" data-pt-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>').join('') + '</div>';
  function wireCopy(v) {
    v.querySelectorAll('[data-pt-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.ptCopy; const done = () => S.toast(t('copied') + ' ' + n);
      const pick = () => { try { const el = b.parentElement.querySelector('.n'); const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) { /* selection blocked */ } S.toast(n); };
      try { navigator.clipboard.writeText(n).then(done, pick); } catch (e) { pick(); }
    }));
  }

  /* ---------- shared text ---------- */
  const ECTOPIC = {
    en: 'Period late or a positive test, with pain on one side of the lower belly, pain at the tip of the shoulder, bleeding, dizziness or fainting: call 112 now. This can be a pregnancy outside the womb (ectopic), which can bleed inside.',
    hi: 'पीरियड देर से या test positive, और साथ में पेट के निचले हिस्से में एक तरफ़ दर्द, कंधे की नोक में दर्द, ब्लीडिंग, चक्कर या बेहोशी: अभी 112 पर कॉल करें। यह बच्चेदानी के बाहर ठहरा गर्भ (ectopic) हो सकता है, जिसमें अंदर ही अंदर ख़ून बह सकता है।'
  };
  const RED_NOW = [
    { en: 'Bleeding that soaks 2 thick pads an hour, for 2 hours in a row or longer', hi: 'इतनी ब्लीडिंग कि हर घंटे 2 मोटे pad पूरे भीग जाएँ, लगातार 2 घंटे या उससे ज़्यादा' },
    { en: 'Dizziness, fainting, breathlessness or a racing heartbeat', hi: 'चक्कर, बेहोशी, साँस फूलना या दिल बहुत तेज़ धड़कना' },
    { en: "Severe belly pain that painkillers don't help", hi: 'पेट में तेज़ दर्द जो दर्द की दवा से भी न जाए' }
  ];
  const RED_TODAY = [
    { en: 'Fever over 100.4°F (38°C), or a fever that lasts several hours. Short chills on the day of the second pill are common.', hi: '100.4°F (38°C) से ऊपर बुख़ार, या ऐसा बुख़ार जो कई घंटे रहे। दूसरी दवा वाले दिन थोड़ी देर की कँपकँपी आम है।' },
    { en: 'Smelly or pus-like discharge', hi: 'योनि से बदबूदार या मवाद जैसा पानी आना' },
    { en: 'Bleeding or pain getting worse instead of better', hi: 'ब्लीडिंग या दर्द कम होने की जगह बढ़ना' },
    { en: 'Still feeling pregnant (sick, sore breasts) a week later', hi: 'एक हफ़्ते बाद भी गर्भ जैसा लगना (जी मिचलाना, स्तनों में दर्द)' },
    { en: 'One leg swollen and painful', hi: 'एक पैर में सूजन और दर्द' }
  ];
  const RES_LABEL = { pos: 'pregtest_r_pos', neg: 'pregtest_r_negs' };

  /* ---------- test-card drawing (C and T lines) ---------- */
  function kit(kind) {
    const T_X = 66, C_X = 90;
    const line = (x, cls) => '<rect class="' + cls + '" x="' + x + '" y="23" width="4" height="15" rx="1"/>';
    let marks = '';
    if (kind === 'neg') marks = line(C_X, 'ln');
    else if (kind === 'pos') marks = line(T_X, 'ln') + line(C_X, 'ln');
    else if (kind === 'faint') marks = line(T_X, 'ln faint') + line(C_X, 'ln');
    else if (kind === 'invalid') marks = line(T_X, 'ln') + '<rect class="miss" x="' + (C_X - 1) + '" y="22" width="6" height="17" rx="1"/>';
    else if (kind === 'evap') marks = '<rect class="ln evap" x="' + (T_X + 1) + '" y="23" width="1.6" height="15"/>' + line(C_X, 'ln') + '<g class="clk"><circle cx="104" cy="12" r="6.5"/><path d="M104 8.5v3.5l2.4 1.6"/></g>';
    return '<svg class="pregtest-kit" viewBox="0 0 120 60" role="img" aria-hidden="true"><rect class="shell" x="2" y="6" width="116" height="48" rx="16"/><circle class="well" cx="25" cy="30" r="9"/><rect class="win" x="52" y="20" width="56" height="21" rx="4"/>' +
      '<text x="' + (T_X + 2) + '" y="51" text-anchor="middle">T</text><text x="' + (C_X + 2) + '" y="51" text-anchor="middle">C</text><text x="25" y="51" text-anchor="middle">S</text>' + marks + '</svg>';
  }

  /* ---------- hub ---------- */
  function lateNote() {
    if (!S.canSave() || S.cycle.isPregnant() || S.cycle.countsOff() || S.state.situation.stopped) return '';
    const ls = S.cycle.lastStart(); if (!ls) return '';
    const ri = S.cycle.rangeInfo(); const td = S.today(); let msg = '';
    if (ri && td > ri.to) msg = fill(tx({ en: 'Going by your diary, your period is {n} days past your likely range.', hi: 'आपकी डायरी के हिसाब से, पीरियड अपने संभावित समय से {n} दिन देर से है।' }), { n: S.diffDays(ri.to, td) });
    else if (!ri && S.diffDays(ls, td) > 35) msg = fill(tx({ en: 'It has been {n} days since your last period started.', hi: 'पिछला पीरियड शुरू हुए {n} दिन हो गए हैं।' }), { n: S.diffDays(ls, td) });
    if (!msg) return '';
    return '<div class="card soft"><p style="color:var(--fg)">' + esc(msg) + '</p>' + goBtn('pregtest-when', { en: 'When can I test?', hi: 'Test कब कर सकती हूँ?' }) + '</div>';
  }
  function renderHub(v) {
    own();
    const item = (route, ico, title, sub, gated) => '<button type="button" class="item" data-go="' + route + '"><span class="ico-sm">' + S.I[ico] + '</span><span class="body"><strong>' + esc(t(title)) + '</strong><span>' + esc(t(sub)) + '</span></span>' + (gated && S.flags.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '</button>';
    v.innerHTML = S.backRow(t('pregtest_hub'), 'care', false) +
      '<p class="small">' + T({ en: "A late period, a test, maybe a result you didn't plan for. Take it one step at a time. Nothing on these pages is saved unless you choose to save it.", hi: 'पीरियड देर से, एक test, और शायद ऐसा result जिसकी योजना नहीं थी। एक-एक क़दम करके चलें। इन पन्नों पर कुछ भी save नहीं होता, जब तक आप ख़ुद न चुनें।' }) + '</p>' +
      lateNote() +
      '<div class="list">' + item('pregtest-when', 'clock', 'pregtest_when', 'pregtest_when_s', true) + item('pregtest-read', 'drop', 'pregtest_read', 'pregtest_read_s') + item('pregtest-options', 'users', 'pregtest_opts', 'pregtest_opts_s') + item('pregtest-abortion', 'lock', 'pregtest_abort', 'pregtest_abort_s', true) + item('pregtest-after', 'heart', 'pregtest_after', 'pregtest_after_s') + '</div>' +
      '<div class="card"><h3>' + T({ en: 'Free tests near you', hi: 'आपके पास मुफ़्त test' }) + '</h3><p class="small">' + T({ en: 'Your ASHA usually carries pregnancy test kits (Nishchay) and gives them free to women in her area. The ANM at the sub-centre or Ayushman Arogya Mandir can test you too. Chemists sell strip and card tests without a prescription.', hi: 'आपकी ASHA दीदी के पास आम तौर पर pregnancy test kit (निश्चय) रहती है, और वह इलाक़े की महिलाओं को मुफ़्त देती हैं। Sub-centre या आयुष्मान आरोग्य मंदिर की ANM भी test कर देती हैं। केमिस्ट के पास strip और card वाले test बिना पर्चे के मिलते हैं।' }) + '</p></div>' +
      '<div class="card soft"><h3>' + T({ en: 'Not pregnant, and still late?', hi: 'गर्भ नहीं, फिर भी पीरियड देर से?' }) + '</h3><p class="small">' + T({ en: 'Stress, illness, travel, a big change in weight, hard exercise, breastfeeding, starting or stopping hormone pills or the injection, thyroid problems, PMOS and the years before menopause can all delay a period. Two negative tests a week apart and still no period: see a doctor. No period for 90 days: always get checked.', hi: 'तनाव, बीमारी, सफ़र, वज़न में बड़ा बदलाव, बहुत ज़्यादा कसरत, स्तनपान, हॉर्मोन की गोली या इंजेक्शन शुरू या बंद करना, थायरॉइड, PMOS, और मेनोपॉज़ से पहले के साल, इन सबसे पीरियड देर से आ सकता है। एक हफ़्ते के अंतर पर दो test negative और फिर भी पीरियड नहीं: डॉक्टर को दिखाएँ। 90 दिन तक पीरियड नहीं: जाँच ज़रूर कराएँ।' }) + '</p></div>' +
      flagUrgent(ECTOPIC) +
      '<p class="note">' + T(S.canSave() ? { en: 'Dates and results you type here stay on that screen and are wiped when you leave it, unless you tap Save. On a shared phone, Discreet mode on the Me page hides your numbers.', hi: 'यहाँ लिखी तारीख़ें और result उसी screen पर रहते हैं और पन्ना छोड़ते ही मिट जाते हैं, जब तक आप Save न दबाएँ। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपा देता है।' } : { en: 'Dates and results you type here stay on that screen and are wiped when you leave it.', hi: 'यहाँ लिखी तारीख़ें और result उसी screen पर रहते हैं और पन्ना छोड़ते ही मिट जाते हैं।' }) + '</p>' +
      askBtn({ en: 'Late period', hi: 'पीरियड देर से' });
    S.wire(v);
  }

  /* ---------- when can I test ---------- */
  function dueFromDiary() {
    if (S.cycle.isPregnant() || S.cycle.countsOff() || S.state.situation.stopped) return null;
    const ri = S.cycle.rangeInfo(); const ls = S.cycle.lastStart(); if (!ri || !ls) return null;
    return S.addDays(ls, Math.round((ri.lo + ri.hi) / 2));
  }
  function whenOut() {
    const td = S.today(); const due = mem.due ? S.fromISO(mem.due) : null; const sex = mem.sex ? S.fromISO(mem.sex) : null;
    if (sex && sex > td) return '<div class="card warn"><p style="color:var(--fg)">' + T({ en: 'That date of sex is in the future. Please check it.', hi: 'संबंध की यह तारीख़ अभी आई ही नहीं है। कृपया दोबारा देखें।' }) + '</p></div>';
    let test = null, basis = null; const extra = [];
    if (due) { test = due; basis = { en: 'The day your period is due. Tests are reliable from this day.', hi: 'जिस दिन पीरियड आना है। इसी दिन से test भरोसेमंद होते हैं।' }; if (sex) { const s21 = S.addDays(sex, 21); if (sex >= due) extra.push(fill(tx({ en: 'The sex was on or after that day, so a test now can only show an earlier pregnancy. To check for this time, test again on {d}, 3 weeks after the sex.', hi: 'संबंध उसी दिन या उसके बाद हुआ, इसलिए अभी का test सिर्फ़ पहले का गर्भ दिखा सकता है। इस बार की जाँच के लिए {d} को, यानी संबंध के 3 हफ़्ते बाद, दोबारा test करें।' }), { d: day(s21) })); else if (s21 > due) extra.push(fill(tx({ en: 'The sex was less than 3 weeks before that day. If that test is negative and your period still doesn\'t come, test again on {d}.', hi: 'संबंध उस दिन से 3 हफ़्ते से कम पहले हुआ था। उस दिन test negative आए और पीरियड फिर भी न आए, तो {d} को दोबारा test करें।' }), { d: day(s21) })); } }
    else if (sex) { test = S.addDays(sex, 21); basis = { en: '3 weeks (21 days) after the sex. Use this when you don\'t know when your period is due.', hi: 'संबंध के 3 हफ़्ते (21 दिन) बाद। यह तब, जब पीरियड की तारीख़ पता न हो।' }; }
    if (!test) return '<div class="card soft"><p style="color:var(--fg)">' + T({ en: "Test from the day your period is due. If you don't know that day, test 3 weeks (21 days) after the sex.", hi: 'जिस दिन पीरियड आना है, उस दिन से test करें। वह दिन पता न हो, तो संबंध के 3 हफ़्ते (21 दिन) बाद test करें।' }) + '</p></div>';
    let when;
    if (test <= td) {
      when = T({ en: 'That day has come, so you can test now.', hi: 'वह दिन आ चुका है, आप अभी test कर सकती हैं।' });
      if (due && S.diffDays(due, td) > 0) when += ' ' + esc(fill(tx({ en: 'Your period is {n} days late.', hi: 'पीरियड {n} दिन देर से है।' }), { n: S.diffDays(due, td) }));
      if (due && S.diffDays(due, td) >= 60) extra.push(tx({ en: 'With no period for this long, see a doctor whatever the test shows.', hi: 'इतने समय से पीरियड नहीं आया है, तो test में जो भी आए, डॉक्टर को ज़रूर दिखाएँ।' }));
    } else when = esc(fill(tx({ en: 'That is {n} days from today. A test before then can show negative even if you are pregnant.', hi: 'यह आज से {n} दिन बाद है। उससे पहले test negative आ सकता है, भले ही गर्भ हो।' }), { n: S.diffDays(td, test) }));
    return '<div class="card"><div class="eyebrow">' + esc(t('pregtest_earliest')) + '</div><div class="pregtest-day">' + esc(day(test)) + '</div><p class="small">' + T(basis) + '</p><p style="color:var(--fg)">' + when + '</p>' + extra.map((x) => '<p class="note">' + esc(x) + '</p>').join('') + '</div>';
  }
  /* Continuing the pregnancy: Sakhi can switch to pregnancy. Only when she taps it; nothing changes on its own. */
  function switchArea() {
    if (!S.canSave() || S.cycle.isPregnant() || !S.openStage) return '';
    return '<div class="card soft"><h3>' + T({ en: 'Continuing the pregnancy?', hi: 'गर्भ जारी रखना है?' }) + '</h3><p class="small">' + T({ en: 'Sakhi can switch to pregnancy: your weeks, check-ups and the danger signs to know.', hi: 'Sakhi प्रेग्नेंसी पर बदल सकती है: आपके हफ़्ते, जाँचें और ख़तरे के संकेत।' }) + '</p><button type="button" class="btn sm primary" id="pt-switch">' + T({ en: 'Switch to pregnancy', hi: 'प्रेग्नेंसी पर बदलें' }) + '</button></div>';
  }
  function saveArea() {
    if (!S.canSave()) return S.needDiary();
    return '<div class="card soft"><p class="small">' + T({ en: 'Nothing is saved unless you tap below. A saved result shows in your doctor summary only as the date and the result.', hi: 'नीचे दबाए बिना कुछ save नहीं होता। Save किया result आपकी डॉक्टर summary में सिर्फ़ तारीख़ और result के रूप में दिखता है।' }) + '</p><button type="button" class="btn sm" id="pt-save">' + esc(t('pregtest_save')) + '</button></div>';
  }
  function branch() {
    const r = mem.res;
    if (r === 'pos') return '<p class="lead">' + T({ en: 'Most positive results are right.', hi: 'ज़्यादातर positive result सही होते हैं।' }) + '</p>' + steps([
      { en: 'This week, see your ANM or a doctor to confirm it; your ASHA can go with you. The check is free at the sub-centre, PHC or Ayushman Arogya Mandir.', hi: 'इसी हफ़्ते ANM या डॉक्टर से पुष्टि कराएँ; आपकी ASHA साथ जा सकती हैं। Sub-centre, PHC या आयुष्मान आरोग्य मंदिर में यह जाँच मुफ़्त है।' },
      { en: 'If you plan to continue, register the pregnancy with your ANM before 12 weeks. You get the MCP card, free check-ups, and free folic acid and iron tablets.', hi: 'अगर गर्भ जारी रखना है, तो 12 हफ़्ते से पहले ANM के पास रजिस्ट्रेशन कराएँ। MCP card, मुफ़्त जाँचें, और folic acid व iron की मुफ़्त गोलियाँ मिलती हैं।' },
      { en: "If you will continue, start folic acid tablets now. They protect the baby's brain and spine in the first weeks, and the ANM gives them free.", hi: 'गर्भ जारी रखना है, तो folic acid की गोली अभी से शुरू करें। यह शुरुआती हफ़्तों में बच्चे के दिमाग़ और रीढ़ की हड्डी को बचाती है, और ANM इसे मुफ़्त देती हैं।' },
      { en: "Didn't plan this? You have choices, and each one is simpler the earlier you act.", hi: 'योजना नहीं थी? आपके पास विकल्प हैं, और हर विकल्प जल्दी क़दम उठाने पर आसान रहता है।' }
    ]) + '<div class="grid2">' + goBtn('pregtest-options', { en: 'Your choices', hi: 'आपके विकल्प' }) + goBtn('preg', { en: 'Pregnancy guide', hi: 'गर्भावस्था गाइड' }) + '</div>' + switchArea() + saveArea();
    if (r === 'neg') return '<p style="color:var(--fg)">' + T({ en: 'A test taken early can miss a pregnancy because hCG is still low. It rises every day in early pregnancy. If your period still hasn\'t come, test again in 3–7 days with first morning urine.', hi: 'जल्दी किया test गर्भ को पकड़ने से चूक सकता है, क्योंकि तब hCG कम होता है। शुरुआती गर्भ में यह हर दिन बढ़ता है। पीरियड अब भी नहीं आया, तो 3–7 दिन बाद सुबह की पहली पेशाब से फिर test करें।' }) + '</p>' + saveArea();
    if (r === 'neg2') return '<p style="color:var(--fg)">' + T({ en: 'Two negative tests about a week apart, and no period: a pregnancy is unlikely. Something else is holding the period back. See a doctor this week or next, at the PHC or a gynaecologist. The doctor may check your thyroid or prolactin, or order a scan.', hi: 'लगभग एक हफ़्ते के अंतर पर दो negative test, और पीरियड नहीं: गर्भ की संभावना कम है। कोई और वजह पीरियड रोक रही है। इस हफ़्ते या अगले हफ़्ते PHC या स्त्री रोग विशेषज्ञ को दिखाएँ। डॉक्टर थायरॉइड या prolactin की जाँच, या scan करवा सकती हैं।' }) + '</p><p class="small">' + T({ en: 'No period for 90 days: always get checked.', hi: '90 दिन तक पीरियड नहीं: जाँच ज़रूर कराएँ।' }) + '</p>' + goBtn('periods', { en: 'Periods guide', hi: 'पीरियड गाइड' }) + saveArea();
    if (r === 'flag') return '<div class="card dark"><h3>' + T({ en: 'Call 112 now', hi: 'अभी 112 पर कॉल करें' }) + '</h3><p class="small" style="color:var(--dark-text)">' + T({ en: "Don't wait to test. With a late period, one-sided belly pain, shoulder-tip pain, bleeding, dizziness or fainting can mean a pregnancy outside the womb (ectopic). It needs a hospital now.", hi: 'Test का इंतज़ार न करें। पीरियड देर से हो और एक तरफ़ पेट दर्द, कंधे की नोक में दर्द, ब्लीडिंग, चक्कर या बेहोशी हो, तो यह बच्चेदानी के बाहर ठहरा गर्भ (ectopic) हो सकता है। अभी अस्पताल जाना ज़रूरी है।' }) + '</p></div>' + lines(['112', '108']);
    return '<p class="small">' + T({ en: 'Tap your result to see what to do next. Your choice stays on this screen only.', hi: 'आगे क्या करें, यह देखने के लिए अपना result चुनें। आपका चुनाव सिर्फ़ इसी screen पर रहता है।' }) + '</p>';
  }
  function savedList() {
    if (!S.canSave()) return ''; const L = saved(); if (!L.length) return '';
    return '<div class="card"><details><summary>' + esc(fill(t('pregtest_saved_h'), { n: L.length })) + '</summary><div class="list" style="margin-top:8px">' + L.map((x, i) => '<div class="item quiet"><span class="body"><strong>' + esc(dayY(S.fromISO(x.d))) + '</strong><span>' + esc(t(RES_LABEL[x.r] || 'pregtest_r_negs')) + '</span></span><button type="button" class="btn sm" data-pt-del="' + i + '">' + esc(t('pregtest_del')) + '</button></div>').join('') + '</div></details></div>';
  }
  function renderWhen(v) {
    own();
    if (!mem.dueSet) { const d = dueFromDiary(); mem.due = d ? S.toISO(d) : null; mem.dueSet = true; mem.fromDiary = !!d; }
    const td = S.toISO(S.today());
    const chip = (k, key) => '<button type="button" class="chip ' + (mem.res === k ? 'on' : '') + '" data-pt-res="' + k + '">' + esc(t(key)) + '</button>';
    v.innerHTML = S.backRow(t('pregtest_when'), 'pregtest', true) +
      '<p class="small">' + T({ en: 'A home test looks for hCG, a hormone your body makes once a pregnancy settles in the womb. It can show in urine as early as 10 days after conception, but most home tests are only reliable from the day your period is due.', hi: 'घर का test पेशाब में hCG ढूँढता है। यह हॉर्मोन तब बनता है जब गर्भ बच्चेदानी में टिक जाता है। गर्भ ठहरने के 10 दिन बाद ही यह पेशाब में आ सकता है, पर ज़्यादातर घर के test उसी दिन से भरोसेमंद होते हैं जिस दिन पीरियड आना है।' }) + '</p>' +
      '<div class="card"><label for="pt-due">' + esc(t('pregtest_due')) + '</label><input type="date" id="pt-due" value="' + esc(mem.due || '') + '">' +
      '<p class="small">' + T(mem.fromDiary && mem.due ? { en: 'Filled in from your diary: the middle of your likely range. Change it if you know better.', hi: 'आपकी डायरी से भरा गया: आपके संभावित समय का बीच का दिन। आपको बेहतर पता हो तो बदल दें।' } : { en: "Don't know it, for example while breastfeeding or with irregular periods? Leave it empty and use the date of sex.", hi: 'पता नहीं, जैसे स्तनपान के दौरान या अनियमित पीरियड में? इसे ख़ाली छोड़ें और संबंध की तारीख़ भरें।' }) + '</p>' +
      '<label for="pt-sex">' + esc(t('pregtest_sex')) + '</label><input type="date" id="pt-sex" max="' + td + '" value="' + esc(mem.sex) + '">' +
      '<p class="small">' + T({ en: 'Not saved. Wiped when you leave this page.', hi: 'Save नहीं होता। पन्ना छोड़ते ही मिट जाता है।' }) + '</p>' +
      '<button type="button" class="btn primary block" id="pt-calc">' + esc(t('pregtest_calc')) + '</button></div>' +
      '<div id="pt-out">' + whenOut() + '</div>' +
      '<div class="card"><h3>' + T({ en: 'How to test', hi: 'Test कैसे करें' }) + '</h3>' + steps([
        { en: 'Use the first urine of the morning. It has the most hCG, which matters when you test early.', hi: 'सुबह की पहली पेशाब लें। इसमें hCG सबसे ज़्यादा होता है, जो जल्दी test करने पर काम आता है।' },
        { en: 'Follow the leaflet in your kit. A strip is dipped in urine up to the arrow; a card takes a few drops in the round well.', hi: 'अपनी kit का पर्चा पढ़ें। Strip को पेशाब में तीर के निशान तक डुबोते हैं; card के गोल खाने में कुछ बूँदें डालते हैं।' },
        { en: 'Lay it flat and set a timer for the time the leaflet gives, usually a few minutes.', hi: 'उसे सीधा रखें और पर्चे में लिखे समय का timer लगाएँ, आम तौर पर कुछ मिनट।' },
        { en: "Read it within that time. Most kits say before 10 minutes. A line that turns up later doesn't count.", hi: 'उसी समय के अंदर पढ़ें। ज़्यादातर kit 10 मिनट से पहले पढ़ने को कहती हैं। बाद में दिखी लाइन मायने नहीं रखती।' }
      ]) + goBtn('pregtest-read', { en: 'See pictures of results', hi: 'Result की तस्वीरें देखें' }) + '</div>' +
      '<div class="card"><h3>' + esc(t('pregtest_res_h')) + '</h3><div class="chips">' + chip('pos', 'pregtest_r_pos') + chip('neg', 'pregtest_r_neg') + chip('neg2', 'pregtest_r_neg2') + chip('flag', 'pregtest_r_flag') + '</div><div class="stack" id="pt-branch"></div></div>' +
      '<div id="pt-saved"></div>' + flagUrgent(ECTOPIC);
    S.wire(v);
    const due = S.$('#pt-due', v), sex = S.$('#pt-sex', v);
    const upd = () => { mem.due = due.value || null; mem.sex = sex.value || ''; mem.fromDiary = false; S.$('#pt-out', v).innerHTML = whenOut(); };
    due.addEventListener('change', upd); sex.addEventListener('change', upd);
    S.$('#pt-calc', v).addEventListener('click', () => { upd(); const o = S.$('#pt-out', v); if (o && o.scrollIntoView) o.scrollIntoView({ block: 'nearest' }); });
    /* Result branch and saved list redraw in place, so the page doesn't jump back to the top. */
    const drawSaved = () => {
      const box = S.$('#pt-saved', v); box.innerHTML = savedList(); S.wire(box);
      box.querySelectorAll('[data-pt-del]').forEach((b) => b.addEventListener('click', () => { const d = D(); const i = parseInt(b.dataset.ptDel, 10); if (d.tests && d.tests[i]) d.tests.splice(i, 1); if (d.tests && !d.tests.length) delete d.tests; S.save(); drawSaved(); }));
    };
    const drawBranch = () => {
      const box = S.$('#pt-branch', v); box.innerHTML = branch(); S.wire(box); wireCopy(box); const sw = S.$('#pt-switch', box); if (sw) sw.addEventListener('click', () => S.openStage('preg'));
      v.querySelectorAll('[data-pt-res]').forEach((x) => x.classList.toggle('on', x.dataset.ptRes === mem.res));
      const sv = S.$('#pt-save', box);
      if (sv) sv.addEventListener('click', () => { const d = D(); d.tests = d.tests || []; d.tests.push({ d: S.toISO(S.today()), r: mem.res === 'pos' ? 'pos' : 'neg' }); S.save(); S.toast(t('saved')); sv.disabled = true; sv.textContent = t('saved'); drawSaved(); });
    };
    v.querySelectorAll('[data-pt-res]').forEach((b) => b.addEventListener('click', () => { mem.res = mem.res === b.dataset.ptRes ? '' : b.dataset.ptRes; drawBranch(); }));
    drawBranch(); drawSaved();
  }

  /* ---------- how to read ---------- */
  function renderRead(v) {
    own();
    const res = (k, title, body) => '<div class="card pregtest-res">' + kit(k) + '<div class="pregtest-rb"><h3>' + T(title) + '</h3><p class="small">' + T(body) + '</p></div></div>';
    v.innerHTML = S.backRow(t('pregtest_read'), 'pregtest', false) +
      '<p class="small">' + T({ en: 'Every kit has a result window with two marks: C (control) and T (test). S is where the urine goes. C shows the kit worked. T shows the pregnancy hormone. Read it within the time on the leaflet.', hi: 'हर kit में result की एक खिड़की होती है, जिस पर दो निशान होते हैं: C (control) और T (test)। S पर पेशाब डालते हैं। C बताता है कि kit ने काम किया। T गर्भ का हॉर्मोन दिखाता है। पर्चे में लिखे समय के अंदर पढ़ें।' }) + '</p>' +
      res('neg', { en: 'Negative', hi: 'Negative' }, { en: 'Only the C line. The test found no pregnancy hormone today. If your period still doesn\'t come, test again in 3–7 days.', hi: 'सिर्फ़ C लाइन। आज के test में गर्भ का हॉर्मोन नहीं मिला। पीरियड फिर भी न आए, तो 3–7 दिन बाद दोबारा test करें।' }) +
      res('pos', { en: 'Positive', hi: 'Positive' }, { en: 'Both C and T. You are very likely pregnant, even if T is lighter than C.', hi: 'C और T दोनों। आप लगभग पक्का गर्भवती हैं, भले ही T की लाइन C से हल्की हो।' }) +
      res('faint', { en: 'Faint T line', hi: 'हल्की T लाइन' }, { en: 'A faint T line looks unsure, right? But if it showed within the reading time, it usually means positive. Test again in 2–3 days with morning urine, or ask your ANM to confirm. Pain or bleeding as well: see a doctor today.', hi: 'हल्की T लाइन देखकर शक होता है, है न? पर अगर पढ़ने के समय के अंदर दिखी, तो आम तौर पर इसका मतलब positive है। 2–3 दिन बाद सुबह की पेशाब से फिर test करें, या ANM से पक्का कराएँ। साथ में दर्द या ब्लीडिंग हो: आज ही डॉक्टर को दिखाएँ।' }) +
      res('invalid', { en: 'Invalid: no C line', hi: 'ख़राब test: C लाइन नहीं' }, { en: "No C line means the test didn't work, whatever T shows. Use a new kit.", hi: 'C लाइन नहीं है, तो test ने काम नहीं किया, T पर कुछ भी दिखे। नई kit से test करें।' }) +
      res('evap', { en: 'Evaporation line', hi: 'सूखने से बनी लाइन (evaporation)' }, { en: 'A thin, grey, colourless line that shows up after the reading time is from the urine drying. It is not a result. Read only within the time on the leaflet, then throw the kit away.', hi: 'पढ़ने का समय निकलने के बाद दिखी पतली, स्लेटी, बिना रंग की लाइन पेशाब सूखने से बनती है। यह result नहीं है। सिर्फ़ पर्चे में लिखे समय में पढ़ें, फिर kit फेंक दें।' }) +
      '<div class="card"><h3>' + T({ en: 'For a clear answer', hi: 'साफ़ जवाब के लिए' }) + '</h3>' + ul([
        { en: 'Check the expiry date on the pack.', hi: 'पैकेट पर expiry date देखें।' },
        { en: "Use first morning urine, and don't drink a lot of water just before.", hi: 'सुबह की पहली पेशाब लें, और test से ठीक पहले बहुत पानी न पिएँ।' },
        { en: 'Use a timer instead of guessing.', hi: 'अंदाज़े की जगह timer लगाएँ।' },
        { en: 'Digital tests show words instead of lines. Read them in time too.', hi: 'Digital test में लाइन की जगह शब्द आते हैं। उन्हें भी समय पर पढ़ें।' },
        { en: 'Some fertility medicines can affect the result. Tell your doctor if you take any.', hi: 'कुछ fertility दवाएँ result पर असर डाल सकती हैं। लेती हों तो डॉक्टर को बताएँ।' },
        { en: 'Still unsure? The ANM, PHC or any doctor can confirm with a urine or blood test.', hi: 'फिर भी शक है? ANM, PHC या कोई भी डॉक्टर पेशाब या blood test से पक्का कर सकती हैं।' }
      ]) + '</div>' +
      goBtn('pregtest-when', { en: 'What to do after your result', hi: 'Result के बाद क्या करें' }, 'primary block');
    S.wire(v);
  }

  /* ---------- options ---------- */
  function renderOptions(v) {
    own();
    v.innerHTML = S.backRow(t('pregtest_opts'), 'pregtest', false) +
      '<p class="small">' + T({ en: "An unplanned pregnancy can bring fear, relief, joy or confusion, sometimes all in one day. Whatever you feel is normal, and the choice is yours. You don't have to decide alone or today. Just don't wait too long: every option is simpler and safer early.", hi: 'अनचाहा गर्भ डर, राहत, ख़ुशी या उलझन ला सकता है, कभी-कभी एक ही दिन में सब कुछ। आप जो भी महसूस करें, वह सामान्य है, और फ़ैसला आपका है। आपको अकेले या आज ही फ़ैसला नहीं करना है। बस बहुत देर न करें: हर विकल्प जल्दी चुनने पर आसान और सुरक्षित रहता है।' }) + '</p>' +
      '<div class="card soft"><h3>' + T({ en: 'First, confirm it and know your weeks', hi: 'पहले, पुष्टि करें और हफ़्ते जानें' }) + '</h3><p class="small">' + T({ en: 'See an ANM, a PHC doctor or a gynaecologist this week. An examination or scan shows how many weeks it is and whether the pregnancy is in the womb. Weeks are counted from the first day of your last period.', hi: 'इसी हफ़्ते ANM, PHC की डॉक्टर या स्त्री रोग विशेषज्ञ को दिखाएँ। जाँच या scan से पता चलता है कि कितने हफ़्ते हुए और गर्भ बच्चेदानी में है या नहीं। हफ़्ते पिछले पीरियड के पहले दिन से गिने जाते हैं।' }) + '</p></div>' +
      '<h2>' + T({ en: 'Your choices', hi: 'आपके विकल्प' }) + '</h2>' +
      '<div class="card">' + numHead(1, { en: 'Continue the pregnancy', hi: 'गर्भ जारी रखना' }) + '<p class="small">' + T({ en: 'Register with your ANM or ASHA before 12 weeks. You get the MCP card, free check-ups and tests, iron and folic acid, and free delivery at a government hospital. Some schemes also give money support.', hi: '12 हफ़्ते से पहले अपनी ANM या ASHA के पास रजिस्ट्रेशन कराएँ। MCP card, मुफ़्त जाँचें और test, iron और folic acid, और सरकारी अस्पताल में मुफ़्त डिलीवरी मिलती है। कुछ योजनाओं में पैसों की मदद भी मिलती है।' }) + '</p><div class="row wrap">' + goBtn('access-schemes-preg', { en: 'Pregnancy schemes', hi: 'गर्भावस्था की योजनाएँ' }) + goBtn('preg', { en: 'Pregnancy guide', hi: 'गर्भावस्था गाइड' }) + '</div></div>' +
      '<div class="card">' + numHead(2, { en: 'Adoption', hi: 'गोद देना' }) + '<p class="small">' + T({ en: "If you can't raise a child, there is a legal and safe way. After the birth, you go to your district's Child Welfare Committee (CWC). After counselling, you sign a surrender deed in front of the CWC, and the baby goes to a Specialised Adoption Agency. You have two months to change your mind. Buying or selling a baby is a crime, and handing a baby over outside this process can leave the child unprotected.", hi: 'अगर आप बच्चे को पाल नहीं सकतीं, तो एक क़ानूनी और सुरक्षित रास्ता है। जन्म के बाद आप अपने ज़िले की बाल कल्याण समिति (CWC) के पास जाती हैं। counselling के बाद CWC के सामने surrender deed पर हस्ताक्षर होते हैं, और बच्चा गोद देने की एक मान्य संस्था (Specialised Adoption Agency) में जाता है। फ़ैसला बदलने के लिए आपके पास दो महीने होते हैं। बच्चे को ख़रीदना या बेचना अपराध है, और इस प्रक्रिया के बाहर किसी को बच्चा सौंपने से बच्चा असुरक्षित रह सकता है।' }) + '</p><p class="small">' + T({ en: 'The District Child Protection Unit, Childline 1098 or the CARA helpline can guide you.', hi: 'ज़िला बाल संरक्षण इकाई (DCPU), Childline 1098 या CARA हेल्पलाइन आपको रास्ता बता सकती है।' }) + '</p>' + lines(['1800-11-1311', '1098']) + '<p class="small">' + ext('https://cara.wcd.gov.in/', { en: 'CARA, Government of India', hi: 'CARA, भारत सरकार' }) + '</p></div>' +
      '<div class="card">' + numHead(3, { en: 'Safe, legal abortion', hi: 'सुरक्षित, क़ानूनी गर्भपात' }) + '<p class="small">' + T({ en: 'Legal in India under the MTP Act, for married and unmarried women. Free at government hospitals that provide it, and confidential. The earlier, the simpler.', hi: 'भारत में MTP क़ानून के तहत क़ानूनी है, शादीशुदा और अविवाहित दोनों के लिए। जिन सरकारी अस्पतालों में सुविधा है वहाँ मुफ़्त, और गोपनीय। जितना जल्दी, उतना आसान।' }) + '</p>' + goBtn('pregtest-abortion', { en: 'Read about safe abortion', hi: 'सुरक्षित गर्भपात के बारे में पढ़ें' }) + '</div>' +
      '<div class="card soft"><h3>' + T({ en: 'Want to talk it through with a doctor?', hi: 'किसी डॉक्टर से खुलकर बात करना चाहती हैं?' }) + '</h3><p class="small">' + T({ en: "A Qura doctor can listen without judging, answer your questions in private, and help you find a registered gynaecologist or a government hospital. Qura's doctors don't provide abortion care themselves.", hi: 'Qura की डॉक्टर बिना आपको ग़लत ठहराए आपकी बात सुन सकती हैं, अकेले में आपके सवालों के जवाब दे सकती हैं, और रजिस्टर्ड स्त्री रोग विशेषज्ञ या सरकारी अस्पताल ढूँढने में मदद कर सकती हैं। Qura की डॉक्टर ख़ुद गर्भपात का इलाज नहीं करतीं।' }) + '</p>' + askBtn({ en: 'Pregnancy choices (private)', hi: 'गर्भ के विकल्प (निजी)' }) + '</div>' +
      '<h2>' + T({ en: 'Talk to someone', hi: 'किसी से बात करें' }) + '</h2>' +
      '<p class="small">' + T({ en: "Talking it through with someone you trust, or a trained counsellor, helps. If anyone is forcing you to continue or to end a pregnancy, or hurting you over it, that is violence and it is not your fault. Call 181, or 112 if you are in danger now.", hi: 'किसी भरोसेमंद व्यक्ति या प्रशिक्षित counsellor से बात करने से मदद मिलती है। अगर कोई आपको गर्भ रखने या गिराने के लिए मजबूर कर रहा है, या इस वजह से आपको चोट पहुँचा रहा है, तो यह हिंसा है और इसमें आपकी कोई ग़लती नहीं। 181 पर कॉल करें, या अभी ख़तरा हो तो 112।' }) + '</p>' +
      lines(['14416', '181', '112']) +
      '<p class="footnote">' + privNote() + '</p>';
    S.wire(v); wireCopy(v);
  }

  /* ---------- safe legal abortion (gated) ---------- */
  function weeksOut() {
    if (!mem.lmp) return '';
    const d = S.diffDays(S.fromISO(mem.lmp), S.today());
    if (d < 0) return '<div class="card warn"><p style="color:var(--fg)">' + T({ en: 'That date is in the future. Please check it.', hi: 'यह तारीख़ अभी आई ही नहीं है। कृपया दोबारा देखें।' }) + '</p></div>';
    if (d > 300) return '<div class="card warn"><p style="color:var(--fg)">' + T({ en: 'That is more than 42 weeks ago. Please check the date, or ask for a scan.', hi: 'यह 42 हफ़्ते से भी पहले की तारीख़ है। तारीख़ दोबारा देखें, या scan कराएँ।' }) + '</p></div>';
    const w = Math.floor(d / 7), r = d % 7;
    const wd = w < 2 ? fill(tx({ en: '{n} days', hi: '{n} दिन' }), { n: d }) : fill(tx(r === 0 ? { en: '{w} weeks and 0 days', hi: '{w} हफ़्ते और 0 दिन' } : (r === 1 ? { en: '{w} weeks and 1 day', hi: '{w} हफ़्ते और 1 दिन' } : { en: '{w} weeks and {r} days', hi: '{w} हफ़्ते और {r} दिन' })), { w: w, r: r });
    const early = d < 28 ? '<p class="note">' + T({ en: 'A pregnancy test may not show anything yet. Test from the day your next period is due.', hi: 'अभी pregnancy test में शायद कुछ न दिखे। जिस दिन अगला पीरियड आना है, उस दिन से test करें।' }) + '</p>' : '';
    let rule;
    if (d <= 63) rule = { en: 'Up to 9 weeks. Pills prescribed by a registered doctor, or a short procedure. One doctor\'s opinion is enough.', hi: '9 हफ़्ते तक। रजिस्टर्ड डॉक्टर की लिखी गोलियाँ, या एक छोटी प्रक्रिया। एक डॉक्टर की राय काफ़ी है।' };
    else if (d <= 84) rule = { en: '9 to 12 weeks. Usually a short procedure by a trained doctor in an approved centre. One doctor\'s opinion is enough.', hi: '9 से 12 हफ़्ते। आम तौर पर मंज़ूरशुदा केंद्र में प्रशिक्षित डॉक्टर एक छोटी प्रक्रिया करते हैं। एक डॉक्टर की राय काफ़ी है।' };
    else if (d <= 140) rule = { en: '12 to 20 weeks. Legal on one doctor\'s opinion, done by a qualified doctor, usually a gynaecologist, in an approved hospital. Go soon; care is simpler the earlier it is.', hi: '12 से 20 हफ़्ते। एक डॉक्टर की राय पर क़ानूनी। मंज़ूरशुदा अस्पताल में योग्य डॉक्टर करते हैं, आम तौर पर स्त्री रोग विशेषज्ञ। जल्दी जाएँ; जितना पहले, उतना आसान।' };
    else if (d <= 168) rule = { en: '20 to 24 weeks. Needs two doctors\' opinions, and only for the groups listed above, such as rape survivors, girls under 18, or women widowed or divorced during the pregnancy. Go to a district hospital or medical college as soon as you can; the time limit is close.', hi: '20 से 24 हफ़्ते। दो डॉक्टरों की राय ज़रूरी, और सिर्फ़ ऊपर बताए समूहों के लिए, जैसे बलात्कार से बची महिलाएँ, 18 से कम उम्र की लड़कियाँ, या गर्भ के दौरान विधवा हुई या तलाक़शुदा महिलाएँ। जितनी जल्दी हो सके ज़िला अस्पताल या मेडिकल कॉलेज जाएँ; समय-सीमा पास है।' };
    else rule = { en: 'Over 24 weeks. Only if a Medical Board finds a serious abnormality in the baby, or to save your life. Go to a medical college or district hospital now.', hi: '24 हफ़्ते से ज़्यादा। सिर्फ़ तब, जब Medical Board बच्चे में गंभीर समस्या (विकृति) पाए, या आपकी जान बचाने के लिए। अभी मेडिकल कॉलेज या ज़िला अस्पताल जाएँ।' };
    return '<div class="card soft"><div class="eyebrow">' + T({ en: 'Counted from your last period', hi: 'पिछले पीरियड से गिना गया' }) + '</div><div class="pregtest-day">' + esc(w < 2 ? wd : fill(tx({ en: 'About {w} weeks', hi: 'लगभग {w} हफ़्ते' }), { w: w })) + '</div>' + (w < 2 ? '' : '<p class="small">' + esc(wd) + '</p>') + '<p style="color:var(--fg)">' + T(rule) + '</p>' + early + '<p class="small">' + T({ en: "Not legal advice. The doctor's examination or scan decides your weeks.", hi: 'यह क़ानूनी सलाह नहीं है। आपके हफ़्ते डॉक्टर की जाँच या scan से तय होते हैं।' }) + '</p></div>';
  }
  function renderAbortion(v) {
    own();
    const td = S.toISO(S.today());
    v.innerHTML = S.backRow(t('pregtest_abort'), 'pregtest', true) +
      '<p class="small">' + T({ en: "Abortion is legal in India under the Medical Termination of Pregnancy (MTP) Act, changed in 2021. This page puts that law in plain words. It isn't legal advice, and your weeks are decided by a doctor's check.", hi: 'भारत में गर्भपात MTP क़ानून (Medical Termination of Pregnancy Act, 2021 में बदला गया) के तहत क़ानूनी है। इस पन्ने पर वही क़ानून आसान शब्दों में है। यह क़ानूनी सलाह नहीं है; आपके हफ़्ते डॉक्टर की जाँच से तय होते हैं।' }) + '</p>' +
      '<div class="chips">' + [['pt-s-law', { en: 'The law', hi: 'क़ानून' }], ['pt-s-weeks', { en: 'Count weeks', hi: 'हफ़्ते गिनें' }], ['pt-s-pills', { en: 'Pills', hi: 'गोलियाँ' }], ['pt-s-visit', { en: 'The visit', hi: 'अस्पताल में' }], ['pt-s-u18', { en: 'Under 18', hi: '18 से कम' }]].map((x) => '<button type="button" class="chip" data-pt-jump="' + x[0] + '">' + T(x[1]) + '</button>').join('') + '</div>' +
      '<div class="card" id="pt-s-law"><h2>' + T({ en: 'What the law allows', hi: 'क़ानून क्या कहता है' }) + '</h2>' +
      '<div class="pregtest-band"><div class="eyebrow">' + T({ en: 'Up to 20 weeks', hi: '20 हफ़्ते तक' }) + '</div><p>' + T({ en: "One registered doctor's opinion is enough. If your contraception or your partner's failed, married or not, the law accepts that the stress of an unwanted pregnancy can harm your mental health, and that is a valid reason. A pregnancy from rape always counts this way. Other reasons: a risk to your life or health, or a serious problem in the baby.", hi: 'एक रजिस्टर्ड डॉक्टर की राय काफ़ी है। अगर आपका या आपके साथी का गर्भनिरोध फ़ेल हुआ, चाहे शादी हुई हो या नहीं, तो क़ानून मानता है कि अनचाहे गर्भ का तनाव आपके मानसिक स्वास्थ्य को नुक़सान पहुँचा सकता है, और यह एक मान्य वजह है। बलात्कार से हुआ गर्भ हमेशा इसी तरह माना जाता है। दूसरी वजहें: आपकी जान या सेहत को ख़तरा, या बच्चे में गंभीर समस्या।' }) + '</p></div>' +
      '<div class="pregtest-band"><div class="eyebrow">' + T({ en: '20 to 24 weeks', hi: '20 से 24 हफ़्ते' }) + '</div><p>' + T({ en: "Two doctors' opinions, and only for these groups:", hi: 'दो डॉक्टरों की राय, और सिर्फ़ इन समूहों के लिए:' }) + '</p>' + ul([
        { en: 'survivors of rape, sexual assault or incest', hi: 'बलात्कार, यौन हमले या परिवार के अंदर यौन शोषण से बची महिलाएँ' },
        { en: 'girls under 18', hi: '18 से कम उम्र की लड़कियाँ' },
        { en: 'women widowed or divorced during the pregnancy', hi: 'गर्भ के दौरान विधवा हुई या तलाक़ हुई महिलाएँ' },
        { en: 'women with a major physical disability', hi: 'बड़ी शारीरिक विकलांगता वाली महिलाएँ' },
        { en: 'women with a mental illness', hi: 'मानसिक बीमारी वाली महिलाएँ' },
        { en: 'a serious abnormality in the baby', hi: 'बच्चे में गंभीर समस्या (विकृति)' },
        { en: 'a pregnancy in a disaster or emergency declared by the government', hi: 'सरकार की घोषित आपदा या आपात स्थिति में गर्भ' }
      ]) + '<p class="small">' + T({ en: 'In September 2022 the Supreme Court said this also covers unmarried women whose situation changed during the pregnancy, for example when a partner leaves. It also said that, for this law, forced sex by a husband counts as rape.', hi: 'सितंबर 2022 में सुप्रीम कोर्ट ने कहा कि इसमें वे अविवाहित महिलाएँ भी आती हैं जिनके हालात गर्भ के दौरान बदल गए, जैसे साथी छोड़कर चला गया। कोर्ट ने यह भी कहा कि इस क़ानून के लिए पति की ज़बरदस्ती भी बलात्कार मानी जाएगी।' }) + '</p></div>' +
      '<div class="pregtest-band"><div class="eyebrow">' + T({ en: 'After 24 weeks', hi: '24 हफ़्ते के बाद' }) + '</div><p>' + T({ en: 'Only when a Medical Board set up by the state finds a serious abnormality in the baby. At any stage, a doctor can end a pregnancy to save your life.', hi: 'सिर्फ़ तब, जब राज्य का बनाया Medical Board बच्चे में गंभीर समस्या (विकृति) पाए। किसी भी समय, आपकी जान बचाने के लिए डॉक्टर गर्भ ख़त्म कर सकते हैं।' }) + '</p></div></div>' +
      '<div class="card" id="pt-s-weeks"><h2>' + T({ en: 'Count your weeks', hi: 'अपने हफ़्ते गिनें' }) + '</h2><p class="small">' + T({ en: 'Doctors count from the first day of your last period. This is not saved.', hi: 'डॉक्टर पिछले पीरियड के पहले दिन से गिनते हैं। यह save नहीं होता।' }) + '</p><label for="pt-lmp">' + esc(t('pregtest_lmp')) + '</label><input type="date" id="pt-lmp" max="' + td + '" value="' + esc(mem.lmp) + '"><button type="button" class="btn primary block" id="pt-wk-go">' + esc(t('pregtest_weeks_btn')) + '</button><div id="pt-wk">' + weeksOut() + '</div></div>' +
      '<div class="card"><h2>' + T({ en: 'Your rights', hi: 'आपके अधिकार' }) + '</h2>' + ul([
        { en: 'Married or unmarried, the law is the same. The Supreme Court said so clearly in September 2022.', hi: 'शादीशुदा हों या नहीं, क़ानून एक ही है। सुप्रीम कोर्ट ने सितंबर 2022 में यह साफ़ कहा।' },
        { en: "If you are 18 or older, only your consent is needed. Not your husband's, not your family's. You don't need their signature, or a court order.", hi: '18 या उससे ज़्यादा उम्र है तो सिर्फ़ आपकी सहमति चाहिए। न पति की, न परिवार की। उनके हस्ताक्षर या कोर्ट के आदेश की ज़रूरत नहीं है।' },
        { en: 'It is confidential. By law the doctor cannot reveal your name or details, except to someone the law allows. A doctor who breaks this can face up to a year in jail.', hi: 'यह गोपनीय है। क़ानून के तहत डॉक्टर आपका नाम या जानकारी किसी को नहीं बता सकते, सिवाय उसके जिसे क़ानून इजाज़त दे। ऐसा करने वाले डॉक्टर को एक साल तक की जेल हो सकती है।' },
        { en: 'Government hospitals that provide it are meant to do it free: district hospitals, many CHCs and 24×7 PHCs, and medical colleges. Private clinics need government approval for MTP and charge a fee.', hi: 'जिन सरकारी अस्पतालों में यह सुविधा है, वहाँ यह मुफ़्त होनी चाहिए: ज़िला अस्पताल, कई CHC और 24×7 PHC, और मेडिकल कॉलेज। प्राइवेट क्लिनिक को MTP के लिए सरकारी मंज़ूरी चाहिए और वे फ़ीस लेते हैं।' },
        { en: "Finding out the baby's sex, or ending a pregnancy because of it, is a crime under the PCPNDT Act.", hi: 'बच्चे का लिंग पता करना, या उसकी वजह से गर्भ ख़त्म करना, PCPNDT क़ानून के तहत अपराध है।' }
      ]) + '</div>' +
      '<div class="card warn" id="pt-s-pills"><h2>' + T({ en: 'Abortion pills: only with a doctor', hi: 'गर्भपात की गोलियाँ: सिर्फ़ डॉक्टर की देखरेख में' }) + '</h2><p>' + T({ en: 'In India the pills (mifepristone with misoprostol) are approved up to 9 weeks (63 days) from the first day of your last period. A registered doctor prescribes them after examining you, with a hospital to send you to if needed.', hi: 'भारत में ये गोलियाँ (mifepristone और misoprostol) पिछले पीरियड के पहले दिन से 9 हफ़्ते (63 दिन) तक के लिए मंज़ूर हैं। रजिस्टर्ड डॉक्टर जाँच के बाद ही लिखते हैं, और ज़रूरत पड़े तो भेजने के लिए एक अस्पताल तय रहता है।' }) + '</p><p style="color:var(--fg);font-weight:600">' + T({ en: 'Taking them from a chemist without a check-up is risky:', hi: 'बिना जाँच के केमिस्ट से लेकर खाना ख़तरनाक है:' }) + '</p>' + ul([
        { en: "A pregnancy outside the womb (ectopic) can be missed. Pills don't treat it, and it can burst and bleed inside.", hi: 'बच्चेदानी के बाहर ठहरा गर्भ (ectopic) छूट सकता है। गोलियाँ उसका इलाज नहीं करतीं, और वह फटकर अंदर ख़ून बहा सकता है।' },
        { en: 'The abortion can be incomplete, with heavy bleeding or infection, and then need a procedure.', hi: 'गर्भपात अधूरा रह सकता है, जिससे भारी ब्लीडिंग या infection हो, और फिर प्रक्रिया करानी पड़े।' },
        { en: 'Past 9 weeks, or with severe anaemia, the bleeding is heavier and more dangerous.', hi: '9 हफ़्ते के बाद, या ख़ून की गंभीर कमी (anaemia) में, ब्लीडिंग ज़्यादा और ख़तरनाक होती है।' },
        { en: 'Herbal mixes, home remedies, or anything put inside the vagina do not end a pregnancy safely and can cause serious harm.', hi: 'जड़ी-बूटी के काढ़े, घरेलू नुस्ख़े, या योनि के अंदर कुछ भी डालना गर्भ को सुरक्षित तरीक़े से ख़त्म नहीं करता और गंभीर नुक़सान कर सकता है।' }
      ]) + '<p class="small">' + T({ en: "Qura's doctors are BAMS and cannot prescribe abortion pills. An MBBS doctor trained in MTP, or a gynaecologist, can.", hi: 'Qura की डॉक्टर BAMS हैं और गर्भपात की गोलियाँ नहीं लिख सकतीं। MTP में प्रशिक्षित MBBS डॉक्टर या स्त्री रोग विशेषज्ञ ही लिख सकते हैं।' }) + '</p></div>' +
      '<div class="card" id="pt-s-visit"><h2>' + T({ en: 'What happens at the visit', hi: 'अस्पताल में क्या होता है' }) + '</h2>' + steps([
        { en: 'A doctor or counsellor talks with you in private about your last period, your health and your choice. You can bring someone or come alone.', hi: 'डॉक्टर या counsellor अकेले में आपसे बात करती हैं: पिछला पीरियड, सेहत और आपका फ़ैसला। आप किसी को साथ ला सकती हैं या अकेले आ सकती हैं।' },
        { en: 'An examination, and often a scan, to count the weeks and check the pregnancy is in the womb. The scan follows PCPNDT rules, so the sex is never told.', hi: 'हफ़्ते गिनने और गर्भ बच्चेदानी में है या नहीं, यह देखने के लिए जाँच, और अक्सर scan। Scan PCPNDT नियमों से होता है, इसलिए लिंग कभी नहीं बताया जाता।' },
        { en: 'Blood tests may include haemoglobin and blood group. If your blood group is Rh negative, you may need an injection.', hi: 'Blood test में हीमोग्लोबिन और blood group हो सकते हैं। Blood group Rh negative हो, तो एक इंजेक्शन की ज़रूरत पड़ सकती है।' },
        { en: 'You sign a consent form (Form C). If you are under 18, a guardian signs too.', hi: 'आप सहमति पत्र (Form C) पर हस्ताक्षर करती हैं। 18 से कम उम्र हो तो अभिभावक भी हस्ताक्षर करते हैं।' },
        { en: 'Pills or a short procedure. With pills, the second medicine is taken about 2 days after the first. Cramps and bleeding usually start 1–3 hours after it and feel like a heavy period or a miscarriage.', hi: 'गोलियाँ या एक छोटी प्रक्रिया। गोलियों में दूसरी दवा पहली के लगभग 2 दिन बाद ली जाती है। ऐंठन और ब्लीडिंग आम तौर पर उसके 1–3 घंटे बाद शुरू होती है, जो भारी पीरियड या गर्भ गिरने जैसी लगती है।' },
        { en: 'You are offered contraception, which can start the same day if you want it. You also get a date for a follow-up check within about 2 weeks, to make sure the abortion is complete.', hi: 'आपको गर्भनिरोध का विकल्प दिया जाता है, चाहें तो उसी दिन से। साथ ही लगभग 2 हफ़्ते के अंदर follow-up जाँच की तारीख़ मिलती है, ताकि पक्का हो कि गर्भपात पूरा हुआ।' }
      ]) + '</div>' +
      '<div class="card dark"><h3>' + T({ en: 'Hospital now, or call 112, if after pills or a procedure you have:', hi: 'गोलियों या प्रक्रिया के बाद ये हों, तो अभी अस्पताल जाएँ या 112 पर कॉल करें:' }) + '</h3>' + ul(RED_NOW) + '<p class="small" style="color:var(--dark-text)">' + T({ en: 'Fever over 100.4°F (38°C) or a fever that lasts several hours, smelly discharge, or bleeding or pain that gets worse instead of better: see a doctor the same day.', hi: '100.4°F (38°C) से ऊपर बुख़ार या कई घंटे तक रहने वाला बुख़ार, बदबूदार पानी आना, या ब्लीडिंग या दर्द कम होने की जगह बढ़ना: उसी दिन डॉक्टर को दिखाएँ।' }) + '</p><div>' + darkBtn('pregtest-after', { en: 'After an abortion', hi: 'गर्भपात के बाद' }) + '</div></div>' +
      '<div class="card" id="pt-s-u18"><h2>' + T({ en: 'Under 18?', hi: '18 से कम उम्र?' }) + '</h2><p>' + T({ en: "You can still get safe care. A parent or guardian has to sign the consent. When a girl under 18 is pregnant, the POCSO law says the doctor must inform the police. This is not your fault, and you are not in trouble. Government guidelines say this report must not hold up your care. In 2022 the Supreme Court said that if you and your guardian ask, the doctor can leave your name and details out of that report. Childline 1098 is free, day and night, and can help you.", hi: 'आपको भी सुरक्षित इलाज मिल सकता है। माता-पिता या अभिभावक को सहमति पर हस्ताक्षर करने होते हैं। 18 से कम उम्र की लड़की गर्भवती हो, तो POCSO क़ानून के तहत डॉक्टर को पुलिस को बताना होता है। इसमें आपकी कोई ग़लती नहीं, और आप किसी मुसीबत में नहीं हैं। सरकारी दिशानिर्देश कहते हैं कि इस रिपोर्ट की वजह से आपका इलाज नहीं रुकना चाहिए। 2022 में सुप्रीम कोर्ट ने कहा कि अगर आप और आपके अभिभावक कहें, तो डॉक्टर उस रिपोर्ट में आपका नाम और जानकारी नहीं लिखेंगे। Childline 1098 मुफ़्त है, दिन-रात, और आपकी मदद कर सकती है।' }) + '</p>' + lines(['1098']) + '</div>' +
      '<div class="card soft"><h3>' + T({ en: "Qura's part", hi: 'Qura की भूमिका' }) + '</h3><p class="small">' + T({ en: "Qura's doctors don't provide abortion care. If you want help finding a registered gynaecologist or a government hospital near you, a Qura doctor can talk it through with you in private.", hi: 'Qura की डॉक्टर गर्भपात का इलाज नहीं करतीं। अगर आप अपने पास रजिस्टर्ड स्त्री रोग विशेषज्ञ या सरकारी अस्पताल ढूँढने में मदद चाहती हैं, तो Qura की डॉक्टर निजी तौर पर आपसे बात कर सकती हैं।' }) + '</p>' + askBtn({ en: 'Help finding a registered gynaecologist', hi: 'रजिस्टर्ड स्त्री रोग विशेषज्ञ ढूँढने में मदद' }) + '</div>' +
      '<p class="footnote">' + privNote() + '</p>' +
      '<p class="footnote">' + T({ en: 'Sources:', hi: 'स्रोत:' }) + ' ' + ext('https://egazette.gov.in/WriteReadData/2021/226130.pdf', { en: 'MTP (Amendment) Act, 2021, Gazette of India', hi: 'MTP (संशोधन) अधिनियम, 2021, भारत का राजपत्र' }) + ' · ' + ext('https://nhm.gov.in/images/pdf/programmes/maternal-health/guidelines/CAC_Training_&_Service_Guidelines_2023.pdf', { en: 'Comprehensive Abortion Care guidelines, NHM, 2023', hi: 'व्यापक गर्भपात देखभाल दिशानिर्देश, NHM, 2023' }) + '</p>';
    S.wire(v); wireCopy(v);
    v.querySelectorAll('[data-pt-jump]').forEach((b) => b.addEventListener('click', () => { const el = v.querySelector('#' + b.dataset.ptJump); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }));
    const inp = S.$('#pt-lmp', v);
    const go = () => { mem.lmp = inp.value || ''; S.$('#pt-wk', v).innerHTML = weeksOut(); };
    inp.addEventListener('change', go); S.$('#pt-wk-go', v).addEventListener('click', go);
  }

  /* ---------- after an abortion ---------- */
  function renderAfter(v) {
    own();
    v.innerHTML = S.backRow(t('pregtest_after'), 'pregtest', false) +
      '<p class="small">' + T({ en: 'Most women feel physically back to normal within a week or two. Bleeding and cramps that come and go are expected. The signs that need a doctor are at the end of this page.', hi: 'ज़्यादातर महिलाएँ एक-दो हफ़्ते में शरीर से ठीक महसूस करने लगती हैं। रुक-रुक कर ब्लीडिंग और ऐंठन होना आम है। किन लक्षणों में डॉक्टर ज़रूरी है, यह इस पन्ने के आख़िर में लिखा है।' }) + '</p>' +
      '<div class="card"><h2>' + T({ en: 'Bleeding and pain', hi: 'ब्लीडिंग और दर्द' }) + '</h2>' + ul([
        { en: 'After pills: heavy bleeding with clots and cramps for a few hours while the pregnancy passes, then lighter. It can go on, on and off, for about 8–13 days.', hi: 'गोलियों के बाद: गर्भ निकलते समय कुछ घंटे थक्कों और ऐंठन के साथ भारी ब्लीडिंग, फिर कम। यह रुक-रुक कर लगभग 8–13 दिन चल सकती है।' },
        { en: 'After a procedure: some bleeding or spotting, usually no heavier than a period, and it should get less day by day.', hi: 'प्रक्रिया के बाद: थोड़ी ब्लीडिंग या स्पॉटिंग, आम तौर पर पीरियड से ज़्यादा नहीं, और यह दिन-ब-दिन कम होनी चाहिए।' },
        { en: 'Cramps like period pain for a few days. Doctors often suggest ibuprofen; ask yours what suits you.', hi: 'कुछ दिन पीरियड जैसी ऐंठन। डॉक्टर अक्सर ibuprofen बताते हैं; अपनी डॉक्टर से पूछें कि आपके लिए क्या ठीक है।' },
        { en: "Use pads. For about a week, or until the bleeding stops, don't put anything inside the vagina and wait with sex.", hi: 'Pad इस्तेमाल करें। लगभग एक हफ़्ते, या ब्लीडिंग रुकने तक, योनि के अंदर कुछ न डालें और संबंध न बनाएँ।' },
        { en: 'If you bled a lot, or feel tired and breathless, ask for a haemoglobin test. It is free at a government hospital.', hi: 'ज़्यादा ब्लीडिंग हुई हो, या थकान और साँस फूलती हो, तो हीमोग्लोबिन जाँच माँगें। सरकारी अस्पताल में यह मुफ़्त है।' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Periods and getting pregnant again', hi: 'पीरियड और दोबारा गर्भ' }) + '</h2>' + ul([
        { en: 'Your next period usually comes 3–6 weeks later. No period by 6 weeks: see your doctor.', hi: 'अगला पीरियड आम तौर पर 3–6 हफ़्ते बाद आता है। 6 हफ़्ते तक पीरियड न आए: डॉक्टर को दिखाएँ।' },
        { en: 'You can get pregnant again before that period comes. Most women release an egg again within 2–6 weeks.', hi: 'उस पीरियड के आने से पहले भी आप फिर गर्भवती हो सकती हैं। ज़्यादातर महिलाओं में 2–6 हफ़्ते के अंदर फिर से अंडा बनने लगता है।' },
        { en: "So if you don't want another pregnancy now, start contraception right away. Most methods can start the same day. A Copper-T can go in during a procedure, or once the doctor is sure a pill abortion is complete.", hi: 'इसलिए अगर अभी दोबारा गर्भ नहीं चाहिए, तो गर्भनिरोध तुरंत शुरू करें। ज़्यादातर तरीक़े उसी दिन शुरू हो सकते हैं। Copper-T प्रक्रिया के समय लग सकता है, या गोलियों वाला गर्भपात पूरा होने की पुष्टि के बाद।' },
        { en: 'Go for the follow-up check, usually within 2 weeks, to make sure it is complete.', hi: 'Follow-up जाँच पर ज़रूर जाएँ, आम तौर पर 2 हफ़्ते के अंदर, ताकि पक्का हो कि गर्भपात पूरा हुआ।' },
        { en: "A home test can stay positive for several weeks even when the abortion worked. Don't use one to check unless your doctor tells you when.", hi: 'गर्भपात पूरा होने के बाद भी घर का test कई हफ़्ते positive दिखा सकता है। डॉक्टर के बताए बिना इससे जाँच न करें।' }
      ]) + goBtn('contra', { en: 'Choose a contraception method', hi: 'गर्भनिरोध का तरीक़ा चुनें' }) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Your feelings', hi: 'आपका मन' }) + '</h2><p>' + T({ en: "Relief, sadness, guilt, calm, or a mix: all of these are common, and they can change from day to day. You don't owe anyone an explanation. If low mood lasts most days for 2 weeks, or stops your daily life, talk to someone. Tele-MANAS 14416 is free, any time. Thoughts of harming yourself: call 14416 or 112 now.", hi: 'राहत, उदासी, ख़ुद को दोषी मानना, सुकून, या सब कुछ मिला-जुला: ये सब आम हैं, और दिन-ब-दिन बदल सकते हैं। आपको किसी को सफ़ाई देने की ज़रूरत नहीं। अगर दो हफ़्ते तक ज़्यादातर दिन मन उदास रहे या रोज़ के काम रुकने लगें, तो किसी से बात करें। Tele-MANAS 14416 मुफ़्त है, कभी भी। ख़ुद को नुक़सान पहुँचाने के विचार आएँ, तो अभी 14416 या 112 पर कॉल करें।' }) + '</p>' + lines(['14416']) + '</div>' +
      '<div class="card dark"><h3>' + T({ en: 'Call 112 or go to hospital now', hi: 'अभी 112 पर कॉल करें या अस्पताल जाएँ' }) + '</h3>' + ul(RED_NOW) + '</div>' +
      '<div class="card warn"><h3 style="color:var(--accent)">' + T({ en: 'See a doctor today', hi: 'आज ही डॉक्टर को दिखाएँ' }) + '</h3>' + ul(RED_TODAY) + '</div>' +
      askBtn({ en: 'Recovery questions (private)', hi: 'रिकवरी के सवाल (निजी)' }) +
      '<p class="footnote">' + privNote() + '</p>';
    S.wire(v); wireCopy(v);
  }

  /* ---------- registration ---------- */
  S.register({
    id: 'pregtest',
    demoPersona: 'asha',
    strings: {
      en: {
        pregtest_hub: 'Missed period: what now', pregtest_hub_s: 'Test timing, results, your choices, safe care',
        pregtest_when: 'When can I test?', pregtest_when_s: 'Your earliest reliable day and what each result means',
        pregtest_read: 'How to read a pregnancy test', pregtest_read_s: 'Pictures of C and T lines, faint and invalid results',
        pregtest_opts: "Pregnant and didn't plan it", pregtest_opts_s: 'Your choices, without judgement',
        pregtest_abort: 'Safe, legal abortion', pregtest_abort_s: 'The MTP law in plain words, a weeks counter, where it is free',
        pregtest_after: 'After an abortion', pregtest_after_s: 'Bleeding, periods, contraception, feelings, warning signs',
        pregtest_due: 'Expected period date', pregtest_sex: 'Date of unprotected sex (optional)', pregtest_calc: 'Show my test day', pregtest_earliest: 'Earliest reliable test day',
        pregtest_res_h: 'Got a result?', pregtest_r_pos: 'Positive', pregtest_r_neg: 'Negative, no period yet', pregtest_r_neg2: 'Negative twice, still no period', pregtest_r_flag: 'Pain, bleeding or fainting', pregtest_r_negs: 'Negative',
        pregtest_save: 'Save this result to my diary', pregtest_saved_h: 'Saved test results ({n})', pregtest_del: 'Delete',
        pregtest_lmp: 'First day of your last period', pregtest_weeks_btn: 'Count my weeks',
        pregtest_sum_t: 'Pregnancy test', pregtest_sum_l: 'Test result saved', pregtest_me_h: 'Saved test results', pregtest_me_s: '{n} saved. Open to see or delete.'
      },
      hi: {
        pregtest_hub: 'पीरियड नहीं आया: अब क्या करें', pregtest_hub_s: 'Test कब करें, result, आपके विकल्प, सुरक्षित इलाज',
        pregtest_when: 'Test कब कर सकती हूँ?', pregtest_when_s: 'सबसे जल्दी भरोसेमंद दिन, और हर result का मतलब',
        pregtest_read: 'Pregnancy test कैसे पढ़ें', pregtest_read_s: 'C और T लाइन की तस्वीरें, हल्की लाइन और ख़राब test',
        pregtest_opts: 'गर्भ ठहरा, पर योजना नहीं थी', pregtest_opts_s: 'आपके विकल्प, बिना किसी दबाव या ताने के',
        pregtest_abort: 'सुरक्षित, क़ानूनी गर्भपात', pregtest_abort_s: 'आसान शब्दों में MTP क़ानून, हफ़्तों का हिसाब, कहाँ मुफ़्त है',
        pregtest_after: 'गर्भपात के बाद', pregtest_after_s: 'ब्लीडिंग, पीरियड, गर्भनिरोध, मन, ख़तरे के संकेत',
        pregtest_due: 'पीरियड आने की अनुमानित तारीख़', pregtest_sex: 'बिना सुरक्षा के संबंध की तारीख़ (वैकल्पिक)', pregtest_calc: 'मेरा test का दिन दिखाएँ', pregtest_earliest: 'Test का सबसे जल्दी भरोसेमंद दिन',
        pregtest_res_h: 'Result आ गया?', pregtest_r_pos: 'Positive आया', pregtest_r_neg: 'Negative, पीरियड अभी नहीं आया', pregtest_r_neg2: 'दो बार negative, फिर भी पीरियड नहीं', pregtest_r_flag: 'दर्द, ब्लीडिंग या चक्कर', pregtest_r_negs: 'Negative आया',
        pregtest_save: 'यह result मेरी डायरी में save करें', pregtest_saved_h: 'Save किए गए test result ({n})', pregtest_del: 'हटाएँ',
        pregtest_lmp: 'पिछले पीरियड का पहला दिन', pregtest_weeks_btn: 'मेरे हफ़्ते गिनें',
        pregtest_sum_t: 'गर्भ का test', pregtest_sum_l: 'Test result save किया', pregtest_me_h: 'Save किए गए test result', pregtest_me_s: '{n} save हैं। देखने या हटाने के लिए खोलें।'
      }
    },
    routes: { 'pregtest': renderHub, 'pregtest-when': renderWhen, 'pregtest-read': renderRead, 'pregtest-options': renderOptions, 'pregtest-abortion': renderAbortion, 'pregtest-after': renderAfter },
    open: ['pregtest', 'pregtest-when', 'pregtest-read', 'pregtest-options', 'pregtest-abortion', 'pregtest-after'],
    tiles: [
      { section: 'pregtest', route: 'pregtest', title: 'pregtest_hub', sub: 'pregtest_hub_s', icon: 'help', order: 1, gated: false, keywords: 'late period missed period pregnancy test pregnant unplanned' },
      { section: 'pregtest', route: 'pregtest-when', title: 'pregtest_when', sub: 'pregtest_when_s', icon: 'clock', order: 10, gated: true, keywords: 'pregnancy test when hcg missed period late kit' },
      { section: 'pregtest', route: 'pregtest-read', title: 'pregtest_read', sub: 'pregtest_read_s', icon: 'drop', order: 20, gated: false, keywords: 'pregnancy test faint line positive negative invalid evaporation kit strip' },
      { section: 'pregtest', route: 'pregtest-options', title: 'pregtest_opts', sub: 'pregtest_opts_s', icon: 'users', order: 30, gated: false, keywords: 'unplanned pregnancy unwanted options adoption cara' },
      { section: 'pregtest', route: 'pregtest-abortion', title: 'pregtest_abort', sub: 'pregtest_abort_s', icon: 'lock', order: 40, gated: true, keywords: 'abortion mtp termination legal pills weeks garbhpat' },
      { section: 'pregtest', route: 'pregtest-after', title: 'pregtest_after', sub: 'pregtest_after_s', icon: 'heart', order: 50, gated: false, keywords: 'after abortion recovery bleeding period contraception' }
    ],
    css: [
      '.pregtest-res { flex-direction: row; align-items: center; gap: 12px; }',
      '.pregtest-res svg { width: 120px; height: 60px; flex-shrink: 0; }',
      '.pregtest-rb { min-width: 0; display: flex; flex-direction: column; gap: 4px; }',
      '.pregtest-kit .shell { fill: var(--card-2); stroke: var(--fg); stroke-width: 1.5; }',
      '.pregtest-kit .well { fill: var(--bg); stroke: var(--muted); stroke-width: 1.2; }',
      '.pregtest-kit .win { fill: var(--card); stroke: var(--muted); stroke-width: 1.2; }',
      '.pregtest-kit .ln { fill: var(--accent); }',
      '.pregtest-kit .ln.faint { opacity: 0.3; }',
      '.pregtest-kit .ln.evap { fill: var(--muted); opacity: 0.6; }',
      '.pregtest-kit .miss { fill: none; stroke: var(--muted); stroke-width: 1; stroke-dasharray: 2 2; }',
      '.pregtest-kit .clk circle { fill: var(--card); stroke: var(--gold); stroke-width: 1.3; }',
      '.pregtest-kit .clk path { fill: none; stroke: var(--gold); stroke-width: 1.3; stroke-linecap: round; }',
      '.pregtest-kit text { fill: var(--muted); font-size: 13px; font-weight: 600; font-family: var(--font-body); }',
      '.pregtest-day { font-family: var(--font-display); font-size: 30px; font-weight: 600; color: var(--accent); line-height: 1.15; }',
      'body.hi .pregtest-day { font-family: var(--font-hi); font-size: 24px; }',
      '.pregtest-band { display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-2); padding-left: 10px; }',
      '.pregtest-fi { flex-shrink: 0; width: 20px; height: 20px; display: inline-flex; }',
      '.pregtest-fi svg { width: 20px; height: 20px; }',
      '.pregtest-ft { min-width: 0; }',
      '.pregtest-hl { min-width: 0; }',
      '.pregtest-num { width: 28px; height: 28px; border-radius: 14px; background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.pregtest-band p { font-size: 14px; color: var(--text); }',
      '.pregtest-band ul { font-size: 14px; color: var(--text); }',
      '#pt-s-law, #pt-s-weeks, #pt-s-pills, #pt-s-visit, #pt-s-u18 { scroll-margin-top: 84px; }'
    ].join('\n'),
    me: (S2) => {
      if (!S2.canSave()) return ''; const L = saved(); if (!L.length) return '';
      return '<div class="list"><button type="button" class="item" data-go="pregtest-when"><span class="ico-sm">' + S2.I.lock + '</span><span class="body"><strong>' + esc(t('pregtest_me_h')) + '</strong><span>' + esc(fill(t('pregtest_me_s'), { n: L.length })) + '</span></span></button></div>';
    },
    summary: (S2) => {
      const L = saved(); if (!L.length) return [];
      return [{ title: t('pregtest_sum_t'), lines: L.slice(-3).map((x) => t('pregtest_sum_l') + ': ' + dayY(S2.fromISO(x.d)) + ' · ' + t(RES_LABEL[x.r] || 'pregtest_r_negs')) }];
    },
    afterRender: (v, route) => { if (!(route === 'pregtest' || String(route).indexOf('pregtest-') === 0)) fresh(); }
  });
})(window.Saathi);
