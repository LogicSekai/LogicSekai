import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/** Convert a stored file URL to an R2 object key.
 *  Prod URLs: /api/files/uploads/product/...  -> uploads/product/...
 *  Dev URLs:  /uploads/product/...            -> uploads/product/...
 */
function urlToR2Key(url: string): string | null {
  if (!url) return null
  if (url.startsWith('/api/files/')) return url.slice('/api/files/'.length)
  if (url.startsWith('/uploads/')) return url.slice(1)
  return null
}

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const creatorUsername = getRouterParam(event, 'creator')
    const productSlug = getRouterParam(event, 'slug')
    const query = getQuery(event)
    const transactionId = query.t as string // Transaction ID for verification
    
    if (!creatorUsername || !productSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Creator username and product slug are required'
      })
    }

    // Get product by creator username and product slug
    const productData = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        basePrice: products.basePrice,
        discountType: products.discountType,
        discountValue: products.discountValue,
        productFiles: products.productFiles,
        creator: {
          id: users.id,
          username: users.username,
          name: users.name
        }
      })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
      .where(
        and(
          eq(products.slug, productSlug),
          eq(users.username, creatorUsername)
        )
      )
      .limit(1)

    if (!productData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]

    // Check if product is free
    const isFree = product.basePrice === 0 || (
      product.discountType === 'flat' && 
      product.discountValue && 
      product.discountValue >= product.basePrice
    ) || (
      product.discountType === 'percentage' && 
      product.discountValue === 100
    )

    let hasAccess = false

    if (isFree) {
      // Free products can be downloaded by anyone
      hasAccess = true
    } else if (transactionId) {
      // Verify transaction for paid products
      const validTransaction = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.id, transactionId),
          eq(transactions.productId, product.id),
          eq(transactions.status, 'completed')
        ))
        .limit(1)

      hasAccess = validTransaction.length > 0
    }

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Purchase required or invalid transaction.'
      })
    }

    // Parse product files
    let productFiles: any[] = []
    if (product.productFiles) {
      try {
        productFiles = JSON.parse(product.productFiles)
      } catch {
        productFiles = []
      }
    }

    if (!productFiles.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No downloadable files available for this product'
      })
    }

    const bucket = event.context.cloudflare?.env?.BUCKET

    // -- INFO MODE: return file metadata list
    if (query.info) {
      const list = []
      for (let i = 0; i < productFiles.length; i++) {
        const f = productFiles[i]
        const r2Key = urlToR2Key(f.url || f.path || '')
        let size: number | null = null
        if (bucket && r2Key) {
          const head = await bucket.head(r2Key)
          size = head?.size ?? null
        }
        list.push({
          index: i,
          name: f.name || f.originalName || f.filename || `file_${i + 1}`,
          mimeType: f.format || f.mimeType || f.type || 'application/octet-stream',
          size
        })
      }
      return list
    }

    // -- SINGLE FILE MODE (default: index 0)
    const fileParam = query.file
    const fileIndex = fileParam !== undefined ? parseInt(fileParam as string) : 0

    if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= productFiles.length) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }

    const fileEntry = productFiles[fileIndex]
    const fileName = fileEntry.name || fileEntry.originalName || fileEntry.filename || `${product.title}.zip`
    const mimeType = fileEntry.format || fileEntry.mimeType || fileEntry.type || 'application/octet-stream'
    const fileUrl: string = fileEntry.url || fileEntry.path || ''
    const r2Key = urlToR2Key(fileUrl)

    // -- Serve from R2 (production on Cloudflare)
    if (bucket) {
      if (!r2Key) {
        throw createError({ statusCode: 404, statusMessage: 'Invalid file reference' })
      }

      const object = await bucket.get(r2Key)
      if (!object) {
        throw createError({ statusCode: 404, statusMessage: 'File not found in storage' })
      }

      setResponseHeaders(event, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': String(object.size),
        'Cache-Control': 'no-store, no-cache',
      })

      const data = await object.arrayBuffer()
      return Buffer.from(data)
    }

    // -- Serve from local filesystem (development only)
    const { existsSync, statSync, createReadStream } = await import('node:fs')
    const { join } = await import('node:path')

    const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl
    const filePath = join(process.cwd(), 'public', relativePath)

    if (!existsSync(filePath)) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }

    const stat = statSync(filePath)
    const rangeHeader = getHeader(event, 'range')

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (match) {
        const start = parseInt(match[1])
        const end = match[2] ? parseInt(match[2]) : stat.size - 1
        setResponseStatus(event, 206)
        setResponseHeaders(event, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(end - start + 1),
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Cache-Control': 'no-store, no-cache',
        })
        return sendStream(event, createReadStream(filePath, { start, end }))
      }
    }

    setResponseHeaders(event, {
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': String(stat.size),
      'Cache-Control': 'no-store, no-cache',
    })
    return sendStream(event, createReadStream(filePath))

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to process download' })
  }
})
