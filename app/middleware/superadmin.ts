export default defineNuxtRouteMiddleware(async (to, from) => {
    // Check session cookie directly without composables
    const sessionCookie = useCookie('user-session')
    
    if (!sessionCookie.value) {
        return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
    }

    let sessionData
    try {
        sessionData = typeof sessionCookie.value === 'string' 
        ? JSON.parse(sessionCookie.value) 
        : sessionCookie.value
    } catch (e) {
        // Clear invalid session and redirect
        sessionCookie.value = null
        return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
    }

    if (!sessionData?.id || !sessionData?.role) {
        sessionCookie.value = null
        return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
    }

    // Check if user has superadmin role
    if (sessionData.role !== 'superadmin') {
        throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Superadmin role required.'
        })
    }
})