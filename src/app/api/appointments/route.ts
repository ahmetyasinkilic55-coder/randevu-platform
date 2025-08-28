import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Randevu oluşturma schema
const createAppointmentSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  staffId: z.string().optional(),
  appointmentDate: z.string(), // YYYY-MM-DD
  appointmentTime: z.string(), // HH:mm
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
  duration: z.number().optional(),
  // Guest user'lar ve dashboard'dan oluşturulan randevular için
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional()
})

// GET - Randevuları listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    // Eğer businessId varsa, işletme randevularını getir (dashboard için)
    if (businessId) {
      // İşletmenin sahibi olduğunu kontrol et
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: session.user.id
        }
      })

      if (!business) {
        return NextResponse.json(
          { error: 'İşletme bulunamadı veya yetkiniz yok' },
          { status: 404 }
        )
      }

      // İşletme randevuları
      const appointments = await prisma.appointment.findMany({
        where: {
          businessId
        },
        include: {
          service: true,
          staff: true
        },
        orderBy: {
          date: 'desc'
        }
      })

      return NextResponse.json({
        appointments
      })
    } else {
      // Kullanıcının kendi randevuları (customer randevuları)
      const appointments = await prisma.appointment.findMany({
        where: {
          customerEmail: session.user.email
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
          },
          business: {
            select: {
              name: true,
              slug: true,
              phone: true,
              address: true,
              profilePhotoUrl: true,
              category: true
            }
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      // Appointment data'yı istenen formata çevir
      const formattedAppointments = appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.date.toISOString().split('T')[0], // YYYY-MM-DD format
        time: appointment.date.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        status: appointment.status,
        business: appointment.business,
        service: appointment.service,
        staff: appointment.staff,
        notes: appointment.notes,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        review: appointment.review,
        createdAt: appointment.createdAt.toISOString()
      }))

      return NextResponse.json({
        appointments: formattedAppointments
      })
    }

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Randevular alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Randevu oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Guest user için gerekli alanları kontrol et
    if (!session?.user) {
      // Giriş yapmamış kullanıcılar için isim ve telefon zorunlu
      if (!body.customerName || !body.customerPhone) {
        return NextResponse.json(
          { error: 'Ad soyad ve telefon numarası gerekli' },
          { status: 400 }
        )
      }
    }
    
    const validatedData = createAppointmentSchema.parse(body)

    // Seçilen hizmeti kontrol et
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        businessId: validatedData.businessId,
        isActive: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      )
    }

    // Eğer personel seçildiyse kontrol et
    if (validatedData.staffId) {
      const staff = await prisma.staff.findFirst({
        where: {
          id: validatedData.staffId,
          businessId: validatedData.businessId,
          isActive: true
        }
      })

      if (!staff) {
        return NextResponse.json(
          { error: 'Personel bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Randevu tarih/saatinin müsait olup olmadığını kontrol et
    const appointmentDate = new Date(`${validatedData.appointmentDate}T${validatedData.appointmentTime}:00`)
    const appointmentEnd = new Date(appointmentDate.getTime() + service.duration * 60000)

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        businessId: validatedData.businessId,
        staffId: validatedData.staffId || undefined,
        date: {
          gte: appointmentDate,
          lt: appointmentEnd
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Seçilen saat müsait değil' },
        { status: 409 }
      )
    }

    // Randevuyu oluştur
    const appointment = await prisma.appointment.create({
      data: {
        businessId: validatedData.businessId,
        serviceId: validatedData.serviceId,
        staffId: validatedData.staffId,
        date: appointmentDate,
        customerName: validatedData.customerName || session?.user?.name || 'Müşteri',
        customerPhone: validatedData.customerPhone || session?.user?.phone || '',
        customerEmail: validatedData.customerEmail || session?.user?.email || '',
        notes: validatedData.notes,
        status: 'PENDING'
      },
      include: {
        service: true,
        staff: true,
        business: true
      }
    })

    return NextResponse.json({
      message: 'Randevu başarıyla oluşturuldu',
      appointmentId: appointment.id,
      appointment
    }, { status: 201 })

  } catch (error) {
    console.error('Create appointment error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Randevu oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
