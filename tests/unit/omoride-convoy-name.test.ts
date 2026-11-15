import { describe, expect, it } from 'vitest'
import { cleanConvoyName } from '../../server/omoride/convoy-name'

describe('cleanConvoyName', () => {
    it('menolak nama kosong / spasi / bukan string', () => {
        expect(cleanConvoyName('')).toBeNull()
        expect(cleanConvoyName('   ')).toBeNull()
        expect(cleanConvoyName(undefined)).toBeNull()
        expect(cleanConvoyName(123)).toBeNull()
    })

    it('menolak nama dari karakter tak terlihat atau tanpa huruf/angka', () => {
        expect(cleanConvoyName('\u200b\u200b\u200b\u200b')).toBeNull()
        expect(cleanConvoyName('\u3164\u3164\u3164')).toBeNull()
        expect(cleanConvoyName('...')).toBeNull()
        expect(cleanConvoyName('a\u200b\u200bb')).toBeNull() // jadi "ab" (2 karakter)
    })

    it('menolak nama terlalu pendek atau terlalu panjang', () => {
        expect(cleanConvoyName('ab')).toBeNull()
        expect(cleanConvoyName('a'.repeat(61))).toBeNull()
    })

    it('menerima & merapikan nama yang valid', () => {
        expect(cleanConvoyName('  Touring   Puncak \u202eMinggu ')).toBe('Touring Puncak Minggu')
        expect(cleanConvoyName('Konvoi 17')).toBe('Konvoi 17')
        expect(cleanConvoyName('🏍️ Bandung')).toBe('🏍 Bandung')
    })
})
