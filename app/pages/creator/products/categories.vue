<template>
    <div class="p-6 space-y-8">
        <div class="max-w-4xl mx-auto">

            <!-- Header -->
            <div class="flex items-start justify-between mb-8">
                <div>
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-2">// PRODUCT CATEGORIES</p>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Organise your products with custom categories</p>
                </div>
                <button @click="openCreateDialog"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-px border border-gray-100 dark:border-white/6 bg-gray-100 dark:bg-white/6 mb-6">
                <div class="bg-white dark:bg-[#030308] px-6 py-4">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
                </div>
                <div class="bg-white dark:bg-[#030308] px-6 py-4">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-1">Active</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
                </div>
                <div class="bg-white dark:bg-[#030308] px-6 py-4">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Inactive</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.inactive }}</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-2 mb-6">
                <div class="relative flex-1 max-w-xs">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="searchQuery" type="text" placeholder="Search categories..."
                        class="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <select v-model="statusFilter"
                    class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-[10px] uppercase tracking-widest">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button @click="resetFilters"
                    class="px-3 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 font-mono text-[10px] uppercase tracking-widest transition-colors">
                    Reset
                </button>
            </div>

            <!-- Categories list -->
            <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// YOUR CATEGORIES</p>
                    <p class="font-mono text-[10px] text-gray-400">{{ filteredCategories.length }} result(s)</p>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex flex-col items-center gap-3 py-16">
                    <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                    <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Loading...</p>
                </div>

                <!-- Empty state -->
                <div v-else-if="filteredCategories.length === 0" class="flex flex-col items-center gap-3 py-16">
                    <svg class="w-10 h-10 text-gray-200 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">No categories found</p>
                    <button @click="openCreateDialog"
                        class="mt-1 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                        Create First Category
                    </button>
                </div>

                <!-- List -->
                <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
                    <div v-for="category in filteredCategories" :key="category.id"
                        class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                        <div class="flex items-center gap-4 min-w-0">
                            <div class="w-9 h-9 border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/4 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ category.name }}</p>
                                    <span class="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
                                        :class="category.isActive
                                            ? 'border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'border-gray-200 dark:border-white/10 text-gray-400'">
                                        {{ category.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3 mt-0.5">
                                    <p class="font-mono text-[10px] text-gray-400 truncate">{{ category.slug }}</p>
                                    <span class="text-gray-200 dark:text-white/10">·</span>
                                    <p class="font-mono text-[10px] text-gray-400">{{ formatDate(category.created) }}</p>
                                </div>
                                <p v-if="category.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {{ category.description }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                            <button @click="editCategory(category)" title="Edit"
                                class="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button @click="toggleCategory(category)" :title="category.isActive ? 'Deactivate' : 'Activate'"
                                class="p-2 transition-colors"
                                :class="category.isActive
                                    ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                    : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'">
                                <svg v-if="category.isActive" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                            <button @click="confirmDeleteCategory(category)" title="Delete"
                                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create / Edit Modal -->
            <Teleport to="body">
                <div v-if="dialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleFormCancel"></div>
                    <div class="relative z-10 w-full max-w-md bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                        <!-- Modal header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">
                                {{ selectedCategory ? '// EDIT CATEGORY' : '// NEW CATEGORY' }}
                            </p>
                            <button @click="handleFormCancel" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <!-- Modal body -->
                        <form @submit.prevent="handleFormSubmit" class="p-6 space-y-5">
                            <div v-if="formError" class="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                                <p class="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400">{{ formError }}</p>
                            </div>
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                                    Name <span class="text-red-500">*</span>
                                </label>
                                <input v-model="formData.name" @input="autoSlug" type="text" required placeholder="Category name"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Slug</label>
                                <input v-model="formData.slug" type="text" readonly placeholder="auto-generated"
                                    class="w-full px-3 py-2 bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-mono text-sm focus:outline-none cursor-default" />
                                <p class="mt-1 font-mono text-[9px] text-gray-400">Auto-generated from name</p>
                            </div>
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
                                <textarea v-model="formData.description" rows="3" placeholder="Short description (optional)"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
                            </div>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input v-model="formData.isActive" type="checkbox" class="accent-indigo-600 w-4 h-4" />
                                <span class="text-sm text-gray-700 dark:text-gray-300">Active</span>
                            </label>
                            <div class="flex justify-end gap-2 pt-1">
                                <button type="button" @click="handleFormCancel" :disabled="saving"
                                    class="px-5 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="saving || !formData.name.trim()"
                                    class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span v-if="saving">Saving...</span>
                                    <span v-else>{{ selectedCategory ? 'Save Changes' : 'Create Category' }}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Teleport>

            <!-- Delete Confirm Modal -->
            <Teleport to="body">
                <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
                    <div class="relative z-10 w-full max-w-sm bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500">// DELETE CATEGORY</p>
                        </div>
                        <div class="p-6 space-y-4">
                            <p class="text-sm text-gray-700 dark:text-gray-300">
                                Are you sure you want to delete
                                <span class="font-medium text-gray-900 dark:text-white">"{{ categoryToDelete?.name }}"</span>?
                                This action cannot be undone.
                            </p>
                            <div class="flex justify-end gap-2">
                                <button @click="showDeleteConfirm = false" :disabled="deleting"
                                    class="px-5 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button @click="handleDeleteCategory" :disabled="deleting"
                                    class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span v-if="deleting">Deleting...</span>
                                    <span v-else>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Teleport>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

// Composables
const { categories, loading, createCategory, updateCategory, deleteCategory: removeCategory, fetchCategories } = useCreatorCategories()

// Filters
const searchQuery = ref('')
const statusFilter = ref('all')

// Modal state
const dialogOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const selectedCategory = ref<any>(null)
const formData = reactive({ name: '', slug: '', description: '', isActive: true })

// Delete state
const showDeleteConfirm = ref(false)
const categoryToDelete = ref<any>(null)
const deleting = ref(false)

// Stats
const stats = computed(() => ({
    total: categories.value.length,
    active: categories.value.filter(c => c.isActive).length,
    inactive: categories.value.filter(c => !c.isActive).length,
}))

// Filtered list
const filteredCategories = computed(() => {
    let list = [...categories.value]
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
        )
    }
    if (statusFilter.value !== 'all') {
        list = list.filter(c => statusFilter.value === 'active' ? c.isActive : !c.isActive)
    }
    return list
})

