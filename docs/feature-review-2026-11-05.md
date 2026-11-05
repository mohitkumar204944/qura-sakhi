# The doctors' feature review (4 and 5 Nov 2026)

Mohit, 4 Nov: "our app has so many things which we dont want to keep as per dr. megha and our gynaecologist can you make a list
of all features and information so we can decide what to keep and what to eliminate". Every feature and piece of health
information in Version 39.65 became one row on a private review page (claude.ai/artifact/3GYSkDHo6bYuzwN76YVAbP), with the
screen it lives on and Claude's suggestion. Dr. Megha and the gynaecologist marked each row Keep, Remove, Amend (with a note)
or Defer. The marks were made under Mohit's account on 4 and 5 Nov. On 5 Nov Claude checked them against the app and asked
15 questions on the same page, and they answered those the same evening.

This file is the record. The marks and answers live in the page's own database (collections `decisions` and `answers`); they
are copied here so the repo keeps them.

## 1. The totals

- **499 rows:** keep 372, remove 69, amend 57, defer 1.
- **Against Claude's suggestion:** 397 rows matched it and 102 differed.
- **Rows that were waiting for doctor review:** 175. The doctors kept 138, amended 28 and removed 9. Their Keeps count as
  sign-off (answer 15), and `docs/wording-review-v28.md` section 19.68 records it.
- **Claude's mistake:** the screenshots for the calendar and Today showed a woman with irregular cycles and a woman on the pill,
  where Sakhi hides fertile days on purpose. So the notes asked for fertile days that the app already shows for steady cycles.
  Question 9 put it right.

## 2. The 15 answers

