import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAppointmentSchema = z.object({
  customerName: z.string().min(2, 'Müşteri adı en az 2 karakter olmalı').optional(),
  customerPhone: z.string().min(10, 'Geçerli bir telefon numarası girin').optional(),
  customerEmail: z.string().email('Geçerli bir email adresi girin').optional().or(z.literal('')).or(z.null()),
  serviceId: z.string().min(1, 'Hizmet seçmelisiniz').optional(),
  staffId: z.string().optional().or(z.null()),
  date: z.string().datetime('Geçerli bir tarih girin').optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional().or(z.null()),
  businessId: z.string()
})

// GET - Tek bir randevuyu getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
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

    // Randevuyu getir
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        businessId: businessId
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            specialty: true,
            photoUrl: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })

  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Randevu alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Randevuyu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Randevunun var olduğunu ve işletmeye ait olduğunu kontrol et
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        businessId: validatedData.businessId
      }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    // Eğer hizmet değiştiriliyorsa, hizmetin var olduğunu kontrol et
    if (validatedData.serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: validatedData.serviceId,
          businessId: validatedData.businessId,
          isActive: true
        }
      })

      if (!service) {
        return NextResponse.json(
          { error: 'Seçilen hizmet bulunamadı veya aktif değil' },
          { status: 404 }
        )
      }
    }

    // Eğer personel değiştiriliyorsa, personelin var olduğunu kontrol et
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
          { error: 'Seçilen personel bulunamadı veya aktif değil' },
          { status: 404 }
        )
      }
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {}
    
    if (validatedData.customerName !== undefined) {
      updateData.customerName = validatedData.customerName
    }
    if (validatedData.customerPhone !== undefined) {
      updateData.customerPhone = validatedData.customerPhone
    }
    if (validatedData.customerEmail !== undefined) {
      updateData.customerEmail = validatedData.customerEmail || null
    }
    if (validatedData.serviceId !== undefined) {
      updateData.serviceId = validatedData.serviceId
    }
    if (validatedData.staffId !== undefined) {
      updateData.staffId = validatedData.staffId || null
    }
    if (validatedData.date !== undefined) {
      updateData.date = new Date(validatedData.date)
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null
    }

    // Randevuyu güncelle
    const appointment = await prisma.appointment.update({
      where: {
        id: id
      },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            specialty: true,
            photoUrl: true
          }
        },
        business: {
          select: {
            name: true
          }
        }
      }
    })

    // Eğer randevu durumu COMPLETED olarak değiştirildiyse, değerlendirme linki oluştur
    if (validatedData.status === 'COMPLETED' && existingAppointment.status !== 'COMPLETED') {
      // Telefon numarası kontrolü - eğer boşsa güncellenmemiş telefon numarasını kullan
      const customerPhone = appointment.customerPhone || existingAppointment.customerPhone
      
      if (customerPhone && customerPhone.trim() !== '') {
        // Değerlendirme linki
        const reviewUrl = `${process.env.NEXTAUTH_URL}/review?appointment=${appointment.id}&phone=${encodeURIComponent(customerPhone)}`
        
        console.log('Randevu tamamlandı - Değerlendirme linki:', reviewUrl)
        console.log('Müşteri:', appointment.customerName, '-', customerPhone)
        
        // Burada SMS/Email gönderme servisi entegre edilebilir
        // Örnek: SMS gönderme
        // await sendSMS(customerPhone, `Merhaba ${appointment.customerName}, ${appointment.business.name} işletmesinden aldığınız hizmeti değerlendirmek için: ${reviewUrl}`)
        
        // Örnek: Email gönderme
        // if (appointment.customerEmail) {
        //   await sendEmail(appointment.customerEmail, 'Hizmet Değerlendirmesi', `Değerlendirme için tıklayın: ${reviewUrl}`)
        // }
      } else {
        console.warn('Değerlendirme linki oluşturulamadı - Telefon numarası bulunamadı')
      }
    }

    return NextResponse.json(
      { 
        message: 'Randevu başarıyla güncellendi',
        appointment
      }
    )

  } catch (error) {
    console.error('Update appointment error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Randevu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Randevuyu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
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

    // Randevunun var olduğunu ve işletmeye ait olduğunu kontrol et
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        businessId: businessId
      }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    // Randevuyu sil
    await prisma.appointment.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json(
      { message: 'Randevu başarıyla silindi' }
    )

  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Randevu silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
