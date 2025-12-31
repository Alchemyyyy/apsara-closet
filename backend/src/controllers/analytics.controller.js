import prisma from '../utils/prisma.js'

// Get dashboard overview stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeProducts,
      pendingOrders,
      deliveredOrders,
      cancelledOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          paymentStatus: 'PAID'
        }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } })
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Get top products
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        views: true,
        images: true,
        totalReviews: true,
        averageRating: true
      }
    })

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 5 },
        isActive: true
      },
      take: 10,
      orderBy: { stock: 'asc' },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        images: true
      }
    })

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingOrders,
        deliveredOrders,
        cancelledOrders
      },
      recentOrders,
      topProducts,
      lowStockProducts
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to get dashboard stats' })
  }
}

// Get sales statistics
export const getSalesStats = async (req, res) => {
  try {
    const { period = '7days' } = req.query

    let startDate = new Date()
    
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get orders in period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID'
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true
      }
    })

    // Group by date
    const salesByDate = {}
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          revenue: 0,
          orders: 0
        }
      }
      salesByDate[date].revenue += order.total
      salesByDate[date].orders += 1
    })

    const salesData = Object.values(salesByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    res.json({
      period,
      startDate,
      endDate: new Date(),
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      salesByDate: salesData
    })
  } catch (error) {
    console.error('Get sales stats error:', error)
    res.status(500).json({ error: 'Failed to get sales stats' })
  }
}

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    // Best selling products
    const bestSelling = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })

    const bestSellingWithDetails = await Promise.all(
      bestSelling.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true
          }
        })
        return {
          product,
          totalSold: item._sum.quantity
        }
      })
    )

    // Products by category
    const productsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { isActive: true }
    })

    const categoriesWithCount = await Promise.all(
      productsByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { id: true, name: true }
        })
        return {
          category,
          productCount: item._count.id
        }
      })
    )

    // Average ratings
    const productsWithRatings = await prisma.product.findMany({
      where: {
        totalReviews: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        averageRating: true,
        totalReviews: true,
        images: true
      },
      orderBy: { averageRating: 'desc' },
      take: 10
    })

    res.json({
      bestSelling: bestSellingWithDetails,
      productsByCategory: categoriesWithCount,
      topRated: productsWithRatings
    })
  } catch (error) {
    console.error('Get product stats error:', error)
    res.status(500).json({ error: 'Failed to get product stats' })
  }
}

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await prisma.user.count({
      where: { isAdmin: false }
    })

    // Customers with orders
    const customersWithOrders = await prisma.user.count({
      where: {
        isAdmin: false,
        orders: { some: {} }
      }
    })

    // Top customers by spending
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      _sum: { total: true },
      _count: { id: true },
      where: { paymentStatus: 'PAID' },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    })

    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        })
        return {
          user,
          totalSpent: item._sum.total,
          orderCount: item._count.id
        }
      })
    )

    // New customers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    res.json({
      totalCustomers,
      customersWithOrders,
      newCustomers,
      topCustomers: topCustomersWithDetails
    })
  } catch (error) {
    console.error('Get customer stats error:', error)
    res.status(500).json({ error: 'Failed to get customer stats' })
  }
}

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const statusCounts = {}
    ordersByStatus.forEach(item => {
      statusCounts[item.status] = item._count.id
    })

    // Orders by payment status
    const ordersByPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: { id: true }
    })

    const paymentCounts = {}
    ordersByPaymentStatus.forEach(item => {
      paymentCounts[item.paymentStatus] = item._count.id
    })

    // Average order processing time
    const deliveredOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    const totalProcessingTime = deliveredOrders.reduce((sum, order) => {
      const diff = order.updatedAt.getTime() - order.createdAt.getTime()
      return sum + diff
    }, 0)

    const avgProcessingTime = deliveredOrders.length > 0
      ? totalProcessingTime / deliveredOrders.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    res.json({
      ordersByStatus: statusCounts,
      ordersByPaymentStatus: paymentCounts,
      averageProcessingDays: Math.round(avgProcessingTime * 10) / 10
    })
  } catch (error) {
    console.error('Get order stats error:', error)
    res.status(500).json({ error: 'Failed to get order stats' })
  }
}

// Get revenue trends
export const getRevenueTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - parseInt(months))

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID'
      },
      select: {
        total: true,
        createdAt: true
      }
    })

    // Group by month
    const revenueByMonth = {}
    orders.forEach(order => {
      const monthYear = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (!revenueByMonth[monthYear]) {
        revenueByMonth[monthYear] = {
          month: monthYear,
          revenue: 0,
          orders: 0
        }
      }
      revenueByMonth[monthYear].revenue += order.total
      revenueByMonth[monthYear].orders += 1
    })

    const trends = Object.values(revenueByMonth).sort((a, b) => 
      a.month.localeCompare(b.month)
    )

    res.json({
      months: parseInt(months),
      trends
    })
  } catch (error) {
    console.error('Get revenue trends error:', error)
    res.status(500).json({ error: 'Failed to get revenue trends' })
  }
}
