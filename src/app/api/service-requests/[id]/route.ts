import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Tekil servis talebi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        responses: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Servis talebi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      serviceRequest
    })

  } catch (error) {
    console.error('Service request GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talebi yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Servis talebini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Servis talebi bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü - sadece talep sahibi veya admin güncelleyebilir
    if (session?.user?.id !== serviceRequest.userId && session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    const { status, ...updateData } = body

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: resolvedParams.id },
      data: {
        ...updateData,
        status,
        updatedAt: new Date()
      },
      include: {
        responses: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Servis talebi güncellendi',
      serviceRequest: updatedRequest
    })

  } catch (error) {
    console.error('Service request PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talebi güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Servis talebini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Servis talebi bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü - sadece talep sahibi veya admin silebilir
    if (session?.user?.id !== serviceRequest.userId && session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    await prisma.serviceRequest.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Servis talebi silindi'
    })

  } catch (error) {
    console.error('Service request DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Servis talebi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
