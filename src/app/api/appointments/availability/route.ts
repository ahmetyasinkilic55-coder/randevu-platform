import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date') // YYYY-MM-DD format
    const staffId = searchParams.get('staffId')

    if (!businessId || !date) {
      return NextResponse.json(
        { error: 'BusinessId ve date parametreleri gerekli' },
        { status: 400 }
      )
    }

    // Seçilen tarihteki mevcut randevuları al
    const startDate = new Date(`${date}T00:00:00`)
    const endDate = new Date(`${date}T23:59:59`)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        staffId: staffId || undefined, // Eğer staffId boşsa tüm personeller
        date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED'] // İptal edilmiş randevuları hariç tut
        }
      },
      select: {
        date: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    })

    // Dolu saatleri hesapla
    const bookedSlots: string[] = []

    existingAppointments.forEach(appointment => {
      const appointmentTime = appointment.date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      bookedSlots.push(appointmentTime)
      
      // Hizmet süresince tüm slot'ları dolu olarak işaretle
      const duration = appointment.service?.duration || 30
      const appointmentStart = appointment.date
      
      // 30dk aralıklarla hizmet süresini doldur
      for (let i = 30; i < duration; i += 30) {
        const nextSlot = new Date(appointmentStart.getTime() + i * 60000)
        const nextSlotTime = nextSlot.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        bookedSlots.push(nextSlotTime)
      }
    })

    // Duplicate'leri kaldır
    const uniqueBookedSlots = [...new Set(bookedSlots)]

    return NextResponse.json({
      bookedSlots: uniqueBookedSlots,
      totalAppointments: existingAppointments.length
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Müsaitlik kontrolü yapılırken hata oluştu' },
      { status: 500 }
    )
  }
}