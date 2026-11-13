/**
 * Utilitas bersama rute /api/omoride/* (fitur Konvoi & Laporan Jalan OmoRide).
 *
 * Autentikasi: sesi Logic Sekai yang sama dengan situs.
 *   - Browser  → cookie httpOnly `ls_session` (sudah divalidasi middleware 0.session.ts)
 *   - Android  → header `Authorization: Bearer <token>` (token dari POST /api/omoride/auth/login)
 *
 * Real-time: Durable Object `ConvoyRoom` (Worker pendamping `logicsekai-convoy`, lihat
 * workers/omoride-convoy) diikat ke Pages sebagai binding `CONVOY_ROOM`. Upgrade WebSocket
 * ditangani di entry Worker kustom (server/omoride/entry.cloudflare-pages.ts) karena respons
 * 101 tidak bisa melewati h3/localFetch Nitro.
 */
import type { H3Event } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { getDB, initializeDB } from '~/lib/db/connection'
import { omorideConvoyInvites, omorideConvoyMembers, omorideConvoys, users } from '~/lib/db/schema'
import { getBearerToken, resolveSessionToken, type SessionUser } from './session'

export const OMO_REPORT_TYPES = ['jam', 'police', 'pothole', 'flood', 'crash', 'hazard'] as const
export type OmoReportType = (typeof OMO_REPORT_TYPES)[number]

/** Lama laporan aktif per tipe (ms). Harus sama dengan workers/omoride-convoy/src/convoy-room.ts. */
export const OMO_REPORT_TTL: Record<OmoReportType, number> = {
    jam: 30 * 60_000,
    police: 60 * 60_000,
    pothole: 7 * 24 * 60 * 60_000,
    flood: 3 * 60 * 60_000,
    crash: 60 * 60_000,
    hazard: 2 * 60 * 60_000,
}

export const OMO_MAX_MEMBERS = 30
export const OMO_MAX_ACTIVE_LED = 3
/** Laporan hilang bila clears >= 3 dan clears > confirms. */
export const OMO_CLEAR_THRESHOLD = 3

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // tanpa 0/O/1/I/L
export const OMO_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/
export const OMO_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/

export interface OmoUser extends SessionUser {
    avatar: string | null
}

export function getOmoDb(event: H3Event) {
    const db = getDB() || initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
    return db
}

/** Wajib login (cookie browser ATAU Bearer token aplikasi). */
export async function requireOmoUser(event: H3Event): Promise<OmoUser> {
    const db = getOmoDb(event)
    let user: SessionUser | null = event.context.sessionUser ?? null
    if (!user) {
        const token = getBearerToken(event)
        if (token) {
            const res = await resolveSessionToken(db, token).catch(() => null)
            if (res) {
                user = res.user
                event.context.sessionUser = res.user
                event.context.sessionId = res.sessionId
            }
        }
    }
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    const [row] = await db.select({ avatar: users.avatar }).from(users).where(eq(users.id, user.id)).limit(1)
    return { ...user, avatar: row?.avatar ?? null }
}

export function generateConvoyCode(): string {
    const bytes = new Uint8Array(6)
    globalThis.crypto.getRandomValues(bytes)
    let out = ''
    for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length]
    return out
}

export function omoNewId(): string {
    return globalThis.crypto.randomUUID()
}

export function omoJoinUrl(code: string): string {
    // Produksi selalu domain kanonik (baseUrl runtimeConfig dibekukan dari env SAAT BUILD dan bisa
    // berisi localhost bila build dijalankan lokal); domain ini juga dipakai App Links Android.
    const base = process.env.NODE_ENV === 'production'
        ? 'https://logicsekai.com'
        : (useRuntimeConfig().public.baseUrl as string || 'http://localhost:3000').replace(/\/$/, '')
    return `${base}/omo/konvoi/gabung?kode=${code}`
}

export function omoDistanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
    const R = 6371000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(bLat - aLat)
    const dLng = toRad(bLng - aLng)
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
    return typeof lat === 'number' && typeof lng === 'number'
        && Number.isFinite(lat) && Number.isFinite(lng)
        && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function cleanText(v: unknown, max: number): string {
    return String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
}

