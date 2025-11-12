<template>
    <section class="bg-background py-20 lg:py-[120px] min-h-screen flex items-center transition-colors">
        <div class="container mx-auto">
            <div class="flex flex-wrap -mx-4">
                <div class="w-full px-4">
                    <div class="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-card py-16 px-10 text-center sm:px-12 md:px-[60px] transition-colors">

                        <div class="mb-10 text-center md:mb-16">
                            <NuxtLink href="/" class="mx-auto inline-block max-w-[220px]">
                                <img src="/img/logic_sekai.svg" alt="logo" class="dark:filter dark:brightness-0 dark:invert transition-all"/>
                            </NuxtLink>
                        </div>
                        <form @submit="onSubmit" class="space-y-6">
                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Masukkan email"
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

                            <div v-if="error" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                                {{ error }}
                            </div>

                            <Button type="submit" class="w-full bg-primary text-primary-foreground hover:bg-primary/90" :disabled="isSubmitting">
                                <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                                Masuk
                            </Button>
                        </form>
                        <NuxtLink to="#" class="inline-block mt-4 text-base text-primary hover:text-primary/80 hover:underline transition-colors">
                            Lupa password?
                        </NuxtLink>
                        <p class="text-base text-muted-foreground mt-4">
                            <span class="pr-0.5">Belum menjadi anggota?</span>
                            <NuxtLink to="/auth/register" class="text-primary hover:text-primary/80 hover:underline transition-colors"> Daftar sekarang</NuxtLink>
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