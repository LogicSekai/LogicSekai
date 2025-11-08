<template>
  <section class="bg-gray-1 dark:bg-dark py-20 lg:py-[120px]">
        <div class="container mx-auto">
            <div class="flex flex-wrap -mx-4">
                <div class="w-full px-4">
                    <div class="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px] dark:bg-dark-2">
                        <div class="mb-10 text-center md:mb-16">
                            <NuxtLink href="/" class="mx-auto inline-block max-w-[220px]">
                                <img src="/img/logic_sekai.svg" alt="logo"/>
                            </NuxtLink>
                        </div>
                        <form @submit="onSubmit" class="space-y-6">
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan nama lengkap"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="username">
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan username"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="nama@email.com"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="password">
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Masukkan password"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="confirmPassword">
                                <FormItem>
                                    <FormLabel>Konfirmasi Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Konfirmasi password"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            
                            <div v-if="error" class="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                {{ error }}
                            </div>

                            <div v-if="success" class="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                                {{ success }}
                            </div>

                            <Button type="submit" class="w-full" :disabled="isSubmitting">
                                <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                                Daftar
                            </Button>
                        </form>

                        <p class="mt-3 text-base text-body-color dark:text-dark-6">
                            <span class="pr-0.5">Sudah punya akun?</span>
                            <NuxtLink to="/auth" class="text-indigo-700 hover:underline"> Masuk sekarang </NuxtLink>
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