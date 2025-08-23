import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Website yayınlama/durdurmma
export async function PATCH(
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

    const body = await request.json()
    const { action } = body // 'publish' or 'unpublish'

    // Website config'i bul ve yetki kontrol et
    const websiteConfig = await prisma.websiteConfig.findFirst({
      where: { 
        id,
        business: {
          ownerId: session.user.id
        }
      },
      include: {
        business: true
      }
    })

    if (!websiteConfig) {
      return NextResponse.json(
        { error: 'Website bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Website'i yayınla/durdur
    const updatedConfig = await prisma.websiteConfig.update({
      where: { id },
      data: {
        isPublished: action === 'publish',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: action === 'publish' ? 'Website yayınlandı' : 'Website yayından kaldırıldı',
      websiteConfig: updatedConfig,
      url: `mocksite.com/${updatedConfig.urlSlug}`,
      isPublished: updatedConfig.isPublished
    })

  } catch (error) {
    console.error('Update website status error:', error)
    return NextResponse.json(
      { error: 'Website durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Website silme
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

    // Website config'i bul ve yetki kontrol et
    const websiteConfig = await prisma.websiteConfig.findFirst({
      where: { 
        id,
        business: {
          ownerId: session.user.id
        }
      }
    })

    if (!websiteConfig) {
      return NextResponse.json(
        { error: 'Website bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Website config'i sil
    await prisma.websiteConfig.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Website başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete website error:', error)
    return NextResponse.json(
      { error: 'Website silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}