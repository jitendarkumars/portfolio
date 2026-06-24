import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import InkQuad from './InkQuad'
import { prefersReducedMotion } from './themeColors'

// Reusable marble canvas. `fixed` => full-page background layer.
export default function InkBackdrop({ fixed = false, inkAmt = 0.4, className = '', theme }) {
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const ripple = useRef({ x: 0.5, y: 0.5, age: 99 })

  useEffect(() => {
    const move = (e) => {
      pointer.current.x = e.clientX / window.innerWidth
      pointer.current.y = 1 - e.clientY / window.innerHeight
    }
    const down = (e) => {
      ripple.current.x = e.clientX / window.innerWidth
      ripple.current.y = 1 - e.clientY / window.innerHeight
      ripple.current.age = 0
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
    }
  }, [])

  if (prefersReducedMotion()) return null

  return (
    <div className={(fixed ? 'scene-fixed ' : '') + className} aria-hidden="true">
      <Canvas flat linear dpr={[1, 1.8]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <InkQuad inkAmt={inkAmt} pointer={pointer} ripple={ripple} theme={theme} />
      </Canvas>
    </div>
  )
}
