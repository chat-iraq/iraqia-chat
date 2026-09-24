import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { PageLayout } from './components/layout/PageLayout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Rooms from './pages/Rooms'
import Room from './pages/Room'
import About from './pages/About'
import Rules from './pages/Rules'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import { NotFound } from './pages/NotFound'

const REDIRECT_KEY = 'iraqiachat:path'

/** استعادة المسار المحفوظ بعد إعادة التوجيه من 404.html على GitHub Pages */
function useSpaPathRestore() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let stored = null
    try {
      stored = sessionStorage.getItem(REDIRECT_KEY)
    } catch {
      /* ignore */
    }
    if (!stored) return
    try {
      sessionStorage.removeItem(REDIRECT_KEY)
      const path = stored.split('?')[0].split('#')[0]
      if (path && path !== location.pathname) {
        navigate(path)
      }
    } catch {
      /* ignore */
    }
  }, [location.pathname, navigate])
}

function AppShell() {
  useTheme()
  useSpaPathRestore()

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:slug" element={<Chat />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:slug" element={<Room />} />
        <Route path="/about" element={<About />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}