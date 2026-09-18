# SEO التقني - TECHNICAL_SEO

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- التاريخ: 2026-09-18

## robots.txt
- موجود، ويشير إلى: `sitemap.xml` و`sitemape.xml` و`sitemap.txt` (وكلها موجودة فعلاً).
- مطابق للإنتاج (لا تغيير مطلوب).

## خرائط الموقع
| الملف | العدد | ملاحظة |
|---|---|---|
| sitemap.xml | 783 رابط | يشمل `<image:image>` لكل رابط + صفحة المؤلف |
| sitemap.txt | 784 سطراً | يشمل المؤلف |
| sitemap.html | صفحات HTML كاملة | يحتوي قسم المقالات ورابط الكاتب |

## الأساسيات
- `lang="ar"`, `dir="rtl"`، UTF-8.
- canonical ثابت بصيغة www.
- بنية بيانات JSON-LD: BreadcrumbList، Article، Person (المؤلف)، ProfilePage، Organization/ImageObject.
- لا يوجد كود تحليلات (Analytics) في الصفحات — يُنصح بإضافته عند توفره لربط Search Console لاحقاً.

## تناقض يجب توثيقه (لا تغيير تلقائي)
- الإنتاج: 301 من www إلى non-www.
- الصفحات: canonical وog:url بصيغة https://www.
- النتيجة: إشارة canonical إلى عنوان يُعاد توجيهه. التوصية: توحيد الاتجاه (www أو non-www) لاحقاً بعد قرار المالك، مع الحفاظ على الروابط الحالية دون كسر.
