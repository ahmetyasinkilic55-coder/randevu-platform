import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin users API called')
    
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
    const role = searchParams.get('role') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('Query params:', { search, status, role, page, limit })

    // Filtreleme koşulları
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Role filtrelemesi
    if (role !== 'ALL') {
      where.role = role
    }

    console.log('Where conditions:', where)

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          businesses: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          _count: {
            select: {
              businesses: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    console.log(`Found ${users.length} users, total: ${totalCount}`)

    // Kullanıcılar için istatistik hesaplama
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          // Kullanıcının randevularını al (customer olarak)
          const userAppointments = await prisma.appointment.findMany({
            where: {
              customerEmail: user.email
            },
            include: {
              service: {
                select: {
                  price: true
                }
              }
            }
          })

          const totalAppointments = userAppointments.length
          const totalSpent = userAppointments
            .filter(apt => apt.status === 'COMPLETED')
            .reduce((total, appointment) => {
              return total + (appointment.service?.price || 0)
            }, 0)

          // Status belirleme - emailVerified'a göre
          const userStatus = user.emailVerified ? 'ACTIVE' : 'PENDING'

          return {
            id: user.id,
            name: user.name || 'İsimsiz Kullanıcı',
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            status: userStatus,
            createdAt: user.createdAt.toISOString(),
            lastLoginAt: null, // User modelinde lastLoginAt field'ı yok
            totalAppointments: totalAppointments,
            totalSpent: totalSpent,
            businessName: user.businesses[0]?.name || null,
            verified: user.emailVerified ? true : false
          }
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error)
          return {
            id: user.id,
            name: user.name || 'İsimsiz Kullanıcı',
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            status: user.emailVerified ? 'ACTIVE' : 'PENDING',
            createdAt: user.createdAt.toISOString(),
            lastLoginAt: null,
            totalAppointments: 0,
            totalSpent: 0,
            businessName: user.businesses[0]?.name || null,
            verified: user.emailVerified ? true : false
          }
        }
      })
    )

    console.log('Processed users with stats')

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH users API called')
    
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
    const { userId, action, value } = body

    console.log('Update request:', { userId, action, value })

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve eylem gerekli' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'suspend':
        // emailVerified''ı null yaparak suspend et
        updateData = { emailVerified: null }
        break
      case 'activate':
        updateData = { emailVerified: new Date() }
        break
      case 'verify':
        updateData = { emailVerified: new Date() }
        break
      case 'role':
        if (!value || !['CUSTOMER', 'BUSINESS_OWNER', 'ADMIN'].includes(value)) {
          return NextResponse.json(
            { error: 'Geçerli rol belirtilmeli' },
            { status: 400 }
          )
        }
        updateData = { role: value }
        break
      default:
        return NextResponse.json(
          { error: 'Geçersiz eylem' },
          { status: 400 }
        )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true
      }
    })

    console.log('User updated:', updatedUser)

    return NextResponse.json({
      message: 'Kullanıcı durumu güncellendi',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE users API called')
    
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
    const userId = searchParams.get('id')

    console.log('Delete user ID:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Admin kullanıcısını silmeyi engelle
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true }
    })

    if (userToDelete?.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin kullanıcısı silinemez' },
        { status: 400 }
      )
    }

    // Kullanıcıyı ve ilgili tüm verileri sil
    await prisma.$transaction(async (tx) => {
      // Kullanıcının işletmelerini ve ilgili verileri sil
      const userBusinesses = await tx.business.findMany({
        where: { ownerId: userId },
        select: { id: true }
      })

      for (const business of userBusinesses) {
        // Review'ları önce sil (foreign key constraint)
        await tx.review.deleteMany({ where: { businessId: business.id } })
        
        // Appointment'ları sil
        await tx.appointment.deleteMany({ where: { businessId: business.id } })
        
        // Diğer ilgili verileri sil
        await tx.galleryItem.deleteMany({ where: { businessId: business.id } })
        await tx.service.deleteMany({ where: { businessId: business.id } })
        await tx.staff.deleteMany({ where: { businessId: business.id } })
        await tx.workingHour.deleteMany({ where: { businessId: business.id } })
        
        // Opsiyonel tablolar
        try {
          await tx.websiteConfig.deleteMany({ where: { businessId: business.id } })
          await tx.businessSettings.deleteMany({ where: { businessId: business.id } })
          await tx.projectRequest.deleteMany({ where: { businessId: business.id } })
          await tx.consultationRequest.deleteMany({ where: { businessId: business.id } })
        } catch (e) {
          console.log('Opsiyonel tablo silme hatası (normal olabilir):', e)
        }
      }

      // İşletmeleri sil
      await tx.business.deleteMany({ where: { ownerId: userId } })

      // Kullanıcının randevularını sil (customer olarak)
      await tx.appointment.deleteMany({ where: { customerEmail: userToDelete?.email } })
      
      // Notification settings
      try {
        await tx.notificationSettings.deleteMany({ where: { userId } })
      } catch (e) {
        console.log('NotificationSettings silme hatası (normal olabilir):', e)
      }
      
      // Sessions ve accounts
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })
      
      // Kullanıcıyı sil
      await tx.user.delete({ where: { id: userId } })
    })

    console.log('User deleted successfully:', userId)

    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}