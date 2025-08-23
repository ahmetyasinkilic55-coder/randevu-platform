import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessId = formData.get('businessId') as string
    const type = formData.get('type') as string // 'profile', 'cover', 'gallery'
    
    if (!file || !businessId || !type) {
      return NextResponse.json(
        { error: 'Dosya, işletme ID ve tip gerekli' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPG, PNG ve WebP formatları desteklenir' },
        { status: 400 }
      )
    }

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Dosya uzantısını al
    const fileExtension = file.name.split('.').pop() || 'jpg'
    
    // Benzersiz dosya adı oluştur
    const fileName = `${type}-${uuidv4()}.${fileExtension}`
    
    // Upload dizinini oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'businesses', businessId)
    await mkdir(uploadDir, { recursive: true })
    
    // Dosyayı kaydet
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // URL oluştur
    const fileUrl = `/uploads/businesses/${businessId}/${fileName}`

    // Tip'e göre veritabanını güncelle
    if (type === 'profile') {
      await prisma.business.update({
        where: { id: businessId },
        data: { profilePhotoUrl: fileUrl }
      })
    } else if (type === 'cover') {
      await prisma.business.update({
        where: { id: businessId },
        data: { coverPhotoUrl: fileUrl }
      })
    } else if (type === 'gallery') {
      // Galeri fotoğrafı ekle
      await prisma.galleryItem.create({
        data: {
          businessId,
          imageUrl: fileUrl,
          title: file.name,
          isActive: true,
          order: 0 // Default order, admin can change later
        }
      })
    }

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      url: fileUrl,
      fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Fotoğraf silme
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const type = searchParams.get('type') // 'profile', 'cover'
    const galleryId = searchParams.get('galleryId') // For gallery photos

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // İşletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    if (type === 'profile') {
      await prisma.business.update({
        where: { id: businessId },
        data: { profilePhotoUrl: null }
      })
    } else if (type === 'cover') {
      await prisma.business.update({
        where: { id: businessId },
        data: { coverPhotoUrl: null }
      })
    } else if (type === 'gallery' && galleryId) {
      await prisma.galleryItem.update({
        where: { id: galleryId },
        data: { isActive: false }
      })
    }

    return NextResponse.json({
      message: 'Fotoğraf başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Fotoğraf silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}