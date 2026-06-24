# Jeet — Portfolio + Content MCP

This bundle has two parts that work together:

```
jeet-portfolio/
├── portfolio/      → the website (React + Vite + Three.js/react-three-fiber):
│                     cream & ink brutalist style, fluid-ink WebGL marble + 3D
│                     ink blob, blog, vlog, projects, /now, paper/ink theme,
│                     ⌘K command palette, contact form
└── content-mcp/    → an MCP server to add/update/delete projects, blog posts,
                      and vlog entries by chatting with Claude
```

## Start here

1. **Run the website**
   ```bash
   cd portfolio
   npm install
   npm run dev          # http://localhost:5173
   ```
   Edit your details in `portfolio/src/data/profile.js`. Full guide: `portfolio/README.md`.

2. **Set up content management (the MCP)** — so you can say *"add a blog post"* / *"log today"* / *"add a project"* and it updates the site.
   ```bash
   cd content-mcp
   npm install
   ```
   Then add it to your Claude config and restart. Full guide: `content-mcp/README.md`.

3. **Deploy** the `portfolio/` folder to Vercel / Netlify / GitHub Pages (instructions in `portfolio/README.md`).

## The workflow you now have

```
Talk to Claude  →  Content MCP edits the JSON  →  git commit  →  site shows it
```

Everything builds and runs with Node 18+. Have fun. 🚀
