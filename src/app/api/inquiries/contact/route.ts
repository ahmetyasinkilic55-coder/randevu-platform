import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      inquiryType,
      subject,
      message,
      contactName,
      contactPhone,
      contactEmail,
      preferredContactMethod,
      urgency
    } = body

    // Basic validation
    if (!businessId || !subject || !message || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik', message: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Create contact inquiry as consultation request
    const inquiry = await prisma.consultationRequest.create({
      data: {
        businessId,
        consultationTopic: subject,
        notes: `${inquiryType ? `[${inquiryType}] ` : ''}${message}`,
        customerName: contactName,
        customerPhone: contactPhone,
        customerEmail: contactEmail,
        meetingType: 'FACE_TO_FACE', // Default
        status: 'PENDING'
      }
    })

    // Here you could also send notification email/SMS to business owner
    // await sendNotificationToBusiness(businessId, inquiry)

    return NextResponse.json({ 
      success: true, 
      inquiry: {
        id: inquiry.id,
        subject: inquiry.consultationTopic,
        contactName: inquiry.customerName,
        status: inquiry.status
      }
    })

  } catch (error) {
    console.error('Contact inquiry creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Bir hata oluştu, lütfen tekrar deneyin' },
      { status: 500 }
    )
  }
}
