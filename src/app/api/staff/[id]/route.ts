import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const staffUpdateSchema = z.object({
  name: z.string().min(2, 'Personel adı en az 2 karakter olmalı').optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir email adresi girin').optional().or(z.literal('')),
  specialty: z.string().optional(),
  experience: z.number().min(0, 'Deneyim 0\'dan küçük olamaz').optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional()
})

// PUT - Personeli güncelle
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

    const staffId = id
    const body = await request.json()
    const validatedData = staffUpdateSchema.parse(body)

    // Personelin var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId
      },
      include: {
        business: true
      }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Personel bulunamadı' },
        { status: 404 }
      )
    }

    if (staff.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu personeli güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Personeli güncelle
    const updatedStaff = await prisma.staff.update({
      where: {
        id: staffId
      },
      data: {
        ...validatedData,
        // Null değerler için güvenli atama
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        specialty: validatedData.specialty || null,
        experience: validatedData.experience || null,
        bio: validatedData.bio || null,
        photoUrl: validatedData.photoUrl || null
      }
    })

    return NextResponse.json(
      { 
        message: 'Personel başarıyla güncellendi',
        staff: updatedStaff
      }
    )

  } catch (error) {
    console.error('Update staff error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Personel güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Personeli sil
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

    const staffId = id

    // Personelin var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId
      },
      include: {
        business: true,
        _count: {
          select: {
            appointments: {
              where: {
                date: {
                  gte: new Date() // Gelecekteki randevular
                }
              }
            }
          }
        }
      }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Personel bulunamadı' },
        { status: 404 }
      )
    }

    if (staff.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu personeli silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Eğer personelin gelecekteki randevuları varsa silinmesini engelle
    if (staff._count.appointments > 0) {
      return NextResponse.json(
        { error: 'Bu personelin gelecekteki randevuları bulunduğu için silinemez. Önce personeli pasif yapabilirsiniz.' },
        { status: 400 }
      )
    }

    // Personeli sil
    await prisma.staff.delete({
      where: {
        id: staffId
      }
    })

    return NextResponse.json(
      { message: 'Personel başarıyla silindi' }
    )

  } catch (error) {
    console.error('Delete staff error:', error)
    return NextResponse.json(
      { error: 'Personel silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
