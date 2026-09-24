# شات درر العرب 💎

> منصة دردشة عراقية مجانية — إعادة بناء كاملة (v3) بـ **React + Vite + Tailwind CSS** مع تصدير ثابت متوافق مع GitHub Pages.

الدومين: `https://iraqia-chat.com`

---

## نظرة عامة

- **Framework:** Vite + React 18 (Static Export — بدون خادم)
- **التصميم:** Tailwind CSS + خطوط عربية مدمجة (Tajawal / Readex Pro) مع `font-display: swap`
- **RTL:** `<html lang="ar" dir="rtl">` في كامل الموقع
- **SEO:** عناوين ووصف وOpenGraph وTwitter Cards وJSON-LD (Organization/WebSite/WebPage + Schema لكل غرفة)، `sitemap.xml` و`robots.txt`
- **الدردشة:** محرّك غرف فوري (مزامنة لحظية بين التبويبات عبر BroadcastChannel + ذاكرة محلية) مع دعم اختياري لخادم `Socket.io` عبر `VITE_SOCKET_URL`

## البنية (Clean Architecture)

```
src/
├── components/
│   ├── ui/        # عناصر ذرّية: Button, Input, Modal, Badge, Avatar…
│   ├── chat/      # MessageList, ChatInput, UserList, Sidebar, EmojiPicker…
│   └── layout/    # Header, Navbar, Footer, PageLayout
├── pages/         # Home, Chat, Rooms, Room, About, Rules, Contact, Privacy, Terms, 404
├── hooks/         # useChat, useSeo, useOnlineStatus, useTheme, useLocalStorage, useWindowSize
├── services/      # chatBus (محلي) + socket (اختياري) + storage
├── data/          # الغرف، الرسائل، القوانين، الأسئلة الشائعة، التنقل
├── styles/        # index.css (Tailwind) + fonts.css (خطوط عربية)
├── types/         # نماذج البيانات (JSDoc)
└── utils/         # ادوات: SEO، تنسيق، خوارزميات
```

## التشغيل محلياً

```powershell
npm install
npm run dev        # تطوير بمعاينة مباشرة
npm run build      # بناء إنتاجي إلى dist/
npm run check      # فحص جودة البناء (SEO/ملفات النشر/كود مؤقت)
npm run preview    # معاينة البناء محلياً
```

> ملاحظة: عند تشغيل `npm install` لأول مرة على npm ≥ 11 قد يطلب النظام الموافقة على سكربت تثبيت `esbuild` (`npm approve-scripts esbuild`).

## التفاعل مع Socket.io المنفصل (اختياري)

اضبط متغير البيئة ثم أعد البناء:

```
VITE_SOCKET_URL=https://your-socket-server.example
```

من دون ذلك يعمل الموقع بكامل وظائفه عبر الطبقة المحلية المدمجة.

## النشر

- الـ **GitHub Actions** (`deploy.yml`) يبني ويرفع `dist/` إلى GitHub Pages تلقائياً عند كل Push على `main`.
- فعّل النشر في Settings → Pages → **Deploy from a branch (GitHub Actions)**.
- ملف `CNAME` مضمّن ضمن المخرجات.

## جودة البناء

```powershell
npm run check
```

يتحقق من: `lang=ar`/`dir=rtl`، وسوم `content-language`/`og:locale=ar_IQ`، الـ Schema، canonical، `robots.txt`، `sitemap.xml`، `404.html`، وغياب أي كود مؤقت (TODO/placeholder).

---
© شات درر العرب — جميع الحقوق محفوظة.