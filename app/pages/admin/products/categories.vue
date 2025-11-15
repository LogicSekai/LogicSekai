<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Media Kategori Kreator</h1>
                <p class="text-muted-foreground">
                    Kelola dan pantau kategori produk dari para kreator
                </p>
            </div>
            <div class="flex items-center gap-2">
                <Badge variant="outline" class="gap-2">
                    <Users class="h-4 w-4" />
                    {{ stats.totalCreators }} Kreator
                </Badge>
                <Button @click="refreshData" variant="outline" class="gap-2">
                    <RefreshCw class="h-4 w-4" />
                    Refresh
                </Button>
            </div>
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
                    <p class="text-xs text-muted-foreground">Dari {{ stats.totalCreators }} kreator</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Kategori Aktif</CardTitle>
                    <CheckCircle class="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.active }}</div>
                    <p class="text-xs text-muted-foreground">Dapat digunakan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Kategori Non-aktif</CardTitle>
                    <XCircle class="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.inactive }}</div>
                    <p class="text-xs text-muted-foreground">Dinonaktifkan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Total Kreator</CardTitle>
                    <Users class="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ stats.totalCreators }}</div>
                    <p class="text-xs text-muted-foreground">Membuat kategori</p>
                </CardContent>
            </Card>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
                <Search class="h-4 w-4 text-muted-foreground" />
                <Input
                v-model="searchQuery"
                placeholder="Cari kategori atau nama kreator..."
                class="w-72"
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
            <Select v-model="creatorFilter">
                <SelectTrigger class="w-48">
                    <SelectValue placeholder="Pilih Kreator" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Kreator</SelectItem>
                    <SelectItem 
                        v-for="creator in uniqueCreators" 
                        :key="creator.id" 
                        :value="creator.id"
                    >
                        {{ creator.name }}
                    </SelectItem>
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
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-medium">{{ category.name }}</h3>
                                    <Badge :variant="category.isActive ? 'default' : 'secondary'" class="text-xs">
                                        {{ category.isActive ? 'Aktif' : 'Non-aktif' }}
                                    </Badge>
                                </div>
                                <p class="text-sm text-muted-foreground mb-2">{{ category.description || 'Tidak ada deskripsi' }}</p>
                                <div class="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div class="flex items-center gap-1">
                                        <User class="h-3 w-3" />
                                        <span class="font-medium">{{ category.user?.name || 'Unknown' }}</span>
                                        <span class="text-muted-foreground">(@{{ category.user?.username || 'unknown' }})</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Calendar class="h-3 w-3" />
                                        <span>{{ formatDate(category.created) }}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Hash class="h-3 w-3" />
                                        <span class="font-mono text-xs">{{ category.slug }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                @click="toggleCategory(category)"
                                :disabled="loading"
                            >
                                <component :is="category.isActive ? EyeOff : Eye" class="h-4 w-4" />
                                {{ category.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                @click="viewCreatorProfile(category.user)"
                                v-if="category.user"
                            >
                                <ExternalLink class="h-4 w-4" />
                                Lihat Profil
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Info Dialog jika diperlukan bisa ditambahkan di sini -->
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
    Search,
    RefreshCw,
    Folder,
    CheckCircle,
    XCircle,
    Users,
    Eye,
    EyeOff,
    Loader2,
    User,
    Calendar,
    Hash,
    ExternalLink
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Data untuk admin menggunakan API categories biasa
const categories = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
const creatorFilter = ref('all')

// Computed properties
const uniqueCreators = computed(() => {
    const creators = categories.value
        .filter(cat => cat.user)
        .map(cat => cat.user)
        .filter((creator, index, self) => 
            index === self.findIndex(c => c.id === creator.id)
        )
    return creators
})

const stats = computed(() => {
    const total = categories.value.length
    const active = categories.value.filter((c: any) => c.isActive).length
    const inactive = categories.value.filter((c: any) => !c.isActive).length
    const totalCreators = new Set(categories.value.map((c: any) => c.userId)).size
    
    return { total, active, inactive, totalCreators }
})

const filteredCategories = computed(() => {
    let filtered = [...categories.value]
    
    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter((category: any) =>
            category.name.toLowerCase().includes(query) ||
            category.description?.toLowerCase().includes(query) ||
            category.user?.name.toLowerCase().includes(query) ||
            category.user?.username.toLowerCase().includes(query)
        )
    }
    
    // Filter by status
    if (statusFilter.value !== 'all') {
        filtered = filtered.filter((category: any) =>
            statusFilter.value === 'active' ? category.isActive : !category.isActive
        )
    }
    
    // Filter by creator
    if (creatorFilter.value !== 'all') {
        filtered = filtered.filter((category: any) =>
            category.userId === creatorFilter.value
        )
    }
    
    return filtered
})

// Methods
const fetchCategories = async () => {
    loading.value = true
    error.value = null
    
    try {
        const response = await $fetch<{ success: boolean; data: any[] }>('/api/categories')
        if (response.success) {
            categories.value = response.data
        }
    } catch (err: any) {
        error.value = err.data?.message || 'Failed to fetch categories'
        console.error('Error fetching categories:', err)
    } finally {
        loading.value = false
    }
}

const refreshData = async () => {
    await fetchCategories()
}

const toggleCategory = async (category: any) => {
    try {
        loading.value = true
        const response = await $fetch(`/api/categories/${category.id}`, {
            method: 'PUT',
            body: { isActive: !category.isActive }
        })
        
        if (response.success) {
            // Update local data
            const index = categories.value.findIndex(c => c.id === category.id)
            if (index !== -1) {
                categories.value[index].isActive = !category.isActive
            }
            console.log(`Kategori berhasil ${category.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
        }
    } catch (error: any) {
        console.error('Error toggling category:', error)
    } finally {
        loading.value = false
    }
}

const viewCreatorProfile = (user: any) => {
    if (user?.username) {
        // Navigate to creator profile or show details
        navigateTo(`/admin/users/${user.id}`)
    }
}

const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    creatorFilter.value = 'all'
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
    middleware: 'superadmin'
})
</script>