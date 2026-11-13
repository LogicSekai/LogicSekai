-- Migration 0021: OmoRide — Konvoi live & laporan jalan komunitas.
-- Semua waktu di tabel omoride_* disimpan dalam MILIDETIK epoch (kolom *_ms) karena juga ditulis
-- oleh Durable Object ConvoyRoom (workers/omoride-convoy) lewat SQL mentah.
-- Posisi live anggota TIDAK pernah disimpan di D1 — hanya di memori/attachment Durable Object.

CREATE TABLE IF NOT EXISTS omoride_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    ghost_default INTEGER NOT NULL DEFAULT 0,
    created_ms INTEGER NOT NULL,
    updated_ms INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_convoys (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    leader_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dest_lat REAL,
    dest_lng REAL,
    dest_name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_ms INTEGER NOT NULL,
    ended_ms INTEGER
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_convoys_leader ON omoride_convoys(leader_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_convoys_status ON omoride_convoys(status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_convoy_members (
    convoy_id TEXT NOT NULL REFERENCES omoride_convoys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_ms INTEGER NOT NULL,
    left_ms INTEGER,
    PRIMARY KEY (convoy_id, user_id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_members_user ON omoride_convoy_members(user_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_reports (
    id TEXT PRIMARY KEY,
    convoy_id TEXT REFERENCES omoride_convoys(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    note TEXT,
    is_public INTEGER NOT NULL DEFAULT 1,
    created_ms INTEGER NOT NULL,
    expires_ms INTEGER NOT NULL,
    confirms INTEGER NOT NULL DEFAULT 0,
    clears INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_reports_geo ON omoride_reports(lat, lng);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_reports_expires ON omoride_reports(expires_ms);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_report_votes (
    report_id TEXT NOT NULL REFERENCES omoride_reports(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL,
    created_ms INTEGER NOT NULL,
    PRIMARY KEY (report_id, user_id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_convoy_invites (
    id TEXT PRIMARY KEY,
    convoy_id TEXT NOT NULL REFERENCES omoride_convoys(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_ms INTEGER NOT NULL,
    responded_ms INTEGER
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_omoride_invites_unique ON omoride_convoy_invites(convoy_id, to_user_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_invites_to ON omoride_convoy_invites(to_user_id, status);
