-- Migration 0019: sesi login berbasis database (menggantikan cookie JSON yang bisa dipalsukan)

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
