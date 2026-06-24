import { useTheme } from '../theme'
import { SunIcon, MoonIcon } from './Icons'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'ink'

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
