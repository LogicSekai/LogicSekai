/** PATCH /api/omoride/me — ubah nama tampilan konvoi & mode hantu bawaan. Body: { displayName?, ghostDefault? } */
import { eq } from 'drizzle-orm'
import { omorideProfiles } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    const now = Date.now()

    const displayName = body?.displayName !== undefined ? cleanText(body.displayName, 40) : undefined
    if (displayName !== undefined && displayName.length < 1) throw createError({ statusCode: 400, statusMessage: 'Invalid display name' })
    const ghostDefault = body?.ghostDefault !== undefined ? !!body.ghostDefault : undefined

    await db.insert(omorideProfiles).values({
        userId: user.id,
        displayName: displayName ?? (user.name || user.username),
        ghostDefault: ghostDefault ?? false,
        createdMs: now,
        updatedMs: now,
    }).onConflictDoUpdate({
        target: omorideProfiles.userId,
        set: {
            ...(displayName !== undefined ? { displayName } : {}),
            ...(ghostDefault !== undefined ? { ghostDefault } : {}),
            updatedMs: now,
        },
    })

    const [profile] = await db.select().from(omorideProfiles).where(eq(omorideProfiles.userId, user.id)).limit(1)
    return { profile: { displayName: profile.displayName, ghostDefault: !!profile.ghostDefault } }
})
