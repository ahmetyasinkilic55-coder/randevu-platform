import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessSlug = searchParams.get('businessSlug')
    const postSlug = searchParams.get('postSlug')
    
    if (!businessSlug || !postSlug) {
      return NextResponse.json(
        { error: 'Business slug ve post slug gerekli' },
        { status: 400 }
      )
    }

    // İşletmeyi bul
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Blog yazısını bul
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: postSlug,
        OR: [
          { businessId: business.id }, // İşletmeye özel blog
          { businessId: null }        // Genel blog yazıları
        ]
      },
      include: {
        authorUser: {
          select: {
            name: true,
            email: true
          }
        },
        business: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(post, { status: 200 })
  } catch (error) {
    console.error('Blog post by slug fetch error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
