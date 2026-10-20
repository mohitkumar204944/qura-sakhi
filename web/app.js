/* Qura Sakhi prototype. Vanilla JS, no build. State lives only in this browser. */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = (n) => String(n).padStart(2, '0');
  const toISO = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const fromISO = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const diffDays = (a, b) => Math.round((fromISO(toISO(b)) - fromISO(toISO(a))) / 86400000);
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const monthKey = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  /* ---------- strings ---------- */
  const STR = {
    en: {
      tagline: 'free · Hindi · English', home: 'Home', diary: 'Diary', notes: 'Notes', learn: 'Learn', help: 'Help', me: 'Me',
      welcome_h: 'Your cycle, your body, in your language', welcome_p: 'A free diary and plain-language help for Indian women. No ads, no scores, nothing sold. A Qura doctor is behind it when you want one.',
      start: 'Start my diary', try_sample: 'Explore with sample data', sample_priya: 'Priya, 27 · irregular cycles', sample_asha: 'Asha, 31 · regular cycles', browse_only: 'Just read the help pages',
      step: 'Step', of: 'of', dob_h: 'When were you born?', dob_p: 'The diary is for women 18 and over. We ask this first and keep it only on your profile.', day: 'DD', month: 'MM', year: 'YYYY',
      dob_note: 'Under 18? Nothing is saved. You will see our free safety guide instead.', continue: 'Continue', back: 'Back',
      under18_h: 'This diary is for women 18 and over', under18_p: 'Nothing you typed was saved. The safety guide and the Learn pages are free for everyone. Childline 1098 is there for anyone under 18.', ask_teen_h: 'Talking to a doctor', ask_teen_p: 'Sakhi books calls for women 18 and over. If you are under 18, go to a doctor with a parent, a guardian or an adult you trust. Childline 1098 is free, day and night.',
      lp_h: 'When did your last period start?', today_b: 'Today', yesterday: 'Yesterday', pick: 'Pick a date', dont_remember: "Don't remember",
      sit_h: 'Right now, are you…', sit_p: 'These change what the diary counts. You can update them any time on the Me page.', pregnant: 'Pregnant', bf: 'Breastfeeding', hormones: 'On hormone medicine', none: 'None of these',
      consent_h: 'Before we start, three things', consent_1: 'Your diary and safety entries can be read by Qura\'s care team: a Qura doctor, and a Qura coordinator when you tap "Tell a person".',
      consent_2: 'No computer program judges your health. No score, no diagnosis.', consent_3: 'You can delete everything in one tap. Nothing goes to ad companies.',
      consent_yes: 'Yes, start my diary', consent_no: 'Not now', listen: 'Listen in Dr. Megha\'s voice · 30 sec', notice: 'Notice: who stores what, for how long',
      cycle_day: 'Cycle day', period_day: 'Period · day', next_likely: 'Your next period is likely', past_range: '{n} days past your likely range', last_gaps: 'Your last gaps:', days: 'days', usual_gap: 'A usual gap is 21–35 days.', usual_gap_teen: 'A usual gap is 21–45 days in the first years.',
      no_contra: 'This range is not a way to avoid pregnancy and shows no safe days.', gap_mode_note: 'When gaps change a lot we show counts, not a guessed date.', first_log: 'Log the day your last period started. Sakhi then shows your cycle day, your gaps, and when your next period is likely.',
      last6: 'Last 6 gaps (days)', band_note: 'Shaded band: usual gap, same for everyone', trends: 'Trends', period_started: 'Period started', ended: 'Ended', spotting: 'Spotting',
      checkin_t: 'check-in', checkin_sub: '8 taps, about 1 minute. Once a month.', checkin_done: 'Done this month. Thank you.', start_b: 'Start', edit: 'Edit',
      safety: 'Safety guide', safety_sub: 'When to see a doctor. Same for everyone.', tell: 'Tell a person', tell_sub: 'A person replies within 1 working day.',
      qura_h: 'Talk to a Qura doctor', qura_p: 'Free 20-minute call with a BAMS doctor. Bring your diary; she sees it if you share it.', qura_b: 'Book a free call',
      doc_sees: 'Your Qura doctor sees this at your next visit if you share it. For anything urgent, call 112.',
      r6_h: '90+ days since your last period', r6_p: 'If you could be pregnant, a home test is the first step. Then see a doctor. For PMOS, regular periods protect the womb lining.',
      late_h: 'Past the expected range', late_p: 'A week or more late and you could be pregnant? A home test is the first step.',
      calendar: 'Calendar', bleeding: 'Bleeding', likely_range: 'Likely range, never one day', today_l: 'Today', cal_note: 'Tap a day to log. No fertile or safe days are shown.',
      stats: 'Your numbers', stats_from: 'From your last {n} counted gaps (guessed dates, hormones and pregnancy left out).', stats_from_1: 'From your last counted gap (guessed dates, hormones and pregnancy left out).', avg_gap: 'Average gap', shortest: 'Shortest gap', longest: 'Longest gap', bleed_days: 'Bleeding days (avg)', cycles_logged: 'Periods logged', spread6: 'Spread of last 6',
      no_data: 'Log two period starts to see the gap between them.', gaps12: 'Last 12 gaps (days)', band_label: 'Band: 21–35 days, the same for everyone. Hatched: not counted (hormones, pregnancy).',
      log_h: 'Log', what_log: 'What happened?', on_date: 'On which day?', flow_h: 'Flow and pain (optional)', pads: 'Pads today', pads_1: '1–2', pads_2: '3–5', pads_3: '6 or more', pads_4: 'Soaked one every 1–2 hours',
      clots: 'Clots', clots_0: 'None', clots_1: 'Small', clots_2: '₹10 coin or bigger', leaked: 'Leaked through clothes', twopads: 'Needed two pads', pain: 'Pain', pain_0: 'No pain', pain_1: 'Mild', pain_2: 'Needed a painkiller', pain_3: "Couldn't do my day",
      daily_h: 'Anything else today? (optional)', d_cramps: 'Cramps', d_headache: 'Headache', d_bloat: 'Bloating', d_mood: 'Low mood', d_tired: 'Tired', d_sleep: 'Poor sleep',
      r2: 'Bleeding more than 8 days, or soaking a pad every 1–2 hours: see a doctor this week and ask for a haemoglobin (blood count) test; it is free at a government hospital. If you also feel dizzy or breathless: see a doctor today, or call 112.',
      save: 'Save', saved: 'Noted.', cancel: 'Cancel', delete_entry: 'Delete this entry',
      cadence: 'A doctor at Qura reads diaries of patients in care once a week. It is not live. Heavy bleeding with dizziness, one-sided pain with fainting, or any emergency: call 112 now. Thoughts of harming yourself: 14416 or 112.',
      ci_h: 'check-in', ci_p: 'Tap what you noticed this month. About 1 minute.', ci_hair: 'Coarse dark hair on lip, chin, chest, belly or back', ci_removal: 'Remove face or body hair weekly or more', ci_acne: 'Pimples or acne', ci_thin: 'Scalp hair thinning',
      ci_neck: 'Dark velvety patches on neck or underarms', ci_heavy: 'Heavy flow or clots', ci_mood: 'Low mood or anxiety most days', ci_none: 'None of these', ci_hot: 'Hot flushes or night sweats', hot_0: 'None', hot_1: 'Mild', hot_2: 'Moderate', hot_3: 'Woke me at night',
      ci_more: 'More (personal care)', ci_disch: 'Unusual discharge', ci_itch: 'Itching', ci_burn: 'Burning when peeing', ci_sexpain: 'Pain during sex', ci_aftersex: 'Bleeding after sex',
      ci_note: 'Anything for your doctor?', ci_note_ph: 'Type a note (read by a person within 1 working day)', ci_save: 'Save check-in', ci_thanks: 'Saved. Thank you. Nothing is scored here.',
      learn_h: 'Learn', learn_p: 'Short, doctor-reviewed answers. Read in Hindi or English.', search: 'Search topics', all: 'All', loading: 'The library is being written. Check back soon.', read: 'Read',
      see_doctor: 'When to see a doctor', qura_can: 'How Qura can help', ask_qura: 'Ask a Qura doctor about this', sources: 'Sources', draft: 'Draft for doctor review', no_results: 'No matches. Try another word.',
      help_h: 'Help and safety', call_now: 'Call 112 now if', today_if: 'See a doctor today if', weeks2: 'See a gynaecologist within about 2 weeks if', week_if: 'This week if', under18: 'Under 18', mood: 'Mood', after35: 'After 35',
      s1a: 'Period late or a positive test, plus one-sided lower belly pain, shoulder-tip pain, dizziness or fainting', s1b: 'Soaking a pad every 1–2 hours and feeling dizzy or breathless', s1c: 'In pregnancy: bleeding, fits, severe headache with blurred vision, fluid leaking, baby moving less',
      s2a: 'Soaking a pad every 1–2 hours (ask for a haemoglobin test; free at a government hospital)', s2b: 'Fever with heavy bleeding or severe belly pain', s2c: 'Burning when peeing with fever, shivering or back pain under the ribs',
      s3a: 'Any bleeding 12 months or more after your last period. Most causes aren\'t serious, but this always needs checking', s3b: 'No period for 90+ days (not pregnant, breastfeeding or on hormones): pregnancy test first, then a doctor', s3c: 'Hair growth worsening over months, or a deepening voice', s3d: 'Milky discharge from the nipples when not breastfeeding',
      s4a: 'Bleeding more than 8 days, clots the size of a ₹10 coin, or bleeding through clothes', s4b: 'Period pain that stops your day, or pain during sex: take this diary with you', s4c: 'Discharge that changed colour or smell, itching, or burning when peeing',
      s5a: 'No period by 15, or no breast development by 13: see a doctor with a parent', s5b: 'Childline 1098 for anyone under 18', s6a: 'Low mood most days for two weeks or more: Tele-MANAS 14416, free, any time', s6b: 'Thoughts of harming yourself: call 14416 or 112 now',
      helplines: 'Helplines, free', copy: 'Copy', copied: 'Copied', same_for_all: 'Same text for everyone. Not a diagnosis. Based on official health guidance, with sources.',
      tell_h: 'Tell a person', tell_p: 'A person at Qura reads this on working days and replies within 1 working day (Mon–Sat). This is not live. For an emergency call 112. For thoughts of harming yourself call 14416 or 112.',
      tell_about: 'What is it about?', t_bleed: 'Bleeding', t_pain: 'Pain', t_missed: 'Missed period', t_mood: 'Mood', t_other: 'Something else', tell_msg: 'Your message', tell_send: 'Send to a person', tell_ok: 'Received. Reference', tell_ok2: 'In the live app a coordinator reads this. In this prototype it stays on your phone.',
      ask_h: 'Talk to a Qura doctor', ask_p: 'A free 20-minute video or phone call with a Qura doctor (BAMS). She can order tests and help with cycles, weight, sleep and diet. For hormone medicines like the pill, HRT or letrozole you need an MBBS gynaecologist; Qura refers.',
      name: 'Your name (optional)', phone: 'Phone number', best_time: 'Best time to call', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', topic: 'What is it about?', share_diary: 'Share my diary with the doctor before the call',
      ask_send: 'Request a free call', ask_ok: 'Request saved. Reference', ask_ok2: 'Prototype: nothing was sent. In the live app Qura calls you back. You can also book directly:', book_link: 'Book at quranutrition.com',
      me_h: 'Me', situation: 'My situation', sit_p2: 'You set these yourself. The diary never guesses them from your entries.', since: 'since', pregnant_d: 'We stop predicting periods while you are pregnant. Tell your doctor about any medicines you take.', bf_d: 'Periods often stay away while you breastfeed, so we do not predict them for a year after the birth.',
      horm_d: 'Pill, hormonal IUD, injection, HRT or steroids. These change your cycle, so those months are left out of your averages.', pcos: 'Diagnosed PMOS (PCOS)', pcos_d: 'Your doctor sees this. We will not use your cycle gaps to judge menopause.', thyroid: 'Thyroid, endometriosis or fibroids', thyroid_d: 'Your doctor sees this when you share your diary.',
      hyst: 'Hysterectomy or ablation', hyst_d: 'There are no periods to count, so the diary stops counting cycles.', stopped: 'My periods have stopped', stopped_d: 'Home shows menopause care instead of a cycle count.', planning: 'Planning a baby', planning_d: 'Shows the guides for trying for a baby. Tell your doctor about any medicines you take.',
      tools: 'Tools', pattern: 'Pattern check', pattern_d: 'Your entries against patterns doctors look for', fertile: 'Fertile days estimate', fertile_d: 'Only for cycles that vary by 7 days or less', midlife: 'My midlife picture', midlife_d: 'Counts and the timeline doctors use', pregw: 'Pregnancy week by week', pregw_d: 'Counted from your scan date',
      gated: 'Needs approval before launch', lang: 'Language', discretion: 'Discretion', discreet: 'Discreet mode', discreet_d: 'Hides numbers, charts and words like "period" on Home. The Diary tab is called "Notes".', shared: 'Shared-phone mode', shared_d: 'Closes after 10 minutes without a tap, and when you come back to the app. Nothing is deleted.', rest_h: 'Your diary is closed', rest_h_d: 'Notes are closed', rest_p: 'Shared-phone mode closes it after 10 minutes without a tap, and when you come back to the app. Set a PIN on the Me page so only you can open it.', rest_open: 'Open',
      consent_data: 'Consent and my data', c1: 'Diary and safety review', c2: 'One WhatsApp reminder per cycle', c4: 'Share with my Qura doctor', given: 'Given', withdraw: 'Withdraw', give: 'Give', export: 'Show my data', delete_all: 'Delete everything', delete_sure: 'Delete everything now? There is no undo.', yes_delete: 'Yes, delete', deleted: 'Everything was deleted.',
      delete_note: 'Immediate, no undo window, so no one can find it later.', grievance: 'Grievance Officer: [NAME, ADDRESS]', notice_text: 'Your entries stay only on this phone. Qura (Trinaya Wellness LLP) keeps your account details to run your account. The live app will name every processor, the retention period and the Grievance Officer here.',
      pc_h: 'Pattern check', pc_p: 'Compares your own entries with patterns doctors look for. Not a diagnosis.', pc_updated: 'Updated', pc_pmos: 'PMOS (PCOS) pattern', pc_seen: 'Pattern seen', pc_gaps: 'Long gaps seen', pc_hair: 'Hair signs seen', pc_not: 'Not seen', pc_nodata: 'Not enough data',
      pc_detail: 'Long gaps (over 35 days) in {g} of your last {n} cycles; coarse hair in {h} monthly check-ins.', pc_causes: 'Several things cause this: thyroid, high prolactin, stress, weight change, breastfeeding, or PMOS. A doctor usually checks a few blood tests first. About half of women with this pattern turn out not to have PMOS.',
      pc_verdict: "Doctor's verdict", pending: 'Pending review', pc_thy: 'Thyroid-type pattern', pc_heavy: 'Heavy-bleeding pattern', pc_pain: 'Pain pattern (endometriosis-type)', pc_pain_d: 'Pain that stopped your day in {k} of your last {n} periods.', pc_pain_go: 'Should I get this checked?', pc_q2_y: 'Milky discharge from the nipples when you are not pregnant or breastfeeding needs a doctor’s check. A blood test (prolactin) is part of it.', pc_q1: 'Has a doctor already told you that you have PMOS?', pc_q2: 'Any milky discharge from the nipples?', yes: 'Yes', no: 'No',
      pc_rule: 'Rule P3, version 1. Signed by Qura\'s doctors and an independent gynaecologist before launch.', pc_ask: 'Ask my Qura doctor to confirm',
      fe_h: 'Fertile days', fe_p: 'An estimate from dates, not a measurement. Shown only when your cycles vary by 7 days or less.', fe_hidden: 'Hidden for now: your cycles vary by more than 7 days, or you are on hormones, or there are fewer than 3 logged gaps. The Planning page explains why no app can name your day.',
      fe_likely: 'Likely fertile days', fe_egg: 'Egg most likely released around', fe_note: 'Date-based tools get the exact day right in a small minority of cycles. Sex every 2–3 days works as well as timing.', fe_strip: 'Ovulation strip today (optional, stored as data only)', positive: 'Positive', negative: 'Negative', not_taken: 'Not taken',
      fe_strip_note: 'Strips can read positive without egg release, especially with PCOS. We never move your estimate from a strip.', fe_confirm: 'To know you ovulated, confirm it', fe_confirm_p: 'A progesterone blood test about 7 days before your next period, ordered by your doctor, or a home PdG monitor. The diary marks "ovulation confirmed" only from a result.',
      ml_h: 'My midlife picture', ml_p: 'Counts of what you logged, placed on the timeline doctors use. Not a score, not a stage label from us.', ml_where: 'Where you may be', ml_1: 'Before changes', ml_2: 'Early changes', ml_3: 'Late changes', ml_4: 'After periods',
      ml_early: 'Your gaps differed by 7 or more days {n} times in your last 10 cycles. Doctors call this the early part of the transition.', ml_late: 'A gap of 60 days or more at your age is what doctors call the late part of the transition.', ml_none: 'No midlife change shows in your gaps yet.', ml_young: 'You are under 40, so cycle changes are more often about other things. Education only here.',
      ml_pcos_off: 'Cycle-based placing is switched off for PMOS, hormones, hysterectomy or HRT; then only age and symptoms count.', ml_logged: 'What you logged, months out of 6', ml_hot: 'Hot flushes', ml_sleep: 'Poor sleep', ml_mood: 'Low mood', ml_heavy: 'Heavy bleeding', ml_hrt: 'Hot flushes waking you at night, 2 or more times a month? The most effective treatment is hormone therapy, prescribed by an MBBS gynaecologist. Your Qura doctor helps with sleep, diet and movement, and refers you.',
      pw_h: 'About week', pw_p: 'Counted from the due date on your scan report, or from your last period if there is none. "About", because dates differ by a few days. Your antenatal provider\'s count wins.', pw_set: 'Tell Sakhi you are pregnant to use this page.', pw_t1: 'Weeks 1–13', pw_t2: 'Weeks 14–27', pw_t3: 'Weeks 28–40',
      pw_v1: 'Visit 1: before 12 weeks (register, MCP card)', pw_v2: 'Visit 2: 14–26 weeks', pw_v3: 'Visit 3: 28–34 weeks', pw_v4: 'Visit 4: 36 weeks and after', pw_ask: 'Things to ask at your next visit', pw_moves: "Baby's movements", pw_moves_p: 'Most women first feel them between 16 and 24 weeks. Once they are regular, fewer movements than usual means a check the same day, not the next morning.',
      pw_a1: 'Folic acid now if under 12 weeks; iron and folic acid daily from the 4th month', pw_a2: 'Calcium usually starts from 14 weeks; not with the iron tablet', pw_a3: 'Td vaccine: first dose, second 4 weeks later', pw_a4: 'Sugar test at the first visit and again at 24–28 weeks, especially with PMOS; BP every visit', pw_a5: 'Anomaly scan at 18–20 weeks', pw_gov: 'Free doctor-led check on the 9th of every month (PMSMA). Register with your ASHA or ANM.',
      scan_date: 'Scan date (optional)', set: 'Set', lmp: 'First day of last period', after_change: 'If something changes, tell us here', loss: 'The pregnancy ended', loss_p: "We're sorry. You don't have to tell us more. Soaking a pad an hour, fever or severe pain: hospital now (112). A gynaecologist or PHC should check you within a week; tell them your blood group. Tele-MANAS 14416 is there for you.",
      sample_note: 'Sample data is loaded. Entries you add are kept with it. Delete everything on the Me page to start fresh.', why: 'Why am I seeing this?', ok: 'OK', months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], dows: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      ask_saved_topic: 'Added to your call request.', teen_learn: 'Learn pages for teens are education only.',
      care: 'Care', care_h: 'Care for every stage', care_p: 'Guides, trackers and reminders, from your first period to after menopause. Free, in your language.', suggested: 'Suggested for you', search_tools: 'Search guides and tools', no_tools: 'No match. Try another word.',
      sec_periods: 'Periods', sec_contra: 'Contraception', sec_pregtest: 'Missed period and unplanned pregnancy', sec_ttc: 'Trying for a baby', sec_preg: 'Pregnancy', sec_post: 'After birth', sec_loss: 'Pregnancy loss', sec_intimate: 'Intimate health and safety', sec_cond: 'Conditions', sec_screen: 'Screening and check-ups', sec_meno: 'Menopause', sec_teen: 'Girls and families', sec_tools: 'My tools',
      coming_up: 'Coming up', see_all: 'See all', need_diary_h: 'Start your diary to save this', need_diary_p: 'You can read every guide without a diary. Saving entries needs the diary, which stays on this phone in the prototype.',
      more_langs: 'More languages', partly: 'Partly translated in this prototype. The rest shows in English until doctors review the translation.', lang_h: 'Choose your language',
      sample_meera: 'Meera, 29 · 24 weeks pregnant', sample_sunita: 'Sunita, 33 · baby born 3 weeks ago', sample_kamla: 'Kamla, 48 · periods changing', more_samples: 'More sample women',
      all_tools: 'All guides and tools', all_tools_d: 'Contraception, pregnancy, after birth, screening, menopause and more', gated_short: 'Needs approval',
      pp_eyebrow: 'After birth', pp_days: 'days since your baby was born', pp_days_1: 'day since your baby was born', pp_p: 'Periods can come back any time, and you can get pregnant before the first one. When bleeding starts again, log it here.', pp_go: 'Recovery and feeding',
      off_eyebrow: 'Cycle counting is off', off_p_hyst: 'You told us your womb was removed or the lining was treated, so there is no cycle to count.', off_p_stopped: 'You told us your periods have stopped. Any bleeding now needs a check with a doctor, even a little.', off_go: 'Menopause care',
      notes_brand: 'My notes', protolabels: 'Show prototype labels', protolabels_d: 'Turn on for internal demos: shows the Demo profiles (sample women Priya, Asha, Meera, Sunita and Kamla) and the approval tags. Keep this off when testing with women.', proto_h: 'Prototype',
      applock: 'App lock', applock_d: 'Ask for a 4-digit PIN when Sakhi opens', pin_set_h: 'Choose a 4-digit PIN', pin_again: 'Type the same PIN again', pin_enter: 'Enter your PIN', pin_wrong: 'That PIN did not match. Try again.', pin_mismatch: 'The two PINs were different. Start again.', pin_forgot: 'Forgot your PIN?', pin_forgot_p: 'The only way in is to delete everything on this phone and start fresh.', pin_on: 'App lock is on', pin_off: 'App lock is off', pin_note: 'App lock is a simple lock for a shared phone. It stops people opening Sakhi by chance; it is not encryption.',
      disguise: 'Hide the app name and icon', disguise_d: 'On your home screen Sakhi shows as "Notes"', disguise_done: 'Done. The icon may take a few seconds to change.',
      undo: 'Undo', add_details: 'Add details', logged_start: 'Period start saved for today', logged_end: 'Period end saved for today', logged_spot: 'Spotting saved for today', undone: 'Removed',
      d_start: 'Start', d_end: 'Stop', d_spot: 'Mark', d_day: 'Day', d_weeks: 'weeks', d_hidden: 'Hidden for privacy. Tap the number to show.', d_first: 'Add your first entry to begin.', d_reminder: 'Reminder', today_h: 'Today',
      more: 'More', less: 'Less', show_more: 'Show more', show_less: 'Show less',
      weeks_preg: 'weeks pregnant', due_on: 'Due around {d}', this_week: 'This week', pw_visits: 'Check-up visits', preg_set_date: 'Add the due date from your scan report, or the first day of your last period, to see your week.', preg_date_b: 'Add the date', preg_yes_b: 'I am pregnant',
      for_you: 'For you', care_topics: 'All topics', topic_count: '{n} guides and tools', res_tools: 'Guides and tools', res_articles: 'Articles to read', search_all: 'Search: period, safed pani, PCOD, pregnancy…',
      yob_h: 'What year were you born?', yob_p: 'Sakhi is for women 18 and over. We keep only the year, on this phone.', yob_ph: 'For example 1996', yob_month: 'Which month were you born?', yob_bad: 'Please type a year like 1996',
      goal_h: 'What would you like help with?', goal_p: 'Pick any that fit. You can change this later on the Me page.', g_track: 'Keeping track of my periods', g_avoid: 'Avoiding pregnancy', g_ttc: 'Trying for a baby', g_preg: 'I am pregnant', g_baby: 'I had a baby recently', g_pmos: 'PMOS (PCOS) or irregular periods', g_meno: 'Periods changing after 40', g_learn: 'Just learning', baby_date: 'When was your baby born?', ob_birth_l: 'Date of birth', pill_q: 'I take the pill or another hormone medicine', lp_h_preg: 'First day of your last period', lp_p_preg: 'This gives your due date. Skip it if you do not remember; you can add a scan date later.',
      log_last: 'Log my last period', d_log_last: 'Add the first date', ci_sleep: 'Poor sleep', ci_nausea: 'Nausea or vomiting', ci_swell: 'Swollen feet, hands or face', ci_head: 'Headaches', ci_heartburn: 'Heartburn', ci_constip: 'Constipation', ci_back: 'Back pain', ci_pbleed: 'Any bleeding or spotting', ci_lochia: 'Bleeding heavier than a period', ci_stitch: 'Pain at the stitches or C-section wound', ci_breast: 'A painful or red patch on the breast', ci_leak: 'Leaking urine', ci_joint: 'Joint or muscle pain', ci_dry: 'Vaginal dryness or pain with sex', ci_urine: 'Leaking urine or rushing to pee', ci_palp: 'Racing heartbeat',
      ci_flag_preg: 'Bleeding in pregnancy, or a bad headache with swelling or blurred vision: see a doctor today. Heavy bleeding or fits: call 112 now.', ci_flag_post: 'Soaking a pad within an hour or passing big clots: call 112 now. Fever or a bad smell: see a doctor today.', ci_flag_breast: 'A red, painful patch on the breast with fever: see a doctor today.',
      cal_a_period: 'period day', see_all_n: 'See all {n}',
      appearance: 'Appearance', theme_light: 'Light', theme_dark: 'Dark', theme_system: 'Same as phone',
      fab_add: 'Add something for today', fab_close: 'Close', note_h: 'Note', note_ph: 'Anything else about today?', note_p: 'Only on this phone. It saves as you type.',
      hint_wk: 'Tap any day to add what happened.', hint_ask: 'Ask anything here, in Hindi or English.', hint_mic: 'Or tap the mic and speak.', hint_fab: 'Tap + to add today’s period, symptoms, mood or a note. For another day, tap that day.',
      hint_ok: 'Got it', hint_n: '{i} of {n}',
      look_h: 'Sakhi’s look', look_n: 'Look {n}', sakhi_alt: 'Sakhi, your diary friend',
      noted_h: 'What you noted', noted_p: 'Last 90 days. Each line counts the days you noted it.', noted_empty: 'Tap + to note pain, mood or anything else. What comes up most will show here.', k_days: '{n} days', k_day1: '1 day', add_today: 'Add today', cal_a_noted: 'noted',
      ob_lang_h: 'Choose your language', ob_phone: 'Phone language', ob_partly: 'Partly translated', ob_hear: 'Tap the speaker at the top to hear any screen.',
      ob_hello_h: 'Your period diary, in your language', ob_p1: 'Your diary stays on this phone.', ob_p2: 'Plain answers based on official health guidance.', ob_p3: 'Free. No ads.',
      ob_read: 'Just read', ob_notice_link: 'How Sakhi keeps your data', w_restore: 'Moving from another phone? Restore your diary',
      su_phone_h: 'Your mobile number', su_phone_p: 'We send a code to check the number is yours. Your diary stays on this phone: Qura gets only your account details.', su_phone_l: 'Mobile number', su_year_l: 'Year you were born', su_year_u18: 'Under 18', su_choose: 'Choose', su_phone_bad: 'Enter a 10-digit mobile number.', su_year_bad: 'Choose the year you were born.', su_send: 'Send code', su_agree: 'By continuing, you agree to this:', su_code_h: 'Enter the code', su_code_p: 'We sent a 6-digit code to {p}.', su_code_wa: 'We sent a 6-digit code on WhatsApp to {p}.', su_code_sms: 'We sent a 6-digit code by SMS to {p}.', su_sms_instead: 'Not on WhatsApp? Send by SMS', su_code_l: '6-digit code', su_change: 'Change number', su_resend: 'Send a new code', su_resend_in: 'New code in {n}', su_verify: 'Verify', su_wrong: 'That code didn’t match. Check the SMS and try again.', su_expired: 'That code has expired. Ask for a new one.', su_locked: 'Too many tries. Please wait a little and try again.', su_net: 'Couldn’t reach Qura. Check your internet and try again.', su_later: 'Continue for now', su_later_p: 'You can sign up later from Home or the Me page. Your diary works without it.', su_demo: 'Prototype: no message is sent. The code is 123456.', su_about_h: 'Almost done', su_about_p: 'All optional. This helps Qura reach more women; your diary is never part of it.', su_name_l: 'First name (optional)', su_pin_l: 'PIN code (optional)', su_pin_d: 'So Qura knows which areas Sakhi reaches.', su_pin_bad: 'A PIN code has 6 numbers.', su_heard_l: 'How did you hear about Sakhi?', su_h_doc: 'Doctor or ASHA', su_h_fam: 'Friend or family', su_h_wa: 'WhatsApp', su_h_social: 'Instagram or YouTube', su_h_qura: 'Qura', su_h_other: 'Somewhere else', su_upd_h: 'Updates from Sakhi', su_upd_sms: 'Send me updates by SMS', su_upd_wa: 'Send me updates on WhatsApp', su_upd_d: 'New guides and health programme news. Never anything about your own health.', su_skip: 'Skip', su_ok: 'You’re signed up.',
      acc_h: 'Your Sakhi account', acc_none: 'You haven’t signed up yet. It takes a minute: your number and a code.', acc_signup: 'Sign up', acc_num: 'Mobile number', acc_name: 'Name', acc_pin: 'PIN code', acc_heard: 'Heard about Sakhi from', acc_upd: 'Updates', acc_sms: 'SMS', acc_on: 'on', acc_off: 'off', acc_edit: 'Edit details', acc_logout: 'Log out', acc_del: 'Delete my account', acc_del_sure: 'Delete your Sakhi account? Qura deletes your number and details. Your diary on this phone stays; to remove it too, use Delete everything.', acc_del_yes: 'Yes, delete it', acc_del_done: 'Your account is deleted.', acc_out_done: 'You’re logged out. Your diary is still here.', acc_saved: 'Saved.', acc_pending: 'Not sent yet. Sakhi will try again when you’re online.', acc_card_h: 'Finish signing up', acc_card_p: 'Add your mobile number to keep your Sakhi account. Your diary stays on this phone.', acc_keeps: 'Qura keeps only these details. Your diary stays on this phone.', ob_notice_5: 'Your Sakhi account: Qura keeps your mobile number and birth year, and anything you add (first name, PIN code, how you heard of Sakhi, whether you want updates). It also notes the last day you opened Sakhi and the app version. Nothing from your diary.',
      ob_notice_1: 'What you note (dates, symptoms, notes) is saved only on this phone.', ob_notice_2: 'Your diary never goes to Qura or anyone else unless you choose to share it, for example with your doctor before a call. Sakhi asks each time and shows what would be shared.', ob_notice_3: 'No ads and no ad companies. Your entries are never sold.', ob_notice_4: 'Delete your diary any time from the Me page, and your account too.',
      ob_age_h: 'What year were you born?', ob_age_p: 'The diary is for women 18 and over. Qura keeps only the year, with your account.', ob_before: 'Before 1950', ob_after: '2010 or later', ob_month_h: 'And the month?', ob_u18: 'Under 18? You can still read every help page.',
      ob_stage_h: 'What’s happening for you now?', ob_stage_p: 'Pick one. You can change it any time.', ob_st_cycle: 'My periods', ob_st_ttc: 'Trying for a baby', ob_st_preg: 'I’m pregnant', ob_st_post: 'I had a baby', ob_st_meno: 'Periods changing after 40', ob_st_learn: 'Just learning',
      ob_lp_p: 'A guess is fine. You can fix it later.', ob_lp_w1: 'About a week ago', ob_lp_w2: 'About 2 weeks ago', ob_lp_w34: '3 to 4 weeks ago', ob_lp_more: 'More than a month ago', ob_lp_stop: 'My periods have stopped',
      ob_preg_h: 'Do you know your due date?', ob_preg_p: 'It is on your scan report. If not, the first day of your last period works too.', ob_preg_edd: 'Pick the due date', ob_preg_lmp: 'Pick my last period date', ob_later: 'I’ll add it later',
      ob_bf_q: 'Are you breastfeeding?', ob_yes: 'Yes', ob_no: 'No', ob_some: 'Sometimes',
      ob_sh_h: 'Does anyone else use this phone?', ob_sh_me: 'Only me', ob_sh_some: 'Sometimes', ob_sh_fam: 'Yes, my family uses it',
      ob_kit_h: 'Keep your diary private', ob_kit_lock: 'Lock with fingerprint or PIN', ob_kit_plain: 'Plain words on screen', ob_kit_plain_d: 'No word like “period” shows', ob_kit_notes: 'Show the app as “Notes”', ob_kit_p: 'You can change these any time on the Me page.', ob_done: 'Done',
      approx_note: 'Your start date is a guess. Tap the day it really started to fix it.', pp_rec_b: 'Recovery today', pp_feed_b: 'Feeding',
      stage_mid: 'Periods changing after 40', sit_mid: 'Periods changing after 40', sit_mid_d: 'Home shows hot flushes, sleep and other midlife questions',
      learn_hero_h: 'Here for answers?', learn_p: 'Ask anything below or try today’s card. Your diary is ready whenever you want it.', learn_card: 'Today’s card', learn_log: 'Note my period',
      qura_ttc_h: 'Getting ready for a baby?', qura_ttc_p: 'Talk to a Qura doctor about food, weight and PMOS before you conceive. The first call is free.',
      qura_pmos_h: 'Irregular periods or PMOS?', qura_pmos_p: 'Talk it through with a Qura doctor. The first call is free.',
      qura_meno_h: 'Periods changing after 40?', qura_meno_p: 'Ask a Qura doctor about food, sleep and energy. The first call is free.',
      late_preg_d: 'Please go to your hospital today. If you already have, update "My situation" on the Me page.', bb_h: 'Has your baby arrived?', bb_p: 'Your due date has passed. When you are ready, tell Sakhi and Home will change to fit.', bb_add: 'Add the birth date', bb_not: 'Not yet', bb_end: 'My pregnancy ended',
      sh_h: 'Show your diary to your Qura doctor?', sh_will: 'Your doctor will see:', sh_i1: 'Your period dates, gaps and flow', sh_i2: 'What you set in My situation', sh_i3: 'Your last three monthly check-ins', sh_i4: 'What you saved in Sakhi’s tools, such as medicines, test results or pregnancy logs', sh_not: 'Not your day notes. Only for this call. You can stop sharing any time on the Me page.', sh_yes: 'Show for this call', sh_no: 'Book without showing',
      browse_h: 'Just reading', browse_p: 'Every guide and the safety pages are open to you. Start a diary whenever you like; it stays on this phone.',
      qa_pmsigns: 'Signs to notice', qa_pmtests: 'Which tests and why', qa_pmfood: 'Food for hormones',
      tour_home: 'Your Home', tour_diary: 'Your diary', tour_care: 'Care and the doctor', tour_help: 'Help in an emergency', tour_me: 'Privacy on a shared phone', tour_steps: '{n} short steps', tour_seen: 'seen',
      tour_listen: 'Listen', tour_close: 'Close', tour_later: 'Not now', tour_back: 'Back', tour_next: 'Next', tour_done: 'Done', tour_great: 'That’s it. You’ve got it.',
      howto_h: 'How to use Sakhi', howto_p: 'Short tours you can replay any time.', tours_auto: 'Show a tour on new screens', tours_auto_d: 'A short tour the first time you open a screen', tour_voice: 'Read tours aloud', tour_voice_d: 'Sakhi reads each step. Off at first, for shared phones.', tours_again: 'Show the tours again', tours_again_done: 'The tours will show again.',
      tw1_h: 'Your week', tw1_p: 'Each circle is a day. Tap a day to note what happened.', tw2_h: 'One tap to note', tw2_p: 'These buttons save today in one tap. You can always undo.', tw3_h: 'Ask anything', tw3_p: 'Type a question in Hindi or English. Try it now: tap the box.', tw3_pm: 'Type a question, or tap the mic and speak in Hindi. Try it now.',
      td1_h: 'Your calendar', td1_p: 'Tap any day to fill it in or fix a date. Dots show what you noted.', td1_pd: 'Tap any day to add or change a note.', td2_h: 'Trends', td2_p: 'Your gaps between periods and what you noted most, over the months.', td2_pd: 'Your notes over the months.', td3_h: 'Add for today', td3_p: 'Tap + for today’s period, symptoms, mood or a note. Try it now.', td3_pd: 'Tap + to add a note for today. Try it now.',
      tc1_h: 'Care for every stage', tc1_p: 'Pick a topic: periods, pregnancy, after birth, midlife and more.', tc1_pd: 'Pick a topic to read.', tc2_h: 'Listen to any page', tc2_p: 'Tap the speaker and Sakhi reads the page aloud.', tc3_h: 'Speak to a doctor', tc3_p: 'Tap Doctor any time to book a call with a Qura doctor. The first call is free.',
      th1_h: 'Talk to a doctor', th1_p: 'For questions that can wait a day or two, book a call here.', th2_h: 'In an emergency', th2_p: 'Call 112 straight away. Every emergency number is here.',
      tm1_h: 'Privacy on a shared phone', tm1_p: 'Lock Sakhi, use plain words, or show the app as Notes.', tm1_pw: 'Lock Sakhi with a PIN, or use plain words on Home.', tour_diary_d: 'Your notes', tm2_h: 'Delete everything', tm2_p: 'Removes everything Sakhi saved on this phone, after you confirm.',
      tour_hpreg: 'Your pregnancy Home', tour_hpost: 'Your Home after the birth', tour_httc: 'Trying for a baby', tour_hmeno: 'Midlife', tour_day: 'A day in your diary', tour_day_d: 'A day in your notes', tour_ans: 'Quick answers', tour_ci: 'Monthly check-in', tour_ring: 'Your cycle ring', tour_g_screens: 'Screens', tour_g_features: 'Features', tour_step1: '1 short step', tour_q: 'What does this show?',
      thp1_h: 'Your week of pregnancy', thp1_p: 'The big number is your week of pregnancy, and the drawing shows your baby’s size. Tap {b} to see what’s changing.', thp2_h: 'One tap', thp2_p: '{a}, symptoms and your monthly check-in. {b} keeps your weight, BP, sugar, Hb and tablets.', thp3_h: 'Ask anything', thp3_p: 'Type a question, or tap one below. The first one, {b}, tells you when to call 112.', thp3_pm: 'Type or speak a question, or tap one below. The first one, {b}, tells you when to call 112.',
      tpp1_h: 'Your first 6 weeks', tpp1_p: 'The ring fills a little each day for the 6 weeks after the birth. Tap {b} for what to expect.', tpp1_hl: 'Since the birth', tpp1_pl: 'Sakhi counts the days since your baby’s birth. Periods can come back any time, so log bleeding when it starts.', tpp2_p: '{a} is a 1-minute check on bleeding, stitches, fever, breasts and mood. {b} keeps a log of feeds.', tpp2_pl: 'Log your period when it comes back, plus symptoms and your monthly check-in.', tpp3_p: 'Type a question, or tap one below: the first 6 weeks, feeding, mood after the birth and more.', tpp3_pm: 'Type or speak a question, or tap one below: the first 6 weeks, feeding, mood after the birth and more.',
      tht1_h: 'Months of trying', tht1_p: 'Sakhi counts the months you’ve been trying, with a checklist to get ready. Tap to open it.', tht2_h: 'Questions for planning a baby', tht2_p: 'When to take a test, how to get ready, and why no app can name your fertile day. One tap each.', thm1_h: 'Questions after 40', thm1_p: 'Hot flushes, periods after 40, hormone therapy, bones, sleep and mood. One tap each.', thm2_h: 'Bleeding after menopause', thm2_p: 'Any bleeding once your periods have stopped for a year needs a doctor’s check. Tap to read why.',
      tdy1_h: 'Your period', tdy1_p: 'Tap {a} on the first day of bleeding and {b} on the last. {c} is a few drops between periods.', tdy1_pd: 'Mark this day here: started, ended, or a few drops.', tdy2_h: 'How you felt', tdy2_p: 'Tap anything you felt. It saves as you tap, and you can tap again to remove it.', tdy3_h: 'A note', tdy3_p: 'Anything else about the day? Write it here. It stays only on this phone.',
      tan1_h: 'Listen', tan1_p: 'Tap {b} and Sakhi reads this answer to you.', tan2_h: 'Still worried?', tan2_p: 'Book a call with a Qura doctor about this. The first call is free.', tci1_h: 'Once a month', tci1_p: 'Tap anything that happened this month. It takes about a minute.', tci2_h: 'Save it', tci2_p: 'Tap {b} when you’re done. Your answers stay on this phone.',
      tr1_h: 'Your cycle ring', tr1_p: 'The number is your cycle day. Red is your period, the light band is when the next one usually comes, and the dot is today.', tst1_p: 'Pregnant, had a baby, trying, or periods changing? Tap here and Sakhi changes with you.',
      pat_h: 'What repeats for you', pat_p: 'From the {n} periods you made notes around. Patterns can change, and this is not a diagnosis.', pat_before: 'often about {n} days before your period', pat_daybefore: 'usually from the day before your period', pat_day1: 'usually from the first day of your period', pat_dayn: 'usually on day {n} of your period', pat_count: 'in {a} of the {b} periods with notes', pat_wait: 'Note how you feel around your periods. After 3 periods with notes, Sakhi shows what repeats for you.', pat_none: 'Nothing repeats clearly yet. Keep noting how you feel.',
      hu_h: 'Your period may come in about {n} days', hu_h1: 'Your period may come from tomorrow', hu_h_d: 'A heads-up for the next few days', hu_likely: 'Likely {r}.', hu_pat_h: 'Last few times:', hu_ready: 'Keep pads and a hot water bag ready, and plan a little rest if you can.', hu_ready_d: 'Keep your things ready.', hu_rel: 'Try a 3-minute routine', hu_got: 'Got it',
      rp_h: 'Report for my doctor', rp_entry_s: 'Your periods, symptoms and logs on one screen', rp_show: 'Going to a doctor? Show this report', rp_p: 'Your own entries on one screen. Show it to any doctor, or send it. It has your health details, so send it only to your doctor.',
      rp_about: 'About me', rp_age: 'Age {n}', rp_preg: 'Pregnant: week {w}, due around {d}', rp_birth: 'Baby born on {d}', rp_periods: 'My last periods', rp_col_start: 'Started', rp_col_bleed: 'Days of bleeding', rp_col_gap: 'Days to the next', rp_heavy: 'heavy', rp_guess: 'date guessed', rp_t_row: 'bled {b} days, next period after {g} days',
      rp_gaps: 'Counted gaps in this table: average {a} days · shortest {s} · longest {l}', rp_sym: 'What I noted (last 90 days)', rp_days: '{n} days', rp_out: 'not counted', rp_t_bled: 'bled {n} days', rp_t_noend: 'end not logged', rp_t_next: 'next period after {n} days', rp_ci: 'Monthly check-ins', rp_tools: 'From my tools', rp_q: 'Questions I want to ask',
      rp_q_gap: 'My gaps between periods are often longer than 35 days. What could cause this, and which tests do I need?', rp_q_heavy: 'My periods are heavy. Should I have an Hb test?', rp_q_pain: 'My period pain stops my day. What can help?', rp_q_preg: 'Are my BP, sugar and Hb fine for this week of pregnancy?', rp_q_any: 'Is there anything here I should keep an eye on?',
      rp_notes_sw: 'Add my notes from the last 30 days', rp_notes: 'My notes', rp_none: 'Nothing to show yet. Log your period and how you feel, and your report fills in.', rp_foot: 'From Sakhi, {d}. My own entries, not a diagnosis.', rp_send: 'Send on WhatsApp', rp_copy: 'Copy', rp_copied: 'Copied. Paste it in your chat with the doctor.', rp_copy_fail: 'Could not copy on this phone.',
      bk_h: 'Move to a new phone', bk_entry_s: 'A backup code, locked with your PIN', bk_p: 'Sakhi keeps your diary only on this phone. To move it, make a backup code here, keep it safe, and enter it on the new phone with the same PIN.',
      bk_make_h: 'Make a backup code', bk_pin: 'Choose a PIN (4 to 6 numbers; 6 is safer)', bk_pin2: 'Type the PIN again', bk_make: 'Make the code', bk_pin_bad: 'Use 4 to 6 numbers, the same both times.', bk_code_h: 'Your backup code',
      bk_code_p: 'Copy it and keep it where only you can see it, like WhatsApp “Message yourself” or your notes. The code is locked with your PIN, but anyone who has it could try to guess a short PIN, so never share it. Sakhi can’t recover a lost PIN.', bk_copy: 'Copy the code', bk_copied: 'Copied. Keep it safe.',
      bk_restore_h: 'Restore on this phone', bk_paste: 'Paste your backup code', bk_pin_r: 'Your PIN', bk_restore: 'Restore', bk_sure: 'This replaces everything on this phone with your backup. Go ahead?', bk_yes: 'Yes, restore', bk_done: 'Your diary is back.', bk_wrong: 'That code or PIN didn’t work. Check both and try again.', bk_na: 'Backup isn’t available on this phone.', bk_sample: 'Not for sample diaries.',
      doc_b: 'Speak to a doctor', doc_short: 'Doctor', doc_h: 'Not an emergency?', doc_p: 'Speak to a Qura doctor. The first 20-minute call is free, in your language.', em_numbers: 'Emergency numbers',
      today_short: 'Today', period_ended: 'Period ended', sym_h: 'Symptoms', sym_h_d: 'Add a note', checkin_b: 'Check-in', ci_done_b: 'Check-in done', my_logs: 'My logs',
      day_period: 'Period', day_flow: 'Add flow and pain details', sym_pain: 'Pain', sym_body: 'Body', sym_mood: 'Mood', sym_disch: 'Discharge', sym_done: 'Done', yesterday_l: 'Yesterday',
      d_acne: 'Acne', d_calm: 'Calm', d_happy: 'Happy', d_anxious: 'Anxious', d_irritable: 'Irritable', d_disch_ok: 'Usual', d_disch_bad: 'Unusual colour or smell', d_itch: 'Itching', d_pbleed: 'Bleeding or spotting',
      prev_day: 'Previous day', next_day: 'Next day',
      qa_h: 'Your questions', qa_ph: 'Ask anything: late period, safed pani…', qa_ph_d: 'Search', also_asked: 'Also asked', full_guide: 'Read the full guide', listen_b: 'Listen',
      voice_b: 'Speak your question', voice_prompt: 'Say your question', voice_none: 'Voice typing is not available on this phone. Please type instead.',
      day_h: 'How are you today?', noted_today: 'Noted for today', noted_day: 'Noted', what_helps: 'What helps', all_articles: 'All articles', all_articles_d: '{n} short reads in Hindi and English',
      d_nausea: 'Nausea', d_back: 'Back pain', d_heartburn: 'Heartburn', d_swell: 'Swelling', d_breast: 'Breast pain', d_hotflush: 'Hot flushes', d_joint: 'Joint pain',
      qa_late: 'Period late?', qa_pain: 'Period pain', qa_disch: 'White discharge', qa_heavy: 'Heavy bleeding', qa_pmos: 'PCOD / PMOS', qa_irreg: 'Irregular periods',
      qa_ptest: 'Pregnancy test', qa_ready: 'Getting ready', qa_fertile: 'Fertile days', qa_pmosbaby: 'PMOS and a baby', qa_ttcdoc: 'When to see a doctor', qa_partner: 'His test',
      qa_danger: 'Danger signs', qa_checkups: 'Check-ups', qa_tablets: 'Tablets and injections', qa_moves: 'Baby\'s movements', qa_schemes: 'Free schemes', qa_sugarbp: 'Sugar and BP',
      qa_six: 'First 6 weeks', qa_feed: 'Breastfeeding', qa_ppmood: 'Mood after birth', qa_ppcontra: 'Contraception', qa_heal: 'Bleeding and healing',
      qa_hot: 'Hot flushes', qa_after40: 'Periods after 40', qa_hrt: 'HRT', qa_bones: 'Bones and heart', qa_sleep: 'Sleep and mood', qa_pmb: 'Bleeding after menopause',
      qa_first: 'First periods', qa_myths: 'Period myths', qa_pads: 'Pads and cups', qa_moodcycle: 'Mood and cycle', qa_lines: 'Helplines',
      sos_h: 'Need help now?', sos_p: 'Tap a number to call. For any emergency, call 112.', call_b: 'Call', sos_signs: 'Danger signs: when to go now',
      stage_change: 'Change stage', stage_h: 'Where are you right now?', stage_cycle: 'Tracking my periods', stage_ttc: 'Trying for a baby', stage_preg: 'I am pregnant', stage_post: 'I had a baby', stage_meno: 'My periods have stopped',
      stage_preg_note: 'Add the due date on your scan report, or the first day of your last period.', stage_birth_date: 'When was your baby born?', stage_bf: 'I am breastfeeding',
      stage_saved: 'Updated. Home now shows what fits you.', stage_log_first: 'Log the day your periods came back. Sakhi then counts your cycle again.', stage_now: 'Your stage',
      scan_edd: 'Due date on your scan report (EDD)', scan_edd_note: 'Most scan reports and MCP cards print an EDD. If yours does, Sakhi counts the weeks from it.', date_bad: 'That date does not look right. Please check it.',
      r_pain: 'Pain that stops your day is worth a doctor visit this month. Sudden severe pain on one side with a late period: call 112 now.',
      ring_period: 'Period', ring_usual: 'Usual gap {a}–{b} days', ring_likely: 'Likely next', ring_aria: 'Cycle day {n}. The usual gap is {a} to {b} days.',
      pp_ring: 'days since birth', pp_ring_1: 'day since birth', pp_week: 'Week {n} of 6', pp_aria: 'Day {n} of the first 6 weeks after the birth',
      notif_sec: 'Reminders on this phone', notif_h: 'Phone notifications', notif_d: 'Your reminders, and a heads-up the day before your period may start. Discreet mode keeps the wording neutral.', notif_exact_p: 'Android may ring your reminders up to an hour late. Allow alarms and reminders for Sakhi so they come on time.', notif_exact_b: 'Allow on-time reminders', notif_test_btn: 'Send a test notification', notif_test: 'This is how Sakhi reminders look. You can turn them off on the Me page.', notif_test_sent: 'A test notification arrives in about 5 seconds.', notif_on: 'Notifications are on', notif_denied: 'Notifications are off for this app in your phone settings.', notif_period: 'Your period may start in the next few days. Keep a pad handy.',
      bio_btn: 'Use fingerprint or phone lock', bio_title: 'Unlock Qura Sakhi', bio_title_d: 'Unlock My notes',
      demo_h: 'Demo', demo_p: 'Show the app as one of the sample women. Your settings stay; the sample entries replace what is on this phone.', demo_sure: 'This replaces the entries on this phone with the sample. To keep yours, make a backup code first (Me, then Move to a new phone).', demo_yes: 'Replace with the sample', demo_doc: "Doctor's view", demo_welcome: 'Clear the sample and start from the welcome screen', cal_a_spot: 'spotting', cal_a_range: 'likely period dates', bars_aria: 'Gaps between periods, in days: {list}'
    },
    hi: {
      tagline: 'मुफ़्त · हिंदी · English', home: 'होम', diary: 'डायरी', notes: 'नोट्स', learn: 'जानें', help: 'मदद', me: 'मैं',
      welcome_h: 'आपका चक्र, आपका शरीर, आपकी भाषा में', welcome_p: 'भारतीय महिलाओं के लिए मुफ़्त डायरी और आसान भाषा में मदद। कोई विज्ञापन नहीं, कोई score नहीं, कुछ बेचा नहीं जाता। जब चाहें, Qura की डॉक्टर साथ हैं।',
      start: 'डायरी शुरू करें', try_sample: 'नमूना डेटा के साथ देखें', sample_priya: 'प्रिया, 27 · अनियमित चक्र', sample_asha: 'आशा, 31 · नियमित चक्र', browse_only: 'सिर्फ़ मदद के पन्ने पढ़ें',
      step: 'चरण', of: 'में से', dob_h: 'आपका जन्म कब हुआ?', dob_p: 'यह डायरी 18 साल और उससे ऊपर की महिलाओं के लिए है। यह हम सबसे पहले पूछते हैं और सिर्फ़ आपकी प्रोफ़ाइल में रखते हैं।', day: 'दिन', month: 'महीना', year: 'साल',
      dob_note: '18 से कम? कुछ भी save नहीं होता। आपको हमारी मुफ़्त सुरक्षा गाइड दिखेगी।', continue: 'आगे', back: 'पीछे',
      under18_h: 'यह डायरी 18 साल और ऊपर की महिलाओं के लिए है', under18_p: 'आपने जो लिखा, वह save नहीं हुआ। सुरक्षा गाइड और “जानें” के पन्ने सबके लिए मुफ़्त हैं। 18 से कम उम्र के लिए Childline 1098 है।', ask_teen_h: 'डॉक्टर से बात', ask_teen_p: 'Sakhi 18 साल और उससे बड़ी महिलाओं के लिए कॉल बुक करती है। अगर आप 18 से कम हैं, तो माता-पिता, अभिभावक या किसी भरोसेमंद बड़े के साथ डॉक्टर के पास जाएँ। Childline 1098 मुफ़्त है, दिन-रात।',
      lp_h: 'आपका पिछला पीरियड कब शुरू हुआ?', today_b: 'आज', yesterday: 'कल', pick: 'तारीख़ चुनें', dont_remember: 'याद नहीं',
      sit_h: 'अभी आप…', sit_p: 'इससे तय होता है कि डायरी क्या गिने। “मैं” पन्ने पर कभी भी बदल सकती हैं।', pregnant: 'गर्भवती', bf: 'स्तनपान करा रही', hormones: 'हॉर्मोन की दवा पर', none: 'इनमें से कुछ नहीं',
      consent_h: 'शुरू करने से पहले, तीन बातें', consent_1: 'आपकी डायरी और safety entries Qura की care team पढ़ सकती है: एक Qura डॉक्टर, और जब आप “किसी को बताएँ” दबाएँ, एक coordinator।',
      consent_2: 'कोई computer program आपकी सेहत का फ़ैसला नहीं करता। कोई score, कोई diagnosis नहीं।', consent_3: 'आप एक tap में सब कुछ delete कर सकती हैं। Ad companies को कुछ नहीं जाता।',
      consent_yes: 'हाँ, डायरी शुरू करें', consent_no: 'अभी नहीं', listen: 'Dr. Megha की आवाज़ में सुनें · 30 सेकंड', notice: 'सूचना: कौन क्या रखता है, कितने समय तक',
      cycle_day: 'चक्र का दिन', period_day: 'पीरियड · दिन', next_likely: 'अगला पीरियड लगभग', past_range: 'संभावित समय से {n} दिन आगे', last_gaps: 'आपके पिछले अंतर:', days: 'दिन', usual_gap: 'आम तौर पर अंतर 21–35 दिन होता है।', usual_gap_teen: 'शुरुआती सालों में आम अंतर 21–45 दिन होता है।',
      no_contra: 'यह अंतर गर्भ रोकने का तरीक़ा नहीं है और कोई “safe days” नहीं दिखाता।', gap_mode_note: 'जब अंतर बहुत बदलते हैं, हम तारीख़ का अंदाज़ा नहीं देते, सिर्फ़ गिनती दिखाते हैं।', first_log: 'पिछला पीरियड जिस दिन शुरू हुआ, वह दर्ज करें। फिर Sakhi आपके चक्र का दिन, पीरियड के बीच का अंतर और अगला पीरियड कब आ सकता है, दिखाएगी।',
      last6: 'पिछले 6 अंतर (दिन)', band_note: 'छायादार पट्टी: आम अंतर, सबके लिए एक जैसी', trends: 'रुझान', period_started: 'पीरियड शुरू', ended: 'ख़त्म', spotting: 'स्पॉटिंग',
      checkin_t: 'चेक-इन', checkin_sub: '8 टैप, लगभग 1 मिनट। महीने में एक बार।', checkin_done: 'इस महीने हो गया। धन्यवाद।', start_b: 'शुरू करें', edit: 'बदलें',
      safety: 'सुरक्षा गाइड', safety_sub: 'डॉक्टर को कब दिखाएँ। सबके लिए एक जैसी।', tell: 'किसी को बताएँ', tell_sub: '1 कार्यदिवस में जवाब।',
      qura_h: 'Qura की डॉक्टर से बात करें', qura_p: 'BAMS डॉक्टर से 20 मिनट की मुफ़्त कॉल। अपनी डायरी साथ रखें; साझा करें तो वह देख सकती हैं।', qura_b: 'मुफ़्त कॉल बुक करें',
      doc_sees: 'अगर आप साझा करें तो आपकी Qura डॉक्टर अगली मुलाक़ात में यह देखेंगी। कुछ भी ज़रूरी हो तो 112 पर कॉल करें।',
      r6_h: 'पिछले पीरियड को 90+ दिन हो गए', r6_p: 'अगर गर्भ की संभावना है तो पहले घर पर test करें। फिर डॉक्टर को दिखाएँ। PMOS में नियमित पीरियड गर्भाशय की परत को सुरक्षित रखते हैं।',
      late_h: 'अनुमानित अंतर से आगे', late_p: 'एक हफ़्ता या ज़्यादा देर और गर्भ की संभावना है? पहले घर पर test करें।',
      calendar: 'कैलेंडर', bleeding: 'ब्लीडिंग', likely_range: 'संभावित अंतर, कभी एक दिन नहीं', today_l: 'आज', cal_note: 'दर्ज करने के लिए दिन पर टैप करें। fertile या safe days नहीं दिखाए जाते।',
      stats: 'आपके आँकड़े', stats_from: 'आपके पिछले {n} गिने गए अंतरों से (अंदाज़े की तारीख़, हॉर्मोन और गर्भ छोड़कर)।', stats_from_1: 'आपके पिछले गिने गए अंतर से (अंदाज़े की तारीख़, हॉर्मोन और गर्भ छोड़कर)।', avg_gap: 'औसत अंतर', shortest: 'सबसे छोटा अंतर', longest: 'सबसे लंबा अंतर', bleed_days: 'ब्लीडिंग के दिन (औसत)', cycles_logged: 'दर्ज पीरियड', spread6: 'पिछले 6 का फैलाव',
      no_data: 'दो पीरियड की शुरुआत दर्ज करें, तब उनके बीच का अंतर दिखेगा।', gaps12: 'पिछले 12 अंतर (दिन)', band_label: 'पट्टी: 21–35 दिन, सबके लिए एक जैसी। धारीदार: गिने नहीं गए (हॉर्मोन, गर्भ)।',
      log_h: 'दर्ज करें', what_log: 'क्या हुआ?', on_date: 'किस दिन?', flow_h: 'ब्लीडिंग और दर्द (वैकल्पिक)', pads: 'आज pad', pads_1: '1–2', pads_2: '3–5', pads_3: '6 या ज़्यादा', pads_4: 'हर 1–2 घंटे में pad भीग गया',
      clots: 'थक्के', clots_0: 'नहीं', clots_1: 'छोटे', clots_2: '₹10 के सिक्के जितने या बड़े', leaked: 'कपड़ों तक निकल गया', twopads: 'दो pad लगाने पड़े', pain: 'दर्द', pain_0: 'दर्द नहीं', pain_1: 'हल्का', pain_2: 'दर्द की गोली लेनी पड़ी', pain_3: 'दिन का काम नहीं हो पाया',
      daily_h: 'आज कुछ और? (वैकल्पिक)', d_cramps: 'ऐंठन', d_headache: 'सिरदर्द', d_bloat: 'पेट फूलना', d_mood: 'मन उदास', d_tired: 'थकान', d_sleep: 'नींद ख़राब',
      r2: '8 दिन से ज़्यादा ब्लीडिंग, या हर 1–2 घंटे में pad भीगना: इसी हफ़्ते डॉक्टर को दिखाएँ और हीमोग्लोबिन (खून की) जाँच माँगें; सरकारी अस्पताल में मुफ़्त है। साथ में चक्कर या साँस फूले तो आज ही डॉक्टर को दिखाएँ या 112 पर कॉल करें।',
      save: 'सेव करें', saved: 'दर्ज हो गया।', cancel: 'रद्द', delete_entry: 'यह entry हटाएँ',
      cadence: 'Qura की डॉक्टर इलाज में शामिल मरीज़ों की डायरी हफ़्ते में एक बार पढ़ती हैं। यह live नहीं है। चक्कर के साथ भारी ब्लीडिंग, एक तरफ़ दर्द के साथ बेहोशी, या कोई emergency: अभी 112 पर कॉल करें। ख़ुद को नुक़सान के विचार: 14416 या 112।',
      ci_h: 'चेक-इन', ci_p: 'इस महीने जो महसूस किया, टैप करें। लगभग 1 मिनट।', ci_hair: 'होंठ, ठुड्डी, छाती, पेट या पीठ पर मोटे काले बाल', ci_removal: 'हफ़्ते में एक या ज़्यादा बार चेहरे/शरीर के बाल हटाना', ci_acne: 'मुँहासे', ci_thin: 'सिर के बाल पतले होना',
      ci_neck: 'गर्दन या बगल में काले मखमली धब्बे', ci_heavy: 'भारी ब्लीडिंग या थक्के', ci_mood: 'ज़्यादातर दिन उदासी या घबराहट', ci_none: 'इनमें से कुछ नहीं', ci_hot: 'गर्मी के झोंके या रात में पसीना', hot_0: 'नहीं', hot_1: 'हल्के', hot_2: 'मध्यम', hot_3: 'रात में नींद खुली',
      ci_more: 'और (निजी देखभाल)', ci_disch: 'असामान्य सफ़ेद पानी', ci_itch: 'खुजली', ci_burn: 'पेशाब में जलन', ci_sexpain: 'संबंध के समय दर्द', ci_aftersex: 'संबंध के बाद ब्लीडिंग',
      ci_note: 'डॉक्टर के लिए कुछ?', ci_note_ph: 'नोट लिखें (1 कार्यदिवस में एक व्यक्ति पढ़ेगा)', ci_save: 'चेक-इन सेव करें', ci_thanks: 'सेव हो गया। धन्यवाद। यहाँ कुछ भी score नहीं होता।',
      learn_h: 'जानें', learn_p: 'छोटे, डॉक्टर-जाँचे जवाब। हिंदी या English में पढ़ें।', search: 'विषय खोजें', all: 'सब', loading: 'यह library लिखी जा रही है। थोड़ी देर में देखें।', read: 'पढ़ें',
      see_doctor: 'डॉक्टर को कब दिखाएँ', qura_can: 'Qura कैसे मदद कर सकता है', ask_qura: 'इस बारे में Qura की डॉक्टर से पूछें', sources: 'स्रोत', draft: 'डॉक्टर की समीक्षा के लिए draft', no_results: 'कुछ नहीं मिला। दूसरा शब्द आज़माएँ।',
      help_h: 'मदद और सुरक्षा', call_now: 'अभी 112 पर कॉल करें अगर', today_if: 'आज ही डॉक्टर को दिखाएँ अगर', weeks2: 'लगभग 2 हफ़्ते में स्त्री रोग विशेषज्ञ को दिखाएँ अगर', week_if: 'इसी हफ़्ते अगर', under18: '18 से कम', mood: 'मन', after35: '35 के बाद',
      s1a: 'पीरियड देर से या test positive, साथ में पेट के निचले हिस्से में एक तरफ़ दर्द, कंधे की नोक में दर्द, चक्कर या बेहोशी', s1b: 'हर 1–2 घंटे में pad भीगना और चक्कर या साँस फूलना', s1c: 'गर्भ में: ब्लीडिंग, दौरे, धुंधली नज़र के साथ तेज़ सिरदर्द, पानी निकलना, बच्चे की हलचल कम',
      s2a: 'हर 1–2 घंटे में pad भीगना (हीमोग्लोबिन जाँच माँगें; सरकारी अस्पताल में मुफ़्त)', s2b: 'भारी ब्लीडिंग या तेज़ पेट दर्द के साथ बुख़ार', s2c: 'पेशाब में जलन के साथ बुख़ार, कँपकँपी या पसलियों के नीचे पीठ दर्द',
      s3a: 'पिछले पीरियड के 12 महीने या ज़्यादा बाद कोई भी ब्लीडिंग। ज़्यादातर कारण गंभीर नहीं होते, पर जाँच हमेशा ज़रूरी है', s3b: '90+ दिन पीरियड नहीं (गर्भ, स्तनपान या हॉर्मोन नहीं): पहले गर्भ test, फिर डॉक्टर', s3c: 'महीनों में बाल बढ़ना बदतर, या आवाज़ भारी होना', s3d: 'स्तनपान न कराते हुए निप्पल से दूध जैसा स्राव',
      s4a: '8 दिन से ज़्यादा ब्लीडिंग, ₹10 के सिक्के जितने थक्के, या कपड़ों तक निकलना', s4b: 'पीरियड का दर्द जो दिन रोक दे, या संबंध में दर्द: यह डायरी साथ ले जाएँ', s4c: 'सफ़ेद पानी का रंग या गंध बदली, खुजली, या पेशाब में जलन',
      s5a: '15 साल तक पीरियड नहीं, या 13 तक स्तन विकास नहीं: माता-पिता के साथ डॉक्टर को दिखाएँ', s5b: '18 से कम उम्र के लिए Childline 1098', s6a: 'दो हफ़्ते या ज़्यादा लगभग रोज़ मन उदास: Tele-MANAS 14416, मुफ़्त, कभी भी', s6b: 'ख़ुद को नुक़सान के विचार: अभी 14416 या 112 पर कॉल करें',
      helplines: 'हेल्पलाइन, मुफ़्त', copy: 'कॉपी', copied: 'कॉपी हुआ', same_for_all: 'सबके लिए एक जैसा। diagnosis नहीं। सरकारी और डॉक्टरी गाइडलाइन के आधार पर, स्रोतों के साथ।',
      tell_h: 'किसी को बताएँ', tell_p: 'Qura में एक व्यक्ति इसे कार्यदिवसों में पढ़ता है और 1 कार्यदिवस (सोम–शनि) में जवाब देता है। यह live नहीं है। Emergency में 112। ख़ुद को नुक़सान के विचार में 14416 या 112।',
      tell_about: 'किस बारे में है?', t_bleed: 'ब्लीडिंग', t_pain: 'दर्द', t_missed: 'पीरियड नहीं आया', t_mood: 'मन', t_other: 'कुछ और', tell_msg: 'आपका संदेश', tell_send: 'किसी को भेजें', tell_ok: 'मिल गया। संदर्भ', tell_ok2: 'असली app में एक coordinator इसे पढ़ेगा। इस prototype में यह आपके फ़ोन पर ही रहता है।',
      ask_h: 'Qura की डॉक्टर से बात करें', ask_p: 'Qura की डॉक्टर (BAMS) से 20 मिनट की मुफ़्त वीडियो या फ़ोन कॉल। वह test लिख सकती हैं और चक्र, वज़न, नींद और खाने में मदद करती हैं। pill, HRT या letrozole जैसी हॉर्मोन दवाओं के लिए MBBS स्त्री रोग विशेषज्ञ चाहिए; Qura refer करता है।',
      name: 'आपका नाम (वैकल्पिक)', phone: 'फ़ोन नंबर', best_time: 'कॉल का सही समय', morning: 'सुबह', afternoon: 'दोपहर', evening: 'शाम', topic: 'किस बारे में?', share_diary: 'कॉल से पहले मेरी डायरी डॉक्टर से साझा करें',
      ask_send: 'मुफ़्त कॉल माँगें', ask_ok: 'अनुरोध सेव हुआ। संदर्भ', ask_ok2: 'Prototype: कुछ भेजा नहीं गया। असली app में Qura आपको कॉल करता है। सीधे भी बुक कर सकती हैं:', book_link: 'quranutrition.com पर बुक करें',
      me_h: 'मैं', situation: 'मेरी स्थिति', sit_p2: 'ये आप ख़ुद तय करती हैं। डायरी आपकी entries से इन्हें कभी नहीं अनुमानती।', since: 'से', pregnant_d: 'गर्भ के दौरान हम पीरियड का अंदाज़ा नहीं लगाते। जो भी दवा लेती हैं, डॉक्टर को बताएँ।', bf_d: 'दूध पिलाते समय पीरियड अक्सर रुके रहते हैं, इसलिए जन्म के बाद एक साल हम अंदाज़ा नहीं लगाते।',
      horm_d: 'Pill, हॉर्मोन वाला IUD, इंजेक्शन, HRT या steroids। इनसे चक्र बदलता है, इसलिए वे महीने औसत में नहीं गिने जाते।', pcos: 'PMOS (PCOS) बताया गया है', pcos_d: 'आपकी डॉक्टर यह देखेंगी। मेनोपॉज़ का अंदाज़ा हम पीरियड के अंतर से नहीं लगाएँगे।', thyroid: 'थायरॉइड, endometriosis या fibroids', thyroid_d: 'डायरी साझा करने पर आपकी डॉक्टर यह देखेंगी।',
      hyst: 'गर्भाशय निकाला गया या ablation', hyst_d: 'गिनने को पीरियड नहीं, इसलिए डायरी चक्र नहीं गिनती।', stopped: 'मेरे पीरियड बंद हो गए हैं', stopped_d: 'होम पर चक्र की गिनती की जगह मेनोपॉज़ की देखभाल दिखेगी।', planning: 'बच्चे की योजना', planning_d: 'बच्चे की कोशिश वाली गाइड दिखेंगी। जो भी दवा लेती हैं, डॉक्टर को बताएँ।',
      tools: 'टूल', pattern: 'पैटर्न जाँच', pattern_d: 'आपकी entries, डॉक्टरों के देखे पैटर्न के सामने', fertile: 'Fertile दिनों का अनुमान', fertile_d: 'सिर्फ़ उन चक्रों के लिए जो 7 दिन या कम बदलते हैं', midlife: 'मेरी midlife तस्वीर', midlife_d: 'गिनती और डॉक्टरों की timeline', pregw: 'गर्भ, हफ़्ता दर हफ़्ता', pregw_d: 'scan की तारीख़ से गिना',
      gated: 'लॉन्च से पहले मंज़ूरी चाहिए', lang: 'भाषा', discretion: 'गोपनीयता', discreet: 'गुप्त mode', discreet_d: 'होम पर नंबर, चार्ट और “पीरियड” जैसे शब्द छिप जाते हैं; डायरी टैब का नाम “नोट्स” हो जाता है।', shared: 'साझा फ़ोन mode', shared_d: '10 मिनट तक कोई टैप न होने पर, और ऐप पर लौटने पर बंद हो जाता है। कुछ मिटता नहीं।', rest_h: 'आपकी डायरी बंद है', rest_h_d: 'नोट्स बंद हैं', rest_p: 'साझा फ़ोन mode इसे 10 मिनट तक कोई टैप न होने पर, और ऐप पर लौटने पर बंद कर देता है। “मैं” पन्ने पर PIN लगाएँ, ताकि इसे सिर्फ़ आप खोल सकें।', rest_open: 'खोलें',
      consent_data: 'सहमति और मेरा डेटा', c1: 'डायरी और safety समीक्षा', c2: 'हर चक्र में एक WhatsApp reminder', c4: 'मेरी Qura डॉक्टर से साझा', given: 'दी गई', withdraw: 'वापस लें', give: 'दें', export: 'मेरा डेटा दिखाएँ', delete_all: 'सब कुछ delete करें', delete_sure: 'अभी सब delete करें? undo नहीं होगा।', yes_delete: 'हाँ, delete करें', deleted: 'सब कुछ delete हो गया।',
      delete_note: 'तुरंत, बिना undo, ताकि बाद में कोई न देख सके।', grievance: 'Grievance Officer: [नाम, पता]', notice_text: 'आपकी entries सिर्फ़ इसी फ़ोन पर रहती हैं। Qura (Trinaya Wellness LLP) अकाउंट चलाने के लिए आपके अकाउंट की जानकारी रखता है। असली app में यहाँ हर processor, रखने की अवधि और Grievance Officer का नाम होगा।',
      pc_h: 'पैटर्न जाँच', pc_p: 'आपकी entries को उन पैटर्न से मिलाता है जो डॉक्टर देखते हैं। diagnosis नहीं।', pc_updated: 'अपडेट', pc_pmos: 'PMOS (PCOS) पैटर्न', pc_seen: 'पैटर्न दिखा', pc_gaps: 'लंबे अंतर दिखे', pc_hair: 'बालों के संकेत दिखे', pc_not: 'नहीं दिखा', pc_nodata: 'काफ़ी डेटा नहीं',
      pc_detail: 'पिछले {n} चक्रों में से {g} में लंबे अंतर (35 दिन से ज़्यादा); {h} मासिक चेक-इन में मोटे बाल।', pc_causes: 'इसके कई कारण होते हैं: थायरॉइड, ज़्यादा prolactin, तनाव, वज़न में बदलाव, स्तनपान, या PMOS। डॉक्टर आम तौर पर पहले कुछ blood test करवाते हैं। इस पैटर्न वाली लगभग आधी महिलाओं को PMOS नहीं निकलता।',
      pc_verdict: 'डॉक्टर की राय', pending: 'समीक्षा बाक़ी', pc_thy: 'थायरॉइड-जैसा पैटर्न', pc_heavy: 'भारी ब्लीडिंग पैटर्न', pc_pain: 'दर्द पैटर्न (endometriosis-जैसा)', pc_pain_d: 'आपके पिछले {n} में से {k} पीरियड में दर्द से दिन रुक गया।', pc_pain_go: 'क्या मुझे जाँच करानी चाहिए?', pc_q2_y: 'गर्भ या स्तनपान न होने पर निप्पल से दूध जैसा स्राव डॉक्टर को दिखाना ज़रूरी है। इसमें एक खून की जाँच (prolactin) होती है।', pc_q1: 'क्या किसी डॉक्टर ने पहले ही PMOS बताया है?', pc_q2: 'निप्पल से दूध जैसा स्राव?', yes: 'हाँ', no: 'नहीं',
      pc_rule: 'नियम P3, संस्करण 1। लॉन्च से पहले Qura की डॉक्टरों और एक स्वतंत्र स्त्री रोग विशेषज्ञ के हस्ताक्षर।', pc_ask: 'मेरी Qura डॉक्टर से पुष्टि माँगें',
      fe_h: 'Fertile दिन', fe_p: 'तारीख़ों से अनुमान, माप नहीं। सिर्फ़ तब दिखता है जब आपके चक्र 7 दिन या कम बदलते हैं।', fe_hidden: 'अभी छिपा है: आपके चक्र 7 दिन से ज़्यादा बदलते हैं, या आप हॉर्मोन पर हैं, या 3 से कम अंतर दर्ज हैं। “बच्चे की योजना” पन्ना बताता है कि कोई app आपका दिन क्यों नहीं बता सकता।',
      fe_likely: 'संभावित fertile दिन', fe_egg: 'अंडा निकलने की सबसे ज़्यादा संभावना', fe_note: 'तारीख़-आधारित tool बहुत कम चक्रों में सही दिन बताते हैं। हर 2–3 दिन में संबंध उतना ही कारगर है जितना समय मिलाना।', fe_strip: 'आज ovulation strip (वैकल्पिक, सिर्फ़ डेटा)', positive: 'Positive', negative: 'Negative', not_taken: 'नहीं की',
      fe_strip_note: 'Strip बिना अंडा निकले भी positive आ सकती है, ख़ासकर PCOS में। strip से हम आपका अनुमान कभी नहीं बदलते।', fe_confirm: 'पक्का जानने के लिए, पुष्टि करें', fe_confirm_p: 'अगले पीरियड से लगभग 7 दिन पहले progesterone blood test, जो डॉक्टर लिखती हैं, या घर पर PdG monitor। डायरी “ovulation confirmed” सिर्फ़ result से लिखती है।',
      ml_h: 'मेरी midlife तस्वीर', ml_p: 'आपने जो दर्ज किया उसकी गिनती, डॉक्टरों की timeline पर। score नहीं, हमारी तरफ़ से कोई stage label नहीं।', ml_where: 'आप कहाँ हो सकती हैं', ml_1: 'बदलाव से पहले', ml_2: 'शुरुआती बदलाव', ml_3: 'बाद के बदलाव', ml_4: 'पीरियड के बाद',
      ml_early: 'पिछले 10 चक्रों में आपके अंतर {n} बार 7 या ज़्यादा दिन से बदले। डॉक्टर इसे बदलाव की शुरुआत कहते हैं।', ml_late: 'आपकी उम्र में 60 दिन या ज़्यादा का अंतर वह है जिसे डॉक्टर बदलाव का बाद वाला हिस्सा कहते हैं।', ml_none: 'आपके अंतरों में अभी midlife बदलाव नहीं दिखता।', ml_young: 'आप 40 से कम हैं, इसलिए चक्र के बदलाव अक्सर दूसरी वजहों से होते हैं। यहाँ सिर्फ़ जानकारी।',
      ml_pcos_off: 'PMOS, हॉर्मोन, गर्भाशय निकाले या HRT में चक्र-आधारित जगह बंद रहती है; तब सिर्फ़ उम्र और लक्षण गिनते हैं।', ml_logged: 'आपने क्या दर्ज किया, 6 में से महीने', ml_hot: 'गर्मी के झोंके', ml_sleep: 'नींद ख़राब', ml_mood: 'मन उदास', ml_heavy: 'भारी ब्लीडिंग', ml_hrt: 'महीने में 2 या ज़्यादा बार गर्मी के झोंकों से रात में नींद खुलती है? सबसे असरदार इलाज हॉर्मोन therapy है, जो MBBS स्त्री रोग विशेषज्ञ लिखते हैं। आपकी Qura डॉक्टर नींद, खाने और चलने-फिरने में मदद करती हैं और refer करती हैं।',
      pw_h: 'लगभग हफ़्ता', pw_p: 'स्कैन रिपोर्ट पर लिखी डिलीवरी की तारीख़ से गिना गया, और वह न हो तो पिछले पीरियड से। "लगभग", क्योंकि तारीख़ें कुछ दिन आगे-पीछे होती हैं। आपकी ANM या डॉक्टर की गिनती ही मानी जाएगी।', pw_set: 'इस पन्ने के लिए Sakhi को बताएँ कि आप गर्भवती हैं।', pw_t1: 'हफ़्ते 1–13', pw_t2: 'हफ़्ते 14–27', pw_t3: 'हफ़्ते 28–40',
      pw_v1: 'मुलाक़ात 1: 12 हफ़्ते से पहले (पंजीकरण, MCP card)', pw_v2: 'मुलाक़ात 2: 14–26 हफ़्ते', pw_v3: 'मुलाक़ात 3: 28–34 हफ़्ते', pw_v4: 'मुलाक़ात 4: 36 हफ़्ते और बाद', pw_ask: 'अगली मुलाक़ात में पूछने की बातें', pw_moves: 'बच्चे की हलचल', pw_moves_p: 'ज़्यादातर महिलाएँ 16 से 24 हफ़्ते के बीच पहली बार महसूस करती हैं। जब नियमित हो जाए, तो हलचल कम होने पर उसी दिन जाँच, अगली सुबह नहीं।',
      pw_a1: '12 हफ़्ते से कम हो तो folic acid अभी; चौथे महीने से रोज़ iron और folic acid', pw_a2: 'calcium आम तौर पर 14 हफ़्ते से; iron की गोली के साथ नहीं', pw_a3: 'Td टीका: पहली खुराक, दूसरी 4 हफ़्ते बाद', pw_a4: 'पहली मुलाक़ात में sugar test और फिर 24–28 हफ़्ते में, ख़ासकर PMOS में; हर बार BP', pw_a5: '18–20 हफ़्ते में anomaly scan', pw_gov: 'हर महीने की 9 तारीख़ को डॉक्टर की मुफ़्त जाँच (PMSMA)। अपनी ASHA या ANM के पास पंजीकरण कराएँ।',
      scan_date: 'scan की तारीख़ (वैकल्पिक)', set: 'सेट', lmp: 'पिछले पीरियड का पहला दिन', after_change: 'कुछ बदले तो यहाँ बताएँ', loss: 'गर्भ नहीं रहा', loss_p: 'हमें दुख है। आपको और कुछ बताना ज़रूरी नहीं। हर घंटे pad भीगना, बुख़ार या तेज़ दर्द: अभी अस्पताल (112)। एक हफ़्ते में स्त्री रोग विशेषज्ञ या PHC जाँच करे; अपना blood group बताएँ। Tele-MANAS 14416 आपके साथ है।',
      sample_note: 'नमूना डेटा लोड है। आपकी नई entries इसी के साथ रहेंगी। नए सिरे से शुरू करने के लिए “मैं” पन्ने पर सब delete करें।', why: 'यह क्यों दिख रहा है?', ok: 'ठीक', months: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'], dows: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'],
      ask_saved_topic: 'आपके कॉल अनुरोध में जोड़ा गया।', teen_learn: 'किशोरियों के लिए “जानें” के पन्ने सिर्फ़ जानकारी हैं।',
      care: 'देखभाल', care_h: 'हर पड़ाव की देखभाल', care_p: 'गाइड, ट्रैकर और रिमाइंडर, पहले पीरियड से मेनोपॉज़ के बाद तक। मुफ़्त, आपकी भाषा में।', suggested: 'आपके लिए', search_tools: 'गाइड और टूल खोजें', no_tools: 'कुछ नहीं मिला। दूसरा शब्द आज़माएँ।',
      sec_periods: 'पीरियड', sec_contra: 'गर्भनिरोध', sec_pregtest: 'पीरियड मिस होना और अनचाहा गर्भ', sec_ttc: 'बच्चे की कोशिश', sec_preg: 'गर्भावस्था', sec_post: 'डिलीवरी के बाद', sec_loss: 'गर्भ का नुक़सान', sec_intimate: 'निजी सेहत और सुरक्षा', sec_cond: 'बीमारियाँ', sec_screen: 'स्क्रीनिंग और जाँचें', sec_meno: 'मेनोपॉज़', sec_teen: 'बेटियाँ और परिवार', sec_tools: 'मेरे टूल',
      coming_up: 'आगे क्या है', see_all: 'सब देखें', need_diary_h: 'इसे सेव करने के लिए डायरी शुरू करें', need_diary_p: 'हर गाइड बिना डायरी के पढ़ सकती हैं। entries सेव करने के लिए डायरी चाहिए, जो prototype में इसी फ़ोन पर रहती है।',
      more_langs: 'और भाषाएँ', partly: 'इस prototype में आंशिक अनुवाद। डॉक्टरों की समीक्षा तक बाक़ी हिस्सा English में दिखेगा।', lang_h: 'अपनी भाषा चुनें',
      sample_meera: 'मीरा, 29 · 24 हफ़्ते की गर्भवती', sample_sunita: 'सुनीता, 33 · 3 हफ़्ते पहले बच्चा हुआ', sample_kamla: 'कमला, 48 · पीरियड बदल रहे हैं', more_samples: 'और नमूना महिलाएँ',
      all_tools: 'सभी गाइड और टूल', all_tools_d: 'गर्भनिरोध, गर्भावस्था, डिलीवरी के बाद, स्क्रीनिंग, मेनोपॉज़ और भी', gated_short: 'मंज़ूरी बाक़ी',
      pp_eyebrow: 'डिलीवरी के बाद', pp_days: 'दिन हुए बच्चे के जन्म को', pp_days_1: 'दिन हुआ बच्चे के जन्म को', pp_p: 'पीरियड कभी भी लौट सकते हैं, और पहले पीरियड से पहले भी गर्भ ठहर सकता है। ब्लीडिंग फिर शुरू हो तो यहाँ दर्ज करें।', pp_go: 'रिकवरी और दूध पिलाना',
      off_eyebrow: 'चक्र की गिनती बंद है', off_p_hyst: 'आपने बताया कि गर्भाशय निकाला गया है या उसकी परत का इलाज हुआ है, इसलिए गिनने को कोई चक्र नहीं है।', off_p_stopped: 'आपने बताया कि आपके पीरियड बंद हो गए हैं। अब थोड़ी सी भी ब्लीडिंग हो तो डॉक्टर से जाँच ज़रूरी है।', off_go: 'मेनोपॉज़ देखभाल',
      notes_brand: 'मेरे नोट्स', protolabels: 'Prototype के लेबल दिखाएँ', protolabels_d: 'अंदरूनी demo के लिए चालू करें: Demo profiles (नमूना महिलाएँ प्रिया, आशा, मीरा, सुनीता और कमला) और मंज़ूरी वाले लेबल दिखते हैं। महिलाओं के साथ testing में इसे बंद रखें।', proto_h: 'Prototype',
      applock: 'ऐप लॉक', applock_d: 'Sakhi खुलने पर 4 अंकों का PIN माँगे', pin_set_h: '4 अंकों का PIN चुनें', pin_again: 'वही PIN दोबारा लिखें', pin_enter: 'अपना PIN डालें', pin_wrong: 'PIN मेल नहीं खाया। फिर कोशिश करें।', pin_mismatch: 'दोनों PIN अलग थे। फिर से शुरू करें।', pin_forgot: 'PIN भूल गईं?', pin_forgot_p: 'अंदर जाने का एक ही तरीका है: इस फ़ोन से सब कुछ delete करके नए सिरे से शुरू करें।', pin_on: 'ऐप लॉक चालू है', pin_off: 'ऐप लॉक बंद है', pin_note: 'ऐप लॉक साझा फ़ोन के लिए एक आसान लॉक है। इससे कोई ग़लती से Sakhi नहीं खोल पाता; यह encryption नहीं है।',
      disguise: 'ऐप का नाम और icon छिपाएँ', disguise_d: 'होम स्क्रीन पर Sakhi “Notes” के नाम से दिखेगा', disguise_done: 'हो गया। icon बदलने में कुछ सेकंड लग सकते हैं।',
      undo: 'वापस लें', add_details: 'विवरण जोड़ें', logged_start: 'आज पीरियड की शुरुआत दर्ज हुई', logged_end: 'आज पीरियड ख़त्म होना दर्ज हुआ', logged_spot: 'आज स्पॉटिंग दर्ज हुई', undone: 'हटा दिया',
      d_start: 'शुरू', d_end: 'बंद', d_spot: 'निशान', d_day: 'दिन', d_weeks: 'हफ़्ते', d_hidden: 'गोपनीयता के लिए छिपा है। देखने के लिए नंबर पर टैप करें।', d_first: 'शुरू करने के लिए पहली entry डालें।', d_reminder: 'रिमाइंडर', today_h: 'आज',
      more: 'और पढ़ें', less: 'कम', show_more: 'और दिखाएँ', show_less: 'कम दिखाएँ',
      weeks_preg: 'हफ़्ते की गर्भवती', due_on: 'डिलीवरी लगभग {d}', this_week: 'इस हफ़्ते', pw_visits: 'जाँच की मुलाक़ातें', preg_set_date: 'अपना हफ़्ता देखने के लिए स्कैन रिपोर्ट पर लिखी डिलीवरी की तारीख़ या पिछले पीरियड का पहला दिन डालें।', preg_date_b: 'तारीख़ डालें', preg_yes_b: 'मैं गर्भवती हूँ',
      for_you: 'आपके लिए', care_topics: 'सभी विषय', topic_count: '{n} गाइड और टूल', res_tools: 'गाइड और टूल', res_articles: 'पढ़ने के लिए लेख', search_all: 'खोजें: पीरियड, सफ़ेद पानी, PCOD, गर्भ…',
      yob_h: 'आप किस साल पैदा हुईं?', yob_p: 'Sakhi 18 साल और उससे ऊपर की महिलाओं के लिए है। हम सिर्फ़ साल रखते हैं, इसी फ़ोन पर।', yob_ph: 'जैसे 1996', yob_month: 'आप किस महीने में पैदा हुईं?', yob_bad: 'कृपया 1996 जैसा साल लिखें',
      goal_h: 'आपको किस बात में मदद चाहिए?', goal_p: 'जो भी सही लगे, चुनें। बाद में “मैं” पन्ने पर बदल सकती हैं।', g_track: 'पीरियड का हिसाब रखना', g_avoid: 'गर्भ से बचना', g_ttc: 'बच्चे की कोशिश', g_preg: 'मैं गर्भवती हूँ', g_baby: 'हाल ही में बच्चा हुआ है', g_pmos: 'PMOS (PCOS) या अनियमित पीरियड', g_meno: '40 के बाद पीरियड में बदलाव', g_learn: 'बस जानकारी चाहिए', baby_date: 'बच्चे का जन्म कब हुआ?', ob_birth_l: 'जन्म की तारीख़', pill_q: 'मैं pill या कोई और हॉर्मोन वाली दवा लेती हूँ', lp_h_preg: 'पिछले पीरियड का पहला दिन', lp_p_preg: 'इससे डिलीवरी की तारीख़ निकलती है। याद न हो तो छोड़ दें; scan की तारीख़ बाद में डाल सकती हैं।',
      log_last: 'पिछला पीरियड दर्ज करें', d_log_last: 'पहली तारीख़ डालें', ci_sleep: 'नींद ख़राब', ci_nausea: 'जी मिचलाना या उल्टी', ci_swell: 'पैर, हाथ या चेहरे पर सूजन', ci_head: 'सिरदर्द', ci_heartburn: 'सीने में जलन', ci_constip: 'क़ब्ज़', ci_back: 'कमर दर्द', ci_pbleed: 'कोई भी ब्लीडिंग या स्पॉटिंग', ci_lochia: 'पीरियड से ज़्यादा ब्लीडिंग', ci_stitch: 'टाँकों या ऑपरेशन के घाव में दर्द', ci_breast: 'स्तन पर दर्द वाली या लाल जगह', ci_leak: 'पेशाब निकल जाना', ci_joint: 'जोड़ों या मांसपेशियों में दर्द', ci_dry: 'योनि में सूखापन या संबंध में दर्द', ci_urine: 'पेशाब निकल जाना या जल्दी-जल्दी लगना', ci_palp: 'दिल की धड़कन तेज़ होना',
      ci_flag_preg: 'गर्भ में ब्लीडिंग, या सूजन या धुंधली नज़र के साथ तेज़ सिरदर्द: आज ही डॉक्टर को दिखाएँ। बहुत ब्लीडिंग या दौरे: अभी 112 पर कॉल करें।', ci_flag_post: 'एक घंटे में pad भीग जाए या बड़े थक्के आएँ: अभी 112 पर कॉल करें। बुख़ार या बदबू: आज ही डॉक्टर को दिखाएँ।', ci_flag_breast: 'बुख़ार के साथ स्तन पर लाल, दर्द वाली जगह: आज ही डॉक्टर को दिखाएँ।',
      cal_a_period: 'पीरियड का दिन', see_all_n: 'सभी {n} देखें',
      appearance: 'रंग-रूप', theme_light: 'हल्का', theme_dark: 'गहरा', theme_system: 'फ़ोन जैसा',
      fab_add: 'आज के लिए कुछ जोड़ें', fab_close: 'बंद करें', note_h: 'नोट', note_ph: 'आज के बारे में और कुछ?', note_p: 'सिर्फ़ इसी फ़ोन पर। लिखते ही सेव हो जाता है।',
      hint_wk: 'जो हुआ, उसे जोड़ने के लिए किसी भी दिन पर टैप करें।', hint_ask: 'यहाँ कुछ भी पूछें, हिंदी या अंग्रेज़ी में।', hint_mic: 'या माइक दबाकर बोलें।', hint_fab: 'आज का पीरियड, लक्षण, मन या नोट जोड़ने के लिए + दबाएँ। किसी और दिन के लिए उसी दिन पर टैप करें।',
      hint_ok: 'समझ गई', hint_n: '{n} में से {i}',
      look_h: 'Sakhi का रूप', look_n: 'रूप {n}', sakhi_alt: 'Sakhi, आपकी डायरी की सहेली',
      noted_h: 'आपने क्या नोट किया', noted_p: 'पिछले 90 दिन। हर लाइन बताती है कि कितने दिन आपने इसे नोट किया।', noted_empty: '+ दबाकर दर्द, मन या कुछ और नोट करें। जो सबसे ज़्यादा होता है, वह यहाँ दिखेगा।', k_days: '{n} दिन', k_day1: '1 दिन', add_today: 'आज जोड़ें', cal_a_noted: 'नोट किया',
      ob_lang_h: 'अपनी भाषा चुनें', ob_phone: 'फ़ोन की भाषा', ob_partly: 'थोड़ा अनुवाद', ob_hear: 'कोई भी स्क्रीन सुनने के लिए ऊपर स्पीकर दबाएँ।',
      ob_hello_h: 'आपकी पीरियड डायरी, आपकी भाषा में', ob_p1: 'आपकी डायरी इसी फ़ोन पर रहती है।', ob_p2: 'सीधे-सादे जवाब, सरकारी और डॉक्टरी गाइडलाइन के आधार पर।', ob_p3: 'मुफ़्त। कोई विज्ञापन नहीं।',
      ob_read: 'सिर्फ़ पढ़ना है', ob_notice_link: 'Sakhi आपका डेटा कैसे रखती है', w_restore: 'दूसरे फ़ोन से आ रही हैं? अपनी डायरी वापस लाएँ',
      su_phone_h: 'आपका मोबाइल नंबर', su_phone_p: 'नंबर आपका ही है, यह जाँचने के लिए हम एक कोड भेजते हैं। आपकी डायरी इसी फ़ोन पर रहती है: Qura को सिर्फ़ आपके अकाउंट की जानकारी मिलती है।', su_phone_l: 'मोबाइल नंबर', su_year_l: 'आपका जन्म किस साल हुआ', su_year_u18: '18 से कम', su_choose: 'चुनें', su_phone_bad: '10 अंकों का मोबाइल नंबर डालें।', su_year_bad: 'अपने जन्म का साल चुनें।', su_send: 'कोड भेजें', su_agree: 'आगे बढ़कर आप इससे सहमत हैं:', su_code_h: 'कोड डालें', su_code_p: 'हमने {p} पर 6 अंकों का कोड भेजा है।', su_code_wa: 'हमने {p} पर WhatsApp से 6 अंकों का कोड भेजा है।', su_code_sms: 'हमने {p} पर SMS से 6 अंकों का कोड भेजा है।', su_sms_instead: 'WhatsApp नहीं है? SMS से भेजें', su_code_l: '6 अंकों का कोड', su_change: 'नंबर बदलें', su_resend: 'नया कोड भेजें', su_resend_in: 'नया कोड {n} में', su_verify: 'जाँचें', su_wrong: 'कोड मेल नहीं खाया। SMS देखकर फिर से डालें।', su_expired: 'इस कोड का समय ख़त्म हो गया। नया कोड मँगाएँ।', su_locked: 'बहुत बार कोशिश हो गई। थोड़ी देर रुककर फिर कोशिश करें।', su_net: 'Qura तक नहीं पहुँच पाए। इंटरनेट देखकर फिर कोशिश करें।', su_later: 'अभी आगे बढ़ें', su_later_p: 'साइन-अप बाद में होम या "मैं" पेज से कर सकती हैं। डायरी उसके बिना भी चलती है।', su_demo: 'Prototype: कोई message नहीं भेजा जाता। कोड 123456 है।', su_about_h: 'बस हो गया', su_about_p: 'सब वैकल्पिक है। इससे Qura ज़्यादा महिलाओं तक पहुँच पाता है; आपकी डायरी इसमें कभी शामिल नहीं होती।', su_name_l: 'पहला नाम (वैकल्पिक)', su_pin_l: 'पिन कोड (वैकल्पिक)', su_pin_d: 'ताकि Qura जान सके कि Sakhi किन इलाक़ों तक पहुँच रही है।', su_pin_bad: 'पिन कोड में 6 अंक होते हैं।', su_heard_l: 'आपको Sakhi के बारे में कहाँ से पता चला?', su_h_doc: 'डॉक्टर या आशा दीदी', su_h_fam: 'दोस्त या परिवार', su_h_wa: 'WhatsApp', su_h_social: 'Instagram या YouTube', su_h_qura: 'Qura', su_h_other: 'कहीं और', su_upd_h: 'Sakhi से अपडेट', su_upd_sms: 'मुझे SMS से अपडेट भेजें', su_upd_wa: 'मुझे WhatsApp पर अपडेट भेजें', su_upd_d: 'नई गाइड और सरकारी स्वास्थ्य योजनाओं की ख़बरें। आपकी अपनी सेहत के बारे में कभी कुछ नहीं।', su_skip: 'छोड़ें', su_ok: 'आपका साइन-अप हो गया।',
      acc_h: 'आपका Sakhi अकाउंट', acc_none: 'आपने अभी साइन-अप नहीं किया है। एक मिनट लगता है: आपका नंबर और एक कोड।', acc_signup: 'साइन-अप करें', acc_num: 'मोबाइल नंबर', acc_name: 'नाम', acc_pin: 'पिन कोड', acc_heard: 'Sakhi के बारे में पता चला', acc_upd: 'अपडेट', acc_sms: 'SMS', acc_on: 'चालू', acc_off: 'बंद', acc_edit: 'जानकारी बदलें', acc_logout: 'लॉग-आउट', acc_del: 'मेरा अकाउंट मिटाएँ', acc_del_sure: 'अपना Sakhi अकाउंट मिटाएँ? Qura आपका नंबर और जानकारी मिटा देगा। इस फ़ोन पर आपकी डायरी बनी रहेगी; उसे भी हटाना हो तो "सब कुछ delete करें" दबाएँ।', acc_del_yes: 'हाँ, मिटाएँ', acc_del_done: 'आपका अकाउंट मिटा दिया गया।', acc_out_done: 'आप लॉग-आउट हो गईं। आपकी डायरी यहीं है।', acc_saved: 'सेव हो गया।', acc_pending: 'अभी भेजा नहीं गया। इंटरनेट मिलने पर Sakhi फिर कोशिश करेगी।', acc_card_h: 'साइन-अप पूरा करें', acc_card_p: 'अपना Sakhi अकाउंट रखने के लिए मोबाइल नंबर जोड़ें। आपकी डायरी इसी फ़ोन पर रहती है।', acc_keeps: 'Qura सिर्फ़ यही जानकारी रखता है। आपकी डायरी इसी फ़ोन पर रहती है।', ob_notice_5: 'आपका Sakhi अकाउंट: Qura आपका मोबाइल नंबर और जन्म का साल रखता है, और जो आप ख़ुद जोड़ें (पहला नाम, पिन कोड, Sakhi के बारे में कहाँ से पता चला, अपडेट चाहिए या नहीं)। साथ में आख़िरी बार Sakhi कब खोली और ऐप का version। आपकी डायरी से कुछ नहीं।',
      ob_notice_1: 'आप जो भी नोट करती हैं (तारीख़ें, लक्षण, नोट), वह सिर्फ़ इसी फ़ोन पर सेव होता है।', ob_notice_2: 'जब तक आप ख़ुद शेयर न करें, आपकी डायरी कभी Qura या किसी और के पास नहीं जाती, जैसे कॉल से पहले अपनी डॉक्टर को दिखाना। Sakhi हर बार पूछती है और बताती है कि क्या शेयर होगा।', ob_notice_3: 'कोई विज्ञापन नहीं, कोई विज्ञापन कंपनी नहीं। आपकी entries कभी बेची नहीं जातीं।', ob_notice_4: 'अपनी डायरी कभी भी "मैं" पेज से मिटा सकती हैं, और अपना अकाउंट भी।',
      ob_age_h: 'आपका जन्म किस साल हुआ?', ob_age_p: 'डायरी 18 साल और उससे बड़ी महिलाओं के लिए है। Qura आपके अकाउंट के साथ सिर्फ़ साल रखता है।', ob_before: '1950 से पहले', ob_after: '2010 या बाद में', ob_month_h: 'और महीना?', ob_u18: '18 से कम? मदद के सारे पन्ने फिर भी पढ़ सकती हैं।',
      ob_stage_h: 'अभी आपके साथ क्या चल रहा है?', ob_stage_p: 'एक चुनें। बाद में कभी भी बदल सकती हैं।', ob_st_cycle: 'मेरे पीरियड', ob_st_ttc: 'बच्चे की कोशिश', ob_st_preg: 'मैं गर्भवती हूँ', ob_st_post: 'मेरा बच्चा हुआ है', ob_st_meno: '40 के बाद बदलते पीरियड', ob_st_learn: 'बस जानना है',
      ob_lp_p: 'अंदाज़ा भी चलेगा। बाद में ठीक कर सकती हैं।', ob_lp_w1: 'लगभग एक हफ़्ता पहले', ob_lp_w2: 'लगभग 2 हफ़्ते पहले', ob_lp_w34: '3 से 4 हफ़्ते पहले', ob_lp_more: 'एक महीने से ज़्यादा पहले', ob_lp_stop: 'मेरे पीरियड बंद हो गए हैं',
      ob_preg_h: 'क्या डिलीवरी की तारीख़ पता है?', ob_preg_p: 'यह आपकी स्कैन रिपोर्ट पर लिखी होती है। न पता हो, तो पिछले पीरियड का पहला दिन भी चलेगा।', ob_preg_edd: 'डिलीवरी की तारीख़ चुनें', ob_preg_lmp: 'पिछले पीरियड की तारीख़ चुनें', ob_later: 'बाद में जोड़ूँगी',
      ob_bf_q: 'क्या आप स्तनपान करा रही हैं?', ob_yes: 'हाँ', ob_no: 'नहीं', ob_some: 'कभी-कभी',
      ob_sh_h: 'क्या यह फ़ोन कोई और भी चलाता है?', ob_sh_me: 'सिर्फ़ मैं', ob_sh_some: 'कभी-कभी', ob_sh_fam: 'हाँ, घर वाले भी',
      ob_kit_h: 'अपनी डायरी निजी रखें', ob_kit_lock: 'फ़िंगरप्रिंट या PIN से लॉक', ob_kit_plain: 'स्क्रीन पर सादे शब्द', ob_kit_plain_d: '"पीरियड" जैसे शब्द नहीं दिखेंगे', ob_kit_notes: 'ऐप "Notes" नाम से दिखे', ob_kit_p: 'ये सब कभी भी "मैं" पेज पर बदल सकती हैं।', ob_done: 'हो गया',
      approx_note: 'शुरू होने की तारीख़ अंदाज़े से है। जिस दिन सच में शुरू हुआ, उस दिन पर टैप करके ठीक करें।', pp_rec_b: 'आज की रिकवरी', pp_feed_b: 'दूध पिलाना',
      stage_mid: '40 के बाद बदलते पीरियड', sit_mid: '40 के बाद बदलते पीरियड', sit_mid_d: 'होम पर hot flushes, नींद और 40 के बाद के सवाल दिखेंगे',
      learn_hero_h: 'जवाब ढूँढ रही हैं?', learn_p: 'नीचे कुछ भी पूछें या आज का कार्ड देखें। आपकी डायरी जब चाहें, तैयार है।', learn_card: 'आज का कार्ड', learn_log: 'पीरियड दर्ज करें',
      qura_ttc_h: 'बच्चे की तैयारी कर रही हैं?', qura_ttc_p: 'गर्भ से पहले खान-पान, वज़न और PMOS पर Qura की डॉक्टर से बात करें। पहली कॉल मुफ़्त है।',
      qura_pmos_h: 'अनियमित पीरियड या PMOS?', qura_pmos_p: 'Qura की डॉक्टर से खुलकर बात करें। पहली कॉल मुफ़्त है।',
      qura_meno_h: '40 के बाद पीरियड बदल रहे हैं?', qura_meno_p: 'खान-पान, नींद और ताक़त के बारे में Qura की डॉक्टर से पूछें। पहली कॉल मुफ़्त है।',
      late_preg_d: 'कृपया आज ही अपने अस्पताल जाएँ। अगर जा चुकी हैं, तो “मैं” पन्ने पर “मेरी स्थिति” बदल दें।', bb_h: 'क्या आपका बच्चा आ गया?', bb_p: 'डिलीवरी की तारीख़ निकल चुकी है। जब ठीक लगे, Sakhi को बताइए; होम आपके हिसाब से बदल जाएगा।', bb_add: 'जन्म की तारीख़ जोड़ें', bb_not: 'अभी नहीं', bb_end: 'मेरी प्रेग्नेंसी ख़त्म हो गई',
      sh_h: 'अपनी Qura डॉक्टर को डायरी दिखाएँ?', sh_will: 'आपकी डॉक्टर ये देखेंगी:', sh_i1: 'पीरियड की तारीख़ें, अंतर और फ़्लो', sh_i2: '"मेरी स्थिति" में आपने जो चुना', sh_i3: 'पिछले तीन महीनों के चेक-इन', sh_i4: 'Sakhi के टूल में आपने जो सेव किया, जैसे दवाएँ, टेस्ट रिज़ल्ट या प्रेग्नेंसी लॉग', sh_not: 'आपके दिन के नोट नहीं। सिर्फ़ इस कॉल के लिए। "मैं" पेज पर कभी भी शेयर करना बंद कर सकती हैं।', sh_yes: 'इस कॉल के लिए दिखाएँ', sh_no: 'बिना दिखाए बुक करें',
      browse_h: 'सिर्फ़ पढ़ रही हैं', browse_p: 'हर गाइड और सुरक्षा के पन्ने आपके लिए खुले हैं। जब चाहें डायरी शुरू करें; वह इसी फ़ोन पर रहती है।',
      qa_pmsigns: 'ध्यान देने वाले लक्षण', qa_pmtests: 'कौन-सी जाँच और क्यों', qa_pmfood: 'हार्मोन के लिए खाना',
      tour_home: 'आपका होम', tour_diary: 'आपकी डायरी', tour_care: 'देखभाल और डॉक्टर', tour_help: 'इमरजेंसी में मदद', tour_me: 'शेयर्ड फ़ोन पर निजता', tour_steps: '{n} छोटे क़दम', tour_seen: 'देख लिया',
      tour_listen: 'सुनें', tour_close: 'बंद करें', tour_later: 'अभी नहीं', tour_back: 'पीछे', tour_next: 'आगे', tour_done: 'हो गया', tour_great: 'बस इतना ही। आप सीख गईं।',
      howto_h: 'Sakhi कैसे इस्तेमाल करें', howto_p: 'छोटे टूर, जिन्हें कभी भी फिर देख सकती हैं।', tours_auto: 'नई स्क्रीन पर टूर दिखाएँ', tours_auto_d: 'किसी स्क्रीन को पहली बार खोलने पर एक छोटा टूर', tour_voice: 'टूर पढ़कर सुनाएँ', tour_voice_d: 'Sakhi हर क़दम पढ़कर सुनाती है। शेयर्ड फ़ोन के लिए यह शुरू में बंद रहता है।', tours_again: 'टूर फिर से दिखाएँ', tours_again_done: 'टूर फिर से दिखेंगे।',
      tw1_h: 'आपका हफ़्ता', tw1_p: 'हर गोला एक दिन है। जो हुआ, नोट करने के लिए दिन पर टैप करें।', tw2_h: 'एक टैप में नोट', tw2_p: 'ये बटन आज का हाल एक टैप में सेव करते हैं। ग़लती हो तो वापस ले सकती हैं।', tw3_h: 'कुछ भी पूछें', tw3_p: 'हिंदी या अंग्रेज़ी में सवाल लिखें। अभी आज़माएँ: बॉक्स पर टैप करें।', tw3_pm: 'सवाल लिखें, या माइक दबाकर हिंदी में बोलें। अभी आज़माएँ।',
      td1_h: 'आपका कैलेंडर', td1_p: 'किसी भी दिन को भरने या तारीख़ ठीक करने के लिए उस पर टैप करें। बिंदु बताते हैं कि आपने क्या नोट किया।', td1_pd: 'नोट जोड़ने या बदलने के लिए किसी भी दिन पर टैप करें।', td2_h: 'ट्रेंड्स', td2_p: 'पीरियड के बीच के अंतर और आपने सबसे ज़्यादा क्या नोट किया, महीनों के साथ।', td2_pd: 'महीनों के साथ आपके नोट।', td3_h: 'आज के लिए जोड़ें', td3_p: 'आज का पीरियड, लक्षण, मन या नोट जोड़ने के लिए + दबाएँ। अभी आज़माएँ।', td3_pd: 'आज के लिए नोट जोड़ने को + दबाएँ। अभी आज़माएँ।',
      tc1_h: 'हर पड़ाव की देखभाल', tc1_p: 'कोई विषय चुनें: पीरियड, प्रेग्नेंसी, डिलीवरी के बाद, 40 के बाद और भी।', tc1_pd: 'पढ़ने के लिए कोई विषय चुनें।', tc2_h: 'कोई भी पन्ना सुनें', tc2_p: 'स्पीकर दबाएँ, Sakhi पन्ना पढ़कर सुनाएगी।', tc3_h: 'डॉक्टर से बात करें', tc3_p: 'Qura की डॉक्टर से कॉल बुक करने के लिए कभी भी "डॉक्टर" दबाएँ। पहली कॉल मुफ़्त है।',
      th1_h: 'डॉक्टर से बात', th1_p: 'जो सवाल एक-दो दिन रुक सकते हैं, उनके लिए यहाँ कॉल बुक करें।', th2_h: 'इमरजेंसी में', th2_p: 'तुरंत 112 पर कॉल करें। सारे इमरजेंसी नंबर यहाँ हैं।',
      tm1_h: 'शेयर्ड फ़ोन पर निजता', tm1_p: 'Sakhi को लॉक करें, सादे शब्द चुनें, या ऐप को Notes जैसा दिखाएँ।', tm1_pw: 'Sakhi पर PIN लगाएँ, या होम पर सादे शब्द रखें।', tour_diary_d: 'आपके नोट्स', tm2_h: 'सब कुछ मिटाएँ', tm2_p: 'पुष्टि करने के बाद, Sakhi ने इस फ़ोन पर जो भी सेव किया, सब मिट जाता है।',
      tour_hpreg: 'प्रेग्नेंसी में आपका होम', tour_hpost: 'डिलीवरी के बाद आपका होम', tour_httc: 'बच्चे की कोशिश', tour_hmeno: '40 के बाद', tour_day: 'डायरी का एक दिन', tour_day_d: 'नोट्स का एक दिन', tour_ans: 'झटपट जवाब', tour_ci: 'महीने का चेक-इन', tour_ring: 'चक्र का गोला', tour_g_screens: 'स्क्रीन', tour_g_features: 'फ़ीचर', tour_step1: '1 छोटा क़दम', tour_q: 'यह क्या दिखाता है?',
      thp1_h: 'प्रेग्नेंसी का हफ़्ता', thp1_p: 'बड़ा नंबर आपकी प्रेग्नेंसी का हफ़्ता है, और चित्र बच्चे का आकार दिखाता है। क्या बदल रहा है, देखने के लिए "{b}" दबाएँ।', thp2_h: 'एक टैप में', thp2_p: '"{a}", लक्षण और महीने का चेक-इन। "{b}" में आपका वज़न, BP, sugar, Hb और गोलियाँ रहती हैं।', thp3_h: 'कुछ भी पूछें', thp3_p: 'सवाल लिखें, या नीचे से एक चुनें। पहला, "{b}", बताता है कि कब 112 पर कॉल करें।', thp3_pm: 'सवाल लिखें या बोलें, या नीचे से एक चुनें। पहला, "{b}", बताता है कि कब 112 पर कॉल करें।',
      tpp1_h: 'पहले 6 हफ़्ते', tpp1_p: 'डिलीवरी के बाद के 6 हफ़्तों में यह गोला हर दिन थोड़ा भरता है। क्या उम्मीद करें, जानने के लिए "{b}" दबाएँ।', tpp1_hl: 'जन्म के बाद से', tpp1_pl: 'Sakhi बच्चे के जन्म से दिन गिनती है। पीरियड कभी भी लौट सकते हैं, इसलिए ब्लीडिंग शुरू हो तो दर्ज करें।', tpp2_p: '"{a}" 1 मिनट की जाँच है: ब्लीडिंग, टाँके, बुखार, स्तन और मन। "{b}" में फ़ीड का हिसाब रहता है।', tpp2_pl: 'पीरियड लौटे तो यहाँ दर्ज करें, साथ में लक्षण और महीने का चेक-इन।', tpp3_p: 'सवाल लिखें, या नीचे से एक चुनें: पहले 6 हफ़्ते, दूध पिलाना, डिलीवरी के बाद का मन और भी।', tpp3_pm: 'सवाल लिखें या बोलें, या नीचे से एक चुनें: पहले 6 हफ़्ते, दूध पिलाना, डिलीवरी के बाद का मन और भी।',
      tht1_h: 'कोशिश के महीने', tht1_p: 'Sakhi गिनती है कि आप कितने महीनों से कोशिश कर रही हैं, साथ में तैयारी की चेकलिस्ट। खोलने के लिए दबाएँ।', tht2_h: 'बच्चे की प्लानिंग के सवाल', tht2_p: 'टेस्ट कब करें, तैयारी कैसे करें, और कोई ऐप आपका पक्का फ़र्टाइल दिन क्यों नहीं बता सकता। हर एक, एक टैप में।', thm1_h: '40 के बाद के सवाल', thm1_p: 'हॉट फ़्लश, 40 के बाद पीरियड, हॉर्मोन थेरेपी, हड्डियाँ, नींद और मन। हर एक, एक टैप में।', thm2_h: 'मेनोपॉज़ के बाद ब्लीडिंग', thm2_p: 'पीरियड एक साल से बंद हों और फिर ब्लीडिंग हो, तो डॉक्टर से जाँच ज़रूरी है। क्यों, यह पढ़ने के लिए दबाएँ।',
      tdy1_h: 'पीरियड', tdy1_p: 'ब्लीडिंग के पहले दिन "{a}" और आख़िरी दिन "{b}" दबाएँ। दो पीरियड के बीच कुछ बूँदें हों तो "{c}"।', tdy1_pd: 'यह दिन यहाँ दर्ज करें: शुरू, ख़त्म, या कुछ बूँदें।', tdy2_h: 'आपको कैसा लगा', tdy2_p: 'जो भी महसूस हुआ, उस पर टैप करें। टैप करते ही सेव हो जाता है, हटाने के लिए फिर से टैप करें।', tdy3_h: 'नोट', tdy3_p: 'दिन के बारे में कुछ और? यहाँ लिखें। यह सिर्फ़ इसी फ़ोन पर रहता है।',
      tan1_h: 'सुनें', tan1_p: '"{b}" दबाएँ, Sakhi यह जवाब पढ़कर सुनाएगी।', tan2_h: 'अब भी चिंता है?', tan2_p: 'इस बारे में Qura की डॉक्टर से कॉल बुक करें। पहली कॉल मुफ़्त है।', tci1_h: 'महीने में एक बार', tci1_p: 'इस महीने जो भी हुआ, उस पर टैप करें। लगभग एक मिनट लगता है।', tci2_h: 'सेव करें', tci2_p: 'हो जाने पर "{b}" दबाएँ। आपके जवाब इसी फ़ोन पर रहते हैं।',
      tr1_h: 'चक्र का गोला', tr1_p: 'नंबर आपके चक्र का दिन है। लाल हिस्सा पीरियड है, हल्की पट्टी बताती है कि अगला पीरियड आम तौर पर कब आता है, और बिंदु आज है।', tst1_p: 'प्रेग्नेंट हैं, बच्चा हुआ है, कोशिश कर रही हैं, या पीरियड बदल रहे हैं? यहाँ दबाएँ, Sakhi भी आपके साथ बदलेगी।',
      pat_h: 'आपके साथ क्या दोहराता है', pat_p: 'उन {n} पीरियड से, जिनके आसपास आपने नोट्स लिखे। पैटर्न बदल सकते हैं, और यह जाँच का नतीजा नहीं है।', pat_before: 'अक्सर पीरियड से लगभग {n} दिन पहले', pat_daybefore: 'अक्सर पीरियड से एक दिन पहले से', pat_day1: 'अक्सर पीरियड के पहले दिन से', pat_dayn: 'अक्सर पीरियड के {n}वें दिन', pat_count: 'नोट्स वाले {b} में से {a} पीरियड में', pat_wait: 'पीरियड के आसपास कैसा लगता है, नोट करें। नोट्स वाले 3 पीरियड के बाद Sakhi दिखाएगी कि आपके साथ क्या दोहराता है।', pat_none: 'अभी कुछ साफ़ तौर पर दोहराता नहीं दिखता। कैसा लगता है, नोट करती रहें।',
      hu_h: 'आपका पीरियड लगभग {n} दिन में आ सकता है', hu_h1: 'आपका पीरियड कल से आ सकता है', hu_h_d: 'अगले कुछ दिनों के लिए याद दिलाना', hu_likely: 'संभावित: {r}।', hu_pat_h: 'पिछली कुछ बार:', hu_ready: 'पैड और गर्म पानी की थैली तैयार रखें, और हो सके तो थोड़ा आराम प्लान करें।', hu_ready_d: 'अपनी चीज़ें तैयार रखें।', hu_rel: '3 मिनट का तरीका आज़माएँ', hu_got: 'ठीक है',
      rp_h: 'डॉक्टर के लिए मेरी रिपोर्ट', rp_entry_s: 'आपके पीरियड, लक्षण और रिकॉर्ड एक स्क्रीन पर', rp_show: 'डॉक्टर के पास जा रही हैं? यह रिपोर्ट दिखाएँ', rp_p: 'आपकी अपनी एंट्री एक स्क्रीन पर। इसे किसी भी डॉक्टर को दिखाएँ या भेजें। इसमें आपकी सेहत की बातें हैं, इसलिए सिर्फ़ अपनी डॉक्टर को भेजें।',
      rp_about: 'मेरे बारे में', rp_age: 'उम्र {n}', rp_preg: 'गर्भवती: {w}वाँ हफ़्ता, डिलीवरी लगभग {d}', rp_birth: 'बच्चे का जन्म {d}', rp_periods: 'मेरे पिछले पीरियड', rp_col_start: 'शुरू', rp_col_bleed: 'ब्लीडिंग के दिन', rp_col_gap: 'अगले तक दिन', rp_heavy: 'भारी', rp_guess: 'अंदाज़े की तारीख़', rp_t_row: '{b} दिन ब्लीडिंग, {g} दिन बाद अगला पीरियड',
      rp_gaps: 'इस तालिका के गिने गए अंतर: औसत {a} दिन · सबसे कम {s} · सबसे ज़्यादा {l}', rp_sym: 'मैंने क्या नोट किया (पिछले 90 दिन)', rp_days: '{n} दिन', rp_out: 'नहीं गिना', rp_t_bled: '{n} दिन ब्लीडिंग', rp_t_noend: 'ख़त्म होने की तारीख़ नहीं लिखी', rp_t_next: '{n} दिन बाद अगला पीरियड', rp_ci: 'महीने के चेक-इन', rp_tools: 'मेरे टूल्स से', rp_q: 'मेरे सवाल',
      rp_q_gap: 'मेरे पीरियड के बीच का अंतर अक्सर 35 दिन से ज़्यादा होता है। इसकी वजह क्या हो सकती है, और मुझे कौन सी जाँचें करानी चाहिए?', rp_q_heavy: 'मेरे पीरियड भारी होते हैं। क्या मुझे Hb जाँच करानी चाहिए?', rp_q_pain: 'पीरियड का दर्द मेरा दिन रोक देता है। किससे आराम मिलेगा?', rp_q_preg: 'क्या प्रेग्नेंसी के इस हफ़्ते के हिसाब से मेरा BP, sugar और Hb ठीक है?', rp_q_any: 'क्या इसमें कुछ है जिस पर मुझे ध्यान रखना चाहिए?',
      rp_notes_sw: 'पिछले 30 दिन के मेरे नोट्स जोड़ें', rp_notes: 'मेरे नोट्स', rp_none: 'अभी दिखाने को कुछ नहीं। पीरियड और कैसा लगता है, दर्ज करें, रिपोर्ट अपने आप भरेगी।', rp_foot: 'Sakhi से, {d}। मेरी अपनी एंट्री, यह जाँच का नतीजा नहीं है।', rp_send: 'WhatsApp पर भेजें', rp_copy: 'कॉपी करें', rp_copied: 'कॉपी हो गया। डॉक्टर वाली चैट में पेस्ट करें।', rp_copy_fail: 'इस फ़ोन पर कॉपी नहीं हो सका।',
      bk_h: 'नए फ़ोन पर ले जाएँ', bk_entry_s: 'आपके PIN से बंद बैकअप कोड', bk_p: 'Sakhi आपकी डायरी सिर्फ़ इसी फ़ोन पर रखती है। इसे ले जाने के लिए यहाँ बैकअप कोड बनाएँ, सँभालकर रखें, और नए फ़ोन पर उसी PIN के साथ डालें।',
      bk_make_h: 'बैकअप कोड बनाएँ', bk_pin: 'एक PIN चुनें (4 से 6 अंक; 6 ज़्यादा सुरक्षित है)', bk_pin2: 'PIN फिर से लिखें', bk_make: 'कोड बनाएँ', bk_pin_bad: '4 से 6 अंक, दोनों बार एक जैसे।', bk_code_h: 'आपका बैकअप कोड',
      bk_code_p: 'इसे कॉपी करें और ऐसी जगह रखें जहाँ सिर्फ़ आप देख सकें, जैसे WhatsApp पर “ख़ुद को मैसेज” में या अपने नोट्स में। कोड आपके PIN से बंद है, पर जिसके पास कोड हो वह छोटे PIN का अंदाज़ा लगाकर उसे खोलने की कोशिश कर सकता है, इसलिए इसे किसी से शेयर न करें। भूला हुआ PIN Sakhi वापस नहीं ला सकती।', bk_copy: 'कोड कॉपी करें', bk_copied: 'कॉपी हो गया। सँभालकर रखें।',
      bk_restore_h: 'इस फ़ोन पर वापस लाएँ', bk_paste: 'अपना बैकअप कोड पेस्ट करें', bk_pin_r: 'आपका PIN', bk_restore: 'वापस लाएँ', bk_sure: 'इससे इस फ़ोन पर सब कुछ आपके बैकअप से बदल जाएगा। आगे बढ़ें?', bk_yes: 'हाँ, वापस लाएँ', bk_done: 'आपकी डायरी वापस आ गई।', bk_wrong: 'यह कोड या PIN काम नहीं किया। दोनों जाँचकर फिर कोशिश करें।', bk_na: 'इस फ़ोन पर बैकअप नहीं हो सकता।', bk_sample: 'सैंपल डायरी के लिए नहीं।',
      doc_b: 'डॉक्टर से बात करें', doc_short: 'डॉक्टर', doc_h: 'इमरजेंसी नहीं है?', doc_p: 'Qura की डॉक्टर से बात करें। पहली 20 मिनट की कॉल मुफ़्त है, आपकी भाषा में।', em_numbers: 'इमरजेंसी नंबर',
      today_short: 'आज', period_ended: 'पीरियड ख़त्म', sym_h: 'लक्षण', sym_h_d: 'नोट जोड़ें', checkin_b: 'चेक-इन', ci_done_b: 'चेक-इन हो गया', my_logs: 'मेरे रिकॉर्ड',
      day_period: 'पीरियड', day_flow: 'ब्लीडिंग और दर्द का ब्यौरा जोड़ें', sym_pain: 'दर्द', sym_body: 'शरीर', sym_mood: 'मन', sym_disch: 'सफ़ेद पानी', sym_done: 'हो गया', yesterday_l: 'कल',
      d_acne: 'मुँहासे', d_calm: 'शांत', d_happy: 'ख़ुश', d_anxious: 'घबराहट', d_irritable: 'चिड़चिड़ापन', d_disch_ok: 'सामान्य', d_disch_bad: 'रंग या गंध बदली', d_itch: 'खुजली', d_pbleed: 'ब्लीडिंग या spotting',
      prev_day: 'पिछला दिन', next_day: 'अगला दिन',
      qa_h: 'आपके सवाल', qa_ph: 'कुछ भी पूछें: पीरियड देर से, सफ़ेद पानी…', qa_ph_d: 'खोजें', also_asked: 'ये भी पूछा गया', full_guide: 'पूरी गाइड पढ़ें', listen_b: 'सुनें',
      voice_b: 'बोलकर पूछें', voice_prompt: 'अपना सवाल बोलें', voice_none: 'इस फ़ोन पर बोलकर लिखना उपलब्ध नहीं है। कृपया टाइप करें।',
      day_h: 'आज कैसा लग रहा है?', noted_today: 'आज के लिए दर्ज', noted_day: 'दर्ज हो गया', what_helps: 'क्या मदद करेगा', all_articles: 'सभी लेख', all_articles_d: '{n} छोटे लेख, हिंदी और अंग्रेज़ी में',
      d_nausea: 'जी मिचलाना', d_back: 'कमर दर्द', d_heartburn: 'सीने में जलन', d_swell: 'सूजन', d_breast: 'स्तन में दर्द', d_hotflush: 'गर्मी के झोंके', d_joint: 'जोड़ों में दर्द',
      qa_late: 'पीरियड देर से?', qa_pain: 'पीरियड का दर्द', qa_disch: 'सफ़ेद पानी', qa_heavy: 'ज़्यादा ब्लीडिंग', qa_pmos: 'PCOD / PMOS', qa_irreg: 'अनियमित पीरियड',
      qa_ptest: 'प्रेग्नेंसी टेस्ट', qa_ready: 'तैयारी कैसे करें', qa_fertile: 'fertile दिन', qa_pmosbaby: 'PMOS और बच्चा', qa_ttcdoc: 'डॉक्टर कब दिखाएँ', qa_partner: 'पति की जाँच',
      qa_danger: 'ख़तरे के संकेत', qa_checkups: 'जाँच कब-कब', qa_tablets: 'गोलियाँ और टीके', qa_moves: 'बच्चे की हलचल', qa_schemes: 'मुफ़्त योजनाएँ', qa_sugarbp: 'शुगर और BP',
      qa_six: 'पहले 6 हफ़्ते', qa_feed: 'दूध पिलाना', qa_ppmood: 'डिलीवरी के बाद मन', qa_ppcontra: 'गर्भनिरोध', qa_heal: 'ब्लीडिंग और घाव',
      qa_hot: 'गर्मी के झोंके', qa_after40: '40 के बाद पीरियड', qa_hrt: 'HRT इलाज', qa_bones: 'हड्डियाँ और दिल', qa_sleep: 'नींद और मन', qa_pmb: 'मेनोपॉज़ के बाद ब्लीडिंग',
      qa_first: 'पहला पीरियड', qa_myths: 'पीरियड के भ्रम', qa_pads: 'pad और cup', qa_moodcycle: 'मन और चक्र', qa_lines: 'हेल्पलाइन',
      sos_h: 'अभी मदद चाहिए?', sos_p: 'कॉल करने के लिए नंबर पर टैप करें। किसी भी आपातकाल में 112 पर कॉल करें।', call_b: 'कॉल करें', sos_signs: 'ख़तरे के संकेत: कब तुरंत जाएँ',
      stage_change: 'स्थिति बदलें', stage_h: 'आप अभी किस दौर में हैं?', stage_cycle: 'पीरियड का हिसाब रख रही हूँ', stage_ttc: 'बच्चे की कोशिश कर रही हूँ', stage_preg: 'मैं गर्भवती हूँ', stage_post: 'मेरा बच्चा हुआ है', stage_meno: 'मेरे पीरियड बंद हो गए हैं',
      stage_preg_note: 'स्कैन रिपोर्ट की डिलीवरी तारीख़, या पिछले पीरियड का पहला दिन दर्ज करें।', stage_birth_date: 'बच्चे का जन्म कब हुआ?', stage_bf: 'मैं दूध पिला रही हूँ',
      stage_saved: 'बदल दिया। होम पर अब वही दिखेगा जो आपके काम का है।', stage_log_first: 'जिस दिन पीरियड लौटे, वह दर्ज करें। फिर Sakhi चक्र दोबारा गिनेगी।', stage_now: 'आपकी स्थिति',
      scan_edd: 'स्कैन रिपोर्ट पर लिखी डिलीवरी की तारीख़ (EDD)', scan_edd_note: 'ज़्यादातर स्कैन रिपोर्ट और MCP कार्ड पर EDD लिखी होती है। अगर आपकी पर है, तो Sakhi हफ़्ते उसी से गिनेगी।', date_bad: 'यह तारीख़ सही नहीं लग रही। कृपया जाँच लें।',
      r_pain: 'जो दर्द आपका दिन रोक दे, उसके लिए इसी महीने डॉक्टर को दिखाएँ। देर से आए पीरियड के साथ एक तरफ़ अचानक तेज़ दर्द हो: अभी 112 पर कॉल करें।',
      ring_period: 'पीरियड', ring_usual: 'आम अंतर {a}–{b} दिन', ring_likely: 'अगला संभावित', ring_aria: 'चक्र का दिन {n}। आम अंतर {a} से {b} दिन होता है।',
      pp_ring: 'दिन जन्म के बाद', pp_ring_1: 'दिन जन्म के बाद', pp_week: '6 में से {n}वाँ हफ़्ता', pp_aria: 'डिलीवरी के बाद पहले 6 हफ़्तों का दिन {n}',
      notif_sec: 'इस फ़ोन पर रिमाइंडर', notif_h: 'फ़ोन नोटिफ़िकेशन', notif_d: 'आपके रिमाइंडर, और पीरियड आने से एक दिन पहले सूचना। गुप्त mode में शब्द सामान्य रहते हैं।', notif_exact_p: 'Android आपके रिमाइंडर एक घंटे तक देर से बजा सकता है। समय पर बजें, इसके लिए Sakhi को अलार्म और रिमाइंडर की अनुमति दें।', notif_exact_b: 'समय पर रिमाइंडर की अनुमति दें', notif_test_btn: 'टेस्ट नोटिफ़िकेशन भेजें', notif_test: 'Sakhi के रिमाइंडर ऐसे दिखते हैं। “मैं” पन्ने पर इन्हें बंद कर सकती हैं।', notif_test_sent: 'लगभग 5 सेकंड में एक टेस्ट नोटिफ़िकेशन आएगा।', notif_on: 'नोटिफ़िकेशन चालू हैं', notif_denied: 'फ़ोन की settings में इस ऐप के नोटिफ़िकेशन बंद हैं।', notif_period: 'अगले कुछ दिनों में पीरियड शुरू हो सकता है। pad पास रखें।',
      bio_btn: 'फ़िंगरप्रिंट या फ़ोन लॉक से खोलें', bio_title: 'Qura Sakhi खोलें', bio_title_d: 'मेरे नोट्स खोलें',
      demo_h: 'Demo', demo_p: 'ऐप को किसी नमूना महिला की तरह दिखाएँ। आपकी settings बनी रहेंगी; इस फ़ोन की entries की जगह नमूने की entries आ जाएँगी।', demo_sure: 'इससे इस फ़ोन की आपकी entries की जगह sample आ जाएगा। अपनी entries रखनी हैं, तो पहले backup code बना लें (“मैं”, फिर “नए फ़ोन पर ले जाएँ”)।', demo_yes: 'sample से बदलें', demo_doc: 'डॉक्टर का view', demo_welcome: 'नमूना हटाकर welcome स्क्रीन से शुरू करें', cal_a_spot: 'स्पॉटिंग', cal_a_range: 'पीरियड की संभावित तारीख़ें', bars_aria: 'पीरियड के बीच के अंतर, दिनों में: {list}'
    }
  };
  /* Languages. Modules can add more; each names a fallback (Marathi falls back to Hindi, the rest to English). */
  const LANGS = [{ code: 'en', label: 'EN', name: 'English', locale: 'en-IN', script: 'latn' }, { code: 'hi', label: 'हिंदी', name: 'हिंदी', locale: 'hi-IN', script: 'deva' }];
  const langMeta = (c) => LANGS.find((l) => l.code === c) || LANGS[0];
  const langChain = () => { const c = [state.lang]; const fb = langMeta(state.lang).fallback; if (fb && fb !== 'en') c.push(fb); if (state.lang !== 'en') c.push('en'); return c; };
  const t = (k) => { const ch = langChain(); for (let i = 0; i < ch.length; i++) { const v = STR[ch[i]] && STR[ch[i]][k]; if (v != null) return v; } return k; };
  /* Inline bilingual text: tx({ en: '...', hi: '...' }) picks the current language with the same fallbacks as t(). */
  const tx = (o) => { if (o == null) return ''; if (typeof o === 'string') return o; const ch = langChain(); for (let i = 0; i < ch.length; i++) if (o[ch[i]] != null) return o[ch[i]]; return o.en != null ? o.en : ''; };
  /* Plurals: "{n} days", "{n} more months" and the like turn singular when n is 1 (English words only; Hindi does not change).
     A string can also have its own "<key>_1" for anything the rule can't do. Modules with their own fill use S.one too. */
  const one = (s, vars) => (vars && +vars.n === 1 ? String(s).replace(/\{n\}( more)? (day|week|month|year)s\b/g, '{n}$1 $2') : s);
  const tf = (k, vars) => { let key = k; if (vars && +vars.n === 1) { const ch = langChain(); for (let i = 0; i < ch.length; i++) { const L0 = STR[ch[i]]; if (L0 && L0[k] != null) { if (L0[k + '_1'] != null) key = k + '_1'; break; } } } return one(t(key), vars).replace(/\{(\w+)\}/g, (m, p) => (vars[p] != null ? vars[p] : m)); };

  /* ---------- icons ---------- */
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    diary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h6a3 3 0 013 3v12a2 2 0 00-2-2H4zM20 5h-6a3 3 0 00-3 3v12a2 2 0 012-2h7z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-4 0-7-4-7-8 0-5 4-9 9-9 1 4-1 9-2 17z"/><path d="M12 20c0-5 2-9 5-12"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/></svg>',
    care: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><path d="M16.5 13.5v6M13.5 16.5h6"/></svg>',
    pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.5 8.3l5 7.4"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/></svg>',
    baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M10 9h.01M14 9h.01M10.5 11.5c.9.6 2.1.6 3 0M7 19c1.5-2 3.2-3 5-3s3.5 1 5 3"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.8 0 5 2.2 5 5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></svg>',
    flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="2.5"/><path d="M12 7.5C12 4 9.5 3 9.5 3S7 5 9.6 8.6M14.4 8.6C17 5 14.5 3 14.5 3S12 4 12 7.5M9.6 11.4C6 13 6.5 15.5 6.5 15.5S9 16.5 10.7 12.3M13.3 12.3C15 16.5 17.5 15.5 17.5 15.5S18 13 14.4 11.4M12 12.5V21"/></svg>',
    ribbon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z"/><path d="M10 12.5L6 21l3-1.5L10.5 22M14 12.5l4 8.5-3-1.5-1.5 2.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18 16l.7 1.8 1.8.7-1.8.7L18 21l-.7-1.8-1.8-.7 1.8-.7z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>',
    steth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3H4v5a5 5 0 0010 0V3h-1"/><path d="M9 13v2a5 5 0 0010 0v-2.5"/><circle cx="19" cy="10.5" r="2"/></svg>'
  };

  /* ---------- state ---------- */
  const KEY = 'qura-saathi-v1';
  const defaults = () => ({ lang: 'en', stage: 'welcome', consent: { c1: null, c2: null, c4: null }, dob: null, situation: {}, events: [], daily: {}, notes: {}, checkins: {}, strips: {}, settings: { discreet: false, shared: false, proto: false, pinHash: null, notify: false, theme: 'light', look: 0, toursAuto: true, tourVoice: false }, goals: [], requests: [], leads: [], askTopics: [], sample: null, created: toISO(today()), mods: {}, reminders: [], tours: {}, tourDay: null, langChosen: false, prompts: {} });
  let state = defaults();
  const load = () => { try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); state = Object.assign(defaults(), p); state.settings = Object.assign(defaults().settings, state.settings || {}); } } catch (e) { state = defaults(); } };
  let holdSave = false;
  const save = () => { if (holdSave || mem.teen) return; if (sheetUp()) sheetDirty = true; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked; the page still works */ } syncNotifications(); };
  let CONTENT = { groups: [] };
  let sheetDirty = false; const sheetUp = () => { const r = document.getElementById('sheet-root'); return !!(r && r.innerHTML); };
  const freshMem = () => ({ under18: false, teen: false, calMonth: null, learnGroup: 'all', learnQ: '', diaryTab: 'cal', careQ: '', shownNumbers: false, locked: false, hiddenAt: 0 });
  let mem = freshMem();

  /* ---------- cycle maths ---------- */
  /* Cycle starts. A "period started" less than 10 days after the last one is the same bleed (or bleeding between periods), not a new cycle. */
  /* A start she guessed at in onboarding ("about 2 weeks ago") carries approx: true. A gap that touches a guess is shown but
     never counted. */
  /* A real start less than 21 days from a guess, before or after it, is the same period remembered better (a cycle is at least
     21 days), so the guess stops counting: logging such a start removes the guess (dropGuesses), and liveStartEvents covers
     diaries saved before this rule. A real start 21 days or more away is another cycle, and the guess stays as a guess. */
  const isISO = (x) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
  /* n months on, kept inside the month: 31 Aug + 6 months = 28 Feb (29 in a leap year), not 3 Mar. */
  const addMonths = (d, n) => { const y = d.getFullYear(), m = d.getMonth() + n; return new Date(y, m, Math.min(d.getDate(), new Date(y, m + 1, 0).getDate())); };
  const GUESS_DAYS = 20;
  const liveStartEvents = () => { const evs = state.events.filter((e) => e.t === 'start'); const real = evs.filter((e) => !e.approx).map((e) => e.d); return evs.filter((e) => !e.approx || !real.some((r) => Math.abs(diffDays(fromISO(r), fromISO(e.d))) <= GUESS_DAYS)); };
  const dropGuesses = (dStr) => { state.events = state.events.filter((e) => !(e.t === 'start' && e.approx && Math.abs(diffDays(fromISO(dStr), fromISO(e.d))) <= GUESS_DAYS)); };
  const starts = () => { const out = [], ap = []; liveStartEvents().sort((a, b) => (a.d < b.d ? -1 : (a.d > b.d ? 1 : (a.approx ? 1 : -1)))).forEach((e) => { const k = out.length - 1; if (k >= 0 && diffDays(fromISO(out[k]), fromISO(e.d)) < 10) { if (ap[k] && !e.approx) { out[k] = e.d; ap[k] = false; } return; } out.push(e.d); ap.push(!!e.approx); }); return out; };
  const approxStarts = () => { const m = {}; const live = liveStartEvents(); live.forEach((e) => { if (e.approx) m[e.d] = true; }); live.forEach((e) => { if (!e.approx) delete m[e.d]; }); return m; };
  const gapsAll = () => { const s = starts(); const ap = approxStarts(); const g = []; for (let i = 1; i < s.length; i++) { const d = diffDays(fromISO(s[i - 1]), fromISO(s[i])); g.push({ from: s[i - 1], to: s[i], days: d, usable: d >= 10 && d <= 400 && !excluded(s[i - 1], s[i]) && !ap[s[i - 1]] && !ap[s[i]], guess: !!(ap[s[i - 1]] || ap[s[i]]) }); } return g; };
  /* A gap is left out of the maths when hormones, a pregnancy or the year after a birth touches any part of it. The current ones
     live on the situation (hormonesSince to hormonesUntil, pregnantSince, deliveredOn); earlier ones are kept as spans, so they stay
     out after she stops hormones, a pregnancy ends or another baby is born: { k: 'horm', a, b }, { k: 'preg', a: its first day
     (the gap that holds it is the pregnancy), and { k: 'birth', a } (the year after it). */
  const spanList = () => (Array.isArray(state.situation.spans) ? state.situation.spans.filter((x) => x && isISO(x.a)) : []);
  const addSpan = (sp) => { state.situation.spans = spanList().concat([sp]); };
  const excludedWhy = (fromStr, toStr) => {
    const sit = state.situation; const a = fromISO(fromStr), b = fromISO(toStr || fromStr); const over = (x, y) => a <= y && b > x;
    const sp = spanList(); const day = (k) => (isISO(sit[k]) ? fromISO(sit[k]) : null);
    const hs = day('hormonesSince'); if (hs && over(hs, day('hormonesUntil') || addDays(hs, 3650))) return 'hormones';
    if (sp.some((x) => x.k === 'horm' && over(fromISO(x.a), isISO(x.b) ? fromISO(x.b) : fromISO(x.a)))) return 'hormones';
    const ps = day('pregnantSince'); if (ps && over(ps, addDays(ps, 3650))) return 'pregnancy';
    if (sp.some((x) => x.k === 'preg' && a <= fromISO(x.a) && fromISO(x.a) < b)) return 'pregnancy';
    const bo = day('deliveredOn'); if (bo && over(bo, addDays(bo, 365))) return 'birth';
    if (sp.some((x) => x.k === 'birth' && over(fromISO(x.a), addDays(fromISO(x.a), 365)))) return 'birth';
    return null;
  };
  const excluded = (fromStr, toStr) => !!excludedWhy(fromStr, toStr);
  const usable = () => gapsAll().filter((g) => g.usable).map((g) => g.days);
  const lastStart = () => { const s = starts(); return s.length ? fromISO(s[s.length - 1]) : null; };
  const cycleDay = () => { const ls = lastStart(); return ls ? diffDays(ls, today()) + 1 : null; };
  const yearsSinceMenarche = () => { if (!state.dob) return 10; const age = (today() - fromISO(state.dob)) / (365.25 * 86400000); return age - 13; };
  const bandHi = () => (yearsSinceMenarche() < 3 ? 45 : 35);
  /* Her likely window: only for regular cycles (FIGO 2018: shortest to longest gap within 7 days at 26 to 41, within 9 days at
     other ages), and never when her own cycle isn't running: pregnancy, the year after a birth, breastfeeding, a hysterectomy,
     periods stopped, or hormones (which set their own bleeds). */
  const rangeInfo = () => {
    const sit = state.situation; if (countsOff() || sit.stopped || sit.hormones) return null;
    const g = usable().slice(-6); const ls = lastStart(); if (!ls || g.length < 2) return null;
    const age = ageYears(); const mn = Math.min.apply(null, g), mx = Math.max.apply(null, g); if (mx - mn > (age != null && age >= 26 && age <= 41 ? 7 : 9)) return null;
    let lo = mn - 2, hi = mx + 2; if (hi - lo < 5) { const c = (lo + hi) / 2; lo = Math.floor(c - 2.5); hi = Math.ceil(c + 2.5); }
    return { from: addDays(ls, lo), to: addDays(ls, hi), lo: lo, hi: hi };
  };
  /* A heads-up before her window (the Home card and the phone alarm) only for regular cycles of a usual length: with gaps longer
     than 35 days (45 in the first years) the advice is about the long gaps, not "keep pads ready". */
  const headsRange = () => { const ri = rangeInfo(); return ri && !usable().slice(-6).some((x) => x > bandHi()) ? ri : null; };
  /* How long a period lasted, in days counted from its start: an end counts when it comes before the next start and within 20
     days, so a long period shows in full on the calendar, in Trends, in the report and in the explanations alike. null = no end. */
  const periodEnd = (startStr) => { const st = starts(); const i = st.indexOf(startStr); const nx = i >= 0 ? st[i + 1] : null; const ends = state.events.filter((e) => e.t === 'end' && e.d >= startStr && (!nx || e.d < nx) && diffDays(fromISO(startStr), fromISO(e.d)) <= 20).map((e) => e.d).sort(); return ends.length ? ends[0] : null; };
  const periodLen = (startStr) => { const e = periodEnd(startStr); return e ? diffDays(fromISO(startStr), fromISO(e)) + 1 : null; };
  /* Her period is open from its start until she logs its end, for up to 10 days; then the main button offers "Period ended"
     (a start on day 6 would be a second start or a false 11-day cycle). A logged end closes it, the same day too. */
  const openPeriod = () => { const ls = lastStart(); if (!ls || countsOff() || state.situation.stopped) return false; const n = diffDays(ls, today()); return n >= 0 && n <= 9 && !periodEnd(toISO(ls)); };
  /* Bleeding days for the calendar. An end counts when it comes before the next start and within 20 days, so long periods show in full;
     with no end logged, 5 days are assumed. Spotting days are marked separately. */
  const bleedingDays = () => { const set = {}; const evs = state.events.slice().sort((a, b) => (a.d < b.d ? -1 : 1)); const live = liveStartEvents(); const st = evs.filter((e) => e.t === 'start' && live.indexOf(e) >= 0); st.forEach((s0, i) => { const nx = st[i + 1] ? st[i + 1].d : null; const end = evs.find((e) => e.t === 'end' && e.d >= s0.d && (!nx || e.d < nx) && diffDays(fromISO(s0.d), fromISO(e.d)) <= 20); const n = end ? diffDays(fromISO(s0.d), fromISO(end.d)) : 4; for (let k = 0; k <= n; k++) { const key = toISO(addDays(fromISO(s0.d), k)); if (!set[key] || set[key] === 'spot') set[key] = k === 0 ? 'start' : 'bleed'; } }); evs.filter((e) => e.t === 'spot').forEach((e) => { if (!set[e.d]) set[e.d] = 'spot'; }); return set; };
  const isPregnant = () => !!state.situation.pregnant;
  /* After a birth, until her first period comes back, the last period before the pregnancy says nothing about today: no cycle
     day, no late card, no period alarm, breastfeeding or not. Same rule as the after-birth Home (the year after the birth). */
  const afterBirthNow = () => { const b = state.situation.deliveredOn; if (!b || isPregnant()) return false; const n = diffDays(fromISO(b), today()); const ls = lastStart(); return n >= 0 && n <= 365 && !(ls && ls > fromISO(b)); };
  const countsOff = () => isPregnant() || state.situation.hysterectomy || state.situation.breastfeeding || afterBirthNow();
  /* Midlife view: periods stopped, her own choice ("Periods changing after 40"), or 45 and over unless she chose otherwise. */
  const isMidlife = () => { const s = state.situation || {}; if (s.stopped) return true; if (s.midlife === false) return false; if (s.midlife) return true; const age = ageYears(); return age != null && age >= 45; };
  /* Age in whole years, by the calendar: she turns 30 on her birthday (29 Feb birthdays count from 1 Mar in other years). */
  const ageYears = () => { if (!isISO(state.dob)) return null; const b = fromISO(state.dob), td = today(); let n = td.getFullYear() - b.getFullYear(); if (td.getMonth() < b.getMonth() || (td.getMonth() === b.getMonth() && td.getDate() < b.getDate())) n--; return n; };
  const lastCheckins = (n) => Object.keys(state.checkins).sort().slice(-n).map((k) => state.checkins[k]);
  /* Fertile days, only for steady cycles (3+ gaps within 7 days of each other), not on hormones, not in pregnancy.
     The egg is released about 14 days before the next period; sperm live up to 5 days, so the window starts 5 days earlier. */
  const fertileInfo = () => { const g = usable().slice(-6); const ls = lastStart(); if (!(ls && g.length >= 3 && Math.max.apply(null, g) - Math.min.apply(null, g) <= 7 && !state.situation.hormones && !isPregnant())) return null; const mn = Math.min.apply(null, g), mx = Math.max.apply(null, g); const eggFrom = addDays(ls, mn - 14), eggTo = addDays(ls, mx - 14); return { mn: mn, mx: mx, eggFrom: eggFrom, eggTo: eggTo, from: addDays(eggFrom, -5), to: eggTo }; };
  /* The change before menopause (STRAW+10), from age 40: 1 early (next gaps differ by 7+ days, twice), 2 late (a gap of 60+ days), 3 periods stopped. */
  const midlifeVar7 = () => { const ga = usable().slice(-10); let n = 0; for (let i = 1; i < ga.length; i++) if (Math.abs(ga[i] - ga[i - 1]) >= 7) n++; return n; };
  const midlifeStage = () => { const age = ageYears(); const off = state.situation.pcos || state.situation.hormones || state.situation.hysterectomy; return state.situation.stopped ? 3 : (off || age == null || age < 40 ? 0 : (usable().slice(-10).some((x) => x >= 60) ? 2 : (midlifeVar7() >= 2 ? 1 : 0))); };
  /* Pregnancy dating. The due date on a scan report (EDD) beats the last period. A scan's date alone says nothing about the weeks.
     Weeks count from the first day of the last period (or EDD minus 280 days), the way antenatal cards count. */
  const pregInfo = () => { const sit = state.situation || {}; if (!sit.pregnant) return null; let lmp = null, from = null; if (sit.scanEdd) { lmp = addDays(fromISO(sit.scanEdd), -280); from = 'scan'; } else if (sit.pregnantSince) { lmp = fromISO(sit.pregnantSince); from = 'lmp'; } if (!lmp) return null; const days = Math.max(0, diffDays(lmp, today())); return { lmp: toISO(lmp), edd: toISO(addDays(lmp, 280)), from: from, days: days, weeks: Math.floor(days / 7) }; };
  /* A pregnancy that ends (a birth, a loss, or she says it is over) is kept as a span, so the gap around it never counts as a
     long cycle: "the diary then counts from your next period". */
  const endPregnancy = () => { const s0 = state.situation; if (!s0.pregnant) return; const pi = pregInfo(); if (pi) addSpan({ k: 'preg', a: pi.lmp }); s0.pregnant = false; delete s0.pregnantSince; delete s0.scanEdd; delete s0.scanDate; };
  const setBirth = (b) => { const s0 = state.situation; if (isISO(s0.deliveredOn) && s0.deliveredOn !== b) addSpan({ k: 'birth', a: s0.deliveredOn }); s0.deliveredOn = b; };

  /* ---------- sample personas ---------- */
  const samples = {
    priya: () => {
      const s = defaults(); s.lang = state.lang; s.stage = 'app'; s.consent = { c1: '2026-04-20', c2: null, c4: '2026-04-20' }; s.dob = '1999-04-12'; s.situation = { pcos: true }; s.sample = 'priya';
      const st = ['2026-02-28', '2026-03-31', '2026-05-16', '2026-07-17', '2026-08-21', '2026-10-03'];
      st.forEach((d, i) => { s.events.push({ d: d, t: 'start', pads: 'pads_2', clots: i === 5 ? 'clots_1' : 'clots_0', pain: i === 5 ? 'pain_1' : 'pain_0' }); s.events.push({ d: toISO(addDays(fromISO(d), i === 5 ? 5 : 4)), t: 'end' }); });
      s.events.push({ d: '2026-10-04', t: 'start_detail', pads: 'pads_3', clots: 'clots_2', pain: 'pain_2', leaked: true });
      s.events.push({ d: '2026-10-14', t: 'spot' });
      s.checkins = { '2026-05': { chips: ['hair', 'acne'], hot: 'hot_0' }, '2026-06': { chips: ['hair', 'mood'], hot: 'hot_0' }, '2026-07': { chips: ['hair', 'acne', 'neck'], hot: 'hot_0' }, '2026-08': { chips: ['hair', 'mood'], hot: 'hot_0' }, '2026-09': { chips: ['hair', 'acne', 'heavy'], hot: 'hot_0' } };
      s.daily = { '2026-07-17': ['d_cramps', 'd_bloat'], '2026-07-18': ['d_cramps'], '2026-08-12': ['d_acne', 'd_mood'], '2026-08-21': ['d_cramps', 'd_tired'], '2026-08-22': ['d_cramps', 'd_headache'], '2026-09-14': ['d_acne', 'd_anxious'], '2026-09-26': ['d_bloat', 'd_irritable'], '2026-10-03': ['d_cramps', 'd_bloat'], '2026-10-04': ['d_cramps', 'd_tired'], '2026-10-05': ['d_cramps'], '2026-10-11': ['d_happy'], '2026-10-16': ['d_sleep', 'd_acne'] };
      s.notes = s.lang === 'hi' ? { '2026-10-04': 'ऑफ़िस में दर्द ज़्यादा था, रात को गरम पानी की थैली ली।', '2026-09-14': 'Exam का हफ़्ता, नींद कम।' } : { '2026-10-04': 'Pain was bad at work. Hot water bag at night helped.', '2026-09-14': 'Exam week, not much sleep.' };
      return s;
    },
    asha: () => {
      const s = defaults(); s.lang = state.lang; s.stage = 'app'; s.consent = { c1: '2026-05-02', c2: '2026-05-02', c4: null }; s.dob = '1995-08-23'; s.situation = {}; s.sample = 'asha';
      const st = ['2026-04-06', '2026-05-04', '2026-06-03', '2026-07-02', '2026-08-02', '2026-08-30', '2026-09-29'];
      st.forEach((d) => { s.events.push({ d: d, t: 'start', pads: 'pads_2', clots: 'clots_0', pain: 'pain_1' }); s.events.push({ d: toISO(addDays(fromISO(d), 4)), t: 'end' }); });
      s.checkins = { '2026-06': { chips: ['none'], hot: 'hot_0' }, '2026-07': { chips: ['mood'], hot: 'hot_0' }, '2026-08': { chips: ['none'], hot: 'hot_0' }, '2026-09': { chips: ['acne'], hot: 'hot_0' } };
      s.daily = { '2026-08-30': ['d_cramps'], '2026-08-31': ['d_cramps', 'd_tired'], '2026-09-20': ['d_calm'], '2026-09-27': ['d_bloat', 'd_irritable'], '2026-09-29': ['d_cramps', 'd_back'], '2026-09-30': ['d_cramps'], '2026-10-10': ['d_happy'], '2026-10-17': ['d_disch_ok'] };
      Object.assign(s.daily, { '2026-06-30': ['d_irritable'], '2026-07-02': ['d_cramps'], '2026-07-03': ['d_cramps'], '2026-07-31': ['d_bloat', 'd_irritable'], '2026-08-02': ['d_cramps', 'd_back'], '2026-08-28': ['d_irritable'] });
      s.notes = s.lang === 'hi' ? { '2026-09-29': 'पहला दिन, दोपहर तक आराम किया।' } : { '2026-09-29': 'First day, rested till lunch.' };
      return s;
    },
    meera: () => {
      const s = defaults(); s.lang = state.lang; s.stage = 'app'; s.consent = { c1: '2026-05-10', c2: '2026-05-10', c4: '2026-05-10' }; s.dob = '1997-02-14'; s.sample = 'meera';
      ['2026-01-02', '2026-01-31', '2026-03-02', '2026-04-01', '2026-05-02'].forEach((d) => { s.events.push({ d: d, t: 'start', pads: 'pads_2', clots: 'clots_0', pain: 'pain_1' }); s.events.push({ d: toISO(addDays(fromISO(d), 4)), t: 'end' }); });
      s.situation = { pregnant: true, pregnantSince: '2026-05-02', scanEdd: '2027-02-06' };
      s.checkins = { '2026-08': { chips: ['none'], hot: 'hot_0' }, '2026-09': { chips: ['mood'], hot: 'hot_0' } };
      return s;
    },
    sunita: () => {
      const s = defaults(); s.lang = state.lang; s.stage = 'app'; s.consent = { c1: '2026-01-12', c2: null, c4: '2026-01-12' }; s.dob = '1993-06-30'; s.sample = 'sunita';
      ['2025-11-20', '2025-12-21'].forEach((d) => { s.events.push({ d: d, t: 'start', pads: 'pads_2', clots: 'clots_0', pain: 'pain_1' }); s.events.push({ d: toISO(addDays(fromISO(d), 5)), t: 'end' }); });
      s.situation = { breastfeeding: true, deliveredOn: toISO(addDays(today(), -21)) };
      return s;
    },
    kamla: () => {
      const s = defaults(); s.lang = state.lang; s.stage = 'app'; s.consent = { c1: '2026-01-05', c2: '2026-01-05', c4: '2026-01-05' }; s.dob = '1978-03-08'; s.sample = 'kamla';
      ['2025-10-01', '2025-10-27', '2025-12-08', '2026-01-02', '2026-02-24', '2026-03-22', '2026-05-30', '2026-07-08', '2026-09-20'].forEach((d, i) => { s.events.push({ d: d, t: 'start', pads: i % 3 === 0 ? 'pads_3' : 'pads_2', clots: i % 3 === 0 ? 'clots_1' : 'clots_0', pain: 'pain_1' }); s.events.push({ d: toISO(addDays(fromISO(d), i % 3 === 0 ? 7 : 4)), t: 'end' }); });
      s.checkins = { '2026-05': { chips: ['mood'], hot: 'hot_1' }, '2026-06': { chips: ['mood', 'heavy'], hot: 'hot_2' }, '2026-07': { chips: ['none'], hot: 'hot_3' }, '2026-08': { chips: ['mood'], hot: 'hot_3' }, '2026-09': { chips: ['heavy'], hot: 'hot_2' }, '2026-10': { chips: ['mood'], hot: 'hot_3' } };
      s.daily = { '2026-08-04': ['d_hotflush', 'd_sleep'], '2026-08-19': ['d_hotflush'], '2026-09-02': ['d_joint', 'd_tired'], '2026-09-20': ['d_cramps', 'd_tired'], '2026-09-28': ['d_hotflush', 'd_sleep'], '2026-10-06': ['d_hotflush', 'd_irritable'], '2026-10-13': ['d_joint'], '2026-10-16': ['d_hotflush', 'd_sleep'] };
      return s;
    }
  };

  /* ---------- rendering ---------- */
  const view = () => $('#view');
  const setHash = (h) => { if (location.hash !== '#' + h) location.hash = h; else render(); };
  /* In-app history. Inside the artifact viewer there is no browser back button, so every inner screen gets one. */
  const TAB_ROOTS = ['home', 'diary', 'care', 'help'];
  const nav = { stack: [], backing: false };
  const trackNav = (r) => {
    const st = nav.stack;
    if (nav.backing) { nav.backing = false; return 'back'; }
    if (st[st.length - 1] === r) return 'same';
    if (st.length > 1 && st[st.length - 2] === r) { st.pop(); return 'back'; }   /* browser/gesture back */
    if (TAB_ROOTS.indexOf(r) >= 0) { nav.stack = [r]; return 'fwd'; }
    st.push(r); if (st.length > 60) st.splice(0, st.length - 60);
    return 'fwd';
  };
  const goBack = (fallback) => {
    if (nav.stack.length > 1) { nav.stack.pop(); nav.backing = true; setHash(nav.stack[nav.stack.length - 1]); }
    else { nav.stack = []; setHash(fallback || 'home'); }
  };
  const backBtn = (fallback) => '<button type="button" class="iconbtn backbtn" data-back="' + esc(fallback || 'home') + '" aria-label="' + esc(t('back')) + '">' + I.back + '</button>';
  const route = () => (location.hash || '#home').slice(1);
  const toast = (msg) => { const r = $('#toast-root'); r.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>'; clearTimeout(toast.tm); toast.tm = setTimeout(() => { r.innerHTML = ''; }, 2400); };
  /* A toast with buttons, e.g. "Saved · Undo · Add details". Stays 6 seconds. */
  const toastAct = (msg, actions) => { const r = $('#toast-root'); r.innerHTML = '<div class="toast act" role="status"><span>' + esc(msg) + '</span>' + actions.map((a, i) => '<button type="button" data-ta="' + i + '">' + esc(a.label) + '</button>').join('') + '</div>'; r.querySelectorAll('[data-ta]').forEach((b) => b.addEventListener('click', () => { clearTimeout(toast.tm); r.innerHTML = ''; actions[+b.dataset.ta].fn(); })); clearTimeout(toast.tm); toast.tm = setTimeout(() => { r.innerHTML = ''; }, 6000); };
  const fmtD = (d, opts) => { try { return new Intl.DateTimeFormat(langMeta(state.lang).locale || 'en-IN', opts || { day: 'numeric', month: 'short' }).format(d); } catch (e) { return toISO(d); } };
  const fmtRange = (a, b) => (a.getMonth() === b.getMonth() ? fmtD(a, { day: 'numeric' }) + '–' + fmtD(b) : fmtD(a) + ' – ' + fmtD(b));

  /* ---------- module registry ---------- */
  /* Each care area is a module in mods/<id>.js that calls Saathi.register({...}). See MODULE_API.md. */
  const MODS = []; const ROUTES = {}; const PREFIXES = []; const OPEN = []; const TILES = []; const CSS = [];
  const HOOKS = { home: [], afterHome: [], me: [], afterMe: [], summary: [], under18: [], afterRender: [], beforeRender: [], topbar: [], afterTopbar: [], sample: [], homeTop: [], event: [] };
  const SECTIONS = ['periods', 'contra', 'pregtest', 'ttc', 'preg', 'post', 'loss', 'intimate', 'cond', 'screen', 'meno', 'teen', 'tools'];
  const CORE_ROUTES = ['home', 'diary', 'learn', 'help', 'me', 'checkin', 'pattern', 'fertile', 'midlife', 'pregnancy', 'ask', 'tell', 'care', 'report', 'backup', 'account'];
  function register(m) {
    if (!m || !m.id) return;
    MODS.push(m);
    Object.keys(m.strings || {}).forEach((lg) => { STR[lg] = STR[lg] || {}; Object.assign(STR[lg], m.strings[lg]); });
    (m.langs || []).forEach((l) => { if (!LANGS.find((x) => x.code === l.code)) LANGS.push(l); });
    Object.keys(m.routes || {}).forEach((r) => { if (CORE_ROUTES.indexOf(r) < 0) ROUTES[r] = { fn: m.routes[r], mod: m.id }; });
    Object.keys(m.prefixes || {}).forEach((p) => PREFIXES.push({ p: p, fn: m.prefixes[p], mod: m.id }));
    (m.open || []).forEach((r) => OPEN.push(r));
    (m.tours || []).forEach((x) => { if (x && x.id && (x.route || x.moment) && x.steps && !TOURS.some((y) => y.id === x.id)) TOURS.push(Object.assign({ hue: 'plum', auto: true }, x)); });
    (m.tiles || []).forEach((x) => TILES.push(Object.assign({ mod: m.id, order: 50 }, x)));
    Object.keys(HOOKS).forEach((h) => { if (typeof m[h] === 'function') HOOKS[h].push({ fn: m[h], mod: m.id }); });
    if (m.css) CSS.push('/* ' + m.id + ' */\n' + m.css);
  }
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { if (window.console) console.error('[saathi]', e); return fallback; } };
  const runHook = (name, args, join) => { const out = HOOKS[name].map((h) => safe(() => h.fn.apply(null, args), '')); return join ? out.filter(Boolean).join('') : out; };
  /* Events for the petal garden (mods/joy.js): what kind of thing she did, never what she wrote. Only her own taps fire them.
     quiet: true on screens about loss, abortion, violence or emergencies, where nothing should celebrate. */
  let lastTap = 0, emitting = false;
  const QUIET = /^(loss|pregtest-abortion|intimate-safety|help|tell|relief|selfcheck|meno-score)/;   /* the petal counts, with no confetti */
  const emit = (name, payload) => { if (emitting) return; emitting = true; try { runHook('event', [name, payload || {}, api]); } finally { emitting = false; } };
  /* A module saves right after she does something on its screen: that counts as using a tool (once a day in the garden). */
  const modSave = () => { save(); const r = route(); if (state.stage === 'app' && Date.now() - lastTap < 1500 && modRoute(r) && !/^(joy|docportal|lang)/.test(r)) emit('tool', { route: r, quiet: QUIET.test(r) }); };
  const hueOf = (k) => (api.art ? api.art.hueOf(k) : 'rose');
  const isOpen = (r) => ['learn', 'help', 'tell', 'ask', 'care', 'account'].indexOf(r) >= 0 || r.startsWith('a-') || r.startsWith('topic-') || OPEN.some((o) => (o.endsWith('*') ? r.startsWith(o.slice(0, -1)) : o === r));
  const modRoute = (r) => { if (ROUTES[r]) return { fn: (v) => ROUTES[r].fn(v), mod: ROUTES[r].mod }; const p = PREFIXES.filter((x) => r.startsWith(x.p)).sort((a, b) => b.p.length - a.p.length)[0]; return p ? { fn: (v) => p.fn(v, r.slice(p.p.length)), mod: p.mod } : null; };

  /* Reminders: one shared list so the reminders centre, home and the doctor summary all see the same thing.
     { id, mod, title: 'string_key' | {en,hi}, kind: 'med'|'checkup'|'visit'|'custom'|..., start: 'YYYY-MM-DD', every: days|null, weekdays: [0-6]|null, dates: ['YYYY-MM-DD']|null, time: 'HH:MM', on: true } */
  const remText = (r) => (typeof r.title === 'string' ? t(r.title) : tx(r.title));
  /* A reminder's next day. "until" ends it (a medicine course); "doneOn" is a day already done (today's pill ticked off), so Next,
     Coming up and the phone alarm move on to the day after. */
  const remNext = (r, from) => { const n = remNext0(r, from); if (!n) return null; if (isISO(r.until) && n > fromISO(r.until)) return null; return r.doneOn && toISO(n) === r.doneOn ? remNext(r, addDays(n, 1)) : n; };
  const remNext0 = (r, from) => {
    const f = from || today(); if (r.on === false) return null;
    if (r.dates && r.dates.length) { const n = r.dates.map(fromISO).filter((d) => d >= f).sort((a, b) => a - b)[0]; return n || null; }
    const st = r.start ? fromISO(r.start) : f;
    if (r.weekdays && r.weekdays.length) { for (let i = 0; i < 8; i++) { const d = addDays(f > st ? f : st, i); if (r.weekdays.indexOf(d.getDay()) >= 0) return d; } return null; }
    if (!r.every) return st >= f ? st : null;
    if (st >= f) return st; const k = Math.ceil(diffDays(st, f) / r.every); return addDays(st, k * r.every);
  };
  const reminders = {
    list: () => state.reminders || (state.reminders = []),
    get: (id) => reminders.list().find((r) => r.id === id) || null,
    upsert: (r) => { const L2 = reminders.list(); const i = L2.findIndex((x) => x.id === r.id); const rec = Object.assign({ on: true, kind: 'custom', time: '09:00' }, i >= 0 ? L2[i] : {}, r); if (i >= 0) L2[i] = rec; else L2.push(rec); save(); return rec; },
    remove: (id) => { state.reminders = reminders.list().filter((r) => r.id !== id); save(); },
    next: remNext, text: remText,
    upcoming: (days) => { const lim = addDays(today(), days == null ? 7 : days); return reminders.list().map((r) => ({ r: r, date: remNext(r) })).filter((x) => x.date && x.date <= lim).sort((a, b) => a.date - b.date); }
  };
  const data = (id) => { state.mods = state.mods || {}; return state.mods[id] || (state.mods[id] = {}); };
  const canSave = () => state.stage === 'app';
  const needDiary = () => '<div class="card warn"><h3>' + esc(t('need_diary_h')) + '</h3><p class="small">' + esc(t('need_diary_p')) + '</p><button type="button" class="btn primary sm" data-start-diary="1">' + esc(t('start')) + '</button></div>';
  const ask = (topic) => { state.askTopics = topic ? [topic] : []; save(); setHash('ask'); };
  const sheet = (inner, onWire) => { if (tour && tour.def.moment) clearTour(); if (!sheetUp()) sheetDirty = false; const root = $('#sheet-root'); root.innerHTML = '<div class="sheet-bg" id="sheet-bg"><div class="sheet" role="dialog"><div class="handle"></div>' + inner + '</div></div>'; $('#sheet-bg', root).addEventListener('click', (e) => { if (e.target.id === 'sheet-bg') closeSheet(); }); wire(root); if (onWire) onWire(root.querySelector('.sheet')); };
  const closeSheet = (quiet) => { const was = sheetUp(); $('#sheet-root').innerHTML = ''; if (tour && tour.def.moment) clearTour(); if (was && sheetDirty && quiet !== true) { sheetDirty = false; render(); } sheetDirty = false; };
  const icon = (k) => (k && k.indexOf('<svg') === 0 ? k : (I[k] || I.leaf));

  /* Light by default, like most women's phones; Dark or "Same as phone" on the Me page. */
  function applyTheme() { const th = state.settings.theme || 'light'; const el = document.documentElement; if (th === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', th); }
  function renderTopbar() {
    const tb = $('#topbar'); const inApp = state.stage === 'app'; const cur = langMeta(state.lang);
    const short = (l) => l.short || (l.code === 'en' ? 'EN' : String(l.label || l.name || l.code).slice(0, 3));
    tb.innerHTML = '<div class="brand"><span class="bname">' + (state.settings.discreet ? esc(t('notes_brand')) : '<span class="bq">Qura</span> <span class="bsub">Sakhi</span>') + '</span></div>' +
      '<div class="topbar-actions">' + (mem.locked ? '' : (state.stage === 'app' || state.stage === 'browse' ? '<button type="button" class="docbtn" id="doc-btn" aria-label="' + esc(t('doc_b')) + '">' + I.steth + '<span>' + esc(t('doc_short')) + '</span></button>' : '') + runHook('topbar', [api], true) + '<button type="button" class="iconbtn langbtn lang-' + esc(cur.script || 'latn') + '" data-langs="1" aria-label="' + esc(t('lang_h')) + '">' + esc(short(cur)) + '</button>' +
      (inApp ? '<button type="button" class="iconbtn" data-go="me" aria-label="' + esc(t('me')) + '">' + I.person + '</button>' : '')) + '</div>';
    const lb = tb.querySelector('[data-langs]'); if (lb) lb.addEventListener('click', openLangs);
    const db = tb.querySelector('#doc-btn'); if (db) db.addEventListener('click', () => ask(''));
    const g = tb.querySelector('[data-go]'); if (g) g.addEventListener('click', () => setHash('me'));
    if (!mem.locked) runHook('afterTopbar', [tb, api]);
  }
  function openLangs() {
    sheet('<h2>' + esc(t('lang_h')) + '</h2><div class="list">' + LANGS.map((l) => '<button type="button" class="item" data-pick-lang="' + esc(l.code) + '"><span class="body"><strong class="lang-' + esc(l.script || 'latn') + '">' + esc(l.name || l.label) + '</strong>' + (l.partial ? '<span>' + esc(t('partly')) + '</span>' : '') + '</span>' + (state.lang === l.code ? '<span class="pill ok">✓</span>' : '') + '</button>').join('') + '</div>', (s) => {
      s.querySelectorAll('[data-pick-lang]').forEach((b) => b.addEventListener('click', () => { state.lang = b.dataset.pickLang; save(); closeSheet(); render(); }));
    });
  }
  function tabOf(r) {
    if (r.startsWith('a-') || r === 'learn') return 'care';
    if (r.startsWith('topic-')) return 'care';
    if (['diary', 'checkin', 'calendar'].indexOf(r) >= 0) return 'diary';
    if (['help', 'tell', 'ask'].indexOf(r) >= 0) return 'help';
    if (['care', 'pattern', 'fertile', 'midlife', 'pregnancy'].indexOf(r) >= 0 || modRoute(r)) return 'care';
    return r;
  }
  function renderTabbar() {
    const navEl = $('#tabbar'); const inApp = (state.stage === 'app' || state.stage === 'browse') && !mem.locked; navEl.hidden = !inApp; if (!inApp) return;
    const cur = tabOf(route());
    const tabs = state.stage === 'app'
      ? [['home', I.home, t('home')], ['diary', I.diary, state.settings.discreet ? t('notes') : t('diary')], ['care', I.care, t('care')], ['help', I.help, t('help')]]
      : [['care', I.care, t('care')], ['help', I.help, t('help')]];
    navEl.innerHTML = tabs.map((x) => '<button type="button" data-go="' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + esc(x[2]) + '</button>').join('');
    navEl.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { nav.stack = []; setHash(b.dataset.go); }));
  }
  function wire(root) {
    root.querySelectorAll('[data-su-go]').forEach((b) => { if (b._wired) return; b._wired = true; b.addEventListener('click', () => { closeSheet(true); mem.suLater = false; mem.su = null; render(); }); });
    root.querySelectorAll('[data-go]').forEach((b) => { if (b._wired) return; b._wired = true; b.addEventListener('click', (e) => { e.preventDefault(); setHash(b.dataset.go); }); });
    root.querySelectorAll('[data-back]').forEach((b) => { if (b._wired) return; b._wired = true; b.addEventListener('click', (e) => { e.preventDefault(); goBack(b.dataset.back); }); });
    root.querySelectorAll('[data-start-diary]').forEach((b) => { if (b._wired) return; b._wired = true; b.addEventListener('click', () => { closeSheet(); state.stage = 'onboard'; mem.ob = { step: 1 }; save(); render(); }); });
    root.querySelectorAll('[data-ask]').forEach((b) => { if (b._wired) return; b._wired = true; b.addEventListener('click', () => ask(b.dataset.ask)); });
  }
  const scrollMem = {}; let curRoute = null;
  /* When the diary changes hands (Delete everything, a sample woman, a restored backup) every screen forgets what the last
     person typed: the core's own memory, and each module that registered with onOwnerChange. */
  const ownerFns = []; let ownerSeen = null;
  function render() {
    if (ownerSeen !== state) { const had = ownerSeen !== null; ownerSeen = state; if (had) { const lockedNow = mem.locked; mem = freshMem(); mem.locked = lockedNow; ownerFns.forEach((f) => safe(f)); } }
    const lm = langMeta(state.lang); const script = lm.script || 'latn';
    document.body.classList.toggle('hi', script !== 'latn'); document.body.dataset.script = script; document.documentElement.lang = state.lang;
    document.body.classList.toggle('discreet', !!state.settings.discreet);
    applyTheme();
    /* A link ending in #demo opens the sample women (for investor demos), wherever she is. */
    if (location.hash === '#demo') { try { history.replaceState(null, '', location.pathname + location.search + (state.stage === 'app' ? '#home' : '')); } catch (e) { /* the hash stays; Home renders under the sheet */ } setTimeout(openDemo, 80); }
    const r = route(); const prevY = window.scrollY || 0;
    if (curRoute && curRoute !== r) { scrollMem[curRoute] = prevY; closeSheet(true); if (curRoute === 'checkin') mem.ciDraft = null; if (curRoute === 'ask') mem.askDraft = null; }   /* a sheet never follows her to another screen */
    const keepTour = tour && curRoute === r ? { id: tour.def.id, i: tour.i, forced: tour.forced } : null; renderFab(null); clearTour();
    renderTopbar(); renderTabbar();
    const v = view(); v.innerHTML = '';
    if (mem.locked && state.settings.pinHash) { renderLock(v); curRoute = null; window.scrollTo(0, 0); return; }
    if (mem.locked && state.stage === 'app') { renderRest(v); curRoute = null; window.scrollTo(0, 0); return; }
    if (signupGate(r)) { renderSignup(v); curRoute = r; window.scrollTo(0, 0); return; }
    let dir = 'fwd';
    if (state.stage === 'app' || state.stage === 'browse') dir = trackNav(r);
    if (runHook('beforeRender', [v, r, api]).some((x) => x === true)) return;
    if (mem.under18) return renderUnder18(v);
    if (state.stage === 'welcome') return renderWelcome(v);
    if (state.stage === 'onboard') return renderOnboard(v);
    const map = { account: renderAccount, home: renderHome, diary: renderDiary, learn: renderLearn, help: renderHelp, me: renderMe, checkin: renderCheckin, pattern: renderPattern, fertile: renderFertile, midlife: renderMidlife, pregnancy: renderPregnancy, ask: renderAsk, tell: renderTell, care: renderCare, report: renderReport, backup: renderBackup };
    if (r.startsWith('a-')) renderArticle(v, r.slice(2));
    else if (state.stage === 'browse' && !isOpen(r)) renderBrowseHome(v);
    else if (map[r]) map[r](v);
    else if (r.startsWith('topic-') && SECTIONS.indexOf(r.slice(6)) >= 0) renderTopic(v, r.slice(6));
    else { const mr = modRoute(r); if (mr) { const ok = safe(() => { mr.fn(v); return true; }, false); if (!ok) v.innerHTML = '<div class="card warn"><p>This screen hit an error in the prototype.</p><button type="button" class="btn sm" data-go="care">' + esc(t('care')) + '</button></div>'; wire(v); } else renderHome(v); }
    runHook('afterRender', [v, r, api]);
    safe(() => tidyView(v, r));
    const y = r === curRoute ? prevY : (dir === 'back' ? (scrollMem[r] || 0) : 0);
    curRoute = r; window.scrollTo(0, y);
    renderFab(r);
    if (keepTour) setTimeout(() => { const def = tourDef(keepTour.id); if (!def || route() !== r) return; const steps = def.steps.filter((x) => document.querySelector(x.sel)); if (!steps.length) return; tour = { def: def, steps: steps, i: Math.min(keepTour.i, steps.length - 1), forced: keepTour.forced, el: null }; showTourStep(false); }, 120);
    else queueTour(r);
  }

  /* ---------- care hub ---------- */
  const CORE_TILES = [
    { section: 'cond', route: 'pattern', title: 'pattern', sub: 'pattern_d', icon: 'check', gated: true, order: 90, mod: 'core' },
    { section: 'ttc', route: 'fertile', title: 'fertile', sub: 'fertile_d', icon: 'flower', gated: true, order: 30, mod: 'core' },
    { section: 'meno', route: 'midlife', title: 'midlife', sub: 'midlife_d', icon: 'moon', gated: true, order: 10, mod: 'core' },
    { section: 'preg', route: 'pregnancy', title: 'pregw', sub: 'pregw_d', icon: 'baby', gated: true, order: 5, mod: 'core' }
  ];
  const tileText = (x, k) => (typeof x[k] === 'string' ? t(x[k]) : tx(x[k]));
  const TOPIC_GROUPS = { periods: ['cycle', 'mind_body'], cond: ['pmos'], ttc: ['conceive'], preg: ['pregnancy'], intimate: ['intimate'], meno: ['midlife'], tools: ['services'] };
  const SECTION_ICONS = { periods: 'drop', contra: 'pill', pregtest: 'check', ttc: 'flower', preg: 'baby', post: 'heart', loss: 'leaf', intimate: 'lock', cond: 'chart', screen: 'ribbon', meno: 'moon', teen: 'users', tools: 'bell' };
  /* The five tools most likely to matter at her stage, first match wins. */
  const FOR_YOU = {
    preg: ['preg-week', 'preg-logs', 'pregtools-bag', 'preg-symptoms', 'access-schemes-preg'],
    post: ['post-recovery', 'post-feed', 'post-contra', 'post-checks', 'post-mood'],
    ttc: ['ttc', 'ttc-prep', 'fertile', 'ttc-signs', 'ttc-tests'],
    pmos: ['explain', 'pattern', 'cond-labs', 'periods-pms', 'cond-anaemia'],
    meno: ['meno', 'midlife', 'meno-diary', 'meno-hrt', 'screen-mine'],
    avoid: ['contra', 'contra-mine', 'contra-ec', 'pregtest-when', 'contra-free'],
    cycle: ['explain', 'periods-pms', 'periods-pain', 'contra', 'screen-mine'],
    browse: ['teen', 'periods', 'contra', 'pregtest', 'screen']
  };
  function forYouKeys() {
    const s = state.situation; const G = state.goals || []; const age = ageYears(); const out = [];
    if (state.stage !== 'app') return ['browse'];
    if (s.pregnant) out.push('preg');
    if (!s.pregnant && s.deliveredOn && diffDays(fromISO(s.deliveredOn), today()) <= 365) out.push('post');
    if (s.planning || G.indexOf('ttc') >= 0) out.push('ttc');
    if (s.pcos || G.indexOf('pmos') >= 0) out.push('pmos');
    if (isMidlife() || G.indexOf('meno') >= 0) out.push('meno');
    if (G.indexOf('avoid') >= 0) out.push('avoid');
    out.push('cycle'); return out;
  }
  /* Doctor's view is an internal demo; the core pregnancy screen is reached from Home when the pregnancy module is there. */
  const visibleTiles = () => CORE_TILES.concat(TILES).filter((x) => !(x.hidden && safe(() => x.hidden(api), false))).filter((x) => (x.route !== 'docportal' || state.settings.proto) && !(x.route === 'pregnancy' && ROUTES['preg-week']));
  function forYouTiles(all) {
    const byRoute = {}; all.forEach((x) => { if (!byRoute[x.route]) byRoute[x.route] = x; }); const res = [];
    forYouKeys().forEach((k) => (FOR_YOU[k] || []).forEach((rt) => { const x = byRoute[rt]; if (x && res.indexOf(x) < 0 && res.length < 5) res.push(x); }));
    return res;
  }
  const tileHtml = (x) => '<button type="button" class="item tile" data-go="' + esc(x.route) + '"><span class="ico-sm hue hue-' + hueOf(x.section) + '">' + icon(x.icon) + '</span><span class="body"><strong>' + esc(tileText(x, 'title')) + '</strong>' + (x.sub ? '<span>' + esc(tileText(x, 'sub')) + '</span>' : '') + '</span>' + (x.gated && state.settings.proto ? '<span class="pill">' + esc(t('gated_short')) + '</span>' : '<span class="chev">' + I.chev + '</span>') + '</button>';
  const allArticles = () => (CONTENT.groups || []).reduce((acc, g) => acc.concat((g.articles || []).map((a) => Object.assign({ group: g.group }, a))), []);
  const articlesFor = (groups) => allArticles().filter((a) => groups.indexOf(a.group) >= 0);
  const GROUP_ICONS = { cycle: 'drop', mind_body: 'sparkle', pmos: 'chart', conceive: 'flower', pregnancy: 'baby', intimate: 'lock', midlife: 'moon', services: 'map' };
  const artHtml = (a) => '<button type="button" class="item" data-go="a-' + esc(a.group + '.' + a.id) + '"><span class="ico-sm hue hue-' + hueOf(a.group) + '">' + icon(GROUP_ICONS[a.group] || 'learn') + '</span><span class="body"><strong>' + esc(L(a, 'title')) + '</strong><span>' + esc(L(a, 'summary')) + '</span></span></button>';
  /* Search understands Hindi, Hinglish and common Indian words. Each row: words a woman might type -> a word in our English text. */
  const SYN = [
    [['mahwari', 'mahavari', 'maasik', 'masik', 'mc ', 'pirieds', 'mens', 'chums', 'पीरियड', 'माहवारी', 'मासिक', 'महीना'], 'period'],
    [['garbh', 'pregnan', 'pregnent', 'pet se', 'garbhavastha', 'गर्भ', 'प्रेग्नेंसी', 'उम्मीद से'], 'pregnan'],
    [['safed pani', 'safed paani', 'white discharge', 'likoria', 'leucorrhoea', 'leukorrhea', 'सफ़ेद पानी', 'सफेद पानी', 'स्राव'], 'discharge'],
    [['pcod', 'pcos', 'pmos', 'पीसीओडी', 'पीसीओएस'], 'pmos'],
    [['bachcha', 'bacha', 'santan', 'conceive', 'बच्चा', 'संतान', 'ttc'], 'baby'],
    [['nirodh', 'condom', 'copper t', 'copper-t', 'cu-t', 'iud', 'chhaya', 'mala', 'antara', 'i-pill', 'ipill', 'unwanted', 'गर्भनिरोध', 'कंडोम', 'कॉपर'], 'contracep'],
    [['dard', 'cramp', 'ऐंठन', 'दर्द'], 'pain'],
    [['khoon ki kami', 'anemia', 'anaemia', 'haemoglobin', 'hemoglobin', 'खून की कमी', 'हीमोग्लोबिन'], 'anaemia'],
    [['thyroid', 'थायरॉइड', 'tsh'], 'thyroid'],
    [['menopause', 'rajonivritti', 'मेनोपॉज़', 'मेनोपॉज', 'रजोनिवृत्ति', 'hot flush', 'garmi'], 'menopause'],
    [['doodh', 'breastfeed', 'feeding', 'दूध', 'स्तनपान'], 'breastfeed'],
    [['sugar', 'diabetes', 'शुगर'], 'sugar'],
    [['pesab', 'peshab', 'urine', 'पेशाब'], 'urine'],
    [['cancer', 'कैंसर', 'pap', 'hpv', 'via test'], 'screen'],
    [['abortion', 'garbhpat', 'गर्भपात', 'mtp', 'safai'], 'abortion'],
    [['miscarriage', 'garbh gir', 'गर्भ गिर'], 'miscarriage'],
    [['scheme', 'yojana', 'योजना', 'paisa', 'pmmvy', 'jsy', 'ayushman'], 'scheme'],
    [['violence', 'maar', 'hinsa', 'हिंसा', 'abuse', 'pitai'], 'violence'],
    [['sambandh', 'संबंध', 'intercourse', 'sex'], 'sex'],
    [['vajan', 'वज़न', 'वजन', 'motapa', 'मोटापा', 'weight'], 'weight'],
    [['udaas', 'उदास', 'depression', 'tension', 'stress', 'ghabrahat', 'घबराहट'], 'mood'],
    [['dawai', 'dawa', 'दवा', 'tablet', 'goli', 'गोली'], 'medicine'],
    [['late', 'der se', 'deri', 'nahi aaya', 'nahi aya', 'nahin aaya', 'skip', 'miss', 'देर', 'नहीं आया', 'रुक गया'], 'missed'],
    [['hilna', 'hil nahi', 'hilta nahi', 'kick', 'not moving', 'moving less', 'baby moving', 'हलचल', 'हिल', 'लात'], 'kick'],
    [['khujli', 'itch', 'खुजली'], 'itch'],
    [['jalan', 'burning', 'जलन'], 'burning'],
    [['gaanth', 'ganth', 'lump', 'गाँठ', 'गांठ'], 'lump']
  ];
  const norm = (x) => String(x == null ? '' : x).toLowerCase();
  /* In pregnancy, a danger sign typed in any words (bleeding, swelling, blurred sight, fainting, fits, fever, leaking water,
     belly pain) puts the danger-signs guide first, whatever else matches. */
  const DANGER_ART = 'pregnancy.danger-signs-call-112';
  const DANGER_W = ['bleed', 'blood', 'khoon', 'khun', 'खून', 'spotting', 'swell', 'sujan', 'soojan', 'sujaan', 'सूजन', 'blurr', 'dhundh', 'धुंध', 'faint', 'behosh', 'बेहोश', 'unconscious', 'fits', 'seizure', 'convuls', 'daura', 'dora pad', 'दौरा', 'fever', 'bukhar', 'bukhaar', 'बुखार', 'leak', 'paani nikal', 'pani nikal', 'पानी निकल', 'पानी आ', 'water broke', 'waters broke', 'pet dard', 'pet me dard', 'pet mein dard', 'पेट दर्द', 'पेट में दर्द', 'severe pain', 'tez dard'];
  const dangerFirst = (q, arts) => { const qq = ' ' + norm(q) + ' '; if (!isPregnant() || !DANGER_W.some((w) => qq.indexOf(w) >= 0) && !/\bfits?\b/.test(qq)) return arts; const d = allArticles().find((a) => a.group + '.' + a.id === DANGER_ART); return d ? [d].concat(arts.filter((a) => a !== d)) : arts; };
  /* Questions come typed or spoken ("mera period late hai"): drop the filler words, keep the words that carry meaning,
     and add the English word for every Hindi or Hinglish word Sakhi knows. Results are ranked by how many words they match. */
  const STOP = new Set(('my me i im am is are was were the a an of to in on at for and or but what how when why which who do does did done it its this that ' +
    'about with from can could should would have has had be been being please tell know want need get got very much so some any no not yes ' +
    'mera meri mere mujhe mujhko hai hain ho hota hoti hote ka ki ke kya kyu kyun kyon kaise kab kahan kaun me mein se aur nahi nahin na ko raha rahi rahe ' +
    'gaya gayi gaye tha thi the bahut bhi to ye yeh wo woh hum ham aap apna apni apne koi kuch ab abhi phir par pe kar karna karein kare karu karoon karen karo batao bataiye time samay din ' +
    'है हैं हो होता होती मेरा मेरी मेरे मुझे मुझको का की के क्या क्यों क्यूँ कैसे कब कहाँ कौन में से और नहीं ना को रहा रही रहे गया गई गए था थी थे बहुत भी तो ये यह वो वह हम आप अपना अपनी अपने कोई कुछ अब अभी फिर पर कर करना करें बताओ बताइए').split(' '));
  /* Crude English stems so "moving" finds "movements" and "periods" finds "period". */
  const stem = (w) => (/^[a-z]+$/.test(w) && w.length >= 6 ? w.replace(/(ing|ed|es|s)$/, '') : w);
  const qWords = (qq) => qq.split(/[\s,.?!।|/]+/).filter((w) => w.length >= 2 && !STOP.has(w)).map(stem);
  function searchTerms(q) {
    const qq = norm(q).trim(); if (!qq) return [];
    const words = qWords(qq); const terms = words.length > 1 ? words.slice() : [words.length ? words[0] : qq];
    SYN.forEach((row) => { if (row[0].some((v) => { const vv = v.trim(); return qq.indexOf(vv) >= 0 || words.some((w) => w.length >= 3 && vv.indexOf(w) === 0); })) terms.push(row[1]); });
    return terms.filter((x, i) => terms.indexOf(x) === i);
  }
  const score = (hay, terms) => terms.reduce((n, tm) => n + (hay.indexOf(tm) >= 0 ? 1 : 0), 0);
  const bothLang = (x, k) => { const val = x[k]; if (!val) return ''; if (typeof val === 'string') return (STR.en[val] || val) + ' ' + (STR.hi[val] || ''); return (val.en || '') + ' ' + (val.hi || ''); };
  function searchResults(q, all) {
    const terms = searchTerms(q); if (!terms.length) return '';
    const rank = (list, hayOf) => list.map((x) => ({ x: x, n: score(hayOf(x), terms) })).filter((r) => r.n > 0).sort((a, b) => b.n - a.n).map((r) => r.x);
    const hitT = rank(all, (x) => norm(bothLang(x, 'title') + ' ' + bothLang(x, 'sub') + ' ' + (STR.en['sec_' + x.section] || '') + ' ' + (STR.hi['sec_' + x.section] || '') + ' ' + (x.keywords || '')));
    const hitA = dangerFirst(q, rank(allArticles(), (a) => norm([a.title_en, a.title_hi, a.summary_en, a.summary_hi].join(' '))));
    if (!hitT.length && !hitA.length) return '<div class="card"><p>' + esc(t('no_tools')) + '</p></div>';
    return (hitT.length ? '<section class="care-sec"><h2>' + esc(t('res_tools')) + '</h2><div class="list">' + hitT.slice(0, 24).map(tileHtml).join('') + '</div></section>' : '') +
      (hitA.length ? '<section class="care-sec"><h2>' + esc(t('res_articles')) + '</h2><div class="list">' + hitA.slice(0, 24).map(artHtml).join('') + '</div></section>' : '');
  }
  const searchBox = (id, val) => '<div class="searchbox">' + I.search + '<input id="' + id + '" type="search" enterkeyhint="search" placeholder="' + esc(t('search_all')) + '" value="' + esc(val || '') + '" aria-label="' + esc(t('search_all')) + '"></div>';
  const wireSearch = (v, id, key) => { const qi = $('#' + id, v); if (!qi) return; qi.addEventListener('input', (e) => { mem[key] = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#' + id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { } } }); };
  function renderCare(v) {
    const all = visibleTiles(); const q = (mem.careQ || '').trim(); let body = '';
    if (q) body = searchResults(q, all);
    else {
      const fy = forYouTiles(all);
      body = (fy.length ? '<section class="care-sec"><h2>' + esc(t('for_you')) + '</h2><div class="list">' + fy.map(tileHtml).join('') + '</div></section>' : '') +
        '<section class="care-sec"><h2>' + esc(t('care_topics')) + '</h2><div class="topic-grid">' + SECTIONS.map((sec) => { const n = all.filter((x) => x.section === sec).length + articlesFor(TOPIC_GROUPS[sec] || []).length; if (!n) return ''; return '<button type="button" class="topic-card hue-' + hueOf(sec) + '" data-go="topic-' + sec + '">' + (api.art ? api.art.spot(sec) : '<span class="ico-sm hue">' + icon(SECTION_ICONS[sec]) + '</span>') + '<strong>' + esc(t('sec_' + sec)) + '</strong><span class="small">' + esc(tf('topic_count', { n: n })) + '</span></button>'; }).join('') + '</div></section>';
    }
    if (!q) body += '<button type="button" class="item quiet" data-go="learn"><span class="ico-sm hue hue-sky">' + I.learn + '</span><span class="body"><strong>' + esc(t('all_articles')) + '</strong><span>' + esc(tf('all_articles_d', { n: allArticles().length })) + '</span></span><span class="chev">' + I.chev + '</span></button>';
    v.innerHTML = '<h1>' + esc(t('care_h')) + '</h1>' + searchBox('care-q', mem.careQ) + body;
    wire(v); wireSearch(v, 'care-q', 'careQ');
  }
  /* One page per topic: its tools and guides, then the Learn articles on the same subject. */
  function renderTopic(v, sec) {
    const items = visibleTiles().filter((x) => x.section === sec).sort((a, b) => (a.order || 50) - (b.order || 50)); const arts = articlesFor(TOPIC_GROUPS[sec] || []);
    v.innerHTML = backRow(t('sec_' + sec), 'care', false) + (items.length ? '<div class="list">' + items.map(tileHtml).join('') + '</div>' : '') + (arts.length ? '<section class="care-sec"><h2>' + esc(t('res_articles')) + '</h2><div class="list">' + arts.map(artHtml).join('') + '</div></section>' : '');
    wire(v);
  }

  /* ---------- welcome + onboarding ---------- */
  /* ---------- first run: language, hello, age, stage, one question for her stage, shared phone ----------
     About 200 words in all and no typing; her language comes first. Nothing here asks for consent: her diary works on her phone
     without it. Sakhi asks, with an itemised note, only when something would leave the phone (the free-call request). */
  const phoneLang = () => { const n = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().slice(0, 2); return LANGS.some((l) => l.code === n) ? n : 'en'; };
  const tIn = (code, k) => (STR[code] && STR[code][k]) || STR.en[k] || k;
  function renderWelcome(v) {
    if (!state.langChosen) {
      const ph = phoneLang();
      v.innerHTML = '<div class="welcome ob ob-langs-screen">' + (api.art ? '<div class="ob-av">' + api.art.sakhi({ pose: 'hi', look: state.settings.look }) + '</div>' : '') +
        '<h1 lang="hi" class="ob-hi">' + esc(tIn('hi', 'ob_lang_h')) + '</h1><p class="ob-sub" lang="en">' + esc(tIn('en', 'ob_lang_h')) + '</p>' +
        '<div class="ob-langs">' + LANGS.map((l) => '<button type="button" class="ob-lt' + (l.code === ph ? ' on' : '') + '" data-ob-lang="' + esc(l.code) + '" lang="' + esc(l.code) + '"><strong class="lang-' + esc(l.script || 'latn') + '">' + esc(l.name || l.label) + '</strong>' + (l.code === ph ? '<span>' + esc(tIn(l.code, 'ob_phone')) + '</span>' : (l.partial ? '<span>' + esc(tIn(l.code, 'ob_partly')) + '</span>' : '')) + '</button>').join('') + '</div>' +
        '<p class="small ob-hear">' + I.speaker.replace('<svg', '<svg aria-hidden="true"') + '<span><span lang="hi">' + esc(tIn('hi', 'ob_hear')) + '</span> <span lang="en">' + esc(tIn('en', 'ob_hear')) + '</span></span></p></div>';
      v.querySelectorAll('[data-ob-lang]').forEach((b) => b.addEventListener('click', () => { state.lang = b.dataset.obLang; state.langChosen = true; save(); render(); }));
      return;
    }
    v.innerHTML = '<div class="welcome ob ob-hello">' + (api.art ? '<div class="ob-av big" id="ob-sakhi">' + api.art.sakhi({ pose: 'hi', look: state.settings.look, label: t('sakhi_alt') }) + '</div>' : '') + '<h1>' + esc(t('ob_hello_h')) + '</h1>' +
      '<div class="ob-prom">' + [['lock', 'ob_p1'], ['help', 'ob_p2'], ['heart', 'ob_p3']].map((x) => '<div><span class="ob-pi">' + I[x[0]] + '</span><span>' + esc(t(x[1])) + '</span></div>').join('') + '</div>' +
      '<button type="button" class="btn primary block" id="w-start">' + esc(t('start')) + '</button><button type="button" class="btn block" id="w-browse">' + esc(t('ob_read')) + '</button>' +
      '<button type="button" class="linkbtn" id="w-notice">' + esc(t('ob_notice_link')) + '</button>' + (canBackup() ? '<button type="button" class="linkbtn" id="w-restore">' + esc(t('w_restore')) + '</button>' : '') + (state.settings.proto ? '<button type="button" class="linkbtn" id="w-demo">' + esc(t('demo_h')) + '</button>' : '') + '</div>';
    $('#w-start', v).addEventListener('click', () => { state.stage = 'onboard'; mem.ob = { step: 1 }; save(); render(); });
    $('#w-browse', v).addEventListener('click', () => { state.stage = 'onboard'; mem.ob = { step: 1, read: true }; save(); render(); });
    $('#w-notice', v).addEventListener('click', openNotice);
    const wr = $('#w-restore', v); if (wr) wr.addEventListener('click', openRestore);
    const wd = $('#w-demo', v); if (wd) wd.addEventListener('click', openDemo);
    /* For demos: press and hold Sakhi to load one of the sample women. */
    const sk = $('#ob-sakhi', v); if (sk) { let tm = 0; const stop = () => clearTimeout(tm); sk.addEventListener('pointerdown', () => { stop(); tm = setTimeout(openDemo, 700); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => sk.addEventListener(ev, stop)); sk.addEventListener('contextmenu', (e) => e.preventDefault()); }
  }
  /* A new phone: restore straight from the Hello screen, with no diary to set up first. */
  function openRestore() {
    sheet('<h2>' + esc(t('bk_restore_h')) + '</h2><label for="wr-code">' + esc(t('bk_paste')) + '</label><textarea id="wr-code" rows="3" autocomplete="off" spellcheck="false"></textarea><label for="wr-pin">' + esc(t('bk_pin_r')) + '</label><input id="wr-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="6" pattern="[0-9]*"><div id="wr-out"></div><div class="sheet-foot"><div class="grid2"><button type="button" class="btn" id="wr-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="wr-go">' + esc(t('bk_restore')) + '</button></div></div>', (sh) => {
      $('#wr-no', sh).addEventListener('click', () => closeSheet(true));
      $('#wr-go', sh).addEventListener('click', async () => {
        let st; try { st = await readBackup($('#wr-code', sh).value, $('#wr-pin', sh).value); } catch (e) { $('#wr-out', sh).innerHTML = '<div class="flag">' + esc(t('bk_wrong')) + '</div>'; return; }
        const lang = state.lang; state = Object.assign(defaults(), st); state.settings = Object.assign(defaults().settings, st.settings || {}); state.sample = null; state.langChosen = true; if (!state.lang) state.lang = lang;
        save(); closeSheet(true); toast(t('bk_done')); setHash('home'); render();
      });
    });
  }
  /* The full notice sits behind one link on the Hello screen. The live app adds processors, retention and the Grievance Officer. */
  function openNotice() {
    sheet('<h2>' + esc(t('ob_notice_link')) + '</h2><ul class="ob-ul">' + [1, 2, 5, 3, 4].map((i) => '<li>' + esc(t('ob_notice_' + i)) + '</li>').join('') + '</ul><p class="small">' + esc(t('notice_text')) + '</p><p class="small">' + esc(t('grievance')) + '</p><div class="sheet-foot"><button type="button" class="btn primary block" id="nt-ok">' + esc(t('hint_ok')) + '</button></div>', (sh) => { $('#nt-ok', sh).addEventListener('click', closeSheet); });
  }
  /* Sample women for demos: press and hold Sakhi on the Hello screen, open the link with #demo, or Me > Demo. */
  function openDemo() {
    sheet('<h2>' + esc(t('demo_h')) + '</h2><p class="small">' + esc(t('demo_p')) + '</p><div class="list">' + ['priya', 'asha', 'meera', 'sunita', 'kamla'].map((id) => '<button type="button" class="item" data-sample="' + id + '"><span class="body"><strong>' + esc(t('sample_' + id)) + '</strong></span><span class="chev">' + I.chev + '</span></button>').join('') + '</div><div id="demo-sure"></div>', (sh) => {
      const go = (id) => { const keep = { theme: state.settings.theme, look: state.settings.look }; loadSample(id); Object.assign(state.settings, keep); state.langChosen = true; save(); closeSheet(true); toast(t('sample_note')); setHash('home'); };
      /* Her own entries are replaced by the sample, so that asks first (a sample replacing a sample does not). */
      const mine = state.stage === 'app' && !state.sample && (state.events.length || Object.keys(state.daily || {}).length || Object.keys(state.notes || {}).length || Object.keys(state.checkins || {}).length);
      sh.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', () => {
        if (!mine) { go(b.dataset.sample); return; }
        const box = $('#demo-sure', sh); box.innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('demo_sure')) + '</p><div class="grid2"><button type="button" class="btn" id="demo-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="demo-yes">' + esc(t('demo_yes')) + '</button></div></div>';
        $('#demo-no', box).addEventListener('click', () => { box.innerHTML = ''; }); $('#demo-yes', box).addEventListener('click', () => go(b.dataset.sample)); box.scrollIntoView({ block: 'nearest' });
      }));
    });
  }
  function renderUnder18(v) {
    v.innerHTML = '<div class="welcome">' + (api.art ? '<div class="mark sakhi-mark">' + api.art.sakhi({ pose: 'calm', look: state.settings.look }) + '</div>' : '<div class="mark">' + I.help + '</div>') + '<h1>' + esc(t('under18_h')) + '</h1><p>' + esc(t('under18_p')) + '</p><button type="button" class="btn primary block" data-go="help">' + esc(t('safety')) + '</button><button type="button" class="btn block" data-go="learn">' + esc(t('learn')) + '</button>' + runHook('under18', [api], true) + '<button type="button" class="btn ghost block" id="u18-back">' + esc(t('back')) + '</button>' + '<p class="footnote">' + esc(t('teen_learn')) + '</p></div>';
    /* Under 18 (MODULE_API rule 10): she reads, nothing is saved (save() stops while mem.teen is on), and Doctor shows Childline
       1098 and a trusted adult instead of a booking form. Reopening the app asks her age again. */
    v.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { mem.teen = true; state.stage = 'browse'; mem.under18 = false; setHash(b.dataset.go); }));
    $('#u18-back', v).addEventListener('click', () => { mem.under18 = false; mem.teen = false; state.stage = 'welcome'; render(); });
  }
  function renderOnboard(v) {
    const ob = mem.ob || (mem.ob = { step: 1 });
    const learn = ob.stage === 'learn'; const total = ob.read ? 1 : (learn ? 3 : 4); const num = ob.read ? 1 : (learn && ob.step === 4 ? 3 : ob.step);
    const head = (title, p) => '<div class="ob-top"><button type="button" class="iconbtn" id="ob-back" aria-label="' + esc(t('back')) + '">' + I.back + '</button><div class="progress" role="img" aria-label="' + esc(t('step') + ' ' + num + ' ' + t('of') + ' ' + total) + '">' + Array.from({ length: total }, (x, i) => '<i class="' + (i < num ? 'on' : '') + '"></i>').join('') + '</div></div><h1>' + esc(title) + '</h1>' + (p ? '<p>' + esc(p) + '</p>' : '');
    const back = (fn) => $('#ob-back', v).addEventListener('click', fn);
    const nowY = today().getFullYear(); const curM = today().getMonth() + 1;
    const inRange = (val, a, b) => !!val && fromISO(val) >= addDays(today(), a) && fromISO(val) <= addDays(today(), b);
    const chip = (attr, val, label, on) => '<button type="button" class="chip ob-c' + (on ? ' on' : '') + '" ' + attr + '="' + esc(String(val)) + '" aria-pressed="' + !!on + '">' + esc(label) + '</button>';
    if (ob.step === 1) {
      /* Age: decade, then year. No keyboard. The month only for someone who may be 17 or 18. */
      const decs = [['pre', t('ob_before')]].concat([1950, 1960, 1970, 1980, 1990, 2000].map((d) => [d, d + '–' + String(d + 9).slice(2)])).concat([['post', t('ob_after')]]);
      const years = typeof ob.dec === 'number' ? '<div class="ob-grid5">' + Array.from({ length: 10 }, (x, i) => ob.dec + i).filter((y) => y <= nowY).map((y) => chip('data-ob-y', y, String(y), ob.y === y)).join('') + '</div>' : '';
      const months = ob.y && nowY - ob.y === 18 ? '<h2 class="ob-h2">' + esc(t('ob_month_h')) + '</h2><div class="ob-grid4">' + t('months').map((mn, i) => chip('data-ob-m', i + 1, mn, ob.m === i + 1)).join('') + '</div>' : '';
      v.innerHTML = '<div class="stack ob" style="gap:14px">' + head(t('ob_age_h'), t('ob_age_p')) + '<div class="ob-grid4">' + decs.map((d) => chip('data-ob-dec', d[0], d[1], String(ob.dec) === String(d[0]))).join('') + '</div>' + years + months + '<p class="small">' + esc(t('ob_u18')) + '</p></div>';
      const decide = () => {
        const age = nowY - ob.y;
        if (age < 18 || (age === 18 && ob.m && ob.m > curM)) { mem.under18 = true; mem.ob = null; render(); return; }
        if (age === 18 && !ob.m) { render(); return; }
        mem.teen = false; ob.dob = toISO(new Date(ob.y, (ob.m || 7) - 1, 1)); if (ob.read) { finishRead(); return; } ob.step = 2; render();
      };
      v.querySelectorAll('[data-ob-dec]').forEach((b) => b.addEventListener('click', () => { const d = b.dataset.obDec; if (d === 'post') { mem.under18 = true; mem.ob = null; render(); return; } if (d === 'pre') { ob.dec = 'pre'; ob.y = 1945; ob.m = null; decide(); return; } ob.dec = +d; ob.y = null; ob.m = null; render(); }));
      v.querySelectorAll('[data-ob-y]').forEach((b) => b.addEventListener('click', () => { ob.y = +b.dataset.obY; ob.m = null; decide(); }));
      v.querySelectorAll('[data-ob-m]').forEach((b) => b.addEventListener('click', () => { ob.m = +b.dataset.obM; decide(); }));
      back(() => { state.stage = 'welcome'; mem.ob = null; save(); render(); });
    } else if (ob.step === 2) {
      /* Her stage: one choice. It decides Home, the buttons, the questions and the check-in. */
      const tiles = [['cycle', 'ob_st_cycle', 'periods'], ['ttc', 'ob_st_ttc', 'ttc'], ['preg', 'ob_st_preg', 'preg'], ['post', 'ob_st_post', 'post'], ['meno', 'ob_st_meno', 'meno'], ['learn', 'ob_st_learn', 'learn']];
      const pic = (x) => (!api.art ? '' : (x[0] === 'learn' ? api.art.spot('learn', { hue: 'sky', icon: 'learn', blob: 'var(--card)' }) : api.art.spot(x[2], { blob: 'var(--card)' })));
      v.innerHTML = '<div class="stack ob" style="gap:14px">' + head(t('ob_stage_h'), t('ob_stage_p')) + '<div class="ob-stages">' + tiles.map((x) => '<button type="button" class="qa-tile hue-' + (x[0] === 'learn' ? 'sky' : hueOf(x[2])) + (ob.stage === x[0] ? ' on' : '') + '" data-ob-st="' + x[0] + '" aria-pressed="' + (ob.stage === x[0]) + '">' + pic(x) + '<span>' + esc(t(x[1])) + '</span></button>').join('') + '</div></div>';
      v.querySelectorAll('[data-ob-st]').forEach((b) => b.addEventListener('click', () => { if (ob.stage !== b.dataset.obSt) { ob.lp = null; ob.lpk = null; ob.approx = false; ob.stopped = false; } ob.stage = b.dataset.obSt; ob.step = ob.stage === 'learn' ? 4 : 3; render(); }));
      back(() => { ob.step = 1; render(); });
    } else if (ob.step === 3) {
      const st = ob.stage;
      if (st === 'preg') {
        const field = (k, id, lab, extra) => ob.pq === k ? '<div class="card"><label for="' + id + '">' + esc(t(lab)) + '</label><input type="date" id="' + id + '"' + extra + ' value="' + esc(ob[k] || '') + '"><button type="button" class="btn primary block" id="ob-next">' + esc(t('continue')) + '</button></div>' : '';
        v.innerHTML = '<div class="stack ob" style="gap:12px">' + head(t('ob_preg_h'), t('ob_preg_p')) +
          '<button type="button" class="btn' + (ob.pq === 'edd' ? ' on' : '') + '" data-ob-pq="edd">' + esc(t('ob_preg_edd')) + '</button>' + field('edd', 'ob-edd', 'scan_edd', '') +
          '<button type="button" class="btn' + (ob.pq === 'lmp' ? ' on' : '') + '" data-ob-pq="lmp">' + esc(t('ob_preg_lmp')) + '</button>' + field('lmp', 'ob-lmp', 'lmp', ' max="' + toISO(today()) + '"') +
          '<button type="button" class="btn ghost" data-ob-pq="later">' + esc(t('ob_later')) + '</button></div>';
        v.querySelectorAll('[data-ob-pq]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.obPq; if (k === 'later') { ob.edd = null; ob.lmp = null; ob.step = 4; render(); return; } ob.pq = k; render(); const f = $('#ob-' + k, v); if (f) safe(() => f.focus()); }));
        const nx = $('#ob-next', v); if (nx) nx.addEventListener('click', () => {
          const val = ($('#ob-' + ob.pq, v) || {}).value || '';
          if (ob.pq === 'edd' && !inRange(val, -28, 280)) { toast(t('date_bad')); return; }
          if (ob.pq === 'lmp' && !inRange(val, -310, 0)) { toast(t('date_bad')); return; }
          ob[ob.pq] = val; ob[ob.pq === 'edd' ? 'lmp' : 'edd'] = null; ob.step = 4; render();
        });
      } else if (st === 'post') {
        if (!ob.bf) ob.bf = 'yes';
        v.innerHTML = '<div class="stack ob" style="gap:12px">' + head(t('baby_date'), '') + '<div class="card"><label for="ob-birth">' + esc(t('ob_birth_l')) + '</label><input type="date" id="ob-birth" max="' + toISO(today()) + '" min="' + toISO(addDays(today(), -730)) + '" value="' + esc(ob.birth || '') + '"></div>' +
          '<h2 class="ob-h2">' + esc(t('ob_bf_q')) + '</h2><div class="grid3">' + [['yes', 'ob_yes'], ['no', 'ob_no'], ['some', 'ob_some']].map((x) => chip('data-ob-bf', x[0], t(x[1]), ob.bf === x[0])).join('') + '</div>' +
          '<button type="button" class="btn primary block" id="ob-next">' + esc(t('continue')) + '</button></div>';
        $('#ob-birth', v).addEventListener('change', (e) => { ob.birth = e.target.value || null; });
        v.querySelectorAll('[data-ob-bf]').forEach((b) => b.addEventListener('click', () => { ob.bf = b.dataset.obBf; v.querySelectorAll('[data-ob-bf]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); }));
        $('#ob-next', v).addEventListener('click', () => { const b = $('#ob-birth', v).value; if (!inRange(b, -730, 0)) { toast(t('date_bad')); return; } ob.birth = b; ob.step = 4; render(); });
      } else {
        /* Periods, trying or midlife: when did the last one start? A guess is welcome and saved as a guess. */
        const opts = [['0', 'today_b'], ['1', 'yesterday'], ['7', 'ob_lp_w1'], ['14', 'ob_lp_w2'], ['24', 'ob_lp_w34'], ['more', 'ob_lp_more']].concat(st === 'meno' ? [['stop', 'ob_lp_stop']] : []).concat([['pick', 'pick'], ['none', 'dont_remember']]);
        v.innerHTML = '<div class="stack ob" style="gap:12px">' + head(t('lp_h'), t('ob_lp_p')) + '<div class="grid2 ob-lp">' + opts.map((x) => chip('data-ob-lp', x[0], t(x[1]), ob.lpk === x[0])).join('') + '</div>' +
          (ob.lpk === 'pick' ? '<div class="card"><label for="ob-lpd">' + esc(t('pick')) + '</label><input type="date" id="ob-lpd" max="' + toISO(today()) + '" value="' + esc(ob.lpk === 'pick' && ob.lp ? ob.lp : '') + '"><button type="button" class="btn primary block" id="ob-next">' + esc(t('continue')) + '</button></div>' : '') + '</div>';
        v.querySelectorAll('[data-ob-lp]').forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.obLp; ob.lpk = k;
          if (k === 'pick') { render(); const f = $('#ob-lpd', v); if (f) safe(() => f.focus()); return; }
          const n = parseInt(k, 10); ob.lp = isNaN(n) ? null : toISO(addDays(today(), -n)); ob.approx = n >= 7; ob.stopped = k === 'stop'; ob.step = 4; render();
        }));
        const nx = $('#ob-next', v); if (nx) nx.addEventListener('click', () => { const d = $('#ob-lpd', v).value; if (!inRange(d, -730, 0)) { toast(t('date_bad')); return; } ob.lp = d; ob.approx = false; ob.stopped = false; ob.step = 4; render(); });
      }
      back(() => { ob.step = 2; render(); });
    } else {
      /* A shared phone: offer the privacy kit right here. "Only me" goes straight to Home. */
      const B = window.SakhiAndroid; const canDisguise = !!(B && B.setDisguise);
      if (!ob.kit) ob.kit = { lock: true, plain: true, notes: false };
      const showKit = !!ob.share && ob.share !== 'me';
      const row = (k, label, desc) => '<label class="item"><span class="body"><strong>' + esc(t(label)) + '</strong>' + (desc ? '<span>' + esc(t(desc)) + '</span>' : '') + '</span><input type="checkbox" data-ob-kit="' + k + '"' + (ob.kit[k] ? ' checked' : '') + '></label>';
      v.innerHTML = '<div class="stack ob" style="gap:12px">' + head(t('ob_sh_h'), '') + '<div class="list">' + [['me', 'ob_sh_me'], ['some', 'ob_sh_some'], ['fam', 'ob_sh_fam']].map((x) => '<button type="button" class="item ob-opt' + (ob.share === x[0] ? ' on' : '') + '" data-ob-sh="' + x[0] + '" aria-pressed="' + (ob.share === x[0]) + '"><span class="body"><strong>' + esc(t(x[1])) + '</strong></span>' + (ob.share === x[0] ? '<span class="pill ok">✓</span>' : '') + '</button>').join('') + '</div>' +
        (showKit ? '<div class="card ob-kit"><h2>' + esc(t('ob_kit_h')) + '</h2><div class="list">' + row('lock', 'ob_kit_lock', '') + row('plain', 'ob_kit_plain', 'ob_kit_plain_d') + (canDisguise ? row('notes', 'ob_kit_notes', '') : '') + '</div><p class="small">' + esc(t('ob_kit_p')) + '</p><button type="button" class="btn primary block" id="ob-done">' + esc(t('ob_done')) + '</button></div>' : '') + '</div>';
      v.querySelectorAll('[data-ob-sh]').forEach((b) => b.addEventListener('click', () => { ob.share = b.dataset.obSh; if (ob.share === 'me') finishOnboard(); else render(); }));
      v.querySelectorAll('[data-ob-kit]').forEach((c) => c.addEventListener('change', () => { ob.kit[c.dataset.obKit] = c.checked; }));
      const dn = $('#ob-done', v); if (dn) dn.addEventListener('click', finishOnboard);
      back(() => { ob.step = learn ? 2 : 3; render(); });
    }
  }
  /* What onboarding saves: her birth month and year, her stage as situation flags, and her last period if she gave one. */
  function finishOnboard() {
    const ob = mem.ob || {}; const st = ob.stage || 'cycle'; const sit = {};
    state.dob = ob.dob || null;
    if (st === 'preg') { sit.pregnant = true; if (ob.edd) { sit.scanEdd = ob.edd; sit.pregnantSince = toISO(addDays(fromISO(ob.edd), -280)); } if (ob.lmp) sit.pregnantSince = ob.lmp; }
    else if (st === 'post') { sit.deliveredOn = ob.birth; sit.breastfeeding = ob.bf !== 'no'; }
    else if (st === 'ttc') sit.planning = true;
    else if (st === 'meno') { sit.midlife = true; if (ob.stopped) sit.stopped = true; }
    state.situation = sit; state.goals = [{ cycle: 'track', ttc: 'ttc', preg: 'preg', post: 'baby', meno: 'meno', learn: 'learn' }[st]];
    if (ob.lp && (st === 'cycle' || st === 'ttc' || st === 'meno')) state.events.push(ob.approx ? { d: ob.lp, t: 'start', approx: true } : { d: ob.lp, t: 'start' });
    const kit = ob.share && ob.share !== 'me' ? ob.kit : null;
    if (kit) { state.settings.discreet = !!kit.plain; if (kit.notes) safe(() => window.SakhiAndroid.setDisguise(true)); }
    state.stage = 'app'; state.langChosen = true; mem.ob = null; save(); setHash('home');
    if (kit && kit.lock) setTimeout(() => pinSheet('set'), 400);
  }
  /* "Just read": only her birth year (for the under-18 rule and the account), then the guides. */
  function finishRead() { const ob = mem.ob || {}; state.dob = ob.dob || state.dob || null; state.stage = 'browse'; state.langChosen = true; mem.ob = null; save(); setHash('care'); }
  function renderBrowseHome(v) { v.innerHTML = acctCard() + '<div class="card"><h2>' + esc(t('browse_h')) + '</h2><p>' + esc(t('browse_p')) + '</p><button type="button" class="btn primary block" id="b-start">' + esc(t('start')) + '</button><button type="button" class="btn block" data-go="care">' + esc(t('all_tools')) + '</button></div>' + acctItem(); wire(v); $('#b-start', v).addEventListener('click', () => { state.stage = 'onboard'; mem.ob = { step: 1 }; render(); }); }

  /* ---------- account: every woman signs up with her mobile number; her diary never leaves the phone ----------
     The account sits under its own storage key, never inside `state`, so backups, samples and "Show my data" never carry it.
     net() is the app's only door out: it sends just the fields SEND lists for each call and drops everything else. The
     server's side is server/SERVER_SPEC.md. With no server address (window.SAKHI_CONFIG.api) a stand-in server runs on the phone
     and sends nothing: its code is always 123456, and the code screen says so. */
  const ACC_KEY = 'qura-sakhi-account-v1';
  const NOTICE_V = '2026-10-20';
  const CFG = Object.assign({ api: '', app: '0.20', platform: window.SakhiAndroid ? 'android' : 'web' }, window.SAKHI_CONFIG || {});
  const DEMO_CODE = '123456';
  const HEARD = ['doc', 'fam', 'wa', 'social', 'qura', 'other'];
  const SEND = {
    'POST otp/start': ['phone', 'channel', 'lang', 'app', 'platform'],
    'POST otp/verify': ['challenge', 'code', 'birth_year', 'notice', 'lang', 'app', 'platform'],
    'PATCH me': ['name', 'pincode', 'heard', 'upd_sms', 'upd_wa', 'lang'],
    'POST me/active': ['app', 'lang'],
    'POST session/logout': [],
    'DELETE me': []
  };
  const ACC_FIELDS = ['id', 'phone', 'birth_year', 'name', 'pincode', 'heard', 'upd_sms', 'upd_wa'];
  let acct = {};
  const loadAcct = () => { try { const a = JSON.parse(localStorage.getItem(ACC_KEY) || 'null'); acct = a && typeof a === 'object' && a.token ? a : {}; } catch (e) { acct = {}; } };
  const saveAcct = () => { try { if (acct.token) localStorage.setItem(ACC_KEY, JSON.stringify(acct)); else localStorage.removeItem(ACC_KEY); } catch (e) { /* storage blocked: she signs in again next visit */ } };
  const takeAcct = (a) => { if (a && typeof a === 'object') ACC_FIELDS.forEach((k) => { if (a[k] !== undefined) acct[k] = a[k]; }); };
  const acctPublic = () => { const o = {}; ACC_FIELDS.forEach((k) => { if (acct[k] !== undefined) o[k] = acct[k]; }); return o; };
  const signedIn = () => !!acct.token;
  /* Everyone signs up except a girl under 18 (no account, nothing saved), the sample women and the first-run screens.
     After the code, her optional details screen stays up until she continues or skips. */
  const needsSignup = () => !signedIn() && !mem.teen && !mem.under18 && !state.sample && (state.stage === 'app' || state.stage === 'browse');
  const signupGate = (r) => r !== 'help' && ((needsSignup() && !mem.suLater) || !!(mem.su && mem.su.step === 'about' && signedIn()));
  const natPhone = (p) => String(p || '').replace(/^\+91/, '');
  const showPhone = (p) => { const n = natPhone(p); return n.length === 10 ? '+91\u00a0' + n.slice(0, 5) + '\u00a0' + n.slice(5) : String(p || ''); };   /* no-break spaces: the number never splits across lines */
  const maskPhone = (p) => { const n = natPhone(p); return n.length === 10 ? '+91\u00a0•••••\u00a0•' + n.slice(6) : '—'; };
  /* "+91 98765-43210", "098765 43210" or "9876543210" -> "+919876543210"; anything else -> null. Indian mobiles only (the code goes by SMS). */
  const normPhone = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2); else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1); return /^[6-9]\d{9}$/.test(d) ? '+91' + d : null; };
  const netErr = (code, extra) => Object.assign(new Error(code), extra || {}, { code: code });
  function net(method, path, body) {
    const allow = SEND[method + ' ' + path]; if (!allow) return Promise.reject(netErr('not_allowed'));
    const clean = {}; allow.forEach((k) => { if (body && body[k] !== undefined && body[k] !== null) clean[k] = body[k]; });
    if (!CFG.api) return demoServer(method + ' ' + path, clean);
    const headers = { 'Content-Type': 'application/json' }; if (acct.token) headers.Authorization = 'Bearer ' + acct.token;
    const ctl = typeof AbortController === 'function' ? new AbortController() : null; const tm = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
    return fetch(String(CFG.api).replace(/\/+$/, '') + '/v1/' + path, { method: method, headers: headers, body: method === 'DELETE' ? undefined : JSON.stringify(clean), cache: 'no-store', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
      .then((res) => res.text().catch(() => '').then((tx) => {
        clearTimeout(tm); let j = {}; try { j = tx ? JSON.parse(tx) : {}; } catch (e) { j = {}; }
        if (res.status === 401 && acct.token) { acct = {}; saveAcct(); }   /* signed out on the server (expired or deleted): she signs in again */
        if (!res.ok) throw netErr(j.error || 'http_' + res.status, j);
        return j;
      }), () => { clearTimeout(tm); throw netErr('offline'); });
  }
  /* The stand-in server: the same answers as server/SERVER_SPEC.md, and nothing leaves the phone. */
  const demo = { phone: null, tries: 0 };
  function demoServer(key, b) {
    return new Promise((ok, no) => setTimeout(() => {
      if (key === 'POST otp/start') { if (!/^\+91[6-9]\d{9}$/.test(b.phone || '')) { no(netErr('phone_bad')); return; } demo.phone = b.phone; demo.tries = 0; ok({ challenge: 'demo-' + Date.now().toString(36), channel: b.channel === 'sms' ? 'sms' : 'whatsapp', resend_after: 30, expires_in: 600 }); return; }
      if (key === 'POST otp/verify') {
        if (b.code !== DEMO_CODE) { demo.tries += 1; no(netErr(demo.tries >= 5 ? 'too_many' : 'code_wrong', { tries_left: Math.max(0, 5 - demo.tries) })); return; }
        ok({ token: 'demo.' + Math.random().toString(36).slice(2), is_new: true, account: { id: 'demo', phone: demo.phone, birth_year: b.birth_year || null, name: null, pincode: null, heard: null, upd_sms: false, upd_wa: false } }); return;
      }
      if (key === 'PATCH me') { ok({ account: Object.assign(acctPublic(), b) }); return; }
      ok({});
    }, 250));
  }
  const profileOf = (a) => ({ name: String(a.name || '').trim().slice(0, 40), pincode: String(a.pin || '').trim(), heard: a.heard || '', upd_sms: !!a.sms, upd_wa: !!a.wa });
  const pinCodeOk = (s) => !s || /^[1-9]\d{5}$/.test(s);
  /* Her details go now, or wait in acct.pending and go the next time she is online. A refusal (not a lost connection) drops them. */
  const dropPending = (e) => { if (e.code !== 'offline' && !/^http_5/.test(e.code || '')) { delete acct.pending; saveAcct(); } };
  function saveProfile(p, done) {
    Object.assign(acct, p); acct.pending = Object.assign(acct.pending || {}, p); saveAcct();
    net('PATCH', 'me', Object.assign({ lang: state.lang }, acct.pending)).then((j) => { takeAcct(j.account); delete acct.pending; saveAcct(); if (done) done(true); }, (e) => { dropPending(e); if (done) done(false); });
  }
  /* Once a day while she is signed in: "last active" and the app version (the only usage Qura sees per person), plus any
     details she saved while offline. Never for the sample women. */
  let syncing = false;
  function acctSync() {
    if (!signedIn() || state.sample || syncing) return; const day = toISO(today()); const jobs = [];
    if (acct.pending) jobs.push(() => (signedIn() ? net('PATCH', 'me', Object.assign({ lang: state.lang }, acct.pending)).then((j) => { takeAcct(j.account); delete acct.pending; saveAcct(); }, dropPending) : null));
    if (acct.activeOn !== day) jobs.push(() => (signedIn() ? net('POST', 'me/active', { app: CFG.app, lang: state.lang }).then(() => { if (signedIn()) { acct.activeOn = day; saveAcct(); } }, () => { }) : null));
    if (!jobs.length) return; syncing = true;
    jobs.reduce((p, f) => p.then(f), Promise.resolve()).then(() => { syncing = false; }, () => { syncing = false; });
  }

  /* The signup screen. It stands in for every screen but Help until she signs up. When Qura can't be reached, "Continue for
     now" lets her through for this visit and Home keeps a reminder. Steps: number (and birth year if Sakhi never asked it),
     the SMS code, then optional details. */
  const suErr = (e) => { const su = mem.su; if (!su) return; const c = (e && e.code) || ''; su.offline = c === 'offline' || /^http_5/.test(c); su.err = su.offline ? 'su_net' : ({ phone_bad: 'su_phone_bad', code_wrong: 'su_wrong', code_expired: 'su_expired', challenge_bad: 'su_expired', too_many: 'su_locked' }[c] || 'su_net'); };
  const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const resendLeft = () => Math.max(0, Math.ceil((((mem.su && mem.su.resendAt) || 0) - Date.now()) / 1000));
  function aboutFields(a, p) {
    return '<label for="' + p + '-name">' + esc(t('su_name_l')) + '</label><input id="' + p + '-name" autocomplete="given-name" maxlength="40" value="' + esc(a.name || '') + '">' +
      '<label for="' + p + '-pin">' + esc(t('su_pin_l')) + '</label><input id="' + p + '-pin" class="num" inputmode="numeric" autocomplete="postal-code" maxlength="6" value="' + esc(a.pin || '') + '"><p class="small">' + esc(t('su_pin_d')) + '</p>' +
      '<h2 class="ob-h2">' + esc(t('su_heard_l')) + '</h2><div class="chips" role="group" aria-label="' + esc(t('su_heard_l')) + '">' + HEARD.map((k) => '<button type="button" class="chip' + (a.heard === k ? ' on' : '') + '" data-heard="' + k + '" aria-pressed="' + (a.heard === k) + '">' + esc(t('su_h_' + k)) + '</button>').join('') + '</div>' +
      '<h2 class="ob-h2">' + esc(t('su_upd_h')) + '</h2><div class="list"><label class="item"><span class="body"><strong>' + esc(t('su_upd_sms')) + '</strong></span><input type="checkbox" id="' + p + '-sms"' + (a.sms ? ' checked' : '') + '></label><label class="item"><span class="body"><strong>' + esc(t('su_upd_wa')) + '</strong></span><input type="checkbox" id="' + p + '-wa"' + (a.wa ? ' checked' : '') + '></label></div><p class="small">' + esc(t('su_upd_d')) + '</p>';
  }
  function wireAbout(root, a, p) {
    $('#' + p + '-name', root).addEventListener('input', (e) => { a.name = e.target.value; });
    $('#' + p + '-pin', root).addEventListener('input', (e) => { a.pin = e.target.value.replace(/\D/g, '').slice(0, 6); if (e.target.value !== a.pin) e.target.value = a.pin; });
    root.querySelectorAll('[data-heard]').forEach((b) => b.addEventListener('click', () => { a.heard = a.heard === b.dataset.heard ? '' : b.dataset.heard; root.querySelectorAll('[data-heard]').forEach((x) => { const on = x.dataset.heard === a.heard; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); }));
    $('#' + p + '-sms', root).addEventListener('change', (e) => { a.sms = e.target.checked; });
    $('#' + p + '-wa', root).addEventListener('change', (e) => { a.wa = e.target.checked; });
  }
  function renderSignup(v) {
    const su = mem.su || (mem.su = { step: 'phone', num: '' });
    const err = su.err ? '<div class="flag" role="alert">' + esc(t(su.err)) + '</div>' : '';
    const later = su.offline ? '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('su_later_p')) + '</p><button type="button" class="btn block" id="su-later">' + esc(t('su_later')) + '</button></div>' : '';
    const av = api.art ? '<div class="ob-av">' + api.art.sakhi({ pose: 'hi', look: state.settings.look }) + '</div>' : '';
    if (su.step === 'code') {
      const left = resendLeft();
      v.innerHTML = '<div class="stack ob su" style="gap:12px"><div class="ob-top"><button type="button" class="iconbtn" id="su-back" aria-label="' + esc(t('back')) + '">' + I.back + '</button></div><h1>' + esc(t('su_code_h')) + '</h1><p>' + esc(tf(su.channel === 'whatsapp' ? 'su_code_wa' : (su.channel === 'sms' ? 'su_code_sms' : 'su_code_p'), { p: showPhone(su.phone) })) + '</p>' +
        '<label for="su-code">' + esc(t('su_code_l')) + '</label><input id="su-code" class="su-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" value="' + esc(su.code || '') + '">' + err +
        '<button type="button" class="btn primary block" id="su-verify"' + (su.busy ? ' disabled' : '') + '>' + esc(t('su_verify')) + '</button>' + later +
        '<div class="row spread"><button type="button" class="linkbtn" id="su-change">' + esc(t('su_change')) + '</button><button type="button" class="linkbtn" id="su-resend"' + (left || su.busy ? ' disabled' : '') + '>' + esc(left ? tf('su_resend_in', { n: clock(left) }) : t('su_resend')) + '</button></div>' +
        /* WhatsApp can't tell at once that a number isn't on WhatsApp, so SMS is always one tap away */
        (su.channel === 'whatsapp' ? '<button type="button" class="linkbtn" id="su-by-sms"' + (su.busy ? ' disabled' : '') + '>' + esc(t('su_sms_instead')) + '</button>' : '') +
        (CFG.api ? '' : '<div class="flag">' + esc(t('su_demo')) + '</div>') + '</div>';
      const ci = $('#su-code', v);
      ci.addEventListener('input', () => { su.code = ci.value.replace(/\D/g, '').slice(0, 6); if (ci.value !== su.code) ci.value = su.code; if (su.code.length === 6) suVerify(); });
      ci.addEventListener('keydown', (e) => { if (e.key === 'Enter') suVerify(); });
      $('#su-verify', v).addEventListener('click', suVerify);
      const toPhone = () => { su.step = 'phone'; su.err = null; su.offline = false; render(); };
      $('#su-back', v).addEventListener('click', toPhone); $('#su-change', v).addEventListener('click', toPhone);
      $('#su-resend', v).addEventListener('click', () => suStart(true));
      const bs = $('#su-by-sms', v); if (bs) bs.addEventListener('click', () => suStart(true, 'sms'));
      const lt = $('#su-later', v); if (lt) lt.addEventListener('click', suLater);
      clearInterval(mem.suTick);
      mem.suTick = setInterval(() => { const b = document.getElementById('su-resend'); if (!b || !mem.su || mem.su.step !== 'code') { clearInterval(mem.suTick); return; } const l = resendLeft(); b.disabled = !!l || !!mem.su.busy; b.textContent = l ? tf('su_resend_in', { n: clock(l) }) : t('su_resend'); if (!l) clearInterval(mem.suTick); }, 1000);
      if (!su.busy) safe(() => ci.focus());
      return;
    }
    if (su.step === 'about') {
      const a = su.about || (su.about = {});
      v.innerHTML = '<div class="stack ob su" style="gap:12px">' + av + '<h1>' + esc(t('su_about_h')) + '</h1><p>' + esc(t('su_about_p')) + '</p>' + aboutFields(a, 'su') + err +
        '<button type="button" class="btn primary block" id="su-done">' + esc(t('continue')) + '</button><button type="button" class="btn ghost block" id="su-skip">' + esc(t('su_skip')) + '</button></div>';
      wireAbout(v, a, 'su');
      $('#su-done', v).addEventListener('click', () => { if (!pinCodeOk(a.pin)) { su.err = 'su_pin_bad'; render(); return; } saveProfile(profileOf(a), (ok) => { if (!ok) toast(t('acc_pending')); }); suFinish(); });
      $('#su-skip', v).addEventListener('click', suFinish);
      return;
    }
    const y18 = today().getFullYear() - 18;
    const yearHtml = state.dob ? '' : '<label for="su-year">' + esc(t('su_year_l')) + '</label><select id="su-year"><option value="">' + esc(t('su_choose')) + '</option><option value="u18"' + (su.year === 'u18' ? ' selected' : '') + '>' + esc(t('su_year_u18')) + '</option>' + Array.from({ length: 63 }, (x, i) => y18 - i).map((y) => '<option value="' + y + '"' + (String(su.year) === String(y) ? ' selected' : '') + '>' + y + '</option>').join('') + '</select>' +
      (String(su.year) === String(y18) ? '<label for="su-month">' + esc(t('ob_month_h')) + '</label><select id="su-month"><option value="">' + esc(t('su_choose')) + '</option>' + t('months').map((mn, i) => '<option value="' + (i + 1) + '"' + (String(su.month) === String(i + 1) ? ' selected' : '') + '>' + esc(mn) + '</option>').join('') + '</select>' : '');
    v.innerHTML = '<div class="stack ob su" style="gap:12px">' + av + '<h1>' + esc(t('su_phone_h')) + '</h1><p>' + esc(t('su_phone_p')) + '</p>' + yearHtml +
      '<label for="su-num">' + esc(t('su_phone_l')) + '</label><div class="su-num"><span class="su-cc" aria-hidden="true">+91</span><input id="su-num" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="16" value="' + esc(su.num || '') + '"></div>' + err +
      '<button type="button" class="btn primary block" id="su-send"' + (su.busy ? ' disabled' : '') + '>' + esc(t('su_send')) + '</button>' + later +
      '<p class="small">' + esc(t('su_agree')) + ' <button type="button" class="linkbtn" id="su-notice">' + esc(t('ob_notice_link')) + '</button></p></div>';
    const ni = $('#su-num', v); ni.addEventListener('input', () => { su.num = ni.value; }); ni.addEventListener('keydown', (e) => { if (e.key === 'Enter') suStart(false); });
    const ys = $('#su-year', v); if (ys) ys.addEventListener('change', () => { su.year = ys.value; su.month = null; su.err = null; render(); });
    const ms = $('#su-month', v); if (ms) ms.addEventListener('change', () => { su.month = ms.value; });
    $('#su-send', v).addEventListener('click', () => suStart(false));
    $('#su-notice', v).addEventListener('click', openNotice);
    const lt = $('#su-later', v); if (lt) lt.addEventListener('click', suLater);
  }
  function suStart(resend, channel) {
    const su = mem.su; if (!su || su.busy) return; su.err = null; su.offline = false;
    if (!resend) {
      if (!state.dob) {
        /* The birth year, when Sakhi never asked it (an older diary, a restored backup): same rule as the first run. */
        const nowY = today().getFullYear(); const y = parseInt(su.year, 10); const m = parseInt(su.month, 10);
        if (su.year === 'u18' || (y === nowY - 18 && m > today().getMonth() + 1)) { clearInterval(mem.suTick); mem.su = null; mem.under18 = true; render(); return; }
        if (!y || (y === nowY - 18 && !m)) { su.err = 'su_year_bad'; render(); return; }
        su.dob = toISO(new Date(y, (m || 7) - 1, 1));
      }
      const p = normPhone(su.num); if (!p) { su.err = 'su_phone_bad'; render(); return; }
      su.phone = p;
    }
    su.busy = true; render();
    net('POST', 'otp/start', { phone: su.phone, channel: channel || undefined, lang: state.lang, app: CFG.app, platform: CFG.platform }).then((j) => {
      if (mem.su !== su) return; Object.assign(su, { busy: false, step: 'code', channel: j.channel === 'whatsapp' || j.channel === 'sms' ? j.channel : null, challenge: j.challenge, resendAt: Date.now() + (+j.resend_after || 30) * 1000, code: '' }); render();
    }, (e) => { if (mem.su !== su) return; su.busy = false; suErr(e); render(); });
  }
  function suVerify() {
    const su = mem.su; if (!su || su.busy) return; su.err = null; su.offline = false;
    if (!/^\d{6}$/.test(su.code || '')) { su.err = 'su_wrong'; render(); return; }
    const dob = state.dob || su.dob; su.busy = true; render();
    net('POST', 'otp/verify', { challenge: su.challenge, code: su.code, birth_year: dob ? +String(dob).slice(0, 4) : null, notice: NOTICE_V, lang: state.lang, app: CFG.app, platform: CFG.platform }).then((j) => {
      if (mem.su !== su) return;
      if (!j || !j.token) throw netErr('bad_reply');
      if (su.dob && !state.dob) { state.dob = su.dob; save(); }
      acct = { token: String(j.token), since: toISO(today()) }; takeAcct(j.account); if (!acct.phone) acct.phone = su.phone; saveAcct();
      su.busy = false; su.code = '';
      if (j.is_new === false) { suFinish(); return; }   /* back on a new phone: her details are already with Qura */
      su.step = 'about'; su.about = { name: acct.name || '', pin: acct.pincode || '', heard: acct.heard || '', sms: !!acct.upd_sms, wa: !!acct.upd_wa }; render(); acctSync();
    }).catch((e) => { if (mem.su !== su) return; su.busy = false; su.code = ''; suErr(e); render(); });
  }
  function suFinish() { clearInterval(mem.suTick); mem.su = null; mem.suLater = false; toast(t('su_ok')); render(); acctSync(); }
  function suLater() { clearInterval(mem.suTick); mem.su = null; mem.suLater = true; render(); }

  /* Home and the readers' page keep a reminder while she has gone on without signing up; Me and the readers' page link to
     the account page: her details as Qura keeps them, edit, log out, delete. */
  const acctCard = () => (needsSignup() && mem.suLater ? '<div class="card soft"><h3>' + esc(t('acc_card_h')) + '</h3><p class="small">' + esc(t('acc_card_p')) + '</p><button type="button" class="btn primary sm" style="align-self:flex-start" data-su-go>' + esc(t('acc_signup')) + '</button></div>' : '');
  const acctItem = () => (mem.teen || state.sample ? '' : '<div class="list"><button type="button" class="item" data-go="account"><span class="ico-sm hue hue-teal">' + I.person + '</span><span class="body"><strong>' + esc(t('acc_h')) + '</strong><span>' + esc(signedIn() ? maskPhone(acct.phone) : t('acc_card_h')) + '</span></span><span class="chev">' + I.chev + '</span></button></div>');
  function renderAccount(v) {
    const head = backRow(t('acc_h'), state.stage === 'app' ? 'me' : 'home', false);
    if (!signedIn()) { v.innerHTML = head + '<div class="card soft"><p>' + esc(t('acc_none')) + '</p><button type="button" class="btn primary" style="align-self:flex-start" data-su-go>' + esc(t('acc_signup')) + '</button></div>'; wire(v); return; }
    const row = (k, val) => '<div class="item quiet"><span class="body"><strong>' + esc(t(k)) + '</strong><span>' + esc(val || '—') + '</span></span></div>';
    const upd = t('acc_sms') + ': ' + t(acct.upd_sms ? 'acc_on' : 'acc_off') + ' · WhatsApp: ' + t(acct.upd_wa ? 'acc_on' : 'acc_off');
    v.innerHTML = head + '<p class="small">' + esc(t('acc_keeps')) + '</p><div class="list" id="acc-list">' + row('acc_num', maskPhone(acct.phone)) + row('acc_name', acct.name) + row('acc_pin', acct.pincode) + row('acc_heard', acct.heard ? t('su_h_' + acct.heard) : '') + row('acc_upd', upd) + '</div>' +
      (acct.pending ? '<p class="small">' + esc(t('acc_pending')) + '</p>' : '') +
      '<div class="grid2"><button type="button" class="btn" id="acc-edit">' + esc(t('acc_edit')) + '</button><button type="button" class="btn" id="acc-out">' + esc(t('acc_logout')) + '</button></div><button type="button" class="btn danger block" id="acc-del">' + esc(t('acc_del')) + '</button><div id="acc-box"></div>';
    wire(v);
    $('#acc-edit', v).addEventListener('click', openAcctEdit);
    $('#acc-out', v).addEventListener('click', () => { net('POST', 'session/logout', {}).catch(() => { }); acct = {}; saveAcct(); toast(t('acc_out_done')); render(); });
    $('#acc-del', v).addEventListener('click', () => {
      const box = $('#acc-box', v);
      box.innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('acc_del_sure')) + '</p><div id="acc-del-err"></div><div class="grid2"><button type="button" class="btn" id="acc-del-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="acc-del-yes">' + esc(t('acc_del_yes')) + '</button></div></div>';
      $('#acc-del-no', box).addEventListener('click', () => { box.innerHTML = ''; });
      const yes = $('#acc-del-yes', box);
      yes.addEventListener('click', () => {
        yes.disabled = true; const gone = () => { acct = {}; saveAcct(); toast(t('acc_del_done')); render(); };
        net('DELETE', 'me', {}).then(gone, (e) => { if (/^http_40[14]$/.test(e.code || '')) { gone(); return; } yes.disabled = false; $('#acc-del-err', box).innerHTML = '<div class="flag" role="alert">' + esc(t('su_net')) + '</div>'; });
      });
      box.scrollIntoView({ block: 'nearest' });
    });
  }
  function openAcctEdit() {
    const a = { name: acct.name || '', pin: acct.pincode || '', heard: acct.heard || '', sms: !!acct.upd_sms, wa: !!acct.upd_wa };
    sheet('<h2>' + esc(t('acc_edit')) + '</h2><div class="stack" style="gap:10px">' + aboutFields(a, 'ae') + '</div><div id="ae-err"></div><div class="sheet-foot"><div class="grid2"><button type="button" class="btn" id="ae-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="ae-go">' + esc(t('save')) + '</button></div></div>', (sh) => {
      wireAbout(sh, a, 'ae');
      $('#ae-no', sh).addEventListener('click', () => closeSheet(true));
      $('#ae-go', sh).addEventListener('click', () => {
        if (!pinCodeOk(a.pin)) { $('#ae-err', sh).innerHTML = '<div class="flag" role="alert">' + esc(t('su_pin_bad')) + '</div>'; return; }
        closeSheet(true); saveProfile(profileOf(a), (ok) => { toast(t(ok ? 'acc_saved' : 'acc_pending')); render(); });
      });
    });
  }

  /* ---------- home ---------- */
  function miniBars(gaps, hiBand) {
    if (!gaps.length) return ''; const mx = Math.max(60, Math.max.apply(null, gaps)); const h = 56; const bandTop = h - (hiBand / mx) * h, bandH = ((hiBand - 21) / mx) * h;
    return '<div class="bars" role="img" aria-label="' + esc(tf('bars_aria', { list: gaps.join(', ') })) + '" style="height:' + h + 'px"><div class="band" style="top:' + bandTop.toFixed(0) + 'px;height:' + bandH.toFixed(0) + 'px"></div><div class="cols">' + gaps.map((g, i) => '<div class="col ' + (i === gaps.length - 1 ? 'last' : '') + '" style="height:' + ((g / mx) * h).toFixed(0) + 'px"></div>').join('') + '</div></div><div class="barlabels">' + gaps.map((g) => '<span class="num">' + g + '</span>').join('') + '</div>';
  }
  const chevSm = () => I.chev.replace('<svg', '<svg style="width:14px;height:14px"');
  const heroBtn = (go, label) => '<button type="button" class="btn sm" data-go="' + go + '">' + esc(label) + ' ' + chevSm() + '</button>';
  const pregWeeks = () => { const p = pregInfo(); return p ? p.weeks : null; };
  /* A ring for the cycle, or for the first 6 weeks after a birth. Position = days since the start, day 1 at the top. */
  function ringSvg(max, parts, now, ticks) {
    const R = 58; const f = (n) => n.toFixed(2); const ang = (d) => ((-90 + (360 * d) / max) * Math.PI) / 180; const pt = (d, r) => [70 + (r || R) * Math.cos(ang(d)), 70 + (r || R) * Math.sin(ang(d))];
    const arc = (a, b, cls, r) => { const rr = r || R; if (b - a >= max - 0.001) return '<circle class="' + cls + '" cx="70" cy="70" r="' + rr + '"/>'; const p = pt(a, rr), q = pt(b, rr); return '<path class="' + cls + '" d="M' + f(p[0]) + ' ' + f(p[1]) + 'A' + rr + ' ' + rr + ' 0 ' + ((b - a) / max > 0.5 ? 1 : 0) + ' 1 ' + f(q[0]) + ' ' + f(q[1]) + '"/>'; };
    let s = '<circle class="trk" cx="70" cy="70" r="58"/>';
    parts.forEach((x) => { const a = Math.max(0, x.from), b = Math.min(max, x.to); if (b > a) s += arc(a, b, x.cls, x.r); });
    (ticks || []).forEach((d) => { const p = pt(d, 51), q = pt(d, 65); s += '<line class="tick" x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(q[0]) + '" y2="' + f(q[1]) + '"/>'; });
    if (now != null) { const p = pt(Math.min(max - 0.5, now)); s += '<circle class="now" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="8"/>'; }
    return '<svg class="ring" viewBox="0 0 140 140" aria-hidden="true">' + s + '</svg>';
  }
  const ringBox = (svg, num, label, aria) => '<div class="ringwrap" role="img" aria-label="' + esc(aria) + '">' + svg + '<div class="ringc"><b class="num">' + num + '</b><span>' + esc(label) + '</span></div></div>';
  const keyDot = (color, label) => '<span><i style="background:' + color + '"></i>' + esc(label) + '</span>';
  /* Module cards for Home: only the one or two that fit her stage. */
  function moduleCards() {
    const s0 = state.situation; const age = ageYears(); let pri;
    if (isPregnant()) pri = ['preg', 'pregtools'];
    else if (s0.deliveredOn && diffDays(fromISO(s0.deliveredOn), today()) <= 365) pri = ['post'];
    else if (s0.planning) pri = ['ttc'];
    else if (s0.stopped || (age != null && age >= 45)) pri = ['meno'];
    else pri = ['contra', 'periods'];
    pri = ['explain'].concat(pri, ['access']); const out = [];
    for (let i = 0; i < pri.length && out.length < 2; i++) { const h = HOOKS.home.find((x) => x.mod === pri[i]); if (!h) continue; const html = safe(() => h.fn(api), ''); if (html) out.push(html); }
    return out;
  }
  function renderHome(v) {
    const cd = cycleDay(); const ls = lastStart(); const ri = rangeInfo(); const g = usable(); const last6 = g.slice(-6); const bd = bleedingDays(); const tStr = toISO(today()); const inPeriod = bd[tStr] && bd[tStr] !== 'spot';
    const disc = !!state.settings.discreet; const hide = disc && !mem.shownNumbers; const blur = hide ? ' blur' : '';
    const sit0 = state.situation; const birthD = sit0.deliveredOn ? diffDays(fromISO(sit0.deliveredOn), today()) : null;
    const afterBirth = !isPregnant() && birthD != null && birthD >= 0 && birthD <= 365 && !(ls && ls > fromISO(sit0.deliveredOn));
    const cyclesOff = !isPregnant() && !afterBirth && (sit0.hysterectomy || sit0.stopped);
    let main = ''; let showLog = true; const A = api.art;
    const twoCol = (left, right) => '<div class="hero-row">' + left + right + '</div>';
    if (isPregnant()) {
      showLog = false; const pi = pregInfo(); const w = pi ? pi.weeks : null;
      const sz = w != null && api.pregSize ? safe(() => api.pregSize(w), null) : null; const pct = w != null ? clamp((w / 40) * 100, 1, 99) : 0;
      main = twoCol('<div class="hero-main"><div class="eyebrow">' + esc(disc ? t('today_h') : t('pregnant')) + '</div>' +
        (w != null ? '<div class="big num' + blur + '" id="bignum">' + w + '</div><p class="lead">' + esc(disc ? t('d_weeks') : t('weeks_preg')) + '</p>' + (pi && !hide ? '<p class="small">' + esc(tf('due_on', { d: fmtD(fromISO(pi.edd), { day: 'numeric', month: 'short', year: 'numeric' }) })) + '</p>' : '') : '<p class="lead">' + esc(t('preg_set_date')) + '</p>' + (disc ? '' : '<button type="button" class="btn sm" id="preg-date">' + esc(t('preg_date_b')) + '</button>')) + '</div>',
        !disc && w != null && A ? '<div class="hero-art">' + A.produce(w, sz ? sz.c : '') + '</div>' : '') +
        (!disc && sz ? '<p class="hero-cap">' + esc(sz.line || (sz.s + ' · ' + sz.c)) + '</p>' : '') +
        (!disc && w != null ? '<div class="timeline" aria-hidden="true"><div class="seg" style="left:0;width:35%;background:var(--accent-2);opacity:0.6;border-radius:7px 0 0 7px"></div><div class="seg" style="left:35%;width:35%;background:var(--accent-2)"></div><div class="seg" style="left:70%;width:30%;background:var(--accent-strong);border-radius:0 7px 7px 0"></div><div class="mark" style="left:' + pct.toFixed(0) + '%"></div></div><div class="tl-labels" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ['pw_t1', 'pw_t2', 'pw_t3'].map((k, i) => '<span class="' + (i === (w < 14 ? 0 : (w < 28 ? 1 : 2)) ? 'on' : '') + '">' + esc(t(k)) + '</span>').join('') + '</div>' : '') +
        (disc ? '' : '<div class="row wrap">' + (ROUTES['preg-week'] ? heroBtn('preg-week', t('this_week')) : '') + heroBtn('pregnancy', t('pw_visits')) + '</div>');
    } else if (afterBirth) {
      if (disc) main = '<div class="eyebrow">' + esc(t('today_h')) + '</div><div class="big num' + blur + '" id="bignum">' + birthD + '</div>';
      else if (birthD <= 42) main = '<div class="eyebrow">' + esc(t('pp_eyebrow')) + '</div>' + twoCol(ringBox(ringSvg(42, [{ from: 0, to: Math.max(birthD, 0.5), cls: 'prog' }], null, [7, 14, 21, 28, 35]), birthD, t(birthD === 1 ? 'pp_ring_1' : 'pp_ring'), tf('pp_aria', { n: birthD })), '<div class="hero-main"><p class="lead">' + esc(tf('pp_week', { n: Math.min(6, Math.floor(birthD / 7) + 1) })) + '</p></div>') + '<p class="small">' + esc(t('pp_p')) + '</p>' + (ROUTES['post'] ? '<div class="row">' + heroBtn('post', t('pp_go')) + '</div>' : '');
      else main = twoCol('<div class="hero-main"><div class="eyebrow">' + esc(t('pp_eyebrow')) + '</div><div class="big num" id="bignum">' + birthD + '</div><p class="lead">' + esc(t(birthD === 1 ? 'pp_days_1' : 'pp_days')) + '</p></div>', A ? '<div class="hero-art">' + A.spot('post') + '</div>' : '') + '<p class="small">' + esc(t('pp_p')) + '</p>' + (ROUTES['post'] ? heroBtn('post', t('pp_go')) : '');
    } else if (cyclesOff) {
      showLog = !sit0.hysterectomy;
      main = twoCol('<div class="hero-main"><div class="eyebrow">' + esc(disc ? t('today_h') : t('off_eyebrow')) + '</div>' + (disc ? '' : '<p class="lead">' + esc(sit0.hysterectomy ? t('off_p_hyst') : t('off_p_stopped')) + '</p>' + (ROUTES['meno'] ? heroBtn('meno', t('off_go')) : '')) + '</div>', !disc && A ? '<div class="hero-art">' + A.spot('meno') + '</div>' : '');
    } else if (!ls && (state.goals || []).indexOf('learn') >= 0 && !disc) {
      main = twoCol('<div class="hero-main"><p class="lead"><strong>' + esc(t('learn_hero_h')) + '</strong></p><p class="small">' + esc(t('learn_p')) + '</p><div class="row wrap">' + (ROUTES['joy-quiz'] ? '<button type="button" class="btn sm primary" data-go="joy-quiz">' + esc(t('learn_card')) + '</button>' : '') + '<button type="button" class="btn sm" id="log-last">' + esc(t('learn_log')) + '</button></div></div>', A ? '<div class="hero-art">' + A.sakhi({ pose: 'hi', look: state.settings.look, label: t('sakhi_alt') }) + '</div>' : '');
    } else if (!ls) {
      main = twoCol('<div class="hero-main"><div class="eyebrow">' + esc(disc ? t('today_h') : t('cycle_day')) + '</div><p class="lead">' + esc(disc ? t('d_first') : t('first_log')) + '</p><button type="button" class="btn sm" id="log-last">' + esc(disc ? t('d_log_last') : t('log_last')) + '</button></div>', !disc && A ? '<div class="hero-art">' + A.sakhi({ pose: 'hi', look: state.settings.look, label: t('sakhi_alt') }) + '</div>' : '');
    } else {
      const daysSince = diffDays(ls, today()); const num = inPeriod ? daysSince + 1 : cd;
      if (hide) main = '<div class="eyebrow">' + esc(t('d_day')) + '</div><div class="big num blur" id="bignum">' + num + '</div><p class="small">' + esc(t('d_hidden')) + '</p>';
      else {
        const hiB = bandHi(); let nb = 0; while (nb < 20) { const k = bd[toISO(addDays(ls, nb))]; if (k === 'start' || k === 'bleed') nb++; else break; }
        const M = Math.min(Math.max(hiB + 3, daysSince + 3, ri ? ri.hi + 3 : 0, 30), Math.max(120, daysSince + 3));
        const parts = [{ from: 21, to: hiB + 1, cls: 'usual' }, { from: 0, to: nb, cls: 'bl' }]; if (ri) parts.push({ from: ri.lo, to: ri.hi + 1, cls: 'lik', r: 67 });
        let side = '';
        if (ri && today() > ri.to) side += '<p class="lead">' + esc(tf('past_range', { n: diffDays(ri.to, today()) })) + '</p>';
        else if (ri) side += '<p class="lead">' + esc(t('next_likely')) + ' <span class="hl">' + esc(fmtRange(ri.from, ri.to)) + '</span></p>';
        else if (last6.length) side += '<p class="lead">' + esc(t('last_gaps')) + ' <span class="hl num">' + last6.slice(-3).join(', ') + ' ' + esc(t('days')) + '</span></p>';
        side += '<div class="ring-key">' + keyDot('var(--bleed)', t('ring_period')) + keyDot('var(--peach)', tf('ring_usual', { a: 21, b: hiB })) + (ri ? keyDot('var(--accent-2)', t('ring_likely')) : '') + '<button type="button" class="tour-q" data-tour-q="ring" aria-label="' + esc(t('tour_q')) + '">?</button></div>';
        const rb = ringBox(ringSvg(M, parts, daysSince + 0.5), num, inPeriod ? t('period_day') : t('cycle_day'), tf('ring_aria', { n: num, a: 21, b: hiB }));
        main = twoCol(disc ? rb.replace('<div class="ringwrap"', '<div class="ringwrap" id="bignum"') : rb, '<div class="hero-main">' + side + '</div>');
        main += '<p class="small">' + (!ri && last6.length >= 2 ? esc(t('gap_mode_note')) + ' ' : '') + esc(t('no_contra')) + '</p>';
        if (approxStarts()[toISO(ls)]) main += '<p class="small approx-note">' + esc(t('approx_note')) + '</p>';
        if (ROUTES['explain']) { /* the explanation card on Home covers late and missing periods */ } else if (!countsOff() && !sit0.stopped && daysSince >= 90) main += '<div class="card dark" style="gap:4px"><h3>' + esc(t('r6_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(t('r6_p')) + '</p></div>';
        else if (ri && today() > addDays(ri.to, 7)) main += '<div class="card soft" style="gap:4px"><h3>' + esc(t('late_h')) + '</h3><p class="small">' + esc(t('late_p')) + '</p></div>';
      }
    }
    const mk = monthKey(today()); const ciDone = !!state.checkins[mk]; const items = [];
    /* the monthly check-in is one of the round buttons now (with a dot until it is done) */
    const cu = comingUp(disc); if (cu) items.push(cu);
    const pi0 = isPregnant() && !disc ? pregInfo() : null; const snz = (state.prompts || {}).baby;
    const bbCard = pi0 && pi0.edd && today() >= addDays(fromISO(pi0.edd), 7) && !(snz && fromISO(snz) > today()) ? ('<div class="card soft bb-card"><h3>' + esc(t('bb_h')) + '</h3><p class="small">' + esc(t('bb_p')) + '</p><div class="grid2"><button type="button" class="btn sm primary" id="bb-add">' + esc(t('bb_add')) + '</button><button type="button" class="btn sm" id="bb-not">' + esc(t('bb_not')) + '</button></div><button type="button" class="linkbtn" id="bb-end">' + esc(t('bb_end')) + '</button></div>') : '';
    /* An urgent card (a module card marked data-xp-urgent) sits right under the hero, above the round buttons. Discreet mode hides
       module cards, but more than 42 weeks by her dates still gets a plain-words line. */
    const urgentTop = [];
    if (!disc) moduleCards().forEach((h) => { if (h.indexOf('data-xp-urgent') >= 0) urgentTop.push(h); else items.push(h); });
    else { const pd = isPregnant() ? pregInfo() : null; if (pd && pd.days > 294) urgentTop.push('<div class="flag urgent pg-late" data-xp-urgent="1">' + esc(t('late_preg_d')) + '</div>'); }
    const hu = headsUpCard(disc);   /* right under the round buttons */
    const stageLink = disc ? '' : '<div class="hero-foot"><button type="button" class="linkbtn" id="stage-btn">' + esc(t('stage_change')) + '</button></div>';
    v.innerHTML = weekStrip(disc) + '<div class="card hero" style="gap:10px">' + main + stageLink + '</div>' + urgentTop.join('') + acctCard() + bbCard + actionsHtml(showLog, disc, inPeriod) + hu + runHook('homeTop', [api], true) + askHtml(disc) + items.slice(0, 3).join('') +
      quraCard() +
      (state.sample ? '<p class="footnote">' + esc(t('sample_note')) + '</p>' : '');
    wire(v); v.querySelectorAll('[data-log]').forEach((b) => b.addEventListener('click', () => quickLog(b.dataset.log)));
    wireOneTap(v);
    const hg = $('#hu-got', v); if (hg) hg.addEventListener('click', () => { const ri = rangeInfo(); state.prompts = state.prompts || {}; if (ri) state.prompts.heads = toISO(ri.from); save(); render(); });
    const sbtn = $('#stage-btn', v); if (sbtn) sbtn.addEventListener('click', openStage);
    const ll = $('#log-last', v); if (ll) ll.addEventListener('click', () => openLog('start', toISO(today()), null));
    const bn = $('#bignum', v); if (bn && disc) bn.addEventListener('click', () => { mem.shownNumbers = !mem.shownNumbers; render(); });
    const bba = $('#bb-add', v); if (bba) bba.addEventListener('click', () => openStage('post'));
    const pdb = $('#preg-date', v); if (pdb) pdb.addEventListener('click', () => openStage('preg'));
    const bbn = $('#bb-not', v); if (bbn) bbn.addEventListener('click', () => { state.prompts = state.prompts || {}; state.prompts.baby = toISO(addDays(today(), 7)); save(); render(); });
    const bbe = $('#bb-end', v); if (bbe) bbe.addEventListener('click', () => { endPregnancy(); state.prompts = state.prompts || {}; delete state.prompts.baby; saveQuietly(); setHash(ROUTES['loss'] ? 'loss' : 'help'); });
    runHook('afterHome', [v, api]);
  }
  /* A heads-up 1 to 3 days before her likely window (only when her cycles are regular enough to have one): what repeated last
     time and what to keep ready. Not while she is trying for a baby, where "your period may come" can sting. "Got it" hides it for
     this cycle. Plain words in discreet mode. */
  function headsUpCard(disc) {
    if (['cycle', 'meno'].indexOf(stageNow()) < 0 || countsOff() || state.situation.stopped || state.situation.hysterectomy) return '';
    const ri = headsRange(); if (!ri) return ''; const n = diffDays(today(), ri.from); if (n < 1 || n > 3) return '';
    if ((state.prompts || {}).heads === toISO(ri.from)) return '';
    const pats = disc ? [] : (patterns() || { list: [] }).list.filter((x) => x.r >= -4 && x.r <= 1).slice(0, 2);
    const rp = pats.find((x) => x.key === 'd_cramps') || pats.find((x) => api.relief && api.relief.forSym(x.key)); const rel = rp && api.relief ? api.relief.forSym(rp.key) : null;
    return '<div class="card soft hu-card"><h3>' + esc(disc ? t('hu_h_d') : (n === 1 ? t('hu_h1') : tf('hu_h', { n: n }))) + '</h3>' +
      (disc ? '' : '<p class="small">' + esc(tf('hu_likely', { r: fmtRange(ri.from, ri.to) })) + '</p>') +
      (pats.length ? '<p class="small">' + esc(t('hu_pat_h')) + '</p><ul class="hu-pats">' + pats.map((x) => '<li><b>' + esc(t(x.key)) + '</b>: ' + esc(patWhen(x.r)) + '</li>').join('') + '</ul>' : '') +
      '<p class="small">' + esc(t(disc ? 'hu_ready_d' : 'hu_ready')) + '</p>' +
      '<div class="row wrap">' + (rel ? '<button type="button" class="btn sm" data-go="relief-' + rel + '">' + esc(t('hu_rel')) + '</button>' : '') + '<button type="button" class="btn sm" id="hu-got">' + esc(t('hu_got')) + '</button></div></div>';
  }
  /* The Qura card fits her stage. None in pregnancy, or in the year after a birth while she breastfeeds or is in the first six weeks,
     until the doctor-signed kit rule exists. Wording stays on a conversation with a doctor, never a product. */
  function quraCard() {
    if (state.settings.discreet) return '';   /* its headings name her stage ("Irregular periods or PMOS?") */
    const k = stageNow(); const sit = state.situation;
    if (k === 'browse' || k === 'preg' || (k === 'post' && (sit.breastfeeding || earlyPost()))) return '';
    const key = k === 'ttc' ? 'qura_ttc' : (k === 'meno' ? 'qura_meno' : (sit.pcos || (state.goals || []).indexOf('pmos') >= 0 ? 'qura_pmos' : 'qura'));
    return '<div class="card dark qura-card" data-qura="' + key + '"><h2>' + esc(t(key + '_h')) + '</h2><p class="small" style="color:var(--dark-text)">' + esc(t(key + '_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-go="ask">' + esc(t('qura_b')) + '</button></div>';
  }
  const saveQuietly = () => save();
  /* One tap logs today; the toast offers Undo and Add details. */
  function quickLog(type) {
    const d = toISO(today()); const ex = state.events.find((e) => e.d === d && e.t === type);
    if (ex) { openLog(type, d, ex); return; }
    const ev = { d: d, t: type }; if (type === 'start') dropGuesses(d); state.events.push(ev); save(); render();
    toastAct(state.settings.discreet ? t('saved') : t('logged_' + type), [
      { label: t('undo'), fn: () => { state.events = state.events.filter((e) => e !== ev); save(); render(); toast(t('undone')); } },
      { label: t('add_details'), fn: () => openLog(type, d, ev) }
    ]);
    emit('log', { type: type });
  }
  function comingUp(disc) {
    const up = reminders.upcoming(3).slice(0, 2); if (!up.length) return '';
    const go = ROUTES['tools-reminders'] ? 'tools-reminders' : 'care';
    return '<div class="card"><div class="row spread"><h3>' + esc(t('coming_up')) + '</h3><a href="#' + go + '" data-go="' + go + '" class="small">' + esc(t('see_all')) + '</a></div><div class="list">' + up.map((x) => '<div class="item quiet"><span class="ico-sm">' + I.bell + '</span><span class="body"><strong>' + esc(disc ? t('d_reminder') : reminders.text(x.r)) + '</strong><span>' + esc(fmtD(x.date, { weekday: 'short', day: 'numeric', month: 'short' })) + (x.r.time ? ' · ' + esc(x.r.time) : '') + '</span></span></div>').join('') + '</div></div>';
  }


  /* ---------- one tap: quick answers, the ask box, symptom chips, SOS, the stage picker ----------
     Everything here answers in place: a tap opens a short answer as a sheet, so she never has to dig through screens. */
  /* Her stage in one word (pregnancy, the first year after a birth until periods return, 45+ or stopped, planning, periods). */
  function stageNow() {
    if (state.stage !== 'app') return 'browse';
    const s0 = state.situation; const age = ageYears(); const ls = lastStart();
    if (isPregnant()) return 'preg';
    if (s0.deliveredOn && diffDays(fromISO(s0.deliveredOn), today()) <= 365 && !(ls && ls > fromISO(s0.deliveredOn))) return 'post';
    if (isMidlife()) return 'meno';
    if (s0.planning) return 'ttc';
    return 'cycle';
  }
  /* Six common questions for each stage: [label key, article ('group.id') or '#route', picture]. */
  const QA = {
    cycle: [['late', 'cycle.missed-period-what-to-do-first', 'periods'], ['pain', 'cycle.painful-periods', 'periods'], ['disch', 'intimate.discharge-itching-odour', 'intimate'], ['heavy', 'cycle.heavy-bleeding-how-to-tell', 'periods'], ['pmos', 'pmos.what-pmos-is', 'cond'], ['irreg', 'cycle.why-cycles-become-irregular', 'periods']],
    ttc: [['ptest', 'conceive.pregnancy-test-when-and-how', 'pregtest'], ['ready', 'conceive.getting-ready-india-preconception-checklist', 'ttc'], ['fertile', 'conceive.why-no-app-can-name-your-fertile-day', 'ttc'], ['pmosbaby', 'pmos.pmos-planning-a-baby', 'cond'], ['ttcdoc', 'conceive.when-to-see-a-fertility-doctor', 'ttc'], ['partner', 'conceive.partner-health-and-semen-test', 'ttc']],
    preg: [['danger', 'pregnancy.danger-signs-call-112', 'danger'], ['checkups', 'pregnancy.four-antenatal-visits', 'preg'], ['tablets', 'pregnancy.iron-folic-acid-calcium-td', 'preg'], ['moves', 'pregnancy.babys-movements', 'preg'], ['schemes', 'pregnancy.government-support-schemes', 'tools'], ['sugarbp', 'pregnancy.sugar-test-blood-pressure-pmos', 'preg']],
    post: [['six', 'pregnancy.after-birth-first-six-weeks', 'post'], ['feed', '#post-feed', 'post'], ['ppmood', '#post-mood', 'post'], ['ppcontra', '#post-contra', 'contra'], ['heal', '#post-recovery', 'post'], ['schemes', 'pregnancy.government-support-schemes', 'tools']],
    meno: [['hot', 'midlife.hot-flushes-night-sweats', 'meno'], ['after40', 'midlife.periods-after-40', 'meno'], ['hrt', 'midlife.hormone-therapy-explained', 'meno'], ['bones', 'midlife.bones-heart-after-40', 'meno'], ['sleep', 'midlife.sleep-mood-dryness-midlife', 'meno'], ['pmb', 'midlife.bleeding-after-menopause', 'meno']],
    pmos: [['irreg', 'cycle.why-cycles-become-irregular', 'periods'], ['pmos', 'pmos.what-pmos-is', 'cond'], ['pmsigns', 'pmos.signs-to-notice', 'cond'], ['pmtests', 'pmos.tests-and-why', 'cond'], ['pmfood', 'pmos.food-for-hormones', 'cond'], ['late', 'cycle.missed-period-what-to-do-first', 'periods']],
    browse: [['first', 'cycle.first-periods-for-teens', 'teen'], ['myths', 'cycle.common-period-myths', 'periods'], ['pads', 'intimate.pads-cloth-cups-tampons', 'intimate'], ['disch', 'intimate.discharge-itching-odour', 'intimate'], ['moodcycle', 'mind_body.mood-and-the-cycle', 'mind_body'], ['lines', 'services.helplines-directory', 'services']]
  };
  /* One-tap symptoms for today, and where "What helps" goes. */
  const DAY = {
    cycle: [['d_cramps', 'cycle.painful-periods'], ['d_headache', '#periods-pms'], ['d_bloat', '#periods-pms'], ['d_mood', 'mind_body.mood-and-the-cycle'], ['d_tired', 'mind_body.thyroid-and-anaemia-tests'], ['d_sleep', 'mind_body.sleep-and-hormones']],
    preg: [['d_nausea', '#preg-symptoms'], ['d_back', '#preg-symptoms'], ['d_heartburn', '#preg-symptoms'], ['d_swell', 'pregnancy.danger-signs-call-112'], ['d_tired', '#preg-symptoms'], ['d_sleep', '#preg-symptoms']],
    post: [['d_tired', 'pregnancy.after-birth-first-six-weeks'], ['d_sleep', 'pregnancy.after-birth-first-six-weeks'], ['d_mood', '#post-mood'], ['d_breast', '#post-feed'], ['d_back', '#post-recovery']],
    meno: [['d_hotflush', 'midlife.hot-flushes-night-sweats'], ['d_sleep', 'midlife.sleep-mood-dryness-midlife'], ['d_mood', 'midlife.sleep-mood-dryness-midlife'], ['d_joint', 'midlife.bones-heart-after-40'], ['d_tired', 'mind_body.thyroid-and-anaemia-tests']]
  };
  DAY.ttc = DAY.cycle;
  const openQA = (target) => { if (!target) return; if (target.charAt(0) === '#') { const r = target.slice(1); if (ROUTES[r] || modRoute(r)) setHash(r); return; } openAnswer(target); };
  const spotFor = (key, light) => (api.art ? (key === 'danger' ? api.art.spot('help', { hue: 'rose', icon: 'help', blob: light ? 'var(--card)' : null }) : api.art.spot(key, light ? { blob: 'var(--card)' } : null)) : '');
  /* ---------- Home: a week strip, round one-tap actions, one sheet to log any day ---------- */
  /* Three days back, today, three days ahead: period days filled, spotting dotted, the likely window outlined, a dot when she logged something. */
  function weekStrip(disc) {
    if (state.stage !== 'app') return '';
    const bd = bleedingDays(); const ri = isPregnant() ? null : rangeInfo(); const td = today(); let h = '';
    for (let i = -3; i <= 3; i++) {
      const d = addDays(td, i); const s0 = toISO(d); const k = bd[s0]; const fut = i > 0;
      const likely = !disc && fut && ri && d >= ri.from && d <= ri.to;
      const cls = ['wd', i === 0 ? 'today' : '', !disc && (k === 'start' || k === 'bleed') ? 'bleed' : '', !disc && k === 'spot' ? 'spot' : '', likely ? 'likely' : '', fut ? 'fut' : ''].filter(Boolean).join(' ');
      h += '<button type="button" class="' + cls + '"' + (fut ? ' disabled' : ' data-wday="' + s0 + '"') + ' aria-label="' + esc(fmtD(d, { weekday: 'long', day: 'numeric', month: 'long' })) + '"><span class="wdn">' + esc(i === 0 ? t('today_short') : fmtD(d, { weekday: 'narrow' })) + '</span><span class="wdc num">' + d.getDate() + '</span>' + (disc || fut ? '<span class="kd"></span>' : kdots(s0) || '<span class="kd"></span>') + '</button>';
    }
    return '<div class="wkstrip">' + h + '</div>';
  }
  const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const SPOTS = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="9" r="2.2"/><circle cx="15.5" cy="7.5" r="1.6"/><circle cx="13" cy="15" r="2.4"/></svg>';
  /* The first six weeks after a birth, before any period: the bleeding is from the birth, so no period buttons. */
  const earlyPost = () => { const s0 = state.situation; if (isPregnant() || !s0.deliveredOn) return false; const n = diffDays(fromISO(s0.deliveredOn), today()); const ls = lastStart(); return n >= 0 && n <= 42 && !(ls && ls > fromISO(s0.deliveredOn)); };
  function actionsHtml(showLog, disc, inPeriod) {
    const R = (attrs, ico, label, cls, dot) => '<button type="button" class="ract' + (cls ? ' ' + cls : '') + '" ' + attrs + '><span class="rico">' + ico + (dot ? '<i class="rdot"></i>' : '') + '</span><span class="rl">' + esc(label) + '</span></button>';
    const ciDone = !!state.checkins[monthKey(today())]; const out = [];
    if (showLog && !disc && earlyPost() && ROUTES['post-recovery']) { out.push(R('data-go="post-recovery"', I.heart, t('pp_rec_b'), 'hue-plum')); if (ROUTES['post-feed']) out.push(R('data-go="post-feed"', I.clock, t('pp_feed_b'), 'hue-sky')); showLog = false; }
    const open = openPeriod();
    if (showLog) out.push(R('data-log="' + (open ? 'end' : 'start') + '"', I.drop, disc ? (open ? t('d_end') : t('d_start')) : (open ? t('period_ended') : t('period_started')), 'primary'));
    if (showLog) out.push(R('data-log="spot"', SPOTS, disc ? t('d_spot') : t('spotting'), 'hue-rose'));
    else if (isPregnant() && ROUTES['preg-week'] && !disc) out.push(R('data-go="preg-week"', I.baby, t('this_week'), 'hue-sky'));
    out.push(R('data-symlog="1"', sIco('clip'), disc ? t('sym_h_d') : t('sym_h'), 'hue-' + KINDS.pain.hue));
    out.push(R('data-go="checkin"', I.check, ciDone ? t('ci_done_b') : t('checkin_b'), 'hue-green', !ciDone));
    if (out.length < 4 && isPregnant() && ROUTES['preg-logs'] && !disc) out.push(R('data-go="preg-logs"', I.chart, t('my_logs'), 'hue-purple'));
    return '<div class="ract-row">' + out.join('') + '</div>';
  }
  /* Symptom chips with small pictures, grouped like a doctor would ask. */
  const SI = {
    bolt: '<path d="M13 3L6 13.5h5L10 21l7-10.5h-5z"/>', head: '<path d="M12 3.5a6.5 6.5 0 00-3.8 11.8V19h7.6v-3.7A6.5 6.5 0 0012 3.5z"/><path d="M10 9.5l1.2 1.8L10 13M14 9.5l-1.2 1.8L14 13"/>',
    spine: '<path d="M12 3v18M9 5.5h6M8.5 9.5h7M8.5 13.5h7M9 17.5h6"/>', bone: '<circle cx="7" cy="7" r="2.6"/><circle cx="17" cy="17" r="2.6"/><path d="M9 9l6 6"/>',
    balloon: '<ellipse cx="12" cy="10" rx="6" ry="7"/><path d="M12 17v4M10.5 21h3"/>', battery: '<rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3"/><path d="M6.5 11v3"/>',
    acne: '<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="14.6" cy="9" r=".9" fill="currentColor"/><circle cx="13.4" cy="14.6" r=".9" fill="currentColor"/>',
    nausea: '<circle cx="12" cy="12" r="8.5"/><path d="M8 15.5c1.3-1 2.7 1 4 0s2.7-1 4 0M9 10h.01M15 10h.01"/>', flame: '<path d="M12 3c2 3 5 5 5 9a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 0-5 1-7.5z"/>',
    foot: '<path d="M9 3v9c0 3 1.5 6.5 5 7h5a1.8 1.8 0 000-3.6h-3.5c-1 0-2-1-2-2.2V3"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
    calm: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 10.5c.6-.6 1.4-.6 2 0M13.5 10.5c.6-.6 1.4-.6 2 0M9.5 15c1.5 1 3.5 1 5 0"/>', happy: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M8.5 13.5c1.8 2.4 5.2 2.4 7 0"/>',
    sad: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M8.8 16c1.8-1.8 4.6-1.8 6.4 0"/>', anx: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 9l2 .8M15.5 9l-2 .8M9 15.5c1-.8 2-.8 3 0s2 .8 3 0"/>',
    angry: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 9.5l2.2 1M15.5 9.5l-2.2 1M9 16c1.8-1.2 4.2-1.2 6 0"/>', dropx: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/><path d="M12 9.5v3.5M12 15.8h.01"/>',
    pen: '<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3M5 19h14"/>', clip: '<rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 3h6v3.5H9zM8.5 11.5h7M8.5 15.5h4.5"/>'
  };
  const sIco = (k) => (SI[k] ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + SI[k] + '</svg>' : icon(k));
  /* One colour and one picture per kind of entry, used everywhere she sees it: the day sheet, calendar and week dots, the + menu, Trends.
     The period itself keeps the bleed colour; these are the other things she notes. */
  const KINDS = { pain: { hue: 'orange', ico: 'bolt', label: 'sym_pain' }, body: { hue: 'green', ico: 'battery', label: 'sym_body' }, mood: { hue: 'purple', ico: 'happy', label: 'sym_mood' }, disch: { hue: 'teal', ico: 'drop', label: 'sym_disch' }, note: { hue: 'sky', ico: 'pen', label: 'note_h' } };
  const SYM = [
    ['sym_pain', KINDS.pain.hue, [['d_cramps', 'bolt'], ['d_headache', 'head'], ['d_back', 'spine'], ['d_breast', 'heart'], ['d_joint', 'bone']]],
    ['sym_body', KINDS.body.hue, [['d_pbleed', 'dropx', 'preg'], ['d_bloat', 'balloon'], ['d_tired', 'battery'], ['d_sleep', 'moon'], ['d_acne', 'acne'], ['d_nausea', 'nausea'], ['d_heartburn', 'flame'], ['d_swell', 'foot'], ['d_hotflush', 'sun', 'mid']]],
    ['sym_mood', KINDS.mood.hue, [['d_calm', 'calm'], ['d_happy', 'happy'], ['d_mood', 'sad'], ['d_anxious', 'anx'], ['d_irritable', 'angry']]],
    ['sym_disch', KINDS.disch.hue, [['d_disch_ok', 'drop'], ['d_disch_bad', 'dropx'], ['d_itch', 'sparkle']]]
  ];
  /* The kinds she noted on a day, in the same order as the day sheet. */
  const kindsOn = (ds) => { const got = state.daily[ds] || []; const ks = SYM.filter((c) => c[2].some((x) => got.indexOf(x[0]) >= 0)).map((c) => c[0].slice(4)); if ((state.notes || {})[ds]) ks.push('note'); return ks; };
  const kdots = (ds) => { const ks = kindsOn(ds); return ks.length ? '<span class="kd" aria-hidden="true">' + ks.slice(0, 4).map((k) => '<i class="hue-' + KINDS[k].hue + '"></i>').join('') + '</span>' : ''; };
  /* Where "What helps" goes for each symptom: her stage's list first, then these. */
  const HELP = { d_acne: 'pmos.signs-to-notice', d_anxious: 'mind_body.mood-and-the-cycle', d_irritable: '#periods-pms', d_disch_ok: 'intimate.discharge-itching-odour', d_disch_bad: 'intimate.discharge-itching-odour', d_itch: 'intimate.discharge-itching-odour', d_pbleed: 'pregnancy.danger-signs-call-112', d_joint: 'midlife.bones-heart-after-40', d_hotflush: 'midlife.hot-flushes-night-sweats', d_back: 'cycle.painful-periods', d_breast: 'cycle.what-is-a-menstrual-cycle', d_nausea: 'conceive.pregnancy-test-when-and-how', d_heartburn: 'mind_body.simple-indian-plate', d_swell: 'pregnancy.danger-signs-call-112' };
  const helpFor = (k) => { const row = (DAY[stageNow()] || []).find((x) => x[0] === k); return row ? row[1] : (HELP[k] || null); };
  /* One sheet to log any day: period start, end and spotting for that day, symptoms by group, then a note.
     focus: 'sym', 'mood' or 'note' scrolls straight to that part (the + menu uses it). */
  function openDay(dateStr, focus) {
    let d = dateStr || toISO(today()); let first = true;
    const draw = () => {
      const prev = document.querySelector('#sheet-root .sheet'); const keepTop = prev ? prev.scrollTop : 0;
      const dt = fromISO(d); const isToday = d === toISO(today()); const isYday = d === toISO(addDays(today(), -1));
      const st = starts().filter((x) => x <= d); const cd = st.length && !isPregnant() ? diffDays(fromISO(st[st.length - 1]), dt) + 1 : null;
      const got = state.daily[d] || []; const has = (tp) => state.events.some((e) => e.d === d && e.t === tp);
      const midlife = (ageYears() || 0) >= 40 || state.situation.stopped || state.situation.midlife; const preg = isPregnant(); const note = (state.notes || {})[d] || '';
      const periodSec = preg ? '' : '<div class="symcat hue-rose" data-cat="period"><b>' + esc(t('day_period')) + '</b><div class="symchips">' + [['start', 'period_started', 'drop'], ['end', 'period_ended', 'check'], ['spot', 'spotting', 'dropx']].map((x) => '<button type="button" class="symchip' + (has(x[0]) ? ' on' : '') + '" data-pev="' + x[0] + '" aria-pressed="' + has(x[0]) + '"><span class="si">' + sIco(x[2]) + '</span>' + esc(t(x[1])) + '</button>').join('') + '</div>' + (has('start') ? '<button type="button" class="linkbtn" id="day-flow">' + esc(t('day_flow')) + '</button>' : '') + '</div>';
      const rel = isToday && api.relief ? api.relief.pick(got) : null;
      const relCta = rel ? '<button type="button" class="relief-cta" id="day-relief"><span class="ico-sm hue hue-' + rel.hue + '">' + I.leaf + '</span><span class="body"><strong>' + esc(rel.h) + '</strong><span>' + esc(rel.sub) + '</span></span><span class="chev">' + I.chev + '</span></button>' : '';
      const cats = SYM.map((c) => { const chips = c[2].filter((x) => !(x[2] === 'preg' && !preg) && !(x[2] === 'mid' && !midlife)); return '<div class="symcat hue-' + c[1] + '" data-cat="' + c[0].slice(4) + '"><b>' + esc(t(c[0])) + '</b><div class="symchips">' + chips.map((x) => '<button type="button" class="symchip' + (got.indexOf(x[0]) >= 0 ? ' on' : '') + '" data-sym="' + x[0] + '" aria-pressed="' + (got.indexOf(x[0]) >= 0) + '"><span class="si">' + sIco(x[1]) + '</span>' + esc(t(x[0])) + '</button>').join('') + '</div></div>' + (rel && c[2].some((x) => x[0] === rel.key) ? relCta : ''); }).join('');
      const noteSec = '<div class="symcat note hue-' + KINDS.note.hue + '" data-cat="note"><label for="day-note"><b>' + esc(t('note_h')) + '</b></label><textarea id="day-note" maxlength="600" rows="3" placeholder="' + esc(t('note_ph')) + '">' + esc(note) + '</textarea><span class="small">' + esc(t('note_p')) + '</span></div>';
      sheet('<div class="day-top"><button type="button" class="iconbtn" data-dstep="-1" aria-label="' + esc(t('prev_day')) + '"' + (addDays(dt, -1) < addDays(today(), -90) ? ' disabled' : '') + '>' + I.back + '</button><div class="day-tt"><h2 class="hand">' + esc(isToday ? t('today_short') : (isYday ? t('yesterday_l') : fmtD(dt, { weekday: 'short', day: 'numeric', month: 'short' }))) + '</h2>' + (cd ? '<span class="small">' + esc(t('cycle_day')) + ' ' + cd + '</span>' : '') + '</div><button type="button" class="iconbtn" data-dstep="1" aria-label="' + esc(t('next_day')) + '"' + (isToday ? ' disabled' : '') + ' style="transform:scaleX(-1)">' + I.back + '</button></div>' +
        periodSec + cats + noteSec + '<div class="sheet-foot"><button type="button" class="btn primary block" id="day-done">' + esc(t('sym_done')) + '</button></div>', (sh) => {
        sh.classList.add('paper');
        const dr = $('#day-relief', sh); if (dr) dr.addEventListener('click', () => { closeSheet(); setHash('relief-' + rel.id); });
        sh.querySelectorAll('[data-dstep]').forEach((b) => b.addEventListener('click', () => { const nd = addDays(fromISO(d), +b.dataset.dstep); if (nd > today() || nd < addDays(today(), -90)) return; d = toISO(nd); draw(); }));
        sh.querySelectorAll('[data-pev]').forEach((b) => b.addEventListener('click', () => {
          const tp = b.dataset.pev; const ex = state.events.filter((e) => e.d === d && e.t === tp);
          if (ex.length) state.events = state.events.filter((e) => ex.indexOf(e) < 0); else { if (tp === 'start') dropGuesses(d); state.events.push({ d: d, t: tp }); emit('log', { type: tp }); }
          save(); draw();
        }));
        sh.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.sym; const list = (state.daily[d] || []).slice(); const i = list.indexOf(k);
          if (i >= 0) list.splice(i, 1); else list.push(k);
          if (list.length) state.daily[d] = list; else delete state.daily[d];
          save(); draw();
          if (i < 0) { const target = helpFor(k); toastAct(d === toISO(today()) ? t('noted_today') : t('noted_day'), target ? [{ label: t('what_helps'), fn: () => openQA(target) }] : []); emit('log', { type: 'daily' }); }
        }));
        /* The note saves as she types (only on this phone); a new note counts once for the garden when she leaves the box. */
        const ta = $('#day-note', sh); const had = !!note;
        ta.addEventListener('input', () => { state.notes = state.notes || {}; if (ta.value.trim()) state.notes[d] = ta.value; else delete state.notes[d]; clearTimeout(openDay.tm); openDay.tm = setTimeout(save, 300); });
        ta.addEventListener('change', () => { if (!had && (state.notes || {})[d]) emit('log', { type: 'note' }); });
        const fl = $('#day-flow', sh); if (fl) fl.addEventListener('click', () => { const ev = state.events.find((e) => e.d === d && e.t === 'start'); openLog('start', d, ev || null); });
        $('#day-done', sh).addEventListener('click', () => { closeSheet(); render(); });
        $('#sheet-bg').addEventListener('click', (e) => { if (e.target.id === 'sheet-bg') render(); });
        sh.scrollTop = keepTop;
        if (first && focus) { const sec = sh.querySelector('[data-cat="' + (focus === 'sym' ? (preg ? 'body' : 'pain') : focus) + '"]'); if (sec) sh.scrollTop = Math.max(0, sec.getBoundingClientRect().top - sh.getBoundingClientRect().top + sh.scrollTop - 72); if (focus === 'note') safe(() => ta.focus({ preventScroll: true })); }
        first = false;
      });
    };
    draw(); if (focus !== 'note') tourMoment('day');
  }
  function askHtml(disc) {
    const sk = stageNow(); const pm = sk === 'cycle' && (state.situation.pcos || (state.goals || []).indexOf('pmos') >= 0);
    const list = disc ? [] : (pm ? QA.pmos : (QA[sk] || QA.cycle)).filter((x) => x[1].charAt(0) === '#' ? !!(ROUTES[x[1].slice(1)] || modRoute(x[1].slice(1))) : !!findArticle(x[1]));
    const mic = window.SakhiAndroid && window.SakhiAndroid.listen ? '<button type="button" class="mic" id="ask-mic" aria-label="' + esc(t('voice_b')) + '">' + MIC + '</button>' : '';
    return '<section class="qa-sec">' + (disc ? '' : '<h2>' + esc(t('qa_h')) + '</h2>') +
      '<div class="askbox">' + I.search.replace('<svg', '<svg class="s"') + '<input id="home-q" type="search" enterkeyhint="search" placeholder="' + esc(disc ? t('qa_ph_d') : t('qa_ph')) + '" aria-label="' + esc(t('search_all')) + '" value="' + esc(mem.homeQ || '') + '">' + mic + '</div><div id="home-res">' + askResults(mem.homeQ || '') + '</div>' +
      (list.length ? '<div class="qa-grid">' + list.map((x) => '<button type="button" class="qa-tile hue-' + (x[2] === 'danger' ? 'rose' : hueOf(x[2])) + '" data-qa="' + esc(x[1]) + '">' + spotFor(x[2], true) + '<span>' + esc(t('qa_' + x[0])) + '</span></button>').join('') + '</div>' : '') + '</section>';
  }
  const MIC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>';
  /* Answers for the ask box: guides open as a quick answer, tools open their screen. */
  function quickFind(q) {
    const terms = searchTerms(q); if (!terms.length) return { arts: [], tiles: [] };
    /* Rank by words matched, counting a match in the title twice. */
    const phrase = qWords(norm(q).trim()).join(' '); const ph = (title) => (phrase.indexOf(' ') > 0 && title.indexOf(phrase) >= 0 ? 3 : 0);
    /* Her stage breaks ties: a pregnant woman asking about movements means the baby's. */
    const near = { preg: ['pregnancy'], post: ['pregnancy'], ttc: ['conceive', 'pmos'], meno: ['midlife'], cycle: ['cycle', 'pmos', 'intimate'], browse: ['cycle'] }[stageNow()] || [];
    const arts = allArticles().map((a) => { const tt = norm(a.title_en + ' ' + a.title_hi); const n = score(norm([a.title_en, a.title_hi, a.summary_en, a.summary_hi].join(' ')), terms) + score(tt, terms) + ph(tt); return { a: a, n: n ? n + (near.indexOf(a.group) >= 0 ? 0.5 : 0) : 0 }; }).filter((r) => r.n > 0).sort((x, y) => y.n - x.n).map((r) => r.a);
    const tiles = visibleTiles().map((x) => ({ x: x, n: score(norm(bothLang(x, 'title') + ' ' + bothLang(x, 'sub') + ' ' + (x.keywords || '')), terms) })).filter((r) => r.n > 0).sort((p, r) => r.n - p.n).map((r) => r.x);
    return { arts: dangerFirst(q, arts), tiles: tiles };
  }
  function askResults(q) {
    if (!String(q || '').trim()) return '';
    const r = quickFind(q);
    if (!r.arts.length && !r.tiles.length) return '<div class="card soft"><p class="small">' + esc(t('no_tools')) + '</p><button type="button" class="btn sm" data-ask="' + esc(q) + '">' + esc(t('ask_qura')) + '</button></div>';
    return '<div class="list ask-res">' + r.arts.slice(0, 4).map((a) => '<button type="button" class="item" data-ans="' + esc(a.group + '.' + a.id) + '"><span class="ico-sm hue hue-' + hueOf(a.group) + '">' + icon(GROUP_ICONS[a.group] || 'learn') + '</span><span class="body"><strong>' + esc(L(a, 'title')) + '</strong><span>' + esc(L(a, 'summary')) + '</span></span></button>').join('') + r.tiles.slice(0, 3).map(tileHtml).join('') + '</div>';
  }
  function wireOneTap(v) {
    v.querySelectorAll('[data-qa]').forEach((b) => b.addEventListener('click', () => openQA(b.dataset.qa)));
    v.querySelectorAll('[data-wday]').forEach((b) => b.addEventListener('click', () => openDay(b.dataset.wday)));
    v.querySelectorAll('[data-symlog]').forEach((b) => b.addEventListener('click', () => openDay(toISO(today()))));
    const qi = $('#home-q', v); const res = $('#home-res', v);
    const wireRes = () => { if (!res) return; res.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => openAnswer(b.dataset.ans))); wire(res); };
    if (qi && res) { qi.addEventListener('input', () => { mem.homeQ = qi.value; res.innerHTML = askResults(qi.value); wireRes(); }); wireRes(); }
    const mic = $('#ask-mic', v);
    if (mic && qi) mic.addEventListener('click', () => {
      window.__sakhiHeard = (txt) => { if (!txt) { toast(t('voice_none')); return; } qi.value = txt; mem.homeQ = txt; res.innerHTML = askResults(txt); wireRes(); };
      safe(() => window.SakhiAndroid.listen(langMeta(state.lang).locale || 'en-IN', t('voice_prompt')));
    });
  }
  /* A short answer in a sheet: the guide's summary, when to see a doctor, listen, the full guide, related questions. */
  function relatedHtml(a) {
    const g = (CONTENT.groups || []).find((x) => x.group === a.group); const rel = g ? (g.articles || []).filter((x) => x.id !== a.id).slice(0, 3) : [];
    return rel.length ? '<div class="ans-rel"><span class="eyebrow">' + esc(t('also_asked')) + '</span><div class="list">' + rel.map((x) => '<button type="button" class="item quiet" data-ans="' + esc(a.group + '.' + x.id) + '"><span class="body"><strong>' + esc(L(x, 'title')) + '</strong></span><span class="chev">' + I.chev + '</span></button>').join('') + '</div></div>' : '';
  }
  function openAnswer(key) {
    const a = findArticle(key); if (!a) { setHash('a-' + key); return; }
    const sd = L(a, 'see_doctor') || []; const g = (CONTENT.groups || []).find((x) => x.group === a.group) || {};
    const urgent = /danger-signs|did-not-want/.test(key);
    sheet('<div class="ans" id="ans" data-key="' + esc(key) + '">' +
      '<div class="ans-top">' + (api.art ? api.art.spot(a.group) : '') + '<div class="ans-tt"><span class="eyebrow">' + esc(L(g, 'title')) + '</span><h2>' + esc(L(a, 'title')) + '</h2></div></div>' +
      '<p class="lead">' + esc(L(a, 'summary')) + '</p>' +
      '<div class="row wrap">' + (api.readAloud ? '<button type="button" class="btn sm" id="ans-listen">' + I.speaker.replace('<svg', '<svg style="width:18px;height:18px"') + ' ' + esc(t('listen_b')) + '</button>' : '') + '<button type="button" class="btn sm" data-go="a-' + esc(key) + '">' + esc(t('full_guide')) + '</button></div>' +
      (sd.length ? '<div class="ans-doc"><b>' + esc(t('see_doctor')) + '</b><ul>' + sd.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '') +
      (urgent ? '<button type="button" class="btn block" data-go="help">' + esc(t('sos_signs')) + '</button>' : '<button type="button" class="btn primary block" data-ask="' + esc(L(a, 'title')) + '">' + esc(t('ask_qura')) + '</button>') +
      relatedHtml(a) + '</div>', (sh) => {
      const ls = $('#ans-listen', sh); if (ls) ls.addEventListener('click', () => api.readAloud($('#ans', sh)));
      sh.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => openAnswer(b.dataset.ans)));
      clearTimeout(readTm); readTm = setTimeout(() => { const a2 = document.querySelector('#sheet-root .ans'); if (a2 && a2.dataset.key === key) emit('read', { key: key }); }, 9000);
    });
    if (!urgent) tourMoment('answer');   /* never on danger signs */
  }
  /* SOS: every emergency number one tap away (the phone's dialer opens; she presses call). */
  const copyNum = (n, el) => { const done = () => toast(t('copied') + ' ' + n); try { navigator.clipboard.writeText(n).then(done, () => { const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }); } catch (e) { toast(n); } };
  function openSOS() {
    sheet('<h2>' + esc(t('sos_h')) + '</h2><p class="small">' + esc(t('sos_p')) + '</p><div class="list">' + HELPLINES.map((h) => '<div class="sos-row"><div class="sos-n num">' + h[0] + '</div><div class="sos-w">' + esc(state.lang === 'hi' ? h[2] : h[1]) + '</div><a class="btn sm sos-call" href="tel:' + h[0] + '">' + esc(t('call_b')) + '</a><button type="button" class="btn sm" data-copy="' + h[0] + '">' + esc(t('copy')) + '</button></div>').join('') + '</div><button type="button" class="btn block" data-go="help">' + esc(t('sos_signs')) + '</button>', (sh) => {
      sh.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyNum(b.dataset.copy, b.parentElement.querySelector('.sos-n'))));
    });
  }
  /* Where she is now, in one tap. Pregnancy and birth ask for the one date the maths needs. */
  function openStage(initial) {
    const s0 = state.situation; let pick = typeof initial === 'string' ? initial : stageNow(); if (pick === 'browse') pick = 'cycle'; if (pick === 'meno' && !s0.stopped && typeof initial !== 'string') pick = 'mid';
    const opts = [['cycle', 'stage_cycle', 'periods'], ['ttc', 'stage_ttc', 'ttc'], ['preg', 'stage_preg', 'preg'], ['post', 'stage_post', 'post'], ['mid', 'stage_mid', 'meno'], ['meno', 'stage_meno', 'meno']];
    const inRange = (val, a, b) => !!val && fromISO(val) >= addDays(today(), a) && fromISO(val) <= addDays(today(), b);
    const show = () => sheet('<h2>' + esc(t('stage_h')) + '</h2><div class="list">' + opts.map((o) => '<button type="button" class="item stage-opt' + (pick === o[0] ? ' on' : '') + '" data-stage="' + o[0] + '" aria-pressed="' + (pick === o[0]) + '"><span class="ico-sm hue hue-' + hueOf(o[2]) + '">' + icon(SECTION_ICONS[o[2]]) + '</span><span class="body"><strong>' + esc(t(o[1])) + '</strong></span>' + (pick === o[0] ? '<span class="pill ok">✓</span>' : '') + '</button>').join('') + '</div>' +
      (pick === 'preg' ? '<div class="card"><p class="small">' + esc(t('stage_preg_note')) + '</p><label for="st-edd">' + esc(t('scan_edd')) + '</label><input type="date" id="st-edd" value="' + esc(s0.pregnant ? (s0.scanEdd || '') : '') + '"><label for="st-lmp">' + esc(t('lmp')) + '</label><input type="date" id="st-lmp" max="' + toISO(today()) + '" value="' + esc(s0.pregnant ? (s0.pregnantSince || '') : '') + '"></div>' : '') +
      (pick === 'post' ? '<div class="card"><label for="st-birth">' + esc(t('stage_birth_date')) + '</label><input type="date" id="st-birth" max="' + toISO(today()) + '" value="' + esc(s0.deliveredOn || '') + '"><label class="row" style="font-weight:500"><input type="checkbox" id="st-bf" style="width:22px;height:22px;min-height:0;accent-color:var(--accent)"' + (s0.breastfeeding !== false ? ' checked' : '') + '> ' + esc(t('stage_bf')) + '</label></div>' : '') +
      '<div class="sheet-foot"><div class="grid2"><button type="button" class="btn" id="st-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="st-save">' + esc(t('save')) + '</button></div></div>', (sh) => {
      sh.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => { pick = b.dataset.stage; show(); }));
      $('#st-cancel', sh).addEventListener('click', closeSheet);
      $('#st-save', sh).addEventListener('click', () => {
        const val = (id) => { const el = $('#' + id, sh); return el ? el.value : ''; };
        const clearPreg = endPregnancy;
        if (pick === 'preg') {
          const edd = val('st-edd'), lmp = val('st-lmp');
          if (!edd && !lmp) { toast(t('stage_preg_note')); return; }
          if ((edd && !inRange(edd, -28, 280)) || (lmp && !inRange(lmp, -310, 0))) { toast(t('date_bad')); return; }
          s0.pregnant = true; if (lmp) s0.pregnantSince = lmp; if (edd) s0.scanEdd = edd; else delete s0.scanEdd; if (!s0.pregnantSince) s0.pregnantSince = toISO(addDays(fromISO(edd), -280));
          s0.planning = false; s0.stopped = false; delete s0.midlife;
        } else if (pick === 'post') {
          const b = val('st-birth'); if (!inRange(b, -730, 0)) { toast(t('date_bad')); return; }
          clearPreg(); setBirth(b); s0.breastfeeding = !!($('#st-bf', sh) || {}).checked; s0.planning = false; s0.stopped = false;
        } else {
          clearPreg(); s0.planning = pick === 'ttc'; s0.stopped = pick === 'meno'; s0.midlife = pick === 'mid' || pick === 'meno';
        }
        save(); closeSheet(); toast(t('stage_saved'));
        const ls = lastStart();
        if ((pick === 'cycle' || pick === 'ttc') && s0.deliveredOn && diffDays(fromISO(s0.deliveredOn), today()) <= 365 && !(ls && ls > fromISO(s0.deliveredOn))) { setHash('home'); toast(t('stage_log_first')); openLog('start', toISO(today()), null); return; }
        setHash('home');
      });
    });
    show();
  }
  /* Android back: close an open sheet first, then go back. */
  window.__sakhiBack = () => { if (tour) { endTour('later'); return true; } if (fabOpen) { closeFab(); return true; } const r = $('#sheet-root'); if (r && r.innerHTML) { closeSheet(); return true; } return false; };

  /* ---------- the + button: today's period, spotting, symptoms, mood or a note, from anywhere in the diary ----------
     On the Diary it is always there; on Home it appears once the round buttons scroll out of sight. */
  let fabOpen = false, fabIO = null;
  const fabRoot = () => { let r = document.getElementById('fab-root'); if (!r) { r = document.createElement('div'); r.id = 'fab-root'; document.body.appendChild(r); } return r; };
  function renderFab(r) {
    const root = fabRoot(); fabOpen = false; if (fabIO) { fabIO.disconnect(); fabIO = null; }
    const on = !!r && state.stage === 'app' && !mem.locked && (r === 'diary' || r === 'home');
    document.body.classList.toggle('has-fab', on && r === 'diary');
    if (!on) { root.innerHTML = ''; return; }
    root.innerHTML = '<button type="button" class="fab' + (r === 'home' ? ' away' : '') + '" id="fab" aria-expanded="false" aria-label="' + esc(t('fab_add')) + '">' + PLUS + '</button>';
    $('#fab', root).addEventListener('click', openFab);
    const row = r === 'home' ? $('#view .ract-row') : null;
    if (row && 'IntersectionObserver' in window) {
      const tbH = Math.round(($('#topbar') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height || 0);
      fabIO = new IntersectionObserver((es) => { const off = !es[0].isIntersecting && es[0].boundingClientRect.top < tbH; const f = $('#fab', root); if (f && !fabOpen) f.classList.toggle('away', !off); document.body.classList.toggle('has-fab', off); }, { rootMargin: '-' + tbH + 'px 0px 0px 0px' });
      fabIO.observe(row);
    } else if (r === 'home') root.innerHTML = '';
  }
  function openFab(e) {
    const root = fabRoot(); const disc = !!state.settings.discreet; const tStr = toISO(today()); const open = openPeriod();
    const canPeriod = !isPregnant() && !state.situation.hysterectomy && !earlyPost(); const items = [];
    if (canPeriod) items.push({ log: open ? 'end' : 'start', ico: I.drop, label: disc ? (open ? t('d_end') : t('d_start')) : (open ? t('period_ended') : t('period_started')), cls: 'primary' });
    if (canPeriod) items.push({ log: 'spot', ico: SPOTS, label: disc ? t('d_spot') : t('spotting'), cls: 'hue-rose' });
    items.push({ day: 'sym', ico: sIco('clip'), label: disc ? t('sym_h_d') : t('sym_h'), cls: 'hue-' + KINDS.pain.hue });
    items.push({ day: 'mood', ico: sIco(KINDS.mood.ico), label: t(KINDS.mood.label), cls: 'hue-' + KINDS.mood.hue });
    items.push({ day: 'note', ico: sIco(KINDS.note.ico), label: t('note_h'), cls: 'hue-' + KINDS.note.hue });
    const n = items.length;
    root.innerHTML = '<div class="fab-bg" id="fab-bg"></div><div class="fab-menu" role="group" aria-label="' + esc(t('fab_add')) + '"><div class="fab-date">' + esc(t('today_short') + ' · ' + fmtD(today(), { weekday: 'short', day: 'numeric', month: 'short' })) + '</div>' +
      items.slice().reverse().map((x, i) => '<button type="button" class="fab-it ' + x.cls + '" style="--i:' + (n - 1 - i) + '" data-fi="' + items.indexOf(x) + '"><span class="fl">' + esc(x.label) + '</span><span class="fi">' + x.ico + '</span></button>').join('') +
      '</div><button type="button" class="fab open" id="fab" aria-expanded="true" aria-label="' + esc(t('fab_close')) + '">' + PLUS + '</button>';
    fabOpen = true; document.body.classList.add('has-fab');
    $('#fab', root).addEventListener('click', closeFab); $('#fab-bg', root).addEventListener('click', closeFab);
    root.querySelectorAll('[data-fi]').forEach((b) => b.addEventListener('click', () => { const x = items[+b.dataset.fi]; closeFab(); if (x.log) quickLog(x.log); else openDay(tStr, x.day); }));
    const f0 = root.querySelector('[data-fi]'); if (f0 && (!e || e.detail === 0)) safe(() => f0.focus({ preventScroll: true }));   /* keyboard: first item; touch: no focus ring */
  }
  function closeFab() { if (!fabOpen) return; renderFab(route()); const f = $('#fab'); if (f) { f.classList.remove('away'); safe(() => f.focus({ preventScroll: true })); } }

  /* ---------- tours: a short walkthrough the first time she meets a screen or a feature ----------
     Each step dims the screen, lifts one feature and says what it is and how to use it (about 20 words), with Listen.
     A "try it" step waits for her real tap. Three steps at most.
     Screen tours start on her first visit to a screen, and Home has one for each stage (pregnancy, after a birth, trying,
     midlife). Feature tours start the first time a feature is in front of her: the day page, a quick answer, the check-in,
     the cycle ring and Change stage (the garden and the explanations come from their modules). A "?" replays a feature's tour.
     One tour per visit or moment, a minute apart, three a day; never on Help (she may be there in an emergency), a sample
     diary, the lock screen, or near an urgent card. Plain words in discreet mode. Tours are data: a module adds its own with
     register({ tours }). */
  const notDisc = () => !state.settings.discreet;
  /* a quick answer to replay the answer tour on: the first ordinary one for her stage (never danger signs) */
  const answerToShow = () => { const x = (QA[stageNow()] || []).concat(QA.cycle).find((y) => y[1].charAt(0) !== '#' && !/danger-signs|did-not-want/.test(y[1]) && findArticle(y[1])); return x ? x[1] : null; };
  const TOURS = [
    /* screens; Home has one per stage, and the plain one in discreet mode */
    { id: 'home', route: 'home', title: 'tour_home', hue: 'rose', order: 10, when: () => !notDisc() || ['preg', 'post'].indexOf(stageNow()) < 0, steps: [{ sel: '.wkstrip', h: 'tw1_h', p: 'tw1_p' }, { sel: '.ract-row', h: 'tw2_h', p: 'tw2_p' }, { sel: '.askbox', h: 'tw3_h', p: 'tw3_p', pm: 'tw3_pm', tryIt: true }] },
    { id: 'home-preg', route: 'home', title: 'tour_hpreg', hue: 'sky', order: 10, when: () => notDisc() && stageNow() === 'preg', steps: [
      { sel: '#view .card.hero', h: 'thp1_h', p: 'thp1_p', vars: () => ({ b: t('this_week') }) },
      { sel: '#view .ract-row', h: 'thp2_h', p: 'thp2_p', vars: () => ({ a: t('this_week'), b: t('my_logs') }) },
      { sel: '#view .qa-sec', h: 'thp3_h', p: 'thp3_p', pm: 'thp3_pm', vars: () => ({ b: t('qa_danger') }) }] },
    { id: 'home-post', route: 'home', title: 'tour_hpost', hue: 'plum', order: 10, when: () => notDisc() && stageNow() === 'post', steps: [
      { sel: '#view .card.hero', h: () => (earlyPost() ? 'tpp1_h' : 'tpp1_hl'), p: () => (earlyPost() ? 'tpp1_p' : 'tpp1_pl'), vars: () => ({ b: t('pp_go') }) },
      { sel: '#view .ract-row', h: 'thp2_h', p: () => (earlyPost() ? 'tpp2_p' : 'tpp2_pl'), vars: () => ({ a: t('pp_rec_b'), b: t('pp_feed_b') }) },
      { sel: '#view .qa-sec', h: 'thp3_h', p: 'tpp3_p', pm: 'tpp3_pm' }] },
    { id: 'home-ttc', route: 'home', title: 'tour_httc', hue: 'green', order: 20, when: () => notDisc() && stageNow() === 'ttc', steps: [
      { sel: '#view .action[data-go="ttc"]', h: 'tht1_h', p: 'tht1_p' }, { sel: '#view .qa-grid', h: 'tht2_h', p: 'tht2_p' }] },
    { id: 'home-meno', route: 'home', title: 'tour_hmeno', hue: 'purple', order: 20, when: () => notDisc() && stageNow() === 'meno', steps: [
      { sel: '#view .qa-grid', h: 'thm1_h', p: 'thm1_p' }, { sel: '#view .qa-tile[data-qa="midlife.bleeding-after-menopause"]', h: 'thm2_h', p: 'thm2_p' }] },
    { id: 'diary', route: 'diary', title: 'tour_diary', titleD: 'tour_diary_d', hue: 'sky', auto: true, steps: [{ sel: '.diary-paper .cal', h: 'td1_h', p: 'td1_p', pd: 'td1_pd' }, { sel: '.tabs [data-tab="tr"]', h: 'td2_h', p: 'td2_p', pd: 'td2_pd' }, { sel: '#fab', h: 'td3_h', p: 'td3_p', pd: 'td3_pd', tryIt: true }] },
    { id: 'care', route: 'care', title: 'tour_care', hue: 'teal', auto: true, browse: true, steps: [{ sel: '.topic-grid', h: 'tc1_h', p: 'tc1_p', pd: 'tc1_pd' }, { sel: '[data-lang-read]', h: 'tc2_h', p: 'tc2_p' }, { sel: '#doc-btn', h: 'tc3_h', p: 'tc3_p' }] },
    { id: 'help', route: 'help', title: 'tour_help', hue: 'orange', auto: false, browse: true, steps: [{ sel: '.doc-card', h: 'th1_h', p: 'th1_p' }, { sel: '#sos-btn', h: 'th2_h', p: 'th2_p' }] },
    { id: 'me', route: 'me', title: 'tour_me', hue: 'purple', auto: true, steps: [{ sel: '#me-privacy', h: 'tm1_h', p: 'tm1_p', pw: 'tm1_pw' }, { sel: '#me-del', h: 'tm2_h', p: 'tm2_p' }] },
    /* features, the first time each one is in front of her */
    { id: 'day', kind: 'feature', moment: 'day', title: 'tour_day', titleD: 'tour_day_d', hue: 'sky', open: () => openDay(toISO(today())), steps: [
      { sel: '#sheet-root [data-cat="period"]', h: 'tdy1_h', p: 'tdy1_p', pd: 'tdy1_pd', vars: () => ({ a: t('period_started'), b: t('period_ended'), c: t('spotting') }) },
      { sel: '#sheet-root .symcat:not([data-cat="period"]):not([data-cat="note"])', h: 'tdy2_h', p: 'tdy2_p' },
      { sel: '#sheet-root [data-cat="note"]', h: 'tdy3_h', p: 'tdy3_p' }] },
    { id: 'answer', kind: 'feature', moment: 'answer', title: 'tour_ans', hue: 'teal', browse: true, open: () => { const k = answerToShow(); if (k) openAnswer(k); }, steps: [
      { sel: '#ans-listen', h: 'tan1_h', p: 'tan1_p', vars: () => ({ b: t('listen_b') }) }, { sel: '#sheet-root .ans [data-ask]', h: 'tan2_h', p: 'tan2_p' }] },
    { id: 'checkin', kind: 'feature', route: 'checkin', title: 'tour_ci', hue: 'green', steps: [
      { sel: '#view > .chips', h: 'tci1_h', p: 'tci1_p' }, { sel: '#ci-save', h: 'tci2_h', p: 'tci2_p', vars: () => ({ b: t('ci_save') }) }] },
    { id: 'ring', kind: 'feature', route: 'home', order: 40, title: 'tour_ring', hue: 'rose', when: () => notDisc() && ['cycle', 'ttc', 'meno'].indexOf(stageNow()) >= 0 && !!lastStart(), steps: [
      { sel: '#view .card.hero .ringwrap', wrap: '.hero-row', h: 'tr1_h', p: 'tr1_p' }] },
    { id: 'stage', kind: 'feature', route: 'home', order: 70, title: 'stage_change', hue: 'purple', when: notDisc, auto: () => diffDays(fromISO(state.created || toISO(today())), today()) >= 1, steps: [
      { sel: '#stage-btn', h: 'stage_change', p: 'tst1_p' }] }
  ];
  let tour = null, tourTm = 0, tourEnded = 0, tourOpening = false;
  const kv = (x) => (typeof x === 'function' ? x() : x);
  const stepOk = (s) => !s.when || s.when();
  /* the element a step lights: its feature, or the block around it (wrap), e.g. the ring together with its legend */
  const stepEl = (s) => { const e = document.querySelector(s.sel); return e && s.wrap ? e.closest(s.wrap) || e : e; };
  const tourRoot = () => { let r = document.getElementById('tour-root'); if (!r) { r = document.createElement('div'); r.id = 'tour-root'; document.body.appendChild(r); } return r; };
  const tourSt = (id) => (state.tours || {})[id] || null;
  const tourDef = (id) => TOURS.find((x) => x.id === id) || null;
  const tourFits = (d) => (state.stage === 'app' || (d.browse && state.stage === 'browse')) && (!d.when || d.when());
  const autoOk = (d) => (typeof d.auto === 'function' ? !!d.auto() : d.auto !== false);
  const unseen = (d) => { const st = tourSt(d.id); return !st || st.st === 'later'; };
  const hasTarget = (d) => d.steps.some((x) => stepOk(x) && document.querySelector(x.sel));
  const URGENT = '#view .xp-home-now, #view [data-xp-urgent], #view .flag.urgent, #view .xp-card.xp-now, #view .xp-card.xp-today, #view .xp-card.xp-week';
  /* The gate for every tour that starts on its own: switched on, her own diary, unlocked, a minute after the last one, three a day. */
  function autoGate() {
    if (state.settings.toursAuto === false || state.sample || mem.locked || Date.now() - tourEnded < 60000) return false;
    const td = state.tourDay; return !(td && td.d === toISO(today()) && td.n >= 3);
  }
  const countTour = () => { const day = toISO(today()); const n = state.tourDay && state.tourDay.d === day ? state.tourDay.n : 0; state.tourDay = { d: day, n: n + 1 }; save(); };
  function clearTour() { clearTimeout(tourTm); if (tour && tour.el) tour.el.removeEventListener('click', onTourTarget, true); tour = null; const r = document.getElementById('tour-root'); if (r) r.innerHTML = ''; }
  /* done: she finished or used the feature. later: comes back once, on her next visit; a second "later" turns it off. */
  function endTour(how) {
    if (!tour) return; const id = tour.def.id; const forced = tour.forced; clearTour(); tourEnded = Date.now();
    state.tours = state.tours || {}; const prev = state.tours[id];
    if (how === 'done') state.tours[id] = { st: 'done', d: toISO(today()) };
    else if (!forced || !prev || prev.st !== 'done') state.tours[id] = { st: prev && prev.st === 'later' ? 'off' : 'later', d: toISO(today()) };
    save();
  }
  function onTourTarget() {
    if (!tour) return; const s = tour.steps[tour.i];
    endTour('done'); if (s.tryIt) setTimeout(() => toast(t('tour_great')), 300);
  }
  /* auto: the first eligible tour for this screen, in order (her stage's Home first). force: a replay from "How to use Sakhi". */
  function queueTour(r) {
    clearTimeout(tourTm);
    const force = mem.tourForce && mem.tourForce.route === r ? mem.tourForce.id : null;
    tourTm = setTimeout(() => {
      if (force) { mem.tourForce = null; startTour(force, true); return; }
      if (!autoGate() || fabOpen || $('#sheet-root').innerHTML || route() !== r || document.querySelector(URGENT)) return;
      const def = TOURS.filter((x) => x.route === r && autoOk(x) && tourFits(x) && unseen(x)).sort((x, y) => (x.order || 50) - (y.order || 50)).find(hasTarget);
      if (def) { countTour(); startTour(def.id, false); }
    }, force ? 250 : 650);
  }
  /* A feature that opens in a sheet (the day page, a quick answer) gets its tour the first time it opens. */
  function tourMoment(name) {
    if (tourOpening || tour) return;
    const def = TOURS.find((x) => x.moment === name && autoOk(x) && tourFits(x) && unseen(x)); if (!def || !autoGate()) return;
    clearTimeout(tourTm);
    tourTm = setTimeout(() => { if (!tour && autoGate() && $('#sheet-root').innerHTML && hasTarget(def)) { countTour(); startTour(def.id, false); } }, 450);
  }
  /* Plain words in discreet mode; the mic line only where the mic is; no "show as Notes" outside the Android app.
     A line can name a button ({b}): it is filled in from the button's own label, so the words always match the screen. */
  const stepText = (s) => tf(kv(state.settings.discreet && s.pd ? s.pd : s.pm && $('#ask-mic') ? s.pm : s.pw && !(window.SakhiAndroid && window.SakhiAndroid.setDisguise) ? s.pw : s.p), s.vars ? s.vars() : {});
  function startTour(id, forced) {
    const def = tourDef(id); if (!def) return;
    if (def.moment) {
      if (hasTarget(def)) { runTour(def, forced); return; }
      /* a replay opens the feature first: today's page, or a quick answer for her stage */
      if (!forced || !def.open) return;
      if (fabOpen) closeFab(); tourOpening = true; safe(() => def.open()); tourOpening = false;
      setTimeout(() => { if (hasTarget(def)) runTour(def, true); }, 450);
      return;
    }
    if (route() !== def.route) { mem.tourForce = { id: id, route: def.route }; nav.stack = []; setHash(def.route); return; }
    if ($('#sheet-root').innerHTML) closeSheet(); if (fabOpen) closeFab();
    runTour(def, forced);
  }
  function runTour(def, forced) {
    const steps = def.steps.filter((x) => stepOk(x) && document.querySelector(x.sel)); if (!steps.length) return;
    clearTour(); tour = { def: def, steps: steps, i: 0, forced: !!forced, el: null }; showTourStep(true);
  }
  function showTourStep(scroll) {
    if (!tour) return;
    const s = tour.steps[tour.i]; const el = stepEl(s); if (!el) { endTour('done'); return; }
    if (tour.el && tour.el !== el) tour.el.removeEventListener('click', onTourTarget, true);
    tour.el = el; el.addEventListener('click', onTourTarget, true);
    if (scroll) {
      const sh = el.closest('#sheet-root .sheet');
      if (sh) {
        /* in a sheet: centre the feature in the part of the sheet she can see */
        const rs = sh.getBoundingClientRect(), rc0 = el.getBoundingClientRect(); const vt = Math.max(rs.top, 0), vb = Math.min(rs.bottom, window.innerHeight);
        if (rc0.top < vt + 8 || rc0.bottom > vb - 8) sh.scrollTop += rc0.top - vt - Math.max(8, (vb - vt - rc0.height) / 2);
      } else if (getComputedStyle(el).position !== 'fixed' && !el.closest('.topbar')) {
        /* Bring the feature into view under the top bar. A feature taller than half the screen (the topic grid) shows its top part. */
        const rc0 = el.getBoundingClientRect(), H = window.innerHeight; const tb = $('.topbar'); const top0 = tb ? tb.getBoundingClientRect().bottom + 10 : 86;
        const hd = el.previousElementSibling && /^H[1-4]$/.test(el.previousElementSibling.tagName) ? el.previousElementSibling : null; const a0 = hd ? hd.getBoundingClientRect().top : rc0.top;
        if (rc0.height > H * 0.5) { if (a0 < top0 || a0 > H * 0.25) window.scrollBy(0, a0 - top0); }   /* with its heading */
        else if (rc0.top < top0 || rc0.bottom > H - 110) el.scrollIntoView({ block: 'center' });
      }
    }
    const body = stepText(s);
    const n = tour.steps.length, i = tour.i, last = i === n - 1;
    const root = tourRoot();
    root.innerHTML = ['t', 'b', 'l', 'r'].map((k) => '<div class="tour-dim" data-dim="' + k + '"></div>').join('') + '<div class="tour-ring' + (s.tryIt ? ' try' : '') + '"></div>' +
      '<div class="tour-pop" role="dialog" aria-modal="false" aria-labelledby="tour-h" aria-describedby="tour-body" tabindex="-1"><div class="tour-top">' + (api.art ? api.art.sakhi({ pose: 'hi', look: state.settings.look }) : '') + '<strong id="tour-h">' + esc(t(kv(s.h))) + '</strong>' +
      (api.readAloud ? '<button type="button" class="iconbtn tour-say" id="tour-say" aria-label="' + esc(t('tour_listen')) + '">' + I.speaker + '</button>' : '') + '<button type="button" class="iconbtn tour-x" id="tour-x" aria-label="' + esc(t('tour_close')) + '">' + I.back.replace('M15 5l-7 7 7 7', 'M6 6l12 12M18 6L6 18') + '</button></div>' +
      '<p class="tour-body" id="tour-body">' + esc(body) + '</p><div class="tour-foot"><span class="tour-n">' + esc(tf('hint_n', { i: i + 1, n: n })) + '</span><span class="tour-btns">' +
      (i === 0 ? '<button type="button" class="btn sm" id="tour-later">' + esc(t('tour_later')) + '</button>' : '<button type="button" class="btn sm" id="tour-back">' + esc(t('tour_back')) + '</button>') +
      '<button type="button" class="btn sm primary" id="tour-next">' + esc(t(last ? 'tour_done' : 'tour_next')) + '</button></span></div></div>';
    placeTour();
    root.querySelectorAll('.tour-dim').forEach((d) => d.addEventListener('click', () => endTour('later')));
    $('#tour-x', root).addEventListener('click', () => endTour('later'));
    const lt = $('#tour-later', root); if (lt) lt.addEventListener('click', () => endTour('later'));
    const bk = $('#tour-back', root); if (bk) bk.addEventListener('click', () => { tour.i = Math.max(0, tour.i - 1); showTourStep(true); });
    $('#tour-next', root).addEventListener('click', () => { if (last) endTour('done'); else { tour.i++; showTourStep(true); } });
    const sy = $('#tour-say', root); if (sy) sy.addEventListener('click', () => api.readAloud($('.tour-pop', root)));
    safe(() => $('.tour-pop', root).focus({ preventScroll: true }));
    if (state.settings.tourVoice && api.readAloud) setTimeout(() => { if (tour) api.readAloud($('.tour-pop', root)); }, 300);
  }
  /* Everything is placed in viewport pixels and re-placed on scroll: four dim panels around the feature, a ring, and the card. */
  function placeTour() {
    if (!tour || !tour.el) return; const root = document.getElementById('tour-root'); const pop = root && $('.tour-pop', root); if (!pop) return;
    /* the feature was drawn again (a sheet or a screen re-rendered): follow the new one, or stop if it has gone */
    if (!tour.el.isConnected) { const el2 = stepEl(tour.steps[tour.i]); if (!el2) { clearTour(); return; } tour.el.removeEventListener('click', onTourTarget, true); tour.el = el2; el2.addEventListener('click', onTourTarget, true); }
    const W = window.innerWidth, H = window.innerHeight; const rc = tour.el.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const h = { l: Math.max(0, rc.left - 6), t: Math.max(0, rc.top - 6), r: Math.min(W, rc.right + 6), b: Math.min(H, rc.bottom + 6) };
    /* a feature taller than half the screen is lit from its top, leaving room for the card under it */
    if (rc.height > H * 0.5) h.b = Math.min(h.b, h.t + Math.round(Math.max(120, Math.min(H * 0.5, H - h.t - ph - 32))));
    const px = (el, x, y, w, hh) => { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = Math.max(0, w) + 'px'; el.style.height = Math.max(0, hh) + 'px'; };
    px($('[data-dim="t"]', root), 0, 0, W, h.t); px($('[data-dim="b"]', root), 0, h.b, W, H - h.b); px($('[data-dim="l"]', root), 0, h.t, h.l, h.b - h.t); px($('[data-dim="r"]', root), h.r, h.t, W - h.r, h.b - h.t);
    const ring = $('.tour-ring', root); px(ring, h.l, h.t, h.r - h.l, h.b - h.t); const br = getComputedStyle(tour.el).borderTopLeftRadius; ring.style.borderRadius = /%/.test(br) ? br : Math.min(28, (parseFloat(br) || 8) + 6) + 'px';
    const app = $('#app').getBoundingClientRect();
    const left = clamp((h.l + h.r) / 2 - pw / 2, Math.max(8, app.left + 10), Math.min(W - pw - 8, app.right - pw - 10));
    let top, cls;
    pop.style.maxHeight = ''; pop.style.overflowY = '';
    if (h.b + ph + 16 <= H - 8) { top = h.b + 12; cls = 'below'; } else if (h.t - ph - 16 >= 8) { top = h.t - ph - 12; cls = 'above'; }
    else {
      /* no room above or below (a small screen with the feature mid-way): move the page so the feature sits under the top bar,
         then the card goes below it, scrolling inside itself if it still doesn't fit. It never covers the feature. */
      const tb = $('.topbar'); const top0 = tb ? tb.getBoundingClientRect().bottom + 8 : 80; const inSheet = !!tour.el.closest('.sheet');
      if (!inSheet && tour.liftedFor !== tour.el && rc.top > top0 + 4) { tour.liftedFor = tour.el; window.scrollBy(0, rc.top - top0); requestAnimationFrame(placeTour); return; }
      top = Math.min(h.b + 12, H - 140); cls = 'below'; pop.style.maxHeight = Math.max(120, H - top - 8) + 'px'; pop.style.overflowY = 'auto';
    }
    pop.className = 'tour-pop ' + cls; pop.style.left = left + 'px'; pop.style.top = top + 'px';
    pop.style.setProperty('--ax', clamp((h.l + h.r) / 2 - left, 22, pw - 22) + 'px');
  }
  /* capture: a sheet scrolling inside itself moves the feature too */
  document.addEventListener('scroll', () => { if (tour) requestAnimationFrame(placeTour); }, { passive: true, capture: true });
  window.addEventListener('resize', () => { if (tour) requestAnimationFrame(placeTour); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (tour) endTour('later'); else if (fabOpen) closeFab(); } });
  /* a "?" beside a feature replays its tour */
  document.addEventListener('click', (e) => { const q = e.target && e.target.closest ? e.target.closest('[data-tour-q]') : null; if (q) { e.preventDefault(); startTour(q.dataset.tourQ, true); } });
  /* "How to use Sakhi": every tour she can use, replayable, in Help and in Me: the screens, then the features. */
  function tourMenuHtml() {
    const list = TOURS.filter((d) => d.menu !== false && tourFits(d));
    const row = (d) => { const st = tourSt(d.id); const n = d.steps.filter(stepOk).length; return '<button type="button" class="item" data-tour-run="' + d.id + '"><span class="ico-sm hue hue-' + d.hue + '">' + I.play + '</span><span class="body"><strong>' + esc(t(state.settings.discreet && d.titleD ? d.titleD : d.title)) + '</strong><span>' + esc(n === 1 ? t('tour_step1') : tf('tour_steps', { n: n })) + (st && st.st === 'done' ? ' · ' + esc(t('tour_seen')) : '') + '</span></span><span class="chev">' + I.chev + '</span></button>'; };
    const grp = (k, h) => { const xs = list.filter((d) => (d.kind || 'screen') === k); return xs.length ? '<h3 class="tour-grp">' + esc(t(h)) + '</h3><div class="list tour-menu">' + xs.map(row).join('') + '</div>' : ''; };
    return '<h2>' + esc(t('howto_h')) + '</h2><p class="small">' + esc(t('howto_p')) + '</p>' + grp('screen', 'tour_g_screens') + grp('feature', 'tour_g_features');
  }
  const wireTourMenu = (v) => v.querySelectorAll('[data-tour-run]').forEach((b) => b.addEventListener('click', () => startTour(b.dataset.tourRun, true)));

  /* ---------- log sheet ---------- */
  function openLog(type, dateStr, existing) {
    const d = { t: type || 'start', d: dateStr || toISO(today()), pads: '', clots: '', pain: '', leaked: false, two: false, pk: false, daily: (state.daily[dateStr || toISO(today())] || []).slice() };
    if (existing) Object.assign(d, existing);
    /* Symptoms belong to a day. The chips show the chosen day's own symptoms plus the ones she tapped here, and saving
       changes only what she tapped: moving the date never copies one day's symptoms over another's. */
    const touched = {};
    const withTouched = (base) => { const out = base.filter((k) => touched[k] !== false); Object.keys(touched).forEach((k) => { if (touched[k] && out.indexOf(k) < 0) out.push(k); }); return out; };
    const root = $('#sheet-root'); const opt = (name, key, vals) => '<div class="stack" style="gap:6px"><label>' + esc(t(key)) + '</label><div class="grid' + (vals.length === 3 ? '3' : '2') + '">' + vals.map((x) => '<button type="button" class="btn sm ' + (d[name] === x ? 'on' : '') + '" data-opt="' + name + '" data-val="' + x + '">' + esc(t(x)) + '</button>').join('') + '</div></div>';
    const draw = () => {
      const oldSheet = root.querySelector('.sheet'); const keepTop = oldSheet ? oldSheet.scrollTop : 0;
      root.innerHTML = '<div class="sheet-bg" id="sheet-bg"><div class="sheet" role="dialog" aria-label="' + esc(t('log_h')) + '"><div class="handle"></div><h2>' + esc(t('log_h')) + '</h2>' +
        '<div class="stack" style="gap:6px"><label>' + esc(t('what_log')) + '</label><div class="grid3">' + [['start', 'period_started'], ['end', 'ended'], ['spot', 'spotting']].map((x) => '<button type="button" class="btn sm ' + (d.t === x[0] ? 'on' : '') + '" data-type="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '</div></div>' +
        '<div class="stack" style="gap:6px"><label for="log-date">' + esc(t('on_date')) + '</label><input type="date" id="log-date" value="' + esc(d.d) + '" max="' + toISO(today()) + '"></div>' +
        (d.t === 'spot' ? '' : '<div class="eyebrow">' + esc(t('flow_h')) + '</div>' + opt('pads', 'pads', ['pads_1', 'pads_2', 'pads_3', 'pads_4']) + (d.pads === 'pads_4' || d.clots === 'clots_2' ? '<div class="card warn" style="gap:4px"><p class="small" style="color:var(--fg)">' + esc(t('r2')) + '</p></div>' : '') + opt('clots', 'clots', ['clots_0', 'clots_1', 'clots_2']) + '<div class="grid2"><button type="button" class="btn sm ' + (d.leaked ? 'on' : '') + '" data-tog="leaked">' + esc(t('leaked')) + '</button><button type="button" class="btn sm ' + (d.two ? 'on' : '') + '" data-tog="two">' + esc(t('twopads')) + '</button></div>' + opt('pain', 'pain', ['pain_0', 'pain_1', 'pain_2', 'pain_3']) + (d.pain === 'pain_3' ? '<div class="card warn" style="gap:4px"><p class="small" style="color:var(--fg)">' + esc(t('r_pain')) + '</p></div>' : '')) +
        '<div class="stack" style="gap:6px"><label>' + esc(t('daily_h')) + '</label><div class="chips">' + ['d_cramps', 'd_headache', 'd_bloat', 'd_mood', 'd_tired', 'd_sleep'].map((k) => '<button type="button" class="chip ' + (d.daily.includes(k) ? 'on' : '') + '" data-daily="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div></div>' +
        '<p class="small">' + esc(t('cadence')) + '</p>' + (existing ? '<button type="button" class="btn danger sm" id="log-del">' + esc(t('delete_entry')) + '</button>' : '') + '<div class="sheet-foot"><div class="grid2"><button type="button" class="btn" id="log-cancel">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="log-save">' + esc(t('save')) + '</button></div></div></div></div>';
      root.querySelector('.sheet').scrollTop = keepTop;
      root.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => { d.t = b.dataset.type; draw(); }));
      root.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => { d[b.dataset.opt] = d[b.dataset.opt] === b.dataset.val ? '' : b.dataset.val; draw(); }));
      root.querySelectorAll('[data-tog]').forEach((b) => b.addEventListener('click', () => { d[b.dataset.tog] = !d[b.dataset.tog]; draw(); }));
      root.querySelectorAll('[data-daily]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.daily; const i = d.daily.indexOf(k); if (i >= 0) d.daily.splice(i, 1); else d.daily.push(k); touched[k] = d.daily.indexOf(k) >= 0; draw(); }));
      $('#log-date', root).addEventListener('change', (e) => { d.d = e.target.value || d.d; d.daily = withTouched(state.daily[d.d] || []); draw(); });
      $('#log-cancel', root).addEventListener('click', close); $('#sheet-bg', root).addEventListener('click', (e) => { if (e.target.id === 'sheet-bg') close(); });
      $('#log-save', root).addEventListener('click', () => { if (!isISO(d.d) || fromISO(d.d) > today()) { toast(t('date_bad')); return; } if (existing) state.events = state.events.filter((e) => e !== existing); state.events = state.events.filter((e) => !(e.t === d.t && e.d === d.d)); if (d.t === 'start') dropGuesses(d.d); state.events.push({ d: d.d, t: d.t, pads: d.pads, clots: d.clots, pain: d.pain, leaked: d.leaked, two: d.two }); if (Object.keys(touched).length) { const nd = withTouched(state.daily[d.d] || []); if (nd.length) state.daily[d.d] = nd; else delete state.daily[d.d]; } save(); close(); toast(t('saved')); render(); emit('log', { type: d.t }); });
      const del = $('#log-del', root); if (del) del.addEventListener('click', () => { state.events = state.events.filter((e) => e !== existing); save(); close(); render(); });
    };
    const close = () => { root.innerHTML = ''; };
    draw();
  }

  /* ---------- diary: calendar + trends ---------- */
  /* The diary is paper: a warm sheet, handwritten headings, dotted rules. The + button stays at hand on both tabs. */
  function renderDiary(v) {
    const tab = mem.diaryTab; v.innerHTML = '<div class="tabs"><button type="button" class="' + (tab === 'cal' ? 'on' : '') + '" data-tab="cal">' + esc(t('calendar')) + '</button><button type="button" class="' + (tab === 'tr' ? 'on' : '') + '" data-tab="tr">' + esc(t('trends')) + '</button></div><div id="diary-body" class="view diary-paper"></div>';
    v.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { mem.diaryTab = b.dataset.tab; render(); }));
    const body = $('#diary-body', v); if (tab === 'cal') renderCalendar(body); else renderTrends(body);
  }
  function renderCalendar(v) {
    const base = mem.calMonth ? fromISO(mem.calMonth) : new Date(today().getFullYear(), today().getMonth(), 1); const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1); const offset = (first.getDay() + 6) % 7; const daysIn = new Date(y, m + 1, 0).getDate(); const bd = bleedingDays(); const ri = rangeInfo(); const tStr = toISO(today());
    let cells = ''; for (let i = 0; i < offset; i++) cells += '<span></span>';
    for (let d = 1; d <= daysIn; d++) {
      const dt = new Date(y, m, d); const s = toISO(dt); const k = bd[s]; const inR = ri && dt >= ri.from && dt <= ri.to; const fut = dt > today(); const ks = fut ? [] : kindsOn(s);
      const cls = ['day', k === 'start' ? 'bleed' : (k === 'bleed' ? 'bleed light' : ''), k === 'spot' ? 'spot' : '', inR ? 'range' : '', s === tStr ? 'today' : '', fut ? 'other' : ''].join(' ');
      const aria = fmtD(dt, { day: 'numeric', month: 'long' }) + (k === 'start' || k === 'bleed' ? ', ' + t('cal_a_period') : '') + (k === 'spot' ? ', ' + t('cal_a_spot') : '') + (inR ? ', ' + t('cal_a_range') : '') + (s === tStr ? ', ' + t('today_l') : '') + (ks.length ? ', ' + t('cal_a_noted') + ': ' + ks.map((x) => t(KINDS[x].label)).join(', ') : '');
      cells += '<button type="button" class="' + cls + '" data-day="' + s + '" aria-label="' + esc(aria) + '"' + (fut ? ' disabled' : '') + '><span class="num">' + d + '</span>' + (ks.length ? kdots(s) : '') + '</button>';
    }
    const lk = (k) => '<span class="lk"><i class="hue-' + KINDS[k].hue + '"></i>' + esc(t(KINDS[k].label)) + '</span>';
    v.innerHTML = '<div class="card"><div class="row spread"><button type="button" class="iconbtn" id="cal-prev" aria-label="prev">' + I.back + '</button><div class="cal-mo hand">' + esc(t('months')[m]) + ' ' + y + '</div><button type="button" class="iconbtn" id="cal-next" aria-label="next" style="transform:scaleX(-1)">' + I.back + '</button></div><div class="dotrule" aria-hidden="true"></div><div class="cal">' + t('dows').map((x) => '<span class="dow">' + esc(x) + '</span>').join('') + cells + '</div></div>' +
      '<div class="legend"><span><i class="sw" style="background:var(--bleed)"></i>' + esc(t('bleeding')) + '</span><span><i class="sw" style="background:transparent;box-shadow:inset 0 0 0 2px var(--bleed)"></i>' + esc(t('spotting')) + '</span><span><i class="sw" style="background:transparent;border:2px dashed var(--accent-2)"></i>' + esc(t('likely_range')) + '</span><span><i class="sw" style="box-shadow:inset 0 0 0 2px var(--ink)"></i>' + esc(t('today_l')) + '</span></div>' +
      '<div class="legend">' + ['pain', 'body', 'mood', 'disch', 'note'].map(lk).join('') + '</div><p class="small">' + esc(t('cal_note')) + ' ' + esc(t('no_contra')) + '</p>';
    $('#cal-prev', v).addEventListener('click', () => { mem.calMonth = toISO(new Date(y, m - 1, 1)); render(); }); $('#cal-next', v).addEventListener('click', () => { mem.calMonth = toISO(new Date(y, m + 1, 1)); render(); });
    /* A day opens the same day sheet as the week strip on Home; flow details stay one tap away inside it. */
    v.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { const s = b.dataset.day; if (fromISO(s) > today()) return; openDay(s); }));
  }
  /* Sakhi with a line of help, for screens that have nothing to show yet. */
  const emptyCard = (msg, btn) => '<div class="card empty">' + (api.art ? api.art.sakhi({ pose: 'calm', look: state.settings.look }) : '') + '<div class="body"><p>' + esc(msg) + '</p>' + (btn || '') + '</div></div>';
  /* What she noted in the last 90 days: each symptom she used, by kind and colour, counted in days. */
  function notedCard() {
    const from = toISO(addDays(today(), -89)); const tStr = toISO(today()); const counts = {}; let noteDays = 0;
    Object.keys(state.daily).forEach((ds) => { if (ds < from || ds > tStr) return; (state.daily[ds] || []).forEach((k) => { counts[k] = (counts[k] || 0) + 1; }); });
    Object.keys(state.notes || {}).forEach((ds) => { if (ds >= from && ds <= tStr && state.notes[ds]) noteDays++; });
    const rows = []; SYM.forEach((c) => c[2].forEach((x) => { if (counts[x[0]]) rows.push({ k: x[0], ico: x[1], kind: c[0].slice(4), n: counts[x[0]] }); }));
    if (noteDays) rows.push({ k: 'note_h', ico: 'pen', kind: 'note', n: noteDays });
    if (!rows.length) return emptyCard(t('noted_empty'), '<button type="button" class="btn sm" id="tr-add">' + esc(t('add_today')) + '</button>');
    rows.sort((a, b) => b.n - a.n); const mx = rows[0].n;
    return '<div class="card"><h2 class="hand">' + esc(t('noted_h')) + '</h2><p class="small">' + esc(t('noted_p')) + '</p><div class="kbars">' + rows.slice(0, 8).map((r) => '<div class="kbar hue-' + KINDS[r.kind].hue + '"><span class="si">' + sIco(r.ico) + '</span><span class="kt">' + esc(t(r.k)) + '<span class="bar" style="width:' + Math.max(6, Math.round((r.n / mx) * 100)) + '%"></span></span><span class="kn">' + esc(r.n === 1 ? t('k_day1') : tf('k_days', { n: r.n })) + '</span></div>').join('') + '</div></div>';
  }
  /* ---------- a report for any doctor: her own entries on one screen, to show or send. Notes only if she adds them. ---------- */
  function reportParts(withNotes) {
    const sit = state.situation; const age = ageYears(); const parts = []; const dfull = { day: 'numeric', month: 'short', year: 'numeric' };
    const about = []; if (age != null) about.push(tf('rp_age', { n: age }));
    if (isPregnant()) { const pi = pregInfo(); if (pi && pi.edd) about.push(tf('rp_preg', { w: pi.weeks, d: fmtD(fromISO(pi.edd), dfull) })); }
    if (sit.deliveredOn) about.push(tf('rp_birth', { d: fmtD(fromISO(sit.deliveredOn), dfull) }));
    const flags = ['breastfeeding', 'hormones', 'pcos', 'thyroid', 'hysterectomy', 'stopped', 'planning'].filter((k) => sit[k]).map((k) => t({ breastfeeding: 'bf', hysterectomy: 'hyst' }[k] || k));
    if (flags.length) about.push(flags.join(', '));
    if (about.length) parts.push({ h: t('rp_about'), lines: about });
    const st = starts(); const evs = state.events.slice().sort((a, b) => (a.d < b.d ? -1 : 1)); const ap = approxStarts();
    const gAll = gapsAll();
    const rows = st.slice(-6).map((d0) => { const i = st.indexOf(d0); const nx = st[i + 1]; const ev = evs.find((e) => e.t === 'start' && e.d === d0) || {}; const g0 = nx ? gAll.find((x) => x.from === d0 && x.to === nx) : null;
      return { d: d0, bleed: periodLen(d0), gap: nx ? diffDays(fromISO(d0), fromISO(nx)) : null, out: !!(g0 && !g0.usable), heavy: ev.pads === 'pads_4' || ev.clots === 'clots_2' || !!ev.leaked, guess: !!ap[d0] }; });
    if (rows.length) { const shown = rows.map((r) => r.d); const g = gapsAll().filter((x) => x.usable && shown.indexOf(x.from) >= 0 && shown.indexOf(x.to) >= 0).map((x) => x.days);   /* the same gaps as the table */
      parts.push({ h: t('rp_periods'), rows: rows, lines: g.length >= 2 ? [tf('rp_gaps', { a: Math.round(g.reduce((a, b) => a + b, 0) / g.length), s: Math.min.apply(null, g), l: Math.max.apply(null, g) })] : [] }); }
    const counts = {}; for (let k = 0; k < 90; k++) { const d1 = toISO(addDays(today(), -k)); (state.daily[d1] || []).forEach((x) => { if (x !== 'd_calm' && x !== 'd_happy') counts[x] = (counts[x] || 0) + 1; }); }
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
    const symName = (k) => (k.indexOf('d_disch') === 0 ? t('sym_disch') + ' · ' + t(k) : t(k));
    if (top.length) parts.push({ h: t('rp_sym'), lines: top.map((k) => symName(k) + ': ' + tf('rp_days', { n: counts[k] })) });
    const cis = Object.keys(state.checkins).sort().slice(-3);
    if (cis.length) parts.push({ h: t('rp_ci'), lines: cis.map((k) => fmtD(fromISO(k + '-01'), { month: 'long', year: 'numeric' }) + ': ' + ((state.checkins[k].chips || []).map((c) => t('ci_' + c)).join(', ') || '–')) });
    const mods = []; safe(() => api.summaries(), []).forEach((m) => (m.sections || []).forEach((x) => { if (x && x.lines && x.lines.length) mods.push(x.title + ': ' + x.lines.join('; ')); }));
    if (mods.length) parts.push({ h: t('rp_tools'), lines: mods });
    const qs = []; const g2 = usable().slice(-6);
    if (isPregnant()) qs.push(t('rp_q_preg'));
    if (g2.filter((x) => x > 35).length >= 2) qs.push(t('rp_q_gap'));
    if (rows.some((r) => r.heavy)) qs.push(t('rp_q_heavy'));
    if ((counts.d_cramps || 0) >= 3) qs.push(t('rp_q_pain'));
    qs.push(t('rp_q_any')); parts.push({ h: t('rp_q'), lines: qs.slice(0, 4), q: true });
    if (withNotes) { const nn = Object.keys(state.notes || {}).filter((k) => state.notes[k] && diffDays(fromISO(k), today()) <= 30).sort(); if (nn.length) parts.push({ h: t('rp_notes'), lines: nn.map((k) => fmtD(fromISO(k)) + ': ' + state.notes[k]) }); }
    return { parts: parts, any: rows.length > 0 || top.length > 0 || cis.length > 0 || mods.length > 0 };
  }
  function reportText(r) {
    const L = [t('rp_h')];
    r.parts.forEach((p) => { L.push('', p.h); (p.rows || []).forEach((x) => L.push(fmtD(fromISO(x.d)) + ': ' + (x.bleed == null ? t('rp_t_noend') : tf('rp_t_bled', { n: x.bleed })) + (x.gap == null ? '' : ', ' + tf('rp_t_next', { n: x.gap }) + (x.out ? ' (' + t('rp_out') + ')' : '')) + (x.heavy ? ', ' + t('rp_heavy') : '') + (x.guess ? ' (' + t('rp_guess') + ')' : ''))); p.lines.forEach((l) => L.push((p.q ? '- ' : '') + l)); });
    L.push('', tf('rp_foot', { d: fmtD(today(), { day: 'numeric', month: 'short', year: 'numeric' }) })); return L.join('\n');
  }
  function renderReport(v) {
    const r = reportParts(!!mem.rpNotes); const txt = reportText(r);
    const sec = (p) => '<div class="card rp-sec"><h3>' + esc(p.h) + '</h3>' +
      (p.rows ? '<div class="table-wrap"><table class="rp-table"><thead><tr><th>' + esc(t('rp_col_start')) + '</th><th>' + esc(t('rp_col_bleed')) + '</th><th>' + esc(t('rp_col_gap')) + '</th></tr></thead><tbody>' + p.rows.map((x) => '<tr><td>' + esc(fmtD(fromISO(x.d))) + (x.guess ? ' <span class="small">(' + esc(t('rp_guess')) + ')</span>' : '') + '</td><td class="num">' + (x.bleed == null ? '–' : x.bleed) + (x.heavy ? ' <span class="pill accent">' + esc(t('rp_heavy')) + '</span>' : '') + '</td><td class="num">' + (x.gap == null ? '–' : x.gap) + (x.out ? ' <span class="small">(' + esc(t('rp_out')) + ')</span>' : '') + '</td></tr>').join('') + '</tbody></table></div>' : '') +
      (p.lines.length ? (p.q ? '<ol class="steps">' + p.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ol>' : '<ul class="rp-lines">' + p.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>') : '') + '</div>';
    v.innerHTML = backRow(t('rp_h'), 'me') + '<p class="small">' + esc(t('rp_p')) + '</p>' +
      (r.any ? r.parts.map(sec).join('') : '<div class="card soft"><p>' + esc(t('rp_none')) + '</p></div>') +
      '<div class="list"><label class="item"><span class="body"><strong>' + esc(t('rp_notes_sw')) + '</strong></span><input type="checkbox" id="rp-notes" ' + (mem.rpNotes ? 'checked' : '') + '></label></div>' +
      '<p class="footnote">' + esc(tf('rp_foot', { d: fmtD(today(), { day: 'numeric', month: 'short', year: 'numeric' }) })) + '</p>' +
      (r.any ? '<div class="grid2"><a class="btn" id="rp-send" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" target="_blank" rel="noopener">' + I.users.replace('<svg', '<svg style="width:18px;height:18px"') + ' ' + esc(t('rp_send')) + '</a><button type="button" class="btn" id="rp-copy">' + esc(t('rp_copy')) + '</button></div>' : '');
    wire(v);
    $('#rp-notes', v).addEventListener('change', (e) => { mem.rpNotes = e.target.checked; render(); });
    const cp = $('#rp-copy', v); if (cp) cp.addEventListener('click', () => { try { navigator.clipboard.writeText(txt).then(() => toast(t('rp_copied')), () => toast(t('rp_copy_fail'))); } catch (e) { toast(t('rp_copy_fail')); } });
  }

  /* ---------- move to a new phone: a backup code locked with a PIN she chooses (AES-GCM, key from PBKDF2). The diary never
     leaves the phone unless she copies the code. 150,000 PBKDF2 rounds only slow guessing: a short PIN is weak against someone who
     has the code, so the copy tells her to keep it private and suggests 6 numbers. A lost PIN can't be recovered. ---------- */
  const b64u = {
    enc: (b) => { let x = ''; for (let i = 0; i < b.length; i += 0x8000) x += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(x).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec: (str) => { const x = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4)); const b = new Uint8Array(x.length); for (let i = 0; i < x.length; i++) b[i] = x.charCodeAt(i); return b; }
  };
  const canBackup = () => !!(window.crypto && crypto.subtle && window.TextEncoder);
  async function gz(bytes, back) {
    if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') return null;
    const cs = back ? new DecompressionStream('gzip') : new CompressionStream('gzip'); return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(cs)).arrayBuffer());
  }
  async function pinKey(pin, salt) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function makeBackup(pin) {
    const raw = new TextEncoder().encode(JSON.stringify(state)); const z = await gz(raw, false); const body = z || raw;
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, await pinKey(pin, salt), body));
    const all = new Uint8Array(29 + ct.length); all[0] = z ? 1 : 0; all.set(salt, 1); all.set(iv, 17); all.set(ct, 29);
    return 'SAKHI1.' + b64u.enc(all);
  }
  async function readBackup(code, pin) {
    const m = /^SAKHI1\.([A-Za-z0-9_-]+)$/.exec(String(code || '').replace(/\s+/g, '')); if (!m) throw new Error('format');
    const all = b64u.dec(m[1]); if (all.length < 30) throw new Error('format');
    const pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(17, 29) }, await pinKey(pin, all.slice(1, 17)), all.slice(29)));
    const body = all[0] === 1 ? await gz(pt, true) : pt; const st = JSON.parse(new TextDecoder().decode(body));
    if (!st || typeof st !== 'object' || !st.settings || !Array.isArray(st.events)) throw new Error('format');
    return st;
  }
  const pinOk = (x) => /^\d{4,6}$/.test(x || '');
  function renderBackup(v) {
    const head = backRow(t('bk_h'), 'me') + '<p class="small">' + esc(t('bk_p')) + '</p>';
    if (!canBackup()) { v.innerHTML = head + '<div class="card soft"><p>' + esc(t('bk_na')) + '</p></div>'; wire(v); return; }
    if (state.sample) { v.innerHTML = head + '<div class="card soft"><p>' + esc(t('bk_sample')) + '</p></div>'; wire(v); return; }
    const pinIn = (id, label) => '<label for="' + id + '">' + esc(t(label)) + '</label><input id="' + id + '" type="password" inputmode="numeric" autocomplete="off" maxlength="6" pattern="[0-9]*">';
    v.innerHTML = head +
      '<div class="card bk-card"><h3>' + esc(t('bk_make_h')) + '</h3>' + pinIn('bk-pin', 'bk_pin') + pinIn('bk-pin2', 'bk_pin2') + '<button type="button" class="btn primary block" id="bk-make">' + esc(t('bk_make')) + '</button><div id="bk-out"></div></div>' +
      '<div class="card bk-card"><h3>' + esc(t('bk_restore_h')) + '</h3><label for="bk-code">' + esc(t('bk_paste')) + '</label><textarea id="bk-code" rows="3" autocomplete="off" spellcheck="false"></textarea>' + pinIn('bk-rpin', 'bk_pin_r') + '<button type="button" class="btn block" id="bk-restore">' + esc(t('bk_restore')) + '</button><div id="bk-rout"></div></div>';
    wire(v);
    $('#bk-make', v).addEventListener('click', async () => {
      const a = $('#bk-pin', v).value, b = $('#bk-pin2', v).value; const out = $('#bk-out', v);
      if (!pinOk(a) || a !== b) { out.innerHTML = '<div class="flag">' + esc(t('bk_pin_bad')) + '</div>'; return; }
      try {
        const code = await makeBackup(a);
        out.innerHTML = '<h3>' + esc(t('bk_code_h')) + '</h3><textarea id="bk-the-code" rows="4" readonly spellcheck="false">' + esc(code) + '</textarea><p class="small">' + esc(t('bk_code_p')) + '</p><button type="button" class="btn block" id="bk-copy">' + esc(t('bk_copy')) + '</button>';
        $('#bk-copy', out).addEventListener('click', () => { try { navigator.clipboard.writeText(code).then(() => toast(t('bk_copied')), () => toast(t('rp_copy_fail'))); } catch (e) { toast(t('rp_copy_fail')); } });
      } catch (e) { out.innerHTML = '<div class="flag">' + esc(t('bk_na')) + '</div>'; }
    });
    $('#bk-restore', v).addEventListener('click', async () => {
      const out = $('#bk-rout', v); let st;
      try { st = await readBackup($('#bk-code', v).value, $('#bk-rpin', v).value); } catch (e) { out.innerHTML = '<div class="flag">' + esc(t('bk_wrong')) + '</div>'; return; }
      out.innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('bk_sure')) + '</p><div class="grid2"><button type="button" class="btn" id="bk-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="bk-yes">' + esc(t('bk_yes')) + '</button></div></div>';
      $('#bk-no', out).addEventListener('click', () => { out.innerHTML = ''; });
      $('#bk-yes', out).addEventListener('click', () => { state = Object.assign(defaults(), st); state.settings = Object.assign(defaults().settings, st.settings || {}); state.sample = null; save(); toast(t('bk_done')); setHash('home'); });
    });
  }

  /* ---------- her patterns: what repeats around her period, from her own notes ----------
     Counts of her own entries only, never a diagnosis. A symptom repeats when she noted it from 8 days before to 4 days after most
     of her last periods (3 to 6 periods with notes, guessed dates left out), and not just as often in the middle of her cycles. */
  const PAT_KEYS = ['d_cramps', 'd_headache', 'd_back', 'd_breast', 'd_bloat', 'd_tired', 'd_sleep', 'd_acne', 'd_mood', 'd_anxious', 'd_irritable'];
  function patterns() {
    const sit = state.situation; if (['cycle', 'ttc', 'meno'].indexOf(stageNow()) < 0 || countsOff() || sit.stopped || sit.hysterectomy) return null;   /* not her stage: no card at all */
    const st = starts(); const ap = approxStarts(); const tStr = toISO(today()); const wins = [];
    for (let i = st.length - 1; i >= 0 && wins.length < 6; i--) {
      if (ap[st[i]]) continue; const s = fromISO(st[i]); const days = []; const mid = [];
      for (let r = -8; r <= 4; r++) { const k = toISO(addDays(s, r)); if (k > tStr) break; const got = state.daily[k]; if (got && got.length) days.push({ r: r, got: got }); }
      if (i < st.length - 1) { const nx = fromISO(st[i + 1]); for (let dd = addDays(s, 7); dd <= addDays(nx, -10); dd = addDays(dd, 1)) { const got = state.daily[toISO(dd)]; if (got && got.length) mid.push(got); } }
      if (days.length) wins.push({ days: days, mid: mid });
    }
    if (wins.length < 3) return { n: wins.length, list: [] };
    const need = Math.max(2, Math.ceil(wins.length * 0.6)); const out = [];
    PAT_KEYS.forEach((key) => {
      const firsts = []; let midHits = 0;
      wins.forEach((w) => { const d = w.days.find((x) => x.got.indexOf(key) >= 0); if (d) firsts.push(d.r); if (w.mid.some((g) => g.indexOf(key) >= 0)) midHits++; });
      if (firsts.length < need || midHits * 2 >= firsts.length) return;
      firsts.sort((a, b) => a - b); out.push({ key: key, r: firsts[Math.floor((firsts.length - 1) / 2)], n: firsts.length, of: wins.length });
    });
    out.sort((a, b) => b.n / b.of - a.n / a.of || a.r - b.r);
    return { n: wins.length, list: out.slice(0, 3) };
  }
  const patWhen = (r) => (r <= -2 ? tf('pat_before', { n: -r }) : r === -1 ? t('pat_daybefore') : r === 0 ? t('pat_day1') : tf('pat_dayn', { n: r + 1 }));
  const symMeta = (key) => { for (let i = 0; i < SYM.length; i++) { const x = SYM[i][2].find((y) => y[0] === key); if (x) return { hue: SYM[i][1], ico: x[1] }; } return { hue: 'rose', ico: 'drop' }; };
  function patternsCard() {
    const p = patterns(); if (!p) return '';
    if (!p.list.length) return '<div class="card soft pat-card"><h2 class="hand">' + esc(t('pat_h')) + '</h2><p class="small">' + esc(p.n >= 3 ? t('pat_none') : t('pat_wait')) + '</p></div>';
    return '<div class="card pat-card"><h2 class="hand">' + esc(t('pat_h')) + '</h2><div class="list">' + p.list.map((x) => { const m = symMeta(x.key); return '<div class="item quiet"><span class="ico-sm hue hue-' + m.hue + '">' + sIco(m.ico) + '</span><span class="body"><strong>' + esc(t(x.key)) + '</strong><span>' + esc(patWhen(x.r)) + ' · ' + esc(tf('pat_count', { a: x.n, b: x.of })) + '</span></span></div>'; }).join('') + '</div><p class="small">' + esc(tf('pat_p', { n: p.n })) + '</p></div>';
  }
  function renderTrends(v) {
    const ga = gapsAll().slice(-12);
    const wireAdd = () => { const b = $('#tr-add', v); if (b) b.addEventListener('click', () => openDay(toISO(today()), 'sym')); };
    if (!ga.length) { v.innerHTML = emptyCard(t('no_data'), '<button type="button" class="btn sm primary" id="tr-log">' + esc(t('add_today')) + '</button>') + notedCard(); const lb = $('#tr-log', v); if (lb) lb.addEventListener('click', () => openDay(toISO(today()))); wireAdd(); return; }
    const mx = Math.max(60, Math.max.apply(null, ga.map((x) => Math.min(x.days, 130)))); const h = 120; const hiB = bandHi();
    const bleeds = starts().map(periodLen).filter((n) => n != null);
    const gU = ga.filter((x) => x.usable).map((x) => x.days); const last6 = gU.slice(-6);   /* the counted gaps among the bars above */
    const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
    v.innerHTML = '<div class="card"><h2 class="hand">' + esc(t('gaps12')) + '</h2><div class="bars" role="img" aria-label="' + esc(tf('bars_aria', { list: ga.map((x) => x.days).join(', ') })) + '" style="height:' + h + 'px"><div class="band" style="top:' + (h - (hiB / mx) * h).toFixed(0) + 'px;height:' + (((hiB - 21) / mx) * h).toFixed(0) + 'px"></div><div class="cols">' + ga.map((x, i) => '<div class="col ' + (x.usable ? (i === ga.length - 1 ? 'last' : '') : 'x') + '" style="height:' + ((Math.min(x.days, 130) / mx) * h).toFixed(0) + 'px"></div>').join('') + '</div></div><div class="barlabels">' + ga.map((x) => '<span class="num">' + x.days + '</span>').join('') + '</div><p class="small">' + esc(t('band_label')) + '</p></div>' +
      patternsCard() + notedCard() + '<button type="button" class="btn block rp-btn" data-go="report">' + I.file + ' ' + esc(t('rp_h')) + '</button>' +
      '<div class="card"><h2 class="hand">' + esc(t('stats')) + '</h2><p class="small">' + esc(tf('stats_from', { n: gU.length })) + '</p><div class="statgrid"><div class="stat"><b class="num">' + (avg(gU) || '–') + '</b><span>' + esc(t('avg_gap')) + '</span></div><div class="stat"><b class="num">' + (last6.length ? Math.max.apply(null, last6) - Math.min.apply(null, last6) : '–') + '</b><span>' + esc(t('spread6')) + '</span></div><div class="stat"><b class="num">' + (gU.length ? Math.min.apply(null, gU) : '–') + '</b><span>' + esc(t('shortest')) + '</span></div><div class="stat"><b class="num">' + (gU.length ? Math.max.apply(null, gU) : '–') + '</b><span>' + esc(t('longest')) + '</span></div><div class="stat"><b class="num">' + (avg(bleeds) || '–') + '</b><span>' + esc(t('bleed_days')) + '</span></div><div class="stat"><b class="num">' + starts().length + '</b><span>' + esc(t('cycles_logged')) + '</span></div></div></div>';
    wire(v); wireAdd();
  }

  /* ---------- check-in ---------- */
  function checkinSet() {
    const s0 = state.situation; const age = ageYears();
    if (isPregnant()) return { kind: 'preg', chips: ['nausea', 'swell', 'head', 'heartburn', 'constip', 'back', 'sleep', 'mood', 'pbleed', 'none'], hot: false, more: ['disch', 'itch', 'burn'] };
    if (s0.deliveredOn && diffDays(fromISO(s0.deliveredOn), today()) <= 365) return { kind: 'post', chips: ['lochia', 'stitch', 'breast', 'leak', 'sleep', 'back', 'mood', 'none'], hot: false, more: ['disch', 'itch', 'burn', 'sexpain'] };
    if (isMidlife()) return { kind: 'meno', chips: ['sleep', 'mood', 'joint', 'dry', 'urine', 'palp', 'heavy', 'none'], hot: true, more: ['disch', 'itch', 'burn', 'aftersex'] };
    return { kind: 'cycle', chips: ['hair', 'removal', 'acne', 'thin', 'neck', 'heavy', 'mood', 'none'], hot: true, more: ['disch', 'itch', 'burn', 'sexpain', 'aftersex'] };
  }
  function renderCheckin(v) {
    const mk = monthKey(today()); const set = checkinSet(); const ci = state.checkins[mk] || { chips: [], hot: 'hot_0', note: '' };
    const d = mem.ciDraft && mem.ciDraft.mk === mk ? mem.ciDraft : (mem.ciDraft = { mk: mk, chips: (ci.chips || []).slice(), hot: ci.hot || 'hot_0', note: ci.note || '', more: false });   /* her answers survive a language switch */
    const draw = () => {
      const has = (k) => d.chips.indexOf(k) >= 0;
      const flag = set.kind === 'preg' && (has('pbleed') || (has('head') && has('swell'))) ? t('ci_flag_preg') : (set.kind === 'post' && has('lochia') ? t('ci_flag_post') : (set.kind === 'post' && has('breast') ? t('ci_flag_breast') : ''));
      v.innerHTML = '<div class="backrow">' + backBtn('home') + '<div class="bt"><h1>' + esc(fmtD(today(), { month: 'long' })) + ' ' + esc(t('ci_h')) + '</h1><p class="small">' + esc(t('ci_p')) + '</p></div></div>' +
        '<div class="chips">' + set.chips.map((k) => '<button type="button" class="chip ' + (has(k) ? 'on' : '') + '" data-chip="' + k + '" aria-pressed="' + has(k) + '">' + esc(t('ci_' + k)) + '</button>').join('') + '</div>' +
        (flag ? '<div class="flag urgent" role="alert">' + esc(flag) + '</div>' : '') +
        (set.hot ? '<div class="card"><h3>' + esc(t('ci_hot')) + '</h3><div class="grid4">' + ['hot_0', 'hot_1', 'hot_2', 'hot_3'].map((k) => '<button type="button" class="btn sm ' + (d.hot === k ? 'on' : '') + '" data-hot="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div></div>' : '') +
        '<details ' + (d.more ? 'open' : '') + '><summary>' + esc(t('ci_more')) + '</summary><div class="chips" style="margin-top:8px">' + set.more.map((k) => '<button type="button" class="chip ' + (has(k) ? 'on' : '') + '" data-chip="' + k + '" aria-pressed="' + has(k) + '">' + esc(t('ci_' + k)) + '</button>').join('') + '</div></details>' +
        (state.consent.c4 ? '<div class="card"><label for="ci-note">' + esc(t('ci_note')) + '</label><input id="ci-note" value="' + esc(d.note) + '" placeholder="' + esc(t('ci_note_ph')) + '"><p class="small">' + esc(t('cadence')) + '</p></div>' : '') +
        '<button type="button" class="btn primary block sticky-cta" id="ci-save">' + esc(t('ci_save')) + '</button><p class="footnote">' + esc(t('ci_thanks')) + '</p>';
      wire(v);
      v.querySelectorAll('[data-chip]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.chip; if (k === 'none') d.chips = has('none') ? [] : ['none']; else { d.chips = d.chips.filter((x) => x !== 'none'); const i = d.chips.indexOf(k); if (i >= 0) d.chips.splice(i, 1); else d.chips.push(k); } d.more = v.querySelector('details').open; draw(); }));
      v.querySelectorAll('[data-hot]').forEach((b) => b.addEventListener('click', () => { d.hot = b.dataset.hot; d.more = v.querySelector('details').open; draw(); }));
      const n = $('#ci-note', v); if (n) n.addEventListener('input', (e) => { d.note = e.target.value; });
      $('#ci-save', v).addEventListener('click', () => { mem.ciDraft = null; state.checkins[mk] = { chips: d.chips, hot: set.hot ? d.hot : 'hot_0', note: d.note, at: toISO(today()), kind: set.kind }; if (d.note) state.requests.push({ kind: 'checkin_note', d: toISO(today()), text: d.note }); save(); toast(t('ci_thanks')); setHash('home'); emit('checkin', { quiet: !!flag }); });
    };
    draw();
  }

  /* ---------- learn ---------- */
  const L = (a, k) => a[k + '_' + state.lang] || a[k + '_en'] || '';
  function renderLearn(v) {
    const groups = CONTENT.groups || []; const q = (mem.learnQ || '').trim(); let body;
    if (!groups.length) body = '<div class="card"><p>' + esc(t('loading')) + '</p></div>';
    else if (q) body = searchResults(q, visibleTiles());
    else {
      const tabs = '<div class="tabs"><button type="button" class="' + (mem.learnGroup === 'all' ? 'on' : '') + '" data-g="all">' + esc(t('all')) + '</button>' + groups.map((g) => '<button type="button" class="' + (mem.learnGroup === g.group ? 'on' : '') + '" data-g="' + esc(g.group) + '">' + esc(L(g, 'title')) + '</button>').join('') + '</div>';
      /* "All" shows each group's first three articles; a group tab shows the whole group. */
      if (mem.learnGroup === 'all') body = tabs + groups.map((g) => { const arts = (g.articles || []).map((a) => Object.assign({ group: g.group }, a)); return '<section class="care-sec"><h2>' + esc(L(g, 'title')) + '</h2><div class="list">' + arts.slice(0, 3).map(artHtml).join('') + '</div>' + (arts.length > 3 ? '<button type="button" class="morebtn" data-g="' + esc(g.group) + '">' + esc(tf('see_all_n', { n: arts.length })) + '</button>' : '') + '</section>'; }).join('');
      else body = tabs + '<div class="list">' + allArticles().filter((a) => a.group === mem.learnGroup).map(artHtml).join('') + '</div>';
    }
    v.innerHTML = backRow(t('learn_h'), 'care', false) + searchBox('learn-q', mem.learnQ) + body;
    wire(v); v.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { mem.learnGroup = b.dataset.g; render(); window.scrollTo(0, 0); }));
    wireSearch(v, 'learn-q', 'learnQ');
  }
  function findArticle(key) { const i = key.indexOf('.'); const g = (CONTENT.groups || []).find((x) => x.group === key.slice(0, i)); const a = g && (g.articles || []).find((x) => x.id === key.slice(i + 1)); return a ? Object.assign({ group: g.group }, a) : null; }
  function renderArticle(v, key) {
    const a = findArticle(key); if (!a) { v.innerHTML = '<div class="card"><p>' + esc(t('loading')) + '</p><button type="button" class="btn sm" data-go="learn">' + esc(t('learn')) + '</button></div>'; wire(v); return; }
    const body = L(a, 'body') || []; const sd = L(a, 'see_doctor') || []; const ql = L(a, 'qura_line');
    v.innerHTML = '<div class="row">' + backBtn('learn') + (state.settings.proto ? '<span class="pill muted">' + esc(t('draft')) + '</span>' : '') + '</div><div class="article"><h1>' + esc(L(a, 'title')) + '</h1><p class="lead">' + esc(L(a, 'summary')) + '</p><div class="bodytext">' + body.map((p) => (p.startsWith('- ') ? '<p class="bullet">' + esc(p.slice(2)) + '</p>' : '<p>' + esc(p) + '</p>')).join('') + '</div>' +
      (sd.length ? '<div class="card dark"><h3>' + esc(t('see_doctor')) + '</h3><ul>' + sd.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '') +
      (ql ? '<div class="card ok"><h3 style="color:var(--ok)">' + esc(t('qura_can')) + '</h3><p>' + esc(ql) + '</p></div>' : '') +
      '<button type="button" class="btn primary block" id="art-ask">' + esc(t('ask_qura')) + '</button>' +
      relatedHtml(a) + (a.sources && a.sources.length ? '<details><summary>' + esc(t('sources')) + '</summary><p class="sources">' + a.sources.map(esc).join(' · ') + '</p></details>' : '') + '</div>';
    wire(v); $('#art-ask', v).addEventListener('click', () => { state.askTopics = [L(a, 'title')]; save(); setHash('ask'); });
    v.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => openAnswer(b.dataset.ans)));
    /* Nine seconds on a guide counts as reading it. */
    clearTimeout(readTm); readTm = setTimeout(() => { if (route() === 'a-' + key) emit('read', { key: key }); }, 9000);
  }
  let readTm = null;

  /* ---------- help ---------- */
  const HELPLINES = [['112', 'Emergency, any kind', 'आपातकाल, किसी भी तरह का'], ['108', 'Ambulance', 'एम्बुलेंस'], ['102', 'Ambulance for pregnant women and children', 'गर्भवती महिलाओं और बच्चों के लिए एम्बुलेंस'], ['104', 'Health advice helpline', 'स्वास्थ्य सलाह हेल्पलाइन'], ['14416', 'Tele-MANAS, mental health, 24×7', 'Tele-MANAS, मानसिक स्वास्थ्य, 24×7'], ['1800-891-4416', 'Tele-MANAS toll-free, if 14416 does not connect', 'Tele-MANAS टोल-फ़्री, अगर 14416 न लगे'], ['181', 'Women Helpline', 'महिला हेल्पलाइन'], ['1098', 'Childline, under 18', 'Childline, 18 से कम'], ['1097', 'HIV and STI helpline', 'HIV और STI हेल्पलाइन']];
  function renderHelp(v) {
    const sec = (title, items, cls) => '<div class="card ' + (cls || '') + '"><h3' + (String(cls || '').indexOf('dark') === 0 ? '' : ' style="color:var(--accent)"') + '>' + esc(title) + '</h3><ul>' + items.map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul></div>';
    v.innerHTML = '<h1>' + esc(t('help_h')) + '</h1><p class="small">' + esc(t('same_for_all')) + '</p>' +
      '<div class="card doc-card"><h2>' + esc(t('doc_h')) + '</h2><p class="small">' + esc(t('doc_p')) + '</p><button type="button" class="btn primary block" data-ask="">' + I.steth + ' ' + esc(t('doc_b')) + '</button>' + (canSave() ? '<button type="button" class="linkbtn" data-go="report">' + esc(t('rp_show')) + '</button>' : '') + '</div>' +
      sec(t('call_now'), ['s1a', 's1b', 's1c'], 'dark urgent').replace(/<\/div>$/, '<button type="button" class="btn sos-open" id="sos-btn">' + esc(t('em_numbers')) + '</button></div>') + sec(t('today_if'), ['s2a', 's2b', 's2c']) + sec(t('weeks2'), ['s3a', 's3b', 's3c', 's3d']) + sec(t('week_if'), ['s4a', 's4b', 's4c']) + sec(t('under18'), ['s5a', 's5b']) + sec(t('mood'), ['s6a', 's6b']) +
      (state.stage === 'app' ? '<button type="button" class="action" data-go="tell"><span class="ico accent">' + I.person + '</span><span class="body"><strong>' + esc(t('tell')) + '</strong><span class="small">' + esc(t('tell_sub')) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' : '') + tourMenuHtml();
    wire(v); wireTourMenu(v); const so = $('#sos-btn', v); if (so) so.addEventListener('click', openSOS); v.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => { const n = b.dataset.copy; const done = () => toast(t('copied') + ' ' + n); try { navigator.clipboard.writeText(n).then(done, () => { const r = document.createRange(); r.selectNodeContents(b.parentElement.querySelector('.n')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }); } catch (e) { toast(n); } }));
  }
  function renderTell(v) {
    const d = { about: 't_bleed', msg: '' };
    v.innerHTML = '<div class="row">' + backBtn('help') + '<h1 style="font-size:24px">' + esc(t('tell_h')) + '</h1></div><div class="card warn"><p class="small" style="color:var(--fg)">' + esc(t('tell_p')) + '</p></div><div class="card"><label>' + esc(t('tell_about')) + '</label><div class="chips">' + ['t_bleed', 't_pain', 't_missed', 't_mood', 't_other'].map((k) => '<button type="button" class="chip ' + (d.about === k ? 'on' : '') + '" data-about="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div><label for="tell-msg">' + esc(t('tell_msg')) + '</label><textarea id="tell-msg"></textarea><button type="button" class="btn primary block" id="tell-send">' + esc(t('tell_send')) + '</button></div><div id="tell-out"></div>';
    wire(v); v.querySelectorAll('[data-about]').forEach((b) => b.addEventListener('click', () => { d.about = b.dataset.about; v.querySelectorAll('[data-about]').forEach((x) => x.classList.toggle('on', x === b)); }));
    $('#tell-send', v).addEventListener('click', () => { const ref = 'QS-' + Math.floor(1000 + Math.random() * 9000); state.requests.push({ kind: 'tell', about: d.about, text: $('#tell-msg', v).value, d: toISO(today()), ref: ref }); save(); $('#tell-out', v).innerHTML = '<div class="card ok"><p><strong>' + esc(t('tell_ok')) + ' ' + ref + '</strong></p><p class="small" style="color:var(--ok)">' + esc(t('tell_ok2')) + '</p></div>'; });
  }
  function renderAsk(v) {
    if (mem.teen) { v.innerHTML = '<div class="row">' + backBtn('home') + '<h1 style="font-size:24px">' + esc(t('ask_teen_h')) + '</h1></div><div class="card"><p>' + esc(t('ask_teen_p')) + '</p><div class="helpline"><div style="min-width:0"><div class="n num">1098</div><div class="what">Childline</div></div></div></div><div class="list"><button type="button" class="item" data-go="help"><span class="body"><strong>' + esc(t('safety')) + '</strong></span><span class="chev">' + I.chev + '</span></button>' + (modRoute('teen') ? '<button type="button" class="item" data-go="teen"><span class="body"><strong>' + esc(t('teen_u18')) + '</strong></span><span class="chev">' + I.chev + '</span></button>' : '') + '</div>'; wire(v); return; }
    const dr = mem.askDraft || (mem.askDraft = { name: (signedIn() && acct.name) || '', phone: signedIn() ? natPhone(acct.phone) : '', topic: (state.askTopics || []).join(', '), time: 'morning' });
    v.innerHTML = '<div class="row">' + backBtn('home') + '<h1 style="font-size:24px">' + esc(t('ask_h')) + '</h1></div><p>' + esc(t('ask_p')) + '</p><form class="card" id="ask-form"><label for="ask-name">' + esc(t('name')) + '</label><input id="ask-name" value="' + esc(dr.name) + '"><label for="ask-phone">' + esc(t('phone')) + '</label><input id="ask-phone" inputmode="tel" required value="' + esc(dr.phone) + '"><label>' + esc(t('best_time')) + '</label><div class="grid3">' + ['morning', 'afternoon', 'evening'].map((k) => '<button type="button" class="btn sm ' + (dr.time === k ? 'on' : '') + '" data-time="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div><label for="ask-topic">' + esc(t('topic')) + '</label><input id="ask-topic" value="' + esc(dr.topic) + '"><button type="submit" class="btn primary block">' + esc(t('ask_send')) + '</button></form><div id="ask-out"></div>';
    wire(v); let time = dr.time; v.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', () => { time = dr.time = b.dataset.time; v.querySelectorAll('[data-time]').forEach((x) => x.classList.toggle('on', x === b)); }));
    [['ask-name', 'name'], ['ask-phone', 'phone'], ['ask-topic', 'topic']].forEach((x) => { const el = $('#' + x[0], v); el.addEventListener('input', () => { dr[x[1]] = el.value; }); });
    /* Booking a call never depends on sharing. Before anything would leave the phone she sees exactly what, and says yes separately. */
    const sendAsk = (lead, share) => { const ref = 'QC-' + Math.floor(1000 + Math.random() * 9000); if (share && !state.consent.c4) state.consent.c4 = toISO(today()); state.leads.push(Object.assign({ ref: ref, share: !!share }, lead)); state.askTopics = []; mem.askDraft = null; save(); emit('ask', {}); $('#ask-out', v).innerHTML = '<div class="card ok"><p><strong>' + esc(t('ask_ok')) + ' ' + ref + '</strong></p><p class="small" style="color:var(--ok)">' + esc(t('ask_ok2')) + '</p><a class="btn sm" href="https://quranutrition.com/book-consultation" target="_blank" rel="noopener">' + esc(t('book_link')) + '</a></div>'; };
    $('#ask-form', v).addEventListener('submit', (e) => { e.preventDefault(); const lead = { name: $('#ask-name', v).value, phone: $('#ask-phone', v).value, time: time, topic: $('#ask-topic', v).value, d: toISO(today()) };
      if (state.stage !== 'app') { sendAsk(lead, false); return; }
      sheet('<h2>' + esc(t('sh_h')) + '</h2><p><strong>' + esc(t('sh_will')) + '</strong></p><ul class="ob-ul">' + ['sh_i1', 'sh_i2', 'sh_i3', 'sh_i4'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul><p class="small">' + esc(t('sh_not')) + '</p><div class="sheet-foot"><div class="stack" style="gap:8px"><button type="button" class="btn primary block" id="sh-yes">' + esc(t('sh_yes')) + '</button><button type="button" class="btn block" id="sh-no">' + esc(t('sh_no')) + '</button></div></div>', (sh) => {
        $('#sh-yes', sh).addEventListener('click', () => { closeSheet(); sendAsk(lead, true); }); $('#sh-no', sh).addEventListener('click', () => { closeSheet(); sendAsk(lead, false); });
      });
    });
  }

  /* ---------- me: situation, tools, settings ---------- */
  function renderMe(v) {
    const sit = state.situation; const tog = (key, label, desc, dateKey) => '<label class="item"><span class="body"><strong>' + esc(t(label)) + '</strong><span>' + esc(t(desc)) + (dateKey && sit[dateKey] ? ' · ' + esc(t('since')) + ' ' + esc(fmtD(fromISO(sit[dateKey]), { day: 'numeric', month: 'short', year: 'numeric' })) : '') + '</span></span><input type="checkbox" data-sit="' + key + '" ' + (sit[key] ? 'checked' : '') + '></label>';
    const sw = (key, label, desc) => '<label class="item"><span class="body"><strong>' + esc(t(label)) + '</strong><span>' + esc(t(desc)) + '</span></span><input type="checkbox" data-set="' + key + '" ' + (state.settings[key] ? 'checked' : '') + '></label>';
    const cons = (k, label) => '<div class="item quiet"><span class="body"><strong>' + esc(t(label)) + '</strong><span>' + (state.consent[k] ? esc(t('given')) + ' ' + esc(fmtD(fromISO(state.consent[k]), { day: 'numeric', month: 'short', year: 'numeric' })) : '—') + '</span></span><button type="button" class="btn sm" data-cons="' + k + '">' + esc(state.consent[k] ? t('withdraw') : t('give')) + '</button></div>';
    const B = window.SakhiAndroid; const canDisguise = !!(B && B.setDisguise);
    v.innerHTML = backRow(t('me_h'), 'home', false) + acctItem() + '<h2>' + esc(t('situation')) + '</h2><p class="small">' + esc(t('sit_p2')) + '</p><div class="list">' + tog('pregnant', 'pregnant', 'pregnant_d', 'pregnantSince') + tog('breastfeeding', 'bf', 'bf_d', 'deliveredOn') + tog('hormones', 'hormones', 'horm_d', 'hormonesSince') + tog('pcos', 'pcos', 'pcos_d') + tog('thyroid', 'thyroid', 'thyroid_d') + tog('hysterectomy', 'hyst', 'hyst_d') + tog('stopped', 'stopped', 'stopped_d') + tog('midlife', 'sit_mid', 'sit_mid_d') + tog('planning', 'planning', 'planning_d') + '</div>' +
      runHook('me', [api], true) +
      '<h2>' + esc(t('discretion')) + '</h2><div class="list" id="me-privacy">' + sw('discreet', 'discreet', 'discreet_d') + sw('shared', 'shared', 'shared_d') +
      '<label class="item"><span class="body"><strong>' + esc(t('applock')) + '</strong><span>' + esc(t('applock_d')) + '</span></span><input type="checkbox" id="me-lock" ' + (state.settings.pinHash ? 'checked' : '') + '></label>' +
      (canDisguise ? '<label class="item"><span class="body"><strong>' + esc(t('disguise')) + '</strong><span>' + esc(t('disguise_d')) + '</span></span><input type="checkbox" id="me-disguise" ' + (safe(() => B.isDisguised(), false) ? 'checked' : '') + '></label>' : '') +
      '</div><p class="small">' + esc(t('pin_note')) + '</p>' +
      (B && B.schedule ? '<h2>' + esc(t('notif_sec')) + '</h2><div class="list"><label class="item"><span class="body"><strong>' + esc(t('notif_h')) + '</strong><span>' + esc(t('notif_d')) + '</span></span><input type="checkbox" id="me-notif" ' + (state.settings.notify ? 'checked' : '') + '></label></div><button type="button" class="btn sm" id="me-notif-test">' + esc(t('notif_test_btn')) + '</button>' +
        /* Android 12+ rings reminders up to an hour late unless exact alarms are allowed for the app */
        (state.settings.notify && B.canExactAlarms && !safe(() => B.canExactAlarms(), true) ? '<div class="card soft" style="gap:6px"><p class="small" style="color:var(--fg)">' + esc(t('notif_exact_p')) + '</p><button type="button" class="btn sm" style="align-self:flex-start" id="me-exact">' + esc(t('notif_exact_b')) + '</button></div>' : '') : '') +
      '<h2>' + esc(t('consent_data')) + '</h2><div class="list">' + cons('c4', 'c4') + '</div>' +
      '<div class="list"><button type="button" class="item" data-go="report"><span class="ico-sm hue hue-sky">' + I.file + '</span><span class="body"><strong>' + esc(t('rp_h')) + '</strong><span>' + esc(t('rp_entry_s')) + '</span></span><span class="chev">' + I.chev + '</span></button><button type="button" class="item" data-go="backup"><span class="ico-sm hue hue-teal">' + I.lock + '</span><span class="body"><strong>' + esc(t('bk_h')) + '</strong><span>' + esc(t('bk_entry_s')) + '</span></span><span class="chev">' + I.chev + '</span></button></div><div class="grid2"><button type="button" class="btn" id="me-export">' + esc(t('export')) + '</button><button type="button" class="btn danger" id="me-del">' + esc(t('delete_all')) + '</button></div><div id="me-out"></div><p class="small">' + esc(t('delete_note')) + '</p>' +
      (state.sample || state.settings.proto ? '<h2>' + esc(t('demo_h')) + '</h2><p class="small">' + esc(t('demo_p')) + '</p><div class="grid2">' + ['priya', 'asha', 'meera', 'sunita', 'kamla'].map((id) => '<button type="button" class="btn sm" data-demo="' + id + '">' + esc(t('sample_' + id)) + '</button>').join('') + (ROUTES['docportal'] ? '<button type="button" class="btn sm" data-go="docportal">' + esc(t('demo_doc')) + '</button>' : '') + '</div><button type="button" class="btn ghost block" id="demo-welcome">' + esc(t('demo_welcome')) + '</button>' : '') +
      '<h2>' + esc(t('appearance')) + '</h2><div class="chips" role="group" aria-label="' + esc(t('appearance')) + '">' + [['light', 'theme_light'], ['dark', 'theme_dark'], ['system', 'theme_system']].map((x) => '<button type="button" class="chip' + ((state.settings.theme || 'light') === x[0] ? ' on' : '') + '" data-theme-pick="' + x[0] + '" aria-pressed="' + ((state.settings.theme || 'light') === x[0]) + '">' + esc(t(x[1])) + '</button>').join('') + '</div>' +
      (api.art ? '<h2>' + esc(t('look_h')) + '</h2><div class="looks" role="group" aria-label="' + esc(t('look_h')) + '">' + [0, 1, 2, 3].map((n) => '<button type="button" class="look' + ((state.settings.look | 0) === n ? ' on' : '') + '" data-look="' + n + '" aria-pressed="' + ((state.settings.look | 0) === n) + '" aria-label="' + esc(tf('look_n', { n: n + 1 })) + '">' + api.art.sakhi({ pose: 'calm', look: n }) + '</button>').join('') + '</div>' : '') +
      tourMenuHtml() + '<div class="list">' + sw('toursAuto', 'tours_auto', 'tours_auto_d') + sw('tourVoice', 'tour_voice', 'tour_voice_d') + '</div><button type="button" class="btn sm" id="me-tips">' + esc(t('tours_again')) + '</button>' +
      '<h2>' + esc(t('proto_h')) + '</h2><div class="list">' + sw('proto', 'protolabels', 'protolabels_d') + '</div><p class="small">' + esc(t('notice_text')) + '</p><p class="small">' + esc(t('grievance')) + '</p>';
    wire(v);
    /* Pregnancy and a birth carry the dates every count depends on, so these switches open the stage sheet, which asks for
       them: a tick never invents a date and an untick never deletes one she gave. Unticking breastfeeding keeps the birth
       date; unticking hormones keeps when they started and notes when they stopped, so those months stay out of her averages. */
    v.querySelectorAll('[data-sit]').forEach((c) => c.addEventListener('change', () => {
      const k = c.dataset.sit;
      if (k === 'pregnant') { c.checked = !c.checked; openStage(c.checked ? undefined : 'preg'); return; }
      if (k === 'breastfeeding' && c.checked && !sit.deliveredOn) { c.checked = false; openStage('post'); return; }
      sit[k] = c.checked;
      if (k === 'hormones') { if (c.checked) { if (isISO(sit.hormonesSince) && isISO(sit.hormonesUntil)) addSpan({ k: 'horm', a: sit.hormonesSince, b: sit.hormonesUntil }); if (!sit.hormonesSince || sit.hormonesUntil) sit.hormonesSince = toISO(today()); delete sit.hormonesUntil; } else if (sit.hormonesSince) sit.hormonesUntil = toISO(today()); }
      save(); render();
    }));
    v.querySelectorAll('[data-set]').forEach((c) => c.addEventListener('change', () => { state.settings[c.dataset.set] = c.checked; save(); render(); if (c.dataset.set === 'shared') sharedPoke(); }));
    v.querySelectorAll('[data-cons]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.cons; state.consent[k] = state.consent[k] ? false : toISO(today()); save(); render(); }));
    $('#me-lock', v).addEventListener('change', (e) => { e.target.checked = !!state.settings.pinHash; pinSheet(state.settings.pinHash ? 'off' : 'set'); });
    const dg = $('#me-disguise', v); if (dg) dg.addEventListener('change', (e) => { safe(() => B.setDisguise(e.target.checked)); toast(t('disguise_done')); });
    const whenAllowed = (fn) => { window.__sakhiNotify = (ok) => { if (ok) fn(); else toast(t('notif_denied')); render(); }; if (safe(() => B.canNotify(), false)) window.__sakhiNotify(true); else safe(() => B.askNotify()); };
    const nt = $('#me-notif', v); if (nt) nt.addEventListener('change', (e) => { if (!e.target.checked) { state.settings.notify = false; save(); return; } e.target.checked = false; whenAllowed(() => { state.settings.notify = true; save(); toast(t('notif_on')); }); });
    const mex = $('#me-exact', v); if (mex) mex.addEventListener('click', () => safe(() => B.askExactAlarms()));   /* back from the setting: the app re-sends the alarms on resume */
    const ntt = $('#me-notif-test', v); if (ntt) ntt.addEventListener('click', () => whenAllowed(() => { safe(() => B.testNotify(notifBrand(), state.settings.discreet ? t('d_reminder') : t('notif_test'))); toast(t('notif_test_sent')); }));
    v.querySelectorAll('[data-theme-pick]').forEach((b) => b.addEventListener('click', () => { state.settings.theme = b.dataset.themePick; save(); render(); }));
    v.querySelectorAll('[data-look]').forEach((b) => b.addEventListener('click', () => { state.settings.look = +b.dataset.look; save(); render(); }));
    $('#me-tips', v).addEventListener('click', () => { state.tours = {}; state.tourDay = null; save(); toast(t('tours_again_done')); render(); });
    wireTourMenu(v);
    v.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => { const keep = Object.assign({}, state.settings); loadSample(b.dataset.demo); state.settings = Object.assign(state.settings, keep); save(); toast(t('sample_note')); setHash('home'); }));
    const dw = $('#demo-welcome', v); if (dw) dw.addEventListener('click', wipeAll);
    runHook('afterMe', [v, api]);
    $('#me-export', v).addEventListener('click', () => { $('#me-out', v).innerHTML = '<textarea readonly style="min-height:160px;font-size:13px">' + esc(JSON.stringify(state, null, 1)) + '</textarea>'; });
    $('#me-del', v).addEventListener('click', () => { $('#me-out', v).innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('delete_sure')) + '</p><div class="grid2"><button type="button" class="btn" id="del-no">' + esc(t('cancel')) + '</button><button type="button" class="btn primary" id="del-yes">' + esc(t('yes_delete')) + '</button></div></div>'; $('#del-no', v).addEventListener('click', () => { $('#me-out', v).innerHTML = ''; }); $('#del-yes', v).addEventListener('click', () => { wipeAll(); }); });
  }

  /* ---------- gated tools ---------- */
  const gate = (key) => (state.settings.proto ? '<span class="pill">' + esc(t('gated')) + '</span>' : '');
  const backRow = (title, to, gated) => '<div class="backrow">' + backBtn(to || 'care') + '<div class="bt"><h1>' + esc(title) + '</h1>' + (gated === false ? '' : gate()) + '</div></div>';
  function renderPattern(v) {
    const g = usable().slice(-6); const cis = lastCheckins(6); const longGaps = g.filter((x) => x > bandHi()).length; const hair = cis.filter((c) => (c.chips || []).includes('hair')).length; const heavy = cis.filter((c) => (c.chips || []).includes('heavy')).length;
    /* Pain that stopped her day ("pain_3" on a period's details) in 2 or more of her last 6 periods; nothing logged = no data. */
    const st6 = starts().slice(-6); const startEv = (d) => state.events.find((e) => e.t === 'start' && e.d === d) || {}; const painKnown = st6.filter((d) => startEv(d).pain).length; const painBad = st6.filter((d) => startEv(d).pain === 'pain_3').length;
    const painSt = painKnown ? (painBad >= 2 ? 'pc_seen' : 'pc_not') : 'pc_nodata'; const pq = mem.pcQ || (mem.pcQ = {}); const q1 = state.situation.pcos ? 'y' : (pq.q1 || '');
    const yn = (k, cur) => '<span class="row">' + ['y', 'n'].map((a) => '<button type="button" class="btn sm' + (cur === a ? ' on' : '') + '" data-pcq="' + k + '" data-v="' + a + '" aria-pressed="' + (cur === a) + '">' + esc(t(a === 'y' ? 'yes' : 'no')) + '</button>').join('') + '</span>';
    const enough = g.length >= 3 && cis.length >= 2; let status = 'pc_nodata'; if (enough) status = longGaps >= 2 && hair >= 2 ? 'pc_seen' : (longGaps >= 2 ? 'pc_gaps' : (hair >= 2 ? 'pc_hair' : 'pc_not'));
    const pillCls = status === 'pc_seen' ? 'accent' : (status === 'pc_not' ? 'ok' : (status === 'pc_nodata' ? 'muted' : ''));
    v.innerHTML = backRow(t('pc_h')) + '<p class="small">' + esc(t('pc_p')) + ' ' + esc(t('pc_updated')) + ' ' + esc(fmtD(today())) + '.</p>' +
      '<div class="card"><div class="row spread"><h3>' + esc(t('pc_pmos')) + '</h3><span class="pill ' + pillCls + '">' + esc(t(status)) + '</span></div><p>' + esc(tf('pc_detail', { g: longGaps, n: g.length, h: hair })) + '</p><p class="small">' + esc(t('pc_causes')) + '</p><div class="row spread card soft" style="padding:10px 12px"><span class="small">' + esc(t('pc_verdict')) + '</span><span class="small" style="color:var(--gold-text);font-weight:600">' + esc(t('pending')) + '</span></div></div>' +
      '<div class="card"><div class="row spread"><span>' + esc(t('pc_thy')) + '</span><span class="pill muted">' + esc(t('pc_nodata')) + '</span></div><div class="row spread"><span>' + esc(t('pc_heavy')) + '</span><span class="pill ' + (heavy >= 2 ? 'accent' : 'ok') + '">' + esc(heavy >= 2 ? t('pc_seen') : t('pc_not')) + '</span></div><div class="row spread"><span>' + esc(t('pc_pain')) + '</span><span class="pill ' + (painSt === 'pc_seen' ? 'accent' : (painSt === 'pc_not' ? 'ok' : 'muted')) + '">' + esc(t(painSt)) + '</span></div>' + (painSt === 'pc_seen' ? '<p class="small">' + esc(tf('pc_pain_d', { k: painBad, n: st6.length })) + '</p>' + (modRoute('selfcheck-endo') ? '<button type="button" class="btn sm" style="align-self:flex-start" data-go="selfcheck-endo">' + esc(t('pc_pain_go')) + '</button>' : '') : '') + '</div>' +
      '<div class="card"><div class="row spread"><span style="flex:1">' + esc(t('pc_q1')) + '</span>' + yn('q1', q1) + '</div><div class="row spread"><span style="flex:1">' + esc(t('pc_q2')) + '</span>' + yn('q2', pq.q2 || '') + '</div>' + (pq.q2 === 'y' && !isPregnant() && !state.situation.breastfeeding ? '<p class="small" style="color:var(--fg)">' + esc(t('pc_q2_y')) + '</p>' : '') + '</div>' +
      '<div class="grid2"><button type="button" class="btn primary" id="pc-ask">' + esc(t('pc_ask')) + '</button><button type="button" class="btn" data-go="learn">' + esc(t('why')) + '</button></div><p class="footnote">' + esc(t('pc_rule')) + '</p>';
    wire(v); $('#pc-ask', v).addEventListener('click', () => { state.askTopics = [t('pc_pmos')]; save(); setHash('ask'); });
    /* "Has a doctor told you that you have PMOS?" is the PMOS line on the Me page; the nipple question stays on this screen only. */
    v.querySelectorAll('[data-pcq]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.pcq, a = b.dataset.v; if (k === 'q1') { if (canSave()) { state.situation.pcos = a === 'y'; save(); } pq.q1 = a; } else pq.q2 = pq.q2 === a ? '' : a; render(); }));
  }
  function renderFertile(v) {
    const fi = fertileInfo();
    let body = '';
    if (!fi) body = '<div class="card"><p>' + esc(t('fe_hidden')) + '</p><button type="button" class="btn sm" data-go="learn">' + esc(t('learn')) + '</button></div>';
    else {
      const mn = fi.mn, mx = fi.mx; const ovLo = fi.eggFrom, ovHi = fi.eggTo; const fLo = fi.from, fHi = fi.to; const days = []; for (let d = addDays(fLo, -2); d <= addDays(fHi, 2); d = addDays(d, 1)) days.push(d);
      const strip = state.strips[toISO(today())] || '';
      body = '<div class="card"><div class="row spread small"><span>' + esc(t('cycle_day')) + ' ' + cycleDay() + '</span><span class="num">' + mn + '–' + mx + ' ' + esc(t('days')) + '</span></div><p class="lead">' + esc(t('fe_likely')) + ': <span class="hl">' + esc(fmtRange(fLo, fHi)) + '</span></p><p>' + esc(t('fe_egg')) + ' <strong>' + esc(fmtRange(ovLo, ovHi)) + '</strong></p><div class="cal" style="grid-template-columns:repeat(7,minmax(0,1fr))">' + days.map((d) => '<span class="day num ' + (d >= ovLo && d <= ovHi ? 'bleed light' : (d >= fLo && d <= fHi ? 'range' : '')) + (toISO(d) === toISO(today()) ? ' today' : '') + '" style="height:34px;font-size:12px">' + d.getDate() + '</span>').join('') + '</div><p class="small">' + esc(t('fe_note')) + '</p><div class="card soft" style="padding:10px 12px"><p class="small" style="color:var(--fg);font-weight:500">' + esc(t('no_contra')) + '</p></div></div>' +
        '<div class="card"><h3>' + esc(t('fe_strip')) + '</h3><div class="grid3">' + [['positive', 'positive'], ['negative', 'negative'], ['', 'not_taken']].map((x) => '<button type="button" class="btn sm ' + (strip === x[0] && (strip || x[0] === '') ? 'on' : '') + '" data-strip="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '</div><p class="small">' + esc(t('fe_strip_note')) + '</p></div>' +
        '<div class="card dark"><h3>' + esc(t('fe_confirm')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(t('fe_confirm_p')) + '</p><button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none" data-go="ask">' + esc(t('qura_b')) + '</button></div>';
    }
    v.innerHTML = backRow(t('fe_h')) + '<p class="small">' + esc(t('fe_p')) + '</p>' + body; wire(v);
    v.querySelectorAll('[data-strip]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.strip) state.strips[toISO(today())] = b.dataset.strip; else delete state.strips[toISO(today())]; save(); render(); }));
  }
  function renderMidlife(v) {
    const age = ageYears(); const var7 = midlifeVar7();
    const cycleOff = state.situation.pcos || state.situation.hormones || state.situation.hysterectomy; const stage = midlifeStage();
    const cis = lastCheckins(6); const cnt = (f) => cis.filter(f).length; const hot = cnt((c) => c.hot && c.hot !== 'hot_0'), sleep = cnt((c) => (c.chips || []).includes('sleep')), mood = cnt((c) => (c.chips || []).includes('mood')), heavy = cnt((c) => (c.chips || []).includes('heavy')); const night = cnt((c) => c.hot === 'hot_3');
    const meter = (l, n) => '<div class="meter"><span class="lbl">' + esc(t(l)) + '</span><div class="track"><div class="fill" style="width:' + Math.round((n / 6) * 100) + '%"></div></div><span class="v num">' + n + '</span></div>';
    const msg = age != null && age < 40 && !state.situation.stopped ? t('ml_young') : (cycleOff ? t('ml_pcos_off') : (stage === 2 ? t('ml_late') : (stage === 1 ? tf('ml_early', { n: var7 }) : t('ml_none'))));
    v.innerHTML = backRow(t('ml_h')) + '<p class="small">' + (age != null ? esc(t('me')) + ' · ' + age + ' · ' : '') + esc(t('ml_p')) + '</p>' +
      '<div class="card"><h3>' + esc(t('ml_where')) + '</h3><div class="timeline"><div class="seg" style="left:0;width:25%;background:var(--peach);border-radius:7px 0 0 7px"></div><div class="seg" style="left:25%;width:25%;background:var(--accent-2);opacity:0.6"></div><div class="seg" style="left:50%;width:25%;background:var(--accent-2)"></div><div class="seg" style="left:75%;width:25%;background:var(--accent);border-radius:0 7px 7px 0"></div><div class="mark" style="left:' + (12.5 + stage * 25) + '%"></div></div><div class="tl-labels">' + ['ml_1', 'ml_2', 'ml_3', 'ml_4'].map((k, i) => '<span class="' + (i === stage ? 'on' : '') + '">' + esc(t(k)) + '</span>').join('') + '</div><p>' + esc(msg) + '</p><p class="small">' + esc(t('ml_pcos_off')) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('ml_logged')) + '</h3>' + meter('ml_hot', hot) + meter('ml_sleep', sleep) + meter('ml_mood', mood) + meter('ml_heavy', heavy) + '</div>' +
      (night >= 1 ? '<div class="card dark"><p class="small" style="color:var(--dark-text)">' + esc(t('ml_hrt')) + '</p></div>' : '') +
      '<div class="grid2"><button type="button" class="btn primary" data-go="ask">' + esc(t('qura_b')) + '</button><button type="button" class="btn" data-go="learn">' + esc(t('after35')) + '</button></div>';
    wire(v);
  }
  function renderPregnancy(v) {
    const sit = state.situation; if (!sit.pregnant) { v.innerHTML = backRow(t('pw_visits')) + '<div class="card"><p>' + esc(t('pw_set')) + '</p>' + (canSave() ? '<button type="button" class="btn sm" id="pw-preg">' + esc(t('preg_yes_b')) + '</button>' : '') + '</div>'; wire(v); const pp = $('#pw-preg', v); if (pp) pp.addEventListener('click', () => openStage('preg')); return; }
    /* No date yet: no week number and nothing highlighted, just the visits and a way to add the date. */
    const pi = pregInfo(); const weeks = pi ? pi.weeks : null; const pct = pi ? clamp((weeks / 40) * 100, 1, 99) : 0; const tri = !pi ? -1 : (weeks < 14 ? 0 : (weeks < 28 ? 1 : 2));
    v.innerHTML = backRow(pi ? t('pw_h') + ' ' + weeks : t('pw_visits')) + '<p class="small">' + esc(t('pw_p')) + '</p>' +
      (pi ? '' : '<div class="card"><p>' + esc(t('preg_set_date')) + '</p><button type="button" class="btn sm primary" id="pw-date" style="align-self:flex-start">' + esc(t('preg_date_b')) + '</button></div>') +
      '<div class="card">' + (pi ? '<div class="timeline"><div class="seg" style="left:0;width:35%;background:var(--accent-2);opacity:0.6;border-radius:7px 0 0 7px"></div><div class="seg" style="left:35%;width:35%;background:var(--accent-2)"></div><div class="seg" style="left:70%;width:30%;background:var(--accent);border-radius:0 7px 7px 0"></div><div class="mark" style="left:' + pct.toFixed(0) + '%"></div></div><div class="tl-labels" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ['pw_t1', 'pw_t2', 'pw_t3'].map((k, i) => '<span class="' + (i === tri ? 'on' : '') + '">' + esc(t(k)) + '</span>').join('') + '</div>' : '') + '<ul>' + ['pw_v1', 'pw_v2', 'pw_v3', 'pw_v4'].map((k, i) => '<li' + (weeks != null && ((i === 0 && weeks < 12) || (i === 1 && weeks >= 14 && weeks <= 26) || (i === 2 && weeks >= 28 && weeks <= 34) || (i === 3 && weeks >= 36)) ? ' style="font-weight:600;color:var(--fg)"' : '') + '>' + esc(t(k)) + '</li>').join('') + '</ul></div>' +
      '<div class="card"><h3>' + esc(t('pw_ask')) + '</h3><ul>' + ['pw_a1', 'pw_a2', 'pw_a3', 'pw_a4', 'pw_a5'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul><p class="small">' + esc(t('pw_gov')) + '</p></div>' +
      '<div class="card"><h3>' + esc(t('pw_moves')) + '</h3><p class="small">' + esc(t('pw_moves_p')) + '</p></div>' +
      '<div class="card"><label for="edd">' + esc(t('scan_edd')) + '</label><div class="row"><input type="date" id="edd" value="' + esc(sit.scanEdd || '') + '" min="' + toISO(addDays(today(), -28)) + '" max="' + toISO(addDays(today(), 280)) + '"><button type="button" class="btn sm" id="edd-set">' + esc(t('set')) + '</button></div><p class="small">' + esc(t('scan_edd_note')) + '</p><label for="lmp">' + esc(t('lmp')) + '</label><div class="row"><input type="date" id="lmp" value="' + esc(sit.pregnantSince || '') + '" min="' + toISO(addDays(today(), -310)) + '" max="' + toISO(today()) + '"><button type="button" class="btn sm" id="lmp-set">' + esc(t('set')) + '</button></div></div>' +
      '<button type="button" class="action" data-go="help"><span class="ico accent">' + I.help + '</span><span class="body"><strong>' + esc(t('call_now')) + '</strong><span class="small">' + esc(t('s1c')) + '</span></span></button>' +
      '<details><summary>' + esc(t('after_change')) + '</summary><div class="card" style="margin-top:8px"><button type="button" class="btn" id="loss">' + esc(t('loss')) + '</button><p class="small" id="loss-p" hidden>' + esc(t('loss_p')) + '</p></div></details>';
    /* A due date from 4 weeks ago to 280 days ahead, a last period from 310 days ago to today; anything else is a typing slip. */
    const inRange = (val, a, b) => !!val && fromISO(val) >= addDays(today(), a) && fromISO(val) <= addDays(today(), b);
    wire(v); $('#edd-set', v).addEventListener('click', () => { const val = $('#edd', v).value; if (val && !inRange(val, -28, 280)) { toast(t('date_bad')); return; } sit.scanEdd = val || null; save(); render(); });
    $('#lmp-set', v).addEventListener('click', () => { const val = $('#lmp', v).value; if (val && !inRange(val, -310, 0)) { toast(t('date_bad')); return; } sit.pregnantSince = val || sit.pregnantSince; save(); render(); });
    $('#loss', v).addEventListener('click', () => { endPregnancy(); save(); $('#loss-p', v).hidden = false; });
    const pd = $('#pw-date', v); if (pd) pd.addEventListener('click', () => openStage('preg'));
  }

  /* ---------- phone notifications (Android app only) ----------
     The page owns the reminder list, so it hands the phone the next three weeks of alarms after every save.
     In discreet mode every notification says only "Reminder" under the "My notes" name. */
  var notifTm = null;
  function notifBrand() { return state.settings.discreet ? t('notes_brand') : 'Qura Sakhi'; }
  function buildNotifs() {
    const out = []; const disc = !!state.settings.discreet; const horizon = addDays(today(), 21); const now = Date.now();
    const hourMin = (time) => { const hm = String(time || '09:00').split(':'); const h = parseInt(hm[0], 10), m = parseInt(hm[1], 10); return [isNaN(h) ? 9 : h, isNaN(m) ? 0 : m]; };   /* "00:30" is half past midnight, not 9 am */
    reminders.list().forEach((r) => {
      if (r.on === false) return; let from = today(); const hm = hourMin(r.time);
      /* Every occurrence in the 3-week window. (It used to stop after 4, so a daily pill reminder fell silent after 4 days.) */
      for (let k = 0; k < 400; k++) {
        const d = remNext(r, from); if (!d || d > horizon) break;
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hm[0], hm[1]).getTime();
        if (at > now) out.push({ id: 'r-' + r.id + '-' + toISO(d), at: at, title: notifBrand(), body: disc ? t('d_reminder') : remText(r) });
        from = addDays(d, 1);
      }
    });
    const ri = headsRange();
    if (ri && !isPregnant() && !countsOff()) { const d = addDays(ri.from, -1); const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0).getTime(); if (at > now) out.push({ id: 'period-' + toISO(ri.from), at: at, title: notifBrand(), body: disc ? t('d_reminder') : t('notif_period') }); }
    /* The phone keeps the first 60 it is given, so the soonest go first. */
    out.sort((a, b) => a.at - b.at);
    return out.slice(0, 60);
  }
  function syncNotifications() {
    const B = window.SakhiAndroid; if (!B || !B.schedule) return;
    clearTimeout(notifTm);
    notifTm = setTimeout(() => { safe(() => B.schedule(JSON.stringify(state.settings.notify && state.stage === 'app' ? buildNotifs() : []))); }, 800);
  }

  /* ---------- privacy: wipe, PIN pad, app lock ---------- */
  function wipeAll() { const lang = state.lang; try { localStorage.removeItem(KEY); } catch (e) { } state = defaults(); state.lang = lang; mem = freshMem(); closeSheet(); toast(t('deleted')); location.hash = ''; render(); }
  /* A 4-digit PIN for a shared phone. Stored as a short hash: enough to stop casual opening, not encryption. */
  const pinH = (pin) => { let h = 2166136261; const str = 'sakhi:' + pin; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
  function pinPad(el, title, onDone) {
    let digits = '';
    const draw = (msg) => {
      el.innerHTML = '<div class="pinpad"><h2>' + esc(title) + '</h2><div class="pindots" aria-live="polite">' + [0, 1, 2, 3].map((i) => '<i class="' + (i < digits.length ? 'on' : '') + '"></i>').join('') + '</div>' + (msg ? '<p class="small pinmsg" role="alert">' + esc(msg) + '</p>' : '') +
        '<div class="keys">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) => (k === '' ? '<span></span>' : '<button type="button" class="key" data-k="' + k + '" aria-label="' + (k === 'del' ? esc(t('back')) : k) + '">' + (k === 'del' ? '⌫' : k) + '</button>')).join('') + '</div></div>';
      el.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.k; if (k === 'del') digits = digits.slice(0, -1); else if (digits.length < 4) digits += k; if (digits.length === 4) { const pin = digits; digits = ''; draw(); onDone(pin, (m) => draw(m)); } else draw(); }));
    };
    draw();
  }
  /* Shared-phone mode: after 10 minutes without a tap, when the app opens, and when she comes back to it after more than 30
     seconds away, the diary closes. With a PIN that is the lock screen; without one, this plain screen. Closing never touches
     onboarding or her entries. */
  let sharedTm = 0, sharedArmed = false;
  const sharedPoke = () => { clearTimeout(sharedTm); if (!state.settings.shared || state.stage !== 'app' || mem.locked) return; sharedTm = setTimeout(() => { if (state.settings.shared && state.stage === 'app' && !mem.locked) { mem.locked = true; mem.bioAuto = false; closeSheet(); render(); } }, 10 * 60 * 1000); };
  const armShared = () => { if (!sharedArmed) { sharedArmed = true; ['click', 'keydown', 'touchstart'].forEach((e) => document.addEventListener(e, sharedPoke, true)); } sharedPoke(); };
  function renderRest(v) {
    v.innerHTML = '<div class="lockwrap"><div class="mark">' + I.lock + '</div><h2>' + esc(t(state.settings.discreet ? 'rest_h_d' : 'rest_h')) + '</h2><p class="small" style="text-align:center">' + esc(t('rest_p')) + '</p><button type="button" class="btn primary block" id="rest-open">' + esc(t('rest_open')) + '</button></div>';
    $('#rest-open', v).addEventListener('click', () => { mem.locked = false; render(); sharedPoke(); });
  }
  function renderLock(v) {
    v.innerHTML = '<div class="lockwrap"><div class="mark">' + I.lock + '</div><div id="lockpad" style="width:100%"></div><div id="lock-bio-row" style="width:100%;max-width:320px"></div><button type="button" class="btn ghost block" id="lock-forgot">' + esc(t('pin_forgot')) + '</button><div id="lock-out" style="width:100%"></div></div>';
    pinPad($('#lockpad', v), t('pin_enter'), (pin, msg) => { if (pinH(pin) === state.settings.pinHash) { mem.locked = false; mem.bioAuto = false; render(); sharedPoke(); } else msg(t('pin_wrong')); });
    const B = window.SakhiAndroid;
    if (B && B.canBiometric && safe(() => B.canBiometric(), false)) {
      $('#lock-bio-row', v).innerHTML = '<button type="button" class="btn block" id="lock-bio">' + esc(t('bio_btn')) + '</button>';
      window.__sakhiBio = (ok) => { if (ok && mem.locked) { mem.locked = false; mem.bioAuto = false; render(); sharedPoke(); } };
      const ask = () => safe(() => B.biometric(state.settings.discreet ? t('bio_title_d') : t('bio_title'), t('cancel')));
      $('#lock-bio', v).addEventListener('click', ask);
      if (!mem.bioAuto) { mem.bioAuto = true; setTimeout(ask, 300); }
    }
    $('#lock-forgot', v).addEventListener('click', () => { $('#lock-out', v).innerHTML = '<div class="card warn"><p style="color:var(--fg)">' + esc(t('pin_forgot_p')) + '</p><div class="grid2"><button type="button" class="btn" id="lf-no">' + esc(t('cancel')) + '</button><button type="button" class="btn danger" id="lf-yes">' + esc(t('yes_delete')) + '</button></div></div>'; $('#lf-no', v).addEventListener('click', () => { $('#lock-out', v).innerHTML = ''; }); $('#lf-yes', v).addEventListener('click', wipeAll); });
  }
  function pinSheet(mode) {
    let first = null;
    sheet('<div id="pinsheet"></div><button type="button" class="btn ghost block" id="pin-cancel">' + esc(t('cancel')) + '</button>', (sh) => {
      $('#pin-cancel', sh).addEventListener('click', closeSheet);
      const el = $('#pinsheet', sh);
      const askPin = (title) => pinPad(el, title, (pin, msg) => {
        if (mode === 'off') { if (pinH(pin) === state.settings.pinHash) { state.settings.pinHash = null; save(); closeSheet(); toast(t('pin_off')); render(); } else msg(t('pin_wrong')); return; }
        if (!first) { first = pin; askPin(t('pin_again')); return; }
        if (pin === first) { state.settings.pinHash = pinH(pin); save(); closeSheet(); toast(t('pin_on')); render(); } else { first = null; askPin(t('pin_set_h')); toast(t('pin_mismatch')); }
      });
      askPin(mode === 'off' ? t('pin_enter') : t('pin_set_h'));
    });
  }

  /* ---------- tidy pass after every screen ----------
     1. Nothing that carries meaning below 13px (module styles included; charts excluded).
     2. A long intro under the title shows two lines and a "More" button.
     3. On long screens, long text-only cards fold to a preview with "Show more".
        Cards with emergency numbers, warnings, forms or main buttons never fold. */
  const EMERG = /\b(112|108|102|14416|1098|181)\b/;
  function tidyView(v) {
    const els = v.querySelectorAll('p, span, li, div, label, a, strong, em, b, td, th, dd, dt, summary, button, h3, h4, small');
    for (let i = 0; i < els.length; i++) {
      const el = els[i]; let txt = false;
      for (let n = el.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && n.nodeValue.trim()) { txt = true; break; } }
      if (!txt || el.closest('svg, .barlabels, .tl-labels, .cal, .bigtimer, .keys')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs && fs < 13) el.style.fontSize = '13px';
    }
    const first = v.querySelector(':scope > .backrow + p.small, :scope > h1 + p.small');
    if (first && !first.dataset.clamped && (first.textContent || '').length > 130) {
      first.dataset.clamped = '1'; first.classList.add('clamp2');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'morebtn'; b.textContent = t('more');
      b.addEventListener('click', () => { const on = first.classList.toggle('clamp2'); b.textContent = on ? t('more') : t('less'); });
      first.after(b);
    }
    if (document.documentElement.scrollHeight > window.innerHeight * 2.2) {
      v.querySelectorAll('.card').forEach((c) => {
        if (c.dataset.coll || (c.parentElement && c.parentElement.closest('.card'))) return;
        if (c.matches('.dark, .warn, .ok, .hero, .xp-card, [data-nofold]') || c.querySelector('input, select, textarea, .flag, .btn.primary, [data-copy], canvas, svg.spark')) return;
        const txt = c.textContent || ''; if (txt.length < 450 || EMERG.test(txt)) return;
        if (c.getBoundingClientRect().height < 340) return;
        c.dataset.coll = '1'; c.classList.add('collapsed');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'morebtn'; b.textContent = t('show_more');
        b.addEventListener('click', () => { const on = c.classList.toggle('collapsed'); b.textContent = on ? t('show_more') : t('show_less'); });
        c.after(b);
      });
    }
  }

  /* ---------- doctor summary (core part) ---------- */
  function coreSummary() {
    const g = usable(); const avg = g.length ? Math.round(g.reduce((a, b) => a + b, 0) / g.length) : null; const ls = lastStart(); const sit = state.situation; const out = [];
    const L1 = []; if (ls) L1.push(t('cycle_day') + ': ' + cycleDay() + ' (' + fmtD(ls, { day: 'numeric', month: 'short', year: 'numeric' }) + ')');
    if (g.length) L1.push(t('avg_gap') + ': ' + avg + ' · ' + t('shortest') + ': ' + Math.min.apply(null, g) + ' · ' + t('longest') + ': ' + Math.max.apply(null, g));
    L1.push(t('cycles_logged') + ': ' + starts().length);
    const heavy = state.events.filter((e) => e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked).length; if (heavy) L1.push(t('pc_heavy') + ': ' + heavy);
    out.push({ title: t('diary'), lines: L1 });
    const flags = ['pregnant', 'breastfeeding', 'hormones', 'pcos', 'thyroid', 'hysterectomy', 'stopped', 'planning'].filter((k) => sit[k]).map((k) => t({ breastfeeding: 'bf', hysterectomy: 'hyst' }[k] || k));
    if (flags.length) out.push({ title: t('situation'), lines: [flags.join(', ')] });
    const cis = Object.keys(state.checkins).sort().slice(-3); if (cis.length) out.push({ title: t('ci_h'), lines: cis.map((k) => k + ': ' + ((state.checkins[k].chips || []).map((c) => t('ci_' + c)).join(', ') || '—') + (state.checkins[k].hot && state.checkins[k].hot !== 'hot_0' ? ' · ' + t('ci_hot') + ': ' + t(state.checkins[k].hot) : '')) });
    return out;
  }
  function loadSample(id) { if (!samples[id]) return; state = samples[id](); runHook('sample', [id, api]); save(); }

  /* ---------- public API for modules ---------- */
  const api = {
    version: 1, register: register,
    get state() { return state; }, get mem() { return mem; },
    $: $, esc: esc, pad2: pad2, toISO: toISO, fromISO: fromISO, addDays: addDays, diffDays: diffDays, today: today, monthKey: monthKey, clamp: clamp, addMonths: addMonths,
    t: t, tf: tf, tx: tx, one: one, fmtD: fmtD, fmtRange: fmtRange, I: I, icon: icon,
    save: modSave, saveQuiet: save, emit: emit, render: render, setHash: setHash, route: route, wire: wire, toast: toast, toastAct: toastAct, sheet: sheet, closeSheet: closeSheet, backRow: backRow, gate: gate,
    data: data, reminders: reminders, canSave: canSave, needDiary: needDiary, ask: ask, goBack: goBack, backBtn: backBtn,
    cycle: { starts: starts, gapsAll: gapsAll, usable: usable, lastStart: lastStart, cycleDay: cycleDay, bleedingDays: bleedingDays, rangeInfo: rangeInfo, bandHi: bandHi, isPregnant: isPregnant, countsOff: countsOff, afterBirth: afterBirthNow, ageYears: ageYears, lastCheckins: lastCheckins, fertileInfo: fertileInfo, midlifeStage: midlifeStage, excludedWhy: excludedWhy, isMidlife: isMidlife, approxStarts: approxStarts, periodLen: periodLen, rawStarts: () => liveStartEvents().map((e) => e.d).sort() },
    preg: { info: pregInfo },
    openAnswer: openAnswer, stageNow: stageNow, openDay: openDay, kinds: KINDS, openStage: openStage, startTour: (id) => startTour(id, true), tours: () => TOURS.map((x) => x.id), tourMoment: tourMoment,
    langs: LANGS, langMeta: langMeta, modules: MODS, sections: SECTIONS, tiles: () => CORE_TILES.concat(TILES), routes: () => Object.keys(ROUTES), routeOwner: (r) => { const m = modRoute(r); return m ? m.mod : null; },   /* exact routes and prefix routes (relief-hot, journey-iron) */
    coreSummary: coreSummary, summaries: () => HOOKS.summary.map((h) => ({ mod: h.mod, sections: safe(() => h.fn(api), []) || [] })),
    loadSample: loadSample, sampleIds: () => Object.keys(samples), strings: STR,
    onOwnerChange: (fn) => { if (typeof fn === 'function') ownerFns.push(fn); },
    flags: { get proto() { return !!state.settings.proto; }, get discreet() { return !!state.settings.discreet; } },
    /* Run fn against a sample woman's data without touching the real diary (used by the doctor-view preview). */
    withSample: (id, fn) => { if (!samples[id]) return null; const keep = state; holdSave = true; let out = null; try { state = samples[id](); runHook('sample', [id, api]); out = fn(api); } catch (e) { if (window.console) console.error('[saathi]', e); } finally { state = keep; holdSave = false; } return out; },
    reset: () => { const lang = state.lang; state = defaults(); state.lang = lang; mem = freshMem(); }
  };
  window.Saathi = api;
  /* Account, for the page and the tests. Modules never touch the network (MODULE_API section 24). */
  api.account = {
    signedIn: () => signedIn(), info: () => acctPublic(), config: () => Object.assign({}, CFG), allowed: () => JSON.parse(JSON.stringify(SEND)),
    _testSignIn: (o) => { acct = Object.assign({ token: 'test', id: 'test', phone: '+919800000000', activeOn: toISO(today()) }, o || {}); saveAcct(); },
    _testSignOut: () => { acct = {}; saveAcct(); mem.su = null; mem.suLater = false; }
  };

  /* ---------- boot (called from index.html after the module scripts load) ---------- */
  let booted = false;
  api.boot = function boot() {
    if (booted) return; booted = true;
    if (CSS.length) { const st = document.createElement('style'); st.id = 'mod-css'; st.textContent = CSS.join('\n'); document.head.appendChild(st); }
    load(); loadAcct();
    if (state.settings.pinHash) mem.locked = true;
    /* Lock again when she comes back after more than 30 seconds away; on a shared phone the diary closes the same way, PIN or not
       (Android may pause the 10-minute timer while the app is in the background). The page's own visibility events and the
       Android app's pause/resume calls both land here; the second arrival finds nothing to do, so she is never locked twice.
       Coming back also re-sends the alarm list so it never runs dry. */
    const wentAway = () => { if (!mem.hiddenAt) mem.hiddenAt = Date.now(); };
    const cameBack = () => {
      const away = mem.hiddenAt ? Date.now() - mem.hiddenAt : 0; mem.hiddenAt = 0;
      if ((state.settings.pinHash || (state.settings.shared && state.stage === 'app')) && away > 30000 && !mem.locked) { mem.locked = true; mem.bioAuto = false; closeSheet(); render(); }
      else if (route() === 'me' && !sheetUp()) render();   /* back from a phone setting (exact alarms): show its new state */
      syncNotifications(); acctSync();
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) wentAway(); else cameBack(); });
    window.__sakhiPause = wentAway;
    window.__sakhiResume = cameBack;
    syncNotifications();
    /* The Android app bundles the library as content.js (WebView cannot fetch file:// URLs); the web version fetches content.json. */
    if (window.SAKHI_CONTENT && window.SAKHI_CONTENT.groups) CONTENT = window.SAKHI_CONTENT;
    else fetch('content.json', { cache: 'no-cache' }).then((r) => r.json()).then((c) => { CONTENT = c || { groups: [] }; const r0 = route(); if (['learn', 'home', 'care'].indexOf(r0) >= 0 || r0.startsWith('a-') || r0.startsWith('topic-')) render(); }).catch(() => { });
    window.addEventListener('hashchange', render);
    ['click', 'change'].forEach((e) => document.addEventListener(e, () => { lastTap = Date.now(); }, true));
    if (state.settings.shared && state.stage === 'app') mem.locked = true;
    armShared();
    render();
    acctSync(); window.addEventListener('online', acctSync);
  };
})();
