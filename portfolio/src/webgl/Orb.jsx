import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { readThemeColors, prefersReducedMotion } from './themeColors'

function Knot({ theme }) {
  const ref = useRef()
  const accentRef = useRef()
  const colors = useMemo(() => readThemeColors(), [theme])
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.rotation.x = t * 0.3
      ref.current.rotation.y = t * 0.22
    }
    if (accentRef.current) {
      accentRef.current.rotation.x = t * -0.18
      accentRef.current.rotation.z = t * 0.2
    }
  })
  return (
    <group>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.3, 150, 20]} />
        <meshBasicMaterial color={colors.ink} wireframe />
      </mesh>
      <mesh ref={accentRef} scale={1.45}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={colors.accent} wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// Small wireframe sculpture used inside the About panel.
export default function Orb({ theme }) {
  if (prefersReducedMotion()) return null
  return (
    <Canvas flat linear dpr={[1, 1.8]} camera={{ position: [0, 0, 3.6], fov: 45 }}>
      <Knot theme={theme} />
    </Canvas>
  )
}
