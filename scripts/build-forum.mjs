/* build-forum.mjs — single source of truth -> static forum pages.
 *
 * data/forum.json  ->  Forum/index.html
 *                     Forum/c/<key>/index.html
 *                     Forum/tag/<key>/index.html
 *                     Forum/t/<id>/index.html
 *                     Forum/ask/index.html
 *                     Forum/staff/index.html
 *                     assets/forum-data.js
 *                     sitemap.xml + sitemap.txt   (idempotent block)
 *
 * Structured data follows the 2026 rules:
 *   - FAQPage rich results were retired (2026-05-07)  -> never emitted
 *   - DiscussionForumPosting is for UGC only           -> emitted on the
 *     topic LEAF page, where the question really is a user post
 *   - the listing page is an honest CollectionPage/ItemList of Question
 *
 * Run: node scripts/build-forum.mjs
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const D = JSON.parse(await readFile('data/forum.json', 'utf8'))

const ORIGIN = D.origin
const BASE = D.base
const ACC = '#4d388f'
const ACC2 = '#4d388f'
const OG = ORIGIN + '/img/rooms/Forum-index.jpg'
const LASTMOD = new Date().toISOString().slice(0, 10)
const ORG_ID = ORIGIN + '/#organization'
const SITE_ID = ORIGIN + '/#website'

/* ---------------------------------------------------------------- helpers */

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const abs = (p) => ORIGIN + p
const catOf = (k) => D.categories.find((c) => c.key === k)
const tagOf = (k) => D.tags.find((t) => t.key === k)
const topicUrl = (t) => `${BASE}t/${t.id}/`
const catUrl = (k) => `${BASE}c/${k}/`
const tagUrl = (k) => `${BASE}tag/${k}/`
const topicsIn = (arr) => [...arr].sort((a, b) => a.datePublished < b.datePublished ? 1 : -1)

const ld = (obj) =>
  '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>'

/* a <time> that never goes stale: machine date in the markup, human text by JS */
const timeTag = (iso) => `<time datetime="${esc(iso)}" data-ts="${esc(iso)}">${iso.slice(0, 10)}</time>`

const NAV = [
  ['/', 'الرئيسية'],
  ['/rules/', 'القوانين'],
  ['/articles/', 'المقالات'],
  ['/questions/', 'الأسئلة'],
  [BASE, 'المنتدى'],
  ['/search/', 'بحث'],
  ['/sub/', 'الاشتراكات'],
  ['/contact/', 'اتصل بنا']
]

const header = (active) => `  <header class="ds-header"><div class="ds-container ds-nav"><a class="ds-brand" href="${ORIGIN}/"><img src="/assets/brand-logo.webp" srcset="/assets/brand-logo-40.webp 40w, /assets/brand-logo.webp 497w" sizes="34px" alt="" width="34" height="34" loading="lazy">${D.brand}</a><nav class="ds-menu" aria-label="القائمة الرئيسية">${NAV.map(
  ([href, label]) =>
    `<a href="${abs(href)}"${href === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`
).join('')}</nav><form class="ds-search-mini" role="search" action="${abs('/search/')}" method="get"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="search" name="q" placeholder="ابحث" aria-label="بحث"></form><a class="ds-cta-mini" href="${ORIGIN}/">دخول</a><button class="ds-theme-btn" type="button" aria-label="تبديل السمة">◐</button><button class="ds-burger" type="button" aria-label="فتح القائمة" aria-expanded="false"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg></button></div></header>
  <aside class="ds-drawer" hidden>${NAV.map(
    ([href, label]) =>
      `<a href="${abs(href)}"${href === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`
  ).join('')}</aside>
  <div class="ds-scrim"></div>`

const footer = `  <footer class="ds-footer"><div class="ds-container"><p>${D.brand} — <a href="${abs(BASE)}">المنتدى</a> · <a href="${abs('/rules/')}">القوانين</a> · <a href="${abs('/contact/')}">اتصل بنا</a></p></div></footer>
<script src="/assets/app.js" defer></script>
<script src="/assets/chat-config.js"></script>
<script src="/assets/forum-data.js" defer></script>
<script src="/Forum/assets/forum.js" defer></script>
<script src="/Forum/assets/forum-live.js" defer></script>`

const crumbs = (items) =>
  `  <nav class="ds-crumbs" aria-label="مسار الصفحة">${items
    .map(([href, label], i) =>
      i === items.length - 1
        ? `<span>${esc(label)}</span>`
        : `<a href="${abs(href)}">${esc(label)}</a><span aria-hidden="true">»</span>`
    )
    .join('')}</nav>`

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  '@id': abs(items[items.length - 1][0]) + '#breadcrumb',
  itemListElement: items.map(([href, label], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: label,
    item: abs(href)
  }))
})

