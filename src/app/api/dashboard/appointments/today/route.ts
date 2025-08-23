import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🚀 Appointments Today API Called!')
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Business ID'yi query parameter'dan al (dashboard tarafından gönderilecek)
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    
    if (!businessId) {
      // Eğer businessId yoksa, user'ın ilk business'ını kullan
      const businesses = await prisma.business.findMany({
        where: { ownerId: session.user.id },
        select: { id: true }
      })
      
      if (businesses.length === 0) {
        return NextResponse.json({ error: 'No business found' }, { status: 404 })
      }
      
      const userBusinessId = businesses[0].id
      console.log('Using first business ID:', userBusinessId)
    } else {
      console.log('Using provided business ID:', businessId)
    }

    const finalBusinessId = businessId || (await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true }
    }))?.id

    // Bugünün tarih aralığını al
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Bugünkü randevuları getir
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: finalBusinessId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        },
        staff: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Response formatını düzenle
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      time: appointment.date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      clientName: appointment.customerName || 'Bilinmeyen Müşteri',
      clientEmail: appointment.customerEmail,
      serviceName: appointment.service?.name || 'Hizmet Belirtilmemiş',
      staffName: appointment.staff?.name,
      status: appointment.status,
      duration: appointment.service?.duration,
      price: appointment.service?.price
    }))

    return NextResponse.json({
      success: true,
      data: formattedAppointments,
      count: formattedAppointments.length
    })

  } catch (error) {
    console.error('Dashboard today appointments API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' }, 
      { status: 500 }
    )
  }
}
