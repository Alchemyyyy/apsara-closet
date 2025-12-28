<template>
  <footer class="bg-gray-900 text-white py-8 mt-16">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">Apsara Closet</h3>
          <p class="text-gray-400">Your Divine Wardrobe, Powered by AI</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Shop</h4>
          <ul class="space-y-2 text-gray-400">
            <li><router-link to="/products" class="hover:text-white">All Products</router-link></li>
            <li><router-link to="/visual-search" class="hover:text-white">Visual Search</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Account</h4>
          <ul class="space-y-2 text-gray-400">
            <li><router-link to="/profile" class="hover:text-white">My Profile</router-link></li>
            <li><router-link to="/cart" class="hover:text-white">Shopping Cart</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">About</h4>
          <p class="text-gray-400 text-sm">Bachelor's Thesis Project<br>AI-Powered Fashion E-commerce</p>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 Apsara Closet. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
