import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { inkVert, inkFrag } from './inkShader'
import { readThemeColors } from './themeColors'

export const BG_COUNT = 4

// Full-screen background. Crossfades through 4 modes as you scroll the page.
export default function InkQuad({ inkAmt = 0.8, pointer, ripple, theme }) {
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uRipple: { value: new THREE.Vector3(0.5, 0.5, 99) },
      uPaper: { value: new THREE.Color('#f3ece0') },
      uInk: { value: new THREE.Color('#14110d') },
      uAccent: { value: new THREE.Color('#ff5a1f') },
      uInkAmt: { value: inkAmt },
      uPrevMode: { value: 0 },
      uCurMode: { value: 0 },
      uMix: { value: 0 },
    }),
    []
  )

  useEffect(() => {
    const c = readThemeColors()
    uniforms.uPaper.value.copy(c.paper)
    uniforms.uInk.value.copy(c.ink)
    uniforms.uAccent.value.copy(c.accent)
  }, [theme, uniforms])

  useEffect(() => {
    uniforms.uInkAmt.value = inkAmt
  }, [inkAmt, uniforms])

  const target = useMemo(() => new THREE.Vector2(0.5, 0.5), [])
  const display = useRef(0) // smoothly tracks the active mode (0..3)

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uRes.value.set(size.width, size.height)

    if (pointer && pointer.current) {
      target.set(pointer.current.x, pointer.current.y)
      uniforms.uMouse.value.lerp(target, 0.06)
    }
    if (ripple && ripple.current) {
      ripple.current.age += 0.016
      uniforms.uRipple.value.set(ripple.current.x, ripple.current.y, ripple.current.age)
    }

    // scroll → which background mode
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const prog = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / max)) : 0
    const targetMode = Math.min(BG_COUNT - 1, Math.floor(prog * (BG_COUNT - 0.001)))
    display.current += (targetMode - display.current) * 0.08
    const prev = Math.floor(display.current)
    const cur = Math.min(BG_COUNT - 1, prev + 1)
    uniforms.uPrevMode.value = prev
    uniforms.uCurMode.value = cur
    uniforms.uMix.value = display.current - prev
  })

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={inkVert}
        fragmentShader={inkFrag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
