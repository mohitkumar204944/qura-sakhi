/* Pregnancy loss: what each kind of loss means, the body's recovery, grief (with a private note she saves only if she chooses) and trying again. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;

  /* Privacy: reading never creates storage. state.mods.loss is written only when she taps "Save note",
     and removed again when her last note is deleted, so nothing on the phone shows she opened these pages. */
  const peek = () => (((S.state.mods || {}).loss || {}).notes || []);
  const D = () => S.data('loss');

  /* The draft she is typing and any open "are you sure" live only in memory and are wiped when she leaves. */
  let mem = { owner: null, draft: '', confirm: null, open: false };
  const fresh = () => { mem = { owner: S.state, draft: '', confirm: null, open: false }; };
  const own = () => { if (mem.owner !== S.state) fresh(); };

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(S.one(s, v)).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ul>';
  const goBtn = (route, label, cls) => '<button type="button" class="btn ' + (cls || 'sm') + '" data-go="' + route + '">' + T(label) + '</button>';
  const flag = (o, urgent) => '<div class="flag' + (urgent ? ' urgent' : '') + '"><span class="loss-fi">' + S.I.help + '</span><span class="loss-ft">' + T(o) + '</span></div>';
  const dayY = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const sources = (list) => '<details><summary>' + esc(t('sources')) + '</summary><p class="sources">' + esc(tx({ en: '', hi: 'ये स्रोत अंग्रेज़ी में हैं: ' }) + list.join(' · ')) + '</p></details>';
  /* A collapsible section that looks like a card, for the longer explanations. */
  const acc = (title, body, open) => '<div class="card loss-acc"><details' + (open ? ' open' : '') + '><summary>' + T(title) + '</summary><div class="loss-accb">' + body + '</div></details></div>';
  const P = (o, cls) => '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + T(o) + '</p>';
  const askQuiet = (topic) => '<button type="button" class="btn ghost sm" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button>';

  const HL = {
    '112': { en: 'Emergency, any kind', hi: 'आपातकाल, किसी भी तरह का' },
    '14416': { en: 'Tele-MANAS: someone to talk to, free, 24×7', hi: 'Tele-MANAS: बात करने के लिए, मुफ़्त, 24×7' },
    '181': { en: 'Women Helpline: if someone is hurting or threatening you', hi: 'महिला हेल्पलाइन: अगर कोई आपको चोट पहुँचा रहा है या धमका रहा है' }
  };
  const lines = (nums0) => { const nums = nums0.filter((n) => !S.emNums || S.emNums([n]).indexOf(n) >= 0); if (!nums.length) return '';   /* Version 39.70: no 112, Tele-MANAS, 181 or Childline */
    return '<div class="list">' + nums.map((n) => '<div class="helpline"><div class="loss-hl"><div class="n num">' + esc(n) + '</div><div class="what">' + T(HL[n]) + '</div></div><button type="button" class="btn sm" data-loss-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>').join('') + '</div>'; };
  function wireCopy(v) {
    v.querySelectorAll('[data-loss-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.lossCopy; const done = () => S.toast(t('copied') + ' ' + n);
      const pick = () => { try { const el = b.parentElement.querySelector('.n'); const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) { /* selection blocked */ } S.toast(n); };
      try { navigator.clipboard.writeText(n).then(done, pick); } catch (e) { pick(); }
    }));
  }
  const privacy = () => T(S.canSave()
    ? { en: 'These pages are private and save nothing on their own. On a shared phone, Discreet mode on the Me page hides your numbers and renames the diary to Notes.', hi: 'यहाँ सब निजी है। ये पन्ने अपने आप कुछ भी save नहीं करते। साझा फ़ोन हो तो “मैं” पन्ने पर गुप्त mode आपके नंबर छिपाता है और डायरी का नाम “नोट्स” कर देता है।' }
    : { en: 'These pages are private and save nothing.', hi: 'यहाँ सब निजी है। ये पन्ने कुछ भी save नहीं करते।' });

  /* ---------- shared text ---------- */
  const URGENT = {
    en: 'Bleeding that soaks a pad every hour, feeling faint or dizzy, severe belly pain, or pain on one side with a positive test: go to the nearest hospital now.',
    hi: 'हर घंटे pad भीग जाए इतनी ब्लीडिंग, चक्कर या बेहोशी जैसा लगना, पेट में तेज़ दर्द, या test positive के साथ एक तरफ़ दर्द: अभी सबसे पास के अस्पताल जाएँ।'
  };
  const RED_NOW = [
    { en: 'Bleeding that soaks a thick pad every hour, for 2 hours in a row', hi: 'इतनी ब्लीडिंग कि हर घंटे एक मोटा pad भीग जाए, लगातार 2 घंटे तक' },
    { en: 'Feeling faint, dizzy or breathless, or fainting', hi: 'चक्कर, बेहोशी जैसा लगना, साँस फूलना, या बेहोश हो जाना' },
    { en: "Severe belly pain that painkillers don't help", hi: 'पेट में तेज़ दर्द जो दर्द की दवा से भी न जाए' },
    { en: 'Pain on one side of the lower belly, or at the tip of the shoulder, if an ectopic pregnancy has not been ruled out', hi: 'पेट के निचले हिस्से में एक तरफ़ दर्द, या कंधे की नोक में दर्द, अगर ectopic की संभावना अभी ख़त्म नहीं हुई है' }
  ];
  const RED_TODAY = [
    { en: 'Fever, or shivering and feeling unwell', hi: 'बुख़ार, या कँपकँपी और तबीयत ख़राब लगना' },
    { en: 'Smelly or pus-like discharge', hi: 'बदबूदार या मवाद जैसा स्राव' },
    { en: 'Bleeding or pain getting worse instead of better', hi: 'ब्लीडिंग या दर्द कम होने की जगह बढ़ना' },
    { en: 'Bleeding still heavy after 2 weeks', hi: '2 हफ़्ते बाद भी भारी ब्लीडिंग' }
  ];

  /* ---------- hub ---------- */
  function renderHub(v) {
    own();
    const item = (route, ico, title, sub) => '<button type="button" class="item" data-go="' + route + '"><span class="ico-sm">' + S.I[ico] + '</span><span class="body"><strong>' + esc(t(title)) + '</strong><span>' + esc(t(sub)) + '</span></span></button>';
    const sit = S.state.situation || {};
    const stillPregnant = S.canSave() && sit.pregnant ? '<div class="card soft"><h3>' + T({ en: 'Your diary still says pregnant', hi: 'आपकी डायरी में अभी भी “गर्भवती” लिखा है' }) + '</h3>' +
      P({ en: "If your pregnancy has ended, you can switch off \"Pregnant\" on the Me page whenever you feel ready. The diary then counts from your next period. You don't have to explain anything to anyone.", hi: 'अगर गर्भ नहीं रहा, तो जब मन हो, “मैं” पन्ने पर “गर्भवती” बंद कर दें। फिर डायरी अगले पीरियड से गिनती करेगी। आपको किसी को कुछ भी समझाने की ज़रूरत नहीं।' }, 'small') +
      '<div class="row"><button type="button" class="btn sm" data-go="me">' + esc(t('loss_open_me')) + '</button></div></div>' : '';
    v.innerHTML = S.backRow(t('loss_hub'), 'care', false) +
      P({ en: "We're so sorry. Whatever happened, and however early, it was not your fault. Read only what you need, when you need it. Nothing here is saved unless you choose to save it.", hi: 'हमें बहुत दुख है। जो भी हुआ, जितनी भी जल्दी हुआ, उसमें आपकी कोई ग़लती नहीं थी। जो ज़रूरी लगे, जब ज़रूरी लगे, बस उतना ही पढ़ें। यहाँ कुछ भी save नहीं होता, जब तक आप ख़ुद न चुनें।' }, 'lead loss-open') +
      '<div class="list">' + item('loss-types', 'learn', 'loss_types', 'loss_types_s') + item('loss-recovery', 'drop', 'loss_recovery', 'loss_recovery_s') + item('loss-grief', 'heart', 'loss_grief', 'loss_grief_s') + item('loss-again', 'leaf', 'loss_again', 'loss_again_s') + '</div>' +
      stillPregnant +
      flag(URGENT, true) +
      '<p class="note">' + privacy() + '</p>';
    S.wire(v); wireCopy(v);
  }

  /* ---------- what happened ---------- */
  function renderTypes(v) {
    own();
    const term = (word, mean) => '<div class="loss-term"><strong>' + esc(word) + '</strong><span>' + T(mean) + '</span></div>';
    v.innerHTML = S.backRow(t('loss_types'), 'loss', false) +
      P({ en: 'The words on a report can sound harsh. Here is what each one means, in plain words. Open only the one you need.', hi: 'रिपोर्ट पर लिखे शब्द कठोर लग सकते हैं। यहाँ हर शब्द का मतलब आसान भाषा में है। सिर्फ़ वही खोलें जो आपको चाहिए।' }, 'small') +
      '<div class="card ok"><h3 style="color:var(--ok)">' + T({ en: 'It was not your fault', hi: 'इसमें आपकी ग़लती नहीं थी' }) + '</h3>' +
      P({ en: 'About half of early miscarriages happen because the pregnancy got the wrong number of chromosomes, the instructions that build a body, when the egg and sperm joined. This happens by chance. Nothing you did caused it, and nothing could have stopped it.', hi: 'शुरुआती मिसकैरेज में से लगभग आधे इसलिए होते हैं क्योंकि अंडे और शुक्राणु के मिलते समय ही गर्भ को क्रोमोसोम (शरीर बनाने के निर्देश) की गलत संख्या मिल जाती है। यह संयोग से होता है। आपके किसी काम से यह नहीं हुआ, और कोई इसे रोक नहीं सकता था।' }) +
      P({ en: 'Early loss is common: about 1 in 10 known pregnancies ends in the first 13 weeks. Most women who have a miscarriage go on to have a healthy pregnancy.', hi: 'शुरुआती नुक़सान आम है: जिन गर्भों का पता चलता है, उनमें से लगभग 10 में से 1 पहले 13 हफ़्तों में ख़त्म हो जाता है। मिसकैरेज के बाद ज़्यादातर महिलाओं का अगला गर्भ स्वस्थ रहता है।' }, 'small loss-oktext') + '</div>' +
      '<div class="card"><h3>' + T({ en: 'What does not cause a miscarriage', hi: 'मिसकैरेज इनसे नहीं होता' }) + '</h3>' + ul([
        { en: 'Going to work, or lifting and bending in housework', hi: 'काम या नौकरी पर जाना, या घर के काम में वज़न उठाना और झुकना' },
        { en: 'Exercise and walking', hi: 'कसरत और पैदल चलना' },
        { en: 'Having sex', hi: 'संबंध बनाना (सेक्स)' },
        { en: 'A journey or a flight', hi: 'सफ़र या हवाई यात्रा' },
        { en: 'A shock, a fright, stress or an argument', hi: 'सदमा, डर, तनाव या झगड़ा' },
        { en: 'Spicy or "hot" food. Ripe papaya eaten in normal amounts is not a known cause either.', hi: 'मसालेदार या “गर्म” खाना। सामान्य मात्रा में खाया पका पपीता भी इसका कोई जाना-माना कारण नहीं है।' },
        { en: 'Having taken birth control pills in the past', hi: 'पहले कभी गर्भनिरोधक गोलियाँ लेना' }
      ]) + P({ en: 'A fall or a knock is usually not the cause either. These things often just happened around the same time, so they stay fresh in the memory.', hi: 'गिरना या चोट लगना भी आम तौर पर कारण नहीं होता। अक्सर ये बातें बस उसी समय हुईं, इसलिए याद में ताज़ा रहती हैं।' }, 'small') + '</div>' +
      '<h2>' + T({ en: 'What each word means', hi: 'हर शब्द का मतलब' }) + '</h2>' +
      acc({ en: 'Miscarriage', hi: 'मिसकैरेज (गर्भ गिरना)' },
        P({ en: 'The pregnancy ends on its own in the first months; most happen in the first 13 weeks. There is usually bleeding and cramping, and tissue may pass. The doctor calls it complete when the womb is empty, and incomplete when some tissue is still inside. An incomplete miscarriage may need medicine or a short procedure.', hi: 'गर्भ शुरुआती महीनों में अपने आप ख़त्म हो जाता है; ज़्यादातर पहले 13 हफ़्तों में। आम तौर पर ब्लीडिंग और ऐंठन होती है, और टुकड़े (tissue) निकल सकते हैं। बच्चेदानी पूरी ख़ाली हो जाए तो डॉक्टर इसे complete कहती हैं, और कुछ हिस्सा अंदर रह जाए तो incomplete। Incomplete में दवा या एक छोटी प्रक्रिया की ज़रूरत पड़ सकती है।' }) +
        P({ en: 'A loss after about 14 weeks is often called a late miscarriage. You may need to give birth, usually after medicine to start labour. It is still a birth, and you should get the same care as any woman giving birth.', hi: 'लगभग 14 हफ़्ते के बाद के नुक़सान को अक्सर late miscarriage कहते हैं। इसमें बच्चे को जन्म देना पड़ सकता है, आम तौर पर दवा से दर्द (labour) शुरू करके। यह भी एक जन्म है, और आपको वैसी ही देखभाल मिलनी चाहिए जैसी जन्म देने वाली हर महिला को।' }, 'small'), true) +
      acc({ en: 'Missed miscarriage', hi: 'मिस्ड मिसकैरेज' },
        P({ en: 'The scan shows the pregnancy has stopped growing, or there is no heartbeat, but you had little or no bleeding. You may still feel pregnant, which makes the news very hard to take in.', hi: 'Scan में दिखता है कि गर्भ बढ़ना बंद हो गया है या धड़कन नहीं है, पर ब्लीडिंग कम हुई या बिल्कुल नहीं। आपको अब भी गर्भवती जैसा लग सकता है, इसलिए यह ख़बर मानना बहुत कठिन होता है।' }) +
        P({ en: 'If the scan is not clear, doctors do a second scan at least 7 days later before deciding; you can ask for one. Then you can choose to wait for it to pass on its own, take medicine, or have a short procedure. A gynaecologist explains which suits you.', hi: 'Scan साफ़ न हो, तो डॉक्टर फ़ैसले से पहले कम से कम 7 दिन बाद दूसरा scan करती हैं; आप यह माँग सकती हैं। फिर आप चुन सकती हैं: अपने आप निकलने का इंतज़ार, दवा, या एक छोटी प्रक्रिया। आपके लिए क्या ठीक है, स्त्री रोग विशेषज्ञ समझाएँगी।' }, 'small')) +
      acc({ en: 'Chemical pregnancy', hi: 'केमिकल प्रेग्नेंसी' },
        P({ en: 'A positive test, then a period-like bleed a few days later, before a scan could see the pregnancy. It is a very early miscarriage and usually needs no treatment. It was still a pregnancy, and it is okay to feel sad.', hi: 'Test positive आया, फिर कुछ दिन बाद पीरियड जैसी ब्लीडिंग, scan में गर्भ दिखने से पहले ही। यह बहुत जल्दी का मिसकैरेज है और आम तौर पर इसमें इलाज की ज़रूरत नहीं होती। फिर भी यह गर्भ था, और दुखी होना ठीक है।' }) +
        P({ en: 'See a doctor if the bleeding is very heavy, or if a test is still positive 3 weeks later.', hi: 'ब्लीडिंग बहुत ज़्यादा हो, या 3 हफ़्ते बाद भी test positive आए, तो डॉक्टर को दिखाएँ।' }, 'small')) +
      acc({ en: 'Ectopic pregnancy', hi: 'Ectopic (बच्चेदानी के बाहर गर्भ)' },
        P({ en: 'The pregnancy grows outside the womb, almost always in a fallopian tube. It can never grow into a baby. As it grows it can burst the tube and bleed inside, which is why one-sided pain, shoulder-tip pain, dizziness or fainting need the nearest hospital at once.', hi: 'गर्भ बच्चेदानी के बाहर ठहर जाता है, लगभग हमेशा एक नली (fallopian tube) में। यह कभी बच्चा नहीं बन सकता। बढ़ने पर नली फट सकती है और अंदर ख़ून बह सकता है, इसीलिए एक तरफ़ दर्द, कंधे की नोक में दर्द, चक्कर या बेहोशी हो तो तुरंत सबसे पास के अस्पताल जाएँ।' }) +
        P({ en: 'A gynaecologist treats it in a hospital: by watching it closely, with an injection (methotrexate), or with keyhole surgery. Often no reason is found. Most women can get pregnant again, even with one tube.', hi: 'इसका इलाज अस्पताल में स्त्री रोग विशेषज्ञ करती हैं: ध्यान से निगरानी, एक इंजेक्शन (methotrexate), या दूरबीन से ऑपरेशन। अक्सर कोई कारण नहीं मिलता। ज़्यादातर महिलाएँ फिर से गर्भवती हो सकती हैं, एक नली के साथ भी।' }, 'small')) +
      acc({ en: 'Molar pregnancy', hi: 'मोलर प्रेग्नेंसी' },
        P({ en: "When the egg and sperm joined, the genetic material went wrong. The placenta tissue grows into a cluster of small cysts, and a baby either doesn't form (complete mole) or cannot survive (partial mole). It happens by chance; neither partner did anything wrong.", hi: 'अंडे और शुक्राणु के मिलते समय genetic सामग्री में गड़बड़ी हो गई। आँवल (placenta) का tissue छोटे-छोटे दानों के गुच्छे जैसा बढ़ने लगता है, और बच्चा या तो बनता ही नहीं (complete mole) या बच नहीं सकता (partial mole)। यह संयोग से होता है; पति-पत्नी में से किसी की ग़लती नहीं।' }) +
        P({ en: 'It may cause bleeding, very bad vomiting or a bump bigger than expected, and is usually found on a scan. The womb is emptied, usually with a short suction procedure. Then hCG blood or urine tests continue for some months. Go to every one: sometimes cells stay behind and need more treatment, which works very well when it is found early.', hi: 'इसमें ब्लीडिंग, बहुत ज़्यादा उल्टी, या पेट उम्मीद से बड़ा लग सकता है, और आम तौर पर scan में पता चलता है। बच्चेदानी ख़ाली की जाती है, ज़्यादातर suction की एक छोटी प्रक्रिया से। फिर कुछ महीनों तक hCG का blood या पेशाब test चलता है। हर test पर जाएँ: कभी-कभी कुछ cells रह जाते हैं और उन्हें आगे इलाज चाहिए होता है, जो जल्दी पता चलने पर बहुत अच्छा काम करता है।' }, 'small')) +
      acc({ en: 'Stillbirth', hi: 'Stillbirth (मृत जन्म)' },
        P({ en: 'When a baby dies in the womb at 28 weeks or later, India calls it a stillbirth. Some countries count from 20 or 24 weeks.', hi: 'जब बच्चे की मौत गर्भ में 28 हफ़्ते या उसके बाद होती है, तो भारत में इसे stillbirth (मृत जन्म) कहते हैं। कुछ देश 20 या 24 हफ़्ते से गिनते हैं।' }) +
        P({ en: 'Usually labour is started with medicine and the baby is born the normal way. This is safer for you than a caesarean, which is used only when there is a medical reason. If you are well, you can often take a day or two before it starts.', hi: 'आम तौर पर दवा से labour शुरू किया जाता है और बच्चे का जन्म सामान्य रास्ते से होता है। यह आपके लिए ऑपरेशन से ज़्यादा सुरक्षित है; ऑपरेशन सिर्फ़ किसी medical वजह से होता है। अगर आपकी तबीयत ठीक है, तो अक्सर शुरू करने से पहले एक-दो दिन का समय मिल सकता है।' }, 'small') +
        P({ en: 'Causes include problems with the placenta or cord, high BP, diabetes, infections and the baby not growing well; for many, no cause is found. Tests on your blood, the placenta and cord, and the baby only if you agree, can help plan a next pregnancy.', hi: 'कारणों में आँवल या नाल की दिक़्क़त, BP, sugar, infection और बच्चे का ठीक से न बढ़ना शामिल हैं; कई बार कोई कारण नहीं मिलता। आपके खून, आँवल और नाल की जाँच, और सिर्फ़ आपकी मर्ज़ी हो तो बच्चे की जाँच, अगले गर्भ की योजना में मदद कर सकती है।' }, 'small')) +
      '<div class="card"><h3>' + T({ en: 'Words you may see on a report', hi: 'रिपोर्ट पर दिख सकने वाले शब्द' }) + '</h3><div class="loss-terms">' +
        term('Spontaneous abortion', { en: "The medical name for a miscarriage. It does not mean anyone ended the pregnancy.", hi: 'मिसकैरेज का medical नाम। इसका मतलब यह नहीं कि किसी ने गर्भ गिराया।' }) +
        term('Complete / incomplete abortion', { en: 'The womb is empty / some tissue is still inside', hi: 'बच्चेदानी ख़ाली है / कुछ tissue अभी अंदर है' }) +
        term('Missed abortion', { en: 'A missed miscarriage', hi: 'मिस्ड मिसकैरेज' }) +
        term('Blighted ovum, anembryonic', { en: 'A pregnancy sac grew but no baby formed. A kind of early miscarriage.', hi: 'गर्भ की थैली बनी पर बच्चा नहीं बना। यह शुरुआती मिसकैरेज का एक रूप है।' }) +
        term('RPOC, retained products', { en: 'Pregnancy tissue still left in the womb', hi: 'बच्चेदानी में अभी भी बचा गर्भ का tissue' }) +
        term('IUFD', { en: 'The baby died in the womb', hi: 'बच्चे की गर्भ में ही मौत' }) +
        term('hCG', { en: 'The pregnancy hormone that tests measure', hi: 'गर्भ का hormone, जिसे test नापते हैं' }) +
        term('Rh negative', { en: 'A blood group type; it may need an anti-D injection', hi: 'Blood group का एक प्रकार; इसमें anti-D इंजेक्शन की ज़रूरत पड़ सकती है' }) +
      '</div></div>' +
      '<div class="card soft">' + '<p class="small">' + esc(t('qura_std')) + '</p>' +   /* Version 39.77: who Qura's doctors are, in Mohit's words */
      '<div class="row wrap">' + goBtn('loss-recovery', { en: 'Your body after a loss', hi: 'नुक़सान के बाद आपका शरीर' }) + askQuiet({ en: 'Understanding my pregnancy loss', hi: 'मेरे गर्भ के नुक़सान को समझना' }) + '</div></div>' +
      (S.govOk && S.govOk() && S.govCard ? S.govCard() : '') +   /* Version 39.77 (D44): both */
      sources(['ACOG, Early pregnancy loss (2024)', 'RCOG, Early miscarriage (patient information)', 'HSE Ireland, Miscarriage: reducing your risk (2024)', 'NHS, Miscarriage (2026), Ectopic pregnancy, Molar pregnancy, Stillbirth', 'NICE NG126', 'State Registration of Births and Deaths Rules (still-birth from 28 weeks)']);
    S.wire(v);
  }

  /* ---------- body after a loss ---------- */
  function renderRecovery(v) {
    own();
    v.innerHTML = S.backRow(t('loss_recovery'), 'loss', false) +
      P({ en: 'Most women feel physically better within a few days to two weeks. Here is what is usual, and what needs a doctor.', hi: 'ज़्यादातर महिलाएँ कुछ दिनों से दो हफ़्तों में शरीर से बेहतर महसूस करने लगती हैं। यहाँ बताया है कि क्या सामान्य है, और कब डॉक्टर ज़रूरी है।' }, 'small') +
      '<div class="card dark"><h3>' + T({ en: 'Go to the nearest hospital now', hi: 'अभी सबसे पास के अस्पताल जाएँ या अस्पताल जाएँ' }) + '</h3>' + ul(RED_NOW) + '</div>' +
      '<div class="card warn"><h3 style="color:var(--accent)">' + T({ en: 'Go to a hospital today', hi: 'आज ही अस्पताल जाएँ' }) + '</h3>' + ul(RED_TODAY) + P({ en: 'These can mean an infection or tissue left inside. Both are treatable.', hi: 'इनका मतलब infection या अंदर बचा tissue हो सकता है। दोनों का इलाज होता है।' }, 'small') + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Bleeding and pain', hi: 'ब्लीडिंग और दर्द' }) + '</h2>' + ul([
        { en: 'Bleeding is like a heavy period for the first day or so, then gets lighter and may turn brown. It can go on for 1 to 2 weeks.', hi: 'पहले एक-दो दिन ब्लीडिंग भारी पीरियड जैसी होती है, फिर कम होती है और भूरी हो सकती है। यह 1 से 2 हफ़्ते तक चल सकती है।' },
        { en: 'Cramps like period pain on the day, and milder cramps for a day or so after. A painkiller such as paracetamol helps; ask your doctor what suits you.', hi: 'उस दिन पीरियड जैसी ऐंठन, और उसके बाद एक-दो दिन हल्की ऐंठन। Paracetamol जैसी दर्द की दवा से आराम मिलता है; अपनी डॉक्टर से पूछें कि आपके लिए क्या ठीक है।' },
        { en: 'Use pads, not tampons or a menstrual cup, until the bleeding stops. This keeps infection away.', hi: 'ब्लीडिंग रुकने तक pad इस्तेमाल करें, tampon या menstrual cup नहीं। इससे infection से बचाव होता है।' },
        { en: 'Wait with sex until the bleeding and pain have settled and you feel ready.', hi: 'जब तक ब्लीडिंग और दर्द ठीक न हो जाएँ और आप तैयार महसूस न करें, संबंध न बनाएँ।' },
        { en: 'Rest for a few days. If you lost a lot of blood or feel tired and breathless, ask for a haemoglobin test; it is free at a government hospital.', hi: 'कुछ दिन आराम करें। ज़्यादा ख़ून गया हो, या थकान और साँस फूलती हो, तो हीमोग्लोबिन जाँच माँगें; सरकारी अस्पताल में यह मुफ़्त है।', doc: { en: 'Rest for a few days. If you lost a lot of blood or feel tired and breathless, ask your doctor for a haemoglobin test; it is also free at a government hospital.', hi: 'कुछ दिन आराम करें। ज़्यादा ख़ून गया हो, या थकान और साँस फूलती हो, तो डॉक्टर से हीमोग्लोबिन जाँच माँगें; सरकारी अस्पताल में यह मुफ़्त भी है।' } }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'A pregnancy test after 3 weeks', hi: '3 हफ़्ते बाद pregnancy test' }) + '</h2>' +
      P({ en: 'A home test can stay positive for a while after a loss. Do one 3 weeks afterwards. If it is still positive, see your doctor: some tissue may still be inside, and it needs checking.', hi: 'नुक़सान के बाद कुछ समय तक घर का test positive दिख सकता है। 3 हफ़्ते बाद एक test करें। तब भी positive आए, तो डॉक्टर को दिखाएँ: अंदर कुछ tissue बचा हो सकता है, और उसकी जाँच ज़रूरी है।' }) + '</div>' +
      '<div class="card warn"><h2>' + T({ en: 'Know your blood group', hi: 'अपना blood group जानें' }) + '</h2>' +
      P({ en: 'If your blood group is Rh negative (O, A, B or AB negative), tell the doctor straight away and ask about an anti-D injection. It stops your body making antibodies that could harm a baby in a future pregnancy.', hi: 'अगर आपका blood group Rh negative है (O, A, B या AB negative), तो डॉक्टर को तुरंत बताएँ और anti-D इंजेक्शन के बारे में पूछें। यह आपके शरीर को ऐसी antibodies बनाने से रोकता है जो अगले गर्भ में बच्चे को नुक़सान पहुँचा सकती हैं।' }) +
      ul([
        { en: 'From 12 weeks of pregnancy onwards, and after a stillbirth, it is offered to every Rh-negative woman.', hi: 'गर्भ के 12 हफ़्ते से आगे, और stillbirth के बाद, यह हर Rh negative महिला को दिया जाता है।' },
        { en: 'Before 12 weeks, guidelines differ with how the loss was treated, so your doctor decides.', hi: '12 हफ़्ते से पहले, नुक़सान का इलाज कैसे हुआ उसके हिसाब से नियम अलग हैं, इसलिए आपकी डॉक्टर तय करती हैं।' },
        { en: 'It works best as soon as possible, within 72 hours (3 days) of the bleeding or procedure. If 3 days have passed, still ask: it can give some protection up to 10 days.', hi: 'यह जितनी जल्दी हो सके, ब्लीडिंग या प्रक्रिया के 72 घंटे (3 दिन) के अंदर सबसे अच्छा काम करता है। 3 दिन निकल गए हों, तब भी पूछें: 10 दिन तक कुछ बचाव मिल सकता है।' }
      ]) + P({ en: 'The injection is given by an MBBS doctor or at a hospital.', hi: 'यह इंजेक्शन MBBS डॉक्टर या अस्पताल में लगाया जाता है।' }, 'small') + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Your periods', hi: 'आपके पीरियड' }) + '</h2>' +
      P({ en: 'After an early miscarriage, your first period usually comes in 4 to 6 weeks. It may be heavier than usual, and your cycle can take a few months to settle. No period by 8 weeks: do a pregnancy test and see a doctor.', hi: 'शुरुआती मिसकैरेज के बाद पहला पीरियड आम तौर पर 4 से 6 हफ़्ते में आता है। यह सामान्य से भारी हो सकता है, और चक्र को ठीक होने में कुछ महीने लग सकते हैं। 8 हफ़्ते तक पीरियड न आए: pregnancy test करें और डॉक्टर को दिखाएँ।' }) +
      (S.canSave() ? P({ en: 'When it comes, log it on the Today page like any other period.', hi: 'जब आए, तो “आज” पन्ने पर बाक़ी पीरियड की तरह दर्ज करें।' }, 'small') : '') + '</div>' +
      '<div class="card"><h2>' + T({ en: 'If you want a gap before the next pregnancy', hi: 'अगर अगले गर्भ से पहले कुछ समय चाहिए' }) + '</h2>' +
      P({ en: 'You can get pregnant again before your first period, as early as about 2 weeks after an early loss. Every method in the government programme can be used after a miscarriage: condoms, pills, Chhaya, the Antara injection or a Copper-T. Most are best started within 7 days, and a Copper-T within 12 days, so ask before you leave the hospital. Government health centres give them free, and your ASHA can bring condoms and pills home.', hi: 'पहले पीरियड से पहले भी आप फिर गर्भवती हो सकती हैं, शुरुआती नुक़सान के लगभग 2 हफ़्ते बाद से ही। सरकारी कार्यक्रम का हर तरीक़ा मिसकैरेज के बाद अपनाया जा सकता है: condom, गोलियाँ, छाया, अंतरा इंजेक्शन या Copper-T। ज़्यादातर तरीक़े 7 दिन के अंदर और Copper-T 12 दिन के अंदर शुरू करना सबसे अच्छा है, इसलिए अस्पताल से निकलने से पहले पूछ लें। सरकारी स्वास्थ्य केंद्र ये मुफ़्त देते हैं, और आपकी ASHA condom और गोलियाँ घर तक ला सकती हैं।', doc: { en: 'You can get pregnant again before your first period, as early as about 2 weeks after an early loss. Every usual method can be used after a miscarriage: condoms, pills, Chhaya, the Antara injection or a Copper-T. Most are best started within 7 days, and a Copper-T within 12 days, so ask your doctor before you leave the hospital. Government health centres also give them free, and your ASHA can bring condoms and pills home.', hi: 'पहले पीरियड से पहले भी आप फिर गर्भवती हो सकती हैं, शुरुआती नुक़सान के लगभग 2 हफ़्ते बाद से ही। हर आम तरीक़ा मिसकैरेज के बाद अपनाया जा सकता है: condom, गोलियाँ, छाया, अंतरा इंजेक्शन या Copper-T। ज़्यादातर तरीक़े 7 दिन के अंदर और Copper-T 12 दिन के अंदर शुरू करना सबसे अच्छा है, इसलिए अस्पताल से निकलने से पहले डॉक्टर से पूछ लें। सरकारी स्वास्थ्य केंद्र ये मुफ़्त भी देते हैं, और आपकी ASHA condom और गोलियाँ घर तक ला सकती हैं।' } }) +
      '<div class="row wrap">' + goBtn('contra-free', { en: 'Free methods near you', hi: 'आपके पास मुफ़्त तरीक़े' }) + goBtn('contra-chooser', { en: 'Which method suits me', hi: 'मेरे लिए कौन-सा तरीक़ा' }) + '</div></div>' +
      '<h2>' + T({ en: 'After a particular kind of loss', hi: 'किसी ख़ास तरह के नुक़सान के बाद' }) + '</h2>' +
      acc({ en: 'After an ectopic pregnancy', hi: 'Ectopic के बाद' }, ul([
        { en: 'Go to every hCG blood test until the level is back to zero. Until then the tube can still burst: sudden pain, shoulder pain or weakness means the nearest hospital, now.', hi: 'जब तक hCG का स्तर शून्य न हो जाए, हर blood test पर जाएँ। तब तक नली फट सकती है: अचानक दर्द, कंधे में दर्द या कमज़ोरी हो तो अभी सबसे पास के अस्पताल जाएँ।' },
        { en: 'After the methotrexate injection: no alcohol, and no folic acid tablets, multivitamins or painkillers like ibuprofen until your doctor says. Use reliable contraception for at least 3 months, because the medicine can harm a baby.', hi: 'Methotrexate इंजेक्शन के बाद: डॉक्टर के कहने तक शराब नहीं, और folic acid की गोली, multivitamin या ibuprofen जैसी दर्द की दवा नहीं। कम से कम 3 महीने पक्का गर्भनिरोध रखें, क्योंकि यह दवा बच्चे को नुक़सान पहुँचा सकती है।' },
        { en: 'After keyhole surgery, full recovery can take 4 to 6 weeks.', hi: 'दूरबीन के ऑपरेशन के बाद पूरी तरह ठीक होने में 4 से 6 हफ़्ते लग सकते हैं।' }
      ])) +
      acc({ en: 'After a molar pregnancy', hi: 'मोलर प्रेग्नेंसी के बाद' }, ul([
        { en: 'You will have hCG blood or urine tests, often every 2 weeks until normal, then for some months more, often about 6. Go to every one, even when you feel well.', hi: 'आपके hCG के blood या पेशाब test होंगे, अक्सर सामान्य होने तक हर 2 हफ़्ते, फिर कुछ और महीने, अक्सर लगभग 6। हर test पर जाएँ, भले ही आप ठीक महसूस करें।' },
        { en: 'Avoid pregnancy until the follow-up is over. Condoms or contraceptive pills are fine meanwhile; ask your doctor before getting a Copper-T.', hi: 'Follow-up पूरा होने तक गर्भ से बचें। तब तक condom या गर्भनिरोधक गोलियाँ ठीक हैं; Copper-T लगवाने से पहले डॉक्टर से पूछें।' },
        { en: 'In every future pregnancy, tell your doctor about it, and have an hCG test about 6 weeks after that pregnancy ends.', hi: 'आगे हर गर्भ में डॉक्टर को इसके बारे में बताएँ, और उस गर्भ के ख़त्म होने के लगभग 6 हफ़्ते बाद hCG test कराएँ।' }
      ])) +
      acc({ en: 'After a later loss or a stillbirth', hi: 'देर से हुए नुक़सान या stillbirth के बाद' }, ul([
        { en: 'Your body recovers as it does after any birth: bleeding for some weeks, a sore or stitched area, tiredness.', hi: 'आपका शरीर किसी भी जन्म के बाद की तरह ठीक होता है: कुछ हफ़्ते ब्लीडिंग, दर्द या टाँकों वाली जगह, थकान।' },
        { en: 'Your breasts may make milk a few days later. This can hurt and be very upsetting. A doctor can give a medicine to stop it, or you can let it dry up on its own; ask which suits you.', hi: 'कुछ दिन बाद स्तनों में दूध आ सकता है। यह दर्द दे सकता है और मन को बहुत दुखी कर सकता है। डॉक्टर इसे रोकने की दवा दे सकती हैं, या आप इसे अपने आप सूखने दे सकती हैं; पूछें कि आपके लिए क्या ठीक है।' },
        { en: 'Have a check-up a few weeks later: your health, BP, and any test results.', hi: 'कुछ हफ़्ते बाद जाँच कराएँ: आपकी सेहत, BP, और जाँचों के नतीजे।' }
      ])) +
      '<div class="card"><h2>' + T({ en: 'Free care near you', hi: 'पास में मुफ़्त इलाज' }) + '</h2>' +
      P({ en: 'Your nearest PHC, CHC or district hospital can check and treat you. Under JSSK, complications in pregnancy are treated free at government hospitals: medicines, tests, blood if needed, and the 102 ambulance.', hi: 'आपका नज़दीकी PHC, CHC या ज़िला अस्पताल जाँच और इलाज कर सकता है। JSSK के तहत सरकारी अस्पतालों में गर्भ की जटिलताओं का इलाज मुफ़्त है: दवा, जाँच, ज़रूरत हो तो खून, और 102 एम्बुलेंस।', doc: { en: 'Your gynaecologist, or your nearest PHC, CHC or district hospital, can check and treat you. Under JSSK, complications in pregnancy are treated free at government hospitals: medicines, tests, blood if needed, and the 102 ambulance.', hi: 'आपकी स्त्री रोग विशेषज्ञ, या नज़दीकी PHC, CHC या ज़िला अस्पताल जाँच और इलाज कर सकते हैं। JSSK के तहत सरकारी अस्पतालों में गर्भ की जटिलताओं का इलाज मुफ़्त है: दवा, जाँच, ज़रूरत हो तो खून, और 102 एम्बुलेंस।' } }) +
      '<div class="row">' + goBtn('access-care', { en: 'Find free care near you', hi: 'पास में मुफ़्त इलाज खोजें' }) + '</div></div>' +
      '<div class="card"><h2>' + T({ en: 'Time off work', hi: 'काम से छुट्टी' }) + '</h2>' +
      P({ en: 'If you work, the law gives you 6 weeks of paid leave after a miscarriage, and up to 1 more month if you fall ill because of it. Your employer can ask for proof, such as a doctor\'s certificate.', hi: 'अगर आप नौकरी करती हैं, तो क़ानून मिसकैरेज के बाद 6 हफ़्ते की वेतन वाली छुट्टी देता है, और उसकी वजह से बीमार हों तो 1 महीना और। आपका employer सबूत माँग सकता है, जैसे डॉक्टर का certificate।' }) +
      P({ en: 'The same law counts a stillborn baby as a birth, so maternity leave applies; ask HR. It covers factories, mines, plantations, and shops or offices with 10 or more workers (Code on Social Security, 2020, section 65).', hi: 'यही क़ानून मृत जन्मे बच्चे को भी जन्म मानता है, इसलिए maternity leave लागू होती है; HR से पूछें। यह factory, खदान, बागान, और 10 या ज़्यादा कर्मचारियों वाली दुकान या दफ़्तर पर लागू है (Code on Social Security, 2020, धारा 65)।' }, 'small') + '</div>' +
      '<div class="row">' + goBtn('loss-grief', { en: 'Next: grief and your feelings', hi: 'आगे: दुख और आपका मन' }) + '</div>' +
      sources(['RCOG, Early miscarriage (patient information)', 'NHS, Miscarriage (2026), Ectopic pregnancy: treatment, Molar pregnancy, Stillbirth: what happens', 'ACOG, Early pregnancy loss; Ectopic pregnancy', 'NICE NG126 (anti-D update, 2026)', 'UHCW NHS Trust, Anti-D immunoglobulin injection (2026)', 'MoHFW, Comprehensive Abortion Care guidelines (2023)', 'NHM, Updating the ASHA on family planning', 'HDFT NHS Trust, Molar pregnancy', 'MoHFW, MCP card (JSSK)', 'Code on Social Security, 2020, sections 2, 59, 60, 65 and First Schedule']);
    S.wire(v);
  }

  /* ---------- grief ---------- */
  function noteArea() {
    if (!S.canSave()) return S.needDiary() + P({ en: 'Without a diary nothing can be saved here. Writing on paper, or in a letter you keep, can help just as much.', hi: 'डायरी के बिना यहाँ कुछ save नहीं हो सकता। काग़ज़ पर, या किसी चिट्ठी में लिखना भी उतनी ही मदद कर सकता है।' }, 'small');
    const L = peek();
    let saved = '';
    if (L.length) {
      const rows = L.slice().reverse().map((n) => {
        const ask = mem.confirm === n.id;
        return '<div class="loss-noteitem"><div class="row spread"><span class="small">' + esc(dayY(S.fromISO(n.d))) + '</span>' + (ask ? '' : '<button type="button" class="btn sm ghost" data-loss-del="' + esc(n.id) + '">' + esc(t('loss_note_del')) + '</button>') + '</div><p class="loss-note">' + esc(n.text) + '</p>' +
          (ask ? '<div class="card warn loss-confirm"><p class="small" style="color:var(--fg)">' + esc(t('loss_note_del_q')) + '</p><div class="grid2"><button type="button" class="btn sm" data-loss-cancel="1">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" data-loss-yes="' + esc(n.id) + '">' + esc(t('loss_note_del_yes')) + '</button></div></div>' : '') + '</div>';
      }).join('');
      const all = mem.confirm === 'all'
        ? '<div class="card warn loss-confirm"><p class="small" style="color:var(--fg)">' + esc(fill(t('loss_notes_del_all_q'), { n: L.length })) + '</p><div class="grid2"><button type="button" class="btn sm" data-loss-cancel="1">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" data-loss-yes="all">' + esc(t('loss_note_del_yes')) + '</button></div></div>'
        : '<button type="button" class="btn sm danger" data-loss-del="all">' + esc(t('loss_notes_del_all')) + '</button>';
      saved = '<details id="loss-saved"' + (mem.open ? ' open' : '') + '><summary>' + esc(fill(t('loss_notes_h'), { n: L.length })) + '</summary><div class="stack loss-saved">' + rows + all + '</div></details>';
    }
    return '<label for="loss-note">' + esc(t('loss_note_label')) + '</label><textarea id="loss-note" rows="5" maxlength="4000" placeholder="' + esc(tx({ en: 'Write as much or as little as you like.', hi: 'जितना चाहें, उतना लिखें।' })) + '">' + esc(mem.draft) + '</textarea>' +
      '<div class="row"><button type="button" class="btn primary sm" id="loss-save">' + esc(t('loss_note_save')) + '</button></div>' + saved;
  }
  function renderGrief(v) {
    own();
    const say = (o) => '<p class="loss-say">' + T(o) + '</p>';
    v.innerHTML = S.backRow(t('loss_grief'), 'loss', false) +
      P({ en: 'There is no right way to feel, and no timetable. Some women cry for weeks. Some feel numb, angry or guilty. Some feel relief, and then guilt about the relief. All of it is normal.', hi: 'महसूस करने का कोई एक सही तरीक़ा नहीं, और कोई तय समय नहीं। कुछ महिलाएँ हफ़्तों रोती हैं। कुछ सुन्न, ग़ुस्से में या दोषी महसूस करती हैं। कुछ को राहत महसूस होती है, और फिर उस राहत पर ग्लानि। यह सब सामान्य है।' }, 'small') +
      '<div class="card"><h2>' + T({ en: 'What grief can look like', hi: 'दुख कैसा दिख सकता है' }) + '</h2>' + ul([
        { en: 'Crying at small things, or not being able to cry at all', hi: 'छोटी-छोटी बातों पर रो पड़ना, या बिल्कुल रो न पाना' },
        { en: 'Poor sleep, no appetite, feeling tired all the time', hi: 'नींद ख़राब, भूख न लगना, हर समय थकान' },
        { en: "Not wanting to see pregnant women or babies, or to go to a godh bharai or naming ceremony", hi: 'गर्भवती महिलाओं या बच्चों को देखने का मन न करना, या गोद भराई या नामकरण में जाने का मन न करना' },
        { en: 'Going over and over what you could have done differently', hi: 'बार-बार सोचना कि आप क्या अलग कर सकती थीं' },
        { en: 'Hard days around the due date or the date of the loss, even years later', hi: 'Due date या नुक़सान की तारीख़ के आसपास कठिन दिन, सालों बाद भी' }
      ]) + P({ en: 'Grief after an early loss is real too. Many women had already thought of a name, worked out the due date or told family.', hi: 'शुरुआती नुक़सान का दुख भी सच्चा है। कई महिलाएँ तब तक नाम सोच चुकी होती हैं, due date निकाल चुकी होती हैं, या परिवार को बता चुकी होती हैं।' }, 'small') + '</div>' +
      '<div class="card warn"><h2>' + T({ en: 'When to get more help', hi: 'कब और मदद लें' }) + '</h2>' +
      P({ en: 'Low mood most days for 2 weeks or more, not being able to eat, sleep or get through the day, panic, or feeling life is not worth living: please talk to someone. Tele-MANAS 14416 is free, any time. Thoughts of harming yourself: call 14416 or 112 now.', hi: 'दो हफ़्ते या ज़्यादा, लगभग रोज़ मन उदास रहना, खाना, सोना या दिन निकालना मुश्किल होना, घबराहट, या लगना कि जीने का कोई मतलब नहीं: किसी से ज़रूर बात करें। Tele-MANAS 14416 मुफ़्त है, कभी भी। ख़ुद को नुक़सान पहुँचाने के विचार आएँ, तो अभी 14416 या 112 पर कॉल करें।' }, '') +
      lines(['14416', '112']) + P({ en: 'Your doctor or the PHC can also help, and can refer you to a counsellor.', hi: 'आपकी डॉक्टर या PHC भी मदद कर सकते हैं, और counsellor के पास भेज सकते हैं।' }, 'small') + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Your partner grieves too', hi: 'पति या साथी को भी दुख होता है' }) + '</h2>' + ul([
        { en: "Men often grieve differently: by keeping busy, staying quiet or looking after you. It doesn't mean he doesn't care.", hi: 'पुरुष अक्सर अलग तरह से दुख मनाते हैं: काम में लगे रहकर, चुप रहकर, या आपका ध्यान रखकर। इसका मतलब यह नहीं कि उन्हें फ़र्क़ नहीं पड़ता।' },
        { en: 'He may feel he has to be strong, and have no one to tell. Ask him how he is.', hi: 'उन्हें लग सकता है कि उन्हें मज़बूत दिखना है, और उनके पास बताने को कोई न हो। उनसे पूछें कि वे कैसे हैं।' },
        { en: 'Tell each other what helps: talking, being held, or some time alone.', hi: 'एक-दूसरे को बताएँ कि क्या मदद करता है: बात करना, गले लगना, या कुछ देर अकेले रहना।' },
        { en: 'Sex and trying again: only when you both feel ready. No one should pressure you.', hi: 'संबंध और फिर से कोशिश: तभी, जब आप दोनों तैयार हों। किसी को आप पर दबाव नहीं डालना चाहिए।' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'When family blames you', hi: 'जब परिवार आपको दोष दे' }) + '</h2>' +
      P({ en: "In many homes someone says it happened because you worked too hard, lifted something, travelled or ate papaya. It did not. You can use words like these, or ask the doctor to explain to your husband and family. Many families accept it better from a doctor.", hi: 'कई घरों में कोई कह देता है कि ऐसा इसलिए हुआ क्योंकि आपने ज़्यादा काम किया, कुछ भारी उठाया, सफ़र किया या पपीता खाया। ऐसा नहीं है। आप ऐसे शब्द कह सकती हैं, या डॉक्टर से कहें कि वे आपके पति और परिवार को समझाएँ। कई परिवार डॉक्टर की बात ज़्यादा आसानी से मानते हैं।' }, 'small') +
      '<div class="stack">' +
        say({ en: '"The doctor said this usually happens by chance, because of the baby\'s chromosomes. No one caused it."', hi: '“डॉक्टर ने बताया है कि यह ज़्यादातर संयोग से होता है, बच्चे के क्रोमोसोम की वजह से। किसी ने यह नहीं किया।”' }) +
        say({ en: '"Right now I need your support, not questions."', hi: '“अभी मुझे सवाल नहीं, आपका साथ चाहिए।”' }) +
        say({ en: '"I don\'t want to talk about it today."', hi: '“आज मैं इस बारे में बात नहीं करना चाहती।”' }) +
        say({ en: '"Please don\'t ask when we\'ll try again. We\'ll tell you when we\'re ready."', hi: '“कृपया यह मत पूछिए कि हम फिर कब कोशिश करेंगे। जब हम तैयार होंगे, बता देंगे।”' }) +
      '</div>' +
      flag({ en: 'If the blame turns into daily taunts, threats or violence, you deserve to be safe. Women Helpline 181 is free.', hi: 'अगर दोष रोज़ के तानों, धमकियों या मार-पीट में बदल जाए, तो सुरक्षित रहना आपका हक़ है। महिला हेल्पलाइन 181 मुफ़्त है।' }) +
      lines(['181']) + '<div class="row">' + goBtn('intimate-safety', { en: 'Safety at home', hi: 'घर में सुरक्षा' }) + '</div></div>' +
      acc({ en: 'After a later loss: memories, if you want them', hi: 'देर से हुए नुक़सान के बाद: यादें, अगर आप चाहें' },
        P({ en: 'If your baby was born after a later loss, you can choose to see and hold your baby, give a name, and take a photo. You can keep a lock of hair, hand or foot prints, the name band, or the cloth your baby was wrapped in. Ask the staff for quiet time together. If you are unsure, ask whether mementos can be kept for you for later.', hi: 'अगर देर से हुए नुक़सान में आपके बच्चे का जन्म हुआ, तो आप चाहें तो बच्चे को देख सकती हैं, गोद में ले सकती हैं, नाम रख सकती हैं और फ़ोटो ले सकती हैं। आप बालों की एक लट, हाथ या पैर के निशान, नाम वाला band, या वह कपड़ा रख सकती हैं जिसमें बच्चे को लपेटा गया था। Staff से साथ में शांत समय माँगें। अगर तय न कर पाएँ, तो पूछें कि क्या ये यादें बाद के लिए रखी जा सकती हैं।' }) +
        P({ en: 'Some families want prayers or rites; others do not. After an early loss, some women plant a tree, light a diya on the due date, or write a letter. Others prefer not to mark it. There is no wrong choice.', hi: 'कुछ परिवार पूजा या रस्में करना चाहते हैं; कुछ नहीं। शुरुआती नुक़सान के बाद कुछ महिलाएँ पेड़ लगाती हैं, due date पर दीया जलाती हैं, या एक चिट्ठी लिखती हैं। कुछ इसे किसी तरह याद नहीं करना चाहतीं। कोई भी चुनाव ग़लत नहीं है।' }, 'small')) +
      '<div class="card" id="loss-notecard"><h2>' + esc(t('loss_note_h')) + '</h2>' +
      P(S.canSave()
        ? { en: 'Some women find it helps to write to the baby, or to themselves. Write here only if you want to. It is saved only when you tap Save, stays on this phone, is not part of your doctor summary, and you can delete it any time. \"Delete everything\" on the Me page removes it too.', hi: 'कुछ महिलाओं को बच्चे के नाम, या ख़ुद के लिए लिखने से हल्का लगता है। अगर मन हो, तभी यहाँ लिखें। यह तभी save होता है जब आप Save दबाएँ, इसी फ़ोन पर रहता है, डॉक्टर summary में नहीं जाता, और आप इसे कभी भी हटा सकती हैं। “मैं” पन्ने पर “सब कुछ delete करें” से भी यह हट जाता है।' }
        : { en: 'Some women find it helps to write to the baby, or to themselves. A note here can be saved only with a diary, and then it stays on this phone alone.', hi: 'कुछ महिलाओं को बच्चे के नाम, या ख़ुद के लिए लिखने से हल्का लगता है। यहाँ नोट सिर्फ़ डायरी के साथ save हो सकता है, और तब वह सिर्फ़ इसी फ़ोन पर रहता है।' }, 'small') +
      noteArea() + '</div>' +
      sources(['ACOG, Stillbirth; Early pregnancy loss; Repeated miscarriages', 'NHS, Stillbirth: what happens', 'RCOG, Early miscarriage', 'MoHFW, Tele-MANAS 14416']);
    S.wire(v); wireCopy(v); wireNotes(v);
  }
  function wireNotes(v) {
    const ta = v.querySelector('#loss-note');
    if (ta) ta.addEventListener('input', (e) => { mem.draft = e.target.value; });
    const det = v.querySelector('#loss-saved');
    if (det) det.addEventListener('toggle', () => { mem.open = det.open; });
    const sv = v.querySelector('#loss-save');
    if (sv) sv.addEventListener('click', () => {
      const text = (ta ? ta.value : mem.draft).trim();
      if (!text) { S.toast(t('loss_note_empty')); return; }
      const d = D(); if (!Array.isArray(d.notes)) d.notes = [];
      d.notes.push({ id: 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1000), d: S.toISO(S.today()), text: text.slice(0, 4000) });
      S.save(); mem.draft = ''; mem.confirm = null; mem.open = true; S.toast(t('loss_note_saved')); renderGrief(v); focusNotes(v);
    });
    v.querySelectorAll('[data-loss-del]').forEach((b) => b.addEventListener('click', () => { mem.confirm = b.dataset.lossDel; mem.open = true; renderGrief(v); focusNotes(v); }));
    v.querySelectorAll('[data-loss-cancel]').forEach((b) => b.addEventListener('click', () => { mem.confirm = null; renderGrief(v); focusNotes(v); }));
    v.querySelectorAll('[data-loss-yes]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.lossYes; const mods = S.state.mods || {}; const d = mods.loss;
      if (d && Array.isArray(d.notes)) {
        d.notes = id === 'all' ? [] : d.notes.filter((n) => n.id !== id);
        if (!d.notes.length) delete mods.loss;   /* leave no trace once the last note is gone */
      }
      S.save(); mem.confirm = null; S.toast(t(id === 'all' ? 'loss_notes_deleted' : 'loss_note_deleted')); renderGrief(v); focusNotes(v);
    }));
  }
  /* Re-rendering in place keeps her position on the page instead of jumping to the top. */
  function focusNotes(v) { const c = v.querySelector('#loss-notecard'); if (c && c.scrollIntoView) { try { c.scrollIntoView({ block: 'start' }); } catch (e) { /* older browsers */ } } }

  /* ---------- trying again ---------- */
  function renderAgain(v) {
    own();
    v.innerHTML = S.backRow(t('loss_again'), 'loss', false) +
      P({ en: 'There is no rush. Your body and your heart may be ready at different times, and both matter.', hi: 'कोई जल्दी नहीं है। आपका शरीर और आपका मन अलग-अलग समय पर तैयार हो सकते हैं, और दोनों मायने रखते हैं।' }, 'small') +
      '<div class="card"><h2>' + T({ en: 'Your body', hi: 'आपका शरीर' }) + '</h2>' +
      P({ en: 'After an early miscarriage your body can get pregnant again within weeks. UK guidance (RCOG, NHS) says you can try as soon as you both feel ready, once bleeding and pain have settled. India\'s family planning guidance, based on WHO advice, suggests waiting at least 6 months after a miscarriage. Talk it over with your doctor and choose what feels right; if you want to wait, start a contraceptive method now.', hi: 'शुरुआती मिसकैरेज के बाद शरीर कुछ ही हफ़्तों में फिर गर्भवती हो सकता है। UK की guidance (RCOG, NHS) कहती है कि ब्लीडिंग और दर्द ठीक होने के बाद, जब आप दोनों तैयार हों, कोशिश कर सकते हैं। भारत की परिवार नियोजन guidance, WHO की सलाह के आधार पर, मिसकैरेज के बाद कम से कम 6 महीने रुकने को कहती है। अपनी डॉक्टर से बात करें और जो ठीक लगे वह चुनें; रुकना चाहें तो अभी से गर्भनिरोध शुरू करें।' }) +
      P({ en: 'Waiting for one period first makes it easier to work out the due date of the next pregnancy.', hi: 'पहले एक पीरियड आने देने से अगले गर्भ की due date निकालना आसान होता है।' }, 'small') +
      '<div class="row">' + goBtn('contra-chooser', { en: 'Choose a method for a gap', hi: 'अंतर के लिए तरीक़ा चुनें' }) + '</div></div>' +
      '<div class="card"><h2>' + T({ en: 'Your heart', hi: 'आपका मन' }) + '</h2>' + ul([
        { en: 'Ready means you feel able to face a new pregnancy, and the worry that may come with it.', hi: 'तैयार होने का मतलब है कि आप नए गर्भ, और उसके साथ आ सकने वाली चिंता, का सामना कर सकें।' },
        { en: 'Many women feel anxious in the next pregnancy, especially around the week of the loss. Tell your doctor; an early scan or an extra check-up can help.', hi: 'कई महिलाएँ अगले गर्भ में घबराहट महसूस करती हैं, ख़ासकर नुक़सान वाले हफ़्ते के आसपास। अपनी डॉक्टर को बताएँ; जल्दी scan या एक अतिरिक्त जाँच से मदद मिल सकती है।' },
        { en: 'A new baby does not replace the one you lost. You can love a new baby and still miss the one before.', hi: 'नया बच्चा खोए हुए बच्चे की जगह नहीं लेता। आप नए बच्चे को प्यार करते हुए भी पहले वाले को याद कर सकती हैं।' }
      ]) + '</div>' +
      '<div class="card"><h2>' + T({ en: 'Getting ready', hi: 'तैयारी' }) + '</h2>' + ul([
        { en: 'Take folic acid every day from when you start trying until 12 weeks of pregnancy.', hi: 'जब से कोशिश शुरू करें, तब से गर्भ के 12 हफ़्ते तक रोज़ folic acid लें।' },
        { en: 'If you have diabetes, thyroid problems or high BP, get them under control first.', hi: 'Sugar, थायरॉइड या BP की दिक़्क़त हो, तो पहले उसे क़ाबू में लाएँ।' },
        { en: 'No tobacco or alcohol, for both of you.', hi: 'तंबाकू या शराब नहीं, आप दोनों के लिए।' },
        { en: 'Aim for a healthy weight, eat well and sleep well.', hi: 'सेहतमंद वज़न रखें, अच्छा खाएँ और अच्छी नींद लें।' }
      ]) + '<div class="row">' + goBtn('ttc-prep', { en: 'Getting ready for pregnancy', hi: 'गर्भ की तैयारी' }) + '</div></div>' +
      '<h2>' + T({ en: 'See a doctor before trying if', hi: 'कोशिश से पहले डॉक्टर से मिलें अगर' }) + '</h2>' +
      acc({ en: 'You had an ectopic pregnancy', hi: 'आपको ectopic हुआ था' }, ul([
        { en: 'Doctors usually advise waiting for at least 2 periods, and at least 3 months after methotrexate.', hi: 'डॉक्टर आम तौर पर कम से कम 2 पीरियड तक रुकने को कहती हैं, और methotrexate के बाद कम से कम 3 महीने।' },
        { en: 'About 1 in 10 women who had one have another. So in your next pregnancy tell the doctor early, and ask for an early scan to check where it is growing.', hi: 'जिन्हें एक बार हुआ, उनमें से लगभग 10 में से 1 को दोबारा होता है। इसलिए अगले गर्भ में डॉक्टर को जल्दी बताएँ, और जल्दी scan माँगें ताकि दिखे कि गर्भ कहाँ ठहरा है।' }
      ])) +
      acc({ en: 'You had a molar pregnancy', hi: 'आपको मोलर प्रेग्नेंसी हुई थी' }, ul([
        { en: 'Wait until your hCG follow-up is complete, often about 6 months. Your doctor tells you when.', hi: 'hCG follow-up पूरा होने तक रुकें, अक्सर लगभग 6 महीने। कब, यह आपकी डॉक्टर बताएँगी।' },
        { en: 'The chance of another molar pregnancy is low, about 1 in 80. Tell your doctor early in every pregnancy.', hi: 'दोबारा मोलर प्रेग्नेंसी की संभावना कम है, लगभग 80 में से 1। हर गर्भ में डॉक्टर को जल्दी बताएँ।' }
      ])) +
      acc({ en: 'You had a stillbirth or a late miscarriage', hi: 'आपको stillbirth या late miscarriage हुआ था' }, ul([
        { en: 'See a gynaecologist first to go over the test results and make a plan. The next pregnancy usually gets closer checks.', hi: 'पहले स्त्री रोग विशेषज्ञ से मिलें, जाँचों के नतीजे समझें और योजना बनाएँ। अगले गर्भ में आम तौर पर ज़्यादा जाँचें होती हैं।' },
        { en: 'If no cause was found and you have no health condition, the chance of a stillbirth happening again is very low.', hi: 'अगर कोई कारण नहीं मिला और आपको कोई बीमारी नहीं है, तो दोबारा stillbirth की संभावना बहुत कम है।' }
      ])) +
      acc({ en: 'You have had 2 or more losses', hi: 'आपके 2 या ज़्यादा नुक़सान हुए हैं' },
        P({ en: 'Ask for tests. Many doctors now look for a cause after 2 losses. Even when no cause is found, about 65 in 100 women have a successful next pregnancy.', hi: 'जाँच माँगें। अब कई डॉक्टर 2 नुक़सान के बाद ही कारण खोजती हैं। कोई कारण न मिले, तब भी लगभग 100 में से 65 महिलाओं का अगला गर्भ सफल होता है।' }) +
        '<div class="row">' + goBtn('ttc-loss2', { en: 'After two or more losses', hi: 'दो या ज़्यादा नुक़सान के बाद' }) + '</div>') +
      '<div class="card soft">' + '<p class="small">' + esc(t('qura_std')) + '</p>' +   /* Version 39.77: who Qura's doctors are, in Mohit's words */
      (S.canSave() ? P({ en: 'When you are ready, you can switch on \"Planning a baby\" on the Me page.', hi: 'जब आप तैयार हों, “मैं” पन्ने पर “बच्चे की योजना” चालू कर सकती हैं।' }, 'small') : '') +
      '<div class="row">' + askQuiet({ en: 'Trying again after a pregnancy loss', hi: 'गर्भ के नुक़सान के बाद फिर से कोशिश' }) + '</div></div>' +
      (S.govOk && S.govOk() && S.govCard ? S.govCard() : '') +   /* Version 39.77 (D44): both */
      sources(['RCOG, Early miscarriage', 'NHS, Miscarriage (2026); Ectopic pregnancy', 'ACOG, Early pregnancy loss; Repeated miscarriages; Stillbirth', 'NHSRC, Family Planning Guidance Booklet for CHO (healthy timing and spacing)', 'HDFT NHS Trust, Molar pregnancy']);
    S.wire(v);
  }

  /* ---------- registration ---------- */
  S.register({
    id: 'loss',
    demoPersona: 'blank',
    strings: {
      en: {
        loss_hub: 'Pregnancy loss', loss_hub_s: 'Gentle, private help after a miscarriage, ectopic or stillbirth',
        loss_types: 'What happened, in plain words', loss_types_s: 'Miscarriage, ectopic, molar, stillbirth, and what does not cause them',
        loss_recovery: 'Your body after a loss', loss_recovery_s: 'Bleeding, warning signs, anti-D, periods, contraception',
        loss_grief: 'Grief and your feelings', loss_grief_s: 'For you and your partner, words for family, a private note',
        loss_again: 'Trying again', loss_again_s: 'When body and heart are ready, and when to see a doctor first',
        loss_open_me: 'Open the Me page',
        loss_note_h: 'A private note', loss_note_label: 'Your note', loss_note_save: 'Save note', loss_note_saved: 'Saved on this phone.', loss_note_empty: 'Write something first.',
        loss_notes_h: 'Your saved notes ({n})', loss_note_del: 'Delete', loss_note_del_q: 'Delete this note? There is no undo.', loss_note_del_yes: 'Yes, delete', loss_note_deleted: 'Note deleted.',
        loss_notes_del_all: 'Delete all my notes', loss_notes_del_all_q: 'Delete all {n} notes? There is no undo.', loss_notes_deleted: 'All notes deleted.'
      },
      hi: {
        loss_hub: 'गर्भ का नुक़सान', loss_hub_s: 'मिसकैरेज, ectopic या stillbirth के बाद, निजी और नरम मदद',
        loss_types: 'क्या हुआ, आसान शब्दों में', loss_types_s: 'मिसकैरेज, ectopic, मोलर, stillbirth, और जिन बातों से यह नहीं होता',
        loss_recovery: 'नुक़सान के बाद आपका शरीर', loss_recovery_s: 'ब्लीडिंग, ख़तरे के संकेत, anti-D, पीरियड, गर्भनिरोध',
        loss_grief: 'दुख और आपका मन', loss_grief_s: 'आपके और साथी के लिए, परिवार से कहने की बातें, एक निजी नोट',
        loss_again: 'फिर से कोशिश', loss_again_s: 'जब शरीर और मन तैयार हों, और कब पहले डॉक्टर से मिलें',
        loss_open_me: '“मैं” पन्ना खोलें',
        loss_note_h: 'एक निजी नोट', loss_note_label: 'आपका नोट', loss_note_save: 'नोट सेव करें', loss_note_saved: 'इस फ़ोन पर सेव हो गया।', loss_note_empty: 'पहले कुछ लिखें।',
        loss_notes_h: 'आपके सेव किए नोट ({n})', loss_note_del: 'हटाएँ', loss_note_del_q: 'यह नोट हटाएँ? यह वापस नहीं आएगा।', loss_note_del_yes: 'हाँ, हटाएँ', loss_note_deleted: 'नोट हट गया।',
        loss_notes_del_all: 'मेरे सारे नोट हटाएँ', loss_notes_del_all_q: 'सारे {n} नोट हटाएँ? ये वापस नहीं आएँगे।', loss_notes_deleted: 'सारे नोट हट गए।'
      }
    },
    routes: { 'loss': renderHub, 'loss-types': renderTypes, 'loss-recovery': renderRecovery, 'loss-grief': renderGrief, 'loss-again': renderAgain },
    open: ['loss', 'loss-types', 'loss-recovery', 'loss-grief', 'loss-again'],
    tiles: [
      { section: 'loss', route: 'loss', title: 'loss_hub', sub: 'loss_hub_s', icon: 'flower', order: 1, gated: false, keywords: 'miscarriage pregnancy loss garbh girna ectopic molar stillbirth chemical missed' },
      { section: 'loss', route: 'loss-types', title: 'loss_types', sub: 'loss_types_s', icon: 'learn', order: 10, gated: false, keywords: 'miscarriage missed chemical ectopic molar stillbirth spontaneous abortion report chromosomes papaya' },
      { section: 'loss', route: 'loss-recovery', title: 'loss_recovery', sub: 'loss_recovery_s', icon: 'drop', order: 20, gated: false, keywords: 'bleeding after miscarriage anti-d rh negative period contraception hcg leave' },
      { section: 'loss', route: 'loss-grief', title: 'loss_grief', sub: 'loss_grief_s', icon: 'heart', order: 30, gated: false, keywords: 'grief sad partner family blame tele-manas note memory' },
      { section: 'loss', route: 'loss-again', title: 'loss_again', sub: 'loss_again_s', icon: 'leaf', order: 40, gated: false, keywords: 'trying again after miscarriage pregnant again wait recurrent' }
    ],
    css: [
      '.loss-open { font-size: 16px; }',
      '.loss-fi { flex-shrink: 0; width: 20px; height: 20px; display: inline-flex; }',
      '.loss-fi svg { width: 20px; height: 20px; }',
      '.loss-ft { min-width: 0; }',
      '.loss-hl { min-width: 0; }',
      '.loss-oktext { color: var(--ok); }',
      '.loss-acc { padding: 4px 16px; }',
      '.loss-acc summary { font-size: 15px; color: var(--fg); font-weight: 600; min-height: 44px; display: flex; align-items: center; gap: 8px; list-style: none; }',
      '.loss-acc summary::-webkit-details-marker { display: none; }',
      '.loss-acc summary::after { content: "+"; margin-left: auto; color: var(--accent); font-size: 20px; font-weight: 500; flex-shrink: 0; }',
      '.loss-acc details[open] summary::after { content: "−"; }',
      '.loss-accb { display: flex; flex-direction: column; gap: 8px; padding: 0 0 14px 0; }',
      '.loss-accb p, .loss-accb ul { color: var(--text); font-size: 14px; }',
      '.loss-accb .small { font-size: 13px; }',
      '.loss-terms { display: flex; flex-direction: column; gap: 10px; }',
      '.loss-term { display: flex; flex-direction: column; gap: 2px; border-left: 3px solid var(--peach); padding-left: 10px; min-width: 0; }',
      '.loss-term strong { color: var(--fg); font-size: 14px; overflow-wrap: anywhere; }',
      '.loss-term span { color: var(--muted); font-size: 13px; }',
      '.loss-say { border-left: 3px solid var(--accent-2); padding: 4px 0 4px 10px; color: var(--fg); font-size: 14px; }',
      '.loss-noteitem { display: flex; flex-direction: column; gap: 6px; background: var(--card-2); border-radius: 14px; padding: 10px 12px; }',
      '.loss-note { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--fg); font-size: 14px; }',
      '.loss-saved { margin-top: 8px; }',
      '.loss-confirm { padding: 10px 12px; gap: 8px; }',
      '#loss-saved summary { font-size: 13px; min-height: 40px; display: flex; align-items: center; }'
    ].join('\n'),
    afterRender: (v, route) => { if (!(route === 'loss' || String(route).indexOf('loss-') === 0)) fresh(); }
  });
})(window.Saathi);
