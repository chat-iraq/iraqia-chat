# محرّك المحتوى - CONTENT_ENGINE

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- المرجع: s.txt §14، §16، §17، §24–§26، §30، §49، §68–§70

## نموذج البيانات (§14)
لكل عنصر: `id, title, slug, description, type, category, topic, keywords, intent,
author, publishedAt, updatedAt, image, alt, sources, relatedContent, canonical,
status, qualityScore`. المرجع: `seo/CONTENT_DATABASE.json`.

## محرّك الاكتشاف `content-discovery` (§16)
المدخلات: صفحات الموقع، العناقيد (`TOPIC_CLUSTERS.json`)، الكلمات (`KEYWORD_MAP.json`)،
سجل التعارض (`CONTENT_CONFLICT_DATABASE.json`)، SERP (`SERP_RESEARCH.md`).
المخرجات: مرشحون + تحديثات، **بدون نشر تلقائي**؛ تذهب إلى `content-queue.json` ثم QA.

## التقييم (§49)
`Search opportunity + Intent uniqueness + User value + Freshness + Evidence quality
+ Internal relevance + Content gap` → رقم داخلي لترتيب المرشحين فقط؛
لا يُنشر أي ادعاء بترتيب في محركات البحث.

## منع التكرار (§26) والكنبالة (§25)
- Exact: hash المحتوى.
- Near: تشابه عناوين.
- SEO: كلمات + نية + عناوين + كيانات.
- القرار: تحديث / دمج / تحويل / توسيع بدل إنشاء صفحة منافسة.
المراجع: `DUPLICATE_DATABASE.json`، `CANNIBALIZATION_DATABASE.json`.

## الطابور `content-queue.json` (§70)
الحالات: `candidate, researching, draft, qa, review, approved, published, rejected,
merge, redirect, update`. يُحدَّث يدوياً/آلياً، ولا يُنشر عنصر قبل `approved`.

## التحديث الدوري (§30)
`CONTENT_REFRESH_SYSTEM.json` يحدد محفّزات التحديث (تغيّر النية، هبوط CTR، معلومات قديمة،
روابط مكسورة، صفحة بحاجة لروابط داخلية). يعمل عبر `monthly-refresh.yml`.

## قواعد صارمة (§24، §29، §78)
لا Spam، لا حشو كلمات، لا مصادر مختلقة، لا Schema للتلاعب، ولا إنشاء صفحات جماعي متشابه.
