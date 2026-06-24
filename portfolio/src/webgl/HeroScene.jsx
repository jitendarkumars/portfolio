import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import InkQuad from './InkQuad'
import HeroBlob from './HeroBlob'
import { readThemeColors, prefersReducedMotion } from './themeColors'

// The hero: full marble background + a floating 3D ink blob, both reacting to
// the pointer; click anywhere drops a ripple into the marble.
export default function HeroScene({ theme }) {
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const ripple = useRef({ x: 0.5, y: 0.5, age: 99 })
  const accent = useMemo(() => readThemeColors().accent, [theme])

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
    <Canvas flat linear dpr={[1, 1.8]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true }}>
      <InkQuad inkAmt={0.95} pointer={pointer} ripple={ripple} theme={theme} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 8]} intensity={1.3} />
      <pointLight position={[-6, -2, 4]} intensity={45} color={accent} />
      <group position={[2.1, 0.2, 0]}>
        <HeroBlob pointer={pointer} theme={theme} />
      </group>
    </Canvas>
  )
}
