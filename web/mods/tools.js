/* My tools: one reminders centre, a medicines list, a reports vault with the ABHA explainer, and a one-page summary for the doctor. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const R = { rem: 'tools-reminders', meds: 'tools-meds', reps: 'tools-reports', sum: 'tools-summary' };
  const MINE = [R.rem, R.meds, R.reps, R.sum];
  const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  const SUM_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>';
  const ABHA_URL = 'https://abha.abdm.gov.in/abha/v3/';
  const JA_URL = 'https://janaushadhi.gov.in/';
  const CORE_KEY = 'qura-saathi-v1';
  const PHOTO_CAP = 2500000;        /* characters of photo data the vault may hold (localStorage is about 5 MB per site) */
  const MAXPX = 900, JPEG_Q = 0.6;

  /* ---------- strings: [English, Hindi]; every key becomes tools_<key> ---------- */
  const P = {
    /* tiles */
    t_rem: ['Reminders', 'रिमाइंडर'],
    t_rem_s: ['Medicines, check-ups and your own, in one list', 'दवाएँ, जाँचें और आपके अपने, एक ही सूची में'],
    t_meds: ['My medicines', 'मेरी दवाएँ'],
    t_meds_s: ['What you take, what for, and who prescribed it', 'क्या लेती हैं, किसलिए, और किसने लिखी'],
    t_reps: ['My reports and ABHA', 'मेरी रिपोर्ट और ABHA'],
    t_reps_s: ['Photos of tests, scans and prescriptions; your free health ID', 'जाँच, स्कैन और पर्चों की फ़ोटो; आपकी मुफ़्त health ID'],
    t_sum: ['Summary for my doctor', 'डॉक्टर के लिए सारांश'],
    t_sum_s: ['One page to show or share at your next visit', 'अगली मुलाक़ात में दिखाने या साझा करने के लिए एक पन्ना'],

    /* shared */
    delete: ['Delete', 'हटाएँ'], yes_del: ['Yes, delete', 'हाँ, हटाएँ'], close: ['Close', 'बंद करें'],
    added_you: ['Added by you', 'आपने जोड़ा'], src_meds: ['From My medicines', '“मेरी दवाएँ” से'], src_mod: ['From {s}', '{s} से'],
    rem_short: ['Reminders', 'रिमाइंडर'], meds_short: ['My medicines', 'मेरी दवाएँ'],
    store_err: ['This browser is not keeping data right now (private mode or blocked storage). What you add here will be lost when you close it.', 'यह browser अभी डेटा नहीं रख रहा (private mode या storage बंद है)। यहाँ जो जोड़ेंगी, browser बंद करने पर मिट जाएगा।'],

    /* reminders centre */
    rem_h: ['Reminders', 'रिमाइंडर'],
    rem_p: ['Everything the app reminds you about, in one place. Turn one off, change its time, or add your own.', 'ऐप जिन बातों की याद दिलाता है, सब एक जगह। किसी को बंद करें, उसका समय बदलें, या अपना जोड़ें।'],
    rem_how_h: ['How reminders reach you', 'रिमाइंडर आप तक कैसे पहुँचते हैं'],
    rem_how_live: ['In the live app, everything due on a day comes together in one WhatsApp message, and only if you have said yes to WhatsApp messages. You can say no again at any time on the Me page.', 'असली ऐप में, एक दिन के सारे रिमाइंडर एक ही WhatsApp मैसेज में आते हैं, और सिर्फ़ तब जब आपने WhatsApp मैसेज के लिए हाँ कहा हो। “मैं” पन्ने पर कभी भी फिर से मना कर सकती हैं।'],
    rem_how_proto: ['In this prototype nothing is sent. Reminders for the next 3 days show on Today under "Coming up".', 'इस prototype में कुछ नहीं भेजा जाता। अगले 3 दिनों के रिमाइंडर “आज” पर “आगे क्या है” में दिखते हैं।'],
    /* Version 32 (field-test audit 3.3): on the Android app reminders ring as phone notifications */
    rem_how_phone: ['On this phone, reminders ring as notifications once phone reminders are on (Me, then Reminders). Reminders for the next 3 days also show on Today under "Coming up".', 'इस फ़ोन पर रिमाइंडर नोटिफ़िकेशन की तरह बजते हैं, जब फ़ोन रिमाइंडर चालू हों (“मैं”, फिर “रिमाइंडर”)। अगले 3 दिनों के रिमाइंडर “आज” पर “आगे क्या है” में भी दिखते हैं।'],
    rem_how_off: ['Phone reminders are off, so nothing will ring.', 'फ़ोन रिमाइंडर बंद हैं, इसलिए कुछ नहीं बजेगा।'],
    rem_turn_on: ['Turn on phone reminders', 'फ़ोन रिमाइंडर चालू करें'],
    g_today: ['Today', 'आज'], g_week: ['This week', 'इस हफ़्ते'], g_later: ['Later', 'बाद में'], g_off: ['Off', 'बंद'],
    g_done: ['Finished', 'पूरे हो गए'], g_done_p: ['One-time reminders whose date has passed. Delete them when you no longer need them.', 'एक बार वाले रिमाइंडर जिनकी तारीख़ निकल गई। ज़रूरत न हो तो हटा दें।'],
    alerts_off: ['Phone alerts are off, so these reminders will not ring.', 'फ़ोन पर अलर्ट बंद हैं, इसलिए ये रिमाइंडर नहीं बजेंगे।'], alerts_b: ['Turn on', 'चालू करें'],
    rem_none: ['No reminders yet. Add your own with the button above, or set them from these pages:', 'अभी कोई रिमाइंडर नहीं। ऊपर वाले बटन से अपना जोड़ें, या इन पन्नों से लगाएँ:'],
    lnk_meds: ['Medicines you take', 'आपकी दवाएँ'], lnk_contra: ['Pill, injection or Copper-T dates', 'गोली, इंजेक्शन या Copper-T की तारीख़ें'],
    lnk_screen: ['Check-ups due at your age', 'आपकी उम्र में ज़रूरी जाँचें'], lnk_post: ["After-birth check-ups and the baby's vaccines", 'डिलीवरी के बाद की जाँच और बच्चे के टीके'],
    next_on: ['Next: {d}', 'अगला: {d}'], r_toggle: ['Reminder on', 'रिमाइंडर चालू'], r_time: ['Time', 'समय'],
    r_del_q: ['Delete this reminder?', 'यह रिमाइंडर हटाएँ?'], r_deleted: ['Reminder deleted.', 'रिमाइंडर हटा दिया।'], r_saved: ['Reminder saved.', 'रिमाइंडर सेव हो गया।'],
    r_time_saved: ['Time changed to {t}.', 'समय {t} कर दिया।'], r_now_off: ['Reminder turned off.', 'रिमाइंडर बंद किया।'], r_now_on: ['Reminder turned on.', 'रिमाइंडर चालू किया।'],
    rep_once: ['Once', 'एक बार'], rep_daily: ['Every day', 'रोज़'], rep_weekly: ['Weekly', 'हर हफ़्ते'], rep_everyn: ['Every few days', 'कुछ दिनों में'], rep_monthly: ['Monthly', 'हर महीने'],
    d_once: ['Once', 'एक बार'], d_daily: ['Every day', 'रोज़'], d_weekly: ['Weekly on {d}', 'हर हफ़्ते {d} को'], d_every: ['Every {n} days', 'हर {n} दिन में'],
    d_monthly: ['Monthly, on day {n}', 'हर महीने, {n} तारीख़ को'], d_dates: ['On set dates', 'तय तारीख़ों पर'],
    add_rem: ['Add a reminder', 'रिमाइंडर जोड़ें'],
    f_what: ['What should we remind you about?', 'किस बात की याद दिलाएँ?'], f_what_ph: ['For example: collect my blood test report', 'जैसे: blood test की रिपोर्ट लेनी है'],
    f_start: ['Start date', 'शुरू की तारीख़'], f_time: ['Time', 'समय'], f_repeat: ['Repeat', 'दोहराएँ'], f_days: ['On these days', 'इन दिनों पर'],
    f_n: ['Every how many days? (2–90)', 'कितने दिन में? (2–90)'],
    f_month_note: ['Comes on day {n} of every month, from the start date. In shorter months it comes on the last day.', 'शुरू की तारीख़ से, हर महीने की {n} तारीख़ को आएगा। छोटे महीनों में आख़िरी दिन आएगा।'],
    f_need_title: ['Type what the reminder is for.', 'लिखें कि रिमाइंडर किस बारे में है।'], f_need_day: ['Pick at least one day.', 'कम से कम एक दिन चुनें।'],
    f_need_date: ['Pick a start date.', 'शुरू की तारीख़ चुनें।'],

    /* medicines */
    meds_h: ['My medicines', 'मेरी दवाएँ'],
    meds_p: ['Write down each medicine and supplement the way it is written on your prescription. Show this list to every doctor you see, and to the chemist.', 'हर दवा और supplement वैसे ही लिखें जैसा पर्चे पर लिखा है। यह सूची हर डॉक्टर को और chemist को दिखाएँ।'],
    meds_rule_h: ['Before you change anything', 'कुछ भी बदलने से पहले'],
    meds_rule1: ['Do not start, stop or change a prescribed medicine on your own, even if you feel better or have side effects. Ask the doctor who prescribed it.', 'डॉक्टर की लिखी दवा अपने आप शुरू, बंद या कम-ज़्यादा न करें, चाहे आप ठीक महसूस करें या कोई side effect हो। जिस डॉक्टर ने लिखी, उनसे पूछें।'],
    meds_rule2: ['Pregnant, breastfeeding or trying for a baby? Tell every doctor and chemist before you take anything new, including supplements and herbal products.', 'गर्भवती हैं, स्तनपान करा रही हैं या बच्चे की कोशिश कर रही हैं? कुछ भी नया लेने से पहले हर डॉक्टर और chemist को बताएँ, supplement और जड़ी-बूटी वाली चीज़ें भी।'],
    meds_allergy: ['Swelling of the face or lips, trouble breathing, or a rash spreading fast after a medicine: go to the nearest hospital now.', 'किसी दवा के बाद चेहरे या होंठों पर सूजन, साँस लेने में दिक़्क़त, या तेज़ी से फैलते दाने: अभी सबसे पास के अस्पताल जाएँ।'],
    meds_cur: ['Taking now', 'अभी ले रही हैं'], meds_past: ['Past medicines ({n})', 'पहले ली गई दवाएँ ({n})'],
    meds_none: ['Nothing added yet. Add the medicines and supplements you take now, even vitamins and iron tablets.', 'अभी कुछ नहीं जोड़ा। जो दवाएँ और supplement अभी लेती हैं, सब जोड़ें, vitamin और iron की गोली भी।'],
    m_for: ['For', 'किसलिए'], m_dose: ['As written', 'पर्चे पर लिखा'], m_by: ['Prescribed by', 'किसने लिखी'], m_how: ['How often', 'कितनी बार'], m_dates: ['Dates', 'तारीख़ें'],
    m_since: ['Since {d}', '{d} से'], m_starts: ['Starts {d}', '{d} से शुरू'], m_range: ['{a} to {b}', '{a} से {b} तक'],
    m_rem_on: ['Reminder on', 'रिमाइंडर चालू'], m_rem_none: ['No reminder', 'रिमाइंडर नहीं'],
    add_med: ['Add a medicine', 'दवा जोड़ें'], edit_med: ['Edit medicine', 'दवा बदलें'],
    f_name: ['Medicine or supplement name', 'दवा या supplement का नाम'], f_name_ph: ['As on the strip or bottle', 'जैसा पत्ते या शीशी पर लिखा है'],
    f_why: ['What it is for', 'किसलिए है'], f_why_ph: ['For example: low Hb, thyroid, PMOS', 'जैसे: Hb कम, थायरॉइड, PMOS'],
    f_dose: ['Dose, exactly as written on the prescription', 'खुराक, ठीक वैसे जैसे पर्चे पर लिखी है'], f_dose_ph: ['Copy it word for word', 'शब्द-शब्द वैसा ही लिखें'],
    f_by: ['Who prescribed it', 'किसने लिखी'], f_by_ph: ['Doctor, hospital, ANM or chemist', 'डॉक्टर, अस्पताल, ANM या chemist'],
    f_mstart: ['Started on', 'कब से शुरू'], f_mstop: ['Stop date, if the doctor gave one', 'बंद करने की तारीख़, अगर डॉक्टर ने बताई हो'],
    f_often: ['How often', 'कितनी बार'], o_daily: ['Every day', 'रोज़'], o_weekly: ['Once a week', 'हफ़्ते में एक बार'], o_other: ['Other', 'कुछ और'],
    o_other_note: ['For any other pattern, keep the dose text exact, and add a reminder on the Reminders page if you want one.', 'किसी और तरीक़े के लिए खुराक ठीक-ठीक लिखें, और चाहें तो रिमाइंडर पन्ने पर रिमाइंडर जोड़ें।'],
    o_weekly_on: ['Weekly on {d}', 'हर हफ़्ते {d} को'],
    f_wday: ['Which day', 'किस दिन'], f_times: ['Times of day', 'दिन में कब'], add_time: ['Add a time', 'समय जोड़ें'], rm_time: ['Remove this time', 'यह समय हटाएँ'],
    f_remind: ['Remind me', 'मुझे याद दिलाएँ'], f_remind_p: ['Adds a reminder for each time. It stops by itself after the stop date.', 'हर समय के लिए एक रिमाइंडर जुड़ता है। बंद करने की तारीख़ के बाद अपने आप रुक जाता है।'],
    med_saved: ['Medicine saved.', 'दवा सेव हो गई।'],
    med_del_q: ['Delete this medicine and its reminders? This only changes your list, not your prescription.', 'यह दवा और इसके रिमाइंडर हटाएँ? इससे सिर्फ़ आपकी सूची बदलती है, आपका पर्चा नहीं।'],
    med_deleted: ['Medicine deleted.', 'दवा हटा दी।'], f_need_name: ['Type the medicine name.', 'दवा का नाम लिखें।'], f_bad_stop: ['The stop date is before the start date.', 'बंद करने की तारीख़ शुरू की तारीख़ से पहले है।'],
    med_rem_title: ['Take {m}', '{m} लेने का समय'],
    ja_h: ['Generic medicines cost less', 'Generic दवाएँ सस्ती होती हैं'],
    ja_p: ['Jan Aushadhi Kendras sell generic medicines at prices about 50–80% lower than branded ones (Government of India). Ask your doctor to write the generic (salt) name, so any Kendra can give you the same medicine.', 'जन औषधि केंद्र generic दवाएँ branded दवाओं से लगभग 50–80% कम दाम पर बेचते हैं (भारत सरकार)। डॉक्टर से generic (salt) नाम लिखने को कहें, ताकि कोई भी केंद्र वही दवा दे सके।'],
    ja_find: ['Find the nearest Kendra with the free Jan Aushadhi Sugam app, or on the official website.', 'नज़दीकी केंद्र मुफ़्त Jan Aushadhi Sugam app से या सरकारी website पर खोजें।'],
    ja_switch: ['Moving from a branded to a generic medicine? Show the new strip to your doctor or pharmacist first, so the salt and strength stay the same.', 'Branded से generic पर जा रही हैं? नया पत्ता पहले डॉक्टर या pharmacist को दिखाएँ, ताकि salt और strength वही रहे।'],
    ja_free: ['Government hospitals, CHCs, PHCs and Ayushman Arogya Mandirs give many essential medicines free. The list differs by state, so ask at the medicine counter first.', 'सरकारी अस्पताल, CHC, PHC और आयुष्मान आरोग्य मंदिर कई ज़रूरी दवाएँ मुफ़्त देते हैं। सूची हर राज्य में अलग होती है, इसलिए पहले दवा काउंटर पर पूछें।'],
    ja_link: ['janaushadhi.gov.in (official)', 'janaushadhi.gov.in (सरकारी)'],
    meds_qura_h: ['Questions about your medicines?', 'दवाओं के बारे में सवाल?'],
    meds_qura_p: ['A Qura doctor (BAMS) can go through your list with you on a free call and tell you what to ask the doctor who prescribed each one. She does not change another doctor\'s prescription.', 'Qura की डॉक्टर (BAMS) मुफ़्त कॉल पर आपकी सूची आपके साथ देख सकती हैं और बता सकती हैं कि हर दवा के बारे में लिखने वाले डॉक्टर से क्या पूछें। वह किसी दूसरे डॉक्टर का पर्चा नहीं बदलतीं।'],
    meds_topic: ['Going through my medicines', 'मेरी दवाओं के बारे में'],

    /* reports */
    reps_h: ['My reports', 'मेरी रिपोर्ट'],
    reps_p: ['Keep photos of your test reports, scans and prescriptions together, so they are ready at your next visit.', 'अपनी जाँच रिपोर्ट, स्कैन और पर्चों की फ़ोटो एक जगह रखें, ताकि अगली मुलाक़ात में तैयार रहें।'],
    reps_local: ['Photos stay only on this phone, inside Sakhi. Deleting Sakhi or its data deletes them, so keep the paper copies too.', 'फ़ोटो सिर्फ़ इसी फ़ोन पर, Sakhi के अंदर रहती हैं। Sakhi या उसका डेटा मिटाने पर ये भी मिट जाती हैं, इसलिए काग़ज़ वाली कॉपी भी रखें।'],
    ty_blood: ['Blood test', 'खून की जाँच'], ty_scan: ['Scan', 'स्कैन'], ty_rx: ['Prescription', 'पर्चा'], ty_dis: ['Discharge summary', 'डिस्चार्ज समरी'], ty_other: ['Other', 'अन्य'],
    ty_all: ['All', 'सब'],
    add_rep: ['Add a report', 'रिपोर्ट जोड़ें'], f_type: ['What kind of report', 'किस तरह की रिपोर्ट'], f_rdate: ['Date on the report', 'रिपोर्ट की तारीख़'],
    f_rtitle: ['Title', 'नाम'], f_rtitle_ph: ['For example: TSH report, pelvic ultrasound', 'जैसे: TSH रिपोर्ट, पेल्विक अल्ट्रासाउंड'],
    f_notes: ['Notes (optional)', 'नोट (वैकल्पिक)'], f_notes_ph: ['What the doctor said, or what to ask next time', 'डॉक्टर ने क्या कहा, या अगली बार क्या पूछना है'],
    f_photo: ['Photo of the report (optional)', 'रिपोर्ट की फ़ोटो (वैकल्पिक)'],
    f_photo_p: ['Lay the page flat in good light. The photo is made smaller so it takes less space.', 'पन्ना सीधा रखें, अच्छी रोशनी में। फ़ोटो छोटी करके रखी जाती है ताकि कम जगह ले।'],
    ph_working: ['Preparing the photo…', 'फ़ोटो तैयार हो रही है…'], ph_ready: ['Photo ready', 'फ़ोटो तैयार'], ph_remove: ['Remove photo', 'फ़ोटो हटाएँ'],
    ph_bad: ['This photo could not be opened. Try a JPG or PNG photo, or take a screenshot of the report and add that.', 'यह फ़ोटो खुल नहीं पाई। JPG या PNG फ़ोटो आज़माएँ, या रिपोर्ट का screenshot लेकर वह जोड़ें।'],
    ph_full: ['Not enough space for this photo. Delete an old photo, or save the report without one.', 'इस फ़ोटो के लिए जगह नहीं है। कोई पुरानी फ़ोटो हटाएँ, या रिपोर्ट बिना फ़ोटो के सेव करें।'],
    ph_store: ['This browser has no room to keep the photo. Save the report without it, or delete an old photo first.', 'इस browser में फ़ोटो रखने की जगह नहीं है। रिपोर्ट बिना फ़ोटो सेव करें, या पहले कोई पुरानी फ़ोटो हटाएँ।'],
    ph_lost: ['This browser would not keep the photo, so the report was saved without it.', 'इस browser ने फ़ोटो नहीं रखी, इसलिए रिपोर्ट बिना फ़ोटो के सेव हुई।'],
    space_h: ['Photo space', 'फ़ोटो की जगह'], space_used: ['{u} of {c} MB used · {n} photos', '{c} MB में से {u} MB भरा · {n} फ़ोटो'],
    space_warn: ['Nearly full. Delete photos you no longer need, or add new reports without a photo.', 'लगभग भर गई। जो फ़ोटो अब नहीं चाहिए, उन्हें हटाएँ, या नई रिपोर्ट बिना फ़ोटो जोड़ें।'],
    space_full: ['Full. Delete a photo to add a new one. Reports without photos can still be added.', 'भर गई। नई फ़ोटो के लिए कोई फ़ोटो हटाएँ। बिना फ़ोटो की रिपोर्ट अब भी जोड़ सकती हैं।'],
    rep_saved: ['Report saved.', 'रिपोर्ट सेव हो गई।'], rep_need_title: ['Give the report a title.', 'रिपोर्ट का नाम लिखें।'], rep_need_date: ['Add the date on the report.', 'रिपोर्ट की तारीख़ डालें।'],
    rep_none: ['No reports yet. Add your latest blood test, scan or prescription.', 'अभी कोई रिपोर्ट नहीं। अपना पिछला blood test, स्कैन या पर्चा जोड़ें।'],
    rep_none_f: ['No reports of this kind.', 'इस तरह की कोई रिपोर्ट नहीं।'], no_photo: ['No photo', 'फ़ोटो नहीं'],
    rep_del_q: ['Delete this report and its photo from this phone?', 'यह रिपोर्ट और इसकी फ़ोटो इस फ़ोन से हटाएँ?'], rep_deleted: ['Report deleted.', 'रिपोर्ट हटा दी।'],
    rep_free: ['Many essential tests are free at government hospitals, PHCs and Ayushman Arogya Mandirs. Ask there before you pay at a private lab.', 'सरकारी अस्पताल, PHC और आयुष्मान आरोग्य मंदिर में कई ज़रूरी जाँचें मुफ़्त होती हैं। private lab में पैसे देने से पहले वहाँ पूछें।'], rep_free_doc: ['Many essential tests are also free at government hospitals, PHCs and Ayushman Arogya Mandirs.', 'सरकारी अस्पताल, PHC और आयुष्मान आरोग्य मंदिर में कई ज़रूरी जाँचें मुफ़्त भी होती हैं।'],
    photo_alt: ['Photo of the report', 'रिपोर्ट की फ़ोटो'],

    /* ABHA */
    abha_h: ['ABHA: your free health ID', 'ABHA: आपकी मुफ़्त health ID'],
    abha_p1: ['ABHA (Ayushman Bharat Health Account) is a free 14-digit health ID from the Government of India. Hospitals and labs that are part of the Ayushman Bharat Digital Mission (ABDM) can link your reports to it, so they are not lost.', 'ABHA (आयुष्मान भारत हेल्थ अकाउंट) भारत सरकार की मुफ़्त 14 अंकों की health ID है। आयुष्मान भारत डिजिटल मिशन (ABDM) से जुड़े अस्पताल और lab आपकी रिपोर्ट इससे जोड़ सकते हैं, ताकि वे खोएँ नहीं।'],
    abha_p2: ['A record is shared with a doctor only when you give consent, and you choose which records. Making an ABHA does not enrol you in the PM-JAY insurance scheme.', 'कोई भी रिकॉर्ड डॉक्टर से तभी साझा होता है जब आप सहमति दें, और आप ही चुनती हैं कि कौन से। ABHA बनाने से आप PM-JAY बीमा योजना में नहीं जुड़ जातीं।'],
    abha_how: ['How to make one', 'कैसे बनाएँ'],
    abha_s1: ['Open the official site abha.abdm.gov.in, or the ABHA app, and choose to create an ABHA number.', 'सरकारी site abha.abdm.gov.in या ABHA app खोलें और ABHA number बनाना चुनें।'],
    abha_s2: ['Use your Aadhaar: an OTP goes to the mobile number linked to it. A driving licence also works. No mobile linked to Aadhaar? A government hospital that is part of ABDM can help.', 'Aadhaar से बनाएँ: OTP उस मोबाइल पर आता है जो Aadhaar से जुड़ा है। driving licence से भी बनता है। Aadhaar से मोबाइल नहीं जुड़ा? ABDM से जुड़ा सरकारी अस्पताल मदद कर सकता है।'],
    abha_s3: ['Pick an ABHA address: an easy username that looks like name@abdm.', 'ABHA address चुनें: एक आसान username जो name@abdm जैसा दिखता है।'],
    abha_otp: ['Never tell an OTP to anyone who calls or messages you, even if they say they are from a hospital or the government.', 'जो भी कॉल या मैसेज करे, उसे OTP कभी न बताएँ, चाहे वह ख़ुद को अस्पताल या सरकार से बताए।'],
    abha_link: ['Open abha.abdm.gov.in', 'abha.abdm.gov.in खोलें'],
    abha_mine: ['My ABHA address (optional)', 'मेरा ABHA address (वैकल्पिक)'],
    abha_mine_p: ['Kept only on this phone and shown hidden. Do not type your Aadhaar number here.', 'सिर्फ़ इसी फ़ोन पर रहता है और छिपा दिखता है। यहाँ Aadhaar नंबर न लिखें।'],
    abha_show: ['Show', 'दिखाएँ'], abha_hide: ['Hide', 'छिपाएँ'], abha_change: ['Change', 'बदलें'], abha_remove: ['Remove', 'हटाएँ'],
    abha_saved: ['ABHA address noted on this phone.', 'ABHA address इस फ़ोन पर लिख लिया।'], abha_removed: ['ABHA address removed from this phone.', 'ABHA address इस फ़ोन से हटा दिया।'],
    abha_bad: ['That does not look like an ABHA address. It has an @ in it, like name@abdm.', 'यह ABHA address जैसा नहीं लगता। इसमें @ होता है, जैसे name@abdm।'],
    abha_digits: ['That looks like an Aadhaar or ABHA number. Note only the ABHA address (the one with @) here.', 'यह Aadhaar या ABHA नंबर जैसा लगता है। यहाँ सिर्फ़ ABHA address (@ वाला) लिखें।'],
    abha_live: ['Sakhi doesn’t connect to ABDM yet. If it does, Qura will see or link records only through the official ABDM consent screen, where you approve each request.', 'Sakhi अभी ABDM से नहीं जुड़ती। जुड़ेगी, तो Qura रिकॉर्ड सिर्फ़ ABDM की सरकारी सहमति स्क्रीन से देखेगा या जोड़ेगा, जहाँ आप हर अनुरोध ख़ुद मंज़ूर करती हैं।'],

    /* doctor summary */
    sum_h: ['Summary for my doctor', 'डॉक्टर के लिए सारांश'],
    sum_p: ['One page made from what you entered: your diary numbers, check-ins, medicines and what is coming up. Show it at a visit, or copy it into a message.', 'आपकी entries से बना एक पन्ना: डायरी के आँकड़े, चेक-इन, दवाएँ और आगे क्या है। मुलाक़ात में दिखाएँ, या मैसेज में copy करें।'],
    show_doc: ['Show to doctor', 'डॉक्टर को दिखाएँ'], copy_txt: ['Copy as text', 'text copy करें'],
    copied_ok: ['Summary copied. Paste it into a message.', 'सारांश copy हो गया। मैसेज में paste करें।'],
    copy_fallback: ['This browser did not allow copying. The text is selected below: press and hold it, then tap Copy.', 'इस browser ने copy नहीं करने दिया। नीचे text चुना हुआ है: उसे दबाकर रखें, फिर Copy दबाएँ।'],
    sum_title: ['Health summary', 'सेहत का सारांश'],
    sum_made: ["From the patient's own entries in Qura Sakhi, made on {d}. Not a diagnosis.", 'मरीज़ की अपनी entries से, Qura Sakhi में {d} को बना। यह diagnosis नहीं है।'],
    sum_age: ['Age {n}', 'उम्र {n}'], sum_meds: ['Current medicines', 'अभी की दवाएँ'], sum_meds_none: ['None entered', 'कोई नहीं लिखी'],
    sum_rem: ['Coming up (next 14 days)', 'आगे क्या है (अगले 14 दिन)'], sum_reps: ['Reports on this phone', 'इस फ़ोन पर रिपोर्ट'], sum_more: ['and {n} more', 'और {n}'],
    sum_empty: ['Not much here yet. Log your periods and add your medicines and reports; this page fills itself.', 'अभी यहाँ ज़्यादा नहीं है। पीरियड दर्ज करें, दवाएँ और रिपोर्ट जोड़ें; यह पन्ना अपने आप भरता है।'],
    doc_for: ['For the doctor', 'डॉक्टर के लिए'],
    doc_lang: ['Does your doctor read the other language better? Switch EN / हिंदी at the top first, then tap Show to doctor.', 'आपकी डॉक्टर दूसरी भाषा बेहतर पढ़ती हैं? पहले ऊपर EN / हिंदी बदलें, फिर “डॉक्टर को दिखाएँ” दबाएँ।'],
    share_h: ['Share with my Qura doctor', 'मेरी Qura डॉक्टर से साझा करें'],
    share_what: ['What this means: once Sakhi can send to Qura, your Qura doctor will be able to read your diary, check-ins and this summary before and during your calls. Until then nothing leaves this phone. Nobody else will see it, and nothing goes to ad companies. You can withdraw it at any time on the Me page.', 'इसका मतलब: जब Sakhi, Qura को भेज पाएगी, तब आपकी Qura डॉक्टर कॉल से पहले और कॉल के दौरान आपकी डायरी, चेक-इन और यह सारांश पढ़ पाएँगी। तब तक कुछ भी इस फ़ोन से बाहर नहीं जाता। और कोई नहीं देखेगा, ad companies को कुछ नहीं जाता। “मैं” पन्ने पर कभी भी सहमति वापस ले सकती हैं।'],
    share_q: ['Share your diary and this summary with your Qura doctor?', 'अपनी डायरी और यह सारांश अपनी Qura डॉक्टर से साझा करें?'],
    share_yes: ['Yes, share', 'हाँ, साझा करें'],
    shared_on: ['You said yes to sharing on {d}. Sakhi cannot send it to your doctor yet, so show it to her on your call. To stop, withdraw it on the Me page.', 'आपने {d} को साझा करने के लिए हाँ कहा। Sakhi अभी इसे आपकी डॉक्टर को नहीं भेज सकती, इसलिए कॉल पर उन्हें दिखाएँ। रोकना हो तो “मैं” पन्ने पर सहमति वापस लें।'],
    shared_toast: ['Saved: you said yes to sharing.', 'सेव हुआ: आपने साझा करने के लिए हाँ कहा।'],
    sum_urgent: ['Something urgent? Do not wait for a visit. Go to the nearest hospital.', 'कुछ ज़रूरी हो? मुलाक़ात का इंतज़ार न करें। सबसे पास के अस्पताल जाएँ।']
  };
  const strings = { en: {}, hi: {} };
  Object.keys(P).forEach((k) => { strings.en['tools_' + k] = P[k][0]; strings.hi['tools_' + k] = P[k][1]; });

  /* ---------- helpers ---------- */
  const T = (k) => t('tools_' + k);
  const TF = (k, o) => S.tf('tools_' + k, o);
  const iso = (d) => S.toISO(d);
  const tdISO = () => iso(S.today());
  const okISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const val = (x) => (x == null ? '' : (typeof x === 'string' ? x : tx(x)));
  const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36);
  const fmtLong = (s) => (okISO(s) ? S.fmtD(S.fromISO(s), { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const fmtDay = (d) => S.fmtD(d, d.getFullYear() === S.today().getFullYear() ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const wdName = (k) => S.fmtD(S.addDays(new Date(2024, 0, 7), k), { weekday: 'short' });   /* 7 Jan 2024 was a Sunday */
  const WD_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const REPS = ['once', 'daily', 'weekly', 'everyn', 'monthly'];
  const TYPES = ['blood', 'scan', 'rx', 'dis', 'other'];
  const TYPE_ICON = { blood: 'drop', scan: 'chart', rx: 'pill', dis: 'file', other: 'file' };
  const KIND_ICON = { med: 'pill', checkup: 'check', visit: 'map', custom: 'bell', log: 'diary' };
  const field = (id, label, input) => '<div class="tl-field"><label for="' + id + '">' + esc(label) + '</label>' + input + '</div>';
  const chev = () => S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"');

  const D = () => { const d = S.data('tools'); if (!Array.isArray(d.meds)) d.meds = []; if (!Array.isArray(d.reports)) d.reports = []; return d; };
  const peek = () => { const st = S.state; return st && st.mods && st.mods.tools ? st.mods.tools : null; };

  /* UI state lives per saved-state object, so loading a sample or deleting everything starts clean. */
  let ui = {}; let uiOwner = null; let escH = null;
  const U = () => { if (uiOwner !== S.state) { uiOwner = S.state; ui = { remForm: null, remConfirm: null, medForm: null, medConfirm: null, repForm: null, repFilter: 'all', abhaEdit: false, abhaShow: false, abhaErr: '', docView: false, shareAsk: false, copyText: null }; } return ui; };

  const storageOK = () => { try { localStorage.setItem('qs-tools-probe', '1'); localStorage.removeItem('qs-tools-probe'); return true; } catch (e) { return false; } };
  const roomFor = (s) => { try { localStorage.setItem('qs-tools-probe', s); localStorage.removeItem('qs-tools-probe'); return true; } catch (e) { try { localStorage.removeItem('qs-tools-probe'); } catch (x) { } return false; } };
  /* The core save() swallows storage errors, so check that what we just saved really landed. null = cannot tell. */
  const persisted = (needle) => { try { const raw = localStorage.getItem(CORE_KEY); return raw == null ? null : raw.indexOf(needle) >= 0; } catch (e) { return null; } };

  /* ---------- reminders: shared helpers ---------- */
  const safeNext = (r) => { try { return S.reminders.next(r); } catch (e) { return null; } };
  function monthDates(startISO, dom) {
    const st = S.fromISO(startISO); const td = S.today(); const from = st > td ? st : td; const out = [];
    for (let k = 0; out.length < 24 && k < 60; k++) {
      const mm = from.getMonth() + k; const yy = from.getFullYear() + Math.floor(mm / 12); const mo = ((mm % 12) + 12) % 12;
      const last = new Date(yy, mo + 1, 0).getDate(); const d = new Date(yy, mo, Math.min(dom, last));
      if (d >= st && d >= td) out.push(iso(d));
    }
    return out;
  }
  function repText(r) {
    if (r.rep === 'monthly') return TF('d_monthly', { n: r.dom || (okISO(r.start) ? S.fromISO(r.start).getDate() : 1) });
    if (r.dates && r.dates.length) return r.dates.length === 1 ? T('d_once') : T('d_dates');
    if (r.weekdays && r.weekdays.length) return TF('d_weekly', { d: WD_ORDER.filter((k) => r.weekdays.indexOf(k) >= 0).map(wdName).join(', ') });
    if (r.every === 1) return T('d_daily');
    if (r.every === 7 && okISO(r.start)) return TF('d_weekly', { d: wdName(S.fromISO(r.start).getDay()) });
    if (r.every > 1) return TF('d_every', { n: r.every });
    return T('d_once');
  }
  function srcText(r) {
    if (r.mod === 'tools') return r.kind === 'med' ? T('src_meds') : T('added_you');
    const k = 'sec_' + r.mod; return S.strings.en[k] ? TF('src_mod', { s: t(k) }) : '';
  }
  function remTitle(r) { try { return S.reminders.text(r) || ''; } catch (e) { return ''; } }

  /* ---------- medicines: shared helpers ---------- */
  const isPast = (m) => !!(m.stop && m.stop < tdISO());
  const medRems = (id) => S.reminders.list().filter((r) => r.medId === id || (typeof r.id === 'string' && r.id.indexOf('tools-med-' + id + '-') === 0));
  function dropMedRems(id) { medRems(id).map((r) => r.id).forEach((rid) => S.reminders.remove(rid)); }
  function syncMedRems(m) {
    dropMedRems(m.id);
    if (!m.remind || m.freq === 'other' || isPast(m)) return;
    const nEn = typeof m.name === 'string' ? m.name : (m.name.en || ''), nHi = typeof m.name === 'string' ? m.name : (m.name.hi || nEn);
    (m.times || []).filter(Boolean).forEach((tm, i) => S.reminders.upsert({
      id: 'tools-med-' + m.id + '-' + i, mod: 'tools', kind: 'med', medId: m.id, on: true, time: tm,
      title: { en: P.med_rem_title[0].replace('{m}', nEn), hi: P.med_rem_title[1].replace('{m}', nHi) },
      start: okISO(m.start) ? m.start : tdISO(), until: okISO(m.stop) ? m.stop : null, every: m.freq === 'daily' ? 1 : null, weekdays: m.freq === 'weekly' ? [m.wd == null ? 0 : m.wd] : null, dates: null
    }));
  }
  function howText(m) {
    const times = (m.times || []).filter(Boolean).join(', ');
    const base = m.freq === 'weekly' ? TF('o_weekly_on', { d: wdName(m.wd == null ? 0 : m.wd) }) : (m.freq === 'other' ? T('o_other') : T('o_daily'));
    return base + (times && m.freq !== 'other' ? ' · ' + times : '');
  }
  function datesText(m) {
    if (m.start && m.stop) return TF('m_range', { a: fmtLong(m.start), b: fmtLong(m.stop) });
    if (m.start) return m.start > tdISO() ? TF('m_starts', { d: fmtLong(m.start) }) : TF('m_since', { d: fmtLong(m.start) });
    return '';
  }
  const curMeds = (d) => (d ? d.meds : []).filter((m) => !isPast(m)).sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
  const medLine = (m) => { const dose = val(m.dose), by = val(m.by), d0 = datesText(m), ds = d0.charAt(0).toLowerCase() + d0.slice(1); return val(m.name) + (dose ? ': ' + dose : '') + (by || ds ? ' (' + [by, ds].filter(Boolean).join(', ') + ')' : ''); };

  /* Housekeeping before every render: stop reminders of medicines past their stop date, and keep monthly reminders topped up. */
  function housekeep() {
    const d = peek(); const st = S.state; if (!st) return;
    if (d && Array.isArray(d.meds)) d.meds.forEach((m) => { if (isPast(m) && medRems(m.id).length) dropMedRems(m.id); });
    (st.reminders || []).forEach((r) => {
      if (r.mod !== 'tools' || r.rep !== 'monthly' || !okISO(r.start)) return;
      const fut = (r.dates || []).filter((x) => x >= tdISO()).length;
      if (fut < 6) S.reminders.upsert({ id: r.id, dates: monthDates(r.start, r.dom || S.fromISO(r.start).getDate()) });
    });
  }

  /* =====================================================================
     Reminders centre
     ===================================================================== */
  function renderReminders(v) {
    U();
    const draw = () => {
      const can = S.canSave(); const all = S.reminders.list();
      const g = { today: [], week: [], later: [], off: [], done: [] }; const td = S.today();
      all.forEach((r) => {
        if (r.on === false) { g.off.push({ r: r, d: null }); return; }
        const nd = safeNext(r); if (!nd) { g.done.push({ r: r, d: null }); return; }
        const k = S.diffDays(td, nd); (k <= 0 ? g.today : (k <= 7 ? g.week : g.later)).push({ r: r, d: nd });
      });
      const by = (a, b) => ((a.d && b.d ? a.d - b.d : 0) || String(a.r.time || '').localeCompare(String(b.r.time || '')));
      Object.keys(g).forEach((k) => g[k].sort(by));
      let n = 0;
      const row = (x) => {
        const r = x.r; const on = r.on !== false; const i = n++; const ic = S.icon(KIND_ICON[r.kind] || 'bell');
        const sub = [x.d ? TF('next_on', { d: fmtDay(x.d) }) : '', repText(r)].filter(Boolean).join(' · '); const src = srcText(r);
        const ctl = ui.remConfirm === r.id
          ? '<div class="tl-confirm"><p class="small" style="color:var(--fg)">' + esc(T('r_del_q')) + '</p><div class="row"><button type="button" class="btn sm" data-rno="1">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" data-ryes="' + esc(r.id) + '">' + esc(T('yes_del')) + '</button></div></div>'
          : '<div class="tl-rem-ctl"><label class="small" for="tl-rt-' + i + '">' + esc(T('r_time')) + '</label><input type="time" class="tl-time" id="tl-rt-' + i + '" data-rtime="' + esc(r.id) + '" value="' + esc(r.time || '') + '"' + (can ? '' : ' disabled') + '>' + (can ? '<button type="button" class="btn sm ghost" data-rdel="' + esc(r.id) + '">' + esc(T('delete')) + '</button>' : '') + '</div>';
        return '<div class="tl-rem' + (on ? '' : ' tl-off') + '"><div class="tl-rem-top"><span class="ico-sm">' + ic + '</span><div class="tl-grow"><strong>' + esc(remTitle(r)) + '</strong><span class="small">' + esc(sub) + '</span>' + (src ? '<span class="small">' + esc(src) + '</span>' : '') + '</div>' +
          (can ? '<label class="tl-switch"><input type="checkbox" data-rtog="' + esc(r.id) + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(T('r_toggle')) + '"><span aria-hidden="true"></span></label>' : '') + '</div>' + ctl + '</div>';
      };
      const grp = (key, label, items, note) => (items.length ? '<section class="stack"><div class="row spread"><h2>' + esc(T(label)) + '</h2><span class="pill muted num">' + items.length + '</span></div>' + (note ? '<p class="small">' + esc(T(note)) + '</p>' : '') + items.map(row).join('') + '</section>' : '');
      const links = [[R.meds, 'lnk_meds', 'pill'], ['contra-mine', 'lnk_contra', 'leaf'], ['screen-mine', 'lnk_screen', 'check'], ['post-checks', 'lnk_post', 'baby']];
      const empty = '<div class="card"><p>' + esc(T('rem_none')) + '</p><div class="list">' + links.map((x) => '<button type="button" class="item quiet" data-go="' + x[0] + '"><span class="ico-sm">' + S.icon(x[2]) + '</span><span class="body"><strong>' + esc(T(x[1])) + '</strong></span><span style="color:var(--accent);width:18px;flex-shrink:0">' + S.I.chev + '</span></button>').join('') + '</div></div>';
      const phone = !!(S.alerts && S.alerts.can()); const ringing = phone && S.alerts.on();
      const how = '<div class="card soft"><h3>' + esc(T('rem_how_h')) + '</h3>' + (phone ? '<p class="small">' + esc(T('rem_how_phone')) + '</p>' + (ringing ? '' : '<p class="small" style="color:var(--fg);font-weight:600">' + esc(T('rem_how_off')) + '</p><button type="button" class="btn sm primary" style="align-self:flex-start" data-go="me-reminders">' + esc(T('rem_turn_on')) + '</button>') : '<p class="small">' + esc(T('rem_how_live')) + '</p><p class="small">' + esc(T('rem_how_proto')) + '</p>') + (can ? '<div class="row wrap"><button type="button" class="btn sm" data-go="home">' + esc(t('home')) + '</button><button type="button" class="btn sm ghost" data-go="me">' + esc(t('me')) + '</button></div>' : '') + '</div>';
      const addPart = !can ? S.needDiary() : (ui.remForm ? remFormHtml(ui.remForm) : '<button type="button" class="btn primary block" id="tl-radd">' + S.I.bell.replace('<svg', '<svg style="width:20px;height:20px"') + esc(T('add_rem')) + '</button>');
      v.innerHTML = S.backRow(T('rem_h'), 'care', false) + '<p class="small">' + esc(T('rem_p')) + '</p>' + (can && !storageOK() ? '<div class="flag">' + esc(T('store_err')) + '</div>' : '') +
        (can && all.length && S.alerts && S.alerts.can() && !S.alerts.on() ? '<div class="flag" id="tl-alerts"><span>' + esc(T('alerts_off')) + '</span> <button type="button" class="btn sm" data-go="me-reminders">' + esc(T('alerts_b')) + '</button></div>' : '') + addPart +
        (all.length ? grp('today', 'g_today', g.today) + grp('week', 'g_week', g.week) + grp('later', 'g_later', g.later) + grp('off', 'g_off', g.off) + grp('done', 'g_done', g.done, 'g_done_p') : (can ? empty : '')) + how;
      S.wire(v);
      v.querySelectorAll('[data-rtog]').forEach((c) => c.addEventListener('change', () => { S.reminders.upsert({ id: c.dataset.rtog, on: c.checked }); S.toast(T(c.checked ? 'r_now_on' : 'r_now_off')); draw(); }));
      v.querySelectorAll('[data-rtime]').forEach((c) => c.addEventListener('change', () => { if (!/^\d{2}:\d{2}$/.test(c.value)) return; S.reminders.upsert({ id: c.dataset.rtime, time: c.value }); S.toast(TF('r_time_saved', { t: c.value })); draw(); }));
      v.querySelectorAll('[data-rdel]').forEach((b) => b.addEventListener('click', () => { ui.remConfirm = b.dataset.rdel; draw(); }));
      v.querySelectorAll('[data-rno]').forEach((b) => b.addEventListener('click', () => { ui.remConfirm = null; draw(); }));
      v.querySelectorAll('[data-ryes]').forEach((b) => b.addEventListener('click', () => { S.reminders.remove(b.dataset.ryes); ui.remConfirm = null; S.toast(T('r_deleted')); draw(); }));
      const add = v.querySelector('#tl-radd'); if (add) add.addEventListener('click', () => { const d0 = S.today(); ui.remForm = { title: '', start: tdISO(), time: '09:00', rep: 'once', wd: [d0.getDay()], n: 3 }; draw(); const ti = v.querySelector('#tl-rf-title'); if (ti) ti.focus(); });
      if (ui.remForm) wireRemForm(v, draw);
    };
    draw();
  }
  function remFormHtml(f) {
    const vis = (k) => (f.rep === k ? '' : ' hidden');
    const dom = okISO(f.start) ? S.fromISO(f.start).getDate() : S.today().getDate();
    return '<div class="card" id="tl-remform"><h3>' + esc(T('add_rem')) + '</h3>' +
      field('tl-rf-title', T('f_what'), '<input id="tl-rf-title" maxlength="80" value="' + esc(f.title) + '" placeholder="' + esc(T('f_what_ph')) + '">') +
      '<div class="grid2">' + field('tl-rf-start', T('f_start'), '<input type="date" id="tl-rf-start" value="' + esc(f.start) + '">') + field('tl-rf-time', T('f_time'), '<input type="time" id="tl-rf-time" value="' + esc(f.time) + '">') + '</div>' +
      '<div class="tl-field"><span class="tl-lab" id="tl-rf-rep">' + esc(T('f_repeat')) + '</span><div class="chips" role="group" aria-labelledby="tl-rf-rep">' + REPS.map((k) => '<button type="button" class="chip' + (f.rep === k ? ' on' : '') + '" data-rrep="' + k + '" aria-pressed="' + (f.rep === k) + '">' + esc(T('rep_' + k)) + '</button>').join('') + '</div></div>' +
      '<div class="tl-field" data-show="weekly"' + vis('weekly') + '><span class="tl-lab" id="tl-rf-wd">' + esc(T('f_days')) + '</span><div class="chips tl-wd" role="group" aria-labelledby="tl-rf-wd">' + WD_ORDER.map((k) => '<button type="button" class="chip' + (f.wd.indexOf(k) >= 0 ? ' on' : '') + '" data-rwd="' + k + '" aria-pressed="' + (f.wd.indexOf(k) >= 0) + '">' + esc(wdName(k)) + '</button>').join('') + '</div></div>' +
      '<div class="tl-field" data-show="everyn"' + vis('everyn') + '><label for="tl-rf-n">' + esc(T('f_n')) + '</label><input type="number" id="tl-rf-n" class="tl-num" min="2" max="90" inputmode="numeric" value="' + esc(f.n) + '"></div>' +
      '<p class="small tl-field" data-show="monthly" id="tl-rf-mnote"' + vis('monthly') + '>' + esc(TF('f_month_note', { n: dom })) + '</p>' +
      '<p class="small tl-err" id="tl-rf-err" role="alert"></p>' +
      '<div class="grid2"><button type="button" class="btn" id="tl-rf-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="tl-rf-save">' + esc(t('save')) + '</button></div></div>';
  }
  function wireRemForm(v, draw) {
    const f = ui.remForm; const box = v.querySelector('#tl-remform'); if (!box) return;
    const q = (s) => box.querySelector(s); const err = (k) => { q('#tl-rf-err').textContent = k ? T(k) : ''; };
    q('#tl-rf-title').addEventListener('input', (e) => { f.title = e.target.value; });
    q('#tl-rf-start').addEventListener('change', (e) => { f.start = e.target.value || f.start; const n = okISO(f.start) ? S.fromISO(f.start).getDate() : 1; q('#tl-rf-mnote').textContent = TF('f_month_note', { n: n }); });
    q('#tl-rf-time').addEventListener('change', (e) => { f.time = e.target.value || f.time; });
    q('#tl-rf-n').addEventListener('input', (e) => { f.n = e.target.value; });
    box.querySelectorAll('[data-rrep]').forEach((b) => b.addEventListener('click', () => {
      f.rep = b.dataset.rrep; box.querySelectorAll('[data-rrep]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      box.querySelectorAll('[data-show]').forEach((x) => { x.hidden = x.dataset.show !== f.rep; }); err('');
    }));
    box.querySelectorAll('[data-rwd]').forEach((b) => b.addEventListener('click', () => {
      const k = parseInt(b.dataset.rwd, 10); const i = f.wd.indexOf(k); if (i >= 0) f.wd.splice(i, 1); else f.wd.push(k);
      b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', i < 0);
    }));
    q('#tl-rf-cancel').addEventListener('click', () => { ui.remForm = null; draw(); });
    q('#tl-rf-save').addEventListener('click', () => {
      const title = String(f.title || '').trim();
      if (!title) { err('f_need_title'); q('#tl-rf-title').focus(); return; }
      if (!okISO(f.start)) { err('f_need_date'); return; }
      if (f.rep === 'weekly' && !f.wd.length) { err('f_need_day'); return; }
      const r = { id: uid('tools-c-'), mod: 'tools', kind: 'custom', title: { en: title, hi: title }, start: f.start, time: /^\d{2}:\d{2}$/.test(f.time) ? f.time : '09:00', rep: f.rep, on: true, every: null, weekdays: null, dates: null };
      if (f.rep === 'daily') r.every = 1;
      else if (f.rep === 'weekly') r.weekdays = f.wd.slice().sort();
      else if (f.rep === 'everyn') { r.every = S.clamp(parseInt(f.n, 10) || 2, 2, 90); r.n = r.every; }
      else if (f.rep === 'monthly') { r.dom = S.fromISO(f.start).getDate(); r.dates = monthDates(f.start, r.dom); }
      S.reminders.upsert(r); ui.remForm = null; S.toast(T('r_saved')); draw();
    });
  }

  /* =====================================================================
     Medicines
     ===================================================================== */
  function renderMeds(v) {
    U();
    const draw = () => {
      const can = S.canSave(); const d = can ? D() : null;
      const cur = curMeds(d); const past = (d ? d.meds : []).filter(isPast).sort((a, b) => String(b.stop || '').localeCompare(String(a.stop || '')));
      const card = (m) => {
        const rs = medRems(m.id); const anyOn = rs.some((r) => r.on !== false);
        const kv = [['m_for', val(m.why)], ['m_dose', val(m.dose)], ['m_by', val(m.by)], ['m_how', howText(m)], ['m_dates', datesText(m)]].filter((x) => x[1]);
        const ctl = ui.medConfirm === m.id
          ? '<div class="tl-confirm"><p class="small" style="color:var(--fg)">' + esc(T('med_del_q')) + '</p><div class="row"><button type="button" class="btn sm" data-mno="1">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" data-myes="' + esc(m.id) + '">' + esc(T('yes_del')) + '</button></div></div>'
          : '<div class="row"><button type="button" class="btn sm" data-medit="' + esc(m.id) + '">' + esc(t('edit')) + '</button><button type="button" class="btn sm ghost" data-mdel="' + esc(m.id) + '">' + esc(T('delete')) + '</button></div>';
        return '<div class="card tl-med"><div class="tl-rem-top"><span class="ico-sm">' + S.I.pill + '</span><div class="tl-grow"><h3>' + esc(val(m.name)) + '</h3></div>' +
          (isPast(m) ? '' : '<span class="pill ' + (anyOn ? 'ok' : 'muted') + '">' + esc(T(anyOn ? 'm_rem_on' : 'm_rem_none')) + '</span>') + '</div>' +
          '<dl class="tl-kv">' + kv.map((x) => '<dt>' + esc(T(x[0])) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>' + ctl + '</div>';
      };
      let body = '';
      if (!can) body = S.needDiary();
      else {
        body = (!storageOK() ? '<div class="flag">' + esc(T('store_err')) + '</div>' : '') +
          (ui.medForm ? medFormHtml(ui.medForm) : '<button type="button" class="btn primary block" id="tl-madd">' + S.I.pill.replace('<svg', '<svg style="width:20px;height:20px"') + esc(T('add_med')) + '</button>') +
          '<h2>' + esc(T('meds_cur')) + '</h2>' + (cur.length ? cur.map(card).join('') : '<div class="card"><p class="small">' + esc(T('meds_none')) + '</p></div>') +
          (past.length ? '<details class="tl-acc"><summary>' + esc(TF('meds_past', { n: past.length })) + '</summary><div class="stack" style="margin-top:10px">' + past.map(card).join('') + '</div></details>' : '');
      }
      v.innerHTML = S.backRow(T('meds_h'), 'care', false) + '<p class="small">' + esc(T('meds_p')) + '</p>' +
        '<div class="card warn"><h3>' + esc(T('meds_rule_h')) + '</h3><ul class="tl-ul"><li>' + esc(T('meds_rule1')) + '</li><li>' + esc(T('meds_rule2')) + '</li></ul><div class="flag urgent">' + esc(T('meds_allergy')) + '</div></div>' +
        body +
        '<div class="card soft"><h3>' + esc(T('ja_h')) + '</h3><p class="small">' + esc(T('ja_p')) + '</p><p class="small">' + esc(T('ja_find')) + '</p><p class="small">' + esc(T('ja_switch')) + '</p><p class="small">' + esc(T('ja_free')) + '</p><a class="btn sm tl-link" href="' + JA_URL + '" target="_blank" rel="noopener">' + esc(T('ja_link')) + '</a></div>' +
        '<div class="card dark"><h3>' + esc(T('meds_qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(T('meds_qura_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(T('meds_topic')) + '">' + esc(t('ask_qura')) + '</button></div>';
      S.wire(v);
      const add = v.querySelector('#tl-madd'); if (add) add.addEventListener('click', () => { ui.medForm = blankMed(); draw(); const n = v.querySelector('#tl-mf-name'); if (n) { n.scrollIntoView({ block: 'center' }); n.focus(); } });
      v.querySelectorAll('[data-medit]').forEach((b) => b.addEventListener('click', () => {
        const m = D().meds.find((x) => x.id === b.dataset.medit); if (!m) return;
        ui.medForm = { id: m.id, name: val(m.name), why: val(m.why), dose: val(m.dose), by: val(m.by), start: m.start || '', stop: m.stop || '', freq: m.freq || 'daily', wd: m.wd == null ? S.today().getDay() : m.wd, times: (m.times && m.times.length ? m.times : ['09:00']).slice(), remind: medRems(m.id).length > 0 || (!!m.remind && !isPast(m)) };
        draw(); const box = v.querySelector('#tl-medform'); if (box) box.scrollIntoView({ block: 'start' });
      }));
      v.querySelectorAll('[data-mdel]').forEach((b) => b.addEventListener('click', () => { ui.medConfirm = b.dataset.mdel; draw(); }));
      v.querySelectorAll('[data-mno]').forEach((b) => b.addEventListener('click', () => { ui.medConfirm = null; draw(); }));
      v.querySelectorAll('[data-myes]').forEach((b) => b.addEventListener('click', () => { const d2 = D(); dropMedRems(b.dataset.myes); d2.meds = d2.meds.filter((x) => x.id !== b.dataset.myes); ui.medConfirm = null; S.save(); S.toast(T('med_deleted')); draw(); }));
      if (ui.medForm) wireMedForm(v, draw);
    };
    draw();
  }
  const blankMed = () => ({ id: null, name: '', why: '', dose: '', by: '', start: tdISO(), stop: '', freq: 'daily', wd: S.today().getDay(), times: ['09:00'], remind: true });
  function timesHtml(f) {
    return f.times.map((tm, i) => '<div class="tl-trow"><input type="time" class="tl-time" id="tl-mf-t' + i + '" data-mtime="' + i + '" value="' + esc(tm) + '" aria-label="' + esc(T('f_times')) + ' ' + (i + 1) + '">' +
      (f.times.length > 1 ? '<button type="button" class="tl-x" data-mtrm="' + i + '" aria-label="' + esc(T('rm_time')) + '">' + X_SVG + '</button>' : '') + '</div>').join('') +
      (f.times.length < 4 ? '<button type="button" class="btn sm ghost tl-self" id="tl-mf-tadd">+ ' + esc(T('add_time')) + '</button>' : '');
  }
  function medFormHtml(f) {
    const vis = (k) => (f.freq === k ? '' : ' hidden');
    return '<div class="card" id="tl-medform"><h3>' + esc(T(f.id ? 'edit_med' : 'add_med')) + '</h3>' +
      field('tl-mf-name', T('f_name'), '<input id="tl-mf-name" maxlength="80" value="' + esc(f.name) + '" placeholder="' + esc(T('f_name_ph')) + '">') +
      field('tl-mf-why', T('f_why'), '<input id="tl-mf-why" maxlength="120" value="' + esc(f.why) + '" placeholder="' + esc(T('f_why_ph')) + '">') +
      field('tl-mf-dose', T('f_dose'), '<textarea id="tl-mf-dose" maxlength="240" rows="2" placeholder="' + esc(T('f_dose_ph')) + '">' + esc(f.dose) + '</textarea>') +
      field('tl-mf-by', T('f_by'), '<input id="tl-mf-by" maxlength="80" value="' + esc(f.by) + '" placeholder="' + esc(T('f_by_ph')) + '">') +
      '<div class="grid2">' + field('tl-mf-start', T('f_mstart'), '<input type="date" id="tl-mf-start" value="' + esc(f.start) + '">') + field('tl-mf-stop', T('f_mstop'), '<input type="date" id="tl-mf-stop" value="' + esc(f.stop) + '">') + '</div>' +
      '<div class="tl-field"><span class="tl-lab" id="tl-mf-often">' + esc(T('f_often')) + '</span><div class="chips" role="group" aria-labelledby="tl-mf-often">' + ['daily', 'weekly', 'other'].map((k) => '<button type="button" class="chip' + (f.freq === k ? ' on' : '') + '" data-mfreq="' + k + '" aria-pressed="' + (f.freq === k) + '">' + esc(T('o_' + k)) + '</button>').join('') + '</div></div>' +
      '<div class="tl-field" data-show="weekly"' + vis('weekly') + '><span class="tl-lab" id="tl-mf-wdl">' + esc(T('f_wday')) + '</span><div class="chips tl-wd" role="group" aria-labelledby="tl-mf-wdl">' + WD_ORDER.map((k) => '<button type="button" class="chip' + (f.wd === k ? ' on' : '') + '" data-mwd="' + k + '" aria-pressed="' + (f.wd === k) + '">' + esc(wdName(k)) + '</button>').join('') + '</div></div>' +
      '<p class="small tl-field" data-show="other"' + vis('other') + '>' + esc(T('o_other_note')) + '</p>' +
      '<div class="tl-field" data-hide="other"' + (f.freq === 'other' ? ' hidden' : '') + '><span class="tl-lab">' + esc(T('f_times')) + '</span><div class="tl-times" id="tl-mf-times">' + timesHtml(f) + '</div>' +
      '<label class="tl-check"><input type="checkbox" id="tl-mf-remind"' + (f.remind ? ' checked' : '') + '> ' + esc(T('f_remind')) + '</label><p class="small">' + esc(T('f_remind_p')) + '</p></div>' +
      '<p class="small tl-err" id="tl-mf-err" role="alert"></p>' +
      '<div class="grid2"><button type="button" class="btn" id="tl-mf-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="tl-mf-save">' + esc(t('save')) + '</button></div></div>';
  }
  function wireMedForm(v, draw) {
    const f = ui.medForm; const box = v.querySelector('#tl-medform'); if (!box) return;
    const q = (s) => box.querySelector(s); const err = (k) => { q('#tl-mf-err').textContent = k ? T(k) : ''; };
    [['#tl-mf-name', 'name'], ['#tl-mf-why', 'why'], ['#tl-mf-dose', 'dose'], ['#tl-mf-by', 'by']].forEach((x) => q(x[0]).addEventListener('input', (e) => { f[x[1]] = e.target.value; }));
    q('#tl-mf-start').addEventListener('change', (e) => { f.start = e.target.value; });
    q('#tl-mf-stop').addEventListener('change', (e) => { f.stop = e.target.value; });
    q('#tl-mf-remind').addEventListener('change', (e) => { f.remind = e.target.checked; });
    box.querySelectorAll('[data-mfreq]').forEach((b) => b.addEventListener('click', () => {
      f.freq = b.dataset.mfreq; box.querySelectorAll('[data-mfreq]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      box.querySelectorAll('[data-show]').forEach((x) => { x.hidden = x.dataset.show !== f.freq; }); box.querySelectorAll('[data-hide]').forEach((x) => { x.hidden = x.dataset.hide === f.freq; });
    }));
    box.querySelectorAll('[data-mwd]').forEach((b) => b.addEventListener('click', () => { f.wd = parseInt(b.dataset.mwd, 10); box.querySelectorAll('[data-mwd]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }));
    const wireTimes = () => {
      const tb = q('#tl-mf-times');
      tb.querySelectorAll('[data-mtime]').forEach((c) => c.addEventListener('change', () => { f.times[parseInt(c.dataset.mtime, 10)] = c.value; }));
      tb.querySelectorAll('[data-mtrm]').forEach((b) => b.addEventListener('click', () => { f.times.splice(parseInt(b.dataset.mtrm, 10), 1); tb.innerHTML = timesHtml(f); wireTimes(); }));
      const ad = tb.querySelector('#tl-mf-tadd'); if (ad) ad.addEventListener('click', () => { f.times.push(f.times.length ? '21:00' : '09:00'); tb.innerHTML = timesHtml(f); wireTimes(); const last = tb.querySelector('#tl-mf-t' + (f.times.length - 1)); if (last) last.focus(); });
    };
    wireTimes();
    q('#tl-mf-cancel').addEventListener('click', () => { ui.medForm = null; draw(); });
    q('#tl-mf-save').addEventListener('click', () => {
      const name = String(f.name || '').trim();
      if (!name) { err('f_need_name'); q('#tl-mf-name').focus(); return; }
      if (okISO(f.start) && okISO(f.stop) && f.stop < f.start) { err('f_bad_stop'); return; }
      const d = D(); const times = f.times.filter((x) => /^\d{2}:\d{2}$/.test(x));
      const m = { id: f.id || uid('m'), name: name, why: String(f.why || '').trim(), dose: String(f.dose || '').trim(), by: String(f.by || '').trim(), start: okISO(f.start) ? f.start : '', stop: okISO(f.stop) ? f.stop : '', freq: f.freq, wd: f.wd, times: times.length ? times : ['09:00'], remind: !!f.remind };
      const i = d.meds.findIndex((x) => x.id === m.id); if (i >= 0) d.meds[i] = m; else d.meds.push(m);
      S.save(); syncMedRems(m); ui.medForm = null; S.toast(T('med_saved')); draw();
    });
  }

  /* =====================================================================
     Reports vault + ABHA
     ===================================================================== */
  const photoUse = (d) => (d ? d.reports : []).reduce((a, r) => a + (r.photo ? r.photo.length : 0), 0);
  function shrink(file, cb) {
    let url = null; try { url = URL.createObjectURL(file); } catch (e) { cb(null); return; }
    const img = new Image(); const done = (x) => { try { URL.revokeObjectURL(url); } catch (e) { } cb(x); };
    img.onload = () => {
      try {
        const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height; if (!w0 || !h0) { done(null); return; }
        const sc = Math.min(1, MAXPX / Math.max(w0, h0)); const w = Math.max(1, Math.round(w0 * sc)), h = Math.max(1, Math.round(h0 * sc));
        const c = document.createElement('canvas'); c.width = w; c.height = h; const cx = c.getContext('2d');
        cx.fillStyle = '#FFFFFF'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
        const du = c.toDataURL('image/jpeg', JPEG_Q); done(du && du.indexOf('data:image/jpeg') === 0 ? du : null);
      } catch (e) { done(null); }
    };
    img.onerror = () => done(null);
    img.src = url;
  }
  function maskAbha(a) {
    const s = String(a || ''); const at = s.indexOf('@');
    if (at > 0) { const u = s.slice(0, at); return u.slice(0, Math.min(2, u.length)) + '•'.repeat(Math.max(3, u.length - 2)) + s.slice(at); }
    return s.slice(0, 2) + '••••';
  }
  function renderReports(v) {
    U();
    const draw = () => {
      const can = S.canSave(); const d = can ? D() : null;
      const used = photoUse(d); const pct = Math.min(100, Math.round((used / PHOTO_CAP) * 100)); const nPh = d ? d.reports.filter((r) => r.photo).length : 0;
      const list = (d ? d.reports : []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      const shown = ui.repFilter === 'all' ? list : list.filter((r) => r.type === ui.repFilter);
      const item = (r) => '<button type="button" class="item tl-rep" data-ropen="' + esc(r.id) + '"><span class="tl-thumb">' + (r.photo ? '<img src="' + esc(r.photo) + '" alt="">' : S.icon(TYPE_ICON[r.type] || 'file')) + '</span><span class="body"><strong>' + esc(val(r.title)) + '</strong><span>' + esc(T('ty_' + (TYPES.indexOf(r.type) >= 0 ? r.type : 'other'))) + (r.date ? ' · ' + esc(fmtLong(r.date)) : '') + (r.photo ? '' : ' · ' + esc(T('no_photo'))) + '</span></span><span style="color:var(--accent);width:18px;flex-shrink:0">' + S.I.chev + '</span></button>';
      let vault = '';
      if (!can) vault = S.needDiary();
      else {
        const counts = {}; list.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
        const filt = list.length > 1 ? '<div class="chips" role="group">' + ['all'].concat(TYPES.filter((k) => counts[k])).map((k) => '<button type="button" class="chip' + (ui.repFilter === k ? ' on' : '') + '" data-rf="' + k + '" aria-pressed="' + (ui.repFilter === k) + '">' + esc(T('ty_' + k)) + ' <span class="num tl-cnt">' + (k === 'all' ? list.length : counts[k]) + '</span></button>').join('') + '</div>' : '';
        const space = '<div class="card soft tl-space"><div class="row spread"><span class="tl-lab">' + esc(T('space_h')) + '</span><span class="small num">' + esc(TF('space_used', { u: (used / 1e6).toFixed(1), c: (PHOTO_CAP / 1e6).toFixed(1), n: nPh })) + '</span></div><div class="tl-bar' + (pct >= 100 ? ' full' : (pct >= 80 ? ' warn' : '')) + '"><i style="width:' + Math.max(pct, used ? 2 : 0) + '%"></i></div>' + (pct >= 100 ? '<p class="small" style="color:var(--fg)">' + esc(T('space_full')) + '</p>' : (pct >= 80 ? '<p class="small" style="color:var(--fg)">' + esc(T('space_warn')) + '</p>' : '')) + '</div>';
        vault = (!storageOK() ? '<div class="flag">' + esc(T('store_err')) + '</div>' : '') +
          (ui.repForm ? repFormHtml(ui.repForm, used) : '<button type="button" class="btn primary block" id="tl-padd">' + S.I.file.replace('<svg', '<svg style="width:20px;height:20px"') + esc(T('add_rep')) + '</button>') +
          (pct >= 80 ? space : '') + filt + (shown.length ? '<div class="list">' + shown.map(item).join('') + '</div>' : '<div class="card"><p class="small">' + esc(list.length ? T('rep_none_f') : T('rep_none')) + '</p></div>') + (nPh && pct < 80 ? space : '');
      }
      v.innerHTML = S.backRow(T('reps_h'), 'care', false) + '<p class="small">' + esc(T('reps_p')) + '</p>' + vault +
        '<p class="note">' + esc(T('reps_local')) + '</p>' + '<p class="note">' + esc(T('rep_free')) + '</p>' + abhaHtml(can, d);
      S.wire(v);
      v.querySelectorAll('[data-rf]').forEach((b) => b.addEventListener('click', () => { ui.repFilter = b.dataset.rf; draw(); }));
      v.querySelectorAll('[data-ropen]').forEach((b) => b.addEventListener('click', () => openReport(b.dataset.ropen, draw)));
      const add = v.querySelector('#tl-padd'); if (add) add.addEventListener('click', () => { ui.repForm = { type: 'blood', date: tdISO(), title: '', notes: '', photo: null, busy: false, msg: '' }; draw(); const ti = v.querySelector('#tl-pf-title'); if (ti) ti.focus(); });
      if (ui.repForm) wireRepForm(v, draw);
      wireAbha(v, draw);
    };
    draw();
  }
  function repPhotoHtml(f, used) {
    const full = used >= PHOTO_CAP;
    if (f.busy) return '<p class="small">' + esc(T('ph_working')) + '</p>';
    if (f.photo) return '<div class="tl-preview"><img src="' + esc(f.photo) + '" alt="' + esc(T('photo_alt')) + '"><div class="tl-grow"><span class="small" style="color:var(--ok);font-weight:600">' + esc(T('ph_ready')) + ' · ' + Math.max(1, Math.round(f.photo.length / 1000)) + ' KB</span><button type="button" class="btn sm ghost tl-self" id="tl-pf-phrm">' + esc(T('ph_remove')) + '</button></div></div>';
    return (full ? '<p class="small" style="color:var(--fg)">' + esc(T('space_full')) + '</p>' : '<input type="file" id="tl-pf-photo" class="tl-file" accept="image/*"><p class="small">' + esc(T('f_photo_p')) + '</p>') + (f.msg ? '<p class="small tl-err">' + esc(T(f.msg)) + '</p>' : '');
  }
  function repFormHtml(f, used) {
    return '<div class="card" id="tl-repform"><h3>' + esc(T('add_rep')) + '</h3>' +
      '<div class="tl-field"><span class="tl-lab" id="tl-pf-tl">' + esc(T('f_type')) + '</span><div class="chips" role="group" aria-labelledby="tl-pf-tl">' + TYPES.map((k) => '<button type="button" class="chip' + (f.type === k ? ' on' : '') + '" data-ptype="' + k + '" aria-pressed="' + (f.type === k) + '">' + esc(T('ty_' + k)) + '</button>').join('') + '</div></div>' +
      field('tl-pf-title', T('f_rtitle'), '<input id="tl-pf-title" maxlength="80" value="' + esc(f.title) + '" placeholder="' + esc(T('f_rtitle_ph')) + '">') +
      field('tl-pf-date', T('f_rdate'), '<input type="date" id="tl-pf-date" value="' + esc(f.date) + '" max="' + tdISO() + '">') +
      field('tl-pf-notes', T('f_notes'), '<textarea id="tl-pf-notes" maxlength="400" rows="2" placeholder="' + esc(T('f_notes_ph')) + '">' + esc(f.notes) + '</textarea>') +
      '<div class="tl-field"><label for="tl-pf-photo">' + esc(T('f_photo')) + '</label><div id="tl-pf-ph">' + repPhotoHtml(f, used) + '</div></div>' +
      '<p class="small tl-err" id="tl-pf-err" role="alert"></p>' +
      '<div class="grid2"><button type="button" class="btn" id="tl-pf-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="tl-pf-save">' + esc(t('save')) + '</button></div></div>';
  }
  function wireRepForm(v, draw) {
    const f = ui.repForm; const box = v.querySelector('#tl-repform'); if (!box) return;
    const q = (s) => box.querySelector(s); const err = (k) => { q('#tl-pf-err').textContent = k ? T(k) : ''; };
    box.querySelectorAll('[data-ptype]').forEach((b) => b.addEventListener('click', () => { f.type = b.dataset.ptype; box.querySelectorAll('[data-ptype]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }));
    q('#tl-pf-title').addEventListener('input', (e) => { f.title = e.target.value; });
    q('#tl-pf-date').addEventListener('change', (e) => { f.date = e.target.value; });
    q('#tl-pf-notes').addEventListener('input', (e) => { f.notes = e.target.value; });
    const drawPh = () => { const ph = q('#tl-pf-ph'); if (!ph) return; ph.innerHTML = repPhotoHtml(f, photoUse(D())); wirePh(); };
    const wirePh = () => {
      const inp = q('#tl-pf-photo');
      if (inp) inp.addEventListener('change', () => {
        const file = inp.files && inp.files[0]; if (!file) return;
        f.busy = true; f.msg = ''; drawPh();
        shrink(file, (src) => {
          f.busy = false;
          if (!src) f.msg = 'ph_bad';
          else if (photoUse(D()) + src.length > PHOTO_CAP) f.msg = 'ph_full';
          else if (!roomFor(src)) f.msg = 'ph_store';
          else f.photo = src;
          if (ui.repForm === f && document.body.contains(box)) drawPh();
        });
      });
      const rm = q('#tl-pf-phrm'); if (rm) rm.addEventListener('click', () => { f.photo = null; f.msg = ''; drawPh(); });
    };
    wirePh();
    q('#tl-pf-cancel').addEventListener('click', () => { ui.repForm = null; draw(); });
    q('#tl-pf-save').addEventListener('click', () => {
      const title = String(f.title || '').trim();
      if (!title) { err('rep_need_title'); q('#tl-pf-title').focus(); return; }
      if (!okISO(f.date)) { err('rep_need_date'); return; }
      if (f.busy) return;
      const d = D(); const rep = { id: uid('r'), type: f.type, date: f.date, title: title, notes: String(f.notes || '').trim(), photo: f.photo || null, added: tdISO() };
      d.reports.push(rep); S.save();
      let msg = 'rep_saved';
      if (rep.photo && persisted(rep.id) === false) { rep.photo = null; S.save(); msg = 'ph_lost'; }
      ui.repForm = null; S.toast(T(msg)); draw();
    });
  }
  function openReport(id, redraw) {
    const r = D().reports.find((x) => x.id === id); if (!r) return;
    const body = () => '<h2 class="tl-wrap">' + esc(val(r.title)) + '</h2><p class="small">' + esc(T('ty_' + (TYPES.indexOf(r.type) >= 0 ? r.type : 'other'))) + (r.date ? ' · ' + esc(fmtLong(r.date)) : '') + '</p>' +
      (r.photo ? '<img class="tl-full" src="' + esc(r.photo) + '" alt="' + esc(T('photo_alt')) + '">' : '<div class="card soft"><p class="small">' + esc(T('no_photo')) + '</p></div>') +
      (val(r.notes) ? '<p class="tl-wrap" style="color:var(--fg)">' + esc(val(r.notes)) + '</p>' : '') +
      '<div id="tl-rv-act"><div class="grid2"><button type="button" class="btn" id="tl-rv-close">' + esc(T('close')) + '</button><button type="button" class="btn danger" id="tl-rv-del">' + esc(T('delete')) + '</button></div></div>';
    S.sheet(body(), (sh) => {
      const act = sh.querySelector('#tl-rv-act');
      sh.querySelector('#tl-rv-close').addEventListener('click', S.closeSheet);
      sh.querySelector('#tl-rv-del').addEventListener('click', () => {
        act.innerHTML = '<div class="tl-confirm"><p class="small" style="color:var(--fg)">' + esc(T('rep_del_q')) + '</p><div class="grid2"><button type="button" class="btn sm" id="tl-rv-no">' + esc(t('cancel')) + '</button><button type="button" class="btn sm danger" id="tl-rv-yes">' + esc(T('yes_del')) + '</button></div></div>';
        act.querySelector('#tl-rv-no').addEventListener('click', S.closeSheet);
        act.querySelector('#tl-rv-yes').addEventListener('click', () => { const d = D(); d.reports = d.reports.filter((x) => x.id !== id); S.save(); S.closeSheet(); S.toast(T('rep_deleted')); redraw(); });
      });
    });
  }
  function abhaHtml(can, d) {
    const a = d && d.abha ? String(d.abha) : '';
    let mine = '';
    if (can) {
      if (a && !ui.abhaEdit) mine = '<div class="card soft" style="gap:8px"><span class="tl-lab">' + esc(T('abha_mine')) + '</span><div class="row spread wrap"><span class="tl-mask" id="tl-abha-val">' + esc(ui.abhaShow ? a : maskAbha(a)) + '</span><div class="row"><button type="button" class="btn sm" id="tl-abha-eye">' + esc(T(ui.abhaShow ? 'abha_hide' : 'abha_show')) + '</button><button type="button" class="btn sm ghost" id="tl-abha-edit">' + esc(T('abha_change')) + '</button></div></div><p class="small">' + esc(T('abha_mine_p')) + '</p></div>';
      else mine = '<div class="card soft" style="gap:8px">' + field('tl-abha-in', T('abha_mine'), '<div class="row"><input id="tl-abha-in" maxlength="64" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="name@abdm" value="' + esc(a) + '"><button type="button" class="btn sm tl-nowrap" id="tl-abha-save">' + esc(t('save')) + '</button></div>') +
        '<p class="small">' + esc(T('abha_mine_p')) + '</p>' + (ui.abhaErr ? '<p class="small tl-err" role="alert">' + esc(T(ui.abhaErr)) + '</p>' : '') + (a ? '<div class="row"><button type="button" class="btn sm ghost" id="tl-abha-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn sm ghost" id="tl-abha-rm">' + esc(T('abha_remove')) + '</button></div>' : '') + '</div>';
    }
    return '<div class="card" id="tl-abha"><div class="tl-rem-top"><span class="ico-sm">' + S.I.lock + '</span><div class="tl-grow"><h2>' + esc(T('abha_h')) + '</h2></div></div>' +
      '<p class="small">' + esc(T('abha_p1')) + '</p><p class="small">' + esc(T('abha_p2')) + '</p>' +
      '<h3>' + esc(T('abha_how')) + '</h3><ol class="steps"><li class="small" style="color:var(--fg)">' + esc(T('abha_s1')) + '</li><li class="small" style="color:var(--fg)">' + esc(T('abha_s2')) + '</li><li class="small" style="color:var(--fg)">' + esc(T('abha_s3')) + '</li></ol>' +
      '<div class="flag">' + esc(T('abha_otp')) + '</div>' +
      '<a class="btn sm tl-link" href="' + ABHA_URL + '" target="_blank" rel="noopener">' + esc(T('abha_link')) + '</a>' + mine +
      '<p class="footnote" style="text-align:left">' + esc(T('abha_live')) + '</p></div>';
  }
  function wireAbha(v, draw) {
    const $ = (s) => v.querySelector(s);
    const eye = $('#tl-abha-eye'); if (eye) eye.addEventListener('click', () => { ui.abhaShow = !ui.abhaShow; draw(); });
    const ed = $('#tl-abha-edit'); if (ed) ed.addEventListener('click', () => { ui.abhaEdit = true; ui.abhaErr = ''; draw(); const i = $('#tl-abha-in'); if (i) i.focus(); });
    const cc = $('#tl-abha-cancel'); if (cc) cc.addEventListener('click', () => { ui.abhaEdit = false; ui.abhaErr = ''; draw(); });
    const rm = $('#tl-abha-rm'); if (rm) rm.addEventListener('click', () => { const d = D(); delete d.abha; S.save(); ui.abhaEdit = false; ui.abhaErr = ''; ui.abhaShow = false; S.toast(T('abha_removed')); draw(); });
    const sv = $('#tl-abha-save'); if (sv) sv.addEventListener('click', () => {
      const raw = String(($('#tl-abha-in') || {}).value || '').trim().replace(/\s+/g, '');
      if (!raw) { ui.abhaErr = 'abha_bad'; draw(); return; }
      if (/^[\d-]{10,}$/.test(raw)) { ui.abhaErr = 'abha_digits'; draw(); return; }
      if (!/^[^@]{2,}@[A-Za-z0-9.-]+$/.test(raw)) { ui.abhaErr = 'abha_bad'; draw(); return; }
      const d = D(); d.abha = raw.toLowerCase(); S.save(); ui.abhaEdit = false; ui.abhaErr = ''; ui.abhaShow = false; S.toast(T('abha_saved')); draw();
    });
  }

  /* =====================================================================
     Doctor summary
     ===================================================================== */
  function sections() {
    const out = []; const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1); const push = (s) => { if (s && s.title && Array.isArray(s.lines) && s.lines.length) out.push({ title: cap(String(s.title)), lines: s.lines.map((x) => String(x)) }); };
    try { (S.coreSummary() || []).forEach(push); } catch (e) { }
    try { (S.summaries() || []).filter((m) => m.mod !== 'tools').forEach((m) => (m.sections || []).forEach(push)); } catch (e) { }
    const d = peek(); const cur = curMeds(d);
    out.push({ title: T('sum_meds'), lines: cur.length ? cur.map(medLine) : [T('sum_meds_none')] });
    const up = S.reminders.upcoming(14).sort((a, b) => (a.date - b.date) || String(a.r.time || '').localeCompare(String(b.r.time || ''))); if (up.length) { const L = up.slice(0, 8).map((x) => fmtDay(x.date) + (x.r.time ? ' ' + x.r.time : '') + ' · ' + remTitle(x.r)); if (up.length > 8) L.push(TF('sum_more', { n: up.length - 8 })); out.push({ title: T('sum_rem'), lines: L }); }
    const reps = (d && Array.isArray(d.reports) ? d.reports : []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (reps.length) { const L = reps.slice(0, 6).map((r) => val(r.title) + ' (' + T('ty_' + (TYPES.indexOf(r.type) >= 0 ? r.type : 'other')) + (r.date ? ', ' + fmtLong(r.date) : '') + ')'); if (reps.length > 6) L.push(TF('sum_more', { n: reps.length - 6 })); out.push({ title: T('sum_reps'), lines: L }); }
    return out;
  }
  function headMeta() { const age = S.cycle.ageYears(); return fmtLong(tdISO()) + (age != null ? ' · ' + TF('sum_age', { n: age }) : ''); }
  function headLine() { return T('sum_title') + ' · ' + headMeta(); }
  const headHtml = (cls) => '<div class="tl-head"><h2>' + esc(T('sum_title')) + '</h2><p class="' + cls + '">' + esc(headMeta()) + '</p></div><p class="' + (cls === 'tl-meta-big' ? 'tl-made' : 'small') + '">' + esc(TF('sum_made', { d: fmtLong(tdISO()) })) + '</p>';
  function sumBody(secs) {
    return secs.map((s) => '<div class="tl-sec"><h3>' + esc(s.title) + '</h3><ul>' + s.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>').join('');
  }
  function sumText(secs) {
    const L = [headLine(), TF('sum_made', { d: fmtLong(tdISO()) })];
    secs.forEach((s) => { L.push(''); L.push(s.title.toUpperCase()); s.lines.forEach((l) => L.push('- ' + l)); });
    return L.join('\n');
  }
  function closeDoc(v) { ui.docView = false; const el = v.querySelector('.tl-doc'); if (el) el.remove(); if (escH) { document.removeEventListener('keydown', escH); escH = null; } const b = v.querySelector('#tl-show'); if (b) b.focus(); }
  function openDoc(v, secs) {
    ui.docView = true; const old = v.querySelector('.tl-doc'); if (old) old.remove();
    v.insertAdjacentHTML('beforeend', '<div class="tl-doc" role="dialog" aria-modal="true" aria-label="' + esc(T('doc_for')) + '"><div class="tl-doc-in"><div class="tl-doc-bar"><span class="eyebrow">' + esc(T('doc_for')) + '</span><button type="button" class="btn sm" id="tl-doc-x">' + esc(T('close')) + '</button></div>' +
      headHtml('tl-meta-big') + sumBody(secs) +
      '<button type="button" class="btn block" id="tl-doc-x2">' + esc(T('close')) + '</button></div></div>');
    const ov = v.querySelector('.tl-doc');
    ov.querySelector('#tl-doc-x').addEventListener('click', () => closeDoc(v)); ov.querySelector('#tl-doc-x2').addEventListener('click', () => closeDoc(v));
    if (escH) document.removeEventListener('keydown', escH);
    escH = (e) => { if (e.key === 'Escape') closeDoc(v); }; document.addEventListener('keydown', escH);
    ov.querySelector('#tl-doc-x').focus();
  }
  function renderSummary(v) {
    U();
    const draw = () => {
      const can = S.canSave();
      if (!can) {
        v.innerHTML = S.backRow(T('sum_h'), 'care', false) + '<p class="small">' + esc(T('sum_p')) + '</p>' + S.needDiary() + '<p class="footnote">' + esc(T('sum_urgent')) + '</p>';
        S.wire(v); return;
      }
      const secs = sections(); const c4 = S.state.consent && S.state.consent.c4;
      const thin = !S.cycle.starts().length && !curMeds(peek()).length;
      const share = c4
        ? '<div class="card ok"><h3 style="color:var(--ok)">' + esc(T('share_h')) + '</h3><p class="small" style="color:var(--ok)">' + esc(TF('shared_on', { d: fmtLong(c4) })) + '</p><button type="button" class="btn sm tl-self" data-go="me">' + esc(t('me')) + '</button></div>'
        : '<div class="card"><h3>' + esc(T('share_h')) + '</h3><p class="small">' + esc(T('share_what')) + '</p>' +
          (ui.shareAsk
            ? '<div class="tl-confirm"><p class="small" style="color:var(--fg);font-weight:600">' + esc(T('share_q')) + '</p><div class="grid2"><button type="button" class="btn sm" id="tl-sh-no">' + esc(t('consent_no')) + '</button><button type="button" class="btn sm primary" id="tl-sh-yes">' + esc(T('share_yes')) + '</button></div></div>'
            : '<button type="button" class="btn secondary" id="tl-sh">' + esc(T('share_h')) + '</button>') + '</div>';
      v.innerHTML = S.backRow(T('sum_h'), 'care', false) + '<p class="small">' + esc(T('sum_p')) + '</p>' +
        '<div class="grid2"><button type="button" class="btn primary" id="tl-show">' + esc(T('show_doc')) + '</button><button type="button" class="btn" id="tl-copy">' + esc(T('copy_txt')) + '</button></div>' +
        '<div id="tl-copy-out"></div>' +
        '<div class="card tl-sum"><div class="stack" style="gap:4px">' + headHtml('tl-meta') + '</div>' + sumBody(secs) + '</div>' +
        (thin ? '<div class="card soft"><p class="small">' + esc(T('sum_empty')) + '</p><div class="row wrap"><button type="button" class="btn sm" data-go="diary">' + esc(t('diary')) + '</button><button type="button" class="btn sm" data-go="' + R.meds + '">' + esc(T('meds_short')) + '</button></div></div>' : '') +
        '<p class="note">' + esc(T('doc_lang')) + '</p>' + share + '<p class="footnote">' + esc(T('sum_urgent')) + '</p>';
      S.wire(v);
      v.querySelector('#tl-show').addEventListener('click', () => openDoc(v, sections()));
      v.querySelector('#tl-copy').addEventListener('click', () => {
        const text = sumText(sections()); const out = v.querySelector('#tl-copy-out');
        const fallback = () => {
          out.innerHTML = '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('copy_fallback')) + '</p><textarea readonly class="tl-copy" aria-label="' + esc(T('copy_txt')) + '">' + esc(text) + '</textarea><button type="button" class="btn sm tl-self" id="tl-copy-x">' + esc(T('close')) + '</button></div>';
          const ta = out.querySelector('textarea'); let ok = false;
          try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); ok = !!(document.execCommand && document.execCommand('copy')); } catch (e) { ok = false; }
          if (ok) { out.innerHTML = ''; S.toast(T('copied_ok')); v.querySelector('#tl-copy').focus(); return; }
          out.querySelector('#tl-copy-x').addEventListener('click', () => { out.innerHTML = ''; });
        };
        try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { out.innerHTML = ''; S.toast(T('copied_ok')); }, fallback); else fallback(); } catch (e) { fallback(); }
      });
      const sh = v.querySelector('#tl-sh'); if (sh) sh.addEventListener('click', () => { ui.shareAsk = true; draw(); const y = v.querySelector('#tl-sh-yes'); if (y) y.focus(); });
      const no = v.querySelector('#tl-sh-no'); if (no) no.addEventListener('click', () => { ui.shareAsk = false; draw(); });
      const yes = v.querySelector('#tl-sh-yes'); if (yes) yes.addEventListener('click', () => { if (!S.state.consent) S.state.consent = {}; if (!S.state.consent.c4) S.state.consent.c4 = tdISO(); S.save(); ui.shareAsk = false; S.toast(T('shared_toast')); draw(); });
      if (ui.docView) openDoc(v, secs);
    };
    draw();
  }

  /* ---------- hooks ---------- */
  function summary() { const cur = curMeds(peek()); return cur.length ? [{ title: T('sum_meds'), lines: cur.map(medLine) }] : []; }

  function sample(id) {
    const td = S.today(); const ago = (n) => iso(S.addDays(td, -n)); const ahead = (n) => iso(S.addDays(td, n));
    const sit = S.state.situation || {};
    const med = (o) => Object.assign({ freq: 'daily', wd: 0, times: ['09:00'], remind: true, stop: '' }, o);
    const rep = (o) => Object.assign({ photo: null, added: o.date }, o);
    let meds = [], reps = [], rems = [];
    if (id === 'asha') {
      meds = [
        med({ id: 'smp-a1', name: { en: 'Vitamin D3 sachet', hi: 'विटामिन D3 sachet' }, why: { en: 'Low vitamin D on my blood test', hi: 'blood test में vitamin D कम आया' }, dose: { en: '1 sachet in a glass of milk, once a week', hi: 'हफ़्ते में एक बार, 1 sachet एक गिलास दूध में' }, by: { en: 'Doctor at the PHC', hi: 'PHC के डॉक्टर' }, start: ago(28), stop: ahead(28), freq: 'weekly', wd: 0, times: ['09:00'] }),
        med({ id: 'smp-a2', name: { en: 'Iron and folic acid tablet', hi: 'आयरन और फ़ोलिक एसिड की गोली' }, why: { en: 'Low Hb last winter', hi: 'पिछली सर्दी में Hb कम था' }, dose: { en: '1 tablet a day after a meal', hi: 'रोज़ 1 गोली, खाने के बाद' }, by: { en: 'ANM at the sub-centre', hi: 'उप-केंद्र की ANM' }, start: ago(330), stop: ago(240), times: ['21:00'], remind: false })
      ];
      reps = [
        rep({ id: 'smp-ar1', type: 'blood', date: ago(35), title: { en: 'Vitamin D and blood count (CBC)', hi: 'Vitamin D और blood count (CBC)' }, notes: { en: 'Vitamin D low, Hb normal. Doctor started the weekly sachet.', hi: 'Vitamin D कम, Hb ठीक। डॉक्टर ने हफ़्ते वाला sachet शुरू किया।' } }),
        rep({ id: 'smp-ar2', type: 'blood', date: ago(120), title: { en: 'TSH report', hi: 'TSH रिपोर्ट' }, notes: { en: 'Done because I felt tired. The doctor said it was in the normal range.', hi: 'थकान की वजह से कराया। डॉक्टर ने कहा normal है।' } })
      ];
      rems = [
        { id: 'tools-c-smp-a1', mod: 'tools', kind: 'visit', title: { en: 'Follow-up at the PHC about vitamin D', hi: 'vitamin D के लिए PHC पर दोबारा दिखाना' }, start: ahead(30), time: '10:00', rep: 'once', on: true, every: null, weekdays: null, dates: null },
        { id: 'tools-c-smp-a2', mod: 'tools', kind: 'custom', title: { en: 'Refill my medicines', hi: 'दवाएँ फिर से लानी हैं' }, start: ago(17), time: '18:00', rep: 'monthly', dom: 1, on: true, every: null, weekdays: null, dates: null },
        { id: 'tools-c-smp-a3', mod: 'tools', kind: 'custom', title: { en: 'Evening walk', hi: 'शाम की सैर' }, start: ago(20), time: '18:30', rep: 'daily', on: false, every: 1, weekdays: null, dates: null }
      ];
    } else if (id === 'meera') {   /* her iron plan (mods/iron.js) carries the IFA reminder, so the medicine here has none */
      const base = okISO(sit.pregnantSince) ? S.fromISO(sit.pregnantSince) : S.addDays(td, -168); const at = (n) => iso(S.addDays(base, n));
      meds = [
        med({ id: 'smp-m1', name: { en: 'Iron and folic acid (IFA) tablet', hi: 'आयरन-फ़ोलिक एसिड (IFA) की गोली' }, why: { en: 'Pregnancy, to prevent anaemia', hi: 'गर्भावस्था में, खून की कमी से बचाव' }, dose: { en: '1 tablet a day, as on my MCP card', hi: 'रोज़ 1 गोली, MCP card के हिसाब से' }, by: { en: 'ANM at my ANC visit', hi: 'ANC जाँच में ANM' }, start: at(112), times: ['21:00'] , remind: false}),
        med({ id: 'smp-m2', name: { en: 'Calcium tablet', hi: 'Calcium की गोली' }, why: { en: "Pregnancy, for my bones and the baby's", hi: 'गर्भावस्था में, मेरी और बच्चे की हड्डियों के लिए' }, dose: { en: 'As on my MCP card. Not at the same time as the iron tablet.', hi: 'MCP card के हिसाब से। iron की गोली के साथ नहीं।' }, by: { en: 'ANM at my ANC visit', hi: 'ANC जाँच में ANM' }, start: at(112), times: ['13:00'] })
      ];
      reps = [
        rep({ id: 'smp-mr1', type: 'scan', date: at(140), title: { en: 'Anomaly scan (about 20 weeks)', hi: 'Anomaly scan (लगभग 20 हफ़्ते)' }, notes: { en: 'Keep for the next ANC visit.', hi: 'अगली ANC जाँच के लिए रखें।' } }),
        rep({ id: 'smp-mr2', type: 'blood', date: at(49), title: { en: 'First ANC blood tests', hi: 'पहली ANC जाँच के blood test' }, notes: { en: 'Hb, blood group, sugar and urine. Results are on the MCP card.', hi: 'Hb, blood group, sugar और urine। नतीजे MCP card पर हैं।' } })
      ];
    } else if (id === 'sunita') {
      const del = okISO(sit.deliveredOn) ? S.fromISO(sit.deliveredOn) : S.addDays(td, -21); const at = (n) => iso(S.addDays(del, n));
      meds = [
        med({ id: 'smp-s1', name: { en: 'Iron and folic acid (IFA) tablet', hi: 'आयरन-फ़ोलिक एसिड (IFA) की गोली' }, why: { en: 'After delivery, while breastfeeding', hi: 'डिलीवरी के बाद, स्तनपान के दौरान' }, dose: { en: '1 tablet a day after a meal', hi: 'रोज़ 1 गोली, खाने के बाद' }, by: { en: 'Doctor at discharge', hi: 'छुट्टी के समय डॉक्टर' }, start: at(2), stop: at(180), times: ['21:00'] }),
        med({ id: 'smp-s2', name: { en: 'Calcium tablet', hi: 'Calcium की गोली' }, why: { en: 'After delivery, while breastfeeding', hi: 'डिलीवरी के बाद, स्तनपान के दौरान' }, dose: { en: 'As written on the discharge slip. Not with the iron tablet.', hi: 'छुट्टी के पर्चे के हिसाब से। iron की गोली के साथ नहीं।' }, by: { en: 'Doctor at discharge', hi: 'छुट्टी के समय डॉक्टर' }, start: at(2), stop: at(180), times: ['13:00'] })
      ];
      reps = [
        rep({ id: 'smp-sr1', type: 'dis', date: at(2), title: { en: 'Discharge summary after delivery', hi: 'डिलीवरी के बाद की डिस्चार्ज समरी' }, notes: { en: 'Has the list of medicines and the date of the check-up.', hi: 'इसमें दवाओं की सूची और जाँच की तारीख़ है।' } }),
        rep({ id: 'smp-sr2', type: 'rx', date: at(2), title: { en: 'Prescription at discharge', hi: 'छुट्टी के समय का पर्चा' }, notes: '' })
      ];
    } else if (id === 'kamla') {
      meds = [
        med({ id: 'smp-k1', name: { en: 'Iron tablet', hi: 'आयरन की गोली' }, why: { en: 'Low Hb with heavy periods', hi: 'भारी पीरियड के साथ Hb कम' }, dose: { en: 'As written by my doctor, after a meal', hi: 'डॉक्टर के लिखे हिसाब से, खाने के बाद' }, by: { en: 'Doctor at the CHC', hi: 'CHC के डॉक्टर' }, start: ago(45), times: ['08:30'] }),
        med({ id: 'smp-k2', name: { en: 'Vitamin D3', hi: 'विटामिन D3' }, why: { en: 'Low vitamin D on my blood test', hi: 'blood test में vitamin D कम' }, dose: { en: 'Once a week, as written', hi: 'हफ़्ते में एक बार, लिखे हिसाब से' }, by: { en: 'Doctor at the CHC', hi: 'CHC के डॉक्टर' }, start: ago(45), freq: 'weekly', wd: 6, times: ['09:00'] })
      ];
      reps = [
        rep({ id: 'smp-kr1', type: 'scan', date: ago(60), title: { en: 'Pelvic ultrasound', hi: 'पेल्विक अल्ट्रासाउंड' }, notes: { en: 'Done because of heavy periods. To show the gynaecologist.', hi: 'भारी पीरियड की वजह से कराया। स्त्री रोग विशेषज्ञ को दिखाना है।' } }),
        rep({ id: 'smp-kr2', type: 'blood', date: ago(62), title: { en: 'Blood count (Hb) and vitamin D', hi: 'Blood count (Hb) और vitamin D' }, notes: '' })
      ];
    } else if (id === 'priya') {
      meds = [
        med({ id: 'smp-p1', name: { en: 'Metformin', hi: 'Metformin' }, why: { en: 'PMOS, prescribed by my gynaecologist', hi: 'PMOS, मेरी स्त्री रोग विशेषज्ञ ने लिखी' }, dose: { en: 'As written on my prescription, with dinner', hi: 'पर्चे के हिसाब से, रात के खाने के साथ' }, by: { en: 'My gynaecologist', hi: 'मेरी स्त्री रोग विशेषज्ञ' }, start: ago(120), times: ['20:30'] })
      ];
      reps = [
        rep({ id: 'smp-pr1', type: 'scan', date: ago(150), title: { en: 'Pelvic ultrasound', hi: 'पेल्विक अल्ट्रासाउंड' }, notes: { en: 'Done before the PMOS diagnosis. Keep for follow-up.', hi: 'PMOS बताए जाने से पहले कराया। follow-up के लिए रखें।' } }),
        rep({ id: 'smp-pr2', type: 'blood', date: ago(152), title: { en: 'TSH and prolactin', hi: 'TSH और prolactin' }, notes: { en: 'Done to check other causes of long gaps.', hi: 'लंबे अंतर की दूसरी वजहें देखने के लिए कराया।' } })
      ];
    } else return;
    const d = D(); d.meds = meds; d.reports = reps;
    meds.forEach(syncMedRems);
    rems.forEach((r) => { if (r.rep === 'monthly') r.dates = monthDates(r.start, r.dom); S.reminders.upsert(r); });
  }

  S.register({
    id: 'tools',
    demoPersona: 'asha',
    strings: strings,
    routes: { 'tools-reminders': renderReminders, 'tools-meds': renderMeds, 'tools-reports': renderReports, 'tools-summary': renderSummary },
    open: MINE.slice(),
    tiles: [
      { section: 'tools', route: R.rem, title: 'tools_t_rem', sub: 'tools_t_rem_s', icon: 'bell', order: 10, gated: false, keywords: 'reminder reminders alarm medicine time whatsapp yaad रिमाइंडर याद' },
      { section: 'tools', route: R.meds, title: 'tools_t_meds', sub: 'tools_t_meds_s', icon: 'pill', order: 20, gated: false, keywords: 'medicine medicines tablet supplement prescription iron ifa calcium vitamin generic jan aushadhi dawai दवा गोली जन औषधि' },
      { section: 'tools', route: R.reps, title: 'tools_t_reps', sub: 'tools_t_reps_s', icon: 'file', order: 30, gated: false, keywords: 'report reports test blood scan ultrasound prescription discharge abha abdm health id रिपोर्ट जाँच पर्चा' },
      { section: 'tools', route: R.sum, title: 'tools_t_sum', sub: 'tools_t_sum_s', icon: SUM_SVG, order: 40, gated: false, keywords: 'summary doctor visit share copy show सारांश डॉक्टर' }
    ],
    css: [
      '.tl-grow { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }',
      '.tl-grow strong, .tl-grow h3, .tl-grow h2, .tl-wrap { overflow-wrap: anywhere; }',
      '.tl-grow strong { color: var(--fg); font-weight: 600; font-size: 15px; }',
      '.tl-rem { background: var(--card); border-radius: 18px; padding: 12px 14px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 10px; }',
      '.tl-rem.tl-off { box-shadow: none; background: var(--card-2); border: 1px dashed var(--line); }',
      '.tl-rem.tl-off strong { color: var(--muted); }',
      '.tl-rem-top { display: flex; gap: 12px; align-items: flex-start; }',
      '.tl-rem-ctl { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding-left: 48px; }',
      '.tl-rem-ctl .btn { margin-left: auto; }',
      '.tl-rem-ctl input:disabled { opacity: 0.7; }',
      'input.tl-time { width: 132px; flex: 0 0 auto; min-height: 40px; padding: 6px 10px; }',
      '.tl-switch { position: relative; width: 52px; height: 32px; flex-shrink: 0; display: inline-block; }',
      '.tl-switch input { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; min-height: 0; margin: 0; padding: 0; opacity: 0; cursor: pointer; z-index: 1; }',
      '.tl-switch span { position: absolute; top: 0; right: 0; bottom: 0; left: 0; border-radius: 16px; background: var(--peach); transition: background 0.2s; }',
      '.tl-switch span::after { content: ""; position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-radius: 12px; background: var(--card); box-shadow: var(--shadow); border: 1px solid var(--line); transition: transform 0.2s; }',
      '.tl-switch input:checked + span { background: var(--accent-strong); }',
      '.tl-switch input:checked + span::after { transform: translateX(20px); }',
      '.tl-switch input:focus-visible + span { outline: 3px solid var(--accent); outline-offset: 2px; }',
      '.tl-confirm { display: flex; flex-direction: column; gap: 8px; background: var(--accent-soft); border-radius: 14px; padding: 10px 12px; }',
      '.tl-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }',
      '.tl-field[hidden] { display: none !important; }',
      '.tl-lab { font-size: 13px; font-weight: 600; color: var(--fg); }',
      '.tl-err { color: var(--accent); font-weight: 600; }',
      '.tl-err:empty { display: none; }',
      'input.tl-num { width: 110px; }',
      '.tl-wd .chip { padding: 0 12px; }',
      '.tl-check { display: flex; gap: 10px; align-items: center; font-weight: 600; font-size: 14px; color: var(--fg); }',
      '.tl-check input { width: 22px; height: 22px; min-height: 0; accent-color: var(--accent); flex-shrink: 0; margin: 0; }',
      '.tl-times { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }',
      '.tl-trow { display: flex; gap: 8px; align-items: center; }',
      '.tl-x { width: 40px; height: 40px; border-radius: 20px; border: 1.5px solid var(--line); background: var(--card); color: var(--muted); display: inline-flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; }',
      '.tl-x svg { width: 18px; height: 18px; }',
      '.tl-self { align-self: flex-start; }',
      '.tl-nowrap { white-space: nowrap; flex-shrink: 0; }',
      '.tl-link { align-self: flex-start; max-width: 100%; white-space: normal; }',
      '.tl-ul { padding-left: 18px; font-size: 14px; color: var(--fg); }',
      '.tl-kv { display: grid; grid-template-columns: minmax(88px, max-content) minmax(0, 1fr); gap: 4px 12px; font-size: 13px; margin: 0; }',
      '.tl-kv dt { color: var(--muted); }',
      '.tl-kv dd { margin: 0; color: var(--fg); overflow-wrap: anywhere; }',
      '.tl-med h3 { overflow-wrap: anywhere; }',
      '.tl-med .tl-rem-top .pill { flex-shrink: 0; margin-top: 6px; }',
      '.tl-acc { background: var(--card-2); border-radius: 18px; padding: 12px 14px; }',
      '.tl-acc > summary { font-size: 14px; color: var(--fg); min-height: 28px; display: flex; align-items: center; }',
      '.tl-rep .body strong { overflow-wrap: anywhere; }',
      '.tl-thumb { width: 52px; height: 52px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: var(--peach-2); color: var(--gold); display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); }',
      '.tl-thumb svg { width: 22px; height: 22px; }',
      '.tl-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }',
      '.tl-cnt { font-size: 11px; color: var(--muted); margin-left: 4px; }',
      '.tl-full { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--line); display: block; background: var(--card-2); }',
      '.tl-bar { height: 10px; border-radius: 5px; background: var(--bg); overflow: hidden; }',
      '.tl-bar i { display: block; height: 100%; border-radius: 5px; background: var(--ok); }',
      '.tl-bar.warn i { background: var(--gold); }',
      '.tl-bar.full i { background: var(--accent-strong); }',
      '.tl-space { gap: 8px; padding: 12px 14px; }',
      '.tl-space .row > span:last-child { text-align: right; }',
      '.tl-preview { display: flex; gap: 12px; align-items: center; }',
      '.tl-preview img { width: 72px; height: 72px; object-fit: cover; border-radius: 12px; border: 1px solid var(--line); flex-shrink: 0; }',
      'input.tl-file { padding: 9px 10px; font-size: 13px; }',
      '.tl-mask { font-variant-numeric: tabular-nums; letter-spacing: 0.5px; color: var(--fg); font-weight: 600; overflow-wrap: anywhere; min-width: 0; }',
      '.tl-sum { gap: 12px; }',
      '.tl-head { display: flex; flex-direction: column; gap: 2px; }',
      '.tl-meta { font-size: 14px; color: var(--fg); font-weight: 500; }',
      '.tl-doc .tl-meta-big { font-size: 20px; color: var(--fg); font-weight: 500; }',
      '.tl-sec { display: flex; flex-direction: column; gap: 4px; padding-top: 10px; border-top: 1px solid var(--line); }',
      '.tl-sec ul { padding-left: 18px; font-size: 14px; color: var(--fg); }',
      '.tl-sec li { overflow-wrap: anywhere; margin: 2px 0; }',
      '.tl-copy { min-height: 200px; font-size: 13px; line-height: 1.45; }',
      '.tl-doc { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 15; background: var(--card); color: var(--fg); overflow-y: auto; overscroll-behavior: contain; }',
      '.tl-doc-in { max-width: 680px; margin: 0 auto; padding: 0 20px 48px 20px; display: flex; flex-direction: column; gap: 16px; }',
      '.tl-doc-bar { position: sticky; top: 0; z-index: 1; background: var(--card); display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px 0 10px 0; border-bottom: 1px solid var(--line); }',
      '.tl-doc h2 { font-size: 26px; line-height: 1.25; overflow-wrap: anywhere; }',
      '.tl-doc .tl-made { font-size: 16px; color: var(--muted); }',
      '.tl-doc .tl-sec { padding-top: 14px; gap: 6px; }',
      '.tl-doc .tl-sec h3 { font-size: 21px; }',
      '.tl-doc .tl-sec ul { font-size: 20px; line-height: 1.5; padding-left: 22px; }',
      '.tl-doc .tl-sec li { margin: 4px 0; }'
    ].join('\n'),
    summary: summary,
    sample: sample,
    beforeRender: () => { try { housekeep(); } catch (e) { } return false; },
    afterRender: (v, route) => {
      if (route !== R.sum) { ui.docView = false; ui.shareAsk = false; if (escH) { document.removeEventListener('keydown', escH); escH = null; } }
      if (MINE.indexOf(route) < 0) { ui.remForm = null; ui.remConfirm = null; ui.medForm = null; ui.medConfirm = null; ui.repForm = null; ui.abhaEdit = false; ui.abhaShow = false; ui.abhaErr = ''; }
    }
  });
})(window.Saathi);
