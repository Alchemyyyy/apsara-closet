import prisma from '../utils/prisma.js'

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `AC${timestamp}${random}`
}

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
}

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to get order' })
  }
}

// Create order from cart
export const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod = 'COD', notes } = req.body

    if (!addressId) {
      return res.status(400).json({ error: 'Shipping address is required' })
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id
      }
    })

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`
        })
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)

    const shipping = subtotal > 100 ? 0 : 5 // Free shipping over $100
    const tax = 0
    const total = subtotal + shipping + tax

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        addressId,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod,
        notes: notes || null,
        items: {
          create: cartItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            image: item.product.images[0] || '',
            price: item.product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          }))
        }
      },
      include: {
        items: true,
        shippingAddress: true
      }
    })

    // Update product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: { decrement: item.quantity }
        }
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    })

    console.log('✅ Order created:', order.orderNumber)

    res.status(201).json({
      message: 'Order created successfully',
      order
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: { items: true }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Can only cancel pending orders
    if (order.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Can only cancel pending orders' 
      })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity }
        }
      })
    }

    console.log('✅ Order cancelled:', order.orderNumber)

    res.json({
      message: 'Order cancelled',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
}

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const where = status ? { status } : {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          items: true,
          shippingAddress: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
}

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        shippingAddress: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    console.log('✅ Order status updated:', order.orderNumber, '→', status)

    res.json({
      message: 'Order status updated',
      order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    res.status(500).json({ error: 'Failed to update order' })
  }
}
