import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Import routes
import authRoutes from './src/routes/auth.routes.js'
import productRoutes from './src/routes/product.routes.js'
import categoryRoutes from './src/routes/category.routes.js'
import cartRoutes from './src/routes/cart.routes.js'
import orderRoutes from './src/routes/order.routes.js'
import aiRoutes from './src/routes/ai.routes.js'
import productFeaturesRoutes from './src/routes/productFeatures.routes.js'
import addressRoutes from './src/routes/address.routes.js'
import reviewRoutes from './src/routes/review.routes.js'
import wishlistRoutes from './src/routes/wishlist.routes.js'
import analyticsRoutes from './src/routes/analytics.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Static files
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/product-features', productFeaturesRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Apsara Closet API is running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Apsara Closet API running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV}`)
  console.log(`🗄️  Database: Connected`)
  console.log(`🤖 AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`)
  console.log('')
  console.log('📋 Available Routes:')
  console.log('   Auth:             /api/auth/*')
  console.log('   Products:         /api/products/*')
  console.log('   Categories:       /api/categories/*')
  console.log('   Cart:             /api/cart/*')
  console.log('   Orders:           /api/orders/*')
  console.log('   AI:               /api/ai/*')
  console.log('   Product Features: /api/product-features/*')
  console.log('   Addresses:        /api/addresses/*')
  console.log('   Reviews:          /api/reviews/*')
  console.log('   Wishlist:         /api/wishlist/*')
  console.log('   Analytics:        /api/analytics/*')
})
