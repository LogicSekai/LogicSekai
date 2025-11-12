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

                        <Card class="bg-transparent border-0 shadow-none">
                            <CardHeader class="text-center">
                                <CardTitle class="text-2xl font-bold text-card-foreground">
                                    Setup Superadmin
                                </CardTitle>
                                <CardDescription class="text-muted-foreground">
                                    Buat akun superadmin untuk mengakses admin panel
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent>
                                <form @submit="onSubmit" class="space-y-4">
                                    <FormField v-slot="{ componentField }" name="email">
                                    <FormItem>
                                        <FormLabel class="text-card-foreground">Email Superadmin</FormLabel>
                                        <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="superadmin@example.com"
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
                                            placeholder="Password yang kuat"
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
                                            placeholder="Ulangi password"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                        </FormControl>
                                        <FormMessage class="text-left" />
                                    </FormItem>
                                    </FormField>

                                    <FormField v-slot="{ componentField }" name="secret">
                                    <FormItem>
                                        <FormLabel class="text-card-foreground">Secret Key</FormLabel>
                                        <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Secret key untuk setup"
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                        </FormControl>
                                        <FormDescription class="text-xs text-muted-foreground">
                                        Hubungi administrator untuk mendapatkan secret key
                                        </FormDescription>
                                        <FormMessage class="text-left" />
                                    </FormItem>
                                    </FormField>

                                    <Button
                                    type="submit"
                                    class="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    :disabled="isSubmitting"
                                    >
                                    <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                                    Buat Superadmin
                                    </Button>
                                </form>

                                <div v-if="error" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                                    {{ error }}
                                </div>

                                <div v-if="success" class="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                                    {{ success }}
                                </div>
                            </CardContent>

                            <CardFooter class="flex justify-center">
                                <p class="text-sm text-muted-foreground">
                                    Sudah ada akun superadmin?
                                    <NuxtLink to="/auth/login"
                                    class="font-medium text-primary hover:text-primary/80 transition-colors">
                                        Login sekarang
                                    </NuxtLink>
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
    title: 'Setup Superadmin - Logic Sekai',
    description: 'Halaman setup superadmin untuk mengakses admin panel Logic Sekai',
    layout: false
})

const setupFormSchema = toTypedSchema(z.object({
    email: z.string().min(1, 'Email harus diisi').email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi').min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
    secret: z.string().min(1, 'Secret key harus diisi'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
}))

const form = useForm({
    validationSchema: setupFormSchema,
})

const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const onSubmit = form.handleSubmit(async (values) => {
    isSubmitting.value = true
    error.value = ''
    success.value = ''
    
    try {
        const result: any = await $fetch('/api/setup/superadmin', {
            method: 'POST',
            body: {
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                secret: values.secret,
            }
        })

        if (result?.success) {
            success.value = result.message || 'Superadmin berhasil dibuat!'
            setTimeout(() => {
                navigateTo('/auth/login')
            }, 2000)
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Terjadi kesalahan'
    } finally {
        isSubmitting.value = false
    }
})
</script>