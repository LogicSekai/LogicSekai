/**
 * GET /api/omoride/me — profil OmoRide user (dibuat otomatis dari akun Logic Sekai bila belum ada),
 * konvoi aktif yang diikuti, dan jumlah undangan tertunda.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import { omorideConvoyInvites, omorideConvoyMembers, omorideConvoys, omorideProfiles } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const now = Date.now()

    let [profile] = await db.select().from(omorideProfiles).where(eq(omorideProfiles.userId, user.id)).limit(1)
    if (!profile) {
        profile = { userId: user.id, displayName: user.name || user.username, ghostDefault: false, createdMs: now, updatedMs: now }
        await db.insert(omorideProfiles).values(profile).onConflictDoNothing()
    }

    const convoys = await db.select({ convoy: omorideConvoys, role: omorideConvoyMembers.role })
        .from(omorideConvoyMembers)
        .innerJoin(omorideConvoys, eq(omorideConvoys.id, omorideConvoyMembers.convoyId))
        .where(and(eq(omorideConvoyMembers.userId, user.id), isNull(omorideConvoyMembers.leftMs), eq(omorideConvoys.status, 'active')))

    const [inv] = await db.select({ n: sql<number>`count(*)` }).from(omorideConvoyInvites)
        .where(and(eq(omorideConvoyInvites.toUserId, user.id), eq(omorideConvoyInvites.status, 'pending')))

    return {
        user: { id: user.id, username: user.username, name: user.name, avatar: user.avatar },
        profile: { displayName: profile.displayName, ghostDefault: !!profile.ghostDefault },
        activeConvoys: convoys.map((r: any) => ({ ...convoyDto(r.convoy), myRole: r.role })),
        pendingInvites: Number(inv?.n ?? 0),
    }
})
