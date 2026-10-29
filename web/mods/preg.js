/* Pregnancy content and logs: week-by-week pages, check-up logs, common discomforts, food in pregnancy and a phone copy of the MCP card. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;

  /* ---------- strings: [English, Hindi]; every key becomes preg_<key> ---------- */
  const P = {
    /* My pregnancy plan (Version 28, A1) */
    plan_h: ['Check-ups and tests', 'जाँचें और टेस्ट'], dates_b: ['Change my dates', 'मेरी तारीख़ें बदलें'],   /* Version 39.2 (journey audit J-17): "My pregnancy plan" is the My plan tab */
    plan_s: ['What is due now, week by week, with reminders', 'अभी क्या करना है, हफ़्ते-दर-हफ़्ते, रिमाइंडर के साथ'],
    plan_p: ['What is due in your pregnancy, from your dates. Tick what you have done; the dates in your MCP card and your logs count too.', 'आपकी तारीख़ों से, गर्भावस्था में कब क्या करना है। जो कर लिया, उसे टिक करें; MCP card और रिकॉर्ड की तारीख़ें भी गिनी जाती हैं।'],
    plan_now: ['Due now', 'अभी का'], plan_soon: ['Coming up', 'आगे'], plan_done_h: ['Done ({n})', 'हो गया ({n})'], plan_past_h: ['Not done yet ({n})', 'अभी नहीं हुआ ({n})'],
    plan_past_p: ['If you missed one, ask your ANM about it at your next visit.', 'कोई छूट गया हो, तो अगली जाँच में ANM से उसके बारे में पूछें।'],
    /* Version 39.28: with a private gynaecologist, or before she says where she goes (S.care) */
    plan_p_doc: ['What is due in your pregnancy, from your dates. You need at least 4 check-ups; your gynaecologist may see you more often. Tick each one as you have it.', 'आपकी तारीख़ों से, गर्भावस्था में कब क्या करना है। कम से कम 4 जाँचें ज़रूरी हैं; आपकी गायनेकोलॉजिस्ट ज़्यादा बार भी बुला सकती हैं। हर जाँच होने पर उसे टिक करें।'],
    plan_past_p_doc: ['If you missed one, ask your gynaecologist about it at your next visit.', 'कोई छूट गया हो, तो अगली जाँच में अपनी गायनेकोलॉजिस्ट से उसके बारे में पूछें।'],
    plan_rem_s_doc: ['At 10 am on the first day of each check-up and test.', 'हर जाँच और टेस्ट के पहले दिन सुबह 10 बजे।'],
    plan_free_doc: ['Free at government hospitals: check-ups on the 9th (PMSMA), the birth (JSSK) and scheme money (PMMVY)', 'सरकारी अस्पतालों में मुफ़्त: 9 तारीख़ की जाँच (PMSMA), डिलीवरी (JSSK) और योजना का पैसा (PMMVY)'],
    pi_anc1_doc: ['First check-up and tests', 'पहली जाँच और टेस्ट'], pi_asha_doc: ['Your doctor’s and ambulance numbers', 'डॉक्टर और एम्बुलेंस के नंबर'],
    plan_wk: ['Weeks {a} to {b}', 'हफ़्ता {a} से {b}'], plan_upto: ['Up to week {b}', 'हफ़्ता {b} तक'], plan_from: ['From week {a}, {d}', 'हफ़्ता {a} से, {d}'],
    plan_open: ['Open', 'खोलें'], plan_mark: ['Done', 'हो गया'], plan_marked: ['Done on {d}', '{d} को हो गया'], plan_undo: ['Undo', 'वापस लें'], plan_auto: ['Done: from your MCP card, logs or tools', 'हो गया: आपके MCP card, रिकॉर्ड या टूल से'], plan_auto_doc: ['Done: from your pregnancy card, logs or tools', 'हो गया: आपके प्रेग्नेंसी कार्ड, रिकॉर्ड या टूल से'],
    plan_td2: ['Second dose from {d}', 'दूसरी खुराक {d} से'],
    plan_kilkari: ['Kilkari, in states that run it: free weekly voice calls about pregnancy and baby, from the 4th month till the baby turns one, to the mobile number given when your pregnancy is registered (RCH portal). Choose that number carefully if the phone is shared.', 'किलकारी, जिन राज्यों में चलती है: गर्भ और बच्चे के बारे में हर हफ़्ते मुफ़्त फ़ोन कॉल, 4थे महीने से बच्चे के एक साल तक, उस मोबाइल नंबर पर जो गर्भ के पंजीकरण (RCH पोर्टल) के समय दिया गया। फ़ोन साझा है तो वह नंबर सोचकर दें।'],
    plan_pmsma_next: ['Next PMSMA day: {d}', 'अगला PMSMA दिन: {d}'], plan_pmsma_find: ['Find a PMSMA centre', 'PMSMA केंद्र खोजें'], plan_uwin: ['Book on U-WIN', 'U-WIN पर बुक करें'], plan_pmsma_went: ['I went today', 'आज गई थी'], plan_pmsma_n: ['Went: {n}', 'गईं: {n} बार'],
    setup_plan: ['Turn on your plan’s reminders', 'अपनी योजना के रिमाइंडर चालू करें'],
    plan_rem: ['Remind me when each one is due', 'हर चीज़ का समय आने पर याद दिलाएँ'], plan_rem_s: ['At 10 am on the first day of each check-up and test, and at 9 am on each PMSMA day.', 'हर जाँच और टेस्ट के पहले दिन सुबह 10 बजे, और हर PMSMA दिन सुबह 9 बजे।'],
    plan_none: ['Add your due date or last period to see your plan.', 'अपना प्लान देखने के लिए डिलीवरी की तारीख़ या पिछला पीरियड डालें।'], plan_all_now: ['Nothing is due right now.', 'अभी कुछ बाकी नहीं।'],
    plan_home: ['Due now: {x}', 'अभी: {x}'], plan_home_more: ['{x}, and {n} more', '{x} और {n} अन्य'], plan_rem_now: ['Due now: {x}', 'अभी: {x}'], plan_rem_pmsma: ['PMSMA: free check-up today', 'PMSMA: आज मुफ़्त जाँच'],
    sum_due: ['Due now: {x}', 'अभी: {x}'],
    pi_reg: ['Register your pregnancy', 'गर्भ का पंजीकरण'], pi_folic: ['Folic acid', 'फोलिक एसिड'], pi_anc1: ['First check-up and free tests', 'पहली जाँच और मुफ़्त टेस्ट'], pi_td: ['Td injections', 'Td के टीके'],
    pi_scan1: ['Early scan, if advised', 'शुरुआती scan, अगर सलाह मिले'], pi_scheme: ['Scheme money: PMMVY and JSY', 'योजना का पैसा: PMMVY और JSY'], pi_ifa: ['Iron tablets', 'आयरन की गोलियाँ'], pi_ca: ['Calcium tablets', 'कैल्शियम की गोलियाँ'],
    pi_anc2: ['Second check-up', 'दूसरी जाँच'], pi_scan2: ['Anomaly scan', 'Anomaly scan'], pi_pmsma: ['PMSMA: free check-up on the 9th', 'PMSMA: 9 तारीख़ को मुफ़्त जाँच'], pi_ogtt: ['Sugar test (75 g)', 'शुगर टेस्ट (75 g)'],
    pi_anc3: ['Third check-up', 'तीसरी जाँच'], pi_jssk: ['Free birth at a government hospital (JSSK)', 'सरकारी अस्पताल में मुफ़्त डिलीवरी (JSSK)'], pi_birth: ['Your birth plan', 'आपका डिलीवरी प्लान'], pi_asha: ['ASHA and ambulance numbers', 'ASHA और एम्बुलेंस के नंबर'],
    pi_anc4: ['Fourth check-up', 'चौथी जाँच'], pi_fp: ['Family planning after the birth', 'डिलीवरी के बाद परिवार नियोजन'], pi_w41: ['A check at 41 weeks', '41 हफ़्ते पर जाँच'],
    /* tiles */
    t_hub: ['Pregnancy guide', 'गर्भावस्था गाइड'],
    t_hub_s: ['Your week, check-up logs, food, discomforts and your MCP card', 'आपका हफ़्ता, जाँच का रिकॉर्ड, खाना, तकलीफ़ें और आपका MCP card'], t_hub_s_doc: ['Your week, check-up logs, food, discomforts and your pregnancy card', 'आपका हफ़्ता, जाँच का रिकॉर्ड, खाना, तकलीफ़ें और आपका प्रेग्नेंसी कार्ड'],
    t_week: ['This week of pregnancy', 'गर्भावस्था का यह हफ़्ता'],
    t_week_s: ["Baby's size, your body, and one tip for each week", 'हर हफ़्ते बच्चे का आकार, आपका शरीर और एक सुझाव'],
    t_logs: ['My pregnancy logs', 'मेरी गर्भावस्था का रिकॉर्ड'],
    t_logs_s: ['Weight, BP, sugar, Hb and daily tablets', 'वज़न, BP, sugar, Hb और रोज़ की गोलियाँ'],
    t_sym: ['Common discomforts', 'आम तकलीफ़ें'],
    t_sym_s: ['What helps, and when to see a doctor', 'क्या मदद करता है, और डॉक्टर को कब दिखाएँ'],
    t_diet: ['Food in pregnancy', 'गर्भावस्था में खाना'],
    t_diet_s: ['The Indian plate, iron, calcium, and common myths', 'भारतीय थाली, iron, calcium, और आम भ्रम'],
    t_pelvic: ['Pelvic floor exercises', 'पेल्विक फ़्लोर व्यायाम'],
    t_pelvic_s: ['A few minutes a day now lowers the chance of leaking later', 'अभी रोज़ कुछ मिनट से बाद में लीक होने की संभावना कम होती है'],
    t_mcp: ['My MCP card', 'मेरा MCP card'], t_mcp_doc: ['My pregnancy card', 'मेरा प्रेग्नेंसी कार्ड'],
    t_mcp_s: ['A phone copy of your Mother and Child Protection card', 'माँ और बच्चे के सुरक्षा कार्ड (MCP card) की फ़ोन कॉपी'], t_mcp_s_doc: ['A phone copy of your pregnancy card', 'आपके प्रेग्नेंसी कार्ड की फ़ोन कॉपी'],

    /* hub */
    hub_h: ['Pregnancy', 'गर्भावस्था'],
    hub_p: ["Week-by-week pages, your check-up numbers, food, common discomforts and a copy of your MCP card. Based on India's national guidelines.", 'हर हफ़्ते के पन्ने, जाँच के आपके नंबर, खाना, आम तकलीफ़ें और आपके MCP card की कॉपी। भारत की राष्ट्रीय गाइडलाइन पर आधारित।'], hub_p_doc: ['Week-by-week pages, your check-up numbers, food, common discomforts and a copy of your pregnancy card. Based on India\'s national guidelines.', 'हर हफ़्ते के पन्ने, जाँच के आपके नंबर, खाना, आम तकलीफ़ें और आपके प्रेग्नेंसी कार्ड की कॉपी। भारत की राष्ट्रीय गाइडलाइन पर आधारित।'],
    hub_now: ['About week {n}', 'लगभग हफ़्ता {n}'],
    hub_due: ['Due date about {d}', 'डिलीवरी की तारीख़ लगभग {d}'],
    hub_scan: ["Counted from the due date on your scan report. Your ANM's count wins.", 'scan रिपोर्ट की डिलीवरी तारीख़ से गिना गया। आपकी ANM की गिनती ही मानी जाएगी।'], hub_scan_doc: ['Counted from the due date on your scan report. Your doctor\'s count wins.', 'scan रिपोर्ट की डिलीवरी तारीख़ से गिना गया। आपकी डॉक्टर की गिनती ही मानी जाएगी।'],
    hub_lmp: ["Counted from your last period. Your ANM's count wins.", 'पिछले पीरियड से गिना गया। आपकी ANM की गिनती ही मानी जाएगी।'], hub_lmp_doc: ['Counted from your last period. Your doctor\'s count wins.', 'पिछले पीरियड से गिना गया। आपकी डॉक्टर की गिनती ही मानी जाएगी।'],
    hub_read: ['Read week {n}', 'हफ़्ता {n} पढ़ें'],
    hub_set: ['To see your own week, tell Sakhi you are pregnant. You can read every guide without it.', 'अपना हफ़्ता देखने के लिए Sakhi को बताएँ कि आप गर्भवती हैं। इसके बिना भी हर गाइड पढ़ सकती हैं।'],
    hub_set_b: ['I am pregnant', 'मैं गर्भवती हूँ'],
    hub_nodate: ['To see your own week, add the due date from your scan report, or the first day of your last period. You can read every guide without it.', 'अपना हफ़्ता देखने के लिए स्कैन रिपोर्ट पर लिखी डिलीवरी की तारीख़ या पिछले पीरियड का पहला दिन डालें। इसके बिना भी हर गाइड पढ़ सकती हैं।'],
    hub_nodate_b: ['Add the date', 'तारीख़ डालें'],
    hub_early: ['Under 4 weeks by your dates. The weekly pages start at week 4.', 'आपकी तारीख़ों से अभी 4 हफ़्ते से कम। हफ़्ते के पन्ने हफ़्ता 4 से शुरू होते हैं।'],
    hub_late: ['More than 42 weeks by your dates. If you have not given birth, go to your hospital today.', 'आपकी तारीख़ों से 42 हफ़्ते से ज़्यादा। अगर डिलीवरी नहीं हुई है, तो आज ही अस्पताल जाएँ।'],
    hub_all: ['All weeks', 'सभी हफ़्ते'],
    hub_all_p: ['Weeks are counted from the first day of the last period, the way your ANM counts them.', 'हफ़्ते पिछले पीरियड के पहले दिन से गिने जाते हैं, जैसे आपकी ANM गिनती हैं।'], hub_all_p_doc: ['Weeks are counted from the first day of the last period, the way your doctor counts them.', 'हफ़्ते पिछले पीरियड के पहले दिन से गिने जाते हैं, जैसे आपकी डॉक्टर गिनती हैं।'],
    hub_guides: ['Guides and logs', 'गाइड और रिकॉर्ड'],
    hub_visits: ['Check-up visits and dates', 'जाँच की मुलाक़ातें और तारीख़ें'],
    hub_visits_s: ['The 4 visits, and set your scan date', '4 मुलाक़ातें, और अपनी scan की तारीख़ डालें'],
    hub_loss: ['If the pregnancy has ended', 'अगर गर्भ नहीं रहा'],
    hub_loss_s: ['Care for your body and support, in private', 'शरीर की देखभाल और सहारा, पूरी गोपनीयता से'],
    hub_free_h: ['Free for you in pregnancy', 'गर्भावस्था में आपके लिए मुफ़्त'],
    free_1: ['At least 4 check-ups, with BP, weight, Hb and urine tests', 'कम से कम 4 जाँचें, BP, वज़न, Hb और पेशाब की जाँच के साथ'],
    free_2: ['Iron-folic acid and calcium tablets, and the Td injection', 'Iron-folic acid और calcium की गोलियाँ, और Td का टीका'],
    free_3: ["A doctor's check on the 9th of every month (PMSMA)", 'हर महीने की 9 तारीख़ को डॉक्टर की जाँच (PMSMA)'],
    free_4: ['Birth at a government hospital, including C-section, medicines, tests, blood, food and transport (JSSK)', 'सरकारी अस्पताल में डिलीवरी, ऑपरेशन, दवाएँ, जाँचें, ख़ून, खाना और आना-जाना समेत (JSSK)'],
    free_5: ['Food from the Anganwadi for pregnant women', 'गर्भवती महिलाओं के लिए आंगनवाड़ी से खाना'],
    free_amb: ['Ambulance: 102 or 108, free', 'एम्बुलेंस: 102 या 108, मुफ़्त'],
    hub_schemes: ['Scheme money you can claim', 'योजनाओं का पैसा जो आपको मिल सकता है'],
    hub_ask_h: ['Food, weight and sleep in pregnancy', 'गर्भावस्था में खाना, वज़न और नींद'],
    hub_ask_p: ['A free call with a Qura doctor (BAMS) can help with food, weight and sleep. Your ANM or gynaecologist looks after the pregnancy itself, medicines and scans.', 'Qura की डॉक्टर (BAMS) से मुफ़्त कॉल में खाने, वज़न और नींद पर मदद मिल सकती है। गर्भ की देखभाल, दवाएँ और scan आपकी ANM या स्त्री रोग विशेषज्ञ देखती हैं।'], hub_ask_p_doc: ['A free call with a Qura doctor (BAMS) can help with food, weight and sleep. Your gynaecologist looks after the pregnancy itself, medicines and scans.', 'Qura की डॉक्टर (BAMS) से मुफ़्त कॉल में खाने, वज़न और नींद पर मदद मिल सकती है। गर्भ की देखभाल, दवाएँ और scan आपकी स्त्री रोग विशेषज्ञ देखती हैं।'],
    ask_topic: ['Pregnancy: food, weight and sleep', 'गर्भावस्था: खाना, वज़न और नींद'],
    ask_topic_diet: ['Pregnancy diet', 'गर्भावस्था का खाना'],

    /* week pages */
    wk_title: ['Week {n}', 'हफ़्ता {n}'],
    wk_yours: ['Your week now', 'अभी आपका हफ़्ता'],
    wk_youare: ['By your dates you are in about week {n}.', 'आपकी तारीख़ों से आप लगभग हफ़्ता {n} में हैं।'],
    wk_goto: ['Go to my week', 'मेरे हफ़्ते पर जाएँ'],
    wk_p: ['Counted from the first day of the last period. Every baby grows at its own pace.', 'पिछले पीरियड के पहले दिन से गिना गया। हर बच्चा अपनी रफ़्तार से बढ़ता है।'],
    wk_tri1: ['First three months', 'पहले तीन महीने'],
    wk_tri2: ['Middle three months', 'बीच के तीन महीने'],
    wk_tri3: ['Last three months', 'आख़िरी तीन महीने'],
    wk_baby: ['Your baby this week', 'इस हफ़्ते आपका बच्चा'],
    wk_body: ['Your body this week', 'इस हफ़्ते आपका शरीर'],
    wk_len: ['Length, head to bottom', 'लंबाई, सिर से कूल्हे तक'],
    wk_wt: ['Weight, about', 'वज़न, लगभग'],
    wk_wt_birth: ['Weight at birth, about', 'जन्म के समय वज़न, लगभग'],
    wk_sz: ['Size', 'आकार'],
    wk_scan_h: ['About scans', 'scan के बारे में'],
    wk_scan: ["A scan checks your baby's health and growth. Finding out or telling a baby's sex is a crime in India under the PCPNDT Act, so no one should offer it and no one should ask.", 'scan बच्चे की सेहत और बढ़त जाँचता है। भारत में PCPNDT क़ानून के तहत बच्चे का लिंग पता करना या बताना अपराध है, इसलिए न कोई इसकी पेशकश करे, न कोई माँगे।'],
    wk_prev: ['‹ Week {n}', '‹ हफ़्ता {n}'],
    wk_next: ['Week {n} ›', 'हफ़्ता {n} ›'],
    wk_note: ['Sizes are middle values. Lengths use the standard scan formula (Robinson); weights come from the WHO fetal growth study, which included women in India, and from its birth weights for weeks 41–42. Healthy babies can be smaller or bigger. Your scan report is what your doctor follows.', 'आकार बीच के मान हैं। लंबाई scan के मानक फ़ॉर्मूले (Robinson) से है; वज़न WHO के भ्रूण-विकास अध्ययन से, जिसमें भारत की महिलाएँ भी शामिल थीं, और हफ़्ते 41–42 के लिए उसी अध्ययन के जन्म-वज़न से। स्वस्थ बच्चे छोटे या बड़े हो सकते हैं। डॉक्टर आपकी scan report देखती हैं।'],
    wk_choose: ['Pick a week to read', 'पढ़ने के लिए हफ़्ता चुनें'],
    k_visit: ['Check-up', 'जाँच'], k_tablet: ['Tablets and vaccines', 'गोलियाँ और टीके'], k_scheme: ['Free from the government', 'सरकार से मुफ़्त'],
    k_warn: ['Warning sign', 'ख़तरे का संकेत'], k_food: ['Food', 'खाना'], k_scan: ['Scan', 'scan'],
    go_logs: ['Open my logs', 'मेरा रिकॉर्ड खोलें'], go_feed: ['Breastfeeding help', 'स्तनपान में मदद'], go_contra: ['Family planning after birth', 'डिलीवरी के बाद परिवार नियोजन'],
    go_kicks: ['Kick counter', 'किक काउंटर'], go_bag: ['Hospital bag and birth plan', 'अस्पताल का बैग और डिलीवरी की योजना'], go_ctx: ['Labour pain timer', 'लेबर दर्द टाइमर'],

    /* logs */
    lg_h: ['My pregnancy logs', 'मेरी गर्भावस्था का रिकॉर्ड'],
    lg_p: ['Write down what your ANM or doctor measures, or what you check yourself. Your own numbers, shown as charts. Not a diagnosis.', 'आपकी ANM या डॉक्टर जो मापें, या आप ख़ुद जाँचें, वह यहाँ लिखें। आपके अपने नंबर, chart में। यह diagnosis नहीं है।'], lg_p_doc: ['Write down what your doctor measures, or what you check yourself. Your own numbers, shown as charts. Not a diagnosis.', 'आपकी डॉक्टर जो मापें, या आप ख़ुद जाँचें, वह यहाँ लिखें। आपके अपने नंबर, chart में। यह diagnosis नहीं है।'],
    lg_glance: ['Latest entries', 'सबसे नई entries'],
    tab_w: ['Weight', 'वज़न'], tab_bp: ['BP', 'BP'], tab_sug: ['Sugar', 'Sugar'], tab_hb: ['Hb', 'Hb'], tab_tab: ['Tablets', 'गोलियाँ'],
    lg_date: ['Date', 'तारीख़'],
    lg_none: ['Nothing written yet.', 'अभी कुछ नहीं लिखा।'],
    lg_bad: ['Check the number and try again.', 'नंबर जाँचकर फिर से डालें।'],
    lg_list: ['Your entries', 'आपकी entries'],
    lg_remove: ['Remove', 'हटाएँ'],
    lg_dash: ['None yet', 'अभी नहीं'],
    lg_ifa7: ['IFA, last 7 days', 'IFA, पिछले 7 दिन'],
    w_lbl: ['Weight (kg)', 'वज़न (kg)'],
    w_chart: ['Weight, kg', 'वज़न, kg'],
    w_gain: ['Change since your first entry: {x} kg', 'पहली entry से बदलाव: {x} kg'],
    w_note: ['If your weight was normal before pregnancy, the aim is to gain 10–12 kg in all. If you were overweight, about 5–9 kg. If you were underweight, eat more and have your weight checked at the Anganwadi or health centre. (ICMR-NIN 2024)', 'अगर गर्भ से पहले वज़न सामान्य था तो कुल 10–12 kg बढ़ना चाहिए। पहले से ज़्यादा था तो लगभग 5–9 kg। कम था तो ज़्यादा खाएँ और आंगनवाड़ी या health centre पर वज़न जँचवाती रहें। (ICMR-NIN 2024)'], w_note_doc: ['If your weight was normal before pregnancy, the aim is to gain 10–12 kg in all. If you were overweight, about 5–9 kg. If you were underweight, eat more and have your weight checked at your check-ups. (ICMR-NIN 2024)', 'अगर गर्भ से पहले वज़न सामान्य था तो कुल 10–12 kg बढ़ना चाहिए। पहले से ज़्यादा था तो लगभग 5–9 kg। कम था तो ज़्यादा खाएँ और हर जाँच में वज़न जँचवाती रहें। (ICMR-NIN 2024)'],
    bp_sys: ['Upper (systolic)', 'ऊपर वाला (systolic)'],
    bp_dia: ['Lower (diastolic)', 'नीचे वाला (diastolic)'],
    bp_sym: ['I also have a bad headache, blurred vision, or pain under the ribs', 'साथ में तेज़ सिरदर्द, धुंधला दिखना, या पसलियों के नीचे दर्द भी है'],
    bp_chart: ['BP: upper (solid) and lower (dashed)', 'BP: ऊपर वाला (सीधी रेखा) और नीचे वाला (टूटी रेखा)'],
    bp_urgent: ['160/110 or higher, or high BP with a bad headache, blurred vision or pain under the ribs: go to hospital now. Call 112, or 102/108 for a free ambulance.', '160/110 या ज़्यादा, या ऊँचे BP के साथ तेज़ सिरदर्द, धुंधला दिखना या पसलियों के नीचे दर्द: अभी अस्पताल जाएँ। 112 पर कॉल करें, या मुफ़्त एम्बुलेंस के लिए 102/108।'],
    bp_today: ['140/90 or higher: see a doctor today, even if you feel well. High BP in pregnancy often has no symptoms at first.', '140/90 या ज़्यादा: आज ही डॉक्टर को दिखाएँ, चाहे आप ठीक महसूस करें। गर्भावस्था में ऊँचे BP के शुरू में अक्सर कोई लक्षण नहीं होते।'],
    bp_note: ['BP is checked at every visit. Doctors look for 140/90 or higher, checked twice, to find high BP in pregnancy.', 'हर मुलाक़ात में BP जाँचा जाता है। गर्भावस्था में ऊँचा BP पहचानने के लिए डॉक्टर दो बार की जाँच में 140/90 या ज़्यादा देखते हैं।'],
    sug_kind: ['Which test?', 'कौन सी जाँच?'],
    sug_f: ['Fasting', 'ख़ाली पेट (fasting)'],
    sug_d: ['75 g test, 2 hours (DIPSI)', '75 g जाँच, 2 घंटे (DIPSI)'],
    sug_d_short: ['75 g 2-hour', '75 g, 2 घंटे'],
    sug_f_short: ['fasting', 'fasting'],
    sug_lbl: ['Sugar (mg/dL)', 'Sugar (mg/dL)'],
    sug_flag: ['140 mg/dL or more on the 75 g 2-hour test: show your doctor this week. Food changes and walking control the sugar for most women; a few need tablets or insulin.', '75 g की 2 घंटे वाली जाँच में 140 mg/dL या ज़्यादा: इसी हफ़्ते डॉक्टर को दिखाएँ। ज़्यादातर महिलाओं में खाने में बदलाव और टहलने से sugar काबू में आ जाती है; कुछ को गोली या insulin चाहिए होती है।'],
    sug_how: ["How the test works: you drink 75 g glucose in water and your sugar is checked 2 hours later. You don't need to come fasting. It is done at the first visit and again at 24–28 weeks, at least 4 weeks apart. 140 mg/dL or more is the national cut-off for diabetes in pregnancy (gestational diabetes).", 'जाँच कैसे होती है: 75 g glucose पानी में घोलकर पीती हैं और 2 घंटे बाद sugar जाँची जाती है। ख़ाली पेट आना ज़रूरी नहीं। यह पहली मुलाक़ात में और फिर 24–28 हफ़्ते में होती है, कम से कम 4 हफ़्ते के अंतर पर। 140 mg/dL या ज़्यादा गर्भावस्था की sugar (gestational diabetes) की राष्ट्रीय सीमा है।'],
    sug_due: ['Your 24–28 week sugar test is due now.', '24–28 हफ़्ते वाली sugar जाँच का समय अभी है।'],
    sug_fnote: ['Fasting sugar is not part of the 75 g test. If you have diabetes in pregnancy, your doctor sets your targets; the national guideline aims for under 95 fasting and under 120 two hours after meals.', 'Fasting sugar 75 g जाँच का हिस्सा नहीं है। गर्भावस्था में sugar हो तो target डॉक्टर तय करती हैं; राष्ट्रीय गाइडलाइन में fasting 95 से कम और खाने के 2 घंटे बाद 120 से कम का लक्ष्य है।'],
    sug_chart: ['75 g 2-hour test, mg/dL', '75 g 2 घंटे वाली जाँच, mg/dL'],
    sug_chart_f: ['Fasting sugar, mg/dL', 'Fasting sugar, mg/dL'],
    sug_fflag: ['Fasting sugar of 95 mg/dL or more is above the national target: show your doctor this week. Food changes and walking control the sugar for most women; a few need tablets or insulin.', 'ख़ाली पेट sugar 95 mg/dL या ज़्यादा राष्ट्रीय लक्ष्य से ऊपर है: इसी हफ़्ते डॉक्टर को दिखाएँ। ज़्यादातर महिलाओं में खाने के बदलाव और टहलने से sugar काबू में रहती है; कुछ को गोली या इंसुलिन चाहिए होती है।'],
    sug_fflag2: ['Fasting sugar of 126 mg/dL or more is in the diabetes range: show your doctor in the next few days. It needs a treatment plan.', 'ख़ाली पेट sugar 126 mg/dL या ज़्यादा डायबिटीज़ की रेंज में है: अगले कुछ दिनों में डॉक्टर को दिखाएँ। इसके इलाज का प्लान ज़रूरी है।'],
    hb_lbl: ['Hb (g/dL)', 'Hb (g/dL)'],
    hb_chart: ['Hb, g/dL', 'Hb, g/dL'],
    hb_flag: ['Hb under 7: see a doctor today. You may need iron through a drip, or blood, at a district hospital.', 'Hb 7 से कम: आज ही डॉक्टर को दिखाएँ। ज़िला अस्पताल में drip से iron या ख़ून चढ़ाने की ज़रूरत पड़ सकती है।'],
    hb_note: ['Hb is checked at every visit. In pregnancy, doctors count Hb under 11 as anaemia (under 10.5 in weeks 14–27, WHO 2024). If yours is low, your ANM may give 2 IFA tablets a day or iron through a drip, and test again after a month.', 'हर मुलाक़ात में Hb जाँचा जाता है। गर्भावस्था में 11 से कम Hb को डॉक्टर ख़ून की कमी (anaemia) मानते हैं (हफ़्ते 14–27 में 10.5 से कम, WHO 2024)। कम हो तो ANM रोज़ 2 IFA गोली या drip से iron दे सकती हैं, और एक महीने बाद फिर जाँच होती है।'], hb_note_doc: ['Hb is checked at every visit. In pregnancy, doctors count Hb under 11 as anaemia (under 10.5 in weeks 14–27, WHO 2024). If yours is low, your doctor may increase your iron or give it through a drip, and test again after a month.', 'हर मुलाक़ात में Hb जाँचा जाता है। गर्भावस्था में 11 से कम Hb को डॉक्टर ख़ून की कमी (anaemia) मानते हैं (हफ़्ते 14–27 में 10.5 से कम, WHO 2024)। कम हो तो डॉक्टर iron बढ़ा सकती हैं या drip से दे सकती हैं, और एक महीने बाद फिर जाँच होती है।'],
    tb_ifa: ['Iron-folic acid (IFA)', 'Iron-folic acid (IFA)'],
    tb_ca: ['Calcium', 'Calcium'],
    tb_ifa_s: ['IFA', 'IFA'],
    tb_week: ['Last 7 days', 'पिछले 7 दिन'],
    tb_tap: ['Tap a day to tick it, tap again to untick.', 'टिक करने के लिए दिन पर टैप करें, हटाने के लिए फिर टैप करें।'],
    tb_count: ['{k}: {n} of the last 7 days', '{k}: पिछले 7 में से {n} दिन'],
    tb_total: ['Days ticked in all: IFA {a}, calcium {b}', 'कुल टिक किए दिन: IFA {a}, calcium {b}'],
    tb_how: ['IFA: one red tablet a day from the 4th month, for at least 180 days, with water or lemon water, about 2 hours after a meal. Calcium: one tablet with lunch and one with dinner, from 14 weeks until 6 months after the birth. Never take calcium and iron together, and keep tea and coffee away from the iron tablet.', 'IFA: चौथे महीने से रोज़ एक लाल गोली, कम से कम 180 दिन, सादे पानी या नींबू पानी के साथ, खाने के लगभग 2 घंटे बाद। Calcium: एक गोली दोपहर के खाने के साथ और एक रात के खाने के साथ, 14 हफ़्ते से डिलीवरी के 6 महीने बाद तक। calcium और iron कभी एक साथ न लें, और iron की गोली के आसपास चाय-कॉफ़ी न लें।'],
    tb_side: ["Black stools are normal with iron. If it makes you feel sick, take it after a meal or at bedtime. For constipation: more water, fibre and walking. Don't stop; tell your ANM if it bothers you.", 'iron से मल काला होना सामान्य है। जी मिचलाए तो खाने के बाद या सोते समय लें। क़ब्ज़ हो तो ज़्यादा पानी, फ़ाइबर और टहलना। गोली बंद न करें; परेशानी हो तो ANM को बताएँ।'], tb_side_doc: ['Black stools are normal with iron. If it makes you feel sick, take it after a meal or at bedtime. For constipation: more water, fibre and walking. Don\'t stop; tell your doctor if it bothers you.', 'iron से मल काला होना सामान्य है। जी मिचलाए तो खाने के बाद या सोते समय लें। क़ब्ज़ हो तो ज़्यादा पानी, फ़ाइबर और टहलना। गोली बंद न करें; परेशानी हो तो डॉक्टर को बताएँ।'],
    tb_rem: ['Daily reminder for both tablets', 'दोनों गोलियों का रोज़ का रिमाइंडर'],
    tb_rem_ca: ['Daily reminder for calcium', 'calcium का रोज़ का रिमाइंडर'],
    tb_iron: ['Iron tablets: 180-day count, reminder and help', 'आयरन की गोलियाँ: 180 दिन की गिनती, रिमाइंडर और मदद'],
    tb_iron_on: ['Your iron plan and its reminder', 'आपका आयरन प्लान और उसका रिमाइंडर'],
    tb_rem_on: ['Reminder on', 'रिमाइंडर चालू'],
    tb_rem_off: ['Turn on', 'चालू करें'],
    tb_rem_done: ['Reminders set.', 'रिमाइंडर लग गए।'],
    tb_rem_gone: ['Reminders off.', 'रिमाइंडर बंद।'],

    /* MCP card */
    mcp_h: ['My MCP card', 'मेरा MCP card'], mcp_h_doc: ['My pregnancy card', 'मेरा प्रेग्नेंसी कार्ड'],
    mcp_p: ['Keep your paper Mother and Child Protection (MCP) card safe and take it to every visit. This copy stays only on your phone. It helps when the card is at home or lost.', 'काग़ज़ वाला माँ और बच्चे का सुरक्षा कार्ड (MCP card) सँभालकर रखें और हर मुलाक़ात में ले जाएँ। यह कॉपी सिर्फ़ आपके फ़ोन में रहती है। कार्ड घर पर हो या खो जाए, तब काम आती है।'], mcp_p_doc: ['Keep your hospital\'s pregnancy card or file safe and take it to every visit. This copy stays only on your phone. It helps when the card is at home or lost.', 'अस्पताल का प्रेग्नेंसी कार्ड या फ़ाइल सँभालकर रखें और हर मुलाक़ात में ले जाएँ। यह कॉपी सिर्फ़ आपके फ़ोन में रहती है। कार्ड घर पर हो या खो जाए, तब काम आती है।'],
    mcp_reg: ['Registration', 'पंजीकरण'],
    mcp_rch: ['RCH ID / registration number', 'RCH ID / पंजीकरण नंबर'],
    mcp_rch_n: ['Your ANM writes this on the card when she registers your pregnancy on the RCH portal.', 'ANM जब RCH portal पर आपका गर्भ दर्ज करती हैं, तब यह नंबर कार्ड पर लिखती हैं।'], mcp_rch_n_doc: ['Only if your pregnancy is registered on the government RCH portal (by an ANM or a hospital).', 'तभी, जब आपका गर्भ सरकारी RCH portal पर दर्ज हो (ANM या अस्पताल ने किया हो)।'],
    mcp_regd: ['Registered on', 'पंजीकरण की तारीख़'],
    mcp_bg: ['Blood group and Rh', 'Blood group और Rh'],
    mcp_bg_unk: ['Not known yet', 'अभी पता नहीं'],
    mcp_bg1: ['Blood group', 'Blood group'],
    mcp_rh: ['Rh', 'Rh'],
    mcp_rhneg: ['Rh negative: your doctor may advise an anti-D injection in pregnancy or after the birth. Tell every hospital you are Rh negative.', 'Rh negative: डॉक्टर गर्भावस्था में या डिलीवरी के बाद anti-D इंजेक्शन की सलाह दे सकती हैं। हर अस्पताल को बताएँ कि आप Rh negative हैं।'],
    mcp_edd: ['Expected date of delivery (EDD)', 'डिलीवरी की अनुमानित तारीख़ (EDD)'],
    mcp_edd_b: ['Fill from my dates', 'मेरी तारीख़ों से भरें'],
    mcp_edd_n: ['Use the date written on your card. Your last period plus 280 days gives a rough date.', 'कार्ड पर लिखी तारीख़ डालें। पिछले पीरियड में 280 दिन जोड़ने से मोटा अंदाज़ा मिलता है।'],
    mcp_td: ['Td injections', 'Td के टीके'],
    mcp_td1: ['Td-1, early in pregnancy', 'Td-1, गर्भ के शुरू में'],
    mcp_td2: ['Td-2, 4 weeks after Td-1', 'Td-2, Td-1 के 4 हफ़्ते बाद'],
    mcp_tdb: ['Or Td booster (if you had 2 doses in a pregnancy in the last 3 years)', 'या Td booster (अगर पिछले 3 साल में किसी गर्भ में 2 खुराक ली हों)'],
    mcp_anc: ['Check-up (ANC) visits', 'जाँच (ANC) की मुलाक़ातें'],
    mcp_anc_add: ['Add visit', 'मुलाक़ात जोड़ें'],
    mcp_anc_n: ['{n} visits written', '{n} मुलाक़ातें लिखी हैं'],
    mcp_anc_win: ['At least 4 visits: before 12 weeks, at 14–26, 28–34 and 36–40 weeks.', 'कम से कम 4 मुलाक़ातें: 12 हफ़्ते से पहले, 14–26, 28–34 और 36–40 हफ़्ते पर।'],
    mcp_anc_wk: ['about week {n}', 'लगभग हफ़्ता {n}'],
    mcp_hb: ['Hb results', 'Hb के नतीजे'],
    mcp_bpr: ['BP readings', 'BP की readings'],
    mcp_fromlogs: ['From your logs.', 'आपके रिकॉर्ड से।'],
    mcp_addlogs: ['Add in my logs', 'रिकॉर्ड में जोड़ें'],
    mcp_risk: ['What your ANM marked', 'आपकी ANM ने क्या निशान लगाया'], mcp_risk_doc: ['What your doctor marked', 'आपकी डॉक्टर ने क्या निशान लगाया'],
    mcp_risk_p: ['Tick what is marked on your card. This is only a copy; it does not change your care.', 'जो आपके कार्ड पर निशान है, वही टिक करें। यह सिर्फ़ कॉपी है; इससे इलाज नहीं बदलता।'],
    r_hr: ['Marked as a high-risk pregnancy', 'high-risk गर्भ का निशान'],
    r_bp: ['High BP', 'ऊँचा BP'],
    r_an: ['Severe anaemia (Hb under 7)', 'ख़ून की गंभीर कमी (Hb 7 से कम)'],
    r_gdm: ['Sugar in pregnancy, or diabetes', 'गर्भावस्था में sugar, या diabetes'],
    r_cs: ['Earlier C-section or womb surgery', 'पहले हुआ ऑपरेशन (C-section) या गर्भाशय की सर्जरी'],
    r_tw: ['Twins or more', 'जुड़वाँ या ज़्यादा बच्चे'],
    r_prev: ['Problems in an earlier pregnancy (bleeding, fits, high BP, loss)', 'पिछले गर्भ में दिक़्क़त (ब्लीडिंग, दौरे, ऊँचा BP, गर्भ का नुक़सान)'],
    r_age: ['Age under 19 or over 35', 'उम्र 19 से कम या 35 से ज़्यादा'],
    r_oth: ['Something else', 'कुछ और'],
    less_b: ['Baby moving less? Get help', 'बच्चे की हलचल कम है? मदद लें'],   /* Version 39.34: the pregnancy card's button on Home (core) */
    r_note: ['Note (what the ANM wrote)', 'नोट (ANM ने क्या लिखा)'], r_note_doc: ['Note (what the doctor wrote)', 'नोट (डॉक्टर ने क्या लिखा)'],
    r_marked: ['High-risk pregnancies are usually delivered at a district hospital or medical college. Ask your ANM which hospital, and plan transport early.', 'high-risk गर्भ में डिलीवरी आम तौर पर ज़िला अस्पताल या मेडिकल कॉलेज में होती है। ANM से पूछें कौन सा अस्पताल, और गाड़ी का इंतज़ाम पहले से करें।'], r_marked_doc: ['High-risk pregnancies are usually delivered at a hospital equipped for them. Ask your gynaecologist which hospital, and plan transport early.', 'high-risk गर्भ में डिलीवरी आम तौर पर ऐसे अस्पताल में होती है जहाँ इसकी पूरी सुविधा हो। अपनी गायनेकोलॉजिस्ट से पूछें कौन सा अस्पताल, और गाड़ी का इंतज़ाम पहले से करें।'],
    mcp_save: ['Save card', 'कार्ड सेव करें'],
    mcp_none: ['Not written yet', 'अभी नहीं लिखा'],

    /* symptoms */
    sy_h: ['Common discomforts', 'आम तकलीफ़ें'],
    sy_p: ['Most of these are a normal part of pregnancy. Each one says what helps and when to see a doctor. Not a diagnosis.', 'इनमें से ज़्यादातर गर्भावस्था का सामान्य हिस्सा हैं। हर एक में लिखा है कि क्या मदद करता है और डॉक्टर को कब दिखाएँ। यह diagnosis नहीं है।'],
    sy_helps: ['What helps', 'क्या मदद करता है'],
    sy_worry: ['When to see a doctor', 'डॉक्टर को कब दिखाएँ'],
    sy_src: ['Sources: ICMR antenatal care workflow 2025, MoHFW Anemia Mukt Bharat 2026, MCP card, NHS pregnancy guidance. Not a diagnosis.', 'स्रोत: ICMR का प्रसव-पूर्व देखभाल workflow 2025, MoHFW अनीमिया मुक्त भारत 2026, MCP card, NHS की गर्भावस्था गाइड। यह diagnosis नहीं है।'],

    /* diet */
    dt_h: ['Food in pregnancy', 'गर्भावस्था में खाना'],
    dt_p: ['A good Indian thali covers most of what you and your baby need. The IFA and calcium tablets fill the rest.', 'अच्छी भारतीय थाली से आपकी और बच्चे की ज़्यादातर ज़रूरतें पूरी होती हैं। बाक़ी कमी IFA और calcium की गोलियाँ पूरी करती हैं।'],
    dt_fast: ['Fasting in pregnancy', 'गर्भ में व्रत'],
    dt_src: ['Source: ICMR-NIN Dietary Guidelines for Indians, 2024. Amounts are a guide for an average woman; your doctor may change them.', 'स्रोत: ICMR-NIN, भारतीयों के लिए आहार गाइडलाइन 2024। मात्रा औसत महिला के लिए अंदाज़ा है; डॉक्टर इसे बदल सकती हैं।'],
    dt_link: ['Read the ICMR-NIN guidelines (PDF)', 'ICMR-NIN गाइडलाइन पढ़ें (PDF)'],
    dt_myths: ['Myths you may hear at home', 'घर में सुनी जाने वाली बातें'],

    /* home, summary */
    home_line: ['Week {n}: {s}', 'हफ़्ता {n}: {s}'],
    home_line2: ['Week {n}: what is new', 'हफ़्ता {n}: क्या नया है'],
    home_sub: ["Your baby, your body and this week's tip", 'आपका बच्चा, आपका शरीर और इस हफ़्ते का सुझाव'],
    sum_h: ['Pregnancy', 'गर्भावस्था'],
    sum_w: ['About week {n}', 'लगभग हफ़्ता {n}'],
    sum_wt: ['Weight: {v} kg ({d})', 'वज़न: {v} kg ({d})'],
    sum_bp: ['BP: {v} ({d})', 'BP: {v} ({d})'],
    sum_sug: ['Sugar, {k}: {v} mg/dL ({d})', 'Sugar, {k}: {v} mg/dL ({d})'],
    sum_hb: ['Hb: {v} g/dL ({d})', 'Hb: {v} g/dL ({d})'],
    sum_tab: ['Tablets, last 7 days: IFA {a}, calcium {b}', 'गोलियाँ, पिछले 7 दिन: IFA {a}, calcium {b}'],
    sum_rch: ['MCP card: blood group {b}, EDD {e}', 'MCP card: blood group {b}, EDD {e}'], sum_rch_doc: ['Pregnancy card: blood group {b}, EDD {e}', 'प्रेग्नेंसी कार्ड: blood group {b}, EDD {e}'],
    sum_scan: ['from the scan report due date', 'scan रिपोर्ट की डिलीवरी तारीख़ से'], sum_lmp: ['from the last period', 'पिछले पीरियड से'],
    rh_pos: ['Rh positive (+)', 'Rh पॉज़िटिव (+)'], rh_neg: ['Rh negative (−)', 'Rh नेगेटिव (−)'],
    u_mm: ['mm', 'मिमी'], u_cm: ['cm', 'सेमी'], u_g: ['g', 'ग्राम'], u_kg: ['kg', 'किलो']
  };
  const strings = { en: {}, hi: {} };
  Object.keys(P).forEach((k) => { strings.en['preg_' + k] = P[k][0]; strings.hi['preg_' + k] = P[k][1]; });
  const T = (k) => t('preg_' + k);
  const TF = (k, o) => tf('preg_' + k, o);

  /* ---------- week-by-week content (weeks counted from the last period) ----------
     s = size, c = comparison, b = baby, y = her body, tip = one practical tip, k = tip kind, go = optional link, scan = scan week.
     Lengths (weeks 4–13): crown-rump length, Robinson formula at the start of the week.
     Weights (weeks 14–40): WHO fetal growth charts (Kiserud 2017), 50th percentile; 41–42: median birth weight in the same study. */
  const W = {
    4: { s: { en: 'Under 1 mm', hi: '1 मिमी से कम' }, c: { en: 'Smaller than a khaskhas (poppy) seed', hi: 'खसखस के दाने से भी छोटा' },
      b: { en: 'The pregnancy is a tiny ball of cells settling into the lining of your womb. Some of these cells are already starting to make the placenta.', hi: 'गर्भ अभी कोशिकाओं का एक छोटा सा गोला है, जो गर्भाशय की परत में जगह बना रहा है। इनमें से कुछ कोशिकाएँ आँवल (placenta) बनाने लगी हैं।' },
      y: { en: 'Your period is due around now. Your breasts may feel sore and you may feel tired. A home pregnancy test can turn positive from about the day your period is missed.', hi: 'पीरियड आने का समय लगभग यही है। स्तनों में दर्द और थकान लग सकती है। पीरियड मिस होने के दिन के आसपास से घर का pregnancy test positive आ सकता है।' },
      tip: { en: "Take folic acid 400 mcg once a day until the end of the third month. It protects the baby's brain and spine. Your ANM or health centre gives it free.", hi: 'तीसरे महीने के अंत तक रोज़ एक बार folic acid 400 mcg लें। यह बच्चे के दिमाग़ और रीढ़ की रक्षा करता है। आपकी ANM या स्वास्थ्य केंद्र इसे मुफ़्त देते हैं।', doc: { en: 'Take folic acid 400 mcg once a day until the end of the third month. It protects the baby\'s brain and spine.', hi: 'तीसरे महीने के अंत तक रोज़ एक बार folic acid 400 mcg लें। यह बच्चे के दिमाग़ और रीढ़ की रक्षा करता है।' } }, k: 'tablet' },
    5: { s: { en: '1–2 mm', hi: '1–2 मिमी' }, c: { en: 'About the size of a rai (mustard) seed', hi: 'राई के दाने जितना' },
      b: { en: 'The brain, spine and heart are starting to form. The heart begins as a simple tube that soon starts to beat.', hi: 'दिमाग़, रीढ़ और दिल बनने शुरू हो गए हैं। दिल पहले एक सीधी नली जैसा होता है, जो जल्दी ही धड़कने लगता है।' },
      y: { en: 'Nausea, needing to pee more often and tiredness often start around now. Some women feel nothing yet, and that is normal too.', hi: 'जी मिचलाना, बार-बार पेशाब आना और थकान अक्सर इसी समय शुरू होते हैं। कुछ महिलाओं को अभी कुछ महसूस नहीं होता, यह भी सामान्य है।' },
      tip: { en: 'Tell your ASHA or ANM you are pregnant and register early, before 12 weeks. You get your MCP card, an RCH number and free check-ups.', hi: 'अपनी ASHA या ANM को बताएँ कि आप गर्भवती हैं और जल्दी, 12 हफ़्ते से पहले, पंजीकरण कराएँ। आपको MCP card, RCH नंबर और मुफ़्त जाँचें मिलेंगी।', doc: { en: 'Book your first check-up with a gynaecologist early, before 12 weeks. Registering with an ASHA or ANM is free too, and gives you an MCP card and an RCH number.', hi: 'जल्दी, 12 हफ़्ते से पहले, गायनेकोलॉजिस्ट से पहली जाँच करवाएँ। ASHA या ANM के पास पंजीकरण भी मुफ़्त है, और उससे MCP card और RCH नंबर मिलता है।' } }, k: 'visit', go: 'preg-mcp' },
    6: { s: { en: 'About 5 mm', hi: 'लगभग 5 मिमी' }, c: { en: 'Like a grain of masoor dal', hi: 'मसूर दाल के दाने जितना' },
      b: { en: 'Small buds that will become arms and legs appear. On a scan done through the vagina, the heartbeat may show as a tiny flicker from about now.', hi: 'छोटे उभार दिखते हैं जो आगे चलकर हाथ और पैर बनेंगे। योनि के रास्ते होने वाले scan में अब से दिल की धड़कन एक छोटी सी टिमटिमाहट जैसी दिख सकती है।' },
      y: { en: 'Morning sickness can come at any time of day. Small, plain meals every 2–3 hours and sipping water often help.', hi: 'मॉर्निंग सिकनेस दिन में कभी भी हो सकती है। हर 2–3 घंटे में थोड़ा और सादा खाना, और बार-बार घूँट-घूँट पानी पीना मदद करता है।' },
      tip: { en: "Can't keep food or water down for 24 hours, very dark urine, or feeling faint: see a doctor today. Severe vomiting can be treated.", hi: '24 घंटे तक खाना या पानी न टिके, पेशाब बहुत गहरे रंग का हो, या चक्कर जैसा लगे: आज ही डॉक्टर को दिखाएँ। तेज़ उल्टी का इलाज होता है।' }, k: 'warn', go: 'preg-symptoms', scan: true },
    7: { s: { en: '1 cm', hi: '1 सेमी' }, c: { en: 'Like a kabuli chana', hi: 'काबुली चने जितना' },
      b: { en: 'The face is starting to form, with dark spots where the eyes will be. The brain is growing fast.', hi: 'चेहरा बनना शुरू हो गया है, जहाँ आँखें होंगी वहाँ गहरे बिंदु दिखते हैं। दिमाग़ तेज़ी से बढ़ रहा है।' },
      y: { en: 'Your womb is growing, but your belly will not show yet. Feeling weepy or low on some days is common.', hi: 'गर्भाशय बढ़ रहा है, पर पेट अभी नहीं दिखेगा। किसी दिन रोना आना या मन उदास रहना आम है।' },
      tip: { en: 'Do not start or stop any medicine on your own. If you take tablets for thyroid, fits, BP or sugar, tell your doctor this week that you are pregnant.', hi: 'कोई भी दवा अपने आप शुरू या बंद न करें। अगर आप थायरॉइड, दौरे (fits), BP या sugar की दवा लेती हैं, तो इसी हफ़्ते डॉक्टर को बताएँ कि आप गर्भवती हैं।' }, k: 'tablet' },
    8: { s: { en: '1.6 cm', hi: '1.6 सेमी' }, c: { en: 'Like a rajma bean', hi: 'राजमा के दाने जितना' },
      b: { en: 'Arms and legs are getting longer, and the hands and feet are taking shape. The lungs are starting to form.', hi: 'हाथ-पैर लंबे हो रहे हैं और हथेलियाँ व पंजे आकार ले रहे हैं। फेफड़े बनने लगे हैं।' },
      y: { en: 'Your breasts may feel fuller, with the veins showing more. Constipation and wind can start now.', hi: 'स्तन भरे हुए लग सकते हैं और नसें ज़्यादा दिख सकती हैं। क़ब्ज़ और गैस अब शुरू हो सकती है।' },
      tip: { en: 'Bleeding, or pain low on one side with dizziness or fainting: call 112 now. In early pregnancy this can mean a pregnancy outside the womb.', hi: 'ब्लीडिंग, या पेट के निचले हिस्से में एक तरफ़ दर्द के साथ चक्कर या बेहोशी: अभी 112 पर कॉल करें। शुरुआती गर्भ में इसका मतलब गर्भाशय के बाहर ठहरा गर्भ हो सकता है।' }, k: 'warn', go: 'help' },
    9: { s: { en: '2.4 cm', hi: '2.4 सेमी' }, c: { en: 'Like an angoor (grape)', hi: 'अंगूर जितना' },
      b: { en: 'The toes are now visible, and the main organs keep developing.', hi: 'पैरों की उँगलियाँ अब दिखने लगी हैं, और मुख्य अंग बनते जा रहे हैं।' },
      y: { en: 'Tiredness can be strong in these weeks. Rest during the day when you can; the MCP card advises about 2 hours.', hi: 'इन हफ़्तों में थकान बहुत लग सकती है। जब हो सके दिन में आराम करें; MCP card दिन में लगभग 2 घंटे आराम की सलाह देता है।', doc: { en: 'Tiredness can be strong in these weeks. Rest during the day when you can; about 2 hours is often advised.', hi: 'इन हफ़्तों में थकान बहुत लग सकती है। जब हो सके दिन में आराम करें; दिन में लगभग 2 घंटे आराम की सलाह दी जाती है।' } },
      tip: { en: 'At your first visit, ask for the free tests at government centres: haemoglobin, blood group, urine, sugar (the 75 g test), HIV, syphilis and hepatitis B. Ask for the results to be written in your MCP card.', hi: 'पहली मुलाक़ात में सरकारी केंद्र पर ये मुफ़्त जाँचें माँगें: हीमोग्लोबिन, blood group, पेशाब, sugar (75 g वाली जाँच), HIV, syphilis और hepatitis B। नतीजे अपने MCP card में लिखवाएँ।', doc: { en: 'At your first visit, ask your gynaecologist about these tests: haemoglobin, blood group, urine, sugar (the 75 g test), HIV, syphilis and hepatitis B. Keep your reports together in one file.', hi: 'पहली मुलाक़ात में अपनी गायनेकोलॉजिस्ट से इन जाँचों के बारे में पूछें: हीमोग्लोबिन, blood group, पेशाब, sugar (75 g वाली जाँच), HIV, syphilis और hepatitis B। अपनी सारी reports एक फ़ाइल में रखें।' } }, k: 'visit', go: 'preg-mcp' },
    10: { s: { en: '3.3 cm', hi: '3.3 सेमी' }, c: { en: 'Like an amla', hi: 'आँवले जितना' },
      b: { en: 'From this week your baby is called a fetus. The eyelids and the outer ears are taking shape.', hi: 'इस हफ़्ते से बच्चे को भ्रूण (fetus) कहते हैं। पलकें और बाहर के कान आकार ले रहे हैं।' },
      y: { en: 'Your waist may start to thicken. Many women still feel sick; for most it eases by 16–20 weeks.', hi: 'कमर थोड़ी मोटी लगने लग सकती है। कई महिलाओं को अभी भी जी मिचलाता है; ज़्यादातर में यह 16–20 हफ़्ते तक ठीक हो जाता है।' },
      tip: { en: 'Td injection, free: the first dose early in pregnancy, the second 4 weeks later. If you had two doses in a pregnancy in the last 3 years, one booster is enough.', hi: 'Td का टीका, मुफ़्त: पहली खुराक गर्भ के शुरू में, दूसरी 4 हफ़्ते बाद। अगर पिछले 3 साल में किसी गर्भ में दो खुराक ली थीं, तो एक booster काफ़ी है।', doc: { en: 'Td injection: the first dose early in pregnancy, the second 4 weeks later, at your check-ups. If you had two doses in a pregnancy in the last 3 years, one booster is enough.', hi: 'Td का टीका: पहली खुराक गर्भ के शुरू में, दूसरी 4 हफ़्ते बाद, आपकी जाँच के समय। अगर पिछले 3 साल में किसी गर्भ में दो खुराक ली थीं, तो एक booster काफ़ी है।' } }, k: 'tablet', go: 'preg-mcp' },
    11: { s: { en: '4.4 cm', hi: '4.4 सेमी' }, c: { en: 'Like a nimbu (lime)', hi: 'नींबू जितना' },
      b: { en: 'The face is becoming well formed and tiny nails are starting to grow. Your baby can open and close its hands.', hi: 'चेहरा साफ़ बनता जा रहा है और छोटे-छोटे नाख़ून उगने लगे हैं। बच्चा मुट्ठी खोल और बंद कर सकता है।' },
      y: { en: 'You may get headaches, or feel light-headed when you stand up quickly. Get up slowly and drink enough water.', hi: 'सिरदर्द हो सकता है, या जल्दी खड़े होने पर सिर हल्का लग सकता है। धीरे उठें और भरपूर पानी पिएँ।' },
      tip: { en: "Some doctors advise a scan between 11 and 14 weeks to check the due date and the baby's growth. Ask your doctor whether you need one.", hi: 'कुछ डॉक्टर 11 से 14 हफ़्ते के बीच scan की सलाह देते हैं, ताकि डिलीवरी की तारीख़ और बच्चे की बढ़त जाँची जा सके। डॉक्टर से पूछें कि आपको इसकी ज़रूरत है या नहीं।' }, k: 'scan', scan: true },
    12: { s: { en: '5.6 cm', hi: '5.6 सेमी' }, c: { en: 'Like a chiku', hi: 'चीकू जितना' },
      b: { en: 'All the main body parts are in place. From now on they grow and mature. Your baby moves a lot, though you cannot feel it yet.', hi: 'शरीर के सभी मुख्य हिस्से बन चुके हैं। अब वे बढ़ेंगे और पक्के होंगे। बच्चा ख़ूब हिलता है, पर अभी आपको महसूस नहीं होगा।' },
      y: { en: 'The top of your womb can now just be felt above the pubic bone, low in your belly.', hi: 'अब गर्भाशय का ऊपरी हिस्सा पेट के बिल्कुल नीचे, जघन हड्डी (pubic bone) के ठीक ऊपर महसूस हो सकता है।' },
      tip: { en: 'Ask your ASHA or Anganwadi worker about PMMVY and JSY scheme money, and which papers you need. Registering early makes claiming easier.', hi: 'अपनी ASHA या आंगनवाड़ी कार्यकर्ता से PMMVY और JSY योजना के पैसे के बारे में पूछें, और कौन से काग़ज़ चाहिए। जल्दी पंजीकरण से पैसा लेना आसान होता है।' }, k: 'scheme', go: 'access-schemes-preg' },
    13: { s: { en: '7 cm', hi: '7 सेमी' }, c: { en: 'Like a matar ki phali (pea pod)', hi: 'मटर की फली जितना' },
      b: { en: "Your baby can make a fist, and the face looks more and more like a baby's face. Growth is quick from now on.", hi: 'बच्चा मुट्ठी बाँध सकता है और चेहरा अब बच्चे के चेहरे जैसा दिखने लगा है। अब से बढ़त तेज़ होगी।' },
      y: { en: 'The first three months end this week. For many women sickness and tiredness ease over the next few weeks.', hi: 'इस हफ़्ते पहले तीन महीने पूरे होते हैं। कई महिलाओं में आने वाले हफ़्तों में जी मिचलाना और थकान कम होने लगती है।' },
      tip: { en: "From the 4th month you get iron-folic acid (IFA) and calcium tablets free at your check-up. Collect a month's supply each time.", hi: 'चौथे महीने से जाँच के समय iron-folic acid (IFA) और calcium की गोलियाँ मुफ़्त मिलती हैं। हर बार एक महीने की गोलियाँ ले लें।', doc: { en: 'From the 4th month your doctor will prescribe iron and calcium tablets. Keep a month\'s supply at home.', hi: 'चौथे महीने से डॉक्टर iron और calcium की गोलियाँ लिखेंगी। घर पर एक महीने की गोलियाँ रखें।' } }, k: 'tablet', go: 'preg-logs' },
    14: { s: { en: '90 g', hi: '90 ग्राम' }, c: { en: 'As heavy as a small amrood (guava)', hi: 'छोटे अमरूद जितना भारी' },
      b: { en: 'Tiny nails are growing on the fingers. Your baby kicks and turns often, but is still too small for you to feel.', hi: 'उँगलियों पर छोटे नाख़ून बढ़ रहे हैं। बच्चा अक्सर लात मारता और घूमता है, पर अभी इतना छोटा है कि आपको पता नहीं चलेगा।' },
      y: { en: 'The middle three months begin. Many women feel more energy now, and the belly may begin to show.', hi: 'बीच के तीन महीने शुरू होते हैं। कई महिलाओं में अब ताक़त लौटती है, और पेट दिखना शुरू हो सकता है।' },
      tip: { en: 'Start one red IFA tablet a day now, for at least 180 days. Take it with water or lemon water, about 2 hours after a meal, and not with tea or the calcium tablet.', hi: 'अब से रोज़ एक लाल IFA गोली लें, कम से कम 180 दिन। इसे सादे पानी या नींबू पानी के साथ, खाने के लगभग 2 घंटे बाद लें, चाय या calcium की गोली के साथ नहीं।', doc: { en: 'Take the iron tablet your doctor prescribed. Take it with water or lemon water, about 2 hours after a meal, and not with tea or the calcium tablet.', hi: 'डॉक्टर की लिखी आयरन की गोली लें। इसे सादे पानी या नींबू पानी के साथ, खाने के लगभग 2 घंटे बाद लें, चाय या calcium की गोली के साथ नहीं।' } }, k: 'tablet', go: 'preg-logs' },
    15: { s: { en: '114 g', hi: '114 ग्राम' }, c: { en: 'As heavy as a big tamatar (tomato)', hi: 'बड़े टमाटर जितना भारी' },
      b: { en: 'The skin is thin, and fine soft hair is starting to grow over it. Your baby practises sucking movements.', hi: 'त्वचा पतली है और उस पर बारीक मुलायम बाल उगने लगे हैं। बच्चा चूसने जैसी हरकतें करता है।' },
      y: { en: 'With more blood flowing, you may get a blocked nose or small nosebleeds. For a nosebleed, sit up, lean forward and pinch the soft part of your nose for 10 minutes.', hi: 'ख़ून का बहाव बढ़ने से नाक बंद हो सकती है या हल्की नकसीर आ सकती है। नकसीर आए तो सीधी बैठें, आगे झुकें और नाक के नरम हिस्से को 10 मिनट दबाकर रखें।' },
      tip: { en: 'Calcium: one tablet with lunch and one with dinner, from 14 weeks until 6 months after the birth. Never take calcium and iron together, or calcium on an empty stomach.', hi: 'Calcium: एक गोली दोपहर के खाने के साथ और एक रात के खाने के साथ, 14 हफ़्ते से डिलीवरी के 6 महीने बाद तक। calcium और iron कभी एक साथ न लें, और calcium ख़ाली पेट न लें।', doc: { en: 'Take the calcium your doctor prescribed, with meals. Never take calcium and iron together, or calcium on an empty stomach.', hi: 'डॉक्टर का लिखा calcium खाने के साथ लें। calcium और iron कभी एक साथ न लें, और calcium ख़ाली पेट न लें।' } }, k: 'tablet', go: 'preg-logs' },
    16: { s: { en: '144 g', hi: '144 ग्राम' }, c: { en: 'As heavy as a seb (apple)', hi: 'सेब जितना भारी' },
      b: { en: 'Your baby kicks, turns and stretches. The bones are getting firmer.', hi: 'बच्चा लात मारता है, घूमता है और अंगड़ाई लेता है। हड्डियाँ मज़बूत हो रही हैं।' },
      y: { en: 'The top of your womb is about a third of the way from the pubic bone to your navel. The first flutters of movement come between 16 and 24 weeks, often earlier if you have had a baby before.', hi: 'गर्भाशय का ऊपरी हिस्सा जघन हड्डी से नाभि तक की दूरी के लगभग एक-तिहाई पर है। बच्चे की पहली हल्की हलचल 16 से 24 हफ़्ते के बीच महसूस होती है, पहले बच्चा हो चुका हो तो अक्सर जल्दी।' },
      tip: { en: 'Your second check-up is due between 14 and 26 weeks. Ask for your BP, weight, Hb and urine to be checked and written in your MCP card.', hi: 'दूसरी जाँच 14 से 26 हफ़्ते के बीच होती है। BP, वज़न, Hb और पेशाब की जाँच कराएँ और MCP card में लिखवाएँ।', doc: { en: 'Your second check-up with your gynaecologist is due between 14 and 26 weeks. Ask for your BP, weight, Hb and urine to be checked, and keep your reports together in one file.', hi: 'गायनेकोलॉजिस्ट से दूसरी जाँच 14 से 26 हफ़्ते के बीच होती है। BP, वज़न, Hb और पेशाब की जाँच कराएँ, और अपनी reports एक फ़ाइल में रखें।' } }, k: 'visit', go: 'preg-mcp' },
    17: { s: { en: '179 g', hi: '179 ग्राम' }, c: { en: 'As heavy as an anaar (pomegranate)', hi: 'अनार जितना भारी' },
      b: { en: "Your baby's skin is still very thin. Growth is steady, and the baby turns and kicks often.", hi: 'बच्चे की त्वचा अभी बहुत पतली है। बढ़त बराबर चल रही है, और बच्चा अक्सर घूमता और लात मारता है।' },
      y: { en: 'As your womb grows you may feel short, sharp twinges low in the belly or at the sides when you move quickly. Sudden or severe pain is not normal.', hi: 'गर्भाशय बढ़ने से जल्दी हिलने पर पेट के नीचे या बग़ल में हल्की, चुभने वाली टीस उठ सकती है। अचानक या तेज़ दर्द सामान्य नहीं है।' },
      tip: { en: 'Severe belly pain, bleeding, or fluid leaking from the vagina: go to hospital now. Free ambulance: 102 or 108.', hi: 'पेट में तेज़ दर्द, ब्लीडिंग, या योनि से पानी रिसना: अभी अस्पताल जाएँ। मुफ़्त एम्बुलेंस: 102 या 108।' }, k: 'warn', go: 'help' },
    18: { s: { en: '222 g', hi: '222 ग्राम' }, c: { en: 'As heavy as a shakarkandi (sweet potato)', hi: 'शकरकंद जितना भारी' },
      b: { en: 'Your baby moves a lot and makes sucking movements. The nerves are developing quickly.', hi: 'बच्चा ख़ूब हिलता है और चूसने जैसी हरकतें करता है। नसें तेज़ी से बन रही हैं।' },
      y: { en: 'You may feel warmer than the people around you and sweat more. Your appetite is often better now.', hi: 'आपको आसपास के लोगों से ज़्यादा गर्मी लग सकती है और पसीना ज़्यादा आ सकता है। भूख अब अक्सर बेहतर रहती है।' },
      tip: { en: "The anomaly scan (level 2 scan) at 18–20 weeks looks at the baby's organs, spine and growth. Ask your ANM or doctor where to get it done.", hi: '18–20 हफ़्ते का anomaly scan (level 2 scan) बच्चे के अंग, रीढ़ और बढ़त देखता है। ANM या डॉक्टर से पूछें कि यह कहाँ होगा।', doc: { en: 'The anomaly scan (level 2 scan) at 18–20 weeks looks at the baby\'s organs, spine and growth. Your gynaecologist will tell you where to book it.', hi: '18–20 हफ़्ते का anomaly scan (level 2 scan) बच्चे के अंग, रीढ़ और बढ़त देखता है। आपकी गायनेकोलॉजिस्ट बताएँगी कि यह कहाँ बुक करना है।' } }, k: 'scan', scan: true },
    19: { s: { en: '272 g', hi: '272 ग्राम' }, c: { en: 'As heavy as an aam (mango)', hi: 'आम जितना भारी' },
      b: { en: 'Your baby can now hear and swallow. Your heartbeat and your voice reach the baby.', hi: 'बच्चा अब सुन सकता है और निगल सकता है। आपकी धड़कन और आपकी आवाज़ बच्चे तक पहुँचती है।' },
      y: { en: 'Your growing belly pulls on your back. Wear flat shoes and sit with your back supported.', hi: 'बढ़ता पेट कमर पर खिंचाव डालता है। सपाट चप्पल पहनें और कमर को सहारा देकर बैठें।' },
      tip: { en: 'Your weight is checked at every visit. If your weight was normal before pregnancy, the aim is to gain 10–12 kg in all; if you were overweight, about 5–9 kg.', hi: 'हर मुलाक़ात में वज़न जाँचा जाता है। गर्भ से पहले वज़न सामान्य था तो कुल 10–12 kg बढ़ना चाहिए; ज़्यादा था तो लगभग 5–9 kg।' }, k: 'visit', go: 'preg-logs', scan: true },
    20: { s: { en: '330 g', hi: '330 ग्राम' }, c: { en: 'As heavy as a big bharta baingan (brinjal)', hi: 'भरते वाले बड़े बैंगन जितना भारी' },
      b: { en: 'Halfway there. Your baby has times of moving and times of sleeping, and the kicks will get stronger.', hi: 'आधा सफ़र पूरा। बच्चे के हिलने और सोने के अलग-अलग समय होते हैं, और लातें मज़बूत होती जाएँगी।' },
      y: { en: 'The top of your womb is about two-thirds of the way to your navel. If this is your first baby, the first flutters often come around now.', hi: 'गर्भाशय का ऊपरी हिस्सा नाभि तक की दूरी के लगभग दो-तिहाई पर है। पहला बच्चा हो तो पहली हल्की हलचल अक्सर इसी समय महसूस होती है।' },
      tip: { en: 'From the 4th month you need about 350 extra calories a day, not double. That is roughly a roti with a bowl of dal and a glass of milk.', hi: 'चौथे महीने से रोज़ लगभग 350 calorie ज़्यादा चाहिए, दोगुना खाना नहीं। यह मोटे तौर पर एक रोटी, एक कटोरी दाल और एक गिलास दूध जितना है।' }, k: 'food', go: 'preg-diet', scan: true },
    21: { s: { en: '398 g', hi: '398 ग्राम' }, c: { en: 'As heavy as a big kheera (cucumber)', hi: 'बड़े खीरे जितना भारी' },
      b: { en: 'Your baby swallows some of the water around it, which helps the gut practise.', hi: 'बच्चा अपने आसपास का थोड़ा पानी निगलता है, जिससे आँतों का अभ्यास होता है।' },
      y: { en: 'You may notice a dark line down your belly and darker patches on your face. These are common and usually fade after the birth.', hi: 'पेट पर नीचे की ओर एक गहरी रेखा और चेहरे पर गहरे धब्बे दिख सकते हैं। ये आम हैं और आम तौर पर डिलीवरी के बाद हल्के पड़ जाते हैं।' },
      tip: { en: 'Sudden swelling of the face or hands: see a doctor today. With a bad headache or blurred vision: go to hospital now. These can be signs of high BP in pregnancy (pre-eclampsia).', hi: 'चेहरे या हाथों पर अचानक सूजन: आज ही डॉक्टर को दिखाएँ। साथ में तेज़ सिरदर्द या धुंधला दिखे: अभी अस्पताल जाएँ। ये गर्भावस्था में ऊँचे BP (pre-eclampsia) के संकेत हो सकते हैं।' }, k: 'warn', go: 'help' },
    22: { s: { en: '476 g', hi: '476 ग्राम' }, c: { en: 'As heavy as a small papita (papaya)', hi: 'छोटे पपीते जितना भारी' },
      b: { en: "Fine hair covers the skin, and eyebrows and eyelashes appear. A doctor can now hear the baby's heartbeat with a stethoscope.", hi: 'त्वचा पर बारीक बाल हैं, और भौंहें व पलकों के बाल आ गए हैं। डॉक्टर अब stethoscope से बच्चे की धड़कन सुन सकती हैं।' },
      y: { en: 'Your womb is close to your navel. Your feet may swell a little by evening; rest with them raised.', hi: 'गर्भाशय नाभि के पास पहुँच गया है। शाम तक पैरों में हल्की सूजन आ सकती है; पैर ऊपर रखकर आराम करें।' },
      tip: { en: "Keep taking IFA and calcium every day. Black stools are normal with iron. If iron upsets your stomach, take it at bedtime and tell your ANM; don't just stop.", hi: 'IFA और calcium रोज़ लेती रहें। iron से मल काला होना सामान्य है। iron से पेट ख़राब हो तो सोते समय लें और ANM को बताएँ; बस बंद न करें।', doc: { en: 'Keep taking iron and calcium every day. Black stools are normal with iron. If iron upsets your stomach, take it at bedtime and tell your doctor; don\'t just stop.', hi: 'iron और calcium रोज़ लेती रहें। iron से मल काला होना सामान्य है। iron से पेट ख़राब हो तो सोते समय लें और डॉक्टर को बताएँ; बस बंद न करें।' } }, k: 'tablet', go: 'preg-logs' },
    23: { s: { en: '565 g', hi: '565 ग्राम' }, c: { en: 'As heavy as a small lauki (bottle gourd)', hi: 'छोटी लौकी जितना भारी' },
      b: { en: 'Bone marrow starts making blood cells, and a little fat starts to build up under the skin.', hi: 'हड्डियों के अंदर का गूदा (bone marrow) ख़ून की कोशिकाएँ बनाने लगता है, और त्वचा के नीचे थोड़ी चर्बी जमने लगती है।' },
      y: { en: 'Your belly may tighten for a few seconds now and then, without pain. These practice tightenings are not labour. Regular, painful tightenings before 37 weeks mean going to hospital now.', hi: 'पेट कभी-कभी कुछ सेकंड के लिए बिना दर्द के सख़्त हो सकता है। यह अभ्यास वाला कसाव है, लेबर नहीं। 37 हफ़्ते से पहले नियमित और दर्द वाला कसाव हो तो अभी अस्पताल जाएँ।' },
      tip: { en: "PMSMA: a free check-up by a doctor on the 9th of every month at government health centres, in the middle and last three months. Try to go at least once.", hi: 'PMSMA: हर महीने की 9 तारीख़ को सरकारी स्वास्थ्य केंद्रों पर डॉक्टर की मुफ़्त जाँच, बीच और आख़िरी तीन महीनों में। कम से कम एक बार ज़रूर जाएँ।', doc: { en: 'PMSMA, a free check-up by a doctor on the 9th of every month at government health centres, is open to you too in the middle and last three months.', hi: 'PMSMA, यानी हर महीने की 9 तारीख़ को सरकारी स्वास्थ्य केंद्रों पर डॉक्टर की मुफ़्त जाँच, बीच और आख़िरी तीन महीनों में आपके लिए भी है।' } }, k: 'scheme' },
    24: { s: { en: '665 g', hi: '665 ग्राम' }, c: { en: 'As heavy as a small phool gobhi (cauliflower)', hi: 'छोटी फूलगोभी जितना भारी' },
      b: { en: 'The airways in the lungs are developing and fat is starting to build up. Your baby reacts to sounds and to your movements.', hi: 'फेफड़ों की साँस की नलियाँ बन रही हैं और चर्बी जमने लगी है। बच्चा आवाज़ों और आपकी हरकतों पर हिलकर जवाब देता है।' },
      y: { en: 'The top of your womb is at about the level of your navel. Backache, leg cramps and heartburn are common now.', hi: 'गर्भाशय का ऊपरी हिस्सा लगभग नाभि के बराबर है। अब कमर दर्द, पैरों में ऐंठन और सीने में जलन आम हैं।' },
      tip: { en: "Sugar test between 24 and 28 weeks: you drink 75 g glucose in water and your sugar is checked 2 hours later. You don't need to come fasting. 140 mg/dL or more: show your doctor this week.", hi: '24 से 28 हफ़्ते के बीच sugar की जाँच: 75 g glucose पानी में घोलकर पीती हैं और 2 घंटे बाद sugar जाँची जाती है। ख़ाली पेट आना ज़रूरी नहीं। 140 mg/dL या ज़्यादा: इसी हफ़्ते डॉक्टर को दिखाएँ।' }, k: 'visit', go: 'preg-logs' },
    25: { s: { en: '778 g', hi: '778 ग्राम' }, c: { en: 'As heavy as a patta gobhi (cabbage)', hi: 'पत्तागोभी जितना भारी' },
      b: { en: 'As fat builds up, the skin looks less wrinkled. The hands are fully formed and can grip.', hi: 'चर्बी जमने से त्वचा पर झुर्रियाँ कम दिखती हैं। हाथ पूरे बन चुके हैं और पकड़ सकते हैं।' },
      y: { en: 'Constipation and piles can bother you now. Drink over 2 litres a day and eat fibre: whole grains, dal, vegetables and fruit.', hi: 'अब क़ब्ज़ और बवासीर (piles) परेशान कर सकते हैं। रोज़ 2 लीटर से ज़्यादा पानी पिएँ और फ़ाइबर वाला खाना खाएँ: साबुत अनाज, दाल, सब्ज़ियाँ और फल।' },
      tip: { en: 'Hb is tested at every visit. If yours is low, your ANM may give 2 IFA tablets a day or iron through a drip. Hb under 7 needs a doctor the same day.', hi: 'हर मुलाक़ात में Hb जाँचा जाता है। कम हो तो ANM रोज़ 2 IFA गोलियाँ या drip से iron दे सकती हैं। Hb 7 से कम हो तो उसी दिन डॉक्टर को दिखाएँ।', doc: { en: 'Hb is tested at every visit. If yours is low, your doctor may increase your iron or give it through a drip. Hb under 7 needs a doctor the same day.', hi: 'हर मुलाक़ात में Hb जाँचा जाता है। कम हो तो डॉक्टर iron बढ़ा सकती हैं या drip से दे सकती हैं। Hb 7 से कम हो तो उसी दिन डॉक्टर को दिखाएँ।' } }, k: 'tablet', go: 'preg-logs' },
    26: { s: { en: '902 g', hi: '902 ग्राम' }, c: { en: 'As heavy as a big phool gobhi (cauliflower)', hi: 'बड़ी फूलगोभी जितना भारी' },
      b: { en: 'The eyes are well developed and your baby startles at loud sounds. Fingerprints are forming.', hi: 'आँखें अच्छी तरह बन गई हैं और तेज़ आवाज़ पर बच्चा चौंकता है। उँगलियों के निशान बन रहे हैं।' },
      y: { en: 'Sleep can get harder as your belly grows. A pillow between your knees and one under your belly helps.', hi: 'पेट बढ़ने के साथ नींद मुश्किल हो सकती है। घुटनों के बीच एक तकिया और पेट के नीचे एक तकिया मदद करता है।' },
      tip: { en: 'BP of 140/90 or more at any check: see a doctor today. 160/110 or more, or high BP with a bad headache or blurred vision: go to hospital now.', hi: 'किसी भी जाँच में BP 140/90 या ज़्यादा: आज ही डॉक्टर को दिखाएँ। 160/110 या ज़्यादा, या ऊँचे BP के साथ तेज़ सिरदर्द या धुंधला दिखना: अभी अस्पताल जाएँ।' }, k: 'warn', go: 'preg-logs' },
    27: { s: { en: '1.0 kg', hi: '1.0 किलो' }, c: { en: 'As heavy as a 1 kg packet of chawal (rice)', hi: '1 किलो चावल के पैकेट जितना भारी' },
      b: { en: 'The brain is growing quickly, and the eyelids can open and close.', hi: 'दिमाग़ तेज़ी से बढ़ रहा है, और पलकें खुल-बंद हो सकती हैं।' },
      y: { en: 'You may get breathless on stairs as the womb presses upward. Breathless at rest: see a doctor today. Sudden breathlessness or chest pain: call 112 now.', hi: 'गर्भाशय ऊपर की ओर दबाता है, इसलिए सीढ़ियों पर साँस फूल सकती है। आराम करते हुए साँस फूले: आज ही डॉक्टर को दिखाएँ। अचानक साँस फूले या सीने में दर्द हो: अभी 112 पर कॉल करें।' },
      tip: { en: 'Your third check-up is due between 28 and 34 weeks. Take your MCP card and these logs with you.', hi: 'तीसरी जाँच 28 से 34 हफ़्ते के बीच होती है। अपना MCP card और यह रिकॉर्ड साथ ले जाएँ।', doc: { en: 'Your third check-up is due between 28 and 34 weeks. Take your reports and these logs with you.', hi: 'तीसरी जाँच 28 से 34 हफ़्ते के बीच होती है। अपनी reports और यह रिकॉर्ड साथ ले जाएँ।' } }, k: 'visit', go: 'preg-mcp' },
    28: { s: { en: '1.2 kg', hi: '1.2 किलो' }, c: { en: 'As heavy as a nariyal (coconut) with its husk', hi: 'छिलके वाले नारियल जितना भारी' },
      b: { en: 'The lungs start making surfactant, which they need to breathe after birth. Your baby can open its eyes.', hi: 'फेफड़े surfactant बनाने लगते हैं, जो जन्म के बाद साँस लेने के लिए ज़रूरी है। बच्चा आँखें खोल सकता है।' },
      y: { en: 'The last three months begin. From now, go to sleep on your side, left or right; it is safer for the baby than lying on your back. If you wake up on your back, just turn over.', hi: 'आख़िरी तीन महीने शुरू होते हैं। अब से करवट लेकर सोएँ, बाईं या दाईं; यह पीठ के बल लेटने से बच्चे के लिए ज़्यादा सुरक्षित है। नींद खुले और आप पीठ के बल हों, तो बस करवट ले लें।' },
      tip: { en: "Get to know your baby's usual movements from now. Fewer movements than usual: call or go to hospital the same day, not the next morning.", hi: 'अब से बच्चे की आम हलचल पहचानें। आम दिनों से कम हलचल हो: उसी दिन अस्पताल को फ़ोन करें या जाएँ, अगली सुबह तक नहीं।' }, k: 'warn', go: 'pregtools-kicks' },
    29: { s: { en: '1.4 kg', hi: '1.4 किलो' }, c: { en: 'As heavy as an ananas (pineapple)', hi: 'अनानास जितना भारी' },
      b: { en: 'Your baby is gaining weight fast now. Some kicks may be strong enough to see from outside.', hi: 'बच्चे का वज़न अब तेज़ी से बढ़ रहा है। कुछ लातें इतनी ज़ोर की हो सकती हैं कि बाहर से दिखें।' },
      y: { en: "Heartburn is common now. Eat smaller meals, don't lie down soon after eating, and raise your head at night with an extra pillow.", hi: 'अब सीने में जलन आम है। थोड़ा-थोड़ा खाएँ, खाने के तुरंत बाद न लेटें, और रात को एक तकिया ज़्यादा लगाकर सिर ऊँचा रखें।' },
      tip: { en: 'JSSK: birth at a government hospital is free and cashless, including a C-section, medicines, tests, blood, food during your stay and transport.', hi: 'JSSK: सरकारी अस्पताल में डिलीवरी मुफ़्त और बिना नक़द के होती है, ऑपरेशन, दवाएँ, जाँचें, ख़ून, भर्ती के दौरान खाना और आना-जाना समेत।' }, k: 'scheme', go: 'access-schemes-preg' },
    30: { s: { en: '1.5 kg', hi: '1.5 किलो' }, c: { en: 'As heavy as a big lauki (bottle gourd)', hi: 'बड़ी लौकी जितना भारी' },
      b: { en: 'The brain keeps growing fast. You may feel the baby hiccup: small jerks that come in a steady rhythm.', hi: 'दिमाग़ तेज़ी से बढ़ता जा रहा है। बच्चे की हिचकी महसूस हो सकती है: एक लय में आने वाले छोटे झटके।' },
      y: { en: 'You may feel tired again and need to pee more often. Leaking a little urine when you cough or laugh is common.', hi: 'फिर से थकान लग सकती है और बार-बार पेशाब आ सकता है। खाँसने या हँसने पर थोड़ा पेशाब निकल जाना आम है।' },
      tip: { en: 'Food from the Anganwadi (take-home ration, and hot meals in some states) is free for pregnant women. Ask your Anganwadi worker if you are not getting it.', hi: 'गर्भवती महिलाओं के लिए आंगनवाड़ी का खाना (घर ले जाने वाला राशन, और कुछ राज्यों में पका खाना) मुफ़्त है। न मिल रहा हो तो आंगनवाड़ी कार्यकर्ता से पूछें।' }, k: 'food', go: 'preg-diet' },
    31: { s: { en: '1.7 kg', hi: '1.7 किलो' }, c: { en: 'As heavy as a kharbooza (muskmelon)', hi: 'ख़रबूज़े जितना भारी' },
      b: { en: 'The bones are getting harder, and your baby is storing iron and calcium for the first months after birth.', hi: 'हड्डियाँ सख़्त हो रही हैं, और बच्चा जन्म के बाद के पहले महीनों के लिए iron और calcium जमा कर रहा है।' },
      y: { en: 'Swollen feet and ankles by evening are common. Raise your feet when you sit. Sudden swelling of the face or hands: see a doctor today.', hi: 'शाम तक पैरों और टखनों में सूजन आम है। बैठते समय पैर ऊपर रखें। चेहरे या हाथों पर अचानक सूजन: आज ही डॉक्टर को दिखाएँ।' },
      tip: { en: 'Water leaking from the vagina, even a trickle, before labour pains: go to hospital now. Free ambulance 102 or 108.', hi: 'लेबर दर्द से पहले योनि से पानी रिसना, चाहे थोड़ा ही: अभी अस्पताल जाएँ। मुफ़्त एम्बुलेंस 102 या 108।' }, k: 'warn', go: 'help' },
    32: { s: { en: '1.9 kg', hi: '1.9 किलो' }, c: { en: 'As heavy as a 2 kg packet of atta', hi: '2 किलो आटे के पैकेट जितना भारी' },
      b: { en: 'Most of the growth from now is weight. Your baby curls up as space gets tighter, but should keep moving as much as usual.', hi: 'अब से ज़्यादातर बढ़त वज़न में होगी। जगह कम होने से बच्चा सिकुड़कर रहता है, पर हलचल आम दिनों जितनी ही होनी चाहिए।' },
      y: { en: 'The top of your womb is about two-thirds of the way from your navel to your breastbone.', hi: 'गर्भाशय का ऊपरी हिस्सा नाभि से छाती की हड्डी तक की दूरी के लगभग दो-तिहाई पर है।' },
      tip: { en: "Some doctors order a growth scan around now to check the baby's size and the water around the baby.", hi: 'कुछ डॉक्टर इस समय growth scan कराते हैं, ताकि बच्चे का आकार और उसके आसपास का पानी जाँचा जा सके।' }, k: 'scan', scan: true },
    33: { s: { en: '2.1 kg', hi: '2.1 किलो' }, c: { en: 'As heavy as a big papita (papaya)', hi: 'बड़े पपीते जितना भारी' },
      b: { en: 'The bones of the skull stay soft and can overlap a little, so the head can pass through at birth.', hi: 'सिर की हड्डियाँ नरम रहती हैं और थोड़ा एक-दूसरे पर खिसक सकती हैं, ताकि जन्म के समय सिर आसानी से निकल सके।' },
      y: { en: 'Pressure low in the pelvis and back pain may increase. Avoid lifting heavy things, and ask your ANM about gentle exercise.', hi: 'पेट के निचले हिस्से में दबाव और कमर दर्द बढ़ सकता है। भारी सामान न उठाएँ, और हल्की कसरत के बारे में ANM से पूछें।', doc: { en: 'Pressure low in the pelvis and back pain may increase. Avoid lifting heavy things, and ask your doctor about gentle exercise.', hi: 'पेट के निचले हिस्से में दबाव और कमर दर्द बढ़ सकता है। भारी सामान न उठाएँ, और हल्की कसरत के बारे में डॉक्टर से पूछें।' } },
      tip: { en: 'Make your birth plan now: which hospital, who will come with you, transport, some money, and a blood donor in case one is needed.', hi: 'अभी डिलीवरी की योजना बनाएँ: कौन सा अस्पताल, साथ कौन जाएगा, गाड़ी का इंतज़ाम, कुछ पैसे, और ज़रूरत पड़ने पर ख़ून देने वाला कोई।' }, k: 'visit', go: 'pregtools-bag' },
    34: { s: { en: '2.3 kg', hi: '2.3 किलो' }, c: { en: 'As heavy as a small kaddu (pumpkin)', hi: 'छोटे कद्दू जितना भारी' },
      b: { en: 'Your baby is putting on fat, which will help keep it warm after birth.', hi: 'बच्चे पर चर्बी चढ़ रही है, जो जन्म के बाद उसे गर्म रखने में मदद करेगी।' },
      y: { en: 'You may feel heavy, clumsy or short of breath. Rest during the day when you can, about 2 hours.', hi: 'भारीपन, बेढंगापन या साँस फूलना महसूस हो सकता है। जब हो सके दिन में लगभग 2 घंटे आराम करें।' },
      tip: { en: "Save your ASHA's number and the ambulance numbers (102, 108) in your phone, and tell your family which hospital you will go to.", hi: 'अपनी ASHA का नंबर और एम्बुलेंस के नंबर (102, 108) फ़ोन में सेव करें, और परिवार को बता दें कि किस अस्पताल जाना है।', doc: { en: 'Save your doctor\'s number and the ambulance numbers (102, 108) in your phone, and tell your family which hospital you will go to.', hi: 'अपनी डॉक्टर का नंबर और एम्बुलेंस के नंबर (102, 108) फ़ोन में सेव करें, और परिवार को बता दें कि किस अस्पताल जाना है।' } }, k: 'visit' },
    35: { s: { en: '2.5 kg', hi: '2.5 किलो' }, c: { en: 'As heavy as a small tarbooz (watermelon)', hi: 'छोटे तरबूज़ जितना भारी' },
      b: { en: 'Your baby weighs about 2.5 kg and has clear times of sleeping and waking.', hi: 'बच्चे का वज़न लगभग 2.5 kg है और उसके सोने-जागने के साफ़ समय हैं।' },
      y: { en: 'As the baby grows, you may manage less food at a time. Several small meals work better than three big ones.', hi: 'बच्चा बढ़ने से एक बार में कम खाना खा पाती हैं। तीन बड़े खानों से कई छोटे खाने बेहतर हैं।' },
      tip: { en: 'Fits, a severe headache, blurred vision or pain under the ribs: call 112 now. These can be signs of eclampsia, which needs a hospital at once.', hi: 'दौरे (fits), तेज़ सिरदर्द, धुंधला दिखना या पसलियों के नीचे दर्द: अभी 112 पर कॉल करें। ये eclampsia के संकेत हो सकते हैं, जिसमें तुरंत अस्पताल चाहिए।' }, k: 'warn', go: 'help' },
    36: { s: { en: '2.7 kg', hi: '2.7 किलो' }, c: { en: 'As heavy as a small kathal (jackfruit)', hi: 'छोटे कटहल जितना भारी' },
      b: { en: 'Most organs are ready. Many babies are head-down by now, but some turn later.', hi: 'ज़्यादातर अंग तैयार हैं। कई बच्चे अब तक सिर नीचे कर लेते हैं, पर कुछ बाद में घूमते हैं।' },
      y: { en: 'The top of your womb is close to your breastbone, so you may feel breathless. When the baby drops lower, breathing gets easier.', hi: 'गर्भाशय का ऊपरी हिस्सा छाती की हड्डी के पास है, इसलिए साँस फूल सकती है। जब बच्चा नीचे खिसकता है तो साँस लेना आसान हो जाता है।' },
      tip: { en: 'Your fourth check-up is due from 36 weeks. Pack your hospital bag: MCP card, ID, reports, clothes, pads, and clothes and a cap for the baby.', hi: 'चौथी जाँच 36 हफ़्ते से होती है। अस्पताल का बैग तैयार रखें: MCP card, पहचान पत्र, reports, कपड़े, pad, और बच्चे के कपड़े व टोपी।', doc: { en: 'Your fourth check-up is due from 36 weeks. Pack your hospital bag: ID, reports, clothes, pads, and clothes and a cap for the baby.', hi: 'चौथी जाँच 36 हफ़्ते से होती है। अस्पताल का बैग तैयार रखें: पहचान पत्र, reports, कपड़े, pad, और बच्चे के कपड़े व टोपी।' } }, k: 'visit', go: 'pregtools-bag' },
    37: { s: { en: '3.0 kg', hi: '3.0 किलो' }, c: { en: 'As heavy as a 3 kg bag of chawal (rice)', hi: '3 किलो चावल के थैले जितना भारी' },
      b: { en: 'The fine body hair is shedding, and your baby practises breathing movements.', hi: 'शरीर के बारीक बाल झड़ रहे हैं, और बच्चा साँस लेने जैसी हरकतों का अभ्यास करता है।' },
      y: { en: 'You may pass the mucus plug, a sticky pink or brown discharge. Labour can still be days or weeks away.', hi: 'चिपचिपा गुलाबी या भूरा स्राव (mucus plug) निकल सकता है। लेबर फिर भी कुछ दिन या हफ़्ते दूर हो सकता है।' },
      tip: { en: 'Bleeding like a period, waters breaking, or regular strong pains: go to hospital. Free ambulance 102 or 108.', hi: 'पीरियड जैसी ब्लीडिंग, पानी की थैली फटना, या नियमित तेज़ दर्द: अस्पताल जाएँ। मुफ़्त एम्बुलेंस 102 या 108।' }, k: 'warn', go: 'pregtools-contractions' },
    38: { s: { en: '3.2 kg', hi: '3.2 किलो' }, c: { en: 'As heavy as a medium tarbooz (watermelon)', hi: 'मझोले तरबूज़ जितना भारी' },
      b: { en: 'The hair on the head gets thicker and most of the fine body hair is gone.', hi: 'सिर के बाल घने होते हैं और शरीर के ज़्यादातर बारीक बाल झड़ चुके हैं।' },
      y: { en: 'True labour pains come at regular times and get stronger and closer together. Practice tightenings stay irregular and fade.', hi: 'असली लेबर दर्द नियमित अंतर पर आता है और तेज़ व पास-पास होता जाता है। अभ्यास वाला कसाव अनियमित रहता है और ख़त्म हो जाता है।' },
      tip: { en: 'Plan to breastfeed in the first hour after birth, and tell your family and the hospital staff. The first thick milk (colostrum) is the best first food.', hi: 'जन्म के पहले घंटे में स्तनपान की योजना बनाएँ, और परिवार व अस्पताल के स्टाफ़ को बताएँ। पहला गाढ़ा दूध (खीस, colostrum) बच्चे का सबसे अच्छा पहला खाना है।' }, k: 'food', go: 'post-feed' },
    39: { s: { en: '3.4 kg', hi: '3.4 किलो' }, c: { en: 'As heavy as a big kaddu (pumpkin)', hi: 'बड़े कद्दू जितना भारी' },
      b: { en: "Your baby is ready for birth. The gut holds meconium, the baby's first dark stool.", hi: 'बच्चा जन्म के लिए तैयार है। आँतों में meconium है, बच्चे का पहला काला मल।' },
      y: { en: 'Waiting can be tiring. Keep moving gently, eat well and rest.', hi: 'इंतज़ार थका सकता है। धीरे-धीरे चलती-फिरती रहें, अच्छा खाएँ और आराम करें।' },
      tip: { en: 'Decide about family planning after the birth now, while you are calm. A Copper-T can be put in soon after delivery at the hospital.', hi: 'डिलीवरी के बाद परिवार नियोजन का फ़ैसला अभी, आराम से कर लें। अस्पताल में डिलीवरी के तुरंत बाद Copper-T लगाया जा सकता है।' }, k: 'visit', go: 'post-contra' },
    40: { s: { en: '3.6 kg', hi: '3.6 किलो' }, c: { en: 'As heavy as a big tarbooz (watermelon)', hi: 'बड़े तरबूज़ जितना भारी' },
      b: { en: 'Your due date week. Few babies arrive exactly on the due date; most come in the weeks around it.', hi: 'आपकी डिलीवरी की तारीख़ वाला हफ़्ता। बहुत कम बच्चे ठीक उसी तारीख़ को आते हैं; ज़्यादातर उसके आसपास के हफ़्तों में आते हैं।' },
      y: { en: "The womb sinks a little as the baby's head moves down into your pelvis.", hi: 'बच्चे का सिर नीचे कूल्हे की हड्डियों (pelvis) में जाने से गर्भाशय थोड़ा नीचे बैठ जाता है।' },
      tip: { en: 'Notice movements every day. Fewer movements, bleeding, fever or waters breaking: go to hospital now.', hi: 'हर दिन हलचल पर ध्यान दें। कम हलचल, ब्लीडिंग, बुख़ार या पानी की थैली फटना: अभी अस्पताल जाएँ।' }, k: 'warn', go: 'pregtools-kicks' },
    41: { s: { en: '3.6 kg', hi: '3.6 किलो' }, c: { en: 'As heavy as a big tarbooz (watermelon)', hi: 'बड़े तरबूज़ जितना भारी' }, birth: true,
      b: { en: 'Your baby keeps growing. Babies born after the due date often have dry, peeling skin for a few days.', hi: 'बच्चा बढ़ता रहता है। तारीख़ के बाद जन्मे बच्चों की त्वचा अक्सर कुछ दिन सूखी और उखड़ी हुई रहती है।' },
      y: { en: 'Going past the due date is common, especially with a first baby. You need closer checks now.', hi: 'तारीख़ निकल जाना आम है, ख़ासकर पहले बच्चे में। अब ज़्यादा बार जाँच ज़रूरी है।' },
      tip: { en: 'At 41 weeks doctors usually offer to start labour with medicine (induction). Go to your hospital for a check and to plan the birth.', hi: '41 हफ़्ते पर डॉक्टर आम तौर पर दवा से लेबर शुरू कराने (induction) की पेशकश करते हैं। जाँच और डिलीवरी की योजना के लिए अपने अस्पताल जाएँ।' }, k: 'visit' },
    42: { s: { en: '3.7 kg', hi: '3.7 किलो' }, c: { en: 'As heavy as a big tarbooz (watermelon)', hi: 'बड़े तरबूज़ जितना भारी' }, birth: true,
      b: { en: 'Your baby is fully grown. After 42 weeks the placenta may not work as well, which is why doctors do not wait longer.', hi: 'बच्चा पूरा बढ़ चुका है। 42 हफ़्ते के बाद आँवल (placenta) कम अच्छी तरह काम कर सकता है, इसलिए डॉक्टर और इंतज़ार नहीं करते।' },
      y: { en: 'If labour has not started, you should already have a plan from your doctor.', hi: 'अगर लेबर शुरू नहीं हुआ है, तो डॉक्टर के साथ योजना अब तक बन जानी चाहिए।' },
      tip: { en: 'Do not wait at home past 42 weeks. Go to the hospital today.', hi: '42 हफ़्ते के बाद घर पर इंतज़ार न करें। आज ही अस्पताल जाएँ।' }, k: 'warn' }
  };
  const W_MIN = 4, W_MAX = 42;
  const GO_LABEL = { 'preg-logs': () => T('go_logs'), 'preg-mcp': () => T('t_mcp'), 'preg-diet': () => T('t_diet'), 'preg-symptoms': () => T('t_sym'), help: () => t('safety'),
    'access-schemes-preg': () => T('hub_schemes'), 'pregtools-kicks': () => T('go_kicks'), 'pregtools-bag': () => T('go_bag'), 'pregtools-contractions': () => T('go_ctx'), 'post-feed': () => T('go_feed'), 'post-contra': () => T('go_contra'), iron: () => t('iron_h'), asha: () => t('asha_h') };

  /* ---------- common discomforts ---------- */
  const SYM = [
    { id: 'nausea', h: { en: 'Nausea and vomiting', hi: 'जी मिचलाना और उल्टी' },
      help: [{ en: 'Eat small, plain meals every 2–3 hours. A dry roti, khakhra or toast before you get up can help.', hi: 'हर 2–3 घंटे में थोड़ा, सादा खाना खाएँ। उठने से पहले सूखी रोटी, खाखरा या टोस्ट खाने से आराम मिल सकता है।' },
        { en: 'Sip water, nimbu pani or coconut water through the day instead of drinking a lot at once.', hi: 'एक साथ ज़्यादा पीने की बजाय दिन भर घूँट-घूँट पानी, नींबू पानी या नारियल पानी पिएँ।' },
        { en: 'Stay away from smells and oily food that set it off, and rest; tiredness makes it worse. For most women it eases by 16–20 weeks.', hi: 'जिन गंधों और तले खाने से जी मिचलाए, उनसे दूर रहें, और आराम करें; थकान से यह बढ़ता है। ज़्यादातर महिलाओं में यह 16–20 हफ़्ते तक ठीक हो जाता है।' }],
      worry: [{ lvl: 'today', en: "Can't keep food or water down for 24 hours, very dark urine or no urine for 8 hours, feeling faint, belly pain or fever, or vomiting blood: see a doctor today. Severe vomiting is treatable, often with a drip.", hi: '24 घंटे तक खाना या पानी न टिके, पेशाब बहुत गहरा हो या 8 घंटे से पेशाब न आए, चक्कर, पेट दर्द या बुख़ार हो, या उल्टी में ख़ून आए: आज ही डॉक्टर को दिखाएँ। तेज़ उल्टी का इलाज होता है, अक्सर drip से।' }] },
    { id: 'heartburn', h: { en: 'Heartburn', hi: 'सीने में जलन' },
      help: [{ en: "Eat smaller meals, slowly. Don't lie down soon after eating.", hi: 'थोड़ा-थोड़ा और धीरे खाएँ। खाने के तुरंत बाद न लेटें।' },
        { en: 'Raise your head at night with an extra pillow. Go easy on very spicy, oily and fried food.', hi: 'रात को एक तकिया ज़्यादा लगाकर सिर ऊँचा रखें। बहुत मसालेदार, तैलीय और तला खाना कम करें।' },
        { en: 'Ask your doctor or ANM before taking an antacid.', hi: 'कोई antacid लेने से पहले डॉक्टर या ANM से पूछें।' }],
      worry: [{ lvl: 'today', en: 'In the second half of pregnancy, burning that does not settle, with pain under the ribs, a headache or swelling: get your BP checked today.', hi: 'गर्भावस्था के दूसरे आधे हिस्से में ऐसी जलन जो ठीक न हो, साथ में पसलियों के नीचे दर्द, सिरदर्द या सूजन: आज ही BP जँचवाएँ।' }] },
    { id: 'constipation', h: { en: 'Constipation and piles', hi: 'क़ब्ज़ और बवासीर (piles)' },
      help: [{ en: 'Drink over 2 litres a day. Eat fibre: whole grains, dal, vegetables and fruit. Walk every day.', hi: 'रोज़ 2 लीटर से ज़्यादा पानी पिएँ। फ़ाइबर वाला खाना खाएँ: साबुत अनाज, दाल, सब्ज़ियाँ और फल। रोज़ टहलें।' },
        { en: "Iron tablets can add to constipation. Don't stop them; tell your ANM.", hi: 'iron की गोली से क़ब्ज़ बढ़ सकती है। गोली बंद न करें; ANM को बताएँ।', doc: { en: 'Iron tablets can add to constipation. Don\'t stop them; tell your doctor.', hi: 'iron की गोली से क़ब्ज़ बढ़ सकती है। गोली बंद न करें; डॉक्टर को बताएँ।' } },
        { en: "Don't strain on the toilet. Ask your doctor for a cream or a stool softener that is safe in pregnancy.", hi: 'शौच में ज़ोर न लगाएँ। गर्भावस्था में सुरक्षित क्रीम या मल नरम करने की दवा के लिए डॉक्टर से पूछें।' }],
      worry: [{ lvl: 'week', en: 'Bleeding from the back passage or a painful lump: see a doctor this week.', hi: 'मल के रास्ते से ख़ून या दर्द वाली गाँठ: इसी हफ़्ते डॉक्टर को दिखाएँ।' },
        { lvl: 'today', en: 'Heavy bleeding from the back passage, or severe pain: see a doctor today.', hi: 'मल के रास्ते से ज़्यादा ख़ून, या बहुत तेज़ दर्द: आज ही डॉक्टर को दिखाएँ।' }] },
    { id: 'cramps', h: { en: 'Leg cramps', hi: 'पैरों में ऐंठन (cramps)' },
      help: [{ en: 'Stretch the calf: straighten your leg and pull your toes up towards you. Rub the muscle.', hi: 'पिंडली को खींचें: पैर सीधा करें और पंजे को अपनी ओर खींचें। मांसपेशी को मलें।' },
        { en: 'Walk during the day and drink enough water.', hi: 'दिन में टहलें और भरपूर पानी पिएँ।' }],
      worry: [{ lvl: 'today', en: 'One leg (not both) swollen, red, warm or painful: see a doctor today. It can be a blood clot.', hi: 'एक पैर (दोनों नहीं) सूजा, लाल, गर्म या दर्द वाला हो: आज ही डॉक्टर को दिखाएँ। यह ख़ून का थक्का हो सकता है।' },
        { lvl: 'urgent', en: 'With breathlessness or chest pain: call 112 now.', hi: 'साथ में साँस फूले या सीने में दर्द हो: अभी 112 पर कॉल करें।' }] },
    { id: 'swelling', h: { en: 'Swelling', hi: 'सूजन' },
      help: [{ en: 'Mild swelling of the feet and ankles by evening is common in later pregnancy.', hi: 'गर्भावस्था के आख़िरी महीनों में शाम तक पैरों और टखनों में हल्की सूजन आम है।' },
        { en: "Raise your feet when you sit, don't stand for long, walk a little, and wear comfortable footwear.", hi: 'बैठते समय पैर ऊपर रखें, देर तक खड़ी न रहें, थोड़ा टहलें, और आरामदायक चप्पल पहनें।' }],
      worry: [{ lvl: 'today', en: 'Sudden swelling of the face, hands or feet: see a doctor today and get your BP checked.', hi: 'चेहरे, हाथों या पैरों पर अचानक सूजन: आज ही डॉक्टर को दिखाएँ और BP जँचवाएँ।' },
        { lvl: 'urgent', en: 'With a bad headache, blurred vision or fits: go to hospital now, call 112.', hi: 'साथ में तेज़ सिरदर्द, धुंधला दिखना या दौरे: अभी अस्पताल जाएँ, 112 पर कॉल करें।' }] },
    { id: 'back', h: { en: 'Back pain', hi: 'कमर दर्द' },
      help: [{ en: 'Wear flat shoes. Sit with your back supported. Bend your knees, not your back, to pick things up, and avoid lifting heavy things.', hi: 'सपाट चप्पल पहनें। कमर को सहारा देकर बैठें। कुछ उठाना हो तो कमर नहीं, घुटने मोड़ें, और भारी सामान न उठाएँ।' },
        { en: 'Sleep on your side with a pillow between your knees. Gentle walks help.', hi: 'घुटनों के बीच तकिया रखकर करवट लेकर सोएँ। धीरे-धीरे टहलना मदद करता है।' }],
      worry: [{ lvl: 'today', en: 'Back pain with fever, burning when peeing, or pain in the back just under the ribs: see a doctor today. It can be a kidney infection.', hi: 'कमर दर्द के साथ बुख़ार, पेशाब में जलन, या पीठ में पसलियों के ठीक नीचे दर्द: आज ही डॉक्टर को दिखाएँ। यह गुर्दे का infection हो सकता है।' },
        { lvl: 'urgent', en: 'Back or belly pain that comes and goes regularly before 37 weeks: go to hospital now. It can be early labour.', hi: '37 हफ़्ते से पहले कमर या पेट में नियमित रूप से आता-जाता दर्द: अभी अस्पताल जाएँ। यह समय से पहले का लेबर हो सकता है।' }] },
    { id: 'sleep', h: { en: 'Sleep', hi: 'नींद' },
      help: [{ en: 'From 28 weeks, go to sleep on your side, left or right. A pillow under your belly and between your knees helps.', hi: '28 हफ़्ते से करवट लेकर सोएँ, बाईं या दाईं। पेट के नीचे और घुटनों के बीच तकिया मदद करता है।' },
        { en: 'Rest during the day when you can. Have less tea or coffee in the evening and an early, light dinner.', hi: 'जब हो सके दिन में आराम करें। शाम को चाय-कॉफ़ी कम करें और रात का खाना जल्दी और हल्का रखें।' }],
      worry: [{ lvl: 'week', en: 'Low mood, worry or no interest in things most days for 2 weeks: talk to a doctor this week, or call Tele-MANAS 14416 (free, any time).', hi: '2 हफ़्ते तक ज़्यादातर दिन मन उदास, घबराहट या किसी चीज़ में मन न लगे: इसी हफ़्ते डॉक्टर से बात करें, या Tele-MANAS 14416 पर कॉल करें (मुफ़्त, कभी भी)।' },
        { lvl: 'urgent', en: 'Thoughts of harming yourself: call 14416 or 112 now.', hi: 'ख़ुद को नुक़सान पहुँचाने के ख़याल: अभी 14416 या 112 पर कॉल करें।' }] },
    { id: 'discharge', h: { en: 'Discharge', hi: 'सफ़ेद पानी (discharge)' },
      help: [{ en: 'More thin, white, mild-smelling discharge is normal in pregnancy.', hi: 'गर्भावस्था में पतला, सफ़ेद, हल्की गंध वाला ज़्यादा स्राव सामान्य है।' },
        { en: "Wear cotton underwear. Wash the outside with plain water. Don't wash inside or put anything in the vagina.", hi: 'सूती अंडरवियर पहनें। बाहर से सादे पानी से धोएँ। अंदर से न धोएँ और योनि में कुछ न डालें।' }],
      worry: [{ lvl: 'week', en: 'Itching, soreness, a bad smell, or green, yellow or curd-like discharge: see a doctor this week.', hi: 'खुजली, जलन, बुरी गंध, या हरा, पीला या दही जैसा स्राव: इसी हफ़्ते डॉक्टर को दिखाएँ।' },
        { lvl: 'urgent', en: 'Watery fluid leaking, or any bleeding: go to hospital now.', hi: 'पानी जैसा रिसाव, या कोई भी ब्लीडिंग: अभी अस्पताल जाएँ।' }] },
    { id: 'urine', h: { en: 'Peeing often', hi: 'बार-बार पेशाब' },
      help: [{ en: 'Needing to pee often is normal early and late in pregnancy. Keep drinking water; do not cut down.', hi: 'गर्भ के शुरू और आख़िर में बार-बार पेशाब आना सामान्य है। पानी पीती रहें; कम न करें।' },
        { en: 'Have less tea or coffee in the evening. Lean forward while peeing to empty fully.', hi: 'शाम को चाय-कॉफ़ी कम करें। पेशाब करते समय थोड़ा आगे झुकें ताकि पूरा निकल जाए।' }],
      worry: [{ lvl: 'today', en: 'Burning or pain when peeing, fever, pain in the back under the ribs, or passing much less urine than usual: see a doctor today. Urine infections in pregnancy need treatment.', hi: 'पेशाब में जलन या दर्द, बुख़ार, पीठ में पसलियों के नीचे दर्द, या आम दिनों से बहुत कम पेशाब: आज ही डॉक्टर को दिखाएँ। गर्भावस्था में पेशाब के infection का इलाज ज़रूरी है।' }] },
    { id: 'gums', h: { en: 'Bleeding gums', hi: 'मसूड़ों से ख़ून' },
      help: [{ en: 'Brush twice a day with a soft brush and rinse your mouth after meals.', hi: 'दिन में दो बार नरम ब्रश से दाँत साफ़ करें और खाने के बाद कुल्ला करें।' },
        { en: 'A dental check-up is fine in pregnancy. Tell the dentist you are pregnant.', hi: 'गर्भावस्था में दाँतों की जाँच करा सकती हैं। dentist को बताएँ कि आप गर्भवती हैं।' }],
      worry: [{ lvl: 'week', en: 'Swollen, painful gums or a loose tooth: see a dentist this week.', hi: 'मसूड़े सूजे और दर्द वाले हों या कोई दाँत हिले: इसी हफ़्ते dentist को दिखाएँ।' }] },
    { id: 'skin', h: { en: 'Skin changes', hi: 'त्वचा में बदलाव' },
      help: [{ en: 'A dark line down the belly, darker patches on the face and darker nipples are common. They usually fade after the birth.', hi: 'पेट पर नीचे की ओर गहरी रेखा, चेहरे पर गहरे धब्बे और गहरे निप्पल आम हैं। ये आम तौर पर डिलीवरी के बाद हल्के पड़ जाते हैं।' },
        { en: 'Stretch marks are common. Oil or cream can ease dryness, but no cream is proven to prevent them. Cover your face in strong sun.', hi: 'पेट पर खिंचाव के निशान आम हैं। तेल या क्रीम से रूखापन कम होता है, पर कोई क्रीम इन्हें रोकती है, यह साबित नहीं है। तेज़ धूप में चेहरा ढकें।' }],
      worry: [{ lvl: 'today', en: 'Itching all over, especially on the palms and soles, without a rash: see a doctor today. It can be a liver problem of pregnancy.', hi: 'पूरे शरीर में खुजली, ख़ासकर हथेलियों और तलवों पर, बिना दाने के: आज ही डॉक्टर को दिखाएँ। यह गर्भावस्था में लिवर की समस्या हो सकती है।' }] },
    { id: 'breath', h: { en: 'Breathlessness', hi: 'साँस फूलना' },
      help: [{ en: 'Some breathlessness is common as the womb grows, especially on stairs. Slow down, sit up straight, and sleep propped up on pillows.', hi: 'गर्भाशय बढ़ने से थोड़ी साँस फूलना आम है, ख़ासकर सीढ़ियों पर। धीरे चलें, सीधी बैठें, और तकियों के सहारे थोड़ा ऊँचा होकर सोएँ।' },
        { en: 'Low Hb can cause it. Keep taking IFA and have your Hb checked at each visit.', hi: 'Hb कम होने से भी ऐसा होता है। IFA लेती रहें और हर मुलाक़ात में Hb जँचवाएँ।' }],
      worry: [{ lvl: 'today', en: 'Breathless at rest, or very tired with a racing heart: see a doctor today and get your Hb checked.', hi: 'आराम करते हुए साँस फूले, या बहुत थकान के साथ दिल तेज़ धड़के: आज ही डॉक्टर को दिखाएँ और Hb जँचवाएँ।' },
        { lvl: 'urgent', en: 'Sudden breathlessness, chest pain, or coughing up blood: call 112 now.', hi: 'अचानक साँस फूलना, सीने में दर्द, या खाँसी में ख़ून: अभी 112 पर कॉल करें।' }] }
  ];

  /* ---------- food in pregnancy (ICMR-NIN Dietary Guidelines for Indians 2024) ---------- */
  const DIET = {
    more_h: { en: 'How much more to eat', hi: 'कितना ज़्यादा खाना है' },
    more: [
      { en: 'First three months: no extra food is needed. Eat a balanced plate with a variety of foods.', hi: 'पहले तीन महीने: ज़्यादा खाने की ज़रूरत नहीं। तरह-तरह के खाने वाली संतुलित थाली लें।' },
      { en: 'From the 4th month until the birth: about 350 extra calories a day. Roughly one roti, a bowl of dal and a glass of milk.', hi: 'चौथे महीने से डिलीवरी तक: रोज़ लगभग 350 calorie ज़्यादा। मोटे तौर पर एक रोटी, एक कटोरी दाल और एक गिलास दूध।' },
      { en: 'If you are underweight: about 450 extra calories a day (350 plus 100).', hi: 'अगर वज़न कम है: रोज़ लगभग 450 calorie ज़्यादा (350 और 100)।' },
      { en: 'Extra protein: about 8 g a day in the middle three months and 18 g a day in the last three.', hi: 'ज़्यादा protein: बीच के तीन महीनों में रोज़ लगभग 8 g और आख़िरी तीन महीनों में रोज़ 18 g।' }
    ],
    plate_h: { en: "A day's food in pregnancy", hi: 'गर्भावस्था में एक दिन का खाना' },
    plate: [
      [{ en: 'Cereals and millets (rice, roti, ragi, jowar, bajra)', hi: 'अनाज और मोटा अनाज (चावल, रोटी, रागी, ज्वार, बाजरा)' }, '240 g'],
      [{ en: 'Pulses and beans (dal, rajma, chana)', hi: 'दालें और फलियाँ (दाल, राजमा, चना)' }, '80 g'],
      [{ en: 'Milk, curd, buttermilk (about 2 glasses)', hi: 'दूध, दही, छाछ (लगभग 2 गिलास)' }, '400 ml'],
      [{ en: 'Vegetables, roots and tubers', hi: 'सब्ज़ियाँ, जड़ और कंद' }, '300 g'],
      [{ en: 'Green leafy vegetables (palak, methi, sarson, drumstick leaves)', hi: 'हरी पत्तेदार सब्ज़ियाँ (पालक, मेथी, सरसों, सहजन के पत्ते)' }, '150 g'],
      [{ en: 'Fruits (guava, orange, banana, mango)', hi: 'फल (अमरूद, संतरा, केला, आम)' }, '150 g'],
      [{ en: 'Nuts and oilseeds (peanuts, til, almonds)', hi: 'मेवे और तिलहन (मूँगफली, तिल, बादाम)' }, '40 g'],
      [{ en: 'Oil or ghee', hi: 'तेल या घी' }, '20 ml'],
      [{ en: 'Fish, chicken or meat, if you eat it (or swap for part of the dal)', hi: 'मछली, चिकन या मीट, अगर खाती हैं (या दाल का कुछ हिस्सा इससे बदलें)' }, '80 g']
    ],
    plate_n: { en: 'Raw weights, for a woman of average weight and activity. From the 4th month, the extra 350 calories go on top. Make at least half your grains whole grains or millets.', hi: 'कच्चा वज़न, औसत वज़न और काम वाली महिला के लिए। चौथे महीने से 350 calorie इसके ऊपर जुड़ती हैं। कम से कम आधा अनाज साबुत अनाज या मोटा अनाज रखें।' },
    cards: [
      { h: { en: 'Protein: dal, milk, eggs', hi: 'Protein: दाल, दूध, अंडे' }, p: [
        { en: 'Have dal or beans with every main meal. Cereal and dal together, about 3 parts cereal to 1 part dal, give better protein than either alone.', hi: 'हर बड़े खाने में दाल या फलियाँ लें। अनाज और दाल साथ में, लगभग 3 हिस्से अनाज और 1 हिस्सा दाल, अकेले किसी एक से बेहतर protein देते हैं।' },
        { en: 'Milk, curd and paneer every day. Eggs, fish, chicken or meat if you eat them.', hi: 'रोज़ दूध, दही और पनीर। अंडे, मछली, चिकन या मीट, अगर खाती हैं।' }] },
      { h: { en: 'Iron, with vitamin C', hi: 'Iron, विटामिन C के साथ' }, p: [
        { en: 'Iron comes from green leafy vegetables, dal and beans, dry fruits, eggs and meat. Sprouts and fermented foods like idli, dosa and dhokla give more usable iron.', hi: 'Iron हरी पत्तेदार सब्ज़ियों, दाल और फलियों, सूखे मेवों, अंडे और मीट से मिलता है। अंकुरित अनाज और ख़मीर वाले खाने जैसे इडली, डोसा और ढोकला से iron ज़्यादा काम आता है।' },
        { en: 'Eat something with vitamin C at meals: guava, orange, amla or a squeeze of lemon. Keep tea and coffee at least an hour away from meals.', hi: 'खाने के साथ विटामिन C वाली कोई चीज़ लें: अमरूद, संतरा, आँवला या नींबू। चाय और कॉफ़ी खाने से कम से कम एक घंटा दूर रखें।' },
        { en: 'Food alone is not enough in pregnancy, so the IFA tablet is still needed.', hi: 'गर्भावस्था में सिर्फ़ खाने से iron पूरा नहीं होता, इसलिए IFA की गोली फिर भी ज़रूरी है।' }] },
      { h: { en: 'Calcium and vitamin D', hi: 'Calcium और विटामिन D' }, p: [
        { en: 'Milk is the best source; curd, paneer, ragi and til (sesame) help too. Take the calcium tablets from 14 weeks as well.', hi: 'दूध सबसे अच्छा स्रोत है; दही, पनीर, रागी और तिल भी मदद करते हैं। 14 हफ़्ते से calcium की गोलियाँ भी लें।' },
        { en: 'Get at least 15 minutes of direct sunlight on your skin for vitamin D.', hi: 'विटामिन D के लिए रोज़ कम से कम 15 मिनट सीधी धूप त्वचा पर लें।' }] },
      { h: { en: 'Iodised salt and water', hi: 'आयोडीन वाला नमक और पानी' }, p: [
        { en: "Use only iodised salt. Iodine is needed for the baby's brain.", hi: 'सिर्फ़ आयोडीन वाला नमक इस्तेमाल करें। बच्चे के दिमाग़ के लिए आयोडीन ज़रूरी है।' },
        { en: 'Drink plenty: over 2 litres a day, counting water, buttermilk and nimbu pani.', hi: 'भरपूर पिएँ: रोज़ 2 लीटर से ज़्यादा, जिसमें पानी, छाछ और नींबू पानी गिना जाए।' }] }
    ],
    avoid_h: { en: 'Avoid, or keep to a little', hi: 'इनसे बचें, या बहुत कम लें' },
    avoid: [
      { en: 'No tobacco in any form (gutka, khaini, bidi, cigarettes) and no alcohol.', hi: 'किसी भी रूप में तंबाकू नहीं (गुटखा, खैनी, बीड़ी, सिगरेट) और शराब नहीं।' },
      { en: "Keep tea and coffee to a little. A cup of tea has 30–65 mg of caffeine and a cup of brewed coffee 80–120 mg; too much affects the baby's growth.", hi: 'चाय-कॉफ़ी थोड़ी ही लें। एक कप चाय में 30–65 mg और एक कप brewed कॉफ़ी में 80–120 mg caffeine होता है; ज़्यादा caffeine बच्चे की बढ़त पर असर डालता है।' },
      { en: 'Avoid fizzy drinks and packaged foods high in fat, sugar and salt.', hi: 'cold drink और ज़्यादा चिकनाई, चीनी और नमक वाले पैकेट के खाने से बचें।' },
      { en: "Take no medicine or 'tonic' without your doctor's advice.", hi: 'डॉक्टर की सलाह के बिना कोई दवा या “टॉनिक” न लें।' }
    ],
    safe_h: { en: 'Food safety', hi: 'खाने की सुरक्षा' },
    safe: [
      { en: 'Wash your hands before cooking and eating.', hi: 'खाना बनाने और खाने से पहले हाथ धोएँ।' },
      { en: 'Eat food freshly cooked and hot. Boil milk, and drink clean or boiled water.', hi: 'ताज़ा बना और गर्म खाना खाएँ। दूध उबालकर पिएँ, और साफ़ या उबला पानी पिएँ।' },
      { en: 'Cook eggs, meat and fish all the way through. Wash fruit and vegetables before cutting.', hi: 'अंडे, मीट और मछली पूरी तरह पकाएँ। फल और सब्ज़ियाँ काटने से पहले धोएँ।' }
    ],
    free_h: { en: 'Free food for you', hi: 'आपके लिए मुफ़्त खाना' },
    free: { en: 'Pregnant women can get supplementary food from the Anganwadi: take-home ration, and hot meals in some states. Ask your Anganwadi worker to register you.', hi: 'गर्भवती महिलाएँ आंगनवाड़ी से पूरक आहार ले सकती हैं: घर ले जाने वाला राशन, और कुछ राज्यों में पका खाना। अपनी आंगनवाड़ी कार्यकर्ता से नाम लिखवाएँ।' },
    myths: [
      { q: { en: 'Will kesar (saffron) in milk make the baby fair?', hi: 'क्या दूध में केसर से बच्चा गोरा होगा?' },
        a: { en: "A pinch of kesar in milk is fine as food. But a baby's skin colour comes from the parents' genes, and no food changes it. Every skin colour is healthy. Spend that money on dal, milk and fruit instead.", hi: 'दूध में चुटकी भर केसर खाने के तौर पर ठीक है। पर बच्चे का रंग माता-पिता के जीन से आता है, कोई खाना इसे नहीं बदलता। हर रंग स्वस्थ है। वह पैसा दाल, दूध और फल पर ख़र्च करें।' } },
      { q: { en: 'Does extra ghee make the delivery easy?', hi: 'क्या ज़्यादा घी से डिलीवरी आसान होती है?' },
        a: { en: 'A little ghee in your food is fine. But there is no proof that extra ghee makes labour easier. It adds weight, and the guidelines keep oil and ghee to about 20 ml (4 teaspoons) a day.', hi: 'खाने में थोड़ा घी ठीक है। पर इसका कोई सबूत नहीं कि ज़्यादा घी से लेबर आसान होता है। इससे वज़न बढ़ता है, और गाइडलाइन रोज़ तेल-घी लगभग 20 ml (4 छोटे चम्मच) तक रखने को कहती है।' } },
      { q: { en: 'Should I eat for two?', hi: 'क्या दो लोगों जितना खाना चाहिए?' },
        a: { en: 'You need more good food, not double the food. Nothing extra in the first three months, then about 350 calories a day more.', hi: 'ज़्यादा अच्छा खाना चाहिए, दोगुना खाना नहीं। पहले तीन महीने कुछ ज़्यादा नहीं, उसके बाद रोज़ लगभग 350 calorie ज़्यादा।' } },
      { q: { en: 'Is papaya dangerous in pregnancy?', hi: 'क्या गर्भावस्था में पपीता ख़तरनाक है?' },
        a: { en: 'Ripe papaya is a good fruit in pregnancy, rich in vitamin A. Raw or half-ripe (green) papaya has a milky latex that made womb muscle contract in animal studies, so doctors advise skipping it. A piece eaten by mistake is no reason to panic; pain or bleeding needs a doctor.', hi: 'पका पपीता गर्भावस्था में अच्छा फल है, इसमें विटामिन A भरपूर है। कच्चे या अधपके (हरे) पपीते में दूध जैसा रस (latex) होता है, जिससे जानवरों पर हुए अध्ययन में गर्भाशय की मांसपेशी सिकुड़ी, इसलिए डॉक्टर इसे न खाने की सलाह देते हैं। ग़लती से एक टुकड़ा खा लिया हो तो घबराएँ नहीं; दर्द या ब्लीडिंग हो तो डॉक्टर को दिखाएँ।' } },
      { q: { en: "Will coconut water give the baby good hair?", hi: 'क्या नारियल पानी से बच्चे के बाल अच्छे होंगे?' },
        a: { en: "Coconut water is a fine drink, especially in summer. But hair, like skin colour, comes from the parents' genes. No drink changes it.", hi: 'नारियल पानी अच्छा पेय है, ख़ासकर गर्मियों में। पर बाल भी, रंग की तरह, माता-पिता के जीन से आते हैं। कोई पेय इन्हें नहीं बदलता।' } }
    ],
    ask_h: { en: 'Help with your food plan', hi: 'खाने की योजना में मदद' },
    ask_p: { en: 'A Qura doctor (BAMS) can plan meals around your routine, weight and what you like to eat. If you have sugar in pregnancy, follow the diet your doctor or dietitian gives you.', hi: 'Qura की डॉक्टर (BAMS) आपकी दिनचर्या, वज़न और पसंद के हिसाब से खाने की योजना बना सकती हैं। गर्भावस्था में sugar हो, तो डॉक्टर या dietitian का बताया खाना ही लें।' }
  };
  const DGI_URL = 'https://www.nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf';

  /* ---------- storage ---------- */
  const fill = (d) => {
    ['w', 'bp', 'sug', 'hb'].forEach((k) => { if (!Array.isArray(d[k])) d[k] = []; });
    if (!d.tabs || typeof d.tabs !== 'object') d.tabs = {};
    if (!d.mcp || typeof d.mcp !== 'object') d.mcp = {};
    if (!Array.isArray(d.mcp.anc)) d.mcp.anc = [];
    if (!d.mcp.risk || typeof d.mcp.risk !== 'object') d.mcp.risk = {};
    return d;
  };
  const store = () => (S.canSave() ? fill(S.data('preg')) : fill({}));
  const uid = () => Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  const byDate = (a) => a.slice().sort((x, y) => (x.d < y.d ? -1 : (x.d > y.d ? 1 : 0)));
  const latest = (a) => { const s = byDate(a); return s.length ? s[s.length - 1] : null; };

  /* ---------- small helpers ---------- */
  const has = (r) => !!S.routeOwner(r) || S.modules.some((m) => Object.keys(m.prefixes || {}).some((p) => r.indexOf(p) === 0));
  const linkOk = (r) => r === 'help' || r === 'me' || (r === 'pregnancy' && !has('preg-plan')) || has(r);   /* review PLACES-01 */
  const todayISO = () => S.toISO(S.today());
  const fd = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short' });
  const fdy = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short', year: 'numeric' });
  const num1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
  const parseNum = (s) => { const v = parseFloat(String(s == null ? '' : s).replace(',', '.').trim()); return isFinite(v) ? v : NaN; };
  const lcFirst = (s) => (S.state.lang === 'en' && s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  /* Dating comes from the core (S.preg.info): the scan report's due date beats the last period. */
  const weekInfo = () => { const p = S.preg && S.preg.info(); if (!p) return null; return { basis: p.lmp, from: p.from, w: p.weeks, days: p.days, due: S.fromISO(p.edd), lmp: p.lmp }; };
  const clampW = (n) => S.clamp(n, W_MIN, W_MAX);
  const triOf = (n) => (n < 14 ? 1 : (n < 28 ? 2 : 3));
  const svgIco = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  const TICK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const SCAN_SVG = svgIco('<rect x="3" y="5" width="18" height="12" rx="3"/><path d="M8 21h8M12 17v4M9.5 11a2.5 2.5 0 015 0"/>');
  const FOOD_SVG = svgIco('<path d="M3 12h18a9 9 0 01-18 0z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>');
  const CARD_SVG = svgIco('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 10h6M7 14h4M16 10h1"/>');
  const KIND_ICO = { visit: S.I.check, tablet: S.I.pill, scheme: S.I.file, warn: S.I.help, food: FOOD_SVG, scan: SCAN_SVG };
  const KIND_CLS = { warn: 'accent', scheme: 'ok', food: 'ok' };
  const goBtn = (r, cls) => (r && linkOk(r) && GO_LABEL[r] ? '<button type="button" class="btn sm ' + (cls || '') + '" data-go="' + esc(r) + '">' + esc(GO_LABEL[r]()) + '</button>' : '');
  const backTo = () => 'preg';
  const urgentAction = () => '<button type="button" class="action" data-go="help"><span class="ico accent">' + S.I.help + '</span><span class="body"><strong>' + esc(t('call_now')) + '</strong><span class="small">' + esc(t('s1c')) + '</span></span></button>';
  const sizeLine = (n) => { const x = W[n]; return tx(x.s) + ', ' + lcFirst(tx(x.c)); };
  /* The week's fruit or vegetable, drawn by art.js (Home shows it beside the week number). */
  const sizeArt = (n, cls) => (S.art ? '<span class="' + (cls || 'pg-art') + '">' + S.art.produce(n, tx(W[n].c)) + '</span>' : '');
  /* for other modules (the scheme claims): her antenatal visit dates from the MCP card. Read-only copy */
  S.pregAnc = () => (S.canSave() ? store().mcp.anc.slice() : []);
  S.pregSize = (w) => { if (w == null || w < W_MIN) return null; const n = clampW(w); return W[n] ? { s: tx(W[n].s), c: tx(W[n].c), line: sizeLine(n) } : null; };   /* weeks 0-3 have no size of their own */

  /* trimester bar (same look as the core pregnancy page) */
  function triBar(n) {
    const pct = S.clamp((n / 40) * 100, 1, 99); const tri = triOf(n) - 1;
    return '<div class="timeline" aria-hidden="true"><div class="seg" style="left:0;width:35%;background:var(--accent-2);opacity:0.6;border-radius:7px 0 0 7px"></div><div class="seg" style="left:35%;width:35%;background:var(--accent-2)"></div><div class="seg" style="left:70%;width:30%;background: var(--accent-strong);border-radius:0 7px 7px 0"></div><div class="mark" style="left:' + pct.toFixed(0) + '%"></div></div>' +
      '<div class="tl-labels" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ['wk_tri1', 'wk_tri2', 'wk_tri3'].map((k, i) => '<span class="' + (i === tri ? 'on' : '') + '">' + esc(T(k)) + '</span>').join('') + '</div>';
  }
  function weekGrid(cur) {
    let h = '<div class="pg-weeks">';
    for (let n = W_MIN; n <= W_MAX; n++) h += '<button type="button" class="btn sm' + (n === cur ? ' on' : '') + '" data-go="preg-w-' + n + '" aria-label="' + esc(TF('wk_title', { n: n })) + '">' + n + '</button>';
    return h + '</div>';
  }

  /* ---------- chart: values drawn to scale against dates ---------- */
  function chart(o) {
    const hasRefs = (o.refs || []).length > 0; const L = 34, R = hasRefs ? 266 : 290, Tp = 14, B = 84, H = 112;
    const all = []; o.series.forEach((s) => s.pts.forEach((p) => all.push(p)));
    if (!all.length) return '';
    const dayN = (iso) => Math.round(S.fromISO(iso).getTime() / 86400000);
    const d0 = Math.min.apply(null, all.map((p) => dayN(p.d))), d1 = Math.max.apply(null, all.map((p) => dayN(p.d)));
    const vals = all.map((p) => p.v).concat((o.refs || []).map((r) => r.v));
    let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); const pad = Math.max((hi - lo) * 0.12, o.minPad || 1);
    lo = Math.floor((lo - pad) / (o.step || 1)) * (o.step || 1); hi = Math.ceil((hi + pad) / (o.step || 1)) * (o.step || 1); if (o.floor != null) lo = Math.max(o.floor, lo);
    const x = (iso) => (d1 === d0 ? (L + R) / 2 : L + ((dayN(iso) - d0) * (R - L)) / (d1 - d0));
    const y = (v) => B - ((v - lo) / (hi - lo)) * (B - Tp);
    const f = o.fmt || ((v) => String(v));
    let s = '<svg class="spark pg-spark" viewBox="0 0 300 ' + H + '" role="img" aria-label="' + esc(o.aria) + '">';
    s += '<line class="gd" x1="' + L + '" y1="' + B + '" x2="' + R + '" y2="' + B + '"/><line class="gd" x1="' + L + '" y1="' + Tp + '" x2="' + R + '" y2="' + Tp + '"/>';
    s += '<text x="0" y="' + (Tp + 3) + '">' + esc(f(hi)) + '</text><text x="0" y="' + (B + 3) + '">' + esc(f(lo)) + '</text>';
    (o.refs || []).forEach((r) => { if (r.v > lo && r.v < hi) s += '<line class="pg-ref" x1="' + L + '" y1="' + y(r.v).toFixed(1) + '" x2="' + R + '" y2="' + y(r.v).toFixed(1) + '"/><text x="298" y="' + (y(r.v) + 3).toFixed(1) + '" text-anchor="end">' + esc(r.label) + '</text>'; });
    o.series.forEach((ser) => {
      const pts = byDate(ser.pts); if (!pts.length) return;
      if (pts.length > 1) s += '<polyline class="' + (ser.dash ? 'pg-ln2' : 'ln') + '" points="' + pts.map((p) => x(p.d).toFixed(1) + ',' + y(p.v).toFixed(1)).join(' ') + '"/>';
      const many = pts.length > 6;
      pts.forEach((p, i) => {
        s += '<circle class="' + (ser.dash ? 'pg-pt2' : 'pt') + '" cx="' + x(p.d).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="3.2"/>';
        if (!many || i === 0 || i === pts.length - 1) s += '<text x="' + x(p.d).toFixed(1) + '" y="' + (ser.below ? y(p.v) + 13 : y(p.v) - 7).toFixed(1) + '" text-anchor="' + (pts.length > 1 && i === pts.length - 1 ? 'end' : 'middle') + '">' + esc(f(p.v)) + '</text>';   /* the last label ends at its point, inside the chart */
      });
    });
    const first = all.map((p) => p.d).sort()[0], last = all.map((p) => p.d).sort().slice(-1)[0];
    s += '<text x="' + L + '" y="' + (H - 4) + '">' + esc(fd(first)) + '</text>' + (last !== first ? '<text x="' + R + '" y="' + (H - 4) + '" text-anchor="end">' + esc(fd(last)) + '</text>' : '');
    return s + '</svg>';
  }

  /* ---------- flags from her latest entries ---------- */
  const bpLevel = (e) => (!e ? 0 : ((e.sym || e.s >= 160 || e.di >= 110) ? 2 : ((e.s >= 140 || e.di >= 90) ? 1 : 0)));
  /* skip: the open tab, which shows its own flag, so the top of the page doesn't repeat it */
  function flagsFor(st, only, skip) {
    const out = [];
    if ((!only || only === 'bp') && skip !== 'bp') { const b = latest(st.bp); const lv = bpLevel(b); if (lv === 2) out.push('<div class="flag urgent">' + esc(T('bp_urgent')) + '</div>'); else if (lv === 1) out.push('<div class="flag">' + esc(T('bp_today')) + '</div>'); }
    if ((!only || only === 'sug') && skip !== 'sug') {
      const d = latest(st.sug.filter((e) => e.k === 'dipsi')); if (d && d.v >= 140) out.push('<div class="flag">' + esc(T('sug_flag')) + '</div>');
      /* fasting: over the national target of 95 (MoHFW GDM 2018); 126 or more is the diabetes range (WHO 2013) */
      const f = latest(st.sug.filter((e) => e.k === 'fast')); if (f && f.v >= 95) out.push('<div class="flag">' + esc(T(f.v >= 126 ? 'sug_fflag2' : 'sug_fflag')) + '</div>');
    }
    if ((!only || only === 'hb') && skip !== 'hb') { const h = latest(st.hb); if (h && h.v < 7) out.push('<div class="flag">' + esc(T('hb_flag')) + '</div>'); }
    return out.length ? '<div class="pg-flags">' + out.join('') + '</div>' : '';
  }
  /* IFA days live in the iron module when it is there (one record for the iron companion and this grid); calcium stays here */
  const tabOn = (st, key, k) => (key === 'ifa' && S.iron ? S.iron.taken(k) : !!(st.tabs[k] && st.tabs[k][key]));
  const tabDays = (st, key, n) => { let c = 0; for (let i = 0; i < n; i++) { const k = S.toISO(S.addDays(S.today(), -i)); if (tabOn(st, key, k)) c++; } return c; };
  const tabTotal = (st, key) => (key === 'ifa' && S.iron ? S.iron.days().length : Object.keys(st.tabs).filter((k) => st.tabs[k] && st.tabs[k][key]).length);

  /* ---------- hub ---------- */
  function renderHub(v) {
    const wi = weekInfo(); let top = '';
    if (wi) {
      const n = clampW(wi.w);
      top = '<div class="card"><div class="eyebrow">' + esc(T('hub_h')) + '</div><h2>' + esc(TF('hub_now', { n: wi.w })) + '</h2><p class="small">' + esc(TF('hub_due', { d: S.fmtD(wi.due, { day: 'numeric', month: 'long', year: 'numeric' }) })) + ' · ' + esc(T(wi.from === 'scan' ? 'hub_scan' : 'hub_lmp')) + '</p>' + triBar(n) +
        (wi.w < W_MIN ? '<p class="small" style="color:var(--fg)">' + esc(T('hub_early')) + '</p>' : '') + (wi.days > 294 ? '<div class="flag urgent">' + esc(T('hub_late')) + '</div>' : '') +
        (wi.w >= W_MIN ? '<div class="pg-sizerow">' + sizeArt(n) + '<div class="pg-size"><span class="pg-cmp">' + esc(TF('wk_title', { n: n })) + ': ' + esc(sizeLine(n)) + '</span></div></div>' : '') +
        '<button type="button" class="btn primary" data-go="preg-w-' + n + '">' + esc(TF('hub_read', { n: n })) + '</button></div>';
    } else {
      top = setCard();
    }
    const item = (r, title, sub, ico, gated) => (linkOk(r) ? '<button type="button" class="item" data-go="' + esc(r) + '"><span class="ico-sm">' + ico + '</span><span class="body"><strong>' + esc(title) + '</strong><span>' + esc(sub) + '</span></span>' + (gated && S.flags.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '') + '</button>' : '');
    const tools = [['pregtools-kicks', 'pregtools_t_kicks', 'pregtools_t_kicks_s', S.I.baby, true], ['pregtools-contractions', 'pregtools_t_ctx', 'pregtools_t_ctx_s', S.I.clock, true], ['pregtools-bag', 'pregtools_t_bag', 'pregtools_t_bag_s', S.I.file, false], ['pregtools-birth', 'pregtools_t_birth', 'pregtools_t_birth_s', S.I.heart, false]]
      .filter((x) => has(x[0]) && S.strings.en[x[1]]).map((x) => item(x[0], t(x[1]), t(x[2]), x[3], x[4])).join('');
    const free = '<div class="card"><h3>' + esc(T('hub_free_h')) + '</h3><ul class="pg-ul">' + ['free_1', 'free_2', 'free_3', 'free_4', 'free_5', 'free_amb'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ul>' + goBtn('access-schemes-preg') + '</div>';
    v.innerHTML = S.backRow(T('hub_h'), 'care', false) + '<p class="small">' + esc(T('hub_p')) + '</p>' + top +
      '<h2>' + esc(T('hub_guides')) + '</h2><div class="list">' +
      item('preg-plan', T('plan_h'), T('plan_s'), S.I.check, false) + item('preg-week', T('t_week'), T('t_week_s'), S.I.baby, false) + item('preg-logs', T('t_logs'), T('t_logs_s'), S.I.chart, true) + item('preg-symptoms', T('t_sym'), T('t_sym_s'), S.I.help, true) +
      item('preg-diet', T('t_diet'), T('t_diet_s'), S.I.leaf, false) + item('post-pelvic', T('t_pelvic'), T('t_pelvic_s'), S.I.heart, false) + item('preg-mcp', T('t_mcp'), T('t_mcp_s'), CARD_SVG, false) + item('pregnancy', T('hub_visits'), T('hub_visits_s'), S.I.check, true) + tools + item('pregtest-options', S.t('pregtest_opts'), S.t('pregtest_opts_s'), S.icon('users'), false) + '</div>' +   /* review PLACES-05 */
      '<details class="pg-acc"><summary>' + esc(T('hub_all')) + '</summary><div class="pg-body"><p class="small">' + esc(T('hub_all_p')) + '</p>' + weekGrid(wi ? clampW(wi.w) : -1) + '</div></details>' +
      free + urgentAction() +
      '<div class="card dark"><h3>' + esc(T('hub_ask_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(T('hub_ask_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(T('ask_topic')) + '">' + esc(t('ask_qura')) + '</button></div>' +
      (linkOk('loss') ? '<div class="list">' + item('loss', T('hub_loss'), T('hub_loss_s'), S.I.heart, false).replace('class="item"', 'class="item quiet"') + '</div>' : '');
    S.wire(v); wireSetCard(v);
  }

  /* ---------- week pages ---------- */
  function renderWeekRoute(v) {
    const wi = weekInfo();
    if (wi) return renderWeek(v, clampW(wi.w));
    v.innerHTML = S.backRow(T('t_week'), backTo(), false) + '<p class="small">' + esc(T('wk_p')) + '</p>' +
      setCard() +
      '<div class="card"><h3>' + esc(T('wk_choose')) + '</h3>' + weekGrid(-1) + '</div>' + urgentAction();
    S.wire(v); wireSetCard(v);
  }
  function renderWeek(v, n) {
    if (!W[n]) { renderWeekRoute(v); return; }
    const x = W[n]; const wi = weekInfo(); const mine = wi && wi.w >= W_MIN ? clampW(wi.w) : null; const isMine = mine === n;
    const lenLbl = n <= 13 ? (n <= 6 ? T('wk_sz') : T('wk_len')) : (x.birth ? T('wk_wt_birth') : T('wk_wt'));
    const kindIco = KIND_ICO[x.k] || S.I.leaf;
    let mineNote = '';
    if (isMine) mineNote = '<div class="row"><span class="pill accent">' + esc(T('wk_yours')) + '</span></div>';
    else if (wi) mineNote = '<div class="row spread"><span class="small" style="flex:1">' + esc(TF('wk_youare', { n: wi.w })) + '</span><button type="button" class="btn sm" style="flex-shrink:0" data-go="preg-w-' + mine + '">' + esc(T('wk_goto')) + '</button></div>';
    const prev = n > W_MIN ? '<button type="button" class="btn" data-go="preg-w-' + (n - 1) + '">' + esc(TF('wk_prev', { n: n - 1 })) + '</button>' : '<span></span>';
    const next = n < W_MAX ? '<button type="button" class="btn" data-go="preg-w-' + (n + 1) + '">' + esc(TF('wk_next', { n: n + 1 })) + '</button>' : '<span></span>';
    v.innerHTML = S.backRow(TF('wk_title', { n: n }), backTo(), false) + '<p class="small">' + esc(T('wk_p')) + '</p>' +
      '<div class="card">' + mineNote + triBar(n) + '</div>' +
      '<div class="card"><div class="eyebrow">' + esc(T('wk_baby')) + '</div><div class="pg-sizerow">' + sizeArt(n) + '<div class="pg-size"><span class="small">' + esc(lenLbl) + '</span><span class="pg-big num">' + esc(tx(x.s)) + '</span><span class="pg-cmp">' + esc(tx(x.c)) + '</span></div></div><p>' + esc(tx(x.b)) + '</p></div>' +
      '<div class="card"><div class="eyebrow">' + esc(T('wk_body')) + '</div><p>' + esc(tx(x.y)) + '</p></div>' +
      '<div class="card' + (x.k === 'warn' ? ' warn' : '') + '"><div class="pg-sec"><span class="pg-ico ' + (KIND_CLS[x.k] || '') + '">' + kindIco + '</span><div class="pg-txt"><div class="eyebrow">' + esc(T('k_' + x.k)) + '</div><p style="color:var(--fg)">' + esc(tx(x.tip)) + '</p>' + (goBtn(x.go) ? '<div>' + goBtn(x.go) + '</div>' : '') + '</div></div></div>' +
      (x.scan ? '<div class="card soft"><div class="pg-sec"><span class="pg-ico">' + SCAN_SVG + '</span><div class="pg-txt"><h3>' + esc(T('wk_scan_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(T('wk_scan')) + '</p></div></div></div>' : '') +
      urgentAction() +
      '<div class="pg-nav">' + prev + next + '</div>' +
      '<details class="pg-acc"><summary>' + esc(T('hub_all')) + '</summary><div class="pg-body">' + weekGrid(n) + '</div></details>' +
      '<p class="footnote">' + esc(T('wk_note')) + '</p>';
    S.wire(v);
  }

  /* ---------- logs (gated) ---------- */
  let tab = 'w';
  let sugKind = 'dipsi';
  const TABS = [['w', 'tab_w'], ['bp', 'tab_bp'], ['sug', 'tab_sug'], ['hb', 'tab_hb'], ['tab', 'tab_tab']];
  function entryRow(label, sub, type, id) {
    return '<div class="pg-row"><span class="body"><strong>' + esc(label) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span><button type="button" class="pg-x" data-pg-del="' + esc(type + '|' + id) + '" aria-label="' + esc(T('lg_remove')) + '" title="' + esc(T('lg_remove')) + '">' + X_SVG + '</button></div>';
  }
  function listOf(arr, type, fmt) {
    const rows = byDate(arr).reverse().slice(0, 8);
    return '<div class="stack"><div class="eyebrow">' + esc(T('lg_list')) + '</div>' + (rows.length ? rows.map((e) => { const f = fmt(e); return entryRow(f[0], f[1], type, e.id); }).join('') : '<p class="small">' + esc(T('lg_none')) + '</p>') + '</div>';
  }
  const dateField = (id) => '<div class="pg-field"><label for="' + id + '">' + esc(T('lg_date')) + '</label><input type="date" id="' + id + '" value="' + todayISO() + '" max="' + todayISO() + '"></div>';
  const numField = (id, lbl, ph) => '<div class="pg-field"><label for="' + id + '">' + esc(lbl) + '</label><input id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="' + esc(ph) + '"></div>';
  const saveBtn = () => '<button type="button" class="btn primary block" id="pg-save">' + esc(t('save')) + '</button>';
  function glance(st) {
    const w = latest(st.w), b = latest(st.bp), d = latest(st.sug.filter((e) => e.k === 'dipsi')), h = latest(st.hb);
    const stat = (val, lbl, when) => '<div class="stat"><b class="num">' + esc(val) + '</b><span>' + esc(lbl) + (when ? ' · ' + esc(fd(when)) : '') + '</span></div>';
    return '<div class="card pg-glance"><h3>' + esc(T('lg_glance')) + '</h3><div class="statgrid">' +
      stat(w ? num1(w.v) + ' kg' : T('lg_dash'), T('tab_w'), w && w.d) + stat(b ? b.s + '/' + b.di : T('lg_dash'), T('tab_bp'), b && b.d) +
      stat(d ? d.v + ' mg/dL' : T('lg_dash'), T('sug_d_short'), d && d.d) + stat(h ? num1(h.v) + ' g/dL' : T('lg_dash'), T('tab_hb'), h && h.d) + '</div>' +
      '<p class="small">' + esc(T('lg_ifa7')) + ': <span class="num" style="color:var(--fg);font-weight:600">' + tabDays(st, 'ifa', 7) + '/7</span> · ' + esc(T('tb_ca')) + ': <span class="num" style="color:var(--fg);font-weight:600">' + tabDays(st, 'ca', 7) + '/7</span></p></div>';
  }
  function tabBody(st) {
    const wi = weekInfo();
    if (tab === 'w') {
      const a = byDate(st.w); const gain = a.length > 1 ? a[a.length - 1].v - a[0].v : null;
      return '<div class="card">' + (a.length ? '<div class="small">' + esc(T('w_chart')) + '</div>' + chart({ series: [{ pts: a }], aria: T('w_chart'), fmt: (v) => num1(v), minPad: 1 }) : '') +
        (gain != null ? '<p class="small" style="color:var(--fg)">' + esc(TF('w_gain', { x: (gain > 0 ? '+' : '') + num1(gain) })) + '</p>' : '') +
        '<div class="grid2">' + dateField('pg-d') + numField('pg-v', T('w_lbl'), '55.5') + '</div>' + saveBtn() + '</div>' +
        '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('w_note')) + '</p></div>' + '<div class="card">' + listOf(st.w, 'w', (e) => [num1(e.v) + ' kg', fdy(e.d)]) + '</div>';
    }
    if (tab === 'bp') {
      const a = byDate(st.bp);
      return flagsFor(st, 'bp') + '<div class="card">' + (a.length ? '<div class="small">' + esc(T('bp_chart')) + '</div>' + chart({ series: [{ pts: a.map((e) => ({ d: e.d, v: e.s })) }, { pts: a.map((e) => ({ d: e.d, v: e.di })), dash: true, below: true }], refs: [{ v: 140, label: '140' }, { v: 90, label: '90' }], aria: T('bp_chart'), step: 10, minPad: 5 }) : '') +
        dateField('pg-d') + '<div class="grid2">' + numField('pg-s', T('bp_sys'), '110') + numField('pg-di', T('bp_dia'), '70') + '</div>' +
        '<label class="pg-check"><input type="checkbox" id="pg-sym"> <span>' + esc(T('bp_sym')) + '</span></label>' + saveBtn() + '</div>' +
        '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('bp_note')) + '</p></div><div class="card">' + listOf(st.bp, 'bp', (e) => [e.s + '/' + e.di, fdy(e.d) + (e.sym ? ' · ' + T('bp_sym') : '')]) + '</div>';
    }
    if (tab === 'sug') {
      const di = byDate(st.sug.filter((e) => e.k === 'dipsi')), fa = byDate(st.sug.filter((e) => e.k === 'fast'));
      const doneLate = wi && di.some((e) => S.diffDays(S.fromISO(wi.basis), S.fromISO(e.d)) >= 24 * 7);
      const due = wi && wi.w >= 24 && wi.w <= 28 && !doneLate ? '<div class="card soft"><div class="pg-sec"><span class="pg-ico">' + S.I.bell + '</span><p class="pg-txt" style="color:var(--fg);align-self:center">' + esc(T('sug_due')) + '</p></div></div>' : '';
      return flagsFor(st, 'sug') + due + '<div class="card">' +
        (di.length ? '<div class="small">' + esc(T('sug_chart')) + '</div>' + chart({ series: [{ pts: di }], refs: [{ v: 140, label: '140' }], aria: T('sug_chart'), step: 10, minPad: 10, floor: 0 }) : '') +
        (fa.length ? '<div class="small">' + esc(T('sug_chart_f')) + '</div>' + chart({ series: [{ pts: fa }], aria: T('sug_chart_f'), step: 10, minPad: 10, floor: 0 }) : '') +
        '<label>' + esc(T('sug_kind')) + '</label><div class="chips">' + [['dipsi', 'sug_d'], ['fast', 'sug_f']].map((k) => '<button type="button" class="chip' + (sugKind === k[0] ? ' on' : '') + '" data-pg-sk="' + k[0] + '">' + esc(T(k[1])) + '</button>').join('') + '</div>' +
        '<div class="grid2">' + dateField('pg-d') + numField('pg-v', T('sug_lbl'), '110') + '</div>' + saveBtn() + '</div>' +
        '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('sug_how')) + '</p><p class="small">' + esc(T('sug_fnote')) + '</p></div>' +
        '<div class="card">' + listOf(st.sug, 'sug', (e) => [e.v + ' mg/dL', fdy(e.d) + ' · ' + T(e.k === 'dipsi' ? 'sug_d_short' : 'sug_f_short')]) + '</div>';
    }
    if (tab === 'hb') {
      const a = byDate(st.hb);
      return flagsFor(st, 'hb') + '<div class="card">' + (a.length ? '<div class="small">' + esc(T('hb_chart')) + '</div>' + chart({ series: [{ pts: a }], refs: [{ v: 11, label: '11' }], aria: T('hb_chart'), fmt: (v) => num1(v), minPad: 0.6 }) : '') +
        '<div class="grid2">' + dateField('pg-d') + numField('pg-v', T('hb_lbl'), '11.2') + '</div>' + saveBtn() + '</div>' +
        '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('hb_note')) + '</p></div><div class="card">' + listOf(st.hb, 'hb', (e) => [num1(e.v) + ' g/dL', fdy(e.d)]) + '</div>';
    }
    /* tablets */
    const days = []; for (let i = 6; i >= 0; i--) days.push(S.addDays(S.today(), -i));
    const row = (key, lbl) => '<span class="pg-rl">' + esc(lbl) + '</span>' + days.map((d) => { const k = S.toISO(d); const on = tabOn(st, key, k); return '<button type="button" class="pg-tick' + (on ? ' on' : '') + '" data-pg-tick="' + key + '|' + k + '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(lbl + ' ' + S.fmtD(d, { weekday: 'long', day: 'numeric', month: 'short' })) + '">' + (on ? TICK_SVG : '') + '</button>'; }).join('');
    const ironOn = !!(S.iron && S.iron.active()); const remOn = !!(S.reminders.get(ironOn ? 'preg-ca' : 'preg-ifa'));
    return '<div class="card"><h3>' + esc(T('tb_week')) + '</h3><p class="small">' + esc(T('tb_tap')) + '</p><div class="pg-ticks"><span></span>' + days.map((d) => '<span class="pg-dh">' + esc(S.fmtD(d, { weekday: 'narrow' })) + '<br><span class="num">' + d.getDate() + '</span></span>').join('') + row('ifa', T('tb_ifa_s')) + row('ca', T('tb_ca')) + '</div>' +
      '<p class="small" style="color:var(--fg)">' + esc(TF('tb_count', { k: T('tb_ifa_s'), n: tabDays(st, 'ifa', 7) })) + ' · ' + esc(TF('tb_count', { k: T('tb_ca'), n: tabDays(st, 'ca', 7) })) + '</p><p class="small">' + esc(TF('tb_total', { a: tabTotal(st, 'ifa'), b: tabTotal(st, 'ca') })) + '</p></div>' +
      '<div class="card"><div class="row spread"><span class="small" style="color:var(--fg);font-weight:600;flex:1">' + esc(T(ironOn ? 'tb_rem_ca' : 'tb_rem')) + '</span><button type="button" class="btn sm' + (remOn ? ' on' : '') + '" id="pg-rem">' + esc(remOn ? T('tb_rem_on') : T('tb_rem_off')) + '</button></div>' +
      (S.routeOwner && S.routeOwner('iron') ? '<button type="button" class="btn sm" style="align-self:flex-start" data-go="iron">' + esc(T(ironOn ? 'tb_iron_on' : 'tb_iron')) + '</button>' : '') + '</div>' +
      '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('tb_how')) + '</p><p class="small">' + esc(T('tb_side')) + '</p></div>';
  }
  function renderLogs(v) {
    const can = S.canSave(); const st = store();
    if (!can) {
      v.innerHTML = S.backRow(T('lg_h'), backTo(), true) + '<p class="small">' + esc(T('lg_p')) + '</p>' + S.needDiary() +
        '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('bp_today')) + '</p><p class="small" style="color:var(--fg)">' + esc(T('bp_urgent')) + '</p><p class="small" style="color:var(--fg)">' + esc(T('sug_how')) + '</p><p class="small">' + esc(T('hb_note')) + '</p></div>' + '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T('tb_how')) + '</p></div>';
      S.wire(v); return;
    }
    v.innerHTML = S.backRow(T('lg_h'), backTo(), true) + '<p class="small">' + esc(T('lg_p')) + '</p>' + flagsFor(st, null, tab) + glance(st) +
      '<div class="chips pg-tabs" role="tablist">' + TABS.map((x) => '<button type="button" class="chip' + (tab === x[0] ? ' on' : '') + '" role="tab" aria-selected="' + (tab === x[0]) + '" data-pg-tab="' + x[0] + '">' + esc(T(x[1])) + '</button>').join('') + '</div>' +
      tabBody(st) + '<p class="footnote">' + esc(t('doc_sees')) + '</p>';
    S.wire(v);
    const $ = (id) => v.querySelector('#' + id);
    v.querySelectorAll('[data-pg-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.pgTab; S.render(); }));
    v.querySelectorAll('[data-pg-sk]').forEach((b) => b.addEventListener('click', () => { sugKind = b.dataset.pgSk; v.querySelectorAll('[data-pg-sk]').forEach((x) => x.classList.toggle('on', x === b)); }));
    v.querySelectorAll('[data-pg-del]').forEach((b) => b.addEventListener('click', () => { const p = b.dataset.pgDel.split('|'); st[p[0]] = st[p[0]].filter((e) => e.id !== p[1]); S.save(); S.render(); }));
    v.querySelectorAll('[data-pg-tick]').forEach((b) => b.addEventListener('click', () => { const p = b.dataset.pgTick.split('|'); if (p[0] === 'ifa' && S.iron) { S.iron.mark(p[1], !S.iron.taken(p[1])); S.render(); return; } const day = st.tabs[p[1]] || (st.tabs[p[1]] = {}); day[p[0]] = !day[p[0]]; if (!day.ifa && !day.ca) delete st.tabs[p[1]]; S.save(); S.render(); }));
    const rem = $('pg-rem'); if (rem) rem.addEventListener('click', () => {
      if (S.iron && S.iron.active()) {   /* the iron companion has the iron reminder: this button is for calcium only */
        if (S.reminders.get('preg-ca')) { S.reminders.remove('preg-ca'); S.toast(T('tb_rem_gone')); }
        else { S.reminders.upsert({ id: 'preg-ca', mod: 'preg', title: { en: 'Calcium tablet with lunch and dinner', hi: 'दोपहर और रात के खाने के साथ calcium की गोली' }, kind: 'med', start: todayISO(), every: 1, time: '13:00' }); S.toast(T('tb_rem_done')); }
        S.render(); return;
      }
      if (S.reminders.get('preg-ifa')) { S.reminders.remove('preg-ifa'); S.reminders.remove('preg-ca'); S.toast(T('tb_rem_gone')); }
      else { S.reminders.upsert({ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA tablet, 2 hours after a meal', hi: 'IFA की गोली, खाने के 2 घंटे बाद' }, kind: 'med', start: todayISO(), every: 1, time: '21:00' }); S.reminders.upsert({ id: 'preg-ca', mod: 'preg', title: { en: 'Calcium tablet with lunch and dinner', hi: 'दोपहर और रात के खाने के साथ calcium की गोली' }, kind: 'med', start: todayISO(), every: 1, time: '13:00' }); S.toast(T('tb_rem_done')); }
      S.render();
    });
    const sv = $('pg-save'); if (sv) sv.addEventListener('click', () => {
      const d = ($('pg-d') && $('pg-d').value) || todayISO(); const bad = () => S.toast(T('lg_bad'));
      if (d > todayISO()) return bad();
      if (tab === 'w') { const x = parseNum($('pg-v').value); if (!(x >= 25 && x <= 200)) return bad(); st.w.push({ id: uid(), d: d, v: Math.round(x * 10) / 10 }); }
      else if (tab === 'bp') { const s = Math.round(parseNum($('pg-s').value)), di = Math.round(parseNum($('pg-di').value)); if (!(s >= 60 && s <= 260 && di >= 30 && di <= 160 && s > di)) return bad(); st.bp.push({ id: uid(), d: d, s: s, di: di, sym: !!($('pg-sym') && $('pg-sym').checked) }); }
      else if (tab === 'sug') { const x = Math.round(parseNum($('pg-v').value)); if (!(x >= 20 && x <= 600)) return bad(); st.sug.push({ id: uid(), d: d, k: sugKind, v: x }); }
      else if (tab === 'hb') { const x = parseNum($('pg-v').value); if (!(x >= 2 && x <= 22)) return bad(); st.hb.push({ id: uid(), d: d, v: Math.round(x * 10) / 10 }); }
      S.save(); S.toast(t('saved')); S.render();
    });
  }

  /* ---------- symptoms (gated) ---------- */
  function renderSymptoms(v) {
    const flag = (w) => '<div class="flag' + (w.lvl === 'urgent' ? ' urgent' : '') + '">' + esc(tx(w)) + '</div>';
    v.innerHTML = S.backRow(T('sy_h'), backTo(), true) + '<p class="small">' + esc(T('sy_p')) + '</p>' + urgentAction() +
      SYM.map((s) => '<details class="pg-acc" id="pg-sy-' + s.id + '"><summary>' + esc(tx(s.h)) + '</summary><div class="pg-body"><div class="eyebrow">' + esc(T('sy_helps')) + '</div><ul>' + s.help.map((h) => '<li>' + esc(tx(h)) + '</li>').join('') + '</ul><div class="eyebrow">' + esc(T('sy_worry')) + '</div><div class="pg-flags">' + s.worry.map(flag).join('') + '</div></div></details>').join('') +
      (linkOk('preg-logs') ? '<button type="button" class="action" data-go="preg-logs"><span class="ico">' + S.I.chart + '</span><span class="body"><strong>' + esc(T('t_logs')) + '</strong><span class="small">' + esc(T('t_logs_s')) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' : '') +
      '<p class="footnote">' + esc(T('sy_src')) + '</p>';
    S.wire(v);
  }

  /* ---------- food (open) ---------- */
  /* Version 39.8 (diet audit VD-01): the day's foods from the table as pictures, and the 4th month's extra as a picture sum
     (the reviewed line: roughly one roti, a bowl of dal and a glass of milk) */
  function dayPics() {
    if (!(S.food && S.food.strip)) return ''; const dt = S.food.diet ? S.food.diet() : { type: 'veg', milk: true };
    return S.food.strip([['roti', { en: 'Roti', hi: 'रोटी' }], ['chawal_k', { en: 'Rice', hi: 'चावल' }], ['ragi', { en: 'Ragi', hi: 'रागी' }], ['dal', { en: 'Dal', hi: 'दाल' }], ['rajma', { en: 'Rajma', hi: 'राजमा' }]].concat(dt.milk !== false ? [['milk', { en: 'Milk', hi: 'दूध' }], ['dahi', { en: 'Curd', hi: 'दही' }]] : [], [['sabzi', { en: 'Vegetables', hi: 'सब्ज़ियाँ' }], ['saag', { en: 'Green leafy', hi: 'हरी पत्तेदार' }], ['amrood', { en: 'Guava', hi: 'अमरूद' }], ['kela', { en: 'Banana', hi: 'केला' }], ['moongfali', { en: 'Peanuts', hi: 'मूँगफली' }]]), '');
  }
  /* V39.8 review PICTURES-06: the 4th month's extra (one roti, a katori of dal, a glass of milk) shows from week 13, under the
     reviewed words that say when; no milk glass for a woman who takes no milk */
  function extraPics() {
    const wi = weekInfo(); if (!(S.art && S.art.food) || !wi || wi.w < 13 || (S.food && S.food.diet && S.food.diet().milk === false)) return ''; const it = (k, l) => '<span class="fs-it">' + S.art.food(k) + '<span>' + esc(tx(l)) + '</span></span>';
    return '<div class="food-sum" role="img" aria-label="' + esc(tx({ en: 'One roti, a bowl of dal and a glass of milk', hi: 'एक रोटी, एक कटोरी दाल और एक गिलास दूध' })) + '">' + it('roti', { en: '1 roti', hi: '1 रोटी' }) + '<span class="fsum-p">+</span>' + it('dal', { en: '1 katori dal', hi: '1 कटोरी दाल' }) + '<span class="fsum-p">+</span>' + it('milk', { en: '1 glass milk', hi: '1 गिलास दूध' }) + '</div>';
  }
  function renderDiet(v) {
    const li = (arr) => '<ul class="pg-ul">' + arr.map((x) => '<li>' + esc(tx(x)) + '</li>').join('') + '</ul>';
    v.innerHTML = S.backRow(T('dt_h'), backTo(), false) + '<p class="small">' + esc(T('dt_p')) + '</p>' +
      '<div class="card" data-nofold="1"><h3>' + esc(tx(DIET.more_h)) + '</h3>' + li(DIET.more) + extraPics() + '</div>' +
      '<div class="card" data-nofold="1"><h3>' + esc(tx(DIET.plate_h)) + '</h3>' + dayPics() + '<dl class="kv pg-kv">' + DIET.plate.map((r) => '<dt>' + esc(tx(r[0])) + '</dt><dd class="num">' + esc(r[1]) + '</dd>').join('') + '</dl><p class="small">' + esc(tx(DIET.plate_n)) + '</p></div>' +
      DIET.cards.map((c) => '<div class="card"><h3>' + esc(tx(c.h)) + '</h3>' + c.p.map((p) => '<p class="pg-p">' + esc(tx(p)) + '</p>').join('') + '</div>').join('') +
      '<div class="card warn"><h3>' + esc(tx(DIET.avoid_h)) + '</h3>' + li(DIET.avoid) + '</div>' +
      '<div class="card"><h3>' + esc(tx(DIET.safe_h)) + '</h3>' + li(DIET.safe) + '</div>' +
      '<div class="card ok"><h3 style="color:var(--ok)">' + esc(tx(DIET.free_h)) + '</h3><p class="pg-p" style="color:var(--ok)">' + esc(tx(DIET.free)) + '</p></div>' +
      '<h2>' + esc(T('dt_myths')) + '</h2>' +
      DIET.myths.map((m, i) => '<details class="pg-acc" id="pg-myth-' + i + '"><summary>' + esc(tx(m.q)) + '</summary><div class="pg-body"><p>' + esc(tx(m.a)) + '</p></div></details>').join('') +
      '<div class="card dark"><h3>' + esc(tx(DIET.ask_h)) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(tx(DIET.ask_p)) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(T('ask_topic_diet')) + '">' + esc(t('ask_qura')) + '</button></div>' +
      (S.routeOwner && S.routeOwner('periods-fasting') ? '<button type="button" class="btn sm" data-go="periods-fasting">' + esc(T('dt_fast')) + '</button>' : '') +   /* Version 39.9 */
      '<p class="footnote">' + esc(T('dt_src')) + ' <a href="' + DGI_URL + '" target="_blank" rel="noopener">' + esc(T('dt_link')) + '</a></p>';
    S.wire(v);
  }

  /* ---------- MCP card copy (open; saving needs a diary) ---------- */
  const RISKS = ['r_hr', 'r_bp', 'r_an', 'r_gdm', 'r_cs', 'r_tw', 'r_prev', 'r_age', 'r_oth'];
  function renderMcp(v) {
    const can = S.canSave(); const st = store(); const m = st.mcp; const wi = weekInfo();
    const head = S.backRow(T('mcp_h'), backTo(), false) + '<p class="small">' + esc(T('mcp_p')) + '</p>';
    if (!can) {
      v.innerHTML = head + S.needDiary() + '<div class="card soft"><ul>' + ['mcp_rch', 'mcp_bg', 'mcp_edd', 'mcp_td', 'mcp_anc', 'mcp_hb', 'mcp_bpr', 'mcp_risk'].map((k) => '<li>' + esc(T(k)) + '</li>').join('') + '</ul><p class="small">' + esc(T('mcp_anc_win')) + '</p></div>';
      S.wire(v); return;
    }
    const bgSel = '<h3>' + esc(T('mcp_bg')) + '</h3><div class="grid2"><div class="pg-field"><label for="pg-bg">' + esc(T('mcp_bg1')) + '</label><select id="pg-bg"><option value="">' + esc(T('mcp_bg_unk')) + '</option>' + ['A', 'B', 'AB', 'O'].map((g) => '<option value="' + g + '"' + (m.bg === g ? ' selected' : '') + '>' + g + '</option>').join('') + '</select></div>' +
      '<div class="pg-field"><label for="pg-rh">' + esc(T('mcp_rh')) + '</label><select id="pg-rh"><option value="">' + esc(T('mcp_bg_unk')) + '</option><option value="+"' + (m.rh === '+' ? ' selected' : '') + '>' + esc(T('rh_pos')) + '</option><option value="-"' + (m.rh === '-' ? ' selected' : '') + '>' + esc(T('rh_neg')) + '</option></select></div></div>';
    const dateIn = (id, lbl, val) => '<div class="pg-field"><label for="' + id + '">' + esc(lbl) + '</label><input type="date" id="' + id + '" value="' + esc(val || '') + '"></div>';
    const anc = byDate(m.anc.map((d) => ({ d: d }))).map((x) => x.d);
    const ancRows = anc.map((d, i) => '<div class="pg-row"><span class="body"><strong>' + esc(fdy(d)) + '</strong>' + (wi ? '<span>' + esc(TF('mcp_anc_wk', { n: Math.max(0, Math.floor(S.diffDays(S.fromISO(wi.basis), S.fromISO(d)) / 7)) })) + '</span>' : '') + '</span><button type="button" class="pg-x" data-pg-anc-del="' + esc(d) + '" aria-label="' + esc(T('lg_remove')) + '" title="' + esc(T('lg_remove')) + '">' + X_SVG + '</button></div>').join('');
    const hbs = byDate(st.hb).reverse().slice(0, 4), bps = byDate(st.bp).reverse().slice(0, 4);
    const fromLogs = (title, rows) => '<div class="stack"><div class="eyebrow">' + esc(title) + '</div>' + (rows.length ? '<dl class="kv">' + rows.join('') + '</dl>' : '<p class="small">' + esc(T('mcp_none')) + '</p>') + '</div>';
    const anyRisk = RISKS.some((k) => m.risk[k]);
    v.innerHTML = head +
      '<div class="card"><h3>' + esc(T('mcp_reg')) + '</h3><div class="pg-field"><label for="pg-rch">' + esc(T('mcp_rch')) + '</label><input id="pg-rch" autocomplete="off" value="' + esc(m.rch || '') + '"></div><p class="small">' + esc(T('mcp_rch_n')) + '</p>' + dateIn('pg-regd', T('mcp_regd'), m.regd) + '</div>' +
      '<div class="card">' + bgSel + (m.rh === '-' ? '<div class="flag">' + esc(T('mcp_rhneg')) + '</div>' : '') + '</div>' +
      '<div class="card">' + dateIn('pg-edd', T('mcp_edd'), m.edd) + (wi ? '<button type="button" class="btn sm" id="pg-edd-fill">' + esc(T('mcp_edd_b')) + '</button>' : '') + '<p class="small">' + esc(T('mcp_edd_n')) + '</p></div>' +
      '<div class="card"><h3>' + esc(T('mcp_td')) + '</h3>' + dateIn('pg-td1', T('mcp_td1'), m.td1) + dateIn('pg-td2', T('mcp_td2'), m.td2) + dateIn('pg-tdb', T('mcp_tdb'), m.tdb) + '</div>' +
      '<div class="card"><h3>' + esc(T('mcp_anc')) + '</h3><p class="small">' + esc(T('mcp_anc_win')) + '</p>' + (anc.length ? '<div class="stack">' + ancRows + '</div><p class="small" style="color:var(--fg)">' + esc(TF('mcp_anc_n', { n: anc.length })) + '</p>' : '<p class="small">' + esc(T('mcp_none')) + '</p>') +
      '<div class="row"><input type="date" id="pg-anc" value="' + todayISO() + '" max="' + todayISO() + '" aria-label="' + esc(T('mcp_anc_add')) + '"><button type="button" class="btn sm" id="pg-anc-add" style="flex-shrink:0">' + esc(T('mcp_anc_add')) + '</button></div></div>' +
      '<div class="card"><div class="grid2 pg-two">' + fromLogs(T('mcp_hb'), hbs.map((e) => '<dt>' + esc(fd(e.d)) + '</dt><dd>' + esc(num1(e.v)) + '</dd>')) + fromLogs(T('mcp_bpr'), bps.map((e) => '<dt>' + esc(fd(e.d)) + '</dt><dd>' + esc(e.s + '/' + e.di) + '</dd>')) + '</div><p class="small">' + esc(T('mcp_fromlogs')) + '</p>' + (linkOk('preg-logs') ? '<button type="button" class="btn sm" data-go="preg-logs">' + esc(T('mcp_addlogs')) + '</button>' : '') + '</div>' +
      '<div class="card"><h3>' + esc(T('mcp_risk')) + '</h3><p class="small">' + esc(T('mcp_risk_p')) + '</p><div class="checklist">' + RISKS.map((k) => '<label class="' + (m.risk[k] ? 'done' : '') + '"><input type="checkbox" data-pg-risk="' + k + '"' + (m.risk[k] ? ' checked' : '') + '> <span>' + esc(T(k)) + '</span></label>').join('') + '</div>' +
      '<div class="pg-field"><label for="pg-rnote">' + esc(T('r_note')) + '</label><textarea id="pg-rnote" rows="2">' + esc(m.rnote || '') + '</textarea></div>' +
      (anyRisk ? '<div class="flag">' + esc(T('r_marked')) + '</div>' : '') + '</div>' +
      '<button type="button" class="btn primary block" id="pg-mcp-save">' + esc(T('mcp_save')) + '</button>' +
      '<p class="footnote">' + esc(t('notice_text')) + '</p>';
    S.wire(v);
    const $ = (id) => v.querySelector('#' + id);
    const collect = () => { m.rch = $('pg-rch').value.trim().slice(0, 40); m.regd = $('pg-regd').value || ''; m.bg = $('pg-bg').value; m.rh = $('pg-rh').value; m.edd = $('pg-edd').value || ''; m.td1 = $('pg-td1').value || ''; m.td2 = $('pg-td2').value || ''; m.tdb = $('pg-tdb').value || ''; m.rnote = $('pg-rnote').value.slice(0, 400); };
    const planUp = () => { const wi2 = weekInfo(); if (wi2) planSync(st, wi2); };   /* a visit or Td date can complete a plan item */
    $('pg-mcp-save').addEventListener('click', () => { collect(); planUp(); S.save(); S.toast(t('saved')); S.render(); });
    ['pg-rch', 'pg-regd', 'pg-bg', 'pg-rh', 'pg-edd', 'pg-td1', 'pg-td2', 'pg-tdb', 'pg-rnote'].forEach((id) => { const el = $(id); if (el) el.addEventListener('change', () => { const wasNeg = m.rh === '-'; collect(); S.save(); if ((m.rh === '-') !== wasNeg) S.render(); }); });
    const ef = $('pg-edd-fill'); if (ef) ef.addEventListener('click', () => { $('pg-edd').value = S.toISO(S.addDays(S.fromISO(wi.lmp), 280)); });
    $('pg-anc-add').addEventListener('click', () => { const d = $('pg-anc').value; if (!d || d > todayISO()) { S.toast(T('lg_bad')); return; } collect(); if (m.anc.indexOf(d) < 0) m.anc.push(d); planUp(); S.save(); S.toast(t('saved')); S.render(); });
    v.querySelectorAll('[data-pg-anc-del]').forEach((b) => b.addEventListener('click', () => { collect(); m.anc = m.anc.filter((d) => d !== b.dataset.pgAncDel); S.save(); S.render(); }));
    v.querySelectorAll('[data-pg-risk]').forEach((c) => c.addEventListener('change', () => { collect(); m.risk[c.dataset.pgRisk] = c.checked; if (!c.checked) delete m.risk[c.dataset.pgRisk]; S.save(); S.render(); }));
  }

  /* No week to show: not pregnant yet ("I am pregnant"), or pregnant with no date ("Add the date"). Both open the stage sheet,
     which asks for the due date on the scan report or the last period. */
  const setCard = () => { const preg = !!(S.state.situation || {}).pregnant; return '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(T(preg ? 'hub_nodate' : 'hub_set')) + '</p>' + (S.canSave() ? '<button type="button" class="btn sm" data-pg-stage="1">' + esc(T(preg ? 'hub_nodate_b' : 'hub_set_b')) + '</button>' : '') + '</div>'; };
  const wireSetCard = (v) => v.querySelectorAll('[data-pg-stage]').forEach((b) => b.addEventListener('click', () => S.openStage('preg')));
  /* ---------- hooks ---------- */
  function home() {
    const wi = weekInfo(); if (!wi || !S.canSave()) return '';
    /* More than 42 weeks (294 days) by her dates: the hospital today, at the top of Home. "Not yet" on the baby prompt cannot hide this. */
    if (wi.days > 294) return '<div class="flag urgent pg-late" data-xp-urgent="1">' + esc(T('hub_late')) + '</div>';
    if (wi.w < W_MIN || wi.w > W_MAX) return '';
    return '<button type="button" class="action" data-go="preg-week"><span class="ico ' + (S.art ? 'hue hue-orange pg-ico-art' : 'accent') + '">' + (S.art ? S.art.produce(clampW(wi.w)) : S.I.baby) + '</span><span class="body"><strong>' + esc(S.art ? TF('home_line2', { n: wi.w }) : TF('home_line', { n: wi.w, s: sizeLine(wi.w) })) + '</strong><span class="small">' + esc(T('home_sub')) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }
  /* Home's Today (Version 30; it was a "Due now" strip at the top of Home): what her plan has due now, never in discreet mode and not
     after 42 weeks, when Home's urgent flag takes over; and her IFA or calcium tablet while its reminder is on and today's isn't
     ticked in the logs. The tablet's words are its reminder's, already checked; plain words in discreet mode. */
  function today() {
    if (!S.canSave() || !S.cycle.isPregnant()) return null; const out = []; const st = store(); const k = todayISO(); const disc = !!S.state.settings.discreet;
    const tab = (key, remId, ord) => { const r = S.reminders.get(remId); if (!r || r.on === false || tabOn(st, key, k)) return;
      out.push({ id: 'preg-' + key, order: ord, icon: 'pill', hue: 'orange', title: disc ? S.t('d_reminder') : S.reminders.text(r), sub: r.time || '', go: 'preg-logs', rem: [remId],
        act: () => { const s2 = store(); const day = s2.tabs[k] || (s2.tabs[k] = {}); day[key] = true; S.save(); } }); };
    if (!(S.iron && S.iron.active())) tab('ifa', 'preg-ifa', 13);
    tab('ca', 'preg-ca', 14);
    const wi = weekInfo();
    if (!disc && wi && wi.days <= 294 && wi.w >= W_MIN && wi.w <= W_MAX && !planOwns()) {
      const due = dueNames();
      if (due.length) out.push({ id: 'preg-plan', order: 20, icon: 'check', hue: 'orange', title: TF('plan_home', { x: due.length > 1 ? TF('plan_home_more', { x: due[0], n: due.length - 1 }) : due[0] }), sub: T('plan_h'), go: 'preg-plan' });
    }
    return out;
  }
  /* Home's setup card: the plan's reminders */
  function setup() {
    if (!S.canSave() || !S.cycle.isPregnant() || !weekInfo()) return null;
    return { id: 'preg-plan', order: 20, title: T('setup_plan'), sub: T(docR() ? 'plan_rem_s_doc' : 'plan_rem_s'), go: 'preg-plan', done: !!planOf(store()).rem };
  }
  /* ---------- My pregnancy plan (Version 28; docs/feature-research-2026-10-22.md, A1) ----------
     What is due from her weeks: the four check-ups and their free tests, Td, the scans, PMSMA on the 9th, the 75 g sugar test,
     iron and calcium, scheme money, the birth plan, her ASHA's number and family planning. Each item's words are that week's
     verified tip (W). Done comes from what she already keeps wherever it can: MCP card visits, registration and Td dates, the
     75 g test in the logs, her iron plan, her ASHA's number. Anything else she ticks. A missed window is never an alarm, only
     "ask your ANM at your next visit". Only her dates decide what shows; nothing judges her entries. */
  const wkOf = (wi, isoD) => Math.floor(S.diffDays(S.fromISO(wi.basis), S.fromISO(isoD)) / 7);
  const ancIn = (st, wi, a, b) => st.mcp.anc.some((d) => { const w = wkOf(wi, d); return w >= a && w <= b; });
  /* Version 39.28: where she gets care (S.care). With a private gynaecologist, or before she says where she goes, the plan
     names her gynaecologist and her reports (the week tips' doc words); registration, PMSMA, JSSK and scheme money (gov) move
     to one quiet line, and stay in Explore. The tests and their weeks are the same for everyone. */
  const docR = () => !!(S.care && S.care.gov && !S.care.gov());

  const piName = (id) => (docR() && P['pi_' + id + '_doc'] ? P['pi_' + id + '_doc'] : P['pi_' + id]);   /* [en, hi] */
  const piText = (id) => tx({ en: piName(id)[0], hi: piName(id)[1] });
  const PLAN = [
    { id: 'reg', gov: true, w: [0, 12], tip: 5, go: 'preg-mcp', auto: (st) => !!st.mcp.regd },
    { id: 'folic', w: [0, 12], tip: 4 },
    { id: 'anc1', w: [0, 12], tip: 9, go: 'preg-mcp', rem: true, auto: (st, wi) => ancIn(st, wi, 0, 13) },
    { id: 'td', w: [0, 36], tip: 10, go: 'preg-mcp', ext: ['https://uwinselfregistration.mohfw.gov.in/login', 'plan_uwin'], auto: (st) => !!((st.mcp.td1 && st.mcp.td2) || st.mcp.tdb) },
    { id: 'scan1', w: [11, 14], tip: 11 },
    /* Version 39.0: done once she has applied for PMMVY or JSY in her claims (access.js), so it stops showing as due */
    { id: 'scheme', gov: true, w: [5, 40], tip: 12, go: 'access-schemes-preg', auto: () => !!(S.access && S.access.claimed && ['pmmvy', 'jsy'].some((k) => ['applied', 'got', 'got2'].indexOf(S.access.claimed(k, (S.state.situation || {}).pregnantSince)) >= 0)) },
    { id: 'ifa', w: [13, 40], tip: 14, go: 'iron', auto: () => !!(S.iron && S.iron.active()) },
    { id: 'ca', w: [14, 40], tip: 15, go: 'preg-logs' },
    { id: 'anc2', w: [14, 26], tip: 16, go: 'preg-mcp', rem: true, auto: (st, wi) => ancIn(st, wi, 14, 26) },
    { id: 'scan2', w: [18, 20], tip: 18, rem: true },   /* the verified tip says 18–20 weeks */
    { id: 'pmsma', gov: true, w: [13, 40], tip: 23, pmsma: true, ext: ['https://pmsma.mohfw.gov.in/pmsma-nearest-health-facility/', 'plan_pmsma_find'] },
    { id: 'ogtt', w: [24, 28], tip: 24, go: 'preg-logs', rem: true, auto: (st, wi) => st.sug.some((x) => x.k === 'dipsi' && wkOf(wi, x.d) >= 24 && wkOf(wi, x.d) <= 28) },
    { id: 'anc3', w: [28, 34], tip: 27, go: 'preg-mcp', rem: true, auto: (st, wi) => ancIn(st, wi, 28, 34) },
    { id: 'jssk', gov: true, w: [28, 40], tip: 29, go: 'access-schemes-preg' },
    { id: 'birth', w: [32, 40], tip: 33, go: 'pregtools-bag' },
    { id: 'asha', w: [32, 40], tip: 34, go: 'asha', auto: () => !!(S.asha && S.asha.saved()) },
    { id: 'anc4', w: [36, 41], tip: 36, go: 'preg-mcp', rem: true, auto: (st, wi) => ancIn(st, wi, 36, 42) },
    { id: 'fp', w: [36, 40], tip: 39, go: 'post-contra' },
    { id: 'w41', w: [41, 42], tip: 41, only: true }
  ];
  const planOf = (st) => { const pl = st.plan && typeof st.plan === 'object' ? st.plan : (st.plan = {}); if (!pl.done || typeof pl.done !== 'object') pl.done = {}; if (!Array.isArray(pl.pmsma)) pl.pmsma = []; return pl; };
  const dayOfWeek = (wi, n) => S.addDays(S.fromISO(wi.basis), n * 7);
  /* the 9th of each month from today until the due date */
  const ninths = (wi) => { const out = []; const td = S.today(); let x = new Date(td.getFullYear(), td.getMonth(), 9); if (x < td) x = new Date(td.getFullYear(), td.getMonth() + 1, 9); const end = wi.due; while (x <= end && out.length < 8) { if (wkOf(wi, S.toISO(x)) >= 13) out.push(new Date(x)); x = new Date(x.getFullYear(), x.getMonth() + 1, 9); } return out; };
  function planStatus(st, wi) {
    const pl = planOf(st);
    return PLAN.filter((it) => (!it.only || wi.w >= it.w[0]) && !(it.gov && docR())).map((it) => {
      const auto = !!(it.auto && safeAuto(it, st, wi)); const tick = pl.done[it.id];
      let code = 'soon';
      if (it.pmsma) code = wi.w < it.w[0] ? 'soon' : (wi.w <= it.w[1] ? 'now' : 'past');
      else if (auto || tick) code = 'done';
      else if (wi.w < it.w[0]) code = 'soon';
      else if (wi.w <= it.w[1]) code = 'now';
      else code = 'past';
      return { it: it, code: code, auto: auto, tick: tick };
    });
  }
  const safeAuto = (it, st, wi) => { try { return it.auto(st, wi); } catch (e) { return false; } };
  function planSync(st, wi) {
    const pl = planOf(st);
    S.reminders.list().filter((r) => r.mod === 'preg' && String(r.id).indexOf('preg-plan-') === 0).map((r) => r.id).forEach((id) => S.reminders.remove(id));
    if (!pl.rem || !wi || !S.canSave()) return;
    const td = S.today();
    planStatus(st, wi).forEach((x) => {
      if (x.it.pmsma) { if (x.code !== 'past') { const ds = ninths(wi).map(S.toISO); if (ds.length) S.reminders.upsert({ id: 'preg-plan-pmsma', mod: 'preg', title: { en: P.plan_rem_pmsma[0], hi: P.plan_rem_pmsma[1] }, kind: 'visit', dates: ds, start: null, every: null, weekdays: null, time: '09:00', on: true }); } return; }
      if (!x.it.rem || x.code === 'done' || x.code === 'past') return;
      const start = dayOfWeek(wi, x.it.w[0]); const when = start > td ? start : null; if (!when) return;   /* already due: no alarm, the plan and Home show it */
      S.reminders.upsert({ id: 'preg-plan-' + x.it.id, mod: 'preg', title: { en: P.plan_rem_now[0].replace('{x}', piName(x.it.id)[0]), hi: P.plan_rem_now[1].replace('{x}', piName(x.it.id)[1]) }, kind: 'checkup', dates: [S.toISO(when)], start: null, every: null, weekdays: null, time: '10:00', on: true });
    });
    /* Td: the second dose four weeks after the first */
    if (st.mcp.td1 && !st.mcp.td2 && !st.mcp.tdb) { const d2 = S.addDays(S.fromISO(st.mcp.td1), 28); if (d2 > td) S.reminders.upsert({ id: 'preg-plan-td2', mod: 'preg', title: { en: P.plan_rem_now[0].replace('{x}', P.pi_td[0]), hi: P.plan_rem_now[1].replace('{x}', P.pi_td[1]) }, kind: 'checkup', dates: [S.toISO(d2)], start: null, every: null, weekdays: null, time: '10:00', on: true }); }
  }
  function renderPlan(v) {
    const wi = weekInfo(); const dr = docR(); const head = S.backRow(T('plan_h'), backTo(), false) + '<p class="small">' + esc(T(dr ? 'plan_p_doc' : 'plan_p')) + '</p>' + (S.canSave() ? '<button type="button" class="linkbtn pg-dates" data-go="me-health">' + esc(T('dates_b')) + '</button>' : '');   /* review PLACES-01: her scan and period dates */
    if (!S.canSave()) { v.innerHTML = head + S.needDiary(); S.wire(v); return; }
    if (!wi) { v.innerHTML = head + setCard(); S.wire(v); wireSetCard(v); return; }
    const st = store(); const pl = planOf(st); const rows = planStatus(st, wi);
    const tipOf = (it) => (W[it.tip] && W[it.tip].tip ? tx(W[it.tip].tip) : '');   /* Version 39.29: a tip carries its doctor-route words (doc) */
    /* the doctor route: no MCP card or ASHA page to open, and no U-WIN booking (Td is given at her check-ups) */
    const goOk = (it) => !!it.go && linkOk(it.go) && !(dr && (it.go === 'preg-mcp' || it.go === 'asha'));
    const win = (it) => (it.w[0] ? TF('plan_wk', { a: it.w[0], b: it.w[1] }) : TF('plan_upto', { b: it.w[1] }));
    const card = (x) => {
      const it = x.it; const name = piText(it.id); let extra = '';
      if (it.pmsma) { const n9 = ninths(wi)[0]; extra = (n9 ? '<p class="small" style="color:var(--fg);font-weight:600">' + esc(TF('plan_pmsma_next', { d: S.fmtD(n9, { weekday: 'short', day: 'numeric', month: 'short' }) })) + '</p>' : '') + (pl.pmsma.length ? '<p class="small">' + esc(TF('plan_pmsma_n', { n: pl.pmsma.length })) + '</p>' : ''); }
      if (it.id === 'scheme' && x.code !== 'past') extra += '<p class="small">' + esc(T('plan_kilkari')) + '</p>';   /* Version 39.7 (journey audit P3-09): Kilkari, in the schemes guide's words, corrected at the official source */
      if (it.id === 'td' && st.mcp.td1 && !st.mcp.td2 && !st.mcp.tdb && x.code !== 'done') extra += '<p class="small" style="color:var(--fg)">' + esc(TF('plan_td2', { d: fdy(S.toISO(S.addDays(S.fromISO(st.mcp.td1), 28))) })) + '</p>';
      const doneLine = x.code === 'done' ? '<p class="small" style="color:var(--ok)">' + esc(x.auto ? T('plan_auto') : TF('plan_marked', { d: fdy(x.tick) })) + '</p>' : '';
      const btns = [];
      if (it.pmsma && x.code === 'now') btns.push('<button type="button" class="btn sm' + (pl.pmsma.indexOf(todayISO()) >= 0 ? ' on' : '') + '" data-pg-pmsma="1">' + esc(T('plan_pmsma_went')) + '</button>');
      else if (!it.pmsma && !x.auto) btns.push(x.tick ? '<button type="button" class="btn sm" data-pg-plan-undo="' + it.id + '">' + esc(T('plan_undo')) + '</button>' : '<button type="button" class="btn sm' + (x.code === 'now' ? ' primary' : '') + '" data-pg-plan="' + it.id + '">' + esc(T('plan_mark')) + '</button>');
      /* an official site, opened outside Sakhi (Version 29) */
      if (it.ext && !(dr && it.id === 'td') && x.code !== 'done' && x.code !== 'past') btns.push('<a class="btn sm" href="' + esc(it.ext[0]) + '" target="_blank" rel="noopener">' + esc(T(it.ext[1])) + '</a>');
      if (goOk(it)) btns.push('<button type="button" class="btn sm" data-go="' + esc(it.go) + '">' + esc(GO_LABEL[it.go] ? GO_LABEL[it.go]() : T('plan_open')) + '</button>');
      return '<div class="card pg-plan" data-plan="' + it.id + '"><div class="row spread" style="align-items:flex-start;gap:8px"><h3 style="margin:0;min-width:0">' + esc(name) + '</h3><span class="pill ' + (x.code === 'now' ? 'accent' : (x.code === 'done' ? 'ok' : 'muted')) + '">' + esc(x.code === 'soon' ? TF('plan_from', { a: it.w[0], d: S.fmtD(dayOfWeek(wi, it.w[0]), { day: 'numeric', month: 'short' }) }) : win(it)) + '</span></div>' +
        '<p class="small" style="color:var(--fg)">' + esc(tipOf(it)) + '</p>' + extra + doneLine + (btns.length ? '<div class="row wrap">' + btns.join('') + '</div>' : '') + '</div>';
    };
    const now = rows.filter((x) => x.code === 'now'), soon = rows.filter((x) => x.code === 'soon').sort((a, b) => a.it.w[0] - b.it.w[0]).slice(0, 4), done = rows.filter((x) => x.code === 'done'), past = rows.filter((x) => x.code === 'past' && !x.it.pmsma);
    v.innerHTML = head +
      '<div class="card"><div class="eyebrow">' + esc(T('hub_h')) + '</div><h2>' + esc(TF('hub_now', { n: wi.w })) + '</h2><p class="small">' + esc(TF('hub_due', { d: S.fmtD(wi.due, { day: 'numeric', month: 'long', year: 'numeric' }) })) + '</p></div>' +
      '<h2>' + esc(T('plan_now')) + '</h2>' + (now.length ? now.map(card).join('') : '<div class="card soft"><p class="small">' + esc(T('plan_all_now')) + '</p></div>') +
      (soon.length ? '<h2>' + esc(T('plan_soon')) + '</h2>' + soon.map(card).join('') : '') +
      (dr && S.care.altRow && linkOk('access-schemes-preg') ? S.care.altRow('access-schemes-preg', T('plan_free_doc')) : '') +
      (done.length ? '<details class="pg-acc"><summary>' + esc(TF('plan_done_h', { n: done.length })) + '</summary><div class="stack" style="margin-top:10px">' + done.map(card).join('') + '</div></details>' : '') +
      (past.length ? '<details class="pg-acc"><summary>' + esc(TF('plan_past_h', { n: past.length })) + '</summary><p class="small">' + esc(T(dr ? 'plan_past_p_doc' : 'plan_past_p')) + '</p><div class="stack" style="margin-top:10px">' + past.map(card).join('') + '</div></details>' : '') +
      '<div class="list"><label class="item"><span class="body"><strong>' + esc(T('plan_rem')) + '</strong><span>' + esc(T(dr ? 'plan_rem_s_doc' : 'plan_rem_s')) + '</span></span><input type="checkbox" id="pg-plan-rem"' + (pl.rem ? ' checked' : '') + '></label></div>' +
      urgentAction() +
      /* Version 39.2: the old check-up visits page now opens this one, so its "The pregnancy ended" lives here (core's words) */
      (S.pregEnded ? '<details><summary>' + esc(t('after_change')) + '</summary><div class="card" style="margin-top:8px"><button type="button" class="btn" id="loss">' + esc(t('loss')) + '</button><p class="small" id="loss-p" hidden>' + esc(t('loss_p')) + '</p></div></details>' : '');
    S.wire(v);
    const ls = v.querySelector('#loss'); if (ls) ls.addEventListener('click', () => { S.pregEnded(); const lp = v.querySelector('#loss-p'); if (lp) lp.hidden = false; });
    const redo = () => { planSync(st, wi); S.save(); S.render(); };
    v.querySelectorAll('[data-pg-plan]').forEach((b) => b.addEventListener('click', () => { pl.done[b.dataset.pgPlan] = todayISO(); redo(); }));
    v.querySelectorAll('[data-pg-plan-undo]').forEach((b) => b.addEventListener('click', () => { delete pl.done[b.dataset.pgPlanUndo]; redo(); }));
    v.querySelectorAll('[data-pg-pmsma]').forEach((b) => b.addEventListener('click', () => { const k = todayISO(); const i = pl.pmsma.indexOf(k); if (i >= 0) pl.pmsma.splice(i, 1); else pl.pmsma.push(k); redo(); }));
    const rm = v.querySelector('#pg-plan-rem'); if (rm) rm.addEventListener('change', () => { pl.rem = rm.checked; redo(); });
  }
  /* what is due now, by name, for Home and the summaries */
  const dueNames = () => { const wi = weekInfo(); if (!wi || !S.canSave()) return []; return planStatus(store(), wi).filter((x) => x.code === 'now' && !x.it.pmsma).map((x) => piText(x.it.id)); };
  /* Version 38: one pregnancy plan. The companion's pregnancy plan (mods/plan.js, pack 'preg') takes what is due now from here,
     and while it runs Today's "Due now" row is that plan's first step instead of a row of its own (planOwns). */
  const planOwns = () => !!(S.plan && S.plan.running && S.plan.running() && S.plan.packOf && S.plan.packOf() === 'preg');
  /* Version 39.0 (journey audit P0 2): the warning lines her logs show (BP, Hb and the sugar tests), for Today and her diary's
     "What it shows", from entries in the last 3 days. The same reviewed words as the logs page. */
  const recent = (e, n) => !!e && /^\d{4}-\d{2}-\d{2}$/.test(e.d || '') && S.diffDays(S.fromISO(e.d), S.today()) >= 0 && S.diffDays(S.fromISO(e.d), S.today()) <= n;
  const LP = (k) => ({ en: P[k][0], hi: P[k][1] });
  S.preg.flags = () => {
    if (!S.canSave() || !S.cycle.isPregnant()) return []; const st = store(); const out = [];
    const b = latest(st.bp); const lv = bpLevel(b);
    if (lv && recent(b, 3)) { const n = b.s && b.di ? ': ' + b.s + '/' + b.di : ''; out.push({ id: 'pg_bp', lv: lv === 2 ? 'now' : 'today', at: b.d, t: { en: 'Your BP' + n, hi: 'आपका BP' + n }, see: LP(lv === 2 ? 'bp_urgent' : 'bp_today'), go: 'preg-logs' }); }
    const h = latest(st.hb); if (h && h.v < 7 && recent(h, 3)) out.push({ id: 'pg_hb', lv: 'today', at: h.d, t: { en: 'Your Hb: ' + h.v, hi: 'आपका Hb: ' + h.v }, see: LP('hb_flag'), go: 'preg-logs' });
    const dp = latest(st.sug.filter((e) => e.k === 'dipsi')); if (dp && dp.v >= 140 && recent(dp, 3)) out.push({ id: 'pg_sug', lv: 'week', at: dp.d, t: { en: 'Your sugar test: ' + dp.v + ' mg/dL', hi: 'आपकी शुगर जाँच: ' + dp.v + ' mg/dL' }, see: LP('sug_flag'), go: 'preg-logs' });
    const fs = latest(st.sug.filter((e) => e.k === 'fast')); if (fs && fs.v >= 95 && recent(fs, 3)) out.push({ id: 'pg_sugf', lv: 'week', at: fs.d, t: { en: 'Your fasting sugar: ' + fs.v + ' mg/dL', hi: 'आपकी खाली पेट शुगर: ' + fs.v + ' mg/dL' }, see: LP(fs.v >= 126 ? 'sug_fflag2' : 'sug_fflag'), go: 'preg-logs' });
    return out;
  };
  /* Version 39.0 (plans review blocker): when the pregnancy ends (a birth or a loss), its check-up and PMSMA reminders stop.
     Tablet reminders stay; core asks once after a loss whether to keep them. */
  const clearPlanRems = () => { S.reminders.list().filter((r) => r.mod === 'preg' && String(r.id).indexOf('preg-plan-') === 0).map((r) => r.id).forEach((id) => S.reminders.remove(id)); };
  /* review life-2: a pregnancy that ended before Version 39.0 (or anywhere the event was missed) leaves no check-up reminders ringing */
  const planRemsStale = () => S.canSave() && !S.cycle.isPregnant() && S.reminders.list().some((r) => r.mod === 'preg' && String(r.id).indexOf('preg-plan-') === 0);
  /* Version 39.9 (diet audit 2): the pregnancy plan's food step by trimester and week, from this page's reviewed lines (a
     heading and its first sentence): how much more to eat, then protein, iron with vitamin C, calcium, salt and water */
  const FOOD_FOCUS = { 1: [['more', 0], ['card', 1], ['card', 3], ['card', 0]], 2: [['more', 1], ['card', 0], ['card', 2], ['card', 1], ['card', 3]], 3: [['more', 1], ['card', 0], ['card', 1], ['card', 2], ['card', 3]] };
  const firstSentence = (x) => { const m = /^(.+?[.।])(\s|$)/.exec(x); return m ? m[1] : x; };
  /* V39.9 review FOOD-04: counted from the trimester's first week, so weeks 14 and 28 open with how much more to eat */
  function foodTip(w) {
    const w0 = Math.max(0, w); const tri = w0 < 14 ? 1 : (w0 < 28 ? 2 : 3); const xs = FOOD_FOCUS[tri]; const f = xs[(w0 - (tri === 1 ? 0 : (tri === 2 ? 14 : 28))) % xs.length];
    if (f[0] === 'more') return { t: tx(DIET.more_h), p: firstSentence(tx(DIET.more[f[1]])) };
    const c = DIET.cards[f[1]]; return c ? { t: tx(c.h), p: firstSentence(tx(c.p[0])) } : null;
  }
  S.preg.foodTip = foodTip;
  /* Version 39.34: My pregnancy's safety screen ticks her MCP card's marks, and saves her ticks back to it (one home for each fact) */
  S.preg.risks = () => { if (!S.canSave()) return []; const r = store().mcp.risk || {}; return RISKS.filter((k) => r[k]); };
  S.preg.riskName = (k) => T(k);
  S.preg.setRisks = (on) => { if (!S.canSave()) return; const m = store().mcp; if (!m.risk || typeof m.risk !== 'object') m.risk = {}; ['r_hr', 'r_bp', 'r_an', 'r_tw', 'r_gdm', 'r_prev', 'r_oth'].forEach((k) => { if ((on || []).indexOf(k) >= 0) m.risk[k] = true; else delete m.risk[k]; }); };
  S.preg.plan = { /* Version 39.5: a check-up or test she marked done on that day (a plan step counts from it) */
    /* review SAFETY-04: a day counts only when she ticked an item that was due then; today, only once nothing is left due */
    markedOn: (iso) => { if (!S.canSave()) return false; const st = store(); const pl = planOf(st); const ks = Object.keys(pl.done).filter((k) => pl.done[k] === iso); const wi = weekInfo(); if (!ks.length || !wi) return false;
      if (iso === S.toISO(S.today())) return !planStatus(st, wi).some((x) => x.code === 'now' && !x.it.pmsma);   /* review FIXES-05: PMSMA is 'now' for months, as due() knows */
      const wAt = wkOf(wi, iso);   /* review FIXES-05: that day's own pregnancy week */ return ks.some((k) => { const it = PLAN.find((x) => x.id === k); return !!it && wAt >= it.w[0] && wAt <= it.w[1]; }); },
    due: () => { const wi = weekInfo(); if (!wi || !S.canSave() || wi.days > 294 || wi.w < W_MIN || wi.w > W_MAX) return []; return planStatus(store(), wi).filter((x) => x.code === 'now' && !x.it.pmsma).map((x) => ({ id: x.it.id, name: piText(x.it.id) })); } };

  function summary() {
    const st = store(); const wi = weekInfo(); const L = [];
    if (wi) L.push(TF('sum_w', { n: wi.w }) + ' (' + T(wi.from === 'scan' ? 'sum_scan' : 'sum_lmp') + ')');
    const w = latest(st.w), b = latest(st.bp), s = latest(st.sug), h = latest(st.hb);
    if (w) L.push(TF('sum_wt', { v: num1(w.v), d: fdy(w.d) }));
    if (b) L.push(TF('sum_bp', { v: b.s + '/' + b.di, d: fdy(b.d) }));
    if (s) L.push(TF('sum_sug', { k: T(s.k === 'dipsi' ? 'sug_d_short' : 'sug_f_short'), v: s.v, d: fdy(s.d) }));
    if (h) L.push(TF('sum_hb', { v: num1(h.v), d: fdy(h.d) }));
    if (Object.keys(st.tabs).length) L.push(TF('sum_tab', { a: tabDays(st, 'ifa', 7), b: tabDays(st, 'ca', 7) }));
    const due = dueNames(); const dueLine = due.length ? TF('sum_due', { x: due.join(', ') }) : null; if (dueLine) L.push(dueLine);
    if (st.mcp.bg || st.mcp.edd) L.push(TF('sum_rch', { b: st.mcp.bg ? st.mcp.bg + (st.mcp.rh || '') : T('mcp_none'), e: st.mcp.edd ? fdy(st.mcp.edd) : T('mcp_none') }));
    /* the doctor's summary (Version 33) leaves out what's due now, which mixes scheme money with check-ups */
    return L.length ? [{ title: T('sum_h'), lines: L, doctorLines: L.filter((l) => l !== dueLine) }] : [];
  }
  function sample(id) {
    if (id !== 'meera') return;
    const d = fill(S.data('preg'));
    /* Meera: last period 2 May 2026. Monthly check-ups, normal BP, Hb 10.8 then 11.2, first 75 g test normal, the 24–28 week test still due. */
    d.w = [['2026-06-20', 52.0], ['2026-07-18', 52.4], ['2026-08-15', 53.6], ['2026-09-12', 55.1], ['2026-10-10', 56.6]].map((x, i) => ({ id: 'mw' + i, d: x[0], v: x[1] }));
    d.bp = [['2026-06-20', 108, 70], ['2026-07-18', 110, 72], ['2026-08-15', 106, 68], ['2026-09-12', 112, 74], ['2026-10-10', 114, 76]].map((x, i) => ({ id: 'mb' + i, d: x[0], s: x[1], di: x[2], sym: false }));
    d.hb = [{ id: 'mh0', d: '2026-06-20', v: 10.8 }, { id: 'mh1', d: '2026-09-12', v: 11.2 }];
    d.sug = [{ id: 'ms0', d: '2026-06-20', k: 'dipsi', v: 112 }];
    d.tabs = {};
    for (let i = 0; i < 21; i++) { const k = S.toISO(S.addDays(S.today(), -i)); const day = { ifa: [3, 11].indexOf(i) < 0, ca: [3, 8].indexOf(i) < 0 }; if (i === 0) { day.ifa = false; day.ca = true; } d.tabs[k] = day; }
    d.mcp = { rch: 'SAMPLE-0000', regd: '2026-06-20', bg: 'B', rh: '+', edd: '2027-02-06', td1: '2026-06-20', td2: '2026-07-18', tdb: '', anc: ['2026-06-20', '2026-09-12'], risk: {}, rnote: '' };
  }

  S.register({
    id: 'preg',
    demoPersona: 'meera',
    strings: strings,
    routes: { 'preg': renderHub, 'preg-plan': renderPlan, 'preg-week': renderWeekRoute, 'preg-logs': renderLogs, 'preg-symptoms': renderSymptoms, 'preg-diet': renderDiet, 'preg-mcp': renderMcp },
    prefixes: { 'preg-w-': (v, rest) => { const n = parseInt(rest, 10); if (String(n) === String(rest) && W[n]) renderWeek(v, n); else renderWeekRoute(v); } },
    testRoutes: (function () { const a = []; for (let n = W_MIN; n <= W_MAX; n++) a.push('preg-w-' + n); return a; })(),
    open: ['preg', 'preg-plan', 'preg-week', 'preg-logs', 'preg-symptoms', 'preg-diet', 'preg-mcp', 'preg-w-*'],
    tiles: [
      { section: 'preg', route: 'preg', title: 'preg_t_hub', sub: 'preg_t_hub_s', icon: 'heart', order: 1, gated: false, keywords: 'pregnancy pregnant garbh garbhavastha गर्भ गर्भावस्था' },
      { section: 'preg', route: 'preg-plan', title: 'preg_plan_h', sub: 'preg_plan_s', icon: 'check', order: 3, gated: false, keywords: 'plan checklist due check-up anc visit test scan td pmsma ogtt sugar test birth plan what to do when reminder प्लान जाँच टीका' },
      { section: 'preg', route: 'preg-week', title: 'preg_t_week', sub: 'preg_t_week_s', icon: 'baby', order: 6, gated: false, keywords: 'week by week baby size fruit hafta हफ़्ता बच्चा आकार scan' },
      { section: 'preg', route: 'preg-logs', title: 'preg_t_logs', sub: 'preg_t_logs_s', icon: 'chart', order: 10, gated: true, keywords: 'weight bp blood pressure sugar dipsi ogtt gdm hb haemoglobin anaemia iron ifa calcium tablet वज़न शुगर' },
      { section: 'preg', route: 'preg-symptoms', title: 'preg_t_sym', sub: 'preg_t_sym_s', icon: 'help', order: 20, gated: true, keywords: 'nausea vomiting heartburn constipation piles cramps swelling back pain sleep discharge urine gums skin breathless उल्टी जलन क़ब्ज़ सूजन' },
      { section: 'preg', route: 'preg-diet', title: 'preg_t_diet', sub: 'preg_t_diet_s', icon: 'leaf', order: 30, gated: false, keywords: 'diet food nutrition protein iron calcium papaya ghee saffron kesar myths खाना पपीता घी केसर' },
      { section: 'preg', route: 'preg-mcp', title: 'preg_t_mcp', sub: 'preg_t_mcp_s', icon: CARD_SVG, order: 40, gated: false, keywords: 'mcp card mother child protection rch id blood group edd td tetanus anc high risk कार्ड' }
    ],
    css: [
      '.pg-size { display: flex; flex-direction: column; gap: 2px; min-width: 0; }',
      '.pg-sizerow { display: flex; align-items: center; gap: 12px; } .pg-sizerow .pg-size { flex: 1; } .pg-art { width: 84px; height: 84px; flex-shrink: 0; display: block; } .pg-art .art { width: 84px; height: 84px; }',
      '.action .ico.pg-ico-art { padding: 4px; } .action .ico.pg-ico-art .art { width: 38px; height: 38px; }',
      '.pg-size .pg-big { font-family: var(--font-display); font-size: 34px; line-height: 1.05; color: var(--accent); font-weight: 700; }',
      '.pg-size .pg-cmp { font-size: 15px; color: var(--fg); font-weight: 600; overflow-wrap: break-word; }',
      '.pg-sec { display: flex; gap: 12px; align-items: flex-start; }',
      '.pg-ico { width: 40px; height: 40px; border-radius: 20px; background: var(--peach-2); color: var(--gold); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.pg-ico svg { width: 21px; height: 21px; }',
      '.pg-ico.accent { background: var(--accent-soft); color: var(--accent); }',
      '.pg-ico.ok { background: var(--ok-soft); color: var(--ok); }',
      '.pg-txt { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 6px; }',
      '.pg-weeks { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }',
      '.pg-weeks .btn { min-height: 40px; padding: 0; font-size: 14px; min-width: 0; }',
      '.pg-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }',
      '.pg-nav .btn { min-width: 0; padding: 0 10px; }',
      '.pg-acc { background: var(--card); border-radius: 20px; padding: 14px 16px; box-shadow: var(--shadow); }',
      '.pg-acc > summary { font-size: 15px; color: var(--fg); font-weight: 600; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 30px; }',
      '.pg-acc > summary::-webkit-details-marker { display: none; }',
      '.pg-acc > summary::after { content: "+"; color: var(--accent); font-size: 22px; line-height: 1; font-weight: 600; flex-shrink: 0; }',
      '.pg-acc[open] > summary::after { content: "\\2212"; }',
      '.pg-body { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; font-size: 14px; color: var(--text); }',
      '.pg-body ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }',
      '.pg-flags { display: flex; flex-direction: column; gap: 8px; }',
      '.pg-p { font-size: 14px; line-height: 1.5; color: var(--fg); margin: 0; }',
      '.pg-ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; line-height: 1.5; color: var(--fg); }',
      '.pg-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 8px 8px 12px; background: var(--card-2); border-radius: 14px; color: var(--fg); }',
      '.pg-row .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }',
      '.pg-row .body strong { font-size: 14px; font-weight: 600; }',
      '.pg-row .body span { font-size: 12px; color: var(--muted); overflow-wrap: break-word; }',
      '.pg-x { width: 40px; height: 40px; flex-shrink: 0; border-radius: 20px; border: none; background: transparent; color: var(--muted); display: inline-flex; align-items: center; justify-content: center; padding: 0; }',
      '.pg-x svg { width: 18px; height: 18px; }',
      '.pg-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }',
      '.pg-check { display: flex; gap: 10px; align-items: flex-start; font-weight: 500; font-size: 13px; line-height: 1.4; }',
      '.pg-check input { width: 22px; height: 22px; min-height: 0; padding: 0; flex-shrink: 0; accent-color: var(--accent); margin-top: 1px; }',
      '.spark.pg-spark { height: auto; aspect-ratio: 300 / 112; }',
      '.pg-spark .pg-ln2 { fill: none; stroke: var(--gold); stroke-width: 2; stroke-dasharray: 5 3; }',
      '.pg-spark .pg-pt2 { fill: var(--gold); }',
      '.pg-spark .pg-ref { stroke: var(--accent-2); stroke-width: 1; stroke-dasharray: 3 3; }',
      '.pg-ticks { display: grid; grid-template-columns: minmax(54px, auto) repeat(7, minmax(0, 1fr)); gap: 5px; align-items: center; }',
      '.pg-ticks .pg-dh { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.25; }',
      '.pg-ticks .pg-rl { font-size: 12px; font-weight: 600; color: var(--fg); min-width: 0; overflow-wrap: break-word; }',
      '.pg-tick { min-height: 38px; min-width: 0; border-radius: 10px; border: 1.5px solid var(--line); background: var(--card); color: var(--muted); padding: 0; display: inline-flex; align-items: center; justify-content: center; }',
      '.pg-tick.on { background: var(--accent-strong); border-color: transparent; color: #FFFFFF; }',
      '.pg-tick svg { width: 16px; height: 16px; }',
      '.pg-glance .stat b { font-size: 17px; }',
      '.pg-tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }',
      '.pg-tabs .chip { padding: 0 4px; justify-content: center; text-align: center; min-width: 0; font-size: 13px; }',
      '.pg-kv { grid-template-columns: minmax(0, 1fr) auto; }',
      '.pg-kv dt { color: var(--fg); }',
      '.pg-two .kv { font-size: 13px; }'
    ].join('\n'),
    home: home,
    today: today,
    setup: setup,
    summary: summary,
    sample: sample,
    event: (name) => { if (name === 'pregEnd') clearPlanRems(); },
    afterRender: () => { if (planRemsStale()) clearPlanRems(); }
  });
})(window.Saathi);
