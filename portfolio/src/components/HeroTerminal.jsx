import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import { now } from '../data/now'
import { posts } from '../data/blog'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// hand-aligned ASCII "JEET" (each glyph 6 cols, 2-col gaps)
const BANNER = [
  '    ██  ██████  ██████  ██████',
  '    ██  ██      ██        ██  ',
  '    ██  █████   █████     ██  ',
  '█   ██  ██      ██        ██  ',
  ' ████   ██████  ██████    ██  ',
].join('\n')

function buildScenes() {
  const building =
    (now.columns.find((c) => /build/i.test(c.label)) || now.columns[0] || { items: [] }).items || []
  const latest = posts[0]

  const scenes = [
    {
      cmd: 'whoami',
      caption: 'whoami — who is this',
      body: BANNER + '\n\n' + 'Jeet — I design and ship products end to end.',
    },
    {
      cmd: 'cat about.txt',
      caption: 'about — the short version',
      body:
        'Jitendar Kumar  (aka Jeet)\n' +
        'Senior Full-Stack & Mobile Engineer\n' +
        '8 years · web + mobile · fintech\n\n' +
        'stack: Angular · React · Next · Node · NestJS · Flutter',
    },
    {
      cmd: 'ls ~/projects',
      caption: 'projects — recent work',
      body: 'recent work —\n' + projects.slice(0, 5).map((p) => '  › ' + p.title).join('\n'),
    },
  ]

  if (building.length) {
    scenes.push({
      cmd: 'tail -f ~/now.log',
      caption: "now — what I'm building",
      body: 'currently building —\n' + building.slice(0, 4).map((i) => '  • ' + i).join('\n'),
    })
  }

  if (latest) {
    scenes.push({
      cmd: 'cat blog/latest.md',
      caption: 'blog — latest post',
      body:
        '# ' + latest.title + '\n' +
        latest.date + '  ·  ' + (latest.tags || []).join(', ') + '\n\n' +
        (latest.excerpt || ''),
    })
  }

  return scenes
}

export default function HeroTerminal() {
  const SCENES = useMemo(buildScenes, [])
  const reduced = useMemo(reducedMotion, [])

  const [sceneIdx, setSceneIdx] = useState(0)
  const [display, setDisplay] = useState('')
  const [closed, setClosed] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [full, setFull] = useState(false)
  const pausedRef = useRef(false)

  const scene = SCENES[sceneIdx] || SCENES[0]
  const nextScene = () => setSceneIdx((i) => (i + 1) % SCENES.length)

  // typing engine — types the current scene, holds, then advances
  useEffect(() => {
    if (closed || minimized) return
    const text = scene.body
    let cancelled = false
    let timer

    if (reduced) {
      setDisplay(text)
      timer = setTimeout(nextScene, 3200)
      return () => clearTimeout(timer)
    }

    let pos = 0
    setDisplay('')
    const tick = () => {
      if (cancelled) return
      if (pausedRef.current) {
        timer = setTimeout(tick, 140)
        return
      }
      pos++
      setDisplay(text.slice(0, pos))
      if (pos < text.length) {
        const ch = text[pos - 1]
        timer = setTimeout(tick, ch === '\n' ? 90 : 16 + Math.random() * 22)
      } else {
        timer = setTimeout(nextScene, 2400)
      }
    }
    timer = setTimeout(tick, 320)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [sceneIdx, closed, minimized, reduced])

  // Esc exits fullscreen
  useEffect(() => {
    if (!full) return
    const onKey = (e) => e.key === 'Escape' && setFull(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])

  if (closed) {
    return (
      <div className="terminal-closed">
        <button
          className="terminal-reopen"
          onClick={() => {
            setClosed(false)
            setSceneIdx(0)
          }}
        >
          ▸ open terminal
        </button>
      </div>
    )
  }

  const term = (
    <div className={`terminal ${minimized ? 'terminal--min' : ''} ${full ? 'terminal--full' : ''}`}>
        <div className="terminal__bar">
          <span className="terminal__dots">
            <i title="Close" role="button" aria-label="Close terminal" onClick={() => setClosed(true)} />
            <i title="Minimize" role="button" aria-label="Minimize terminal" onClick={() => setMinimized((m) => !m)} />
            <i title="Fullscreen" role="button" aria-label="Toggle fullscreen" onClick={() => setFull((f) => !f)} />
          </span>
          <span className="terminal__title">jeet@portfolio: ~</span>
          <span className="terminal__cmd">{full ? 'esc to exit' : 'live'}</span>
        </div>

        <div
          className="terminal__screen"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onClick={nextScene}
          title="hover to pause · click for next"
        >
          <pre className="tmovie">
            <span className="accent">{'jeet@portfolio:~$ ' + scene.cmd}</span>{'\n'}
            {display}
            <span className="tmovie__caret">█</span>
          </pre>
        </div>

        <div className="terminal__status">
          <span className="blink">▸</span> {scene.caption}
          <span className="hint">hover: pause · click: next</span>
        </div>
      </div>
  )

  // Fullscreen escapes main's stacking context (so it covers the fixed nav).
  if (full) {
    return createPortal(
      <>
        <div className="terminal-backdrop" onClick={() => setFull(false)} />
        {term}
      </>,
      document.body
    )
  }
  return term
}
