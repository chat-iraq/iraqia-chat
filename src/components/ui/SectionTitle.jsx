import { cn } from '../../utils/className'

/** عنوان قسم مع خط تمييز جانبي */
export function SectionTitle({ kicker, title, className, center = false }) {
  return (
    <div className={cn(center && 'text-center', 'mb-8')}>
      {kicker && (
        <p className="mb-2 text-sm font-medium tracking-wide text-brand-300">
          {kicker}
        </p>
      )}
      <h2 className={cn('font-display text-2xl font-bold text-slate-50 sm:text-3xl', className)}>{title}</h2>
    </div>
  )
}

export default SectionTitle