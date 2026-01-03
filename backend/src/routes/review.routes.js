import express from 'express'
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews
} from '../controllers/review.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

// Public routes
router.get('/product/:productId', getProductReviews)

// Protected routes (require authentication)
router.post('/', authenticate, upload.array('images', 5), createReview)
router.put('/:reviewId', authenticate, updateReview)
router.delete('/:reviewId', authenticate, deleteReview)
router.post('/:reviewId/helpful', markHelpful)
router.get('/my-reviews', authenticate, getUserReviews)

export default router