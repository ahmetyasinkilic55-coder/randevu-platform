import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateGallerySchema = z.object({
  photoId: z.string(),
  businessId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
})

const createGallerySchema = z.object({
  businessId: z.string(),
  publicId: z.string(),
  imageUrl: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  isActive: z.boolean()
})

// POST - Yeni galeri fotoğrafı ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createGallerySchema.parse(body)

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Yeni galeri fotoğrafı oluştur
    const newPhoto = await prisma.galleryItem.create({
      data: {
        businessId: validatedData.businessId,
        publicId: validatedData.publicId,
        imageUrl: validatedData.imageUrl,
        title: validatedData.title || '',
        description: validatedData.description || '',
        order: validatedData.order,
        isActive: validatedData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Fotoğraf başarıyla eklendi',
      photo: newPhoto
    })

  } catch (error) {
    console.error('Gallery create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Fotoğraf eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Galeri fotoğrafını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateGallerySchema.parse(body)

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Galeri fotoğrafını güncelle
    const updatedPhoto = await prisma.galleryItem.update({
      where: { id: validatedData.photoId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        isActive: validatedData.isActive,
        order: validatedData.order,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Fotoğraf başarıyla güncellendi',
      photo: updatedPhoto
    })

  } catch (error) {
    console.error('Gallery update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Fotoğraf güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}