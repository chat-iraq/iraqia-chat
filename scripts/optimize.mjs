#!/usr/bin/env node
/* optimize.mjs — WordPress-cruft + Lighthouse + SEO fixer for statically exported pages.
   Usage: node scripts/optimize.mjs            (runs against the repo root / current dir)
   Idempotent: safe to re-run; all transforms are idempotent text rewrites. */
import { readdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['.git', 'node_modules', '_audit', 'wp-admin', 'wp-includes', 'wp-content', 'scripts', 'seo', 'assets', '.github', 'premium']);

/* ---------- shared helpers ---------- */
function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (extname(e).toLowerCase() === '.html') out.push(p);
  }
  return out;
}

function cleanUrl(u) {
  if (!u.endsWith('.html')) return u;
  let b = u.slice(0, -5);
  if (b.endsWith('/index')) b = b.slice(0, -6) + '/';
  return b;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-zA-Z#0-9]{1,8};/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* ---------- removal patterns ---------- */
const CRUFT = [
  /<style id="wp-img-auto-sizes-contain-inline-css">[\s\S]*?<\/style>/g,
  /<style id="wp-emoji-styles-inline-css">[\s\S]*?<\/style>/g,
  /<style id="wp-block-library-inline-css">[\s\S]*?<\/style>/g,
  /<style id="classic-theme-styles-inline-css">[\s\S]*?<\/style>/g,
  /<style id="global-styles-inline-css">[\s\S]*?<\/style>/g,
  /<style id="custom-style-inline-css">[\s\S]*?<\/style>/g,
  /<style id="wp-custom-css">[\s\S]*?<\/style>/g,
  /<link rel='stylesheet' id='custom-style-css'[^>]*>/g,
  /<link rel='stylesheet' id='twentyfifteen-style-css'[^>]*>/g,
  /<link rel="https:\/\/api\.w\.org\/"[^>]*>/g,
  /<link rel="EditURI"[^>]*>/g,
  /<meta name="generator"[^>]*>/g,
  /<meta name='robots' content='max-image-preview:large'[^>]*\/?>/g,
  /<meta name="author" content="">\s*/g,
  /<link rel='dns-prefetch' href='https:\/\/www\.googletagmanager\.com\/'[^>]*\/?>/g,
  /<link rel="icon" href="https:\/\/[^"]+brand-logo\.png">/g,
  /<link rel="icon" href="\/wp-content\/uploads\/2026\/03\/brand-logo\.png" sizes="32x32" \/>/g,
  /<link rel="icon" href="\/wp-content\/uploads\/2026\/03\/brand-logo\.png" sizes="192x192" \/>/g,
  /<link rel="apple-touch-icon" href="\/wp-content\/uploads\/2026\/03\/brand-logo\.png" \/>/g,
  /<meta name="msapplication-TileImage"[^>]*\/?>/g,
  /<link href="https:\/\/static\.hsoubcdn\.com\/assets\/fonts\/css\/[^"]+" rel="stylesheet">/g,
];

const GOOGLE = [
  /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[A-Za-z0-9_-]+"><\/script><script>[\s\S]*?<\/script>/g,
  /<script id="google_gtagjs-js" src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[A-Za-z0-9_-]+" async><\/script><script id="google_gtagjs-js-after">[\s\S]*?<\/script>/g,
  /<script[^>]*googletagmanager\.com[^>]*><\/script>/g,
];

