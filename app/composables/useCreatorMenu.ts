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
  HelpCircle
} from 'lucide-vue-next'

export const creatorMenuItems: readonly MenuItem[] = Object.freeze([
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutDashboard,
    url: '/creator',
    permission: Object.freeze(['admin.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator'])
  },
  {
    id: 'products',
    name: 'Produk',
    icon: Folder,
    permission: Object.freeze(['products.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator']),
    child: Object.freeze([
      {
        id: 'products-list',
        name: 'Semua Produk',
        icon: FileText,
        url: '/creator/products',
        permission: Object.freeze(['products.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'products-add',
        name: 'Tambah Produk',
        icon: Edit,
        url: '/creator/products/create',
        permission: Object.freeze(['products.create']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'products-categories',
        name: 'Kategori Produk',
        icon: Folder,
        url: '/creator/products/categories',
        permission: Object.freeze(['products.categories.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      }
    ])
  },
  {
    id: 'blog',
    name: 'Blog/Postingan',
    icon: FileText,
    permission: Object.freeze(['blog.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator']),
    child: Object.freeze([
      {
        id: 'blog-posts',
        name: 'Semua Postingan',
        icon: FileText,
        url: '/creator/blog/posts',
        permission: Object.freeze(['blog.posts.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'blog-create',
        name: 'Buat Postingan',
        icon: Edit,
        url: '/creator/blog/create',
        permission: Object.freeze(['blog.posts.create']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'blog-categories',
        name: 'Kategori Blog',
        icon: Folder,
        url: '/creator/blog/categories',
        permission: Object.freeze(['blog.categories.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'blog-media',
        name: 'Perpustakaan Media',
        icon: Image,
        url: '/creator/blog/media',
        permission: Object.freeze(['blog.media.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      }
    ])
  },
  {
    id: 'analytics',
    name: 'Analitik & Laporan',
    icon: BarChart3,
    permission: Object.freeze(['analytics.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator']),
    child: Object.freeze([
      {
        id: 'analytics-overview',
        name: 'Ringkasan',
        icon: TrendingUp,
        url: '/creator/analytics/overview',
        permission: Object.freeze(['analytics.overview.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'analytics-transactions',
        name: 'Laporan Transaksi',
        icon: Activity,
        url: '/creator/analytics/transactions',
        permission: Object.freeze(['analytics.transactions.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'analytics-sales',
        name: 'Analisis Penjualan',
        icon: Globe,
        url: '/creator/analytics/sales',
        permission: Object.freeze(['analytics.sales.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'analytics-performance',
        name: 'Performa Produk',
        icon: Zap,
        url: '/creator/analytics/performance',
        permission: Object.freeze(['analytics.performance.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      }
    ])
  },
  {
    id: 'reviews',
    name: 'Review/Ulasan',
    icon: UserCheck,
    permission: Object.freeze(['reviews.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator']),
    child: Object.freeze([
      {
        id: 'reviews-list',
        name: 'Semua Review',
        icon: Users,
        url: '/creator/reviews',
        permission: Object.freeze(['reviews.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'reviews-moderation',
        name: 'Moderasi Review',
        icon: Shield,
        url: '/creator/reviews/moderation',
        permission: Object.freeze(['reviews.moderate']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'reviews-ratings',
        name: 'Rating & Feedback',
        icon: TrendingUp,
        url: '/creator/reviews/ratings',
        permission: Object.freeze(['reviews.ratings.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      }
    ])
  },
  {
    id: 'settings',
    name: 'Pengaturan',
    icon: Settings,
    permission: Object.freeze(['settings.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator']),
    child: Object.freeze([
      {
        id: 'settings-profile',
        name: 'Profil',
        icon: Users,
        url: '/creator/settings/profile',
        permission: Object.freeze(['settings.profile.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'settings-general',
        name: 'Umum',
        icon: Cog,
        url: '/creator/settings/general',
        permission: Object.freeze(['settings.general.view']),
        roles: Object.freeze(['superadmin', 'admin'])
      },
      {
        id: 'settings-security',
        name: 'Keamanan',
        icon: Lock,
        url: '/creator/settings/security',
        permission: Object.freeze(['settings.security.view']),
        roles: Object.freeze(['superadmin'])
      },
      {
        id: 'settings-backup',
        name: 'Backup & Restore',
        icon: Database,
        url: '/creator/settings/backup',
        permission: Object.freeze(['settings.backup.view']),
        roles: Object.freeze(['superadmin'])
      }
    ])
  },
  {
    id: 'support',
    name: 'Dukungan & Bantuan',
    icon: HelpCircle,
    url: '/creator/support',
    permission: Object.freeze(['support.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator'])
  }
] as const)

// Helper function untuk mengecek akses menu berdasarkan role dan permission
export function hasCreatorMenuAccess(
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
export function getCreatorFilteredMenuItems(
  menuItems: readonly MenuItem[],
  userRole?: string,
  userPermissions?: string[]
): MenuItem[] {
  return menuItems
    .filter(item => hasCreatorMenuAccess(item, userRole, userPermissions))
    .map(item => {
      // Filter child items jika ada
      if (item.child?.length) {
        const filteredChildren = item.child.filter(
          child => hasCreatorMenuAccess(child, userRole, userPermissions)
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

// Composable untuk menggunakan creator/creator menu
export const useCreatorMenu = () => {
  return {
    creatorMenuItems,
    getCreatorFilteredMenuItems,
    hasCreatorMenuAccess
  }
}