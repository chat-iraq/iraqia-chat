import { useSeo } from '../hooks/useSeo'
import { SectionTitle } from '../components/ui/SectionTitle'

const blocks = [
  {
    h: 'ما نجمعه',
    items: [
      'اسم العرض الذي تختاره أنت (يمكن أن يكون اسماً مستعاراً بالكامل).',
      'بيانات تقنية عامة مثل نوع المتصفح والجهاز عملياً لتحسين التجربة.',
      'سجل الرسائل في الغرفة على جهازك فقط لمزامنتها بين تبويبات متصفحك.',
    ],
  },
  {
    h: 'ما لا نجمعه أبداً',
    items: [
      'لا نطلب بريداً إلكترونياً ولا رقم هاتف ولا أي بطاقة هوية.',
      'لا نتتبع موقعك الجغرافي ولا نراقب محادثاتك الخاصة خارج المنصة.',
      'لا نبيع بياناتك لأي طرف ثالث أو نستخدمها في الإعلانات الموجهة.',
    ],
  },
  {
    h: 'كيف نحمي بياناتك',
    items: [
      'يُقدَّم الموقع بالكامل عبر اتصال مشفّر (HTTPS).',
      'تُخزَّن إعداداتك واسمك داخل متصفحك المحلي ولا تُرفع إلى أي خادم.',
      'ننصحك بعدم مشاركة أي معلومات حساسة مع الغرباء داخل الغرف العامة.',
    ],
  },
  {
    h: 'حذف بياناتك',
    items: [
      'يمكنك مسح كل البيانات المحلية (الاسم، السجل، التفضيلات) من إعدادات المتصفح بمسح موقعنا.',
      'لا نحتفظ بأي حساب أو بيانات تعريفية مركزية قابلة للحذف من جهتنا لأننا لا نملكها أصلاً.',
    ],
  },
]

export default function Privacy() {
  useSeo({
    title: 'سياسة الخصوصية',
    description:
      'سياسة الخصوصية الخاصة بشات درر العرب: ما نجمعه وما لا نجمعه من بياناتك، وكيف نحمي خصوصيتك.',
    path: '/privacy',
  })

  return (
    <section className="container-px max-w-3xl pb-14 pt-12 sm:pt-16">
      <SectionTitle kicker="خصوصيتك أولاً" title="سياسة الخصوصية" />
      <p className="mb-8 text-sm leading-relaxed text-slate-400">
        آخر تحديث: {new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' })}. نحترم
        خصوصيتك بمعناها الحقيقي: منصتنا لا تتطلب حسابات ولا تجمع بيانات شخصية تعريفية.
      </p>

      <div className="space-y-6">
        {blocks.map((b) => (
          <article key={b.h} className="surface-strong p-6">
            <h2 className="font-display text-lg font-bold text-slate-50">{b.h}</h2>
            <ul className="mt-3 space-y-2.5">
              {b.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                  <span className="mt-0.5 text-brand-400" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}