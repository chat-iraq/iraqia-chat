import { rooms } from '../../data/rooms'
import { cn } from '../../utils/className'

/** مبدّل الغرف: شريط أفقي سريع للتبديل داخل صفحة الدردشة */
export function RoomSwitcher({ current, onChange }) {
  return (
    <nav
      aria-label="تبديل الغرفة"
      className="flex gap-2 overflow-x-auto border-b border-white/10 bg-night-900/60 p-2 scrollbar-thin lg:hidden"
    >
      {rooms.map((room) => (
        <button
          key={room.slug}
          type="button"
          onClick={() => onChange(room.slug)}
          aria-current={current === room.slug ? 'page' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors',
            current === room.slug
              ? 'bg-brand-600 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10',
          )}
        >
          <span aria-hidden="true">{room.emoji}</span>
          {room.name}
        </button>
      ))}
    </nav>
  )
}

export default RoomSwitcher