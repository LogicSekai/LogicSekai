/**
 * Penyimpanan avatar.
 * Menyimpan ke Cloudflare R2 (binding BUCKET) bila tersedia dan mengembalikan URL
 * (/api/files/...). Fallback ke data URI base64 hanya untuk dev tanpa R2.
 *
 * Mengganti pola lama yang menyimpan base64 langsung di database (membengkakkan
 * baris & payload).
 */
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function storeAvatar(
  event: any,
  userId: string,
  file: { data: Buffer | Uint8Array; type?: string },
): Promise<string> {
  const bucket = event?.context?.cloudflare?.env?.BUCKET
  const contentType = file.type || 'image/jpeg'

  if (bucket) {
    const ext = EXT_BY_TYPE[contentType] || 'jpg'
    const uuid = (globalThis.crypto as any).randomUUID()
    const key = `uploads/avatars/${userId}/${uuid}.${ext}`
    await bucket.put(key, file.data, { httpMetadata: { contentType } })
    return `/api/files/${key}`
  }

  // Dev fallback (tanpa R2): data URI base64
  const b64 = Buffer.from(file.data as any).toString('base64')
  return `data:${contentType};base64,${b64}`
}

/**
 * Hapus avatar lama dari R2 bila berupa URL R2 (/api/files/...). Best-effort.
 * Data URI base64 atau URL eksternal diabaikan.
 */
export async function deleteAvatarIfR2(event: any, avatar?: string | null): Promise<void> {
  if (!avatar || !avatar.startsWith('/api/files/')) return
  const bucket = event?.context?.cloudflare?.env?.BUCKET
  if (!bucket) return
  try {
    await bucket.delete(avatar.replace('/api/files/', ''))
  } catch {
    // abaikan kegagalan pembersihan
  }
}
