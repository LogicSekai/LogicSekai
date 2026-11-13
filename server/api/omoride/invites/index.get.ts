/** GET /api/omoride/invites — undangan konvoi tertunda untuk saya (hanya konvoi yang masih aktif). */
import { and, desc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { omorideConvoyInvites, omorideConvoys, users } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const fromUser = alias(users, 'from_user')

    const rows = await db.select({
        id: omorideConvoyInvites.id,
        createdMs: omorideConvoyInvites.createdMs,
        convoyId: omorideConvoys.id,
        convoyName: omorideConvoys.name,
        fromUsername: fromUser.username,
        fromName: fromUser.name,
        fromAvatar: fromUser.avatar,
    })
        .from(omorideConvoyInvites)
        .innerJoin(omorideConvoys, eq(omorideConvoys.id, omorideConvoyInvites.convoyId))
        .innerJoin(fromUser, eq(fromUser.id, omorideConvoyInvites.fromUserId))
        .where(and(
            eq(omorideConvoyInvites.toUserId, user.id),
            eq(omorideConvoyInvites.status, 'pending'),
            eq(omorideConvoys.status, 'active'),
        ))
        .orderBy(desc(omorideConvoyInvites.createdMs))
        .limit(50)

    return {
        invites: rows.map((r: any) => ({
            id: r.id,
            createdMs: r.createdMs,
            convoy: { id: r.convoyId, name: r.convoyName },
            from: { username: r.fromUsername, name: r.fromName, avatar: r.fromAvatar ?? null },
        })),
    }
})
