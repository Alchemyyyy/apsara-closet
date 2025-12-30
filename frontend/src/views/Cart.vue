<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <!-- Loading -->
      <div v-if="cartStore.loading" class="text-center py-12">
        <p class="text-gray-500">Loading cart...</p>
      </div>

      <!-- Empty cart -->
      <div v-else-if="cartStore.items.length === 0" class="text-center py-12">
        <p class="text-gray-500 mb-4">Your cart is empty</p>
        <router-link to="/products" class="btn-primary">
          Continue Shopping
        </router-link>
      </div>

      <!-- Cart items -->
      <div v-else>
        <div class="space-y-4 mb-8">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="card flex gap-4"
          >
            <!-- Product Image -->
            <img 
              :src="item.product.images[0] || 'https://via.placeholder.com/100'" 
              :alt="item.product.name" 
              class="w-24 h-24 object-cover rounded cursor-pointer"
              @click="goToProduct(item.product.slug)"
            >
            
            <!-- Product Details -->
            <div class="flex-1">
              <h3 
                class="font-semibold cursor-pointer hover:text-primary-600"
                @click="goToProduct(item.product.slug)"
              >
                {{ item.product.name }}
              </h3>
              <p class="text-primary-600">${{ item.product.price.toFixed(2) }}</p>
              <div class="text-sm text-gray-500">
                <span v-if="item.size">Size: {{ item.size }}</span>
                <span v-if="item.color" class="ml-2">Color: {{ item.color }}</span>
              </div>
            </div>
            
            <!-- Quantity Controls -->
            <div class="flex items-center gap-4">
              <button 
                @click="updateQuantity(item.id, item.quantity - 1)"
                class="btn-secondary px-3 py-1 text-sm"
                :disabled="updating"
              >
                -
              </button>
              <span class="font-semibold">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.id, item.quantity + 1)"
                class="btn-secondary px-3 py-1 text-sm"
                :disabled="updating || item.quantity >= item.product.stock"
              >
                +
              </button>
              <button 
                @click="removeItem(item.id)"
                class="text-red-500 hover:text-red-700 ml-4"
                :disabled="updating"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="card bg-gray-100">
          <div class="flex justify-between mb-4">
            <span class="font-semibold">Subtotal:</span>
            <span class="font-bold">${{ cartStore.summary.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="font-semibold">Shipping:</span>
            <span>${{ shipping.toFixed(2) }}</span>
          </div>
          <div class="border-t pt-4 flex justify-between mb-6">
            <span class="text-xl font-bold">Total:</span>
            <span class="text-xl font-bold text-primary-600">
              ${{ (cartStore.summary.subtotal + shipping).toFixed(2) }}
            </span>
          </div>
          
          <button @click="checkout" class="btn-primary w-full mb-4">
            Proceed to Checkout
          </button>
          
          <button @click="clearCart" class="btn-secondary w-full" :disabled="updating">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const updating = ref(false)

const shipping = computed(() => {
  return cartStore.summary.subtotal > 100 ? 0 : 5
})

const updateQuantity = async (itemId, quantity) => {
  updating.value = true
  await cartStore.updateQuantity(itemId, quantity)
  updating.value = false
}

const removeItem = async (itemId) => {
  if (confirm('Remove this item from cart?')) {
    updating.value = true
    await cartStore.removeItem(itemId)
    updating.value = false
  }
}

const clearCart = async () => {
  if (confirm('Clear all items from cart?')) {
    updating.value = true
    await cartStore.clearCart()
    updating.value = false
  }
}

const checkout = () => {
  alert('Checkout feature coming soon!')
  // Later: router.push('/checkout')
}

const goToProduct = (slug) => {
  router.push(`/products/${slug}`)
}

onMounted(() => {
  cartStore.fetchCart()
})
</script>
