#!/usr/bin/env node
// ============================================================
//  Auto blog generator
//  Runs on your Mac (launchd). Each run it:
//   1. picks the next unused topic(s) from blog-topics.json (categories
//      rotate because the bank is interleaved)
//   2. has your local LM Studio model write a full post from the topic's
//      brief (so it stays accurate and specific, not generic AI filler)
//   3. prepends it to the site's blog.json (via the Content store)
//   4. marks the topic used, commits + pushes (auto-publish)
//
//  Quality guard: the model only expands a curated, real topic + brief —
//  it does not pick topics or invent tools. When the bank runs low it warns.
// ============================================================

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_DIR = path.resolve(__dirname, '..')
const TOPICS_PATH = path.join(__dirname, 'blog-topics.json')

function loadDotenv() {
  try {
    const fromFile = {}
    for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) fromFile[m[1]] = m[2].trim().replace(/^["']|["']$/g, '').trim()
    }
    for (const [k, v] of Object.entries(fromFile)) if (!process.env[k]) process.env[k] = v
  } catch {}
}
loadDotenv()

const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234'
const LM_MODEL = process.env.LM_MODEL || 'qwen3.5-27b-claude-4.6-opus-distilled-mlx'
const LM_API_KEY = process.env.LMSTUDIO_API_KEY || process.env.LM_API_KEY || ''
const BLOG_COUNT = Math.max(1, Number(process.env.BLOG_COUNT || 1))
const DO_PUSH = process.env.NO_PUSH ? false : true

const log = (...a) => console.log(new Date().toISOString(), ...a)

