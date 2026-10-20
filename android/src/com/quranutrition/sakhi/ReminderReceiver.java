package com.quranutrition.sakhi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Shows a reminder the page scheduled (medicine, check-up, period heads-up). The text arrives already worded for discreet mode. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "sakhi_reminders";

    @Override
    public void onReceive(Context ctx, Intent in) {
        post(ctx, in.getStringExtra("title"), in.getStringExtra("body"), in.getIntExtra("nid", 1));
    }

    static void post(Context ctx, String title, String body, int nid) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel c = new NotificationChannel(CHANNEL, "Reminders", NotificationManager.IMPORTANCE_DEFAULT);
            c.setDescription("Medicines, check-ups and period reminders you set in the app");
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_stat)
                .setContentTitle(title == null ? "Reminder" : title)
                .setContentText(body == null ? "" : body)
                .setStyle(new Notification.BigTextStyle().bigText(body == null ? "" : body))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setColor(0xFFC2345B);
        nm.notify(nid, b.build());
    }
}
