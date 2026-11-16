import { describe, expect, it } from 'vitest'
import {
    deleteAllCloudFiles, gunzipText, gzipText, isJpeg, isPrivateKey, momentKey, parseStartMs, pointsKey, sha256Hex, validateTrip,
} from '../../server/omoride/cloud-sync'

const start = 1_800_000_000_000
const good = {
    endMs: start + 3_600_000, distanceM: 25_000, movingMs: 3_000_000, maxSpeed: 61.5, energyKwh: 0.9, costRp: 1300,
    category: 'BUSINESS', note: 'Kunjungan klien', startPlace: 'Mojokerto', endPlace: null,
    version: 'a1b2c3d4e5f6', points: '0,-7471234,112434567,0;1000,12,-8,253', pointsCount: 2,
}

describe('parseStartMs', () => {
    it('hanya 13 digit dalam rentang wajar', () => {
        expect(parseStartMs(String(start))).toBe(start)
        expect(parseStartMs('123')).toBeNull()
        expect(parseStartMs('1000000000000')).toBeNull() // 2001
        expect(parseStartMs('18000000000001')).toBeNull()
        expect(parseStartMs('18e11')).toBeNull()
        expect(parseStartMs(undefined)).toBeNull()
    })
})

describe('validateTrip', () => {
    it('menerima perjalanan valid & memotong teks', () => {
        const r = validateTrip({ ...good, note: 'x'.repeat(900) }, start)
        expect(typeof r).toBe('object')
        if (typeof r === 'object') {
            expect(r.note).toHaveLength(500)
            expect(r.endPlace).toBeNull()
            expect(r.category).toBe('BUSINESS')
        }
    })

    it('menolak nilai tidak masuk akal', () => {
        expect(validateTrip({ ...good, endMs: start - 1 }, start)).toBeTypeOf('string')
        expect(validateTrip({ ...good, distanceM: -1 }, start)).toBeTypeOf('string')
        expect(validateTrip({ ...good, maxSpeed: Number.NaN }, start)).toBeTypeOf('string')
        expect(validateTrip({ ...good, category: 'OTHER' }, start)).toBeTypeOf('string')
        expect(validateTrip({ ...good, version: 'xyz' }, start)).toBeTypeOf('string')
        expect(validateTrip(null, start)).toBeTypeOf('string')
    })

    it('jejak GPS hanya angka, koma, titik koma, minus', () => {
        expect(validateTrip({ ...good, points: '1,2;<script>' }, start)).toBeTypeOf('string')
        expect(validateTrip({ ...good, points: '' }, start)).toBeTypeOf('object')
    })
})

describe('kunci R2 pribadi', () => {
    it('semua kunci cadangan berada di prefix pribadi', () => {
        expect(isPrivateKey(pointsKey('u1', start))).toBe(true)
        expect(isPrivateKey(momentKey('u1', 'a'.repeat(64)))).toBe(true)
    })

    it('tidak bisa diakali dengan garis miring / ./ / huruf besar', () => {
        expect(isPrivateKey('/private/omoride/u1/x')).toBe(true)
        expect(isPrivateKey('./private/omoride/u1/x')).toBe(true)
        expect(isPrivateKey('PRIVATE/omoride/u1/x')).toBe(true)
        expect(isPrivateKey('uploads/avatars/u1.png')).toBe(false)
    })
})

describe('berkas', () => {
    it('gzip bolak-balik', async () => {
        const text = '0,1,2,3;'.repeat(5000)
        const gz = await gzipText(text)
        expect(gz.byteLength).toBeLessThan(text.length / 10)
        expect(await gunzipText(gz)).toBe(text)
    })

    it('sha256 & deteksi JPEG', async () => {
        expect(await sha256Hex(new TextEncoder().encode('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
        expect(isJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(true)
        expect(isJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false)
    })

    it('hapus semua berkas akun per halaman', async () => {
        const keys = Array.from({ length: 2500 }, (_, i) => `private/omoride/u1/moments/${i}.jpg`)
        const deleted: string[] = []
        const bucket = {
            list: async ({ cursor }: { cursor?: string }) => {
                const from = cursor ? Number(cursor) : 0
                const objects = keys.slice(from, from + 1000).filter((k) => !deleted.includes(k)).map((key) => ({ key }))
                const next = from + 1000
                return { objects, truncated: next < keys.length, cursor: String(next) }
            },
            delete: async (k: string[]) => { deleted.push(...k) },
        }
        expect(await deleteAllCloudFiles(bucket, 'u1')).toBe(2500)
    })
})
