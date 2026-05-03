<template>
    <div class="min-h-screen bg-gray-50 dark:bg-[#030308] transition-colors">
        <!-- Sidebar -->
        <div
            class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#030308] border-r border-gray-100 dark:border-white/6 transform transition-all duration-300 ease-in-out flex flex-col"
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        >
            <!-- Logo -->
            <div class="flex items-center justify-between h-14 px-5 border-b border-gray-100 dark:border-white/6 shrink-0">
                <NuxtLink to="/">
                    <img src="/img/logic_sekai.svg" alt="logo" class="h-5 dark:filter dark:brightness-0 dark:invert" />
                </NuxtLink>
                <button
                    class="lg:hidden p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    @click="sidebarOpen = false"
                >
                    <X class="h-4 w-4" />
                </button>
            </div>

            <!-- Role badge -->
            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// CREATOR</p>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-3">
                <template v-for="menuItem in filteredMenuItems" :key="menuItem.id">
                    <!-- With children -->
                    <div v-if="menuItem.child?.length">
                        <button
                            @click="toggleSubmenu(menuItem.id)"
                            class="w-full flex items-center justify-between px-4 py-2.5 border-l-2 border-transparent transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4"
                            :class="activeSubmenu === menuItem.id ? 'border-indigo-600 text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-600/10' : ''"
                        >
                            <div class="flex items-center gap-2.5">
                                <component :is="menuItem.icon" class="h-3.5 w-3.5 shrink-0" />
                                <span class="font-mono text-[11px] uppercase tracking-widest">{{ menuItem.name }}</span>
                            </div>
                            <ChevronDown
                                class="h-3 w-3 transition-transform shrink-0"
                                :class="activeSubmenu === menuItem.id ? 'rotate-180' : ''"
                            />
                        </button>
                        <div v-show="activeSubmenu === menuItem.id" class="pl-8">
                            <NuxtLink
                                v-for="childItem in menuItem.child"
                                :key="childItem.id"
                                :to="childItem.url"
                                class="flex items-center gap-2 px-4 py-2 border-l-2 border-transparent transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4"
                                :class="$route.path === childItem.url ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-600/10' : ''"
                            >
                                <component :is="childItem.icon" class="h-3 w-3 shrink-0" />
                                <span class="font-mono text-[10px] uppercase tracking-widest">{{ childItem.name }}</span>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Single item -->
                    <NuxtLink
                        v-else
                        :to="menuItem.url"
                        class="flex items-center gap-2.5 px-4 py-2.5 border-l-2 border-transparent transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4"
                        :class="$route.path === menuItem.url ? 'border-indigo-600 text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-600/10' : ''"
                    >
                        <component
                            :is="menuItem.icon"
                            class="h-3.5 w-3.5 shrink-0"
                            :class="$route.path === menuItem.url ? 'text-indigo-600 dark:text-indigo-400' : ''"
                        />
                        <span class="font-mono text-[11px] uppercase tracking-widest">{{ menuItem.name }}</span>
                    </NuxtLink>
                </template>
            </nav>
        </div>

        <!-- Main content -->
        <div class="lg:ml-64">
            <!-- Topbar -->
            <header class="bg-white dark:bg-[#030308] border-b border-gray-100 dark:border-white/6 sticky top-0 z-40">
                <div class="flex items-center justify-between h-14 px-5">
                    <!-- Mobile hamburger -->
                    <button
                        class="lg:hidden p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        @click="sidebarOpen = true"
                    >
                        <Menu class="h-4 w-4" />
                    </button>

                    <!-- Breadcrumb -->
                    <div class="hidden lg:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                        <span class="text-indigo-600">Creator</span>
                        <span class="text-gray-300 dark:text-white/20">/</span>
                        <span class="text-gray-500 dark:text-gray-400">{{ currentPageTitle }}</span>
                    </div>

                    <!-- Right actions -->
                    <div class="flex items-center gap-1">
                        <button
                            @click="toggleDarkMode"
                            :title="darkModeText"
                            class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Sun v-if="isDarkMode" class="h-4 w-4" />
                            <Moon v-else class="h-4 w-4" />
                        </button>
                        <button class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Bell class="h-4 w-4" />
                        </button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="min-h-screen">
                <slot />
            </main>
        </div>

        <!-- Mobile overlay -->
        <div
            v-show="sidebarOpen"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden"
            @click="sidebarOpen = false"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UserMenu from '~/components/layout/UserMenu.vue'
import { Menu, X, ChevronDown, Bell, Sun, Moon } from 'lucide-vue-next'
// Composables
const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()
const { creatorMenuItems, getCreatorFilteredMenuItems } = useCreatorMenu()
const { isDarkMode, toggleDarkMode, darkModeText, syncWithDocument } = useDarkMode()

// Reactive state
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const activeSubmenu = ref(null)

// Computed properties untuk menu yang difilter berdasarkan role dan permission user
const filteredMenuItems = computed(() => {
    return getCreatorFilteredMenuItems(
        creatorMenuItems,
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
    const menuItem = creatorMenuItems.find(item => 
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
nav {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
}
nav::-webkit-scrollbar { width: 4px; }
nav::-webkit-scrollbar-track { background: transparent; }
nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
</style>