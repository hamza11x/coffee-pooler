/**
 * In-memory rate limiter for API routes.
 * Tracks request counts per IP with a sliding window.
 * Works in Node.js runtime (API routes). Not for Edge runtime.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rateLimit'
 *   const { success, remaining } = rateLimit(req, { limit: 5, windowMs: 60_000 })
 *   if (!success) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
 */

// ip → { count, resetAt }
const store = new Map()

// Clean up expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store) {
    if (record.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * @param {Request} req
 * @param {{ limit?: number, windowMs?: number }} options
 * @returns {{ success: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(req, { limit = 10, windowMs = 60_000 } = {}) {
  // Extract IP from common proxy headers or fall back to a generic key
  const ip =
    req.headers.get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get?.('x-real-ip') ||
    'global'

  const now = Date.now()
  const record = store.get(ip)

  if (!record || record.resetAt < now) {
    // First request in this window
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  record.count++

  if (record.count > limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }

  return { success: true, remaining: limit - record.count, resetAt: record.resetAt }
}
