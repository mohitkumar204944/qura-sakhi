# Sakhi: from information and records to real utility (research, 22 Oct 2026)

Mohit asked: "currently its mostly informative and a record mechanism, how i can enhance further utility of this platform
just research and advise". This is advice only; nothing here is built.

The research used three web-research passes on 22 Oct 2026:
1. what changes women's health outcomes;
2. Indian public digital infrastructure;
3. Indian women's phone and health realities.

It also read Sakhi's code and the 18 Oct product vision. Every number has a source link in section 9. Figures seen only in
a news or summary report are marked [S].

## 1. The short answer

Sakhi teaches and records. The evidence says that alone changes little. Kilkari is India's largest test of one-way health
messages: 72 weekly voice calls. It raised reversible contraception by about 3.7 points and did not change breastfeeding,
iron use or hospital births. Gains repeat when an app does four things:

1. **Turns advice into a time-boxed plan with daily reminders.** Pelvic-floor, period-pain and menopause programmes,
   iron tablets, and antenatal visits all show this.
2. **Supports one specific medicine.** Reminders and dose logs for iron tablets: adherence odds ratio 4.07 across 10
   trials, and full adherence 64% vs 39% in an Odisha trial.
3. **Puts a real person on the other end, and lets her start the contact.** For contraception, two-way contact gave an
   odds ratio of 1.71; one-way messages gave 1.03.
4. **Gives her a record that shapes the doctor visit.** WHO recommends that women carry their own notes. Feeding
   patient-reported data back to clinicians improves communication and how often the diagnosis is recorded.

In India two more things decide whether any of it reaches her:
- **Money and access:** maternity cash of ₹5,000 to ₹12,000, free delivery under JSSK, free tests, and finding the
  centre.
- **Reach:**
  - Voice first: in Bihar, 73% of women can make a call but only 25% can send a text [S].
  - Built for a shared phone: rural women aged 15+ own a phone at 48% but used one at 76%.
  - Built for a family that decides: decisions about her care are joint for 71% of women.

**So the next step is from "learn and log" to "do and connect":** plans she follows, money she claims, places she goes and
a person she can reach. All of it can keep the diary on the phone.

## 2. What the research found

### 2.1 What changes outcomes (evidence)

| Feature type | Effect | Certainty | Fit for Sakhi |
|---|---|---|---|
| Stage-based one-way messages (Kilkari, mMitra) | Small and inconsistent: Kilkari +3.7 points reversible contraception, no change in breastfeeding, iron or hospital birth. mMitra hospital delivery OR 2.54; iron tablets unchanged | Low | This is what the Learn library already does. Link each article to an action |
| Two-way contact with a person | Contraceptive use OR 1.71 (interactive) vs 1.03 (one-way). After birth: effective method 69.9% vs 57.4% (Kenya, husbands invited) | Moderate for contraception | The doctor hand-off, started by her |
| Iron tablet reminders and dose log | Adherence OR 4.07; haemoglobin +0.59 g/dL (mixed). Odisha: full adherence 63.8% vs 39%. Missed doses came from forgetting, nausea and constipation | Low | High, and fully offline |
| Antenatal visit reminders | 4+ visits RR 2.14 (one-way, 2 trials); two-way RR 1.17 | Moderate to low | High: the phone can work out the schedule |
| Contraception reminders | Use OR 1.30; pill-reminder texts didn't cut missed pills; daily educational texts raised 6-month pill continuation (RR 1.19) | Moderate | Useful, but the riskiest notification on a shared phone |
| Cervical screening prompts | Invitations RR 1.71; SMS OR 3.0 (low attendance overall) | Moderate | Medium: a "you're due" prompt plus where to go |
| Pelvic floor programme (Tät, 3 months) | Incontinence score −3.2 vs waiting list; held at 2 years. A booklet did as well when both had daily reminders | Moderate | Sakhi's 3-month course matches the trials; the reminders do the work |
| Period-pain self-care (acupressure app; exercise) | 37% vs 23% halved their pain by cycle 6; exercise SMD −1.86 | Moderate (one trial) | High, offline; wording needs doctor review |
| Menopause CBT self-help (4–12 weeks) | Hot-flush problem −1.49 at 6 weeks; online CBT effect 0.56–0.63 | Low to moderate; NICE 2024 "consider" | High, offline; needs Hindi adaptation |
| PCOS lifestyle support | Works when added to a clinic programme (≥5% weight loss 86% vs 53%); an app alone is unproven | Low | Best as part of Qura's care, not stand-alone |
| Gestational diabetes glucose log | Caesarean OR 0.76; the benefit came from clinicians reviewing readings | Low to moderate | Medium: through the doctor report |
| Woman-held record / doctor report | WHO recommends women carry their notes. Patient-reported data: communication SMD 0.36, diagnosis recorded RR 1.73 | Moderate | Very high: Sakhi's best fit |
| Alarm-style monitoring, AI triage | Fetal-movement awareness: no stillbirth benefit, more inductions and caesareans. Home BP in pregnancy: no benefit. Symptom checkers right 19–38% of the time | High that there's no benefit | Avoid |

