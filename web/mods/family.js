/* For my family (Version 39.7 merged the family and partner pages into one; it was "Explain it to my family"): short cards she
   can send on WhatsApp to her husband, mother-in-law, mother or daughter, so the people at home understand periods, the weeks
   after a birth, mood after a baby, PMOS, iron tablets, pregnancy check-ups, menopause and trying for a baby, plus the husband's
   page as cards. Nothing about her or her diary goes in them. The cards for her stage come first; the rest fold away.
   Copy written in Qura's house voice and checked against the module safety rules; needs a doctor's review before launch. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const LD = (en, hi, den, dhi) => ({ en: en, hi: hi, doc: { en: den, hi: dhi } });   /* Version 39.29: with its doctor-route words */
  /* who: the person it's for. st: the stages it fits best (first in her list). */
  const C = [
    { id: 'periods', who: 'family_w_all', st: ['cycle', 'ttc', 'meno', 'browse'],
      h: { en: 'Periods are normal, not impure', hi: 'पीरियड आम बात है, अशुद्ध नहीं' },
      p: { en: 'Many homes still keep a woman out of the kitchen during her period, right? But a period is a healthy, monthly part of her body. Nothing about it is dirty, and it doesn\'t spoil food or pickles. Some months it hurts. On those days let her rest, keep a hot water bag ready, and make sure there are always pads or clean cloth at home. If the pain stops her from working or going to school, she should see a doctor.',
        hi: 'कई घरों में आज भी पीरियड के दिनों में औरत को रसोई से दूर रखा जाता है, है ना? पर पीरियड उसके शरीर का एक स्वस्थ हिस्सा है, जो हर महीने आता है। इसमें कुछ भी गंदा नहीं, और इससे खाना या अचार ख़राब नहीं होता। किसी महीने दर्द ज़्यादा होता है। उन दिनों उसे आराम करने दें, गर्म पानी की थैली तैयार रखें, और ध्यान रखें कि घर में पैड या साफ़ कपड़ा हमेशा रहे। अगर दर्द से उसका काम या स्कूल छूट जाए, तो उसे डॉक्टर को दिखाना चाहिए।' } },
    { id: 'forty', who: 'family_w_all', st: ['post', 'preg'],
      h: { en: 'The first 40 days after a baby', hi: 'बच्चे के बाद के पहले 40 दिन' },
      p: { en: 'After a birth, a mother\'s body takes about six weeks to heal. She needs rest, good food like dal, milk, eggs or paneer, green vegetables and fruit, and plenty of water. Take over some of the housework so she can feed the baby and sleep when the baby sleeps. If she soaks a pad in an hour, gets a fever, notices a bad smell, or has bad pain in her belly, take her to a doctor the same day.',
        hi: 'डिलीवरी के बाद माँ के शरीर को ठीक होने में लगभग छह हफ़्ते लगते हैं। उसे आराम, अच्छा खाना जैसे दाल, दूध, अंडे या पनीर, हरी सब्ज़ियाँ और फल, और ख़ूब पानी चाहिए। घर का कुछ काम आप सँभाल लें, ताकि वह बच्चे को दूध पिला सके और जब बच्चा सोए तब सो सके। अगर एक घंटे में पैड भीग जाए, बुखार आए, बदबू आए, या पेट में तेज़ दर्द हो, तो उसी दिन डॉक्टर के पास ले जाएँ।' } },
    { id: 'mood', who: 'family_w_all', st: ['post'],
      h: { en: 'Her mood after the baby', hi: 'बच्चे के बाद उसका मन' },
      p: { en: 'Many new mothers cry easily or feel low in the first two weeks. That\'s common, and it usually passes. If she\'s sad most of the day for more than two weeks, can\'t sleep even when the baby sleeps, or says she can\'t cope, she needs help. This is an illness, not weakness, and it can be treated. Tele-MANAS 14416 is free. If she talks about harming herself or the baby, call 112 now.',
        hi: 'बहुत सी नई माँएँ पहले दो हफ़्तों में जल्दी रो पड़ती हैं या उदास रहती हैं। यह आम है और अक्सर अपने आप ठीक हो जाता है। अगर दो हफ़्ते से ज़्यादा वह दिन भर उदास रहे, बच्चे के सोने पर भी सो न पाए, या कहे कि उससे सँभल नहीं रहा, तो उसे मदद चाहिए। यह एक बीमारी है, कमज़ोरी नहीं, और इसका इलाज है। Tele-MANAS 14416 मुफ़्त है। अगर वह ख़ुद को या बच्चे को नुक़सान पहुँचाने की बात करे, तो अभी 112 पर कॉल करें।' } },
    { id: 'pmos', who: 'family_w_all', st: ['cycle', 'ttc'],
      h: { en: 'PMOS is nobody\'s fault', hi: 'PMOS किसी की ग़लती नहीं' },
      p: { en: 'PMOS (earlier called PCOS) is a common hormone condition. It can bring irregular periods, pimples, extra hair and weight gain, and getting pregnant can take longer. It isn\'t caused by anything she did, so please don\'t blame her. Regular meals, a daily walk and good sleep help a lot, and many women with PMOS have babies. Go with her to the doctor and share the work at home.',
        hi: 'PMOS (पहले इसे PCOS कहते थे) हॉर्मोन से जुड़ी एक आम समस्या है। इससे पीरियड अनियमित हो सकते हैं, मुँहासे, ज़्यादा बाल और वज़न बढ़ सकता है, और प्रेग्नेंट होने में ज़्यादा समय लग सकता है। यह उसकी किसी ग़लती से नहीं होता, इसलिए उसे दोष न दें। समय पर खाना, रोज़ टहलना और अच्छी नींद बहुत मदद करते हैं, और PMOS वाली बहुत सी औरतों के बच्चे होते हैं। डॉक्टर के पास उसके साथ जाएँ और घर के काम में हाथ बँटाएँ।' } },
    { id: 'iron', who: 'family_w_all', st: ['preg', 'post'],
      h: { en: 'Why her iron tablets matter', hi: 'आयरन की गोलियाँ क्यों ज़रूरी हैं' },
      p: { en: 'More than half of women in India are anaemic, usually because of low iron. It leaves them tired, breathless and pale, and in pregnancy it can harm both mother and baby. Iron tablets are free from the ASHA or a government hospital. Help her take them the way the ASHA or doctor says, with water or nimbu pani, not with tea or milk. Green leafy vegetables, chana, rajma, eggs or meat help too. Black stools are normal with iron tablets.',
        hi: 'भारत में आधी से ज़्यादा औरतों में ख़ून की कमी (एनीमिया) है, ज़्यादातर आयरन की कमी से। इससे थकान, साँस फूलना और चेहरा पीला पड़ना होता है, और प्रेग्नेंसी में यह माँ और बच्चे दोनों के लिए नुक़सानदेह हो सकता है। आयरन की गोलियाँ ASHA या सरकारी अस्पताल से मुफ़्त मिलती हैं। उसे गोलियाँ वैसे ही लेने में मदद करें जैसे ASHA या डॉक्टर बताएँ, पानी या नींबू पानी के साथ, चाय या दूध के साथ नहीं। हरी पत्तेदार सब्ज़ियाँ, चना, राजमा, अंडे या मीट भी मदद करते हैं। आयरन की गोली से मल काला होना आम है।', doc: { en: 'More than half of women in India are anaemic, usually because of low iron. It leaves them tired, breathless and pale, and in pregnancy it can harm both mother and baby. Her doctor can prescribe iron tablets; they are also free from the ASHA or a government hospital. Help her take them the way the doctor says, with water or nimbu pani, not with tea or milk. Green leafy vegetables, chana, rajma, eggs or meat help too. Black stools are normal with iron tablets.', hi: 'भारत में आधी से ज़्यादा औरतों में ख़ून की कमी (एनीमिया) है, ज़्यादातर आयरन की कमी से। इससे थकान, साँस फूलना और चेहरा पीला पड़ना होता है, और प्रेग्नेंसी में यह माँ और बच्चे दोनों के लिए नुक़सानदेह हो सकता है। डॉक्टर आयरन की गोलियाँ लिख सकती हैं; ये ASHA या सरकारी अस्पताल से मुफ़्त भी मिलती हैं। उसे गोलियाँ वैसे ही लेने में मदद करें जैसे डॉक्टर बताएँ, पानी या नींबू पानी के साथ, चाय या दूध के साथ नहीं। हरी पत्तेदार सब्ज़ियाँ, चना, राजमा, अंडे या मीट भी मदद करते हैं। आयरन की गोली से मल काला होना आम है।' } } },
    { id: 'checkups', who: 'family_w_all', st: ['preg'],
      h: { en: 'Pregnancy check-ups', hi: 'प्रेग्नेंसी की जाँचें' },
      get p() { const d = danger(); return { en: 'A pregnant woman needs at least four check-ups. They\'re free at government hospitals, PHCs and Ayushman Arogya Mandirs, and the ASHA can help her get there. Each visit checks her BP, weight, blood, urine and the baby\'s growth, so please go with her and help with the travel. ' + d.en,
        hi: 'प्रेग्नेंट औरत को कम से कम चार जाँचें करवानी चाहिए। ये सरकारी अस्पताल, PHC और आयुष्मान आरोग्य मंदिर में मुफ़्त होती हैं, और ASHA वहाँ पहुँचने में मदद कर सकती है। हर बार उसका BP, वज़न, ख़ून, पेशाब और बच्चे की बढ़त जाँची जाती है, इसलिए उसके साथ जाएँ और आने-जाने में मदद करें। ' + d.hi }; } },
    { id: 'meno', who: 'family_w_all', st: ['meno'],
      h: { en: 'Menopause: what she\'s going through', hi: 'मेनोपॉज़: वह किस दौर से गुज़र रही है' },
      p: { en: 'Somewhere between 45 and 55, a woman\'s periods stop for good. Around that time many women get hot flushes, night sweats, poor sleep, mood changes and aches. It\'s real and common, not drama, and it can last a few years. Keep her room cool, share the chores, and listen when she talks about it. A doctor can help if it gets hard. Any bleeding after her periods have stopped for a year needs a check-up.',
        hi: '45 से 55 साल के बीच कभी, औरत के पीरियड हमेशा के लिए बंद हो जाते हैं। उस समय के आसपास बहुत सी औरतों को हॉट फ़्लश, रात में पसीना, कम नींद, मूड बदलना और दर्द होते हैं। यह सच है और आम है, नाटक नहीं, और कुछ साल चल सकता है। उसका कमरा ठंडा रखें, काम बाँटें, और जब वह इस बारे में बात करे तो सुनें। मुश्किल हो तो डॉक्टर मदद कर सकते हैं। पीरियड एक साल बंद रहने के बाद कोई भी ब्लीडिंग हो, तो जाँच ज़रूरी है।' } },
    { id: 'ttc', who: 'family_w_husband', st: ['ttc'],
      h: { en: 'When a baby takes time', hi: 'जब बच्चा होने में समय लगे' },
      p: { en: 'Most couples take a few months to a year to get pregnant. When it takes longer, it\'s nobody\'s fault, and in many couples the man\'s health is part of the reason. After a year of trying (six months if she is 35 or older), you should both see a doctor. For you, a simple semen test is the first step.',
        hi: 'ज़्यादातर जोड़ों को प्रेग्नेंसी में कुछ महीनों से एक साल तक लगता है। ज़्यादा समय लगे तो यह किसी की ग़लती नहीं, और कई जोड़ों में आदमी की सेहत भी एक वजह होती है। एक साल कोशिश के बाद (अगर वह 35 या उससे ज़्यादा की है तो छह महीने बाद), आप दोनों डॉक्टर को दिखाएँ। आपके लिए पहला क़दम एक आसान सीमेन टेस्ट है।' } },
    { id: 'daughter', who: 'family_w_mother', st: [],
      h: { en: 'Talking to your daughter about periods', hi: 'बेटी से पीरियड की बात' },
      p: { en: 'Talk to her before it starts, around age 9 or 10, so it doesn\'t frighten her. Tell her it\'s normal and healthy. Show her how to use a pad or clean cloth, and to change it every 4 to 6 hours. She can go to school as usual. If her periods haven\'t started by 15, or they\'re very heavy or painful, take her to a doctor.',
        hi: 'पीरियड शुरू होने से पहले, लगभग 9 या 10 साल की उम्र में उससे बात करें, ताकि वह डरे नहीं। उसे बताएँ कि यह आम और स्वस्थ है। उसे पैड या साफ़ कपड़ा इस्तेमाल करना, और हर 4 से 6 घंटे में बदलना सिखाएँ। वह हमेशा की तरह स्कूल जा सकती है। अगर 15 साल तक पीरियड शुरू न हों, या बहुत ज़्यादा या बहुत दर्द वाले हों, तो उसे डॉक्टर के पास ले जाएँ।' } }
  ];
  /* Pregnancy: a card each week for her husband, with the baby's size, how he can help in this part of the pregnancy, and when
     to go to hospital at once. She sends it herself; nothing goes on its own. */
  const TRI = [
    [L('She may feel sick and very tired. Let her rest, keep dry snacks handy, and take over the cooking when smells bother her.', 'उन्हें जी मिचलाना और बहुत थकान हो सकती है। उन्हें आराम करने दें, सूखे स्नैक्स पास रखें, और खाने की गंध से परेशानी हो तो खाना आप बना दें।'),
      LD('Help her register the pregnancy and get the first check-up at the PHC. The ASHA can help.', 'प्रेग्नेंसी का रजिस्ट्रेशन और पहली जाँच PHC पर करवाने में मदद करें। ASHA मदद कर सकती है।', 'Help her get her first check-up with a gynaecologist early. Registering with the ASHA or at the PHC is free too.', 'जल्दी गायनेकोलॉजिस्ट से पहली जाँच करवाने में उसकी मदद करें। ASHA या PHC पर रजिस्ट्रेशन भी मुफ़्त है।'),
      L('Make sure she takes the tablets the doctor or ASHA gives, every day.', 'डॉक्टर या ASHA की दी हुई गोलियाँ वे रोज़ लें, यह ध्यान रखें।'),
      L('No smoking or alcohol near her.', 'उनके पास धूम्रपान या शराब नहीं।')],
    [L('Go with her to her check-ups. Each one checks her BP, blood and the baby’s growth.', 'उनकी जाँचों में साथ जाएँ। हर जाँच में BP, ख़ून और बच्चे की बढ़त देखी जाती है।'),
      L('Iron and calcium tablets every day, the way the doctor says.', 'आयरन और कैल्शियम की गोलियाँ रोज़, जैसे डॉक्टर बताएँ।'),
      L('Let her rest on her side, and do the heavy lifting yourself.', 'उन्हें करवट लेकर आराम करने दें, और भारी सामान आप उठाएँ।'),
      L('A little more food every day: one more meal or snack with dal, milk or curd, fruit and vegetables.', 'रोज़ थोड़ा ज़्यादा खाना: दाल, दूध या दही, फल और सब्ज़ी के साथ एक और खाना या नाश्ता।')],
    [L('Pack the hospital bag together and plan how you will reach the hospital, day or night. The 102 and 108 ambulances are free.', 'अस्पताल का बैग साथ मिलकर तैयार करें और दिन हो या रात, अस्पताल कैसे पहुँचेंगे, यह तय कर लें। 102 और 108 एम्बुलेंस मुफ़्त हैं।'),
      LD('Keep her MCP card and papers in one place.', 'उनका MCP कार्ड और काग़ज़ एक जगह रखें।', 'Keep her reports and papers in one place.', 'उनकी reports और काग़ज़ एक जगह रखें।'),
      L('Help her sleep: an extra pillow, fewer chores, a quiet room.', 'उन्हें सोने में मदद करें: एक और तकिया, कम काम, शांत कमरा।'),
      L('If the baby moves less than usual, take her to hospital the same day.', 'अगर बच्चा रोज़ से कम हिले, तो उसी दिन अस्पताल ले जाएँ।')]
  ];
  /* Version 39.7 (journey audit P3-15): the signs to go at once come from core's one list (Help and the husband's page read it) */
  function danger() {
    return S.dangerLine ? L('Take her to hospital at once for any of these: ' + S.dangerLine('preg', 'en') + '. If you cannot get there, call 112, 108 or 102.', 'इनमें से कुछ भी हो तो उन्हें तुरंत अस्पताल ले जाएँ: ' + S.dangerLine('preg', 'hi') + '। ख़ुद न पहुँच पाएँ तो 112, 108 या 102 पर कॉल करें।')
      : L('Take her to hospital at once for bleeding, a bad headache or blurred vision, a swollen face, fits, fever, or water leaking.', 'ब्लीडिंग, तेज़ सिरदर्द या धुंधला दिखना, चेहरे पर सूजन, दौरे, बुखार, या पानी जाना हो तो उन्हें तुरंत अस्पताल ले जाएँ।');
  }
  const pregWeek = () => { if (!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant())) return null; const pi = S.preg && S.preg.info ? S.preg.info() : null; return pi && pi.weeks != null ? pi.weeks : null; };
  function renderPartner(v) {
    const w = pregWeek(); const users = S.I.users.replace('<svg', '<svg style="width:18px;height:18px"');
    if (w == null) { v.innerHTML = S.backRow(t('family_pt_h'), 'family', false) + '<p class="small">' + esc(t('family_pt_none')) + '</p>' + (S.routeOwner('access-partner') ? '<button type="button" class="btn block" data-go="access-partner">' + esc(t('family_pt_page')) + '</button>' : ''); S.wire(v); return; }
    const tips = TRI[w < 14 ? 0 : (w < 28 ? 1 : 2)]; const sz = S.pregSize ? S.pregSize(w) : null;
    /* the first weeks have no week number worth saying ("Week 0"); past 42 weeks the card says hospital today, first */
    const head = w < 4 ? t('family_pt_early') : S.tf('family_pt_week', { n: w }); const pi = S.preg && S.preg.info ? S.preg.info() : null; const late = !!(pi && pi.days > 294);
    const text = (late ? t('family_pt_late') + '\n\n' : '') + head + (sz && sz.line ? ': ' + sz.line : '') + '\n\n' + t('family_pt_help') + '\n' + tips.map((x) => '- ' + tx(x)).join('\n') + '\n\n' + tx(danger()) + '\n\n' + t('family_from');
    v.innerHTML = S.backRow(t('family_pt_h'), 'family', false) + '<p class="small">' + esc(t('family_pt_p')) + '</p>' +
      '<div class="card fam-card" data-nofold="1"><span class="eyebrow">' + esc(t('family_w_husband')) + '</span>' + (late ? '<div class="flag urgent">' + esc(t('family_pt_late')) + '</div>' : '') + '<h3>' + esc(head) + '</h3>' + (sz && sz.line ? '<p>' + esc(sz.line) + '</p>' : '') +
      '<p><b>' + esc(t('family_pt_help')) + '</b></p><ul class="fam-tips">' + tips.map((x) => '<li>' + esc(tx(x)) + '</li>').join('') + '</ul><div class="flag urgent">' + esc(tx(danger())) + '</div>' +
      '<div class="row wrap"><button type="button" class="btn sm" data-fam-share="partner">' + users + ' ' + esc(t('family_send')) + '</button><button type="button" class="btn sm" id="fam-pt-copy">' + esc(t('family_copy')) + '</button></div></div>' +
      '<p class="small">' + esc(t('family_pt_safe')) + '</p>';
    S.wire(v);
    const sh = v.querySelector('[data-fam-share]'); if (sh) sh.addEventListener('click', () => { S.share(head, text); S.emit('share', { id: 'family-partner' }); });
    v.querySelector('#fam-pt-copy').addEventListener('click', () => { try { navigator.clipboard.writeText(text).then(() => S.toast(t('family_copied')), () => S.toast(t('family_copy_fail'))); } catch (e) { S.toast(t('family_copy_fail')); } });
  }
  const msg = (c) => tx(c.h) + '\n\n' + (c.items ? c.items.map((x) => '- ' + tx(x)).join('\n') : tx(c.p)) + '\n\n' + t('family_from');
  /* Version 39.7 (journey audit P3-18): the husband's page (access.js) as cards here */
  const partnerCards = () => (S.access && S.access.partner ? S.access.partner().map((p) => ({ id: p.id, who: 'family_w_husband', st: p.st, h: p.h, items: p.items })) : []);
  const allCards = () => C.concat(partnerCards());
  function order() {
    const k = S.stageNow ? S.stageNow() : 'cycle'; const pm = !!(S.state.situation || {}).pcos || (S.state.goals || []).indexOf('pmos') >= 0;
    const score = (c) => (c.st.indexOf(k) >= 0 ? 2 : 0) + (c.id === 'pmos' && pm ? 3 : 0);
    return allCards().map((c, i) => ({ c: c, i: i, n: score(c) })).sort((a, b) => b.n - a.n || a.i - b.i).map((x) => Object.assign({ mine: x.n > 0 }, x.c));
  }
  const cardHtml = (c) => '<div class="card fam-card" data-nofold="1" data-fam="' + c.id + '"><span class="eyebrow">' + esc(t(c.who)) + '</span><h3>' + esc(tx(c.h)) + '</h3>' + (c.items ? '<ul class="fam-tips">' + c.items.map((x) => '<li>' + esc(tx(x)) + '</li>').join('') + '</ul>' : '<p>' + esc(tx(c.p)) + '</p>') +
    '<div class="row wrap"><button type="button" class="btn sm" data-fam-share="' + c.id + '">' + S.I.users.replace('<svg', '<svg style="width:18px;height:18px"') + ' ' + esc(t('family_send')) + '</button>' +
    '<button type="button" class="btn sm" data-fam-copy="' + c.id + '">' + esc(t('family_copy')) + '</button>' + (c.id === 'ttc' && S.routeOwner('ttc-partner') ? '<button type="button" class="linkbtn" data-go="ttc-partner">' + esc(t('family_ttc_page')) + '</button>' : '') + '</div></div>';
  function render(v) {
    const pw = pregWeek();
    v.innerHTML = S.backRow(t('family_h'), 'care', false) + '<p class="small">' + esc(t('family_p')) + '</p>' +
      (pw != null ? '<button type="button" class="action fam-pt" data-go="family-partner"><span class="ico hue hue-sky">' + S.I.baby + '</span><span class="body"><strong>' + esc(t('family_pt_card')) + '</strong><span class="small">' + esc(S.tf('family_pt_week', { n: pw })) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' : '') +
      ((cs) => cs.filter((c) => c.mine).map(cardHtml).join('') + (cs.some((c) => !c.mine) ? '<details class="fam-more"><summary class="linkbtn">' + esc(S.tf('family_more', { n: cs.filter((c) => !c.mine).length })) + '</summary><div class="stack">' + cs.filter((c) => !c.mine).map(cardHtml).join('') + '</div></details>' : ''))(order()) +
      '<p class="footnote">' + esc(t('family_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-fam-share]').forEach((a) => a.addEventListener('click', () => { const c = allCards().find((x) => x.id === a.dataset.famShare); if (c) S.share(tx(c.h), msg(c)); S.emit('share', { id: 'family-' + a.dataset.famShare }); }));
    v.querySelectorAll('[data-fam-copy]').forEach((b) => b.addEventListener('click', () => {
      const c = allCards().find((x) => x.id === b.dataset.famCopy); const text = msg(c);
      const ok = () => S.toast(t('family_copied')); const no = () => S.toast(t('family_copy_fail'));
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, no); else no(); } catch (e) { no(); }
    }));
  }

  S.register({
    id: 'family',
    demoPersona: 'sunita',
    strings: {
      en: {
        family_h: 'For my family', family_tile_s: 'Short cards to send your husband, mother-in-law or daughter', family_more: 'More cards ({n})', family_ttc_page: 'His page: the semen test and what helps',
        family_p: 'Send a card to someone at home, so they understand and can help. Nothing about you or your diary goes in it.',
        family_send: 'Share', family_copy: 'Copy', family_copied: 'Copied. Paste it in any chat.', family_copy_fail: 'Could not copy on this phone.',
        family_from: 'From Qura Sakhi, a free health app for women.', family_foot: 'General information, the same for everyone. Not a diagnosis.',
        family_w_all: 'For the family', family_w_husband: 'For your husband', family_w_mother: 'For a mother',
        family_pt_h: 'Weekly update for your husband', family_pt_card: 'This week’s update for your husband', family_pt_p: 'Each week, a short card about the baby and how he can help. Send it if you want to; nothing goes by itself.', family_pt_week: 'Week {n} of the pregnancy', family_pt_early: 'The first weeks of the pregnancy', family_pt_late: 'She is more than 42 weeks pregnant by her dates. If the baby has not come, take her to the hospital today.', family_pt_help: 'How you can help this week:', family_pt_none: 'This weekly card is for pregnancy. For now, here is a page your husband can read.', family_pt_page: 'A page for your husband', family_pt_safe: 'Only you decide what to send. Sakhi never sends anything by itself.'
      },
      hi: {
        family_h: 'मेरे परिवार के लिए', family_tile_s: 'पति, सास या बेटी को भेजने के लिए छोटे कार्ड', family_more: 'और कार्ड ({n})', family_ttc_page: 'उनका पन्ना: semen test और क्या मदद करता है',
        family_p: 'घर में किसी को कार्ड भेजें, ताकि वे समझें और मदद कर सकें। इसमें आपके या आपकी डायरी के बारे में कुछ नहीं जाता।',
        family_send: 'शेयर करें', family_copy: 'कॉपी करें', family_copied: 'कॉपी हो गया। किसी भी चैट में पेस्ट करें।', family_copy_fail: 'इस फ़ोन पर कॉपी नहीं हो सका।',
        family_from: 'Qura Sakhi से, महिलाओं के लिए मुफ़्त हेल्थ ऐप।', family_foot: 'सबके लिए एक जैसी आम जानकारी। यह जाँच का नतीजा नहीं है।',
        family_w_all: 'परिवार के लिए', family_w_husband: 'पति के लिए', family_w_mother: 'माँ के लिए',
        family_pt_h: 'पति के लिए हर हफ़्ते की जानकारी', family_pt_card: 'पति के लिए इस हफ़्ते की जानकारी', family_pt_p: 'हर हफ़्ते बच्चे के बारे में और वे कैसे मदद कर सकते हैं, इस पर एक छोटा कार्ड। चाहें तो भेजें; कुछ भी अपने आप नहीं जाता।', family_pt_week: 'प्रेग्नेंसी का हफ़्ता {n}', family_pt_early: 'प्रेग्नेंसी के शुरुआती हफ़्ते', family_pt_late: 'उनकी तारीख़ों से 42 हफ़्ते से ज़्यादा हो गए हैं। अगर बच्चा नहीं हुआ है, तो आज ही उन्हें अस्पताल ले जाएँ।', family_pt_help: 'इस हफ़्ते आप कैसे मदद कर सकते हैं:', family_pt_none: 'यह हफ़्तावार कार्ड प्रेग्नेंसी के लिए है। अभी के लिए, यह पन्ना आपके पति पढ़ सकते हैं।', family_pt_page: 'आपके पति के लिए एक पन्ना', family_pt_safe: 'क्या भेजना है, यह सिर्फ़ आप तय करती हैं। Sakhi अपने आप कुछ नहीं भेजती।'
      }
    },
    routes: { family: render, 'family-partner': renderPartner },
    open: ['family', 'family-partner'],
    tiles: [{ section: 'tools', route: 'family', title: 'family_h', sub: 'family_tile_s', icon: 'users', order: 6, keywords: 'family husband pati saas mother in law beti daughter explain samjhana whatsapp share bhejna' }],
    css: '.fam-card p { color: var(--fg); } .fam-card .row { margin-top: 2px; } .fam-tips { margin: 0; padding-left: 18px; display: grid; gap: 4px; color: var(--fg); }'
  });
})(window.Saathi);
