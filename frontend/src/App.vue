<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(async () => {
  // Fetch cart if user is logged in
  if (authStore.isAuthenticated) {
    await cartStore.fetchCart()
  }
})
</script>
