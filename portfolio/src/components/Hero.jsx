import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import Socials from './Socials'
import AsciiScreen from './AsciiScreen'
import Counter from './Counter'
import Magnetic from './Magnetic'

function useTypewriter(words, { typeSpeed = 70, deleteSpeed = 35, pause = 1600 } = {}) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex % words.length]
    let timeout
    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % words.length)
    } else {
      timeout = setTimeout(
        () => {
          setText((prev) =>
            deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1)
          )
        },
        deleting ? deleteSpeed : typeSpeed
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause])

  return text
}

export default function Hero({ theme }) {
  const typed = useTypewriter(profile.roles)
  const letters = profile.name.split('')

  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__main">
          <span className="hero__badge">
            <span className="dot" /> {profile.availability}
          </span>

          <h1 className="hero__title" aria-label={profile.name}>
            {letters.map((ch, i) => (
              <span className="ltr" key={i}>
                {ch}
              </span>
            ))}
            <span className="ltr o">.</span>
          </h1>

          <div className="hero__typed" aria-live="polite">
            {typed}
            <span className="caret">▍</span>
          </div>

          <p className="hero__lead">{profile.tagline}</p>

          <div className="hero__actions">
            <Magnetic><a href="#projects" className="btn btn--primary">View my work</a></Magnetic>
            <Magnetic><a href="#contact" className="btn btn--ghost">Get in touch</a></Magnetic>
          </div>

          <div style={{ marginTop: '30px' }}>
            <Socials />
          </div>

          <div className="hero__stats">
            {profile.stats.map((s) => (
              <div className="hero__stat" key={s.label}>
                <div className="num"><Counter value={s.value} /></div>
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* signature: a live ASCII render, framed like a terminal */}
        <aside className="hero__aside">
          <div className="terminal">
            <div className="terminal__bar">
              <span className="terminal__dots"><i /><i /><i /></span>
              <span className="terminal__title">jeet@portfolio: ~/render</span>
              <span className="terminal__cmd">./jeet --ascii</span>
            </div>
            <div className="terminal__screen">
              <AsciiScreen theme={theme} />
            </div>
            <div className="terminal__status">
              <span className="blink">▸</span> rendering {profile.name.toLowerCase()}.obj — hover to disturb · click to ripple
            </div>
          </div>
        </aside>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll down">
        <span className="hero__mouse" /> scroll
      </a>
    </section>
  )
}
