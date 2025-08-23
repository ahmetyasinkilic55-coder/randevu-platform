const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedAYKHairDesign() {
  try {
    console.log('🌱 Seeding AYK Hair Design data...\n')
    
    // Find or create AYK Hair Design business
    let business = await prisma.business.findFirst({
      where: {
        OR: [
          { name: { contains: 'AYK' } },
          { slug: 'ayk-hair-desing' }
        ]
      }
    })

    if (!business) {
      // Find the user to create business for (take the first user)
      const user = await prisma.user.findFirst()
      if (!user) {
        console.log('❌ No users found. Please create a user first.')
        return
      }

      business = await prisma.business.create({
        data: {
          name: 'AYK Hair Design',
          slug: 'ayk-hair-desing',
          category: 'BARBER',
          phone: '+90 555 123 4567',
          email: 'info@ayk-hair.com',
          address: 'Kızılay Mahallesi, Atatürk Bulvarı No:123, Çankaya/Ankara',
          description: 'Modern berberlik hizmetleri ve stilist danışmanlığı',
          ownerId: user.id,
          profilePhotoUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
          coverPhotoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'
        }
      })
      console.log('✅ Created business:', business.name)
    }

    // Add services
    const services = [
      {
        name: 'Klasik Erkek Saç Kesimi',
        description: 'Profesyonel saç kesimi ve şekillendirme',
        price: 50,
        duration: 30,
        category: 'Saç Bakımı',
        popularity: 90
      },
      {
        name: 'Sakal Tıraşı',
        description: 'Geleneksel ustura ile sakal tıraşı',
        price: 35,
        duration: 20,
        category: 'Sakal Bakımı',
        popularity: 85
      },
      {
        name: 'Saç + Sakal Kombo',
        description: 'Saç kesimi + sakal tıraşı kombini',
        price: 75,
        duration: 45,
        category: 'Kombo Paketler',
        popularity: 95
      },
      {
        name: 'Yüz Bakımı',
        description: 'Erkekler için özel yüz temizliği ve bakımı',
        price: 100,
        duration: 60,
        category: 'Yüz Bakımı',
        popularity: 70
      }
    ]

    for (const serviceData of services) {
      const existingService = await prisma.service.findFirst({
        where: {
          businessId: business.id,
          name: serviceData.name
        }
      })
      
      if (!existingService) {
        await prisma.service.create({
          data: {
            ...serviceData,
            businessId: business.id
          }
        })
      }
    }
    console.log(`✅ Created/updated ${services.length} services`)

    // Add staff
    const staff = [
      {
        name: 'Ahmet Yasin KILIÇ',
        specialty: 'Master Berber & Kurucu',
        experience: 8,
        rating: 4.9,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        bio: '8 yıllık deneyimi ile modern berberlik teknikleri konusunda uzman'
      },
      {
        name: 'Mehmet Özkan',
        specialty: 'Sakal Uzmanı',
        experience: 5,
        rating: 4.8,
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'Geleneksel ustura teknikleri ve modern sakal şekillendirme uzmanı'
      },
      {
        name: 'Can Demir',
        specialty: 'Stil Danışmanı',
        experience: 4,
        rating: 4.7,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        bio: 'Yüz tipine göre en uygun saç ve sakal stilini önerir'
      }
    ]

    for (const staffData of staff) {
      const existingStaff = await prisma.staff.findFirst({
        where: {
          businessId: business.id,
          name: staffData.name
        }
      })
      
      if (!existingStaff) {
        await prisma.staff.create({
          data: {
            ...staffData,
            businessId: business.id
          }
        })
      }
    }
    console.log(`✅ Created/updated ${staff.length} staff members`)

    // Add gallery items
    const galleryItems = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600',
        title: 'Modern Saç Kesimi',
        description: 'Güncel trend saç kesimleri',
        type: 'WORK',
        order: 1
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600',
        title: 'Profesyonel Sakal Tıraşı',
        description: 'Ustura ile sakal şekillendirme',
        type: 'WORK',
        order: 2
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600',
        title: 'Salon Atmosferi',
        description: 'Modern ve konforlu salon ortamımız',
        type: 'SALON',
        order: 3
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
        title: 'Yüz Bakımı Hizmeti',
        description: 'Erkekler için özel yüz bakım uygulamaları',
        type: 'WORK',
        order: 4
      }
    ]

    for (const [index, galleryData] of galleryItems.entries()) {
      const existingGallery = await prisma.galleryItem.findFirst({
        where: {
          businessId: business.id,
          order: galleryData.order
        }
      })
      
      if (!existingGallery) {
        await prisma.galleryItem.create({
          data: {
            ...galleryData,
            businessId: business.id
          }
        })
      }
    }
    console.log(`✅ Created/updated ${galleryItems.length} gallery items`)

    // Create sample reviews
    const reviews = [
      {
        rating: 5,
        comment: 'Harika bir deneyim! Yasin usta gerçekten işinin ehli. Saç kesimi ve sakal tıraşı mükemmeldi.',
        customerName: 'Emre Kaya',
        customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        isApproved: true,
        isVisible: true
      },
      {
        rating: 5,
        comment: 'Çok temiz ve modern bir salon. Personel çok ilgili ve profesyonel. Kesinlikle tavsiye ederim.',
        customerName: 'Burak Özdemir',
        customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        isApproved: true,
        isVisible: true
      },
      {
        rating: 4,
        comment: 'Sakal tıraşı için gitmiştim, çok memnun kaldım. Ustura tekniği harika!',
        customerName: 'Oğuz Şen',
        customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        isApproved: true,
        isVisible: true
      }
    ]

    // Create a sample appointment for each review
    for (const reviewData of reviews) {
      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          status: 'COMPLETED',
          customerName: reviewData.customerName,
          customerPhone: '+90 555 000 0000',
          businessId: business.id,
          serviceId: (await prisma.service.findFirst({ where: { businessId: business.id } }))?.id || '',
          staffId: (await prisma.staff.findFirst({ where: { businessId: business.id } }))?.id
        }
      })

      await prisma.review.create({
        data: {
          ...reviewData,
          businessId: business.id,
          appointmentId: appointment.id
        }
      })
    }
    console.log(`✅ Created ${reviews.length} reviews with appointments`)

    // Create/update website config
    const websiteConfig = await prisma.websiteConfig.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        urlSlug: 'ayk-hair-desing',
        isPublished: true,
        template: 'berber',
        heroTitle: 'AYK Hair Design',
        heroSubtitle: 'Ankara\'nın en modern berber deneyimi',
        buttonText: 'Randevu Al',
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        gradientColors: 'linear-gradient(135deg, #2c3e50, #4a6741)',
        showServices: true,
        showTeam: true,
        showGallery: true,
        showReviews: true,
        showMap: true,
        showContact: true,
        metaTitle: 'AYK Hair Design - Modern Berberlik Hizmetleri',
        metaDescription: 'Ankara Kızılay\'da modern berberlik hizmetleri. Profesyonel saç kesimi, sakal tıraşı ve yüz bakımı.'
      },
      update: {
        isPublished: true,
        showServices: true,
        showTeam: true,
        showGallery: true,
        showReviews: true,
        showMap: true,
        showContact: true
      }
    })
    console.log('✅ Created/updated website config')

    // Add working hours
    const workingHours = [
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Monday
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Tuesday
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Wednesday
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Thursday
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Friday
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Saturday
      { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' } // Sunday
    ]

    for (const hours of workingHours) {
      const existingHours = await prisma.workingHour.findFirst({
        where: {
          businessId: business.id,
          dayOfWeek: hours.dayOfWeek
        }
      })
      
      if (!existingHours) {
        await prisma.workingHour.create({
          data: {
            ...hours,
            businessId: business.id
          }
        })
      } else {
        await prisma.workingHour.update({
          where: { id: existingHours.id },
          data: hours
        })
      }
    }
    console.log('✅ Created/updated working hours')

    // Create/update business settings with APPOINTMENT service type
    const businessSettings = await prisma.businessSettings.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        serviceType: 'APPOINTMENT', // Default to appointment-based service
        buttonText: 'Randevu Al',
        consultationFee: 0.0,
        isConsultationFree: true,
        minimumProjectAmount: 0.0,
        workingRadius: JSON.stringify(['Çankaya', 'Yenimahalle', 'Keçiören', 'Mamak']),
        supportedMeetingTypes: JSON.stringify(['face_to_face']),
        newAppointmentNotification: true,
        appointmentCancellationNotification: true,
        allowOnlineBooking: true,
        requireBookingApproval: false,
        bookingLeadTime: 30, // 30 minutes lead time
        acceptCashPayment: true,
        acceptCardPayment: true
      },
      update: {
        serviceType: 'APPOINTMENT',
        buttonText: 'Randevu Al',
        allowOnlineBooking: true
      }
    })
    console.log('✅ Created/updated business settings')

    console.log('\n🎉 AYK Hair Design seeding completed successfully!')
    console.log(`🌐 Website URL: http://localhost:3000/ayk-hair-desing`)
    console.log(`🛠️ Service Type: ${businessSettings.serviceType}`)
    console.log(`🎯 Button Text: ${businessSettings.buttonText}`)
    console.log(`📱 Online Booking: ${businessSettings.allowOnlineBooking ? 'Enabled' : 'Disabled'}`)

  } catch (error) {
    console.error('❌ Seeding error:', error)
    console.error('Error details:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

seedAYKHairDesign()
