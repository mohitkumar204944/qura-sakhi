/* Should I get this checked? Short self-checks for PMOS, endometriosis and fibroids: the signs doctors ask about, how many she
   says yes to, how soon to see a doctor, what the doctor checks, where it is free, and when to go now. For PMOS it also says
   whether her answers match PMOS by the 2023 international PCOS guideline (see pmosVerdict): "match" words only, never "you
   have", always with the tests that rule out other causes and a doctor. Gated (needs approval before launch, like every helper
   that reads her signs). Her last result goes into the doctor summary and her report for any doctor. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const D = () => S.data('selfcheck');
  const sit = () => S.state.situation || {};
  /* Years since her first period, estimated the way the cycle maths does (first period at 13). */
  const ysm = () => { const a = S.cycle.ageYears(); return a == null ? 10 : a - 13; };
  /* A long gap: over 45 days in the first 3 years after periods start, over 35 after that (2023 guideline, 1.1.1). */
  const longDays = () => S.cycle.bandHi();
  /* Her diary shows irregular cycles: of her last 6 usable gaps (at least 3), 2 or more under 21 or over the long-gap limit, or
     any over 90 days. Gaps on hormones, in pregnancy or the year after a birth are already left out of usable(). */
  const diaryIrregular = () => { const g = S.cycle.usable().slice(-6); if (g.length < 3) return false; const hi = longDays(); return g.filter((x) => x > hi || x < 21).length >= 2 || g.some((x) => x > 90); };
  const BABY = L('Trying for a baby for a year (6 months if you are 35 or older) without getting pregnant.', 'एक साल से (35 या ज़्यादा उम्र में 6 महीने से) कोशिश के बाद भी प्रेग्नेंसी नहीं।');
  const GAPS = () => (longDays() === 45
    ? L('Your periods often come more than 45 days apart, or less than 21 days apart.', 'पीरियड अक्सर 45 दिन से ज़्यादा, या 21 दिन से कम के अंतर पर आते हैं।')
    : L('Your periods often come more than 35 days apart, or less than 21 days apart.', 'पीरियड अक्सर 35 दिन से ज़्यादा, या 21 दिन से कम के अंतर पर आते हैं।'));
  const FEW = () => (ysm() < 3
    ? L('A gap of more than 3 months between two periods.', 'दो पीरियड के बीच कभी 3 महीने से ज़्यादा का अंतर।')
    : L('Fewer than 8 periods in the last year.', 'पिछले साल में 8 से कम पीरियड।'));
  /* From her diary, a line under a question (never an answer chosen for her). */
  const hint = {
    gaps: () => { const g = S.cycle.usable().slice(-6); if (g.length < 3) return null; return tf('selfcheck_h_gaps', { n: g.filter((x) => x > longDays() || x < 21).length, m: g.length, d: longDays() }); },
    heavy: () => { const n = (S.state.events || []).filter((e) => e.t === 'start' && (e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked)).length; return n ? tf('selfcheck_h_heavy', { n: n }) : null; },
    pain: () => { let n = 0; for (let k = 0; k < 90; k++) { if (((S.state.daily || {})[S.toISO(S.addDays(S.today(), -k))] || []).indexOf('d_cramps') >= 0) n++; } return n ? tf('selfcheck_h_pain', { n: n }) : null; }
  };
  /* A question: [key, text (or a function giving it), diary hint, 'done' when the third answer means "not done" (a test or scan)]. */
  const C = {
    pmos: { t: 'selfcheck_pmos_t', more: 'pattern', hue: 'purple',
      q: [['gaps', GAPS, 'gaps'],
        ['few', FEW],
        ['hair', L('Extra hair on the face, chin, chest or belly.', 'चेहरे, ठुड्डी, छाती या पेट पर ज़्यादा बाल।')],
        ['acne', L('Acne that keeps coming back, often along the jaw.', 'बार-बार होने वाले मुँहासे, अक्सर जबड़े के पास।')],
        ['thin', L('Hair thinning on the top of the head.', 'सिर के ऊपर बाल पतले होना।')],
        ['test', L('A blood test showed high testosterone (a male hormone).', 'ख़ून की जाँच में testosterone (एक पुरुष हॉर्मोन) ज़्यादा आया।'), null, 'done'],
        ['scan', L('An ultrasound report said “polycystic ovaries” (PCO or PCOD), or a blood test showed high AMH.', 'अल्ट्रासाउंड रिपोर्ट में “polycystic ovaries” (PCO या PCOD) लिखा था, या ख़ून की जाँच में AMH ज़्यादा आया।'), null, 'done'],
        ['patch', L('Dark, velvety skin on the neck or underarms.', 'गर्दन या बगल में गहरी, मखमली त्वचा।')],
        ['baby', BABY]],
      doc: L('A doctor asks about your periods, checks your skin, hair, weight and BP, and may order blood tests for hormones, an ultrasound and a sugar test (the 2-hour glucose test is the most accurate). With PMOS the sugar test is repeated every 1 to 3 years.', 'डॉक्टर आपके पीरियड के बारे में पूछती हैं, त्वचा, बाल, वज़न और BP देखती हैं, और हॉर्मोन की ख़ून की जाँच, अल्ट्रासाउंड और sugar की जाँच (2 घंटे वाली glucose जाँच सबसे सही) करवा सकती हैं। PMOS में sugar की जाँच हर 1 से 3 साल में दोहराई जाती है।'),
      where: L('Free at a PHC or district hospital. A Qura doctor can also talk it through and order tests.', 'PHC या ज़िला अस्पताल में मुफ़्त। Qura की डॉक्टर भी बात करके जाँचें लिख सकती हैं।'),
      /* Fast-growing hair or a deeper voice is not typical of PMOS: tumours that make androgens must be ruled out (guideline 1.3.7). */
      soon: L('Hair that grew fast over a few months, or a voice that got deeper: see a doctor within 2 weeks. This isn’t typical of PMOS and needs tests.', 'कुछ महीनों में तेज़ी से बढ़े बाल, या आवाज़ भारी होना: 2 हफ़्ते के अंदर डॉक्टर को दिखाएँ। यह PMOS में आम नहीं है और इसकी जाँच ज़रूरी है।') },
    endo: { t: 'selfcheck_endo_t', more: 'cond-endo', hue: 'rose', urgentKey: 'heavy', strongKeys: ['stops', 'sex', 'toilet'],
      q: [['stops', L('Period pain that stops your day: work, school or housework.', 'पीरियड का दर्द जो दिन का काम रोक दे: काम, स्कूल या घर का काम।'), 'pain'],
        ['pills', L('Pain that a simple painkiller doesn’t help.', 'ऐसा दर्द जिसमें सामान्य दर्द की गोली काम न करे।')],
        ['sex', L('Pain during or after sex, deep inside.', 'सेक्स के दौरान या बाद में, अंदर गहराई में दर्द।')],
        ['toilet', L('Pain when passing stool or urine during your period.', 'पीरियड के दौरान मल या पेशाब करते समय दर्द।')],
        ['other', L('Pain low in the belly on days without your period.', 'बिना पीरियड वाले दिनों में भी पेट के निचले हिस्से में दर्द।')],
        ['heavy', L('Very heavy periods.', 'बहुत भारी पीरियड।'), 'heavy'],
        ['baby', BABY]],
      doc: L('A doctor talks through your pain, examines you and may do an ultrasound. Endometriosis is often confirmed only with a small operation (laparoscopy), so a gynaecologist decides.', 'डॉक्टर आपके दर्द के बारे में बात करती हैं, जाँच करती हैं और अल्ट्रासाउंड करवा सकती हैं। एंडोमेट्रियोसिस अक्सर एक छोटे ऑपरेशन (लैप्रोस्कोपी) से ही पक्का होता है, इसलिए यह स्त्री रोग विशेषज्ञ तय करती हैं।'),
      where: L('Free at a district hospital’s gynaecology clinic. A Qura doctor can talk it through and refer you to a gynaecologist.', 'ज़िला अस्पताल के स्त्री रोग विभाग में मुफ़्त। Qura की डॉक्टर बात करके आपको स्त्री रोग विशेषज्ञ के पास भेज सकती हैं।'),
      now: L('Sudden severe belly pain, or pain with fever or fainting: call 112 now.', 'अचानक पेट में बहुत तेज़ दर्द, या दर्द के साथ बुखार या बेहोशी: अभी 112 पर कॉल करें।') },
    fibroids: { t: 'selfcheck_fib_t', more: 'cond-fibroids', hue: 'orange', urgentKey: 'heavy',
      q: [['heavy', L('Periods so heavy you change a pad every 1 to 2 hours, or pass large clots.', 'इतने भारी पीरियड कि 1-2 घंटे में पैड बदलना पड़े, या बड़े थक्के आएँ।'), 'heavy'],
        ['long', L('Periods that last more than 7 days.', '7 दिन से ज़्यादा चलने वाले पीरियड।')],
        ['pressure', L('A feeling of pressure or heaviness low in the belly.', 'पेट के निचले हिस्से में दबाव या भारीपन।')],
        ['pee', L('Needing to pee often, or constipation.', 'बार-बार पेशाब आना, या कब्ज़।')],
        ['back', L('Lower back pain.', 'कमर के निचले हिस्से में दर्द।')],
        ['belly', L('A belly that looks swollen, without gaining weight.', 'वज़न बढ़े बिना पेट फूला हुआ दिखना।')],
        ['tired', L('Feeling very tired or breathless, which can come with heavy bleeding.', 'बहुत थकान या साँस फूलना, जो भारी ब्लीडिंग के साथ हो सकता है।')]],
      doc: L('An examination, an ultrasound and a blood test for Hb (anaemia).', 'शारीरिक जाँच, अल्ट्रासाउंड और Hb (ख़ून की कमी) की ख़ून जाँच।'),
      where: L('Free at a district hospital. A Qura doctor can talk it through and refer you to a gynaecologist.', 'ज़िला अस्पताल में मुफ़्त। Qura की डॉक्टर बात करके आपको स्त्री रोग विशेषज्ञ के पास भेज सकती हैं।'),
      now: L('Soaking a pad every hour for 2 hours or more, or heavy bleeding with dizziness: call 112 now.', 'हर घंटे पैड भीग जाए और ऐसा 2 घंटे या ज़्यादा चले, या भारी ब्लीडिंग के साथ चक्कर आएँ: अभी 112 पर कॉल करें।') }
  };
  const IDS = Object.keys(C);
  const qText = (q) => tx(typeof q[1] === 'function' ? q[1]() : q[1]);
  let ans = {};   /* answers in progress, per check: { key: 'y' | 'n' | 'u' }; cleared when the diary changes hands */
  if (S.onOwnerChange) S.onOwnerChange(() => { ans = {}; });
  const preg = () => !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* The PMOS verdict, from the 2023 international evidence-based PCOS guideline:
     - adults: 2 of 3, once other causes are ruled out: irregular periods (ovulatory dysfunction), high male hormones (unwanted
       hair growth, which the guideline treats as a valid self-report and as predictive on its own, or a blood test), and
       polycystic ovaries on ultrasound or a high AMH. Acne or thinning hair alone are weak signs and don't count here.
     - within 8 years of the first period (here: under 21): both irregular periods and high male hormones; no ultrasound or AMH;
       one of them = "at risk", checked again later.
     - no verdict under 18 (she and a parent decide with a doctor), around menopause, after a hysterectomy, after a birth or while
       breastfeeding (periods don't show her pattern), or in pregnancy (handled before this).
     A diagnosis she already has stays: she sees how her answers line up, with a note that it doesn't change her diagnosis. */
  function pmosVerdict(a) {
    const s = sit(); const age = S.cycle.ageYears();
    const born = s.deliveredOn ? S.diffDays(S.fromISO(s.deliveredOn), S.today()) : null;
    let who = 'adult';
    if (s.hysterectomy) who = 'hyst';
    else if (age != null && age < 18) who = 'minor';
    else if (S.cycle.isMidlife()) who = 'midlife';
    else if (s.breastfeeding || (born != null && born >= 0 && born < 365)) who = 'post';
    else if (ysm() < 8) who = 'young';
    const odAns = a.gaps === 'y' || a.few === 'y';
    const odDiary = !odAns && a.gaps !== 'n' && a.few !== 'n' && S.canSave() && diaryIrregular();
    const od = odAns || odDiary; const ha = a.hair === 'y' || a.test === 'y'; const weak = !ha && (a.acne === 'y' || a.thin === 'y');
    const pcom = who === 'adult' && a.scan === 'y';
    const n = (od ? 1 : 0) + (ha ? 1 : 0) + (pcom ? 1 : 0);
    let level = null;
    if (who === 'adult') level = n >= 2 ? 'match' : (n === 1 ? (pcom ? 'scan' : 'one') : 'none');
    else if (who === 'young') level = od && ha ? 'match' : (od || ha ? 'risk' : 'none');
    const odUnk = !od && (a.gaps === 'u' || a.few === 'u'); const haUnk = !ha && (a.hair === 'u' || a.test === 'u');
    return { who: who, known: !!s.pcos, od: od, odDiary: odDiary, odUnk: odUnk, ha: ha, haUnk: haUnk, weak: weak, pcom: pcom, scan: a.scan, n: n, level: level };
  }
  function verdictHTML(vd) {
    const known = vd.known ? '<p class="small sc-known">' + esc(t('selfcheck_v_known')) + '</p>' : '';
    if (!vd.level) return '<div class="card soft sc-vnote" id="sc-verdict" data-nofold="1">' + known + '<p class="small">' + esc(t('selfcheck_v_' + vd.who)) + '</p>' + (vd.who === 'midlife' && S.routeOwner('meno-timeline') ? '<button type="button" class="btn sm" data-go="meno-timeline">' + esc(t('selfcheck_v_tl')) + '</button>' : '') + '</div>';
    const y = vd.who === 'young';
    const row = (k, on, state) => '<li class="' + (on ? 'on' : '') + '"><span class="sc-tick" aria-hidden="true">' + (on ? TICK : '') + '</span><span class="body"><strong>' + esc(t('selfcheck_f_' + k)) + '</strong><span class="small">' + esc(state) + '</span></span></li>';
    const odS = vd.od ? t(vd.odDiary ? 'selfcheck_s_diary' : 'selfcheck_s_yes') : t(vd.odUnk ? 'selfcheck_s_unknown' : 'selfcheck_s_no');
    const haS = vd.ha ? t('selfcheck_s_yes') : t(vd.weak ? 'selfcheck_s_weak' : (vd.haUnk ? 'selfcheck_s_unknown' : 'selfcheck_s_no'));
    const pcS = y ? t('selfcheck_s_young') : (vd.pcom ? t('selfcheck_s_yes') : t(vd.scan === 'n' ? 'selfcheck_s_no' : 'selfcheck_s_unknown'));
    const lv = vd.level + (y && vd.level === 'match' ? '_y' : '');
    return '<div class="card sc-verdict sc-v-' + vd.level + '" id="sc-verdict" data-nofold="1"><span class="eyebrow">' + esc(t('selfcheck_v_eye')) + '</span>' + known +
      '<h3>' + esc(t('selfcheck_v_' + vd.level)) + '</h3><ul class="sc-feat">' + row('od', vd.od, odS) + row('ha', vd.ha, haS) + row('pc', vd.pcom, pcS) + '</ul>' +
      '<p class="small">' + esc(t('selfcheck_vx_' + lv)) + '</p>' +
      (vd.level === 'match' ? '<p class="small sc-rule">' + esc(t('selfcheck_v_rule')) + '</p>' : '') +
      (vd.weak && vd.level !== 'match' ? '<p class="small">' + esc(t('selfcheck_v_weak')) + '</p>' : '') +
      '<p class="footnote">' + esc(t('selfcheck_v_src')) + '</p></div>';
  }

  function renderList(v) {
    const last = (S.state.mods && S.state.mods.selfcheck) || {};
    v.innerHTML = S.backRow(t('selfcheck_h'), 'care', true) + '<p class="small">' + esc(t('selfcheck_p')) + '</p><div class="list">' +
      IDS.map((id) => { const r = last[id]; return '<button type="button" class="item" data-go="selfcheck-' + id + '"><span class="ico-sm hue hue-' + C[id].hue + '">' + S.I.check + '</span><span class="body"><strong>' + esc(t(C[id].t)) + '</strong><span>' + esc(r ? tf('selfcheck_last', { d: S.fmtD(S.fromISO(r.d)), n: r.n, m: r.m }) : tf('selfcheck_qs', { n: C[id].q.length })) + '</span></span><span class="chev">' + S.I.chev + '</span></button>'; }).join('') +
      '</div><p class="footnote">' + esc(t('selfcheck_foot')) + '</p>';
    S.wire(v);
  }
  function renderCheck(v, id) {
    const c = C[id]; if (!c) { renderList(v); return; }
    const a = ans[id] || (ans[id] = {}); const can = S.canSave(); const pg = preg();
    const done = c.q.every((q) => a[q[0]]); const yes = c.q.filter((q) => a[q[0]] === 'y'); const n = yes.length, m = c.q.length;
    const vd = id === 'pmos' && done && !pg ? pmosVerdict(a) : null;
    let when = c.urgentKey && a[c.urgentKey] === 'y' ? t('selfcheck_w_week') : (n >= 2 || (c.strongKeys || []).some((k) => a[k] === 'y') ? t('selfcheck_w_month') : (n === 1 ? t('selfcheck_w_watch') : t('selfcheck_w_none')));
    /* the line under the count agrees with the verdict: "at risk" in the early years is "keep noting it", not "this month" */
    if (vd && vd.level) when = vd.level === 'match' ? t('selfcheck_w_month') : (vd.level === 'risk' ? t('selfcheck_w_watch') : (vd.od || vd.ha ? t('selfcheck_w_month') : (n ? t('selfcheck_w_watch') : t('selfcheck_w_none'))));
    v.innerHTML = S.backRow(t(c.t), 'selfcheck', true) + '<p class="small">' + esc(t('selfcheck_intro')) + '</p>' +
      (pg ? '<div class="card soft"><p class="small">' + esc(t('selfcheck_preg')) + '</p><button type="button" class="btn sm" data-go="preg-symptoms">' + esc(t('selfcheck_preg_b')) + '</button></div>' : '') +
      (id === 'pmos' && sit().hormones && !pg ? '<div class="card soft"><p class="small">' + esc(t('selfcheck_horm')) + '</p></div>' : '') +
      (c.now ? '<div class="flag urgent">' + esc(t('selfcheck_now_h')) + ': ' + esc(tx(c.now)) + '</div>' : '') +
      (c.soon ? '<div class="flag">' + esc(t('selfcheck_soon_h')) + ': ' + esc(tx(c.soon)) + '</div>' : '') +
      c.q.map((q, i) => { const hv = can && q[2] && hint[q[2]] ? hint[q[2]]() : null;
        return '<div class="card sc-q"><p><b class="num">' + (i + 1) + '.</b> ' + esc(qText(q)) + '</p>' + (hv ? '<p class="small sc-hint">' + esc(t('selfcheck_from')) + ' ' + esc(hv) + '</p>' : '') +
          '<div class="chips" role="group">' + [['y', 'selfcheck_yes'], ['n', 'selfcheck_no'], ['u', q[3] === 'done' ? 'selfcheck_notdone' : 'selfcheck_unsure']].map((o) => '<button type="button" class="chip' + (a[q[0]] === o[0] ? ' on' : '') + '" data-sc="' + q[0] + '" data-v="' + o[0] + '" aria-pressed="' + (a[q[0]] === o[0]) + '">' + esc(t(o[1])) + '</button>').join('') + '</div></div>'; }).join('') +
      (done ? (vd ? verdictHTML(vd) : '') + '<div class="card sc-res" id="sc-res" data-nofold="1"><h3>' + esc(tf('selfcheck_count', { n: n, m: m })) + '</h3>' + (n ? '<ul class="sc-yes">' + yes.map((q) => '<li>' + esc(qText(q)) + '</li>').join('') + '</ul>' : '') + '<p class="lead">' + esc(when) + '</p><p class="small">' + esc(t('selfcheck_nd')) + '</p></div>' +
        '<div class="card"><h3>' + esc(t('selfcheck_doc_h')) + '</h3><p class="small">' + esc(tx(c.doc)) + '</p><h3>' + esc(t('selfcheck_where_h')) + '</h3><p class="small">' + esc(tx(c.where)) + '</p></div>' +
        '<div class="grid2">' + (S.routeOwner(c.more) || c.more === 'pattern' ? '<button type="button" class="btn" data-go="' + c.more + '">' + esc(t('selfcheck_more')) + '</button>' : '') + (can ? '<button type="button" class="btn" data-go="report">' + esc(t('selfcheck_report')) + '</button>' : '') + '</div>' +
        '<button type="button" class="btn primary block" data-ask="' + esc(t(c.t)) + '">' + esc(t('selfcheck_ask')) + '</button><button type="button" class="linkbtn" id="sc-redo">' + esc(t('selfcheck_redo')) + '</button>'
        : '<p class="small sc-left">' + esc(t('selfcheck_answer_all')) + '</p>') +
      '<p class="footnote">' + esc(t('selfcheck_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-sc]').forEach((b) => b.addEventListener('click', () => {
      a[b.dataset.sc] = b.dataset.v; const wasDone = done; const y = window.scrollY;
      const nowDone = c.q.every((q) => a[q[0]]);
      if (nowDone && can && !preg()) {
        const d = D(); const r = { d: S.toISO(S.today()), n: c.q.filter((q) => a[q[0]] === 'y').length, m: c.q.length, yes: c.q.filter((q) => a[q[0]] === 'y').map((q) => q[0]) };
        if (id === 'pmos') { const x = pmosVerdict(a); if (x.level) r.v = x.level; }
        d[id] = r; S.save();
      }
      renderCheck(v, id); window.scrollTo(0, y);
      if (nowDone && !wasDone) { const r = document.getElementById(id === 'pmos' && !preg() ? 'sc-verdict' : 'sc-res'); if (r) r.scrollIntoView({ block: 'start' }); }
    }));
    const rd = v.querySelector('#sc-redo'); if (rd) rd.addEventListener('click', () => { ans[id] = {}; renderCheck(v, id); window.scrollTo(0, 0); });
  }
  /* For the doctor summary and her report: her last answers, in her words, and for PMOS what they matched. */
  function summary() {
    const d = (S.state.mods && S.state.mods.selfcheck) || {}; const lines = [];
    IDS.forEach((id) => { const r = d[id]; if (!r) return; const words = (r.yes || []).map((k) => { const q = C[id].q.find((x) => x[0] === k); return q ? qText(q).replace(/\.$/, '') : k; }); lines.push(tf('selfcheck_sum', { c: t(C[id].t), d: S.fmtD(S.fromISO(r.d)), n: r.n, m: r.m }) + (r.v ? ' (' + t('selfcheck_sum_v_' + r.v) + ')' : '') + (words.length ? ': ' + words.join('; ') : '')); });
    return lines.length ? [{ title: t('selfcheck_h'), lines: lines }] : [];
  }

  S.register({
    id: 'selfcheck',
    demoPersona: 'priya',
    strings: {
      en: {
        selfcheck_h: 'Should I get this checked?', selfcheck_tile_s: 'PMOS, endometriosis, fibroids: the signs doctors ask about',
        selfcheck_p: 'Answer a few questions about signs doctors ask about. Sakhi shows how soon to see a doctor and what they check. For PMOS it also shows whether your answers match the signs doctors use. It is not a diagnosis.',
        selfcheck_intro: 'Answer each one for how things have been in the last few months.', selfcheck_qs: '{n} questions', selfcheck_last: 'Last time, {d}: yes to {n} of {m}',
        selfcheck_pmos_t: 'PMOS', selfcheck_endo_t: 'Endometriosis', selfcheck_fib_t: 'Fibroids',
        selfcheck_yes: 'Yes', selfcheck_no: 'No', selfcheck_unsure: 'Not sure', selfcheck_notdone: 'Not done', selfcheck_from: 'From your diary:',
        selfcheck_h_gaps: '{n} of your last {m} gaps were outside 21 to {d} days.', selfcheck_h_heavy: 'you logged {n} heavy periods.', selfcheck_h_pain: 'cramps on {n} days in the last 90.',
        selfcheck_answer_all: 'Answer each question to see what it means.', selfcheck_count: 'You said yes to {n} of the {m} signs doctors ask about.',
        selfcheck_w_week: 'See a doctor this week: periods this heavy can make you low on blood.', selfcheck_w_month: 'See a doctor this month.', selfcheck_w_watch: 'Keep noting it in your diary. See a doctor if it carries on or gets worse.', selfcheck_w_none: 'None of these right now. Keep your diary going: it helps a doctor if anything changes.',
        selfcheck_nd: 'This is not a diagnosis. These signs have many causes, and only a doctor’s exam and tests can tell what is going on.',
        selfcheck_doc_h: 'What a doctor checks', selfcheck_where_h: 'Where to go', selfcheck_now_h: 'Go now if', selfcheck_soon_h: 'See a doctor soon if',
        selfcheck_more: 'Read about it', selfcheck_report: 'My report for the doctor', selfcheck_ask: 'Talk to a Qura doctor about this', selfcheck_redo: 'Start again',
        selfcheck_preg: 'You are marked as pregnant. These checks are about periods. For anything that worries you in pregnancy, use the pregnancy symptoms guide.', selfcheck_preg_b: 'Pregnancy symptoms guide',
        selfcheck_horm: 'You are on a hormonal method (like the pill), which changes your periods and can hide signs. Answer about how things were before you started it.',
        selfcheck_v_eye: 'PMOS (PCOS): what your answers match',
        selfcheck_v_match: 'Your answers match PMOS (PCOS)',
        selfcheck_vx_match: 'Doctors call it PMOS when at least 2 of these 3 are there and other causes are ruled out.',
        selfcheck_vx_match_y: 'Under about 21, doctors need both irregular periods and signs of high male hormones, and they don’t use an ultrasound. Your answers have both.',
        selfcheck_v_rule: 'An app can’t rule out other causes. A doctor does that with blood tests for thyroid, prolactin and other hormones. Only then is it PMOS.',
        selfcheck_v_one: 'Your answers match 1 of the 3 signs of PMOS',
        selfcheck_vx_one: 'One sign isn’t enough for PMOS. Irregular periods and extra hair can have other causes, like thyroid, high prolactin or a change in weight, so it’s still worth a doctor’s check.',
        selfcheck_v_scan: 'A scan finding on its own doesn’t mean PMOS',
        selfcheck_vx_scan: 'Many women with regular periods have ovaries that look like this on a scan. Doctors need one more sign: irregular periods, or signs of high male hormones.',
        selfcheck_v_risk: 'At risk: 1 of the 2 signs doctors need at your age',
        selfcheck_vx_risk: 'Under about 21, periods and skin are still settling. With one sign, doctors call it “at risk” and check again in a year or two. See a doctor if it bothers you.',
        selfcheck_v_none: 'Your answers don’t match PMOS',
        selfcheck_vx_none: 'If something still worries you, a doctor can check.',
        selfcheck_v_weak: 'Acne or thinning hair on their own are weaker signs. If they bother you, a blood test for testosterone can show whether your hormones are high.',
        selfcheck_v_src: 'Based on the 2023 international PCOS guideline. Not a diagnosis: only a doctor can confirm it.',
        selfcheck_f_od: 'Irregular periods', selfcheck_f_ha: 'Signs of high male hormones', selfcheck_f_pc: 'Polycystic ovaries on a scan',
        selfcheck_s_yes: 'Yes', selfcheck_s_no: 'No', selfcheck_s_diary: 'Yes, from your diary', selfcheck_s_weak: 'Only acne or thinning hair, weaker signs', selfcheck_s_unknown: 'Not known', selfcheck_s_young: 'Not used before about 21',
        selfcheck_v_known: 'You told Sakhi a doctor has diagnosed PMOS. This shows how your answers line up with the signs doctors use. It doesn’t change your diagnosis: signs often ease with treatment, and PMOS needs care for the long term.',
        selfcheck_v_post: 'After a birth and while you breastfeed, periods can stay away or come unevenly, so this check can’t say whether your answers match PMOS. Try it again once your periods have settled, and show these signs to a doctor if they bother you.',
        selfcheck_v_midlife: 'Around menopause, periods change on their own, so this check can’t say whether your answers match PMOS. Your signs still matter: show them to a doctor.',
        selfcheck_v_hyst: 'After a hysterectomy there are no periods to go by, so this check can’t say whether your answers match PMOS. Your signs still matter: show them to a doctor.',
        selfcheck_v_minor: 'Before 18, periods and skin are still settling, so doctors are careful about naming PMOS. If you said yes to these signs, see a doctor with your mother or another adult you trust.',
        selfcheck_v_tl: 'My menopause timeline',
        selfcheck_sum: '{c} ({d}): yes to {n} of {m} signs', selfcheck_foot: 'The same questions for everyone, from what doctors commonly ask. Not a diagnosis.',
        selfcheck_sum_v_match: 'answers match PMOS by the 2023 criteria; other causes not yet ruled out', selfcheck_sum_v_one: '1 of 3 PMOS criteria', selfcheck_sum_v_scan: 'an ultrasound finding only', selfcheck_sum_v_risk: 'at risk: 1 of 2 criteria, under 21', selfcheck_sum_v_none: 'answers don’t match PMOS'
      },
      hi: {
        selfcheck_h: 'क्या मुझे जाँच करानी चाहिए?', selfcheck_tile_s: 'PMOS, एंडोमेट्रियोसिस, फाइब्रॉइड: डॉक्टर किन संकेतों के बारे में पूछते हैं',
        selfcheck_p: 'उन संकेतों के बारे में कुछ सवालों के जवाब दें जिनके बारे में डॉक्टर पूछते हैं। Sakhi बताएगी कि डॉक्टर को कितनी जल्दी दिखाएँ और वे क्या जाँचते हैं। PMOS के लिए यह भी कि आपके जवाब डॉक्टरों के संकेतों से मेल खाते हैं या नहीं। यह जाँच का नतीजा नहीं है।',
        selfcheck_intro: 'पिछले कुछ महीनों में जैसा रहा, उसके हिसाब से हर सवाल का जवाब दें।', selfcheck_qs: '{n} सवाल', selfcheck_last: 'पिछली बार, {d}: {m} में से {n} पर हाँ',
        selfcheck_pmos_t: 'PMOS', selfcheck_endo_t: 'एंडोमेट्रियोसिस', selfcheck_fib_t: 'फाइब्रॉइड (बच्चेदानी की गाँठ)',
        selfcheck_yes: 'हाँ', selfcheck_no: 'नहीं', selfcheck_unsure: 'पता नहीं', selfcheck_notdone: 'जाँच नहीं हुई', selfcheck_from: 'आपकी डायरी से:',
        selfcheck_h_gaps: 'पिछले {m} में से {n} अंतर 21 से {d} दिन के बाहर थे।', selfcheck_h_heavy: 'आपने {n} भारी पीरियड दर्ज किए।', selfcheck_h_pain: 'पिछले 90 में से {n} दिन ऐंठन।',
        selfcheck_answer_all: 'मतलब देखने के लिए हर सवाल का जवाब दें।', selfcheck_count: 'डॉक्टर जिन {m} संकेतों के बारे में पूछते हैं, उनमें से {n} पर आपने हाँ कहा।',
        selfcheck_w_week: 'इसी हफ़्ते डॉक्टर को दिखाएँ: इतने भारी पीरियड से ख़ून की कमी हो सकती है।', selfcheck_w_month: 'इसी महीने डॉक्टर को दिखाएँ।', selfcheck_w_watch: 'इसे डायरी में नोट करती रहें। यह बना रहे या बढ़े, तो डॉक्टर को दिखाएँ।', selfcheck_w_none: 'अभी इनमें से कुछ नहीं। डायरी लिखती रहें: कुछ बदले तो इससे डॉक्टर को मदद मिलती है।',
        selfcheck_nd: 'यह जाँच का नतीजा नहीं है। इन संकेतों की कई वजहें होती हैं, और क्या हो रहा है, यह सिर्फ़ डॉक्टर की जाँच और टेस्ट से पता चलता है।',
        selfcheck_doc_h: 'डॉक्टर क्या जाँचते हैं', selfcheck_where_h: 'कहाँ जाएँ', selfcheck_now_h: 'तुरंत जाएँ अगर', selfcheck_soon_h: 'जल्दी डॉक्टर को दिखाएँ अगर',
        selfcheck_more: 'इसके बारे में पढ़ें', selfcheck_report: 'डॉक्टर के लिए मेरी रिपोर्ट', selfcheck_ask: 'इस बारे में Qura की डॉक्टर से बात करें', selfcheck_redo: 'फिर से शुरू करें',
        selfcheck_preg: 'आपने गर्भवती चुना है। ये जाँचें पीरियड के बारे में हैं। प्रेग्नेंसी में किसी भी चिंता के लिए प्रेग्नेंसी लक्षण गाइड देखें।', selfcheck_preg_b: 'प्रेग्नेंसी लक्षण गाइड',
        selfcheck_horm: 'आप हॉर्मोन वाला तरीक़ा (जैसे गोली) ले रही हैं, जिससे पीरियड बदलते हैं और संकेत छिप सकते हैं। इसे शुरू करने से पहले जैसा था, उसके हिसाब से जवाब दें।',
        selfcheck_v_eye: 'PMOS (PCOS): आपके जवाब किससे मेल खाते हैं',
        selfcheck_v_match: 'आपके जवाब PMOS (PCOS) से मेल खाते हैं',
        selfcheck_vx_match: 'जब इन 3 में से कम से कम 2 हों और दूसरी वजहें हटा दी जाएँ, तब डॉक्टर इसे PMOS कहते हैं।',
        selfcheck_vx_match_y: 'लगभग 21 की उम्र से पहले डॉक्टरों को अनियमित पीरियड और पुरुष हॉर्मोन के संकेत, दोनों चाहिए, और वे अल्ट्रासाउंड नहीं देखते। आपके जवाबों में दोनों हैं।',
        selfcheck_v_rule: 'दूसरी वजहें कोई app नहीं हटा सकता। डॉक्टर यह थायरॉइड, prolactin और दूसरे हॉर्मोन की ख़ून की जाँच से करती हैं। उसके बाद ही यह PMOS है।',
        selfcheck_v_one: 'आपके जवाब PMOS के 3 में से 1 संकेत से मेल खाते हैं',
        selfcheck_vx_one: 'PMOS के लिए एक संकेत काफ़ी नहीं। अनियमित पीरियड और ज़्यादा बाल की दूसरी वजहें भी होती हैं, जैसे थायरॉइड, prolactin ज़्यादा होना या वज़न बदलना, इसलिए डॉक्टर से जाँच फिर भी ठीक है।',
        selfcheck_v_scan: 'सिर्फ़ स्कैन की बात से PMOS नहीं होता',
        selfcheck_vx_scan: 'नियमित पीरियड वाली बहुत सी महिलाओं के अंडाशय भी स्कैन में ऐसे दिखते हैं। डॉक्टरों को एक और संकेत चाहिए: अनियमित पीरियड, या पुरुष हॉर्मोन ज़्यादा होने के संकेत।',
        selfcheck_v_risk: 'जोखिम में: आपकी उम्र में ज़रूरी 2 में से 1 संकेत',
        selfcheck_vx_risk: 'लगभग 21 से पहले पीरियड और त्वचा अभी ठहर रहे होते हैं। एक संकेत हो तो डॉक्टर इसे “जोखिम में” कहते हैं और एक-दो साल बाद फिर देखते हैं। परेशानी हो तो डॉक्टर को दिखाएँ।',
        selfcheck_v_none: 'आपके जवाब PMOS से मेल नहीं खाते',
        selfcheck_vx_none: 'फिर भी कोई चिंता हो, तो डॉक्टर जाँच कर सकती हैं।',
        selfcheck_v_weak: 'सिर्फ़ मुँहासे या पतले बाल कमज़ोर संकेत हैं। परेशान करें, तो testosterone की ख़ून की जाँच से पता चल सकता है कि हॉर्मोन ज़्यादा हैं या नहीं।',
        selfcheck_v_src: '2023 की अंतरराष्ट्रीय PCOS गाइडलाइन पर आधारित। यह जाँच का नतीजा नहीं: पक्का सिर्फ़ डॉक्टर कर सकती हैं।',
        selfcheck_f_od: 'अनियमित पीरियड', selfcheck_f_ha: 'पुरुष हॉर्मोन ज़्यादा होने के संकेत', selfcheck_f_pc: 'स्कैन में polycystic ovaries',
        selfcheck_s_yes: 'हाँ', selfcheck_s_no: 'नहीं', selfcheck_s_diary: 'हाँ, आपकी डायरी से', selfcheck_s_weak: 'सिर्फ़ मुँहासे या पतले बाल, कमज़ोर संकेत', selfcheck_s_unknown: 'पता नहीं', selfcheck_s_young: 'लगभग 21 से पहले नहीं देखते',
        selfcheck_v_known: 'आपने Sakhi को बताया है कि डॉक्टर ने PMOS बताया है। यह दिखाता है कि आपके जवाब डॉक्टरों के संकेतों से कैसे मिलते हैं। इससे आपका diagnosis नहीं बदलता: इलाज से संकेत अक्सर कम होते हैं, और PMOS में लंबे समय तक देखभाल चाहिए।',
        selfcheck_v_post: 'डिलीवरी के बाद और दूध पिलाते समय पीरियड रुके रह सकते हैं या बेतरतीब आ सकते हैं, इसलिए यह जाँच नहीं बता सकती कि आपके जवाब PMOS से मेल खाते हैं या नहीं। पीरियड ठहर जाएँ तो फिर से करें, और ये संकेत परेशान करें तो डॉक्टर को दिखाएँ।',
        selfcheck_v_midlife: 'मेनोपॉज़ के आसपास पीरियड अपने आप बदलते हैं, इसलिए यह जाँच नहीं बता सकती कि आपके जवाब PMOS से मेल खाते हैं या नहीं। आपके संकेत फिर भी ज़रूरी हैं: डॉक्टर को दिखाएँ।',
        selfcheck_v_hyst: 'बच्चेदानी निकलने (hysterectomy) के बाद पीरियड नहीं होते, इसलिए यह जाँच नहीं बता सकती कि आपके जवाब PMOS से मेल खाते हैं या नहीं। आपके संकेत फिर भी ज़रूरी हैं: डॉक्टर को दिखाएँ।',
        selfcheck_v_minor: '18 से पहले पीरियड और त्वचा अभी ठहर रहे होते हैं, इसलिए डॉक्टर PMOS का नाम देने में सावधानी रखते हैं। इन संकेतों पर हाँ कहा हो, तो अपनी माँ या किसी भरोसेमंद बड़े के साथ डॉक्टर को दिखाएँ।',
        selfcheck_v_tl: 'मेरी मेनोपॉज़ टाइमलाइन',
        selfcheck_sum: '{c} ({d}): {m} में से {n} संकेतों पर हाँ', selfcheck_foot: 'सबके लिए एक जैसे सवाल, जो डॉक्टर आम तौर पर पूछते हैं। यह जाँच का नतीजा नहीं है।',
        selfcheck_sum_v_match: 'जवाब 2023 के मानकों पर PMOS से मेल खाते हैं; दूसरी वजहें अभी हटाई नहीं गईं', selfcheck_sum_v_one: 'PMOS के 3 में से 1 मानक', selfcheck_sum_v_scan: 'सिर्फ़ अल्ट्रासाउंड की बात', selfcheck_sum_v_risk: 'जोखिम में: 2 में से 1 मानक, 21 से कम उम्र', selfcheck_sum_v_none: 'जवाब PMOS से मेल नहीं खाते'
      }
    },
    routes: { selfcheck: renderList },
    prefixes: { 'selfcheck-': (v, rest) => renderCheck(v, rest) },
    testRoutes: ['selfcheck-pmos', 'selfcheck-endo', 'selfcheck-fibroids'],
    open: ['selfcheck', 'selfcheck-*'],
    tiles: [{ section: 'cond', route: 'selfcheck', title: 'selfcheck_h', sub: 'selfcheck_tile_s', icon: 'check', order: 3, gated: true, keywords: 'pmos pcos pcod endometriosis fibroids check test signs symptoms gaanth jaanch' }],
    summary: summary,
    css: '.sc-q { gap: 8px; } .sc-q p { margin: 0; color: var(--fg); } .sc-hint { color: var(--muted) !important; } .sc-res h3 { margin: 0; } .sc-yes { margin: 0; padding-left: 18px; color: var(--fg); display: grid; gap: 2px; } .sc-left { text-align: center; }' +
      ' .sc-verdict { gap: 10px; } .sc-verdict h3 { margin: 0; font-size: 19px; color: var(--fg); } .sc-v-match { box-shadow: inset 0 0 0 2px var(--accent); }' +
      ' .sc-feat { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; } .sc-feat li { display: flex; gap: 10px; align-items: flex-start; }' +
      ' .sc-feat .body { display: flex; flex-direction: column; min-width: 0; } .sc-feat strong { color: var(--fg); font-size: 14px; } .sc-feat .small { color: var(--muted); }' +
      ' .sc-tick { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1.5px var(--line); }' +
      ' .sc-feat li.on .sc-tick { background: var(--accent-strong); box-shadow: none; color: #FFFFFF; } .sc-tick svg { width: 14px; height: 14px; }' +
      ' .sc-rule { color: var(--fg) !important; font-weight: 600; } .sc-known { color: var(--fg) !important; }'
  });
})(window.Saathi);
