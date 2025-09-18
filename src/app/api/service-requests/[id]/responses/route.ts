import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Servis talebi cevaplarını listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const responses = await prisma.serviceRequestResponse.findMany({
      where: {
        serviceRequestId: resolvedParams.id
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            province: true,
            district: true,
            address: true,
            profilePhotoUrl: true,
            isPremium: true
          }
        },
        serviceRequest: {
          select: {
            id: true,
            customerName: true,
            serviceName: true,
            status: true
          }
        }
      },
      orderBy: [
        { business: { isPremium: 'desc' } }, // Premium işletmeler önce
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      responses
    })

  } catch (error) {
    console.error('Service request responses GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Cevaplar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Servis talebine cevap ver (İşletme tarafından)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      businessId,
      message,
      proposedPrice,
      proposedDate,
      proposedTime,
      availability
    } = body

    // İşletme yetki kontrolü
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Bu işletme için yetkiniz yok' },
        { status: 403 }
      )
    }

    // Servis talebi kontrolü
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Servis talebi bulunamadı' },
        { status: 404 }
      )
    }

    if (serviceRequest.status !== 'ACTIVE' && serviceRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Bu talep artık aktif değil' },
        { status: 400 }
      )
    }

    if (new Date() > serviceRequest.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Bu talebin süresi dolmuş' },
        { status: 400 }
      )
    }

    // Daha önce cevap verilmiş mi kontrol et
    const existingResponse = await prisma.serviceRequestResponse.findUnique({
      where: {
        serviceRequestId_businessId: {
          serviceRequestId: resolvedParams.id,
          businessId: businessId
        }
      }
    })

    if (existingResponse) {
      return NextResponse.json(
        { success: false, error: 'Bu talebe daha önce cevap vermişsiniz' },
        { status: 400 }
      )
    }

    // Validasyonlar
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj gerekli' },
        { status: 400 }
      )
    }

    // Cevap oluştur
    const response = await prisma.serviceRequestResponse.create({
      data: {
        serviceRequestId: resolvedParams.id,
        businessId,
        message,
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        proposedTime: proposedTime || null,
        availability: availability || null,
        status: 'PENDING'
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            profilePhotoUrl: true
          }
        }
      }
    })

    // Servis talebinin durumunu güncelle
    await prisma.serviceRequest.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'RESPONDED'
      }
    })

    // TODO: Müşteriye bildirim gönder

    return NextResponse.json({
      success: true,
      message: 'Cevabınız başarıyla gönderildi',
      response
    })

  } catch (error) {
    console.error('Service request response POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Cevap gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}
