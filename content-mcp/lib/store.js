// Read/write helpers for the portfolio's JSON content files.
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Where is the portfolio project? Configurable via PORTFOLIO_DIR; otherwise
// assume it sits next to this MCP server (../portfolio).
const PORTFOLIO_DIR = process.env.PORTFOLIO_DIR
  ? path.resolve(process.env.PORTFOLIO_DIR)
  : path.resolve(__dirname, '..', '..', 'portfolio')

export const DATA_DIR = path.join(PORTFOLIO_DIR, 'src', 'data')

const FILES = {
  projects: 'projects.json',
  blog: 'blog.json',
  vlog: 'vlog.json',
}

export async function readCollection(kind) {
  const file = path.join(DATA_DIR, FILES[kind])
  try {
    const raw = await fs.readFile(file, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw new Error(`Could not read ${file}: ${e.message}`)
  }
}

export async function writeCollection(kind, data) {
  const file = path.join(DATA_DIR, FILES[kind])
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  return file
}

export function slugify(s) {
  return (
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'item'
  )
}

export function uniqueId(base, existingIds) {
  let id = base
  let n = 2
  while (existingIds.includes(id)) id = `${base}-${n++}`
  return id
}

export function estimateReadingTime(body) {
  const text = Array.isArray(body) ? body.join(' ') : String(body || '')
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

// Accept body as an array of paragraphs OR a single string (split on blank lines).
export function normalizeBody(body) {
  if (Array.isArray(body)) return body.map((p) => String(p).trim()).filter(Boolean)
  return String(body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export { PORTFOLIO_DIR }
