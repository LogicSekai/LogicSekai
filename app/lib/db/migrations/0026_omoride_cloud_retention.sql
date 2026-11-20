-- Migration 0026: masa simpan cadangan cloud OmoRide setelah langganan berakhir.
-- lapsed_ms = kapan pembersih harian pertama kali melihat akun punya data cloud tanpa paket aktif.
-- 90 hari kemudian data cloud dihapus permanen (server/omoride/cloud-retention.ts). Berlangganan
-- lagi → baris dihapus (hitungan batal). Waktu dalam milidetik epoch.

CREATE TABLE IF NOT EXISTS omoride_cloud_retention (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    lapsed_ms INTEGER NOT NULL
);
