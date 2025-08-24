import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BusinessSiteClient from './BusinessSiteClient'
import { headers } from 'next/headers'

// Force dynamic rendering to get fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

interface PageProps {
  params: Promise<{
    businessSlug: string
  }>
}

async function getBusinessBySlug(slug: string) {
  try {
    console.log('🔍 [businessSlug] Looking for slug:', slug)
    console.log('🕐 [businessSlug] Request time:', new Date().toISOString())
    
    // WebsiteConfig'den slug ile işletmeyi bul - geliştirme aşamasında isPublished kontrolünü kaldırdık
    const websiteConfig = await prisma.websiteConfig.findUnique({
      where: {
        urlSlug: slug,
        // TODO: Production'da isPublished: true kontrolünü geri ekle
        // isPublished: true,
      },
      include: {
        business: {
          include: {
            services: {
              where: { isActive: true },
              orderBy: { popularity: 'desc' }
            },
            staff: {
              where: { isActive: true },
              include: {
                staffLeaves: {
                  where: {
                    status: 'APPROVED',
                    endDate: {
                      gte: new Date() // Sadece bugün ve sonrasındaki izinler
                    }
                  },
                  orderBy: { startDate: 'asc' }
                }
              }
            },
            gallery: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            },
            reviews: {
              where: { 
                isApproved: true,
                isVisible: true 
              },
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            workingHours: {
              orderBy: { dayOfWeek: 'asc' }
            },
            settings: true
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
    console.error('Error fetching business data:', error)
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
  const businessData = await getBusinessBySlug(businessSlug)

  if (!businessData) {
    notFound()
  }

  return <BusinessSiteClient businessData={businessData} />
}