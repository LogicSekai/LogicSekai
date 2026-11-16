/**
 * Cadangan & sinkron cloud OmoRide (paket Plus/Klub). Rencana: OmoRide docs/rencana-langganan.md §4.1.
 *
 * - Perjalanan diidentifikasi per akun dengan `startMs` (stabil antar-HP). Ringkasan di D1
 *   (`omoride_trips`), jejak GPS di R2 sebagai teks ringkas ter-gzip.
 * - Foto momen: id = SHA-256 isi foto (diverifikasi server), berkas di R2.
 * - Hapus = penanda `deleted_ms` (HP lain ikut menghapus); berkas R2 langsung dihapus.
 * - Semua berkas di prefix `private/omoride/<userId>/` — diblokir dari /api/files publik.
 * - Unggah butuh `limits.cloudSync`; unduh (pemulihan) tetap boleh agar data tidak tersandera.
 *
 * Modul ini murni (tanpa auto-import Nitro) agar bisa diuji unit.
 */

/** Prefix R2 yang TIDAK boleh disajikan /api/files (data pribadi). */
export const PRIVATE_PREFIX = 'private/'

export const CLOUD_QUOTA_BYTES = 5 * 1024 ** 3
export const MAX_POINTS_CHARS = 6_000_000
export const MAX_MOMENT_BYTES = 8 * 1024 * 1024
export const TRIP_CATEGORIES = ['PERSONAL', 'BUSINESS'] as const

export const MOMENT_ID = /^[0-9a-f]{64}$/
/** Jejak GPS ringkas dari aplikasi: bilangan bulat delta "dt,dlat,dlng,spd;..." (lihat TripCloudCodec). */
const POINTS_TEXT = /^[0-9,;-]*$/
const VERSION = /^[0-9a-f]{8,64}$/

export function userPrefix(userId: string) {
    return `${PRIVATE_PREFIX}omoride/${userId}/`
}
export function pointsKey(userId: string, startMs: number) {
    return `${userPrefix(userId)}trips/${startMs}.txt.gz`
}
export function momentKey(userId: string, id: string) {
    return `${userPrefix(userId)}moments/${id}.jpg`
}

/** Kunci R2 pribadi (tidak boleh disajikan rute berkas publik). */
export function isPrivateKey(key: string): boolean {
    // Normalisasi ringan: buang garis miring awal & segmen "./" agar tidak bisa diakali.
    const k = key.replace(/^\/+/, '').replace(/(^|\/)\.\//g, '$1')
    return k.toLowerCase().startsWith(PRIVATE_PREFIX)
}

/** startMs dari parameter rute: bilangan bulat ms epoch yang masuk akal (2020–2100). */
export function parseStartMs(raw: unknown): number | null {
    if (typeof raw !== 'string' || !/^\d{13}$/.test(raw)) return null
    const n = Number(raw)
    return n >= 1_577_836_800_000 && n < 4_102_444_800_000 ? n : null
}

export interface TripInput {
    endMs: number
    distanceM: number
    movingMs: number
    maxSpeed: number
    energyKwh: number
    costRp: number
    category: string
    note: string
    startPlace: string | null
    endPlace: string | null
    version: string
    points: string
    pointsCount: number
}

function num(v: unknown, min: number, max: number): number | null {
    return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null
}
function str(v: unknown, max: number): string | null {
    if (typeof v !== 'string') return null
    return v.slice(0, max)
}

/** Validasi badan PUT perjalanan. Mengembalikan pesan galat (string) bila tidak valid. */
export function validateTrip(body: any, startMs: number): TripInput | string {
    if (!body || typeof body !== 'object') return 'Badan permintaan tidak valid'
    const endMs = num(body.endMs, startMs, startMs + 7 * 24 * 3_600_000)
    const distanceM = num(body.distanceM, 0, 5_000_000)
    const movingMs = num(body.movingMs, 0, 7 * 24 * 3_600_000)
    const maxSpeed = num(body.maxSpeed, 0, 400)
    const energyKwh = num(body.energyKwh, 0, 10_000)
    const costRp = num(body.costRp, 0, 1e9)
    const pointsCount = num(body.pointsCount, 0, 1_000_000)
    if (endMs == null || distanceM == null || movingMs == null || maxSpeed == null || energyKwh == null || costRp == null || pointsCount == null) {
        return 'Data perjalanan tidak valid'
    }
    const category = (TRIP_CATEGORIES as readonly string[]).includes(body.category) ? body.category as string : null
    if (!category) return 'Kategori tidak valid'
    if (typeof body.version !== 'string' || !VERSION.test(body.version)) return 'Versi tidak valid'
    const points = typeof body.points === 'string' ? body.points : ''
    if (points.length > MAX_POINTS_CHARS || !POINTS_TEXT.test(points)) return 'Jejak GPS tidak valid'
    return {
        endMs, distanceM, movingMs, maxSpeed, energyKwh, costRp, category,
        note: str(body.note, 500) ?? '',
        startPlace: str(body.startPlace, 200),
        endPlace: str(body.endPlace, 200),
        version: body.version,
        points,
        pointsCount: Math.round(pointsCount),
    }
}

export async function sha256Hex(buf: ArrayBuffer | Uint8Array): Promise<string> {
    const d = await crypto.subtle.digest('SHA-256', buf as ArrayBuffer)
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** JPEG (FF D8 FF) — satu-satunya format yang dikirim aplikasi. */
export function isJpeg(bytes: Uint8Array): boolean {
    return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

export async function gzipText(text: string): Promise<Uint8Array> {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function gunzipText(data: ArrayBuffer | Uint8Array): Promise<string> {
    const stream = new Blob([data as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
    return await new Response(stream).text()
}

/** Hapus semua berkas cloud akun (hapus akun / data OmoRide). */
export async function deleteAllCloudFiles(bucket: any, userId: string): Promise<number> {
    const prefix = userPrefix(userId)
    let cursor: string | undefined
    let removed = 0
    do {
        const page = await bucket.list({ prefix, cursor, limit: 1000 })
        const keys: string[] = page.objects.map((o: any) => o.key)
        if (keys.length) {
            await bucket.delete(keys)
            removed += keys.length
        }
        cursor = page.truncated ? page.cursor : undefined
    } while (cursor)
    return removed
}

export function tripDto(r: any) {
    return {
        startMs: r.startMs,
        endMs: r.endMs,
        distanceM: r.distanceM,
        movingMs: r.movingMs,
        maxSpeed: r.maxSpeed,
        energyKwh: r.energyKwh,
        costRp: r.costRp,
        category: r.category,
        note: r.note ?? '',
        startPlace: r.startPlace ?? null,
        endPlace: r.endPlace ?? null,
        version: r.version,
        pointsCount: r.pointsCount ?? 0,
        updatedMs: r.updatedMs,
        deleted: r.deletedMs != null,
    }
}

export function momentDto(r: any) {
    return {
        id: r.id,
        tripStartMs: r.tripStartMs,
        takenMs: r.takenMs,
        lat: r.lat ?? null,
        lng: r.lng ?? null,
        bytes: r.bytes,
        deleted: r.deletedMs != null,
    }
}
