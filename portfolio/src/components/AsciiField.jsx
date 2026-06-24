import { useEffect, useRef } from 'react'
import { profile } from '../data/profile'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── helpers ────────────────────────────────────────────────
const RAMP = ' .,:;irsXA253hMHGS#9B&@' // dark → bright
const N = 1500 // number of "code-matter" points

function hexToRgb(hex) {
  const h = (hex || '').trim().replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(f || '000000', 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function readColors() {
  try {
    const cs = getComputedStyle(document.documentElement)
    return {
      paper: hexToRgb(cs.getPropertyValue('--paper')),
      ink: hexToRgb(cs.getPropertyValue('--ink')),
      accent: hexToRgb(cs.getPropertyValue('--accent')),
    }
  } catch (e) {
    return { paper: [243, 236, 224], ink: [20, 17, 13], accent: [255, 90, 31] }
  }
}

// shape generators → Float32Array(N*3), roughly unit radius
function sphere() {
  const a = new Float32Array(N * 3)
  const gold = Math.PI * (1 + Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const k = i + 0.5
    const phi = Math.acos(1 - (2 * k) / N)
    const th = gold * k
    a[i * 3] = Math.cos(th) * Math.sin(phi)
    a[i * 3 + 1] = Math.sin(th) * Math.sin(phi)
    a[i * 3 + 2] = Math.cos(phi)
  }
  return a
}
function knot() {
  const a = new Float32Array(N * 3)
  const p = 2, q = 3
  for (let i = 0; i < N; i++) {
    const u = (i / N) * Math.PI * 2 * 2
    const r = Math.cos(q * u) + 2
    a[i * 3] = (r * Math.cos(p * u)) / 3
    a[i * 3 + 1] = (r * Math.sin(p * u)) / 3
    a[i * 3 + 2] = (Math.sin(q * u) * 1.4) / 3
  }
  return a
}
function textPoints(str) {
  const a = new Float32Array(N * 3)
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 160
  const x = cv.getContext('2d')
  x.fillStyle = '#fff'
  x.font = '900 150px "Space Grotesk", Inter, Arial'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(str, 256, 84)
  const d = x.getImageData(0, 0, 512, 160).data
  const pts = []
  for (let y = 0; y < 160; y += 2)
    for (let px = 0; px < 512; px += 2)
      if (d[(y * 512 + px) * 4 + 3] > 128) pts.push([px, y])
  for (let i = 0; i < N; i++) {
    const p = pts[Math.floor((i / N) * pts.length)] || [256, 80]
    a[i * 3] = (p[0] - 256) / 95
    a[i * 3 + 1] = -(p[1] - 80) / 95
    a[i * 3 + 2] = (Math.random() - 0.5) * 0.12
  }
  return a
}

export default function AsciiField({ theme }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let colors = readColors()

    // shapes to morph through
    const shapes = [textPoints(profile.name.toUpperCase()), sphere(), knot()]
    const cur = Float32Array.from(shapes[0])
    let shapeIdx = 0
    let morph = 1 // 1 = settled on cur shape

    let W = 0, H = 0, cols = 0, rows = 0, cellW = 0, cellH = 0, fontPx = 14, dpr = 1
    let grid = new Float32Array(0)
    const rot = { x: 0, y: 0 }
    const pointer = { x: -999, y: -999 }
    const ripple = { x: 0, y: 0, age: 99 }
    const reduced = prefersReducedMotion()

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = window.innerWidth
      H = window.innerHeight
      fontPx = W < 640 ? 12 : 14
      cellW = fontPx * 0.6
      cellH = fontPx * 1.04
      cols = Math.ceil(W / cellW)
      rows = Math.ceil(H / cellH)
      grid = new Float32Array(cols * rows)
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${fontPx}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'
    }
    resize()
    window.addEventListener('resize', resize)

    // ambient "code rain" drops
    const drops = []
    for (let i = 0; i < Math.floor(cols / 4); i++)
      drops.push({ col: Math.floor(Math.random() * cols), y: Math.random() * rows, sp: 0.15 + Math.random() * 0.5 })

    const onMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY }
    const onDown = (e) => { ripple.x = e.clientX; ripple.y = e.clientY; ripple.age = 0 }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)

    let lastSwap = performance.now()
    let raf = 0
    let lastT = 0

    const work = new Float32Array(3)

    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (now - lastT < 1000 / 38) return // ~38fps cap
      lastT = now
      const t = now / 1000

      // morph cycle every 5s
      if (!reduced && now - lastSwap > 5000) {
        lastSwap = now
        shapeIdx = (shapeIdx + 1) % shapes.length
        morph = 0
      }
      const targetShape = shapes[shapeIdx]
      if (morph < 1) {
        morph = Math.min(1, morph + 0.02)
        for (let i = 0; i < cur.length; i++) cur[i] += (targetShape[i] - cur[i]) * 0.06
      }

      if (!reduced) {
        rot.y = t * 0.5
        rot.x = Math.sin(t * 0.3) * 0.35
      }
      const cy = Math.cos(rot.x), sy = Math.sin(rot.x)
      const cyaw = Math.cos(rot.y), syaw = Math.sin(rot.y)

      grid.fill(0)

      // ambient rain
      for (let di = 0; di < drops.length; di++) {
        const dr = drops[di]
        if (!reduced) dr.y += dr.sp
        if (dr.y > rows) { dr.y = -2; dr.col = Math.floor(Math.random() * cols) }
        const yi = Math.floor(dr.y)
        for (let t2 = 0; t2 < 6; t2++) {
          const yy = yi - t2
          if (yy >= 0 && yy < rows) {
            const idx = yy * cols + dr.col
            const b = (0.18 - t2 * 0.025)
            if (b > grid[idx]) grid[idx] = b
          }
        }
      }

      // project the morphing point cloud
      const S = Math.min(W, H) * 0.26
      const ox = W * 0.6, oy = H * 0.42
      for (let i = 0; i < N; i++) {
        let px = cur[i * 3], py = cur[i * 3 + 1], pz = cur[i * 3 + 2]
        // rotate Y (yaw)
        let x1 = px * cyaw + pz * syaw
        let z1 = -px * syaw + pz * cyaw
        // rotate X (pitch)
        let y1 = py * cy - z1 * sy
        let z2 = py * sy + z1 * cy
        const sx = ox + x1 * S
        const sYy = oy - y1 * S
        const cxi = Math.floor(sx / cellW)
        const cyi = Math.floor(sYy / cellH)
        if (cxi >= 0 && cxi < cols && cyi >= 0 && cyi < rows) {
          const depth = (z2 + 1) * 0.5 // 0..1
          const b = 0.4 + depth * 0.6
          const idx = cyi * cols + cxi
          if (b > grid[idx]) grid[idx] = b
        }
      }

      // cursor glow
      if (pointer.x > -900) {
        const pcx = pointer.x / cellW, pcy = pointer.y / cellH
        const R = 9
        for (let yy = Math.max(0, (pcy - R) | 0); yy < Math.min(rows, pcy + R); yy++)
          for (let xx = Math.max(0, (pcx - R) | 0); xx < Math.min(cols, pcx + R); xx++) {
            const dx = xx - pcx, dy = yy - pcy
            const dd = Math.sqrt(dx * dx + dy * dy)
            if (dd < R) {
              const idx = yy * cols + xx
              grid[idx] = Math.min(1, grid[idx] + (1 - dd / R) * 0.5)
            }
          }
      }

      // click ripple ring
      if (ripple.age < 1.4) {
        ripple.age += 0.05
        const rr = ripple.age * Math.max(W, H) * 0.5
        const rcx = ripple.x, rcy = ripple.y
        const band = cellH * 2.2
        for (let yy = 0; yy < rows; yy++) {
          for (let xx = 0; xx < cols; xx++) {
            const dx = xx * cellW - rcx, dy = yy * cellH - rcy
            const dd = Math.sqrt(dx * dx + dy * dy)
            if (Math.abs(dd - rr) < band) {
              const idx = yy * cols + xx
              grid[idx] = Math.min(1, grid[idx] + (1 - ripple.age / 1.4) * 0.5)
            }
          }
        }
      }

      // draw
      ctx.fillStyle = `rgb(${colors.paper[0]},${colors.paper[1]},${colors.paper[2]})`
      ctx.fillRect(0, 0, W, H)
      const ink = colors.ink, acc = colors.accent
      for (let yy = 0; yy < rows; yy++) {
        for (let xx = 0; xx < cols; xx++) {
          const b = grid[yy * cols + xx]
          if (b < 0.08) continue
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length))]
          if (b > 0.82) ctx.fillStyle = `rgba(${acc[0]},${acc[1]},${acc[2]},${(0.7 + b * 0.3).toFixed(2)})`
          else ctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${(b * 0.92).toFixed(2)})`
          ctx.fillText(ch, xx * cellW, yy * cellH)
        }
      }
    }
    raf = requestAnimationFrame(frame)

    // refresh colors on theme change
    colors = readColors()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="ascii-field" aria-hidden="true" />
}
