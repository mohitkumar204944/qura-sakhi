package com.quranutrition.sakhi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;

/**
 * Wind down (Version 39.21): plays one of the app's own sounds (assets/www/sounds/..., kept uncompressed), so Dr. Megha's
 * session or a sleep sound goes on with the screen off. A sound with a timer stops after it, fading over its last minute
 * (only the time it played counts). A call or another app's sound pauses it, and it carries on after; a "playing"
 * notification (her lock screen shows only its plain line; on a shared phone or in discreet mode, nothing) opens Sakhi or
 * stops it. Nothing here touches the network.
 */
public class SoundService extends Service implements MediaPlayer.OnCompletionListener, AudioManager.OnAudioFocusChangeListener {
    static final String PLAY = "play", PAUSE = "pause", RESUME = "resume", STOP = "stop", TIMER = "timer";
    private static final String CH = "sakhi_sounds";
    private static final int NID = 4310;
    private static final String IDLE = "{\"playing\":false,\"pos\":0,\"dur\":0,\"left\":-1,\"played\":0}";
    private static volatile SoundService self;
    private static volatile String lastState = null;   // what the page reads once a guided session has ended
    private volatile String cache = IDLE;               // the state as the page reads it, refreshed on the main thread
    private final Handler h = new Handler(Looper.getMainLooper());
    private final AudioAttributes attrs = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
    private MediaPlayer mp;
    private AudioFocusRequest afr;
    private long limitMs = 0, playedMs = 0, since = 0;
    private boolean duck = false, heldByFocus = false, secret = false;
    private String title = "Sakhi", text = "", stopLabel = "Stop";
    private int lastStart = 0;   // stop only for the latest request: a "stop" just before a new "play" must not end the new one

    /** Only the app's own sound files. */
    static boolean okPath(String p) { return p != null && p.matches("sounds/[a-z0-9_/-]+\\.ogg") && !p.contains(".."); }

