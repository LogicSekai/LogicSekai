/**
 * Avatar pengguna untuk OmoRide (konvoi, undangan): selalu berupa URL pendek.
 *
 * Avatar di `users.avatar` bisa berupa path R2 (`/api/files/uploads/avatars/…`), URL https, atau
 * (akun lama) data URI base64 puluhan KB. Data URI terlalu besar untuk header WebSocket konvoi,
 * sehingga dulu dibuang dan anggota tampil tanpa foto. Data URI kini diganti dengan URL
 * `/api/omoride/avatars/:userId?v=<hash>` yang menyajikan gambarnya sebagai berkas biasa.
 */

const MAX_URL = 300

/** FNV-1a 32-bit → 8 hex; cukup untuk cache-buster (berubah bila avatar diganti). */
function shortHash(s: string): string {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0).toString(16).padStart(8, '0')
}

export function omoAvatarUrl(userId: string, raw: unknown): string | null {
    if (typeof raw !== 'string' || !raw) return null
    if (raw.length <= MAX_URL && (raw.startsWith('/') || raw.startsWith('https://'))) return raw
    if (raw.startsWith('data:image/')) return `/api/omoride/avatars/${encodeURIComponent(userId)}?v=${shortHash(raw)}`
    return null
}
