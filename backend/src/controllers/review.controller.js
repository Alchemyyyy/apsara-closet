import prisma from '../utils/prisma.js'
import path from 'path'
import fs from 'fs'

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const { page = 1, limit = 10, sort = 'recent' } = req.query

    const skip = (page - 1) * limit
    const take = parseInt(limit)

    // Sorting options
    let orderBy = {}
    switch (sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'highest':
        orderBy = { rating: 'desc' }
        break
      case 'lowest':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpful: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get reviews with user info
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy,
      skip,
      take
    })

    // Get total count
    const total = await prisma.review.count({
      where: { productId }
    })

    // Get product's average rating and rating distribution
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        averageRating: true,
        totalReviews: true
      }
    })

    // Calculate rating distribution
    const ratingDistribution = {}
    for (let i = 1; i <= 5; i++) {
      const count = await prisma.review.count({
        where: { productId, rating: i }
      })
      ratingDistribution[i] = count
    }

    res.json({
      reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
      hasMore: skip + reviews.length < total,
      averageRating: product?.averageRating || 0,
      totalReviews: product?.totalReviews || 0,
      ratingDistribution
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ error: 'Failed to get reviews' })
  }
}

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body
    const userId = req.user.id

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Validate comment
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' })
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
        userId,
        productId
      }
    })

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' })
    }

    // Check if user purchased this product (optional - for verified purchase badge)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'DELIVERED'
        }
      }
    })

    // Handle uploaded images
    let imageUrls = []
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path.replace(/\\/g, '/'))
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating),
        title: title || null,
        comment: comment.trim(),
        images: imageUrls,
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

    // Update product's average rating and total reviews
    await updateProductRating(productId)

    res.status(201).json({
      message: 'Review created successfully',
      review
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ error: 'Failed to create review' })
  }
}

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, title, comment } = req.body
    const userId = req.user.id

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' })
    }

    // Validate
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    if (comment && comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' })
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(title !== undefined && { title }),
        ...(comment && { comment: comment.trim() })
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

    // Update product rating if rating changed
    if (rating && rating !== review.rating) {
      await updateProductRating(review.productId)
    }

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ error: 'Failed to update review' })
  }
}

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const userId = req.user.id

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (review.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own reviews' })
    }

    // Delete review images from filesystem
    if (review.images && review.images.length > 0) {
      review.images.forEach(imagePath => {
        const fullPath = path.join(process.cwd(), imagePath)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
      })
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Update product rating
    await updateProductRating(review.productId)

    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    // Increment helpful count
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: review.helpful + 1
      }
    })

    res.json({
      message: 'Marked as helpful',
      helpful: updatedReview.helpful
    })
  } catch (error) {
    console.error('Mark helpful error:', error)
    res.status(500).json({ error: 'Failed to mark as helpful' })
  }
}

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id

    const reviews = await prisma.review.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      reviews,
      total: reviews.length
    })
  } catch (error) {
    console.error('Get user reviews error:', error)
    res.status(500).json({ error: 'Failed to get reviews' })
  }
}

// Helper function to update product rating
async function updateProductRating(productId) {
  // Calculate average rating
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: {
      rating: true
    },
    _count: true
  })

  // Update product
  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count
    }
  })
}