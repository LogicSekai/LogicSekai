// Server plugin to initialize database connection
export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === 'production') {
    // In production (Cloudflare), the database will be available as env.DB
    // This is handled automatically by Cloudflare Workers runtime
    console.log('Production environment detected - using Cloudflare D1');
  } else {
    // In development, initialize SQLite database
    const { initializeDB } = await import('~/lib/db/connection');
    try {
      const db = initializeDB();
      if (db) {
        console.log('Development database initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize development database:', error);
    }
  }
});