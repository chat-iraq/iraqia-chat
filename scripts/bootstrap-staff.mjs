/* ------------------------------------------------------------------ *
 * bootstrap-staff.mjs
 *
 * Writes forum/staff/<uid>, the node that makes /Forum/staff/ usable.
 * No client can create it - forum.rules sets staff.$uid.".write": false
 * on purpose - so it has to come from an owner credential.
 *
 * It reuses the OAuth token that the Firebase CLI caches after
 * `firebase login`, so there is nothing else to configure.
 *
 *   npx firebase login                       (once, opens a browser)
 *   node scripts/bootstrap-staff.mjs --uid <uid> --name <name> [--dry]
 *
 * Find the uid: open /Forum/staff/ in a signed-in browser. It shows the
 * account's own uid with a copy button precisely because of this.
 *
 * One uid can moderate both brands: forum/staff/<uid> is shared.
 * ------------------------------------------------------------------ */

import { readFileSync, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d
}

const UID = arg('--uid')
const NAME = arg('--name', 'مشرف')
const CLIENT = arg('--client', '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com')

const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'forum.json'), 'utf8'))
const DB = process.env.FB_DB
  ? 'https://' + process.env.FB_DB + '.firebaseio.com'
  : 'https://asltime-ds-chat-fire-default-rtdb.firebaseio.com'

const API_KEY = (() => {
  const f = path.join(ROOT, 'assets', 'chat-config.js')
  if (!existsSync(f)) return null
  return /apiKey:\s*"([^"]+)"/.exec(readFileSync(f, 'utf8'))?.[1] || null
})()

const CFG = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json')

function die(msg, how) {
  console.error('\n' + msg + '\n')
  if (how) console.error(how + '\n')
  process.exit(1)
}

if (!UID) {
  die(
    'missing --uid',
    'open ' + data.origin + '/Forum/staff/ in a signed-in browser and copy the uid\n' +
    'then: node scripts/bootstrap-staff.mjs --uid <uid> --name <name>'
  )
}
if (!/^[A-Za-z0-9_-]{6,128}$/.test(UID)) die('that does not look like a Firebase uid: ' + UID)
if (!API_KEY) die('could not read apiKey from assets/chat-config.js')
if (!existsSync(CFG)) die('no Firebase CLI login found at ' + CFG, 'run:  npx firebase login')

let cached
try { cached = JSON.parse(readFileSync(CFG, 'utf8')) } catch { cached = null }
const REFRESH = cached?.tokens?.refresh_token
const LOGIN_SCOPES = (cached?.loginScopes || []).join(' ') || '(unknown)'

if (!REFRESH) {
  die(
    'the cached Firebase CLI login has no refresh token',
    'run:  npx firebase login'
  )
}
if (!/auth\/firebase\b/.test(LOGIN_SCOPES)) {
  console.error('warning: cached scopes are: ' + LOGIN_SCOPES)
  console.error('         writing to RTDB may be refused. Re-run `npx firebase login` if so.\n')
}

const node = { n: NAME, ts: 0, by: 'bootstrap-staff' }
const target = DB + '/forum/staff/' + UID + '.json'

console.log('database : ' + DB)
console.log('path     : forum/staff/' + UID)
console.log('value    : ' + JSON.stringify(node))
if (DRY) { console.log('\ndry run - nothing written.'); process.exit(0) }

async function accessToken() {
  const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH, client_id: CLIENT })
  })
  const j = await r.json()
  if (!j.access_token) {
    die(
      'token exchange failed: ' + (j?.error?.message || 'unknown'),
      'the cached login is expired or revoked. run:  npx firebase login'
    )
  }
  return j.access_token
}

const token = await accessToken()

const put = await fetch(target + '?auth=' + encodeURIComponent(token), {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(node)
})
if (!put.ok) {
  die('write refused (HTTP ' + put.status + '): ' + (await put.text()).slice(0, 300))
}

/* read back, because a 200 alone is not proof */
const back = await fetch(target + '?auth=' + encodeURIComponent(token))
const now = await back.json()
if (!now || now.n !== NAME) die('write reported success but read-back disagrees: ' + JSON.stringify(now))

console.log('\nOK  forum/staff/' + UID + ' = ' + JSON.stringify(now))
console.log('    ' + (cached?.user?.email || 'the logged-in account') + ' can now open ' + data.origin + '/Forum/staff/')
console.log('    the same uid moderates both brands, since forum/staff/<uid> is shared.')
