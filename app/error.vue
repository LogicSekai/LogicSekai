<template>
    <section class="bg-background min-h-screen flex items-center justify-center py-20 lg:py-[120px] transition-colors">
        <div class="container mx-auto">
            <div class="flex flex-wrap -mx-4">
                <div class="w-full px-4">
                    <div class="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-card py-16 px-10 text-center sm:px-12 md:px-[60px] transition-colors">
                        <div class="mb-8">
                            <Shield class="mx-auto h-16 w-16 text-destructive mb-4" />
                            <h1 class="text-4xl font-bold text-foreground mb-2">{{ error.statusCode }}</h1>
                            <h2 class="text-xl font-semibold text-card-foreground mb-4">
                                {{ error.statusCode === 403 ? 'Access Denied' : 'Error' }}
                            </h2>
                            <p class="text-muted-foreground">
                                {{ error.statusMessage || 'Something went wrong' }}
                            </p>
                        </div>
            
                        <div class="space-y-3">
                            <NuxtLink to="/" class="block">
                                <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                    <Home class="w-4 h-4 mr-2" />
                                    Kembali ke Home
                                </Button>
                            </NuxtLink>
                            
                            <NuxtLink to="/auth/login" class="block">
                                <Button variant="outline" class="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <LogIn class="w-4 h-4 mr-2" />
                                    Login dengan Akun Lain
                                </Button>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
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