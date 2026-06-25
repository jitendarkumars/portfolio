import { Link } from 'react-router-dom'
import { decks } from '../data/slides'
import Reveal from './Reveal'
import { DeckCard } from './SlidesIndex'

export default function SlidesSection() {
  const featured = decks.slice(0, 3)
  return (
    <section className="section" id="slides">
      <Reveal>
        <span className="eyebrow">— Visual</span>
        <h2 className="section__title">
          Concept <span className="gradient-text">slides</span>
        </h2>
        <p className="section__lead">
          Bite-size, swipeable explainers of engineering concepts — the kind I wish I'd had while learning.
        </p>
      </Reveal>

      <div className="decks__grid">
        {featured.map((d, i) => (
          <Reveal key={d.id} delay={(i % 3) * 80} className="card">
            <DeckCard deck={d} />
          </Reveal>
        ))}
      </div>

      {decks.length > 3 && (
        <div className="blog__all">
          <Link to="/slides" className="btn btn--ghost">All slide decks →</Link>
        </div>
      )}
    </section>
  )
}
