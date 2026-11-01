/* My midlife plan's chapters (Version 39.51; Mohit, 30 Oct: "start with the midlife plan", then "proceed building with your
   recommendations"; advice docs/midlife-plan-advice-2026-10-30.md; mockup claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd).
   Four short chapters for each part of the plan (web/progs/v1.js, meno version 2):
   - Cool and calm for hot flushes (h1 to h4): a self-help course built on CBT, which NICE NG23 (Nov 2024) and The Menopause
     Society (2023) recommend;
   - its calm version for worry and low mood (q1 to q4);
   - Rest (r1 to r4), from CBT for sleep;
   - Strong and steady (s1 to s4).
   Each chapter names the skill she practises on Today that week. Breathing and cooling are comfort while a flush passes, never a
   treatment (The Menopause Society 2023: paced breathing, cooling and yoga are not flush treatments). After 12 weeks her plan
   offers a Learn article a month instead (mods/plan.js). Every line waits for the doctor (review 19.51), and the calm chapters
   for the psychologist too. mods/plan.js chooses the chapter (S.plan.meno.lesson()). */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const N2 = (en, hi) => ({ en: en, hi: hi });
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));

  /* Browse mode keeps what she read in memory for this visit only */
  let temp = { owner: null, d: {} };
  const store = () => { if (S.canSave()) return S.data('midlife'); if (temp.owner !== S.state) temp = { owner: S.state, d: {} }; return temp.d; };
  const persist = () => { if (S.canSave()) S.save(); };

  const SKILL = N2('This week’s skill', 'इस हफ़्ते का अभ्यास');
  const PART = { h: N2('Cool and calm', 'ठंडक और सुकून'), q: N2('A calmer mind', 'शांत मन'), r: N2('Rest', 'आराम'), s: N2('Strong and steady', 'मज़बूत और संतुलित') };
  const WHY = {
    h: N2('This way of working with thoughts and habits is called CBT. In studies, women who learnt it found hot flushes and night sweats less of a problem, even when they still came. The UK’s NICE guideline recommends it, beside hormone therapy or on its own.',
      'सोच और आदतों पर इस तरह काम करने को CBT कहते हैं। अध्ययनों में, इसे सीखने वाली महिलाओं को गर्मी के झोंके और रात का पसीना कम परेशान करने लगे, भले ही वे आते रहे। ब्रिटेन की NICE guideline इसकी सलाह देती है, हॉर्मोन therapy के साथ या अकेले।'),
    q: N2('This way of working with thoughts and habits is called CBT. The UK’s NICE guideline recommends it for low mood around menopause.',
      'सोच और आदतों पर इस तरह काम करने को CBT कहते हैं। ब्रिटेन की NICE guideline मेनोपॉज़ के आसपास उदास मन के लिए इसकी सलाह देती है।'),
    r: N2('These rules come from CBT for sleep (CBT for insomnia), which doctors recommend first for sleep problems that last.',
      'ये नियम नींद के लिए CBT (CBT for insomnia) से लिए गए हैं, जिसे डॉक्टर लंबे समय से चली आ रही नींद की परेशानी में सबसे पहले सुझाते हैं।'),
    s: N2('Strength and balance work is what doctors and physiotherapists advise after menopause, for muscles, bones and fewer falls.',
      'मेनोपॉज़ के बाद डॉक्टर और फ़िज़ियोथेरेपिस्ट मांसपेशियों, हड्डियों और गिरने से बचने के लिए ताक़त और संतुलन के व्यायाम की सलाह देते हैं।')
  };
  /* a chapter: h its title, sk the skill on Today that week, cards: l lines, b a heading, go a page it opens (gol its label),
     u an urgent line with its Call numbers (tel), warn a "see a doctor" card */
  const L = {
    h1: { h: N2('What a hot flush is', 'गर्मी का झोंका क्या है'), sk: N2('notice it, name it', 'पहचानें और नाम दें'), cards: [
      { l: [N2('As your periods change or stop, your body’s thermostat gets more sensitive. A small rise in warmth sets off a quick cool-down: heat in your face and chest, sweating, a fast heartbeat. Then it passes, often in a few minutes.',
        'जब पीरियड बदलते या बंद होते हैं, तो शरीर का थर्मोस्टैट ज़्यादा संवेदनशील हो जाता है। थोड़ी-सी गर्मी बढ़ते ही शरीर जल्दी से ठंडा होने लगता है: चेहरे और छाती में गर्मी, पसीना, तेज़ धड़कन। फिर यह गुज़र जाता है, अक्सर कुछ ही मिनटों में।')] },
      { l: [N2('A flush is uncomfortable, but it isn’t dangerous. How much it gets in your way depends partly on what you think and do while it happens, and that part you can change.',
        'गर्मी का झोंका तकलीफ़ देता है, पर ख़तरनाक नहीं है। यह आपको कितना परेशान करता है, यह कुछ हद तक इस पर निर्भर है कि उस समय आप क्या सोचती और करती हैं, और यह हिस्सा आप बदल सकती हैं।')] },
      { b: SKILL, l: [N2('When a flush starts, tell yourself: “This is a flush. It will pass.” Notice where you were and what you were thinking. Tap Hot flushes in your diary that day.',
        'झोंका शुरू हो, तो ख़ुद से कहें: “यह गर्मी का झोंका है। यह गुज़र जाएगा।” ध्यान दें कि आप कहाँ थीं और क्या सोच रही थीं। उस दिन डायरी में ‘गर्मी के झोंके’ पर टैप करें।')] }] },
    h2: { h: N2('Thoughts that turn up the heat', 'सोच जो गर्मी बढ़ा देती है'), sk: N2('swap the thought', 'सोच बदलें'), cards: [
      { l: [N2('When a flush starts, a thought often comes with it: “Everyone can see.” “I can’t bear this.” Thoughts like these make it feel bigger and harder to sit through.',
        'झोंका शुरू होते ही अक्सर एक सोच भी आती है: “सब देख रहे हैं।” “मुझसे सहा नहीं जाता।” ऐसी सोच से झोंका बड़ा और झेलना मुश्किल लगता है।')] },
      { b: N2('A calmer thought', 'एक शांत सोच'), l: [
        N2('“Everyone can see” → “Most people don’t notice. If they do, it’s only a flush.”', '“सब देख रहे हैं” → “ज़्यादातर लोगों को पता भी नहीं चलता। चले भी, तो यह बस एक झोंका है।”'),
        N2('“I can’t bear this” → “I’ve got through every one so far. It will pass.”', '“मुझसे सहा नहीं जाता” → “अब तक हर झोंका झेल लिया है। यह भी गुज़र जाएगा।”'),
        N2('“It will never stop” → “It passes, usually in a few minutes.”', '“यह कभी नहीं रुकेगा” → “यह गुज़र जाता है, अक्सर कुछ मिनटों में।”'),
        N2('“Something is wrong with me” → “My body is cooling down. It isn’t dangerous.”', '“मुझे कुछ हो गया है” → “मेरा शरीर ठंडा हो रहा है। यह ख़तरनाक नहीं है।”')] },
      { b: SKILL, l: [N2('Pick the calmer thought that fits you best, and say it to yourself each time a flush starts.', 'जो शांत सोच आपको सबसे ठीक लगे, उसे चुनें, और हर झोंके की शुरुआत में ख़ुद से कहें।')] }] },
    h3: { h: N2('Carry on, and keep cool', 'काम जारी रखें, ठंडक बनाए रखें'), sk: N2('carry on', 'काम जारी रखें'), cards: [
      { l: [N2('Rushing out of the room or stopping everything can make a flush feel like an emergency. Staying with what you’re doing, as best you can, teaches your mind that it isn’t one.',
        'कमरे से भाग जाना या सब कुछ रोक देना झोंके को किसी आफ़त जैसा बना देता है। जितना हो सके, जो कर रही हैं उसे करती रहें; इससे मन सीखता है कि यह आफ़त नहीं है।')] },
      { l: [N2('Some things help you feel cooler: a layer you can take off, cotton clothes, cool water, a fan. Notice what sets your flushes off, such as a hot drink, spicy food or a warm room. These make you more comfortable; they don’t stop the flushes.',
        'कुछ चीज़ें ठंडक देती हैं: ऊपर का एक कपड़ा जो उतार सकें, सूती कपड़े, ठंडा पानी, पंखा। ध्यान दें कि आपके झोंके किससे शुरू होते हैं, जैसे गर्म चाय, तीखा खाना या गर्म कमरा। इनसे आराम मिलता है; झोंके रुकते नहीं।')] },
      { b: SKILL, l: [N2('When a flush comes: name it, say your calmer thought, breathe slowly, and carry on with what you were doing.', 'झोंका आए तो: उसे पहचानें, अपनी शांत सोच दोहराएँ, धीरे साँस लें, और जो कर रही थीं वह करती रहें।')], go: 'relief-hot', gol: 'relief_hot_t' }] },
    h4: { h: N2('Night sweats', 'रात का पसीना'), sk: N2('your night plan', 'रात की तैयारी'), cards: [
      { l: [N2('Night sweats are hot flushes while you sleep. Waking up hot can make you worry about tomorrow, and the worry keeps you awake.',
        'रात का पसीना नींद में आने वाले गर्मी के झोंके हैं। गर्मी से नींद खुले तो कल की चिंता होने लगती है, और चिंता से नींद नहीं आती।')] },
      { l: [N2('Before bed: a cool room, light cotton clothes, water by your bed. If a flush wakes you, push back the covers, sip some water and tell yourself: “It will pass. I can rest.”',
        'सोने से पहले: ठंडा कमरा, हल्के सूती कपड़े, पलंग के पास पानी। झोंके से नींद खुले, तो चादर हटाएँ, पानी के घूँट लें और ख़ुद से कहें: “यह गुज़र जाएगा। मैं आराम कर सकती हूँ।”')] },
      { b: SKILL, l: [N2('Set up your bedroom the cool way every night this week. Can’t get back to sleep after about 20 minutes? Get up and do something calm until you feel sleepy.',
        'इस हफ़्ते हर रात कमरे को ठंडा रखें। लगभग 20 मिनट में दोबारा नींद न आए, तो उठ जाएँ और नींद आने तक कुछ शांत काम करें।')] },
      { warn: true, b: N2('See a doctor this week', 'इस हफ़्ते डॉक्टर को दिखाएँ'), l: [N2('Night sweats with a fever, a cough for more than 2 weeks, or weight loss: see a doctor and ask about a TB test, which is free at government centres.',
        'रात के पसीने के साथ बुख़ार, 2 हफ़्ते से ज़्यादा खाँसी, या वज़न घटना: डॉक्टर को दिखाएँ और TB जाँच के बारे में पूछें, जो सरकारी केंद्रों पर मुफ़्त है।')] }] },
    q1: { h: N2('Mood in midlife', 'इस उम्र में मन'), sk: N2('notice your mood', 'अपना मन पहचानें'), cards: [
      { l: [N2('Changing hormones, poor sleep and a busy life can all bring worry, irritability or low days in midlife. It’s common, and it can be helped.',
        'बदलते हॉर्मोन, ख़राब नींद और भागदौड़ भरी ज़िंदगी, इन सबसे इस उम्र में चिंता, चिड़चिड़ापन या उदासी आ सकती है। यह आम है, और इसमें मदद मिल सकती है।')] },
      { l: [N2('What you think, how you feel and what you do are linked. Change one, and the others often follow.', 'आप क्या सोचती हैं, कैसा महसूस करती हैं और क्या करती हैं, ये आपस में जुड़े हैं। एक बदले, तो अक्सर बाक़ी भी बदलते हैं।')] },
      { b: SKILL, l: [N2('Once a day, stop and notice: how am I feeling, and what am I thinking? Just notice. You don’t have to fix it.', 'दिन में एक बार रुककर देखें: मैं कैसा महसूस कर रही हूँ, और क्या सोच रही हूँ? बस देखें। ठीक करना ज़रूरी नहीं।')] },
      { u: N2('Thoughts of harming yourself? Call Tele-MANAS on 14416: free, any time. In danger right now, call 112.', 'ख़ुद को नुक़सान पहुँचाने के ख़याल आते हैं? Tele-MANAS को 14416 पर फ़ोन करें: मुफ़्त, किसी भी समय। अभी ख़तरा हो, तो 112 पर फ़ोन करें।'), tel: ['14416', '112'] }] },
    q2: { h: N2('Worry thoughts', 'चिंता वाली सोच'), sk: N2('a kinder answer', 'एक नरम जवाब'), cards: [
      { l: [N2('Worry often jumps to the worst: “Something bad will happen.” “I can’t cope.”', 'चिंता अक्सर सबसे बुरा सोचती है: “कुछ बुरा होगा।” “मुझसे नहीं होगा।”')] },
      { l: [N2('Ask yourself: what would I tell a friend who thought this? Then tell yourself the same.', 'ख़ुद से पूछें: अगर मेरी सहेली ऐसा सोचती, तो मैं उससे क्या कहती? फिर वही बात ख़ुद से कहें।')] },
      { b: SKILL, l: [N2('When a worry comes, say it or write it down, then the kinder answer you would give a friend.', 'चिंता आए, तो उसे बोलें या लिख लें, फिर वह नरम जवाब जो आप सहेली को देतीं।')] }] },
    q3: { h: N2('One thing that lifts you', 'एक काम जो मन हल्का करे'), sk: N2('one thing that lifts you', 'मन हल्का करने वाला एक काम'), cards: [
      { l: [N2('When we feel low, we do less, and doing less makes us feel lower. Small things you enjoy, or that matter to you, turn this around.',
        'मन उदास हो तो हम कम करते हैं, और कम करने से मन और उदास होता है। छोटी चीज़ें जो आपको अच्छी लगें या आपके लिए मायने रखें, यह चक्र तोड़ती हैं।')] },
      { l: [N2('A walk in the morning light, a call to a friend, music, prayer, cooking something you like, time with family.', 'सुबह की धूप में सैर, किसी सहेली को फ़ोन, संगीत, पूजा या प्रार्थना, अपनी पसंद का कुछ बनाना, परिवार के साथ समय।')] },
      { b: SKILL, l: [N2('Each day, plan one small thing that lifts you, and do it, even if you don’t feel like it at first.', 'हर दिन, मन हल्का करने वाला एक छोटा काम तय करें, और करें, भले शुरुआत में मन न हो।')] }] },
    q4: { h: N2('Sleep and mood', 'नींद और मन'), sk: N2('your wind-down', 'सोने से पहले सुकून'), cards: [
      { l: [N2('Poor sleep and low mood feed each other. A steady get-up time and a calm last hour before bed help both.', 'ख़राब नींद और उदास मन एक-दूसरे को बढ़ाते हैं। रोज़ एक ही समय पर उठना और सोने से पहले का शांत घंटा, दोनों में मदद करते हैं।')] },
      { b: SKILL, l: [N2('Every evening this week, take 20 minutes to wind down before bed: lights low, your phone away, slow breaths or yoga nidra.', 'इस हफ़्ते हर शाम सोने से पहले 20 मिनट सुकून के लिए रखें: रोशनी कम, फ़ोन दूर, धीमी साँस या योग निद्रा।')], go: 'calm', gol: N2('Wind down', 'सुकून के पल') },
      { warn: true, b: N2('Talk to your doctor', 'अपनी डॉक्टर से बात करें'), l: [N2('Low mood or worry on most days for 2 weeks, or it stops you doing your day: talk to your doctor. Talking therapy and medicines help.',
        '2 हफ़्ते तक ज़्यादातर दिन मन उदास रहे या चिंता रहे, या इससे रोज़ के काम रुकें: अपनी डॉक्टर से बात करें। बातचीत वाली therapy और दवाएँ मदद करती हैं।')] }] },
    r1: { h: N2('One get-up time', 'उठने का एक समय'), sk: N2('up at the same time', 'रोज़ एक ही समय पर उठें'), cards: [
      { l: [N2('Your body clock likes a steady morning. Getting up at the same time every day, even after a bad night or on a holiday, makes sleep come more easily at night.',
        'शरीर की घड़ी को रोज़ की एक जैसी सुबह पसंद है। हर दिन एक ही समय पर उठने से, ख़राब रात या छुट्टी के बाद भी, रात को नींद आसानी से आती है।')] },
      { l: [N2('Lying in after a bad night feels kind, but it pushes tonight’s sleep later.', 'ख़राब रात के बाद देर तक लेटे रहना अच्छा लगता है, पर इससे आज रात की नींद और देर से आती है।')] },
      { b: SKILL, l: [N2('Pick your get-up time, and keep it every day this week.', 'उठने का अपना समय चुनें, और इस हफ़्ते हर दिन उसी समय उठें।')] }] },
    r2: { h: N2('Bed is for sleep', 'बिस्तर नींद के लिए'), sk: N2('the 20-minute rule', '20 मिनट का नियम'), cards: [
      { l: [N2('Lying awake for a long time teaches your body that bed is a place to worry.', 'देर तक जागते हुए लेटे रहने से शरीर सीख जाता है कि बिस्तर चिंता करने की जगह है।')] },
      { l: [N2('Go to bed when you feel sleepy, not just because it’s late. Can’t sleep after about 20 minutes? Get up, sit somewhere dim and do something calm. Go back when you feel sleepy.',
        'नींद आने पर सोने जाएँ, सिर्फ़ इसलिए नहीं कि देर हो गई। लगभग 20 मिनट में नींद न आए? उठ जाएँ, कम रोशनी वाली जगह बैठकर कुछ शांत करें। नींद आने पर वापस जाएँ।')] },
      { b: SKILL, l: [N2('Use the 20-minute rule this week, every night you need it.', 'इस हफ़्ते जिस भी रात ज़रूरत हो, 20 मिनट का नियम अपनाएँ।')] }] },
    r3: { h: N2('Light, naps and tea', 'धूप, झपकी और चाय'), sk: N2('morning light', 'सुबह की धूप'), cards: [
      { l: [N2('Daylight in the morning sets your body clock. A walk outside, or sitting by a window after you get up, helps.', 'सुबह की रोशनी शरीर की घड़ी ठीक करती है। उठने के बाद बाहर सैर, या खिड़की के पास बैठना मदद करता है।')] },
      { l: [N2('If you nap, keep it to about 20 minutes, before 3 pm. Have your tea or coffee before 2 pm.', 'झपकी लें, तो लगभग 20 मिनट की, दोपहर 3 बजे से पहले। चाय या कॉफ़ी दोपहर 2 बजे से पहले लें।')] },
      { b: SKILL, l: [N2('Get 15 minutes of morning light every day this week.', 'इस हफ़्ते हर दिन 15 मिनट सुबह की धूप लें।')] }] },
    r4: { h: N2('When sleep needs a doctor', 'जब नींद के लिए डॉक्टर चाहिए'), sk: N2('a calm last hour', 'सोने से पहले का शांत घंटा'), cards: [
      { l: [N2('Keep your last hour before bed calm: lights low, your phone away, and Wind down if you like.', 'सोने से पहले का आख़िरी घंटा शांत रखें: रोशनी कम, फ़ोन दूर, और चाहें तो सुकून के पल।')], go: 'calm', gol: N2('Wind down', 'सुकून के पल') },
      { warn: true, b: N2('Tell your doctor if', 'डॉक्टर को बताएँ अगर'), l: [N2('You snore loudly and stop breathing for a moment, feel very sleepy in the day, or have slept badly on most nights for 3 months. These can be treated: a short course of talking therapy for sleep (CBT for insomnia) helps many women, and doctors try it before sleeping pills.',
        'आप ज़ोर से खर्राटे लेती हैं और साँस पल भर रुकती है, दिन में बहुत नींद आती है, या 3 महीने से ज़्यादातर रातें ख़राब नींद रही है। इनका इलाज है: नींद के लिए बातचीत वाली therapy (CBT for insomnia) का छोटा कोर्स कई महिलाओं की मदद करता है, और डॉक्टर नींद की गोलियों से पहले इसे आज़माते हैं।')] },
      { b: SKILL, l: [N2('Keep a calm last hour every evening this week.', 'इस हफ़्ते हर शाम सोने से पहले का एक घंटा शांत रखें।')] }] },
    s1: { h: N2('Muscle after 40', '40 के बाद मांसपेशियाँ'), sk: N2('steady on your feet', 'पैरों पर संतुलन'), cards: [
      { l: [N2('After menopause, muscles and bones get weaker faster. Strength work twice a week keeps your muscles strong, and helps your bones too.',
        'मेनोपॉज़ के बाद मांसपेशियाँ और हड्डियाँ तेज़ी से कमज़ोर होती हैं। हफ़्ते में दो बार ताक़त के व्यायाम से मांसपेशियाँ मज़बूत रहती हैं, और हड्डियों को भी मदद मिलती है।')] },
      { l: [N2('You don’t need a gym: a chair, a wall and your own body are enough.', 'जिम की ज़रूरत नहीं: एक कुर्सी, एक दीवार और आपका अपना शरीर काफ़ी है।')] },
      { b: SKILL, l: [N2('Every day: Steady on your feet, 3 minutes. Twice a week: Strength at home.', 'रोज़: पैरों पर संतुलन, 3 मिनट। हफ़्ते में दो बार: घर पर ताक़त।')], go: 'plan-r-steady', gol: 'plan_r_steady' }] },
    s2: { h: N2('Steady on your feet', 'पैरों पर संतुलन'), sk: N2('steady on your feet', 'पैरों पर संतुलन'), cards: [
      { l: [N2('Good balance helps prevent falls, and most broken bones later in life come from a fall.', 'अच्छे संतुलन से गिरने का ख़तरा कम होता है, और बाद की उम्र में ज़्यादातर हड्डियाँ गिरने से ही टूटती हैं।')] },
      { l: [N2('A few minutes of balance practice a day makes a difference. Always keep a hand near a wall or a chair.', 'रोज़ कुछ मिनट संतुलन का अभ्यास फ़र्क़ लाता है। हमेशा एक हाथ दीवार या कुर्सी के पास रखें।')] },
      { b: SKILL, l: [N2('Steady on your feet, every day this week.', 'इस हफ़्ते हर दिन, पैरों पर संतुलन।')], go: 'plan-r-steady', gol: 'plan_r_steady' }] },
    s3: { h: N2('Lift and bend the safe way', 'सही तरीक़े से उठाएँ और झुकें'), sk: N2('steady on your feet', 'पैरों पर संतुलन'), cards: [
      { l: [N2('To lift something: bend your knees and hips, keep your back tall, hold it close to you, and don’t twist while you lift.', 'कुछ उठाना हो तो: घुटने और कूल्हे मोड़ें, पीठ सीधी रखें, चीज़ को शरीर के पास रखें, और उठाते समय मुड़ें नहीं।')] },
      { l: [N2('Avoid bending forward with something heavy, and sudden twists, most of all if your doctor has said your bones are weak.', 'भारी चीज़ लेकर आगे झुकने और अचानक मुड़ने से बचें, ख़ासकर अगर डॉक्टर ने कहा है कि आपकी हड्डियाँ कमज़ोर हैं।')] },
      { b: SKILL, l: [N2('This week, lift the safe way every time: a bucket, a child, the shopping.', 'इस हफ़्ते हर बार सही तरीक़े से उठाएँ: बाल्टी, बच्चा, सामान।')] }] },
    s4: { h: N2('Food for strong bones', 'मज़बूत हड्डियों के लिए खाना'), sk: N2('steady on your feet', 'पैरों पर संतुलन'), cards: [
      { l: [N2('Calcium foods every day: milk or curd, paneer, ragi, til, green leafy vegetables, rajma and chana.', 'रोज़ कैल्शियम वाला खाना: दूध या दही, पनीर, रागी, तिल, हरी पत्तेदार सब्ज़ियाँ, राजमा और चना।')] },
      { l: [N2('Protein at each meal helps your muscles: dal, paneer and curd, and eggs, fish or chicken if you eat them.', 'हर बार के खाने में प्रोटीन मांसपेशियों की मदद करता है: दाल, पनीर और दही, और अंडा, मछली या चिकन अगर आप खाती हैं।')] },
      { l: [N2('Calcium or vitamin D tablets: only if your doctor advises them.', 'कैल्शियम या विटामिन D की गोलियाँ: सिर्फ़ डॉक्टर की सलाह पर।')], go: 'meno-bones', gol: '@tile' },
      { b: SKILL, l: [N2('Every day this week: a calcium food, some protein at each meal, and Steady on your feet.', 'इस हफ़्ते हर दिन: एक कैल्शियम वाला खाना, हर बार के खाने में थोड़ा प्रोटीन, और पैरों पर संतुलन।')] }] }
  };
  const lessonRead = (id) => !!((store().les || {})[id]);
  const mark = (id) => { if (!L[id] && !/^y\d+$/.test(id || '')) return; const st = store(); st.les = Object.assign({}, st.les || {}); st.les[id] = S.toISO(S.today()); persist(); };
  const tileT = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x ? t(x.title) : r; };
  const call = (n) => '<a class="btn danger sm" href="tel:' + n + '">' + esc(t('call_b')) + ' ' + n + '</a>';
  function cardHtml(c) {
    if (c.u) return '<div class="card urgent mid-les" role="alert" data-say="1"><p class="mid-p">' + T(c.u) + '</p><div class="row wrap">' + (c.tel || ['112']).map(call).join('') + '</div></div>';
    const go = c.go && S.routeOwner(c.go) ? '<button type="button" class="btn sm" data-go="' + c.go + '">' + (c.gol === '@tile' ? esc(tileT(c.go)) : (typeof c.gol === 'string' ? esc(t(c.gol)) : T(c.gol))) + '</button>' : '';
    return '<div class="card mid-les' + (c.warn ? ' warn' : '') + (c.b === SKILL ? ' mid-skill' : '') + '" data-say="1">' + (c.b ? '<h3>' + T(c.b) + '</h3>' : '') + c.l.map((x) => '<p class="mid-p">' + T(x) + '</p>').join('') + (go ? '<div class="row wrap">' + go + '</div>' : '') + '</div>';
  }
  function renderLesson(v) {
    const M = S.plan && S.plan.meno; const id = [S.mem.midLes, M && M.skillId(), M && M.lesson()].find((x) => x && L[x]) || 'h1'; const ls = L[id]; const p = id.charAt(0);   /* the row she tapped, else Today's skill's chapter */
    v.innerHTML = S.backRow(tx(ls.h), 'home', false) + '<div class="stack">' +
      '<span class="eyebrow mid-eye">' + esc(tx(PART[p]) + ' · ' + fill(t('mid_ch'), { n: id.slice(1) })) + '</span>' +
      ls.cards.map(cardHtml).join('') +
      '<details class="card mid-why"><summary>' + esc(t('mid_why')) + '</summary><p class="mid-p small">' + T(WHY[p]) + '</p></details>' +
      (S.canSave() ? '<button type="button" class="btn primary block" id="mid-les-done">' + esc(t('mid_done')) + '</button>' : '') + '</div>';
    S.wire(v);
    const dn = v.querySelector('#mid-les-done'); if (dn) dn.addEventListener('click', () => { mark(id); S.mem.midLes = null; S.setHash('home'); });
  }
  S.midlife = Object.assign(S.midlife || {}, {
    lesson: { title: (id) => (L[id] ? tx(L[id].h) : ''), skill: (id) => (L[id] ? tx(L[id].sk) : ''), read: lessonRead, mark: mark, ids: () => Object.keys(L), part: (p) => (PART[p] ? tx(PART[p]) : ''),
      how: (id) => { const c = L[id] && (L[id].cards || []).find((x) => x.b === SKILL); return c && c.l && c.l[0] ? tx(c.l[0]) : ''; } }   /* Version 39.51: this week's skill, for the step's Why? */
  });

  S.register({
    id: 'midlife',
    strings: {
      en: { mid_ch: 'chapter {n} of 4', mid_why: 'Why this works', mid_done: 'Done' },
      hi: { mid_ch: '4 में से अध्याय {n}', mid_why: 'यह क्यों काम करता है', mid_done: 'हो गया' }
    },
    routes: { 'mid-lesson': renderLesson },
    open: ['mid-lesson'],
    css: [
      '.mid-p { margin: 0; overflow-wrap: anywhere; }',
      '.mid-les { display: grid; gap: 8px; }',
      '.mid-les.has-say > .say-b + .mid-p { padding-right: 40px; }',   /* a card that opens with its words keeps them clear of the speaker, as Getting ready's lessons do */
      '.mid-skill { border: 1.5px solid var(--accent); }',
      '.mid-why summary { list-style: none; cursor: pointer; font-weight: 600; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
      '.mid-why summary::-webkit-details-marker { display: none; }',
      '.mid-why summary::after { content: ""; flex: none; width: 8px; height: 8px; margin-right: 4px; border-right: 2px solid var(--muted); border-bottom: 2px solid var(--muted); transform: rotate(45deg); }',   /* Version 39.51 (Mohit's phone): the WebView drew no marker */
      '.mid-why[open] summary::after { transform: rotate(-135deg); }'
    ].join('\n')
  });
})(window.Saathi);