const DEAD = [
  /<script id="jquery-core-js"[^>]*><\/script>/g,
  /<script id="jquery-migrate-js"[^>]*><\/script>/g,
  /<script id="misha_scripts-js-extra">[\s\S]*?<\/script>/g,
  /<script id="misha_scripts-js"[^>]*><\/script>/g,
  /<script id="ajax_comment-js-extra">[\s\S]*?<\/script>/g,
  /<script defer src="https:\/\/use\.fontawesome\.com\/releases\/[^"]+"><\/script>/g,
  /<script[^>]*src="https:\/\/code\.jquery\.com\/jquery-git\.js"[^>]*><\/script>/g,
  /<script src="https:\/\/code\.jquery\.com\/jquery-3\.2\.1\.slim\.min\.js"[^>]*><\/script>/g,
  /<script type="speculationrules">[\s\S]*?<\/script>/g,
  /<script id="my_amazing_script-js"[^>]*><\/script>/g,
  /<script type="module">[\s\S]*?wp-emoji-loader\.min\.js\s*<\/script>/g,
  /<script[^>]*\/wp-includes\/js\/[^>]*><\/script>/g,
  /<script[^>]*\/wp-content\/themes\/blog-theme\/js\/[^>]*><\/script>/g,
];

function removeDeadScroll(html) {
  /* bootstrap-core-javascript comment + the jQuery scroll $(function(){...} block that used it */
  html = html.replace(/<!-- Bootstrap core JavaScript[\s\S]*?<\/script>\s*/g, '');
  /* safeguard: any inline <script> whose body is the old scroll handler */
  html = html.replace(/<script type="text\/javascript">([\s\S]*?)<\/script>/g, (m, body) => /\$\s*\(function\s*\(\s*\)\s*\{[\s\S]*?didScroll[\s\S]*?\}\)\s*;?\s*$/.test(body) ? '' : m);
  return html;
}

const FB_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.91v-7.01H7.9v-2.9h2.54V9.86c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7.01C13.56 21.2 22 17.06 22 12.06z"/></svg>';
const X_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z"/></svg>';

/* ---------- SEO helpers ---------- */
function metaDesc(html) {
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  return m ? m[1] : '';
}

function descFromQuote(html) {
  const q = html.match(/<section class="px-quote">[\s\S]*?<\/section>/);
  if (q) {
    const t = stripTags(q[0]).replace(/^إجابة\s*سريعة:/, '').trim();
    if (t.length >= 60) return t.length > 158 ? t.slice(0, 155).trim() + '…' : t;
  }
  const hero = html.match(/<section class="px-hero[^"]*">([\s\S]*?)<\/section>/);
  if (hero) {
    const p = hero[1].match(/<p>([\s\S]*?)<\/p>/);
    if (p) {
      const t = stripTags(p[1]);
      if (t.length >= 60) return t.length > 158 ? t.slice(0, 155).trim() + '…' : t;
    }
  }
  const main = html.match(/<main[\s\S]*?<\/main>/);
  if (main) {
    for (const mm of main[0].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
      if (/footer_description/.test(mm[0])) continue;
      const t = stripTags(mm[1]).replace(/&nbsp;/g, ' ').trim();
      if (t.length >= 60) return t.length > 158 ? t.slice(0, 155).trim() + '…' : t;
    }
  }
  return null;
}

