<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-4">Welcome to Apsara Closet</h1>
        <p class="text-xl mb-8">Your Divine Wardrobe, Powered by AI</p>
        <div class="flex gap-4 justify-center">
          <router-link to="/products" class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Browse Products
          </router-link>
          <router-link to="/visual-search" class="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition border-2 border-white">
            Try Visual Search
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Featured Products</h2>
        
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500">Loading products...</p>
        </div>
        
        <!-- Products Grid -->
        <div v-else-if="products.length > 0" class="grid md:grid-cols-4 gap-6">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="card cursor-pointer animate-fade-in"
            @click="goToProduct(product.slug)"
          >
            <img 
              :src="product.images[0] || 'https://via.placeholder.com/300'" 
              :alt="product.name"
              class="w-full h-64 object-cover rounded-lg mb-4"
            >
            <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
            <p class="text-primary-600 font-bold">${{ product.price.toFixed(2) }}</p>
          </div>
        </div>
        
        <!-- No products -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500">No products available yet.</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Why Choose Apsara Closet?</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card text-center">
            <div class="text-4xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold mb-2">AI Visual Search</h3>
            <p class="text-gray-600">Upload any fashion photo and find similar products instantly</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">✨</div>
            <h3 class="text-xl font-semibold mb-2">Personalized Style</h3>
            <p class="text-gray-600">Get recommendations tailored to your unique taste</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">��️</div>
            <h3 class="text-xl font-semibold mb-2">Easy Shopping</h3>
            <p class="text-gray-600">Seamless browsing, secure checkout, fast delivery</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsAPI } from '../services/apiService'

const router = useRouter()
const products = ref([])
const loading = ref(true)

const fetchFeaturedProducts = async () => {
  try {
    const response = await productsAPI.getFeatured(8)
    products.value = response.data.products
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

const goToProduct = (slug) => {
  router.push(`/products/${slug}`)
}

onMounted(() => {
  fetchFeaturedProducts()
})
</script>
