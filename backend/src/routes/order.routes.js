import express from 'express'
import {
  getUserOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// User routes (requires authentication)
router.get('/my-orders', authenticate, getUserOrders)
router.get('/:id', authenticate, getOrder)
router.post('/', authenticate, createOrder)
router.put('/:id/cancel', authenticate, cancelOrder)

// Admin routes
router.get('/', authenticate, requireAdmin, getAllOrders)
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus)

export default router
