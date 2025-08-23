import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      },
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    let appointmentSettings = {
      slotDuration: 60,
      bufferTime: 15,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      allowSameDayBooking: true,
      maxDailyAppointments: 0,
      autoConfirmation: true
    }

    // Parse appointment settings from business data if exists
    if (business.appointmentSettings) {
      try {
        appointmentSettings = JSON.parse(business.appointmentSettings)
      } catch (error) {
        console.error('Error parsing appointment settings:', error)
      }
    }

    return NextResponse.json({
      workingHours: business.workingHours,
      appointmentSettings
    })
  } catch (error) {
    console.error('Error fetching working hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workingHours, appointmentSettings } = await request.json()
    console.log('Received working hours data:', JSON.stringify(workingHours, null, 2))

    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Mevcut çalışma saatlerini sil
    await prisma.workingHour.deleteMany({
      where: {
        businessId: business.id
      }
    })

    // Yeni çalışma saatlerini ekle - sadece geçerli olan verileri
    const validWorkingHours = workingHours.filter((hour: any) => 
      typeof hour.dayOfWeek === 'number' && 
      hour.dayOfWeek >= 0 && hour.dayOfWeek <= 6 &&
      typeof hour.isOpen === 'boolean' &&
      typeof hour.openTime === 'string' &&
      typeof hour.closeTime === 'string'
    )

    console.log('Valid working hours:', JSON.stringify(validWorkingHours, null, 2))

    const createData = validWorkingHours.map((hour: any) => ({
      businessId: business.id,
      dayOfWeek: hour.dayOfWeek,
      isOpen: hour.isOpen,
      openTime: hour.openTime,
      closeTime: hour.closeTime
    }))

    if (createData.length > 0) {
      await prisma.workingHour.createMany({
        data: createData
      })
    }

    const updatedWorkingHours = await prisma.workingHour.findMany({
      where: {
        businessId: business.id
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    })

    console.log('Saved working hours:', JSON.stringify(updatedWorkingHours, null, 2))

    // Save appointment settings if provided
    if (appointmentSettings) {
      await prisma.business.update({
        where: { id: business.id },
        data: {
          appointmentSettings: JSON.stringify(appointmentSettings)
        }
      })
      console.log('Saved appointment settings:', appointmentSettings)
    }

    return NextResponse.json({
      message: 'Working hours and appointment settings updated successfully',
      workingHours: updatedWorkingHours
    })
  } catch (error) {
    console.error('Error updating working hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
