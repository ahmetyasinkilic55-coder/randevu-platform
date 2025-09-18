import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Server-side kontrolü
if (typeof window !== 'undefined') {
  throw new Error('This API route should only run on server-side')
}

// GET - Servis taleplerini listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const provinceId = searchParams.get('provinceId')
    const districtId = searchParams.get('districtId')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')

    const skip = (page - 1) * limit

    // Build filter
    const where: any = {}
    
    if (status) {
      where.status = status
    } else {
      // Varsayılan olarak aktif ve bekleyen talepleri göster
      where.status = { in: ['PENDING', 'ACTIVE', 'RESPONDED'] }
    }
    
    if (urgency) where.urgency = urgency
    if (provinceId) where.provinceId = parseInt(provinceId)
    if (districtId) where.districtId = parseInt(districtId)
    if (categoryId) where.categoryId = categoryId
    if (subcategoryId) where.subcategoryId = subcategoryId

    // Sadece süresi dolmamış talepleri göster
    where.expiresAt = {
      gte: new Date()
    }

    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          responses: {
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  province: true,
                  district: true,
                }
              }
            }
          },
          user: session?.user ? {
            select: {
              id: true,
              name: true
            }
          } : false
        },
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.serviceRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      serviceRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Service requests GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talepleri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni servis talebi oluştur
export async function POST(request: NextRequest) {
  try {
    // Debug: Prisma client kontrolü
    console.log('Prisma client check:', {
      prisma: !!prisma,
      serviceRequest: !!prisma?.serviceRequest,
      create: !!prisma?.serviceRequest?.create
    })
    
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      customerName,
      customerPhone,
      customerEmail,
      categoryId,
      subcategoryId,
      serviceName,
      serviceDetails,
      budget,
      urgency = 'NORMAL',
      provinceId,
      districtId,
      province,
      district,
      address,
      preferredDate,
      preferredTime,
      flexibleTiming = true
    } = body

    // Validasyonlar
    if (!customerName || !customerPhone || !serviceName) {
      return NextResponse.json(
        { success: false, error: 'Müşteri adı, telefon ve hizmet adı gerekli' },
        { status: 400 }
      )
    }

    if (!provinceId) {
      return NextResponse.json(
        { success: false, error: 'İl seçimi gerekli' },
        { status: 400 }
      )
    }

    // Telefon validasyonu (Türk telefon formatı)
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/
    if (!phoneRegex.test(customerPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir telefon numarası giriniz' },
        { status: 400 }
      )
    }

    // Email validasyonu (eğer varsa)
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json(
          { success: false, error: 'Geçerli bir email adresi giriniz' },
          { status: 400 }
        )
      }
    }

    // Aciliyet durumuna göre son kullanma tarihi belirle
    const urgencyHours = {
      'URGENT': 24,      // 1 gün
      'HIGH': 72,        // 3 gün
      'NORMAL': 168,     // 1 hafta
      'LOW': 336         // 2 hafta
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + urgencyHours[urgency as keyof typeof urgencyHours])

    // Servis talebi oluştur
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        customerName,
        customerPhone: customerPhone.replace(/\s/g, ''),
        customerEmail: customerEmail || null,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        serviceName,
        serviceDetails: serviceDetails || null,
        budget: budget ? parseFloat(budget) : null,
        urgency,
        provinceId: provinceId ? parseInt(provinceId) : null,
        districtId: districtId ? parseInt(districtId) : null,
        province: province || null,
        district: district || null,
        address: address || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        flexibleTiming,
        status: 'ACTIVE', // Hemen aktif yap
        expiresAt,
        userId: session?.user?.id || null
      },
      include: {
        user: session?.user ? {
          select: {
            id: true,
            name: true
          }
        } : false
      }
    })

    // İlgili işletmelere bildirim gönder (arka planda)
    // TODO: Email/SMS bildirimleri için queue sistem kurulacak
    notifyMatchingBusinesses(serviceRequest.id).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Servis talebiniz başarıyla oluşturuldu',
      serviceRequest
    })

  } catch (error) {
    console.error('Service request POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talebi oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

// İlgili işletmelere bildirim gönderen fonksiyon
async function notifyMatchingBusinesses(serviceRequestId: string) {
  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        responses: true
      }
    })

    if (!serviceRequest) return

    // Kriterlere uygun işletmeleri bul
    const matchingBusinesses = await prisma.business.findMany({
      where: {
        isActive: true,
        AND: [
          // Konum kriteri
          serviceRequest.provinceId ? {
            provinceId: serviceRequest.provinceId
          } : {},
          serviceRequest.districtId ? {
            districtId: serviceRequest.districtId
          } : {},
          // Kategori kriteri
          serviceRequest.categoryId ? {
            categoryId: serviceRequest.categoryId
          } : {},
          serviceRequest.subcategoryId ? {
            subcategoryId: serviceRequest.subcategoryId
          } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        owner: {
          select: {
            email: true,
            notificationSettings: true
          }
        }
      }
    })

    // TODO: Email/SMS bildirimleri burada gönderilecek
    console.log(`Found ${matchingBusinesses.length} matching businesses for service request ${serviceRequestId}`)

  } catch (error) {
    console.error('Error notifying businesses:', error)
  }
}
