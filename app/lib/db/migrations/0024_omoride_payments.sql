-- Migration 0024: riwayat pembayaran langganan OmoRide lewat web (Midtrans Snap).
-- id = order_id Midtrans. status: 'pending' | 'paid' | 'failed'. Waktu dalam milidetik epoch.
-- Pembayaran berhasil memperpanjang omoride_entitlements (lihat server/omoride/billing-web.ts).

CREATE TABLE IF NOT EXISTS omoride_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    period TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    snap_token TEXT,
    payment_url TEXT,
    payment_type TEXT,
    transaction_id TEXT,
    expires_after_ms INTEGER,
    created_ms INTEGER NOT NULL,
    paid_ms INTEGER
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_payments_user ON omoride_payments(user_id, created_ms);
