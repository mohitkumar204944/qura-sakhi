/* Intimate health and safety: a discharge/itching/pain helper, free STI testing, painful sex early in marriage, prolapse and leaking urine, and violence with a quick exit. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const D = () => S.data('intimate');
  const savedChecks = () => (((S.state.mods || {}).intimate || {}).checks || []);

  /* What she taps on the helper and types into the safety plan lives only here, in memory.
     It is wiped when she leaves that screen, presses Quick exit, or the diary is replaced (sample, delete). */
  let mem = null;
  const blankPlan = () => ({ ticks: {}, who: '', code: '', where: '' });
  const fresh = () => { mem = { owner: S.state, danger: [], dis: '', smell: '', sym: [], preg: !!(S.state.situation || {}).pregnant, partner: false, plan: blankPlan() }; };
  const own = () => { if (!mem || mem.owner !== S.state) fresh(); };
  const wipeCheck = () => { if (!mem) return; mem.danger = []; mem.dis = ''; mem.smell = ''; mem.sym = []; mem.partner = false; mem.savedSig = null; mem.openSaved = false; mem.preg = !!(S.state.situation || {}).pregnant; };

  /* Quick-exit cover. Memory only and tied to this diary object, so nothing on the phone records that it was used. */
  let cover = { on: false, owner: null, taps: [] };
  let chrome = { hidden: false, title: '' };

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(S.one(s, v)).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const dayY = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short', year: 'numeric' });
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol>';
  const goBtn = (route, label, cls) => '<button type="button" class="btn ' + (cls || 'sm') + '" data-go="' + route + '">' + T(label) + '</button>';
  const askBtn = (topic) => '<button type="button" class="btn secondary block" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button>';
  const ext = (href, label) => '<a href="' + href + '" target="_blank" rel="noopener">' + T(label) + '</a>';
  const flag = (cls, o) => '<div class="flag ' + cls + '"><span class="intimate-fi">' + S.I.help + '</span><span class="intimate-ft">' + T(o) + '</span></div>';
  const entry = (title, body) => '<div class="intimate-entry"><strong>' + T(title) + '</strong><span>' + T(body) + '</span></div>';
  const NOT_SAVED = { en: 'Nothing on this page is saved.', hi: 'इस पन्ने पर कुछ भी save नहीं होता।' };

  const HL = {
    '112': { en: 'Emergency: police, ambulance, fire. Any time', hi: 'आपातकाल: पुलिस, एम्बुलेंस, फ़ायर। कभी भी' },
    '108': { en: 'Ambulance', hi: 'एम्बुलेंस' },
    '181': { en: 'Women Helpline, free, 24 hours', hi: 'महिला हेल्पलाइन, मुफ़्त, 24 घंटे' },
    '14490': { en: 'National Commission for Women helpline, 24 hours', hi: 'राष्ट्रीय महिला आयोग हेल्पलाइन, 24 घंटे' },
    '15100': { en: 'Free legal aid (NALSA)', hi: 'मुफ़्त क़ानूनी मदद (NALSA)' },
    '14416': { en: 'Tele-MANAS: someone to talk to, free, 24×7', hi: 'Tele-MANAS: बात करने के लिए, मुफ़्त, 24×7' },
    '1098': { en: 'Childline: for anyone under 18', hi: 'Childline: 18 से कम उम्र के लिए' },
    '1097': { en: 'NACO helpline: HIV and STI, free, 24 hours', hi: 'NACO हेल्पलाइन: HIV और STI, मुफ़्त, 24 घंटे' }
  };
  const lines = (nums0) => { const nums = nums0.filter((n) => !S.emNums || S.emNums([n]).indexOf(n) >= 0); if (!nums.length) return '';   /* Version 39.70: no 112, Tele-MANAS, 181 or Childline */
    return '<div class="list">' + nums.map((n) => '<div class="helpline"><div class="intimate-hl"><div class="n num">' + esc(n) + '</div><div class="what">' + T(HL[n]) + '</div></div><button type="button" class="btn sm" data-in-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>').join('') + '</div>'; };
  function wireCopy(v) {
    v.querySelectorAll('[data-in-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.inCopy; const done = () => S.toast(t('copied') + ' ' + n);
      const pick = () => { try { const el = b.parentElement.querySelector('.n'); const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) { /* selection blocked */ } S.toast(n); };
      try { navigator.clipboard.writeText(n).then(done, pick); } catch (e) { pick(); }
    }));
  }

  /* ---------- symptom helper: labels ---------- */
  const DANGER = {
    faint: { en: 'Fainting, dizziness or breathlessness', hi: 'बेहोशी, चक्कर या साँस फूलना' },
    severe: { en: "Severe belly pain, can't stand or walk", hi: 'पेट में बहुत तेज़ दर्द, खड़ी नहीं हो पा रहीं या चल नहीं पा रहीं' },
    ectopic: { en: 'Period late or test positive, with one-sided belly pain or shoulder-tip pain', hi: 'पीरियड देर से या test positive, साथ में एक तरफ़ पेट दर्द या कंधे की नोक में दर्द' },
    pbleed: { en: 'Pregnant, with bleeding or fluid leaking', hi: 'गर्भ में ब्लीडिंग या पानी निकलना' }
  };
  const DIS = {
    curd: { en: 'Thick and white, like curd', hi: 'गाढ़ा और सफ़ेद, दही जैसा' },
    grey: { en: 'Thin, watery, grey-white', hi: 'पतला, पानी जैसा, सलेटी-सफ़ेद' },
    frothy: { en: 'Frothy, yellow-green', hi: 'झागदार, पीला-हरा' },
    pus: { en: 'Yellow or green, thick like pus', hi: 'पीला या हरा, मवाद जैसा गाढ़ा' },
    blood: { en: 'Brown or blood-stained, not your period', hi: 'भूरा या ख़ून मिला, पीरियड के अलावा' },
    normal: { en: 'Clear or white, just more than usual', hi: 'साफ़ या सफ़ेद, बस आम से ज़्यादा' }
  };
  const SMELL = {
    fishy: { en: 'Fishy smell, stronger after sex', hi: 'मछली जैसी गंध, संबंध के बाद ज़्यादा' },
    bad: { en: 'Strong bad smell', hi: 'तेज़ बदबू' }
  };
  const SYM = {
    itch: { en: 'Itching', hi: 'खुजली' },
    burn: { en: 'Burning when peeing', hi: 'पेशाब में जलन' },
    sores: { en: 'Sores or blisters', hi: 'घाव या छाले' },
    warts: { en: 'Small bumps or warts', hi: 'छोटे दाने या मस्से' },
    belly: { en: 'Lower belly pain', hi: 'पेट के निचले हिस्से में दर्द' },
    fever: { en: 'Fever', hi: 'बुख़ार' },
    sexpain: { en: 'Pain during sex', hi: 'संबंध के समय दर्द' },
    sexbleed: { en: 'Bleeding after sex', hi: 'संबंध के बाद ब्लीडिंग' },
    lump: { en: 'Lump or swelling near the opening', hi: 'योनि के मुँह के पास गाँठ या सूजन' }
  };
  const CTX = {
    preg: { en: 'I am pregnant', hi: 'मैं गर्भवती हूँ' },
    partner: { en: 'A partner has an STI or signs of one', hi: 'पार्टनर को STI है या उसके लक्षण हैं' }
  };

  /* Four levels of urgency plus "sounds normal". Same wording style as the core safety guide. */
  const LV = [
    { h: { en: 'Go to the nearest hospital now', hi: 'अभी सबसे पास के अस्पताल जाएँ' }, p: { en: "Go to the nearest hospital emergency now. Don't wait for a clinic appointment or a test.", hi: 'अभी नज़दीकी अस्पताल की emergency में जाएँ। क्लिनिक के समय या किसी test का इंतज़ार न करें।' }, short: { en: 'Go to the nearest hospital now', hi: 'अभी सबसे पास के अस्पताल जाएँ' } },
    { h: { en: 'See a doctor today', hi: 'आज ही डॉक्टर को दिखाएँ' }, p: { en: 'Go to a government hospital today: the gynae OPD in the day, emergency at night. A gynaecologist is fine too. If it gets worse, go to the nearest hospital.', hi: 'आज ही सरकारी अस्पताल जाएँ: दिन में gynae OPD, रात में emergency। स्त्री रोग विशेषज्ञ के पास भी जा सकती हैं। तकलीफ़ बढ़े तो सबसे पास के अस्पताल जाएँ।', doc: { en: 'See a gynaecologist today, or go to a government hospital: the gynae OPD in the day, emergency at night. If it gets worse, go to the nearest hospital.', hi: 'आज ही स्त्री रोग विशेषज्ञ को दिखाएँ, या सरकारी अस्पताल जाएँ: दिन में gynae OPD, रात में emergency। तकलीफ़ बढ़े तो सबसे पास के अस्पताल जाएँ।' } }, short: { en: 'Today', hi: 'आज ही' } },
    { h: { en: 'See a doctor this week', hi: 'इसी हफ़्ते डॉक्टर को दिखाएँ' }, p: { en: 'In the next few days: a Suraksha clinic, your PHC, the district hospital gynae OPD, or a gynaecologist. Sooner if it gets worse or a fever starts.', hi: 'अगले कुछ दिनों में: सुरक्षा क्लिनिक, आपका PHC, ज़िला अस्पताल की gynae OPD, या स्त्री रोग विशेषज्ञ। तकलीफ़ बढ़े या बुख़ार आए तो और जल्दी।', doc: { en: 'In the next few days: a gynaecologist, or a Suraksha clinic, your PHC or the district hospital gynae OPD. Sooner if it gets worse or a fever starts.', hi: 'अगले कुछ दिनों में: स्त्री रोग विशेषज्ञ, या सुरक्षा क्लिनिक, आपका PHC या ज़िला अस्पताल की gynae OPD। तकलीफ़ बढ़े या बुख़ार आए तो और जल्दी।' } }, short: { en: 'This week', hi: 'इसी हफ़्ते' } },
    { h: { en: 'See a doctor when you can', hi: 'जब हो सके, डॉक्टर को दिखाएँ' }, p: { en: 'Within the next 2–3 weeks is fine. Go sooner if it gets worse, keeps coming back, or new signs appear.', hi: 'अगले 2–3 हफ़्तों में दिखाना ठीक है। तकलीफ़ बढ़े, बार-बार हो, या नए लक्षण आएँ तो जल्दी जाएँ।' }, short: { en: 'When convenient', hi: 'जब सुविधा हो' } },
    { h: { en: 'This sounds like normal discharge', hi: 'यह सामान्य सफ़ेद पानी लगता है' }, p: { en: 'Discharge changes through the month: clear and stretchy around the middle of the cycle, thicker and white before a period, and more in pregnancy. No visit is needed for this alone. See a doctor if the colour or smell changes, or itching or burning starts.', hi: 'महीने भर में सफ़ेद पानी बदलता रहता है: चक्र के बीच में साफ़ और खिंचने वाला, पीरियड से पहले गाढ़ा और सफ़ेद, और गर्भ में ज़्यादा। सिर्फ़ इसके लिए डॉक्टर के पास जाना ज़रूरी नहीं। रंग या गंध बदले, या खुजली या जलन शुरू हो, तो डॉक्टर को दिखाएँ।' }, short: { en: 'Likely normal', hi: 'शायद सामान्य' } }
  ];

  /* "Often" statements. Never a label about her; always possible causes. sti = may need partner treatment. */
  const CAUSE = {
    yeast: { sti: false, en: 'Thick white discharge like curd, with itching, is often a yeast (fungal) infection. It is not an STI. It is more common in pregnancy, with high sugar (diabetes), and after antibiotics.', hi: 'दही जैसा गाढ़ा सफ़ेद पानी, साथ में खुजली, अक्सर yeast (फंगल) इन्फ़ेक्शन होता है। यह STI नहीं है। यह गर्भ में, sugar (diabetes) ज़्यादा होने पर, और antibiotics के बाद ज़्यादा होता है।' },
    bv: { sti: false, en: 'Thin grey-white discharge with a fishy smell is often bacterial vaginosis (BV): the normal bacteria inside get out of balance. It is not counted as an STI, but it is more common after douching and with a new partner. It needs treatment, especially in pregnancy.', hi: 'मछली जैसी गंध वाला पतला सलेटी-सफ़ेद पानी अक्सर bacterial vaginosis (BV) होता है: अंदर के सामान्य bacteria का संतुलन बिगड़ जाता है। इसे STI नहीं गिना जाता, पर अंदर धोने (douching) से और नए पार्टनर के साथ यह ज़्यादा होता है। इसका इलाज ज़रूरी है, ख़ासकर गर्भ में।' },
    trich: { sti: true, en: 'Frothy yellow-green discharge, often with itching or a smell, is often trichomonas, an STI caused by a tiny parasite. It is easy to treat, and your partner needs treatment at the same time.', hi: 'झागदार पीला-हरा पानी, अक्सर खुजली या गंध के साथ, अक्सर trichomonas होता है। यह एक STI है जो एक बहुत छोटे परजीवी से होता है। इसका इलाज आसान है, और पार्टनर का इलाज भी साथ में ज़रूरी है।' },
    chlam: { sti: true, en: 'Pus-like discharge, or new discharge with burning, can be chlamydia or gonorrhoea. These STIs often cause few signs, and untreated they can spread up to the womb and tubes.', hi: 'मवाद जैसा पानी, या जलन के साथ नया सफ़ेद पानी, chlamydia या gonorrhoea हो सकता है। इन STI में अक्सर कम लक्षण होते हैं, और इलाज न हो तो ये ऊपर बच्चेदानी और नलियों तक फैल सकते हैं।' },
    pid: { sti: true, en: 'Lower belly pain with discharge, fever or pain during sex can be PID (pelvic inflammatory disease): an infection of the womb, tubes and ovaries that often starts from an STI. Treated early, it heals. Left alone, it can cause long-term pain and trouble getting pregnant.', hi: 'सफ़ेद पानी, बुख़ार या संबंध में दर्द के साथ पेट के निचले हिस्से में दर्द PID (pelvic inflammatory disease) हो सकता है: बच्चेदानी, नलियों और अंडाशय का इन्फ़ेक्शन, जो अक्सर किसी STI से शुरू होता है। जल्दी इलाज से ठीक हो जाता है। छोड़ दें तो लंबे समय का दर्द और गर्भ ठहरने में मुश्किल हो सकती है।' },
    belly: { sti: false, en: 'Lower belly pain on its own has many causes: a urine infection, period pain, constipation, an ovarian cyst or endometriosis. If discharge or fever join it, PID becomes a concern.', hi: 'सिर्फ़ पेट के निचले हिस्से का दर्द कई वजहों से होता है: पेशाब का इन्फ़ेक्शन, पीरियड का दर्द, क़ब्ज़, अंडाशय की गाँठ (cyst) या endometriosis। साथ में सफ़ेद पानी या बुख़ार हो, तो PID की चिंता होती है।' },
    uti: { sti: false, en: 'Burning when peeing is often a urine infection (UTI). It can also be an STI such as chlamydia or gonorrhoea, especially with new discharge. With fever, shivering or back pain under the ribs, the kidney may be involved: go today.', hi: 'पेशाब में जलन अक्सर पेशाब का इन्फ़ेक्शन (UTI) होता है। यह chlamydia या gonorrhoea जैसा STI भी हो सकता है, ख़ासकर अगर नया सफ़ेद पानी भी हो। साथ में बुख़ार, कँपकँपी या पसलियों के नीचे पीठ दर्द हो, तो इन्फ़ेक्शन गुर्दे तक हो सकता है: आज ही जाएँ।' },
    sores: { sti: true, en: 'Sores or blisters on the private parts are often an STI. Painful blisters that come back are often herpes. A painless sore can be syphilis: the sore heals on its own, but the infection stays in the body. Both need a check and a blood test.', hi: 'निजी अंगों पर घाव या छाले अक्सर STI होते हैं। दर्द वाले छाले जो बार-बार आएँ, अक्सर herpes होते हैं। बिना दर्द का घाव syphilis हो सकता है: घाव अपने-आप भर जाता है, पर इन्फ़ेक्शन शरीर में रहता है। दोनों में जाँच और blood test ज़रूरी है।' },
    warts: { sti: true, en: "Small soft bumps or warts are often genital warts, caused by HPV, a common STI. They are not cancer and can be treated. Don't put wart removers or acids from the chemist on the private parts.", hi: 'छोटे नरम दाने या मस्से अक्सर genital warts होते हैं, जो HPV से होते हैं, एक आम STI। ये cancer नहीं हैं और इनका इलाज है। केमिस्ट से मस्से हटाने वाली दवा या acid निजी अंगों पर न लगाएँ।' },
    cervix: { sti: false, en: 'Bleeding after sex, or brown discharge between periods, often comes from the cervix (the mouth of the womb): an infection such as chlamydia, a harmless raw patch (ectropion) or a small polyp. Now and then it is an early sign of cervical cancer, so it always needs a cervix check.', hi: 'संबंध के बाद ब्लीडिंग, या पीरियड के बीच भूरा पानी, अक्सर cervix (बच्चेदानी के मुँह) से आता है: chlamydia जैसा इन्फ़ेक्शन, एक हानि-रहित कच्ची जगह (ectropion), या छोटा polyp। कभी-कभी यह cervix cancer का शुरुआती संकेत होता है, इसलिए cervix की जाँच हमेशा ज़रूरी है।' },
    sexpain: { sti: false, en: 'Pain during sex often comes from dryness, an infection, muscles that tighten on their own (vaginismus), or deep pain from endometriosis. It is common and treatable. Sex should not hurt.', hi: 'संबंध में दर्द अक्सर सूखेपन, इन्फ़ेक्शन, अपने-आप कसने वाली मांसपेशियों (vaginismus), या endometriosis के गहरे दर्द से होता है। यह आम है और इसका इलाज है। संबंध में दर्द नहीं होना चाहिए।' },
    lump: { sti: false, en: 'A lump at the opening is often a blocked gland (Bartholin\'s cyst). If it turns hot, red and very painful, it may be an abscess that needs draining: go today. A soft bulge that comes down when you strain can be a prolapse.', hi: 'योनि के मुँह पर गाँठ अक्सर एक बंद ग्रंथि (Bartholin\'s cyst) होती है। अगर यह गर्म, लाल और बहुत दर्द वाली हो जाए, तो यह फोड़ा (abscess) हो सकता है जिसमें से मवाद निकालना पड़ता है: आज ही जाएँ। ज़ोर लगाने पर नीचे आने वाला नरम उभार prolapse हो सकता है।' },
    itch: { sti: false, en: 'Itching without much discharge is often yeast, or irritation from soap, scented washes, pads or tight synthetic underwear. After menopause, dryness can itch too. Long-standing itching with white patches on the skin needs a doctor to look.', hi: 'बिना ज़्यादा सफ़ेद पानी के खुजली अक्सर yeast होती है, या साबुन, ख़ुशबू वाले wash, pad या तंग synthetic कपड़ों से जलन। मेनोपॉज़ के बाद सूखेपन से भी खुजली होती है। लंबे समय की खुजली जिसमें त्वचा पर सफ़ेद धब्बे हों, डॉक्टर को ज़रूर दिखाएँ।' },
    smell: { sti: false, en: 'A strong bad smell can be BV or trichomonas. It can also be a tampon, cloth or condom forgotten inside. A doctor can take it out gently.', hi: 'तेज़ बदबू BV या trichomonas से हो सकती है। यह अंदर भूला हुआ tampon, कपड़ा या condom भी हो सकता है। डॉक्टर उसे आराम से निकाल देती हैं।' },
    normal: { sti: false, en: "Clear or white discharge without itching, smell or pain is usually the body's normal way of keeping the vagina clean.", hi: 'बिना खुजली, गंध या दर्द का साफ़ या सफ़ेद पानी आम तौर पर योनि को साफ़ रखने का शरीर का सामान्य तरीक़ा है।' },
    partner: { sti: true, en: 'If a partner has an STI, you may have it too, even with no signs. Get tested. Usually you are both treated at the same time.', hi: 'अगर पार्टनर को STI है, तो आपको भी हो सकता है, भले कोई लक्षण न हो। जाँच कराएँ। आम तौर पर दोनों का इलाज साथ में होता है।' },
    fever: { sti: false, en: 'Fever on its own has many causes, such as viral fever, malaria, dengue or a urine infection. A high fever, or one lasting more than 2–3 days, needs a doctor.', hi: 'सिर्फ़ बुख़ार की कई वजहें होती हैं, जैसे वायरल बुख़ार, मलेरिया, डेंगू या पेशाब का इन्फ़ेक्शन। तेज़ बुख़ार, या 2–3 दिन से ज़्यादा रहने वाला बुख़ार, डॉक्टर को दिखाएँ।' }
  };

  /* Urgency and possible causes from what she tapped. Pure function of the selection; nothing stored. */
  function assess(m) {
    const has = (k) => m.sym.indexOf(k) >= 0;
    const abn = !!m.dis && m.dis !== 'normal';
    let lvl = 9; const why = [];
    const bump = (l, r) => { if (l < lvl) { lvl = l; why.length = 0; } if (l === lvl && r && why.indexOf(r) < 0) why.push(r); };
    m.danger.forEach((k) => bump(0, DANGER[k]));
    if (m.preg && (has('sexbleed') || m.dis === 'blood')) bump(0, { en: 'Bleeding in pregnancy', hi: 'गर्भ में ब्लीडिंग' });
    if (has('fever') && has('belly')) bump(1, { en: 'Fever with lower belly pain', hi: 'बुख़ार के साथ पेट के निचले हिस्से में दर्द' });
    if (has('fever') && has('burn')) bump(1, { en: 'Fever with burning when peeing', hi: 'बुख़ार के साथ पेशाब में जलन' });
    if (has('fever') && (abn || m.smell || has('sores') || has('lump'))) bump(1, { en: 'Fever with discharge, sores or a swelling', hi: 'बुख़ार के साथ सफ़ेद पानी, घाव या सूजन' });
    if (m.preg && (has('belly') || has('burn'))) bump(1, { en: 'Pregnant, with belly pain or burning when peeing', hi: 'गर्भ में पेट दर्द या पेशाब में जलन' });
    if (has('sores')) bump(2, SYM.sores);
    if (has('burn')) bump(2, SYM.burn);
    if (m.dis === 'frothy' || m.dis === 'pus' || m.dis === 'blood') bump(2, DIS[m.dis]);
    if (m.smell === 'bad') bump(2, SMELL.bad);
    if (has('belly')) bump(2, SYM.belly);
    if (has('sexbleed')) bump(2, SYM.sexbleed);
    if (has('lump')) bump(2, SYM.lump);
    if (has('fever')) bump(2, SYM.fever);
    if (m.partner) bump(2, CTX.partner);
    if (m.preg && (abn || m.smell || has('itch') || has('warts') || has('sexpain'))) bump(2, { en: 'In pregnancy, infections are checked sooner', hi: 'गर्भ में इन्फ़ेक्शन की जाँच जल्दी होती है' });
    if (m.dis === 'curd' || m.dis === 'grey') bump(3, DIS[m.dis]);
    if (m.smell === 'fishy') bump(3, SMELL.fishy);
    if (has('itch')) bump(3, SYM.itch);
    if (has('warts')) bump(3, SYM.warts);
    if (has('sexpain')) bump(3, SYM.sexpain);
    if (m.dis === 'normal') bump(4, DIS.normal);

    const c = [];
    const add = (k) => { if (c.indexOf(k) < 0) c.push(k); };
    if (m.dis === 'curd') add('yeast');
    if (m.dis === 'grey' || m.smell === 'fishy') add('bv');
    if (m.dis === 'frothy') add('trich');
    if (m.dis === 'pus' || (has('burn') && abn)) add('chlam');
    if (has('belly') && (abn || has('fever') || !!m.smell || has('sexpain'))) add('pid'); else if (has('belly')) add('belly');
    if (has('burn')) add('uti');
    if (has('sores')) add('sores');
    if (has('warts')) add('warts');
    if (m.dis === 'blood' || has('sexbleed')) add('cervix');
    if (has('sexpain')) add('sexpain');
    if (has('lump')) add('lump');
    if (has('itch') && m.dis !== 'curd') add('itch');
    if (m.smell === 'bad') add('smell');
    if (m.dis === 'normal') add('normal');
    if (m.partner) add('partner');
    if (has('fever') && !c.length) add('fever');
    const any = lvl < 9;
    return { lvl: any ? lvl : null, why: why, causes: c, sti: c.some((k) => CAUSE[k].sti), any: any };
  }
  const tapped = (x) => [].concat((x.danger || []).map((k) => DANGER[k]), x.dis ? [DIS[x.dis]] : [], x.smell ? [SMELL[x.smell]] : [], (x.sym || []).map((k) => SYM[k]), x.partner ? [CTX.partner] : []).filter(Boolean).map(tx).join(', ');

  /* ---------- hub ---------- */
  function renderHub(v) {
    own();
    const item = (route, ico, title, sub, gated) => '<button type="button" class="item" data-go="' + route + '"><span class="ico-sm">' + S.icon(ico) + '</span><span class="body"><strong>' + esc(t(title)) + '</strong><span>' + esc(t(sub)) + '</span></span>' + (gated && S.flags.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '</button>';
    v.innerHTML = S.backRow(t('intimate_hub'), 'care', false) +
      '<p class="small">' + T({ en: 'Discharge, itching, pain with sex, leaking urine or a worry about an infection. These are common, and you can ask about them without shame. Nothing on these pages is saved unless you choose.', hi: 'सफ़ेद पानी, खुजली, संबंध में दर्द, पेशाब लीक होना या किसी इन्फ़ेक्शन की चिंता। ये सब आम बातें हैं, और इनके बारे में बिना शर्म के पूछ सकती हैं। इन पन्नों पर कुछ भी save नहीं होता, जब तक आप ख़ुद न चुनें।' }) + '</p>' +
      '<div class="list">' + item('intimate-check', 'drop', 'intimate_check', 'intimate_check_s', true) + item('intimate-sti', 'check', 'intimate_sti', 'intimate_sti_s') + item('intimate-firsttime', 'heart', 'intimate_first', 'intimate_first_s') + item('intimate-prolapse', 'flower', 'intimate_prolapse', 'intimate_prolapse_s') + item('intimate-safety', 'lock', 'intimate_safety', 'intimate_safety_s') + '</div>' +
      '<div class="card"><h3>' + T({ en: 'Free and private, near you', hi: 'आपके पास, मुफ़्त और गोपनीय' }) + '</h3>' +
      entry({ en: 'Suraksha clinic', hi: 'सुरक्षा क्लिनिक' }, { en: 'The STI/RTI clinic at the government district hospital or medical college. A private talk, a check-up, and medicines for infections from the national programme, given free.', hi: 'सरकारी ज़िला अस्पताल या मेडिकल कॉलेज का STI/RTI क्लिनिक। अकेले में बात, जाँच, और इन्फ़ेक्शन की दवाएँ, जो राष्ट्रीय कार्यक्रम से मुफ़्त मिलती हैं।' }) +
      entry({ en: 'ICTC', hi: 'ICTC' }, { en: 'Free, confidential HIV test with counselling, in government hospitals.', hi: 'सरकारी अस्पतालों में मुफ़्त और गोपनीय HIV test, सलाह के साथ।' }) +
      lines(['1097', '181']) + '</div>' +
      '<div class="action intimate-static"><span class="ico accent">' + S.I.lock + '</span><span class="body"><strong>' + T({ en: 'Private by design', hi: 'यहाँ सब निजी है' }) + '</strong><span class="small">' + T({ en: 'The safety page has a Quick exit button that hides the app behind a recipe. On a shared phone, Discreet mode on the Me page hides your numbers.', hi: 'सुरक्षा वाले पन्ने पर “तुरंत छुपाएँ” बटन है, जो ऐप को एक रेसिपी के पीछे छुपा देता है। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपा देता है।' }) + '</span></span></div>' +
      flag('urgent', { en: 'Severe belly pain with fainting or dizziness, or a late period with pain on one side of the lower belly: go to the nearest hospital now.', hi: 'बेहोशी या चक्कर के साथ पेट में तेज़ दर्द, या पीरियड देर से हो और पेट के निचले हिस्से में एक तरफ़ दर्द हो: अभी सबसे पास के अस्पताल जाएँ।' }) +
      askBtn({ en: 'Intimate health', hi: 'निजी सेहत' });
    S.wire(v); wireCopy(v);
  }

  /* ---------- symptom helper (gated) ---------- */
  function resultHtml(a) {
    if (!a.any) return '<div class="card soft"><p style="color:var(--fg)">' + T({ en: 'Tap what you notice above. Your answer shows here: how soon to see a doctor, and what these signs often turn out to be.', hi: 'ऊपर जो महसूस हो रहा है, उस पर टैप करें। जवाब यहाँ दिखेगा: डॉक्टर को कितनी जल्दी दिखाना है, और ऐसे लक्षण अक्सर किस वजह से होते हैं।' }) + '</p></div>';
    const L = LV[a.lvl];
    const because = a.why.length ? '<p class="small intimate-why">' + T({ en: 'Why: ', hi: 'वजह: ' }) + esc(a.why.map(tx).join(', ')) + '</p>' : '';
    if (a.lvl === 0) {
      return '<div class="card dark" id="in-result"><h2>' + T(L.h) + '</h2><p class="small" style="color:var(--dark-text)">' + T(L.p) + '</p>' + because.replace('class="small intimate-why"', 'class="small intimate-why" style="color:var(--dark-text)"') + '</div>' + lines(['112', '108']);
    }
    let head;
    if (a.lvl === 1) head = '<div class="card intimate-lv1" id="in-result"><div class="eyebrow">' + T({ en: 'How soon', hi: 'कितनी जल्दी' }) + '</div><h2>' + T(L.h) + '</h2><p>' + T(L.p) + '</p>' + because + '</div>';
    else if (a.lvl === 2) head = '<div class="card warn" id="in-result"><div class="eyebrow">' + T({ en: 'How soon', hi: 'कितनी जल्दी' }) + '</div><h2>' + T(L.h) + '</h2><p>' + T(L.p) + '</p>' + because + '</div>';
    else if (a.lvl === 3) head = '<div class="card soft" id="in-result"><div class="eyebrow">' + T({ en: 'How soon', hi: 'कितनी जल्दी' }) + '</div><h2>' + T(L.h) + '</h2><p>' + T(L.p) + '</p>' + because + '</div>';
    else head = '<div class="card ok" id="in-result"><h2 style="color:var(--ok)">' + T(L.h) + '</h2><p>' + T(L.p) + '</p></div>';
    const causes = '<div class="card"><div class="row spread wrap"><h3>' + T({ en: 'What it often turns out to be', hi: 'अक्सर इसकी वजह क्या निकलती है' }) + '</h3><span class="pill muted">' + T({ en: 'Not a diagnosis', hi: 'diagnosis नहीं' }) + '</span></div>' +
      a.causes.map((k) => '<p class="intimate-cause">' + T(CAUSE[k]) + '</p>').join('') +
      '<p class="small">' + T({ en: 'The same signs can have different causes, and two can happen together. Only an examination, and sometimes a swab or test, can tell.', hi: 'एक जैसे लक्षणों की अलग-अलग वजहें हो सकती हैं, और दो इन्फ़ेक्शन साथ भी हो सकते हैं। सिर्फ़ जाँच से, और कभी-कभी swab या test से ही पता चलता है।' }) + '</p></div>';
    const todo = [
      { en: 'Get checked, free and private: a Suraksha clinic (STI/RTI clinic) at the district hospital or medical college, the gynae OPD, or your PHC. Call 1097 to find the nearest HIV and STI testing centre.', hi: 'मुफ़्त और गोपनीय जाँच कराएँ: ज़िला अस्पताल या मेडिकल कॉलेज का सुरक्षा क्लिनिक (STI/RTI क्लिनिक), gynae OPD, या आपका PHC। नज़दीकी HIV और STI जाँच केंद्र जानने के लिए 1097 पर कॉल करें।' }
    ];
    if (a.sti) todo.push({ en: 'If it could be an STI, your partner needs treatment at the same time, even without signs, or the infection comes back. No sex until you both finish the treatment and the doctor says it is fine. Condoms after that.', hi: 'अगर STI हो सकता है, तो पार्टनर का इलाज भी साथ में ज़रूरी है, भले उसे कोई लक्षण न हो, वरना इन्फ़ेक्शन लौट आता है। जब तक दोनों का इलाज पूरा न हो और डॉक्टर ठीक न कहें, संबंध न बनाएँ। उसके बाद condom।' });
    todo.push({ en: "Don't use creams sold over the counter that mix a steroid with antifungal or antibiotic medicines (look for clobetasol, betamethasone or beclomethasone on the label). They calm the itch for a while, then the infection spreads and keeps coming back.", hi: 'केमिस्ट से बिना पर्चे मिलने वाली वह cream न लगाएँ जिसमें steroid के साथ फंगल या antibiotic दवा मिली हो (label पर clobetasol, betamethasone या beclomethasone देखें)। ये कुछ समय खुजली दबाती हैं, फिर इन्फ़ेक्शन फैलता है और बार-बार लौटता है।' });
    todo.push({ en: "Don't wash inside the vagina (douching), and don't use antiseptic liquid or scented washes there. Plain water on the outside is enough.", hi: 'योनि के अंदर न धोएँ (douching), और वहाँ antiseptic liquid या ख़ुशबू वाला wash न लगाएँ। बाहर से सादा पानी काफ़ी है।' });
    todo.push({ en: "Don't take leftover antibiotics or someone else's tablets. Take the full course your doctor gives, even when you feel better.", hi: 'बची हुई antibiotics या किसी और की गोलियाँ न लें। डॉक्टर जो कोर्स दें, पूरा लें, भले बीच में आराम लगे।' });
    if (mem.preg) todo.push({ en: 'Tell the doctor you are pregnant: some medicines and creams change. Infections such as BV, urine infections and syphilis are treated promptly to protect the baby.', hi: 'डॉक्टर को बताएँ कि आप गर्भवती हैं: कुछ दवाएँ और cream बदल जाती हैं। BV, पेशाब का इन्फ़ेक्शन और syphilis जैसे इन्फ़ेक्शन का इलाज जल्दी होता है, ताकि बच्चा सुरक्षित रहे।' });
    const doit = a.lvl === 4 ? '' : '<div class="card"><h3>' + T({ en: 'What to do', hi: 'क्या करें' }) + '</h3>' + steps(todo) + '<div class="row wrap">' + goBtn('intimate-sti', { en: 'Free STI testing', hi: 'मुफ़्त STI जाँच' }) + (a.causes.indexOf('lump') >= 0 ? goBtn('intimate-prolapse', { en: 'About prolapse', hi: 'Prolapse के बारे में' }) : '') + (a.causes.indexOf('sexpain') >= 0 ? goBtn('intimate-firsttime', { en: 'Pain with sex', hi: 'संबंध में दर्द' }) : '') + '</div></div>';
    return head + causes + doit;
  }
  function quraHtml(a) {
    if (!a.any || a.lvl === 0) return '';
    return '<div class="card soft"><p class="small">' + T({ en: "Qura's doctors (BAMS) can talk this through and help you decide where to go. Infections are treated at the clinic or by a gynaecologist; Qura refers.", hi: 'Qura की डॉक्टर (BAMS) इस पर बात करके तय करने में मदद कर सकती हैं कि कहाँ जाएँ। इन्फ़ेक्शन का इलाज क्लिनिक या स्त्री रोग विशेषज्ञ करती हैं; Qura refer करता है।' }) + '</p>' + askBtn({ en: 'Discharge, itching or pain down there', hi: 'सफ़ेद पानी, खुजली या नीचे दर्द' }) + '</div>';
  }
  const sig = (m) => JSON.stringify([m.danger.slice().sort(), m.dis, m.smell, m.sym.slice().sort(), m.preg, m.partner]);
  function saveHtml(a) {
    if (!a.any || a.lvl === 0) return '';
    if (!S.canSave()) return S.needDiary();
    if (mem.savedSig === sig(mem)) return '<div class="card ok"><p class="small" style="color:var(--ok)">' + T({ en: 'Saved on this phone. It is in "Saved checks" below, and is not shared unless you tick Share.', hi: 'इसी फ़ोन पर save हो गया। यह नीचे “Save की गई जाँचें” में है, और तब तक साझा नहीं होता जब तक आप “साझा करें” पर टिक न करें।' }) + '</p></div>';
    return '<div class="card soft"><p class="small">' + T({ en: 'Save this check? Only the date, what you tapped and how soon. It stays on this phone and is not shared unless you tick "Share" on it.', hi: 'यह जाँच save करें? सिर्फ़ तारीख़, आपने क्या चुना, और कितनी जल्दी। यह इसी फ़ोन पर रहती है और तब तक साझा नहीं होती, जब तक आप उस पर “साझा करें” टिक न करें।' }) + '</p><button type="button" class="btn sm" id="in-save">' + T({ en: 'Save this check', hi: 'यह जाँच save करें' }) + '</button></div>';
  }
  function savedHtml() {
    if (!S.canSave()) return '';
    const L = savedChecks(); if (!L.length) return '';
    return '<details class="card intimate-saved"' + (mem.openSaved ? ' open' : '') + '><summary>' + esc(fill(tx({ en: 'Saved checks ({n})', hi: 'Save की गई जाँचें ({n})' }), { n: L.length })) + '</summary><div class="list">' +
      L.slice().reverse().map((x) => '<div class="item quiet intimate-sv"><span class="body"><strong>' + esc(dayY(x.d)) + ' · ' + T(LV[x.lvl] ? LV[x.lvl].short : LV[3].short) + '</strong><span>' + esc(tapped(x)) + '</span><label class="intimate-share"><input type="checkbox" data-in-share="' + esc(x.id) + '"' + (x.share ? ' checked' : '') + '> ' + T({ en: 'Share with my Qura doctor', hi: 'मेरी Qura डॉक्टर से साझा करें' }) + '</label></span><button type="button" class="btn sm" data-in-del="' + esc(x.id) + '">' + T({ en: 'Delete', hi: 'हटाएँ' }) + '</button></div>').join('') +
      '</div><p class="small">' + T({ en: 'Shared checks appear in the summary your Qura doctor sees. Unticked ones stay only on this phone.', hi: 'साझा की गई जाँचें उस summary में दिखती हैं जो आपकी Qura डॉक्टर देखती हैं। बिना टिक वाली सिर्फ़ इसी फ़ोन पर रहती हैं।' }) + '</p></details>';
  }
  function renderCheck(v) {
    own();
    const m = mem; const a = assess(m);
    const chip = (grp, k, label, on) => '<button type="button" class="chip' + (on ? ' on' : '') + '" data-in-' + grp + '="' + k + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + T(label) + '</button>';
    v.innerHTML = S.backRow(t('intimate_check'), 'intimate', true) +
      '<p class="small">' + T({ en: 'Tap what you notice. You will see how soon to see a doctor and what these signs often turn out to be. This is not a diagnosis. Nothing is saved unless you tap Save.', hi: 'जो महसूस हो रहा है, उस पर टैप करें। आप देखेंगी कि डॉक्टर को कितनी जल्दी दिखाना है, और ऐसे लक्षण अक्सर किस वजह से होते हैं। यह diagnosis नहीं है। Save दबाए बिना कुछ भी save नहीं होता।' }) + '</p>' +
      '<div class="card"><h3>' + T({ en: 'First: is any of this happening now?', hi: 'पहले: क्या अभी इनमें से कुछ हो रहा है?' }) + '</h3><div class="chips intimate-chips">' + Object.keys(DANGER).map((k) => chip('danger', k, DANGER[k], m.danger.indexOf(k) >= 0)).join('') + '</div></div>' +
      '<div class="card"><h3>' + T({ en: 'Discharge (white water)', hi: 'सफ़ेद पानी (discharge)' }) + '</h3><p class="small">' + T({ en: 'Pick the one closest. Tap again to clear.', hi: 'जो सबसे मिलता हो, चुनें। हटाने के लिए फिर से टैप करें।' }) + '</p><div class="chips intimate-chips">' + Object.keys(DIS).map((k) => chip('dis', k, DIS[k], m.dis === k)).join('') + '</div>' +
      '<div class="eyebrow">' + T({ en: 'Smell', hi: 'गंध' }) + '</div><div class="chips intimate-chips">' + Object.keys(SMELL).map((k) => chip('smell', k, SMELL[k], m.smell === k)).join('') + '</div></div>' +
      '<div class="card"><h3>' + T({ en: 'Anything else?', hi: 'और कुछ?' }) + '</h3><div class="chips intimate-chips">' + Object.keys(SYM).map((k) => chip('sym', k, SYM[k], m.sym.indexOf(k) >= 0)).join('') + '</div></div>' +
      '<div class="card"><h3>' + T({ en: 'About you', hi: 'आपके बारे में' }) + '</h3><div class="chips intimate-chips">' + chip('ctx', 'preg', CTX.preg, m.preg) + chip('ctx', 'partner', CTX.partner, m.partner) + '</div></div>' +
      resultHtml(a) + saveHtml(a) + savedHtml() + quraHtml(a);
    S.wire(v); wireCopy(v);
    const redraw = () => { const y = window.scrollY; renderCheck(v); window.scrollTo(0, y); };
    const toggle = (arr, k) => { const i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); else arr.push(k); };
    v.querySelectorAll('[data-in-danger]').forEach((b) => b.addEventListener('click', () => { toggle(m.danger, b.dataset.inDanger); redraw(); }));
    v.querySelectorAll('[data-in-dis]').forEach((b) => b.addEventListener('click', () => { m.dis = m.dis === b.dataset.inDis ? '' : b.dataset.inDis; redraw(); }));
    v.querySelectorAll('[data-in-smell]').forEach((b) => b.addEventListener('click', () => { m.smell = m.smell === b.dataset.inSmell ? '' : b.dataset.inSmell; redraw(); }));
    v.querySelectorAll('[data-in-sym]').forEach((b) => b.addEventListener('click', () => { toggle(m.sym, b.dataset.inSym); redraw(); }));
    v.querySelectorAll('[data-in-ctx]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.inCtx; m[k] = !m[k]; redraw(); }));
    const sv = v.querySelector('#in-save');
    if (sv) sv.addEventListener('click', () => {
      const d = D(); d.checks = d.checks || [];
      d.checks.push({ id: 'c' + Date.now().toString(36), d: S.toISO(S.today()), danger: m.danger.slice(), dis: m.dis, smell: m.smell, sym: m.sym.slice(), preg: m.preg, partner: m.partner, lvl: a.lvl, share: false });
      if (d.checks.length > 20) d.checks.splice(0, d.checks.length - 20);
      S.save(); m.openSaved = true; m.savedSig = sig(m); S.toast(t('saved')); redraw();
    });
    v.querySelectorAll('[data-in-share]').forEach((c) => c.addEventListener('change', () => { const x = savedChecks().find((y) => y.id === c.dataset.inShare); if (x) { x.share = c.checked; S.save(); } }));
    v.querySelectorAll('[data-in-del]').forEach((b) => b.addEventListener('click', () => { const d = D(); d.checks = (d.checks || []).filter((y) => y.id !== b.dataset.inDel); S.save(); m.openSaved = true; redraw(); }));
    const det = v.querySelector('.intimate-saved'); if (det) det.addEventListener('toggle', () => { m.openSaved = det.open; });
  }

  /* ---------- STI testing ---------- */
  function renderSti(v) {
    own();
    v.innerHTML = S.backRow(t('intimate_sti'), 'intimate', false) +
      '<p class="small">' + T({ en: 'STIs (infections passed on through sex) are common, and most can be cured. Many give no signs at all, so a test is the only way to know. Testing is free and private in government hospitals.', hi: 'STI (यौन संबंध से फैलने वाले इन्फ़ेक्शन) आम हैं, और ज़्यादातर पूरी तरह ठीक हो जाते हैं। कई में कोई लक्षण नहीं होता, इसलिए test ही जानने का तरीक़ा है। सरकारी अस्पतालों में जाँच मुफ़्त और गोपनीय है।' }) + '</p>' +
      '<div class="card"><h2>' + T({ en: 'Where to go', hi: 'कहाँ जाएँ' }) + '</h2>' +
      entry({ en: 'Suraksha clinic (STI/RTI clinic)', hi: 'सुरक्षा क्लिनिक (STI/RTI क्लिनिक)' }, { en: 'In government district hospitals and medical colleges. A trained doctor and a counsellor see you in private. Medicines come from the national programme\'s colour-coded kits and are given free, with condoms.', hi: 'सरकारी ज़िला अस्पतालों और मेडिकल कॉलेजों में। प्रशिक्षित डॉक्टर और counsellor आपसे अकेले में मिलते हैं। दवाएँ राष्ट्रीय कार्यक्रम की रंग-कोड वाली kit से, condom के साथ, मुफ़्त मिलती हैं।' }) +
      entry({ en: 'ICTC (Integrated Counselling and Testing Centre)', hi: 'ICTC (एकीकृत परामर्श और जाँच केंद्र)' }, { en: 'Mainly in government hospitals, often in the OPD or the gynae department. HIV test with counselling before and after, free and confidential. They also test for syphilis.', hi: 'ज़्यादातर सरकारी अस्पतालों में, अक्सर OPD या gynae विभाग में। HIV test, test से पहले और बाद में सलाह के साथ, मुफ़्त और गोपनीय। Syphilis की जाँच भी होती है।' }) +
      entry({ en: 'Your PHC or ANM', hi: 'आपका PHC या ANM' }, { en: 'A good first stop. They can check you, treat common infections and send you on if needed.', hi: 'पहला क़दम यहाँ से भी हो सकता है। वे जाँच कर सकती हैं, आम इन्फ़ेक्शन का इलाज कर सकती हैं, और ज़रूरत हो तो आगे भेजती हैं।' }) +
      entry({ en: 'Finding the nearest centre', hi: 'नज़दीकी केंद्र कैसे ढूँढें' }, { en: 'Call 1097, the NACO helpline: free, 24 hours, for counselling and the address of your nearest ICTC. The official NACO AIDS App also lists nearby ICTCs, Suraksha clinics and ART centres.', hi: '1097 पर कॉल करें, NACO हेल्पलाइन: मुफ़्त, 24 घंटे, सलाह और नज़दीकी ICTC का पता। NACO की आधिकारिक NACO AIDS App में भी आस-पास के ICTC, सुरक्षा क्लिनिक और ART केंद्र मिलते हैं।' }) +
      lines(['1097']) +
      '<p class="small intimate-links">' + T({ en: 'Official pages: ', hi: 'आधिकारिक पन्ने: ' }) + ext('https://naco.mohfw.gov.in/division/sti-rti-services/', { en: 'NACO STI/RTI services', hi: 'NACO STI/RTI सेवाएँ' }) + ' · ' + ext('https://naco.mohfw.gov.in/living-with-hiv-aids/hotlines-helplines/', { en: 'NACO helpline', hi: 'NACO हेल्पलाइन' }) + '</p></div>' +
      '<div class="card"><h2>' + T({ en: 'What happens there', hi: 'वहाँ क्या होता है' }) + '</h2>' + steps([
        { en: 'A counsellor asks about your signs and risks, in private. You can come alone or bring someone you trust.', hi: 'Counsellor अकेले में आपके लक्षण और जोखिम के बारे में पूछते हैं। आप अकेले आ सकती हैं, या किसी भरोसेमंद व्यक्ति को साथ ला सकती हैं।' },
        { en: 'The doctor examines the area and may take a swab. Often you get medicines the same day, chosen by your signs, without waiting for reports. This is how the national programme works.', hi: 'डॉक्टर जाँच करती हैं और swab ले सकती हैं। अक्सर उसी दिन, लक्षणों के हिसाब से दवा मिल जाती है, report का इंतज़ार किए बिना। राष्ट्रीय कार्यक्रम इसी तरह काम करता है।' },
        { en: 'Blood tests for HIV and syphilis. Ask about hepatitis B and C too.', hi: 'HIV और syphilis के लिए blood test। hepatitis B और C के बारे में भी पूछें।' },
        { en: 'Chlamydia, gonorrhoea and HPV often give no signs. Tell the doctor if you had sex without a condom with a new partner, or your partner has signs.', hi: 'Chlamydia, gonorrhoea और HPV में अक्सर कोई लक्षण नहीं होता। अगर नए पार्टनर के साथ बिना condom संबंध बना हो, या पार्टनर को लक्षण हों, तो डॉक्टर को बताएँ।' },
        { en: 'A very recent risk may not show on a test yet. The counsellor will tell you if you should test again later.', hi: 'बहुत हाल का जोखिम test में अभी न दिखे, ऐसा हो सकता है। Counsellor बताएँगे कि बाद में दोबारा test करना है या नहीं।' }
      ]) + '</div>' +
      '<div class="card ok"><h3 style="color:var(--ok)">' + T({ en: 'Private by law', hi: 'क़ानून से गोपनीय' }) + '</h3><p>' + T({ en: 'Under the HIV and AIDS Act, 2017, nobody can test you for HIV without your informed consent, and your result is confidential. A doctor or counsellor must not tell your partner if that could lead to violence against you.', hi: 'HIV और AIDS क़ानून, 2017 के तहत आपकी सोची-समझी सहमति के बिना कोई आपका HIV test नहीं कर सकता, और आपका result गोपनीय रहता है। अगर बताने से आपके साथ हिंसा हो सकती है, तो डॉक्टर या counsellor आपके पार्टनर को नहीं बताएँगे।' }) + '</p></div>' +
      '<div class="card"><h2>' + T({ en: 'If it is an STI', hi: 'अगर STI निकले' }) + '</h2>' + ul([
        { en: 'Your partner needs treatment at the same time, even without signs. Otherwise you pass it back and forth. Your partner can go to the same Suraksha clinic.', hi: 'पार्टनर का इलाज भी साथ में ज़रूरी है, भले उसे कोई लक्षण न हो। वरना इन्फ़ेक्शन एक से दूसरे में आता-जाता रहता है। पार्टनर उसी सुरक्षा क्लिनिक में जा सकता है।' },
        { en: 'No sex until you both finish the treatment and the doctor says it is fine.', hi: 'जब तक दोनों का इलाज पूरा न हो और डॉक्टर ठीक न कहें, संबंध न बनाएँ।' },
        { en: 'Take every dose, even when the signs go away.', hi: 'हर ख़ुराक लें, भले लक्षण चले जाएँ।' },
        { en: 'Condoms lower the risk of most STIs. They are free at government health centres and Suraksha clinics, and your ASHA keeps them too.', hi: 'Condom से ज़्यादातर STI का ख़तरा कम होता है। सरकारी स्वास्थ्य केंद्रों और सुरक्षा क्लिनिक में ये मुफ़्त मिलते हैं, और आपकी ASHA के पास भी रहते हैं।', doc: { en: 'Condoms lower the risk of most STIs. Any chemist sells them; they are also free at government health centres and Suraksha clinics, and your ASHA keeps them too.', hi: 'Condom से ज़्यादातर STI का ख़तरा कम होता है। ये किसी भी केमिस्ट पर मिलते हैं; सरकारी स्वास्थ्य केंद्रों और सुरक्षा क्लिनिक में मुफ़्त भी मिलते हैं, और आपकी ASHA के पास भी रहते हैं।' } }
      ]) + '<div class="row wrap">' + goBtn('contra-free', { en: 'Free contraception', hi: 'मुफ़्त गर्भनिरोध' }) + goBtn('intimate-check', { en: 'Symptom helper', hi: 'लक्षण सहायक' }) + '</div></div>' +
      '<div class="card"><h2>' + T({ en: 'In pregnancy: HIV and syphilis tests', hi: 'गर्भ में: HIV और syphilis test' }) + '</h2><p>' + T({ en: 'Government policy is to test every pregnant woman for HIV and syphilis at the first antenatal visit, ideally in the first 3 months. The ANM can do it at the health centre or the village health and nutrition day. Ask for both.', hi: 'सरकारी नीति है कि हर गर्भवती महिला का पहली ANC जाँच में, अच्छा हो कि पहले 3 महीनों में, HIV और syphilis test हो। ANM यह स्वास्थ्य केंद्र पर या गाँव के स्वास्थ्य और पोषण दिवस पर कर सकती हैं। दोनों test माँगें।', doc: { en: 'Government policy is to test every pregnant woman for HIV and syphilis at the first antenatal visit, ideally in the first 3 months. Ask your gynaecologist for both.', hi: 'सरकारी नीति है कि हर गर्भवती महिला का पहली ANC जाँच में, अच्छा हो कि पहले 3 महीनों में, HIV और syphilis test हो। अपनी स्त्री रोग विशेषज्ञ से दोनों के लिए कहें।' } }) + '</p><p class="small">' + T({ en: 'Syphilis in pregnancy can cause miscarriage, stillbirth or harm to the baby. Penicillin injections treat it and protect the baby, so the test matters even if you feel well.', hi: 'गर्भ में syphilis से गर्भपात, मृत बच्चे का जन्म, या बच्चे को नुक़सान हो सकता है। Penicillin के इंजेक्शन से इसका इलाज होता है और बच्चा सुरक्षित रहता है, इसलिए ठीक महसूस करें तब भी test ज़रूरी है।' }) + '</p>' + goBtn('preg', { en: 'Pregnancy guide', hi: 'गर्भावस्था गाइड' }) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Vaccines that prevent STIs', hi: 'STI से बचाने वाले टीके' }) + '</h2>' +
      entry({ en: 'HPV vaccine', hi: 'HPV का टीका' }, { en: 'HPV causes genital warts and almost all cervical cancer. Since 28 February 2026, girls aged 14 get the HPV vaccine free at government facilities: Ayushman Arogya Mandirs, CHCs, district hospitals and medical colleges. Older girls and women can get it at private clinics; ask a gynaecologist whether it helps at your age. Vaccinated or not, keep up cervical screening.', hi: 'HPV से genital warts और लगभग सारे cervix cancer होते हैं। 28 फ़रवरी 2026 से 14 साल की लड़कियों को HPV का टीका सरकारी केंद्रों पर मुफ़्त लगता है: आयुष्मान आरोग्य मंदिर, CHC, ज़िला अस्पताल और मेडिकल कॉलेज। बड़ी लड़कियाँ और महिलाएँ इसे निजी क्लिनिक में लगवा सकती हैं; स्त्री रोग विशेषज्ञ से पूछें कि आपकी उम्र में इसका फ़ायदा है या नहीं। टीका लगा हो या नहीं, cervix की जाँच कराती रहें।' }) +
      entry({ en: 'Hepatitis B vaccine', hi: 'Hepatitis B का टीका' }, { en: 'Hepatitis B spreads through blood and sex, and from mother to baby. Babies get this vaccine free in routine immunisation, from birth. Adults who never had it can ask for a blood test and the vaccine, usually 3 doses over 6 months.', hi: 'Hepatitis B ख़ून और यौन संबंध से, और माँ से बच्चे में फैलता है। बच्चों को यह टीका नियमित टीकाकरण में, जन्म से, मुफ़्त लगता है। जिन बड़ों को यह नहीं लगा, वे blood test और टीका माँग सकते हैं, आम तौर पर 6 महीनों में 3 ख़ुराक।' }) +
      goBtn('screen-hpv', { en: 'HPV and cervical screening', hi: 'HPV और cervix की जाँच' }) + '</div>' +
      askBtn({ en: 'STI testing', hi: 'STI जाँच' }) +
      '<p class="footnote">' + T(NOT_SAVED) + '</p>';
    S.wire(v); wireCopy(v);
  }

  /* ---------- pain or difficulty with sex ---------- */
  function renderFirst(v) {
    own();
    const myth = (m, f) => '<div class="intimate-myth"><p class="intimate-mq">' + T(m) + '</p><p>' + T(f) + '</p></div>';
    v.innerHTML = S.backRow(t('intimate_first'), 'intimate', false) +
      '<p class="small">' + T({ en: "Pain, fear, or sex that just doesn't happen in the first weeks or months of marriage is common. It is not your fault, it is not a weakness, and it can be treated.", hi: 'शादी के शुरुआती हफ़्तों या महीनों में दर्द, डर, या संबंध का हो ही न पाना आम है। यह आपकी ग़लती नहीं, कोई कमज़ोरी नहीं, और इसका इलाज है।' }) + '</p>' +
      '<div class="card"><h2>' + T({ en: 'Myths about the first night', hi: 'पहली रात के मिथक' }) + '</h2>' +
      myth({ en: 'Myth: bleeding on the first night proves a woman is a virgin.', hi: 'मिथक: पहली रात ख़ून आना साबित करता है कि लड़की कुँवारी है।' }, { en: "False. Many women don't bleed the first time. The hymen is a thin, stretchy rim of tissue that is different in every woman. Doctors and the WHO agree that looking at it cannot tell whether a woman has had sex.", hi: 'ग़लत। कई महिलाओं को पहली बार ख़ून नहीं आता। Hymen (झिल्ली) एक पतली, लचीली किनारी है, जो हर महिला में अलग होती है। डॉक्टर और WHO मानते हैं कि इसे देखकर यह नहीं बताया जा सकता कि किसी महिला ने संबंध बनाए हैं या नहीं।' }) +
      myth({ en: 'Myth: sex is supposed to hurt, so bear it.', hi: 'मिथक: संबंध में दर्द होता ही है, सह लो।' }, { en: 'A little discomfort the first few times can happen. Strong pain, or pain that keeps coming back, is a sign to stop, slow down and get it checked.', hi: 'पहली कुछ बार थोड़ी असुविधा हो सकती है। तेज़ दर्द, या बार-बार होने वाला दर्द, रुकने, धीरे चलने और जाँच कराने का संकेत है।' }) +
      myth({ en: "Myth: if it won't go in, something is wrong with her body.", hi: 'मिथक: अगर संबंध नहीं हो पाता, तो उसके शरीर में कुछ ख़राबी है।' }, { en: 'Usually the muscles around the opening are tightening on their own, from fear or pain. This is called vaginismus. The body is normal, and the muscles can learn to relax.', hi: 'आम तौर पर योनि के मुँह के आस-पास की मांसपेशियाँ डर या दर्द से अपने-आप कस जाती हैं। इसे vaginismus कहते हैं। शरीर सामान्य है, और मांसपेशियाँ ढीली होना सीख सकती हैं।' }) +
      myth({ en: 'Myth: everything must happen on the first night.', hi: 'मिथक: सब कुछ पहली रात ही होना चाहिए।' }, { en: 'There is no deadline. Many couples take weeks to feel at ease with each other. Going slow is normal.', hi: 'कोई समय-सीमा नहीं है। कई जोड़ों को एक-दूसरे के साथ सहज होने में हफ़्ते लगते हैं। धीरे-धीरे चलना सामान्य है।' }) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Your consent, your pace', hi: 'आपकी मर्ज़ी, आपकी रफ़्तार' }) + '</h2>' + ul([
        { en: 'You can say no, or stop at any point, including in marriage. Being forced is never okay.', hi: 'आप मना कर सकती हैं, या किसी भी समय रोक सकती हैं, शादी में भी। ज़बरदस्ती कभी ठीक नहीं है।' },
        { en: 'Go slow. Time, touching and kissing first, and feeling relaxed help the body get ready and wet on its own.', hi: 'धीरे चलें। समय, पहले छूना और प्यार जताना, और सहज महसूस करना, शरीर को अपने-आप तैयार और गीला होने में मदद करते हैं।' },
        { en: "A water-based lubricant (gel) from the chemist helps a lot. Don't use oil or petroleum jelly with condoms: it can make them tear.", hi: 'केमिस्ट से मिलने वाला पानी-आधारित lubricant (gel) बहुत मदद करता है। Condom के साथ तेल या petroleum jelly न लगाएँ: इससे condom फट सकता है।' },
        { en: 'Talk to each other. Saying what hurts and what feels okay is part of it.', hi: 'आपस में बात करें। क्या दर्द देता है और क्या ठीक लगता है, यह बताना भी इसी का हिस्सा है।' }
      ]) + goBtn('intimate-safety', { en: 'If someone forces you', hi: 'अगर कोई ज़बरदस्ती करे' }) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Vaginismus: when the body tightens on its own', hi: 'Vaginismus: जब शरीर अपने-आप कस जाए' }) + '</h2><p>' + T({ en: "The muscles around the vaginal opening tighten by reflex whenever something tries to go in: sex, a finger, a tampon or a doctor's exam. You don't choose it. Fear of pain makes the muscles tighter, which makes it hurt more. It is common, and most women get better with treatment.", hi: 'जब भी कुछ अंदर जाने की कोशिश करता है, जैसे संबंध, उँगली, tampon या डॉक्टर की जाँच, तो योनि के मुँह की मांसपेशियाँ अपने-आप कस जाती हैं। यह आप चुनती नहीं हैं। दर्द का डर मांसपेशियों को और कस देता है, जिससे दर्द और बढ़ता है। यह आम है, और ज़्यादातर महिलाएँ इलाज से ठीक हो जाती हैं।' }) + '</p>' +
      '<div class="eyebrow">' + T({ en: 'It can feel like', hi: 'ऐसा महसूस हो सकता है' }) + '</div>' + ul([
        { en: 'Burning or stinging pain when trying', hi: 'कोशिश करते समय जलन या चुभन वाला दर्द' },
        { en: 'Hitting a wall, as if there is no way in', hi: 'जैसे आगे दीवार हो, अंदर जाने का रास्ता ही न हो' },
        { en: 'Fear or panic before sex', hi: 'संबंध से पहले डर या घबराहट' },
        { en: 'Not being able to use a tampon or have an internal exam', hi: 'Tampon न लगा पाना, या अंदर की जाँच न करा पाना' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'What helps', hi: 'क्या मदद करता है' }) + '</h2>' + steps([
        { en: 'A gynaecologist checks first, gently, for other causes: infection, dryness, a skin problem, or rarely a thick hymen. You can ask her to stop at any time.', hi: 'पहले स्त्री रोग विशेषज्ञ धीरे से दूसरी वजहें देखती हैं: इन्फ़ेक्शन, सूखापन, त्वचा की कोई समस्या, या बहुत कम मामलों में मोटी hymen। आप कभी भी रुकने को कह सकती हैं।' },
        { en: 'Pelvic floor physiotherapy: a physiotherapist teaches you to feel and relax these muscles, with breathing and exercises.', hi: 'Pelvic floor physiotherapy: physiotherapist साँस और व्यायाम से इन मांसपेशियों को महसूस करना और ढीला करना सिखाते हैं।' },
        { en: 'Dilators: smooth cones in graded sizes, used at home with lubricant, slowly, at your own pace. You move to the next size only when the last one feels comfortable.', hi: 'Dilators: अलग-अलग साइज़ के चिकने cone, जो घर पर lubricant के साथ, धीरे-धीरे, अपनी रफ़्तार से इस्तेमाल होते हैं। अगला साइज़ तभी, जब पिछला आराम से लगने लगे।' },
        { en: 'Counselling or sex therapy, alone or as a couple, for fear, a past bad experience, or pressure from family.', hi: 'Counselling या sex therapy, अकेले या पति-पत्नी साथ में, डर, पहले के बुरे अनुभव, या परिवार के दबाव के लिए।' },
        { en: "Your partner's part: patience, no pressure, and stopping when you say stop.", hi: 'पार्टनर का हिस्सा: धीरज, कोई दबाव नहीं, और आपके कहने पर रुक जाना।' }
      ]) + '<p class="small">' + T({ en: 'Start at the gynae OPD of a district hospital or medical college. Medical colleges have physiotherapy and psychiatry departments that can help.', hi: 'शुरुआत ज़िला अस्पताल या मेडिकल कॉलेज की gynae OPD से करें। मेडिकल कॉलेजों में physiotherapy और मनोरोग (psychiatry) विभाग होते हैं, जो मदद कर सकते हैं।' }) + '</p></div>' +
      '<div class="card warn"><h3 style="color:var(--accent)">' + T({ en: 'See a doctor', hi: 'डॉक्टर को दिखाएँ' }) + '</h3>' + ul([
        { en: 'Today: pain with fever, or lower belly pain that is getting worse', hi: 'आज ही: बुख़ार के साथ दर्द, या पेट के निचले हिस्से का दर्द जो बढ़ रहा हो' },
        { en: 'This week: bleeding after sex, burning when peeing, or new discharge', hi: 'इसी हफ़्ते: संबंध के बाद ब्लीडिंग, पेशाब में जलन, या नया सफ़ेद पानी' },
        { en: 'When you can: deep pain inside during sex, or no sex possible after some weeks of trying gently', hi: 'जब हो सके: संबंध में अंदर गहरा दर्द, या कुछ हफ़्ते धीरे-धीरे कोशिश के बाद भी संबंध न हो पाना' }
      ]) + '<div class="row wrap">' + goBtn('intimate-check', { en: 'Symptom helper', hi: 'लक्षण सहायक' }) + goBtn('cond-endo', { en: 'Endometriosis', hi: 'Endometriosis' }) + goBtn('meno-intimate', { en: 'Dryness after menopause', hi: 'मेनोपॉज़ के बाद सूखापन' }) + '</div></div>' +
      askBtn({ en: 'Pain or difficulty with sex', hi: 'संबंध में दर्द या मुश्किल' }) +
      '<p class="footnote">' + T({ en: 'Nothing on this page is saved.', hi: 'इस पन्ने पर कुछ भी save नहीं होता।' }) + '</p>';
    S.wire(v);
  }

  /* ---------- prolapse and leaking urine ---------- */
  function renderProlapse(v) {
    own();
    v.innerHTML = S.backRow(t('intimate_prolapse'), 'intimate', false) +
      '<p class="small">' + T({ en: "A heavy, dragging feeling down below, a bulge, or urine leaking when you cough, sneeze, laugh or lift. This is very common after several births and years of heavy work. It is not 'just age', you don't have to live with it, and it can be treated.", hi: 'नीचे भारीपन या खिंचाव, कोई उभार, या खाँसने, छींकने, हँसने या वज़न उठाने पर पेशाब निकल जाना। कई बच्चों के जन्म और सालों के भारी काम के बाद यह बहुत आम है। यह “बस उम्र” नहीं है, इसे सहते रहना ज़रूरी नहीं, और इसका इलाज है।' }) + '</p>' +
      '<div class="card"><h2>' + T({ en: 'What it feels like', hi: 'कैसा महसूस होता है' }) + '</h2>' + ul([
        { en: 'Heaviness or dragging in the vagina, worse at the end of the day or after standing for long', hi: 'योनि में भारीपन या खिंचाव, दिन के आख़िर में या देर तक खड़े रहने के बाद ज़्यादा' },
        { en: 'A bulge or lump you can feel or see at the opening, which may go back when you lie down', hi: 'योनि के मुँह पर उभार या गाँठ जो महसूस हो या दिखे, और लेटने पर अंदर चली जाए' },
        { en: 'Trouble emptying the bladder or bowel; some women push the bulge back to pass urine or stool', hi: 'पेशाब या शौच पूरा न हो पाना; कुछ महिलाएँ पेशाब या शौच के लिए उभार को अंदर दबाती हैं' },
        { en: 'Urine leaking when you cough, sneeze, laugh, lift or run', hi: 'खाँसने, छींकने, हँसने, वज़न उठाने या दौड़ने पर पेशाब निकल जाना' },
        { en: "A sudden strong need to pass urine, and leaking before you reach the toilet", hi: 'अचानक तेज़ पेशाब लगना, और शौचालय पहुँचने से पहले निकल जाना' },
        { en: 'Low back ache, or discomfort during sex', hi: 'कमर के निचले हिस्से में दर्द, या संबंध में असुविधा' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Why it happens', hi: 'ऐसा क्यों होता है' }) + '</h2><p>' + T({ en: 'The pelvic floor is a sling of muscles that holds up the bladder, womb and bowel. It gets stretched and weak from:', hi: 'Pelvic floor मांसपेशियों का एक झूला है, जो मूत्राशय, बच्चेदानी और आँत को सहारा देता है। यह इन वजहों से खिंचकर कमज़ोर हो जाता है:' }) + '</p>' + ul([
        { en: 'Several vaginal births, big babies or long pushing in labour', hi: 'कई सामान्य डिलीवरी, बड़े बच्चे, या डिलीवरी में देर तक ज़ोर लगाना' },
        { en: 'Lifting heavy loads for years: water pots, bricks, fodder, children', hi: 'सालों तक भारी बोझ उठाना: पानी के घड़े, ईंटें, चारा, बच्चे' },
        { en: 'A long-term cough, or straining from constipation', hi: 'लंबे समय की खाँसी, या क़ब्ज़ में ज़ोर लगाना' },
        { en: 'Extra body weight, and lower hormone levels after menopause', hi: 'ज़्यादा वज़न, और मेनोपॉज़ के बाद हॉर्मोन कम होना' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Two kinds of leaking', hi: 'पेशाब लीक होने के दो तरह' }) + '</h2>' +
      entry({ en: 'With a cough, sneeze or lifting', hi: 'खाँसी, छींक या वज़न उठाने पर' }, { en: 'Called stress leakage. Pelvic floor exercises help most.', hi: 'इसे stress leakage कहते हैं। Pelvic floor के व्यायाम सबसे ज़्यादा मदद करते हैं।' }) +
      entry({ en: "A sudden urge you can't hold", hi: 'अचानक ऐसी हाजत जो रुके नहीं' }, { en: 'Called urge leakage. Bladder training helps: slowly stretch the time between toilet visits, and cut down tea, coffee and cola.', hi: 'इसे urge leakage कहते हैं। Bladder training मदद करती है: शौचालय जाने के बीच का समय धीरे-धीरे बढ़ाएँ, और चाय, कॉफ़ी और cola कम करें।' }) +
      '<p class="small">' + T({ en: 'Burning, fever or blood in the urine is usually an infection, not a weak pelvic floor. See a doctor.', hi: 'पेशाब में जलन, बुख़ार या ख़ून आम तौर पर इन्फ़ेक्शन होता है, कमज़ोर pelvic floor नहीं। डॉक्टर को दिखाएँ।' }) + '</p></div>' +
      '<div class="card"><h2>' + T({ en: 'Treatment, from simple to surgery', hi: 'इलाज, आसान से ऑपरेशन तक' }) + '</h2>' + steps([
        { en: 'Pelvic floor exercises: squeeze and lift as if holding in urine and wind, hold, then relax fully. Do them every day for at least 3 months. They help most women with mild prolapse and leaking.', hi: 'Pelvic floor के व्यायाम: ऐसे सिकोड़ें और ऊपर खींचें जैसे पेशाब और गैस रोक रही हों, रोकें, फिर पूरी तरह ढीला छोड़ें। कम से कम 3 महीने रोज़ करें। हल्के prolapse और लीक में ज़्यादातर महिलाओं को इससे फ़ायदा होता है।' },
        { en: 'Ring pessary: a soft silicone ring that a doctor places inside to hold things up. No operation. It needs a check, and cleaning or a change, every few months at the clinic.', hi: 'Ring pessary: एक नरम silicone की अंगूठी, जिसे डॉक्टर अंदर रखती हैं ताकि सब अपनी जगह रहे। कोई ऑपरेशन नहीं। हर कुछ महीनों में क्लिनिक पर इसकी जाँच, और सफ़ाई या बदलाव होता है।' },
        { en: 'Surgery: for a bigger prolapse, or when the others do not help enough. There are several kinds, and removing the womb is not the only one. The gynaecologist explains which suits you, including if you may want more children.', hi: 'ऑपरेशन: बड़े prolapse में, या जब बाक़ी तरीक़ों से काफ़ी फ़ायदा न हो। इसके कई तरीक़े हैं, और बच्चेदानी निकालना अकेला तरीक़ा नहीं है। स्त्री रोग विशेषज्ञ बताती हैं कि आपके लिए कौन-सा ठीक है, यह भी देखकर कि आगे बच्चा चाहिए या नहीं।' }
      ]) + '<p class="small">' + T({ en: 'Also helps: treating a long cough, avoiding constipation (water, fruit, vegetables), lifting by bending your knees, and a healthy weight.', hi: 'यह भी मदद करता है: लंबी खाँसी का इलाज, क़ब्ज़ से बचना (पानी, फल, सब्ज़ी), घुटने मोड़कर वज़न उठाना, और सही वज़न।' }) + '</p>' + goBtn('post-pelvic', { en: 'How to do pelvic floor exercises', hi: 'Pelvic floor व्यायाम कैसे करें' }) + '</div>' +
      '<div class="card ok"><h3 style="color:var(--ok)">' + T({ en: 'Where to go', hi: 'कहाँ जाएँ' }) + '</h3><p>' + T({ en: 'The gynae OPD of a district hospital or medical college can examine you, fit a pessary and do surgery, at little or no cost. If your family has an Ayushman card (PM-JAY), prolapse surgery in empanelled hospitals is covered. Your ASHA or ANM can help you get there, and you can ask for a woman doctor.', hi: 'ज़िला अस्पताल या मेडिकल कॉलेज की gynae OPD में जाँच, pessary और ऑपरेशन, बहुत कम या बिना ख़र्च के होते हैं। अगर परिवार के पास आयुष्मान card (PM-JAY) है, तो सूचीबद्ध अस्पतालों में prolapse का ऑपरेशन इसमें शामिल है। आपकी ASHA या ANM वहाँ पहुँचने में मदद कर सकती हैं, और आप महिला डॉक्टर माँग सकती हैं।', doc: { en: 'A gynaecologist can examine you, fit a pessary or do surgery; the gynae OPD of a district hospital or medical college does it at little or no cost. If your family has an Ayushman card (PM-JAY), prolapse surgery in empanelled hospitals is covered. You can ask for a woman doctor.', hi: 'स्त्री रोग विशेषज्ञ जाँच, pessary और ऑपरेशन कर सकती हैं; ज़िला अस्पताल या मेडिकल कॉलेज की gynae OPD में यह बहुत कम या बिना ख़र्च के होता है। अगर परिवार के पास आयुष्मान card (PM-JAY) है, तो सूचीबद्ध अस्पतालों में prolapse का ऑपरेशन इसमें शामिल है। आप महिला डॉक्टर के लिए कह सकती हैं।' } }) + '</p></div>' +
      /* Version 39.56: a new line for the doctor (review 19.56), as in Help */
      '<div class="card dark urgent" role="alert" data-say="1"><h3>' + esc(t('call_now')) + '</h3><p class="small">' + esc(t('s1d')) + '</p><div class="row wrap">' + (S.ambBtn ? S.ambBtn('danger sm') : '') + '</div></div>' +   /* Version 39.70: the ambulance */
      '<div class="card warn"><h3 style="color:var(--accent)">' + T({ en: 'See a doctor', hi: 'डॉक्टर को दिखाएँ' }) + '</h3>' + ul([
        { en: "Today: you can't pass urine at all, or the bulge is stuck outside, very painful or bleeding", hi: 'आज ही: पेशाब बिल्कुल न हो पाए, या उभार बाहर अटक जाए, बहुत दर्द हो या ख़ून आए' },
        { en: 'Within about 2 weeks: any bleeding 12 months or more after your last period, or a sore on the bulge', hi: 'लगभग 2 हफ़्ते में: पिछले पीरियड के 12 महीने या ज़्यादा बाद कोई भी ब्लीडिंग, या उभार पर घाव' },
        { en: "When you can: heaviness, a bulge or leaking that bothers you. It is never too late to ask.", hi: 'जब हो सके: भारीपन, उभार या लीक जो परेशान करे। पूछने में कभी देर नहीं होती।' }
      ]) + '</div>' +
      (S.plan && S.plan.forRow ? S.plan.forRow('pelvic') || '' : '') +   /* Version 39.56: her plan for this */
      askBtn({ en: 'Prolapse or leaking urine', hi: 'Prolapse या पेशाब लीक होना' }) +
      '<p class="footnote">' + T(NOT_SAVED) + '</p>';
    S.wire(v);
  }

  /* ---------- violence and safety (no Qura funnel on this screen) ---------- */
  const PLAN = [
    { h: { en: 'Documents', hi: 'काग़ज़' }, items: [
      { k: 'aadhaar', en: 'Aadhaar card', hi: 'आधार कार्ड' },
      { k: 'ration', en: 'Ration card', hi: 'राशन कार्ड' },
      { k: 'bank', en: 'Bank passbook and ATM card', hi: 'बैंक पासबुक और ATM कार्ड' },
      { k: 'marriage', en: 'Marriage certificate', hi: 'शादी का प्रमाणपत्र' },
      { k: 'kids', en: "Children's birth certificates and school papers", hi: 'बच्चों के जन्म प्रमाणपत्र और स्कूल के काग़ज़' },
      { k: 'medical', en: 'Your medical reports and prescriptions', hi: 'आपकी medical reports और पर्चे' },
      { k: 'proof', en: 'Photos or messages that show the abuse, kept somewhere safe', hi: 'हिंसा दिखाने वाली फ़ोटो या संदेश, किसी सुरक्षित जगह' }
    ] },
    { h: { en: 'Money and phone', hi: 'पैसे और फ़ोन' }, items: [
      { k: 'cash', en: 'Some cash, hidden or kept with someone you trust', hi: 'कुछ नक़द पैसे, छुपाकर या किसी भरोसेमंद के पास' },
      { k: 'phone', en: 'Phone charged and recharged', hi: 'फ़ोन चार्ज और रिचार्ज' },
      { k: 'paper', en: 'Important numbers also written on paper', hi: 'ज़रूरी नंबर काग़ज़ पर भी लिखे हों' }
    ] },
    { h: { en: 'A bag ready', hi: 'एक थैला तैयार' }, items: [
      { k: 'clothes', en: 'Clothes for you and the children', hi: 'अपने और बच्चों के कपड़े' },
      { k: 'meds', en: 'Medicines you take every day', hi: 'रोज़ की दवाएँ' },
      { k: 'keys', en: 'Spare keys and a phone charger', hi: 'फ़ालतू चाबियाँ और फ़ोन चार्जर' },
      { k: 'copies', en: 'Copies of your documents', hi: 'काग़ज़ों की कॉपी' }
    ] },
    { h: { en: 'If a fight starts', hi: 'अगर झगड़ा शुरू हो' }, items: [
      { k: 'exit', en: 'Know the quickest way out of the house', hi: 'घर से बाहर निकलने का सबसे जल्दी रास्ता पता हो' },
      { k: 'kitchen', en: 'Move away from the kitchen and rooms with no way out', hi: 'रसोई और ऐसे कमरों से दूर रहें जिनसे बाहर निकलने का रास्ता न हो' },
      { k: 'children', en: 'Children know to go to the nearest hospital or go to a neighbour', hi: 'बच्चों को पता हो कि सबसे पास के अस्पताल जाएँ या पड़ोसी के पास जाएँ' }
    ] }
  ];
  function planHtml() {
    const p = mem.plan;
    const box = (it) => '<label class="' + (p.ticks[it.k] ? 'done' : '') + '"><input type="checkbox" data-in-plan="' + it.k + '"' + (p.ticks[it.k] ? ' checked' : '') + '> ' + T(it) + '</label>';
    const inp = (id, key, label, ph) => '<label for="' + id + '">' + T(label) + '</label><input id="' + id + '" data-in-field="' + key + '" autocomplete="off" value="' + esc(p[key]) + '" placeholder="' + esc(tx(ph)) + '">';
    return '<div class="card"><div class="row spread wrap"><h2>' + T({ en: 'My safety plan', hi: 'मेरी सुरक्षा योजना' }) + '</h2><span class="pill muted">' + T({ en: 'Not saved', hi: 'Save नहीं होती' }) + '</span></div>' +
      '<p class="small">' + T({ en: 'Use this to think it through. It is never saved: it disappears when you leave this page, tap Quick exit or close the app. Keep the real plan in your head, or with someone you trust.', hi: 'इससे सोच-समझकर योजना बनाएँ। यह कभी save नहीं होती: पन्ना छोड़ने, “तुरंत छुपाएँ” दबाने या ऐप बंद करने पर मिट जाती है। असली योजना अपने दिमाग़ में रखें, या किसी भरोसेमंद व्यक्ति के पास।' }) + '</p>' +
      PLAN.map((g) => '<div class="eyebrow">' + T(g.h) + '</div><div class="checklist">' + g.items.map(box).join('') + '</div>').join('') +
      '<div class="eyebrow">' + T({ en: 'People and words', hi: 'लोग और शब्द' }) + '</div>' +
      '<div class="stack">' + inp('in-who', 'who', { en: 'Someone I trust', hi: 'कोई जिस पर भरोसा है' }, { en: 'A name, only on this screen', hi: 'एक नाम, सिर्फ़ इस screen पर' }) +
      inp('in-code', 'code', { en: 'A code word that means "call for help"', hi: 'एक code word जिसका मतलब हो “मदद बुलाओ”' }, { en: 'Agree it with that person', hi: 'उस व्यक्ति के साथ तय करें' }) +
      inp('in-where', 'where', { en: 'Where I could go', hi: 'मैं कहाँ जा सकती हूँ' }, { en: 'A relative, a friend, or the One Stop Centre', hi: 'कोई रिश्तेदार, सहेली, या वन स्टॉप सेंटर' }) + '</div>' +
      '<button type="button" class="btn sm" id="in-plan-clear">' + T({ en: 'Clear my plan now', hi: 'मेरी योजना अभी मिटाएँ' }) + '</button></div>';
  }
  function renderSafety(v) {
    own();
    const disc = !!(S.state.settings || {}).discreet;
    v.innerHTML = S.backRow(t('intimate_safety'), 'intimate', false) +
      '<div class="intimate-qx"><button type="button" class="btn primary sm" id="in-qx">' + S.I.lock + T({ en: 'Quick exit', hi: 'तुरंत छुपाएँ' }) + '</button><span class="small">' + T({ en: 'Hides this app behind a recipe page at once', hi: 'ऐप को तुरंत एक रेसिपी के पन्ने के पीछे छुपा देता है' }) + '</span></div>' +
      '<p class="small">' + T({ en: 'If someone at home hurts you, threatens you, forces you, or controls your money or where you go: it is not your fault, and help is free. Nothing on this page is saved.', hi: 'अगर घर में कोई आपको चोट पहुँचाता है, धमकाता है, ज़बरदस्ती करता है, या आपके पैसे और आने-जाने पर रोक लगाता है: यह आपकी ग़लती नहीं है, और मदद मुफ़्त है। इस पन्ने पर कुछ भी save नहीं होता।' }) + '</p>' +
      '<div class="card dark"><h2>' + T({ en: 'In danger right now', hi: 'अभी ख़तरे में हैं' }) + '</h2><p class="small" style="color:var(--dark-text)">' + T({ en: 'Call 112 for the police or an ambulance. Call 181, the Women Helpline, any time of day or night.', hi: 'पुलिस या एम्बुलेंस के लिए 112 पर कॉल करें। महिला हेल्पलाइन 181 पर दिन-रात कभी भी कॉल करें।' }) + '</p></div>' +
      lines(['112', '181']) +
      '<div class="card"><h2>' + T({ en: 'This is violence too', hi: 'यह भी हिंसा है' }) + '</h2>' +
      entry({ en: 'Physical', hi: 'शारीरिक' }, { en: 'Hitting, slapping, kicking, pushing, burning, choking, threatening with a weapon.', hi: 'मारना, थप्पड़, लात, धक्का, जलाना, गला दबाना, हथियार से धमकाना।' }) +
      entry({ en: 'Sexual, including by a husband', hi: 'यौन, पति द्वारा भी' }, { en: 'Forced sex or sexual acts, or being made to do things you do not want. Under the Domestic Violence Act, 2005, sexual abuse by a husband counts as domestic violence.', hi: 'ज़बरदस्ती संबंध या यौन हरकतें, या ऐसी चीज़ें करवाना जो आप नहीं चाहतीं। घरेलू हिंसा क़ानून, 2005 के तहत पति का यौन शोषण भी घरेलू हिंसा है।' }) +
      entry({ en: 'Emotional and verbal', hi: 'मानसिक और ज़ुबानी' }, { en: 'Insults, constant taunts, threats, taunts about not having a son, keeping you away from your family and friends, checking your phone.', hi: 'अपमान, लगातार ताने, धमकियाँ, बेटा न होने के ताने, आपको परिवार और सहेलियों से दूर रखना, आपका फ़ोन जाँचना।' }) +
      entry({ en: 'Money control', hi: 'पैसों पर रोक' }, { en: 'Taking your salary, not giving money for food, medicines or the children, stopping you from working, selling your jewellery or stridhan.', hi: 'आपकी तनख़्वाह ले लेना, खाने, दवा या बच्चों के लिए पैसे न देना, काम करने से रोकना, आपके गहने या स्त्रीधन बेच देना।' }) +
      entry({ en: 'Dowry harassment', hi: 'दहेज के लिए परेशान करना' }, { en: 'Demands for money, gold or goods from your family, with taunts or violence when they are not met. Dowry and cruelty over it are crimes in India.', hi: 'आपके मायके से पैसे, सोना या सामान की माँग, और न मिलने पर ताने या मारपीट। दहेज और उसके लिए क्रूरता भारत में अपराध हैं।' }) +
      '<p class="small">' + T({ en: 'None of this is your fault, and none of it is a normal part of marriage or family life. You do not need injuries or proof to ask for help.', hi: 'इसमें आपकी कोई ग़लती नहीं है, और यह शादी या परिवार का कोई सामान्य हिस्सा नहीं है। मदद माँगने के लिए चोट या सबूत ज़रूरी नहीं।' }) + '</p></div>' +
      '<div class="card"><h2>' + T({ en: 'Free help, and your rights', hi: 'मुफ़्त मदद, और आपके अधिकार' }) + '</h2>' +
      entry({ en: '181 Women Helpline', hi: '181 महिला हेल्पलाइन' }, { en: 'Free, 24 hours. They listen, and connect you to the police, an ambulance, the One Stop Centre and the Protection Officer near you.', hi: 'मुफ़्त, 24 घंटे। वे आपकी बात सुनते हैं, और आपको पुलिस, एम्बुलेंस, वन स्टॉप सेंटर और आपके पास के Protection Officer से जोड़ते हैं।' }) +
      entry({ en: 'One Stop Centre (Sakhi)', hi: 'वन स्टॉप सेंटर (सखी)' }, { en: 'Set up in each district for women facing violence, at home or outside. Counselling, legal help, help with the police, medical care and a short stay in a shelter, all in one place, free. Go there directly, or through 181.', hi: 'हर ज़िले में, घर या बाहर हिंसा झेल रही महिलाओं के लिए। सलाह (counselling), क़ानूनी मदद, पुलिस में मदद, इलाज, और कुछ दिन रहने की जगह, सब एक ही जगह, मुफ़्त। सीधे जाएँ, या 181 के ज़रिए।' }) +
      entry({ en: 'Protection Officer (Domestic Violence Act, 2005)', hi: 'Protection Officer (घरेलू हिंसा क़ानून, 2005)' }, { en: 'Every district has one or more, as far as possible women. They help you write a Domestic Incident Report, ask the magistrate for a protection order, find a safe shelter, get a medical check-up, and get a free lawyer. You have the right to keep living in your shared home.', hi: 'हर ज़िले में एक या ज़्यादा, जहाँ तक हो सके महिलाएँ। वे घरेलू हिंसा की रिपोर्ट (DIR) लिखने, magistrate से protection order माँगने, सुरक्षित रहने की जगह, medical जाँच, और मुफ़्त वकील दिलाने में मदद करती हैं। आपको अपने साझा घर में रहते रहने का अधिकार है।' }) +
      entry({ en: 'National Commission for Women: 14490', hi: 'राष्ट्रीय महिला आयोग: 14490' }, { en: 'Free, 24 hours. Counsellors who link you to the police, health services and legal help.', hi: 'मुफ़्त, 24 घंटे। Counsellor जो आपको पुलिस, स्वास्थ्य सेवाओं और क़ानूनी मदद से जोड़ते हैं।' }) +
      entry({ en: 'A free lawyer: 15100', hi: 'मुफ़्त वकील: 15100' }, { en: 'Every woman can get free legal aid, whatever her income. Call NALSA on 15100, or go to the District Legal Services Authority at the district court.', hi: 'हर महिला को मुफ़्त क़ानूनी मदद मिल सकती है, आमदनी चाहे जो हो। NALSA को 15100 पर कॉल करें, या ज़िला अदालत में ज़िला विधिक सेवा प्राधिकरण (DLSA) जाएँ।' }) +
      lines(['14490', '15100', '14416', '1098']) +
      '<p class="small intimate-links">' + T({ en: 'Official pages: ', hi: 'आधिकारिक पन्ने: ' }) + ext('https://missionshakti.wcd.gov.in/statisticsOsc', { en: 'Find your nearest One Stop Centre (official)', hi: 'नज़दीकी वन स्टॉप सेंटर खोजें (सरकारी)' }) + ' · ' + ext('https://missionshakti.wcd.gov.in/appointmentBooking', { en: 'Book a visit to a One Stop Centre', hi: 'वन स्टॉप सेंटर में जाने का समय बुक करें' }) + ' · ' + ext('https://missionshakti.wcd.gov.in/', { en: 'Mission Shakti (One Stop Centres, 181)', hi: 'मिशन शक्ति (वन स्टॉप सेंटर, 181)' }) + ' · ' + ext('https://ncw.gov.in/', { en: 'National Commission for Women', hi: 'राष्ट्रीय महिला आयोग' }) + '</p></div>' +
      '<div class="card"><h2>' + T({ en: 'After rape or forced sex', hi: 'बलात्कार या ज़बरदस्ती संबंध के बाद' }) + '</h2>' + ul([
        { en: 'Go to any hospital, government or private. By law they must treat you, free of cost.', hi: 'किसी भी अस्पताल में जाएँ, सरकारी या निजी। क़ानून के मुताबिक़ उन्हें आपका इलाज मुफ़्त करना होगा।' },
        { en: 'Go as soon as you can. Within 72 hours, medicines can prevent pregnancy and HIV.', hi: 'जितनी जल्दी हो सके, जाएँ। 72 घंटे के अंदर दवाओं से गर्भ और HIV से बचाव हो सकता है।' },
        { en: 'You can get treatment even if you do not want to go to the police. The One Stop Centre or 181 can stay with you through whatever you decide.', hi: 'पुलिस में न जाना चाहें, तब भी इलाज मिल सकता है। आप जो भी तय करें, वन स्टॉप सेंटर या 181 आपके साथ रह सकते हैं।' },
        { en: 'If you may want to complain later, try not to bathe or wash those clothes before the examination. If you already have, still go.', hi: 'अगर बाद में शिकायत करना चाहें, तो जाँच से पहले नहाने या वे कपड़े धोने से बचें। अगर नहा चुकी हैं, तब भी ज़रूर जाएँ।' }
      ]) + goBtn('contra-ec', { en: 'About the emergency pill', hi: 'Emergency pill के बारे में' }) + '</div>' +
      planHtml() +
      '<div class="card soft"><h2>' + T({ en: 'Keeping this private', hi: 'इसे निजी रखना' }) + '</h2>' + ul([
        { en: 'Quick exit, at the top of this page, swaps the app for a dal recipe at once. Every page then shows the recipe, even if someone presses Back. To come back, tap the recipe title 3 times quickly.', hi: 'इस पन्ने के ऊपर “तुरंत छुपाएँ” दबाते ही ऐप की जगह दाल की रेसिपी आ जाती है। फिर हर पन्ने पर रेसिपी ही दिखती है, कोई Back दबाए तब भी। वापस आने के लिए रेसिपी के नाम पर जल्दी-जल्दी 3 बार टैप करें।' },
        { en: 'Discreet mode, on the Me page, hides your numbers until you tap, and the Diary tab is called Notes.', hi: '“मैं” पन्ने पर गुप्त mode आपके नंबर टैप करने तक छिपाता है, और डायरी टैब का नाम “नोट्स” हो जाता है।' },
        { en: 'Shared-phone mode closes your diary after 10 minutes without a tap.', hi: 'साझा फ़ोन mode 10 मिनट तक कोई टैप न होने पर आपकी डायरी बंद कर देता है।' },
        { en: 'Learn 112 and 181 by heart instead of saving them in your contacts.', hi: '112 और 181 को contacts में save करने की जगह याद कर लें।' },
        { en: 'Sakhi sends nothing anywhere. If someone else uses this phone, discreet mode and the app lock on the Me page keep these pages out of sight.', hi: 'Sakhi कहीं कुछ नहीं भेजती। अगर इस फ़ोन को कोई और भी इस्तेमाल करता है, तो “मैं” पन्ने पर गुप्त मोड और ऐप लॉक इन पन्नों को छिपाकर रखते हैं।' }
      ]) + (S.canSave() ? '<div class="row spread wrap"><span class="pill ' + (disc ? 'ok' : 'muted') + '">' + T(disc ? { en: 'Discreet mode is on', hi: 'गुप्त mode चालू है' } : { en: 'Discreet mode is off', hi: 'गुप्त mode बंद है' }) + '</span>' + goBtn('me', { en: 'Open the Me page', hi: '“मैं” पन्ना खोलें' }) + '</div>' : '') + '</div>' +
      '<p class="footnote">' + T({ en: 'Nothing on this page is saved.', hi: 'इस पन्ने पर कुछ भी save नहीं होता।' }) + '</p>';
    S.wire(v); wireCopy(v);
    v.querySelector('#in-qx').addEventListener('click', quickExit);
    v.querySelectorAll('[data-in-plan]').forEach((c) => c.addEventListener('change', () => { mem.plan.ticks[c.dataset.inPlan] = c.checked; c.parentElement.classList.toggle('done', c.checked); }));
    v.querySelectorAll('[data-in-field]').forEach((i) => i.addEventListener('input', () => { mem.plan[i.dataset.inField] = i.value; }));
    v.querySelector('#in-plan-clear').addEventListener('click', () => { const y = window.scrollY; mem.plan = blankPlan(); renderSafety(v); window.scrollTo(0, y); S.toast(tx({ en: 'Cleared', hi: 'मिट गया' })); });
  }

  /* ---------- quick exit: a plain recipe page over the whole app ---------- */
  const RECIPE = {
    title: { en: 'Arhar dal tadka', hi: 'अरहर दाल तड़का' },
    meta: { en: 'Serves 4 · about 40 minutes', hi: '4 लोगों के लिए · लगभग 40 मिनट' },
    ing: [
      { en: '1 cup arhar (toor) dal', hi: '1 कटोरी अरहर (तूर) दाल' },
      { en: '3 cups water', hi: '3 कटोरी पानी' },
      { en: '½ teaspoon turmeric, salt to taste', hi: '½ छोटा चम्मच हल्दी, स्वाद अनुसार नमक' },
      { en: '1 tablespoon ghee or oil', hi: '1 बड़ा चम्मच घी या तेल' },
      { en: '1 teaspoon cumin seeds and a pinch of hing', hi: '1 छोटा चम्मच जीरा और एक चुटकी हींग' },
      { en: '2 dry red chillies and 4 cloves of garlic, chopped', hi: '2 सूखी लाल मिर्च और 4 कली लहसुन, कटा हुआ' },
      { en: '1 onion and 1 tomato, chopped', hi: '1 प्याज़ और 1 टमाटर, कटे हुए' },
      { en: 'Fresh coriander and half a lemon', hi: 'हरा धनिया और आधा नींबू' }
    ],
    steps: [
      { en: 'Wash the dal and soak it for 20 minutes.', hi: 'दाल धोकर 20 मिनट भिगो दें।' },
      { en: 'Pressure cook it with the water, turmeric and salt for 3–4 whistles. Mash lightly.', hi: 'पानी, हल्दी और नमक के साथ कुकर में 3–4 सीटी लगाएँ। हल्का सा मसल लें।' },
      { en: 'Heat the ghee. Add cumin, hing, red chillies and garlic, and fry till the garlic turns golden.', hi: 'घी गरम करें। जीरा, हींग, लाल मिर्च और लहसुन डालें, और लहसुन सुनहरा होने तक भूनें।' },
      { en: 'Add the onion and cook till soft, then the tomato till it breaks down.', hi: 'प्याज़ डालकर नरम होने तक पकाएँ, फिर टमाटर गलने तक।' },
      { en: 'Pour the tadka into the dal and simmer for 5 minutes. Add hot water if it is too thick.', hi: 'तड़का दाल में डालें और 5 मिनट धीमी आँच पर पकाएँ। ज़्यादा गाढ़ी हो तो गरम पानी मिलाएँ।' },
      { en: 'Finish with coriander and a squeeze of lemon. Serve hot with rice or roti.', hi: 'ऊपर से धनिया डालें और नींबू निचोड़ें। चावल या रोटी के साथ गरम परोसें।' }
    ],
    tip: { en: 'Tip: a spoon of ghee on top just before serving.', hi: 'सुझाव: परोसने से ठीक पहले ऊपर से एक चम्मच घी।' }
  };
  const homeRoute = () => (S.state.stage === 'app' ? 'home' : 'care');
  function goNeutral() {
    const r = homeRoute();
    if (location.hash === '#' + r) S.render();
    else { try { location.replace('#' + r); } catch (e) { S.setHash(r); } }   /* replace: the safety page leaves no new history entry */
  }
  function quickExit() {
    fresh();
    cover = { on: true, owner: S.state, taps: [] };
    try { S.closeSheet(); } catch (e) { /* no sheet open */ }
    const tr = document.getElementById('toast-root'); if (tr) tr.innerHTML = '';
    goNeutral();
  }
  function setChrome(hide) {
    const tb = document.getElementById('topbar'), nb = document.getElementById('tabbar');
    if (hide) {
      if (!chrome.hidden) { chrome.title = document.title; chrome.hidden = true; }
      [tb, nb].forEach((el) => { if (el) el.style.display = 'none'; });
      document.title = tx(RECIPE.title);
    } else if (chrome.hidden) {
      [tb, nb].forEach((el) => { if (el) el.style.display = ''; });
      document.title = chrome.title || 'Qura Sakhi';
      chrome.hidden = false;
    }
  }
  function renderCover(v) {
    setChrome(true);
    v.innerHTML = '<article class="intimate-cover"><h1 id="in-cover-t">' + T(RECIPE.title) + '</h1><p class="small">' + T(RECIPE.meta) + '</p>' +
      '<h2>' + T({ en: 'Ingredients', hi: 'सामग्री' }) + '</h2>' + ul(RECIPE.ing) +
      '<h2>' + T({ en: 'Method', hi: 'विधि' }) + '</h2>' + steps(RECIPE.steps) +
      '<p class="note">' + T(RECIPE.tip) + '</p></article>';
    const h = v.querySelector('#in-cover-t');
    h.addEventListener('click', () => {
      const now = Date.now(); cover.taps = cover.taps.filter((x) => now - x < 1500); cover.taps.push(now);
      if (cover.taps.length >= 3) { cover = { on: false, owner: null, taps: [] }; setChrome(false); goNeutral(); }
    });
    window.scrollTo(0, 0);
  }

  /* ---------- registration ---------- */
  S.register({
    id: 'intimate',
    demoPersona: 'asha',
    strings: {
      en: {
        intimate_hub: 'Intimate health and safety', intimate_hub_s: 'Discharge, itching, STI tests, painful sex, leaking urine, safety at home',
        intimate_check: 'Discharge, itching or pain down there', intimate_check_s: 'Tap what you notice: how soon to see a doctor, and common causes',
        intimate_sti: 'STI tests: free and private', intimate_sti_s: 'What is tested, where, HIV and syphilis, vaccines',
        intimate_first: 'Pain or difficulty with sex', intimate_first_s: 'Early marriage, first-night myths, vaginismus, what helps',
        intimate_prolapse: 'Heaviness down below or leaking urine', intimate_prolapse_s: 'Prolapse and leaking: common, not just age, treatable',
        intimate_safety: 'Violence and your safety', intimate_safety_s: 'Free help, your rights, a safety plan, quick exit',
        intimate_sum_t: 'Intimate health checks (shared)'
      },
      hi: {
        intimate_hub: 'निजी सेहत और सुरक्षा', intimate_hub_s: 'सफ़ेद पानी, खुजली, STI जाँच, संबंध में दर्द, पेशाब लीक होना, घर में सुरक्षा',
        intimate_check: 'सफ़ेद पानी, खुजली या नीचे दर्द', intimate_check_s: 'जो महसूस हो, टैप करें: डॉक्टर को कितनी जल्दी दिखाएँ, और आम कारण',
        intimate_sti: 'STI जाँच: मुफ़्त और गोपनीय', intimate_sti_s: 'क्या जाँचा जाता है, कहाँ, HIV और syphilis, टीके',
        intimate_first: 'संबंध में दर्द या मुश्किल', intimate_first_s: 'शादी के शुरुआती दिन, पहली रात के मिथक, vaginismus, क्या मदद करता है',
        intimate_prolapse: 'नीचे भारीपन या पेशाब लीक होना', intimate_prolapse_s: 'Prolapse और लीक: आम है, सिर्फ़ उम्र नहीं, इलाज है',
        intimate_safety: 'हिंसा और आपकी सुरक्षा', intimate_safety_s: 'मुफ़्त मदद, आपके अधिकार, सुरक्षा योजना, तुरंत छुपाएँ',
        intimate_sum_t: 'निजी सेहत की जाँचें (साझा की गईं)'
      }
    },
    routes: { 'intimate': renderHub, 'intimate-check': renderCheck, 'intimate-sti': renderSti, 'intimate-firsttime': renderFirst, 'intimate-prolapse': renderProlapse, 'intimate-safety': renderSafety },
    open: ['intimate', 'intimate-check', 'intimate-sti', 'intimate-firsttime', 'intimate-prolapse', 'intimate-safety'],
    tiles: [
      { section: 'intimate', route: 'intimate', title: 'intimate_hub', sub: 'intimate_hub_s', icon: 'heart', order: 1, gated: false, keywords: 'intimate private vagina vaginal sexual health safety safed pani' },
      { section: 'intimate', route: 'intimate-check', title: 'intimate_check', sub: 'intimate_check_s', icon: 'drop', order: 10, gated: true, keywords: 'discharge white water leucorrhoea likoria itching burning urine sores blisters warts smell yeast thrush bv trichomonas pid lump' },
      { section: 'intimate', route: 'intimate-sti', title: 'intimate_sti', sub: 'intimate_sti_s', icon: 'check', order: 20, gated: false, keywords: 'sti std hiv aids syphilis test ictc suraksha clinic naco 1097 hpv hepatitis condom' },
      { section: 'intimate', route: 'intimate-firsttime', title: 'intimate_first', sub: 'intimate_first_s', icon: 'heart', order: 30, gated: false, keywords: 'painful sex first night vaginismus hymen virginity marriage lubricant dilator consent' },
      { section: 'intimate', route: 'intimate-prolapse', title: 'intimate_prolapse', sub: 'intimate_prolapse_s', icon: 'flower', order: 40, gated: false, keywords: 'prolapse bulge heaviness urine leak incontinence pessary pelvic floor kegel' },
      { section: 'intimate', route: 'intimate-safety', title: 'intimate_safety', sub: 'intimate_safety_s', icon: 'lock', order: 50, gated: false, keywords: 'violence domestic abuse dowry husband beating rape 181 one stop centre sakhi protection officer safety plan' }
    ],
    css: [
      '.intimate-fi { flex-shrink: 0; width: 20px; height: 20px; display: inline-flex; }',
      '.intimate-fi svg { width: 20px; height: 20px; }',
      '.intimate-ft { min-width: 0; }',
      '.intimate-hl { min-width: 0; }',
      '.intimate-chips .chip { padding: 8px 14px; line-height: 1.3; }',
      '.intimate-entry { display: flex; flex-direction: column; gap: 2px; padding: 2px 0; }',
      '.intimate-entry strong { color: var(--fg); font-size: 15px; }',
      '.intimate-entry span { font-size: 14px; color: var(--text); }',
      '.intimate-cause { padding-left: 12px; border-left: 3px solid var(--accent-2); color: var(--text); font-size: 14px; }',
      '.intimate-why { font-weight: 500; }',
      '.intimate-lv1 { background: var(--accent-soft); box-shadow: none; }',
      '.intimate-myth { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 14px; background: var(--card-2); }',
      '.intimate-mq { color: var(--fg); font-weight: 600; }',
      '.intimate-links { overflow-wrap: anywhere; }',
      '.intimate-static { box-shadow: none; background: var(--card-2); }',
      '.intimate-sv { align-items: flex-start; }',
      '.intimate-sv .btn { flex-shrink: 0; }',
      '.intimate-share { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 13px; color: var(--fg); margin-top: 6px; }',
      '.intimate-share input { width: 20px; height: 20px; min-height: 0; accent-color: var(--accent); flex-shrink: 0; }',
      '.intimate-saved summary { font-size: 14px; color: var(--fg); }',
      '.intimate-saved .list { margin-top: 10px; }',
      '.intimate-qx { position: sticky; top: 66px; z-index: 4; display: flex; align-items: center; gap: 12px; margin: 0 -16px; padding: 8px 16px; background: var(--bg); border-bottom: 1px solid var(--line); }',
      '.intimate-qx .btn { flex-shrink: 0; }',
      '.intimate-qx .btn svg { width: 18px; height: 18px; }',
      '.intimate-qx .small { min-width: 0; }',
      '.intimate-cover { display: flex; flex-direction: column; gap: 12px; padding-top: 24px; }',
      '.intimate-cover h1 { font-size: 32px; cursor: default; -webkit-user-select: none; user-select: none; }',
      'body.hi .intimate-cover h1 { font-size: 28px; }',
      '.intimate-cover h2 { margin-top: 6px; }',
      '.intimate-cover ul, .intimate-cover .steps { font-size: 15px; color: var(--text); }'
    ].join('\n'),
    summary: (S2) => {
      const L = (((S2.state.mods || {}).intimate || {}).checks || []).filter((x) => x.share);
      if (!L.length) return [];
      return [{ title: t('intimate_sum_t'), lines: L.slice(-3).map((x) => dayY(x.d) + ' · ' + tx((LV[x.lvl] || LV[3]).short) + ' · ' + tapped(x)) }];
    },
    beforeRender: (v) => {
      if (cover.on && cover.owner === S.state) { renderCover(v); return true; }
      if (cover.on) cover = { on: false, owner: null, taps: [] };
      setChrome(false);
      return false;
    },
    afterRender: (v, route) => {
      if (!mem) return;
      if (route !== 'intimate-check') wipeCheck();
      if (route !== 'intimate-safety') mem.plan = blankPlan();
    }
  });
})(window.Saathi);
