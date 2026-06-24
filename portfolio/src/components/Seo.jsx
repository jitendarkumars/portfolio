import { useEffect } from 'react'

// Single source of truth for the production domain (used in canonical + OG URLs).
export const SITE_URL = 'https://jitendarkumar404.com'
const DEFAULT_IMAGE = SITE_URL + '/og.png'

function setMeta(attr, key, content) {
  if (content == null) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Updates <title>, description, canonical, Open Graph / Twitter tags, and an
// optional JSON-LD block per route. Googlebot renders JS, so these are picked
// up for search; the static tags in index.html remain the no-JS fallback.
export default function Seo({ title, description, path = '/', type = 'website', image, jsonLd }) {
  useEffect(() => {
    const url = SITE_URL + path
    const img = image || DEFAULT_IMAGE
    if (title) document.title = title
    setMeta('name', 'description', description)
    setLink('canonical', url)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', img)

    const id = 'seo-jsonld'
    let script = document.getElementById(id)
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = id
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, path, type, image, jsonLd])

  return null
}
