package com.quranutrition.sakhi;

import android.app.Activity;
import android.app.AlarmManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.DialogInterface;
import android.content.Context;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.app.NotificationManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.HapticFeedbackConstants;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/** Qura Sakhi: the prototype web app, bundled in assets/www and shown full screen in a WebView. */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final int REQ_FILE = 41;
    private static final int REQ_NOTIFY = 42;
    private static final int REQ_SPEECH = 43;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // the diary lives in localStorage
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(true);

        web.addJavascriptInterface(new Bridge(), "SakhiAndroid");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("file".equals(u.getScheme())) return false;
                // Official pages, booking link, phone numbers: open outside the app.
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { /* nothing can open it */ }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            // <input type="file"> for the reports vault
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        tts = new TextToSpeech(this, this);

        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onInit(int status) {
        ttsReady = status == TextToSpeech.SUCCESS;
        if (ttsReady) tts.setOnUtteranceProgressListener(new TtsListener());
    }

    /** Tells the page when each spoken part finishes, so read-aloud can move on or stop. */
    private class TtsListener extends UtteranceProgressListener {
        @Override public void onStart(String id) { }
        @Override public void onDone(String id) { done(id, true); }
        @Override public void onError(String id) { done(id, false); }
        @Override public void onStop(String id, boolean interrupted) { done(id, false); }
    }

    private void done(final String id, final boolean ok) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                web.evaluateJavascript("window.__sakhiTtsDone && window.__sakhiTtsDone(" + quote(id) + "," + ok + ")", null);
            }
        });
    }

    private static String quote(String v) {
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'";
    }

    /** Small bridge used by assets/www/android-shim.js. */
    private class Bridge {
        @JavascriptInterface
        public String voices() {
            if (!ttsReady) return "[]";
            StringBuilder b = new StringBuilder("[");
            Set<String> seen = new HashSet<>();
            try {
                Set<Voice> vs = tts.getVoices();
                if (vs != null) for (Voice v : vs) {
                    String tag = v.getLocale().toLanguageTag();
                    if (!seen.add(tag)) continue;
                    if (b.length() > 1) b.append(',');
                    b.append("{\"lang\":").append(json(tag))
                     .append(",\"name\":").append(json(v.getName()))
                     .append(",\"localService\":").append(!v.isNetworkConnectionRequired())
                     .append(",\"default\":false}");
                }
            } catch (Exception e) { /* some engines throw before voices load */ }
            return b.append(']').toString();
        }

        @JavascriptInterface
        public boolean speak(String text, String lang, float rate, String id) {
            if (!ttsReady) return false;
            int r = tts.setLanguage(Locale.forLanguageTag(lang));
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) return false;
            tts.setSpeechRate(rate > 0 ? rate : 1f);
            String t = text.length() > 3800 ? text.substring(0, 3800) : text;
            return tts.speak(t, TextToSpeech.QUEUE_FLUSH, null, id) == TextToSpeech.SUCCESS;
        }

        @JavascriptInterface
        public void stop() { if (ttsReady) tts.stop(); }

        /** A light tick on taps, like a native app. */
        @JavascriptInterface
        public void haptic() {
            runOnUiThread(new Runnable() {
                @Override public void run() { web.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY); }
            });
        }

        /** Discreet icon: show "Notes" instead of "Qura Sakhi" on the home screen. */
        @JavascriptInterface
        public void setDisguise(boolean on) {
            PackageManager pm = getPackageManager();
            pm.setComponentEnabledSetting(new ComponentName(MainActivity.this, getPackageName() + ".LauncherNotes"),
                    on ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            pm.setComponentEnabledSetting(new ComponentName(MainActivity.this, getPackageName() + ".LauncherDefault"),
                    on ? PackageManager.COMPONENT_ENABLED_STATE_DISABLED : PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
        }

        @JavascriptInterface
        public boolean isDisguised() {
            int st = getPackageManager().getComponentEnabledSetting(new ComponentName(MainActivity.this, getPackageName() + ".LauncherNotes"));
            return st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED;
        }

        /* ---------- reminders as phone notifications ---------- */
        @JavascriptInterface
        public boolean canNotify() {
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) return false;
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            return nm != null && nm.areNotificationsEnabled();
        }

        /** Android 13+ shows the system "Allow notifications?" prompt; the answer comes back to window.__sakhiNotify(ok). */
        @JavascriptInterface
        public void askNotify() {
            if (Build.VERSION.SDK_INT >= 33) {
                runOnUiThread(new Runnable() {
                    @Override public void run() { requestPermissions(new String[] { "android.permission.POST_NOTIFICATIONS" }, REQ_NOTIFY); }
                });
            } else {
                notifyResult(canNotify());
            }
        }

        @JavascriptInterface
        public int schedule(String json) { return Reminders.replaceAll(MainActivity.this, json); }

        /** Can reminders ring on the minute? (Android 12+ needs "Alarms and reminders" allowed for the app.) */
        @JavascriptInterface
        public boolean canExactAlarms() {
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            return am != null && Reminders.canExact(am);
        }

        /** Opens the phone's "Alarms and reminders" setting for Sakhi; coming back re-sends the alarms (onResume). */
        @JavascriptInterface
        public void askExactAlarms() {
            if (Build.VERSION.SDK_INT < 31) return;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName()))); }
                    catch (ActivityNotFoundException e) { /* no such screen on this phone */ }
                }
            });
        }

        /** For demos: a notification about five seconds from now. */
        @JavascriptInterface
        public void testNotify(final String title, final String body) {
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override public void run() { ReminderReceiver.post(MainActivity.this, title, body, 4242); }
            }, 5000);
        }

        /* ---------- unlock with fingerprint, face or the phone's own PIN ---------- */
        @JavascriptInterface
        public boolean canBiometric() { return Build.VERSION.SDK_INT >= 28; }

        @JavascriptInterface
        public void biometric(final String title, final String cancelLabel) {
            if (Build.VERSION.SDK_INT < 28) { bio(false); return; }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        BiometricPrompt.Builder b = new BiometricPrompt.Builder(MainActivity.this).setTitle(title);
                        if (Build.VERSION.SDK_INT >= 30) {
                            b.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL);
                        } else if (Build.VERSION.SDK_INT >= 29) {
                            b.setDeviceCredentialAllowed(true);
                        } else {
                            b.setNegativeButton(cancelLabel, getMainExecutor(), new DialogInterface.OnClickListener() {
                                @Override public void onClick(DialogInterface d, int w) { bio(false); }
                            });
                        }
                        b.build().authenticate(new CancellationSignal(), getMainExecutor(), new BiometricPrompt.AuthenticationCallback() {
                            @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) { bio(true); }
                            @Override public void onAuthenticationError(int code, CharSequence msg) { bio(false); }
                        });
                    } catch (Exception e) {
                        bio(false);
                    }
                }
            });
        }

        /** Ask a question by voice: the phone's own voice typing (Hindi or English), text back to window.__sakhiHeard(text). */
        @JavascriptInterface
        public void listen(final String lang, final String prompt) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                    i.putExtra(RecognizerIntent.EXTRA_PROMPT, prompt);
                    i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                    try { startActivityForResult(i, REQ_SPEECH); } catch (ActivityNotFoundException e) { heard(null); }
                }
            });
        }

        @JavascriptInterface
        public boolean copy(String text) {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            if (cm == null) return false;
            cm.setPrimaryClip(ClipData.newPlainText("Qura Sakhi", text));
            return true;
        }
    }

    private void bio(final boolean ok) {
        runOnUiThread(new Runnable() {
            @Override public void run() { web.evaluateJavascript("window.__sakhiBio && window.__sakhiBio(" + ok + ")", null); }
        });
    }

    private void heard(final String text) {
        runOnUiThread(new Runnable() {
            @Override public void run() { web.evaluateJavascript("window.__sakhiHeard && window.__sakhiHeard(" + (text == null ? "null" : quote(text.replace('\n', ' '))) + ")", null); }
        });
    }

    private void notifyResult(final boolean ok) {
        runOnUiThread(new Runnable() {
            @Override public void run() { web.evaluateJavascript("window.__sakhiNotify && window.__sakhiNotify(" + ok + ")", null); }
        });
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
        if (req == REQ_NOTIFY) {
            notifyResult(res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED);
            return;
        }
        super.onRequestPermissionsResult(req, perms, res);
    }

    private static String json(String v) {
        if (v == null) return "null";
        return "\"" + v.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_SPEECH) {
            ArrayList<String> r = (res == RESULT_OK && data != null) ? data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS) : null;
            if (r != null && !r.isEmpty()) heard(r.get(0)); else if (res == RESULT_OK) heard(null);
            return;
        }
        if (req == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onBackPressed() {
        // An open sheet closes first; otherwise each screen is a #route, so WebView history is the app's own back stack.
        web.evaluateJavascript("(window.__sakhiBack && window.__sakhiBack()) ? 1 : 0", new ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if ("1".equals(v)) return;
                if (web.canGoBack()) web.goBack(); else finish();
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /** Back on screen: the page re-sends its reminder alarms so they never run out, and locks (PIN or shared phone) after 30 seconds away. */
    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.__sakhiResume && window.__sakhiResume()", null);
    }

    /** Leaving the screen: the page notes the time, so coming back can tell how long she was away. */
    @Override
    protected void onPause() {
        super.onPause();
        if (ttsReady) tts.stop();
        if (web != null) web.evaluateJavascript("window.__sakhiPause && window.__sakhiPause()", null);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