const graphBase = () => [
  { '@type': 'Organization', '@id': ORG_ID, name: D.brand, url: ORIGIN + '/', logo: { '@type': 'ImageObject', url: ORIGIN + D.logo, width: 512, height: 512, caption: D.brand }, sameAs: D.social },
  { '@type': 'WebSite', '@id': SITE_ID, url: ORIGIN + '/', name: D.brand, inLanguage: 'ar', publisher: { '@id': ORG_ID } }
]

/* ------------------------------------------------------------------ layout */

function layout({ title, desc, canonical, ogType = 'website', body, crumbItems, jsonLd, active = BASE, robots = 'index, follow' }) {
  const canonicalAbs = abs(canonical)
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="canonical" href="${canonicalAbs}">
<meta property="og:url" content="${canonicalAbs}">
<meta name="twitter:url" content="${canonicalAbs}">
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<meta name="google" content="notranslate">
<meta property="og:site_name" content="${D.brand}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="ar_AR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="theme-color" content="${ACC}">
<link rel="icon" href="/assets/brand-logo.webp" type="image/x-icon">
<link rel="apple-touch-icon" href="/assets/brand-logo.webp">
<style>:root{--acc:${ACC};--acc2:${ACC2}}</style>
<link rel="stylesheet" href="/Forum/style.css">
${ld({ '@context': 'https://schema.org', '@graph': [...graphBase(), ...jsonLd] })}
    <link rel="preload" as="style" href="/assets/site.min.css">
    <link rel="stylesheet" href="/assets/site.min.css">
    <link rel="preload" as="style" href="/assets/site-extra.min.css">
    <link rel="stylesheet" href="/assets/site-extra.min.css">
    <link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="${ACC}"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="${D.brand}"></head>
<body>
${header(active)}

<main class="ds-main"><div class="ds-container">
${crumbs(crumbItems)}
${body}
</div></main>
${footer}
</body>
</html>
`
}

/* -------------------------------------------------------------- components */

function tagChips(keys) {
  return keys
    .map((k) => {
      const t = tagOf(k)
      if (!t) return ''
      return `<a class="fm-tag" style="background:${t.color}" href="${abs(tagUrl(k))}">${esc(t.title)}</a>`
    })
    .join('')
}

/* member-submitted topics have no avatar file; fall back instead of emitting src="" */
const DEFAULT_AV = { img: '/assets/brand-logo.webp', w: 34, h: 34 }
const av = (a) => a || DEFAULT_AV

function topicRow(t, { showCat = true } = {}) {
  const c = catOf(t.cat)
  const a = av(t.author)
  return `        <article class="fm-row" data-topic="${t.id}" data-cat="${t.cat}" data-tags="${t.tags.join(' ')}" data-search="${esc((t.title + ' ' + t.body + ' ' + t.tags.map((g) => tagOf(g)?.title || '').join(' ')).toLowerCase())}">
          <a class="fm-row-av" href="${abs(topicUrl(t))}" tabindex="-1" aria-hidden="true"><img src="${a.img}" alt="" width="${a.w}" height="${a.h}" loading="lazy"></a>
          <div class="fm-row-main">
            <h3 class="fm-row-title"><a href="${abs(topicUrl(t))}">${esc(t.title)}</a>${t.pinned ? '<span class="fm-badge fm-badge--pin" title="مثبّت">مثبّت</span>' : ''}${t.answer ? '<span class="fm-badge fm-badge--ok" title="له جواب رسمي">جواب رسمي</span>' : ''}</h3>
            <p class="fm-row-excerpt">${esc(t.body)}</p>
            <p class="fm-row-meta"><span class="fm-who">${esc(t.author.name)}</span>${showCat && c ? `<a class="fm-cat-link" href="${abs(catUrl(c.key))}">${esc(c.title)}</a>` : ''}${timeTag(t.datePublished)}${tagChips(t.tags)}</p>
          </div>
          <div class="fm-row-side"><span class="fm-count" data-count-for="${t.id}" title="ردود الأعضاء">٠</span><span class="fm-count-lbl">رد</span></div>
        </article>`
}

function topicList(list, opts) {
  if (!list.length) return `        <p class="fm-empty">لا توجد مواضيع هنا بعد.</p>`
  return list.map((t) => topicRow(t, opts)).join('\n')
}

function sidebar(activeCat, activeTag) {
  return `      <aside class="fm-side">
        <section class="fm-menu">
          <h2>الأقسام</h2>
          <ul>${D.categories
            .map(
              (c) =>
                `<li><a class="fm-side-link${c.key === activeCat ? ' is-active' : ''}" href="${abs(catUrl(c.key))}"><span class="fm-dot" style="background:${c.color}"></span>${esc(c.title)}<span class="fm-side-n">${D.topics.filter((t) => t.cat === c.key).length}</span></a></li>`
            )
            .join('')}</ul>
        </section>
        <section class="fm-menu">
          <h2>الوسوم</h2>
          <div class="fm-tagcloud">${D.tags
            .map(
              (t) =>
                `<a class="fm-tag${t.key === activeTag ? ' is-active' : ''}" style="background:${t.color}" href="${abs(tagUrl(t.key))}">${esc(t.title)}</a>`
            )
            .join('')}</div>
        </section>
        <a class="fm-join" href="${abs(BASE + 'ask/')}">اسأل سؤالًا جديدًا</a>
        <section class="fm-team">
          <h2>الإدارة</h2>
          <ul>${D.moderators
            .map(
              (m) =>
                `<li class="fm-teammate"><img src="${m.img}" alt="" width="34" height="34" loading="lazy"><span>${esc(m.name)}<small>@${esc(m.handle)}</small></span></li>`
            )
            .join('')}</ul>
        </section>
        <section class="fm-tools">
          <h2>قوانين المنتدى</h2>
          <ol class="fm-rules">${D.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
          <p><a href="${abs(BASE + 'staff/')}">لوحة الإشراف</a></p>
        </section>
      </aside>`
}

const wrap = (main, side) => `    <div class="fm-wrap">
${main}
${side}
    </div>`

/* ------------------------------------------------------------------- pages */

function homePage() {
  const list = topicsIn(D.topics)
  const itemList = {
    '@type': 'ItemList',
    '@id': abs(BASE) + '#list',
    numberOfItems: list.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: list.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(topicUrl(t)),
      name: t.title
    }))
  }
  const body = `  <section class="fm-hero ds-reveal">
    <span class="fm-kicker">${esc(D.title)}</span>
    <h1>${esc(D.title)}</h1>
    <p>${esc(D.description)}</p>
    <form class="fm-search" role="search" id="fmSearch" action="${abs(BASE)}" method="get">
      <input type="search" name="q" id="fmQ" placeholder="ابحث في المنتدى: دخول، حظر، تفعيل، لوحة…" aria-label="ابحث في المنتدى" autocomplete="off">
      <button type="submit">بحث</button>
    </form>
  </section>
${wrap(
  `      <div class="fm-main">
        <h2 class="fm-h2">أحدث المواضيع <span class="fm-hint" id="fmCount"></span></h2>
        <div class="fm-posts" id="fmList">
${topicList(list)}
        </div>
        <p class="fm-noresult" id="fmNoResult" hidden>لا توجد نتائج مطابقة.</p>
        <a class="fm-posts-more" href="${abs(BASE + 'ask/')}">+ اسأل سؤالًا جديدًا</a>
      </div>`,
  sidebar()
)}`

  return layout({
    title: D.title + ' | ' + D.brand,
    desc: D.description,
    canonical: BASE,
    jsonLd: [
      {
        '@type': 'CollectionPage',
        '@id': abs(BASE) + '#webpage',
        url: abs(BASE),
        name: D.title,
        description: D.description,
        inLanguage: 'ar',
        isPartOf: { '@id': SITE_ID },
        mainEntity: { '@id': abs(BASE) + '#list' }
      },
      itemList
    ],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى']],
    body
  })
}

function categoryPage(c) {
  const list = topicsIn(D.topics.filter((t) => t.cat === c.key))
  const canonical = catUrl(c.key)
  const body = `  <section class="fm-hero fm-hero--sm ds-reveal">
    <span class="fm-kicker">قسم</span>
    <h1>${esc(c.title)}</h1>
    <p>${esc(c.desc)}</p>
  </section>
${wrap(
  `      <div class="fm-main">
        <div class="fm-posts">
${topicList(list, { showCat: false })}
        </div>
        <a class="fm-posts-more" href="${abs(BASE + 'ask/')}">+ اسأل في هذا القسم</a>
      </div>`,
  sidebar(c.key)
)}`
  return layout({
    title: c.title + ' | ' + D.title,
    desc: c.desc + ' — ' + D.title + ': ' + D.description,
    canonical,
    jsonLd: [
      {
        '@type': 'CollectionPage',
        '@id': abs(canonical) + '#webpage',
        url: abs(canonical),
        name: c.title + ' | ' + D.title,
        inLanguage: 'ar',
        isPartOf: { '@id': SITE_ID },
        mainEntity: { '@id': abs(canonical) + '#list' }
      },
      {
        '@type': 'ItemList',
        '@id': abs(canonical) + '#list',
        numberOfItems: list.length,
        itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(topicUrl(t)), name: t.title }))
      },
      breadcrumbLd([['/', 'الرئيسية'], [BASE, 'منتدى'], [canonical, c.title]])
    ],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى'], [canonical, c.title]],
    body
  })
}

function tagPage(g) {
  const list = topicsIn(D.topics.filter((t) => t.tags.includes(g.key)))
  const canonical = tagUrl(g.key)
  const body = `  <section class="fm-hero fm-hero--sm ds-reveal">
    <span class="fm-kicker">وسم</span>
    <h1>${esc(g.title)}</h1>
    <p>${list.length} موضوع في هذا الوسم.</p>
  </section>
${wrap(
  `      <div class="fm-main">
        <div class="fm-posts">
${topicList(list)}
        </div>
      </div>`,
  sidebar(null, g.key)
)}`
  return layout({
    title: 'وسم ' + g.title + ' | ' + D.title,
    desc: 'مواضيع موسومة بـ«' + g.title + '» في ' + D.title + '.',
    canonical,
    jsonLd: [
      {
        '@type': 'CollectionPage',
        '@id': abs(canonical) + '#webpage',
        url: abs(canonical),
        name: 'وسم ' + g.title,
        inLanguage: 'ar',
        isPartOf: { '@id': SITE_ID },
        mainEntity: { '@id': abs(canonical) + '#list' }
      },
      {
        '@type': 'ItemList',
        '@id': abs(canonical) + '#list',
        numberOfItems: list.length,
        itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(topicUrl(t)), name: t.title }))
      },
      breadcrumbLd([['/', 'الرئيسية'], [BASE, 'منتدى'], [canonical, g.title]])
    ],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى'], [canonical, g.title]],
    body
  })
}

function topicPage(t) {
  const c = catOf(t.cat)
  const canonical = topicUrl(t)
  const a = t.answer || null
  const mod = a ? D.moderators.find((m) => m.handle === a.by) : null
  const related = D.topics.filter((x) => x.cat === t.cat && x.id !== t.id)
  const au = av(t.author)

  const body = `  <article class="fm-topic">
    <header class="fm-topic-head">
      <h1>${esc(t.title)}</h1>
      <p class="fm-topic-meta">
        <span class="fm-who">${esc(t.author.name)}</span>
        <a class="fm-cat-link" href="${abs(catUrl(c.key))}">${esc(c.title)}</a>
        ${timeTag(t.datePublished)}
        ${tagChips(t.tags)}
      </p>
    </header>

    <section class="fm-block fm-block--q">
      <p class="fm-block-lbl">سؤال ${esc(t.author.name)}</p>
      <div class="fm-block-body"><p>${esc(t.body)}</p></div>
    </section>
${a
      ? `
    <section class="fm-block fm-block--a">
      <p class="fm-block-lbl">الجواب الرسمي${mod ? ' — ' + esc(mod.name) : ''}</p>
      <div class="fm-block-body">
        <p>${esc(a.lead)}</p>
        <ol>${(a.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        ${a.tip ? `<p class="fm-post-tip">${esc(a.tip)}</p>` : ''}
        <p class="fm-block-time">${timeTag(a.datePublished)}</p>
      </div>
    </section>
`
      : ''}
    <section class="fm-block fm-block--live" id="fmLive" data-topic="${t.id}" data-cat="${t.cat}">
      <h2 class="fm-h2">${a ? 'ردود الأعضاء' : 'الردود'} <span class="fm-count" data-count-for="${t.id}">٠</span></h2>
      <div class="fm-replies" id="fmReplies" aria-live="polite">
        <p class="fm-empty">لم تُكتب ردود بعد — كن أول من يشارك.</p>
      </div>
      <form class="fm-compose" id="fmCompose" hidden>
        <label class="fm-lbl" for="fmText">ردّك</label>
        <textarea id="fmText" name="text" rows="4" maxlength="1200" placeholder="اكتب ردّك المفيد هنا…" required></textarea>
        <p class="fm-compose-foot">
          <span class="fm-hint" id="fmHint"></span>
          <button type="submit" class="fm-btn">إرسال الرد</button>
        </p>
      </form>
    </section>

    <footer class="fm-topic-foot">
      <button type="button" class="fm-btn fm-btn--ghost" id="fmVote">أعجبني <span data-vote-for="${t.id}">٠</span></button>
      <button type="button" class="fm-btn fm-btn--ghost" id="fmReport">إبلاغ عن الموضوع</button>
      <button type="button" class="fm-btn fm-btn--ghost" id="fmCopy">نسخ الرابط</button>
      <a class="fm-btn fm-btn--ghost" href="${abs('/contact/')}">تواصل مع الإدارة</a>
    </footer>
  </article>

${wrap(
  `      <div class="fm-main">
        <h2 class="fm-h2">مواضيع ذات صلة</h2>
        <div class="fm-posts">
${topicList(topicsIn(related), { showCat: false })}
        </div>
      </div>`,
  sidebar(t.cat)
)}`

  return layout({
    title: t.title + ' | ' + D.title,
    desc: t.body.slice(0, 155),
    canonical,
    ogType: 'article',
    jsonLd: [
      {
        '@type': 'DiscussionForumPosting',
        '@id': abs(canonical) + '#post',
        url: abs(canonical),
        headline: t.title,
        text: t.body,
        articleBody: t.body,
        inLanguage: 'ar',
        datePublished: t.datePublished,
        author: { '@type': 'Person', name: t.author.name },
        isPartOf: { '@id': abs(BASE) + '#webpage' },
        keywords: t.tags.map((k) => tagOf(k)?.title).filter(Boolean).join(', '),
        /* only claim an official answer when one actually exists */
        ...(a
          ? {
              suggestedAnswer: {
                '@type': 'Answer',
                text: [a.lead, ...(a.steps || []), a.tip].filter(Boolean).join(' '),
                url: abs(canonical),
                datePublished: a.datePublished,
                author: { '@type': mod ? 'Organization' : 'Person', ...(mod ? { name: mod.name, url: ORIGIN + '/' } : { name: a.by }) }
              }
            }
          : {})
      },
      breadcrumbLd([['/', 'الرئيسية'], [BASE, 'منتدى'], [catUrl(c.key), c.title], [canonical, t.title]])
    ],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى'], [catUrl(c.key), c.title], [canonical, t.title]],
    body
  })
}

function askPage() {
  const canonical = BASE + 'ask/'
  const body = `  <section class="fm-hero fm-hero--sm ds-reveal">
    <span class="fm-kicker">سؤال جديد</span>
    <h1>اسأل سؤالًا</h1>
    <p>اكتب سؤالك بوضوح، وسيظهر بعد موافقة الإدارة على منتدى الأسئلة.</p>
  </section>
    <div class="fm-wrap">
      <div class="fm-main">
        <form class="fm-form" id="fmAsk">
          <label class="fm-lbl" for="askTitle">عنوان السؤال</label>
          <input id="askTitle" name="title" type="text" maxlength="140" required placeholder="مثال: لا تظهر لي لوحة الدردشة">
          <label class="fm-lbl" for="askCat">القسم</label>
          <select id="askCat" name="cat" required>${D.categories.map((c) => `<option value="${c.key}">${esc(c.title)}</option>`).join('')}</select>
          <label class="fm-lbl" for="askBody">تفاصيل السؤال</label>
          <textarea id="askBody" name="body" rows="6" maxlength="2000" required placeholder="اشرح ما الذي يحدث لديك، واذكر المتصفح ووقت الحدوث…"></textarea>
          <label class="fm-lbl" for="askTags">الوسوم (افصل بينها بمسافة)</label>
          <input id="askTags" name="tags" type="text" maxlength="120" placeholder="مثال: دخول كلمة-المرور">
          <p class="fm-hint" id="askHint"></p>
          <button class="fm-btn" type="submit">أرسل السؤال</button>
        </form>
      </div>
${sidebar()}
    </div>`
  return layout({
    title: 'اسأل سؤالًا | ' + D.title,
    desc: 'اكتب سؤالك في ' + D.title + ' وستحصل على جواب من الإدارة وأعضاء المجتمع.',
    canonical,
    jsonLd: [breadcrumbLd([['/', 'الرئيسية'], [BASE, 'منتدى'], [canonical, 'اسأل سؤالًا']])],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى'], [canonical, 'اسأل سؤالًا']],
    body
  })
}

function staffPage() {
  const canonical = BASE + 'staff/'
  const body = `  <section class="fm-hero fm-hero--sm ds-reveal">
    <span class="fm-kicker">الإدارة</span>
    <h1>لوحة الإشراف</h1>
    <p>مراجعة المواضيع والردود المبلّغ عنها قبل نشرها.</p>
  </section>
    <div class="fm-wrap">
      <div class="fm-main">
        <div id="fmStaff" data-state="locked">
          <p class="fm-empty">هذه المنطقة للإدارة فقط. سجّل الدخول بحساب إدارة لعرض قائمة المراجعة.</p>
        </div>
      </div>
${sidebar()}
    </div>`
  return layout({
    title: 'لوحة الإشراف | ' + D.title,
    desc: 'لوحة إشراف ' + D.title + ': مراجعة المواضيع والردود المبلّغ عنها.',
    canonical,
    robots: 'noindex, follow',
    jsonLd: [breadcrumbLd([['/', 'الرئيسية'], [BASE, 'منتدى'], [canonical, 'لوحة الإشراف']])],
    crumbItems: [['/', 'الرئيسية'], [BASE, 'المنتدى'], [canonical, 'لوحة الإشراف']],
    body
  })
}

/* ------------------------------------------------------------------- write */

const written = []
async function emit(rel, html) {
  const rel2 = String(rel).replace(/^[/\\]+/, '')
  const file = path.join(rel2)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html, 'utf8')
  written.push(rel2.replace(/\\/g, '/'))
}

for (const dir of ['Forum/c', 'Forum/t', 'Forum/tag', 'Forum/ask', 'Forum/staff']) {
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true })
}

await emit('Forum/index.html', homePage())
for (const c of D.categories) await emit(`${catUrl(c.key)}index.html`, categoryPage(c))
for (const g of D.tags) await emit(`${tagUrl(g.key)}index.html`, tagPage(g))
for (const t of D.topics) await emit(`${topicUrl(t)}index.html`, topicPage(t))
await emit(BASE + 'ask/index.html', askPage())
await emit(BASE + 'staff/index.html', staffPage())

/* client-side dataset for the live layer */
await emit(
  'assets/forum-data.js',
  '/* generated by scripts/build-forum.mjs - do not edit */\n' +
    'window.FORUM_DATA=' +
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      base: BASE,
      categories: D.categories,
      tags: D.tags,
      topics: D.topics.map((t) => ({
        id: t.id,
        cat: t.cat,
        title: t.title,
        url: topicUrl(t),
        author: t.author.name,
        datePublished: t.datePublished,
        tags: t.tags
      }))
    }) +
    ';\n'
)

/* --------------------------------------------------------------- sitemaps */

/* noindex pages are generated but must never be advertised in a sitemap */
const NOINDEX = new Set([BASE + 'staff/'])

const pages = [
  { loc: BASE, freq: 'daily', pri: '0.9', img: true },
  ...D.categories.map((c) => ({ loc: catUrl(c.key), freq: 'daily', pri: '0.7' })),
  ...D.tags.map((g) => ({ loc: tagUrl(g.key), freq: 'weekly', pri: '0.4' })),
  ...D.topics.map((t) => ({ loc: topicUrl(t), freq: 'weekly', pri: '0.8' })),
  { loc: BASE + 'ask/', freq: 'monthly', pri: '0.5' },
  { loc: BASE + 'staff/', freq: 'monthly', pri: '0.2' }
].filter((p) => !NOINDEX.has(p.loc))

const START = '<!-- FORUM:START -->'
const END = '<!-- FORUM:END -->'

const block = pages
  .map(
    (p) =>
      `<url>\n<loc>${abs(p.loc)}</loc>\n<lastmod>${LASTMOD}</lastmod>\n<changefreq>${p.freq}</changefreq>\n<priority>${p.pri}</priority>${p.img ? `\n<image:image><image:loc>${OG}</image:loc></image:image>` : ''}\n</url>`
  )
  .join('\n')

/* sitemap.xml: drop any previous forum block AND the legacy standalone entry
   for THIS origin, then re-insert. Also repairs a duplicated </urlset>. */
const legacyForumEntry = new RegExp(
  '\\n?<url>\\s*<loc>' + ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\/Forum\\/<\\/loc>[\\s\\S]*?<\\/url>\\n?',
  'g'
)
let xml = await readFile('sitemap.xml', 'utf8')
xml = xml.replace(new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`, 'g'), '\n')
xml = xml.replace(legacyForumEntry, '\n')
xml = xml.replace(/<\/urlset>\s*<\/urlset>\s*$/, '</urlset>')
xml = xml.replace(/<\/urlset>\s*$/, `\n${START}\n${block}\n${END}\n</urlset>\n`)
await writeFile('sitemap.xml', xml, 'utf8')

/* sitemap.txt: same idempotent treatment */
let txt = await readFile('sitemap.txt', 'utf8')
txt = txt
  .split(/\r?\n/)
  .filter((l) => l.trim() && !l.includes('/Forum/'))
  .join('\n')
txt += '\n' + pages.map((p) => abs(p.loc)).join('\n') + '\n'
await writeFile('sitemap.txt', txt, 'utf8')

console.log(`forum build ok | pages=${written.length} | sitemap entries=${pages.length}`)
console.log(`  topics   : ${D.topics.length}`)
console.log(`  categories: ${D.categories.length}  tags: ${D.tags.length}`)
