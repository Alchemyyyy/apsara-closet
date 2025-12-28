import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided. Please login.' 
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
      }
    })

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found. Please login again.' 
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' })
    }
    
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Access denied. Admin only.' 
    })
  }
  next()
}
