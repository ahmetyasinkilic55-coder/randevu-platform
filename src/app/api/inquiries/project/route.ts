import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      projectTitle,
      projectDescription,
      budget,
      timeline,
      location,
      contactName,
      contactPhone,
      contactEmail,
      preferredContactMethod,
      urgency
    } = body

    // Basic validation
    if (!businessId || !projectTitle || !projectDescription || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik', message: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Create project request
    const projectRequest = await prisma.projectRequest.create({
      data: {
        businessId,
        projectDescription: `${projectTitle}\n\n${projectDescription}`,
        estimatedBudget: budget ? parseFloat(budget.split('-')[0]) || 0 : null,
        preferredDate: null,
        location,
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
        id: projectRequest.id,
        projectTitle: projectTitle,
        projectDescription: projectRequest.projectDescription,
        customerName: projectRequest.customerName,
        status: projectRequest.status
      }
    })

  } catch (error) {
    console.error('Project inquiry creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Bir hata oluştu, lütfen tekrar deneyin' },
      { status: 500 }
    )
  }
}
