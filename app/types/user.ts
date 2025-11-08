/**
 * User Types
 * Defines interfaces and types for user-related data structures
 */

// Base User Role Types
export type UserRole = 'user' | 'creator' | 'superadmin'

// User Verification Status
export type VerificationStatus = boolean

// Base User Interface
export interface User {
    id: string
    username: string
    name: string
    email: string
    avatar: string | null
    role: UserRole
    verified: VerificationStatus
    created: string
    updated: string
}

// Extended User Interface with additional fields (for detailed views)
export interface UserDetails extends User {
    bio?: string
    website?: string
    location?: string
    birthDate?: string
    phoneNumber?: string
    socialLinks?: {
        twitter?: string
        linkedin?: string
        github?: string
    }
    preferences?: {
        theme: 'light' | 'dark' | 'system'
        language: string
        notifications: {
            email: boolean
            push: boolean
            sms: boolean
        }
    }
    stats?: {
        loginCount: number
        lastLogin: string
        createdContent: number
        followers: number
        following: number
    }
}

// User Creation/Registration Interface
export interface CreateUserRequest {
    username: string
    name: string
    email: string
    password: string
    role?: UserRole
    verified?: VerificationStatus
}

// User Update Interface
export interface UpdateUserRequest {
    username?: string
    name?: string
    email?: string
    avatar?: string | null
    bio?: string
    website?: string
    location?: string
    birthDate?: string
    phoneNumber?: string
    socialLinks?: {
        twitter?: string
        linkedin?: string
        github?: string
    }
    preferences?: {
        theme?: 'light' | 'dark' | 'system'
        language?: string
        notifications?: {
            email?: boolean
            push?: boolean
            sms?: boolean
        }
    }
}

// Admin-specific User Update Interface
export interface AdminUpdateUserRequest extends UpdateUserRequest {
    role?: UserRole
    verified?: VerificationStatus
    password?: string
}

// User Filter Interface (for admin tables and search)
export interface UserFilter {
    search?: string
    role?: UserRole | ''
    verified?: VerificationStatus | ''
    dateFrom?: string
    dateTo?: string
    sortBy?: 'name' | 'email' | 'created' | 'updated'
    sortOrder?: 'asc' | 'desc'
}

// Pagination Interface
export interface UserPagination {
    page: number
    limit: number
    total: number
    pages: number
}

// User API Response Interfaces
export interface UserResponse {
    success: boolean
    user?: User
    message?: string
    error?: string
}

export interface UsersResponse {
    success: boolean
    users?: User[]
    pagination?: UserPagination
    message?: string
    error?: string
}

export interface UserStatsResponse {
    success: boolean
    stats?: {
        totalUsers: number
        verifiedUsers: number
        unverifiedUsers: number
        usersByRole: {
            user: number
            creator: number
            superadmin: number
        }
        recentUsers: User[]
        activeUsers: number
    }
    message?: string
    error?: string
}

// User Session Interface
export interface UserSession {
    id: string
    name: string
    email: string
    username: string
    avatar: string | null
    role: UserRole
    verified: VerificationStatus
    permissions?: string[]
    sessionId: string
    expiresAt: string
}

// User Permission Types
export type Permission = 
    | 'users.view'
    | 'users.create' 
    | 'users.update'
    | 'users.delete'
    | 'users.verify'
    | 'content.view'
    | 'content.create'
    | 'content.update'
    | 'content.delete'
    | 'content.publish'
    | 'settings.view'
    | 'settings.update'
    | 'admin.access'

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    user: [
        'content.view',
        'content.create'
    ],
    creator: [
        'content.view',
        'content.create',
        'content.update',
        'content.delete',
        'content.publish'
    ],
    superadmin: [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'users.verify',
        'content.view',
        'content.create',
        'content.update',
        'content.delete',
        'content.publish',
        'settings.view',
        'settings.update',
        'admin.access'
    ]
}

// User Utility Types
export interface UserTableRow extends User {
    isSelected?: boolean
    isUpdating?: boolean
}

// Form Validation Schemas (for use with Zod or similar)
export interface UserValidationErrors {
    username?: string[]
    name?: string[]
    email?: string[]
    password?: string[]
    role?: string[]
    general?: string[]
}

// User Activity Log Interface
export interface UserActivity {
    id: string
    userId: string
    action: string
    details: string
    ipAddress: string
    userAgent: string
    timestamp: string
}

// Bulk Operations Interface
export interface BulkUserOperation {
    userIds: string[]
    operation: 'delete' | 'verify' | 'unverify' | 'updateRole'
    data?: {
        role?: UserRole
        verified?: VerificationStatus
    }
}

export interface BulkUserResponse {
    success: boolean
    processed: number
    failed: number
    errors?: Array<{
        userId: string
        error: string
    }>
    message?: string
}