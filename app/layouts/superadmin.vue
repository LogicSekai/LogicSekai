<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Logo/Brand -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">LS</span>
          </div>
          <span class="text-xl font-bold text-gray-900">Logic Sekai</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          class="lg:hidden"
          @click="sidebarOpen = false"
        >
          <X class="h-5 w-5" />
        </Button>
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-4 px-2">
        <div class="space-y-1">
          <!-- Dashboard -->
          <NuxtLink
            to="/admin"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="$route.path === '/admin' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <LayoutDashboard class="h-5 w-5 mr-3" />
            Dashboard
          </NuxtLink>

          <!-- User Management -->
          <div class="space-y-1">
            <button
              @click="toggleSubmenu('users')"
              class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              :class="activeSubmenu === 'users' ? 'bg-gray-100' : ''"
            >
              <div class="flex items-center">
                <Users class="h-5 w-5 mr-3" />
                User Management
              </div>
              <ChevronDown 
                class="h-4 w-4 transform transition-transform"
                :class="activeSubmenu === 'users' ? 'rotate-180' : ''"
              />
            </button>
            
            <div v-show="activeSubmenu === 'users'" class="ml-8 space-y-1">
              <NuxtLink
                to="/admin/users"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <UserCheck class="h-4 w-4 mr-2" />
                All Users
              </NuxtLink>
              <NuxtLink
                to="/admin/users/roles"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/users/roles' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Shield class="h-4 w-4 mr-2" />
                User Roles
              </NuxtLink>
              <NuxtLink
                to="/admin/users/activity"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/users/activity' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Activity class="h-4 w-4 mr-2" />
                User Activity
              </NuxtLink>
            </div>
          </div>

          <!-- Content Management -->
          <div class="space-y-1">
            <button
              @click="toggleSubmenu('content')"
              class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              :class="activeSubmenu === 'content' ? 'bg-gray-100' : ''"
            >
              <div class="flex items-center">
                <FileText class="h-5 w-5 mr-3" />
                Content Management
              </div>
              <ChevronDown 
                class="h-4 w-4 transform transition-transform"
                :class="activeSubmenu === 'content' ? 'rotate-180' : ''"
              />
            </button>
            
            <div v-show="activeSubmenu === 'content'" class="ml-8 space-y-1">
              <NuxtLink
                to="/admin/content/posts"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/content/posts' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Edit class="h-4 w-4 mr-2" />
                Posts
              </NuxtLink>
              <NuxtLink
                to="/admin/content/categories"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/content/categories' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Folder class="h-4 w-4 mr-2" />
                Categories
              </NuxtLink>
              <NuxtLink
                to="/admin/content/media"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/content/media' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Image class="h-4 w-4 mr-2" />
                Media Library
              </NuxtLink>
            </div>
          </div>

          <!-- Analytics & Reports -->
          <div class="space-y-1">
            <button
              @click="toggleSubmenu('analytics')"
              class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              :class="activeSubmenu === 'analytics' ? 'bg-gray-100' : ''"
            >
              <div class="flex items-center">
                <BarChart3 class="h-5 w-5 mr-3" />
                Analytics & Reports
              </div>
              <ChevronDown 
                class="h-4 w-4 transform transition-transform"
                :class="activeSubmenu === 'analytics' ? 'rotate-180' : ''"
              />
            </button>
            
            <div v-show="activeSubmenu === 'analytics'" class="ml-8 space-y-1">
              <NuxtLink
                to="/admin/analytics/overview"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/analytics/overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <TrendingUp class="h-4 w-4 mr-2" />
                Overview
              </NuxtLink>
              <NuxtLink
                to="/admin/analytics/traffic"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/analytics/traffic' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Globe class="h-4 w-4 mr-2" />
                Traffic Analysis
              </NuxtLink>
              <NuxtLink
                to="/admin/analytics/performance"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/analytics/performance' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Zap class="h-4 w-4 mr-2" />
                Performance
              </NuxtLink>
            </div>
          </div>

          <!-- System Settings -->
          <div class="space-y-1">
            <button
              @click="toggleSubmenu('settings')"
              class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              :class="activeSubmenu === 'settings' ? 'bg-gray-100' : ''"
            >
              <div class="flex items-center">
                <Settings class="h-5 w-5 mr-3" />
                System Settings
              </div>
              <ChevronDown 
                class="h-4 w-4 transform transition-transform"
                :class="activeSubmenu === 'settings' ? 'rotate-180' : ''"
              />
            </button>
            
            <div v-show="activeSubmenu === 'settings'" class="ml-8 space-y-1">
              <NuxtLink
                to="/admin/settings/general"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/settings/general' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Cog class="h-4 w-4 mr-2" />
                General
              </NuxtLink>
              <NuxtLink
                to="/admin/settings/security"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/settings/security' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Lock class="h-4 w-4 mr-2" />
                Security
              </NuxtLink>
              <NuxtLink
                to="/admin/settings/backup"
                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                :class="$route.path === '/admin/settings/backup' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <Database class="h-4 w-4 mr-2" />
                Backup & Restore
              </NuxtLink>
            </div>
          </div>

          <!-- Support & Help -->
          <NuxtLink
            to="/admin/support"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="$route.path === '/admin/support' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <HelpCircle class="h-5 w-5 mr-3" />
            Support & Help
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="lg:ml-64">
      <!-- Top Navigation Bar -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Mobile menu button -->
          <Button
            variant="ghost"
            size="sm"
            class="lg:hidden"
            @click="sidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </Button>

          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight class="h-4 w-4" />
            <span class="text-gray-900 font-medium">{{ currentPageTitle }}</span>
          </nav>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <Button variant="ghost" size="sm">
              <Bell class="h-5 w-5" />
            </Button>

            <!-- User dropdown -->
            <div class="relative">
              <Button
                variant="ghost"
                size="sm"
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2"
              >
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User class="h-4 w-4" />
                </div>
                <span class="hidden md:block">{{ user?.name || 'Admin' }}</span>
                <ChevronDown class="h-4 w-4" />
              </Button>

              <!-- Dropdown menu -->
              <div
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <NuxtLink
                  to="/admin/profile"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  <User class="h-4 w-4 mr-2" />
                  Profile
                </NuxtLink>
                <NuxtLink
                  to="/admin/settings/account"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  <Settings class="h-4 w-4 mr-2" />
                  Account Settings
                </NuxtLink>
                <hr class="my-1 border-gray-200" />
                <button
                  @click="handleLogout"
                  class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut class="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Overlay for mobile sidebar -->
    <div
      v-show="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '~/components/ui/button'
