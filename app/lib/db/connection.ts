import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

let db: any;

// Development database connection (SQLite)
function createDevDB() {
  if (process.client) return null;
  
  const sqlite = new Database('./dev.db');
  return drizzleBetterSqlite(sqlite, { schema });
}

// Production database connection (Cloudflare D1)
export function initializeDB(d1Database?: any) {
  if (db) return db;

  if (process.env.NODE_ENV === 'production' && d1Database) {
    // Production: Use Cloudflare D1
    db = drizzle(d1Database, { schema });
  } else if (process.env.NODE_ENV !== 'production') {
    // Development: Use SQLite
    db = createDevDB();
  }

  return db;
}

// Get database instance
export function getDB() {
  return db;
}

export { schema };

// User types
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

// Product Category types
export type ProductCategory = typeof schema.productCategories.$inferSelect;
export type NewProductCategory = typeof schema.productCategories.$inferInsert;