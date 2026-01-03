import express from 'express'
import {
  getOverview,
  getSalesData,
  getTopProducts,
  getRecentOrders,
  getUserStats,
  getRevenueByCategory
} from '../controllers/analytics.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// All analytics routes require admin authentication
router.use(authenticate)
router.use(requireAdmin)

// Dashboard overview
router.get('/overview', getOverview)

// Sales chart data
router.get('/sales', getSalesData)

// Top selling products
router.get('/top-products', getTopProducts)

// Recent orders
router.get('/recent-orders', getRecentOrders)

// User statistics
router.get('/users', getUserStats)

// Revenue by category
router.get('/revenue-by-category', getRevenueByCategory)

export default router