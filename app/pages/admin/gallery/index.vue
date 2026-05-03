<template>
    <div class="p-6 space-y-8">

        <!-- Page Header -->
        <div class="flex items-center justify-between">
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN GALERI</p>
                <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Foto &amp; Video</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola foto dan video yang tampil di halaman galeri publik.</p>
            </div>
            <button
                @click="openAdd"
                class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-mono uppercase tracking-widest hover:bg-indigo-700 transition-colors"
            >
                <PlusIcon class="w-4 h-4" />
                Tambah Item
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <div v-for="s in stats" :key="s.label" class="bg-white dark:bg-[#030308] p-5">
                <p class="text-2xl font-black text-gray-900 dark:text-white">{{ s.value }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">{{ s.label }}</p>
            </div>
        </div>

        <!-- Filter -->
        <div class="flex items-center gap-0 border border-gray-200 dark:border-white/10 self-start w-fit">
            <button
                v-for="tab in tabs" :key="tab.value"
                @click="activeTab = tab.value"
                class="px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                :class="activeTab === tab.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <div v-for="i in 8" :key="i" class="bg-white dark:bg-[#030308] aspect-video animate-pulse" />
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredItems.length" class="py-24 flex flex-col items-center gap-4 border border-gray-100 dark:border-white/6">
            <ImageIcon class="h-10 w-10 text-gray-200 dark:text-white/10" />
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Belum ada item</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <div
                v-for="item in filteredItems" :key="item.id"
                class="group relative bg-white dark:bg-[#030308] overflow-hidden"
            >
                <!-- Preview -->
                <div class="aspect-video overflow-hidden bg-gray-50 dark:bg-white/3 relative">
                    <img
                        v-if="item.thumbnailUrl || item.type === 'photo'"
                        :src="item.thumbnailUrl || item.url"
                        :alt="item.title"
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-800">
                        <VideoIcon class="h-8 w-8 text-white/20" />
                    </div>

                    <!-- Published badge -->
                    <div class="absolute top-2 left-2">
                        <span class="px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest"
                            :class="item.isPublished ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/80 text-white'">
                            {{ item.isPublished ? 'Publik' : 'Tersembunyi' }}
                        </span>
                    </div>

                    <!-- Type badge -->
                    <div class="absolute top-2 right-2">
                        <span class="px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest"
                            :class="item.type === 'video' ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-800'">
                            {{ item.type }}
                        </span>
                    </div>

                    <!-- Action overlay -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                            @click="openEdit(item)"
                            class="w-8 h-8 bg-white text-gray-900 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                        >
                            <PencilIcon class="h-3.5 w-3.5" />
                        </button>
                        <button
                            @click="togglePublish(item)"
                            class="w-8 h-8 bg-white text-gray-900 flex items-center justify-center hover:bg-yellow-100 transition-colors"
                        >
                            <EyeIcon v-if="!item.isPublished" class="h-3.5 w-3.5" />
                            <EyeOffIcon v-else class="h-3.5 w-3.5" />
                        </button>
                        <button
                            @click="confirmDelete(item)"
                            class="w-8 h-8 bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                            <TrashIcon class="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <!-- Title -->
                <div class="p-3 border-t border-gray-100 dark:border-white/6">
                    <p class="font-mono text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 truncate">{{ item.title }}</p>
                </div>
            </div>
        </div>

        <!-- ADD / EDIT MODAL -->
        <Teleport to="body">
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
                <div v-if="showModal" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="showModal = false">
                    <div class="bg-white dark:bg-[#0e0e18] border border-gray-200 dark:border-white/10 w-full max-w-xl flex flex-col max-h-[90vh]">
                        <!-- Modal Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6 shrink-0">
                            <p class="font-mono text-xs uppercase tracking-[0.2em] text-gray-900 dark:text-white">
                                {{ editingItem ? 'Edit Item' : 'Tambah Item' }}
                            </p>
                            <button @click="showModal = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <XIcon class="h-4 w-4" />
                            </button>
                        </div>

                        <!-- Form (scrollable) -->
                        <div class="p-6 space-y-5 overflow-y-auto">
                            <!-- Type -->
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Tipe</label>
                                <div class="flex gap-0 border border-gray-200 dark:border-white/10 w-fit">
                                    <button
                                        v-for="t in ['photo', 'video']" :key="t"
                                        @click="onTypeChange(t as 'photo' | 'video')"
                                        class="px-5 py-2 font-mono text-[0.65rem] uppercase tracking-widest transition-colors"
                                        :class="form.type === t ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                                    >
                                        {{ t === 'photo' ? 'Foto' : 'Video' }}
                                    </button>
                                </div>
                            </div>

                            <!-- Title -->
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Judul *</label>
                                <input
                                    v-model="form.title"
                                    type="text"
                                    placeholder="Judul item..."
                                    class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60"
                                />
                            </div>

                            <!-- MEDIA (URL or Upload) -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                                        {{ form.type === 'video' ? 'Video' : 'Foto' }} *
                                    </label>
                                    <!-- Mode toggle -->
                                    <div class="flex border border-gray-200 dark:border-white/10">
                                        <button
                                            v-for="m in mediaModes" :key="m.value"
                                            @click="mediaMode = m.value"
                                            class="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest transition-colors"
                                            :class="mediaMode === m.value ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
                                        >{{ m.label }}</button>
                                    </div>
                                </div>

                                <!-- URL mode -->
                                <input
                                    v-if="mediaMode === 'url'"
                                    v-model="form.url"
                                    type="text"
                                    :placeholder="form.type === 'video' ? 'https://youtube.com/watch?v=... atau /uploads/...' : '/uploads/gallery/...'"
                                    class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60"
                                />

                                <!-- Upload mode -->
                                <div v-else>
                                    <!-- Drop zone -->
                                    <div
                                        v-if="!form.url || mediaUploading"
                                        class="relative border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors cursor-pointer"
                                        :class="mediaDragOver ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-500/5' : ''"
                                        @dragover.prevent="mediaDragOver = true"
                                        @dragleave="mediaDragOver = false"
                                        @drop.prevent="onMediaDrop"
                                        @click="mediaFileInput?.click()"
                                    >
                                        <div class="py-8 flex flex-col items-center gap-3 text-center px-4">
                                            <div v-if="mediaUploading" class="w-full space-y-2">
                                                <div class="flex items-center justify-between">
                                                    <span class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">Mengupload...</span>
                                                    <span class="font-mono text-[0.65rem] text-indigo-500">{{ mediaUploadProgress }}%</span>
                                                </div>
                                                <div class="w-full h-1 bg-gray-100 dark:bg-white/10">
                                                    <div class="h-full bg-indigo-500 transition-all" :style="{ width: mediaUploadProgress + '%' }" />
                                                </div>
                                            </div>
                                            <template v-else>
                                                <UploadIcon class="h-7 w-7 text-gray-300 dark:text-white/20" />
                                                <div>
                                                    <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                                        Klik atau drag file {{ form.type === 'video' ? 'video' : 'foto' }}
                                                    </p>
                                                    <p class="mt-1 text-[0.7rem] text-gray-400 dark:text-gray-600">
                                                        {{ form.type === 'video' ? 'MP4, WebM, MOV (maks 200MB)' : 'JPG, PNG, WebP, GIF (maks 200MB)' }}
                                                    </p>
                                                </div>
                                            </template>
                                        </div>
                                        <input
                                            ref="mediaFileInput"
                                            type="file"
                                            class="sr-only"
                                            :accept="form.type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'"
                                            @change="onMediaFileChange"
                                        />
                                    </div>

                                    <!-- Preview after upload -->
                                    <div v-else class="relative border border-gray-200 dark:border-white/10">
                                        <img v-if="form.type === 'photo'" :src="form.url" class="w-full max-h-48 object-contain bg-gray-50 dark:bg-white/3" />
                                        <div v-else class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/3">
                                            <VideoIcon class="h-5 w-5 text-indigo-500 shrink-0" />
                                            <p class="font-mono text-[0.65rem] text-gray-600 dark:text-gray-400 truncate">{{ form.url }}</p>
                                        </div>
                                        <button
                                            @click="form.url = ''; mediaMode = 'upload'"
                                            class="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                                        >
                                            <XIcon class="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- THUMBNAIL (URL or Upload) -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Thumbnail (opsional)</label>
                                    <!-- Mode toggle -->
                                    <div class="flex border border-gray-200 dark:border-white/10">
                                        <button
                                            v-for="m in mediaModes" :key="m.value"
                                            @click="thumbMode = m.value"
                                            class="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest transition-colors"
                                            :class="thumbMode === m.value ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
                                        >{{ m.label }}</button>
                                    </div>
                                </div>

                                <!-- URL mode -->
                                <input
                                    v-if="thumbMode === 'url'"
                                    v-model="form.thumbnailUrl"
                                    type="text"
                                    placeholder="/uploads/gallery/thumbnail.jpg"
                                    class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60"
                                />

                                <!-- Upload mode -->
                                <div v-else>
                                    <div
                                        v-if="!form.thumbnailUrl || thumbUploading"
                                        class="relative border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors cursor-pointer"
                                        :class="thumbDragOver ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-500/5' : ''"
                                        @dragover.prevent="thumbDragOver = true"
                                        @dragleave="thumbDragOver = false"
                                        @drop.prevent="onThumbDrop"
                                        @click="thumbFileInput?.click()"
                                    >
                                        <div class="py-6 flex flex-col items-center gap-2 text-center px-4">
                                            <div v-if="thumbUploading" class="w-full space-y-2">
                                                <div class="flex items-center justify-between">
                                                    <span class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">Mengupload...</span>
                                                    <span class="font-mono text-[0.65rem] text-indigo-500">{{ thumbUploadProgress }}%</span>
                                                </div>
                                                <div class="w-full h-1 bg-gray-100 dark:bg-white/10">
                                                    <div class="h-full bg-indigo-500 transition-all" :style="{ width: thumbUploadProgress + '%' }" />
                                                </div>
                                            </div>
                                            <template v-else>
                                                <UploadIcon class="h-6 w-6 text-gray-300 dark:text-white/20" />
                                                <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                                    Klik atau drag gambar thumbnail
                                                </p>
                                                <p class="text-[0.7rem] text-gray-400 dark:text-gray-600">JPG, PNG, WebP (maks 200MB)</p>
                                            </template>
                                        </div>
                                        <input
                                            ref="thumbFileInput"
                                            type="file"
                                            class="sr-only"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            @change="onThumbFileChange"
                                        />
                                    </div>

                                    <!-- Thumbnail preview -->
                                    <div v-else class="relative border border-gray-200 dark:border-white/10">
                                        <img :src="form.thumbnailUrl" class="w-full max-h-32 object-contain bg-gray-50 dark:bg-white/3" />
                                        <button
                                            @click="form.thumbnailUrl = ''; thumbMode = 'upload'"
                                            class="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                                        >
                                            <XIcon class="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Deskripsi (opsional)</label>
                                <textarea
                                    v-model="form.description"
                                    rows="2"
                                    placeholder="Deskripsi singkat..."
                                    class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 resize-none"
                                />
                            </div>

                            <!-- Date & Sort order & Published -->
                            <div class="flex items-center gap-4">
                                <div class="flex-1">
                                    <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Tanggal</label>
                                    <input
                                        v-model="form.displayDate"
                                        type="date"
                                        class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 dark:[color-scheme:dark]"
                                    />
                                </div>
                                <div class="flex-1">
                                    <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Urutan</label>
                                    <input
                                        v-model.number="form.sortOrder"
                                        type="number"
                                        min="0"
                                        class="w-full px-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60"
                                    />
                                </div>
                                <div class="pt-6">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input v-model="form.isPublished" type="checkbox" class="sr-only" />
                                        <div class="relative w-10 h-5 transition-colors"
                                            :class="form.isPublished ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'"
                                            @click="form.isPublished = !form.isPublished"
                                        >
                                            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform"
                                                :class="form.isPublished ? 'translate-x-5' : ''" />
                                        </div>
                                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Publik</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Error -->
                            <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
                        </div>

                        <!-- Modal Footer -->
                        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/6 shrink-0">
                            <button @click="showModal = false" class="px-4 py-2 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Batal
                            </button>
                            <button
                                @click="saveItem"
                                :disabled="saving || mediaUploading || thumbUploading"
                                class="px-5 py-2 bg-indigo-600 text-white font-mono text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {{ saving ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- DELETE CONFIRM -->
        <Teleport to="body">
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
                <div v-if="deleteTarget" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="deleteTarget = null">
                    <div class="bg-white dark:bg-[#0e0e18] border border-gray-200 dark:border-white/10 w-full max-w-sm p-6 space-y-4">
                        <p class="font-mono text-xs uppercase tracking-[0.2em] text-red-500">// Hapus Item</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Hapus <strong class="text-gray-900 dark:text-white">{{ deleteTarget.title }}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div class="flex justify-end gap-3">
                            <button @click="deleteTarget = null" class="px-4 py-2 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Batal</button>
                            <button @click="deleteItem" :disabled="deleting" class="px-5 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
                                {{ deleting ? 'Menghapus...' : 'Hapus' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    Plus as PlusIcon,
    Image as ImageIcon,
    Video as VideoIcon,
    Pencil as PencilIcon,
    Trash as TrashIcon,
    Eye as EyeIcon,
    EyeOff as EyeOffIcon,
    X as XIcon,
    Upload as UploadIcon,
} from 'lucide-vue-next'

definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin',
})

