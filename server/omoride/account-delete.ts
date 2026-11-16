/**
 * Penghapusan akun untuk OmoRide (syarat Google Play: pengguna bisa menghapus akun & datanya dari
 * aplikasi dan dari web).
 *
 * - `omoride`: hapus semua data OmoRide (keanggotaan & undangan konvoi, profil, laporan jalan &
 *   suaranya, cadangan cloud perjalanan & foto). Konvoi yang dipimpin diakhiri untuk semua
 *   anggota. Akun Logic Sekai tetap ada.
 * - `all`: data OmoRide + akun Logic Sekai: ditandai terhapus, data pribadi dianonimkan (nama, email,
 *   username, foto, kata sandi), semua sesi dicabut. Riwayat transaksi tetap ada untuk pembukuan,
 *   tetapi tidak lagi terhubung ke identitas.
 */
import type { H3Event } from 'h3'
import { and, eq, isNull, or } from 'drizzle-orm'
import {
    omorideConvoyInvites, omorideConvoyMembers, omorideConvoys, omorideEntitlements, omorideProfiles,
    omorideReportVotes, omorideReports, omorideTripMoments, omorideTrips, userSessions, users,
} from '~/lib/db/schema'
import { deleteAllCloudFiles } from './cloud-sync'

export type DeleteScope = 'omoride' | 'all'

export async function deleteOmoRideData(event: H3Event, db: any, userId: string) {
    const now = Date.now()
    // Konvoi aktif yang dipimpin → diakhiri untuk semua (lokasi berhenti dibagikan).
    const led = await db.select({ id: omorideConvoys.id }).from(omorideConvoys)
        .where(and(eq(omorideConvoys.leaderId, userId), eq(omorideConvoys.status, 'active')))
    for (const c of led) {
        await db.update(omorideConvoys).set({ status: 'ended', endedMs: now }).where(eq(omorideConvoys.id, c.id))
        await callConvoyRoom(event, c.id, '/end', {})
    }
    // Konvoi lain yang diikuti → keluar (socket ditutup).
    const joined = await db.select({ convoyId: omorideConvoyMembers.convoyId }).from(omorideConvoyMembers)
        .where(and(eq(omorideConvoyMembers.userId, userId), isNull(omorideConvoyMembers.leftMs)))
    for (const m of joined) await callConvoyRoom(event, m.convoyId, '/kick', { userId })
    await db.delete(omorideConvoyMembers).where(eq(omorideConvoyMembers.userId, userId))
    await db.delete(omorideConvoyInvites)
        .where(or(eq(omorideConvoyInvites.fromUserId, userId), eq(omorideConvoyInvites.toUserId, userId)))
    await db.delete(omorideReportVotes).where(eq(omorideReportVotes.userId, userId))
    await db.delete(omorideReports).where(eq(omorideReports.userId, userId))
    await db.delete(omorideProfiles).where(eq(omorideProfiles.userId, userId))
    // Cadangan cloud (jejak GPS & foto momen): berkas R2 lalu barisnya.
    const bucket = event.context.cloudflare?.env?.BUCKET
    const cloudFiles = bucket ? await deleteAllCloudFiles(bucket, userId) : 0
    await db.delete(omorideTripMoments).where(eq(omorideTripMoments.userId, userId))
    await db.delete(omorideTrips).where(eq(omorideTrips.userId, userId))
    return { convoysEnded: led.length, convoysLeft: joined.length, cloudFiles }
}

/** Akun Logic Sekai: tandai terhapus, anonimkan data pribadi, cabut semua sesi. */
export async function deleteLogicSekaiAccount(db: any, userId: string) {
    const tag = userId.slice(-8).toLowerCase()
    const random = crypto.randomUUID() + crypto.randomUUID()
    await db.update(users).set({
        deleted: new Date(),
        updated: new Date(),
        name: 'Akun dihapus',
        username: `dihapus_${tag}_${Date.now().toString(36)}`,
        email: `dihapus+${userId}@deleted.invalid`,
        avatar: null,
        // Kata sandi acak yang tidak diketahui siapa pun (bukan hash valid dari input pengguna).
        password: `deleted:${random}`,
    }).where(eq(users.id, userId))
    await db.delete(userSessions).where(eq(userSessions.userId, userId))
    // Hak langganan dihapus bersama akun (langganan Google Play tetap dibatalkan pengguna di Play Store).
    await db.delete(omorideEntitlements).where(eq(omorideEntitlements.userId, userId))
}
