/* Android app only: the WebView has no Web Speech API and a limited clipboard, so these come from the native bridge. */
(function () {
  'use strict';
  var B = window.SakhiAndroid; if (!B) return;

  if (!window.speechSynthesis) {
    var queue = [], current = null, seq = 0;
    var Utt = function (text) { this.text = String(text || ''); this.lang = 'en-IN'; this.rate = 1; this.voice = null; this.onend = null; this.onerror = null; };
    var fire = function (u, ok, err) { try { if (ok) { if (u.onend) u.onend({}); } else if (u.onerror) u.onerror({ error: err || 'synthesis-failed' }); } catch (e) { } };
    var next = function () {
      if (current || !queue.length) return;
      current = queue.shift(); current._id = 'u' + (++seq);
      var lang = (current.voice && current.voice.lang) || current.lang || 'en-IN';
      var ok = false; try { ok = B.speak(current.text, lang, current.rate || 1, current._id); } catch (e) { ok = false; }
      if (!ok) { var u = current; current = null; queue = []; fire(u, false, 'language-unavailable'); }
    };
    window.__sakhiTtsDone = function (id, ok) {
      if (!current || current._id !== id) return;
      var u = current; current = null; fire(u, ok, ok ? '' : 'interrupted'); next();
    };
    window.SpeechSynthesisUtterance = Utt;
    window.speechSynthesis = {
      get speaking() { return !!current; },
      get pending() { return queue.length > 0; },
      speak: function (u) { queue.push(u); next(); },
      cancel: function () { var u = current; queue = []; current = null; try { B.stop(); } catch (e) { } if (u) fire(u, false, 'canceled'); },
      getVoices: function () { try { return JSON.parse(B.voices() || '[]'); } catch (e) { return []; } },
      addEventListener: function () { }, removeEventListener: function () { }
    };
  }

  try {
    var write = function (t) { return B.copy(String(t)) ? Promise.resolve() : Promise.reject(new Error('copy failed')); };
    if (navigator.clipboard) navigator.clipboard.writeText = write;
    else Object.defineProperty(navigator, 'clipboard', { value: { writeText: write } });
  } catch (e) { }
})();

/* A light vibration when a button, chip or row is pressed (native feel). */
(function () {
  'use strict';
  var B = window.SakhiAndroid; if (!B || !B.haptic) return;
  var last = 0;
  document.addEventListener('pointerdown', function (e) {
    var el = e.target && e.target.closest && e.target.closest('button, .item, .chip, .action, [data-go], [data-back], input[type=checkbox]');
    if (!el) return; var now = Date.now(); if (now - last < 60) return; last = now;
    try { B.haptic(); } catch (x) { }
  }, true);
})();
