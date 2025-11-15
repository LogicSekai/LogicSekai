<template>
  <div class="relative">
    <div class="flex items-center space-x-2">
      <div class="flex-1 relative">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search users by username or email..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="debouncedSearch"
          @focus="showDropdown = true"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <button
        v-if="selectedContributor"
        type="button"
        @click="removeContributor"
        class="p-2 text-red-600 hover:bg-red-50 rounded-md"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Selected Contributor Display -->
    <div v-if="selectedContributor" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center space-x-3">
        <div v-if="selectedContributor.avatar" class="w-8 h-8 rounded-full overflow-hidden">
          <img :src="selectedContributor.avatar" :alt="selectedContributor.name" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span class="text-gray-600 text-sm font-medium">{{ selectedContributor.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ selectedContributor.name }}</p>
          <p class="text-xs text-gray-500">@{{ selectedContributor.username }} • {{ selectedContributor.email }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <select
            v-model="selectedContributor.role"
            class="text-xs px-2 py-1 border border-gray-300 rounded"
            @change="updateContributor"
          >
            <option value="contributor">Contributor</option>
            <option value="co-author">Co-Author</option>
            <option value="designer">Designer</option>
            <option value="developer">Developer</option>
            <option value="tester">Tester</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <div
      v-if="showDropdown && searchResults.length > 0"
      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div
        v-for="user in searchResults"
        :key="user.id"
        @click="selectContributor(user)"
        class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
      >
        <div v-if="user.avatar" class="w-8 h-8 rounded-full overflow-hidden">
          <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span class="text-gray-600 text-sm font-medium">{{ user.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
          <p class="text-xs text-gray-500">@{{ user.username }} • {{ user.email }}</p>
        </div>
        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{{ user.role }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-500">Searching users...</span>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="showDropdown && !loading && searchTerm && searchResults.length === 0" class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3">
      <p class="text-sm text-gray-500">No users found for "{{ searchTerm }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Contributor } from '~/types/product'

interface Props {
  modelValue?: Contributor | null
}

interface Emits {
  (e: 'update:modelValue', value: Contributor | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive data
const searchTerm = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const showDropdown = ref(false)
const selectedContributor = ref<Contributor | null>(props.modelValue || null)

// Debounce search
let searchTimeout: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  if (searchTerm.value.length < 2) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  loading.value = true
  showDropdown.value = true

  try {
    const response = await $fetch<{ success: boolean; data: any[] }>(`/api/users/search?q=${encodeURIComponent(searchTerm.value)}`)
    
    if (response.success) {
      searchResults.value = response.data
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('Error searching users:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const selectContributor = (user: any) => {
  selectedContributor.value = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: 'contributor' // Default role
  }
  
  searchTerm.value = ''
  searchResults.value = []
  showDropdown.value = false
  
  emit('update:modelValue', selectedContributor.value)
}

const updateContributor = () => {
  if (selectedContributor.value) {
    emit('update:modelValue', selectedContributor.value)
  }
}

const removeContributor = () => {
  selectedContributor.value = null
  searchTerm.value = ''
  searchResults.value = []
  showDropdown.value = false
  emit('update:modelValue', null)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedContributor.value = newValue
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>