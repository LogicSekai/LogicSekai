<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    Mail,
    MailOpen,
    Archive,
    MessageSquareReply,
    Search,
    X,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    User,
    Clock,
    Tag,
} from 'lucide-vue-next'

definePageMeta({
    layout: 'superadmin',
    middleware: 'superadmin',
})

useHead({ title: 'Pesan Kontak — Admin' })

// ─── Types ──────────────────────────────────────────────────────────────
interface ContactMessage {
    id: string
    name: string
    email: string
    subject: string
    message: string
    type: 'general' | 'creator' | 'buyer' | 'business'
    status: 'unread' | 'read' | 'replied' | 'archived'
    adminNote: string | null
    ipAddress: string | null
    createdAt: string | number
    updatedAt: string | number
    readAt: string | null
}

// ─── State ───────────────────────────────────────────────────────────────
const messages = ref<ContactMessage[]>([])
const isLoading = ref(false)
const unreadCount = ref(0)

const selectedMessage = ref<ContactMessage | null>(null)
const adminNoteInput = ref('')
const isSavingNote = ref(false)
const isUpdatingStatus = ref(false)

const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')

const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

// ─── Fetch ────────────────────────────────────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout> | null = null

const fetchMessages = async () => {
    isLoading.value = true
    try {
        const params: Record<string, any> = {
            page: pagination.value.page,
            limit: pagination.value.limit,
        }
        if (searchQuery.value) params.search = searchQuery.value
        if (filterStatus.value) params.status = filterStatus.value
        if (filterType.value) params.type = filterType.value

        const data = await $fetch<any>('/api/admin/contacts', { params })
        messages.value = data.messages
        unreadCount.value = data.unreadCount
        pagination.value = { ...pagination.value, ...data.pagination }
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

const debouncedSearch = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        pagination.value.page = 1
        fetchMessages()
    }, 350)
}

watch([filterStatus, filterType], () => {
    pagination.value.page = 1
    fetchMessages()
})

onMounted(() => fetchMessages())

// ─── Helpers ──────────────────────────────────────────────────────────────
const typeLabels: Record<string, string> = {
    general: 'Umum',
    creator: 'Kreator',
    buyer: 'Pembeli',
    business: 'Bisnis',
}

