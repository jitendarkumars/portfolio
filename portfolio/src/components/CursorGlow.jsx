import { useEffect, useRef } from 'react'

/**
 * A soft light that follows the pointer. Disabled on touch devices
 * and when the user prefers reduced motion.
 */
export default function CursorGlow() {
  const ref = useRef(null)

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!hasFinePointer || reduced) return

    const el = ref.current
    let raf = null

    const move = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        if (el) {
          el.style.left = `${e.clientX}px`
          el.style.top = `${e.clientY}px`
        }
        raf = null
      })
    }

    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />
}
