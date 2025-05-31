<script setup lang="ts">
const { validateEmail, validatePassword } = useValidate()
const authStore = useAuthStore()
const router = useRouter()

definePageMeta({
    layout: 'empty'
})

const form = reactive({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
})

const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
    if (!validateEmail(form.email)) {
        error.value = 'Please enter a valid email address'
        return
    }
    
    if (!validatePassword(form.password)) {
        error.value = 'Password must be at least 8 characters'
        return
    }

    if (form.password !== form.passwordConfirm) {
        error.value = 'Passwords do not match'
        return
    }

    loading.value = true
    error.value = ''

    try {
        // Create user record
        await authStore.pb.collection('users').create({
            ...form,
            role: 'user' // Default role
        })

        // Login setelah register
        await authStore.login(form.email, form.password)
        
        // Redirect ke halaman setelah register sukses
        router.push('/')
    } catch (err: any) {
        console.error('Registration error:', err)
        error.value = err.message || 'Registration failed. Please try again.'
        
        // Handle error khusus
        if (err.data?.data?.email) {
            error.value = err.data.data.email.message
        }
    } finally {
        loading.value = false
    }
}

// Redirect jika sudah login
onMounted(async () => {
    await authStore.initialize()
    if (authStore.isAuthenticated) {
        router.push('/')
    }
})
</script>

