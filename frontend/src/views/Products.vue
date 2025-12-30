<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">All Products</h1>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-8">
        <select v-model="filters.category" @change="fetchProducts" class="input-field max-w-xs">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        
        <input 
          v-model="filters.search" 
          @input="debounceSearch"
          type="text" 
          placeholder="Search products..." 
          class="input-field max-w-xs"
        >
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading products...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchProducts" class="btn-primary">Retry</button>
      </div>

      <!-- No products -->
      <div v-else-if="products.length === 0" class="text-center py-12">
        <p class="text-gray-500 mb-4">No products found.</p>
        <button @click="resetFilters" class="btn-primary">Reset Filters</button>
      </div>

      <!-- Product Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="card cursor-pointer animate-fade-in hover:shadow-lg transition-shadow"
          @click="goToProduct(product.slug)"
        >
          <img 
            :src="product.images[0] || 'https://via.placeholder.com/300'" 
            :alt="product.name"
            class="w-full h-64 object-cover rounded-lg mb-4"
          >
          <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
          <p class="text-primary-600 font-bold">${{ product.price.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ product.category?.name }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center gap-2">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn-secondary px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span class="px-4 py-2">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="btn-secondary px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsAPI, categoriesAPI } from '../services/apiService'

const router = useRouter()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
})

const filters = ref({
  category: '',
  search: '',
})

let searchTimeout = null

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    
    if (filters.value.category) {
      params.category = filters.value.category
    }
    
    if (filters.value.search) {
      params.search = filters.value.search
    }
    
    const response = await productsAPI.getAll(params)
    
    products.value = response.data.products
    pagination.value = response.data.pagination
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = 'Failed to fetch products. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.data.categories
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchProducts()
  }, 500)
}

const changePage = (page) => {
  pagination.value.page = page
  fetchProducts()
  window.scrollTo(0, 0)
}

const resetFilters = () => {
  filters.value = {
    category: '',
    search: '',
  }
  pagination.value.page = 1
  fetchProducts()
}

const goToProduct = (slug) => {
  router.push(`/products/${slug}`)
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
