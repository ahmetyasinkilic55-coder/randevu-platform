import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Get all inquiries for the business
    const [consultationRequests, projectRequests] = await Promise.all([
      prisma.consultationRequest.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.projectRequest.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Transform inquiries to a unified format for calendar display
    const unifiedInquiries = [
      ...consultationRequests.map(request => ({
        id: request.id,
        type: 'consultation' as const,
        title: request.consultationTopic,
        description: request.notes || '',
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        date: request.preferredDateTime,
        status: request.status,
        meetingType: request.meetingType,
        businessResponse: request.businessResponse,
        proposedDateTime: request.proposedDateTime,
        createdAt: request.createdAt
      })),
      ...projectRequests.map(request => ({
        id: request.id,
        type: 'project' as const,
        title: 'Proje Talebi',
        description: request.projectDescription,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        budget: request.estimatedBudget,
        location: request.location,
        status: request.status,
        businessResponse: request.businessResponse,
        estimatedPrice: request.estimatedPrice,
        preferredDate: request.preferredDate,
        createdAt: request.createdAt
      }))
    ]

    return NextResponse.json({ 
      success: true, 
      inquiries: unifiedInquiries
    })

  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update inquiry status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { inquiryId, type, status, businessId, businessResponse } = body

    if (!inquiryId || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updatedInquiry
    const updateData: any = { status }
    
    // Add business response if provided
    if (businessResponse) {
      updateData.businessResponse = businessResponse
      updateData.responseDate = new Date()
    }

    switch (type) {
      case 'consultation':
        updatedInquiry = await prisma.consultationRequest.update({
          where: { id: inquiryId },
          data: updateData
        })
        break
      case 'project':
        updatedInquiry = await prisma.projectRequest.update({
          where: { id: inquiryId },
          data: updateData
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid inquiry type' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      inquiry: updatedInquiry
    })

  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
