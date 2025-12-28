import express from 'express'
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getAllCategories)
router.get('/:id', getCategory)

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, createCategory)
router.put('/:id', authenticate, requireAdmin, updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
