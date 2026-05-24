-- Migration 0017: create e-learning tables (books + chapters)

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
