<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <h1 class="text-3xl font-bold mb-4 text-center">AI Visual Search</h1>
      <p class="text-center text-gray-600 mb-8">
        Upload a fashion photo and our AI will find similar products instantly! 🔍✨
      </p>

      <!-- Upload Area -->
      <div class="card mb-8">
        <div 
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition',
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          ]"
        >
          <input 
            type="file" 
            accept="image/*"
            @change="handleImageUpload"
            ref="fileInput"
            class="hidden"
          >
          
          <div v-if="!previewUrl && !searching">
            <div class="text-6xl mb-4">📸</div>
            <button @click="$refs.fileInput.click()" class="btn-primary mb-4">
              Choose Image
            </button>
            <p class="text-sm text-gray-500">
              or drag and drop an image here
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Supports: JPG, PNG, WEBP (Max 10MB)
            </p>
          </div>

          <div v-else-if="previewUrl && !searching">
            <img :src="previewUrl" alt="Preview" class="max-h-96 mx-auto rounded-lg mb-4 shadow-lg">
            <div class="flex gap-4 justify-center">
              <button @click="searchByImage" class="btn-primary">
                🔍 Search Similar Products
              </button>
              <button @click="resetSearch" class="btn-secondary">
                📷 Upload New Image
              </button>
            </div>
          </div>

          <div v-else-if="searching" class="py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
            <p class="text-lg font-semibold text-primary-600">Analyzing image with AI...</p>
            <p class="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p class="font-semibold">❌ Error</p>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Search Info -->
      <div v-if="searchInfo" class="mb-8 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
        <p><strong>✅ Search Complete!</strong></p>
        <p class="text-sm mt-1">
          Compared with {{ searchInfo.total_products_compared }} products
        </p>
      </div>

      <!-- Results -->
      <div v-if="results.length > 0">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            Similar Products Found ({{ results.length }})
          </h2>
          <button @click="resetSearch" class="btn-secondary text-sm">
            New Search
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div 
            v-for="product in results" 
            :key="product.id" 
            class="card cursor-pointer hover:shadow-xl transition-all animate-fade-in"
            @click="goToProduct(product.slug)"
          >
            <div class="relative">
              <img 
                :src="product.images[0] || 'https://via.placeholder.com/300'" 
                :alt="product.name"
                class="w-full h-64 object-cover rounded-lg mb-4"
              >
              <!-- Match Badge -->
              <div class="absolute top-2 right-2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {{ product.match_percentage }}% Match
              </div>
            </div>
            <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
            <p class="text-primary-600 font-bold">${{ product.price.toFixed(2) }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ product.category?.name }}</p>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div v-if="!previewUrl && !searching && results.length === 0" class="mt-12">
        <h3 class="text-2xl font-bold text-center mb-8">How It Works</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="card text-center">
            <div class="text-4xl mb-4">📤</div>
            <h4 class="font-semibold mb-2">1. Upload Image</h4>
            <p class="text-sm text-gray-600">Upload a photo of any fashion item you like</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">🤖</div>
            <h4 class="font-semibold mb-2">2. AI Analysis</h4>
            <p class="text-sm text-gray-600">Our AI analyzes the style, color, and pattern</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">✨</div>
            <h4 class="font-semibold mb-2">3. Get Results</h4>
            <p class="text-sm text-gray-600">Discover similar products ranked by similarity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { aiAPI } from '../services/aiService'

const router = useRouter()

const fileInput = ref(null)
const previewUrl = ref(null)
const selectedFile = ref(null)
const results = ref([])
const searching = ref(false)
const errorMessage = ref('')
const searchInfo = ref(null)
const isDragging = ref(false)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    errorMessage.value = 'Please drop an image file'
  }
}

const processFile = (file) => {
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'Image file is too large. Maximum size is 10MB.'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  errorMessage.value = ''
  results.value = []
  searchInfo.value = null
}

const searchByImage = async () => {
  if (!selectedFile.value) return

  searching.value = true
  errorMessage.value = ''
  results.value = []
  searchInfo.value = null

  try {
    console.log('🔍 Starting visual search...')
    
    const response = await aiAPI.visualSearch(selectedFile.value, {
      limit: 12
    })

    console.log('✅ Search results:', response.data)

    results.value = response.data.results || []
    searchInfo.value = {
      total_products_compared: response.data.total_products_compared,
      query_image: response.data.query_image
    }

    if (results.value.length === 0) {
      errorMessage.value = 'No similar products found. Try another image!'
    }
  } catch (error) {
    console.error('❌ Visual search failed:', error)
    errorMessage.value = error.response?.data?.error || 'Visual search failed. Please try again.'
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  previewUrl.value = null
  selectedFile.value = null
  results.value = []
  errorMessage.value = ''
  searchInfo.value = null
  isDragging.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const goToProduct = (slug) => {
  router.push(`/products/${slug}`)
}
</script>
