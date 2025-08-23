import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Müsait saatleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date') // YYYY-MM-DD format
    const serviceId = searchParams.get('serviceId')
    const staffId = searchParams.get('staffId')

    if (!businessId || !date || !serviceId) {
      return NextResponse.json(
        { error: 'İşletme ID, tarih ve hizmet ID gerekli' },
        { status: 400 }
      )
    }

    // Hizmeti bul
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        isActive: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      )
    }

    // YYYY-MM-DD formatındaki tarihi doğru parse et
    const [requestYear, requestMonth, requestDay] = date.split('-').map(Number)
    const requestDate = new Date(requestYear, requestMonth - 1, requestDay)
    const dayOfWeek = requestDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // İş yerinin çalışma saatlerini ve randevu ayarlarını al
    const business = await prisma.business.findFirst({
      where: { id: businessId },
      include: {
        workingHours: {
          where: {
            dayOfWeek,
            isOpen: true
          }
        }
      }
    })

    if (!business || !business.workingHours.length) {
      return NextResponse.json({
        slots: []
      })
    }

    const workingHour = business.workingHours[0]
    
    // Randevu ayarlarını parse et
    let appointmentSettings = {
      slotDuration: 60,
      bufferTime: 15,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      allowSameDayBooking: true,
      maxDailyAppointments: 0,
      autoConfirmation: true
    }
    
    if (business.appointmentSettings) {
      try {
        appointmentSettings = { ...appointmentSettings, ...JSON.parse(business.appointmentSettings) }
      } catch (error) {
        console.error('Error parsing appointment settings:', error)
      }
    }

    // Staff leaves kontrolü (eğer staffId varsa)
    let staffLeaves: any[] = []
    if (staffId) {
      const staff = await prisma.staff.findFirst({
        where: {
          id: staffId,
          businessId,
          isActive: true
        },
        include: {
          staffLeaves: {
            where: {
              status: 'APPROVED',
              startDate: { lte: requestDate },
              endDate: { gte: requestDate }
            }
          }
        }
      })
      
      if (staff && staff.staffLeaves) {
        staffLeaves = staff.staffLeaves
      }
    }

    // O gün için mevcut randevuları al
    const startOfDay = new Date(requestYear, requestMonth - 1, requestDay, 0, 0, 0)
    const endOfDay = new Date(requestYear, requestMonth - 1, requestDay, 23, 59, 59)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        staffId: staffId || undefined,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    // Çalışma saatleri içinde saat slotları oluştur
    const slots = []
    const openTime = workingHour.openTime // "09:00"
    const closeTime = workingHour.closeTime // "18:00"
    
    const [openHour, openMinute] = openTime.split(':').map(Number)
    const [closeHour, closeMinute] = closeTime.split(':').map(Number)
    
    let currentHour = openHour
    let currentMinute = openMinute
    
    // Randevu ayarlarından slot süresini al (dakika cinsinden)
    const slotInterval = appointmentSettings.slotDuration

    while (
      currentHour < closeHour || 
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // Bu saatte randevu var mı kontrol et
      const [slotHour, slotMinute] = timeString.split(':').map(Number)
      const slotStart = new Date(requestYear, requestMonth - 1, requestDay, slotHour, slotMinute, 0)
      const slotEnd = new Date(slotStart.getTime() + slotInterval * 60000)
      
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date)
        const appointmentEnd = new Date(appointmentStart.getTime() + service.duration * 60000)
        
        return (
          (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
        )
      })

      // Geçmiş saatleri engelle
      const now = new Date()
      const isInPast = slotStart <= now
      
      // Aynı gün randevu politikasını kontrol et
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const requestDateOnly = new Date(requestYear, requestMonth - 1, requestDay, 0, 0, 0)
      const isSameDay = today.getTime() === requestDateOnly.getTime()
      const sameDayNotAllowed = isSameDay && !appointmentSettings.allowSameDayBooking
      
      // Minimum önceden rezervasyon süresini kontrol et (saat cinsinden)
      const minAdvanceMs = appointmentSettings.minAdvanceBooking * 60 * 60 * 1000
      const tooSoon = (slotStart.getTime() - now.getTime()) < minAdvanceMs
      
      // Staff izin kontrolü
      const isStaffOnLeave = staffLeaves.some(leave => {
        if (leave.type === 'FULL_DAY' || leave.type === 'MULTI_DAY') {
          return true // Tam gün izinde
        }
        
        if (leave.type === 'PARTIAL' && leave.startTime && leave.endTime) {
          const [leaveStartHour, leaveStartMin] = leave.startTime.split(':').map(Number)
          const [leaveEndHour, leaveEndMin] = leave.endTime.split(':').map(Number)
          
          const leaveStartMinutes = leaveStartHour * 60 + leaveStartMin
          const leaveEndMinutes = leaveEndHour * 60 + leaveEndMin
          const slotMinutes = slotHour * 60 + slotMinute
          
          // Slot saati izin saatleri arasında mı?
          return slotMinutes >= leaveStartMinutes && slotMinutes < leaveEndMinutes
        }
        
        return false
      })

      slots.push({
        time: timeString,
        available: !isConflict && !isInPast && !sameDayNotAllowed && !tooSoon && !isStaffOnLeave
      })

      // Slot süresine göre artır (30 dk yerine ayarlanan süre)
      currentMinute += slotInterval
      while (currentMinute >= 60) {
        currentMinute -= 60
        currentHour++
      }
    }

    return NextResponse.json({
      slots
    })

  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Müsait saatler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
