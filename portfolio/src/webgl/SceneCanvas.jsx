import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import InkQuad from './InkQuad'
import HeroBlob from './HeroBlob'
import { readThemeColors, prefersReducedMotion } from './themeColors'

// The 3D ink blob — lives in the hero, then scales away as you scroll down.
function ScrollBlob({ pointer, theme }) {
  const group = useRef()
  const scrollY = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY || 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useFrame(() => {
    if (!group.current) return
    const h = window.innerHeight || 800
    const fade = Math.max(0, 1 - scrollY.current / (h * 0.85))
    const s = fade * fade
    group.current.scale.setScalar(s + 0.0001)
    group.current.visible = s > 0.01
  })
  return (
    <group ref={group} position={[2.1, 0.3, 0]}>
      <HeroBlob pointer={pointer} theme={theme} />
    </group>
  )
}

// ONE WebGL context for the whole site: a full-page marble background (stronger
// in the hero, calmer once you scroll) plus the floating ink blob.
export default function SceneCanvas({ theme }) {
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

  const accent = readThemeColors().accent

  return (
    <div className="scene-fixed" aria-hidden="true">
      <Canvas flat linear dpr={[1, 1.8]} camera={{ position: [0, 0, 6], fov: 45 }}>
        <InkQuad inkAmt={0.82} pointer={pointer} ripple={ripple} theme={theme} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 6, 8]} intensity={1.3} />
        <pointLight position={[-6, -2, 4]} intensity={45} color={accent} />
        <ScrollBlob pointer={pointer} theme={theme} />
      </Canvas>
    </div>
  )
}
