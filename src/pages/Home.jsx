import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/ui/Button'
import { SectionTitle } from '../components/ui/SectionTitle'
import { RoomCard } from '../components/ui/RoomCard'
import { Accordion } from '../components/ui/Accordion'
import { Badge } from '../components/ui/Badge'
import { featuredRooms, regionTags } from '../data/rooms'
import { faqItems } from '../data/faq'

const stats = [
  { value: '+5K', label: 'متصل الآن' },
  { value: '31', label: 'غرفة مفتوحة' },
  { value: '0', label: 'رسوم أو تسجيل' },
  { value: '+87', label: 'محافظات ومدن' },
]

const features = [
  {
    emoji: '⚡',
    title: 'بدون تسجيل في ثوانٍ',
    text: 'ادخل باسم بسيط وابدأ الدردشة فوراً — لا بريد إلكتروني ولا عملية تفعيل ولا انتظار.',
  },
  {
    emoji: '🛡️',
    title: 'آمن وتحت الرقابة',
    text: 'غرف مُدارة وقوانين واضحة وفريق إشراف يحافظ على جودة الحوار ويحذف المخالف فوراً.',
  },
  {
    emoji: '🗺️',
    title: 'غرف لكل المحافظات',
    text: 'من بغداد إلى البصرة، ومن أربيل إلى الناصرية — اختر مدينتك وتعرّف على أهلها.',
  },
]

const steps = [
  { emoji: '1️⃣', title: 'اختر غرفة', text: 'من صفحة الغرف أو من المحافظات المعروضة على الرئيسية.' },
  { emoji: '2️⃣', title: 'اكتب اسمك', text: 'اسم بسيط من اختيارك، ويمكنك تغييره من داخل الصفحة في أي وقت.' },
  { emoji: '3️⃣', title: 'ابدأ الحوار', text: 'شارك بسوالفك وتعرّف على ناس من كل العراق — بكل بساطة.' },
]

export default function Home() {
  useSeo({
    title: 'شات درر العرب',
    description:
      'أفضل منصة دردشة عراقية مجانية بلا تسجيل. غرف للتعارف والحوار من كل المحافظات، سريعة وآمنة ومباشرة.',
    path: '/',
  })

  return (
    <>
      <section className="container-px pb-10 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="brand" className="mb-5 px-3.5 py-1.5 text-sm">
            💬 دردشة عراقية فورية — بلا تسجيل
          </Badge>
          <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
            تعرّف وحبّ واحچي مع{' '}
            <span className="bg-gradient-to-l from-brand-400 to-brand-200 bg-clip-text text-transparent">
              كل العراق
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            منصة دردشة تجمع شباب وبنات بغداد والبصرة والموصل وأربيل وكل المحافظات في مكان واحد —
            سوالف حلوة وتعارف حقيقي بلا حواجز.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/chat" size="lg">
              🚀 ادخل الغرفة العامة الآن
            </Button>
            <Button to="/rooms" variant="secondary" size="lg">
              استكشف كل الغرف
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="surface px-4 py-5">
                <dt className="order-2 mt-1 text-xs text-slate-400">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-brand-300">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-px py-10">
        <SectionTitle kicker="لماذا درر العرب؟" title="تجربة دردشة صُمّمت لتكون الأجمل" center />
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="surface-strong p-6 transition-transform hover:-translate-y-1">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-2xl">{f.emoji}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-50">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-px py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle kicker="الأكثر نشاطاً الآن" title="غرف مميزة" className="mb-0" />
          <Button to="/rooms" variant="ghost" size="sm">
            جميع الغرف ←
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.map((room) => (
            <RoomCard key={room.slug} room={room} compact />
          ))}
        </div>
      </section>

      <section className="container-px py-10">
        <SectionTitle kicker="تصفح سريع" title="غرف حسب الاهتمام" center />
        <div className="flex flex-wrap justify-center gap-2.5">
          {['الكل', ...regionTags].map((tag) => (
            <a
              key={tag}
              href={`/rooms?tag=${tag === 'الكل' ? '' : encodeURIComponent(tag)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white"
            >
              {tag}
            </a>
          ))}
        </div>
      </section>

      <section className="container-px py-10">
        <SectionTitle kicker="سهلة جداً" title="أبدأ في ثلاث خطوات" center />
        <ol className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.title} className="surface p-6 text-center">
              <span className="text-3xl">{s.emoji}</span>
              <h3 className="mt-3 font-display font-bold text-slate-50">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-px max-w-3xl py-10">
        <SectionTitle kicker="أسئلة متكررة" title="قبل ما تبدأ" center />
        <Accordion items={faqItems} />
      </section>

      <section className="container-px mb-4 py-10">
        <div className="surface relative overflow-hidden bg-gradient-to-l from-brand-900/60 to-night-800/60 p-8 text-center sm:p-12">
          <p className="mx-auto max-w-2xl font-display text-2xl font-bold leading-relaxed text-slate-50 sm:text-3xl">
            الدردشة حاضرة… يلا، وين ما تكون من العراق، <span className="text-brand-300">الناس موجعين بطوفتك</span>
          </p>
          <Button to="/chat" size="lg" className="mt-6">
            ✨ انضم الآن — مجاناً وبدون تسجيل
          </Button>
        </div>
      </section>
    </>
  )
}