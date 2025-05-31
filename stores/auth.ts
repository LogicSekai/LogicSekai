import { defineStore } from 'pinia'
import PocketBase from 'pocketbase'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        pb: new PocketBase('http://localhost:8090'),
        isInitialized: false
    }),
    actions: {
        async initialize() {
            try {
                // Cek apakah ada token yang valid
                if (this.pb.authStore.isValid) {
                    // Refresh auth state dari server
                    await this.pb.collection('users').authRefresh()
                    this.user = this.pb.authStore.model
                }
            } catch (err) {
                // Clear auth jika token invalid
                this.pb.authStore.clear()
                this.user = null
            } finally {
                this.isInitialized = true
            }
        },
        async login(email: string, password: string, rememberMe?: boolean) {
            try {
                const authData = await this.pb.collection('users').authWithPassword(email, password)
                this.user = this.pb.authStore.model
                return authData
            } catch (error) {
                throw error
            }
        },
        async register(userData: {
            name: string
            email: string
            password: string
            passwordConfirm: string
        }) {
            try {
                // Create user
                await this.pb.collection('users').create(userData)
                
                // Auto-login setelah register
                const authData = await this.pb.collection('users')
                    .authWithPassword(userData.email, userData.password)
                
                this.user = this.pb.authStore.model
                return authData
            } catch (error) {
                throw error
            }
        },
        async logout() {
            this.pb.authStore.clear()
            this.user = null
        },
        async checkAuth() {
            try {
                if (this.pb.authStore.isValid) {
                await this.pb.collection('users').authRefresh()
                this.user = this.pb.authStore.model
                }
            } catch (error) {
                this.pb.authStore.clear()
                this.user = null
            }
        }
    },
    getters: {
        isAuthenticated(): boolean {
            return !!this.user
        },
        isAdmin(): boolean {
            return this.user?.role === 'admin'
        },
        hasRole: (state) => (role: string) => {
            return state.user?.role === role
        },
        hasAnyRole: (state) => (roles: string[]) => {
            return roles.includes(state.user?.role)
        }
    }
})