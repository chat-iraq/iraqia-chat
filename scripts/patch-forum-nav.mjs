/* patch-forum-nav.mjs — add the forum entry to the shared top nav + drawer.
 *
 * The site has no generator for its static pages, so this is a deterministic,
 * idempotent string patch: safe to run repeatedly, and it reports exactly what
 * it changed.  Pages that already carry the link are skipped.
 *
 *   node scripts/patch-forum-nav.mjs          # dry run, changes nothing
 *   node scripts/patch-forum-nav.mjs --write  # apply
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const WRITE = process.argv.includes('--write')
const ROOT = path.resolve('.')

/* the site this script runs in declares its own origin + forum path */
const D = JSON.parse(await readFile(path.join(ROOT, 'data', 'forum.json'), 'utf8'))
const ORIGIN = D.origin
const FORUM_URL = ORIGIN + D.base

const SKIP = new Set(['node_modules', 'dist', '.git', '.vercel', 'seo'])

const LINK = `<a href="${FORUM_URL}">المنتدى</a>`
/* the nav item we anchor to, and the exact spot the forum link belongs in */
const ANCHORS = [
  { find: `<a href="${ORIGIN}/questions/">الأسئلة</a>`, after: true },
  { find: `<a href="${ORIGIN}/articles/">المقالات</a>`, after: true }
]

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.name.endsWith('.html')) yield p
  }
}

function patchBlock(block) {
  if (!block) return null
  if (block.includes('/Forum/')) return null /* already linked */
  for (const a of ANCHORS) {
    const i = block.indexOf(a.find)
    if (i === -1) continue
    const at = a.after ? i + a.find.length : i
    return block.slice(0, at) + LINK + block.slice(at)
  }
  return null
}

/* rewrite one region, patching its inner HTML */
function patchRegion(html, re) {
  let out = ''
  let last = 0
  let changed = 0
  let m
  while ((m = re.exec(html))) {
    out += html.slice(last, m.index)
    const inner = patchBlock(m[2])
    if (inner) changed++
    out += m[1] + (inner === null ? m[2] : inner) + m[3]
    last = m.index + m[0].length
  }
  return { html: out + html.slice(last), changed }
}

function patchHtml(html) {
  const nav = patchRegion(html, /(<nav class="ds-menu"[^>]*>)([\s\S]*?)(<\/nav>)/g)
  const drawer = patchRegion(nav.html, /(<aside class="ds-drawer"[^>]*>)([\s\S]*?)(<\/aside>)/g)
  return { html: drawer.html, changed: nav.changed + drawer.changed, navChanged: nav.changed }
}

let scanned = 0
let withNav = 0
let navAlready = 0
let patched = 0
let drawerPatched = 0
let navOnly = 0
const samples = []

for await (const file of walk(ROOT)) {
  scanned++
  const html = await readFile(file, 'utf8')
  const navMatch = html.match(/<nav class="ds-menu"[^>]*>[\s\S]*?<\/nav>/)
  if (!navMatch) continue
  withNav++
  if (navMatch[0].includes('/Forum/')) {
    navAlready++
    continue
  }
  const { html: next, changed } = patchHtml(html)
  if (changed > 0) {
    patched++
    if (changed > 1) drawerPatched++
    if (samples.length < 3) samples.push(path.relative(ROOT, file).replace(/\\/g, '/'))
    if (WRITE) await writeFile(file, next, 'utf8')
  }
  navOnly++
}

console.log(`scan            : ${scanned} html files`)
console.log(`with ds-menu    : ${withNav}`)
console.log(`nav already ok  : ${navAlready}`)
console.log(`nav patched     : ${patched}  (${navOnly} needed the nav link)`)
console.log(`  of those, drawer also patched: ${drawerPatched}`)
console.log(`mode            : ${WRITE ? 'WRITE' : 'DRY RUN - pass --write to apply'}`)
if (samples.length) console.log('samples         :\n  ' + samples.join('\n  '))
