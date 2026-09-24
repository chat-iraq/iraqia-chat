import { Navbar } from './Navbar'

/** هيدر الموقع: شريط إعلاني خفيف + التنقل العلوي */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-900/80 backdrop-blur-md">
      <div className="border-b border-white/5 bg-brand-600/10 py-1.5 text-center text-xs text-brand-200">
        ✨ الدردشة مجانية بالكامل — بلا تسجيل وبلا أي رسوم
      </div>
      <Navbar />
    </header>
  )
}

export default Header