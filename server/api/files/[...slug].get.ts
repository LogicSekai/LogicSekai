export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'File path required' })

    const bucket = event.context.cloudflare?.env?.BUCKET
    if (!bucket) throw createError({ statusCode: 503, statusMessage: 'Storage not available' })

    // slug already contains full R2 key, e.g. "uploads/thumbnail/userId/file.png"
    const key = slug

    const object = await bucket.get(key)
    if (!object) throw createError({ statusCode: 404, statusMessage: 'File not found' })

    const contentType = object.httpMetadata?.contentType || 'application/octet-stream'
    const isInline = contentType.startsWith('image/') || contentType.startsWith('video/') || contentType === 'application/pdf'

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    setHeader(event, 'Content-Disposition', isInline ? 'inline' : `attachment; filename="${slug.split('/').pop()}"`)

    const data = await object.arrayBuffer()
    return Buffer.from(data)
})