useHead({ title: 'Manajemen Galeri — Admin' })

interface GalleryItem {
    id: string
    title: string
    description: string | null
    type: 'photo' | 'video'
    url: string
    thumbnailUrl: string | null
    isPublished: boolean
    sortOrder: number
    displayDate: string | number | null
    createdAt: string
}

const { data, pending, refresh } = await useFetch<{ items: GalleryItem[] }>('/api/admin/gallery', {
    default: () => ({ items: [] }),
})

const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Foto', value: 'photo' },
    { label: 'Video', value: 'video' },
] as const

const activeTab = ref<'all' | 'photo' | 'video'>('all')

const filteredItems = computed(() => {
    const items = data.value?.items ?? []
    if (activeTab.value === 'all') return items
    return items.filter(i => i.type === activeTab.value)
})

const stats = computed(() => {
    const items = data.value?.items ?? []
    return [
        { label: 'Total Item', value: items.length },
        { label: 'Foto', value: items.filter(i => i.type === 'photo').length },
        { label: 'Video', value: items.filter(i => i.type === 'video').length },
    ]
})

// Upload input mode
const mediaModes = [
    { label: 'Upload', value: 'upload' as const },
    { label: 'URL', value: 'url' as const },
]
const mediaMode = ref<'upload' | 'url'>('upload')
const thumbMode = ref<'upload' | 'url'>('upload')

