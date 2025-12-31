import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
  moveToCart
} from '../controllers/wishlist.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/', getWishlist)
router.post('/add', addToWishlist)
router.delete('/:productId', removeFromWishlist)
router.get('/check/:productId', checkWishlist)
router.delete('/', clearWishlist)
router.post('/:productId/move-to-cart', moveToCart)

export default router
