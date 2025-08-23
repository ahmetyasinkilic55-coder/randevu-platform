import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessSchema = z.object({
  name: z.string().min(2, 'İşletme adı en az 2 karakter olmalı'),
  // Legacy category field
  category: z.enum([
    'BARBER', 'BEAUTY_SALON', 'DENTIST', 'CAR_WASH', 'GYM', 
    'VETERINARIAN', 'OTHER'
  ]).optional(),
  // New category system
  categoryId: z.string().cuid().optional(),
  subcategoryId: z.string().cuid().optional(),
  // Location fields
  province: z.string().optional(),
  district: z.string().optional(), 
  provinceId: z.number().optional(),
  districtId: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Required fields
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  email: z.string().email('Geçerli bir email adresi girin'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalı'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
})

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
    const validatedData = businessSchema.parse(body)

    // Slug oluştur (işletme adından)
    const slug = validatedData.name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Slug'ın benzersiz olduğundan emin ol
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // İşletmeyi oluştur
    const business = await prisma.business.create({
      data: {
        name: validatedData.name,
        slug: uniqueSlug,
        category: validatedData.category || 'OTHER',
        categoryId: validatedData.categoryId || null,
        subcategoryId: validatedData.subcategoryId || null,
        // Location fields
        province: validatedData.province || null,
        district: validatedData.district || null,
        provinceId: validatedData.provinceId || null,
        districtId: validatedData.districtId || null,
        latitude: validatedData.latitude || null,
        longitude: validatedData.longitude || null,
        // Basic fields
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        description: validatedData.description || '',
        website: validatedData.website || null,
        instagramUrl: validatedData.instagramUrl || null,
        facebookUrl: validatedData.facebookUrl || null,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // URL slug oluştur (website için)
    let urlSlug = uniqueSlug // Business slug'ı kullan
    
    // Website URL slug'ının benzersiz olduğundan emin ol
    let urlCounter = 1
    while (await prisma.websiteConfig.findUnique({ where: { urlSlug } })) {
      urlSlug = `${uniqueSlug}-${urlCounter}`
      urlCounter++
    }
    
    // Varsayılan website konfigürasyonu oluştur
    await prisma.websiteConfig.create({
      data: {
        businessId: business.id,
        urlSlug: urlSlug,
        heroTitle: `${business.name} - Randevunuzu Alın`,
        heroSubtitle: `${business.name} ile kaliteli hizmet. Online randevu alın, zamanınızı planlayın.`,
        buttonText: 'Randevu Al',
        showServices: true,
        showGallery: true,
        showReviews: true,
        showMap: true,
        showContact: true,
      }
    })

    // Varsayılan çalışma saatleri oluştur (Pazartesi-Cumartesi 9:00-18:00)
    const workingHours = [
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00' },
    ]

    await prisma.workingHour.createMany({
      data: workingHours.map(wh => ({
        ...wh,
        businessId: business.id,
      }))
    })

    return NextResponse.json(
      { 
        message: 'İşletme başarıyla oluşturuldu',
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          category: business.category,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Business creation error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'İşletme oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const businesses = await prisma.business.findMany({
      where: {
        ownerId: session.user.id
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        phone: true,
        email: true,
        address: true,
        description: true,
        logo: true,
        profilePhotoUrl: true,
        coverImage: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true,
            services: true,
            staff: true,
          }
        },
        workingHours: {
          select: {
            dayOfWeek: true,
            isOpen: true,
            openTime: true,
            closeTime: true
          },
          orderBy: {
            dayOfWeek: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ businesses })

  } catch (error) {
    console.error('Get businesses error:', error)
    return NextResponse.json(
      { error: 'İşletmeler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
