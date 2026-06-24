import { useEffect, useRef, useState } from 'react'

// A soft ring that trails the pointer and grows over interactive elements.
// Desktop (fine pointer) only; respects reduced-motion. Native cursor stays.
export default function CursorRing() {
  const ref = useRef(null)
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    let raf = null
    const move = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        el.style.left = e.clientX + 'px'
        el.style.top = e.clientY + 'px'
        raf = null
      })
    }
    const over = (e) => {
      const hit = e.target.closest && e.target.closest('a, button, input, textarea, .card, [data-cursor]')
      el.classList.toggle('big', !!hit)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return <div className="cursor-ring" ref={ref} aria-hidden="true" />
}
