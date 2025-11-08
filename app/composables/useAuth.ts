export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  role: 'user' | 'creator' | 'superadmin'
  verified: boolean
  created: Date
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const isLoading = useState<boolean>('auth.loading', () => false)

  // Initialize user from session cookie on first load
  const initializeFromSession = async () => {
    if (user.value || isLoading.value) return // Already initialized or loading
    
    isLoading.value = true
    
    try {
      const userCookie = useCookie('user-session')
      if (userCookie.value) {
        const sessionData = typeof userCookie.value === 'string' 
          ? JSON.parse(userCookie.value) 
          : userCookie.value
            
        if (sessionData?.id) {
          // Verify session with server and get full user data
          const result: any = await $fetch('/api/auth/me', {
            method: 'GET'
          })
          
          if (result.success && result.user) {
            user.value = result.user
          } else {
            // Clear invalid session
            userCookie.value = null
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore session:', error)
      // Clear invalid session
      const userCookie = useCookie('user-session')
      userCookie.value = null
    } finally {
      isLoading.value = false
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (result.success && result.user) {
        user.value = result.user
        
        // Store user session in cookie for server-side access
        const userCookie = useCookie('user-session', {
          default: () => null,
          secure: false, // Set false for localhost development
          sameSite: 'lax',
          httpOnly: false, // Allow client-side access for session restore
          maxAge: 60 * 60 * 24 * 7, // 7 days
          encode: value => JSON.stringify(value),
          decode: value => {
            try {
              return JSON.parse(value)
            } catch {
              return null
            }
          }
        })
        userCookie.value = {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          name: result.user.name
        }
        
        await navigateTo('/')
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Login failed' 
      }
    }
  }

  const register = async (userData: {
    name: string
    username: string
    email: string
    password: string
  }) => {
    try {
      const result: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (result.success) {
        return { success: true }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    user.value = null
    
    // Clear user session cookie
    const userCookie = useCookie('user-session')
    userCookie.value = null
    
    // Also call logout API to clear server-side session if needed
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore errors during logout
    }
    
    await navigateTo('/auth/login')
  }

  return {
    user: readonly(user),
    isLoggedIn,
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    initializeFromSession
  }
}