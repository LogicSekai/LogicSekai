import { describe, expect, it } from 'vitest'
import { GRACE_MS, LEGACY_LIMITS, PLAN_LIMITS, PLAN_PRICES, canBuyOnWeb, effectivePlan, extendEntitlement, limitsFor, plansEnforced } from '../../server/omoride/plans'

const now = 1_800_000_000_000

describe('effectivePlan', () => {
    it('tanpa hak / paket tidak dikenal = gratis', () => {
        expect(effectivePlan(null, now)).toBe('free')
        expect(effectivePlan({ plan: 'gold', status: 'active', expiresMs: null }, now)).toBe('free')
    })

    it('aktif sampai kedaluwarsa; admin tanpa batas', () => {
        expect(effectivePlan({ plan: 'plus', status: 'active', expiresMs: now + 1 }, now)).toBe('plus')
        expect(effectivePlan({ plan: 'plus', status: 'active', expiresMs: now - 1 }, now)).toBe('free')
        expect(effectivePlan({ plan: 'klub', status: 'active', expiresMs: null }, now)).toBe('klub')
        expect(effectivePlan({ plan: 'plus', status: 'canceled', expiresMs: now + 1000 }, now)).toBe('plus')
    })

    it('masa tenggang memperpanjang; dicabut = gratis', () => {
        expect(effectivePlan({ plan: 'plus', status: 'grace', expiresMs: now - 1000 }, now)).toBe('plus')
        expect(effectivePlan({ plan: 'plus', status: 'grace', expiresMs: now - GRACE_MS - 1 }, now)).toBe('free')
        expect(effectivePlan({ plan: 'plus', status: 'revoked', expiresMs: null }, now)).toBe('free')
    })
})

describe('limitsFor', () => {
    it('belum diberlakukan: semua pengguna mendapat batas lama (tidak ada yang berkurang)', () => {
        expect(limitsFor('free', false)).toEqual(LEGACY_LIMITS)
        expect(LEGACY_LIMITS.convoyMembers).toBe(30)
        expect(LEGACY_LIMITS.convoysLed).toBe(3)
        const plus = limitsFor('plus', false)
        expect(plus.convoyMembers).toBeGreaterThanOrEqual(LEGACY_LIMITS.convoyMembers)
        expect(plus.videoMaxHeight).toBe(1920)
    })

    it('diberlakukan: batas per paket; Plus tidak lebih sedikit dari batas lama', () => {
        expect(limitsFor('free', true)).toEqual(PLAN_LIMITS.free)
        expect(limitsFor('plus', true).convoyMembers).toBeGreaterThanOrEqual(LEGACY_LIMITS.convoyMembers)
        expect(limitsFor('klub', true).convoyMembers).toBeGreaterThan(limitsFor('plus', true).convoyMembers)
    })

    it('sakelar dari env', () => {
        expect(plansEnforced('1')).toBe(true)
        expect(plansEnforced('true')).toBe(true)
        expect(plansEnforced('')).toBe(false)
        expect(plansEnforced(undefined)).toBe(false)
    })
})

describe('pembayaran web: perpanjangan', () => {
    const DAY = 24 * 60 * 60_000
    it('paket sama yang masih aktif ditambahkan ke sisa waktu', () => {
        const cur = { plan: 'plus', status: 'active', expiresMs: now + 10 * DAY, source: 'web' }
        expect(extendEntitlement(cur, 'plus', 'month', now).expiresMs).toBe(now + 40 * DAY)
    })
    it('paket berbeda / habis / tanpa hak mulai dari sekarang', () => {
        expect(extendEntitlement({ plan: 'plus', status: 'active', expiresMs: now + 10 * DAY, source: 'web' }, 'klub', 'year', now).expiresMs).toBe(now + 365 * DAY)
        expect(extendEntitlement({ plan: 'plus', status: 'active', expiresMs: now - DAY, source: 'web' }, 'plus', 'month', now).expiresMs).toBe(now + 30 * DAY)
        expect(extendEntitlement(null, 'plus', 'month', now).expiresMs).toBe(now + 30 * DAY)
        // Hak admin tanpa batas → pembelian memberi tenggat dari sekarang.
        expect(extendEntitlement({ plan: 'plus', status: 'active', expiresMs: null, source: 'admin' }, 'plus', 'month', now).expiresMs).toBe(now + 30 * DAY)
    })
    it('langganan Play aktif tidak bisa ditimpa dari web', () => {
        expect(canBuyOnWeb({ plan: 'plus', status: 'active', expiresMs: now + DAY, source: 'play' }, now)).toBe(false)
        expect(canBuyOnWeb({ plan: 'plus', status: 'active', expiresMs: now - GRACE_MS * 2, source: 'play' }, now)).toBe(true)
        expect(canBuyOnWeb({ plan: 'plus', status: 'active', expiresMs: now + DAY, source: 'web' }, now)).toBe(true)
        expect(PLAN_PRICES.plus.month).toBe(19_000)
    })
})
