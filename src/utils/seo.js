/** أدوات SEO: تحديث وسم <head> أثناء التنقل (SPA) */

const DOMAIN = 'https://iraqia-chat.com'

const ensure = (id) => {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('meta')
    el.id = id
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr, id, value) {
  const meta = ensure(id)
  meta.setAttribute(attr, value)
}

/**
 * تطبيق عنوان ووصف وفتح وسوم لكل صفحة بدون إعادة تحميل.
 * @param {{ title?: string; description?: string; path?: string; image?: string }} opts
 */
export function applySeo({ title, description, path = '/', image = '/og-image.svg' }) {
  const full = title ? `${title} | شات درر العرب` : 'شات درر العرب | دردشة عراقية مجانية'
  const url = `${DOMAIN}${path}`

  document.title = full
  setMeta('name', 'seo:description', description || '')
  setMeta('property', 'seo:og:title', full)
  setMeta('property', 'seo:og:description', description || '')
  setMeta('property', 'seo:og:url', url)
  setMeta('property', 'seo:og:image', image.startsWith('http') ? image : `${DOMAIN}${image}`)
  setMeta('property', 'seo:twitter:title', full)
  setMeta('property', 'seo:twitter:description', description || '')
  setMeta('property', 'seo:twitter:image', image.startsWith('http') ? image : `${DOMAIN}${image}`)

  let canon = document.querySelector('link[rel="canonical"]')
  if (!canon) {
    canon = document.createElement('link')
    canon.rel = 'canonical'
    document.head.appendChild(canon)
  }
  canon.href = url
}

/** توليد ترميز JSON-LD الديناميكي لصفحات الغرف */
export function injectRoomSchema(room) {
  const key = 'seo:room-schema'
  const old = document.getElementById(key)
  if (old) old.remove()

  const tags = ['دردشة', 'غرفة دردشة', room.region, 'شباب وبنات'].map((t) => ({ text: t }))
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = key
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: room.title,
    description: room.description,
    url: `${DOMAIN}/room/${room.slug}`,
    inLanguage: 'ar',
    discussionUrl: `${DOMAIN}/room/${room.slug}`,
    mainEntityOfPage: `${DOMAIN}/room/${room.slug}`,
    about: tags,
    publisher: {
      '@type': 'Organization',
      name: 'شات درر العرب',
      url: DOMAIN,
    },
  })
  document.head.appendChild(script)
}

/** إزالة ترميز JSON-LD الديناميكي */
export function removeRoomSchema() {
  document.getElementById('seo:room-schema')?.remove()
}