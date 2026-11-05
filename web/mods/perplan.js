/* My period plan's chapters (Version 39.55; Mohit, 2 Nov: "proceed building with your recommendations"; advice
   docs/period-plan-advice-2026-11-02.md; canvas claude.ai/artifact/9YbP1fyNWG8gN5gF41c7vS).
   Twelve short chapters for each goal that can lead her plan (web/progs/v1.js, pain, heavy and pms version 2), one a week, from
   the 24 Oct design (docs/plans-design-and-build-2026-10-24-programmes.md, sections 1 to 3):
   - period pain (p1 to p12): moving between periods, relaxation and warmth;
   - heavy periods (h1 to h12): her Hb, iron food, rest, and the treatments a gynaecologist gives;
   - the days before her period (m1 to m12): a 2-cycle diary and skills from CBT (RCOG GTG 48).
   No medicine names or doses, no promises, and only a doctor names a cause. Every line waits for the doctor (review 19.55), the
   days-before chapters for a psychologist too. mods/plan.js chooses the week's chapter (S.plan.period.lesson()). */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const N2 = (en, hi) => ({ en: en, hi: hi });
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));

  /* Browse mode keeps what she read in memory for this visit only */
  let temp = { owner: null, d: {} };
  const store = () => { if (S.canSave()) return S.data('perplan'); if (temp.owner !== S.state) temp = { owner: S.state, d: {} }; return temp.d; };
  const persist = () => { if (S.canSave()) S.save(); };

  const TRY = N2('Try this week', 'इस हफ़्ते आज़माएँ');
  const GOAL = { p: N2('Period pain', 'पीरियड का दर्द'), h: N2('Heavy periods', 'ज़्यादा ब्लीडिंग'), m: N2('The days before your period', 'पीरियड से पहले के दिन') };
  const WHY = {
    p: N2('Regular movement, relaxation and warmth are what studies and doctors suggest for period pain, beside any medicine a doctor advises. Many women notice a difference over 2 to 3 periods.',
      'नियमित हरकत, सुकून और गर्माहट वही हैं जो अध्ययन और डॉक्टर पीरियड के दर्द के लिए सुझाते हैं, डॉक्टर की बताई किसी दवा के साथ। कई महिलाओं को 2 से 3 पीरियड में फ़र्क़ दिखता है।'),
    h: N2('Knowing your Hb, iron food every day and rest on heavy days are the first steps for heavy periods. A gynaecologist can treat the bleeding itself.',
      'अपना Hb जानना, रोज़ आयरन वाला खाना और ज़्यादा ब्लीडिंग वाले दिनों में आराम, ज़्यादा ब्लीडिंग के पहले कदम हैं। ब्लीडिंग का इलाज स्त्री रोग विशेषज्ञ कर सकती हैं।'),
    m: N2('Noting your days for 2 cycles, and skills from CBT (a way of working with thoughts and habits), are what UK gynaecologists (RCOG) recommend first for the days before a period, with regular exercise.',
      '2 चक्र तक अपने दिन नोट करना, और CBT (सोच और आदतों पर काम करने का एक तरीक़ा) के अभ्यास, वही हैं जो ब्रिटेन के स्त्री रोग विशेषज्ञ (RCOG) पीरियड से पहले के दिनों के लिए सबसे पहले सुझाते हैं, नियमित व्यायाम के साथ।')
  };
  const U181 = { u: N2('If someone at home hurts or scares you, help is there: call 181, free, any time. In danger right now, call 112.', 'अगर घर में कोई आपको चोट पहुँचाता है या डराता है, तो मदद है: 181 पर फ़ोन करें, मुफ़्त, किसी भी समय। अभी ख़तरा हो, तो 112 पर फ़ोन करें।'), tel: ['181', '112'] };
  const UHARM = { u: N2('Thoughts of harming yourself? Call Tele-MANAS on 14416: free, any time. In danger right now, call 112.', 'ख़ुद को नुक़सान पहुँचाने के ख़याल आते हैं? Tele-MANAS को 14416 पर फ़ोन करें: मुफ़्त, किसी भी समय। अभी ख़तरा हो, तो 112 पर फ़ोन करें।'), tel: ['14416', '112'] };
  const QURA = N2('On a free call, a Qura doctor goes through your periods and your diary with you, can order tests, and refers you to a gynaecologist when you need medicines.',
    'मुफ़्त कॉल पर Qura डॉक्टर आपके साथ आपके पीरियड और डायरी देखती हैं, जाँच लिखवा सकती हैं, और दवाओं की ज़रूरत हो तो स्त्री रोग विशेषज्ञ के पास भेजती हैं।');
  /* a chapter: h its title, cards: l lines, b a heading, go a page it opens (gol its label: a string key, '@tile' or words), ask a
     Qura doctor button, u an urgent line with its Call numbers (tel), warn a "see a doctor" card */
  const L = {
    p1: { h: N2('Why periods hurt', 'पीरियड में दर्द क्यों होता है'), cards: [
      { l: [N2('During your period, your womb squeezes to let its lining out. Natural chemicals in your body cause the squeezing, and the pain is real.', 'पीरियड में गर्भाशय अपनी परत बाहर निकालने के लिए सिकुड़ता है। यह सिकुड़न शरीर के अपने रसायनों से होती है, और दर्द सच्चा है।')] },
      { l: [N2('Warmth, slow breathing and gentle movement can calm pain signals. Many women find it takes a few periods to notice the difference.', 'गर्माहट, धीमी साँस और हल्की हरकत दर्द के संकेतों को शांत कर सकती हैं। कई महिलाओं को फ़र्क़ दिखने में कुछ पीरियड लगते हैं।')] },
      { b: TRY, l: [N2('Relax for 5 minutes on most days with Dr. Megha’s slow breaths, not only on pain days.', 'ज़्यादातर दिन डॉ. मेघा की धीमी साँसों के साथ 5 मिनट आराम करें, सिर्फ़ दर्द वाले दिनों में नहीं।')], go: 'calm-breaths', gol: 'calm_breaths' }] },
    p2: { h: N2('Your period-week kit', 'पीरियड वाले हफ़्ते की किट'), cards: [
      { l: [N2('Warmth: a hot water bag or bottle with hot, not boiling, water. Check it doesn’t leak, wrap it in a cloth, check your skin every few minutes, and never sleep on it.', 'गर्माहट: गर्म पानी की थैली या बोतल, गर्म पर खौलता नहीं पानी। देख लें कि रिसती न हो, कपड़े में लपेटें, हर कुछ मिनट में त्वचा देखें, और उस पर कभी न सोएँ।')] },
      { l: [N2('A rest position: lying on your side with your knees bent, or on your back with your knees drawn to your chest.', 'आराम की मुद्रा: करवट लेकर घुटने मोड़कर लेटना, या पीठ के बल लेटकर घुटने छाती की ओर लाना।')] },
      { b: TRY, l: [N2('Choose your kit for this month: warmth, the 3-minute cramps routine and a rest position. Keep them ready.', 'इस महीने की अपनी किट चुनें: गर्माहट, ऐंठन के लिए 3 मिनट की दिनचर्या और आराम की एक मुद्रा। इन्हें तैयार रखें।')], go: 'relief-cramps', gol: 'relief_cramps_t' }] },
    p3: { h: N2('Is my pain the usual kind?', 'क्या मेरा दर्द आम दर्द है?'), cards: [
      { l: [N2('Usual period pain starts with your period or a day before, and eases within about 3 days.', 'आम पीरियड का दर्द पीरियड के साथ या एक दिन पहले शुरू होता है, और लगभग 3 दिन में कम हो जाता है।')] },
      { warn: true, b: N2('See a doctor if', 'डॉक्टर को दिखाएँ अगर'), l: [N2('The pain stops your day, keeps getting worse, started after years of easy periods, or comes with pain during sex, bleeding between periods, a fever or unusual discharge.', 'दर्द से आपके दिन का काम रुकता है, बढ़ता जा रहा है, बरसों के आसान पीरियड के बाद शुरू हुआ, या इसके साथ संबंध के समय दर्द, पीरियड के बीच ब्लीडिंग, बुख़ार या असामान्य स्राव है।')], ask: true },
      { u: N2('Severe pain on one side with a late period or a positive test, or fainting: call 112 now.', 'देर से आए पीरियड या पॉज़िटिव टेस्ट के साथ एक तरफ़ तेज़ दर्द, या बेहोशी: अभी 112 पर फ़ोन करें।'), tel: ['112'] },
      { b: TRY, l: [N2('Each period day, answer “Pain today?” in your check-in. Your answers become your record for a doctor.', 'पीरियड के हर दिन, अपनी शाम की जाँच में “आज दर्द है?” का जवाब दें। आपके जवाब डॉक्टर के लिए आपका रिकॉर्ड बनते हैं।')] }] },
    p4: { h: N2('Moving on the days in between', 'बीच के दिनों में हरकत'), cards: [
      { l: [N2('Regular movement on the days between your periods can make periods less painful over time. Any movement counts.', 'पीरियड के बीच के दिनों में नियमित हरकत समय के साथ पीरियड का दर्द कम कर सकती है। हर तरह की हरकत गिनी जाती है।')] },
      { l: [N2('A good pace: you can talk, but not sing.', 'सही रफ़्तार: आप बात कर सकें, पर गा न सकें।')] },
      { b: TRY, l: [N2('Pick your 3 days to move this week, and keep them.', 'इस हफ़्ते हरकत के अपने 3 दिन चुनें, और उन्हें निभाएँ।')] }] },
    p5: { h: N2('A strong body', 'मज़बूत शरीर'), cards: [
      { l: [N2('Strength work twice a week helps your whole body, your back and belly too.', 'हफ़्ते में दो बार ताक़त के व्यायाम पूरे शरीर की मदद करते हैं, पीठ और पेट की भी।')] },
      { l: [N2('Strength at home needs no equipment: a chair, a wall and about 10 minutes.', 'घर पर ताक़त के लिए कोई सामान नहीं चाहिए: एक कुर्सी, एक दीवार और लगभग 10 मिनट।')] },
      { b: TRY, l: [N2('Do Strength at home on 2 of your moving days.', 'हरकत के अपने 2 दिनों में घर पर ताक़त करें।')], go: 'plan-r-strength', gol: 'plan_r_strength' }] },
    p6: { h: N2('Medicines: ask, don’t guess', 'दवा: पूछें, अंदाज़ा न लगाएँ'), cards: [
      { l: [N2('Ask a doctor or chemist which painkiller suits you and when to take it. Never take someone else’s.', 'डॉक्टर या केमिस्ट से पूछें कि कौन-सी दर्द की दवा आपके लिए ठीक है और कब लें। किसी और की दवा कभी न लें।')] },
      { warn: true, b: N2('Ask a doctor first', 'पहले डॉक्टर से पूछें'), l: [N2('If you have a stomach ulcer, asthma, kidney, liver or heart disease, or could be pregnant. After a painkiller, black stools or vomiting blood: go to a hospital now.', 'अगर आपको पेट का अल्सर, दमा, गुर्दे, लिवर या दिल की बीमारी है, या आप गर्भवती हो सकती हैं। दर्द की दवा के बाद काला मल या ख़ून की उल्टी: अभी अस्पताल जाएँ।')] },
      { b: TRY, l: [N2('If you take a painkiller on a period day, tap “Needed a painkiller” in “Pain today?”.', 'पीरियड के दिन दर्द की दवा लें, तो “आज दर्द है?” में “दर्द की गोली लेनी पड़ी” पर टैप करें।')] }] },
    p7: { h: N2('Pain days at college or work', 'कॉलेज या काम पर दर्द वाले दिन'), cards: [
      { l: [N2('On a pain day, it’s fine to ask for a short rest or a quiet place.', 'दर्द वाले दिन थोड़ा आराम या कोई शांत जगह माँगना ठीक है।')] },
      { l: [N2('A breath you can do sitting: in for 4, out for 6, five times.', 'बैठे-बैठे की जाने वाली साँस: 4 तक अंदर, 6 तक बाहर, पाँच बार।')] },
      { b: TRY, l: [N2('Keep a small kit in your bag: a spare pad or cloth, water, and your slow breath.', 'अपने बैग में एक छोटी किट रखें: एक अतिरिक्त पैड या कपड़ा, पानी, और अपनी धीमी साँस।')] }] },
    p8: { h: N2('Telling your family', 'परिवार को बताना'), cards: [
      { l: [N2('Period pain is common and real. Telling someone at home what helps you, rest, warmth or a hand with the work, can make the hard days lighter.', 'पीरियड का दर्द आम और सच्चा है। घर में किसी को बताना कि आपको क्या मदद करता है, आराम, गर्माहट या काम में हाथ बँटाना, मुश्किल दिनों को हल्का कर सकता है।')] },
      U181,
      { b: TRY, l: [N2('Tell one person at home what helps you on a pain day.', 'घर में एक व्यक्ति को बताएँ कि दर्द वाले दिन आपको क्या मदद करता है।')] }] },
    p9: { h: N2('What helped you?', 'आपको किससे मदद मिली?'), cards: [
      { l: [N2('Look back at your last periods: what helped most? Warmth, the cramps routine, rest, or moving between periods?', 'अपने पिछले पीरियड देखें: सबसे ज़्यादा किससे मदद मिली? गर्माहट, ऐंठन वाली दिनचर्या, आराम, या पीरियड के बीच हरकत?')] },
      { b: TRY, l: [N2('Keep the 2 things that helped you most, and start them at the first sign of your period.', 'जिन 2 चीज़ों से सबसे ज़्यादा मदद मिली, उन्हें रखें, और पीरियड का पहला संकेत मिलते ही शुरू करें।')] }] },
    p10: { h: N2('Calm evenings before your period', 'पीरियड से पहले शांत शामें'), cards: [
      { l: [N2('A tired body feels pain more. In the days before your period, an earlier night and a calm last hour help.', 'थका शरीर दर्द ज़्यादा महसूस करता है। पीरियड से पहले के दिनों में जल्दी सोना और सोने से पहले का शांत घंटा मदद करते हैं।')] },
      { b: TRY, l: [N2('In the week before your period, wind down at bedtime with yoga nidra.', 'पीरियड से पहले के हफ़्ते में, सोने से पहले योग निद्रा के साथ सुकून लें।')], go: 'calm-nidra', gol: 'calm_nidra' }] },
    p11: { h: N2('What a doctor checks', 'डॉक्टर क्या जाँचती हैं'), cards: [
      { l: [N2('A doctor asks about your periods and your pain, may examine you, and may suggest an ultrasound scan.', 'डॉक्टर आपके पीरियड और दर्द के बारे में पूछती हैं, जाँच कर सकती हैं, और अल्ट्रासाउंड की सलाह दे सकती हैं।')] },
      { l: [N2('Only a doctor can name a cause, such as endometriosis, adenomyosis or fibroids, and treat it.', 'सिर्फ़ डॉक्टर ही कारण बता सकती हैं, जैसे endometriosis, adenomyosis या fibroids, और उसका इलाज कर सकती हैं।')] },
      { l: [QURA], ask: true },
      { b: TRY, l: [N2('Take your pain record from Sakhi to your doctor.', 'Sakhi से अपना दर्द का रिकॉर्ड डॉक्टर के पास ले जाएँ।')] }] },
    h1: { h: N2('Is my bleeding heavy?', 'क्या मेरी ब्लीडिंग ज़्यादा है?'), cards: [
      { l: [N2('Heavy bleeding is judged by your life: changing at night, leaking through clothes, staying home, or feeling tired.', 'ज़्यादा ब्लीडिंग आपकी ज़िंदगी से पहचानी जाती है: रात में बदलना, कपड़ों तक निकल जाना, घर पर रुकना, या थकान।')] },
      { u: N2('Soaking a pad or cloth every hour for 2 hours or more, or bleeding with dizziness or fainting: call 112 now.', 'हर घंटे पैड या कपड़ा भीगना, 2 घंटे या ज़्यादा तक, या ब्लीडिंग के साथ चक्कर या बेहोशी: अभी 112 पर फ़ोन करें।'), tel: ['112'] },
      { b: TRY, l: [N2('On each period day, answer “Your period today” in your check-in: 3 taps.', 'पीरियड के हर दिन, अपनी शाम की जाँच में “आज आपका पीरियड” का जवाब दें: 3 टैप।')] }] },
    h2: { h: N2('Your Hb test', 'आपका Hb टेस्ट'), cards: [
      { l: [N2('Heavy periods can use up your iron and lower your haemoglobin (Hb). Low Hb makes you tired and breathless.', 'ज़्यादा ब्लीडिंग से शरीर का आयरन घट सकता है और हीमोग्लोबिन (Hb) कम हो सकता है। Hb कम हो, तो थकान और साँस फूलना होता है।')] },
      { l: [N2('An Hb test is a small blood test. Ask a Qura doctor or your own doctor; it is free at government health centres.', 'Hb टेस्ट एक छोटी-सी ख़ून की जाँच है। Qura डॉक्टर या अपनी डॉक्टर से पूछें; सरकारी स्वास्थ्य केंद्रों पर यह मुफ़्त है।')], ask: true },
      { b: TRY, l: [N2('Get your Hb tested this week or next, and add your result in Sakhi.', 'इस हफ़्ते या अगले हफ़्ते अपना Hb टेस्ट करवाएँ, और नतीजा Sakhi में जोड़ें।')], go: 'cond-anaemia', gol: '@tile' }] },
    h3: { h: N2('Food helps, tablets treat', 'खाना मदद करता है, गोलियाँ इलाज करती हैं'), cards: [
      { l: [N2('Iron foods every day: dal, rajma, chana, green leafy vegetables, ragi and jaggery, and eggs, fish or meat if you eat them.', 'रोज़ आयरन वाला खाना: दाल, राजमा, चना, हरी पत्तेदार सब्ज़ियाँ, रागी और गुड़, और अंडा, मछली या मांस अगर आप खाती हैं।')] },
      { l: [N2('Keep tea and coffee an hour away from your meals and from an iron tablet. They make iron harder to take in.', 'चाय और कॉफ़ी को खाने से और आयरन की गोली से एक घंटा दूर रखें। ये आयरन को शरीर में जाने से रोकती हैं।')] },
      { l: [N2('Food keeps your iron up. If your Hb is low, your doctor may give you tablets that treat it.', 'खाना आयरन बनाए रखता है। Hb कम हो, तो डॉक्टर इलाज के लिए गोलियाँ दे सकती हैं।')] },
      { b: TRY, l: [N2('Have today’s iron food from your plan every day this week.', 'इस हफ़्ते हर दिन अपने प्लान का आज का आयरन वाला खाना लें।')] }] },
    h4: { h: N2('What the doctor checks', 'डॉक्टर क्या जाँचती हैं'), cards: [
      { l: [N2('A doctor asks about your periods, checks your Hb, and sometimes your iron stores or thyroid. A scan can look for causes.', 'डॉक्टर आपके पीरियड के बारे में पूछती हैं, Hb जाँचती हैं, और कभी-कभी आयरन का भंडार या थायरॉइड। स्कैन से कारण देखा जा सकता है।')] },
      { l: [N2('Periods can be heavier in the first months after a Copper-T. Tell your doctor.', 'Copper-T लगने के बाद शुरुआती महीनों में पीरियड ज़्यादा हो सकते हैं। अपनी डॉक्टर को बताएँ।')] },
      { l: [QURA], ask: true },
      { b: TRY, l: [N2('Take your period notes from Sakhi to your doctor.', 'Sakhi से अपने पीरियड के नोट डॉक्टर के पास ले जाएँ।')] }] },
    h5: { h: N2('Iron tablets, if your doctor gives them', 'आयरन की गोलियाँ, अगर डॉक्टर दें'), cards: [
      { l: [N2('Take them the way your doctor says: every day, every other day or once a week.', 'इन्हें वैसे लें जैसे डॉक्टर कहें: रोज़, एक दिन छोड़कर, या हफ़्ते में एक बार।')] },
      { l: [N2('An upset stomach is common at first. Taking the tablet at bedtime can help. Tell your doctor instead of stopping.', 'शुरुआत में पेट ख़राब होना आम है। सोते समय गोली लेने से मदद मिल सकती है। गोली बंद करने के बजाय डॉक्टर को बताएँ।')] },
      { b: TRY, l: [N2('Tick your tablet in Sakhi on the days you take it.', 'जिन दिनों गोली लें, Sakhi में टिक करें।')], go: 'iron', gol: '@tile' }] },
    h6: { h: N2('Managing a heavy day', 'ज़्यादा ब्लीडिंग वाला दिन संभालना'), cards: [
      { l: [N2('On your heaviest days: a night pad or a thicker folded cloth, and an old sheet on your bed.', 'सबसे ज़्यादा ब्लीडिंग वाले दिनों में: रात वाला पैड या मोटा मोड़ा हुआ कपड़ा, और बिस्तर पर एक पुरानी चादर।')] },
      { l: [N2('Carry a spare pad or cloth and a small bag when you go out.', 'बाहर जाएँ तो एक अतिरिक्त पैड या कपड़ा और एक छोटा थैला साथ रखें।')] },
      { b: TRY, l: [N2('Get your heavy-day things ready before your period comes.', 'पीरियड आने से पहले ज़्यादा ब्लीडिंग वाले दिन की चीज़ें तैयार रखें।')] }] },
    h7: { h: N2('Energy and moving with low Hb', 'कम Hb में ताक़त और हरकत'), cards: [
      { l: [N2('Tiredness from low Hb is real. Move gently, and stand up slowly.', 'कम Hb की थकान सच्ची है। धीरे-धीरे हरकत करें, और धीरे से उठें।')] },
      { warn: true, b: N2('Stop and rest', 'रुकें और आराम करें'), l: [N2('If you feel dizzy, breathless or your heart races. Chest pain or fainting: call 112 now.', 'अगर चक्कर आए, साँस फूले या दिल तेज़ धड़के। सीने में दर्द या बेहोशी: अभी 112 पर फ़ोन करें।')] },
      { b: TRY, l: [N2('Walk gently on your 3 days, and rest lying down on your heaviest days.', 'अपने 3 दिनों में धीरे टहलें, और सबसे ज़्यादा ब्लीडिंग वाले दिनों में लेटकर आराम करें।')] }] },
    h9: { h: N2('Other reasons Hb gets low', 'Hb कम होने के और कारण'), cards: [
      { l: [N2('Low Hb has other causes too: worms, too little vitamin B12 or folate, or a blood condition that runs in families. Iron can’t fix all of them.', 'Hb कम होने के और कारण भी हैं: पेट के कीड़े, विटामिन B12 या फ़ोलेट की कमी, या परिवार में चलने वाली ख़ून की कोई बीमारी। आयरन इन सबको ठीक नहीं कर सकता।')] },
      { l: [N2('If your Hb stays low after treatment, your doctor will look further.', 'इलाज के बाद भी Hb कम रहे, तो डॉक्टर आगे जाँच करेंगी।')] },
      { b: TRY, l: [N2('Ask your doctor whether you need a tablet for worms.', 'अपनी डॉक्टर से पूछें कि क्या आपको कीड़ों की गोली चाहिए।')] }] },
    h10: { h: N2('Heavy periods can be treated', 'ज़्यादा ब्लीडिंग का इलाज हो सकता है'), cards: [
      { l: [N2('A gynaecologist can treat heavy bleeding with tablets that reduce bleeding, hormone treatment or a procedure, depending on the cause.', 'स्त्री रोग विशेषज्ञ कारण के हिसाब से ब्लीडिंग कम करने वाली गोलियों, हॉर्मोन वाले इलाज या किसी प्रक्रिया से ज़्यादा ब्लीडिंग का इलाज कर सकती हैं।')] },
      { l: [N2('Told you need an operation? Ask why, what else could help, and get a second opinion. Ask about your Hb first.', 'ऑपरेशन बताया गया है? पूछें क्यों, और क्या मदद कर सकता है, और दूसरी राय लें। पहले अपने Hb के बारे में पूछें।')] },
      { b: TRY, l: [N2('Write down your questions for your doctor.', 'डॉक्टर के लिए अपने सवाल लिख लें।')], ask: true }] },
    h11: { h: N2('The repeat test', 'दोबारा टेस्ट'), cards: [
      { l: [N2('If you were treated for low Hb, a repeat test shows whether the treatment is working. Many doctors check after about a month, and again later.', 'कम Hb का इलाज हुआ हो, तो दोबारा टेस्ट से पता चलता है कि इलाज काम कर रहा है या नहीं। कई डॉक्टर लगभग एक महीने बाद, और फिर बाद में जाँचती हैं।')] },
      { b: TRY, l: [N2('Ask your doctor when to repeat your Hb test, and add the result in Sakhi.', 'अपनी डॉक्टर से पूछें कि Hb टेस्ट दोबारा कब करवाना है, और नतीजा Sakhi में जोड़ें।')], go: 'cond-anaemia', gol: '@tile' }] },
    m1: { h: N2('Is it PMS? Your month, mapped', 'क्या यह PMS है? आपका महीना, नक़्शे पर'), cards: [
      { l: [N2('PMS means changes in your mood or body in the days before your period that ease once bleeding starts.', 'PMS का मतलब है पीरियड से पहले के दिनों में मन या शरीर के बदलाव, जो ब्लीडिंग शुरू होते ही कम हो जाते हैं।')] },
      { l: [N2('Noting how you feel each day, the good days too, for 2 cycles shows whether your hard days follow your cycle.', '2 चक्र तक हर दिन नोट करना कि आप कैसा महसूस करती हैं, अच्छे दिन भी, दिखाता है कि आपके मुश्किल दिन आपके चक्र के साथ आते हैं या नहीं।')] },
      UHARM,
      { b: TRY, l: [N2('Each evening, tap how you feel in your check-in, even on good days.', 'हर शाम अपनी जाँच में टैप करें कि आप कैसा महसूस करती हैं, अच्छे दिनों में भी।')] }] },
    m3: { h: N2('Stress makes the hard days louder', 'तनाव मुश्किल दिनों को और भारी बनाता है'), cards: [
      { l: [N2('Stress and too little sleep make the days before your period harder.', 'तनाव और कम नींद पीरियड से पहले के दिनों को और मुश्किल बनाते हैं।')] },
      { l: [N2('Calm breath every day, not only on hard days, lowers stress over time.', 'रोज़ शांत साँस, सिर्फ़ मुश्किल दिनों में नहीं, समय के साथ तनाव कम करती है।')] },
      { b: TRY, l: [N2('Do Calm breath every day this week.', 'इस हफ़्ते हर दिन शांत साँस करें।')], go: 'plan-r-calm', gol: 'plan_r_calm' }] },
    m4: { h: N2('Moving, gently', 'हल्की हरकत'), cards: [
      { l: [N2('Regular movement can ease the days before a period. Any movement counts.', 'नियमित हरकत पीरियड से पहले के दिनों को आसान बना सकती है। हर तरह की हरकत गिनी जाती है।')] },
      { l: [N2('On a hard day, a short or gentle walk still counts.', 'मुश्किल दिन में छोटी या हल्की सैर भी गिनी जाती है।')] },
      { b: TRY, l: [N2('Keep your 3 moving days, lighter in your calm week.', 'हरकत के अपने 3 दिन निभाएँ, शांत हफ़्ते में हल्के।')] }] },
    m5: { h: N2('Catch the thought', 'सोच को पकड़ें'), cards: [
      { l: [N2('Hard-day thoughts can be harsh: “Everyone is against me.” “I always ruin things.”', 'मुश्किल दिनों की सोच कठोर हो सकती है: “सब मेरे ख़िलाफ़ हैं।” “मैं हमेशा सब बिगाड़ देती हूँ।”')] },
      { l: [N2('Ask yourself: is this the hard days talking? What would I tell a friend who thought this?', 'ख़ुद से पूछें: क्या यह मुश्किल दिन बोल रहे हैं? अगर मेरी सहेली ऐसा सोचती, तो मैं उससे क्या कहती?')] },
      { b: TRY, l: [N2('When a harsh thought comes, say or write a kinder one beside it.', 'जब कठोर सोच आए, तो उसके साथ एक नरम सोच बोलें या लिखें।')] }] },
    m6: { h: N2('People around you', 'आपके आसपास के लोग'), cards: [
      { l: [N2('Only if it feels safe: tell one person how the days before your period feel, and ask for one thing that helps.', 'सिर्फ़ अगर सुरक्षित लगे: एक व्यक्ति को बताएँ कि पीरियड से पहले के दिन कैसे लगते हैं, और एक ऐसी चीज़ माँगें जो मदद करे।')] },
      U181,
      { b: TRY, l: [N2('Choose one person, and one thing to ask for.', 'एक व्यक्ति चुनें, और माँगने के लिए एक चीज़।')] }] },
    m7: { h: N2('When anger flares', 'जब ग़ुस्सा भड़के'), cards: [
      { l: [N2('Notice your body’s signs first: a hot face, a tight jaw, clenched fists.', 'पहले शरीर के संकेत पहचानें: गर्म चेहरा, कसा जबड़ा, भिंची मुट्ठियाँ।')] },
      { l: [N2('Step away for 5 minutes, breathe out slowly, and come back when you are calmer. Make up afterwards if you need to.', '5 मिनट के लिए हट जाएँ, धीरे साँस छोड़ें, और शांत होकर लौटें। ज़रूरत हो, तो बाद में बात सुलझा लें।')] },
      { u: N2('If you fear you could hurt your child or anyone, put the child somewhere safe, step away, and call for help: Tele-MANAS 14416, or 112 in danger.', 'अगर डर लगे कि आप अपने बच्चे या किसी को चोट पहुँचा सकती हैं, तो बच्चे को सुरक्षित जगह रखें, दूर हट जाएँ, और मदद के लिए फ़ोन करें: Tele-MANAS 14416, या ख़तरे में 112।'), tel: ['14416', '112'] },
      { b: TRY, l: [N2('Plan where you can step away to at home.', 'तय करें कि घर में आप कहाँ हट सकती हैं।')] }] },
    m9: { h: N2('Sleep', 'नींद'), cards: [
      { l: [N2('A steady get-up time and a calm last hour before bed help your mood.', 'रोज़ एक ही समय पर उठना और सोने से पहले का शांत घंटा मन को अच्छा रखते हैं।')] },
      { l: [N2('Awake for about 20 minutes? Sit up, keep the light low, and do something calm until you feel sleepy.', 'लगभग 20 मिनट से नींद नहीं आ रही? उठकर बैठ जाएँ, रोशनी कम रखें, और नींद आने तक कुछ शांत करें।')] },
      { b: TRY, l: [N2('In your calm week, wind down at bedtime with yoga nidra.', 'अपने शांत हफ़्ते में सोने से पहले योग निद्रा के साथ सुकून लें।')], go: 'calm-nidra', gol: 'calm_nidra' }] },
    m10: { h: N2('One thing for me', 'मेरे लिए एक काम'), cards: [
      { l: [N2('Small good things you plan for yourself lift the hard days: music, a call to a friend, time outside, prayer.', 'अपने लिए तय की गई छोटी अच्छी चीज़ें मुश्किल दिनों को हल्का करती हैं: संगीत, सहेली को फ़ोन, बाहर समय, प्रार्थना।')] },
      { b: TRY, l: [N2('In your calm week, plan one small thing for yourself each day.', 'अपने शांत हफ़्ते में हर दिन अपने लिए एक छोटा काम तय करें।')] }] },
    m11: { h: N2('When to get more help', 'और मदद कब लें'), cards: [
      { l: [N2('For some women, the days before a period bring anger, hopelessness or feeling out of control that hurts work or family. This can be treated.', 'कुछ महिलाओं के लिए पीरियड से पहले के दिन ऐसा ग़ुस्सा, निराशा या बेकाबू महसूस होना लाते हैं जो काम या परिवार पर असर डालता है। इसका इलाज हो सकता है।')] },
      { l: [N2('A doctor can help with talking therapy and medicines. Take your notes.', 'डॉक्टर बातचीत वाली therapy और दवाओं से मदद कर सकती हैं। अपने नोट साथ ले जाएँ।')], ask: true },
      { u: N2('Low most of the month, or thoughts of harm, is not PMS: call Tele-MANAS on 14416, free, any time. In danger right now, call 112.', 'महीने के ज़्यादातर दिन उदास रहना, या नुक़सान के ख़याल, PMS नहीं है: Tele-MANAS को 14416 पर फ़ोन करें, मुफ़्त, किसी भी समय। अभी ख़तरा हो, तो 112 पर फ़ोन करें।'), tel: ['14416', '112'] }] },
    m12: { h: N2('My calm-week plan, for keeping', 'मेरे शांत हफ़्ते की योजना, आगे के लिए'), cards: [
      { l: [N2('Your notes show your hard days, cycle by cycle. Cycles vary, so look at several.', 'आपके नोट आपके मुश्किल दिन, एक-एक चक्र करके, दिखाते हैं। चक्र अलग-अलग होते हैं, इसलिए कई चक्र देखें।')] },
      { b: TRY, l: [N2('Keep the 2 or 3 steps that helped most, and start them a week before each period.', 'जिन 2 या 3 कदमों से सबसे ज़्यादा मदद मिली, उन्हें रखें, और हर पीरियड से एक हफ़्ता पहले शुरू करें।')] },
      { warn: true, b: N2('Still hard?', 'अब भी मुश्किल है?'), l: [N2('A doctor can help with talking therapy and medicines. Take your notes with you.', 'डॉक्टर बातचीत वाली therapy और दवाओं से मदद कर सकती हैं। अपने नोट साथ ले जाएँ।')], ask: true }] }
  };
  const lessonRead = (id) => !!((store().les || {})[id]);
  const mark = (id) => { if (!L[id]) return; const st = store(); st.les = Object.assign({}, st.les || {}); st.les[id] = S.toISO(S.today()); persist(); };
  const tileT = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x ? t(x.title) : r; };
  const call = (n) => '<a class="btn danger sm" href="tel:' + n + '">' + esc(t('call_b')) + ' ' + n + '</a>';
  const topic = () => { const P = S.plan && S.plan.period; const id = P && P.lesson(); return id && L[id] ? tx(GOAL[id.charAt(0)]) : tx(GOAL.p); };
  function cardHtml(c) {
    if (c.u) return '<div class="card dark urgent per-les" role="alert" data-say="1"><p class="per-p">' + T(c.u) + '</p><div class="row wrap">' + (c.tel || ['112']).map(call).join('') + '</div></div>';
    const go = c.go && S.routeOwner(c.go) ? '<button type="button" class="btn sm" data-go="' + c.go + '">' + (c.gol === '@tile' ? esc(tileT(c.go)) : (typeof c.gol === 'string' ? esc(t(c.gol)) : T(c.gol))) + '</button>' : '';
    const ask = c.ask ? '<button type="button" class="btn sm primary" data-ask="' + esc(topic()) + '">' + esc(t('ask_qura')) + '</button>' : '';
    return '<div class="card per-les' + (c.warn ? ' warn' : '') + (c.b === TRY ? ' per-try' : '') + '" data-say="1">' + (c.b ? '<h3>' + T(c.b) + '</h3>' : '') + c.l.map((x) => '<p class="per-p">' + T(x) + '</p>').join('') + (go || ask ? '<div class="row wrap">' + ask + go + '</div>' : '') + '</div>';
  }
  function renderLesson(v) {
    const P = S.plan && S.plan.period; const id = [S.mem.perLes, P && P.lesson()].find((x) => x && L[x]) || 'p1'; const ls = L[id]; const g = id.charAt(0);   /* the row she tapped, else this week's */
    v.innerHTML = S.backRow(tx(ls.h), 'home', false) + '<div class="stack">' +
      '<span class="eyebrow per-eye">' + esc(tx(GOAL[g]) + ' · ' + fill(t('per_ch'), { n: id.slice(1) })) + '</span>' +
      ls.cards.map(cardHtml).join('') +
      '<details class="card per-why"><summary>' + esc(t('per_why')) + '</summary><p class="per-p small">' + T(WHY[g]) + '</p></details>' +
      (S.canSave() ? '<button type="button" class="btn primary block" id="per-les-done">' + esc(t('per_done')) + '</button>' : '') + '</div>';
    S.wire(v);
    const dn = v.querySelector('#per-les-done'); if (dn) dn.addEventListener('click', () => { mark(id); S.mem.perLes = null; S.setHash('home'); });
  }
  /* the row she taps on Today or My plan opens its own chapter (data-go navigates after this capture) */
  document.addEventListener('click', (e) => { const b = e.target && e.target.closest ? e.target.closest('[data-per-les]') : null; if (b) S.mem.perLes = b.dataset.perLes; }, true);
  S.perplan = Object.assign(S.perplan || {}, {
    lesson: { has: (id) => !!L[id], title: (id) => (L[id] ? tx(L[id].h) : ''), read: lessonRead, mark: mark, ids: () => Object.keys(L), goal: (g) => (GOAL[g] ? tx(GOAL[g]) : '') }
  });

  S.register({
    id: 'perplan',
    strings: {
      en: { per_ch: 'chapter {n} of 12', per_why: 'Why this helps', per_done: 'Done' },
      hi: { per_ch: '12 में से अध्याय {n}', per_why: 'यह क्यों मदद करता है', per_done: 'हो गया' }
    },
    routes: { 'per-lesson': renderLesson },
    open: ['per-lesson'],
    css: [
      '.per-p { margin: 0; overflow-wrap: anywhere; }',
      '.per-les { display: grid; gap: 8px; }',
      '.per-les.has-say > .say-b + .per-p { padding-right: 40px; }',
      '.per-try { border: 1.5px solid var(--accent); }',
      '.per-why summary { list-style: none; cursor: pointer; font-weight: 600; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
      '.per-why summary::-webkit-details-marker { display: none; }',
      '.per-why summary::after { content: ""; flex: none; width: 8px; height: 8px; margin-right: 4px; border-right: 2px solid var(--muted); border-bottom: 2px solid var(--muted); transform: rotate(45deg); }',
      '.per-why[open] summary::after { transform: rotate(-135deg); }'
    ].join('\n')
  });
})(window.Saathi);
