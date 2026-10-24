package com.quranutrition.sakhi;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;
import java.util.TimeZone;

/** Keeps the phone's alarm list in step with the reminders the page computes, soonest first. The list is kept, so BootReceiver
 *  can put the alarms back after a restart, an app update or a change to "Alarms and reminders".
 *  Version 34 (docs/notifications-audit-2026-10-23.md): a repeating reminder carries its rule, so when it rings the next one
 *  is booked here (chain), and after a restart a missed repeat moves on to its next time instead of being dropped. A daily
 *  pill keeps ringing even if she never opens Sakhi. */
final class Reminders {
    private static final String PREF = "sakhi_alarms";
    private static final int MAX = 60;

    private Reminders() { }

    /** json = [{ "id", "at": epochMillis, "title", "body", "secret", "ch", "chname", "imp", "go",
     *  and for repeating ones "rid", "rep": { "every": n } or { "wd": [0-6] }, "hh", "mm", "until" }].
     *  "secret" (discreet mode or a shared phone) keeps it off the lock screen. Cancels everything scheduled before. */
    static synchronized int replaceAll(Context ctx, String json) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return 0;
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        for (String id : sp.getStringSet("ids", new HashSet<String>())) {
            PendingIntent old = pending(ctx, id, null);
            am.cancel(old);
            old.cancel();
        }
        Set<String> ids = new HashSet<String>();
        JSONArray kept = new JSONArray();
        final boolean exact = canExact(am);
        final long t0 = System.currentTimeMillis();
        final TimeZone tz = TimeZone.getDefault();
        try {
            JSONArray a = new JSONArray(json == null ? "[]" : json);
            for (int i = 0; i < a.length() && ids.size() < MAX; i++) {
                JSONObject o = a.getJSONObject(i);
                long at = o.getLong("at");
                if (at <= t0) {
                    // a repeat that was missed (the phone was off): its next time; a one-off that has passed: dropped
                    long n = repeats(o) ? ReminderMath.firstAfter(at, every(o), weekdays(o), o.optInt("hh"), o.optInt("mm"), o.optLong("until", 0), t0, tz) : -1;
                    if (n == -1) continue;
                    o.put("at", n);
                    o.put("id", ReminderMath.occurrenceId(o.getString("rid"), n, tz));
                    at = n;
                }
                String id = o.getString("id");
                if (ids.contains(id)) continue;
                book(am, exact, at, pending(ctx, id, o));
                ids.add(id);
                kept.put(o);
            }
        } catch (Exception e) { /* bad input: what was booked so far stays */ }
        sp.edit().putStringSet("ids", ids).putString("json", kept.toString()).apply();
        return ids.size();
    }

    /** One ring is over: if it repeats, book its next time (unless the page already did), and forget the one that rang. */
    static synchronized void chain(Context ctx, String itemJson) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null || itemJson == null) return;
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        try {
            JSONObject fired = new JSONObject(itemJson);
            JSONArray old = new JSONArray(sp.getString("json", "[]"));
            Set<String> ids = new HashSet<String>(sp.getStringSet("ids", new HashSet<String>()));
            final long t0 = System.currentTimeMillis();
            final TimeZone tz = TimeZone.getDefault();
            JSONArray kept = new JSONArray();
            for (int i = 0; i < old.length(); i++) {
                JSONObject o = old.getJSONObject(i);
                if (o.optLong("at") > t0 && !o.optString("id").equals(fired.optString("id"))) kept.put(o);
                else ids.remove(o.optString("id"));
            }
            ids.remove(fired.optString("id"));
            if (repeats(fired)) {
                long n = ReminderMath.firstAfter(fired.getLong("at"), every(fired), weekdays(fired), fired.optInt("hh"), fired.optInt("mm"), fired.optLong("until", 0), t0, tz);
                if (n != -1) {
                    String id = ReminderMath.occurrenceId(fired.getString("rid"), n, tz);
                    if (!ids.contains(id) && ids.size() < MAX) {
                        JSONObject nx = new JSONObject(itemJson);
                        nx.put("at", n);
                        nx.put("id", id);
                        book(am, canExact(am), n, pending(ctx, id, nx));
                        ids.add(id);
                        kept.put(nx);
                    }
                }
            }
            sp.edit().putStringSet("ids", ids).putString("json", kept.toString()).apply();
        } catch (Exception e) { /* a bad item: nothing more is booked */ }
    }

    /** Exact alarms ring on the minute. Android 6 to 11 allow them; from 12 she has to allow "Alarms and reminders" for the app
     *  (off by default from Android 14), and without it alarms may come up to an hour late. The page asks for it. */
    static boolean canExact(AlarmManager am) {
        if (Build.VERSION.SDK_INT < 23) return false;
        if (Build.VERSION.SDK_INT < 31) return true;
        return am.canScheduleExactAlarms();
    }

    /** After a restart, an update or a change to "Alarms and reminders": book the kept list again. */
    static int rearm(Context ctx) {
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        String json = sp.getString("json", null);
        if (json == null) return 0;
        return replaceAll(ctx, json);
    }

    private static void book(AlarmManager am, boolean exact, long at, PendingIntent pi) {
        if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        else if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        else am.set(AlarmManager.RTC_WAKEUP, at, pi);
    }

    private static boolean repeats(JSONObject o) {
        return o.has("rid") && o.optJSONObject("rep") != null && (every(o) > 0 || weekdays(o) != null);
    }

    private static int every(JSONObject o) {
        JSONObject r = o.optJSONObject("rep");
        return r == null ? 0 : r.optInt("every", 0);
    }

    private static int[] weekdays(JSONObject o) {
        JSONObject r = o.optJSONObject("rep");
        JSONArray w = r == null ? null : r.optJSONArray("wd");
        if (w == null || w.length() == 0) return null;
        int[] out = new int[w.length()];
        for (int i = 0; i < w.length(); i++) out[i] = w.optInt(i, -1);
        return out;
    }

    /** The alarm for one ring. The same id always gives the same alarm, so it can be cancelled later; the item rides along so
     *  the receiver can show it and book the next. */
    private static PendingIntent pending(Context ctx, String id, JSONObject item) {
        Intent i = new Intent(ctx, ReminderReceiver.class);
        i.setAction("com.quranutrition.sakhi.REMINDER." + id);
        if (item != null) i.putExtra("item", item.toString());
        return PendingIntent.getBroadcast(ctx, id.hashCode(), i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
