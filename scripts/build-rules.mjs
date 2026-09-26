/* ------------------------------------------------------------------ *
 * build-rules.mjs
 *
 * Produces firebase-rules.full.json: the chat half (rules-chat.json) plus
 * the forum half (forum-rules.json) as ONE ruleset to paste into
 * Firebase Console -> Realtime Database -> Rules -> Publish.
 *
 * Keeping the two halves in separate files means the chat ruleset that
 * browsertest3/4 validated is never edited by forum work, and the forum
 * subtree is never hand-merged into it by a human.
 *
 *   node scripts/build-rules.mjs
 * ------------------------------------------------------------------ */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const p = (f) => path.join(ROOT, f)

const chat = JSON.parse(readFileSync(p('rules-chat.json'), 'utf8'))
const forum = JSON.parse(readFileSync(p('forum-rules.json'), 'utf8'))

if (!chat.rules || !forum.rules || !forum.rules.forum) {
  console.error('missing rules in rules-chat.json or forum-rules.json')
  process.exit(1)
}

const collide = Object.keys(chat.rules).filter((k) => k in forum.rules.forum || k === 'forum')
if (collide.length) {
  console.error('the two halves overlap on: ' + collide.join(', '))
  process.exit(1)
}

const full = {
  _comment: [
    'PASTE THIS WHOLE FILE into Firebase Console -> Realtime Database -> Rules.',
    '',
    'Merged by scripts/build-rules.mjs from:',
    '  rules-chat.json    chat / presence / typing / rate / block',
    '  forum-rules.json   forum (staff + $site namespaces)',
    '',
    'Do not edit by hand here - edit the two sources and re-run the script,',
    'otherwise the halves drift apart.',
    '',
    'Both brands (chat-iraq.com, iraqia-chat.com) share this database, so the',
    'forum lives under forum/<roomPrefix>/ and $site must be one of those',
    'prefixes. forum/staff/<uid> is shared: one moderator covers both sites.',
    '',
    'To grant a moderator, create forum/staff/<uid> from the Console or run',
    '  node scripts/bootstrap-staff.mjs --uid <uid> --name <name>',
    'No client can write that node - the rules deny it on purpose.'
  ],
  rules: { ...chat.rules, forum: forum.rules.forum }
}

/* the sources carry their own commentary; the merged file must not duplicate it */
const text = JSON.stringify(full, null, 2) + '\n'
JSON.parse(text) /* fail loudly here rather than in the Console */

writeFileSync(p('firebase-rules.full.json'), text, 'utf8')

/* The ruleset schema is { "rules": ... } only - a stray top-level key such as
   _comment is rejected by the rules compiler, so the publishable copy is
   emitted without it. The verifier asserts the two agree rule-for-rule. */
const publish = { rules: full.rules }
const pubText = JSON.stringify(publish, null, 2) + '\n'
JSON.parse(pubText)
writeFileSync(p('firebase-rules.publish.json'), pubText, 'utf8')

const size = Buffer.byteLength(text)
const top = Object.keys(full.rules)
let leaves = 0
JSON.stringify(full.rules, (k, v) => { if (k.startsWith('.') && typeof v === 'string') leaves++; return v })

console.log('firebase-rules.full.json     written  (' + size + ' bytes, commented, for reading)')
console.log('firebase-rules.publish.json  written  (' + Buffer.byteLength(pubText) + ' bytes, what the CLI uploads)')
console.log('  top level : ' + top.join(', '))
console.log('  rule exprs: ' + leaves)
if (Object.keys(publish).length !== 1) { console.error('publish file must have only "rules"'); process.exit(1) }

