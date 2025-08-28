import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
    const { id } = await params
    const body = await request.json()
    
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
    const { id } = await params
    
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
