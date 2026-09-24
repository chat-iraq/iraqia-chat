import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { RoomCard } from '../components/ui/RoomCard'
import { Card } from '../components/ui/Card'
import { getRoom, roomsByTag } from '../data/rooms'
import { NotFound } from './NotFound'

export default function Room() {
  const { slug = 'general' } = useParams()
  const room = useMemo(() => getRoom(slug) || getRoom('general'), [slug])

  useSeo({
    title: room.title,
    description: room.description,
    path: `/room/${room.slug}`,
    room,
  })

  if (!getRoom(slug)) {
    return <NotFound />
  }

  const related = roomsByTag(room.tag).filter((r) => r.slug !== room.slug).slice(0, 6)

  return (
    <>
      <section className="container-px pt-12 sm:pt-16">
        <article className="surface relative overflow-hidden p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-900/40 via-transparent to-transparent" aria-hidden="true" />
          <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-white/10 text-5xl">
            {room.emoji}
          </span>
          <h1 className="relative mt-5 font-display text-3xl font-bold text-slate-50 sm:text-4xl">
            {room.name}
          </h1>
          <p className="relative mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-300">
            {room.description}
          </p>
          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="mint" dot>
              {room.online}+ متصل الآن
            </Badge>
            <Badge>{room.region}</Badge>
            <Badge tone="slate">{room.tag}</Badge>
          </div>
          <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to={`/chat/${room.slug}`} size="lg">
              💬 ادخل غرفة {room.name}
            </Button>
            <Button to="/rooms" variant="secondary" size="lg">
              غرف أخرى
            </Button>
          </div>
        </article>
      </section>

      <section className="container-px py-10">
        <h2 className="mb-6 font-display text-xl font-bold text-slate-50">لماذا {room.name} في درر العرب؟</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { e: '👥', t: 'أهل المحافظة', d: `شباب وبنات ${room.name} بانتظارك، ناس حقيقيون وحوارات لا تنتهي.` },
            { e: '🛡️', t: 'بيئة محترمة', d: 'قوانين واضحة ومشرفون دائمون لضمان حوار راقٍ وآمن للجميع.' },
            { e: '📱', t: 'يعمل على جوالك', d: 'تصميم متجاوب سريع من دون تطبيقات إضافية، يكفي المتصفح فقط.' },
          ].map((f) => (
            <Card key={f.t}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">{f.e}</span>
              <h3 className="mt-3 font-display font-bold text-slate-50">{f.t}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-px py-10">
          <h2 className="mb-6 font-display text-xl font-bold text-slate-50">غرف مشابهة</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <RoomCard key={r.slug} room={r} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}