import { 
    Menu, 
    X, 
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
    ChevronDown, 
    ChevronRight,
    Bell, 
    User, 
    LogOut 
} from 'lucide-vue-next'

// Composables
const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()

// Reactive state
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const activeSubmenu = ref(null)

// Computed properties
const currentPageTitle = computed(() => {
    const pathSegments = route.path.split('/').filter(Boolean)
    if (pathSegments.length <= 1) return 'Dashboard'
    
    const lastSegment = pathSegments[pathSegments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
})

// Methods
const toggleSubmenu = (menu) => {
    activeSubmenu.value = activeSubmenu.value === menu ? null : menu
}

const handleLogout = async () => {
    await logout()
    await router.push('/auth/login')
}

// Handle clicks outside user menu
const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
        showUserMenu.value = false
    }
}

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    
    // Set default active submenu based on current route
    const path = route.path
    if (path.includes('/admin/users')) {
        activeSubmenu.value = 'users'
    } else if (path.includes('/admin/content')) {
        activeSubmenu.value = 'content'
    } else if (path.includes('/admin/analytics')) {
        activeSubmenu.value = 'analytics'
    } else if (path.includes('/admin/settings')) {
        activeSubmenu.value = 'settings'
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Watch for route changes to update active submenu
watch(() => route.path, (newPath) => {
    if (newPath.includes('/admin/users')) {
        activeSubmenu.value = 'users'
    } else if (newPath.includes('/admin/content')) {
        activeSubmenu.value = 'content'
    } else if (newPath.includes('/admin/analytics')) {
        activeSubmenu.value = 'analytics'
    } else if (newPath.includes('/admin/settings')) {
        activeSubmenu.value = 'settings'
    } else {
        activeSubmenu.value = null
    }
})

// Auto-close sidebar on mobile when clicking nav links
watch(() => route.path, () => {
    if (process.client && window.innerWidth < 1024) {
        sidebarOpen.value = false
    }
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
nav {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f8fafc;
}

nav::-webkit-scrollbar {
    width: 6px;
}

nav::-webkit-scrollbar-track {
    background: #f8fafc;
}

nav::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>