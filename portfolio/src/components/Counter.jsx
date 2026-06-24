import { useEffect, useState } from 'react'

// Counts a numeric stat up (e.g. "20+") once, on mount.
// Non-numeric values (like "∞") render as-is.
export default function Counter({ value }) {
  const m = String(value).match(/^(\d+)(.*)$/)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!m) return
    const target = +m[1]
    let start
    let raf
    const dur = 1100
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line

  if (!m) return <span>{value}</span>
  return <span>{n}{m[2]}</span>
}
