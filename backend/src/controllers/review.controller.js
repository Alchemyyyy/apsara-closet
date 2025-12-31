import prisma from '../utils/prisma.js'

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const { page = 1, limit = 10, rating } = req.query

    const where = {
      productId,
      ...(rating && { rating: parseInt(rating) })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ])

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ error: 'Failed to get reviews' })
  }
}

// Get review stats for a product
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params

    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true }
    })

    const total = stats.reduce((sum, stat) => sum + stat._count.rating, 0)
    
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }

    stats.forEach(stat => {
      distribution[stat.rating] = stat._count.rating
    })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        averageRating: true,
        totalReviews: true
      }
    })

    res.json({
      averageRating: product?.averageRating || 0,
      totalReviews: product?.totalReviews || 0,
      distribution
    })
  } catch (error) {
    console.error('Get review stats error:', error)
    res.status(500).json({ error: 'Failed to get review stats' })
  }
}

// Create review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body

    // Validate
    if (!productId || !rating || !comment) {
      return res.status(400).json({ 
        error: 'Please provide productId, rating, and comment' 
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    })

    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this product' 
      })
    }

    // Check if user purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
          status: 'DELIVERED'
        }
      }
    })

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating,
        title: title || null,
        comment,
        verifiedPurchase: !!hasPurchased
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Update product rating stats
    await updateProductRating(productId)

    console.log('✅ Review created:', review.id)

    res.status(201).json({
      message: 'Review created successfully',
      review
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ error: 'Failed to create review' })
  }
}

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, title, comment } = req.body

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Update review
    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: rating || undefined,
        title: title !== undefined ? title : undefined,
        comment: comment || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Update product rating stats
    await updateProductRating(existingReview.productId)

    console.log('✅ Review updated:', review.id)

    res.json({
      message: 'Review updated successfully',
      review
    })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ error: 'Failed to update review' })
  }
}

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    // Check if review exists and belongs to user
    const review = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    })

    // Update product rating stats
    await updateProductRating(review.productId)

    console.log('✅ Review deleted')

    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true }
  })

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  await prisma.product.update({
    where: { id: productId },
    data: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    }
  })
}
