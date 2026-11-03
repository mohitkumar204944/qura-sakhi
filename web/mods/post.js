/* After birth: day count, daily recovery check with warning signs, mood, breastfeeding log, contraception after birth, pelvic floor trainer, check-ups and baby's vaccines. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const R = { hub: 'post', rec: 'post-recovery', mood: 'post-mood', feed: 'post-feed', contra: 'post-contra', pelvic: 'post-pelvic', checks: 'post-checks' };
  const MINE = Object.keys(R).map((k) => R[k]);
  const L = (en, hi) => ({ en: en, hi: hi });
  const LD = (en, hi, den, dhi) => ({ en: en, hi: hi, doc: { en: den, hi: dhi } });   /* Version 39.29: with its doctor-route words */
  const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';

  /* ---------- strings: [English, Hindi]; every key becomes post_<key> ---------- */
  const P = {
    /* tiles */
    t_hub: ['After birth: day by day', 'डिलीवरी के बाद: हर दिन'],
    t_hub_s: ["Your recovery, feeding, check-ups and baby's vaccines", 'आपकी रिकवरी, दूध पिलाना, जाँच और बच्चे के टीके'],
    t_rec: ['Daily recovery check', 'रोज़ की रिकवरी जाँच'],
    t_rec_s: ['Bleeding, stitches, fever, breasts, mood: what is normal and what is not', 'ब्लीडिंग, टाँके, बुख़ार, स्तन, मन: क्या सामान्य है, क्या नहीं'],
    t_mood: ['Mood after birth', 'डिलीवरी के बाद मन'],
    t_mood_s: ['Baby blues, depression, and when it is an emergency', 'बेबी ब्लूज़, डिप्रेशन, और कब यह इमरजेंसी है'],
    t_feed: ['Breastfeeding', 'स्तनपान'],
    t_feed_s: ['Feed log with timer, latch, sore nipples, milk supply, going back to work', 'टाइमर वाला फ़ीड लॉग, सही पकड़, निप्पल में दर्द, दूध की मात्रा, काम पर लौटना'],
    t_contra: ['Contraception after birth', 'डिलीवरी के बाद गर्भनिरोध'],
    t_contra_s: ['What you can start, and when, while breastfeeding', 'स्तनपान के दौरान क्या और कब शुरू कर सकती हैं'],
    t_pelvic: ['Pelvic floor trainer', 'पेल्विक फ़्लोर व्यायाम'],
    t_pelvic_s: ['Guided squeeze-and-relax timer, step by step', 'गिनती के साथ कसना और ढीला छोड़ना, क़दम दर क़दम'],   /* Version 39.56: the belly gap check is for after a birth only */
    t_checks: ["Check-ups and baby's vaccines", 'जाँच और बच्चे के टीके'],
    t_checks_s: ['ASHA visits, your 6-week check, iron and calcium, vaccine reminders', 'ASHA की विज़िट, आपकी 6 हफ़्ते की जाँच, आयरन-कैल्शियम, टीकों के रिमाइंडर'], t_checks_s_doc: ['Your 6-week check, iron and calcium, vaccine reminders', 'आपकी 6 हफ़्ते की जाँच, आयरन-कैल्शियम, टीकों के रिमाइंडर'],

    /* shared */
    remove: ['Remove', 'हटाएँ'], more: ['Related', 'इससे जुड़े'], min: ['min', 'मिनट'],
    side_L: ['Left', 'बायाँ'], side_R: ['Right', 'दायाँ'],
    for_label: ['for:', 'इसके लिए:'],
    nodx: ['Not a diagnosis. Based on WHO, NHS, CDC and Indian government guidance.', 'यह निदान (diagnosis) नहीं है। WHO, NHS, CDC और भारत सरकार की गाइडलाइन पर आधारित।'],
    ask_topic: ['Recovery after birth', 'डिलीवरी के बाद रिकवरी'],

    /* Version 39.46: "My baby has died" (review section 19.46; words for the psychologist and the obstetrician) */
    lost_link: ['My baby has died', 'मेरा बच्चा नहीं रहा'],
    lost_h: ['We are so sorry', 'हमें बहुत दुख है'],
    lost_q_p: ['Sakhi will stop everything about your baby: feeding, the vaccine dates and your baby’s age. What is for you stays: your daily check to day 41, your own check at 6 weeks, and contraception when you want it.', 'Sakhi बच्चे से जुड़ी हर चीज़ बंद कर देगी: दूध पिलाना, टीकों की तारीख़ें और बच्चे की उम्र। आपके लिए जो है वह रहेगा: 41वें दिन तक रोज़ की जाँच, 6 हफ़्ते पर आपकी अपनी जाँच, और जब चाहें गर्भनिरोध।'],
    lost_q_yes: ['Stop them', 'बंद करें'],
    lost_done: ['Nothing about your baby will come up again.', 'बच्चे से जुड़ी कोई बात अब नहीं आएगी।'],
    lost_talk: ['Talk to someone: Tele-MANAS 14416, free, any time.', 'किसी से बात करें: Tele-MANAS 14416, मुफ़्त, कभी भी।'],
    lost_sup: ['Support after a loss', 'खोने के बाद सहारा'],
    lost_undo: ['Marked this by mistake? Undo', 'ग़लती से चुना? वापस लें'],
    lost_feed: ['This page is about feeding a baby.', 'यह पेज बच्चे को दूध पिलाने के बारे में है।'],
    lost_back: ['Back to your recovery', 'अपनी रिकवरी पर लौटें'],
    t_checks_s0: ['Your own check, iron and calcium', 'आपकी अपनी जाँच, आयरन और कैल्शियम'],
    u_4b: ['Thoughts of harming yourself: 14416 or 112', 'ख़ुद को नुक़सान पहुँचाने के ख़याल: 14416 या 112'],
    self_2b: ['Eat proper meals: dal, eggs or paneer, milk, green vegetables and fruit, and drink water through the day.', 'पूरा खाना खाएँ: दाल, अंडा या पनीर, दूध, हरी सब्ज़ियाँ और फल, और दिन भर पानी पिएँ।'],
    self_3b: ['Walk a little every day as you feel able. Avoid lifting anything heavy for the first weeks, especially after a C-section.', 'जितना हो सके, रोज़ थोड़ा चलें। पहले हफ़्तों में कुछ भारी न उठाएँ, ख़ासकर ऑपरेशन के बाद।'],
    p_b: ['The first weeks after a birth are for healing. Check yourself daily, and know the warning signs.', 'डिलीवरी के बाद के पहले हफ़्ते ठीक होने के लिए हैं। रोज़ ख़ुद को जाँचें, और ख़तरे के संकेत जानें।'],
    mo_harm_b: ['Thoughts of harming myself', 'ख़ुद को नुक़सान पहुँचाने के विचार'],
    fl_harm_b: ['Call Tele-MANAS 14416 (free, any time) or 112 now, and ask someone to stay with you. You do not have to go through this alone.', 'अभी Tele-MANAS 14416 (मुफ़्त, कभी भी) या 112 पर कॉल करें, और किसी से अपने पास रहने को कहें। आपको यह अकेले नहीं सहना है।'],
    d_ill: ['Fever and feeling very unwell', 'बुख़ार और बहुत बीमार महसूस होना'],
    fl_ill: ['A fever with feeling very unwell after a birth can be a serious infection. Call 112 or go to hospital now.', 'डिलीवरी के बाद बुख़ार के साथ बहुत बीमार महसूस होना गंभीर संक्रमण हो सकता है। अभी 112 पर कॉल करें या अस्पताल जाएँ।'],
    s_ill: ['fever and feeling very unwell', 'बुख़ार और बहुत बीमार महसूस होना'],

    /* birth date */
    nobirth_h: ['When was your baby born?', 'आपके बच्चे का जन्म कब हुआ?'],
    nobirth_p: ['Add the birth date to see your day count, ASHA visit days and vaccine dates. It stays on this phone.', 'जन्म की तारीख़ डालें, तो दिनों की गिनती, ASHA की विज़िट और टीकों की तारीख़ें दिखेंगी। यह इसी फ़ोन पर रहती है।'], nobirth_p_doc: ['Add the birth date to see your day count, check-up and vaccine dates. It stays on this phone.', 'जन्म की तारीख़ डालें, तो दिनों की गिनती, जाँच और टीकों की तारीख़ें दिखेंगी। यह इसी फ़ोन पर रहती है।'],
    birth_l: ["Baby's birth date", 'बच्चे के जन्म की तारीख़'],
    set: ['Set', 'सेट'], change: ['Change date', 'तारीख़ बदलें'],
    birth_on: ['Born on {d}', 'जन्म: {d}'],
    from_me: ['From My situation. Change it on the Me page.', '"मेरी स्थिति" से ली गई। बदलना हो तो "मैं" पेज पर जाएँ।'],
    birth_bad: ['Pick a date that is not in the future.', 'ऐसी तारीख़ चुनें जो आगे की न हो।'],
    birth_go: ['Add the birth date', 'जन्म की तारीख़ डालें'],

    /* hub */
    h: ['After birth', 'डिलीवरी के बाद'],
    p: ['The first weeks after a baby are for healing. Check yourself daily, feed often, and know the warning signs.', 'बच्चे के बाद के पहले हफ़्ते शरीर के भरने के होते हैं। रोज़ अपनी जाँच करें, बार-बार दूध पिलाएँ, और ख़तरे के संकेत पहचानें।'],
    eb_day: ['Days since the birth', 'डिलीवरी के बाद दिन'],
    day0: ['Day of birth', 'जन्म का दिन'],
    dayn: ['Day {n} after birth', 'डिलीवरी के बाद दिन {n}'],
    age_d1: ['Your baby is 1 day old.', 'आपका बच्चा 1 दिन का है।'],
    age_d: ['Your baby is {n} days old.', 'आपका बच्चा {n} दिन का है।'],
    age_w1: ['Your baby is 1 week old.', 'आपका बच्चा 1 हफ़्ते का है।'],
    age_w: ['Your baby is {w} weeks old.', 'आपका बच्चा {w} हफ़्ते का है।'],
    age_m: ['Your baby is about {m} months old.', 'आपका बच्चा लगभग {m} महीने का है।'],
    ph1: ['The first 6 weeks (42 days) are for healing: bleeding settles, the womb shrinks back, stitches heal. Rest when the baby sleeps.', 'पहले 6 हफ़्ते (42 दिन) शरीर के भरने के हैं: ब्लीडिंग कम होती है, बच्चेदानी वापस छोटी होती है, टाँके भरते हैं। जब बच्चा सोए, आप भी आराम करें।'],
    ph2: ['Your 6 weeks of healing are over. Give only breast milk until 6 months: {d}.', 'आपके 6 हफ़्ते का भरने का समय पूरा हुआ। 6 महीने तक, यानी {d} तक, सिर्फ़ माँ का दूध दें।'],
    bf_food_h: ['Food while you breastfeed', 'स्तनपान के दिनों का खाना'], bf_fast: ['Fasting while you breastfeed', 'स्तनपान के दौरान व्रत'],
    ph3: ['Your baby is past 6 months: start soft home foods and keep breastfeeding to 2 years or more.', 'बच्चा 6 महीने से बड़ा है: नरम घर का खाना शुरू करें और 2 साल या उससे ज़्यादा तक स्तनपान जारी रखें।'],
    k_check: ["Today's check", 'आज की जाँच'], k_done: ['Done', 'हो गई'], k_notyet: ['Not yet', 'अभी नहीं'],
    k_feeds: ['Feeds today', 'आज की फ़ीड'], k_pf: ['Pelvic floor sets today', 'आज पेल्विक फ़्लोर सेट'],
    k_asha: ['Next ASHA visit', 'ASHA की अगली विज़िट'], k_six: ['Your 6-week check', 'आपकी 6 हफ़्ते की जाँच'], k_vax: ['Next vaccines', 'अगले टीके'],
    of3: ['{n} of 3', '3 में से {n}'],
    feeds_last: ['{n} · last side: {s}', '{n} · पिछली तरफ़: {s}'],
    day_today: ['Day {n} · today', 'दिन {n} · आज'],
    day_d: ['Day {n} · {d}', 'दिन {n} · {d}'], day_only: ['Day {n}', 'दिन {n}'],
    do_check: ["Do today's check", 'आज की जाँच करें'], upd_check: ["Update today's check", 'आज की जाँच बदलें'],
    running: ['Feed running: {side} side, since {t}', 'फ़ीड चल रही है: {side} तरफ़, {t} से'],
    open_feed: ['Open the feed log', 'फ़ीड लॉग खोलें'],
    u_h: ['Call 112 now if', 'तुरंत 112 पर कॉल करें अगर'],
    u_1: ['You soak a pad in an hour, or pass clots egg-sized or bigger', 'एक घंटे में पैड भीग जाए, या अंडे जितने या बड़े थक्के निकलें'],
    u_2: ['Severe headache, blurred vision or flashing lights, or fits', 'तेज़ सिरदर्द, धुंधला दिखना या चमक दिखना, या दौरा'],
    u_3: ['Chest pain, breathlessness, or pain and swelling in one calf', 'सीने में दर्द, साँस फूलना, या एक पिंडली में दर्द और सूजन'],
    u_4: ['Thoughts of harming yourself or your baby: 14416 or 112', 'ख़ुद को या बच्चे को नुक़सान पहुँचाने के ख़याल: 14416 या 112'],
    u_5: ['Free ambulance: 108 or 102', 'मुफ़्त एम्बुलेंस: 108 या 102'],
    tools_h: ['Guides and tools', 'गाइड और टूल'],
    schemes: ['Money and free services after birth', 'डिलीवरी के बाद पैसा और मुफ़्त सेवाएँ'],
    schemes_s: ['Schemes for mothers and where to claim', 'माँओं के लिए योजनाएँ और कहाँ क्लेम करें'],
    birthprep: ['Preparing for birth', 'डिलीवरी की तैयारी'],
    birthprep_s: ['Labour, C-section and the first hour', 'लेबर, ऑपरेशन और पहला घंटा'],
    hub_ask_h: ['Not sure if something is normal?', 'पक्का नहीं कि कुछ सामान्य है या नहीं?'],
    hub_ask_p: ['A Qura doctor (BAMS) can talk through recovery, sleep, food and feeding, and refer you to a gynaecologist when you need one. For warning signs, go to a hospital first.', 'Qura की डॉक्टर (BAMS) रिकवरी, नींद, खाना और दूध पिलाने पर बात कर सकती हैं, और ज़रूरत हो तो स्त्री-रोग विशेषज्ञ के पास भेजती हैं। ख़तरे के संकेत हों तो पहले अस्पताल जाएँ।'],

    /* recovery check */
    r_h: ['Daily recovery check', 'रोज़ की रिकवरी जाँच'],
    r_p: ['About 1 minute. Tap what is true today. Warning signs show straight away. Not a diagnosis.', 'लगभग 1 मिनट। आज जो सच है उस पर टैप करें। ख़तरे के संकेत तुरंत दिखेंगे। यह निदान नहीं है।'],
    r_for: ['Today, {d}', 'आज, {d}'],
    r_forn: ['Today, {d} · day {n} after birth', 'आज, {d} · डिलीवरी के बाद दिन {n}'],
    g_danger: ['Warning signs: any of these today?', 'ख़तरे के संकेत: आज इनमें से कुछ?'],
    d_none: ['None of these', 'इनमें से कुछ नहीं'],
    d_soak: ['Soaking a pad in an hour', 'एक घंटे में पैड भीग जाना'],
    d_clots: ['Clots egg-sized or bigger', 'अंडे जितने या बड़े थक्के'],
    d_smell: ['Bad-smelling discharge', 'बदबूदार डिस्चार्ज'],
    d_belly: ['Severe belly pain', 'पेट में तेज़ दर्द'],
    d_head: ['Severe headache', 'तेज़ सिरदर्द'],
    d_vision: ['Blurred vision or flashing lights', 'धुंधला दिखना या चमक दिखना'],
    d_swell: ['Sudden swelling of face or hands', 'चेहरे या हाथों में अचानक सूजन'],
    d_fits: ['Fits (seizure)', 'दौरा (झटके)'],
    d_calf: ['Pain or swelling in one calf', 'एक पिंडली में दर्द या सूजन'],
    d_chest: ['Chest pain', 'सीने में दर्द'],
    d_breath: ['Breathless', 'साँस फूलना'],
    d_faint: ['Dizzy or fainting', 'चक्कर या बेहोशी'],
    g_bleed: ['Bleeding today', 'आज ब्लीडिंग'],
    b_heavy: ['Heavy', 'ज़्यादा'], b_moderate: ['Moderate', 'मध्यम'], b_light: ['Light', 'हल्की'], b_none: ['None', 'नहीं'],
    g_colour: ['Colour', 'रंग'],
    c_red: ['Bright red', 'चटक लाल'], c_pink: ['Pink', 'गुलाबी'], c_brown: ['Brown', 'भूरा'], c_yellow: ['Yellowish-white', 'पीला-सफ़ेद'],
    g_wtype: ['Stitches or wound', 'टाँके या घाव'],
    w_stitch: ['Stitches below (tear or cut)', 'नीचे टाँके (फटना या चीरा)'], w_csec: ['C-section wound', 'ऑपरेशन (सिज़ेरियन) का घाव'], w_none: ['No stitches', 'टाँके नहीं'],
    g_wound: ['How do they feel?', 'कैसा लग रहा है?'],
    wd_fine: ['Fine', 'ठीक'], wd_pain: ['Painful', 'दर्द'], wd_red: ['Red or swollen', 'लाल या सूजा'], wd_pus: ['Pus or opening up', 'मवाद या खुल रहा है'],
    g_fever: ['Fever', 'बुख़ार'],
    f_no: ['No fever', 'बुख़ार नहीं'], f_high: ['38°C (100.4°F) or more', '38°C (100.4°F) या ज़्यादा'], f_shiver: ['Hot or shivery, not measured', 'गर्मी या कँपकँपी, नापा नहीं'],
    g_breast: ['Breasts', 'स्तन'],
    br_fine: ['Fine', 'ठीक'], br_sore: ['Full, hard or sore', 'भरे, सख़्त या दर्द'], br_red: ['Painful red patch', 'दर्द वाला लाल हिस्सा'],
    g_pee: ['Peeing', 'पेशाब'],
    pe_fine: ['Fine', 'ठीक'], pe_burn: ['Burning', 'जलन'], pe_leak: ['Leaking', 'लीक होना'], pe_cant: ["Can't pee, or only drops", 'पेशाब नहीं हो रहा, या बूँद-बूँद'],
    g_potty: ['Potty', 'पॉटी (शौच)'],
    po_fine: ['Fine', 'ठीक'], po_hard: ['Hard or painful', 'सख़्त या दर्द'], po_none: ['None for 3 days or more', '3 दिन या ज़्यादा से नहीं'],
    g_mood: ['Mood', 'मन'],
    mo_ok: ['Okay', 'ठीक'], mo_low: ['Low or teary', 'उदास या रोना आता है'], mo_anx: ['Worried or panicky', 'बहुत चिंता या घबराहट'], mo_harm: ['Thoughts of harming myself or my baby', 'ख़ुद को या बच्चे को नुक़सान पहुँचाने के ख़याल'],
    g_sleep: ['Sleep', 'नींद'],
    sl_ok: ['Got some rest', 'थोड़ा आराम मिला'], sl_some: ['Broken but managing', 'टूटी-टूटी, पर चल रहा है'], sl_poor: ['Hardly slept', 'लगभग नहीं सोई'],
    fl_112: ['Call 112 now, or go to the nearest hospital', 'अभी 112 पर कॉल करें, या सबसे पास के अस्पताल जाएँ'],
    fl_today: ['See a doctor today', 'आज ही डॉक्टर को दिखाएँ'],
    fl_harm_h: ['Get help now: call 14416 or 112', 'अभी मदद लें: 14416 या 112 पर कॉल करें'],
    fl_bleed: ['Soaking a pad in an hour or big clots can mean heavy bleeding after birth. Lie down, keep the baby at the breast if you can, and get to hospital now. Free ambulance: 108 or 102.', 'एक घंटे में पैड भीगना या बड़े थक्के डिलीवरी के बाद ज़्यादा ब्लीडिंग का संकेत हो सकते हैं। लेट जाएँ, हो सके तो बच्चे को दूध पिलाती रहें, और अभी अस्पताल जाएँ। मुफ़्त एम्बुलेंस: 108 या 102।'],
    fl_pe: ['Severe headache, blurred vision or fits can be pre-eclampsia (dangerous high BP), which can start in the days or weeks after birth. This is an emergency.', 'तेज़ सिरदर्द, धुंधला दिखना या दौरा pre-eclampsia (ख़तरनाक हाई BP) हो सकता है, जो डिलीवरी के कुछ दिन या हफ़्ते बाद भी शुरू हो सकता है। यह इमरजेंसी है।'],
    fl_clot: ['Pain or swelling in one calf, chest pain or breathlessness can mean a blood clot. The risk is higher in the weeks after birth. Do not wait.', 'एक पिंडली में दर्द या सूजन, सीने में दर्द या साँस फूलना ख़ून का थक्का (clot) हो सकता है। डिलीवरी के बाद के हफ़्तों में इसका ख़तरा ज़्यादा होता है। इंतज़ार न करें।'],
    fl_faint: ['Dizziness or fainting after birth can mean blood loss, even when you cannot see much bleeding.', 'डिलीवरी के बाद चक्कर या बेहोशी ख़ून बहने का संकेत हो सकता है, भले ही ज़्यादा ब्लीडिंग न दिखे।'],
    fl_harm: ['Call Tele-MANAS 14416 (free, any time) or 112 now, and ask someone to stay with you and the baby. You are not a bad mother. This is an illness, and it gets better with help.', 'अभी Tele-MANAS 14416 (मुफ़्त, कभी भी) या 112 पर कॉल करें, और किसी से कहें कि आपके और बच्चे के पास रहे। आप बुरी माँ नहीं हैं। यह एक बीमारी है, और मदद से ठीक होती है।'],
    fl_fever: ['A fever of 38°C (100.4°F) or more after birth can mean an infection in the womb, stitches, breast or urine. Go to your PHC, CHC or hospital today. Under JSSK this care is free at government hospitals.', 'डिलीवरी के बाद 38°C (100.4°F) या ज़्यादा बुख़ार बच्चेदानी, टाँकों, स्तन या पेशाब में infection का संकेत हो सकता है। आज ही PHC, CHC या अस्पताल जाएँ। सरकारी अस्पताल में JSSK के तहत यह इलाज मुफ़्त है।'],
    fl_mast: ['A painful red patch on the breast with fever or body aches can be mastitis. See a doctor today. Keep feeding from that side: the milk is safe for your baby.', 'स्तन पर दर्द वाला लाल हिस्सा, बुख़ार या बदन दर्द के साथ, mastitis (स्तन में सूजन) हो सकता है। आज ही डॉक्टर को दिखाएँ। उसी तरफ़ से दूध पिलाती रहें: दूध बच्चे के लिए सुरक्षित है।'],
    fl_smell: ['Bad-smelling discharge can mean an infection of the womb. See a doctor today, even if you feel well.', 'बदबूदार डिस्चार्ज बच्चेदानी के infection का संकेत हो सकता है। आज ही डॉक्टर को दिखाएँ, भले ही आप ठीक महसूस करें।'],
    fl_wound: ['Pus, a wound opening up, or redness and swelling around it: see a doctor today. Keep it clean and dry until then.', 'मवाद, घाव खुलना, या उसके आसपास लाली और सूजन: आज ही डॉक्टर को दिखाएँ। तब तक घाव साफ़ और सूखा रखें।'],
    fl_swell: ['Sudden swelling of the face or hands: get your BP checked today by your ANM or at the PHC. With a headache or blurred vision, call 112.', 'चेहरे या हाथों में अचानक सूजन: आज ही ANM से या PHC पर BP जँचवाएँ। साथ में सिरदर्द या धुंधला दिखे तो 112 पर कॉल करें।'], fl_swell_doc: ['Sudden swelling of the face or hands: get your BP checked today by your doctor, or the ANM or PHC. With a headache or blurred vision, call 112.', 'चेहरे या हाथों में अचानक सूजन: आज ही अपनी डॉक्टर से, या ANM या PHC पर BP जँचवाएँ। साथ में सिरदर्द या धुंधला दिखे तो 112 पर कॉल करें।'],
    fl_belly: ['Severe belly pain that does not go away: see a doctor today. With fever, fainting or heavy bleeding, call 112.', 'पेट में तेज़ दर्द जो ठीक न हो: आज ही डॉक्टर को दिखाएँ। साथ में बुख़ार, बेहोशी या ज़्यादा ब्लीडिंग हो तो 112 पर कॉल करें।'],
    fl_cantpee: ['Not able to pee, or only drops, with a full or painful lower belly: see a doctor today.', 'पेशाब नहीं हो रहा या बूँद-बूँद, और नीचे का पेट भरा या दर्द: आज ही डॉक्टर को दिखाएँ।'],
    fl_heavy: ['Bleeding heavier than a heavy period, or getting heavier again after it had slowed: see a doctor today. Soaking a pad in an hour: call 112.', 'भारी पीरियड से भी ज़्यादा ब्लीडिंग, या कम होने के बाद फिर बढ़ना: आज ही डॉक्टर को दिखाएँ। एक घंटे में पैड भीगे तो 112 पर कॉल करें।'],
    fl_redagain: ['Bright red bleeding again after it had turned brown: if it is heavy or keeps going, see a doctor today. Sometimes it is your period coming back.', 'भूरा होने के बाद फिर से चटक लाल ब्लीडिंग: ज़्यादा हो या रुके नहीं, तो आज ही डॉक्टर को दिखाएँ। कभी-कभी यह पीरियड लौटना होता है।'],
    fl_shiver: ['Feeling hot or shivery: check your temperature, or ask your ASHA or ANM to. Shivering with belly pain or bad-smelling discharge: see a doctor today.', 'गर्मी या कँपकँपी लग रही है: थर्मामीटर से बुख़ार नापें, या ASHA/ANM से नपवाएँ। कँपकँपी के साथ पेट दर्द या बदबूदार डिस्चार्ज हो तो आज ही डॉक्टर को दिखाएँ।'], fl_shiver_doc: ['Feeling hot or shivery: check your temperature. Shivering with belly pain or bad-smelling discharge: see a doctor today.', 'गर्मी या कँपकँपी लग रही है: थर्मामीटर से बुख़ार नापें। कँपकँपी के साथ पेट दर्द या बदबूदार डिस्चार्ज हो तो आज ही डॉक्टर को दिखाएँ।'],
    fl_redpatch: ['A painful red patch without fever: keep feeding often from that side, rest, and use a cool cloth after feeds. Not better in 12–24 hours, or a fever starts: see a doctor.', 'बिना बुख़ार के दर्द वाला लाल हिस्सा: उस तरफ़ से बार-बार दूध पिलाएँ, आराम करें, फ़ीड के बाद ठंडा कपड़ा रखें। 12–24 घंटे में ठीक न हो, या बुख़ार आए, तो डॉक्टर को दिखाएँ।'],
    tp_sore: ['Full, hard breasts around days 3–5 are common as the milk comes in. Feed often from both sides. If the breast is too hard for the baby to latch, express a little milk first.', 'दूध आने पर दिन 3–5 के आसपास स्तन भरे और सख़्त होना आम है। दोनों तरफ़ से बार-बार दूध पिलाएँ। स्तन इतना सख़्त हो कि बच्चा पकड़ न पाए, तो पहले थोड़ा दूध हाथ से निकाल लें।'],
    tp_wpain: ['Some pain around stitches or a wound is normal in the first 1–2 weeks and slowly gets less. Pain that is getting worse instead of better: see a doctor.', 'पहले 1–2 हफ़्ते टाँकों या घाव के आसपास थोड़ा दर्द सामान्य है और धीरे-धीरे कम होता है। दर्द कम होने के बजाय बढ़ रहा हो तो डॉक्टर को दिखाएँ।'],
    tp_burn: ['Burning when peeing: drink more water and see a doctor this week. With fever, shivering or back pain under the ribs, see a doctor today.', 'पेशाब में जलन: ज़्यादा पानी पिएँ और इसी हफ़्ते डॉक्टर को दिखाएँ। साथ में बुख़ार, कँपकँपी या पसलियों के नीचे पीठ में दर्द हो तो आज ही।'],
    tp_leak: ['Some leaking is common in the first weeks, and pelvic floor exercises help most women. Still leaking 3 months after the birth: see a doctor.', 'पहले हफ़्तों में थोड़ा लीक होना आम है, और पेल्विक फ़्लोर व्यायाम से ज़्यादातर महिलाओं को फ़ायदा होता है। डिलीवरी के 3 महीने बाद भी लीक हो तो डॉक्टर को दिखाएँ।'],
    tp_potty: ['Drink plenty of water, eat dal, vegetables, fruit and whole grains, and do not strain. No potty for 3 days, or a lot of pain: ask your ANM or doctor for something safe to soften it.', 'ख़ूब पानी पिएँ, दाल, सब्ज़ी, फल और साबुत अनाज खाएँ, और ज़ोर न लगाएँ। 3 दिन से पॉटी नहीं, या बहुत दर्द: ANM या डॉक्टर से पॉटी नरम करने की सुरक्षित दवा पूछें।'], tp_potty_doc: ['Drink plenty of water, eat dal, vegetables, fruit and whole grains, and do not strain. No potty for 3 days, or a lot of pain: ask your doctor for something safe to soften it.', 'ख़ूब पानी पिएँ, दाल, सब्ज़ी, फल और साबुत अनाज खाएँ, और ज़ोर न लगाएँ। 3 दिन से पॉटी नहीं, या बहुत दर्द: डॉक्टर से पॉटी नरम करने की सुरक्षित दवा पूछें।'],
    tp_mood: ['Feeling low, teary or worried in the first 2 weeks is common (baby blues). If it lasts longer than 2 weeks or is getting worse, talk to someone.', 'पहले 2 हफ़्ते उदासी, रोना या चिंता आम है (बेबी ब्लूज़)। 2 हफ़्ते से ज़्यादा रहे या बढ़ता जाए, तो किसी से बात करें।'],
    tp_sleep: ['Sleep when the baby sleeps, even for 20 minutes. Ask someone to settle the baby for one stretch so you can sleep 3–4 hours.', 'जब बच्चा सोए तब आप भी सोएँ, चाहे 20 मिनट ही। किसी से कहें कि एक बार बच्चे को संभाल ले ताकि आप 3–4 घंटे सो सकें।'],
    s_bleed: ['heavy bleeding', 'ज़्यादा ब्लीडिंग'], s_pe: ['headache, vision or fits', 'सिरदर्द, नज़र या दौरा'], s_clot: ['possible blood clot', 'ख़ून के थक्के की आशंका'], s_faint: ['dizziness or fainting', 'चक्कर या बेहोशी'], s_harm: ['thoughts of harm', 'नुक़सान के ख़याल'],
    s_fever: ['fever', 'बुख़ार'], s_mast: ['red breast with fever', 'बुख़ार के साथ लाल स्तन'], s_smell: ['bad-smelling discharge', 'बदबूदार डिस्चार्ज'], s_wound: ['stitches or wound', 'टाँके या घाव'], s_swell: ['swelling', 'सूजन'], s_belly: ['belly pain', 'पेट दर्द'], s_cantpee: ['not able to pee', 'पेशाब न होना'], s_heavy: ['heavy bleeding', 'ज़्यादा ब्लीडिंग'], s_redagain: ['red bleeding again', 'फिर से लाल ब्लीडिंग'],
    ok_none: ['Nothing you tapped needs a doctor today. Check again tomorrow, and use the warning signs at the top any time.', 'आपने जो टैप किया उसमें आज डॉक्टर की ज़रूरत वाली बात नहीं है। कल फिर जाँच करें, और ऊपर दिए ख़तरे के संकेत कभी भी देखें।'],
    r_tap: ['Tap your answers above. Warning signs will show here.', 'ऊपर अपने जवाब टैप करें। ख़तरे के संकेत यहाँ दिखेंगे।'],
    save_b: ["Save today's check", 'आज की जाँच सेव करें'], update_b: ["Update today's check", 'आज की जाँच अपडेट करें'],
    saved_t: ['Saved. Nothing here is scored.', 'सेव हो गई। यहाँ कोई score नहीं दिया जाता।'],
    hist_h: ['Your last checks', 'आपकी पिछली जाँचें'], hist_none: ['No checks saved yet.', 'अभी कोई जाँच सेव नहीं हुई।'],
    all_fine: ['No warning signs', 'कोई ख़तरे का संकेत नहीं'], warn_n: ['Warning signs: {n}', 'ख़तरे के संकेत: {n}'],
    h_bleed: ['Bleeding', 'ब्लीडिंग'],
    norm_h: ['What is normal: bleeding after birth', 'क्या सामान्य है: डिलीवरी के बाद ब्लीडिंग'],
    norm_1: ['Days 1–4: bright red, the heaviest days. Small clots can pass.', 'दिन 1–4: चटक लाल, सबसे ज़्यादा। छोटे थक्के निकल सकते हैं।'],
    norm_2: ['About days 4–10: less, pink or brown.', 'लगभग दिन 4–10: कम, गुलाबी या भूरा।'],
    norm_3: ['After that: yellowish-white or cream, slowly stopping, usually by 4–6 weeks. For some women it goes on longer.', 'उसके बाद: पीला-सफ़ेद या क्रीम रंग, धीरे-धीरे बंद, आमतौर पर 4–6 हफ़्ते तक। कुछ महिलाओं में ज़्यादा दिन चलता है।'],
    norm_4: ['Bleeding can increase a little during feeds or when you get up after resting. Use pads, not tampons or a cup, until your 6-week check.', 'दूध पिलाते समय या आराम के बाद उठने पर ब्लीडिंग थोड़ी बढ़ सकती है। 6 हफ़्ते की जाँच तक पैड इस्तेमाल करें, tampon या cup नहीं।'],
    norm_you: ['You are on day {n}.', 'आप दिन {n} पर हैं।'],
    self_h: ['Looking after yourself', 'अपना ख़याल'],
    self_1: ['Change pads often and wash your hands before and after. Wash stitches with plain water and pat dry.', 'पैड बार-बार बदलें और पहले-बाद हाथ धोएँ। टाँकों को सादे पानी से धोकर थपथपा कर सुखाएँ।'],
    self_2: ['Eat proper meals: dal, eggs or paneer, milk, green vegetables and fruit. Drink a glass of water every time you feed.', 'पूरा खाना खाएँ: दाल, अंडा या पनीर, दूध, हरी सब्ज़ियाँ और फल। हर बार दूध पिलाते समय एक गिलास पानी पिएँ।'],
    self_3: ['Walk a little every day as you feel able. Avoid lifting anything heavier than your baby for the first weeks, especially after a C-section.', 'जितना हो सके, रोज़ थोड़ा चलें। पहले हफ़्तों में बच्चे से भारी कुछ न उठाएँ, ख़ासकर ऑपरेशन के बाद।'],

    /* mood */
    m_h: ['Mood after birth', 'डिलीवरी के बाद मन'],
    m_p: ['Many mothers feel low after a baby. It is not weakness and not your fault. Here is what is common, and what needs help.', 'बच्चे के बाद बहुत सी माँएँ उदास महसूस करती हैं। यह कमज़ोरी नहीं है, और आपकी ग़लती नहीं है। यहाँ जानें क्या आम है, और कब मदद चाहिए।'],
    blues_h: ['Baby blues: common, passes within 2 weeks', 'बेबी ब्लूज़: आम, 2 हफ़्ते में चला जाता है'],
    blues_p: ['Starts a few days after the birth: crying easily, irritable, worried, up and down. Most mothers have some of this. It usually goes within 2 weeks of the birth. Rest, food and someone to talk to help.', 'डिलीवरी के कुछ दिन बाद शुरू होता है: बात-बात पर रोना, चिड़चिड़ापन, चिंता, मन ऊपर-नीचे। ज़्यादातर माँओं को ऐसा कुछ होता है। आमतौर पर डिलीवरी के 2 हफ़्ते के अंदर चला जाता है। आराम, खाना और बात करने वाला कोई साथ हो तो मदद मिलती है।'],
    ppd_h: ['Depression after birth: common and treatable', 'डिलीवरी के बाद डिप्रेशन: आम, और इलाज होता है'],
    ppd_p: ['Can start any time in the first year. Low or empty most days for more than 2 weeks, no interest in things, feeling guilty or useless, not sleeping even when the baby sleeps, not eating, not able to enjoy the baby. Talking therapy and, when needed, medicines that are safe with breastfeeding help most women.', 'पहले साल में कभी भी शुरू हो सकता है। 2 हफ़्ते से ज़्यादा, ज़्यादातर दिन उदासी या ख़ालीपन, किसी चीज़ में मन न लगना, ख़ुद को दोषी या बेकार समझना, बच्चा सोए तब भी नींद न आना, भूख न लगना, बच्चे के साथ ख़ुशी महसूस न होना। बातचीत वाली थेरेपी और ज़रूरत हो तो स्तनपान में सुरक्षित दवाओं से ज़्यादातर महिलाएँ ठीक हो जाती हैं।'],
    psy_h: ['Postpartum psychosis: rare, and an emergency', 'पोस्टपार्टम साइकोसिस: बहुत कम, पर इमरजेंसी'],
    psy_p: ['About 1 in 1,000 mothers. It usually starts suddenly in the first 2 weeks: hearing or seeing things that are not there, strange fixed beliefs, very high or very confused, not sleeping at all. She may not know she is ill, so family must act: call 112 or take her to hospital today. It is treatable.', 'लगभग 1,000 में से 1 माँ को। आमतौर पर पहले 2 हफ़्तों में अचानक शुरू होता है: ऐसी आवाज़ें सुनना या चीज़ें दिखना जो नहीं हैं, अजीब बातों पर पक्का यक़ीन, बहुत ज़्यादा जोश या बहुत उलझन, बिल्कुल नींद न आना। हो सकता है उन्हें ख़ुद पता न चले कि वे बीमार हैं, इसलिए परिवार को क़दम उठाना होगा: 112 पर कॉल करें या आज ही अस्पताल ले जाएँ। इसका इलाज होता है।'],
    q_h: ['Two questions about the last month', 'पिछले एक महीने के बारे में दो सवाल'],
    q_p: ['Doctors use these two questions. They are not a test and give no score. Your answers are not saved.', 'डॉक्टर ये दो सवाल पूछते हैं। यह कोई test नहीं है और इसका कोई score नहीं है। आपके जवाब सेव नहीं होते।'],
    q1: ['During the last month, have you often felt down, depressed or hopeless?', 'पिछले एक महीने में, क्या आप अक्सर उदास, निराश या नाउम्मीद महसूस करती रहीं?'],
    q2: ['During the last month, have you often had little interest or pleasure in doing things?', 'पिछले एक महीने में, क्या अक्सर किसी काम में मन या ख़ुशी कम लगी?'],
    q_yes_h: ['Please talk to someone soon', 'कृपया जल्दी किसी से बात करें'],
    q_yes_p: ['A yes to either question is a reason to talk to someone this week: your doctor, your ASHA or ANM, or Tele-MANAS 14416 (free, any time). It does not mean you are failing as a mother.', 'किसी भी सवाल का जवाब "हाँ" है, तो इसी हफ़्ते किसी से बात करें: अपनी डॉक्टर, ASHA या ANM, या Tele-MANAS 14416 (मुफ़्त, कभी भी)। इसका मतलब यह नहीं कि आप माँ के रूप में नाकाम हैं।'],
    q_no_p: ['Thank you. If this changes, or you feel low for more than 2 weeks, come back here or call Tele-MANAS 14416.', 'धन्यवाद। अगर यह बदले, या 2 हफ़्ते से ज़्यादा उदासी रहे, तो यहाँ लौटें या Tele-MANAS 14416 पर कॉल करें।'],
    q_wait: ['Answer both to see what to do next.', 'आगे क्या करें, यह देखने के लिए दोनों का जवाब दें।'],
    harm_h: ['Thoughts of harming yourself or your baby', 'ख़ुद को या बच्चे को नुक़सान पहुँचाने के ख़याल'],
    harm_p: ['Call Tele-MANAS 14416 or 112 now, and ask someone to stay with you. You can get better.', 'अभी Tele-MANAS 14416 या 112 पर कॉल करें, और किसी को अपने पास रहने को कहें। आप ठीक हो सकती हैं।'],
    tm_note: ["Tele-MANAS is the government's free mental health helpline, open 24×7.", 'Tele-MANAS सरकार की मुफ़्त मानसिक स्वास्थ्य हेल्पलाइन है, 24×7 खुली।'],
    help_h: ['What helps you', 'आपको किससे मदद मिलती है'],
    fam_h: ['For your husband and family', 'पति और परिवार के लिए'],
    m_ask_h: ['Talk it through with a Qura doctor', 'Qura की डॉक्टर से बात करें'],
    m_ask_p: ['She can help with sleep, food and routine, and refer you to a psychiatrist or gynaecologist when medicines are needed. Free 20-minute call.', 'वे नींद, खाना और दिनचर्या में मदद कर सकती हैं, और दवाओं की ज़रूरत हो तो मनोचिकित्सक या स्त्री-रोग विशेषज्ञ के पास भेजती हैं। मुफ़्त 20 मिनट की कॉल।'],
    m_topic: ['Mood after birth', 'डिलीवरी के बाद मन'],

    /* feeding */
    f_h: ['Breastfeeding', 'स्तनपान'],
    f_p: ['Feed often, day and night: 8–12 feeds in 24 hours is normal in the early weeks. The log helps you remember the last side.', 'दिन-रात बार-बार दूध पिलाएँ: शुरू के हफ़्तों में 24 घंटे में 8–12 बार सामान्य है। लॉग से याद रहता है कि पिछली बार कौन सी तरफ़ थी।'],
    log_h: ['Feed log', 'फ़ीड लॉग'],
    start_L: ['Start left', 'बाएँ से शुरू'], start_R: ['Start right', 'दाएँ से शुरू'],
    on_L: ['Feeding: left side', 'दूध: बाईं तरफ़'], on_R: ['Feeding: right side', 'दूध: दाईं तरफ़'],
    this_side: ['This side: {t}', 'इस तरफ़: {t}'],
    switch: ['Switch side', 'तरफ़ बदलें'], stop: ['Stop and save', 'रोकें और सेव करें'], discard: ['Discard this feed', 'यह फ़ीड हटा दें'],
    st_feeds: ['Feeds today', 'आज की फ़ीड'], st_mins: ['Minutes today', 'आज के मिनट'],
    last_side: ['Last side: {s} · {t}', 'पिछली तरफ़: {s} · {t}'],
    fuller: ['Start with the breast that feels fuller.', 'जो स्तन ज़्यादा भरा लगे, उससे शुरू करें।'],
    today_list: ["Today's feeds", 'आज की फ़ीड'], none_today: ['No feeds logged today yet.', 'आज अभी कोई फ़ीड लॉग नहीं हुई।'],
    quick: ['Forgot the timer? Add a feed', 'टाइमर भूल गईं? फ़ीड जोड़ें'], add_L: ['Add left', 'बायाँ जोड़ें'], add_R: ['Add right', 'दायाँ जोड़ें'],
    added: ['added', 'जोड़ी गई'], lt1: ['under 1 min', '1 मिनट से कम'],
    run_tally: ['Today so far: {n} feeds, {m} min', 'आज अब तक: {n} फ़ीड, {m} मिनट'],
    store_l: ['How long expressed milk keeps', 'निकाला हुआ दूध कितनी देर ठीक रहता है'],
    f_saved: ['Feed saved.', 'फ़ीड सेव हुई।'],
    tmp_note: ['Without a diary, the log works only for this visit.', 'डायरी के बिना लॉग सिर्फ़ इस बार के लिए चलता है।'],
    latch_h: ['A good latch, step by step', 'सही पकड़, एक-एक क़दम'],
    enough_h: ['Is baby getting enough?', 'क्या बच्चे को पूरा दूध मिल रहा है?'],
    sore_h: ['Sore or cracked nipples', 'निप्पल में दर्द या दरार'],
    eng_h: ['Full, hard breasts (engorgement)', 'भरे, सख़्त स्तन (engorgement)'],
    mast_h: ['Mastitis: when to see a doctor', 'Mastitis (स्तन में सूजन): कब डॉक्टर को दिखाएँ'],
    myth_h: ['Milk supply: myths and facts', 'दूध की मात्रा: मिथक और सच'],
    myth: ['Myth', 'मिथक'], fact: ['Fact', 'सच'],
    excl_h: ['Only breast milk for 6 months', '6 महीने तक सिर्फ़ माँ का दूध'],
    excl_until: ['For your baby: only breast milk until {d}.', 'आपके बच्चे के लिए: {d} तक सिर्फ़ माँ का दूध।'],
    expr_h: ['Expressing and storing milk', 'दूध निकालना और रखना'],
    work_h: ['Going back to work', 'काम पर लौटना'],
    maa_h: ['Free help: the MAA programme', 'मुफ़्त मदद: MAA कार्यक्रम'],
    baby_h: ['Take your baby to hospital now if', 'बच्चे को अभी अस्पताल ले जाएँ अगर'],
    f_ask_h: ['Feeding not going well?', 'दूध पिलाने में दिक़्क़त?'],
    f_ask_p: ['Your ASHA, ANM or the nurse at a government hospital can watch a feed for free. A Qura doctor can also talk it through on a free call.', 'आपकी ASHA, ANM या सरकारी अस्पताल की नर्स मुफ़्त में एक फ़ीड देखकर मदद कर सकती हैं। Qura की डॉक्टर भी मुफ़्त कॉल पर बात कर सकती हैं।'], f_ask_p_doc: ['A nurse at your hospital, your doctor, or your ASHA or ANM can watch a feed and help. A Qura doctor can also talk it through on a free call.', 'अस्पताल की नर्स, आपकी डॉक्टर, या ASHA या ANM एक फ़ीड देखकर मदद कर सकती हैं। Qura की डॉक्टर भी मुफ़्त कॉल पर बात कर सकती हैं।'],
    f_topic: ['Breastfeeding', 'स्तनपान'],

    /* contraception */
    c_h: ['Contraception after birth', 'डिलीवरी के बाद गर्भनिरोध'],
    c_p: ['You can get pregnant again before your first period comes back. Choose a method before you start having sex again.', 'पहला पीरियड लौटने से पहले भी आप फिर गर्भवती हो सकती हैं। दोबारा संबंध बनाने से पहले कोई तरीक़ा चुन लें।'],
    c_ret: ['If you are not fully breastfeeding, you can become fertile again within 4–6 weeks of the birth.', 'अगर आप सिर्फ़ स्तनपान नहीं करा रहीं, तो डिलीवरी के 4–6 हफ़्ते में ही फिर गर्भ ठहर सकता है।'],
    c_gap: ['Wait at least 2 years (24 months) before trying for the next baby. It is safer for you and for the next baby.', 'अगले बच्चे की कोशिश से पहले कम से कम 2 साल (24 महीने) रुकें। यह आपके और अगले बच्चे, दोनों के लिए ज़्यादा सुरक्षित है।'],
    lam_h: ['Breastfeeding method (LAM): only when all 3 are true', 'स्तनपान वाला तरीक़ा (LAM): तभी जब तीनों बातें सच हों'],
    lam_1: ['Your periods have not come back', 'आपके पीरियड वापस नहीं आए हैं'],
    lam_2: ['You give only breast milk (or nearly), often, day and night', 'आप सिर्फ़ (या लगभग सिर्फ़) माँ का दूध देती हैं, बार-बार, दिन-रात'],
    lam_3: ['Your baby is under 6 months', 'आपका बच्चा 6 महीने से छोटा है'],
    lam_until: ['LAM can protect you until {d} at the latest. The day any one of the 3 changes, start another method.', 'LAM ज़्यादा से ज़्यादा {d} तक बचा सकता है। जिस दिन तीनों में से कोई एक बदले, दूसरा तरीक़ा शुरू करें।'],
    lam_over: ['Your baby is over 6 months, so LAM no longer protects you. Use another method.', 'आपका बच्चा 6 महीने से बड़ा है, इसलिए LAM अब नहीं बचाता। कोई दूसरा तरीक़ा अपनाएँ।'],
    lam_more: ['More about LAM', 'LAM के बारे में और'],
    when_h: ['What you can start, and when', 'क्या और कब शुरू कर सकती हैं'],
    when_n: ['Worked out for day {n} after birth.', 'डिलीवरी के बाद दिन {n} के हिसाब से।'],
    when_none: ['Add the birth date on the After birth page to see your own dates.', 'अपनी तारीख़ें देखने के लिए "डिलीवरी के बाद" पेज पर जन्म की तारीख़ डालें।'],
    s_now: ['Can start now', 'अभी शुरू कर सकती हैं'], s_from: ['From {d}', '{d} से'], s_passed: ['48-hour window passed', '48 घंटे का समय निकल गया'],
    s_bf6: ['If breastfeeding: not before {d}', 'स्तनपान में: {d} से पहले नहीं'], s_ask: ['Ask your ANM when', 'ANM से पूछें कब'], s_ask_doc: ['Ask your doctor when', 'डॉक्टर से पूछें कब'],
    s_7d: ['Within 7 days of birth, or from {d}', 'जन्म के 7 दिन के अंदर, या {d} से'],
    free_c: ['All of these are free at government facilities. Your ASHA can bring condoms and pills home. Copper-T and Antara are given by a trained ANM, nurse or doctor; sterilisation by a doctor at a CHC or hospital.', 'ये सब सरकारी जगहों पर मुफ़्त हैं। ASHA कंडोम और गोलियाँ घर ला सकती हैं। Copper-T और अंतरा प्रशिक्षित ANM, नर्स या डॉक्टर लगाती हैं; नसबंदी CHC या अस्पताल में डॉक्टर करते हैं।'], free_c_doc: ['Your gynaecologist can give any of these. All are also free at government facilities, and your ASHA can bring condoms and pills home.', 'आपकी गायनेकोलॉजिस्ट इनमें से कोई भी तरीक़ा दे सकती हैं। ये सब सरकारी जगहों पर मुफ़्त भी हैं, और ASHA कंडोम और गोलियाँ घर ला सकती हैं।'],
    rx_c: ["Qura's doctors are BAMS doctors. They can talk through your options, but pills, the injection, Copper-T and sterilisation come from your ANM, a government facility or an MBBS gynaecologist. Qura refers you.", 'Qura की डॉक्टर BAMS हैं। वे आपके विकल्पों पर बात कर सकती हैं, पर गोलियाँ, इंजेक्शन, Copper-T और नसबंदी आपकी ANM, सरकारी अस्पताल या MBBS स्त्री-रोग विशेषज्ञ से मिलती हैं। Qura आपको वहाँ भेजती है।'], rx_c_doc: ['Qura\'s doctors are BAMS doctors. They can talk through your options, but pills, the injection, Copper-T and sterilisation come from an MBBS gynaecologist, your ANM or a government facility. Qura refers you.', 'Qura की डॉक्टर BAMS हैं। वे आपके विकल्पों पर बात कर सकती हैं, पर गोलियाँ, इंजेक्शन, Copper-T और नसबंदी MBBS स्त्री-रोग विशेषज्ञ, आपकी ANM या सरकारी अस्पताल से मिलती हैं। Qura आपको वहाँ भेजती है।'],
    compare: ['Compare all methods', 'सभी तरीक़ों की तुलना करें'],
    c_topic: ['Contraception after birth', 'डिलीवरी के बाद गर्भनिरोध'],
    c_intro: ['What is safe while breastfeeding, and when each method can start.', 'स्तनपान के दौरान क्या सुरक्षित है, और हर तरीक़ा कब शुरू हो सकता है।'],
    c_ask_h: ['Not sure which method suits you?', 'पक्का नहीं कि कौन सा तरीक़ा आपके लिए सही है?'],
    c_ask_p: ['A Qura doctor can talk through your options on a free call, and refer you to a gynaecologist or a government facility for the method you choose.', 'Qura की डॉक्टर मुफ़्त कॉल पर आपके विकल्पों पर बात कर सकती हैं, और चुने गए तरीक़े के लिए स्त्री-रोग विशेषज्ञ या सरकारी अस्पताल भेज सकती हैं।'],

    /* pelvic floor */
    pf_h: ['Pelvic floor trainer', 'पेल्विक फ़्लोर व्यायाम'],
    pf_p: ['These muscles hold up your bladder, womb and bowel. Pregnancy and birth stretch them. A few minutes a day helps stop leaks and heaviness. Start gently when it feels comfortable, even after stitches or a C-section.', 'ये मांसपेशियाँ मूत्राशय, बच्चेदानी और आँतों को सहारा देती हैं। गर्भ और डिलीवरी में ये खिंच जाती हैं। रोज़ कुछ मिनट का व्यायाम लीक होने और भारीपन से बचाता है। जब आराम लगे, धीरे-धीरे शुरू करें, टाँकों या ऑपरेशन के बाद भी।'],
    hold_l: ['Hold for', 'कितनी देर रोकें'], secs: ['{n} sec', '{n} सेकंड'],
    pf_start: ['Start a set: 10 squeezes', 'एक सेट शुरू करें: 10 बार'],
    ph_ready: ['Get ready', 'तैयार हो जाएँ'], ph_sq: ['Squeeze and lift', 'कसें और ऊपर खींचें'], ph_rel: ['Relax', 'ढीला छोड़ें'],
    rep: ['Squeeze {i} of {n}', '{n} में से {i}'],
    pf_pause: ['Pause', 'रोकें'], pf_resume: ['Resume', 'फिर शुरू करें'], pf_stop: ['Stop', 'बंद करें'],
    pf_paused: ['Paused', 'रुका हुआ'],
    pf_done: ['Set done: {n} of 3 today. Well done.', 'सेट पूरा: आज 3 में से {n}। बहुत अच्छा।'],
    pf_today: ['Today', 'आज'], pf_14: ['Last 14 days', 'पिछले 14 दिन'], pf_days: ['Done on {n} of the last 14 days', 'पिछले 14 में से {n} दिन किया'],
    pf_leave: ['Leaving this screen stops the timer. A set counts only when all 10 are done.', 'यह स्क्रीन छोड़ने पर टाइमर रुक जाता है। सेट तभी गिना जाता है जब पूरे 10 हों।'],
    pf_p_preg: ['Doing these in pregnancy lowers the chance of leaking urine late in pregnancy and after the birth. A few minutes a day, sitting or lying down. Stop and tell your doctor if they hurt.', 'प्रेग्नेंसी में ये करने से आख़िरी महीनों में और डिलीवरी के बाद पेशाब लीक होने की संभावना कम होती है। रोज़ कुछ मिनट, बैठकर या लेटकर। दर्द हो तो रुकें और डॉक्टर को बताएँ।'],
    pf_course: ['Your 3 months: day {d} of 90 · done on {n} days so far', 'आपके 3 महीने: 90 में से दिन {d} · अब तक {n} दिन किया'],
    pf_course_done: ['Past 3 months: done on {n} days. Keep a set a day to stay strong.', '3 महीने से ज़्यादा: {n} दिन किया। मज़बूत बने रहने के लिए रोज़ एक सेट करती रहें।'],
    pf_goal: ['Aim for 10 squeezes, 3 times a day. Over the weeks, build the hold up to 10 seconds. Add 10 quick squeezes after each set. Keep going every day for at least 3 months: that is how long the muscles take to get stronger.', 'लक्ष्य: 10 बार कसना, दिन में 3 बार। हफ़्तों में रोकने का समय 10 सेकंड तक बढ़ाएँ। हर सेट के बाद 10 बार जल्दी-जल्दी भी कसें।'],
    find_h: ['Find the right muscles', 'सही मांसपेशियाँ पहचानें'],
    gap_h: ['Belly gap check (diastasis)', 'पेट के बीच का गैप (diastasis)'],
    see_h: ['See a doctor if', 'डॉक्टर को दिखाएँ अगर'],
    prolapse: ['Heaviness or a bulge: what it can be', 'भारीपन या उभार: यह क्या हो सकता है'],
    pf_topic: ['Leaking or heaviness after birth', 'डिलीवरी के बाद लीक या भारीपन'],
    /* Version 39.56: the trainer with My pelvic floor plan */
    pf_p_any: ['These muscles hold up your bladder, womb and bowel. A few minutes a day, done the right way, helps stop leaks and eases heaviness. They take about 3 months to get stronger.', 'ये मांसपेशियाँ मूत्राशय, बच्चेदानी और आँतों को सहारा देती हैं। रोज़ कुछ मिनट, सही तरीक़े से, लीक रोकने और भारीपन कम करने में मदद करते हैं। इन्हें मज़बूत होने में लगभग 3 महीने लगते हैं।'],
    pf_topic2: ['Leaking urine or heaviness', 'पेशाब का रिसाव या भारीपन'],
    pf_lv: ['Level {n} of 8 · {p}', '8 में से लेवल {n} · {p}'],
    pf_lv_do: ['{r} squeezes: hold each {h} seconds, then let go as long', '{r} बार कसें: हर बार {h} सेकंड रोकें, फिर उतनी ही देर ढीला छोड़ें'],
    pf_lv_q: ['Then {q} quick squeezes: squeeze, let go', 'फिर {q} बार जल्दी-जल्दी: कसें, छोड़ें'],
    pf_pos_lie: ['lying on your back, knees bent', 'पीठ के बल लेटकर, घुटने मोड़कर'], pf_pos_sit: ['sitting on a chair, feet flat', 'कुर्सी पर बैठकर, पैर ज़मीन पर'],
    pf_pos_stand: ['standing, your back near a wall', 'खड़े होकर, पीठ दीवार के पास'], pf_pos_walk: ['standing, or walking slowly', 'खड़े होकर, या धीरे चलते हुए'],
    pf_next: ['Next level after {n} more days of sets', '{n} और दिन सेट करने के बाद अगला लेवल'], pf_next1: ['Next level after 1 more day of sets', '1 और दिन सेट करने के बाद अगला लेवल'],
    pf_top: ['The top level. Keep going: this keeps you strong.', 'सबसे ऊँचा लेवल। करती रहें: इससे आप मज़बूत बनी रहेंगी।'],
    pf_capped: ['Your sets stay lying down until a doctor says more is fine.', 'जब तक डॉक्टर आगे बढ़ने को न कहें, आपके सेट लेटकर ही रहेंगे।'],
    pf_back: ['Welcome back. One level back, to build up again.', 'फिर से स्वागत है। एक लेवल पीछे, ताकि ताक़त फिर से बने।'],
    pf_go: ['Start a set', 'एक सेट शुरू करें'], ph_qs: ['Quick squeeze', 'जल्दी कसें'], ph_qr: ['Let go', 'छोड़ें'], qrep: ['Quick squeeze {i} of {n}', 'जल्दी: {n} में से {i}'],
    pf_hurt: ['It hurts', 'दर्द हो रहा है'],
    pf_hurt_t: ['Stopped. If it hurts again, your plan moves to breathing and letting go.', 'रोक दिया। फिर दर्द हुआ, तो आपका प्लान साँस लेने और ढीला छोड़ने पर चला जाएगा।'],
    pf_hurt_t2: ['Your plan now has breathing and letting go instead of squeezes. See a doctor about the pain.', 'अब आपके प्लान में कसने की जगह साँस लेना और ढीला छोड़ना है। दर्द के लिए डॉक्टर को दिखाएँ।'],
    pf_knack: ['Try the knack today: squeeze before you cough, sneeze, laugh or lift.', 'आज तरकीब आज़माएँ: खाँसने, छींकने, हँसने या उठाने से पहले कसें।'],
    pf_done_m: ['Set done: {n} of {m} today. Well done.', 'सेट पूरा: आज {m} में से {n}। बहुत अच्छा।'],
    pf_leave2: ['Leaving this screen stops the timer. A set counts only when it is finished.', 'यह स्क्रीन छोड़ने पर टाइमर रुक जाता है। सेट तभी गिना जाता है जब वह पूरा हो।'],
    pf_relax_h: ['Breathe and let go', 'साँस लें और ढीला छोड़ें'],
    pf_relax_p: ['No squeezes for now. Breathe slowly into your belly and let the muscles down below soften. A doctor should check the pain.', 'अभी कसना नहीं है। पेट में धीरे साँस लें और नीचे की मांसपेशियों को ढीला होने दें। दर्द की जाँच डॉक्टर करें।'],
    pf_relax_b: ['Slow breaths with Dr. Megha', 'डॉ. मेघा के साथ धीमी साँसें'],

    /* check-ups */
    k_h: ["Check-ups and baby's vaccines", 'जाँच और बच्चे के टीके'],
    k_p: ['Free care for you and your baby, with dates worked out from the birth date.', 'आपके और बच्चे के लिए मुफ़्त देखभाल, जन्म की तारीख़ से निकाली गई तारीख़ों के साथ।'],
    asha_h: ['ASHA home visits', 'ASHA की घर पर विज़िट'],
    asha_p: ["Under the government's home-based newborn care, your ASHA visits on days 3, 7, 14, 21, 28 and 42 after a hospital birth, and also on day 1 after a home birth. Small or sick babies get extra visits. She checks you and the baby and helps with feeding.", 'सरकार की घर पर नवजात देखभाल (HBNC) में, अस्पताल में डिलीवरी के बाद ASHA दिन 3, 7, 14, 21, 28 और 42 को घर आती हैं, और घर पर डिलीवरी हुई हो तो दिन 1 को भी। छोटे या बीमार बच्चों के लिए ज़्यादा विज़िट होती हैं। वे आपकी और बच्चे की जाँच करती हैं और दूध पिलाने में मदद करती हैं।'],
    asha_later: ['After day 42 she visits again when your baby is 3, 6, 9, 12 and 15 months old.', 'दिन 42 के बाद, बच्चा 3, 6, 9, 12 और 15 महीने का होने पर वे फिर आती हैं।'],
    v_past: ['Past', 'बीत गई'], v_next: ['Next', 'अगली'], v_today: ['Today', 'आज'],
    day1_note: ['Day 1 is for home births.', 'दिन 1 घर पर डिलीवरी के लिए है।'],
    six_h: ['Your own check at 6 weeks', '6 हफ़्ते पर आपकी अपनी जाँच'],
    six_p: ['Around day 42 ({d}), get a check for yourself at your PHC, Ayushman Arogya Mandir or the hospital where you gave birth. Many mothers skip it. Please go.', 'लगभग दिन 42 ({d}) पर अपनी जाँच PHC, आयुष्मान आरोग्य मंदिर या जहाँ डिलीवरी हुई वहाँ करवाएँ। कई माँएँ यह छोड़ देती हैं। ज़रूर जाएँ।'],
    six_p0: ['Around 6 weeks after the birth, get a check for yourself at your PHC, Ayushman Arogya Mandir or the hospital where you gave birth. Many mothers skip it. Please go.', 'डिलीवरी के लगभग 6 हफ़्ते बाद अपनी जाँच PHC, आयुष्मान आरोग्य मंदिर या जहाँ डिलीवरी हुई वहाँ करवाएँ। कई माँएँ यह छोड़ देती हैं। ज़रूर जाएँ।'],
    six_list: ['What to ask for', 'क्या जँचवाएँ'],
    six_rem: ['Remind me of my 6-week check', 'मेरी 6 हफ़्ते की जाँच याद दिलाएँ'],
    six_on: ['Reminder set for {d}.', '{d} का रिमाइंडर लग गया।'],
    rem_off: ['Remove reminder', 'रिमाइंडर हटाएँ'],
    meds_h: ['Iron and calcium after birth', 'डिलीवरी के बाद आयरन और कैल्शियम'],
    meds_1: ['Iron-folic acid (IFA): one tablet a day for 180 days (6 months) after delivery, under Anemia Mukt Bharat. Free from your ASHA, Anganwadi or PHC.', 'आयरन-फ़ोलिक एसिड (IFA): डिलीवरी के बाद 180 दिन (6 महीने) तक रोज़ एक गोली, एनीमिया मुक्त भारत के तहत। ASHA, आंगनवाड़ी या PHC से मुफ़्त।'],
    meds_2: ['Calcium: keep taking the calcium tablets until 6 months after the birth, as your ANM or doctor gives them. Take them with meals, never at the same time as the iron tablet: calcium stops iron being absorbed.', 'कैल्शियम: डिलीवरी के 6 महीने बाद तक कैल्शियम की गोलियाँ लेती रहें, जैसे ANM या डॉक्टर दें। खाने के साथ लें, और आयरन की गोली के साथ कभी नहीं: कैल्शियम आयरन को शरीर में जाने से रोकता है।'],
    meds_3: ['Feeling very tired, breathless or pale? Ask for a haemoglobin (Hb) test; it is free at government facilities.', 'बहुत थकान, साँस फूलना या चेहरा पीला? हीमोग्लोबिन (Hb) की जाँच माँगें; सरकारी जगहों पर मुफ़्त है।'],
    /* Version 39.28: with a private doctor, or before she says where she goes (S.care) */
    k_p_doc: ['Check-ups for you and your baby, with dates worked out from the birth date.', 'आपकी और बच्चे की जाँचें, जन्म की तारीख़ से निकाली गई तारीख़ों के साथ।'],
    six_p_doc: ['Around day 42 ({d}), see your gynaecologist for a check for yourself, even if you feel well. Many mothers skip it. Please go.', 'लगभग दिन 42 ({d}) पर अपनी गायनेकोलॉजिस्ट से अपनी जाँच करवाएँ, भले आप ठीक महसूस करें। कई माँएँ यह छोड़ देती हैं। ज़रूर जाएँ।'],
    six_p0_doc: ['Around 6 weeks after the birth, see your gynaecologist for a check for yourself, even if you feel well. Many mothers skip it. Please go.', 'डिलीवरी के लगभग 6 हफ़्ते बाद अपनी गायनेकोलॉजिस्ट से अपनी जाँच करवाएँ, भले आप ठीक महसूस करें। कई माँएँ यह छोड़ देती हैं। ज़रूर जाएँ।'],
    vax_p_doc: ["Your baby's doctor gives each vaccine and writes it on the vaccination card. Dates are worked out from the birth date: follow the card.", 'बच्चे के डॉक्टर हर टीका लगाते हैं और उसे टीकाकरण कार्ड पर लिखते हैं। तारीख़ें जन्म की तारीख़ से निकाली गई हैं: कार्ड के हिसाब से चलें।'],
    vax_p0_doc: ["Your baby's doctor gives each vaccine and writes it on the vaccination card: follow the card.", 'बच्चे के डॉक्टर हर टीका लगाते हैं और उसे टीकाकरण कार्ड पर लिखते हैं: कार्ड के हिसाब से चलें।'],
    vax_free_doc: ['Vaccines in the national schedule are free at government centres (Universal Immunisation Programme).', 'राष्ट्रीय टीकाकरण सूची के टीके सरकारी केंद्रों पर मुफ़्त लगते हैं (सार्वभौमिक टीकाकरण कार्यक्रम)।'],
    vax_missed_doc: ["Missed a dose? Ask your baby's doctor what to give, and when.", 'कोई टीका छूट गया? बच्चे के डॉक्टर से पूछें कि कौन सा और कब लगाना है।'],
    meds_doc: ['Keep taking the iron and calcium your doctor prescribed, for as long as they said. Take calcium with meals, never at the same time as the iron tablet: calcium stops iron being absorbed.', 'डॉक्टर की लिखी आयरन और कैल्शियम की गोलियाँ, जितने समय के लिए कहा, लेती रहें। कैल्शियम खाने के साथ लें, और आयरन की गोली के साथ कभी नहीं: कैल्शियम आयरन को शरीर में जाने से रोकता है।'],
    meds_3_doc: ['Feeling very tired, breathless or pale? Ask your doctor for a haemoglobin (Hb) test.', 'बहुत थकान, साँस फूलना या चेहरा पीला? डॉक्टर से हीमोग्लोबिन (Hb) की जाँच के लिए कहें।'],
    asha_q_doc: ['Does an ASHA visit you? See her visit days', 'क्या ASHA आपके घर आती हैं? उनकी विज़िट के दिन देखें'],
    jssk: ['JSSK: treatment for problems after delivery, and for a sick baby up to 1 year, is free at government hospitals, including medicines, tests, blood and transport.', 'JSSK: डिलीवरी के बाद की परेशानियों का, और 1 साल तक के बीमार बच्चे का इलाज सरकारी अस्पताल में मुफ़्त है, जिसमें दवाएँ, जाँच, ख़ून और आने-जाने की गाड़ी शामिल हैं।'],
    vax_h: ["Baby's vaccines", 'बच्चे के टीके'],
    vax_p: ['Free under the Universal Immunisation Programme. Dates are worked out from the birth date. Your ANM writes each dose on the MCP card: follow the card and the vaccination days in your area.', 'सार्वभौमिक टीकाकरण कार्यक्रम (UIP) में मुफ़्त। तारीख़ें जन्म की तारीख़ से निकाली गई हैं। ANM हर टीका MCP कार्ड पर लिखती हैं: कार्ड और अपने इलाक़े के टीकाकरण दिवस के हिसाब से चलें।'],
    vax_p0: ['Free under the Universal Immunisation Programme. Your ANM writes each dose on the MCP card: follow the card and the vaccination days in your area.', 'सार्वभौमिक टीकाकरण कार्यक्रम (UIP) में मुफ़्त। ANM हर टीका MCP कार्ड पर लिखती हैं: कार्ड और अपने इलाक़े के टीकाकरण दिवस के हिसाब से चलें।'],
    vx_due: ['Due {d}', '{d} को'], vx_soon: ['Due this week: {d}', 'इसी हफ़्ते: {d}'], vx_today: ['Due today', 'आज'], vx_past: ['Should be done: check the MCP card', 'हो जाने चाहिए: MCP कार्ड देखें'], vx_past_doc: ['Should be done: check the vaccination card', 'हो जाने चाहिए: टीकाकरण कार्ड देखें'],
    vax_add: ['Add vaccine reminders', 'टीकों के रिमाइंडर जोड़ें'],
    vax_on: ['Vaccine reminders are on. They show on Today in the days before each one.', 'टीकों के रिमाइंडर चालू हैं। हर टीके से कुछ दिन पहले “आज” पर दिखेंगे।'],
    vax_off: ['Remove vaccine reminders', 'टीकों के रिमाइंडर हटाएँ'],
    vax_added_t: ['Vaccine reminders added.', 'टीकों के रिमाइंडर जुड़ गए।'],
    vax_missed: ['Missed a dose? Go to the next vaccination day; the ANM will tell you what to give.', 'कोई टीका छूट गया? अगले टीकाकरण दिवस पर जाएँ; ANM बताएँगी क्या लगाना है।'],
    vax_je: ['JE is given only in districts where it is common.', 'JE सिर्फ़ उन ज़िलों में लगता है जहाँ यह बीमारी ज़्यादा है।'],
    vax_later: ['Later: DPT booster at 5–6 years, and Td at 10 and 16 years.', 'बाद में: 5–6 साल पर DPT बूस्टर, और 10 व 16 साल पर Td।'],
    all_rem: ['All reminders', 'सभी रिमाइंडर'],

    /* home + summary */
    home_h: ['Day {n} after birth: how are you today?', 'डिलीवरी के बाद दिन {n}: आज आप कैसी हैं?'],
    home_h0: ['Day of birth: how are you today?', 'जन्म का दिन: आज आप कैसी हैं?'],
    home_s: ['A 1-minute check: bleeding, stitches, fever, breasts, mood', '1 मिनट की जाँच: ब्लीडिंग, टाँके, बुख़ार, स्तन, मन'],
    home_done: ['Done today. Tap to update.', 'आज हो गई। बदलने के लिए टैप करें।'],
    sum_h: ['After birth', 'डिलीवरी के बाद'],
    sum_day: ['Day {n} after birth (born {d})', 'डिलीवरी के बाद दिन {n} (जन्म {d})'],
    sum_checks: ['Recovery checks saved: {n} (last {d})', 'सेव की गई रिकवरी जाँचें: {n} (पिछली {d})'],
    sum_flags: ['Warning signs tapped: {f}', 'टैप किए गए ख़तरे के संकेत: {f}'],
    sum_noflags: ['No warning signs tapped', 'कोई ख़तरे का संकेत टैप नहीं हुआ'],
    sum_days: ['{n} d', '{n} दिन'],
    sum_feeds: ['Feeds today: {n} (started left {l}, right {r}), {m} min in all', 'आज की फ़ीड: {n} (बाएँ से शुरू {l}, दाएँ से {r}), कुल {m} मिनट'],
    sum_pf: ['Pelvic floor: {n} of the last 14 days', 'पेल्विक फ़्लोर: पिछले 14 में से {n} दिन'],
    sum_vax: ['Vaccine reminders on; next {v} on {d}', 'टीकों के रिमाइंडर चालू; अगला {v}, {d} को']
  };
  const strings = { en: {}, hi: {} };
  Object.keys(P).forEach((k) => { strings.en['post_' + k] = P[k][0]; strings.hi['post_' + k] = P[k][1]; });
  const T = (k) => t('post_' + k);
  const TF = (k, vars) => S.one(T(k), vars).replace(/\{(\w+)\}/g, (m, p) => (vars[p] != null ? vars[p] : m));

  /* ---------- guide content (bilingual objects) ---------- */
  const G = {
    /* Version 39.9 (diet audit 3.8): food after the birth (new lines, wording review 17.4) */
    food: [
      L('Keep water near you, and drink a glass at every feed.', 'पास में पानी रखें, और हर बार दूध पिलाते समय एक गिलास पानी पिएँ।'),
      L('Eat your meals: dal, milk or curd, eggs or paneer if you eat them, sabzi, and roti or rice. Your body needs a little more food than before.', 'अपना खाना पूरा खाएँ: दाल, दूध या दही, खाती हों तो अंडा या पनीर, सब्ज़ी, और रोटी या चावल। शरीर को पहले से थोड़ा ज़्यादा खाना चाहिए।'),
      L('Laddoos and panjiri are food too: have them in small helpings, not in place of a meal.', 'लड्डू और पंजीरी भी खाना हैं: थोड़ी मात्रा में लें, खाने की जगह नहीं।'),
      L("Don't cut out water, fruit or vegetables after the birth: your body needs them.", 'डिलीवरी के बाद पानी, फल या सब्ज़ी बंद न करें: शरीर को इनकी ज़रूरत है।'),
      L('Herbal powders, kadhas or supplements: ask your doctor first.', 'जड़ी-बूटी के पाउडर, काढ़े या सप्लीमेंट: पहले डॉक्टर से पूछें।')
    ],
    find: [
      L('Sit or lie comfortably with your knees slightly apart.', 'घुटने थोड़े खोलकर आराम से बैठें या लेटें।'),
      L('Squeeze as if you are stopping your wee and holding in wind at the same time. You should feel a lift inside.', 'ऐसे कसें जैसे पेशाब रोक रही हों और साथ में गैस भी रोक रही हों। अंदर की ओर ऊपर खिंचाव महसूस होना चाहिए।'),
      L("Keep breathing normally. Don't pull in your tummy, squeeze your bottom or press your thighs together.", 'साँस आम तरह से लेती रहें। पेट अंदर न खींचें, कूल्हे न कसें, जाँघें न दबाएँ।'),
      L("Don't practise by stopping your wee on the toilet. Just imagine it.", 'शौचालय में पेशाब रोककर अभ्यास न करें। बस कल्पना करें।')
    ],
    gap: [
      L('Lie on your back with your knees bent and feet flat on the floor.', 'पीठ के बल लेटें, घुटने मोड़ें और पैर ज़मीन पर सीधे रखें।'),
      L('Lift your head and shoulders slightly and look down at your tummy.', 'सिर और कंधे थोड़ा उठाएँ और पेट की ओर देखें।'),
      L('With your fingertips, feel between the two muscle edges above and below your belly button. Count how many fingers fit in the gap.', 'उँगलियों के सिरों से नाभि के ऊपर और नीचे दोनों मांसपेशियों के किनारों के बीच टटोलें। गिनें कि गैप में कितनी उँगलियाँ आती हैं।')
    ],
    gapNote: L('A gap of about 2 finger-widths is common after pregnancy and usually closes by the time your baby is 8 weeks old. Still an obvious gap at 8 weeks, or back pain: see a doctor; a physiotherapist can teach you exercises. Until then, avoid sit-ups, planks, heavy lifting and straining.', 'गर्भ के बाद लगभग 2 उँगली का गैप आम है और आमतौर पर बच्चे के 8 हफ़्ते का होने तक भर जाता है। 8 हफ़्ते पर भी साफ़ गैप हो, या पीठ में दर्द हो: डॉक्टर को दिखाएँ; फ़िज़ियोथेरेपिस्ट व्यायाम सिखा सकते हैं। तब तक sit-up, plank, भारी वज़न उठाना और ज़ोर लगाना न करें।'),
    see: [
      L('You still leak urine 3 months after the birth, even with daily exercises', 'डिलीवरी के 3 महीने बाद भी पेशाब लीक होता है, रोज़ व्यायाम के बाद भी'),
      L('You cannot control wind or potty', 'गैस या पॉटी पर क़ाबू नहीं रहता'),
      L('You feel a bulge, or a heavy, dragging feeling in the vagina', 'योनि में उभार, या भारी, नीचे खिंचने जैसा एहसास होता है')
    ],
    latch: [
      L('Sit or lie with your back supported. Hold your baby close, whole body facing you: ear, shoulder and hip in one line.', 'पीठ को सहारा देकर बैठें या लेटें। बच्चे को पास रखें, पूरा शरीर आपकी ओर: कान, कंधा और कूल्हा एक सीध में।'),
      L("Start with baby's nose opposite your nipple. Wait for a wide-open mouth, like a yawn.", 'बच्चे की नाक आपके निप्पल के सामने हो। मुँह पूरा खुलने का इंतज़ार करें, जैसे जम्हाई में।'),
      L('Bring baby to the breast, not the breast to baby. The chin touches the breast first.', 'बच्चे को स्तन तक लाएँ, स्तन को बच्चे तक नहीं। पहले ठुड्डी स्तन को छुए।'),
      L('Baby takes a big mouthful: more of the dark area shows above the top lip than below, and the lips are turned out.', 'बच्चा बड़ा मुँह भरकर पकड़े: ऊपर के होंठ के ऊपर काला हिस्सा नीचे से ज़्यादा दिखे, और होंठ बाहर की ओर मुड़े हों।'),
      L('Quick sucks change to slow, deep sucks with pauses, and you can hear or see swallowing.', 'जल्दी-जल्दी चूसना धीमे, गहरे चूसने में बदल जाए, बीच में रुककर, और निगलना सुनाई या दिखाई दे।'),
      L("It should not hurt after the first few sucks. If it does, slip your little finger into the corner of baby's mouth to break the suction, and try again.", 'पहले कुछ बार के बाद दर्द नहीं होना चाहिए। हो, तो छोटी उँगली बच्चे के मुँह के कोने में डालकर पकड़ छुड़ाएँ, और फिर से कोशिश करें।')
    ],
    enough: [
      L('8–12 feeds in 24 hours in the early weeks, including at night.', 'शुरू के हफ़्तों में 24 घंटे में 8–12 फ़ीड, रात में भी।'),
      L('From about day 5: 6 or more heavy wet nappies and soft yellow potty every day.', 'लगभग दिन 5 से: रोज़ 6 या ज़्यादा भारी गीले नैपी और नरम पीली पॉटी।'),
      LD('Baby seems content after most feeds and is back to birth weight by about 2 weeks. Your ANM or ASHA can weigh the baby.', 'ज़्यादातर फ़ीड के बाद बच्चा संतुष्ट लगे और लगभग 2 हफ़्ते तक जन्म के वज़न पर लौट आए। ANM या ASHA वज़न कर सकती हैं।', 'Baby seems content after most feeds and is back to birth weight by about 2 weeks. Your baby\'s doctor, or your ANM or ASHA, can weigh the baby.', 'ज़्यादातर फ़ीड के बाद बच्चा संतुष्ट लगे और लगभग 2 हफ़्ते तक जन्म के वज़न पर लौट आए। बच्चे के डॉक्टर, या ANM या ASHA वज़न कर सकती हैं।'),
      L('Fewer wet nappies, or a baby too sleepy to wake for feeds: see a doctor today.', 'गीले नैपी कम हों, या बच्चा इतना सुस्त हो कि फ़ीड के लिए न जागे: आज ही डॉक्टर को दिखाएँ।')
    ],
    sore: [
      LD('Soreness usually means the latch needs fixing. Ask your ASHA, ANM or a nurse to watch a feed early; it is quick to fix.', 'दर्द का मतलब आमतौर पर पकड़ ठीक करनी है। ASHA, ANM या नर्स से जल्दी एक फ़ीड देखने को कहें; यह जल्दी ठीक हो जाता है।', 'Soreness usually means the latch needs fixing. Ask a nurse at your hospital, your doctor, or your ASHA or ANM to watch a feed early; it is quick to fix.', 'दर्द का मतलब आमतौर पर पकड़ ठीक करनी है। अस्पताल की नर्स, अपनी डॉक्टर, या ASHA या ANM से जल्दी एक फ़ीड देखने को कहें; यह जल्दी ठीक हो जाता है।'),
      L("Keep feeding; don't stop. Start on the less sore side if it helps.", 'दूध पिलाना बंद न करें। आराम मिले तो कम दर्द वाली तरफ़ से शुरू करें।'),
      L('After a feed, dab a little breast milk on the nipple and let it air-dry. Wear a soft, well-fitting bra.', 'फ़ीड के बाद निप्पल पर थोड़ा अपना दूध लगाकर हवा में सूखने दें। नरम, सही नाप की ब्रा पहनें।'),
      L('Pain at every feed, or cracks that bleed: get help as soon as you can.', 'हर फ़ीड में दर्द, या दरार से ख़ून: जितनी जल्दी हो सके मदद लें।')
    ],
    eng: [
      L('Around days 3–5 the milk comes in and breasts can feel hard, hot and full. It settles in a day or two with frequent feeding.', 'दिन 3–5 के आसपास दूध उतरता है और स्तन सख़्त, गर्म और भरे लग सकते हैं। बार-बार दूध पिलाने से एक-दो दिन में ठीक हो जाता है।'),
      L("Feed often from both sides, day and night. Don't skip night feeds.", 'दोनों तरफ़ से बार-बार दूध पिलाएँ, दिन और रात। रात की फ़ीड न छोड़ें।'),
      L('If the breast is too hard for the baby to latch, hand-express a little milk first to soften the dark area.', 'स्तन इतना सख़्त हो कि बच्चा पकड़ न पाए, तो पहले हाथ से थोड़ा दूध निकालकर काले हिस्से को नरम करें।'),
      L('A warm shower or warm cloth for a minute or two before a feed can help milk flow. A cool cloth after feeds eases swelling.', 'फ़ीड से पहले एक-दो मिनट गुनगुना पानी या गर्म कपड़ा दूध बहने में मदद करता है। फ़ीड के बाद ठंडा कपड़ा सूजन कम करता है।')
    ],
    mastFlag: L('A painful, hot, red or swollen area on one breast, with fever, shivering or body aches: see a doctor today.', 'एक स्तन पर दर्द वाला, गर्म, लाल या सूजा हिस्सा, साथ में बुख़ार, कँपकँपी या बदन दर्द: आज ही डॉक्टर को दिखाएँ।'),
    mast: [
      L("Keep breastfeeding, also from that side. The milk is safe for your baby, and stopping suddenly makes it worse.", 'स्तनपान जारी रखें, उस तरफ़ से भी। दूध बच्चे के लिए सुरक्षित है, और अचानक बंद करने से हालत बिगड़ती है।'),
      L('No fever: rest, feed often, use a cool cloth and loose clothes. Not better in 12–24 hours: see a doctor.', 'बुख़ार नहीं: आराम करें, बार-बार दूध पिलाएँ, ठंडा कपड़ा रखें और ढीले कपड़े पहनें। 12–24 घंटे में ठीक न हो तो डॉक्टर को दिखाएँ।'),
      L('A lump that stays after the redness has gone: get it checked.', 'लाली जाने के बाद भी गाँठ रहे: जँचवाएँ।')
    ],
    myths: [
      [L('Baby wants to feed often, so my milk is not enough.', 'बच्चा बार-बार दूध माँगता है, इसलिए मेरा दूध कम है।'), L('Frequent feeding is normal, and it is what builds your supply. The more milk is taken out, the more your body makes.', 'बार-बार दूध पीना सामान्य है, और इसी से दूध बढ़ता है। जितना दूध निकलता है, शरीर उतना ज़्यादा बनाता है।')],
      [L('Ghee, laddoos, gond or methi make more milk.', 'घी, लड्डू, गोंद या मेथी से दूध बढ़ता है।'), L('They are food, and a new mother needs good food. But there is no good proof that any special food makes more milk. Frequent feeding and a good latch do.', 'ये खाना हैं, और नई माँ को अच्छा खाना चाहिए। पर किसी ख़ास खाने से दूध बढ़ने का पक्का सबूत नहीं है। बार-बार दूध पिलाना और सही पकड़ से बढ़ता है।')],
      [L('Small breasts make less milk.', 'छोटे स्तन में कम दूध बनता है।'), L('Breast size does not decide how much milk you make.', 'स्तन का आकार तय नहीं करता कि कितना दूध बनेगा।')],
      [L('The first yellow milk is dirty; throw it away.', 'पहला पीला दूध गंदा होता है; फेंक दें।'), L('This first milk (colostrum) is precious. It protects your baby from infections. Give all of it.', 'यह पहला दूध (कोलोस्ट्रम) बहुत क़ीमती है। यह बच्चे को infection से बचाता है। पूरा पिलाएँ।')],
      [L('Babies need water in the summer heat.', 'गर्मी में बच्चे को पानी चाहिए।'), L('Breast milk has all the water a baby needs, even in heat. Just feed more often.', 'माँ के दूध में बच्चे की ज़रूरत का सारा पानी होता है, गर्मी में भी। बस ज़्यादा बार दूध पिलाएँ।')],
      [L('A bottle top-up at night will help.', 'रात में बोतल से ऊपर का दूध देने से मदद मिलेगी।'), LD('Each bottle feed replaces a breastfeed and tells your body to make less. Ask your ANM or doctor before giving formula.', 'हर बोतल वाली फ़ीड एक स्तनपान की जगह लेती है और शरीर को कम दूध बनाने का संकेत देती है। फ़ॉर्मूला देने से पहले ANM या डॉक्टर से पूछें।', 'Each bottle feed replaces a breastfeed and tells your body to make less. Ask your baby\'s doctor before giving formula.', 'हर बोतल वाली फ़ीड एक स्तनपान की जगह लेती है और शरीर को कम दूध बनाने का संकेत देती है। फ़ॉर्मूला देने से पहले बच्चे के डॉक्टर से पूछें।')]
    ],
    excl: [
      L("Only breast milk for the first 6 months: no water, ghutti, honey, gripe water, tea, or cow's or goat's milk.", 'पहले 6 महीने सिर्फ़ माँ का दूध: न पानी, न घुट्टी, न शहद, न ग्राइप वॉटर, न चाय, न गाय या बकरी का दूध।'),
      L('Medicines, vitamin drops and ORS are fine when a health worker or doctor advises them.', 'दवा, विटामिन ड्रॉप और ORS ठीक हैं, जब स्वास्थ्य कार्यकर्ता या डॉक्टर बताएँ।'),
      L('Honey can carry germs that make babies under 1 year seriously ill.', 'शहद में ऐसे कीटाणु हो सकते हैं जो 1 साल से छोटे बच्चे को गंभीर रूप से बीमार कर दें।'),
      L('From 6 months, start soft home foods, and keep breastfeeding to 2 years or more.', '6 महीने से नरम घर का खाना शुरू करें, और 2 साल या उससे ज़्यादा तक स्तनपान जारी रखें।')
    ],
    expr: [
      L('Wash your hands. Hold a clean steel bowl or wide cup under the breast.', 'हाथ धोएँ। स्तन के नीचे साफ़ स्टील की कटोरी या चौड़ा कप रखें।'),
      L('Place your thumb and fingers in a C shape about 2–3 cm back from the nipple. Press back towards your chest, then gently squeeze together and release. Move round the breast.', 'अँगूठा और उँगलियाँ C के आकार में निप्पल से लगभग 2–3 सेमी पीछे रखें। छाती की ओर दबाएँ, फिर धीरे से दबाकर छोड़ें। स्तन के चारों ओर जगह बदलती रहें।'),
      L('Drops come first, then sprays. It gets easier with practice.', 'पहले बूँदें आती हैं, फिर धार। अभ्यास से आसान होता है।')
    ],
    store: [
      [L('Room, 25°C or cooler', 'कमरा, 25°C या ठंडा'), L('Up to 4 hours. Indian rooms are often hotter, so put it in the fridge straight away or use it sooner.', '4 घंटे तक। भारत में कमरे अक्सर ज़्यादा गर्म होते हैं, इसलिए तुरंत फ़्रिज में रखें या जल्दी इस्तेमाल करें।')],
      [L('Fridge, at the back (not the door)', 'फ़्रिज, पीछे की तरफ़ (दरवाज़े में नहीं)'), L('Up to 4 days.', '4 दिन तक।')],
      [L('Freezer', 'फ़्रीज़र'), L('About 6 months is best; up to 12 months is acceptable.', 'लगभग 6 महीने सबसे अच्छा; 12 महीने तक चल सकता है।')],
      [L('Left in the cup after a feed', 'फ़ीड के बाद कप में बचा दूध'), L('Use within 2 hours, then throw it away.', '2 घंटे में इस्तेमाल करें, फिर फेंक दें।')]
    ],
    storeNote: L('Label each container with the date. Thaw in the fridge overnight or in a bowl of warm water; never in a microwave or on the stove, and never refreeze. Feed it with a katori and spoon or a paladai, as hospitals teach, rather than a bottle.', 'हर डिब्बे पर तारीख़ लिखें। रात भर फ़्रिज में या गुनगुने पानी की कटोरी में पिघलाएँ; माइक्रोवेव या चूल्हे पर कभी नहीं, और दोबारा कभी न जमाएँ। बोतल के बजाय कटोरी-चम्मच या पलाडई से पिलाएँ, जैसा अस्पताल में सिखाते हैं।'),
    work: [
      L('If you work for an employer, the Code on Social Security, 2020 (which now covers maternity benefit) gives up to 26 weeks of paid maternity leave if you worked at least 80 days in the 12 months before the delivery. Up to 8 of those weeks can be before the birth.', 'अगर आप किसी नियोक्ता के यहाँ काम करती हैं, तो सामाजिक सुरक्षा संहिता, 2020 (जिसमें अब मातृत्व लाभ आता है) के तहत 26 हफ़्ते तक की वेतन वाली मातृत्व छुट्टी मिलती है, अगर डिलीवरी से पहले के 12 महीनों में आपने कम से कम 80 दिन काम किया हो। इनमें से 8 हफ़्ते तक डिलीवरी से पहले ले सकती हैं।'),
      L('Back at work, you get two nursing breaks a day until your child is 15 months old.', 'काम पर लौटने के बाद, बच्चे के 15 महीने का होने तक रोज़ दूध पिलाने के लिए दो ब्रेक मिलते हैं।'),
      L('Workplaces with 50 or more employees must have a crèche, or pay a crèche allowance, and let you visit 4 times a day.', '50 या ज़्यादा कर्मचारियों वाली जगह पर क्रेच होना ज़रूरी है, या क्रेच भत्ता देना होगा, और दिन में 4 बार वहाँ जाने देना होगा।'),
      L('Work from home is possible if the nature of the work allows it and your employer agrees.', 'काम की प्रकृति इजाज़त दे और नियोक्ता माने, तो घर से काम हो सकता है।'),
      L('Start expressing and storing milk 1–2 weeks before you go back, so whoever looks after the baby can cup-feed it.', 'काम पर लौटने से 1–2 हफ़्ते पहले दूध निकालकर रखना शुरू करें, ताकि जो बच्चे को संभाले वह कप से पिला सके।')
    ],
    workAsk: L('Ask HR for the exact rules where you work; some states and employers give more.', 'अपने दफ़्तर के HR से सही नियम पूछें; कुछ राज्य और नियोक्ता ज़्यादा भी देते हैं।'),
    maa: L("MAA (Mothers' Absolute Affection) is the Health Ministry's breastfeeding programme. Your ASHA holds mothers' meetings, and nurses at government hospitals are trained to help with latch and feeding problems. Ask early; it is free.", 'MAA (मदर्स एब्सोल्यूट अफ़ेक्शन) स्वास्थ्य मंत्रालय का स्तनपान कार्यक्रम है। ASHA माँओं की बैठक करती हैं, और सरकारी अस्पताल की नर्सें पकड़ और दूध पिलाने की दिक़्क़तों में मदद के लिए प्रशिक्षित हैं। जल्दी पूछें; यह मुफ़्त है।'),
    baby: [
      L('Not feeding, or too sleepy to feed', 'दूध नहीं पी रहा, या दूध पीने के लिए बहुत सुस्त'),
      L('Fast or difficult breathing, or the chest pulls in', 'तेज़ या मुश्किल से साँस, या छाती अंदर धँसती है'),
      L('Fever, or feels cold to touch', 'बुख़ार, या छूने पर ठंडा लगे'),
      L('Fits, or very floppy', 'दौरा, या बहुत ढीला पड़ जाए'),
      L('Yellow palms and soles, or yellow skin on the first day', 'हथेलियाँ और तलवे पीले, या पहले ही दिन त्वचा पीली')
    ],
    babyNote: L('Free ambulance 108 or 102. Treatment for a sick baby up to 1 year is free at government hospitals (JSSK).', 'मुफ़्त एम्बुलेंस 108 या 102। 1 साल तक के बीमार बच्चे का इलाज सरकारी अस्पताल में मुफ़्त है (JSSK)।'),
    help: [
      L('Sleep one longer stretch while someone else settles the baby.', 'एक बार लंबी नींद लें, जब कोई और बच्चे को संभाले।'),
      L('Eat regular meals, and drink water at every feed.', 'समय पर खाना खाएँ, और हर फ़ीड पर पानी पिएँ।'),
      L('Get some daylight and a short walk when you feel able.', 'जब हो सके, थोड़ी धूप लें और थोड़ा टहलें।'),
      LD('Tell one person how you really feel: your husband, mother, sister, a friend or your ASHA.', 'किसी एक को बताएँ कि आप सच में कैसा महसूस करती हैं: पति, माँ, बहन, सहेली या ASHA।', 'Tell one person how you really feel: your husband, mother, sister, a friend or your doctor.', 'किसी एक को बताएँ कि आप सच में कैसा महसूस करती हैं: पति, माँ, बहन, सहेली या अपनी डॉक्टर।'),
      L('Say yes to help. The housework can wait.', 'मदद के लिए हाँ कहें। घर का काम इंतज़ार कर सकता है।')
    ],
    fam: [
      L('Take over one night stretch: burp, change and settle the baby so she can sleep 3–4 hours in a row.', 'रात का एक हिस्सा आप संभालें: बच्चे को डकार दिलाएँ, नैपी बदलें, सुलाएँ, ताकि वह लगातार 3–4 घंटे सो सके।'),
      L('Bring her food and a glass of water every time she sits down to feed.', 'जब भी वह दूध पिलाने बैठे, उसके लिए खाना और एक गिलास पानी लाएँ।'),
      L('Do the housework and handle visitors. She needs rest more than guests do.', 'घर का काम करें और मेहमानों को संभालें। उसे मेहमानों से ज़्यादा आराम की ज़रूरत है।'),
      L("Don't compare her with other mothers or criticise how she feeds. Praise what she is doing.", 'उसकी तुलना दूसरी माँओं से न करें, न उसके दूध पिलाने पर टोकें। जो वह कर रही है उसकी तारीफ़ करें।'),
      L('Notice if she stops eating, sleeping or talking, or cries most days for 2 weeks. Go with her to the doctor, or call 14416 together.', 'ध्यान दें कि कहीं वह खाना, सोना या बात करना तो नहीं छोड़ रही, या 2 हफ़्ते से ज़्यादातर दिन रो रही है। उसके साथ डॉक्टर के पास जाएँ, या साथ मिलकर 14416 पर कॉल करें।'),
      L('If she says strange things, hears voices, or talks of harming herself or the baby: do not leave her alone, and call 112.', 'अगर वह अजीब बातें करे, आवाज़ें सुने, या ख़ुद को या बच्चे को नुक़सान पहुँचाने की बात करे: उसे अकेला न छोड़ें, और 112 पर कॉल करें।')
    ],
    six: [
      L('Blood pressure', 'BP (ब्लड प्रेशर)'),
      L('Bleeding, and your stitches or C-section wound', 'ब्लीडिंग, और टाँके या ऑपरेशन का घाव'),
      L('Breasts and how feeding is going', 'स्तन और दूध पिलाना कैसा चल रहा है'),
      L('Your mood and sleep', 'आपका मन और नींद'),
      L('A haemoglobin (Hb) test for anaemia', 'ख़ून की कमी के लिए हीमोग्लोबिन (Hb) जाँच'),
      L('Contraception', 'गर्भनिरोध'),
      L('Any leaking, pain during sex, or pain that has not settled', 'पेशाब लीक होना, संबंध के समय दर्द, या कोई दर्द जो ठीक न हुआ हो'),
      L('Had high sugar in pregnancy (gestational diabetes)? A 75 g sugar test now, then once a year', 'प्रेग्नेंसी में sugar बढ़ी थी (gestational diabetes)? अभी 75 g वाली sugar जाँच, फिर हर साल')
    ]
  };
  /* Universal Immunisation Programme schedule (PIB, March 2026). */
  const VAX = [
    { id: 'birth', d: 0, age: L('At birth', 'जन्म पर'), v: L('BCG, OPV-0 (polio drops), Hepatitis B birth dose', 'BCG, OPV-0 (पोलियो ड्रॉप), हेपेटाइटिस B का जन्म वाला टीका') },
    { id: '6w', d: 42, age: L('6 weeks', '6 हफ़्ते'), v: L('OPV-1, Pentavalent-1, Rotavirus-1, fIPV-1, PCV-1', 'OPV-1, पेंटावेलेंट-1, रोटावायरस-1, fIPV-1, PCV-1') },
    { id: '10w', d: 70, age: L('10 weeks', '10 हफ़्ते'), v: L('OPV-2, Pentavalent-2, Rotavirus-2', 'OPV-2, पेंटावेलेंट-2, रोटावायरस-2') },
    { id: '14w', d: 98, age: L('14 weeks', '14 हफ़्ते'), v: L('OPV-3, Pentavalent-3, fIPV-2, Rotavirus-3, PCV-2', 'OPV-3, पेंटावेलेंट-3, fIPV-2, रोटावायरस-3, PCV-2') },
    { id: '9m', m: 9, age: L('9–12 months', '9–12 महीने'), v: L('MR-1 (measles-rubella), fIPV-3, PCV booster, Vitamin A (1st dose), JE-1 in some districts', 'MR-1 (खसरा-रूबेला), fIPV-3, PCV बूस्टर, विटामिन A (पहली ख़ुराक), कुछ ज़िलों में JE-1') },   /* national schedule since 2023: fIPV-3 with MR-1 */
    { id: '16m', m: 16, age: L('16–24 months', '16–24 महीने'), v: L('MR-2, DPT booster-1, OPV booster, Vitamin A (2nd dose, then every 6 months until 5 years), JE-2 in some districts', 'MR-2, DPT बूस्टर-1, OPV बूस्टर, विटामिन A (दूसरी ख़ुराक, फिर 5 साल तक हर 6 महीने), कुछ ज़िलों में JE-2') }
  ];
  const ASHA_DAYS = [1, 3, 7, 14, 21, 28, 42];

  /* ---------- storage: saved only with a diary; browse mode keeps entries in memory for this visit ---------- */
  const TEMP = {};
  const fill = (d) => {
    if (!d.rec || typeof d.rec !== 'object') d.rec = {};
    if (!Array.isArray(d.feeds)) d.feeds = [];
    if (!d.pf || typeof d.pf !== 'object') d.pf = {};
    if (d.run && !(d.run.segs && d.run.segs.length)) d.run = null;
    return d;
  };
  const store = () => (S.canSave() ? fill(S.data('post')) : fill(TEMP));
  const persist = () => { if (S.canSave()) S.save(); };

  /* ---------- helpers ---------- */
  const okISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const todayISO = () => S.toISO(S.today());
  const sitBirth = () => { const sit = S.state.situation || {}; return okISO(sit.deliveredOn) && S.fromISO(sit.deliveredOn) <= S.today() ? sit.deliveredOn : null; };
  const birthISO = () => { const a = sitBirth(); if (a) return a; const st = store(); return okISO(st.birth) && S.fromISO(st.birth) <= S.today() ? st.birth : null; };
  const birth = () => { const b = birthISO(); return b ? S.fromISO(b) : null; };
  const dayN = () => { const b = birth(); return b ? S.diffDays(b, S.today()) : null; };
  const addMonths = S.addMonths;   /* kept inside the month: a baby born 31 May is 9 months old on 29 Feb, not 2 Mar */
  const dShort = (d) => S.fmtD(d, { day: 'numeric', month: 'short' });
  const dLong = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const loc = () => (S.langMeta(S.state.lang) || {}).locale || 'en-IN';
  const fmtTime = (ms) => { try { return new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date(ms)); } catch (e) { const d = new Date(ms); return S.pad2(d.getHours()) + ':' + S.pad2(d.getMinutes()); } };
  const clock = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h ? h + ':' : '') + S.pad2(m) + ':' + S.pad2(s); };
  const has = (r) => !!S.routeOwner(r) || S.modules.some((m) => Object.keys(m.prefixes || {}).some((p) => r.indexOf(p) === 0));
  const fi = (svg) => '<span class="pst-fi" aria-hidden="true">' + svg + '</span>';
  const chev = () => S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"');
  const li = (arr) => arr.map((x) => '<li>' + esc(tx(x)) + '</li>').join('');
  const vaxDate = (b, x) => (x.m ? addMonths(b, x.m) : S.addDays(b, x.d));
  const sideName = (s) => T('side_' + (s === 'R' ? 'R' : 'L'));
  const other = (s) => (s === 'R' ? 'L' : 'R');
  const ageText = (n) => { if (n === 1) return T('age_d1'); if (n < 14) return TF('age_d', { n: n }); if (n < 70) { const w = Math.floor(n / 7); return w === 1 ? T('age_w1') : TF('age_w', { w: w }); } return TF('age_m', { m: Math.floor(n / 30.4) }); };
  /* Version 39.27 (minimalism audit R07): a danger card's numbers are Call buttons that open the phone's dialer with the number
     filled in (she still presses call, so a mistaken tap is harmless); Copy stays, small, under them */
  const callRow = (ns, cls) => '<div class="pst-row pst-calls">' + ns.map((n) => '<a class="btn sm pst-call ' + (cls || '') + '" href="tel:' + n + '">' + esc(t('call_b')) + ' ' + n + '</a>').join('') + '</div>' +
    '<div class="pst-row pst-copies">' + ns.map((n) => '<button type="button" class="linkbtn pst-copy" data-pst-copy="' + n + '">' + esc(t('copy')) + ' ' + n + '</button>').join('') + '</div>';
  function wireCopy(v) {
    v.querySelectorAll('[data-pst-copy]').forEach((b) => { if (b._pst) return; b._pst = true; b.addEventListener('click', () => {
      const n = b.dataset.pstCopy; const done = () => S.toast(t('copied') + ' ' + n);
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(done, () => S.toast(n)); else S.toast(n); } catch (e) { S.toast(n); }
    }); });
  }
  function askCard(hKey, pKey, topicKey) {
    return '<div class="card soft"><h3>' + esc(T(hKey)) + '</h3><p class="small">' + esc(T(pKey)) + '</p><button type="button" class="btn sm secondary pst-self" data-ask="' + esc(T(topicKey)) + '">' + esc(t('ask_qura')) + '</button></div>';
  }
  function acc(title, inner, open, at) { return '<details class="pst-acc"' + (open ? ' open' : '') + (at ? ' data-at="' + at + '"' : '') + '><summary>' + esc(title) + '</summary><div class="pst-body">' + inner + '</div></details>'; }
  function related(cur) {
    const all = [[R.rec, 't_rec', 't_rec_s', S.I.check], [R.mood, 't_mood', 't_mood_s', S.I.heart], [R.feed, 't_feed', 't_feed_s', S.I.drop], [R.contra, 't_contra', 't_contra_s', S.I.pill], [R.pelvic, 't_pelvic', 't_pelvic_s', S.I.flower], [R.checks, 't_checks', 't_checks_s', S.I.bell]];
    const items = all.filter((x) => x[0] !== cur);
    return '<h2>' + esc(T('more')) + '</h2><div class="list">' + items.map((x) => '<button type="button" class="item" data-go="' + x[0] + '"><span class="ico-sm">' + x[3] + '</span><span class="body"><strong>' + esc(T(x[1])) + '</strong><span>' + esc(T(x[2])) + '</span></span></button>').join('') + '</div>';
  }

  /* birth-date card (hub and check-ups) */
  let editBirth = false;
  function birthCard() {
    const b = birth(); const fromSit = !!sitBirth();
    if (b && !editBirth) {
      return '<p class="small pst-bline">' + esc(TF('birth_on', { d: dLong(b) })) + (fromSit ? ' · <a href="#me" data-go="me">' + esc(T('from_me')) + '</a>' : ' · <button type="button" class="pst-link" id="pst-bedit">' + esc(T('change')) + '</button>') + '</p>';
    }
    const st = store();
    return '<div class="card"><h3>' + esc(T('nobirth_h')) + '</h3><p class="small">' + esc(T('nobirth_p')) + '</p><label for="pst-birth">' + esc(T('birth_l')) + '</label><div class="row"><input type="date" id="pst-birth" max="' + todayISO() + '" value="' + esc(okISO(st.birth) ? st.birth : '') + '"><button type="button" class="btn sm" id="pst-bset">' + esc(T('set')) + '</button></div></div>';
  }
  function wireBirth(v) {
    const e = v.querySelector('#pst-bedit'); if (e) e.addEventListener('click', () => { editBirth = true; S.render(); });
    const b = v.querySelector('#pst-bset');
    if (b) b.addEventListener('click', () => {
      const val = (v.querySelector('#pst-birth') || {}).value || '';
      if (!okISO(val) || S.fromISO(val) > S.today()) { S.toast(T('birth_bad')); return; }
      store().birth = val; if (S.birthOn) S.birthOn(val); sixSync(); persist(); editBirth = false; S.render();   /* review life-13: the birth ends the pregnancy, as the stage sheet's does */
    });
  }

  /* ---------- recovery: flags ---------- */
  const DANGER = ['soak', 'clots', 'head', 'vision', 'fits', 'calf', 'chest', 'breath', 'faint', 'smell', 'swell', 'belly', 'ill'];   /* ill: Version 39.46 */
  const GROUPS = [
    { g: 'bleed', label: 'g_bleed', opts: ['heavy', 'moderate', 'light', 'none'], pre: 'b_' },
    { g: 'colour', label: 'g_colour', opts: ['red', 'pink', 'brown', 'yellow'], pre: 'c_', when: (v) => v.bleed && v.bleed !== 'none' },
    { g: 'wtype', label: 'g_wtype', opts: ['stitch', 'csec', 'none'], pre: 'w_' },
    { g: 'wound', label: 'g_wound', opts: ['fine', 'pain', 'red', 'pus'], pre: 'wd_', when: (v) => v.wtype && v.wtype !== 'none' },
    { g: 'fever', label: 'g_fever', opts: ['no', 'high', 'shiver'], pre: 'f_' },
    { g: 'breast', label: 'g_breast', opts: ['fine', 'sore', 'red'], pre: 'br_' },
    { g: 'pee', label: 'g_pee', opts: ['fine', 'burn', 'leak', 'cant'], pre: 'pe_' },
    { g: 'potty', label: 'g_potty', opts: ['fine', 'hard', 'none'], pre: 'po_' },
    { g: 'mood', label: 'g_mood', opts: ['ok', 'low', 'anx', 'harm'], pre: 'mo_' },
    { g: 'sleep', label: 'g_sleep', opts: ['ok', 'some', 'poor'], pre: 'sl_' }
  ];
  /* Each flag: { g: group it belongs to, lvl: 'u' (112 now) | 'd' (doctor today) | 't' (tip), k: message key, s: short label key } */
  function flagsOf(v, n) {
    const out = []; const dg = v.danger || []; const on = (k) => dg.indexOf(k) >= 0; const add = (g, lvl, k, s) => out.push({ g: g, lvl: lvl, k: k, s: s });
    const fev = v.fever === 'high' || v.fever === 'shiver';
    if (on('soak') || on('clots')) add('danger', 'u', 'fl_bleed', 's_bleed');
    if (on('head') || on('vision') || on('fits')) add('danger', 'u', 'fl_pe', 's_pe');
    if (on('calf') || on('chest') || on('breath')) add('danger', 'u', 'fl_clot', 's_clot');
    if (on('faint')) add('danger', 'u', 'fl_faint', 's_faint');
    if (on('smell')) add('danger', 'd', 'fl_smell', 's_smell');
    if (on('swell') && !(on('head') || on('vision') || on('fits'))) add('danger', 'd', 'fl_swell', 's_swell');
    if (on('belly')) add('danger', 'd', 'fl_belly', 's_belly');
    if (on('ill')) add('danger', 'u', 'fl_ill', 's_ill');   /* Version 39.46: a serious infection after a birth (the 24 Oct review) */
    if (v.bleed === 'heavy' && !(on('soak') || on('clots'))) add('bleed', 'd', 'fl_heavy', 's_heavy');
    if (v.colour === 'red' && v.bleed && v.bleed !== 'none' && v.bleed !== 'heavy' && n != null && n > 14) add('colour', 'd', 'fl_redagain', 's_redagain');
    if (v.wtype && v.wtype !== 'none') { if (v.wound === 'pus' || v.wound === 'red') add('wound', 'd', 'fl_wound', 's_wound'); else if (v.wound === 'pain') add('wound', 't', 'tp_wpain'); }
    if (v.fever === 'high') add('fever', 'd', 'fl_fever', 's_fever'); else if (v.fever === 'shiver') add('fever', 't', 'fl_shiver');
    if (v.breast === 'red') { if (fev) add('breast', 'd', 'fl_mast', 's_mast'); else add('breast', 't', 'fl_redpatch'); } else if (v.breast === 'sore') add('breast', 't', 'tp_sore');
    if (v.pee === 'cant') add('pee', 'd', 'fl_cantpee', 's_cantpee'); else if (v.pee === 'burn') add('pee', 't', 'tp_burn'); else if (v.pee === 'leak') add('pee', 't', 'tp_leak');
    if (v.potty === 'hard' || v.potty === 'none') add('potty', 't', 'tp_potty');
    if (v.mood === 'harm') add('mood', 'u', 'fl_harm', 's_harm'); else if (v.mood === 'low' || v.mood === 'anx') add('mood', 't', 'tp_mood');
    if (v.sleep === 'poor') add('sleep', 't', 'tp_sleep');
    return out;
  }
  const TIP_LINK = { tp_sore: R.feed, fl_redpatch: R.feed, tp_leak: R.pelvic, tp_mood: R.mood };
  function inlineHtml(list) {
    return list.map((f) => {
      if (f.lvl === 'u') return '<div class="flag urgent pst-col"><strong>' + esc(T(f.k === 'fl_harm' ? 'fl_harm_h' : 'fl_112')) + '</strong><span>' + esc(T(f.k === 'fl_harm' && died() ? 'fl_harm_b' : f.k)) + '</span>' + callRow(f.k === 'fl_harm' ? ['112', '14416'] : ['112', '108'], 'pst-onDark') + '</div>';
      if (f.lvl === 'd') return '<div class="flag pst-col"><strong>' + esc(T('fl_today')) + '</strong><span>' + esc(T(f.k)) + '</span></div>';
      const go = TIP_LINK[f.k];
      return '<div class="pst-tip"><p>' + esc(T(f.k)) + '</p>' + (go ? '<button type="button" class="btn sm pst-self" data-go="' + go + '">' + esc(T(go === R.feed ? 't_feed' : (go === R.pelvic ? 't_pelvic' : 't_mood'))) + '</button>' : '') + '</div>';
    }).join('');
  }
  function answered(v) { return GROUPS.some((x) => v[x.g]) || (v.danger || []).length > 0; }
  function summaryHtml(v, n) {
    const fl = flagsOf(v, n); const U = fl.filter((f) => f.lvl === 'u'), D = fl.filter((f) => f.lvl === 'd');
    let h = '';
    if (U.length) h += '<div class="flag urgent pst-col"><strong>' + esc(T('fl_112')) + '</strong><span>' + esc(T('for_label')) + ' ' + esc(U.map((f) => T(f.s)).join(', ')) + '</span>' + callRow(['112', '108'].concat(U.some((f) => f.k === 'fl_harm') ? ['14416'] : []), 'pst-onDark') + '</div>';
    if (D.length) h += '<div class="flag pst-col"><strong>' + esc(T('fl_today')) + '</strong><span>' + esc(T('for_label')) + ' ' + esc(D.map((f) => T(f.s)).join(', ')) + '</span></div>';
    if (!U.length && !D.length) h += answered(v) ? '<div class="flag ok">' + fi(S.I.check) + '<span class="pst-ft">' + esc(T('ok_none')) + '</span></div>' : '<p class="small">' + esc(T('r_tap')) + '</p>';
    return h;
  }

  /* ---------- recovery screen ---------- */
  let draft = null;
  function getDraft(st) {
    const k = todayISO();
    if (!draft || draft.date !== k || draft.st !== st) draft = { date: k, st: st, v: JSON.parse(JSON.stringify(st.rec[k] || { danger: [] })) };
    if (!Array.isArray(draft.v.danger)) draft.v.danger = [];
    return draft;
  }
  function renderRec(v) {
    stopAll();
    const st = store(); const n = dayN(); const dr = getDraft(st); const val = dr.v; const exists = !!st.rec[dr.date];
    const chip = (g, o, label, on) => '<button type="button" class="chip' + (on ? ' on' : '') + '" data-pst-g="' + g + '" data-pst-v="' + o + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>';
    const dangerGrp = '<div class="pst-grp" data-grp="danger"><div class="pst-lbl">' + esc(T('g_danger')) + '</div><div class="chips">' + chip('danger', 'none', T('d_none'), val.danger.indexOf('none') >= 0) + DANGER.map((k) => chip('danger', k, T('d_' + k), val.danger.indexOf(k) >= 0)).join('') + '</div><div class="pst-inl" data-inl="danger"></div></div>';
    const grps = GROUPS.map((x) => '<div class="pst-grp" data-grp="' + x.g + '"' + (x.when && !x.when(val) ? ' hidden' : '') + '><div class="pst-lbl">' + esc(T(x.label)) + '</div><div class="chips">' + x.opts.map((o) => chip(x.g, o, T(x.pre + o + (x.g === 'mood' && o === 'harm' && died() ? '_b' : '')), val[x.g] === o)).join('') + '</div><div class="pst-inl" data-inl="' + x.g + '"></div></div>').join('');
    const hist = Object.keys(st.rec).sort().reverse().slice(0, 7);
    const histHtml = '<div class="card"><h3>' + esc(T('hist_h')) + '</h3>' + (hist.length ? '<div class="stack">' + hist.map((k) => {
      const e = st.rec[k]; const fl = flagsOf(e, birth() ? S.diffDays(birth(), S.fromISO(k)) : null).filter((f) => f.lvl !== 't');
      const bits = []; if (e.bleed) bits.push(T('h_bleed') + ': ' + T('b_' + e.bleed) + (e.colour && e.bleed !== 'none' ? ', ' + T('c_' + e.colour).toLowerCase() : ''));
      return '<div class="pst-hist"><span class="body"><strong>' + esc(S.fmtD(S.fromISO(k), { weekday: 'short', day: 'numeric', month: 'short' })) + ' · ' + esc(fl.length ? TF('warn_n', { n: fl.length }) : T('all_fine')) + '</strong><span>' + esc(bits.join(' · ')) + '</span></span><button type="button" class="pst-x" data-pst-rdel="' + k + '" aria-label="' + esc(T('remove')) + '" title="' + esc(T('remove')) + '">' + X_SVG + '</button></div>';
    }).join('') + '</div>' : '<p class="small">' + esc(T('hist_none')) + '</p>') + '</div>';
    const stage = n == null ? -1 : (n < 4 ? 0 : (n < 10 ? 1 : (n <= 42 ? 2 : 3)));
    const norm = '<div class="card"><h3>' + esc(T('norm_h')) + '</h3><ul class="pst-norm">' + ['norm_1', 'norm_2', 'norm_3'].map((k, i) => '<li class="' + (i === stage ? 'on' : '') + '"><span class="sw pst-sw' + i + '"></span><span>' + esc(T(k)) + '</span></li>').join('') + '</ul>' + (n != null ? '<p class="small"><strong>' + esc(TF('norm_you', { n: n })) + '</strong></p>' : '') + '<p class="small">' + esc(T('norm_4')) + '</p></div>';
    const self = '<div class="card soft"><h3>' + esc(T('self_h')) + '</h3><ul class="small pst-ul">' + ['self_1', 'self_2', 'self_3'].map((k) => '<li>' + esc(T(k + (k !== 'self_1' && died() ? 'b' : ''))) + '</li>').join('') + '</ul></div>';
    v.innerHTML = S.backRow(T('r_h'), R.hub, true) + '<p class="small">' + esc(T('r_p')) + '</p>' +
      '<p class="eyebrow">' + esc(n != null ? TF('r_forn', { d: dShort(S.today()), n: n }) : TF('r_for', { d: dShort(S.today()) })) + '</p>' +
      '<div class="card pst-form" data-nofold="1">' + dangerGrp + grps + '</div>' +   /* Version 32: never folded, so no warning sign hides behind "Show more" (field-test audit 2.4) */
      '<div id="pst-rsum" class="stack"></div>' +
      (S.canSave() ? '<button type="button" class="btn primary block" id="pst-rsave">' + esc(exists ? T('update_b') : T('save_b')) + '</button>' : S.needDiary()) +
      (S.canSave() ? histHtml : '') + norm + self + related(R.rec) + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v); wireCopy(v);
    const refresh = () => {
      const fl = flagsOf(val, n);
      v.querySelectorAll('[data-inl]').forEach((el) => { el.innerHTML = inlineHtml(fl.filter((f) => f.g === el.dataset.inl)); S.wire(el); wireCopy(el); });
      GROUPS.forEach((x) => { if (x.when) { const el = v.querySelector('[data-grp="' + x.g + '"]'); if (el) el.hidden = !x.when(val); } });
      const sm = v.querySelector('#pst-rsum'); sm.innerHTML = summaryHtml(val, n); wireCopy(sm);
    };
    v.querySelectorAll('[data-pst-g]').forEach((b) => b.addEventListener('click', () => {
      const g = b.dataset.pstG, o = b.dataset.pstV;
      if (g === 'danger') {
        let d = val.danger.slice();
        if (o === 'none') d = d.indexOf('none') >= 0 ? [] : ['none'];
        else { d = d.filter((x) => x !== 'none'); const i = d.indexOf(o); if (i >= 0) d.splice(i, 1); else d.push(o); }
        val.danger = d;
        v.querySelectorAll('[data-pst-g="danger"]').forEach((x) => { const on = d.indexOf(x.dataset.pstV) >= 0; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      } else {
        val[g] = val[g] === o ? null : o; if (!val[g]) delete val[g];
        v.querySelectorAll('[data-pst-g="' + g + '"]').forEach((x) => { const on = val[g] === x.dataset.pstV; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      }
      refresh();
    }));
    refresh();
    const sv = v.querySelector('#pst-rsave');
    if (sv) sv.addEventListener('click', () => {
      const rec = {}; GROUPS.forEach((x) => { if (val[x.g] && (!x.when || x.when(val))) rec[x.g] = val[x.g]; }); rec.danger = val.danger.slice();
      const nw = new Date(); rec.at = S.pad2(nw.getHours()) + ':' + S.pad2(nw.getMinutes());   /* Version 39.46: when she saved it */
      st.rec[dr.date] = rec; persist(); draft = null; S.toast(T('saved_t')); S.render();
    });
    v.querySelectorAll('[data-pst-rdel]').forEach((b) => b.addEventListener('click', () => { delete st.rec[b.dataset.pstRdel]; if (b.dataset.pstRdel === dr.date) draft = null; persist(); S.render(); }));
  }

  /* ---------- mood screen ---------- */
  let moodQ = { q1: null, q2: null };
  function renderMood(v) {
    stopAll();
    const yn = (q) => '<div class="grid2">' + [['yes', 'yes'], ['no', 'no']].map((x) => '<button type="button" class="btn sm' + (moodQ[q] === x[0] ? ' on' : '') + '" data-pst-q="' + q + '" data-pst-a="' + x[0] + '" aria-pressed="' + (moodQ[q] === x[0] ? 'true' : 'false') + '">' + esc(t(x[1])) + '</button>').join('') + '</div>';
    let res = '';
    const anyYes = moodQ.q1 === 'yes' || moodQ.q2 === 'yes';
    if (anyYes) res = '<div class="flag pst-col"><strong>' + esc(T('q_yes_h')) + '</strong><span>' + esc(T('q_yes_p')) + '</span>' + callRow(['14416'], 'pst-onLight') + '</div>';
    else if (moodQ.q1 === 'no' && moodQ.q2 === 'no') res = '<div class="flag ok">' + fi(S.I.check) + '<span class="pst-ft">' + esc(T('q_no_p')) + '</span></div>';
    else res = '<p class="small">' + esc(T('q_wait')) + '</p>';
    v.innerHTML = S.backRow(T('m_h'), R.hub, true) + '<p class="small">' + esc(T('m_p')) + '</p>' +
      '<div class="flag urgent pst-col"><strong>' + esc(T('harm_h')) + '</strong><span>' + esc(T('harm_p')) + '</span>' + callRow(['14416', '112'], 'pst-onDark') + '</div>' +
      '<div class="card"><h3>' + esc(T('q_h')) + '</h3><p class="small">' + esc(T('q_p')) + '</p><p class="pst-q">' + esc(T('q1')) + '</p>' + yn('q1') + '<p class="pst-q">' + esc(T('q2')) + '</p>' + yn('q2') + '<div id="pst-qres">' + res + '</div></div>' +
      '<div class="card"><div class="row"><span class="pill ok">1</span><h3>' + esc(T('blues_h')) + '</h3></div><p class="small pst-txt">' + esc(T('blues_p')) + '</p></div>' +
      '<div class="card"><div class="row"><span class="pill">2</span><h3>' + esc(T('ppd_h')) + '</h3></div><p class="small pst-txt">' + esc(T('ppd_p')) + '</p></div>' +
      '<div class="card warn"><div class="row"><span class="pill accent">3</span><h3>' + esc(T('psy_h')) + '</h3></div><p class="small pst-txt">' + esc(T('psy_p')) + '</p></div>' +
      '<div class="card"><h3>' + esc(T('help_h')) + '</h3><ul class="pst-ul">' + li(G.help) + '</ul></div>' +
      '<div class="card"><h3>' + esc(T('fam_h')) + '</h3><ul class="pst-ul">' + li(G.fam) + '</ul></div>' +
      '<p class="small">' + esc(T('tm_note')) + '</p>' +
      askCard('m_ask_h', 'm_ask_p', 'm_topic') + related(R.mood) + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v); wireCopy(v);
    v.querySelectorAll('[data-pst-q]').forEach((b) => b.addEventListener('click', () => { const q = b.dataset.pstQ; moodQ[q] = moodQ[q] === b.dataset.pstA ? null : b.dataset.pstA; const y = window.scrollY; S.render(); window.scrollTo(0, y); }));
  }

  /* ---------- feeding ---------- */
  let feedTick = null;
  const stopFeedTick = () => { if (feedTick) { clearInterval(feedTick); feedTick = null; } };
  const sessMin = (f) => Math.max(0, Math.round((f.e - f.s) / 60000));
  const todayFeeds = (st) => { const mid = S.today().getTime(); return st.feeds.filter((f) => f.s >= mid || f.e >= mid); };   /* 23:50 to 00:25 is today's feed too */
  const lastSeg = (st) => { if (st.run && st.run.segs.length) { const g = st.run.segs[st.run.segs.length - 1]; return { side: g.side, at: g.s, live: true }; } const a = st.feeds.slice().sort((x, y) => x.s - y.s); const f = a[a.length - 1]; if (!f) return null; const sg = f.segs || []; const g = sg[sg.length - 1]; return g ? { side: g.side, at: f.e } : null; };
  function finishFeed(st) {
    if (!st.run) return; const now = Date.now(); const segs = st.run.segs.map((g) => ({ side: g.side, s: g.s, e: g.e || now }));
    st.feeds.push({ s: segs[0].s, e: now, segs: segs }); st.run = null;
    const cut = now - 30 * 86400000; st.feeds = st.feeds.filter((f) => f.s >= cut);
  }
  function renderFeed(v) {
    stopAll();
    if (died()) { v.innerHTML = S.backRow(T('t_feed'), R.hub, false) + '<div class="card"><p>' + esc(T('lost_feed')) + '</p><button type="button" class="btn sm" data-go="' + R.rec + '">' + esc(T('lost_back')) + '</button></div>'; S.wire(v); return; }   /* Version 39.46 */
    const st = store(); const run = st.run; const tf = todayFeeds(st); const mins = tf.reduce((a, f) => a + sessMin(f), 0); const ls = lastSeg(st);
    let log = '';
    if (run) {
      const cur = run.segs[run.segs.length - 1];
      log = '<div class="card pst-center"><div class="eyebrow">' + esc(T('on_' + cur.side)) + '</div><div class="bigtimer" id="pst-ft">' + clock((Date.now() - run.segs[0].s) / 1000) + '</div><p class="small" id="pst-ft2">' + esc(TF('this_side', { t: clock((Date.now() - cur.s) / 1000) })) + '</p>' +
        '<div class="grid2 pst-full"><button type="button" class="btn secondary" id="pst-fsw">' + esc(T('switch')) + '</button><button type="button" class="btn primary" id="pst-fstop">' + esc(T('stop')) + '</button></div><button type="button" class="btn ghost sm" id="pst-fdisc">' + esc(T('discard')) + '</button><p class="small">' + esc(TF('run_tally', { n: tf.length, m: mins })) + '</p></div>';
    } else {
      log = '<div class="card"><div class="row spread"><h3>' + esc(T('log_h')) + '</h3>' + (ls ? '<span class="pill muted">' + esc(TF('last_side', { s: sideName(ls.side), t: fmtTime(ls.at) })) + '</span>' : '') + '</div>' +
        '<div class="statgrid"><div class="stat"><b class="num">' + tf.length + '</b><span>' + esc(T('st_feeds')) + '</span></div><div class="stat"><b class="num">' + mins + '</b><span>' + esc(T('st_mins')) + '</span></div></div>' +
        '<div class="grid2"><button type="button" class="btn secondary pst-side" data-pst-start="L">' + esc(T('start_L')) + '</button><button type="button" class="btn secondary pst-side" data-pst-start="R">' + esc(T('start_R')) + '</button></div><p class="small">' + esc(T('fuller')) + '</p>' +
        '<details><summary>' + esc(T('quick')) + '</summary><div class="grid2 pst-mt"><button type="button" class="btn sm" data-pst-add="L">' + esc(T('add_L')) + '</button><button type="button" class="btn sm" data-pst-add="R">' + esc(T('add_R')) + '</button></div></details></div>';
    }
    const list = tf.slice().sort((a, b) => b.s - a.s);
    const listHtml = '<div class="card"><h3>' + esc(T('today_list')) + '</h3>' + (list.length ? '<div class="stack">' + list.map((f) => '<div class="pst-hist"><span class="body"><strong>' + esc(fmtTime(f.s)) + ' · ' + esc((f.segs || []).map((g) => sideName(g.side)).join(' → ')) + '</strong><span>' + esc(f.quick ? T('added') : (f.e - f.s < 60000 ? T('lt1') : sessMin(f) + ' ' + T('min'))) + '</span></span><button type="button" class="pst-x" data-pst-fdel="' + f.s + '" aria-label="' + esc(T('remove')) + '" title="' + esc(T('remove')) + '">' + X_SVG + '</button></div>').join('') + '</div>' : '<p class="small">' + esc(T('none_today')) + '</p>') + '</div>';
    const myths = '<dl class="pst-myth">' + G.myths.map((m) => '<dt><span class="pill muted">' + esc(T('myth')) + '</span> ' + esc(tx(m[0])) + '</dt><dd><span class="pill ok">' + esc(T('fact')) + '</span> ' + esc(tx(m[1])) + '</dd>').join('') + '</dl>';
    const store6 = '<dl class="kv pst-kv">' + G.store.map((x) => '<dt>' + esc(tx(x[0])) + '</dt><dd>' + esc(tx(x[1])) + '</dd>').join('') + '</dl>';
    const b = birth(); const six = b ? addMonths(b, 6) : null;
    v.innerHTML = S.backRow(T('f_h'), R.hub, false) + '<p class="small">' + esc(T('f_p')) + '</p>' + log + (S.canSave() ? '' : '<p class="small">' + esc(T('tmp_note')) + '</p>' + S.needDiary()) + listHtml +
      '<div class="flag urgent pst-col"><strong>' + esc(T('baby_h')) + '</strong><ul class="pst-ul">' + li(G.baby) + '</ul><span>' + esc(tx(G.babyNote)) + '</span>' + callRow(['108', '102', '112'], 'pst-onDark') + '</div>' +
      acc(T('latch_h'), '<ol class="steps">' + li(G.latch) + '</ol>', true) +
      acc(T('bf_food_h'), '<ul class="pst-ul">' + li(G.food) + '</ul>' + (S.routeOwner && S.routeOwner('periods-fasting') ? '<button type="button" class="btn sm" data-go="periods-fasting">' + esc(T('bf_fast')) + '</button>' : ''), true, 'bf-food') +   /* Version 39.9; the plan's food step opens here (V39.9 review FOOD-02) */
      acc(T('enough_h'), '<ul class="pst-ul">' + li(G.enough) + '</ul>') +
      acc(T('sore_h'), '<ul class="pst-ul">' + li(G.sore) + '</ul>') +
      acc(T('eng_h'), '<ul class="pst-ul">' + li(G.eng) + '</ul>') +
      acc(T('mast_h'), '<div class="flag">' + fi(S.I.help) + '<span class="pst-ft">' + esc(tx(G.mastFlag)) + '</span></div><ul class="pst-ul">' + li(G.mast) + '</ul>') +
      acc(T('myth_h'), myths) +
      acc(T('excl_h'), '<ul class="pst-ul">' + li(G.excl) + '</ul>' + (six && S.today() < six ? '<p class="small"><strong>' + esc(TF('excl_until', { d: dLong(six) })) + '</strong></p>' : '')) +
      acc(T('expr_h'), '<ol class="steps">' + li(G.expr) + '</ol><div class="pst-lbl">' + esc(T('store_l')) + '</div>' + store6 + '<p class="small">' + esc(tx(G.storeNote)) + '</p>') +
      acc(T('work_h'), '<ul class="pst-ul">' + li(G.work) + '</ul><p class="small">' + esc(tx(G.workAsk)) + '</p>' + (has('access-schemes-post') ? '<button type="button" class="btn sm pst-self" data-go="access-schemes-post">' + esc(T('schemes')) + '</button>' : '')) +
      acc(T('maa_h'), '<p>' + esc(tx(G.maa)) + '</p>') +
      askCard('f_ask_h', 'f_ask_p', 'f_topic') + related(R.feed) + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v); wireCopy(v);
    v.querySelectorAll('[data-pst-start]').forEach((x) => x.addEventListener('click', () => { const st2 = store(); st2.run = { segs: [{ side: x.dataset.pstStart, s: Date.now() }] }; persist(); S.render(); }));
    v.querySelectorAll('[data-pst-add]').forEach((x) => x.addEventListener('click', () => { const st2 = store(); const now = Date.now(); st2.feeds.push({ s: now, e: now, quick: true, segs: [{ side: x.dataset.pstAdd, s: now, e: now }] }); persist(); S.toast(T('f_saved')); S.render(); }));
    v.querySelectorAll('[data-pst-fdel]').forEach((x) => x.addEventListener('click', () => { const s = Number(x.dataset.pstFdel); const st2 = store(); st2.feeds = st2.feeds.filter((f) => f.s !== s); persist(); S.render(); }));
    const sw = v.querySelector('#pst-fsw'); if (sw) sw.addEventListener('click', () => { const st2 = store(); if (!st2.run) return; const now = Date.now(); const cur = st2.run.segs[st2.run.segs.length - 1]; cur.e = now; st2.run.segs.push({ side: other(cur.side), s: now }); persist(); S.render(); });
    const sp = v.querySelector('#pst-fstop'); if (sp) sp.addEventListener('click', () => { const st2 = store(); finishFeed(st2); persist(); S.toast(T('f_saved')); S.render(); });
    const dc = v.querySelector('#pst-fdisc'); if (dc) dc.addEventListener('click', () => { const st2 = store(); st2.run = null; persist(); S.render(); });
    if (run) feedTick = setInterval(() => {
      const st2 = store(); const a = document.getElementById('pst-ft'), c = document.getElementById('pst-ft2');
      if (!st2.run || !a) { stopFeedTick(); return; }
      const cur = st2.run.segs[st2.run.segs.length - 1]; a.textContent = clock((Date.now() - st2.run.segs[0].s) / 1000); if (c) c.textContent = TF('this_side', { t: clock((Date.now() - cur.s) / 1000) });
    }, 1000);
  }

  /* ---------- contraception after birth ---------- */
  function renderContra(v) {
    stopAll();
    const b = birth(); const n = dayN(); const bf = (S.state.situation || {}).breastfeeding !== false;
    const pillNow = '<span class="pill ok">' + esc(T('s_now')) + '</span>';
    const pillFrom = (d) => (S.today() >= d ? pillNow : '<span class="pill">' + esc(TF('s_from', { d: dShort(d) })) + '</span>');
    const six = b ? S.addDays(b, 42) : null;
    const M = [
      { r: 'contra-m-condom', name: L('Condoms', 'कंडोम'), when: LD('Any time, from the first time you have sex again. Free from your ASHA.', 'जब भी दोबारा संबंध बनाएँ, पहली बार से ही। ASHA से मुफ़्त।', 'Any time, from the first time you have sex again. Any chemist sells them; free from your ASHA.', 'जब भी दोबारा संबंध बनाएँ, पहली बार से ही। किसी भी केमिस्ट पर मिलते हैं; ASHA से मुफ़्त।'), st: () => pillNow },
      { r: 'contra-m-cut', name: L('Copper-T (IUCD)', 'Copper-T (IUCD)'), when: L('Within 48 hours of delivery (PPIUCD), including during a C-section, or any time from 6 weeks after the birth. Safe while breastfeeding; works for years and comes out whenever you want.', 'डिलीवरी के 48 घंटे के अंदर (PPIUCD), ऑपरेशन के दौरान भी, या डिलीवरी के 6 हफ़्ते बाद कभी भी। स्तनपान में सुरक्षित; सालों तक काम करता है और जब चाहें निकलवा सकती हैं।'), st: () => (n == null ? '' : (n <= 2 ? pillNow : (S.today() >= six ? pillNow : '<span class="pill muted">' + esc(T('s_passed')) + '</span> <span class="pill">' + esc(TF('s_from', { d: dShort(six) })) + '</span>'))) },
      { r: 'contra-m-chhaya', name: L('Chhaya (weekly pill)', 'छाया (हफ़्ते में एक गोली)'), when: L('No hormones, and safe while breastfeeding. Can start soon after birth, when you feel ready.', 'हॉर्मोन वाली नहीं, और स्तनपान में सुरक्षित। डिलीवरी के बाद जल्दी, जब आप तैयार हों, शुरू कर सकती हैं।'), st: () => pillNow },
      { r: 'contra-m-pop', name: L('Progestin-only pill (POP)', 'प्रोजेस्टिन वाली गोली (POP)'), when: L("A daily pill with no oestrogen, safe while breastfeeding. India's pill manual allows starting before 6 weeks; many doctors start it at 6 weeks. Your ANM or doctor decides.", 'रोज़ की गोली जिसमें estrogen नहीं, स्तनपान में सुरक्षित। भारत की गोली वाली गाइड 6 हफ़्ते से पहले शुरू करने की इजाज़त देती है; कई डॉक्टर 6 हफ़्ते पर शुरू करते हैं। आपकी ANM या डॉक्टर तय करेंगी।'), st: () => '<span class="pill">' + esc(T('s_ask')) + '</span>' },
      { r: 'contra-m-antara', name: L('Antara injection', 'अंतरा इंजेक्शन'), when: L('One injection every 3 months. From 6 weeks after the birth if you breastfeed; earlier if you do not.', 'हर 3 महीने में एक इंजेक्शन। स्तनपान करा रही हैं तो डिलीवरी के 6 हफ़्ते बाद से; नहीं करा रहीं तो पहले भी।'), st: () => (six ? (bf ? pillFrom(six) : pillNow) : '') },
      { r: 'contra-m-pill', name: L('Combined pill (Mala-N)', 'मिली-जुली गोली (माला-N)'), when: L("Not while you breastfeed a baby under 6 months; India's pill manual says to use another method until then. If you are not breastfeeding: from 3 weeks after the birth, or 6 weeks if you have extra risk of clots.", '6 महीने से छोटे बच्चे को स्तनपान कराते समय नहीं; भारत की गोली वाली गाइड कहती है कि तब तक कोई दूसरा तरीक़ा अपनाएँ। स्तनपान नहीं करा रहीं तो: डिलीवरी के 3 हफ़्ते बाद से, या ख़ून के थक्के का ज़्यादा ख़तरा हो तो 6 हफ़्ते बाद से।'), st: () => { if (!b) return ''; if (!bf) return pillFrom(S.addDays(b, 21)); const m6 = addMonths(b, 6); return S.today() >= m6 ? pillNow : '<span class="pill muted">' + esc(TF('s_bf6', { d: dShort(m6) })) + '</span>'; } },
      { r: 'contra-m-tubectomy', name: L('Tubectomy (female sterilisation)', 'महिला नसबंदी'), when: L('Permanent. Within 7 days of delivery, or from 6 weeks after the birth. Free at government hospitals.', 'स्थायी। डिलीवरी के 7 दिन के अंदर, या 6 हफ़्ते बाद से। सरकारी अस्पताल में मुफ़्त।'), st: () => (n == null ? '' : (n <= 7 ? pillNow : pillFrom(six))) },
      { r: 'contra-m-nsv', name: L('NSV for your husband', 'पति की NSV'), when: L('Permanent, any time. No cut and no stitches; simpler and safer than tubectomy. Use another method for the first 3 months after it.', 'स्थायी, कभी भी। न चीरा, न टाँके; महिला नसबंदी से आसान और सुरक्षित। इसके बाद पहले 3 महीने कोई दूसरा तरीक़ा भी इस्तेमाल करें।'), st: () => pillNow }
    ];
    const row = (m) => { const go = has(m.r); const st = m.st(); const inner = '<span class="body"><strong>' + esc(tx(m.name)) + '</strong><span>' + esc(tx(m.when)) + '</span>' + (st ? '<span class="pst-pills">' + st + '</span>' : '') + '</span>' + (go ? '<span class="pst-chev">' + chev() + '</span>' : '');
      return go ? '<button type="button" class="item" data-go="' + m.r + '">' + inner + '</button>' : '<div class="item">' + inner + '</div>'; };
    let lam = '<div class="card"><h3>' + esc(T('lam_h')) + '</h3><ol class="steps">' + ['lam_1', 'lam_2', 'lam_3'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ol>';
    if (b) { const m6 = addMonths(b, 6); lam += S.today() < m6 ? '<div class="flag">' + fi(S.I.clock) + '<span class="pst-ft">' + esc(TF('lam_until', { d: dLong(m6) })) + '</span></div>' : '<div class="flag">' + fi(S.I.clock) + '<span class="pst-ft">' + esc(T('lam_over')) + '</span></div>'; }
    if (has('contra-m-lam')) lam += '<button type="button" class="btn sm pst-self" data-go="contra-m-lam">' + esc(T('lam_more')) + '</button>';
    lam += '</div>';
    v.innerHTML = S.backRow(T('c_h'), R.hub, false) + '<p class="small">' + esc(T('c_intro')) + '</p>' +
      '<div class="card warn"><p style="color:var(--fg)"><strong>' + esc(T('c_p')) + '</strong></p><p class="small">' + esc(T('c_ret')) + '</p><p class="small">' + esc(T('c_gap')) + '</p></div>' +
      lam +
      '<h2>' + esc(T('when_h')) + '</h2><p class="small">' + esc(n != null ? TF('when_n', { n: n }) : T('when_none')) + '</p>' + (n == null ? '<button type="button" class="btn sm pst-self" data-go="' + R.hub + '">' + esc(T('birth_go')) + '</button>' : '') +
      '<div class="list">' + M.map(row).join('') + '</div>' +
      '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('free_c')) + '</p><p class="small">' + esc(T('rx_c')) + '</p>' + (has('contra-chooser') ? '<button type="button" class="btn sm pst-self" data-go="contra-chooser">' + esc(T('compare')) + '</button>' : '') + '</div>' +
      askCard('c_ask_h', 'c_ask_p', 'c_topic') + related(R.contra) + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v);
  }

  /* ---------- pelvic floor trainer ---------- */
  let PF = null; let pfTick = null; let pfDone = null;
  const stopPfTick = () => { if (pfTick) { clearInterval(pfTick); pfTick = null; } };
  /* A new owner (Delete everything, a sample, a restore) starts with no answers, drafts or running timers. */
  if (S.onOwnerChange) S.onOwnerChange(() => { stopAll(); editBirth = false; draft = null; moodQ = { q1: null, q2: null }; PF = null; pfDone = null; });
  const pfSets = (st, iso) => Number(st.pf[iso] || 0);
  function pfDaysDone(st, k) { let c = 0; for (let i = 0; i < k; i++) if (pfSets(st, S.toISO(S.addDays(S.today(), -i))) > 0) c++; return c; }
  function pfPhaseLabel() { return PF.phase === 'ready' ? T('ph_ready') : (PF.phase === 'sq' ? T('ph_sq') : (PF.phase === 'qs' ? T('ph_qs') : (PF.phase === 'qr' ? T('ph_qr') : T('ph_rel')))); }
  function pfPaint() {
    const ph = document.getElementById('pst-pph'), sec = document.getElementById('pst-psec'), rep = document.getElementById('pst-prep'), bar = document.getElementById('pst-pbar');
    if (!PF || !ph) return false;
    const left = PF.paused ? PF.left : Math.max(0, PF.end - Date.now()); const tot = PF.phase === 'ready' ? 3000 : (PF.phase === 'qs' ? 1000 : (PF.phase === 'qr' ? 2000 : PF.hold * 1000));
    const q = PF.phase === 'qs' || PF.phase === 'qr';   /* Version 39.56: the quick squeezes after the holds */
    ph.textContent = PF.paused ? T('pf_paused') + ' · ' + pfPhaseLabel() : pfPhaseLabel(); ph.dataset.phase = PF.phase === 'qs' ? 'sq' : PF.phase;
    sec.textContent = String(Math.ceil(left / 1000)); rep.textContent = q ? TF('qrep', { i: PF.qi, n: PF.quick }) : TF('rep', { i: PF.i, n: PF.reps });
    bar.style.width = (PF.phase === 'sq' || PF.phase === 'qs' ? Math.round((1 - left / tot) * 100) : (PF.phase === 'rel' || PF.phase === 'qr' ? Math.round((left / tot) * 100) : 0)) + '%';
    return true;
  }
  /* Version 39.56 (decision 6): a soft tone as each squeeze starts and as she lets go, for her plan's sets (no words) */
  let pfAc = null;
  const pfTone = (hz, ms) => { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; pfAc = pfAc || new C(); if (pfAc.state === 'suspended' && pfAc.resume) pfAc.resume();
    const o = pfAc.createOscillator(), g = pfAc.createGain(), t0 = pfAc.currentTime; o.type = 'sine'; o.frequency.value = hz; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    o.connect(g); g.connect(pfAc.destination); o.start(t0); o.stop(t0 + ms / 1000 + 0.05); } catch (e) { /* no sound on this phone */ } };
  const pfCue = (up, quick) => { if (PF && PF.plan) pfTone(up ? 660 : 440, quick ? 80 : 160); };
  const pfWake = () => { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; pfAc = pfAc || new C(); if (pfAc.state === 'suspended' && pfAc.resume) pfAc.resume(); } catch (e) { /* no sound on this phone */ } };
  document.addEventListener('click', (e) => { const b = e.target && e.target.closest ? e.target.closest('[data-today-nav], [data-pl-play], [data-go="post-pelvic"]') : null; if (b && pfPlan()) pfWake(); }, true);   /* the tap that lets the phone play her tones */
  function pfStep() {
    if (!PF || PF.paused) return;
    if (Date.now() < PF.end) { if (!pfPaint()) stopPfTick(); return; }
    const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* optional */ } };
    if (PF.phase === 'ready') { PF.phase = 'sq'; PF.end = Date.now() + PF.hold * 1000; buzz(40); pfCue(true); }
    else if (PF.phase === 'sq') { PF.phase = 'rel'; PF.end = Date.now() + PF.hold * 1000; buzz(15); pfCue(false); }
    else if (PF.phase === 'rel' && PF.i < PF.reps) { PF.i += 1; PF.phase = 'sq'; PF.end = Date.now() + PF.hold * 1000; buzz(40); pfCue(true); }
    else if ((PF.phase === 'rel' || PF.phase === 'qr') && (PF.qi || 0) < (PF.quick || 0)) { PF.qi = (PF.qi || 0) + 1; PF.phase = 'qs'; PF.end = Date.now() + 1000; buzz(25); pfCue(true, true); }
    else if (PF.phase === 'qs') { PF.phase = 'qr'; PF.end = Date.now() + 2000; pfCue(false, true); }
    else {
      const st = PF.store; const k = pfDay(); st.pf[k] = pfSets(st, k) + 1; persist(); pfDone = { store: st, n: st.pf[k] }; PF = null; stopPfTick();
      try { if (S.plan && S.plan.pelvic && S.plan.pelvic.sync) S.plan.pelvic.sync(); } catch (e) { /* her plan's rings follow */ }
      S.render(); return;
    }
    if (!pfPaint()) stopPfTick();
  }
  const i13 = (d) => S.toISO(d) === todayISO();
  const pfDay = () => S.toISO(S.planToday ? S.planToday() : S.today());   /* Version 39.56: a set after midnight is the evening before's, as her check-in */
  /* Version 39.56 (My pelvic floor plan): her plan runs it, or joins her sets to another plan; never in pregnancy */
  const pfPlan = () => !!(S.plan && S.plan.pelvic && S.plan.pelvic.on && S.plan.pelvic.on()) && !(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  const PF_POSE = { lie: 'bridgedown', sit: 'chairsit', stand: 'wall', walk: 'walk' };
  const pfStill = (pos) => { const f = window.SAKHI_FIG; return f && f.v === 1 && (window.SAKHI_CONFIG || {}).fig !== false && (f.stills || []).indexOf(pos) >= 0 ? 'fig/s/' + pos + '.webp' : ''; };
  function renderPelvic(v) {
    stopAll();
    const st = store(); if (PF && PF.store !== st) PF = null; if (pfDone && pfDone.store !== st) pfDone = null;
    const plan = pfPlan(); const P0 = plan ? S.plan.pelvic : null; const lv = plan ? P0.level() : null; const rl = !!(plan && P0.relax()); const m = plan ? P0.target() : 3;
    const js = !!(plan && P0.joinSafe && P0.joinSafe());   /* her joined sets: the signs that need a doctor first, once */
    if (plan && !rl && lv && !js && S.mem.pfAuto && !PF) { pfDone = null; PF = { store: st, hold: lv.hold, reps: lv.reps, quick: lv.quick, qi: 0, i: 1, phase: 'ready', end: Date.now() + 3000, paused: false, left: 0, plan: true }; }   /* Today's play button */
    S.mem.pfAuto = false;
    const hold = [3, 5, 10].indexOf(Number(st.pfHold)) >= 0 ? Number(st.pfHold) : 5;
    const k = pfDay(); const sets = pfSets(st, k);
    let trainer = '';
    if (PF) {
      trainer = '<div class="card pst-center pst-trainer"><div class="pst-phase" id="pst-pph" data-phase="' + PF.phase + '"></div><div class="bigtimer" id="pst-psec">' + PF.hold + '</div><div class="pst-bar pst-full"><i id="pst-pbar" style="width:0%"></i></div><p class="small" id="pst-prep"></p>' +
        '<div class="grid2 pst-full"><button type="button" class="btn secondary" id="pst-ppause">' + esc(PF.paused ? T('pf_resume') : T('pf_pause')) + '</button><button type="button" class="btn" id="pst-pstop">' + esc(T('pf_stop')) + '</button></div>' +
        (PF.plan ? '<button type="button" class="linkbtn pst-hurt" id="pst-phurt">' + esc(T('pf_hurt')) + '</button>' : '') + '<p class="small">' + esc(T(PF.plan ? 'pf_leave2' : 'pf_leave')) + '</p></div>';
    } else if (js) {
      trainer = '<div class="card warn pst-jsafe"><h3>' + esc(t('plan_ps_h')) + '</h3><p class="small">' + esc(t('plan_pfs_join_p')) + '</p><ul class="pst-ul">' + P0.signs().map((k) => '<li>' + esc(t('plan_pfs_' + k)) + '</li>').join('') + '</ul>' +
        '<div class="row wrap"><button type="button" class="btn sm primary" id="pst-jsafe-ok">' + esc(t('plan_pfs_none_b')) + '</button><button type="button" class="btn sm" id="pst-jsafe-seen">' + esc(t('plan_pf_safe_seen')) + '</button><button type="button" class="btn sm" data-ask="' + esc(T('pf_topic2')) + '">' + esc(t('ask_qura')) + '</button></div></div>';
    } else if (rl) {
      trainer = '<div class="card pst-relax"><h3>' + esc(T('pf_relax_h')) + '</h3><p class="small">' + esc(T('pf_relax_p')) + '</p>' + (has('calm-breaths') ? '<button type="button" class="btn primary block" data-go="calm-breaths">' + esc(T('pf_relax_b')) + '</button>' : '') + '<button type="button" class="btn sm" id="pst-painok">' + esc(t('plan_pf_pain_ok')) + '</button></div>';   /* the test pass: a way back when her sets join another plan */
    } else if (plan && lv) {
      const img = pfStill(PF_POSE[lv.pos]);
      const note = lv.back ? T('pf_back') : (lv.capped ? T('pf_capped') : (lv.top ? T('pf_top') : (lv.left === 1 ? T('pf_next1') : TF('pf_next', { n: lv.left }))));
      trainer = (pfDone ? '<div class="card ok"><p><strong>' + esc(TF('pf_done_m', { n: pfDone.n, m: m })) + '</strong></p>' + (P0.knack() ? '<p class="small pst-knack">' + esc(T('pf_knack')) + '</p>' : '') + '</div>' : '') +
        '<div class="card pst-lv">' + (img ? '<img class="pst-pos" src="' + img + '" alt="" width="96" height="96" loading="lazy">' : '') + '<div class="pst-lv-b"><span class="eyebrow">' + esc(TF('pf_lv', { n: lv.n, p: T('pf_pos_' + lv.pos) })) + '</span><p><strong>' + esc(TF('pf_lv_do', { r: lv.reps, h: lv.hold })) + '</strong></p>' +
        (lv.quick ? '<p class="small">' + esc(TF('pf_lv_q', { q: lv.quick })) + '</p>' : '') + '<p class="small pst-lv-n">' + esc(note) + '</p></div></div>' +
        (P0.period() ? '<p class="small pst-pd">' + esc(t('plan_pf_pd')) + '</p>' : '') + '<button type="button" class="btn primary block" id="pst-pstart">' + esc(T('pf_go')) + '</button>';
    } else {
      trainer = (pfDone ? '<div class="card ok"><p><strong>' + esc(TF('pf_done', { n: pfDone.n })) + '</strong></p></div>' : '') +
        '<div class="card"><div class="pst-lbl">' + esc(T('hold_l')) + '</div><div class="chips">' + [3, 5, 10].map((s) => '<button type="button" class="chip' + (s === hold ? ' on' : '') + '" data-pst-hold="' + s + '" aria-pressed="' + (s === hold ? 'true' : 'false') + '">' + esc(TF('secs', { n: s })) + '</button>').join('') + '</div><button type="button" class="btn primary block" id="pst-pstart">' + esc(T('pf_start')) + '</button><p class="small">' + esc(T('pf_goal')) + '</p></div>';
    }
    const ticks = '<div class="pst-ticks">' + Array.from({ length: m }, (x, i) => i + 1).map((i) => '<span class="pst-tick' + (sets >= i ? ' on' : '') + '">' + (sets >= i ? '✓' : i) + '</span>').join('') + (sets > m ? '<span class="pill ok">+' + (sets - m) + '</span>' : '') + '</div>';
    const strip = '<div class="pst-strip">' + Array.from({ length: 14 }, (x, i) => S.addDays(S.today(), i - 13)).map((d) => { const n = pfSets(st, S.toISO(d)); return '<span class="pst-sd' + (n ? ' on' : '') + (i13(d) ? ' today' : '') + '" title="' + esc(dShort(d)) + '"><b class="num">' + d.getDate() + '</b><i>' + (n ? n : '·') + '</i></span>'; }).join('') + '</div>';
    /* Her 3-month course, counted from her first set (NICE: at least 3 months of daily training). */
    const pfDays = Object.keys(st.pf).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && pfSets(st, x) > 0 && x <= k).sort();
    const day1 = pfDays.length ? S.diffDays(S.fromISO(pfDays[0]), S.today()) + 1 : 0;
    const course = pfDays.length ? '<p class="small pst-course">' + esc(day1 > 90 ? TF('pf_course_done', { n: pfDays.length }) : TF('pf_course', { d: day1, n: pfDays.length })) + '</p>' : '';
    const pg = !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant()); const born = !!sitBirth();   /* after a birth, as it was */
    const find = '<div class="card pst-find"><h3>' + esc(T('find_h')) + '</h3><ol class="steps">' + li(G.find) + '</ol></div>'; const early = plan && !PF && P0.week() <= 1;   /* her first week: finding the muscles first */
    v.innerHTML = S.backRow(T('pf_h'), pg ? 'preg' : (born && !plan ? R.hub : 'home'), false) + '<p class="small">' + esc(T(pg ? 'pf_p_preg' : (born ? 'pf_p' : 'pf_p_any'))) + '</p>' + (!plan && S.plan && S.plan.forRow ? S.plan.forRow('pelvic') || '' : '') + (early ? find : '') + trainer +   /* the test pass: her plan for this */
      '<div class="card"><div class="row spread"><h3>' + esc(T('pf_today')) + '</h3>' + ticks + '</div><div class="row spread"><span class="small">' + esc(T('pf_14')) + '</span><span class="small"><strong>' + esc(TF('pf_days', { n: pfDaysDone(st, 14) })) + '</strong></span></div>' + strip + course + '</div>' +
      (S.canSave() ? '' : S.needDiary()) + (early ? '' : find) +
      (born || pg ? acc(T('gap_h'), '<ol class="steps">' + li(G.gap) + '</ol><p class="small">' + esc(tx(G.gapNote)) + '</p>') +
        '<div class="flag pst-col"><strong>' + esc(T('see_h')) + '</strong><ul class="pst-ul">' + li(G.see) + '</ul>' + (has('intimate-prolapse') ? '<button type="button" class="btn sm pst-self pst-onLight" data-go="intimate-prolapse">' + esc(T('prolapse')) + '</button>' : '') + '</div>' +
        askCard('hub_ask_h', 'hub_ask_p', 'pf_topic') + related(R.pelvic)
        /* Version 39.56 (the walk): without a recent birth, no after-birth lines; the guide, and a Qura doctor to check the squeeze */
        : (has('intimate-prolapse') ? '<div class="list pst-guide"><button type="button" class="item" data-go="intimate-prolapse"><span class="body"><strong>' + esc(T('prolapse')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button></div>' : '') +
          '<div class="card soft pst-right"><h3>' + esc(t('plan_pf_right_h')) + '</h3><p class="small">' + esc(t('plan_pf_right_p')) + '</p><button type="button" class="btn sm secondary pst-self" data-ask="' + esc(T('pf_topic2')) + '">' + esc(t('ask_qura')) + '</button></div>') +
      '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-pst-hold]').forEach((b) => b.addEventListener('click', () => { const st2 = store(); st2.pfHold = Number(b.dataset.pstHold); persist(); S.render(); }));
    const sb = v.querySelector('#pst-pstart'); if (sb) sb.addEventListener('click', () => { if (plan) pfWake(); pfDone = null; PF = plan && lv ? { store: store(), hold: lv.hold, reps: lv.reps, quick: lv.quick, qi: 0, i: 1, phase: 'ready', end: Date.now() + 3000, paused: false, left: 0, plan: true } : { store: store(), hold: hold, reps: 10, i: 1, phase: 'ready', end: Date.now() + 3000, paused: false, left: 0 }; S.render(); });
    const pb = v.querySelector('#pst-ppause'); if (pb) pb.addEventListener('click', () => { if (!PF) return; if (PF.paused) { PF.paused = false; PF.end = Date.now() + PF.left; } else { PF.paused = true; PF.left = Math.max(0, PF.end - Date.now()); } pb.textContent = PF.paused ? T('pf_resume') : T('pf_pause'); pfPaint(); });
    const xb = v.querySelector('#pst-pstop'); if (xb) xb.addEventListener('click', () => { PF = null; stopPfTick(); S.render(); });
    v.querySelectorAll('#pst-jsafe-ok, #pst-jsafe-seen').forEach((b) => b.addEventListener('click', () => { try { S.plan.pelvic.joinSafeOk(); } catch (e) { /* her plan */ } S.render(); }));
    const po = v.querySelector('#pst-painok'); if (po) po.addEventListener('click', () => { try { S.plan.pelvic.painOk(); } catch (e) { /* her plan */ } S.render(); });
    const hb = v.querySelector('#pst-phurt'); if (hb) hb.addEventListener('click', () => { PF = null; stopPfTick(); let n = 1; try { n = S.plan.pelvic.hurt(); } catch (e) { /* her plan */ } S.toast(T(n >= 2 ? 'pf_hurt_t2' : 'pf_hurt_t')); S.render(); });   /* Version 39.56 */
    if (PF) { pfPaint(); pfTick = setInterval(pfStep, 200); }
  }

  /* ---------- check-ups and vaccines ---------- */
  const VAX_IDS = VAX.filter((x) => x.id !== 'birth').map((x) => 'post-vax-' + x.id);
  const vaxOn = () => VAX_IDS.some((id) => !!S.reminders.get(id));
  function addVax(b) {
    let c = 0;
    VAX.forEach((x) => { if (x.id === 'birth') return; const d = vaxDate(b, x); if (d < S.today()) return; S.reminders.upsert({ id: 'post-vax-' + x.id, mod: 'post', title: { en: "Baby's vaccines: " + x.age.en, hi: 'बच्चे के टीके: ' + x.age.hi }, kind: 'visit', dates: [S.toISO(d)], time: '09:00', on: true }); c++; });
    return c;
  }
  function nextVax(b) { for (let i = 0; i < VAX.length; i++) { const d = vaxDate(b, VAX[i]); if (d >= S.today() && VAX[i].id !== 'birth') return { x: VAX[i], d: d }; } return null; }
  /* Version 39.28: where she gets care (S.care). With a private doctor, or before she says where she goes: her own check
     with her gynaecologist, vaccines from the baby's doctor, iron and calcium as prescribed, and the ASHA's visit days folded
     behind one quiet line. The danger signs and the call buttons are the same for everyone. */
  const docR = () => !!(S.care && S.care.gov && !S.care.gov());
  function renderChecks(v) {
    stopAll();
    const b = birth(); const n = dayN(); const dr = docR();
    let asha = '<div class="card"><h3>' + esc(T('asha_h')) + '</h3><p class="small pst-txt">' + esc(T('asha_p')) + '</p>';
    if (b) {
      const nextD = ASHA_DAYS.filter((d) => d >= n && d > 1)[0];
      const off = (d) => (d === 1 ? 0 : d);   /* "Day 1" (home births only) is the day of birth, within 24 hours */
      asha += '<div class="pst-vd">' + ASHA_DAYS.map((d) => { const dt = S.addDays(b, off(d)); const cls = off(d) < n ? 'past' : (d === nextD ? 'next' : ''); return '<span class="pst-vdi ' + cls + '"><b>' + esc(TF('day_only', { n: d })) + '</b><i>' + esc(dShort(dt)) + '</i><em>' + esc(off(d) === n ? T('v_today') : (d < n ? T('v_past') : (d === nextD ? T('v_next') : ''))) + '</em></span>'; }).join('') + '</div><p class="small">' + esc(T('day1_note')) + '</p>';
    }
    asha += '<p class="small">' + esc(T('asha_later')) + '</p></div>';
    if (dr) asha = '<details class="pst-asha-q"><summary class="item care-alt"><span class="body"><strong>' + esc(T('asha_q_doc')) + '</strong></span><span class="chev">' + S.I.chev + '</span></summary>' + asha + '</details>';
    const sixD = b ? S.addDays(b, 42) : null;
    const remSix = S.reminders.get('post-6wk');
    let six = '<div class="card"><h3>' + esc(T('six_h')) + '</h3><p class="small pst-txt">' + esc(sixD ? TF(dr ? 'six_p_doc' : 'six_p', { d: dLong(sixD) }) : T(dr ? 'six_p0_doc' : 'six_p0')) + '</p><div class="pst-lbl">' + esc(T('six_list')) + '</div><ul class="pst-ul small">' + li(G.six) + '</ul>';
    if (sixD && sixD >= S.today() && S.canSave()) six += remSix ? '<p class="small"><strong>' + esc(TF('six_on', { d: dLong(sixD) })) + '</strong></p><button type="button" class="btn sm pst-self" id="pst-six-off">' + esc(T('rem_off')) + '</button>' : '<button type="button" class="btn sm secondary pst-self" id="pst-six">' + esc(T('six_rem')) + '</button>';
    six += '</div>';
    const meds = '<div class="card"><h3>' + esc(T('meds_h')) + '</h3><ul class="pst-ul small">' + (dr ? ['meds_doc', 'meds_3_doc'] : ['meds_1', 'meds_2', 'meds_3']).map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ul>' + (dr ? '' : '<div class="note">' + esc(T('jssk')) + '</div>') + '</div>';
    const nx = b ? nextVax(b) : null;
    const rows = VAX.map((x) => {
      let when = ''; let cls = '';
      if (b) { const d = vaxDate(b, x); const dd = S.diffDays(S.today(), d); if (dd < 0) { when = T(dr ? 'vx_past_doc' : 'vx_past'); cls = 'past'; } else if (dd === 0) { when = T('vx_today'); cls = 'next'; } else if (dd <= 7) { when = TF('vx_soon', { d: dShort(d) }); cls = 'next'; } else { when = TF('vx_due', { d: dLong(d) }); if (nx && nx.x.id === x.id) cls = 'next'; } }
      return '<div class="pst-vx ' + cls + '"><div class="pst-va"><strong>' + esc(tx(x.age)) + '</strong>' + (when ? '<span>' + esc(when) + '</span>' : '') + '</div><div class="pst-vv">' + esc(tx(x.v)) + '</div></div>';
    }).join('');
    let vaxBtns = '';
    if (b && S.canSave()) {
      if (vaxOn()) vaxBtns = '<div class="flag ok">' + fi(S.I.bell) + '<span class="pst-ft">' + esc(T('vax_on')) + '</span></div><div class="row wrap">' + (has('tools-reminders') ? '<button type="button" class="btn sm" data-go="tools-reminders">' + esc(T('all_rem')) + '</button>' : '') + '<button type="button" class="btn sm" id="pst-vax-off">' + esc(T('vax_off')) + '</button></div>';
      else if (nx) vaxBtns = '<button type="button" class="btn primary block" id="pst-vax">' + esc(T('vax_add')) + '</button>';
    } else if (b && !S.canSave()) vaxBtns = S.needDiary();
    const vax = '<div class="card"><h3>' + esc(T('vax_h')) + '</h3><p class="small pst-txt">' + esc(T((b ? 'vax_p' : 'vax_p0') + (dr ? '_doc' : ''))) + '</p><div class="pst-vlist">' + rows + '</div>' + vaxBtns + '<p class="small">' + esc(T('vax_je')) + ' ' + esc(T(dr ? 'vax_missed_doc' : 'vax_missed')) + '</p><p class="small">' + esc(T('vax_later')) + '</p>' + (dr ? '<p class="small">' + esc(T('vax_free_doc')) + '</p>' : '') + '</div>';
    /* the doctor route: her own check before the ASHA's visit days, which fold behind one quiet line */
    v.innerHTML = S.backRow(T('k_h'), R.hub, false) + '<p class="small">' + esc(T(dr ? 'k_p_doc' : 'k_p')) + '</p>' + birthCard() + (died() ? '' : vax) + (dr ? six + meds + asha : asha + six + meds) + related(R.checks) + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v); wireBirth(v);
    const va = v.querySelector('#pst-vax'); if (va) va.addEventListener('click', () => { const bb = birth(); if (!bb) return; addVax(bb); S.toast(T('vax_added_t')); S.render(); });
    const vo = v.querySelector('#pst-vax-off'); if (vo) vo.addEventListener('click', () => { VAX_IDS.forEach((id) => S.reminders.remove(id)); S.render(); });
    const sx = v.querySelector('#pst-six'); if (sx) sx.addEventListener('click', () => { if (!birth()) return; sixRemind(); S.render(); });
    const so = v.querySelector('#pst-six-off'); if (so) so.addEventListener('click', () => { S.reminders.remove('post-6wk'); S.render(); });
  }

  /* ---------- hub ---------- */
  function renderHub(v) {
    stopAll();
    const st = store(); const b = birth(); const n = dayN(); const k = todayISO();
    let hero = '';
    if (b && !editBirth) {
      const done = !!st.rec[k]; const tf = todayFeeds(st); const ls = lastSeg(st); const sets = pfSets(st, k);
      const rows = [];
      rows.push([T('k_check'), done ? T('k_done') : T('k_notyet')]);
      if (!died()) rows.push([T('k_feeds'), ls ? TF('feeds_last', { n: tf.length, s: sideName(ls.side) }) : String(tf.length)]);
      rows.push([T('k_pf'), TF('of3', { n: Math.min(sets, 3) })]);
      const na = docR() ? null : ASHA_DAYS.filter((d) => d > 1 && d >= n)[0]; if (na != null) rows.push([T('k_asha'), na === n ? TF('day_today', { n: na }) : TF('day_d', { n: na, d: dShort(S.addDays(b, na)) })]);
      if (n < 42) rows.push([T('k_six'), dShort(S.addDays(b, 42))]);
      const nx = died() ? null : nextVax(b); if (nx) rows.push([T('k_vax'), tx(nx.x.age) + ' · ' + dShort(nx.d)]);
      const phase = n <= 42 ? T('ph1') : (n < 183 ? TF('ph2', { d: dLong(addMonths(b, 6)) }) : T('ph3'));
      hero = '<div class="card pst-hero"><div class="eyebrow">' + esc(T('eb_day')) + '</div><div class="big num">' + n + '</div>' + (died() ? '' : '<p class="lead">' + esc(n === 0 ? T('day0') : ageText(n)) + '</p>') + '' + (died() ? '' : '<p class="small">' + esc(phase) + '</p>') + birthCard() +
        '<dl class="kv">' + rows.map((r) => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl>' +
        '<button type="button" class="btn primary block" data-go="' + R.rec + '">' + esc(done ? T('upd_check') : T('do_check')) + '</button></div>';
      if (st.run && st.run.segs.length) { const cur = st.run.segs[st.run.segs.length - 1]; hero += '<button type="button" class="action" data-go="' + R.feed + '"><span class="ico accent">' + S.I.drop + '</span><span class="body"><strong>' + esc(TF('running', { side: sideName(cur.side), t: fmtTime(st.run.segs[0].s) })) + '</strong><span class="small">' + esc(T('open_feed')) + '</span></span><span class="go">' + chev() + '</span></button>'; }
    } else hero = birthCard();
    const tools = [[R.rec, 't_rec', 't_rec_s', S.I.check, true], [R.mood, 't_mood', 't_mood_s', S.I.heart, true], [R.feed, 't_feed', 't_feed_s', S.I.drop], [R.contra, 't_contra', 't_contra_s', S.I.pill], [R.pelvic, 't_pelvic', 't_pelvic_s', S.I.flower], [R.checks, 't_checks', 't_checks_s', S.I.bell]];
    if (has('access-schemes-post')) tools.push(['access-schemes-post', 'schemes', 'schemes_s', S.I.file]);
    if (has('pregtools-birth') && n != null && n <= 7) tools.push(['pregtools-birth', 'birthprep', 'birthprep_s', S.I.heart]);
    const gone = died();   /* Version 39.46: no baby lines, and her support first */
    if (gone) for (let i = tools.length - 1; i >= 0; i--) if (tools[i][0] === R.feed) tools.splice(i, 1);
    const lostTop = gone ? '<div class="card pst-lost"><h3>' + esc(T('lost_h')) + '</h3><p class="small">' + esc(T('lost_talk')) + '</p><div class="pst-row"><a class="btn sm primary" href="tel:14416">' + esc(t('call_b')) + ' 14416</a>' + (has('loss-grief') ? '<button type="button" class="btn sm" data-go="loss-grief">' + esc(T('lost_sup')) + '</button>' : '') + '</div><button type="button" class="linkbtn" id="pst-lost-undo">' + esc(T('lost_undo')) + '</button></div>' : '';
    v.innerHTML = S.backRow(T('h'), 'care', false) + lostTop + '<p class="small">' + esc(T(gone ? 'p_b' : 'p')) + '</p>' + hero +
      '<div class="flag urgent pst-col"><strong>' + esc(T('u_h')) + '</strong><ul class="pst-ul">' + ['u_1', 'u_2', 'u_3', 'u_4'].map((x) => '<li>' + esc(T(x === 'u_4' && gone ? 'u_4b' : x)) + '</li>').join('') + '</ul><span>' + esc(T('u_5')) + '</span>' + callRow(['112', '108', '14416'], 'pst-onDark') + '</div>' +
      '<h2>' + esc(T('tools_h')) + '</h2><div class="list">' + tools.map((x) => '<button type="button" class="item" data-go="' + x[0] + '"><span class="ico-sm">' + x[3] + '</span><span class="body"><strong>' + esc(T(x[1])) + '</strong><span>' + esc(T(x[2])) + '</span></span>' + (x[4] && S.flags.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '</button>').join('') + '</div>' +
      askCard('hub_ask_h', 'hub_ask_p', 'ask_topic') + (b && !gone && S.canSave() ? '<button type="button" class="linkbtn pst-lost-l" id="pst-lost">' + esc(T('lost_link')) + '</button>' : '') + '<p class="footnote">' + esc(T('nodx')) + '</p>';
    S.wire(v); wireBirth(v); wireCopy(v);
    const lo = v.querySelector('#pst-lost'); if (lo) lo.addEventListener('click', lostSheet);   /* Version 39.46 */
    const lu = v.querySelector('#pst-lost-undo'); if (lu) lu.addEventListener('click', () => { const s0 = Object.assign({}, S.state.situation || {}); delete s0.babyDied; if (s0.bfWas) s0.breastfeeding = true; delete s0.bfWas; S.state.situation = s0; S.emit('babyBack', {}); S.saveQuiet(); S.render(); });
  }

  /* ---------- Version 39.46: "My baby has died" (one tap here and in core's stage sheet). Every baby line stops: feeding, the vaccine
     reminders, her baby's age; what is hers stays: her check to day 41, her own 6-week check, contraception. Undo on the hub. ---------- */
  const died = () => { const s0 = S.state.situation || {}; const b = birthISO(); return !!(s0.babyDied && b && s0.babyDied >= b); };
  function lostSheet() {
    if (!S.sheet || !S.canSave()) return;
    S.sheet('<div class="pst-lost-sh"><h2>' + esc(T('lost_h')) + '</h2><p>' + esc(T('lost_q_p')) + '</p><div class="grid2"><button type="button" class="btn primary" id="pst-lost-yes">' + esc(T('lost_q_yes')) + '</button><button type="button" class="btn" id="pst-lost-no">' + esc(t('cancel')) + '</button></div></div>', (sh) => {
      sh.querySelector('#pst-lost-no').addEventListener('click', () => S.closeSheet());
      sh.querySelector('#pst-lost-yes').addEventListener('click', () => {
        const s1 = S.state.situation || {}; S.state.situation = Object.assign({}, s1, { babyDied: todayISO(), breastfeeding: false, bfWas: !!s1.breastfeeding }); VAX_IDS.forEach((id) => S.reminders.remove(id));
        S.emit('babyDied', {}); S.saveQuiet(); S.closeSheet(); S.toast(T('lost_done')); S.setHash(R.hub);   /* quiet: never a petal or a celebration here */
      });
    });
  }
  /* Version 39.48 (Mohit's switch walk): it ends once its day has passed, or with no birth, or in a new pregnancy (Me said "1 on" a
     year after the birth, with nothing to ring) */
  const sixSync = () => { const r = S.reminders.get('post-6wk'); if (!r) return; const bb = birth(); const preg = !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
    const want = bb ? S.toISO(S.addDays(bb, 42)) : null; if (!want || preg || S.toISO(S.today()) > want) { S.reminders.remove('post-6wk'); return; }
    if ((r.dates || [])[0] !== want) S.reminders.upsert({ id: 'post-6wk', dates: [want] }, { quiet: true }); };   /* Version 39.46 */
  const sixRemind = () => { const bb = birth(); if (!bb) return; S.reminders.upsert({ id: 'post-6wk', mod: 'post', title: { en: 'My 6-week check after birth', hi: 'डिलीवरी के बाद मेरी 6 हफ़्ते की जाँच' }, kind: 'checkup', dates: [S.toISO(S.addDays(bb, 42))], time: '09:00', on: true }); };

  /* ---------- hooks ---------- */
  function stopAll() { stopFeedTick(); stopPfTick(); }
  /* Version 38: her plan's daily recovery check (plan.js, every after-birth goal until day 42) is done only by this check */
  S.post = Object.assign(S.post || {}, { checkedToday: () => !!(S.canSave() && (store().rec || {})[todayISO()]), checkedOn: (iso) => !!(S.canSave() && (store().rec || {})[iso]),
    /* Version 39.5: pelvic floor sets on that day (a plan step counts from them) */
    pelvicOn: (iso) => !!(S.canSave() && Number((store().pf || {})[iso] || 0) > 0),
    /* Version 39.56: My pelvic floor plan's levels and sets come from the trainer's days */
    pfSets: (iso) => (S.canSave() ? Number((store().pf || {})[iso] || 0) : 0),
    pfDays: () => { if (!S.canSave()) return []; const pf = store().pf || {}; return Object.keys(pf).filter((x) => okISO(x) && Number(pf[x]) > 0).sort(); },
    renderPelvic: renderPelvic,   /* for pf-go (mods/pfplan.js): the trainer at once, with a set started */
    /* Version 39.46: for the after-birth plan's version 2 */
    died: died, lost: lostSheet, sixOn: () => !!S.reminders.get('post-6wk'), sixRemind: sixRemind, sixSync: sixSync,
    /* her plan's day ends at 4 am: a check saved before 4 am is the day before's, not its own date's */
    checkedFor: (iso) => { if (!S.canSave()) return false; const rec = store().rec || {}; const a = rec[iso]; const b = rec[S.toISO(S.addDays(S.fromISO(iso), 1))]; return !!((a && !(a.at && a.at < '04:00')) || (b && b.at && b.at < '04:00')); },
    babySigns: () => ({ h: T('baby_h'), list: G.baby.map((x) => tx(x)), note: tx(G.babyNote) }),
    leaks: (a, z) => { const rec = (S.canSave() ? store().rec : {}) || {}; let n = 0, k = 0; Object.keys(rec).forEach((x) => { if (x >= a && x <= z) { n++; if (rec[x].pee === 'leak') k++; } }); return { n: n, k: k }; } });
  /* Version 39.0 (journey audit P0 2 and 2.1): today's and yesterday's recovery-check warning signs reach Today and her diary,
     at their own level (112 now, or a doctor today) and in the check's own reviewed words */
  const LP = (k) => ({ en: P[k][0].charAt(0).toUpperCase() + P[k][0].slice(1), hi: P[k][1] });
  S.post.flags = () => {
    if (!S.canSave()) return []; const b = (S.state.situation || {}).deliveredOn; if (!b || (S.cycle && S.cycle.isPregnant && S.cycle.isPregnant())) return [];
    const rec = store().rec || {}; const out = [];
    const lead = (f) => (f.k === 'fl_harm' ? null : P[f.lvl === 'u' ? 'fl_112' : 'fl_today']);
    (rec[todayISO()] ? [0] : [0, 1]).forEach((k) => { const iso = S.toISO(S.addDays(S.today(), -k)); const v = rec[iso]; if (!v) return; const n = S.diffDays(S.fromISO(b), S.fromISO(iso)); if (n < 0 || n > 84) return;
      flagsOf(v, n).filter((f) => (f.lvl === 'u' || f.lvl === 'd') && f.s).forEach((f) => { if (out.some((o) => o.id === 'pp_' + f.k)) return; const ld = lead(f);
        const fk = f.k === 'fl_harm' && died() ? 'fl_harm_b' : f.k;   /* Version 39.46 */
        out.push({ id: 'pp_' + f.k, lv: f.lvl === 'u' ? 'now' : 'today', at: iso, t: LP(f.s), see: { en: (ld ? ld[0] + '. ' : '') + P[fk][0], hi: (ld ? ld[1] + '। ' : '') + P[fk][1] }, go: R.rec, call: f.k === 'fl_harm' ? '14416' : '112' }); }); });
    return out;
  };
  function home() {
    if (!S.canSave()) return ''; const n = dayN(); if (n == null || n > 42) return '';
    if (S.plan && S.plan.running && S.plan.running() && S.plan.packOf && S.plan.packOf() === 'post') return '';   /* her plan's step is this card */
    const done = !!store().rec[todayISO()];
    return '<button type="button" class="action" data-go="' + R.rec + '"><span class="ico accent">' + S.I.heart + '</span><span class="body"><strong>' + esc(n === 0 ? T('home_h0') : TF('home_h', { n: n })) + '</strong><span class="small">' + esc(done ? T('home_done') : T('home_s')) + '</span></span><span class="go">' + chev() + '</span></button>';
  }
  function summary() {
    const st = S.canSave() ? fill(S.data('post')) : fill(TEMP); const b = birth(); const L2 = [];
    if (b) L2.push(TF('sum_day', { n: S.diffDays(b, S.today()), d: dLong(b) }));
    const keys = Object.keys(st.rec).sort();
    if (keys.length) {
      L2.push(TF('sum_checks', { n: keys.length, d: dShort(S.fromISO(keys[keys.length - 1])) }));
      const cnt = {}; keys.forEach((k) => { const e = st.rec[k]; const labs = [];
        (e.danger || []).forEach((x) => { if (x !== 'none') labs.push(T('d_' + x)); });
        if (e.fever === 'high') labs.push(T('s_fever')); if (e.wound === 'pus' || e.wound === 'red') labs.push(T('s_wound')); if (e.breast === 'red') labs.push(T('br_red')); if (e.pee === 'cant') labs.push(T('s_cantpee')); if (e.bleed === 'heavy') labs.push(T('s_heavy')); if (e.mood === 'harm') labs.push(T('s_harm'));
        labs.forEach((l) => { cnt[l] = (cnt[l] || 0) + 1; }); });
      const f = Object.keys(cnt); L2.push(f.length ? TF('sum_flags', { f: f.map((l) => l + ' (' + TF('sum_days', { n: cnt[l] }) + ')').join(', ') }) : T('sum_noflags'));
    }
    const tf = todayFeeds(st); if (tf.length) { const sides = { L: 0, R: 0 }; tf.forEach((x) => { const g = (x.segs || [])[0]; if (g) sides[g.side === 'R' ? 'R' : 'L'] += 1; }); L2.push(TF('sum_feeds', { n: tf.length, l: sides.L, r: sides.R, m: tf.reduce((a, x) => a + sessMin(x), 0) })); }
    const pd = pfDaysDone(st, 14); if (pd) L2.push(TF('sum_pf', { n: pd }));
    if (b && vaxOn()) { const nx = nextVax(b); if (nx) L2.push(TF('sum_vax', { v: tx(nx.x.age), d: dShort(nx.d) })); }
    return L2.length ? [{ title: T('sum_h'), lines: L2 }] : [];
  }
  function sample(id) {
    if (id !== 'sunita') return;
    const d = fill(S.data('post')); const td = S.today();
    d.rec = {}; d.feeds = []; d.run = null; d.pf = {}; d.pfHold = 5;
    [3, 2, 1].forEach((k) => { d.rec[S.toISO(S.addDays(td, -k))] = { danger: ['none'], bleed: 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', sleep: 'some' }; });
    const now = Date.now(); const mid = td.getTime(); const durs = [18, 22, 15, 25, 20, 17, 19, 21]; let s = now - 35 * 60000; let side = 'R'; let i = 0;
    while (s > mid + 5 * 60000 && i < 8) {
      const dur = durs[i] * 60000; const segs = i % 3 === 2 ? [{ side: side, s: s, e: s + dur }] : [{ side: side, s: s, e: s + Math.round(dur / 2) }, { side: other(side), s: s + Math.round(dur / 2), e: s + dur }];
      d.feeds.unshift({ s: s, e: s + dur, segs: segs }); side = other(side); s -= 160 * 60000; i++;
    }
    d.pf[S.toISO(S.addDays(td, -2))] = 2; d.pf[S.toISO(S.addDays(td, -1))] = 3;
    const sit = S.state.situation || {}; if (okISO(sit.deliveredOn)) addVax(S.fromISO(sit.deliveredOn));
  }

  S.register({
    id: 'post',
    demoPersona: 'sunita',
    strings: strings,
    routes: { 'post': renderHub, 'post-recovery': renderRec, 'post-mood': renderMood, 'post-feed': renderFeed, 'post-contra': renderContra, 'post-pelvic': renderPelvic, 'post-checks': renderChecks },
    open: MINE.slice(),
    tiles: [
      { section: 'post', route: R.hub, title: 'post_t_hub', sub: 'post_t_hub_s', icon: 'baby', order: 1, gated: false, keywords: 'after birth postpartum postnatal delivery recovery day count baby newborn डिलीवरी के बाद प्रसव के बाद जच्चा' },
      { section: 'post', route: R.rec, title: 'post_t_rec', sub: 'post_t_rec_s', icon: 'check', order: 2, gated: true, keywords: 'bleeding lochia stitches c-section wound fever infection clots pre-eclampsia ब्लीडिंग टाँके बुख़ार' },
      { section: 'post', route: R.mood, title: 'post_t_mood', sub: 'post_t_mood_s', icon: 'heart', order: 3, gated: true, keywords: 'baby blues postpartum depression postnatal psychosis anxiety tele-manas 14416 उदासी डिप्रेशन' },
      { section: 'post', route: R.feed, title: 'post_t_feed', sub: 'post_t_feed_s', icon: 'drop', order: 4, gated: false, hidden: () => died(), keywords: 'breastfeeding feed log latch nipples mastitis engorgement milk supply expressing storage maternity leave creche maa स्तनपान दूध' },
      { section: 'post', route: R.contra, title: 'post_t_contra', sub: 'post_t_contra_s', icon: 'pill', order: 5, gated: false, keywords: 'contraception after delivery ppiucd copper-t lam antara chhaya pop tubectomy nsv गर्भनिरोध नसबंदी' },
      { section: 'post', route: R.pelvic, title: 'post_t_pelvic', sub: 'post_t_pelvic_s', icon: 'flower', order: 6, gated: false, keywords: 'pelvic floor kegel leaking urine incontinence diastasis belly gap prolapse व्यायाम लीक' },
      { section: 'post', route: R.checks, title: 'post_t_checks', sub: 'post_t_checks_s', icon: 'bell', order: 7, gated: false, hidden: () => died(), keywords: 'asha visits hbnc 6 week check ifa iron calcium vaccines uip immunisation mcp card टीके जाँच' },
      { section: 'post', route: R.checks, title: 'post_six_h', sub: 'post_t_checks_s0', icon: 'bell', order: 7, gated: false, hidden: () => !died(), keywords: '6 week check ifa iron calcium जाँच' }   /* Version 39.46: after "My baby has died" */
    ],
    css: [
      '.pst-col { flex-direction: column; gap: 6px; align-items: stretch; padding: 12px 14px; }',
      '.pst-col strong { font-size: 14px; }',
      '.pst-col span, .pst-col li { overflow-wrap: anywhere; }',
      '.pst-col .pst-ul { margin: 0; }',
      '.pst-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; } .pst-call { min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; font-weight: 700; } .pst-copies { gap: 2px 14px; margin-top: 0; } .pst-copy { min-height: 36px; font-size: 13px; } .flag.urgent .pst-copy { color: inherit; }',
      '.pst-onDark { background: var(--bg); color: var(--fg); border: none; }',
      '.pst-onLight { background: var(--card); }',
      '.pst-self { align-self: flex-start; }',
      '.pst-mt { margin-top: 8px; }',
      '.pst-full { width: 100%; }',
      '.pst-center { align-items: center; text-align: center; }',
      '.pst-fi { flex-shrink: 0; display: inline-flex; margin-top: 1px; }',
      '.pst-fi svg { width: 20px; height: 20px; }',
      '.pst-ft { min-width: 0; }',
      '.pst-link { border: none; background: transparent; color: var(--accent); font-weight: 600; padding: 0; font-size: inherit; min-height: 0; }',
      '.pst-bline { margin-top: -2px; }',
      '.pst-hero .big { margin-top: -2px; }',
      '.pst-ul { padding-left: 18px; display: flex; flex-direction: column; gap: 2px; font-size: 14px; }',
      '.pst-ul.small { font-size: 13px; }',
      '.pst-asha-q > summary { list-style: none; cursor: pointer; } .pst-asha-q > summary::-webkit-details-marker { display: none; } .pst-asha-q[open] > summary { margin-bottom: 10px; } .pst-asha-q[open] > summary .chev { transform: rotate(90deg); }',   /* Version 39.28 */
      '#pst-bset { flex-shrink: 0; white-space: nowrap; }',
      '.pst-txt { color: var(--text); font-size: 13px; }',
      '.pst-q { color: var(--fg); font-weight: 600; font-size: 14px; }',
      '.pst-form { gap: 16px; }',
      '.pst-grp { display: flex; flex-direction: column; gap: 8px; }',
      '.pst-grp[hidden] { display: none; }',
      '.pst-grp + .pst-grp { border-top: 1px solid var(--line); padding-top: 14px; }',
      '.pst-lbl { font-size: 13px; font-weight: 600; color: var(--fg); }',
      '.pst-inl { display: flex; flex-direction: column; gap: 8px; }',
      '.pst-inl:empty { display: none; }',
      '.pst-tip { background: var(--card-2); border-left: 3px solid var(--gold); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text); }',
      '.pst-hist { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 8px 8px 12px; background: var(--card-2); border-radius: 14px; color: var(--fg); }',
      '.pst-hist .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }',
      '.pst-hist .body strong { font-size: 13px; font-weight: 600; }',
      '.pst-hist .body span { font-size: 12px; color: var(--muted); }',
      '.pst-x { width: 40px; height: 40px; flex-shrink: 0; border-radius: 20px; border: none; background: transparent; color: var(--muted); display: inline-flex; align-items: center; justify-content: center; padding: 0; }',
      '.pst-x svg { width: 18px; height: 18px; }',
      '.pst-norm { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }',
      '.pst-norm li { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--text); margin: 0; }',
      '.pst-norm li.on { color: var(--fg); font-weight: 600; }',
      '.pst-norm .sw { margin-top: 4px; flex-shrink: 0; }',
      '.pst-sw0 { background: var(--accent-strong); } .pst-sw1 { background: var(--accent-2); } .pst-sw2 { background: var(--peach); }',
      '.pst-acc { background: var(--card); border-radius: 20px; padding: 14px 16px; box-shadow: var(--shadow); }',
      '.pst-acc > summary { font-size: 15px; color: var(--fg); font-weight: 600; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 30px; }',
      '.pst-acc > summary::-webkit-details-marker { display: none; }',
      '.pst-acc > summary::after { content: "+"; color: var(--accent); font-size: 22px; line-height: 1; font-weight: 600; flex-shrink: 0; }',
      '.pst-acc[open] > summary::after { content: "\\2212"; }',
      '.pst-body { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; font-size: 14px; color: var(--text); }',
      '.pst-myth { margin: 0; display: flex; flex-direction: column; gap: 4px; }',
      '.pst-myth dt { color: var(--fg); font-weight: 600; font-size: 14px; margin-top: 8px; }',
      '.pst-myth dt:first-child { margin-top: 0; }',
      '.pst-myth dd { margin: 0; font-size: 13px; color: var(--text); }',
      '.pst-myth .pill { margin-right: 4px; vertical-align: 1px; }',
      '.pst-kv { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); }',
      '.pst-kv dd { text-align: left; font-weight: 500; }',
      '.pst-side { min-height: 60px; font-size: 16px; }',
      '.pst-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }',
      '.pst-pills .pill { white-space: normal; }',
      '.pst-chev { color: var(--muted); flex-shrink: 0; display: inline-flex; }',
      '.pst-ticks { display: flex; gap: 8px; align-items: center; }',
      '.pst-tick { width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--accent); display: inline-flex; align-items: center; justify-content: center; color: var(--accent); font-size: 13px; font-weight: 600; }',
      '.pst-tick.on { background: var(--accent-strong); color: #FFFFFF; }',
      '.pst-strip { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }',
      '.pst-sd { height: 40px; border-radius: 10px; background: var(--card-2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; font-size: 11px; color: var(--muted); }',
      '.pst-sd b { font-weight: 500; font-size: 11px; }',
      '.pst-sd i { font-style: normal; font-size: 12px; font-weight: 600; }',
      '.pst-sd.on { background: var(--accent-soft); color: var(--fg); }',
      '.pst-sd.on i { color: var(--accent); }',
      '.pst-sd.today { outline: 2px solid var(--fg); outline-offset: -2px; }',
      '.pst-trainer { gap: 12px; }',
      '.pst-phase { font-size: 20px; font-weight: 600; color: var(--fg); min-height: 28px; }',
      '.pst-phase[data-phase="sq"] { color: var(--accent); }',
      '.pst-lv { display: flex; gap: 12px; align-items: center; }', '.pst-pos { width: 96px; height: 96px; object-fit: contain; flex: none; border-radius: 12px; }',
      '.pst-lv-b { min-width: 0; display: grid; gap: 4px; }', '.pst-lv-b p { margin: 0; overflow-wrap: anywhere; }', '.pst-hurt { align-self: center; min-height: 44px; }', '.pst-relax { display: grid; gap: 8px; }',
      '.pst-bar { height: 12px; border-radius: 6px; background: var(--bg); overflow: hidden; }',
      '.pst-bar i { display: block; height: 100%; border-radius: 6px; background: var(--accent-strong); transition: width 0.2s linear; }',
      '.pst-vd { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }',
      '.pst-vdi { display: flex; flex-direction: column; gap: 1px; padding: 8px 6px; border-radius: 12px; background: var(--card-2); text-align: center; font-size: 11px; color: var(--muted); }',
      '.pst-vdi b { color: var(--fg); font-size: 12px; font-weight: 600; }',
      '.pst-vdi i { font-style: normal; }',
      '.pst-vdi em { font-style: normal; font-weight: 600; min-height: 14px; }',
      '.pst-vdi.past { opacity: 0.6; }',
      '.pst-vdi.next { background: var(--accent-soft); outline: 2px solid var(--accent); outline-offset: -2px; }',
      '.pst-vdi.next em { color: var(--accent); }',
      '.pst-vlist { display: flex; flex-direction: column; }',
      '.pst-vx { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.5fr); gap: 4px 12px; padding: 10px 0; border-top: 1px solid var(--line); font-size: 13px; }',
      '.pst-vx:first-child { border-top: none; padding-top: 2px; }',
      '.pst-va { display: flex; flex-direction: column; gap: 2px; min-width: 0; }',
      '.pst-va strong { color: var(--fg); font-weight: 600; }',
      '.pst-va span { color: var(--muted); font-size: 12px; }',
      '.pst-vv { color: var(--text); min-width: 0; overflow-wrap: anywhere; }',
      '.pst-vx.past .pst-va span { color: var(--gold); }',
      '.pst-vx.next .pst-va span { color: var(--accent); font-weight: 600; }'
    ].join('\n'),
    home: home,
    summary: summary,
    sample: sample,
    afterRender: (v, route) => {
      if (route !== R.feed) stopFeedTick();
      if (route !== R.pelvic && route !== 'pf-go') { stopPfTick(); PF = null; pfDone = null; }   /* Version 39.56: pf-go draws the trainer */
      if (route !== R.rec) draft = null;
      if (route !== R.mood) moodQ = { q1: null, q2: null };
      if (route !== R.hub && route !== R.checks) editBirth = false;
    }
  });
})(window.Saathi);
