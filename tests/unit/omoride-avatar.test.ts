import { describe, expect, it } from 'vitest'
import { omoAvatarUrl } from '../../server/omoride/avatar'

describe('omoAvatarUrl', () => {
    it('meneruskan path & https pendek apa adanya', () => {
        expect(omoAvatarUrl('u1', '/api/files/uploads/avatars/a.png')).toBe('/api/files/uploads/avatars/a.png')
        expect(omoAvatarUrl('u1', 'https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
    })

    it('mengganti data URI dengan URL avatar ber-hash yang stabil', () => {
        const data = 'data:image/jpeg;base64,' + 'A'.repeat(70_000)
        const url = omoAvatarUrl('u1', data)
        expect(url).toMatch(/^\/api\/omoride\/avatars\/u1\?v=[0-9a-f]{8}$/)
        expect(omoAvatarUrl('u1', data)).toBe(url)
        expect(omoAvatarUrl('u1', data + 'B')).not.toBe(url)
    })

    it('menolak nilai kosong, http polos, dan URL kepanjangan', () => {
        expect(omoAvatarUrl('u1', null)).toBeNull()
        expect(omoAvatarUrl('u1', '')).toBeNull()
        expect(omoAvatarUrl('u1', 'http://x.test/a.png')).toBeNull()
        expect(omoAvatarUrl('u1', '/' + 'a'.repeat(400))).toBeNull()
    })
})
