import prisma from '../utils/prisma.js'

// Get user's addresses
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' }
    })

    res.json({ addresses })
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({ error: 'Failed to get addresses' })
  }
}

// Get single address
export const getAddress = async (req, res) => {
  try {
    const { id } = req.params

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    res.json({ address })
  } catch (error) {
    console.error('Get address error:', error)
    res.status(500).json({ error: 'Failed to get address' })
  }
}

// Create address
export const createAddress = async (req, res) => {
  try {
    const { fullName, phone, address, city, province, country, zipCode, isDefault } = req.body

    // Validate required fields
    if (!fullName || !phone || !address || !city || !province) {
      return res.status(400).json({ 
        error: 'Please provide fullName, phone, address, city, and province' 
      })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: req.user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }

    // Create address
    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        fullName,
        phone,
        address,
        city,
        province,
        country: country || 'Cambodia',
        zipCode,
        isDefault: isDefault || false
      }
    })

    console.log('✅ Address created for user:', req.user.email)

    res.status(201).json({
      message: 'Address created successfully',
      address: newAddress
    })
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({ error: 'Failed to create address' })
  }
}

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, phone, address, city, province, country, zipCode, isDefault } = req.body

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingAddress) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: req.user.id,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        province: province || undefined,
        country: country || undefined,
        zipCode: zipCode || undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined
      }
    })

    console.log('✅ Address updated')

    res.json({
      message: 'Address updated successfully',
      address: updatedAddress
    })
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ error: 'Failed to update address' })
  }
}

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // Check if address is used in any orders
    const ordersCount = await prisma.order.count({
      where: { addressId: id }
    })

    if (ordersCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete address used in ${ordersCount} orders` 
      })
    }

    // Delete address
    await prisma.address.delete({
      where: { id }
    })

    console.log('✅ Address deleted')

    res.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ error: 'Failed to delete address' })
  }
}

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // Unset all defaults
    await prisma.address.updateMany({
      where: { 
        userId: req.user.id,
        isDefault: true 
      },
      data: { isDefault: false }
    })

    // Set this as default
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    })

    res.json({
      message: 'Default address updated',
      address: updatedAddress
    })
  } catch (error) {
    console.error('Set default address error:', error)
    res.status(500).json({ error: 'Failed to set default address' })
  }
}
