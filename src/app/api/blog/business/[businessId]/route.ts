import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { businessId } = await params
    
    // İşletmeye ait yayınlanmış blog yazılarını getir
    const posts = await prisma.blogPost.findMany({
      where: {
        businessId: businessId,
        isPublished: true
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        featuredImage: true, // coverImage yerine featuredImage
        createdAt: true,
        updatedAt: true,
        views: true,
        authorUser: {
          select: {
            name: true
          }
        }
      },
      take: 6 // Son 6 blog yazısı
    })
    
    return NextResponse.json(posts, { status: 200 })
  } catch (error) {
    console.error('Business blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
