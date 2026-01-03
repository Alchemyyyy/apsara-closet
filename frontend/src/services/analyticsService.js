import api from './api'

export default {
  // Get dashboard overview stats
  async getOverview() {
    const { data } = await api.get('/analytics/overview')
    return data
  },

  // Get sales data
  async getSalesData(period = '7days') {
    const { data } = await api.get('/analytics/sales', {
      params: { period }
    })
    return data
  },

  // Get top products
  async getTopProducts(limit = 10) {
    const { data } = await api.get('/analytics/top-products', {
      params: { limit }
    })
    return data
  },

  // Get recent orders
  async getRecentOrders(limit = 10) {
    const { data } = await api.get('/analytics/recent-orders', {
      params: { limit }
    })
    return data
  },

  // Get user statistics
  async getUserStats() {
    const { data } = await api.get('/analytics/users')
    return data
  },

  // Get revenue by category
  async getRevenueByCategory() {
    const { data } = await api.get('/analytics/revenue-by-category')
    return data
  }
}