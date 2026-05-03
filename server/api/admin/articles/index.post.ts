import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, users } from '~/lib/db/schema'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  try {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
      throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (sessionData?.role !== 'superadmin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { title, excerpt, content, coverImage, category, tags, status } = body

    if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    if (!content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Content is required' })

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, users } })

    const slug = slugify(title, { lower: true, strict: true })

    const now = new Date()
    const publishedAt = status === 'published' ? now : null

    const newArticle = {
      id: createId(),
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      coverImage: coverImage || null,
      authorId: sessionData.id,
      category: category || 'other',
      tags: tags ? JSON.stringify(tags) : null,
      status: status || 'draft',
      publishedAt,
      totalViews: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(articles).values(newArticle)
    sqlite.close()

    return { success: true, article: newArticle }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to create article' })
  }
})
