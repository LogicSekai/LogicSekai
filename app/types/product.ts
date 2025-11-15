// Product related types

export interface Contributor {
    id: string
    username: string
    name: string
    email: string
    avatar?: string
    role: string // 'contributor', 'co-author', 'designer', etc.
}

export interface ProductFormData {
    title: string
    description: string
    shortDescription?: string
    features: string[]
    tags: string[]
    
    // Contributors
    contributors: Contributor[]
    
    // Product details
    releaseDate?: Date
    version?: string
    
    // Documentation & Links
    documentationUrl?: string
    livePreviewUrl?: string
    externalUrls: ExternalUrl[]
    
    // License & Support
    licenseType: string
    supportType: string
    
    // Media
    thumbnailImage?: string
    previewImages: string[]
    productFiles: ProductFile[]
    
    // Stock & Availability
    stockType: 'limited' | 'unlimited'
    stockQuantity?: number
    isAvailable: boolean
    
    // Pricing
    basePrice: number
    currency: string
    
    // Discount
    discountType?: 'flat' | 'percentage'
    discountValue?: number
    discountStartDate?: Date
    discountEndDate?: Date
    
    // Categories
    categoryIds: string[]
    
    // Status
    status: 'draft' | 'published'
}

export interface ExternalUrl {
    label: string
    url: string
    type?: 'demo' | 'repository' | 'documentation' | 'other'
}

export interface ProductFile {
    id: string
    name: string
    url?: string // for external files
    file?: File // for uploaded files
    type: 'upload' | 'external'
    size?: number
    format?: string
}

export interface ProductReviewData {
    rating: number
    review?: string
    productId: string
}

export interface ProductStats {
  totalViews: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
}

export interface FileUploadResult {
  url: string
  filename: string
  originalName: string
  size: number
  type: string
}// Currency utilities for redenomination support
export interface CurrencyConfig {
    code: string
    symbol: string
    decimals: number
    redenominationFactor?: number // e.g., 1000 for removing 3 zeros
    displayFormat?: 'full' | 'compact' // e.g., 1000000 vs 1M
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
    IDR: {
        code: 'IDR',
        symbol: 'Rp',
        decimals: 0,
        redenominationFactor: 1000, // Support for potential IDR redenomination
        displayFormat: 'compact'
    },
    USD: {
        code: 'USD',
        symbol: '$',
        decimals: 2,
        displayFormat: 'full'
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        decimals: 2,
        displayFormat: 'full'
    }
}

export const LICENSE_TYPES = [
    { value: 'free', label: 'Free' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'open_source', label: 'Open Source' },
    { value: 'creative_commons', label: 'Creative Commons' },
    { value: 'proprietary', label: 'Proprietary' },
    { value: 'other', label: 'Other' }
]

export const SUPPORT_TYPES = [
    { value: 'community', label: 'Community Support' },
    { value: 'email', label: 'Email Support' },
    { value: 'priority', label: 'Priority Support' },
    { value: 'phone', label: 'Phone Support' },
    { value: 'none', label: 'No Support' }
]

export const PRODUCT_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'orange' }
]

// Utility functions
export function formatCurrency(amount: number, currencyCode: string = 'IDR'): string {
    const config = SUPPORTED_CURRENCIES[currencyCode]
    if (!config) return amount.toString()
    
    let displayAmount = amount
    
    // Apply redenomination if needed
    if (config.redenominationFactor && amount >= config.redenominationFactor * 100) {
        displayAmount = amount / config.redenominationFactor
    }
    
    // Format based on display preference
    if (config.displayFormat === 'compact' && displayAmount >= 1000000) {
        const millions = displayAmount / 1000000
        return `${config.symbol}${millions.toFixed(1)}M`
    } else if (config.displayFormat === 'compact' && displayAmount >= 1000) {
        const thousands = displayAmount / 1000
        return `${config.symbol}${thousands.toFixed(1)}K`
    }
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
    }).format(displayAmount)
}

export function formatCompactNumber(num: number): string {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B'
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export function calculateDiscountedPrice(basePrice: number, discountType?: string, discountValue?: number): number {
    if (!discountType || !discountValue) return basePrice
    
    if (discountType === 'percentage') {
        return basePrice * (1 - discountValue / 100)
    } else if (discountType === 'flat') {
        return Math.max(0, basePrice - discountValue)
    }
    
    return basePrice
}