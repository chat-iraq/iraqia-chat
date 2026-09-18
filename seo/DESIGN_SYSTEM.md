# نظام التصميم v2 — Design System

- الموقع: شات درر العرب
- الإصدار: 2.1.0 — يعمل بجانب القوالب القديمة دون تعارض (إضافة تدريجية).
- الملفات:
  - `assets/premium.min.css` (11175 بايت) — واجهة الألوان والتخطيط القديمة (v1).
  - `assets/seo.min.css` (6110 بايت) — تحسينات SEO v1.
  - `assets/ds.css` — **نظام التصميم v2** (الرموز، القاعدة، التخطيط، المكوّنات، الأدوات، الحركة، الوضع الداكن، الاستجابة، الطباعة).
  - `assets/app.js` — طبقة التحسين (السمة، Command Palette، الدرج، إظهار العناصر عند التمرير). يُحمَّل بـ `defer` ولا يعتمد عليه المحتوى.

## الهوية

- الاتجاه: RTL مع خصائص منطقية (`inline-start`) وRTL أولاً.
- الخط: سلسلة خطوط عربية موحّدة: `"Tahoma","Segoe UI","Arial","Helvetica",sans-serif`.
- النبض البصري: **اتحاد خط العرض (Editorial grid)** مع **حيوية مجتمع الدردشة (chat sockpuppets)**.
- الألوان الأساسية (Brand A — العراق):
  - `--acc:#a16207` (رملي دافئ) / `--acc2:#d97706` (ذهبي)
  - النص `--ink:#1c1a17` / الثانوي `--mut:#5c554b` / الخلفية `--bg:#fdfbf6` / السطحي `--soft:#ffffff`.
  - Brand B (عسل تايم): `--acc:#0d9488` / `--acc2:#14b8a6` (تركوازي) — يولَّد تلقائياً عبر النصوص الموحّدة.

## التوافق مع v1

- رموز v1 معاد تعيينها لترث ألوان v2: `--acc`, `--acc2`, `--ink`, `--mut`, `--bg`, `--soft`, `--line`, `--grad` تُجمَّع في `:root` وتتغير تلقائياً في الوضع الداكن، فتتلقّى صفحات `.px-*` القديمة المظهر الجديد دون تعديلها.
- أي مكوّن `ds-*` يعمل وحده أو مع v1.

## تشريح `assets/ds.css` (9 أقسام)

1. **الرموز (Tokens)** — الألوان والطباعة والمسافات والزوايا والظلال والحركة ومتغيرات `--ds-*` ومعادلات متغيرات v1.
2. **القاعدة (Base)** — `box-sizing`، `:focus-visible`، `::selection`، إعادة ضبط الصور/الجداول، `:where` لتقليل الوزن النوعي.
3. **التخطيط (Layout)** — `ds-container` بسلالة `clamp()`, `ds-stack`, `ds-row`, `ds-grid-2/3/4`, `ds-bento`, `ds-hero` (عمودان: نص + إجراءات) , `ds-sec` (عناوين الفصول), `ds-meta`.
4. **المكوّنات (Components)** — `ds-header/ds-nav/ds-menu/ds-drawer/ds-scrim/ds-brand/ds-burger/ds-theme-btn`، `ds-btn` (primary/secondary/ghost/sm)، `ds-searchbar`، `ds-card`، `ds-chat-card`، `ds-stat`، `ds-author-card`، `ds-badge` (new/hot)، `ds-pill`، `ds-crumbs`، `ds-list`، `ds-steps`، `ds-faq`، `ds-tabs/ds-tab`، `ds-table`، `ds-dialog`، `ds-toast`، `ds-tip` (أداة تلميح)، `ds-empty`، `ds-404`، `ds-related`، `ds-footer/ds-footgrid/ds-copy`، `ds-palette` (لوحة الأوامر).
5. **الأدوات (Utilities)** — `ds-muted`, `ds-muted-2`, `ds-skip` (رابط التخطي), تعديلات مخصّصة.
6. **الحركة والحالات (Motion/States)** — `ds-reveal` (يظهر عند التمرير عبر IntersectionObserver ويقع على عناصر `ds-*` للنقرات/التمرير), تنقّل الصفحات عبر `@view-transition { navigation: auto }`؛ يُعطَّل تلقائياً عند `prefers-reduced-motion`.
7. **الوضع الداكن (Dark)** — عبر `@media(prefers-color-scheme:dark)` و `[data-theme=dark]` يدوياً (نضبط السمة بـ `[data-theme]` الذي يضبطه `app.js` من زر التبديل).
8. **الاستجابة (Responsive)** — نقاط حذف: `≤640px` (رزمة الأعمدة، قائمة الجوال، إخفاء الهيرو الثانوي) و `≤420px` (هوامش وأبعاد أكبر).
9. **الطباعة (Print)** — صفحة نظيفة بلا أعمدة أو حركة.

## الوضع الداكن (Dark mode)

- الافتراضي: متابعة نظام الجهاز.
- الاختيار اليدوي: زر `.ds-theme-btn` ينشط `data-theme="dark|light"` ويحفظها في `localStorage('ds-theme')`.
- جميع الرموز تعكس عبر `--ds-` و ما يعادلها v1 ليشمل المواقع القديمة.

## الأدوات (app.js)

- صفر اعتماديات، ثنائي الترقّي: إذا عطّل المُستخدم JS تبقى الصفحات كاملة الوظائف (روابط حقيقية، محتوى مُضمَّن).
- **Command Palette**: `Ctrl/Cmd+K` → ‏`assets/search-index.json` (تبحث في العناوين/الأوصاف/الروابط مع تطبيع عربي: أ/إ/آ→ا، ة→ه، ى→ي، إزالة التشكيل)، تنقّل بالأسهم وEnter وEscape.
- **Drawer للجوال**: زر `.ds-burger` يفتح `.ds-drawer` مع `.ds-scrim`، إغلاق بـ Escape أو النقر خارجاً.
- **Reveal**: `IntersectionObserver` يضيف `is-visible` لعناصر `.ds-reveal`؛ يتوقف بعد الظهور.

## دليل الاستخدام

1. أضف `assets/ds.css` بعد `premium.min.css` في كل صفحة مطلوب تطويرها.
2. استبدل البنية القديمة بمكوّنات `ds-*` (انظر `design-system.html` في جذر الموقع = دليل حي).
3. أضف `<script src="/assets/app.js" defer>` في نهاية `body`.
4. جرّب الوضع الداكن وتوثّق من دقة الحروف والنطق على شاشة 320px.
5. طبعاً أعد تشغيل `npm run check` (lint + build + validate.py).