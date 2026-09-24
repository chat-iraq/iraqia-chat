import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/ui/Button'
import { featuredRooms } from '../data/rooms'
import { RoomCard } from '../components/ui/RoomCard'

export function NotFound() {
  useSeo({
    title: 'الصفحة غير موجودة',
    description: 'الصفحة التي تبحث عنها غير موجودة. تصفح غرف الدردشة العراقية المتاحة.',
    path: '/404',
  })

  return (
    <section className="container-px pb-12 pt-16 text-center sm:pt-24">
      <p className="font-display text-7xl font-bold text-brand-500/40">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-50 sm:text-3xl">
        هالصفحة مو موجودة… بس السوالف موجودة
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
        يبدو أن الرابط غير صحيح أو أن الصفحة نُقلت. لكن لا تقلق — غرف الدردشة بانتظارك.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button to="/" size="lg">
          العودة للرئيسية
        </Button>
        <Button to="/chat" variant="secondary" size="lg">
          ادخل الدردشة مباشرة
        </Button>
      </div>

      <div className="mt-14">
        <h2 className="mb-6 font-display text-lg font-bold text-slate-100">غرف يُفضّل الدخول إليها</h2>
        <div className="grid gap-5 text-start sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.slice(0, 3).map((room) => (
            <RoomCard key={room.slug} room={room} compact />
          ))}
        </div>
      </div>
    </section>
  )
}

export default NotFound