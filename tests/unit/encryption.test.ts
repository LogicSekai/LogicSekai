import { describe, it, expect, beforeAll } from 'vitest'
import { randomBytes } from 'node:crypto'
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  maskIp,
  generateCallbackToken,
  encryptedKeyVersion,
  needsRotation,
} from '../../server/utils/encryption'

beforeAll(() => {
  // Kunci master 32-byte (256-bit) base64 untuk pengujian
  process.env.ENCRYPTION_MASTER_KEY = randomBytes(32).toString('base64')
})

describe('AES-256-GCM encrypt/decrypt', () => {
  it('roundtrip mengembalikan plaintext asli', async () => {
    const secret = 'SB-Mid-server-secret-123'
    const ct = await encryptSecret(secret)
    expect(ct).toMatch(/^v1:/)
    expect(await decryptSecret(ct)).toBe(secret)
  })

  it('menghasilkan ciphertext berbeda tiap kali (IV acak)', async () => {
    const a = await encryptSecret('same')
    const b = await encryptSecret('same')
    expect(a).not.toBe(b)
    expect(await decryptSecret(a)).toBe('same')
    expect(await decryptSecret(b)).toBe('same')
  })

  it('mendeteksi tampering lewat auth tag', async () => {
    const ct = await encryptSecret('tamper-me')
    const tampered = ct.slice(0, -2) + (ct.slice(-2) === 'AA' ? 'BB' : 'AA')
    await expect(decryptSecret(tampered)).rejects.toThrow()
  })

  it('menolak format ciphertext invalid', async () => {
    await expect(decryptSecret('not-valid')).rejects.toThrow()
    await expect(decryptSecret('x9:abc')).rejects.toThrow()
  })

  it('encryptedKeyVersion & needsRotation bekerja', async () => {
    const ct = await encryptSecret('v')
    expect(encryptedKeyVersion(ct)).toBe(1)
    expect(needsRotation(ct)).toBe(false)
    expect(encryptedKeyVersion('garbage')).toBe(0)
  })
})

describe('maskSecret', () => {
  it('hanya menampilkan 4 karakter terakhir', () => {
    expect(maskSecret('SB-Mid-server-AbCdEfGh')).toBe('••••••••••••••••••EfGh')
  })
  it('secret pendek/kosong di-mask penuh', () => {
    expect(maskSecret('abc')).toBe('••••')
    expect(maskSecret('')).toBe('••••••••••••')
  })
})

describe('maskIp', () => {
  it('menyembunyikan oktet/grup terakhir', () => {
    expect(maskIp('192.168.1.42')).toBe('192.168.1.*')
    expect(maskIp('2001:db8::1')).toBe('2001:db8::****')
  })
  it('membiarkan nilai unknown', () => {
    expect(maskIp('unknown')).toBe('unknown')
  })
})

describe('generateCallbackToken', () => {
  it('64 hex chars dan acak', () => {
    const t = generateCallbackToken()
    expect(t).toMatch(/^[0-9a-f]{64}$/)
    expect(generateCallbackToken()).not.toBe(t)
  })
})
