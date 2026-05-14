import { getDB } from '~/lib/db/connection'
import { contactMessages } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // Auth — superadmin only
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (sessionData?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID diperlukan' })

    const body = await readBody(event)
    const { status, adminNote } = body ?? {}

    const validStatuses = ['unread', 'read', 'replied', 'archived']
    if (status && !validStatuses.includes(status)) {
        throw createError({ statusCode: 400, statusMessage: 'Status tidak valid' })
    }

    try {
        const db = getDB()
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        }

        if (status) {
            updateData.status = status
            if (status === 'read' || status === 'replied') {
                updateData.readAt = new Date()
            }
        }

        if (adminNote !== undefined) {
            if (adminNote && adminNote.length > 2000) {
                throw createError({ statusCode: 400, statusMessage: 'Catatan admin terlalu panjang.' })
            }
            updateData.adminNote = adminNote ?? null
        }

        const [updated] = await db
            .update(contactMessages)
            .set(updateData)
            .where(eq(contactMessages.id, id))
            .returning()

        if (!updated) throw createError({ statusCode: 404, statusMessage: 'Pesan tidak ditemukan' })

        return { success: true, message: updated }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, statusMessage: error?.message || 'Internal server error' })
    }
})
