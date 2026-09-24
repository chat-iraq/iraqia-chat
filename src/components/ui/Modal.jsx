import { useEffect } from 'react'
import { cn } from '../../utils/className'

/**
 * نافذة منبثقة بأداء وصولي (ESC، تثبيت التمرير، تصغير الخلفية).
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div className={cn('relative w-full animate-pop-in overflow-hidden rounded-2xl border border-white/10 bg-night-800 shadow-2xl', sizes[size])}>
        {title && (
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="font-display text-lg font-semibold text-slate-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </header>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">{footer}</footer>}
      </div>
    </div>
  )
}

export default Modal