import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🚀 Dashboard Stats API Called!')
  
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Dashboard Stats API - Session:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    console.log('Dashboard Stats API - Params:', { businessId, date, userId: session.user.id })

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    console.log('Dashboard Stats API - Business found:', !!business)

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Tarih aralığını hesapla (belirtilen günün başı ve sonu)
    const startDate = new Date(`${date}T00:00:00.000Z`)
    const endDate = new Date(`${date}T23:59:59.999Z`)

    // Bugünkü randevuları al
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId,
        date: {
          gte: startDate,
          lte: endDate
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

    // İstatistikleri hesapla
    const totalAppointments = appointments.length
    
    // Toplam geliri hesapla (sadece tamamlanan randevular)
    const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
    const totalRevenue = completedAppointments.reduce((sum, apt) => {
      return sum + (apt.service?.price || 0)
    }, 0)

    // Durum bazında randevu sayıları
    const appointmentsByStatus = {
      PENDING: appointments.filter(apt => apt.status === 'PENDING').length,
      CONFIRMED: appointments.filter(apt => apt.status === 'CONFIRMED').length,
      COMPLETED: appointments.filter(apt => apt.status === 'COMPLETED').length,
      CANCELLED: appointments.filter(apt => apt.status === 'CANCELLED').length,
    }

    // Saatlik dağılım
    const hourlyDistribution = appointments.reduce((acc: any, apt) => {
      const hour = new Date(apt.date).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    console.log('✅ Stats API - Returning data:', {
      totalAppointments,
      revenue: totalRevenue,
      completedAppointments: completedAppointments.length
    })

    return NextResponse.json({
      date,
      totalAppointments,
      revenue: totalRevenue,
      appointments: totalAppointments,
      appointmentsByStatus,
      hourlyDistribution,
      completedAppointments: completedAppointments.length
    })

  } catch (error) {
    console.error('❌ Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
