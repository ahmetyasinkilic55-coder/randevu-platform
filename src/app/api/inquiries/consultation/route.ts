import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      consultationTopic,
      consultationDescription,
      preferredDate,
      preferredTime,
      meetingType,
      duration,
      contactName,
      contactPhone,
      contactEmail,
      previousExperience,
      specificQuestions
    } = body

    // Map meetingType to enum value
    const mapMeetingType = (type: string) => {
      switch (type?.toLowerCase()) {
        case 'online': return 'ONLINE'
        case 'phone': return 'PHONE'
        case 'face_to_face': 
        case 'face-to-face':
        default: return 'FACE_TO_FACE'
      }
    }

    // Basic validation
    if (!businessId || !consultationTopic || !contactName || !contactPhone || !preferredDate) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik', message: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Create consultation request
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        businessId,
        consultationTopic,
        notes: consultationDescription || specificQuestions,
        preferredDateTime: new Date(`${preferredDate}T${preferredTime || '09:00'}`),
        meetingType: mapMeetingType(meetingType),
        customerName: contactName,
        customerPhone: contactPhone,
        customerEmail: contactEmail,
        status: 'PENDING'
      }
    })

    // Here you could also send notification email/SMS to business owner
    // await sendNotificationToBusiness(businessId, inquiry)

    return NextResponse.json({ 
      success: true, 
      request: {
        id: consultationRequest.id,
        consultationTopic: consultationRequest.consultationTopic,
        customerName: consultationRequest.customerName,
        preferredDateTime: consultationRequest.preferredDateTime,
        status: consultationRequest.status
      }
    })

  } catch (error) {
    console.error('Consultation inquiry creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Bir hata oluştu, lütfen tekrar deneyin' },
      { status: 500 }
    )
  }
}
