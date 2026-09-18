/* serve.mjs — zero-dependency local static server (Node >= 18)
   npm run preview  →  http://localhost:4321  */
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const ROOT = process.cwd();
const PORT = process.argv[2] || process.env.PORT || 4321;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' };

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  path = normalize(path).replace(/^([/\\])+/, '');
  if (!path || path === '') path = 'index.html';
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const st = statSync(file);
    if (st.isDirectory()) { const idx = join(file, 'index.html'); try { statSync(idx); } catch { throw 0; } return send(idx, res); }
    send(file, res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 — الملف غير موجود');
  }
}).listen(PORT, () => console.log(`== serve.mjs | http://localhost:${PORT}`));

function send(file, res) {
  const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  res.end(readFileSync(file));
}