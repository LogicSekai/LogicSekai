import type { Component } from 'vue'
import type { MenuItem } from '~/types'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  Edit, 
  Folder,
  BarChart3, 
  TrendingUp, 
  Activity,
  Settings,
  CreditCard,
  HelpCircle,
  Receipt
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
    id: 'transactions',
    name: 'Transaksi',
    icon: Receipt,
    url: '/creator/transactions',
    permission: Object.freeze(['analytics.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator'])
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
      }
    ])
  },
  {
    id: 'reviews',
    name: 'Review/Ulasan',
    icon: UserCheck,
    url: '/creator/reviews',
    permission: Object.freeze(['reviews.view']),
    roles: Object.freeze(['superadmin', 'admin', 'creator'])
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
        name: 'Umum',
        icon: Users,
        url: '/creator/settings/profile',
        permission: Object.freeze(['settings.profile.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
      {
        id: 'settings-payment',
        name: 'Payment Gateway',
        icon: CreditCard,
        url: '/creator/settings/payment-gateway',
        permission: Object.freeze(['settings.payment.view']),
        roles: Object.freeze(['superadmin', 'admin', 'creator'])
      },
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