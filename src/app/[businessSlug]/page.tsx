import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BusinessSiteClient from './BusinessSiteClient'
import { headers } from 'next/headers'

// Optimize for production
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute
export const fetchCache = 'default-cache'
export const runtime = 'nodejs'

interface PageProps {
  params: Promise<{
    businessSlug: string
  }>
}

async function getBusinessBySlug(slug: string) {
  try {
    // Service worker ve diğer sistem dosyalarını filtrele
    const systemFiles = [
      'sw.js', 'service-worker.js', 'manifest.json', 
      'robots.txt', 'sitemap.xml', 'favicon.ico',
      '_next', 'api', 'auth', 'admin', 'dashboard'
    ]
    
    if (systemFiles.some(file => slug.startsWith(file))) {
      console.log(`ℹ️ [businessSlug] Skipping system file request: ${slug}`)
      return null
    }
   
    // Optimize edilmiş sorgu - sadece gerekli alanları çek
    const websiteConfig = await prisma.websiteConfig.findUnique({
      where: {
        urlSlug: slug,
        // TODO: Production'da isPublished: true kontrolünü geri ekle
        // isPublished: true,
      },
      select: {
        id: true,
        urlSlug: true,
        primaryColor: true,
        secondaryColor: true,
        gradientColors: true,
        heroTitle: true,
        heroSubtitle: true,
        buttonText: true,
        showServices: true,
        showTeam: true,
        showGallery: true,
        showBlog: true,
        showReviews: true,
        showMap: true,
        showContact: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            phone: true,
            email: true,
            address: true,
            description: true,
            profilePhotoUrl: true,
            coverPhotoUrl: true,
            latitude: true,
            longitude: true,
            instagramUrl: true,
            facebookUrl: true,
            websiteUrl: true,
            services: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true,
                popularity: true
              },
              orderBy: { popularity: 'desc' },
              take: 20 // Limit services
            },
            staff: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                specialty: true,
                experience: true,
                rating: true,
                photoUrl: true,
                staffLeaves: {
                  where: {
                    status: 'APPROVED',
                    endDate: {
                      gte: new Date()
                    }
                  },
                  select: {
                    id: true,
                    startDate: true,
                    endDate: true,
                    startTime: true,
                    endTime: true,
                    type: true,
                    status: true
                  },
                  orderBy: { startDate: 'asc' }
                }
              },
              take: 10 // Limit staff
            },
            gallery: {
              where: { isActive: true },
              select: {
                id: true,
                imageUrl: true,
                title: true,
                description: true
              },
              orderBy: { order: 'asc' },
              take: 20 // Limit gallery items
            },
            reviews: {
              where: { 
                isApproved: true,
                isVisible: true 
              },
              select: {
                id: true,
                rating: true,
                comment: true,
                customerName: true,
                customerAvatar: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            workingHours: {
              select: {
                dayOfWeek: true,
                isOpen: true,
                openTime: true,
                closeTime: true
              },
              orderBy: { dayOfWeek: 'asc' }
            },
            settings: {
              select: {
                serviceType: true,
                buttonText: true,
                consultationFee: true,
                isConsultationFree: true,
                minimumProjectAmount: true,
                workingRadius: true,
                supportedMeetingTypes: true
              }
            },
            appointmentSettings: true
          }
        }
      }
    })

    if (!websiteConfig) {
      console.log('❌ [businessSlug] No websiteConfig found for slug:', slug)
      
      // Debug: Tüm mevcut slug'ları listele
      const allConfigs = await prisma.websiteConfig.findMany({
        select: { urlSlug: true, business: { select: { name: true } } }
      })
      console.log('📄 [businessSlug] Available slugs:', allConfigs.map(c => c.urlSlug))
      
      return null
    }
    
    console.log('✅ [businessSlug] Found websiteConfig:', {
      slug: websiteConfig.urlSlug,
      businessId: websiteConfig.business.id,
      businessName: websiteConfig.business.name,
      heroTitle: websiteConfig.heroTitle,
      heroSubtitle: websiteConfig.heroSubtitle,
      primaryColor: websiteConfig.primaryColor,
      showServices: websiteConfig.showServices,
      showTeam: websiteConfig.showTeam,
      showGallery: websiteConfig.showGallery,
      showReviews: websiteConfig.showReviews,
      showMap: websiteConfig.showMap,
      showContact: websiteConfig.showContact,
      servicesCount: websiteConfig.business.services?.length || 0,
      staffCount: websiteConfig.business.staff?.length || 0,
      galleryCount: websiteConfig.business.gallery?.length || 0,
      reviewsCount: websiteConfig.business.reviews?.length || 0,
      hasSettings: !!websiteConfig.business.settings,
      settingsType: websiteConfig.business.settings?.serviceType,
      lastUpdate: websiteConfig.updatedAt,
      galleryData: websiteConfig.business.gallery // Tam gallery verilerini göster
    })

    const business = websiteConfig.business

    // İstatistikleri hesapla
    const [avgRatingResult, totalAppointments] = await Promise.all([
      prisma.review.aggregate({
        where: { 
          businessId: business.id,
          isApproved: true 
        },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.appointment.count({
        where: { businessId: business.id }
      })
    ])

    // Çalışma saatlerini formatla
    // JavaScript getDay() formatı: 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const formattedWorkingHours = business.workingHours.map(wh => ({
      day: dayNames[wh.dayOfWeek],
      hours: wh.isOpen ? `${wh.openTime} - ${wh.closeTime}` : 'Kapalı',
      isClosed: !wh.isOpen
    }))

    // BusinessData formatına dönüştür
    const businessData = {
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      phone: business.phone,
      email: business.email || undefined,
      address: business.address,
      description: business.description || undefined,
      profilePhotoUrl: business.profilePhotoUrl || undefined,
      coverPhotoUrl: business.coverPhotoUrl || undefined,
      latitude: business.latitude || undefined,
      longitude: business.longitude || undefined,
      instagramUrl: business.instagramUrl || undefined,
      facebookUrl: business.facebookUrl || undefined,
      websiteUrl: business.websiteUrl || undefined,
      services: business.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || undefined,
        price: service.price,
        duration: service.duration,
        popularity: service.popularity
      })),
      staff: business.staff.map(staff => ({
        id: staff.id,
        name: staff.name,
        specialty: staff.specialty || undefined,
        experience: staff.experience || undefined,
        rating: staff.rating || undefined,
        photoUrl: staff.photoUrl || undefined,
        staffLeaves: staff.staffLeaves?.map(leave => ({
          id: leave.id,
          startDate: leave.startDate.toISOString().split('T')[0],
          endDate: leave.endDate.toISOString().split('T')[0],
          startTime: leave.startTime || undefined,
          endTime: leave.endTime || undefined,
          type: leave.type as 'FULL_DAY' | 'PARTIAL' | 'MULTI_DAY',
          status: leave.status as 'APPROVED' | 'PENDING' | 'REJECTED'
        })) || []
      })),
      gallery: business.gallery.map(item => ({
        id: item.id,
        imageUrl: item.imageUrl,
        title: item.title || undefined,
        description: item.description || undefined
      })),
      reviews: business.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customerName,
        customerAvatar: review.customerAvatar || undefined,
        createdAt: review.createdAt.toISOString()
      })),
      websiteConfig: {
        primaryColor: websiteConfig.primaryColor,
        secondaryColor: websiteConfig.secondaryColor,
        gradientColors: websiteConfig.gradientColors,
        heroTitle: websiteConfig.heroTitle,
        heroSubtitle: websiteConfig.heroSubtitle,
        buttonText: websiteConfig.buttonText,
        showServices: websiteConfig.showServices,
        showTeam: websiteConfig.showTeam,
        showGallery: websiteConfig.showGallery,
        showBlog: websiteConfig.showBlog,
        showReviews: websiteConfig.showReviews,
        showMap: websiteConfig.showMap,
        showContact: websiteConfig.showContact
      },
      averageRating: avgRatingResult._avg.rating || 0,
      formattedWorkingHours,
      _count: {
        reviews: avgRatingResult._count.rating || 0,
        appointments: totalAppointments
      },
      settings: business.settings ? {
        serviceType: business.settings.serviceType,
        buttonText: business.settings.buttonText,
        consultationFee: business.settings.consultationFee,
        isConsultationFree: business.settings.isConsultationFree,
        minimumProjectAmount: business.settings.minimumProjectAmount,
        workingRadius: business.settings.workingRadius || undefined,
        supportedMeetingTypes: business.settings.supportedMeetingTypes ? 
          JSON.parse(business.settings.supportedMeetingTypes as string) : undefined
      } : undefined,
      appointmentSettings: business.appointmentSettings ? JSON.parse(business.appointmentSettings) : undefined,
      workingHours: business.workingHours.map(wh => ({
        dayOfWeek: wh.dayOfWeek,
        isOpen: wh.isOpen,
        openTime: wh.openTime,
        closeTime: wh.closeTime
      }))
    }

    return businessData

  } catch (error) {
    console.error('❌ [businessSlug] Error fetching business data for slug:', slug, error)
    
    // Prisma veya DB bağlantı hatası durumunda
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    }
    
    // Geliştirme ortamında daha detaylı hata bilgisi
    if (process.env.NODE_ENV === 'development') {
      console.error('Development debug info:', {
        slug,
        prismaAvailable: !!prisma,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      })
    }
    
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { businessSlug } = await params
  const businessData = await getBusinessBySlug(businessSlug)
  
  if (!businessData) {
    return {
      title: 'Sayfa Bulunamadı',
    }
  }

  return {
    title: businessData.websiteConfig?.heroTitle || businessData.name,
    description: businessData.websiteConfig?.heroSubtitle || businessData.description,
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const { businessSlug } = await params
  
  // Service worker ve sistem dosyaları için erken return
  const systemFiles = [
    'sw.js', 'service-worker.js', 'manifest.json', 
    'robots.txt', 'sitemap.xml', 'favicon.ico'
  ]
  
  if (systemFiles.includes(businessSlug)) {
    // Bu dosyalar için Next.js'in varsayılan handler'ına bırak
    notFound()
  }
  
  const businessData = await getBusinessBySlug(businessSlug)

  if (!businessData) {
    notFound()
  }

  return <BusinessSiteClient businessData={businessData} businessSlug={businessSlug} />
}