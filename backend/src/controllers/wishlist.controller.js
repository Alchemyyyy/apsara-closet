import prisma from '../utils/prisma.js'

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      items: wishlist,
      total: wishlist.length
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    res.json({
      message: 'Added to wishlist',
      item: wishlistItem
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

    const deleted = await prisma.wishlistItem.deleteMany({
      where: {
        userId: req.user.id,
        productId: productId
      }
    })

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' })
    }

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

    const exists = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      }
    })

    res.json({ inWishlist: !!exists })
  } catch (error) {
    console.error('Check wishlist error:', error)
    res.status(500).json({ error: 'Failed to check wishlist' })
  }
}

// Move item from wishlist to cart
export const moveToCart = async (req, res) => {
  try {
    const { productId } = req.params

    // Check if in wishlist
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      },
      include: {
        product: true
      }
    })

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Item not found in wishlist' })
    }

    // Check if product is in stock
    if (wishlistItem.product.stock === 0) {
      return res.status(400).json({ error: 'Product is out of stock' })
    }

    // Add to cart (or update quantity if already in cart)
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId: productId
      }
    })

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      })
    } else {
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: productId,
          quantity: 1
        }
      })
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      }
    })

    res.json({ message: 'Moved to cart successfully' })
  } catch (error) {
    console.error('Move to cart error:', error)
    res.status(500).json({ error: 'Failed to move to cart' })
  }
}