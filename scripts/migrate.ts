import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

async function runMigrations() {
  console.log('🔄 Running database migrations...')
  
  try {
    // Create database connection
    const sqlite = new Database('./data/database.db')
    const db = drizzle(sqlite)

    // Run migrations
    await migrate(db, { 
      migrationsFolder: './drizzle',
      migrationsTable: 'migrations_history'
    })
    
    console.log('✅ Database migrations completed successfully!')
    
    // Close database connection
    sqlite.close()
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}

export { runMigrations }