const statusMeta: Record<string, { label: string; classes: string }> = {
    unread: { label: 'Belum dibaca', classes: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' },
    read: { label: 'Dibaca', classes: 'bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10' },
    replied: { label: 'Dibalas', classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
    archived: { label: 'Arsip', classes: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' },
}

const formatDate = (ts: string | number) => {
    return new Date(typeof ts === 'number' ? ts * 1000 : ts).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

// ─── Actions ──────────────────────────────────────────────────────────────
const openMessage = async (msg: ContactMessage) => {
    selectedMessage.value = msg
    adminNoteInput.value = msg.adminNote ?? ''

    // Mark as read if unread
    if (msg.status === 'unread') {
        await updateStatus(msg, 'read', false)
    }
}

const closeDetail = () => {
    selectedMessage.value = null
}

const updateStatus = async (msg: ContactMessage, status: string, closeAfter = true) => {
    isUpdatingStatus.value = true
    try {
        const updated = await $fetch<any>(`/api/admin/contacts/${msg.id}`, {
            method: 'PATCH',
            body: { status },
        })
        // Sync local state
        const idx = messages.value.findIndex(m => m.id === msg.id)
        if (idx !== -1) messages.value[idx] = updated.message
        if (selectedMessage.value?.id === msg.id) selectedMessage.value = updated.message

        // Refresh unread count
        if (status === 'read' || status === 'replied') {
            unreadCount.value = Math.max(0, unreadCount.value - (msg.status === 'unread' ? 1 : 0))
        }
        if (closeAfter) closeDetail()
    } catch (e) {
        console.error(e)
    } finally {
        isUpdatingStatus.value = false
    }
}

const saveNote = async () => {
    if (!selectedMessage.value) return
    isSavingNote.value = true
    try {
        const updated = await $fetch<any>(`/api/admin/contacts/${selectedMessage.value.id}`, {
            method: 'PATCH',
            body: { adminNote: adminNoteInput.value },
        })
        const idx = messages.value.findIndex(m => m.id === selectedMessage.value!.id)
        if (idx !== -1) messages.value[idx] = updated.message
        selectedMessage.value = updated.message
    } catch (e) {
        console.error(e)
    } finally {
        isSavingNote.value = false
    }
}

// Stats computed
const statsCards = computed(() => [
    {
        label: 'Total',
        value: pagination.value.total,
        icon: Mail,
        iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        iconColor: 'text-indigo-500',
        filter: '',
    },
    {
        label: 'Belum dibaca',
        value: unreadCount.value,
        icon: Mail,
        iconBg: 'bg-red-50 dark:bg-red-500/10',
        iconColor: 'text-red-500',
        filter: 'unread',
    },
    {
        label: 'Dibalas',
        value: messages.value.filter(m => m.status === 'replied').length,
        icon: MessageSquareReply,
        iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        filter: 'replied',
    },
    {
        label: 'Arsip',
        value: messages.value.filter(m => m.status === 'archived').length,
        icon: Archive,
        iconBg: 'bg-yellow-50 dark:bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        filter: 'archived',
    },
])
</script>

<template>
    <div class="p-6 space-y-8">

        <!-- Page Header -->
        <div class="flex items-center justify-between">
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// PESAN MASUK</p>
                <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    Kontak &amp; Pesan
                    <span v-if="unreadCount > 0" class="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold align-middle">
                        {{ unreadCount }}
                    </span>
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua pesan yang dikirim dari halaman kontak.</p>
            </div>
            <button
                @click="fetchMessages"
                class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/25 transition-colors"
            >
                <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
                Refresh
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <div
                v-for="stat in statsCards"
                :key="stat.label"
                class="bg-white dark:bg-[#030308] p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                :class="filterStatus === stat.filter ? 'ring-1 ring-indigo-500 ring-inset' : ''"
                @click="filterStatus = stat.filter; pagination.page = 1"
            >
                <div class="flex items-start justify-between mb-3">
                    <div :class="['w-8 h-8 flex items-center justify-center', stat.iconBg]">
                        <component :is="stat.icon" :class="['w-4 h-4', stat.iconColor]" />
                    </div>
                    <span
                        v-if="filterStatus === stat.filter"
                        class="font-mono text-[9px] tracking-widest uppercase text-indigo-500"
                    >aktif</span>
                </div>
                <p class="text-2xl font-black text-gray-900 dark:text-white">{{ isLoading ? '—' : stat.value }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">{{ stat.label }}</p>
            </div>
        </div>

        <!-- Filters Bar -->
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
                <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    v-model="searchQuery"
                    @input="debouncedSearch"
                    type="text"
                    placeholder="Cari nama, email, atau subjek..."
                    class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                />
                <button v-if="searchQuery" @click="searchQuery = ''; debouncedSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white">
                    <X class="w-4 h-4" />
                </button>
            </div>
            <select
                v-model="filterType"
                class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
            >
                <option value="">Semua Tipe</option>
                <option value="general">Umum</option>
                <option value="creator">Kreator</option>
                <option value="buyer">Pembeli</option>
                <option value="business">Bisnis</option>
            </select>
        </div>

        <!-- Active filter pill -->
        <div v-if="filterStatus" class="flex items-center gap-2">
            <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Filter:</span>
            <button
                @click="filterStatus = ''; pagination.page = 1"
                class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            >
                {{ statusMeta[filterStatus]?.label ?? filterStatus }}
                <X class="w-3 h-3" />
            </button>
        </div>

        <!-- Messages List -->
        <div class="border border-gray-100 dark:border-white/6 divide-y divide-gray-100 dark:divide-white/6">

            <!-- Loading skeleton -->
            <template v-if="isLoading">
                <div v-for="n in 5" :key="n" class="p-5 animate-pulse flex gap-4">
                    <div class="w-8 h-8 bg-gray-100 dark:bg-white/6 rounded-sm shrink-0"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 bg-gray-100 dark:bg-white/6 w-1/3 rounded"></div>
                        <div class="h-3 bg-gray-100 dark:bg-white/6 w-2/3 rounded"></div>
                    </div>
                </div>
            </template>

            <!-- Empty state -->
            <div v-else-if="messages.length === 0" class="py-20 flex flex-col items-center gap-3 text-center">
                <MailOpen class="w-10 h-10 text-gray-300 dark:text-white/10" />
                <p class="font-mono text-xs tracking-widest uppercase text-gray-400">Tidak ada pesan</p>
            </div>

            <!-- Message rows -->
            <div
                v-else
                v-for="msg in messages"
                :key="msg.id"
                class="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                :class="msg.status === 'unread' ? 'bg-indigo-50/30 dark:bg-indigo-500/3' : ''"
                @click="openMessage(msg)"
            >
                <!-- Unread dot -->
                <div class="w-2 mt-2 shrink-0 flex justify-center">
                    <div v-if="msg.status === 'unread'" class="w-2 h-2 rounded-full bg-red-500"></div>
                </div>

                <!-- Icon -->
                <div class="w-8 h-8 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                    <Mail class="w-3.5 h-3.5 text-gray-400" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                        <span :class="['font-bold text-sm', msg.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300']">
                            {{ msg.name }}
                        </span>
                        <span class="text-xs text-gray-400">{{ msg.email }}</span>
                        <span class="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-gray-400 border-gray-200 dark:border-white/10">
                            {{ typeLabels[msg.type] }}
                        </span>
                    </div>
                    <p :class="['text-sm truncate', msg.status === 'unread' ? 'font-semibold text-gray-800 dark:text-white/90' : 'text-gray-600 dark:text-gray-400']">
                        {{ msg.subject }}
                    </p>
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ msg.message }}</p>
                </div>

                <!-- Right meta -->
                <div class="shrink-0 flex flex-col items-end gap-1.5">
                    <span
                        class="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border"
                        :class="statusMeta[msg.status]?.classes"
                    >
                        {{ statusMeta[msg.status]?.label }}
                    </span>
                    <span class="font-mono text-[10px] text-gray-400">{{ formatDate(msg.createdAt) }}</span>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between border-t border-gray-100 dark:border-white/6 pt-4">
            <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
            </p>
            <div class="flex gap-2">
                <button
                    :disabled="pagination.page <= 1"
                    @click="pagination.page--; fetchMessages()"
                    class="flex items-center gap-1 px-3 py-2 text-xs font-mono uppercase border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft class="w-3.5 h-3.5" /> Prev
                </button>
                <button
                    :disabled="pagination.page >= pagination.totalPages"
                    @click="pagination.page++; fetchMessages()"
                    class="flex items-center gap-1 px-3 py-2 text-xs font-mono uppercase border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next <ChevronRight class="w-3.5 h-3.5" />
                </button>
            </div>
        </div>

        <!-- ── Message Detail Drawer ── -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="selectedMessage" class="fixed inset-0 z-50 flex">
                    <!-- Backdrop -->
                    <div class="absolute inset-0 bg-black/40" @click="closeDetail"></div>

                    <!-- Panel -->
                    <Transition
                        enter-active-class="transition-transform duration-300 ease-out"
                        enter-from-class="translate-x-full"
                        enter-to-class="translate-x-0"
                        leave-active-class="transition-transform duration-200 ease-in"
                        leave-from-class="translate-x-0"
                        leave-to-class="translate-x-full"
                    >
                        <div
                            v-if="selectedMessage"
                            class="ml-auto relative w-full max-w-xl h-full bg-white dark:bg-[#030308] border-l border-gray-100 dark:border-white/6 flex flex-col overflow-hidden"
                        >
                            <!-- Panel Header -->
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6 shrink-0">
                                <div>
                                    <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500">// DETAIL PESAN</p>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{{ selectedMessage.subject }}</p>
                                </div>
                                <button @click="closeDetail" class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X class="w-4 h-4" />
                                </button>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 overflow-y-auto p-6 space-y-6">

                                <!-- Sender Info -->
                                <div class="space-y-3 border border-gray-100 dark:border-white/6 p-4">
                                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">// PENGIRIM</p>
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                            <User class="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedMessage.name }}</p>
                                            <a :href="`mailto:${selectedMessage.email}`" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                {{ selectedMessage.email }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-white/6">
                                        <div class="flex items-center gap-1.5">
                                            <Tag class="w-3.5 h-3.5 text-gray-400" />
                                            <span class="text-xs text-gray-500 dark:text-gray-400">{{ typeLabels[selectedMessage.type] }}</span>
                                        </div>
                                        <div class="flex items-center gap-1.5">
                                            <Clock class="w-3.5 h-3.5 text-gray-400" />
                                            <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(selectedMessage.createdAt) }}</span>
                                        </div>
                                        <span
                                            class="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border"
                                            :class="statusMeta[selectedMessage.status]?.classes"
                                        >
                                            {{ statusMeta[selectedMessage.status]?.label }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Message Body -->
                                <div class="border border-gray-100 dark:border-white/6 p-4 space-y-2">
                                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">// PESAN</p>
                                    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ selectedMessage.message }}</p>
                                </div>

                                <!-- Admin Note -->
                                <div class="space-y-2">
                                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">// CATATAN ADMIN</p>
                                    <textarea
                                        v-model="adminNoteInput"
                                        rows="3"
                                        placeholder="Tambahkan catatan internal..."
                                        class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors resize-none"
                                    ></textarea>
                                    <button
                                        @click="saveNote"
                                        :disabled="isSavingNote"
                                        class="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-gray-100 dark:bg-white/6 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {{ isSavingNote ? 'Menyimpan...' : 'Simpan Catatan' }}
                                    </button>
                                </div>

                                <!-- Reply link -->
                                <div class="border border-gray-100 dark:border-white/6 p-4 flex items-center gap-3">
                                    <MessageSquareReply class="w-4 h-4 text-gray-400 shrink-0" />
                                    <a
                                        :href="`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Balas via email client
                                    </a>
                                </div>
                            </div>

                            <!-- Action Footer -->
                            <div class="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-white/6 flex flex-wrap gap-2">
                                <button
                                    v-if="selectedMessage.status !== 'replied'"
                                    @click="updateStatus(selectedMessage, 'replied')"
                                    :disabled="isUpdatingStatus"
                                    class="flex-1 px-4 py-2.5 text-xs font-mono uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Tandai Dibalas
                                </button>
                                <button
                                    v-if="selectedMessage.status !== 'archived'"
                                    @click="updateStatus(selectedMessage, 'archived')"
                                    :disabled="isUpdatingStatus"
                                    class="flex-1 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Arsipkan
                                </button>
                                <button
                                    v-if="selectedMessage.status === 'archived'"
                                    @click="updateStatus(selectedMessage, 'read')"
                                    :disabled="isUpdatingStatus"
                                    class="flex-1 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Kembalikan
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </Teleport>

    </div>
</template>
