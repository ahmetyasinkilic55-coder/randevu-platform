import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - İşletme için uygun servis taleplerini listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    // Kullanıcının business bilgilerini al
    const userBusiness = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        category: true,
        categoryId: true,
        subcategoryId: true,
        provinceId: true,
        districtId: true,
        province: true,
        district: true
      }
    })

    if (!userBusiness) {
      return NextResponse.json(
        { success: false, error: 'Aktif işletmeniz bulunamadı' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'active' // 'active', 'responded', 'accepted'

    const skip = (page - 1) * limit

    // Filtreleme logic
    let where: any = {}
    
    console.log('Filter:', filter)
    console.log('User Business:', {
      id: userBusiness.id,
      category: userBusiness.category,
      categoryId: userBusiness.categoryId,
      subcategoryId: userBusiness.subcategoryId,
      province: userBusiness.province,
      district: userBusiness.district
    })
    
    if (filter === 'active') {
      // Aktif talepler - süresi dolmamış ve henüz cevaplamadığımız
      // SADECE kategorimiz ve lokasyonumuzla uyuşan talepler
      
      // Kategori filtrelemesi için koşul
      const categoryConditions = []
      
      // Eğer yeni kategori sistemi kullanılıyorsa
      if (userBusiness.categoryId) {
        categoryConditions.push({
          categoryId: userBusiness.categoryId
        })
        if (userBusiness.subcategoryId) {
          categoryConditions.push({
            subcategoryId: userBusiness.subcategoryId  
          })
        }
      }
      
      // Legacy kategori sistemi için
      if (userBusiness.category) {
        const categoryKeywords = {
          'BARBER': ['berber', 'saç', 'traş'],
          'BEAUTY_SALON': ['kuaför', 'güzellik', 'makyaj'],
          'DISHEKIMI': ['diş', 'dişhekimi'],
          'OTOYIKAMA': ['oto', 'araç', 'yıkama'],
          'SPORSALONU': ['spor', 'fitness', 'gym'],
          'GUZELLIKMERKEZI': ['güzellik', 'estetik', 'cilt'],
          'VETERINER': ['veteriner', 'hayvan', 'pet'],
          'MASAJ': ['masaj', 'spa', 'wellness'],
          'DUGUNSALONU': ['düğün', 'nikah', 'salon'],
          'KURSMERKEZI': ['kurs', 'eğitim', 'ders']
        }
        
        const keywords = categoryKeywords[userBusiness.category as keyof typeof categoryKeywords] || [userBusiness.category.toLowerCase()]
        
        keywords.forEach(keyword => {
          categoryConditions.push({
            serviceName: {
              contains: keyword,
              mode: 'insensitive'
            }
          })
        })
      }
      
      where = {
        status: { in: ['ACTIVE', 'PENDING'] },
        expiresAt: {
          gte: new Date() // Süresi dolmamış talepler
        },
        // Kategori eşleşmesi - en az bir koşul sağlanmalı
        ...(categoryConditions.length > 0 && { OR: categoryConditions }),
        // Konum eşleşmesi - aynı il ve ilçe (ikisi de null değilse)
        ...(userBusiness.province && { province: userBusiness.province }),
        ...(userBusiness.district && { district: userBusiness.district }),
        // Sadece cevaplamadığımız talepler
        NOT: {
          responses: {
            some: {
              businessId: userBusiness.id
            }
          }
        }
      }
    } else if (filter === 'responded') {
      // Cevapladığımız talepler
      where = {
        responses: {
          some: {
            businessId: userBusiness.id
          }
        }
      }
    } else if (filter === 'accepted') {
      // Kabul edilen tekliflerimiz
      where = {
        responses: {
          some: {
            businessId: userBusiness.id,
            status: 'ACCEPTED'
          }
        }
      }
    }

    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          responses: {
            select: {
              id: true,
              businessId: true,
              status: true,
              message: true,
              proposedPrice: true,
              proposedDate: true,
              proposedTime: true,
              availability: true,
              createdAt: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { urgency: 'desc' }, // Acil talepler önce
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
      businessInfo: {
        id: userBusiness.id,
        categoryId: userBusiness.categoryId,
        subcategoryId: userBusiness.subcategoryId,
        location: {
          province: userBusiness.province,
          district: userBusiness.district
        }
      },
      filter,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Business service requests GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talepleri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
