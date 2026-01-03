<template>
  <button
    @click="toggleWishlist"
    :disabled="loading"
    :class="[
      'p-2 rounded-full transition-all',
      isInWishlist
        ? 'bg-red-50 text-red-600 hover:bg-red-100'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      loading && 'opacity-50 cursor-not-allowed'
    ]"
    :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <HeartIcon
      :class="[
        'w-6 h-6 transition-all',
        isInWishlist && 'fill-current'
      ]"
    />
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useWishlistStore } from '../stores/wishlist'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
})

const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)

const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.productId)
})

const toggleWishlist = async () => {
  // Check if user is logged in
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true
  
  try {
    if (isInWishlist.value) {
      const result = await wishlistStore.removeItem(props.productId)
      if (result.success) {
        // Optional: Show toast notification
        console.log(result.message)
      }
    } else {
      const result = await wishlistStore.addItem(props.productId)
      if (result.success) {
        // Optional: Show toast notification
        console.log(result.message)
      }
    }
  } catch (error) {
    console.error('Wishlist toggle error:', error)
  } finally {
    loading.value = false
  }
}
</script>