/**
 * PUT /api/omoride/sync/moments/:id?trip=<startMs>&taken=<ms>&lat=&lng= — unggah satu foto momen.
 * Body: JPEG mentah (≤ 8 MB). :id wajib SHA-256 isi foto (diverifikasi), sehingga foto yang sama
 * tidak tersimpan dua kali. Perjalanannya harus sudah ada di cloud.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideTripMoments, omorideTrips } from '~/lib/db/schema'
import { isJpeg, MAX_MOMENT_BYTES, MOMENT_ID, momentKey, parseStartMs, sha256Hex } from '../../../../omoride/cloud-sync'
import { assertQuota, cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

function coord(raw: unknown, max: number): number | null {
    if (typeof raw !== 'string' || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) && Math.abs(n) <= max ? n : null
}

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, true)
    const id = getRouterParam(event, 'id') ?? ''
    if (!MOMENT_ID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Foto tidak valid' })
    const q = getQuery(event)
    const tripStartMs = parseStartMs(q.trip)
    const takenRaw = typeof q.taken === 'string' && /^\d{1,13}$/.test(q.taken) ? Number(q.taken) : 0
    if (tripStartMs == null) throw createError({ statusCode: 400, statusMessage: 'Perjalanan tidak valid' })

    const [trip] = await db.select({ startMs: omorideTrips.startMs }).from(omorideTrips)
        .where(and(eq(omorideTrips.userId, user.id), eq(omorideTrips.startMs, tripStartMs), isNull(omorideTrips.deletedMs))).limit(1)
    if (!trip) throw createError({ statusCode: 409, statusMessage: 'Perjalanan belum ada di cloud' })

    const raw = await readRawBody(event, false)
    const bytes = raw ? new Uint8Array(raw as any) : new Uint8Array()
    if (!bytes.length || bytes.length > MAX_MOMENT_BYTES) throw createError({ statusCode: 413, statusMessage: 'Ukuran foto tidak valid (maks. 8 MB)' })
    if (!isJpeg(bytes)) throw createError({ statusCode: 415, statusMessage: 'Foto harus JPEG' })
    if ((await sha256Hex(bytes)) !== id) throw createError({ statusCode: 400, statusMessage: 'Isi foto tidak cocok' })

    const [old] = await db.select({ deletedMs: omorideTripMoments.deletedMs, tripStartMs: omorideTripMoments.tripStartMs })
        .from(omorideTripMoments).where(and(eq(omorideTripMoments.userId, user.id), eq(omorideTripMoments.id, id))).limit(1)
    const alive = old && old.deletedMs == null
    if (!alive) await assertQuota(db, user.id, bytes.length)

    await cloudBucket(event).put(momentKey(user.id, id), bytes, { httpMetadata: { contentType: 'image/jpeg' } })
    const now = Date.now()
    const row = {
        tripStartMs,
        takenMs: takenRaw,
        lat: coord(q.lat, 90),
        lng: coord(q.lng, 180),
        bytes: bytes.length,
        deletedMs: null,
    }
    await db.insert(omorideTripMoments).values({ userId: user.id, id, createdMs: now, ...row })
        .onConflictDoUpdate({ target: [omorideTripMoments.userId, omorideTripMoments.id], set: row })
    return { success: true, id }
})
