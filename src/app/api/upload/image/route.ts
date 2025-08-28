import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }
    
    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. Lütfen JPG, PNG, GIF veya WebP formatında bir görsel yükleyin.' },
        { status: 400 }
      )
    }
    
    // Dosya boyutu kontrolü (10MB - Cloudinary için daha yüksek limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.' },
        { status: 400 }
      )
    }
    
    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Base64'e çevir
    const base64String = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64String}`
    
    // Cloudinary'ye yükle
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'randevu-platform/blog', // Blog görselleri için klasör
      resource_type: 'image',
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }
      ],
      // Dosya ismi için timestamp ekle
      public_id: `blog_${Date.now()}_${Math.random().toString(36).substring(7)}`
    })
    
    return NextResponse.json(
      { 
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
        width: uploadResponse.width,
        height: uploadResponse.height,
        format: uploadResponse.format,
        size: file.size,
        original_filename: file.name
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: 'Görsel yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
