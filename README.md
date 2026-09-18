# شات درر العرب

موقع دردشة عربي ثابت (Static) — الدومين: https://www.iraqia-chat.com

## نظرة عامة
- بنية HTML ثابتة بلا خطوة Build (انظر `seo/TECHNOLOGY_DECISION.md`).
- كل صفحة تحتوي: `<title>`، `meta description`، `canonical`، `og:image`، Schema مناسب، وفوتر موحّد.
- أنظمة المحتوى والتقارير الآلية في مجلد `seo/`.

## البنية
- صفحات الغرف: `<room>/index.html` + `img/rooms/<slug>.jpg`
- المقالات: `articles/<slug>.html` + `img/article-<slug>.jpg`
- الأسئلة: `questions/<slug>.html` + `questions.html`
- البحث: `search.html` + `assets/search-index.json` + `assets/search.js`
- لوحة الإدارة المعزولة: `admin/index.html` (noindex)
- الخرائط: `sitemap.xml`، `sitemap.html`، `sitemap.txt`، `robots.txt`

## الفحص والتحقق
```powershell
python scripts/validate.py          # فحص الجودة (يمكن إضافة --strict)
python scripts/discovery.py         # اقتراح مواضيع جديدة -> seo/discovery-report.json
```
التشغيل الآلي عبر GitHub Actions (انظر `.github/workflows/`): فحص أسبوعي/شهري/يومي.

## الأسئلة الشائعة
راجع `questions.html` — كل سؤال صفحة مستقلة بترميز `FAQPage`.

## نقطة الرجوع
Git (`main`). لا يُنشر أي تغيير دون مراجعة.
