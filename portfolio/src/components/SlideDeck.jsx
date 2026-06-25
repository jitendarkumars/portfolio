import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { decks } from '../data/slides'
import SlideView from './SlideView'
import Seo, { SITE_URL } from './Seo'

export default function SlideDeck() {
  const { id } = useParams()
  const deck = decks.find((d) => d.id === id)
  const [i, setI] = useState(0)
  const startX = useRef(0)

  const jsonLd = useMemo(
    () =>
      deck
        ? {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: deck.title,
            description: deck.excerpt,
            datePublished: deck.date,
            keywords: (deck.tags || []).join(', '),
            author: { '@type': 'Person', name: 'Jitendar Kumar', url: SITE_URL },
            url: `${SITE_URL}/slides/${deck.id}`,
          }
        : null,
    [deck]
  )

  const total = deck ? deck.slides.length : 0
  const go = (n) => setI((v) => Math.max(0, Math.min(total - 1, v + n)))

  useEffect(() => {
    if (!deck) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deck, total])

  // Reset scroll-to-top of the card when the slide changes.
  const stageRef = useRef(null)
  useEffect(() => {
    if (stageRef.current) stageRef.current.scrollTop = 0
  }, [i])

  if (!deck) {
    return (
      <section className="section">
        <Seo title="Deck not found — Jitendar Kumar" description="That slide deck could not be found." path={`/slides/${id}`} />
        <div className="post-page">
          <span className="eyebrow">404</span>
          <h1 className="post-page__title">Deck not found</h1>
          <Link className="btn btn--ghost" to="/slides">← All slides</Link>
        </div>
      </section>
    )
  }

  const s = deck.slides[i]
  const onTouchStart = (e) => (startX.current = e.touches[0].clientX)
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx < -45) go(1)
    else if (dx > 45) go(-1)
  }

  return (
    <section className="section">
      <Seo
        title={`${deck.title} — Jitendar Kumar`}
        description={deck.excerpt}
        path={`/slides/${deck.id}`}
        type="article"
        jsonLd={jsonLd}
      />
      <div className="deck">
        <Link className="post-page__back" to="/slides">← All slides</Link>
        <div className="deck__metaline">{deck.tags.join(' · ')}</div>
        <h1 className="deck__title">{deck.title}</h1>

        <div className="deck__frame">
          <button className="deck__edge deck__edge--l" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide">‹</button>
          <div className="deck__stage" ref={stageRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <SlideView slide={s} />
          </div>
          <button className="deck__edge deck__edge--r" onClick={() => go(1)} disabled={i === total - 1} aria-label="Next slide">›</button>
        </div>

        <div className="deck__controls">
          {total <= 12 ? (
            <div className="deck__dots">
              {deck.slides.map((_, j) => (
                <button
                  key={j}
                  className={`deck__dot ${j === i ? 'active' : ''}`}
                  onClick={() => setI(j)}
                  aria-label={`Go to slide ${j + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="deck__progress" aria-hidden="true">
              <span style={{ width: ((i + 1) / total) * 100 + '%' }} />
            </div>
          )}
          <div className="deck__counter">{i + 1} / {total}</div>
        </div>

        <div className="deck__hint">Use ← → keys, swipe, or the arrows</div>
      </div>
    </section>
  )
}
