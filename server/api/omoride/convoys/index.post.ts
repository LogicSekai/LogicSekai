/**
 * POST /api/omoride/convoys — buat konvoi baru; pembuat otomatis jadi leader.
 * Body: { name, destination?: { lat, lng, name } }
 * Balasan: konvoi (termasuk `code` 6 karakter, `joinUrl`, `wsPath`).
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import { omorideConvoyMembers, omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))

    const name = cleanText(body?.name, 60) || `Konvoi ${user.name || user.username}`
    let dest: { lat: number; lng: number; name: string } | null = null
    if (body?.destination) {
        const d = body.destination
        if (!isValidLatLng(d.lat, d.lng)) throw createError({ statusCode: 400, statusMessage: 'Invalid destination' })
        dest = { lat: d.lat, lng: d.lng, name: cleanText(d.name, 80) }
    }

    const [led] = await db.select({ n: sql<number>`count(*)` })
        .from(omorideConvoys)
        .where(and(eq(omorideConvoys.leaderId, user.id), eq(omorideConvoys.status, 'active')))
    if (Number(led?.n ?? 0) >= OMO_MAX_ACTIVE_LED) {
        throw createError({ statusCode: 409, statusMessage: `Maksimal ${OMO_MAX_ACTIVE_LED} konvoi aktif yang Anda pimpin. Akhiri salah satu dulu.` })
    }

    const now = Date.now()
    const id = omoNewId()
    let code = ''
    for (let i = 0; i < 6; i++) {
        const candidate = generateConvoyCode()
        const [exists] = await db.select({ id: omorideConvoys.id }).from(omorideConvoys).where(eq(omorideConvoys.code, candidate)).limit(1)
        if (!exists) { code = candidate; break }
    }
    if (!code) throw createError({ statusCode: 503, statusMessage: 'Could not allocate convoy code, try again' })

    const row = {
        id, code, name, leaderId: user.id,
        destLat: dest?.lat ?? null, destLng: dest?.lng ?? null, destName: dest?.name ?? null,
        status: 'active' as const, createdMs: now, endedMs: null,
    }
    await db.insert(omorideConvoys).values(row)
    await db.insert(omorideConvoyMembers).values({ convoyId: id, userId: user.id, role: 'leader', joinedMs: now })

    await callConvoyRoom(event, id, '/init', { convoyId: id, leaderId: user.id, name, destination: dest })

    setResponseStatus(event, 201)
    return { convoy: { ...convoyDto(row), myRole: 'leader' } }
})
