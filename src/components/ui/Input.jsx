import { forwardRef } from 'react'
import { cn } from '../../utils/className'

/**
 * حقل إدخال موحّد مع تسمية وأيقونة اختيارية.
 */
export const Input = forwardRef(function Input(
  { label, icon, hint, error, containerClassName, className, id, ...rest },
  ref,
) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-')}` : undefined)
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input', icon && 'ps-10', error && 'border-rose-500/60 focus:ring-rose-500/30', className)}
          {...rest}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  )
})

export default Input