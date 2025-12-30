import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@apsaracloset.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
    }
  })
  
  console.log('✅ Created admin user:', admin.email)

  // Create categories
  const dresses = await prisma.category.create({
    data: {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Beautiful dresses for every occasion'
    }
  })
  
  console.log('✅ Created category:', dresses.name)

  const tops = await prisma.category.create({
    data: {
      name: 'Tops',
      slug: 'tops',
      description: 'Stylish tops and blouses'
    }
  })
  
  console.log('✅ Created category:', tops.name)

  // Create products (with isActive: true!)
  const product1 = await prisma.product.create({
    data: {
      name: 'Elegant Summer Dress',
      slug: 'elegant-summer-dress',
      description: 'A beautiful flowing dress perfect for summer occasions',
      price: 89.99,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
      categoryId: dresses.id,
      stock: 10,
      isActive: true,  // ← EXPLICITLY SET TO TRUE
      colors: ['Blue', 'Pink', 'White'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    }
  })
  
  console.log('✅ Created product:', product1.name)

  const product2 = await prisma.product.create({
    data: {
      name: 'Classic White Blouse',
      slug: 'classic-white-blouse',
      description: 'Timeless white blouse for professional settings',
      price: 45.99,
      images: ['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800'],
      categoryId: tops.id,
      stock: 25,
      isActive: true,  // ← EXPLICITLY SET TO TRUE
      colors: ['White', 'Cream', 'Light Blue'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    }
  })
  
  console.log('✅ Created product:', product2.name)

  const product3 = await prisma.product.create({
    data: {
      name: 'Floral Maxi Dress',
      slug: 'floral-maxi-dress',
      description: 'Beautiful floral print maxi dress for special occasions',
      price: 129.99,
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
      categoryId: dresses.id,
      stock: 8,
      isActive: true,  // ← EXPLICITLY SET TO TRUE
      colors: ['Floral Blue', 'Floral Red'],
      sizes: ['S', 'M', 'L'],
    }
  })
  
  console.log('✅ Created product:', product3.name)

  const product4 = await prisma.product.create({
    data: {
      name: 'Casual Striped Top',
      slug: 'casual-striped-top',
      description: 'Comfortable striped top perfect for everyday wear',
      price: 35.99,
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
      categoryId: tops.id,
      stock: 30,
      isActive: true,  // ← EXPLICITLY SET TO TRUE
      colors: ['Navy', 'Red', 'Black'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    }
  })
  
  console.log('✅ Created product:', product4.name)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
