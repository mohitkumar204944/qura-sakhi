# My plan with less clutter, and sleep and calm from Indian practice (26 Oct 2026)

Mohit, 26 Oct: "I think there is scope for optimization on my plan some information can be collapsable so the page doesnt
look cluttered and We can add more value by having some meditation advise and music for helping patient with sleep ... in
meditation advise we can suggest chanting, Gayatri mantra, hanuman chalisa etc. from indian tradition and 4-5 best sleep
meditation tracks user can play".

It was measured on Version 39.18 at 360 × 780.

## Built (26 Oct)

Mohit: "We dont need to record mantras as audio files just advise you can chant these or any devotional mantra you like to
chant for soothing sleep rest i will proceed with your recommendations".

- **Version 39.19, M1 to M5:** My plan folds after week 1 (MODULE_API section 62).
  - Week 2: 3,580 px to 2,248 px (2.9 screens; the simulation said 2.6).
  - Week 6: 5.0 screens to 3.3.
- **Version 39.20:** the sleep routine's last step is "A mantra or prayer, if you like". It names Om, the Gayatri mantra, the
  Hanuman Chalisa, or any prayer or devotional mantra she likes. It is advice only, with no recordings (MODULE_API section 63).
- **Version 39.21, Wind down** (Mohit: "build it into the app"; MODULE_API section 64):
  - The sessions changed from the plan above.
  - Dr. Megha's cloned voice guides slow breaths (S1), Bhramari with Mohit's real hum recording (S2) and yoga nidra (S3), in
    English and Hindi.
  - Mohit swapped calm music and rain (S4, S5) for three CC0 Freesound recordings: a singing bowl with waves, Wandering and
    Dunes. They play with a 15, 30 or 45 minute timer that fades out.
  - Each session moves with an animation.
  - The relief routines speak in her voice.
  - A native player keeps it going with the screen off.
  - There is no Om track: Mohit's three picks replaced it.
- **Tests:** `test/planfold.mjs` and `test/calm.mjs`.

## The short answer

- **My plan: yes, fold it.** The page is 4.6 screens long (5.0 by week 6), but she only acts on 2 of its 10 parts each
  day. I folded the parts she reads once in a simulation on the real page, and it went from 3,580 px to 2,062 px (2.6
  screens). All 4 steps fit on the first screen.
- **Sleep and calm: yes, with one change of shape.**
  - The evidence supports calm music, slow breathing, Bhramari, yoga nidra, and repeating a prayer or mantra *of her own
    choosing*.
  - I found no trial of the Gayatri mantra or the Hanuman Chalisa themselves, and Sakhi serves women of every faith.
  - So Indian practices that aren't tied to one faith (Bhramari, yoga nidra, Om) should be built in. A prayer or mantra
    should be her own choice: the Gayatri mantra and the Hanuman Chalisa are among the examples, next to other faiths'.

## 1. My plan

### What's there now (a cycle plan in week 2)

| Part | Height | Words | She uses it |
|---|---|---|---|
| How your plan works | 165 px | 29 | once |
| Your 4 daily steps (each with its reason) | 829 px | 119 | every day (the reasons once) |
| This week | 435 px | 51 | every day |
| My garden | 82 px | 14 | now and then |
| What consistency brings (timeline and her signs) | 641 px | 83 | once, then now and then |
| Your 12 weeks | 440 px | 49 | once a week |
| My plate, Yoga and moves, My body, My progress | 232 px | 13 | now and then |
| Your care team | 318 px | 32 | when needed |
| Plan settings, footnote | 139 px | 28 | rarely |
| **Total** | **3,580 px (4.6 screens)** | **431** | |

By week 6, the weekly review and the 4-week check bring it to 3,874 px (5.0 screens).

### What to fold (after her first week; week 1 keeps everything open)

| | Part | Folded, it shows | Opens to |
|---|---|---|---|
| M1 | How your plan works | one row: "How your plan works" | the same 4 columns |
| M2 | Each step's reason and "How to do it" | the step and its one line ("8 min") | "Why?", the same sheet as Today |
| M3 | What consistency brings | its title and her stage now: "Weeks 1 to 4: many women feel more energy and sleep better." | the timeline and her own signs |
| M4 | Your 12 weeks | last week and this week | all 12 weeks |
| M5 | Your care team | one row: "Your care team · doctors, report, help" | the 4 rows |

