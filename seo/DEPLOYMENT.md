# دليل النشر — DEPLOYMENT

## النموذج

- موقع ثابت 100% (صفر Build): HTML + CSS + JS أصيل، لا خادم ولا قاعدة بيانات.
- الإنتاج يُرفع عبر git push إلى `origin/main` (GitHub) ثم GitHub Pages/مستضيف ثابت يدعم `https`.
- الإصدارات: `<room>.html`, `<room>/index.html`, مقالات وأسئلة بـ `articleLocs`, لا إعادة بناء إلا عند توليد منشورات أو تعديل `sitemap.xml`.

## الضمانات قبل النشر

تنفيذ من مجلد الموقع (كل سطر يجب أن يمر):

```
npm install --no-audit --no-fund   # ليس هناك اعتماديات؛ سطر احتياطي
npm run lint                       # بنيان HTML (لا أخطاء قاتلة في صفحات ds)
npm run build                      # كل <loc> و <image:loc> في sitemap.xml يجب أن يحلّ إلى ملف موجود
npm run test                       # python scripts/validate.py (عناوين/أوصاف/روابط/العناوين المكررة…)
```

- `final_audit.ps1` — المراجعة النهائية (يفحص `admin`, `scripts`, `seo` باستبعاد صريح).
- `rebuild_sitemaps.ps1` — إعادة توليد Sitemaps بعد إضافة صفحات، ثم `validate_sitemaps.ps1`.
- إذا تغيّر المحتوى (منشورات/أسئلة) شغّل: `gen_content_systems.ps1` ثم `gen_reports.ps1` ثم `postprocess_questions.py` ثم `finalize_batch2.py` (يستعيد DASHBOARD.md و CHANGE_LOG.md).

## خطوات النشر

1. `git add -A && git commit` بوصف واضح.
2. `git push origin main`.
3. تأكد من تشغيل CI بنجاح (`.github/workflows/ci.yml` يفحص الموقعين).
4. بعد النشر تحقّق من: صفحة الرئيسية، غرفة عشوائية، صفحة مقال، بحث، والوضع الداكن.

## الأمان

- لا أسرار في المستودع؛ ملفات حساسة (إن وُجدت) تُستثنى بـ `.gitignore`.
- الروابط إلى `/chat/` (غرف خارجية) تحمل `rel="nofollow noopener"`.
- عدم إدخال أي كود تنفيذي في صفحات HTML إلا من `assets/app.js` الموحّد.