import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>>;

export function initializeDB(d1Database: any) {
  if (!db) {
    db = drizzle(d1Database, { schema });
  }
  return db;
}

export { schema };
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;