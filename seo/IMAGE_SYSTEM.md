# نظام الصور - IMAGE_SYSTEM

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- إجمالي JPG: 955 — PNG: 99.
- صور الغرف: `img/rooms/<slug>.jpg` (slug = مسار الصفحة، مثال `3asl/index.html` → `3asl-index.jpg`).
- صور المقالات: `img/article-<slug>.jpg` بعرض 1280×630.
- صورة العلامة: `chat-iraq.jpg` — صورة المؤلف: `Kaz.png` (موجودة على الجذر، 227,414 بايت).
- كل صورة لها `alt` وصفي، و`width`/`height`، و`loading="lazy"` (عدا صورة البطل إن لزم).
- لا صور خارجية/مسروقة؛ كل الصور أصلية مولّدة للمشروع.
- التوصية المستقبلية: توليد WebP/AVIF + `<picture>` مع إبقاء JPG كبديل، دون كسر الروابط الحالية.
