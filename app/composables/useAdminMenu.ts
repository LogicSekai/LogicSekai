import type { Component } from 'vue'
import type { MenuItem } from '~/types'
import { 
    LayoutDashboard, 
    Users, 
    UserCheck, 
    Shield, 
    Activity,
    FileText, 
    Edit, 
    Folder, 
    Image,
    BarChart3, 
    TrendingUp, 
    Globe, 
    Zap,
    Settings, 
    Cog, 
    Lock, 
    Database,
    HelpCircle,
    Mail,
    Flag,
    MessageSquare,
} from 'lucide-vue-next'

export const adminMenuItems: readonly MenuItem[] = Object.freeze([
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: LayoutDashboard,
        url: '/admin',
        permission: Object.freeze(['admin.view']),
        roles: Object.freeze(['superadmin', 'admin'])
    },
    {
        id: 'products',
        name: 'Manajemen Produk',
        icon: Folder,
        permission: Object.freeze(['products.view']),
        roles: Object.freeze(['superadmin', 'admin', 'editor']),
        child: Object.freeze([
            {
                id: 'products-posts',
                name: 'Semua Produk',
                icon: FileText,
                url: '/admin/products',
                permission: Object.freeze(['products.view']),
                roles: Object.freeze(['superadmin', 'admin', 'editor'])
            },
            {
                id: 'products-categories',
                name: 'Kategori Produk',
                icon: Folder,
                url: '/admin/products/categories',
                permission: Object.freeze(['products.categories.view']),
                roles: Object.freeze(['superadmin', 'admin', 'editor'])
            },
            {
                id: 'products-reports',
                name: 'Laporan Produk',
                icon: Flag,
                url: '/admin/reports',
                permission: Object.freeze(['products.reports.view']),
                roles: Object.freeze(['superadmin', 'admin'])
            },
        ])
    },
    {
        id: 'articles',
        name: 'Artikel & Postingan',
        icon: Edit,
        permission: Object.freeze(['content.view']),
        roles: Object.freeze(['superadmin', 'admin', 'editor']),
        child: Object.freeze([
            {
                id: 'articles-list',
                name: 'Semua Artikel',
                icon: FileText,
                url: '/admin/articles',
                permission: Object.freeze(['content.view']),
                roles: Object.freeze(['superadmin', 'admin', 'editor'])
            },
            {
                id: 'articles-comments',
                name: 'Komentar Artikel',
                icon: MessageSquare,
                url: '/admin/articles/comments',
                permission: Object.freeze(['content.view']),
                roles: Object.freeze(['superadmin', 'admin'])
            },
        ])
    },
    {
        id: 'users',
        name: 'Manajemen Pengguna',
        icon: Users,
        permission: Object.freeze(['users.view']),
        roles: Object.freeze(['superadmin', 'admin']),
        child: Object.freeze([
        {
            id: 'users-list',
            name: 'Semua Pengguna',
            icon: UserCheck,
            url: '/admin/users',
            permission: Object.freeze(['users.view']),
            roles: Object.freeze(['superadmin', 'admin'])
        },
        {
            id: 'users-roles',
            name: 'Peran Pengguna',
            icon: Shield,
            url: '/admin/users/roles',
            permission: Object.freeze(['users.roles.view']),
            roles: Object.freeze(['superadmin'])
        },
        {
            id: 'users-activity',
            name: 'Aktivitas Pengguna',
            icon: Activity,
            url: '/admin/users/activity',
            permission: Object.freeze(['users.activity.view']),
            roles: Object.freeze(['superadmin', 'admin'])
        }
        ])
    },
    {
        id: 'analytics',
        name: 'Analitik & Laporan',
        icon: BarChart3,
        permission: Object.freeze(['analytics.view']),
        roles: Object.freeze(['superadmin', 'admin']),
        child: Object.freeze([
        {
            id: 'analytics-overview',
            name: 'Ringkasan',
            icon: TrendingUp,
            url: '/admin/analytics/overview',
            permission: Object.freeze(['analytics.overview.view']),
            roles: Object.freeze(['superadmin', 'admin'])
        },
        {
            id: 'analytics-traffic',
            name: 'Analisis Traffic',
            icon: Globe,
            url: '/admin/analytics/traffic',
            permission: Object.freeze(['analytics.traffic.view']),
            roles: Object.freeze(['superadmin', 'admin'])
        },
        {
            id: 'analytics-performance',
            name: 'Performa',
            icon: Zap,
            url: '/admin/analytics/performance',
            permission: Object.freeze(['analytics.performance.view']),
            roles: Object.freeze(['superadmin', 'admin'])
        }
        ])
    },
    {
        id: 'contacts',
        name: 'Pesan Kontak',
        icon: Mail,
        url: '/admin/contacts',
        permission: Object.freeze(['contacts.view']),
        roles: Object.freeze(['superadmin', 'admin'])
    },
    {
        id: 'gallery',
        name: 'Galeri',
        icon: Image,
        url: '/admin/gallery',
        permission: Object.freeze(['gallery.view']),
        roles: Object.freeze(['superadmin'])
    },
    {
        id: 'settings',
        name: 'Pengaturan Sistem',
        icon: Settings,
        permission: Object.freeze(['settings.view']),
        roles: Object.freeze(['superladmin']),
        child: Object.freeze([
        {
            id: 'settings-general',
            name: 'Umum',
            icon: Cog,
            url: '/admin/settings/general',
            permission: Object.freeze(['settings.general.view']),
            roles: Object.freeze(['superadmin'])
        },
        {
            id: 'settings-security',
            name: 'Keamanan',
            icon: Lock,
            url: '/admin/settings/security',
            permission: Object.freeze(['settings.security.view']),
            roles: Object.freeze(['superadmin'])
        },
        {
            id: 'settings-backup',
            name: 'Backup & Restore',
            icon: Database,
            url: '/admin/settings/backup',
            permission: Object.freeze(['settings.backup.view']),
            roles: Object.freeze(['superadmin'])
        }
        ])
    },
    {
        id: 'support',
        name: 'Dukungan & Bantuan',
        icon: HelpCircle,
        url: '/admin/support',
        permission: Object.freeze(['support.view']),
        roles: Object.freeze(['superadmin', 'admin', 'editor'])
    }
] as const)

