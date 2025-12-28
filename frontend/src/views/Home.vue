<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-4">Welcome to Apsara Closet</h1>
        <p class="text-xl mb-8">Your Divine Wardrobe, Powered by AI</p>
        <div class="flex gap-4 justify-center">
          <router-link to="/products" class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Browse Products
          </router-link>
          <router-link to="/visual-search" class="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition border-2 border-white">
            Try Visual Search
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Why Choose Apsara Closet?</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card text-center">
            <div class="text-4xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold mb-2">AI Visual Search</h3>
            <p class="text-gray-600">Upload any fashion photo and find similar products instantly</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">✨</div>
            <h3 class="text-xl font-semibold mb-2">Personalized Style</h3>
            <p class="text-gray-600">Get recommendations tailored to your unique taste</p>
          </div>
          <div class="card text-center">
            <div class="text-4xl mb-4">🛍️</div>
            <h3 class="text-xl font-semibold mb-2">Easy Shopping</h3>
            <p class="text-gray-600">Seamless browsing, secure checkout, fast delivery</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Home page logic will go here
</script>
