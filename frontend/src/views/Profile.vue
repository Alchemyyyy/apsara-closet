<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-8">My Profile</h1>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Sidebar -->
        <div class="card">
          <nav class="space-y-2">
            <button @click="activeTab = 'info'" 
                    :class="['w-full text-left px-4 py-2 rounded transition',
                             activeTab === 'info' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100']">
              Personal Info
            </button>
            <button @click="activeTab = 'orders'" 
                    :class="['w-full text-left px-4 py-2 rounded transition',
                             activeTab === 'orders' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100']">
              Order History
            </button>
            <button @click="activeTab = 'preferences'" 
                    :class="['w-full text-left px-4 py-2 rounded transition',
                             activeTab === 'preferences' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100']">
              Style Preferences
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div class="md:col-span-2 card">
          <!-- Personal Info Tab -->
          <div v-if="activeTab === 'info'">
            <h2 class="text-xl font-bold mb-4">Personal Information</h2>
            <div class="space-y-4">
              <div>
                <label class="input-label">First Name</label>
                <input type="text" v-model="user.firstName" class="input-field">
              </div>
              <div>
                <label class="input-label">Last Name</label>
                <input type="text" v-model="user.lastName" class="input-field">
              </div>
              <div>
                <label class="input-label">Email</label>
                <input type="email" v-model="user.email" class="input-field" disabled>
              </div>
              <button class="btn-primary">Save Changes</button>
            </div>
          </div>

          <!-- Orders Tab -->
          <div v-else-if="activeTab === 'orders'">
            <h2 class="text-xl font-bold mb-4">Order History</h2>
            <p class="text-gray-500">No orders yet. Start shopping!</p>
          </div>

          <!-- Preferences Tab -->
          <div v-else-if="activeTab === 'preferences'">
            <h2 class="text-xl font-bold mb-4">Style Preferences</h2>
            <p class="text-gray-500">Set your style preferences (Coming soon)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const activeTab = ref('info')
const user = ref({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || ''
})
</script>