**Harms to design against:**
- **Partner violence.** In a Bangladesh trial, contraception voice messages were followed by more partner violence (7% to
  11%).
- **Shared phones.** Women hide or delete content when family check their phones.
- **Wrong predictions.** 72% of tracker users saw a period come later than predicted, and some then worried about
  pregnancy.

### 2.2 Who she is (user reality)

| Fact | Figure |
|---|---|
| Women 15–49 who own a phone (NFHS-6, 2023–24) | 63.6% (urban 77.6%, rural 57.4%) |
| Rural women 15+: own vs used a phone (MoSPI, 2025) | 48.4% vs 76.3% |
| Women online only on a borrowed phone [S] | 35% (men 7%) |
| Can make a call vs send an SMS or WhatsApp (Bihar) [S] | 73% vs 25% |
| Her own health care decided jointly / mainly by her husband / mainly by her (NFHS-5) | 70.9% / 17.0% / 10.1% |
| Women with a reproductive problem who sought treatment | 54.8%; 60% thought it was "normal" |
| Contraception stopped within a year (NFHS-5) | 49.6%; only 62.5% were told about side effects |
| Iron tablets for 180+ days in pregnancy (NFHS-6) [S] | 37.8% |
| 4+ antenatal visits (NFHS-6) | 65.2% |
| Cervical / breast screening, women 30–49 (NFHS-5) | 1.9% / 0.9% |
| PCOS, women 18–40 | 7.2–19.6%; only 196 of 1,224 who met the criteria had been diagnosed |
| Cost of a birth, 2025 | Public ₹2,299 vs private ₹37,630 on average |
| eSanjeevani consultations by women | 57% of 50 crore |
| SnehAI, an open sexual-health chatbot for young people | 93% of users were male |
| ASHAs / Ayushman Arogya Mandirs | 10.3 lakh / 1.86–1.87 lakh |

What this means for design:
- The gaps are follow-through, not information.
- Voice and pictures reach more women than text.
- Assume a shared phone and a family that decides.
- The ASHA is the most trusted person she can reach.

### 2.3 What India's public digital stack offers (feasibility)

