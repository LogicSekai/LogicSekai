<template>
    <section class="bg-background py-20 min-h-screen flex items-center transition-colors">
        <div class="container mx-auto">
            <div class="flex flex-wrap">
                <div class="w-full px-4">
                    <div class="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-card py-16 px-10 text-center sm:px-12 md:px-[60px] transition-colors">

                        <div class="mb-10 text-center md:mb-16">
                            <NuxtLink href="/" class="mx-auto inline-block max-w-[220px]">
                                <img src="/img/logic_sekai.svg" alt="logo" class="dark:filter dark:brightness-0 dark:invert transition-all"/>
                            </NuxtLink>
                        </div>
                        <form @submit="onSubmit" class="space-y-6">
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan nama lengkap"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="username">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan username"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="nama@email.com"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="password">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Masukkan password"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="confirmPassword">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Konfirmasi Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Konfirmasi password"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            
                            <div v-if="error" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                                {{ error }}
                            </div>

                            <div v-if="success" class="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                                {{ success }}
                            </div>

                            <Button type="submit" class="w-full bg-primary text-primary-foreground hover:bg-primary/90" :disabled="isSubmitting">
                                <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                                Daftar
                            </Button>
                        </form>

                        <p class="mt-4 text-base text-muted-foreground">
                            <span class="pr-0.5">Sudah punya akun?</span>
                            <NuxtLink to="/auth/login" class="text-primary hover:text-primary/80 hover:underline transition-colors"> Masuk sekarang </NuxtLink>
                        </p>

                        <Ornament />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import Ornament from '~/components/auth/ornament.vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
    title: 'Register - Logic Sekai',
    description: 'Halaman pendaftaran untuk pengguna baru Logic Sekai',
    layout: false
})

const registerFormSchema = toTypedSchema(z.object({
    name: z.string().min(1, 'Nama harus diisi').min(2, 'Nama minimal 2 karakter'),
    username: z.string().min(1, 'Username harus diisi').min(3, 'Username minimal 3 karakter')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore'),
    email: z.string().min(1, 'Email harus diisi').email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi').min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
}))

const form = useForm({
    validationSchema: registerFormSchema,
})

const { register: registerUser } = useAuth()
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const onSubmit = form.handleSubmit(async (values) => {
    isSubmitting.value = true
    error.value = ''
    success.value = ''
    
    const result = await registerUser({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
    })

    if (result.success) {
        success.value = 'Akun berhasil dibuat! Silakan login.'
        setTimeout(() => {
        navigateTo('/auth/login')
        }, 2000)
    } else {
        error.value = result.error || 'Terjadi kesalahan saat registrasi'
    }
    
    isSubmitting.value = false
})
</script>