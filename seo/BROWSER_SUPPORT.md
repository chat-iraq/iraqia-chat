# دعم المتصفحات — BROWSER_SUPPORT

## الجمهور المستهدف

- الهاتف: Chrome/Android، Safari/iOS الإصدارات الحديثة (آخر إصدارين).
- المكتب: Chrome، Edge، Firefox، Safari (آخر إصدارين).
- الشاشات: من 320px إلى شاشات كبيرة، بتصميم Mobile-first.

## أساس التوافق

- لا تعتمد على مكتبات أو إطارات — CSS و JS أصيلان.
- **CSS المستخدم**: Custom Properties (`--ds-*`), `clamp()`, `:where`, `content-visibility`, `@container` (اختياري), `color-mix()` (في التأثيرات فقط)، `@view-transition` (متدرّج).
- **JS المستخدم**: `IntersectionObserver`, `fetch`, `Element.closest`, `localStorage`, `<dialog>.showModal()`, `URLSearchParams`.

## ترجمة الدعم

| الميزة | الحد الأدنى | السلوك عند عدم الدعم |
|---|---|---|
| `color-mix()` | 2023 Chrome 111+/Safari 16.2+/FF 113+ | يبقى اللون الأساسي (القيمة السابقة المحددة يدوياً في الرموز) |
| `@view-transition` | Chrome 126+/Edge 126+ | لا انتقال؛ تبقى الصفحة طبيعية |
| `<dialog>` | 2022 (Chrome/FF)، Safari 15.4+ | يظهر كقسم عادي غير منبثق |
| `IntersectionObserver` | 2019+ (جميع المتصفحات الحديثة) | بدون JS: تظهر العناصر مباشرة (فئة `ds-reveal` تُعلَّم `is-visible` في مسار الفشل) |
| `fetch` | 2017+ | البحث/لوحة الأوامر: من دون JS تعمل الروابط الثابتة |
| `localStorage` | دائم | يُستثنى فشل الوصول (أنماط الحماية) ويستمر الموقع بدون حفظ |

## الخدمات الإلزامية

- `dir="rtl"` و `lang="ar"` في كل صفحة.
- `#skip` (رابط التخطي) + `:focus-visible` (عناية بلوحة المفاتيح).
- احترام `prefers-reduced-motion: reduce` في كل الحركات.

## إجراء الاختبار السريع

1. جرّب الوضع الداكن على شاشة 320px و Desktop.
2. جرّب `Ctrl/Cmd+K` من الصفحة الجديدة.
3. فعّل الماوس مقابل لوحة المفاتيح (Tab تدور عبر الروابط كلها).
4. استخدم أدوات Chrome DevTools لاختبار سيناريوهات اللاتوِّفر.