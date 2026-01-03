<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-xl font-semibold mb-4">Write a Review</h3>
    
    <form @submit.prevent="submitReview" class="space-y-4">
      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <StarRating v-model="form.rating" :readonly="false" :show-value="true" />
        <p v-if="errors.rating" class="mt-1 text-sm text-red-600">
          {{ errors.rating }}
        </p>
      </div>

      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="Summarize your experience"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxlength="100"
        />
      </div>

      <!-- Comment -->
      <div>
        <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          v-model="form.comment"
          rows="4"
          placeholder="Share your thoughts about this product..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxlength="1000"
        ></textarea>
        <div class="mt-1 flex justify-between">
          <p v-if="errors.comment" class="text-sm text-red-600">
            {{ errors.comment }}
          </p>
          <span class="text-sm text-gray-500">
            {{ form.comment.length }}/1000
          </span>
        </div>
      </div>

      <!-- Images Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (Optional)
        </label>
        <div class="flex items-center gap-4">
          <label class="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
            <div class="text-center">
              <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="text-xs text-gray-500">Add</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              class="hidden"
            />
          </label>

          <!-- Image Previews -->
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="(preview, index) in imagePreviews"
              :key="index"
              class="relative w-24 h-24"
            >
              <img
                :src="preview"
                alt="Preview"
                class="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          You can upload up to 5 images (Max 5MB each)
        </p>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="submitting"
          class="flex-1 bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ submitting ? 'Submitting...' : 'Submit Review' }}
        </button>
        <button
          v-if="onCancel"
          type="button"
          @click="onCancel"
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import StarRating from './StarRating.vue'
import reviewService from '../services/reviewService'

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  onCancel: {
    type: Function,
    default: null
  },
  onSuccess: {
    type: Function,
    default: null
  }
})

const form = reactive({
  rating: 0,
  title: '',
  comment: '',
  images: []
})

const errors = reactive({
  rating: '',
  comment: ''
})

const imagePreviews = ref([])
const submitting = ref(false)

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
  // Limit to 5 images total
  const remainingSlots = 5 - form.images.length
  const filesToAdd = files.slice(0, remainingSlots)
  
  filesToAdd.forEach(file => {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Max size is 5MB.`)
      return
    }
    
    // Add file
    form.images.push(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
  
  // Clear input
  event.target.value = ''
}

const removeImage = (index) => {
  form.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const validateForm = () => {
  errors.rating = ''
  errors.comment = ''
  
  let isValid = true
  
  if (form.rating === 0) {
    errors.rating = 'Please select a rating'
    isValid = false
  }
  
  if (form.comment.trim().length < 10) {
    errors.comment = 'Review must be at least 10 characters'
    isValid = false
  }
  
  return isValid
}

const submitReview = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    await reviewService.createReview({
      productId: props.productId,
      rating: form.rating,
      title: form.title,
      comment: form.comment,
      images: form.images
    })
    
    // Reset form
    form.rating = 0
    form.title = ''
    form.comment = ''
    form.images = []
    imagePreviews.value = []
    
    if (props.onSuccess) {
      props.onSuccess()
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to submit review')
  } finally {
    submitting.value = false
  }
}
</script>