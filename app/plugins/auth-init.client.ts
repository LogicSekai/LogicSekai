export default defineNuxtPlugin({
    name: 'auth-init',
    async setup() {
        // Only run on client-side after hydration
        if (process.client) {
        const { initializeFromSession } = useAuth()
        
        // Initialize session when plugin loads
        await initializeFromSession()
        
        // Also listen for route changes to ensure session is valid
        const router = useRouter()
        router.beforeEach(async (to, from) => {
            // Re-check session for protected routes
            if (to.path.startsWith('/admin') && !from.path.startsWith('/admin')) {
            await initializeFromSession()
            }
        })
        }
    }
})