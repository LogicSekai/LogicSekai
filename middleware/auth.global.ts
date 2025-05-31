export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    if (!authStore.isInitialized) {
        await authStore.initialize()
    }

    await authStore.checkAuth()

    const pageMeta = to.meta || {}
    const allowedRoles = pageMeta.roles as string[] | undefined

    const fallbackPublicRoutes = ['/', '/auth', '/auth/register', '/simlogic/**']

    const isFallbackPublicRoute = (path: string) => {
        return fallbackPublicRoutes.some(publicPath => {
        if (publicPath.endsWith('/**')) {
            return path.startsWith(publicPath.replace('/**', ''))
        } else if (publicPath.endsWith('/*')) {
            return path === publicPath.replace('/*', '') || path.startsWith(publicPath.replace('/*', '') + '/')
        }
        return path === publicPath
        })
    }

    // 🔥 Prioritaskan definePageMeta().public jika ada
    const isPublicAccess = typeof pageMeta.public !== 'undefined' ? pageMeta.public : isFallbackPublicRoute(to.path)

    const isAuthenticated = authStore.isAuthenticated

    // Tidak login dan bukan halaman public
    if (!isAuthenticated && !isPublicAccess && !isFallbackPublicRoute(to.path)) {
        return navigateTo({
            path: '/auth',
            query: { redirect: encodeURIComponent(to.fullPath) }
        })
    }

    // Sudah login tapi ke halaman login
    if (isAuthenticated && ['/auth', '/auth/register'].includes(to.path)) {
        return navigateTo('/')
    }
    
    // Login tapi tidak punya role akses
    if (
        isAuthenticated &&
        allowedRoles &&
        !allowedRoles.includes(authStore.user?.role)
    ) {
        return navigateTo('/unauthorized')
    }
})