    /** For the page: playing, the track's position and length, her timer's seconds left (-1: none), seconds played. */
    static String state() { SoundService s = self; if (s != null) return s.cache; String l = lastState; return l != null ? l : IDLE; }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent i, int flags, int startId) {
        lastStart = startId; String a = i == null ? null : i.getAction();
        if (PLAY.equals(a)) { play(i.getStringExtra("path"), i.getBooleanExtra("loop", false), i.getIntExtra("minutes", 0), i.getStringExtra("title"), i.getStringExtra("text"), i.getStringExtra("stop"), i.getBooleanExtra("secret", false)); return START_NOT_STICKY; }
        if (mp == null) { if (STOP.equals(a)) lastState = null; stopSelf(startId); return START_NOT_STICKY; }   // nothing playing: nothing to pause, time or stop
        if (PAUSE.equals(a)) { heldByFocus = false; pauseNow(); }
        else if (RESUME.equals(a)) resumeNow();
        else if (TIMER.equals(a)) { limitMs = Math.max(0, i.getIntExtra("minutes", 0)) * 60000L; if (mp != null) mp.setVolume(duck ? 0.3f : 1f, duck ? 0.3f : 1f); }
        else if (STOP.equals(a)) finish(null);
        return START_NOT_STICKY;
    }

    private void play(String path, boolean loop, int minutes, String t, String x, String st, boolean sec) {
        release(); secret = sec;
        title = t == null || t.isEmpty() ? "Sakhi" : t; text = x == null ? "" : x; stopLabel = st == null || st.isEmpty() ? "Stop" : st;
        startForeground(NID, note(true), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);   // promptly, as Android asks
        if (!okPath(path)) { finish(null); return; }
        try {
            AssetFileDescriptor afd = getAssets().openFd("www/" + path);
            mp = new MediaPlayer();
            mp.setAudioAttributes(attrs);
            mp.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);   // the phone stays awake only while it plays
            mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            mp.setLooping(loop);
            mp.setOnCompletionListener(this);
            mp.prepare();
        } catch (Exception e) { finish(null); return; }
        self = this; lastState = null; duck = false; heldByFocus = false;
        limitMs = Math.max(0, minutes) * 60000L; playedMs = 0;
        if (focus()) { mp.start(); since = SystemClock.elapsedRealtime(); }
        h.removeCallbacks(tick); h.post(tick);
    }

    private long played() { return playedMs + (mp != null && mp.isPlaying() ? SystemClock.elapsedRealtime() - since : 0); }

    /** Four times a second: the page's copy of the state, and her timer with its last minute's fade. */
    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (mp == null) return;
            long pl = played();
            if (limitMs > 0) {
                long left = limitMs - pl;
                if (left <= 0) { finish(null); return; }
                float v = left < 60000 ? left / 60000f : 1f; if (duck) v *= 0.3f;
                mp.setVolume(v, v);
            }
            cache = json(mp.isPlaying(), mp.getCurrentPosition() / 1000.0, mp.getDuration() / 1000.0, limitMs > 0 ? Math.max(0, (limitMs - pl) / 1000.0) : -1, pl / 1000.0);
            h.postDelayed(this, 250);
        }
    };

    private static String json(boolean playing, double pos, double dur, double left, double played) {
        return "{\"playing\":" + playing + ",\"pos\":" + pos + ",\"dur\":" + dur + ",\"left\":" + left + ",\"played\":" + played + "}";
    }

    private void pauseNow() {
        if (mp == null || !mp.isPlaying()) return;
        playedMs += SystemClock.elapsedRealtime() - since; mp.pause(); notifyNow(false);
    }

    private void resumeNow() {
        if (mp == null || mp.isPlaying()) return;
        if (focus()) { mp.start(); since = SystemClock.elapsedRealtime(); notifyNow(true); }
    }

    /** A guided session ended: the page keeps its last moment (it shows "done", not the start). */
    @Override public void onCompletion(MediaPlayer m) {
        double d = m.getDuration() / 1000.0;
        finish(json(false, d, d, -1, (played()) / 1000.0));
    }

    private boolean focus() {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return true;
        if (afr == null) afr = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).setAudioAttributes(attrs).setOnAudioFocusChangeListener(this, h).setWillPauseWhenDucked(false).build();
        return am.requestAudioFocus(afr) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
    }

    @Override public void onAudioFocusChange(int c) {
        if (mp == null) return;
        if (c == AudioManager.AUDIOFOCUS_LOSS || c == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) { if (mp.isPlaying()) { pauseNow(); heldByFocus = c == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT; } }
        else if (c == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) { duck = true; mp.setVolume(0.3f, 0.3f); }
        else if (c == AudioManager.AUDIOFOCUS_GAIN) { duck = false; mp.setVolume(1f, 1f); if (heldByFocus) { heldByFocus = false; resumeNow(); } }
    }

    private void release() {
        h.removeCallbacks(tick);
        if (mp != null) { try { mp.stop(); } catch (Exception e) { /* not started */ } mp.release(); mp = null; }
    }

    private void finish(String last) {
        release();
        lastState = last; cache = IDLE; self = null;
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am != null && afr != null) am.abandonAudioFocusRequest(afr);
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf(lastStart);
    }

    @Override public void onDestroy() { release(); if (self == this) self = null; super.onDestroy(); }

    private void notifyNow(boolean playing) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NID, note(playing));
    }

    private Notification note(boolean playing) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && nm.getNotificationChannel(CH) == null) {
            NotificationChannel c = new NotificationChannel(CH, "Sounds", NotificationManager.IMPORTANCE_LOW);
            c.setShowBadge(false); c.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(this, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, NID, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent stop = PendingIntent.getService(this, NID + 1, new Intent(this, SoundService.class).setAction(STOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification pub = new Notification.Builder(this, CH).setSmallIcon(R.drawable.ic_stat).setContentTitle(text.isEmpty() ? "Sakhi" : text).build();
        return new Notification.Builder(this, CH)
                .setSmallIcon(R.drawable.ic_stat).setContentTitle(title).setContentText(text).setContentIntent(pi)
                .setOngoing(playing).setShowWhen(false).setColor(0xFF5B6470).setCategory(Notification.CATEGORY_SERVICE)
                .setVisibility(secret ? Notification.VISIBILITY_SECRET : Notification.VISIBILITY_PRIVATE).setPublicVersion(secret ? null : pub)
                .addAction(new Notification.Action.Builder(null, stopLabel, stop).build()).setDeleteIntent(stop)   // swiping it away (when paused) stops it
                .build();
    }
}
