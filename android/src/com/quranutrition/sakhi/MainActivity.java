package com.quranutrition.sakhi;

import android.app.Activity;
import android.app.AlarmManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipDescription;
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
import android.os.PersistableBundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.app.NotificationManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.HapticFeedbackConstants;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebBackForwardList;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
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
    /** A tapped notification's screen (Version 34), opened once the page has loaded. */
    private String pendingGo;
    private ValueCallback<Uri[]> fileCallback;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        // The recent-apps list shows Sakhi's icon, never a picture of her diary (Android 13+; older phones get FLAG_SECURE
        // from the page while lock, shared-phone or discreet mode is on).
        if (Build.VERSION.SDK_INT >= 33) setRecentsScreenshotEnabled(false);
        tts = new TextToSpeech(this, this);
        pendingGo = goOf(getIntent());
        makeWeb();
        WebBackForwardList restored = state != null ? web.restoreState(state) : null;
        if (restored == null || restored.getSize() == 0) web.loadUrl(START);   // nothing to restore, or the restore failed
    }

    private static final String START = "file:///android_asset/www/index.html";

    /** One WebView for the bundled app. Called again if Android kills the page's renderer. */
    private void makeWeb() {
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // the diary lives in localStorage
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        // Text follows the phone's font size setting (Settings > Display > Font size), up to 200%.
        s.setTextZoom(Math.round(getResources().getConfiguration().fontScale * 100));

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

            /** A notification opened the app: go to its screen once the page is ready (the PIN lock, if on, comes first). */
            @Override
            public void onPageFinished(WebView view, String url) {
                if (pendingGo != null && view == web) { openRoute(pendingGo); pendingGo = null; }
            }

            /** The page's renderer crashed or was killed to free memory. Her diary is safe in localStorage: start a fresh
             *  WebView on Home instead of leaving a dead screen (or letting the whole app close). */
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view != web) return true;
                if (web.getParent() instanceof ViewGroup) ((ViewGroup) web.getParent()).removeView(web);
                web.destroy();
                makeWeb();
                web.loadUrl(START);
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
                    Voice local = localVoice(v.getLocale());
                    Voice show = local != null ? local : v;
                    if (b.length() > 1) b.append(',');
                    b.append("{\"lang\":").append(json(tag))
                     .append(",\"name\":").append(json(show.getName()))
                     .append(",\"localService\":").append(local != null)
                     .append(",\"default\":false}");
                }
            } catch (Exception e) { /* some engines throw before voices load */ }
            return b.append(']').toString();
        }

        /** Reads aloud with a voice that runs on the phone when there is one, so her screen's words don't go to a speech
         *  server (audit fix 8). Only if the language has no installed voice does the engine's own choice speak. */
        @JavascriptInterface
        public boolean speak(String text, String lang, float rate, String id) {
            if (!ttsReady) return false;
            Locale loc = Locale.forLanguageTag(lang);
            int r = tts.setLanguage(loc);
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) return false;
            Voice local = localVoice(loc);
            if (local != null) tts.setVoice(local);
            tts.setSpeechRate(rate > 0 ? rate : 1f);
            String t = text.length() > 3800 ? text.substring(0, 3800) : text;
            return tts.speak(t, TextToSpeech.QUEUE_FLUSH, null, id) == TextToSpeech.SUCCESS;
        }

        @JavascriptInterface
        public void stop() { if (ttsReady) tts.stop(); }

        /* ---------- a second copy of the diary (Version 32, field-test audit 2.6) ----------
           The WebView writes localStorage to disk in batches, up to a minute late, so an entry logged just before Android
           closes Sakhi could be lost. The page hands every save here too, and it is written at once to the app's private
           storage: a temp file, then a rename, so a half-written copy never replaces a good one. Never backed up
           (allowBackup is false) and never sent anywhere. An empty string deletes it (Delete everything). */
        @JavascriptInterface
        public boolean saveState(String json) {
            File f = new File(getFilesDir(), "diary.json");
            if (json == null || json.length() == 0) { f.delete(); return true; }
            File tmp = new File(getFilesDir(), "diary.json.tmp");
            try {
                FileOutputStream out = new FileOutputStream(tmp);
                try { out.write(json.getBytes("UTF-8")); } finally { out.close(); }
                return tmp.renameTo(f);
            } catch (Exception e) { return false; }
        }

        @JavascriptInterface
        public String loadState() {
            File f = new File(getFilesDir(), "diary.json");
            if (!f.exists() || f.length() > 64L * 1024 * 1024) return "";
            try {
                byte[] b = new byte[(int) f.length()];
                FileInputStream in = new FileInputStream(f);
                try { int off = 0; while (off < b.length) { int n = in.read(b, off, b.length - off); if (n < 0) break; off += n; } } finally { in.close(); }
                return new String(b, "UTF-8");
            } catch (Exception e) { return ""; }
        }

        /** A light tick on taps, like a native app. */
        @JavascriptInterface
        public void haptic() {
            runOnUiThread(new Runnable() {
                @Override public void run() { web.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY); }
            });
        }

        /** No screenshots, screen recording or recent-apps picture while lock, shared-phone or discreet mode is on. */
        @JavascriptInterface
        public void setSecure(final boolean on) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                }
            });
        }

        /** Keeps the screen on while she follows a yoga or strength routine: its timer and the read-aloud stop when the screen sleeps. */
        @JavascriptInterface
        public void keepAwake(final boolean on) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        /** Android's share sheet: she picks the app and the person. Replaces wa.me links, which put the words in a web address. */
        @JavascriptInterface
        public boolean share(String title, String text) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
            if (title != null && title.length() > 0) send.putExtra(Intent.EXTRA_TITLE, title);
            try { startActivity(Intent.createChooser(send, title)); return true; }
            catch (ActivityNotFoundException e) { return false; }
        }

        /** The phone's own print screen for the page on show (the doctor report): Save as PDF, or a printer. */
        @JavascriptInterface
        public void printPage(final String title) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (pm == null) return;
                    String name = title == null || title.length() == 0 ? "Sakhi" : title;
                    try { pm.print(name, web.createPrintDocumentAdapter(name), new PrintAttributes.Builder().build()); }
                    catch (Exception e) { /* no print service on this phone */ }
                }
            });
        }

        /** The phone's maker, so Me can show battery-saving help on phones known to stop reminders. */
        @JavascriptInterface
        public String maker() { return Build.MANUFACTURER == null ? "" : Build.MANUFACTURER; }

        /** Sakhi's page in the phone's Settings (Battery, Notifications). */
        @JavascriptInterface
        public void openAppSettings() {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); }
                    catch (ActivityNotFoundException e) { /* no such screen on this phone */ }
                }
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

        /** "Send a test notification": one about five seconds from now, hidden from the lock screen like a real reminder
         *  when discreet mode is on (secret). */
        @JavascriptInterface
        public void testNotify(final String title, final String body, final boolean secret) {
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override public void run() { ReminderReceiver.post(MainActivity.this, title, body, 4242, secret); }
            }, 5000);
        }

        /* ---------- unlock with a fingerprint (strong biometrics only), when she turned it on ----------
           Never the phone's own PIN, pattern or a weak face unlock: the person holding her phone often knows or has those. */
        @JavascriptInterface
        public boolean canBiometric() {
            if (Build.VERSION.SDK_INT < 29) return false;
            BiometricManager bm = (BiometricManager) getSystemService(Context.BIOMETRIC_SERVICE);
            if (bm == null) return false;
            if (Build.VERSION.SDK_INT >= 30) return bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS;
            return bm.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS;
        }

        @JavascriptInterface
        public void biometric(final String title, final String cancelLabel) {
            if (!canBiometric()) { bio(false); return; }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        BiometricPrompt.Builder b = new BiometricPrompt.Builder(MainActivity.this).setTitle(title);
                        if (Build.VERSION.SDK_INT >= 30) b.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG);
                        b.setNegativeButton(cancelLabel, getMainExecutor(), new DialogInterface.OnClickListener() {
                            @Override public void onClick(DialogInterface d, int w) { bio(false); }
                        });
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
            ClipData clip = ClipData.newPlainText("Sakhi", text);
            if (Build.VERSION.SDK_INT >= 24) {
                PersistableBundle extras = new PersistableBundle();
                extras.putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true);   // a constant, so this works below Android 13 too
                clip.getDescription().setExtras(extras);
            }
            cm.setPrimaryClip(clip);
            return true;
        }
    }

    /** The best installed voice for this language that runs without the network (same country first), or null. */
    private Voice localVoice(Locale want) {
        Voice best = null; int bestScore = -1;
        try {
            Set<Voice> vs = tts.getVoices();
            if (vs == null) return null;
            for (Voice v : vs) {
                Locale l = v.getLocale();
                if (!l.getLanguage().equals(want.getLanguage()) || v.isNetworkConnectionRequired()) continue;
                Set<String> f = v.getFeatures();
                if (f != null && f.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                int score = (l.getCountry().equals(want.getCountry()) ? 1000 : 0) + v.getQuality();
                if (score > bestScore) { best = v; bestScore = score; }
            }
        } catch (Exception e) { /* some engines throw before voices load */ }
        return best;
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

    /** A notification tapped while Sakhi is already open. */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String go = goOf(intent);
        if (go != null) openRoute(go);
    }

    private static String goOf(Intent i) {
        String go = i == null ? null : i.getStringExtra("go");
        return ReminderMath.okRoute(go) ? go : null;
    }

    private void openRoute(String go) {
        if (web != null && ReminderMath.okRoute(go)) web.evaluateJavascript("window.__sakhiOpen && window.__sakhiOpen('" + go + "')", null);
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
