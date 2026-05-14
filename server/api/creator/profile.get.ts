import { initializeDB } from '~/lib/db/connection'
import { users, creatorProfiles } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

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

  // Get user
  const [user] = await db.select({
    id: users.id, username: users.username, name: users.name, avatar: users.avatar, role: users.role,
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  // Get or return empty profile
  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1)

  return {
    user,
    profile: profile ? {
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {},
      donationLinks: profile.donationLinks ? JSON.parse(profile.donationLinks) : {},
      contactLinks: profile.contactLinks ? JSON.parse(profile.contactLinks) : {},
    } : {
      headline: null, bio: null, location: null, website: null, socialLinks: {}, donationLinks: {}, contactLinks: {},
    },
  }
})
