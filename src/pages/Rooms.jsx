import { useMemo, useState } from 'react'
import { useSeo } from '../hooks/useSeo'
import { RoomCard } from '../components/ui/RoomCard'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Input } from '../components/ui/Input'
import { rooms, regionTags } from '../data/rooms'
import { cn } from '../utils/className'

const initialTag = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('tag') || 'الكل'
}

export default function Rooms() {
  useSeo({
    title: 'غرف الدردشة',
    description:
      'تصفح جميع غرف الدردشة العراقية: غرف لكل المحافظات والاهتمامات — بغداد، البصرة، الموصل والكثير غيرها.',
    path: '/rooms',
  })

  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(initialTag)

  const visible = useMemo(() => {
    const q = query.trim()
    const filtered = rooms.filter(
      (r) => tag === 'الكل' || r.tag === tag,
    )
    if (!q) return filtered
    return filtered.filter(
      (r) => r.name.includes(q) || r.region.includes(q) || r.description.includes(q),
    )
  }, [query, tag])

  return (
    <>
      <section className="container-px pt-12 sm:pt-16">
        <SectionTitle
          kicker="الغرف المتاحة"
          title="الغرف"
          center
        />
        <form
          className="mx-auto max-w-lg"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="search"
            icon={<span aria-hidden="true">🔍</span>}
            label={undefined}
            placeholder="ابحث عن غرفة: بغداد، حب، رياضة…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ابحث عن غرفة"
          />
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['الكل', ...regionTags].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                tag === t
                  ? 'bg-brand-600 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="container-px pb-8 pt-10">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
          <p>
            {visible.length} غرفة{' '}
            {tag !== 'الكل' && <span>ضمن تصنيف «{tag}»</span>}
          </p>
          {query.trim() && (
            <button type="button" onClick={() => setQuery('')} className="text-brand-300 hover:underline">
              امسح البحث
            </button>
          )}
        </div>

        {visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        ) : (
          <div className="surface-strong p-12 text-center">
            <p className="text-3xl" aria-hidden="true">🔎</p>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-100">لا توجد نتائج</h3>
            <p className="mt-1.5 text-sm text-slate-400">جرّب كلمة بحث أخرى أو اختر تصنيفاً مختلفاً.</p>
          </div>
        )}
      </section>
    </>
  )
}