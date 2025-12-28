import express from 'express'
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
} from '../controllers/product.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes (no login required)
router.get('/', getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProduct)

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