// File inputs refs
const mediaFileInput = ref<HTMLInputElement | null>(null)
const thumbFileInput = ref<HTMLInputElement | null>(null)

// Drag states
const mediaDragOver = ref(false)
const thumbDragOver = ref(false)

// Upload progress
const mediaUploading = ref(false)
const mediaUploadProgress = ref(0)
const thumbUploading = ref(false)
const thumbUploadProgress = ref(0)

// Form
const showModal = ref(false)
const editingItem = ref<GalleryItem | null>(null)
const saving = ref(false)
const formError = ref('')

function todayString() {
    return new Date().toISOString().slice(0, 10)
}

function toDateInputValue(val: string | number) {
    const d = new Date(typeof val === 'number' ? val * 1000 : val)
    if (isNaN(d.getTime())) return todayString()
    return d.toISOString().slice(0, 10)
}

const defaultForm = () => ({
    title: '',
    description: '',
    type: 'photo' as 'photo' | 'video',
    url: '',
    thumbnailUrl: '',
    isPublished: false,
    sortOrder: 0,
    displayDate: todayString(),
})

const form = ref(defaultForm())

function onTypeChange(t: 'photo' | 'video') {
    form.value.type = t
    // Reset media url & mode when switching type
    form.value.url = ''
    mediaMode.value = 'upload'
}

