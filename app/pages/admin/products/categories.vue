<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Kategori Produk</h1>
                <p class="text-muted-foreground">
                    Kelola kategori produk untuk mengorganisir produk Anda
                </p>
            </div>
            <Button @click="openCreateDialog" class="gap-2">
                <Plus class="h-4 w-4" />
                Tambah Kategori
            </Button>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Total Kategori</CardTitle>
                    <Folder class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.total }}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Kategori Aktif</CardTitle>
                    <CheckCircle class="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.active }}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Kategori Non-aktif</CardTitle>
                    <XCircle class="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.inactive }}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Dihapus</CardTitle>
                    <Trash2 class="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.deleted }}</div>
                </CardContent>
            </Card>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <Search class="h-4 w-4 text-muted-foreground" />
                <Input
                v-model="searchQuery"
                placeholder="Cari kategori..."
                class="w-64"
                />
            </div>
            <Select v-model="statusFilter">
                <SelectTrigger class="w-40">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-aktif</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" @click="resetFilters" class="gap-2">
                <RefreshCw class="h-4 w-4" />
                Reset
            </Button>
        </div>

        <!-- Categories Table -->
        <Card>
            <CardHeader>
                <CardTitle>Daftar Kategori</CardTitle>
            </CardHeader>
            <CardContent>
                <div v-if="loading" class="flex justify-center p-8">
                    <Loader2 class="h-6 w-6 animate-spin" />
                </div>
                <div v-else-if="filteredCategories.length === 0" class="text-center p-8 text-muted-foreground">
                    Tidak ada kategori ditemukan
                </div>
                <div v-else class="space-y-4">
                    <div
                        v-for="category in filteredCategories"
                        :key="category.id"
                        class="flex items-center justify-between p-4 border rounded-lg"
                    >
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Folder class="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 class="font-medium">{{ category.name }}</h3>
                                <p class="text-sm text-muted-foreground">{{ category.description }}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <Badge :variant="category.isActive ? 'default' : 'secondary'">
                                        {{ category.isActive ? 'Aktif' : 'Non-aktif' }}
                                    </Badge>
                                    <span class="text-xs text-muted-foreground">
                                        Dibuat: {{ formatDate(category.created) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                @click="editCategory(category)"
                            >
                                <Edit class="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                @click="toggleCategory(category)"
                            >
                                <component :is="category.isActive ? EyeOff : Eye" class="h-4 w-4" />
                            </Button>
                            <ActionDelete :category="category" :action="deleteCategory" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Create/Edit Category Form -->
        <CategoryForm
            v-model:open="dialogOpen"
            :category="selectedCategory"
            :is-submitting="saving"
            @submit="handleFormSubmit"
            @cancel="handleFormCancel"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
    Plus,
    Search,
    RefreshCw,
    Folder,
    CheckCircle,
    XCircle,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import CategoryForm from '@/components/admin/products/CategoryForm.vue'
import ActionDelete from '~/components/admin/products/ActionDelete.vue'
import type { CategoryFormData } from '~/types'

// Composables
const { categories, loading, createCategory, updateCategory, deleteCategory: removeCategory, fetchCategories } = useProductCategories()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
const dialogOpen = ref(false)
const saving = ref(false)
const selectedCategory = ref<any>(null)

// Computed properties
const stats = computed(() => {
    const total = categories.value.length
    const active = categories.value.filter(c => c.isActive).length
    const inactive = categories.value.filter(c => !c.isActive).length
    const deleted = 0 // Tidak ada field deleted di schema saat ini
    
    return { total, active, inactive, deleted }
})

const filteredCategories = computed(() => {
    let filtered = [...categories.value]
    
    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(category =>
            category.name.toLowerCase().includes(query) ||
            category.description?.toLowerCase().includes(query)
        )
    }
    
    // Filter by status
    if (statusFilter.value !== 'all') {
        filtered = filtered.filter(category =>
            statusFilter.value === 'active' ? category.isActive : !category.isActive
        )
    }
    
    return filtered
})

// Methods
const openCreateDialog = () => {
    selectedCategory.value = null
    dialogOpen.value = true
}

const editCategory = (category: any) => {
    selectedCategory.value = category
    dialogOpen.value = true
}

const handleFormSubmit = async (formData: CategoryFormData) => {
    saving.value = true
    
    try {
        if (selectedCategory.value?.id) {
            // Update existing category
            await updateCategory(selectedCategory.value.id, formData)
            console.log('Kategori berhasil diperbarui')
        } else {
            // Create new category
            await createCategory(formData)
            console.log('Kategori berhasil ditambahkan')
        }
        
        dialogOpen.value = false
        selectedCategory.value = null
    } catch (error: any) {
        console.error('Error saving category:', error)
    } finally {
        saving.value = false
    }
}

const handleFormCancel = () => {
    dialogOpen.value = false
    selectedCategory.value = null
}

const toggleCategory = async (category: any) => {
    try {
        await updateCategory(category.id, { isActive: !category.isActive })
        // useToaster('success', `Kategori berhasil ${category.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
    } catch (error: any) {
        console.error('Error toggling category:', error)
    }
}

const deleteCategory = async (category: any) => {
    try {
        await removeCategory(category.id)
        useToaster('success', 'Kategori berhasil dihapus')
    } catch (error: any) {
        useToaster('error', 'Gagal menghapus kategori')
        console.error('Error deleting category:', error)
    }
}

const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
}

const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Lifecycle
onMounted(() => {
    fetchCategories()
})

// Meta
definePageMeta({
    layout: 'superadmin',
    middleware: ['auth']
})
</script>