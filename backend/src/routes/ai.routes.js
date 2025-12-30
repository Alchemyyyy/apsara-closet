import express from 'express'
import { visualSearch, extractFeatures } from '../controllers/ai.controller.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

// Visual search endpoint
router.post('/visual-search', upload.single('image'), visualSearch)

// Feature extraction (for testing)
router.post('/extract-features', upload.single('image'), extractFeatures)

export default router
