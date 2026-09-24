import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

/** قالب الصفحات: رأس + محتوى + تذييل، مع تمرير تلقائي لأعلى عند التنقل */
export function PageLayout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default PageLayout