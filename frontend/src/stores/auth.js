import { defineStore } from 'pinia'
import { authAPI } from '../services/apiService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.isAdmin || false,
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },
  
  actions: {
    async login(email, password) {
      try {
        const response = await authAPI.login({ email, password })
        
        this.token = response.data.token
        this.user = response.data.user
        
        // Save to localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return { success: true }
      } catch (error) {
        console.error('Login failed:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Login failed' 
        }
      }
    },
    
    async register(userData) {
      try {
        await authAPI.register(userData)
        return { success: true }
      } catch (error) {
        console.error('Registration failed:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Registration failed' 
        }
      }
    },
    
    async fetchProfile() {
      try {
        const response = await authAPI.getProfile()
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        this.logout()
      }
    },
    
    async updateProfile(data) {
      try {
        const response = await authAPI.updateProfile(data)
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
        return { success: true }
      } catch (error) {
        console.error('Update profile failed:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Update failed' 
        }
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('cart') // Clear cart too
    }
  }
})
