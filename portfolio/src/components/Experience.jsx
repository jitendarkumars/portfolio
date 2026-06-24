import { experience } from '../data/experience'
import Reveal from './Reveal'

export default function Experience() {
  return (
    <section className="section" id="experience">
      <Reveal>
        <span className="eyebrow">02 — Experience</span>
        <h2 className="section__title">
          Where I've <span className="gradient-text">worked</span>
        </h2>
      </Reveal>

      <div className="exp-list">
        {experience.map((e, i) => (
          <Reveal key={i} delay={i * 80} className="exp">
            <div className="exp__period">{e.period}</div>
            <div className="exp__body">
              <h3 className="exp__role">{e.role}</h3>
              <div className="exp__org">{e.org}</div>
              <p className="exp__sum">{e.summary}</p>
              {e.bullets?.length > 0 && (
                <ul className="exp__points">
                  {e.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              {e.award && <div className="exp__award">★ {e.award}</div>}
              <div className="tags exp__tags">
                {e.tags.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
