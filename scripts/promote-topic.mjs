/* ------------------------------------------------------------------ *
 * promote-topic.mjs
 *
 * Static site + no Cloud Functions (Spark) means a member question cannot
 * become an indexable page by itself: there is no server to render it.
 * So publishing is a two-step, serverless flow:
 *
 *   1. Staff approves in /Forum/staff/  -> the thread is written to
 *      forum/<prefix>/<cat>/<id> and the item moves to "awaiting publish",
 *      where the staff page can copy the JSON or download
 *      data/pending-topics.json.
 *   2. This script merges that file into data/forum.json, and
 *      `npm run forum:build` emits a real HTML page + sitemap + JSON-LD.
 *
 * The topic id is the RTDB key chosen at approve time, so the static page
 * and the live replies/counters/votes line up on the same id.
 *
 * Idempotent: re-running replaces a topic with the same id instead of
 * duplicating it, so it is safe to run after every batch of approvals.
 *
 *   node scripts/promote-topic.mjs            merge data/pending-topics.json
 *   node scripts/promote-topic.mjs --dry      validate + report, write nothing
 *   node scripts/promote-topic.mjs --strict   exit 1 on any rejected item
 * ------------------------------------------------------------------ */

import { readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const STRICT = process.argv.includes('--strict')

const DATA = path.join(ROOT, 'data', 'forum.json')
const INBOX = path.join(ROOT, 'data', 'pending-topics.json')

const ID_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/

const bad = []
const note = (m) => console.log('  ' + m)

async function exists(p) {
  try { await access(p); return true } catch { return false }
}

/* editors and PowerShell like to prepend a BOM; JSON.parse chokes on it */
const parseJson = (s, what) => {
  try { return JSON.parse(s.replace(/^\uFEFF/, '')) } catch (e) {
    console.log(what + ' is not valid JSON: ' + e.message)
    process.exit(1)
  }
}

const data = parseJson(await readFile(DATA, 'utf8'), 'data/forum.json')

if (!(await exists(INBOX))) {
  console.log('pending-topics.json not found - nothing to promote.')
  console.log('expected: ' + path.relative(ROOT, INBOX))
  console.log('get it from /Forum/staff/ -> "تنزيل المواضيع المعتمدة".')
  process.exit(0)
}

const raw = parseJson(await readFile(INBOX, 'utf8'), 'data/pending-topics.json')
const items = Array.isArray(raw) ? raw : Array.isArray(raw.topics) ? raw.topics : []
console.log('inbox: ' + items.length + ' item(s)' + (DRY ? '  [dry run]' : ''))
if (!items.length) process.exit(0)

/* ---------------------------------------------------------------- validate */

const catKeys = new Set(data.categories.map((c) => c.key))
const tagKeys = new Set(data.tags.map((g) => g.key))
const byId = new Map(data.topics.map((t) => [t.id, t]))

const accepted = []
for (const [i, it] of items.entries()) {
  const where = 'item[' + i + ']'
  if (!it || typeof it !== 'object') { bad.push(where + ': not an object'); continue }
  if (!it.id || !ID_RE.test(it.id)) { bad.push(where + ': bad id ' + JSON.stringify(it.id) + ' (need lowercase a-z0-9-)'); continue }
  if (!it.cat || !catKeys.has(it.cat)) { bad.push(where + ': unknown cat ' + JSON.stringify(it.cat)); continue }
  if (!it.title || String(it.title).trim().length < 8) { bad.push(where + ': title too short'); continue }
  if (!it.body || String(it.body).trim().length < 15) { bad.push(where + ': body too short'); continue }
  if (it.datePublished && !ISO_RE.test(it.datePublished)) { bad.push(where + ': datePublished must be full ISO with offset'); continue }

  const tags = Array.isArray(it.tags) ? it.tags.filter((t) => tagKeys.has(t)) : []
  const dropped = (Array.isArray(it.tags) ? it.tags : []).filter((t) => !tagKeys.has(t))
  if (dropped.length) note(where + ': dropped unknown tag(s) ' + dropped.join(', '))

  const topic = {
    id: it.id,
    slug: it.slug || String(it.title).trim().replace(/\s+/g, '-').slice(0, 70),
    cat: it.cat,
    tags,
    pinned: false,
    title: String(it.title).trim().slice(0, 140),
    author: { name: String(it.author?.name || it.author || 'عضو').trim().slice(0, 24) },
    datePublished: it.datePublished || new Date().toISOString(),
    body: String(it.body).trim().slice(0, 2000)
  }
  if (it.author?.img) topic.author.img = it.author.img
  if (it.answer) topic.answer = it.answer
  if (byId.has(it.id)) note(where + ': replaces existing topic "' + it.id + '"')
  accepted.push(topic)
}

if (bad.length) {
  console.log('\nREJECTED:')
  for (const b of bad) console.log('  x ' + b)
}
console.log('\nvalid: ' + accepted.length + ' / ' + items.length)
for (const t of accepted) note('+ ' + t.cat.padEnd(8) + t.id.padEnd(24) + t.title.slice(0, 48))

if (!accepted.length) process.exit(STRICT && bad.length ? 1 : 0)
if (DRY) { console.log('\ndry run - data/forum.json untouched.'); process.exit(bad.length && STRICT ? 1 : 0) }

/* ------------------------------------------------------------------ merge */

let added = 0
let updated = 0
for (const t of accepted) {
  const at = data.topics.findIndex((x) => x.id === t.id)
  if (at >= 0) { data.topics[at] = t; updated++ } else { data.topics.push(t); added++ }
}

/* keep a stable order: pinned first, then newest */
data.topics.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.datePublished).localeCompare(String(a.datePublished)))

await writeFile(DATA, JSON.stringify(data, null, 2) + '\n', 'utf8')

console.log('\ndata/forum.json updated: +' + added + ' new, ~' + updated + ' replaced, ' + data.topics.length + ' total')
console.log('next: npm run forum:build   (then forum:nav if you added new sections)')
if (bad.length) console.log('note: ' + bad.length + ' item(s) were rejected - fix or delete them in data/pending-topics.json')
process.exit(bad.length && STRICT ? 1 : 0)
