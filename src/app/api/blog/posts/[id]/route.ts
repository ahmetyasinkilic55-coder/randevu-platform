import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Belirli bir blog yazısını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.blogPost.findUnique({
      where: { id },
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
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Blog yazısını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const { id } = await params
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

    const businessId = user?.businesses[0]?.id
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Blog yazısının bu işletmeye ait olduğunu kontrol et
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id,
        businessId
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }
    
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: body,
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
    
    return NextResponse.json(updatedPost, { status: 200 })
  } catch (error: any) {
    console.error('Blog post update error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Blog yazısı güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Blog yazısını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const { id } = await params
    
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

    const businessId = user?.businesses[0]?.id
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Blog yazısının bu işletmeye ait olduğunu kontrol et
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id,
        businessId
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }
    
    const deletedPost = await prisma.blogPost.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Blog yazısı başarıyla silindi', post: deletedPost },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Blog post deletion error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Blog yazısı silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
