import express from 'express'
import { 
  extractProductFeatures,
  extractAllProductFeatures,
  getProductFeatures,
  getAllProductsWithFeatures
} from '../controllers/productFeatures.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// IMPORTANT: Specific routes BEFORE dynamic routes!
// Get all products with features (public - for AI service)
router.get('/all', getAllProductsWithFeatures)

// Extract features for single product (admin only)
router.post('/extract/:productId', authenticate, requireAdmin, extractProductFeatures)

// Extract features for all products (admin only)
router.post('/extract-all', authenticate, requireAdmin, extractAllProductFeatures)

// Get features for a product
router.get('/:productId', getProductFeatures)

export default router