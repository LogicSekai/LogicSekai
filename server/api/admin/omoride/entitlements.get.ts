/**
 * GET /api/admin/omoride/entitlements — daftar hak langganan OmoRide (terbaru dulu, maks. 500).
 * Dilindungi middleware require-admin (/api/admin/*).
 */
import { desc, eq } from 'drizzle-orm'
import { omorideEntitlements, users } from '~/lib/db/schema'
import { effectivePlan, plansEnforced } from '../../../omoride/plans'

export default defineEventHandler(async (event) => {
    const db = getOmoDb(event)
    const now = Date.now()
    const rows = await db.select({ e: omorideEntitlements, username: users.username, name: users.name })
        .from(omorideEntitlements)
        .innerJoin(users, eq(users.id, omorideEntitlements.userId))
        .orderBy(desc(omorideEntitlements.updatedMs))
        .limit(500)
    return {
        enforced: plansEnforced(useRuntimeConfig(event).omoridePlansEnforced),
        entitlements: rows.map((r: any) => ({
            username: r.username,
            name: r.name,
            plan: r.e.plan,
            effectivePlan: effectivePlan(r.e, now),
            source: r.e.source,
            status: r.e.status,
            expiresMs: r.e.expiresMs,
            autoRenew: !!r.e.autoRenew,
            note: r.e.note,
            updatedMs: r.e.updatedMs,
        })),
    }
})
