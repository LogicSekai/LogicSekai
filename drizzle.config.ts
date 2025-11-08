import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/lib/db/schema.ts',
  out: './app/lib/db/migrations',
  dialect: 'sqlite',
  // Use local SQLite for development
  dbCredentials: process.env.NODE_ENV === 'production' 
    ? {
        // Production: Cloudflare D1
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_API_TOKEN!,
      }
    : {
        // Development: Local SQLite
        url: './dev.db'
      },
  // Only use d1-http driver for production
  ...(process.env.NODE_ENV === 'production' && { driver: 'd1-http' }),
});