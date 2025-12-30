import prisma from '../utils/prisma.js'

// Get all products (with filters)
export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      isActive, // Don't default to true
      page = 1, 
      limit = 12 
    } = req.query

    // Build filter conditions
    const where = {}
    
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    
    if (category) {
      where.categoryId = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    console.log('Products query where:', JSON.stringify(where, null, 2))

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    console.log(`Found ${products.length} products (total: ${total})`)

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to get products' })
  }
}

// Get single product by ID or slug
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params

    // Try to find by ID first, then by slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } }
    })

    res.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Failed to get product' })
  }
}

// Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      images,
      categoryId,
      stock,
      colors,
      sizes,
    } = req.body

    // Validate required fields
    if (!name || !slug || !description || !price || !categoryId) {
      return res.status(400).json({ 
        error: 'Please provide name, slug, description, price, and categoryId' 
      })
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return res.status(400).json({ 
        error: 'Product with this slug already exists' 
      })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return res.status(400).json({ error: 'Category not found' })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        categoryId,
        stock: stock ? parseInt(stock) : 0,
        colors: colors || [],
        sizes: sizes || [],
      },
      include: {
        category: true
      }
    })

    console.log('✅ Product created:', product.name)

    res.status(201).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
}

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // If updating categoryId, check if category exists
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId }
      })

      if (!category) {
        return res.status(400).json({ error: 'Category not found' })
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        comparePrice: updateData.comparePrice ? parseFloat(updateData.comparePrice) : undefined,
        stock: updateData.stock ? parseInt(updateData.stock) : undefined,
      },
      include: {
        category: true
      }
    })

    console.log('✅ Product updated:', product.name)

    res.json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
}

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    console.log('✅ Product deleted:', existingProduct.name)

    res.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
}

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        // You can add isFeatured field later
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    })

    res.json({ products })
  } catch (error) {
    console.error('Get featured products error:', error)
    res.status(500).json({ error: 'Failed to get featured products' })
  }
}
