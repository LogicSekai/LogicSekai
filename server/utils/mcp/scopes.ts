/**
 * Scope yang bisa diberikan ke klien MCP. Tool hanya terlihat & bisa dipanggil
 * bila klien memiliki scope yang dibutuhkan (least privilege).
 *
 * Scope tulis dipisah dua tingkat:
 *   *:write    → kelola DRAFT (buat, ubah, hapus ke tempat sampah). Tidak bisa
 *                menerbitkan, dan tidak bisa menyentuh konten yang sudah tayang.
 *   *:publish  → tambahan: terbitkan / tarik, serta ubah & hapus konten yang
 *                sudah tayang. Hanya berlaku bersama *:write.
 */
export const MCP_SCOPES = {
    'products:read': 'Cari & baca detail produk yang sudah dipublikasikan',
    'articles:read': 'Cari & baca artikel yang sudah dipublikasikan',
    'elearning:read': 'Baca buku & bab e-learning publik (konten Stellar tidak termasuk)',
    'stats:read': 'Statistik agregat situs (jumlah produk, artikel, pengguna, dll.)',
    'articles:write': 'Kelola draft artikel: buat, ubah, hapus (ke tempat sampah)',
    'articles:publish': 'Terbitkan/tarik artikel & ubah/hapus artikel yang sudah tayang (butuh articles:write)',
    'elearning:write': 'Kelola draft buku & bab e-learning: buat, ubah, urutkan, hapus (ke tempat sampah)',
    'elearning:publish': 'Terbitkan/tarik buku & bab serta ubah/hapus yang sudah tayang (butuh elearning:write)',
} as const

export type McpScope = keyof typeof MCP_SCOPES

/** Scope yang memberi akses tulis (dipakai untuk menampilkan peringatan di UI). */
export const WRITE_SCOPES: McpScope[] = ['articles:write', 'articles:publish', 'elearning:write', 'elearning:publish']

export function isMcpScope(s: unknown): s is McpScope {
    return typeof s === 'string' && Object.prototype.hasOwnProperty.call(MCP_SCOPES, s)
}

export function parseJsonArray(raw: string | null | undefined): string[] {
    if (!raw) return []
    try {
        const v = JSON.parse(raw)
        return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
    } catch {
        return []
    }
}
