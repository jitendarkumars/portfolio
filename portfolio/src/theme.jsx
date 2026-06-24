import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} })

export function ThemeProvider({ children }) {
  // Initial value comes from the <html data-theme> attribute that the
  // inline script in index.html already set (prevents a flash on load).
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'paper'
    }
    return 'paper'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      /* ignore (e.g. privacy mode) */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'ink' ? 'paper' : 'ink'))

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
