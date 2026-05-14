<template>
    <!-- Logged in -->
    <div v-if="user" class="relative" ref="menuRef">
        <!-- Avatar trigger -->
        <button
            @click="open = !open"
            class="w-8 h-8 bg-indigo-600 flex items-center justify-center text-white text-xs font-bold hover:bg-indigo-500 transition-colors overflow-hidden"
        >
            <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
            <span v-else>{{ user.name?.[0]?.toUpperCase() || 'U' }}</span>
        </button>

        <!-- Dropdown panel -->
        <Transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
        >
            <div
                v-show="open"
                class="absolute right-0 top-10 w-56 bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 shadow-xl z-50"
            >
                <!-- User info -->
                <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6">
                    <p class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                    <p class="font-mono text-[10px] text-gray-400 truncate mt-0.5">{{ user.email }}</p>
                </div>

                <!-- Menu items -->
                <div class="py-1">
                    <button @click="navigate('/transactions')"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/4 hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                        <Receipt class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>Transaksi Saya</span>
                    </button>
                    <button v-if="user.role === 'creator' || user.role === 'superadmin'" @click="navigate('/creator')"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/4 hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                        <Palette class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>Dashboard</span>
                    </button>
                    <button v-if="user.role === 'superadmin'" @click="navigate('/admin')"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/4 hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                        <Shield class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>Admin Panel</span>
                    </button>
                    <button @click="navigate('/settings')"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/4 hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                        <Settings class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>Pengaturan</span>
                    </button>
                </div>

                <!-- Role badge -->
                <div class="px-4 py-2 border-t border-gray-100 dark:border-white/6 flex items-center justify-between">
                    <span class="font-mono text-[10px] uppercase tracking-widest text-gray-300 dark:text-white/20">Role</span>
                    <span class="font-mono text-[10px] uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5">
                        {{ user.role }}
                    </span>
                </div>

                <!-- Logout -->
                <div class="border-t border-gray-100 dark:border-white/6 py-1">
                    <button @click="handleLogout"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors text-left">
                        <LogOut class="w-3.5 h-3.5 shrink-0" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </Transition>
    </div>

    <!-- Not logged in -->
    <div v-else class="flex items-center gap-2">
        <NuxtLink to="/auth/login"
            class="font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2">
            Masuk
        </NuxtLink>
        <NuxtLink to="/auth/register"
            class="font-mono text-xs tracking-[0.12em] uppercase bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 transition-colors">
            Daftar
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Settings, Shield, LogOut, Palette, Receipt } from 'lucide-vue-next'

const { user, logout } = useAuth()
const router = useRouter()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const navigate = (path: string) => {
    open.value = false
    router.push(path)
}

const handleLogout = async () => {
    open.value = false
    await logout()
}

const handleOutsideClick = (e: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        open.value = false
    }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>