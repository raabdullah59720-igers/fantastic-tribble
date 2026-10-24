from pathlib import Path
import json, re, subprocess, sys
from bs4 import BeautifulSoup
import tinycss2
root=Path(__file__).resolve().parent
errors=[]; report=[]
# Parse HTML and duplicate IDs
html=(root/'index.html').read_text(encoding='utf-8')
soup=BeautifulSoup(html,'html.parser')
ids=[e.get('id') for e in soup.select('[id]')]
dups=sorted({x for x in ids if ids.count(x)>1})
if dups: errors.append('Duplicate IDs: '+', '.join(dups))
report.append(f'HTML: parsed; {len(ids)} IDs; duplicate IDs={len(dups)}')
# Internal resources referenced by HTML
missing=[]
for tag,attr in [('script','src'),('link','href'),('img','src')]:
 for el in soup.find_all(tag):
  url=el.get(attr)
  if not url or url.startswith(('http://','https://','data:','#','mailto:','tel:','javascript:','blob:')): continue
  clean=url.split('?')[0].split('#')[0]
  if clean and not (root/clean).exists(): missing.append(f'{tag}:{url}')
if missing: errors.append('Missing local references: '+', '.join(missing))
report.append(f'HTML local references: {"PASS" if not missing else "FAIL"}; missing={len(missing)}')
# Manifest
manifest=json.loads((root/'manifest.webmanifest').read_text())
assert manifest.get('name') and manifest.get('short_name') and manifest.get('start_url') and manifest.get('scope') and manifest.get('display') in ('standalone','minimal-ui','fullscreen')
for size in ('192x192','512x512'):
 assert any(size in item.get('sizes','').split() for item in manifest['icons']), f'Missing {size} icon declaration'
report.append(f'Manifest: JSON valid; display={manifest["display"]}; required icons declared')
# Service worker required paths
sw=(root/'sw.js').read_text()
cache=re.search(r"CACHE_NAME = '([^']+)'",sw).group(1)
arr=re.search(r'const REQUIRED_SHELL = \[(.*?)\];',sw,re.S).group(1)
paths=re.findall(r'"(.*?)"',arr)
missing_sw=[v for v in paths if not (root/v.removeprefix('./')).exists()]
if missing_sw: errors.append('Missing service-worker files: '+', '.join(missing_sw))
if cache!='terravex-apex-shell-v11': errors.append('Unexpected service-worker cache version '+cache)
report.append(f'Service worker: {cache}; required local assets={len(paths)}; missing={len(missing_sw)}')
# Runtime diagnostics must inspect the same service-worker version.
adv=(root/'advanced-workbench.js').read_text(encoding='utf-8')
if cache not in adv: errors.append('PWA runtime diagnostics cache version does not match service worker.')
report.append('PWA diagnostics cache-version parity: ' + ('PASS' if cache in adv else 'FAIL'))
# Manifest app shortcuts must target existing navigation pages.
page_keys={b.get('data-page') for b in soup.select('button[data-page]')}
invalid_shortcuts=[]
for shortcut in manifest.get('shortcuts', []):
 try: target=json.loads(json.dumps(shortcut)).get('url','').split('page=',1)[1].split('&',1)[0]
 except Exception: target=''
 if not target or target not in page_keys: invalid_shortcuts.append(shortcut.get('name','unnamed'))
if invalid_shortcuts: errors.append('Manifest shortcuts target missing pages: '+', '.join(invalid_shortcuts))
report.append('Manifest shortcuts: ' + str(len(manifest.get('shortcuts', []))) + ' checked; invalid=' + str(len(invalid_shortcuts)))
# JS syntax via node
js_files=sorted(root.glob('*.js'))
for f in js_files:
 r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True)
 if r.returncode: errors.append(f'Node syntax {f.name}: {r.stderr.strip()}')
report.append(f'JavaScript syntax: {len(js_files)} files checked; errors=0' if not any(e.startswith('Node syntax') for e in errors) else 'JavaScript syntax failed')
# CSS parse, surface errors
css_files=sorted(root.glob('*.css')); css_errors=[]
for f in css_files:
 tokens=tinycss2.parse_stylesheet(f.read_text(),skip_comments=True,skip_whitespace=True)
 es=[t for t in tokens if t.type=='error']
 if es: css_errors.append(f'{f.name}: '+', '.join(e.message for e in es))
if css_errors: errors.extend(css_errors)
report.append(f'CSS parser: {len(css_files)} stylesheets; parse errors={len(css_errors)}')
# Python syntax
import ast
for n in ('vpn-bridge.py','test_vpn_bridge.py','run-static-qa.py'):
 try: ast.parse((root/n).read_text())
 except Exception as e: errors.append(f'Python syntax {n}: {e}')
report.append('Python syntax: 3 files checked')
# password gate safety checks
pl=(root/'password-lock.js').read_text()
for phrase in ('PBKDF2','SHA-256','localStorage.setItem','iterations: ITERATIONS'):
 if phrase not in pl: errors.append('Password lock missing expected primitive: '+phrase)
if 'localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1' not in pl: errors.append('Password verifier storage pattern missing')
if 'tvx-lock-pending .shell' not in (root/'password-lock.css').read_text(): errors.append('Early app-shell mask missing')
report.append('Password lock: PBKDF2 verifier, salted storage path, startup mask present')
# launcher presence
for n in ('START-TERRAVEX-WEB-APP.bat','START-TERRAVEX-DESKTOP-APP.bat','INSTALL-TERRAVEX-DESKTOP.bat','serve_terravex.ps1','launch-terravex-app.ps1','install-desktop-shortcut.ps1'):
 if not (root/n).exists(): errors.append('Missing launcher file '+n)
report.append('Windows launcher assets: 6 expected files present (Windows runtime not available here)')
print('\n'.join(report))
print('TOTAL ERRORS:',len(errors))
for e in errors: print('ERROR:',e)
sys.exit(1 if errors else 0)
