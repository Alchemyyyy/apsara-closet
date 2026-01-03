import api from './api'

export default {
  // Get reviews for a product
  async getProductReviews(productId, params = {}) {
    const { data } = await api.get(`/reviews/product/${productId}`, { params })
    return data
  },

  // Create a review
  async createReview(reviewData) {
    const formData = new FormData()
    formData.append('productId', reviewData.productId)
    formData.append('rating', reviewData.rating)
    formData.append('comment', reviewData.comment)
    
    if (reviewData.title) {
      formData.append('title', reviewData.title)
    }

    // Add images if any
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach(image => {
        formData.append('images', image)
      })
    }

    const { data } = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Update a review
  async updateReview(reviewId, reviewData) {
    const { data } = await api.put(`/reviews/${reviewId}`, reviewData)
    return data
  },

  // Delete a review
  async deleteReview(reviewId) {
    const { data } = await api.delete(`/reviews/${reviewId}`)
    return data
  },

  // Mark review as helpful
  async markHelpful(reviewId) {
    const { data } = await api.post(`/reviews/${reviewId}/helpful`)
    return data
  },

  // Get user's reviews
  async getUserReviews() {
    const { data } = await api.get('/reviews/my-reviews')
    return data
  }
}