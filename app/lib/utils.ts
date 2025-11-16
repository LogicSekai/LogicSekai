import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers into readable format
 * Examples: 1234 -> "1.2K", 1000000 -> "1M", 1500000 -> "1.5M"
 */
export function formatNumber(num: number): string {
  if (num === 0) return "0"
  
  const absNum = Math.abs(num)
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  
  return num.toString()
}

/**
 * Format views count with proper suffix
 */
export function formatViews(views: number): string {
  const formatted = formatNumber(views)
  return `${formatted} ${views === 1 ? 'Dilihat' : 'Dilihat'}`
}

/**
 * Format sales count with proper suffix
 */
export function formatSales(sales: number): string {
  const formatted = formatNumber(sales)
  return `${formatted} ${sales === 1 ? 'Terjual' : 'Terjual'}`
}