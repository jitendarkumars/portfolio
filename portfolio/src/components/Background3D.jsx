import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function themeColors() {
  try {
    const cs = getComputedStyle(document.documentElement)
    const g = (n, f) => new THREE.Color((cs.getPropertyValue(n).trim() || f))
    return { paper: g('--paper', '#f3ece0'), ink: g('--ink', '#14110d'), accent: g('--accent', '#ff5a1f') }
  } catch (e) {
    return { paper: new THREE.Color('#f3ece0'), ink: new THREE.Color('#14110d'), accent: new THREE.Color('#ff5a1f') }
  }
}

function discTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.78)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.beginPath(); x.arc(32, 32, 32, 0, Math.PI * 2); x.fill()
  return new THREE.CanvasTexture(c)
}

// Rotating network globe (light, thin lines) + a drifting field of small dots.
export default function Background3D({ theme }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let renderer
    try {
      const test = document.createElement('canvas')
      if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch (e) { return }

    const reduced = prefersReducedMotion()
    let W = window.innerWidth, H = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H)

    const C = themeColors()
    const sprite = discTexture()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 16)
    const globe = new THREE.Group()
    scene.add(globe)
    const disposables = []
    const paperC = C.paper, inkC = C.ink

    // ---- nodes on a sphere ----
    const K = 150, R = 9.5
    const pts = []
    const gold = Math.PI * (1 + Math.sqrt(5))
    for (let i = 0; i < K; i++) {
      const k = i + 0.5, phi = Math.acos(1 - (2 * k) / K), th = gold * k
      const rr = R * (0.94 + Math.random() * 0.12)
      pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(th) * rr, Math.cos(phi) * rr, Math.sin(phi) * Math.sin(th) * rr))
    }
    const accentSet = new Set()
    for (let i = 0; i < K; i++) if (Math.random() < 0.12) accentSet.add(i)

    const np = new Float32Array(K * 3), nc = new Float32Array(K * 3)
    for (let i = 0; i < K; i++) {
      np[i * 3] = pts[i].x; np[i * 3 + 1] = pts[i].y; np[i * 3 + 2] = pts[i].z
      const c = accentSet.has(i) ? C.accent : C.ink
      nc[i * 3] = c.r; nc[i * 3 + 1] = c.g; nc[i * 3 + 2] = c.b
    }
    const nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(np, 3))
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nc, 3))
    const nodeMat = new THREE.PointsMaterial({ map: sprite, size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false, vertexColors: true })
    globe.add(new THREE.Points(nodeGeo, nodeMat)); disposables.push(nodeGeo, nodeMat)

    // ---- nearest-neighbour links (light + thin) ----
    const NEIGHBORS = 3
    const seen = new Set(), seg = []
    for (let i = 0; i < K; i++) {
      const d = []
      for (let j = 0; j < K; j++) if (j !== i) d.push([j, pts[i].distanceToSquared(pts[j])])
      d.sort((a, b) => a[1] - b[1])
      for (let n = 0; n < NEIGHBORS; n++) {
        const j = d[n][0], key = i < j ? i + '_' + j : j + '_' + i
        if (seen.has(key)) continue
        seen.add(key); seg.push([i, j, Math.sqrt(d[n][1])])
      }
    }
    const maxLen = Math.max.apply(null, seg.map((s) => s[2]))
    const lpos = new Float32Array(seg.length * 6), lcol = new Float32Array(seg.length * 6)
    for (let s = 0; s < seg.length; s++) {
      const [i, j, len] = seg[s]
      // keep lines INK-hued (so they show in light & dark); faintness via opacity
      const fade = (len / maxLen) * 0.5 // near = full ink, far = halfway to paper
      const r = inkC.r + (paperC.r - inkC.r) * fade
      const g = inkC.g + (paperC.g - inkC.g) * fade
      const b = inkC.b + (paperC.b - inkC.b) * fade
      const o = s * 6
      lpos[o] = pts[i].x; lpos[o + 1] = pts[i].y; lpos[o + 2] = pts[i].z
      lpos[o + 3] = pts[j].x; lpos[o + 4] = pts[j].y; lpos[o + 5] = pts[j].z
      lcol[o] = r; lcol[o + 1] = g; lcol[o + 2] = b
      lcol[o + 3] = r; lcol[o + 4] = g; lcol[o + 5] = b
    }
    const lineGeo = new LineSegmentsGeometry()
    lineGeo.setPositions(lpos); lineGeo.setColors(lcol)
    const lineMat = new LineMaterial({ linewidth: 1.1, vertexColors: true, transparent: true, opacity: 0.16, worldUnits: false })
    lineMat.resolution.set(W, H)
    const lines = new LineSegments2(lineGeo, lineMat); lines.frustumCulled = false
    globe.add(lines); disposables.push(lineGeo, lineMat)

    // ---- drifting small dots (the floating field) ----
    const DN = 1300
    const dbaseY = new Float32Array(DN)
    const dp = new Float32Array(DN * 3), dc = new Float32Array(DN * 3)
    for (let i = 0; i < DN; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 52
      dp[i * 3 + 1] = (Math.random() - 0.5) * 32
      dp[i * 3 + 2] = (Math.random() - 0.5) * 22 - 2
      dbaseY[i] = dp[i * 3 + 1]
      const acc = Math.random() < 0.08
      const c = acc ? C.accent : C.ink
      dc[i * 3] = c.r; dc[i * 3 + 1] = c.g; dc[i * 3 + 2] = c.b
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3))
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dc, 3))
    const dustMat = new THREE.PointsMaterial({ map: sprite, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.45, depthWrite: false, vertexColors: true })
    scene.add(new THREE.Points(dustGeo, dustMat)); disposables.push(dustGeo, dustMat)

    // ---- interaction ----
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }
    const onMove = (e) => { target.x = e.clientX / window.innerWidth - 0.5; target.y = e.clientY / window.innerHeight - 0.5 }
    window.addEventListener('pointermove', onMove)
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); lineMat.resolution.set(W, H) }
    window.addEventListener('resize', onResize)
    let scrollY = 0
    const onScroll = () => { scrollY = window.scrollY || 0 }
    window.addEventListener('scroll', onScroll, { passive: true })

    const clock = new THREE.Clock()
    let raf = 0
    function frame() {
      raf = requestAnimationFrame(frame)
      const t = clock.getElapsedTime()
      globe.rotation.y = t * 0.1 + scrollY * 0.0009 // also spins as you scroll
      globe.rotation.x = Math.sin(t * 0.16) * 0.16
      // drifting dots wave
      const arr = dustGeo.attributes.position.array
      for (let i = 0; i < DN; i++) arr[i * 3 + 1] = dbaseY[i] + Math.sin(t * 0.3 + arr[i * 3] * 0.25 + arr[i * 3 + 2] * 0.2) * 0.6
      dustGeo.attributes.position.needsUpdate = true
      cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05
      camera.position.x = cur.x * 5; camera.position.y = -cur.y * 3.5
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      if (reduced) cancelAnimationFrame(raf)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      disposables.forEach((d) => d.dispose && d.dispose())
      sprite.dispose(); renderer.dispose()
    }
  }, [theme])

  return <canvas ref={canvasRef} className="bg3d" aria-hidden="true" />
}
