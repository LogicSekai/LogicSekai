/**
 * POST /api/omoride/account/delete — hapus data OmoRide atau seluruh akun Logic Sekai.
 * Body: { password, scope: 'omoride' | 'all' }. Dipakai aplikasi OmoRide (Bearer) dan halaman web
 * /omoride/hapus-akun (cookie sesi). Kata sandi wajib agar tidak bisa dipicu dari sesi yang dicuri.
 *
 * Akun pembuat konten / admin tidak bisa dihapus sendiri di sini (ada produk, artikel, pembayaran
 * kreator) → diminta menghubungi dukungan; data OmoRide-nya tetap bisa dihapus.
 * Langganan Google Play TIDAK otomatis berhenti — pengguna membatalkannya di Play Store.
 */
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from '~/lib/db/schema'
import { deleteLogicSekaiAccount, deleteOmoRideData, type DeleteScope } from '../../../omoride/account-delete'

export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    const scope: DeleteScope = body?.scope === 'all' ? 'all' : body?.scope === 'omoride' ? 'omoride' : (() => {
        throw createError({ statusCode: 400, statusMessage: 'Pilih apa yang dihapus' })
    })()
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!password || password.length > 200) throw createError({ statusCode: 400, statusMessage: 'Kata sandi wajib diisi' })

    const [user] = await db.select().from(users).where(eq(users.id, me.id)).limit(1)
    if (!user || user.deleted) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
    if (!(await bcrypt.compare(password, user.password))) throw createError({ statusCode: 401, statusMessage: 'Kata sandi salah' })
    if (scope === 'all' && user.role !== 'user') {
        throw createError({
            statusCode: 409,
            statusMessage: 'Akun kreator/admin tidak bisa dihapus sendiri. Hubungi dukungan Logic Sekai; data OmoRide tetap bisa dihapus.',
        })
    }

    const result = await deleteOmoRideData(event, db, user.id)
    if (scope === 'all') await deleteLogicSekaiAccount(db, user.id)
    return { success: true, scope, ...result }
})
