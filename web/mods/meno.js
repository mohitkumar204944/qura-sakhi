/* Menopause beyond the midlife picture: a weekly symptom diary, hormone therapy explained, bones and heart, dryness and urine changes after menopause, and surgical menopause. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const ID = 'meno';

  /* Reading never creates storage: state.mods.meno is written only when she taps "Save this week". */
  const peekDiary = () => ((((S.state.mods || {})[ID]) || {}).diary || {});
  const D = () => S.data(ID);

  /* Draft, chosen week and open confirmations live only in memory and reset when she leaves the diary or a sample loads. */
  let mem = { owner: null, week: null, draft: null, confirm: false, sel: null };
  const fresh = () => { mem = { owner: S.state, week: null, draft: null, confirm: false, sel: null }; };
  const own = () => { if (mem.owner !== S.state) fresh(); };

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const P = (o, cls) => '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + T(o) + '</p>';
  const H2 = (o) => '<h2>' + T(o) + '</h2>';
  const H3 = (o, style) => '<h3' + (style ? ' style="' + style + '"' : '') + '>' + T(o) + '</h3>';
  const LP = (label, o) => '<p><strong class="meno-lab">' + T(label) + '</strong> ' + T(o) + '</p>';
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol>';
  const card = (inner, cls, attr) => '<div class="card' + (cls ? ' ' + cls : '') + '"' + (attr ? ' ' + attr : '') + '>' + inner + '</div>';
  const intro = (o) => '<p class="small">' + T(o) + '</p>';
  const goBtn = (route, label) => '<button type="button" class="btn sm meno-self" data-go="' + esc(route) + '">' + T(label) + '</button>';
  const linkItem = (route, icon, title, sub, pill) => '<button type="button" class="item" data-go="' + esc(route) + '"><span class="ico-sm">' + S.icon(icon) + '</span><span class="body"><strong>' + T(title) + '</strong>' + (sub ? '<span>' + T(sub) + '</span>' : '') + '</span>' + (pill ? '<span class="pill meno-pill">' + esc(pill) + '</span>' : '') + '</button>';
  const flag = (o, urgent) => '<div class="flag' + (urgent ? ' urgent' : '') + '"><span class="meno-fi">' + S.I.help + '</span><span class="meno-ft">' + T(o) + '</span></div>';
  const planFor = (k) => (k && S.plan && S.plan.forRow ? S.plan.forRow(k) : '');   /* Version 39.53: her plan for this page's subject, when one fits */
  const askCard = (topic, body) => '<div class="card dark"><h3>' + esc(t('qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + T(body) + '</p><button type="button" class="btn sm meno-self" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button></div>';
  const sources = (list) => '<details><summary>' + esc(t('sources')) + '</summary><p class="sources">' + esc(tx({ en: '', hi: 'ये स्रोत अंग्रेज़ी में हैं: ' }) + list.join(' · ')) + '</p></details>';
  const related = (items) => H2({ en: 'Related pages', hi: 'इससे जुड़े पन्ने' }) + '<div class="list">' + items.join('') + '</div>';
  const notDx = () => '<p class="footnote">' + T({ en: 'Same text for everyone. Not a diagnosis. Your doctor decides what is right for you.', hi: 'सबके लिए एक जैसा। यह diagnosis नहीं है। आपके लिए क्या ठीक है, यह आपकी डॉक्टर तय करती हैं।' }) + '</p>';
  const privacyLine = () => T(S.canSave()
    ? { en: 'This page saves nothing. On a shared phone, Discreet mode on the Me page hides your numbers and renames the diary to Notes.', hi: 'यह पन्ना कुछ भी save नहीं करता। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपाता है और डायरी का नाम “नोट्स” कर देता है।' }
    : { en: 'This page saves nothing.', hi: 'यह पन्ना कुछ भी save नहीं करता।' });

  const PAD112 = { en: 'Soaking a pad every 1–2 hours and feeling dizzy or breathless: go to the nearest hospital now.', hi: 'हर 1–2 घंटे में pad भीगना और चक्कर या साँस फूलना: अभी सबसे पास के अस्पताल जाएँ।' };
  const MED_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/></svg>';

  /* ---------- weekly diary data ---------- */
  const SYM = ['hot', 'sweats', 'sleep', 'mood', 'anxiety', 'joints', 'dryness', 'urine', 'palp', 'fog', 'desire', 'head'];
  const LV = [0, 1, 2, 3];
  const zero = () => { const o = {}; SYM.forEach((s) => { o[s] = 0; }); return o; };
  const monday = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return S.addDays(x, -((x.getDay() + 6) % 7)); };
  const wk = (d) => S.toISO(monday(d));
  const shortD = (key) => { const a = S.fromISO(key); return a.getDate() + '/' + (a.getMonth() + 1); };
  const lvOf = (e, s) => { const n = e && e.v ? Number(e.v[s]) : 0; return n >= 1 && n <= 3 ? Math.round(n) : 0; };
  const loggedKeys = (dia) => Object.keys(dia).filter((k) => dia[k] && dia[k].v && /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();

  function stats() {
    const dia = peekDiary(); const keys = loggedKeys(dia);
    const cur = wk(S.today()); const from4 = S.toISO(S.addDays(S.fromISO(cur), -21));
    const last4 = keys.filter((k) => k >= from4 && k <= cur);
    const freq = SYM.map((s) => ({ k: s, n: last4.filter((k) => lvOf(dia[k], s) > 0).length, lot: last4.filter((k) => lvOf(dia[k], s) === 3).length }))
      .filter((x) => x.n > 0).sort((a, b) => (b.n - a.n) || (b.lot - a.lot));
    return { dia: dia, keys: keys, last4: last4, freq: freq, cur: cur };
  }
  function weekOptions() {
    const cur = S.fromISO(wk(S.today())); const out = [];
    for (let i = 0; i < 8; i++) {
      const a = S.addDays(cur, -7 * i);
      const name = i === 0 ? t('meno_this_wk') : (i === 1 ? t('meno_last_wk') : S.tf('meno_n_wk', { n: i }));
      out.push({ key: S.toISO(a), label: name + ' · ' + S.fmtRange(a, S.addDays(a, 6)) });
    }
    return out;
  }
  /* Version 38: the midlife plan's results and Today: weeks with a symptom between two dates (week keys are Mondays), and
     whether this week is noted */
  S.meno = Object.assign(S.meno || {}, {
    trend: (key, fromISO, toISO) => { const dia = peekDiary(); const ks = loggedKeys(dia).filter((k) => k >= wk(S.fromISO(fromISO)) && k <= toISO); return { weeks: ks.length, on: ks.filter((k) => lvOf(dia[k], key) > 0).length }; },
    thisWeek: () => !!peekDiary()[wk(S.today())],
    /* Version 39.5: the week of that day has its diary (a plan step counts from it) */
    diaryOn: (iso) => !!peekDiary()[wk(S.fromISO(iso))] });
  const draftFor = (key) => { const e = peekDiary()[key]; const d = zero(); if (e && e.v) SYM.forEach((s) => { d[s] = lvOf(e, s); }); return d; };

  /* ---------- hub ---------- */
  /* Her menopause timeline: the stages, and her own facts (her last period, months without one out of 12, the longest gap this
     year). Counts only, never a stage label about her except the definition itself (12 months without a period). */
  function renderTimeline(v) {
    const tf = S.tf; const can = S.canSave(); const st = S.cycle.starts(); const sit = S.state.situation || {}; const age = S.cycle.ageYears();
    let facts = ''; let mDone = false;
    /* Menopause means 12 months without a period from 45, not on hormones (NICE NG23 1.2.1). Before 40 that is POI, which
       needs a gynaecologist; 40 to 45 is early menopause. Pregnancy, the year after a birth, breastfeeding, hormones and a
       hysterectomy stop periods for other reasons, so the timeline says why instead of counting. */
    const born = sit.deliveredOn ? S.diffDays(S.fromISO(sit.deliveredOn), S.today()) : null;
    const why = S.cycle.isPregnant() ? 'preg' : (sit.breastfeeding || (born != null && born >= 0 && born < 365) ? 'post' : (sit.hormones ? 'horm' : (sit.hysterectomy ? 'hyst' : null)));
    const young = age != null && age < 40, early = age != null && age >= 40 && age < 45;
    const poiCard = (txt) => '<div class="flag"><span class="meno-ft">' + esc(txt) + '</span></div>' + goBtn('cond-poi', { en: 'Read about POI', hi: 'POI के बारे में पढ़ें' });
    if (can && why) facts = '<div class="card soft meno-tl-me"><p class="small" style="color:var(--fg)">' + esc(t('meno_tl_why_' + why)) + '</p></div>';
    else if (can && young && sit.stopped) facts = '<div class="card meno-tl-me">' + poiCard(t('meno_tl_poi0')) + '</div>';
    else if (can && st.length) {
      const last = S.fromISO(st[st.length - 1]); const today = S.today();
      /* Whole calendar months since her last period (the 31st counts to the last day of shorter months). */
      const plus = (n) => { const d = new Date(last.getFullYear(), last.getMonth() + n, 1); d.setDate(Math.min(last.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return d; };
      let m = 0; while (m < 600 && plus(m + 1) <= today) m++;
      mDone = m >= 12;
      const yearAgo = S.addDays(today, -365); const gaps = [S.diffDays(last, today)]; for (let i = 1; i < st.length; i++) { if (S.fromISO(st[i]) >= yearAgo) gaps.push(S.diffDays(S.fromISO(st[i - 1]), S.fromISO(st[i]))); }
      if (young) facts = '<div class="card meno-tl-me">' + (m >= 4 ? poiCard(tf('meno_tl_poi', { m: m })) : '<p class="small">' + esc(t('meno_tl_young')) + '</p>') + '</div>';
      else {
        facts = '<div class="card meno-tl-me"><p class="lead">' + esc(tf('meno_tl_last', { d: S.fmtD(last, { day: 'numeric', month: 'long', year: 'numeric' }) })) + '</p>' +
          (mDone ? '<div class="flag' + (early ? '' : ' ok') + '">' + esc(t(early ? 'meno_tl_done_early' : 'meno_tl_done')) + '</div>' : (m >= 2 ? '<div class="meno-tl-bar" role="img" aria-label="' + esc(tf('meno_tl_months', { m: m })) + '">' + Array.from({ length: 12 }, (x, i) => '<i class="' + (i < m ? 'on' : '') + '"></i>').join('') + '</div><p class="small">' + esc(tf('meno_tl_months', { m: m })) + '</p>' : '<p class="small">' + esc(t('meno_tl_still')) + '</p>')) +
          (!mDone && (gaps.length > 1 || m >= 2) ? '<p class="small">' + esc(tf('meno_tl_gap', { n: Math.max.apply(null, gaps) })) + '</p>' : '') + '</div>';   /* after 12 months the count says it all */
      }
    } else if (can) facts = '<div class="card soft"><p class="small">' + esc(t('meno_tl_none')) + '</p></div>';
    mDone = mDone && !young && !why;
    /* Version 39.0 (journey audit P0 1): after 12 months with no period, ask once whether her periods have stopped, so any
       bleeding from now on gets its own check */
    const askStop = can && mDone && !sit.stopped && !((S.state.prompts || {}).stopAsk);
    if (askStop) facts += '<div class="card meno-stopq"><h3>' + esc(t('meno_stop_q')) + '</h3><p class="small">' + esc(t('meno_stop_p')) + '</p><div class="grid2"><button type="button" class="btn sm primary" id="meno-stop-y">' + esc(t('meno_stop_y')) + '</button><button type="button" class="btn sm" id="meno-stop-n">' + esc(t('meno_stop_n')) + '</button></div></div>';
    const stage = (k, on) => '<div class="meno-tl-st' + (on ? ' on' : '') + '"><b>' + esc(t('meno_tl_' + k)) + '</b><span class="small">' + esc(t('meno_tl_' + k + 'p')) + '</span></div>';
    const rel = (r, icon, title) => (S.routeOwner(r) ? linkItem(r, icon, title, '') : '');
    v.innerHTML = S.backRow(t('meno_tl_h'), 'meno', false) + '<p class="small">' + esc(t('meno_tl_p')) + '</p>' + facts +
      '<div class="meno-tl">' + stage('s1', false) + stage('s2', mDone) + stage('s3', false) + '</div>' +
      '<h2>' + esc(t('meno_tl_relief')) + '</h2><div class="list">' + rel('relief-hot', 'leaf', t('meno_tl_hot')) + rel('relief-sleep', 'moon', t('meno_tl_sleep')) + rel('calm', 'moon', t('calm_row')) +   /* Version 39.21: Wind down */
      linkItem('meno-diary', 'chart', t('meno_diary'), t('meno_diary_s')) + linkItem('meno-score', 'check', t('meno_sc_h'), t('meno_sc_s')) + linkItem('meno-hrt', 'pill', t('meno_hrt'), t('meno_hrt_s')) + linkItem('meno-bones', 'heart', t('meno_bones'), t('meno_bones_s')) + linkItem('meno-intimate', 'flower', t('meno_intimate'), t('meno_intimate_s')) + '</div>' +
      '<button type="button" class="btn primary block" data-ask="' + esc(t('meno_hub')) + '">' + esc(t('meno_tl_ask')) + '</button><p class="footnote">' + esc(t('meno_tl_foot')) + '</p>';
    S.wire(v);
    const sy = v.querySelector('#meno-stop-y'), sn = v.querySelector('#meno-stop-n');
    const said = (yes) => { const s0 = S.state.situation; if (yes) { s0.stopped = true; s0.midlife = true; s0.stoppedOn = lastBleed() || S.toISO(S.today()); } S.state.prompts = Object.assign({}, S.state.prompts || {}, { stopAsk: S.toISO(S.today()) }); S.save(); S.render(); };
    if (sy) sy.addEventListener('click', () => said(true)); if (sn) sn.addEventListener('click', () => said(false));
  }
  /* Today: a year since her last period (45 or older, or in midlife), until she answers on the timeline */
  /* review XS-1: the last day she bled, from her last period (its end when she logged one) */
  const lastBleed = () => { const st = S.cycle.starts(); const ls = st[st.length - 1]; if (!ls) return ''; const n = S.cycle.periodLen ? S.cycle.periodLen(ls) : null; return n ? S.toISO(S.addDays(S.fromISO(ls), n - 1)) : ls; };
  /* whole calendar months since a date (the 31st counts to the last day of shorter months), as the timeline counts them */
  const monthsSince = (last) => { const today = S.today(); const plus = (n) => { const d = new Date(last.getFullYear(), last.getMonth() + n, 1); d.setDate(Math.min(last.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return d; }; let m = 0; while (m < 600 && plus(m + 1) <= today) m++; return m; };
  function stopDue() {
    const sit = S.state.situation || {}; if (!S.canSave() || sit.stopped || sit.hysterectomy || sit.hormones || sit.breastfeeding || S.cycle.isPregnant() || (S.state.prompts || {}).stopAsk) return false;
    const age = S.cycle.ageYears(); if (!(age != null && age >= 40)) return false;   /* review XS-6: from 40, as the timeline asks */
    const born = sit.deliveredOn ? S.diffDays(S.fromISO(sit.deliveredOn), S.today()) : null; if (born != null && born >= 0 && born < 365) return false;
    const ls = S.cycle.lastStart(); return !!ls && monthsSince(ls) >= 12;   /* review XS-7: 12 calendar months, like the timeline */
  }
  function renderHub(v) {
    v.innerHTML = S.backRow(t('meno_hub'), 'care', false) +
      intro({ en: 'Menopause is your last period. Doctors call it menopause once 12 months have passed without one. Most of the changes come in the years before that, often from your early or mid-40s. Hot flushes, poor sleep and mood swings are common, and they can be treated. You don’t have to put up with them because someone says it is just age.', hi: 'मेनोपॉज़ यानी आपका आख़िरी पीरियड। जब 12 महीने तक पीरियड न आए, तब डॉक्टर इसे मेनोपॉज़ कहते हैं। ज़्यादातर बदलाव उससे पहले के सालों में आते हैं, अक्सर 40 से 45 की उम्र के आसपास से। गर्मी के झोंके, ख़राब नींद और मन का बार-बार बदलना आम है, और इनका इलाज है। “यह तो उम्र है” सुनकर इन्हें सहते रहना ज़रूरी नहीं।' }) +
      '<div class="card soft meno-stat"><b class="num">46</b><span class="small">' + T({ en: 'The average age at menopause in India, about 5 years earlier than in Western countries. From an Indian Menopause Society survey of 2,108 women in 21 cities (2016).', hi: 'भारत में मेनोपॉज़ की औसत उम्र, पश्चिमी देशों से लगभग 5 साल पहले। Indian Menopause Society का 21 शहरों की 2,108 महिलाओं पर सर्वे (2016)।' }) + '</span></div>' +
      '<div class="list">' +
      linkItem('meno-timeline', 'clock', t('meno_tl_h'), t('meno_tl_s')) +
      linkItem('meno-score', 'check', t('meno_sc_h'), t('meno_sc_s'), S.flags.proto ? t('gated_short') : '') +
      linkItem('midlife', 'moon', t('midlife'), t('midlife_d'), S.flags.proto ? t('gated_short') : '') +
      linkItem('meno-diary', 'chart', t('meno_diary'), t('meno_diary_s'), S.flags.proto ? t('gated_short') : '') +
      linkItem('meno-hrt', 'pill', t('meno_hrt'), t('meno_hrt_s')) +
      linkItem('meno-bones', 'heart', t('meno_bones'), t('meno_bones_s')) +
      linkItem('meno-intimate', 'flower', t('meno_intimate'), t('meno_intimate_s')) +
      linkItem('meno-surgical', MED_SVG, t('meno_surgical'), t('meno_surgical_s')) +
      '</div>' +
      card(H2({ en: 'What you may notice', hi: 'आपको क्या महसूस हो सकता है' }) + ul([
        { en: 'Periods closer together or further apart, lighter or heavier, and then they stop', hi: 'पीरियड पास-पास या देर से, कम या ज़्यादा, और फिर बंद' },
        { en: 'Hot flushes: sudden heat in the face, neck and chest, often with sweating. Night sweats that wake you up', hi: 'गर्मी के झोंके: चेहरे, गर्दन और छाती में अचानक गर्मी, अक्सर पसीने के साथ। रात का पसीना जो नींद तोड़ दे' },
        { en: 'Poor sleep, tiredness, irritability, low mood or anxiety', hi: 'ख़राब नींद, थकान, चिड़चिड़ापन, उदासी या घबराहट' },
        { en: 'Joint aches, headaches, forgetting things, finding it hard to concentrate', hi: 'जोड़ों में दर्द, सिरदर्द, बातें भूलना, ध्यान न लग पाना' },
        { en: 'Vaginal dryness, pain with sex, less interest in sex, needing to pee often', hi: 'योनि में सूखापन, संबंध के समय दर्द, संबंध में कम रुचि, बार-बार पेशाब' }
      ]) + P({ en: 'Hot flushes and sweats can go on for months or years. Dryness and urine problems often don’t settle on their own, so they are worth treating.', hi: 'गर्मी के झोंके और पसीना महीनों या सालों तक चल सकते हैं। सूखापन और पेशाब की परेशानी अक्सर अपने आप ठीक नहीं होती, इसलिए इनका इलाज कराना ठीक है।' }, 'small')) +
      card(H2({ en: 'What helps, starting this week', hi: 'इसी हफ़्ते से क्या मदद करता है' }) + steps([
        { en: 'Keep cool: a fan by the bed, cotton clothes in layers you can take off, cold water close by.', hi: 'ठंडक रखें: बिस्तर के पास पंखा, सूती कपड़े परतों में जिन्हें उतार सकें, पास में ठंडा पानी।' },
        { en: 'Notice what sets off your flushes. Hot tea, spicy food, alcohol, smoking and stress are common triggers.', hi: 'देखें कि झोंके किससे आते हैं। गरम चाय, तीखा खाना, शराब, धूम्रपान और तनाव आम वजहें हैं।' },
        { en: 'Move most days: a brisk 30-minute walk, and strength exercise twice a week. It helps sleep, mood, weight and bones.', hi: 'ज़्यादातर दिन चलें-फिरें: 30 मिनट तेज़ चाल, और हफ़्ते में दो बार ताक़त वाली कसरत। इससे नींद, मन, वज़न और हड्डियों को फ़ायदा होता है।' },
        { en: 'Keep a sleep routine: the same bedtime, a cool dark room, your phone away for the last half hour.', hi: 'सोने का नियम रखें: रोज़ एक ही समय, ठंडा और अँधेरा कमरा, सोने से पहले आधा घंटा फ़ोन दूर।' },
        { en: 'Talking therapy (CBT) helps many women with hot flushes and sleep. Ask your doctor where you can get it.', hi: 'बातचीत वाली therapy (CBT) से बहुत सी महिलाओं को गर्मी के झोंकों और नींद में मदद मिलती है। डॉक्टर से पूछें कि यह कहाँ मिलेगी।' }
      ]) + '<p class="note">' + T({ en: 'Herbal and “natural hormone” products are sold widely for menopause. There is little proof that they work or that they are safe, and some clash with other medicines. Tell your doctor about anything you take.', hi: 'मेनोपॉज़ के लिए जड़ी-बूटी और “natural hormone” वाले products ख़ूब बिकते हैं। इनके असर या सुरक्षा का पक्का सबूत बहुत कम है, और कुछ दूसरी दवाओं के साथ टकराते हैं। जो भी लेती हैं, डॉक्टर को बताएँ।' }) + '</p>') +
      card(H3({ en: 'Can I still get pregnant?', hi: 'क्या अब भी गर्भ ठहर सकता है?' }) +
        P({ en: 'Yes, for a while. Keep using contraception until your periods have stopped for 2 years if you are under 50, or for 1 year if you are over 50, or until you turn 55. Hormone therapy does not prevent pregnancy.', hi: 'हाँ, कुछ समय तक। गर्भनिरोध तब तक चालू रखें जब तक पीरियड बंद हुए 2 साल न हो जाएँ (अगर आप 50 से कम हैं), या 1 साल (अगर 50 से ऊपर हैं), या 55 की उम्र तक। हॉर्मोन therapy से गर्भ नहीं रुकता।' }) +
        P({ en: 'On a hormonal method, your periods can’t tell you when you have reached menopause. Ask your doctor when to stop.', hi: 'हॉर्मोन वाले तरीक़े पर हों तो पीरियड से पता नहीं चलता कि मेनोपॉज़ हुआ या नहीं। कब बंद करना है, डॉक्टर से पूछें।' }, 'small') +
        goBtn('contra', { en: 'Contraception options', hi: 'गर्भनिरोध के तरीक़े' }), 'warn') +
      card(H3({ en: 'Before 45', hi: '45 से पहले' }, 'color:var(--accent)') + ul([
        { en: 'Periods stopped, or menopause symptoms, before 40: see a gynaecologist. This is called premature ovarian insufficiency (POI). It needs treatment, not waiting.', hi: '40 से पहले पीरियड बंद, या मेनोपॉज़ जैसे लक्षण: स्त्री रोग विशेषज्ञ (gynaecologist) को दिखाएँ। इसे premature ovarian insufficiency (POI) कहते हैं। इसमें इंतज़ार नहीं, इलाज चाहिए।' },
        { en: 'Between 40 and 45: tell your doctor too. Losing oestrogen early means your bones and heart need care sooner.', hi: '40 से 45 के बीच: डॉक्टर को ज़रूर बताएँ। एस्ट्रोजन जल्दी कम होने का मतलब है कि हड्डियों और दिल की देखभाल जल्दी शुरू करनी है।' }
      ]) + goBtn('cond-poi', { en: 'Read about POI', hi: 'POI के बारे में पढ़ें' })) +
      card(H3({ en: 'When to see a doctor', hi: 'डॉक्टर को कब दिखाएँ' }, 'color:var(--accent)') + ul([
        { en: 'Any bleeding or spotting after 12 months without a period, even once: see a gynaecologist within 2 weeks', hi: '12 महीने पीरियड न आने के बाद कोई भी ब्लीडिंग या धब्बे, चाहे एक बार ही: 2 हफ़्ते के अंदर gynaecologist को दिखाएँ' },
        { en: 'Periods every 2–3 weeks, lasting more than 8 days, very heavy, or bleeding after sex: this week', hi: 'हर 2–3 हफ़्ते में पीरियड, 8 दिन से ज़्यादा, बहुत भारी, या संबंध के बाद ब्लीडिंग: इसी हफ़्ते' },
        { en: 'Hot flushes, poor sleep or mood changes that get in the way of work or family life: book a visit, there is treatment', hi: 'गर्मी के झोंके, ख़राब नींद या मन के बदलाव जो काम या घर-परिवार में रुकावट डालें: डॉक्टर से मिलें, इलाज है' },
        t('s6a')
      ]) + flag(PAD112, true) +
        P({ en: 'Where: the gynaecology OPD of a district hospital or medical college. BP and sugar checks are free at your nearest Ayushman Arogya Mandir; your ASHA can tell you where it is.', hi: 'कहाँ: ज़िला अस्पताल या मेडिकल कॉलेज की gynaecology OPD। BP और sugar की जाँच नज़दीकी आयुष्मान आरोग्य मंदिर में मुफ़्त है; आपकी ASHA बता देंगी कि वह कहाँ है।', doc: { en: 'Where: a gynaecologist, or the gynaecology OPD of a district hospital or medical college. BP and sugar checks are also free at your nearest Ayushman Arogya Mandir.', hi: 'कहाँ: स्त्री रोग विशेषज्ञ, या ज़िला अस्पताल या मेडिकल कॉलेज की gynaecology OPD। BP और sugar की जाँच नज़दीकी आयुष्मान आरोग्य मंदिर में मुफ़्त भी है।' } }, 'small') +
        '') +
      planFor('meno') + askCard({ en: 'Menopause symptoms', hi: 'मेनोपॉज़ के लक्षण' }, { en: 'On a free call a Qura doctor (BAMS) goes through your diary with you, helps with sleep, food, weight and movement, orders tests, and refers you to an MBBS gynaecologist if you want hormone therapy.', hi: 'मुफ़्त कॉल पर Qura की डॉक्टर (BAMS) आपकी डायरी आपके साथ देखती हैं, नींद, खाने, वज़न और कसरत में मदद करती हैं, जाँच लिखती हैं, और अगर आप हॉर्मोन therapy चाहें तो MBBS gynaecologist के पास refer करती हैं।' }) +
      sources(['Ahuja M. Age of menopause and determinants of menopause age: a PAN India survey by IMS. J Mid-life Health 2016', 'Indian Menopause Society. Clinical practice guidelines on menopause 2019–2020. J Mid-life Health 2020', 'NHS: Menopause treatment', 'NHS Devon sexual health: contraception in the perimenopause (FSRH)']) + notDx();
    S.wire(v);
  }

  /* ---------- weekly symptom diary ---------- */
  function legend() {
    return '<div class="meno-legend">' + LV.map((n) => '<span><i class="meno-sw meno-l' + n + ' num">' + n + '</i>' + esc(t('meno_l' + n)) + '</span>').join('') + '</div>';
  }
  function formHTML() {
    const dia = peekDiary(); const key = mem.week; const exists = !!(dia[key] && dia[key].v); const dr = mem.draft;
    const opts = weekOptions();
    let h = H2({ en: 'Log a week', hi: 'एक हफ़्ता दर्ज करें' }) +
      '<label for="meno-week">' + T({ en: 'Which week?', hi: 'कौन सा हफ़्ता?' }) + '</label>' +
      '<select id="meno-week">' + opts.map((o) => '<option value="' + esc(o.key) + '"' + (o.key === key ? ' selected' : '') + '>' + esc(o.label + (dia[o.key] && dia[o.key].v ? ' ✓' : '')) + '</option>').join('') + '</select>' +
      '<p class="meno-q">' + T({ en: 'How much did each one bother you that week?', hi: 'उस हफ़्ते हर एक ने कितना परेशान किया?' }) + '</p>' + legend() +
      '<div class="meno-rows">' + SYM.map((s) => '<div class="meno-row"><span class="meno-lbl" id="meno-l-' + s + '">' + esc(t('meno_s_' + s)) + '</span><div class="meno-seg" role="group" aria-labelledby="meno-l-' + s + '">' +
        LV.map((n) => '<button type="button" class="meno-b' + (dr[s] === n ? ' on' : '') + '" data-sym="' + s + '" data-lv="' + n + '" aria-pressed="' + (dr[s] === n) + '" aria-label="' + esc(t('meno_s_' + s) + ': ' + n + ', ' + t('meno_l' + n)) + '">' + n + '</button>').join('') + '</div></div>').join('') + '</div>' +
      (exists ? '<p class="small">' + T({ en: 'You already logged this week. Saving replaces that entry.', hi: 'यह हफ़्ता पहले से दर्ज है। सेव करने पर पुरानी entry बदल जाएगी।' }) + '</p>' : '') +
      '<button type="button" class="btn primary block" id="meno-save">' + esc(t('meno_save_wk')) + '</button>';
    if (exists) {
      h += mem.confirm
        ? '<div class="card soft meno-confirm"><p class="small" style="color:var(--fg)">' + esc(S.tf('meno_del_q', { w: S.fmtRange(S.fromISO(key), S.addDays(S.fromISO(key), 6)) })) + '</p><div class="grid2"><button type="button" class="btn sm" id="meno-del-no">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" id="meno-del-yes">' + esc(t('yes_delete')) + '</button></div></div>'
        : '<button type="button" class="btn ghost sm meno-self" id="meno-del">' + esc(t('meno_del_wk')) + '</button>';
    }
    return h + '<p class="small">' + T({ en: 'Saved only on this phone, and only when you tap Save. On a shared phone, Discreet mode on the Me page hides your numbers.', hi: 'सिर्फ़ इसी फ़ोन पर, और सिर्फ़ “सेव” दबाने पर save होता है। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपाता है।' }) + '</p>';
  }
  function wireForm(box) {
    const sel = box.querySelector('#meno-week');
    if (sel) sel.addEventListener('change', () => { mem.week = sel.value; mem.draft = draftFor(mem.week); mem.confirm = false; drawForm(box); });
    box.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => {
      const s = b.dataset.sym; const n = Number(b.dataset.lv); mem.draft[s] = n;
      box.querySelectorAll('[data-sym="' + s + '"]').forEach((x) => { const on = Number(x.dataset.lv) === n; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
    }));
    box.querySelector('#meno-save').addEventListener('click', () => {
      const d = D(); d.diary = d.diary || {};
      d.diary[mem.week] = { v: Object.assign(zero(), mem.draft), at: S.toISO(S.today()) };
      mem.confirm = false; S.save(); S.toast(t('meno_saved')); S.render();
    });
    const del = box.querySelector('#meno-del'); if (del) del.addEventListener('click', () => { mem.confirm = true; drawForm(box); });
    const no = box.querySelector('#meno-del-no'); if (no) no.addEventListener('click', () => { mem.confirm = false; drawForm(box); });
    const yes = box.querySelector('#meno-del-yes'); if (yes) yes.addEventListener('click', () => {
      const d = D(); if (d.diary) { delete d.diary[mem.week]; if (!Object.keys(d.diary).length) delete d.diary; }
      if (!Object.keys(d).length && S.state.mods) delete S.state.mods[ID];
      mem.confirm = false; mem.draft = zero(); S.save(); S.toast(t('meno_deleted')); S.render();
    });
  }
  function drawForm(box) { box.innerHTML = formHTML(); wireForm(box); }

  function gridHTML(dia, keys) {
    const ks = keys.slice(-8);
    let h = '<div class="meno-gridwrap"><div class="meno-grid" style="grid-template-columns:minmax(0,1fr) repeat(' + ks.length + ',24px)">';
    h += '<span class="gl gx">' + T({ en: 'Week of', hi: 'हफ़्ता' }) + '</span>' + ks.map((k, i) => { const d = S.fromISO(k); const mo = i === 0 || S.fromISO(ks[i - 1]).getMonth() !== d.getMonth(); return '<span class="gh num" aria-label="' + esc(shortD(k)) + '">' + d.getDate() + '<small>' + (mo ? esc(S.fmtD(d, { month: 'short' })) : '&nbsp;') + '</small></span>'; }).join('');
    SYM.forEach((s) => {
      h += '<span class="gl">' + esc(t('meno_g_' + s)) + '</span>' + ks.map((k) => { const n = lvOf(dia[k], s); return '<span class="gc meno-l' + n + ' num" title="' + esc(t('meno_g_' + s) + ' · ' + shortD(k) + ': ' + n) + '">' + (n || '') + '</span>'; }).join('');
    });
    h += '<span class="gl gsum">' + esc(t('meno_count_row')) + '</span>' + ks.map((k) => '<span class="gn num">' + SYM.filter((s) => lvOf(dia[k], s) >= 2).length + '</span>').join('');
    return h + '</div></div>';
  }
  function sparkHTML(dia, keys, s) {
    const ks = keys.slice(-12); const vals = ks.map((k) => lvOf(dia[k], s)); const n = vals.length;
    const L = 22, R = 290, Tp = 10, B = 70;
    const x = (i) => (n === 1 ? (L + R) / 2 : L + (i * (R - L)) / (n - 1)); const y = (val) => B - (val * (B - Tp)) / 3;
    let g = '<svg class="spark meno-spark" viewBox="0 0 300 92" role="img" aria-label="' + esc(t('meno_g_' + s) + ': ' + vals.join(', ')) + '">';
    LV.forEach((lv) => { g += '<line class="gd" x1="' + L + '" y1="' + y(lv).toFixed(1) + '" x2="' + R + '" y2="' + y(lv).toFixed(1) + '"/><text x="6" y="' + (y(lv) + 3.5).toFixed(1) + '">' + lv + '</text>'; });
    if (n > 1) g += '<polyline class="ln" points="' + vals.map((val, i) => x(i).toFixed(1) + ',' + y(val).toFixed(1)).join(' ') + '"/>';
    g += vals.map((val, i) => '<circle class="pt" cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="3.5"/>').join('');
    if (n) {
      g += '<text x="' + x(0).toFixed(1) + '" y="88" text-anchor="' + (n === 1 ? 'middle' : 'start') + '">' + esc(shortD(ks[0])) + '</text>';
      if (n > 1) g += '<text x="' + x(n - 1).toFixed(1) + '" y="88" text-anchor="end">' + esc(shortD(ks[n - 1])) + '</text>';
    }
    return g + '</svg>';
  }
  function lineHTML(st) {
    const used = SYM.filter((s) => st.keys.some((k) => lvOf(st.dia[k], s) > 0));
    if (!used.length) return '<p class="small">' + T({ en: 'You rated everything 0 so far. A line appears here for any symptom you rate 1 or more.', hi: 'अब तक आपने सब कुछ 0 चुना है। जिस लक्षण को 1 या ज़्यादा देंगी, उसकी रेखा यहाँ दिखेगी।' }) + '</p>';
    if (!mem.sel || used.indexOf(mem.sel) < 0) mem.sel = st.freq.length && used.indexOf(st.freq[0].k) >= 0 ? st.freq[0].k : used[0];
    return '<div class="chips" role="group" aria-label="' + T({ en: 'Pick a symptom', hi: 'एक लक्षण चुनें' }) + '">' + used.map((s) => '<button type="button" class="chip' + (s === mem.sel ? ' on' : '') + '" data-line="' + s + '" aria-pressed="' + (s === mem.sel) + '">' + esc(t('meno_g_' + s)) + '</button>').join('') + '</div>' +
      sparkHTML(st.dia, st.keys, mem.sel) +
      '<p class="small">' + T({ en: 'Up and down from 0 (none) to 3 (a lot), for your last 12 entries at most.', hi: '0 (नहीं) से 3 (बहुत) तक, ज़्यादा से ज़्यादा आपकी पिछली 12 entries।' }) + '</p>';
  }
  function wireLine(box, st) {
    box.querySelectorAll('[data-line]').forEach((b) => b.addEventListener('click', () => { mem.sel = b.dataset.line; box.innerHTML = lineHTML(st); wireLine(box, st); }));
  }

  function renderDiary(v) {
    own();
    const can = S.canSave(); const st = stats();
    if (!mem.week) mem.week = st.cur;
    if (!mem.draft) mem.draft = draftFor(mem.week);

    let chart = '';
    if (can && st.keys.length) {
      chart = card(H2({ en: 'Your weeks', hi: 'आपके हफ़्ते' }) +
        P({ en: 'Each row is a symptom. Each column is a week you logged, marked by its Monday. The number is the rating you gave.', hi: 'हर पंक्ति एक लक्षण है। हर कॉलम एक दर्ज हफ़्ता है, उसके सोमवार की तारीख़ से। अंक वही है जो आपने चुना।' }, 'small') +
        gridHTML(st.dia, st.keys) + legend() +
        P({ en: 'Bottom row: how many symptoms you rated 2 or 3 that week. A count, not a score.', hi: 'आख़िरी पंक्ति: उस हफ़्ते कितने लक्षणों को आपने 2 या 3 दिया। यह गिनती है, score नहीं।' }, 'small') +
        (st.keys.length > 8 ? P({ en: 'Showing your last 8 entries.', hi: 'आपकी पिछली 8 entries दिख रही हैं।' }, 'small') : '')) +
        card(H2({ en: 'One symptom over time', hi: 'एक लक्षण, समय के साथ' }) + '<div id="meno-line" class="stack">' + lineHTML(st) + '</div>');

      const last = st.last4.length;
      chart += card(H2({ en: 'Your last 4 weeks', hi: 'आपके पिछले 4 हफ़्ते' }) +
        '<p class="small">' + esc(S.tf('meno_logged4', { n: last })) + '</p>' +
        (st.freq.length ? '<dl class="kv">' + st.freq.slice(0, 6).map((x) => '<dt>' + esc(t('meno_g_' + x.k)) + '</dt><dd>' + esc(S.tf('meno_wk_of', { n: x.n, m: last }) + (x.lot ? ' · ' + t('meno_lot') + ' ×' + x.lot : '')) + '</dd>').join('') + '</dl>'
          : '<p class="small">' + T({ en: 'Nothing above 0 in these weeks.', hi: 'इन हफ़्तों में 0 से ऊपर कुछ नहीं।' }) + '</p>') +
        '<p class="footnote">' + esc(t('meno_noscore')) + '</p>');

      /* Pages that match what she logged in the last 4 weeks. A pointer to reading, not a judgement about her. */
      const any = (list) => list.some((s) => st.freq.some((x) => x.k === s));
      const lotHot = st.last4.filter((k) => lvOf(st.dia[k], 'hot') === 3 || lvOf(st.dia[k], 'sweats') === 3).length;
      const items = [];
      if (any(['hot', 'sweats', 'sleep', 'mood', 'anxiety'])) items.push(linkItem('meno-hrt', 'pill', { en: 'Treatments for flushes, sweats and sleep', hi: 'झोंकों, पसीने और नींद का इलाज' }, { en: 'Hormone therapy and other options', hi: 'हॉर्मोन therapy और दूसरे रास्ते' }));
      if (any(['dryness', 'urine', 'desire'])) items.push(linkItem('meno-intimate', 'flower', t('meno_intimate'), t('meno_intimate_s')));
      if (any(['joints'])) items.push(linkItem('meno-bones', 'heart', t('meno_bones'), t('meno_bones_s')));
      if (items.length || lotHot >= 2 || any(['palp'])) {
        chart += card(H2({ en: 'Pages for what you logged', hi: 'आपने जो दर्ज किया, उसके पन्ने' }) +
          (lotHot >= 2 ? P({ en: 'You marked hot flushes or night sweats as “a lot” in ' + lotHot + ' of your last 4 weeks. You don’t have to live with this. Hormone therapy is the most effective treatment, and there are non-hormone options too. An MBBS gynaecologist prescribes them.', hi: 'पिछले 4 में से ' + lotHot + ' हफ़्तों में आपने गर्मी के झोंके या रात का पसीना “बहुत” चुना। इसे सहते रहना ज़रूरी नहीं। सबसे असरदार इलाज हॉर्मोन therapy है, और बिना हॉर्मोन वाले रास्ते भी हैं। ये MBBS gynaecologist लिखती हैं।' }) : '') +
          (any(['palp']) ? flag({ en: 'You logged palpitations. Ask a doctor this month to check your BP, pulse, haemoglobin and thyroid. With chest pain, breathlessness or fainting: go to the nearest hospital now.', hi: 'आपने तेज़ धड़कन दर्ज की। इसी महीने डॉक्टर से BP, नब्ज़, हीमोग्लोबिन और थायरॉइड जाँच करवाएँ। साथ में सीने में दर्द, साँस फूलना या बेहोशी: अभी सबसे पास के अस्पताल जाएँ।' }) : '') +
          (items.length ? '<div class="list">' + items.join('') + '</div>' : ''));
      }
    } else if (can) {
      chart = card(P({ en: 'Your chart appears here after your first entry. Log this week now, then once a week, on any day you like.', hi: 'पहली entry के बाद यहाँ आपका chart दिखेगा। अभी यह हफ़्ता दर्ज करें, फिर हफ़्ते में एक बार, जिस दिन चाहें।' }, 'small'), 'soft');
    }

    v.innerHTML = S.backRow(t('meno_diary'), 'meno', true) +
      intro({ en: 'Once a week, rate 12 common symptoms from 0 (none) to 3 (a lot). After a few weeks you and your doctor can see what bothers you most, and whether a treatment is helping. These are your own ratings: no score, no diagnosis.', hi: 'हफ़्ते में एक बार, 12 आम लक्षणों को 0 (नहीं) से 3 (बहुत) तक अंक दें। कुछ हफ़्तों बाद आप और आपकी डॉक्टर देख सकेंगी कि सबसे ज़्यादा क्या परेशान करता है, और इलाज से फ़र्क़ पड़ रहा है या नहीं। ये आपके अपने अंक हैं: कोई score नहीं, कोई diagnosis नहीं।' }) +
      (can ? '<div class="card" id="meno-form"></div>' : S.needDiary()) +
      chart +
      card(H3({ en: 'Get help', hi: 'मदद कब लें' }, 'color:var(--accent)') +
        flag({ en: 'Palpitations with chest pain, breathlessness or fainting, or soaking a pad every 1–2 hours with dizziness: go to the nearest hospital now.', hi: 'तेज़ धड़कन के साथ सीने में दर्द, साँस फूलना या बेहोशी, या हर 1–2 घंटे में pad भीगना और चक्कर: अभी सबसे पास के अस्पताल जाएँ।' }, true) +
        flag({ en: 'Any bleeding after 12 months without a period: see a gynaecologist within 2 weeks.', hi: '12 महीने पीरियड न आने के बाद कोई भी ब्लीडिंग: 2 हफ़्ते के अंदर gynaecologist को दिखाएँ।' }) +
        flag(t('s6a'))) +
      askCard({ en: 'My menopause symptom diary', hi: 'मेरी मेनोपॉज़ लक्षण डायरी' }, { en: 'Bring this diary to a free call. A Qura doctor goes through it with you, helps with sleep, food and movement, and refers you to an MBBS gynaecologist for hormone or other medicines.', hi: 'यह डायरी लेकर मुफ़्त कॉल पर आएँ। Qura की डॉक्टर इसे आपके साथ देखती हैं, नींद, खाने और कसरत में मदद करती हैं, और हॉर्मोन या दूसरी दवाओं के लिए MBBS gynaecologist के पास refer करती हैं।' }) +
      '<p class="footnote">' + esc(t('meno_noscore')) + '</p>';
    S.wire(v);
    const box = v.querySelector('#meno-form'); if (box) drawForm(box);
    const lb = v.querySelector('#meno-line'); if (lb) wireLine(lb, st);
  }

  /* ---------- hormone therapy ---------- */
  function renderHRT(v) {
    const th = (o) => '<th scope="col">' + T(o) + '</th>';
    const row = (h, a, b) => '<tr><th scope="row">' + T(h) + '</th><td>' + T(a) + '</td><td>' + T(b) + '</td></tr>';
    v.innerHTML = S.backRow(t('meno_hrt'), 'meno', false) +
      intro({ en: 'Hormone therapy gives back the oestrogen your ovaries stop making. Doctors in India also call it MHT (menopausal hormone therapy). It is the most effective treatment for hot flushes and night sweats. It is your choice, not a must: many women manage well without it. It needs a prescription from an MBBS/MD gynaecologist, who first checks that it is safe for you.', hi: 'हॉर्मोन therapy वह एस्ट्रोजन (oestrogen) लौटाती है जो अंडाशय (ovaries) बनाना बंद कर देते हैं। भारत में डॉक्टर इसे MHT (menopausal hormone therapy) भी कहते हैं। गर्मी के झोंकों और रात के पसीने का यह सबसे असरदार इलाज है। यह आपकी मर्ज़ी है, ज़रूरी नहीं: बहुत सी महिलाएँ इसके बिना भी ठीक रहती हैं। इसके लिए MBBS/MD स्त्री रोग विशेषज्ञ का prescription चाहिए, जो पहले देखती हैं कि यह आपके लिए सुरक्षित है।' }) +
      card(H2({ en: 'What it is', hi: 'यह क्या है' }) + ul([
        { en: 'Oestrogen, as a tablet, a skin patch or a gel', hi: 'एस्ट्रोजन: गोली, त्वचा पर लगने वाला patch, या gel' },
        { en: 'Progestogen as well, if you still have your womb. It protects the womb lining. It can be a tablet, a combined patch or a hormonal coil', hi: 'अगर गर्भाशय (बच्चेदानी) है तो साथ में प्रोजेस्टोजन भी। यह गर्भाशय की परत को सुरक्षित रखता है। यह गोली, मिला-जुला patch या हॉर्मोन वाली coil हो सकती है' },
        { en: 'Usually oestrogen alone, if your womb has been removed', hi: 'अगर गर्भाशय निकाल दिया गया है तो आम तौर पर सिर्फ़ एस्ट्रोजन' },
        { en: 'Vaginal oestrogen: a low-dose cream or small tablet put inside the vagina, only for dryness and urine problems. Very little of it reaches the blood', hi: 'योनि वाला एस्ट्रोजन: कम dose की cream या छोटी गोली जो योनि के अंदर रखी जाती है, सिर्फ़ सूखेपन और पेशाब की परेशानी के लिए। इसका बहुत कम हिस्सा ख़ून में पहुँचता है' }
      ])) +
      card(H2({ en: 'What it helps', hi: 'किसमें मदद करती है' }) + ul([
        { en: 'Hot flushes and night sweats, usually within a few weeks', hi: 'गर्मी के झोंके और रात का पसीना, अक्सर कुछ हफ़्तों में' },
        { en: 'Sleep, and low mood or anxiety caused by menopause', hi: 'नींद, और मेनोपॉज़ की वजह से उदासी या घबराहट' },
        { en: 'Vaginal dryness. Vaginal oestrogen alone is often enough for this', hi: 'योनि का सूखापन। इसके लिए अक्सर सिर्फ़ योनि वाला एस्ट्रोजन काफ़ी होता है' },
        { en: 'Bones: it helps protect against thinning bones (osteoporosis)', hi: 'हड्डियाँ: हड्डियों को कमज़ोर होने (osteoporosis) से बचाने में मदद' }
      ]) + P({ en: 'It is not a contraceptive. Doctors don’t start it only to protect the heart, or only for bones once 10 years have passed since menopause.', hi: 'यह गर्भनिरोधक नहीं है। डॉक्टर इसे सिर्फ़ दिल बचाने के लिए शुरू नहीं करते, और मेनोपॉज़ के 10 साल बाद सिर्फ़ हड्डियों के लिए भी नहीं।' }, 'small')) +
      card(H2({ en: 'The risks, plainly', hi: 'जोखिम, साफ़-साफ़' }) +
        '<div class="table-wrap"><table class="meno-tbl"><thead><tr><th></th>' + th({ en: 'Tablets', hi: 'गोलियाँ' }) + th({ en: 'Patch or gel', hi: 'Patch या gel' }) + '</tr></thead><tbody>' +
        row({ en: 'Blood clots', hi: 'ख़ून के थक्के' }, { en: 'A small rise; the risk stays low', hi: 'थोड़ा बढ़ता है; जोखिम फिर भी कम रहता है' }, { en: 'No rise seen', hi: 'बढ़ता नहीं दिखा' }) +
        row({ en: 'Stroke', hi: 'लकवा (stroke)' }, { en: 'A small rise; very low under 60', hi: 'थोड़ा बढ़ता है; 60 से कम उम्र में बहुत कम' }, { en: 'No rise seen', hi: 'बढ़ता नहीं दिखा' }) +
        '</tbody></table></div>' +
        LP({ en: 'Breast cancer:', hi: 'स्तन कैंसर:' }, { en: 'Combined therapy (oestrogen with progestogen) raises the risk a little, about 5 extra cases in every 1,000 women who take it for 5 years. The risk grows with longer use and falls after stopping. Oestrogen alone, after the womb is removed, makes little or no difference.', hi: 'मिली-जुली therapy (एस्ट्रोजन के साथ प्रोजेस्टोजन) से जोखिम थोड़ा बढ़ता है, 5 साल लेने वाली हर 1,000 महिलाओं में लगभग 5 ज़्यादा मामले। ज़्यादा समय लेने पर जोखिम बढ़ता है और बंद करने के बाद घटता है। गर्भाशय निकलने के बाद सिर्फ़ एस्ट्रोजन से फ़र्क़ बहुत कम या नहीं के बराबर है।' }) +
        LP({ en: 'Heart:', hi: 'दिल:' }, { en: 'Started in your 50s, it has little or no effect on heart disease.', hi: '50 से 60 की उम्र में शुरू करने पर दिल की बीमारी पर असर बहुत कम या नहीं के बराबर।' }) +
        LP({ en: 'Vaginal oestrogen:', hi: 'योनि वाला एस्ट्रोजन:' }, { en: 'The dose is low, so it does not raise the risk of clots or breast cancer, and you can use it for a long time.', hi: 'dose कम है, इसलिए थक्के या स्तन कैंसर का जोखिम नहीं बढ़ता, और इसे लंबे समय तक इस्तेमाल कर सकती हैं।' }) +
        P({ en: 'Figures from the NHS (UK). Your gynaecologist weighs them against your own health and your family’s.', hi: 'आँकड़े NHS (UK) से। आपकी gynaecologist इन्हें आपकी और आपके परिवार की सेहत के साथ तौलती हैं।' }, 'small')) +
      card(H2({ en: 'Timing', hi: 'कब और कितने समय तक' }) + ul([
        { en: 'Safest and most useful when started before 60, or within 10 years of your last period (Indian Menopause Society)', hi: '60 से पहले, या आख़िरी पीरियड के 10 साल के अंदर शुरू करना सबसे सुरक्षित और फ़ायदेमंद (Indian Menopause Society)' },
        { en: 'There is no fixed stop date. Review it with your doctor once a year', hi: 'बंद करने की कोई तय तारीख़ नहीं। साल में एक बार डॉक्टर के साथ दोबारा देखें' },
        { en: 'You can stop all at once or slowly. If symptoms come back, tell your doctor', hi: 'एक साथ या धीरे-धीरे बंद कर सकती हैं। लक्षण लौटें तो डॉक्टर को बताएँ' },
        { en: 'After 45, a blood test is usually not needed to know you are in menopause. Doctors go by your periods and symptoms', hi: '45 के बाद मेनोपॉज़ जानने के लिए आम तौर पर blood test की ज़रूरत नहीं। डॉक्टर पीरियड और लक्षणों से समझती हैं' }
      ])) +
      card(H2({ en: 'Who usually can’t take it', hi: 'कौन आम तौर पर नहीं ले सकता' }) + ul([
        { en: 'Breast cancer now or in the past, or a very high risk of it', hi: 'अभी या पहले स्तन कैंसर, या इसका बहुत ज़्यादा जोखिम' },
        { en: 'Some cancers of the womb or ovary in the past', hi: 'पहले गर्भाशय या अंडाशय के कुछ तरह के कैंसर' },
        { en: 'A heart attack, stroke, or heart disease', hi: 'दिल का दौरा, लकवा (stroke), या दिल की बीमारी' },
        { en: 'A blood clot in the leg or lung in the past. Some women can still use a patch or gel after specialist advice', hi: 'पहले पैर या फेफड़े में ख़ून का थक्का। कुछ महिलाएँ विशेषज्ञ की सलाह से patch या gel ले सकती हैं' },
        { en: 'Severe liver disease', hi: 'लीवर की गंभीर बीमारी' },
        { en: 'High BP that is not yet under control: treat it first', hi: 'BP ज़्यादा है और अभी क़ाबू में नहीं: पहले उसका इलाज' },
        { en: 'Bleeding from the vagina that hasn’t been checked yet', hi: 'योनि से ब्लीडिंग जिसकी अभी जाँच नहीं हुई' }
      ]) + P({ en: 'Migraine, diabetes, epilepsy, or clots or breast cancer in your family don’t always rule it out. Tell the doctor about them.', hi: 'माइग्रेन, डायबिटीज़, मिर्गी, या परिवार में थक्के या स्तन कैंसर हों, तो भी हमेशा मना नहीं होता। डॉक्टर को ज़रूर बताएँ।' }, 'small'), 'warn') +
      card(H3({ en: 'Side effects in the first months', hi: 'शुरुआती महीनों के side effects' }) +
        P({ en: 'Sore breasts, headache, feeling sick or some spotting. These often settle. Bleeding that is heavy, won’t settle, or starts after the first few months needs a check.', hi: 'स्तनों में दर्द, सिरदर्द, जी मिचलाना या हल्के धब्बे। ये अक्सर ठीक हो जाते हैं। भारी ब्लीडिंग, जो रुके नहीं, या शुरुआती कुछ महीनों के बाद शुरू हो, उसकी जाँच ज़रूरी है।' }, 'small')) +
      card(H2({ en: 'Questions to take to the gynaecologist', hi: 'gynaecologist से पूछने के सवाल' }) + steps([
        { en: 'Which symptoms bother me most? Bring your weekly diary.', hi: 'कौन से लक्षण सबसे ज़्यादा परेशान करते हैं? अपनी हफ़्ते वाली डायरी साथ ले जाएँ।' },
        { en: 'Tablets, patch or gel: which suits me, and why?', hi: 'गोली, patch या gel: मेरे लिए कौन सा ठीक है, और क्यों?' },
        { en: 'Do I need progestogen? Which kind?', hi: 'क्या मुझे प्रोजेस्टोजन चाहिए? कौन सा?' },
        { en: 'How will we know it is working, and when do we review it?', hi: 'कैसे पता चलेगा कि असर हो रहा है, और दोबारा कब देखेंगे?' },
        { en: 'What can I do if I can’t take it, or don’t want to?', hi: 'अगर मैं न ले सकूँ, या न लेना चाहूँ, तो क्या करूँ?' }
      ]) + goBtn('meno-diary', { en: 'Open my weekly diary', hi: 'मेरी हफ़्ते वाली डायरी खोलें' })) +
      card(H2({ en: 'If you don’t want hormones, or can’t take them', hi: 'अगर हॉर्मोन नहीं लेना चाहतीं, या नहीं ले सकतीं' }) + ul([
        { en: 'Talking therapy (CBT) helps with hot flushes and sleep', hi: 'बातचीत वाली therapy (CBT) गर्मी के झोंकों और नींद में मदद करती है' },
        { en: 'Some non-hormone medicines reduce hot flushes: certain antidepressants in low dose (SSRIs or SNRIs), gabapentin or clonidine. They help less than hormone therapy. An MBBS doctor decides', hi: 'कुछ बिना हॉर्मोन वाली दवाएँ गर्मी के झोंके कम करती हैं: कम dose में कुछ antidepressant (SSRI या SNRI), gabapentin या clonidine। इनका असर हॉर्मोन therapy से कम है। फ़ैसला MBBS डॉक्टर करते हैं' },
        { en: 'For dryness: moisturisers and lubricants, which you can buy at a chemist', hi: 'सूखेपन के लिए: moisturiser और lubricant, जो केमिस्ट पर मिलते हैं' },
        { en: 'Everyday steps: keeping cool, avoiding your triggers, exercise and a sleep routine', hi: 'रोज़ के उपाय: ठंडक, अपनी वजहों से बचना, कसरत और सोने का नियम' }
      ]) + P({ en: 'Herbal or “natural hormone” products have little proof that they work or are safe. Tell your doctor about anything you take.', hi: 'जड़ी-बूटी या “natural hormone” products के असर या सुरक्षा का सबूत बहुत कम है। जो भी लेती हैं, डॉक्टर को बताएँ।' }, 'small') +
        '<div class="row wrap">' + goBtn('meno-intimate', { en: 'Dryness and urine', hi: 'सूखापन और पेशाब' }) + goBtn('meno', { en: 'Everyday steps', hi: 'रोज़ के उपाय' }) + '</div>') +
      askCard({ en: 'Hormone therapy (HRT) for menopause', hi: 'मेनोपॉज़ के लिए हॉर्मोन therapy (HRT)' }, { en: 'Qura’s doctors are BAMS and don’t prescribe HRT. On a free call a Qura doctor helps you prepare your questions, helps with sleep, food and weight, and refers you to an MBBS gynaecologist.', hi: 'Qura की डॉक्टर BAMS हैं और HRT नहीं लिखतीं। मुफ़्त कॉल पर Qura की डॉक्टर आपके सवाल तैयार करने में, नींद, खाने और वज़न में मदद करती हैं, और MBBS gynaecologist के पास refer करती हैं।' }) +
      sources(['NHS: Benefits and risks of hormone replacement therapy (HRT)', 'NHS: About HRT, who can and cannot take it', 'NHS: Menopause treatment', 'Indian Menopause Society. Clinical practice guidelines on menopause 2019–2020. J Mid-life Health 2020']) + notDx();
    S.wire(v);
  }

  /* ---------- bones and heart ---------- */
  /* Version 39.8 (diet audit VD-02): the calcium card's own foods as pictures; with no milk, the card's other foods */
  function calciumPics() {
    if (!(S.food && S.food.strip)) return ''; const dt = S.food.diet ? S.food.diet() : { type: 'veg', milk: true }; const milk = dt.milk !== false;
    return S.food.strip((milk ? [['milk', { en: 'Milk', hi: 'दूध' }], ['dahi', { en: 'Dahi', hi: 'दही' }]] : []).concat([['ragi', { en: 'Ragi', hi: 'रागी' }], ['til', { en: 'Til', hi: 'तिल' }]], milk ? [['paneer', { en: 'Paneer', hi: 'पनीर' }]] : [], [['saag', { en: 'Green leafy sabzi', hi: 'हरी पत्तेदार सब्ज़ी' }], ['rajma', { en: 'Rajma', hi: 'राजमा' }], ['chana', { en: 'Chana', hi: 'चना' }]], dt.type === 'nonveg' ? [['fish', { en: 'Small fish', hi: 'छोटी मछली' }]] : []), t('foods_help'));
  }
  function renderBones(v) {
    v.innerHTML = S.backRow(t('meno_bones'), 'meno', false) +
      intro({ en: 'After menopause, bones thin faster and the heart loses some of the protection oestrogen gave it. Indian women reach menopause earlier and start with less bone mass, so this matters even more here. Most of what protects you is food, sunlight, movement and a few checks each year.', hi: 'मेनोपॉज़ के बाद हड्डियाँ तेज़ी से कमज़ोर होती हैं और दिल को एस्ट्रोजन से मिलने वाली सुरक्षा कम हो जाती है। भारतीय महिलाओं में मेनोपॉज़ जल्दी आता है और हड्डियों की मज़बूती पहले से कम होती है, इसलिए यहाँ यह और ज़रूरी है। ज़्यादातर बचाव खाने, धूप, चलने-फिरने और साल की कुछ जाँचों से होता है।' }) +
      card(H2({ en: 'Calcium from your kitchen', hi: 'रसोई से calcium' }) + calciumPics() +
        P({ en: 'Aim for more than 800 mg of calcium a day from food (Indian Menopause Society). Most Indian women past menopause get less than half of that.', hi: 'रोज़ खाने से 800 mg से ज़्यादा calcium का लक्ष्य रखें (Indian Menopause Society)। मेनोपॉज़ के बाद ज़्यादातर भारतीय महिलाओं को इसका आधा भी नहीं मिलता।' }) +
        '<dl class="kv"><dt>' + T({ en: 'A glass of milk', hi: '1 गिलास दूध' }) + '</dt><dd>' + T({ en: 'about 300 mg', hi: 'लगभग 300 mg' }) + '</dd><dt>' + T({ en: 'A katori of dahi (curd)', hi: '1 कटोरी दही' }) + '</dt><dd>' + T({ en: 'about 300 mg', hi: 'लगभग 300 mg' }) + '</dd></dl>' +
        ul([
          { en: 'Ragi (nachni): close to 10 times the calcium of wheat or rice. Try ragi roti, dosa or porridge', hi: 'रागी (नाचनी): गेहूँ या चावल से लगभग 10 गुना calcium। रागी की रोटी, डोसा या दलिया आज़माएँ' },
          { en: 'Til (sesame): a spoonful in chutney, laddoo or on your sabzi', hi: 'तिल: चटनी, लड्डू या सब्ज़ी पर एक चम्मच' },
          { en: 'Paneer and chhena', hi: 'पनीर और छेना' },
          { en: 'Green leafy vegetables: chaulai (amaranth), methi, sarson, drumstick (moringa) leaves', hi: 'हरी पत्तेदार सब्ज़ियाँ: चौलाई, मेथी, सरसों, सहजन (moringa) के पत्ते' },
          { en: 'Rajma, chana, soybean and tofu, and small fish eaten with the bones', hi: 'राजमा, चना, सोयाबीन और tofu, और छोटी मछली जो काँटों समेत खाई जाए' }
        ]) +
        P({ en: 'No milk? Ragi, til, greens and dals together can still get you there. Take calcium tablets only if your doctor advises them, and not at the same time as an iron tablet.', hi: 'दूध नहीं लेतीं? रागी, तिल, हरी सब्ज़ियाँ और दालें मिलकर भी काफ़ी calcium दे सकती हैं। calcium की गोली सिर्फ़ डॉक्टर की सलाह पर लें, और iron की गोली के साथ एक ही समय पर नहीं।' }, 'small'), '', 'data-nofold="1"') +
      card(H2({ en: 'Vitamin D and sunlight', hi: 'Vitamin D और धूप' }) +
        P({ en: 'Your skin makes vitamin D in sunlight. Even so, low vitamin D is very common in India at every age; the Indian Menopause Society calls it a national deficiency. Covered clothes, indoor work, pollution and darker skin all reduce how much your skin makes.', hi: 'धूप में त्वचा vitamin D बनाती है। फिर भी भारत में हर उम्र में vitamin D की कमी बहुत आम है; Indian Menopause Society इसे देश भर की कमी कहती है। ढके कपड़े, घर के अंदर काम, प्रदूषण और गहरा रंग, ये सब त्वचा में बनने वाले vitamin D को कम करते हैं।' }) +
        ul([
          { en: 'When you can, get sun on your face, arms and legs for about 30 minutes between 10 am and 3 pm. In the hot months, choose the cooler end of that window', hi: 'जब हो सके, सुबह 10 से दोपहर 3 बजे के बीच लगभग 30 मिनट चेहरे, बाँहों और पैरों पर धूप लें। गर्मी के महीनों में इस समय का ठंडा हिस्सा चुनें' },
          { en: 'Your doctor may test your vitamin D and prescribe a supplement', hi: 'डॉक्टर vitamin D की जाँच करके supplement लिख सकती हैं' },
          { en: 'Don’t take high-dose vitamin D sachets or injections on your own. Too much raises the calcium in your blood and can harm you', hi: 'ज़्यादा dose वाले vitamin D के sachet या injection ख़ुद से न लें। ज़्यादा लेने से ख़ून में calcium बढ़ता है और नुक़सान हो सकता है' }
        ])) +
      card(H2({ en: 'Move for your bones', hi: 'हड्डियों के लिए चलें-फिरें' }) + ul([
        { en: 'Brisk walking for 30 minutes on most days. Good for heart and mood, but on its own not enough for bones', hi: 'ज़्यादातर दिन 30 मिनट तेज़ चाल। दिल और मन के लिए अच्छी, पर सिर्फ़ इससे हड्डियों को काफ़ी फ़ायदा नहीं' },
        { en: 'Weight-bearing and strength exercise at least twice a week: climbing stairs, standing up from a chair and sitting down 10 times, carrying shopping bags, dancing, yoga poses where you hold your own weight', hi: 'हफ़्ते में कम से कम दो बार वज़न उठाने वाली और ताक़त की कसरत: सीढ़ियाँ चढ़ना, कुर्सी से 10 बार उठना-बैठना, सामान के थैले उठाना, नाचना, योग के वे आसन जिनमें शरीर का वज़न ख़ुद उठाती हैं' },
        { en: 'Balance: stand on one leg holding a wall or table, a few days a week', hi: 'संतुलन: दीवार या मेज़ पकड़कर एक पैर पर खड़ी हों, हफ़्ते में कुछ दिन' },
        { en: 'Already have osteoporosis? Avoid bending forward sharply and lifting heavy weights. Ask for exercises that suit you', hi: 'पहले से osteoporosis है? झटके से आगे झुकने और भारी वज़न उठाने से बचें। अपने लिए सही कसरत पूछें' }
      ])) +
      card(H2({ en: 'Prevent falls at home', hi: 'घर में गिरने से बचाव' }) + ul([
        { en: 'A non-slip mat in the bathroom, and a low stool to sit on while you bathe', hi: 'बाथरूम में न फिसलने वाली चटाई, और नहाते समय बैठने के लिए छोटी चौकी' },
        { en: 'A light on the way to the toilet at night', hi: 'रात में टॉयलेट के रास्ते में रोशनी' },
        { en: 'No loose wires, rugs or clutter on the floor', hi: 'फ़र्श पर ढीले तार, दरी या सामान न रहे' },
        { en: 'Chappals with a good grip, not loose or worn out', hi: 'अच्छी पकड़ वाली चप्पल, ढीली या घिसी हुई नहीं' },
        { en: 'Get your eyes checked. Stand up slowly if you feel dizzy', hi: 'आँखों की जाँच करवाएँ। चक्कर लगे तो धीरे उठें' },
        { en: 'Ask your doctor whether any of your medicines, such as sleeping pills, make you unsteady', hi: 'डॉक्टर से पूछें कि आपकी कोई दवा, जैसे नींद की गोली, आपको डगमगा तो नहीं रही' }
      ])) +
      card(H2({ en: 'Bone density test (DEXA)', hi: 'हड्डियों की जाँच (DEXA)' }) +
        P({ en: 'A DEXA scan measures how strong your bones are. It is quick and painless, and uses a very low X-ray dose. The Indian Menopause Society advises it for:', hi: 'DEXA scan बताता है कि हड्डियाँ कितनी मज़बूत हैं। यह जल्दी होता है, दर्द नहीं होता, और X-ray बहुत कम लगता है। Indian Menopause Society इसकी सलाह देती है:' }) +
        ul([
          { en: 'Every woman 5 years or more after menopause', hi: 'मेनोपॉज़ के 5 साल या ज़्यादा बाद हर महिला को' },
          { en: 'Earlier if you have risk factors, such as menopause before 45, low body weight, a parent who broke a hip, smoking or alcohol, steroid tablets for a long time, rheumatoid arthritis, thyroid problems, type 2 diabetes, or a breast cancer medicine called an aromatase inhibitor. Your doctor weighs these', hi: 'जोखिम हों तो पहले, जैसे 45 से पहले मेनोपॉज़, कम वज़न, माता या पिता की कूल्हे की हड्डी टूटी हो, धूम्रपान या शराब, लंबे समय तक steroid की गोलियाँ, rheumatoid arthritis, थायरॉइड, type 2 डायबिटीज़, या स्तन कैंसर की aromatase inhibitor नाम की दवा। डॉक्टर इन्हें तौलकर तय करती हैं' },
          { en: 'Anyone who has broken a bone in a small fall', hi: 'जिसकी हड्डी छोटी-सी गिरावट में टूटी हो' }
        ]) +
        flag({ en: 'Broke a bone falling from standing height or less, lost height, or developed a stoop: tell your doctor. It can be the first sign of osteoporosis.', hi: 'खड़े-खड़े या उससे कम ऊँचाई से गिरकर हड्डी टूटी, क़द घटा, या कमर झुकने लगी: डॉक्टर को बताएँ। यह osteoporosis का पहला संकेत हो सकता है।' }) +
        P({ en: 'Ask your doctor where DEXA is done near you. Costs vary between centres, so ask before you go.', hi: 'डॉक्टर से पूछें कि आपके पास DEXA कहाँ होता है। अलग-अलग जगह ख़र्च अलग है, जाने से पहले पूछ लें।' }, 'small')) +
      card(H2({ en: 'Your heart after 40', hi: '40 के बाद आपका दिल' }) +
        P({ en: 'After menopause, a woman’s chance of heart disease rises. Keeping BP, sugar and cholesterol in check prevents much of it.', hi: 'मेनोपॉज़ के बाद महिला में दिल की बीमारी की संभावना बढ़ती है। BP, sugar और cholesterol क़ाबू में रखकर इसका बड़ा हिस्सा रोका जा सकता है।' }) +
        '<div class="table-wrap"><table class="meno-tbl"><tbody>' +
        '<tr><th scope="row">BP</th><td>' + T({ en: 'At least once a year. Free at your Ayushman Arogya Mandir', hi: 'साल में कम से कम एक बार। आयुष्मान आरोग्य मंदिर में मुफ़्त', doc: { en: 'At least once a year, with your doctor or free at your Ayushman Arogya Mandir', hi: 'साल में कम से कम एक बार, डॉक्टर से या आयुष्मान आरोग्य मंदिर में मुफ़्त' } }) + '</td></tr>' +
        '<tr><th scope="row">' + T({ en: 'Blood sugar', hi: 'Blood sugar' }) + '</th><td>' + T({ en: 'At least once a year. Free at your Ayushman Arogya Mandir', hi: 'साल में कम से कम एक बार। आयुष्मान आरोग्य मंदिर में मुफ़्त', doc: { en: 'At least once a year, with your doctor or free at your Ayushman Arogya Mandir', hi: 'साल में कम से कम एक बार, डॉक्टर से या आयुष्मान आरोग्य मंदिर में मुफ़्त' } }) + '</td></tr>' +
        '<tr><th scope="row">' + T({ en: 'Cholesterol (lipid profile)', hi: 'Cholesterol (lipid profile)' }) + '</th><td>' + T({ en: 'Ask your doctor how often. More often with diabetes or high BP', hi: 'कितनी बार, यह डॉक्टर से पूछें। डायबिटीज़ या ज़्यादा BP हो तो ज़्यादा बार' }) + '</td></tr>' +
        '<tr><th scope="row">' + T({ en: 'Waist', hi: 'कमर' }) + '</th><td>' + T({ en: 'Measure it yourself. 80 cm (about 31½ inches) or more means extra fat around the belly, which raises the risk of diabetes and heart disease', hi: 'ख़ुद नापें। 80 cm (लगभग 31½ इंच) या ज़्यादा का मतलब है पेट के आसपास ज़्यादा चर्बी, जिससे डायबिटीज़ और दिल की बीमारी का जोखिम बढ़ता है' }) + '</td></tr>' +
        '</tbody></table></div>' +
        P({ en: 'To measure your waist: halfway between your lowest rib and the top of your hip bone, after breathing out.', hi: 'कमर नापने का तरीक़ा: सबसे नीचे की पसली और कूल्हे की हड्डी के ऊपरी सिरे के बीच, साँस छोड़ने के बाद।' }, 'small') +
        P({ en: 'The government programme screens every adult from 30 for BP and sugar, and for mouth, breast and cervical cancer. Your ASHA can tell you when.', hi: 'सरकारी कार्यक्रम 30 साल से हर वयस्क की BP और sugar, और मुँह, स्तन और बच्चेदानी के मुँह (cervix) के कैंसर की जाँच करता है। कब, यह आपकी ASHA बताएँगी।', doc: { en: 'Your doctor can do these checks. The government programme also screens every adult from 30 for BP and sugar, and for mouth, breast and cervical cancer, free.', hi: 'आपकी डॉक्टर ये जाँचें कर सकती हैं। सरकारी कार्यक्रम भी 30 साल से हर वयस्क की BP और sugar, और मुँह, स्तन और बच्चेदानी के मुँह (cervix) के कैंसर की जाँच मुफ़्त करता है।' } }, 'small') +
        flag({ en: 'Chest pain or pressure, pain spreading to the jaw, arm or back, sudden breathlessness, a cold sweat or feeling sick: go to the nearest hospital now. Don’t wait to see if it passes.', hi: 'सीने में दर्द या दबाव, जबड़े, बाँह या पीठ तक फैलता दर्द, अचानक साँस फूलना, ठंडा पसीना या जी मिचलाना: अभी सबसे पास के अस्पताल जाएँ। रुककर इंतज़ार न करें कि ठीक हो जाएगा।' }, true)) +
      related([
        linkItem('screen-mine', 'check', { en: 'My screening plan', hi: 'मेरी जाँचों की योजना' }, { en: 'Which checks at your age, and where they are free', hi: 'आपकी उम्र में कौन सी जाँच, और कहाँ मुफ़्त' }),
        linkItem('meno-surgical', MED_SVG, t('meno_surgical'), t('meno_surgical_s'))
      ]) +
      planFor('bones') + askCard({ en: 'Bones, weight and heart after menopause', hi: 'मेनोपॉज़ के बाद हड्डियाँ, वज़न और दिल' }, { en: 'A Qura doctor can plan calcium-rich meals and an exercise routine with you, order tests, and refer you on when you need it.', hi: 'Qura की डॉक्टर आपके साथ calcium से भरपूर खाना और कसरत का रूटीन बना सकती हैं, जाँच लिख सकती हैं, और ज़रूरत हो तो आगे refer करती हैं।' }) +
      sources(['Indian Menopause Society. Clinical practice guidelines on postmenopausal osteoporosis, update 2019–2020. J Mid-life Health 2020', 'ICAR / APEDA millet portal: finger millet nutrition', 'WHO guidelines on physical activity and sedentary behaviour 2020', 'National Academy of Medical Sciences (India) task force on obesity', 'MoHFW: NP-NCD population-based screening (30 years and above)', 'Ayushman Arogya Mandir (aam.mohfw.gov.in)']) + notDx();
    S.wire(v);
  }

  /* ---------- dryness, sex and urine after menopause ---------- */
  function renderIntimate(v) {
    v.innerHTML = S.backRow(t('meno_intimate'), 'meno', false) +
      intro({ en: 'With less oestrogen after menopause, the vagina, the skin around it and the urine passage become thinner and drier. Doctors call it genitourinary syndrome of menopause (GSM). Many women have it and few talk about it. It is nothing to be ashamed of, and it can be treated.', hi: 'मेनोपॉज़ के बाद एस्ट्रोजन कम होने से योनि, उसके आसपास की त्वचा और पेशाब का रास्ता पतले और सूखे हो जाते हैं। डॉक्टर इसे genitourinary syndrome of menopause (GSM) कहते हैं। बहुत सी महिलाओं को होता है, पर कम ही बताती हैं। इसमें शर्म की कोई बात नहीं, और इसका इलाज है।' }) +
      '<p class="small">' + privacyLine() + '</p>' +
      card(H2({ en: 'Signs', hi: 'संकेत' }) + ul([
        { en: 'Dryness, itching, burning or soreness', hi: 'सूखापन, खुजली, जलन या दुखन' },
        { en: 'Pain or discomfort during sex, or light bleeding after it', hi: 'संबंध के समय दर्द या तकलीफ़, या बाद में हल्की ब्लीडिंग' },
        { en: 'Needing to pee often or in a rush, or leaking', hi: 'बार-बार या जल्दी-जल्दी पेशाब जाना, या पेशाब निकल जाना' },
        { en: 'Urine infections that keep coming back', hi: 'पेशाब का infection जो बार-बार लौटे' }
      ])) +
      card(H2({ en: 'What you can do yourself', hi: 'आप ख़ुद क्या कर सकती हैं' }) + steps([
        { en: 'A vaginal moisturiser, used regularly and not only before sex. Chemists sell them.', hi: 'योनि का moisturiser, नियमित रूप से, सिर्फ़ संबंध से पहले नहीं। केमिस्ट पर मिलता है।' },
        { en: 'A lubricant for sex. Water-based ones are safe with condoms. Oil-based ones, coconut oil included, can break a latex condom.', hi: 'संबंध के लिए lubricant। पानी वाले (water-based) condom के साथ सुरक्षित हैं। तेल वाले, नारियल तेल भी, latex condom को फाड़ सकते हैं।' },
        { en: 'Wash the outside with plain water. Avoid perfumed soaps, washes, douches and antiseptic liquids inside the vagina.', hi: 'बाहर से सादे पानी से धोएँ। ख़ुशबू वाले साबुन, wash, douche और योनि के अंदर antiseptic liquid से बचें।' },
        { en: 'Cotton underwear. Change out of damp clothes soon.', hi: 'सूती अंडरवियर। गीले कपड़े जल्दी बदलें।' },
        { en: 'Pelvic floor exercises every day for leaking when you cough, sneeze or lift. Give them at least 3 months.', hi: 'खाँसने, छींकने या वज़न उठाने पर पेशाब निकले तो रोज़ pelvic floor कसरत। कम से कम 3 महीने करें।' }
      ]) + goBtn('intimate-prolapse', { en: 'Pelvic floor and prolapse guide', hi: 'Pelvic floor और prolapse गाइड' })) +
      card(H2({ en: 'What a doctor can prescribe', hi: 'डॉक्टर क्या लिख सकती हैं' }) +
        P({ en: 'Vaginal oestrogen, as a cream or a small tablet placed inside the vagina. It is the main treatment for GSM (Indian Menopause Society). The dose is low and very little reaches the blood, so it does not raise the risk of clots or breast cancer, and you can use it for a long time. It can take a few weeks to work.', hi: 'योनि वाला एस्ट्रोजन, cream या छोटी गोली के रूप में जो योनि के अंदर रखी जाती है। GSM का यही मुख्य इलाज है (Indian Menopause Society)। dose कम है और ख़ून में बहुत कम पहुँचता है, इसलिए थक्के या स्तन कैंसर का जोखिम नहीं बढ़ता, और इसे लंबे समय तक इस्तेमाल कर सकती हैं। असर आने में कुछ हफ़्ते लग सकते हैं।' }) +
        P({ en: 'It also lowers the chance of repeat urine infections after menopause.', hi: 'मेनोपॉज़ के बाद बार-बार होने वाले पेशाब के infection भी इससे कम होते हैं।' }) +
        P({ en: 'It needs a prescription from an MBBS gynaecologist. Had breast cancer? Ask your cancer specialist first.', hi: 'इसके लिए MBBS gynaecologist का prescription चाहिए। स्तन कैंसर हुआ हो तो पहले अपने कैंसर विशेषज्ञ से पूछें।' }, 'small')) +
      card(H2({ en: 'Sex after menopause', hi: 'मेनोपॉज़ के बाद संबंध' }) + ul([
        { en: 'Less desire is common. So is wanting closeness without sex. Both are normal', hi: 'इच्छा कम होना आम है। संबंध के बिना नज़दीकी चाहना भी। दोनों सामान्य हैं' },
        { en: 'Pain is not normal and you don’t have to bear it. Treat the dryness first, take more time to get aroused, and try different positions', hi: 'दर्द सामान्य नहीं है और इसे सहना ज़रूरी नहीं। पहले सूखेपन का इलाज करें, उत्तेजना के लिए ज़्यादा समय लें, और अलग तरीक़े आज़माएँ' },
        { en: 'Talk to your partner. Sex can wait until it feels good again', hi: 'अपने साथी से बात करें। जब तक अच्छा न लगे, संबंध रुक सकता है' },
        { en: 'Infections spread at any age. Use condoms with a new partner. HIV and STI helpline: 1097', hi: 'Infection किसी भी उम्र में फैलते हैं। नए साथी के साथ condom इस्तेमाल करें। HIV और STI हेल्पलाइन: 1097' },
        { en: 'Until your periods have stopped for 1–2 years, you can still get pregnant', hi: 'पीरियड बंद हुए 1–2 साल न हों, तब तक गर्भ ठहर सकता है' },
      ]) + '<div class="row wrap">' + goBtn('contra', { en: 'Contraception', hi: 'गर्भनिरोध' }) + goBtn('intimate-safety', { en: 'Safety and support', hi: 'सुरक्षा और सहारा' }) + '</div>') +
      card(H2({ en: 'Bleeding after menopause always needs a check', hi: 'मेनोपॉज़ के बाद ब्लीडिंग की जाँच हमेशा ज़रूरी' }) +
        P({ en: 'Any bleeding or spotting once your periods have stopped for 12 months, even a small amount or only once: see a gynaecologist within 2 weeks.', hi: 'पीरियड 12 महीने बंद रहने के बाद कोई भी ब्लीडिंग या धब्बे, चाहे थोड़ा या एक बार: 2 हफ़्ते के अंदर gynaecologist को दिखाएँ।' }) +
        P({ en: 'Most of the time it is something simple, like a thin dry lining or a polyp. But womb cancer has to be ruled out, and found early it is easier to treat. At this age, the Indian Menopause Society advises a check even for bleeding after 6 months without a period.', hi: 'ज़्यादातर वजह मामूली होती है, जैसे पतली सूखी परत या polyp। पर गर्भाशय के कैंसर की जाँच ज़रूरी है, और जल्दी पता चले तो इलाज आसान है। इस उम्र में, Indian Menopause Society 6 महीने पीरियड न आने के बाद की ब्लीडिंग की भी जाँच की सलाह देती है।' }, 'small') +
        P({ en: 'On hormone therapy? Bleeding that starts after the first few months, or won’t settle, needs a check too.', hi: 'हॉर्मोन therapy ले रही हैं? शुरुआती कुछ महीनों के बाद शुरू हुई, या न रुकने वाली ब्लीडिंग की भी जाँच ज़रूरी है।' }, 'small') +
        flag(PAD112, true), 'warn') +
      card(H2({ en: 'Urine problems', hi: 'पेशाब की परेशानी' }) + ul([
        { en: 'Rushing to the toilet, going often, waking at night to pee, or leaking: tell your doctor. There is treatment', hi: 'टॉयलेट की जल्दी, बार-बार जाना, रात में पेशाब के लिए उठना, या पेशाब निकल जाना: डॉक्टर को बताएँ। इलाज है' },
        { en: 'Burning when you pee: see a doctor this week', hi: 'पेशाब में जलन: इसी हफ़्ते डॉक्टर को दिखाएँ' },
        { en: 'Burning with fever, shivering or back pain under the ribs: see a doctor today', hi: 'जलन के साथ बुख़ार, कँपकँपी या पसलियों के नीचे पीठ में दर्द: आज ही डॉक्टर को दिखाएँ' },
        { en: 'Don’t drink less water to avoid leaking. It makes infections more likely', hi: 'पेशाब निकलने के डर से पानी कम न पिएँ। इससे infection की संभावना बढ़ती है' }
      ])) +
      related([
        linkItem('intimate-check', 'drop', { en: 'Discharge, itching or burning', hi: 'सफ़ेद पानी, खुजली या जलन' }, { en: 'What it could be and how soon to go', hi: 'क्या हो सकता है और कितनी जल्दी जाएँ' }),
        linkItem('screen-cervix', 'check', { en: 'Cervical cancer screening', hi: 'बच्चेदानी के मुँह के कैंसर की जाँच' }, { en: 'Continues after menopause, up to 65', hi: 'मेनोपॉज़ के बाद भी, 65 की उम्र तक' })
      ]) +
      askCard({ en: 'Dryness or urine problems after menopause', hi: 'मेनोपॉज़ के बाद सूखापन या पेशाब की परेशानी' }, { en: 'A Qura doctor can talk this through with you privately, suggest what to try first, and refer you to an MBBS gynaecologist for vaginal oestrogen.', hi: 'Qura की डॉक्टर इस बारे में आपसे अकेले में बात कर सकती हैं, बता सकती हैं कि पहले क्या आज़माएँ, और योनि वाले एस्ट्रोजन के लिए MBBS gynaecologist के पास refer करती हैं।' }) +
      sources(['NHS: Vaginal dryness', 'NHS: Post-menopausal bleeding', 'NHS: Benefits and risks of HRT (vaginal oestrogen)', 'Indian Menopause Society. Clinical practice guidelines on menopause 2019–2020', 'NICE NG112: Urinary tract infection (recurrent), antimicrobial prescribing']) + notDx();
    S.wire(v);
  }

  /* ---------- surgical menopause ---------- */
  function renderSurgical(v) {
    v.innerHTML = S.backRow(t('meno_surgical'), 'meno', false) +
      intro({ en: 'If both ovaries are removed before your natural menopause, menopause starts straight after the operation, at any age. This is surgical menopause. It can happen with a hysterectomy or on its own.', hi: 'अगर प्राकृतिक मेनोपॉज़ से पहले दोनों अंडाशय (ovaries) निकाल दिए जाएँ, तो ऑपरेशन के तुरंत बाद मेनोपॉज़ शुरू हो जाता है, उम्र कोई भी हो। इसे surgical मेनोपॉज़ कहते हैं। यह गर्भाशय निकालने (hysterectomy) के साथ भी हो सकता है, या अकेले भी।' }) +
      card(H3({ en: 'Womb removed but ovaries kept?', hi: 'गर्भाशय निकला, पर अंडाशय बचे?' }) +
        P({ en: 'Then your periods stop, but menopause has not started. The ovaries keep working, though menopause may come sooner than it would have. With no periods to go by, your symptoms are the guide.', hi: 'तब पीरियड बंद हो जाते हैं, पर मेनोपॉज़ शुरू नहीं होता। अंडाशय काम करते रहते हैं, हालाँकि मेनोपॉज़ कुछ पहले आ सकता है। पीरियड न होने से अब लक्षण ही संकेत हैं।' }, 'small') +
        goBtn('cond-hyst', { en: 'About hysterectomy', hi: 'Hysterectomy के बारे में' }), 'soft') +
      card(H2({ en: 'What to expect', hi: 'क्या हो सकता है' }) + ul([
        { en: 'Symptoms can start soon after the operation and feel stronger than a natural menopause: hot flushes, sweats, poor sleep, mood changes, dryness', hi: 'लक्षण ऑपरेशन के जल्दी बाद शुरू हो सकते हैं और प्राकृतिक मेनोपॉज़ से ज़्यादा तेज़ लग सकते हैं: गर्मी के झोंके, पसीना, ख़राब नींद, मन के बदलाव, सूखापन' },
        { en: 'Bones and heart lose the protection of oestrogen years early', hi: 'हड्डियों और दिल को एस्ट्रोजन की सुरक्षा सालों पहले मिलनी बंद हो जाती है' },
        { en: 'Feelings of loss, or worry about your body or sex life, are common. They deserve care too.', hi: 'कुछ खोने का एहसास, या शरीर या संबंध को लेकर चिंता, आम है। इनकी भी देखभाल ज़रूरी है।' }
      ])) +
      card(H2({ en: 'Hormone therapy is usually advised', hi: 'आम तौर पर हॉर्मोन therapy की सलाह दी जाती है' }) +
        P({ en: 'If it is safe for you, doctors usually advise hormone therapy until about the usual age of natural menopause, around 50. It protects bones and heart as well as easing symptoms.', hi: 'अगर आपके लिए सुरक्षित हो, तो डॉक्टर आम तौर पर प्राकृतिक मेनोपॉज़ की आम उम्र, लगभग 50, तक हॉर्मोन therapy की सलाह देते हैं। इससे लक्षणों में आराम के साथ हड्डियों और दिल की भी रक्षा होती है।' }) +
        ul([
          { en: 'Womb removed too: usually oestrogen alone', hi: 'गर्भाशय भी निकला: आम तौर पर सिर्फ़ एस्ट्रोजन' },
          { en: 'Womb kept: oestrogen with progestogen', hi: 'गर्भाशय है: एस्ट्रोजन के साथ प्रोजेस्टोजन' },
          { en: 'Surgery for some cancers, or for endometriosis: your specialist plans it differently', hi: 'कुछ कैंसर, या endometriosis के लिए ऑपरेशन: आपके विशेषज्ञ अलग योजना बनाते हैं' },
          { en: 'An MBBS/MD gynaecologist decides and prescribes. Ask about it before you leave hospital', hi: 'फ़ैसला और prescription MBBS/MD gynaecologist का। अस्पताल से छुट्टी से पहले ही पूछ लें' }
        ]) + goBtn('meno-hrt', { en: 'Hormone therapy explained', hi: 'हॉर्मोन therapy को समझें' })) +
      card(H2({ en: 'Before an operation: questions to ask', hi: 'ऑपरेशन से पहले: पूछने के सवाल' }) + steps([
        { en: 'Do my ovaries need to be removed? Why?', hi: 'क्या मेरे अंडाशय निकालने ज़रूरी हैं? क्यों?' },
        { en: 'If they are removed, when should I start hormone therapy, and who will prescribe it?', hi: 'अगर निकाले गए, तो हॉर्मोन therapy कब शुरू करूँ, और कौन लिखेगा?' },
        { en: 'Which symptoms should I expect, and whom do I call?', hi: 'कौन से लक्षण हो सकते हैं, और किसे फ़ोन करूँ?' },
        { en: 'When should I have a bone density test?', hi: 'हड्डियों की जाँच (DEXA) कब करवाऊँ?' }
      ])) +
      card(H2({ en: 'Bones and heart, sooner', hi: 'हड्डियाँ और दिल, जल्दी से' }) + ul([
        { en: 'Menopause before 45 is a reason for an earlier bone density test', hi: '45 से पहले मेनोपॉज़ हो तो हड्डियों की जाँच पहले करवाएँ' },
        { en: 'BP and sugar at least once a year; ask about cholesterol', hi: 'BP और sugar साल में कम से कम एक बार; cholesterol के बारे में पूछें' },
        { en: 'Calcium-rich food, sunlight and strength exercise matter even more', hi: 'Calcium वाला खाना, धूप और ताक़त की कसरत और भी ज़रूरी' }
      ]) + goBtn('meno-bones', { en: 'Bones and heart guide', hi: 'हड्डियाँ और दिल गाइड' })) +
      card(H3({ en: 'In the weeks after surgery', hi: 'ऑपरेशन के बाद के हफ़्तों में' }, 'color:var(--accent)') +
        flag({ en: 'Chest pain, sudden breathlessness, or coughing up blood: go to the nearest hospital now.', hi: 'सीने में दर्द, अचानक साँस फूलना, या खाँसी में ख़ून: अभी सबसे पास के अस्पताल जाएँ।' }, true) +
        flag({ en: 'Pain or swelling in one calf, fever, a wound that is red or leaking, or heavy bleeding from the vagina: see a doctor today.', hi: 'एक पिंडली में दर्द या सूजन, बुख़ार, टाँकों पर लाली या पानी निकलना, या योनि से भारी ब्लीडिंग: आज ही डॉक्टर को दिखाएँ।' })) +
      askCard({ en: 'Surgical menopause', hi: 'ऑपरेशन के बाद मेनोपॉज़' }, { en: 'A Qura doctor can go through your reports with you, help with sleep, food and recovery, and refer you to a gynaecologist about hormone therapy.', hi: 'Qura की डॉक्टर आपकी reports आपके साथ देख सकती हैं, नींद, खाने और recovery में मदद करती हैं, और हॉर्मोन therapy के लिए gynaecologist के पास refer करती हैं।' }) +
      sources(['NHS: Hysterectomy, considerations (removing the ovaries)', 'Indian Menopause Society. Clinical practice guidelines on menopause 2019–2020', 'Indian Menopause Society. Clinical practice guidelines on postmenopausal osteoporosis 2019–2020', 'NHS: Benefits and risks of HRT']) + notDx();
    S.wire(v);
  }

  /* ---------- perimenopause score: the Menopause Rating Scale (MRS) ---------- */
  /* 11 symptoms rated 0 (none) to 4 (very severe) "at this time", summed into three parts and a total out of 44, with the severity
     bands from the scale's methodological review (Heinemann et al. 2004, Table 6). It measures how much symptoms bother her; it is
     not a test for menopause (her periods tell that: the timeline). Each finished set is saved with its date: one a day, the last
     24. The English wording follows the published scale in plain words; the Hindi is ours until the validated MRS-H wording is
     licensed (see MODULE_API, section 20). */
  const MRS = ['hot', 'heart', 'sleep', 'mood', 'irrit', 'anx', 'tired', 'sex', 'bladder', 'dry', 'joints'];
  const PARTS = { body: [0, 1, 2, 10], mind: [3, 4, 5, 6], uro: [7, 8, 9] };
  const BANDS = { total: [4, 8, 16], body: [2, 4, 8], mind: [1, 3, 6], uro: [0, 1, 3] };   /* top of none/little, mild, moderate; above = severe */
  const MAXS = { total: 44, body: 16, mind: 16, uro: 12 };
  const bandOf = (k, n) => { const b = BANDS[k]; return n <= b[0] ? 0 : (n <= b[1] ? 1 : (n <= b[2] ? 2 : 3)); };
  const scoreOf = (v) => { const sum = (ix) => ix.reduce((a, i) => a + (v[i] || 0), 0); return { total: v.reduce((a, x) => a + (x || 0), 0), body: sum(PARTS.body), mind: sum(PARTS.mind), uro: sum(PARTS.uro) }; };
  const peekScores = () => ((((S.state.mods || {})[ID]) || {}).score || []).filter((e) => e && Array.isArray(e.v) && e.v.length === MRS.length);
  const bandPill = (b) => '<span class="pill msc-p' + b + '">' + esc(t('meno_sc_b' + b)) + '</span>';
  const dShort = (k) => S.fmtD(S.fromISO(k), { day: 'numeric', month: 'short' });
  /* Four equal parts (0–4, 5–8, 9–16, 17–44) with a marker placed inside her part. */
  function scaleBar(n) {
    const b = bandOf('total', n); const lo = [0, 5, 9, 17][b], hi = [4, 8, 16, 44][b];
    const pos = (b + (n - lo + 0.5) / (hi - lo + 1)) * 25;
    return '<div class="msc-bar" role="img" aria-label="' + esc(S.tf('meno_sc_bar', { n: n, b: t('meno_sc_b' + b) })) + '">' + [0, 1, 2, 3].map((i) => '<i class="msc-s' + i + '"></i>').join('') + '<b class="msc-mark" style="left:' + pos.toFixed(1) + '%"></b></div>' +
      '<div class="msc-rng" aria-hidden="true">' + ['0–4', '5–8', '9–16', '17–44'].map((r) => '<span class="num">' + r + '</span>').join('') + '</div>';
  }
  /* Her totals over time, 0 to 44, with the band lines at 4, 8 and 16. */
  function scoreChart(hist) {
    const ks = hist.slice(-12); const vals = ks.map((e) => scoreOf(e.v).total); const n = vals.length;
    const Lx = 26, R = 290, Tp = 8, B = 72; const x = (i) => (n === 1 ? (Lx + R) / 2 : Lx + (i * (R - Lx)) / (n - 1)); const y = (val) => B - (val * (B - Tp)) / 44;
    let g = '<svg class="spark meno-spark" viewBox="0 0 300 92" role="img" aria-label="' + esc(vals.join(', ')) + '">';
    [0, 4, 8, 16, 44].forEach((lv) => { g += '<line class="gd" x1="' + Lx + '" y1="' + y(lv).toFixed(1) + '" x2="' + R + '" y2="' + y(lv).toFixed(1) + '"/>' + (lv === 4 || lv === 8 ? '' : '<text x="4" y="' + (y(lv) + 3.5).toFixed(1) + '">' + lv + '</text>'); });   /* 4 and 8 sit too close to 0 to label */
    if (n > 1) g += '<polyline class="ln" points="' + vals.map((val, i) => x(i).toFixed(1) + ',' + y(val).toFixed(1)).join(' ') + '"/>';
    g += vals.map((val, i) => '<circle class="pt" cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="3.5"/>').join('');
    g += '<text x="' + x(0).toFixed(1) + '" y="88" text-anchor="' + (n === 1 ? 'middle' : 'start') + '">' + esc(dShort(ks[0].d)) + '</text>';
    if (n > 1) g += '<text x="' + x(n - 1).toFixed(1) + '" y="88" text-anchor="end">' + esc(dShort(ks[n - 1].d)) + '</text>';
    return g + '</svg>';
  }
  function scoreResult(a, hist) {
    const s = scoreOf(a); const b = bandOf('total', s.total); const today = S.toISO(S.today());
    const prev = hist.filter((e) => e.d < today).slice(-1)[0];
    let change = '';
    if (prev) { const dn = s.total - scoreOf(prev.v).total; const d = dShort(prev.d); change = dn < 0 ? S.tf('meno_sc_down', { n: -dn, d: d }) : (dn > 0 ? S.tf('meno_sc_up', { n: dn, d: d }) : S.tf('meno_sc_same', { d: d })); }
    let h = '<div class="card msc-res" id="msc-res" data-nofold="1"><span class="eyebrow">' + esc(t('meno_sc_eye')) + '</span>' +
      '<div class="msc-big"><b class="num">' + s.total + '</b><span>' + esc(S.tf('meno_sc_of', { m: 44 })) + '</span>' + bandPill(b) + '</div>' + scaleBar(s.total) +
      (change ? '<p class="small">' + esc(change) + ' · ' + esc(t('meno_sc_lower')) + '</p>' : '') +
      '<p>' + esc(t('meno_sc_m' + b)) + '</p>' +
      '<h3>' + esc(t('meno_sc_parts')) + '</h3><div class="msc-subs">' + ['body', 'mind', 'uro'].map((k) => '<div class="msc-sub"><span class="body"><strong>' + esc(t('meno_sc_' + k)) + '</strong><span class="small">' + esc(t('meno_sc_' + k + '_d')) + '</span></span><span class="num msc-n">' + s[k] + '/' + MAXS[k] + '</span>' + bandPill(bandOf(k, s[k])) + '</div>').join('') + '</div></div>';
    if (a[1] >= 3) h += flag({ en: 'You marked heart discomfort as severe. Ask a doctor this month to check your BP, pulse, haemoglobin and thyroid. With chest pain, breathlessness or fainting: go to the nearest hospital now.', hi: 'आपने दिल की बेचैनी को ज़्यादा बताया। इसी महीने डॉक्टर से BP, नब्ज़, हीमोग्लोबिन और थायरॉइड जाँच करवाएँ। साथ में सीने में दर्द, साँस फूलना या बेहोशी: अभी सबसे पास के अस्पताल जाएँ।' });
    if (a[3] >= 3) h += flag(t('s6a'));
    const items = [];
    if (S.routeOwner('relief-hot') && (a[0] >= 1)) items.push(linkItem('relief-hot', 'leaf', t('meno_tl_hot'), ''));
    if (S.routeOwner('relief-sleep') && (a[2] >= 1)) items.push(linkItem('relief-sleep', 'moon', t('meno_tl_sleep'), ''));
    if (S.routeOwner('calm') && (a[2] >= 1)) items.push(linkItem('calm', 'moon', t('calm_row'), ''));   /* Version 39.21: Wind down */
    if (b >= 2 || bandOf('body', s.body) >= 2) items.push(linkItem('meno-hrt', 'pill', t('meno_hrt'), t('meno_hrt_s')));
    if (bandOf('uro', s.uro) >= 2) items.push(linkItem('meno-intimate', 'flower', t('meno_intimate'), t('meno_intimate_s')));
    if (bandOf('body', s.body) >= 1 || bandOf('mind', s.mind) >= 1) items.push(linkItem('meno-bones', 'heart', t('meno_bones'), t('meno_bones_s')));
    if (items.length) h += card(H2({ en: 'What helps', hi: 'किससे मदद मिलती है' }) + (bandOf('uro', s.uro) >= 2 ? '<p class="small">' + esc(t('meno_sc_uro_tx')) + '</p>' : '') + '<div class="list">' + items.join('') + '</div>');
    h += askCard({ en: 'My perimenopause score', hi: 'मेरा पेरिमेनोपॉज़ स्कोर' }, { en: 'Bring your score to a free call. A Qura doctor (BAMS) goes through it with you, helps with sleep, food and movement, orders tests, and refers you to an MBBS gynaecologist for hormone or other medicines.', hi: 'अपना स्कोर लेकर मुफ़्त कॉल पर आएँ। Qura की डॉक्टर (BAMS) इसे आपके साथ देखती हैं, नींद, खाने और कसरत में मदद करती हैं, जाँच लिखती हैं, और हॉर्मोन या दूसरी दवाओं के लिए MBBS gynaecologist के पास refer करती हैं।' }) +
      '<p class="small msc-not">' + esc(t('meno_sc_not')) + '</p><button type="button" class="linkbtn" id="msc-redo">' + esc(t('meno_sc_redo')) + '</button>';
    return h;
  }
  function scoreHistory(hist) {
    if (!hist.length) return '';
    const last = hist[hist.length - 1]; const next = S.addDays(S.fromISO(last.d), 28);
    return card('<h2>' + esc(t('meno_sc_hist')) + '</h2>' + (hist.length > 1 ? scoreChart(hist) : '') +
      '<div class="msc-his">' + hist.slice(-6).reverse().map((e) => { const s = scoreOf(e.v); return '<div class="msc-hi"><span class="body"><strong>' + esc(S.fmtD(S.fromISO(e.d), { day: 'numeric', month: 'long', year: 'numeric' })) + '</strong><span class="small">' + esc(S.tf('meno_sc_parts3', { a: s.body, b: s.mind, c: s.uro })) + '</span></span><span class="num msc-n">' + s.total + '/44</span>' + bandPill(bandOf('total', s.total)) + '</div>'; }).join('') + '</div>' +
      (next > S.today() ? '<p class="small">' + esc(S.tf('meno_sc_next', { d: S.fmtD(next, { day: 'numeric', month: 'long' }) })) + '</p>' : '<p class="small">' + esc(t('meno_sc_due')) + '</p>'));
  }
  function renderScore(v) {
    own(); const can = S.canSave(); const age = S.cycle.ageYears();
    /* answers are for one day: left open past midnight, the score starts fresh (yesterday's are in the history) */
    const day0 = S.toISO(S.today()); if (mem.scDay !== day0) { mem.sc = null; mem.scDay = day0; }
    if (!mem.sc || mem.sc.length !== MRS.length) mem.sc = MRS.map(() => null);
    const a = mem.sc; const done = a.every((x) => x != null); const hist = peekScores();
    let h = S.backRow(t('meno_sc_h'), 'meno', true) + '<p class="small">' + esc(t('meno_sc_p')) + '</p>';
    if (S.cycle.isPregnant && S.cycle.isPregnant()) {
      v.innerHTML = h + card('<p class="small">' + esc(t('meno_sc_preg')) + '</p>' + (S.routeOwner('preg-symptoms') ? '<button type="button" class="btn sm meno-self" data-go="preg-symptoms">' + esc(t('meno_sc_preg_b')) + '</button>' : ''), 'soft') + '<p class="footnote">' + esc(t('meno_sc_foot')) + '</p>';
      S.wire(v); return;
    }
    if (age != null && age < 40) h += card('<p class="small">' + esc(t('meno_sc_young')) + '</p>' + goBtn('cond-poi', { en: 'Read about POI', hi: 'POI के बारे में पढ़ें' }), 'soft');
    h += '<p class="meno-q">' + esc(t('meno_sc_q')) + '</p>' +
      MRS.map((k, i) => '<div class="card msc-q"><p><b class="num">' + (i + 1) + '.</b> <strong>' + esc(t('meno_sc_' + k)) + '</strong></p><p class="small">' + esc(t('meno_sc_' + k + '_d')) + '</p>' +
        '<div class="chips msc-chips" role="group" aria-label="' + esc(t('meno_sc_' + k)) + '">' + [0, 1, 2, 3, 4].map((n) => '<button type="button" class="chip' + (a[i] === n ? ' on' : '') + '" data-msc="' + i + '" data-v="' + n + '" aria-pressed="' + (a[i] === n) + '">' + esc(t('meno_sc_l' + n)) + '</button>').join('') + '</div></div>').join('') +
      (done ? scoreResult(a, hist) : '<p class="small msc-left">' + esc(t('meno_sc_all')) + '</p>') +
      scoreHistory(hist) +
      (can ? '<p class="small">' + T({ en: 'Saved only on this phone, each time you answer all 11.', hi: 'सिर्फ़ इसी फ़ोन पर, हर बार जब आप सभी 11 के जवाब देती हैं।' }) + '</p>' : '') +
      sources(['Heinemann K, Ruebig A, Potthoff P, et al. The Menopause Rating Scale (MRS) scale: a methodological review. Health Qual Life Outcomes 2004;2:45 (severity bands, Table 6)', 'Heinemann LAJ, Potthoff P, Schneider HPG. International versions of the Menopause Rating Scale (MRS). Health Qual Life Outcomes 2003;1:28']) +
      '<p class="footnote">' + esc(t('meno_sc_foot')) + '</p>';
    v.innerHTML = h; S.wire(v);
    v.querySelectorAll('[data-msc]').forEach((b) => b.addEventListener('click', () => {
      a[+b.dataset.msc] = +b.dataset.v; const was = done; const y = window.scrollY; const now = a.every((x) => x != null);
      if (now && can) { const d = D(); const day = S.toISO(S.today()); d.score = (d.score || []).filter((e) => e && e.d !== day); d.score.push({ d: day, v: a.slice() }); d.score = d.score.slice(-24); S.save(); }
      renderScore(v); window.scrollTo(0, y);
      if (now && !was) { const r = document.getElementById('msc-res'); if (r) r.scrollIntoView({ block: 'start' }); }
    }));
    const rd = v.querySelector('#msc-redo'); if (rd) rd.addEventListener('click', () => { mem.sc = null; renderScore(v); window.scrollTo(0, 0); });
  }

  /* ---------- hooks ---------- */
  function summary() {
    const out = []; const st = stats();
    const fmt = (k) => S.fmtD(S.fromISO(k), { day: 'numeric', month: 'short', year: 'numeric' });
    if (st.keys.length) {
      const L = [S.tf('meno_sum_weeks', { n: st.keys.length, a: fmt(st.keys[0]), b: fmt(st.keys[st.keys.length - 1]) })];
      L.push(t('meno_sum_top') + ': ' + (st.freq.length ? st.freq.slice(0, 4).map((x) => t('meno_g_' + x.k) + ' ' + x.n + '/' + st.last4.length).join(', ') : '—'));
      const lots = st.freq.filter((x) => x.lot).map((x) => t('meno_g_' + x.k) + ' ×' + x.lot);
      if (lots.length) L.push(t('meno_sum_lot') + ': ' + lots.join(', '));
      L.push(t('meno_noscore'));
      out.push({ title: t('meno_sum_h'), lines: L });
    }
    /* Version 39.49 (night sweats and sleep): the days in her last 28 that hold hot flushes and poor sleep together */
    const dl = S.state.daily || {}; const t0 = S.today();
    const hn = Object.keys(dl).filter((k) => { const n = S.diffDays(S.fromISO(k), t0); return n >= 0 && n < 28 && (dl[k] || []).indexOf('d_hotflush') >= 0 && (dl[k] || []).indexOf('d_sleep') >= 0; }).length;
    if (hn && S.cycle.isMidlife && S.cycle.isMidlife() && !S.cycle.isPregnant()) out.push({ title: t('meno_night_h'), lines: [S.tf('meno_night_l', { k: hn, n: 28 })] });
    const sc = peekScores();
    if (sc.length) {
      const last = sc[sc.length - 1]; const s = scoreOf(last.v);
      const L2 = [S.tf('meno_sc_sum', { d: fmt(last.d), n: s.total, b: t('meno_sc_b' + bandOf('total', s.total)), x: s.body, y: s.mind, z: s.uro })];
      if (sc.length > 1) { const p = sc[sc.length - 2]; L2.push(S.tf('meno_sc_sum_prev', { n: scoreOf(p.v).total, d: fmt(p.d) })); }
      out.push({ title: t('meno_sc_h'), lines: L2 });
    }
    return out;
  }
  function home() {
    if (!S.canSave()) return '';
    if (stopDue()) return '<button type="button" class="action" data-go="meno-timeline" data-slot-first="1"><span class="ico accent">' + S.I.chart + '</span><span class="body"><strong>' + esc(t('meno_stop_home')) + '</strong><span class="small">' + esc(t('meno_stop_q')) + '</span></span><span class="go">' + S.I.chev + '</span></button>';
    const dia = peekDiary(); const keys = loggedKeys(dia); if (!keys.length || dia[wk(S.today())]) return '';
    return '<button type="button" class="action" data-go="meno-diary"><span class="ico accent">' + S.I.chart + '</span><span class="body"><strong>' + esc(t('meno_home_h')) + '</strong><span class="small">' + esc(t('meno_home_p')) + '</span></span><span class="go">' + esc(t('start_b')) + '</span></button>';
  }
  function sample(id) {
    if (id !== 'kamla') return;
    /* Six weekly entries ending this week: hot flushes and night sweats waking her, poor sleep, some irritability and aches. */
    const rows = [
      { hot: 2, sweats: 2, sleep: 2, mood: 1, joints: 1, fog: 1, desire: 1 },
      { hot: 2, sweats: 3, sleep: 3, mood: 2, joints: 1, fog: 1, desire: 1, head: 1 },
      { hot: 3, sweats: 3, sleep: 3, mood: 2, anxiety: 1, joints: 1, fog: 1, desire: 1 },
      { hot: 2, sweats: 2, sleep: 2, mood: 1, joints: 2, fog: 1, desire: 1 },
      { hot: 3, sweats: 3, sleep: 3, mood: 2, anxiety: 1, joints: 1, fog: 2, desire: 1 },
      { hot: 3, sweats: 3, sleep: 3, mood: 1, joints: 1, fog: 1, desire: 1, dryness: 1 }
    ];
    const cur = S.fromISO(wk(S.today())); const diary = {};
    rows.forEach((r, i) => {
      const a = S.addDays(cur, -7 * (rows.length - 1 - i)); const end = S.addDays(a, 6);
      diary[S.toISO(a)] = { v: Object.assign(zero(), r), at: S.toISO(end > S.today() ? S.today() : end) };
    });
    S.data(ID).diary = diary;
    const ago = (n) => S.toISO(S.addDays(S.today(), -n));
    S.data(ID).score = [{ d: ago(56), v: [3, 1, 3, 2, 2, 1, 2, 1, 0, 1, 2] }, { d: ago(28), v: [3, 0, 3, 2, 1, 1, 2, 1, 0, 1, 1] }];
  }

  /* ---------- registration ---------- */
  S.register({
    id: ID,
    demoPersona: 'kamla',
    strings: {
      en: {
        meno_sc_h: 'Perimenopause score', meno_sc_s: '11 questions doctors use: how much your symptoms bother you',
        meno_sc_p: 'The Menopause Rating Scale: 11 questions that doctors around the world use to measure how much menopause symptoms bother you. It takes about 2 minutes. Take it again each month to see what changes, and show it to your doctor.',
        meno_sc_q: 'How much does each of these bother you at this time?',
        meno_sc_hot: 'Hot flushes, sweating', meno_sc_hot_d: 'Sudden heat, bouts of sweating', meno_sc_heart: 'Heart discomfort', meno_sc_heart_d: 'Feeling your heartbeat, skipping or racing, tightness',
        meno_sc_sleep: 'Sleep problems', meno_sc_sleep_d: 'Hard to fall asleep or stay asleep, waking too early', meno_sc_mood: 'Low mood', meno_sc_mood_d: 'Feeling down or sad, close to tears, no drive, mood swings',
        meno_sc_irrit: 'Irritability', meno_sc_irrit_d: 'Feeling nervous, tense inside, quick to anger', meno_sc_anx: 'Anxiety', meno_sc_anx_d: 'Restless inside, feeling panicky',
        meno_sc_tired: 'Tired in body and mind', meno_sc_tired_d: 'Less energy for work, poor memory and focus, forgetting things', meno_sc_sex: 'Sexual problems', meno_sc_sex_d: 'Changes in desire, in sex, and in satisfaction',
        meno_sc_bladder: 'Bladder problems', meno_sc_bladder_d: 'Trouble passing urine, needing to go often, leaking', meno_sc_dry: 'Vaginal dryness', meno_sc_dry_d: 'Dryness or burning in the vagina, difficulty with sex',
        meno_sc_joints: 'Joint and muscle pain', meno_sc_joints_d: 'Pain in the joints, aches like rheumatism',
        meno_sc_l0: 'None', meno_sc_l1: 'Mild', meno_sc_l2: 'Moderate', meno_sc_l3: 'Severe', meno_sc_l4: 'Very severe', meno_sc_all: 'Answer all 11 to see your score.',
        meno_sc_eye: 'Your perimenopause score', meno_sc_of: 'out of {m}', meno_sc_bar: 'Score {n}: {b}',
        meno_sc_b0: 'None or little', meno_sc_b1: 'Mild', meno_sc_b2: 'Moderate', meno_sc_b3: 'Severe',
        meno_sc_m0: 'Your symptoms bother you very little right now. Take it again in a month, or when something changes.',
        meno_sc_m1: 'Mild. Small changes often help: keep cool, keep a sleep routine, and move most days. The routines below can help in the moment.',
        meno_sc_m2: 'Moderate. Treatment can help, so it’s worth seeing a doctor. Hormone therapy is the most effective treatment for flushes and sweats, there are non-hormone options too, and a doctor checks what is safe for you.',
        meno_sc_m3: 'Severe. You don’t have to put up with this. See a doctor this month. Hormone therapy is the most effective treatment for flushes and sweats, there are non-hormone options too, and a doctor checks what is safe for you.',
        meno_sc_parts: 'The three parts', meno_sc_parts3: 'Body {a} · Mood {b} · Bladder and sex {c}',
        meno_sc_body: 'Body', meno_sc_body_d: 'Hot flushes, heart, sleep, joints', meno_sc_mind: 'Mood and energy', meno_sc_mind_d: 'Low mood, irritability, anxiety, tiredness',
        meno_sc_uro: 'Bladder, vagina and sex', meno_sc_uro_d: 'Bladder, dryness, sex', meno_sc_uro_tx: 'Dryness and bladder problems usually don’t settle on their own, and they are treatable.',
        meno_sc_lower: 'Lower is better.', meno_sc_down: '{n} lower than on {d}', meno_sc_up: '{n} higher than on {d}', meno_sc_same: 'The same as on {d}',
        meno_sc_not: 'This score shows how much symptoms bother you. It doesn’t show whether you are in perimenopause or menopause: your periods do. Thyroid problems, anaemia, depression and some medicines can cause the same symptoms, so a doctor checks those too.',
        meno_sc_redo: 'Start again', meno_sc_hist: 'Your scores', meno_sc_next: 'Take it again from {d} to see what changes.', meno_sc_due: 'A month has passed: take it again to see what changes.',
        meno_sc_young: 'This scale is made for the years around menopause, usually after 40. Before 40, symptoms like these usually have other causes. If your periods stopped before 40, see a gynaecologist.',
        meno_sc_preg: 'You are marked as pregnant. These questions are about menopause. For anything that worries you in pregnancy, use the pregnancy symptoms guide.', meno_sc_preg_b: 'Pregnancy symptoms guide',
        meno_sc_foot: 'Menopause Rating Scale (MRS). The same 11 questions for everyone. Not a diagnosis.',
        meno_sc_sum: 'Perimenopause score (Menopause Rating Scale), {d}: {n}/44, {b}. Body {x}/16, mood and energy {y}/16, bladder, vagina and sex {z}/12', meno_sc_sum_prev: 'Before that: {n}/44 on {d}',
        meno_tl_why_preg: 'You are pregnant, so your periods can’t show where you are on this timeline. Come back to it after your baby is born and your periods return.',
        meno_tl_why_post: 'After a birth and while you breastfeed, periods can stay away for months, so this timeline can’t count yet. It will once your periods return.',
        meno_tl_why_horm: 'On a hormonal method (the pill, an injection or a hormonal IUD), your periods can’t show menopause. Ask your doctor: they go by your age and symptoms.',
        meno_tl_why_hyst: 'After a hysterectomy there are no periods to count. Doctors go by your symptoms, and the perimenopause score helps you track them.',
        meno_tl_young: 'This timeline is for women in their 40s and 50s. Before 40, periods that change usually have other causes.',
        meno_tl_poi: 'No period for {m} months before 40 is not menopause. See a gynaecologist: it can be premature ovarian insufficiency (POI), which needs treatment, not waiting.',
        meno_tl_poi0: 'Periods that stop before 40 are not menopause. See a gynaecologist: it can be premature ovarian insufficiency (POI), which needs treatment, not waiting.',
        meno_tl_done_early: '12 months without a period before 45: doctors call this early menopause. See a doctor, because your bones and heart need care sooner and treatment helps. Any bleeding from now on needs a check.',
        meno_tl_h: 'Your menopause timeline', meno_tl_s: 'Where your dates are, and what helps', meno_tl_p: 'Menopause is confirmed once 12 months pass without a period. The years before it, when periods change, are called perimenopause. For many women in India the changes start in the early or mid-40s.',
        meno_tl_last: 'Your last period: {d}', meno_tl_months: '{m} of 12 months without a period', meno_tl_still: 'Your periods are still coming. Changes often start as gaps get longer or shorter, and flow gets heavier or lighter.', meno_tl_gap: 'Longest gap in the last year: {n} days',
        meno_tl_done: '12 months without a period: doctors call this menopause. Any bleeding from now on needs a doctor’s check.', meno_stop_q: 'Have your periods stopped?', meno_stop_p: 'Tell Sakhi, so any bleeding from now on gets a check.', meno_stop_y: 'Yes, they have stopped', meno_stop_n: 'Not yet', meno_stop_home: 'A year since your last period', meno_tl_none: 'Log your periods to see your own timeline here.',
        meno_tl_s1: 'Periods change', meno_tl_s1p: 'Gaps change; flushes and poor sleep can start', meno_tl_s2: 'Last period + 12 months', meno_tl_s2p: 'Menopause is confirmed', meno_tl_s3: 'After menopause', meno_tl_s3p: 'Bones and heart need more care',
        meno_tl_relief: 'What helps', meno_tl_hot: 'Feel better now: hot flushes', meno_tl_sleep: 'Feel better now: sleep', meno_tl_ask: 'Talk to a Qura doctor about menopause', meno_tl_foot: 'Counts from your own dates. Not a diagnosis.',
        meno_hub: 'Menopause', meno_hub_t: 'All about menopause', meno_hub_s: 'What changes, what helps, when to see a doctor',
        meno_setup: 'Start the weekly symptom diary',
        meno_diary: 'Weekly symptom diary', meno_diary_s: 'Hot flushes, sleep, mood and 9 more, rated 0–3 once a week',
        meno_hrt: 'Hormone therapy (HRT)', meno_hrt_s: 'What it helps, the real risks, who can’t take it, other options',
        meno_bones: 'Bones and heart', meno_bones_s: 'Calcium from Indian food, vitamin D, exercise, falls, yearly checks',
        meno_intimate: 'Dryness, sex and urine', meno_intimate_s: 'Common after menopause, and treatable',
        meno_surgical: 'Surgical menopause', meno_surgical_s: 'When the ovaries are removed',
        meno_s_hot: 'Hot flushes', meno_s_sweats: 'Night sweats', meno_s_sleep: 'Poor sleep', meno_s_mood: 'Mood swings or irritability', meno_s_anxiety: 'Anxiety or nervousness', meno_s_joints: 'Joint or muscle pain',
        meno_s_dryness: 'Vaginal dryness or pain with sex', meno_s_urine: 'Urine urgency or leaking', meno_s_palp: 'Palpitations (racing heart)', meno_s_fog: 'Forgetting things, poor focus', meno_s_desire: 'Low interest in sex', meno_s_head: 'Headaches',
        meno_g_hot: 'Hot flushes', meno_g_sweats: 'Night sweats', meno_g_sleep: 'Poor sleep', meno_g_mood: 'Mood', meno_g_anxiety: 'Anxiety', meno_g_joints: 'Joint pain',
        meno_g_dryness: 'Dryness', meno_g_urine: 'Urine', meno_g_palp: 'Palpitations', meno_g_fog: 'Brain fog', meno_g_desire: 'Low desire', meno_g_head: 'Headaches',
        meno_l0: 'None', meno_l1: 'A little', meno_l2: 'Moderate', meno_l3: 'A lot', meno_lot: 'a lot',
        meno_this_wk: 'This week', meno_last_wk: 'Last week', meno_n_wk: '{n} weeks ago',
        meno_save_wk: 'Save this week', meno_del_wk: 'Delete this week’s entry', meno_del_q: 'Delete your entry for {w}? There is no undo.', meno_saved: 'Week saved.', meno_deleted: 'Entry deleted.',
        meno_count_row: 'Moderate or a lot', meno_logged4: 'Weeks logged: {n} of 4', meno_wk_of: '{n} of {m} weeks',
        meno_noscore: 'Counts of your own entries. No score, no diagnosis.',
        meno_sum_h: 'Menopause diary', meno_sum_weeks: 'Weekly entries: {n} ({a} to {b})', meno_sum_top: 'Most frequent, last 4 weeks', meno_sum_lot: 'Rated “a lot”, last 4 weeks',
        meno_night_h: 'Hot flushes and sleep', meno_night_l: 'Hot flushes and poor sleep on the same day: {k} of the last {n} days',   /* Version 39.49 */
        meno_home_h: 'Menopause diary: this week', meno_home_p: 'Rate 12 symptoms, about a minute'
      },
      hi: {
        meno_sc_h: 'पेरिमेनोपॉज़ स्कोर', meno_sc_s: 'डॉक्टरों के 11 सवाल: लक्षण आपको कितना परेशान करते हैं',
        meno_sc_p: 'मेनोपॉज़ रेटिंग स्केल: 11 सवाल, जिनसे दुनिया भर के डॉक्टर मापते हैं कि मेनोपॉज़ के लक्षण आपको कितना परेशान करते हैं। लगभग 2 मिनट लगते हैं। हर महीने फिर से करें ताकि बदलाव दिखे, और अपनी डॉक्टर को दिखाएँ।',
        meno_sc_q: 'अभी इनमें से हर एक आपको कितना परेशान करता है?',
        meno_sc_hot: 'गर्मी के झोंके, पसीना', meno_sc_hot_d: 'अचानक गर्मी लगना, पसीना आना', meno_sc_heart: 'दिल में बेचैनी', meno_sc_heart_d: 'धड़कन महसूस होना, रुक-रुक कर या तेज़ धड़कना, जकड़न',
        meno_sc_sleep: 'नींद की दिक़्क़त', meno_sc_sleep_d: 'नींद आने या टिकने में मुश्किल, बहुत जल्दी जाग जाना', meno_sc_mood: 'उदासी', meno_sc_mood_d: 'मन उदास, रोने जैसा लगना, कुछ करने का मन न होना, मन बदलते रहना',
        meno_sc_irrit: 'चिड़चिड़ापन', meno_sc_irrit_d: 'नर्वस लगना, अंदर तनाव, जल्दी ग़ुस्सा', meno_sc_anx: 'घबराहट', meno_sc_anx_d: 'अंदर से बेचैनी, घबराहट का दौरा-सा',
        meno_sc_tired: 'शरीर और मन की थकान', meno_sc_tired_d: 'काम की ताक़त कम, याददाश्त और ध्यान कमज़ोर, बातें भूलना', meno_sc_sex: 'संबंध से जुड़ी दिक़्क़त', meno_sc_sex_d: 'इच्छा, संबंध और संतोष में बदलाव',
        meno_sc_bladder: 'पेशाब की दिक़्क़त', meno_sc_bladder_d: 'पेशाब करने में मुश्किल, बार-बार जाना, पेशाब निकल जाना', meno_sc_dry: 'योनि में सूखापन', meno_sc_dry_d: 'योनि में सूखापन या जलन, संबंध में मुश्किल',
        meno_sc_joints: 'जोड़ों और मांसपेशियों में दर्द', meno_sc_joints_d: 'जोड़ों में दर्द, गठिया जैसी तकलीफ़',
        meno_sc_l0: 'नहीं', meno_sc_l1: 'हल्का', meno_sc_l2: 'मध्यम', meno_sc_l3: 'ज़्यादा', meno_sc_l4: 'बहुत ज़्यादा', meno_sc_all: 'अपना स्कोर देखने के लिए सभी 11 के जवाब दें।',
        meno_sc_eye: 'आपका पेरिमेनोपॉज़ स्कोर', meno_sc_of: '{m} में से', meno_sc_bar: 'स्कोर {n}: {b}',
        meno_sc_b0: 'न के बराबर', meno_sc_b1: 'हल्के', meno_sc_b2: 'मध्यम', meno_sc_b3: 'ज़्यादा',
        meno_sc_m0: 'अभी लक्षण आपको बहुत कम परेशान करते हैं। एक महीने बाद, या कुछ बदले तो, फिर से करें।',
        meno_sc_m1: 'हल्के। छोटे बदलाव अक्सर मदद करते हैं: ठंडक रखें, सोने का नियम रखें, और ज़्यादातर दिन चलें-फिरें। नीचे दिए तरीक़े उसी पल मदद कर सकते हैं।',
        meno_sc_m2: 'मध्यम। इलाज से मदद मिल सकती है, इसलिए डॉक्टर को दिखाना ठीक है। गर्मी के झोंकों और पसीने का सबसे असरदार इलाज हॉर्मोन therapy है, बिना हॉर्मोन वाले रास्ते भी हैं, और आपके लिए क्या सुरक्षित है, यह डॉक्टर देखती हैं।',
        meno_sc_m3: 'ज़्यादा। इसे सहते रहना ज़रूरी नहीं। इसी महीने डॉक्टर को दिखाएँ। गर्मी के झोंकों और पसीने का सबसे असरदार इलाज हॉर्मोन therapy है, बिना हॉर्मोन वाले रास्ते भी हैं, और आपके लिए क्या सुरक्षित है, यह डॉक्टर देखती हैं।',
        meno_sc_parts: 'तीन हिस्से', meno_sc_parts3: 'शरीर {a} · मन {b} · पेशाब और संबंध {c}',
        meno_sc_body: 'शरीर', meno_sc_body_d: 'गर्मी के झोंके, दिल, नींद, जोड़', meno_sc_mind: 'मन और ऊर्जा', meno_sc_mind_d: 'उदासी, चिड़चिड़ापन, घबराहट, थकान',
        meno_sc_uro: 'पेशाब, योनि और संबंध', meno_sc_uro_d: 'पेशाब, सूखापन, संबंध', meno_sc_uro_tx: 'सूखापन और पेशाब की दिक़्क़त अक्सर अपने आप ठीक नहीं होती, और इनका इलाज है।',
        meno_sc_lower: 'कम होना अच्छा है।', meno_sc_down: '{d} से {n} कम', meno_sc_up: '{d} से {n} ज़्यादा', meno_sc_same: '{d} जितना ही',
        meno_sc_not: 'यह स्कोर बताता है कि लक्षण आपको कितना परेशान करते हैं। इससे यह पता नहीं चलता कि आप पेरिमेनोपॉज़ में हैं या मेनोपॉज़ में: यह आपके पीरियड बताते हैं। थायरॉइड, ख़ून की कमी, डिप्रेशन और कुछ दवाएँ भी ऐसे ही लक्षण दे सकती हैं, इसलिए डॉक्टर उनकी भी जाँच करती हैं।',
        meno_sc_redo: 'फिर से शुरू करें', meno_sc_hist: 'आपके स्कोर', meno_sc_next: '{d} से फिर करें, ताकि बदलाव दिखे।', meno_sc_due: 'एक महीना हो गया: फिर से करें, ताकि बदलाव दिखे।',
        meno_sc_young: 'यह स्केल मेनोपॉज़ के आसपास के सालों के लिए है, आम तौर पर 40 के बाद। 40 से पहले ऐसे लक्षणों की आम तौर पर दूसरी वजहें होती हैं। अगर 40 से पहले पीरियड बंद हो गए हों, तो gynaecologist को दिखाएँ।',
        meno_sc_preg: 'आपने गर्भवती चुना है। ये सवाल मेनोपॉज़ के बारे में हैं। प्रेग्नेंसी में किसी भी चिंता के लिए प्रेग्नेंसी लक्षण गाइड देखें।', meno_sc_preg_b: 'प्रेग्नेंसी लक्षण गाइड',
        meno_sc_foot: 'मेनोपॉज़ रेटिंग स्केल (MRS)। सबके लिए वही 11 सवाल। यह जाँच का नतीजा नहीं है।',
        meno_sc_sum: 'पेरिमेनोपॉज़ स्कोर (मेनोपॉज़ रेटिंग स्केल), {d}: {n}/44, {b}। शरीर {x}/16, मन और ऊर्जा {y}/16, पेशाब, योनि और संबंध {z}/12', meno_sc_sum_prev: 'उससे पहले: {d} को {n}/44',
        meno_tl_why_preg: 'आप गर्भवती हैं, इसलिए आपके पीरियड इस टाइमलाइन पर आपकी जगह नहीं बता सकते। बच्चे के जन्म और पीरियड लौटने के बाद इसे फिर देखें।',
        meno_tl_why_post: 'डिलीवरी के बाद और दूध पिलाते समय पीरियड महीनों तक रुके रह सकते हैं, इसलिए यह टाइमलाइन अभी गिनती नहीं कर सकती। पीरियड लौटने पर करेगी।',
        meno_tl_why_horm: 'हॉर्मोन वाले तरीक़े (गोली, इंजेक्शन या हॉर्मोन वाला IUD) पर पीरियड से मेनोपॉज़ का पता नहीं चलता। अपनी डॉक्टर से पूछें: वे आपकी उम्र और लक्षणों से देखती हैं।',
        meno_tl_why_hyst: 'बच्चेदानी निकलने (hysterectomy) के बाद गिनने को पीरियड नहीं होते। डॉक्टर आपके लक्षणों से देखती हैं, और पेरिमेनोपॉज़ स्कोर उन्हें ट्रैक करने में मदद करता है।',
        meno_tl_young: 'यह टाइमलाइन 40 और 50 की उम्र वाली महिलाओं के लिए है। 40 से पहले पीरियड बदलने की आम तौर पर दूसरी वजहें होती हैं।',
        meno_tl_poi: '40 से पहले {m} महीने पीरियड न आना मेनोपॉज़ नहीं है। स्त्री रोग विशेषज्ञ को दिखाएँ: यह premature ovarian insufficiency (POI) हो सकता है, जिसमें इंतज़ार नहीं, इलाज चाहिए।',
        meno_tl_poi0: '40 से पहले पीरियड बंद होना मेनोपॉज़ नहीं है। स्त्री रोग विशेषज्ञ को दिखाएँ: यह premature ovarian insufficiency (POI) हो सकता है, जिसमें इंतज़ार नहीं, इलाज चाहिए।',
        meno_tl_done_early: '45 से पहले 12 महीने बिना पीरियड: डॉक्टर इसे जल्दी मेनोपॉज़ (early menopause) कहते हैं। डॉक्टर को दिखाएँ, क्योंकि हड्डियों और दिल की देखभाल जल्दी चाहिए और इलाज मदद करता है। अब से कोई भी ब्लीडिंग हो, तो जाँच ज़रूरी है।',
        meno_tl_h: 'आपकी मेनोपॉज़ टाइमलाइन', meno_tl_s: 'आपकी तारीख़ें कहाँ हैं, और किससे आराम मिलता है', meno_tl_p: 'पीरियड बंद हुए 12 महीने हो जाएँ, तब मेनोपॉज़ पक्का होता है। उससे पहले के साल, जब पीरियड बदलते हैं, पेरिमेनोपॉज़ कहलाते हैं। भारत में बहुत सी महिलाओं में ये बदलाव 40 की शुरुआत या बीच से शुरू होते हैं।',
        meno_tl_last: 'आपका पिछला पीरियड: {d}', meno_tl_months: '12 में से {m} महीने बिना पीरियड', meno_tl_still: 'आपके पीरियड अभी आ रहे हैं। बदलाव अक्सर ऐसे शुरू होते हैं: अंतर लंबा या छोटा होना, और ब्लीडिंग ज़्यादा या कम होना।', meno_tl_gap: 'पिछले साल का सबसे लंबा अंतर: {n} दिन',
        meno_tl_done: '12 महीने बिना पीरियड: डॉक्टर इसे मेनोपॉज़ कहते हैं। अब से कोई भी ब्लीडिंग हो, तो डॉक्टर से जाँच ज़रूरी है।', meno_stop_q: 'क्या आपके पीरियड बंद हो गए हैं?', meno_stop_p: 'Sakhi को बताएँ, ताकि अब से कोई भी ब्लीडिंग हो तो उसकी जाँच हो।', meno_stop_y: 'हाँ, बंद हो गए हैं', meno_stop_n: 'अभी नहीं', meno_stop_home: 'पिछले पीरियड को एक साल', meno_tl_none: 'अपनी टाइमलाइन यहाँ देखने के लिए पीरियड दर्ज करें।',
        meno_tl_s1: 'पीरियड बदलते हैं', meno_tl_s1p: 'अंतर बदलता है; हॉट फ़्लश और नींद की दिक़्क़त शुरू हो सकती है', meno_tl_s2: 'आख़िरी पीरियड + 12 महीने', meno_tl_s2p: 'मेनोपॉज़ पक्का होता है', meno_tl_s3: 'मेनोपॉज़ के बाद', meno_tl_s3p: 'हड्डियों और दिल का ज़्यादा ख़याल',
        meno_tl_relief: 'किससे आराम मिलता है', meno_tl_hot: 'अभी थोड़ा आराम: हॉट फ़्लश', meno_tl_sleep: 'अभी थोड़ा आराम: नींद', meno_tl_ask: 'मेनोपॉज़ के बारे में Qura की डॉक्टर से बात करें', meno_tl_foot: 'आपकी अपनी तारीख़ों से गिनती। यह जाँच का नतीजा नहीं है।',
        meno_hub: 'मेनोपॉज़', meno_hub_t: 'मेनोपॉज़: पूरी जानकारी', meno_hub_s: 'क्या बदलता है, क्या मदद करता है, डॉक्टर को कब दिखाएँ',
        meno_setup: 'हफ़्ते की लक्षण डायरी शुरू करें',
        meno_diary: 'हफ़्ते की लक्षण डायरी', meno_diary_s: 'गर्मी के झोंके, नींद, मन और 9 और, हफ़्ते में एक बार 0–3 अंक',
        meno_hrt: 'हॉर्मोन therapy (HRT)', meno_hrt_s: 'किसमें मदद करती है, असली जोखिम, कौन नहीं ले सकता, दूसरे रास्ते',
        meno_bones: 'हड्डियाँ और दिल', meno_bones_s: 'भारतीय खाने से calcium, vitamin D, कसरत, गिरने से बचाव, सालाना जाँच',
        meno_intimate: 'सूखापन, संबंध और पेशाब', meno_intimate_s: 'मेनोपॉज़ के बाद आम, और इलाज है',
        meno_surgical: 'ऑपरेशन से मेनोपॉज़', meno_surgical_s: 'जब अंडाशय (ovaries) निकाल दिए जाएँ',
        meno_s_hot: 'गर्मी के झोंके', meno_s_sweats: 'रात में पसीना', meno_s_sleep: 'ख़राब नींद', meno_s_mood: 'चिड़चिड़ापन या मन बदलना', meno_s_anxiety: 'घबराहट या बेचैनी', meno_s_joints: 'जोड़ों या मांसपेशियों में दर्द',
        meno_s_dryness: 'योनि में सूखापन या संबंध में दर्द', meno_s_urine: 'पेशाब की जल्दी या पेशाब निकल जाना', meno_s_palp: 'तेज़ धड़कन', meno_s_fog: 'भूलना, ध्यान न लगना', meno_s_desire: 'संबंध में कम रुचि', meno_s_head: 'सिरदर्द',
        meno_g_hot: 'गर्मी के झोंके', meno_g_sweats: 'रात का पसीना', meno_g_sleep: 'ख़राब नींद', meno_g_mood: 'चिड़चिड़ापन', meno_g_anxiety: 'घबराहट', meno_g_joints: 'जोड़ों का दर्द',
        meno_g_dryness: 'सूखापन', meno_g_urine: 'पेशाब', meno_g_palp: 'धड़कन', meno_g_fog: 'भूलना', meno_g_desire: 'कम रुचि', meno_g_head: 'सिरदर्द',
        meno_l0: 'नहीं', meno_l1: 'थोड़ा', meno_l2: 'मध्यम', meno_l3: 'बहुत', meno_lot: 'बहुत',
        meno_this_wk: 'यह हफ़्ता', meno_last_wk: 'पिछला हफ़्ता', meno_n_wk: '{n} हफ़्ते पहले',
        meno_save_wk: 'यह हफ़्ता सेव करें', meno_del_wk: 'इस हफ़्ते की entry हटाएँ', meno_del_q: '{w} की entry हटाएँ? undo नहीं होगा।', meno_saved: 'हफ़्ता सेव हो गया।', meno_deleted: 'Entry हट गई।',
        meno_count_row: 'मध्यम या बहुत', meno_logged4: 'दर्ज हफ़्ते: 4 में से {n}', meno_wk_of: '{m} में से {n} हफ़्ते',
        meno_noscore: 'आपकी अपनी entries की गिनती। कोई score नहीं, कोई diagnosis नहीं।',
        meno_sum_h: 'मेनोपॉज़ डायरी', meno_sum_weeks: 'हफ़्ते की entries: {n} ({a} से {b})', meno_sum_top: 'पिछले 4 हफ़्तों में सबसे ज़्यादा', meno_sum_lot: 'पिछले 4 हफ़्तों में “बहुत”',
        meno_night_h: 'गर्मी के झोंके और नींद', meno_night_l: 'एक ही दिन गर्मी के झोंके और ख़राब नींद: पिछले {n} दिनों में से {k} दिन',
        meno_home_h: 'मेनोपॉज़ डायरी: यह हफ़्ता', meno_home_p: '12 लक्षणों को अंक दें, लगभग एक मिनट'
      }
    },
    routes: { 'meno-timeline': renderTimeline, 'meno-score': renderScore, 'meno': renderHub, 'meno-diary': renderDiary, 'meno-hrt': renderHRT, 'meno-bones': renderBones, 'meno-intimate': renderIntimate, 'meno-surgical': renderSurgical },
    open: ['meno-timeline', 'meno-score', 'meno', 'meno-diary', 'meno-hrt', 'meno-bones', 'meno-intimate', 'meno-surgical'],
    tiles: [
      { section: 'meno', route: 'meno', title: 'meno_hub_t', sub: 'meno_hub_s', icon: 'leaf', order: 5, gated: false, keywords: 'menopause perimenopause hot flush flashes night sweats symptoms age 46 contraception मेनोपॉज़ रजोनिवृत्ति माहवारी बंद गर्मी पसीना' },
      { section: 'meno', route: 'meno-score', title: 'meno_sc_h', sub: 'meno_sc_s', icon: 'check', order: 8, gated: true, keywords: 'perimenopause score menopause rating scale mrs test quiz how bad symptoms severity hot flushes पेरिमेनोपॉज़ स्कोर मेनोपॉज़ लक्षण' },
      { section: 'meno', route: 'meno-diary', title: 'meno_diary', sub: 'meno_diary_s', icon: 'chart', order: 12, gated: true, keywords: 'menopause diary tracker symptoms weekly log hot flushes sleep mood डायरी लक्षण' },
      { section: 'meno', route: 'meno-hrt', title: 'meno_hrt', sub: 'meno_hrt_s', icon: 'pill', order: 20, gated: false, keywords: 'hrt mht hormone replacement therapy oestrogen estrogen patch gel risks breast cancer clots हॉर्मोन' },
      { section: 'meno', route: 'meno-bones', title: 'meno_bones', sub: 'meno_bones_s', icon: 'heart', order: 30, gated: false, keywords: 'bones osteoporosis calcium vitamin d ragi dexa bone density falls heart bp sugar cholesterol waist हड्डी कैल्शियम दिल' },
      { section: 'meno', route: 'meno-intimate', title: 'meno_intimate', sub: 'meno_intimate_s', icon: 'flower', order: 40, gated: false, keywords: 'vaginal dryness gsm sex pain lubricant moisturiser urine leaking uti bleeding after menopause सूखापन पेशाब' },
      { section: 'meno', route: 'meno-surgical', title: 'meno_surgical', sub: 'meno_surgical_s', icon: MED_SVG, order: 50, gated: false, keywords: 'surgical menopause ovaries removed oophorectomy hysterectomy hrt ऑपरेशन अंडाशय बच्चेदानी' }
    ],
    css: [
      '.meno-self { align-self: flex-start; }',
      '.meno-pill { flex-shrink: 0; }',
      '.meno-fi { flex-shrink: 0; display: inline-flex; margin-top: 1px; }',
      '.meno-fi svg { width: 18px; height: 18px; }',
      '.meno-ft { min-width: 0; overflow-wrap: anywhere; }',
      '.meno-stat { flex-direction: row; align-items: center; gap: 14px; }',
      '.meno-stat b { font-family: var(--font-display); font-size: 52px; line-height: 1; color: var(--accent); font-weight: 600; flex-shrink: 0; }',
      'body.hi .meno-stat b { font-family: var(--font-hi); font-size: 44px; }',
      '.meno-stat .small { min-width: 0; color: var(--text); font-size: 13px; }',
      '.meno-q { font-size: 13px; font-weight: 600; color: var(--fg); }',
      '.meno-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 12px; color: var(--muted); }',
      '.meno-legend span { display: inline-flex; align-items: center; gap: 6px; }',
      '.meno-sw { width: 20px; height: 20px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 11px; font-weight: 600; flex-shrink: 0; }',
      '.meno-l0 { background: var(--card-2); color: var(--muted); box-shadow: inset 0 0 0 1px var(--line); }',
      '.meno-l1 { background: var(--accent-soft); color: var(--fg); }',
      /* Level 2 is a mix of accent and card so the shades stay in order (light to strong) in both light and dark mode. */
      '.meno-l2 { background: var(--accent-2); background: color-mix(in srgb, var(--accent) 58%, var(--card)); color: var(--fg); }',
      '.meno-l3 { background: var(--accent-strong); color: #FFFFFF; }',
      '.meno-rows { display: flex; flex-direction: column; }',
      '.meno-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }',
      '.meno-row:last-child { border-bottom: none; }',
      '.meno-lbl { flex: 1; min-width: 0; font-size: 14px; color: var(--fg); font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }',
      '.meno-seg { display: grid; grid-template-columns: repeat(4, 40px); gap: 4px; flex-shrink: 0; }',
      '.meno-b { height: 40px; min-width: 0; border-radius: 10px; border: 1.5px solid var(--line); background: var(--card); color: var(--fg); font-weight: 600; font-size: 14px; padding: 0; font-variant-numeric: tabular-nums; }',
      '.meno-b.on[data-lv="0"] { background: var(--card-2); border: 2px solid var(--fg); }',
      '.meno-b.on[data-lv="1"] { background: var(--accent-soft); border: 2px solid var(--accent); }',
      '.meno-b.on[data-lv="2"] { background: var(--accent-2); background: color-mix(in srgb, var(--accent) 58%, var(--card)); border-color: transparent; color: var(--fg); }',
      '.meno-b.on[data-lv="3"] { background: var(--accent-strong); border-color: transparent; color: #FFFFFF; }',
      '.meno-confirm { gap: 8px; padding: 12px; }',
      '.meno-gridwrap { max-width: 100%; }',
      '.meno-grid { display: grid; gap: 3px; align-items: center; }',
      '.meno-grid .gl { font-size: 11px; color: var(--fg); min-width: 0; overflow-wrap: anywhere; line-height: 1.2; padding-right: 4px; }',
      '.meno-grid .gx { color: var(--muted); }',
      '.meno-grid .gsum { color: var(--muted); font-weight: 600; padding-top: 4px; }',
      '.meno-grid .gh { font-size: 13px; line-height: 1.1; color: var(--muted); text-align: center; white-space: nowrap; display: flex; flex-direction: column; align-items: center; overflow: visible; }',
      '.meno-grid .gh small { font-size: 12px; }',
      '.meno-grid .gc { height: 22px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px; }',
      '.meno-grid .gn { font-size: 12px; color: var(--fg); font-weight: 600; text-align: center; padding-top: 4px; }',
      '.meno-spark { height: 100px; }',
      '.meno-tbl th[scope=row] { color: var(--fg); font-size: 13px; }',
      '.meno-lab { color: var(--fg); }',
      '.meno-spark text { font-size: 13px; }',
      '.msc-q { gap: 6px; }', '.msc-q p { margin: 0; color: var(--fg); }', '.msc-q .small { color: var(--muted); }', '.msc-left { text-align: center; }',
      '.msc-res { gap: 10px; }', '.msc-res h3 { margin: 4px 0 0; }',
      '.msc-big { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 10px; }',
      '.msc-big b { font-family: var(--font-display); font-size: 52px; line-height: 1; color: var(--accent-strong); font-weight: 600; }',
      'body.hi .msc-big b { font-family: var(--font-hi); font-size: 44px; }',
      '.msc-big > span:not(.pill) { color: var(--muted); font-size: 14px; }',
      '.msc-bar { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px; margin: 6px 0 0; }',
      '.msc-bar i { height: 10px; border-radius: 5px; position: relative; font-style: normal; }',
      '.msc-rng { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px; margin: 2px 0 6px; }', '.msc-rng span { text-align: center; font-size: 11px; color: var(--muted); }',
      '.msc-s0 { background: var(--card-2); box-shadow: inset 0 0 0 1px var(--line); }', '.msc-s1 { background: var(--accent-soft); }',
      '.msc-s2 { background: var(--accent-2); background: color-mix(in srgb, var(--accent) 50%, var(--card)); }', '.msc-s3 { background: var(--accent-strong); }',
      '.msc-mark { position: absolute; top: -4px; width: 4px; height: 18px; margin-left: -2px; border-radius: 2px; background: var(--fg); box-shadow: 0 0 0 2px var(--card); }',
      '.msc-subs { display: grid; gap: 10px; }', '.msc-sub, .msc-hi { display: flex; align-items: center; gap: 10px; }', '.msc-his { display: grid; }', '.msc-hi { padding: 10px 0; border-bottom: 1px solid var(--line); }', '.msc-hi:last-child { border-bottom: none; }', '.msc-hi strong { color: var(--fg); font-size: 14px; }',
      '.msc-sub .body, .msc-hi .body { flex: 1; min-width: 0; display: flex; flex-direction: column; }', '.msc-sub strong { color: var(--fg); font-size: 14px; }',
      '.msc-sub .small, .msc-hi .small { color: var(--muted); }', '.msc-n { font-weight: 600; color: var(--fg); white-space: nowrap; font-variant-numeric: tabular-nums; }',
      '.pill.msc-p0 { background: var(--ok-soft); color: var(--ok); border-color: transparent; }', '.pill.msc-p1 { background: var(--accent-soft); color: var(--fg); border-color: transparent; }',
      '.pill.msc-p2 { background: var(--accent-2); background: color-mix(in srgb, var(--accent) 30%, var(--card)); color: var(--fg); border-color: transparent; }',
      '.pill.msc-p3 { background: var(--accent-strong); color: #FFFFFF; border-color: transparent; }', '.msc-not { color: var(--muted); }'
    ].join('\n'),
    home: home,
    /* Home's setup card (Version 30): in midlife, the weekly symptom diary */
    setup: () => (S.canSave() && S.stageNow() === 'meno' && !(S.plan && S.plan.meno && S.plan.meno.on()) ? {   /* Version 39.51: not while the midlife plan runs (its weekly number is in her check-in) */ id: 'meno-diary', order: 20, title: t('meno_setup'), sub: t('meno_diary_s'), go: 'meno-diary', done: Object.keys(peekDiary()).length > 0 } : null),
    summary: summary,
    sample: sample,
    afterRender: (v, route) => { if (route !== 'meno-diary') { mem.week = null; mem.draft = null; mem.confirm = false; } }
  });
})(window.Saathi);
