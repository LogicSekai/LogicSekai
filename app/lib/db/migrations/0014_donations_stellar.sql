-- Migration: Add stellar badge to users and create donations table

-- Add stellar fields to users table
ALTER TABLE users ADD COLUMN stellar_badge INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN stellar_expires_at INTEGER;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT NOT NULL DEFAULT 'pending',
    snap_token TEXT,
    payment_url TEXT,
    payment_method TEXT,
    midtrans_transaction_id TEXT,
    midtrans_status_code TEXT,
    stellar_granted INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
