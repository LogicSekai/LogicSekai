import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })

    let sessionData: any
    try { sessionData = JSON.parse(session) }
    catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session format' }) }
    if (!sessionData?.id) throw createError({ statusCode: 401, statusMessage: 'User not found in session' })

    const body = await readBody(event)
    const { fileUrl } = body || {}
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'fileUrl is required' })
    }

    // Only allow deleting R2-served files or local upload paths
    if (!fileUrl.startsWith('/api/files/') && !fileUrl.startsWith('/uploads/')) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file URL' })
    }

    const bucket = event.context.cloudflare?.env?.BUCKET

    if (bucket && fileUrl.startsWith('/api/files/')) {
      const key = fileUrl.replace(/^\/api\/files\//, '')
      await bucket.delete(key)
    } else if (!bucket && fileUrl.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', fileUrl)
      if (existsSync(filePath)) unlinkSync(filePath)
    }

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.statusMessage || 'Delete failed' })
  }
})
