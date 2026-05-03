<template>
    <div class="min-h-screen bg-white dark:bg-[#030308] flex">

        <!-- Left: Branding panel (desktop) -->
        <div class="hidden lg:flex flex-col justify-between w-[45%] bg-[#030308] p-12 border-r border-white/6">
            <NuxtLink to="/">
                <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-7 filter brightness-0 invert" />
            </NuxtLink>
            <div>
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-400 mb-6">// LOGIC SEKAI</p>
                <h2 class="text-4xl xl:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-6">
                    Produk Digital<br/>Berkualitas<br/>Tinggi.
                </h2>
                <p class="text-sm text-white/40 leading-relaxed max-w-xs">
                    Platform distribusi aset digital untuk kreator dan pengembang Indonesia.
                </p>
            </div>
            <p class="font-mono text-xs text-white/20 tracking-widest">&copy; {{ new Date().getFullYear() }} LOGIC SEKAI</p>
        </div>

        <!-- Right: Form panel -->
        <div class="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-24">

            <!-- Mobile logo -->
            <div class="lg:hidden mb-10">
                <NuxtLink to="/">
                    <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-7 dark:filter dark:brightness-0 dark:invert" />
                </NuxtLink>
            </div>

            <div class="max-w-sm w-full mx-auto lg:mx-0">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-3">// MASUK</p>
                <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8">
                    Selamat Datang Kembali
                </h1>

                <form @submit="onSubmit" class="space-y-5">
                    <FormField v-slot="{ componentField }" name="email">
                        <FormItem>
                            <FormLabel class="font-mono text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400">Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="nama@email.com"
                                    v-bind="componentField"
                                    class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                                />
                            </FormControl>
                            <FormMessage class="text-left font-mono text-xs" />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem>
                            <FormLabel class="font-mono text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    v-bind="componentField"
                                    class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                                />
                            </FormControl>
                            <FormMessage class="text-left font-mono text-xs" />
                        </FormItem>
                    </FormField>

                    <div v-if="error" class="flex items-start gap-2 border-l-2 border-red-500 pl-3 py-1.5 bg-red-50 dark:bg-red-900/10">
                        <span class="font-mono text-xs text-red-600 dark:text-red-400">{{ error }}</span>
                    </div>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
                    >
                        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                        {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
                    </button>
                </form>

                <div class="mt-6 flex items-center gap-4">
                    <div class="flex-1 h-px bg-gray-100 dark:bg-white/6"></div>
                    <span class="font-mono text-[10px] text-gray-300 dark:text-white/20 uppercase tracking-widest">atau</span>
                    <div class="flex-1 h-px bg-gray-100 dark:bg-white/6"></div>
                </div>

                <div class="mt-6 space-y-3 text-center">
                    <NuxtLink to="#" class="block font-mono text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-widest uppercase">
                        Lupa password?
                    </NuxtLink>
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                        Belum punya akun?
                        <NuxtLink to="/auth/register" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                            Daftar sekarang
                        </NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
    title: 'Login - Logic Sekai',
    description: 'Halaman login untuk pengguna Logic Sekai',
    layout: false
})

const loginFormSchema = toTypedSchema(z.object({
    email: z.string().min(1, 'Email harus diisi').email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi').min(6, 'Password minimal 6 karakter'),
}))

const form = useForm({
    validationSchema: loginFormSchema,
})

const { login } = useAuth()
const isSubmitting = ref(false)
const error = ref('')

const onSubmit = form.handleSubmit(async (values) => {
    isSubmitting.value = true
    error.value = ''
    
    const result = await login({
        email: values.email,
        password: values.password,
    })

    if (!result.success) {
        error.value = result.error || 'Terjadi kesalahan saat login'
    }
    
    isSubmitting.value = false
})
</script>