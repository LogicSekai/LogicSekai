<template>
    <Teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
            <div class="relative z-10 w-full max-w-lg bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">
                        // {{ mode === 'edit' ? 'EDIT KATEGORI' : 'BUAT KATEGORI' }}
                    </p>
                    <button @click="$emit('close')" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <!-- Name -->
                    <div>
                        <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Nama <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.name" type="text" required
                            placeholder="Nama kategori..."
                            class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-300 dark:placeholder-white/20" />
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Deskripsi
                        </label>
                        <textarea v-model="form.description" rows="3"
                            placeholder="Deskripsi kategori..."
                            class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-300 dark:placeholder-white/20">
                        </textarea>
                    </div>

                    <!-- Color -->
                    <div>
                        <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Warna
                        </label>
                        <div class="flex items-center gap-3">
                            <input v-model="form.color" type="color"
                                class="w-10 h-10 cursor-pointer border border-gray-200 dark:border-white/10 bg-transparent p-0.5" />
                            <input v-model="form.color" type="text"
                                placeholder="#6366f1"
                                class="flex-1 px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <!-- Sort Order -->
                    <div>
                        <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                            Urutan
                        </label>
                        <input v-model.number="form.sortOrder" type="number" min="0"
                            placeholder="0"
                            class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>

                    <!-- Active -->
                    <div class="flex items-center gap-3 pt-1">
                        <button type="button" @click="form.isActive = !form.isActive"
                            class="relative w-10 h-5 rounded-full transition-colors"
                            :class="form.isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'">
                            <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                                :class="form.isActive ? 'translate-x-5' : 'translate-x-0'"></span>
                        </button>
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            {{ form.isActive ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </div>

                    <!-- Error -->
                    <p v-if="error" class="font-mono text-[10px] text-red-500">{{ error }}</p>

                    <!-- Actions -->
                    <div class="flex items-center gap-3 pt-2">
                        <button type="submit" :disabled="submitting"
                            class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <div v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                            {{ submitting ? 'Menyimpan...' : (mode === 'edit' ? 'Simpan Perubahan' : 'Buat Kategori') }}
                        </button>
                        <button type="button" @click="$emit('close')"
                            class="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    icon: string | null
    color: string
    isActive: boolean
    sortOrder: number
    metaTitle: string | null
    metaDescription: string | null
    metaKeywords: string | null
    createdBy: string | null
    created: Date
    updated: Date
}

const props = defineProps<{
    open: boolean
    category: Category | null
    mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
    close: []
    saved: [category: any]
}>()

const submitting = ref(false)
const error = ref('')

const form = reactive({
    name: '',
    description: '',
    color: '#6366f1',
    sortOrder: 0,
    isActive: true,
})

watch(() => props.open, (val) => {
    if (!val) return
    if (props.mode === 'edit' && props.category) {
        form.name = props.category.name
        form.description = props.category.description ?? ''
        form.color = props.category.color ?? '#6366f1'
        form.sortOrder = props.category.sortOrder ?? 0
        form.isActive = props.category.isActive
    } else {
        form.name = ''
        form.description = ''
        form.color = '#6366f1'
        form.sortOrder = 0
        form.isActive = true
    }
    error.value = ''
})

const handleSubmit = async () => {
    if (!form.name.trim()) return
    submitting.value = true
    error.value = ''
    try {
        const body = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            color: form.color,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
        }

        let result: any
        if (props.mode === 'edit' && props.category) {
            result = await $fetch(`/api/creator/categories/${props.category.id}`, {
                method: 'PUT',
                body,
            })
        } else {
            result = await $fetch('/api/creator/categories', {
                method: 'POST',
                body,
            })
        }

        emit('saved', result.data ?? result)
    } catch (err: any) {
        error.value = err?.data?.statusMessage || err?.data?.message || 'Gagal menyimpan kategori.'
    } finally {
        submitting.value = false
    }
}
</script>
