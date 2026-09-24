import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/className'

/** قائمة الحاضرين في الغرفة */
export function UserList({ room, attendees, currentNickname }) {
  const { count, list } = attendees

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-100">الحاضرون</h2>
        <Badge tone="mint" dot>
          {count} متصل
        </Badge>
      </div>
      <ul className="flex-1 divide-y divide-white/5 overflow-y-auto scrollbar-thin">
        {list.map((user) => {
          const active = user.name === currentNickname
          return (
            <li key={user.name} className="flex items-center gap-3 px-4 py-2.5">
              <div className="relative">
                <Avatar name={user.name} emoji={user.emoji} size="sm" />
                <span
                  className={cn(
                    'absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-night-800',
                    active ? 'bg-amber-400' : 'bg-emerald-400',
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">{user.name}</p>
                <p className="text-[11px] text-slate-500">{active ? 'أنت' : room.region}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default UserList