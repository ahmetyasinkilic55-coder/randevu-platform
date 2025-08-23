import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        businesses: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!user || !user.businesses[0]) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    let settings = business.settings

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          businessId: business.id,
          serviceType: 'APPOINTMENT',
          buttonText: 'Randevu Al',
          consultationFee: 0.0,
          isConsultationFree: true,
          minimumProjectAmount: 0.0,
          workingRadius: null,
          supportedMeetingTypes: null
        }
      })
    }

    return NextResponse.json({ success: true, settings })
    
  } catch (error) {
    console.error('Business settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      serviceType,
      buttonText,
      consultationFee,
      isConsultationFree,
      minimumProjectAmount,
      workingRadius,
      supportedMeetingTypes
    } = body

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        businesses: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!user || !user.businesses[0]) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]

    // Set button text based on service type
    let defaultButtonText = buttonText
    if (!defaultButtonText) {
      switch (serviceType) {
        case 'APPOINTMENT':
          defaultButtonText = 'Randevu Al'
          break
        case 'PROJECT':
          defaultButtonText = 'Keşif Talep Et'
          break
        case 'CONSULTATION':
          defaultButtonText = 'Ön Görüşme Al'
          break
        case 'HYBRID':
          defaultButtonText = 'İletişime Geç'
          break
        default:
          defaultButtonText = 'Randevu Al'
      }
    }

    // Update or create business settings
    const settings = await prisma.businessSettings.upsert({
      where: { businessId: business.id },
      update: {
        serviceType: serviceType || 'APPOINTMENT',
        buttonText: defaultButtonText,
        consultationFee: consultationFee || 0.0,
        isConsultationFree: isConsultationFree !== undefined ? isConsultationFree : true,
        minimumProjectAmount: minimumProjectAmount || 0.0,
        workingRadius: workingRadius ? JSON.stringify(workingRadius) : null,
        supportedMeetingTypes: supportedMeetingTypes ? JSON.stringify(supportedMeetingTypes) : null
      },
      create: {
        businessId: business.id,
        serviceType: serviceType || 'APPOINTMENT',
        buttonText: defaultButtonText,
        consultationFee: consultationFee || 0.0,
        isConsultationFree: isConsultationFree !== undefined ? isConsultationFree : true,
        minimumProjectAmount: minimumProjectAmount || 0.0,
        workingRadius: workingRadius ? JSON.stringify(workingRadius) : null,
        supportedMeetingTypes: supportedMeetingTypes ? JSON.stringify(supportedMeetingTypes) : null
      }
    })

    return NextResponse.json({ success: true, settings })
    
  } catch (error) {
    console.error('Business settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
