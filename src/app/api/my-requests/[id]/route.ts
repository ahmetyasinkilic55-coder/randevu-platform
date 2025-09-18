import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Talep durumunu güncelle (teklif kabul et)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { action, responseId } = body

    // Talebi getir
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        responses: {
          include: {
            business: true
          }
        }
      }
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Talep bulunamadı' },
        { status: 404 }
      )
    }

    if (action === 'accept_offer' && responseId) {
      // Teklifi kabul et
      await prisma.$transaction([
        // Kabul edilen teklifi güncelle
        prisma.serviceRequestResponse.update({
          where: { id: responseId },
          data: { 
            status: 'ACCEPTED',
            customerViewed: true
          }
        }),
        // Diğer teklifleri reddet
        prisma.serviceRequestResponse.updateMany({
          where: {
            serviceRequestId: resolvedParams.id,
            id: { not: responseId }
          },
          data: { status: 'REJECTED' }
        }),
        // Talep durumunu güncelle
        prisma.serviceRequest.update({
          where: { id: resolvedParams.id },
          data: { status: 'ACCEPTED' }
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Teklif kabul edildi!'
      })
    }

    if (action === 'mark_viewed') {
      // Tüm teklifleri görüldü olarak işaretle
      await prisma.serviceRequestResponse.updateMany({
        where: { serviceRequestId: resolvedParams.id },
        data: { customerViewed: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Teklifler görüldü olarak işaretlendi'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Geçersiz işlem' },
      { status: 400 }
    )

  } catch (error) {
    console.error('My request update error:', error)
    return NextResponse.json(
      { success: false, error: 'İşlem gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}
