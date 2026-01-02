import prisma from '../utils/prisma.js'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Extract and store features for a product
export const extractProductFeatures = async (req, res) => {
  try {
    const { productId } = req.params
    
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    if (!product.images || product.images.length === 0) {
      return res.status(400).json({ error: 'Product has no images' })
    }
    
    console.log(`🔍 Extracting features for: ${product.name}`)
    
    // Get the first image path
    const imagePath = product.images[0]
    
    // Check if it's an external URL or local path
    let imageBuffer
    let imageName
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // External URL - download it
      console.log(`🌐 Downloading image from URL: ${imagePath}`)
      
      try {
        const response = await axios.get(imagePath, {
          responseType: 'arraybuffer',
          timeout: 10000
        })
        imageBuffer = Buffer.from(response.data)
        imageName = path.basename(imagePath)
        console.log(`✅ Downloaded ${imageBuffer.length} bytes`)
      } catch (downloadError) {
        console.error('❌ Failed to download image:', downloadError.message)
        return res.status(400).json({ 
          error: 'Failed to download product image',
          url: imagePath,
          details: downloadError.message
        })
      }
    } else {
      // Local file path
      const fullImagePath = path.join(process.cwd(), 'uploads', imagePath)
      
      if (!fs.existsSync(fullImagePath)) {
        return res.status(400).json({ 
          error: 'Image file not found',
          path: imagePath 
        })
      }
      
      imageBuffer = fs.readFileSync(fullImagePath)
      imageName = path.basename(imagePath)
    }
    
    // Call AI service to extract features
    const formData = new FormData()
    formData.append('file', imageBuffer, { 
      filename: imageName,
      contentType: 'image/jpeg' // Force image content type
    })
    
    let features
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/extract-features`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000 // 30 second timeout
        }
      )
      
      features = response.data.features
      console.log(`✅ AI service extracted ${response.data.feature_vector_size} features`)
      
    } catch (aiError) {
      console.error('❌ AI service error:', aiError.message)
      return res.status(500).json({ 
        error: 'Failed to extract features from AI service',
        details: aiError.message 
      })
    }
    
    // Delete old features if exist
    await prisma.productFeatures.deleteMany({
      where: { productId: product.id }
    })
    
    // Store new features in database
    const savedFeatures = await prisma.productFeatures.create({
      data: {
        productId: product.id,
        imageUrl: imagePath,
        features: features, // Store the real AI-extracted features
      }
    })
    
    console.log(`✅ Features stored in database for: ${product.name}`)
    
    res.json({
      message: 'Features extracted and stored successfully',
      productId: product.id,
      productName: product.name,
      featureVectorSize: features.length,
      featuresId: savedFeatures.id
    })
    
  } catch (error) {
    console.error('Extract features error:', error)
    res.status(500).json({ 
      error: 'Failed to extract features',
      details: error.message 
    })
  }
}

// Extract features for all products (batch processing)
export const extractAllProductFeatures = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }
    })
    
    console.log(`📦 Processing ${products.length} products...`)
    
    let processed = 0
    let failed = 0
    const errors = []
    
    for (const product of products) {
      try {
        if (!product.images || product.images.length === 0) {
          console.log(`⚠️  Skipping ${product.name} - no images`)
          failed++
          errors.push({ product: product.name, reason: 'No images' })
          continue
        }
        
        // Get image path
        const imagePath = product.images[0]
        
        // Handle external URL or local path
        let imageBuffer
        let imageName
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          // Download external image
          try {
            const response = await axios.get(imagePath, {
              responseType: 'arraybuffer',
              timeout: 10000
            })
            imageBuffer = Buffer.from(response.data)
            imageName = path.basename(imagePath)
          } catch (downloadError) {
            console.log(`⚠️  Failed to download ${product.name}: ${downloadError.message}`)
            failed++
            errors.push({ 
              product: product.name, 
              reason: `Download failed: ${downloadError.message}` 
            })
            continue
          }
        } else {
          // Local file
          const fullImagePath = path.join(process.cwd(), 'uploads', imagePath)
          
          if (!fs.existsSync(fullImagePath)) {
            console.log(`⚠️  Skipping ${product.name} - image file not found`)
            failed++
            errors.push({ product: product.name, reason: 'Image file not found' })
            continue
          }
          
          imageBuffer = fs.readFileSync(fullImagePath)
          imageName = path.basename(imagePath)
        }
        
        // Call AI service
        const formData = new FormData()
        formData.append('file', imageBuffer, { 
          filename: imageName,
          contentType: 'image/jpeg'
        })
        
        const response = await axios.post(
          `${AI_SERVICE_URL}/extract-features`,
          formData,
          {
            headers: formData.getHeaders(),
            timeout: 30000
          }
        )
        
        const features = response.data.features
        
        if (!features || !Array.isArray(features) || features.length === 0) {
          console.error(`❌ Invalid features received for ${product.name}`)
          failed++
          errors.push({ 
            product: product.name, 
            reason: 'Invalid features from AI service' 
          })
          continue
        }
        
        console.log(`✅ AI extracted ${features.length} features for ${product.name}`)
        
        // Delete old features
        await prisma.productFeatures.deleteMany({
          where: { productId: product.id }
        })
        
        // Store new features
        await prisma.productFeatures.create({
          data: {
            productId: product.id,
            imageUrl: imagePath,
            features: features,
          }
        })
        
        processed++
        console.log(`✅ ${processed}/${products.length}: ${product.name}`)
        
        // Small delay to avoid overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Failed for ${product.name}:`, error.message)
        if (error.response) {
          console.error(`   AI Service Response:`, error.response.status, error.response.data)
        }
        failed++
        errors.push({ 
          product: product.name, 
          reason: error.response?.data?.detail || error.message 
        })
      }
    }
    
    res.json({
      message: 'Batch feature extraction completed',
      total: products.length,
      processed,
      failed,
      errors: failed > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Batch extract features error:', error)
    res.status(500).json({ 
      error: 'Batch extraction failed',
      details: error.message 
    })
  }
}

// Get product features
export const getProductFeatures = async (req, res) => {
  try {
    const { productId } = req.params
    
    const features = await prisma.productFeatures.findFirst({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true
          }
        }
      }
    })
    
    if (!features) {
      return res.status(404).json({ error: 'Features not found for this product' })
    }
    
    res.json(features)
    
  } catch (error) {
    console.error('Get features error:', error)
    res.status(500).json({ 
      error: 'Failed to get features',
      details: error.message 
    })
  }
}

// Get all products with their features (for AI service)
export const getAllProductsWithFeatures = async (req, res) => {
  try {
    const { category, limit = 100 } = req.query
    
    const where = {
      isActive: true,
      aiFeatures: {
        some: {} // Only get products that have features
      }
    }
    
    if (category) {
      where.categoryId = category
    }
    
    const products = await prisma.product.findMany({
      where,
      take: parseInt(limit),
      include: {
        aiFeatures: {
          select: {
            features: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
    
    res.json({
      products,
      total: products.length
    })
    
  } catch (error) {
    console.error('Get products with features error:', error)
    res.status(500).json({ 
      error: 'Failed to get products with features',
      details: error.message 
    })
  }
}