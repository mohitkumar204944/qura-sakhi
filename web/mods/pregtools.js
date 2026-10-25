/* Pregnancy tools: kick counter, contraction timer, hospital bag and birth plan, and preparing for birth. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const R = { kicks: 'pregtools-kicks', ctx: 'pregtools-contractions', bag: 'pregtools-bag', birth: 'pregtools-birth' };
  const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  const BAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2.5"/><path d="M9 8V6a3 3 0 016 0v2M4 13h16M11 13v2h2v-2"/></svg>';

  /* ---------- strings: [English, Hindi]; every key becomes pregtools_<key> ---------- */
  const P = {
    t_kicks: ['Kick counter', 'किक काउंटर'],
    t_kicks_s: ["Get to know your baby's usual movements, from about 28 weeks", 'लगभग 28 हफ़्ते से बच्चे की आम हलचल पहचानें'],
    t_ctx: ['Labour pain timer', 'लेबर दर्द टाइमर'],
    t_ctx_s: ['Time each contraction, see the gaps, know when to go', 'हर दर्द का समय, बीच का अंतर, और कब निकलना है'],
    t_bag: ['Hospital bag and birth plan', 'अस्पताल का बैग और डिलीवरी की योजना'],
    t_bag_s: ['Papers, things for you and baby, transport, who comes', 'काग़ज़, आपका और बच्चे का सामान, गाड़ी, साथ कौन जाएगा'],
    t_birth: ['Preparing for birth', 'डिलीवरी की तैयारी'],
    t_birth_s: ['Labour signs, normal birth, C-section, pain relief, the first hour', 'लेबर के संकेत, नॉर्मल डिलीवरी, ऑपरेशन, दर्द में राहत, पहला घंटा'],
    min: ['min', 'मिनट'], sec: ['sec', 'सेकंड'], remove: ['Remove', 'हटाएँ'], more: ['Related', 'इससे जुड़े'],
    schemes: ['Scheme money you can claim', 'योजनाओं का पैसा जो आपको मिल सकता है'], schemes_s: ['What to claim, where, and which papers', 'क्या मिलेगा, कहाँ से, और कौन से काग़ज़'],
    amb_h: ['Free ambulance', 'मुफ़्त एम्बुलेंस'], amb108: ['Ambulance', 'एम्बुलेंस'], amb102: ['Ambulance for pregnant women and babies', 'गर्भवती महिलाओं और बच्चों की एम्बुलेंस'], amb112: ['Emergency, any kind', 'आपातकाल, किसी भी तरह का'],
    amb_note: ['Under JSSK the ambulance is free: from home to a government hospital, between hospitals if you are referred, and back home after the birth. In many states 102 is the ambulance for pregnant women and 108 is for emergencies; some states run only one of them. Your ASHA knows which number works in your area.', 'JSSK के तहत एम्बुलेंस मुफ़्त है: घर से सरकारी अस्पताल तक, refer होने पर एक अस्पताल से दूसरे तक, और डिलीवरी के बाद घर वापस। कई राज्यों में 102 गर्भवती महिलाओं की एम्बुलेंस है और 108 इमरजेंसी की; कुछ राज्यों में इनमें से एक ही चलता है। आपके इलाक़े में कौन सा नंबर चलता है, यह आपकी ASHA जानती हैं।'],

    /* kick counter */
    k_h: ['Kick counter', 'किक काउंटर'],
    k_p: ["From about 28 weeks, get to know your baby's usual pattern. Counting helps you notice a change. It is not a test to pass or fail.", 'लगभग 28 हफ़्ते से अपने बच्चे की हलचल का आम पैटर्न पहचानें। गिनने से बदलाव जल्दी पकड़ में आता है। यह पास-फ़ेल वाला test नहीं है।'],
    k_now: ['No movement at all, or the movements have stopped: go to hospital now. Free ambulance 108 or 102.', 'बिल्कुल हलचल नहीं, या हलचल रुक गई: अभी अस्पताल जाएँ। मुफ़्त एम्बुलेंस 108 या 102।'],
    k_today: ["Fewer or weaker movements than usual: call your hospital or doctor straight away and get checked today, even if it is the middle of the night. Don't wait until tomorrow, and don't go to sleep on it.", 'आम दिनों से कम या हल्की हलचल: तुरंत अस्पताल या डॉक्टर को फ़ोन करें और आज ही जाँच कराएँ, चाहे आधी रात हो। कल तक इंतज़ार न करें, और इसे टालकर सो न जाएँ।'],
    k_start: ['Start counting', 'गिनती शुरू करें'],
    k_how1: ['Sit with your feet up or lie on your side, at a time your baby is usually active. Tap once for each kick, flutter, swish or roll.', 'पैर ऊपर करके बैठें या करवट लेकर लेटें, उस समय जब बच्चा आम तौर पर ज़्यादा हिलता है। हर किक, फड़कन, घूमने या लुढ़कने पर एक बार टैप करें।'],
    k_tap: ['Tap when baby moves', 'बच्चा हिले तो टैप करें'],
    k_counting: ['Counting', 'गिनती चल रही है'],
    k_undo: ['Undo last tap', 'पिछला टैप हटाएँ'], k_stop: ['Stop', 'रोकें'],
    k_done: ['10 movements in {m} min.', '{m} मिनट में 10 हलचल।'],
    k_part: ['{n} movements in {m} min. Stopped before 10.', '{m} मिनट में {n} हलचल। 10 से पहले रोका।'],
    k_part_note: ["Stopping early is fine. If your baby is moving less than usual today, call your hospital straight away.", 'बीच में रोकना ठीक है। अगर आज बच्चा आम दिनों से कम हिल रहा है, तो तुरंत अस्पताल को फ़ोन करें।'],
    k_leave: ['Leaving this screen ends the count. Movements counted so far are kept.', 'यह पन्ना छोड़ने पर गिनती ख़त्म हो जाती है। अब तक की गिनती रखी जाती है।'],
    k_pattern: ['Your pattern', 'आपका पैटर्न'],
    k_range: ['Your last {k} counts reached 10 in {a}–{b} minutes.', 'आपकी पिछली {k} गिनतियों में 10 हलचल {a}–{b} मिनट में हुईं।'],
    k_one: ['Your first full count reached 10 in {a} minutes. A few more days of counting will show your usual.', 'आपकी पहली पूरी गिनती में 10 हलचल {a} मिनट में हुईं। कुछ और दिन गिनने से आपका आम समय पता चलेगा।'],
    k_chart: ['Minutes to 10 movements, oldest to newest', '10 हलचल में लगे मिनट, पुरानी से नई'],
    k_own: ["Compare with your own baby's usual, not with anyone else's number. If you notice a clear change, call your hospital straight away.", 'अपने बच्चे के आम पैटर्न से मिलाएँ, किसी और के नंबर से नहीं। साफ़ बदलाव दिखे तो तुरंत अस्पताल को फ़ोन करें।'],
    k_hist: ['Your counts', 'आपकी गिनतियाँ'], k_none: ['No counts yet. Your first one will show here.', 'अभी कोई गिनती नहीं। पहली गिनती यहाँ दिखेगी।'],
    k_row10: ['10 in {m} min', '{m} मिनट में 10'], k_rowp: ['{n} in {m} min, stopped', '{m} मिनट में {n}, रोका'],
    k_howh: ['How to count', 'कैसे गिनें'],
    k_s1: ['Pick a time when your baby is usually active, such as after a meal or in the evening.', 'ऐसा समय चुनें जब बच्चा आम तौर पर ज़्यादा हिलता है, जैसे खाने के बाद या शाम को।'],
    k_s2: ['Sit with your feet up or lie on your side, with a hand on your belly.', 'पैर ऊपर करके बैठें या करवट लेकर लेटें, हाथ पेट पर रखें।'],
    k_s3: ['Tap for every kick, flutter, swish or roll. Stop at 10.', 'हर किक, फड़कन, घूमने या लुढ़कने पर टैप करें। 10 पर रुकें।'],
    k_s4: ['Count at about the same time each day. In a week or two you will know how long your baby usually takes.', 'रोज़ लगभग एक ही समय गिनें। एक-दो हफ़्ते में पता चल जाएगा कि आपका बच्चा आम तौर पर कितना समय लेता है।'],
    k_doc: ['Your doctor or ANM may ask you to count in a different way. Follow what they say.', 'आपकी डॉक्टर या ANM किसी और तरीक़े से गिनने को कह सकती हैं। वही करें जो वे कहें।'],
    k_evid: ['Counting is optional. There is no proof that counting to a set number prevents problems (RCOG, 2026). What matters is your baby’s own pattern: if movements feel fewer, weaker or different from usual, call your hospital the same day. Don’t wait to finish a count.', 'गिनती ज़रूरी नहीं। तय संख्या तक गिनने से दिक़्क़तें रुकती हैं, इसका कोई सबूत नहीं (RCOG, 2026)। ज़रूरी है आपके बच्चे का अपना पैटर्न: हरकतें कम, कमज़ोर या रोज़ से अलग लगें, तो उसी दिन अस्पताल को फ़ोन करें। गिनती पूरी होने का इंतज़ार न करें।'],
    k_late: ["Many families say babies move less near the end because there is no room left. Yes, the movements feel different: more rolls and pushes, fewer sharp kicks. But they should not become fewer. You should feel your baby move right up to labour, and during it.", 'कई घरों में कहा जाता है कि आख़िरी दिनों में जगह कम होने से बच्चा कम हिलता है। हाँ, हलचल बदली हुई लगती है: तेज़ किक कम, घूमना और धक्का देना ज़्यादा। पर हलचल कम नहीं होनी चाहिए। लेबर तक, और लेबर के दौरान भी, बच्चे की हलचल महसूस होनी चाहिए।'],
    k_doppler: ["Don't rely on a home heartbeat machine (doppler). Hearing a heartbeat does not mean your baby is well. If you are worried, get checked at the hospital.", 'घर पर धड़कन सुनने वाली मशीन (doppler) पर भरोसा न करें। धड़कन सुनाई देने का मतलब यह नहीं कि बच्चा ठीक है। चिंता हो तो अस्पताल में जाँच कराएँ।'],
    k_free: ['Checks for pregnancy problems are free at government hospitals under JSSK.', 'सरकारी अस्पताल में JSSK के तहत गर्भावस्था की दिक़्क़तों की जाँच मुफ़्त है।'],
    k_know: ['Good to know', 'जानने लायक बातें'],
    k_early: ['You are about {w} weeks. A steady pattern usually settles from about 28 weeks, so for now some days will feel busier than others. If you have not felt your baby move at all by 24 weeks, tell your doctor or ANM. If movements you were feeling slow down or stop, contact your hospital the same day for a heartbeat check.', 'आप लगभग {w} हफ़्ते की हैं। हलचल का पक्का पैटर्न आम तौर पर लगभग 28 हफ़्ते से बनता है, इसलिए अभी किसी दिन ज़्यादा, किसी दिन कम लगेगी। अगर 24 हफ़्ते तक बच्चे की कोई हलचल महसूस नहीं हुई, तो अपनी डॉक्टर या ANM को बताएँ। जो हलचल हो रही थी वह कम हो जाए या रुक जाए, तो उसी दिन धड़कन की जाँच के लिए अस्पताल से संपर्क करें।'],
    k_notset: ["Set 'Pregnant' on the Me page so this screen can show your week.", 'यह पन्ना आपका हफ़्ता दिखा सके, इसके लिए “मैं” पन्ने पर “गर्भवती” चुनें।'],
    k_notdx: ['Not a diagnosis. The counter only counts. A check at the hospital tells you how your baby is.', 'यह diagnosis नहीं है। काउंटर सिर्फ़ गिनता है। बच्चा कैसा है, यह अस्पताल की जाँच से पता चलता है।'],

    /* contraction timer */
    c_h: ['Labour pain timer', 'लेबर दर्द टाइमर'],
    c_p: ['Press Start when a pain begins and Stop when it ends. You will see how long each one lasts and how far apart they are, from the start of one to the start of the next.', 'दर्द शुरू हो तो “शुरू” दबाएँ, ख़त्म हो तो “रोकें”। आपको दिखेगा कि हर दर्द कितनी देर चला और दो दर्दों में कितना अंतर है, एक के शुरू होने से अगले के शुरू होने तक।'],
    c_start: ['Start: pain began', 'शुरू: दर्द उठा'], c_stop: ['Stop: pain ended', 'रोकें: दर्द गया'],
    c_in: ['Contraction running', 'दर्द चल रहा है'], c_since: ['Since the last one started', 'पिछले दर्द के शुरू होने से अब तक'], c_ready: ['Ready when the next pain starts', 'अगला दर्द उठे तो दबाएँ'],
    c_long: ['This one has lasted over 2 minutes. If it does not ease, call your hospital now.', 'यह दर्द 2 मिनट से ज़्यादा चल चुका है। आराम न मिले तो अभी अस्पताल को फ़ोन करें।'],
    c_last: ['Last contraction', 'पिछला दर्द'], c_lasted: ['Lasted', 'कितनी देर चला'], c_gap: ['Gap from the one before', 'उससे पहले वाले से अंतर'],
    c_hour: ['Last hour', 'पिछला एक घंटा'], c_count: ['Contractions', 'दर्द कितनी बार'], c_avglen: ['Average length', 'औसत लंबाई'], c_avggap: ['Average gap', 'औसत अंतर'],
    c_table: ['This session', 'इस बार के दर्द'], c_time: ['Started', 'शुरू'], c_len: ['Length', 'लंबाई'], c_gapcol: ['Gap', 'अंतर'],
    c_undo: ['Remove the last one', 'आख़िरी वाला हटाएँ'],
    c_leave: ['Leaving this screen stops the clock. A pain you are timing at that moment is not saved; the others are kept.', 'यह पन्ना छोड़ने पर घड़ी रुक जाती है। उस समय चल रहा दर्द सेव नहीं होता; बाक़ी सब रखे जाते हैं।'],
    c_match: ['In the last hour your contractions came about every {g} and lasted about {d}. This matches the usual guide for going to hospital with a first baby. Leave now and call your hospital on the way.', 'पिछले एक घंटे में दर्द लगभग हर {g} पर आए और लगभग {d} चले। पहले बच्चे में अस्पताल जाने का आम पैमाना यही है। अभी निकलें और रास्ते में अस्पताल को फ़ोन करें।'],
    c_close: ['Your contractions are about {g} apart. If this is not your first baby, or your hospital is far, leave now. Otherwise keep timing.', 'आपके दर्द लगभग {g} के अंतर पर आ रहे हैं। पहला बच्चा न हो, या अस्पताल दूर हो, तो अभी निकलें। नहीं तो समय नोट करती रहें।'],
    c_urgent: ['A contraction longer than 2 minutes, or 6 or more in 10 minutes: call your hospital now and go in.', '2 मिनट से लंबा दर्द, या 10 मिनट में 6 या ज़्यादा दर्द: अभी अस्पताल को फ़ोन करें और जाएँ।'],
    c_preterm: ["You are about {w} weeks. Regular tightenings or period-like pains before 37 weeks need a check now. Don't wait to time them: go to hospital.", 'आप लगभग {w} हफ़्ते की हैं। 37 हफ़्ते से पहले बार-बार पेट कसना या पीरियड जैसा दर्द हो तो अभी जाँच ज़रूरी है। समय नापने का इंतज़ार न करें: अस्पताल जाएँ।'],
    go_h: ['Go to hospital now, whatever the timing, if', 'समय कुछ भी हो, अभी अस्पताल जाएँ अगर'],
    go_1: ['Your waters break, more so if the fluid is green, brown or smells bad', 'पानी की थैली फटे, ख़ासकर अगर पानी हरा, भूरा हो या उसमें बदबू हो'],
    go_2: ['Any bleeding from the vagina', 'योनि से कोई भी ब्लीडिंग'],
    go_3: ['Your baby is moving less than usual', 'बच्चा आम दिनों से कम हिल रहा हो'],
    go_4: ['Fits, a severe headache, blurred vision, or pain high in the belly', 'दौरे, तेज़ सिरदर्द, धुंधला दिखना, या पेट के ऊपरी हिस्से में दर्द'],
    go_5: ['Constant, severe pain with no break between contractions', 'लगातार तेज़ दर्द, दो दर्दों के बीच कोई आराम नहीं'],
    go_6: ['Fever, or you feel very unwell', 'बुख़ार, या तबीयत बहुत ख़राब लगे'],
    go_7: ['Labour pains before 37 weeks', '37 हफ़्ते से पहले लेबर जैसे दर्द'],
    go_call: ['Call 108 or 102 for a free ambulance, or 112.', 'मुफ़्त एम्बुलेंस के लिए 108 या 102 पर, या 112 पर कॉल करें।'],
    w_h: ['When to go to hospital', 'अस्पताल कब जाएँ'],
    w_1: ['At your 36-week visit, ask your doctor or ANM when they want you to come in, and to which hospital.', '36 हफ़्ते वाली जाँच में अपनी डॉक्टर या ANM से पूछें कि कब आना है और किस अस्पताल में।'],
    w_2: ["India's guidelines for health workers say to set off once labour signs start: a sticky, blood-streaked discharge, or painful contractions that keep getting longer, stronger and closer together.", 'भारत के स्वास्थ्य कर्मियों के दिशानिर्देश कहते हैं कि लेबर के संकेत शुरू होते ही निकल पड़ें: ख़ून मिला चिपचिपा स्राव, या ऐसा दर्द जो लगातार लंबा, तेज़ और पास-पास होता जाए।'],
    w_3: ["Go as soon as they start if this is not your first baby, your hospital is far, or a vehicle takes time to reach you, especially at night.", 'पहला बच्चा न हो, अस्पताल दूर हो, या गाड़ी आने में समय लगता हो (ख़ासकर रात में), तो दर्द शुरू होते ही निकलें।'],
    w_4: ["If it is your first baby and the hospital is close, some doctors suggest waiting at home until contractions come about every 5 minutes, each lasting about 1 minute, for about 1 hour (the 5‑1‑1 guide). Don't wait beyond that.", 'पहला बच्चा हो और अस्पताल पास हो, तो कुछ डॉक्टर घर पर तब तक रुकने को कहते हैं जब तक दर्द लगभग हर 5 मिनट पर न आने लगे, हर दर्द लगभग 1 मिनट का, और ऐसा लगभग 1 घंटे तक (5‑1‑1 पैमाना)। इससे ज़्यादा इंतज़ार न करें।'],
    w_5: ['False labour pains are irregular, do not come closer together, and often ease when you rest, walk or change position.', 'झूठे लेबर दर्द बेतरतीब होते हैं, पास-पास नहीं आते, और अक्सर आराम करने, चलने या करवट बदलने पर कम हो जाते हैं।'],
    c_past: ['Earlier sessions', 'पहले के दर्द'],
    c_pastrow: ['{n} contractions, about every {g}, about {d} long', '{n} दर्द, लगभग हर {g} पर, लगभग {d} लंबे'],
    c_pastone: ['1 contraction, {d} long', '1 दर्द, {d} लंबा'],
    c_notdx: ["The timer only measures. It can't tell whether labour has started; a check at the hospital can.", 'टाइमर सिर्फ़ समय नापता है। लेबर शुरू हुआ या नहीं, यह अस्पताल की जाँच से पता चलता है।'],

    /* bag and plan */
    b_h: ['Hospital bag and birth plan', 'अस्पताल का बैग और डिलीवरी की योजना'],
    b_p: ['Pack by about 36 weeks and keep the bag where everyone at home can find it. Tick each item as you pack.', 'लगभग 36 हफ़्ते तक बैग तैयार कर लें और ऐसी जगह रखें जहाँ घर में सबको मिल जाए। जो सामान रख लें, उस पर टिक करें।'],
    b_prog: ['{n} of {t} packed', '{t} में से {n} रख लिए'],
    b_plan: ['Your birth plan', 'आपकी डिलीवरी की योजना'],
    b_plan_p: ['Decide these with your family and your ASHA well before your due date.', 'ये बातें डिलीवरी की तारीख़ से काफ़ी पहले अपने परिवार और ASHA के साथ तय कर लें।'],
    b_plan_prog: ['{n} of {t} ready', '{t} में से {n} तैयार'],
    f_hosp: ['Which hospital', 'कौन सा अस्पताल'],
    f_hosp_h: ['Choose one that does deliveries 24 hours and can do a C-section and give blood if needed, often the district hospital or a First Referral Unit. Your ANM can tell you which.', 'ऐसा अस्पताल चुनें जहाँ 24 घंटे डिलीवरी होती हो और ज़रूरत पड़ने पर ऑपरेशन और ख़ून चढ़ाने की सुविधा हो, अक्सर ज़िला अस्पताल या First Referral Unit। आपकी ANM बता सकती हैं।'],
    f_trans: ['Backup vehicle: driver\'s phone', 'दूसरी गाड़ी: ड्राइवर का फ़ोन'],
    f_trans_h: ['The free ambulance is 102 or 108, depending on your state. Write here the number of a vehicle you can call if the ambulance is late.', 'मुफ़्त एम्बुलेंस 102 या 108 है, राज्य के हिसाब से। एम्बुलेंस देर से आए तो जिस गाड़ी को बुला सकें, उसका नंबर यहाँ लिखें।'],
    f_comp: ['Who will come with you', 'साथ कौन जाएगा'],
    f_comp_h: ['Government labour-room rules (LaQshya) allow one birth companion of your choice to stay with you. Pick someone calm you trust.', 'सरकारी लेबर रूम के नियम (LaQshya) आपकी पसंद के एक साथी को आपके पास रहने देते हैं। किसी शांत, भरोसेमंद व्यक्ति को चुनें।'],
    f_donor: ['Blood donors', 'ख़ून देने वाले'],
    f_donor_h: ['1–2 healthy adults who agree to give blood if you need it. Write their phone numbers.', '1–2 स्वस्थ लोग जो ज़रूरत पड़ने पर ख़ून देने को तैयार हों। उनके फ़ोन नंबर लिखें।'],
    f_asha: ['ASHA or ANM phone', 'ASHA या ANM का फ़ोन'],
    p_route: ['We know the route and how long it takes, by day and at night', 'रास्ता और लगने वाला समय पता है, दिन में भी और रात में भी'],
    p_money: ['Some emergency money is kept aside', 'इमरजेंसी के लिए कुछ पैसे अलग रखे हैं'],
    p_home: ['Someone will look after the children and the house', 'बच्चों और घर को कोई सँभाल लेगा'],
    b_save: ['Save plan', 'योजना सेव करें'], b_saved: ['Plan saved.', 'योजना सेव हो गई।'],
    b_money_h: ['What is free', 'क्या मुफ़्त है'],
    b_money: ['In government hospitals, JSSK makes these free: the delivery, a C-section, medicines, tests, blood, food (3 days after a normal birth, 7 after a C-section) and transport both ways. Keep some money for emergencies anyway.', 'सरकारी अस्पताल में JSSK के तहत ये मुफ़्त हैं: डिलीवरी, ऑपरेशन, दवाएँ, जाँचें, ख़ून, खाना (नॉर्मल डिलीवरी के बाद 3 दिन, ऑपरेशन के बाद 7 दिन) और आने-जाने की गाड़ी। फिर भी इमरजेंसी के लिए कुछ पैसे अलग रखें।'],
    b_badhai: ['Staff should not ask your family for any money, including "badhai" for the birth. The LaQshya labour-room rules say families should not have to pay anything, formal or informal.', 'स्टाफ़ को आपके परिवार से कोई पैसा नहीं माँगना चाहिए, जन्म की “बधाई” के नाम पर भी नहीं। LaQshya लेबर रूम के नियम कहते हैं कि परिवार को कोई फ़ीस या ऊपर से पैसा नहीं देना पड़ना चाहिए।'],
    b_tip: ['Tell everyone at home where the bag and this plan are. Keep the MCP card on top.', 'घर में सबको बता दें कि बैग और यह योजना कहाँ है। MCP card सबसे ऊपर रखें।'],

    /* birth guide */
    r_h: ['Preparing for birth', 'डिलीवरी की तैयारी'],
    r_p: ['Here is what usually happens, so you know what to expect. Every birth is different, and the hospital team will guide you on the day.', 'आम तौर पर क्या होता है, ताकि आपको पहले से पता रहे। हर डिलीवरी अलग होती है, और उस दिन अस्पताल की टीम आपको बताती रहेगी।'],
    r_ask_h: ['Want to talk it through?', 'किसी से बात करना चाहती हैं?'],
    r_ask_p: ['A free 20-minute call with a Qura doctor (BAMS) can help you list questions for your hospital visit and plan food, sleep and movement for these last weeks. How you give birth is decided with your obstetrician at the hospital.', 'Qura की डॉक्टर (BAMS) से 20 मिनट की मुफ़्त कॉल में आप अस्पताल में पूछने वाले सवाल तैयार कर सकती हैं, और इन आख़िरी हफ़्तों के खाने, नींद और चलने-फिरने की योजना बना सकती हैं। डिलीवरी कैसे होगी, यह अस्पताल में आपकी स्त्री रोग विशेषज्ञ के साथ तय होता है।'],
    r_ask_topic: ['Preparing for birth', 'डिलीवरी की तैयारी'],
    r_src: ['Based on MoHFW guidelines for antenatal care and skilled birth attendance (2010), LaQshya (2017), JSSK, and RCOG, NHS and ACOG patient information.', 'स्वास्थ्य मंत्रालय के ANC और प्रशिक्षित दाई से डिलीवरी के दिशानिर्देश (2010), LaQshya (2017), JSSK, और RCOG, NHS व ACOG की मरीज़ जानकारी पर आधारित।'],

    /* home + summary */
    home_h: ['Is your hospital bag ready?', 'क्या आपका अस्पताल का बैग तैयार है?'],
    home_p: ['{n} of {t} packed. From 36 weeks, keep it by the door.', '{t} में से {n} रख लिए। 36 हफ़्ते से बैग दरवाज़े के पास रखें।'],
    sum_h: ['Pregnancy tools', 'गर्भावस्था के टूल'],
    sum_k: ['Kick counts in the last 7 days: {n}', 'पिछले 7 दिनों में हलचल की गिनती: {n}'],
    sum_k2: ['reached 10 in {a}–{b} min', '10 हलचल {a}–{b} मिनट में'],
    sum_c: ['Contraction sessions timed: {n}. Last on {d}: {c} contractions', 'दर्द का समय कितनी बार नापा: {n}। पिछली बार {d} को: {c} दर्द'],
    sum_c2: ['about every {g}, about {l} long', 'लगभग हर {g} पर, लगभग {l} लंबे'],
    sum_b: ['Hospital bag: {n} of {t} packed. Birth plan: {p} of {q} ready', 'अस्पताल का बैग: {t} में से {n} रखे। डिलीवरी की योजना: {q} में से {p} तैयार']
  };
  const strings = { en: {}, hi: {} };
  Object.keys(P).forEach((k) => { strings.en['pregtools_' + k] = P[k][0]; strings.hi['pregtools_' + k] = P[k][1]; });
  const T = (k) => t('pregtools_' + k);
  const TF = (k, o) => tf('pregtools_' + k, o);

  /* ---------- hospital bag list ---------- */
  const BAG = [
    { id: 'docs', h: { en: 'Papers', hi: 'काग़ज़ात' }, items: [
      ['mcp', 'MCP card (Mother and Child Protection card)', 'MCP card (जच्चा-बच्चा सुरक्षा कार्ड)'],
      ['idcard', 'Aadhaar card or another photo ID', 'आधार कार्ड या कोई और फ़ोटो पहचान पत्र'],
      ['bank', 'Bank or post office passbook: scheme money is paid into your account, usually one linked to your Aadhaar', 'बैंक या डाकघर की पासबुक: योजनाओं का पैसा आपके खाते में आता है, आम तौर पर आधार से जुड़े खाते में'],
      ['reports', 'All scan and test reports, including your blood group', 'सारी scan और जाँच की reports, blood group की report भी'],
      ['meds', 'Your medicines, prescriptions and any referral slip', 'आपकी दवाएँ, पर्चे और कोई referral पर्ची'],
      ['oldop', 'Papers from any earlier delivery or operation', 'पिछली डिलीवरी या ऑपरेशन के काग़ज़, अगर हों'],
      ['phone', 'Phone and charger, with key numbers also written on paper', 'फ़ोन और चार्जर, ज़रूरी नंबर काग़ज़ पर भी लिखे हुए']
    ] },
    { id: 'mother', h: { en: 'For you', hi: 'आपके लिए' }, items: [
      ['clothes', '2–3 loose kurtas or nighties that open at the front, for feeding', 'दूध पिलाने के लिए आगे से खुलने वाले 2–3 ढीले कुर्ते या नाइटी'],
      ['pads', 'Thick sanitary pads or maternity pads, at least one big pack', 'मोटे sanitary pad या maternity pad, कम से कम एक बड़ा पैकेट'],
      ['under', '4–5 pairs of underwear (old ones are fine)', '4–5 अंडरवियर (पुराने भी चलेंगे)'],
      ['warm', 'Dupatta or shawl, socks and slippers', 'दुपट्टा या शॉल, मोज़े और चप्पल'],
      ['wash', 'Towel, soap, toothbrush and paste, comb, hair band', 'तौलिया, साबुन, टूथब्रश और पेस्ट, कंघी, रबर बैंड'],
      ['water', 'Water bottle and light snacks like biscuits or dry fruit', 'पानी की बोतल और हल्का नाश्ता, जैसे बिस्कुट या मेवे']
    ] },
    { id: 'baby', h: { en: 'For your baby', hi: 'बच्चे के लिए' }, items: [
      ['bclothes', '3–4 soft cotton jhablas or baby clothes', '3–4 मुलायम सूती झबले या कपड़े'],
      ['cap', 'Cap, mittens and socks to keep your baby warm', 'बच्चे को गर्म रखने के लिए टोपी, दस्ताने और मोज़े'],
      ['cloths', '5–6 soft cotton cloths, washed and sun-dried, for nappies and wiping', 'लंगोट और पोंछने के लिए 5–6 मुलायम सूती कपड़े, धुले और धूप में सुखाए'],
      ['wrap', 'A warm wrap or small blanket', 'लपेटने के लिए गर्म कपड़ा या छोटा कंबल']
    ] },
    { id: 'govt', h: { en: 'For a stay in a government hospital', hi: 'सरकारी अस्पताल में रुकने के लिए' }, items: [
      ['sheet', 'An extra bedsheet and a light blanket', 'एक अतिरिक्त चादर और हल्का कंबल'],
      ['utensils', 'Steel glass, plate, spoon and a flask for hot water', 'स्टील का गिलास, थाली, चम्मच और गर्म पानी के लिए थर्मस'],
      ['cash', 'Some cash in small notes for small needs', 'छोटी-मोटी ज़रूरतों के लिए खुले पैसे'],
      ['food', 'Food, or money for food, for the person who stays with you', 'साथ रुकने वाले के लिए खाना, या खाने के पैसे'],
      ['dirty', 'A bag for used clothes', 'इस्तेमाल किए कपड़ों के लिए एक थैला']
    ] }
  ];
  const BAG_IDS = BAG.reduce((a, g) => a.concat(g.items.map((x) => x[0])), []);
  const PLAN_FIELDS = [['hosp', 'f_hosp', 'f_hosp_h'], ['trans', 'f_trans', 'f_trans_h'], ['comp', 'f_comp', 'f_comp_h'], ['donor', 'f_donor', 'f_donor_h'], ['asha', 'f_asha', '']];
  const PLAN_TICKS = ['p_route', 'p_money', 'p_home'];
  const PLAN_TOTAL = PLAN_FIELDS.length + PLAN_TICKS.length;

  /* ---------- storage: saved only with a diary; browse mode keeps entries in memory for this visit ---------- */
  const TEMP = { kicks: [], ctx: [], bag: {}, plan: {} };
  const fill = (d) => { if (!Array.isArray(d.kicks)) d.kicks = []; if (!Array.isArray(d.ctx)) d.ctx = []; if (!d.bag || typeof d.bag !== 'object') d.bag = {}; if (!d.plan || typeof d.plan !== 'object') d.plan = {}; return d; };
  const store = () => (S.canSave() ? fill(S.data('pregtools')) : TEMP);
  const persist = (st) => { if (S.canSave() && st === (S.state.mods || {}).pregtools) S.save(); };
  const bagDone = (st) => BAG_IDS.filter((k) => st.bag[k]).length;
  const planDone = (st) => PLAN_FIELDS.filter((f) => String(st.plan[f[0]] || '').trim()).length + PLAN_TICKS.filter((k) => st.plan[k]).length;

  /* ---------- small helpers ---------- */
  const weeks = () => { const p = S.preg && S.preg.info(); return p ? p.weeks : null; };
  const loc = () => (S.langMeta(S.state.lang) || {}).locale || 'en-IN';
  const fmtTime = (ms) => { try { return new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date(ms)); } catch (e) { const d = new Date(ms); return S.pad2(d.getHours()) + ':' + S.pad2(d.getMinutes()); } };
  const fmtDay = (ms) => S.fmtD(new Date(ms), { day: 'numeric', month: 'short' });
  const clock = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h ? h + ':' : '') + S.pad2(m) + ':' + S.pad2(s); };
  const dur = (sec) => { sec = Math.max(0, Math.round(sec)); if (sec < 60) return sec + ' ' + T('sec'); const m = Math.floor(sec / 60), s = sec % 60; return m + ' ' + T('min') + (s ? ' ' + s + ' ' + T('sec') : ''); };
  const roundDur = (sec) => dur(sec >= 60 ? Math.round(sec / 10) * 10 : Math.round(sec / 5) * 5);
  const mins = (sec) => Math.max(1, Math.round(sec / 60));
  const avg = (a) => (a.length ? a.reduce((p, q) => p + q, 0) / a.length : null);
  const fi = (svg) => '<span class="ptl-fi" aria-hidden="true">' + svg + '</span>';
  const has = (r) => !!S.routeOwner(r) || S.modules.some((m) => Object.keys(m.prefixes || {}).some((p) => r.indexOf(p) === 0));
  const backTo = () => (S.routeOwner('preg') ? 'preg' : 'care');
  const notMine = (r) => r !== R.kicks && r !== R.ctx;
  let tick = null;
  const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };

  function ambulance() {
    return '<div class="stack"><h2>' + esc(T('amb_h')) + '</h2><div class="list">' + [['108', 'amb108'], ['102', 'amb102'], ['112', 'amb112']].map((x) => '<div class="helpline"><div style="min-width:0"><div class="n num">' + x[0] + '</div><div class="what">' + esc(T(x[1])) + '</div></div><button type="button" class="btn sm" data-ptl-copy="' + x[0] + '">' + esc(t('copy')) + '</button></div>').join('') + '</div><p class="small">' + esc(T('amb_note')) + '</p></div>';
  }
  function wireCopy(v) {
    v.querySelectorAll('[data-ptl-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.ptlCopy; const done = () => S.toast(t('copied') + ' ' + n);
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(done, () => S.toast(n)); else S.toast(n); } catch (e) { S.toast(n); }
    }));
  }
  function goNow() {
    return '<div class="flag urgent ptl-col"><h3>' + esc(T('go_h')) + '</h3><ul>' + ['go_1', 'go_2', 'go_3', 'go_4', 'go_5', 'go_6', 'go_7'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ul><p><strong>' + esc(T('go_call')) + '</strong></p></div>';
  }
  function related(cur) {
    const all = [[R.kicks, 't_kicks', 't_kicks_s', S.I.baby], [R.bag, 't_bag', 't_bag_s', BAG_SVG], [R.birth, 't_birth', 't_birth_s', S.I.heart], [R.ctx, 't_ctx', 't_ctx_s', S.I.clock]];
    const items = all.filter((x) => x[0] !== cur);
    if (cur !== R.kicks && cur !== R.bag && has('access-schemes-preg')) items.push(['access-schemes-preg', 'schemes', 'schemes_s', S.I.file]);
    return '<h2>' + esc(T('more')) + '</h2><div class="list">' + items.map((x) => '<button type="button" class="item" data-go="' + esc(x[0]) + '"><span class="ico-sm">' + x[3] + '</span><span class="body"><strong>' + esc(T(x[1])) + '</strong><span>' + esc(T(x[2])) + '</span></span></button>').join('') + '</div>';
  }

  /* ---------- kick counter ---------- */
  let K = null;      // active count: { store, start, n, at }
  let lastK = null;  // last finished count, shown once as a result card: { store, sess }
  function finishKick() {
    if (!K) return null;
    const end = K.n >= 10 && K.at ? K.at : Date.now();
    const sess = { s: K.start, e: end, n: Math.min(K.n, 10), ten: K.n >= 10, sec: Math.round((end - K.start) / 1000) };
    const st = K.store; K = null;
    if (sess.n > 0) { st.kicks.push(sess); persist(st); return { store: st, sess: sess }; }
    return null;
  }
  function spark(vals) {
    const n = vals.length; const mx = Math.max(10, Math.ceil(Math.max.apply(null, vals) * 1.25)); const L = 26, Rr = 290, Tp = 16, B = 70;
    const x = (i) => (n === 1 ? (L + Rr) / 2 : L + (i * (Rr - L)) / (n - 1)); const y = (val) => B - (val / mx) * (B - Tp);
    let s = '<svg class="spark" viewBox="0 0 300 80" role="img" aria-label="' + esc(T('k_chart')) + '">';
    s += '<line class="gd" x1="' + L + '" y1="' + B + '" x2="' + Rr + '" y2="' + B + '"/><line class="gd" x1="' + L + '" y1="' + Tp + '" x2="' + Rr + '" y2="' + Tp + '"/>';
    s += '<text x="0" y="' + (B + 3) + '">0</text><text x="0" y="' + (Tp + 3) + '">' + mx + '</text>';
    if (n > 1) s += '<polyline class="ln" points="' + vals.map((val, i) => x(i).toFixed(1) + ',' + y(val).toFixed(1)).join(' ') + '"/>';
    s += vals.map((val, i) => '<circle class="pt" cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="3.5"/><text x="' + x(i).toFixed(1) + '" y="' + (y(val) - 7).toFixed(1) + '" text-anchor="' + (n > 1 && i === n - 1 ? 'end' : (n > 1 && i === 0 ? 'start' : 'middle')) + '">' + val + '</text>').join('');   /* end labels stay inside the chart */
    return s + '</svg>';
  }
  function renderKicks(v) {
    stopTick();
    const st = store(); if (K && K.store !== st) K = null; if (lastK && lastK.store !== st) lastK = null;
    const w = weeks(); const sit = S.state.situation || {};
    let note = '';
    if (S.canSave() && !sit.pregnant) note = '<div class="card soft"><p class="small">' + esc(T('k_notset')) + '</p><button type="button" class="btn sm" data-go="me">' + esc(t('me')) + '</button></div>';
    else if (w != null && w < 28) note = '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(TF('k_early', { w: w })) + '</p></div>';
    const flags = '<div class="flag urgent">' + fi(S.I.help) + '<span class="ptl-ft">' + esc(T('k_now')) + '</span></div><div class="flag">' + fi(S.I.clock) + '<span class="ptl-ft">' + esc(T('k_today')) + '</span></div>';
    let counter = '';
    if (K) {
      counter = '<div class="card ptl-center"><div class="eyebrow">' + esc(T('k_counting')) + '</div><div class="bigtimer" id="ptl-k-time">' + clock((Date.now() - K.start) / 1000) + '</div>' +
        '<button type="button" class="ptl-tap" id="ptl-k-tap"><span class="ptl-n num"><span id="ptl-k-n">' + K.n + '</span><small>/10</small></span><span class="ptl-tl">' + esc(T('k_tap')) + '</span></button>' +
        '<div class="grid2 ptl-full"><button type="button" class="btn sm" id="ptl-k-undo">' + esc(T('k_undo')) + '</button><button type="button" class="btn sm secondary" id="ptl-k-stop">' + esc(T('k_stop')) + '</button></div><p class="small">' + esc(T('k_leave')) + '</p></div>';
    } else {
      if (lastK) {
        const ss = lastK.sess;
        counter += ss.ten ? '<div class="card ok"><p><strong>' + esc(TF('k_done', { m: mins(ss.sec) })) + (S.canSave() ? ' ' + esc(t('saved')) : '') + '</strong></p></div>'
          : '<div class="card soft"><p style="color:var(--fg)"><strong>' + esc(TF('k_part', { n: ss.n, m: mins(ss.sec) })) + '</strong></p><p class="small">' + esc(T('k_part_note')) + '</p></div>';
      }
      counter += '<div class="card"><p class="small">' + esc(T('k_how1')) + '</p><button type="button" class="btn primary block ptl-big" id="ptl-k-start">' + esc(T('k_start')) + '</button><p class="small ptl-evid">' + esc(T('k_evid')) + '</p></div>';
    }
    const done = st.kicks.filter((k) => k.ten).slice(-10); const recent = done.slice(-5).map((k) => mins(k.sec));
    let pattern = '';
    if (recent.length) {
      pattern = '<div class="card"><h3>' + esc(T('k_pattern')) + '</h3><p>' + esc(recent.length > 1 ? TF('k_range', { k: recent.length, a: Math.min.apply(null, recent), b: Math.max.apply(null, recent) }) : TF('k_one', { a: recent[0] })) + '</p>' +
        (done.length > 1 ? '<div class="small">' + esc(T('k_chart')) + '</div>' + spark(done.map((k) => mins(k.sec))) : '') + '<p class="small">' + esc(T('k_own')) + '</p></div>';
    }
    const hist = st.kicks.slice().sort((a, b) => b.s - a.s).slice(0, 10);
    const histHtml = '<div class="card"><h3>' + esc(T('k_hist')) + '</h3>' + (hist.length ? '<div class="stack">' + hist.map((k) => '<div class="ptl-hist"><span class="body"><strong>' + esc(fmtDay(k.s)) + ' · ' + esc(fmtTime(k.s)) + '</strong><span>' + esc(k.ten ? TF('k_row10', { m: mins(k.sec) }) : TF('k_rowp', { n: k.n, m: mins(k.sec) })) + '</span></span><button type="button" class="ptl-x" data-ptl-kdel="' + k.s + '" aria-label="' + esc(T('remove')) + '" title="' + esc(T('remove')) + '">' + X_SVG + '</button></div>').join('') + '</div>' : '<p class="small">' + esc(T('k_none')) + '</p>') + '</div>';
    const how = '<div class="card"><h3>' + esc(T('k_howh')) + '</h3><ol class="steps">' + ['k_s1', 'k_s2', 'k_s3', 'k_s4'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ol><p class="note">' + esc(T('k_doc')) + '</p></div>' +
      '<div class="card soft" data-nofold="1"><h3>' + esc(T('k_know')) + '</h3><p class="small" style="color:var(--fg)">' + esc(T('k_late')) + '</p><p class="small">' + esc(T('k_doppler')) + '</p><p class="small">' + esc(T('k_free')) + '</p></div>';
    // While a count is running, the tap button comes first so it is on screen without scrolling; the red flags follow straight after.
    const top = K ? counter + flags : note + flags + counter;
    v.innerHTML = S.backRow(T('k_h'), backTo(), true) + '<p class="small">' + esc(T('k_p')) + '</p>' + top + (S.canSave() ? '' : S.needDiary()) + pattern + histHtml + how + ambulance() + related(R.kicks) + '<p class="footnote">' + esc(T('k_notdx')) + '</p>';
    S.wire(v); wireCopy(v);
    const $ = (id) => v.querySelector('#' + id);
    if ($('ptl-k-start')) $('ptl-k-start').addEventListener('click', () => { lastK = null; K = { store: st, start: Date.now(), n: 0, at: 0 }; S.render(); });
    if (K) {
      $('ptl-k-tap').addEventListener('click', () => {
        if (!K) return; K.n += 1; K.at = Date.now();
        try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) { /* vibration is optional */ }
        if (K.n >= 10) { lastK = finishKick(); S.render(); return; }
        const n = $('ptl-k-n'); if (n) n.textContent = K.n;
      });
      $('ptl-k-undo').addEventListener('click', () => { if (K && K.n > 0) { K.n -= 1; const n = $('ptl-k-n'); if (n) n.textContent = K.n; } });
      $('ptl-k-stop').addEventListener('click', () => { lastK = finishKick(); S.render(); });
      tick = setInterval(() => { const el = document.getElementById('ptl-k-time'); if (!K || !el) { stopTick(); return; } el.textContent = clock((Date.now() - K.start) / 1000); }, 500);
    }
    v.querySelectorAll('[data-ptl-kdel]').forEach((b) => b.addEventListener('click', () => { const s = Number(b.dataset.ptlKdel); st.kicks = st.kicks.filter((k) => k.s !== s); if (lastK && lastK.sess.s === s) lastK = null; persist(st); S.render(); }));
  }

  /* ---------- contraction timer ---------- */
  let C = null; // running contraction: { store, s }
  /* A new owner (Delete everything, a sample, a restore) starts with no count or timer running. */
  if (S.onOwnerChange) S.onOwnerChange(() => { stopTick(); K = null; lastK = null; C = null; });
  const HOUR = 3600 * 1000;
  function sessionsOf(list) { const a = list.slice().sort((x, y) => x.s - y.s); const out = []; let cur = null; a.forEach((c) => { if (!cur || c.s - cur[cur.length - 1].s > HOUR) { cur = []; out.push(cur); } cur.push(c); }); return out; }
  function statsOf(arr) { const a = arr.slice().sort((x, y) => x.s - y.s); const lens = a.filter((c) => c.e).map((c) => (c.e - c.s) / 1000); const gaps = []; for (let i = 1; i < a.length; i++) gaps.push((a[i].s - a[i - 1].s) / 1000); return { n: a.length, len: avg(lens), gap: avg(gaps) }; }
  function renderCtx(v) {
    stopTick();
    const st = store(); if (C && C.store !== st) C = null;
    const now = Date.now(); const w = weeks();
    const list = st.ctx.slice().sort((a, b) => a.s - b.s); const ses = sessionsOf(list);
    const lastSes = ses.length ? ses[ses.length - 1] : null; const lastC = list.length ? list[list.length - 1] : null;
    const curSes = lastSes && (C || now - lastSes[lastSes.length - 1].s <= HOUR) ? lastSes : null;
    const hourList = list.filter((c) => c.s >= now - HOUR); const hr = statsOf(hourList);
    const tenMin = list.filter((c) => c.s >= now - 10 * 60 * 1000).length;
    const lastLen = lastC && lastC.e ? (lastC.e - lastC.s) / 1000 : 0;
    const urgent = (lastC && lastLen > 120 && now - lastC.e < 15 * 60 * 1000) || tenMin >= 6;
    const span = curSes ? (now - curSes[0].s) / 60000 : 0;
    /* Before 37 weeks the advice is hospital now, so the 5-1-1 "keep timing" messages are not shown (they contradict it). */
    const term = !(w != null && w < 37);
    const match = term && curSes && span >= 55 && hr.n >= 10 && hr.gap != null && hr.gap <= 330 && hr.len != null && hr.len >= 45;
    const close = term && !match && hr.n >= 3 && hr.gap != null && hr.gap <= 330 && hr.len != null && hr.len >= 45;

    let pre = '';
    if (w != null && w < 37) pre = '<div class="flag urgent">' + fi(S.I.help) + '<span class="ptl-ft">' + esc(TF('c_preterm', { w: w })) + '</span></div>';
    const running = !!C;
    let timer = '<div class="card ptl-center">';
    if (running) timer += '<div class="eyebrow">' + esc(T('c_in')) + '</div><div class="bigtimer" id="ptl-c-clock">' + clock((now - C.s) / 1000) + '</div><div class="flag" id="ptl-c-long"' + (now - C.s > 120000 ? '' : ' style="display:none"') + '>' + fi(S.I.clock) + '<span class="ptl-ft">' + esc(T('c_long')) + '</span></div><button type="button" class="btn primary block ptl-big" id="ptl-c-stop">' + esc(T('c_stop')) + '</button>';
    else if (curSes) timer += '<div class="eyebrow">' + esc(T('c_since')) + '</div><div class="bigtimer" id="ptl-c-clock">' + clock((now - lastC.s) / 1000) + '</div><button type="button" class="btn primary block ptl-big" id="ptl-c-start">' + esc(T('c_start')) + '</button>';
    else timer += '<div class="eyebrow">' + esc(T('c_ready')) + '</div><div class="bigtimer">00:00</div><button type="button" class="btn primary block ptl-big" id="ptl-c-start">' + esc(T('c_start')) + '</button>';
    timer += '<p class="small">' + esc(T('c_leave')) + '</p></div>';

    let flags = '';
    if (urgent) flags += '<div class="flag urgent">' + fi(S.I.help) + '<span class="ptl-ft">' + esc(T('c_urgent')) + '</span></div>';
    if (match) flags += '<div class="flag urgent">' + fi(S.I.map) + '<span class="ptl-ft">' + esc(TF('c_match', { g: roundDur(hr.gap), d: roundDur(hr.len) })) + '</span></div>';
    else if (close) flags += '<div class="flag">' + fi(S.I.clock) + '<span class="ptl-ft">' + esc(TF('c_close', { g: roundDur(hr.gap) })) + '</span></div>';

    let stats = '';
    if (curSes) {
      const prev = curSes.length > 1 ? curSes[curSes.length - 2] : null;
      stats = '<div class="card"><h3>' + esc(T('c_last')) + '</h3><dl class="kv"><dt>' + esc(T('c_lasted')) + '</dt><dd>' + esc(lastC.e ? dur(lastLen) : '–') + '</dd><dt>' + esc(T('c_gap')) + '</dt><dd>' + esc(prev ? dur((lastC.s - prev.s) / 1000) : '–') + '</dd></dl>' +
        '<h3>' + esc(T('c_hour')) + '</h3><dl class="kv"><dt>' + esc(T('c_count')) + '</dt><dd>' + hr.n + '</dd><dt>' + esc(T('c_avglen')) + '</dt><dd>' + esc(hr.len != null ? roundDur(hr.len) : '–') + '</dd><dt>' + esc(T('c_avggap')) + '</dt><dd>' + esc(hr.gap != null ? roundDur(hr.gap) : '–') + '</dd></dl></div>';
    }
    const tableSes = curSes || lastSes;
    let table = '';
    if (tableSes) {
      const rows = tableSes.map((c, i) => ({ c: c, gap: i ? (c.s - tableSes[i - 1].s) / 1000 : null })).reverse().slice(0, 10);
      table = '<div class="card"><div class="row spread"><h3>' + esc(curSes ? T('c_table') : fmtDay(tableSes[0].s)) + '</h3><button type="button" class="btn sm ghost" id="ptl-c-undo">' + esc(T('c_undo')) + '</button></div><div class="table-wrap"><table><thead><tr><th>' + esc(T('c_time')) + '</th><th>' + esc(T('c_len')) + '</th><th>' + esc(T('c_gapcol')) + '</th></tr></thead><tbody>' +
        rows.map((r) => '<tr><td class="num">' + esc(fmtTime(r.c.s)) + '</td><td class="num">' + esc(r.c.e ? dur((r.c.e - r.c.s) / 1000) : '–') + '</td><td class="num">' + esc(r.gap != null ? dur(r.gap) : '–') + '</td></tr>').join('') + '</tbody></table></div></div>';
    }
    const past = ses.filter((s) => s !== tableSes).reverse().slice(0, 5);
    const pastHtml = past.length ? '<div class="card"><h3>' + esc(T('c_past')) + '</h3><div class="stack">' + past.map((s) => { const x = statsOf(s); return '<div class="ptl-hist"><span class="body"><strong>' + esc(fmtDay(s[0].s)) + ' · ' + esc(fmtTime(s[0].s)) + '</strong><span>' + esc(x.n > 1 ? TF('c_pastrow', { n: x.n, g: roundDur(x.gap), d: x.len != null ? roundDur(x.len) : '–' }) : TF('c_pastone', { d: x.len != null ? roundDur(x.len) : '–' })) + '</span></span></div>'; }).join('') + '</div></div>' : '';
    const when = '<div class="card"><h3>' + esc(T('w_h')) + '</h3><ul>' + ['w_1', 'w_2', 'w_3', 'w_4', 'w_5'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ul></div>';

    v.innerHTML = S.backRow(T('c_h'), backTo(), true) + '<p class="small">' + esc(T('c_p')) + '</p>' + pre + timer + flags + stats + table + (S.canSave() ? '' : S.needDiary()) + goNow() + when + pastHtml + ambulance() + related(R.ctx) + '<p class="footnote">' + esc(T('c_notdx')) + '</p>';
    S.wire(v); wireCopy(v);
    const $ = (id) => v.querySelector('#' + id);
    if ($('ptl-c-start')) $('ptl-c-start').addEventListener('click', () => { C = { store: st, s: Date.now() }; S.render(); });
    if ($('ptl-c-stop')) $('ptl-c-stop').addEventListener('click', () => { if (C) { const st2 = C.store; st2.ctx.push({ s: C.s, e: Date.now() }); C = null; persist(st2); } S.render(); });
    if ($('ptl-c-undo')) $('ptl-c-undo').addEventListener('click', () => { if (!st.ctx.length) return; let mi = 0; st.ctx.forEach((c, i) => { if (c.s > st.ctx[mi].s) mi = i; }); st.ctx.splice(mi, 1); persist(st); S.render(); });
    if (running || curSes) {
      tick = setInterval(() => {
        const el = document.getElementById('ptl-c-clock'); if (!el) { stopTick(); return; }
        if (C) { el.textContent = clock((Date.now() - C.s) / 1000); const lg = document.getElementById('ptl-c-long'); if (lg) lg.style.display = Date.now() - C.s > 120000 ? '' : 'none'; }
        else if (lastC) el.textContent = clock((Date.now() - lastC.s) / 1000);
      }, 500);
    }
  }

  /* ---------- hospital bag and birth plan ---------- */
  function renderBag(v) {
    stopTick();
    const st = store(); const total = BAG_IDS.length;
    const meter = (n, tot, id) => '<div class="ptl-meter" aria-hidden="true"><i id="' + id + '" style="width:' + Math.round((n / tot) * 100) + '%"></i></div>';
    const groups = BAG.map((g) => '<div class="card"><h3>' + esc(tx(g.h)) + '</h3><div class="checklist">' + g.items.map((x) => '<label class="' + (st.bag[x[0]] ? 'done' : '') + '"><input type="checkbox" data-ptl-bag="' + x[0] + '"' + (st.bag[x[0]] ? ' checked' : '') + '> <span>' + esc(tx({ en: x[1], hi: x[2] })) + '</span></label>').join('') + '</div></div>').join('');
    const pd = planDone(st);
    const fields = PLAN_FIELDS.map((f) => '<div class="ptl-field"><label for="ptl-f-' + f[0] + '">' + esc(T(f[1])) + '</label><input id="ptl-f-' + f[0] + '" data-ptl-plan="' + f[0] + '" value="' + esc(st.plan[f[0]] || '') + '"' + (f[0] === 'asha' || f[0] === 'trans' ? ' inputmode="tel"' : '') + ' autocomplete="off">' + (f[2] ? '<p class="small">' + esc(T(f[2])) + '</p>' : '') + '</div>').join('');
    const ticks = '<div class="checklist">' + PLAN_TICKS.map((k) => '<label class="' + (st.plan[k] ? 'done' : '') + '"><input type="checkbox" data-ptl-tick="' + k + '"' + (st.plan[k] ? ' checked' : '') + '> <span>' + esc(T(k)) + '</span></label>').join('') + '</div>';
    const schemes = has('access-schemes-preg') ? '<button type="button" class="action" data-go="access-schemes-preg"><span class="ico">' + S.I.file + '</span><span class="body"><strong>' + esc(T('schemes')) + '</strong><span class="small">' + esc(T('schemes_s')) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' : '';
    v.innerHTML = S.backRow(T('b_h'), backTo(), false) + '<p class="small">' + esc(T('b_p')) + '</p>' + (S.canSave() ? '' : S.needDiary()) +
      '<div class="card soft ptl-prog"><div class="row spread"><strong id="ptl-bag-n">' + esc(TF('b_prog', { n: bagDone(st), t: total })) + '</strong><span class="ico-sm">' + BAG_SVG + '</span></div>' + meter(bagDone(st), total, 'ptl-bag-m') + '</div>' +
      groups + schemes +
      '<h2>' + esc(T('b_plan')) + '</h2><p class="small">' + esc(T('b_plan_p')) + '</p>' +
      '<div class="card"><div class="row spread"><strong id="ptl-plan-n">' + esc(TF('b_plan_prog', { n: pd, t: PLAN_TOTAL })) + '</strong></div>' + meter(pd, PLAN_TOTAL, 'ptl-plan-m') + fields + ticks + '<button type="button" class="btn primary block" id="ptl-plan-save">' + esc(T('b_save')) + '</button></div>' +
      '<div class="card ok"><h3 style="color:var(--ok)">' + esc(T('b_money_h')) + '</h3><p class="small" style="color:var(--ok)">' + esc(T('b_money')) + '</p><p class="small" style="color:var(--ok)">' + esc(T('b_badhai')) + '</p></div>' +
      '<p class="note">' + esc(T('b_tip')) + '</p>' + related(R.bag);
    S.wire(v);
    const $ = (id) => v.querySelector('#' + id);
    const refresh = () => { const n = bagDone(st), p = planDone(st); $('ptl-bag-n').textContent = TF('b_prog', { n: n, t: total }); $('ptl-bag-m').style.width = Math.round((n / total) * 100) + '%'; $('ptl-plan-n').textContent = TF('b_plan_prog', { n: p, t: PLAN_TOTAL }); $('ptl-plan-m').style.width = Math.round((p / PLAN_TOTAL) * 100) + '%'; };
    v.querySelectorAll('[data-ptl-bag]').forEach((c) => c.addEventListener('change', () => { const k = c.dataset.ptlBag; if (c.checked) st.bag[k] = true; else delete st.bag[k]; c.closest('label').classList.toggle('done', c.checked); persist(st); refresh(); }));
    v.querySelectorAll('[data-ptl-tick]').forEach((c) => c.addEventListener('change', () => { const k = c.dataset.ptlTick; if (c.checked) st.plan[k] = true; else delete st.plan[k]; c.closest('label').classList.toggle('done', c.checked); persist(st); refresh(); }));
    const readFields = () => { v.querySelectorAll('[data-ptl-plan]').forEach((i) => { const val = i.value.trim().slice(0, 200); if (val) st.plan[i.dataset.ptlPlan] = val; else delete st.plan[i.dataset.ptlPlan]; }); };
    v.querySelectorAll('[data-ptl-plan]').forEach((i) => i.addEventListener('change', () => { readFields(); persist(st); refresh(); }));
    $('ptl-plan-save').addEventListener('click', () => { readFields(); persist(st); refresh(); S.toast(S.canSave() ? T('b_saved') : t('need_diary_h')); });
  }

  /* ---------- preparing for birth ---------- */
  const B = {
    signs_h: { en: 'Signs that labour is starting', hi: 'लेबर शुरू होने के संकेत' },
    signs: [
      { en: 'Pains that come at regular times and get longer, stronger and closer together. They often start in the back and move to the front.', hi: 'दर्द जो तय अंतर पर आए और धीरे-धीरे लंबा, तेज़ और पास-पास होता जाए। अक्सर कमर से शुरू होकर पेट के आगे तक आता है।' },
      { en: 'A sticky, jelly-like discharge with a little blood, called the show.', hi: 'थोड़े ख़ून के साथ चिपचिपा, जेली जैसा स्राव, जिसे “show” कहते हैं।' },
      { en: 'Your waters breaking: a slow trickle or a sudden gush of fluid. Put on a pad, note the time and the colour, and go to hospital.', hi: 'पानी की थैली फटना: धीरे-धीरे रिसना या अचानक पानी निकलना। pad लगाएँ, समय और पानी का रंग याद रखें, और अस्पताल जाएँ।' }
    ],
    false_h: { en: 'False labour pains', hi: 'झूठे लेबर दर्द' },
    false_p: [
      { en: 'Many women get practice pains (Braxton Hicks) for weeks before labour. They come at odd times, do not come closer together, stay weak or fade, ease when you rest, walk or change position, and are felt mostly in the front of the belly.', hi: 'कई महिलाओं को लेबर से हफ़्तों पहले अभ्यास वाले दर्द (Braxton Hicks) होते हैं। ये बेतरतीब आते हैं, पास-पास नहीं आते, हल्के रहते हैं या कम हो जाते हैं, आराम करने, चलने या करवट बदलने पर रुक जाते हैं, और ज़्यादातर पेट के आगे महसूस होते हैं।' },
      { en: 'Not sure? Call your hospital or go and get checked. Being told to go home and wait is common, and it is fine.', hi: 'पक्का नहीं पता? अस्पताल को फ़ोन करें या जाकर जाँच कराएँ। “अभी घर जाकर इंतज़ार करें” सुनना आम बात है, इसमें कोई बुराई नहीं।' }
    ],
    sections: [
      { id: 'normal', h: { en: 'Normal birth: what happens', hi: 'नॉर्मल डिलीवरी: क्या होता है' }, p: [
        { en: 'First, the mouth of the womb (cervix) slowly opens. The early part, with milder and irregular pains, can go on for many hours, sometimes a day or more. Once strong, regular labour starts, the cervix usually takes 8 to 18 hours to open fully with a first baby, and often 5 to 12 hours with later babies.', hi: 'पहले बच्चेदानी का मुँह (cervix) धीरे-धीरे खुलता है। शुरुआती हिस्सा, जिसमें दर्द हल्का और बेतरतीब होता है, कई घंटे चल सकता है, कभी-कभी एक दिन या ज़्यादा। जब तेज़ और नियमित लेबर शुरू हो जाता है, तो पहले बच्चे में बच्चेदानी का मुँह पूरा खुलने में आम तौर पर 8 से 18 घंटे लगते हैं, और बाद के बच्चों में अक्सर 5 से 12 घंटे।' },
        { en: "You can walk around and choose the position that feels right: squatting, kneeling, standing or on your side. India's labour-room rules (LaQshya) ask hospitals to let you choose.", hi: 'आप चल-फिर सकती हैं और जो आरामदायक लगे वह तरीक़ा चुन सकती हैं: उकड़ूँ बैठना, घुटनों के बल, खड़े होकर या करवट लेकर। भारत के लेबर रूम नियम (LaQshya) अस्पतालों से कहते हैं कि आपको चुनने दें।' },
        { en: 'Pass urine about every 2 hours, and sip water.', hi: 'लगभग हर 2 घंटे में पेशाब कर लें, और घूँट-घूँट पानी पीती रहें।' },
        { en: 'Then comes pushing, and your baby is born. Soon after, staff give you an injection that helps the womb tighten and reduces bleeding, and the placenta (afterbirth) comes out.', hi: 'फिर ज़ोर लगाने का समय आता है और बच्चा पैदा होता है। उसके तुरंत बाद स्टाफ़ एक इंजेक्शन देता है जिससे बच्चेदानी सिकुड़े और ब्लीडिंग कम हो, फिर आँवल (placenta) बाहर आता है।' }
      ] },
      { id: 'cs', h: { en: 'C-section (operation)', hi: 'ऑपरेशन से डिलीवरी (C-section)' }, p: [
        { en: 'A C-section is an operation to deliver your baby through a cut in the lower belly. Doctors advise it when it is safer for you or your baby: for example, if the baby is not getting enough oxygen, labour stops moving forward, the baby is lying in a difficult position, or the placenta is low.', hi: 'C-section एक ऑपरेशन है जिसमें पेट के निचले हिस्से में चीरा लगाकर बच्चा निकाला जाता है। डॉक्टर इसकी सलाह तब देते हैं जब यह माँ या बच्चे के लिए ज़्यादा सुरक्षित हो: जैसे बच्चे को पूरी ऑक्सीजन न मिल रही हो, लेबर आगे न बढ़ रहा हो, बच्चा उल्टा या टेढ़ा हो, या आँवल नीचे हो।' },
        { en: 'Most are done with a spinal injection. Your lower body goes numb, you stay awake, and you can see your baby straight away. The operation takes about 40 to 50 minutes.', hi: 'ज़्यादातर ऑपरेशन रीढ़ में इंजेक्शन (spinal) देकर होते हैं। कमर से नीचे का हिस्सा सुन्न हो जाता है, आप जागती रहती हैं और बच्चे को तुरंत देख सकती हैं। ऑपरेशन में लगभग 40 से 50 मिनट लगते हैं।' },
        { en: 'You can start breastfeeding soon after; ask the nurse to help you. Recovery takes longer than after a normal birth, and staff will help you get up and walk early.', hi: 'इसके बाद जल्दी ही दूध पिलाना शुरू कर सकती हैं; नर्स से मदद माँगें। नॉर्मल डिलीवरी से ठीक होने में ज़्यादा समय लगता है, और स्टाफ़ आपको जल्दी उठने और चलने में मदद करेगा।' },
        { en: 'In government hospitals a C-section is free under JSSK, with free food for 7 days. Needing one is not a failure. When it is needed, it is a safe operation.', hi: 'सरकारी अस्पताल में JSSK के तहत ऑपरेशन मुफ़्त है, साथ में 7 दिन तक मुफ़्त खाना। ऑपरेशन होना कोई कमी नहीं है। ज़रूरत हो तो यह एक सुरक्षित ऑपरेशन है।' }
      ] },
      { id: 'vbac', h: { en: 'Normal birth after a C-section', hi: 'पहले ऑपरेशन हुआ हो, तो अब नॉर्मल डिलीवरी?' }, p: [
        { en: 'Often possible. In UK figures, about 3 in 4 women who had one C-section and go into labour on their own give birth normally (RCOG).', hi: 'अक्सर हो सकती है। ब्रिटेन के आँकड़ों में, जिनका एक बार ऑपरेशन हुआ था और लेबर अपने-आप शुरू हुआ, उनमें लगभग 4 में से 3 की नॉर्मल डिलीवरी हुई (RCOG)।' },
        { en: "It should happen only in a hospital that can do an emergency C-section at any hour and has blood available, with your baby's heartbeat watched closely. There is a small risk, up to 1 in 200, that the old scar opens.", hi: 'यह सिर्फ़ ऐसे अस्पताल में हो जहाँ किसी भी समय इमरजेंसी ऑपरेशन हो सके और ख़ून उपलब्ध हो, और बच्चे की धड़कन लगातार देखी जाए। पुराने टाँकों की जगह खुलने का छोटा ख़तरा है, 200 में से लगभग 1 तक।' },
        { en: 'It is usually not advised after 3 or more C-sections, if the womb tore before, or if the old cut was high on the womb.', hi: '3 या ज़्यादा ऑपरेशन के बाद, पहले बच्चेदानी फटी हो, या पुराना चीरा बच्चेदानी के ऊपरी हिस्से में हो, तो आम तौर पर इसकी सलाह नहीं दी जाती।' },
        { en: 'Ask your obstetrician early in pregnancy, so there is time to choose the right hospital. Take the papers from your last operation.', hi: 'गर्भावस्था में जल्दी ही अपनी स्त्री रोग विशेषज्ञ से पूछें, ताकि सही अस्पताल चुनने का समय रहे। पिछले ऑपरेशन के काग़ज़ साथ ले जाएँ।' }
      ] },
      { id: 'pain', h: { en: 'Pain relief', hi: 'दर्द में राहत' }, p: [
        { en: 'Without medicine: keep moving and change position, have your companion rub your lower back and hold your hand, breathe slowly and deeply, and put a cool, damp cloth on your forehead.', hi: 'बिना दवा: चलती-फिरती रहें और करवट बदलती रहें, साथी से कमर के निचले हिस्से की मालिश करवाएँ और हाथ पकड़वाएँ, धीमी और गहरी साँस लें, माथे पर ठंडा गीला कपड़ा रखें।' },
        { en: "Epidural: an anaesthetist places a thin tube in your lower back that numbs labour pain. In most cases it takes the pain away completely. Pushing may take longer, and the baby's heartbeat is watched throughout. It is offered mainly in larger hospitals, so ask early whether yours has it.", hi: 'Epidural: बेहोशी के डॉक्टर (anaesthetist) कमर के निचले हिस्से में एक पतली नली लगाते हैं, जिससे लेबर का दर्द सुन्न हो जाता है। ज़्यादातर मामलों में दर्द पूरी तरह चला जाता है। ज़ोर लगाने का समय लंबा हो सकता है, और बच्चे की धड़कन लगातार देखी जाती है। यह ज़्यादातर बड़े अस्पतालों में मिलता है, इसलिए पहले ही पूछ लें कि आपके अस्पताल में है या नहीं।' },
        { en: 'Pain-relief injections: some hospitals use them. They can make you feel woozy or sick. Given close to the birth, they can affect the baby\'s breathing and the first feed.', hi: 'दर्द कम करने के इंजेक्शन: कुछ अस्पताल देते हैं। इनसे आपको चक्कर जैसा या जी मिचलाने जैसा लग सकता है। डिलीवरी के बहुत पास दिए जाएँ तो बच्चे की साँस और पहली बार दूध पीने पर असर पड़ सकता है।' },
        { en: 'Your doctor decides with you what is safe. Do not take any medicine or home remedy in labour without asking the staff.', hi: 'क्या सुरक्षित है, यह डॉक्टर आपके साथ तय करती हैं। लेबर में स्टाफ़ से पूछे बिना कोई दवा या घरेलू नुस्ख़ा न लें।' }
      ] },
      { id: 'rights', h: { en: 'Your companion and your rights', hi: 'आपका साथी और आपके अधिकार' }, p: [
        { en: 'Government labour-room rules (LaQshya) allow one birth companion of your choice to stay with you. Pick someone calm you trust. They can rub your back, hold your hand, wipe your face, help you change position, and fetch staff if something seems wrong.', hi: 'सरकारी लेबर रूम के नियम (LaQshya) आपकी पसंद के एक साथी को आपके पास रहने देते हैं। किसी शांत, भरोसेमंद व्यक्ति को चुनें। वे कमर मल सकते हैं, हाथ पकड़ सकते हैं, चेहरा पोंछ सकते हैं, करवट बदलने में मदद कर सकते हैं, और कुछ ग़लत लगे तो स्टाफ़ को बुला सकते हैं।' },
        { en: 'The same rules ask for privacy (a separate room or at least a curtained cubicle), freedom to choose your position, and respectful care. Staff should not shout at you, hit you or handle you roughly.', hi: 'यही नियम पर्दा और प्राइवेसी (अलग कमरा या कम से कम पर्दे वाला केबिन), अपनी पसंद की पोज़िशन चुनने की आज़ादी, और इज़्ज़त से देखभाल की बात करते हैं। स्टाफ़ को आप पर चिल्लाना, हाथ उठाना या ज़बरदस्ती करना नहीं चाहिए।' },
        { en: 'Medicines, tests and the delivery are free in government hospitals. Staff should not ask your family for any money, including "badhai" for the birth.', hi: 'सरकारी अस्पताल में दवाएँ, जाँचें और डिलीवरी मुफ़्त हैं। स्टाफ़ को आपके परिवार से कोई पैसा नहीं माँगना चाहिए, जन्म की “बधाई” के नाम पर भी नहीं।' }
      ] }
    ],
    after_h: { en: 'After birth: the first hour and the first 48 hours', hi: 'जन्म के बाद: पहला घंटा और पहले 48 घंटे' },
    after: [
      { en: 'Your baby is placed on your chest, skin to skin, and covered with a warm cloth. This keeps the baby warm and makes the first feed easier.', hi: 'बच्चे को सीधे आपकी छाती पर, त्वचा से त्वचा लगाकर रखा जाता है और गर्म कपड़े से ढका जाता है। इससे बच्चा गर्म रहता है और पहली बार दूध पीना आसान होता है।' },
      { en: 'The cord is cut after 1 to 3 minutes, once it stops pulsing. The extra blood helps protect your baby from anaemia.', hi: 'नाल 1 से 3 मिनट बाद काटी जाती है, जब उसका धड़कना रुक जाए। इससे बच्चे को ज़्यादा ख़ून मिलता है और ख़ून की कमी से बचाव होता है।' },
      { en: 'Breastfeed within the first hour. Many families are told the first thick, yellow milk (colostrum) is heavy or dirty. It is the opposite: it is rich in vitamin A and protects your baby from infections. Do not throw it away, and do not give honey, ghutti, sugar water or even plain water.', hi: 'पहले घंटे में ही दूध पिलाना शुरू करें। कई घरों में कहा जाता है कि पहला गाढ़ा पीला दूध (colostrum) भारी या गंदा होता है। सच उल्टा है: इसमें vitamin A भरपूर होता है और यह बच्चे को infection से बचाता है। इसे फेंकें नहीं, और शहद, घुट्टी, चीनी का पानी या सादा पानी भी न दें।' },
      { en: 'Stay in hospital for at least 48 hours after a normal birth, and longer after a C-section. Serious problems like heavy bleeding or fits are most likely in these first 48 hours, and in hospital help is close by.', hi: 'नॉर्मल डिलीवरी के बाद कम से कम 48 घंटे अस्पताल में रुकें, और ऑपरेशन के बाद ज़्यादा। भारी ब्लीडिंग या दौरे जैसी गंभीर दिक़्क़तों का ख़तरा इन्हीं पहले 48 घंटों में सबसे ज़्यादा होता है, और अस्पताल में मदद पास होती है।' },
      { en: 'Before you go home, check that your baby got the birth vaccines and that your MCP card is filled in.', hi: 'घर जाने से पहले देख लें कि बच्चे को जन्म के टीके लग गए हैं और आपका MCP card भरा गया है।' }
    ]
  };
  function renderBirth(v) {
    stopTick();
    const para = (arr) => arr.map((p) => '<p>' + esc(tx(p)) + '</p>').join('');
    const after = (has('post-feed') ? '<button type="button" class="btn sm" data-go="post-feed">' + esc(tx({ en: 'Breastfeeding help', hi: 'स्तनपान में मदद' })) + '</button>' : '');
    v.innerHTML = S.backRow(T('r_h'), backTo(), false) + '<p class="small">' + esc(T('r_p')) + '</p>' +
      '<div class="card"><h3>' + esc(tx(B.signs_h)) + '</h3><ul>' + B.signs.map((p) => '<li>' + esc(tx(p)) + '</li>').join('') + '</ul></div>' +
      '<div class="card soft"><h3>' + esc(tx(B.false_h)) + '</h3>' + para(B.false_p).replace(/<p>/g, '<p class="small" style="color:var(--text)">') + '<button type="button" class="btn sm" data-go="' + R.ctx + '">' + esc(T('t_ctx')) + '</button></div>' +
      goNow() +
      B.sections.map((s) => '<details class="ptl-acc" id="ptl-sec-' + s.id + '"><summary>' + esc(tx(s.h)) + '</summary><div class="ptl-body">' + para(s.p) + '</div></details>').join('') +
      '<div class="card"><h3>' + esc(tx(B.after_h)) + '</h3><ol class="steps">' + B.after.map((p) => '<li>' + esc(tx(p)) + '</li>').join('') + '</ol>' + after + '</div>' +
      '<div class="card dark"><h3>' + esc(T('r_ask_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(T('r_ask_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(T('r_ask_topic')) + '">' + esc(t('ask_qura')) + '</button></div>' +
      related(R.birth) + '<p class="footnote">' + esc(T('r_src')) + '</p>';
    S.wire(v);
  }

  /* ---------- hooks ---------- */
  function home() {
    const w = weeks(); if (w == null || w < 36 || w > 42 || !S.canSave()) return '';
    const st = store(); const n = bagDone(st); if (n >= BAG_IDS.length) return '';
    return '<button type="button" class="action" data-go="' + R.bag + '"><span class="ico accent">' + BAG_SVG + '</span><span class="body"><strong>' + esc(T('home_h')) + '</strong><span class="small">' + esc(TF('home_p', { n: n, t: BAG_IDS.length })) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }
  function summary() {
    const st = store(); const L = [];
    const wk = Date.now() - 7 * 24 * HOUR; const ks = st.kicks.filter((k) => k.s >= wk);
    if (ks.length) { const tens = ks.filter((k) => k.ten).map((k) => mins(k.sec)); L.push(TF('sum_k', { n: ks.length }) + (tens.length ? ' · ' + TF('sum_k2', { a: Math.min.apply(null, tens), b: Math.max.apply(null, tens) }) : '')); }
    const ses = sessionsOf(st.ctx);
    if (ses.length) { const last = ses[ses.length - 1]; const x = statsOf(last); L.push(TF('sum_c', { n: ses.length, d: fmtDay(last[0].s), c: x.n }) + (x.n > 1 && x.gap != null && x.len != null ? ' · ' + TF('sum_c2', { g: roundDur(x.gap), l: roundDur(x.len) }) : '')); }
    const bd = bagDone(st), pd = planDone(st);
    if (bd || pd) L.push(TF('sum_b', { n: bd, t: BAG_IDS.length, p: pd, q: PLAN_TOTAL }));
    return L.length ? [{ title: T('sum_h'), lines: L }] : [];
  }
  function sample(id) {
    if (id !== 'meera') return;
    const d = fill(S.data('pregtools'));
    d.kicks = []; d.ctx = [];
    d.bag = { mcp: true, idcard: true, reports: true, phone: true, clothes: true, pads: true, bclothes: true, cap: true };
    d.plan = { p_route: true, p_home: true };
  }

  S.register({
    id: 'pregtools',
    demoPersona: 'meera',
    strings: strings,
    routes: { 'pregtools-kicks': renderKicks, 'pregtools-contractions': renderCtx, 'pregtools-bag': renderBag, 'pregtools-birth': renderBirth },
    open: [R.kicks, R.ctx, R.bag, R.birth],
    tiles: [
      { section: 'preg', route: R.kicks, title: 'pregtools_t_kicks', sub: 'pregtools_t_kicks_s', icon: 'baby', order: 60, gated: true, keywords: 'kick count kicks fetal movement baby moving less hilna halchal हलचल किक' },
      { section: 'preg', route: R.bag, title: 'pregtools_t_bag', sub: 'pregtools_t_bag_s', icon: BAG_SVG, order: 61, gated: false, keywords: 'hospital bag birth plan delivery documents mcp card ambulance 102 108 बैग' },
      { section: 'preg', route: R.birth, title: 'pregtools_t_birth', sub: 'pregtools_t_birth_s', icon: 'heart', order: 62, gated: false, keywords: 'labour labor delivery normal c-section caesarean vbac epidural colostrum डिलीवरी ऑपरेशन' },
      { section: 'preg', route: R.ctx, title: 'pregtools_t_ctx', sub: 'pregtools_t_ctx_s', icon: 'clock', order: 63, gated: true, keywords: 'contraction timer labour pains 5-1-1 waters breaking dard लेबर दर्द' }
    ],
    css: [
      '.ptl-center { align-items: center; text-align: center; }',
      '.ptl-full { width: 100%; }',
      '.ptl-big { min-height: 64px; font-size: 17px; }',
      '.ptl-tap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 200px; height: 200px; margin: 6px auto; border-radius: 50%; border: none; background: var(--accent-strong); color: #FFFFFF; font-weight: 600; font-size: 15px; box-shadow: var(--shadow-lg); touch-action: manipulation; -webkit-user-select: none; user-select: none; padding: 18px; text-align: center; }',
      '.ptl-tap:active { transform: scale(0.97); }',
      '.ptl-tap:focus-visible { outline: 3px solid var(--fg); outline-offset: 3px; }',
      '.ptl-tap .ptl-n { font-size: 56px; line-height: 1; }',
      '.ptl-tap .ptl-n small { font-size: 20px; font-weight: 600; margin-left: 2px; }',
      '.ptl-tap .ptl-tl { max-width: 150px; line-height: 1.3; }',
      '.ptl-fi { flex-shrink: 0; display: inline-flex; margin-top: 1px; }',
      '.ptl-fi svg { width: 20px; height: 20px; }',
      '.ptl-ft { min-width: 0; }',
      '.ptl-col { flex-direction: column; gap: 6px; padding: 14px; }',
      '.ptl-col h3 { color: inherit; }',
      '.ptl-col ul { padding-left: 18px; }',
      '.ptl-meter { height: 10px; border-radius: 5px; background: var(--bg); overflow: hidden; }',
      '.ptl-meter i { display: block; height: 100%; border-radius: 5px; background: var(--accent-strong); transition: width 0.2s; }',
      '.ptl-prog { gap: 8px; }',
      '.ptl-hist { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 8px 8px 12px; background: var(--card-2); border-radius: 14px; color: var(--fg); }',
      '.ptl-hist .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }',
      '.ptl-hist .body strong { font-size: 13px; font-weight: 600; }',
      '.ptl-hist .body span { font-size: 12px; color: var(--muted); }',
      '.ptl-x { width: 40px; height: 40px; flex-shrink: 0; border-radius: 20px; border: none; background: transparent; color: var(--muted); display: inline-flex; align-items: center; justify-content: center; padding: 0; }',
      '.ptl-x svg { width: 18px; height: 18px; }',
      '.ptl-field { display: flex; flex-direction: column; gap: 6px; }',
      '.ptl-acc { background: var(--card); border-radius: 20px; padding: 14px 16px; box-shadow: var(--shadow); }',
      '.ptl-acc > summary { font-size: 15px; color: var(--fg); font-weight: 600; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 30px; }',
      '.ptl-acc > summary::-webkit-details-marker { display: none; }',
      '.ptl-acc > summary::after { content: "+"; color: var(--accent); font-size: 22px; line-height: 1; font-weight: 600; flex-shrink: 0; }',
      '.ptl-acc[open] > summary::after { content: "\\2212"; }',
      '.ptl-body { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; font-size: 14px; color: var(--text); }'
    ].join('\n'),
    home: home,
    summary: summary,
    sample: sample,
    afterRender: (v, route) => {
      if (route !== R.kicks && K) lastK = finishKick() || lastK;
      if (route !== R.ctx) C = null;
      if (notMine(route)) stopTick();
    }
  });
})(window.Saathi);
