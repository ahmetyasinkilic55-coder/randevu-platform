import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Website oluşturma/güncelleme schema
const websiteConfigSchema = z.object({
  businessId: z.string(),
  template: z.string().optional(),
  urlSlug: z.string().optional(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  buttonText: z.string().default('Randevu Al'),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(), 
  gradientColors: z.string().optional(),
  showServices: z.boolean().default(true),
  showTeam: z.boolean().default(true),
  showGallery: z.boolean().default(true),
  showBlog: z.boolean().default(false),
  showReviews: z.boolean().default(true),
  showMap: z.boolean().default(true),
  showContact: z.boolean().default(true),
  profilePhoto: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
  galleryPhotos: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false)
})

// URL slug oluşturma fonksiyonu
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[şğıçöü]/g, char => {
      const map: Record<string, string> = {
        'ş': 's', 'ğ': 'g', 'ı': 'i', 
        'ç': 'c', 'ö': 'o', 'ü': 'u'
      }
      return map[char] || char
    })
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET - İşletmenin website config'ini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      },
      include: {
        websiteConfig: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            description: true,
            category: true
          }
        },
        staff: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            specialty: true,
            photoUrl: true
          }
        },
        gallery: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            imageUrl: true,
            title: true,
            description: true,
            order: true,
            isActive: true,
            createdAt: true
          }
        },
        reviews: {
          where: { 
            isApproved: true,
            isVisible: true 
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            customerName: true,
            customerAvatar: true,
            createdAt: true
          }
        },
        workingHours: {
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // İstatistikler hesapla
    const totalAppointments = await prisma.appointment.count({
      where: { businessId }
    })

    const avgRating = await prisma.review.aggregate({
      where: { 
        businessId,
        isApproved: true 
      },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json({
      business: {
        ...business,
        totalAppointments,
        avgRating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count.rating || 0
      }
    })

  } catch (error) {
    console.error('Get website config error:', error)
    return NextResponse.json(
      { error: 'Website bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Website config oluştur veya güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = websiteConfigSchema.parse(body)

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // URL slug oluştur (eğer yoksa)
    let urlSlug = validatedData.urlSlug
    if (!urlSlug) {
      urlSlug = generateSlug(business.name)
      
      // Slug çakışma kontrolü
      let counter = 1
      let finalSlug = urlSlug
      
      while (await prisma.websiteConfig.findFirst({ where: { urlSlug: finalSlug } })) {
        finalSlug = `${urlSlug}-${counter}`
        counter++
      }
      
      urlSlug = finalSlug
    }

    // Sektöre göre default template belirle
    let template = validatedData.template
    if (!template) {
      const categoryTemplateMap: Record<string, string> = {
        'BARBER': 'berber',
        'BEAUTY_SALON': 'kuafor', 
        'DENTIST': 'dishekimi',
        'CAR_WASH': 'otoyikama',
        'VETERINARIAN': 'veteriner',
        'GYM': 'spor'
      }
      template = categoryTemplateMap[business.category] || 'modern'
    }

    // Website config'i upsert et
    const websiteConfig = await prisma.websiteConfig.upsert({
      where: { businessId: validatedData.businessId },
      create: {
        businessId: validatedData.businessId,
        urlSlug,
        template,
        heroTitle: validatedData.heroTitle,
        heroSubtitle: validatedData.heroSubtitle,
        buttonText: validatedData.buttonText,
        primaryColor: validatedData.primaryColor || '#2563eb',
        secondaryColor: validatedData.secondaryColor || '#1d4ed8',
        gradientColors: validatedData.gradientColors || 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        showServices: validatedData.showServices,
        showTeam: validatedData.showTeam,
        showGallery: validatedData.showGallery,
        showBlog: validatedData.showBlog,
        showReviews: validatedData.showReviews,
        showMap: validatedData.showMap,
        showContact: validatedData.showContact,
        profilePhoto: validatedData.profilePhoto,
        coverPhoto: validatedData.coverPhoto,
        galleryPhotos: validatedData.galleryPhotos ? JSON.stringify(validatedData.galleryPhotos) : null,
        metaTitle: validatedData.metaTitle || validatedData.heroTitle,
        metaDescription: validatedData.metaDescription || validatedData.heroSubtitle,
        isPublished: validatedData.isPublished
      },
      update: {
        template,
        heroTitle: validatedData.heroTitle,
        heroSubtitle: validatedData.heroSubtitle,
        buttonText: validatedData.buttonText,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        gradientColors: validatedData.gradientColors,
        showServices: validatedData.showServices,
        showTeam: validatedData.showTeam,
        showGallery: validatedData.showGallery,
        showBlog: validatedData.showBlog,
        showReviews: validatedData.showReviews,
        showMap: validatedData.showMap,
        showContact: validatedData.showContact,
        profilePhoto: validatedData.profilePhoto,
        coverPhoto: validatedData.coverPhoto,
        galleryPhotos: validatedData.galleryPhotos ? JSON.stringify(validatedData.galleryPhotos) : null,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        isPublished: validatedData.isPublished,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Website başarıyla kaydedildi',
      websiteConfig,
      url: `mocksite.com/${urlSlug}`,
      previewUrl: `/preview/${urlSlug}`
    }, { status: 201 })

  } catch (error) {
    console.error('Create/Update website config error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Website kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}