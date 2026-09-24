import { Link } from 'react-router-dom'
import { Badge } from './Badge'
import { cn } from '../../utils/className'

/** بطاقة غرفة دردشة للشبكات (الرئيسية/الغرف) */
export function RoomCard({ room, to, compact = false }) {
  return (
    <Link
      to={to || `/room/${room.slug}`}
      className="group surface-strong relative block overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-2xl transition-transform group-hover:scale-110">
          {room.emoji}
        </span>
        <Badge tone="mint" dot>
          {room.online} متصل
        </Badge>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-slate-50 group-hover:text-brand-200">
        {room.name}
      </h3>
      <p className={cn('mt-1.5 text-sm leading-relaxed text-slate-400', compact && 'line-clamp-2')}>
        {room.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-slate-500">{room.region}</span>
        <span className="font-semibold text-brand-300">ادخل الغرفة ←</span>
      </div>
    </Link>
  )
}

export default RoomCard