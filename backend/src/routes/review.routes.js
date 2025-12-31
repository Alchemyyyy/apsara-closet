import express from 'express'
import {
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/product/:productId', getProductReviews)
router.get('/product/:productId/stats', getReviewStats)

// Protected routes (require authentication)
router.post('/', authenticate, createReview)
router.put('/:id', authenticate, updateReview)
router.delete('/:id', authenticate, deleteReview)

export default router
