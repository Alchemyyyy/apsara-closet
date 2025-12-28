<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-4 text-center">AI Visual Search</h1>
      <p class="text-center text-gray-600 mb-8">
        Upload a fashion photo and find similar products instantly
      </p>

      <!-- Upload Area -->
      <div class="card mb-8">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input 
            type="file" 
            accept="image/*"
            @change="handleImageUpload"
            ref="fileInput"
            class="hidden">
          
          <div v-if="!previewUrl">
            <div class="text-6xl mb-4">📸</div>
            <button @click="$refs.fileInput.click()" class="btn-primary">
              Choose Image
            </button>
            <p class="text-sm text-gray-500 mt-4">
              or drag and drop an image here
            </p>
          </div>

          <div v-else>
            <img :src="previewUrl" alt="Preview" class="max-h-96 mx-auto rounded-lg mb-4">
            <div class="flex gap-4 justify-center">
              <button @click="searchByImage" :disabled="searching" class="btn-primary">
                {{ searching ? 'Searching...' : 'Search Similar Products' }}
              </button>
              <button @click="resetSearch" class="btn-secondary">
                Upload New Image
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="results.length > 0">
        <h2 class="text-2xl font-bold mb-6">Similar Products Found</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="product in results" :key="product.id" 
               class="card cursor-pointer"
               @click="goToProduct(product.id)">
            <img :src="product.images[0]" 
                 :alt="product.name"
                 class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="font-semibold mb-2">{{ product.name }}</h3>
            <p class="text-primary-600 font-bold">${{ product.price }}</p>
            <p class="text-sm text-gray-500 mt-2">
              {{ Math.round(product.similarity * 100) }}% match
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const fileInput = ref(null)
const previewUrl = ref(null)
const results = ref([])
const searching = ref(false)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

const searchByImage = async () => {
  const file = fileInput.value.files[0]
  if (!file) return

  searching.value = true
  
  const formData = new FormData()
  formData.append('image', file)

  try {
    // This will connect to AI service later
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/visual-search`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    
    results.value = response.data.results
  } catch (error) {
    console.error('Visual search failed:', error)
    alert('Visual search is not yet implemented. Coming soon!')
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  previewUrl.value = null
  results.value = []
  fileInput.value.value = ''
}

const goToProduct = (id) => {
  router.push(`/products/${id}`)
}
</script>
