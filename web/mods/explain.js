/* What your diary shows: when she logs something outside the usual range, plain words on what may be happening, common reasons,
   what she can do and how soon to see a doctor. Fixed rules, the same for every woman, from the safety guide's levels; never a
   diagnosis, a score or a condition label about her (gated). The page also shows how Sakhi works out every number from her own
   dates, so she can check the maths. Copy humanized in Dr. Megha's voice. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const LV = ['now', 'today', 'week', 'month', 'watch', 'ok'];
  const D = () => { const d = S.data('explain'); d.seen = d.seen || {}; return d; };
  const fill = (o, vars) => ({ en: S.one(o.en, vars).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)), hi: o.hi.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) });

  /* ---------- the explanations ---------- */
  const BLEED_WHY = [L('Fibroids or polyps in the womb.', 'बच्चेदानी में fibroid या polyp।'), L('Hormone changes, common in the first years of periods and in your 40s.', 'हॉर्मोन में बदलाव, जो पीरियड के शुरुआती सालों और 40 के बाद आम है।'), L('A Copper-T or some medicines.', 'Copper-T या कुछ दवाएँ।'), L('Less often, a bleeding problem.', 'कभी-कभी, खून जमने से जुड़ी समस्या।')];
  const IRON = L('Long or heavy periods can cause anaemia. Free iron tablets come from your ASHA or health centre.', 'लंबे या भारी पीरियड से खून की कमी हो सकती है। मुफ़्त आयरन की गोलियाँ ASHA या स्वास्थ्य केंद्र से मिलती हैं।');
  const MOOD_SEE = L('Talk to a doctor this month. Tele-MANAS on 14416 is free, at any hour. If you think about harming yourself, call 14416 or 112 now.', 'इसी महीने डॉक्टर से बात करें। Tele-MANAS 14416 मुफ़्त है, किसी भी समय। ख़ुद को नुक़सान पहुँचाने के विचार आएँ तो अभी 14416 या 112 पर कॉल करें।');
  const X = {
    gap_usual: { t: L('Your last gap was {n} days', 'आपका पिछला अंतर {n} दिन का था'), w: L('That is within the usual 21 to {b} days. Gaps can move by a few days from month to month, and that is normal too.', 'यह आम 21 से {b} दिन के दायरे में है। अंतर हर महीने कुछ दिन आगे-पीछे हो सकता है, और यह भी सामान्य है।'), go: 'diary' },
    gap_short: { t: L('Your last gap was {n} days', 'आपका पिछला अंतर {n} दिन का था'), w: L('That is shorter than the usual 21 days. One short gap is often nothing, but it is worth watching.', 'यह आम 21 दिन से कम है। एक बार छोटा अंतर अक्सर कुछ नहीं होता, पर इस पर ध्यान रखना ठीक है।'),
      why: [L('Gaps change a little from month to month.', 'अंतर हर महीने थोड़ा बदलता है।'), L('Bleeding between periods can look like an early period.', 'पीरियड के बीच की ब्लीडिंग जल्दी आए पीरियड जैसी लग सकती है।'), L('Stress and thyroid problems can bring a period early.', 'तनाव और थायरॉइड की समस्या से पीरियड जल्दी आ सकता है।'), L('In your 40s, cycles often get shorter for a while.', '40 की उम्र के बाद कुछ समय के लिए चक्र अक्सर छोटे हो जाते हैं।')],
      todo: [L('Log your next period start. A few months show the pattern better than one.', 'अगले पीरियड की शुरुआत दर्ज करें। एक महीने से ज़्यादा, कुछ महीनों का पैटर्न बताता है।')],
      see: L('If it happens again, or you bleed between periods, see a doctor.', 'अगर दोबारा हो, या पीरियड के बीच ब्लीडिंग हो, तो डॉक्टर को दिखाएँ।'),
      see2: L('{k} of your last 6 gaps were shorter than 21 days. See a doctor this month and ask for a thyroid test (TSH) and a blood count (Hb).', 'आपके पिछले 6 में से {k} अंतर 21 दिन से छोटे थे। इसी महीने डॉक्टर को दिखाएँ और थायरॉइड (TSH) और खून की जाँच (Hb) करवाएँ।'), go: 'periods', ask: L('Short gaps between my periods', 'पीरियड के बीच छोटा अंतर') },
    gap_long: { t: L('Your last gap was {n} days', 'आपका पिछला अंतर {n} दिन का था'), w: L('That is longer than the usual 21 to {b} days.', 'यह आम 21 से {b} दिन से ज़्यादा है।'),
      why: [L('Stress, illness, travel, or a big change in weight or exercise.', 'तनाव, बीमारी, सफ़र, या वज़न या कसरत में बड़ा बदलाव।'), L('Breastfeeding and some medicines.', 'दूध पिलाना और कुछ दवाएँ।'), L('PMOS and thyroid problems, the most common causes when it keeps happening. Both can be treated.', 'बार-बार हो तो PMOS और थायरॉइड सबसे आम कारण हैं। दोनों का इलाज होता है।'), L('From your mid-40s, longer gaps are part of the change before menopause.', '45 के आसपास से लंबे अंतर मेनोपॉज़ से पहले के बदलाव का हिस्सा हैं।')],
      todo: [L('Keep logging. Two or three months show the pattern.', 'दर्ज करती रहें। दो-तीन महीने में पैटर्न दिखता है।')],
      see: L('If it happens twice in 6 months, see a doctor.', '6 महीने में दो बार हो तो डॉक्टर को दिखाएँ।'),
      see2: L('{k} of your last 6 gaps were longer than {b} days. See a doctor this month. Blood tests for thyroid and hormones help find the cause.', 'आपके पिछले 6 में से {k} अंतर {b} दिन से लंबे थे। इसी महीने डॉक्टर को दिखाएँ। थायरॉइड और हॉर्मोन की खून की जाँच से कारण पता चलता है।'), go: 'topic-cond', ask: L('Long gaps between my periods', 'पीरियड के बीच लंबा अंतर') },
    late_now: { t: L('Day {n}, and no period yet', 'दिन {n}, और अभी तक पीरियड नहीं'), w: L('Your period is later than the usual 21 to {b} days.', 'आपका पीरियड आम 21 से {b} दिन से देर से है।'),
      why: [L('Pregnancy, if you have had sex since your last period.', 'गर्भ, अगर पिछले पीरियड के बाद संबंध बने हैं।'), L('Stress, illness, travel or weight change.', 'तनाव, बीमारी, सफ़र या वज़न में बदलाव।'), L('Breastfeeding, PMOS or thyroid problems.', 'दूध पिलाना, PMOS या थायरॉइड की समस्या।')],
      todo: [L('If you could be pregnant, take a home test. Free Nishchay kits come from your ASHA.', 'अगर गर्भ की संभावना है, तो घर पर test करें। मुफ़्त Nishchay किट ASHA से मिलती है।'), L('If it is negative and your period still has not come, test again in a week.', 'test negative हो और पीरियड फिर भी न आए, तो एक हफ़्ते बाद फिर test करें।')],
      see: L('No period for 90 days, and not pregnant or breastfeeding: see a doctor.', '90 दिन तक पीरियड न आए, और आप गर्भवती या दूध पिलाने वाली नहीं हैं: डॉक्टर को दिखाएँ।'),
      see2: L('It has been {d} days. See a doctor this month. Long gaps can be treated, so the cause is worth finding.', '{d} दिन हो गए हैं। इसी महीने डॉक्टर को दिखाएँ। लंबे अंतर का इलाज होता है, इसलिए कारण जानना ज़रूरी है।'), go: 'pregtest-when', ask: L('My period is late', 'मेरा पीरियड देर से है') },
    period_long: { t: L('Your last period lasted {n} days', 'आपका पिछला पीरियड {n} दिन चला'), w: L('Bleeding for more than 8 days is longer than usual.', '8 दिन से ज़्यादा ब्लीडिंग आम से लंबी है।'), why: BLEED_WHY,
      todo: [L('Note how many pads you need on your heaviest day.', 'सबसे भारी दिन कितने pad लगते हैं, यह लिख लें।'), IRON],
      see: L('See a doctor this week and ask for a haemoglobin (Hb) test. It is free at government hospitals.', 'इसी हफ़्ते डॉक्टर को दिखाएँ और हीमोग्लोबिन (Hb) की जाँच करवाएँ। यह सरकारी अस्पताल में मुफ़्त है।'), go: 'cond-anaemia', ask: L('Long periods', 'लंबे पीरियड') },
    flow_heavy: { t: L('Heavy flow in your last period', 'पिछले पीरियड में भारी ब्लीडिंग'), w: L('Soaking a pad every 1 to 2 hours, clots the size of a ₹10 coin or bigger, or leaking through your clothes all mean heavy bleeding.', 'हर 1 से 2 घंटे में pad भीगना, ₹10 के सिक्के जितने या बड़े थक्के, या कपड़ों पर दाग़ लगना, ये सब भारी ब्लीडिंग है।'), why: BLEED_WHY,
      todo: [IRON], see: L('See a doctor this week and ask for an Hb test. If you feel dizzy or faint, or soak a pad every hour: call 112 now.', 'इसी हफ़्ते डॉक्टर को दिखाएँ और Hb की जाँच करवाएँ। चक्कर या बेहोशी लगे, या हर घंटे pad भीगे: अभी 112 पर कॉल करें।'), go: 'cond-anaemia', ask: L('Heavy periods', 'भारी पीरियड') },
    pain_severe: { t: L('Period pain that stopped your day', 'पीरियड का दर्द जिसने आपका दिन रोक दिया'), w: L('Some cramping is common. But pain that keeps you in bed or away from work is not something to put up with.', 'थोड़ी ऐंठन आम है। पर ऐसा दर्द जो आपको बिस्तर पर रखे या काम से रोके, सहने की चीज़ नहीं है।'),
      why: [L('Endometriosis, where tissue like the womb lining grows outside the womb.', 'endometriosis, जिसमें बच्चेदानी की परत जैसा ऊतक बच्चेदानी के बाहर बढ़ता है।'), L('Fibroids or adenomyosis.', 'fibroid या adenomyosis।'), L('An infection in the pelvis.', 'पेट के निचले हिस्से में इन्फ़ेक्शन।')],
      todo: [L('Heat on your lower belly helps many women.', 'पेट के निचले हिस्से पर सेंक से कई महिलाओं को आराम मिलता है।'), L('Note which days hurt most, and whether it hurts during sex or when you pee.', 'किन दिनों ज़्यादा दर्द होता है, और क्या संबंध या पेशाब के समय दर्द होता है, यह लिख लें।')],
      see: L('See a doctor this month. Sudden severe pain on one side with a late period, or with fainting: call 112 now.', 'इसी महीने डॉक्टर को दिखाएँ। देर से आए पीरियड के साथ एक तरफ़ अचानक तेज़ दर्द, या बेहोशी: अभी 112 पर कॉल करें।'), go: 'periods-pain', ask: L('Severe period pain', 'पीरियड में तेज़ दर्द') },
    spot_between: { t: L('Spotting between periods', 'पीरियड के बीच spotting'), w: L('Spotting is light bleeding outside your period. You logged it on {k} days recently.', 'spotting यानी पीरियड के अलावा हल्की ब्लीडिंग। आपने हाल में इसे {k} दिन दर्ज किया।'),
      why: [L('Around egg release in the middle of the cycle, which is harmless.', 'चक्र के बीच में अंडा निकलने के समय, जो नुक़सानदेह नहीं है।'), L('The first months on the pill, the injection or a Copper-T.', 'गोली, इंजेक्शन या Copper-T के शुरुआती महीने।'), L('An infection, or a small polyp on the cervix.', 'इन्फ़ेक्शन, या बच्चेदानी के मुँह पर छोटा polyp।'), L('Early pregnancy.', 'शुरुआती गर्भ।')],
      todo: [L('If you could be pregnant, take a home test.', 'अगर गर्भ की संभावना है, तो घर पर test करें।')],
      see: L('Spotting that keeps coming back, or after sex: see a doctor.', 'spotting बार-बार हो, या संबंध के बाद हो: डॉक्टर को दिखाएँ।'),
      see2: L('You spotted on {k} days this cycle. See a doctor this month.', 'इस चक्र में {k} दिन spotting हुई। इसी महीने डॉक्टर को दिखाएँ।'), go: 'periods', ask: L('Spotting between periods', 'पीरियड के बीच spotting') },
    bleed_after_stop: { t: L('Bleeding after your periods stopped', 'पीरियड बंद होने के बाद ब्लीडिंग'), w: L('Any bleeding after your periods have stopped needs a check, even a little.', 'पीरियड बंद हो जाने के बाद कोई भी ब्लीडिंग, थोड़ी सी भी, जाँच माँगती है।'),
      why: [L('Most often a thin, dry lining or a small polyp. Both can be treated.', 'ज़्यादातर पतली, सूखी परत या छोटा polyp। दोनों का इलाज होता है।'), L('Sometimes it is an early sign of something that needs treatment soon, which is why the check matters.', 'कभी-कभी यह किसी ऐसी चीज़ का शुरुआती संकेत होता है जिसका जल्दी इलाज ज़रूरी है, इसीलिए जाँच ज़रूरी है।')],
      see: L('See a doctor within 2 weeks.', '2 हफ़्ते के अंदर डॉक्टर को दिखाएँ।'), go: 'meno', ask: L('Bleeding after menopause', 'मेनोपॉज़ के बाद ब्लीडिंग') },
    dup_start: { t: L('Two period starts {n} days apart', 'दो पीरियड की शुरुआत, {n} दिन के अंतर पर'), w: L('A new cycle does not start {n} days after the last one, so Sakhi counts this as part of the same period. Your gaps stay correct.', 'पिछले पीरियड के {n} दिन बाद नया चक्र शुरू नहीं होता, इसलिए Sakhi इसे उसी पीरियड का हिस्सा मानती है। आपके अंतर सही रहते हैं।'),
      todo: [L('If it was spotting, change it in your diary: tap the day and choose Spotting.', 'अगर वह spotting थी, तो डायरी में बदल दें: उस दिन पर टैप करें और Spotting चुनें।')],
      see: L('If bleeding keeps stopping and starting again within a week or two, see a doctor.', 'अगर ब्लीडिंग बार-बार रुककर एक-दो हफ़्ते में फिर शुरू हो, तो डॉक्टर को दिखाएँ।'), go: 'diary' },
    aftersex: { t: L('Bleeding after sex', 'संबंध के बाद ब्लीडिंग'), w: L('Bleeding after sex should always be checked.', 'संबंध के बाद ब्लीडिंग की जाँच हमेशा करवानी चाहिए।'),
      why: [L('An infection.', 'इन्फ़ेक्शन।'), L('Soreness or a small polyp on the cervix.', 'बच्चेदानी के मुँह पर सूजन या छोटा polyp।'), L('Less often, changes in the cervix that a screening test can find early.', 'कभी-कभी, बच्चेदानी के मुँह में बदलाव जो स्क्रीनिंग जाँच जल्दी पकड़ लेती है।')],
      see: L('See a doctor within 2 weeks and ask for a cervix check (VIA or Pap test). It is free at government centres.', '2 हफ़्ते के अंदर डॉक्टर को दिखाएँ और बच्चेदानी के मुँह की जाँच (VIA या Pap test) करवाएँ। यह सरकारी केंद्रों पर मुफ़्त है।'), go: 'screen-cervix', ask: L('Bleeding after sex', 'संबंध के बाद ब्लीडिंग') },
    burn: { t: L('Burning when you pee', 'पेशाब में जलन'), w: L('This is often a urine infection.', 'यह अक्सर पेशाब का इन्फ़ेक्शन होता है।'),
      todo: [L('Drink plenty of water.', 'ख़ूब पानी पिएँ।'), L('Do not hold your urine for long.', 'पेशाब ज़्यादा देर न रोकें।')],
      see: L('See a doctor in the next few days. With fever, back pain or blood in your urine: see a doctor today.', 'अगले कुछ दिनों में डॉक्टर को दिखाएँ। बुख़ार, कमर दर्द या पेशाब में खून हो: आज ही डॉक्टर को दिखाएँ।'),
      see2: L('In pregnancy, see a doctor today.', 'गर्भ में आज ही डॉक्टर को दिखाएँ।'), go: 'intimate-check', ask: L('Burning when I pee', 'पेशाब में जलन') },
    disch: { t: L('Unusual discharge or itching', 'असामान्य सफ़ेद पानी या खुजली'), w: L('Some white discharge is normal. A change in colour or smell, or itching and soreness, often means an infection that is easy to treat.', 'थोड़ा सफ़ेद पानी सामान्य है। रंग या गंध बदलना, या खुजली और जलन, अक्सर ऐसे इन्फ़ेक्शन का संकेत है जिसका इलाज आसान है।'),
      why: [L('A yeast infection: thick white discharge and itching.', 'yeast इन्फ़ेक्शन: गाढ़ा सफ़ेद पानी और खुजली।'), L('Bacterial vaginosis: thin discharge with a fishy smell.', 'bacterial vaginosis: पतला पानी, मछली जैसी गंध।'), L('An infection passed on through sex.', 'संबंध से फैलने वाला इन्फ़ेक्शन।')],
      todo: [L('Wash only the outside, with water. Do not wash inside.', 'सिर्फ़ बाहर से पानी से धोएँ। अंदर न धोएँ।')],
      see: L('See a doctor this week. With fever or pain low in your belly: see a doctor today.', 'इसी हफ़्ते डॉक्टर को दिखाएँ। बुख़ार या पेट के निचले हिस्से में दर्द हो: आज ही डॉक्टर को दिखाएँ।'), go: 'intimate-check', ask: L('Unusual discharge', 'असामान्य सफ़ेद पानी') },
    sexpain: { t: L('Pain during sex', 'संबंध के समय दर्द'), w: L('Pain during sex is common, and it can be treated.', 'संबंध के समय दर्द आम है, और इसका इलाज होता है।'),
      why: [L('Dryness.', 'सूखापन।'), L('An infection.', 'इन्फ़ेक्शन।'), L('Endometriosis.', 'endometriosis।')], see: L('See a doctor this month.', 'इसी महीने डॉक्टर को दिखाएँ।'), go: 'intimate', ask: L('Pain during sex', 'संबंध के समय दर्द') },
    androgen: { t: L('Signs that can come with PMOS', 'संकेत जो PMOS के साथ आ सकते हैं'), w: L('Extra hair, acne or thinning scalp hair can come from higher levels of male-type hormones.', 'ज़्यादा बाल, मुँहासे या सिर के बाल पतले होना, पुरुष-जैसे हॉर्मोन बढ़ने से हो सकता है।'),
      w2: L(' Together with your long gaps, PMOS is worth checking.', ' आपके लंबे अंतरों के साथ मिलाकर PMOS की जाँच करवाना ठीक है।'),
      why: [L('PMOS (also called PCOS), the most common cause.', 'PMOS (जिसे PCOS भी कहते हैं), सबसे आम कारण।'), L('Thyroid problems.', 'थायरॉइड की समस्या।'), L('Some medicines.', 'कुछ दवाएँ।')],
      see: L('See a doctor this month. A blood test helps find the cause.', 'इसी महीने डॉक्टर को दिखाएँ। खून की जाँच से कारण पता चलता है।'), go: 'pattern', ask: L('Could I have PMOS?', 'क्या मुझे PMOS हो सकता है?') },
    neck: { t: L('Dark, velvety skin on the neck or underarms', 'गर्दन या बगल पर गहरी, मख़मली त्वचा'), w: L('This can be a sign of insulin resistance, when the body needs extra insulin to keep blood sugar normal. It is common with PMOS and weight gain.', 'यह insulin resistance का संकेत हो सकता है, जब शरीर को शुगर सामान्य रखने के लिए ज़्यादा insulin चाहिए। यह PMOS और वज़न बढ़ने के साथ आम है।'),
      see: L('Ask a doctor for a sugar test (fasting sugar or HbA1c) this month.', 'इसी महीने डॉक्टर से शुगर की जाँच (fasting sugar या HbA1c) करवाएँ।'), go: 'cond-labs', ask: L('Dark skin on my neck', 'गर्दन पर गहरी त्वचा') },
    mood: { t: L('Low mood or anxiety most days', 'ज़्यादातर दिन उदासी या घबराहट'), w: L('Feeling low or anxious most days is common, and it can be treated.', 'ज़्यादातर दिन उदास या घबराया हुआ महसूस करना आम है, और इसका इलाज होता है।'), see: MOOD_SEE, go: 'help', ask: L('Low mood', 'उदासी') },
    p_bleed: { t: L('Bleeding in pregnancy', 'गर्भ में ब्लीडिंग'), w: L('Some spotting can happen in early pregnancy, but any bleeding needs a check.', 'शुरुआती गर्भ में थोड़ी spotting हो सकती है, पर किसी भी ब्लीडिंग की जाँच ज़रूरी है।'),
      see: L('See a doctor today. Heavy bleeding, or bleeding with pain or fainting: call 112 now.', 'आज ही डॉक्टर को दिखाएँ। भारी ब्लीडिंग, या दर्द या बेहोशी के साथ ब्लीडिंग: अभी 112 पर कॉल करें।'), go: 'help' },
    p_headswell: { t: L('Headache with swelling', 'सिरदर्द के साथ सूजन'), w: L('Together these can be signs of high blood pressure in pregnancy, called pre-eclampsia.', 'ये दोनों साथ हों तो गर्भ में हाई BP (pre-eclampsia) के संकेत हो सकते हैं।'),
      see: L('Get your BP checked today. A very bad headache, blurred vision or fits: call 112 now.', 'आज ही BP जँचवाएँ। बहुत तेज़ सिरदर्द, धुंधला दिखना या दौरे: अभी 112 पर कॉल करें।'), go: 'help' },
    p_nausea: { t: L('Nausea or vomiting', 'जी मिचलाना या उल्टी'), w: L('Common in the first months, and it usually eases by 16 to 20 weeks.', 'शुरुआती महीनों में आम है, और आमतौर पर 16 से 20 हफ़्ते तक कम हो जाता है।'),
      todo: [L('Small meals often, and a dry snack before you get up.', 'थोड़ा-थोड़ा, बार-बार खाएँ, और उठने से पहले कुछ सूखा खा लें।'), L('Sip water through the day.', 'दिन भर घूँट-घूँट पानी पिएँ।')],
      see: L('If you cannot keep food or water down for a day: see a doctor today.', 'एक दिन तक खाना या पानी बिल्कुल न रुके: आज ही डॉक्टर को दिखाएँ।'), go: 'preg-symptoms', ask: L('Nausea in pregnancy', 'गर्भ में जी मिचलाना') },
    pp_lochia: { t: L('Bleeding heavier than a period after the birth', 'डिलीवरी के बाद पीरियड से ज़्यादा ब्लीडिंग'), w: L('Bleeding after a birth should slowly get lighter.', 'डिलीवरी के बाद ब्लीडिंग धीरे-धीरे कम होनी चाहिए।'),
      see: L('Soaking a pad within an hour or passing big clots: call 112 now. Fever or a bad smell: see a doctor today.', 'एक घंटे के अंदर pad भीगना या बड़े थक्के: अभी 112 पर कॉल करें। बुख़ार या बदबू: आज ही डॉक्टर को दिखाएँ।'), go: 'help' },
    pp_breast: { t: L('A painful red patch on the breast', 'स्तन पर दर्द वाला लाल हिस्सा'), w: L('Often mastitis, a swelling of the breast that is common while breastfeeding.', 'अक्सर mastitis, यानी स्तन की सूजन, जो दूध पिलाते समय आम है।'),
      todo: [L('Keep feeding from that side. It helps the milk flow.', 'उस तरफ़ से दूध पिलाती रहें। इससे दूध बहता रहता है।')], see: L('With fever or chills: see a doctor today.', 'बुख़ार या ठंड लगे: आज ही डॉक्टर को दिखाएँ।'), go: 'post-feed', ask: L('Breast pain while feeding', 'दूध पिलाते समय स्तन में दर्द') },
    pp_stitch: { t: L('Pain at your stitches or C-section wound', 'टाँकों या ऑपरेशन के घाव में दर्द'), w: L('Some soreness is normal for a few weeks.', 'कुछ हफ़्ते थोड़ा दर्द सामान्य है।'),
      see: L('Redness, swelling, pus, a bad smell or fever: see a doctor today.', 'लाली, सूजन, मवाद, बदबू या बुख़ार: आज ही डॉक्टर को दिखाएँ।'), go: 'post-recovery', ask: L('Pain at my stitches', 'टाँकों में दर्द') },
    pp_leak: { t: L('Leaking urine after the birth', 'डिलीवरी के बाद पेशाब लीक होना'), w: L('Common after a birth, and it gets better for most women.', 'डिलीवरी के बाद आम है, और ज़्यादातर महिलाओं में ठीक हो जाता है।'),
      todo: [L('Pelvic floor exercises on most days help: squeeze as if stopping your pee, hold for 5 seconds, then relax.', 'ज़्यादातर दिन pelvic floor exercise करें: ऐसे सिकोड़ें जैसे पेशाब रोक रही हों, 5 सेकंड रोकें, फिर ढीला छोड़ें।')],
      see: L('Still leaking 3 months after the birth: see a doctor.', 'डिलीवरी के 3 महीने बाद भी लीक हो: डॉक्टर को दिखाएँ।'), go: 'post-pelvic', ask: L('Leaking urine after birth', 'डिलीवरी के बाद पेशाब लीक') },
    pp_mood: { t: L('Low mood after the birth', 'डिलीवरी के बाद उदासी'), w: L('Weepy days in the first 2 weeks are common and pass. Low mood that lasts longer can be postnatal depression, which is common and treatable.', 'पहले 2 हफ़्तों में रोना आना आम है और ठीक हो जाता है। उससे लंबी उदासी postnatal depression हो सकती है, जो आम है और जिसका इलाज होता है।'),
      see: L('Talk to a doctor. Tele-MANAS on 14416 is free, at any hour. Thoughts of harming yourself or your baby: call 14416 or 112 now.', 'डॉक्टर से बात करें। Tele-MANAS 14416 मुफ़्त है, किसी भी समय। ख़ुद को या बच्चे को नुक़सान पहुँचाने के विचार आएँ: अभी 14416 या 112 पर कॉल करें।'), go: 'post-mood', ask: L('Low mood after birth', 'डिलीवरी के बाद उदासी') },
    m_hot: { t: L('Hot flushes waking you at night', 'रात को नींद तोड़ने वाले गर्मी के झोंके'), w: L('Common in the years around menopause, and treatable.', 'मेनोपॉज़ के आसपास के सालों में आम है, और इसका इलाज होता है।'),
      todo: [L('A cool room, light cotton clothes, and less tea, coffee and spicy food help some women.', 'ठंडा कमरा, हल्के सूती कपड़े, और कम चाय, कॉफ़ी और मसालेदार खाना कुछ महिलाओं की मदद करता है।')],
      see: L('See a doctor this month. They can talk you through treatments, including HRT.', 'इसी महीने डॉक्टर को दिखाएँ। वे HRT समेत इलाज के बारे में समझा सकते हैं।'), go: 'meno-hrt', ask: L('Hot flushes at night', 'रात को गर्मी के झोंके') },
    m_palp: { t: L('A racing heartbeat', 'दिल की धड़कन तेज़ होना'), w: L('Palpitations are common around menopause, but they need a check.', 'मेनोपॉज़ के आसपास धड़कन तेज़ होना आम है, पर इसकी जाँच ज़रूरी है।'),
      see: L('See a doctor this month. With chest pain, breathlessness or fainting: call 112 now.', 'इसी महीने डॉक्टर को दिखाएँ। सीने में दर्द, साँस फूलना या बेहोशी हो: अभी 112 पर कॉल करें।'), go: 'meno', ask: L('Racing heartbeat', 'तेज़ धड़कन') }
  };

  /* ---------- reading her diary ---------- */
  const daysAgo = (iso) => S.diffDays(S.fromISO(iso), S.today());
  function latestCheckin() {
    const ks = Object.keys(S.state.checkins || {}).sort(); const k = ks[ks.length - 1]; if (!k) return null;
    const ci = S.state.checkins[k]; const at = ci.at || (k + '-15');
    return daysAgo(at) <= 45 ? Object.assign({ key: k, at: at }, ci) : null;
  }
  /* Which check-in questions she sees now (same rule as the check-in screen), for check-ins saved before they recorded it. */
  function kindNow() { const sit = S.state.situation || {}; const age = S.cycle.ageYears(); if (S.cycle.isPregnant()) return 'preg'; if (sit.deliveredOn && S.diffDays(S.fromISO(sit.deliveredOn), S.today()) <= 365) return 'post'; if (S.cycle.isMidlife ? S.cycle.isMidlife() : (sit.stopped || (age != null && age >= 45))) return 'meno'; return 'cycle'; }
  /* Every finding: { id, lv, at (the date of the entry), vars, strong (use the stronger advice), w2 } */
  function findings() {
    const st = S.state; if (st.stage !== 'app') return [];
    const c = S.cycle; const sit = st.situation || {}; const out = []; const add = (f) => out.push(f); const hiB = c.bandHi(); const age = c.ageYears();
    const cyclesOn = !c.isPregnant() && !c.countsOff() && !sit.stopped && !sit.hysterectomy;
    const counting = cyclesOn && !sit.hormones;   /* on hormones, a late or missing bleed is expected with the injection, implant or hormonal IUD */
    const evs = (st.events || []).slice().sort((a, b) => (a.d < b.d ? -1 : 1));
    const raw = c.rawStarts(); const ls = c.lastStart();
    if (counting && ls) {
      const ga = c.gapsAll(); const lg = ga[ga.length - 1]; const six = c.usable().slice(-6);
      /* a long last gap stays on screen until the 90-day card takes over, so no stretch goes without one */
      if (lg && lg.usable && (daysAgo(lg.to) <= 60 || (lg.days > hiB && daysAgo(lg.to) < 90))) {
        const n = lg.days;
        if (n < 21) { const k = six.filter((x) => x < 21).length; add({ id: 'gap_short', lv: k >= 2 ? 'month' : 'watch', at: lg.to, vars: { n: n, k: k, b: hiB }, strong: k >= 2, no40: age == null || age < 40 }); }
        else if (n > hiB) { const k = six.filter((x) => x > hiB).length; add({ id: 'gap_long', lv: k >= 2 ? 'month' : 'watch', at: lg.to, vars: { n: n, k: k, b: hiB }, strong: k >= 2, no45: age == null || age < 43 }); }
        else add({ id: 'gap_usual', lv: 'ok', at: lg.to, vars: { n: n, b: hiB } });
      }
      const ri = c.rangeInfo(); const since = S.diffDays(ls, S.today());
      /* past her own range (or 21 to 35 days), and always at 90 days, whatever her range says */
      if (since > Math.max(hiB, ri ? ri.hi : 0) || since >= 90) add({ id: 'late_now', lv: since >= 90 ? 'month' : 'watch', at: S.toISO(ls), vars: { n: since + 1, d: since, b: hiB }, strong: since >= 90 });
    }
    /* the latest period: how long, how heavy, how painful */
    const lastRaw = raw[raw.length - 1];
    if (cyclesOn && lastRaw && daysAgo(lastRaw) <= 75) {
      const end = evs.find((e) => e.t === 'end' && e.d >= lastRaw && daysAgo(e.d) >= 0 && S.diffDays(S.fromISO(lastRaw), S.fromISO(e.d)) <= 20);
      if (end) { const len = S.diffDays(S.fromISO(lastRaw), S.fromISO(end.d)) + 1; if (len > 8) add({ id: 'period_long', lv: 'week', at: lastRaw, vars: { n: len } }); }
      const det = evs.filter((e) => (e.t === 'start' || e.t === 'start_detail') && e.d >= lastRaw && S.diffDays(S.fromISO(lastRaw), S.fromISO(e.d)) <= 10);
      if (det.some((e) => e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked || e.two)) add({ id: 'flow_heavy', lv: 'week', at: lastRaw, vars: {} });
      if (det.some((e) => e.pain === 'pain_3')) add({ id: 'pain_severe', lv: 'month', at: lastRaw, vars: {} });
    }
    /* starts less than 10 days apart */
    for (let i = 1; i < raw.length; i++) { const gap = S.diffDays(S.fromISO(raw[i - 1]), S.fromISO(raw[i])); if (gap < 10 && daysAgo(raw[i]) <= 90) add({ id: 'dup_start', lv: 'watch', at: raw[i], vars: { n: gap } }); }
    /* spotting outside a period */
    if (cyclesOn) {
      const bd = c.bleedingDays(); const near = (iso) => [-2, -1, 1, 2].some((k) => { const v = bd[S.toISO(S.addDays(S.fromISO(iso), k))]; return v === 'start' || v === 'bleed'; });
      const sp = evs.filter((e) => e.t === 'spot' && daysAgo(e.d) <= 45 && daysAgo(e.d) >= 0 && !near(e.d)); const inCycle = ls ? sp.filter((e) => e.d >= S.toISO(ls)).length : sp.length;
      if (sp.length) add({ id: 'spot_between', lv: inCycle >= 3 ? 'month' : 'watch', at: sp[sp.length - 1].d, vars: { k: sp.length }, strong: inCycle >= 3, vars2: { k: inCycle } });
    }
    if (sit.stopped && !c.isPregnant()) { const b = evs.filter((e) => (e.t === 'start' || e.t === 'spot') && daysAgo(e.d) <= 60 && daysAgo(e.d) >= 0); if (b.length) add({ id: 'bleed_after_stop', lv: 'week', at: b[b.length - 1].d, vars: {} }); }
    /* the latest check-in */
    const ci = latestCheckin();
    if (ci) {
      const has = (k) => (ci.chips || []).indexOf(k) >= 0; const at = ci.at; const kind = ci.kind || kindNow();
      if (kind === 'preg') {
        if (has('pbleed')) add({ id: 'p_bleed', lv: 'today', at: at, vars: {} });
        if (has('head') && has('swell')) add({ id: 'p_headswell', lv: 'today', at: at, vars: {} });
        if (has('nausea')) add({ id: 'p_nausea', lv: 'watch', at: at, vars: {} });
      }
      if (kind === 'post') {
        if (has('lochia')) add({ id: 'pp_lochia', lv: 'now', at: at, vars: {} });
        if (has('breast')) add({ id: 'pp_breast', lv: 'today', at: at, vars: {} });
        if (has('stitch')) add({ id: 'pp_stitch', lv: 'today', at: at, vars: {} });
        if (has('leak')) add({ id: 'pp_leak', lv: 'watch', at: at, vars: {} });
        if (has('mood')) add({ id: 'pp_mood', lv: 'month', at: at, vars: {} });
      }
      if (kind === 'meno') {
        if (ci.hot === 'hot_3') add({ id: 'm_hot', lv: 'month', at: at, vars: {} });
        if (has('palp')) add({ id: 'm_palp', lv: 'month', at: at, vars: {} });
      }
      if (kind !== 'post' && has('mood')) add({ id: 'mood', lv: 'month', at: at, vars: {} });
      if (has('heavy') && !out.some((f) => f.id === 'flow_heavy')) add({ id: 'flow_heavy', lv: 'week', at: at, vars: {} });
      if (has('aftersex')) add({ id: 'aftersex', lv: 'week', at: at, vars: {} });
      if (has('burn')) add({ id: 'burn', lv: kind === 'preg' ? 'today' : 'week', at: at, vars: {}, strong: kind === 'preg' });
      if (has('disch') || has('itch')) add({ id: 'disch', lv: 'week', at: at, vars: {} });
      if (has('sexpain')) add({ id: 'sexpain', lv: 'month', at: at, vars: {} });
      if (kind === 'cycle') {
        const recent = (c.lastCheckins(3) || []); const count = (k) => recent.filter((x) => (x.chips || []).indexOf(k) >= 0).length;
        const signs = has('hair') || has('removal') || has('thin') || count('acne') >= 2;
        if (signs) { const longs = c.usable().slice(-6).filter((x) => x > hiB).length; add({ id: 'androgen', lv: 'month', at: at, vars: {}, w2: longs >= 2 }); }
        if (has('neck')) add({ id: 'neck', lv: 'month', at: at, vars: {} });
      }
    }
    /* symptoms logged on a day (the day sheet): the same explanations as the check-in */
    const daily = st.daily || {}; const recentDays = (n) => Object.keys(daily).filter((k) => daysAgo(k) >= 0 && daysAgo(k) <= n).sort();
    const seen = (id) => out.some((f) => f.id === id);
    const dOf = (keys, n) => recentDays(n).filter((k) => keys.some((x) => (daily[k] || []).indexOf(x) >= 0));
    let dd = dOf(['d_disch_bad', 'd_itch'], 7); if (dd.length && !seen('disch')) add({ id: 'disch', lv: 'week', at: dd[dd.length - 1], vars: {} });
    if (c.isPregnant()) {
      dd = dOf(['d_pbleed'], 3); if (dd.length && !seen('p_bleed')) add({ id: 'p_bleed', lv: 'today', at: dd[dd.length - 1], vars: {} });
      dd = recentDays(3).filter((k) => (daily[k] || []).indexOf('d_swell') >= 0 && (daily[k] || []).indexOf('d_headache') >= 0); if (dd.length && !seen('p_headswell')) add({ id: 'p_headswell', lv: 'today', at: dd[dd.length - 1], vars: {} });
      dd = dOf(['d_nausea'], 7); if (dd.length && !seen('p_nausea')) add({ id: 'p_nausea', lv: 'watch', at: dd[dd.length - 1], vars: {} });
    }
    return out.map((f) => Object.assign(f, { key: f.id + ':' + f.at })).sort((a, b) => LV.indexOf(a.lv) - LV.indexOf(b.lv) || (a.at < b.at ? 1 : -1));
  }
  const open = (list) => list.filter((f) => f.lv !== 'ok');

  /* ---------- drawing ---------- */
  const LV_HUE = { now: 'rose', today: 'rose', week: 'rose', month: 'gold', watch: 'gold', ok: 'green' };
  /* English plural for a count of one ("1 day", not "1 days"). */
  const one = (str) => (S.state.lang === 'en' ? str.replace(/\b1 days\b/g, '1 day') : str);
  const title = (f) => one(tx(fill(X[f.id].t, f.vars)));
  function cardHtml(f) {
    const x = X[f.id]; const what = one(tx(fill(x.w, f.vars)) + (f.w2 && x.w2 ? tx(x.w2) : ''));
    const why = (x.why || []).filter((r, i) => !(f.id === 'gap_short' && i === 3 && f.no40) && !(f.id === 'gap_long' && i === 3 && f.no45));
    const see = f.strong && x.see2 ? tx(fill(x.see2, f.vars2 || f.vars)) : (x.see ? tx(fill(x.see, f.vars)) : '');
    const list = (arr) => '<ul>' + arr.map((r) => '<li>' + esc(tx(r)) + '</li>').join('') + '</ul>';
    const goOk = x.go && (S.routeOwner(x.go) || ['diary', 'help', 'care', 'learn', 'pattern'].indexOf(x.go) >= 0 || x.go.indexOf('topic-') === 0);
    return '<div class="card xp-card xp-' + f.lv + '" data-key="' + esc(f.key) + '"><div class="xp-top"><span class="xp-pill hue-' + LV_HUE[f.lv] + '">' + esc(t('explain_lv_' + f.lv)) + '</span><span class="small">' + esc(S.fmtD(S.fromISO(f.at))) + '</span></div>' +
      '<h3>' + esc(title(f)) + '</h3><p class="xp-what">' + esc(what) + '</p>' +
      (see ? '<div class="xp-see"><b>' + esc(t('explain_see')) + '</b><p>' + esc(one(see)) + '</p></div>' : '') +
      (why.length ? '<div class="xp-sec"><b>' + esc(t('explain_why')) + '</b>' + list(why) + '</div>' : '') +
      (x.todo && x.todo.length ? '<div class="xp-sec"><b>' + esc(t('explain_do')) + '</b>' + list(x.todo) + '</div>' : '') +
      '<div class="row wrap xp-acts">' + (goOk ? '<button type="button" class="btn sm" data-go="' + esc(x.go) + '">' + esc(t('explain_more')) + '</button>' : '') +
      (f.lv === 'now' ? '<button type="button" class="btn sm" data-go="help">' + esc(t('explain_numbers')) + '</button>' : (x.ask ? '<button type="button" class="btn sm" data-ask="' + esc(tx(x.ask)) + '">' + esc(t('ask_qura')) + '</button>' : '')) +
      (f.lv !== 'ok' ? '<button type="button" class="btn sm ghost" data-xp-got="' + esc(f.key) + '">' + esc(t('explain_got')) + '</button>' : '') + '</div></div>';
  }
  /* How Sakhi works out her numbers, with her own dates */
  function howHtml() {
    const c = S.cycle; const raw = c.rawStarts().slice(-9); const kept = c.starts(); const ap = c.approxStarts(); const rows = []; let prevKept = null;
    raw.forEach((d) => {
      const isKept = kept.indexOf(d) >= 0;
      if (!isKept) { rows.push([d, '–', t('explain_r_same')]); return; }
      if (!prevKept) { const before = kept.filter((k) => k < d); prevKept = before.length ? before[before.length - 1] : null; }
      if (!prevKept) rows.push([d, '–', t('explain_r_first')]);
      else { const g = S.diffDays(S.fromISO(prevKept), S.fromISO(d)); const why = c.excludedWhy(prevKept, d); rows.push([d, String(g), why ? t('explain_r_' + why) : (ap[prevKept] || ap[d] ? t('explain_r_guess') : (g > 400 ? t('explain_r_long') : '✓'))]); }
      prevKept = d;
    });
    const cd = c.cycleDay(); const pi = S.preg && S.preg.info();
    const items = [tf('explain_h_day', { n: cd != null ? cd : '–' }), t('explain_h_gap'), t('explain_h_usual'), t('explain_h_likely'), t('explain_h_out'), t('explain_h_preg') + (pi ? ' ' + tf('explain_h_preg_now', { w: pi.weeks, d: pi.days % 7, e: S.fmtD(S.fromISO(pi.edd), { day: 'numeric', month: 'short', year: 'numeric' }) }) : ''), t('explain_h_fertile')];
    return '<details class="xp-how"><summary>' + esc(t('explain_how')) + '</summary><ul>' + items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      (rows.length ? '<div class="table-wrap"><table><tr><th>' + esc(t('explain_th_start')) + '</th><th>' + esc(t('explain_th_gap')) + '</th><th>' + esc(t('explain_th_used')) + '</th></tr>' + rows.reverse().map((r) => '<tr><td class="num">' + esc(S.fmtD(S.fromISO(r[0]), { day: 'numeric', month: 'short', year: 'numeric' })) + '</td><td class="num">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join('') + '</table></div>' : '') + '</details>';
  }
  function renderPage(v) {
    const all = findings(); const nonOk = open(all); const ok = all.filter((f) => f.lv === 'ok');
    v.innerHTML = S.backRow(t('explain_h'), 'home', true) + '<div class="tour-qrow"><p class="small">' + esc(t('explain_p')) + '</p>' + (S.canSave() ? '<button type="button" class="tour-q" data-tour-q="explain" aria-label="' + esc(t('tour_q')) + '">?</button>' : '') + '</div>' +
      (S.canSave() ? '' : S.needDiary()) +
      (S.canSave() && !nonOk.length ? '<div class="card ok"><p>' + esc(t('explain_none')) + '</p></div>' : '') +
      nonOk.map(cardHtml).join('') + ok.map(cardHtml).join('') + (S.canSave() ? howHtml() : '') + '<p class="footnote">' + esc(t('explain_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-xp-got]').forEach((b) => b.addEventListener('click', () => { D().seen[b.dataset.xpGot] = S.toISO(S.today()); S.saveQuiet(); S.toast(t('explain_got_toast')); }));
  }
  /* Home: the most urgent thing she has not yet marked "Got it" */
  function home() {
    if (!S.canSave()) return '';
    const seen = D().seen; const f = open(findings()).filter((x) => !seen[x.key])[0]; if (!f) return '';
    if (f.lv === 'now') return '<div class="card dark xp-home-now" data-xp-urgent="1"><h3>' + esc(title(f)) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(tx(X[f.id].see)) + '</p><button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none" data-go="explain">' + esc(t('explain_means')) + '</button></div>';
    return '<button type="button" class="action xp-home" data-go="explain"' + (f.lv === 'today' || f.lv === 'week' ? ' data-xp-urgent="1"' : '') + '><span class="ico hue hue-' + LV_HUE[f.lv] + '">' + S.I.help + '</span><span class="body"><strong>' + esc(title(f)) + '</strong><span class="small">' + esc(t('explain_lv_' + f.lv)) + ' · ' + esc(t('explain_means')) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }

  S.register({
    id: 'explain',
    demoPersona: 'priya',
    /* Tours: the Home card the first time it appears (never an urgent one), and the page on her first visit (never when a card
       says to see a doctor this week or sooner). The "?" on the page replays the page tour. */
    tours: [
      { id: 'xp-home', route: 'home', kind: 'feature', menu: false, order: 30, title: 'explain_h', hue: 'teal', when: () => !S.state.settings.discreet && S.canSave(), steps: [
        { sel: '#view .xp-home:not([data-xp-urgent])', h: 'explain_th_h', p: 'explain_th_p' }] },
      { id: 'explain', route: 'explain', kind: 'feature', order: 50, title: 'explain_h', hue: 'teal', when: () => S.canSave(), steps: [
        { sel: '#view .xp-card', h: 'explain_t1_h', p: 'explain_t1_p' },
        { sel: '#view .xp-card .xp-pill', h: 'explain_t2_h', p: 'explain_t2_p', vars: () => ({ a: t('explain_lv_watch'), b: t('explain_lv_today') }) },
        { sel: '#view .xp-how', h: 'explain_t3_h', p: 'explain_t3_p' }] }
    ],
    strings: {
      en: {
        explain_h: 'What your diary shows', explain_th_h: 'Sakhi noticed something', explain_th_p: 'When your diary shows something unusual, Sakhi explains it here. Tap to see what it means and when to see a doctor.', explain_t1_h: 'What Sakhi noticed', explain_t1_p: 'Each card explains one thing from your diary in plain words: what is happening, common reasons, and what you can do.', explain_t2_h: 'How soon to see a doctor', explain_t2_p: 'This label tells you how soon, from “{a}” to “{b}”.', explain_t3_h: 'Your own numbers', explain_t3_p: 'Tap here to see how Sakhi worked out your numbers from the dates you logged.',
        explain_tile_s: 'Plain words on anything unusual you logged, and when to see a doctor',
        explain_p: 'Sakhi looks at what you logged and explains it in plain words. This is not a diagnosis. Only a doctor who examines you can say what is causing something.',
        explain_none: 'Nothing unusual in what you logged in the last few weeks.', explain_why: 'Common reasons', explain_do: 'What you can do', explain_see: 'When to see a doctor',
        explain_more: 'Read more', explain_got: 'Got it', explain_got_toast: 'Hidden from Home. It stays on this page.', explain_means: 'What this means', explain_numbers: 'Emergency numbers',
        explain_lv_now: 'Call 112 now', explain_lv_today: 'See a doctor today', explain_lv_week: 'See a doctor this week', explain_lv_month: 'See a doctor this month', explain_lv_watch: 'Keep an eye on it', explain_lv_ok: 'Within the usual range',
        explain_how: 'How Sakhi works out your numbers', explain_h_day: 'Cycle day: day 1 is the day your period starts. Today is day {n}.', explain_h_gap: 'Gap: the days from one period start to the next.',
        explain_h_usual: 'Usual gap: 21 to 35 days, or 21 to 45 in the first few years of periods.', explain_h_likely: 'Likely next period: shown only when your last gaps differ by 21 days or less. It runs from your shortest gap minus 2 days to your longest gap plus 2 days.',
        explain_h_out: 'Left out of the maths: gaps touched by hormonal contraception, a pregnancy or the year after a birth, and a second start less than 10 days after the last one.',
        explain_h_preg: 'Pregnancy weeks: counted from the due date on your scan report, or from the first day of your last period. The due date is 280 days after that first day.', explain_h_preg_now: 'You are {w} weeks {d} days; due {e}.',
        explain_h_fertile: 'Fertile days: shown only when your gaps stay within 7 days of each other.',
        explain_th_start: 'Period started', explain_th_gap: 'Gap (days)', explain_th_used: 'Counted', explain_r_same: 'Same period', explain_r_first: 'First one', explain_r_hormones: 'Left out: hormones', explain_r_pregnancy: 'Left out: pregnancy', explain_r_birth: 'Left out: after birth', explain_r_long: 'Left out: too long', explain_r_guess: 'Left out: a guessed date',
        explain_foot: 'Fixed rules, the same for every woman. Not a diagnosis.'
      },
      hi: {
        explain_h: 'आपकी डायरी क्या बताती है', explain_th_h: 'Sakhi ने कुछ देखा', explain_th_p: 'जब आपकी डायरी में कुछ अलग दिखे, Sakhi यहाँ समझाती है। इसका मतलब और डॉक्टर को कब दिखाएँ, जानने के लिए दबाएँ।', explain_t1_h: 'Sakhi ने क्या देखा', explain_t1_p: 'हर कार्ड आपकी डायरी की एक बात आसान शब्दों में समझाता है: क्या हो रहा है, आम वजहें, और आप क्या कर सकती हैं।', explain_t2_h: 'डॉक्टर को कब दिखाएँ', explain_t2_p: 'यह लेबल बताता है कितनी जल्दी: “{a}” से लेकर “{b}” तक।', explain_t3_h: 'आपके अपने नंबर', explain_t3_p: 'Sakhi ने आपकी दर्ज की गई तारीख़ों से नंबर कैसे निकाले, यह देखने के लिए यहाँ दबाएँ।',
        explain_tile_s: 'जो भी असामान्य दर्ज किया, उसका आसान भाषा में मतलब, और डॉक्टर को कब दिखाएँ',
        explain_p: 'Sakhi आपकी दर्ज की गई बातों को देखकर आसान भाषा में समझाती है। यह diagnosis नहीं है। कारण क्या है, यह सिर्फ़ जाँच करने वाली डॉक्टर बता सकती हैं।',
        explain_none: 'पिछले कुछ हफ़्तों में आपने जो दर्ज किया, उसमें कुछ असामान्य नहीं है।', explain_why: 'आम कारण', explain_do: 'आप क्या कर सकती हैं', explain_see: 'डॉक्टर को कब दिखाएँ',
        explain_more: 'और पढ़ें', explain_got: 'समझ गई', explain_got_toast: 'होम से हटा दिया। यह इस पन्ने पर रहेगा।', explain_means: 'इसका मतलब क्या है', explain_numbers: 'आपातकालीन नंबर',
        explain_lv_now: 'अभी 112 पर कॉल करें', explain_lv_today: 'आज ही डॉक्टर को दिखाएँ', explain_lv_week: 'इसी हफ़्ते डॉक्टर को दिखाएँ', explain_lv_month: 'इसी महीने डॉक्टर को दिखाएँ', explain_lv_watch: 'ध्यान रखें', explain_lv_ok: 'सामान्य दायरे में',
        explain_how: 'Sakhi आपके नंबर कैसे निकालती है', explain_h_day: 'चक्र का दिन: पीरियड शुरू होने का दिन, दिन 1 है। आज दिन {n} है।', explain_h_gap: 'अंतर: एक पीरियड की शुरुआत से अगले पीरियड की शुरुआत तक के दिन।',
        explain_h_usual: 'आम अंतर: 21 से 35 दिन, या पीरियड के शुरुआती कुछ सालों में 21 से 45 दिन।', explain_h_likely: 'अगला संभावित पीरियड: तभी दिखता है जब आपके पिछले अंतर आपस में 21 दिन से ज़्यादा अलग न हों। यह आपके सबसे छोटे अंतर से 2 दिन पहले से, सबसे लंबे अंतर के 2 दिन बाद तक होता है।',
        explain_h_out: 'गिनती से बाहर: हॉर्मोन वाले गर्भनिरोध, गर्भ या डिलीवरी के बाद के पहले साल से जुड़े अंतर, और पिछली शुरुआत के 10 दिन के अंदर दर्ज की गई दूसरी शुरुआत।',
        explain_h_preg: 'गर्भ के हफ़्ते: स्कैन रिपोर्ट की डिलीवरी तारीख़ से, या पिछले पीरियड के पहले दिन से। डिलीवरी की तारीख़ उस पहले दिन के 280 दिन बाद होती है।', explain_h_preg_now: 'आप {w} हफ़्ते {d} दिन की हैं; डिलीवरी लगभग {e}।',
        explain_h_fertile: 'fertile दिन: तभी दिखते हैं जब आपके अंतर आपस में 7 दिन के अंदर रहें।',
        explain_th_start: 'पीरियड शुरू हुआ', explain_th_gap: 'अंतर (दिन)', explain_th_used: 'गिना गया', explain_r_same: 'वही पीरियड', explain_r_first: 'पहला', explain_r_hormones: 'बाहर: हॉर्मोन', explain_r_pregnancy: 'बाहर: गर्भ', explain_r_birth: 'बाहर: डिलीवरी के बाद', explain_r_long: 'बाहर: बहुत लंबा', explain_r_guess: 'बाहर: अंदाज़े की तारीख़',
        explain_foot: 'तय नियम, हर महिला के लिए एक जैसे। यह diagnosis नहीं है।'
      }
    },
    routes: { 'explain': renderPage },
    tiles: [{ section: 'cond', route: 'explain', title: 'explain_h', sub: 'explain_tile_s', icon: 'chart', order: 1, gated: true, keywords: 'what does it mean explain abnormal normal irregular late heavy spotting symptom insight matlab samjhao' }],
    css: [
      '.xp-card { gap: 10px; } .xp-card h3 { font-size: 17px; } .xp-what { color: var(--fg); }',
      '.xp-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }',
      '.xp-pill { display: inline-flex; align-items: center; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 12px; background: var(--hue-soft); color: var(--hue); }',
      '.xp-now { background: var(--ink); color: var(--ink-text); } .xp-now h3, .xp-now .xp-what, .xp-now b { color: var(--ink-text); } .xp-now .small, .xp-now li, .xp-now p { color: var(--ink-text); }',
      '.xp-sec b, .xp-see b { display: block; font-size: 14px; color: var(--fg); margin-bottom: 2px; } .xp-sec ul { margin: 0; } .xp-sec li { font-size: 15px; }',
      '.xp-see { border-left: 3px solid var(--accent); padding-left: 10px; } .xp-see p { color: var(--fg); }',
      '.xp-watch .xp-see, .xp-month .xp-see { border-left-color: var(--gold); } .xp-ok .xp-see { border-left-color: var(--ok); }',
      '.xp-how { background: var(--card); border-radius: 16px; padding: 4px 14px 12px; box-shadow: var(--shadow); } .xp-how ul { padding-left: 18px; } .xp-how li { font-size: 14px; color: var(--text); }',
      '.xp-home .body strong { font-size: 15px; } .xp-home-now h3 { color: var(--bg); }'
    ].join('\n'),
    home: home,
    summary: () => { const f = open(findings()); return f.length ? [{ title: t('explain_h'), lines: f.map((x) => t('explain_lv_' + x.lv) + ': ' + title(x)) }] : []; },
    afterRender: (v, route) => {
      /* On the diary, a one-line note when something needs a look */
      if (route !== 'diary' || !S.canSave() || S.flags.discreet) return;
      const seen = D().seen; const f = open(findings()).filter((x) => !seen[x.key])[0]; if (!f) return;
      const el = document.createElement('button'); el.type = 'button'; el.className = 'action xp-home'; el.dataset.go = 'explain';
      el.innerHTML = '<span class="ico hue hue-' + LV_HUE[f.lv] + '">' + S.I.help + '</span><span class="body"><strong>' + esc(title(f)) + '</strong><span class="small">' + esc(t('explain_lv_' + f.lv)) + ' · ' + esc(t('explain_means')) + '</span></span>';
      v.insertBefore(el, v.firstChild); S.wire(v);
    }
  });
  S.explain = { findings: findings };
})(window.Saathi);
