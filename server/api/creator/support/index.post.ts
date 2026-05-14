import { initializeDB } from '~/lib/db/connection'
import { supportTickets } from '~/lib/db/schema'

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

  const body = await readBody(event)
  const { subject, category, description, priority, attachments } = body ?? {}

  if (!subject?.trim()) throw createError({ statusCode: 400, statusMessage: 'Subject wajib diisi' })
  if (!description?.trim()) throw createError({ statusCode: 400, statusMessage: 'Deskripsi wajib diisi' })
  if (subject.trim().length > 200) throw createError({ statusCode: 400, statusMessage: 'Subject maksimal 200 karakter' })
  if (description.trim().length > 5000) throw createError({ statusCode: 400, statusMessage: 'Deskripsi maksimal 5000 karakter' })

  const validCategories = ['general', 'payment', 'product', 'account', 'technical', 'other']
  const validPriorities = ['low', 'medium', 'high', 'urgent']

  // Validate attachments (max 5 images)
  const attachmentUrls: string[] = Array.isArray(attachments) ? attachments.slice(0, 5) : []

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      userId,
      subject: subject.trim(),
      category: validCategories.includes(category) ? category : 'general',
      description: description.trim(),
      priority: validPriorities.includes(priority) ? priority : 'medium',
      status: 'open',
      attachments: attachmentUrls.length ? JSON.stringify(attachmentUrls) : null,
    })
    .returning({ id: supportTickets.id, subject: supportTickets.subject, status: supportTickets.status, createdAt: supportTickets.createdAt })

  return { ticket }
})
