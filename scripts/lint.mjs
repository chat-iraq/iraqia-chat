/* lint.mjs — structural lint for the static site (zero-dependency, Node >= 18) */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['.git', 'node_modules', 'seo', 'scripts', 'preview']);
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (extname(p) === '.html') files.push(p);
  }
}
walk(ROOT);

const ruleTests = {
  'no-duplicate-id'(html, rel, out) {
    const seen = new Set();
    for (const m of html.matchAll(/\bid="([^"]+)"/g)) {
      if (seen.has(m[1])) out.push(`${rel}: duplicate id="${m[1]}"`);
      seen.add(m[1]);
    }
  },
  'single-h1'(html, rel, out) {
    const c = (html.match(/<h1[ >]/g) || []).length;
    if (c !== 1) out.push(`${rel}: h1 count = ${c}`);
  },
  canonical(html, rel, out) {
    if (!/<link[^>]+rel="canonical"[^>]+href="https:\/\//.test(html))
      out.push(`${rel}: missing https canonical`);
  }
};

let err = 0, warn = 0, checked = 0, strictChecked = 0;
const strict = (rel) => rel === 'design-system.html' || rel.startsWith('preview/');
for (const p of files) {
  const rel = p.slice(ROOT.length + 1).replace(/\\/g, '/');
  if (SKIP.has(rel.split('/')[0]) || SKIP.has(rel.split('\\')[0])) continue;
  const html = readFileSync(p, 'utf8');
  for (const fn of Object.values(ruleTests)) {
    const out = [];
    fn(html, rel, out);
    if (strict(rel)) { strictChecked++; for (const line of out) { console.log('lint error:', line); err++; } }
    else { for (const line of out) { console.log('lint note:', line); warn++; } }
  }
  checked++;
}
console.log(`== lint.mjs | html=${checked} strict=${strictChecked} errors=${err} notes=${warn}`);
process.exit(err ? 1 : 0);