import { useState } from 'react'
import { cn } from '../../utils/className'

/** تلميح منبثق بسيط عند التمرير */
export function Tooltip({ label, children }) {
  const [show, setShow] = useState(false)
  if (!label) return children
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-night-800 px-3 py-1.5 text-xs text-slate-200 shadow-soft transition-opacity',
          show ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </span>
  )
}

export default Tooltip