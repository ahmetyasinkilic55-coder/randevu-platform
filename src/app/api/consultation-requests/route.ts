import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      customerName,
      customerPhone,
      customerEmail,
      consultationTopic,
      preferredDateTime,
      meetingType,
      notes
    } = body

    // Validate required fields
    if (!businessId || !customerName || !customerPhone || !consultationTopic) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Check if business exists and service type is CONSULTATION or HYBRID
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { settings: true }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    const serviceType = business.settings?.serviceType || 'APPOINTMENT'
    if (serviceType !== 'CONSULTATION' && serviceType !== 'HYBRID') {
      return NextResponse.json(
        { error: 'Bu işletme danışmanlık hizmeti vermiyor' },
        { status: 400 }
      )
    }

    // Create consultation request
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        businessId,
        customerName,
        customerPhone,
        customerEmail,
        consultationTopic,
        preferredDateTime: preferredDateTime ? new Date(preferredDateTime) : null,
        meetingType: meetingType || 'FACE_TO_FACE',
        notes,
        status: 'PENDING'
      }
    })

    // TODO: Send notification to business owner
    // await sendNotification(business.ownerId, 'Yeni danışmanlık talebi alındı')

    return NextResponse.json({ 
      success: true, 
      consultationRequest,
      message: 'Danışmanlık talebiniz başarıyla gönderildi. İşletme sahibi en kısa sürede size dönüş yapacaktır.'
    })
    
  } catch (error) {
    console.error('Consultation request creation error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      )
    }

    const where: any = { businessId }
    if (status) {
      where.status = status
    }

    const consultationRequests = await prisma.consultationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, consultationRequests })
    
  } catch (error) {
    console.error('Consultation requests fetch error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}
