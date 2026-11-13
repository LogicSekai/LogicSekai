/** GET /api/omoride/convoys/:id — detail konvoi + daftar anggota (khusus anggota aktif). */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideConvoyMembers, omorideProfiles, users } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy, member } = await requireConvoyMember(db, id, user.id)

    const rows = await db.select({
        userId: omorideConvoyMembers.userId,
        role: omorideConvoyMembers.role,
        joinedMs: omorideConvoyMembers.joinedMs,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        displayName: omorideProfiles.displayName,
    })
        .from(omorideConvoyMembers)
        .innerJoin(users, eq(users.id, omorideConvoyMembers.userId))
        .leftJoin(omorideProfiles, eq(omorideProfiles.userId, omorideConvoyMembers.userId))
        .where(and(eq(omorideConvoyMembers.convoyId, id), isNull(omorideConvoyMembers.leftMs)))

    return {
        convoy: { ...convoyDto(convoy), myRole: member.role },
        members: rows.map((r: any) => ({
            userId: r.userId,
            role: r.role,
            joinedMs: r.joinedMs,
            username: r.username,
            name: r.displayName || r.name,
            avatar: r.avatar ?? null,
        })),
    }
})
