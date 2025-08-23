import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      businessResponse,
      estimatedPrice,
      status
    } = body

    // Validate required fields
    if (!businessResponse) {
      return NextResponse.json(
        { error: 'Yanıt mesajı gerekli' },
        { status: 400 }
      )
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        businesses: true
      }
    })

    if (!user || !user.businesses[0]) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]

    // Check if project request exists and belongs to this business
    const existingRequest = await prisma.projectRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Proje talebi bulunamadı' }, { status: 404 })
    }

    if (existingRequest.businessId !== business.id) {
      return NextResponse.json({ error: 'Bu proje talebi size ait değil' }, { status: 403 })
    }

    // Update project request
    const updatedRequest = await prisma.projectRequest.update({
      where: { id },
      data: {
        businessResponse,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        status: status || 'RESPONDED',
        responseDate: new Date()
      }
    })

    // TODO: Send notification to customer
    // await sendNotification(existingRequest.customerPhone, 'Proje talebinize yanıt verildi')

    return NextResponse.json({ 
      success: true, 
      projectRequest: updatedRequest,
      message: 'Yanıt başarıyla gönderildi'
    })
    
  } catch (error) {
    console.error('Project request update error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
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

    if (!projectRequest) {
      return NextResponse.json({ error: 'Proje talebi bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true, projectRequest })
    
  } catch (error) {
    console.error('Project request fetch error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}
