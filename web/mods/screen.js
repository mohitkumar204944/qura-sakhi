/* Screening and check-ups: my check-up list with next dates and reminders, cervical screening (VIA), the HPV vaccine, breast self-check and warning signs worth a check. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx, I = S.I;
  const D = () => S.data('screen');
  const E = (o) => esc(tx(o));
  const L = (en, hi) => ({ en: en, hi: hi });
  const iso = (d) => S.toISO(d);
  const okDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const addMonths = S.addMonths;   /* kept inside the month: 31 Aug + 6 months = 28 Feb */
  const fmt = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtM = (d) => S.fmtD(d, { month: 'short', year: 'numeric' });
  const fmtS = (d) => S.fmtD(d, { weekday: 'short', day: 'numeric', month: 'short' });
  const chev = '<span class="screen-chev">' + I.chev + '</span>';
  const SYRINGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2l4 4M20 4l-4 4"/><path d="M16 8L7.5 16.5 4 20"/><path d="M13.5 4.5l6 6M11.5 6.5l-6.8 6.8a1.4 1.4 0 000 2l3.9 3.9a1.4 1.4 0 002 0l6.8-6.8"/><path d="M9 11l2 2M7 13l2 2"/></svg>';

  /* Screen state that is never saved. */
  const mem = { sheetEvery: null };

  /* ---------- sources (each one opened and checked) ---------- */
  const SRC = {
    ncd: { url: 'https://aam.mohfw.gov.in/download/document/829bf86e304132dfae9962855c57dcd8.pdf', en: 'MoHFW, training module on population-based screening of common NCDs', hi: 'स्वास्थ्य मंत्रालय, आम NCD की जाँच पर प्रशिक्षण पुस्तिका' },
    aam: { url: 'https://aam.mohfw.gov.in/', en: 'Ayushman Arogya Mandir, MoHFW', hi: 'आयुष्मान आरोग्य मंदिर, स्वास्थ्य मंत्रालय' },
    pib: { url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/feb/doc2026228807201.pdf', en: 'PIB, cervical cancer vaccination campaign, 28 Feb 2026', hi: 'PIB, सर्वाइकल कैंसर टीकाकरण अभियान, 28 फ़रवरी 2026' },
    who: { url: 'https://www.who.int/news-room/fact-sheets/detail/cervical-cancer', en: 'WHO, cervical cancer fact sheet', hi: 'WHO, सर्वाइकल कैंसर fact sheet' },
    sii: { url: 'https://www.seruminstitute.com/product_ind_cervavac.php', en: 'Serum Institute of India, Cervavac', hi: 'Serum Institute of India, Cervavac' },
    uwin: { url: 'https://uwin.mohfw.gov.in/', en: 'U-WIN vaccination portal', hi: 'U-WIN टीकाकरण portal' },
    nhsbr: { url: 'https://www.nhs.uk/conditions/breast-cancer/symptoms/', en: 'NHS, breast cancer symptoms', hi: 'NHS, breast cancer के लक्षण' },
    nhsov: { url: 'https://www.nhs.uk/conditions/ovarian-cancer/symptoms/', en: 'NHS, ovarian cancer symptoms', hi: 'NHS, अंडाशय के कैंसर के लक्षण' },
    nhswo: { url: 'https://www.nhs.uk/conditions/womb-cancer/symptoms/', en: 'NHS, womb cancer symptoms', hi: 'NHS, बच्चेदानी के कैंसर के लक्षण' },
    nhsmo: { url: 'https://www.nhs.uk/conditions/mouth-cancer/symptoms/', en: 'NHS, mouth cancer symptoms', hi: 'NHS, मुँह के कैंसर के लक्षण' },
    bone: { url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening', en: 'USPSTF, osteoporosis screening, 2025', hi: 'USPSTF, हड्डियों की जाँच, 2025' },
    cochbse: { url: 'https://www.cochrane.org/CD003373/BREASTCA_regular-self-examination-or-clinical-examination-for-early-detection-of-breast-cancer', en: 'Cochrane review, breast self-examination', hi: 'Cochrane review, स्तन की ख़ुद जाँच' },
    mumbai: { url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7903383/', en: 'Mittra et al., Mumbai breast exam trial, BMJ 2021', hi: 'Mittra et al., मुंबई स्तन जाँच अध्ययन, BMJ 2021' },
    mammo: { url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening', en: 'USPSTF, breast cancer screening, 2024', hi: 'USPSTF, breast cancer की जाँच, 2024' },
    quit: { url: 'https://www.who.int/india/news/detail/08-10-2021-tobacco-kills-dial-1800-11-2356-to-quit!', en: 'WHO India, National Tobacco Quitline', hi: 'WHO India, राष्ट्रीय तंबाकू Quitline' }
  };

  /* ---------- the check-ups ----------
     months: a fixed repeat interval from India's national NCD programme (verified). 0 = no national interval; she picks
     what her doctor told her. elig(age, situation) -> 'now' | 'later' | 'ask'. */
  const UNDER = (a, lo) => a != null && a < lo;
  const ITEMS = [
    { k: 'cervix', icon: 'check', months: 60, go: 'screen-cervix', from: 30,
      name: L('Cervical screening', 'बच्चेदानी के मुँह की जाँच'),
      how: L('VIA, HPV or Pap test. Once in 5 years from 30 to 65. VIA is free at your Ayushman Arogya Mandir or PHC.', 'VIA, HPV या Pap test। 30 से 65 साल तक, 5 साल में एक बार। VIA आयुष्मान आरोग्य मंदिर या PHC पर मुफ़्त।'),
      elig: (a) => (UNDER(a, 30) ? 'later' : (a != null && a > 65 ? 'ask' : 'now')) },
    { k: 'cbe', icon: 'ribbon', months: 60, go: 'screen-breast', from: 30,
      name: L('Breast exam by a health worker', 'स्वास्थ्यकर्मी से स्तन की जाँच'),
      how: L('A trained nurse or ANM checks both breasts and armpits by hand. Once in 5 years from 30 to 65. Free.', 'प्रशिक्षित नर्स या ANM हाथ से दोनों स्तन और बगल जाँचती हैं। 30 से 65 साल तक, 5 साल में एक बार। मुफ़्त।'),
      elig: (a) => (UNDER(a, 30) ? 'later' : (a != null && a > 65 ? 'ask' : 'now')) },
    { k: 'oral', icon: 'search', months: 60, go: 'screen-signs', from: 30,
      name: L('Mouth check', 'मुँह की जाँच'),
      how: L('A quick look inside your mouth. Once in 5 years from 30 to 65; most important if you use tobacco, gutkha or paan. Free.', 'मुँह के अंदर एक नज़र। 30 से 65 साल तक, 5 साल में एक बार; तंबाकू, गुटखा या पान खाती हैं तो सबसे ज़रूरी। मुफ़्त।'),
      elig: (a) => (UNDER(a, 30) ? 'later' : (a != null && a > 65 ? 'ask' : 'now')) },
    { k: 'bp', icon: 'heart', months: 12, from: 30,
      name: L('BP check', 'BP की जाँच'),
      how: L('Once a year from 30. Free at your Ayushman Arogya Mandir; your ASHA can tell you the screening day.', '30 साल से हर साल एक बार। आयुष्मान आरोग्य मंदिर पर मुफ़्त; ASHA आपको जाँच का दिन बता सकती है।'),
      elig: (a) => (UNDER(a, 30) ? 'later' : 'now') },
    { k: 'sugar', icon: 'drop', months: 12, from: 30,
      name: L('Sugar check', 'शुगर की जाँच'),
      how: L('Blood glucose from a finger prick. Once a year from 30. Free.', 'उँगली से एक बूँद खून ले कर ग्लूकोज़ की जाँच। 30 साल से हर साल एक बार। मुफ़्त।'),
      elig: (a) => (UNDER(a, 30) ? 'later' : 'now') },
    { k: 'hb', icon: 'drop', months: 0, go: 'cond-anaemia', when: L('If tired, or periods are heavy', 'थकान हो या पीरियड भारी हों'),
      name: L('Hb (haemoglobin) test', 'Hb (हीमोग्लोबिन) जाँच'),
      how: L('Get one if you feel tired or breathless, have heavy periods, or plan a pregnancy. Free at a PHC or government hospital.', 'थकान या साँस फूलना हो, पीरियड भारी हों, या गर्भ की योजना हो तो करवाएँ। PHC या सरकारी अस्पताल में मुफ़्त।'),
      elig: () => 'now' },
    { k: 'thyroid', icon: 'leaf', months: 0, go: 'cond-labs', when: L('Only if a doctor suggests it', 'सिर्फ़ डॉक्टर कहें तो'), later: L('Only if a doctor suggests it', 'सिर्फ़ डॉक्टर कहें तो'),
      name: L('Thyroid test (TSH)', 'थायरॉइड जाँच (TSH)'),
      how: L('Not a yearly test for everyone. A doctor orders it for signs like tiredness with weight gain, feeling cold, hair fall, periods changing, or trouble getting pregnant.', 'हर किसी के लिए हर साल की जाँच नहीं। डॉक्टर इसे तब लिखती हैं जब थकान के साथ वज़न बढ़े, ठंड ज़्यादा लगे, बाल झड़ें, पीरियड बदलें, या गर्भ ठहरने में दिक़्क़त हो।'),
      elig: (a, s) => (s.thyroid ? 'now' : 'later') },
    { k: 'bone', icon: 'person', months: 0, go: 'meno-bones', when: L('Your doctor decides how often', 'कितनी बार, डॉक्टर तय करती हैं'), later: L('From 65, or after menopause with a risk', '65 से, या menopause के बाद कोई ख़तरा हो तो'),
      name: L('Bone density scan (DEXA)', 'हड्डियों की मज़बूती का scan (DEXA)'),
      how: L('From 65, or earlier after menopause if you have a risk: early menopause, a broken bone from a small fall, long use of steroid tablets, very low weight, smoking, or a parent who broke a hip. Your doctor decides when to repeat it.', '65 साल से, या menopause के बाद पहले भी, अगर कोई ख़तरा हो: जल्दी menopause, हल्का गिरने से हड्डी टूटना, लंबे समय तक steroid की गोलियाँ, बहुत कम वज़न, धूम्रपान, या माता-पिता में से किसी की कूल्हे की हड्डी टूटी हो। दोबारा कब करवाना है, यह डॉक्टर तय करती हैं।'),
      elig: (a, s) => ((a != null && a >= 65) || s.stopped ? 'now' : 'later') },
    { k: 'mammo', icon: 'ribbon', months: 0, go: 'screen-breast', from: 40, when: L('Ask a doctor whether it suits you', 'डॉक्टर से पूछें कि आपके लिए ठीक है या नहीं'),
      name: L('Mammogram: talk to a doctor', 'मैमोग्राम: डॉक्टर से बात करें'),
      how: L('From 40, or sooner if your mother, sister or daughter had breast or ovarian cancer, ask a doctor whether a mammogram suits you. India\'s free programme uses the breast exam by a health worker instead.', '40 साल से, या पहले भी अगर माँ, बहन या बेटी को breast या अंडाशय का कैंसर हुआ हो, डॉक्टर से पूछें कि मैमोग्राम आपके लिए ठीक है या नहीं। भारत का मुफ़्त कार्यक्रम इसकी जगह स्वास्थ्यकर्मी से स्तन की जाँच करता है।'),
      elig: (a) => (a != null && a >= 40 ? 'now' : 'later') },
    { k: 'eyes', icon: 'sparkle', months: 0, from: 40, when: L('Yearly if you have diabetes', 'Diabetes हो तो हर साल'),
      name: L('Eye check', 'आँखों की जाँच'),
      how: L('From 40, or sooner if your sight changes. With diabetes, the back of the eye (retina) needs a check once a year, even if you see well.', '40 साल से, या नज़र बदले तो पहले। Diabetes हो तो आँख के पर्दे (retina) की जाँच हर साल, चाहे नज़र ठीक लगे।'),
      elig: (a) => (a != null && a >= 40 ? 'now' : 'later') },
    { k: 'teeth', icon: 'heart', months: 0, when: L('As often as your dentist advises', 'जितनी बार dentist कहें'),
      name: L('Teeth and gums check', 'दाँत और मसूड़ों की जाँच'),
      how: L('Your dentist tells you how often. Go sooner for bleeding gums, a loose tooth, or a mouth sore that has not healed in 3 weeks.', 'कितनी बार, यह dentist बताते हैं। मसूड़ों से खून, हिलता दाँत, या मुँह का छाला जो 3 हफ़्ते में ठीक न हो, तो पहले जाएँ।'),
      elig: () => 'now' }
  ];
  const BY = {}; ITEMS.forEach((x) => { BY[x.k] = x; });
  const REPEAT = [[6, 'screen_m6'], [12, 'screen_y1'], [24, 'screen_y2'], [36, 'screen_y3'], [60, 'screen_y5']];

  /* ---------- status and reminders ---------- */
  const ageNow = () => S.cycle.ageYears();
  const sitNow = () => S.state.situation || {};
  function status(it) {
    const d = D(); const rec = (d.last || {})[it.k]; const age = ageNow(); const td = S.today();
    const months = it.months || Number((d.every || {})[it.k]) || 0;
    const elig = it.elig(age, sitNow());
    let next = null, code = 'add';
    if (okDate(rec)) {
      if (months) { next = addMonths(S.fromISO(rec), months); code = next <= td ? 'due' : (S.diffDays(td, next) <= 60 ? 'soon' : 'ok'); }
      else code = 'doc';
    } else if (rec === 'never') code = it.months && elig === 'now' ? 'due' : 'notyet';
    if (elig === 'ask') code = 'ask';   /* after 65 these screens are the doctor's call (MoHFW NCD module), even with a date saved */
    return { rec: rec, months: months, next: next, code: code, elig: elig };
  }
  const PILL = { due: ['accent', 'screen_st_due'], soon: ['', 'screen_st_soon'], ok: ['ok', 'screen_st_ok'], add: ['muted', 'screen_st_add'], doc: ['muted', 'screen_st_doc'], notyet: ['muted', 'screen_st_notyet'], ask: ['muted', 'screen_st_doc'] };
  const remTitle = (it) => L('Check-up due: ' + it.name.en, 'जाँच का समय: ' + it.name.hi);
  function syncItem(k) {
    const it = BY[k]; const id = 'screen-' + k; const d = D();
    if (!it || !S.canSave() || (d.rem || {})[k] === false) { S.reminders.remove(id); return; }
    const st = status(it); const td = S.today();
    const base = { id: id, mod: 'screen', title: remTitle(it), kind: 'checkup', time: '10:00', weekdays: null };
    if (st.code === 'ask' || st.code === 'doc' || !st.months) { S.reminders.remove(id); return; }
    if (st.next && st.next > td) S.reminders.upsert(Object.assign(base, { dates: null, start: iso(st.next), every: 30 }));
    else if (st.code === 'due') S.reminders.upsert(Object.assign(base, { dates: null, start: iso(S.addDays(td, 7)), every: 30 }));
    else S.reminders.remove(id);
  }
  const BSE_T = L('Breast self-check this week', 'इस हफ़्ते स्तन की ख़ुद जाँच');
  const avgGap = () => { const g = S.cycle.usable().slice(-6); return g.length ? Math.round(g.reduce((a, b) => a + b, 0) / g.length) : 28; };
  const bseDefaultMode = () => { const s = sitNow(); return S.cycle.lastStart() && !S.cycle.countsOff() && !s.stopped && !s.hysterectomy ? 'period' : 'date'; };
  function bseSync() {
    const b = D().bse || {}; S.reminders.remove('screen-bse');
    if (!b.on || !S.canSave()) return;
    const base = { id: 'screen-bse', mod: 'screen', title: BSE_T, kind: 'checkup', time: '09:00', weekdays: null };
    const ls = S.cycle.lastStart();
    if (b.mode === 'period' && ls) S.reminders.upsert(Object.assign(base, { dates: null, start: iso(S.addDays(ls, 7)), every: S.clamp(avgGap(), 21, 45) }));
    else {
      const day = S.clamp(Number(b.day) || 1, 1, 28); const td = S.today(); const dates = [];
      for (let i = 0; i <= 24; i++) { const x = new Date(td.getFullYear(), td.getMonth() + i, day); if (x >= td) dates.push(iso(x)); }
      S.reminders.upsert(Object.assign(base, { dates: dates, start: null, every: null }));
    }
  }

  /* ---------- small markup helpers ---------- */
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ol>';
  const srcList = (keys) => '<details><summary>' + esc(t('screen_sources')) + '</summary><p class="sources">' + keys.map((k) => '<a href="' + esc(SRC[k].url) + '" target="_blank" rel="noopener">' + E(SRC[k]) + '</a>').join(' · ') + '</p></details>';
  const linkItem = (go, ico, title, sub, pill, gated) => '<button type="button" class="item" data-go="' + go + '"><span class="ico-sm">' + S.icon(ico) + '</span><span class="body"><strong>' + esc(title) + '</strong><span>' + esc(sub) + '</span>' + (pill ? '<span class="screen-new">' + esc(pill) + '</span>' : '') + (gated && S.flags.proto ? '<span class="screen-gate">' + esc(t('gated_short')) + '</span>' : '') + '</span>' + chev + '</button>';
  const quraBtn = (topic) => '<button type="button" class="btn block" data-ask="' + esc(topic) + '">' + esc(t('ask_qura')) + '</button>';
  const quraCard = (topic) => '<div class="card dark"><h3>' + esc(t('screen_qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(t('screen_qura_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(topic) + '">' + esc(t('qura_b')) + '</button></div>';
  const copyRow = (n, what) => '<div class="helpline"><div style="min-width:0"><div class="n num">' + esc(n) + '</div><div class="what">' + esc(what) + '</div></div><button type="button" class="btn sm" data-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>';
  function wireCopy(v) {
    v.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => { const n = b.dataset.copy; const done = () => S.toast(t('copied') + ' ' + n); try { navigator.clipboard.writeText(n).then(done, () => S.toast(n)); } catch (er) { S.toast(n); } }));
  }
  const freeCard = () => '<div class="card soft"><h3>' + esc(t('screen_free_h')) + '</h3><dl class="kv screen-kv">' +
    '<dt>' + esc(t('screen_free_30')) + '</dt><dd>' + esc(t('screen_yearly')) + '</dd>' +
    '<dt>' + esc(t('screen_free_cx')) + '</dt><dd>' + esc(t('screen_5y')) + '</dd></dl>' +
    '<p class="small">' + esc(t('screen_free_how')) + '</p></div>';

  /* ---------- hub ---------- */
  function mineSummary() {
    if (!S.canSave()) return t('screen_mine_s');
    const now = ITEMS.filter((it) => { const st = status(it); return st.elig !== 'later' || okDate(st.rec); });
    const due = now.filter((it) => status(it).code === 'due');
    const any = ITEMS.some((it) => (D().last || {})[it.k]);
    if (due.length) return tf('screen_due_n', { n: due.length }) + ': ' + due.map((it) => tx(it.name)).join(', ');
    return any ? t('screen_all_ok') : t('screen_add_dates');
  }
  function renderHub(v) {
    const due = S.canSave() && ITEMS.some((it) => status(it).code === 'due');
    v.innerHTML = S.backRow(t('screen_hub'), 'care', false) + '<p class="small">' + esc(t('screen_hub_p')) + '</p>' +
      '<button type="button" class="action" data-go="screen-mine"><span class="ico' + (due ? ' accent' : '') + '">' + I.bell + '</span><span class="body"><strong>' + esc(t('screen_mine')) + '</strong><span class="small">' + esc(mineSummary()) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' +
      '<div class="list">' +
      linkItem('screen-cervix', 'check', t('screen_cervix'), t('screen_cervix_s')) +
      linkItem('screen-hpv', SYRINGE, t('screen_hpv'), t('screen_hpv_s'), t('screen_hpv_new')) +
      linkItem('screen-breast', 'ribbon', t('screen_breast'), t('screen_breast_s')) +
      linkItem('screen-signs', 'help', t('screen_signs'), t('screen_signs_s'), '', true) +
      '</div>' + freeCard() +
      quraCard(t('screen_hub')) + srcList(['ncd', 'aam', 'pib']);
    S.wire(v);
  }

  /* ---------- my check-ups ---------- */
  function rowMeta(it, st) {
    if (okDate(st.rec)) return t('screen_last_l') + ': ' + fmt(S.fromISO(st.rec)) + (st.next ? ' · ' + t('screen_next_l') + ': ' + fmtM(st.next) : '');
    if (st.rec === 'never') return t('screen_never');
    if (st.code === 'ask') return t('screen_after65');
    if (it.months) return (it.months === 12 ? t('screen_yearly') : t('screen_5y')) + ' · ' + t('screen_free_w');
    return it.when ? tx(it.when) : t('screen_tap_add');
  }
  function row(it, later) {
    const st = status(it); const p = PILL[st.code] || PILL.add; const isLater = later && !okDate(st.rec);
    const lbl = isLater ? t(it.k === 'thyroid' ? 'screen_st_ifneeded' : 'screen_st_later') : t(p[1]);
    const meta = isLater ? (it.later ? tx(it.later) : tf('screen_from_age', { n: it.from })) : rowMeta(it, st);
    return '<button type="button" class="screen-row" data-upd="' + it.k + '"><span class="ico-sm">' + S.icon(it.icon) + '</span><span class="body"><strong>' + E(it.name) + '</strong><span class="meta">' + esc(meta) + '</span></span><span class="pill ' + (isLater ? 'muted' : p[0]) + '">' + esc(lbl) + '</span></button>';
  }
  const ORDER = { due: 0, ask: 1, add: 2, soon: 3, notyet: 4, doc: 5, ok: 6 };
  function renderMine(v) {
    const age = ageNow(); const sit = sitNow();
    if (!S.canSave()) {
      v.innerHTML = S.backRow(t('screen_mine'), 'screen', false) + '<p class="small">' + esc(t('screen_mine_p')) + '</p>' +
        '<div class="card"><h3>' + esc(t('screen_by_age')) + '</h3><dl class="kv screen-kv">' +
        [['screen_age_any', 'screen_age_any_d'], ['screen_free_30', 'screen_yearly'], ['screen_free_cx', 'screen_5y'], ['screen_age_40', 'screen_age_40_d'], ['screen_age_65', 'screen_age_65_d']].map((x) => '<dt>' + esc(t(x[0])) + '</dt><dd>' + esc(t(x[1])) + '</dd>').join('') + '</dl></div>' +
        S.needDiary() + '<div class="list">' + linkItem('screen-cervix', 'check', t('screen_cervix'), t('screen_cervix_s')) + linkItem('screen-breast', 'ribbon', t('screen_breast'), t('screen_breast_s')) + '</div>' +
        '<p class="footnote">' + esc(t('screen_not_rx')) + '</p>';
      S.wire(v); return;
    }
    const d = D();
    const main = [], later = [];
    ITEMS.forEach((it) => { const st = status(it); if (st.elig !== 'later' || okDate(st.rec) || st.rec === 'never') main.push(it); else later.push(it); });
    main.sort((a, b) => { const sa = status(a), sb = status(b); const o = ORDER[sa.code] - ORDER[sb.code]; if (o) return o; return (sa.next ? sa.next.getTime() : 0) - (sb.next ? sb.next.getTime() : 0); });
    const notes = [];
    if (sit.pregnant) notes.push(t('screen_preg_note'));
    if (sit.hysterectomy) notes.push(t('screen_hyst_note'));
    if (age != null && age < 30) notes.push(t('screen_under30'));
    const dueList = main.filter((it) => status(it).code === 'due'); const nDue = dueList.length; const any = ITEMS.some((it) => (d.last || {})[it.k]);
    const upNext = main.map((it) => ({ it: it, st: status(it) })).filter((x) => x.st.next && x.st.code !== 'due').sort((a, b) => a.st.next - b.st.next)[0];
    const subLine = nDue ? dueList.map((it) => tx(it.name)).join(', ') : (upNext ? t('screen_next_l') + ': ' + tx(upNext.it.name) + ' · ' + fmtM(upNext.st.next) : t('screen_sum_hint'));
    v.innerHTML = S.backRow(t('screen_mine'), 'screen', false) + '<p class="small">' + esc(t('screen_mine_p')) + '</p>' +
      '<div class="card soft screen-sum"><div class="eyebrow">' + esc(age != null ? tf('screen_for_age', { n: age }) : t('screen_mine')) + '</div><h2' + (nDue ? ' style="color:var(--accent)"' : '') + '>' + esc(nDue ? tf('screen_due_n', { n: nDue }) : (any ? t('screen_all_ok') : t('screen_add_dates'))) + '</h2><p class="small" style="color:var(--fg)">' + esc(subLine) + '</p>' +
      (notes.length ? notes.map((n) => '<p class="small">' + esc(n) + '</p>').join('') : '') + '</div>' +
      '<div class="list">' + main.map((it) => row(it, false)).join('') + '</div>' +
      (later.length ? '<details class="screen-later"' + (main.length < 4 ? ' open' : '') + '><summary>' + esc(t('screen_group_later')) + ' (' + later.length + ')</summary><div class="list" style="margin-top:8px">' + later.map((it) => row(it, true)).join('') + '</div></details>' : '') +
      '<p class="note">' + esc(t('screen_rem_note')) + '</p>' +
      '<div class="grid2"><button type="button" class="btn sm" data-go="tools-reminders">' + esc(t('screen_all_rem')) + '</button><button type="button" class="btn sm" data-go="screen-signs">' + esc(t('screen_signs_short')) + '</button></div>' +
      freeCard() + quraBtn(t('screen_mine')) +
      '<p class="footnote">' + esc(t('screen_not_rx')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-upd]').forEach((b) => b.addEventListener('click', () => openSheet(b.dataset.upd)));
  }
  function openSheet(k) {
    const it = BY[k]; if (!it) return; const d = D(); const st = status(it);
    mem.sheetEvery = it.months ? null : (Number((d.every || {})[k]) || 0);
    const remOn = (d.rem || {})[k] !== false;
    const everyChips = () => '<div class="chips" id="sc-every">' + REPEAT.map((x) => '<button type="button" class="chip' + (mem.sheetEvery === x[0] ? ' on' : '') + '" data-every="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '<button type="button" class="chip' + (!mem.sheetEvery ? ' on' : '') + '" data-every="0">' + esc(t('screen_rep_ask')) + '</button></div>';
    const html = '<h2>' + E(it.name) + '</h2><p class="small">' + E(it.how) + '</p>' +
      '<label for="sc-date">' + esc(t('screen_last_done')) + '</label><input type="date" id="sc-date" max="' + iso(S.today()) + '" value="' + esc(okDate(st.rec) ? st.rec : '') + '">' +
      (it.months ? '<p class="small">' + esc(tf('screen_every_fixed', { n: it.months === 12 ? t('screen_y1') : t('screen_y5') })) + '</p>' : '<label>' + esc(t('screen_repeat')) + '</label>' + everyChips() + '<p class="small">' + esc(t('screen_repeat_p')) + '</p>') +
      '<div class="checklist"><label class="' + (remOn ? 'done' : '') + '"><input type="checkbox" id="sc-rem"' + (remOn ? ' checked' : '') + '> ' + esc(t('screen_rem_on')) + '</label></div>' +
      '<div class="grid2"><button type="button" class="btn primary" id="sc-save">' + esc(t('save')) + '</button><button type="button" class="btn" id="sc-never">' + esc(t('screen_never_b')) + '</button></div>' +
      ((st.rec || it.go) ? '<div class="' + (st.rec && it.go ? 'grid2' : 'stack') + '">' +
        (st.rec ? '<button type="button" class="btn ghost sm" id="sc-clear">' + esc(t('screen_clear')) + '</button>' : '') +
        (it.go ? '<button type="button" class="btn ghost sm" data-sgo="' + it.go + '">' + esc(t('screen_read')) + '</button>' : '') + '</div>' : '') +
      '<p class="footnote">' + esc(t('screen_phone_only')) + ' ' + esc(t('screen_not_rx')) + '</p>';
    S.sheet(html, (sh) => {
      const commit = (msg) => { const dd = D(); dd.rem = dd.rem || {}; const rc = sh.querySelector('#sc-rem'); dd.rem[k] = rc ? rc.checked : true; if (!it.months) { dd.every = dd.every || {}; if (mem.sheetEvery) dd.every[k] = mem.sheetEvery; else delete dd.every[k]; } syncItem(k); S.save(); S.closeSheet(); S.toast(msg); S.render(); };
      sh.querySelectorAll('[data-every]').forEach((b) => b.addEventListener('click', () => { mem.sheetEvery = Number(b.dataset.every) || 0; sh.querySelectorAll('[data-every]').forEach((x) => x.classList.toggle('on', x === b)); }));
      const rc = sh.querySelector('#sc-rem'); if (rc) rc.addEventListener('change', () => { rc.parentElement.classList.toggle('done', rc.checked); });
      sh.querySelector('#sc-save').addEventListener('click', () => { const val = (sh.querySelector('#sc-date') || {}).value || ''; if (!okDate(val) || S.fromISO(val) > S.today()) { S.toast(t('screen_pick_date')); return; } const dd = D(); dd.last = dd.last || {}; dd.last[k] = val; commit(t('screen_saved')); });
      sh.querySelector('#sc-never').addEventListener('click', () => { const dd = D(); dd.last = dd.last || {}; dd.last[k] = 'never'; commit(t('screen_saved_never')); });
      const cl = sh.querySelector('#sc-clear'); if (cl) cl.addEventListener('click', () => { const dd = D(); if (dd.last) delete dd.last[k]; if (dd.every) delete dd.every[k]; S.reminders.remove('screen-' + k); S.save(); S.closeSheet(); S.toast(t('screen_cleared')); S.render(); });
      sh.querySelectorAll('[data-sgo]').forEach((b) => b.addEventListener('click', () => { S.closeSheet(); S.setHash(b.dataset.sgo); }));
    });
  }

  /* ---------- cervical screening ---------- */
  const CX = {
    why: L('Cervical cancer is the second most common cancer in Indian women. It is caused by a long-lasting infection with HPV, a very common virus. Changed cells usually take 15–20 years to become cancer, so a test every few years finds them early, when a simple treatment stops them.', 'भारत में महिलाओं में सर्वाइकल कैंसर (बच्चेदानी के मुँह का कैंसर) दूसरा सबसे आम कैंसर है। यह HPV नाम के बहुत आम virus के लंबे समय तक रहने से होता है। बदली हुई कोशिकाओं को कैंसर बनने में आम तौर पर 15–20 साल लगते हैं, इसलिए कुछ सालों में एक जाँच इन्हें जल्दी पकड़ लेती है, जब आसान इलाज इन्हें रोक देता है।'),
    steps: [
      L('You lie on a couch with your knees bent and apart. You can ask for a woman to do the test, and bring someone with you.', 'आप घुटने मोड़ कर और खोल कर बिस्तर पर लेटती हैं। आप कह सकती हैं कि जाँच कोई महिला करे, और किसी को साथ ला सकती हैं।'),
      L('A speculum, a smooth instrument, gently opens the vagina so the nurse can see the cervix, the mouth of the womb.', 'Speculum नाम का चिकना औज़ार धीरे से योनि को खोलता है, ताकि नर्स बच्चेदानी का मुँह (cervix) देख सकें।'),
      L('She dabs dilute vinegar (acetic acid) on the cervix with cotton and looks again after about a minute.', 'वे रुई से बच्चेदानी के मुँह पर हल्का सिरका (acetic acid) लगाती हैं और लगभग एक मिनट बाद फिर देखती हैं।'),
      L('It takes a few minutes and is usually not painful. You may feel some pressure.', 'कुछ ही मिनट लगते हैं और आम तौर पर दर्द नहीं होता। थोड़ा दबाव महसूस हो सकता है।'),
      L('You get the result the same day, before you leave.', 'नतीजा उसी दिन, जाने से पहले मिल जाता है।')
    ],
    neg: L('Normal (VIA negative): no white patch was seen. Your next test is due in 5 years.', 'सामान्य (VIA negative): कोई सफ़ेद धब्बा नहीं दिखा। अगली जाँच 5 साल बाद।'),
    pos: L('VIA positive: a white patch was seen. This does not mean cancer. You are referred to the CHC or district hospital for a closer look. Changed cells are often treated with a quick heat or cold treatment that stops them becoming cancer.', 'VIA positive: एक सफ़ेद धब्बा दिखा। इसका मतलब कैंसर नहीं है। आपको पास के CHC या ज़िला अस्पताल भेजा जाता है, जहाँ और ध्यान से देखा जाता है। बदली हुई कोशिकाओं का अक्सर गर्मी या ठंडक से जल्दी होने वाला इलाज होता है, जो उन्हें कैंसर बनने से रोकता है।'),
    hpv: L('HPV test: checks a sample from the cervix for the virus itself. It is not part of the free programme everywhere; ask a doctor or lab where you can get it.', 'HPV test: बच्चेदानी के मुँह से लिए नमूने में virus की जाँच। यह हर जगह मुफ़्त कार्यक्रम में नहीं है; कहाँ होती है, डॉक्टर या lab से पूछें।'),
    pap: L('Pap test: cells from the cervix are sent to a lab; the result takes a few days.', 'Pap test: बच्चेदानी के मुँह की कोशिकाएँ lab भेजी जाती हैं; नतीजा कुछ दिनों में आता है।'),
    other: L('Had an HPV or Pap test? Ask the doctor when your next one is due; it can be longer than 5 years after a normal HPV test.', 'HPV या Pap test करवाया है? डॉक्टर से पूछें कि अगला कब है; HPV test सामान्य आने पर यह 5 साल से ज़्यादा भी हो सकता है।'),
    sym: [
      L('Bleeding after sex', 'संबंध के बाद ब्लीडिंग'),
      L('Bleeding between periods', 'दो पीरियड के बीच ब्लीडिंग'),
      L('Any bleeding or spotting after menopause', 'menopause के बाद कोई भी ब्लीडिंग या स्पॉटिंग'),
      L('Smelly, watery or blood-stained discharge', 'बदबूदार, पानी जैसा या खून मिला स्राव'),
      L('Pain in the pelvis, back or during sex that does not go away', 'पेड़ू, कमर में या संबंध के समय दर्द जो ठीक न हो')
    ]
  };
  function renderCervix(v) {
    v.innerHTML = S.backRow(t('screen_cervix'), 'screen', false) + '<p class="small">' + esc(t('screen_cervix_p')) + '</p>' +
      '<div class="card"><h3>' + esc(t('screen_why')) + '</h3><p>' + E(CX.why) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('screen_who_often')) + '</h3><dl class="kv screen-kv wide">' +
      '<dt>' + esc(t('screen_cx_k1')) + '</dt><dd>' + esc(t('screen_5y')) + '</dd>' +
      '<dt>' + esc(t('screen_cx_k2')) + '</dt><dd>' + esc(t('screen_cx_v2')) + '</dd></dl>' +
      '<p class="small">' + esc(t('screen_cx_free')) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('screen_cx_what')) + '</h3>' + steps(CX.steps) + '</div>' +
      '<div class="card"><h3>' + esc(t('screen_results')) + '</h3><div class="flag ok">' + E(CX.neg) + '</div><div class="flag">' + E(CX.pos) + '</div></div>' +
      '<div class="card soft"><h3>' + esc(t('screen_other_tests')) + '</h3>' + ul([CX.hpv, CX.pap]) + '<p class="small">' + E(CX.other) + '</p></div>' +
      '<div class="card warn"><h3>' + esc(t('screen_cx_sym_h')) + '</h3>' + ul(CX.sym) + '<p class="small" style="color:var(--fg)">' + esc(t('screen_cx_sym_p')) + '</p></div>' +
      '<button type="button" class="action" data-go="screen-mine"><span class="ico accent">' + I.bell + '</span><span class="body"><strong>' + esc(t('screen_save_date')) + '</strong><span class="small">' + esc(t('screen_save_date_s')) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' +
      linkItem('screen-hpv', SYRINGE, t('screen_hpv'), t('screen_hpv_s')) +
      quraBtn(t('screen_cervix')) + srcList(['ncd', 'who', 'aam']) + '<p class="footnote">' + esc(t('screen_not_rx')) + '</p>';
    S.wire(v);
  }

  /* ---------- HPV vaccine ---------- */
  const HPV = {
    what: L('HPV is a very common virus passed on through sexual contact. Most infections clear on their own. A few last for years and can turn into cervical cancer. Two types, 16 and 18, cause more than 8 in 10 cervical cancers in India.', 'HPV बहुत आम virus है जो यौन संपर्क से फैलता है। ज़्यादातर संक्रमण अपने आप ठीक हो जाते हैं। कुछ सालों तक रहते हैं और सर्वाइकल कैंसर बन सकते हैं। भारत में 10 में से 8 से ज़्यादा सर्वाइकल कैंसर दो types, 16 और 18, से होते हैं।'),
    vax: L('The vaccine protects against these types. It works best at 9–14 years, before any sexual contact, so it is given to girls.', 'टीका इन types से बचाता है। यह 9–14 साल की उम्र में, किसी भी यौन संपर्क से पहले, सबसे अच्छा काम करता है, इसलिए लड़कियों को दिया जाता है।'),
    day: [
      L('She should eat before she comes; not on an empty stomach.', 'आने से पहले कुछ खा ले; ख़ाली पेट नहीं।'),
      L('She waits 30 minutes after the injection, in case she feels faint.', 'टीके के बाद 30 मिनट रुकती है, ताकि चक्कर आए तो देखभाल हो सके।'),
      L('A sore arm or a mild fever for a day can happen.', 'बाँह में दर्द या एक दिन हल्का बुख़ार हो सकता है।'),
      L('Download the certificate from U-WIN, or ask for a paper copy.', 'Certificate U-WIN से download करें, या काग़ज़ की copy माँगें।')
    ],
    wait: [
      L('She is unwell with a moderate or serious illness: wait until she recovers.', 'वह मध्यम या गंभीर रूप से बीमार है: ठीक होने तक रुकें।'),
      L('She is allergic to yeast, or had a serious reaction to a vaccine before.', 'उसे yeast से एलर्जी है, या पहले किसी टीके से गंभीर reaction हुआ था।'),
      L('She is pregnant.', 'वह गर्भवती है।'),
      L('She already had any HPV vaccine (Gardasil, Gardasil-9, Cervarix or Cervavac).', 'उसे पहले कोई भी HPV टीका (Gardasil, Gardasil-9, Cervarix या Cervavac) लग चुका है।')
    ],
    age: [
      L('Younger than 14: she gets the free dose in the year she is 14. Ask your ASHA or ANM when.', '14 से छोटी: 14 साल की उम्र में मुफ़्त टीका मिलेगा। कब, यह ASHA या ANM से पूछें।'),
      L('Older than 14: the free programme does not cover her. Ask your child\'s doctor about the vaccine at a private clinic.', '14 से बड़ी: मुफ़्त कार्यक्रम में शामिल नहीं। private clinic में टीके के बारे में बच्चे के डॉक्टर से पूछें।'),
      L('Not sure of the date or the nearest centre? Your ASHA, ANM or her school can tell you.', 'तारीख़ या पास का केंद्र नहीं पता? आपकी ASHA, ANM या बेटी का स्कूल बता सकते हैं।')
    ],
    cvx: L('India\'s own HPV vaccine, made by the Serum Institute of India. It is not the vaccine used in the free programme; it is bought privately. Your doctor decides.', 'भारत में बना HPV टीका, जिसे Serum Institute of India बनाता है। मुफ़्त कार्यक्रम में यह टीका नहीं लगता; यह private में ख़रीदा जाता है। डॉक्टर तय करते हैं।'),
    cvxKv: [
      [L('Approved for', 'किस उम्र के लिए'), L('9–26 years', '9–26 साल')],
      [L('Age 9–14', '9–14 साल'), L('2 doses, 6 months apart', '2 ख़ुराक, 6 महीने के अंतर पर')],
      [L('Age 15–26', '15–26 साल'), L('3 doses: day 1, 2 months, 6 months', '3 ख़ुराक: पहले दिन, 2 महीने, 6 महीने पर')]
    ],
    adult: [
      L('Thinking about it for yourself? Ask a doctor whether the vaccine would help you. It works best before any contact with HPV.', 'अपने लिए सोच रही हैं? डॉक्टर से पूछें कि टीका आपके लिए फ़ायदेमंद होगा या नहीं। यह HPV से किसी भी संपर्क से पहले सबसे अच्छा काम करता है।'),
      L('It does not treat an HPV infection you already have, and it is not given in pregnancy.', 'यह पहले से मौजूद HPV संक्रमण का इलाज नहीं करता, और गर्भावस्था में नहीं दिया जाता।'),
      L('Vaccinated or not, have cervical screening from 30.', 'टीका लगा हो या न लगा हो, 30 साल से बच्चेदानी के मुँह की जाँच करवाएँ।')
    ]
  };
  function renderHpv(v) {
    v.innerHTML = S.backRow(t('screen_hpv'), 'screen', false) + '<p class="small">' + esc(t('screen_hpv_p')) + '</p>' +
      '<div class="card"><h3>' + esc(t('screen_hpv_what')) + '</h3><p>' + E(HPV.what) + '</p><p>' + E(HPV.vax) + '</p></div>' +
      '<div class="card"><div class="eyebrow">' + esc(t('screen_hpv_since')) + '</div><h3>' + esc(t('screen_hpv_free_h')) + '</h3><dl class="kv screen-kv wide">' +
      [['screen_hpv_k_who', 'screen_hpv_v_who'], ['screen_hpv_k_vax', 'screen_hpv_v_vax'], ['screen_hpv_k_cost', 'screen_hpv_v_cost'], ['screen_hpv_k_where', 'screen_hpv_v_where'], ['screen_hpv_k_when', 'screen_hpv_v_when'], ['screen_hpv_k_reg', 'screen_hpv_v_reg']].map((x) => '<dt>' + esc(t(x[0])) + '</dt><dd>' + esc(t(x[1])) + '</dd>').join('') + '</dl>' +
      '<p class="small">' + esc(t('screen_hpv_consent')) + '</p>' +
      '<a class="btn sm" href="' + esc(SRC.uwin.url) + '" target="_blank" rel="noopener">' + esc(t('screen_hpv_uwin')) + '</a></div>' +
      '<div class="card"><h3>' + esc(t('screen_hpv_day')) + '</h3>' + ul(HPV.day) + '</div>' +
      '<div class="card warn"><h3>' + esc(t('screen_hpv_wait')) + '</h3>' + ul(HPV.wait) + '<p class="small" style="color:var(--fg)">' + esc(t('screen_hpv_wait_p')) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('screen_hpv_age')) + '</h3>' + ul(HPV.age) + '</div>' +
      '<div class="card soft"><h3>' + esc(t('screen_hpv_cvx')) + '</h3><p class="small" style="color:var(--fg)">' + E(HPV.cvx) + '</p><dl class="kv screen-kv wide">' + HPV.cvxKv.map((x) => '<dt>' + E(x[0]) + '</dt><dd>' + E(x[1]) + '</dd>').join('') + '</dl></div>' +
      '<div class="card"><h3>' + esc(t('screen_hpv_adult')) + '</h3>' + ul(HPV.adult) + '</div>' +
      linkItem('screen-cervix', 'check', t('screen_cervix'), t('screen_cervix_s')) +
      quraBtn(t('screen_hpv')) + srcList(['pib', 'who', 'sii', 'uwin']) + '<p class="footnote">' + esc(t('screen_not_rx')) + '</p>';
    S.wire(v);
  }

  /* ---------- breast self-check ---------- */
  const BR = {
    steps: [
      L('Stand in front of a mirror, shoulders straight, hands on your hips. Look at both breasts: size, shape, colour, any swelling.', 'शीशे के सामने सीधी खड़ी हों, हाथ कमर पर। दोनों स्तन देखें: आकार, बनावट, रंग, कोई सूजन।'),
      L('Raise both arms and look again for the same changes.', 'दोनों हाथ ऊपर उठा कर फिर यही बदलाव देखें।'),
      L('Look at each nipple. Is there fluid (watery, milky, yellow or blood)? Has a nipple turned inwards or changed position?', 'हर निप्पल देखें। कोई स्राव (पानी जैसा, दूधिया, पीला या खून)? कोई निप्पल अंदर मुड़ गया या जगह बदल गई?'),
      L('Lie down. Use the flat pads of the three middle fingers: right hand for the left breast, left hand for the right. Move in small circles from the nipple outwards, first light, then medium, then firm pressure.', 'लेट जाएँ। बीच की तीन उँगलियों के सपाट हिस्से से जाँचें: बाएँ स्तन के लिए दायाँ हाथ, दाएँ के लिए बायाँ। निप्पल से बाहर की ओर छोटे गोल घेरों में, पहले हल्का, फिर थोड़ा, फिर ज़्यादा दबाव।'),
      L('Cover the whole area: from the collarbone to the top of the belly, and from the armpit to the middle of the chest. Feel inside each armpit too.', 'पूरा हिस्सा जाँचें: हँसली की हड्डी से पेट के ऊपर तक, और बगल से छाती के बीच तक। दोनों बगल के अंदर भी टटोलें।'),
      L('Repeat the feeling while standing or sitting. Many women find it easiest in the bath, with soapy skin.', 'खड़े या बैठ कर फिर से टटोलें। कई महिलाओं को नहाते समय, साबुन लगी त्वचा पर यह सबसे आसान लगता है।')
    ],
    signs: [
      L('A lump or swelling in the breast, chest or armpit', 'स्तन, छाती या बगल में गाँठ या सूजन'),
      L('Skin dimpling or puckering, like orange peel', 'त्वचा में गड्ढे या सिकुड़न, संतरे के छिलके जैसी'),
      L('Blood from a nipple, or any fluid when you are not breastfeeding', 'निप्पल से खून, या दूध न पिलाते समय कोई भी स्राव'),
      L('A nipple that has newly turned inwards', 'निप्पल जो हाल में अंदर मुड़ गया हो'),
      L('A rash, redness, darker skin or crusting on the nipple or breast', 'निप्पल या स्तन पर दाने, लाली, गहरा रंग या पपड़ी'),
      L('A change in the size or shape of one breast', 'एक स्तन के आकार या बनावट में बदलाव')
    ],
    mammo: [
      L('A mammogram is an X-ray of the breast. It can find a change too small to feel.', 'मैमोग्राम स्तन का X-ray है। यह इतना छोटा बदलाव भी पकड़ सकता है जो हाथ से महसूस न हो।'),
      L('India\'s free programme uses the breast exam by a health worker, not routine mammograms. If that exam finds something, you are referred to a surgeon at the CHC or district hospital for an ultrasound and, if needed, a biopsy.', 'भारत का मुफ़्त कार्यक्रम हर किसी का मैमोग्राम नहीं, स्वास्थ्यकर्मी से स्तन की जाँच करता है। उसमें कुछ मिले तो आपको CHC या ज़िला अस्पताल में सर्जन के पास ultrasound और ज़रूरत हो तो biopsy के लिए भेजा जाता है।'),
      L('From 40, or sooner if a mother, sister or daughter had breast or ovarian cancer, ask a doctor whether regular mammograms suit you. US guidance suggests one every 2 years from 40 to 74.', '40 साल से, या पहले भी अगर माँ, बहन या बेटी को breast या अंडाशय का कैंसर हुआ हो, डॉक्टर से पूछें कि नियमित मैमोग्राम आपके लिए ठीक है या नहीं। अमेरिका की guidance 40 से 74 साल तक हर 2 साल में एक बताती है।')
    ]
  };
  function bseCard(v) {
    if (!S.canSave()) return S.needDiary();
    const d = D(); d.bse = d.bse || {}; const b = d.bse; const mode = b.mode || bseDefaultMode(); const ls = S.cycle.lastStart();
    const r = S.reminders.get('screen-bse'); const nx = r ? S.reminders.next(r) : null;
    const days = []; for (let i = 1; i <= 28; i++) days.push('<option value="' + i + '"' + (Number(b.day || 1) === i ? ' selected' : '') + '>' + i + '</option>');
    return '<div class="card" id="sb-card"><h3>' + esc(t('screen_bse_rem_h')) + '</h3><p class="small">' + esc(t('screen_bse_when')) + '</p>' +
      '<div class="chips"><button type="button" class="chip' + (mode === 'period' ? ' on' : '') + '" data-bmode="period">' + esc(t('screen_bse_mode_p')) + '</button><button type="button" class="chip' + (mode === 'date' ? ' on' : '') + '" data-bmode="date">' + esc(t('screen_bse_mode_d')) + '</button></div>' +
      (mode === 'date' ? '<div class="row"><label for="sb-day" style="flex:1">' + esc(t('screen_bse_day')) + '</label><select id="sb-day" style="width:96px">' + days.join('') + '</select></div>' : (ls ? '' : '<p class="small">' + esc(t('screen_bse_noperiod')) + '</p>')) +
      (b.on && nx ? '<p class="small" style="color:var(--fg)">' + esc(t('screen_bse_next')) + ': <strong>' + esc(fmtS(nx)) + '</strong></p>' : '') +
      '<button type="button" class="btn ' + (b.on ? '' : 'primary ') + 'block" id="sb-toggle">' + esc(b.on ? t('screen_bse_off') : t('screen_bse_on')) + '</button></div>';
  }
  function renderBreast(v) {
    const draw = () => {
      v.innerHTML = S.backRow(t('screen_breast'), 'screen', false) + '<p class="small">' + esc(t('screen_breast_p')) + '</p><div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('screen_bse_ev')) + '</p></div>' +
        '<div class="card"><h3>' + esc(t('screen_bse_how')) + '</h3>' + steps(BR.steps) + '</div>' +
        bseCard(v) +
        '<div class="card warn"><h3>' + esc(t('screen_br_signs_h')) + '</h3>' + ul(BR.signs) + '<p class="small" style="color:var(--fg)">' + esc(t('screen_br_signs_p')) + '</p></div>' +
        '<div class="card"><h3>' + esc(t('screen_cbe_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(t('screen_cbe_p')) + '</p><button type="button" class="btn sm screen-inline" data-go="screen-mine">' + esc(t('screen_open_mine')) + '</button></div>' +
        '<div class="card soft"><h3>' + esc(t('screen_mammo_h')) + '</h3>' + ul(BR.mammo) + '</div>' +
        quraBtn(t('screen_breast')) + srcList(['ncd', 'mumbai', 'cochbse', 'nhsbr', 'mammo']) + '<p class="footnote">' + esc(t('screen_not_rx')) + '</p>';
      S.wire(v);
      if (!S.canSave()) return;
      const d = D(); d.bse = d.bse || {};
      const apply = (msg) => { bseSync(); S.save(); if (msg) S.toast(msg); const y = window.scrollY; draw(); window.scrollTo(0, y); };
      v.querySelectorAll('[data-bmode]').forEach((b) => b.addEventListener('click', () => { d.bse.mode = b.dataset.bmode; if (d.bse.mode === 'date' && !d.bse.day) d.bse.day = S.today().getDate() > 28 ? 1 : S.today().getDate(); apply(d.bse.on ? t('screen_bse_set') : ''); }));
      const sd = v.querySelector('#sb-day'); if (sd) sd.addEventListener('change', () => { d.bse.day = Number(sd.value) || 1; apply(d.bse.on ? t('screen_bse_set') : ''); });
      const tg = v.querySelector('#sb-toggle'); if (tg) tg.addEventListener('click', () => { d.bse.on = !d.bse.on; if (!d.bse.mode) d.bse.mode = bseDefaultMode(); if (d.bse.mode === 'date' && !d.bse.day) d.bse.day = S.today().getDate() > 28 ? 1 : S.today().getDate(); apply(d.bse.on ? t('screen_bse_set') : t('screen_bse_removed')); });
    };
    draw();
  }

  /* ---------- warning signs ---------- */
  const SIGNS = [
    { h: L('Breast', 'स्तन'), go: 'screen-breast', items: [L('A new lump or swelling in the breast or armpit', 'स्तन या बगल में नई गाँठ या सूजन'), L('Dimpled skin, a nipple newly turned in, or blood from a nipple', 'त्वचा में गड्ढे, हाल में अंदर मुड़ा निप्पल, या निप्पल से खून'), L('A rash or redness on the nipple, or one breast changing size or shape', 'निप्पल पर दाने या लाली, या एक स्तन का आकार या बनावट बदलना')] },
    { h: L('Cervix (mouth of the womb)', 'बच्चेदानी का मुँह (cervix)'), go: 'screen-cervix', items: [L('Bleeding after sex, or between periods', 'संबंध के बाद, या दो पीरियड के बीच ब्लीडिंग'), L('Smelly or blood-stained discharge', 'बदबूदार या खून मिला स्राव'), L('Pain in the pelvis or during sex that does not go away', 'पेड़ू में या संबंध के समय दर्द जो ठीक न हो')] },
    { h: L('Womb', 'बच्चेदानी'), items: [L('Any bleeding or spotting after menopause, even once. Most causes are not serious, but this always needs a check.', 'menopause के बाद कोई भी ब्लीडिंग या स्पॉटिंग, एक बार भी। ज़्यादातर वजहें गंभीर नहीं होतीं, पर इसकी जाँच हमेशा ज़रूरी है।'), L('Periods suddenly much heavier than usual for you, or bleeding between periods, especially after 40', 'पीरियड अचानक आपके हिसाब से बहुत भारी, या बीच में ब्लीडिंग, ख़ासकर 40 के बाद')] },
    { h: L('Ovary', 'अंडाशय (ovary)'), items: [L('A swollen tummy or feeling bloated', 'पेट फूला रहना'), L('Feeling full quickly, or not feeling hungry', 'जल्दी पेट भर जाना, या भूख न लगना'), L('Pain in the tummy or between the hips', 'पेट में या कूल्हों के बीच दर्द'), L('Needing to pee more often or urgently', 'बार-बार या जल्दी-जल्दी पेशाब जाना')], note: L('See a doctor if these happen on 12 or more days a month, or keep coming back. Ask about an examination and a scan.', 'अगर ये महीने में 12 या ज़्यादा दिन हों, या बार-बार लौटें, तो डॉक्टर को दिखाएँ। जाँच और scan के बारे में पूछें।') },
    { h: L('Mouth (if you use tobacco, gutkha, paan or supari)', 'मुँह (अगर तंबाकू, गुटखा, पान या सुपारी खाती हैं)'), items: [L('An ulcer or sore that has not healed in 3 weeks', 'छाला या घाव जो 3 हफ़्ते में ठीक न हो'), L('A red or white patch inside the mouth', 'मुँह के अंदर लाल या सफ़ेद धब्बा'), L('A lump in the mouth, lip or neck, or trouble swallowing', 'मुँह, होंठ या गर्दन में गाँठ, या निगलने में दिक़्क़त'), L('A hoarse voice that does not get better', 'आवाज़ बैठी रहना, जो ठीक न हो')] }
  ];
  function renderSigns(v) {
    v.innerHTML = S.backRow(t('screen_signs'), 'screen', true) + '<p class="small">' + esc(t('screen_signs_p')) + '</p>' +
      '<div class="card warn"><h3>' + esc(t('screen_when_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(t('screen_when_p')) + '</p><div class="flag ok">' + esc(t('screen_not_dx')) + '</div></div>' +
      SIGNS.map((g) => '<div class="card"><h3>' + E(g.h) + '</h3>' + ul(g.items) + (g.note ? '<p class="small" style="color:var(--fg)">' + E(g.note) + '</p>' : '') + (g.go ? '<button type="button" class="btn sm screen-inline" data-go="' + g.go + '">' + esc(t('screen_read')) + '</button>' : '') + '</div>').join('') +
      '<div class="flag urgent">' + esc(t('s1b')) + ': ' + esc(t('screen_call112')) + '</div>' +
      '<div class="card"><h3>' + esc(t('screen_where_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(t('screen_where_p')) + '</p></div>' +
      '<h2>' + esc(t('screen_quit_h')) + '</h2>' + copyRow('1800-11-2356', t('screen_quit_d')) +
      quraBtn(t('screen_signs')) + srcList(['nhsbr', 'who', 'nhswo', 'nhsov', 'nhsmo', 'ncd', 'quit']);
    S.wire(v); wireCopy(v);
  }

  /* ---------- hooks ---------- */
  function summary() {
    const d = D(); const lines = [];
    ITEMS.forEach((it) => {
      const rec = (d.last || {})[it.k]; if (!rec) return; const st = status(it);
      lines.push(tx(it.name) + ': ' + (okDate(rec) ? fmt(S.fromISO(rec)) : t('screen_never')) + (st.code === 'due' ? ' · ' + t('screen_st_due') : (st.next ? ' · ' + t('screen_next_l') + ' ' + fmtM(st.next) : '')));
    });
    if (d.bse && d.bse.on) lines.push(t('screen_breast') + ': ' + t('screen_bse_sum'));
    return lines.length ? [{ title: t('screen_hub'), lines: lines }] : [];
  }
  function sample(id) {
    const td = S.today(); const d = D(); const back = (m) => iso(addMonths(td, -m));
    if (id === 'asha') {
      d.last = { cervix: 'never', bp: back(4) }; d.rem = {};
      ['cervix', 'bp'].forEach(syncItem);
    } else if (id === 'kamla') {
      d.last = { bp: back(3), sugar: back(3), cbe: back(66), cervix: back(36) }; d.rem = {};
      ['bp', 'sugar', 'cbe', 'cervix'].forEach(syncItem);
    }
  }

  /* ---------- strings ---------- */
  const en = {
    screen_hub: 'Screening and check-ups', screen_hub_s: 'My check-ups, cervical screening, HPV vaccine, breast self-check',
    screen_hub_p: 'Simple tests find problems early, often years before you feel anything. Most are free at your Ayushman Arogya Mandir (health and wellness centre) or PHC.',
    screen_setup: 'Add your check-up dates', screen_setup_s: 'Free from 30: cervical screening and a breast exam', screen_home_h: 'Free check-ups for you', screen_home_p: 'From 30, every woman can have a cervical screening and a breast exam by a health worker, free, once in 5 years, at the Ayushman Arogya Mandir or PHC. Add when you last had them, or get a reminder.', screen_home_go: 'See my check-ups', screen_home_later: 'Later',
    screen_mine: 'My check-ups', screen_mine_s: 'Built from your age. Add the dates, get reminders.',
    screen_mine_p: 'Built from your age and what you set on the Me page. Add when you last had each one; the next date and a reminder follow.',
    screen_cervix: 'Cervical screening', screen_cervix_s: 'The free VIA test: why, what happens, results',
    screen_cervix_p: 'A short test of the cervix, the mouth of the womb. It finds changes years before they could become cancer.',
    screen_hpv: 'HPV vaccine', screen_hpv_s: 'One free dose for 14-year-old girls since Feb 2026. Options for older girls and women.', screen_hpv_new: 'New in 2026',
    screen_hpv_p: 'A vaccine that prevents most cervical cancers. Since February 2026 it is free for girls aged 14 at government health centres.',
    screen_breast: 'Breast self-check', screen_breast_s: 'Know your normal, changes to show a doctor, the free breast exam', screen_bse_ev: 'A strict monthly self-exam has not been shown to save lives, and it leads to more biopsies (Cochrane review). What helps is knowing your normal, getting any change checked quickly, and the free breast exam by a health worker: in a large study in Mumbai it cut breast cancer deaths by about 30% in women over 50.',
    screen_breast_p: 'Know how your breasts normally look and feel, so you notice a change early. Most lumps are not cancer, but every new change needs a check.',
    screen_signs: 'Warning signs worth a check', screen_signs_s: 'Breast, cervix, womb, ovary, mouth. Most are not cancer.',
    screen_signs_p: 'Signs in the body that deserve a doctor\'s look, grouped by where they show up.',
    screen_due_n: '{n} due now', screen_all_ok: 'Nothing due right now', screen_add_dates: 'Add the dates you remember',
    screen_for_age: 'For your age · {n}', screen_next_l: 'Next', screen_last_l: 'Last', screen_never: 'Never done', screen_never_b: 'Never or not sure', screen_tap_add: 'Tap to add when you last had it',
    screen_st_due: 'Due now', screen_st_soon: 'Due soon', screen_st_ok: 'Up to date', screen_st_add: 'Add date', screen_st_doc: 'Ask your doctor', screen_st_notyet: 'Not done yet', screen_st_later: 'Later', screen_st_ifneeded: 'If needed',
    screen_from_age: 'From {n}', screen_after65: 'The free programme covers 30–65. After 65, ask your doctor whether you still need it.',
    screen_group_later: 'Later, or only if needed', screen_last_done: 'Last done on', screen_repeat: 'Repeat after',
    screen_repeat_p: 'Pick what your doctor or dentist told you. Not sure? Leave it and ask at your next visit.', screen_rep_ask: 'Not sure',
    screen_m6: '6 months', screen_y1: '1 year', screen_y2: '2 years', screen_y3: '3 years', screen_y5: '5 years', screen_every_fixed: 'Repeat every {n} under the national programme.',
    screen_rem_on: 'Remind me when it is due', screen_clear: 'Clear this entry', screen_read: 'Read the guide',
    screen_pick_date: 'Pick the date first.', screen_saved: 'Saved. Next date updated.', screen_saved_never: 'Noted as not done yet.', screen_cleared: 'Entry cleared.',
    screen_rem_note: 'Reminders show on the Today page and in your reminders list. If a check-up is already due, we remind you in a week, then once a month until you add a new date.',
    screen_all_rem: 'All my reminders', screen_phone_only: 'Saved only on this phone.',
    screen_not_rx: 'General guidance from India\'s national programme, not a prescription. Your doctor may suggest a different plan.',
    screen_hyst_note: 'Had a hysterectomy? Ask your doctor whether you still need cervical screening.',
    screen_preg_note: 'Pregnant? Your antenatal visits already check your BP, sugar and Hb.',
    screen_under30: 'Under 30? If you have PMOS or diabetes in the family, ask a doctor whether to check BP and sugar sooner.',
    screen_by_age: 'Check-ups by age', screen_age_any: 'Any age', screen_age_any_d: 'Hb if tired; teeth', screen_age_40: 'From 40', screen_age_40_d: 'Eyes; ask about a mammogram', screen_age_65: 'From 65', screen_age_65_d: 'Bone density',
    screen_free_h: 'Free under the national programme', screen_free_30: 'From 30: BP and sugar', screen_free_cx: '30–65: mouth, breast and cervical checks', screen_yearly: 'Once a year', screen_5y: 'Once in 5 years',
    screen_free_how: 'Your ASHA fills a short form about you (CBAC) and tells you the screening day. You can also walk in to your Ayushman Arogya Mandir or PHC and ask.',
    screen_qura_h: 'Not sure what you need?', screen_qura_p: 'A Qura doctor (BAMS) can go through your check-up list on a free call, order tests and refer you to a gynaecologist when needed.',
    screen_sources: 'Sources', screen_open_mine: 'Open my check-ups', screen_save_date: 'Save my test date', screen_save_date_s: 'Get a reminder when the next one is due',
    screen_why: 'Why it matters', screen_who_often: 'Who and how often', screen_cx_k1: 'Women 30–65', screen_cx_k2: 'Living with HIV', screen_cx_v2: 'From 25, every 3–5 years',
    screen_cx_free: 'The VIA test is free at your Ayushman Arogya Mandir, PHC or government hospital. Ask your ASHA or ANM for the screening day.',
    screen_cx_what: 'What happens at a VIA test', screen_results: 'Results', screen_other_tests: 'Other tests you may hear about',
    screen_cx_sym_h: 'See a doctor regardless of your last test', screen_cx_sym_p: 'Any of these: see a gynaecologist within 2 weeks, even if your last test was normal.',
    screen_hpv_what: 'What HPV is', screen_hpv_since: 'Since 28 February 2026', screen_hpv_free_h: 'Free for girls aged 14',
    screen_hpv_k_who: 'Who', screen_hpv_v_who: 'Girls aged 14', screen_hpv_k_vax: 'Vaccine', screen_hpv_v_vax: 'Gardasil-4, one dose', screen_hpv_k_cost: 'Cost', screen_hpv_v_cost: 'Free',
    screen_hpv_k_where: 'Where', screen_hpv_v_where: 'Government health centres', screen_hpv_k_when: 'When', screen_hpv_v_when: 'Routine immunisation days', screen_hpv_k_reg: 'Register', screen_hpv_v_reg: 'U-WIN, ASHA, or walk in',
    screen_hpv_consent: 'A parent or guardian gives consent. It is given at government facilities with a cold chain, such as an Ayushman Arogya Mandir, CHC, district hospital or medical college. Ask your ASHA or ANM for the nearest one.',
    screen_hpv_uwin: 'Open U-WIN', screen_hpv_day: 'On the day', screen_hpv_wait: 'Wait and ask the health worker if', screen_hpv_wait_p: 'Girls who already had an HPV vaccine do not need the free dose.',
    screen_hpv_age: 'If your daughter is not 14', screen_hpv_cvx: 'Cervavac, India\'s own vaccine', screen_hpv_adult: 'For adult women',
    screen_bse_how: 'How to check, in 6 steps', screen_bse_rem_h: 'A reminder, if you want one', screen_bse_when: 'Best a few days after your period ends, when breasts are least tender. After menopause, or if periods are irregular, pick a date.',
    screen_bse_mode_p: 'A week after my period starts', screen_bse_mode_d: 'Same date every month', screen_bse_day: 'Day of the month',
    screen_bse_on: 'Turn on reminder', screen_bse_off: 'Turn off reminder', screen_bse_next: 'Next reminder', screen_bse_set: 'Reminder set.', screen_bse_removed: 'Reminder turned off.',
    screen_bse_noperiod: 'No period start in your diary yet, so the reminder uses the 1st of the month until you log one.', screen_bse_sum: 'monthly self-check reminder on',
    screen_br_signs_h: 'Show a doctor within 2 weeks', screen_br_signs_p: 'Breast pain alone is usually not cancer. Pain that does not go away still deserves a check.',
    screen_cbe_h: 'Breast exam by a health worker', screen_cbe_p: 'Free once in 5 years from 30 to 65 at your Ayushman Arogya Mandir or PHC. A trained nurse or ANM checks both breasts and armpits by hand; it takes a few minutes.',
    screen_mammo_h: 'About mammograms',
    screen_not_dx: 'Not a diagnosis. Most of these signs turn out to be something other than cancer. Each one still deserves a check.',
    screen_when_h: 'How soon', screen_when_p: 'Any sign here that is new for you, or does not settle: see a doctor within 2 weeks. Do not wait for your next screening date.',
    screen_call112: 'call 112 now',
    screen_where_h: 'Where to get checked free', screen_where_p: 'Start at your Ayushman Arogya Mandir or PHC. If something needs a closer look, they refer you to the NCD clinic at the CHC or district hospital, also free.',
    screen_quit_h: 'Want to stop tobacco?', screen_quit_d: 'National Tobacco Quitline, free, Government of India',
    screen_free_w: 'free', screen_signs_short: 'Warning signs', screen_sum_hint: 'Tap a check-up to add the date you remember.'
  };
  const hi = {
    screen_hub: 'जाँच और चेक-अप', screen_hub_s: 'मेरे चेक-अप, बच्चेदानी के मुँह की जाँच, HPV टीका, स्तन की ख़ुद जाँच',
    screen_hub_p: 'आसान जाँचें बीमारी को जल्दी पकड़ लेती हैं, अक्सर कुछ महसूस होने से सालों पहले। ज़्यादातर जाँचें आपके आयुष्मान आरोग्य मंदिर (हेल्थ एंड वेलनेस सेंटर) या PHC पर मुफ़्त हैं।',
    screen_setup: 'अपनी जाँचों की तारीख़ें जोड़ें', screen_setup_s: '30 साल की उम्र से मुफ़्त: बच्चेदानी के मुँह की जाँच और स्तन की जाँच', screen_home_h: 'आपके लिए मुफ़्त जाँच', screen_home_p: '30 साल से हर महिला 5 साल में एक बार, आयुष्मान आरोग्य मंदिर या PHC पर, बच्चेदानी के मुँह की जाँच और स्वास्थ्यकर्मी से स्तन की जाँच मुफ़्त करवा सकती है। आख़िरी बार कब करवाई थी, लिखें, या रिमाइंडर लें।', screen_home_go: 'मेरे चेक-अप देखें', screen_home_later: 'बाद में',
    screen_mine: 'मेरे चेक-अप', screen_mine_s: 'आपकी उम्र के हिसाब से। तारीख़ें डालें, reminder पाएँ।',
    screen_mine_p: 'आपकी उम्र और “मैं” पन्ने पर दी जानकारी के हिसाब से। हर जाँच आख़िरी बार कब हुई, लिखें; अगली तारीख़ और reminder अपने आप बन जाते हैं।',
    screen_cervix: 'बच्चेदानी के मुँह की जाँच', screen_cervix_s: 'मुफ़्त VIA जाँच: क्यों, क्या होता है, नतीजे',
    screen_cervix_p: 'बच्चेदानी के मुँह (cervix) की छोटी सी जाँच। यह बदलावों को कैंसर बनने से सालों पहले पकड़ लेती है।',
    screen_hpv: 'HPV टीका', screen_hpv_s: '14 साल की लड़कियों को एक मुफ़्त ख़ुराक, फ़रवरी 2026 से। बड़ी लड़कियों और महिलाओं के विकल्प।', screen_hpv_new: '2026 में नया',
    screen_hpv_p: 'यह टीका ज़्यादातर सर्वाइकल कैंसर से बचाता है। फ़रवरी 2026 से यह सरकारी स्वास्थ्य केंद्रों पर 14 साल की लड़कियों के लिए मुफ़्त है।',
    screen_breast: 'स्तन की ख़ुद जाँच', screen_breast_s: 'अपना सामान्य जानें, कौन से बदलाव दिखाएँ, मुफ़्त स्तन जाँच', screen_bse_ev: 'हर महीने सख़्ती से ख़ुद जाँच करने से जान बचने का सबूत नहीं मिला, और इससे बायोप्सी ज़्यादा होती हैं (Cochrane review)। मदद करता है: अपना सामान्य जानना, किसी भी बदलाव को जल्दी जँचवाना, और स्वास्थ्यकर्मी से मुफ़्त स्तन जाँच: मुंबई की एक बड़ी स्टडी में इससे 50 से ऊपर की महिलाओं में breast cancer से मौतें लगभग 30% कम हुईं।',
    screen_breast_p: 'जानें कि आपके स्तन आम तौर पर कैसे दिखते और महसूस होते हैं, ताकि बदलाव जल्दी पता चले। ज़्यादातर गाँठें कैंसर नहीं होतीं, पर हर नए बदलाव की जाँच ज़रूरी है।',
    screen_signs: 'चेतावनी के संकेत, जिनकी जाँच ज़रूरी', screen_signs_s: 'स्तन, बच्चेदानी का मुँह, बच्चेदानी, अंडाशय, मुँह। ज़्यादातर कैंसर नहीं।',
    screen_signs_p: 'शरीर के वे संकेत जिन्हें डॉक्टर को दिखाना चाहिए, जगह के हिसाब से।',
    screen_due_n: '{n} जाँच अभी बाक़ी', screen_all_ok: 'अभी कोई जाँच बाक़ी नहीं', screen_add_dates: 'जो तारीख़ें याद हैं, डालें',
    screen_for_age: 'आपकी उम्र · {n}', screen_next_l: 'अगली', screen_last_l: 'पिछली', screen_never: 'कभी नहीं हुई', screen_never_b: 'कभी नहीं या पता नहीं', screen_tap_add: 'आख़िरी बार कब हुई, यह डालने के लिए टैप करें',
    screen_st_due: 'अभी करवाएँ', screen_st_soon: 'जल्द', screen_st_ok: 'समय पर', screen_st_add: 'तारीख़ डालें', screen_st_doc: 'डॉक्टर से पूछें', screen_st_notyet: 'अभी नहीं हुई', screen_st_later: 'बाद में', screen_st_ifneeded: 'ज़रूरत हो तो',
    screen_from_age: '{n} साल से', screen_after65: 'मुफ़्त कार्यक्रम 30–65 साल के लिए है। 65 के बाद डॉक्टर से पूछें कि अब भी ज़रूरत है या नहीं।',
    screen_group_later: 'बाद में, या ज़रूरत हो तब', screen_last_done: 'आख़िरी बार कब हुई', screen_repeat: 'दोबारा कब',
    screen_repeat_p: 'जो डॉक्टर या dentist ने बताया, वह चुनें। पता नहीं? छोड़ दें और अगली बार पूछ लें।', screen_rep_ask: 'पता नहीं',
    screen_m6: '6 महीने', screen_y1: '1 साल', screen_y2: '2 साल', screen_y3: '3 साल', screen_y5: '5 साल', screen_every_fixed: 'राष्ट्रीय कार्यक्रम में हर {n} में दोबारा।',
    screen_rem_on: 'समय आने पर याद दिलाएँ', screen_clear: 'यह entry साफ़ करें', screen_read: 'गाइड पढ़ें',
    screen_pick_date: 'पहले तारीख़ चुनें।', screen_saved: 'सेव हो गया। अगली तारीख़ बदल गई।', screen_saved_never: 'दर्ज किया: अभी नहीं हुई।', screen_cleared: 'Entry साफ़ हो गई।',
    screen_rem_note: 'Reminder “आज” पन्ने पर और आपकी reminder list में दिखते हैं। अगर जाँच का समय निकल चुका है, तो हम एक हफ़्ते में याद दिलाएँगे, फिर हर महीने, जब तक आप नई तारीख़ न डालें।',
    screen_all_rem: 'मेरे सारे reminder', screen_phone_only: 'सिर्फ़ इसी फ़ोन में सेव होता है।',
    screen_not_rx: 'भारत के राष्ट्रीय कार्यक्रम पर आधारित आम जानकारी, पर्चा नहीं। आपकी डॉक्टर अलग योजना बता सकती हैं।',
    screen_hyst_note: 'बच्चेदानी का ऑपरेशन (hysterectomy) हुआ है? डॉक्टर से पूछें कि बच्चेदानी के मुँह की जाँच अब भी चाहिए या नहीं।',
    screen_preg_note: 'गर्भवती हैं? गर्भ की जाँचों में BP, शुगर और Hb पहले से देखे जाते हैं।',
    screen_under30: '30 से कम हैं? PMOS हो या परिवार में diabetes हो, तो डॉक्टर से पूछें कि BP और शुगर पहले जँचवाएँ या नहीं।',
    screen_by_age: 'उम्र के हिसाब से जाँचें', screen_age_any: 'किसी भी उम्र में', screen_age_any_d: 'थकान हो तो Hb; दाँत', screen_age_40: '40 से', screen_age_40_d: 'आँखें; मैमोग्राम के बारे में पूछें', screen_age_65: '65 से', screen_age_65_d: 'हड्डियों की मज़बूती',
    screen_free_h: 'राष्ट्रीय कार्यक्रम में मुफ़्त', screen_free_30: '30 से: BP और शुगर', screen_free_cx: '30–65: मुँह, स्तन और बच्चेदानी के मुँह की जाँच', screen_yearly: 'साल में एक बार', screen_5y: '5 साल में एक बार',
    screen_free_how: 'आपकी ASHA आपके बारे में एक छोटा फ़ॉर्म (CBAC) भरती है और जाँच का दिन बताती है। आप सीधे आयुष्मान आरोग्य मंदिर या PHC जा कर भी पूछ सकती हैं।',
    screen_qura_h: 'पता नहीं कौन सी जाँच चाहिए?', screen_qura_p: 'Qura की डॉक्टर (BAMS) मुफ़्त कॉल पर आपकी जाँच की list देख सकती हैं, जाँचें लिख सकती हैं और ज़रूरत हो तो स्त्री रोग विशेषज्ञ के पास भेज सकती हैं।',
    screen_sources: 'स्रोत', screen_open_mine: 'मेरे चेक-अप खोलें', screen_save_date: 'अपनी जाँच की तारीख़ सेव करें', screen_save_date_s: 'अगली जाँच के समय reminder पाएँ',
    screen_why: 'यह क्यों ज़रूरी है', screen_who_often: 'किसे और कितनी बार', screen_cx_k1: '30–65 साल की महिलाएँ', screen_cx_k2: 'HIV के साथ जी रही महिलाएँ', screen_cx_v2: '25 साल से, हर 3–5 साल',
    screen_cx_free: 'VIA जाँच आयुष्मान आरोग्य मंदिर, PHC या सरकारी अस्पताल में मुफ़्त है। जाँच का दिन ASHA या ANM से पूछें।',
    screen_cx_what: 'VIA जाँच में क्या होता है', screen_results: 'नतीजे', screen_other_tests: 'दूसरी जाँचें जिनके बारे में सुन सकती हैं',
    screen_cx_sym_h: 'पिछली जाँच चाहे जो रही हो, डॉक्टर को दिखाएँ', screen_cx_sym_p: 'इनमें से कुछ भी हो: 2 हफ़्ते के अंदर स्त्री रोग विशेषज्ञ को दिखाएँ, चाहे पिछली जाँच सामान्य आई हो।',
    screen_hpv_what: 'HPV क्या है', screen_hpv_since: '28 फ़रवरी 2026 से', screen_hpv_free_h: '14 साल की लड़कियों के लिए मुफ़्त',
    screen_hpv_k_who: 'किसे', screen_hpv_v_who: '14 साल की लड़कियाँ', screen_hpv_k_vax: 'टीका', screen_hpv_v_vax: 'Gardasil-4, एक ख़ुराक', screen_hpv_k_cost: 'ख़र्च', screen_hpv_v_cost: 'मुफ़्त',
    screen_hpv_k_where: 'कहाँ', screen_hpv_v_where: 'सरकारी स्वास्थ्य केंद्र', screen_hpv_k_when: 'कब', screen_hpv_v_when: 'नियमित टीकाकरण के दिन', screen_hpv_k_reg: 'Registration', screen_hpv_v_reg: 'U-WIN, ASHA, या सीधे जाएँ',
    screen_hpv_consent: 'माता-पिता या अभिभावक की सहमति ज़रूरी है। टीका उन सरकारी केंद्रों पर लगता है जहाँ cold chain है, जैसे आयुष्मान आरोग्य मंदिर, CHC, ज़िला अस्पताल या मेडिकल कॉलेज। सबसे पास का केंद्र ASHA या ANM से पूछें।',
    screen_hpv_uwin: 'U-WIN खोलें', screen_hpv_day: 'टीके के दिन', screen_hpv_wait: 'रुकें और स्वास्थ्यकर्मी से पूछें, अगर', screen_hpv_wait_p: 'जिन लड़कियों को पहले HPV टीका लग चुका है, उन्हें मुफ़्त ख़ुराक की ज़रूरत नहीं।',
    screen_hpv_age: 'अगर बेटी 14 की नहीं है', screen_hpv_cvx: 'Cervavac, भारत में बना टीका', screen_hpv_adult: 'बड़ी महिलाओं के लिए',
    screen_bse_how: 'जाँच कैसे करें, 6 चरणों में', screen_bse_rem_h: 'Reminder, अगर आप चाहें', screen_bse_when: 'पीरियड ख़त्म होने के कुछ दिन बाद सबसे अच्छा, जब स्तन सबसे कम दुखते हैं। Menopause के बाद, या पीरियड अनियमित हों, तो एक तारीख़ चुनें।',
    screen_bse_mode_p: 'पीरियड शुरू होने के एक हफ़्ते बाद', screen_bse_mode_d: 'हर महीने एक ही तारीख़', screen_bse_day: 'महीने की तारीख़',
    screen_bse_on: 'Reminder चालू करें', screen_bse_off: 'Reminder बंद करें', screen_bse_next: 'अगला reminder', screen_bse_set: 'Reminder लग गया।', screen_bse_removed: 'Reminder बंद हो गया।',
    screen_bse_noperiod: 'डायरी में अभी पीरियड की शुरुआत दर्ज नहीं है, इसलिए reminder महीने की 1 तारीख़ को आएगा, जब तक आप दर्ज न करें।', screen_bse_sum: 'हर महीने ख़ुद जाँच का reminder चालू',
    screen_br_signs_h: '2 हफ़्ते के अंदर डॉक्टर को दिखाएँ', screen_br_signs_p: 'सिर्फ़ स्तन में दर्द आम तौर पर कैंसर नहीं होता। पर जो दर्द ठीक न हो, उसकी भी जाँच करवाएँ।',
    screen_cbe_h: 'स्वास्थ्यकर्मी से स्तन की जाँच', screen_cbe_p: '30 से 65 साल तक, 5 साल में एक बार, आयुष्मान आरोग्य मंदिर या PHC पर मुफ़्त। प्रशिक्षित नर्स या ANM हाथ से दोनों स्तन और बगल जाँचती हैं; कुछ ही मिनट लगते हैं।',
    screen_mammo_h: 'मैमोग्राम के बारे में',
    screen_not_dx: 'यह diagnosis नहीं है। इनमें से ज़्यादातर संकेत कैंसर के अलावा किसी और वजह से होते हैं। फिर भी हर एक की जाँच ज़रूरी है।',
    screen_when_h: 'कितनी जल्दी', screen_when_p: 'यहाँ का कोई भी संकेत जो आपके लिए नया हो, या ठीक न हो: 2 हफ़्ते के अंदर डॉक्टर को दिखाएँ। अगली जाँच की तारीख़ का इंतज़ार न करें।',
    screen_call112: 'अभी 112 पर कॉल करें',
    screen_where_h: 'मुफ़्त जाँच कहाँ', screen_where_p: 'अपने आयुष्मान आरोग्य मंदिर या PHC से शुरू करें। और ध्यान से देखने की ज़रूरत हो तो वे CHC या ज़िला अस्पताल के NCD clinic भेजते हैं, वहाँ भी मुफ़्त।',
    screen_quit_h: 'तंबाकू छोड़ना चाहती हैं?', screen_quit_d: 'राष्ट्रीय तंबाकू Quitline, मुफ़्त, भारत सरकार',
    screen_free_w: 'मुफ़्त', screen_signs_short: 'चेतावनी के संकेत', screen_sum_hint: 'जो तारीख़ याद है, उसे डालने के लिए किसी जाँच पर टैप करें।'
  };

  const css = [
    '.screen-chev{color:var(--accent);width:18px;flex-shrink:0;display:inline-flex}',
    '.screen-chev svg{width:18px;height:18px}',
    '.screen-new{display:inline-flex;align-self:flex-start;margin-top:4px;font-size:12px !important;font-weight:600;padding:2px 8px;border-radius:10px;background:var(--accent-soft);color:var(--accent) !important}',
    '.screen-row{display:flex;gap:12px;align-items:center;background:var(--card);border-radius:16px;padding:12px 14px;box-shadow:var(--shadow);border:none;width:100%;text-align:left;color:var(--fg)}',
    '.screen-row .body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.screen-row .body strong{font-weight:600;font-size:15px;overflow-wrap:break-word}',
    '.screen-row .meta{font-size:12px;color:var(--muted);overflow-wrap:break-word}',
    '.screen-row .pill{flex-shrink:0;max-width:40%;text-align:center;line-height:1.3}',
    '.screen-kv{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}',
    '.screen-kv dd{overflow-wrap:break-word}',
    '.screen-kv.wide{grid-template-columns:minmax(0,0.9fr) minmax(0,1.5fr)}',
    '.screen-later summary{font-size:13px;padding:6px 0}',
    '.screen-sum h2{margin-top:2px}',
    '.screen-inline{align-self:flex-start}',
    '.screen-gate{display:inline-flex;align-self:flex-start;margin-top:4px;font-size:12px !important;font-weight:600;padding:2px 8px;border-radius:10px;background:var(--peach-2);color:var(--gold) !important;border:1px solid var(--gold)}'
  ].join('\n');

  /* ---------- Home: "you're due" (Version 28; docs/feature-research-2026-10-22.md, A4) ----------
     Only about 2 in 100 women aged 30 to 49 have ever had cervical screening. A woman of 30 to 65 whose free 5-yearly
     check-ups (cervical screening, a breast exam by a health worker) have no date yet, or are due, sees one card on Home
     until she opens My check-ups (where a date or "never" starts the monthly reminder) or says later (60 days). Never in
     pregnancy or in discreet mode. Her age alone decides; nothing reads her diary. */
  const HOME_KEYS = ['cervix', 'cbe'];
  function homeTop() {
    if (!S.canSave()) return ''; const st0 = S.state;
    if ((st0.settings || {}).discreet || S.cycle.isPregnant() || (S.setupShows && S.setupShows('checkups'))) return '';   /* the setup card has it */
    const age = ageNow(); if (age == null || age < 30 || age > 65) return '';
    const sn = ((st0.mods || {}).screen || {}).snooze; if (okDate(sn) && sn > iso(S.today())) return '';
    const due = HOME_KEYS.filter((k) => { const c = status(BY[k]).code; return c === 'add' || c === 'due'; });
    if (!due.length) return '';
    return '<div class="card screen-home" data-nofold="1"><div class="row" style="gap:10px;align-items:center"><span class="ico-sm hue hue-teal">' + S.icon('check') + '</span><strong style="min-width:0">' + esc(t('screen_home_h')) + '</strong></div>' +
      '<p class="small">' + esc(due.map((k) => tx(BY[k].name)).join(' · ')) + '</p><p class="small">' + esc(t('screen_home_p')) + '</p>' +
      '<div class="grid2"><button type="button" class="btn sm primary" data-go="screen-mine">' + esc(t('screen_home_go')) + '</button><button type="button" class="btn sm" id="screen-home-later">' + esc(t('screen_home_later')) + '</button></div></div>';
  }
  /* Home's setup card (Version 30): at 30 to 65, outside pregnancy, add her check-up dates. Done once both free 5-yearly
     check-ups have a date or "never", or she said later. */
  function setup() {
    if (!S.canSave() || S.cycle.isPregnant()) return null; const age = ageNow(); if (age == null || age < 30 || age > 65) return null;
    const sn = D().snooze; const later = okDate(sn) && sn > iso(S.today());
    /* after a birth, it comes after the birth's own set-ups */
    return { id: 'checkups', order: S.stageNow() === 'post' ? 58 : 25, title: t('screen_setup'), sub: t('screen_setup_s'), go: 'screen-mine', done: later || HOME_KEYS.every((k) => status(BY[k]).code !== 'add') };
  }
  function afterRender(v, r) {
    if (r !== 'home') return;
    const b = v.querySelector('#screen-home-later'); if (!b) return;
    b.addEventListener('click', () => { D().snooze = iso(S.addDays(S.today(), 60)); S.save(); S.render(); });
  }

  S.register({
    id: 'screen',
    demoPersona: 'asha',
    strings: { en: en, hi: hi },
    routes: { 'screen': renderHub, 'screen-mine': renderMine, 'screen-cervix': renderCervix, 'screen-hpv': renderHpv, 'screen-breast': renderBreast, 'screen-signs': renderSigns },
    open: ['screen', 'screen-mine', 'screen-cervix', 'screen-hpv', 'screen-breast', 'screen-signs'],
    tiles: [
      { section: 'screen', route: 'screen', title: 'screen_hub', sub: 'screen_hub_s', icon: 'heart', order: 10, gated: false, keywords: 'screening check-up checkup test cancer via pap hpv mammogram bp sugar ayushman arogya mandir जाँच चेक-अप कैंसर' },
      { section: 'screen', route: 'screen-mine', title: 'screen_mine', sub: 'screen_mine_s', icon: 'bell', order: 12, gated: false, keywords: 'my check-ups reminder due bp sugar diabetes thyroid hb eyes teeth bone density dexa' },
      { section: 'screen', route: 'screen-cervix', title: 'screen_cervix', sub: 'screen_cervix_s', icon: 'check', order: 14, gated: false, keywords: 'cervical cancer screening via vinegar pap smear hpv test speculum सर्वाइकल बच्चेदानी' },
      { section: 'screen', route: 'screen-hpv', title: 'screen_hpv', sub: 'screen_hpv_s', icon: SYRINGE, order: 16, gated: false, keywords: 'hpv vaccine gardasil cervavac daughter girl 14 school टीका' },
      { section: 'screen', route: 'screen-breast', title: 'screen_breast', sub: 'screen_breast_s', icon: 'ribbon', order: 18, gated: false, keywords: 'breast self exam lump mammogram cbe स्तन गाँठ' },
      { section: 'screen', route: 'screen-signs', place: 'help', title: 'screen_signs', sub: 'screen_signs_s', icon: 'help', order: 20, gated: true, keywords: 'cancer warning signs symptoms bleeding after menopause ovary bloating mouth ulcer tobacco लक्षण' }
    ],
    css: css,
    summary: summary,
    sample: sample,
    homeTop: homeTop,
    setup: setup,
    afterRender: afterRender,
    event: (name, p) => { if (name === 'log' && p && (p.type === 'start' || p.type === 'end') && (D().bse || {}).on && (D().bse || {}).mode === 'period') bseSync(); }
  });
})(window.Saathi);
