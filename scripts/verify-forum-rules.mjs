import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
const o = JSON.parse(readFileSync(path.join(process.cwd(), 'forum-rules.json'), 'utf8'))
const r = o.rules.forum
const NS = r['$site'] /* per-site namespace: chat-iraq=asltime, iraqia-chat=durar */
const CATS = ['access', 'tech', 'ban', 'ideas', 'general']
let bad = 0
const p = (c, m) => { if (!c) { bad++; console.log('  FAIL ' + m) } }

for (const c of CATS) {
  const t = NS[c] && NS[c]['$topicId']
  p(t, c + '.$topicId exists')
  if (!t) continue
  p(t['.read'], c + ' readable')
  p(t['.write'], c + ' staff-writable')
  const rid = t.r && t.r['$rid']
  p(rid, c + ' reply rule exists (r/$rid)')
  if (rid) {
    p(rid['.write'] && rid['.write'].includes('newData.child(\'u\').val() === auth.uid'), c + ' reply write is author-bound')
    p(rid['.validate'] && rid['.validate'].includes('1200'), c + ' reply length validated')
  }
}

p(r.staff['$uid']['.write'] === false, 'staff node not client-writable')
p(r.staff['$uid']['.read'] === 'auth != null && auth.uid === $uid', 'staff readable only by its owner')
p(NS['$other'] && NS['$other']['.write'] === false, 'unknown namespaces denied via $other')
p(NS.counts['.read'] === true, 'counts publicly readable')
p(NS.rate['$uid']['$window'] && NS.rate['$uid']['$window']['.write'].includes('!data.exists()'), 'rate bucket is write-once (real throttle)')
p(NS.pending['$pid']['.write'].includes("child('rate')"), 'pending write gated by the rate bucket')
p(NS.pending['$pid']['.write'].includes('$site'), 'pending rate lookup is namespace-scoped')
p(NS.pending['$pid']['.write'].includes("newData.child('k')"), 'pending quotes the window key (rules cannot call Math/String)')
p(/!newData\.exists\(\)/.test(NS.votes['$topicId']['$uid']['.write']), 'a vote can be removed, not only added')
p(/data\.exists\(\) \? data\.val\(\) : 0\) \+ 1/.test(NS.counts['$topicId']['.write']), 'a counter moves by one, never set to an arbitrary number')
p(NS.votes['$topicId']['$uid']['.write'].includes('auth.uid === $uid'), 'votes bound to own uid')
p(NS.read['$uid']['.write'].includes('auth.uid === $uid'), 'read state bound to own uid')
p(NS.reports['.read'].includes("child('staff')"), 'reports readable by staff only')
p(r['.read'] === false && r['.write'] === false, 'forum root itself is not directly readable/writable')

/* brace balance per rule expression */
let unbalanced = 0
JSON.stringify(r, (k, v) => {
  if (typeof v === 'string' && (v.includes('auth') || v.includes('newData'))) {
    let d = 0
    for (const ch of v) { if (ch === '(') d++; if (ch === ')') d--; if (d < 0) unbalanced++ }
    if (d !== 0) { unbalanced++; console.log('  FAIL unbalanced parens in ' + k + ': ' + v.slice(0, 60)) }
  }
  return v
})
p(unbalanced === 0, 'all rule expressions have balanced parentheses')

/* RTDB rules support neither Math.* nor a bare String() call (isString() is
   fine). A bare one usually means client-side logic leaked into a rule. */
const bare = []
JSON.stringify(r, (k, v) => {
  if (typeof v !== 'string') return v
  for (const m of v.matchAll(/(^|[^A-Za-z0-9_])(Math\.[A-Za-z]+|String\()/g)) bare.push(k + ': ' + m[2])
  return v
})
p(bare.length === 0, 'no Math.* or bare String() in any rule expression' + (bare.length ? ' -> ' + bare.join(', ') : ''))

/* ---- the merged paste-ready file must not have drifted from its sources ---- */
const fullPath = process.cwd() + '/firebase-rules.full.json'
if (existsSync(fullPath)) {
  const full = JSON.parse(readFileSync(fullPath, 'utf8'))
  const chatS = JSON.parse(readFileSync(process.cwd() + '/rules-chat.json', 'utf8'))
  p(!!full.rules.chat && !!full.rules.presence && !!full.rules.typing && !!full.rules.rate && !!full.rules.block,
    'merged rules keep every chat path (chat, presence, typing, rate, block)')
  p(JSON.stringify(full.rules.forum) === JSON.stringify(r), 'merged forum subtree matches forum-rules.json exactly')
  p(JSON.stringify(full.rules.chat) === JSON.stringify(chatS.rules.chat), 'merged chat subtree matches rules-chat.json exactly')
  const readFixes = ['presence.$room.$tab', 'typing.$room.$tab', 'block.$uid']
  for (const path of readFixes) {
    const node = readFixes.indexOf(path) === 0 ? full.rules.presence.$room.$tab
      : readFixes.indexOf(path) === 1 ? full.rules.typing.$room.$tab
        : full.rules.block.$uid
    p(!!node['.read'], path + ' has a .read (this was the Permission-denied bug)')
  }

  /* the publishable copy must be byte-identical in rules and carry ONLY "rules",
     because the rules compiler rejects any other top-level key. */
  const pubPath = process.cwd() + '/firebase-rules.publish.json'
  if (existsSync(pubPath)) {
    const pub = JSON.parse(readFileSync(pubPath, 'utf8'))
    p(Object.keys(pub).join(',') === 'rules', 'publish file has only the "rules" key')
    p(JSON.stringify(pub.rules) === JSON.stringify(full.rules), 'publish file rules match the merged file')
  } else p(false, 'firebase-rules.publish.json is missing - run: node scripts/build-rules.mjs')
} else {
  p(false, 'firebase-rules.full.json is missing - run: node scripts/build-rules.mjs')
}

console.log(bad ? '\nPROBLEMS: ' + bad : '\nforum-rules.json: ALL STRUCTURAL CHECKS PASSED')
process.exit(bad ? 1 : 0)
