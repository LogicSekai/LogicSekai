/**
 * Scope yang bisa diberikan ke klien MCP. Tool hanya terlihat & bisa dipanggil
 * bila klien memiliki scope yang dibutuhkan (least privilege).
 */
export const MCP_SCOPES = {
    'products:read': 'Cari & baca detail produk yang sudah dipublikasikan',
    'articles:read': 'Cari & baca artikel yang sudah dipublikasikan',
    'elearning:read': 'Baca buku & bab e-learning publik (konten Stellar tidak termasuk)',
    'stats:read': 'Statistik agregat situs (jumlah produk, artikel, pengguna, dll.)',
} as const

export type McpScope = keyof typeof MCP_SCOPES

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
