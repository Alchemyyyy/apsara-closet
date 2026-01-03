<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">AC</span>
          </div>
          <span class="text-xl font-bold text-gray-900">Apsara Closet</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            to="/products"
            class="text-gray-700 hover:text-purple-600 font-medium transition-colors"
          >
            Products
          </router-link>
          <router-link
            to="/visual-search"
            class="text-gray-700 hover:text-purple-600 font-medium transition-colors"
          >
            Visual Search
          </router-link>
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center space-x-4">
          <!-- Wishlist -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/wishlist"
            class="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <HeartIcon class="w-6 h-6" />
            <span
              v-if="wishlistStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ wishlistStore.itemCount }}
            </span>
          </router-link>

          <!-- Cart -->
          <router-link
            to="/cart"
            class="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ShoppingCartIcon class="w-6 h-6" />
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click.stop="toggleUserMenu"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 font-semibold text-sm">
                  {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
                </span>
              </div>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                v-click-outside="closeUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Profile
                </router-link>
                <router-link
                  to="/wishlist"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Wishlist
                </router-link>
                <router-link
                  v-if="authStore.user?.isAdmin"
                  to="/admin"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Admin Dashboard
                </router-link>
                <hr class="my-1" />
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </Transition>
          </div>

          <!-- Login Button -->
          <router-link
            v-else
            to="/login"
            class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
    wishlistStore.fetchWishlist()
  }
})
</script>