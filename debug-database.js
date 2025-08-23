const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDatabase() {
  try {
    console.log('🔍 Database Debug for AYK Hair Design\n')
    
    // Find AYK Hair Design business
    const business = await prisma.business.findFirst({
      where: {
        OR: [
          { name: { contains: 'AYK' } },
          { slug: 'ayk-hair-desing' }
        ]
      },
      include: {
        websiteConfig: true,
        services: { where: { isActive: true } },
        staff: { where: { isActive: true } },
        gallery: { where: { isActive: true } },
        reviews: { where: { isApproved: true } }
      }
    })

    if (!business) {
      console.log('❌ AYK Hair Design business not found')
      
      // List all businesses
      const allBusinesses = await prisma.business.findMany({
        select: { id: true, name: true, slug: true }
      })
      console.log('\n📋 Available businesses:')
      allBusinesses.forEach(b => {
        console.log(`- ${b.name} (slug: ${b.slug})`)
      })
      return
    }

    console.log('✅ Found business:', {
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      phone: business.phone,
      email: business.email
    })

    console.log('\n🌐 Website Config:', business.websiteConfig ? {
      urlSlug: business.websiteConfig.urlSlug,
      isPublished: business.websiteConfig.isPublished,
      showServices: business.websiteConfig.showServices,
      showTeam: business.websiteConfig.showTeam,
      showGallery: business.websiteConfig.showGallery,
      showReviews: business.websiteConfig.showReviews,
      showMap: business.websiteConfig.showMap,
      showContact: business.websiteConfig.showContact
    } : 'No website config found')

    console.log('\n💼 Services:')
    if (business.services.length === 0) {
      console.log('❌ No services found')
    } else {
      business.services.forEach(service => {
        console.log(`- ${service.name} (${service.price}₺, ${service.duration}dk)`)
      })
    }

    console.log('\n👥 Staff:')
    if (business.staff.length === 0) {
      console.log('❌ No staff found')
    } else {
      business.staff.forEach(staff => {
        console.log(`- ${staff.name} (${staff.specialty || 'No specialty'})`)
      })
    }

    console.log('\n📸 Gallery:')
    if (business.gallery.length === 0) {
      console.log('❌ No gallery items found')
    } else {
      business.gallery.forEach(item => {
        console.log(`- ${item.title || 'Untitled'} (${item.imageUrl})`)
      })
    }

    console.log('\n⭐ Reviews:')
    if (business.reviews.length === 0) {
      console.log('❌ No reviews found')
    } else {
      business.reviews.forEach(review => {
        console.log(`- ${review.customerName}: ${review.rating}⭐ "${review.comment}"`)
      })
    }

  } catch (error) {
    console.error('Database debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDatabase()
