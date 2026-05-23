/**
 * GET /api/admin/donations
 * List all donations with filtering, search, and pagination.
 * Superadmin only.
 */
import { initializeDB } from '~~/app/lib/db/connection'
import { donations, users } from '~~/app/lib/db/schema'
import { eq, desc, like, or, sql } from 'drizzle-orm'

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled']

export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const query    = getQuery(event)
    const status   = VALID_STATUSES.includes(query.status as string) ? (query.status as string) : null
    const search   = typeof query.search === 'string' ? query.search.trim() : ''
    const page     = Math.max(1, parseInt(query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20))
    const offset   = (page - 1) * pageSize

    const rows = await db
        .select({
            id:                    donations.id,
            userId:                donations.userId,
            donorName:             users.name,
            donorUsername:         users.username,
            donorEmail:            users.email,
            donorAvatar:           users.avatar,
            amount:                donations.amount,
            currency:              donations.currency,
            status:                donations.status,
            paymentMethod:         donations.paymentMethod,
            midtransTransactionId: donations.midtransTransactionId,
            stellarGranted:        donations.stellarGranted,
            createdAt:             donations.createdAt,
            updatedAt:             donations.updatedAt,
            completedAt:           donations.completedAt,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .orderBy(desc(donations.createdAt))

    // Filter
    let filtered = rows as any[]
    if (status) {
        filtered = filtered.filter(d => d.status === status)
    }
    if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(d =>
            d.donorName?.toLowerCase().includes(q) ||
            d.donorUsername?.toLowerCase().includes(q) ||
            d.donorEmail?.toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q) ||
            d.midtransTransactionId?.toLowerCase().includes(q),
        )
    }

    // Aggregates from full dataset (pre-filter for status aggregates)
    const allForStats = rows as any[]
    const totalRevenue  = allForStats.filter(d => d.status === 'completed').reduce((s, d) => s + (d.amount ?? 0), 0)
    const countByStatus = allForStats.reduce<Record<string, number>>((acc, d) => {
        acc[d.status] = (acc[d.status] ?? 0) + 1
        return acc
    }, {})

    const total = filtered.length
    const page_data = filtered.slice(offset, offset + pageSize)

    return {
        donations:    page_data,
        total,
        page,
        pageSize,
        totalPages:   Math.max(1, Math.ceil(total / pageSize)),
        countByStatus,
        totalRevenue,
    }
})
