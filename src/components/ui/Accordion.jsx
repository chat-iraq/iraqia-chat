import { useState } from 'react'
import { cn } from '../../utils/className'

/** عنصر طيّ/فرد للأسئلة الشائعة */
export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div
            key={item.q}
            className={cn('surface overflow-hidden transition-colors', open && 'border-brand-500/40')}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
            >
              <span className={cn('font-semibold', open ? 'text-brand-200' : 'text-slate-100')}>{item.q}</span>
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-sm text-brand-300 transition-transform',
                  open && 'rotate-180',
                )}
              >
                ▾
              </span>
            </button>
            <div
              className={cn(
                'grid transition-all duration-300',
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-slate-300">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion