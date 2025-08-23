import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin appointments API called')
    
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
    const dateFilter = searchParams.get('dateFilter') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('Query params:', { search, status, dateFilter, page, limit })

    // Filtreleme koşulları
    const where: any = {}

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { business: { name: { contains: search } } },
        { service: { name: { contains: search } } }
      ]
    }

    if (status !== 'ALL') {
      where.status = status
    }

    // Tarih filtreleme
    if (dateFilter === 'TODAY') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      where.date = {
        gte: today,
        lt: tomorrow
      }
    } else if (dateFilter === 'WEEK') {
      const today = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)
      
      where.date = {
        gte: today,
        lte: weekFromNow
      }
    }

    console.log('Where conditions:', where)

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where })
    ])

    console.log(`Found ${appointments.length} appointments, total: ${totalCount}`)

    const formattedAppointments = appointments.map(appointment => {
      try {
        // Appointment date'i formatla
        const appointmentDate = appointment.date.toISOString().split('T')[0]
        const appointmentTime = appointment.date.toTimeString().split(' ')[0].substring(0, 5) // HH:MM format

        return {
          id: appointment.id,
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail || '',
          customerPhone: appointment.customerPhone,
          businessName: appointment.business?.name || '',
          businessId: appointment.businessId,
          serviceName: appointment.service?.name || '',
          staffName: appointment.staff?.name || 'Atanmamış',
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          duration: appointment.service?.duration || 30,
          price: Number(appointment.service?.price || 0),
          status: appointment.status,
          createdAt: appointment.createdAt.toISOString().split('T')[0],
          notes: appointment.notes
        }
      } catch (error) {
        console.error(`Error formatting appointment ${appointment.id}:`, error)
        return {
          id: appointment.id,
          customerName: appointment.customerName || 'İsimsiz Müşteri',
          customerEmail: appointment.customerEmail || '',
          customerPhone: appointment.customerPhone || '',
          businessName: appointment.business?.name || '',
          businessId: appointment.businessId,
          serviceName: appointment.service?.name || '',
          staffName: appointment.staff?.name || 'Atanmamış',
          appointmentDate: '2024-01-01',
          appointmentTime: '00:00',
          duration: 30,
          price: 0,
          status: appointment.status,
          createdAt: appointment.createdAt.toISOString().split('T')[0],
          notes: appointment.notes
        }
      }
    })

    console.log('Processed appointments with formatting')

    return NextResponse.json({
      appointments: formattedAppointments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin appointments error:', error)
    return NextResponse.json(
      { error: 'Randevular alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH appointments API called')
    
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
    const { appointmentId, status } = body

    console.log('Update request:', { appointmentId, status })

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Randevu ID ve durum gerekli' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      )
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      select: {
        id: true,
        status: true,
        customerName: true,
        business: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('Appointment updated:', updatedAppointment)

    return NextResponse.json({
      message: 'Randevu durumu güncellendi',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Update appointment status error:', error)
    return NextResponse.json(
      { error: 'Randevu durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE appointments API called')
    
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
    const appointmentId = searchParams.get('id')

    console.log('Delete appointment ID:', appointmentId)

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Randevu ID gerekli' },
        { status: 400 }
      )
    }

    // İlgili verileri kontrol ederek sil
    await prisma.$transaction(async (tx) => {
      // Review varsa sil (appointment ile bağlı)
      try {
        await tx.review.deleteMany({ where: { appointmentId } })
      } catch (e) {
        console.log('Review silme hatası (normal olabilir):', e)
      }
      
      // Video call varsa sil
      try {
        await tx.videoCall.deleteMany({ where: { appointmentId } })
      } catch (e) {
        console.log('VideoCall silme hatası (normal olabilir):', e)
      }
      
      // Randevuyu sil
      await tx.appointment.delete({ where: { id: appointmentId } })
    })

    console.log('Appointment deleted successfully:', appointmentId)

    return NextResponse.json({
      message: 'Randevu başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Randevu silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}