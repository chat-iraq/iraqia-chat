import { useSeo } from '../hooks/useSeo'
import { SectionTitle } from '../components/ui/SectionTitle'
import { chatRules, mainTerms } from '../data/rules'

export default function Terms() {
  useSeo({
    title: 'شروط الاستخدام',
    description: 'شروط استخدام شات درر العرب: الحقوق والالتزامات عند استخدام منصة الدردشة العراقية.',
    path: '/terms',
  })

  return (
    <section className="container-px max-w-3xl pb-14 pt-12 sm:pt-16">
      <SectionTitle kicker="اتفاقية الاستخدام" title="شروط الاستخدام" />

      <div className="surface-strong p-6">
        <h2 className="font-display text-lg font-bold text-slate-50">أنت توافق على:</h2>
        <ul className="mt-3 space-y-2.5">
          {mainTerms.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
              <span className="mt-0.5 text-brand-400" aria-hidden="true">•</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-400">
        <p>
          باستخدامك لموقع «شات درر العرب» فإنك تلتزم بالكامل بقوانين الدردشة («قوانين الدردشة») وبهذه
          الشروط. الإدارة تحتفظ بالحق الكامل في تعديل هذه الشروط في أي وقت، ويُعتبر استمرارك في
          الاستخدام بعد التعديل موافقة صريحة على الشروط الجديدة.
        </p>
        <p className="mt-3">
          سن الكافي للاستخدام: الموقع مخصص لمن هم بسن <strong className="text-slate-200">18 سنة</strong> وما
          فوق. دخولك للموقع يقرّ بأنك بالسن القانوني.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {chatRules.map((r) => (
          <div key={r.title} className="flex gap-3 text-sm">
            <span className="text-brand-400" aria-hidden="true">♦</span>
            <p className="text-slate-400">
              <strong className="text-slate-200">{r.title}:</strong> {r.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}