#!/usr/bin/env node
// ============================================================
//  Build-in-public daily log generator
//  Runs on your Mac (via launchd). Each day it:
//   1. reads the day's activity from Screenpipe (localhost:3030)
//   2. filters out sensitive/non-dev apps + redacts numbers
//   3. asks your local LM Studio model for a short build-log entry
//   4. publishes it into the portfolio's vlog.json (same store the
//      Content MCP uses) and commits + pushes (auto-publish).
//
//  Privacy: scoped to DEV/BUILD work only. Finance, banking, broker,
//  messaging and personal apps are dropped, and currency/long-number
//  patterns are redacted before anything is sent to the model.
// ============================================================

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_DIR = path.resolve(__dirname, '..')

// Load automation/.env (gitignored) so secrets stay out of the repo and the
// launchd job gets them regardless of shell profile.
function loadDotenv() {
  try {
    const fromFile = {}
    for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) fromFile[m[1]] = m[2].trim().replace(/^["']|["']$/g, '').trim() // last line wins
    }
    for (const [k, v] of Object.entries(fromFile)) if (!process.env[k]) process.env[k] = v
  } catch {}
}
loadDotenv()

// ---- config (override via env) ----
const SCREENPIPE_URL = process.env.SCREENPIPE_URL || 'http://localhost:3030'
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234'
const LM_MODEL = process.env.LM_MODEL || 'qwen3.5-27b-claude-4.6-opus-distilled-mlx'
const LM_API_KEY = process.env.LMSTUDIO_API_KEY || process.env.LM_API_KEY || ''
const VLOG_PATH = path.join(REPO_DIR, 'portfolio', 'src', 'data', 'vlog.json')
const DO_PUSH = process.env.NO_PUSH ? false : true

// Apps/keywords to NEVER summarize (finance, trading, messaging, secrets, personal).
const DENY = [
  'whatsapp', 'message', 'imessage', 'telegram', 'signal', 'mail', 'gmail', 'outlook',
  'bank', 'hdfc', 'icici', 'sbi', 'kotak', 'axis', 'phonepe', 'gpay', 'google pay',
  'paytm', 'zerodha', 'kite', 'groww', 'upstox', 'angel', 'dhan', 'shoonya', 'broker',
  'fyers', 'optionguard', 'trading', 'tradingview', 'nse', 'bse', 'nifty', 'finnifty',
  '1password', 'bitwarden', 'keychain',
  'password', 'wallet', 'binance', 'coindcx', 'wazirx', 'photos', 'whatsApp',
]

const log = (...a) => console.log(new Date().toISOString(), ...a)

function redact(text) {
  return String(text || '')
    .replace(/[₹$€£]\s?[\d,]+(\.\d+)?/g, '[redacted]') // currency amounts
    .replace(/\b\d[\d,\s]{5,}\d\b/g, '[redacted]') // long number runs (accounts, cards)
    .replace(/\b[A-Z0-9]{10,}\b/g, '[redacted]') // long tokens/ids
    .slice(0, 220)
}

function isDeny(name) {
  const n = String(name || '').toLowerCase()
  return DENY.some((d) => n.includes(d))
}

async function getApiKey() {
  if (process.env.SCREENPIPE_API_KEY) return process.env.SCREENPIPE_API_KEY.trim()
  try {
    const t = execSync('screenpipe auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    if (t) return t
  } catch {}
  throw new Error(
    'No Screenpipe API key found. Get it with `screenpipe auth token` (or, for the ' +
      'Desktop app, Settings > Privacy), then add SCREENPIPE_API_KEY=... to automation/.env'
  )
}

async function queryScreenpipe(contentType, startISO, endISO, key) {
  const url =
    `${SCREENPIPE_URL}/search?content_type=${contentType}` +
    `&start_time=${encodeURIComponent(startISO)}` +
    `&end_time=${encodeURIComponent(endISO)}&limit=1000`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
  if (!res.ok) throw new Error(`Screenpipe ${res.status}: ${await res.text()}`)
  const json = await res.json()
  const items = json.data || json.results || (Array.isArray(json) ? json : [])
  return { items, total: json?.pagination?.total, keys: Object.keys(json || {}) }
}

async function fetchDay() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const key = await getApiKey()
  const startISO = start.toISOString()
  const endISO = now.toISOString()

  const ocr = await queryScreenpipe('ocr', startISO, endISO, key)
  if (ocr.items.length) return ocr.items

  log(`OCR query empty (total=${ocr.total ?? 'n/a'}). Trying content_type=all ...`)
  const all = await queryScreenpipe('all', startISO, endISO, key)
  if (!all.items.length) {
    log(
      `Still empty. total=${all.total ?? 'n/a'}, response keys=[${all.keys.join(',')}], ` +
        `window=${startISO} .. ${endISO}`
    )
  }
  return all.items
}

function digest(items) {
  const apps = new Map()
  for (const it of items) {
    const c = it.content || it
    const app = c.app_name || c.appName || 'Unknown'
    const win = c.window_name || c.windowName || ''
    const text = c.text || c.ocr_text || ''
    if (isDeny(app) || isDeny(win)) continue
    if (!apps.has(app)) apps.set(app, { count: 0, windows: new Set(), samples: [] })
    const a = apps.get(app)
    a.count++
    if (win) a.windows.add(win.slice(0, 80))
    if (text && a.samples.length < 4) a.samples.push(redact(text))
  }
  const top = [...apps.entries()].sort((x, y) => y[1].count - x[1].count).slice(0, 8)
  return top
    .map(([app, a]) => {
      const wins = [...a.windows].slice(0, 5).join(' | ')
      const samples = a.samples.join(' / ')
      return `- ${app} (${a.count} frames)` + (wins ? `\n  windows: ${wins}` : '') + (samples ? `\n  text: ${samples}` : '')
    })
    .join('\n')
}

