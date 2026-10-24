/* Doctor's view preview: what a Qura doctor sees in her separate portal, and only when a woman has turned on sharing (consent c4). Built from the five sample women through S.withSample; the real diary is never read here. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc;
  const ID = 'docportal';
  const PEOPLE = ['priya', 'asha', 'meera', 'sunita', 'kamla'];
  const LEVELS = ['now', 'today', 'week', 'soon', 'visit'];

  /* ---------- strings: [English, Hindi]; every key becomes docportal_<key> ---------- */
  const P = {
    tile: ["Doctor's view (preview)", 'डॉक्टर क्या देखती हैं (झलक)'],
    tile_s: ['What a Qura doctor sees, and only when a woman shares her diary', 'Qura की डॉक्टर क्या देखती हैं, और सिर्फ़ तब जब महिला अपनी डायरी साझा करे'],
    intro: ['A preview of the separate, secure portal that Qura doctors sign in to. It shows what a doctor sees, and that she sees it only after a woman turns on sharing.', 'यह उस अलग, सुरक्षित portal की झलक है जिसमें Qura की डॉक्टर sign in करती हैं। इसमें दिखता है कि डॉक्टर क्या देखती हैं, और यह भी कि वे यह तभी देखती हैं जब महिला sharing चालू करे।'],
    sample_h: ['Sample women, not real patients', 'नमूना महिलाएँ, असली मरीज़ नहीं'],
    sample_p: ["The five women below are the app's sample data. Your own diary is never opened on this page.", 'नीचे की पाँच महिलाएँ app का नमूना डेटा हैं। इस पन्ने पर आपकी अपनी डायरी कभी नहीं खोली जाती।'],
    sees_h: ['What the doctor sees, and when', 'डॉक्टर क्या देखती हैं, और कब'],
    sees_1: ['Nothing, until the woman turns on "{c}" on her {me} page.', 'कुछ भी नहीं, जब तक महिला अपने “{me}” पन्ने पर “{c}” चालू न करे।'],
    sees_2: ['After that: period dates, flow and pain, monthly check-ins, notes she writes for the doctor, tracker logs such as BP or after-birth checks, and her reminders.', 'उसके बाद: पीरियड की तारीख़ें, ब्लीडिंग और दर्द, हर महीने का चेक-इन, डॉक्टर के लिए लिखे उसके नोट, BP या डिलीवरी के बाद की जाँच जैसे tracker के रिकॉर्ड, और उसके reminders।'],
    sees_3: ['No score, no risk percentage and no diagnosis from the app. What the doctor is asked to look at is a count of her own entries.', 'App की तरफ़ से कोई score, कोई risk प्रतिशत और कोई diagnosis नहीं। डॉक्टर को जो देखने को कहा जाता है, वह उसकी अपनी entries की गिनती है।'],
    sees_4: ['She can withdraw sharing on the same page, as easily as she gave it. After that the doctor no longer sees her diary.', 'वह इसी पन्ने पर sharing वापस ले सकती है, उतनी ही आसानी से जितनी आसानी से दी थी। उसके बाद डॉक्टर उसकी डायरी नहीं देखतीं।'],
    sees_5: ['Doctors read the shared diaries of women in their care once a week. It is not live; in an emergency she calls 112.', 'डॉक्टर अपनी देखरेख वाली महिलाओं की साझा डायरी हफ़्ते में एक बार पढ़ती हैं। यह live नहीं है; emergency में वह 112 पर कॉल करती है।'],
    you_h: ['Your own diary', 'आपकी अपनी डायरी'],
    you_on: ['You share your diary with your Qura doctor since {d}.', 'आप {d} से अपनी डायरी अपनी Qura डॉक्टर से साझा कर रही हैं।'],
    you_off: ['You are not sharing your diary with a Qura doctor, so no doctor sees it.', 'आप अपनी डायरी किसी Qura डॉक्टर से साझा नहीं कर रहीं, इसलिए कोई डॉक्टर इसे नहीं देखती।'],
    you_browse: ['You are reading without a diary, so there is nothing of yours to share.', 'आप बिना डायरी के पढ़ रही हैं, इसलिए आपका कुछ भी साझा होने को नहीं है।'],
    you_change: ['Change it in {me} → My data', '“{me}” → “मेरा डेटा” में बदलें'],
    you_sum: ['See your own doctor summary', 'अपनी doctor summary देखें'],
    list_h: ['Patients (sample)', 'मरीज़ (नमूना)'],
    list_p: ['The list as a Qura doctor would see it. Tap a name to open her shared diary.', 'सूची वैसी, जैसी Qura की डॉक्टर को दिखती। उसकी साझा डायरी खोलने के लिए नाम पर टैप करें।'],
    nm_priya: ['Priya', 'प्रिया'], nm_asha: ['Asha', 'आशा'], nm_meera: ['Meera', 'मीरा'], nm_sunita: ['Sunita', 'सुनीता'], nm_kamla: ['Kamla', 'कमला'],
    shared_since: ['Shared since {d}', '{d} से साझा'],
    not_shared: ['Not shared', 'साझा नहीं'],
    not_shared_row: ['Sharing is off. The doctor sees nothing from her diary.', 'Sharing बंद है। डॉक्टर को उसकी डायरी से कुछ नहीं दिखता।'],
    n_flags: ['{n} to review', '{n} बातें देखनी हैं'],
    flag1: ['1 to review', '1 बात देखनी है'],
    no_flags: ['Nothing to review', 'देखने को कुछ ख़ास नहीं'],
    last_entry: ['Last shared entry {d}', 'आख़िरी साझा entry {d}'],
    no_entry: ['No entries yet', 'अभी कोई entry नहीं'],
    err: ['This sample could not be loaded in the preview.', 'यह नमूना झलक में खुल नहीं पाया।'],
    st_preg: ['Pregnant, about {n} weeks', 'गर्भवती, लगभग {n} हफ़्ते'],
    st_post: ['{n} days after birth', 'डिलीवरी के {n} दिन बाद'],
    st_gaps: ['Gaps {a}–{b} days', 'अंतर {a}–{b} दिन'],
    st_none: ['No situation set by her', 'उसने कोई स्थिति नहीं चुनी'],
    lv_now: ['Call her now', 'अभी कॉल करें'],
    lv_today: ['Today', 'आज'],
    lv_week: ['This week', 'इस हफ़्ते'],
    lv_soon: ['Within 2 weeks', '2 हफ़्ते के अंदर'],
    lv_visit: ['Next visit', 'अगली मुलाक़ात'],

    p_intro: ["Preview of the doctor's portal with sample data. In the live app this is a separate, secure portal for Qura doctors only.", 'डॉक्टर के portal की झलक, नमूना डेटा के साथ। असली app में यह सिर्फ़ Qura की डॉक्टरों के लिए एक अलग, सुरक्षित portal है।'],
    lock_h: ['{name} has not turned on sharing', '{name} ने sharing चालू नहीं की है'],
    lock_p: ['So the doctor sees nothing from her diary: no dates, no check-ins, no notes. In the live portal she would not appear on the list at all.', 'इसलिए डॉक्टर को उसकी डायरी से कुछ नहीं दिखता: न तारीख़ें, न चेक-इन, न नोट। असली portal में वह सूची में दिखती ही नहीं।'],
    lock_p2: ['If she books a free call, she can choose to share her diary before the call, and withdraw it any time after.', 'अगर वह मुफ़्त कॉल बुक करती है, तो कॉल से पहले डायरी साझा करना चुन सकती है, और बाद में कभी भी वापस ले सकती है।'],
    back_list: ['Back to the list', 'सूची पर वापस'],
    k_age: ['Age', 'उम्र'], age_v: ['{n} years', '{n} साल'],
    k_sit: ['Situation', 'स्थिति'],
    k_shared: ['Sharing', 'साझा'],
    k_last: ['Last shared entry', 'आख़िरी साझा entry'],

    flags_h: ['To review', 'देखने वाली बातें'],
    flags_p: ["Her own entries, counted against the limits in the app's safety guide and the national guidelines. Not a diagnosis.", 'उसकी अपनी entries, app की सुरक्षा गाइड और राष्ट्रीय दिशानिर्देशों की सीमाओं से मिलाकर गिनी गईं। यह diagnosis नहीं है।'],
    flags_none: ['Nothing in her entries crosses a safety limit.', 'उसकी entries में कुछ भी सुरक्षा सीमा से आगे नहीं।'],
    fl_heavy: ['Heavy bleeding logged: {x}', 'भारी ब्लीडिंग दर्ज: {x}'],
    fl_pads4: ['soaking a pad every 1–2 hours', 'हर 1–2 घंटे में pad भीगना'],
    fl_clots: ['clots the size of a ₹10 coin or bigger', '₹10 के सिक्के जितने या बड़े थक्के'],
    fl_lab: ['{x} {v}: outside the range printed on her report ({r})', '{x} {v}: उसकी report पर छपी range ({r}) से बाहर'],
    lab_tsh: ['TSH', 'TSH'], lab_ft4: ['Free T4', 'Free T4'], lab_prl: ['Prolactin', 'Prolactin'], lab_hb: ['Hb', 'Hb'], lab_fer: ['Ferritin', 'Ferritin'], lab_fbs: ['Fasting sugar', 'खाली पेट sugar'], lab_a1c: ['HbA1c', 'HbA1c'], lab_vitd: ['Vitamin D', 'विटामिन D'], lab_b12: ['Vitamin B12', 'विटामिन B12'], lab_x: ['Lab result', 'जाँच का नतीजा'],
    fl_ci_heavy: ['Heavy flow or clots ticked in {n} of her last {m} check-ins', 'पिछले {m} चेक-इन में से {n} में भारी ब्लीडिंग या थक्के चुने'],
    fl_long: ['Bleeding lasted {n} days', 'ब्लीडिंग {n} दिन चली'],
    fl_90: ['{n} days since her last period started', 'पिछला पीरियड शुरू हुए {n} दिन'],
    fl_bp: ['BP {v} entered', 'BP {v} दर्ज'],
    fl_bp_sym: ['with headache, blurred vision or pain under the ribs', 'साथ में सिरदर्द, धुंधला दिखना या पसलियों के नीचे दर्द'],
    fl_hb: ['Hb {v} g/dL in pregnancy, below {c} for that trimester', 'गर्भ में Hb {v} g/dL, उस तिमाही के लिए {c} से कम'],
    fl_sug: ['Sugar test (75 g, 2-hour) {v} mg/dL: 140 or more', 'Sugar test (75 g, 2 घंटे) {v} mg/dL: 140 या ज़्यादा'],
    fl_ogtt_due: ['Second sugar test (75 g, 2-hour) is due now, at 24–28 weeks', 'दूसरा sugar test (75 g, 2 घंटे) अभी होना है, 24–28 हफ़्ते में'],
    fl_ogtt_late: ['No second sugar test (75 g, 2-hour) logged after 24 weeks', '24 हफ़्ते के बाद दूसरा sugar test (75 g, 2 घंटे) दर्ज नहीं'],
    fl_post: ['After-birth check: {x}', 'डिलीवरी के बाद की जाँच: {x}'],
    fl_post_generic: ['a danger sign was ticked', 'एक ख़तरे का संकेत चुना गया'],
    fl_tell: ['She asked to talk to a person: {x}', 'उसने किसी से बात करनी चाही: {x}'],
    fl_mood: ['Low mood or anxiety ticked in {n} of her last {m} check-ins', 'पिछले {m} चेक-इन में से {n} में उदासी या घबराहट चुनी'],
    fl_night: ['Hot flushes waking her at night in {n} of her last {m} check-ins', 'पिछले {m} चेक-इन में से {n} में गर्मी के झोंकों से रात में नींद खुली'],
    fl_scr_over: ['{x}: last done {d}, more than 5 years ago', '{x}: पिछली बार {d}, 5 साल से ज़्यादा पहले'],
    fl_scr_never: ['{x}: never done (once in 5 years from 30 to 65)', '{x}: कभी नहीं हुई (30 से 65 साल तक, 5 साल में एक बार)'],
    scr_cervix: ['Cervical screening', 'बच्चेदानी के मुँह की जाँच'],
    scr_cbe: ['Breast exam by a health worker', 'स्वास्थ्यकर्मी से स्तन की जाँच'],
    scr_oral: ['Mouth check', 'मुँह की जाँच'],

    no_gaps: ['Not enough periods logged for a chart yet.', 'chart के लिए अभी काफ़ी पीरियड दर्ज नहीं।'],
    preg_h: ['Pregnancy', 'गर्भावस्था'],
    preg_from: ['Counted from', 'किससे गिना'],
    preg_scan: ['scan report due date, {d}', 'scan रिपोर्ट की डिलीवरी तारीख़, {d}'],
    preg_lmp: ['last period, {d}', 'पिछला पीरियड, {d}'],
    preg_edd: ['Due date, about', 'डिलीवरी की लगभग तारीख़'],
    preg_win: ['Check-up window now', 'अभी जाँच का समय'],
    preg_between: ['Between two check-up windows', 'दो जाँचों के बीच का समय'],
    pp_day: ['Day {n}', 'दिन {n}'],
    pp_born: ['Birth date', 'जन्म की तारीख़'],
    pp_six: ['Postnatal check in week 6: around {d}', 'छठे हफ़्ते की जाँच: लगभग {d}'],
    ci_h: ['Last check-ins', 'पिछले चेक-इन'],
    ci_none: ['No check-ins yet.', 'अभी कोई चेक-इन नहीं।'],
    ci_note: ['Her note: {x}', 'उसका नोट: {x}'],
    sum_h: ['From her trackers', 'उसके trackers से'],
    sum_p: ['The same lines she sees on her own doctor-summary page.', 'वही बातें जो वह अपने doctor-summary पन्ने पर देखती है।'],
    sum_none: ['No tracker entries in this sample.', 'इस नमूने में tracker की कोई entry नहीं।'],
    med_h: ['Medicines and reminders', 'दवाएँ और reminders'],
    med_l: ['Medicine reminders she set', 'उसके लगाए दवा reminders'],
    med_none: ['No medicine reminders set.', 'कोई दवा reminder नहीं लगाया।'],
    med_horm: ['She marked: on hormone medicine', 'उसने चुना: हॉर्मोन की दवा पर'],
    up_l: ['Coming up in the next 30 days', 'अगले 30 दिनों में'],
    up_none: ['Nothing in the next 30 days.', 'अगले 30 दिनों में कुछ नहीं।'],
    next_v: ['next {d}', 'अगला {d}'],

    note_h: ["Doctor's note", 'डॉक्टर का नोट'],
    note_tag: ['Sample note for this preview', 'इस झलक के लिए नमूना नोट'],
    note_by: ['Qura doctor (BAMS) · {d}', 'Qura डॉक्टर (BAMS) · {d}'],
    note_priya_a: ['Gaps of 31–62 days over her last five cycles, three of them over 35 days. Trying for a baby since March. Coarse hair ticked in every check-in since May. One heavy period on 4 Oct, with clots the size of a ₹10 coin and leaking through clothes. TSH and prolactin in September were within the range on her report. Takes metformin prescribed by her gynaecologist.', 'पिछले पाँच चक्रों में अंतर 31–62 दिन, इनमें से तीन 35 दिन से ज़्यादा। मार्च से बच्चे की कोशिश कर रही है। मई से हर चेक-इन में मोटे बाल चुने। 4 अक्टूबर को एक भारी पीरियड, ₹10 के सिक्के जितने थक्के और कपड़ों तक ब्लीडिंग। सितंबर में TSH और prolactin उसकी report की range के अंदर थे। अपनी स्त्री रोग विशेषज्ञ की लिखी metformin लेती है।'],
    note_priya_b: ['Plan: blood count (Hb) after the heavy period, and a sugar test. Food plan with more protein and fibre, a fixed sleep time and a 30-minute walk most days. Referred back to her MBBS gynaecologist about ovulation and the heavy period; any fertility medicine is decided there. Review with reports in 4 weeks.', 'योजना: भारी पीरियड के बाद blood count (Hb), और एक sugar test। खाने में ज़्यादा protein और fibre, सोने का तय समय, और ज़्यादातर दिन 30 मिनट पैदल चलना। Ovulation और भारी पीरियड के लिए वापस उसकी MBBS स्त्री रोग विशेषज्ञ को refer किया; fertility की कोई भी दवा वहीं तय होगी। 4 हफ़्ते में reports के साथ दोबारा देखेंगे।'],
    note_meera_a: ['24 weeks by her scan date. BP normal at all five check-ups, 106–114 over 68–76. Hb 10.8 in June, up to 11.2 in September. First sugar test (75 g, 2-hour) 112 mg/dL in June.', 'Scan की तारीख़ से 24 हफ़्ते। पाँचों जाँचों में BP सामान्य, 106–114 / 68–76। Hb जून में 10.8, सितंबर में बढ़कर 11.2। पहला sugar test (75 g, 2 घंटे) जून में 112 mg/dL।'],
    note_meera_b: ['Plan: second 75 g sugar test now, between 24 and 28 weeks, at her PHC or ANC clinic. Iron-folic acid and calcium as advised at her ANC visit; food plan for iron and protein. Reminded her that bleeding, a severe headache with blurred vision, leaking fluid or the baby moving less means calling 112 or going to hospital at once.', 'योजना: दूसरा 75 g sugar test अभी, 24 से 28 हफ़्ते के बीच, उसके PHC या ANC clinic पर। Iron-folic acid और calcium वैसे ही जैसे ANC जाँच में बताया गया; iron और protein के लिए खाने की योजना। याद दिलाया कि ब्लीडिंग, धुंधली नज़र के साथ तेज़ सिरदर्द, पानी निकलना, या बच्चे की हलचल कम हो तो तुरंत 112 पर कॉल करें या अस्पताल जाएँ।'],
    note_sunita_a: ['Day {n} after birth, breastfeeding. Her daily checks show light brown bleeding, stitches healing, no fever and no danger signs. Short on sleep.', 'डिलीवरी के बाद दिन {n}, स्तनपान करा रही है। रोज़ की जाँच में हल्की भूरी ब्लीडिंग, टाँके भर रहे हैं, बुख़ार नहीं, कोई ख़तरे का संकेत नहीं। नींद कम।'],
    note_sunita_b: ['Plan: food plan for a breastfeeding mother with enough protein, iron and calcium; asked the family to share night duties so she can rest. Talked about family planning before periods return; she will choose a method with her ANM or an MBBS doctor at the 6-week check. Shared Tele-MANAS 14416 in case her mood dips.', 'योजना: स्तनपान कराने वाली माँ के लिए खाने की योजना, जिसमें काफ़ी protein, iron और calcium हो; परिवार से रात की ज़िम्मेदारी बाँटने को कहा ताकि वह आराम कर सके। पीरियड लौटने से पहले परिवार नियोजन पर बात हुई; 6 हफ़्ते की जाँच पर वह अपनी ANM या MBBS डॉक्टर के साथ तरीक़ा चुनेगी। मन उदास हो तो Tele-MANAS 14416 बताया।'],
    note_kamla_a: ['Age 48. Gaps between 25 and 74 days over her last eight cycles, two of them over 60 days. Heavy flow or clots ticked in June and September; 6 or more pads a day in three periods. Hb 9.8 g/dL on 1 Oct, down from 10.6 in April; on an iron tablet from the CHC since September. Hot flushes waking her at night in three of the last six months, low mood in four. Breast exam by a health worker last done more than 5 years ago.', 'उम्र 48। पिछले आठ चक्रों में अंतर 25 से 74 दिन, इनमें दो 60 दिन से ज़्यादा। जून और सितंबर में भारी ब्लीडिंग या थक्के चुने; तीन पीरियड में दिन में 6 या ज़्यादा pad। 1 अक्टूबर को Hb 9.8 g/dL, अप्रैल में 10.6 था; सितंबर से CHC की दी iron की गोली ले रही है। पिछले छह महीनों में से तीन में गर्मी के झोंकों से रात में नींद खुली, चार में मन उदास। स्वास्थ्यकर्मी से स्तन की जाँच 5 साल से ज़्यादा पहले हुई थी।'],
    note_kamla_b: ['Plan: repeat Hb at the next review to see whether the iron is working. Referred to an MBBS gynaecologist for the heavy bleeding and to discuss hormone therapy for the night sweats. From us: a sleep routine, a food plan with iron, calcium and protein, and a daily walk. Asked her to get the breast exam at her Ayushman Arogya Mandir, where it is free. Shared Tele-MANAS 14416 for her mood.', 'योजना: अगली मुलाक़ात पर Hb दोबारा, यह देखने के लिए कि iron असर कर रहा है या नहीं। भारी ब्लीडिंग के लिए और रात के पसीने की हॉर्मोन therapy पर बात के लिए MBBS स्त्री रोग विशेषज्ञ को refer किया। हमारी तरफ़ से: सोने की दिनचर्या, iron, calcium और protein वाली खाने की योजना, और रोज़ थोड़ा पैदल चलना। स्तन की जाँच आयुष्मान आरोग्य मंदिर पर कराने को कहा, जहाँ यह मुफ़्त है। मन के लिए Tele-MANAS 14416 बताया।'],

    act_h: ['Actions', 'आगे के कदम'],
    act_tests: ['Order tests', 'जाँच लिखें'],
    act_refer: ['Refer to MBBS gynaecologist', 'MBBS स्त्री रोग विशेषज्ञ को refer करें'],
    act_msg: ['Message patient', 'मरीज़ को संदेश भेजें'],
    toast_tests: ['Preview only: no test was ordered.', 'सिर्फ़ झलक: कोई जाँच नहीं लिखी गई।'],
    toast_refer: ['Preview only: no referral was sent.', 'सिर्फ़ झलक: कोई refer नहीं भेजा गया।'],
    toast_msg: ['Preview only: no message was sent.', 'सिर्फ़ झलक: कोई संदेश नहीं गया।'],
    act_p: ["Qura doctors are BAMS doctors. They advise on cycles, weight, food and sleep, order tests and refer. Hormone medicines, contraceptive prescriptions, HRT, abortion pills, fertility drugs and surgery need an MBBS or MD gynaecologist; Qura refers.", 'Qura की डॉक्टर BAMS हैं। वे चक्र, वज़न, खाने और नींद पर सलाह देती हैं, जाँच लिखती हैं और refer करती हैं। हॉर्मोन की दवा, गर्भनिरोधक की पर्ची, HRT, गर्भपात की गोलियाँ, fertility की दवाएँ और ऑपरेशन के लिए MBBS या MD स्त्री रोग विशेषज्ञ चाहिए; Qura refer करता है।'],
    foot: ['Preview only. Nothing on this page is sent anywhere, and your own diary is not used.', 'सिर्फ़ झलक। इस पन्ने से कुछ भी कहीं नहीं भेजा जाता, और आपकी अपनी डायरी इस्तेमाल नहीं होती।'],
    me_item: ["See what a doctor sees when you share", 'साझा करने पर डॉक्टर क्या देखती हैं, देखें'],
    me_item_s: ['A preview with sample women', 'नमूना महिलाओं के साथ एक झलक']
  };
  const strings = { en: {}, hi: {} };
  Object.keys(P).forEach((k) => { strings.en[ID + '_' + k] = P[k][0]; strings.hi[ID + '_' + k] = P[k][1]; });
  const T = (k) => t(ID + '_' + k);
  const TF = (k, o) => tf(ID + '_' + k, o);

  /* ---------- small helpers ---------- */
  const iso = (d) => S.toISO(d);
  const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const hasKey = (k) => !!(S.strings && S.strings.en && S.strings.en[k] != null);
  const fmtS = (s) => S.fmtD(S.fromISO(s), { day: 'numeric', month: 'short' });
  const fmtL = (s) => S.fmtD(S.fromISO(s), { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtM = (k) => S.fmtD(S.fromISO(k + '-01'), { month: 'short', year: 'numeric' });
  const addMonths = (d, m) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
  const lc = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);
  const num1 = (v) => String(Math.round(v * 10) / 10);
  const name = (id) => T('nm_' + id);
  const initial = (s) => Array.from(String(s))[0] || '';
  const SITK = { pregnant: 'pregnant', breastfeeding: 'bf', hormones: 'hormones', pcos: 'pcos', thyroid: 'thyroid', hysterectomy: 'hyst', stopped: 'stopped', planning: 'planning' };
  const chev = '<span class="docp-chev" aria-hidden="true">' + S.I.chev + '</span>';

  /* ---------- reading a sample woman (all of this runs inside S.withSample) ---------- */
  function lastEntry(st, todayI) {
    let best = null;
    const see = (s) => { if (isISO(s) && s <= todayI && (!best || s > best)) best = s; };
    (st.events || []).forEach((e) => see(e && e.d));
    Object.keys(st.daily || {}).forEach(see);
    Object.keys(st.checkins || {}).forEach((k) => see((st.checkins[k] || {}).at));
    (st.requests || []).forEach((r) => see(r && r.d));
    const walk = (x, depth) => {
      if (x == null || depth > 5) return;
      if (typeof x === 'string') { see(x); return; }
      if (Array.isArray(x)) { x.slice(0, 500).forEach((y) => walk(y, depth + 1)); return; }
      if (typeof x === 'object') Object.keys(x).slice(0, 500).forEach((k) => { see(k); walk(x[k], depth + 1); });
    };
    walk(st.mods || {}, 0);
    return best;
  }

  function flagsOf(A, st, sit, td, o, ck) {
    const F = [];
    const add = (lvl, text, d, m) => F.push({ lvl: lvl, text: text, d: d || null, m: m || null });
    const evs = (st.events || []).filter((e) => e && isISO(e.d)).sort((a, b) => (a.d < b.d ? -1 : (a.d > b.d ? 1 : 0)));
    const mods = st.mods || {};

    /* 1. Heavy-bleeding logs (same rule as the core summary: soaking a pad every 1–2 hours, ₹10-coin clots, leaking) */
    evs.forEach((e) => {
      if (!(e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked)) return;
      const parts = [];
      if (e.pads === 'pads_4') parts.push(T('fl_pads4'));
      if (e.clots === 'clots_2') parts.push(T('fl_clots'));
      if (e.leaked) parts.push(lc(t('leaked')));
      add(e.pads === 'pads_4' ? 'today' : 'week', TF('fl_heavy', { x: parts.join(', ') }), e.d);
    });
    /* 2. Heavy flow ticked in monthly check-ins */
    const last6 = ck.slice(-6); const last3 = ck.slice(-3);
    const chipsOf = (k) => ((st.checkins[k] || {}).chips || []);
    const heavyN = last6.filter((k) => chipsOf(k).indexOf('heavy') >= 0);
    if (heavyN.length) add('week', TF('fl_ci_heavy', { n: heavyN.length, m: last6.length }), null, heavyN[heavyN.length - 1]);
    /* 3. Bleeding longer than 8 days */
    evs.filter((e) => e.t === 'start').forEach((s) => {
      const end = evs.find((x) => x.t === 'end' && x.d >= s.d && S.diffDays(S.fromISO(s.d), S.fromISO(x.d)) <= 10);
      if (!end) return; const n = S.diffDays(S.fromISO(s.d), S.fromISO(end.d)) + 1;
      if (n > 8) add('week', TF('fl_long', { n: n }), s.d);
    });
    /* 4. 90+ days with no period (not pregnant, breastfeeding, hysterectomy or stopped) */
    const ls = A.cycle.lastStart();
    if (ls && !A.cycle.countsOff() && !sit.stopped) { const n = S.diffDays(ls, td); if (n >= 90) add('soon', TF('fl_90', { n: n }), iso(ls)); }
    /* 5. High BP entries from any tracker that keeps { d, s, di, sym } (140/90 and 160/110, as the pregnancy tracker uses) */
    Object.keys(mods).forEach((m) => {
      const arr = mods[m] && mods[m].bp; if (!Array.isArray(arr)) return;
      arr.forEach((e) => {
        if (!e) return; const s = Number(e.s), di = Number(e.di); if (!isFinite(s) || !isFinite(di)) return;
        const sev = !!e.sym || s >= 160 || di >= 110; const high = s >= 140 || di >= 90;
        if (sev || high) add(sev ? 'now' : 'today', TF('fl_bp', { v: s + '/' + di }) + (e.sym ? '; ' + T('fl_bp_sym') : ''), isISO(e.d) ? e.d : null);
      });
    });
    /* 6–8. Pregnancy tracker: Hb by trimester (WHO), 75 g sugar test (MoHFW 2018), second test at 24–28 weeks */
    const pg = mods.preg;
    if (o.preg && pg && typeof pg === 'object') {
      const basis = S.fromISO(o.preg.basis);
      (Array.isArray(pg.hb) ? pg.hb : []).forEach((e) => {
        if (!e || !isISO(e.d) || e.d < o.preg.basis) return; const v = Number(e.v); if (!isFinite(v)) return;
        const wk = Math.floor(S.diffDays(basis, S.fromISO(e.d)) / 7); const cut = wk >= 14 && wk <= 27 ? 10.5 : 11;
        if (v < 7) add('today', TF('fl_hb', { v: num1(v), c: num1(cut) }), e.d);
        else if (v < cut) add('visit', TF('fl_hb', { v: num1(v), c: num1(cut) }), e.d);
      });
      const sug = Array.isArray(pg.sug) ? pg.sug : null;
      if (sug) {
        sug.forEach((e) => { if (e && e.k === 'dipsi' && Number(e.v) >= 140) add('week', TF('fl_sug', { v: Number(e.v) }), isISO(e.d) ? e.d : null); });
        const w = o.preg.weeks;
        if (w >= 24) {
          const since = iso(S.addDays(basis, 24 * 7));
          const done = sug.some((e) => e && e.k === 'dipsi' && isISO(e.d) && e.d >= since);
          if (!done) add(w <= 28 ? 'visit' : 'week', T(w <= 28 ? 'fl_ogtt_due' : 'fl_ogtt_late'));
        }
      }
    }
    /* 9. After-birth daily checks: danger signs and other ticks she made */
    const pr = mods.post && mods.post.rec;
    if (pr && typeof pr === 'object') {
      Object.keys(pr).filter(isISO).sort().forEach((k) => {
        const e = pr[k] || {}; const labs = []; let lvl = null;
        const lab = (key) => (hasKey(key) ? t(key) : T('fl_post_generic'));
        (Array.isArray(e.danger) ? e.danger : []).forEach((x) => { if (x && x !== 'none') { labs.push(lab('post_d_' + x)); lvl = 'now'; } });
        if (e.mood === 'harm') { labs.push(lab('post_s_harm')); lvl = 'now'; }
        const other = [];
        if (e.fever === 'high') other.push('post_s_fever');
        if (e.wound === 'pus' || e.wound === 'red') other.push('post_s_wound');
        if (e.breast === 'red') other.push('post_br_red');
        if (e.pee === 'cant') other.push('post_s_cantpee');
        if (e.bleed === 'heavy') other.push('post_s_heavy');
        other.forEach((key) => labs.push(lab(key)));
        if (other.length && !lvl) lvl = 'today';
        if (lvl) add(lvl, TF('fl_post', { x: labs.filter((x, i) => labs.indexOf(x) === i).map(lc).join(', ') }), k);
      });
    }
    /* 10. "Tell a person" requests */
    (st.requests || []).forEach((r) => { if (r && r.kind === 'tell') add('today', TF('fl_tell', { x: lc(hasKey(r.about) ? t(r.about) : t('t_other')) }), isISO(r.d) ? r.d : null); });
    /* 11–12. Mood and night-time hot flushes, counted from check-ins */
    const moodN = last3.filter((k) => chipsOf(k).indexOf('mood') >= 0);
    if (moodN.length >= 2) add('visit', TF('fl_mood', { n: moodN.length, m: last3.length }), null, moodN[moodN.length - 1]);
    const nightN = last6.filter((k) => (st.checkins[k] || {}).hot === 'hot_3');
    if (nightN.length >= 2) add('visit', TF('fl_night', { n: nightN.length, m: last6.length }), null, nightN[nightN.length - 1]);
    /* 13. Lab results outside the range printed on her own report (latest result per test) */
    const labs = mods.cond && Array.isArray(mods.cond.labs) ? mods.cond.labs.filter((e) => e && typeof e.v === 'number' && isISO(e.d)) : [];
    const latestLab = {}; labs.forEach((e) => { const k = String(e.k || 'x'); if (!latestLab[k] || e.d > latestLab[k].d) latestLab[k] = e; });
    Object.keys(latestLab).forEach((k) => {
      const e = latestLab[k]; const lo = typeof e.lo === 'number' ? e.lo : null, hi = typeof e.hi === 'number' ? e.hi : null;
      if (!((lo != null && e.v < lo) || (hi != null && e.v > hi))) return;
      const r = lo != null && hi != null ? num1(lo) + '–' + num1(hi) : (lo != null ? '≥ ' + num1(lo) : '≤ ' + num1(hi));
      add(k === 'hb' ? 'week' : 'visit', TF('fl_lab', { x: hasKey(ID + '_lab_' + k) ? T('lab_' + k) : T('lab_x'), v: num1(e.v) + (e.u ? ' ' + e.u : ''), r: r }), e.d);
    });
    /* 14. Cancer screening once in 5 years from 30 to 65 (national programme), from her own check-up dates */
    const sl = mods.screen && mods.screen.last;
    if (sl && typeof sl === 'object' && o.age != null && o.age >= 30 && o.age <= 65) {
      ['cervix', 'cbe', 'oral'].forEach((k) => {
        if (k === 'cervix' && sit.hysterectomy) return;
        const r = sl[k];
        if (r === 'never') add('visit', TF('fl_scr_never', { x: T('scr_' + k) }));
        else if (isISO(r) && addMonths(S.fromISO(r), 60) <= td) add('visit', TF('fl_scr_over', { x: T('scr_' + k), d: fmtL(r) }));
      });
    }
    F.sort((a, b) => (LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl)) || String(b.d || b.m || '').localeCompare(String(a.d || a.m || '')));
    return F;
  }

  function collect(id) {
    return S.withSample(id, (A) => {
      const st = A.state; const sit = st.situation || {}; const td = A.today(); const tdI = iso(td);
      const o = { id: id, c4: (st.consent || {}).c4 || null };
      if (!o.c4) return o;
      o.age = A.cycle.ageYears();
      o.sit = {}; Object.keys(SITK).forEach((k) => { if (sit[k]) o.sit[k] = true; });
      o.ga = A.cycle.gapsAll().slice(-12).map((g) => ({ days: g.days, usable: g.usable }));
      o.usable = A.cycle.usable();
      o.bandHi = A.cycle.bandHi();
      o.nStarts = A.cycle.starts().length;
      const ls = A.cycle.lastStart(); o.lastStart = ls ? iso(ls) : null; o.cycleDay = A.cycle.cycleDay();
      o.bleeds = A.cycle.starts().map(A.cycle.periodLen).filter((n) => n != null);   /* the same period-length rule as the diary (an end within 20 days) */
      if (sit.pregnant) { const pi = S.preg && S.preg.info(); if (pi) o.preg = { basis: pi.lmp, label: pi.from === 'scan' ? sit.scanEdd : pi.lmp, from: pi.from, weeks: pi.weeks, edd: pi.edd }; }   /* weeks count from her last period (or EDD - 280); the scan date is only the label */
      if (isISO(sit.deliveredOn)) { const n = S.diffDays(S.fromISO(sit.deliveredOn), td); if (n >= 0 && n <= 365) o.pp = { born: sit.deliveredOn, day: n, bf: !!sit.breastfeeding, six: iso(S.addDays(S.fromISO(sit.deliveredOn), 42)) }; }
      const ck = Object.keys(st.checkins || {}).filter((k) => /^\d{4}-\d{2}$/.test(k)).sort();
      o.ci = ck.slice(-3).reverse().map((k) => { const c = st.checkins[k] || {}; return { k: k, chips: (c.chips || []).slice(), hot: c.hot || 'hot_0', note: c.note || '' }; });
      o.flags = flagsOf(A, st, sit, td, o, ck);
      o.sums = [];
      (A.summaries() || []).forEach((m) => { if (m.mod === ID) return; (m.sections || []).forEach((s) => { if (s && s.lines && s.lines.length) o.sums.push({ title: String(s.title || ''), lines: s.lines.map(String) }); }); });
      const rl = A.reminders.list().filter((r) => r && r.on !== false);
      o.meds = rl.filter((r) => r.kind === 'med').map((r) => { const n = A.reminders.next(r); return { text: A.reminders.text(r), next: n ? iso(n) : null, time: r.time || '' }; });
      o.up = A.reminders.upcoming(30).filter((x) => x.r.kind !== 'med').slice(0, 6).map((x) => ({ text: A.reminders.text(x.r), d: iso(x.date), time: x.r.time || '' }));
      o.last = lastEntry(st, tdI);
      return o;
    });
  }

  /* ---------- shared bits of markup ---------- */
  function sitLine(o) {
    const parts = [];
    if (o.preg) parts.push(TF('st_preg', { n: o.preg.weeks })); else if (o.sit.pregnant) parts.push(t('pregnant'));
    if (o.pp) parts.push(TF('st_post', { n: o.pp.day }));
    if (o.sit.breastfeeding) parts.push(t('bf'));
    ['hormones', 'pcos', 'thyroid', 'hysterectomy', 'stopped', 'planning'].forEach((k) => { if (o.sit[k]) parts.push(t(SITK[k])); });
    const u = (o.usable || []).slice(-6);
    if (!o.preg && !o.pp && u.length >= 2) parts.push(TF('st_gaps', { a: Math.min.apply(null, u), b: Math.max.apply(null, u) }).replace(/(\d)–(\d)/g, '$1–\u2060$2'));
    return parts.length ? parts.join(' · ') : T('st_none');
  }
  const flagPill = (o) => {
    const n = o.flags.length;
    if (!n) return '<span class="pill ok">' + esc(T('no_flags')) + '</span>';
    return '<span class="pill accent">' + esc(n === 1 ? T('flag1') : TF('n_flags', { n: n })) + ' · ' + esc(T('lv_' + o.flags[0].lvl)) + '</span>';
  };
  const sharedPill = (o) => (o.c4 ? '<span class="pill ok">' + esc(TF('shared_since', { d: fmtL(o.c4) })) + '</span>' : '<span class="pill muted">' + esc(T('not_shared')) + '</span>');

  /* ---------- hub: what the doctor sees + the sample patient list ---------- */
  function renderHub(v) {
    const st = S.state;
    const rows = PEOPLE.map((id) => {
      const o = collect(id); const nm = name(id);
      if (!o) return '<div class="item quiet"><span class="docp-av">' + esc(initial(nm)) + '</span><span class="body"><strong>' + esc(nm) + '</strong><span>' + esc(T('err')) + '</span></span></div>';
      if (!o.c4) return '<button type="button" class="item docp-pt" data-go="docportal-p-' + id + '"><span class="docp-av lock" aria-hidden="true">' + S.I.lock + '</span><span class="body"><strong>' + esc(nm) + '</strong><span>' + esc(T('not_shared_row')) + '</span><span class="docp-tags">' + sharedPill(o) + '</span></span>' + chev + '</button>';
      return '<button type="button" class="item docp-pt" data-go="docportal-p-' + id + '"><span class="docp-av" aria-hidden="true">' + esc(initial(nm)) + '</span><span class="body"><strong>' + esc(nm) + (o.age != null ? ', ' + o.age : '') + '</strong><span>' + esc(sitLine(o)) + '</span><span class="docp-tags">' + sharedPill(o) + flagPill(o) + '</span><span>' + esc(o.last ? TF('last_entry', { d: fmtS(o.last) }) : T('no_entry')) + '</span></span>' + chev + '</button>';
    }).join('');
    let you = '';
    if (st.stage === 'app') {
      you = '<p class="small">' + esc(st.consent && st.consent.c4 ? TF('you_on', { d: fmtL(st.consent.c4) }) : T('you_off')) + '</p><div class="row wrap"><button type="button" class="btn sm" data-go="me-data">' + esc(TF('you_change', { me: t('me') })) + '</button>' +
        (S.routeOwner('tools-summary') ? '<button type="button" class="btn sm ghost" data-go="tools-summary">' + esc(T('you_sum')) + '</button>' : '') + '</div>';
    } else you = '<p class="small">' + esc(T('you_browse')) + '</p>';
    v.innerHTML = S.backRow(T('tile'), 'care', true) + '<p class="small">' + esc(T('intro')) + '</p>' +
      '<div class="card"><h3>' + esc(T('sees_h')) + '</h3><ul class="docp-ul">' +
      '<li>' + esc(TF('sees_1', { c: t('c4'), me: t('me') })) + '</li><li>' + esc(T('sees_2')) + '</li><li>' + esc(T('sees_3')) + '</li><li>' + esc(T('sees_4')) + '</li><li>' + esc(T('sees_5')) + '</li></ul></div>' +
      '<div class="card soft"><h3>' + esc(T('you_h')) + '</h3>' + you + '</div>' +
      '<div class="stack"><h2>' + esc(T('list_h')) + '</h2><p class="small">' + esc(T('list_p')) + '</p></div>' +
      '<div class="card warn"><h3>' + esc(T('sample_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(T('sample_p')) + '</p></div>' +
      '<div class="list">' + rows + '</div>' +
      '<p class="footnote">' + esc(T('foot')) + '</p>';
    S.wire(v);
  }

  /* ---------- patient detail ---------- */
  function gapsCard(o) {
    const ga = o.ga || [];
    if (!ga.length) return '<div class="card"><h2>' + esc(t('gaps12')) + '</h2><p class="small">' + esc(T('no_gaps')) + '</p></div>';
    const mx = Math.max(60, Math.max.apply(null, ga.map((x) => Math.min(x.days, 130)))); const h = 110; const hiB = o.bandHi || 35;
    const g = o.usable || []; const avg = g.length ? Math.round(g.reduce((a, b) => a + b, 0) / g.length) : null;
    const bl = o.bleeds || []; const bavg = bl.length ? Math.round(bl.reduce((a, b) => a + b, 0) / bl.length) : null;
    const stat = (val, lab) => '<div class="stat"><b class="num">' + esc(val == null ? '–' : val) + '</b><span>' + esc(lab) + '</span></div>';
    return '<div class="card"><h2>' + esc(t('gaps12')) + '</h2><div class="bars" style="height:' + h + 'px"><div class="band" style="top:' + (h - (hiB / mx) * h).toFixed(0) + 'px;height:' + (((hiB - 21) / mx) * h).toFixed(0) + 'px"></div><div class="cols">' +
      ga.map((x, i) => '<div class="col ' + (x.usable ? (i === ga.length - 1 ? 'last' : '') : 'x') + '" style="height:' + ((Math.min(x.days, 130) / mx) * h).toFixed(0) + 'px"></div>').join('') + '</div></div><div class="barlabels">' +
      ga.map((x) => '<span class="num">' + x.days + '</span>').join('') + '</div><p class="small">' + esc(t('band_label')) + '</p>' +
      '<div class="statgrid">' + stat(avg, t('avg_gap')) + stat(g.length ? Math.min.apply(null, g) : null, t('shortest')) + stat(g.length ? Math.max.apply(null, g) : null, t('longest')) + stat(bavg, t('bleed_days')) + '</div></div>';
  }
  function pregCard(o) {
    const p = o.preg; const w = p.weeks; const pct = S.clamp((w / 40) * 100, 1, 99); const tri = w < 14 ? 0 : (w < 28 ? 1 : 2);
    const win = w < 12 ? 'pw_v1' : (w >= 14 && w <= 26 ? 'pw_v2' : (w >= 28 && w <= 34 ? 'pw_v3' : (w >= 36 ? 'pw_v4' : null)));
    return '<div class="card"><h2>' + esc(T('preg_h')) + '</h2><p class="docp-big num">' + esc(t('pw_h')) + ' ' + w + '</p>' +
      '<div class="timeline"><div class="seg" style="left:0;width:35%;background:var(--accent-2);opacity:0.6;border-radius:7px 0 0 7px"></div><div class="seg" style="left:35%;width:35%;background:var(--accent-2)"></div><div class="seg" style="left:70%;width:30%;background: var(--accent-strong);border-radius:0 7px 7px 0"></div><div class="mark" style="left:' + pct.toFixed(0) + '%"></div></div>' +
      '<div class="tl-labels" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ['pw_t1', 'pw_t2', 'pw_t3'].map((k, i) => '<span class="' + (i === tri ? 'on' : '') + '">' + esc(t(k)) + '</span>').join('') + '</div>' +
      '<dl class="kv docp-kv"><dt>' + esc(T('preg_from')) + '</dt><dd>' + esc(TF(p.from === 'scan' ? 'preg_scan' : 'preg_lmp', { d: fmtL(p.label || p.basis) })) + '</dd><dt>' + esc(T('preg_edd')) + '</dt><dd>' + esc(fmtL(p.edd)) + '</dd></dl>' +
      '<p class="small"><strong class="docp-strong">' + esc(T('preg_win')) + ':</strong> ' + esc(win ? t(win) : T('preg_between')) + '</p></div>';
  }
  function ppCard(o) {
    const p = o.pp;
    return '<div class="card"><h2>' + esc(t('sec_post')) + '</h2><p class="docp-big num">' + esc(TF('pp_day', { n: p.day })) + '</p>' +
      '<dl class="kv docp-kv"><dt>' + esc(T('pp_born')) + '</dt><dd>' + esc(fmtL(p.born)) + '</dd><dt>' + esc(t('bf')) + '</dt><dd>' + esc(p.bf ? t('yes') : t('no')) + '</dd></dl>' +
      '<p class="small">' + esc(t('bf_d')) + '</p><p class="small">' + esc(TF('pp_six', { d: fmtL(p.six) })) + '</p></div>';
  }
  function ciCard(o) {
    if (!o.ci.length) return '<div class="card"><h2>' + esc(T('ci_h')) + '</h2><p class="small">' + esc(T('ci_none')) + '</p></div>';
    return '<div class="card"><h2>' + esc(T('ci_h')) + '</h2><div class="docp-cis">' + o.ci.map((c) => {
      const chips = c.chips.map((x) => (hasKey('ci_' + x) ? t('ci_' + x) : '')).filter(Boolean);
      const hot = c.hot && c.hot !== 'hot_0' && hasKey(c.hot) ? t('ci_hot') + ': ' + t(c.hot) : '';
      return '<div class="docp-ci"><strong>' + esc(fmtM(c.k)) + '</strong><span>' + esc(chips.join(' · ') || '–') + '</span>' + (hot ? '<span>' + esc(hot) + '</span>' : '') + (c.note ? '<span class="docp-note-l">' + esc(TF('ci_note', { x: c.note })) + '</span>' : '') + '</div>';
    }).join('') + '</div></div>';
  }
  function sumCard(o) {
    const body = o.sums.length ? o.sums.map((s) => '<div class="docp-sum"><h3>' + esc(s.title) + '</h3><ul>' + s.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>').join('') : '<p class="small">' + esc(T('sum_none')) + '</p>';
    return '<div class="card"><h2>' + esc(T('sum_h')) + '</h2><p class="small">' + esc(T('sum_p')) + '</p>' + body + '</div>';
  }
  function medCard(o) {
    const it = (ico, a, b) => '<div class="item quiet"><span class="ico-sm">' + ico + '</span><span class="body"><strong>' + esc(a) + '</strong>' + (b ? '<span>' + esc(b) + '</span>' : '') + '</span></div>';
    const meds = o.meds.map((m) => it(S.I.pill, m.text, (m.next ? TF('next_v', { d: fmtS(m.next) }) : '') + (m.time ? (m.next ? ' · ' : '') + m.time : ''))).join('');
    const horm = o.sit.hormones ? it(S.I.pill, T('med_horm'), '') : '';
    const up = o.up.map((u) => it(S.I.bell, u.text, S.fmtD(S.fromISO(u.d), { weekday: 'short', day: 'numeric', month: 'short' }) + (u.time ? ' · ' + u.time : ''))).join('');
    return '<div class="card"><h2>' + esc(T('med_h')) + '</h2><h3>' + esc(T('med_l')) + '</h3>' + (meds || horm ? '<div class="list">' + horm + meds + '</div>' : '<p class="small">' + esc(T('med_none')) + '</p>') +
      '<h3>' + esc(T('up_l')) + '</h3>' + (up ? '<div class="list">' + up + '</div>' : '<p class="small">' + esc(T('up_none')) + '</p>') + '</div>';
  }
  function noteCard(o) {
    const id = o.id; let date, va = {};
    if (id === 'priya') date = '2026-10-16';
    else if (id === 'meera') date = '2026-10-17';
    else if (id === 'kamla') date = '2026-10-10';
    else if (id === 'sunita' && o.pp) { const n = Math.max(1, o.pp.day - 2); date = iso(S.addDays(S.fromISO(o.pp.born), n)); va = { n: n }; }
    if (!date) return '';
    return '<div class="card soft docp-note"><div class="row spread wrap"><h2>' + esc(T('note_h')) + '</h2><span class="pill muted">' + esc(T('note_tag')) + '</span></div><p>' + esc(TF('note_' + id + '_a', va)) + '</p><p>' + esc(TF('note_' + id + '_b', va)) + '</p><p class="small">' + esc(TF('note_by', { d: fmtL(date) })) + '</p></div>';
  }
  function flagsCard(o) {
    const items = o.flags.map((f) => {
      const cls = f.lvl === 'now' ? ' urgent' : (f.lvl === 'soon' || f.lvl === 'visit' ? ' calm' : '');
      const when = f.d ? fmtS(f.d) : (f.m ? fmtM(f.m) : '');
      return '<div class="flag docp-fl' + cls + '"><div class="docp-flt"><span class="docp-lv">' + esc(T('lv_' + f.lvl)) + '</span>' + (when ? '<span class="docp-fd">' + esc(when) + '</span>' : '') + '</div><span class="docp-ftx">' + esc(f.text) + '</span></div>';
    }).join('');
    return '<div class="card"><div class="row spread"><h2>' + esc(T('flags_h')) + '</h2>' + flagPill(o) + '</div>' + (items ? '<div class="stack">' + items + '</div>' : '<div class="flag ok">' + esc(T('flags_none')) + '</div>') + '<p class="small">' + esc(T('flags_p')) + '</p></div>';
  }
  function renderPatient(v, rest) {
    const id = PEOPLE.indexOf(rest) >= 0 ? rest : null;
    if (!id) { renderHub(v); return; }
    const o = collect(id); const nm = name(id);
    let h = S.backRow(o && o.c4 && o.age != null ? nm + ', ' + o.age : nm, 'docportal', true) + '<p class="small">' + esc(T('p_intro')) + '</p>';
    if (!o) { v.innerHTML = h + '<div class="card warn"><p>' + esc(T('err')) + '</p><button type="button" class="btn sm" data-go="docportal">' + esc(T('back_list')) + '</button></div>'; S.wire(v); return; }
    if (!o.c4) {
      v.innerHTML = h + '<div class="card"><div class="row docp-lockrow"><span class="docp-av lock" aria-hidden="true">' + S.I.lock + '</span><h2>' + esc(TF('lock_h', { name: nm })) + '</h2></div><p>' + esc(T('lock_p')) + '</p><p class="small">' + esc(T('lock_p2')) + '</p></div>' +
        '<div class="card soft"><h3>' + esc(T('sees_h')) + '</h3><p class="small">' + esc(TF('sees_1', { c: t('c4'), me: t('me') })) + ' ' + esc(T('sees_4')) + '</p></div>' +
        '<button type="button" class="btn block" data-go="docportal">' + esc(T('back_list')) + '</button><p class="footnote">' + esc(T('foot')) + '</p>';
      S.wire(v); return;
    }
    const kv = [[T('k_age'), o.age != null ? TF('age_v', { n: o.age }) : '–'], [T('k_sit'), sitLine(o)], [T('k_shared'), TF('shared_since', { d: fmtL(o.c4) })], [T('k_last'), o.last ? fmtL(o.last) : T('no_entry')]];
    if (!o.preg && !o.pp && o.lastStart && o.cycleDay) kv.push([t('cycle_day'), String(o.cycleDay)]);
    h += '<div class="card"><dl class="kv docp-kv">' + kv.map((x) => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl></div>' +
      flagsCard(o) + (o.preg ? pregCard(o) : (o.pp ? ppCard(o) : gapsCard(o))) + ciCard(o) + sumCard(o) + medCard(o) + noteCard(o) +
      '<div class="card"><h2>' + esc(T('act_h')) + '</h2><div class="stack"><button type="button" class="btn primary block" data-docp-act="tests">' + esc(T('act_tests')) + '</button><button type="button" class="btn block" data-docp-act="refer">' + esc(T('act_refer')) + '</button><button type="button" class="btn block" data-docp-act="msg">' + esc(T('act_msg')) + '</button></div><p class="small">' + esc(T('act_p')) + '</p></div>' +
      '<p class="footnote">' + esc(T('foot')) + ' ' + esc(T('sees_5')) + '</p>';
    v.innerHTML = h; S.wire(v);
    v.querySelectorAll('[data-docp-act]').forEach((b) => b.addEventListener('click', () => S.toast(T('toast_' + b.dataset.docpAct))));
  }

  S.register({
    id: ID,
    demoPersona: 'priya',
    strings: strings,
    routes: { 'docportal': renderHub },
    prefixes: { 'docportal-p-': (v, rest) => renderPatient(v, rest) },
    testRoutes: PEOPLE.map((p) => 'docportal-p-' + p),
    open: ['docportal', 'docportal-p-*'],
    tiles: [{ section: 'tools', route: 'docportal', title: 'docportal_tile', sub: 'docportal_tile_s', icon: 'users', order: 90, gated: true, keywords: 'doctor portal view share sharing consent privacy what the doctor sees डॉक्टर साझा सहमति portal' }],
    me: () => '<div class="list"><button type="button" class="item" data-go="docportal"><span class="ico-sm">' + S.I.users + '</span><span class="body"><strong>' + esc(T('me_item')) + '</strong><span>' + esc(T('me_item_s')) + '</span></span>' + (S.state.settings.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '<span class="chev">' + S.I.chev + '</span></button></div>',
    css: [
      '.docp-ul { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: var(--fg); }',
      '.docp-ul li { margin: 0; }',
      '.docp-pt { align-items: flex-start; }',
      '.docp-pt .body { gap: 3px; }',
      '.docp-pt .body > span { overflow-wrap: anywhere; }',
      '.docp-av { width: 40px; height: 40px; border-radius: 20px; background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.docp-av.lock { background: var(--bg); color: var(--muted); }',
      '.docp-av svg { width: 20px; height: 20px; }',
      '.docp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 3px 0 1px 0; }',
      '.docp-chev { color: var(--accent); width: 18px; height: 18px; flex-shrink: 0; align-self: center; display: inline-flex; }',
      '.docp-chev svg { width: 18px; height: 18px; }',
      '.kv.docp-kv { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }',
      '.kv.docp-kv dd { overflow-wrap: anywhere; }',
      '.flag.docp-fl { flex-direction: column; align-items: stretch; gap: 4px; }',
      '.flag.docp-fl.calm { background: var(--card-2); }',
      '.docp-flt { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }',
      '.docp-lv { color: var(--accent); text-transform: uppercase; min-width: 0; }',
      'body.hi .docp-lv { text-transform: none; letter-spacing: 0; font-size: 12px; }',
      '.flag.urgent .docp-lv { color: var(--bg); }',
      '.docp-fd { color: var(--muted); font-weight: 500; flex-shrink: 0; }',
      '.flag.urgent .docp-fd { color: var(--dark-text); }',
      '.docp-ftx { font-size: 13px; line-height: 1.45; overflow-wrap: anywhere; }',
      '.docp-big { font-family: var(--font-display); font-size: 30px; font-weight: 600; color: var(--fg); line-height: 1.1; }',
      'body.hi .docp-big { font-family: var(--font-hi); font-size: 24px; }',
      '.docp-strong { color: var(--fg); font-weight: 600; }',
      '.docp-cis { display: flex; flex-direction: column; }',
      '.docp-ci { display: flex; flex-direction: column; gap: 2px; padding: 8px 0; border-top: 1px solid var(--line); font-size: 13px; color: var(--text); overflow-wrap: anywhere; }',
      '.docp-ci:first-child { border-top: none; padding-top: 0; }',
      '.docp-ci strong { color: var(--fg); font-weight: 600; }',
      '.docp-note-l { color: var(--fg); font-style: italic; }',
      '.docp-sum { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; }',
      '.docp-sum ul { font-size: 13px; color: var(--text); overflow-wrap: anywhere; }',
      '.docp-note p { color: var(--fg); font-size: 14px; line-height: 1.55; }',
      '.docp-note p.small { color: var(--muted); font-size: 12px; }',
      '.docp-lockrow { align-items: center; }',
      '.docp-lockrow h2 { min-width: 0; overflow-wrap: break-word; }'
    ].join('\n')
  });
})(window.Saathi);
