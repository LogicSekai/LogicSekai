-- Migration 0025: cadangan & sinkron cloud OmoRide (paket Plus/Klub).
-- Perjalanan diidentifikasi per akun dengan start_ms (waktu mulai, ms epoch) — stabil antar-HP.
-- Jejak GPS & foto momen disimpan di R2 (prefix private/omoride/<userId>/, tidak disajikan publik).
-- deleted_ms = penanda hapus agar HP lain ikut menghapus. Waktu dalam milidetik epoch.

CREATE TABLE IF NOT EXISTS omoride_trips (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_ms INTEGER NOT NULL,
    end_ms INTEGER NOT NULL,
    distance_m REAL NOT NULL,
    moving_ms INTEGER NOT NULL,
    max_speed REAL NOT NULL,
    energy_kwh REAL NOT NULL,
    cost_rp REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    start_place TEXT,
    end_place TEXT,
    version TEXT NOT NULL,
    points_count INTEGER NOT NULL DEFAULT 0,
    points_bytes INTEGER NOT NULL DEFAULT 0,
    updated_ms INTEGER NOT NULL,
    deleted_ms INTEGER,
    PRIMARY KEY (user_id, start_ms)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS omoride_trip_moments (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    trip_start_ms INTEGER NOT NULL,
    taken_ms INTEGER NOT NULL,
    lat REAL,
    lng REAL,
    bytes INTEGER NOT NULL,
    created_ms INTEGER NOT NULL,
    deleted_ms INTEGER,
    PRIMARY KEY (user_id, id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_omoride_trip_moments_trip ON omoride_trip_moments(user_id, trip_start_ms);
