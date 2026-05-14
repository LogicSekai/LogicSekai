import { createWriteStream, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { randomUUID } from 'crypto'
import type { MultiPartData } from 'h3'

export default defineEventHandler(async (event) => {
  // Handle CORS for preflight requests
  if (event.node.req.method === 'OPTIONS') {
    setHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    return ''
  }

  try {
    // Get user from session
    let userSession = getCookie(event, 'user-session');
    
    if (!userSession) {
      const cookieHeader = getHeader(event, 'cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/user-session=([^;]+)/);
        if (match) {
          userSession = decodeURIComponent(match[1]);
        }
      }
    }
    
    if (!userSession) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }
    
    let sessionData;
    try {
      sessionData = JSON.parse(userSession);
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session format'
      });
    }
    
    if (!sessionData?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found in session'
      });
    }
    
    const userId = sessionData.id;

    const method = getMethod(event)

    if (method === 'POST') {
      return await handleFileUpload(event, userId)
    } else if (method === 'DELETE') {
      return await handleFileDelete(event)
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

async function handleFileUpload(event: any, userId: string) {
  try {
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No files provided'
      })
    }

    const fileData = form.find(item => item.name === 'file')
    const typeData = form.find(item => item.name === 'type')
    
    if (!fileData || !fileData.data || !fileData.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid file found'
      })
    }

    const uploadType = typeData?.data?.toString() || 'product'
    const originalName = fileData.filename
    const fileBuffer = fileData.data

    // Validate file
    validateUploadedFile(fileBuffer, originalName, uploadType)

    // Generate unique filename
    const fileExtension = originalName.split('.').pop()
    const uniqueFilename = `${randomUUID()}.${fileExtension}`
    
    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', uploadType, userId)
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, uniqueFilename)
    writeFileSync(filePath, fileBuffer)

    // Return file info
    const fileUrl = `/uploads/${uploadType}/${userId}/${uniqueFilename}`
    
    return {
      success: true,
      data: {
        url: fileUrl,
        filename: uniqueFilename,
        originalName: originalName,
        size: fileBuffer.length,
        type: fileData.type || 'application/octet-stream'
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Upload failed'
    })
  }
}

async function handleFileDelete(event: any) {
  try {
    const body = await readBody(event)
    const { fileUrl } = body

    if (!fileUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File URL is required'
      })
    }

    // Remove file from filesystem
    const filePath = join(process.cwd(), 'public', fileUrl)
    
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }

    return {
      success: true,
      message: 'File deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Delete failed'
    })
  }
}

function validateUploadedFile(fileBuffer: Buffer, filename: string, type: string) {
  const maxSizes = {
    thumbnail: 5 * 1024 * 1024, // 5MB
    product: 100 * 1024 * 1024, // 100MB
    preview: 10 * 1024 * 1024, // 10MB
    gallery: 200 * 1024 * 1024, // 200MB (foto + video)
    support: 5 * 1024 * 1024, // 5MB
  }

  const allowedExtensions = {
    thumbnail: ['jpg', 'jpeg', 'png', 'webp'],
    product: ['pdf', 'zip', 'xlsx', 'xls', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mp3', 'wav'],
    preview: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
    gallery: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'],
    support: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  }

  const maxSize = maxSizes[type as keyof typeof maxSizes] || maxSizes.product
  const allowedExts = allowedExtensions[type as keyof typeof allowedExtensions] || allowedExtensions.product

  // Check file size
  if (fileBuffer.length > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024))
    throw createError({
      statusCode: 400,
      statusMessage: `File size must be less than ${sizeMB}MB`
    })
  }

  // Check file extension
  const fileExtension = filename.split('.').pop()?.toLowerCase()
  if (!fileExtension || !allowedExts.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: `File type .${fileExtension} is not allowed for ${type}`
    })
  }
}

