# بنية الأتمتة - AUTOMATION_ARCHITECTURE

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- المرجع: s.txt §16–§19، §47، §50–§52، §69–§72

## المبدأ
الأتمتة تكتشف وتقترح وتتحقق، ولا تنشر مباشرة. تمر كل صفحة عبر Quality Gate (§50).
لا تُنشأ صفحة لمجرد القدرة على ذلك؛ قد تكون النتيجة `0 pages today` وهي نجاح (§68).

## مسارات GitHub Actions
| الملف | التشغيل | المهام |
|---|---|---|
| `.github/workflows/validate.yml` | push / pull_request | فحص الروابط، العناوين المكررة، canonical، H1، alt، schema، JSON-LD، JSON صالح، noindex داخل sitemap |
| `.github/workflows/weekly-audit.yml` | أسبوعي (cron) | تدقيق SEO + جودة + صفحات يتيمة + تقرير |
| `.github/workflows/monthly-refresh.yml` | شهري (cron) | كشف صفحات تحتاج تحديثاً (CONTENT_REFRESH_SYSTEM) |
| `.github/workflows/daily-discovery.yml` | يومي (cron) | تشغيل Discover→Score→Candidate (لا نشر) |

> المتطلبات: GitHub Actions يدعم scheduled workflows عبر cron (§18). لا أسرار مطلوبة
> للفحوص الحالية؛ إن احتاج البحث الخارجي مفاتيح، تُضاف عبر GitHub Secrets فقط (§23).

## خط أنابيب المحتوى (§17)
```
Discover → Research → Classify → Check Existing → Duplicate → Cannibalization
→ Search Intent → Keyword → Source Validation → Generation → Fact Check
→ SEO → Internal Links → Images → Schema → Build → QA → Publish
```

## بوابة الجودة الآلية (§51)
يفحص `scripts/validate.py`: الروابط المكسورة، العناوين/الأوصاف المكررة، H1 مفقود/متعدد،
canonical مفقود، alt مفقود، أبعاد الصور، الصفحات اليتيمة، JSON-LD غير صالح،
noindex/redirects داخل sitemap، JSON معطوب.

## الاختبار البصري (§52)
يُجرى مستقبلاً عبر Playwright في CI (الصفحات: home, article, question, chat, category,
search, author, 404، على mobile وdesktop). غير مُفعّل الآن لعدم وجود متصفح headless في
البيئة الحالية؛ الخطة موثّقة ويمكن إضافتها عند الحاجة.

## أوضاع المراجعة (§69)
- AUTO: محتوى منخفض المخاطر ومُتحقَّق منه.
- REVIEW: معلومات حسّاسة/أرقام/ادعاءات/دمج/حذف → مراجعة بشرية إلزامية.
