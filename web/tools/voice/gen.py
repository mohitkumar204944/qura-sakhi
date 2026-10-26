# -*- coding: utf-8 -*-
# Generates each clip of sessions.json in Dr. Megha's cloned voice (MiniMax speech-02-hd on Replicate). Skips clips already made;
# stops at the first error. Usage: gen.py <sessions.json> <out dir> [lang ...]
import json, os, pathlib, sys, time, urllib.request
VOICE = pathlib.Path('/Users/mohitkumar/Desktop/megha-voice')
for line in (VOICE / '.env').read_text().splitlines():
    if '=' in line:
        k, v = line.split('=', 1); os.environ[k.strip()] = v.strip()
import replicate
spec = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
langs = sys.argv[3:] or ['en', 'hi']
vid = {'en': (VOICE / 'megha_voice_id.txt').read_text().strip(), 'hi': (VOICE / 'megha_voice_id_hindi.txt').read_text().strip()}
boost = {'en': 'English', 'hi': 'Hindi'}
chars = 0
for lang in langs:
    for cid, text in spec['clips'][lang].items():
        dest = out / ('%s-%s.mp3' % (lang, cid))
        if dest.exists() and dest.stat().st_size > 1000:
            continue
        o = None
        for attempt in range(6):   # under $5 of credit Replicate allows 6 requests a minute: pace, and wait when throttled
            try:
                o = replicate.run('minimax/speech-02-hd', input={'text': text, 'voice_id': vid[lang], 'language_boost': boost[lang], 'emotion': 'calm',
                                                                 'speed': 0.9, 'sample_rate': 44100, 'bitrate': 128000, 'audio_format': 'mp3', 'channel': 'mono'})
                break
            except Exception as e:
                if '429' in str(e) and attempt < 5: time.sleep(12); continue
                print('STOPPED at %s-%s: %s' % (lang, cid, str(e)[:300])); print('characters sent so far:', chars); sys.exit(1)
        if isinstance(o, list): o = o[0]
        if hasattr(o, 'read'): dest.write_bytes(o.read())
        else: urllib.request.urlretrieve(getattr(o, 'url', str(o)), str(dest))
        chars += len(text)
        print('made %s-%s  %d KB' % (lang, cid, dest.stat().st_size // 1024), flush=True)
        time.sleep(10.5)
print('done; characters sent:', chars)
