import { memo } from 'react'
import { cn } from '../../utils/className'
import { formatTime } from '../../utils/format'
import { Avatar } from '../ui/Avatar'

/** فقاعة رسالة فردية */
export const MessageBubble = memo(function MessageBubble({ message, nickname }) {
  if (message.system) {
    return (
      <li className="my-2 flex justify-center">
        <div className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-slate-400">{message.text}</div>
      </li>
    )
  }

  const own = message.own || message.author === nickname

  return (
    <li className="flex animate-fade-up gap-2.5 px-4 py-2" dir="auto">
      <Avatar name={message.author} emoji={message.emoji} size="sm" />
      <div className={cn('min-w-0 max-w-[78%]', own && 'ms-auto')}>
        <div className={cn('mb-1 flex items-baseline gap-2', own && 'flex-row-reverse')}>
          <span className="text-xs font-semibold text-brand-200">{message.author}</span>
          <time className="text-[10px] text-slate-500" dateTime={new Date(message.ts).toISOString()}>
            {formatTime(message.ts)}
          </time>
        </div>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
            own
              ? 'rounded-es-sm bg-brand-600 text-white'
              : 'rounded-ee-sm bg-white/[0.07] text-slate-100',
          )}
        >
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    </li>
  )
})

export default MessageBubble