Her steps, This week, the garden, the 4 tiles and Plan settings stay as they are. Help stays in the top bar on every page.

**Measured in a simulation on the real page:** 3,580 px down to 2,062 px (4.6 screens down to 2.6), with all 4 steps on the
first screen.

**Why this is right:**
- Showing the main parts and putting the rest one tap away helps people learn, work faster and make fewer mistakes. What
  is used often must stay visible (Nielsen Norman Group, progressive disclosure).
- Every extra piece of information competes with the parts that matter (Nielsen's heuristic 8, "Aesthetic and minimalist
  design").
- **The risk:** folded content is seen less. So only read-once parts fold, each keeps a one-line summary that still says
  the key fact, and nothing folds in her first week.

**Watch in the field test:** opens of each folded row, "Why?" opens from My plan, and time on the page.

## 2. Sleep and calm

### What Sakhi has today

- **Relief's "For poor sleep"**, a 3-minute routine: lie down, long breaths out (in for 4, out for 6), let go part by part,
  and park your thoughts. It adds "still awake after 20 minutes? get up until sleepy".
- **"When you feel anxious or low"**, also 3 minutes.
- Both are read aloud by the phone's voice, and both are doctor-verified content.
- The plan's bedtime step already links to "For poor sleep".

What's missing:
- something that keeps playing while she falls asleep, with the screen off;
- a calm human voice in Hindi and English;
- Indian practices;
- music.

### The evidence

| Practice | What was found | How strong |
|---|---|---|
| Calm music at bedtime | Cochrane 2022, 13 trials with 1,007 people: listening to music may have a moderate to large benefit on sleep quality for people with insomnia symptoms | Moderate (the best here) |
| Yoga nidra | A randomised trial of 150 women with irregular periods (KGMU, Lucknow): anxiety and depression fell over 6 months | Promising: one group, small |
| Mindfulness with PCOS | A randomised trial (8 weeks) found less stress, anxiety and depression; a review of 14 studies agrees | Promising |
| Bhramari (humming bee breath) | A review of 46 studies (6 randomised) found lower stress and anxiety and better sleep quality | Early: mostly small studies |
| Om chanting | A review found positive effects, but with weak study designs | Early |
| Chanting and breathwork in general | A review of 15 randomised trials gave moderate to strong support for less anxiety, depression and stress | Moderate, though the trials vary in quality |
| A prayer, mantra or word repeated quietly | Benson's relaxation response: repeat a word, sound, prayer or phrase of your choosing; Harvard's guidance says "a short prayer of your choosing", rooted in your belief | An established method |
| The Gayatri mantra or Hanuman Chalisa themselves | No trials found | None |

**So:** the calm comes from repeating, breathing slowly and listening to calm sound. It doesn't come from one particular
text. That lets Sakhi support Gayatri mantra and Hanuman Chalisa for women who pray with them, without claiming more than the
evidence shows, and without leaving out a Muslim, Christian or Sikh woman.

### Recommendation: "Wind down", 5 sessions plus her own prayer

| | Session | Length | Why this one |
|---|---|---|---|
| S1 | Long breaths out (the reviewed routine, as audio) | 5 min | already doctor-verified; slow breathing |
| S2 | Bhramari, the humming bee breath | 5 min | Indian practice, no faith needed |
| S3 | Yoga nidra, lying down | 15 min | Indian practice; the trial in women with period problems |
| S4 | Calm music (instrumental, for example bansuri), with a sleep timer that fades out | 30 min | the strongest evidence |
| S5 | Rain | 30 min | calm sound for women who don't want music |
| + | "Your prayer or mantra": a quiet 10-minute timer with a soft bell at the end | 10 min | the relaxation response |

**"Your prayer or mantra":**
- **What she reads:** "Repeat a prayer, mantra or word you know, softly or in your mind. When thoughts come, gently go back to
  it."
- **Examples:** Om, the Gayatri mantra, the Hanuman Chalisa, Waheguru, a verse from your faith, or a calm word.
- **What Sakhi doesn't do:**
  - host recordings of religious texts (the texts are public domain, but recordings are not);
  - claim a health effect for any one of them.

**Where it shows:**
- My plan's bedtime step, which already links to the sleep routine;
- Relief's "For poor sleep";
- the calm week (PMS), midlife sleep and hot flushes, and after a birth (short sessions, for night feeds).

### How to build it within Sakhi's rules

- **Offline, inside the app.** Nothing streams, so the diary and her listening stay on the phone. Guided voice is about 25
  minutes per language at speech quality, about 4.5 MB each. Music and rain are 5-minute loops, about 3.5 MB. The app goes
  from 5.3 MB to about 18 MB, under the 30 MB ceiling.
- **It plays with the screen off.** A web page inside the app pauses when the phone locks, so this needs a small native
  player in the Android wrapper, with lock-screen controls. On a shared phone, the lock screen says only "Sakhi".
- **Voices:** recorded by Dr. Megha or a trained teacher on the team, in Hindi and English, so there's no new spend. The
  phone's own voice is too mechanical for sleep audio; it stays for the 3-minute routines.
- **Music:** recorded by us, or a free licence checked file by file. Both the composition and the recording must be free (CC0
  or public domain). Avoid Pixabay, which is unclear for apps, and any commercial devotional recordings.
- **Doctor review:**
  - the scripts and the words ("may help you relax and fall asleep", no promises);
  - who should skip Bhramari;
  - no breath-holding in pregnancy (none of these use it);
  - "not while driving".

**Watch in the field test:**
- sessions started and finished;
- which ones she replays;
- her "Poor sleep" days in the Diary;
- whether she keeps the bedtime step.

## Build order

| Version | What | Size |
|---|---|---|
| 39.19 | My plan folded (M1 to M5) | Small. Tests: daily, follow, carryon, pmosplan |
| 39.20 | "Wind down": the player in the Android wrapper, 5 sessions, "Your prayer or mantra" | Medium. Needs the recordings first |

## Decisions for Mohit

1. **Fold My plan's read-once parts after week 1** (recommended)?
2. **Sleep:** the 5 sessions plus "Your prayer or mantra" with examples from several faiths (recommended), or recordings
   of the Gayatri mantra and the Hanuman Chalisa as tracks?
3. **Who records** the Hindi and English voice, and the music: our own, or CC0 files checked one by one?
4. **Order:** My plan first (39.19), then the sleep audio (39.20)?

## Sources

- Nielsen Norman Group, progressive disclosure: https://www.nngroup.com/videos/progressive-disclosure/
- Nielsen, 10 usability heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Jespersen K. V. et al. (2022), Music for insomnia in adults, Cochrane Database Syst Rev, CD010459.pub3:
  https://www.cochrane.org/podcasts/10.1002/14651858.CD010459.pub3 and https://health.au.dk/en/display/artikel/music-helps-combat-insomnia
- Rani K. et al. (2011), Impact of Yoga Nidra on psychological general wellbeing in patients with menstrual irregularities: a
  randomized controlled trial, Int J Yoga: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3099097/
- Stefanaki C. et al. (2015), mindfulness stress management in women with PCOS, Stress: https://pubmed.ncbi.nlm.nih.gov/25287137/
- Meditation and mindfulness in PCOS, a scoping review: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11137171/
- Bhramari pranayama, a review of 46 experimental studies (2023), Indian Journal of Physiology and Pharmacology:
  https://ijpp.com/?p=4888
- Thanneeru et al. (2022), Om chanting, a literature review, Manipal Journal of Medical Sciences:
  https://impressions.manipal.edu/mjms/vol7/iss2/5
- A systematic review of randomised trials of chanting and breathwork (2022), Journal of Spirituality in Mental Health:
  https://research.usq.edu.au/item/zz777/identifying-alternative-mental-health-interventions-a-systematic-review-of-randomized-controlled-trials-of-chanting-and-breathwork
- Benson's relaxation response (Harvard Health): https://www.health.harvard.edu/heart-health/meditation-and-a-relaxation-technique-to-lower-blood-pressure
  and https://www.health.harvard.edu/blog/a-once-and-future-meditator-tries-the-relaxation-response-for-stress-201110143598
- Android media sessions and foreground playback: https://developer.android.com/media/legacy/audio/mediasession
