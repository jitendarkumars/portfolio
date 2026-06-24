# Build-in-public daily log automation

Each day this generates a "Building in public" entry for the portfolio from your
**Screenpipe** screen history, summarized by your **local LM Studio** model, and
publishes it to the site's daily log (`portfolio/src/data/vlog.json`) — then
commits & pushes so Vercel rebuilds.

Everything runs **locally on your Mac**. Nothing is sent to the cloud.

## What it does

1. Reads today's activity from Screenpipe (`localhost:3030`).
2. **Drops sensitive/non-dev apps** (banking, brokers, trading, messaging,
   password managers, personal) and **redacts** currency amounts and long number
   runs before anything reaches the model.
3. Asks LM Studio (`localhost:1234`) for a short title + 2–3 sentence entry,
   scoped strictly to build/dev work.
4. Writes it via the Content MCP's store layer into `vlog.json` (newest first).
5. `git commit` + `git push` → Vercel redeploys (auto-publish).

## Prerequisites

- **Screenpipe running** (the recorder) — `localhost:3030` reachable.
- **LM Studio running with its local server ON** (Developer → enable server,
  port `1234`) and your model loaded
  (`qwen3.5-27b-claude-4.6-opus-distilled-mlx`, or set `LM_MODEL`).
- **Node 18+** on your PATH.
- For auto-publish: the repo must be pushed to GitHub with `git push` working
  without a prompt (set up the macOS credential helper or an SSH key). Until the
  site is deployed, the script still writes `vlog.json` locally and just skips the
  push.

## Authentication (one-time) — fixes "unauthorized" errors

Screenpipe's API requires a key. Get it and drop it in a git-ignored `.env`:

```bash
# 1. Get your key (CLI). If this errors, open the Screenpipe Desktop app:
#    Settings > Privacy > copy the API key.
screenpipe auth token

# 2. Save it for the script (automation/.env is git-ignored):
echo 'SCREENPIPE_API_KEY=PASTE_YOUR_KEY_HERE' > ~/Documents/jeet-v4/automation/.env
```

The script auto-loads `automation/.env`, so both manual runs and the scheduled
job pick up the key. You can add `LM_MODEL=...` there too if your model id differs.

## Test it once (no publish)

```bash
cd ~/Documents/jeet-v4/automation
NO_PUSH=1 node build-in-public.mjs
```

Check the new entry at the top of `portfolio/src/data/vlog.json`. Remove
`NO_PUSH=1` to let it commit & push for real.

## Install the daily schedule (launchd)

```bash
cp ~/Documents/jeet-v4/automation/com.jeet.buildlog.plist ~/Library/LaunchAgents/
launchctl load -w ~/Library/LaunchAgents/com.jeet.buildlog.plist
```

It now runs every day at **21:30**. Change the time by editing `Hour`/`Minute`
in the plist, then `launchctl unload` + `launchctl load -w` it again.

Run it immediately to verify the scheduled path works:

```bash
launchctl start com.jeet.buildlog
tail -f ~/Documents/jeet-v4/automation/build-in-public.log
```

## Config (environment variables)

| Var | Default | Purpose |
|-----|---------|---------|
| `SCREENPIPE_URL` | `http://localhost:3030` | Screenpipe API |
| `SCREENPIPE_API_KEY` | (auto via `screenpipe auth token`) | API key |
| `LMSTUDIO_URL` | `http://localhost:1234` | LM Studio OpenAI-compatible API |
| `LMSTUDIO_API_KEY` | (none) | only if LM Studio's server has "Require API key" enabled |
| `LM_MODEL` | `qwen3.5-27b-claude-4.6-opus-distilled-mlx` | model id |
| `NO_PUSH` | (unset) | set to `1` to write locally without committing/pushing |

## Privacy notes

Screenpipe captures everything on screen. This script defends in two layers — an
app/keyword denylist and number/currency redaction — and the model is instructed
to never mention money, trades, balances, brokers, clients, or personal messages.
It's still **auto-publishing to a public site**, so review `build-in-public.log`
periodically. To switch to review-before-publish later, run with `NO_PUSH=1` on a
schedule and approve manually.

---

# Auto blog generation

Writes technical blog posts and publishes them, **2 per day** (~09:30 and ~17:30),
using a **Cowork scheduled task** (Claude does the writing with web research — much
higher quality than a local model). Claude picks the next topic from a curated
**topic bank** (`automation/blog-topics.json`), researches it, and writes the post
into `blog.json`. A tiny **publisher** then commits & pushes so Vercel rebuilds.
Categories rotate automatically (tool how-to, coding/system-design, AI/automation,
real project deep-dives).

How the pieces fit:
- **Scheduled task `portfolio-blog`** (in the app's "Scheduled" sidebar) — writes one
  researched post per run into `blog.json` and marks the topic used. It does not run git.
- **`publish.sh` + `com.jeet.publish.plist`** — a macOS LaunchAgent that commits &
  pushes any content changes (10:00 & 18:00 daily).
- **`blog-topics.json`** — the curated topic bank.

> Note: `generate-blogs.mjs` and `com.jeet.blogs.plist` (the older local-LM-Studio
> generator) are **superseded** by the scheduled task — don't install that plist.

## Set up the publisher (deploys what the task writes)

The `portfolio-blog` scheduled task is already created. Install the publisher so the
posts actually go live:

```bash
cp ~/Documents/jeet-v4/automation/com.jeet.publish.plist ~/Library/LaunchAgents/
launchctl load -w ~/Library/LaunchAgents/com.jeet.publish.plist
```

Try the whole flow now: open the **Scheduled** sidebar → **Run** `portfolio-blog` once
→ check the new post atop `blog.json` (`npm run dev` to preview) → then
`bash ~/Documents/jeet-v4/automation/publish.sh` to deploy it.

The task runs only while the Cowork app is open; if it's closed at the scheduled time
it runs on next launch, and the next publisher run picks it up.

## Keeping it fed

Each post marks its topic `"used": true`. When fewer than ~4 unused topics remain,
the log prints a warning — **add more entries to `blog-topics.json`** (same shape:
`{ "used": false, "category": "tool|practice|ai|project", "title", "tags": [], "brief" }`).
The `brief` is the backbone the model expands, so write a few real, specific points.
Project deep-dives should only describe projects you actually built.

> Heads-up: these are auto-published with a local model. Skim them now and then —
> if one reads thin, just delete that entry from `blog.json` and tighten the topic's
> brief in the bank.
