export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isLoggedIn, initializeFromSession } = useAuth()
  
  // Try to restore session if user not loaded
  if (!user.value) {
    await initializeFromSession()
  }
  
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
  }
})