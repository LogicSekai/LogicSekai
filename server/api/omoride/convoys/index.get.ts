/** GET /api/omoride/convoys?all=1 — konvoi yang saya ikuti (default: hanya yang aktif). */
import { and, desc, eq, isNull } from 'drizzle-orm'
import { omorideConvoyMembers, omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const all = getQuery(event).all === '1'

    const conds = [eq(omorideConvoyMembers.userId, user.id)]
    if (!all) conds.push(isNull(omorideConvoyMembers.leftMs), eq(omorideConvoys.status, 'active'))

    const rows = await db.select({ convoy: omorideConvoys, role: omorideConvoyMembers.role, leftMs: omorideConvoyMembers.leftMs })
        .from(omorideConvoyMembers)
        .innerJoin(omorideConvoys, eq(omorideConvoys.id, omorideConvoyMembers.convoyId))
        .where(and(...conds))
        .orderBy(desc(omorideConvoys.createdMs))
        .limit(50)

    return { convoys: rows.map((r: any) => ({ ...convoyDto(r.convoy), myRole: r.role, left: r.leftMs != null })) }
})
