<template>
    <div class="space-y-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Database Admin Panel</h1>
            <p class="text-gray-600 mt-2">Kelola data users dari dashboard ini</p>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardContent class="p-6">
                    <div class="flex items-center">
                        <Users class="h-8 w-8 text-blue-500" />
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Users</p>
                            <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-6">
                    <div class="flex items-center">
                        <CheckCircle class="h-8 w-8 text-green-500" />
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Verified Users</p>
                            <p class="text-2xl font-bold text-gray-900">{{ stats.verifiedUsers }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-6">
                    <div class="flex items-center">
                        <Crown class="h-8 w-8 text-purple-500" />
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Admins</p>
                            <p class="text-2xl font-bold text-gray-900">{{ stats.adminUsers }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Users Table -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center justify-between">
                    <span>Users Management</span>
                    <Button @click="refreshUsers" variant="outline" size="sm">
                        <RefreshCw class="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b">
                            <th class="text-left py-2">ID</th>
                            <th class="text-left py-2">Name</th>
                            <th class="text-left py-2">Username</th>
                            <th class="text-left py-2">Email</th>
                            <th class="text-left py-2">Role</th>
                            <th class="text-left py-2">Verified</th>
                            <th class="text-left py-2">Created</th>
                            <th class="text-left py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
                                <td class="py-2 font-mono text-xs">{{ user.id.substring(0, 8) }}...</td>
                                <td class="py-2">{{ user.name }}</td>
                                <td class="py-2">@{{ user.username }}</td>
                                <td class="py-2">{{ user.email }}</td>
                                <td class="py-2">
                                    <span 
                                    class="px-2 py-1 rounded-full text-xs font-medium"
                                    :class="getRoleColor(user.role)"
                                    >
                                    {{ user.role }}
                                    </span>
                                </td>
                                <td class="py-2">
                                    <CheckCircle v-if="user.verified" class="w-4 h-4 text-green-500" />
                                    <XCircle v-else class="w-4 h-4 text-red-500" />
                                </td>
                                <td class="py-2 text-xs text-gray-500">
                                    {{ new Date(user.created).toLocaleDateString() }}
                                </td>
                                <td class="py-2">
                                    <div class="flex space-x-2">
                                    <Button 
                                        @click="toggleVerification(user)" 
                                        variant="outline" 
                                        size="sm"
                                    >
                                        {{ user.verified ? 'Unverify' : 'Verify' }}
                                    </Button>
                                    <Button 
                                        @click="deleteUser(user)" 
                                        variant="destructive" 
                                        size="sm"
                                    >
                                        <Trash2 class="w-3 h-3" />
                                    </Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Crown, 
  RefreshCw, 
  Trash2 
} from 'lucide-vue-next'

interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
  verified: boolean
  created: string
}

const users = ref<User[]>([])
const stats = ref({
  totalUsers: 0,
  verifiedUsers: 0,
  adminUsers: 0
})

const fetchUsers = async () => {
  try {
    const data: any = await $fetch('/api/admin/users')
    users.value = data.users || []
    calculateStats()
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const calculateStats = () => {
  stats.value = {
    totalUsers: users.value.length,
    verifiedUsers: users.value.filter(u => u.verified).length,
    adminUsers: users.value.filter(u => u.role === 'superadmin' || u.role === 'creator').length
  }
}

const refreshUsers = () => {
  fetchUsers()
}

const toggleVerification = async (user: User) => {
  try {
    await $fetch(`/api/admin/users/${user.id}/verify`, {
      method: 'POST',
      body: { verified: !user.verified }
    })
    await fetchUsers()
  } catch (error) {
    console.error('Failed to update verification:', error)
  }
}

const deleteUser = async (user: User) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    try {
      await $fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })
      await fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'superadmin':
      return 'bg-red-100 text-red-800'
    case 'creator':
      return 'bg-purple-100 text-purple-800'
    case 'user':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Load users on mount
onMounted(() => {
  fetchUsers()
})

// Ensure auth is initialized before page loads
onBeforeMount(async () => {
  const { user, initializeFromSession } = useAuth()
  if (!user.value) {
    await initializeFromSession()
  }
})

// Apply superadmin middleware and layout
definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin'
})
</script>