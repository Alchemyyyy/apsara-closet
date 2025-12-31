import express from 'express'
import {
  getDashboardStats,
  getSalesStats,
  getProductStats,
  getCustomerStats,
  getOrderStats,
  getRevenueTrends
} from '../controllers/analytics.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// All routes require admin authentication
router.use(authenticate, requireAdmin)

router.get('/dashboard', getDashboardStats)
router.get('/sales', getSalesStats)
router.get('/products', getProductStats)
router.get('/customers', getCustomerStats)
router.get('/orders', getOrderStats)
router.get('/revenue-trends', getRevenueTrends)

export default router
