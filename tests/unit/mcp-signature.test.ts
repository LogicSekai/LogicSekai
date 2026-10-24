import { describe, it, expect } from 'vitest'
import {
    buildCanonicalString,
    createSignedHeaders,
    generateClientId,
    generateSigningSecret,
    ipMatchesAllowlist,
    isTimestampFresh,
    isValidIpRule,
    sha256Hex,
    signCanonical,
    verifySignature,
    CLIENT_ID_PATTERN,
    NONCE_PATTERN,
} from '../../server/utils/mcp/signature'

const canon = (over: Partial<Parameters<typeof buildCanonicalString>[0]> = {}) =>
    buildCanonicalString({
        method: 'POST', path: '/api/mcp', clientId: 'mcp_000000000000000000000000',
        timestamp: '1760000000', nonce: 'abcdefghijklmnop', sessionId: null,
        bodySha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', ...over,
    })

describe('MCP signature', () => {
    it('generator menghasilkan format yang valid & unik', () => {
        const id = generateClientId()
        expect(id).toMatch(CLIENT_ID_PATTERN)
        expect(generateClientId()).not.toBe(id)
        const s = generateSigningSecret()
        expect(s.startsWith('lsmcp_sk_')).toBe(true)
        expect(s.length).toBeGreaterThanOrEqual(9 + 43)
    })

    it('sha256Hex sesuai vektor standar', async () => {
        expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
        expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })

    it('sign → verify berhasil dengan secret yang sama', async () => {
        const secret = generateSigningSecret()
        const sig = await signCanonical(secret, canon())
        expect(sig).toMatch(/^v1=[A-Za-z0-9_-]{43}$/)
        expect(await verifySignature(secret, canon(), sig)).toBe(true)
    })

    it('gagal bila secret berbeda', async () => {
        const sig = await signCanonical(generateSigningSecret(), canon())
        expect(await verifySignature(generateSigningSecret(), canon(), sig)).toBe(false)
    })

    it('gagal bila komponen apa pun diubah (body, path, nonce, sesi, client)', async () => {
        const secret = generateSigningSecret()
        const sig = await signCanonical(secret, canon())
        for (const over of [
            { bodySha256: 'f'.repeat(64) },
            { path: '/api/mcp2' },
            { method: 'DELETE' },
            { nonce: 'zzzzzzzzzzzzzzzz' },
            { sessionId: 'deadbeef' },
            { clientId: 'mcp_111111111111111111111111' },
            { timestamp: '1760000001' },
        ]) {
            expect(await verifySignature(secret, canon(over), sig)).toBe(false)
        }
    })

    it('menolak header signature yang rusak', async () => {
        const secret = generateSigningSecret()
        for (const h of ['', 'v1=', 'v2=abc', 'abc', 'v1=!!!!', 'v1=' + 'A'.repeat(10)]) {
            expect(await verifySignature(secret, canon(), h)).toBe(false)
        }
    })

    it('createSignedHeaders cocok dengan verifikasi server', async () => {
        const secret = generateSigningSecret()
        const clientId = generateClientId()
        const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' })
        const h = await createSignedHeaders({ clientId, secret, body, sessionId: 'sess1' })
        expect(h['X-MCP-Nonce']).toMatch(NONCE_PATTERN)
        const c = buildCanonicalString({
            method: 'POST', path: '/api/mcp', clientId, timestamp: h['X-MCP-Timestamp'],
            nonce: h['X-MCP-Nonce'], sessionId: 'sess1', bodySha256: await sha256Hex(body),
        })
        expect(await verifySignature(secret, c, h['X-MCP-Signature'])).toBe(true)
    })

    it('jendela timestamp ±300 detik', () => {
        const now = 1_760_000_000_000
        expect(isTimestampFresh('1760000000', now)).toBe(true)
        expect(isTimestampFresh('1759999701', now)).toBe(true)
        expect(isTimestampFresh('1759999699', now)).toBe(false)
        expect(isTimestampFresh('1760000301', now)).toBe(false)
        expect(isTimestampFresh('abc', now)).toBe(false)
        expect(isTimestampFresh('1760000000000', now)).toBe(false) // milidetik ditolak
    })
})

describe('IP allowlist', () => {
    it('kosong = semua IP diizinkan', () => {
        expect(ipMatchesAllowlist('1.2.3.4', [])).toBe(true)
    })
    it('cocok exact & CIDR', () => {
        expect(ipMatchesAllowlist('203.0.113.10', ['203.0.113.10'])).toBe(true)
        expect(ipMatchesAllowlist('10.0.0.77', ['10.0.0.0/24'])).toBe(true)
        expect(ipMatchesAllowlist('10.0.1.77', ['10.0.0.0/24'])).toBe(false)
        expect(ipMatchesAllowlist('8.8.8.8', ['0.0.0.0/0'])).toBe(true)
        expect(ipMatchesAllowlist('2001:db8::1', ['2001:db8::1'])).toBe(true)
        expect(ipMatchesAllowlist('2001:db8::2', ['2001:db8::1', '10.0.0.0/8'])).toBe(false)
    })
    it('validasi aturan', () => {
        expect(isValidIpRule('10.0.0.0/24')).toBe(true)
        expect(isValidIpRule('1.2.3.4')).toBe(true)
        expect(isValidIpRule('2001:db8::1')).toBe(true)
        expect(isValidIpRule('10.0.0.0/33')).toBe(false)
        expect(isValidIpRule('999.1.1.1')).toBe(false)
        expect(isValidIpRule('hello')).toBe(false)
    })
})
