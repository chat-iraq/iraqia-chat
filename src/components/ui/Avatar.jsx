import { memo } from 'react'
import { cn } from '../../utils/className'

const palettes = [
  'bg-sky-500/25 text-sky-200',
  'bg-emerald-500/25 text-emerald-200',
  'bg-amber-500/25 text-amber-200',
  'bg-rose-500/25 text-rose-200',
  'bg-violet-500/25 text-violet-200',
  'bg-teal-500/25 text-teal-200',
  'bg-fuchsia-500/25 text-fuchsia-200',
  'bg-orange-500/25 text-orange-200',
]

function hueFor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palettes[h % palettes.length]
}

/** صورة رمزية للمستخدم: رمز تعبيري أو أحرف أولى ملوّنة */
export const Avatar = memo(function Avatar({ name = 'زائر', emoji, size = 'md' }) {
  const dims = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  }
  const initials = name.trim().slice(-2)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 select-none place-items-center rounded-full font-bold',
        dims[size],
        emoji ? 'bg-white/10 text-xl' : hueFor(name),
      )}
    >
      {emoji || initials}
    </span>
  )
})

export default Avatar