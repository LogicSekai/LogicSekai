import { initializeDB } from '~/lib/db/connection'
import { creatorProfiles } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

const ALLOWED_SOCIAL_KEYS = ['github', 'instagram', 'twitter', 'youtube', 'tiktok', 'discord', 'telegram', 'linkedin']
const ALLOWED_DONATION_KEYS = ['saweria', 'trakteer', 'paypal', 'ko_fi', 'custom']
const ALLOWED_CONTACT_KEYS = ['email', 'whatsapp', 'phone', 'telegram', 'line', 'wechat']

export default defineEventHandler(async (event) => {
  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const userSession = getCookie(event, 'user-session')
  if (!userSession) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  let sessionData: any
  try { sessionData = JSON.parse(userSession) } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
  const userId = sessionData?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)

  // Sanitize inputs
  const headline = typeof body.headline === 'string' ? body.headline.trim().slice(0, 160) : null
  const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 2000) : null
  const location = typeof body.location === 'string' ? body.location.trim().slice(0, 100) : null
  const website = typeof body.website === 'string' ? body.website.trim().slice(0, 255) : null

  // Validate website URL if present
  if (website) {
    try { new URL(website) } catch {
      throw createError({ statusCode: 400, statusMessage: 'Website harus berupa URL valid' })
    }
  }

  // Sanitize social links — only allow known keys, values must be strings/URLs
  const rawSocial = typeof body.socialLinks === 'object' && body.socialLinks ? body.socialLinks : {}
  const socialLinks: Record<string, string> = {}
  for (const key of ALLOWED_SOCIAL_KEYS) {
    const val = rawSocial[key]
    if (val && typeof val === 'string') socialLinks[key] = val.trim().slice(0, 255)
  }

  // Sanitize donation links
  const rawDonation = typeof body.donationLinks === 'object' && body.donationLinks ? body.donationLinks : {}
  const donationLinks: Record<string, string> = {}
  for (const key of ALLOWED_DONATION_KEYS) {
    const val = rawDonation[key]
    if (val && typeof val === 'string') donationLinks[key] = val.trim().slice(0, 255)
  }

  // Sanitize contact links
  const rawContact = typeof body.contactLinks === 'object' && body.contactLinks ? body.contactLinks : {}
  const contactLinks: Record<string, string> = {}
  for (const key of ALLOWED_CONTACT_KEYS) {
    const val = rawContact[key]
    if (val && typeof val === 'string') contactLinks[key] = val.trim().slice(0, 255)
  }

  // Validate email if present
  if (contactLinks.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactLinks.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid' })
  }

  const now = new Date()

  // Upsert
  const [existing] = await db.select({ id: creatorProfiles.id }).from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1)

  if (existing) {
    await db.update(creatorProfiles).set({
      headline, bio, location, website,
      socialLinks: JSON.stringify(socialLinks),
      donationLinks: JSON.stringify(donationLinks),
      contactLinks: JSON.stringify(contactLinks),
      updated: now,
    }).where(eq(creatorProfiles.userId, userId))
  } else {
    await db.insert(creatorProfiles).values({
      id: createId(),
      userId,
      headline, bio, location, website,
      socialLinks: JSON.stringify(socialLinks),
      donationLinks: JSON.stringify(donationLinks),
      contactLinks: JSON.stringify(contactLinks),
      isPublic: true,
      created: now,
      updated: now,
    })
  }

  return { success: true }
})
