import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

// Counts a numeric stat up (e.g. "20+") when it scrolls into view.
// Non-numeric values (like "∞") render as-is.
export default function Counter({ value }) {
  const m = String(value).match(/^(\d+)(.*)$/)
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!m) return
    if (!inView) { setN(0); return }
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
  }, [inView]) // eslint-disable-line

  if (!m) return <span ref={ref}>{value}</span>
  return <span ref={ref}>{n}{m[2]}</span>
}
