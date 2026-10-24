/**
 * Error tracking sisi-klien (tanpa dependency).
 * Menangkap error Vue/Nuxt, error JS global, dan promise rejection,
 * lalu mengirim ringkasannya ke /api/client-errors (di-log di server +
 * opsional diteruskan ke Sentry/GlitchTip/Discord via ERROR_WEBHOOK_URL).
 *
 * Hanya aktif di production agar tidak menambah noise saat development.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) return
  if (typeof window === 'undefined') return

  const seen = new Set<string>()
  let sent = 0
  const MAX_PER_SESSION = 25

  const normalize = (err: any) => ({
    message: err?.message ? String(err.message).slice(0, 500) : String(err).slice(0, 500),
    stack: err?.stack ? String(err.stack).slice(0, 2000) : undefined,
  })

  const report = (payload: Record<string, any>) => {
    try {
      if (sent >= MAX_PER_SESSION) return
      const key = `${payload.kind}|${payload.message}|${payload.line ?? ''}`
      if (seen.has(key)) return
      seen.add(key)
      sent++

      const body = JSON.stringify({
        ...payload,
        url: location.href,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        ts: Date.now(),
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/client-errors', new Blob([body], { type: 'application/json' }))
      } else {
        fetch('/api/client-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // jangan pernah biarkan error tracking memunculkan error
    }
  }

  nuxtApp.hook('vue:error', (err) => report({ kind: 'vue:error', ...normalize(err) }))
  nuxtApp.hook('app:error', (err) => report({ kind: 'app:error', ...normalize(err) }))

  window.addEventListener('error', (e) => {
    report({
      kind: 'window.onerror',
      message: String(e.message || 'Unknown error').slice(0, 500),
      source: e.filename,
      line: e.lineno,
      col: e.colno,
      stack: (e.error as any)?.stack ? String((e.error as any).stack).slice(0, 2000) : undefined,
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    report({ kind: 'unhandledrejection', ...normalize((e as PromiseRejectionEvent).reason) })
  })
})
