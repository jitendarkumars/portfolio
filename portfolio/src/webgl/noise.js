// Tiny 3D value noise (no deps) used to wobble the hero blob on the CPU —
// reliable across GPUs (no custom vertex shaders to compile).
export function makeValueNoise() {
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (a, b, t) => a + (b - a) * t
  const ih = (i, j, k) => {
    let n = (i * 374761393 + j * 668265263 + k * 1274126177) | 0
    n = n ^ (n >> 13)
    n = (n * 1274126177) | 0
    n = n ^ (n >> 16)
    return (n & 0x7fffffff) / 1073741824 - 1
  }
  return function (x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
    const xf = x - xi, yf = y - yi, zf = z - zi
    const u = fade(xf), v = fade(yf), w = fade(zf)
    const x00 = lerp(ih(xi, yi, zi), ih(xi + 1, yi, zi), u)
    const x10 = lerp(ih(xi, yi + 1, zi), ih(xi + 1, yi + 1, zi), u)
    const x01 = lerp(ih(xi, yi, zi + 1), ih(xi + 1, yi, zi + 1), u)
    const x11 = lerp(ih(xi, yi + 1, zi + 1), ih(xi + 1, yi + 1, zi + 1), u)
    return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w)
  }
}
