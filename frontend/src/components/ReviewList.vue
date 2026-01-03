<template>
  <div class="space-y-6">
    <!-- Reviews Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-2xl font-semibold">
        Customer Reviews ({{ totalReviews }})
      </h3>
      <button
        v-if="canWriteReview"
        @click="showReviewForm = !showReviewForm"
        class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        {{ showReviewForm ? 'Cancel' : 'Write a Review' }}
      </button>
    </div>

    <!-- Review Form -->
    <ReviewForm
      v-if="showReviewForm"
      :product-id="productId"
      :on-cancel="() => showReviewForm = false"
      :on-success="handleReviewSuccess"
    />

    <!-- Rating Summary -->
    <div v-if="averageRating > 0" class="bg-gray-50 rounded-lg p-6">
      <div class="flex items-center gap-8">
        <div class="text-center">
          <div class="text-5xl font-bold text-gray-900">{{ averageRating.toFixed(1) }}</div>
          <StarRating :model-value="averageRating" :readonly="true" :show-value="false" />
          <div class="text-sm text-gray-600 mt-2">Based on {{ totalReviews }} reviews</div>
        </div>
        
        <!-- Rating Bars -->
        <div class="flex-1 space-y-2">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
            <span class="text-sm text-gray-600 w-12">{{ star }} star</span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-yellow-400 transition-all"
                :style="{ width: `${getRatingPercentage(star)}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">
              {{ getRatingCount(star) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <p class="mt-2 text-gray-600">Loading reviews...</p>
    </div>

    <div v-else-if="reviews.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <p class="mt-4 text-gray-600">No reviews yet. Be the first to review!</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-600 font-semibold">
                {{ review.user.firstName[0] }}{{ review.user.lastName[0] }}
              </span>
            </div>
            <div>
              <div class="font-semibold text-gray-900">
                {{ review.user.firstName }} {{ review.user.lastName }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{ formatDate(review.createdAt) }}</span>
                <span v-if="review.verifiedPurchase" class="flex items-center gap-1 text-green-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
          <StarRating :model-value="review.rating" :readonly="true" :show-value="false" :size="5" />
        </div>

        <!-- Review Title -->
        <h4 v-if="review.title" class="font-semibold text-gray-900 mb-2">
          {{ review.title }}
        </h4>

        <!-- Review Comment -->
        <p class="text-gray-700 mb-4">{{ review.comment }}</p>

        <!-- Review Images -->
        <div v-if="review.images && review.images.length > 0" class="flex gap-2 mb-4">
          <img
            v-for="(image, index) in review.images"
            :key="index"
            :src="`${apiBaseUrl}/${image}`"
            alt="Review image"
            class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            @click="openImageModal(review.images, index)"
          />
        </div>

        <!-- Helpful Button -->
        <div class="flex items-center gap-4 text-sm">
          <button
            @click="markAsHelpful(review.id)"
            class="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Helpful ({{ review.helpful }})
          </button>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center">
      <button
        @click="loadMore"
        class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Load More Reviews
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import StarRating from './StarRating.vue'
import ReviewForm from './ReviewForm.vue'
import reviewService from '../services/reviewService'

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  canWriteReview: {
    type: Boolean,
    default: true
  }
})

const reviews = ref([])
const loading = ref(false)
const showReviewForm = ref(false)
const page = ref(1)
const hasMore = ref(true)
const totalReviews = ref(0)
const averageRating = ref(0)
const ratingDistribution = ref({})

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const loadReviews = async () => {
  loading.value = true
  try {
    const response = await reviewService.getProductReviews(props.productId, {
      page: page.value,
      limit: 10
    })
    
    reviews.value = response.reviews
    totalReviews.value = response.total
    averageRating.value = response.averageRating
    ratingDistribution.value = response.ratingDistribution || {}
    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  page.value++
  loading.value = true
  try {
    const response = await reviewService.getProductReviews(props.productId, {
      page: page.value,
      limit: 10
    })
    
    reviews.value.push(...response.reviews)
    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load more reviews:', error)
  } finally {
    loading.value = false
  }
}

const handleReviewSuccess = () => {
  showReviewForm.value = false
  page.value = 1
  loadReviews()
}

const markAsHelpful = async (reviewId) => {
  try {
    await reviewService.markHelpful(reviewId)
    const review = reviews.value.find(r => r.id === reviewId)
    if (review) {
      review.helpful++
    }
  } catch (error) {
    console.error('Failed to mark as helpful:', error)
  }
}

const getRatingPercentage = (star) => {
  if (!totalReviews.value) return 0
  const count = ratingDistribution.value[star] || 0
  return (count / totalReviews.value) * 100
}

const getRatingCount = (star) => {
  return ratingDistribution.value[star] || 0
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const openImageModal = (images, index) => {
  // Implement image modal/lightbox
  console.log('Open image modal', images, index)
}

onMounted(() => {
  loadReviews()
})
</script>