import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Blog yazısının view sayısını 1 artır
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        id: true,
        views: true
      }
    })
    
    return NextResponse.json(
      { message: 'Görüntülenme sayısı güncellendi', views: updatedPost.views },
      { status: 200 }
    )
  } catch (error) {
    console.error('View increment error:', error)
    // Hata olsa bile sayfa yüklensin diye 200 döndür
    return NextResponse.json(
      { message: 'Görüntülenme sayısı güncellenemedi' },
      { status: 200 }
    )
  }
}
