import { Link } from 'react-router-dom'
import { footerLinks } from '../../data/nav'

/** تذييل الموقع */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-night-900/80">
      <div className="container-px grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" width="36" height="36" className="h-9 w-9" />
            <span className="font-display text-lg font-bold text-slate-50">
              درر <span className="text-brand-400">العرب</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            منصة دردشة عراقية مجانية وآمنة، تجمع شباب وبنات العراق من كل المحافظات للتعارف والحوار
            بلا تسجيل.
          </p>
        </div>

        {[
          { title: 'روابط سريعة', links: footerLinks.main },
          { title: 'معلومات', links: footerLinks.info },
          { title: 'قانوني', links: footerLinks.legal },
        ].map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 text-sm font-bold text-slate-200">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-brand-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} شات درر العرب — جميع الحقوق محفوظة.</p>
          <p dir="ltr" className="font-mono">
            www.iraqia-chat.com
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer