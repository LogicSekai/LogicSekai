import { initializeDB } from '~/lib/db/connection'
import { supportTickets, supportTicketReplies, users } from '~/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

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
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1)

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan' })

  const replies = await db
    .select({
      id: supportTicketReplies.id,
      message: supportTicketReplies.message,
      isStaff: supportTicketReplies.isStaff,
      attachments: supportTicketReplies.attachments,
      createdAt: supportTicketReplies.createdAt,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatar,
      userRole: users.role,
    })
    .from(supportTicketReplies)
    .innerJoin(users, eq(users.id, supportTicketReplies.userId))
    .where(eq(supportTicketReplies.ticketId, ticketId))
    .orderBy(asc(supportTicketReplies.createdAt))

  return {
    ticket,
    replies: replies.map((r) => ({
      id: r.id,
      message: r.message,
      isStaff: r.isStaff,
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      createdAt: r.createdAt,
      user: { name: r.userName, username: r.userUsername, avatar: r.userAvatar, role: r.userRole },
    })),
  }
})
