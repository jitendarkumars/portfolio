# Deploy jeet-v4 to Vercel (free) + custom domain

The site is a static Vite build — Vercel's free **Hobby** plan hosts it (with your
custom domain + HTTPS) at **$0**.

## 0. One quick edit before you deploy
Open `portfolio/index.html` and replace `https://your-domain.com` with your real
domain in the **4 spots** (canonical, `og:url`, `og:image`, `twitter:image`) so
link previews use the right URL. (The site works without this; only social
preview URLs need it.)

Optional, while you're here:
- Put your photo at `portfolio/public/me.jpg` and set `avatar: '/me.jpg'` in `portfolio/src/data/profile.js`.
- Put your résumé at `portfolio/public/resume.pdf` (the download button already points there).

## 1. Push to GitHub
From the repo root (`jeet-v4`):
```bash
git init
git add .
git commit -m "Portfolio"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## 2. Import on Vercel
1. Go to vercel.com → **Add New → Project** → import your repo.
2. **Root Directory:** set to `portfolio`  ← important (repo also has `content-mcp/`).
3. Framework: **Vite** (auto). Build: `npm run build`. Output: `dist`.
4. **Deploy** → you get a `https://<project>.vercel.app` URL.

## 3. Add your custom domain
Vercel → your project → **Settings → Domains** → add `your-domain.com` (and `www`).
Vercel shows the exact DNS to set at your registrar — typically:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| A     | `@`  | `76.76.21.21`           |
| CNAME | `www`| `cname.vercel-dns.com`  |

(Or switch your domain's **nameservers** to Vercel to let it manage DNS.)
HTTPS is issued automatically. DNS usually propagates in minutes.

## Updating content later
Edit the JSON in `portfolio/src/data/` (by hand or via the Content MCP) →
`git commit` → `git push`. Vercel auto-rebuilds and redeploys (~1 min).