// Auto-generate slug
const autoSlug = () => {
    formData.slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

// Open dialogs
const openCreateDialog = () => {
    selectedCategory.value = null
    formError.value = ''
    Object.assign(formData, { name: '', slug: '', description: '', isActive: true })
    dialogOpen.value = true
}

const editCategory = (category: any) => {
    selectedCategory.value = category
    formError.value = ''
    Object.assign(formData, {
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        isActive: category.isActive,
    })
    dialogOpen.value = true
}

const handleFormCancel = () => {
    dialogOpen.value = false
    selectedCategory.value = null
    formError.value = ''
}

const handleFormSubmit = async () => {
    if (!formData.name.trim()) return
    saving.value = true
    formError.value = ''
    try {
        if (selectedCategory.value?.id) {
            await updateCategory(selectedCategory.value.id, { ...formData })
        } else {
            await createCategory({ ...formData })
        }
        dialogOpen.value = false
        selectedCategory.value = null
    } catch (err: any) {
        formError.value = err.data?.message || err.message || 'Failed to save category'
    } finally {
        saving.value = false
    }
}

const toggleCategory = async (category: any) => {
    try {
        await updateCategory(category.id, { isActive: !category.isActive })
    } catch {}
}

const confirmDeleteCategory = (category: any) => {
    categoryToDelete.value = category
    showDeleteConfirm.value = true
}

const handleDeleteCategory = async () => {
    if (!categoryToDelete.value) return
    deleting.value = true
    try {
        await removeCategory(categoryToDelete.value.id)
        showDeleteConfirm.value = false
        categoryToDelete.value = null
    } catch (err: any) {
    } finally {
        deleting.value = false
    }
}

const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
}

const formatDate = (timestamp: string | number) =>
    new Date(timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(() => fetchCategories())

definePageMeta({
    layout: 'creator',
    middleware: ['creator']
})
</script>
