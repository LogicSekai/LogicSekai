<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation Bar -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">Logic Sekai</h1>
                    </div>
                
                    <div class="flex items-center space-x-4">
                        <template v-if="isLoading">
                            <div class="flex items-center space-x-2">
                                <Loader2 class="w-4 h-4 animate-spin" />
                                <span class="text-sm text-gray-600">Loading...</span>
                            </div>
                        </template>
                        
                        <template v-else-if="isLoggedIn">
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {{ user?.name?.charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-sm font-medium text-gray-900">{{ user?.name }}</span>
                                </div>
                                
                                <!-- Admin Panel Link for Superadmin -->
                                <NuxtLink 
                                v-if="user?.role === 'superadmin'" 
                                to="/admin"
                                class="inline-flex items-center"
                                >
                                    <Button variant="outline" size="sm">
                                        <Shield class="w-4 h-4 mr-2" />
                                        Admin Panel
                                    </Button>
                                </NuxtLink>
                                
                                <Button variant="outline" @click="handleLogout">
                                    <LogOut class="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </template>
                        
                        <template v-else-if="!isLoading">
                            <div class="flex items-center space-x-3">
                                <NuxtLink to="/auth/login">
                                    <Button variant="outline">Login</Button>
                                </NuxtLink>
                                <NuxtLink to="/auth/register">
                                    <Button>Register</Button>
                                </NuxtLink>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900 mb-8">
                    Selamat Datang di Logic Sekai
                </h1>
                
                <template v-if="isLoading">
                    <div class="flex items-center justify-center">
                        <div class="text-center">
                            <Loader2 class="mx-auto h-8 w-8 animate-spin text-blue-500 mb-4" />
                            <p class="text-gray-600">Memuat data...</p>
                        </div>
                    </div>
                </template>
                
                <template v-else-if="isLoggedIn">
                    <Card class="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Profil Pengguna</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div class="flex items-center justify-center">
                                <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                                {{ user?.name?.charAt(0).toUpperCase() }}
                                </div>
                            </div>
                        
                            <div class="space-y-2 text-left">
                                <div class="flex items-center space-x-2">
                                    <User class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm text-gray-600">Nama:</span>
                                    <span class="font-medium">{{ user?.name }}</span>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <AtSign class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm text-gray-600">Username:</span>
                                    <span class="font-medium">{{ user?.username }}</span>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <Mail class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm text-gray-600">Email:</span>
                                    <span class="font-medium">{{ user?.email }}</span>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <Shield class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm text-gray-600">Role:</span>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="getRoleColor(user?.role)">
                                        {{ user?.role }}
                                    </span>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <CheckCircle v-if="user?.verified" class="w-4 h-4 text-green-500" />
                                    <XCircle v-else class="w-4 h-4 text-red-500" />
                                    <span class="text-sm text-gray-600">Status:</span>
                                    <span :class="user?.verified ? 'text-green-600' : 'text-red-600'">
                                        {{ user?.verified ? 'Terverifikasi' : 'Belum Terverifikasi' }}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </template>
                
                <template v-else>
                    <div class="max-w-md mx-auto">
                        <p class="text-lg text-gray-600 mb-8">
                            Platform untuk berbagi logic dan pengetahuan programming
                        </p>
                        <div class="space-x-4">
                            <NuxtLink to="/auth/register">
                                <Button size="lg">
                                    <UserPlus class="w-4 h-4 mr-2" />
                                    Mulai Sekarang
                                </Button>
                            </NuxtLink>
                            <NuxtLink to="/auth/login">
                                <Button variant="outline" size="lg">
                                    Sudah Punya Akun?
                                </Button>
                            </NuxtLink>
                        </div>
                        
                        <div class="mt-6 text-center">
                            <NuxtLink to="/setup" class="text-sm text-gray-500 hover:text-gray-700 underline">
                                Setup Superadmin
                            </NuxtLink>
                        </div>
                    </div>
                </template>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { 
    LogOut, 
    User, 
    AtSign, 
    Mail, 
    Shield, 
    CheckCircle, 
    XCircle, 
    UserPlus,
    Loader2 
} from 'lucide-vue-next'

const { user, isLoggedIn, isLoading, logout } = useAuth()

const handleLogout = () => {
    logout()
}

const getRoleColor = (role?: string) => {
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
</script>