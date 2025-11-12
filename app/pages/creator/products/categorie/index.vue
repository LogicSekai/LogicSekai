<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Kategori Produk
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Kelola kategori untuk mengorganisir produk Anda
        </p>
      </div>
      
      <Button @click="showCreateModal = true" class="w-full sm:w-auto">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Kategori
      </Button>
    </div>

    <!-- Filters and Search -->
    <Card class="p-6">
      <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              v-model="searchQuery"
              placeholder="Cari kategori..."
              class="pl-10"
            />
          </div>
        </div>
        
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" @click="resetFilters">
          <RotateCcw class="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </Card>

    <!-- Categories Table -->
    <Card>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox 
                  :checked="isAllSelected"
                  @update:checked="toggleSelectAll"
                />
              </TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="text-center py-8">
                <div class="flex items-center justify-center space-x-2">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Memuat data...</span>
                </div>
              </TableCell>
            </TableRow>
            
            <TableRow v-else-if="filteredCategories.length === 0">
              <TableCell colspan="6" class="text-center py-8 text-gray-500">
                {{ searchQuery ? 'Tidak ada kategori yang ditemukan' : 'Belum ada kategori' }}
              </TableCell>
            </TableRow>

            <TableRow 
              v-else
              v-for="category in filteredCategories" 
              :key="category.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <TableCell>
                <Checkbox 
                  :checked="selectedCategories.includes(category.id)"
                  @update:checked="toggleSelectCategory(category.id)"
                />
              </TableCell>
              
              <TableCell>
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    :style="{ backgroundColor: category.color }"
                  >
                    <component 
                      v-if="category.icon" 
                      :is="getIcon(category.icon)"
                      class="w-5 h-5"
                    />
                    <span v-else>{{ category.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">
                      {{ category.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ category.slug }}
                    </div>
                    <div v-if="category.description" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      {{ category.description }}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge 
                  :variant="category.isActive ? 'default' : 'secondary'"
                  class="text-xs"
                >
                  {{ category.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </Badge>
              </TableCell>
              
              <TableCell>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ category.sortOrder }}
                </span>
              </TableCell>
              
              <TableCell>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(category.created) }}
                </span>
              </TableCell>
              
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="editCategory(category)">
                      <Edit class="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="duplicateCategory(category)">
                      <Copy class="w-4 h-4 mr-2" />
                      Duplikat
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="toggleCategoryStatus(category)">
                      <component :is="category.isActive ? EyeOff : Eye" class="w-4 h-4 mr-2" />
                      {{ category.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click="deleteCategory(category)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- Bulk Actions -->
    <div v-if="selectedCategories.length > 0" class="fixed bottom-6 left-1/2 transform -translate-x-1/2">
      <Card class="p-4 shadow-lg border">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ selectedCategories.length }} kategori dipilih
          </span>
          <div class="flex space-x-2">
            <Button size="sm" variant="outline" @click="bulkActivate">
              <Eye class="w-4 h-4 mr-2" />
              Aktifkan
            </Button>
            <Button size="sm" variant="outline" @click="bulkDeactivate">
              <EyeOff class="w-4 h-4 mr-2" />
              Nonaktifkan
            </Button>
            <Button size="sm" variant="destructive" @click="bulkDelete">
              <Trash2 class="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Create/Edit Modal -->
    <CategoryModal 
      :open="showCreateModal || showEditModal"
      :category="editingCategory"
      :mode="showEditModal ? 'edit' : 'create'"
      @close="closeModal"
      @saved="handleCategorySaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, Search, RotateCcw, MoreHorizontal, Edit, Copy, 
  Eye, EyeOff, Trash2
} from 'lucide-vue-next'

// Layout
definePageMeta({
    title: 'Product Management - Logic Sekai',
    description: 'Kelola produk Anda di Logic Sekai Creator Portal.',
    layout: 'creator'
})

// Types
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

// Components
const CategoryModal = defineAsyncComponent(() => import('~/components/creator/CategoryModal.vue'))

// State
const categories = ref<Category[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const selectedCategories = ref<string[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref<Category | null>(null)

// Computed
const filteredCategories = computed(() => {
  let filtered = categories.value

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    )
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(category => category.isActive)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(category => !category.isActive)
  }

  return filtered.sort((a, b) => a.sortOrder - b.sortOrder)
})

const isAllSelected = computed(() => {
  return filteredCategories.value.length > 0 && 
         selectedCategories.value.length === filteredCategories.value.length
})

// Methods
const fetchCategories = async () => {
  try {
    isLoading.value = true
    const response = await $fetch<{ success: boolean; data: { categories: Category[] } }>('/api/creator/categories')
    categories.value = response.data.categories || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    // Show toast error
  } finally {
    isLoading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  selectedCategories.value = []
}

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedCategories.value = filteredCategories.value.map(c => c.id)
  } else {
    selectedCategories.value = []
  }
}

const toggleSelectCategory = (categoryId: string) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
}

const editCategory = (category: any) => {
  editingCategory.value = { ...category }
  showEditModal.value = true
}

const duplicateCategory = (category: any) => {
  const duplicated = {
    ...category,
    name: `${category.name} (Copy)`,
    slug: `${category.slug}-copy`
  }
  delete duplicated.id
  editingCategory.value = duplicated
  showCreateModal.value = true
}

const toggleCategoryStatus = async (category: any) => {
  try {
    await $fetch(`/api/creator/categories/${category.id}`, {
      method: 'PUT',
      body: { isActive: !category.isActive }
    })
    
    // Update local state
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index > -1) {
      categories.value[index].isActive = !categories.value[index].isActive
    }
  } catch (error) {
    console.error('Failed to update category status:', error)
  }
}

const deleteCategory = async (category: any) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
    return
  }

  try {
    await $fetch(`/api/creator/categories/${category.id}`, {
      method: 'DELETE'
    })
    
    // Remove from local state
    categories.value = categories.value.filter(c => c.id !== category.id)
    selectedCategories.value = selectedCategories.value.filter(id => id !== category.id)
  } catch (error) {
    console.error('Failed to delete category:', error)
  }
}

const bulkActivate = async () => {
  // Implementation for bulk activate
}

const bulkDeactivate = async () => {
  // Implementation for bulk deactivate  
}

const bulkDelete = async () => {
  if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedCategories.value.length} kategori?`)) {
    return
  }
  // Implementation for bulk delete
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
}

const handleCategorySaved = (category: any) => {
  if (showEditModal.value) {
    // Update existing category
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index > -1) {
      categories.value[index] = category
    }
  } else {
    // Add new category
    categories.value.push(category)
  }
  closeModal()
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getIcon = (iconName: string) => {
  // Map icon names to components
  const iconMap: Record<string, any> = {
    'package': Plus, // placeholder
    'tag': Plus, // placeholder
  }
  return iconMap[iconName] || Plus
}

// Lifecycle
onMounted(() => {
  fetchCategories()
})
</script>