/* ---------- page transform ---------- */
function fixHtml(html, rel, genericTitles) {
  const start = html.length;
  const relp = rel.replace(/\\/g, '/');
  const isHome = relp === 'index.html';

  for (const re of CRUFT) html = html.replace(re, '');
  for (const re of GOOGLE) html = html.replace(re, '');
  for (const re of DEAD) html = html.replace(re, '');
  html = removeDeadScroll(html);

  const brand =
    (html.match(/<meta property="og:site_name" content="([^"]+)"/) || [])[1] ||
    (html.match(/<a class="ds-brand"[^>]*>[\s\S]*?alt="([^"]+)"[\s\S]*?<\/a>/) || [])[1] ||
    (html.match(/<img[^>]*class="[^"]*footer-brand[^"]*"[^>]*alt="([^"]+)"/) || [])[1] || '';
  const host = (html.match(/rel="canonical" href="(https:\/\/[^\/"]+)/) || [])[1] || '';

  if (!html.includes('/assets/favicon-64.png')) {
    html = html.replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">',
      '$&<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon-64.png" />'
    );
  }

  if (/<meta name="description" content="">/.test(html)) {
    const h1 = (html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/) || [])[1] || '';
    const t = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const q = (html.match(/<section class="px-quote"><strong>[^<]*<\/strong>\s*([^<]{0,170})/) || [])[1] || '';
    let s = (h1 || t).trim().replace(/<[^>]+>/g, ' ').replace(/&[a-zA-Z#0-9]{1,8};/g, ' ').replace(/\s+/g, ' ').trim();
    let extra = q.trim().replace(/<[^>]+>/g, ' ').replace(/&[a-zA-Z#0-9]{1,8};/g, ' ').replace(/\s+/g, ' ').trim();
    if (extra && extra.indexOf(s) !== 0) s = s ? s + ' — ' + extra : extra;
    if (s.length > 158) s = s.slice(0, 155).trim() + '…';
    if (s) html = html.replace('<meta name="description" content="">', '<meta name="description" content="' + esc(s) + '">');
  }

  html = html.replace(/\/wp-content\/uploads\/2026\/03\/brand-logo\.png/g, '/assets/brand-logo.webp');
  html = html.replace(/https:\/\/[^"']+brand-logo\.png/g, '/assets/brand-logo.webp');

  if (html.includes('<section class="body-content">')) {
    html = html.replace('<section class="body-content">', '<main class="body-content">');
    const i = html.lastIndexOf('</section>');
    if (i !== -1) html = html.slice(0, i) + '</main>' + html.slice(i + 9);
  }

  if (!/<\s*h1[\s>]/i.test(html)) {
    const mt = html.match(/<title>([^<]+)<\/title>/);
    if (mt && mt[1].trim() && html.includes('<main class="body-content">')) {
      let t = mt[1].trim().replace(/<[^>]+>/g, ' ').replace(/&[a-zA-Z#0-9]{1,8};/g, ' ').replace(/\s+/g, ' ').trim().split('|')[0].trim();
      if (t) {
        html = html.replace(
          '<main class="body-content">',
          '<main class="body-content"><div class="ds-container" style="padding-top:1.2rem"><h1 style="font-family:var(--ds-font-display);font-weight:800;font-size:1.9rem;line-height:1.35;margin:0 0 1.1rem;color:var(--ds-ink)">' + esc(t) + '</h1></div>'
        );
      }
    }
  }

  html = html.replace('<aside class="ds-drawer" aria-hidden="true">', '<aside class="ds-drawer" hidden>');

  html = html.replace(
    /<a class="social_h_icon fscoial header_social1"[^>]*href="([^"]+)"[^>]*>\s*<i class="fab fa-facebook-f fa-sm sociali "><\/i>\s*<\/a>/g,
    function (m, href) { return '<a class="social_h_icon fscoial header_social1" href="' + href + '" aria-label="فيسبوك">' + FB_SVG + '</a>'; }
  );
  html = html.replace(
    /<a class="social_h_icon fscoial header_social1"[^>]*href="([^"]+)"[^>]*>\s*<i class="fab fa-twitter fa-sm sociali "><\/i>\s*<\/a>/g,
    function (m, href) { return '<a class="social_h_icon fscoial header_social1" href="' + href + '" aria-label="تويتر">' + X_SVG + '</a>'; }
  );

  html = html.replace(/(href|action)="([^"]*\.html)"/g, (m, a, u) => a + '="' + cleanUrl(u) + '"');
  html = html.replace(/content="([^"]*\.html)"/g, (m, u) => 'content="' + cleanUrl(u) + '"');
  html = html.replace(/(onclick="location\.href=')(index\.html)('")/g, (m, a) => a + "'/'" + (isHome ? '' : relp.replace(/index\.html$/, '')) + "'");
  html = html.replace(/([a-z-]+=")%[^"]+\.html(")/g, (m, a, b) => a + b);
  html = html.replace(/(?:^|\n)\s*<a onclick="location\.href=['"]\.[\s\S]*?<\/a>\s*/g, '');

  /* --- SEO: unique per-page title --- */
  const curTitle = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const generic = genericTitles.size === 0 || genericTitles.has(curTitle);
  if (generic && !isHome && brand) {
    const h1Raw = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
    const h1 = stripTags(h1Raw);
    if (h1 && h1 !== brand && h1.length > 2) {
      let t = h1 + ' | ' + brand;
      if (t.length > 62) t = h1.slice(0, 62 - (' | ' + brand).length - 1) + '… | ' + brand;
      html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + t + '</title>');
    }
  }

  /* --- SEO: rich meta description where short --- */
  const desc = metaDesc(html);
  if (brand && desc.length < 70) {
    const d2 = descFromQuote(html);
    if (d2) {
      html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="' + esc(d2) + '"');
    }
  }

  /* --- SEO: Open Graph + Twitter Card --- */
  if (!html.includes('property="og:title"') && brand) {
    const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const d3 = metaDesc(html);
    let img = (html.match(/<figure class="px-banner"><img src="([^"]+)"/) || [])[1] || '';
    const isBanner = !!img;
    if (!img && host) img = host + '/assets/brand-logo.webp';
    let ogBlock =
      '<meta property="og:locale" content="ar_AR" />' +
      '<meta property="og:title" content="' + esc(t) + '" />' +
      '<meta property="og:description" content="' + esc(d3) + '" />' +
      '<meta property="og:image" content="' + img + '" />' +
      (isBanner ? '<meta property="og:image:width" content="1280" /><meta property="og:image:height" content="630" />' : '') +
      '<meta name="twitter:card" content="summary_large_image" />' +
      '<meta name="twitter:title" content="' + esc(t) + '" />' +
      '<meta name="twitter:description" content="' + esc(d3) + '" />' +
      '<meta name="twitter:image" content="' + img + '" />';
    if (!html.includes('property="og:site_name"')) {
      ogBlock = '<meta property="og:site_name" content="' + brand + '">' + ogBlock;
    }
    const anchor = html.match(/<meta property="og:url"[^>]*>/);
    if (anchor) html = html.replace(anchor[0], anchor[0] + '\n    ' + ogBlock);
    else html = html.replace('</head>', ogBlock + '\n    </head>');
  }

  /* --- SEO: JSON-LD (Organization + WebSite + WebPage / DiscussionForumPage) --- */
  if (!html.includes('application/ld+json') && brand && host) {
    const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const d = metaDesc(html);
    const isRoom = html.includes('class="px-quote"') || html.includes('class="room_content"');
    const canon = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || host;
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': host + '/#organization', name: brand, url: host + '/',
          logo: { '@type': 'ImageObject', url: host + '/assets/brand-logo.webp' } },
        { '@type': 'WebSite', '@id': host + '/#website', url: host + '/', name: brand, inLanguage: 'ar',
          publisher: { '@id': host + '/#organization' },
          potentialAction: { '@type': 'SearchAction', target: host + '/search?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
        { '@type': isRoom ? 'DiscussionForumPage' : 'WebPage', '@id': canon + '#webpage', url: canon,
          name: t, description: d || undefined, inLanguage: 'ar', isPartOf: { '@id': host + '/#website' } },
      ],
    };
    const block = '<script type="application/ld+json">' + JSON.stringify(graph) + '</script>';
    html = html.replace('</head>', block + '</head>');
  }

  /* --- SEO: strip .html inside any legacy JSON-LD blocks --- */
  html = html.replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g,
    (m, a, b, c) => a + b.replace(/\.html/g, '') + c);

  /* --- lazy-load images (banner keeps loading="eager") --- */
  html = html.replace(/<img(?![^>]*loading=)([^>]*?)>/g, (m, a) => '<img loading="lazy" decoding="async"' + a + '>');

  return { html, saved: start - html.length };
}

