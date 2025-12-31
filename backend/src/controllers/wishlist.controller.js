import prisma from '../utils/prisma.js'

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            isActive: true,
            averageRating: true,
            totalReviews: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      wishlistItems,
      count: wishlistItems.length
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({ error: 'Failed to get wishlist' })
  }
}

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      return res.status(400).json({ 
        error: 'Product already in wishlist',
        wishlistItem: existingItem
      })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true
          }
        }
      }
    })

    console.log('✅ Added to wishlist:', product.name)

    res.status(201).json({
      message: 'Added to wishlist',
      wishlistItem
    })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({ error: 'Failed to add to wishlist' })
  }
}

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    // Check if item exists
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    })

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Item not in wishlist' })
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    })

    console.log('✅ Removed from wishlist')

    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({ error: 'Failed to remove from wishlist' })
  }
}

// Check if product is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    })

    res.json({
      inWishlist: !!wishlistItem,
      wishlistItem
    })
  } catch (error) {
    console.error('Check wishlist error:', error)
    res.status(500).json({ error: 'Failed to check wishlist' })
  }
}

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id }
    })

    console.log('✅ Wishlist cleared')

    res.json({ message: 'Wishlist cleared' })
  } catch (error) {
    console.error('Clear wishlist error:', error)
    res.status(500).json({ error: 'Failed to clear wishlist' })
  }
}

// Move wishlist item to cart
export const moveToCart = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity = 1, size, color } = req.body

    // Check if item is in wishlist
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      },
      include: {
        product: true
      }
    })

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Item not in wishlist' })
    }

    const product = wishlistItem.product

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Only ${product.stock} items available in stock` 
      })
    }

    // Add to cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        size: size || null,
        color: color || null,
      }
    })

    if (existingCartItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      })
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
          size: size || null,
          color: color || null,
        }
      })
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    })

    console.log('✅ Moved to cart:', product.name)

    res.json({
      message: 'Moved to cart successfully'
    })
  } catch (error) {
    console.error('Move to cart error:', error)
    res.status(500).json({ error: 'Failed to move to cart' })
  }
}
