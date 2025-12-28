<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div v-if="cartStore.items.length === 0" class="text-center py-12">
        <p class="text-gray-500 mb-4">Your cart is empty</p>
        <router-link to="/products" class="btn-primary">
          Continue Shopping
        </router-link>
      </div>

      <div v-else>
        <!-- Cart Items -->
        <div class="space-y-4 mb-8">
          <div v-for="item in cartStore.items" :key="item.id" 
               class="card flex gap-4">
            <img :src="item.image" :alt="item.name" 
                 class="w-24 h-24 object-cover rounded">
            <div class="flex-1">
              <h3 class="font-semibold">{{ item.name }}</h3>
              <p class="text-primary-600">${{ item.price }}</p>
            </div>
            <div class="flex items-center gap-4">
              <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="btn-secondary px-3 py-1">-</button>
              <span class="font-semibold">{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="btn-secondary px-3 py-1">+</button>
              <button @click="cartStore.removeItem(item.id)"
                      class="text-red-500 hover:text-red-700 ml-4">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="card bg-gray-100">
          <div class="flex justify-between mb-4">
            <span class="font-semibold">Subtotal:</span>
            <span class="font-bold">${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="font-semibold">Shipping:</span>
            <span>$5.00</span>
          </div>
          <div class="border-t pt-4 flex justify-between mb-6">
            <span class="text-xl font-bold">Total:</span>
            <span class="text-xl font-bold text-primary-600">
              ${{ (cartStore.totalPrice + 5).toFixed(2) }}
            </span>
          </div>
          <button @click="checkout" class="btn-primary w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const checkout = () => {
  // For now, just show alert
  alert('Checkout feature coming soon!')
  // Later: router.push('/checkout')
}
</script>
