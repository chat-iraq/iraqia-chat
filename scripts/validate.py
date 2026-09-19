#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Automated QA per s.txt 51. Stdlib only. Exits non-zero on critical issues."""
import os, sys, re, io, json, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRICT = '--strict' in sys.argv
DOMAIN = 'https://www.iraqia-chat.com'
SKIP_DIRS = ('.git', 'seo', 'admin', 'scripts', '.github')
# Legacy standalone vanity chat-app folders: kept in the DS shell for consistency,
# but excluded from the managed content-set checks (their inline legacy markup is not part of the content system).
LEGACY_PREFIXES = ('baghdady', 'banota', 'chatf2', 'hams0', 'jawal', 'ksa-3', 'l7n',
                   'baghdad', 'broq', 'insta', 'kaz')

def read(p):
    try:
        with io.open(p, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception:
        return ''

def rel(p):
    return os.path.relpath(p, ROOT).replace('\\', '/')

html_files = []
for dp, dn, fn in os.walk(ROOT):
    parts = dp.replace('\\', '/').split('/')
    if any(s in parts for s in SKIP_DIRS):
        continue
    for n in fn:
        if n.lower().endswith(('.html', '.htm')):
            html_files.append(os.path.join(dp, n))

def _legacy_relpath(p):
    r = os.path.relpath(p, ROOT).replace('\\', '/')
    return any(r == d + '/index.html' or r.startswith(d + '/') for d in LEGACY_PREFIXES)

html_files = [p for p in html_files if not _legacy_relpath(p)]

managed = [p for p in html_files if 'premium.min.css' in read(p)]

titles, descs = {}, {}
errors, warns = [], []
noindex_pages = set()

def add_err(m):
    errors.append(m)

def add_warn(m):
    warns.append(m)

for p in managed:
    c = read(p)
    r = rel(p)
    t = re.search(r'<title[^>]*>(.*?)</title>', c, re.S)
    if not t or not t.group(1).strip():
        add_err(r + ' :: missing-title')
    else:
        k = t.group(1).strip()
        titles.setdefault(k, []).append(r)
    d = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', c, re.I)
    if not d or not d.group(1).strip():
        add_err(r + ' :: missing-description')
    else:
        descs.setdefault(d.group(1).strip(), []).append(r)
    h1 = re.findall(r'<h1[^>]*>', c, re.I)
    if len(h1) == 0:
        add_err(r + ' :: missing-h1')
    elif len(h1) > 1:
        add_warn(r + ' :: multiple-h1(%d)' % len(h1))
    if not re.search(r'rel=["\']canonical["\']', c, re.I):
        add_err(r + ' :: missing-canonical')
    if not re.search(r'property=["\']og:image["\']', c, re.I):
        add_warn(r + ' :: missing-og-image')
    for m in re.finditer(r'<img\b[^>]*>', c, re.I):
        tag = m.group(0)
        if not re.search(r'\balt\s*=', tag, re.I):
            add_err(r + ' :: img-missing-alt')
        if not (re.search(r'\bwidth\s*=', tag, re.I) and re.search(r'\bheight\s*=', tag, re.I)):
            add_warn(r + ' :: img-missing-dimensions')
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', c, re.S | re.I):
        try:
            json.loads(m.group(1))
        except Exception as e:
            add_err(r + ' :: invalid-jsonld(%s)' % type(e).__name__)
    if re.search(r'name=["\']robots["\'][^>]+noindex', c, re.I):
        noindex_pages.add(r)

# duplicate titles/descriptions
for k, v in titles.items():
    if len(v) > 1:
        add_warn('duplicate-title :: %s :: %s' % (k[:60], ', '.join(v[:4])))
for k, v in descs.items():
    if len(v) > 1:
        add_warn('duplicate-description :: %s :: %s' % (k[:60], ', '.join(v[:4])))

# broken internal links on managed pages
def resolve(base_dir, ref):
    segs = (base_dir + '/' + ref).split('/')
    out = []
    for s in segs:
        if s in ('', '.'):
            continue
        if s == '..':
            if out:
                out.pop()
        else:
            out.append(s)
    return '/'.join(out)

broken = 0
for p in managed:
    c = read(p)
    r = rel(p)
    d = os.path.dirname(r)
    for m in re.finditer(r'(?:href|src)\s*=\s*["\']([^"\']+)["\']', c, re.I):
        raw = html.unescape(m.group(1)).strip()
        if re.match(r'^(#|mailto:|tel:|javascript:|data:|about:)', raw, re.I):
            continue
        ref = raw.split('?')[0].split('#')[0]
        if ref == '' or ref == '/':
            continue
        if ref.startswith('http'):
            if ref.startswith(DOMAIN):
                ref = ref[len(DOMAIN):]
            else:
                continue
        if ref.startswith('/'):
            cand = ref.lstrip('/')
        else:
            cand = resolve(d, ref)
        full = os.path.join(ROOT, cand.replace('/', os.sep))
        if not os.path.exists(full):
            broken += 1
            add_err('%s :: broken-link(%s)' % (r, raw))

# JSON validity in seo/
for p in glob.glob(os.path.join(ROOT, 'seo', '*.json')):
    try:
        json.loads(read(p))
    except Exception as e:
        add_err('seo/%s :: invalid-json' % os.path.basename(p))

# sitemap checks
smp = os.path.join(ROOT, 'sitemap.xml')
smlocs = []
if os.path.exists(smp):
    c = read(smp)
    smlocs = re.findall(r'<loc>\s*([^<]+?)\s*</loc>', c)
    for loc in smlocs:
        if loc.startswith(DOMAIN):
            local = loc[len(DOMAIN):].lstrip('/')
            if local and os.path.exists(os.path.join(ROOT, local.replace('/', os.sep))):
                lc = read(os.path.join(ROOT, local.replace('/', os.sep)))
                if re.search(r'name=["\']robots["\'][^>]+noindex', lc, re.I):
                    add_warn('sitemap-noindex :: ' + loc)
    if c.count('<loc>') != c.count('</loc>'):
        add_err('sitemap.xml :: unbalanced-loc')
else:
    add_err('sitemap.xml :: missing')

# oversized assets
for dp, dn, fn in os.walk(ROOT):
    if '.git' in dp.replace('\\', '/').split('/'):
        continue
    for n in fn:
        if n.lower().endswith(('.jpg', '.png', '.gif', '.webp', '.avif')):
            fp = os.path.join(dp, n)
            try:
                if os.path.getsize(fp) > 2 * 1024 * 1024:
                    add_warn('oversized-asset :: %s' % rel(fp))
            except OSError:
                pass

print('== validate.py | root=%s | html=%d managed=%d strict=%s' % (ROOT, len(html_files), len(managed), STRICT))
print('   titles=%d desc=%d brokenManagedLinks=%d errors=%d warnings=%d' % (len(titles), len(descs), broken, len(errors), len(warns)))
for e in errors[:40]:
    print('   ERROR ' + e)
for w in warns[:25]:
    print('   WARN  ' + w)

critical = [e for e in errors if ('broken-link' in e or 'missing-title' in e or 'missing-h1' in e
            or 'missing-canonical' in e or 'invalid-jsonld' in e or 'invalid-json' in e)]
if critical:
    print('FAIL: %d critical issue(s)' % len(critical))
    sys.exit(1)
if STRICT and warns:
    print('FAIL(strict): %d warning(s)' % len(warns))
    sys.exit(1)
print('OK')
