import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin dashboard API called')
    
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

    // Dashboard istatistikleri
    const [
      totalBusinesses,
      totalUsers,
      totalAppointments,
      pendingApprovals,
      recentActivities
    ] = await Promise.all([
      // Toplam işletme sayısı
      prisma.business.count(),
      
      // Toplam kullanıcı sayısı
      prisma.user.count(),
      
      // Bu ay toplam randevu sayısı
      prisma.appointment.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Bekleyen onaylar (aktif olmayan işletmeler)
      prisma.business.count({
        where: {
          isActive: false
        }
      }),
      
      // Son aktiviteler - son kayıtlar
      Promise.all([
        prisma.business.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }),
        prisma.user.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }),
        prisma.appointment.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true
          }
        })
      ])
    ])

    // Gelir hesaplama - Appointment tablosunda price field'ı yok ise service'ten al
    let revenueThisMonth = 0
    try {
      // Önce appointment'ta price field'ı var mı kontrol et
      const appointmentsWithServices = await prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        include: {
          service: {
            select: {
              price: true
            }
          }
        }
      })

      revenueThisMonth = appointmentsWithServices.reduce((total, appointment) => {
        return total + (appointment.service?.price || 0)
      }, 0)
    } catch (error) {
      console.warn('Gelir hesaplama hatası:', error)
      revenueThisMonth = 0
    }

    // Son aktiviteleri formatla
    const [recentBusinesses, recentUsers, recentAppointments] = recentActivities
    const activities = [
      ...recentBusinesses.map(b => ({
        id: b.id,
        type: 'business_registered' as const,
        message: `Yeni işletme kaydı: ${b.name}`,
        timestamp: b.createdAt,
        status: 'success' as const
      })),
      ...recentUsers.map(u => ({
        id: u.id,
        type: 'user_joined' as const,
        message: `Yeni kullanıcı: ${u.email}`,
        timestamp: u.createdAt,
        status: 'info' as const
      })),
      ...recentAppointments.map(a => ({
        id: a.id,
        type: 'appointment_created' as const,
        message: 'Yeni randevu oluşturuldu',
        timestamp: a.createdAt,
        status: 'success' as const
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(activity => ({
      ...activity,
      timestamp: formatRelativeTime(activity.timestamp)
    }))

    return NextResponse.json({
      stats: {
        totalBusinesses,
        totalUsers,
        totalAppointments,
        pendingApprovals,
        revenueThisMonth,
        growthRate: 12.5 // Bu sabit bir değer, gerçek büyüme hesaplaması için geçmiş ay verisi gerekli
      },
      recentActivities: activities
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Dashboard verileri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Az önce'
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} saat önce`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} gün önce`
  
  return date.toLocaleDateString('tr-TR')
}