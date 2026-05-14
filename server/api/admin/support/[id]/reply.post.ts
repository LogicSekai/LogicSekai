import { initializeDB } from '~/lib/db/connection'
import { supportTickets, supportTicketReplies } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const userSession = getCookie(event, 'user-session')
  if (!userSession) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  let sessionData: { id: string; role: string }
  try {
    sessionData = JSON.parse(userSession)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }

  if (!['superadmin', 'admin'].includes(sessionData.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Ticket ID required' })

  const [ticket] = await db
    .select({ id: supportTickets.id, status: supportTickets.status })
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1)

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan' })

  const body = await readBody(event)
  const { message, adminNote, attachments } = body ?? {}

  if (!message?.trim()) throw createError({ statusCode: 400, statusMessage: 'Pesan wajib diisi' })
  if (message.trim().length > 3000) throw createError({ statusCode: 400, statusMessage: 'Pesan maksimal 3000 karakter' })

  const attachmentUrls: string[] = Array.isArray(attachments) ? attachments.slice(0, 5) : []

  await db.insert(supportTicketReplies).values({
    ticketId,
    userId: sessionData.id,
    message: message.trim(),
    isStaff: true,
    attachments: attachmentUrls.length ? JSON.stringify(attachmentUrls) : null,
  })

  await db
    .update(supportTickets)
    .set({
      status: 'in_progress',
      updatedAt: new Date(),
      ...(adminNote !== undefined ? { adminNote: adminNote?.trim() || null } : {}),
    })
    .where(eq(supportTickets.id, ticketId))

  return { ok: true }
})
