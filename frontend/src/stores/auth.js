import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true'
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },
  
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email,
          password
        })
        
        this.token = response.data.token
        this.user = response.data.user
        this.isAdmin = response.data.user.isAdmin
        
        localStorage.setItem('token', this.token)
        localStorage.setItem('isAdmin', this.isAdmin)
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },
    
    async register(userData) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/register', userData)
        return true
      } catch (error) {
        console.error('Registration failed:', error)
        return false
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAdmin = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('isAdmin')
      
      delete axios.defaults.headers.common['Authorization']
    },
    
    async fetchUser() {
      if (this.token) {
        try {
          const response = await axios.get('http://localhost:3000/api/auth/profile')
          this.user = response.data
        } catch (error) {
          console.error('Failed to fetch user:', error)
          this.logout()
        }
      }
    }
  }
})
