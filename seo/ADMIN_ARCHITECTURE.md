# بنية لوحة التحكم - ADMIN_ARCHITECTURE

- الموقع: شات درر العرب (https://www.iraqia-chat.com)
- المرجع: s.txt §20، §21، §22، §23

## المقارنة
| الخيار | الوصف | المزايا | العيوب | الحكم |
|---|---|---|---|---|
| A | Dashboard محلي ثابت `/admin` يقرأ ملفات المشروع | بسيط، بلا Backend، بلا أسرار | محلي فقط | **مُعتمد الآن** |
| B | Static + GitHub API | إدارة draft/workflow | يتطلب مصادقة وtoken | لاحقاً عند الحاجة |
| C | Cloudflare Worker + D1/KV | لوحة online حقيقية | تعقيد وتكلفة | لاحقاً إن ثبتت الحاجة |

## المُنفَّذ الآن (الخيار A)
- `admin/index.html`: لوحة ثابتة تقرأ `seo/DASHBOARD.json` و`CONTENT_STATISTICS.json`
  و`QUALITY_GATE_REPORT.json` عبر fetch محلي.
- معزولة: `<meta name="robots" content="noindex,nofollow">` + `Disallow: /admin/` في robots.txt (§22).
- لا تعرض أي مفاتيح/أسرار/بيانات خاصة؛ تقرأ مؤشرات مجمّعة فقط (§22، §23).

## محتوى اللوحة (§21)
- Overview: الصفحات، المقالات، الأسئلة، draft، published، تحتاج تحديثاً، تحذيرات
  التكرار/الكنبالة، اليتيمة، الروابط المكسورة، حالة البناء.
- SEO/Quality/Automation: مؤشرات محسوبة من ملفات `seo/` والمصادر أعلاه.

## السياسة الأمنية
لا تُضاف مفاتيح إلى HTML/JS. أي مفتاح مستقبلي (GitHub/Search/AI) يوضع في
GitHub Secrets أو مدير أسرار، ولا يُكتب في العميل ولا في المستودع (§23).
