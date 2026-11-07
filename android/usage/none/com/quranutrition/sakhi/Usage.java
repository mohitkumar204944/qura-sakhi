package com.quranutrition.sakhi;

import android.content.Context;

/** Version 39.79: a build without google-services.json has no Firebase, so "Share how I use Sakhi" isn't offered and nothing is sent. */
final class Usage {
    private Usage() { }

    static final boolean AVAILABLE = false;
    static void on(Context c, boolean on) { }
    static void event(Context c, String name, String json) { }
    static void forget(Context c) { }
}
