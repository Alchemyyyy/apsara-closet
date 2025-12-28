<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl">✨</span>
          <span class="text-xl font-bold text-primary-600">Apsara Closet</span>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/products" class="hover:text-primary-600 transition">Products</router-link>
          <router-link to="/visual-search" class="hover:text-primary-600 transition">Visual Search</router-link>
          <router-link to="/cart" class="relative hover:text-primary-600 transition">
            Cart
            <span v-if="cartStore.itemCount > 0" 
                  class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartStore.itemCount }}
            </span>
          </router-link>
          
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <router-link to="/profile" class="hover:text-primary-600 transition">Profile</router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="hover:text-primary-600 transition">Admin</router-link>
            <button @click="authStore.logout" class="btn-secondary text-sm">Logout</button>
          </div>
          <div v-else class="flex items-center space-x-4">
            <router-link to="/login" class="hover:text-primary-600 transition">Login</router-link>
            <router-link to="/register" class="btn-primary text-sm">Sign Up</router-link>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
        <router-link to="/products" class="block py-2 hover:text-primary-600">Products</router-link>
        <router-link to="/visual-search" class="block py-2 hover:text-primary-600">Visual Search</router-link>
        <router-link to="/cart" class="block py-2 hover:text-primary-600">Cart ({{ cartStore.itemCount }})</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/profile" class="block py-2 hover:text-primary-600">Profile</router-link>
          <button @click="authStore.logout" class="block w-full text-left py-2 hover:text-primary-600">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="block py-2 hover:text-primary-600">Login</router-link>
          <router-link to="/register" class="block py-2 hover:text-primary-600">Sign Up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const mobileMenuOpen = ref(false)
</script>