/** Konvoi aktif + keanggotaan aktif user. Lempar 404/403 bila tidak berhak. */
export async function requireConvoyMember(db: any, convoyId: string, userId: string) {
    if (!OMO_ID_PATTERN.test(convoyId)) throw createError({ statusCode: 404, statusMessage: 'Convoy not found' })
    const [convoy] = await db.select().from(omorideConvoys).where(eq(omorideConvoys.id, convoyId)).limit(1)
    if (!convoy) throw createError({ statusCode: 404, statusMessage: 'Convoy not found' })
    const [member] = await db.select().from(omorideConvoyMembers)
        .where(and(
            eq(omorideConvoyMembers.convoyId, convoyId),
            eq(omorideConvoyMembers.userId, userId),
            isNull(omorideConvoyMembers.leftMs),
        )).limit(1)
    if (!member) throw createError({ statusCode: 403, statusMessage: 'Not a member of this convoy' })
    return { convoy, member }
}

/** Stub Durable Object room, atau null bila binding tidak tersedia (mis. `nuxt dev`). */
export function getConvoyStub(event: H3Event, convoyId: string): any | null {
    const ns = event.context.cloudflare?.env?.CONVOY_ROOM
    if (!ns) return null
    return ns.get(ns.idFromName(convoyId))
}

/** Panggil endpoint internal DO (best-effort; error diabaikan bila DO tidak tersedia). */
export async function callConvoyRoom(event: H3Event, convoyId: string, path: string, body?: unknown): Promise<any | null> {
    const stub = getConvoyStub(event, convoyId)
    if (!stub) return null
    try {
        const res = await stub.fetch(`https://convoy.internal${path}`, body === undefined
            ? { method: 'GET' }
            : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export function convoyDto(c: any) {
    return {
        id: c.id,
        code: c.code,
        name: c.name,
        leaderId: c.leaderId,
        status: c.status,
        destination: c.destLat != null && c.destLng != null ? { lat: c.destLat, lng: c.destLng, name: c.destName ?? '' } : null,
        createdMs: c.createdMs,
        endedMs: c.endedMs ?? null,
        joinUrl: omoJoinUrl(c.code),
        wsPath: `/api/omoride/convoys/${c.id}/ws`,
    }
}

/** Masukkan user ke konvoi aktif (kode, tautan, atau terima undangan). Idempoten. */
export async function joinConvoy(db: any, convoy: any, userId: string) {
    const now = Date.now()
    const [existing] = await db.select().from(omorideConvoyMembers)
        .where(and(eq(omorideConvoyMembers.convoyId, convoy.id), eq(omorideConvoyMembers.userId, userId))).limit(1)

    if (!existing || existing.leftMs != null) {
        const [cnt] = await db.select({ n: sql<number>`count(*)` }).from(omorideConvoyMembers)
            .where(and(eq(omorideConvoyMembers.convoyId, convoy.id), isNull(omorideConvoyMembers.leftMs)))
        if (Number(cnt?.n ?? 0) >= OMO_MAX_MEMBERS) {
            throw createError({ statusCode: 409, statusMessage: `Konvoi penuh (maks. ${OMO_MAX_MEMBERS} anggota)` })
        }
    }

    if (!existing) {
        await db.insert(omorideConvoyMembers).values({ convoyId: convoy.id, userId, role: 'member', joinedMs: now })
    } else if (existing.leftMs != null) {
        await db.update(omorideConvoyMembers).set({ leftMs: null, joinedMs: now })
            .where(and(eq(omorideConvoyMembers.convoyId, convoy.id), eq(omorideConvoyMembers.userId, userId)))
    }

    // Undangan tertunda untuk konvoi ini otomatis dianggap diterima
    await db.update(omorideConvoyInvites).set({ status: 'accepted', respondedMs: now })
        .where(and(eq(omorideConvoyInvites.convoyId, convoy.id), eq(omorideConvoyInvites.toUserId, userId), eq(omorideConvoyInvites.status, 'pending')))

    const role = existing?.role ?? 'member'
    return { ...convoyDto(convoy), myRole: role }
}

/** Bentuk laporan untuk klien. Identitas pelapor tidak dibuka; hanya penanda `mine`. */
export function reportDto(r: any, viewerId?: string) {
    return {
        id: r.id,
        type: r.type,
        lat: r.lat,
        lng: r.lng,
        note: r.note ?? null,
        createdMs: r.createdMs,
        expiresMs: r.expiresMs,
        confirms: r.confirms ?? 0,
        clears: r.clears ?? 0,
        mine: !!viewerId && r.userId === viewerId,
    }
}