function openAdd() {
    editingItem.value = null
    form.value = defaultForm()
    mediaMode.value = 'upload'
    thumbMode.value = 'upload'
    mediaUploadProgress.value = 0
    thumbUploadProgress.value = 0
    formError.value = ''
    showModal.value = true
}

function openEdit(item: GalleryItem) {
    editingItem.value = item
    form.value = {
        title: item.title,
        description: item.description ?? '',
        type: item.type,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl ?? '',
        isPublished: item.isPublished,
        sortOrder: item.sortOrder,
        displayDate: item.displayDate ? toDateInputValue(item.displayDate) : todayString(),
    }
    // When editing and URL already exists, switch to URL mode to show the value
    mediaMode.value = item.url ? 'url' : 'upload'
    thumbMode.value = item.thumbnailUrl ? 'url' : 'upload'
    formError.value = ''
    showModal.value = true
}

// Upload helper — uses XMLHttpRequest for progress tracking
async function uploadFile(file: File, onProgress: (p: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'gallery')

        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100))
            }
        })
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const res = JSON.parse(xhr.responseText)
                resolve(res.data.url)
            } else {
                try {
                    const err = JSON.parse(xhr.responseText)
                    reject(new Error(err.statusMessage || 'Upload gagal'))
                } catch {
                    reject(new Error('Upload gagal'))
                }
            }
        })
        xhr.addEventListener('error', () => reject(new Error('Upload gagal')))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
    })
}

