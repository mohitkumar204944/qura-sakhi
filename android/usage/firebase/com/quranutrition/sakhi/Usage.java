package com.quranutrition.sakhi;

import android.content.Context;
import android.os.Bundle;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.EnumMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Pattern;
import org.json.JSONObject;

/**
 * Version 39.79: "Share how I use Sakhi" through Firebase Analytics, in a build with google-services.json (the other Usage.java,
 * in usage/none, is the build without it). The page decides when anything may leave and which events (app.js, fbKeep); this
 * checks them again: only Sakhi's five event names, at most 25 parameters, short values with no spaces (so never words).
 * Ad IDs, Android ID, ad personalisation and automatic screen names stay off (AndroidManifest.xml), and the ad consents are
 * always denied.
 */
final class Usage {
    private Usage() { }

    static final boolean AVAILABLE = true;
    private static final Pattern NAME = Pattern.compile("^(screen_view|tap|rage_tap|dead_tap|app_error)$");
    private static final Pattern KEY = Pattern.compile("^[a-z][a-z_]{0,39}$");
    private static final Pattern VALUE = Pattern.compile("^[A-Za-z0-9:<_.-]{1,100}$");

    /** On only while the page says something may leave; off stops everything, Firebase's own session events too. */
    static void on(Context c, boolean on) {
        FirebaseAnalytics fa = FirebaseAnalytics.getInstance(c);
        Map<FirebaseAnalytics.ConsentType, FirebaseAnalytics.ConsentStatus> m = new EnumMap<>(FirebaseAnalytics.ConsentType.class);
        m.put(FirebaseAnalytics.ConsentType.AD_STORAGE, FirebaseAnalytics.ConsentStatus.DENIED);
        m.put(FirebaseAnalytics.ConsentType.AD_USER_DATA, FirebaseAnalytics.ConsentStatus.DENIED);
        m.put(FirebaseAnalytics.ConsentType.AD_PERSONALIZATION, FirebaseAnalytics.ConsentStatus.DENIED);
        m.put(FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE, on ? FirebaseAnalytics.ConsentStatus.GRANTED : FirebaseAnalytics.ConsentStatus.DENIED);
        fa.setConsent(m);
        fa.setAnalyticsCollectionEnabled(on);
    }

    static void event(Context c, String name, String json) {
        if (name == null || !NAME.matcher(name).matches()) return;
        Bundle b = new Bundle();
        try {
            JSONObject o = new JSONObject(json == null ? "{}" : json);
            Iterator<String> keys = o.keys();
            int n = 0;
            while (keys.hasNext() && n < 25) {
                String k = keys.next();
                if (!KEY.matcher(k).matches()) continue;
                Object v = o.get(k);
                if (v instanceof Integer || v instanceof Long) { b.putLong(k, ((Number) v).longValue()); n++; }
                else if (v instanceof String && VALUE.matcher((String) v).matches()) { b.putString(k, (String) v); n++; }
            }
        } catch (Exception e) { return; }
        FirebaseAnalytics.getInstance(c).logEvent(name, b);
    }

    /** Off in Me, or all her data deleted: Firebase forgets the app's anonymous ID, so turning it on again starts a new one. */
    static void forget(Context c) { FirebaseAnalytics.getInstance(c).resetAnalyticsData(); }
}
