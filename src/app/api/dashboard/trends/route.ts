import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🚀 Trends API Called!')
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Business ID'yi query parameter'dan al
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    
    const finalBusinessId = businessId || (await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true }
    }))?.id
    
    if (!finalBusinessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 })
    }

    // Bugün ve dün için tarih aralıkları
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)

    // Bugün ve dün randevu sayıları
    const [todayAppointmentsCount, yesterdayAppointmentsCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfToday, lt: endOfToday }
        }
      }),
      prisma.appointment.count({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfYesterday, lt: endOfYesterday }
        }
      })
    ])

    // Bugün ve dün gelir hesaplama (service price üzerinden)
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        businessId: finalBusinessId,
        date: { gte: startOfToday, lt: endOfToday },
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
    
    const yesterdayAppointments = await prisma.appointment.findMany({
      where: {
        businessId: finalBusinessId,
        date: { gte: startOfYesterday, lt: endOfYesterday },
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
    
    const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0)
    const yesterdayRevenue = yesterdayAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0)

    // Bugün ve dün müşteri sayıları (customerEmail üzerinden unique)
    const [todayCustomers, yesterdayCustomers] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfToday, lt: endOfToday }
        },
        select: { customerEmail: true },
        distinct: ['customerEmail']
      }),
      prisma.appointment.findMany({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfYesterday, lt: endOfYesterday }
        },
        select: { customerEmail: true },
        distinct: ['customerEmail']
      })
    ])

    // Tamamlanma oranları
    const [todayCompleted, yesterdayCompleted] = await Promise.all([
      prisma.appointment.count({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfToday, lt: endOfToday },
          status: 'COMPLETED'
        }
      }),
      prisma.appointment.count({
        where: {
          businessId: finalBusinessId,
          date: { gte: startOfYesterday, lt: endOfYesterday },
          status: 'COMPLETED'
        }
      })
    ])

    // Trend hesaplamaları
    const appointmentsTrend = calculateTrend(todayAppointmentsCount, yesterdayAppointmentsCount)
    const revenueTrend = calculateTrend(
      todayRevenue, 
      yesterdayRevenue
    )
    const customersTrend = calculateTrend(todayCustomers.length, yesterdayCustomers.length)
    
    const todayCompletionRate = todayAppointmentsCount > 0 ? (todayCompleted / todayAppointmentsCount) * 100 : 0
    const yesterdayCompletionRate = yesterdayAppointmentsCount > 0 ? (yesterdayCompleted / yesterdayAppointmentsCount) * 100 : 0
    const completionTrend = calculateTrend(todayCompletionRate, yesterdayCompletionRate)

    return NextResponse.json({
      appointments: appointmentsTrend,
      revenue: revenueTrend,
      customers: customersTrend,
      completion: completionTrend
    })

  } catch (error) {
    console.error('Dashboard trends API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' }, 
      { status: 500 }
    )
  }
}

// Trend hesaplama fonksiyonu
function calculateTrend(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%'
  }
  
  const percentage = ((current - previous) / previous) * 100
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${Math.round(percentage)}%`
}
