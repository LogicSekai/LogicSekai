-- Migration 0022: kode verifikasi email (OTP 6 digit) — dipakai pendaftaran dari aplikasi OmoRide.
-- Kode tidak pernah disimpan mentah: code_hash = hex(SHA-256(user_id || ':' || kode)).
-- Waktu dalam milidetik epoch.

CREATE TABLE IF NOT EXISTS email_verification_codes (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_ms INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_sent_ms INTEGER NOT NULL,
    window_start_ms INTEGER NOT NULL,
    sent_in_window INTEGER NOT NULL DEFAULT 1
);
