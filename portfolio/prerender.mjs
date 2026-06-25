// Post-build prerender: writes a static index.html per route with the correct
// <title>, description, canonical, Open Graph / Twitter tags, and JSON-LD baked
// in — so social scrapers and crawlers (which often do NOT run JS) get the right
// per-URL metadata. The body stays the SPA shell; React hydrates as usual.
//
// Runs after `vite build` (see package.json "build"). Vercel serves these static
// files for each path; the SPA rewrite in vercel.json remains the fallback.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const SITE = 'https://jitendarkumar404.com'
const OG_IMAGE = SITE + '/og.png'

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src', 'data', 'blog.json'), 'utf8')
)
let decks = []
try {
  decks = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'slides.json'), 'utf8'))
} catch {}

const escAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const escHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escHtml(title)}</title>`)
}
function setMeta(html, attr, key, content) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 'i')
  if (re.test(html)) return html.replace(re, (_m, a, b) => a + escAttr(content) + b)
  return html.replace('</head>', `    <meta ${attr}="${key}" content="${escAttr(content)}" />\n  </head>`)
}
function setCanonical(html, url) {
  const re = /(<link\s+rel="canonical"\s+href=")[^"]*(")/i
  if (re.test(html)) return html.replace(re, (_m, a, b) => a + url + b)
  return html.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`)
}
function injectJsonLd(html, obj) {
  if (!obj) return html
  const json = JSON.stringify(obj)
  return html.replace('</head>', `    <script type="application/ld+json">${json}</script>\n  </head>`)
}

function render({ pathName, title, description, type = 'website', jsonLd }) {
  const url = SITE + pathName
  let html = template
  html = setTitle(html, title)
  html = setMeta(html, 'name', 'description', description)
  html = setCanonical(html, url)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'property', 'og:type', type)
  html = setMeta(html, 'property', 'og:image', OG_IMAGE)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = setMeta(html, 'name', 'twitter:image', OG_IMAGE)
  html = injectJsonLd(html, jsonLd)
  return html
}

function writeRoute(pathName, html) {
  const outDir = pathName === '/' ? DIST : path.join(DIST, pathName)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
}

const SAME_AS = [
  'https://linkedin.com/in/jitendar-kumar-6551b8126',
  'https://github.com/jitendarkumars',
]

// 1) Home
writeRoute(
  '/',
  render({
    pathName: '/',
    title: 'Jitendar Kumar (Jeet) — Senior Full-Stack & Mobile Engineer',
    description:
      'Senior full-stack & mobile engineer with 8 years building web and mobile products end to end — Angular, React, Node/NestJS, and Flutter. Projects, blog, and a daily build log.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: 'Jitendar Kumar',
          alternateName: 'Jeet',
          jobTitle: 'Senior Full-Stack & Mobile Engineer',
          url: SITE,
          sameAs: SAME_AS,
        },
        { '@type': 'WebSite', name: 'Jitendar Kumar', url: SITE },
      ],
    },
  })
)

// 2) Blog index
writeRoute(
  '/blog',
  render({
    pathName: '/blog',
    title: 'Blog — Jitendar Kumar (Jeet)',
    description:
      'Articles on local AI, fintech, Android & mobile, and full-stack engineering — written from real projects by Jitendar Kumar.',
  })
)

// 3) Each post
for (const post of posts) {
  writeRoute(
    '/blog/' + post.id,
    render({
      pathName: '/blog/' + post.id,
      title: post.title + ' — Jitendar Kumar',
      description: post.excerpt,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        keywords: post.tags.join(', '),
        author: { '@type': 'Person', name: 'Jitendar Kumar', url: SITE },
        url: SITE + '/blog/' + post.id,
        mainEntityOfPage: SITE + '/blog/' + post.id,
      },
    })
  )
}

// 4) Slides index
writeRoute(
  '/slides',
  render({
    pathName: '/slides',
    title: 'Visual explainers — Jitendar Kumar (Jeet)',
    description:
      'Swipeable, slide-style explainers of engineering concepts — pagination, auth, system design, AI, and more.',
  })
)

// 5) Each deck
for (const deck of decks) {
  writeRoute(
    '/slides/' + deck.id,
    render({
      pathName: '/slides/' + deck.id,
      title: deck.title + ' — Jitendar Kumar',
      description: deck.excerpt,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: deck.title,
        description: deck.excerpt,
        datePublished: deck.date,
        keywords: (deck.tags || []).join(', '),
        author: { '@type': 'Person', name: 'Jitendar Kumar', url: SITE },
        url: SITE + '/slides/' + deck.id,
      },
    })
  )
}

// 6) sitemap.xml — regenerated each build so it stays in sync with content
const today = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: SITE + '/', priority: '1.0', changefreq: 'weekly' },
  { loc: SITE + '/blog', priority: '0.8', changefreq: 'daily' },
  { loc: SITE + '/slides', priority: '0.8', changefreq: 'weekly' },
  ...posts.map((p) => ({ loc: SITE + '/blog/' + p.id, lastmod: p.date, priority: '0.7', changefreq: 'monthly' })),
  ...decks.map((d) => ({ loc: SITE + '/slides/' + d.id, lastmod: d.date, priority: '0.7', changefreq: 'monthly' })),
]
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        '  <url><loc>' + u.loc + '</loc><lastmod>' + (u.lastmod || today) +
        '</lastmod><changefreq>' + u.changefreq + '</changefreq><priority>' + u.priority + '</priority></url>'
    )
    .join('\n') +
  '\n</urlset>\n'
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap)

console.log(
  'prerendered: / , /blog (' + posts.length + ' posts), /slides (' + decks.length + ' decks); sitemap ' + urls.length + ' urls'
)
