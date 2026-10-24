package com.quranutrition.sakhi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONObject;

/** Shows a reminder the page scheduled (medicine, check-up, period heads-up). The text arrives already worded for discreet
 *  mode. Version 32 (field-test audit 2.8): a locked phone shows nothing of it on the lock screen, whatever the phone's own
 *  setting (most phones show all notification text there by default), so "Take your pill" or "Your period may start" is
 *  read only after she unlocks. The sound and the vibration still come.
 *  Version 34 (docs/notifications-audit-2026-10-23.md): each kind has its own channel, named in her language (medicines pop
 *  up over the screen; discreet mode and shared phones use one neutral "Reminders" channel); a tap opens the reminder's own
 *  screen; and a repeating reminder books its next ring here. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "sakhi_reminders";

    @Override
    public void onReceive(Context ctx, Intent in) {
        String item = in.getStringExtra("item");
        JSONObject o = null;
        try { o = item == null ? null : new JSONObject(item); } catch (Exception e) { o = null; }
        if (o == null) {   // an alarm booked by a version before 34 that rings before the update re-arms it
            post(ctx, in.getStringExtra("title"), in.getStringExtra("body"), in.getIntExtra("nid", 1), in.getBooleanExtra("secret", false));
            return;
        }
        String id = o.optString("id", "reminder");
        post(ctx, o.optString("title", "Reminder"), o.optString("body", ""), id.hashCode(), o.optBoolean("secret", false),
                o.optString("ch", CHANNEL), o.optString("chname", "Reminders"), "high".equals(o.optString("imp")), o.optString("go", null));
        Reminders.chain(ctx, item);
    }

    /** The test notification on Me > Reminders: the neutral channel, opening Home. */
    static void post(Context ctx, String title, String body, int nid, boolean secret) {
        post(ctx, title, body, nid, secret, CHANNEL, "Reminders", false, null);
    }

    static void post(Context ctx, String title, String body, int nid, boolean secret, String ch, String chname, boolean high, String go) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (ch == null || !ch.matches("sakhi_[a-z]{1,20}")) ch = CHANNEL;
        if (chname == null || chname.trim().isEmpty() || chname.length() > 60) chname = "Reminders";
        if (Build.VERSION.SDK_INT >= 26) {
            // Created, or renamed in place (her language changed): Android's settings show this name. The importance is fixed
            // once the channel exists; after that only she can change it.
            NotificationChannel c = new NotificationChannel(ch, chname, high ? NotificationManager.IMPORTANCE_HIGH : NotificationManager.IMPORTANCE_DEFAULT);
            c.setLockscreenVisibility(Notification.VISIBILITY_SECRET);
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (ReminderMath.okRoute(go)) open.putExtra("go", go);
        // one tap target per notification (the same request code would share one, and the last route would win)
        PendingIntent pi = PendingIntent.getActivity(ctx, nid, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder pub = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, ch) : new Notification.Builder(ctx);
        pub.setSmallIcon(R.drawable.ic_stat).setContentTitle("Reminder").setColor(0xFF5B6470);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, ch) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_stat)
                .setContentTitle(title == null ? "Reminder" : title)
                .setContentText(body == null ? "" : body)
                .setStyle(new Notification.BigTextStyle().bigText(body == null ? "" : body))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(Notification.CATEGORY_REMINDER)
                .setColor(0xFF5B6470)
                .setVisibility(Notification.VISIBILITY_SECRET)
                .setPublicVersion(pub.build());
        if (Build.VERSION.SDK_INT < 26) b.setPriority(high ? Notification.PRIORITY_HIGH : Notification.PRIORITY_DEFAULT).setDefaults(Notification.DEFAULT_ALL);
        nm.notify(nid, b.build());
    }
}
