import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeValueNoise } from './noise'
import { readThemeColors } from './themeColors'

// A faceted "ink" blob that breathes/wobbles (CPU vertex displacement) and
// tilts toward the pointer. No custom shaders => renders everywhere.
export default function HeroBlob({ pointer, theme }) {
  const mesh = useRef()
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.7, 6), [])
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo])
  const noise = useMemo(() => makeValueNoise(), [])
  const colors = useMemo(() => readThemeColors(), [theme])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pos = geo.attributes.position.array
    for (let i = 0; i < pos.length; i += 3) {
      const bx = base[i], by = base[i + 1], bz = base[i + 2]
      const n = noise(bx * 0.9 + t * 0.3, by * 0.9, bz * 0.9 - t * 0.2)
      const n2 = noise(bx * 2.0 - t * 0.2, by * 2.0 + t * 0.15, bz * 2.0) * 0.5
      const d = 1 + (n + n2) * 0.16
      pos[i] = bx * d
      pos[i + 1] = by * d
      pos[i + 2] = bz * d
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
    if (mesh.current) {
      const px = pointer && pointer.current ? pointer.current.x : 0.5
      const py = pointer && pointer.current ? pointer.current.y : 0.5
      mesh.current.rotation.y += 0.003 + (px - 0.5) * 0.02
      mesh.current.rotation.x += ((py - 0.5) * 0.6 - mesh.current.rotation.x) * 0.05
    }
  })

  return (
    <mesh ref={mesh} geometry={geo}>
      <meshStandardMaterial color={colors.ink} roughness={0.35} metalness={0.18} flatShading />
    </mesh>
  )
}
