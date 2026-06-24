import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scroll to the top on every route change (unless we're jumping to a section).
export default function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    if (state?.scrollTo) return
    window.scrollTo(0, 0)
  }, [pathname, state])
  return null
}
