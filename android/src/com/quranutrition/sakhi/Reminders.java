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

/** Keeps the phone's alarm list in step with the reminders the page computes (the next three weeks, soonest first).
 *  The last list is kept so BootReceiver can put the alarms back after a restart or an app update. */
final class Reminders {
    private static final String PREF = "sakhi_alarms";
    private static final int MAX = 60;

    private Reminders() { }

    /** json = [{ "id": "...", "at": epochMillis, "title": "...", "body": "..." }]. Cancels everything scheduled before. */
    static int replaceAll(Context ctx, String json) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return 0;
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        for (String id : sp.getStringSet("ids", new HashSet<String>())) {
            PendingIntent old = pending(ctx, id, null, null);
            am.cancel(old);
            old.cancel();
        }
        Set<String> now = new HashSet<String>();
        final boolean exact = canExact(am);
        try {
            JSONArray a = new JSONArray(json);
            long t0 = System.currentTimeMillis();
            for (int i = 0; i < a.length() && now.size() < MAX; i++) {
                JSONObject o = a.getJSONObject(i);
                long at = o.getLong("at");
                if (at <= t0) continue;
                String id = o.getString("id");
                PendingIntent pi = pending(ctx, id, o.optString("title", "Reminder"), o.optString("body", ""));
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.set(AlarmManager.RTC_WAKEUP, at, pi);
                now.add(id);
            }
        } catch (Exception e) { /* bad input: nothing scheduled */ }
        sp.edit().putStringSet("ids", now).putString("json", json == null ? "[]" : json).apply();
        return now.size();
    }

    /** Exact alarms ring on the minute. Android 6 to 11 allow them; from 12 she has to allow "Alarms and reminders" for the app,
     *  and without it alarms may come up to an hour late (the page offers the setting on the Me page). */
    static boolean canExact(AlarmManager am) {
        if (Build.VERSION.SDK_INT < 23) return false;
        if (Build.VERSION.SDK_INT < 31) return true;
        return am.canScheduleExactAlarms();
    }

    /** After a restart the phone has dropped every alarm: schedule the last list again (times already past are skipped).
     *  Nothing stored yet (an update from a version that did not keep the list): leave things as they are until the app opens. */
    static int rearm(Context ctx) {
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        String json = sp.getString("json", null);
        if (json == null) return 0;
        return replaceAll(ctx, json);
    }

    private static PendingIntent pending(Context ctx, String id, String title, String body) {
        Intent i = new Intent(ctx, ReminderReceiver.class);
        i.setAction("com.quranutrition.sakhi.REMINDER." + id);
        if (title != null) {
            i.putExtra("title", title);
            i.putExtra("body", body);
            i.putExtra("nid", id.hashCode());
        }
        return PendingIntent.getBroadcast(ctx, id.hashCode(), i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
