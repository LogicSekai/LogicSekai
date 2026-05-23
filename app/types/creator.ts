// Creator related types

export interface CreatorProfile {
  id: string
  username: string
  name: string
  avatar?: string | null
  role: string
  verified?: boolean | null
  created?: string | null  stellarBadge?: boolean | null  headline?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  socialLinks: Record<string, string>
  donationLinks: Record<string, string>
  contactLinks: Record<string, string>
}

export interface CreatorProduct {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  thumbnailImage?: string | null
  thumbnail?: string | null
  basePrice: number
  currency: string
  discountType?: string | null
  discountValue?: number | null
  discountStartDate?: string | null
  discountEndDate?: string | null
  totalSales: number
  totalViews: number
  averageRating: number
  totalReviews: number
  status: string
  created?: string | null
  categories: string[]
  price: number
  originalPrice: number
  hasDiscount: boolean
  creator: { username: string; name: string; avatar?: string | null }
}

export interface CreatorPageData {
  creator: CreatorProfile
  stats: {
    totalProducts: number
    totalSales: number
    totalViews: number
    avgRating: number
  }
  products: CreatorProduct[]
}

export interface CreatorSettingsUser {
  id: string
  username: string
  name: string
  avatar?: string | null
  role: string
}

export interface CreatorSettingsProfile {
  headline: string | null
  bio: string | null
  location: string | null
  website: string | null
  socialLinks: Record<string, string>
  donationLinks: Record<string, string>
  contactLinks: Record<string, string>
}

export interface CreatorSettingsData {
  user: CreatorSettingsUser
  profile: CreatorSettingsProfile
}
