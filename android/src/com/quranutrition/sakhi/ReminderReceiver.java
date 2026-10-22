package com.quranutrition.sakhi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Shows a reminder the page scheduled (medicine, check-up, period heads-up). The text arrives already worded for discreet
 *  mode. A locked phone set to hide sensitive content shows only "Reminder" (the public version); one set to show all
 *  content shows the text. In discreet mode the lock screen shows nothing at all, whatever the phone's setting. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "sakhi_reminders";

    @Override
    public void onReceive(Context ctx, Intent in) {
        post(ctx, in.getStringExtra("title"), in.getStringExtra("body"), in.getIntExtra("nid", 1), in.getBooleanExtra("secret", false));
    }

    static void post(Context ctx, String title, String body, int nid, boolean secret) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            // Created, or renamed in place for phones that have the old channel: the Settings app shows this text too.
            NotificationChannel c = new NotificationChannel(CHANNEL, "Reminders", NotificationManager.IMPORTANCE_DEFAULT);
            c.setDescription("Reminders you set in the app");
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder pub = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        pub.setSmallIcon(R.drawable.ic_stat).setContentTitle("Reminder").setColor(0xFF5B6470);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_stat)
                .setContentTitle(title == null ? "Reminder" : title)
                .setContentText(body == null ? "" : body)
                .setStyle(new Notification.BigTextStyle().bigText(body == null ? "" : body))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setColor(0xFF5B6470)
                .setVisibility(secret ? Notification.VISIBILITY_SECRET : Notification.VISIBILITY_PRIVATE)
                .setPublicVersion(pub.build());
        nm.notify(nid, b.build());
    }
}
