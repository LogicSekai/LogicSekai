import { initializeDB } from '~/lib/db/connection'
import { supportTickets, users } from '~/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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

  const rows = await db
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      category: supportTickets.category,
      description: supportTickets.description,
      priority: supportTickets.priority,
      status: supportTickets.status,
      adminNote: supportTickets.adminNote,
      attachments: supportTickets.attachments,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      resolvedAt: supportTickets.resolvedAt,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatar,
      userRole: users.role,
      userEmail: users.email,
    })
    .from(supportTickets)
    .innerJoin(users, eq(users.id, supportTickets.userId))
    .orderBy(desc(supportTickets.updatedAt))

  const tickets = rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    category: r.category,
    description: r.description,
    priority: r.priority,
    status: r.status,
    adminNote: r.adminNote,
    attachments: r.attachments,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    resolvedAt: r.resolvedAt,
    user: { name: r.userName, username: r.userUsername, avatar: r.userAvatar, role: r.userRole, email: r.userEmail },
  }))

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }

  return { tickets, stats }
})
