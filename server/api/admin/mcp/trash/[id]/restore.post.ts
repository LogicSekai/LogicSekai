/** POST /api/admin/mcp/trash/:id/restore — pulihkan konten yang dihapus agent (status asli dipertahankan). */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpTrash } from '~/lib/db/schema'
import { restoreSnapshot } from '~~/server/utils/mcp/tools-write'
import { ToolInputError } from '~~/server/utils/mcp/tool-types'
import { writeMcpAudit } from '~~/server/utils/mcp/auth'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

    const [t] = await db.select().from(mcpTrash).where(eq(mcpTrash.id, id)).limit(1)
    if (!t) throw createError({ statusCode: 404, statusMessage: 'Item tidak ditemukan' })
    if (t.restoredAt) throw createError({ statusCode: 409, statusMessage: 'Item sudah dipulihkan' })

    try {
        const result = await restoreSnapshot(db, t.entityType, JSON.parse(t.snapshot))
        await db.update(mcpTrash).set({ restoredAt: new Date() }).where(eq(mcpTrash.id, t.id))
        await writeMcpAudit(db, event, {
            clientId: t.clientId, action: 'trash_restored_by_admin', success: true,
            metadata: { by: event.context.user?.username ?? null, type: t.entityType, entityId: t.entityId },
        })
        return { success: true, ...result }
    } catch (e: any) {
        if (e instanceof ToolInputError) throw createError({ statusCode: 409, statusMessage: e.message })
        throw e
    }
})
