#!/usr/bin/env node
// ============================================================
//  Portfolio Content MCP
//  Add / update / delete projects, blog posts, and vlog entries
//  by editing the portfolio's JSON content files.
// ============================================================
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  DATA_DIR,
  PORTFOLIO_DIR,
  readCollection,
  writeCollection,
  slugify,
  uniqueId,
  estimateReadingTime,
  normalizeBody,
  today,
} from './lib/store.js'

const server = new McpServer({ name: 'portfolio-content', version: '1.0.0' })

const ok = (text) => ({ content: [{ type: 'text', text }] })
const fail = (text) => ({ content: [{ type: 'text', text }], isError: true })
const pretty = (obj) => JSON.stringify(obj, null, 2)

// Wrap a handler so thrown errors come back as readable tool errors.
const guard = (fn) => async (args) => {
  try {
    return await fn(args || {})
  } catch (e) {
    return fail(`Error: ${e.message}`)
  }
}

function findIndexById(items, id) {
  return items.findIndex((i) => i.id === id)
}
function listIds(items) {
  return items.map((i) => i.id).filter(Boolean)
}
// Only copy keys whose value was actually provided (patch semantics).
function applyPatch(target, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) target[k] = v
  }
  return target
}

// ─────────────────────────── STATUS ───────────────────────────
server.registerTool(
  'get_status',
  {
    title: 'Get status',
    description:
      'Show where this server is writing content and how many items exist. Use this first to confirm it is pointed at the right portfolio.',
    inputSchema: {},
  },
  guard(async () => {
    const [projects, blog, vlog] = await Promise.all([
      readCollection('projects'),
      readCollection('blog'),
      readCollection('vlog'),
    ])
    return ok(
      pretty({
        portfolioDir: PORTFOLIO_DIR,
        dataDir: DATA_DIR,
        counts: { projects: projects.length, blogPosts: blog.length, vlogEntries: vlog.length },
      })
    )
  })
)

// ────────────────────────── PROJECTS ──────────────────────────
server.registerTool(
  'list_projects',
  { title: 'List projects', description: 'List all portfolio projects.', inputSchema: {} },
  guard(async () => {
    const items = await readCollection('projects')
    return ok(pretty(items))
  })
)

server.registerTool(
  'add_project',
  {
    title: 'Add project',
    description: 'Add a new project card to the portfolio.',
    inputSchema: {
      title: z.string().describe('Project name'),
      blurb: z.string().describe('1–2 sentence description'),
      tags: z.array(z.string()).optional().describe('Tech stack tags, e.g. ["React","Node"]'),
      emoji: z.string().optional().describe('An emoji icon for the card (default 🚀)'),
      featured: z.boolean().optional().describe('Highlight this project (default false)'),
      live: z.string().optional().describe('Live demo URL'),
      code: z.string().optional().describe('Source code URL'),
      id: z.string().optional().describe('Custom slug id (auto-generated from title if omitted)'),
    },
  },
  guard(async ({ title, blurb, tags, emoji, featured, live, code, id }) => {
    const items = await readCollection('projects')
    const newId = id ? slugify(id) : uniqueId(slugify(title), listIds(items))
    const item = {
      id: newId,
      title,
      blurb,
      tags: tags || [],
      emoji: emoji || '🚀',
      featured: !!featured,
      live: live || '',
      code: code || '',
    }
    items.push(item)
    const file = await writeCollection('projects', items)
    return ok(`Added project "${title}" (id: ${newId}).\nWrote ${file}\n\n${pretty(item)}`)
  })
)

