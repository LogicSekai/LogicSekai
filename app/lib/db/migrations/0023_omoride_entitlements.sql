-- Migration 0023: hak langganan OmoRide (Plus / Klub). Satu baris = hak yang berlaku saat ini per akun.
-- source: 'admin' (diberikan manual, mis. beta), 'web' (Midtrans), 'play' (Google Play Billing).
-- status: 'active' | 'grace' (pembayaran bermasalah, masih aktif) | 'canceled' (berhenti di expires_ms) | 'revoked'.
-- Waktu dalam milidetik epoch; expires_ms NULL = tanpa batas (hanya untuk 'admin').

CREATE TABLE IF NOT EXISTS omoride_entitlements (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    expires_ms INTEGER,
    auto_renew INTEGER NOT NULL DEFAULT 0,
    external_ref TEXT,
    note TEXT,
    created_ms INTEGER NOT NULL,
    updated_ms INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_entitlements_expires ON omoride_entitlements(expires_ms);
