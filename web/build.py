"""Write the module <script> tags into index.html (between the MODULES markers), in mods/order.json order."""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
order = json.load(open(os.path.join(here, 'mods', 'order.json')))
present = [m for m in order if os.path.exists(os.path.join(here, 'mods', m + '.js'))]
tags = '\n'.join('<script src="mods/%s.js" charset="utf-8"></script>' % m for m in present)
p = os.path.join(here, 'index.html')
s = open(p, encoding='utf-8').read()
s = re.sub(r'<!-- MODULES:START -->[\s\S]*?<!-- MODULES:END -->', '<!-- MODULES:START -->\n' + tags + '\n<!-- MODULES:END -->', s)
open(p, 'w', encoding='utf-8').write(s)
print('modules wired:', ', '.join(present))
missing = [m for m in order if m not in present]
if missing: print('missing:', ', '.join(missing))
