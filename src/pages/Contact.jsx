import { useState } from 'react'
import { useSeo } from '../hooks/useSeo'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Contact() {
  useSeo({
    title: 'اتصل بنا',
    description:
      'تواصل مع إدارة شات درر العرب: للإبلاغ عن مخالفات، واقتراحات تحسين، أو أي استفسار آخر. نرد خلال 24 ساعة.',
    path: '/contact',
  })

  const [sent, setSent] = useState(false)

  return (
    <section className="container-px max-w-3xl pb-12 pt-12 sm:pt-16">
      <SectionTitle kicker="صوتك يهمنا" title="اتصل بنا" />

      <div className="surface-strong p-6 sm:p-8">
        {sent ? (
          <div className="py-10 text-center">
            <p className="text-4xl" aria-hidden="true">✅</p>
            <h3 className="mt-3 font-display text-xl font-bold text-slate-50">تم استلام رسالتك</h3>
            <p className="mt-2 text-sm text-slate-400">
              شكراً لتواصلك معنا. سيرد فريق الإدارة على رسالتك في أقرب وقت (خلال 24 ساعة عادة).
            </p>
            <Button variant="secondary" size="sm" className="mt-6" onClick={() => setSent(false)}>
              إرسال رسالة أخرى
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="اسمك" name="name" placeholder="الاسم الذي تفضله" required />
              <Input label="بريدك الإلكتروني (اختياري)" name="email" type="email" placeholder="name@example.com" />
            </div>
            <div>
              <label htmlFor="subject" className="label">
                موضوع الرسالة
              </label>
              <select id="subject" name="subject" className="input" defaultValue="بلاغ عن مخالفة">
                <option>بلاغ عن مخالفة</option>
                <option>اقتراح تحسين</option>
                <option>مشكلة تقنية</option>
                <option>استفسار عام</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="label">
                رسالتك
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                placeholder="اكتب تفاصيل رسالتك هنا…"
                className="input resize-y"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              إرسال الرسالة
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}