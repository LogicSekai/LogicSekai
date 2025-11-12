export default defineNuxtPlugin(async () => {
    // Only run on client-side
    if (process.client) {
        const route = useRoute()
        
        // If we're on an admin route, ensure auth is initialized
        if (route.path.startsWith('/admin')) {
            const { initializeFromSession } = useAuth()
            await initializeFromSession()
        }
    }
})