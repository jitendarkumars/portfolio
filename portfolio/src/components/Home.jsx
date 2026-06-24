import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../theme'
import { profile } from '../data/profile'
import Seo, { SITE_URL } from './Seo'
import Hero from './Hero'
import About from './About'
import Experience from './Experience'
import Marquee from './Marquee'
import Now from './Now'
import Projects from './Projects'
import Blog from './Blog'
import Vlog from './Vlog'
import Testimonials from './Testimonials'
import Contact from './Contact'
import { testimonials } from '../data/testimonials'

// terminal-style ASCII section divider
function AsciiRule({ label }) {
  const fill = '/ '.repeat(140)
  return (
    <div className="ascii-rule" aria-hidden="true">
      <span className="seg">{fill}</span>
      {label && <span className="lbl">{label}</span>}
      <span className="seg">{fill}</span>
    </div>
  )
}

export default function Home() {
  const { theme } = useTheme()
  const location = useLocation()

  // Person + WebSite structured data for the home page (rich results for your name).
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: 'Jitendar Kumar',
          alternateName: 'Jeet',
          jobTitle: 'Senior Full-Stack & Mobile Engineer',
          url: SITE_URL,
          sameAs: [profile.socials.linkedin, profile.socials.github].filter(Boolean),
        },
        { '@type': 'WebSite', name: 'Jitendar Kumar', url: SITE_URL },
      ],
    }),
    []
  )

  // When arriving from another route with a section target, scroll to it.
  useEffect(() => {
    const id = location.state?.scrollTo
    if (!id) return
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.state])

  return (
    <>
      <Seo
        title="Jitendar Kumar (Jeet) — Senior Full-Stack & Mobile Engineer"
        description="Senior full-stack & mobile engineer with 8 years building web and mobile products end to end — Angular, React, Node/NestJS, and Flutter. Projects, blog, and a daily build log."
        path="/"
        jsonLd={jsonLd}
      />
      <Hero theme={theme} />
      <AsciiRule label="~/about" />
      <About theme={theme} />
      <AsciiRule label="~/experience" />
      <Experience />
      <Marquee />
      <AsciiRule label="~/now" />
      <Now />
      <AsciiRule label="~/projects" />
      <Projects />
      <AsciiRule label="~/blog" />
      <Blog />
      <AsciiRule label="~/daily-log" />
      <Vlog />
      {testimonials.length > 0 && (
        <>
          <AsciiRule label="~/testimonials" />
          <Testimonials />
        </>
      )}
      <AsciiRule label="~/contact" />
      <Contact theme={theme} />
    </>
  )
}
