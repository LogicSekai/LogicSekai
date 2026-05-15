import { ref } from 'vue'
import type { FileUploadResult } from '~/types/product'

interface UploadProgress {
  [fileId: string]: number
}

export const useFileUpload = () => {
  const uploading = ref(false)
  const progress = ref<UploadProgress>({})
  const error = ref<string | null>(null)

  // Upload single file
  const uploadFile = async (file: File, type: 'thumbnail' | 'product' | 'preview' = 'product'): Promise<FileUploadResult> => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    uploading.value = true
    progress.value[fileId] = 0
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('fileId', fileId)

      const response = await $fetch<{ success: boolean; data: FileUploadResult }>('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.success) {
        delete progress.value[fileId]
        return response.data
      } else {
        throw new Error('Upload failed')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Upload failed'
      delete progress.value[fileId]
      throw err
    } finally {
      uploading.value = Object.keys(progress.value).length > 0
    }
  }

  // Upload multiple files
  const uploadFiles = async (files: File[], type: 'product' | 'preview' = 'product'): Promise<FileUploadResult[]> => {
    const results: FileUploadResult[] = []
    const errors: string[] = []

    uploading.value = true
    error.value = null

    for (const file of files) {
      try {
        const result = await uploadFile(file, type)
        results.push(result)
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message}`)
      }
    }

    if (errors.length > 0) {
      error.value = `Some uploads failed: ${errors.join(', ')}`
    }

    uploading.value = false
    return results
  }

  // Validate file
  const validateFile = (file: File, type: 'thumbnail' | 'product' | 'preview' = 'product') => {
    const maxSizes = {
      thumbnail: 5 * 1024 * 1024, // 5MB
      product: 100 * 1024 * 1024, // 100MB
      preview: 10 * 1024 * 1024, // 10MB
    }

    const allowedTypes = {
      thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
      product: [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav'
      ],
      preview: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    }

    const maxSize = maxSizes[type]
    const allowedTypeList = allowedTypes[type]

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024))
      throw new Error(`File size must be less than ${sizeMB}MB`)
    }

    if (!allowedTypeList.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed for ${type}`)
    }

    return true
  }

  // Delete uploaded file
  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    if (!fileUrl?.startsWith('/api/files/') && !fileUrl?.startsWith('/uploads/')) return true
    try {
      const response = await $fetch<{ success: boolean }>('/api/upload/delete', {
        method: 'POST',
        body: { fileUrl }
      })
      return response.success
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to delete file'
      return false
    }
  }

  // Get file info
  const getFileInfo = (file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: formatFileSize(file.size)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Reset state
  const reset = () => {
    uploading.value = false
    progress.value = {}
    error.value = null
  }

  return {
    // State
    uploading,
    progress,
    error,
    
    // Actions
    uploadFile,
    uploadFiles,
    validateFile,
    deleteFile,
    getFileInfo,
    formatFileSize,
    reset,
  }
}
