/**
 * فحص جودة البناء بعد vite build.
 * يتحقق من: بنية RTL، وسوم SEO، ملفات النشر، وغياب كود مؤقت.
 */

import { access, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve('dist')
const SRC = path.resolve('src')

const checks = []
let failed = false

function pass(label) {
  checks.push(`✓ ${label}`)
}

function fail(label) {
  failed = true
  checks.push(`✗ ${label}`)
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(path.join(DIST, 'index.html')))) {
    console.error('لم يتم العثور على dist/index.html — شغّل npm run build أولاً.')
    process.exit(1)
  }

  const html = await readFile(path.join(DIST, 'index.html'), 'utf8')

  if (html.includes('lang="ar"') && html.includes('dir="rtl"')) pass('لغة واتجاه الصفحة (lang=ar, dir=rtl)')
  else fail('html يحتاج lang="ar" و dir="rtl"')

  if (html.includes('content-language')) pass('وسم content-language موجود')
  else fail('وسم content-language مفقود')

  if (html.includes('og:locale') && html.includes('ar_IQ')) pass('og:locale = ar_IQ')
  else fail('og:locale غير مضبوط')

  if (html.includes('application/ld+json') && html.includes('schema.org')) pass('JSON-LD Schema موجود')
  else fail('JSON-LD Schema مفقود')

  if (html.includes('rel="canonical"')) pass('رابط canonical موجود')
  else fail('canonical مفقود')

  if (html.includes('twitter:card')) pass('بطاقات تويتر موجودة')
  else fail('بطاقات تويتر مفقودة')

  const assets = ['404.html', 'robots.txt', 'sitemap.xml', 'favicon.svg', 'og-image.svg', '.nojekyll']
  for (const asset of assets) {
    if (await exists(path.join(DIST, asset))) pass(`ملف النشر ${asset}`)
    else fail(`ملف النشر مفقود: ${asset}`)
  }

  // فحص غياب الكود المؤقت في المصدر (تعليقات TODO/XXX… وليس سمة placeholder في HTML)
  const placeholderPattern = /(TODO|FIXME|HACK|XXX|placeholder comment)/i
  const scanned = []
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist'].includes(entry.name)) await walk(full)
      } else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) {
        scanned.push(full)
      }
    }
  }
  await walk(SRC)
  let hits = 0
  for (const file of scanned) {
    const content = await readFile(file, 'utf8')
    for (const line of content.split('\n')) {
      if (placeholderPattern.test(line)) {
        hits++
        checks.push(`  ↳ ${path.relative(SRC, file)}: TODO تعبير غير مرحّب به`)
      }
    }
  }
  if (hits === 0) pass('لا يوجد كود مؤقت (TODO/placeholder) في المصدر')
  else fail(`${hits} ترتيبات مؤقتة في المصدر`)

  // حجم الملفات المبنية
  const jsDir = path.join(DIST, 'assets')
  if (await exists(jsDir)) {
    const files = await readdir(jsDir)
    for (const file of files.filter((f) => /\.js$/.test(f))) {
      const size = (await stat(path.join(jsDir, file))).size / 1024
      checks.push(`أصل JS: ${file} (${Math.round(size)} KB)`)
    }
  }

  console.log('\n===== ملخص فحص البناء =====')
  checks.forEach((c) => console.log(c))
  console.log('============================\n')

  if (failed) {
    console.error('وجدنا مشاكل — راجع ما سبق.')
    process.exit(1)
  }
  console.log('البناء سليم وجاهز للنشر ✓')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})