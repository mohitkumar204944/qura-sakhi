package com.quranutrition.sakhi;

import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;

/** Checks the repeat maths Android uses to book a reminder's next ring itself (Version 34). Plain Java, no Android:
 *  android/test/run-reminder-math.sh compiles and runs it. */
public class ReminderMathTest {
    static int pass = 0, fail = 0;
    static final TimeZone IST = TimeZone.getTimeZone("Asia/Kolkata");

    static long at(String s, TimeZone tz) {
        try { SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US); f.setTimeZone(tz); return f.parse(s).getTime(); }
        catch (Exception e) { throw new RuntimeException(e); }
    }
    static String show(long t, TimeZone tz) {
        if (t == -1) return "none";
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm EEE", Locale.US); f.setTimeZone(tz); return f.format(new java.util.Date(t));
    }
    static void check(String name, String got, String want) {
        if (got.equals(want)) pass++; else { fail++; System.out.println("FAIL " + name + ": got " + got + ", want " + want); }
    }

    public static void main(String[] a) {
        long fri = at("2026-10-23 21:00", IST);   // a Friday
        check("daily: the next evening, same time", show(ReminderMath.next(fri, 1, null, 21, 0, 0, IST), IST), "2026-10-24 21:00 Sat");
        check("every 30 days", show(ReminderMath.next(fri, 30, null, 19, 0, 0, IST), IST), "2026-11-22 19:00 Sun");
        check("weekly on Sunday (0, as in JavaScript)", show(ReminderMath.next(fri, 0, new int[] { 0 }, 9, 30, 0, IST), IST), "2026-10-25 09:30 Sun");
        check("Mon, Wed, Fri from a Monday: Wednesday", show(ReminderMath.next(at("2026-10-26 08:00", IST), 0, new int[] { 1, 3, 5 }, 8, 0, 0, IST), IST), "2026-10-28 08:00 Wed");
        check("Mon, Wed, Fri from a Friday: next Monday", show(ReminderMath.next(fri, 0, new int[] { 1, 3, 5 }, 21, 0, 0, IST), IST), "2026-10-26 21:00 Mon");
        check("the time comes from the rule (hh:mm), not the ring", show(ReminderMath.next(at("2026-10-23 21:07", IST), 1, null, 21, 0, 0, IST), IST), "2026-10-24 21:00 Sat");
        long until = at("2026-10-24 23:59", IST);
        check("a course ending on the 24th: the 24th rings", show(ReminderMath.next(fri, 1, null, 21, 0, until, IST), IST), "2026-10-24 21:00 Sat");
        check("then nothing after its end", show(ReminderMath.next(at("2026-10-24 21:00", IST), 1, null, 21, 0, until, IST), IST), "none");
        check("no rule: nothing", show(ReminderMath.next(fri, 0, null, 21, 0, 0, IST), IST), "none");
        check("no weekdays: nothing", show(ReminderMath.next(fri, 0, new int[0], 21, 0, 0, IST), IST), "none");
        check("month end", show(ReminderMath.next(at("2026-01-31 08:00", IST), 1, null, 8, 0, 0, IST), IST), "2026-02-01 08:00 Sun");
        check("year end", show(ReminderMath.next(at("2026-12-31 22:30", IST), 1, null, 22, 30, 0, IST), IST), "2027-01-01 22:30 Fri");
        check("leap day", show(ReminderMath.next(at("2028-02-28 09:00", IST), 1, null, 9, 0, 0, IST), IST), "2028-02-29 09:00 Tue");
        long now = at("2026-10-23 10:00", IST);
        check("phone off for days: the first ring after now", show(ReminderMath.firstAfter(at("2026-10-18 09:00", IST), 1, null, 9, 0, 0, now, IST), IST), "2026-10-24 09:00 Sat");
        check("phone off: today's later ring still comes", show(ReminderMath.firstAfter(at("2026-10-18 21:00", IST), 1, null, 21, 0, 0, now, IST), IST), "2026-10-23 21:00 Fri");
        check("phone off past the course's end: nothing", show(ReminderMath.firstAfter(at("2026-10-18 21:00", IST), 1, null, 21, 0, at("2026-10-20 23:59", IST), now, IST), IST), "none");
        TimeZone uk = TimeZone.getTimeZone("Europe/London");
        check("a clock change keeps the local time", show(ReminderMath.next(at("2026-10-24 09:00", uk), 1, null, 9, 0, 0, uk), uk), "2026-10-25 09:00 Sun");
        check("the page's id for a ring", ReminderMath.occurrenceId("preg-ifa", at("2026-10-24 21:00", IST), IST), "r-preg-ifa-2026-10-24");
        check("a late-night ring keeps its own date", ReminderMath.occurrenceId("pill", at("2026-10-24 23:45", IST), IST), "r-pill-2026-10-24");
        check("routes: a screen name", String.valueOf(ReminderMath.okRoute("contra-mine")), "true");
        check("routes: nothing that climbs out or has capitals", String.valueOf(ReminderMath.okRoute("../x") || ReminderMath.okRoute("Home") || ReminderMath.okRoute("a b") || ReminderMath.okRoute("") || ReminderMath.okRoute(null)), "false");
        check("routes: not too long", String.valueOf(ReminderMath.okRoute("a234567890123456789012345678901234567890x")), "false");
        System.out.println(fail == 0 ? "REMINDER MATHS OK " + pass + "/" + pass : "REMINDER MATHS FAIL " + pass + "/" + (pass + fail));
        System.exit(fail == 0 ? 0 : 1);
    }
}
