"""Assemble content/<group>.json (written by the Learn-library workflow) into the single content.json the app fetches.
Reviewer notes stay out of the published file."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
GROUPS = [
    ('cycle', 'Periods and cycles', 'पीरियड और साइकिल'),
    ('pmos', 'PMOS (PCOS)', 'PMOS (PCOS)'),
    ('conceive', 'Planning a baby', 'बच्चे की योजना'),
    ('pregnancy', 'Pregnancy and schemes', 'गर्भावस्था और योजनाएँ'),
    ('intimate', 'Personal care', 'निजी देखभाल'),
    ('midlife', 'After 35', '35 के बाद'),
    ('mind_body', 'Mind and food', 'मन और खाना'),
    ('services', 'Free services', 'मुफ़्त सेवाएँ'),
]
KEEP = ['id', 'title_en', 'title_hi', 'summary_en', 'summary_hi', 'body_en', 'body_hi', 'see_doctor_en', 'see_doctor_hi', 'qura_line_en', 'qura_line_hi', 'sources']
out = {'groups': [], 'generated': '2026-10-18'}
for gid, en, hi in GROUPS:
    p = os.path.join(here, 'content', gid + '.json')
    if not os.path.exists(p):
        print('missing', gid); continue
    g = json.load(open(p, encoding='utf-8'))
    arts = [{k: a[k] for k in KEEP if k in a} for a in g.get('articles', [])]
    out['groups'].append({'group': gid, 'title_en': en, 'title_hi': hi, 'articles': arts})
json.dump(out, open(os.path.join(here, 'content.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('groups', len(out['groups']), 'articles', sum(len(g['articles']) for g in out['groups']), 'bytes', os.path.getsize(os.path.join(here, 'content.json')))