| Service | What Sakhi could do | Availability | Cost and compliance | Effort |
|---|---|---|---|---|
| India Post PIN directory + LGD village–PIN table | Turn the PIN she gives at signup into a district and rough location, offline | data.gov.in, GODL licence, refreshed monthly | Free; attribution | S |
| Government health facility list (NIN geo-coded) | Nearest sub-centre, PHC, CHC or district hospital, offline | 192,905 rows with PIN and lat/long (26.6 MB CSV), GODL. The data may be several years old (unverified) | Free; label "last checked" | M |
| One Stop Centres (MWCD) | Nearest centre for violence, plus 181 | 1,000 centres with coordinates (to Sep 2026) | Free; no licence stated | S |
| Jan Aushadhi Kendras | Nearest low-cost medicine shop, ₹1 pads | 21,481 shops with district and PIN (PDF export) | Free; no licence stated | S |
| NACO ICTC / STI clinics | Nearest HIV test or STI clinic | PDFs (June 2024), by district | Free | S |
| U-WIN, JANANI (new digital MCH record, May 2026), Kilkari | Prompt her to self-register; links | Citizen portals; no public API | Free; link out only | S |
| PMMVY, JSY, JSSK, PMSMA, Anemia Mukt Bharat, free diagnostics, state schemes | Check eligibility on the phone, list documents, link to official sign-up | Public rules; PMMVY self-registration is live | Free; her answers stay on the phone | M |
| PM-JAY eligibility | Hand-off only (list-based, CAPTCHA) | beneficiary.nha.gov.in | Free | S (link) |
| eSanjeevani | Link to the free video OPD | No public API or deep-link spec | Free | S (link) |
| ABDM: ABHA creation, PHR app, facility APIs | Fetch her records with consent | Free APIs. Live use needs paid functional testing, a paid WASA security audit, a GSTIN, an HTC demo and a server that handles records. Likely months | Breaks "no new spend" and "the diary never leaves the phone" | L |
| DigiLocker requester API | Pull her documents | Registered organisation, callback server, annual CERT-In audit | Paid audit | L |

**Entitlement facts worth building on:**
- **PMMVY:**
  - ₹5,000 for the first child: ₹3,000 after registration and 2 antenatal visits, ₹2,000 after the birth is registered
    and the 14-week vaccines.
  - ₹6,000 for a second child if she's a girl.
  - Eligibility: any one of SC/ST, BPL/NFSA ration card, an Ayushman card, e-Shram, MGNREGA, family income under ₹8 lakh,
    or being an Anganwadi worker or ASHA (and more).
  - She must register within 270 days of the birth.
- **Odisha's MAMATA-PMMVY:** ₹10,000–12,000.
- **JSY:** ₹1,400 rural or ₹1,000 urban in low-performing states.
- **JSSK:** a free birth, including a C-section, with free drugs, tests, blood, diet and transport.
- **PMSMA:** a free specialist check on the 9th of every month in the 2nd and 3rd trimesters.
- **Free tests:** 14 at sub-centres, 63 at PHCs, 97 at CHCs and 134 at district hospitals.

## 3. What Sakhi has today, and where utility is missing

Sakhi has 23 care areas and about 106 tools. Several already point at utility but stop at information:

- **Care near me:** it takes her PIN, then says "in the live app this page will list the real facilities". Today it
  explains the kinds of free care and links to official sites.
- **Government schemes for you:** five questions and a list. There is no document checklist, no deadline tied to her dates
  and no "next step" reminder.
- **My reports and ABHA:** a photo vault and an ABHA explainer.
- **Reminders and My medicines:** a general reminder tool, but no medicine-specific companion (doses taken, side effects,
  refills, the 180-day goal).
- **My MCP card, This week of pregnancy, Check-ups and baby's vaccines:** content plus some logs, not a "what's due"
  plan.
- **Pelvic floor trainer, 21 days of small steps, Feel better now:** the start of programmes.
- **Speak to a doctor / Tell a person:** WhatsApp only, in Version 27; the real hand-off is planned (SERVER_SPEC 10.1).
- **Summary for my doctor:** exists, and is the strongest base to build on.

## 4. Recommended upgrades

Effort: S is a few days, M a week or two, L several weeks or outside work. "Rules" checks each one against Sakhi's rules:
- the diary stays on the phone;
- no health data to Meta;
- no new spend;
- reproductive health only;
- doctor review of new health wording;
- the CDSCO gate on automated advice from her data.

### A. Do: plans she follows

