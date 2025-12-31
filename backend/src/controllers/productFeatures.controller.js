import prisma from '../utils/prisma.js'

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
    
    // Mock features for now (1280 dimensions for MobileNetV2)
    const mockFeatures = Array(1280).fill(0).map(() => Math.random())
    
    // Delete old features if exist
    await prisma.productFeatures.deleteMany({
      where: { productId: product.id }
    })
    
    // Store new features
    await prisma.productFeatures.create({
      data: {
        productId: product.id,
        imageUrl: product.images[0],
        features: mockFeatures,
      }
    })
    
    console.log(`✅ Features stored for: ${product.name}`)
    
    res.json({
      message: 'Features extracted and stored',
      productId: product.id,
      productName: product.name,
      featureVectorSize: mockFeatures.length
    })
    
  } catch (error) {
    console.error('Extract features error:', error)
    res.status(500).json({ error: 'Failed to extract features' })
  }
}

// Extract features for all products
export const extractAllProductFeatures = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }
    })
    
    console.log(`📦 Processing ${products.length} products...`)
    
    let processed = 0
    let failed = 0
    
    for (const product of products) {
      try {
        if (!product.images || product.images.length === 0) {
          console.log(`⚠️  Skipping ${product.name} - no images`)
          failed++
          continue
        }
        
        // Mock features
        const mockFeatures = Array(1280).fill(0).map(() => Math.random())
        
        // Delete old features
        await prisma.productFeatures.deleteMany({
          where: { productId: product.id }
        })
        
        // Store new features
        await prisma.productFeatures.create({
          data: {
            productId: product.id,
            imageUrl: product.images[0],
            features: mockFeatures,
          }
        })
        
        processed++
        console.log(`✅ ${processed}/${products.length}: ${product.name}`)
        
      } catch (error) {
        console.error(`❌ Failed for ${product.name}:`, error.message)
        failed++
      }
    }
    
    res.json({
      message: 'Batch feature extraction completed',
      total: products.length,
      processed,
      failed
    })
    
  } catch (error) {
    console.error('Batch extract features error:', error)
    res.status(500).json({ error: 'Batch extraction failed' })
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
            images: true
          }
        }
      }
    })
    
    if (!features) {
      return res.status(404).json({ error: 'Features not found' })
    }
    
    res.json(features)
    
  } catch (error) {
    console.error('Get features error:', error)
    res.status(500).json({ error: 'Failed to get features' })
  }
}
