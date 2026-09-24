import { useEffect } from 'react'

/** هوية الواجهة الليلية موحّدة عبر كامل الموقع */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = 'dark'
    root.classList.add('dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = '#0b1022'
    document.body.classList.remove('light-override')
  }, [])
  return { theme: 'dark' }
}

export default useTheme