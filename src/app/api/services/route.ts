import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(2, 'Hizmet adı en az 2 karakter olmalı'),
  price: z.number().min(0, 'Fiyat 0\'dan büyük olmalı'),
  duration: z.number().min(5, 'Süre en az 5 dakika olmalı'),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategori seçmelisiniz'),
  active: z.boolean().default(true),
  businessId: z.string()
})

// GET - İşletmenin tüm hizmetlerini getir
export async function GET(request: NextRequest) {
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

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
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

    // Hizmetleri getir
    const services = await prisma.service.findMany({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ services })

  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Hizmetler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni hizmet oluştur
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
    const validatedData = serviceSchema.parse(body)

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
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

    // Hizmeti oluştur
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        duration: validatedData.duration,
        description: validatedData.description || '',
        category: validatedData.category,
        isActive: validatedData.active,
        businessId: validatedData.businessId
      }
    })

    return NextResponse.json(
      { 
        message: 'Hizmet başarıyla oluşturuldu',
        service
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create service error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Hizmet oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
