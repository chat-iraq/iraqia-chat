# الاختبار البصري - Visual Regression (s.txt 52)

الخطة: تشغيل Playwright في CI لالتقاط لقطات للصفحات الأساسية ومقارنتها.
الصفحات: home, article, question, chat, category, search, author, 404 — على mobile وdesktop.

الحالة: موثّق وغير مُفعّل بعد (لا حاجة له قبل تغييرات تصميم كبرى ولمنع استهلاك CI).
التفعيل لاحقاً:
1. `npm i -D @playwright/test`
2. `npx playwright install --with-deps chromium`
3. إضافة `.github/workflows/visual.yml` يشغّل اللقطات ويخزّن الفروق كـ artifact.
