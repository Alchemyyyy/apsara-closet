<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="card max-w-md w-full">
      <h2 class="text-2xl font-bold text-center mb-8">Login to Apsara Closet</h2>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="input-label">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            class="input-field"
            placeholder="you@example.com"
          >
        </div>

        <div>
          <label class="input-label">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="input-field"
            placeholder="••••••••"
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading" 
          class="btn-primary w-full"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        Don't have an account?
        <router-link to="/register" class="text-primary-600 hover:underline font-semibold">
          Sign up
        </router-link>
      </p>

      <!-- Demo credentials -->
      <div class="mt-6 p-4 bg-blue-50 rounded text-sm">
        <p class="font-semibold mb-2">Demo Credentials:</p>
        <p><strong>Admin:</strong> admin@apsaracloset.com / admin123</p>
        <p><strong>User:</strong> test@example.com / test123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  const result = await authStore.login(form.value.email, form.value.password)
  loading.value = false
  
  if (result.success) {
    // Fetch cart after login
    await cartStore.fetchCart()
    
    // Redirect to home
    router.push('/')
  } else {
    errorMessage.value = result.error
  }
}
</script>
