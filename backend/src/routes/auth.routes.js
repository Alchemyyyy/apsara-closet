import express from 'express'
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes (no login required)
router.post('/register', register)
router.post('/login', login)

// Protected routes (login required)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

export default router
