import { initializeDB } from '~/lib/db/connection'
import { supportTickets, supportTicketReplies } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

  const { id: userId } = sessionData
  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Ticket ID required' })

  // Verify ownership
  const [ticket] = await db
    .select({ id: supportTickets.id, status: supportTickets.status })
    .from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, userId)))
    .limit(1)

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan' })
  if (ticket.status === 'closed') throw createError({ statusCode: 400, statusMessage: 'Tiket sudah ditutup' })

  const body = await readBody(event)
  const { message, attachments } = body ?? {}
  if (!message?.trim()) throw createError({ statusCode: 400, statusMessage: 'Pesan wajib diisi' })
  if (message.trim().length > 3000) throw createError({ statusCode: 400, statusMessage: 'Pesan maksimal 3000 karakter' })

  const attachmentUrls: string[] = Array.isArray(attachments) ? attachments.slice(0, 5) : []

  await db.insert(supportTicketReplies).values({
    ticketId,
    userId,
    message: message.trim(),
    isStaff: false,
    attachments: attachmentUrls.length ? JSON.stringify(attachmentUrls) : null,
  })

  // Reopen if resolved/closed
  if (ticket.status === 'resolved') {
    await db
      .update(supportTickets)
      .set({ status: 'open', updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
  } else {
    await db
      .update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
  }

  return { ok: true }
})
