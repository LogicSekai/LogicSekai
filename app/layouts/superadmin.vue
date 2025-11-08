<template>
    <div class="min-h-screen bg-background transition-colors">
    <!-- Sidebar -->
        <div class="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-md transform transition-all duration-300 ease-in-out"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
            <!-- Logo/Brand -->
            <div class="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                <div class="flex items-center space-x-2">
                    <!-- <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">LS</span>
                    </div>
                    <span class="text-xl font-bold text-gray-900">Logic Sekai</span> -->
                    <div class="p-4">
                        <img src="/img/logic_sekai.svg" alt="logo" class="dark:filter dark:brightness-0 dark:invert"/>
                    </div>
                </div>
                <Button variant="ghost" size="sm" class="lg:hidden text-sidebar-foreground" @click="sidebarOpen = false">
                    <X class="h-5 w-5" />
                </Button>
            </div>

            <!-- Navigation Menu -->
            <nav class="mt-4 px-2">
                <div class="space-y-1">
                <!-- Dynamic Menu Items -->
                    <template v-for="menuItem in filteredMenuItems" :key="menuItem.id">
                        <!-- Menu with children -->
                        <div v-if="menuItem.child?.length" class="space-y-1">
                            <button @click="toggleSubmenu(menuItem.id)"
                            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            :class="activeSubmenu === menuItem.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''">
                                <div class="flex items-center">
                                    <component :is="menuItem.icon" class="h-5 w-5 mr-3" />
                                    {{ menuItem.name }}
                                </div>
                                <ChevronDown class="h-4 w-4 transform transition-transform"
                                :class="activeSubmenu === menuItem.id ? 'rotate-180' : ''"/>
                            </button>
                        
                            <div v-show="activeSubmenu === menuItem.id" class="ml-8 space-y-1">
                                <NuxtLink
                                v-for="childItem in menuItem.child"
                                :key="childItem.id"
                                :to="childItem.url"
                                class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                                :class="$route.path === childItem.url ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'">
                                    <component :is="childItem.icon" class="h-4 w-4 mr-2" />
                                    {{ childItem.name }}
                                </NuxtLink>
                            </div>
                        </div>

                        <!-- Single Menu Item -->
                        <NuxtLink
                        v-else
                        :to="menuItem.url"
                        class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        :class="$route.path === menuItem.url ? 'bg-sidebar-primary text-sidebar-primary-foreground border-r-2 border-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'">
                            <component :is="menuItem.icon" class="h-5 w-5 mr-3" />
                            {{ menuItem.name }}
                        </NuxtLink>
                    </template>
                </div>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="lg:ml-64">
            <!-- Top Navigation Bar -->
            <header class="bg-card border-b border-border transition-colors">
                <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                    <!-- Mobile menu button -->
                    <Button
                    variant="ghost"
                    size="sm"
                    class="lg:hidden text-foreground"
                    @click="sidebarOpen = true">
                        <Menu class="h-5 w-5" />
                    </Button>

                    <!-- Breadcrumb -->
                    <Breadcrumb class="text-foreground">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin" class="text-muted-foreground hover:text-foreground transition-colors">
                                    Admin
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        <BreadcrumbSeparator class="text-muted-foreground" />
                            <BreadcrumbItem>
                                <BreadcrumbPage class="text-foreground">{{ currentPageTitle }}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <!-- User menu -->
                    <div class="flex items-center space-x-4">
                        <!-- Dark Mode Toggle -->
                        <Button variant="ghost" size="sm" @click="toggleDarkMode" :title="darkModeText" class="text-muted-foreground hover:text-foreground transition-colors">
                            <Sun v-if="isDarkMode" class="h-5 w-5" />
                            <Moon v-else class="h-5 w-5" />
                        </Button>

                        <!-- Notifications -->
                        <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground transition-colors">
                            <Bell class="h-5 w-5" />
                        </Button>

                        <!-- User dropdown -->
                        <div class="relative">
                            <Button variant="ghost" size="sm" @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Avatar
                                    :src="user?.avatar"
                                    :name="user?.name || 'Admin'"
                                    size="sm"
                                    shape="circle"
                                    :show-status="false"
                                />
                                <span class="hidden md:block">{{ user?.name || 'Admin' }}</span>
                                <ChevronDown class="h-4 w-4" />
                            </Button>

                            <!-- Dropdown menu -->
                            <div v-show="showUserMenu" class="absolute right-0 mt-2 w-48 bg-popover rounded-lg border border-border py-2 z-50 shadow-lg">
                                <NuxtLink to="/admin/profile" class="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors" @click="showUserMenu = false">
                                    <User class="h-4 w-4 mr-2" />
                                    Profil
                                </NuxtLink>
                                <NuxtLink to="/admin/settings/account" class="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors" @click="showUserMenu = false">
                                    <Settings class="h-4 w-4 mr-2" />
                                    Pengaturan Akun
                                </NuxtLink>
                                <hr class="my-1 border-border" />
                                <button @click="handleLogout" class="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                    <LogOut class="h-4 w-4 mr-2" />
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="p-4 sm:p-6 lg:p-8 bg-background min-h-screen transition-colors">
                <slot />
            </main>
        </div>

        <!-- Overlay for mobile sidebar -->
        <div v-show="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" @click="sidebarOpen = false"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '~/components/ui/button'
import Avatar from '~/components/Avatar.vue'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { 
    Menu, 
    X,
    ChevronDown, 
    ChevronRight,
    Bell, 
    User, 
    LogOut,
    Settings,
    Sun,
    Moon
} from 'lucide-vue-next'
// Composables
const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()
const { adminMenuItems, getFilteredMenuItems } = useAdminMenu()
const { isDarkMode, toggleDarkMode, darkModeText, syncWithDocument } = useDarkMode()

// Reactive state
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const activeSubmenu = ref(null)

// Computed properties untuk menu yang difilter berdasarkan role dan permission user
const filteredMenuItems = computed(() => {
  return getFilteredMenuItems(
    adminMenuItems,
    user.value?.role,
    user.value?.permissions || []
  )
})

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

// Helper function untuk menentukan active submenu berdasarkan path
const getActiveSubmenu = (path) => {
    const menuItem = adminMenuItems.find(item => 
        item.child?.some(child => child.url && path.startsWith(child.url))
    )
    return menuItem?.id || null
}

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    
    // Sync dengan class yang sudah ada dari script inline
    syncWithDocument()
    
    // Set default active submenu based on current route
    activeSubmenu.value = getActiveSubmenu(route.path)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Watch for route changes to update active submenu
watch(() => route.path, (newPath) => {
    activeSubmenu.value = getActiveSubmenu(newPath)
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