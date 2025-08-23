import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceUpdateSchema = z.object({
  name: z.string().min(2, 'Hizmet adı en az 2 karakter olmalı').optional(),
  price: z.number().min(0, 'Fiyat 0\'dan büyük olmalı').optional(),
  duration: z.number().min(5, 'Süre en az 5 dakika olmalı').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategori seçmelisiniz').optional(),
  active: z.boolean().optional()
})

// PUT - Hizmeti güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const serviceId = id
    const body = await request.json()
    const validatedData = serviceUpdateSchema.parse(body)

    // Hizmetin var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId
      },
      include: {
        business: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      )
    }

    if (service.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu hizmeti güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Hizmeti güncelle
    const updatedService = await prisma.service.update({
      where: {
        id: serviceId
      },
      data: {
        ...validatedData,
        // API'deki 'active' field'ini 'isActive' olarak map et
        ...(validatedData.active !== undefined && { isActive: validatedData.active })
      }
    })

    return NextResponse.json(
      { 
        message: 'Hizmet başarıyla güncellendi',
        service: updatedService
      }
    )

  } catch (error) {
    console.error('Update service error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Hizmet güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Hizmeti sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const serviceId = id

    // Hizmetin var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId
      },
      include: {
        business: true,
        _count: {
          select: {
            appointments: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      )
    }

    if (service.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu hizmeti silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Eğer hizmetin aktif randevuları varsa silinmesini engelle
    if (service._count.appointments > 0) {
      return NextResponse.json(
        { error: 'Bu hizmetin aktif randevuları bulunduğu için silinemez. Önce hizmeti pasif yapabilirsiniz.' },
        { status: 400 }
      )
    }

    // Hizmeti sil
    await prisma.service.delete({
      where: {
        id: serviceId
      }
    })

    return NextResponse.json(
      { message: 'Hizmet başarıyla silindi' }
    )

  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Hizmet silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
