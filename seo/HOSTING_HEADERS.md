# Hosting & Headers Checklist (GitHub Pages + CDN)

مصدر المتطلبات: تقرير Lighthouse الميداني في `s.txt` (مقياس ميداني على Moto G Power).
GitHub Pages لا يمكنه ضبط رؤوس HTTP من المستودع، لذا تُطبَّق هذه الإعدادات على مستوى
CDN/استضافة أمامية (مثل Cloudflare) ثم تُتحقق بفحص curl.

## 1. Cache-Control / TTL

| Asset | TTL | ملاحظة |
|---|---|---|
| `/index.html` وكل صفحات `.html` النظيفة | `no-cache` | تُعاد التحقق يوميًا حتى يتلقى التحديثات |
| `/assets/*` (css/js/fonts/webp/png) | `immutable, max-age=31536000` | أسماء/دوال ثابتة، لا تتغير |
| `/wp-content/themes/blog-theme/**` | `max-age=86400, stale-while-revalidate=86400` | سحب أقل على كل زيارة |
| `/img/**` (صور الغرف) | `max-age=2592000` | شهر، لا حاجة لـ immutable |

نتيجة متوقعة: رفع حصة «تخزين عمليات تحميل متراكمة» (Largest Contentful Paint) من 4 ثوانٍ
إلى <1.5ث، وتوفير ~800KB لكل عودة — بند التقرير «تحقق من صلاحية ذاكرة التخزين المؤقت».

## 2. HSTS (HTTP Strict Transport Security)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- يُرسَل بعد التأكد من اكتمال تحويل HTTP→HTTPS.
- التقرير: «تأكَّد من أمان HSTS».

## 3. الأمان الأساسي

```
Content-Security-Policy: base-uri 'self'; frame-ancestors 'none'; form-action 'self';
                         img-src 'self' data:; style-src 'self' 'unsafe-inline';
                         script-src 'self' 'unsafe-inline'; connect-src 'self';
                         font-src 'self' data:
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
- بعد إزالة تاغات Google لم يعد أي سكربت خارجي ضمن صفحات HTML، فيمكن تفعيل CSP صارم.
- `X-Frame-Options: DENY` + `frame-ancestors 'none'` = بند التقرير «يسمح الموقع باحتواء نفسه في iframe».

## 4. HTTP → HTTPS redirect

- 301 دائم لكل `http://DOMAIN/*` → `https://DOMAIN/*` (وفي `www`).
- التقرير: «لا يعيد توجيه HTTPs... إلى HTTPS».
- تأكد من اتساق `www` مقابل الجذر: المصدر الحالي `robots.txt` يشير إلى `www.DOMAIN`
  بينما canonical الصفحات بلا `www` — وحّد اختيارًا واحدًا (يفضَّل بلا `www`) وأعد توجيه الآخر.

## 5. تطبيق بعد رفع هذا الفيديو على repo

1. رفع المستودع إلى GitHub Pages (إعداد `chat-iraq.com`/`iraqia-chat.com` في Custom domain).
2. ضبط قواعد الرؤوس أعلاه في لوحة CDN.
3. فحص سريع بعد التطبيق:
   ```
   curl -sI https://DOMAIN/ | grep -iE 'strict-transport|content-security|x-frame|cache-control'
   curl -sI -L http://DOMAIN/ | grep -iE 'HTTP/|location'
   ```
4. إعادة تشغيل Lighthouse (اختياري).