/** POST /api/omoride/auth/verify — Body: { code } (6 digit dari email). Menandai akun terverifikasi. */
export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    await confirmVerificationCode(db, me.id, String(body?.code ?? '').trim())
    return { verified: true }
})
