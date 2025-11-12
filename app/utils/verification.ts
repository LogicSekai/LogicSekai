/**
 * Verification Utilities
 * Helper functions for working with user verification dates
 */

import type { VerificationStatus } from '~/types'

/**
 * Check if a user is verified
 */
export function isVerified(verified: VerificationStatus): boolean {
    return verified !== null && verified !== undefined
}

/**
 * Format verification date for display
 */
export function formatVerificationDate(
    verified: VerificationStatus, 
    locale: string = 'id-ID'
): string {
    if (!isVerified(verified)) {
        return ''
    }
    
    try {
        const date = new Date(verified!)
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return 'Invalid date'
    }
}

/**
 * Format verification date and time for display
 */
export function formatVerificationDateTime(
    verified: VerificationStatus,
    locale: string = 'id-ID'
): string {
    if (!isVerified(verified)) {
        return ''
    }
    
    try {
        const date = new Date(verified!)
        return date.toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return 'Invalid date'
    }
}

/**
 * Get relative time since verification
 */
export function getVerificationAge(verified: VerificationStatus): string {
    if (!isVerified(verified)) {
        return 'Not verified'
    }
    
    try {
        const verifiedDate = new Date(verified!)
        const now = new Date()
        const diffMs = now.getTime() - verifiedDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        
        if (diffDays > 0) {
            return `${diffDays} hari yang lalu`
        } else if (diffHours > 0) {
            return `${diffHours} jam yang lalu`
        } else if (diffMinutes > 0) {
            return `${diffMinutes} menit yang lalu`
        } else {
            return 'Baru saja'
        }
    } catch (error) {
        return 'Unknown'
    }
}

/**
 * Create verification date (current timestamp)
 */
export function createVerificationDate(): string {
    return new Date().toISOString()
}

/**
 * Get verification badge info for display
 */
export function getVerificationBadgeInfo(verified: VerificationStatus) {
    const isUserVerified = isVerified(verified)
    
    return {
        isVerified: isUserVerified,
        badgeClass: isUserVerified 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        text: isUserVerified ? 'Verified' : 'Unverified',
        date: isUserVerified ? formatVerificationDate(verified) : null,
        tooltip: isUserVerified 
            ? `Verified on ${formatVerificationDateTime(verified)}`
            : 'User has not been verified yet'
    }
}