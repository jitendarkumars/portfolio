import { now } from '../data/now'
import Reveal from './Reveal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Now() {
  return (
    <section className="section" id="now">
      <Reveal>
        <span className="eyebrow">Right now</span>
        <h2 className="section__title">
          What I'm <span className="gradient-text">focused on</span>
        </h2>
        <p className="section__lead">
          A living snapshot of what's on my plate. Inspired by the{' '}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--cyan)' }}
          >
            /now page
          </a>{' '}
          movement.
        </p>
      </Reveal>

      <div className="now__grid">
        {now.columns.map((col, i) => (
          <Reveal key={col.label} delay={i * 90} className="card now-card">
            <div className="now-card__label">{col.label}</div>
            <ul>
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="now__updated">Last updated: {formatDate(now.updated)}</Reveal>
    </section>
  )
}
