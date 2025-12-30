import { defineStore } from 'pinia'
import { cartAPI } from '../services/apiService'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    summary: {
      itemCount: 0,
      totalItems: 0,
      subtotal: 0,
      total: 0
    }
  }),
  
  getters: {
    itemCount: (state) => state.items.length,
    totalPrice: (state) => state.summary.total,
    hasItems: (state) => state.items.length > 0,
  },
  
  actions: {
    async fetchCart() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.items = []
        return
      }
      
      try {
        this.loading = true
        const response = await cartAPI.get()
        this.items = response.data.cartItems
        this.summary = response.data.summary
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        this.loading = false
      }
    },
    
    async addItem(product, quantity = 1, options = {}) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        alert('Please login to add items to cart')
        return { success: false }
      }
      
      try {
        await cartAPI.add({
          productId: product.id,
          quantity,
          size: options.size || null,
          color: options.color || null,
        })
        
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        console.error('Failed to add to cart:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to add to cart' 
        }
      }
    },
    
    async updateQuantity(itemId, quantity) {
      if (quantity < 1) {
        return this.removeItem(itemId)
      }
      
      try {
        await cartAPI.update(itemId, { quantity })
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        console.error('Failed to update cart:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to update cart' 
        }
      }
    },
    
    async removeItem(itemId) {
      try {
        await cartAPI.remove(itemId)
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        console.error('Failed to remove item:', error)
        return { success: false }
      }
    },
    
    async clearCart() {
      try {
        await cartAPI.clear()
        this.items = []
        this.summary = {
          itemCount: 0,
          totalItems: 0,
          subtotal: 0,
          total: 0
        }
        return { success: true }
      } catch (error) {
        console.error('Failed to clear cart:', error)
        return { success: false }
      }
    }
  }
})
