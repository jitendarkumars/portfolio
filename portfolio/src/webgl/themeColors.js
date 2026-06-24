import * as THREE from 'three'

// Read the current theme's colors straight from the CSS variables so the
// WebGL layers always match the rest of the site (paper vs ink mode).
export function readThemeColors() {
  const fallback = {
    paper: new THREE.Color('#f3ece0'),
    ink: new THREE.Color('#14110d'),
    accent: new THREE.Color('#ff5a1f'),
  }
  if (typeof window === 'undefined') return fallback
  try {
    const cs = getComputedStyle(document.documentElement)
    const g = (name, fb) => new THREE.Color((cs.getPropertyValue(name).trim() || fb))
    return {
      paper: g('--paper', '#f3ece0'),
      ink: g('--ink', '#14110d'),
      accent: g('--accent', '#ff5a1f'),
    }
  } catch (e) {
    return fallback
  }
}

// True when we should skip heavy WebGL (accessibility / very small screens).
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
