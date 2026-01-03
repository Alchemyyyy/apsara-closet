<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading product...</p>
      </div>

      <!-- Product not found -->
      <div v-else-if="!product" class="text-center py-12">
        <p class="text-gray-500">Product not found</p>
        <router-link to="/products" class="btn-primary mt-4">
          Back to Products
        </router-link>
      </div>

      <!-- Product Details -->
      <div v-else>
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <!-- Images -->
          <div>
            <img 
              :src="product.images[0] || 'https://via.placeholder.com/600'" 
              :alt="product.name"
              class="w-full rounded-lg shadow-lg mb-4"
            >
            <div v-if="product.images.length > 1" class="grid grid-cols-4 gap-2">
              <img 
                v-for="(image, index) in product.images" 
                :key="index"
                :src="image"
                @click="selectImage(index)"
                class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
              >
            </div>
          </div>

          <!-- Details -->
          <div>
            <div class="flex items-start justify-between mb-4">
              <h1 class="text-3xl font-bold flex-1">{{ product.name }}</h1>
              
              <!-- Wishlist Button -->
              <WishlistButton :product-id="product.id" />
            </div>

            <!-- Rating Display -->
            <div v-if="product.averageRating > 0" class="flex items-center gap-2 mb-4">
              <StarRating 
                :model-value="product.averageRating" 
                :readonly="true" 
                :show-value="false"
                :size="5"
              />
              <span class="text-sm text-gray-600">
                {{ product.averageRating.toFixed(1) }} ({{ product.totalReviews }} reviews)
              </span>
            </div>

            <p class="text-2xl text-purple-600 font-bold mb-6">${{ product.price.toFixed(2) }}</p>
            
            <!-- Category -->
            <div class="mb-4">
              <span class="text-sm text-gray-500">Category: </span>
              <span class="text-sm font-medium">{{ product.category.name }}</span>
            </div>

            <!-- Stock -->
            <div class="mb-6">
              <span 
                v-if="product.stock > 0" 
                class="text-green-600 font-medium"
              >
                ✓ In Stock ({{ product.stock }} available)
              </span>
              <span v-else class="text-red-600 font-medium">
                ✗ Out of Stock
              </span>
            </div>
            
            <!-- Description -->
            <div class="mb-6">
              <h3 class="font-semibold mb-2">Description</h3>
              <p class="text-gray-600">{{ product.description }}</p>
            </div>

            <!-- Size Selection -->
            <div v-if="product.sizes && product.sizes.length > 0" class="mb-6">
              <label class="input-label">Size</label>
              <select v-model="selectedSize" class="input-field">
                <option value="">Select size</option>
                <option v-for="size in product.sizes" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>

            <!-- Color Selection -->
            <div v-if="product.colors && product.colors.length > 0" class="mb-6">
              <label class="input-label">Color</label>
              <div class="flex gap-2">
                <button 
                  v-for="color in product.colors" 
                  :key="color"
                  @click="selectedColor = color"
                  :class="[
                    'px-4 py-2 rounded-lg border-2 transition',
                    selectedColor === color 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-300'
                  ]"
                >
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div class="mb-6">
              <label class="input-label">Quantity</label>
              <div class="flex items-center gap-4">
                <button 
                  @click="quantity = Math.max(1, quantity - 1)" 
                  class="btn-secondary px-4 py-2"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <span class="text-xl font-semibold">{{ quantity }}</span>
                <button 
                  @click="quantity++" 
                  class="btn-secondary px-4 py-2"
                  :disabled="quantity >= product.stock"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {{ successMessage }}
            </div>

            <!-- Add to Cart Button -->
            <button 
              @click="addToCart" 
              :disabled="addingToCart || product.stock === 0"
              class="btn-primary w-full text-lg"
            >
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>

            <!-- Back Button -->
            <router-link to="/products" class="btn-secondary w-full text-lg mt-4 block text-center">
              Back to Products
            </router-link>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="max-w-4xl mx-auto mt-12">
          <ReviewList
            :product-id="product.id"
            :can-write-review="authStore.isAuthenticated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsAPI } from '../services/apiService'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import WishlistButton from '../components/WishlistButton.vue'
import StarRating from '../components/StarRating.vue'
import ReviewList from '../components/ReviewList.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const product = ref(null)
const loading = ref(true)
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const addingToCart = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fetchProduct = async () => {
  try {
    loading.value = true
    const response = await productsAPI.getById(route.params.id)
    product.value = response.data.product
    
    // Auto-select first size and color if available
    if (product.value.sizes && product.value.sizes.length > 0) {
      selectedSize.value = product.value.sizes[0]
    }
    if (product.value.colors && product.value.colors.length > 0) {
      selectedColor.value = product.value.colors[0]
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const addToCart = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Check if user is logged in
  if (!authStore.isAuthenticated) {
    errorMessage.value = 'Please login to add items to cart'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }

  // Validate stock
  if (quantity.value > product.value.stock) {
    errorMessage.value = `Only ${product.value.stock} items available`
    return
  }

  addingToCart.value = true
  
  const result = await cartStore.addItem(product.value, quantity.value, {
    size: selectedSize.value || null,
    color: selectedColor.value || null,
  })
  
  addingToCart.value = false
  
  if (result.success) {
    successMessage.value = 'Added to cart successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    errorMessage.value = result.error || 'Failed to add to cart'
  }
}

const selectImage = (index) => {
  // Implement image gallery if needed
  console.log('Selected image:', index)
}

onMounted(() => {
  fetchProduct()
})
</script>