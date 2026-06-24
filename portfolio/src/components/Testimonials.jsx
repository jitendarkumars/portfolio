import { testimonials } from '../data/testimonials'
import Reveal from './Reveal'

export default function Testimonials() {
  if (!testimonials.length) return null
  return (
    <section className="section" id="testimonials">
      <Reveal>
        <span className="eyebrow">— Kind words</span>
        <h2 className="section__title">
          What people <span className="gradient-text">say</span>
        </h2>
      </Reveal>
      <div className="tm-grid">
        {testimonials.map((t, i) => (
          <Reveal key={i} delay={(i % 3) * 80} className="tm-card">
            <p className="tm-card__quote">{t.quote}</p>
            <div className="tm-card__who">
              <div className="tm-card__av">{t.initial}</div>
              <div>
                <div className="tm-card__name">{t.name}</div>
                <div className="tm-card__role">{t.role}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
