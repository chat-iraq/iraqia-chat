import { cn } from '../../utils/className'

const tones = {
  brand: 'bg-brand-500/15 text-brand-200',
  mint: 'bg-emerald-500/15 text-emerald-300',
  peach: 'bg-orange-400/15 text-orange-200',
  rose: 'bg-rose-500/15 text-rose-300',
  slate: 'bg-white/10 text-slate-300',
}

/** شارة تصنيف/حالة صغيرة */
export function Badge({ children, tone = 'brand', dot, className }) {
  return (
    <span className={cn('badge', tones[tone], className)}>
      {dot && <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>}
      {children}
    </span>
  )
}

export default Badge