| # | Question | Answer |
|---|---|---|
| 1 | Emergencies | Go to the nearest hospital now, then 108 (102 in pregnancy) (Claude's suggestion); Keep the search card, with the new line (Claude's suggestion) |
| 2 | Thoughts of self-harm, or fear of hurting a child | Remove both: no Tele-MANAS line and no hospital line for thoughts of self-harm or fear of hurting a child (against Claude's suggestion) |
| 3 | Violence | Remove the last 181 card: no violence help in Sakhi (against Claude's suggestion) |
| 4 | “My baby has died” | Any stage change away from 'I had a baby' quietly stops everything about the baby (Claude's suggestion) |
| 5 | Shared phone, and the screenshot block | Keep Shared phone, remove the screenshot block (Claude's suggestion) |
| 6 | The medicine line, and the emergency pill | The medicine line everywhere, except the emergency pill: 'Ask a doctor or chemist today' (Claude's suggestion) |
| 7 | The folic acid reminder in early pregnancy | Folic acid reminder while trying and through the first 12 weeks of pregnancy (Claude's suggestion) |
| 8 | Ashwagandha | Leave Ashwagandha out (Claude's suggestion) |
| 9 | Fertile days | Fertile window and ovulation for every woman with steady cycles, as now (Claude's suggestion); Today's chance for every woman with steady cycles, as now (against Claude's suggestion: no change) |
| 10 | “Ask a doctor”, and how Sakhi describes Qura’s doctors | Use Claude's line about Qura's doctors; Qura has an MBBS gynaecologist on the team |
| 11 | My garden, or the week dots | Keep the week dots; My garden and its petals go |
| 12 | Contraception reminders | Reminders for any woman who sets up her method; Home's card only after a birth and when she stops trying |
| 13 | Under 18 | No option chosen: wants girls under 18 in with their mother's consent (note: “Take mother consent somehow on app only if age below 18”) |
| 14 | The before-pregnancy checklist | Before-pregnancy checklist stays as it is (the empty Amend note) |
| 15 | Do the Keeps count as sign-off | The 138 Keeps on rows waiting for doctor review are the doctors' sign-off on that wording |
|  | What Claude will do as the notes say | All fine: everything Claude listed as the notes say |

What the answers change in the marks:
- **Shared phone stays** (5): its Remove mark is overridden.
- **The urgent card for a danger sign typed in search stays** (1b). It shows the new hospital line.
- **My garden and its petals go** (11), so the petals' Amend becomes a removal.
- **Under 18 stays at 18 for now** (Mohit, 5 Nov: "keep 18 for now"). The note asks for girls under 18 with their mother's
  consent. That would be a later version of its own, after a lawyer has looked at the DPDP Act's verifiable parental
  consent, its ban on tracking children, and POCSO.
- **Qura has an MBBS gynaecologist** (10b). "How Qura helps" names them once Mohit sends their name, degree and registration
  number.

## 3. The build, in four parts

1. **Version 39.68, removals (built).** The retired pages, Explore tiles, Learn articles and chapters are gone, and so are
   these:
   - Today's look-back, notes meter, tips, first-days read and petals.
   - The answers summary, Plan your week, Your last plan, the baby plan's ready check and strength step, and the walking
     minutes.
   - Help's Private help, My ASHA and Tell a person. Help now shows on Today only.
   - Marathi, Bengali, Tamil and Telugu.
   - "My baby has died". In its place, leaving "I had a baby" quietly stops everything about the baby.

   See MODULE_API section 111 and `web/test/retire.mjs`.
2. **The emergency line everywhere.** "Go to the nearest hospital now", then 108 (102 in pregnancy), wherever "Call 112 now"
   is. Tele-MANAS, 181 and the violence lines come out.
3. **Wording.** This part covers:
   - The renames.
   - The medicine line, with the emergency pill's own line.
   - Cloth and the Rs 1 pad, which come out.
   - The doctors' added lines, and the line about Qura's doctors.

   All of it goes in English and Hindi, and the doctors read the changed lines once.
4. **Behaviour.** This part covers:
   - One reveal screen, and the goal question asked once.
   - The pause notification, and the under-40 plan start.
   - The contraception card, the folic acid reminder, Sun salutation as a morning session, the PMOS walk and the sleep routine.
   - The screenshot block, which is in the Android app's main file.

## 4. Every Remove

**Today**

- The week's look-back inside the plan card (`today-lookback`): “The week dots in the same card already show her week.”
- Notes meter (`today-meter`): “not necessary to add note”
- Tips, one a day (`today-tips`): “screen should not have excess words /or be text heavy”
- A first-days read (`today-firstdays`): “Learn's Start here already gives these reads;”

**Plans: what every plan does**

- "Here's what you told Sakhi" (`plan-summary`): “checking them again is one more screen.”
- Plan your week (`plan-week`): “few women will use it.”
- Your last plan (`plan-last`): “Undo and "Changed by mistake" already bring her earlier plan back.”

**Getting ready for a baby**

- The 1-minute ready check (`ttc-ready`): “The before-pregnancy checklist covers the same ground.”
- Strength at home from week 7 (`ttc-str`): “Not specific to getting pregnant,”

**My recovery plan (after a birth)**

- "My baby has died" (`post-died`): “need to completely remove wording like my baby died”

**My period plan**

- Pain · Keeping it going (`ch-per-p12`): “Not necessary”
- Heavy periods · Telling your family (`ch-per-h8`): “Not necessary”
- Heavy periods · Keeping it going (`ch-per-h12`): “Not necessary”
- PMS · Notice, name, pause (`ch-per-m2`): “Not necessary”
- PMS · Plan the hard week (`ch-per-m8`): “Not necessary”

**My pelvic floor plan**

- A ring pessary (`ch-pfc-v2`): “too much information is not neccessary to give”

**Moves, Wind down and Feel better now**

- Walking minutes (+10, +15, +20, +30) (`mv-walk`): “Her walk step already counts her walking.”

**Explore: tools and guides**

- Mood and body through your cycle (`tile-periods-pms`): “PMS track and the Diary log the same days.”
- Delaying a period (`tile-periods-postpone`): “Delaying period is not recommended. And should not give any medicines name”
- Fertility signs log (`tile-ttc-signs`): “a daily temperature and strip log adds worry..not every one use it”
- Pregnancy week by week (`tile-pregnancy`): “It opens the same page as "Check-ups and tests".”
- My pregnancy logs (`tile-preg-logs`): “pregnancy card already holds the check-up numbers.”
- My ASHA or ANM (`tile-asha`)
- Free doctor and care (`tile-access-doctor`)
- Money and free care in pregnancy (`tile-access-schemes-preg`)
- Schemes after the birth (`tile-access-schemes-post`): “Not neccessary”
- Grief and your feelings (`tile-loss-grief`): “Not required...indian audience is differently built”
- STI tests: free and private (`tile-intimate-sti`): “Not required”
- Violence and your safety (`tile-intimate-safety`): “Not required”
- PMOS: food, yoga and moves (`tile-plan-pmos`): “It is My PMOS plan again”
- Should I get this checked? (`tile-selfcheck`): “already present”
- Endometriosis pain diary (`tile-cond-endo`): “The Diary and My period plan already log her pain each day”
- Anaemia and heavy periods (`tile-cond-anaemia`): “Already in My period plan's heavy-periods chapters”
- Before a hysterectomy (`tile-cond-hyst`): “Not required-excess information”
- Your changing body (`tile-teen-puberty`): “Not required-”
- Feelings, friends and safety (`tile-teen-mind`): “Not required”
- Free help for girls (`tile-teen-services`): “Not required”
- My midlife picture (`tile-midlife`): “her diary already show it.”
- Weekly symptom diary (`tile-meno-diary`): “Diary log the same symptoms”
- Govt. services (`tile-access-free`): “Not required”
- 21 days of small steps (`tile-journey`): “The 12-week plans replaced it.”
- My plate (`tile-plan-plate`): “My food already shows her plate.”
- My body (`tile-plan-body`): “It is in the PMOS plan's tool; keep it there only.”
- Reminders (`tile-tools-reminders`): “Reminders already lists every reminder.”
- Care near me (`tile-access-care`): “Not required”
- Government schemes for you (`tile-access-schemes`): “Not required”
- Do it online: government services (`tile-access-online`): “Not required”
- Summary for my doctor (`tile-tools-summary`): “The Diary's "Report for my doctor" does the same job.”
- Doctor's view (preview) (`tile-docportal`): “NOt required”

**Learn library**

- Who treats what: Qura doctor or gynaecologist? (`learn-who-treats-what`): “Content change in overall app”
- Why no app can name your fertile day (`learn-why-no-app-can-name-your-fertile-day`): “not required”
- After a pregnancy loss: care and support (`learn-after-a-pregnancy-loss-care-and-support`): “not required”
- Pregnant? Register before 12 weeks (`learn-register-by-12-weeks`): “not required”
- What the government gives you, free, and who to ask (`learn-government-support-schemes`): “not required”
- If you did not want the sex: help that is free, today (`learn-did-not-want-the-sex`): “not required”
- Mood and your cycle: what is usual, and when to ask for help (`learn-mood-and-the-cycle`): “not required”
- Talking to family about periods and health (`learn-talking-to-family`): “not required”
- Helplines: who to call, and what each one does (`learn-helplines-directory`): “not required”
- Free government health services near you (`learn-free-government-services`): “not required”
- Seeing a gynaecologist at a government hospital (`learn-see-gynaecologist-government-hospital`): “not required”
- Reading a prescription and asking about tests (`learn-reading-prescription-tests`): “not required”

**Help and safety**

- "Call 112 now" card (`help-112`): “change in overall app- first number and priority will be for- 1. Go to nearby doctor or talk to doctor.”
- Private help: violence, abortion and STI pages (`help-private`): “not required”
- Tele-MANAS 14416 (`help-telemanas`): “not required”
- Danger signs typed in search (`help-search`): “not required”
- Tell a person (`help-tell`): “not required”
- Quick exit on the violence pages (`help-exit`): “not required”

**Me, privacy and account**

- Shared phone (`me-shared`)
- No screenshots on private screens (`me-capture`)

## 5. Every Amend, with the doctors' notes (as written)

**Joining and sign-up**

- Girls under 18 get no diary (`join-under18`): “Girls get their periods from 14-15 years age”
- Help while she joins (`join-help`): “not needed from the first screen”

**Today**

- Cycle card: cycle day, days to her next period, likely dates (`today-cycle`): “expected periods , ovulation, fertile window, expected fertility should be visible along with usual and likely next”
- A petal for your garden (`today-petal`): “I want to keep these petals but improve on its purpose usability and it needs more work”
- Help button on every screen (`today-help`): “It should be only on Home screen not every screen”

**Diary**

- Calendar with its key (`diary-calendar`): “expected periods , ovulation, fertile window, expected fertility should be visible along with usual and likely next”

**Plans: what every plan does**

- Plan picker: "What do you want to work on?" (`plan-picker`): “Show her stage's plans once- dont repeat this question again...it should be asked before starting and making personalised plan for her. not twice”
- "Your plan is ready" (the reveal) (`plan-reveal`): “Three or four screens before day 1 is long; one screen with her steps and Start is enough.”
- After the check-in (`plan-feedback`): “Keep today's count and tomorrow's steps; drop the lines she has already read.”
- Pause for a week, or Stop my plan (`plan-pause`): “This is good but it will be better if on a day skipped we send a notification asking the same, users by themselves might not discover this”

**My PMOS plan**

- My PMOS plan (12 weeks) (`pmos-plan`): “in movements- walk 10 mins -mention'' post meals example -10min walk after lunch and dinnner'' and a 30-45min brisk according to her schedule either in morning/evening etc”
- Bedtime from day 4, with tonight's wind-down (`pmos-bed`): “1. In bedtime we can give option for meditation before sleep also.”

**Getting ready for a baby**

- Getting ready for a baby (12 weeks) (`ttc-plan`): “regarding any medicines suggestion a note should be visible-'' after consulting with doctor or after doctor's prescription or after doctor's permission '' Like for folic acid tablets..taken with doctor's guidance”
- My folic acid tablet (`ttc-folic`): “here also-regarding any medicines suggestion a note should be visible-'' To take folic acid consult with doctor or after doctor's prescription or after doctor's permission '' Like for folic acid tablets..taken with doctor's guidance.”
- The before-pregnancy checklist (`ttc-prep`)
- His part (`ttc-his`): “ShouldNOTE: The messaging should clearly highlight why preconception care is equally important for him (the male partner). This includes pre-pregnancy health assessments, recommended tests, dietary changes and lifestyle improvements for both partners. The key message should be that a healthy pregnancy is a shared responsibility, and the man's health plays an equally important role in achieving a healthy pregnancy. be visible why it is important for 'him' as well -before-pregnancy tests, diet and lifestyle improvement for HIM or partner for or to achieve healthy pregnancy- thought is to convey the message is that partner's health is equally important to achieve pregnancy”
- Week 4 · Tests before pregnancy (`ch-ttcl-w4`): “Should mention- with doctor's guidance or consult with doctor before self doing any tests.”
- Week 5 · Fertile days, without the stress (`ch-ttcl-w5`): “We can add in same screen-ovulation window or ovulation test during these days to increase chances of fertility. How to do it or when-consult doctor or just give 5 step guideline”
- Week 10 · Sleep, and pressure from others (`ch-ttcl-w10`): “1. for this pressure from others- keep the same answer (best answer is already written) say in more simple language or we can add one more line that you should never take stress for what others have to say. 2. In bedtime we can give option for meditation before sleep”

**My recovery plan (after a birth)**

- My recovery plan (to the first birthday) (`post-plan`): “Title "My recovery plan" -should be postpartum recovery/ journey”
- Pelvic floor squeezes (`post-pf`): “Instead of word 'squeezes' use exercises or Pelvic floor squeezes exercises (kegels) as  squeezes is lesser known term for many”

**My midlife plan**

- My midlife plan: "Cool, calm and strong" (`meno-plan`): “Title should be Menopause Transition and Menopause if its  same for both the stages”
- A calcium food 3 days a week (`meno-ca`): “Can add tile-after consulting doctor , can consume supplements like Vitamin D and Calcium, Ashwagandha or multivitamin.”
- Before 40: no plan until her doctor has seen her (`meno-poi`): “keep see doctor as an advise but let her start a plan as healthy habits”
- Night sweats (`ch-mid-h4`): “In second tile after sipping water go back to sleep after saying "it will pass. i can rest" if unable to sleep then she should try- some sleep sounds like (rain, flowing river, birds, wind etc) , nature sound, sleep meditation. ADD THIS ON SAME SCREEN NOT ANOTHER WINDOW> JUST VISiIBLE BELOW SECOND TILE”

**My period plan**

- My period plan (`per-plan`): “Remove the doctor name. Rephrase the content”
- Her period kit and "Pain today?" (`per-kit`): “Title- 'Periods kit' need to change- what do you mean by period kit”
- Relax, a few minutes (`per-relax`): “remove ' with Dr. Megha' instead we can say- Slow breaths or yoga nidra at bedtime. Or w-e can add -sleep meditation or listen to nature sounds, sleep sounds.”
- Pain · Telling your family (`ch-per-p8`): “Share one "Telling your family" chapter between the pain and heavy tracks. Remove 2. TILE  ''if someone at home hurts you or scares you etc line- call 112 call 118 ""”
- Heavy periods · Managing a heavy day (`ch-per-h6`): “Remove the cloth option as cloth usage is unhygienic, dirty not recommended . Remove cloth from all points”
- Heavy periods · Energy and moving with low Hb (`ch-per-h7`): “Instead of ''call 112- write - go to a doctor or visit a doctor''”
- PMS · Catch the thought (`ch-per-m5`): “ADD- Try engaging yourself in activities that help divert your mind, such as gardening, journaling, reading books, connecting with friends, or pursuing any other hobbies or activities you enjoy.”
- PMS · People around you (`ch-per-m6`): “ADD- try connecting with doctor or any friend”
- PMS · When anger flares (`ch-per-m7`): “Remove 3rd tile.”
- PMS · When to get more help (`ch-per-m11`): “Remove the tele manas 14416 or helpline number. Add either support from friends and family or cousins. Talk communicate, distract mind, do what you loves the most, engage into activities, talk a walk outside etc”

**My pelvic floor plan**

- 112 line: sudden loss of bladder or bowel control with numbness, weak legs or bad back pain (`pf-112`): “Add - go to nearest hospital or to doctor”
- When to see a doctor (`ch-pfc-f10`): “2. To tell someone in home or go to nearest hospital or to doctor”

**Moves, Wind down and Feel better now**

- Sun salutation, slow (`mv-sun`): “We can add this for -Under Morning session or under title- Surya namaskar/ Breathing work”
- Slow breaths (`wd-breaths`): “Remove name Dr. Megha- instead write ' Trainer ' . Change everywhere -where the doctor's name is used during the yoga or breath work..write 'Trainer' instead”
- Bhramari (humming breath) (`wd-bhramari`): “Remove name Dr. Megha- instead write ' Trainer '”
- For poor sleep (`rf-sleep`): “Add 1. Sleep sounds (flowing rive, rain, windchimes, etc) 2. Sleep meditation. Keep mantra or chanting. 3. cool temp of room dim light -warm lights cozy room environment”

**Explore: tools and guides**

- Contraception (`tile-contra`): “First line or NOTE should be clearly shown -'' TAKEN UNDER DOCTOR'S GUIDANCE / FIRST CONSULT DOCTOR/ ONLY UNDER DOCTOR'S GUIDANCE. DO NOT SELF MEDICATE or ON YOUE OWN WITHOUT ASKING DOCTOR FIRST'' before giving ay medical advise or giving medicines name or any medical procedures.”
- Safe, legal abortion (`tile-pregtest-abortion`): “Here also note should be- ONLY UNDER DOCTOR'S GUIDANCE. DO NOT SELF MEDICATE or ON YOUE OWN WITHOUT ASKING DOCTOR FIRST”
- Fertile days estimate (`tile-fertile`): “Show it only to a woman trying for a baby, and never as safe days.”
- Breastfeeding (`tile-post-feed`): “Keep the breastfeeding basic guide (latch, soreness, supply);drop the rest”
- Check-ups and baby's vaccines (`tile-post-checks`): “1. Keep her own 6-week check, iron and calcium and required things FIRST then-  the baby's vaccines section (keep it short) ,as it can be tackled by her doctor also.”
- Fibroids, cysts and polyps (`tile-cond-fibroids`): “Remove - call 112- instead write GO TO A DOCTOR or nearest hospital”
- All guides for girls (`tile-teen`): “Sakhi is for women 18 and over: shrink the girls' guides to one page (first period,  plus the parents' guide. REMOVE safety, free help)”
- My garden (`tile-joy`): “Keep one- either My garden or week dots that show progress.”
- Talk to a Qura doctor (`tile-ask`): “Change content for ''talk to doctor''”

**Learn library**

- Folic acid and the tests a doctor orders before pregnancy (`learn-folic-acid-and-tests-before-pregnancy`): “Here also ad one line. Start after consulting with doctor or with doctor's permission. Thought us to educate what has to be done and what is generally required so she she should be aware. BUT do not self medicate”
- Pads, cloth, cups and tampons: safe use, and the Rs 1 pad (`learn-pads-cloth-cups-tampons`): “remove section/line cheap pad exit- the Rs 1 pad. ONLY keep safety use section of pads, cups, tampons”
- How Qura helps, and where it stops (`learn-how-qura-helps`): “change content of this section. also in overall app Qura doctors can check any case and recommend a gynaecologist or have in house gynaecologist as BAMS doctors have nari chikitsa education and government allow them to practise equivalent to mbbs doctors”

**Help and safety**

- Ask a Qura doctor (`help-ask`): “write - Ask a  doctor. remove word qura”

**Reminders**

- Folic acid tablet (9 pm) (`rem-folic`): “Show only to those who chose option ' trying for baby'”
- Contraception reminders (`rem-contra`): “Show only to those who just got pregnant...or stage was changed from trying to got pregnant now want Contraception”

**Me, privacy and account**

- Language and read-aloud (`me-lang`): “keep hindi and english”

## 6. Defer

**Today**

- Today's chance of pregnancy and fertile days (`today-chance`): “Screenshot didnt show this”

