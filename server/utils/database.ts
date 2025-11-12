import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import Database from 'better-sqlite3'
import * as schema from '~/lib/db/schema'

let db: any

export function getDatabase() {
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      // Development: use SQLite
      const sqlite = new Database('./dev.db')
      db = drizzle(sqlite, { schema })
    } else {
      // Production: use Cloudflare D1
      // This will be available in production environment
      db = drizzleD1((globalThis as any).DB, { schema })
    }
  }
  return db
}