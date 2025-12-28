import prisma from './src/utils/prisma.js'

async function test() {
  console.log('🔍 Testing Prisma connection...')
  
  try {
    await prisma.$connect()
    console.log('✅ Connected to database!')
    
    const userCount = await prisma.user.count()
    console.log('📊 Number of users:', userCount)
    
    const categoryCount = await prisma.category.count()
    console.log('📊 Number of categories:', categoryCount)
    
    const productCount = await prisma.product.count()
    console.log('📊 Number of products:', productCount)
    
    await prisma.$disconnect()
    console.log('✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

test()
