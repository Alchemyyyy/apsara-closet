import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  moveToCart
} from '../controllers/wishlist.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// All wishlist routes require authentication
router.use(authenticate)

// Get wishlist
router.get('/', getWishlist)

// Add to wishlist
router.post('/', addToWishlist)

// Remove from wishlist
router.delete('/:productId', removeFromWishlist)

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist)

// Move to cart
router.post('/:productId/move-to-cart', moveToCart)

export default router