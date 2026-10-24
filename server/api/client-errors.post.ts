/**
 * Menerima laporan error dari klien (lihat app/plugins/error-tracking.client.ts).
 * - Selalu mencatat ke log Workers (terlihat via `wrangler pages deployment tail`).
 * - Opsional meneruskan ke webhook eksternal (Sentry/GlitchTip/Discord) bila
 *   ERROR_WEBHOOK_URL diset.
 *
 * Catatan: build production menghapus semua pemanggilan `console.*` (lihat
 * nuxt.config esbuild.drop). Karena itu kita mengakses console lewat indireksi
 * (computed property) agar log error tetap ada di production.
 */
const _console: any = (globalThis as any)['con' + 'sole']

export default defineEventHandler(async (event) => {
  try {
    const raw = await readBody(event).catch(() => null)
    if (!raw || typeof raw !== 'object') {
      setResponseStatus(event, 204)
      return ''
    }

    const safe = {
      kind: String(raw.kind ?? 'unknown').slice(0, 50),
      message: String(raw.message ?? '').slice(0, 500),
      stack: raw.stack ? String(raw.stack).slice(0, 2000) : undefined,
      source: raw.source ? String(raw.source).slice(0, 300) : undefined,
      line: typeof raw.line === 'number' ? raw.line : undefined,
      col: typeof raw.col === 'number' ? raw.col : undefined,
      url: raw.url ? String(raw.url).slice(0, 300) : undefined,
      referrer: raw.referrer ? String(raw.referrer).slice(0, 300) : undefined,
      userAgent: raw.userAgent ? String(raw.userAgent).slice(0, 300) : undefined,
      ts: typeof raw.ts === 'number' ? raw.ts : Date.now(),
    }

    if (!safe.message) {
      setResponseStatus(event, 204)
      return ''
    }

    _console?.error?.('[client-error]', JSON.stringify(safe))

    const webhook = process.env.ERROR_WEBHOOK_URL
    if (webhook) {
      const forward = fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safe),
      }).catch(() => {})
      // fire-and-forget tanpa menahan response
      const ctx: any = (event as any).context?.cloudflare?.context
      if (ctx?.waitUntil) ctx.waitUntil(forward)
    }

    setResponseStatus(event, 204)
    return ''
  } catch {
    setResponseStatus(event, 204)
    return ''
  }
})
