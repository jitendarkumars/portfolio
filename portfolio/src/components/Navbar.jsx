import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import ThemeToggle from './ThemeToggle'
import { SearchIcon } from './Icons'

// Ordered nav. 'section' items scroll on the home page; 'route' items navigate.
const navItems = [
  { type: 'section', id: 'about', label: 'About' },
  { type: 'section', id: 'experience', label: 'Work' },
  { type: 'section', id: 'now', label: 'Now' },
  { type: 'section', id: 'projects', label: 'Projects' },
  { type: 'route', to: '/blog', label: 'Blog' },
  { type: 'section', id: 'vlog', label: 'Daily Log' },
  { type: 'section', id: 'contact', label: 'Contact' },
]

export default function Navbar({ onOpenPalette }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const onHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track the active section — only relevant on the home page.
  useEffect(() => {
    if (!onHome) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    navItems
      .filter((n) => n.type === 'section')
      .forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      })
    return () => observer.disconnect()
  }, [onHome])

  const close = () => setOpen(false)

  const goToSection = (id) => {
    close()
    if (!onHome) {
      navigate('/', { state: { scrollTo: id } })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goHome = () => {
    close()
    if (onHome) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isBlog = location.pathname.startsWith('/blog')

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav__inner">
        <Link to="/" className="nav__logo" onClick={goHome}>
          {profile.name.toLowerCase()}<span>.dev</span>
        </Link>

        <div className={`nav__links ${open ? 'open' : ''}`}>
          {navItems.map((n) =>
            n.type === 'route' ? (
              <Link
                key={n.to}
                to={n.to}
                className={`nav__link ${isBlog ? 'active' : ''}`}
                onClick={close}
              >
                {n.label}
              </Link>
            ) : (
              <a
                key={n.id}
                href={`/#${n.id}`}
                className={`nav__link ${onHome && active === n.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  goToSection(n.id)
                }}
              >
                {n.label}
              </a>
            )
          )}
          <a
            href="/#contact"
            className="btn btn--primary nav__cta"
            onClick={(e) => {
              e.preventDefault()
              goToSection('contact')
            }}
          >
            Let's talk
          </a>
        </div>

        <div className="nav__tools">
          <button
            className="nav__search"
            onClick={onOpenPalette}
            aria-label="Open command palette"
          >
            <SearchIcon width="15" height="15" />
            <span className="label">Search</span>
            <span className="kbd">⌘K</span>
          </button>

          <ThemeToggle />

          <button
            className={`nav__toggle ${open ? 'open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  )
}
