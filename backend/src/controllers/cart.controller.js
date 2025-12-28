import prisma from '../utils/prisma.js'

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)

    res.json({ 
      cartItems,
      summary: {
        itemCount: cartItems.length,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: total,
        total: total
      }
    })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: 'Failed to get cart' })
  }
}

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (!product.isActive) {
      return res.status(400).json({ error: 'Product is not available' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Only ${product.stock} items available in stock` 
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        size: size || null,
        color: color || null,
      }
    })

    let cartItem

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity

      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          error: `Only ${product.stock} items available in stock` 
        })
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
          size: size || null,
          color: color || null,
        },
        include: { product: true }
      })
    }

    console.log('✅ Item added to cart:', product.name)

    res.json({
      message: 'Item added to cart',
      cartItem
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
}

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' })
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: { product: true }
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        error: `Only ${cartItem.product.stock} items available` 
      })
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true }
    })

    res.json({
      message: 'Cart updated',
      cartItem: updatedItem
    })
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({ error: 'Failed to update cart' })
  }
}

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params

    // Check if item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id }
    })

    console.log('✅ Item removed from cart')

    res.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
}

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    })

    console.log('✅ Cart cleared')

    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
}
