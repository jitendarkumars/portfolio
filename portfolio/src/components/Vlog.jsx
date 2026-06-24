import { vlogs } from '../data/vlog'
import Reveal from './Reveal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function Vlog() {
  return (
    <section className="section" id="vlog">
      <Reveal>
        <span className="eyebrow">04 — Daily Log</span>
        <h2 className="section__title">
          Building in <span className="gradient-text">public</span>
        </h2>
        <p className="section__lead">
          A running log of what I work on each day — wins, bugs, and the occasional video. This is
          the messy middle most portfolios hide.
        </p>
      </Reveal>

      <div className="timeline">
        {vlogs.map((v, i) => (
          <Reveal key={v.date + i} delay={(i % 2) * 70} className="tl-item">
            <span className="tl-item__dot" />
            <div className="card tl-card">
              <div className="tl-card__head">
                <span className="tl-card__date">{formatDate(v.date)}</span>
                <span className="tl-card__mood" aria-hidden="true">
                  {v.mood}
                </span>
              </div>
              <h3 className="tl-card__title">{v.title}</h3>
              <p className="tl-card__notes">{v.notes}</p>

              {v.tasks && v.tasks.length > 0 && (
                <div className="tl-tasks">
                  {v.tasks.map((task) => (
                    <div className="tl-task" key={task}>
                      <span className="check">✓</span> {task}
                    </div>
                  ))}
                </div>
              )}

              {v.youtube && (
                <div className="tl-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.youtube}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
