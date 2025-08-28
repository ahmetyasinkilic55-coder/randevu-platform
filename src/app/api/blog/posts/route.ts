import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
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
    
    return NextResponse.json(posts, { status: 200 })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Kullanıcının işletmesini bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        businesses: {
          select: { id: true },
          take: 1
        }
      }
    })

    const businessId = user?.businesses[0]?.id || null
    
    const newPost = await prisma.blogPost.create({
      data: {
        ...body,
        businessId, // İşletme ilişkisini ekle
        views: 0
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
    
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Blog post creation error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
