# 🧩 Portfolio Content MCP

An [MCP](https://modelcontextprotocol.io) server that lets you manage your portfolio's **projects, blog posts, and daily-log (vlog) entries** by just talking to Claude — "add a blog post about X", "log what I did today", "feature the DevPulse project". It edits the portfolio's JSON content files directly, so your changes show up the next time the site rebuilds.

This is the **single place** to manage all your content.

---

## How it works

```
You → Claude → (this MCP server) → portfolio/src/data/*.json → your website
```

The server reads and writes:

- `projects.json`
- `blog.json`
- `vlog.json`

inside your portfolio at `…/portfolio/src/data/`.

---

## Setup (one time)

### 1. Install dependencies

```bash
cd content-mcp
npm install
```

### 2. Tell your MCP client about the server

Add this to your MCP client config. **Use absolute paths.**

For **Claude Desktop**, edit `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "portfolio-content": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/content-mcp/index.js"],
      "env": {
        "PORTFOLIO_DIR": "/ABSOLUTE/PATH/TO/portfolio"
      }
    }
  }
}
```

> If you keep `content-mcp/` and `portfolio/` side by side (as they come in the zip), you can even omit `PORTFOLIO_DIR` — the server defaults to `../portfolio`.

### 3. Restart your MCP client

You should now see the `portfolio-content` tools available.

---

## Try it

Just ask in plain language:

- "**What's my portfolio status?**" → confirms the folder it's writing to + item counts
- "**Add a project** called Snippet Vault, a keyboard-first snippet manager built with React and SQLite, and feature it"
- "**Add a blog post** titled 'Why I switched to Vite' with these three paragraphs: …"
- "**Log today**: Day 48, shipped the contact form and fixed the mobile menu"
- "**Update** the DevPulse project's live URL to https://devpulse.app"
- "**List my blog posts**" / "**Delete** the vlog entry with id day-44"

After changes, run the site (`cd portfolio && npm run dev`) to see them live.

---

## Tools

| Tool | What it does |
|------|--------------|
| `get_status` | Show target folder + counts |
| `list_projects` / `add_project` / `update_project` / `delete_project` | Manage projects |
| `list_blog_posts` / `add_blog_post` / `update_blog_post` / `delete_blog_post` | Manage blog posts |
| `list_vlog_entries` / `add_vlog_entry` / `update_vlog_entry` / `delete_vlog_entry` | Manage the daily log |

Nice touches:
- IDs (slugs) are auto-generated from titles and de-duplicated.
- Blog `body` can be one big string (split on blank lines) or an array of paragraphs.
- Blog reading time is auto-estimated; dates default to today.
- New blog/vlog items go to the **top** (newest first); updates only change the fields you pass.

---

## Safety / notes
- The server only ever touches the three JSON files above — nothing else.
- It writes valid, pretty-printed JSON, so your files stay diff-friendly and git-clean.
- Commit your content to git so you always have history: `git add src/data && git commit -m "new post"`.
