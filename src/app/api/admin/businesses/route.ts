import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin businesses API called')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session || !session.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin kontrolü - user'ın role'ünü kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    })
    
    console.log('User found:', user)

    if (!user) {
      console.log('User not found in database')
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }
    
    if (user.role !== 'ADMIN') {
      console.log('User is not admin, role:', user.role)
      return NextResponse.json(
        { error: 'Admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'ALL'
    const category = searchParams.get('category') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('Query params:', { search, status, category, page, limit })

    // Filtreleme koşulları
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // Status filtreleme - isActive field'ını kullan
    if (status === 'ACTIVE') {
      where.isActive = true
    } else if (status === 'INACTIVE') {
      where.isActive = false
    }
    // 'ALL' için filtreleme ekleme

    if (category !== 'ALL') {
      where.category = category
    }

    console.log('Where conditions:', where)

    const [businesses, totalCount] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              appointments: true,
              services: true,
              staff: true,
              reviews: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.business.count({ where })
    ])

    console.log(`Found ${businesses.length} businesses, total: ${totalCount}`)

    // Gelir hesaplama için her işletmenin tamamlanan randevularının toplamını hesapla
    const businessesWithStats = await Promise.all(
      businesses.map(async (business) => {
        try {
          // Appointment'da price field'ı olmayabilir, service'ten al
          const completedAppointments = await prisma.appointment.findMany({
            where: {
              businessId: business.id,
              status: 'COMPLETED'
            },
            include: {
              service: {
                select: {
                  price: true
                }
              }
            }
          })

          const revenue = completedAppointments.reduce((total, appointment) => {
            return total + (appointment.service?.price || 0)
          }, 0)

          const avgRating = await prisma.review.aggregate({
            where: {
              businessId: business.id
            },
            _avg: {
              rating: true
            }
          })

          // Status mapping - isActive'i ACTIVE/INACTIVE'e çevir
          const status = business.isActive ? 'ACTIVE' : 'INACTIVE'

          return {
            id: business.id,
            name: business.name,
            category: business.category,
            email: business.email,
            phone: business.phone,
            address: business.address,
            province: business.province,
            district: business.district,
            status: status, // Converted from isActive
            createdAt: business.createdAt.toISOString(),
            totalAppointments: business._count.appointments,
            totalServices: business._count.services,
            totalStaff: business._count.staff,
            totalReviews: business._count.reviews,
            rating: Number(avgRating._avg.rating?.toFixed(1)) || 0,
            revenue: revenue,
            owner: business.owner
          }
        } catch (error) {
          console.error(`Error processing business ${business.id}:`, error)
          return {
            id: business.id,
            name: business.name,
            category: business.category,
            email: business.email,
            phone: business.phone,
            address: business.address,
            province: business.province,
            district: business.district,
            status: business.isActive ? 'ACTIVE' : 'INACTIVE',
            createdAt: business.createdAt.toISOString(),
            totalAppointments: business._count.appointments,
            totalServices: business._count.services,
            totalStaff: business._count.staff,
            totalReviews: business._count.reviews,
            rating: 0,
            revenue: 0,
            owner: business.owner
          }
        }
      })
    )

    console.log('Processed businesses with stats')

    return NextResponse.json({
      businesses: businessesWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin businesses error:', error)
    return NextResponse.json(
      { error: 'İşletmeler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH businesses API called')
    
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { businessId, status } = body

    console.log('Update request:', { businessId, status })

    if (!businessId || !status) {
      return NextResponse.json(
        { error: 'İşletme ID ve durum gerekli' },
        { status: 400 }
      )
    }

    const validStatuses = ['ACTIVE', 'INACTIVE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum. ACTIVE veya INACTIVE olmalı' },
        { status: 400 }
      )
    }

    // Status'u isActive field'ına çevir
    const isActive = status === 'ACTIVE'

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    })

    console.log('Business updated:', updatedBusiness)

    return NextResponse.json({
      message: 'İşletme durumu güncellendi',
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        status: updatedBusiness.isActive ? 'ACTIVE' : 'INACTIVE'
      }
    })

  } catch (error) {
    console.error('Update business status error:', error)
    return NextResponse.json(
      { error: 'İşletme durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE businesses API called')
    
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('id')

    console.log('Delete business ID:', businessId)

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // İşletmeyi ve ilgili tüm verileri sil
    await prisma.$transaction(async (tx) => {
      // Review'ları sil (appointment relation olduğu için önce bu)
      await tx.review.deleteMany({ where: { businessId } })
      
      // Appointment'ları sil
      await tx.appointment.deleteMany({ where: { businessId } })
      
      // Diğer ilgili verileri sil
      await tx.galleryItem.deleteMany({ where: { businessId } })
      await tx.service.deleteMany({ where: { businessId } })
      await tx.staff.deleteMany({ where: { businessId } })
      await tx.workingHour.deleteMany({ where: { businessId } })
      
      // Opsiyonel tabloları kontrol ederek sil
      try {
        await tx.websiteConfig.deleteMany({ where: { businessId } })
      } catch (e) {
        console.log('WebsiteConfig silme hatası (normal olabilir):', e)
      }
      
      try {
        await tx.businessSettings.deleteMany({ where: { businessId } })
      } catch (e) {
        console.log('BusinessSettings silme hatası (normal olabilir):', e)
      }
      
      try {
        await tx.projectRequest.deleteMany({ where: { businessId } })
      } catch (e) {
        console.log('ProjectRequest silme hatası (normal olabilir):', e)
      }
      
      try {
        await tx.consultationRequest.deleteMany({ where: { businessId } })
      } catch (e) {
        console.log('ConsultationRequest silme hatası (normal olabilir):', e)
      }
      
      // İşletmeyi sil
      await tx.business.delete({ where: { id: businessId } })
    })

    console.log('Business deleted successfully:', businessId)

    return NextResponse.json({
      message: 'İşletme başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete business error:', error)
    return NextResponse.json(
      { error: 'İşletme silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}