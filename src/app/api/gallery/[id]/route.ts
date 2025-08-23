import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Galeri fotoğrafını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { id: photoId } = await params

    // Fotoğrafı ve sahiplik kontrolünü yap
    const photo = await prisma.galleryItem.findFirst({
      where: {
        id: photoId,
        business: {
          ownerId: session.user.id
        }
      },
      include: {
        business: true
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Fotoğraf bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Veritabanından sil
    await prisma.galleryItem.delete({
      where: { id: photoId }
    })

    return NextResponse.json({
      message: 'Fotoğraf başarıyla silindi'
    })

  } catch (error) {
    console.error('Gallery delete error:', error)
    
    return NextResponse.json(
      { error: 'Fotoğraf silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
