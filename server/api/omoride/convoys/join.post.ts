/**
 * POST /api/omoride/convoys/join — gabung konvoi aktif lewat kode 6 karakter.
 * Body: { code }  (tautan /omo/konvoi/gabung?kode=XXXXXX memakai endpoint ini juga)
 */
import { eq } from 'drizzle-orm'
import { omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    const code = String(body?.code ?? '').trim().toUpperCase()
    if (!OMO_CODE_PATTERN.test(code)) throw createError({ statusCode: 400, statusMessage: 'Kode konvoi tidak valid' })

    const [convoy] = await db.select().from(omorideConvoys).where(eq(omorideConvoys.code, code)).limit(1)
    if (!convoy || convoy.status !== 'active') throw createError({ statusCode: 404, statusMessage: 'Konvoi tidak ditemukan atau sudah selesai' })

    return { convoy: await joinConvoy(db, convoy, user.id) }
})

