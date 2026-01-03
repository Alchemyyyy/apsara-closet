import { defineStore } from 'pinia'
import wishlistService from '../services/wishlistService'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    itemCount: (state) => state.items.length,
    
    isInWishlist: (state) => (productId) => {
      return state.items.some(item => item.product.id === productId)
    },

    totalValue: (state) => {
      return state.items.reduce((total, item) => total + item.product.price, 0)
    }
  },

  actions: {
    async fetchWishlist() {
      this.loading = true
      this.error = null
      try {
        const response = await wishlistService.getWishlist()
        this.items = response.items || []
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to load wishlist'
        console.error('Fetch wishlist error:', error)
      } finally {
        this.loading = false
      }
    },

    async addItem(productId) {
      try {
        const response = await wishlistService.addToWishlist(productId)
        this.items.push(response.item)
        return { success: true, message: 'Added to wishlist' }
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to add to wishlist'
        console.error('Add to wishlist error:', error)
        return { success: false, message }
      }
    },

    async removeItem(productId) {
      try {
        await wishlistService.removeFromWishlist(productId)
        this.items = this.items.filter(item => item.product.id !== productId)
        return { success: true, message: 'Removed from wishlist' }
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to remove from wishlist'
        console.error('Remove from wishlist error:', error)
        return { success: false, message }
      }
    },

    async moveToCart(productId) {
      try {
        await wishlistService.moveToCart(productId)
        this.items = this.items.filter(item => item.product.id !== productId)
        return { success: true, message: 'Moved to cart' }
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to move to cart'
        console.error('Move to cart error:', error)
        return { success: false, message }
      }
    },

    clearWishlist() {
      this.items = []
    }
  }
})