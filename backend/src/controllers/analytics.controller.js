import prisma from '../utils/prisma.js'

// Get dashboard overview stats
export const getOverview = async (req, res) => {
  try {
    // Calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Total revenue (all time)
    const allOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID'
      }
    })
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)

    // This month's revenue
    const thisMonthOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startOfMonth
        }
      }
    })
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0)

    // Last month's revenue
    const lastMonthOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0)

    // Revenue change percentage
    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : 0

    // Total orders
    const totalOrders = await prisma.order.count()

    // Pending orders
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    })

    // Total customers
    const totalCustomers = await prisma.user.count({
      where: { isAdmin: false }
    })

    // New customers this month
    const newCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Total products
    const totalProducts = await prisma.product.count()

    // Low stock products (less than 10 items)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10,
          gt: 0
        }
      }
    })

    res.json({
      totalRevenue,
      revenueChange: parseFloat(revenueChange),
      totalOrders,
      pendingOrders,
      totalCustomers,
      newCustomers,
      totalProducts,
      lowStockProducts
    })
  } catch (error) {
    console.error('Get overview error:', error)
    res.status(500).json({ error: 'Failed to get overview' })
  }
}

// Get sales data for chart
export const getSalesData = async (req, res) => {
  try {
    const { period = '7days' } = req.query

    let daysAgo
    switch (period) {
      case '7days':
        daysAgo = 7
        break
      case '30days':
        daysAgo = 30
        break
      case '90days':
        daysAgo = 90
        break
      default:
        daysAgo = 7
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get orders within the period
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by date
    const salesByDate = {}
    const labels = []

    // Initialize all dates in range
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      salesByDate[dateKey] = 0
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }

    // Sum sales by date
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      if (salesByDate.hasOwnProperty(dateKey)) {
        salesByDate[dateKey] += order.total
      }
    })

    const values = Object.values(salesByDate)

    res.json({
      labels,
      values
    })
  } catch (error) {
    console.error('Get sales data error:', error)
    res.status(500).json({ error: 'Failed to get sales data' })
  }
}

// Get top selling products
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Get products with their order items
    const products = await prisma.product.findMany({
      include: {
        orderItems: {
          include: {
            order: {
              where: {
                paymentStatus: 'PAID'
              }
            }
          }
        }
      }
    })

    // Calculate total sold and revenue for each product
    const productsWithStats = products.map(product => {
      const soldCount = product.orderItems.reduce((sum, item) => {
        if (item.order) {
          return sum + item.quantity
        }
        return sum
      }, 0)

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        soldCount
      }
    })

    // Sort by sold count and take top N
    const topProducts = productsWithStats
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, parseInt(limit))

    res.json({
      products: topProducts
    })
  } catch (error) {
    console.error('Get top products error:', error)
    res.status(500).json({ error: 'Failed to get top products' })
  }
}

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const orders = await prisma.order.findMany({
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.json({
      orders
    })
  } catch (error) {
    console.error('Get recent orders error:', error)
    res.status(500).json({ error: 'Failed to get recent orders' })
  }
}

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { isAdmin: false }
    })

    // Users registered this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Active users (users with at least one order)
    const activeUsers = await prisma.user.count({
      where: {
        isAdmin: false,
        orders: {
          some: {}
        }
      }
    })

    res.json({
      totalUsers,
      newUsersThisMonth,
      activeUsers
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ error: 'Failed to get user stats' })
  }
}

// Get revenue by category
export const getRevenueByCategory = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: {
                  where: {
                    paymentStatus: 'PAID'
                  }
                }
              }
            }
          }
        }
      }
    })

    const revenueByCategory = categories.map(category => {
      const revenue = category.products.reduce((catSum, product) => {
        const productRevenue = product.orderItems.reduce((prodSum, item) => {
          if (item.order) {
            return prodSum + (item.price * item.quantity)
          }
          return prodSum
        }, 0)
        return catSum + productRevenue
      }, 0)

      return {
        category: category.name,
        revenue
      }
    })

    res.json({
      data: revenueByCategory
    })
  } catch (error) {
    console.error('Get revenue by category error:', error)
    res.status(500).json({ error: 'Failed to get revenue by category' })
  }
}