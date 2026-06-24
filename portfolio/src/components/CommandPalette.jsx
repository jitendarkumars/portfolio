import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import { useTheme } from '../theme'
import {
  SearchIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  MailIcon,
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
} from './Icons'

const navItems = [
  { id: 'top', label: 'Home', to: '/' },
  { id: 'about', label: 'About' },
  { id: 'now', label: 'Now' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog', to: '/blog' },
  { id: 'vlog', label: 'Daily Log' },
  { id: 'contact', label: 'Contact' },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function CommandPalette({ open, setOpen }) {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  // Build the full command list (depends on theme + profile).
  const commands = useMemo(() => {
    const list = navItems.map((n) => ({
      id: `nav-${n.id}`,
      group: 'Navigate',
      label: `Go to ${n.label}`,
      keywords: n.label.toLowerCase(),
      Icon: ArrowRightIcon,
      perform: () => {
        if (n.to === '/blog') {
          navigate('/blog')
        } else if (n.id === 'top') {
          if (location.pathname !== '/') navigate('/')
          else window.scrollTo({ top: 0, behavior: 'smooth' })
        } else if (location.pathname !== '/') {
          navigate('/', { state: { scrollTo: n.id } })
        } else {
          scrollToId(n.id)
        }
      },
    }))

    list.push({
      id: 'toggle-theme',
      group: 'Actions',
      label: theme === 'ink' ? 'Switch to paper (light)' : 'Switch to ink (dark)',
      keywords: 'theme dark light ink paper mode toggle',
      Icon: theme === 'ink' ? SunIcon : MoonIcon,
      perform: toggle,
      keepOpen: true,
    })

    if (profile.email) {
      list.push({
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        keywords: 'email copy contact mail',
        Icon: MailIcon,
        perform: async () => {
          try {
            await navigator.clipboard.writeText(profile.email)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch (e) {
            window.location.href = `mailto:${profile.email}`
          }
        },
        keepOpen: true,
      })
    }

    const socialDefs = [
      { key: 'github', label: 'Open GitHub', Icon: GitHubIcon },
      { key: 'linkedin', label: 'Open LinkedIn', Icon: LinkedInIcon },
      { key: 'twitter', label: 'Open Twitter / X', Icon: TwitterIcon },
    ]
    socialDefs.forEach((s) => {
      const url = profile.socials[s.key]
      if (url) {
        list.push({
          id: `social-${s.key}`,
          group: 'Links',
          label: s.label,
          keywords: s.key,
          Icon: s.Icon,
          perform: () => window.open(url, '_blank', 'noopener'),
        })
      }
    })

    return list
  }, [theme, toggle, navigate, location.pathname])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)
    )
  }, [query, commands])

  // Group the filtered results, preserving group order.
  const groups = useMemo(() => {
    const order = ['Navigate', 'Actions', 'Links']
    const map = {}
    filtered.forEach((c) => {
      ;(map[c.group] = map[c.group] || []).push(c)
    })
    return order.filter((g) => map[g]).map((g) => ({ name: g, items: map[g] }))
  }, [filtered])

  // Global shortcut: ⌘K / Ctrl+K toggles the palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  // Reset + focus when opened.
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
    document.body.style.overflow = ''
  }, [open])

  useEffect(() => setSelected(0), [query])

  if (!open) return null

  const run = (cmd) => {
    if (!cmd) return
    cmd.perform()
    if (!cmd.keepOpen) setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(filtered[selected])
    }
  }

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div
        className="cmdk"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="cmdk__input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            className="cmdk__input"
            placeholder={copied ? 'Copied to clipboard ✓' : 'Type a command or search…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="kbd">esc</span>
        </div>

        <div className="cmdk__list">
          {filtered.length === 0 && <div className="cmdk__empty">No results found</div>}
          {groups.map((g) => (
            <div key={g.name}>
              <div className="cmdk__group-label">{g.name}</div>
              {g.items.map((cmd) => {
                const index = filtered.indexOf(cmd)
                const Icon = cmd.Icon
                return (
                  <button
                    key={cmd.id}
                    className={`cmdk__item ${index === selected ? 'selected' : ''}`}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => run(cmd)}
                  >
                    <span className="ic">
                      <Icon width="15" height="15" />
                    </span>
                    {cmd.label}
                    {index === selected && <span className="hint">↵</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="cmdk__footer">
          <span className="row">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> navigate
          </span>
          <span className="row">
            <span className="kbd">↵</span> select
          </span>
          <span className="row">
            <span className="kbd">esc</span> close
          </span>
        </div>
      </div>
    </div>
  )
}