/* ---------- run ---------- */
const filesList = walk(ROOT);

/* pass 1: count titles to find duplicated generic <title> */
const titleCount = new Map();
function curTitle(f) {
  try {
    const h = readFileSync(f, 'utf8');
    return (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  } catch { return ''; }
}
for (const f of filesList) {
  const t = curTitle(f);
  titleCount.set(t, (titleCount.get(t) || 0) + 1);
}
const genericTitles = new Set();
for (const [t, n] of titleCount) if (n > 5) genericTitles.add(t);

let totalSaved = 0;
let files = 0;
let changed = 0;
for (const f of filesList) {
  files++;
  let html;
  try { html = readFileSync(f, 'utf8'); } catch { continue; }
  const rel = relative(ROOT, f);
  const { html: out, saved } = fixHtml(html, rel, genericTitles);
  if (out !== html) {
    writeFileSync(f, out, 'utf8');
    changed++;
    totalSaved += saved;
    if (saved) console.log('ok  %-48s -%8d B', rel, saved);
    else console.log('ok  %s (no size change)', rel);
  }
}

for (const name of ['sitemap.xml', 'sitemap.txt', 'sitemape.xml', 'sitemapk.xml', 'sitemaplog.txt', 'sitemaplog.xml', 'sitemap.log.xml', 'sitemap.log.txt']) {
  const p = join(ROOT, name);
  try {
    let c = readFileSync(p, 'utf8');
    const before = c.length;
    c = c.replace(/(<loc>)([^<]*?)\.html(<\/loc>)/g, '$1$2$3');
    c = c.replace(/(^|\n)(https?:\/\/[^\s]*?)\.html/g, '$1$2');
    if (c.length !== before) {
      writeFileSync(p, c, 'utf8');
      console.log('ok  %-48s (sitemap cleaned)', name);
    }
  } catch {}
}

const siP = join(ROOT, 'assets', 'search-index.json');
try {
  let c = readFileSync(siP, 'utf8');
  const before = c.length;
  c = c.replace(/"u"\s*:\s*"([^"]*\.html)"/g, (m, u) => '"u": "' + cleanUrl(u) + '"');
  if (c.length !== before) {
    writeFileSync(siP, c, 'utf8');
    console.log('ok  assets/search-index.json (cleaned)');
  }
} catch {}

