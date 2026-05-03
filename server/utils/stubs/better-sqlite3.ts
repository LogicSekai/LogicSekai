/**
 * Production stub for better-sqlite3 (Cloudflare Workers build)
 * This module is never called in production — all SQLite code paths
 * are guarded by `process.env.NODE_ENV !== 'production'`.
 */
class Database {
  constructor(_path: string, _options?: any) {}
  exec(_sql: string) { return this }
  prepare(_sql: string) { return { run: () => {}, get: () => null, all: () => [] } as any }
  close() {}
}

export default Database