async function onMediaFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    mediaUploading.value = true
    mediaUploadProgress.value = 0
    formError.value = ''
    try {
        form.value.url = await uploadFile(file, (p) => { mediaUploadProgress.value = p })
    } catch (err: any) {
        formError.value = err.message
    } finally {
        mediaUploading.value = false
    }
}

async function onThumbFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    thumbUploading.value = true
    thumbUploadProgress.value = 0
    formError.value = ''
    try {
        form.value.thumbnailUrl = await uploadFile(file, (p) => { thumbUploadProgress.value = p })
    } catch (err: any) {
        formError.value = err.message
    } finally {
        thumbUploading.value = false
    }
}

async function onMediaDrop(e: DragEvent) {
    mediaDragOver.value = false
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    mediaUploading.value = true
    mediaUploadProgress.value = 0
    formError.value = ''
    try {
        form.value.url = await uploadFile(file, (p) => { mediaUploadProgress.value = p })
    } catch (err: any) {
        formError.value = err.message
    } finally {
        mediaUploading.value = false
    }
}

async function onThumbDrop(e: DragEvent) {
    thumbDragOver.value = false
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    thumbUploading.value = true
    thumbUploadProgress.value = 0
    formError.value = ''
    try {
        form.value.thumbnailUrl = await uploadFile(file, (p) => { thumbUploadProgress.value = p })
    } catch (err: any) {
        formError.value = err.message
    } finally {
        thumbUploading.value = false
    }
}

async function saveItem() {
    if (!form.value.title.trim() || !form.value.url.trim()) {
        formError.value = 'Judul dan media wajib diisi.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        const payload = {
            ...form.value,
            description: form.value.description || null,
            thumbnailUrl: form.value.thumbnailUrl || null,
        }
        if (editingItem.value) {
            await $fetch(`/api/admin/gallery/${editingItem.value.id}`, { method: 'PUT', body: payload })
        } else {
            await $fetch('/api/admin/gallery', { method: 'POST', body: payload })
        }
        showModal.value = false
        await refresh()
    } catch (e: any) {
        formError.value = e?.data?.statusMessage ?? 'Terjadi kesalahan.'
    } finally {
        saving.value = false
    }
}

// Toggle publish
async function togglePublish(item: GalleryItem) {
    await $fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PUT',
        body: { ...item, isPublished: !item.isPublished },
    })
    await refresh()
}

// Delete
const deleteTarget = ref<GalleryItem | null>(null)
const deleting = ref(false)

function confirmDelete(item: GalleryItem) {
    deleteTarget.value = item
}

async function deleteItem() {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await $fetch(`/api/admin/gallery/${deleteTarget.value.id}`, { method: 'DELETE' })
        deleteTarget.value = null
        await refresh()
    } finally {
        deleting.value = false
    }
}
</script>
