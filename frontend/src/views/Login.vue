<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="card max-w-md w-full">
      <h2 class="text-2xl font-bold text-center mb-8">Login to Apsara Closet</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="input-label">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            class="input-field"
            placeholder="you@example.com">
        </div>

        <div>
          <label class="input-label">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="input-field"
            placeholder="••••••••">
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        Don't have an account?
        <router-link to="/register" class="text-primary-600 hover:underline font-semibold">
          Sign up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const success = await authStore.login(form.value.email, form.value.password)
  loading.value = false
  
  if (success) {
    router.push('/')
  } else {
    alert('Login failed. Please check your credentials.')
  }
}
</script>
