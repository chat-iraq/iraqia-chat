import { useSeo } from '../hooks/useSeo'
import { SectionTitle } from '../components/ui/SectionTitle'
import { chatRules } from '../data/rules'
import { Button } from '../components/ui/Button'

export default function Rules() {
  useSeo({
    title: 'قوانين الدردشة',
    description:
      'قوانين الدردشة في شات درر العرب: احترام الجميع، منع المحتوى الصريح والتحريض، وضمان بيئة آمنة للجميع.',
    path: '/rules',
  })

  return (
    <section className="container-px max-w-3xl pb-12 pt-12 sm:pt-16">
      <SectionTitle kicker="لأن الصدق واجب" title="قوانين الدردشة" />

      <ol className="space-y-4">
        {chatRules.map((rule, i) => (
          <li key={rule.title} className="surface flex gap-4 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600/20 text-sm font-bold text-brand-300">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-50">{rule.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{rule.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm leading-relaxed text-amber-100">
        <strong className="font-bold">⚠️ تنبيه:</strong> مخالفة القوانين قد تؤدي إلى حظر فوري ودائم
        دون سابق إنذار، ونحتفظ بالحق الكامل في اتخاذ ما يلزم للحفاظ على أمان الأعضاء.
      </div>

      <div className="mt-8 text-center">
        <Button to="/chat" variant="secondary" size="lg">
          انضم للدردشة مع الالتزام بالقوانين
        </Button>
      </div>
    </section>
  )
}