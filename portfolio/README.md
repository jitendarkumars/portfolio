# ✦ Jeet — Developer Portfolio (Fluid Ink / WebGL edition)

A **cream & ink, brutalist** developer portfolio with **real Three.js / WebGL** woven throughout: a fluid "liquid ink" marble that reacts to your cursor, a floating 3D ink blob in the hero, a wireframe sculpture in the About panel, and a marbled contact panel. Plus a blog, a daily build-in-public log, projects, a /now page, a ⌘K command palette, paper/ink themes, and a working contact form.

Content (projects, blog, vlog) lives in plain **JSON**, so you edit it by hand *or* manage it by talking to Claude via the included **[Content MCP server](../content-mcp/)**.

Built with **React + Vite + @react-three/fiber**.

---

## 🚀 Quick start

Needs [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
npm run preview
```

---

## 🌀 The WebGL / 3D layer

All of it is in `src/webgl/`, using react-three-fiber (no asset downloads, no fragile shaders on the geometry):

| File | What it renders |
|------|-----------------|
| `inkShader.js` | The fluid-ink marble GLSL (domain-warped FBM) — pointer + click-ripple reactive, themed via uniforms |
| `InkQuad.jsx` | A full-screen marble plane driven by that shader |
| `InkBackdrop.jsx` | Reusable marble canvas (used as the page background + the contact panel) |
| `HeroBlob.jsx` | A faceted 3D "ink" blob with CPU vertex wobble that tilts to your cursor |
| `HeroScene.jsx` | Hero canvas = marble + blob + lights; click anywhere drops a ripple |
| `Orb.jsx` | Wireframe torus-knot sculpture in the About panel |

Performance & accessibility:
- Heavy 3D is **skipped automatically** when the visitor has `prefers-reduced-motion` on (the site still looks great — cream, grain, brutalist type).
- `three` is split into its own cached chunk (`npm run build` shows `three-*.js` separately).
- Device pixel ratio is capped; colors are read live from CSS so 3D always matches the theme.

---

## ✨ Other features

- **Paper / ink themes** (light cream is default) with a toggle — remembers your choice, no flash on load.
- **⌘K command palette** — jump to sections, toggle theme, copy email, open socials.
- **Blog** with an in-page reader, **Daily Log / Vlog** timeline (+ optional YouTube embeds), **/now** section.
- **Working contact form** (real email via Formspree or Web3Forms — see below).
- Responsive, with a mobile menu.

---

## ✏️ Editing content

Everything you'll change is in **`src/data/`**:

| File | Controls | MCP-editable? |
|------|----------|---------------|
| `profile.js` | Name, roles, bio, skills, stats, email, socials, contact-form keys | by hand |
| `now.js` | Your `/now` section | by hand |
| `projects.json` | Project cards | ✅ |
| `blog.json` | Blog posts | ✅ |
| `vlog.json` | Daily-log entries | ✅ |

See **[`../content-mcp/`](../content-mcp/)** to manage projects/blog/vlog by chatting with Claude.

---

## 📬 Make the contact form send email

By default the form opens the visitor's mail app. To receive submissions with no backend, set **one** in `src/data/profile.js` → `contact`:

- **Formspree** ([formspree.io](https://formspree.io)) → `formspreeId: 'xxxxxxxx'`
- **Web3Forms** ([web3forms.com](https://web3forms.com)) → `web3formsKey: 'your-key'`

---

## 🎨 Theming

Colors are CSS variables at the top of `src/index.css` — `:root` (paper/light) and `:root[data-theme='ink']` (dark). Change `--paper`, `--ink`, `--accent` to re-skin everything, including the WebGL (it reads those variables).

---

## 🌍 Deploy

Static `/dist`, works anywhere:
- **Vercel:** import the repo → preset **Vite** → Deploy.
- **Netlify:** build `npm run build`, publish `dist`.
- **GitHub Pages:** `npm run build`, publish `dist/` (`base: './'` already set).

---

## 🧱 Structure

```
portfolio/
├── index.html              # shell, fonts (Space Grotesk + Inter + JetBrains Mono), no-flash theme
├── vite.config.js          # base './' + three/r3f chunk splitting
└── src/
    ├── App.jsx             # ThemeProvider + grain + global marble background
    ├── theme.jsx           # paper/ink theme context
    ├── index.css           # cream & ink brutalist design system
    ├── data/               # 👈 your content (JSON) + profile/now (JS)
    ├── webgl/              # 👈 all Three.js / R3F (see table above)
    └── components/         # Hero, About, Now, Projects, Blog, Vlog, Contact, Navbar, …
```

Have fun making it yours. ✦
