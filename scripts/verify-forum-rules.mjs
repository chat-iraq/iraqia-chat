import { readFileSync } from 'node:fs'
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
p(r.staff['.read'] === 'auth != null && auth.uid === $uid', 'staff readable only by its owner')
p(NS['$other'] && NS['$other']['.write'] === false, 'unknown namespaces denied via $other')
p(NS.counts['.read'] === true, 'counts publicly readable')
p(NS.rate['$uid']['.write'].includes('!data.exists()'), 'rate bucket is write-once (real throttle)')
p(NS.pending['$pid']['.write'].includes("child('rate')"), 'pending write gated by the rate bucket')
p(NS.pending['$pid']['.write'].includes('$site'), 'pending rate lookup is namespace-scoped')
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

console.log(bad ? '\nPROBLEMS: ' + bad : '\nforum-rules.json: ALL STRUCTURAL CHECKS PASSED')
process.exit(bad ? 1 : 0)