/* assets/search.js — clean sitemap link */
const sjP = join(ROOT, 'assets', 'search.js');
try {
  let c = readFileSync(sjP, 'utf8');
  const n = c.replace(/https?:\/\/[^"']*\/sitemap\.html/g, '/sitemap').replace(/"\/sitemap\.html"/g, '"/sitemap"');
  if (n !== c) {
    writeFileSync(sjP, n, 'utf8');
    console.log('ok  assets/search.js (sitemap link cleaned)');
  }
} catch {}

/* robots.txt — real, non-www sitemap files only */
const robotsP = join(ROOT, 'robots.txt');
try {
  const rc = readFileSync(robotsP, 'utf8');
  const nrc = rc
    .split('\n')
    .filter(l => !/Sitemap:/i.test(l) || /sitemap\.(xml|txt)/i.test(l))
    .join('\n')
    .replace(/https:\/\/www\./g, 'https://');
  if (nrc !== rc) {
    writeFileSync(robotsP, nrc, 'utf8');
    console.log('ok  robots.txt (cleaned sitemap refs)');
  }
} catch {}

/* delete stale, half-broken sitemap leftovers that robots no longer references */
for (const name of ['sitemape.xml', 'sitemapk.xml', 'report-sitemap.html', 'sitemap.log.txt', 'sitemaplog.txt', 'sitemaplog.xml', 'sitemap.log.xml']) {
  const p = join(ROOT, name);
  try {
    statSync(p);
    rmSync(p);
    console.log('del %s (stale sitemap artifact)', name);
  } catch {}
}

console.log('\n%d files scanned, %d changed, ~%d K chars removed', files, changed, Math.round(totalSaved / 1024));