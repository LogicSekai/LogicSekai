<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <Shield class="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ error.statusCode }}</h1>
        <h2 class="text-xl font-semibold text-gray-700 mb-4">
          {{ error.statusCode === 403 ? 'Access Denied' : 'Error' }}
        </h2>
        <p class="text-gray-600">
          {{ error.statusMessage || 'Something went wrong' }}
        </p>
      </div>
      
      <div class="space-y-3">
        <NuxtLink to="/" class="block">
          <Button class="w-full">
            <Home class="w-4 h-4 mr-2" />
            Kembali ke Home
          </Button>
        </NuxtLink>
        
        <NuxtLink to="/auth/login" class="block">
          <Button variant="outline" class="w-full">
            <LogIn class="w-4 h-4 mr-2" />
            Login dengan Akun Lain
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield, Home, LogIn } from 'lucide-vue-next'

defineProps<{
  error: {
    statusCode: number
    statusMessage: string
  }
}>()
</script>