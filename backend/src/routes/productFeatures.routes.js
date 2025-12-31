import express from 'express'
import {
  extractProductFeatures,
  extractAllProductFeatures,
  getProductFeatures
} from '../controllers/productFeatures.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Admin only - extract features
router.post('/extract/:productId', authenticate, requireAdmin, extractProductFeatures)
router.post('/extract-all', authenticate, requireAdmin, extractAllProductFeatures)

// Get features
router.get('/:productId', getProductFeatures)

export default router