const BUILD_LOG_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    tasks: { type: 'array', items: { type: 'string' } },
    mood: { type: 'string' },
  },
  required: ['title', 'summary', 'tasks', 'mood'],
  additionalProperties: false,
}

async function lmChat(messages, responseFormat) {
  const res = await fetch(`${LMSTUDIO_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(LM_API_KEY ? { Authorization: `Bearer ${LM_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: LM_MODEL,
      temperature: 0.4,
      max_tokens: 1200,
      response_format: responseFormat,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`LM Studio ${res.status}: ${await res.text()}`)
  const json = await res.json()
  const msg = json.choices?.[0]?.message || {}
  return { content: (msg.content || '').trim(), finish: json.choices?.[0]?.finish_reason }
}

function parseLooseJson(s) {
  if (!s) return null
  const m = s.match(/\{[\s\S]*\}/) // tolerate <think> prefixes / stray text
  try {
    return JSON.parse(m ? m[0] : s)
  } catch {
    return null
  }
}

async function summarize(digestText) {
  const system =
    'You write a short, first-person "building in public" daily log entry for a software developer, ' +
    'based on a digest of their screen activity. STRICT RULES: only describe software development, ' +
    'design, DevOps, and learning work. NEVER mention money, trades, P&L, balances, amounts, banks, ' +
    'brokers, stock tickers, passwords, account numbers, client names, or personal messages. If there ' +
    'is little dev activity, call it a light build day. Keep it humble and concrete. Output ONLY the ' +
    'JSON object, no reasoning or extra text. Shape: {"title": string (<= 7 words, no "Day N" prefix), ' +
    '"summary": string (2-3 sentences), "tasks": string[] (2-4 short items), "mood": string (one emoji)}.'
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Here is today's dev activity digest:\n\n${digestText}` },
  ]

  // 1) structured output (guaranteed schema on supported builds)
  let out = await lmChat(messages, {
    type: 'json_schema',
    json_schema: { name: 'build_log', strict: true, schema: BUILD_LOG_SCHEMA },
  })
  let parsed = parseLooseJson(out.content)
  if (parsed) return parsed

  // 2) fallback to plain text + parse JSON out of it
  log(`Structured output empty/unparseable (finish=${out.finish}). Retrying as plain text...`)
  out = await lmChat(messages, { type: 'text' })
  parsed = parseLooseJson(out.content)
  if (parsed) return parsed

  throw new Error(
    `Model did not return usable JSON (finish=${out.finish}). First 300 chars: ${out.content.slice(0, 300)}`
  )
}

function gitPublish(dayN, date) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: REPO_DIR, stdio: 'ignore' })
  } catch {
    log('Not a git repo yet — wrote vlog.json locally, skipping commit/push.')
    return
  }
  try {
    execSync(`git add ${JSON.stringify(VLOG_PATH)}`, { cwd: REPO_DIR })
    execSync(`git commit -m "daily log: day ${dayN} (${date})"`, { cwd: REPO_DIR })
  } catch (e) {
    log('git commit skipped (nothing to commit?):', e.message)
    return
  }
  const hasOrigin = (() => {
    try {
      return execSync('git remote', { cwd: REPO_DIR, encoding: 'utf8' }).includes('origin')
    } catch {
      return false
    }
  })()
  if (DO_PUSH && hasOrigin) {
    try {
      execSync('git push', { cwd: REPO_DIR, stdio: 'inherit' })
      log('Pushed — Vercel will rebuild and the entry goes live.')
    } catch (e) {
      log('git push failed (check credentials):', e.message)
    }
  } else {
    log('Committed locally; push skipped (no origin / NO_PUSH).')
  }
}

async function main() {
  // Reuse the Content MCP's store layer so this writes exactly like the MCP does.
  let readCollection, writeCollection, today
  try {
    ;({ readCollection, writeCollection, today } = await import(
      path.join(REPO_DIR, 'content-mcp', 'lib', 'store.js')
    ))
  } catch (e) {
    throw new Error('Could not load content-mcp store: ' + e.message)
  }

  const items = await fetchDay()
  if (!items.length) {
    log('No Screenpipe activity for today — is Screenpipe running? Nothing posted.')
    return
  }
  const digestText = digest(items)
  if (!digestText.trim()) {
    log('No dev activity left after filtering — nothing posted.')
    return
  }

  const out = await summarize(digestText)
  const vlog = await readCollection('vlog')

  // next "Day N" number from existing titles
  const nums = vlog
    .map((v) => (String(v.title).match(/Day\s+(\d+)/i) || [])[1])
    .filter(Boolean)
    .map(Number)
  const dayN = (nums.length ? Math.max(...nums) : vlog.length) + 1
  const date = today()

  const entry = {
    id: `day-${dayN}`,
    date,
    title: `Day ${dayN} — ${out.title}`,
    youtube: '',
    mood: out.mood || '🛠️',
    notes: out.summary,
    tasks: Array.isArray(out.tasks) ? out.tasks.slice(0, 5) : [],
  }

  // If today's entry already exists (re-run), replace it instead of duplicating.
  const next = vlog[0] && vlog[0].date === date ? [entry, ...vlog.slice(1)] : [entry, ...vlog]
  await writeCollection('vlog', next)
  log(`Wrote entry: ${entry.title}`)

  gitPublish(dayN, date)
}

main().catch((e) => {
  log('ERROR:', e.message)
  process.exit(1)
})
