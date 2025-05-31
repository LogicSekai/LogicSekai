export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    const pageMeta = to.meta || {}

    const roles = pageMeta.roles as string[] | undefined
    const isPublic = pageMeta.public ?? false

    // if (!isPublic && !authStore.isAuthenticated) {
    //     return navigateTo('/auth')
    // }

    // Cek role jika meta.roles didefinisikan
    if (roles && !roles.includes(authStore.user?.role)) {
        return navigateTo('/unauthorized') // atau halaman lain sesuai kebutuhan
    }
})
