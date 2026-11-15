/**
 * GET /api/omoride/avatars/:userId — foto profil sebagai berkas gambar (untuk konvoi OmoRide).
 *
 * Avatar data URI (akun lama) didekode dan disajikan langsung; avatar berupa URL dialihkan ke
 * URL tersebut. Publik seperti foto profil di situs, tetapi hanya untuk akun aktif. URL yang
 * dibagikan memakai `?v=<hash>` sehingga boleh di-cache lama.
 */
import { eq } from 'drizzle-orm'
import { users } from '~/lib/db/schema'

const DATA_URI = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/
const MAX_BYTES = 2 * 1024 * 1024

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') || ''
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    const db = getOmoDb(event)
    const [row] = await db.select({ avatar: users.avatar, suspended: users.suspended, deleted: users.deleted })
        .from(users).where(eq(users.id, id)).limit(1)
    const avatar = row && !row.suspended && !row.deleted ? row.avatar : null
    if (!avatar) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    if (avatar.startsWith('/') || avatar.startsWith('https://')) {
        return sendRedirect(event, avatar, 302)
    }
    const m = DATA_URI.exec(avatar)
    if (!m) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    const bytes = Buffer.from(m[2]!.replace(/\s/g, ''), 'base64')
    if (bytes.length === 0 || bytes.length > MAX_BYTES) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    setHeader(event, 'Content-Type', m[1] === 'image/jpg' ? 'image/jpeg' : m[1]!)
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    // Dengan ?v=<hash> konten tidak berubah; tanpa itu cukup sebentar.
    setHeader(event, 'Cache-Control', getQuery(event).v ? 'public, max-age=604800, immutable' : 'public, max-age=300')
    return bytes
})
