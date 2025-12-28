import prisma from '../utils/prisma.js'

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    res.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to get categories' })
  }
}

// Get single category
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        products: {
          where: { isActive: true },
          take: 12,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ category })
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ error: 'Failed to get category' })
  }
}

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body

    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'Please provide name and slug' 
      })
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Category with this slug already exists' 
      })
    }

    const category = await prisma.category.create({
      data: { name, slug, description }
    })

    console.log('✅ Category created:', category.name)

    res.status(201).json({
      message: 'Category created successfully',
      category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
      }
    })

    console.log('✅ Category updated:', category.name)

    res.json({
      message: 'Category updated successfully',
      category
    })
  } catch (error) {
    console.error('Update category error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.status(500).json({ error: 'Failed to update category' })
  }
}

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    })

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${productsCount} products. Delete or reassign products first.` 
      })
    }

    await prisma.category.delete({
      where: { id }
    })

    console.log('✅ Category deleted')

    res.json({
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.status(500).json({ error: 'Failed to delete category' })
  }
}
