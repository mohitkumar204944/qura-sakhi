/* Contraception: every method explained, a method chooser, my method with reminders, missed pills, emergency contraception and where it is free. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx, I = S.I;
  const D = () => S.data('contra');
  const E = (o) => esc(tx(o));
  const iso = (d) => S.toISO(d);
  const addMonths = S.addMonths;   /* kept inside the month: a baby born 31 Aug is 6 months old on 28 Feb */
  const fmt = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtS = (d) => S.fmtD(d, { weekday: 'short', day: 'numeric', month: 'short' });
  const wdName = (n, style) => S.fmtD(new Date(2026, 0, 4 + n), { weekday: style || 'long' }); // 4 Jan 2026 was a Sunday
  const okDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

  /* Screen state that is never saved (privacy first: chooser answers and the emergency calculator stay in memory). */
  const mem = { ch: null, ec: { d: '', tm: '' }, ms: { which: '', a: '', b: '' }, lam: [false, false, false] };
  if (S.onOwnerChange) S.onOwnerChange(() => { mem.ch = null; mem.ec = { d: '', tm: '' }; mem.ms = { which: '', a: '', b: '' }; mem.lam = [false, false, false]; });

  /* ---------- sources (all checked) ---------- */
  const SRC = {
    who: { url: 'https://fphandbook.org/', en: 'WHO Family Planning Handbook, 2022', hi: 'WHO परिवार नियोजन हैंडबुक, 2022' },
    ocp: { url: 'https://nhm.gov.in/images/pdf/programmes/family-planing/guidelines/Reference_Manual_Oral_Pills.pdf', en: 'MoHFW pill manual, 2016', hi: 'स्वास्थ्य मंत्रालय की गोली गाइड, 2016' },
    cho: { url: 'https://nhsrcindia.org/sites/default/files/2022-05/Family_Planning_Guidance_Booklet_for_CHO.pdf', en: 'NHSRC family planning booklet, 2022', hi: 'NHSRC परिवार नियोजन पुस्तिका, 2022' },
    iucd: { url: 'https://nhm.gov.in/New_Updates_2018/NHM_Components/RMNCHA/Family_planning/Schemes_&_Guidelines/IUCD/IUCD_Manual_English.pdf', en: 'MoHFW IUCD manual, 2018', hi: 'स्वास्थ्य मंत्रालय IUCD गाइड, 2018' },
    dmpa: { url: 'https://india.unfpa.org/sites/default/files/pub-pdf/faq_for_asha_workers_english.pdf', en: 'UNFPA India, Antara FAQ', hi: 'UNFPA India, अंतरा FAQ' },
    whoec: { url: 'https://www.who.int/news-room/fact-sheets/detail/emergency-contraception', en: 'WHO emergency contraception fact sheet', hi: 'WHO इमरजेंसी गर्भनिरोध fact sheet' }
  };

  /* ---------- the methods ---------- */
  const L = (en, hi) => ({ en: en, hi: hi });
  const LD = (en, hi, den, dhi) => ({ en: en, hi: hi, doc: { en: den, hi: dhi } });   /* Version 39.29: with its doctor-route words */
  const M = {
    condom: {
      icon: 'heart', name: L('Condom', 'कंडोम (Nirodh)'),
      short: L('Use a new one every time. Also protects against STIs and HIV.', 'हर बार नया। STI और HIV से भी बचाता है।'),
      rate: { type: 'typ', n: 13 },
      how: L('A thin rubber cover the man puts on his erect penis. It keeps sperm out of the vagina. It is the only method that protects against both pregnancy and infections like STIs and HIV.', 'पतली रबर की थैली जो पुरुष उत्तेजित लिंग पर पहनता है। यह शुक्राणु को योनि में जाने से रोकती है। यही अकेला तरीक़ा है जो गर्भ और STI, HIV जैसे संक्रमण, दोनों से बचाता है।'),
      expect: [
        L('No hormones. Most couples have no side effects.', 'हॉर्मोन नहीं। ज़्यादातर जोड़ों को कोई साइड इफ़ेक्ट नहीं होता।'),
        L('Some men feel less sensation. Talking about it before sex helps.', 'कुछ पुरुषों को एहसास कम लगता है। पहले से बात कर लेने से आसानी होती है।'),
        L('It fails mostly when it is not used every time, or is put on late.', 'ज़्यादातर तब फ़ेल होता है जब हर बार इस्तेमाल न हो, या देर से पहना जाए।')
      ],
      ask: [L('Itching or a rash after use: one of you may be allergic to latex. See a doctor.', 'इस्तेमाल के बाद खुजली या दाने: आप में से किसी को latex से एलर्जी हो सकती है। डॉक्टर को दिखाएँ।')],
      free: [
        L('Your ASHA brings Nirodh condoms home, free.', 'आपकी ASHA घर पर मुफ़्त Nirodh कंडोम देती है।'),
        L('Free at the sub-centre, PHC, CHC and government hospitals. Many keep a condom box you can take from.', 'सब-सेंटर, PHC, CHC और सरकारी अस्पताल में मुफ़्त। कई जगह condom box रखा रहता है, आप ख़ुद ले सकती हैं।'),
        L('Every chemist sells them too.', 'हर chemist के पास भी मिलते हैं।')
      ],
      start: [
        L('Check the date on the packet and that the wrapper is not torn.', 'पैकेट पर तारीख़ देखें और रैपर फटा न हो।'),
        L('Put it on the erect penis before any contact, and unroll it all the way down.', 'किसी भी संपर्क से पहले उत्तेजित लिंग पर पहनें और पूरा नीचे तक खोलें।'),
        L('After sex, hold the rim while pulling out. Knot it and throw it away. Use a new one each time.', 'संबंध के बाद बाहर निकालते समय किनारा पकड़ कर रखें। गाँठ लगा कर फेंक दें। हर बार नया।'),
        L('If it breaks or slips off: emergency pill within 72 hours.', 'फट जाए या फिसल जाए: 72 घंटे के अंदर इमरजेंसी गोली।')
      ],
      fert: L('Right away. Stop using condoms when you want a baby.', 'तुरंत। बच्चा चाहें तो कंडोम बंद कर दें।'),
      rx: null, src: ['who', 'cho']
    },
    pill: {
      icon: 'pill', name: L('Combined pill (Mala-N)', 'रोज़ की गोली (Mala-N)'),
      short: L('One pill every day. Free as Mala-N.', 'रोज़ एक गोली। Mala-N मुफ़्त मिलती है।'),
      rate: { type: 'typ', n: 7 },
      how: L('Two hormones, an oestrogen and a progestin, stop your ovaries from releasing an egg. Mala-N, the free government pill, comes in strips of 28: 21 hormone pills and 7 iron pills. You take one every day, with no break between strips.', 'दो हॉर्मोन, estrogen और progestin, अंडाशय से अंडा निकलने नहीं देते। सरकारी मुफ़्त गोली Mala-N के पत्ते में 28 गोलियाँ होती हैं: 21 हॉर्मोन वाली और 7 आयरन की। हर दिन एक गोली, पत्तों के बीच कोई छुट्टी नहीं।'),
      expect: [
        L('In the first few months: spotting between periods, nausea, headache or sore breasts. These usually settle.', 'पहले कुछ महीनों में: पीरियड के बीच स्पॉटिंग, जी मिचलाना, सिरदर्द या स्तनों में दर्द। ये आम तौर पर ठीक हो जाते हैं।'),
        L('Periods often become lighter, more regular and less painful.', 'पीरियड अक्सर हल्के, नियमित और कम दर्द वाले हो जाते हैं।'),
        L('BP can rise a little. Have it checked about once a year.', 'BP थोड़ा बढ़ सकता है। साल में लगभग एक बार जँचवाएँ।'),
        L('Missed pills are the main reason it fails.', 'गोली छूटना ही इसके फ़ेल होने की मुख्य वजह है।')
      ],
      ask: [
        L('You get migraine with aura: flashing lights or blind spots before the headache.', 'आपको aura वाला माइग्रेन होता है: सिरदर्द से पहले आँखों के आगे चमक या धब्बे।'),
        L('Your BP is 140/90 or higher, or you take BP medicine.', 'आपका BP 140/90 या ज़्यादा है, या आप BP की दवा लेती हैं।'),
        L('You are 35 or older and smoke.', 'आपकी उम्र 35 या ज़्यादा है और आप धूम्रपान करती हैं।'),
        L('You breastfeed a baby under 6 months. Indian guidance says wait until 6 months.', 'आप 6 महीने से छोटे बच्चे को दूध पिलाती हैं। भारत के नियम 6 महीने तक रुकने को कहते हैं।'),
        L('You have had a blood clot, heart disease, liver disease or breast cancer.', 'आपको कभी खून का थक्का, दिल की बीमारी, लिवर की बीमारी या breast cancer हुआ है।'),
        L('You take medicine for fits (epilepsy) or TB. Some of these make the pill work less well.', 'आप मिर्गी या TB की दवा लेती हैं। इनमें से कुछ दवाएँ गोली का असर कम करती हैं।')
      ],
      free: [
        L('Free at the sub-centre, PHC, CHC and government hospitals.', 'सब-सेंटर, PHC, CHC और सरकारी अस्पताल में मुफ़्त।'),
        L('After your first strip from a doctor, nurse or ANM, your ASHA can bring Mala-N home, free.', 'डॉक्टर, नर्स या ANM से पहला पत्ता मिलने के बाद आपकी ASHA घर पर मुफ़्त Mala-N दे सकती है।'),
        L('Chemists sell other brands.', 'Chemist पर दूसरे brand भी मिलते हैं।')
      ],
      start: [
        L('Start on any of the first 5 days of your period. Then you need nothing else.', 'पीरियड के पहले 5 दिनों में किसी भी दिन शुरू करें। तब और कुछ नहीं चाहिए।'),
        L('Starting later in the month? Use condoms as well for the first 7 days.', 'महीने में बाद में शुरू कर रही हैं? पहले 7 दिन साथ में कंडोम भी।'),
        L('Take one pill at the same time every day. When a strip ends, start the next one the very next day.', 'हर दिन एक ही समय पर एक गोली। पत्ता ख़त्म हो तो अगले ही दिन नया शुरू करें।'),
        L('Vomited within 2 hours of a pill? Take another one from the strip.', 'गोली के 2 घंटे के अंदर उल्टी हुई? पत्ते से एक और गोली लें।'),
        L('You can stop any day. No doctor visit is needed to stop.', 'किसी भी दिन बंद कर सकती हैं। बंद करने के लिए डॉक्टर के पास जाना ज़रूरी नहीं।')
      ],
      fert: L('No delay. You can get pregnant soon after stopping.', 'कोई देरी नहीं। बंद करने के बाद जल्दी गर्भ ठहर सकता है।'),
      rx: 'horm', src: ['who', 'ocp', 'cho']
    },
    chhaya: {
      icon: 'pill', name: L('Chhaya weekly pill', 'छाया (हफ़्ते की गोली)'),
      short: L('No hormones. Twice a week for 3 months, then once a week.', 'हॉर्मोन नहीं। 3 महीने हफ़्ते में दो बार, फिर हफ़्ते में एक बार।'),
      rate: { type: 'chhaya' },
      how: L('Chhaya (centchroman, also called ormeloxifene) is a non-hormonal pill developed in India. It works mainly on the lining of the womb. Because it is not a hormone, it does not cause hormone side effects, and it is safe while breastfeeding.', 'छाया (centchroman, जिसे ormeloxifene भी कहते हैं) भारत में बनी बिना हॉर्मोन की गोली है। यह मुख्य रूप से बच्चेदानी की अंदरूनी परत पर असर करती है। हॉर्मोन नहीं है, इसलिए हॉर्मोन वाले साइड इफ़ेक्ट नहीं होते, और स्तनपान में सुरक्षित है।'),
      expect: [
        L('In some women (about 8 in 100) periods come late or further apart, mostly in the first 3 months. This is not harmful.', 'कुछ महिलाओं में (लगभग 100 में 8) पीरियड देर से या ज़्यादा अंतर पर आते हैं, ज़्यादातर पहले 3 महीनों में। यह नुक़सानदेह नहीं है।'),
        L('Periods may get lighter over time. That can help if you have anaemia.', 'समय के साथ पीरियड हल्के हो सकते हैं। खून की कमी हो तो यह मददगार है।'),
        L('Period more than 15 days late: do a pregnancy test.', 'पीरियड 15 दिन से ज़्यादा देर से: गर्भ का test करें।')
      ],
      ask: [
        L('You have PMOS (PCOS or PCOD). Indian guidance does not give Chhaya with it.', 'आपको PMOS (PCOS या PCOD) है। भारत के नियमों में इसके साथ छाया नहीं दी जाती।'),
        L('You have had jaundice or liver disease recently.', 'हाल में आपको पीलिया या लिवर की बीमारी हुई है।'),
        L('You have TB, kidney disease or another long illness, or severe allergies.', 'आपको TB, किडनी की बीमारी या कोई और लंबी बीमारी है, या गंभीर एलर्जी है।'),
        L('A doctor has found an overgrowth of the cervix (cervical hyperplasia).', 'डॉक्टर ने बच्चेदानी के मुँह में ज़्यादा बढ़त (cervical hyperplasia) बताई है।')
      ],
      free: [
        L('Free at the sub-centre, PHC, CHC and government hospitals.', 'सब-सेंटर, PHC, CHC और सरकारी अस्पताल में मुफ़्त।'),
        L('The first dose comes from a trained provider after a check-up. After that your ASHA can bring it home.', 'पहली ख़ुराक जाँच के बाद प्रशिक्षित स्वास्थ्यकर्मी देती हैं। उसके बाद आपकी ASHA घर पर दे सकती है।')
      ],
      start: [
        L('Take the first pill on the first day of your period and the second pill 3 days later.', 'पहली गोली पीरियड के पहले दिन, दूसरी 3 दिन बाद।'),
        L('Keep those same two days every week for 3 months, for example Sunday and Wednesday.', '3 महीने तक हर हफ़्ते वही दो दिन रखें, जैसे रविवार और बुधवार।'),
        L('From the 4th month, take one pill a week on your first-pill day, whatever your period is doing.', 'चौथे महीने से हफ़्ते में एक गोली, पहली गोली वाले दिन, पीरियड चाहे जैसे हों।'),
        L('You can stop any time.', 'कभी भी बंद कर सकती हैं।')
      ],
      fert: L('Quickly. Fertility returns soon after you stop.', 'जल्दी। बंद करने के बाद जल्द ही गर्भ ठहर सकता है।'),
      rx: 'screen', src: ['ocp', 'cho']
    },
    pop: {
      icon: 'pill', name: L('Progestin-only pill (POP)', 'सिर्फ़ progestin वाली गोली (POP)'),
      short: L('A daily pill without oestrogen. Suits breastfeeding mothers.', 'बिना estrogen की रोज़ की गोली। दूध पिलाने वाली माँओं के लिए ठीक।'),
      rate: { type: 'pop' },
      how: L('A very low dose of one hormone, a progestin, thickens the mucus at the mouth of the womb so sperm cannot get through. It has no oestrogen, so it is safe while breastfeeding and suits many women who cannot take the combined pill.', 'एक ही हॉर्मोन, progestin, की बहुत कम मात्रा बच्चेदानी के मुँह का बलगम गाढ़ा कर देती है, जिससे शुक्राणु अंदर नहीं जा पाते। इसमें estrogen नहीं है, इसलिए स्तनपान में सुरक्षित है और कई उन महिलाओं के लिए ठीक है जो रोज़ की कंबाइंड गोली नहीं ले सकतीं।'),
      expect: [
        L('While breastfeeding, periods often stay away for longer.', 'स्तनपान के दौरान पीरियड अक्सर और देर तक नहीं आते।'),
        L('If you have periods, irregular or frequent bleeding is common and not harmful.', 'पीरियड आते हों तो अनियमित या बार-बार ब्लीडिंग आम है और नुक़सानदेह नहीं।'),
        L('Take it at the same time every day. More than 3 hours late counts as a missed pill (some brands allow 12 hours; ask which one you have).', 'हर दिन एक ही समय पर लें। 3 घंटे से ज़्यादा देरी छूटी गोली मानी जाती है (कुछ brand में 12 घंटे की छूट होती है; पूछ लें कि आपकी कौन सी है)।')
      ],
      ask: [
        L('You take medicine for fits (epilepsy) or TB.', 'आप मिर्गी या TB की दवा लेती हैं।'),
        L('You have had breast cancer, or have serious liver disease.', 'आपको breast cancer हुआ है, या लिवर की गंभीर बीमारी है।')
      ],
      free: [
        L('Not every government centre stocks it. Ask at your PHC, CHC or district hospital.', 'हर सरकारी केंद्र पर नहीं मिलती। अपने PHC, CHC या ज़िला अस्पताल में पूछें।'),
        L('A doctor can also prescribe one to buy from a chemist.', 'डॉक्टर chemist से ख़रीदने के लिए भी लिख सकती हैं।'),
        L('Not available? Chhaya is another free option while breastfeeding.', 'न मिले? स्तनपान में छाया दूसरा मुफ़्त विकल्प है।')
      ],
      start: [
        L('Breastfeeding and no period yet: you can start any time after the birth.', 'दूध पिला रही हैं और पीरियड नहीं लौटे: जन्म के बाद कभी भी शुरू कर सकती हैं।'),
        L('Having periods: start in the first 5 days of a period, or use condoms as well for the first 2 days.', 'पीरियड आते हैं: पीरियड के पहले 5 दिनों में शुरू करें, वरना पहले 2 दिन साथ में कंडोम भी।'),
        L('One pill every day at the same time, with no break between packs.', 'हर दिन एक ही समय पर एक गोली, पत्तों के बीच कोई छुट्टी नहीं।'),
        L('You can stop any time.', 'कभी भी बंद कर सकती हैं।')
      ],
      fert: L('No delay.', 'कोई देरी नहीं।'),
      rx: 'horm', src: ['who', 'ocp']
    },
    antara: {
      icon: 'clock', name: L('Antara injection', 'अंतरा इंजेक्शन'),
      short: L('One injection every 3 months. Free.', 'हर 3 महीने में एक इंजेक्शन। मुफ़्त।'),
      rate: { type: 'typ', n: 4 },
      how: L('An injection of a progestin hormone (DMPA, also called MPA) in the arm, buttock or thigh. It stops your ovaries from releasing an egg for 3 months. It is free under the government Antara programme.', 'progestin हॉर्मोन (DMPA, जिसे MPA भी कहते हैं) का इंजेक्शन, बाँह, कूल्हे या जाँघ में। यह 3 महीने तक अंडा निकलने नहीं देता। सरकारी अंतरा कार्यक्रम में मुफ़्त है।'),
      expect: [
        L('Period changes are common: spotting, irregular bleeding or no periods. After a year about half of women have no periods. This is not harmful and does not mean pregnancy or menopause.', 'पीरियड में बदलाव आम हैं: स्पॉटिंग, अनियमित ब्लीडिंग या पीरियड बंद। एक साल बाद लगभग आधी महिलाओं को पीरियड नहीं आते। यह नुक़सानदेह नहीं है, और इसका मतलब गर्भ या मेनोपॉज़ नहीं।'),
        L('Some women gain a little weight, about 1–2 kg a year.', 'कुछ महिलाओं का वज़न थोड़ा बढ़ता है, साल में लगभग 1–2 kg।'),
        L('Some get headaches or mood changes.', 'कुछ को सिरदर्द या मूड में बदलाव होता है।'),
        L('It does not affect breast milk.', 'माँ के दूध पर कोई असर नहीं।')
      ],
      ask: [
        L('Your BP is very high, or you have had diabetes for many years.', 'आपका BP बहुत ज़्यादा है, या कई सालों से डायबिटीज़ है।'),
        L('You want to get pregnant within the next year.', 'आप अगले एक साल के अंदर गर्भ चाहती हैं।'),
        L('You are breastfeeding a baby under 6 weeks old. Wait until 6 weeks.', 'आप 6 हफ़्ते से छोटे बच्चे को दूध पिला रही हैं। 6 हफ़्ते तक रुकें।')
      ],
      free: [
        L('Free at PHCs, CHCs and government hospitals. An MBBS doctor checks you before the first injection.', 'PHC, CHC और सरकारी अस्पताल में मुफ़्त। पहले इंजेक्शन से पहले MBBS डॉक्टर जाँच करते हैं।'),
        L('Later injections can be given by a trained nurse, ANM or CHO, including at many sub-centres.', 'बाद के इंजेक्शन प्रशिक्षित नर्स, ANM या CHO भी लगा सकती हैं, कई सब-सेंटर पर भी।'),
        L('Your ASHA cannot give the injection, but she can remind you of your date.', 'आपकी ASHA इंजेक्शन नहीं लगाती, पर आपकी तारीख़ याद दिला सकती है।')
      ],
      start: [
        L('Start within 7 days of your period starting. Later than that, use condoms as well for 7 days.', 'पीरियड शुरू होने के 7 दिन के अंदर शुरू करें। उसके बाद लगवाएँ तो 7 दिन साथ में कंडोम भी।'),
        L('Next injection every 3 months (13 weeks). You may go up to 2 weeks early or up to 4 weeks late.', 'अगला इंजेक्शन हर 3 महीने (13 हफ़्ते) में। 2 हफ़्ते पहले से 4 हफ़्ते बाद तक जा सकती हैं।'),
        LD('More than 4 weeks late: use condoms and go to the health centre. They will check you and restart.', '4 हफ़्ते से ज़्यादा देर: कंडोम इस्तेमाल करें और स्वास्थ्य केंद्र जाएँ। वे जाँच कर फिर से शुरू करेंगे।', 'More than 4 weeks late: use condoms and see your doctor or the health centre. They will check you and restart.', '4 हफ़्ते से ज़्यादा देर: कंडोम इस्तेमाल करें और अपनी डॉक्टर या स्वास्थ्य केंद्र जाएँ। वे जाँच कर फिर से शुरू करेंगे।'),
        L('Keep your MPA card and take it every time. Do not rub the injection spot.', 'अपना MPA card संभाल कर रखें और हर बार साथ ले जाएँ। इंजेक्शन की जगह न मलें।'),
        L('To stop, simply do not take the next injection.', 'बंद करने के लिए अगला इंजेक्शन न लगवाएँ।')
      ],
      fert: L('Slower than with other methods: on average about 7–10 months after the last injection. It does come back. Antara does not cause infertility.', 'दूसरे तरीक़ों से धीरे: औसतन आख़िरी इंजेक्शन के लगभग 7–10 महीने बाद। लौटती ज़रूर है। अंतरा से बाँझपन नहीं होता।'),
      rx: 'horm', src: ['who', 'cho', 'dmpa']
    },
    cut: {
      icon: 'leaf', name: L('Copper-T (IUCD)', 'Copper-T (IUCD)'),
      short: L('Fitted once, works 5 or 10 years. No hormones. Free.', 'एक बार लगवाएँ, 5 या 10 साल चलता है। हॉर्मोन नहीं। मुफ़्त।'),
      rate: { type: 'k', k: 8 },
      how: L('A small T-shaped device of plastic and copper, placed inside the womb by a trained doctor, nurse or ANM. The copper damages sperm and egg before they can meet. Two free types: Cu 380A works for 10 years and Cu 375 for 5 years. It can come out whenever you want.', 'प्लास्टिक और तांबे का छोटा T आकार का उपकरण, जिसे प्रशिक्षित डॉक्टर, नर्स या ANM बच्चेदानी के अंदर लगाती हैं। तांबा शुक्राणु और अंडे को मिलने से पहले ही बेकार कर देता है। दो तरह के मुफ़्त मिलते हैं: Cu 380A 10 साल चलता है और Cu 375 5 साल। जब चाहें निकलवा सकती हैं।'),
      expect: [
        L('Heavier, longer periods and more cramps are common in the first 3–6 months, then usually settle.', 'पहले 3–6 महीनों में भारी, लंबे पीरियड और ज़्यादा ऐंठन आम है, फिर आम तौर पर ठीक हो जाता है।'),
        L('Some cramping for a few days after it is fitted.', 'लगवाने के बाद कुछ दिन ऐंठन रह सकती है।'),
        L('Now and then it slips out, most often in the first months. If you see it on a pad or in the toilet, go back to the centre and use condoms meanwhile.', 'कभी-कभी यह बाहर निकल जाता है, ज़्यादातर पहले महीनों में। pad या शौचालय में दिखे तो केंद्र जाएँ और तब तक कंडोम इस्तेमाल करें।'),
        L('Indian guidance says you do not need to feel for the threads yourself.', 'भारत के नियम कहते हैं कि धागे ख़ुद टटोल कर देखने की ज़रूरत नहीं।')
      ],
      askT: L('Go back to the centre if (PAINS)', 'केंद्र वापस जाएँ अगर (PAINS)'),
      ask: [
        L('P: period problems, a missed period or signs of pregnancy.', 'P: पीरियड की दिक़्क़त, पीरियड न आना या गर्भ के लक्षण।'),
        L('A: belly pain, or pain during sex.', 'A: पेट में दर्द, या संबंध के समय दर्द।'),
        L('I: signs of infection or unusual discharge.', 'I: संक्रमण के लक्षण या असामान्य सफ़ेद पानी।'),
        L('N: not feeling well, fever or chills.', 'N: तबीयत ठीक न लगे, बुख़ार या कँपकँपी।'),
        L('S: string (thread) problems, or you or your husband can feel the device.', 'S: धागे की दिक़्क़त, या आपको या पति को उपकरण महसूस हो।')
      ],
      free: [
        L('Free at PHCs, CHCs, government hospitals and sub-centres with trained staff.', 'PHC, CHC, सरकारी अस्पताल और प्रशिक्षित स्टाफ़ वाले सब-सेंटर पर मुफ़्त।'),
        L('After a delivery in a government hospital, ask for one within 48 hours (PPIUCD). The government scheme pays you ₹300 for travel.', 'सरकारी अस्पताल में डिलीवरी के बाद 48 घंटे के अंदर माँग सकती हैं (PPIUCD)। सरकारी योजना में आने-जाने के ₹300 मिलते हैं।'),
        L('After an abortion it can be fitted within 12 days (PAIUCD), with the same ₹300.', 'गर्भपात के बाद 12 दिन के अंदर लगवा सकती हैं (PAIUCD), उसमें भी ₹300 मिलते हैं।')
      ],
      start: [
        L('Any day of your cycle when you are not pregnant, or from 6 weeks after a delivery.', 'चक्र के किसी भी दिन, जब गर्भ न हो; या डिलीवरी के 6 हफ़्ते बाद से।'),
        L('Within 48 hours of a normal delivery, or during a caesarean.', 'नॉर्मल डिलीवरी के 48 घंटे के अंदर, या सिज़ेरियन ऑपरेशन के समय।'),
        L('Go back for a check at 6 weeks, or after your first period if that comes sooner.', '6 हफ़्ते पर जाँच के लिए जाएँ, या पहला पीरियड पहले आए तो उसके बाद।'),
        L('Keep your IUCD card. Replace it after 10 years (380A) or 5 years (375).', 'अपना IUCD card रखें। 10 साल (380A) या 5 साल (375) बाद बदलवाएँ।'),
        L('To stop, a provider takes it out in a few minutes. Do not pull it yourself.', 'बंद करने के लिए स्वास्थ्यकर्मी कुछ मिनट में निकाल देती हैं। ख़ुद न खींचें।')
      ],
      fert: L('No delay. Fertility returns as soon as it is removed.', 'कोई देरी नहीं। निकलवाते ही लौट आती है।'),
      rx: 'fit', src: ['who', 'iucd', 'cho']
    },
    ius: {
      icon: 'leaf', name: L('Hormonal IUD (LNG-IUS)', 'हॉर्मोन वाला IUD (LNG-IUS)'),
      short: L('Fitted in the womb, lighter periods. Private clinics.', 'बच्चेदानी में लगता है, पीरियड हल्के। प्राइवेट क्लिनिक में।'),
      rate: { type: 'k', k: 2 },
      how: L('A small T-shaped device that releases a little levonorgestrel, a progestin, inside the womb. It works for several years; how many depends on the brand, and your gynaecologist writes the removal date on your card. It is not in the free government programme. Gynaecologists fit it, mostly in private clinics.', 'छोटा T आकार का उपकरण जो बच्चेदानी के अंदर थोड़ा levonorgestrel (एक progestin) छोड़ता है। यह कई साल चलता है; कितने साल, यह brand पर निर्भर है, और निकलवाने की तारीख़ आपकी स्त्री रोग विशेषज्ञ card पर लिखती हैं। यह मुफ़्त सरकारी कार्यक्रम में नहीं है। स्त्री रोग विशेषज्ञ लगाती हैं, ज़्यादातर प्राइवेट क्लिनिक में।'),
      expect: [
        L('Periods usually get lighter and shorter. Some women stop having them. This is not harmful.', 'पीरियड आम तौर पर हल्के और छोटे हो जाते हैं। कुछ को आते ही नहीं। यह नुक़सानदेह नहीं।'),
        L('Irregular spotting is common in the first months.', 'पहले महीनों में अनियमित स्पॉटिंग आम है।'),
        L('Some women get acne, headaches, sore breasts or nausea.', 'कुछ को मुँहासे, सिरदर्द, स्तनों में दर्द या जी मिचलाना होता है।')
      ],
      ask: [
        L('You have had breast cancer.', 'आपको breast cancer हुआ है।'),
        L('You have a pelvic infection or an STI right now.', 'अभी आपको पेट के निचले हिस्से में संक्रमण या STI है।'),
        L('You might be pregnant.', 'गर्भ हो सकता है।')
      ],
      whereT: L('Where to get it', 'कहाँ मिलेगा'),
      free: [
        L('Not free in the government programme. Ask the gynaecologist what it costs, including fitting.', 'सरकारी कार्यक्रम में मुफ़्त नहीं। स्त्री रोग विशेषज्ञ से लगवाने समेत कुल ख़र्च पूछें।'),
        L('Want something free that lasts years? Copper-T is the government option.', 'मुफ़्त और सालों चलने वाला चाहिए? Copper-T सरकारी विकल्प है।')
      ],
      start: [
        L('A gynaecologist fits it. Fitted within 7 days of your period starting, you need nothing else; later than that, use condoms for 7 days.', 'स्त्री रोग विशेषज्ञ लगाती हैं। पीरियड शुरू होने के 7 दिन के अंदर लगे तो और कुछ नहीं चाहिए; उसके बाद लगे तो 7 दिन कंडोम भी।'),
        L('Keep the card with the brand and the date it must come out.', 'brand और निकालने की तारीख़ वाला card संभाल कर रखें।'),
        L('To stop, the doctor removes it.', 'बंद करने के लिए डॉक्टर निकाल देती हैं।')
      ],
      fert: L('No delay after it is removed.', 'निकलवाने के बाद कोई देरी नहीं।'),
      rx: 'horm', src: ['who']
    },
    implant: {
      icon: 'sparkle', name: L('Implant (in the arm)', 'बाँह का implant'),
      short: L('A small rod under the skin of the arm. Lasts 3 years.', 'बाँह की त्वचा के नीचे छोटी छड़। 3 साल चलती है।'),
      rate: { type: 'k', k: 1 },
      how: L('A rod the size of a matchstick, placed under the skin of your upper arm. It releases a progestin that stops ovulation. The single-rod implant is approved for 3 years. The government has started offering it free in a few districts of some states; elsewhere private gynaecologists fit it.', 'माचिस की तीली जितनी छड़, जो ऊपरी बाँह की त्वचा के नीचे लगाई जाती है। यह progestin छोड़ती है जिससे अंडा नहीं निकलता। एक छड़ वाला implant 3 साल के लिए मंज़ूर है। सरकार ने कुछ राज्यों के कुछ ज़िलों में इसे मुफ़्त देना शुरू किया है; बाक़ी जगह प्राइवेट स्त्री रोग विशेषज्ञ लगाती हैं।'),
      expect: [
        L('Irregular bleeding is common in the first year. After that bleeding is often lighter, less frequent, or stops.', 'पहले साल अनियमित ब्लीडिंग आम है। उसके बाद अक्सर हल्की, कम बार, या बंद हो जाती है।'),
        L('The arm may be sore or bruised for a few days after it is placed.', 'लगवाने के बाद कुछ दिन बाँह में दर्द या नील पड़ सकता है।'),
        L('No oestrogen, so it is safe while breastfeeding.', 'estrogen नहीं है, इसलिए स्तनपान में सुरक्षित है।')
      ],
      ask: [
        L('You have had breast cancer.', 'आपको breast cancer हुआ है।'),
        L('You take medicine for fits (epilepsy) or TB. Some of these make it work less well.', 'आप मिर्गी या TB की दवा लेती हैं। इनमें से कुछ इसका असर कम करती हैं।'),
        L('You have serious liver disease.', 'आपको लिवर की गंभीर बीमारी है।')
      ],
      whereT: L('Where to get it', 'कहाँ मिलेगा'),
      free: [
        L('Ask at your district hospital whether your district offers it free.', 'अपने ज़िला अस्पताल में पूछें कि आपके ज़िले में यह मुफ़्त मिलता है या नहीं।'),
        L('Otherwise a private gynaecologist can fit it. Ask about the total cost first.', 'नहीं तो प्राइवेट स्त्री रोग विशेषज्ञ लगा सकती हैं। पहले कुल ख़र्च पूछ लें।')
      ],
      start: [
        L('A trained provider numbs the skin and slides it in. It takes a few minutes.', 'प्रशिक्षित स्वास्थ्यकर्मी त्वचा सुन्न कर के इसे अंदर डालती हैं। कुछ मिनट लगते हैं।'),
        L('Placed within 7 days of your period starting, you need nothing else; later than that, use condoms for 7 days.', 'पीरियड शुरू होने के 7 दिन के अंदर लगे तो और कुछ नहीं चाहिए; उसके बाद लगे तो 7 दिन कंडोम भी।'),
        L('Breastfeeding with no period yet: it can be placed any time after the birth.', 'दूध पिला रही हैं और पीरियड नहीं लौटे: जन्म के बाद कभी भी लग सकता है।'),
        L('To stop, a trained provider removes it through a tiny cut.', 'बंद करने के लिए प्रशिक्षित स्वास्थ्यकर्मी छोटे से चीरे से निकाल देती हैं।')
      ],
      fert: L('No delay after it is removed.', 'निकलवाने के बाद कोई देरी नहीं।'),
      rx: 'horm', src: ['who']
    },
    tubectomy: {
      icon: 'lock', name: L('Tubectomy (female sterilisation)', 'महिला नसबंदी'),
      short: L('Permanent. A small operation, free at government hospitals.', 'स्थायी। छोटा ऑपरेशन, सरकारी अस्पताल में मुफ़्त।'),
      rate: { type: 'k', k: 5 },
      how: L('A small operation that blocks or cuts both fallopian tubes, so egg and sperm cannot meet. It is done through a small cut in the belly (minilap) or with a laparoscope. It is meant to be permanent: reversal is difficult and often does not work.', 'छोटा ऑपरेशन जिसमें दोनों नलियाँ (fallopian tubes) बाँधी या काटी जाती हैं, ताकि अंडा और शुक्राणु न मिल सकें। पेट पर छोटे चीरे से (minilap) या laparoscope से होता है। यह स्थायी है: वापस खुलवाना मुश्किल है और अक्सर काम नहीं करता।'),
      expect: [
        L('It works from the day of the operation.', 'ऑपरेशन के दिन से काम करता है।'),
        L('No long-term side effects. Your periods do not change because of it.', 'लंबे समय का कोई साइड इफ़ेक्ट नहीं। इससे पीरियड नहीं बदलते।'),
        L('Some pain for a few days after the operation.', 'ऑपरेशन के बाद कुछ दिन दर्द रह सकता है।'),
        L('A small chance of failure stays for years: about 2 in 100 over 10 years.', 'सालों तक फ़ेल होने की थोड़ी संभावना रहती है: 10 साल में लगभग 100 में 2।')
      ],
      ask: [
        L('You are not fully sure you want no more children.', 'आप पूरी तरह पक्की नहीं हैं कि और बच्चे नहीं चाहिए।'),
        L('Your husband could have NSV instead. It is simpler and has fewer complications.', 'आपके पति की NSV भी हो सकती है। वह आसान है और उसमें कम दिक़्क़तें होती हैं।')
      ],
      free: [
        L('Free at government hospitals and CHCs, and at PHCs on fixed days. Ask your ASHA for the next date.', 'सरकारी अस्पताल और CHC में मुफ़्त, और PHC पर तय दिनों में। अगली तारीख़ अपनी ASHA से पूछें।'),
        L('The government pays compensation for lost wages and travel. The amount depends on your state; ask at the PHC.', 'सरकार मज़दूरी के नुक़सान और आने-जाने का मुआवज़ा देती है। रक़म आपके राज्य पर निर्भर है; PHC में पूछें।'),
        L('Government rules: married, aged 22–49, with at least one child over 1 year old, and your written consent.', 'सरकारी नियम: शादीशुदा, उम्र 22–49, कम से कम एक बच्चा जो 1 साल से बड़ा हो, और आपकी लिखित सहमति।')
      ],
      start: [
        L('It can be done at the time of a delivery or abortion, within 7 days after, or at any other time.', 'डिलीवरी या गर्भपात के समय, उसके 7 दिन के अंदर, या किसी और समय हो सकता है।'),
        L('Check-ups on day 7, then at 6 weeks or after your first period, whichever is sooner.', '7वें दिन जाँच, फिर 6 हफ़्ते पर या पहले पीरियड के बाद, जो पहले हो।'),
        L('Collect your sterilisation certificate from the hospital about a month later.', 'लगभग एक महीने बाद अस्पताल से नसबंदी का प्रमाणपत्र ले लें।')
      ],
      fert: L('It does not come back. Treat it as permanent.', 'वापस नहीं आती। इसे स्थायी ही मानें।'),
      rx: 'surg', src: ['who', 'cho']
    },
    nsv: {
      icon: 'users', name: L('NSV (no-scalpel vasectomy)', 'पुरुष नसबंदी (NSV)'),
      short: L('For your husband. No cut, no stitches, home in 30 minutes.', 'पति के लिए। न चीरा, न टाँके, 30 मिनट में घर।'),
      rate: { type: 'nsv' },
      how: L('A short procedure for men. Through a tiny puncture in the scrotum, the doctor closes the two tubes that carry sperm. Semen still comes out, but without sperm. It does not affect strength, manliness or sex.', 'पुरुषों के लिए छोटी प्रक्रिया। अंडकोष की थैली में बहुत छोटे छेद से डॉक्टर शुक्राणु ले जाने वाली दोनों नलियाँ बंद कर देते हैं। वीर्य निकलता रहता है, पर उसमें शुक्राणु नहीं होते। ताक़त, मर्दानगी या संबंध पर कोई असर नहीं।'),
      expect: [
        L('No cut and no stitches. He can walk home about 30 minutes later.', 'न चीरा, न टाँके। लगभग 30 मिनट बाद पैदल घर जा सकते हैं।'),
        L('Some discomfort, swelling or bruising for 2–3 days.', '2–3 दिन थोड़ी तकलीफ़, सूजन या नील।'),
        L('It does not work straight away. Use condoms for the first 3 months.', 'यह तुरंत काम नहीं करता। पहले 3 महीने कंडोम इस्तेमाल करें।')
      ],
      ask: [L('He is not fully sure he wants no more children.', 'वे पूरी तरह पक्के नहीं हैं कि और बच्चे नहीं चाहिए।')],
      free: [
        L('Free at government hospitals and CHCs, with compensation for lost wages. The amount depends on the state.', 'सरकारी अस्पताल और CHC में मुफ़्त, मज़दूरी के नुक़सान के मुआवज़े के साथ। रक़म राज्य पर निर्भर है।'),
        L('Government rules: married man aged 22–60, with at least one child over 1 year old.', 'सरकारी नियम: शादीशुदा पुरुष, उम्र 22–60, कम से कम एक बच्चा जो 1 साल से बड़ा हो।')
      ],
      start: [
        L('Use condoms or another method for 3 months after the procedure.', 'प्रक्रिया के बाद 3 महीने कंडोम या कोई और तरीक़ा अपनाएँ।'),
        L('Get a semen test at 3 months. NSV is working only when the test shows no sperm.', '3 महीने पर वीर्य की जाँच कराएँ। जाँच में शुक्राणु न दिखें, तभी NSV काम कर रही है।'),
        L('The certificate is given after a clear semen test.', 'जाँच साफ़ आने के बाद प्रमाणपत्र मिलता है।')
      ],
      fert: L('It does not come back. Treat it as permanent.', 'वापस नहीं आती। इसे स्थायी ही मानें।'),
      rx: 'surg', src: ['who', 'cho']
    },
    lam: {
      icon: 'baby', name: L('Breastfeeding method (LAM)', 'स्तनपान वाला तरीक़ा (LAM)'),
      short: L('Only in the first 6 months, and only if all 3 conditions hold.', 'सिर्फ़ पहले 6 महीने, और तभी जब तीनों शर्तें पूरी हों।'),
      rate: { type: 'lam' },
      how: L('Breastfeeding often, day and night, stops your ovaries from releasing eggs. It protects you only while all 3 are true: your periods have not come back, your baby gets only or almost only breast milk, and your baby is under 6 months old.', 'दिन और रात बार-बार दूध पिलाने से अंडा निकलना रुक जाता है। यह तभी बचाता है जब तीनों बातें सच हों: पीरियड नहीं लौटे, बच्चे को सिर्फ़ या लगभग सिर्फ़ माँ का दूध मिलता है, और बच्चा 6 महीने से छोटा है।'),
      expect: [
        L('No side effects, and it is good for your baby.', 'कोई साइड इफ़ेक्ट नहीं, और बच्चे के लिए अच्छा है।'),
        L('The day one condition changes, it stops protecting you. Start another method that day.', 'जिस दिन कोई एक शर्त बदले, उसी दिन से यह नहीं बचाता। उसी दिन दूसरा तरीक़ा शुरू करें।'),
        L('You can get pregnant before your first period comes back.', 'पहला पीरियड लौटने से पहले भी गर्भ ठहर सकता है।')
      ],
      askT: L('Plan your next method', 'अगला तरीक़ा पहले से तय करें'),
      ask: [
        L('Safe while breastfeeding: Copper-T, Chhaya, POP, the implant, condoms, and Antara from 6 weeks.', 'स्तनपान में सुरक्षित: Copper-T, छाया, POP, implant, कंडोम, और 6 हफ़्ते बाद से अंतरा।'),
        L('The combined pill (Mala-N) waits until your baby is 6 months old.', 'रोज़ की कंबाइंड गोली (Mala-N) बच्चे के 6 महीने का होने तक नहीं।')
      ],
      whereT: L('Help near you', 'आपके पास मदद'),
      free: [LD('Nothing to buy. Your ASHA or ANM can help you plan the next method.', 'कुछ ख़रीदना नहीं। आपकी ASHA या ANM अगला तरीक़ा तय करने में मदद करेंगी।', 'Nothing to buy. Your doctor can help you plan the next method.', 'कुछ ख़रीदना नहीं। आपकी डॉक्टर अगला तरीक़ा तय करने में मदद करेंगी।')],
      start: [
        L('Start right after birth: breastfeed often, day and night.', 'जन्म के तुरंत बाद से: दिन और रात बार-बार दूध पिलाएँ।'),
        L('Before your baby is 6 months old, or as soon as a condition fails, switch to another method.', 'बच्चे के 6 महीने का होने से पहले, या कोई शर्त टूटते ही, दूसरा तरीक़ा अपनाएँ।')
      ],
      fert: L('It returns as breastfeeding reduces, often before the first period.', 'दूध पिलाना कम होने पर लौटती है, अक्सर पहले पीरियड से पहले ही।'),
      rx: null, src: ['who', 'cho']
    },
    ec: {
      icon: 'help', name: L('Emergency pill', 'इमरजेंसी गोली'),
      short: L('After unprotected sex. As soon as possible, within 72 hours.', 'असुरक्षित संबंध के बाद। जितनी जल्दी हो, 72 घंटे के अंदर।'),
      rate: { type: 'ec' },
      how: L('A single levonorgestrel 1.5 mg pill taken after unprotected sex, a condom accident or missed pills. It delays or stops the release of an egg. It is not an abortion pill and does not harm a pregnancy that has already started.', 'levonorgestrel 1.5 mg की एक गोली, जो असुरक्षित संबंध, कंडोम फटने या गोली छूटने के बाद ली जाती है। यह अंडा निकलना टालती या रोकती है। यह गर्भपात की गोली नहीं है और पहले से ठहरे गर्भ को नुक़सान नहीं पहुँचाती।'),
      expect: [
        L('Nausea, or slight bleeding.', 'जी मिचलाना, या हल्की ब्लीडिंग।'),
        L('Your next period may come a little early or late.', 'अगला पीरियड थोड़ा पहले या देर से आ सकता है।'),
        L('Vomited within 2 hours of taking it? Take another dose.', 'लेने के 2 घंटे के अंदर उल्टी हुई? एक और ख़ुराक लें।'),
        L('It covers only sex before you took it. Use condoms or start a regular method.', 'यह सिर्फ़ गोली लेने से पहले के संबंध के लिए है। आगे कंडोम या कोई नियमित तरीक़ा अपनाएँ।')
      ],
      askT: L('See a doctor if', 'डॉक्टर को दिखाएँ अगर'),
      ask: [
        L('Your period is more than a week late. Do a pregnancy test first.', 'पीरियड एक हफ़्ते से ज़्यादा देर से है। पहले गर्भ का test करें।'),
        L('Your period is unusually light or unusually painful.', 'पीरियड असामान्य रूप से हल्का या असामान्य रूप से दर्द वाला है।'),
        L('You find you need it often. A regular method works better and upsets your periods less.', 'आपको इसकी बार-बार ज़रूरत पड़ती है। नियमित तरीक़ा बेहतर काम करता है और पीरियड कम गड़बड़ाते हैं।')
      ],
      whereT: L('Where to get it', 'कहाँ मिलेगी'),
      free: [
        L('Any chemist, without a prescription.', 'किसी भी chemist से, बिना पर्ची।'),
        L('Free from your ASHA, the sub-centre, PHC or CHC.', 'आपकी ASHA, सब-सेंटर, PHC या CHC से मुफ़्त।'),
        L('A Copper-T fitted within 5 days is the most effective emergency option, over 99%. Free at PHCs, CHCs and government hospitals.', '5 दिन के अंदर लगा Copper-T सबसे असरदार इमरजेंसी विकल्प है, 99% से ज़्यादा। PHC, CHC और सरकारी अस्पताल में मुफ़्त।')
      ],
      start: [
        L('Take it as soon as you can, within 72 hours (3 days). The sooner, the better.', 'जितनी जल्दी हो सके लें, 72 घंटे (3 दिन) के अंदर। जितनी जल्दी, उतना बेहतर।'),
        L('Most regular methods can be started the same day.', 'ज़्यादातर नियमित तरीक़े उसी दिन शुरू किए जा सकते हैं।')
      ],
      fert: L('No delay. You can get pregnant again in the same cycle, so use protection.', 'कोई देरी नहीं। उसी चक्र में फिर से गर्भ ठहर सकता है, इसलिए सुरक्षा रखें।'),
      rx: null, src: ['who', 'ocp', 'whoec']
    }
  };
  const KEYS = Object.keys(M);
  const GROUPS = [
    ['contra_g_long', ['cut', 'antara', 'implant', 'ius']],
    ['contra_g_pill', ['pill', 'chhaya', 'pop']],
    ['contra_g_each', ['condom']],
    ['contra_g_perm', ['tubectomy', 'nsv']],
    ['contra_g_after', ['lam']],
    ['contra_g_emerg', ['ec']]
  ];
  const nm = (k) => (M[k] ? tx(M[k].name) : '');

  /* ---------- effectiveness ---------- */
  const RATE_TXT = {
    chhaya: L('Taken exactly on schedule, about 1–2 in 100 women get pregnant in a year. There is no good figure yet for everyday use.', 'ठीक समय पर लेने से साल में 100 में लगभग 1–2 महिलाओं को गर्भ ठहरता है। आम इस्तेमाल का भरोसेमंद आँकड़ा अभी नहीं है।'),
    pop: L('Out of 100 women using it for a year, about 7 get pregnant with typical use. Among breastfeeding mothers, about 1.', 'इसे एक साल इस्तेमाल करने वाली 100 महिलाओं में से, आम इस्तेमाल में लगभग 7 को गर्भ ठहरता है। दूध पिलाने वाली माँओं में लगभग 1 को।'),
    lam: L('Out of 100 women relying on it in the first 6 months after birth, about 2 get pregnant.', 'जन्म के बाद पहले 6 महीनों में इस पर निर्भर 100 महिलाओं में से लगभग 2 को गर्भ ठहरता है।'),
    nsv: L('Fewer than 1 in 100. Fewer than 2 in 1,000 wives get pregnant in the first year, often because condoms were skipped in the first 3 months.', '100 में 1 से कम। पहले साल में 1,000 में 2 से कम पत्नियों को गर्भ ठहरता है, अक्सर इसलिए कि पहले 3 महीने कंडोम नहीं लिया गया।'),
    ec: L('If 100 women had unprotected sex once in the middle weeks of their cycle, about 8 would get pregnant without it and about 1 with it.', 'अगर 100 महिलाएँ चक्र के बीच के हफ़्तों में एक बार असुरक्षित संबंध बनाएँ, तो इसके बिना लगभग 8 को और इसके साथ लगभग 1 को गर्भ ठहरेगा।')
  };
  function badge(k) {
    const r = M[k].rate;
    if (r.type === 'typ') return { big: String(r.n), small: t('contra_in100') };
    if (r.type === 'k' || r.type === 'nsv') return { big: '<1', small: t('contra_in100') };
    if (r.type === 'chhaya') return { big: '1–2', small: t('contra_in100') };
    if (r.type === 'pop') return { big: '7', small: t('contra_in100') };
    if (r.type === 'lam') return { big: '2', small: t('contra_in100') };
    return { big: '72', small: t('contra_hours') };
  }
  function rateSentence(k) {
    const r = M[k].rate;
    if (r.type === 'typ') return tf('contra_rate_typ', { n: r.n });
    if (r.type === 'k') return tf('contra_rate_k', { k: r.k });
    return tx(RATE_TXT[r.type]);
  }
  function dots(k) {
    const r = M[k].rate; let on = 0;
    if (r.type === 'typ') on = r.n; else if (r.type === 'pop') on = 7; else if (r.type === 'lam') on = 2; else if (r.type === 'chhaya' || r.type === 'ec') return '';
    let s = '<svg class="contra-dots" viewBox="0 0 100 100" role="img" aria-label="' + esc(rateSentence(k)) + '">';
    for (let i = 0; i < 100; i++) s += '<circle cx="' + (5 + (i % 10) * 10) + '" cy="' + (5 + Math.floor(i / 10) * 10) + '" r="3.6"' + (i < on ? ' class="on"' : '') + '/>';
    return s + '</svg>';
  }

  /* ---------- small markup helpers ---------- */
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ol>';
  const srcList = (keys) => '<details><summary>' + esc(t('contra_sources')) + '</summary><p class="sources">' + keys.map((k) => { const s = SRC[k]; return s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + E(s) + '</a>' : E(s); }).join(' · ') + '</p></details>';
  const resRow = (k) => { const b = badge(k); return '<button type="button" class="contra-res" data-go="contra-m-' + k + '"><span class="ico-sm">' + S.icon(M[k].icon) + '</span><span class="rb"><span class="rt">' + E(M[k].name) + '</span><span class="rs">' + E(M[k].short) + '</span></span><span class="rn"><b class="num">' + esc(b.big) + '</b>' + esc(b.small) + '</span></button>'; };
  const actionRow = (go, ico, title, sub, cls) => '<button type="button" class="action" data-go="' + go + '"><span class="ico' + (cls ? ' ' + cls : '') + '">' + I[ico] + '</span><span class="body"><strong>' + esc(title) + '</strong><span class="small">' + esc(sub) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  /* Version 39.77 (Mohit's choices D9 to D13): contraception goes to her gynaecologist or a free government doctor */
  const quraCard = (topic) => S.docCard ? S.docCard(null, topic) : '<div class="card dark"><h3>' + esc(t('contra_qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(t('contra_qura_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(topic) + '">' + esc(t('qura_b')) + '</button></div>';

  /* ---------- my method: data, schedules, reminders ---------- */
  const DAILY = ['pill', 'pop'];
  const REM = {
    pill: L('Take your pill', 'अपनी गोली लें'),
    chhaya: L('Chhaya pill today', 'आज छाया की गोली'),
    antara: L('Antara injection due', 'अंतरा इंजेक्शन की तारीख़'),
    cutVisit: L('Copper-T check-up visit', 'Copper-T जाँच के लिए जाएँ'),
    cutMonth: L('After your period: any Copper-T warning signs?', 'पीरियड के बाद: Copper-T के कोई चेतावनी संकेत?'),
    cutReplace: L('Copper-T due for replacement', 'Copper-T बदलवाने का समय'),
    devOut: L('Implant or IUD due to come out', 'Implant या IUD निकलवाने का समय'),
    nsv: L('NSV semen test due', 'NSV के बाद वीर्य जाँच'),
    lam: L('LAM ends soon: start your next method', 'LAM ख़त्म होने वाला है: अगला तरीक़ा शुरू करें')
  };
  function chhSched(d) {
    if (!okDate(d.chhStart)) return null;
    const st = S.fromISO(d.chhStart); const a = st.getDay(); const b = (a + 3) % 7; const p2 = addMonths(st, 3);
    return { st: st, a: a, b: b, p2: p2, on: (x) => x >= st && (x < p2 ? (x.getDay() === a || x.getDay() === b) : x.getDay() === a) };
  }
  function isDue(d, dt) {
    if (d.since && okDate(d.since) && dt < S.fromISO(d.since)) return false;
    if (DAILY.indexOf(d.method) >= 0) return true;
    if (d.method === 'chhaya') { const c = chhSched(d); return !!(c && c.on(dt)); }
    return false;
  }
  const tracks = (d) => DAILY.indexOf(d.method) >= 0 || (d.method === 'chhaya' && !!chhSched(d));
  function counts(d) {
    const log = d.log || {}; const td = S.today(); let tk = 0, ms = 0, un = 0;
    /* Days before her first tick are not counted as "not marked": she was not using the log yet. */
    const first = Object.keys(log).sort()[0] || iso(td);
    for (let i = 0; i < 30; i++) { const dt = S.addDays(td, -i); if (!isDue(d, dt)) continue; const s = iso(dt); const v = log[s]; if (v === 't') tk++; else if (v === 'm') ms++; else if (i > 0 && s >= first) un++; }
    return { t: tk, m: ms, u: un };
  }
  const antaraDates = (d) => { if (!okDate(d.injLast)) return null; const last = S.fromISO(d.injLast); const due = S.addDays(last, 91); return { last: last, due: due, early: S.addDays(due, -14), late: S.addDays(due, 28) }; };
  const cutDates = (d) => { if (!okDate(d.cutDate)) return null; const f = S.fromISO(d.cutDate); const yrs = d.cutType === '380A' ? 10 : (d.cutType === '375' ? 5 : 0); return { fit: f, visit: S.addDays(f, 42), replace: yrs ? addMonths(f, yrs * 12) : null }; };
  const lamBirth = (d) => (okDate(d.lamBirth) ? d.lamBirth : (okDate(S.state.situation && S.state.situation.deliveredOn) ? S.state.situation.deliveredOn : ''));

  /* Her pill time lives on the reminder: a time changed under All reminders is the time here too, and stays. */
  const PILL_IDS = ['contra-pill', 'contra-chhaya-2', 'contra-chhaya-1'];
  /* Ticking today's pill (taken or missed) marks today done on her pill reminders: Next and Coming up move to tomorrow, and an
     alarm still to come today does not ring. */
  const markToday = (d, v) => { const s = iso(S.today()); d.log = d.log || {}; if (v) d.log[s] = v; else delete d.log[s]; PILL_IDS.forEach((id) => { const r = S.reminders.get(id); if (r) { if (v) r.doneOn = s; else delete r.doneOn; } }); };
  const ptime = (d) => { for (let i = 0; i < PILL_IDS.length; i++) { const r = S.reminders.get(PILL_IDS[i]); if (r && /^\d{2}:\d{2}$/.test(r.time || '')) return r.time; } return d.pillTime || '21:00'; };
  /* A method past its end date: LAM from 6 months after the birth, a Copper-T past its years, an implant or hormonal IUD past the
     date on her card. Returns the date it ended, or null. */
  const expiredOn = (d, td) => {
    if (d.method === 'lam') { const b = lamBirth(d); if (b) { const end = addMonths(S.fromISO(b), 6); if (td >= end) return end; } }
    if (d.method === 'cut') { const c = cutDates(d); if (c && c.replace && td >= c.replace) return c.replace; }
    if ((d.method === 'implant' || d.method === 'ius') && okDate(d.until) && td >= S.fromISO(d.until)) return S.fromISO(d.until);
    return null;
  };
  const expiredFlag = (d, td) => { const e = expiredOn(d, td); return e ? '<div class="flag urgent">' + esc(tf(d.method === 'lam' ? 'contra_lam_over' : 'contra_overdue', { d: fmt(e) })) + '</div>' : ''; };
  function sync(d) {
    const time = ptime(d); d.pillTime = time;
    S.reminders.list().filter((r) => r.mod === 'contra').map((r) => r.id).forEach((id) => S.reminders.remove(id));
    if (!d.method || d.remOn === false) return;
    const td = S.today(); const tdS = iso(td); const m = d.method;
    const up = (r) => S.reminders.upsert(Object.assign({ mod: 'contra', on: true }, r));
    if (DAILY.indexOf(m) >= 0) up({ id: 'contra-pill', title: REM.pill, kind: 'med', start: okDate(d.since) ? d.since : tdS, every: 1, time: time });
    if (m === 'chhaya') {
      const c = chhSched(d);
      if (c) {
        const dates = []; for (let x = new Date(c.st); x < c.p2; x = S.addDays(x, 1)) if (x.getDay() === c.a || x.getDay() === c.b) dates.push(iso(x));
        if (dates.some((x) => x >= tdS)) up({ id: 'contra-chhaya-1', title: REM.chhaya, kind: 'med', dates: dates, time: time });
        let w = new Date(c.p2); while (w.getDay() !== c.a) w = S.addDays(w, 1);
        up({ id: 'contra-chhaya-2', title: REM.chhaya, kind: 'med', start: iso(w), weekdays: [c.a], time: time });
      }
    }
    if (m === 'antara') { const a = antaraDates(d); if (a) up({ id: 'contra-antara', title: REM.antara, kind: 'visit', dates: [a.early, a.due, S.addDays(a.due, 7), S.addDays(a.due, 14), S.addDays(a.due, 21), a.late].map(iso), time: '10:00' }); }   /* 2 weeks early to 4 weeks late (MoHFW) */
    if (m === 'cut') {
      const c = cutDates(d);
      if (c) {
        if (c.visit >= td) up({ id: 'contra-cut-visit', title: REM.cutVisit, kind: 'visit', dates: [iso(c.visit)], time: '10:00' });
        if (c.replace) up({ id: 'contra-cut-replace', title: REM.cutReplace, kind: 'visit', dates: [iso(c.replace)], time: '10:00' });
        if (d.cutMonthly !== false) up({ id: 'contra-cut-month', title: REM.cutMonth, kind: 'checkup', start: iso(S.addDays(c.fit, 30)), every: 30, time: '09:00' });
      }
    }
    if ((m === 'implant' || m === 'ius') && okDate(d.until)) up({ id: 'contra-dev', title: REM.devOut, kind: 'visit', dates: [d.until], time: '10:00' });
    if (m === 'nsv' && okDate(d.nsvDate)) up({ id: 'contra-nsv', title: REM.nsv, kind: 'checkup', dates: [iso(addMonths(S.fromISO(d.nsvDate), 3))], time: '10:00' });
    if (m === 'lam') { const b = lamBirth(d); if (b) { const end = addMonths(S.fromISO(b), 6); up({ id: 'contra-lam', title: REM.lam, kind: 'custom', dates: [iso(S.addDays(end, -14)), iso(end)], time: '10:00' }); } }
    if ((d.log || {})[tdS]) PILL_IDS.forEach((id) => { const r = S.reminders.get(id); if (r) r.doneOn = tdS; });   /* today's pill already ticked */
  }
  function nextDue() {
    const L2 = S.reminders.list().filter((r) => r.mod === 'contra').map((r) => ({ r: r, d: S.reminders.next(r) })).filter((x) => x.d).sort((a, b) => a.d - b.d);
    return L2[0] || null;
  }

  /* ---------- hub ---------- */
  /* Version 39.7 (journey audit P3-16): common fears, answered from the one myths deck (joy.js), which Sach ya Myth reads too */
  function worries() {
    const cards = S.joy && S.joy.deck ? S.joy.deck('contra') : []; if (!cards.length) return '';
    return '<h2>' + esc(t('contra_wf_h')) + '</h2><div class="stack contra-wf">' + cards.map((c) => '<details class="card contra-wf-c"><summary><span class="pill ' + (c.a ? 'ok' : 'muted') + '">' + esc(t(c.a ? 'contra_wf_fact' : 'contra_wf_myth')) + '</span> <strong>' + esc(tx(c.s)) + '</strong></summary><p class="small">' + esc(tx(c.w)) + '</p>' +
      (c.go && c.go !== 'contra' && (S.routeOwner(c.go) || c.go.indexOf('contra-m-') === 0) ? '<button type="button" class="linkbtn" data-go="' + esc(c.go) + '">' + esc(t('contra_wf_more')) + '</button>' : '') + '</details>').join('') + '</div>';
  }
  function renderHub(v) {
    const d = D(); const mine = S.canSave() && d.method && M[d.method];
    let myCard = '';
    if (mine) {
      const nx = nextDue(); const td = S.today(); const todayDue = tracks(d) && isDue(d, td) && !(d.log || {})[iso(td)];
      myCard = '<div class="card soft" style="gap:8px"><div class="eyebrow">' + esc(t('contra_my')) + '</div><div class="row spread"><h3 style="min-width:0">' + esc(nm(d.method)) + '</h3><button type="button" class="btn sm" data-go="contra-mine">' + esc(t('edit')) + '</button></div>' +
        (expiredOn(d, td) ? expiredFlag(d, td) : '<p class="small">' + (nx ? esc(t('contra_next')) + ': ' + esc(fmtS(nx.d)) + (nx.r.time ? ' · ' + esc(nx.r.time) : '') + ' · ' + esc(S.reminders.text(nx.r)) : esc(t('contra_no_next'))) + '</p>') +
        (todayDue ? '<button type="button" class="btn secondary sm" id="hub-took">' + esc(t('contra_took_today')) + '</button>' : '') + '</div>';
    }
    v.innerHTML = S.backRow(t('contra_hub'), 'care', false) + '<p class="small">' + esc(t('contra_hub_p')) + '</p>' + myCard +
      actionRow('contra-chooser', 'sparkle', t('contra_find'), t('contra_find_s'), 'accent') +
      '<div class="list">' +
      [['contra-mine', 'bell', 'contra_mine', 'contra_mine_s'], ['contra-missed', 'clock', 'contra_missed', 'contra_missed_s'], ['contra-ec', 'help', 'contra_ec', 'contra_ec_s'], ['contra-free', 'map', 'contra_free', 'contra_free_s']]
        .map((x) => '<button type="button" class="item" data-go="' + x[0] + '"><span class="ico-sm">' + I[x[1]] + '</span><span class="body"><strong>' + esc(t(x[2])) + '</strong><span>' + esc(t(x[3])) + '</span></span><span style="color:var(--accent);width:18px;flex-shrink:0">' + I.chev + '</span></button>').join('') + '</div>' +
      '<p class="note">' + esc(t('contra_safe_days')) + '</p>' +
      '<h2>' + esc(t('contra_all')) + '</h2><p class="small">' + esc(t('contra_num_note')) + '</p>' +
      GROUPS.map((g) => '<div class="stack"><div class="eyebrow">' + esc(t(g[0])) + '</div><div class="list">' + g[1].map(resRow).join('') + '</div></div>').join('') +
      worries() + quraCard(t('contra_hub'));
    S.wire(v);
    const tb = v.querySelector('#hub-took'); if (tb) tb.addEventListener('click', () => { markToday(D(), 't'); S.save(); S.toast(t('contra_marked')); S.render(); });
  }

  /* ---------- method pages ---------- */
  const RX = {
    horm: L("A hormonal method, started after a health check by the government health team (doctor, nurse or ANM) or by an MBBS doctor or gynaecologist.", 'यह हॉर्मोन वाला तरीक़ा है, जो सरकारी स्वास्थ्य टीम (डॉक्टर, नर्स या ANM) या MBBS डॉक्टर या स्त्री रोग विशेषज्ञ जाँच के बाद शुरू करते हैं।'),   /* Version 39.77: no line about Qura here */
    fit: L("Fitted by a trained doctor, nurse or ANM after a check-up.", 'जाँच के बाद प्रशिक्षित डॉक्टर, नर्स या ANM लगाती हैं।'),
    surg: L("An operation by a trained surgeon, with your written consent.", 'प्रशिक्षित सर्जन का ऑपरेशन, आपकी लिखित सहमति से।'),
    screen: L("The first dose is given after a check-up by a trained provider at a health centre.", 'पहली ख़ुराक स्वास्थ्य केंद्र पर प्रशिक्षित स्वास्थ्यकर्मी जाँच के बाद देती हैं।')
  };
  const LAM_Q = [L('My periods have not come back since the birth.', 'जन्म के बाद से मेरे पीरियड नहीं लौटे।'), L('My baby gets only or almost only breast milk, day and night.', 'बच्चे को दिन और रात सिर्फ़ या लगभग सिर्फ़ माँ का दूध मिलता है।'), L('My baby is under 6 months old.', 'मेरा बच्चा 6 महीने से छोटा है।')];
  function methodExtra(k) {
    if (k === 'chhaya') {
      return '<div class="card"><h3>' + esc(t('contra_chh_table')) + '</h3><p class="small">' + esc(t('contra_chh_table_p')) + '</p><dl class="kv">' + [0, 1, 2, 3, 4, 5, 6].map((n) => '<dt>' + esc(wdName(n)) + '</dt><dd>' + esc(wdName(n, 'short') + ' + ' + wdName((n + 3) % 7, 'short') + ' → ' + wdName(n, 'short')) + '</dd>').join('') + '</dl></div>';
    }
    if (k === 'lam') {
      return '<div class="card"><h3>' + esc(t('contra_lam_check')) + '</h3><p class="small">' + esc(t('contra_not_saved')) + '</p><div class="checklist">' + LAM_Q.map((q, i) => '<label class="' + (mem.lam[i] ? 'done' : '') + '"><input type="checkbox" data-lam="' + i + '"' + (mem.lam[i] ? ' checked' : '') + '> ' + E(q) + '</label>').join('') + '</div><div id="lam-out"></div></div>';
    }
    if (k === 'cut') return '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('contra_cut_ec')) + '</p><button type="button" class="btn sm" data-go="contra-ec">' + esc(t('contra_ec')) + '</button></div>';
    return '';
  }
  function lamOut(v) {
    const o = v.querySelector('#lam-out'); if (!o) return;
    const n = mem.lam.filter(Boolean).length;
    o.innerHTML = n === 3 ? '<div class="flag ok">' + esc(t('contra_lam_yes')) + '</div>' : '<div class="flag">' + esc(t('contra_lam_no')) + '</div>';
  }
  function renderMethod(v, k) {
    const m = M[k];
    if (!m) { v.innerHTML = S.backRow(t('contra_hub'), 'contra', false) + '<div class="card"><p>' + esc(t('contra_nf')) + '</p><button type="button" class="btn sm" data-go="contra">' + esc(t('contra_all')) + '</button></div>'; S.wire(v); return; }
    const b = badge(k); const dt = dots(k);
    const related = [];
    if (DAILY.indexOf(k) >= 0 || k === 'chhaya') related.push('<button type="button" class="btn primary" data-go="contra-mine">' + esc(t('contra_set_rem')) + '</button><button type="button" class="btn" data-go="contra-missed">' + esc(t('contra_missed')) + '</button>');
    else if (k === 'antara' || k === 'cut' || k === 'implant' || k === 'ius' || k === 'nsv' || k === 'lam') related.push('<button type="button" class="btn primary block" data-go="contra-mine">' + esc(t('contra_set_rem')) + '</button>');
    else if (k === 'ec') related.push('<button type="button" class="btn primary block" data-go="contra-ec">' + esc(t('contra_ec_window')) + '</button>');
    v.innerHTML = S.backRow(tx(m.name), 'contra', false) + '<p class="small">' + E(m.short) + '</p>' +
      '<div class="card"><div class="eyebrow">' + esc(t('contra_well')) + '</div><div class="contra-rate">' + dt + '<div class="contra-rate-b"><div class="contra-big num">' + esc(b.big) + ' <small>' + esc(b.small) + '</small></div><p class="small" style="color:var(--fg)">' + esc(rateSentence(k)) + '</p></div></div><p class="small">' + esc(k === 'chhaya' ? t('contra_rate_note_in') : t('contra_rate_note')) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('contra_how')) + '</h3><p>' + E(m.how) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('contra_expect')) + '</h3>' + ul(m.expect) + '</div>' +
      methodExtra(k) +
      '<div class="card warn"><h3>' + (m.askT ? E(m.askT) : esc(t('contra_askfirst'))) + '</h3>' + ul(m.ask) + '</div>' +
      '<div class="card"><h3>' + (m.whereT ? E(m.whereT) : esc(t('contra_where'))) + '</h3>' + ul(m.free) + '</div>' +
      '<div class="card"><h3>' + esc(t('contra_startstop')) + '</h3>' + steps(m.start) + '</div>' +
      '<div class="card soft"><h3>' + esc(t('contra_fert')) + '</h3><p>' + E(m.fert) + '</p></div>' +
      (m.rx ? '<div class="card soft"><h3>' + esc(t('contra_rx_h')) + '</h3><p class="small" style="color:var(--fg)">' + E(RX[m.rx]) + '</p></div>' : '') +
      (related.length ? (related[0].indexOf('block') >= 0 ? related[0] : '<div class="grid2">' + related[0] + '</div>') : '') +
      (k === 'ec' || (S.quraOk && !S.quraOk()) ? '' : '<button type="button" class="btn block" data-ask="' + esc(tx(m.name)) + '">' + esc(t('ask_qura')) + '</button>') + (k !== 'ec' && S.quraOk && !S.quraOk() && S.govCard ? S.govCard() : '') +
      srcList(m.src) + '<p class="footnote">' + esc(t('contra_not_rx')) + '</p>';
    S.wire(v);
    if (k === 'lam') {
      lamOut(v);
      v.querySelectorAll('[data-lam]').forEach((c) => c.addEventListener('change', () => { const i = +c.dataset.lam; mem.lam[i] = c.checked; c.parentElement.classList.toggle('done', c.checked); lamOut(v); }));
    }
  }

  /* ---------- chooser ---------- */
  const Q = [
    { id: 'kids', q: 'contra_q1', opts: [['yes', 'contra_yes'], ['no', 'contra_no'], ['unsure', 'contra_unsure']] },
    { id: 'soon', q: 'contra_q2', opts: [['lt1', 'contra_q2a'], ['1to2', 'contra_q2b'], ['gt2', 'contra_q2c']], when: (a) => a.kids === 'yes' || a.kids === 'unsure' },
    { id: 'bf', q: 'contra_q3', opts: [['lt6w', 'contra_q3a'], ['6wto6m', 'contra_q3b'], ['gt6m', 'contra_q3c'], ['no', 'contra_no']] },
    { id: 'daily', q: 'contra_q4', opts: [['yes', 'contra_q4a'], ['some', 'contra_q4b'], ['no', 'contra_no']] },
    { id: 'horm', q: 'contra_q5', opts: [['avoid', 'contra_q5a'], ['ok', 'contra_q5b']] },
    { id: 'baby', q: 'contra_q6', opts: [['yes', 'contra_yes'], ['no', 'contra_no']] }
  ];
  const BASE = { implant: 3, ius: 3, cut: 3, tubectomy: 3, nsv: 3, antara: 2, pill: 1, pop: 1, chhaya: 1, condom: 0.5, lam: 0, ec: -20 };
  const LONG = ['implant', 'ius', 'cut']; const HORM = ['pill', 'pop', 'antara', 'implant', 'ius']; const PERM = ['tubectomy', 'nsv'];
  const RANK = { bad: 0, warn: 1, ok: 2, info: 3 };
  function chooserDefaults() {
    const a = {}; const sit = S.state.situation || {};
    if (sit.breastfeeding && okDate(sit.deliveredOn)) { const days = S.diffDays(S.fromISO(sit.deliveredOn), S.today()); a.bf = days < 42 ? 'lt6w' : (days < 183 ? '6wto6m' : 'gt6m'); }
    return a;
  }
  function scoreAll(a) {
    const R = {}; KEYS.forEach((k) => { R[k] = { k: k, s: BASE[k], tags: [] }; });
    const add = (ks, d, cls, key) => (Array.isArray(ks) ? ks : [ks]).forEach((k) => { R[k].s += d; if (key && !R[k].tags.some((x) => x.key === key)) R[k].tags.push({ cls: cls, key: key }); });
    const sit = S.state.situation || {}; const age = S.cycle.ageYears();
    if (a.kids === 'no') { add(PERM, 3, 'ok', 'contra_t_complete'); add(LONG, 1, 'ok', 'contra_t_years'); }
    if (a.kids === 'yes') add(PERM, -8, 'bad', 'contra_t_perm_no');
    if (a.kids === 'unsure') add(PERM, -6, 'warn', 'contra_t_perm_unsure');
    if (a.kids === 'yes' || a.kids === 'unsure') {
      if (a.soon === 'lt1') { add('antara', -3, 'warn', 'contra_t_fert'); add(['pill', 'pop', 'chhaya', 'condom'], 1, 'ok', 'contra_t_stop'); add(LONG, 0, 'info', 'contra_t_remove'); }
      if (a.soon === '1to2') { add('antara', -1, 'warn', 'contra_t_fert'); add(LONG, 1, 'ok', 'contra_t_remove'); }
      if (a.soon === 'gt2') { add(LONG, 2, 'ok', 'contra_t_years'); add('antara', 1); }
    }
    if (a.bf === 'lt6w') { add('pill', -6, 'bad', 'contra_t_bf6m'); add('antara', -1, 'warn', 'contra_t_6w'); add(['chhaya', 'pop'], 2, 'ok', 'contra_t_bfok'); add('implant', 1, 'ok', 'contra_t_bfok'); add('cut', 1, 'info', 'contra_t_48h'); add('lam', 4, 'info', 'contra_t_lam3'); add('condom', 0.5); }
    if (a.bf === '6wto6m') { add('pill', -6, 'bad', 'contra_t_bf6m'); add(['chhaya', 'pop'], 2, 'ok', 'contra_t_bfok'); add(['antara', 'implant', 'cut'], 1, 'ok', 'contra_t_bfok'); add('lam', 3, 'warn', 'contra_t_lamend'); add('lam', 0, 'info', 'contra_t_lam3'); }
    if (a.bf === 'gt6m') { add('lam', -8, 'bad', 'contra_t_lamno'); add(['pop', 'chhaya'], 1, 'ok', 'contra_t_bfok'); }
    if (a.bf === 'no') add('lam', -8, 'bad', 'contra_t_lamno');
    if (!a.bf) add('lam', -4, 'info', 'contra_t_lamno');
    if (a.daily === 'yes') add(['pill', 'pop'], 1, 'ok', 'contra_t_dailyok');
    if (a.daily === 'some') { add('pill', -2, 'warn', 'contra_t_daily'); add('pop', -3, 'warn', 'contra_t_window'); add('chhaya', 0.5, 'info', 'contra_t_weekly'); add(LONG, 1, 'ok', 'contra_t_nothing'); add('antara', 1, 'ok', 'contra_t_3m'); }
    if (a.daily === 'no') { add(['pill', 'pop'], -4, 'bad', 'contra_t_daily'); add('chhaya', -1, 'warn', 'contra_t_weekly'); add(LONG, 2, 'ok', 'contra_t_nothing'); add('antara', 1, 'ok', 'contra_t_3m'); }
    if (a.horm === 'avoid') { add(HORM, -4, 'warn', 'contra_t_horm'); add(['cut', 'chhaya'], 2, 'ok', 'contra_t_nohorm'); add(['condom', 'lam'], 1, 'ok', 'contra_t_nohorm'); add(PERM, 0, 'info', 'contra_t_nohorm'); }
    if (a.baby === 'no') { add(PERM, -4, 'bad', 'contra_t_onechild'); add('cut', 0, 'info', 'contra_t_nokids'); }
    if (sit.pcos) add('chhaya', -3, 'warn', 'contra_t_pcos');
    if (age != null && age >= 35) add('pill', 0, 'info', 'contra_t_35');
    add('condom', 0, 'ok', 'contra_t_sti'); add('ius', 0, 'info', 'contra_t_private'); add('implant', 0, 'info', 'contra_t_somestates'); add('nsv', 0, 'info', 'contra_t_partner'); add('antara', 0, 'info', 'contra_t_3m'); add('ec', 0, 'bad', 'contra_t_emerg');
    const order = KEYS.slice();
    return order.map((k) => R[k]).sort((x, y) => (y.s - x.s) || (order.indexOf(x.k) - order.indexOf(y.k))).map((r) => { r.tags.sort((x, y) => RANK[x.cls] - RANK[y.cls]); r.tags = r.tags.slice(0, 4); return r; });
  }
  const TAGCLS = { bad: 'pill accent', warn: 'pill', ok: 'pill ok', info: 'pill muted' };
  function renderChooser(v) {
    if (!mem.ch) mem.ch = chooserDefaults();
    const draw = () => {
      const a = mem.ch; const answered = Object.keys(a).filter((k) => a[k]).length;
      const qs = Q.filter((q) => !q.when || q.when(a)).map((q, i) => '<div class="card contra-q"><div class="eyebrow">' + (i + 1) + '</div><h3>' + esc(t(q.q)) + '</h3><div class="chips">' + q.opts.map((o) => '<button type="button" class="chip' + (a[q.id] === o[0] ? ' on' : '') + '" data-q="' + q.id + '" data-v="' + o[0] + '" aria-pressed="' + (a[q.id] === o[0]) + '">' + esc(t(o[1])) + '</button>').join('') + '</div></div>').join('');
      const res = scoreAll(a);
      v.innerHTML = S.backRow(t('contra_find'), 'contra', false) + '<p class="small">' + esc(t('contra_ch_p')) + '</p>' + qs +
        '<div class="row spread"><h2>' + esc(t('contra_ch_res')) + '</h2>' + (answered ? '<button type="button" class="btn ghost sm" id="ch-reset">' + esc(t('contra_ch_reset')) + '</button>' : '') + '</div>' +
        (answered ? '' : '<p class="small">' + esc(t('contra_ch_none')) + '</p>') +
        '<div class="list">' + res.map((r) => { const b = badge(r.k); return '<button type="button" class="contra-res" data-go="contra-m-' + r.k + '"><span class="ico-sm">' + S.icon(M[r.k].icon) + '</span><span class="rb"><span class="rt">' + E(M[r.k].name) + '</span>' + (r.tags.length ? '<span class="contra-tags">' + r.tags.map((x) => '<span class="' + TAGCLS[x.cls] + '">' + esc(t(x.key)) + '</span>').join('') + '</span>' : '<span class="rs">' + E(M[r.k].short) + '</span>') + '</span><span class="rn"><b class="num">' + esc(b.big) + '</b>' + esc(b.small) + '</span></button>'; }).join('') + '</div>' +
        '<p class="small">' + esc(t('contra_num_note')) + '</p>' +
        '<div class="card warn"><h3>' + esc(t('contra_ch_doc_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(t('contra_ch_doc_p')) + '</p></div>' +
        quraCard(t('contra_find'));
      S.wire(v);
      v.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { const q = b.dataset.q; a[q] = a[q] === b.dataset.v ? '' : b.dataset.v; if (q === 'kids' && a.kids === 'no') a.soon = ''; draw(); }));
      const rs = v.querySelector('#ch-reset'); if (rs) rs.addEventListener('click', () => { mem.ch = {}; renderChooser(v); });
    };
    draw();
  }

  /* ---------- my method ---------- */
  const MINE = ['pill', 'chhaya', 'pop', 'antara', 'cut', 'condom', 'implant', 'ius', 'tubectomy', 'nsv', 'lam'];
  const dateField = (id, label, val, maxToday) => '<div class="stack" style="gap:4px"><label for="' + id + '">' + esc(label) + '</label><div class="row"><input type="date" id="' + id + '" value="' + esc(val || '') + '"' + (maxToday ? ' max="' + iso(S.today()) + '"' : '') + ' style="flex:1;min-width:0"><button type="button" class="btn sm" data-save-date="' + id + '">' + esc(t('save')) + '</button></div></div>';
  function logCard(d) {
    const td = S.today(); const log = d.log || {}; const tdS = iso(td); const cur = log[tdS]; const due = isDue(d, td); const c = counts(d);
    let days = '';
    for (let i = 13; i >= 0; i--) {
      const dt = S.addDays(td, -i); const s = iso(dt); const on = isDue(d, dt); const st = log[s] || '';
      days += '<button type="button" class="contra-day' + (st ? ' ' + st : '') + (i === 0 ? ' today' : '') + (on ? '' : ' off') + '" data-day="' + s + '"' + (on ? '' : ' disabled') + ' aria-label="' + esc(fmtS(dt)) + '"><span class="dw">' + esc(S.fmtD(dt, { weekday: 'narrow' })) + '</span><span class="num">' + dt.getDate() + '</span><span class="mk">' + (st === 't' ? '✓' : (st === 'm' ? '×' : '·')) + '</span></button>';
    }
    return '<div class="card"><div class="row spread"><h3>' + esc(t('contra_today_q')) + '</h3><span class="' + (cur === 't' ? 'pill ok' : (cur === 'm' ? 'pill accent' : 'pill muted')) + '">' + esc(cur === 't' ? t('contra_taken') : (cur === 'm' ? t('contra_missed_b') : (due ? t('contra_not_yet') : t('contra_not_today')))) + '</span></div>' +
      (due ? '<div class="grid2"><button type="button" class="btn primary" data-today="t">' + esc(t('contra_took_today')) + '</button><button type="button" class="btn" data-today="m">' + esc(t('contra_mark_missed')) + '</button></div>' : '') +
      '<p class="small">' + esc(t('contra_log14')) + '</p><div class="contra-days">' + days + '</div>' +
      '<dl class="kv"><dt>' + esc(t('contra_c30_t')) + '</dt><dd>' + c.t + '</dd><dt>' + esc(t('contra_c30_m')) + '</dt><dd>' + c.m + '</dd><dt>' + esc(t('contra_c30_u')) + '</dt><dd>' + c.u + '</dd></dl>' +
      (c.m ? '<button type="button" class="btn sm" data-go="contra-missed">' + esc(t('contra_missed_what')) + '</button>' : '') + '</div>';
  }
  function timeCard(d) {
    return '<div class="stack" style="gap:4px"><label for="cm-time">' + esc(t('contra_time')) + '</label><div class="row"><input type="time" id="cm-time" value="' + esc(ptime(d)) + '" style="flex:1;min-width:0"><button type="button" class="btn sm" id="cm-time-set">' + esc(t('save')) + '</button></div></div>';
  }
  function panel(d) {
    const m = d.method; const td = S.today();
    if (DAILY.indexOf(m) >= 0) return '<div class="card"><h3>' + esc(t('contra_rem_h')) + '</h3>' + timeCard(d) + '</div>' + logCard(d);
    if (m === 'chhaya') {
      const c = chhSched(d);
      return '<div class="card"><h3>' + esc(t('contra_chh_days')) + '</h3>' + dateField('cm-chh', t('contra_chh_first'), d.chhStart, true) +
        (c ? '<dl class="kv"><dt>' + esc(tf('contra_until', { d: fmt(S.addDays(c.p2, -1)) })) + '</dt><dd>' + esc(wdName(c.a) + ' + ' + wdName(c.b)) + '</dd><dt>' + esc(tf('contra_from', { d: fmt(c.p2) })) + '</dt><dd>' + esc(wdName(c.a)) + '</dd></dl>' : '<p class="small">' + esc(t('contra_chh_need')) + '</p>') + timeCard(d) + '</div>' + (c ? logCard(d) : '');
    }
    if (m === 'antara') {
      const a = antaraDates(d); let st = '';
      if (a) {
        if (td < a.early) st = '<div class="flag ok">' + esc(tf('contra_ant_wait', { d: fmt(a.early) })) + '</div>';
        else if (td <= a.due) st = '<div class="flag ok">' + esc(tf('contra_ant_open', { d: fmt(a.due) })) + '</div>';
        else if (td <= a.late) st = '<div class="flag">' + esc(tf('contra_ant_late_ok', { d: fmt(a.late) })) + '</div>';
        else st = '<div class="flag">' + esc(t('contra_ant_late')) + '</div>';
      }
      return '<div class="card"><h3>' + esc(t('contra_ant_h')) + '</h3>' + dateField('cm-inj', t('contra_ant_last'), d.injLast, true) +
        (a ? '<dl class="kv"><dt>' + esc(t('contra_ant_due')) + '</dt><dd>' + esc(fmt(a.due)) + '</dd><dt>' + esc(t('contra_ant_win')) + '</dt><dd>' + esc(fmt(a.early) + ' – ' + fmt(a.late)) + '</dd></dl>' + st : '<p class="small">' + esc(t('contra_ant_need')) + '</p>') + '</div>';
    }
    if (m === 'cut') {
      const c = cutDates(d);
      return '<div class="card"><h3>' + esc(t('contra_cut_h')) + '</h3><label>' + esc(t('contra_cut_type')) + '</label><div class="chips">' + [['380A', 'contra_cut_380'], ['375', 'contra_cut_375'], ['unk', 'contra_unsure']].map((x) => '<button type="button" class="chip' + (d.cutType === x[0] ? ' on' : '') + '" data-cut="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '</div>' +
        dateField('cm-cut', t('contra_cut_date'), d.cutDate, true) +
        (c ? '<dl class="kv"><dt>' + esc(t('contra_cut_visit')) + '</dt><dd>' + esc(fmt(c.visit)) + '</dd><dt>' + esc(t('contra_cut_replace')) + '</dt><dd>' + esc(c.replace ? fmt(c.replace) : t('contra_cut_ask')) + '</dd></dl>' + expiredFlag(d, td) : '') +
        '<div class="checklist"><label class="' + (d.cutMonthly !== false ? 'done' : '') + '"><input type="checkbox" id="cm-cut-month"' + (d.cutMonthly !== false ? ' checked' : '') + '> ' + esc(t('contra_cut_month')) + '</label></div><p class="small">' + esc(t('contra_cut_threads')) + '</p></div>';
    }
    if (m === 'implant' || m === 'ius') return '<div class="card"><h3>' + esc(t('contra_dates')) + '</h3>' + dateField('cm-until', t('contra_dev_until'), d.until, false) + expiredFlag(d, td) + '<p class="small">' + esc(t('contra_dev_note')) + '</p></div>';
    if (m === 'nsv') return '<div class="card"><h3>' + esc(t('contra_dates')) + '</h3>' + dateField('cm-nsv', t('contra_nsv_date'), d.nsvDate, true) + (okDate(d.nsvDate) ? '<dl class="kv"><dt>' + esc(t('contra_nsv_test')) + '</dt><dd>' + esc(fmt(addMonths(S.fromISO(d.nsvDate), 3))) + '</dd></dl>' : '') + '<p class="small">' + esc(t('contra_nsv_note')) + '</p></div>';
    if (m === 'lam') { const b = lamBirth(d); return '<div class="card"><h3>' + esc(t('contra_dates')) + '</h3>' + dateField('cm-lam', t('contra_lam_birth'), b, true) + (b ? '<dl class="kv"><dt>' + esc(t('contra_lam_end')) + '</dt><dd>' + esc(fmt(addMonths(S.fromISO(b), 6))) + '</dd></dl>' + expiredFlag(d, td) : '') + '<p class="small">' + esc(t('contra_lam_note')) + '</p><button type="button" class="btn sm" data-go="contra-m-lam">' + esc(t('contra_lam_check')) + '</button></div>'; }
    if (m === 'condom') return '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('contra_condom_note')) + '</p></div>';
    if (m === 'tubectomy') return '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('contra_tub_note')) + '</p></div>';
    return '';
  }
  function renderMine(v) {
    if (!S.canSave()) {
      v.innerHTML = S.backRow(t('contra_mine'), 'contra', false) + '<p class="small">' + esc(t('contra_mine_p')) + '</p><div class="card"><h3>' + esc(t('contra_mine_can')) + '</h3><ul>' + ['contra_mine_c1', 'contra_mine_c2', 'contra_mine_c3', 'contra_mine_c4'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul></div>' + S.needDiary() +
        '<button type="button" class="btn block" data-go="contra-missed">' + esc(t('contra_missed')) + '</button>';
      S.wire(v); return;
    }
    const d = D();
    const draw = () => {
      const m = M[d.method] ? d.method : ''; const nx = m ? nextDue() : null; const sit = S.state.situation || {};
      v.innerHTML = S.backRow(t('contra_mine'), 'contra', false) + '<p class="small">' + esc(t('contra_mine_p')) + '</p>' +
        (m ? '<div class="card soft" style="gap:6px"><div class="eyebrow">' + esc(t('contra_my')) + '</div><h2>' + esc(nm(m)) + '</h2>' + (expiredOn(d, S.today()) ? expiredFlag(d, S.today()) : '<p class="small">' + (nx ? esc(t('contra_next')) + ': ' + esc(fmtS(nx.d)) + (nx.r.time ? ' · ' + esc(nx.r.time) : '') + ' · ' + esc(S.reminders.text(nx.r)) : esc(t('contra_no_next'))) + '</p>') + '<div class="row wrap"><button type="button" class="btn sm" data-go="contra-m-' + m + '">' + esc(t('contra_about')) + '</button><button type="button" class="btn sm ghost" data-go="tools-reminders">' + esc(t('contra_all_rem')) + '</button></div></div>' : '') +
        '<div class="card"><h3>' + esc(t('contra_pick')) + '</h3><div class="chips">' + MINE.map((k) => '<button type="button" class="chip' + (m === k ? ' on' : '') + '" data-pick="' + k + '">' + esc(nm(k)) + '</button>').join('') + '<button type="button" class="chip' + (!m ? ' on' : '') + '" data-pick="">' + esc(t('contra_none_now')) + '</button></div>' +
        (m ? dateField('cm-since', t('contra_since'), d.since, true) + '<div class="checklist"><label class="' + (d.remOn !== false ? 'done' : '') + '"><input type="checkbox" id="cm-rem"' + (d.remOn !== false ? ' checked' : '') + '> ' + esc(t('contra_rem_on')) + '</label></div>' : '<p class="small">' + esc(t('contra_pick_p')) + '</p>') + '</div>' +
        (m ? panel(d) : '') +
        (m && HORM.indexOf(m) >= 0 && !sit.hormones ? '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('contra_horm_note')) + '</p><button type="button" class="btn sm" data-go="me-health">' + esc(t('contra_open_me')) + '</button></div>' : '') +
        '<p class="footnote">' + esc(t('contra_mine_foot')) + '</p>';
      S.wire(v);
      const resync = (msg) => { sync(d); S.save(); if (msg) S.toast(msg); draw(); };
      /* Version 32 (field-test audit 3.2): a hormonal method sets those cycles aside by itself, and stopping one makes Home wait
         for her next period, instead of counting pill bleeds as her own cycles or calling her late the day she stops */
      v.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.pick; if (k === d.method) return; const was = d.method; d.method = k; d.since = k ? iso(S.today()) : ''; if (k && d.remOn == null) d.remOn = true;
        if (S.cycle.setHormones) { if (HORM.indexOf(k) >= 0) S.cycle.setHormones(true); else if (HORM.indexOf(was) >= 0) S.cycle.setHormones(false); }
        resync(k ? t('contra_saved') : t('contra_rem_removed')); }));
      const rem = v.querySelector('#cm-rem'); if (rem) rem.addEventListener('change', () => { d.remOn = rem.checked; resync(rem.checked ? t('contra_rem_set') : t('contra_rem_removed')); });
      const cm = v.querySelector('#cm-cut-month'); if (cm) cm.addEventListener('change', () => { d.cutMonthly = cm.checked; resync(t('contra_saved')); });
      v.querySelectorAll('[data-cut]').forEach((b) => b.addEventListener('click', () => { d.cutType = b.dataset.cut; resync(t('contra_saved')); }));
      const ts = v.querySelector('#cm-time-set'); if (ts) ts.addEventListener('click', () => { const val = (v.querySelector('#cm-time') || {}).value; if (/^\d{2}:\d{2}$/.test(val || '')) { d.pillTime = val; PILL_IDS.forEach((id) => { const r = S.reminders.get(id); if (r) r.time = val; }); } resync(t('contra_rem_set')); });
      const FIELD = { 'cm-since': 'since', 'cm-chh': 'chhStart', 'cm-inj': 'injLast', 'cm-cut': 'cutDate', 'cm-until': 'until', 'cm-nsv': 'nsvDate', 'cm-lam': 'lamBirth' };
      v.querySelectorAll('[data-save-date]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.saveDate; const inp = v.querySelector('#' + id); const val = inp ? inp.value : ''; if (!okDate(val)) { S.toast(t('contra_pick_date')); return; } d[FIELD[id]] = val; resync(t('contra_saved')); }));
      v.querySelectorAll('[data-today]').forEach((b) => b.addEventListener('click', () => { markToday(d, b.dataset.today); S.save(); S.toast(b.dataset.today === 't' ? t('contra_marked') : t('contra_marked_m')); draw(); }));
      v.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; const s = b.dataset.day; d.log = d.log || {}; const cur = d.log[s] || ''; const nx2 = cur === '' ? 't' : (cur === 't' ? 'm' : ''); if (s === iso(S.today())) markToday(d, nx2); else if (nx2) d.log[s] = nx2; else delete d.log[s]; S.save(); draw(); }));
    };
    draw();
  }

  /* ---------- missed pills ---------- */
  const MS = {
    p12: { s: [L('Take one hormone pill now, as soon as you remember. Taking 2 pills on the same day is fine.', 'याद आते ही अभी एक हॉर्मोन वाली गोली लें। एक दिन में 2 गोलियाँ लेना ठीक है।'), L('Carry on with one pill a day as usual.', 'फिर रोज़ की तरह एक गोली लेती रहें।'), L('There is little or no risk of pregnancy. You do not need anything else.', 'गर्भ का ख़तरा बहुत कम या न के बराबर है। और कुछ करने की ज़रूरत नहीं।')], ec: false },
    p3w12: { s: [L('Take one hormone pill now.', 'अभी एक हॉर्मोन वाली गोली लें।'), L('Carry on with one pill a day as usual.', 'फिर रोज़ की तरह एक गोली लेती रहें।'), L('Use condoms, or avoid sex, for the next 7 days.', 'अगले 7 दिन कंडोम इस्तेमाल करें, या संबंध न बनाएँ।')], ec: true },
    p3w3: { s: [L('Take one hormone pill now.', 'अभी एक हॉर्मोन वाली गोली लें।'), L('Finish the hormone pills in this strip. Throw away the 7 iron pills.', 'इस पत्ते की हॉर्मोन वाली गोलियाँ पूरी करें। 7 आयरन वाली गोलियाँ फेंक दें।'), L('Start a new strip the very next day, with no break.', 'अगले ही दिन नया पत्ता शुरू करें, बिना छुट्टी के।'), L('Use condoms, or avoid sex, for the next 7 days.', 'अगले 7 दिन कंडोम इस्तेमाल करें, या संबंध न बनाएँ।')], ec: true },
    iron: { s: [L('Throw away the missed iron pill or pills.', 'छूटी हुई आयरन की गोली या गोलियाँ फेंक दें।'), L('Carry on with one pill a day, and start the next strip as usual.', 'रोज़ एक गोली लेती रहें, और अगला पत्ता हमेशा की तरह शुरू करें।')], ec: false },
    pop: { s: [L('Take one pill now, as soon as you remember. Taking 2 on the same day is fine.', 'याद आते ही अभी एक गोली लें। एक दिन में 2 लेना ठीक है।'), L('Carry on with one pill a day at your usual time.', 'फिर रोज़ अपने समय पर एक गोली लेती रहें।'), L('If your periods have come back: use condoms for the next 2 days.', 'अगर पीरियड लौट आए हैं: अगले 2 दिन कंडोम इस्तेमाल करें।'), LD('Breastfeeding with no period yet? Your risk depends on that. Ask your ANM whether you need condoms too.', 'दूध पिला रही हैं और पीरियड नहीं लौटे? ख़तरा इसी पर निर्भर है। ANM से पूछें कि कंडोम भी चाहिए या नहीं।', 'Breastfeeding with no period yet? Your risk depends on that. Ask your doctor whether you need condoms too.', 'दूध पिला रही हैं और पीरियड नहीं लौटे? ख़तरा इसी पर निर्भर है। डॉक्टर से पूछें कि कंडोम भी चाहिए या नहीं।')], ec: true },
    chlt7: { s: [L('Take the missed pill now.', 'छूटी हुई गोली अभी लें।'), L('Carry on with your usual days.', 'फिर अपने तय दिनों पर लेती रहें।'), L('Use condoms until your next period starts.', 'अगला पीरियड शुरू होने तक कंडोम इस्तेमाल करें।')], ec: false },
    chgt7: { s: [L('You need to start again like a new user: twice a week for 3 months, then once a week.', 'आपको नए सिरे से शुरू करना होगा: 3 महीने हफ़्ते में दो बार, फिर हफ़्ते में एक बार।'), LD('Ask your ANM or ASHA which day to restart, and use condoms until you are back on schedule.', 'ANM या ASHA से पूछें कि किस दिन से फिर शुरू करें, और तब तक कंडोम इस्तेमाल करें।', 'Ask your doctor which day to restart, and use condoms until you are back on schedule.', 'डॉक्टर से पूछें कि किस दिन से फिर शुरू करें, और तब तक कंडोम इस्तेमाल करें।')], ec: true },
    ale4: { s: [LD('You can still have your injection. Go to the health centre as soon as you can.', 'इंजेक्शन अब भी लग सकता है। जितनी जल्दी हो सके स्वास्थ्य केंद्र जाएँ।', 'You can still have your injection. See your doctor or the health centre as soon as you can.', 'इंजेक्शन अब भी लग सकता है। जितनी जल्दी हो सके अपनी डॉक्टर या स्वास्थ्य केंद्र जाएँ।'), LD('Take your MPA card with you.', 'अपना MPA card साथ ले जाएँ।', 'Take your injection record with you.', 'इंजेक्शन का रिकॉर्ड साथ ले जाएँ।'), L('Up to 4 weeks late, no extra tests or condoms are needed.', '4 हफ़्ते तक की देरी में कोई extra जाँच या कंडोम ज़रूरी नहीं।')], ec: false },
    agt4: { s: [L('Use condoms from now until you get your injection.', 'इंजेक्शन लगने तक अभी से कंडोम इस्तेमाल करें।'), LD('Go to the health centre now. They will check whether you could be pregnant and restart you.', 'अभी स्वास्थ्य केंद्र जाएँ। वे देखेंगे कि गर्भ तो नहीं, और फिर से शुरू करेंगे।', 'See your doctor or the health centre now. They will check whether you could be pregnant and restart you.', 'अभी अपनी डॉक्टर या स्वास्थ्य केंद्र जाएँ। वे देखेंगे कि गर्भ तो नहीं, और फिर से शुरू करेंगे।')], ec: true }
  };
  function renderMissed(v) {
    const ms = mem.ms; if (!ms.which) { const dm = S.canSave() ? D().method : ''; ms.which = ['pop', 'chhaya', 'antara'].indexOf(dm) >= 0 ? dm : 'pill'; }
    const chips = (key, opts) => '<div class="chips">' + opts.map((o) => '<button type="button" class="chip' + (ms[key] === o[0] ? ' on' : '') + '" data-ms="' + key + '" data-v="' + o[0] + '">' + esc(t(o[1])) + '</button>').join('') + '</div>';
    const draw = () => {
      let sub = ''; let out = null;
      if (ms.which === 'pill') {
        sub = '<label>' + esc(t('contra_ms_what')) + '</label>' + chips('a', [['12', 'contra_ms_p12'], ['3', 'contra_ms_p3'], ['iron', 'contra_ms_iron']]);
        if (ms.a === '3') sub += '<label>' + esc(t('contra_ms_week')) + '</label>' + chips('b', [['12', 'contra_ms_w12'], ['3', 'contra_ms_w3']]);
        out = ms.a === '12' ? 'p12' : (ms.a === 'iron' ? 'iron' : (ms.a === '3' && ms.b ? (ms.b === '3' ? 'p3w3' : 'p3w12') : null));
      } else if (ms.which === 'pop') { sub = '<p class="small">' + esc(t('contra_ms_pop_p')) + '</p>'; out = 'pop'; }
      else if (ms.which === 'chhaya') { sub = '<label>' + esc(t('contra_ms_what')) + '</label>' + chips('a', [['lt7', 'contra_ms_c1'], ['gt7', 'contra_ms_c2']]); out = ms.a === 'lt7' ? 'chlt7' : (ms.a === 'gt7' ? 'chgt7' : null); }
      else { sub = '<label>' + esc(t('contra_ms_what')) + '</label>' + chips('a', [['le4', 'contra_ms_a1'], ['gt4', 'contra_ms_a2']]); out = ms.a === 'le4' ? 'ale4' : (ms.a === 'gt4' ? 'agt4' : null); }
      const o = out ? MS[out] : null;
      v.innerHTML = S.backRow(t('contra_missed'), 'contra', false) + '<p class="small">' + esc(t('contra_ms_p')) + '</p>' +
        '<div class="card"><label>' + esc(t('contra_ms_which')) + '</label>' + '<div class="chips">' + [['pill', 'contra_ms_pill'], ['pop', 'contra_ms_pop'], ['chhaya', 'contra_ms_chh'], ['antara', 'contra_ms_ant']].map((x) => '<button type="button" class="chip' + (ms.which === x[0] ? ' on' : '') + '" data-which="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '</div>' + sub + '</div>' +
        (o ? '<div class="card" id="ms-out"><h3>' + esc(t('contra_ms_do')) + '</h3>' + steps(o.s) + (o.ec ? '<div class="flag">' + esc(t(ms.which === 'pill' || ms.which === 'pop' ? 'contra_ms_ec' : 'contra_ms_ec2')) + '</div><button type="button" class="btn primary block" data-go="contra-ec">' + esc(t('contra_ec')) + '</button>' : '') + '</div>' : '<div class="card soft"><p class="small">' + esc(t('contra_ms_pick')) + '</p></div>') +
        '<div class="card ok"><h3 style="color:var(--ok)">' + esc(t('contra_ms_unsure_h')) + '</h3><p>' + esc(t(ms.which === 'antara' ? 'contra_ms_unsure_ant' : 'contra_ms_unsure')) + '</p></div>' +
        (ms.which === 'antara' ? '' : '<details><summary>' + esc(t('contra_ms_vomit_h')) + '</summary><p class="small" style="margin-top:6px">' + esc(t('contra_ms_vomit')) + '</p></details>') +
        '<div class="grid2"><button type="button" class="btn" data-go="contra-mine">' + esc(t('contra_set_rem')) + '</button><button type="button" class="btn" data-go="contra-m-' + ms.which + '">' + esc(t('contra_about')) + '</button></div>' +
        srcList(['who', 'ocp', 'dmpa']);
      S.wire(v);
      v.querySelectorAll('[data-which]').forEach((b) => b.addEventListener('click', () => { if (ms.which === b.dataset.which) return; ms.which = b.dataset.which; ms.a = ''; ms.b = ''; draw(); }));
      v.querySelectorAll('[data-ms]').forEach((b) => b.addEventListener('click', () => { ms[b.dataset.ms] = b.dataset.v; if (b.dataset.ms === 'a') ms.b = ''; draw(); const oc = v.querySelector('#ms-out'); if (oc && oc.scrollIntoView) oc.scrollIntoView({ block: 'nearest' }); }));
    };
    draw();
  }

  /* ---------- emergency contraception ---------- */
  function renderEc(v) {
    /* Default to today at the last full hour, so the screen never opens on a time in the future. */
    const e = mem.ec; if (!e.d) e.d = iso(S.today()); if (!e.tm) e.tm = S.pad2(new Date().getHours()) + ':00';
    v.innerHTML = S.backRow(t('contra_ec'), 'contra', false) + '<p class="small">' + esc(t('contra_ec_p')) + '</p>' +
      '<div class="card"><h3>' + esc(t('contra_ec_when')) + '</h3><div class="stack" style="gap:4px"><label for="ec-d">' + esc(t('contra_ec_date')) + '</label><input type="date" id="ec-d" value="' + esc(e.d) + '" max="' + iso(S.today()) + '"></div><div class="stack" style="gap:4px"><label for="ec-t">' + esc(t('contra_ec_time')) + '</label><input type="time" id="ec-t" value="' + esc(e.tm) + '"></div><button type="button" class="btn primary block" id="ec-go">' + esc(t('contra_ec_calc')) + '</button><div id="ec-out" aria-live="polite"></div></div>' +
      '<div class="card"><h3>' + esc(t('contra_ec_where')) + '</h3><ul><li>' + esc(t('contra_ec_w1')) + '</li><li>' + esc(t('contra_ec_w2')) + '</li><li>' + esc(t('contra_ec_w3')) + '</li></ul></div>' +
      '<div class="card"><h3>' + esc(t('contra_ec_know')) + '</h3><ul>' + ['contra_ec_k1', 'contra_ec_k2', 'contra_ec_k3', 'contra_ec_k4', 'contra_ec_k5'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul></div>' +
      '<div class="flag">' + esc(t('contra_ec_flag')) + '</div><button type="button" class="btn block" data-go="pregtest-when">' + esc(t('contra_ec_test')) + '</button>' +
      /* Version 39.70: no "If the sex was forced" (the doctors' answer 3: no violence help in Sakhi) */
      '<button type="button" class="action" data-go="contra-m-ec"><span class="ico">' + I.pill + '</span><span class="body"><strong>' + esc(nm('ec')) + '</strong><span class="small">' + esc(t('contra_ec_more')) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' +
      srcList(['who', 'ocp', 'whoec']) + '<p class="footnote">' + esc(t('contra_not_saved')) + '</p>';
    S.wire(v);
    const out = () => {
      const o = v.querySelector('#ec-out'); if (!o) return;
      if (!okDate(e.d)) { o.innerHTML = '<p class="small">' + esc(t('contra_pick_date')) + '</p>'; return; }
      const p = e.d.split('-').map(Number); const tm = (/^\d{2}:\d{2}$/.test(e.tm) ? e.tm : '22:00').split(':').map(Number);
      const when = new Date(p[0], p[1] - 1, p[2], tm[0], tm[1]); const hrs = (Date.now() - when.getTime()) / 3600000;
      if (hrs < -0.5) { o.innerHTML = '<div class="flag">' + esc(t('contra_ec_future')) + '</div>'; return; }
      const h = Math.max(0, Math.round(hrs));
      const hl = (n, k0, k1, kn) => (n < 1 ? t(k0) : (n === 1 ? t(k1) : tf(kn, { h: n })));
      let body = '';
      if (hrs <= 72) body = '<div class="flag ok"><div><strong>' + esc(t('contra_ec_in72_h')) + '</strong><br>' + esc(hl(Math.max(0, Math.floor(72 - hrs)), 'contra_ec_left0', 'contra_ec_left1', 'contra_ec_left')) + ' ' + esc(t('contra_ec_in72')) + '</div></div>';
      else if (hrs <= 120) body = '<div class="flag"><div><strong>' + esc(t('contra_ec_mid_h')) + '</strong><br>' + esc(t('contra_ec_mid')) + '</div></div>';
      else body = '<div class="flag"><div><strong>' + esc(t('contra_ec_late_h')) + '</strong><br>' + esc(t('contra_ec_late')) + '</div></div>';
      o.innerHTML = '<div class="stack" style="gap:8px;margin-top:4px"><div class="contra-hours num">' + esc(hl(h, 'contra_ec_hours0', 'contra_ec_hours1', 'contra_ec_hours')) + '</div>' + body + '</div>';
    };
    const di = v.querySelector('#ec-d'), ti = v.querySelector('#ec-t');
    di.addEventListener('change', () => { e.d = di.value; if (e.done) out(); }); ti.addEventListener('change', () => { e.tm = ti.value; if (e.done) out(); }); ti.addEventListener('input', () => { e.tm = ti.value; });
    v.querySelector('#ec-go').addEventListener('click', () => { e.d = di.value; e.tm = ti.value || e.tm; e.done = true; out(); });
    if (e.done) out();
  }

  /* ---------- where it is free ---------- */
  function renderFree(v) {
    const place = (ico, h, p) => '<div class="card" style="gap:6px"><div class="row" style="align-items:flex-start"><span class="ico-sm">' + I[ico] + '</span><div class="stack" style="gap:2px;min-width:0"><h3>' + esc(t(h)) + '</h3><p class="small" style="color:var(--fg)">' + esc(t(p)) + '</p></div></div></div>';
    v.innerHTML = S.backRow(t('contra_free'), 'contra', false) + '<p class="small">' + esc(t('contra_free_p')) + '</p>' +
      place('person', 'contra_fr_asha_h', 'contra_fr_asha') + place('home', 'contra_fr_sc_h', 'contra_fr_sc') + place('care', 'contra_fr_phc_h', 'contra_fr_phc') + place('map', 'contra_fr_chc_h', 'contra_fr_chc') +
      '<div class="card"><h3>' + esc(t('contra_fr_money_h')) + '</h3><ul><li>' + esc(t('contra_fr_m1')) + '</li><li>' + esc(t('contra_fr_m2')) + '</li><li>' + esc(t('contra_fr_m3')) + '</li></ul></div>' +
      '<div class="card soft"><h3>' + esc(t('contra_fr_say_h')) + '</h3><ul>' + ['contra_fr_s1', 'contra_fr_s2', 'contra_fr_s3', 'contra_fr_s4'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul></div>' +
      '<div class="card warn"><h3>' + esc(t('contra_fr_paid_h')) + '</h3><p class="small" style="color:var(--fg)">' + esc(t('contra_fr_paid')) + '</p></div>' +
      '<div class="helpline"><div><div class="n num">104</div><div class="what">' + esc(t('contra_fr_104')) + '</div></div><button type="button" class="btn sm" data-copy="104">' + esc(t('copy')) + '</button></div>' +
      '<button type="button" class="btn block" data-go="contra">' + esc(t('contra_all')) + '</button>' + srcList(['cho', 'ocp']);
    S.wire(v);
    v.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => { const n = b.dataset.copy; const done = () => S.toast(t('copied') + ' ' + n); try { navigator.clipboard.writeText(n).then(done, () => S.toast(n)); } catch (er) { S.toast(n); } }));
  }

  /* ---------- hooks ---------- */
  /* Version 39.72 (the doctors' answer 12): for 30 days after she stops trying for a baby, one card for her method and its reminder,
     until she adds one or says Not now (not in discreet mode) */
  const stopAsk = (d) => { const s0 = S.state.situation || {}; const at = s0.ttcStop; return S.stageNow() === 'cycle' && !S.flags.discreet && !M[d.method] && typeof at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(at) && S.diffDays(S.fromISO(at), S.today()) <= 30 && d.stopNot !== at; };
  function home() {
    if (!S.canSave()) return ''; const d = D();
    if (stopAsk(d)) return '<div class="card soft ct-stop" data-nofold="1"><h3>' + esc(t('contra_setup_add')) + '</h3><p class="small">' + esc(t('contra_mine_s')) + '</p><div class="row wrap"><button type="button" class="btn sm primary" data-go="contra-mine">' + esc(t('contra_mine')) + '</button><button type="button" class="btn sm" data-go="contra-chooser">' + esc(t('contra_find')) + '</button><button type="button" class="btn sm" id="ct-stop-not">' + esc(t('nq_later')) + '</button></div></div>';
    if (!M[d.method]) return ''; const td = S.today();
    /* Review fix: a method that may no longer protect her is urgent (core lifts data-xp-urgent cards first, so a plan card can't push it out) */
    const card = (body, urgent) => '<div class="card" style="gap:8px"' + (urgent ? ' data-xp-urgent="1"' : '') + '><div class="row spread"><h3>' + esc(nm(d.method)) + '</h3><button type="button" class="btn sm" data-go="contra-mine">' + esc(t('contra_my')) + '</button></div>' + body + '</div>';
    if (expiredOn(d, td)) return card(expiredFlag(d, td), true);
    if (d.method === 'antara') { const a = antaraDates(d); if (a && td > a.due) return card('<div class="flag">' + esc(td <= a.late ? tf('contra_ant_late_ok', { d: fmt(a.late) }) : t('contra_ant_late')) + '</div>', td > a.late); }
    return '';   /* today's pill is a row in Home's Today (today(), below) */
  }
  /* Home's Today (Version 30): today's pill or Chhaya day, until she ticks it. Not in discreet mode, as before. */
  function today() {
    if (!S.canSave() || S.flags.discreet) return null; const d = D(); if (!M[d.method] || !tracks(d)) return null; const td = S.today();
    if (expiredOn(d, td) || !isDue(d, td) || (d.log || {})[iso(td)]) return null;
    return { id: 'contra', order: 12, icon: 'pill', hue: 'teal', title: t('contra_today_q'), sub: nm(d.method) + ' · ' + ptime(d), go: 'contra-mine', rem: PILL_IDS,
      actLabel: t('contra_took_short'), act: () => { markToday(D(), 't'); S.save(); }, done: t('contra_marked') };
  }
  /* Home's setup card: a method for after a birth. Version 39.72 (the doctors' answer 12): not at joining for "avoiding pregnancy",
     nor her method's reminder (it is on when she sets her method up); when she stops trying, home() asks */
  const HAS_REM = ['pill', 'pop', 'chhaya', 'antara', 'cut', 'implant', 'ius', 'nsv', 'lam'];
  function setup() {
    if (!S.canSave()) return null; const k = S.stageNow(); const d = D(); const on = !!M[d.method];
    if (k === 'post') return { id: 'contra', order: 35, title: t('contra_setup_post'), sub: S.routeOwner('post-contra') ? t('post_t_contra_s') : t('contra_hub_s'), go: S.routeOwner('post-contra') ? 'post-contra' : 'contra', done: on };
    return null;
  }
  function afterHome(v) { const b = v.querySelector('#ct-stop-not'); if (b) b.addEventListener('click', () => { D().stopNot = (S.state.situation || {}).ttcStop; S.save(); S.render(); }); }
  function summary() {
    const d = D(); if (!M[d.method]) return [];
    const lines = [nm(d.method) + (okDate(d.since) ? ' · ' + t('contra_since') + ' ' + fmt(S.fromISO(d.since)) : '')];
    if (tracks(d)) { const c = counts(d); lines.push(tf('contra_sum_pills', { m: c.m, t: c.t, u: c.u })); }
    if (d.method === 'chhaya') { const c = chhSched(d); if (c) lines.push(t('contra_chh_first') + ': ' + fmt(c.st)); }
    if (d.method === 'antara') { const a = antaraDates(d); if (a) lines.push(t('contra_ant_last') + ': ' + fmt(a.last) + ' · ' + t('contra_ant_due') + ': ' + fmt(a.due)); }
    if (d.method === 'cut') { const c = cutDates(d); if (c) lines.push((d.cutType && d.cutType !== 'unk' ? 'Cu ' + d.cutType + ' · ' : '') + t('contra_cut_date') + ': ' + fmt(c.fit) + (c.replace ? ' · ' + t('contra_cut_replace') + ': ' + fmt(c.replace) : '')); }
    if ((d.method === 'implant' || d.method === 'ius') && okDate(d.until)) lines.push(t('contra_dev_until') + ': ' + fmt(S.fromISO(d.until)));
    if (d.method === 'nsv' && okDate(d.nsvDate)) lines.push(t('contra_nsv_test') + ': ' + fmt(addMonths(S.fromISO(d.nsvDate), 3)));
    const dr = lines.slice();   /* the doctor's summary (Version 33): her method and what she missed, not her next reminder */
    const nx = nextDue(); if (nx) lines.push(t('contra_next') + ': ' + fmtS(nx.d) + ' · ' + S.reminders.text(nx.r));
    return [{ title: t('contra_hub'), lines: lines, doctorLines: dr }];
  }
  function sample(id) {
    if (id !== 'asha') return;
    const d = D(); const td = S.today();
    d.method = 'pill'; d.since = iso(S.addDays(td, -150)); d.pillTime = '21:00'; d.remOn = true; d.log = {};
    for (let i = 1; i <= 8; i++) d.log[iso(S.addDays(td, -i))] = i === 4 ? 'm' : 't';
    sync(d);
  }

  /* ---------- strings ---------- */
  const en = {
    contra_took_short: 'I took it', contra_setup_add: 'Add the method you use', contra_setup_rem: 'Turn on your method’s reminder', contra_setup_post: 'Choose a method for after the birth',
    contra_hub: 'Contraception', contra_hub_s: 'Find a method, reminders, missed pills, emergency pill', contra_hub_p: 'Most methods here are free at government centres. You choose what suits you; a doctor, nurse or ANM checks that it is safe for you.', contra_hub_p_doc: 'You choose what suits you; your doctor checks that it is safe for you. Most methods here are also free at government centres.',
    contra_find: 'Find a method that fits', contra_find_s: '6 short questions. Every method stays on the list.', contra_mine: 'My method and reminders', contra_mine_s: 'Pill time, Chhaya days, next injection, Copper-T dates',
    contra_missed: 'Missed or late pill', contra_missed_s: 'What to do for Mala-N, POP, Chhaya or a late Antara', contra_ec: 'Emergency contraception', contra_ec_s: 'Unprotected sex or a condom broke: what to do, and by when',
    contra_free: 'Where it is free', contra_free_s: 'ASHA, sub-centre, PHC, CHC, district hospital', contra_all: 'All methods', contra_my: 'My method',
    contra_g_long: 'Lasts months or years', contra_g_pill: 'Pills', contra_g_each: 'Each time you have sex', contra_g_perm: 'Permanent', contra_g_after: 'After a baby', contra_g_emerg: 'Emergency only',
    contra_wf_h: 'Worries and facts', contra_wf_myth: 'Myth', contra_wf_fact: 'Fact', contra_wf_more: 'Read about this method',
    contra_safe_days: 'Counting "safe days" is not a reliable way to avoid pregnancy, so this app never calls any day safe. Its fertile-day estimates are for planning a pregnancy.', contra_num_note: 'The number is how many women in 100 get pregnant in a year of typical use (WHO).',
    contra_in100: 'in 100', contra_hours: 'hours', contra_qura_h: 'Not sure which method suits you?', contra_qura_p: "A Qura doctor (BAMS) can talk it through with you on a free call and refer you. Hormonal methods are started by an MBBS doctor or gynaecologist.",
    contra_rate_typ: 'Out of 100 women using it for a year, about {n} get pregnant with typical use.', contra_rate_k: 'Fewer than 1 in 100. Out of 1,000 women using it for a year, about {k} get pregnant.',
    contra_rate_note: 'Typical use means real life, including late or missed doses. Figures from the WHO Family Planning Handbook (2022).', contra_rate_note_in: 'Figure from the Government of India pill manual (2016).',
    contra_well: 'How well it works', contra_how: 'How it works', contra_expect: 'What to expect', contra_askfirst: 'Ask a doctor first if', contra_where: 'Where to get it free', contra_startstop: 'Starting and stopping',
    contra_fert: 'When you can get pregnant again', contra_rx_h: 'Who starts it', contra_sources: 'Sources', contra_not_rx: 'General information, not a prescription. Your doctor decides what is safe for you.',
    contra_set_rem: 'Set a reminder', contra_about: 'About this method', contra_nf: 'We could not find that method.', contra_ec_window: 'Work out your time window',
    contra_chh_table: 'Your Chhaya days', contra_chh_table_p: 'Your first pill day decides your days. First 3 months, then from the 4th month.', contra_cut_ec: 'Fitted within 5 days of unprotected sex, a Copper-T is also the most effective emergency contraception.',
    contra_lam_check: 'Check the 3 conditions', contra_lam_yes: 'All 3 hold today, so LAM can protect you. The day any one changes, start another method.', contra_lam_no: 'Not all 3 hold, so LAM does not protect you now. Use another method from today.', contra_not_saved: 'Nothing you tick or type here is saved.',
    contra_q1: 'Do you want a baby (or another baby) some day?', contra_q2: 'How soon?', contra_q2a: 'Within a year', contra_q2b: 'In 1–2 years', contra_q2c: 'More than 2 years away',
    contra_q3: 'Are you breastfeeding now?', contra_q3a: 'Yes, baby under 6 weeks', contra_q3b: 'Yes, baby 6 weeks to 6 months', contra_q3c: 'Yes, baby over 6 months',
    contra_q4: 'Could you remember a pill every day?', contra_q4a: 'Yes, easily', contra_q4b: 'I sometimes forget', contra_q5: 'Would you rather avoid hormones?', contra_q5a: 'Yes, no hormones', contra_q5b: "Doesn't matter", contra_q6: 'Have you had a baby before?',
    contra_yes: 'Yes', contra_no: 'No', contra_unsure: 'Not sure',
    contra_ch_p: 'Answer what you like. The list re-sorts as you answer, and no method is ever hidden. Your answers are not saved.', contra_ch_res: 'Methods, best fit first', contra_ch_none: 'Answer a question to sort the list.', contra_ch_reset: 'Clear answers',
    contra_ch_doc_h: 'A doctor checks if a method is safe for you', contra_ch_doc_p: 'For example, the combined pill is not given if you get migraine with aura, if your BP is 140/90 or higher, if you are 35 or older and smoke, or while you breastfeed a baby under 6 months. This list is not a prescription.',
    contra_t_complete: 'Fits a complete family', contra_t_perm_no: 'Permanent: not if you want a baby later', contra_t_perm_unsure: 'Permanent: only when you are sure', contra_t_fert: 'Fertility returns slowly (7–10 months)', contra_t_stop: 'Stop any time',
    contra_t_remove: 'Removed any time, no delay', contra_t_years: 'Works for years', contra_t_bf6m: 'Not while breastfeeding under 6 months', contra_t_6w: 'Starts 6 weeks after birth', contra_t_bfok: 'Safe while breastfeeding', contra_t_48h: 'Can go in within 48 hours of delivery',
    contra_t_lam3: 'Only if all 3 conditions hold', contra_t_lamend: 'Stops working at 6 months', contra_t_lamno: 'Only while breastfeeding a baby under 6 months', contra_t_dailyok: 'You can manage a daily pill', contra_t_daily: 'Needs a pill every day', contra_t_window: 'Same time daily, within 3 hours',
    contra_t_weekly: 'Weekly after the first 3 months', contra_t_nothing: 'Nothing to remember daily', contra_t_3m: 'Once every 3 months', contra_t_horm: 'Has hormones', contra_t_nohorm: 'No hormones', contra_t_onechild: 'Govt rule: needs a child over 1 year',
    contra_t_nokids: 'Fine before a first baby too', contra_t_sti: 'Also protects against STIs and HIV', contra_t_private: 'Mostly at private clinics', contra_t_somestates: 'Free in a few districts', contra_t_partner: 'For your husband', contra_t_emerg: 'Emergency only, not regular use',
    contra_t_pcos: 'PMOS: not given in Indian guidance', contra_t_35: '35+: tell the doctor if you smoke',
    contra_mine_p: 'Pick the method you use now. Reminders show on the Today page and in your reminders list. Everything stays on this phone.', contra_mine_can: 'With a diary, this page can', contra_mine_c1: 'Remind you to take your daily pill, and keep a "taken" tick for each day', contra_mine_c2: 'Turn your Chhaya start date into the right days: twice a week, then weekly after 3 months',
    contra_mine_c3: 'Work out your next Antara date and the allowed window', contra_mine_c4: 'Remember your Copper-T check-up and replacement year', contra_pick: 'The method I use now', contra_pick_p: 'Pick a method to set reminders.', contra_none_now: 'None right now', contra_since: 'Started on',
    contra_next: 'Next', contra_no_next: 'No reminder set', contra_all_rem: 'All reminders', contra_rem_on: 'Reminders for this method', contra_rem_h: 'Daily reminder', contra_time: 'Pill time', contra_rem_set: 'Reminder set.', contra_rem_removed: 'Reminders turned off.', contra_saved: 'Saved.', contra_pick_date: 'Pick a date first.',
    contra_today_q: "Today's pill", contra_taken: 'Taken', contra_missed_b: 'Missed', contra_not_yet: 'Not marked yet', contra_not_today: 'No pill today', contra_took_today: "I took today's pill", contra_mark_missed: 'Mark as missed', contra_marked: 'Marked as taken.', contra_marked_m: 'Marked as missed.',
    contra_log14: 'Last 14 days. Tap a day to change it: taken, missed, not marked.', contra_c30_t: 'Taken, last 30 days', contra_c30_m: 'Missed, last 30 days', contra_c30_u: 'Not marked, last 30 days', contra_missed_what: 'Missed a pill? What to do',
    contra_chh_days: 'Your Chhaya schedule', contra_chh_first: 'Day of your first Chhaya pill', contra_chh_need: 'Save the day you took your first pill to see your days.', contra_until: 'Until {d}', contra_from: 'From {d}',
    contra_ant_h: 'Injection dates', contra_ant_last: 'Last Antara injection', contra_ant_due: 'Next injection due', contra_ant_win: 'Allowed window', contra_ant_need: 'Save the date of your last injection. It is on your MPA card.',
    contra_ant_wait: 'Not yet. Your window opens on {d}.', contra_ant_open: 'Your window is open. Go on or before {d} if you can.', contra_ant_late_ok: 'You are late but it can still be given until {d}. Go this week.', contra_ant_late: 'More than 4 weeks late. Use condoms and go to the health centre; they will check you and restart.', contra_ant_late_doc: 'More than 4 weeks late. Use condoms and see your doctor or the health centre; they will check you and restart.', contra_overdue: 'Due to be replaced since {d}, so it may no longer protect you. Use condoms, and see the ANM or your health centre.', contra_overdue_doc: 'Due to be replaced since {d}, so it may no longer protect you. Use condoms, and see your doctor.', contra_lam_over: 'LAM stopped protecting you on {d}, when your baby turned 6 months. Use condoms, and see the ANM about your next method.', contra_lam_over_doc: 'LAM stopped protecting you on {d}, when your baby turned 6 months. Use condoms, and see your doctor about your next method.',
    contra_cut_h: 'Copper-T details', contra_cut_type: 'Type (on your IUCD card)', contra_cut_380: 'Cu 380A · 10 years', contra_cut_375: 'Cu 375 · 5 years', contra_cut_date: 'Date it was fitted', contra_cut_visit: 'Check-up visit', contra_cut_replace: 'Replace by', contra_cut_ask: 'Ask the centre; it is on your card',
    contra_cut_month: 'Monthly reminder: after your period, check for PAINS warning signs and whether it came out', contra_cut_threads: 'Go at 6 weeks, or after your first period if sooner. Indian guidance says you do not need to feel the threads yourself.',
    contra_dates: 'Dates', contra_dev_until: 'Remove or replace by (from your card)', contra_dev_note: 'Your doctor writes this date on your card. We remind you on that day.', contra_nsv_date: 'Date of the NSV', contra_nsv_test: 'Semen test due', contra_nsv_note: 'Use condoms until the semen test shows no sperm.',
    contra_lam_birth: "Baby's date of birth", contra_lam_end: 'LAM stops protecting you by', contra_lam_note: 'We remind you 2 weeks before, and on the day. Start your next method before then.',
    contra_condom_note: 'No reminder needed. Keep a few at home; your ASHA brings them free.', contra_condom_note_doc: 'No reminder needed. Keep a few at home; any chemist sells them, and your ASHA brings them free.', contra_tub_note: 'No reminders needed. Go for your check-ups on day 7 and at 6 weeks.',
    contra_horm_note: 'On a hormonal method? In Me, open My health details and switch on "On hormone medicine" so your diary sets those cycles aside.', contra_open_me: 'Open My health details', contra_mine_foot: 'This stays on this phone. Nothing is sent anywhere.',
    contra_ms_p: 'Pick your method, then what happened. Steps follow WHO and Government of India guidance.', contra_ms_which: 'Which method?', contra_ms_pill: 'Combined pill (Mala-N)', contra_ms_pop: 'POP', contra_ms_chh: 'Chhaya', contra_ms_ant: 'Antara injection late',
    contra_ms_what: 'What happened?', contra_ms_p12: 'Missed 1 or 2 pills, or started a strip 1–2 days late', contra_ms_p3: 'Missed 3 or more, or started a strip 3 or more days late', contra_ms_iron: 'Missed only iron pills (the last 7)',
    contra_ms_week: 'In which week of the strip?', contra_ms_w12: 'Week 1 or 2', contra_ms_w3: 'Week 3', contra_ms_pop_p: 'A POP counts as missed when it is more than 3 hours late (12 hours for some brands; ask which one you have).', contra_ms_c1: 'Late by 7 days or less', contra_ms_c2: 'Late by more than 7 days',
    contra_ms_a1: 'Up to 4 weeks late', contra_ms_a2: 'More than 4 weeks late', contra_ms_do: 'What to do', contra_ms_ec: 'Had sex in the last 3 days (72 hours)? Ask about the emergency pill.', contra_ms_ec2: 'Had unprotected sex in the last few days? Ask your ASHA or doctor whether you need the emergency pill.', contra_ms_ec2_doc: 'Had unprotected sex in the last few days? Ask your doctor whether you need the emergency pill.',
    contra_ms_pick: 'Pick what happened to see the steps.', contra_ms_unsure_h: 'Not sure which applies?', contra_ms_unsure: 'Take it as soon as you remember, use condoms for 7 days, and ask your ASHA or doctor whether you need the emergency pill.', contra_ms_unsure_doc: 'Take it as soon as you remember, use condoms for 7 days, and ask your doctor whether you need the emergency pill.',
    contra_ms_unsure_ant: 'Use condoms from today and go to your PHC or sub-centre with your MPA card. They will tell you whether you need the emergency pill.', contra_ms_unsure_ant_doc: 'Use condoms from today and see your doctor with your injection record. They will tell you whether you need the emergency pill.', contra_ms_vomit_h: 'Vomiting or loose motions', contra_ms_vomit: 'Vomited within 2 hours of a pill? Take another one. Vomiting or diarrhoea for more than 2 days: treat it as missed pills and ask your ANM or doctor.', contra_ms_vomit_doc: 'Vomited within 2 hours of a pill? Take another one. Vomiting or diarrhoea for more than 2 days: treat it as missed pills and ask your doctor.',
    contra_ec_p: 'Sex without protection, a condom broke, or you missed pills? Act today. Nothing you type here is saved.', contra_ec_when: 'When did it happen?', contra_ec_date: 'Date', contra_ec_time: 'About what time', contra_ec_calc: 'Work it out',
    contra_ec_hours: 'About {h} hours ago', contra_ec_hours1: 'About 1 hour ago', contra_ec_hours0: 'Less than an hour ago', contra_ec_future: 'That time is in the future. Check the date and time.', contra_ec_in72_h: 'Within 72 hours: take the emergency pill today.', contra_ec_left: 'About {h} hours of the 72 are left.', contra_ec_left1: 'About 1 hour of the 72 is left.', contra_ec_left0: 'Less than an hour of the 72 is left.',
    contra_ec_in72: 'The sooner you take it, the better it works. A Copper-T fitted within 5 days works even better, and keeps protecting you afterwards.',
    contra_ec_mid_h: 'More than 3 days, less than 5: go today.', contra_ec_mid: 'The pill sold in India is meant for use within 72 hours. A Copper-T fitted within 5 days (120 hours) is the most effective option. Go to a PHC, CHC or government hospital today; the doctor will tell you whether a pill can still help.', contra_ec_mid_doc: 'The pill sold in India is meant for use within 72 hours. A Copper-T fitted within 5 days (120 hours) is the most effective option. See your gynaecologist today, or go to a PHC, CHC or government hospital; the doctor will tell you whether a pill can still help.',
    contra_ec_late_h: 'More than 5 days ago.', contra_ec_late: 'Emergency methods may not work this late. If your period is a week late, do a pregnancy test. Use condoms or start a regular method now.',
    contra_ec_where: 'Where to get it', contra_ec_w1: 'Any chemist, without a prescription.', contra_ec_w2: 'Free from your ASHA, the sub-centre, PHC or CHC.', contra_ec_w2_doc: 'Any chemist sells it without a prescription; it is also free from your ASHA, the sub-centre, PHC or CHC.', contra_ec_w3: 'Copper-T: free at PHCs, CHCs and government hospitals.', contra_ec_w3_doc: 'Copper-T: your gynaecologist can fit one; it is also free at PHCs, CHCs and government hospitals.',
    contra_ec_know: 'Good to know', contra_ec_k1: 'It is not an abortion pill. It does not harm a pregnancy that has already started.', contra_ec_k2: 'It is for emergencies, not regular use. Used often, it upsets periods and works less well than a regular method.',
    contra_ec_k3: 'Your next period may come a little early or late.', contra_ec_k4: 'Vomited within 2 hours of taking it? Take another dose.', contra_ec_k5: 'It covers only sex before you took it, and does not protect against STIs. Most regular methods can start the same day.',
    contra_ec_flag: 'Period more than a week late, or unusually light or painful: do a pregnancy test and see a doctor.', contra_ec_test: 'When to do a pregnancy test', contra_ec_more: 'How it works, side effects, where it is free',
    contra_free_p: 'Under the National Family Planning Programme, these methods are free at government centres and through your ASHA. You can go on your own; no one needs to come with you.',
    contra_fr_asha_h: 'Your ASHA', contra_fr_asha: 'Brings condoms (Nirodh), Mala-N, Chhaya, the emergency pill and Nishchay pregnancy test kits to your home, free. Pills come after a first check by a doctor, nurse or ANM.',
    contra_fr_sc_h: 'Sub-centre (Ayushman Arogya Mandir)', contra_fr_sc: 'The ANM and CHO give condoms, Mala-N, Chhaya and the emergency pill. Where staff are trained: Antara injections and Copper-T.',
    contra_fr_phc_h: 'PHC', contra_fr_phc: 'All of the above, plus Copper-T and Antara (the first injection after a doctor checks you). Tubectomy at some PHCs on fixed days.',
    contra_fr_chc_h: 'CHC and district hospital', contra_fr_chc: 'All methods, including Copper-T right after delivery (PPIUCD), tubectomy and NSV for men. In a few districts, the arm implant too.',
    contra_fr_money_h: 'Money you may get', contra_fr_m1: '₹300 for travel when you get a Copper-T within 48 hours of delivery or after an abortion at a government facility (PPIUCD/PAIUCD scheme).',
    contra_fr_m2: 'Compensation for lost wages after tubectomy or NSV at a government facility. The amount depends on your state and category; ask at the PHC before the date.', contra_fr_m3: 'If something goes wrong after sterilisation, a government indemnity scheme covers it. Ask the hospital for details.',
    contra_fr_say_h: 'What you can say', contra_fr_s1: '"I want a gap before my next baby. Which methods do you have here?"', contra_fr_s2: '"I would like Copper-T, Antara or Chhaya. When can I come?"', contra_fr_s3: '"I am breastfeeding. Which method is safe for me?"', contra_fr_s4: '"Our family is complete. When is the next tubectomy or NSV day?"',
    contra_fr_paid_h: 'Not in the free list', contra_fr_paid: 'The hormonal IUD (LNG-IUS) is only at private clinics, and the implant is free only in a few districts so far. Ask the full cost before you agree.', contra_fr_104: 'Health advice helpline, free',
    contra_sum_pills: 'Pills missed in last 30 days: {m} (taken {t}, not marked {u})'
  };
  const hi = {
    contra_took_short: 'ले ली', contra_setup_add: 'जो तरीक़ा अपनाती हैं, उसे जोड़ें', contra_setup_rem: 'अपने तरीक़े का रिमाइंडर चालू करें', contra_setup_post: 'डिलीवरी के बाद का तरीक़ा चुनें',
    contra_hub: 'गर्भनिरोध', contra_hub_s: 'तरीक़ा चुनें, रिमाइंडर, छूटी गोली, इमरजेंसी गोली', contra_hub_p: 'यहाँ के ज़्यादातर तरीक़े सरकारी केंद्रों पर मुफ़्त हैं। जो आपको ठीक लगे, आप चुनें; डॉक्टर, नर्स या ANM देखती हैं कि वह आपके लिए सुरक्षित है।', contra_hub_p_doc: 'जो आपको ठीक लगे, आप चुनें; आपकी डॉक्टर देखती हैं कि वह आपके लिए सुरक्षित है। यहाँ के ज़्यादातर तरीक़े सरकारी केंद्रों पर मुफ़्त भी हैं।',
    contra_find: 'आपके लिए सही तरीक़ा खोजें', contra_find_s: '6 छोटे सवाल। हर तरीक़ा सूची में रहता है।', contra_mine: 'मेरा तरीक़ा और रिमाइंडर', contra_mine_s: 'गोली का समय, छाया के दिन, अगला इंजेक्शन, Copper-T की तारीख़ें',
    contra_missed: 'गोली छूट गई या देर हुई', contra_missed_s: 'Mala-N, POP, छाया या अंतरा में देरी पर क्या करें', contra_ec: 'इमरजेंसी गर्भनिरोध', contra_ec_s: 'असुरक्षित संबंध या कंडोम फटा: क्या करें, और कब तक',
    contra_free: 'कहाँ मुफ़्त मिलता है', contra_free_s: 'ASHA, सब-सेंटर, PHC, CHC, ज़िला अस्पताल', contra_all: 'सभी तरीक़े', contra_my: 'मेरा तरीक़ा',
    contra_g_long: 'महीनों या सालों तक', contra_g_pill: 'गोलियाँ', contra_g_each: 'हर बार संबंध के समय', contra_g_perm: 'स्थायी', contra_g_after: 'बच्चे के बाद', contra_g_emerg: 'सिर्फ़ इमरजेंसी में',
    contra_wf_h: 'चिंताएँ और सच', contra_wf_myth: 'भ्रम', contra_wf_fact: 'सच', contra_wf_more: 'इस तरीक़े के बारे में पढ़ें',
    contra_safe_days: '“safe days” गिनना गर्भ से बचने का भरोसेमंद तरीक़ा नहीं है, इसलिए यह app किसी दिन को सुरक्षित नहीं कहता। इसके fertile दिनों के अंदाज़े गर्भ की योजना के लिए हैं।', contra_num_note: 'नंबर बताता है कि आम इस्तेमाल के एक साल में 100 में से कितनी महिलाओं को गर्भ ठहरता है (WHO)।',
    contra_in100: '100 में', contra_hours: 'घंटे', contra_qura_h: 'तय नहीं कर पा रहीं कि कौन सा तरीक़ा ठीक है?', contra_qura_p: 'Qura की डॉक्टर (BAMS) मुफ़्त कॉल पर आपसे बात कर सकती हैं और refer कर सकती हैं। हॉर्मोन वाले तरीक़े MBBS डॉक्टर या स्त्री रोग विशेषज्ञ शुरू करते हैं।',
    contra_rate_typ: 'इसे एक साल इस्तेमाल करने वाली 100 महिलाओं में से, आम इस्तेमाल में लगभग {n} को गर्भ ठहरता है।', contra_rate_k: '100 में 1 से कम। एक साल इस्तेमाल करने वाली 1,000 महिलाओं में से लगभग {k} को गर्भ ठहरता है।',
    contra_rate_note: '“आम इस्तेमाल” यानी असल ज़िंदगी, जिसमें देर से या छूटी ख़ुराक भी शामिल है। आँकड़े WHO की परिवार नियोजन हैंडबुक (2022) से।', contra_rate_note_in: 'आँकड़ा भारत सरकार की गोली गाइड (2016) से।',
    contra_well: 'कितना असरदार है', contra_how: 'यह कैसे काम करता है', contra_expect: 'क्या उम्मीद करें', contra_askfirst: 'पहले डॉक्टर से पूछें अगर', contra_where: 'मुफ़्त कहाँ मिलेगा', contra_startstop: 'शुरू करना और बंद करना',
    contra_fert: 'फिर से गर्भ कब ठहर सकता है', contra_rx_h: 'कौन शुरू करता है', contra_sources: 'स्रोत', contra_not_rx: 'सामान्य जानकारी, दवा की पर्ची नहीं। आपके लिए क्या सुरक्षित है, यह आपकी डॉक्टर तय करती हैं।',
    contra_set_rem: 'रिमाइंडर लगाएँ', contra_about: 'इस तरीक़े के बारे में', contra_nf: 'यह तरीक़ा नहीं मिला।', contra_ec_window: 'अपना समय देखें',
    contra_chh_table: 'आपके छाया के दिन', contra_chh_table_p: 'पहली गोली का दिन आपके दिन तय करता है। पहले 3 महीने, फिर चौथे महीने से।', contra_cut_ec: 'असुरक्षित संबंध के 5 दिन के अंदर लगा Copper-T सबसे असरदार इमरजेंसी गर्भनिरोध भी है।',
    contra_lam_check: 'तीनों शर्तें जाँचें', contra_lam_yes: 'आज तीनों शर्तें पूरी हैं, इसलिए LAM आपको बचा सकता है। जिस दिन कोई एक बदले, दूसरा तरीक़ा शुरू करें।', contra_lam_no: 'तीनों शर्तें पूरी नहीं हैं, इसलिए अभी LAM नहीं बचाता। आज से दूसरा तरीक़ा अपनाएँ।', contra_not_saved: 'यहाँ आप जो टिक करें या लिखें, वह सेव नहीं होता।',
    contra_q1: 'क्या आप कभी बच्चा (या एक और बच्चा) चाहती हैं?', contra_q2: 'कितनी जल्दी?', contra_q2a: 'एक साल के अंदर', contra_q2b: '1–2 साल में', contra_q2c: '2 साल से ज़्यादा बाद',
    contra_q3: 'क्या अभी आप दूध पिला रही हैं?', contra_q3a: 'हाँ, बच्चा 6 हफ़्ते से छोटा', contra_q3b: 'हाँ, बच्चा 6 हफ़्ते से 6 महीने', contra_q3c: 'हाँ, बच्चा 6 महीने से बड़ा',
    contra_q4: 'क्या आप रोज़ गोली लेना याद रख पाएँगी?', contra_q4a: 'हाँ, आराम से', contra_q4b: 'कभी-कभी भूल जाती हूँ', contra_q5: 'क्या आप हॉर्मोन से बचना चाहेंगी?', contra_q5a: 'हाँ, बिना हॉर्मोन', contra_q5b: 'फ़र्क़ नहीं पड़ता', contra_q6: 'क्या पहले बच्चा हुआ है?',
    contra_yes: 'हाँ', contra_no: 'नहीं', contra_unsure: 'पक्का नहीं',
    contra_ch_p: 'जितने चाहें जवाब दें। जवाब देते ही सूची फिर से छँटती है, और कोई तरीक़ा कभी छिपाया नहीं जाता। आपके जवाब सेव नहीं होते।', contra_ch_res: 'तरीक़े, सबसे सही पहले', contra_ch_none: 'सूची छाँटने के लिए किसी सवाल का जवाब दें।', contra_ch_reset: 'जवाब हटाएँ',
    contra_ch_doc_h: 'तरीक़ा आपके लिए सुरक्षित है या नहीं, यह डॉक्टर देखती हैं', contra_ch_doc_p: 'जैसे, रोज़ की कंबाइंड गोली नहीं दी जाती अगर आपको aura वाला माइग्रेन होता है, BP 140/90 या ज़्यादा है, आप 35 या ज़्यादा की हैं और धूम्रपान करती हैं, या 6 महीने से छोटे बच्चे को दूध पिलाती हैं। यह सूची दवा की पर्ची नहीं है।',
    contra_t_complete: 'परिवार पूरा हो तो ठीक', contra_t_perm_no: 'स्थायी: आगे बच्चा चाहिए तो नहीं', contra_t_perm_unsure: 'स्थायी: पक्का होने पर ही', contra_t_fert: 'गर्भ ठहरने में देर (7–10 महीने)', contra_t_stop: 'कभी भी बंद करें',
    contra_t_remove: 'कभी भी निकलवाएँ, कोई देरी नहीं', contra_t_years: 'सालों तक चलता है', contra_t_bf6m: '6 महीने से छोटे बच्चे को दूध पिलाते समय नहीं', contra_t_6w: 'जन्म के 6 हफ़्ते बाद से', contra_t_bfok: 'स्तनपान में सुरक्षित', contra_t_48h: 'डिलीवरी के 48 घंटे में लग सकता है',
    contra_t_lam3: 'तीनों शर्तें पूरी हों तभी', contra_t_lamend: '6 महीने पर असर ख़त्म', contra_t_lamno: 'सिर्फ़ 6 महीने से छोटे बच्चे को दूध पिलाते समय', contra_t_dailyok: 'रोज़ की गोली आपसे हो जाएगी', contra_t_daily: 'रोज़ गोली ज़रूरी', contra_t_window: 'रोज़ एक ही समय, 3 घंटे के अंदर',
    contra_t_weekly: 'पहले 3 महीने बाद हफ़्ते में एक', contra_t_nothing: 'रोज़ कुछ याद नहीं रखना', contra_t_3m: 'हर 3 महीने में एक बार', contra_t_horm: 'हॉर्मोन वाला', contra_t_nohorm: 'हॉर्मोन नहीं', contra_t_onechild: 'सरकारी नियम: 1 साल से बड़ा बच्चा ज़रूरी',
    contra_t_nokids: 'पहले बच्चे से पहले भी ठीक', contra_t_sti: 'STI और HIV से भी बचाव', contra_t_private: 'ज़्यादातर प्राइवेट क्लिनिक में', contra_t_somestates: 'कुछ ज़िलों में मुफ़्त', contra_t_partner: 'पति के लिए', contra_t_emerg: 'सिर्फ़ इमरजेंसी, नियमित नहीं',
    contra_t_pcos: 'PMOS: भारत के नियमों में नहीं दी जाती', contra_t_35: '35+: धूम्रपान करती हैं तो डॉक्टर को बताएँ',
    contra_mine_p: 'अभी जो तरीक़ा इस्तेमाल करती हैं, वह चुनें। रिमाइंडर “आज” पन्ने पर और आपकी रिमाइंडर सूची में दिखेंगे। सब कुछ इसी फ़ोन पर रहता है।', contra_mine_can: 'डायरी के साथ यह पन्ना', contra_mine_c1: 'रोज़ की गोली याद दिलाता है, और हर दिन “ले ली” का टिक रखता है', contra_mine_c2: 'छाया शुरू करने की तारीख़ से सही दिन बनाता है: हफ़्ते में दो बार, फिर 3 महीने बाद हफ़्ते में एक',
    contra_mine_c3: 'अंतरा की अगली तारीख़ और छूट वाला समय निकालता है', contra_mine_c4: 'Copper-T की जाँच और बदलने का साल याद रखता है', contra_pick: 'अभी मैं यह इस्तेमाल करती हूँ', contra_pick_p: 'रिमाइंडर लगाने के लिए तरीक़ा चुनें।', contra_none_now: 'अभी कोई नहीं', contra_since: 'कब शुरू किया',
    contra_next: 'अगली बार', contra_no_next: 'कोई रिमाइंडर नहीं', contra_all_rem: 'सभी रिमाइंडर', contra_rem_on: 'इस तरीक़े के रिमाइंडर', contra_rem_h: 'रोज़ का रिमाइंडर', contra_time: 'गोली का समय', contra_rem_set: 'रिमाइंडर लग गया।', contra_rem_removed: 'रिमाइंडर बंद हो गए।', contra_saved: 'सेव हो गया।', contra_pick_date: 'पहले तारीख़ चुनें।',
    contra_today_q: 'आज की गोली', contra_taken: 'ले ली', contra_missed_b: 'छूट गई', contra_not_yet: 'अभी दर्ज नहीं', contra_not_today: 'आज गोली नहीं', contra_took_today: 'आज की गोली ले ली', contra_mark_missed: 'छूटी हुई लिखें', contra_marked: '“ले ली” दर्ज हुआ।', contra_marked_m: '“छूट गई” दर्ज हुआ।',
    contra_log14: 'पिछले 14 दिन। बदलने के लिए दिन पर टैप करें: ले ली, छूट गई, दर्ज नहीं।', contra_c30_t: 'ली गई, पिछले 30 दिन', contra_c30_m: 'छूटी, पिछले 30 दिन', contra_c30_u: 'दर्ज नहीं, पिछले 30 दिन', contra_missed_what: 'गोली छूटी? क्या करें',
    contra_chh_days: 'आपके छाया के दिन', contra_chh_first: 'छाया की पहली गोली का दिन', contra_chh_need: 'अपने दिन देखने के लिए पहली गोली वाला दिन सेव करें।', contra_until: '{d} तक', contra_from: '{d} से',
    contra_ant_h: 'इंजेक्शन की तारीख़ें', contra_ant_last: 'पिछला अंतरा इंजेक्शन', contra_ant_due: 'अगला इंजेक्शन', contra_ant_win: 'इस बीच लगवा सकती हैं', contra_ant_need: 'पिछले इंजेक्शन की तारीख़ सेव करें। यह आपके MPA card पर लिखी है।',
    contra_ant_wait: 'अभी नहीं। आपका समय {d} से शुरू होगा।', contra_ant_open: 'आपका समय चल रहा है। हो सके तो {d} तक या उससे पहले जाएँ।', contra_ant_late_ok: 'देर हो गई है, पर {d} तक अब भी लग सकता है। इसी हफ़्ते जाएँ।', contra_ant_late: '4 हफ़्ते से ज़्यादा देर। कंडोम इस्तेमाल करें और स्वास्थ्य केंद्र जाएँ; वे जाँच कर फिर से शुरू करेंगे।', contra_ant_late_doc: '4 हफ़्ते से ज़्यादा देर। कंडोम इस्तेमाल करें और अपनी डॉक्टर या स्वास्थ्य केंद्र जाएँ; वे जाँच कर फिर से शुरू करेंगे।', contra_overdue: '{d} से इसे बदलवाने का समय हो चुका है, इसलिए हो सकता है यह अब न बचाए। कंडोम इस्तेमाल करें, और ANM या स्वास्थ्य केंद्र जाएँ।', contra_overdue_doc: '{d} से इसे बदलवाने का समय हो चुका है, इसलिए हो सकता है यह अब न बचाए। कंडोम इस्तेमाल करें, और अपनी डॉक्टर से मिलें।', contra_lam_over: 'बच्चे के 6 महीने होने पर, {d} को LAM का बचाव ख़त्म हो गया। कंडोम इस्तेमाल करें, और अगले तरीक़े के लिए ANM से मिलें।', contra_lam_over_doc: 'बच्चे के 6 महीने होने पर, {d} को LAM का बचाव ख़त्म हो गया। कंडोम इस्तेमाल करें, और अगले तरीक़े के लिए अपनी डॉक्टर से मिलें।',
    contra_cut_h: 'Copper-T की जानकारी', contra_cut_type: 'type (आपके IUCD card पर)', contra_cut_380: 'Cu 380A · 10 साल', contra_cut_375: 'Cu 375 · 5 साल', contra_cut_date: 'लगवाने की तारीख़', contra_cut_visit: 'जाँच के लिए जाएँ', contra_cut_replace: 'इस तारीख़ तक बदलवाएँ', contra_cut_ask: 'केंद्र से पूछें; यह आपके card पर है',
    contra_cut_month: 'हर महीने रिमाइंडर: पीरियड के बाद PAINS वाले चेतावनी संकेत देखें, और कहीं Copper-T निकल तो नहीं गया', contra_cut_threads: '6 हफ़्ते पर जाएँ, या पहला पीरियड पहले आए तो उसके बाद। भारत के नियम कहते हैं कि धागे ख़ुद टटोलने की ज़रूरत नहीं।',
    contra_dates: 'तारीख़ें', contra_dev_until: 'इस तारीख़ तक निकलवाएँ या बदलवाएँ (card से)', contra_dev_note: 'यह तारीख़ आपकी डॉक्टर card पर लिखती हैं। उसी दिन हम याद दिलाएँगे।', contra_nsv_date: 'NSV की तारीख़', contra_nsv_test: 'वीर्य जाँच की तारीख़', contra_nsv_note: 'जब तक वीर्य जाँच में शुक्राणु न दिखना पक्का न हो, कंडोम इस्तेमाल करें।',
    contra_lam_birth: 'बच्चे की जन्म तारीख़', contra_lam_end: 'LAM इस तारीख़ तक ही बचाता है', contra_lam_note: 'हम 2 हफ़्ते पहले और उसी दिन याद दिलाएँगे। उससे पहले अगला तरीक़ा शुरू करें।',
    contra_condom_note: 'रिमाइंडर की ज़रूरत नहीं। घर पर कुछ रखें; आपकी ASHA मुफ़्त देती है।', contra_condom_note_doc: 'रिमाइंडर की ज़रूरत नहीं। घर पर कुछ रखें; ये किसी भी केमिस्ट पर मिलते हैं, और आपकी ASHA मुफ़्त देती है।', contra_tub_note: 'रिमाइंडर की ज़रूरत नहीं। 7वें दिन और 6 हफ़्ते पर जाँच के लिए जाएँ।',
    contra_horm_note: 'हॉर्मोन वाला तरीक़ा? “मैं” में “मेरी सेहत की जानकारी” खोलकर “हॉर्मोन की दवा पर” चालू करें, ताकि डायरी वे चक्र अलग रखे।', contra_open_me: '“मेरी सेहत की जानकारी” खोलें', contra_mine_foot: 'यह इसी फ़ोन पर रहता है। कहीं कुछ नहीं भेजा जाता।',
    contra_ms_p: 'अपना तरीक़ा चुनें, फिर बताएँ कि क्या हुआ। कदम WHO और भारत सरकार के नियमों के हिसाब से हैं।', contra_ms_which: 'कौन सा तरीक़ा?', contra_ms_pill: 'रोज़ की गोली (Mala-N)', contra_ms_pop: 'POP', contra_ms_chh: 'छाया', contra_ms_ant: 'अंतरा इंजेक्शन में देरी',
    contra_ms_what: 'क्या हुआ?', contra_ms_p12: '1 या 2 गोलियाँ छूटीं, या पत्ता 1–2 दिन देर से शुरू किया', contra_ms_p3: '3 या ज़्यादा छूटीं, या पत्ता 3 या ज़्यादा दिन देर से शुरू किया', contra_ms_iron: 'सिर्फ़ आयरन की गोलियाँ छूटीं (आख़िरी 7)',
    contra_ms_week: 'पत्ते के किस हफ़्ते में?', contra_ms_w12: 'पहला या दूसरा हफ़्ता', contra_ms_w3: 'तीसरा हफ़्ता', contra_ms_pop_p: 'POP 3 घंटे से ज़्यादा देर से ली जाए तो छूटी हुई मानी जाती है (कुछ brand में 12 घंटे; पूछ लें कि आपकी कौन सी है)।', contra_ms_c1: '7 दिन या कम की देरी', contra_ms_c2: '7 दिन से ज़्यादा की देरी',
    contra_ms_a1: '4 हफ़्ते तक की देरी', contra_ms_a2: '4 हफ़्ते से ज़्यादा देरी', contra_ms_do: 'क्या करें', contra_ms_ec: 'पिछले 3 दिन (72 घंटे) में संबंध बना? इमरजेंसी गोली के बारे में पूछें।', contra_ms_ec2: 'पिछले कुछ दिनों में असुरक्षित संबंध बना? ASHA या डॉक्टर से पूछें कि इमरजेंसी गोली चाहिए या नहीं।', contra_ms_ec2_doc: 'पिछले कुछ दिनों में असुरक्षित संबंध बना? डॉक्टर से पूछें कि इमरजेंसी गोली चाहिए या नहीं।',
    contra_ms_pick: 'कदम देखने के लिए चुनें कि क्या हुआ।', contra_ms_unsure_h: 'समझ नहीं आ रहा कौन सा लागू है?', contra_ms_unsure: 'याद आते ही गोली लें, 7 दिन कंडोम इस्तेमाल करें, और अपनी ASHA या डॉक्टर से पूछें कि इमरजेंसी गोली चाहिए या नहीं।', contra_ms_unsure_doc: 'याद आते ही गोली लें, 7 दिन कंडोम इस्तेमाल करें, और अपनी डॉक्टर से पूछें कि इमरजेंसी गोली चाहिए या नहीं।',
    contra_ms_unsure_ant: 'आज से कंडोम इस्तेमाल करें और अपना MPA card ले कर PHC या सब-सेंटर जाएँ। वे बताएँगे कि इमरजेंसी गोली चाहिए या नहीं।', contra_ms_unsure_ant_doc: 'आज से कंडोम इस्तेमाल करें और इंजेक्शन का रिकॉर्ड ले कर अपनी डॉक्टर से मिलें। वे बताएँगी कि इमरजेंसी गोली चाहिए या नहीं।', contra_ms_vomit_h: 'उल्टी या दस्त', contra_ms_vomit: 'गोली के 2 घंटे के अंदर उल्टी हुई? एक और लें। 2 दिन से ज़्यादा उल्टी या दस्त: इसे छूटी गोलियाँ मानें और ANM या डॉक्टर से पूछें।', contra_ms_vomit_doc: 'गोली के 2 घंटे के अंदर उल्टी हुई? एक और लें। 2 दिन से ज़्यादा उल्टी या दस्त: इसे छूटी गोलियाँ मानें और डॉक्टर से पूछें।',
    contra_ec_p: 'बिना सुरक्षा के संबंध, कंडोम फटा, या गोलियाँ छूटीं? आज ही कदम उठाएँ। यहाँ आप जो लिखें, वह सेव नहीं होता।', contra_ec_when: 'यह कब हुआ?', contra_ec_date: 'तारीख़', contra_ec_time: 'लगभग किस समय', contra_ec_calc: 'हिसाब लगाएँ',
    contra_ec_hours: 'लगभग {h} घंटे पहले', contra_ec_hours1: 'लगभग 1 घंटा पहले', contra_ec_hours0: 'एक घंटे से कम पहले', contra_ec_future: 'यह समय आगे का है। तारीख़ और समय देखें।', contra_ec_in72_h: '72 घंटे के अंदर: आज ही इमरजेंसी गोली लें।', contra_ec_left: '72 में से लगभग {h} घंटे बचे हैं।', contra_ec_left1: '72 में से लगभग 1 घंटा बचा है।', contra_ec_left0: '72 में से एक घंटे से कम बचा है।',
    contra_ec_in72: 'जितनी जल्दी लें, उतना बेहतर असर। 5 दिन के अंदर लगा Copper-T और भी बेहतर है, और आगे भी बचाता रहता है।',
    contra_ec_mid_h: '3 दिन से ज़्यादा, 5 से कम: आज ही जाएँ।', contra_ec_mid: 'भारत में मिलने वाली गोली 72 घंटे के अंदर लेने के लिए है। 5 दिन (120 घंटे) के अंदर लगा Copper-T सबसे असरदार विकल्प है। आज ही PHC, CHC या सरकारी अस्पताल जाएँ; डॉक्टर बताएँगी कि गोली अब भी मदद कर सकती है या नहीं।', contra_ec_mid_doc: 'भारत में मिलने वाली गोली 72 घंटे के अंदर लेने के लिए है। 5 दिन (120 घंटे) के अंदर लगा Copper-T सबसे असरदार विकल्प है। आज ही अपनी गायनेकोलॉजिस्ट को दिखाएँ, या PHC, CHC या सरकारी अस्पताल जाएँ; डॉक्टर बताएँगी कि गोली अब भी मदद कर सकती है या नहीं।',
    contra_ec_late_h: '5 दिन से ज़्यादा पहले।', contra_ec_late: 'इतनी देर में इमरजेंसी तरीक़े शायद काम न करें। पीरियड एक हफ़्ता देर हो तो गर्भ का test करें। अभी से कंडोम या कोई नियमित तरीक़ा शुरू करें।',
    contra_ec_where: 'कहाँ मिलेगी', contra_ec_w1: 'किसी भी chemist से, बिना पर्ची।', contra_ec_w2: 'आपकी ASHA, सब-सेंटर, PHC या CHC से मुफ़्त।', contra_ec_w2_doc: 'किसी भी केमिस्ट पर बिना पर्ची के मिलती है; आपकी ASHA, सब-सेंटर, PHC या CHC से मुफ़्त भी।', contra_ec_w3: 'Copper-T: PHC, CHC और सरकारी अस्पताल में मुफ़्त।', contra_ec_w3_doc: 'Copper-T: आपकी गायनेकोलॉजिस्ट लगा सकती हैं; PHC, CHC और सरकारी अस्पताल में मुफ़्त भी।',
    contra_ec_know: 'जानने लायक़', contra_ec_k1: 'यह गर्भपात की गोली नहीं है। पहले से ठहरे गर्भ को नुक़सान नहीं पहुँचाती।', contra_ec_k2: 'यह इमरजेंसी के लिए है, नियमित इस्तेमाल के लिए नहीं। बार-बार लेने से पीरियड गड़बड़ाते हैं और यह नियमित तरीक़े से कम असर करती है।',
    contra_ec_k3: 'अगला पीरियड थोड़ा पहले या देर से आ सकता है।', contra_ec_k4: 'लेने के 2 घंटे के अंदर उल्टी हुई? एक और ख़ुराक लें।', contra_ec_k5: 'यह सिर्फ़ गोली लेने से पहले के संबंध के लिए है, और STI से नहीं बचाती। ज़्यादातर नियमित तरीक़े उसी दिन शुरू हो सकते हैं।',
    contra_ec_flag: 'पीरियड एक हफ़्ते से ज़्यादा देर, या असामान्य रूप से हल्का या दर्द वाला: गर्भ का test करें और डॉक्टर को दिखाएँ।', contra_ec_test: 'गर्भ का test कब करें', contra_ec_more: 'कैसे काम करती है, साइड इफ़ेक्ट, कहाँ मुफ़्त',
    contra_free_p: 'राष्ट्रीय परिवार नियोजन कार्यक्रम में ये तरीक़े सरकारी केंद्रों पर और आपकी ASHA से मुफ़्त मिलते हैं। आप अकेली जा सकती हैं; किसी को साथ लाना ज़रूरी नहीं।',
    contra_fr_asha_h: 'आपकी ASHA', contra_fr_asha: 'कंडोम (Nirodh), Mala-N, छाया, इमरजेंसी गोली और Nishchay गर्भ जाँच किट घर पर मुफ़्त देती है। गोलियाँ डॉक्टर, नर्स या ANM की पहली जाँच के बाद मिलती हैं।',
    contra_fr_sc_h: 'सब-सेंटर (आयुष्मान आरोग्य मंदिर)', contra_fr_sc: 'ANM और CHO कंडोम, Mala-N, छाया और इमरजेंसी गोली देती हैं। जहाँ स्टाफ़ प्रशिक्षित है: अंतरा इंजेक्शन और Copper-T भी।',
    contra_fr_phc_h: 'PHC', contra_fr_phc: 'ऊपर का सब, साथ में Copper-T और अंतरा (पहला इंजेक्शन डॉक्टर की जाँच के बाद)। कुछ PHC पर तय दिनों में महिला नसबंदी।',
    contra_fr_chc_h: 'CHC और ज़िला अस्पताल', contra_fr_chc: 'सारे तरीक़े, जिनमें डिलीवरी के तुरंत बाद Copper-T (PPIUCD), महिला नसबंदी और पुरुषों की NSV शामिल हैं। कुछ ज़िलों में बाँह का implant भी।',
    contra_fr_money_h: 'आपको मिल सकने वाली रक़म', contra_fr_m1: 'सरकारी अस्पताल में डिलीवरी के 48 घंटे के अंदर या गर्भपात के बाद Copper-T लगवाने पर आने-जाने के ₹300 (PPIUCD/PAIUCD योजना)।',
    contra_fr_m2: 'सरकारी अस्पताल में महिला नसबंदी या NSV के बाद मज़दूरी के नुक़सान का मुआवज़ा। रक़म आपके राज्य और श्रेणी पर निर्भर है; तारीख़ से पहले PHC में पूछें।', contra_fr_m3: 'नसबंदी के बाद कुछ गड़बड़ हो तो सरकारी क्षतिपूर्ति योजना उसे कवर करती है। अस्पताल से जानकारी लें।',
    contra_fr_say_h: 'आप ऐसे कह सकती हैं', contra_fr_s1: '“मुझे अगले बच्चे से पहले अंतर चाहिए। यहाँ कौन से तरीक़े मिलते हैं?”', contra_fr_s2: '“मुझे Copper-T, अंतरा या छाया चाहिए। मैं कब आऊँ?”', contra_fr_s3: '“मैं दूध पिला रही हूँ। मेरे लिए कौन सा तरीक़ा सुरक्षित है?”', contra_fr_s4: '“हमारा परिवार पूरा है। अगली नसबंदी या NSV की तारीख़ कब है?”',
    contra_fr_paid_h: 'मुफ़्त सूची में नहीं', contra_fr_paid: 'हॉर्मोन वाला IUD (LNG-IUS) सिर्फ़ प्राइवेट क्लिनिक में मिलता है, और implant अभी कुछ ही ज़िलों में मुफ़्त है। हाँ कहने से पहले पूरा ख़र्च पूछें।', contra_fr_104: 'स्वास्थ्य सलाह हेल्पलाइन, मुफ़्त',
    contra_sum_pills: 'पिछले 30 दिन में छूटी गोलियाँ: {m} (ली गईं {t}, दर्ज नहीं {u})'
  };

  /* ---------- module-scoped styles (tokens only) ---------- */
  const css = [
    '.contra-res{display:flex;align-items:flex-start;gap:12px;background:var(--card);border-radius:16px;padding:12px 14px;box-shadow:var(--shadow);border:none;width:100%;text-align:left;color:var(--fg)}',
    '.contra-res .rb{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
    '.contra-res .rt{font-weight:600;font-size:15px;overflow-wrap:anywhere}',
    '.contra-res .rs{font-size:12px;color:var(--muted);line-height:1.4}',
    '.contra-res .rn{flex-shrink:0;text-align:right;font-size:11px;color:var(--muted);min-width:46px;line-height:1.2;padding-top:2px}',
    '.contra-res .rn b{display:block;font-size:18px;color:var(--fg);font-weight:600}',
    '.contra-res .ico-sm{margin-top:1px}',
    '.contra-tags{display:flex;flex-wrap:wrap;gap:4px}',
    '.contra-tags .pill{font-size:11px;padding:3px 8px;line-height:1.3}',
    '.contra-rate{display:flex;gap:14px;align-items:center}',
    '.contra-rate .contra-dots{width:92px;height:92px;flex-shrink:0}',
    '.contra-rate-b{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
    '.contra-dots circle{fill:var(--line)}',
    '.contra-dots circle.on{fill:var(--accent)}',
    '.contra-big{font-size:30px;font-weight:600;color:var(--fg);line-height:1.1}',
    '.contra-big small{font-size:14px;font-weight:500;color:var(--muted)}',
    '.contra-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}',
    '.contra-day{min-height:58px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--fg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-size:13px;padding:2px 0;font-family:inherit}',
    '.contra-day .dw{font-size:12px;color:var(--muted)}',
    '.contra-day .mk{font-size:13px;font-weight:700;line-height:1}',
    '.contra-day.t{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}',
    '.contra-day.m{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}',
    '.contra-day.today{outline:2px solid var(--fg);outline-offset:-2px}',
    '.contra-day.off{opacity:0.4;cursor:default}',
    '.contra-hours{font-size:28px;font-weight:600;color:var(--fg);line-height:1.15}',
    '.contra-q h3{margin-top:-4px}',
    '#view .kv dd{overflow-wrap:anywhere}'
  ].join('\n');

  /* Her method, or null: Care's "For you" puts My method and Missed pill first for her (app.js forYouKeys). */
  S.contra = { method: () => (S.canSave() && M[D().method] ? D().method : null) };

  S.register({
    id: 'contra',
    demoPersona: 'asha',
    strings: { en: en, hi: hi },
    routes: { 'contra': renderHub, 'contra-chooser': renderChooser, 'contra-mine': renderMine, 'contra-missed': renderMissed, 'contra-ec': renderEc, 'contra-free': renderFree },
    prefixes: { 'contra-m-': (v, rest) => renderMethod(v, rest) },
    testRoutes: KEYS.map((k) => 'contra-m-' + k),
    open: ['contra', 'contra-chooser', 'contra-mine', 'contra-missed', 'contra-ec', 'contra-free', 'contra-m-*'],
    tiles: [
      { section: 'contra', route: 'contra', title: 'contra_hub', sub: 'contra_hub_s', icon: 'pill', order: 10, gated: false, keywords: 'contraception family planning condom nirodh copper-t copper t iud iucd ppiucd pill mala mala-n chhaya saheli pop antara injection dmpa implant mirena tubectomy sterilisation nasbandi vasectomy nsv lam emergency i-pill गर्भनिरोध कंडोम गोली छाया अंतरा नसबंदी' },
      { section: 'contra', route: 'contra-chooser', title: 'contra_find', sub: 'contra_find_s', icon: 'sparkle', order: 12, gated: false, keywords: 'choose method which contraception' },
      { section: 'contra', route: 'contra-mine', title: 'contra_mine', sub: 'contra_mine_s', icon: 'bell', order: 14, gated: false, keywords: 'pill reminder injection date copper-t' },
      { section: 'contra', route: 'contra-missed', title: 'contra_missed', sub: 'contra_missed_s', icon: 'clock', order: 16, gated: false, keywords: 'missed pill forgot late' },
      { section: 'contra', route: 'contra-ec', title: 'contra_ec', sub: 'contra_ec_s', icon: 'help', order: 18, gated: false, keywords: 'emergency pill morning after i-pill condom broke 72 hours' },
      { section: 'contra', route: 'contra-free', title: 'contra_free', sub: 'contra_free_s', icon: 'map', order: 20, gated: false, keywords: 'free asha phc chc government' }
    ],
    css: css,
    home: home,
    afterHome: afterHome,
    today: today,
    setup: setup,
    summary: summary,
    sample: sample
  });
})(window.Saathi);
