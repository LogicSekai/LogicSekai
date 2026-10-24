/**
 * Rate limiting middleware.
 *
 * CATATAN PENTING: penyimpanan in-memory (Map) TIDAK andal di Cloudflare Workers
 * karena tiap request bisa berjalan di isolate berbeda. Ini hanya jaring pengaman
 * sekunder. Pertahanan UTAMA yang disarankan:
 *   1) Cloudflare Rate Limiting Rules (dashboard / WAF) — rekomendasi, tanpa kode.
 *   2) Cloudflare Rate Limiting binding (env.AUTH_RATE_LIMITER / API_RATE_LIMITER)
 *      — dipakai otomatis bila tersedia (lihat wrangler.toml).
 *
 * Middleware ini menerapkan limit lebih KETAT untuk endpoint auth/sensitif.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const memStore = new Map<string, RateLimitEntry>()
const WINDOW_MS = 15 * 60 * 1000 // 15 menit
const DEFAULT_MAX = 100
const SENSITIVE_MAX = 15
// /api/mcp: AI agent wajar melakukan banyak panggilan beruntun. Endpoint ini sudah
// dilindungi signature per klien + batas tulis per klien (server/utils/mcp/protocol.ts),
// jadi diberi jatah sendiri yang lebih longgar dan tidak memakan jatah API umum.
const MCP_MAX = 600

// Endpoint sensitif (brute-force / spam) — limit lebih ketat
const SENSITIVE_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/password',
  '/api/auth/verify-email',
  '/api/setup/superadmin',
  '/api/contact',
]

function getClientIP(event: any): string {
  const ip =
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-forwarded-for') ||
    getHeader(event, 'x-real-ip')
  if (ip) return ip.split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  // Hanya jaga endpoint API; lewati aset internal & health check
  if (!pathname.startsWith('/api/')) return
  if (pathname.startsWith('/api/health')) return
  if (getMethod(event) === 'OPTIONS') return

  const isSensitive = SENSITIVE_PATHS.some((p) => pathname === p || pathname.startsWith(p))
  const isMcp = pathname === '/api/mcp'
  const clientIP = getClientIP(event)

  // 1) Pertahanan utama: Cloudflare Rate Limiting binding (bila dikonfigurasi)
  const cfEnv: any = (event as any).context?.cloudflare?.env
  const limiter = isSensitive ? cfEnv?.AUTH_RATE_LIMITER : cfEnv?.API_RATE_LIMITER
  if (limiter?.limit && !isMcp) {
    try {
      const { success } = await limiter.limit({ key: `${clientIP}:${pathname}` })
      if (!success) {
        throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please slow down.' })
      }
      return
    } catch (e: any) {
      if (e?.statusCode === 429) throw e
      // Binding error → lanjut ke fallback in-memory
    }
  }

  // 2) Fallback in-memory (per-isolate; hanya jaring pengaman)
  const now = Date.now()
  if (Math.random() < 0.01) {
    for (const [k, v] of memStore.entries()) {
      if (now > v.resetTime) memStore.delete(k)
    }
  }

  const baseMax = isSensitive ? SENSITIVE_MAX : isMcp ? MCP_MAX : DEFAULT_MAX
  const key = `${clientIP}:${isSensitive ? 'auth' : isMcp ? 'mcp' : 'api'}`
  let entry = memStore.get(key)
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + WINDOW_MS }
    memStore.set(key, entry)
  }
  entry.count++

  // Admin terautentikasi mendapat limit lebih tinggi
  const authContext: any = event.context.auth
  const max = authContext?.isAdmin?.() ? baseMax * 3 : baseMax

  setHeader(event, 'X-RateLimit-Limit', String(max))
  setHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, max - entry.count)))
  setHeader(event, 'X-RateLimit-Reset', String(entry.resetTime))

  if (entry.count > max) {
    const retry = Math.ceil((entry.resetTime - now) / 1000)
    setHeader(event, 'Retry-After', String(retry))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Try again in ${retry} seconds`,
    })
  }
})