<template>
    <!-- ====== Forms Section Start -->
    <section class="bg-gray-1 dark:bg-dark py-20 lg:py-[120px]">
        <div class="container mx-auto">
            <div class="flex flex-wrap -mx-4">
                <div class="w-full px-4">
                    <div class="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px] dark:bg-dark-2">
                        <div class="mb-10 text-center md:mb-16">
                            <a href="javascript:void(0)" class="mx-auto inline-block max-w-[220px]">
                                <img src="/img/logic_sekai.svg" alt="logo"/>
                            </a>
                        </div>
                        <form @submit.prevent="handleRegister">
                            <div class="mb-6">
                                <input type="text" placeholder="Name"
                                v-model="form.name"
                                class="w-full px-5 py-3 text-base bg-transparent border rounded-md outline-none border-stroke text-body-color dark:text-white dark:border-dark-3 focus:border-primary focus-visible:shadow-none"/>
                            </div>
                            <div class="mb-6">
                                <input type="text" placeholder="Email"
                                v-model="form.email"
                                class="w-full px-5 py-3 text-base bg-transparent border rounded-md outline-none border-stroke text-body-color dark:text-white dark:border-dark-3 focus:border-primary focus-visible:shadow-none"/>
                            </div>
                            <div class="mb-6">
                                <input type="password" placeholder="Password"
                                v-model="form.password"
                                class="w-full px-5 py-3 text-base bg-transparent border rounded-md outline-none border-stroke text-body-color dark:text-white dark:border-dark-3 focus:border-primary focus-visible:shadow-none"/>
                            </div>
                            <div class="mb-6">
                                <input type="password" placeholder="Confirm Password"
                                v-model="form.passwordConfirm"
                                class="w-full px-5 py-3 text-base bg-transparent border rounded-md outline-none border-stroke text-body-color dark:text-white dark:border-dark-3 focus:border-primary focus-visible:shadow-none"/>
                            </div>
                            <div v-if="error" class="text-red-500 text-sm text-right mb-4">
                                {{ error }}
                            </div>
                            <div class="mb-10">
                                <input type="submit" value="Daftar"
                                class="w-full px-5 py-3 text-base font-medium text-white transition border rounded-md cursor-pointer border-primary bg-primary hover:bg-opacity-90"
                                />
                            </div>
                        </form>
                        <p class="text-base text-body-color dark:text-dark-6">
                            <span class="pr-0.5">Sudah menjadi anggota?</span>
                            <NuxtLink to="/auth" class="text-primary hover:underline"> Masuk </NuxtLink>
                        </p>
                        <div>
                            <span class="absolute top-1 right-1">
                                <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <circle
                                    cx="1.39737"
                                    cy="38.6026"
                                    r="1.39737"
                                    transform="rotate(-90 1.39737 38.6026)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="1.39737"
                                    cy="1.99122"
                                    r="1.39737"
                                    transform="rotate(-90 1.39737 1.99122)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="13.6943"
                                    cy="38.6026"
                                    r="1.39737"
                                    transform="rotate(-90 13.6943 38.6026)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="13.6943"
                                    cy="1.99122"
                                    r="1.39737"
                                    transform="rotate(-90 13.6943 1.99122)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="25.9911"
                                    cy="38.6026"
                                    r="1.39737"
                                    transform="rotate(-90 25.9911 38.6026)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="25.9911"
                                    cy="1.99122"
                                    r="1.39737"
                                    transform="rotate(-90 25.9911 1.99122)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="38.288"
                                    cy="38.6026"
                                    r="1.39737"
                                    transform="rotate(-90 38.288 38.6026)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="38.288"
                                    cy="1.99122"
                                    r="1.39737"
                                    transform="rotate(-90 38.288 1.99122)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="1.39737"
                                    cy="26.3057"
                                    r="1.39737"
                                    transform="rotate(-90 1.39737 26.3057)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="13.6943"
                                    cy="26.3057"
                                    r="1.39737"
                                    transform="rotate(-90 13.6943 26.3057)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="25.9911"
                                    cy="26.3057"
                                    r="1.39737"
                                    transform="rotate(-90 25.9911 26.3057)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="38.288"
                                    cy="26.3057"
                                    r="1.39737"
                                    transform="rotate(-90 38.288 26.3057)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="1.39737"
                                    cy="14.0086"
                                    r="1.39737"
                                    transform="rotate(-90 1.39737 14.0086)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="13.6943"
                                    cy="14.0086"
                                    r="1.39737"
                                    transform="rotate(-90 13.6943 14.0086)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="25.9911"
                                    cy="14.0086"
                                    r="1.39737"
                                    transform="rotate(-90 25.9911 14.0086)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="38.288"
                                    cy="14.0086"
                                    r="1.39737"
                                    transform="rotate(-90 38.288 14.0086)"
                                    fill="#3056D3"
                                />
                                </svg>
                            </span>
                            <span class="absolute left-1 bottom-1">
                                <svg
                                width="29"
                                height="40"
                                viewBox="0 0 29 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <circle
                                    cx="2.288"
                                    cy="25.9912"
                                    r="1.39737"
                                    transform="rotate(-90 2.288 25.9912)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="14.5849"
                                    cy="25.9911"
                                    r="1.39737"
                                    transform="rotate(-90 14.5849 25.9911)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="26.7216"
                                    cy="25.9911"
                                    r="1.39737"
                                    transform="rotate(-90 26.7216 25.9911)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="2.288"
                                    cy="13.6944"
                                    r="1.39737"
                                    transform="rotate(-90 2.288 13.6944)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="14.5849"
                                    cy="13.6943"
                                    r="1.39737"
                                    transform="rotate(-90 14.5849 13.6943)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="26.7216"
                                    cy="13.6943"
                                    r="1.39737"
                                    transform="rotate(-90 26.7216 13.6943)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="2.288"
                                    cy="38.0087"
                                    r="1.39737"
                                    transform="rotate(-90 2.288 38.0087)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="2.288"
                                    cy="1.39739"
                                    r="1.39737"
                                    transform="rotate(-90 2.288 1.39739)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="14.5849"
                                    cy="38.0089"
                                    r="1.39737"
                                    transform="rotate(-90 14.5849 38.0089)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="26.7216"
                                    cy="38.0089"
                                    r="1.39737"
                                    transform="rotate(-90 26.7216 38.0089)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="14.5849"
                                    cy="1.39761"
                                    r="1.39737"
                                    transform="rotate(-90 14.5849 1.39761)"
                                    fill="#3056D3"
                                />
                                <circle
                                    cx="26.7216"
                                    cy="1.39761"
                                    r="1.39737"
                                    transform="rotate(-90 26.7216 1.39761)"
                                    fill="#3056D3"
                                />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- ====== Forms Section End -->
</template>