server.registerTool(
  'update_project',
  {
    title: 'Update project',
    description: 'Update fields of an existing project (only the fields you pass are changed).',
    inputSchema: {
      id: z.string().describe('id of the project to update'),
      title: z.string().optional(),
      blurb: z.string().optional(),
      tags: z.array(z.string()).optional(),
      emoji: z.string().optional(),
      featured: z.boolean().optional(),
      live: z.string().optional(),
      code: z.string().optional(),
    },
  },
  guard(async ({ id, ...patch }) => {
    const items = await readCollection('projects')
    const idx = findIndexById(items, id)
    if (idx === -1) return fail(`No project with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    applyPatch(items[idx], patch)
    const file = await writeCollection('projects', items)
    return ok(`Updated project "${id}".\nWrote ${file}\n\n${pretty(items[idx])}`)
  })
)

server.registerTool(
  'delete_project',
  {
    title: 'Delete project',
    description: 'Delete a project by id.',
    inputSchema: { id: z.string().describe('id of the project to delete') },
  },
  guard(async ({ id }) => {
    const items = await readCollection('projects')
    const next = items.filter((i) => i.id !== id)
    if (next.length === items.length)
      return fail(`No project with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    const file = await writeCollection('projects', next)
    return ok(`Deleted project "${id}".\nWrote ${file}`)
  })
)

// ───────────────────────────── BLOG ───────────────────────────
server.registerTool(
  'list_blog_posts',
  { title: 'List blog posts', description: 'List all blog posts (newest first).', inputSchema: {} },
  guard(async () => ok(pretty(await readCollection('blog'))))
)

server.registerTool(
  'add_blog_post',
  {
    title: 'Add blog post',
    description:
      'Add a blog post. `body` may be an array of paragraphs or a single string (split on blank lines). Added to the top (newest).',
    inputSchema: {
      title: z.string(),
      body: z.union([z.string(), z.array(z.string())]).describe('Post content'),
      excerpt: z.string().optional().describe('Teaser line (defaults to the first paragraph)'),
      tags: z.array(z.string()).optional(),
      date: z.string().optional().describe('YYYY-MM-DD (defaults to today)'),
      readingTime: z.string().optional().describe('e.g. "5 min" (auto-estimated if omitted)'),
      id: z.string().optional(),
    },
  },
  guard(async ({ title, body, excerpt, tags, date, readingTime, id }) => {
    const items = await readCollection('blog')
    const paragraphs = normalizeBody(body)
    if (paragraphs.length === 0) return fail('`body` is empty.')
    const newId = id ? slugify(id) : uniqueId(slugify(title), listIds(items))
    const post = {
      id: newId,
      title,
      date: date || today(),
      readingTime: readingTime || estimateReadingTime(paragraphs),
      tags: tags || [],
      excerpt: excerpt || paragraphs[0].slice(0, 160),
      body: paragraphs,
    }
    items.unshift(post)
    const file = await writeCollection('blog', items)
    return ok(`Added blog post "${title}" (id: ${newId}).\nWrote ${file}\n\n${pretty(post)}`)
  })
)

server.registerTool(
  'update_blog_post',
  {
    title: 'Update blog post',
    description: 'Update fields of a blog post (only the fields you pass change).',
    inputSchema: {
      id: z.string(),
      title: z.string().optional(),
      body: z.union([z.string(), z.array(z.string())]).optional(),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      date: z.string().optional(),
      readingTime: z.string().optional(),
    },
  },
  guard(async ({ id, body, readingTime, ...rest }) => {
    const items = await readCollection('blog')
    const idx = findIndexById(items, id)
    if (idx === -1) return fail(`No blog post with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    const patch = { ...rest }
    if (body !== undefined) {
      patch.body = normalizeBody(body)
      // Re-estimate reading time when body changes unless one is given.
      patch.readingTime = readingTime || estimateReadingTime(patch.body)
    } else if (readingTime !== undefined) {
      patch.readingTime = readingTime
    }
    applyPatch(items[idx], patch)
    const file = await writeCollection('blog', items)
    return ok(`Updated blog post "${id}".\nWrote ${file}\n\n${pretty(items[idx])}`)
  })
)

server.registerTool(
  'delete_blog_post',
  {
    title: 'Delete blog post',
    description: 'Delete a blog post by id.',
    inputSchema: { id: z.string() },
  },
  guard(async ({ id }) => {
    const items = await readCollection('blog')
    const next = items.filter((i) => i.id !== id)
    if (next.length === items.length)
      return fail(`No blog post with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    const file = await writeCollection('blog', next)
    return ok(`Deleted blog post "${id}".\nWrote ${file}`)
  })
)

// ───────────────────────────── VLOG ───────────────────────────
server.registerTool(
  'list_vlog_entries',
  { title: 'List daily-log entries', description: 'List all vlog / daily-log entries (newest first).', inputSchema: {} },
  guard(async () => ok(pretty(await readCollection('vlog'))))
)

server.registerTool(
  'add_vlog_entry',
  {
    title: 'Add daily-log entry',
    description: 'Add a daily-log / vlog entry. Added to the top (newest).',
    inputSchema: {
      title: z.string().describe('e.g. "Day 48 — Shipped the contact form"'),
      notes: z.string().describe('What you worked on'),
      date: z.string().optional().describe('YYYY-MM-DD (defaults to today)'),
      mood: z.string().optional().describe('An emoji for the day, e.g. 🚀'),
      youtube: z.string().optional().describe('YouTube video ID to embed (optional)'),
      tasks: z.array(z.string()).optional().describe('Checklist of things done'),
      id: z.string().optional(),
    },
  },
  guard(async ({ title, notes, date, mood, youtube, tasks, id }) => {
    const items = await readCollection('vlog')
    const newId = id ? slugify(id) : uniqueId(slugify(title), listIds(items))
    const entry = {
      id: newId,
      date: date || today(),
      title,
      youtube: youtube || '',
      mood: mood || '📝',
      notes,
      tasks: tasks || [],
    }
    items.unshift(entry)
    const file = await writeCollection('vlog', items)
    return ok(`Added daily-log entry "${title}" (id: ${newId}).\nWrote ${file}\n\n${pretty(entry)}`)
  })
)

server.registerTool(
  'update_vlog_entry',
  {
    title: 'Update daily-log entry',
    description: 'Update fields of a daily-log entry (only the fields you pass change).',
    inputSchema: {
      id: z.string(),
      title: z.string().optional(),
      notes: z.string().optional(),
      date: z.string().optional(),
      mood: z.string().optional(),
      youtube: z.string().optional(),
      tasks: z.array(z.string()).optional(),
    },
  },
  guard(async ({ id, ...patch }) => {
    const items = await readCollection('vlog')
    const idx = findIndexById(items, id)
    if (idx === -1) return fail(`No vlog entry with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    applyPatch(items[idx], patch)
    const file = await writeCollection('vlog', items)
    return ok(`Updated vlog entry "${id}".\nWrote ${file}\n\n${pretty(items[idx])}`)
  })
)

server.registerTool(
  'delete_vlog_entry',
  {
    title: 'Delete daily-log entry',
    description: 'Delete a daily-log entry by id.',
    inputSchema: { id: z.string() },
  },
  guard(async ({ id }) => {
    const items = await readCollection('vlog')
    const next = items.filter((i) => i.id !== id)
    if (next.length === items.length)
      return fail(`No vlog entry with id "${id}". Existing: ${listIds(items).join(', ') || '(none)'}`)
    const file = await writeCollection('vlog', next)
    return ok(`Deleted vlog entry "${id}".\nWrote ${file}`)
  })
)

// ───────────────────────────── BOOT ───────────────────────────
const transport = new StdioServerTransport()
await server.connect(transport)
// Note: never write to stdout here — stdio is the JSON-RPC channel.
console.error(`[portfolio-content-mcp] ready · writing to ${DATA_DIR}`)
