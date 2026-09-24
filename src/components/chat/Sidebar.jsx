import { Link } from 'react-router-dom'
import { UserList } from './UserList'
import { Badge } from '../ui/Badge'
import { rooms } from '../../data/rooms'
import { cn } from '../../utils/className'

/** الشريط الجانبي للغرفة: معلومات + تبديل غرفة + قائمة الحاضرين */
export function Sidebar({ room, attendees, currentNickname, mode }) {
  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-e border-white/10 bg-night-800/40 lg:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">{room.emoji}</span>
          <div>
            <h2 className="font-display font-bold text-slate-50">{room.name}</h2>
            <p className="text-xs text-slate-400">{room.region}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{room.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{mode === 'live' ? 'بث مباشر' : 'دردشة فورية'}</Badge>
          <Badge tone="slate">{room.tag}</Badge>
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">تبديل الغرفة</h3>
        <ul className="max-h-40 space-y-1 overflow-y-auto scrollbar-thin">
          {rooms.slice(0, 12).map((r) => (
            <li key={r.slug}>
              <Link
                to={`/chat/${r.slug}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                  r.slug === room.slug
                    ? 'bg-brand-600/20 text-brand-200'
                    : 'text-slate-300 hover:bg-white/5',
                )}
              >
                <span aria-hidden="true">{r.emoji}</span>
                {r.name}
                <span className="ms-auto text-[10px] text-slate-500">{r.online}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <UserList room={room} attendees={attendees} currentNickname={currentNickname} />
    </aside>
  )
}

export default Sidebar