import api from './api'

export default {
  // Get user's wishlist
  async getWishlist() {
    const { data } = await api.get('/wishlist')
    return data
  },

  // Add item to wishlist
  async addToWishlist(productId) {
    const { data } = await api.post('/wishlist', { productId })
    return data
  },

  // Remove item from wishlist
  async removeFromWishlist(productId) {
    const { data } = await api.delete(`/wishlist/${productId}`)
    return data
  },

  // Check if product is in wishlist
  async isInWishlist(productId) {
    const { data } = await api.get(`/wishlist/check/${productId}`)
    return data
  },

  // Move item from wishlist to cart
  async moveToCart(productId) {
    const { data } = await api.post(`/wishlist/${productId}/move-to-cart`)
    return data
  }
}