| # | Upgrade | What she gets | Evidence | Rules | Effort |
|---|---|---|---|---|---|
| A1 | **Pregnancy "what's due" plan** | From her period date or due date, one list:<br>- antenatal visits with "what to ask at this visit";<br>- PMSMA on the 9th;<br>- Td doses;<br>- daily iron and calcium;<br>- the sugar test at 24–28 weeks;<br>- the day-2 postnatal check;<br>- PMMVY milestones.<br>Ticks and reminders, all offline | Visit reminders RR 2.14; only 65% get 4+ visits | Fits (a calendar from MoHFW schedules, not a judgement on her data). Wording needs doctor review | M |
| A2 | **Iron companion** | Daily red-tablet tick and reminder, 180-day progress, and help with nausea and constipation (the top reasons for stopping) | Adherence OR 4.07; Odisha 64% vs 39%; only 38% reach 180 days | Fits | S |
| A3 | **Contraception companion** | For her method: next dose (Antara date, pill pack), refill, a side-effect diary with "normal / see your ASHA" answers, and help switching. Never "safe days". A separate opt-in and neutral wording for its reminders | Half of women stop within a year; only 62.5% were told about side effects; Cochrane OR 1.30 | Fits. Reminders must be the most discreet, because of the partner-violence risk | M |
| A4 | **Screening "you're due"** | At 30+: VIA or HPV test free at AAM or PHC, a breast check by a health worker, and a reminder that repeats on schedule | Invitations RR 1.71; cervical screening is 1.9% today | Fits (by age only, not her data) | S |
| A5 | **Time-boxed programmes** | Menopause CBT (4–6 weeks), period-pain plan (3–6 cycles), PMS 2-cycle diary with CBT steps. The pelvic-floor course gets daily reminders and progress | Tät −3.2; acupressure 37% vs 23%; menopause CBT −1.49 | Fits the 19 Oct evidence map ("build now, no score"); doctor review | M each |

### B. Connect: money, places and people

