/** Tipe & helper bersama untuk tool MCP (baca & tulis). */
import { sql } from 'drizzle-orm'
import type { McpScope } from './scopes'
import type { VerifiedMcpClient } from './auth'

export const SITE_URL = 'https://logicsekai.com'

export interface ToolContext {
    db: any
    client: VerifiedMcpClient
    /** Diisi handler tool tulis; disimpan ke audit log (tanpa isi konten). */
    audit: Record<string, unknown>
}

export interface McpTool {
    name: string
    title: string
    description: string
    /** Scope yang dibutuhkan; array = cukup salah satu. */
    scope: McpScope | McpScope[]
    /** true = tool mengubah data (kena batas laju tulis & dicatat sebagai tools/write). */
    writes?: boolean
    destructive?: boolean
    inputSchema: Record<string, unknown>
    handler: (args: Record<string, any>, ctx: ToolContext) => Promise<unknown>
}

export class ToolInputError extends Error {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function str(args: Record<string, any>, key: string, opts: { required?: boolean; max?: number } = {}): string | undefined {
    const v = args[key]
    if (v === undefined || v === null || v === '') {
        if (opts.required) throw new ToolInputError(`Argumen "${key}" wajib diisi`)
        return undefined
    }
    if (typeof v !== 'string') throw new ToolInputError(`Argumen "${key}" harus string`)
    const t = v.trim()
    if (t.length > (opts.max ?? 200)) throw new ToolInputError(`Argumen "${key}" terlalu panjang`)
    return t
}

export function int(args: Record<string, any>, key: string, def: number, min: number, max: number): number {
    const v = args[key]
    if (v === undefined || v === null) return def
    const n = Number(v)
    if (!Number.isInteger(n)) throw new ToolInputError(`Argumen "${key}" harus bilangan bulat`)
    return Math.min(max, Math.max(min, n))
}

/** Escape karakter wildcard LIKE agar input pengguna diperlakukan literal. */
function likePattern(q: string): string {
    return `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`
}
export function likeEsc(col: any, q: string) {
    return sql`${col} LIKE ${likePattern(q)} ESCAPE '\\'`
}

export function parseList(raw: string | null | undefined): string[] {
    if (!raw) return []
    try {
        const v = JSON.parse(raw)
        return Array.isArray(v) ? v.map(String) : []
    } catch {
        return []
    }
}

export function iso(d: Date | number | null | undefined): string | null {
    if (d === null || d === undefined) return null
    const date = d instanceof Date ? d : new Date(typeof d === 'number' && d < 1e12 ? d * 1000 : d)
    return isNaN(date.getTime()) ? null : date.toISOString()
}
