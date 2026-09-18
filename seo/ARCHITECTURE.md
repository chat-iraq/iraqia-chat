# البنية المعمارية - ARCHITECTURE

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- تاريخ: 2026-09-18
- المرجع: s.txt §4، §6، §8، §14، §39، §58، §62، §65

## 1) النموذج الحالي (مُثبت بالفحص)
- موقع **ثابت بالكامل (Static HTML)** يعمل على GitHub Pages.
- لا Framework، لا CMS، لا قاعدة بيانات، لا API، لا عملية Build.
- التنسيق عبر CSS يدوي: `assets/premium.min.css` + `assets/seo.min.css`.
- لا JavaScript على الصفحات المُدارة؛ التفاعل محدود بصفحات قديمة معزولة.
- عدد صفحات HTML: 851 (منها 831 بالقالب المميّز premium).
- المحتوى: صفحات غرف دردشة، صفحات هبوط دولة/مدينة، صفحات خدمات، مقالات، صفحة مؤلف.

## 2) طبقات النظام (Static-first)
```
المستخدم
  ↓
GitHub Pages (CDN ثابت)
  ↓
HTML + CSS + صور   ← لا JS ضروري
  ↓
Git (main) ← المصدر الوحيد للحقيقة
  ↓
سكربتات تدقيق/توليد (خارج النشر العام) + GitHub Actions (تحقق آلي)
```

## 3) شجرة المشروع الفعلية (مبسّطة)
```
iraqia-chat/
├── *.html                    صفحات الجذر (غرف/هبوط/خدمات/مقالات)
├── iraq/ saudi/ ...          صفحات هبوط لكل دولة (index.html)
├── <city>/ ...              صفحات مدينة/غرفة فرعية
├── articles/                 المقالات + الفهرس articles.html
├── questions/                نظام الأسئلة (يُبنى تدريجياً)
├── author/kaz-alwadi/       صفحة المؤلف + Person schema
├── img/ , img/rooms/         صور الغرف والأعلام
├── assets/                   premium.min.css + seo.min.css + search
├── seo/                      أنظمة المحتوى والتدقيق والبيانات (JSON/MD)
├── admin/                    لوحة محلية معزولة (noindex)
├── scripts/                  أدوات تحقق آلية (Python)
├── .github/workflows/        الأتمتة (on push / scheduled)
├── sitemap.xml .html .txt
└── robots.txt
```

## 4) نموذج المحتوى (Content Model)
كل صفحة مُدارة تحمل: `id, url, slug, title, desc, h1, type, category, cluster,
topic, primaryKeyword, secondaryKeywords, searchIntent, wordCount, author,
createdDate, updatedDate, sources, canonical, ogImage, schema, internalLinks,
images, contentHash, quality, status`.
الملف المرجعي: `seo/CONTENT_DATABASE.json` (831 صفحة) و`seo/CONTENT_INVENTORY.json`.

## 5) تخطيط الروابط (URLs)
- URL قصيرة، lowercase، بلا معرّفات، مع امتداد `.html` للجذر و`/` للأقسام.
- canonical ثابت على `https://www.iraqia-chat.com`.
- لا تغيير لروابط قائمة؛ أي تغيير مستقبلي يتطلب خطة تحويل (انظر `MIGRATION_PLAN.md`).

## 6) القيود والقرارات
- GitHub Pages لا يشغّل PHP/Python كتطبيق؛ لذلك لا لوحة تحكم backend تقليدية (§6).
- المحتوى ثابت ⇒ `Build → HTML → CDN` أفضل من العرض الديناميكي بلا حاجة (§65).
- لا يُضاف Backend/Cloudflare إلا عند حاجة حقيقية مُثبتة (§6، §67).

## 7) قابلية التوسّع
- تُبنى آلاف الصفحات بإعادة استخدام نفس قالب HTML والبيانات في `seo/`.
- إن تجاوز الحجم قدرة الإدارة اليدوية، يُنتقل إلى Content Collections عبر Astro
  مع إبقاء نفس الروابط والبنية (انظر `TECHNOLOGY_DECISION.md`).
