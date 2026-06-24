import { useEffect, useRef } from 'react'
import { profile } from '../data/profile'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// brightness ramp, dim -> bright (classic 3D-ASCII shading)
const RAMP = '.,-~:;=!*x#$@'
const N = 1800

function hexToRgb(hex) {
  const h = (hex || '').trim().replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(f || '101010', 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function colors() {
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

// shape point clouds (unit radius), all length N
function sphere() {
  const a = new Float32Array(N * 3), g = Math.PI * (1 + Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const k = i + 0.5, phi = Math.acos(1 - (2 * k) / N), th = g * k
    a[i * 3] = Math.cos(th) * Math.sin(phi); a[i * 3 + 1] = Math.sin(th) * Math.sin(phi); a[i * 3 + 2] = Math.cos(phi)
  }
  return a
}
function knot() {
  const a = new Float32Array(N * 3), p = 2, q = 3
  for (let i = 0; i < N; i++) {
    const u = (i / N) * Math.PI * 2 * 2, r = Math.cos(q * u) + 2
    a[i * 3] = (r * Math.cos(p * u)) / 3; a[i * 3 + 1] = (r * Math.sin(p * u)) / 3; a[i * 3 + 2] = (Math.sin(q * u) * 1.4) / 3
  }
  return a
}
function textCloud(str) {
  const a = new Float32Array(N * 3)
  const cv = document.createElement('canvas'); cv.width = 560; cv.height = 200
  const x = cv.getContext('2d')
  x.fillStyle = '#fff'; x.font = '900 150px "Space Grotesk", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText(str, 280, 104)
  const d = x.getImageData(0, 0, 560, 200).data, pts = []
  for (let y = 0; y < 200; y += 2) for (let px = 0; px < 560; px += 2) if (d[(y * 560 + px) * 4 + 3] > 128) pts.push([px, y])
  for (let i = 0; i < N; i++) {
    const p = pts[Math.floor((i / N) * pts.length)] || [280, 100]
    a[i * 3] = (p[0] - 280) / 105; a[i * 3 + 1] = -(p[1] - 100) / 105; a[i * 3 + 2] = (Math.random() - 0.5) * 0.18
  }
  return a
}

export default function AsciiScreen({ theme }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    let col = colors()
    const reduced = prefersReducedMotion()

    const shapes = [textCloud(profile.name.toUpperCase()), sphere(), knot()]
    const labels = [profile.name.toUpperCase(), 'GLOBE', 'KNOT']
    const cur = Float32Array.from(shapes[0])
    let shapeIdx = 0, morph = 1, lastSwap = performance.now()

    let W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, fontPx = 15, dpr = 1
    let grid = new Float32Array(0)
    const rot = { x: 0, y: 0 }
    const pointer = { x: -999, y: -999, on: false }
    const ripple = { x: 0, y: 0, age: 99 }

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = wrap.getBoundingClientRect()
      W = Math.max(120, r.width); H = Math.max(120, r.height)
      fontPx = W < 420 ? 12 : 15
      cw = fontPx * 0.6; ch = fontPx * 1.02
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch)
      grid = new Float32Array(cols * rows)
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr)
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = '700 ' + fontPx + 'px "JetBrains Mono", monospace'
      ctx.textBaseline = 'top'
    }
    measure()
    const ro = new ResizeObserver(measure); ro.observe(wrap)

    const onMove = (e) => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true }
    const onLeave = () => { pointer.on = false }
    const onDown = (e) => { const r = canvas.getBoundingClientRect(); ripple.x = e.clientX - r.left; ripple.y = e.clientY - r.top; ripple.age = 0 }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)

    let raf = 0, lastT = 0

    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (now - lastT < 1000 / 40) return
      lastT = now
      const t = now / 1000

      if (!reduced && now - lastSwap > 4200) { lastSwap = now; shapeIdx = (shapeIdx + 1) % shapes.length; morph = 0 }
      const target = shapes[shapeIdx]
      if (morph < 1) { morph = Math.min(1, morph + 0.018); for (let i = 0; i < cur.length; i++) cur[i] += (target[i] - cur[i]) * 0.08 }

      if (!reduced) { rot.y = t * 0.55; rot.x = Math.sin(t * 0.32) * 0.32 }
      const cy = Math.cos(rot.x), sy = Math.sin(rot.x), cyaw = Math.cos(rot.y), syaw = Math.sin(rot.y)

      grid.fill(0)
      const depthBuf = new Float32Array(cols * rows)
      const S = Math.min(W, H) * 0.36, ox = W / 2, oy = H / 2
      for (let i = 0; i < N; i++) {
        const px = cur[i * 3], py = cur[i * 3 + 1], pz = cur[i * 3 + 2]
        const x1 = px * cyaw + pz * syaw, z1 = -px * syaw + pz * cyaw
        const y1 = py * cy - z1 * sy, z2 = py * sy + z1 * cy
        const sx = ox + x1 * S, sYy = oy - y1 * S
        const cxi = Math.floor(sx / cw), cyi = Math.floor(sYy / ch)
        if (cxi >= 0 && cxi < cols && cyi >= 0 && cyi < rows) {
          const idx = cyi * cols + cxi
          const depth = (z2 + 1) * 0.5
          const b = 0.32 + depth * 0.68
          if (b > grid[idx]) { grid[idx] = b; depthBuf[idx] = depth }
        }
      }

      // cursor glow
      if (pointer.on) {
        const pcx = pointer.x / cw, pcy = pointer.y / ch, R = 7
        for (let yy = Math.max(0, (pcy - R) | 0); yy < Math.min(rows, pcy + R); yy++)
          for (let xx = Math.max(0, (pcx - R) | 0); xx < Math.min(cols, pcx + R); xx++) {
            const dx = xx - pcx, dy = yy - pcy, dd = Math.sqrt(dx * dx + dy * dy)
            if (dd < R) { const idx = yy * cols + xx; if (grid[idx] > 0.05) grid[idx] = Math.min(1, grid[idx] + (1 - dd / R) * 0.5) }
          }
      }
      // click ripple ring
      if (ripple.age < 1.4) {
        ripple.age += 0.05
        const rr = ripple.age * Math.max(W, H) * 0.5, band = ch * 2
        for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++) {
          const dx = xx * cw - ripple.x, dy = yy * ch - ripple.y, dd = Math.sqrt(dx * dx + dy * dy)
          if (Math.abs(dd - rr) < band) { const idx = yy * cols + xx; if (grid[idx] > 0.05) grid[idx] = Math.min(1, grid[idx] + (1 - ripple.age / 1.4) * 0.4) }
        }
      }

      // draw
      ctx.clearRect(0, 0, W, H)
      const ink = col.ink, acc = col.accent
      for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++) {
        const b = grid[yy * cols + xx]
        if (b < 0.06) continue
        const chr = RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length))]
        if (depthBuf[yy * cols + xx] > 0.72) ctx.fillStyle = 'rgba(' + acc[0] + ',' + acc[1] + ',' + acc[2] + ',' + (0.75 + b * 0.25).toFixed(2) + ')'
        else ctx.fillStyle = 'rgba(' + ink[0] + ',' + ink[1] + ',' + ink[2] + ',' + (b * 0.95).toFixed(2) + ')'
        ctx.fillText(chr, xx * cw, yy * ch)
      }
    }
    raf = requestAnimationFrame(frame)
    col = colors()

    return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('pointerdown', onDown) }
  }, [theme])

  return (
    <div className="ascii-screen" ref={wrapRef}>
      <canvas ref={canvasRef} />
    </div>
  )
}
