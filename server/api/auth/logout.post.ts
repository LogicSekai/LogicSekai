import { initializeDB } from '~/lib/db/connection'
import { destroyCurrentSession, clearSessionCookies } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    // Hapus sesi di database + kedua cookie
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (db) await destroyCurrentSession(event, db)
    else clearSessionCookies(event)

    return {
        success: true,
        message: 'Logged out successfully'
    }
});