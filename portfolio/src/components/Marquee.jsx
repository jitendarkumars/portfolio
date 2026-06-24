import { profile } from '../data/profile'

// Infinite, seamless scrolling tech-stack strip.
export default function Marquee() {
  // profile.skills is an array of { group, items } — flatten to a flat list of
  // strings (also tolerate a plain { group: [...] } object just in case).
  const groups = profile.skills
  const items = Array.isArray(groups)
    ? groups.flatMap((g) => g.items || [])
    : Object.values(groups).flat()
  const row = [...items, ...items] // duplicate so the loop is seamless
  return (
    <section className="marquee" aria-label="Tech stack">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span className="marquee__item" key={i}>
            {t}
            <span className="marquee__sep">✦</span>
          </span>
        ))}
      </div>
    </section>
  )
}
