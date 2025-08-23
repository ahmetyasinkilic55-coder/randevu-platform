import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary konfigürasyonu - demo credentials
cloudinary.config({
  cloud_name: 'demo',
  api_key: '123456789012345',
  api_secret: 'demo_secret_key',
});

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

    // Dosya türü kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. Sadece JPG, PNG ve WebP kabul edilir.' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maximum 5MB olmalı.' },
        { status: 400 }
      )
    }

    // File'ı buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary'ye upload et
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `randevu-platform/businesses/${businessId}`,
          public_id: `${type}-${Date.now()}`,
          transformation: [
            { width: type === 'cover' ? 1200 : 400, height: type === 'cover' ? 400 : 400, crop: 'fill' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = uploadResponse as any
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Dosya başarıyla yüklendi'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}