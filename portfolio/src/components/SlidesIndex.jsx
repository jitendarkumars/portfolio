import { Link } from 'react-router-dom'
import { decks } from '../data/slides'
import Reveal from './Reveal'
import Seo from './Seo'

export function DeckCard({ deck }) {
  const cover = deck.slides[0] || {}
  const sub = (cover.body && cover.body.subtitle) || deck.excerpt
  const chips = (cover.body && cover.body.chips) || deck.tags
  return (
    <Link to={`/slides/${deck.id}`} className="deck-card">
      <div className="deck-card__cover">
        <span className="deck-card__tag">{deck.tags[0]}</span>
        <h3 className="deck-card__title">{deck.title}</h3>
        <p className="deck-card__sub">{sub}</p>
        <div className="deck-card__chips">
          {chips.slice(0, 4).map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <span className="deck-card__count">{deck.slides.length} slides <span className="arrow">→</span></span>
      </div>
    </Link>
  )
}

export default function SlidesIndex() {
  return (
    <section className="section" id="slides-index">
      <Seo
        title="Visual explainers — Jitendar Kumar (Jeet)"
        description="Swipeable, slide-style explainers of engineering concepts — pagination, auth, system design, AI, and more."
        path="/slides"
      />
      <Reveal>
        <span className="eyebrow">Visual</span>
        <h1 className="section__title">Slides</h1>
        <p className="section__lead">
          Swipeable explainers — one concept, a few slides. Click a deck to flip through it.
        </p>
      </Reveal>

      <div className="decks__grid">
        {decks.map((d, i) => (
          <Reveal key={d.id} delay={(i % 3) * 80} className="card">
            <DeckCard deck={d} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
