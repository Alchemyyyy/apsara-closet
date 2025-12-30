<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="card max-w-md w-full">
      <h2 class="text-2xl font-bold text-center mb-8">Create Account</h2>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">First Name</label>
            <input 
              v-model="form.firstName" 
              type="text" 
              required
              class="input-field"
              placeholder="John"
            >
          </div>
          <div>
            <label class="input-label">Last Name</label>
            <input 
              v-model="form.lastName" 
              type="text" 
              required
              class="input-field"
              placeholder="Doe"
            >
          </div>
        </div>

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
          <label class="input-label">Phone (Optional)</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            class="input-field"
            placeholder="+855 12 345 678"
          >
        </div>

        <div>
          <label class="input-label">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            minlength="6"
            class="input-field"
            placeholder="••••••••"
          >
        </div>

        <div>
          <label class="input-label">Confirm Password</label>
          <input 
            v-model="form.confirmPassword" 
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
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-primary-600 hover:underline font-semibold">
          Login
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match!'
    return
  }

  loading.value = true
  const result = await authStore.register(form.value)
  loading.value = false
  
  if (result.success) {
    successMessage.value = 'Account created! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    errorMessage.value = result.error
  }
}
</script>