| # | Upgrade | What she gets | Evidence / value | Rules | Effort |
|---|---|---|---|---|---|
| B1 | **Entitlements copilot** | Eligibility on the phone, then documents to keep ready, the official self-registration link, and deadlines tied to her dates (PMMVY's 270 days, the 2 visits for ₹3,000). Shown next to what a private birth costs | ₹5,000–12,000 cash; free birth worth an average ₹37,630 privately | Fits: her answers stay on the phone. Amounts need a yearly check | M |
| B2 | **Real "Care near me"** | From her PIN, offline: the nearest government facilities, Jan Aushadhi shops, One Stop Centre and ICTC, with "last checked" dates and the official live locator | Uses the PIN she already gives | Fits: open data (GODL), bundled per release. The PIN never leaves the phone | M |
| B3 | **The doctor hand-off** (SERVER_SPEC 10.1) | Request a Qura call with real status ("received", "we'll call at 4 pm"). The summary goes only if she ticks share | Two-way OR 1.71 vs one-way 1.03 | Needs the Qura-side endpoint and a named coordinator. | L |
| B4 | **ASHA in the loop** | Save her ASHA's or ANM's number, call in one tap, and show a "show to ASHA" screen: dates, visits done, iron days. No data link, no extra work for the ASHA | ASHA-facing work did better than messaging women directly | Fits | S |
| B5 | **Official hand-offs** | One place for U-WIN, JANANI self-registration, the PMMVY portal, the PM-JAY check, the ABHA app and eSanjeevani, with the steps for each | Uses free public systems | Fits (links only; never automate CAPTCHA portals) | S |

### C. Carry: records that work at the visit

| # | Upgrade | What she gets | Evidence | Rules | Effort |
|---|---|---|---|---|---|
| C1 | **Doctor report 2.0** | A large-type "show the doctor" screen and a PDF through the share sheet. It holds 3–6 cycles in one view, pain and bleeding scores, PMS 2-cycle ratings, iron days, pregnancy logs, and her questions for the visit (already kept on the phone). A Hindi or English toggle | WHO: women carry notes; patient-reported data improves diagnosis | Fits. The calm "worth asking about" lines need doctor sign-off, and the CDSCO gate applies to anything that reads like an alert | M |
| C2 | **Lab results without typing** | Photograph a lab report and the numbers are read on the phone (on-device text recognition), then go into the labs chart and the report | Saves the step most women skip | Needs a library download (ask first). Results read on the phone only | M |

### D. Reach: make all of it usable

| # | Upgrade | What she gets | Evidence | Rules | Effort |
|---|---|---|---|---|---|
| D1 | **Voice first** | Recorded Hindi audio (a doctor's voice) for the safety guide, the key articles and reminders, inside the APK. Logging by picture taps. Speech input on the phone where available | 73% can call vs 25% can text; Kilkari reached women through voice | Fits; it's the vision's open decision 8 (who records) | M |
| D2 | **Shared phone, more than one woman** | Separate profiles on one phone (mother and daughter), each with its own PIN, a quick-hide, and a pause for all reminders | Own 48% vs use 76%; women hide content | Fits. Under-18 rules stay | M |
| D3 | **Family cards** | Ready cards for a husband or mother-in-law (birth plan, iron, danger signs, why rest after birth), sent through the share sheet only when she chooses | Couples counselling OR 1.5; mothers-in-law expect to be consulted | Fits (no diary data in them) | S |
| D4 | **A safe backup** | A backup only she can open (encrypted on the phone with her backup code), so a lost or changed phone doesn't lose years of diary | 44% changed SIM during the Kilkari trial | Only an encrypted copy leaves the phone. That's a change to "the diary never leaves the phone", so it's Mohit's decision | M |

## 5. What to avoid or park

| Idea | Why not now |
|---|---|
| An AI chatbot that answers health questions | Symptom checkers are right 19–38% of the time. An open sexual-health chatbot's users were 93% male. Her questions would go to a third party. CDSCO reads this as medical-device territory. Keep the search over doctor-verified answers instead, and improve it for Hinglish and voice |
| Alarm-style monitoring (kick counts to a number, home BP alarms, "your data says see a doctor" pop-ups) | No benefit, and more inductions and caesareans. It is also the clearest CDSCO trigger |
| Fertile or "safe" days | Calendar apps marked a fertile day "safe" in 67% of cycles [COI]. Contraceptive software is CDSCO Class C |
| ABDM PHR app or ABHA creation, DigiLocker | Paid testing and audits, and a server that handles records: this breaks "no new spend" and "the diary stays on the phone". Link to the ABHA app instead |
| WhatsApp reminders | Health timing goes to Meta, and every message costs money |
| Forums or community chat | Moderation, POCSO risk and privacy; no evidence of benefit |
| A low-mood or depression screen after birth | Out by Mohit's 19 Oct scope decision. EPDS needs RCPsych permission, and BAMS isn't a mental-health professional. Keep Tele-MANAS and the danger signs |

## 6. Suggested order

1. **With Version 28** (already planned: signing key, update check, feedback, legal text, backups, CI):
   - A2 iron companion;
   - A4 screening "you're due";
   - B4 ASHA in the loop;
   - B5 official hand-offs.

   All small, offline and reusing reminders.
2. **Version 29:**
   - A1 pregnancy "what's due" plan;
   - B1 entitlements copilot;
   - B2 real "Care near me";
   - C1 doctor report 2.0;
   - B3 doctor hand-off, alongside, once the Qura side is ready.
3. **Version 30:**
   - A3 contraception companion;
   - A5 programmes (menopause CBT, period pain, PMS);
   - D3 family cards;
   - a D1 voice pilot on the safety guide and 10 key articles.
4. **Later:** D2 profiles, D4 encrypted backup (if approved), C2 lab reading (if the download is approved).
5. **Only with budget and design:** ABDM.

**How to know it works.** Count tasks done, not screens opened:
- iron days ticked;
- visits marked done;
- schemes started;
- calls requested;
- screenings due vs done.

Keep these counts on the phone, and send them only with opt-in. This is open decision 25 in the audit.

## 7. Decisions for Mohit

1. **Where to start:** the plans (A), money and places (B), or the doctor report (C)? My recommendation: A2, A4, B4 and
   B5 with Version 28, then A1, B1, B2 and C1.
2. **Open government data:** bundle data.gov.in datasets (GODL licence, attribution required) and refresh them each
   release?
3. **The baby's vaccines:** PMMVY's second payment needs the 14-week vaccines. Show the baby's schedule as part of the
   postpartum plan, or leave it out under "reproductive health only"?
4. **Voice:** who records the Hindi audio (Dr. Megha?), and for which pages first?
5. **Encrypted backup:** allow an encrypted copy, which only she can open, to leave the phone?
6. **The person behind the hand-off:** who is the coordinator, and what hours? This is the vision's decision 4.

## 8. A compliance gap found along the way

**CERT-In directions (2022):**
- keep ICT logs for 180 days inside India;
- report incidents within 6 hours;
- sync clocks to Indian time servers;
- name a point of contact.

**The gap:** Supabase's free plan keeps API and database logs for 1 day, and its logs may be stored outside India. This
affects the live accounts server today. It belongs with Version 28's database safety net, and it needs a decision on log
export, since some log stores cost money.

DPDP's main duties start around 13 May 2027.

## 9. Sources

### Evidence (section 2.1)

- **WHO and guidelines:**
  - [WHO digital interventions guideline 2019](https://iris.who.int/handle/10665/311941);
  - [certainty summary, Labrique 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7501250/);
  - [recommendation wording](https://www.childhealthtaskforce.org/sites/default/files/2019-05/WHO%20Recommendations%20Digital%20Interventions%20for%20HSS%20%28DH%20Subgroup%29_05.02.2019.pdf);
  - [WHO postnatal 2022 (BIGG)](https://bigg-rec.bvsalud.org/en/recommendations/c7f0ee1ca987854e3df50c4ba83ace0b44a31a38).
- **Indian programmes:**
  - Kilkari [RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC9288869/) and [retention](https://pmc.ncbi.nlm.nih.gov/articles/PMC9366343/);
  - mMitra [2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7268375/), [2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6823296/) and [AAAI 2022](https://ojs.aaai.org/index.php/AAAI/article/view/21460);
  - [ImTeCHO](https://pmc.ncbi.nlm.nih.gov/articles/PMC6812744/).
- **Contact and reminders:**
  - [Ames 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6791116/);
  - [Harrington 2019](https://pubmed.ncbi.nlm.nih.gov/31067089/);
  - [Cochrane contraception 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10363274/) and [2015](https://pubmed.ncbi.nlm.nih.gov/26115146/);
  - [PROMPTS 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11835334/);
  - iron: [Shao 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11173591/) and the [Odisha RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC10509657/);
  - antenatal visits: [Rahman 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9077501/) and [Cochrane 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC8477611/);
  - [WHO ANC digital kit](https://www.who.int/publications/i/item/9789240020306);
  - screening: [Cochrane 2021](https://pubmed.ncbi.nlm.nih.gov/34694000/) and [Tanzania](https://pubmed.ncbi.nlm.nih.gov/31645991/).
- **Self-management programmes:**
  - Tät [2017](https://pubmed.ncbi.nlm.nih.gov/27611958/) and its [2-year follow-up](https://pubmed.ncbi.nlm.nih.gov/28718223/);
  - [urgency/mixed 2021](https://pubmed.ncbi.nlm.nih.gov/33818395/);
  - [app vs booklet 2024](https://pubmed.ncbi.nlm.nih.gov/38847315/);
  - [acupressure app](https://pubmed.ncbi.nlm.nih.gov/29155036/);
  - [Cochrane exercise](https://pubmed.ncbi.nlm.nih.gov/31538328/);
  - menopause: [MENOS@Work](https://pubmed.ncbi.nlm.nih.gov/29315132/), [online CBT](https://pubmed.ncbi.nlm.nih.gov/30763176/), [app pilot 2026](https://pubmed.ncbi.nlm.nih.gov/42641440/) and [NICE NG23](https://www.nice.org.uk/guidance/ng23);
  - PCOS: [Jiskoot 2020](https://pubmed.ncbi.nlm.nih.gov/32969197/) and [app RCT 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10381787/);
  - gestational diabetes: [Yang 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12757257/) and [GDm-Health](https://pubmed.ncbi.nlm.nih.gov/29559428/).
- **Records the woman holds:**
  - WHO [antenatal 2016](https://bigg-rec.bvsalud.org/en/recommendations/a20394346aecf0b477d9d7a0dd504ea185518753) and [home-based records 2018](https://bigg-rec.bvsalud.org/en/guidelines/8960fe4388d8a1ecfe474bf57e923737fb943ceb);
  - [Cochrane 2015](https://pubmed.ncbi.nlm.nih.gov/26465209/);
  - [Indonesia](https://pmc.ncbi.nlm.nih.gov/articles/PMC6459363/);
  - [Cochrane 2021](https://pubmed.ncbi.nlm.nih.gov/34637526/);
  - [C-PASS](https://pmc.ncbi.nlm.nih.gov/articles/PMC5205545/).
- **Harms and things to avoid:**
  - [AFFIRM](https://pubmed.ncbi.nlm.nih.gov/30269876/) and [NIHR summary](https://evidence.nihr.ac.uk/alert/a-care-package-to-increase-awareness-of-fetal-movements-does-not-reduce-risk-of-stillbirth/);
  - [BUMP 1](https://doi.org/10.1001/jama.2022.4712) and [BUMP 2](https://doi.org/10.1001/jama.2022.4726);
  - [symptom checkers](https://pubmed.ncbi.nlm.nih.gov/35977992/);
  - [Reiss 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6816818/);
  - [Sambasivan 2018](https://www.usenix.org/conference/soups2018/presentation/sambasivan);
  - [Copp 2017](https://pubmed.ncbi.nlm.nih.gov/28333180/);
  - [Broad 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9047811/).

### User reality (section 2.2)

- **Phones and access:**
  - [GoI NFHS-6 note](https://indiainatlanta.gov.in/public_files/assets/pdf/NFHS_6_Note_for_International_Media_13062026v2.pdf);
  - [MoSPI CMS:T 2025](https://www.mospi.gov.in/sites/default/files/press_release/Final_press%20release_CMS_T.pdf);
  - [GxD 2026](https://gxdhub.org/wp-content/uploads/2026/07/Accelerating-Meaningful-Digital-Connectivity-for-Women-in-India_June-2026.pdf) [S];
  - [IAMAI-Kantar 2024](https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf);
  - [ORF](https://www.orfonline.org/research/financial-inclusion-of-women-current-evidence-from-india).
- **NFHS-5 indicators (DHS API):**
  - [decision-making](https://api.dhsprogram.com/rest/dhs/data?countryIds=IA&surveyIds=IA2020DHS&indicatorIds=WE_DMKH_W_HUS,WE_DMKH_W_JNT,WE_DMKH_W_WIF);
  - [contraceptive discontinuation](https://api.dhsprogram.com/rest/dhs/data?countryIds=IA&indicatorIds=FP_DISR_W_ANY&breakdown=all);
  - [told about side effects](https://api.dhsprogram.com/rest/dhs/data?countryIds=IA&surveyIds=IA2020DHS&indicatorIds=FP_ICHC_W_SID).
- **NFHS-6 summaries:** [Drishti](https://www.drishtiias.com/daily-updates/daily-news-analysis/national-family-health-survey-6-2023-24) [S].
- **Costs:** [NSS 80th round birth costs](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/apr/doc2026420852401.pdf).
- **Conditions:**
  - [screening, JFMPC 2024](https://pubmed.ncbi.nlm.nih.gov/39629359/);
  - [PCOS, JAMA Netw Open 2024](https://pubmed.ncbi.nlm.nih.gov/39441596/).
- **Care-seeking and channels:**
  - [care-seeking meta-analysis 2026](https://pubmed.ncbi.nlm.nih.gov/41959711/);
  - [eSanjeevani](https://ddnews.gov.in/en/esanjeevani-crosses-50-crore-milestone-women-account-for-57-of-utilisation/);
  - [SnehAI](https://pmc.ncbi.nlm.nih.gov/articles/PMC8764609/).
- **Family and community:**
  - [CHARM2](https://pubmed.ncbi.nlm.nih.gov/35274093/);
  - [mothers-in-law](https://pubmed.ncbi.nlm.nih.gov/36316150/);
  - [postpartum caregivers](https://pubmed.ncbi.nlm.nih.gov/40929035/).

### Public infrastructure (section 2.3)

- **Open data:**
  - [GODL](https://www.data.gov.in/Godl);
  - [PIN directory](https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month);
  - [LGD village–PIN](https://www.data.gov.in/resource/local-government-directory-lgd-villages-pin-codes);
  - [NIN health facilities](https://www.data.gov.in/resource/nin-health-faclities-geo-code-and-additional-parameters-updated-till-last-month).
- **Facility lists:**
  - [One Stop Centres](https://missionshakti.wcd.gov.in/statisticsOsc);
  - [Jan Aushadhi locator](https://janaushadhi.gov.in/locate-kendra);
  - NACO [ICTC](https://naco.mohfw.gov.in/wp-content/uploads/2024/06/ICTC-CENTRE-FACILITIES.pdf) and [DSRC](https://naco.mohfw.gov.in/wp-content/uploads/2024/06/DSRC-CENTRE-FACILITIES.pdf).
- **Citizen portals:**
  - [U-WIN](https://uwin.mohfw.gov.in/home);
  - [JANANI](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2258625);
  - [eSanjeevani](https://esanjeevani.mohfw.gov.in/).
- **Schemes:**
  - PMMVY [FAQ](https://pmmvy.wcd.gov.in/Home/FrequentlyAskedQuestions);
  - [MAMATA-PMMVY](https://wcd.odisha.gov.in/en/ICDS/mamata-pmmvy);
  - [JSY](https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309);
  - [JSSK](https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308);
  - [PMSMA](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202668887301.pdf);
  - [Anemia Mukt Bharat](https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1448&lid=797);
  - [free diagnostics](https://nhsrcindia.org/sites/default/files/2025-12/Operational%20Guidelines_FDSI.pdf);
  - [PM-JAY](https://beneficiary.nha.gov.in/).
- **ABDM and DigiLocker:**
  - ABDM [sandbox exit](https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=SandboxExit);
  - [PHR app](https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=BuildingPHRApp);
  - [NMC circular](https://nmc.org.in/whats-new/download/950);
  - [DigiLocker terms](https://cf-media.api-setu.in/resources/DigiLocker-Terms-of-User-Requester-june-2025.pdf).
- **Compliance:**
  - [CERT-In directions](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf);
  - [Supabase pricing](https://supabase.com/pricing) and [data residency](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq);
  - DPDP Rules [PIB](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf).

**Unverified or weak, as flagged by the research:**
- the age of the NIN facility data;
- JANANI's portal address;
- some state scheme amounts (Tamil Nadu, Telangana, Maharashtra);
- PM-JAY for gig workers;
- how long ABDM certification takes;
- NFHS-6 figures seen only in news reports;
- several trial results read from abstracts only;
- no Indian trials of app-based pelvic-floor, period-pain, menopause, PCOS or gestational diabetes programmes.
