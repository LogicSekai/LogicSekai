import { describe, it, expect } from 'vitest'
import { isVerified, formatVerificationDate } from '../../app/utils/verification'

describe('isVerified', () => {
  it('null/undefined → false', () => {
    expect(isVerified(null as any)).toBe(false)
    expect(isVerified(undefined as any)).toBe(false)
  })
  it('nilai tanggal → true', () => {
    expect(isVerified('2024-01-01' as any)).toBe(true)
  })
})

describe('formatVerificationDate', () => {
  it('kosong bila belum terverifikasi', () => {
    expect(formatVerificationDate(null as any)).toBe('')
  })
  it('mengembalikan string non-kosong untuk tanggal valid', () => {
    expect(formatVerificationDate('2024-01-15T10:00:00Z' as any)).not.toBe('')
  })
})
