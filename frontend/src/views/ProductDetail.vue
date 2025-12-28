<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading product...</p>
      </div>

      <div v-else-if="product" class="grid md:grid-cols-2 gap-8">
        <!-- Images -->
        <div>
          <img :src="product.images[0] || 'https://via.placeholder.com/600'" 
               :alt="product.name"
               class="w-full rounded-lg shadow-lg mb-4">
          <div class="grid grid-cols-4 gap-2">
            <img v-for="(image, index) in product.images" :key="index"
                 :src="image"
                 class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75">
          </div>
        </div>

        <!-- Details -->
        <div>
          <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
          <p class="text-2xl text-primary-600 font-bold mb-6">${{ product.price }}</p>
          
          <div class="mb-6">
            <h3 class="font-semibold mb-2">Description</h3>
            <p class="text-gray-600">{{ product.description }}</p>
          </div>

          <div class="mb-6">
            <label class="input-label">Size</label>
            <select v-model="selectedSize" class="input-field">
              <option v-for="size in product.sizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <div class="mb-6">
            <label class="input-label">Color</label>
            <div class="flex gap-2">
              <button v-for="color in product.colors" :key="color"
                      @click="selectedColor = color"
                      :class="['w-10 h-10 rounded-full border-2 transition',
                               selectedColor === color ? 'border-primary-500' : 'border-gray-300']"
                      :style="{ backgroundColor: color }">
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="input-label">Quantity</label>
            <div class="flex items-center gap-4">
              <button @click="quantity = Math.max(1, quantity - 1)" 
                      class="btn-secondary px-4 py-2">-</button>
              <span class="text-xl font-semibold">{{ quantity }}</span>
              <button @click="quantity++" 
                      class="btn-secondary px-4 py-2">+</button>
            </div>
          </div>

          <button @click="addToCart" class="btn-primary w-full text-lg">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import axios from 'axios'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${route.params.id}`)
    product.value = response.data
    selectedSize.value = product.value.sizes[0]
    selectedColor.value = product.value.colors[0]
  } catch (error) {
    console.error('Failed to fetch product:', error)
  } finally {
    loading.value = false
  }
})

const addToCart = () => {
  cartStore.addItem(product.value, quantity.value)
  alert('Added to cart!')
}
</script>