async function lmChat(messages) {
  const res = await fetch(`${LMSTUDIO_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(LM_API_KEY ? { Authorization: `Bearer ${LM_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: LM_MODEL,
      temperature: 0.3,
      max_tokens: 2400,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`LM Studio ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return (json.choices?.[0]?.message?.content || '').trim()
}

function parseLooseJson(s) {
  if (!s) return null
  const m = s.match(/\{[\s\S]*\}/)
  try {
    return JSON.parse(m ? m[0] : s)
  } catch {
    return null
  }
}

const CATEGORY_VOICE = {
  tool: 'a practical, hands-on how-to for a tool — setup, real usage, and when to use it',
  practice: 'a focused coding best-practices / system-design explainer with concrete guidance',
  ai: 'a grounded piece on AI / automation that a working engineer actually applies',
  project: 'a first-person deep-dive into a real project you built — decisions and architecture',
}

function buildMessages(topic) {
  const system =
    'You are a senior full-stack & mobile engineer writing a genuinely useful technical blog post in ' +
    'first person for your own site. Write ' + (CATEGORY_VOICE[topic.category] || 'a useful technical post') + '.\n' +
    'RULES: Be concrete and specific, never generic or padded. Use the provided key points as the ' +
    'backbone and expand them accurately. Include correct, idiomatic code snippets where they help. ' +
    'Do NOT fabricate benchmarks, statistics, version numbers you are unsure of, quotes, or company ' +
    'names. Keep it ~600-1000 words, humble and practical. For project posts, describe architecture and ' +
    'decisions, not private numbers.\n' +
    'Output ONLY JSON (no prose, no markdown fences) in EXACTLY this shape:\n' +
    '{"title": string, "excerpt": string (1-2 sentences), "tags": string[] (3-5), ' +
    '"readingTime": string (e.g. "7 min"), "blocks": [ ' +
    '{"type":"p","text":"..."}, {"type":"h","text":"Section heading"}, ' +
    '{"type":"code","lang":"bash","code":"..."}, {"type":"ul","items":["...","..."]}, ' +
    '{"type":"quote","text":"..."} ]}\n' +
    'Start with a "p" intro (no heading first). Use "h" for section headings. End with a short takeaway.'
  const user =
    `Title: ${topic.title}\nCategory: ${topic.category}\nSuggested tags: ${topic.tags.join(', ')}\n\n` +
    `Key points to build the post around:\n${topic.brief}`
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

const VALID = new Set(['p', 'h', 'code', 'ul', 'quote'])
function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return []
  return blocks
    .filter((b) => b && VALID.has(b.type))
    .map((b) => {
      if (b.type === 'code') return { type: 'code', lang: b.lang || 'text', code: String(b.code || b.text || '') }
      if (b.type === 'ul') return { type: 'ul', items: (b.items || []).map(String).filter(Boolean) }
      return { type: b.type, text: String(b.text || '') }
    })
    .filter((b) => (b.type === 'ul' ? b.items.length : b.type === 'code' ? b.code : b.text))
}

async function generatePost(topic) {
  let out = parseLooseJson(await lmChat(buildMessages(topic)))
  if (!out || !out.title || !Array.isArray(out.blocks)) {
    // one retry
    out = parseLooseJson(await lmChat(buildMessages(topic)))
  }
  if (!out || !out.title || !Array.isArray(out.blocks)) return null
  const blocks = normalizeBlocks(out.blocks)
  if (blocks.length < 3) return null
  return {
    title: String(out.title).slice(0, 110),
    excerpt: String(out.excerpt || '').slice(0, 240),
    tags: Array.isArray(out.tags) && out.tags.length ? out.tags.slice(0, 5) : topic.tags,
    readingTime: out.readingTime,
    blocks,
  }
}

function gitPublish(n) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: REPO_DIR, stdio: 'ignore' })
  } catch {
    log('Not a git repo — wrote files locally, skipping commit/push.')
    return
  }
  try {
    execSync('git add portfolio/src/data/blog.json automation/blog-topics.json', { cwd: REPO_DIR })
    execSync(`git commit -m "blog: ${n} new post(s)"`, { cwd: REPO_DIR })
  } catch (e) {
    log('git commit skipped:', e.message)
    return
  }
  let hasOrigin = false
  try {
    hasOrigin = execSync('git remote', { cwd: REPO_DIR, encoding: 'utf8' }).includes('origin')
  } catch {}
  if (DO_PUSH && hasOrigin) {
    try {
      execSync('git push', { cwd: REPO_DIR, stdio: 'inherit' })
      log('Pushed — Vercel will rebuild.')
    } catch (e) {
      log('git push failed (check credentials):', e.message)
    }
  } else {
    log('Committed locally; push skipped (no origin / NO_PUSH).')
  }
}

async function main() {
  const { readCollection, writeCollection, slugify, uniqueId, estimateReadingTime, today } = await import(
    path.join(REPO_DIR, 'content-mcp', 'lib', 'store.js')
  )

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'))
  const queue = topics.filter((t) => !t.used)
  if (!queue.length) {
    log('Topic bank is empty — add more entries to automation/blog-topics.json. Nothing posted.')
    return
  }

  const blog = await readCollection('blog')
  const date = today()
  let added = 0

  for (const topic of queue.slice(0, BLOG_COUNT)) {
    log(`Generating: [${topic.category}] ${topic.title}`)
    let post
    try {
      post = await generatePost(topic)
    } catch (e) {
      log('  LM error, skipping:', e.message)
      continue
    }
    if (!post) {
      log('  Model did not return a usable post, skipping (topic left unused).')
      continue
    }
    const id = uniqueId(slugify(post.title), blog.map((p) => p.id))
    const blockText = post.blocks.map((b) => b.text || b.code || (b.items || []).join(' ')).join(' ')
    const entry = {
      id,
      title: post.title,
      date,
      readingTime: post.readingTime || estimateReadingTime(blockText),
      tags: post.tags,
      excerpt: post.excerpt,
      blocks: post.blocks,
    }
    blog.unshift(entry)
    topic.used = true
    added++
    log(`  Added: ${entry.title} (${entry.id})`)
  }

  if (!added) {
    log('No posts generated this run.')
    return
  }

  await writeCollection('blog', blog)
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(topics, null, 2) + '\n')

  const remaining = topics.filter((t) => !t.used).length
  log(`Done. ${added} post(s) added. ${remaining} topics left in the bank.`)
  if (remaining < 4) log('⚠️  Topic bank running low — add more topics to automation/blog-topics.json.')

  gitPublish(added)
}

main().catch((e) => {
  log('ERROR:', e.message)
  process.exit(1)
})
