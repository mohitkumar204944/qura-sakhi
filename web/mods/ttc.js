/* Trying for a baby: before-pregnancy checklist, months-trying counter, fertility-signs log, tests and treatments (ART Act), a page for the partner, and repeated miscarriage. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const D = () => S.data('ttc');

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(S.one(s, v)).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol>';
  const dayY = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const dayS = (d) => S.fmtD(d, { day: 'numeric', month: 'short' });
  const mineRoute = (r) => r === 'ttc' || String(r).indexOf('ttc-') === 0;
  const askBtn = (topic) => '<button type="button" class="btn secondary block" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button>';
  const goBtn = (route, label, cls) => '<button type="button" class="btn ' + (cls || 'sm') + '" data-go="' + route + '">' + T(label) + '</button>';
  const card = (title, inner, cls) => '<div class="card' + (cls ? ' ' + cls : '') + '">' + (title ? '<h3>' + T(title) + '</h3>' : '') + inner + '</div>';
  const P = (o, cls) => '<p class="' + (cls || 'small') + '">' + T(o) + '</p>';
  const ext = (href, label) => '<a href="' + href + '" target="_blank" rel="noopener">' + T(label) + '</a>';
  const item = (route, ico, title, sub, gated) => '<button type="button" class="item" data-go="' + route + '"><span class="ico-sm">' + S.icon(ico) + '</span><span class="body"><strong>' + esc(typeof title === 'string' ? t(title) : tx(title)) + '</strong><span>' + esc(typeof sub === 'string' ? t(sub) : tx(sub)) + '</span></span>' + (gated && S.flags.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '</button>';
  const pregNote = () => (S.canSave() && (S.state.situation || {}).pregnant ? '<div class="card ok"><p class="ttc-p" style="color:var(--ok)">' + T({ en: 'You are marked as pregnant on the Me page. These pages are for while you are trying; the Pregnancy section is the one for you now.', hi: '“मैं” पन्ने पर आप गर्भवती के रूप में दर्ज हैं। ये पन्ने कोशिश के समय के लिए हैं; अब आपके लिए “गर्भावस्था” वाला हिस्सा है।' }) + '</p>' + goBtn('preg', { en: 'Open Pregnancy', hi: 'गर्भावस्था खोलें' }, 'sm ttc-start') + '</div>' : '');
  const urgent = (o) => '<div class="flag urgent"><span class="ttc-fi">' + S.I.help + '</span><span class="ttc-ft">' + T(o) + '</span></div>';

  /* Browse mode keeps ticks and dates in memory for this visit only; nothing is written to storage. */
  let temp = { owner: null, d: {} };
  const store = () => { if (S.canSave()) return D(); if (temp.owner !== S.state) temp = { owner: S.state, d: {} }; return temp.d; };
  const persist = () => { if (S.canSave()) S.save(); };

  /* Screen-only drafts (the signs form). Wiped when she leaves these pages. */
  let ui = null;
  const freshUi = () => { ui = { owner: S.state, cyc: 0, date: S.toISO(S.today()), temp: '', mucus: '', lh: '', fever: false }; };
  const own = () => { if (!ui || ui.owner !== S.state) freshUi(); };

  function monthsSince(iso) {
    const a = S.fromISO(iso), b = S.today();
    let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) m--;
    return Math.max(0, m);
  }
  function ageInfo(st) {
    const a = S.cycle.ageYears();
    if (a != null) return { age: a, band: a >= 40 ? '40' : (a >= 35 ? '35' : 'u35'), fromDiary: true };
    return { age: null, band: st.ageBand || '', fromDiary: false };
  }

  /* ---------- shared content ---------- */
  const ECTOPIC = { en: 'Period late or a positive test, with pain on one side of the lower belly, shoulder-tip pain, dizziness or fainting: call 112 now. This can be a pregnancy outside the womb (ectopic), which is more likely after tube damage.', hi: 'पीरियड देर से या test positive, और साथ में पेट के निचले हिस्से में एक तरफ़ दर्द, कंधे की नोक में दर्द, चक्कर या बेहोशी: अभी 112 पर कॉल करें। यह बच्चेदानी के बाहर ठहरा गर्भ (ectopic) हो सकता है, जिसका ख़तरा ट्यूब ख़राब होने के बाद ज़्यादा होता है।' };
  const BAMS = { en: "Qura's doctors are BAMS. They can order tests and help with cycles, weight, sleep and food. Ovulation tablets, IUI and IVF need an MBBS/MD gynaecologist; Qura refers you.", hi: 'Qura की डॉक्टर BAMS हैं। वे test लिख सकती हैं और चक्र, वज़न, नींद और खाने में मदद करती हैं। ओव्यूलेशन की गोलियाँ, IUI और IVF के लिए MBBS/MD स्त्री रोग विशेषज्ञ चाहिए; Qura आपको refer करता है।' };

  const FLAGS = [
    { k: 'irregular', en: 'Periods have stopped, or are very irregular (gaps often longer than 35 days)', hi: 'पीरियड बंद हैं, या बहुत अनियमित हैं (अक्सर 35 दिन से ज़्यादा का अंतर)' },
    { k: 'pcos', en: 'PMOS (PCOS) diagnosed by a doctor', hi: 'डॉक्टर ने PMOS (PCOS) बताया है' },
    { k: 'endo', en: 'Endometriosis diagnosed by a doctor', hi: 'डॉक्टर ने endometriosis बताया है' },
    { k: 'fibroids', en: 'Fibroids in the womb', hi: 'बच्चेदानी में fibroids (गाँठ)' },
    { k: 'pid', en: 'A past pelvic infection (PID), or a serious infection after a delivery, miscarriage or abortion', hi: 'पहले कभी पेडू का infection (PID), या डिलीवरी, गर्भ गिरने या गर्भपात के बाद गंभीर infection' },
    { k: 'tb', en: 'TB in the past, in any part of the body', hi: 'पहले कभी TB, शरीर के किसी भी हिस्से में' },
    { k: 'tubes', en: 'A past ectopic pregnancy, or surgery on the tubes, ovaries or womb', hi: 'पहले ectopic गर्भ (बच्चेदानी के बाहर), या ट्यूब, अंडाशय या बच्चेदानी की सर्जरी' },
    { k: 'partner', en: 'Partner has a known issue: low sperm count, mumps that affected the testes, surgery there, or trouble with erection or ejaculation', hi: 'पति या साथी में कोई जानी हुई दिक़्क़त: sperm कम, mumps का अंडकोष पर असर, वहाँ सर्जरी, या erection या वीर्य निकलने में परेशानी' },
    { k: 'loss2', en: 'Two or more miscarriages', hi: 'दो या ज़्यादा बार गर्भ गिरा है' }
  ];
  const AGE40 = { en: 'Age 40 or over', hi: 'उम्र 40 या ज़्यादा' };

  const PREP_HER = [
    { k: 'folic', en: 'Folic acid every day, from 3 months before trying', hi: 'कोशिश से 3 महीने पहले से रोज़ folic acid',
      den: "400 mcg (0.4 mg) once a day, until 12 weeks of pregnancy. It protects the baby's spine and brain, which form before most women know they are pregnant. Some women need a higher dose, for example after a pregnancy with a spine defect; your doctor decides. Ask the ANM or doctor at your Ayushman Arogya Mandir.",
      dhi: '400 mcg (0.4 mg) दिन में एक बार, गर्भ के 12 हफ़्ते पूरे होने तक। यह बच्चे की रीढ़ और दिमाग़ को बचाता है, जो ज़्यादातर महिलाओं को गर्भ का पता चलने से पहले ही बनने लगते हैं। कुछ महिलाओं को ज़्यादा खुराक चाहिए, जैसे पिछले गर्भ में रीढ़ की ख़राबी रही हो; यह आपकी डॉक्टर तय करेंगी। आयुष्मान आरोग्य मंदिर की ANM या डॉक्टर से पूछें।' },
    { k: 'hb', en: 'Haemoglobin (Hb) test', hi: 'हीमोग्लोबिन (Hb) की जाँच',
      den: 'Anaemia is common and is easier to fix before pregnancy than during it. Free at the Ayushman Arogya Mandir.', dhi: 'ख़ून की कमी आम है, और गर्भ से पहले इसे ठीक करना ज़्यादा आसान है। आयुष्मान आरोग्य मंदिर में मुफ़्त।' },
    { k: 'bg', en: 'Blood group and Rh', hi: 'Blood group और Rh',
      den: "If you are Rh negative, find out your partner's group too. You may need an anti-D injection in pregnancy; your doctor plans it.", dhi: 'अगर आप Rh negative हैं, तो पति या साथी का group भी पता करें। गर्भ में anti-D इंजेक्शन की ज़रूरत पड़ सकती है; यह आपकी डॉक्टर तय करेंगी।' },
    { k: 'sugar', en: 'Blood sugar test', hi: 'शुगर की जाँच',
      den: 'With PMOS, ask for the 2-hour glucose test (OGTT) before you start trying.', dhi: 'PMOS हो तो कोशिश शुरू करने से पहले 2 घंटे वाला glucose test (OGTT) माँगें।' },
    { k: 'tsh', en: 'Thyroid test (TSH)', hi: 'थायरॉइड की जाँच (TSH)',
      den: 'A thyroid that works too little or too much can upset periods and egg release. It is treatable.', dhi: 'थायरॉइड कम या ज़्यादा काम करे तो पीरियड और अंडा निकलना गड़बड़ा सकता है। इसका इलाज है।' },
    { k: 'infect', en: 'HIV, syphilis and hepatitis B tests, for both of you', hi: 'HIV, syphilis और hepatitis B की जाँच, आप दोनों की',
      den: 'All three can pass to the baby, and for all three the baby can be protected. Free at government centres. HIV and STI helpline: 1097.', dhi: 'तीनों बच्चे तक पहुँच सकते हैं, और तीनों में बच्चे को बचाया जा सकता है। सरकारी केंद्रों पर मुफ़्त। HIV और STI हेल्पलाइन: 1097।' },
    { k: 'thal', en: 'Thalassaemia carrier test (HPLC)', hi: 'Thalassaemia carrier की जाँच (HPLC)',
      den: 'A carrier is healthy and usually does not know it. If both partners are carriers, each pregnancy has a 1 in 4 chance of a child with thalassaemia major. The usual test is HPLC. If you are a carrier, your partner is tested next.', dhi: 'Carrier पूरी तरह स्वस्थ होती है और अक्सर उसे पता भी नहीं होता। अगर दोनों साथी carrier हों, तो हर गर्भ में 4 में से 1 संभावना होती है कि बच्चे को thalassaemia major हो। आम जाँच HPLC है। आप carrier निकलें तो फिर पति या साथी की जाँच होती है।' },
    { k: 'rubella', en: 'Rubella (German measles) protection', hi: 'Rubella (जर्मन खसरा) से बचाव',
      den: 'A blood test (rubella IgG) shows whether you are protected. If not, you can get an MR or MMR vaccine; WHO advises not getting pregnant for 1 month after it. Never take it once you are pregnant.', dhi: 'एक blood test (rubella IgG) बताता है कि आप सुरक्षित हैं या नहीं। अगर नहीं, तो MR या MMR का टीका लग सकता है; WHO की सलाह है कि टीके के बाद 1 महीने तक गर्भ न ठहरे। गर्भ ठहरने के बाद यह टीका कभी न लगवाएँ।' },
    { k: 'bmi', en: 'Weight and BMI check', hi: 'वज़न और BMI की जाँच',
      den: "Being very thin or quite heavy can both stop eggs from being released. Steady changes in food, sleep and walking help; crash diets don't.", dhi: 'बहुत दुबला होना या वज़न काफ़ी ज़्यादा होना, दोनों से अंडा निकलना रुक सकता है। खाने, नींद और पैदल चलने में धीरे-धीरे बदलाव मदद करता है; अचानक बहुत कम खाना नहीं।' },
    { k: 'dental', en: 'Dental check-up', hi: 'दाँतों की जाँच',
      den: 'Gum problems often get worse in pregnancy. Get cleaning and fillings done now.', dhi: 'गर्भ में मसूड़ों की दिक़्क़त अक्सर बढ़ जाती है। सफ़ाई और filling अभी करा लें।' },
    { k: 'tobacco', en: 'Stop tobacco, gutka, smoking and alcohol', hi: 'तंबाकू, गुटखा, सिगरेट और शराब बंद',
      den: 'They lower the chance of pregnancy and harm the baby. Free help to quit: National Tobacco Quitline 1800-11-2356.', dhi: 'इनसे गर्भ ठहरने की संभावना घटती है और बच्चे को नुक़सान होता है। छोड़ने में मुफ़्त मदद: National Tobacco Quitline 1800-11-2356।' },
    { k: 'meds', en: 'Review your regular medicines with a doctor', hi: 'रोज़ की दवाएँ डॉक्टर को दिखाएँ',
      den: 'Some medicines for fits, BP, acne or skin are not safe in pregnancy. Do not stop on your own; ask the doctor who prescribed them about a switch.', dhi: 'दौरे, BP, मुँहासे या त्वचा की कुछ दवाएँ गर्भ में सुरक्षित नहीं होतीं। ख़ुद से बंद न करें; जिस डॉक्टर ने लिखी हैं, उनसे दवा बदलने के बारे में पूछें।' },
    { k: 'control', en: 'PMOS, thyroid, diabetes and BP under control', hi: 'PMOS, थायरॉइड, डायबिटीज़ और BP क़ाबू में',
      den: 'Pregnancy goes more smoothly when these are steady before you start.', dhi: 'शुरू करने से पहले ये क़ाबू में हों तो गर्भ ज़्यादा आराम से चलता है।' }
  ];
  const PREP_HIM = [
    { k: 'p_tests', en: 'His HIV, syphilis and hepatitis B tests, and HPLC if you are a thalassaemia carrier', hi: 'उनकी HIV, syphilis और hepatitis B जाँच, और आप thalassaemia carrier हों तो उनकी HPLC',
      den: 'Same tests, same free government centres.', dhi: 'वही जाँचें, वही मुफ़्त सरकारी केंद्र।' },
    { k: 'p_tobacco', en: 'He stops tobacco and cuts down alcohol', hi: 'वे तंबाकू छोड़ें और शराब कम करें',
      den: 'Both lower sperm count and quality. Sperm take about 2–3 months to form, so start now.', dhi: 'दोनों से sperm की गिनती और गुणवत्ता घटती है। Sperm बनने में लगभग 2–3 महीने लगते हैं, इसलिए अभी से शुरू करें।' },
    { k: 'p_meds', en: 'He checks his medicines with a doctor', hi: 'वे अपनी दवाएँ डॉक्टर को दिखाएँ',
      den: 'Muscle-building steroids and testosterone can stop sperm production.', dhi: 'Muscle बनाने वाले steroids और testosterone से sperm बनना रुक सकता है।' },
    { k: 'p_read', en: 'He has read the partner page', hi: 'उन्होंने साथी वाला पन्ना पढ़ लिया है',
      den: 'Semen test, heat, tobacco, medicines: see "For your partner".', dhi: 'Semen test, गर्मी, तंबाकू, दवाएँ: “पति या साथी के लिए” पन्ना देखें।' }
  ];
  const PREP_ALL = PREP_HER.concat(PREP_HIM);
  const prepDone = (st) => PREP_ALL.filter((x) => (st.prep || {})[x.k]).length;
  /* Version 38: the trying-for-a-baby plan's results (plan.js) */
  /* Version 39.5: did she tick anything on that day? (read only) */
  const prepOn = (iso) => { const at = (((S.state.mods || {}).ttc) || {}).prepAt || {}; return Object.keys(at).some((k) => at[k] === iso); };
  /* Version 39.6: is it time for a doctor check, by her own dates and answers (the months-of-trying page's own rule)? */
  const tryingNow = () => { const sit = S.state.situation || {}; if (!S.canSave() || !sit.planning || sit.pregnant) return null; const st = store(); if (!st.since) return null;   /* review DOCTOR-09: only while she is trying */ const r = tryingState(st); return { now: !!r.now, months: r.months, reasons: r.reasons.length > 0 }; };
  /* review FIXES-10: the day she ticked her latest checklist item */
  const prepLast = () => { const at = (((S.state.mods || {}).ttc) || {}).prepAt || {}; return Object.keys(at).map((k) => at[k]).filter(Boolean).sort().pop() || null; };
  S.ttc = Object.assign(S.ttc || {}, { prepDone: () => ({ a: prepDone(store()), b: PREP_ALL.length }), prepOn: prepOn, prepLast: prepLast, tryingNow: tryingNow });

  const MUCUS = [
    { k: 'dry', en: 'Dry', hi: 'सूखा', den: 'nothing felt or seen', dhi: 'कुछ महसूस या दिखा नहीं' },
    { k: 'sticky', en: 'Sticky', hi: 'चिपचिपा', den: 'thick, breaks easily', dhi: 'गाढ़ा, आसानी से टूटता' },
    { k: 'creamy', en: 'Creamy', hi: 'क्रीम जैसा', den: 'white, like lotion', dhi: 'सफ़ेद, लोशन जैसा' },
    { k: 'watery', en: 'Watery', hi: 'पानी जैसा', den: 'wet and thin', dhi: 'गीला और पतला' },
    { k: 'eggwhite', en: 'Egg-white', hi: 'अंडे की सफ़ेदी जैसा', den: 'clear, slippery, stretches between fingers', dhi: 'साफ़, चिकना, उँगलियों के बीच खिंचता' }
  ];
  const mIdx = (k) => MUCUS.findIndex((x) => x.k === k);
  const mName = (k) => { const m = MUCUS[mIdx(k)]; return m ? tx(m) : ''; };

  /* ---------- months-trying maths (counts only; the rule is the doctors' rule, shown with its reasons) ---------- */
  function tryingState(st) {
    const sit = S.state.situation || {};
    const has = (k) => !!((st.flags || {})[k] || (k === 'pcos' && sit.pcos));
    const ai = ageInfo(st);
    const reasons = FLAGS.filter((f) => has(f.k)).map((f) => tx(f));
    if (ai.band === '40') reasons.push(tx(AGE40));
    const months = st.since ? monthsSince(st.since) : null;
    const limit = reasons.length ? 0 : (ai.band === '35' ? 6 : 12);
    return { has: has, ai: ai, reasons: reasons, months: months, limit: limit, now: reasons.length > 0 || (months != null && months >= limit) };
  }
  function cycleEntries(st, from, to) {
    const sg = st.signs || {}; const a = S.toISO(from), b = S.toISO(to);
    return Object.keys(sg).filter((k) => k >= a && k <= b).sort().map((k) => Object.assign({ d: k }, sg[k]));
  }
  function thisCycleCount(st) {
    const ls = S.cycle.lastStart(); if (!ls) return 0;
    return cycleEntries(st, ls, S.today()).filter((e) => e.c != null).length;
  }

  /* ---------- hub ---------- */
  function renderHub(v) {
    const st = store(); const sit = S.state.situation || {};
    let top = '';
    if (S.canSave() && st.since) {
      const m = monthsSince(st.since);
      top = '<div class="card"><div class="eyebrow">' + T({ en: 'You', hi: 'आप' }) + '</div><h2>' + esc(fill(t('ttc_month'), { n: m + 1 })) + '</h2><dl class="kv"><dt>' + T({ en: 'Trying since', hi: 'कोशिश कब से' }) + '</dt><dd>' + esc(dayY(S.fromISO(st.since))) + '</dd><dt>' + T({ en: 'Checklist done', hi: 'चेकलिस्ट पूरी' }) + '</dt><dd class="num">' + prepDone(st) + ' / ' + PREP_ALL.length + '</dd><dt>' + T({ en: 'Temperatures this cycle', hi: 'इस चक्र में तापमान' }) + '</dt><dd class="num">' + thisCycleCount(st) + '</dd></dl>' + goBtn('ttc-trying', { en: 'When to see a doctor', hi: 'डॉक्टर को कब दिखाएँ' }) + '</div>';
    } else if (S.canSave()) {
      top = '<div class="card soft"><p style="color:var(--fg)">' + T({ en: 'Already trying? Add the date you started and we will count it for you, with the time doctors suggest for your age.', hi: 'कोशिश शुरू कर दी है? शुरू करने की तारीख़ डालें, हम महीने गिनेंगे और बताएँगे कि आपकी उम्र में डॉक्टर कब तक इंतज़ार की सलाह देते हैं।' }) + '</p>' + goBtn('ttc-trying', { en: 'Count my months', hi: 'मेरे महीने गिनें' }) + '</div>';
    }
    const planNote = S.canSave() && !sit.planning && !sit.pregnant ? '<div class="card soft"><p class="small">' + T({ en: 'Tip: switch on "Planning a baby" on the Me page. Your doctor then sees it, and your Today page shows your months of trying.', hi: 'सुझाव: “मैं” पन्ने पर “बच्चे की योजना” चालू करें। तब आपकी डॉक्टर को यह दिखेगा, और “आज” पन्ने पर कोशिश के महीने दिखेंगे।' }) + '</p>' + goBtn('me', { en: 'Open Me', hi: '“मैं” खोलें' }) + '</div>' : '';
    const pmos = sit.pcos ? card({ en: 'With PMOS', hi: 'PMOS के साथ' }, P({ en: "With PMOS, an egg may not be released every month, so there is no need to wait a year. See a gynaecologist when you start trying. Ovulation tablets help many women with PMOS; they need a gynaecologist's prescription and scans.", hi: 'PMOS में हर महीने अंडा निकलना ज़रूरी नहीं, इसलिए साल भर इंतज़ार की ज़रूरत नहीं। कोशिश शुरू करते ही स्त्री रोग विशेषज्ञ को दिखाएँ। ओव्यूलेशन की गोलियाँ PMOS वाली कई महिलाओं की मदद करती हैं; इनके लिए स्त्री रोग विशेषज्ञ का पर्चा और scan ज़रूरी हैं।' }, 'ttc-p'), 'warn') : '';
    v.innerHTML = S.backRow(t('ttc_hub'), 'care', false) +
      P({ en: 'For couples planning a pregnancy or trying now. A few checks and folic acid before you start make a real difference. Nothing here is a diagnosis.', hi: 'उन जोड़ों के लिए जो गर्भ की योजना बना रहे हैं या कोशिश कर रहे हैं। शुरू करने से पहले कुछ जाँचें और folic acid सच में फ़र्क़ डालते हैं। यहाँ कुछ भी diagnosis नहीं है।' }) +
      pregNote() + top + pmos +
      '<div class="list">' + item('ttc-prep', 'check', 'ttc_prep', 'ttc_prep_s') + item('ttc-trying', 'clock', 'ttc_trying', 'ttc_trying_s', true) + item('fertile', 'flower', 'fertile', 'fertile_d', true) + item('ttc-signs', 'chart', 'ttc_signs', 'ttc_signs_s') + item('ttc-tests', 'file', 'ttc_tests', 'ttc_tests_s') + item('ttc-partner', 'users', 'ttc_partner', 'ttc_partner_s') + item('ttc-loss2', 'heart', 'ttc_loss2', 'ttc_loss2_s') + '</div>' +
      card({ en: 'Good to know', hi: 'जानने लायक़' }, ul([
        { en: 'When the woman is under 40, more than 8 in 10 couples get pregnant within a year of regular sex without contraception, and more than 9 in 10 within two years.', hi: 'जब महिला की उम्र 40 से कम हो, तो बिना गर्भनिरोध के नियमित संबंध से 10 में से 8 से ज़्यादा जोड़ों को एक साल में गर्भ ठहर जाता है, और 10 में से 9 से ज़्यादा को दो साल में।' },
        { en: 'Sex every 2–3 days, all through the cycle, gives the best chance. There is no need to aim for one exact day.', hi: 'पूरे चक्र में हर 2–3 दिन में संबंध सबसे अच्छी संभावना देता है। किसी एक ख़ास दिन को पकड़ने की ज़रूरत नहीं।' },
        { en: "It is a question for both partners. The man's semen test is one of the first tests, not the last.", hi: 'यह दोनों साथियों का सवाल है। पुरुष का semen test पहली जाँचों में से है, आख़िरी नहीं।' },
        { en: 'Your ASHA, the ANM and the Ayushman Arogya Mandir can do several of the checks free.', hi: 'आपकी ASHA, ANM और आयुष्मान आरोग्य मंदिर कई जाँचें मुफ़्त कर सकते हैं।' }
      ])) +
      planNote + urgent(ECTOPIC) +
      P(BAMS, 'note') + askBtn({ en: 'Trying for a baby', hi: 'बच्चे की कोशिश' });
    S.wire(v);
  }

  /* ---------- before you start: checklist ---------- */
  function prepRow(x, st) {
    const on = !!(st.prep || {})[x.k];
    return '<label class="' + (on ? 'done' : '') + '"><input type="checkbox" data-prep="' + x.k + '"' + (on ? ' checked' : '') + '><span class="ttc-lab"><strong>' + T(x) + '</strong><span class="small">' + T({ en: x.den, hi: x.dhi }) + '</span></span></label>';
  }
  function renderPrep(v) {
    const st = store(); st.prep = st.prep || {};
    const count = () => '<span class="num">' + prepDone(st) + '</span> / ' + PREP_ALL.length;
    v.innerHTML = S.backRow(t('ttc_prep'), 'ttc', false) +
      P({ en: 'Ideally 3 months before you start trying. Tick what is done; it stays on this phone. Nothing is scored.', hi: 'हो सके तो कोशिश शुरू करने से 3 महीने पहले। जो हो गया उस पर टिक करें; यह इसी फ़ोन पर रहता है। कुछ भी score नहीं होता।' }) +
      '<div class="card soft ttc-prog"><div class="row spread"><strong>' + T({ en: 'Done', hi: 'पूरे' }) + '</strong><span id="ttc-count">' + count() + '</span></div><div class="ttc-bar"><i id="ttc-fillbar" style="width:' + Math.round((prepDone(st) / PREP_ALL.length) * 100) + '%"></i></div></div>' +
      '<h2>' + T({ en: 'For you', hi: 'आपके लिए' }) + '</h2><div class="checklist">' + PREP_HER.map((x) => prepRow(x, st)).join('') + '</div>' +
      '<h2>' + T({ en: 'For your partner', hi: 'पति या साथी के लिए' }) + '</h2><div class="checklist">' + PREP_HIM.map((x) => prepRow(x, st)).join('') + '</div>' +
      goBtn('ttc-partner', { en: 'Open the partner page', hi: 'साथी वाला पन्ना खोलें' }, 'block') +
      card({ en: 'Where these checks are free', hi: 'ये जाँचें मुफ़्त कहाँ हैं' }, ul([
        { en: 'Ayushman Arogya Mandir (sub-centre or PHC): Hb, sugar, HIV, hepatitis B and syphilis tests are on the government free-test list; blood group at the PHC.', hi: 'आयुष्मान आरोग्य मंदिर (sub-centre या PHC): Hb, शुगर, HIV, hepatitis B और syphilis की जाँच सरकार की मुफ़्त जाँच सूची में हैं; blood group PHC पर।' },
        { en: 'Bigger government hospitals (CHC, sub-district or district): thyroid, hormone tests, rubella IgG and HPLC are on the list there.', hi: 'बड़े सरकारी अस्पताल (CHC, उप-ज़िला या ज़िला अस्पताल): थायरॉइड, हॉर्मोन की जाँचें, rubella IgG और HPLC वहाँ की सूची में हैं।' },
        { en: 'What a lab actually has varies by state and day, so ask the ANM or the lab first. Your ASHA can take you.', hi: 'किस lab में असल में क्या है, यह राज्य और दिन के हिसाब से बदलता है, इसलिए पहले ANM या lab से पूछें। आपकी ASHA साथ जा सकती हैं।' }
      ])) +
      (S.canSave() ? '' : S.needDiary()) +
      askBtn({ en: 'Before-pregnancy check', hi: 'गर्भ से पहले की जाँच' });
    S.wire(v);
    v.querySelectorAll('[data-prep]').forEach((c) => c.addEventListener('change', () => {
      st.prep[c.dataset.prep] = c.checked; if (!c.checked) delete st.prep[c.dataset.prep];
      st.prepAt = st.prepAt || {}; if (c.checked) st.prepAt[c.dataset.prep] = S.toISO(S.today()); else delete st.prepAt[c.dataset.prep]; persist();   /* Version 39.5 */
      c.closest('label').classList.toggle('done', c.checked);
      const n = v.querySelector('#ttc-count'); if (n) n.innerHTML = count();
      const b = v.querySelector('#ttc-fillbar'); if (b) b.style.width = Math.round((prepDone(st) / PREP_ALL.length) * 100) + '%';
    }));
  }

  /* ---------- months of trying (gated: it applies a rule to her data) ---------- */
  function resultHtml(st) {
    const r = tryingState(st); const m = r.months; let out = '';
    if (r.reasons.length) {
      out = '<div class="card dark"><h3>' + T({ en: 'See a gynaecologist now. No need to wait 12 months.', hi: 'अभी स्त्री रोग विशेषज्ञ को दिखाएँ। 12 महीने इंतज़ार की ज़रूरत नहीं।' }) + '</h3><p class="small" style="color:var(--dark-text)">' + T({ en: 'Because you ticked:', hi: 'क्योंकि आपने चुना:' }) + '</p><ul style="color:var(--dark-text)">' + r.reasons.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="small" style="color:var(--dark-text)">' + T({ en: 'Doctors check these sooner because waiting does not help and some take time to treat. This is the usual rule, not a judgement about your fertility.', hi: 'डॉक्टर इन हालात में जल्दी जाँच करते हैं, क्योंकि इंतज़ार से फ़ायदा नहीं होता और कुछ के इलाज में समय लगता है। यह आम नियम है, आपकी fertility के बारे में कोई फ़ैसला नहीं।' }) + '</p></div>';
    } else {
      const lim = r.limit; const head = !r.ai.band
        ? { en: 'Under 35, doctors suggest tests after 12 months of trying; at 35–39, after 6. Pick your age above.', hi: '35 से कम उम्र में डॉक्टर 12 महीने की कोशिश के बाद जाँच की सलाह देते हैं; 35–39 में 6 महीने बाद। ऊपर अपनी उम्र चुनें।' }
        : (lim === 6
          ? { en: 'At 35–39, doctors suggest tests after 6 months of trying.', hi: '35–39 की उम्र में डॉक्टर 6 महीने की कोशिश के बाद जाँच की सलाह देते हैं।' }
          : { en: 'Under 35, doctors suggest tests after 12 months of trying.', hi: '35 से कम उम्र में डॉक्टर 12 महीने की कोशिश के बाद जाँच की सलाह देते हैं।' });
      let body = '';
      if (m == null) body = P({ en: 'Add the date you started trying to see where you are.', hi: 'आप कहाँ हैं, यह देखने के लिए कोशिश शुरू करने की तारीख़ डालें।' });
      else if (m >= lim) body = '<p style="color:var(--fg)">' + esc(fill(tx({ en: 'You have been trying for {n} months. Book a visit now, and go together.', hi: 'आप {n} महीने से कोशिश कर रही हैं। अब डॉक्टर से मिलने का समय लें, और साथ जाएँ।' }), { n: m })) + '</p>';
      else body = '<p style="color:var(--fg)">' + esc(fill(tx({ en: '{n} more months to the {l}-month mark. You can go earlier any time you feel worried.', hi: '{l} महीने पूरे होने में {n} महीने बाक़ी। चिंता हो तो कभी भी पहले जा सकती हैं।' }), { n: lim - m, l: lim })) + '</p>';
      const bar = m == null ? '' : '<div class="ttc-bar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round((m / lim) * 100)) + '%"></i></div><div class="row spread small"><span class="num">0</span><span class="num">' + lim + ' ' + T({ en: 'months', hi: 'महीने' }) + '</span></div>';
      out = '<div class="card ' + (m != null && m >= lim ? 'warn' : 'soft') + '"><h3>' + T(head) + '</h3>' + bar + body + P({ en: 'None of the reasons above applies, going by what you ticked.', hi: 'आपने जो चुना, उसके हिसाब से ऊपर की कोई वजह लागू नहीं होती।' }) + '</div>';
    }
    return out;
  }
  function renderTrying(v) {
    const st = store(); st.flags = st.flags || {}; const sit = S.state.situation || {};
    const r = tryingState(st); const ai = r.ai;
    const since = st.since ? S.fromISO(st.since) : null;
    const counter = since
      ? '<div class="row spread" style="align-items:flex-end"><div><div class="eyebrow">' + T({ en: 'Months of trying', hi: 'कोशिश के महीने' }) + '</div><div class="ttc-big num">' + r.months + '</div></div><span class="pill accent">' + esc(fill(t('ttc_month'), { n: r.months + 1 })) + '</span></div><p class="small">' + esc(fill(tx({ en: 'Since {d}. Counted from the month you stopped contraception and started having sex regularly.', hi: '{d} से। उस महीने से गिना गया जब आपने गर्भनिरोध बंद किया और नियमित संबंध शुरू किए।' }), { d: dayY(since) })) + '</p>'
      : P({ en: 'Count from the month you stopped contraception and started having sex regularly.', hi: 'उस महीने से गिनें जब आपने गर्भनिरोध बंद किया और नियमित संबंध शुरू किए।' });
    const ageRow = ai.fromDiary
      ? '<p class="small">' + esc(fill(tx({ en: 'Your age: {a} (from your diary).', hi: 'आपकी उम्र: {a} (डायरी से)।' }), { a: ai.age })) + '</p>'
      : '<div class="stack"><label>' + T({ en: 'Your age', hi: 'आपकी उम्र' }) + '</label><div class="chips">' + [['u35', { en: 'Under 35', hi: '35 से कम' }], ['35', { en: '35–39', hi: '35–39' }], ['40', { en: '40 or over', hi: '40 या ज़्यादा' }]].map((x) => '<button type="button" class="chip' + (ai.band === x[0] ? ' on' : '') + '" data-age="' + x[0] + '">' + T(x[1]) + '</button>').join('') + '</div></div>';
    const flagRows = FLAGS.map((f) => {
      const fromSit = f.k === 'pcos' && sit.pcos; const on = r.has(f.k);
      return '<label class="' + (on ? '' : '') + '"><input type="checkbox" data-flag="' + f.k + '"' + (on ? ' checked' : '') + (fromSit ? ' disabled' : '') + '><span class="ttc-lab"><span>' + T(f) + '</span>' + (fromSit ? '<span class="small">' + T({ en: 'From My situation on the Me page', hi: '“मैं” पन्ने की “मेरी स्थिति” से' }) + '</span>' : '') + '</span></label>';
    }).join('');
    v.innerHTML = S.backRow(t('ttc_trying'), 'ttc', true) +
      P({ en: 'Counts your months of trying and shows the rule doctors use for when to get checked. It does not judge your fertility and is not a diagnosis.', hi: 'आपकी कोशिश के महीने गिनता है और बताता है कि डॉक्टर जाँच के लिए कौन-सा नियम मानते हैं। यह आपकी fertility का फ़ैसला नहीं करता और diagnosis नहीं है।' }) +
      pregNote() +
      '<div class="card">' + counter + '<label for="ttc-since">' + T({ en: 'Started trying on', hi: 'कोशिश शुरू की' }) + '</label><div class="row"><input type="date" id="ttc-since" max="' + S.toISO(S.today()) + '" value="' + esc(st.since || '') + '" style="flex:1"><button type="button" class="btn sm" id="ttc-since-set">' + esc(t('set')) + '</button></div>' + (st.since ? '<button type="button" class="btn ghost sm ttc-start" id="ttc-since-clear">' + T({ en: 'Clear the date', hi: 'तारीख़ हटाएँ' }) + '</button>' : '') + '</div>' +
      '<div class="card"><h3>' + T({ en: 'Does any of this apply to you?', hi: 'क्या इनमें से कुछ आप पर लागू होता है?' }) + '</h3>' + ageRow + '<div class="checklist">' + flagRows + '</div></div>' +
      '<div id="ttc-res">' + resultHtml(st) + '</div>' +
      card({ en: 'Who to see, and what to take', hi: 'किसे दिखाएँ, और क्या साथ ले जाएँ' }, steps([
        { en: 'Start at the gynaecology OPD of your district hospital or a government medical college. Your ASHA or ANM can tell you the nearest one.', hi: 'ज़िला अस्पताल या सरकारी medical college की स्त्री रोग OPD से शुरू करें। आपकी ASHA या ANM सबसे पास वाली जगह बता सकती हैं।' },
        { en: 'Go together. His semen test is one of the first tests, not the last.', hi: 'साथ जाएँ। उनका semen test पहली जाँचों में से है, आख़िरी नहीं।' },
        { en: 'Take this diary, old reports, scan reports and a list of the medicines you both take.', hi: 'यह डायरी, पुरानी reports, scan reports और आप दोनों की दवाओं की सूची साथ ले जाएँ।' },
        { en: "Ovulation tablets, IUI and IVF are started by an MBBS/MD gynaecologist after tests. Do not start them on a chemist's or a relative's advice.", hi: 'ओव्यूलेशन की गोलियाँ, IUI और IVF जाँच के बाद MBBS/MD स्त्री रोग विशेषज्ञ ही शुरू करते हैं। केमिस्ट या रिश्तेदार की सलाह पर शुरू न करें।' }
      ])) +
      goBtn('ttc-tests', { en: 'Which tests, and what they mean', hi: 'कौन-सी जाँचें, और उनका मतलब' }, 'block') +
      (S.canSave() ? '' : S.needDiary()) +
      askBtn(r.months != null ? fill(tx({ en: 'Trying for a baby for {n} months', hi: '{n} महीने से बच्चे की कोशिश' }), { n: r.months }) : { en: 'Trying for a baby', hi: 'बच्चे की कोशिश' }) +
      P(BAMS, 'footnote');
    S.wire(v);
    const redrawRes = () => { const box = v.querySelector('#ttc-res'); if (box) { box.innerHTML = resultHtml(st); S.wire(box); } };
    v.querySelector('#ttc-since-set').addEventListener('click', () => {
      const val = v.querySelector('#ttc-since').value;
      if (!val) { S.toast(tx({ en: 'Pick a date first.', hi: 'पहले तारीख़ चुनें।' })); return; }
      if (S.fromISO(val) > S.today()) { S.toast(tx({ en: 'That date is in the future.', hi: 'यह तारीख़ आगे की है।' })); return; }
      st.since = val; persist(); S.toast(t('saved')); S.render();
    });
    const clr = v.querySelector('#ttc-since-clear'); if (clr) clr.addEventListener('click', () => { delete st.since; persist(); S.render(); });
    v.querySelectorAll('[data-flag]').forEach((c) => c.addEventListener('change', () => { if (c.checked) st.flags[c.dataset.flag] = true; else delete st.flags[c.dataset.flag]; persist(); redrawRes(); }));
    v.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => {
      st.ageBand = st.ageBand === b.dataset.age ? '' : b.dataset.age; persist();
      v.querySelectorAll('[data-age]').forEach((x) => x.classList.toggle('on', x.dataset.age === st.ageBand)); redrawRes();
    }));
  }

  /* ---------- fertility signs: data only ---------- */
  const conv = (c, unit) => (unit === 'F' ? c * 9 / 5 + 32 : c);
  const fmtT = (c, unit) => conv(c, unit).toFixed(2) + (unit === 'F' ? ' °F' : ' °C');
  function windows() {
    const st = S.cycle.starts(); const td = S.today(); const out = [];
    if (st.length) {
      const cur = S.fromISO(st[st.length - 1]);
      if (cur <= td) out.push({ from: cur, to: td, cur: true });
      if (st.length >= 2) out.push({ from: S.fromISO(st[st.length - 2]), to: S.addDays(cur, -1), cur: false });
    }
    if (!out.length) out.push({ from: S.addDays(td, -34), to: td, cur: true, noStart: true });
    return out;
  }
  function chartSvg(w, entries, unit) {
    const len = S.diffDays(w.from, w.to) + 1; const MAXD = 70; const off = Math.max(0, len - MAXD);
    const slots = Math.max(28, Math.min(MAXD, len)); const W = 320, L = 50, R = 6, top = 8, H = 112;   /* L: room for the row labels at 13 px */
    const rowM = top + H + 18, rowL = rowM + 16, xl = rowL + 20, VH = xl + 4;
    const step = (W - L - R) / slots; const X = (i) => L + step * (i + 0.5); const rr = Math.min(3.4, step * 0.42);
    const pts = entries.map((e) => Object.assign({ i: S.diffDays(w.from, S.fromISO(e.d)) - off }, e)).filter((e) => e.i >= 0 && e.i < slots);
    const bbt = (e) => e.c != null && e.c < 37.75;   /* a fever reading (100 °F / 37.8 °C or more) is not a resting temperature: not drawn */
    const temps = pts.filter(bbt).map((e) => conv(e.c, unit));
    const g0 = unit === 'F' ? 0.5 : 0.2; const minSpan = unit === 'F' ? 1.5 : 0.8;
    let lo = temps.length ? Math.min.apply(null, temps) : (unit === 'F' ? 97.3 : 36.3); let hi = temps.length ? Math.max.apply(null, temps) : (unit === 'F' ? 98.6 : 37.0);
    if (hi - lo < minSpan) { const c = (hi + lo) / 2; lo = c - minSpan / 2; hi = c + minSpan / 2; }
    let gs = g0; while ((hi - lo) / gs > 6) gs *= 2;
    lo = Math.floor(lo / gs + 1e-9) * gs; hi = Math.ceil(hi / gs - 1e-9) * gs; if (hi <= lo) hi = lo + gs;
    const Y = (val) => top + H - ((val - lo) / (hi - lo)) * H;
    let s = '';
    for (let val = lo; val <= hi + 1e-6; val += gs) { const y = Y(val).toFixed(1); s += '<line class="gd" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 4) + '" y="' + (parseFloat(y) + 3.5).toFixed(1) + '" text-anchor="end">' + val.toFixed(1) + '</text>'; }
    if (w.cur && !w.noStart) { const ti = S.diffDays(w.from, S.today()) - off; if (ti >= 0 && ti < slots) s += '<line class="td" x1="' + X(ti).toFixed(1) + '" x2="' + X(ti).toFixed(1) + '" y1="' + top + '" y2="' + (rowL + 6) + '"/>'; }
    const tp = pts.filter(bbt);
    if (tp.length > 1) s += '<polyline class="ln" points="' + tp.map((e) => X(e.i).toFixed(1) + ',' + Y(conv(e.c, unit)).toFixed(1)).join(' ') + '"/>';
    tp.forEach((e) => { s += '<circle class="pt" cx="' + X(e.i).toFixed(1) + '" cy="' + Y(conv(e.c, unit)).toFixed(1) + '" r="2.6"/>'; });
    s += '<line class="gd" x1="' + L + '" x2="' + (W - R) + '" y1="' + (rowM - 9) + '" y2="' + (rowM - 9) + '"/>';
    s += '<text x="' + (L - 4) + '" y="' + (rowM + 3.5) + '" text-anchor="end">' + esc(t('ttc_s_mucus_short')) + '</text><text x="' + (L - 4) + '" y="' + (rowL + 3.5) + '" text-anchor="end">LH</text>';
    pts.forEach((e) => {
      const mi = mIdx(e.m); if (mi >= 0) s += '<circle class="ttc-m' + mi + '" cx="' + X(e.i).toFixed(1) + '" cy="' + rowM + '" r="' + (mi === 4 ? rr : rr * 0.85).toFixed(1) + '"/>';
      if (e.lh === 'pos') { const x = X(e.i); s += '<path class="ttc-lhp" d="M' + x.toFixed(1) + ' ' + (rowL - 4) + 'l3.5 4 -3.5 4 -3.5 -4z"/>'; }
      else if (e.lh === 'neg') { const x = X(e.i); s += '<line class="ttc-lhn" x1="' + (x - 2.5).toFixed(1) + '" x2="' + (x + 2.5).toFixed(1) + '" y1="' + rowL + '" y2="' + rowL + '"/>'; }
    });
    if (w.noStart) {
      [0, 14, 28].filter((i) => i < slots).forEach((i) => { s += '<text x="' + X(i).toFixed(1) + '" y="' + xl + '" text-anchor="middle">' + esc(dayS(S.addDays(w.from, i))) + '</text>'; });
    } else {
      const ticks = [0]; for (let d = 7; d <= slots; d += 7) ticks.push(d - 1);
      ticks.forEach((i) => { s += '<text x="' + X(i).toFixed(1) + '" y="' + xl + '" text-anchor="middle">' + (i + 1 + off) + '</text>'; });
    }
    return '<svg class="ttc-chart" viewBox="0 0 ' + W + ' ' + VH + '" role="img" aria-label="' + esc(tx({ en: 'Waking temperature by cycle day, with mucus and LH rows', hi: 'चक्र के दिन के हिसाब से सुबह का तापमान, म्यूकस और LH की पंक्तियों के साथ' })) + '">' + s + '</svg>';
  }
  const dot = (mi) => '<svg viewBox="0 0 12 12" aria-hidden="true"><circle class="ttc-m' + mi + '" cx="6" cy="6" r="' + (mi === 4 ? 4.5 : 4) + '"/></svg>';
  function chartBox(st) {
    own(); const ws = windows(); if (ui.cyc >= ws.length) ui.cyc = 0; const w = ws[ui.cyc]; const unit = st.unit === 'F' ? 'F' : 'C';
    const entries = cycleEntries(st, w.from, w.to);
    const chips = ws.length > 1 ? '<div class="chips">' + ws.map((x, i) => '<button type="button" class="chip' + (i === ui.cyc ? ' on' : '') + '" data-cyc="' + i + '">' + T(x.cur ? { en: 'This cycle', hi: 'यह चक्र' } : { en: 'Last cycle', hi: 'पिछला चक्र' }) + '</button>').join('') + '</div>' : '';
    const sub = w.noStart ? tx({ en: 'Last 35 days. Log a period start in the diary to see cycle days.', hi: 'पिछले 35 दिन। चक्र के दिन देखने के लिए डायरी में पीरियड की शुरुआत दर्ज करें।' }) : fill(tx({ en: '{a} to {b}. Numbers along the bottom are cycle days.', hi: '{a} से {b} तक। नीचे के नंबर चक्र के दिन हैं।' }), { a: dayS(w.from), b: dayS(w.to) });
    const legend = '<div class="ttc-legend">' + MUCUS.map((m, i) => '<span>' + dot(i) + T(m) + '</span>').join('') + '<span><svg viewBox="0 0 12 12" aria-hidden="true"><path class="ttc-lhp" d="M6 1.5l4 4.5-4 4.5-4-4.5z"/></svg>' + T({ en: 'LH positive', hi: 'LH positive' }) + '</span><span><svg viewBox="0 0 12 12" aria-hidden="true"><line class="ttc-lhn" x1="2" x2="10" y1="6" y2="6"/></svg>' + T({ en: 'LH negative', hi: 'LH negative' }) + '</span></div>';
    const list = entries.slice().reverse().slice(0, 5);
    const rows = list.length ? '<div class="list">' + list.map((e) => {
      const cd = w.noStart ? '' : ' · ' + esc(t('cycle_day')) + ' ' + (S.diffDays(w.from, S.fromISO(e.d)) + 1);
      const bits = [e.c != null ? fmtT(e.c, unit) : '', e.m ? mName(e.m) : '', e.lh ? 'LH ' + (e.lh === 'pos' ? t('positive') : t('negative')) : ''].filter(Boolean).join(' · ');
      return '<div class="item quiet ttc-entry"><span class="body"><strong>' + esc(dayS(S.fromISO(e.d))) + cd + '</strong><span>' + esc(bits) + '</span></span>' + (S.canSave() ? '<span class="ttc-acts"><button type="button" class="btn sm ghost" data-edit="' + e.d + '">' + esc(t('edit')) + '</button><button type="button" class="btn sm ghost" data-del="' + e.d + '">' + T({ en: 'Delete', hi: 'हटाएँ' }) + '</button></span>' : '') + '</div>';
    }).join('') + '</div>' : '';
    return '<div class="card"><div class="row spread"><h3>' + T({ en: 'Your chart', hi: 'आपका चार्ट' }) + '</h3><span class="pill muted">' + (unit === 'F' ? '°F' : '°C') + '</span></div>' + chips + '<p class="small">' + esc(sub) + '</p>' +
      (entries.length ? chartSvg(w, entries, unit) + legend : '<p class="small" style="color:var(--fg)">' + T({ en: 'Nothing logged for these days yet.', hi: 'इन दिनों के लिए अभी कुछ दर्ज नहीं।' }) + '</p>') + '</div>' +
      (rows ? '<h2>' + T({ en: 'Latest entries', hi: 'हाल की entries' }) + '</h2>' + rows + (entries.length > 5 ? '<p class="small">' + esc(fill(tx({ en: '{n} days logged in this window. To change an older day, pick its date in "Log a day".', hi: 'इस दौरान {n} दिन दर्ज हैं। पुराना दिन बदलना हो तो “एक दिन दर्ज करें” में उसकी तारीख़ चुनें।' }), { n: entries.length })) + '</p>' : '') : '');
  }
  function formHtml(st) {
    own(); const unit = st.unit === 'F' ? 'F' : 'C';
    const chip = (attr, val, label, on) => '<button type="button" class="chip' + (on ? ' on' : '') + '" data-' + attr + '="' + val + '">' + label + '</button>';
    return '<div class="card"><h3>' + T({ en: 'Log a day', hi: 'एक दिन दर्ज करें' }) + '</h3>' +
      '<label for="ttc-d">' + T({ en: 'Date', hi: 'तारीख़' }) + '</label><input type="date" id="ttc-d" max="' + S.toISO(S.today()) + '" value="' + esc(ui.date) + '">' +
      '<label for="ttc-t" id="ttc-tl">' + T({ en: 'Waking temperature', hi: 'सुबह उठते ही तापमान' }) + ' (' + (unit === 'F' ? '°F' : '°C') + ', ' + T({ en: 'optional', hi: 'वैकल्पिक' }) + ')</label>' +
      '<div class="row"><input type="number" inputmode="decimal" step="0.01" id="ttc-t" placeholder="' + (unit === 'F' ? '97.70' : '36.50') + '" value="' + esc(ui.temp) + '" style="flex:1"><div class="chips ttc-unit">' + chip('unit', 'C', '°C', unit === 'C') + chip('unit', 'F', '°F', unit === 'F') + '</div></div>' +
      '<label>' + T({ en: 'Mucus (optional)', hi: 'म्यूकस (वैकल्पिक)' }) + '</label><div class="chips">' + MUCUS.map((m) => chip('mucus', m.k, T(m), ui.mucus === m.k)).join('') + '</div>' +
      '<label>' + T({ en: 'Ovulation (LH) strip (optional)', hi: 'Ovulation (LH) strip (वैकल्पिक)' }) + '</label><div class="chips">' + chip('lh', 'pos', esc(t('positive')), ui.lh === 'pos') + chip('lh', 'neg', esc(t('negative')), ui.lh === 'neg') + chip('lh', '', esc(t('not_taken')), !ui.lh) + '</div>' +
      '<div id="ttc-fever">' + (ui.fever ? feverNote() : '') + '</div>' +
      '<button type="button" class="btn primary block" id="ttc-save">' + esc(t('save')) + '</button></div>';
  }
  const feverNote = () => '<div class="flag"><span class="ttc-ft">' + T({ en: 'Saved. This reads as a fever (37.8 °C / 100 °F or more), not a resting temperature, so it says nothing about your cycle. Fever with belly pain, or with burning when you pee: see a doctor today.', hi: 'सेव हो गया। यह बुख़ार है (37.8 °C / 100 °F या ज़्यादा), आराम का तापमान नहीं, इसलिए इससे चक्र के बारे में कुछ पता नहीं चलता। बुख़ार के साथ पेट दर्द, या पेशाब में जलन हो: आज ही डॉक्टर को दिखाएँ।' }) + '</span></div>';
  function renderSigns(v) {
    own(); const st = store(); st.signs = st.signs || {};
    v.innerHTML = S.backRow(t('ttc_signs'), 'ttc', false) +
      P({ en: 'A private log of your waking temperature, cervical mucus and LH strips, drawn by cycle day. Some women like to learn their pattern this way; you do not need it to get pregnant.', hi: 'सुबह के तापमान, म्यूकस (योनि का चिकना स्राव) और LH strip का निजी रिकॉर्ड, चक्र के दिन के हिसाब से। कुछ महिलाएँ इससे अपना पैटर्न समझना पसंद करती हैं; गर्भ ठहरने के लिए यह ज़रूरी नहीं।' }) +
      '<div class="card warn"><h3>' + T({ en: 'This log is data only', hi: 'यह रिकॉर्ड सिर्फ़ डेटा है' }) + '</h3>' + P({ en: 'Your waking temperature goes up a little, about 0.2–0.5 °C (0.4–0.9 °F), after an egg is released, and stays up until your next period. So a chart can only show afterwards that it probably happened. This app does not detect ovulation: it only estimates the day from your dates, and it never shows safe days. It is not a way to avoid pregnancy.', hi: 'अंडा निकलने के बाद सुबह का तापमान थोड़ा बढ़ता है, लगभग 0.2–0.5 °C (0.4–0.9 °F), और अगले पीरियड तक बढ़ा रहता है। इसलिए चार्ट बाद में ही दिखा सकता है कि शायद अंडा निकला था। यह app ovulation नहीं पहचानता: सिर्फ़ आपकी तारीख़ों से दिन का अंदाज़ा लगाता है, और कोई safe days कभी नहीं दिखाता। यह गर्भ से बचने का तरीक़ा नहीं है।' }, 'ttc-p') + '</div>' +
      (S.canSave() ? formHtml(st) : S.needDiary()) +
      '<div id="ttc-chartbox" class="stack" style="gap:14px">' + chartBox(st) + '</div>' +
      card({ en: 'Taking your waking temperature', hi: 'सुबह का तापमान कैसे लें' }, steps([
        { en: 'Use a digital thermometer that shows two decimals, for example 36.45. Keep it by the bed.', hi: 'ऐसा digital thermometer लें जो दशमलव के बाद दो अंक दिखाए, जैसे 36.45। इसे बिस्तर के पास रखें।' },
        { en: 'Take it as soon as you wake, before you get out of bed, talk or drink anything, at about the same time each day.', hi: 'आँख खुलते ही, बिस्तर से उठने, बात करने या कुछ पीने से पहले लें, रोज़ लगभग एक ही समय पर।' },
        { en: 'Use the same place every time. Under the tongue is fine.', hi: 'हर बार एक ही जगह से लें। जीभ के नीचे ठीक है।' },
        { en: 'Illness, alcohol, poor sleep and stress change the reading, so one odd day means little.', hi: 'बीमारी, शराब, ख़राब नींद और तनाव से रीडिंग बदलती है, इसलिए एक अजीब दिन का ज़्यादा मतलब नहीं।' }
      ])) +
      card({ en: 'Reading mucus', hi: 'म्यूकस को समझना' }, '<dl class="kv ttc-kv">' + MUCUS.map((m) => '<dt>' + T(m) + '</dt><dd>' + T({ en: m.den, hi: m.dhi }) + '</dd>').join('') + '</dl>' + ul([
        { en: 'Just after a period it is often dry or sticky. Nearer egg release it turns wetter, clear and stretchy, like raw egg white. After that it thickens or dries again.', hi: 'पीरियड के ठीक बाद अक्सर सूखा या चिपचिपा रहता है। अंडा निकलने के क़रीब यह गीला, साफ़ और खिंचने वाला हो जाता है, कच्चे अंडे की सफ़ेदी जैसा। उसके बाद फिर गाढ़ा या सूखा हो जाता है।' },
        { en: 'Infections and some medicines change mucus. Itching, a bad smell or a change in colour is not a fertility sign; get it checked.', hi: 'Infection और कुछ दवाओं से म्यूकस बदलता है। खुजली, बदबू या रंग बदलना fertility का संकेत नहीं है; जाँच कराएँ।' }
      ])) +
      card({ en: 'LH strips', hi: 'LH strip' }, P({ en: 'A positive strip means a rise in LH, the hormone that usually rises a day or so before an egg is released. Strips can read positive without an egg being released, especially with PMOS, and some women with PMOS see several positives in one cycle. A strip result is kept here as data only.', hi: 'Positive strip का मतलब है LH हॉर्मोन बढ़ा, जो आम तौर पर अंडा निकलने से लगभग एक दिन पहले बढ़ता है। Strip बिना अंडा निकले भी positive आ सकती है, ख़ासकर PMOS में, और PMOS वाली कुछ महिलाओं को एक ही चक्र में कई बार positive दिखती है। Strip का result यहाँ सिर्फ़ डेटा के रूप में रखा जाता है।' }, 'ttc-p')) +
      '<div class="card soft">' + P({ en: 'Sex every 2–3 days through the cycle works as well as timing it, without the stress. If your cycles are regular, the Fertile days estimate gives a date range; with PMOS or irregular cycles it stays hidden on purpose.', hi: 'पूरे चक्र में हर 2–3 दिन में संबंध, समय मिलाने जितना ही कारगर है, और तनाव भी नहीं। चक्र नियमित हों तो “Fertile दिनों का अनुमान” तारीख़ों का दायरा देता है; PMOS या अनियमित चक्र में वह जान-बूझकर छिपा रहता है।' }, 'ttc-p') + '<div class="row wrap">' + goBtn('fertile', { en: 'Fertile days estimate', hi: 'Fertile दिनों का अनुमान' }) + goBtn('ttc-trying', { en: 'When to see a doctor', hi: 'डॉक्टर को कब दिखाएँ' }) + '</div></div>';
    S.wire(v); wireSigns(v, st);
  }
  function wireSigns(v, st) {
    const redraw = () => { const box = v.querySelector('#ttc-chartbox'); if (!box) return; box.innerHTML = chartBox(st); S.wire(box); wireChart(v, st); };
    const fillForm = () => { const e = st.signs[ui.date] || null; const unit = st.unit === 'F' ? 'F' : 'C'; ui.temp = e && e.c != null ? conv(e.c, unit).toFixed(2) : ''; ui.mucus = e ? e.m || '' : ''; ui.lh = e ? e.lh || '' : ''; ui.fever = false; };
    const syncForm = () => {
      const ti = v.querySelector('#ttc-t'); if (ti) ti.value = ui.temp; const di = v.querySelector('#ttc-d'); if (di) di.value = ui.date;
      v.querySelectorAll('[data-mucus]').forEach((x) => x.classList.toggle('on', x.dataset.mucus === ui.mucus));
      v.querySelectorAll('[data-lh]').forEach((x) => x.classList.toggle('on', x.dataset.lh === ui.lh));
      const fv = v.querySelector('#ttc-fever'); if (fv) fv.innerHTML = ui.fever ? feverNote() : '';
    };
    function wireChart() {
      v.querySelectorAll('[data-cyc]').forEach((b) => b.addEventListener('click', () => { ui.cyc = parseInt(b.dataset.cyc, 10) || 0; redraw(); }));
      v.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { delete st.signs[b.dataset.del]; persist(); S.toast(tx({ en: 'Entry deleted.', hi: 'Entry हटा दी गई।' })); redraw(); }));
      v.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => { ui.date = b.dataset.edit; fillForm(); syncForm(); const f = v.querySelector('#ttc-d'); if (f && f.scrollIntoView) f.scrollIntoView({ block: 'center' }); }));
    }
    wireChart();
    if (!S.canSave()) return;
    const di = v.querySelector('#ttc-d'); di.addEventListener('change', () => { if (!di.value || S.fromISO(di.value) > S.today()) { di.value = ui.date; return; } ui.date = di.value; fillForm(); syncForm(); });
    const ti = v.querySelector('#ttc-t'); ti.addEventListener('input', () => { ui.temp = ti.value; });
    v.querySelectorAll('[data-unit]').forEach((b) => b.addEventListener('click', () => {
      const nu = b.dataset.unit; const old = st.unit === 'F' ? 'F' : 'C'; if (nu === old) return;
      /* Convert what she typed only if it was a sensible reading in the old unit; otherwise she probably typed in the new one. */
      const n = parseFloat(String(ui.temp).replace(',', '.'));
      const fits = !isNaN(n) && (old === 'C' ? n >= 35 && n <= 38.5 : n >= 95 && n <= 101.3);
      if (fits) ui.temp = (nu === 'F' ? n * 9 / 5 + 32 : (n - 32) * 5 / 9).toFixed(2);
      st.unit = nu; persist();
      v.querySelectorAll('[data-unit]').forEach((x) => x.classList.toggle('on', x.dataset.unit === nu));
      ti.value = ui.temp; ti.placeholder = nu === 'F' ? '97.70' : '36.50';
      const tl = v.querySelector('#ttc-tl'); if (tl) tl.textContent = tx({ en: 'Waking temperature', hi: 'सुबह उठते ही तापमान' }) + ' (' + (nu === 'F' ? '°F' : '°C') + ', ' + tx({ en: 'optional', hi: 'वैकल्पिक' }) + ')';
      redraw();
    }));
    v.querySelectorAll('[data-mucus]').forEach((b) => b.addEventListener('click', () => { ui.mucus = ui.mucus === b.dataset.mucus ? '' : b.dataset.mucus; syncForm(); }));
    v.querySelectorAll('[data-lh]').forEach((b) => b.addEventListener('click', () => { ui.lh = b.dataset.lh; syncForm(); }));
    v.querySelector('#ttc-save').addEventListener('click', () => {
      const unit = st.unit === 'F' ? 'F' : 'C'; const raw = String(ui.temp == null ? '' : ui.temp).trim().replace(',', '.'); let c = null;
      if (raw !== '') {
        const n = parseFloat(raw); c = isNaN(n) ? NaN : (unit === 'F' ? (n - 32) * 5 / 9 : n);
        if (isNaN(c) || c < 35 || c > 42) { S.toast(tx({ en: 'That temperature looks off. Check the number and °C or °F.', hi: 'यह तापमान ठीक नहीं लगता। नंबर और °C या °F दोबारा देखें।' })); return; }
      }
      if (c == null && !ui.mucus && !ui.lh) { S.toast(tx({ en: 'Add a temperature, mucus or a strip result first.', hi: 'पहले तापमान, म्यूकस या strip का result डालें।' })); return; }
      st.signs[ui.date] = { c: c == null ? null : Math.round(c * 100) / 100, m: ui.mucus || '', lh: ui.lh || '' }; persist();
      ui.fever = c != null && (unit === 'F' ? parseFloat(raw) >= 100 : c >= 37.8); S.toast(t('saved'));   /* 100.0 °F is 37.78 °C: judge it in her unit */
      if (!ui.fever) { const nx = S.addDays(S.fromISO(ui.date), 1); ui.date = S.toISO(nx > S.today() ? S.today() : nx); fillForm(); }
      syncForm(); redraw();
    });
  }

  /* ---------- tests and treatments ---------- */
  function renderTests(v) {
    const li = (name, o) => '<li><strong>' + T(name) + '</strong> ' + T(o) + '</li>';
    v.innerHTML = S.backRow(t('ttc_tests'), 'ttc', false) +
      P({ en: 'What doctors usually check, in the order they usually check it, and what each treatment means. Your gynaecologist decides what you actually need.', hi: 'डॉक्टर आम तौर पर क्या जाँचते हैं, किस क्रम में, और हर इलाज का मतलब। आपको असल में क्या चाहिए, यह आपकी स्त्री रोग विशेषज्ञ तय करेंगी।' }) +
      '<div class="card soft"><h3>' + T({ en: 'When tests make sense', hi: 'जाँच कब करानी चाहिए' }) + '</h3>' + ul([
        { en: 'Under 35: after 12 months of trying.', hi: '35 से कम: 12 महीने की कोशिश के बाद।' },
        { en: '35–39: after 6 months.', hi: '35–39: 6 महीने के बाद।' },
        { en: 'Straight away: periods absent or very irregular, PMOS, endometriosis, fibroids, past pelvic infection or TB, a partner with a known issue, age 40 or over, or two or more miscarriages.', hi: 'तुरंत: पीरियड न आएँ या बहुत अनियमित हों, PMOS, endometriosis, fibroids, पहले पेडू का infection या TB, साथी में कोई जानी हुई दिक़्क़त, उम्र 40 या ज़्यादा, या दो या ज़्यादा बार गर्भ गिरा हो।' }
      ]) + goBtn('ttc-trying', { en: 'Count my months', hi: 'मेरे महीने गिनें' }) + '</div>' +
      '<h2>' + T({ en: 'Tests for her', hi: 'महिला की जाँचें' }) + '</h2>' +
      '<div class="card"><ul class="ttc-tl">' +
      li({ en: 'Blood tests on any day:', hi: 'किसी भी दिन blood test:' }, { en: 'Hb, thyroid (TSH), prolactin and sugar. High prolactin can stop egg release and sometimes causes milky nipple discharge.', hi: 'Hb, थायरॉइड (TSH), prolactin और शुगर। Prolactin ज़्यादा हो तो अंडा निकलना रुक सकता है, और कभी निप्पल से दूध जैसा स्राव होता है।' }) +
      li({ en: 'Day 2 or 3 of the period:', hi: 'पीरियड के दूसरे या तीसरे दिन:' }, { en: 'FSH, LH and estradiol, hormones that show how the ovaries are working.', hi: 'FSH, LH और estradiol, ऐसे हॉर्मोन जो बताते हैं कि अंडाशय कैसे काम कर रहे हैं।' }) +
      li({ en: 'AMH:', hi: 'AMH:' }, { en: 'a rough guide to how many eggs are left. It helps plan IVF. On its own it cannot tell whether you can get pregnant naturally, and a low number is not a verdict.', hi: 'मोटा अंदाज़ा कि कितने अंडे बचे हैं। यह IVF की योजना में मदद करता है। अकेले यह नहीं बता सकता कि आपको अपने-आप गर्भ ठहरेगा या नहीं, और कम नंबर कोई फ़ैसला नहीं है।' }) +
      li({ en: 'About 7 days before the expected period:', hi: 'अगले पीरियड से लगभग 7 दिन पहले:' }, { en: 'progesterone, to check whether an egg was released that month.', hi: 'progesterone, यह देखने के लिए कि उस महीने अंडा निकला या नहीं।' }) +
      li({ en: 'Ultrasound, usually internal (TVS):', hi: 'Ultrasound, आम तौर पर अंदर से (TVS):' }, { en: 'looks at the womb, its lining, the ovaries, fibroids and cysts. Follicle scans repeat it over a few days to watch an egg grow.', hi: 'बच्चेदानी, उसकी परत, अंडाशय, fibroids और cysts देखता है। Follicle scan में कुछ दिन दोबारा करके अंडे का बढ़ना देखा जाता है।' }) +
      li({ en: 'Tube test, HSG or SSG:', hi: 'ट्यूब की जाँच, HSG या SSG:' }, { en: 'HSG is an X-ray with dye; SSG (HyCoSy) uses ultrasound and fluid. Done a few days after the period ends and before ovulation, so there is no early pregnancy. It can cramp like a period; ask what painkiller to take.', hi: 'HSG में dye डालकर X-ray होता है; SSG (HyCoSy) में ultrasound और पानी जैसा द्रव। पीरियड ख़त्म होने के कुछ दिन बाद और ovulation से पहले होता है, ताकि कोई शुरुआती गर्भ न हो। पीरियड जैसा मरोड़ हो सकता है; पूछ लें कौन-सी दर्द की दवा लें।' }) +
      li({ en: 'Hysteroscopy or laparoscopy:', hi: 'Hysteroscopy या laparoscopy:' }, { en: 'a camera look inside, only when other tests point to a problem.', hi: 'कैमरे से अंदर देखना, सिर्फ़ तब जब दूसरी जाँचें किसी दिक़्क़त की ओर इशारा करें।' }) +
      '</ul></div>' +
      '<div class="card warn"><h3>' + T({ en: 'Genital TB: test properly, treat once', hi: 'जननांगों की TB: ठीक से जाँच, एक बार इलाज' }) + '</h3>' + ul([
        { en: 'TB of the womb lining and tubes is a known cause of blocked tubes in India. It is diagnosed from a sample of the womb lining (endometrial biopsy) or tissue taken at laparoscopy, tested by microscopy, culture, GeneXpert or a pathologist. Menstrual blood is not a suitable sample.', hi: 'बच्चेदानी की परत और ट्यूब की TB भारत में ट्यूब बंद होने की एक जानी हुई वजह है। इसकी पहचान बच्चेदानी की परत के sample (endometrial biopsy) या laparoscopy में लिए गए टुकड़े से होती है, जिसकी जाँच microscopy, culture, GeneXpert या pathologist करते हैं। पीरियड का ख़ून सही sample नहीं है।' },
        { en: 'A TB blood (antibody) test is not a valid way to find TB; India banned these kits in 2012. A Mantoux test only shows past contact with TB.', hi: 'TB का blood (antibody) test TB पकड़ने का सही तरीक़ा नहीं है; भारत ने 2012 में ये kits बैन कर दीं। Mantoux test सिर्फ़ इतना बताता है कि कभी TB के संपर्क में आई थीं।' },
        { en: 'Do not start months of TB medicines on a blood test or a lone PCR report. PCR tests on these samples have given many false positives; a gynaecologist should weigh it with the other findings.', hi: 'सिर्फ़ blood test या अकेली PCR report पर महीनों की TB दवा शुरू न करें। इन samples पर PCR test कई बार ग़लत positive आए हैं; स्त्री रोग विशेषज्ञ को इसे बाक़ी जाँचों के साथ देखना चाहिए।' },
        { en: 'If TB is confirmed, the standard course is 6 months and is free at government TB centres. Repeating TB courses because pregnancy has not happened is not advised.', hi: 'TB पक्की हो तो आम इलाज 6 महीने का है और सरकारी TB केंद्रों पर मुफ़्त है। गर्भ न ठहरने की वजह से TB का कोर्स बार-बार दोहराने की सलाह नहीं दी जाती।' }
      ]) + '</div>' +
      '<h2>' + T({ en: 'Test for him', hi: 'पुरुष की जाँच' }) + '</h2>' +
      card(null, P({ en: 'Semen analysis comes first, because it is simple and painless. WHO\'s 2021 lab manual asks for 2–7 days without ejaculation before the sample. The sample is collected at the lab by masturbation into a clean container. Counts vary, so a low result is usually repeated after some weeks.', hi: 'Semen analysis सबसे पहले, क्योंकि यह आसान है और दर्द नहीं होता। WHO की 2021 lab manual के अनुसार sample से पहले 2–7 दिन तक वीर्य न निकले। Sample lab में हस्तमैथुन से एक साफ़ डिब्बी में दिया जाता है। गिनती बदलती रहती है, इसलिए कम result आने पर आम तौर पर कुछ हफ़्ते बाद दोबारा जाँच होती है।' }, 'ttc-p') + goBtn('ttc-partner', { en: 'More for your partner', hi: 'साथी के लिए और जानकारी' })) +
      '<h2>' + T({ en: 'Treatments, in plain words', hi: 'इलाज, आसान शब्दों में' }) + '</h2>' +
      '<div class="card"><ul class="ttc-tl">' +
      li({ en: 'Ovulation tablets (letrozole or clomiphene):', hi: 'ओव्यूलेशन की गोलियाँ (letrozole या clomiphene):' }, { en: 'help the ovary release an egg; often the first treatment with PMOS. Prescribed by a gynaecologist with scans to watch the eggs, because twins and over-response can happen.', hi: 'अंडाशय को अंडा छोड़ने में मदद करती हैं; PMOS में अक्सर पहला इलाज। स्त्री रोग विशेषज्ञ scan के साथ लिखती हैं, क्योंकि जुड़वाँ या ज़रूरत से ज़्यादा असर हो सकता है।' }) +
      li({ en: 'IUI:', hi: 'IUI:' }, { en: 'washed sperm is placed inside the womb with a thin tube around the time of egg release. It needs at least one open tube and a reasonable sperm count.', hi: 'अंडा निकलने के समय के आसपास धुले हुए sperm एक पतली नली से बच्चेदानी के अंदर डाले जाते हैं। इसके लिए कम से कम एक ट्यूब खुली हो और sperm की गिनती ठीक-ठाक हो।' }) +
      li({ en: 'IVF:', hi: 'IVF:' }, { en: 'eggs are collected from the ovaries, joined with sperm in a lab, and an embryo is placed in the womb.', hi: 'अंडाशय से अंडे निकाले जाते हैं, lab में sperm से मिलाए जाते हैं, और भ्रूण (embryo) बच्चेदानी में रखा जाता है।' }) +
      li({ en: 'ICSI:', hi: 'ICSI:' }, { en: 'a kind of IVF where one sperm is injected into each egg, used mainly when sperm count or movement is very low.', hi: 'IVF का एक तरीक़ा जिसमें हर अंडे में एक sperm डाला जाता है, ख़ासकर जब sperm बहुत कम हों या ठीक से न चलें।' }) +
      li({ en: 'Surgery:', hi: 'सर्जरी:' }, { en: 'in some cases, for blocked tubes, fibroids, a wall inside the womb or endometriosis.', hi: 'कुछ मामलों में, बंद ट्यूब, fibroids, बच्चेदानी के अंदर दीवार (septum) या endometriosis के लिए।' }) +
      '</ul>' + P(BAMS, 'note') + '</div>' +
      '<div class="card"><h3>' + T({ en: 'IVF and IUI clinics: what the law says', hi: 'IVF और IUI clinic: क़ानून क्या कहता है' }) + '</h3>' + ul([
        { en: 'Under the ART (Regulation) Act, 2021, every IVF clinic and egg or sperm bank must be registered with the National ART & Surrogacy Registry.', hi: 'ART (Regulation) Act, 2021 के तहत हर IVF clinic और अंडे या sperm bank का National ART & Surrogacy Registry में पंजीकरण ज़रूरी है।' },
        { en: 'The clinic must explain its chances of success, the costs, side effects and the risk of twins or more, and take your written consent before any procedure.', hi: 'Clinic को सफलता की संभावना, ख़र्च, दुष्प्रभाव और जुड़वाँ या ज़्यादा बच्चों का ख़तरा समझाना होता है, और हर procedure से पहले आपकी लिखित सहमति लेनी होती है।' },
        { en: 'Ask for the full cost in writing before you start: tests, medicines, procedures and freezing.', hi: 'शुरू करने से पहले पूरा ख़र्च लिखित में माँगें: जाँचें, दवाएँ, procedures और freezing।' },
        { en: 'Every clinic must have a grievance cell for complaints.', hi: 'हर clinic में शिकायत के लिए grievance cell होना ज़रूरी है।' },
        { en: 'Be wary of "guaranteed baby", "100% success" or money-back offers. No honest clinic can promise a pregnancy.', hi: '“बच्चे की गारंटी”, “100% सफलता” या पैसे वापसी वाले ऑफ़र से सावधान रहें। कोई ईमानदार clinic गर्भ का वादा नहीं कर सकता।' },
        { en: "Choosing the baby's sex is illegal. A clinic that offers it is breaking the law.", hi: 'बच्चे का लिंग चुनना ग़ैरक़ानूनी है। जो clinic यह पेशकश करे, वह क़ानून तोड़ रहा है।' }
      ]) + '<p class="small">' + ext('https://registry.artsurrogacy.gov.in/', { en: 'Check a clinic on the national registry (registry.artsurrogacy.gov.in)', hi: 'राष्ट्रीय registry पर clinic देखें (registry.artsurrogacy.gov.in)' }) + '</p></div>' +
      card({ en: 'Government options', hi: 'सरकारी विकल्प' }, P({ en: 'Some government medical colleges and large government hospitals run infertility clinics. Many tests are free or cheaper there, and a few also offer IUI or IVF. Start at the gynaecology OPD of your district hospital and ask for a referral. Under the Free Diagnostics Service Initiative, hormone tests, semen analysis and HPLC are on the free-test list for bigger government hospitals; ask the lab what it has.', hi: 'कुछ सरकारी medical college और बड़े सरकारी अस्पताल infertility clinic चलाते हैं। वहाँ कई जाँचें मुफ़्त या सस्ती होती हैं, और कुछ जगह IUI या IVF भी होता है। ज़िला अस्पताल की स्त्री रोग OPD से शुरू करें और refer करने को कहें। मुफ़्त जाँच योजना (Free Diagnostics Service Initiative) में बड़े सरकारी अस्पतालों के लिए हॉर्मोन जाँचें, semen analysis और HPLC मुफ़्त सूची में हैं; lab से पूछें कि वहाँ क्या उपलब्ध है।' }, 'ttc-p')) +
      askBtn({ en: 'Fertility tests', hi: 'Fertility की जाँचें' }) +
      '<p class="footnote">' + T({ en: 'Sources: WHO infertility fact sheet; WHO semen manual 2021; NICE CG156; ICMR Standard Treatment Workflow for female genital TB (2022); INDEX-TB guidelines; ART (Regulation) Act, 2021; MoHFW Free Diagnostics Service Initiative.', hi: 'स्रोत: WHO infertility fact sheet; WHO semen manual 2021; NICE CG156; ICMR Standard Treatment Workflow, female genital TB (2022); INDEX-TB guidelines; ART (Regulation) Act, 2021; MoHFW मुफ़्त जाँच योजना।' }) + '</p>';
    S.wire(v);
  }

  /* ---------- for the partner ---------- */
  const MSG = { en: 'We are trying for a baby. Doctors check both partners from the start. Can you get a semen test this month? Avoid ejaculation for 2–7 days before it. Qura Sakhi has a page for you under "Trying for a baby".', hi: 'हम बच्चे की कोशिश कर रहे हैं। डॉक्टर शुरू से ही दोनों साथियों की जाँच करते हैं। क्या आप इस महीने semen test करा सकते हैं? उससे पहले 2–7 दिन तक वीर्य न निकले। Qura Sakhi में “बच्चे की कोशिश” के अंदर आपके लिए एक पन्ना है।' };
  function renderPartner(v) {
    v.innerHTML = S.backRow(t('ttc_partner'), 'ttc', false) +
      P({ en: 'Show him this page. It is written to him.', hi: 'यह पन्ना उन्हें दिखाएँ। यह उन्हीं के लिए लिखा है।' }) +
      '<div class="card ok"><h3 style="color:var(--ok)">' + T({ en: 'This is a question for both of you', hi: 'यह आप दोनों का सवाल है' }) + '</h3><p>' + T({ en: "When a couple cannot conceive, a male factor is part of the reason in about 4 to 5 out of 10 couples. That is why doctors check the man from the start. It is nobody's fault, and it is often treatable.", hi: 'जब किसी जोड़े को गर्भ नहीं ठहरता, तो लगभग 10 में से 4 से 5 जोड़ों में वजह का कुछ हिस्सा पुरुष की तरफ़ होता है। इसीलिए डॉक्टर शुरू से ही पुरुष की जाँच करते हैं। इसमें किसी की ग़लती नहीं, और अक्सर इलाज संभव है।' }) + '</p></div>' +
      card({ en: 'The semen test: simple and early', hi: 'Semen test: आसान, और जल्दी' }, steps([
        { en: 'Avoid ejaculation for 2–7 days before the test (WHO, 2021).', hi: 'Test से पहले 2–7 दिन तक वीर्य न निकले (WHO, 2021)।' },
        { en: 'Give the sample at the lab, by masturbation, into the clean container they give you. Tell them if any of it spilled.', hi: 'Sample lab में दें, हस्तमैथुन से, उनकी दी हुई साफ़ डिब्बी में। अगर कुछ गिर गया हो तो उन्हें बताएँ।' },
        { en: 'Counts vary from week to week, so one low result is not final. Doctors usually repeat it after some weeks.', hi: 'गिनती हफ़्ते-हफ़्ते बदलती है, इसलिए एक कम result आख़िरी नहीं। डॉक्टर आम तौर पर कुछ हफ़्ते बाद दोबारा कराते हैं।' },
        { en: 'Bigger government hospital labs do it. Ask at the gynaecology or urology OPD.', hi: 'बड़े सरकारी अस्पतालों की lab में होता है। स्त्री रोग या urology OPD में पूछें।' }
      ])) +
      card({ en: 'What helps sperm', hi: 'Sperm के लिए क्या अच्छा है' }, ul([
        { en: 'Stop tobacco in every form: cigarettes, bidi, gutka, khaini. Free help: National Tobacco Quitline 1800-11-2356.', hi: 'हर तरह का तंबाकू छोड़ें: सिगरेट, बीड़ी, गुटखा, खैनी। मुफ़्त मदद: National Tobacco Quitline 1800-11-2356।' },
        { en: 'Cut down alcohol, and ideally stop while you are trying.', hi: 'शराब कम करें, और हो सके तो कोशिश के दौरान बंद रखें।' },
        { en: 'A healthy weight, daily activity and enough sleep.', hi: 'सही वज़न, रोज़ चलना-फिरना और पूरी नींद।' },
        { en: 'Keep the testes cool: avoid hot tubs and saunas, a laptop on the lap, very tight underwear and long hours sitting in heat.', hi: 'अंडकोष को ठंडा रखें: गर्म पानी के टब और sauna, गोद में laptop, बहुत तंग अंडरवियर और गर्मी में घंटों बैठने से बचें।' },
        { en: 'No muscle-building steroids, testosterone injections, or gym supplements that contain them. They can stop sperm production.', hi: 'Muscle बनाने वाले steroids, testosterone के इंजेक्शन, या ऐसे gym supplements न लें जिनमें ये हों। इनसे sperm बनना रुक सकता है।' },
        { en: 'Tell the doctor every medicine you take, and do not stop a prescribed one on your own.', hi: 'जो भी दवा लेते हैं, डॉक्टर को बताएँ, और लिखी हुई दवा ख़ुद से बंद न करें।' },
        { en: 'Sperm take about 2–3 months to form, so changes show in a test after that.', hi: 'Sperm बनने में लगभग 2–3 महीने लगते हैं, इसलिए बदलाव का असर उसके बाद test में दिखता है।' }
      ])) +
      card({ en: 'Tell the doctor about', hi: 'डॉक्टर को ये बातें बताएँ' }, ul([
        { en: 'Mumps after puberty that made the testes swell.', hi: 'जवानी के बाद mumps, जिसमें अंडकोष सूजे थे।' },
        { en: 'Swollen veins in the scrotum (varicocele), an injury there, or surgery for a hernia or an undescended testis.', hi: 'अंडकोष की थैली में सूजी नसें (varicocele), वहाँ चोट, या hernia या नीचे न उतरे अंडकोष की सर्जरी।' },
        { en: 'Problems with erection or ejaculation. They are common and treatable, and doctors see them every day.', hi: 'Erection या वीर्य निकलने में परेशानी। यह आम है, इसका इलाज है, और डॉक्टर रोज़ ऐसे मामले देखते हैं।' },
        { en: 'Diabetes, a long illness, cancer treatment, or medicines taken every day.', hi: 'डायबिटीज़, लंबी बीमारी, कैंसर का इलाज, या रोज़ ली जाने वाली दवाएँ।' },
        { en: 'Age matters for men too: sperm quality slowly falls with age.', hi: 'पुरुषों के लिए भी उम्र मायने रखती है: उम्र के साथ sperm की गुणवत्ता धीरे-धीरे घटती है।' }
      ])) +
      '<div class="card soft"><h3>' + T({ en: 'Send him a message', hi: 'उन्हें संदेश भेजें' }) + '</h3><p class="small ttc-msg" id="ttc-msg" style="color:var(--fg)">' + T(MSG) + '</p><button type="button" class="btn sm" id="ttc-copy">' + esc(t('copy')) + '</button></div>' +
      askBtn({ en: 'Male fertility and semen test', hi: 'पुरुष fertility और semen test' });
    S.wire(v);
    v.querySelector('#ttc-copy').addEventListener('click', () => {
      const text = tx(MSG); const done = () => S.toast(t('copied'));
      const pick = () => { try { const el = v.querySelector('#ttc-msg'); const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) { /* selection blocked */ } S.toast(tx({ en: 'Select the text above and copy it.', hi: 'ऊपर का text चुनकर कॉपी करें।' })); };
      try { navigator.clipboard.writeText(text).then(done, pick); } catch (e) { pick(); }
    });
  }

  /* ---------- two or more miscarriages ---------- */
  function renderLoss2(v) {
    v.innerHTML = S.backRow(t('ttc_loss2'), 'ttc', false) +
      P({ en: 'Losing a pregnancy twice or more is hard, and it is natural to look for a reason. Here is what doctors check, what they do not need to, and where to go.', hi: 'दो या ज़्यादा बार गर्भ खोना बहुत कठिन है, और वजह ढूँढना स्वाभाविक है। यहाँ लिखा है कि डॉक्टर क्या जाँचते हैं, किसकी ज़रूरत नहीं, और कहाँ जाएँ।' }) +
      '<div class="card ok"><h3 style="color:var(--ok)">' + T({ en: 'It is not your fault', hi: 'इसमें आपकी ग़लती नहीं है' }) + '</h3><p>' + T({ en: 'Most early miscarriages happen because the pregnancy had a chromosome problem, by chance. Work, travel, sex, a fall, lifting, a quarrel or the food you ate do not cause them. Many couples who have had two or more losses go on to have a baby.', hi: 'ज़्यादातर शुरुआती गर्भपात इसलिए होते हैं कि उस गर्भ में संयोग से chromosome की कोई गड़बड़ी थी। काम, सफ़र, संबंध, गिरना, वज़न उठाना, झगड़ा या खाना इसकी वजह नहीं होते। दो या ज़्यादा बार गर्भ खोने वाले कई जोड़ों को आगे चलकर बच्चा होता है।' }) + '</p></div>' +
      card({ en: 'When to ask for tests', hi: 'जाँच कब माँगें' }, P({ en: 'European guidance (ESHRE) starts tests after two losses; UK guidance (RCOG) after three, or after two if the doctor thinks it is needed. In India, it is reasonable to see a gynaecologist after two. Losses count even if they were not one after the other.', hi: 'यूरोप की guidance (ESHRE) दो बार गर्भ खोने के बाद जाँच शुरू करती है; UK की (RCOG) तीन के बाद, या डॉक्टर को ज़रूरी लगे तो दो के बाद। भारत में दो के बाद स्त्री रोग विशेषज्ञ को दिखाना ठीक है। गर्भ लगातार न गिरे हों, तब भी गिने जाते हैं।' }, 'ttc-p')) +
      card({ en: 'Tests for her', hi: 'महिला की जाँचें' }, ul([
        { en: 'Antiphospholipid antibodies (lupus anticoagulant, anticardiolipin): blood tests for a clotting tendency that can be treated. A positive result is repeated after some weeks before it counts.', hi: 'Antiphospholipid antibodies (lupus anticoagulant, anticardiolipin): ख़ून जमने की प्रवृत्ति के लिए blood test, जिसका इलाज है। Positive आने पर कुछ हफ़्ते बाद दोबारा जाँच होती है, तभी पक्का माना जाता है।' },
        { en: 'Thyroid: TSH and TPO antibodies.', hi: 'थायरॉइड: TSH और TPO antibodies।' },
        { en: 'Shape of the womb: an ultrasound, ideally 3D, sometimes a hysteroscopy, to look for a wall inside (septum), fibroids or other differences.', hi: 'बच्चेदानी का आकार: ultrasound, हो सके तो 3D, कभी hysteroscopy, ताकि अंदर दीवार (septum), fibroids या कोई और फ़र्क़ दिखे।' },
        { en: 'Sugar, weight and BP.', hi: 'शुगर, वज़न और BP।' }
      ])) +
      card({ en: 'Tests for both of you', hi: 'आप दोनों की जाँचें' }, ul([
        { en: "Karyotype: a blood test of both partners' chromosomes. Doctors usually advise it when tissue from a miscarriage showed a chromosome problem, or could not be tested.", hi: 'Karyotype: दोनों साथियों के chromosomes का blood test। डॉक्टर आम तौर पर तब कहते हैं जब गर्भपात के टुकड़े की जाँच में chromosome की गड़बड़ी मिली हो, या जाँच न हो पाई हो।' },
        { en: 'If it happens again, ask whether the pregnancy tissue can be sent for a chromosome test. It often explains the loss.', hi: 'अगर फिर ऐसा हो, तो पूछें कि क्या गर्भ के टुकड़े की chromosome जाँच हो सकती है। अक्सर इससे वजह पता चल जाती है।' },
        { en: 'His health matters too: tobacco, alcohol and his medicines.', hi: 'उनकी सेहत भी मायने रखती है: तंबाकू, शराब और उनकी दवाएँ।' }
      ])) +
      card({ en: 'Tests guidelines say are not useful routinely', hi: 'जिन जाँचों को guidelines आम तौर पर ज़रूरी नहीं मानतीं' }, P({ en: 'NK cell tests, HLA matching and other "immune" panels, and routine infection panels (often sold as TORCH). If one is offered, ask what decision it will change, and avoid treatment based only on it.', hi: 'NK cell test, HLA matching और दूसरे “immune” panels, और infection के routine panels (अक्सर TORCH के नाम से)। अगर कोई ऐसा test कहे, तो पूछें कि इससे कौन-सा फ़ैसला बदलेगा, और सिर्फ़ इसके भरोसे इलाज न शुरू करें।' }, 'ttc-p'), 'warn') +
      card({ en: 'Treatment depends on the cause', hi: 'इलाज वजह पर निर्भर है' }, P({ en: 'For example, low-dose aspirin with heparin injections for antiphospholipid syndrome, thyroid tablets, or surgery for a septum. Some women with bleeding in early pregnancy after a past miscarriage are given progesterone. A gynaecologist decides all of these; do not start them yourself. Often no cause is found, and caring early pregnancy support still helps.', hi: 'जैसे antiphospholipid syndrome में कम खुराक की aspirin के साथ heparin के इंजेक्शन, थायरॉइड की गोलियाँ, या septum की सर्जरी। पहले गर्भपात हो चुका हो और शुरुआती गर्भ में ब्लीडिंग हो, तो कुछ महिलाओं को progesterone दिया जाता है। यह सब स्त्री रोग विशेषज्ञ तय करती हैं; ख़ुद से शुरू न करें। अक्सर कोई वजह नहीं मिलती, और तब भी शुरुआती गर्भ में अच्छी देखभाल मदद करती है।' }, 'ttc-p')) +
      card({ en: 'Where to go', hi: 'कहाँ जाएँ' }, P({ en: 'The gynaecology OPD of a government medical college or teaching hospital can do most of these tests. Take the reports from every pregnancy: scans, blood reports, discharge papers and any tissue (histopathology) report.', hi: 'सरकारी medical college या teaching hospital की स्त्री रोग OPD इनमें से ज़्यादातर जाँचें कर सकती है। हर गर्भ की reports साथ ले जाएँ: scan, blood reports, discharge के काग़ज़ और टुकड़े की जाँच (histopathology) की report।' }, 'ttc-p') + P({ en: 'Next time, tell your doctor as soon as the test is positive. Early registration (MCP card) and an early scan help. Keep taking folic acid.', hi: 'अगली बार test positive आते ही डॉक्टर को बताएँ। जल्दी पंजीकरण (MCP card) और जल्दी scan मदद करते हैं। Folic acid लेती रहें।' })) +
      '<div class="list">' + item('loss', 'heart', { en: 'Pregnancy loss', hi: 'गर्भ का नुक़सान' }, { en: 'Types of loss, recovery, feelings', hi: 'नुक़सान के प्रकार, ठीक होना, मन' }) + item('loss-grief', 'users', { en: 'Grief and feelings', hi: 'दुख और मन की बातें' }, { en: 'For you and your partner', hi: 'आपके और आपके साथी के लिए' }) + item('loss-again', 'leaf', { en: 'Trying again after a loss', hi: 'नुक़सान के बाद फिर कोशिश' }, { en: 'When and how to start again', hi: 'कब और कैसे फिर शुरू करें' }) + '</div>' +
      '<div class="card soft"><p class="small" style="color:var(--fg)">' + T({ en: 'Feeling low, anxious or numb after a loss is common, for both partners. Tele-MANAS 14416 is free, any time.', hi: 'गर्भ खोने के बाद उदासी, घबराहट या सुन्नपन आम है, दोनों साथियों के लिए। Tele-MANAS 14416 मुफ़्त है, कभी भी।' }) + '</p></div>' +
      askBtn({ en: 'Two or more miscarriages', hi: 'दो या ज़्यादा बार गर्भ गिरना' });
    S.wire(v);
  }

  /* ---------- sample data for Priya (27, PMOS): trying 7 months, part of the checklist, one full cycle of signs ---------- */
  function sampleSigns(S2) {
    const out = {}; const st = S2.cycle.starts(); if (st.length < 2) return out;
    const prev = S2.fromISO(st[st.length - 2]), cur = S2.fromISO(st[st.length - 1]); const td = S2.today();
    const wob = [0, 0.05, -0.05, 0.1, 0, -0.1, 0.05, 0.1, -0.05, 0];
    const plen = S2.diffDays(prev, cur); const rise = Math.max(12, plen - 13);
    for (let d = 1; d <= plen; d++) {
      if ([4, 11, 19, rise + 6].indexOf(d) >= 0) continue;
      const hiPhase = d >= rise; let c = (hiPhase ? 36.75 : 36.3) + wob[d % wob.length]; c = Math.round(c * 100) / 100;
      let m = '';
      if (d > 5 && d < 14) m = 'dry'; else if (d === 14 || d === 15) m = 'watery'; else if (d > 15 && d < rise - 4) m = 'sticky';
      else if (d >= rise - 4 && d < rise - 2) m = 'creamy'; else if (d >= rise - 2 && d < rise) m = 'eggwhite'; else if (d >= rise && d < rise + 3) m = 'sticky'; else if (d >= rise + 3) m = 'dry';
      let lh = ''; if (d === 15 || d === rise - 2) lh = 'pos'; else if (d === 13 || d === rise - 4 || d === rise - 3 || d === rise) lh = 'neg';
      out[S2.toISO(S2.addDays(prev, d - 1))] = { c: c, m: m, lh: lh };
    }
    const cd = S2.diffDays(cur, td) + 1;
    for (let d = 1; d <= Math.min(cd, 40); d++) {
      if (d === 3 || d === 9) continue;
      const c = Math.round((36.3 + wob[(d + 3) % wob.length]) * 100) / 100;
      out[S2.toISO(S2.addDays(cur, d - 1))] = { c: c, m: d > 5 ? (d > 12 ? 'sticky' : 'dry') : '', lh: d === 12 ? 'neg' : '' };
    }
    return out;
  }

  /* ---------- registration ---------- */
  S.register({
    id: 'ttc',
    demoPersona: 'priya',
    strings: {
      en: {
        ttc_hub: 'Trying for a baby', ttc_hub_s: 'Before you start, months of trying, tests, your partner',
        ttc_prep: 'Before you start: checklist', ttc_prep_s: 'Folic acid, blood tests, rubella, thalassaemia, medicines',
        ttc_trying: 'Months of trying', ttc_trying_s: 'Your count, and when doctors suggest getting checked',
        ttc_signs: 'Fertility signs log', ttc_signs_s: 'Waking temperature, mucus and LH strips, as data only',
        ttc_tests: 'Tests and treatments', ttc_tests_s: 'What is checked for her and him, IUI, IVF and the law',
        ttc_partner: 'For your partner', ttc_partner_s: 'Semen test, heat, tobacco, steroids: a couple\'s question',
        ttc_loss2: 'Two or more miscarriages', ttc_loss2_s: 'Not your fault. The tests that help, and where',
        ttc_month: 'Month {n} of trying', ttc_s_mucus_short: 'Mucus',
        ttc_home_s: 'Checklist {a} of {b} done · {c} temperatures this cycle',
        ttc_sum_t: 'Trying for a baby'
      },
      hi: {
        ttc_hub: 'बच्चे की कोशिश', ttc_hub_s: 'शुरू करने से पहले, कोशिश के महीने, जाँचें, आपके साथी',
        ttc_prep: 'शुरू करने से पहले: चेकलिस्ट', ttc_prep_s: 'Folic acid, blood test, rubella, thalassaemia, दवाएँ',
        ttc_trying: 'कोशिश के महीने', ttc_trying_s: 'आपकी गिनती, और डॉक्टर कब जाँच की सलाह देते हैं',
        ttc_signs: 'Fertility संकेतों का रिकॉर्ड', ttc_signs_s: 'सुबह का तापमान, म्यूकस और LH strip, सिर्फ़ डेटा',
        ttc_tests: 'जाँचें और इलाज', ttc_tests_s: 'महिला और पुरुष की जाँचें, IUI, IVF और क़ानून',
        ttc_partner: 'पति या साथी के लिए', ttc_partner_s: 'Semen test, गर्मी, तंबाकू, steroids: दोनों का सवाल',
        ttc_loss2: 'दो या ज़्यादा बार गर्भ गिरना', ttc_loss2_s: 'आपकी ग़लती नहीं। कौन-सी जाँचें मदद करती हैं, और कहाँ',
        ttc_month: 'कोशिश का महीना {n}', ttc_s_mucus_short: 'म्यूकस',
        ttc_home_s: 'चेकलिस्ट {b} में से {a} पूरी · इस चक्र में {c} तापमान',
        ttc_sum_t: 'बच्चे की कोशिश'
      }
    },
    routes: { 'ttc': renderHub, 'ttc-prep': renderPrep, 'ttc-trying': renderTrying, 'ttc-signs': renderSigns, 'ttc-tests': renderTests, 'ttc-partner': renderPartner, 'ttc-loss2': renderLoss2 },
    open: ['ttc', 'ttc-prep', 'ttc-trying', 'ttc-signs', 'ttc-tests', 'ttc-partner', 'ttc-loss2'],
    tiles: [
      { section: 'ttc', route: 'ttc', title: 'ttc_hub', sub: 'ttc_hub_s', icon: 'baby', order: 1, gated: false, keywords: 'trying to conceive planning pregnancy baby infertility fertility bachcha garbh' },
      { section: 'ttc', route: 'ttc-prep', title: 'ttc_prep', sub: 'ttc_prep_s', icon: 'check', order: 10, gated: false, keywords: 'preconception folic acid rubella thalassaemia hplc blood group checklist before pregnancy' },
      { section: 'ttc', route: 'ttc-trying', title: 'ttc_trying', sub: 'ttc_trying_s', icon: 'clock', order: 20, gated: true, keywords: 'months trying not getting pregnant when to see doctor infertility 12 months 6 months' },
      { section: 'ttc', route: 'ttc-signs', title: 'ttc_signs', sub: 'ttc_signs_s', icon: 'chart', order: 40, gated: false, keywords: 'bbt basal body temperature cervical mucus lh strip ovulation chart' },
      { section: 'ttc', route: 'ttc-tests', title: 'ttc_tests', sub: 'ttc_tests_s', icon: 'file', order: 50, gated: false, keywords: 'amh hsg ssg semen analysis iui ivf icsi art act genital tb letrozole' },
      /* Version 39.7 (journey audit P3-18): his page opens from the trying card on "For my family" and from Getting ready; no tile of its own */
      { section: 'ttc', route: 'ttc-loss2', title: 'ttc_loss2', sub: 'ttc_loss2_s', icon: 'heart', order: 70, gated: false, keywords: 'recurrent miscarriage pregnancy loss abortion karyotype antiphospholipid' }
    ],
    css: [
      '.ttc-fi { flex-shrink: 0; width: 20px; height: 20px; display: inline-flex; }',
      '.ttc-fi svg { width: 20px; height: 20px; }',
      '.ttc-ft { min-width: 0; overflow-wrap: anywhere; }',
      '.ttc-lab { min-width: 0; display: flex; flex-direction: column; gap: 3px; overflow-wrap: anywhere; }',
      '.ttc-lab .small { font-weight: 400; }',
      '.ttc-big { font-family: var(--font-display); font-size: 48px; font-weight: 600; color: var(--fg); line-height: 1; }',
      'body.hi .ttc-big { font-family: var(--font-hi); font-size: 40px; }',
      '.ttc-bar { height: 10px; border-radius: 5px; background: var(--bg); overflow: hidden; }',
      '.ttc-bar i { display: block; height: 10px; border-radius: 5px; background: var(--accent-strong); }',
      '.card.soft .ttc-bar { background: var(--card); }',
      '.ttc-prog { gap: 8px; }',
      '.ttc-chart { width: 100%; height: auto; display: block; }',
      '.ttc-chart .gd { stroke: var(--line); stroke-width: 1; }',
      '.ttc-chart .ln { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }',
      '.ttc-chart .pt { fill: var(--accent); }',
      '.ttc-chart .td { stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 3 3; }',
      '.ttc-chart text { fill: var(--muted); font-size: 13px; font-family: inherit; }',
      '.ttc-m0 { fill: var(--card); stroke: var(--muted); stroke-width: 1.2; }',
      '.ttc-m1 { fill: var(--peach); stroke: var(--gold); stroke-width: 1; }',
      '.ttc-m2 { fill: var(--gold); }',
      '.ttc-m3 { fill: var(--accent-2); }',
      '.ttc-m4 { fill: var(--accent); }',
      '.ttc-lhp { fill: var(--gold); }',
      '.ttc-lhn { stroke: var(--muted); stroke-width: 1.6; stroke-linecap: round; }',
      '.ttc-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 12px; color: var(--muted); }',
      '.ttc-legend span { display: inline-flex; align-items: center; gap: 5px; }',
      '.ttc-legend svg { width: 12px; height: 12px; flex-shrink: 0; }',
      '.ttc-entry { gap: 8px; }',
      '.ttc-acts { display: flex; gap: 2px; flex-shrink: 0; }',
      '.ttc-acts .btn { padding: 0 8px; }',
      '.ttc-unit { flex-wrap: nowrap; flex-shrink: 0; }',
      '.ttc-unit .chip { padding: 0 12px; }',
      '.ttc-kv { grid-template-columns: auto minmax(0, 1fr); }',
      '.ttc-kv dt { color: var(--fg); font-weight: 600; }',
      '.ttc-kv dd { text-align: left; font-weight: 400; color: var(--text); }',
      '.ttc-tl { display: flex; flex-direction: column; gap: 8px; font-size: 14px; overflow-wrap: anywhere; }',
      '.ttc-tl strong { color: var(--fg); }',
      '.ttc-msg { overflow-wrap: anywhere; }',
      '.ttc-p { font-size: 14px; color: var(--text); line-height: 1.5; overflow-wrap: anywhere; }',
      '.ttc-start { align-self: flex-start; }'
    ].join('\n'),
    home: (S2) => {
      if (!S2.canSave()) return ''; const sit = S2.state.situation || {}; const d = (S2.state.mods || {}).ttc;
      if (!d || !d.since || !sit.planning || sit.pregnant) return '';
      const m = monthsSince(d.since);
      return '<button type="button" class="action" data-go="ttc"><span class="ico accent">' + S2.I.baby + '</span><span class="body"><strong>' + esc(fill(t('ttc_month'), { n: m + 1 })) + '</strong><span class="small">' + esc(fill(t('ttc_home_s'), { a: prepDone(d), b: PREP_ALL.length, c: thisCycleCount(d) })) + '</span></span><span class="go">' + S2.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
    },
    summary: (S2) => {
      const d = (S2.state.mods || {}).ttc; if (!d) return [];
      const lines = []; let prepLine = null;
      if (d.since) lines.push(fill(tx({ en: 'Trying since {d} ({n} months)', hi: '{d} से कोशिश ({n} महीने)' }), { d: dayY(S2.fromISO(d.since)), n: monthsSince(d.since) }));
      if (d.prep && prepDone(d)) lines.push(prepLine = fill(tx({ en: 'Before-pregnancy checklist: {a} of {b} done', hi: 'गर्भ से पहले की चेकलिस्ट: {b} में से {a} पूरी' }), { a: prepDone(d), b: PREP_ALL.length }));
      const fl = FLAGS.filter((f) => (d.flags || {})[f.k]).map((f) => tx(f)); if (fl.length) lines.push(tx({ en: 'She ticked: ', hi: 'उन्होंने चुना: ' }) + fl.join('; '));
      const sg = d.signs || {}; const ls = S2.cycle.lastStart();
      if (Object.keys(sg).length) {
        const cur = ls ? Object.keys(sg).filter((k) => k >= S2.toISO(ls)) : Object.keys(sg);
        lines.push(fill(tx({ en: 'Signs log: {n} days with temperature this cycle, {k} positive LH strips; {all} days logged in all', hi: 'संकेत रिकॉर्ड: इस चक्र में {n} दिन तापमान, {k} positive LH strip; कुल {all} दिन दर्ज' }), { n: cur.filter((k) => sg[k].c != null).length, k: cur.filter((k) => sg[k].lh === 'pos').length, all: Object.keys(sg).length }));
      }
      /* the doctor's summary (Version 33) leaves out her own checklist's progress */
      return lines.length ? [{ title: t('ttc_sum_t'), lines: lines, doctorLines: lines.filter((l) => l !== prepLine) }] : [];
    },
    sample: (id, S2) => {
      if (id !== 'priya') return;
      S2.state.situation = S2.state.situation || {}; S2.state.situation.planning = true;
      const d = S2.data('ttc'); const td = S2.today();
      d.since = S2.toISO(new Date(td.getFullYear(), td.getMonth() - 7, Math.min(td.getDate(), 28)));
      d.prep = { folic: true, hb: true, bg: true, tsh: true, infect: true, tobacco: true, dental: true, p_tobacco: true };
      d.flags = {}; d.unit = 'C'; d.signs = sampleSigns(S2);
    },
    afterRender: (v, route) => { if (!mineRoute(route)) ui = null; }
  });
})(window.Saathi);
