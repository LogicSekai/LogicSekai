const Database = require('better-sqlite3');
const db = new Database('./dev.db');

// Also add saved_token columns to donations if not exists (migration 0016)
try {
    db.exec("ALTER TABLE donations ADD COLUMN saved_token_id TEXT;");
    console.log("Added saved_token_id to donations");
} catch (e) {
    if (!e.message.includes('duplicate')) console.log("saved_token_id already exists");
}
try {
    db.exec("ALTER TABLE donations ADD COLUMN saved_token_masked TEXT;");
    console.log("Added saved_token_masked to donations");
} catch (e) {
    if (!e.message.includes('duplicate')) console.log("saved_token_masked already exists");
}

// Migration 0017: elearning tables
db.exec(`
CREATE TABLE IF NOT EXISTS elearning_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    thumbnail TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_elearning_books_slug ON elearning_books(slug);
CREATE INDEX IF NOT EXISTS idx_elearning_books_status ON elearning_books(status);
CREATE TABLE IF NOT EXISTS elearning_chapters (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES elearning_books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'blog',
    content TEXT,
    video_url TEXT,
    thumbnail TEXT,
    stellar_only INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_elearning_chapters_book_id ON elearning_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_elearning_chapters_order ON elearning_chapters(book_id, "order");
`);

console.log('Migration 0017 (elearning) applied successfully');
db.close();
