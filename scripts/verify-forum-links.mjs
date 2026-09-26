/* verify-forum-links.mjs — every internal link in the generated forum pages
   must resolve to a real file on disk, the way the host will serve it. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const D = JSON.parse(readFileSync(ROOT + '/data/forum.json', 'utf8'))
const ORIGIN = D.origin
let fail = 0

function forumPages(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) forumPages(p, acc)
    else if (e.name === 'index.html') acc.push(p)
  }
  return acc
}

function resolves(href) {
  let clean = href.split('#')[0].split('?')[0]
  if (clean.startsWith(ORIGIN)) clean = clean.replace(ORIGIN, '')
  if (clean === '' || clean === '/') return existsSync(path.join(ROOT, 'index.html'))
  if (!clean.startsWith('/')) return null /* relative: skip, we emit absolute */
  const rel = decodeURIComponent(clean).replace(/^\/+/, '')
  const direct = path.join(ROOT, rel)
  if (existsSync(direct) && statSync(direct).isFile()) return true
  if (existsSync(path.join(direct, 'index.html'))) return true
  if (existsSync(direct + '.html')) return true
  return false
}

const pages = forumPages(path.join(ROOT, 'Forum'))
const broken = new Map()
let checked = 0

for (const file of pages) {
  const html = readFileSync(file, 'utf8')
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1]
    if (/^(https?:)?\/\//.test(href) && !href.startsWith(ORIGIN)) continue
    if (/^(mailto:|tel:|data:|javascript:|#)/.test(href)) continue
    checked++
    if (resolves(href) === false) {
      if (!broken.has(href)) broken.set(href, [])
      broken.get(href).push(rel)
    }
  }
}

console.log(`forum pages      : ${pages.length}`)
console.log(`links checked    : ${checked}`)
console.log(`distinct broken  : ${broken.size}`)

if (broken.size) {
  fail = 1
  let n = 0
  for (const [href, where] of broken) {
    if (++n > 25) { console.log('  ... and more'); break }
    console.log(`  BROKEN ${href}   (e.g. ${where[0]}, ${where.length} page(s))`)
  }
}

/* the assets the pages load must exist too */
for (const a of [
  'assets/app.js',
  'assets/site.min.css',
  'assets/site-extra.min.css',
  'assets/forum-data.js',
  'assets/brand-logo.webp',
  'Forum/style.css',
  'Forum/assets/forum.js',
  'Forum/assets/forum-live.js',
  'img/rooms/Forum-index.jpg',
  'manifest.webmanifest'
]) {
  const ok = existsSync(path.join(ROOT, a))
  if (!ok) fail = 1
  console.log((ok ? 'PASS  ' : 'FAIL  ') + a)
}

console.log(fail ? '\nBROKEN LINES FOUND' : '\nALL FORUM LINKS + ASSETS RESOLVE')
process.exit(fail)
