<template>
    <header class="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    :class="{'border-b border-border/40': scrolledFromTop}">
        <div class="container mx-auto px-4 lg:px-6">
            <div class="flex h-16 items-center justify-between">
                <!-- Logo/Brand -->
                <div class="flex items-center space-x-2">
                    <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-8 w-auto dark:filter dark:brightness-0 dark:invert"/>
                    </NuxtLink>
                </div>

                <!-- Navigation Links -->
                <nav class="hidden md:flex items-center space-x-8">
                    <NuxtLink 
                        to="/" 
                        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        active-class="!text-primary"
                    >
                        Beranda
                        <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/layanan-produk" 
                        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        active-class="!text-primary"
                    >
                        Layanan Produk
                        <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/artikel" 
                        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        active-class="!text-primary"
                    >
                        Artikel
                        <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/galeri" 
                        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        active-class="!text-primary"
                    >
                        Galeri
                        <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/kontak" 
                        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        active-class="!text-primary"
                    >
                        Kontak
                        <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </NuxtLink>
                </nav>

                <!-- User Menu -->
                <div class="flex items-center space-x-4">
                    <!-- Mobile Menu Button -->
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="toggleMobileMenu"
                        class="md:hidden w-9 px-0"
                    >
                        <Menu class="h-4 w-4" />
                        <span class="sr-only">Toggle menu</span>
                    </Button>

                    <!-- Theme Toggle -->
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="toggleTheme"
                        class="w-9 px-0"
                    >
                        <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span class="sr-only">Toggle theme</span>
                    </Button>

                    <!-- User Dropdown -->
                    <DropdownMenu v-if="user">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                                <Avatar class="h-8 w-8">
                                    <AvatarImage 
                                        :src="user.avatar || ''" 
                                        :alt="user.name || 'User'" 
                                    />
                                    <AvatarFallback class="bg-primary text-primary-foreground">
                                        {{ user.name?.[0]?.toUpperCase() || 'U' }}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent class="w-56" align="end" :sideOffset="5">
                            <DropdownMenuLabel class="font-normal">
                                <div class="flex flex-col space-y-1">
                                    <p class="text-sm font-medium leading-none">{{ user.name }}</p>
                                    <p class="text-xs leading-none text-muted-foreground">{{ user.email }}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem @click="$router.push('/profile')">
                                    <User class="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem @click="$router.push('/settings')">
                                    <Settings class="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem v-if="user.role === 'superadmin'" @click="$router.push('/admin/users')">
                                    <Shield class="mr-2 h-4 w-4" />
                                    <span>Admin Panel</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem @click="logout" class="text-destructive focus:text-destructive">
                                <LogOut class="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <!-- Login Button (if not authenticated) -->
                    <div v-else class="flex items-center space-x-2">
                        <Button variant="ghost" @click="$router.push('/auth/login')">
                            Log in
                        </Button>
                        <Button @click="$router.push('/auth/register')">
                            Sign up
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div v-show="mobileMenuOpen" class="md:hidden border-t border-border bg-background/95 backdrop-blur shadow-lg">
                <nav class="container mx-auto px-4 py-4 space-y-2">
                <NuxtLink 
                    to="/" 
                    @click="closeMobileMenu"
                    class="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    active-class="!text-primary !bg-primary/10"
                >
                    Beranda
                </NuxtLink>
                <NuxtLink 
                    to="/layanan-produk" 
                    @click="closeMobileMenu"
                    class="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    active-class="!text-primary !bg-primary/10"
                >
                    Layanan Produk
                </NuxtLink>
                <NuxtLink 
                    to="/artikel" 
                    @click="closeMobileMenu"
                    class="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    active-class="!text-primary !bg-primary/10"
                >
                    Artikel
                </NuxtLink>
                <NuxtLink 
                    to="/galeri" 
                    @click="closeMobileMenu"
                    class="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    active-class="!text-primary !bg-primary/10"
                >
                    Galeri
                </NuxtLink>
                <NuxtLink 
                    to="/kontak" 
                    @click="closeMobileMenu"
                    class="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    active-class="!text-primary !bg-primary/10"
                >
                    Kontak
                </NuxtLink>
            </nav>
            </div>
        </Transition>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
    User, 
    Settings, 
    Shield, 
    LogOut, 
    Sun, 
    Moon,
    Menu 
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

// Auth state
const { user, isLoggedIn, logout } = useAuth()

// Scroll state
const scrolledFromTop = ref(false)
onMounted(() => {
    window.addEventListener('scroll', () => {
        scrolledFromTop.value = window.scrollY > 0
    })
})

// Mobile menu handling
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}

// Theme handling
const isDark = ref(false)

const toggleTheme = () => {
    isDark.value = !isDark.value
    // Apply theme to document
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
    // Save preference to localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme and handle outside clicks
onMounted(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        isDark.value = true
        document.documentElement.classList.add('dark')
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const target = e.target as Element
        if (mobileMenuOpen.value && !target.closest('header')) {
            mobileMenuOpen.value = false
        }
    })
})
</script>