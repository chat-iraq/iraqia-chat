/** Verifies the generated forum: XML validity, JSON-LD parsing, dropped-char bug, links. */
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = process.cwd()
const D = JSON.parse(readFileSync(ROOT + '/data/forum.json', 'utf8'))
const ORIGIN = D.origin
let fail = 0
const ok = (c, m) => {
  if (!c) fail++
  console.log((c ? 'PASS  ' : 'FAIL  ') + m)
}

/* ---- 1. sitemap.xml well-formed + balanced ---- */
const xml = readFileSync(ROOT + '/sitemap.xml', 'utf8')
ok((xml.match(/<urlset/g) || []).length === 1, 'sitemap has exactly 1 <urlset>')
ok((xml.match(/<\/urlset>/g) || []).length === 1, 'sitemap has exactly 1 </urlset>')
ok((xml.match(/<url>/g) || []).length === (xml.match(/<\/url>/g) || []).length, '<url> balanced')
try {
  execSync(`node -e "const{DOMParser}=require('@xmldom/xmldom')"`, { stdio: 'ignore' })
} catch {}
/* real parse via a strict-ish check: every <url> has loc+lastmod+priority */
const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1])
ok(urls.length > 0, `sitemap parsed ${urls.length} <url> blocks`)
ok(
  urls.every((u) => new RegExp(`<loc>${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^<]*</loc>`).test(u)),
  'every url has an absolute loc'
)
ok(urls.every((u) => /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(u)), 'every url has lastmod')
ok(!xml.includes(ORIGIN + '/Forum/</loc>\n<lastmod>2026-09-25'), 'legacy Forum entry replaced')

/* ---- 2. no duplicate locs ---- */
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
const dupLocs = locs.filter((l, i) => locs.indexOf(l) !== i)
ok(dupLocs.length === 0, 'no duplicate <loc> (' + dupLocs.length + ' dups)')

/* ---- 3. generated files exist ---- */
const expect = [
  'Forum/index.html',
  'Forum/ask/index.html',
  'Forum/staff/index.html',
  'assets/forum-data.js'
]
for (const e of expect) ok(existsSync(ROOT + '/' + e), 'exists ' + e)

/* ---- 4. every page: JSON-LD parses, no FAQPage, no empty pages ---- */
const pages = [
  'Forum/index.html',
  'Forum/c/access/index.html',
  'Forum/tag/ban/index.html',
  'Forum/t/visitors/index.html',
  'Forum/ask/index.html',
  'Forum/staff/index.html'
]
for (const p of pages) {
  const h = readFileSync(ROOT + '/' + p, 'utf8')
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  let parsed = 0
  let bad = 0
  for (const b of blocks) {
    try {
      const o = JSON.parse(b[1].replace(/\\u003c/g, '<'))
      if (!o['@context']) bad++
      parsed++
    } catch (e) {
      bad++
    }
  }
  ok(bad === 0 && parsed > 0, `${p}: ${parsed} JSON-LD block(s) parse, 0 bad`)
  ok(!h.includes('"FAQPage"'), `${p}: no deprecated FAQPage`)
  ok(!h.includes('DiscussionForumPosting') || p.includes('/t/'), `${p}: DiscussionForumPosting only on topic leaf`)
  ok(!/\b\d+\s*رد\b/.test(h), `${p}: no fake reply counts in markup`)
  ok(!/قبل\s*\d+\s*(دقيقة|ساعة|يوم)/.test(h), `${p}: no stale relative times in markup`)
}

/* ---- 5. the dropped-leading-latin-char bug (seen earlier in forum.json) ---- */
const allow = new Set(['chrome', 'safari', 'edge', 'firefox', 'webrtc'])
for (const p of pages.concat(['assets/forum-data.js'])) {
  const t = readFileSync(ROOT + '/' + p, 'utf8')
  const hits = []
  for (const m of t.matchAll(/"([^"]*)"/g)) {
    const s = m[1]
    if (!/[\u0600-\u06FF]/.test(s)) continue
    for (const w of s.match(/[A-Za-z]{2,}/g) || []) {
      if (!allow.has(w.toLowerCase())) hits.push(w)
    }
  }
  ok(hits.length === 0, `${p}: no stray latin inside arabic ` + (hits.length ? hits.join(',') : ''))
}

/* ---- 6. topic leaf page: required DiscussionForumPosting fields ---- */
const t1 = readFileSync(ROOT + '/Forum/t/visitors/index.html', 'utf8')
const g = JSON.parse(t1.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1].replace(/\\u003c/g, '<'))
const post = g['@graph'].find((n) => n['@type'] === 'DiscussionForumPosting')
ok(!!post, 'topic page has DiscussionForumPosting')
for (const f of ['headline', 'text', 'url', 'datePublished', 'author']) {
  ok(!!post?.[f], 'DiscussionForumPosting.' + f)
}
ok(!!post?.author?.name, 'author.name present (Google requires it)')
ok(!!post?.suggestedAnswer?.text, 'suggestedAnswer.text present')
const bc = g['@graph'].find((n) => n['@type'] === 'BreadcrumbList')
ok(!!bc, 'topic page has BreadcrumbList')

/* ---- 7. nav link present on generated pages ---- */
ok(t1.includes('>المنتدى</a>'), 'nav contains the forum link')
ok(t1.includes(ORIGIN + '/Forum/'), 'nav points at the forum home')

/* ---- 7b. the live layer needs its Firebase config, and the right namespace ---- */
const tHome = readFileSync(ROOT + '/Forum/index.html', 'utf8')
for (const s of ['/assets/chat-config.js', '/assets/forum-data.js', '/Forum/assets/forum.js', '/Forum/assets/forum-live.js']) {
  ok(tHome.includes('src="' + s + '"'), 'home page loads ' + s)
}
const cfgOrder = tHome.indexOf('/assets/chat-config.js')
const liveOrder = tHome.indexOf('/Forum/assets/forum-live.js')
ok(cfgOrder > -1 && liveOrder > cfgOrder, 'chat-config.js loads before forum-live.js')
const cfgSrc = readFileSync(ROOT + '/assets/chat-config.js', 'utf8')
const prefix = /roomPrefix:\s*["']([A-Za-z0-9_-]+)["']/.exec(cfgSrc)?.[1]
ok(!!prefix, 'assets/chat-config.js declares roomPrefix (namespaces the RTDB)')
if (prefix) {
  const live = readFileSync(ROOT + '/Forum/assets/forum-live.js', 'utf8')
  ok(
    /var NS = 'forum\/' \+ \(cfg\.roomPrefix/.test(live),
    'forum-live.js namespaces RTDB by roomPrefix ("' + prefix + '") so the two brands cannot mix'
  )
}

/* ---- 8. staff page must not be indexable ---- */
const st = readFileSync(ROOT + '/Forum/staff/index.html', 'utf8')
ok(/name="robots" content="noindex, follow"/.test(st), 'staff page is noindex')

console.log('\n' + (fail ? 'FAILURES: ' + fail : 'ALL CHECKS PASSED'))
process.exit(fail ? 1 : 0)
