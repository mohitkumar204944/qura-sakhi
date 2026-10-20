package com.quranutrition.sakhi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** A restart (or an app update) clears every alarm, so the last reminder list the page sent is scheduled again. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent in) {
        String a = in == null ? null : in.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) Reminders.rearm(ctx);
    }
}
