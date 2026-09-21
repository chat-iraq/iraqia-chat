/* build.mjs — zero-build integrity check: every sitemap <loc> and image must resolve to a real file */
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const parse = (f) => {
  try { return readFileSync(join(ROOT, f), 'utf8'); }
  catch { return ''; }
};
const sitemap = parse('sitemap.xml');
const target = existsSync(join(ROOT, 'https')) ? null : ''; /* future-proof */

const locs = [];
for (const m of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) locs.push(m[1]);
const imgRe = /<image:loc>(.*?)<\/image:loc>/g;
const imgLocs = [];
for (const m of sitemap.matchAll(imgRe)) imgLocs.push(m[1]);

let missing = [];
const check = (url) => {
  const path = new URL(url).pathname.replace(/^\//, '');
  const file = path || 'index.html';
  const variants = [file];
  if (path && !/\.(html?|xml|jpg|jpeg|png|webp|avif|gif|svg|css|js|woff2?|txt|json|py|mjs)$/.test(path)) {
    variants.push(path + '.html', path.replace(/\/$/, '') + '/index.html');
  }
  if (!variants.some((v) => existsSync(join(ROOT, v)))) {
    missing.push(`${url} -> ${file}`);
  }
};
for (const u of locs) check(u);
for (const u of imgLocs) check(u);

const out = {
  site: readFileSync(join(ROOT, 'package.json'), 'utf8').includes('chat-iraq') ? 'chatiraq' : 'iraqia',
  generatedAt: new Date().toISOString(),
  locsChecked: locs.length,
  imagesChecked: imgLocs.length,
  missing
};
const rp = join(ROOT, 'seo', 'build-report.json');
mkdirSync(dirname(rp), { recursive: true });
writeFileSync(rp, JSON.stringify(out, null, 2), 'utf8');
console.log(`== build.mjs | locs=${out.locsChecked} images=${out.imagesChecked} missing=${missing.length} -> ${rp}`);
process.exit(missing.length ? 1 : 0);