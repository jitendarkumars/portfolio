import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '../data/projects'
import Reveal from './Reveal'
import { ExternalIcon, CodeIcon } from './Icons'

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.article
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal__meta">Project · {project.tags.join(' · ')}</div>
        <h2 className="modal__title">{project.title}</h2>
        <div className="modal__body">
          <p>{project.detail || project.blurb}</p>
          {project.highlights?.length > 0 && (
            <ul className="modal__points">
              {project.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="tags modal__tags">
          {project.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
        <div className="project__links" style={{ marginTop: 22 }}>
          {project.live ? (
            <a className="project__link" href={project.live} target="_blank" rel="noopener noreferrer">
              <ExternalIcon /> Live demo
            </a>
          ) : (
            <span className="project__link muted"><ExternalIcon /> Demo soon</span>
          )}
          {project.code && (
            <a className="project__link" href={project.code} target="_blank" rel="noopener noreferrer">
              <CodeIcon /> Source
            </a>
          )}
        </div>
      </motion.article>
    </motion.div>
  )
}

export default function Projects() {
  const [open, setOpen] = useState(null)

  return (
    <section className="section" id="projects">
      <Reveal>
        <span className="eyebrow">04 — Projects</span>
        <h2 className="section__title">Things I've built</h2>
        <p className="section__lead">
          A few projects I'm proud of — click any one for the full case study.
        </p>
      </Reveal>

      <div className="projects__grid">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 90} className={`card ${p.featured ? 'project--featured' : ''}`}>
            <button className="project__open" onClick={() => setOpen(p)} aria-label={`Open ${p.title}`}>
              <div className="project__top">
                <span className="project__index">{String(i + 1).padStart(2, '0')}</span>
                {p.featured && <span className="project__badge">Featured</span>}
              </div>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__blurb">{p.blurb}</p>
              <div className="tags project__tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
              <span className="project__readmore">Case study <span className="arrow">→</span></span>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  )
}
