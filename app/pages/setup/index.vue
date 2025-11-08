<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="text-2xl font-bold">
            Setup Superadmin
          </CardTitle>
          <CardDescription>
            Buat akun superadmin untuk mengakses admin panel
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form @submit="onSubmit" class="space-y-4">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email Superadmin</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="superadmin@example.com"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password yang kuat"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="confirmPassword">
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Ulangi password"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="secret">
              <FormItem>
                <FormLabel>Secret Key</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Secret key untuk setup"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription class="text-xs">
                  Gunakan: create-superadmin-2024
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button
              type="submit"
              class="w-full"
              :disabled="isSubmitting"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Buat Superadmin
            </Button>
          </form>

          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>

          <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {{ success }}
          </div>
        </CardContent>

        <CardFooter class="flex justify-center">
          <p class="text-sm text-gray-600">
            Sudah ada akun superadmin?
            <NuxtLink
              to="/auth/login"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              Login sekarang
            </NuxtLink>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-vue-next'

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