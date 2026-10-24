package com.quranutrition.sakhi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** A restart (or an app update) clears every alarm, so the last reminder list the page sent is scheduled again. Version 34:
 *  also when she allows (or stops) "Alarms and reminders", so the alarms switch to ringing on the minute at once. */
public class BootReceiver extends BroadcastReceiver {
    /** AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED (Android 12+), spelled out for older SDKs. */
    static final String EXACT_CHANGED = "android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED";

    @Override
    public void onReceive(Context ctx, Intent in) {
        String a = in == null ? null : in.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a) || EXACT_CHANGED.equals(a)) Reminders.rearm(ctx);
    }
}
