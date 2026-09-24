import { useSeo } from '../hooks/useSeo'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Accordion } from '../components/ui/Accordion'
import { Button } from '../components/ui/Button'
import { faqItems } from '../data/faq'

const values = [
  { e: '❤️', t: 'الوحدة العراقية', d: 'نؤمن أن الحوار يجمع العراق أكثر من أي شيء آخر، بلا طائفية ولا عنصرية.' },
  { e: '🔒', t: 'الخصوصية', d: 'لا نسأل عن بياناتك الحقيقية أبداً، ولا نبيع معلوماتك لأي جهة.' },
  { e: '🛡️', t: 'الأمان والرقابة', d: 'فريق إشراف يعمل على مدار الساعة لإبقاء الغرف نظيفة ومحترمة.' },
  { e: '⚡', t: 'السرعة المجانية', d: 'منصة خفيفة تعمل على أي جهاز، ومجانية بالكامل ومن دون إعلانات مزعجة.' },
]

export default function About() {
  useSeo({
    title: 'من نحن',
    description:
      'تعرف على شات درر العرب: منصة دردشة عراقية مجانية تهدف إلى تقريب الشباب والبنات من كل المحافظات في حوار آمن ومحترم.',
    path: '/about',
  })

  return (
    <>
      <section className="container-px max-w-3xl pt-12 sm:pt-16">
        <SectionTitle kicker="قصتنا" title="ماذا نعني بدرر العرب؟" />
        <div className="space-y-4 text-base leading-relaxed text-slate-300">
          <p>
            وُلد <strong className="text-brand-300">«شات درر العرب»</strong> من فكرة بسيطة: العراقيون
            أهل سوالف وحكايات وأنس، ويستحقون مكاناً يجمعهم بلا حدود ولا تسجيل ولا تعقيد.
          </p>
          <p>
            نبني اليوم منصة دردشة حية تجمع شباب وبنات بغداد، البصرة، الموصل، أربيل وكل المحافظات —
            غرف موضوعية للتعارف، وللحب، وللصداقة، وللسوالف الخفيفة. كل شيء مجاني وسريع ويركّز على
            التجربة الإنسانية قبل أي شيء آخر.
          </p>
          <p>
            نعدكم ببيئة محترمة تشرف عليها إدارة فعّالة، وبخصوصية تامة، وبغرف لا تنام لتجد دائماً من
            يحجّي معاك.
          </p>
        </div>
      </section>

      <section className="container-px py-10">
        <SectionTitle kicker="مبادئنا" title="قيم نتمسك بها" />
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <article key={v.t} className="surface-strong p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-2xl">{v.e}</span>
              <h3 className="mt-4 font-display font-bold text-slate-50">{v.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{v.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-px max-w-3xl py-10">
        <SectionTitle kicker="أسئلة متكررة" title="كل ما تريد معرفته" center />
        <Accordion items={faqItems} />
        <div className="mt-8 text-center">
          <Button to="/chat" size="lg">
            جاهز؟ ادخل الدردشة الآن
          </Button>
        </div>
      </section>
    </>
  )
}