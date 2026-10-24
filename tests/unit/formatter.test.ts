import { describe, it, expect } from 'vitest'
import { useFormatter } from '../../app/composables/useFormatter'

const f = useFormatter()

describe('formatNumber', () => {
  it('meringkas dengan suffix K/M/B', () => {
    expect(f.formatNumber(0)).toBe('0')
    expect(f.formatNumber(999)).toBe('999')
    expect(f.formatNumber(1000)).toBe('1K')
    expect(f.formatNumber(1234)).toBe('1.2K')
    expect(f.formatNumber(1000000)).toBe('1M')
    expect(f.formatNumber(1500000)).toBe('1.5M')
    expect(f.formatNumber(1000000000)).toBe('1B')
  })
})

describe('formatFileSize', () => {
  it('format ukuran manusiawi', () => {
    expect(f.formatFileSize(0)).toBe('0 B')
    expect(f.formatFileSize(1024)).toBe('1 KB')
    expect(f.formatFileSize(1536)).toBe('1.5 KB')
    expect(f.formatFileSize(1048576)).toBe('1 MB')
  })
})

describe('format lainnya', () => {
  it('persentase & rating', () => {
    expect(f.formatPercentage(50)).toBe('50.0%')
    expect(f.formatPercentage(50, 0)).toBe('50%')
    expect(f.formatRating(4)).toBe('4.0 ★')
  })
  it('harga: 0 = Gratis, >0 = berformat ribuan', () => {
    expect(f.formatPrice(0)).toBe('Gratis')
    expect(f.formatPrice(1000)).toMatch(/1[.,]0{3}/)
  })
})
