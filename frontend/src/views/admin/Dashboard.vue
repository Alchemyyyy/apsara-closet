<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <h3 class="text-gray-600 mb-2">Total Products</h3>
          <p class="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div class="card">
          <h3 class="text-gray-600 mb-2">Total Orders</h3>
          <p class="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div class="card">
          <h3 class="text-gray-600 mb-2">Total Revenue</h3>
          <p class="text-3xl font-bold text-primary-600">$0</p>
        </div>
        <div class="card">
          <h3 class="text-gray-600 mb-2">Total Users</h3>
          <p class="text-3xl font-bold text-primary-600">0</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
        <div class="flex gap-4">
          <button class="btn-primary">Add Product</button>
          <button class="btn-secondary">View Orders</button>
          <button class="btn-secondary">Manage Categories</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Admin dashboard logic
</script>
