import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navLinks } from '../../data/nav'
import { cn } from '../../utils/className'
import { Button } from '../ui/Button'

/** شريط التنقل العلوي */
export function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    cn(
      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-white/10 text-brand-200' : 'text-slate-300 hover:bg-white/5 hover:text-white',
    )

  return (
    <nav aria-label="التنقل الرئيسي" className="container-px flex h-16 items-center justify-between gap-4">
      <NavLink to="/" className="flex items-center gap-2.5" aria-label="شات درر العرب — الرئيسية">
        <img src="/favicon.svg" alt="" width="36" height="36" className="h-9 w-9" />
        <span className="font-display text-lg font-bold text-slate-50">
          درر <span className="text-brand-400">العرب</span>
        </span>
      </NavLink>

      <ul className="hidden items-center gap-1 md:flex">
        {navLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Button to="/chat" variant="primary" size="sm">
          ابدأ الدردشة
        </Button>
      </div>

      <button
        type="button"
        aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-200 hover:bg-white/10 md:hidden"
      >
        <span className="space-y-1.5">
          <span className={cn('block h-0.5 w-5 bg-current transition-transform', open && 'translate-y-2 rotate-45')} />
          <span className={cn('block h-0.5 w-5 bg-current transition-opacity', open && 'opacity-0')} />
          <span className={cn('block h-0.5 w-5 bg-current transition-transform', open && '-translate-y-2 -rotate-45')} />
        </span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-white/10 bg-night-900/95 p-4 backdrop-blur md:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-white/10 text-brand-200' : 'text-slate-200 hover:bg-white/5',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Button to="/chat" onClick={() => setOpen(false)} variant="primary" className="w-full">
                ابدأ الدردشة
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Navbar