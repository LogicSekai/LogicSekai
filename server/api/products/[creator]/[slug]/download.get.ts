import { existsSync, statSync, createReadStream } from 'node:fs'
import { join } from 'node:path'
import archiver from 'archiver'
import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

    // Resolve physical paths for all files
    const resolvedFiles = productFiles
      .map((f: any) => {
        const fileUrl: string = f.url || ''
        const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl
        const filePath = join(process.cwd(), 'public', relativePath)
        const fileName = f.name || f.originalName || f.filename || 'file'
        const mimeType = f.format || f.mimeType || 'application/octet-stream'
        return { filePath, fileName, mimeType, exists: existsSync(filePath) }
      })
      .filter(f => f.exists)

    if (!resolvedFiles.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File tidak ditemukan di server. Hubungi creator.'
      })
    }

    // -- INFO MODE: return file list as JSON --
    if (query.info) {
      return resolvedFiles.map((f, i) => ({
        index: i,
        name: f.fileName,
        size: statSync(f.filePath).size,
        mimeType: f.mimeType,
      }))
    }

    // -- SINGLE FILE BY INDEX MODE (with Range/pause-resume support) --
    const fileParam = query.file
    if (fileParam !== undefined) {
      const fileIndex = parseInt(fileParam as string)
      if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= resolvedFiles.length) {
        throw createError({ statusCode: 404, statusMessage: 'File tidak ditemukan' })
      }
      const { filePath, fileName, mimeType } = resolvedFiles[fileIndex]
      const stat = statSync(filePath)
      const rangeHeader = getHeader(event, 'range')

      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
        if (match) {
          const start = parseInt(match[1])
          const end = match[2] ? parseInt(match[2]) : stat.size - 1
          const chunkSize = end - start + 1
          setResponseStatus(event, 206)
          setResponseHeaders(event, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
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
    }

    // -- DEFAULT: single → stream directly, multiple → zip --
    // Single file — stream directly
    if (resolvedFiles.length === 1) {
      const { filePath, fileName, mimeType } = resolvedFiles[0]
      const stat = statSync(filePath)

      setResponseHeaders(event, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': String(stat.size),
        'Cache-Control': 'no-store, no-cache',
      })

      return sendStream(event, createReadStream(filePath))
    }

    // Multiple files — buffer zip in memory then send
    // (avoids stream timing issues with Nitro's sendStream)
    const safeTitle = product.title.replace(/[^\w\s-]/g, '').trim() || 'product'
    const zipName = `${safeTitle}.zip`

    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      const archive = archiver('zip', { zlib: { level: 6 } })

      archive.on('data', (chunk) => chunks.push(chunk as Buffer))
      archive.on('end', () => resolve(Buffer.concat(chunks)))
      archive.on('error', reject)

      for (const { filePath, fileName } of resolvedFiles) {
        archive.file(filePath, { name: fileName })
      }

      archive.finalize()
    })

    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}"`,
      'Content-Length': String(zipBuffer.length),
      'Cache-Control': 'no-store, no-cache',
    })

    return send(event, zipBuffer)

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to process download' })
  }
})
