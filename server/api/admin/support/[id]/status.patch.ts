import { initializeDB } from '~/lib/db/connection'
import { supportTickets } from '~/lib/db/schema'
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

  const body = await readBody(event)
  const { status } = body ?? {}

  const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
  if (!validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status tidak valid' })
  }

  const [ticket] = await db
    .select({ id: supportTickets.id })
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1)

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan' })

  await db
    .update(supportTickets)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
    })
    .where(eq(supportTickets.id, ticketId))

  return { ok: true }
})
