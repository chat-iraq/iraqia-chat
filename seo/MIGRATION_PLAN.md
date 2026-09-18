# خطة الترحيل الآمن - MIGRATION_PLAN

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- المرجع: s.txt §5، §42، §58، §60، §72، §80

## المبدأ
لا نغيّر أي URL قائم. التحسينات تتم على نفس المسارات لتفادي فقدان أي صفحة مفهرسة.
- URLs الحالية: 793 في `sitemap.xml`.
- لا Redirects مطلوبة الآن لأن المسارات ثابتة.

## المراحل (مطابقة §72) والحالة
| المرحلة | الوصف | الحالة |
|---|---|---|
| 1 | Audit كامل | ✅ منجز (`seo/*_AUDIT.md`، `_audit/`) |
| 2 | Architecture proposal | ✅ `seo/ARCHITECTURE.md` |
| 3 | Technology decision | ✅ `seo/TECHNOLOGY_DECISION.md` |
| 4 | Design system prototype | ✅ `seo/DESIGN_SYSTEM.md` + `assets/premium.min.css` |
| 5 | Homepage prototype | ✅ الصفحة الرئيسية بالقالب الحالي |
| 6 | Article template | ✅ `articles/*.html` (16 مقالاً) |
| 7 | Question template | ✅ `questions/` (نموذج أولي) |
| 8 | Chat template | ✅ صفحات الغرف (831 صفحة مُدارة) |
| 9 | Content architecture | ✅ بيانات `seo/` (Content Database/Inventory/Queue) |
| 10 | SEO infrastructure | ✅ metadata + schema + sitemaps + robots |
| 11 | Automation | ✅ `.github/workflows` + `scripts/` |
| 12 | Migration | ✅ لا ترحيل URLs مطلوب (static) |
| 13 | Testing | ✅ `scripts/validate.py` + أدوات التدقيق |
| 14 | Deployment | ⏳ بانتظار قرار المستخدم بالنشر (GitHub Pages) |
| 15 | Content expansion | 🔄 Batch 1 منفّذ؛ التوسّع عبر Content Queue |

## أي تغيير URL مستقبلي (إن حدث)
يجب توثيق: `old URL → new URL → redirect strategy`، مع تحديث `sitemap.xml`
وإضافة تحويل على مستوى Cloudflare/استضافة تدعم Redirects. لا يُزال أي رابط قبل ذلك.

## السلامة
- نقطة الرجوع: تاريخ Git على الفرع `main`.
- كل تغيير موثّق في `seo/CHANGE_LOG.md`.
- لا حذف صفحات قبل وجود بديل/تحويل (§5، §60).
