const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getBusinessId() {
  try {
    console.log('🔍 Finding AYK Hair Design business ID...\n')
    
    const business = await prisma.business.findFirst({
      where: {
        OR: [
          { name: { contains: 'AYK' } },
          { slug: 'ayk-hair-desing' }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    if (!business) {
      console.log('❌ Business not found')
      return
    }

    console.log('✅ Found business:')
    console.log(`ID: ${business.id}`)
    console.log(`Name: ${business.name}`)
    console.log(`Slug: ${business.slug}`)
    console.log(`\n🔗 API Endpoint: /api/businesses/${business.id}/full`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getBusinessId()
