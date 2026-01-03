<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p class="mt-2 text-gray-600">
          {{ wishlistStore.itemCount }} items • Total value: ${{ wishlistStore.totalValue.toFixed(2) }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="wishlistStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-gray-600">Loading your wishlist...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistStore.items.length === 0" class="text-center py-16">
        <HeartIcon class="mx-auto h-16 w-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
        <p class="mt-2 text-gray-600">Start adding products you love!</p>
        <router-link
          to="/products"
          class="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse Products
        </router-link>
      </div>

      <!-- Wishlist Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in wishlistStore.items"
          :key="item.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- Product Image -->
          <router-link :to="`/products/${item.product.id}`" class="block relative pb-[100%]">
            <img
              :src="getImageUrl(item.product.images[0])"
              :alt="item.product.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
          </router-link>

          <!-- Product Info -->
          <div class="p-4">
            <router-link :to="`/products/${item.product.id}`">
              <h3 class="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2">
                {{ item.product.name }}
              </h3>
            </router-link>

            <div class="mt-2 flex items-center justify-between">
              <span class="text-xl font-bold text-purple-600">
                ${{ item.product.price.toFixed(2) }}
              </span>
              
              <!-- Rating -->
              <div v-if="item.product.averageRating > 0" class="flex items-center gap-1">
                <StarIcon class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span class="text-sm text-gray-600">
                  {{ item.product.averageRating.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- Stock Status -->
            <div class="mt-2">
              <span
                v-if="item.product.stock > 0"
                class="text-sm text-green-600"
              >
                In Stock
              </span>
              <span v-else class="text-sm text-red-600">
                Out of Stock
              </span>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex gap-2">
              <button
                @click="moveToCart(item.product.id)"
                :disabled="item.product.stock === 0"
                class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Move to Cart
              </button>
              <button
                @click="removeFromWishlist(item.product.id)"
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Remove"
              >
                <TrashIcon class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { HeartIcon, StarIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useWishlistStore } from '../stores/wishlist'
import { useCartStore } from '../stores/cart'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg'
  if (imagePath.startsWith('http')) return imagePath
  return `${apiBaseUrl}/${imagePath}`
}

const moveToCart = async (productId) => {
  const result = await wishlistStore.moveToCart(productId)
  if (result.success) {
    // Refresh cart
    await cartStore.fetchCart()
    // Optional: Show success toast
    alert('Item moved to cart!')
  } else {
    alert(result.message)
  }
}

const removeFromWishlist = async (productId) => {
  if (confirm('Remove this item from your wishlist?')) {
    const result = await wishlistStore.removeItem(productId)
    if (!result.success) {
      alert(result.message)
    }
  }
}

onMounted(() => {
  wishlistStore.fetchWishlist()
})
</script>