// Helper function untuk mengecek akses menu berdasarkan role dan permission
export function hasMenuAccess(
    menuItem: MenuItem, 
    userRole?: string, 
    userPermissions?: string[]
): boolean {
    // Jika tidak ada user role atau permission, return false
    if (!userRole && !userPermissions?.length) {
        return false
    }

    // Cek role access
    const hasRoleAccess = menuItem.roles?.includes(userRole as any) ?? false

    // Cek permission access
    const hasPermissionAccess = menuItem.permission?.some(
        permission => userPermissions?.includes(permission)
    ) ?? false

    // Return true jika memiliki role atau permission yang sesuai
    return hasRoleAccess || hasPermissionAccess
}

// Helper function untuk filter menu berdasarkan akses user
export function getFilteredMenuItems(
    menuItems: readonly MenuItem[],
    userRole?: string,
    userPermissions?: string[]
): MenuItem[] {
    return menuItems
        .filter(item => hasMenuAccess(item, userRole, userPermissions))
        .map(item => {
            // Filter child items jika ada
            if (item.child?.length) {
                const filteredChildren = item.child.filter(
                child => hasMenuAccess(child, userRole, userPermissions)
                )
                
                // Jika ada child yang tersisa, include parent dengan filtered children
                if (filteredChildren.length > 0) {
                return { ...item, child: filteredChildren }
                }
                
                // Jika tidak ada child yang bisa diakses, skip parent ini
                return null
            }
            
            return item
        })
        .filter((item): item is MenuItem => item !== null)
}

// Composable untuk menggunakan admin menu
export const useAdminMenu = () => {
    return {
        adminMenuItems,
        getFilteredMenuItems,
        hasMenuAccess
    }
}