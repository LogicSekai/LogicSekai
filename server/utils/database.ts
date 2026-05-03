import { getDB } from '~/lib/db/connection'

export function getDatabase() {
  const db = getDB()
  if (!db) throw new Error('Database not initialized')
  return db
}