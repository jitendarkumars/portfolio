// Renders ONE structured slide into a styled, carousel-style card.
// Layout kinds: cover, bullets, numbered, steps, decision, table, code,
// metrics, compare, callout. Legacy { svg } / { image } slides still render.

function num(s) {
  const n = parseFloat(String(s).replace(/[, ]/g, ''))
  return isFinite(n) ? n : null
}

function Lead({ h, t }) {
  return (
    <span>
      {h && <b>{h}</b>}
      {h && t ? ' — ' : ''}
      {t}
    </span>
  )
}

function Body({ body }) {
  const k = body.kind

  if (k === 'bullets')
    return (
      <ul className="sv-list">
        {body.items.map((it, i) => (
          <li key={i}>
            <span className="sv-mark" aria-hidden="true" />
            {typeof it === 'string' ? <span>{it}</span> : <Lead h={it.h} t={it.t} />}
          </li>
        ))}
      </ul>
    )

  if (k === 'numbered')
    return (
      <ol className="sv-num">
        {body.items.map((it, i) => (
          <li key={i}>
            <span className="sv-num__n">{i + 1}</span>
            <span className="sv-num__tx">
              {typeof it === 'string' ? it : <Lead h={it.h} t={it.t} />}
            </span>
          </li>
        ))}
      </ol>
    )

  if (k === 'steps')
    return (
      <div className="sv-steps">
        {body.steps.map((it, i) => (
          <div className="sv-step" key={i}>
            <span className="sv-step__dot">{i + 1}</span>
            <div className="sv-step__tx">
              {it.h && <b>{it.h}</b>}
              {it.t && <span>{it.t}</span>}
            </div>
          </div>
        ))}
      </div>
    )

  if (k === 'decision')
    return (
      <div className="sv-dec">
        {body.rows.map((r, i) => (
          <div className="sv-dec__row" key={i}>
            <div className="sv-dec__q">{r.q}</div>
            <div className="sv-dec__br">
              {r.yes && <span className="sv-pill sv-pill--yes">YES → {r.yes}</span>}
              {r.no && <span className="sv-pill sv-pill--no">NO → {r.no}</span>}
            </div>
          </div>
        ))}
      </div>
    )

  if (k === 'table')
    return (
      <div className="sv-table-wrap">
        <table className="sv-table">
          <thead>
            <tr>{body.cols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {body.rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    )

  if (k === 'code')
    return (
      <div className="sv-code">
        {body.lang && <span className="sv-code__lang">{body.lang}</span>}
        <pre><code>{body.code}</code></pre>
      </div>
    )

  if (k === 'metrics')
    return (
      <div className="sv-metrics">
        {body.items.map((m, i) => {
          const f = num(m.from)
          const t = num(m.to)
          const mx = Math.max(f || 0, t || 0) || 1
          const fw = f != null ? Math.max(5, (f / mx) * 100) : 0
          const tw = t != null ? Math.max(5, (t / mx) * 100) : 0
          const u = m.unit ? ' ' + m.unit : ''
          return (
            <div className="sv-metric" key={i}>
              <div className="sv-metric__top">
                <span>{m.label}</span>
                <span className="sv-metric__val">
                  {m.from}{u} <span className="sv-arrow">→</span> <b>{m.to}{u}</b>
                </span>
              </div>
              <div className="sv-metric__bars">
                <span className="sv-bar sv-bar--from" style={{ width: fw + '%' }} />
                <span className="sv-bar sv-bar--to" style={{ width: tw + '%' }} />
              </div>
            </div>
          )
        })}
      </div>
    )

  if (k === 'compare')
    return (
      <div className="sv-compare" data-cols={body.cols.length}>
        {body.cols.map((c, i) => (
          <div className={`sv-col ${c.accent ? 'is-accent' : ''}`} key={i}>
            <div className="sv-col__title">{c.title}</div>
            <ul>{c.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
          </div>
        ))}
      </div>
    )

  if (k === 'callout')
    return (
      <div className="sv-callout">
        {body.label && <span className="sv-callout__label">{body.label}</span>}
        <p>{body.text}</p>
      </div>
    )

  return null
}

export default function SlideView({ slide }) {
  if (slide.svg)
    return <div className="sv-legacy" dangerouslySetInnerHTML={{ __html: slide.svg }} />
  if (slide.image)
    return <img className="sv-legacy" src={slide.image} alt={slide.title || ''} />

  const b = slide.body || { kind: 'bullets', items: [] }

  if (b.kind === 'cover')
    return (
      <div className="sv sv--cover">
        {slide.tag && <span className="sv__tag">{slide.tag}</span>}
        <div className="sv-cover__main">
          <h2 className="sv-cover__title">{slide.title}</h2>
          {b.subtitle && <p className="sv-cover__sub">{b.subtitle}</p>}
          {b.chips && (
            <div className="sv-cover__chips">
              {b.chips.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        <span className="sv-cover__foot">jitendarkumar404.com</span>
      </div>
    )

  return (
    <div className={`sv sv--${b.kind}`}>
      <div className="sv__head">{slide.tag && <span className="sv__tag">{slide.tag}</span>}</div>
      {slide.title && <h2 className="sv__title">{slide.title}</h2>}
      {slide.intro && <p className="sv__intro">{slide.intro}</p>}
      <div className="sv__body">
        <Body body={b} />
      </div>
    </div>
  )
}
