package com.quranutrition.sakhi;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

/** The date maths for repeating reminders, with nothing from Android in it, so android/test/ReminderMathTest.java can run it
 *  on any computer (Version 34, docs/notifications-audit-2026-10-23.md). When a repeating reminder rings, Android books the
 *  next one itself from this, so a daily pill keeps ringing even if she never opens Sakhi. */
final class ReminderMath {
    private ReminderMath() { }

    /** The next time after `at`, at hh:mm: `every` days later, or the next of the weekdays `wd` (0 = Sunday, as in the page's
     *  JavaScript). -1 when there is none: no rule, or past `until` (epoch millis; 0 = no end). */
    static long next(long at, int every, int[] wd, int hh, int mm, long until, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(at);
        c.set(Calendar.HOUR_OF_DAY, hh);
        c.set(Calendar.MINUTE, mm);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        if (every > 0) {
            c.add(Calendar.DAY_OF_MONTH, every);
        } else if (wd != null && wd.length > 0) {
            boolean found = false;
            for (int i = 1; i <= 7 && !found; i++) {
                c.add(Calendar.DAY_OF_MONTH, 1);
                int js = c.get(Calendar.DAY_OF_WEEK) - 1;
                for (int w : wd) if (w == js) { found = true; break; }
            }
            if (!found) return -1;
        } else {
            return -1;
        }
        long n = c.getTimeInMillis();
        return until > 0 && n > until ? -1 : n;
    }

    /** The first time after `now` (a phone that was off, or alarms re-armed late). -1 when the rule has ended. */
    static long firstAfter(long at, int every, int[] wd, int hh, int mm, long until, long now, TimeZone tz) {
        long n = at;
        for (int i = 0; i < 4000 && n != -1 && n <= now; i++) n = next(n, every, wd, hh, mm, until, tz);
        return n > now ? n : -1;
    }

    /** "YYYY-MM-DD" of a moment, in the phone's time zone. */
    static String day(long at, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(at);
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    /** The page's id for one ring of a reminder, so a ring booked here and one sent by the page are never booked twice. */
    static String occurrenceId(String rid, long at, TimeZone tz) {
        return "r-" + rid + "-" + day(at, tz);
    }

    /** A route a notification may open: lower-case letters, digits and dashes only. */
    static boolean okRoute(String go) {
        return go != null && go.matches("[a-z0-9-]{1,40}");
    }
}
