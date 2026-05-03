import { getDB, initializeDB } from '~/lib/db/connection'

/**
 * DB initialization middleware — runs before all other middleware (0.xx < a.xx alphabetically).
 * In production (Cloudflare Pages), passes the D1 binding from the event context.
 * In development, initializes the local SQLite database.
 */
export default defineEventHandler(async (event) => {
  if (getDB()) return // Already initialized (singleton reuse)

  const cloudflare = event.context.cloudflare
  if (cloudflare?.env?.DB) {
    // Production: Cloudflare D1
    initializeDB(cloudflare.env.DB)
  } else if (process.env.NODE_ENV !== 'production') {
    // Development: SQLite
    initializeDB()
  }
})
