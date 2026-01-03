<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-gray-600">Overview of your store performance</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-gray-600">Loading dashboard...</p>
      </div>

      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Revenue -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">
                  ${{ overview.totalRevenue?.toFixed(2) || '0.00' }}
                </p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              <span :class="overview.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ overview.revenueChange >= 0 ? '+' : '' }}{{ overview.revenueChange }}%
              </span>
              vs last period
            </p>
          </div>

          <!-- Total Orders -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Orders</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">
                  {{ overview.totalOrders || 0 }}
                </p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              {{ overview.pendingOrders || 0 }} pending orders
            </p>
          </div>

          <!-- Total Customers -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Customers</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">
                  {{ overview.totalCustomers || 0 }}
                </p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              {{ overview.newCustomers || 0 }} new this month
            </p>
          </div>

          <!-- Total Products -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Products</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">
                  {{ overview.totalProducts || 0 }}
                </p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-full">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              {{ overview.lowStockProducts || 0 }} low stock items
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Sales Chart -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Sales Overview</h2>
              <select
                v-model="salesPeriod"
                @change="loadSalesData"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            <div class="h-80">
              <canvas ref="salesChart"></canvas>
            </div>
          </div>

          <!-- Top Products -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h2>
            <div class="space-y-4">
              <div
                v-for="(product, index) in topProducts"
                :key="product.id"
                class="flex items-center gap-4"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-semibold text-sm">{{ index + 1 }}</span>
                </div>
                <img
                  :src="getImageUrl(product.images?.[0])"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.soldCount }} sold</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">${{ product.price }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                    #{{ order.orderNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ order.user.firstName }} {{ order.user.lastName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ order.total.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(order.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import analyticsService from '../../services/analyticsService'
import Chart from 'chart.js/auto'

const loading = ref(true)
const overview = ref({})
const topProducts = ref([])
const recentOrders = ref([])
const salesPeriod = ref('7days')
const salesChart = ref(null)
let chartInstance = null

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const loadDashboard = async () => {
  loading.value = true
  try {
    const [overviewData, topProductsData, recentOrdersData] = await Promise.all([
      analyticsService.getOverview(),
      analyticsService.getTopProducts(5),
      analyticsService.getRecentOrders(10)
    ])

    overview.value = overviewData
    topProducts.value = topProductsData.products || []
    recentOrders.value = recentOrdersData.orders || []

    await loadSalesData()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

const loadSalesData = async () => {
  try {
    const salesData = await analyticsService.getSalesData(salesPeriod.value)
    renderChart(salesData)
  } catch (error) {
    console.error('Failed to load sales data:', error)
  }
}

const renderChart = (salesData) => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = salesChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesData.labels || [],
      datasets: [{
        label: 'Sales',
        data: salesData.values || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg'
  if (imagePath.startsWith('http')) return imagePath
  return `${apiBaseUrl}/${imagePath}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadDashboard()
})
</script>