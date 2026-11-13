/**
 * GET /api/omoride/convoys/:id/ws — di produksi, upgrade WebSocket DICEGAT lebih dulu oleh entry
 * Worker kustom (server/omoride/entry.cloudflare-pages.ts) dan diteruskan ke Durable Object.
 * Handler ini hanya tercapai bila request bukan upgrade, atau saat `nuxt dev` (tanpa Durable Object).
 */
export default defineEventHandler(() => {
    throw createError({
        statusCode: 426,
        statusMessage: 'WebSocket upgrade required (realtime hanya tersedia di build Cloudflare / wrangler pages dev)',
    })
})
