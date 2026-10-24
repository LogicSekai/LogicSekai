/**
 * Health check ringan untuk monitor uptime eksternal (mis. UptimeRobot).
 * Dilewati oleh rate-limit middleware (lihat server/middleware/rate-limit.ts).
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { status: 'ok', ts: Date.now() }
})
